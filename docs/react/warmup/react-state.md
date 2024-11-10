# React State

State 的主要作用是用于组件保存、控制、修改自身的可变状态。State 在组件内部初始化，可以被组件自身修改，而外部不能访问也不能修改。你可以认为 State 是一个局部的、只能被组件自身控制的数据源。State 中状态可以通过 setState 方法进行更新，数据的更新会导致组件的重新渲染。并不是组件中用到的所有变量都是组件的状态！当存在多个组件共同依赖一个状态时，一般的做法是状态提升，将这个状态放到这几个组件的公共父组件中。

state 很“玄”，不同的执行环境下，或者不同的 React 模式下，State 更新流程都是不同的。React 是有多种模式的，基本平时用的都是 legacy 模式下的 React，除了 legacy 模式，还有 blocking 模式和 concurrent 模式， blocking 可以视为 concurrent 的优雅降级版本和过渡版本，React 最终目的是以 concurrent 模式作为默认版本，这个模式下会开启一些新功能。对于 concurrent 模式会采用不同的 State 更新逻辑。

本文 **主要围绕 legacy 模式下的 state** 。了解 React 更新流程，以及类组件 setState 和函数组件 useState 的诸多细节问题。

## 类组件中的 state

### setState 用法

React 项目中 UI 的改变来源于 state 改变，类组件中 setState 是更新组件，渲染视图的主要方式。

```js
setState(obj, callback) // obj 可以是 function 类型 或 object 对象类型

/* 第一个参数为 object 类型 */
this.setState({ number:1 }, () => {
    console.log(this.state.number) //获取最新的 number
})

/* 第一个参数为 function 类型 */
this.setState((state, props) => {
    return { number:1 } 
})
```

`setState(obj, callback)`：

- 第一个参数 obj：当 obj 为一个对象，则为即将合并的 state。当 obj 是一个函数，那么当前组件的 state 和 props 将作为参数，返回值用于合并新的 state。

- 第二个参数 callback ：callback 为一个函数，函数执行上下文中可以**获取当前 setState 更新后的最新 state 的值**，可以**作为依赖 state 变化的副作用函数**，可以**用来做一些基于 DOM 的操作**。

假如一次事件中触发一次如上 setState ，在 React 底层主要做了那些事呢？

- 首先，setState 会产生当前更新的优先级（老版本用 `expirationTime` ，新版本用 `lane` ）。
- 接下来 React 会从 fiber Root 根部 fiber 向下调和子节点，调和阶段将对比发生更新的地方，更新对比 `expirationTime` ，找到发生更新的组件，**合并 state，然后触发 render 函数**，得到新的 UI 视图层，完成 render 阶段。
- 接下来到 commit 阶段，**commit 阶段，替换真实 DOM** ，完成此次更新流程。
- 此时仍然**在 commit 阶段，会执行 setState 中 callback 函数**，如上的 `()=>{ console.log(this.state.number) }`，到此为止完成了一次 setState 全过程。
  
::: tip 记住一个主要任务的先后顺序，这对于弄清渲染过程可能会有帮助：
render 阶段 render 函数执行 -> commit 阶段真实 DOM 替换 -> setState 回调函数执行 callback 。
:::

类组件如何限制 state 更新视图，类组件如何限制 state 带来的更新作用？

1. `pureComponent` 可以对 state 和 props 进行**浅比较**，如果没有发生变化，那么组件不更新。
2. `shouldComponentUpdate` 生命周期可以**通过判断前后 state 变化来决定组件需不需要更新**，需要更新返回 true，否则返回 false。
3. `getDerivedStateFromProps` 是一个静态方法，用于在组件接收到新的 props 时更新 state。这个方法在组件实例化之后以及每次接收到新的 props 时都会被调用。它的主要作用是**在 props 发生变化时，根据新的 props 更新 state**，从而确保组件的状态与 props 保持一致，可用于防止不必要的 state 更新。

### setState 原理

对于类组件，类组件初始化过程中绑定了负责更新的 Updater 对象。调用 setState 方法，实际上是 React 底层调用 Updater 对象上的 `enqueueSetState` 方法。

因为要弄明白 state 更新机制，所以接下来要从两个方向分析。

1. enqueueSetState 到底做了些什么？
2. React 底层是如何进行批量更新的？

```js
// react-reconciler\src\ReactFiberClassComponent.js
enqueueSetState(inst: any, payload: any, callback) {
    const fiber = getInstance(inst);
    const eventTime = requestEventTime();
    const lane = requestUpdateLane(fiber);
    /* 每一次调用`setState`，react 都会创建一个 update 里面保存了 */
    const update = createUpdate(eventTime, lane);
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
       /* callback 可以理解为 setState 回调函数，第二个参数 */
      update.callback = callback;
    }

    const root = enqueueUpdate(fiber, update, lane);
    if (root !== null) {
      /* 开始调度更新 */
      scheduleUpdateOnFiber(root, fiber, lane, eventTime);
      entangleTransitions(root, fiber, lane);
    }

    if (__DEV__) {
      if (enableDebugTracing) {
        if (fiber.mode & DebugTracingMode) {
          const name = getComponentNameFromFiber(fiber) || 'Unknown';
          logStateUpdateScheduled(name, lane, payload);
        }
      }
    }

    if (enableSchedulingProfiler) {
      markStateUpdateScheduled(fiber, lane);
    }
  }
```

