# React 组件及通信

**React 组件本质**：UI + update + 常规的类和函数 = React 组件。组件承载了渲染视图的 UI 和更新视图的 setState 、 useState 等方法。React 在底层逻辑上会像正常实例化类和正常执行函数那样处理的组件。Component 加入updater, 通过 updater 控制 state 和更新视图。组件的数据结构本质是一个函数或者类，当你使用元素标签的方式进行调用时，函数或者类会被执行，最终返回一个 React 元素。

## React 组件

- 类（ Class ）组件
- 函数（ Function ）组件

组件本质上就是类和函数，但是与常规的类和函数不同的是，组件承载了渲染视图的 UI 和更新视图的 setState 、 useState 等方法。React 在底层逻辑上会像正常实例化类和正常执行函数那样处理的组件。因此，函数与类上的特性在 React 组件上同样具有，比如原型链，继承，静态属性等，所以不要把 React 组件和类与函数独立开来。

### React 对组件的处理流程

```js
// 类组件的执行
function constructClassInstance(
    workInProgress, // 当前正在工作的 fiber 对象
    ctor,           // 我们的类组件
    props           // props 
){
     /* 实例化组件，得到组件实例 instance */
     const instance = new ctor(props, context)
}

//函数组件的执行

function renderWithHooks(
  current,          // 当前函数组件对应的 `fiber`， 初始化
  workInProgress,   // 当前正在工作的 fiber 对象
  Component,        // 我们函数组件
  props,            // 函数组件第一个参数 props
  secondArg,        // 函数组件其他参数
  nextRenderExpirationTime, //下次渲染过期时间
){
     /* 执行我们的函数组件，得到 return 返回的 React.element对象 */
     let children = Component(props, secondArg);
}
```

### 类组件

在 class 组件中，除了继承 React.Component ，底层还加入了 updater 对象，组件中调用的 setState 和 forceUpdate 本质上是调用了 updater 对象上的 enqueueSetState 和 enqueueForceUpdate 方法。

```js
/**
 * Base class helpers for the updating state of a component.
 */
function Component(props, context, updater) {
  this.props = props;      //绑定props
  this.context = context;  //绑定context
  this.refs = emptyObject; //绑定ref
  this.updater = updater || ReactNoopUpdateQueue; //上面所属的 updater 对象
}
/* 绑定 setState 方法 */
Component.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
}
/* 绑定 forceUpdate 方法 */
Component.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
}
```

Component 底层 React 的处理逻辑是，类组件执行构造函数过程中会在实例上绑定 props 和 context ，初始化置空 refs 属性，原型链上绑定setState、forceUpdate 方法。对于 updater，React 在实例化类组件之后会单独绑定 update 对象

如果没有在 constructor 的 super 函数中传递 props，那么接下来 constructor 执行上下文中就获取不到 props ，这是为什么呢？

```js
/* 假设我们在 constructor 中这么写 */
constructor(){
    super()
    console.log(this.props) // 打印 undefined 为什么?
}

/* 解决问题 */
constructor(props){ 
    super(props)
}
```

刚才的 Component 源码已经说得明明白白了，绑定 props 是在父类 Component 构造函数中，执行 super 等于执行 Component 函数，此时 props 没有作为第一个参数传给 super() ，在 Component 中就会找不到 props 参数，从而变成 undefined ，在接下来 constructor 代码中打印 props 为 undefined

为了更好地使用 React 类组件，我们首先看一下类组件各个部分的功能:

```js
class Index extends React.Component{
    constructor(...arg){
       super(...arg)                        /* 执行 react 底层 Component 函数 */
    }
    state = {}                              /* state */
    static number = 1                       /* 内置静态属性 */
    handleClick= () => console.log(111)     /* 方法： 箭头函数方法直接绑定在this实例上 */
    componentDidMount(){                    /* 生命周期 */
        console.log(Index.number,Index.number1) // 打印 1 , 2 
    }
    render(){                               /* 渲染函数 */
        return <div style={{ marginTop:'50px' }} onClick={ this.handerClick }  >hello,React!</div>
    }
}
Index.number1 = 2                           /* 外置静态属性 */
Index.prototype.handleClick = ()=> console.log(222) /* 方法: 绑定在 Index 原型链的 方法*/
```

