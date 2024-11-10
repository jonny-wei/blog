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

## 自定义 hooks

### 基本概念

自定义 hooks 是在 React Hooks 基础上的一个拓展，可以根据业务需求制定满足业务需要的组合 hooks ，更注重的是逻辑单元。通过业务场景不同，到底需要React Hooks 做什么，怎么样把一段逻辑封装起来，做到复用，这是自定义 hooks 产生的初衷。

自定义 hooks 参数可能是以下内容：

- hooks 初始化值。
- 一些副作用或事件的回调函数。
- 可以是 useRef 获取的 DOM 元素或者组件实例。
- 不需要参数

自定义 hooks 返回值可能是以下内容：

- 负责渲染视图获取的状态。
- 更新函数组件方法，本质上是 useState 或者 useReducer。
- 一些传递给子孙组件的状态。
- 没有返回值。

### 特性

上述讲到了自定义 hooks 基本概念，接下来分析一下它的特性。

#### 驱动条件

**自定义 hooks 驱动本质上就是函数组件的执行**。

自定义 hooks 驱动条件：

- props 改变带来的函数组件执行。
- useState | useReducer 改变 state 引起函数组件的更新。

#### 顺序原则

自定义 hooks 内部至少有一个 React Hooks ，那么自定义 hooks 也要遵循 hooks 的规则，**不能放在条件语句中，而且要保持执行顺序的一致性。**

#### 条件限定

在自定义 hooks 中，条件限定**特别重要**。因为考虑 hooks 的限定条件，是一个出色的自定义 hooks 重要因素。

比如在一个自定义这里写：

```js
function useXXX(){
    const value = React.useContext(defaultContext)
    /* .....用上下文中 value 一段初始化逻辑  */
    const newValue = initValueFunction(value) /* 初始化 value 得到新的 newValue  */
    /* ...... */
    return newValue
}
```

比如上述一个非常简单自定义 hooks ，从 `context` 取出状态 value ，通过 `initValueFunction` 加工 value ，得到并返回最新的 newValue 。如果直接按照上述这么写，会导致什么发生呢？

首先每一次函数组件更新，就会执行此自定义 hooks ，那么就会重复执行初始化逻辑，重复执行`initValueFunction` ，每一次都会得到一个最新的 newValue 。 如果 newValue 作为 `useMemo` 和 `useEffect` 的 deps ，或者作为子组件的 props ，那么子组件的浅比较 props 将失去作用，那么会带来一串麻烦。

那么如何解决这个问题呢？答案很简单，可以通过 useRef 对 newValue 缓存，然后每次执行自定义 hooks 判断有无缓存值。如下：

```js
function useXXX(){
    const newValue =  React.useRef(null)  /* 创建一个 value 保存状态。  */
    const value = React.useContext(defaultContext)
    if(!newValue.current){  /* 如果 newValue 不存在 */
          newValue.current = initValueFunction(value)
    }
    return newValue.current
}
```

- 用一个 useRef 保存初始化过程中产生的 value 值 。
- 判断如果 value 不存在，那么通过 initValueFunction 创建，如果存在直接返回 newValue.current 。

如上加了条件判断之后，会让自定义 hooks 内部按照期望的方向发展。条件限定是编写出色的 hooks 重要的因素。

#### 考虑可变性

在编写自定义 hooks 的时候，可变性也是一个非常重要的 hooks 特性。什么叫做可变性，**就是考虑一些状态值发生变化，是否有依赖于当前值变化的执行逻辑或执行副作用。**

比如上面的例子中，如果 defaultContext 中的 value 是可变的，那么如果还像上述用 useRef 这么写，就会造成 context 变化，得不到最新的 value 值的情况发生。

所以为了解决上述可变性的问题：

- 对于依赖于可变性状态的执行逻辑，可以用 `useMemo` 来处理。
- 对于可变性状态的执行副作用，可以用 `useEffect` 来处理。
- 对于依赖可变性状态的函数或者属性，可以用`useCallback`来处理。 于是需要把上述自定义 hooks 改版。

```js
function useXXX(){
    const value = React.useContext(defaultContext)
    const newValue = React.useMemo(()=> initValueFunction(value) ,[  value  ] )  
    return  newValue
}
```

- 用 React.useMemo 来对 initValueFunction 初始化逻辑做缓存，当上下文 value 改变的时候，重新生成新的 newValue 。

#### 闭包效应

闭包也是自定义 hooks 应该注意的问题。这个问题和 [考虑可变性] 本质一样。首先函数组件更新就是函数本身执行，一次更新所有含有状态的 hooks （ `useState` 和 `useReducer` ）产生的状态 state 是重新声明的。但是如果像 `useEffect` ， `useMemo` ，`useCallback` 等，它们内部如果引用了 state 或 props 的值，而且这些状态最后保存在了函数组件对应的 fiber 上，那么此次函数组件执行完毕后，这些状态就不会被垃圾回收机制回收释放。这样造成的影响是，上述 hooks 如果没有把内部使用的 state 或 props 作为依赖项，那么内部就一直无法使用最新的 props 或者 state 。

比如我举个简单的例子。

```js
function useTest(){
    const [ number ] = React.useState(0)
    const value = React.useMemo(()=>{
         // 内部引用了 number 进行计算
    },[])
}
```

- 如上 useMemo 内部使用了 state 中的 number 进行计算，当 number 改变但是无法得到最新的 value 。这就是上面我说到的闭包问题。解决方法就是 useMemo 的 deps 中加入 number。

但是有的时候这种依赖关系往往是更复杂的。我将如上 demo 修改。

```js
function useTest(){
    const [ number ] = React.useState(0)
    const value = React.useMemo(()=>{
         // 内部引用了 number 进行计算
    },[ number ])
    const callback = React.useCallback(function(){
         // 内部引用了 useEffect
    },[ value ])
    
}
```

- 如上，在之前的基础上，又加了 useCallback 而且内部引用了 useMemo 生成的 value。 这个时候如果 useCallback 执行，内部想要获取新的状态值 value，那么就需要把 value 放在 useCallback 的 deps 中。

**如何分清楚依赖关系呢？**

- **第一步**：找到 hooks 内部可能发生变化的状态 ， 这个状态可以是 state 或者 props。
- **第二步**：分析 useMemo 或者 useCallback 内部是否使用上述状态，或者是否**关联使用** useMemo 或者 useCallback 派生出来的状态（ 比如上述的 value ，就是 useMemo 派生的状态 ） ，如果有使用，那么加入到 deps 。
- **第三步**：分析 useEffect ，useLayoutEffect ，useImperativeHandle 内部是否使用上述两个步骤产生的值，而且还要这些值做一些副作用，如果有，那么加入到 deps 。

## 自定义 hooks 设计

