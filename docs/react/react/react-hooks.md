# React Hooks 理解

- React Hooks 为什么必须在函数组件内部执行？React 如何能够监听 React Hooks 在外部执行并抛出异常。
- React Hooks 如何把状态保存起来？保存的信息存在了哪里？
- React Hooks 为什么不能写在条件语句中？
- useMemo 内部引用 useRef 为什么不需要添加依赖项，而 useState 就要添加依赖项。
- useEffect 添加依赖项 props.a ，为什么 props.a 改变，useEffect 回调函数 create 重新执行。
- React 内部如何区别 useEffect 和 useLayoutEffect ，执行时机有什么不同？

先设想一下，如果没有 Hooks，函数组件能够做的只是接受 Props、渲染 UI ，以及触发父组件传过来的事件。所有的处理逻辑都要在类组件中写，这样会使 class 类组件内部错综复杂，每一个类组件都有一套独特的状态，相互之间不能复用，即便是 React 之前出现过 mixin 等复用方式，但是伴随出 mixin 模式下隐式依赖，代码冲突覆盖等问题，也不能成为 React 的中流砥柱的逻辑复用方案。所以 React 放弃 mixin 这种方式。

类组件是一种面向对象思想的体现，类组件之间的状态会随着功能增强而变得越来越臃肿，代码维护成本也比较高，而且不利于后期 tree shaking。所以有必要做出一套函数组件代替类组件的方案，于是 Hooks 也就理所当然的诞生了。

所以 Hooks 出现本质上原因是：

- 让函数组件也能做类组件的事，有自己的状态，可以处理一些副作用，能获取 ref ，也能做数据缓存。
- 解决逻辑复用难的问题。
- 放弃面向对象编程，拥抱函数式编程。

## hooks 与 fiber（workInProgress）

类组件的状态比如 state ，context ，props 本质上是存在类组件对应的 fiber 上，包括生命周期比如 componentDidMount ，也是以副作用 effect 形式存在的。那么 Hooks 既然赋予了函数组件如上功能，所以 hooks 本质是离不开函数组件对应的 fiber 的。 hooks 可以作为函数组件本身和函数组件对应的 fiber 之间的沟通桥梁。

hooks 对象本质上是主要以三种处理策略存在 React 中：

- `ContextOnlyDispatcher`： 第一种形态是防止开发者在函数组件外部调用 hooks ，所以第一种就是报错形态，只要开发者调用了这个形态下的 hooks ，就会抛出异常。
- `HooksDispatcherOnMount`： 第二种形态是函数组件初始化 mount ，因为之前讲过 hooks 是函数组件和对应 fiber 桥梁，这个时候的 hooks 作用就是建立这个桥梁，初次建立其 hooks 与 fiber 之间的关系。
- `HooksDispatcherOnUpdate`：第三种形态是函数组件的更新，既然与 fiber 之间的桥已经建好了，那么组件再更新，就需要 hooks 去获取或者更新维护状态。

一个 hooks 对象应该长成这样：

```js
const HooksDispatcherOnMount = { /* 函数组件初始化用的 hooks */
    useState: mountState,
    useEffect: mountEffect,
    ...
}
const  HooksDispatcherOnUpdate ={/* 函数组件更新用的 hooks */
   useState:updateState,
   useEffect: updateEffect,
   ...
}
const ContextOnlyDispatcher = {  /* 当hooks不是函数内部调用的时候，调用这个hooks对象下的hooks，所以报错。 */
   useEffect: throwInvalidHookError,
   useState: throwInvalidHookError,
   ...
}
```

### 函数组件触发

所有函数组件的触发是在 renderWithHooks 方法中，在 fiber 调和过程中，遇到 FunctionComponent 类型的 fiber（函数组件），就会用 updateFunctionComponent 更新 fiber ，在 updateFunctionComponent 内部就会调用 renderWithHooks 。