`enqueueSetState` 作用实际很简单，就是创建一个 update ，然后放入当前 fiber 对象的待更新队列中，最后开启调度更新，进入上述讲到的更新流程。那么问题来了，React 的 batchUpdate 批量更新是什么时候加上去的呢？

这就要提前聊一下事件系统了。正常 state 更新、UI 交互，都离不开用户的事件，比如点击事件，表单输入等，React 是采用事件合成的形式，每一个事件都是由 React 事件系统统一调度的，那么 State 批量更新正是和事件系统息息相关的。

```js
// react-dom/src/events/DOMLegacyEventPluginSystem.js
/* 在`legacy`模式下，所有的事件都将经过此函数同一处理 */
function dispatchEventForLegacyPluginEventSystem(){
    // handleTopLevel 事件处理函数
    batchedEventUpdates(handleTopLevel, bookKeeping);
}

// react-dom/src/events/ReactDOMUpdateBatching.js
function batchedEventUpdates(fn,a){
    /* 开启批量更新  */
   isBatchingEventUpdates = true;
  try {
    /* 这里执行了的事件处理函数， 比如在一次点击事件中触发setState,那么它将在这个函数内执行 */
    return batchedEventUpdatesImpl(fn, a, b);
  } finally {
    /* try 里面 return 不会影响 finally 执行  */
    /* 完成一次事件，批量更新  */
    isBatchingEventUpdates = false;
  }
}
```

在 React 事件执行之前通过 `isBatchingEventUpdates = true` 打开开关，开启事件批量更新，当该事件结束，再通过 `isBatchingEventUpdates = false`; 关闭开关，然后在 `scheduleUpdateOnFiber` 中根据这个开关来确定是否进行批量更新。

![setState3](/blog/images/react/setState3.png)

enqueueSetState 做了两件事：

- 将新的 state 放进组件的状态队列里；
- 用 enqueueUpdate 来处理将要更新的实例对象

`batchingStrategy`，该对象所具备的`isBatchingUpdates`属性直接决定了当下是要走更新流程，还是应该排队等待；其中的`batchedUpdates` 方法更是能够直接发起更新流程。`batchingStrategy` 正是 `React` 内部专门用于管控批量更新的对象，可以理解为它是一个“锁管理器”。

`isBatchingUpdates` 的初始值是 `false`，意味着“当前并未进行任何批量更新操作”。每当 React 调用 `batchedUpdate` 去执行更新动作时，会先把这个锁给“锁上”（置为 true），表明“现在正处于批量更新过程中”。当锁被“锁上”的时候，任何需要更新的组件都只能暂时进入 `dirtyComponents` 里排队等候下一次的批量更新，而不能随意“插队”。此处体现的“任务锁”的思想，是 React 面对大量状态仍然能够实现有序分批处理的基石。

而当 `setTimeout`,`Promise`等异步函数以及原生事件中（非 React 的合成事件，不属于 React 的事件机制）时，`isBatchingUpdates` 对其没有约束力，批量更新规则被打破。因为 `isBatchingUpdates`是在同步代码中变化的，而 `setTimeout` 的逻辑是异步执行的。当 `this.setState` 调用真正发生的时候，`isBatchingUpdates` 早已经被重置为了 `false`，这就使得当前场景下的 `setState` 具备了立刻发起同步更新的能力。所以咱们前面说的没错—— `setState` 并不是具备同步这种特性，只是在特定的情境下，它会从 React 的异步管控中“逃脱”掉。

`setState` 并不是单纯同步/异步的，它的表现会因调用场景的不同而不同：`在 React 钩子函数及合成事件中，它表现为异步`；`而在 setTimeout、setInterval 等函数中，包括在 DOM 原生事件中，它都表现为同步`。这种差异，本质上是`由 React 事务机制`和`批量更新机制`的工作方式来决定的。

下面看一个例子：

```js
export default class App extends React.Component{
  state = { number: 0 };
  handleClick = () => {
    this.setState({ number: this.state.number + 1 }, () => {
      console.log('callback1', this.state.number);
    });
    console.log(this.state.number);
    this.setState({ number: this.state.number + 1 }, () => {
      console.log('callback2', this.state.number);
    });
    console.log(this.state.number);
    this.setState({ number: this.state.number + 1 }, () => {
      console.log('callback3', this.state.number);
    });
    console.log(this.state.number);
  };
  render() {
    return (
      <div>
        {this.state.number}
        <button onClick={this.handleClick}>number++</button>
      </div>
    );
  }
} 

// 0, 0, 0, callback1 1 ,callback2 1 ,callback3 1
// react 18 环境下输出：0, 0, 0, callback1 1 ,callback2 1 ,callback3 1
// 结论：setState 是批量的，异步的。
```

