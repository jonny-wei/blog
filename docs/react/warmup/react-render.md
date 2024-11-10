# React 渲染优化

对于 React 渲染，不要仅仅理解成类组件触发 render 函数或者函数组件本身执行。事实上，从调度更新任务到调和 fiber，再到浏览器渲染真实 DOM，每一个环节都是渲染的一部分。每个环节的性能优化，React 在底层已经处理了大部分优化细节，包括**设立任务优先级、异步调度、diff算法、时间分片**都是 React 为了提高性能，提升用户体验采取的手段。所以，开发者只需要告诉 React 哪些组件需要更新，哪些组件不需要更新。于是，React 提供了 **PureComponent，shouldComponentUpdated，memo** 等优化手段。

组件在一次更新中，类组件执行 render ，执行函数组件 renderWithHooks （ renderWithHook 内部执行 React 函数组件本身），他们的作用是什么呢？ 他们真实渲染了 DOM 了吗？显然不是，真实 DOM 是在 commit 阶段挂载的。render的作用是根据一次更新中产生的新状态值，通过 React.createElement ，替换成新的状态，得到新的 React element 对象，新的 element 对象上，保存了最新状态值。 createElement 会产生一个全新的 props。

接下来，React 会调和由 render 函数产生 chidlren，将子代 element 变成 fiber（这个过程如果存在 alternate，会复用 alternate 进行克隆，如果没有 alternate ，那么将创建一个），将 props 变成 pendingProps ，至此当前组件更新完毕。然后如果 children 是组件，会继续重复上一步，直到全部 fiber 调和完毕。完成 render 阶段。

## React 渲染控制

React 提供了几种控制 render 的方式。说到对render 的控制，究其本质，主要有以下两种方式：

- 第一种就是从父组件直接隔断子组件的渲染，经典的就是 memo，缓存 element 对象。
- 第二种就是组件从自身来控制是否 render ，比如：PureComponent ，shouldComponentUpdate 。

### 缓存 React.element 对象

`React.element` 对象的缓存是一种父对子的渲染控制方案，来源于一种情况，父组件 render ，子组件有没有必要跟着父组件一起 render ，如果没有必要，则就需要阻断子组件更新。

```js
/* 子组件 */
function Children ({ number }){
    console.log('子组件渲染')
    return <div>let us learn React!  { number } </div>
}
/* 父组件 */
export default class Index extends React.Component{
    state={
        numberA:0,
        numberB:0,
    }
    render(){
        return <div>
            <Children number={ this.state.numberA } />
           <button onClick={ ()=> this.setState({ numberA:this.state.numberA + 1 }) } >改变numberA -{ this.state.numberA } </button>
           <button onClick={ ()=> this.setState({ numberB:this.state.numberB + 1 }) } >改变numberB -{ this.state.numberB }</button>
        </div>
     }

}
```

对于子组件 Children ，只有 props 中 numberA 更新才是有用的， numberB 更新带来渲染，Children 根本不需要。但是如果不处理子组件的话，就会出现如下情况。无论改变 numberA 还是改变 numberB ，子组件都会重新渲染，显然这不是想要的结果。

- 首先把 Children 组件对应的 element 对象，挂载到组件实例的 component 属性下。
- 通过 controllComponentRender 控制渲染 Children 组件，如果 numberA 变化了，证明 Children的props 变化了，那么通过 cloneElement 返回新的 element 对象，并重新赋值给 component ，如果没有变化，那么直接返回缓存的 component 。

推荐在 React 类组价中这么写，推荐在函数组件里用 useMemo

```js
export default function Index(){
    const [ numberA , setNumberA ] = React.useState(0)
    const [ numberB , setNumberB ] = React.useState(0)
    return <div>
        { useMemo(()=> <Children number={numberA} />,[ numberA ]) }
        <button onClick={ ()=> setNumberA(numberA + 1) } >改变numberA</button>
        <button onClick={ ()=> setNumberB(numberB + 1) } >改变numberB</button>
    </div>
}
```

用 React.useMemo 可以达到同样的效果， 需要更新的值 numberA 放在 deps 中，numberA 改变，重新形成element对象，否则通过 useMemo 拿到上次的缓存值。达到如上同样效果。比起类组件，我更推荐函数组件用 useMemo 这种方式。

### useMemo

```js
const cacheSomething = useMemo(create,deps)
```

- create：第一个参数为一个函数，函数的返回值作为缓存值，如上 demo 中把 Children 对应的 element 对象，缓存起来。
- deps： 第二个参数为一个数组，存放当前 useMemo 的依赖项，在函数组件下一次执行的时候，会对比 deps 依赖项里面的状态，是否有改变，如果有改变重新执行 create ，得到新的缓存值。
- cacheSomething：返回值，执行 create 的返回值。如果 deps 中有依赖项改变，返回的重新执行 create 产生的值，否则取上一次缓存值。

**原理**

useMemo 会记录上一次执行 create 的返回值，并把它绑定在函数组件对应的 fiber 对象上，只要组件不销毁，缓存值就一直存在，但是 deps 中如果有一项改变，就会重新执行 create ，返回值作为新的值记录到 fiber 对象上。

**场景**：

- 可以缓存 element 对象，从而达到按条件渲染组件，优化性能的作用。
- 如果组件中不期望每次 render 都重新计算一些值,可以利用 useMemo 把它缓存起来。
- 可以把函数和属性缓存起来，作为 PureComponent 的绑定方法，或者配合其他Hooks一起使用。

利用 element 的缓存，实现了控制子组件不必要的渲染，究其原理是什么呢？

原理其实很简单，上述每次执行 render 本质上 createElement 会产生一个新的 props，这个 props 将作为对应 fiber 的 pendingProps ，在此 fiber 更新调和阶段，React 会对比 fiber 上老 oldProps 和新的 newProp （ pendingProps ）是否相等，如果相等函数组件就会放弃子组件的调和更新，从而子组件不会重新渲染；如果上述把 element 对象缓存起来，上面 props 也就和 fiber 上 oldProps 指向相同的内存空间，也就是相等，从而跳过了本次更新。

### PureComponent

纯组件是一种发自组件本身的渲染优化策略，当开发类组件选择了继承 PureComponent ，就意味这要遵循其渲染规则。规则就是**浅比较 state 和 props 是否相等**。

```js
/* 纯组件本身 */
class Children extends React.PureComponent{
    state={
        name:'alien',
        age:18,
        obj:{
            number:1,
        }
    }
    changeObjNumber=()=>{
        const { obj } = this.state
        obj.number++
        this.setState({ obj })
    }
    render(){
        console.log('组件渲染')
        return <div  >
           <div> 组件本身改变state </div>
           <button onClick={() => this.setState({ name:'alien' }) } >state相同情况</button>
           <button onClick={() => this.setState({ age:this.state.age + 1  }) }>state不同情况</button>
           <button onClick={ this.changeObjNumber } >state为引用数据类型时候</button>
           <div>hello,my name is alien,let us learn React!</div>
        </div>
    }
}
/* 父组件 */
export default function Home (){
    const [ numberA , setNumberA ] = React.useState(0)
    const [ numberB , setNumberB ] = React.useState(0)
    return <div>
        <div> 父组件改变props </div>
        <button onClick={ ()=> setNumberA(numberA + 1) } >改变numberA</button>
        <button onClick={ ()=> setNumberB(numberB + 1) } >改变numberB</button>
        <Children number={numberA}  /> 
    </div>
}
```

- 对于 props ，PureComponent 会浅比较 props 是否发生改变，再决定是否渲染组件，所以只有点击 numberA 才会促使组件重新渲染。
- 对于 state ，如上也会浅比较处理，当上述触发 ‘ state 相同情况’ 按钮时，组件没有渲染。
- 浅比较只会比较基础数据类型，对于引用类型，比如 demo 中 state 的 obj ，单纯的改变 obj 下属性是不会促使组件更新的，因为浅比较两次 obj 还是指向同一个内存空间，想要解决这个问题也容易，浅拷贝就可以解决，将如上 changeObjNumber 这么修改。这样就是重新创建了一个 obj ，所以浅比较会不相等，组件就会更新了。