上述介绍了自定义 hooks 的概念和特性，接下来重点分析一下，如何去设计一个自定义 hooks 。首先明确的一点是，自定义 hooks 解决逻辑复用的问题，那么在正常的业务开发过程中，要明白哪些逻辑是重复性强的逻辑，这段逻辑主要功能是什么。下面我把自定义 hooks 能实现的功能化整为零，在实际开发中，可能是下面一种或者几种的结合。

### 接收状态

自定义 hooks ，可以通过函数参数来直接接收组件传递过来的状态，也可以通过 useContext ，来隐式获取上下文中的状态。比如 React Router 中最简单的一个自定义 hooks —— useHistory ，用于获取 history 对象。

```js
export default function useHistory() {
    return useContext(RouterContext).history
}
```

注意：**如果使用了内部含有 useContext 的自定义 hooks ，那么当 context 上下文改变，会让使用自定义 hooks 的组件自动渲染。**

### 存储｜管理状态

**储存状态**

自定义 hooks 也可以用来储存和管理状态。本质上应用 useRef 保存原始对象的特性。

比如 `rc-form` 中的 `useForm` 里面就是用 useRef 来保存表单状态管理 Store 的。简化流程如下

```js
function useForm(){
    const formCurrent = React.useRef(null)
    if(!formCurrent.current){
        formCurrent.current = new FormStore()
    }
    return formCurrent.current
}
```

**记录状态**

当然 useRef 和 useEffect 可以配合记录函数组件的内部的状态。举个例子，我编写一个自定义 hooks 用于记录函数组件执行次数，和是否第一次渲染。

```js
function useRenderCount(){
    const isFirstRender = React.useRef(true) /* 记录是否是第一次渲染 */
    const renderCount = React.useRef(1)      /* 记录渲染次数 */
    useEffect(()=>{
        isFirstRender.current = false        /* 第一次渲染完成，改变状态 */
    },[])
    useEffect(()=>{
        if(!isFirstRender.current) renderCount.current++ /* 如果不是第一次渲染，那么添加渲染次数  */
    })  
    return [ renderCount.current , isFirstRender.current ]
} 
```

- 如上用 isFirstRender 记录是否是第一次渲染 ，用 renderCount 记录渲染次数，第一个 useEffect 依赖项为空，只执行一次，第二个 useEffect 没有依赖项，每一次函数组件执行，都会执行，统计渲染次数。

### 更新状态

**改变状态**

自定义 hooks 内部可以保存状态，可以把更新状态的方法暴露出去，来改变 hooks 内部状态。而更新状态的方法可以是组合多态的。

比如实现一个防抖节流的自定义 hooks ：

```js
export function debounce(fn, time) {
    let timer = null;
    return function(...arg) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, arg);
      }, time);
    };
}

function useDebounceState(defauleValue,time){
    const [ value , changeValue ] = useState(defauleValue)
    /* 对 changeValue 做防抖处理   */
    const newChange = React.useMemo(()=> debounce(changeValue,time) ,[ time ])
    return [ value , newChange ]
}
```

使用：

```js
export default function Index(){
    const [ value , setValue ] = useDebounceState('',300)
    console.log(value)
    return <div style={{ marginTop:'50px' }} >
        《React 进阶实践指南》
        <input placeholder="" onChange={(e)=>setValue(e.target.value)}  />
    </div>
}
```

**组合state**

自定义 hooks 可以维护多个 state ，然后可以组合更新函数。我这么说可能很多同学不理解，下面我来举一个例子，比如控制数据加载和loading效果，

```js
function useControlData(){
    const [ isLoading , setLoading ] = React.useState(false)
    const [ data,  setData ] = React.useState([])
    const getData = (data)=> { /* 获取到数据，清空 loading 效果  */
        setLoading(false)
        setData(data)
    }  
    // ... 其他逻辑
    const resetData = () =>{  /* 请求数据之前，添加 loading 效果 */
        setLoading(true)
        setData([])
    }
    return [ getData , resetData , ...  ] 
}
```

**合理state**

useState 和 useRef 都可以保存状态：

- useRef 只要组件不销毁，一直存在，而且可以随时访问最新状态值。
- useState 可以让组件更新，但是 state 需要在下一次函数组件执行的时候才更新，而且如果想让 useEffect 或者 useMemo 访问最新的 state 值，需要将 state 添加到 deps 依赖项中。

自定义 hooks 可以通过 useState + useRef 的特性，取其精华，更合理的管理 state。比如如下实现一个**同步的state**

```js
function useSyncState(defaultValue){
   const value = React.useRef(defaultValue)        /* useRef 用于保存状态 */
   const [ ,forceUpdate ] = React.useState(null)   /* useState 用于更新组件 */
   const dispatch = (fn) => {                      /* 模拟一个更新函数 */
       let newValue
       if( typeof fn === 'function' ){
            newValue = fn(value.current)           /* 当参数为函数的情况 */
       }else{
           newValue = fn                           /* 当参数为其他的情况 */
       }
       value.current = newValue
       forceUpdate({})                             /* 强制更新 */
   } 
   return [  value , dispatch  ]                   /* 返回和 useState 一样的格式 */
}
```

- useRef 用于保存状态 ，useState 用于更新组件。
- 做一个 `dispatch` 处理参数为函数的情况。在 dispatch 内部用 forceUpdate 触发真正的更新。
- 返回的结构和 useState 结构相同。不过注意的是使用的时候要用 value.current 。

使用：

```js
export default function Index(){
    const [ data , setData  ] = useSyncState(0)
    return <div style={{ marginTop:'50px' }} >
        《React 进阶实践指南》 点赞 👍 { data.current }
       <button onClick={ ()=> {
           setData(num => num + 1)
           console.log(data.current) //打印到最新的值
       } } >点击</button>
    </div>
}
```

### 操纵 DOM / 组件实例

自定义 hooks 也可以设计成对原生 DOM 的操纵控制。究其原理用 useRef 获取元素， 在 useEffect 中做元素的监听。

比如如下场景，用一个自定义 hooks 做一些基于 DOM 的操作 。

```js
/* TODO: 操纵原生dom  */
function useGetDOM(){
    const dom = React.useRef()
    React.useEffect(()=>{
       /* 做一些基于 dom 的操作 */
       console.log(dom.current)
    },[])
    return dom
}
```

- 自定义 useGetDOM ，用 useRef 获取 DOM 元素，在 useEffect 中做一些基于 DOM 的操作。

使用：

```js
export default function Index(){
    const dom = useGetDOM()
    return <div ref={ dom } >
        《React进阶实践指南》
        <button >点赞</button>
    </div>
}
```

### 执行副作用

自定义 hooks 也可以执行一些副作用，比如说监听一些 props 或 state 变化而带来的副作用。比如如下监听，当 `value` 改变的时候，执行 `cb`。