![setState1](/blog/images/react/setState1.png)

那么，为什么异步操作里面的批量更新规则会被打破呢？比如用 promise 或者 setTimeout 在 handleClick 中这么写：

```js
export default class App extends React.Component {
  state = { number: 0 };
  handleClick = () => {
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 }, () => {
        console.log('callback1', this.state.number);
      });
      console.log(this.state.number);
      this.setState({ number: this.state.number + 1 }, () => {
        console.log('callback2', this.state.number);
      });
      console.log(this.state.number);
      this.setState({ number: this.state.number + 1 }, () => {
        console.log('callback3', this.state.number);
      });
      console.log(this.state.number);
    });
  };
  render() {
    return (
      <div>
        {this.state.number}
        <button onClick={this.handleClick}>number++</button>
      </div>
    );
  }
}

// callback1 1 -> 1 -> callback2 2 -> 2 -> callback3 3 -> 3
// react 18 环境下输出：0, 0, 0, callback1 1 ,callback2 1 ,callback3 1
// 结论：React 17之前 legacy 模式环境下，在异步操作中，批量更新规则会被打破，setState 是非批量的，但 React 18 下 setState 还是批量的，异步的。
```

那么在整个 React 上下文执行栈中就会变成如下图这样:

![setState2](/blog/images/react/setState2.png)

所以**异步操作里面的批量更新规则会被打破**。

那么，如何在如上异步环境下，继续开启批量更新模式呢？

React-Dom 中提供了批量更新方法 `unstable_batchedUpdates`，可以去手动批量更新，可以将上述 setTimeout 里面的内容做如下修改:

```js
import ReactDOM from 'react-dom'
const { unstable_batchedUpdates } = ReactDOM

 handleClick = () => {
    setTimeout(() => {
      unstable_batchedUpdates(() => {
        this.setState({ number: this.state.number + 1 }, () => {
          console.log('callback1', this.state.number);
        });
        console.log(this.state.number);
        this.setState({ number: this.state.number + 1 }, () => {
          console.log('callback2', this.state.number);
        });
        console.log(this.state.number);
        this.setState({ number: this.state.number + 1 }, () => {
          console.log('callback3', this.state.number);
        });
        console.log(this.state.number);
      });   
    });
  };

// 0 , 0 , 0 , callback1 1 , callback2 1 ,callback3 1
// react 18 环境下输出：0, 0, 0, callback1 1 ,callback2 1 ,callback3 1
// 结论：React 17之前 legacy 模式环境下，在异步操作中，批量更新规则会被打破。但 React-Dom 中提供了批量更新方法 `unstable_batchedUpdates`，可以去手动批量更新，使其在异步操作中 setState 批量更新。
```

在实际工作中，`unstable_batchedUpdates` 可以用于 Ajax 数据交互之后，合并多次 setState，或者是多次 useState 。原因很简单，所有的数据交互都是在异步环境下，如果没有批量更新处理，一次数据交互多次改变 state 会促使视图多次渲染。 `unstable_batchedUpdates` 允许你在事件循环的单个 tick 中将多个更新打包在一起，以便 React 只进行一次渲染。通常用于当你在 React 的事件处理之外进行状态更新时，比如在异步回调或者原生 DOM 事件监听器中。

那么如何提升更新优先级呢？

React-dom 提供了 `flushSync` ，flushSync 可以将回调函数中的更新任务，放在一个较高的优先级中。React 设定了很多不同优先级的更新任务。如果一次更新任务在 flushSync 回调函数内部，那么将获得一个较高优先级的更新。

接下来，将上述 handleClick 改版如下样子：

```js
handleClick=()=>{
    setTimeout(() => {
      this.setState({ number: 1 }, () => {
        console.log('callback1', this.state.number);
      });
    });
    console.log('1', this.state.number)
    this.setState({ number: 2 });
    console.log('2', this.state.number)
    ReactDOM.flushSync(() => {
      this.setState({ number: 3 });
      console.log('3', this.state.number)
    });
    console.log('4', this.state.number)
    this.setState({ number: 4 });
    console.log('5', this.state.number)
}
render(){
   console.log('render', this.state.number)
   return ...
}

// 初次渲染 render 函数先打印 render 0，点击后 setState 更新输出：render 3 -> render 4 -> render 1 (最终显示 1)
// 第一次点击 handleClick 的打印输出：1 0 -> 2 0 -> 3 0 -> 4 3 -> 5 3 -> callback1 1
// 第一次最终的打印：render 0 -> 1 0 -> 2 0 -> 3 0 -> render 3 -> 4 3 -> 5 3 -> render 4 -> render 1 -> callback1 1 (注意 callback，实在 commit 阶段，DOM 更新之后执行)
// 第二次点击 handleClick 的打印输出：1 1 -> 2 1 -> 3 1 -> 4 3 -> 5 3 -> callback1 1 （后续点击永远输出这个）
// 第二次最终的打印：render 1 -> 1 1 -> 2 1 -> 3 1 -> render 3 -> 4 3 -> 5 3 -> render 4 -> render 1 -> callback1 1（后续点击永远输出这个）

//与 react 18 环境下输出一致，只是 render 会渲染两次，存在重复渲染
```

