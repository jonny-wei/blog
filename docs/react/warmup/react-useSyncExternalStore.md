# V18 - useSyncExternalStore

订阅外部数据源

最新 React 18 中，用 useSyncExternalStore 代替了 useMutableSource 。具体内容可以参考 [useMutableSource → useSyncExternalStore](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Freactwg%2Freact-18%2Fdiscussions%2F86) 。

在 concurrent 模式下，render 可能会被执行多次，那么在读取外部数据源的会存在一个问题，比如一个 render 过程中读取了外部数据源状态 1，那么中途遇到更高优先级的任务，而中断了此次更新(挂起)，就在此时改变了外部数据源，然后又恢复了此次更新，那么接下来又读取了数据源，由于中途发生了改变，所以这次读取的是外部数据源状态 2，那么一次更新中出现了这种表现不一致的情况。这个问题叫做 tearing 。

[可在控制流中调用的 Hook - 实验性](https://mp.weixin.qq.com/s/DZVMvq_wwtjjCckci-tVaQ)

## useSyncExternalStore

useSyncExternalStore 能够让 React 组件在 concurrent 模式下安全地有效地读取外接数据源，在组件渲染过程中能够检测到变化，并且在数据源发生变化的时候，能够调度更新。当读取到外部状态发生了变化，会触发一个强制更新，来保证结果的一致性。

现在用 useSyncExternalStore 不在需要把订阅到更新流程交给组件处理。如下：

```js
function App(){
     const state = useSyncExternalStore(store.subscribe,store.getSnapshot)
     return <div>...</div>
}
```

如上是通过 useSyncExternalStore 实现的订阅更新，这样减少了 APP 内部组件代码，代码健壮性提升，一定程度上也降低了耦合，最重要的它解决了并发模式状态读取问题。但是这里强调的一点是， 正常的 React 开发者在开发过程中不需要使用这个 api ，这个 hooks 主要是对于 React 的一些状态管理库，比如 redux ，通过它的帮助可以合理管理外部的 store，保证数据读取的一致。

接下来看一下 useSyncExternalStore 使用：

```js
useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
)
```

- subscribe 为订阅函数，当数据改变的时候，会触发 subscribe，在 useSyncExternalStore 会通过带有记忆性的 getSnapshot 来判别数据是否发生变化，如果发生变化，那么会强制更新数据。
- getSnapshot 可以理解成一个带有记忆功能的选择器。当 store 变化的时候，会通过 getSnapshot 生成新的状态值，这个状态值可提供给组件作为数据源使用，getSnapshot 可以检查订阅的值是否改变，改变的话那么会触发更新。
- getServerSnapshot 用于 hydration 模式下的 getSnapshot。

## useSyncExternalStore 应用

用 useSyncExternalStore 配合 redux ，来简单实现订阅外部数据源功能。

```js
import { combineReducers , createStore  } from 'redux'

/* number Reducer */
function numberReducer(state=1,action){
    switch (action.type){
      case 'ADD':
        return state + 1
      case 'DEL':
        return state - 1
      default:
        return state
    }
}

/* 注册reducer */
const rootReducer = combineReducers({ number:numberReducer  })
/* 创建 store */
const store = createStore(rootReducer,{ number:1  })

function Index(){
    /* 订阅外部数据源 */
    const state = useSyncExternalStore(store.subscribe,() => store.getState().number)
    console.log(state)
    return <div>
        {state}
        <button onClick={() => store.dispatch({ type:'ADD' })} >点击</button>
    </div>
}
```

- 点击按钮，会触发 reducer ，然后会触发 store.subscribe 订阅函数，执行 getSnapshot 得到新的 number ，判断 number 是否发生变化，如果变化，触发更新。

有了 useSyncExternalStore 这个 hooks ，可以通过外部数据到内部数据的映射，当数据变化的时候，可以通知订阅函数 subscribe 去触发更新。

## useSyncExternalStore 原理

```js
// react-reconciler/src/ReactFiberHooks.new.js
function mountSyncExternalStore(subscribe,getSnapshot){
    /*  创建一个 hooks  */
    const hook = mountWorkInProgressHook();
    /* 产生快照 */
    let nextSnapshot = getSnapshot(); 

    /* 把快照记录下来 */
    hook.memoizedState = nextSnapshot;
    /* 快照记录在 inst 属性上 */
    const inst  = {
        value: nextSnapshot,
        getSnapshot,
    };
    hook.queue = inst;
    
    /* 用一个 effect 来订阅状态 ，subscribeToStore 发起订阅 */
    mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]);
    
    /* 用一个 useEffect 来监听组件 render ，只要组件渲染就会调用 updateStoreInstance  */
    pushEffect(
        HookHasEffect | HookPassive,
        updateStoreInstance.bind(null, fiber, inst, nextSnapshot, getSnapshot),
        undefined,
        null,
    );
    return nextSnapshot;
}
```

mountSyncExternalStore 大致流程是这样的：

- 第一步：创建一个 hooks 。我们都知道 hooks 更新是分两个阶段的，在初始化 hooks 阶段会创建一个 hooks ，在更新阶段会更新这个 Hook。
- 第二步：调用 getSnapshot 产生一个状态值，并保存起来。
- 第三步：用一个 effect 来订阅状态 `subscribeToStore` 发起订阅 。
- 第四步：用一个 useEffect 来监听组件 render ，只要组件渲染就会调用 `updateStoreInstance` 。这一步是关键所在，在 concurrent 模式下渲染会中断，那么如果中断恢复 render ，那么这个 effect 就解决了这个问题。当 render 就会触发 updateStoreInstance 。

接下来看一下 subscribeToStore 和 updateStoreInstance 的实现。

**subscribeToStore**

```js
// react-reconciler/src/subscribeToStore.js
function checkIfSnapshotChanged(inst) {
  const latestGetSnapshot = inst.getSnapshot;
  /* 取出上一次的快照信息 */
  const prevValue = inst.value;
  try {
    /* 最新的快照信息 */
    const nextValue = latestGetSnapshot();
    /* 返回是否相等 */
    return !is(prevValue, nextValue);
  } catch (error) {
    return true;
  }
}
/* 直接发起调度更新  */
function forceStoreRerender(fiber) {
  scheduleUpdateOnFiber(fiber, SyncLane, NoTimestamp);
}

function subscribeToStore(fiber, inst, subscribe) {
  const handleStoreChange = () => {
    /* 检查 state 是否发生变化 */
    if (checkIfSnapshotChanged(inst)) {
       /* 触发更新 */ 
      forceStoreRerender(fiber);
    }
  };
   /* 发起订阅 */
  return subscribe(handleStoreChange);
}
```

subscribeToStore 的流程如下：

- 通过 subscribe 订阅 handleStoreChange，当 state 改变会触发 handleStoreChange ，里面判断两次快照是否相等，如果不想等那么触发更新。

**updateStoreInstance**

```js
// react-reconciler/src/updateStoreInstance.js
function updateStoreInstance(fiber,inst,nextSnapshot,getSnapshot) {
  inst.value = nextSnapshot;
  inst.getSnapshot = getSnapshot;
  /* 检查是否更新 */
  if (checkIfSnapshotChanged(inst)) {
    /* 强制更新 */
    forceStoreRerender(fiber);
  }
}
```

- updateStoreInstance 很简单就是判断 state 是否发生变化，变化就更新。

通过如上原理分析，我们知道了 useSyncExternalStore 是如何防止 tearing 的了。为了让大家更清楚其流程 ，接下来我们来模拟一个 useSyncExternalStore 的实现。

```js
function useMockSyncExternalStore(subscribe,getSnapshot){
  const [ , forceupdate ] = React.useState(null)
  const inst = React.useRef(null)

  const nextValue = getSnapshot()

  inst.current = {
     value:nextValue,
     getSnapshot
  }
  /* 检测是否更新 */
  const checkIfSnapshotChanged = () => {
    try {
      /* 最新的快照信息 */
      const nextValue = inst.current.getSnapshot();
      /* 返回是否相等 */
      return !inst.value === nextValue
    } catch (error) {
      return true;
    }
  }
  /* 处理 store 改变 */
  const handleStoreChange=()=>{
    if (checkIfSnapshotChanged(inst)) {
      /* 触发更新 */
      forceupdate({})
   }
  }
  React.useEffect(()=>{
    subscribe(handleStoreChange)
  },[ subscribe ])

  /* 注意这个 useEffect 没有依赖项 ，每次更新都会执行该 effect */
  React.useEffect(()=>{
      handleStoreChange()
  })

  return nextValue
}
```