```js
function useEffectProps(value,cb){
    const isMounted = React.useRef(false)
    React.useEffect(()=>{
         /* 防止第一次执行 */
        isMounted.current && cb && cb()
    },[ value ])
    React.useEffect(()=>{
          /* 第一次挂载 */
         isMounted.current = true
    },[])
}
```

- 用 useRef 保存是否第一次的状态。然后在一个 useEffect 改变加载完成状态。
- 只有当不是第一次加载且 value 改变的时候，执行回调函数 cb 。
- 当使用这个自定义 hooks 就可以监听，props 或者 state 变化。接下来尝试一下。

使用组件和父组件：

```js
function Index(props){
    useEffectProps( props.a ,()=>{/* 监听 a 变化 */
        console.log('props a 变化:', props.a  )
    } )
    return <div>子组件</div>
}
export default function Home(){
    const [ a , setA ] = React.useState(0)
    const [ b , setB ] = React.useState(0)
    return <div>
        <Index a={a}  b={b} />
        <button onClick={()=> setA(a+1)} >改变 props a  </button>
        <button onClick={()=> setB(b+1)} >改变 props b  </button>
    </div>
}
```

## 自定义 hooks 实践

### useLog

自动上报 pv/click 的埋点 hooks

实现一个能够自动上报 点击事件 | pv 的自定义 hooks 。通过这个自定义 hooks ，将带来的收获是：

- 通过自定义 hooks 控制监听 DOM 元素。
- 分清自定义 hooks 依赖关系。

**编写**

```js
export const LogContext = React.createContext({})

export default function useLog(){
    /* 一些公共参数 */
    const message = React.useContext(LogContext)
    const listenDOM = React.useRef(null)

    /* 分清依赖关系 -> message 改变，   */
    const reportMessage = React.useCallback(function(data,type){
        if(type==='pv'){ // pv 上报
            console.log('组件 pv 上报',message)
        }else if(type === 'click'){  // 点击上报
            console.log('组件 click 上报',message,data)
        }
    },[ message ])

    React.useEffect(()=>{
        const handleClick = function (e){
            reportMessage(e.target,'click')
        }
        if(listenDOM.current){
            listenDOM.current.addEventListener('click',handleClick)
        }

        return function (){
            listenDOM.current && listenDOM.current.removeEventListener('click',handleClick)
        }
    },[ reportMessage  ])

    return [ listenDOM , reportMessage  ]
}
```

- 用 `useContext` 获取埋点的公共信息。当公共信息改变，会统一更新。
- 用 `useRef` 获取 DOM 元素。
- 用 `useCallback` 缓存上报信息 reportMessage 方法，里面获取 useContext 内容。把 context 作为依赖项。当依赖项改变，重新声明 reportMessage 函数。
- 用 `useEffect`监听 DOM 事件，把 reportMessage 作为依赖项，在 useEffect 中进行事件绑定，返回的销毁函数用于解除绑定。

**依赖关系：** context 改变 -> 让引入 context 的 reportMessage 重新声明 -> 让绑定 DOM 事件监听的 useEffect 里面能够绑定最新的 reportMessage 。

如果上述没有分清楚依赖项关系，那么 context 改变，会让 reportMessage 打印不到最新的 context 值。

**使用**

```js
 function Home(){
    const [ dom , reportMessage  ] = useLog()
    return <div>
        {/* 监听内部点击 */}
        <div ref={dom} >
            <p> 《React进阶实践指南》</p>
            <button> 按钮 one   (内部点击) </button>
            <button> 按钮 two   (内部点击) </button>
            <button> 按钮 three (内部点击)  </button>
        </div>
        {/* 外部点击 */}
        <button  onClick={()=>{ console.log(reportMessage)  }} > 外部点击 </button>
    </div>
}
const Index = React.memo(Home) /*  阻断 useState 的更新效应  */
export default function Root(){
    const [ value , setValue ] = useState({})
    return  <LogContext.Provider value={value} >
        <Index />
        <button onClick={()=> setValue({ name:'《React进阶实践指南》' , author:'我不是外星人'  })} >点击</button>
    </LogContext.Provider>
}
```

如上当 context 改变，能够达到正常上报的效果。有一个小细节，就是用 `React.memo` 来阻断 Root 组件改变 state 给 Home 组件带来的更新效应。

### useQueryTable

带查询的分页加载长列表

useQueryTable 的设计主要分为两部分，分别为表格和查询表单。

- 表格设计：表格的数据状态层，改变分页方法，请求数据的方法。
- 表单设计：表单的状态层，以及改变表单单元项的方法，重置表单重新请求数据。

**编写：**

```js
/**
 *
 * @param {*} defaultQuery  表单查询默认参数
 * @param {*} api           biaog
 */
function useQueryTable(defaultQuery = {},api){
   /* 保存查询表格表单信息 */
   const formData = React.useRef({})
   /* 保存查询表格分页信息 */
   const pagination = React.useRef({
       page:defaultQuery.page || 1,
       pageSize:defaultQuery.pageSize || 10
   })

   /* 强制更新 */
   const [, forceUpdate] = React.useState(null)

   /* 请求表格数据 */
   const [tableData, setTableData] = React.useState({
     data: [],
     total: 0,
     current: 1
  })

   /* 请求列表数据 */
   const getList = React.useCallback(async function(payload={}){
        if(!api) return
        const data = await api({ ...defaultQuery, ...payload, ...pagination.current,...formData.current}) || {}
        if (data.code == 200) {
            setTableData({ list:data.list,current:data.current,total:data.total })
        } else {}
   },[ api ]) /* 以api作为依赖项，当api改变，重新声明getList */

    /* 改变表单单元项 */
    const setFormItem = React.useCallback(function (key,value){
        const form = formData.current
        form[key] = value
        forceUpdate({}) /* forceUpdate 每一次都能更新，不会造成 state 相等的情况 */
   },[])

   /* 重置表单 */
   const reset = React.useCallback(function(){
        const current = formData.current
        for (let name in current) {
            current[name] = ''
        }
        pagination.current.page = defaultQuery.page || 1
        pagination.current.pageSize = defaultQuery.pageSize || 10
        /* 请求数据  */
        getList()
   },[ getList ]) /* getList 作为 reset 的依赖项  */

   /* 处理分页逻辑 */
   const handerChange = React.useCallback(async function(page,pageSize){
        pagination.current = {
            page,
            pageSize
        }
        getList()
   },[ getList ]) /* getList 作为 handerChange 的依赖项  */

   /* 初始化请求数据 */
   React.useEffect(()=>{
       getList()
   },[])

   /* 组合暴露参数 */
   return [
        {  /* 组合表格状态 */
           tableData,
           handerChange,
           getList,
           pagination:pagination.current
        },
        {  /* 组合搜索表单状态 */
            formData:formData.current,
            setFormItem,
            reset
        }
    ]
}
```