- 首先更具异步批量更新原则，打印 1，this.setState({ number: 2 }) 入队，打印 2，this.setState({ number: 3 }) 入队，打印 3。接着要打印 4 的，但 flushSync 设定了一个高优先级的更新（此时需要优先渲染），所以 2 和 3 更新合并，被批量更新到 3 ，所以优先渲染出 3（打印 render 3）。
- 接着打印 4，此时 state 已经更新为 3 了；this.setState({ number: 4 }) 入队，打印 4；开始批量更新，此时对中只有 4，所以渲染出 4（render 4）。
- 最后更新 setTimeout 中的 number = 1，渲染出 1（render 1）。

综上所述，得出结论， React 同一级别更新优先级关系是:

**flushSync 中的 setState > 正常执行上下文中 setState > setTimeout ，Promise 中的 setState。**

::: tip flushSync 补充说明
flushSync 在同步条件下，会合并之前的 setState | useState，可以理解成，如果发现了 flushSync ，就会先执行更新渲染，如果之前有未更新的 setState ｜ useState ，就会一起合并了，所以就解释了如上，2 和 3 被批量更新到 3 ，所以 3 先被打印。
:::

## 函数组件中的 state

### useState 用法

```js
// api: [ state , dispatch ] = useState(initData)

// initData 为非函数的情况:
const [ number , setNumber ] = React.useState(0)

// initData 为函数的情况:
 const [ number , setNumber ] = React.useState(()=>{
  /*  props 中 a = 1 state 为 0-1 随机数 ， a = 2 state 为 1 -10随机数 ， 否则，state 为 1 - 100 随机数   */
  if(props.a === 1) return Math.random() 
  if(props.a === 2) return Math.ceil(Math.random() * 10 )
  return Math.ceil(Math.random() * 100 ) 
})

// 对于 dispatch 的参数（即 setNumber 的入参）,也有两种情况：

// 第一种非函数情况，此时将作为新的值，赋予给 state，作为下一次渲染使用;
const [ number , setNumber ] = React.useState(0)
/* 一个点击事件 */
const handleClick=()=>{
   setNumber(1)
   setNumber(2)
   setNumber(3)
}

// 第二种是函数的情况，如果 dispatch 的参数为一个函数，这里可以称它为reducer，reducer 参数，是上一次返回最新的 state，返回值作为新的 state。
const [ number , setNumber ] = React.useState(0)
const handleClick=()=>{
   setNumber((state)=> state + 1)  // state - > 0 + 1 = 1
   setNumber(8)  // state - > 8
   setNumber((state)=> state + 1)  // state - > 8 + 1 = 9
}
```

- state，目的提供给 UI ，作为渲染视图的数据源。
- dispatch 改变 state 的函数，可以理解为推动函数组件渲染的渲染函数。
- initData 有两种情况，第一种情况是非函数，将作为 state 初始化的值。 第二种情况是函数，函数的返回值作为 useState 初始化的值。

如何监听 state 变化？

**类组件 setState 中，有第二个参数 callback 或者是生命周期 `componentDidUpdate` 可以检测监听到 state 改变或是组件更新**。那么在函数组件中，如何怎么监听 state 变化呢？这个时候就**需要 `useEffect` 出场**了，通常可以把 state 作为依赖项传入 useEffect 第二个参数 deps ，但是注意 useEffect 初始化会默认执行一次。

```js
export default function Index(props){
    const [ number , setNumber ] = React.useState(0)
    /* 监听 number 变化 */
    React.useEffect(()=>{
        console.log('监听number变化，此时的number是:  ' + number )
    },[ number ])

    const handleClick = ()=>{
        /** 高优先级更新 **/
        ReactDOM.flushSync(()=>{
            setNumber(2) 
        })
        /* 批量更新 */
        setNumber(1) 
        /* 滞后更新 ，批量更新规则被打破 */
        setTimeout(()=>{
            setNumber(3) 
        })
       
    }
    console.log('render', number)
    return <div>
        <span>{ number }</span>
        <button onClick={ handleClick }>number++</button>
    </div>
}
```

dispatch 更新特点

上述讲的批量更新和 flushSync ，在函数组件中，dispatch 更新效果和类组件是一样的，但是 useState 有一点值得注意，就是当调用改变 state 的函数 dispatch，**在本次函数执行上下文中，是获取不到最新的 state 值的**，把上述 demo 如下这么改：