```js
changeObjNumber=()=>{
        const { obj } = this.state
        obj.number++
        this.setState({ obj:{...obj} })
    }
```

#### PureComponent 原理及其浅比较原则

首先当选择基于 PureComponent 继承的组件。原型链上会有 isPureReactComponent 属性。

```js
/* pureComponentPrototype 纯组件构造函数的 prototype 对象，绑定isPureReactComponent 属性。 */
pureComponentPrototype.isPureReactComponent = true;
```

isPureReactComponent 这个属性在更新组件 updateClassInstance 方法中使用的，在生命周期章节中已经讲过，相信看过的同学都会有印象，这个函数在更新组件的时候被调用，在这个函数内部，有一个专门负责检查是否更新的函数 checkShouldComponentUpdate 。

```js
// react/react-reconciler/ReactFiberClassComponent.js
function checkShouldComponentUpdate(){
     if (typeof instance.shouldComponentUpdate === 'function') {
         return instance.shouldComponentUpdate(newProps,newState,nextContext)  /* shouldComponentUpdate 逻辑 */
     } 
    if (ctor.prototype && ctor.prototype.isPureReactComponent) {
        return  !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
    }
}
```

- isPureReactComponent 就是判断当前组件是不是纯组件的，如果是 PureComponent 会浅比较 props 和 state 是否相等。
- 还有一点值得注意的就是 shouldComponentUpdate 的权重，会大于 PureComponent。
- shallowEqual 是如何浅比较的呢，由于我不想在章节中写过多的源码，我在这里就直接描述过程了。

shallowEqual 浅比较流程：

1. 第一步，首先会直接比较新老 props 或者新老 state 是否相等。如果相等那么不更新组件。
2. 第二步，判断新老 state 或者 props ，有不是对象或者为 null 的，那么直接返回 false ，更新组件。
3. 第三步，通过 Object.keys 将新老 props 或者新老 state 的属性名 key 变成数组，判断数组的长度是否相等，如果不相等，证明有属性增加或者减少，那么更新组件。
4. 第四步，遍历老 props 或者老 state ，判断对应的新 props 或新 state ，有没有与之对应并且相等的（这个相等是浅比较），如果有一个不对应或者不相等，那么直接返回 false ，更新组件。 到此为止，浅比较流程结束， PureComponent 就是这么做渲染节流优化的。

#### PureComponent 注意事项

PureComponent 可以让组件自发的做一层性能上的调优，但是，父组件给是 PureComponent 的子组件绑定事件要格外小心，避免两种情况发生：

1. 避免使用箭头函数。不要给是 PureComponent 子组件绑定箭头函数，因为父组件每一次 render ，如果是箭头函数绑定的话，都会重新生成一个新的箭头函数， PureComponent 对比新老 props 时候，因为是新的函数，所以会判断不想等，而让组件直接渲染，PureComponent 作用终会失效。

```js
class Index extends React.PureComponent{}

export default class Father extends React.Component{
    render=()=> <Index callback={()=>{}}   />
}
```

2. PureComponent 的父组件是函数组件的情况，绑定函数要用 useCallback 或者 useMemo 处理。这种情况还是很容易发生的，就是在用 class + function 组件开发项目的时候，如果父组件是函数，子组件是 PureComponent ，那么绑定函数要小心，因为函数组件每一次执行，如果不处理，还会声明一个新的函数，所以 PureComponent 对比同样会失效，如下情况:

```js
class Index extends React.PureComponent{}
export default function (){
    const callback = function handerCallback(){} /* 每一次函数组件执行重新声明一个新的callback，PureComponent浅比较会认为不想等，促使组件更新  */
    return <Index callback={callback}  />
}
```

综上可以用 useCallback 或者 useMemo 解决这个问题，useCallback 首选，这个 hooks 初衷就是为了解决这种情况的。

```js
export default function (){
    const callback = React.useCallback(function handerCallback(){},[])
    return <Index callback={callback}  />
}
```

useCallback 接受二个参数，第一个参数就是需要缓存的函数，第二个参数为deps, deps 中依赖项改变返回新的函数。如上处理之后，就能从根本上解决 PureComponent 失效问题。

### shouldComponentUpdate

有的时候，把控制渲染，性能调优交给 React 组件本身处理显然是靠不住的，React 需要提供给使用者一种更灵活配置的自定义渲染方案，使用者可以自己决定是否更新当前组件，shouldComponentUpdate 就能达到这种效果

```js
class Index extends React.Component{ //子组件
    state={
        stateNumA:0,
        stateNumB:0
    }
    shouldComponentUpdate(newProp,newState,newContext){
        if(newProp.propsNumA !== this.props.propsNumA || newState.stateNumA !== this.state.stateNumA ){
            return true /* 只有当 props 中 propsNumA 和 state 中 stateNumA 变化时，更新组件  */
        }
        return false 
    }
    render(){
        console.log('组件渲染')
        const { stateNumA ,stateNumB } = this.state
        return <div>
            <button onClick={ ()=> this.setState({ stateNumA: stateNumA + 1 }) } >改变state中numA</button>
            <button onClick={ ()=> this.setState({ stateNumB: stateNumB + 1 }) } >改变stata中numB</button>
            <div>hello,let us learn React!</div>
        </div>
    }
}
export default function Home(){ // 父组件
    const [ numberA , setNumberA ] = React.useState(0)
    const [ numberB , setNumberB ] = React.useState(0)
    return <div>
        <button onClick={ ()=> setNumberA(numberA + 1) } >改变props中numA</button>
        <button onClick={ ()=> setNumberB(numberB + 1) } >改变props中numB</button>
        <Index propsNumA={numberA}  propsNumB={numberB}   />
    </div>
}
```

shouldComponentUpdate 可以根据传入的新的 props 和 state ，或者 newContext 来确定是否更新组件。如上面例子，只有当 props 中 propsNumA 属性和 state 中 stateNumA 改变的时候，组件才渲染。但是有一种情况就是如果子组件的 props 是引用数据类型，比如 object ，还是不能直观比较是否相等。那么如果想有对比新老属性相等，怎么对比呢，而且很多情况下，组件中数据可能来源于服务端交互，对于属性结构是未知的。

immutable.js 可以解决此问题，immutable.js 不可变的状态，对 Immutable 对象的任何修改或添加删除操作都会返回一个新的 Immutable 对象。鉴于这个功能，所以可以把需要对比的 props 或者 state 数据变成 Immutable 对象，通过对比 Immutable 是否相等，来证明状态是否改变，从而确定是否更新组件。

### React.memo

React.memo 可作为一种容器化的控制渲染方案，可以对比 props 变化，来决定是否渲染组件

React.memo 接受两个参数，第一个参数 Component 原始组件本身，第二个参数 compare 是一个函数，可以根据一次更新中 props 是否相同决定原始组件是否重新渲染。

memo 的几个特点是：

- React.memo: 第二个参数 返回 true 组件不渲染 ， 返回 false 组件重新渲染。和 shouldComponentUpdate 相反,shouldComponentUpdate : 返回 true 组件渲染 ， 返回 false 组件不渲染。
- memo 当二个参数 compare 不存在时，会用浅比较原则处理 props ，相当于仅比较 props 版本的 pureComponent 。
- memo 同样适合类组件和函数组件。

被 memo 包裹的组件，element 会被打成 REACT_MEMO_TYPE 类型的 element 标签，在 element 变成 fiber 的时候， fiber 会被标记成 MemoComponent 的类型。

```js
function memo(type,compare){
  const elementType = {
    $$typeof: REACT_MEMO_TYPE, 
    type,  // 我们的组件
    compare: compare === undefined ? null : compare,  //第二个参数，一个函数用于判断prop，控制更新方向。
  };
  return elementType
}
```

那么对于 MemoComponent React 内部又是如何处理的呢？首先 React 对 MemoComponent 类型的 fiber 有单独的更新处理逻辑 updateMemoComponent

memo 主要逻辑是