**设计分析：**

接收参数 ：编写的自定义 hooks 接收两个参数。

- `defaultQuery`：表格的默认参数，有些业务表格，除了查询和分页之外，有一些独立的请求参数。
- `api` ： api 为请求数据方法，内部用 `Promise` 封装处理。

数据层：

- 用第一个 useRef 保存查询表单信息 formData 。 第二个 useRef 保存表格的分页信息 pagination 。
- 用第一个 useState 做**受控表单组件更新视图**的渲染函数。第二个 useState 保存并负责更新表格的状态。

控制层：控制层为**控制表单表格整体联动**的方法。

- 编写内部和对外公共方法 `getList`，方法内部使用 api 函数发起请求，通过 `setTableData` 改变表格数据层状态，用 `useCallback` 做优化缓存处理 。
- 编写改变表单单元项的方法 `setFormItem`，这个方法主要给查询表单控件使用，内部改变 formData 属性，并通过 useState 更新组件，改变表单控件视图，用 `useCallback` 做优化缓存处理。
- 编写重置表单的方法 `reset` ，reset 会清空 formData 属性和重置分页的信息。然后重新调用 getList 请求数据，用 `useCallback` 做优化缓存处理。
- 编写给表格分页器提供的接口 `handerChange` 内部改变分页信息，然后重新请求数据，用 `useCallback` 做优化缓存处理。。
- 用 useEffect 作为初始化请求表格数据的副作用。

返回状态：

- 通过数组把表单和表格的聚合状态暴露出去。

注意事项：

- 请求方法要与后端进行对齐，包括返回的参数结构，成功状态码等。
- 属性的声明要与 UI 组件对齐，这里统一用的是 antd 里面的表格和表单控件。

**使用：**

```js
/* 模拟数据请求 */
function getTableData(payload){
    return new Promise((resolve)=>{
        Promise.resolve().then(()=>{
            const { list } = listData
            const arr = threeNumberRandom()  // 生成三个随机数 模拟数据交互
            console.log('请求参数：',payload)
            resolve({
                ...listData,
                list:[ list[arr[0]],list[arr[1]],list[arr[2]] ],
                total:list.length,
                current:payload.page || 1
            })
        })
    })
}
function Index (){
    const [ table,form ] = useQueryTable({ pageSize:3 },getTableData)
    const { formData ,setFormItem , reset  } = form
    const { pagination , tableData , getList  , handerChange } = table
    return <div style={{ margin:'30px' }} >
        <div style={{ marginBottom:'24px' }} >
            <Input onChange={(e)=> setFormItem('name',e.target.value)}
                placeholder="请输入名称"
                style={inputStyle}
                value={formData.name || ''}
            />
             <Input onChange={(e)=> setFormItem('price',e.target.value)}
                 placeholder="请输入价格"
                 style={inputStyle}
                 value={formData.price || ''}
             />
             <Select onChange={(value) => setFormItem('type',value)}
                 placeholder="请选择"
                 style={inputStyle}
                 value={formData.type}
             >
                 <Option value="1" >家电</Option>
                 <Option value="2" >生活用品</Option>
             </Select>
            <button className="searchbtn"
                onClick={() => getList()}
            >提交</button>
             <button className="concellbtn"
                 onClick={reset}
             >重置</button>
        </div>
        {useCallback( <Table
            columns={columns}
            dataSource={tableData.list}
            height="300px"
            onChange={(res)=>{ handerChange(res.current,res.pageSize) }}
            pagination={{ ...pagination, total: tableData.total ,current:tableData.current }}
            rowKey="id"
            />,[tableData])}
    </div>
}
```

- 整个查询表格逻辑层基本就一个自定义 hooks —— `useQueryTable` 就搞定了。
- `getTableData` 模拟了数据交互过程 ，其内部的代码逻辑不必纠结 。
- `useCallback` 对 Table 的 React element 做缓存处理，这样频繁的表单控件更新，不会让 Table 组件重新渲染。

### usePrevious

用于获取在函数式组件中某个值的前一个状态。这在很多情况下都非常有用，比如当你需要比较新旧值时，或者在动画中需要上一个位置等。

在 React 的类组件中，我们可以通过生命周期方法 componentDidUpdate 来获取前一个状态或属性的值，但是在函数式组件中，我们没有这样的生命周期方法。usePrevVal Hook 就是用来解决这个问题的。

```js
function usePrevious(value) {
  // 创建一个 ref 对象来保存上一次的值
  const ref = useRef();
  
  // 在 useEffect 中更新 ref 的值
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  // 返回上一次的值
  return ref.current;
}

// 测试用例
import React, { useState } from 'react';
import usePrevious from './usePrevious';

function MyComponent() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current count: {count}</p>
      <p>Previous count: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

usePrevVal 通常需要结合 useRef 和 useEffect 来实现。利用 useRef 用于创建一个可变的引用，这个引用可以用来保存上一次的值。useEffect 则用于在组件挂载后执行副作用，这里用来保存上一次的值。

### useVisible

实现一个 useVisible Hook，其功能是检测 DOM 元素是否在浏览器视口内，我们可以使用 IntersectionObserver API。这个 API 允许我们异步观察目标元素与视口的交叉状态，非常适合用于懒加载图片、无限滚动列表、广告曝光统计等场景。

```js
import { useState, useEffect, useRef } from 'react';

function useVisible(options) {
  const { root = null, rootMargin = '0px', threshold = 0.1 } = options || {};
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      });
    }, { root, rootMargin, threshold });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [root, rootMargin, threshold]);

  return {
    ref,
    isVisible
  };
}
```

### useForceUpdate

在 React 中，通常我们不需要强制组件重新渲染，因为 React 的状态更新和 props 变化会自动触发组件的重新渲染。但在某些特殊情况下，例如，当你需要在非 React 状态或 props 变化的情况下触发重新渲染，或者需要在特定逻辑后确保组件更新，你可能需要一个强制更新的方法。

以下是一个 useForceUpdate Hook 的实现，它返回一个函数，调用这个函数可以强制组件重新渲染：

```js
import { useState, useCallback } from 'react';

function useForceUpdate() {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => {
    setTick(tick => tick + 1);
  }, []);
  return forceUpdate;
}

// 测试用例
import React from 'react';
import useForceUpdate from './useForceUpdate'; // 假设 useForceUpdate 在这个文件中定义