```js
const [ number , setNumber ] = React.useState(0)
const handleClick = ()=>{
    ReactDOM.flushSync(()=>{
        setNumber(2) 
        console.log(number) 
    })
    setNumber(1) 
    console.log(number)
    setTimeout(()=>{
        setNumber(3) 
        console.log(number)
    })   
}

//函数组件(无论是那种模式下)与类组件不一样： 0 0 0
```

函数组件更新就是函数的执行，在函数一次执行过程中，**函数内部所有变量重新声明**，所以改变的 state ，只有在下一次函数组件执行时才会被更新。所以在如上同一个函数执行上下文中，number 一直为 0，无论怎么打印，都拿不到最新的 state 。

1. **`ReactDOM.flushSync(() => { setNumber(2); console.log(number); })`**:
   - flushSync 强制立即执行状态更新，并重新渲染组件。
   - `console.log(number)` 会打印 0（因为函数组件重新执行了，内部变量重新声明了，重置了），因为 number 的值还没有更新。
   - 组件重新渲染，number 更新为 2。
2. **`setNumber(1); console.log(number);`**:
   - `setNumber(1)` 被加入到状态更新队列中，但不会立即执行。
   - `console.log(number)` 会打印 0，因为 number 的值仍然是 0。
   - 由于 flushSync 之前已经触发了一次重新渲染，这次 setNumber(1) 会在下一个事件循环中生效。
3. **`setTimeout(() => { setNumber(3); console.log(number); }, 0)`**:
   - setTimeout 将回调函数放入任务队列中，稍后执行。
   - 当回调函数执行时，number 的值仍然是 0，因为 `setNumber(1)` 还没有生效。
   - `setNumber(3)` 会更新 number 为 3，但 `console.log(number)` 会打印 0。

useState 注意事项

在使用 useState 的 dispatchAction 更新 state 的时候，记得不要传入相同的 state，这样会使视图不更新。比如下面这么写：

```js
export default function Index(){
    const [ state  , dispatchState ] = useState({ name:'alien' })
    const  handleClick = ()=>{ // 点击按钮，视图没有更新。
        state.name = 'Alien'
        dispatchState(state) // 直接改变 `state`，在内存中指向的地址相同。
    }
    return <div>
         <span> { state.name }</span>
        <button onClick={ handleClick }  >changeName++</button>
    </div>
}
```

当点击按钮后，发现视图没有改变，为什么会造成这个原因呢？

在 useState 的 dispatchAction 处理逻辑中，会浅比较两次 state ，发现 state 相同，不会开启更新调度任务； demo 中两次 state 指向了相同的内存空间，所以默认为 state 相等，就不会发生视图更新了。

解决问题： 把上述的 `dispatchState` 改成 `dispatchState({...state})` 根本解决了问题，浅拷贝了对象，重新申请了一个内存空间。

### useState 原理

::: tip 如何透彻理解 setState 和 useState 的更新原理?
setState 和 useState 的更新原理一定要结合 React 运行时环境，React 渲染流程，render 阶段与 commit 阶段，React 生命周期，任务调度等核心流程整体理解。
:::

## 问题

### Q1. 类组件中的 setState 和函数组件中的 useState 有什么异同？

**相同点**：

首先从原理角度出发，setState和 useState 更新视图，底层都调用了 `scheduleUpdateOnFiber` 方法，而且事件驱动情况下都有**批量更新规则**。

**不同点**：

- 在不是 `pureComponent` 组件模式下， setState 不会浅比较两次 state 的值，只要调用 setState，在没有其他优化手段的前提下，就会执行更新。但是 useState 中的 dispatchAction 会默认比较两次 state 是否相同，然后决定是否更新组件。

- setState 有专门监听 state 变化的回调函数 callback，可以获取最新state；但是在函数组件中，只能通过 useEffect 来执行 state 变化引起的副作用。

- setState 在底层处理逻辑上主要是和老 state 进行合并处理，而 useState 更倾向于重新赋值。

### Q2. 为什么 React 推荐组件的状态是不可变对象呢？

- 一方面是因为不可变对象方便管理和调试。

- 另一方面是出于性能考虑，当对象组件状态都是不可变对象时，我们在组件的 `shouldComponentUpdate` 方法中，仅需要比较状态的引用就可以判断状态是否真的改变，从而避免不必要的 `render()` 调用。当我们使用 React 提供的 `PureComponent` 时，更是要保证组件状态是不可变对象，否则在组件的 `shouldComponentUpdate` 方法中，状态比较就可能出现错误，因为 `PureComponent` 执行的是浅比较（也就是比较对象的引用）。

### Q3. 几道 state 相关的代码输出题

通过几道 state 相关的代码输出题，彻底理解 setState 和 useState 的用法、原理和注意事项：

#### state 注意事项 - state 前后的浅比较更新