上述绑定了两个 handleClick ，那么点击 div 之后会打印什么呢？结果是 111 。因为在 class 类内部，箭头函数是直接绑定在实例对象上的，而第二个 handleClick 是绑定在 prototype 原型链上的，它们的优先级是：实例对象上方法属性 > 原型链对象上方法属性。

对于 pureComponent 会在 React 渲染优化章节，详细探讨。

### 函数组件

```js
function Index(){
    console.log(Index.number) // 打印 1 
    const [ message , setMessage  ] = useState('hello,world') /* hooks  */
    return <div onClick={() => setMessage('let us learn React!')  } > { message } </div> /* 返回值 作为 ui*/
 }
 Index.number = 1 /* 绑定静态属性 */
```

不要尝试给函数组件 prototype 绑定属性或方法，即使绑定了也没有任何作用，因为通过上面源码中 React 对函数组件的调用，是采用直接执行函数的方式，而不是通过 new 的方式。

那么，函数组件和类组件本质的区别是什么呢？

对于类组件来说，底层只需要实例化一次，实例中保存了组件的 state 等状态。对于每一次更新只需要调用 render 方法以及对应的生命周期就可以了。但是在函数组件中，每一次更新都是一次新的函数执行，一次函数组件的更新，里面的变量会重新声明。为了能让函数组件可以保存一些状态，执行一些副作用钩子，React Hooks 应运而生，它可以帮助记录 React 中组件的状态，处理一些额外的副作用。

## 组件的强化方式

### 类组件继承

对于类组件的强化，首先想到的是继承方式，开源项目 react-keepalive-router 就是通过继承 React-Router 中的 Switch 和 Router ，来达到缓存页面的功能的。因为 React 中类组件，有良好的继承属性，所以可以针对一些基础组件，首先实现一部分基础功能，再针对项目要求进行有方向的改造、强化、添加额外功能。

```js
/* 人类 */
class Person extends React.Component{
    constructor(props){
        super(props)
        console.log('hello , i am person')
    }
    componentDidMount(){ console.log(1111)  }
    eat(){    /* 吃饭 */ }
    sleep(){  /* 睡觉 */  }
    ddd(){   console.log('打豆豆')  /* 打豆豆 */ }
    render(){
        return <div>
            大家好，我是一个person
        </div>
    }
}
/* 程序员 */
class Programmer extends Person{
    constructor(props){
        super(props)
        console.log('hello , i am Programmer too')
    }
    componentDidMount(){  console.log(this)  }
    code(){ /* 敲代码 */ }
    render(){
        return <div style={ { marginTop:'50px' } } >
            { super.render() } { /* 让 Person 中的 render 执行 */ }
            我还是一个程序员！    { /* 添加自己的内容 */ }
        </div>
    }
}
export default Programmer
```

类继承优势如下：

- 可以控制父类 render，还可以添加一些其他的渲染内容；
- 可以共享父类方法，还可以添加额外的方法和属性。
  
但是也有值得注意的地方，就是 state 和生命周期会被继承后的组件修改。像上述 demo 中，Person 组件中的 componentDidMount 生命周期将不会被执行。

### 函数组件自定义 Hooks

在 React hooks 章节，会详细介绍自定义 hooks 的原理。

### HOC高阶组件

在 HOC 章节，会详细介绍高阶组件 HOC 。

## 组件自定义内容处理

举个例子，我们实现了一个 Modal 组件，有确定按钮，有取消按钮，但 Modal 展示的内容为了更加灵活，我们提供了一个 props 属性，用户可以自定义一个组件传入其中，用户提供什么，Modal 就展示什么，Modal 相当于一个容器，那么，我们该怎么实现这个功能呢？

### props 方式

```jsx
function Modal({content}) {
  return (
    <div>
      {content}
      <button>确定</button>
      <button>取消</button>
    </div>
  )
}

function CustomContent({text}) {
  return <div>{text}</div>
}

<Modal content={<CustomContent text="content" />} />
```

根据前面的知识，我们可以知道，`content` 属性这里传入的其实是一个 React 元素，所以 Modal 组件的内部是用 `{}` 进行渲染。