function MyComponent() {
  const forceUpdate = useForceUpdate();

  return (
    <div>
      <p>This is a component that can force update itself.</p>
      <button onClick={forceUpdate}>Force Update</button>
    </div>
  );
}
```

工作原理是利用了 useState 的 setter 函数来改变一个状态变量。由于这个状态变量的改变，React 会触发组件的重新渲染。

### useOnClickOutside

允许你监听组件外部的点击事件。这在很多场景下都非常有用，比如在点击外部时关闭弹出框、下拉菜单等。

```js
import { useEffect, useRef } from 'react';

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function handleClickOutside(event) {
      // 如果 ref 当前指向的元素不包含事件的目标元素，则调用 handler
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }

    // 监听整个文档的点击事件
    document.addEventListener('mousedown', handleClickOutside);
    // 监听整个文档的触摸事件
    document.addEventListener('touchstart', handleClickOutside);

    // 组件卸载时移除事件监听
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler]);
}

// 测试用例
import React, { useRef } from 'react';
import useOnClickOutside from './useOnClickOutside';

function MyComponent() {
  const ref = useRef(null);
  const handleClickOutside = () => {
    console.log('Clicked outside!');
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <div ref={ref}>
      Click outside of this box to trigger the console log.
    </div>
  );
}
```

## React-Redux 中的 hooks

用**两个自定义 hooks 实现 `React-Redux` 基本功能**。 一个是注入 Store 的 `useCreateStore` ，另外一个是负责订阅更新的 `useConnect` ，通过这个实践 demo ，将收获以下知识点：

- 如何将不同组件的自定义 hooks 建立通信，共享状态。
- 合理编写自定义 hooks ， 分析 hooks 之间的依赖关系。

首先，看一下要实现的两个自定义 hooks 具体功能。

- `useCreateStore` 用于产生一个状态 Store ，通过 context 上下文传递 ，为了让每一个自定义 hooks `useConnect` 都能获取 context 里面的状态属性。
- `useConnect` 使用这个自定义 hooks 的组件，可以获取改变状态的 dispatch 方法，还可以订阅 state ，被订阅的 state 发生变化，组件更新。

**如何让不同组件的自定义 hooks 共享状态并实现通信呢？**

首先不同组件的自定义 hooks ，可以通过 `useContext` 获得共有状态，而且还需要实现状态管理和组件通信，那么就需要一个状态调度中心来统一做这些事，可以称之为 `ReduxHooksStore` ，它具体做的事情如下：

- 全局管理 state， state 变化，通知对应组件更新。
- 收集使用 `useConnect` 组件的信息。组件销毁还要清除这些信息。
- 维护并传递负责更新的 `dispatch` 方法。
- 一些重要 api 要暴露给 context 上下文，传递给每一个 `useConnect`。

### useCreateStore 设计

首先 `useCreateStore` 是在靠近根部组件的位置的， 而且全局只需要一个，目的就是创建一个 `Store` ，并通过 `Provider` 传递下去。

使用：

```js
const store = useCreateStore( reducer , initState )
```

参数：

- `reducer` ：全局 reducer，纯函数，传入 state 和 action ，返回新的 state 。
- `initState` ： 初始化 state 。

返回值：为 store 暴露的主要功能函数。

### Store设计

Store 为上述所说的调度中心，接收全局 reducer ，内部维护状态 state ，负责通知更新 ，收集用 useConnect 的组件。

```js
const Store = new ReduxHooksStore(reducer,initState).exportStore()
```

参数：接收两个参数，透传 useCreateStore 的参数。

### useConnect设计

使用 useConnect 的组件，将获得 dispatch 函数，用于更新 state ，还可以通过第一个参数订阅 state ，被订阅的 state 改变 ，会让组件更新。

```js
// 订阅 state 中的 number 
const mapStoreToState = (state)=>({ number: state.number  })
const [ state , dispatch ] = useConnect(mapStoreToState)
```

参数：

- `mapStoreToState`：将 Store 中 state ，映射到组件的 state 中，可以做视图渲染使用。
- 如果没有第一个参数，那么只提供 `dispatch` 函数，不会订阅 state 变化带来的更新。

返回值：返回值是一个数组。

- 数组第一项：为映射的 state 的值。
- 数组第二项：为改变 state 的 `dispatch` 函数。

### useCreateStore

```js
export const ReduxContext = React.createContext(null)
/* 用于产生 reduxHooks 的 store */
export function useCreateStore(reducer,initState){
   const store = React.useRef(null)
   /* 如果存在——不需要重新实例化 Store */
   if(!store.current){
       store.current  = new ReduxHooksStore(reducer,initState).exportStore()
   }
   return store.current
}
```

`useCreateStore` 主要做的是：

- 接收 `reducer` 和 `initState` ，通过 ReduxHooksStore 产生一个 store ，不期望把 store 全部暴露给使用者，只需要暴露核心的方法，所以调用实例下的 `exportStore`抽离出核心方法。
- 使用一个 `useRef` 保存核心方法，传递给 `Provider` 。

### ReduxHooksStore

接下来看一下核心状态 ReduxHooksStore 状态管理者。

```js
import { unstable_batchedUpdates } from 'react-dom'
class ReduxHooksStore {
    constructor(reducer,initState){
       this.name = '__ReduxHooksStore__'
       this.id = 0
       this.reducer = reducer
       this.state = initState
       this.mapConnects = {}
    }
    /* 需要对外传递的接口 */
    exportStore=()=>{
        return {
            dispatch:this.dispatch.bind(this),
            subscribe:this.subscribe.bind(this),
            unSubscribe:this.unSubscribe.bind(this),
            getInitState:this.getInitState.bind(this)
        }
    }
    /* 获取初始化 state */
    getInitState=(mapStoreToState)=>{
        return mapStoreToState(this.state)
    }
    /* 更新需要更新的组件 */
    publicRender=()=>{
        unstable_batchedUpdates(()=>{ /* 批量更新 */
            Object.keys(this.mapConnects).forEach(name=>{
                const { update } = this.mapConnects[name]
                update(this.state)
            })
        })
    }
    /* 更新 state  */
    dispatch=(action)=>{
       this.state = this.reducer(this.state,action)
       // 批量更新
       this.publicRender()
    }
    /* 注册每个 connect  */
    subscribe=(connectCurrent)=>{
        const connectName = this.name + (++this.id)
        this.mapConnects[connectName] =  connectCurrent
        return connectName
    }
    /* 解除绑定 */
    unSubscribe=(connectName)=>{
        delete this.mapConnects[connectName]
    }
}
```

#### 状态

- `reducer`：这个 reducer 为全局的 reducer ，由 useCreateStore 传入。
- `state`：全局保存的状态 state ，每次执行 reducer 会得到新的 state 。
- `mapConnects`：里面保存每一个 useConnect 组件的更新函数。用于派发 state 改变带来的更新。

#### 方法

**负责初始化：**

- `getInitState`：这个方法给自定义 hooks 的 useConnect 使用，用于获取初始化的 state 。
- `exportStore`：这个方法用于把 ReduxHooksStore 提供的核心方法传递给每一个 useConnect 。

**负责绑定｜解绑：**

- `subscribe`： 绑定每一个自定义 hooks useConnect 。
- `unSubscribe`：解除绑定每一个 hooks 。

**负责更新：**

- `dispatch`：这个方法提供给业务组件层，每一个使用 useConnect 的组件可以通过 dispatch 方法改变 state ，内部原理是通过调用 reducer 产生一个新的 state 。
- `publicRender`：当 state 改变需要通知每一个使用 useConnect 的组件，这个方法就是通知更新，至于组件需不需要更新，那是 useConnect 内部需要处理的事情，这里还有一个细节，就是考虑到 dispatch 的触发场景可以是异步状态下，所以用 React-DOM 中 unstable_batchedUpdates 开启批量更新原则。

### useConnect

useConnect 是整个功能的核心部分，它要做的事情是获取最新的 `state` ，然后通过订阅函数 `mapStoreToState` 得到订阅的 state ，判断订阅的 state 是否发生变化。如果发生变化渲染最新的 state 。

```js
export function useConnect(mapStoreToState=()=>{}){
    /* 获取 Store 内部的重要函数 */
   const contextValue = React.useContext(ReduxContext)
   const { getInitState , subscribe ,unSubscribe , dispatch } = contextValue
   /* 用于传递给业务组件的 state  */
   const stateValue = React.useRef(getInitState(mapStoreToState))

   /* 渲染函数 */
   const [ , forceUpdate ] = React.useState()
   /* 产生 */
   const connectValue = React.useMemo(()=>{
       const state =  {
           /* 用于比较一次 dispatch 中，新的 state 和 之前的state 是否发生变化  */
           cacheState: stateValue.current,
           /* 更新函数 */
           update:function (newState) {
               /* 获取订阅的 state */
               const selectState = mapStoreToState(newState)
               /* 浅比较 state 是否发生变化，如果发生变化， */
               const isEqual = shallowEqual(state.cacheState,selectState)
               state.cacheState = selectState
               stateValue.current  = selectState
               if(!isEqual){
                   /* 更新 */
                   forceUpdate({})
               }
           }
       }
       return state
   },[ contextValue ]) // 将 contextValue 作为依赖项。

   React.useEffect(()=>{
       /* 组件挂载——注册 connect */
       const name =  subscribe(connectValue)
       return function (){
            /* 组件卸载 —— 解绑 connect */
           unSubscribe(name)
       }
   },[ connectValue ]) /* 将 connectValue 作为 useEffect 的依赖项 */

   return [ stateValue.current , dispatch ]
}
```

**初始化**

- 用 useContext 获取上下文中， ReduxHooksStore 提供的核心函数。
- 用 useRef 来保存得到的最新的 state 。
- 用 useState 产生一个更新函数 `forceUpdate` ，这个函数只是更新组件。

**注册｜解绑流程**

- 注册： 通过 `useEffect` 来向 ReduxHooksStore 中注册当前 useConnect 产生的 connectValue ，connectValue 是什么马上会讲到。subscribe 用于注册，会返回当前 connectValue 的唯一标识 name 。
- 解绑：在 useEffect 的销毁函数中，可以用调用 unSubscribe 传入 name 来解绑当前的 connectValue

**connectValue是否更新组件**

- connectValue ：真正地向 ReduxHooksStore 注册的状态，首先用 `useMemo` 来对 connectValue 做缓存，connectValue 为一个对象，里面的 cacheState 保留了上一次的 mapStoreToState 产生的 state ，还有一个负责更新的 update 函数。
- **更新流程** ： 当触发 `dispatch` 在 ReduxHooksStore 中，会让每一个 connectValue 的 update 都执行， update 会触发映射函数 `mapStoreToState` 来得到当前组件想要的 state 内容。然后通过 `shallowEqual` 浅比较新老 state 是否发生变化，如果发生变化，那么更新组件。完成整个流程。
- shallowEqual ： 这个浅比较就是 React 里面的浅比较，在第 11 章已经讲了其流程，这里就不讲了。

**分清依赖关系**

- 首先自定义 hooks useConnect 的依赖关系是上下文 contextValue 改变，那么说明 store 发生变化，所以重新通过 useMemo 产生新的 connectValue 。**所以 useMemo 依赖 contextValue。**
- connectValue 改变，那么需要解除原来的绑定关系，重新绑定。**useEffect 依赖 connectValue。**

**局限性**

整个 useConnect 有一些局限性，比如：

- 没有考虑 mapStoreToState 可变性，无法动态传入 mapStoreToState 。
- 浅比较，不能深层次比较引用数据类型。

### 使用与验证效果

接下来就是验证效果环节，我模拟了组件通信的场景。

#### 根部组件注入 Store

```js
import { ReduxContext , useConnect , useCreateStore } from './hooks/useRedux'
function  Index(){
    const [ isShow , setShow ] =  React.useState(true)
    console.log('index 渲染')
    return <div>
        <CompA />
        <CompB />
        <CompC />
        {isShow &&  <CompD />}
        <button onClick={() => setShow(!isShow)} >点击</button>
    </div>
}