```jsx
// 第一道
const [arr, setArr] = useState([]);
const test = () => {
  arr.push({});
};
console.log(arr); // 未打印（setArr 未执行且没有触发 render）
return <div onClick={test}>App</div>

// 第二道
const [arr, setArr] = useState([]);
const test = () => {
  arr.push({});
  setArr(arr);
};
console.log(arr); // 未打印（arr 内存地址没有改变，所以没有监听到变化，setArr 没有触发 render）
return <div onClick={test}>App</div>

// 第三道
const [arr, setArr] = useState([]);
const test = () => {
  setArr([]);
};
console.log(arr); // 打印（ [] !== []，内存地址变了，触发 render）
return <div onClick={test}>App</div>
```

**结论：**

- 在使用 `useState` 的 `dispatchAction` 更新 state 的时候，记得**不要传入相同的 state**，这样不会更新视图。
- 原因：在 `useState` 的 `dispatchAction` 处理逻辑中，会**浅比较前后两次 state（比较内存地址）** ，发现 state 相同，不会开启更新调度任务。
- 解决：改成 `dispatchAction({...state})` ，**浅拷贝了对象，重新申请了一个内存空间**。

#### dispatch 注意事项 - 非函数和函数情况

```js
// 非函数
// 非函数情况，此时将作为新的值，赋予给 state，作为下一次渲染使用
// 例1：直接传递对象的 setState 会被合并成一次
componentDidMount() {
  this.setState({ index: this.state.index + 1 }, () => {
    console.log(this.state.index);  // 1
  })
  this.setState({ index: this.state.index + 1 }, () => {
    console.log(this.state.index); // 1
  })
}
// 例2：
const [ number , setNumber ] = React.useState(0)
const handleClick = () => {
  setNumber(2) // => number = 2
  setNumber(number + 1) // => number = 0 + 1 = 1
  setNumber(number + 1) // => number = 0 + 1 = 1
};
// 例3：
const [count, setCount] = useState(0);
const test = () => {
  setTimeout(() => {
    setCount(count + 1);
  }, 3000);
  console.log(count);
};
return <div onClick={test}>App</div>;
// 输出：0->0->0->...->1
// 原因：闭包旧值，每次 setCount 的 count为 0+1

// 函数
// 函数的情况，如果 dispatch 的参数为一个函数，这里可以称它为 reducer 参数，是上一次返回最新的 state，返回值作为新的 state。
// 例1：使用函数传递 state 不会被合并
componentDidMount() {
  this.setState((preState) => ({ index: preState.index + 1 }), () => {
    console.log(this.state.index); // 2
  })
  this.setState(preState => ({ index: preState.index + 1 }), () => {
    console.log(this.state.index); // 2
  })
}
// 例2：
const [ number , setNumber ] = React.useState(0)
const handleClick = () => {
  setNumber((state) => state + 1) // => number = 0 + 1 = 1
  setNumber((state) => state + 1) // => number = 1 + 1 = 2
  setNumber(8)  // state - > 8
  setNumber((state)=> state + 1)  // number - > 8 + 1 = 9
};
// 例3：
const [count, setCount] = useState(0);
const test = () => {
  setTimeout(() => {
    setCount(count => count + 1);
  }, 3000);
  console.log(count);
};
return <div onClick={test}>App</div>;
// 输出：0->1->1->...->1
```

**结论：**

- 非函数情况下：setNumber 将参数作为新的值赋予 state，下一次渲染时使用。直接传递对象的 setstate 会被合并成一次。
- 函数情况下：传入函数的入参是上一次返回的最新 state，而函数的返回值作为新的值赋予 state，下一次渲染使用。使用函数传递 state 不会被合并。

#### setState 批量更新？同步异步？