```js
// react-reconciler/src/ReactFiberHooks.js
let currentlyRenderingFiber
function renderWithHooks(current,workInProgress,Component,props){
    currentlyRenderingFiber = workInProgress;
    workInProgress.memoizedState = null; /* 每一次执行函数组件之前，先清空状态 （用于存放hooks列表）*/
    workInProgress.updateQueue = null;    /* 清空状态（用于存放effect list） */
    ReactCurrentDispatcher.current =  current === null || current.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate /* 判断是初始化组件还是更新组件 */
    let children = Component(props, secondArg); /* 执行我们真正函数组件，所有的hooks将依次执行。 */
    ReactCurrentDispatcher.current = ContextOnlyDispatcher; /* 将hooks变成第一种，防止hooks在函数组件外部调用，调用直接报错。 */
}
```

workInProgress 正在调和更新函数组件对应的 fiber 树。

- 对于类组件 fiber ，用 memoizedState 保存 state 信息，**对于函数组件 fiber ，用 memoizedState 保存 hooks 信息**。
- 对于函数组件 fiber ，updateQueue 存放每个 useEffect/useLayoutEffect 产生的副作用组成的链表。在 commit 阶段更新这些副作用。
- 然后判断组件是初始化流程还是更新流程，如果初始化用 HooksDispatcherOnMount 对象，如果更新用 HooksDispatcherOnUpdate 对象。函数组件执行完毕，将 hooks 赋值给 ContextOnlyDispatcher 对象。**引用的 React hooks都是从 ReactCurrentDispatcher.current 中的， React 就是通过赋予 current 不同的 hooks 对象达到监控 hooks 是否在函数组件内部调用。**
- Component ( props ， secondArg ) 这个时候函数组件被真正的执行，里面每一个 hooks 也将依次执行。
- 每个 hooks 内部为什么能够读取当前 fiber 信息，因为 currentlyRenderingFiber ，函数组件初始化已经把当前 fiber 赋值给 currentlyRenderingFiber ，每个 hooks 内部读取的就是 currentlyRenderingFiber 的内容。

### hooks 初始化

hooks 如何和 fiber 建立起关系？hooks 初始化流程使用的是 mountState，mountEffect 等初始化节点的hooks，将 hooks 和 fiber 建立起联系，那么是如何建立起关系呢，每一个hooks 初始化都会执行 mountWorkInProgressHook