function Root(){
    const store = useCreateStore(function(state,action){
        const { type , payload } =action
        if(type === 'setA' ){
            return {
                ...state,
                mesA:payload
            }
        }else if(type === 'setB'){
            return {
                ...state,
                mesB:payload
            }
        }else if(type === 'clear'){ //清空
            return  { mesA:'',mesB:'' }
        }
        else{
            return state
        }
    },
    { mesA:'111',mesB:'111' })
    return <div>
        <ReduxContext.Provider value={store} >
            <Index/>
        </ReduxContext.Provider>
    </div>
}
```

**Root根组件**

- 通过 useCreateStore 创建一个 store ，传入 reducer 和 初始化的值 `{ mesA:'111',mesB:'111' }`
- 用 Provider 传递 store。

**Index组件**

- 有四个子组件 CompA ， CompB ，CompC ，CompD 。其中 CompD 是 动态挂载的。

#### 业务组件使用

```js
function CompA(){
    const [ value ,setValue ] = useState('')
    const [state ,dispatch ] = useConnect((state)=> ({ mesB : state.mesB }) )
    return <div className="component_box" >
        <p> 组件A</p>
        <p>组件B对我说 ： {state.mesB} </p>
        <input onChange={(e)=>setValue(e.target.value)}
            placeholder="对B组件说"
        />
        <button onClick={()=> dispatch({ type:'setA' ,payload:value })} >确定</button>
    </div>
}

function CompB(){
    const [ value ,setValue ] = useState('')
    const [state ,dispatch ] = useConnect((state)=> ({ mesA : state.mesA }) )
    return <div className="component_box" >
        <p> 组件B</p>
        <p>组件A对我说 ： {state.mesA} </p>
        <input onChange={(e)=>setValue(e.target.value)}
            placeholder="对A组件说"
        />
        <button onClick={()=> dispatch({ type:'setB' ,payload:value })} >确定</button>
    </div>
}

