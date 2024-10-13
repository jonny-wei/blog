# React 组件及通信

**React 组件本质**：UI + update + 常规的类和函数 = React 组件。组件承载了渲染视图的 UI 和更新视图的 setState 、 useState 等方法。React 在底层逻辑上会像正常实例化类和正常执行函数那样处理的组件。Component 加入 updater, 通过 updater 控制 state 和更新视图。组件的数据结构本质是一个函数或者类，当你使用元素标签的方式进行调用时，函数或者类会被执行，最终返回一个 React 元素。

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
     /* 执行我们的函数组件，得到 return 返回的 React.element 对象 */
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

Component 底层 React 的处理逻辑是，类组件执行构造函数过程中会在实例上绑定 props 和 context ，初始化置空 refs 属性，原型链上绑定 setState、forceUpdate 方法。对于 updater，React 在实例化类组件之后会单独绑定 update 对象。

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

对于 pureComponent 会在 [React 渲染优化](/react/warmup/react-render.html#react-渲染控制)，详细探讨。

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

那么，**函数组件和类组件本质的区别**是什么呢？

对于类组件来说，底层只需要实例化一次，实例中保存了组件的 state 等状态。对于每一次更新只需要调用 render 方法以及对应的生命周期就可以了。但是在函数组件中，每一次更新都是一次新的函数执行，一次函数组件的更新，里面的变量会重新声明。为了能让函数组件可以保存一些状态，执行一些副作用钩子，React Hooks 应运而生，它可以帮助记录 React 中组件的状态，处理一些额外的副作用。

## 组件的强化方式

### 类组件继承

对于类组件的强化，首先想到的是继承方式，开源项目 react-keepalive-router 就是通过继承 React-Router 中的 Switch 和 Router ，来达到缓存页面的功能的。因为 React 中类组件，有良好的继承属性，所以可以针对一些基础组件，首先实现一部分基础功能，再针对项目要求进行有方向的改造、强化、添加额外功能。

```js
/* 人类 */
class Person extends React.Component {
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
class Programmer extends Person {
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

在 React hooks 章节，会详细介绍自定义 hooks 的原理。[React Hooks 理解](/react/react/react-hooks.html)

### HOC高阶组件

在 HOC 章节，会详细介绍高阶组件 HOC 。[React HOC](/react/warmup/react-hoc.html)

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

### event bus 事件总线

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

对于函数组件，本身是没有实例的，但是 React Hooks 提供了 useImperativeHandle 其第一个参数接受父组件传递的 ref 对象，第二个参数是一个函数，函数返回值，作为 ref 对象获取的内容。

useImperativeHandle 则是用来自定义暴露给父组件的 ref 对象。它通常与 forwardRef 一起使用，让你可以控制子组件暴露给父组件的哪些方法和值。通过 useImperativeHandle，你可以返回一个对象，该对象包含子组件想要暴露给父组件的方法和属性。useImperativeHandle 接受三个参数：

- 第一个参数 ref：接受 forwardRef 传递过来的 ref 。
- 第二个参数 createHandle：处理函数，返回值作为暴露给父组件的 ref 对象。
- 第三个参数 deps：依赖项 deps，依赖项更改形成新的 ref 对象。

forwardRef 是一个高阶函数，它接受一个函数组件或类组件，并返回一个新的组件。这个新的组件在渲染时会接收一个额外的 ref 参数，并将其传递给子组件 `fatherRef.current = sonRef.current`，组件通过 ref 就可以直接访问这些节点或组件。如果需要自定义 ref 的行为，可以使用 useImperativeHandle。forwardRef + useImperativeHandle 可以完全让函数组件也能流畅的使用 Ref 通信。其原理图如下所示：

![ref4](/blog/images/react/ref4.png)

```js
// 子组件
function Son (props, ref) {
    const inputRef = useRef(null)
    const [ inputValue , setInputValue ] = useState('')
    useImperativeHandle(ref, ()=>{
       const handleRefs = {
           onFocus(){              /* 声明方法用于聚焦input框 */
              inputRef.current.focus()
           },
           onChangeValue(value){   /* 声明方法用于改变input的值 */
               setInputValue(value)
           }
       }
       return handleRefs
    }, [])
    return <div>
        <input placeholder="请输入内容"  ref={inputRef}  value={inputValue} />
    </div>
}

const ForwardSon = forwardRef(Son)

// 父组件
class Index extends React.Component {
    sonInstance = null
    handlerClick(){
       const { onFocus , onChangeValue } = this.sonInstance
       onFocus() // 让子组件的输入框获取焦点
       onChangeValue('let us learn React!') // 让子组件input  
    }
    render(){
        return <div style={{ marginTop:'50px' }} >
            <ForwardSon ref={cur => (this.sonInstance = cur)} />
            <button onClick={this.handlerClick.bind(this)} >操控子组件</button>
        </div>
    }
}
```

- 父组件用 ref 标记子组件，由于子组件 Son 是函数组件没有实例，所以用 forwardRef 转发 ref。
- 子组件 Son 用 useImperativeHandle 接收父组件 ref，将让 input 聚焦的方法 onFocus 和 改变 input 输入框的值的方法 onChangeValue 传递给 ref 。
- 父组件可以通过调用 ref 下的 onFocus 和 onChangeValue 控制子组件中 input 赋值和聚焦。

关于 React Ref 的其他用法和原理详见 [React Ref 章节](/react/warmup/react-ref.html)

### 状态管理库通信

关于状态管理库的组件通信方式及其原理详见以下章节：

- [React Rudex](/react/warmup/react-redux.html)
- [React Mobx](/react/warmup/react-mobx.html)

### Context 通信

关于 context 的组件通信方式及其原理详见以下章节：

- [React Context](/react/warmup/react-context.html)
- [React Context 原理](/react/react/react-context.html)

## 问题

### Q1. 无状态组件和有状态组件

#### 无状态组件

无状态组件（Stateless Component）是最基础的组件形式，由于没有状态的影响所以就是纯静态展示的作用。一般来说，各种 UI 库里也是最开始会开发的组件类别。如按钮、标签、输入框等。它的基本组成结构就是属性（props）加上一个渲染函数（render）。由于不涉及到状态的更新，所以这种组件的复用性也最强。

**特点：**

- 只负责接收 `props`，渲染 DOM，可以是类组件或者函数组件。组件内部不维护 state ，只根据外部组件传入的 props 进行渲染的组件，当 props 改变时，组件重新渲染。
- 没有 `state`，不依赖自身的状态 state。
- 不能访问生命周期方法
- 不需要声明类：可以避免 `extends` 或 `constructor` 之类的代码，语法上更加简洁。
- 不会被实例化：因此不能直接传 `ref`（可以使用 `React.forwardRef` 包装后再传 `ref`）。
- 不需要显示声明 `this` 关键字：在 ES6 的类声明中往往需要将函数的 `this` 关键字绑定到当前作用域，而因为函数式声明的特性，我们不需要再强制绑定。可以完全避免使用 this 关键字。（由于使用的是箭头函数事件无需绑定）。
- 更好的性能表现：因为函数式组件中并不需要进行生命周期的管理与状态管理，因此React并不需要进行某些特定的检查或者内存分配，从而保证了更好地性能表现。当不需要使用生命周期钩子时，应该首先使用无状态函数组件。

**使用场景：**

- 组件不需要管理 state，纯展示

**优点：**

- 简化代码、专注于 render
- 组件不需要被实例化，无生命周期，提升性能。 输出（渲染）只取决于输入（属性），无副作用
- 视图和数据的解耦分离

**缺点：**

- 无法使用 ref
- 无生命周期方法
- 无法控制组件的重渲染，因为无法使用 `shouldComponentUpdate` 方法，当组件接受到新的属性时则会重渲染

**总结：** 对于像 `<Button />`、`<Input />`这样的组件，如果它们只是基于 props 渲染 UI，而不包含自己的状态逻辑，应该优先设计为函数组件。使用函数组件可以减少代码量，提高性能，因为它们更轻量级。对于无状态组件，可以使用 React.memo 进行包装，以避免不必要的渲染。

#### 有状态组件

在无状态组件的基础上，如果组件内部包含状态且状态随着事件或者外部的消息而发生改变的时候，这就构成了有状态组件（Stateful Component）。有状态组件通常会带有生命周期（Lifecycle），用以在不同的时刻触发状态的更新。这种组件也是通常在写业务逻辑中最经常使用到的，根据不同的业务场景组件的状态数量以及生命周期机制也不尽相同。

**特点：**

- 是类组件或带有 hooks 的函数组件
- 有继承
- 可以使用 this
- 可以使用 react 的生命周期
- 使用较多，容易频繁触发生命周期钩子函数，影响性能
- 内部使用 state，维护自身状态的变化，有状态组件根据外部组件传入的 props 和自身的 state 进行渲染。

**使用场景：**

- 需要使用到状态的。
- 需要使用状态操作组件的（无状态组件的也可以实现新版本 react hooks 也可实现）

**总结：** 类组件可以维护自身的状态变量，即组件的 state ，类组件还有不同的生命周期方法，可以让开发者能够在组件的不同阶段（挂载、更新、卸载），对组件做更多的控制。类组件则既可以充当无状态组件，也可以充当有状态组件。当一个类组件不需要管理自身状态时，也可称为无状态组件。

### Q2. 受控组件和非控组件

#### 受控组件

在使用表单来收集用户输入时，例如`<input><select><textearea>`等元素都要绑定一个 `change` 事件，当表单的状态发生变化，就会触发 `onChange` 事件，更新组件的 `state`。这种组件在 React 中被称为**受控组件**。在受控组件中，组件渲染出的状态与它的`value`或 `checked` 等属性相对应，react 通过这种方式消除了组件的局部状态，使整个状态可控。react 官方推荐使用受控表单组件。

受控组件更新 `state` 的流程：

- 可以通过初始 `state` 中设置表单的默认值
- 每当表单的值发生变化时，调用 `onChange` 事件处理器
- 事件处理器通过事件对象`e` 拿到改变后的状态，并更新组件的 `state`
- 一旦通过 `setState` 方法更新 `state`，就会触发视图的重新渲染，完成表单组件的更新

受控组件**缺陷**：表单元素的值都是由 React 组件进行管理，当有多个输入框，或者多个这种组件时，如果想同时获取到全部的值就必须每个都要编写事件处理函数，这会让代码看着很臃肿，所以为了解决这种情况，出现了非受控组件。

#### 非受控组件

如果一个表单组件没有 `value props`（单选和复选按钮对应的是`checked props`）时，就可以称为**非受控组件**。在非受控组件中，可以使用一个 `ref`来从 `DOM` 获得表单值。而不是为每个状态更新编写一个事件处理程序。

React官方的解释：

> 要编写一个非受控组件，而不是为每个状态更新都编写数据处理函数，你可以使用 ref 来从 DOM 节点中获取表单数据。 因为非受控组件将真实数据储存在 DOM 节点中，所以在使用非受控组件时，有时候反而更容易同时集成 React 和非 React 代码。如果你不介意代码美观性，并且希望快速编写代码，使用非受控组件往往可以减少你的代码量。否则，你应该使用受控组件。

例如，下面的代码在非受控组件中接收单个属性：

```javascript
class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    alert('A name was submitted: ' + this.input.value);
    event.preventDefault();
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" ref={(input) => this.input = input} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```

**总结：** 页面中所有输入类的 DOM 如果是现用现取的称为**非受控组件**，而通过 `setState` 将输入的值维护到了 `state` 中，需要时再从`state` 中取出，这里的数据就受到了 `state` 的控制，称为**受控组件**。

### Q3. React 组件的通信方式有哪些？

- 父子通信：`props/props callback`，`context`，`ref`，`event bus`，`状态管理库`。
- 兄弟通信：`event bus`，`公共父组件 context`，`状态管理库`
- 隔代（跨级）通信：`event bus`，`context`,`状态管理库`

### Q4. 函数组件和类组件本质的区别是什么？

对于类组件来说，底层只需要实例化一次，实例中保存了组件的 state 等状态。对于每一次更新只需要调用 render 方法以及对应的生命周期就可以了。但是在函数组件中，每一次更新都是一次新的函数执行，一次函数组件的更新，里面的变量会重新声明。为了能让函数组件可以保存一些状态，执行一些副作用钩子，React Hooks 应运而生，它可以帮助记录 React 中组件的状态，处理一些额外的副作用。

[React 组件通信](https://juejin.cn/post/6914464070506643470#heading-14)