- 通过 memo 第二个参数，判断是否执行更新，如果没有那么第二个参数，那么以浅比较 props 为 diff 规则。如果相等，当前 fiber 完成工作，停止向下调和节点，所以被包裹的组件即将不更新。
- memo 可以理解为包了一层的高阶组件，它的阻断更新机制，是通过控制下一级 children ，也就是 memo 包装的组件，是否继续调和渲染，来达到目的的。

### 打破渲染限制

1. forceUpdate。类组件更新如果调用的是 forceUpdate 而不是 setState ，会跳过 PureComponent 的浅比较和 shouldComponentUpdate 自定义比较。其原理是组件中调用 forceUpdate 时候，全局会开启一个 hasForceUpdate 的开关。当组件更新的时候，检查这个开关是否打开，如果打开，就直接跳过 shouldUpdate 。

2. context穿透，上述的几种方式，都不能本质上阻断 context 改变，而带来的渲染穿透，所以开发者在使用 Context 要格外小心，既然选择了消费 context ，就要承担 context 改变，带来的更新作用。

### 渲染控制流程图

![渲染控制流程图](images/react/渲染控制流程图.png)

## 对 Render 的思考

### 有没有必要在乎组件不必要渲染

在正常情况下，无须过分在乎 React 没有必要的渲染，要理解执行 render 不等于真正的浏览器渲染视图，render 阶段执行是在 js 当中，js 中运行代码远快于浏览器的 Rendering 和 Painting 的，更何况 React 还提供了 diff 算法等手段，去复用真实 DOM 。

### 什么时候需要注意渲染节流

但是对于以下情况，值得开发者注意，需要采用渲染节流：

- 第一种情况数据可视化的模块组件（展示了大量的数据），这种情况比较小心因为一次更新，可能伴随大量的 diff ，数据量越大也就越浪费性能，所以对于数据展示模块组件，有必要采取 memo ， shouldComponentUpdate 等方案控制自身组件渲染。

- 第二种情况含有大量表单的页面，React 一般会采用受控组件的模式去管理表单数据层，表单数据层完全托管于 props 或是 state ，而用户操作表单往往是频繁的，需要频繁改变数据层，所以很有可能让整个页面组件高频率 render 。

- 第三种情况就是越是靠近 app root 根组件越值得注意，根组件渲染会波及到整个组件树重新 render ，子组件 render ，一是浪费性能，二是可能执行 useEffect ，componentWillReceiveProps 等钩子，造成意想不到的情况发生。

### 一些开发中的细节问题

- 开发过程中对于大量数据展示的模块，开发者有必要用 shouldComponentUpdate ，PureComponent来优化性能。
- 对于表单控件，最好办法单独抽离组件，独自管理自己的数据层，这样可以让 state 改变，波及的范围更小。
- 如果需要更精致化渲染，可以配合 immutable.js 。
- 组件颗粒化，配合 memo 等 api ，可以制定私有化的渲染空间。

## 异步渲染

Suspense 是 React 提出的一种同步的代码来实现异步操作的方案。Suspense 让组件‘等待’异步操作，异步请求结束后在进行组件的渲染，也就是所谓的异步渲染

Suspense 是组件，有一个 fallback 属性，用来代替当 Suspense 处于 loading 状态下渲染的内容，Suspense 的 children 就是异步组件。多个异步组件可以用 Suspense 嵌套使用。

```js
// 子组件
function UserInfo() {
  // 获取用户数据信息，然后再渲染组件。
  const user = getUserInfo();
  return <h1>{user.name}</h1>;
}
// 父组件
export default function Index(){
    return <Suspense fallback={<h1>Loading...</h1>}>
        <UserInfo/>
    </Suspense>
}
```

Suspense 包裹异步渲染组件 UserInfo ，当 UserInfo 处于数据加载状态下，展示 Suspense 中 fallback 的内容。异步渲染的 UserInfo 组件可以直接通过 getUserInfo 请求数据，直接用数据 user 进行渲染，很显然现在是做不到的。现在的异步请求方式比较繁琐，主要是是通过类组件 componentDidMount 或者函数组件 useEffect 进行数据交互，获得数据后通过调用 setState 或 useState 改变 state 触发视图的更新。

- 统模式：挂载组件-> 请求数据 -> 再渲染组件。
- 异步模式：请求数据-> 渲染组件。

那么异步渲染相比传统数据交互相比好处就是：

- 不再需要 componentDidMount 或 useEffect 配合做数据交互，也不会因为数据交互后，改变 state 而产生的二次更新作用。
- 代码逻辑更简单，清晰。

## 动态加载（懒加载）

现在的 Suspense 配合 React.lazy 可以实现动态加载功能。

```js
const LazyComponent = React.lazy(()=>import('./text'))
```

React.lazy 接受一个函数，这个函数需要动态调用 import() 。它必须返回一个 Promise ，该 Promise 需要 resolve 一个 default export 的 React 组件。

```js
const LazyComponent = React.lazy(() => import('./test.js'))

export default function Index(){
   return <Suspense fallback={<div>loading...</div>} >
       <LazyComponent />
   </Suspense>
}
```

用 React.lazy 动态引入 test.js 里面的组件，配合 Suspense 实现动态加载组件效果。这样很利于代码分割，不会让初始化的时候加载大量的文件。

### React.lazy 和 Suspense 实现动态加载原理

整个 render 过程都是同步执行一气呵成的，但是在 Suspense 异步组件情况下允许调用 Render => 发现异步请求 => 悬停，等待异步请求完毕 => 再次渲染展示数据。

#### Suspense 原理

Suspense 在执行内部可以通过 try{}catch{} 方式捕获异常，这个异常通常是一个 Promise ，可以在这个 Promise 中进行数据请求工作，Suspense 内部会处理这个 Promise ，Promise 结束后，Suspense 会再一次重新 render 把数据渲染出来，达到异步渲染的效果。

![异步渲染1.png](/blog/images/react/异步渲染1.png)

#### React.lazy 原理

lazy 内部模拟一个 promiseA 规范场景。完全可以理解 React.lazy 用 Promise 模拟了一个请求数据的过程，但是请求的结果不是数据，而是一个动态的组件。下一次渲染就直接渲染这个组件，所以是 React.lazy 利用 Suspense 接收 Promise ，执行 Promise ，然后再渲染这个特性做到动态加载的。

```js
function lazy(ctor){
    return {
         $$typeof: REACT_LAZY_TYPE,
         _payload:{
            _status: -1,  //初始化状态
            _result: ctor,
         },
         _init:function(payload){
             if(payload._status===-1){ /* 第一次执行会走这里  */
                const ctor = payload._result;
                const thenable = ctor();
                payload._status = Pending;
                payload._result = thenable;
                thenable.then((moduleObject)=>{
                    const defaultExport = moduleObject.default;
                    resolved._status = Resolved; // 1 成功状态
                    resolved._result = defaultExport;/* defaultExport 为我们动态加载的组件本身  */ 
                })
             }
            if(payload._status === Resolved){ // 成功状态
                return payload._result;
            }
            else {  //第一次会抛出Promise异常给Suspense
                throw payload._result; 
            }
         }
    }
}
```

React.lazy 包裹的组件会标记 REACT_LAZY_TYPE 类型的 element，在调和阶段会变成 LazyComponent 类型的 fiber ，React 对 LazyComponent 会有单独的处理逻辑：

- 第一次渲染首先会执行 init 方法，里面会执行 lazy 的第一个函数，得到一个Promise，绑定 Promise.then 成功回调，回调里得到将要渲染组件 defaultExport ，这里要注意的是，如上面的函数当第二个 if 判断的时候，因为此时状态不是 Resolved ，所以会走 else ，抛出异常 Promise，抛出异常会让当前渲染终止。

- 这个异常 Promise 会被 Suspense 捕获到，Suspense 会处理 Promise ，Promise 执行成功回调得到 defaultExport（将想要渲染组件），然后 Susponse 发起第二次渲染，第二次 init 方法已经是 Resolved 成功状态，那么直接返回 result 也就是真正渲染的组件。这时候就可以正常渲染组件了。

![异步渲染2.png](/blog/images/react/异步渲染2.png)

## 渲染错误边界