function CompC(){
    const [state  ] = useConnect((state)=> ({ mes1 : state.mesA,mes2 : state.mesB }) )
    return <div className="component_box" >
        <p>组件A ： {state.mes1} </p>
        <p>组件B ： {state.mes2} </p>
    </div>
}

function CompD(){
    const [ ,dispatch  ] = useConnect( )
    console.log('D 组件更新')
    return <div className="component_box" >
        <button onClick={()=> dispatch({ type:'clear' })} > 清空 </button>
    </div>
}
```

- CompA 和 CompB 模拟组件双向通信。
- CompC 组件接收 CompA 和 CompB 通信内容，并映射到 `mes1 ，mes2` 属性上。
- CompD 没有 mapStoreToState ，没有订阅 state ，state 变化组件不会更新，只是用 dispatch 清空状态。

## React Hooks 总结

### useState - 状态管理

#### 原理

`useState` 用于在函数组件中添加状态。它返回当前状态和更新该状态的函数。每次调用更新函数时，React 会重新渲染组件并更新状态。

#### 使用场景

适用于组件内部的简单状态管理，如表单输入、按钮点击等。

#### 注意事项

- 状态更新是异步的，更新后的值不会立即反映在当前执行的代码中。
- 不适用于复杂的状态逻辑，复杂场景建议使用 `useReducer`。

#### 示例

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Current Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### useEffect - 副作用管理

#### 原理

`useEffect` 用于处理副作用，如数据获取、事件监听等。它允许我们在组件渲染后执行某些操作，可以通过传递依赖项来控制副作用的执行时机。

#### 使用场景

- 数据获取、API 调用。
- 订阅事件（如 WebSocket、DOM 事件等）。
- 设置定时器或执行清理任务。

#### 注意事项

- 副作用函数会在每次渲染后执行，如果依赖项发生变化，则会重新执行。
- 若不提供依赖数组，副作用会在每次渲染时执行。

#### 示例

```jsx
import React, { useState, useEffect } from 'react';

function FetchData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);  // 空依赖数组，表示只在组件挂载时执行一次

  return (
    <div>
      <h1>Data</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
}
```

---

### useContext - 全局状态管理

#### 原理

`useContext` 允许你在组件树中消费 Context 的值，避免层层传递 props。它返回当前的 Context 值，默认值会在 `Provider` 中提供。

#### 使用场景

- 跨多个组件传递全局数据，如主题、语言设置、用户认证信息等。
- 当需要在多个组件之间共享数据时，避免 props 层层传递。

#### 注意事项

- 只有在组件树的 `Provider` 内部的组件才能访问到 Context 值。
- 不适用于传递非常频繁变化的值，可能会导致性能问题。

#### 示例

```jsx
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function ThemedComponent() {
  const theme = useContext(ThemeContext);  // 获取当前主题

  return (
    <div style={{ background: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
      <p>This is a {theme} themed component!</p>
    </div>
  );
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedComponent />
    </ThemeContext.Provider>
  );
}
```

---

### useReducer - 复杂状态管理

#### 原理

`useReducer` 是 `useState` 的增强版，适用于处理复杂的状态逻辑。它类似于 Redux 中的 reducer 模式，返回当前状态和 dispatch 函数，后者用于派发操作来更新状态。

#### 使用场景

- 管理复杂的状态逻辑，尤其是多个状态字段之间有复杂的交互时。
- 适用于大型表单、多步骤的状态更新等场景。

#### 注意事项

- `useReducer` 的更新函数返回的是一个新的状态对象，因此你必须明确更新规则。
- 对于简单状态管理，不需要使用 `useReducer`，此时 `useState` 足够。

#### 示例

```jsx
import React, { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
    </div>
  );
}
```

---

### useCallback - 函数缓存

#### 原理

`useCallback` 返回一个缓存版本的函数，它只有在依赖项发生变化时才会更新。通常用于避免函数的重新创建，减少子组件的不必要重新渲染。

#### 使用场景

- 当函数被频繁传递给子组件时，避免每次渲染时重新创建函数，减少不必要的渲染。
- 对于性能敏感的组件，尤其是大量列表渲染时。

#### 注意事项

- 不要滥用 `useCallback`，仅在有性能瓶颈时才使用，过度使用会增加代码复杂性。

#### 示例

```jsx
import React, { useState, useCallback } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(count + 1);
  }, [count]);  // 只有在 count 变化时才会重新创建函数

  return <Child onIncrement={increment} />;
}

function Child({ onIncrement }) {
  return <button onClick={onIncrement}>Increment</button>;
}
```

---

### useMemo - 缓存计算结果

#### 原理

`useMemo` 用于缓存计算结果，它只有在依赖项变化时才会重新计算。适用于避免不必要的昂贵计算，提升性能。

#### 使用场景

- 在进行昂贵计算（如复杂的数据过滤、排序、计算等）时，避免每次渲染时都重新计算。
- 在大量列表渲染时缓存计算结果。

#### 注意事项

- 不要过度使用 `useMemo`，它本身也会消耗性能，仅在性能瓶颈明显时使用。

#### 示例

```jsx
import React, { useMemo, useState } from 'react';