```jsx
// class 组件 - setState
// 情况1：react 17及之前且在非 setTimeout、事件监听器等异步操作中
// 钩子函数和 React 合成事件中
class App extends Component {
    constructor() {
        super();
        this.state = {
            count: 0
        }
    }
    componentDidMount() {
        this.setState({
            count: 1
        });
        console.log(this.state.count);
        this.setState({
            count: 2
        });
        console.log(this.state.count);
    }
    render() {
        console.log('render', this.state.count); // 最终是 2
        return <div>{this.state.count}</div>;
    }
}
// 输出：render 0 -> 0 0 -> render 2
// 结论：setState 是异步的，批量的，合并 state，然后触发 render 函数，得到新的 UI 视图层，完成 render 阶段。两次打印都是 0，而且两次 setState 只触发了一次 render，加上最开始的 render，一共两次，打印 0、2。说明此情况下 setState 是异步的。

// 情况2：react 17及之前且在 setTimeout、事件监听器等异步操作中
class App extends Component {
    constructor() {
        super();
        this.state = {
            count: 0
        }
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState({
                count: 1
            });
            console.log(this.state.count);
            this.setState({
                count: 2
            });
            console.log(this.state.count);  
        });
    }
    render() {
        console.log('render', this.state.count); // 最终是 2
        return <div>{this.state.count}</div>;
    }
}
// 输出：render 0 -> render 1 -> 1 -> render 2 -> 2
// 结论：异步操作里面的批量更新规则会被打破。setState 在 setTimeout 异步函数中同步修改了 state，且然后每次都触发了渲染，一共 render 3 次，分别是 0、1、2。说明 react 17及之前且在 setTimeout、事件监听器等异步操作中 setState 是同步的，非批量的，每次 setState 后 state 马上变，每次修改 state 都会 render。
// 手动批量更新：React-Dom 中提供了批量更新方法 `unstable_batchedUpdates`，可以去手动批量更新，使其在异步操作中 setState 批量更新。

// function 函数组件 - useState
// 情况1：react 17及之前且在非 setTimeout、事件监听器等异步函数或原生事件中
function App(){
    const [count, setCount] = useState(0);
    useEffect(() => {
        setCount(1);
        setCount(2);
        setCount(3);
    }, [])
    console.log('render:', count); // 最终是 3
    return <div>{count}</div>;
}
// 输出：render 0 ->  render 3
// 结论：react 17及之前，与 setState 一样，三次 setState 只触发了一次 render，此条件下 useState 是异步的，批量的，合并 state，然后触发 render 函数，得到新的 UI 视图层，完成 render 阶段。

// 情况2：react 17及之前且在 setTimeout、事件监听器等异步函数或原生事件中
function App(){
    const [count, setCount] = useState(0);
     useEffect(() => {
      setTimeout(() => {
        setCount(1);
        setCount(2);
        setCount(3);
      });
    }, [])
    console.log('render:', count);// 最终是 3
    return <div>{count}</div>;
}
// 输出：render 0 -> render 1 -> render 2 -> render 3
// 结论：react 17及之前，异步操作里面的批量更新规则会被打破。与 setState 一样，在 setTimeout 里，useState 是同步的，非批量的，每次 setState 后 state 马上变，每次修改 state 都会 render。
```

**结论：**

- 在 react  legacy 模式下的环境下，在非异步操作条件下（钩子函数和合成事件中），setState 是异步的，批量的，每次 setState 后 state 不会马上变（调用 setState 不会立即更新），在合并 state，然后触发 render 函数，得到新的 UI 视图层，完成 render 阶段。

  - 在 react 的生命周期和合成事件中，react 仍然处于他的更新机制中，这时 isBranchUpdate 为 true。
  - 这时无论调用多少次 setState，都会不会执行更新，而是将要更新的 state 存入 `_pendingStateQueue`，将要更新的组件存入 `dirtyComponent`。
  - 当上一次更新机制执行完毕，以生命周期为例，所有组件，即最顶层组件 `didmount` 后会将 `isBranchUpdate` 设置为 false。最后才执行之前累积的 setState。所有组件使用的是同一套更新机制，当所有组件 didmount 后，父组件 didmount，然后执行更新。更新时会把每个组件的更新合并，每个组件只会触发一次更新的生命周期。
  - 在实际的 React 运行时中，`setState` 异步的实现方式有点类似于 Vue 的 `$nextTick` 和浏览器里的 `Event-Loop`：`每来一个 setState，就把它塞进一个队列里“攒起来”`。等时机成熟，再把“攒起来”的 `state` 结果做合并，最后`只针对最新的 state 值走一次更新流程`。这个过程，叫作“`批量更新`”。这正是 `setState` 异步的一个重要的动机——避免频繁的 `re-render`。
  - 就算我们在 React 中写了这样一个 100 次的 setState 循环，也只是会增加 state 任务入队的次数，并不会带来频繁的 re-render。当 100 次调用结束后，仅仅是 state 的任务队列内容发生了变化， state 本身并不会立刻改变。这与 Vue 的 `$nextTick` 的理念完全一致。

- 在 react  legacy 模式下的环境下，在异步操作条件下（异步函数和原生事件中），异步操作里面的 setState 批量更新规则会被打破，setState 是同步的，非批量的，每次 setState 后 state 马上变，每次修改 state 都会 render。

  - 由执行机制看，setState 本身并不是异步的，而是如果在调用 setState 时，如果 react 正处于更新过程，当前更新会被暂存，等上一次更新执行后在执行，这个过程给人一种异步的假象。
  - 在生命周期，根据 JS 的异步机制，会将异步函数先暂存，等所有同步代码执行完毕后在执行，这时上一次更新过程已经执行完毕，isBranchUpdate 被设置为 false，根据上面的流程，这时再调用 setState 即可立即执行更新，拿到更新结果。

- `setState` 并不是单纯同步/异步的，它的表现会因调用场景的不同而不同：`在 React 钩子函数及合成事件中，它表现为异步`；`而在 setTimeout、setInterval 等函数中，包括在 DOM 原生事件中，它都表现为同步`。这种差异，本质上是`由 React 事务机制`和`批量更新机制`的工作方式来决定的。
- useState 与 setState 一致。
- 在 react 18 Concurrent 模式下，所有的 setState 或 useState 都是异步批量执行。

#### 手动批量及提高优先级