React 组件渲染过程如果有一个环节出现问题，就会导致整个组件渲染失败，那么整个组件的 UI 层都会显示不出来。如果越靠近 APP 应用的根组件，渲染过程中出现问题造成的影响就越大，有可能直接造成白屏的情况。举个例子：

```js
function ErrorTest(){
    return 
}
function Test(){
    return <div>let us learn React!</div>
}

 class Index extends React.Component{ 
    componentDidCatch(...arg){
       console.log(arg)
    }
   render(){  
      return <div>
          <ErrorTest />
          <div> hello, my name is alien! </div>
          <Test />
      </div>
   }
}
```

造成错误，由于 ErrorTest 不是一个真正的组件但是却用来渲染，结果会造成整个 Index 组件渲染异常，Test 也会受到牵连，UI 都不能正常显示。

为了防止如上的渲染异常情况 React 增加了 componentDidCatch 和 static getDerivedStateFromError() 两个额外的生命周期，去挽救由于渲染阶段出现问题造成 UI 界面无法显示的情况。

### componentDidCatch

componentDidCatch 可以捕获异常，它接受两个参数：

1. error —— 抛出的错误。
2. info —— 带有 componentStack key 的对象，其中包含有关组件引发错误的栈信息。componentDidCatch 中可以再次触发 setState，来降级UI渲染，componentDidCatch() 会在commit阶段被调用，因此允许执行副作用。

```js
 class Index extends React.Component{
   state={
       hasError:false
   }  
   componentDidCatch(...arg){
       uploadErrorLog(arg)  /* 上传错误日志 */
       this.setState({  /* 降级UI */
           hasError:true
       })
   }
   render(){  
      const { hasError } =this.state
      return <div>
          {  hasError ? <div>组件出现错误</div> : <ErrorTest />  }
          <div> hello, my name is alien! </div>
          <Test />
      </div>
   }
}
```

componentDidCatch 作用：

1. 可以调用 setState 促使组件渲染，并做一些错误拦截功能。
2. 监控组件，发生错误，上报错误日志。

### getDerivedStateFromError

React更期望用 getDerivedStateFromError 代替 componentDidCatch 用于处理渲染异常的情况。getDerivedStateFromError 是静态方法，内部不能调用 setState。getDerivedStateFromError 返回的值可以合并到 state，作为渲染使用。用 getDerivedStateFromError 解决如上的情况。

```js
 class Index extends React.Component{
   state={
       hasError:false
   }  
   static getDerivedStateFromError(){
       return { hasError:true }
   }
   render(){  
      /* 如上 */
   }
}
```

如果存在 getDerivedStateFromError 生命周期钩子，那么将不需要 componentDidCatch 生命周期再降级 ui。

## 从 diff children 看 key 的合理使用

大部分优化环节 React 都自己在内部处理了。但是有一种情况也值得开发者注意，那就是列表中 key 的使用。合理的使用 key 有助于能精准的找到用于新节点复用的老节点。 React 是如何 diff children 的呢。

首先 React 在一次更新中当发现通过 render 得到的 children 如果是一个数组的话。就会调用 reconcileChildrenArray 来调和子代 fiber ，整个对比的流程就是在这个函数中进行的。

### diff children 流程

#### 1. 遍历新 children ，复用 oldFiber

```js
// react-reconciler/src/ReactChildFiber.js
function reconcileChildrenArray(){
    /* 第一步  */
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {  
        if (oldFiber.index > newIdx) {
            nextOldFiber = oldFiber;
            oldFiber = null;
        } else {
            nextOldFiber = oldFiber.sibling;
        }
        const newFiber = updateSlot(returnFiber,oldFiber,newChildren[newIdx],expirationTime,);
        if (newFiber === null) { break }
        // ..一些其他逻辑
        }  
        if (shouldTrackSideEffects) {  // shouldTrackSideEffects 为更新流程。
            if (oldFiber && newFiber.alternate === null) { /* 找到了与新节点对应的fiber，但是不能复用，那么直接删除老节点 */
                deleteChild(returnFiber, oldFiber);
            }
        }
    }
}
```

- 第一步对于 React.createElement 产生新的 child 组成的数组，首先会遍历数组，因为 fiber 对于同一级兄弟节点是用 sibling 指针指向，所以在遍历children 遍历，sibling 指针同时移动，找到与 child 对应的 oldFiber 。
- 然后通过调用 updateSlot ，updateSlot 内部会判断当前的 tag 和 key 是否匹配，如果匹配复用老 fiber 形成新的 fiber ，如果不匹配，返回 null ，此时 newFiber 等于 null 。
- 如果是处于更新流程，找到与新节点对应的老 fiber ，但是不能复用 alternate === null ，那么会删除老 fiber 。

#### 2. 统一删除 oldfiber

```js
if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
}
```

第二步适用于以下情况，当第一步结束完 newIdx === newChildren.length 此时证明所有 newChild 已经全部被遍历完，那么剩下没有遍历 oldFiber 也就没有用了，那么调用 deleteRemainingChildren 统一删除剩余 oldFiber 。

**节点删除**:

oldChild: A B C D
newChild: A B A , B 经过第一步遍历复制完成，那么 newChild 遍历完成，此时 C D 已经没有用了，那么统一删除 C D。

#### 3. 统一创建 newFiber

```js
if(oldFiber === null){
   for (; newIdx < newChildren.length; newIdx++) {
       const newFiber = createChild(returnFiber,newChildren[newIdx],expirationTime,)
       // ...
   }
}
```

**节点增加**

oldChild: A B
newChild: A B C D A B 经过第一步遍历复制完，oldFiber 没有可以复用的了，那么直接创建 C D

#### 4. 针对发生移动和更复杂的情况

```js
const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(existingChildren,returnFiber)
    /* 从mapRemainingChildren删掉已经复用oldFiber */
}
```

- mapRemainingChildren 返回一个 map ，map 里存放剩余的老的 fiber 和对应的 key (或 index )的映射关系。
- 接下来遍历剩下没有处理的 Children ，通过 updateFromMap ，判断 mapRemainingChildren 中有没有可以复用 oldFiber ，如果有，那么复用，如果没有，新创建一个 newFiber 。
- 复用的 oldFiber 会从 mapRemainingChildren 删掉。

**节点位置改变**:

oldChild: A B C D
newChild: A B D C 如上 A B 在第一步被有效复用，第二步和第三步不符合，直接进行第四步，C D 被完全复用，existingChildren 为空。

#### 5. 删除剩余没有复用的 oldFiber

```js
if (shouldTrackSideEffects) {
    /* 移除没有复用到的oldFiber */
    existingChildren.forEach(child => deleteChild(returnFiber, child));
}
```

最后一步，对于没有复用的 oldFiber ，统一删除处理。

**复杂情况(删除 + 新增 + 移动)**

oldChild: A B C D
newChild: A E D B
首先 A 节点，在第一步被复用，接下来直接到第四步，遍历 newChild ，E被创建，D B 从 existingChildren 中被复用，existingChildren 还剩一个 C 在第五步会删除 C ，完成整个流程。

::: tip 关于 dff Child 思考和 key 的使用

- React diffChild 时间复杂度 O(n^3) 优化到 O(n)。
- React key 最好选择唯一性的 id。如果选择 Index 作为 key ，如果元素发生移动，那么从移动节点开始，接下来的 fiber 都不能做得到合理的复用。 index 拼接其他字段也会造成相同的效果。
:::

## 模拟异步组件功能

React.lazy + Susponse 来完全模拟实现一个异步组件。

### 实现效果

- 异步请求数据，请求完数据再挂载组件。没有加载完数据显示 loading 效果。
- 可量化生产。

### 主要思路

可以使用 React.lazy 实现动态加载，那么可以先请求数据，然后再加载组件，这时候以 props 形式将数据传递给目标组件，实现异步效果。

### 模拟实现

```js
/**
 * 
 * @param {*} Component  需要异步数据的component 
 * @param {*} api        请求数据接口,返回Promise，可以再then中获取与后端交互的数据
 * @returns 
 */
function AysncComponent(Component,api){
    const AysncComponentPromise = () => new Promise(async (resolve)=>{
          const data = await api()
          resolve({
              default: (props) => <Component rdata={data} { ...props}  />
          })
    })
    return React.lazy(AysncComponentPromise)
}
```