function ExpensiveCalculation() {
  const [count, setCount] = useState(0);

  const calculatedValue = useMemo(() => {
    console.log('Calculating...');
    return count * 2;  // 假设这是一个昂贵的计算
  }, [count]);

  return (
    <div>
      <p>Calculated Value: {calculatedValue}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

---

### useRef - 引用存储

#### 原理

`useRef` 用于访问 DOM 元素或存储可变数据。它返回一个可以持久化的对象，其 `current` 属性可以保存任何值。与 `useState` 不同，`useRef` 更新不会触发组件重新渲染。

#### 使用场景

- 用于访问 DOM 元素，例如焦点控制、获取输入框的值等。
- 存储跨渲染周期的可变数据，如定时器 ID、前一个状态等。

#### 注意事项

- `useRef` 的值是不会触发组件重新渲染的，因此通常用于不需要更新 UI 的数据存储。

#### 示例

```jsx
import React, { useRef } from 'react';

function InputFocus() {
  const inputRef = useRef();

  const focusInput = () => {
    inputRef.current.focus();  // 访问 DOM 元素并聚焦
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}
```

### useImperativeHandle - 暴露方法与状态

`useImperativeHandle` 是 React 中用于与父组件通过 `ref` 共享实例方法和属性的 Hook。它允许你修改通过 `ref` 传递给父组件的值，这样你可以控制暴露给父组件的实例值，而不仅仅是 DOM 元素本身。通常情况下，`ref` 被用来引用 DOM 元素。然而，`useImperativeHandle` 允许你通过 `ref` 向父组件暴露自定义的实例方法或属性，而不仅仅是 DOM 引用。这对于实现封装性非常有用。

#### 原理

`useImperativeHandle` 允许你将组件内部的某些方法或状态暴露给父组件。与 `useRef` 相似，`useImperativeHandle` 也可以在渲染周期中使用，但是它提供了一个更精细的控制方式，可以使父组件仅访问你想要暴露的 API，而不会暴露整个组件的内部实现。

#### 使用场景

- **封装组件**：当你有一个组件需要向父组件暴露一些特定的操作方法，但又不希望父组件直接访问整个组件的内部状态时。
- **动态控制组件方法**：例如，暴露子组件的某些方法（如重置表单、获取输入框的值等），并允许父组件触发这些操作。
- **非 UI 操作**：当你希望父组件能触发子组件的某些方法，而这些方法不涉及直接渲染或状态更新时。

#### 注意事项

- `useImperativeHandle` 应该与 `forwardRef` 一起使用，因为它需要通过 `ref` 传递给父组件。
- `useImperativeHandle` 仅在通过 `ref` 访问组件时有效，`ref` 仅用于父组件与子组件之间的交互，子组件内部的状态或方法不会直接暴露给外部。
- 使用 `useImperativeHandle` 时，它不会导致组件重新渲染，因此不适合用于传递变化的 UI 状态。

#### 示例

下面是 `useImperativeHandle` 的一个完整示例，展示了如何通过 `ref` 向父组件暴露一些实例方法。

```jsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';

// 创建一个可转发 ref 的子组件
const Child = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);

  // 使用 useImperativeHandle 暴露给父组件的 API
  useImperativeHandle(ref, () => ({
    increment: () => setCount(prevCount => prevCount + 1),
    reset: () => setCount(0),
  }));

  return <div>Current Count: {count}</div>;
});

// 父组件
function Parent() {
  const childRef = React.useRef();

  const handleIncrement = () => {
    childRef.current.increment();  // 调用子组件的 increment 方法
  };

  const handleReset = () => {
    childRef.current.reset();  // 调用子组件的 reset 方法
  };

  return (
    <div>
      <Child ref={childRef} />
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

export default Parent;
```

1. `Child` 组件使用 `forwardRef` 来传递 `ref` 给子组件。`forwardRef` 使得 `Child` 可以接收外部 `ref`，并通过 `useImperativeHandle` 来暴露一些方法给父组件。
2. 在 `useImperativeHandle` 中，我们定义了 `increment` 和 `reset` 方法，它们将会被暴露给父组件。这些方法分别用于增加计数器和重置计数器。
3. 父组件通过 `childRef` 访问子组件，并调用 `increment` 和 `reset` 方法来控制子组件的状态。

### useTransition - 异步渲染优化

#### 原理

`useTransition` 用于标记一些状态更新为“过渡”状态，React 会把这些更新延迟到空闲时间再执行，从而避免阻塞用户交互。

#### 使用场景

- 在需要处理大量渲染操作时，避免在用户交互过程中导致界面卡顿。常用于复杂应用的异步渲染，如大量列表渲染时。

#### 注意事项

- `useTransition` 只对某些类型的更新起作用，如涉及 UI 渲染的更新，不会影响副作用。

#### 示例

```jsx
import React, { useState, useTransition } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();
  const [list, setList] = useState([]);

  const handleClick = () => {
    startTransition(() => {
      setList([...list, 'New Item']);  // 将更新包装在 startTransition 中
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Add Item</button>
      {isPending ? <p>Loading...</p> : <ul>{list.map(item => <li key={item}>{item}</li>)}</ul>}
    </div>
  );
}
```

---

### useDeferredValue - 延迟值更新

#### 原理

`useDeferredValue` 将更新延迟到浏览器的空闲时间段，允许 React 先渲染更重要的 UI，再延迟处理那些不影响交互体验的更新。

#### 使用场景

- 用于降低 UI 渲染延迟，如处理输入框的内容更新。

#### 注意事项

- `useDeferredValue` 在低优先级更新时能够有效减少卡顿现象，但不会阻止更新本身。

#### 示例

```jsx
import React, { useState, useDeferredValue } from 'react';

function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input 
        type="text" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Search..."
      />
      <p>Search results for: {deferredQuery}</p>
    </div>
  );
}
```

### useId - ID 标识符

`useId` 是 React 18 引入的一个新的 Hook，用于生成唯一的 ID 标识符。这个 Hook 的主要目的是在渲染过程中为每个组件生成稳定的、全局唯一的 ID，特别适用于需要唯一标识符的场景，例如为表单元素或可访问的标签生成 `id`

#### 原理

`useId` 返回一个唯一的 ID 字符串，这个 ID 会在组件的生命周期内保持一致，确保每次渲染时都能够获得相同的值。它在组件重新渲染时保证生成的 ID 是稳定的，因此可以避免因渲染过程中的 ID 重复而导致的问题。

#### 使用场景

- **表单元素**：为 `<label>` 和 `<input>` 元素生成唯一的 `id`，确保无障碍访问和标签与输入框的关联。
- **可访问性**：为组件生成唯一的 `id`，以便与 ARIA 属性（如 `aria-labelledby`、`aria-describedby`）一起使用。
- **组件库开发**：在开发通用组件时，确保每个组件的 `id` 唯一且不冲突。

#### 注意事项

- `useId` 生成的 ID 是基于组件实例的，因此它不会在每次渲染时变化，这对于生成稳定、唯一的 ID 是必要的。
- `useId` 仅用于生成唯一 ID，不适用于在多个组件实例中共享状态。

#### 示例

```jsx
import React, { useId } from 'react';

function Form() {
  const id = useId();  // 使用 useId 生成唯一 ID

  return (
    <div>
      <label htmlFor={id}>Username:</label>
      <input id={id} type="text" />
    </div>
  );
}
```

在这个例子中，`useId` 用来为 `<label>` 和 `<input>` 元素生成唯一的 ID，确保它们的关联，同时避免重复或冲突。

#### 具体优点

- **无障碍支持**：通过为表单元素、描述文本等提供唯一标识符，`useId` 可以提高可访问性，特别是在使用 `label` 和 `input` 时，确保用户能够通过 `for` 属性正确地将标签与输入框关联。
- **避免 ID 冲突**：在 React 渲染过程中，`useId` 保证了每个渲染组件的 ID 唯一，避免了手动管理 ID 导致的冲突问题。
- **跨服务器渲染一致性**：当应用涉及服务器端渲染（SSR）时，`useId` 保证客户端和服务器端渲染的 ID 一致，防止出现 hydration 错误。

`useId` 是一个专门用于生成唯一标识符的 Hook，极大简化了需要唯一 ID 的场景，特别是在表单和可访问性增强中，它能够避免手动管理 ID 时出现的重复或不一致问题，是 React 18 中对可访问性和组件化开发的重要补充。