### function 方式

但第一种方式，并不总能解决需求。有的时候，我们可能会用到组件内部的值。就比如一个倒计时组件 `Timer`，依然提供了一个属性 `content`，用于自定义时间的展示样式，时间由 `Timer` 组件内部处理，展示样式则完全由用户自定义，在这种时候，我们就可以选择传入一个组件：

```javascript
function Timer({content: Content}) {
    const [time, changeTime] = useState('0');

    useEffect(() => {
        setTimeout(() => {
            changeTime((new Date).toLocaleTimeString())
 }, 1000)
    }, [time])

    return (
        <div>
          <Content time={time} />
        </div>
    )
}

function CustomContent({time}) {
    return <div style={{border: '1px solid #ccc'}}>{time}</div>
}


<Timer content={CustomContent} />
```

在这个示例中，我们可以看到 `content` 属性传入的是一个 React 组件 CustomContent，而 CustomContent 组件会被传入 time 属性，我们正是基于这个约定进行的 CustomContent 组件的开发。而 Timer 组件内部，因为传入的是组件，所以使用的是 `<Content time={time}/>`进行的渲染。

### render props 方式

在面对第二种实现方式的需求时，除了上面这种实现方式，还有一种称为 `render props` 的技巧，比第二种方式更常见一些，我们依然以 Timer 组件为例：

```javascript
function Timer({renderContent}) {
    const [time, changeTime] = useState('0');

    useEffect(() => {
        setTimeout(() => {
            changeTime((new Date).toLocaleTimeString())
 }, 1000)
    }, [time])

  // 这里直接调用传入的 renderContent 函数
    return (
        <div>
          {renderContent(time)}
        </div>
    )
}

function CustomContent({time}) {
    return <div style={{border: '1px solid #ccc'}}>{time}</div>
}

root.render(<Timer renderContent={(time) => {
    return <CustomContent time={time} />
}} />);
```

鉴于我们传入的是一个函数，我们把 `content` 属性名改为了 `renderContent`，其实叫什么都可以。`renderContent` 传入了一个函数，该函数接收 `time` 作为参数，返回一个 React 元素，而在 `Timer` 内部，我们直接执行了 renderContent 函数，并传入内部处理好的 time 参数，由此实现了用户使用组件内部值自定义渲染内容。

多说一句，除了放到属性里，我们也可以放到 children 里，是一样的：

```javascript
function Timer({children}) {
   // ...
    return (
        <div>
          {children(time)}
        </div>
    )
}


<Timer>
  {(time) => {
    return <CustomContent time={time} />
  }}
</Timer>
```

## 组件通信

React 一共有 5 种主流的通信方式：

- props 和 callback 方式
- event bus 事件总线
- ref 方式
- React-redux 或 React-mobx 等状态管理方式
- context 上下文方式

### props 和 callback 方式

props 和 callback 可以作为 React 组件最基本的通信方式，父组件可以通过 props 将信息传递给子组件，子组件可以通过执行 props 中的回调函数 callback 来触发父组件的方法，实现父与子的消息通讯。

- 父组件 -> 通过自身 state 改变，重新渲染，传递 props -> 通知子组件
- 子组件 -> 通过调用父组件 props 方法 -> 通知父组件。

```js
/* 子组件 */
function Son(props){
    const {  fatherSay , sayFather  } = props
    return <div className='son' >
         我是子组件
        <div> 父组件对我说：{ fatherSay } </div>
        <input placeholder="我对父组件说" onChange={ (e)=>sayFather(e.target.value) }   />
    </div>
}
/* 父组件 */
function Father(){
    const [ childSay , setChildSay ] = useState('')
    const [ fatherSay , setFatherSay ] = useState('')
    return <div className="box father" >
        我是父组件
       <div> 子组件对我说：{ childSay } </div>
       <input placeholder="我对子组件说" onChange={ (e)=>setFatherSay(e.target.value) }   />
       <Son fatherSay={fatherSay}  sayFather={ setChildSay }  />
    </div>
}
```

### event bus事件总线