- 用 AysncComponent 作为一个 HOC 包装组件，接受两个参数，第一个参数为当前组件，第二个参数为请求数据的 api 。
- 声明一个函数给 React.lazy 作为回调函数，React.lazy 要求这个函数必须是返回一个 Promise 。在 Promise 里面通过调用 api 请求数据，然后根据返回来的数据 rdata 渲染组件，别忘了接受并传递 props 。

### 使用

```js
/* 数据模拟 */
const getData=()=>{
    return new Promise((resolve)=>{
        //模拟异步
        setTimeout(() => {
             resolve({
                 name:'alien',
                 say:'let us learn React!'
             })
        }, 1000)
    })
}
/* 测试异步组件 */
function Test({ rdata  , age}){
    const { name , say } = rdata
    console.log('组件渲染')
    return <div>
        <div> hello , my name is { name } </div>
        <div>age : { age } </div>
        <div> i want to say { say } </div>
    </div>
}
/* 父组件 */
export default class Index extends React.Component{
    LazyTest = AysncComponent(Test,getData) /* 需要每一次在组件内部声明，保证每次父组件挂载，都会重新请求数据 ，防止内存泄漏。 */
    render(){
        const { LazyTest } = this
        return <div>
           <Suspense fallback={<div>loading...</div>} >
              <LazyTest age={18}  />
          </Suspense>
        </div>
    }
}
```

### 小结

1. 需要约定好接受数据格式rdata和数据交互形式api。
2. 因为数据本质是用闭包缓存的，所以绑定需要在在组件内部，这样才能保证每次父组件挂载，都会重新请求数据，另外也防止内存泄漏情况发生。
3. 数据源更新维护困难。

## 时间分片

时间分片主要解决，初次加载，一次性渲染大量数据造成的卡顿现象。浏览器执 js 速度要比渲染 DOM 速度快的多。

案例实践：一次性加载 20000 个元素块，元素块的位置和颜色是随机的。

**不做任何优化处理的 Demo**：

```js
// 父组件在 componentDidMount 模拟数据交互，用ref获取真实的DOM元素容器的宽高，渲染列表。
class Index extends React.Component{
    state={
        dataList:[],                  // 数据源列表
        renderList:[],                // 渲染列表
        position:{ width:0,height:0 } // 位置信息
    }
    box = React.createRef()
    componentDidMount(){
        const { offsetHeight , offsetWidth } = this.box.current
        const originList = new Array(20000).fill(1)
        this.setState({
            position: { height:offsetHeight,width:offsetWidth },
            dataList:originList,
            renderList:originList,
        })
    }
    render(){
        const { renderList, position } = this.state
        return <div className="bigData_index" ref={this.box}  >
            {
                renderList.map((item,index)=><Circle  position={ position } key={index}  /> )
            }
        </div>
    }
}
/* 控制展示Index */
export default ()=>{
    const [show, setShow] = useState(false)
    const [ btnShow, setBtnShow ] = useState(true)
    const handleClick=()=>{
        setBtnShow(false)
        setTimeout(()=>{ setShow(true) },[])
    } 
    return <div>
        { btnShow &&  <button onClick={handleClick} >show</button> } 
        { show && <Index />  }
    </div>
}

// 子组件接受父组件的位置范围信息。并通过 useMemo 缓存计算出来随机的颜色，位置，并绘制色块。
/* 获取随机颜色 */
function getColor(){
    const r = Math.floor(Math.random()*255);
    const g = Math.floor(Math.random()*255);
    const b = Math.floor(Math.random()*255);
    return 'rgba('+ r +','+ g +','+ b +',0.8)';
 }
/* 获取随机位置 */
function getPostion(position){
     const { width , height } = position
     return { left: Math.ceil( Math.random() * width ) + 'px',top: Math.ceil(  Math.random() * height ) + 'px'}
}
/* 色块组件 */
function Circle({ position }){
    const style = React.useMemo(()=>{ //用useMemo缓存，计算出来的随机位置和色值。
         return {  
            background : getColor(),
            ...getPostion(position)
         }
    },[])
    return <div style={style} className="circle" />
}
```

不做任何渲染优化，一次性加载 20000 个元素块速度特别慢，而且是一次性突然出现，体验不好，所以接下来要用时间分片做性能优化：

```js
// TODO: 改造方案
class Index extends React.Component{
    state={
        dataList:[],    //数据源列表
        renderList:[],  //渲染列表
        position:{ width:0,height:0 }, // 位置信息
        eachRenderNum:500,  // 每次渲染数量
    }
    box = React.createRef() 
    componentDidMount(){
        const { offsetHeight , offsetWidth } = this.box.current
        const originList = new Array(20000).fill(1)
        const times = Math.ceil(originList.length / this.state.eachRenderNum) /* 计算需要渲染此次数*/
        let index = 1
        this.setState({
            dataList:originList,
            position: { height:offsetHeight,width:offsetWidth },
        },()=>{
            this.toRenderList(index,times)
        })
    }
    toRenderList=(index,times)=>{
        if(index > times) return /* 如果渲染完成，那么退出 */
        const { renderList } = this.state
        renderList.push(this.renderNewList(index)) /* 通过缓存element把所有渲染完成的list缓存下来，下一次更新，直接跳过渲染 */
        this.setState({
            renderList,
        })
        requestIdleCallback(()=>{ /* 用 requestIdleCallback 代替 setTimeout 浏览器空闲执行下一批渲染 */
            this.toRenderList(++index,times)
        })
    }
    renderNewList(index){  /* 得到最新的渲染列表 */
        const { dataList , position , eachRenderNum } = this.state
        const list = dataList.slice((index-1) * eachRenderNum , index * eachRenderNum  )
        return <React.Fragment key={index} >
            {  
                list.map((item,index) => <Circle key={index} position={position}  />)
            }
        </React.Fragment>
    }
    render(){
         return <div className="bigData_index" ref={this.box}  >
            { this.state.renderList }
         </div>
    }
}
```

- 第一步：计算时间片，首先用 eachRenderNum 代表一次渲染多少个，那么除以总数据就能得到渲染多少次。
- 第二步：开始渲染数据，通过 index > times 判断渲染完成，如果没有渲染完成，那么通过 requestIdleCallback 代替 setTimeout 浏览器空闲执行下一帧渲染。
- 第三步：通过 renderList 把已经渲染的 element 缓存起来，在前面渲染控制一节讲过，这种方式可以直接跳过下一次的渲染。实际每一次渲染的数量仅仅为 demo 中设置的 500 个。

## 虚拟列表

虚拟列表是一种长列表的解决方案。如果没经过处理，加载完成后数据展示的元素，都显示在页面上，如果伴随着数据量越来越大，会使页面中的 DOM 元素越来越多，即便是像 React 可以良好运用 diff 来复用老节点，但也不能保证大量的 diff 带来的性能开销。所以虚拟列表的出现，就是解决大量 DOM 存在，带来的性能问题。

虚拟列表，就是在长列表滚动过程中，只有视图区域显示的是真实 DOM ，滚动过程中，不断截取视图的有效区域，让人视觉上感觉列表是在滚动。达到无限滚动的效果。

虚拟列表划分可以分为三个区域：视图区 + 缓冲区 + 虚拟区：

- 视图区：视图区就是能够直观看到的列表区，此时的元素都是真实的 DOM 元素。
- 缓冲区：缓冲区是为了防止用户上滑或者下滑过程中，出现白屏等效果。（缓冲区和视图区为渲染真实的 DOM ）
- 虚拟区：对于用户看不见的区域（除了缓冲区），剩下的区域，不需要渲染真实的 DOM 元素。虚拟列表就是通过这个方式来减少页面上 DOM 元素的数量。

具体实现思路。

- 通过 useRef 获取元素，缓存变量。
- useEffect 初始化计算容器的高度。截取初始化列表长度。这里需要 div 占位，撑起滚动条。
- 通过监听滚动容器的 onScroll 事件，根据 scrollTop 来计算渲染区域向上偏移量, 这里需要注意的是，当用户向下滑动的时候，为了渲染区域，能在可视区域内，可视区域要向上滚动；当用户向上滑动的时候，可视区域要向下滚动。
- 通过重新计算 end 和 start 来重新渲染列表。