```js
// 手动批量更新 - unstable_batchedUpdates
export default class App extends React.Component{
  state = { number: 0 };
   handleClick = () => {
    setTimeout(() => {
      unstable_batchedUpdates(() => {
        this.setState({ number: this.state.number + 1 }, () => {
        console.log('callback1', this.state.number);
      });
      console.log('1', this.state.number);
      this.setState({ number: this.state.number + 1 }, () => {
        console.log('callback2', this.state.number);
      });
      console.log('2', this.state.number);
      this.setState({ number: this.state.number + 1 }, () => {
        console.log('callback3', this.state.number);
      });
      console.log('3', this.state.number);
      });
    });
  };
  render() {
    console.log('render', this.state.number)
    return (
      <div>
        {this.state.number}
        <button onClick={this.handleClick}>number++</button>
      </div>
    );
  }
}
//无论哪个版本哪种模式都是异步批量更新: render 0 -> 1 0 -> 2 0 -> 3 0 -> render 1 -> callback1 1 -> callback2 1 -> callback3 1

// 提高任务优先级 - flushSync
export default class App extends React.Component{
  state = { number: 0 };
  handleClick=()=>{
      setTimeout(() => {
        this.setState({ number: 1 });
      });
      console.log('1', this.state.number)
      this.setState({ number: 2 });
      console.log('2', this.state.number)
      ReactDOM.flushSync(() => {
        this.setState({ number: 3 });
        console.log('3', this.state.number)
      });
      console.log('4', this.state.number)
      this.setState({ number: 4 });
      console.log('5', this.state.number)
  }
  render() {
    console.log('render', this.state.number)
    return (
      <div>
        {this.state.number}
        <button onClick={this.handleClick}>number++</button>
      </div>
    );
  }
}
// render 函数中 初次渲染 render 0 ，点击后 setState 更新输出：render 3 -> render 4 -> render 1 
// handleClick 的打印输出：1 0 -> 2 0 -> 3 0 -> 4 3 -> 5 3
// 第一次的打印：render 0 -> 1 0 -> 2 0 -> 3 0 -> render 3 -> 4 3 -> 5 3 -> render 4 -> render 1
// 后续打印：render 1 -> 1 1 -> 2 1 -> 3 1 -> render 3 -> 4 3 -> 5 3 -> render 4 -> render 1
```

**结论：**

- React-Dom 中提供了批量更新方法 unstable_batchedUpdates，可以去手动批量更新。
- React-dom 提供了 flushSync ，flushSync 可以将回调函数中的更新任务，放在一个较高的优先级中。React 设定了很多不同优先级的更新任务。如果一次更新任务在 flushSync 回调函数内部，那么将获得一个较高优先级的更新。
- 在 react 18 Concurrent 模式下，所有的 setState 或 useState 都是异步批量执行。

#### componentDidMount调用 setstate

::: tip 官方
在componentDidMount() 中，你可以立即调用 setState()。它将会触发一次额外的渲染，但是它将在浏览器刷新屏幕之前发生。这保证了在此情况下即使 render() 将会调用两次，用户也不会看到中间状态。**谨慎使用这一模式，因为它常导致性能问题**。在大多数情况下，你可以**在 constructor() 中使用赋值初始状态来代替**。然而，有些情况下必须这样，比如像模态框和工具提示框。这时，你需要先测量这些 DOM 节点，才能渲染依赖尺寸或者位置的某些东西。
:::

- 不推荐直接在 componentDidMount 直接调用 setState，componentDidMount 本身处于一次更新中，我们又调用了一次setState，就会在未来再进行一次render，造成不必要的性能浪费，大多数情况可以设置初始值来搞定。
- 当然在 componentDidMount 我们可以**调用接口，再在回调中去修改 state**，这是正确的做法。
- 当 state 初始值依赖 dom 属性时，在 componentDidMount 中 setState 是无法避免的。

#### componentWillUpdate 或 componentDidUpdate 调用 setstate

这两个生命周期中不能调用 setState。在它们里面调用 setState 会造成死循环，导致程序崩溃。推荐在调用 setState 时使用函数传递 state 值，在回调函数中获取最新更新后的 state。

::: tip 提示
在 React 生命周期章节，还会结合 setState 进一步加深理解 setState 的更新流程。
:::

[React 的 setState 是同步还是异步](https://juejin.cn/post/7108362046369955847)

[setState 到底是同步的，还是异步的](https://mp.weixin.qq.com/s/my2Jx7pcbVYnaCWklAzKXA)

[你真的懂useState吗？useState源码解析](https://juejin.cn/post/7184353148620767269)

[setState 的执行机制](https://juejin.cn/post/6844903781813993486)

[带你深入了解 useState](https://mp.weixin.qq.com/s/nYX8Lnj7uwGHAeL5rEnRRg)

[关于 useState 的一切](https://mp.weixin.qq.com/s/htuG8JDQ0HRmztil3pP_tg)