当然利用 eventBus 也可以实现组件通信，但是在 React 中并不提倡用这种方式，我还是更提倡用 props 方式通信。如果说非要用 eventBus，我觉得它更适合用 React 做基础构建的小程序，比如 Taro。接下来将上述 demo 通过 eventBus 方式进行改造。

```js
import { BusService } from './eventBus'
/* event Bus  */
function Son(){
    const [ fatherSay , setFatherSay ] = useState('')
    React.useEffect(()=>{ 
        BusService.on('fatherSay',(value)=>{  /* 事件绑定 , 给父组件绑定事件 */
            setFatherSay(value)
       })
       return function(){  BusService.off('fatherSay') /* 解绑事件 */ }
    },[])
    return <div className='son' >
         我是子组件
        <div> 父组件对我说：{ fatherSay } </div>
        <input placeholder="我对父组件说" onChange={ (e)=> BusService.emit('childSay',e.target.value)  }   />
    </div>
}
/* 父组件 */
function Father(){
    const [ childSay , setChildSay ] = useState('')
    React.useEffect(()=>{    /* 事件绑定 , 给子组件绑定事件 */
        BusService.on('childSay',(value)=>{
             setChildSay(value)
        })
        return function(){  BusService.off('childSay') /* 解绑事件 */ }
    },[])
    return <div className="box father" >
        我是父组件
       <div> 子组件对我说：{ childSay } </div>
       <input placeholder="我对子组件说" onChange={ (e)=> BusService.emit('fatherSay',e.target.value) }   />
       <Son  />
    </div>
}
```

这样做不仅达到了和使用 props 同样的效果，还能跨层级，不会受到 React 父子组件层级的影响。但是为什么很多人都不推荐这种方式呢？因为它有一些致命缺点。

- 需要手动绑定和解绑。
- 对于小型项目还好，但是对于中大型项目，这种方式的组件通信，会造成牵一发动全身的影响，而且后期难以维护，组件之间的状态也是未知的。
- 一定程度上违背了 React 数据流向原则。

### ref 实现组件通信

如果有种场景不想通过父组件 render 改变 props 的方式，来触发子组件的更新，也就是子组件通过 state 单独管理数据层，针对这种情况父组件可以通过 ref 模式标记子组件实例，从而操纵子组件方法，这种情况通常发生在一些数据层托管的组件上，比如 `<Form/>` 表单，经典案例可以参考 antd 里面的 form 表单，暴露出对外的 resetFields ， setFieldsValue 等接口，可以通过表单实例调用这些 API 。

1. 类组件 ref
2. 函数组件 forwardRef + useImperativeHandle

#### 1. 类组件 ref

对于类组件可以通过 ref 直接获取组件实例，实现组件通信。

```js
/* 子组件 */
class Son extends React.PureComponent{
    state={
       fatherMes:'',
       sonMes:''
    }
    fatherSay=(fatherMes)=> this.setState({ fatherMes  }) /* 提供给父组件的API */
    render(){
        const { fatherMes, sonMes } = this.state
        return <div className="sonbox" >
            <div className="title" >子组件</div>
            <p>父组件对我说：{ fatherMes }</p>
            <div className="label" >对父组件说</div> <input  onChange={(e)=>this.setState({ sonMes:e.target.value })}   className="input"  /> 
            <button className="searchbtn" onClick={ ()=> this.props.toFather(sonMes) }  >to father</button>
        </div>
    }
}
/* 父组件 */
export default function Father(){
    const [ sonMes , setSonMes ] = React.useState('') 
    const sonInstance = React.useRef(null) /* 用来获取子组件实例 */
    const [ fatherMes , setFatherMes ] = React.useState('')
    const toSon =()=> sonInstance.current.fatherSay(fatherMes) /* 调用子组件实例方法，改变子组件state */
    return <div className="box" >
        <div className="title" >父组件</div>
        <p>子组件对我说：{ sonMes }</p>
        <div className="label" >对子组件说</div> <input onChange={ (e) => setFatherMes(e.target.value) }  className="input"  /> 
        <button className="searchbtn"  onClick={toSon}  >to son</button>
        <Son ref={sonInstance} toFather={setSonMes} />
    </div>
}
```