```js
function VirtualList(){
   const [ dataList,setDataList ] = React.useState([])  /* 保存数据源 */
   const [ position , setPosition ] = React.useState([0,0]) /* 截取缓冲区 + 视图区索引 */
   const scroll = React.useRef(null)  /* 获取scroll元素 */
   const box = React.useRef(null)     /* 获取元素用于容器高度 */
   const context = React.useRef(null) /* 用于移动视图区域，形成滑动效果。 */
   const scrollInfo = React.useRef({ 
       height:500,     /* 容器高度 */
       bufferCount:8,  /* 缓冲区个数 */
       itemHeight:60,  /* 每一个item高度 */
       renderCount:0,  /* 渲染区个数 */ 
    }) 
    React.useEffect(()=>{
        const height = box.current.offsetHeight
        const { itemHeight , bufferCount } = scrollInfo.current
        const renderCount =  Math.ceil(height / itemHeight) + bufferCount
        scrollInfo.current = { renderCount,height,bufferCount,itemHeight }
        const dataList = new Array(10000).fill(1).map((item,index)=> index + 1 )
        setDataList(dataList)
        setPosition([0,renderCount])
    },[])
   const handleScroll = () => {
       const { scrollTop } = scroll.current
       const { itemHeight , renderCount } = scrollInfo.current
       const currentOffset = scrollTop - (scrollTop % itemHeight) 
       const start = Math.floor(scrollTop / itemHeight)
       context.current.style.transform = `translate3d(0, ${currentOffset}px, 0)` /* 偏移，造成下滑效果 */
       const end = Math.floor(scrollTop / itemHeight + renderCount + 1)
       if(end !== position[1] || start !== position[0]  ){ /* 如果render内容发生改变，那么截取  */
            setPosition([ start , end ])
       }
   } 
   const { itemHeight , height } = scrollInfo.current
   const [ start ,end ] = position
   const renderList = dataList.slice(start,end) /* 渲染区间 */
   console.log('渲染区间',position)
   return <div className="list_box" ref={box} >
     <div className="scroll_box" style={{ height: height + 'px'  }}  onScroll={ handleScroll } ref={scroll}  >
        <div className="scroll_hold" style={{ height: `${dataList.length * itemHeight}px` }}  />
        <div className="context" ref={context}> 
            {
               renderList.map((item,index)=> <div className="list" key={index} >  {item + '' } Item </div>)
            }  
        </div>
     </div>
   </div>
}
```

## React 动画

React 写动画也是一个比较棘手的问题。高频率的 setState 会给应用性能带来挑战。

### 动态添加类名

这种方式是通过 transition，animation 实现动画然后写在 class 类名里面，通过动态切换类名，达到动画的目的。这种方式既不需要频繁 setState ，也不需要改变 DOM。

```js
export default function Index(){
    const [ isAnimation , setAnimation ] = useState(false)
    return <div>
        <button onClick={ ()=> setAnimation(true)  } >改变颜色</button>
        <div className={ isAnimation ? 'current animation' : 'current'  } ></div>
    </div>
}
```

### 操纵原生 DOM

如果必须做一些 js 实现复杂的动画效果，那么可以获取原生 DOM ，然后单独操作 DOM 实现动画功能，这样就避免了 setState 改变带来 React Fiber 深度调和渲染的影响。

```js
export default function Index(){
    const dom = useRef(null)
    const changeColor = ()=>{
        const target =  dom.current
        target.style.background = '#c00'
        setTimeout(()=>{
            target.style.background = 'orange'
            setTimeout(()=>{
                target.style.background = 'yellowgreen'
            },500)
        },500)
    }
    return <div>
        <button onClick={ changeColor } >改变颜色</button>
        <div className='current' ref={ dom }  ></div>
    </div>
}
```

### setState + css3

如果上面两种都不能满足要求，一定要使用 setState 实时改变DOM元素状态的话，那么尽量采用 css3 ， css3 开启硬件加速，使 GPU 发挥功能，从而提升性能。比如想要改变元素位置 left ，top 值，可以换一种思路通过改变 transform: translate，transform 是由 GPU 直接控制渲染的，所以不会造成浏览器的重排。

```js
export default function Index(){
    const [ position , setPosition ] = useState({ left:0,top:0 })
    const changePosition = ()=>{
        let time = 0
        let timer = setInterval(()=>{
            if(time === 30) clearInterval(timer)
            setPosition({ left:time * 10 , top:time * 10 })
            time++ 
        },30)
    }
    const { left , top } = position
    return <div>
         <button onClick={ changePosition } >改变位置</button>
         <div className='current' style={{ transform:`translate(${ left }px,${ top }px )` }}  ></div>
    </div>
}
```

## 及时清除监听事件

如果在 React 项目中，用到了定时器，延时器和事件监听器，注意要在对应的生命周期，清除它们，不然可能会造成内部泄露的情况。

类组件：在 componentWillUnmount 生命周期及时清除延时器和事件监听器。

```js
export default class Index extends React.Component{
    current = null
    poll=()=>{} /* 轮训 */
    handleScroll=()=>{} /* 处理滚动事件 */
    componentDidMount(){
       this.timer = setInterval(()=>{
           this.poll() /* 2 秒进行一次轮训事件 */
       },2000)
       this.current.addEventListener('scroll',this.handleScroll)
    }
    componentWillUnmount(){
       clearInterval(this.timer) /* 清除定时器 */
       this.current.removeEventListener('scroll',this.handleScroll)
    }
    render(){
        return <div ref={(node)=>this.current = node  }  >hello,let us learn React!</div>
    }
}
```

函数组件：在 useEffect 或者 useLayoutEffect 第一个参数 create 的返回函数 destory 中，做一些清除定时器/延时器的操作。

```js
export default function Index(){
    const dom = React.useRef(null)
    const poll = ()=>{}
    const handleScroll = ()=>{}
    useEffect(()=>{
        let timer = setInterval(()=>{
            poll() /* 2 秒进行一次轮训事件 */
        },2000)
        dom.current.addEventListener('scroll',handleScroll)
        return function(){
            clearInterval(timer)
            dom.current.removeEventListener('scroll',handleScroll)
        } 
    },[])
    return <div ref={ dom }  >hello,let us learn React!</div>
}
```

## 合理使用 state

React 并不像 vue 那样响应式数据流。 在 vue 中有专门的 dep 做依赖收集，可以自动收集字符串模版的依赖项，只要没有引用的 data 数据， 通过 this.aaa = bbb ，在 vue 中是不会更新渲染的。但是在 React 中只要触发 setState 或 useState ，如果没有渲染控制的情况下，组件就会渲染，暴露一个问题就是，如果视图更新不依赖于当前 state ，那么这次渲染也就没有意义。所以对于视图不依赖的状态，就可以考虑不放在 state 中。

打个比方，比如想在滚动条滚动事件中，记录一个 scrollTop 位置，那么在这种情况下，用 state 保存 scrollTop 就没有任何意义而且浪费性能。

```js
export default class Index extends React.Component{
    node = null
    scrollTop = 0
    handleScroll=()=>{
        const {  scrollTop } = this.node 
        this.scrollTop = scrollTop
    }
    render(){
        return <div ref={(node)=> this.node = node } onScroll={this.handleScroll} ></div>
    }
}
```

上述把 scrollTop 直接绑定在 this 上，而不是通过 state 管理，这样好处是滚动条滚动不需要触发 setState ，从而避免了无用的更新。

对于函数组件，因为不存在组件实例，但是函数组件有 hooks ，所以可以通过一个 useRef 实现同样的效果。

```js
export default function Index(){
    const dom = useRef(null)
    const scrollTop = useRef(0)
    const handleScroll = ()=> {
        scrollTop.current = dom.current.scrollTop
    }
    return   <div ref={ dom } onScroll={handleScroll} ></div>
}
```

如上用 useRef ，来记录滚动条滚动时 scrollTop 的值。

