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

## 问题

### Q1. useCallback 和 useMemo 有什么区别？

useCallback 第一个参数就是缓存的内容，useMemo 需要执行第一个函数，返回值为缓存的内容，比起 useCallback ， useMemo 更像是缓存了一段逻辑，或者说执行这段逻辑获取的结果。那么对于缓存 element 用 useCallback 可以吗，答案是当然可以了。

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