```js
// react-reconciler/src/ReactFiberHooks.js
function mountWorkInProgressHook() {
  const hook = {  memoizedState: null, baseState: null, baseQueue: null,queue: null, next: null,};
  if (workInProgressHook === null) {  // 只有一个 hooks
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {  // 有多个 hooks
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

首先函数组件对应 fiber 用 memoizedState 保存 hooks 信息，每一个 hooks 执行都会产生一个 hooks 对象，hooks 对象中，保存着当前 hooks 的信息，不同 hooks 保存的形式不同。每一个 hooks 通过 next 链表建立起关系。

假设在一个组件中这么写

```js
export default function Index(){
    const [ number,setNumber ] = React.useState(0) // 第一个hooks
    const [ num, setNum ] = React.useState(1)      // 第二个hooks
    const dom = React.useRef(null)                 // 第三个hooks
    React.useEffect(()=>{                          // 第四个hooks
        console.log(dom.current)
    },[])
    return <div ref={dom} >
        <div onClick={()=> setNumber(number + 1 ) } > { number } </div>
        <div onClick={()=> setNum(num + 1) } > { num }</div>
    </div>
}
```

那么如上四个 hooks ，初始化，每个 hooks 内部执行 mountWorkInProgressHook ，然后每一个 hook 通过 next 和下一个 hook 建立起关联，最后在 fiber 上的结构会变成这样:

![hooks1](/blog/images/react/hooks1.png)

### hooks 更新

更新 hooks 逻辑和之前 fiber 章节中讲的双缓冲树更新差不多，会首先取出 workInProgres.alternate 里面对应的 hook ，然后根据之前的 hooks 复制一份，形成新的 hooks 链表关系。这个过程中解释了一个问题，就是**hooks 规则，hooks 为什么要通常放在顶部，hooks 不能写在 if 条件语句中**，因为在更新过程中，如果通过 if 条件语句，增加或者删除 hooks，在复用 hooks 过程中，会产生复用 hooks 状态和当前 hooks 不一致的问题。举一个例子，还是将如上的 demo 进行修改。

将第一个 hooks 变成条件判断形式，具体如下：

```js
export default function Index({ showNumber }){
    let number, setNumber
    showNumber && ([ number,setNumber ] = React.useState(0)) // 第一个hooks
}
```

第一次渲染时候 `showNumber = true` 那么第一个 hooks 会渲染，第二次渲染时候，父组件将 showNumber 设置为 false ，那么第一个 hooks 将不执行，那么更新逻辑会变成这样:

![hooks2](/blog/images/react/hooks2.png)

第二次复用时候已经发现 hooks 类型不同 `useState !== useRef` ，那么已经直接报错了。所以开发的时候一定注意 hooks 顺序一致性。

## 状态派发

useState 解决了函数组件没有 state 的问题，让无状态组件有了自己的状态，useState 在 state 章节已经说了基本使用，接下来重点介绍原理使用， useState 和 useReducer 原理大同小异，本质上都是触发更新的函数都是 dispatchAction。

比如一段代码中这么写：

```js
const [ number,setNumber ] = React.useState(0)  
```

setNumber 本质就是 dispatchAction 。首先需要看一下执行 `useState(0)` 本质上做了些什么？

```js
// react-reconciler/src/ReactFiberHooks.js
function mountState(initialState){
     const hook = mountWorkInProgressHook();
    if (typeof initialState === 'function') {initialState = initialState() } // 如果 useState 第一个参数为函数，执行函数得到初始化state
     hook.memoizedState = hook.baseState = initialState;
    const queue = (hook.queue = { ... }); // 负责记录更新的各种状态。
    const dispatch = (queue.dispatch = (dispatchAction.bind(  null,currentlyRenderingFiber,queue, ))) // dispatchAction 为更新调度的主要函数 
    return [hook.memoizedState, dispatch];
}
```

- 上面的 state 会被当前 hooks 的 `memoizedState` 保存下来，每一个 useState 都会创建一个 `queue` 里面保存了更新的信息。
- 每一个 useState 都会创建一个更新函数，比如如上的 setNumber 本质上就是 dispatchAction，那么值得注意一点是，当前的 fiber 被 bind 绑定了固定的参数传入 dispatchAction 和 queue ，所以当用户触发 setNumber 的时候，能够直观反映出来自哪个 fiber 的更新。
- 最后把 memoizedState dispatch 返回给开发者使用。

接下来重点研究一下 `dispatchAction` ，底层是怎么处理更新逻辑的。

```js
function dispatchAction(fiber, queue, action){
    /* 第一步：创建一个 update */
    const update = { ... }
    const pending = queue.pending;
    if (pending === null) {  /* 第一个待更新任务 */
        update.next = update;
    } else {  /* 已经有带更新任务 */
       update.next = pending.next;
       pending.next = update;
    }
    if( fiber === currentlyRenderingFiber ){
        /* 说明当前fiber正在发生调和渲染更新，那么不需要更新 */
    }else{
       if(fiber.expirationTime === NoWork && (alternate === null || alternate.expirationTime === NoWork)){
            const lastRenderedReducer = queue.lastRenderedReducer;
            const currentState = queue.lastRenderedState;                 /* 上一次的state */
            const eagerState = lastRenderedReducer(currentState, action); /* 这一次新的state */
            if (is(eagerState, currentState)) {                           /* 如果每一个都改变相同的state，那么组件不更新 */
               return 
            }
       }
       scheduleUpdateOnFiber(fiber, expirationTime);    /* 发起调度更新 */
    }
}
```

原来当每一次改变 state ，底层会做这些事。

- 首先用户每一次调用 dispatchAction（比如如上触发 setNumber ）都会先创建一个 update ，然后把它放入待更新 pending 队列中。
- 然后判断如果当前的 fiber 正在更新，那么也就不需要再更新了。
- 反之，说明当前 fiber 没有更新任务，那么会拿出上一次 state 和 这一次 state 进行对比，如果相同，那么直接退出更新。如果不相同，那么发起更新调度任务。**这就解释了，为什么函数组件 useState 改变相同的值，组件不更新了。**

接下来就是更新的环节，下面模拟一个更新场景。

```js
export default  function Index(){
    const [ number , setNumber ] = useState(0)
    const handleClick=()=>{
        setNumber(num=> num + 1 ) // num = 1
        setNumber(num=> num + 2 ) // num = 3 
        setNumber(num=> num + 3 ) // num = 6
    }
    return <div>
        <button onClick={() => handleClick() } >点击 { number } </button>
    </div>
}
```

- 如上当点击一次按钮，触发了三次 setNumber，等于触发了三次 dispatchAction ，那么这三次 update 会在当前 hooks 的 pending 队列中，然后事件批量更新的概念，会统一合成一次更新。接下来就是组件渲染，那么就到了再一次执行 useState，此时走的是更新流程。那么试想一下点击 handleClick 最后 state 被更新成 6 ，那么在更新逻辑中 useState 内部要做的事，就是**得到最新的 state 。**

```js
function updateReducer(){
    // 第一步把待更新的pending队列取出来。合并到 baseQueue
    const first = baseQueue.next;
    let update = first;
   do {
        /* 得到新的 state */
        newState = reducer(newState, action);
    } while (update !== null && update !== first);
     hook.memoizedState = newState;
     return [hook.memoizedState, dispatch];
}
```

- 当再次执行useState的时候，会触发更新hooks逻辑，本质上调用的就是 updateReducer，如上会把待更新的队列 pendingQueue 拿出来，合并到 `baseQueue`，循环进行更新。
- 循环更新的流程，说白了就是执行每一个 `num => num + 1` ，得到最新的 state 。接下来就可以从 useState 中得到最新的值。

用一幅图来描述整个流程：

![hooks3](/blog/images/react/hooks3.png)

## 处理副作用

### 初始化

在 render 阶段，实际没有进行真正的 DOM 元素的增加，删除，React 把想要做的不同操作打成不同的 effectTag ，等到 `commit` 阶段，统一处理这些副作用，包括 DOM 元素增删改，执行一些生命周期等。hooks 中的 `useEffect` 和 `useLayoutEffect` 也是副作用，接下来以 effect 为例子，看一下 React 是如何处理 useEffect 副作用的。

下面还是以初始化和更新两个角度来分析。

```js
function mountEffect(create,deps){
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    currentlyRenderingFiber.effectTag |= UpdateEffect | PassiveEffect;
    hook.memoizedState = pushEffect( 
      HookHasEffect | hookEffectTag, 
      create, // useEffect 第一次参数，就是副作用函数
      undefined, 
      nextDeps, // useEffect 第二次参数，deps    
    )
}
```

- `mountWorkInProgressHook` 产生一个 hooks ，并和 fiber 建立起关系。
- 通过 `pushEffect` 创建一个 effect，并保存到当前 hooks 的 `memoizedState` 属性下。
- `pushEffect` 除了创建一个 effect ， 还有一个重要作用，就是如果存在多个 `effect` 或者`layoutEffect` 会形成一个副作用链表，绑定在函数组件 fiber 的 `updateQueue` 上。

为什么 React 会这么设计呢，首先对于类组件有 `componentDidMount/componentDidUpdate`  固定的生命周期钩子，用于执行初始化/更新的副作用逻辑，但是对于函数组件，可能存在多个 `useEffect/useLayoutEffec`t ，hooks 把这些 effect，独立形成链表结构，在 commit 阶段统一处理和执行。

如果在一个函数组件中这么写：

```js
React.useEffect(()=>{
    console.log('第一个effect')
},[ props.a ])
React.useLayoutEffect(()=>{
    console.log('第二个effect')
},[])
React.useEffect(()=>{
    console.log('第三个effect')
    return () => {}
},[])
```

那么在 `updateQueue` 中，副作用链表会变成如下样子：

![hooks4](/blog/images/react/hooks4.png)

### 更新

更新流程对于 effect 来说也很简单，首先设想一下 useEffect 更新流程，无非判断是否执行下一次的 effect 副作用函数。还有一些细枝末节。

```js
function updateEffect(create,deps){
    const hook = updateWorkInProgressHook();
    if (areHookInputsEqual(nextDeps, prevDeps)) { /* 如果deps项没有发生变化，那么更新effect list就可以了，无须设置 HookHasEffect */
        pushEffect(hookEffectTag, create, destroy, nextDeps);
        return;
    } 
    /* 如果deps依赖项发生改变，赋予 effectTag ，在commit节点，就会再次执行我们的effect  */
    currentlyRenderingFiber.effectTag |= fiberEffectTag
    hook.memoizedState = pushEffect(HookHasEffect | hookEffectTag,create,destroy,nextDeps)
}
```

更新 effect 的过程非常简单，就是判断 deps 项有没有发生变化，如果没有发生变化，更新副作用链表就可以了；如果发生变化，更新链表同时，打执行副作用的标签：`fiber => fiberEffectTag，hook => HookHasEffect`。在 commit 阶段就会根据这些标签，重新执行副作用。

### 不同的 effect

关于 `EffectTag` 的思考：

- React 会用不同的 `EffectTag` 来标记不同的 effect，对于`useEffect` 会标记 `UpdateEffect | PassiveEffect`， `UpdateEffect` 是证明此次更新需要更新 effect ，`HookPassive` 是 `useEffect` 的标识符，对于 `useLayoutEffect` 第一次更新会打上 `HookLayout` 的标识符。**React 就是在 commit 阶段，通过标识符，证明是 `useEffect` 还是 `useLayoutEffect` ，接下来 React 会同步处理 `useLayoutEffect` ，异步处理 `useEffect`** 。
- 如果函数组件需要更新副作用，会标记 `UpdateEffect`，至于哪个effect 需要更新，那就看 hooks 上有没有 `HookHasEffect` 标记，所以初始化或者 deps 不想等，就会给当前 hooks 标记上 `HookHasEffect` ，所以会执行组件的副作用钩子。

## 状态获取与状态缓存

### 对于 ref 处理

在 ref 章节详细介绍过，useRef 就是创建并维护一个 ref 原始对象。用于获取原生 DOM 或者组件实例，或者保存一些状态等。

创建：

```js
function mountRef(initialValue) {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  hook.memoizedState = ref; // 创建ref对象。
  return ref;
}
```

更新：

```js
function updateRef(initialValue){
  const hook = updateWorkInProgressHook()
  return hook.memoizedState // 取出复用ref对象。
}
```

如上 ref 创建和更新过程，就是 ref 对象的创建和复用过程。

### 对于 useMemo 的处理

对于 useMemo ，逻辑比 useRef 复杂点，但是相对于 useState 和 useEffect 简单的多。

创建：

```js
function mountMemo(nextCreate,deps){
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

- useMemo 初始化会执行第一个函数得到想要缓存的值，将值缓存到 hook 的 memoizedState 上。

更新：

```js
function updateMemo(nextCreate,nextDeps){
    const hook = updateWorkInProgressHook();
    const prevState = hook.memoizedState; 
    const prevDeps = prevState[1]; // 之前保存的 deps 值
    if (areHookInputsEqual(nextDeps, prevDeps)) { //判断两次 deps 值
        return prevState[0];
    }
    const nextValue = nextCreate(); // 如果deps，发生改变，重新执行
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
}
```

- useMemo 更新流程就是对比两次的 dep 是否发生变化，如果没有发生变化，直接返回缓存值，如果发生变化，执行第一个参数函数，重新生成缓存值，缓存下来，供开发者使用。