## hooks 的参数

建议不要在 hooks 的参数中执行函数或者 new 实例：

```js
const hook1 = useRef(fn())
const hook2 = useRef(new Fn())
```

- 首先函数每次 rerender 都会执行 hooks ，那么在执行 hooks 函数的同时，也会执行函数的参数，比如上面的代码片段中的 fn() 和 new Fn()，也就是每一次 rerender 都会执行 fn 或者是 new 一个实例。这可能不是开发者期望的，而执行函数，或创建实例也成了一种性能浪费，在一些极端情况下，可能会造成内存泄漏，比如在创建新的 dom 元素，但是没有进行有效的回收。

- 函数组件在初始化和更新流程中，会使用不同的 hooks 对象，还是以 useRef 为例子，在初始化阶段用的是 mountRef 函数，在更新阶段用的是 updateRef 函数，开发者眼睛看见的是 useRef，在 React 底层却悄悄的替换成了不同的函数。 更重要的是大部分的 hooks 参数都作为初始化的参数，在更新阶段压根没有用到，那么传入的参数也就没有了意义，回到上述代码片段，fn() 和 new Fn() 在更新阶段根本就没有被 useRef 接收， 无辜的成了流浪者。

初始化：初始化的时候用到了 initialValue ，也就是第一个参数。

```js
function mountRef(initialValue) {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  hook.memoizedState = ref;
  return ref;
}
```

更新阶段：在更新阶段根本没有用到 initialValue