1. 子组件暴露方法 fatherSay 供父组件使用，父组件通过调用方法可以设置子组件展示内容。
2. 父组件提供给子组件 toFather，子组件调用，改变父组件展示内容，实现父 <-> 子 双向通信。

#### 2. 函数组件 forwardRef + useImperativeHandle

对于函数组件，本身是没有实例的，但是 React Hooks 提供了，useImperativeHandle 一方面第一个参数接受父组件传递的 ref 对象，另一方面第二个参数是一个函数，函数返回值，作为 ref 对象获取的内容。一起看一下 useImperativeHandle 的基本使用。

useImperativeHandle 接受三个参数：

- 第一个参数 ref : 接受 forWardRef 传递过来的 ref 。
- 第二个参数 createHandle ：处理函数，返回值作为暴露给父组件的 ref 对象。
- 第三个参数 deps :依赖项 deps，依赖项更改形成新的 ref 对象。

forwardRef + useImperativeHandle 可以完全让函数组件也能流畅的使用 Ref 通信。其原理图如下所示：

![ref4](/blog/images/react/ref4.png)

```js
// 子组件
function Son (props,ref) {
    const inputRef = useRef(null)
    const [ inputValue , setInputValue ] = useState('')
    useImperativeHandle(ref,()=>{
       const handleRefs = {
           onFocus(){              /* 声明方法用于聚焦input框 */
              inputRef.current.focus()
           },
           onChangeValue(value){   /* 声明方法用于改变input的值 */
               setInputValue(value)
           }
       }
       return handleRefs
    },[])
    return <div>
        <input placeholder="请输入内容"  ref={inputRef}  value={inputValue} />
    </div>
}

const ForwarSon = forwardRef(Son)
// 父组件
class Index extends React.Component{
    cur = null
    handerClick(){
       const { onFocus , onChangeValue } =this.cur
       onFocus() // 让子组件的输入框获取焦点
       onChangeValue('let us learn React!') // 让子组件input  
    }
    render(){
        return <div style={{ marginTop:'50px' }} >
            <ForwarSon ref={cur => (this.cur = cur)} />
            <button onClick={this.handerClick.bind(this)} >操控子组件</button>
        </div>
    }
}
```

- 父组件用 ref 标记子组件，由于子组件 Son 是函数组件没有实例，所以用 forwardRef 转发 ref。
- 子组件 Son 用 useImperativeHandle 接收父组件 ref，将让 input 聚焦的方法 onFocus 和 改变 input 输入框的值的方法 onChangeValue 传递给 ref 。
- 父组件可以通过调用 ref 下的 onFocus 和 onChangeValue 控制子组件中 input 赋值和聚焦。

## 问题

### Q1. 无状态组件和有状态组件

#### 无状态组件

无状态组件（Stateless Component）是最基础的组件形式，由于没有状态的影响所以就是纯静态展示的作用。一般来说，各种 UI 库里也是最开始会开发的组件类别。如按钮、标签、输入框等。它的基本组成结构就是属性（props）加上一个渲染函数（render）。由于不涉及到状态的更新，所以这种组件的复用性也最强。

这类组件有以下几个特点：

- 只负责接收 `props`，渲染 DOM
- 没有 `state`
- 不能访问生命周期方法
- 不需要声明类：可以避免 `extends` 或 `constructor` 之类的代码，语法上更加简洁。
- 不会被实例化：因此不能直接传 `ref`（可以使用 `React.forwardRef` 包装后再传 `ref`）。
- 不需要显示声明 `this` 关键字：在 ES6 的类声明中往往需要将函数的 `this` 关键字绑定到当前作用域，而因为函数式声明的特性，我们不需要再强制绑定。
- 更好的性能表现：因为函数式组件中并不需要进行生命周期的管理与状态管理，因此React并不需要进行某些特定的检查或者内存分配，从而保证了更好地性能表现。

#### 有状态组件

在无状态组件的基础上，如果组件内部包含状态（state）且状态随着事件或者外部的消息而发生改变的时候，这就构成了有状态组件（Stateful Component）。有状态组件通常会带有生命周期（Lifecycle），用以在不同的时刻触发状态的更新。这种组件也是通常在写业务逻辑中最经常使用到的，根据不同的业务场景组件的状态数量以及生命周期机制也不尽相同。