```js
function updateRef(initialValue) {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

如果开发者真的想在 hooks 中，以函数组件执行结果或者是实例对象作为参数的话，那么应该怎么处理呢?

```js
const hook = useRef(null)
if(!hook.current){
  hook.current = new Fn()
}
```

[深度解析 React 性能优化 API](https://mp.weixin.qq.com/s/svGYB3HvmLDMerlM50BhAg)

## 问题

### Q1. useCallback 和 useMemo 有什么区别？

`useMemo` 和 `useCallback` 都是 React 提供的 Hooks，用于优化组件性能，但它们的用途和工作方式略有不同：

1. **useMemo**：
   - `useMemo` 用于计算一些复杂的值，并且这些值在组件的渲染过程中可能被多次调用。
   - 它接受两个参数：一个函数和一个依赖数组。React 会缓存这个函数的返回值，并仅在依赖项改变时重新计算。
   - 通常用于性能优化，避免在每次渲染时都进行昂贵的计算。
   - 示例：

     ```jsx
     const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
     ```

2. **useCallback**：
   - `useCallback` 用于缓存函数，避免在每次渲染时都重新创建函数实例。
   - 它接受两个参数：一个函数和一个依赖数组。React 会缓存这个函数，并仅在依赖项改变时重新创建。
   - 通常用于传递给子组件或传递给其他库，以避免不必要的重新渲染。
   - 示例：

     ```jsx
     const memoizedCallback = useCallback(
       () => {
         doSomething(a, b);
       },
       [a, b],
     );
     ```

**区别**：

- `useMemo` 用于记忆计算结果，而 `useCallback` 用于记忆函数。
- `useMemo` 可以用于优化性能，避免不必要的计算，而 `useCallback` 可以用于避免不必要的组件重新渲染。
- `useMemo` 返回的是一个记忆后的值，而 `useCallback` 返回的是一个记忆后的函数。
- `useMemo` 可以用于计算复杂的数据结构，而 `useCallback` 通常用于函数。
- 在使用 `useMemo` 时，需要注意避免依赖于 props 和 state 的值，因为这可能导致依赖项的闭包问题。

总的来说，`useMemo` 和 `useCallback` 都是为了减少不必要的计算和渲染，但它们关注点不同，一个关注计算结果，一个关注函数实例。

使用 `useMemo` 和 `useCallback` 可以帮助避免一些常见的 React 性能问题，主要包括：

1. **避免不必要的组件重新渲染**：
   - 当组件的 props 或 state 发生变化时，React 默认会重新渲染组件。如果组件的渲染依赖于复杂的计算或函数，这可能导致性能问题。使用 `useMemo` 和 `useCallback` 可以缓存计算结果和函数，避免在每次渲染时都重新计算或创建。

2. **减少子组件的重新渲染**：
   - 如果父组件频繁重新渲染，即使子组件的 props 没有变化，子组件也可能被重新渲染。使用 `useMemo` 和 `useCallback` 可以确保即使父组件重新渲染，只要依赖项没有变化，传递给子组件的 props 和回调函数也不会变化，从而避免子组件的不必要渲染。

3. **避免昂贵的计算**：
   - 在组件的渲染方法或函数组件中进行昂贵的计算（如大数据集的排序、过滤等）可能会导致性能问题。使用 `useMemo` 可以缓存这些计算结果，避免在每次渲染时都重新计算。

4. **避免重复创建函数实例**：
   - 在组件的渲染方法或函数组件中频繁创建函数实例，尤其是在传递给子组件或使用在事件处理中时，可能会导致性能问题。使用 `useCallback` 可以缓存这些函数实例，避免不必要的重新创建。

5. **避免闭包陷阱**：
   - 在组件的渲染方法或函数组件中，如果函数依赖于组件的 props 或 state，可能会导致闭包陷阱，即函数内部引用了旧的 props 或 state。使用 `useCallback` 可以确保函数引用的是最新的 props 或 state。

6. **优化高阶组件和自定义 Hooks**：
   - 在使用高阶组件（HOC）或自定义 Hooks 时，可能会遇到性能问题，因为它们可能会引入额外的组件层级或不必要的渲染。使用 `useMemo` 和 `useCallback` 可以优化这些场景，减少不必要的渲染。

7. **避免不必要的副作用**：
   - 使用 `useCallback` 可以确保回调函数的稳定性，从而减少不必要的副作用执行，如不必要的 API 请求或状态更新。

通过合理使用 `useMemo` 和 `useCallback`，可以显著提高 React 应用的性能，特别是在处理复杂计算、频繁更新的组件或大量子组件时。然而，也需要注意不要过度使用这些 Hooks，因为它们会增加代码的复杂性，并且如果使用不当，反而可能导致性能问题。

### Q2. React 与 Vue 对比

#### 相同点

- 都是数据驱动视图 MVVM 框架，通过不同的机制实现响应式更新，优化用户体验。
- 都有组件化思想，提高代码的重用和开发过程的效率
- 都基于 Virtual DOM，实现跨平台、最小的代价更新变化的视图、避免手动操作真实 DOM
- 都专注于视图渲染，实现核心渲染器，像路由、状态管理等独立的部分都由其他库去完成。
- 都支持服务器端渲染
- 都有支持 native 的方案：`Vue`的`weex`、`React`的`React native`
- Diff 思想基本相同。vue 和 react 的 diff 算法都是进行同层次的比较，在处理老节点部分，都需要把节点处理 key - value 的 Map 数据结构，方便在往后的比对中可以快速通过节点的 key 取到对应的节点。同样在比对两个新老节点是否相同时，key 是否相同也是非常重要的判断标准。所以不论是 React, 还是 Vue，在写动态列表的时候，都需要设置一个唯一值 key，这样在 diff 算法处理的时候性能才最大化。

#### 区别

- **语法不同**。默认情况下，Vue 使用 SFC，React 使用 JSX。
- **数据流向的不同**。`react`从诞生开始就推崇单向数据流，而`Vue`是双向数据流，双向绑定。
- **数据变化的实现原理不同**。`react`使用的是不可变数据，而`Vue`使用的是可变的数据。
- **组件化通信的不同**。`react`中我们通过使用回调函数来进行通信的，而`Vue`中子组件向父组件传递消息有两种方式：事件和回调函数。
- **Diff 算法实现不同**。react 会自顶向下全 diff。vue 会跟踪每一个组件的依赖关系，不需要重新渲染整个组件树。在 react 中，当状态发生改变时，组件树就会自顶向下的全 diff，重新 render 页面，重新生成新的虚拟 dom tree，新旧 dom tree 进行比较，进行 patch 打补丁方式，局部更新 dom。所以 react 为了避免父组件更新而引起不必要的子组件更新，可以在 `shouldComponentUpdate` 做逻辑判断，减少没必要的 render，以及重新生成虚拟 dom，做差量对比过程。

  在 Vue2 中， 通过 `Object.defineProperty` 把 data 属性全部转为 getter/setter。同时 watcher 实例对象会在组件渲染时，将属性记录为 dep, 当 dep 项中的 setter 被调用时，通知 watch 重新计算，使得关联组件更新。Vue2 的核心 Diff 算法采用了双端比较的算法，同时从新旧 children 的两端开始进行比较，借助 key 值找到可复用的节点，再进行相关操作。相比 React 的 Diff 算法，同样情况下可以减少移动节点次数，减少不必要的性能损耗，更加的优雅。

- **React 重运行时，Vue 重编译时**。Vue 的 Template 可以在编译时做静态分析和预编译优化，例如，静态 vdom 不做 diff，v-if 等做到了按需更新。而 React 采用 JSX 语法，动态灵活，导致它的渲染效率比 Template 低，无法在编译时做优化，只能寄希望于运行时，例如 fiber、并发模式。但 Fiber 架构的复杂性导致 React 的虚拟 DOM 协调效率较低，这是系统性的问题。Vue 的架构里没有时间分片，也就没有 Fiber，因此简单了很多，这使得渲染可以更快。Vue 通过分析 template、简化协调过程，做了大量的 AOT 优化，性能测试结果表明大部分的 DOM 内容有 80% 属于静态内容，因此 Vue 3 的协调速度比 Svelte 快，花费的时间比 React 的 1/10 还少。
- **组件重复渲染处理填坑**。React Hooks 将大部分组件树的优化 API 暴露给开发者，开发者很多时候需要手动调用 useMemo 来优化渲染效率。这意味着 React 应用默认就有 render 过多的问题。更严重的是，这些优化在 React 里很难自动化，因为这些优化要求开发者正确设置依赖数组，盲目添加 useMemo 会导致应该 render 的没 render。vue 通过数据响应式追踪，可以做到组件树级别的优化，比如把插槽编译为函数以避免 children 的变化引发 re-render，比如自动缓存内联事件处理函数以避免 re-render。Vue 3 可以做到在不借助开发者的任何手动优化的情况下，防止子组件在非必要的情况下 re-render。这意味着同样一次更新，React 应用可能要 re-render 多个组件，而 Vue 应用很可能只 re-render 一个组件。
- **组件更新控制颗粒度不同**。Vue3 通过静态标记 + 响应式 + 虚拟 dom 的方式，控制了 diff 的颗粒度，让 diff 的时间不会超过 16ms，但是 React 自上而下的 diff 过程，项目大了之后，一旦 diff 的时间超过 16.6ms，就会造成卡顿，对此 React 交出的解决方案就是时间切片。时间分片解决的问题并不多，只解决了很少一部分场景的问题，比如动画和可视化。99% 的场景不需要时间分片，时间分片只会延长整个渲染时长。React 有很多问题，我这里补充一点，Fiber 的链表遍历制约了 React 的 diff 算法、让很多优化变得无法实施。总得来说，Vue 3 对利弊的权衡对我很有说服力。另外，时间分片，或者说并发模式，给 React 带来了另外一个问题：React 需要对所有更新任务进行调度和调和，这导致 React 还需要搞定任务优先级、任务失效处理、re-entry 等任务，这会使 React 变得更复杂，进而让源码的体积膨胀。就算 React 把 Suspense、Tree-shaking 等优化都加上，Vue 3 的运行时体积也只有 React + ReactDOM 的 1/4。
- **在生态建设上，React 和 Vue 的路线是不一样的**。Vue 的 Cli、路由和状态管理，都是 Vue 的核心库的一部分，受到官方支持和维护。但是 React 团队只负责维护 React 这一个项目，脚手架工具、路由和状态管理都来自于第三方的社区开发者。

### Q3. React 组件在哪些情况下会重新渲染？

React 组件可能因为多种原因触发重新渲染。以下是一些常见的触发原因：

- （1）**状态更新**
  当组件的状态（state）发生变化时，组件会重新渲染。这通常是通过调用 `setState` 方法（类组件）或 `useState` Hook 的设置函数（函数组件）来实现的。在函数组件中，如果使用了 `useReducer` 或 `useState` Hook，并触发了状态更新，组件会重新渲染。

- （2）**属性变化**
  当组件接收到新的属性（props），并且这些属性不同于上一次渲染的属性时，组件会重新渲染。

- （3）**强制更新**
  在类组件中，可以调用 `forceUpdate` 方法强制组件忽略 `shouldComponentUpdate` 的返回值并重新渲染。

- （4）**父组件重新渲染**
  当一个组件的父组件重新渲染时，即使子组件的状态和属性没有变化，子组件也会重新渲染。不过，如果子组件使用了 `React.memo` 或 `shouldComponentUpdate` 生命周期方法来优化性能，并且返回 `false`，则可以避免不必要的渲染。

- （5）**使用 Hooks 的函数组件**
  在函数组件中，如果使用了如 `useEffect`、`useMemo`、`useCallback` 等 Hooks，并且它们的依赖项发生变化，也会导致组件重新渲染。

- （6）**Context 变化**
  如果组件订阅了某个 Context 的变化，当 Context 的值发生变化时，订阅的组件会重新渲染。

- （7）**错误边界**
  如果组件树中发生了 JavaScript 错误，错误边界组件会捕捉到这个错误，并重新渲染以显示错误消息。

- （8）**调用 `ReactDOM.render` 或 `hydrate`**
  当你使用 `ReactDOM.render` 或 `ReactDOM.hydrate` 将组件挂载到 DOM 时，以及在后续调用这些函数时，会触发组件的重新渲染。

- （9）**服务器端渲染（SSR）**
  在服务器端生成 HTML 时，React 组件会进行渲染，生成的 HTML 字符串会被发送到客户端。

- （10）**直接操作 DOM**
  如果你直接修改了 DOM，React 无法检测到这些变化。在下一次组件重新渲染时，React 会覆盖掉这些变化，因为它会根据虚拟 DOM 重新渲染整个组件树。

### Q4. 如何减少 React 组件不必要的重复渲染？

1. 使用 shouldComponentUpdate 生命周期方法：通过在类组件中重写 shouldComponentUpdate 方法，并在方法中进行比较前后 props 和 state 的值，可以决定是否进行下一次渲染。如果前后值相同，可以返回 false，避免不必要的渲染。

2. 使用 PureComponent：PureComponent 是 React 中的一个内置组件，它会在每次渲染时自动对比 props 和 state 的值，并根据比较结果决定是否进行渲染。使用 PureComponent 可以避免手动实现 shouldComponentUpdate 的逻辑。

3. 使用 React.memo：React.memo 是 React 的一个高阶组件，它可以对组件进行浅比较，并在 props 没有变化时阻止不必要的渲染。只需要将组件作为参数传递给 React.memo 即可。

4. 使用 useCallback 和 useMemo：这些 Hooks 可以缓存函数和计算结果，避免在每次渲染时重新创建或计算。

5. 避免在 render 方法中创建新的对象或函数：由于 render 方法会频繁调用，如果在 render 方法中创建新的对象或函数，可能会导致频繁的垃圾回收。可以将这些对象或函数移到组件外部。避免在渲染方法或函数内部创建内联对象和箭头函数，因为这会导致在每次渲染时都创建新的引用，从而使子组件不必要的重新渲染。

6. 避免频繁的 setState 调用：setState 是异步的，并且会进行批处理，但如果在短时间内多次调用 setState，可能会导致多次不必要的渲染。可以使用 setState 的回调函数或 setState 的函数参数来减少不必要的渲染。

7. 合理使用 key 属性，确保列表中每个元素的 key 是唯一的，并且稳定。这有助于 React 识别哪些元素是变化的，从而避免不必要的重新渲染。

8. 使用 React.Fragment 或 null 作为返回值。避免返回 null 或 false 值，这可能导致父组件的渲染中断。相反，使用 React.Fragment 可以包裹子元素，避免这个问题。
