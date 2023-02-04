# React Ref

## Ref 对象的创建

所谓 ref 对象就是用 createRef 或者 useRef 创建出来的对象，一个标准的 ref 对象应该是如下的样子：

```js
{
    current:null , // current 指向 ref 对象获取到的实际内容，可以是 dom 元素，组件实例，或者其它。
}
```

React 提供两种方法创建 Ref 对象

- 类组件 React.createRef
- 函数组件 useRef

### 类组件 React.createRef

```js
class Index extends React.Component{
    constructor(props){
       super(props)
       this.currentDom = React.createRef(null)
    }
    componentDidMount(){
        console.log(this.currentDom)
    }
    render= () => <div ref={ this.currentDom } >ref对象模式获取元素或组件</div>
}
```

React.createRef 的底层逻辑很简单:

```js
// react/src/ReactCreateRef.js
export function createRef() {
  const refObject = {
    current: null,
  }
  return refObject;
}
```

createRef 只做了一件事，就是创建了一个对象，对象上的 current 属性，用于保存通过 ref 获取的 DOM 元素，组件实例等。 createRef 一般用于类组件创建 Ref 对象，可以将 Ref 对象绑定在类组件实例上，这样更方便后续操作 Ref。

::: danger 注意
不要在函数组件中使用 createRef，否则会造成 Ref 对象内容丢失等情况
:::

### 函数组件 useRef

```js
export default function Index(){
    const currentDom = React.useRef(null)
    React.useEffect(()=>{
        console.log( currentDom.current ) // div
    },[])
    return  <div ref={ currentDom } >ref对象模式获取元素或组件</div>
}
```

useRef 底层逻辑是和 createRef 差不多，就是 ref 保存位置不相同，类组件有一个实例 instance 能够维护像 ref 这种信息，但是由于函数组件每次更新都是一次新的开始，所有变量重新声明，所以 useRef 不能像 createRef 把 ref 对象直接暴露出去，如果这样每一次函数组件执行就会重新声明 Ref，此时 ref 就会随着函数组件执行被重置，这就解释了在函数组件中为什么不能用 createRef 的原因。

为了解决这个问题，hooks 和函数组件对应的 fiber 对象建立起关联，将 useRef 产生的 ref 对象挂到函数组件对应的 fiber 上，函数组件每次执行，只要组件不被销毁，函数组件对应的 fiber 对象一直存在，所以 ref 等信息就会被保存下来

## Ref 属性的处理 - 标记 ref

首先明确一个问题是 DOM 元素和组件实例 必须用 ref 对象获取吗？答案是否定的，React 类组件提供了多种方法获取 DOM 元素和组件实例，说白了就是 React 对标签里面 ref 属性的处理逻辑多样化。

### 类组件获取 Ref 三种方式

1. Ref 属性是一个字符串
2. Ref 属性是一个函数
3. Ref 属性是一个 ref 对象

#### 1. Ref 属性是一个字符串

```js
/* 类组件 */
class Children extends Component{  
    render=()=><div>hello,world</div>
}
/* TODO:  Ref属性是一个字符串 */
export default class Index extends React.Component{
    componentDidMount(){
       console.log(this.refs)
    }
    render=()=> <div>
        <div ref="currentDom"  >字符串模式获取元素或组件</div>
        <Children ref="currentComInstance"  />
    </div>
}
```

![ref1](/blog/images/react/ref1.png)

用一个字符串 ref 标记一个 DOM 元素，一个类组件(函数组件没有实例，不能被 Ref 标记)。React 在底层逻辑，会判断类型，如果是 DOM 元素，会把真实 DOM 绑定在组件 this.refs (组件实例下的 refs )属性上，如果是类组件，会把子组件的实例绑定在 this.refs 上。

#### 2. Ref 属性是一个函数

```js
class Children extends React.Component{  
    render=()=><div>hello,world</div>
}
/* TODO: Ref属性是一个函数 */
export default class Index extends React.Component{
    currentDom = null
    currentComponentInstance = null
    componentDidMount(){
        console.log(this.currentDom)
        console.log(this.currentComponentInstance)
    }
    render=()=> <div>
        <div ref={(node)=> this.currentDom = node }  >Ref模式获取元素或组件</div>
        <Children ref={(node) => this.currentComponentInstance = node  }  />
    </div>
}
```

![ref2](/blog/images/react/ref2.png)

当用一个函数来标记 Ref 的时候，将作为 callback 形式，等到真实 DOM 创建阶段，执行 callback ，获取的 DOM 元素或组件实例，将以回调函数第一个参数形式传入，所以可以像上述代码片段中，用组件实例下的属性 currentDom和 currentComponentInstance 来接收真实 DOM 和组件实例。

#### 3. Ref 属性是一个 ref 对象

```js
class Children extends React.Component{  
    render=()=><div>hello,world</div>
}
export default class Index extends React.Component{
    currentDom = React.createRef(null)
    currentComponentInstance = React.createRef(null)
    componentDidMount(){
        console.log(this.currentDom)
        console.log(this.currentComponentInstance)
    }
    render=()=> <div>
         <div ref={ this.currentDom }  >Ref对象模式获取元素或组件</div>
        <Children ref={ this.currentComponentInstance }  />
   </div>
}
```

![ref3](/blog/images/react/ref3.png)

## ref 高阶用法

除了上述功能之外，ref 派生出一些其他的高级用法，能够解决一些特殊场景下的问题，这些用法可以使项目中写的 React 更加灵活多变。

1. forwardRef 转发 Ref
2. ref 实现组件通信
3. 函数组件缓存数据

### forwardRef 转发 Ref

forwardRef 的初衷就是解决 ref 不能跨层级捕获和传递的问题。 forwardRef 接受了父级元素标记的 ref 信息，并把它转发下去，使得子组件可以通过 props 来接受到上一层级或者是更上层级的 ref。

1. 跨层级获取
2. 合并转发 ref
3. 高阶组件转发

#### 1. 跨层级获取

场景：想要通过标记子组件 ref ，来获取孙组件的某一 DOM 元素，或者是组件实例。想要在 GrandFather 组件通过标记 ref ，来获取孙组件 Son 的组件实例。

```js
// 孙组件
function Son (props){
    const { grandRef } = props
    return <div>
        <div> i am alien </div>
        <span ref={grandRef} >这个是想要获取元素</span>
    </div>
}
// 父组件
class Father extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return <div>
            <Son grandRef={this.props.grandRef}  />
        </div>
    }
}
const NewFather = React.forwardRef((props,ref)=> <Father grandRef={ref}  {...props} />)
// 爷组件
class GrandFather extends React.Component{
    constructor(props){
        super(props)
    }
    node = null 
    componentDidMount(){
        console.log(this.node) // span #text 这个是想要获取元素
    }
    render(){
        return <div>
            <NewFather ref={(node)=> this.node = node } />
        </div>
    }
}
```

forwardRef 把 ref 变成了可以通过 props 传递和转发。forwardRef 实现如下：

```js
// 简化后
const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');

export function forwardRef(render) {
  const elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render,
  };

  return elementType;
}
```

注意这里的 `$$typeof`，尽管这里是 `REACT_FORWARD_REF_TYPE`，但最终创建的 React 元素的 `$$typeof` 依然为 `REACT_ELEMENT_TYPE`。

#### 2. 合并转发 ref

场景：通过 forwardRef 转发的 ref 不要理解为只能用来直接获取组件实例，DOM 元素，也可以用来传递合并之后的自定义的 ref。想通过 Home 绑定 ref，来获取子组件 Index 的实例 index，dom 元素 button，以及孙组件 Form 的实例：

```js
// 表单组件
class Form extends React.Component{
    render(){
       return <div>{...}</div>
    }
}
// index 组件
class Index extends React.Component{ 
    componentDidMount(){
        const { forwardRef } = this.props
        forwardRef.current={
            form:this.form,      // 给form组件实例 ，绑定给 ref form属性 
            index:this,          // 给index组件实例 ，绑定给 ref index属性 
            button:this.button,  // 给button dom 元素，绑定给 ref button属性 
        }
    }
    form = null
    button = null
    render(){
        return <div   > 
          <button ref={(button)=> this.button = button }  >点击</button>
          <Form  ref={(form) => this.form = form }  />  
      </div>
    }
}
const ForwardRefIndex = React.forwardRef(( props,ref )=><Index  {...props} forwardRef={ref}  />)
// home 组件
export default function Home(){
    const ref = useRef(null)
     useEffect(()=>{
         console.log(ref.current)
     },[])
    return <ForwardRefIndex ref={ref} />
}
```

1. 通过 useRef 创建一个 ref 对象，通过 forwardRef 将当前 ref 对象传递给子组件。
2. 向 Home 组件传递的 ref 对象上，绑定 form 孙组件实例，index 子组件实例，和 button DOM 元素。

forwardRef 让 ref 可以通过 props 传递，那么如果用 ref 对象标记的 ref ，那么 ref 对象就可以通过 props 的形式，提供给子孙组件消费，当然子孙组件也可以改变 ref 对象里面的属性，或者像如上代码中赋予新的属性，这种 forwardref + ref 模式一定程度上打破了 React 单向数据流动的原则。当然绑定在 ref 对象上的属性，不限于组件实例或者 DOM 元素，也可以是属性值或方法。

#### 3. 高阶组件转发

如果通过高阶组件包裹一个原始类组件，就会产生一个问题，如果高阶组件 HOC 没有处理 ref ，那么由于高阶组件本身会返回一个新组件，所以当使用 HOC 包装后组件的时候，标记的 ref 会指向 HOC 返回的组件，而并不是 HOC 包裹的原始类组件，为了解决这个问题，forwardRef 可以对 HOC 做一层处理。

```js
function HOC(Component){
  class Wrap extends React.Component{
     render(){
        const { forwardedRef ,...otherprops  } = this.props
        return <Component ref={forwardedRef}  {...otherprops}  />
     }
  }
  return  React.forwardRef((props,ref)=> <Wrap forwardedRef={ref} {...props} /> ) 
}
class Index extends React.Component{
  render(){
    return <div>hello,world</div>
  }
}
const HocIndex =  HOC(Index)
export default ()=>{
  const node = useRef(null)
  useEffect(()=>{
    console.log(node.current)  /* Index 组件实例  */ 
  },[])
  return <div><HocIndex ref={node}  /></div>
}
```

经过 forwardRef 处理后的 HOC ，就可以正常访问到 Index 组件实例了。

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

### 函数组件缓存数据

函数组件每一次 render ，函数上下文会重新执行，那么有一种情况就是，在执行一些事件方法改变数据或者保存新数据的时候，有没有必要更新视图，有没有必要把数据放到 state 中。如果视图层更新不依赖想要改变的数据，那么 state 改变带来的更新效果就是多余的。这时候更新无疑是一种性能上的浪费。

这种情况下，useRef 就派上用场了，上面讲到过，useRef 可以创建出一个 ref 原始对象，只要组件没有销毁，ref 对象就一直存在，那么完全可以把一些不依赖于视图更新的数据储存到 ref 对象中。这样做的好处有两个：

- 第一个能够直接修改数据，不会造成函数组件冗余的更新作用。
- 第二个 useRef 保存数据，如果有 useEffect ，useMemo 引用 ref 对象中的数据，无须将 ref 对象添加成 dep 依赖项，因为 useRef 始终指向一个内存空间，所以这样一点好处是可以随时访问到变化后的值。

```js
const toLearn = [ { type: 1 , mes:'let us learn React' } , { type:2,mes:'let us learn Vue3.0' }  ]
export default function Index({ id }){
    const typeInfo = React.useRef(toLearn[0])
    const changeType = (info)=>{
        typeInfo.current = info /* typeInfo 的改变，不需要视图变化 */
    }
    useEffect(()=>{
       if(typeInfo.current.type===1){
           /* ... */
       }
    },[ id ]) /* 无须将 typeInfo 添加依赖项  */
    return <div>
        {
            toLearn.map(item=> <button key={item.type}  onClick={ changeType.bind(null,item) } >{ item.mes }</button> )
        }
    </div>
}
```

- 用一个 useRef 保存 type 的信息，type 改变不需要视图变化。
- 按钮切换直接改变 useRef 内容。
- useEffect 里面可以直接访问到改变后的 typeInfo 的内容，不需要添加依赖项。

## ref 原理揭秘

```js
export default class Index extends React.Component{
    state={ num:0 }
    node = null
    render(){
        return <div >
            <div ref={(node)=>{
               this.node = node
               console.log('此时的参数是什么：', this.node )
            }}  >ref元素节点</div>
            <button onClick={()=> this.setState({ num: this.state.num + 1  }) } >点击</button>
        </div>
    }
}
```

用回调函数方式处理 Ref ，如果点击一次按钮，会打印几次 console.log ？

第一次打印为 null ，第二次才是 div ，为什么会这样呢？ 这样的意义又是什么呢？

### ref 执行时机和处理逻辑

对于整个 Ref 的处理，都是在 commit 阶段发生的。之前了解过 commit 阶段会进行真正的 Dom 操作，此时 ref 就是用来获取真实的 DOM 以及组件实例的，所以需要 commit 阶段处理。

但是对于 Ref 处理函数，React 底层用两个方法处理：commitDetachRef 和 commitAttachRef ，上述两次 console.log 一次为 null，一次为div 就是分别调用了上述的方法。这两次正正好好，一次在 DOM 更新之前，一次在 DOM 更新之后。

- 第一阶段：一次更新中，在 commit 的 mutation 阶段, 执行 commitDetachRef，commitDetachRef 会清空之前ref值，使其重置为 null

```js
// react-reconciler/src/ReactFiberCommitWork.js
function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  if (currentRef !== null) {
    if (typeof currentRef === 'function') { /* function 和 字符串获取方式。 */
      currentRef(null); 
    } else {   /* Ref对象获取方式 */
      currentRef.current = null;
    }
  }
}
```

- 第二阶段：DOM 更新阶段，这个阶段会根据不同的 effect 标签，真实的操作 DOM 。

- 第三阶段：layout 阶段，在更新真实元素节点之后，此时需要更新 ref 。

```js
// react-reconciler/src/ReactFiberCommitWork.js
function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;
    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent: //元素节点 获取元素
        instanceToUse = getPublicInstance(instance);
        break;
      default:  // 类组件直接使用实例
        instanceToUse = instance;
    }
    if (typeof ref === 'function') {
      ref(instanceToUse);  //* function 和 字符串获取方式。 */
    } else {
      ref.current = instanceToUse; /* ref对象方式 */
    }
  }
}
```

这一阶段，主要判断 ref 获取的是组件还是 DOM 元素标签，如果 DOM 元素，就会获取更新之后最新的 DOM 元素。上面流程中讲了三种获取 ref 的方式。 如果是字符串 ref="node" 或是 函数式 ref={(node)=> this.node = node } 会执行 ref 函数，重置新的 ref 。如果是 ref 对象方式，会更新 ref 对象的 current 属性，达到更新 ref 对象的目的。

为什么 ref="node" 字符串，最后会按照函数方式处理呢？

因为当 ref 属性是一个字符串的时候，React 会自动绑定一个函数，用来处理 ref 逻辑：

```js
// react-reconciler/src/ReactChildFiber.js
const ref = function(value) {
    let refs = inst.refs;
    if (refs === emptyRefsObject) {
        refs = inst.refs = {};
    }
    if (value === null) {
        delete refs[stringRef];
    } else {
        refs[stringRef] = value;
    }
};
```

所以当这样绑定 ref="node"，会被绑定在组件实例的 refs 属性下面。比如：

```js
<div ref="node" ></div>
```

ref 函数 在 commitAttachRef 中最终会这么处理：

```js
ref(<div>) 
// 等于 inst.refs.node = <div>
```

### Ref 的处理特性

上述没有提及的一个问题，React 被 ref 标记的 fiber，那么每一次 fiber 更新都会调用 commitDetachRef 和 commitAttachRef 更新 Ref 吗 ？

答案是否定的，只有在 ref 更新的时候，才会调用如上方法更新 ref ，究其原因还要从如上两个方法的执行时期说起

### 更新 ref

在 commit 阶段 commitDetachRef 和 commitAttachRef 是在什么条件下被执行的呢

#### commitDetachRef 调用时机

```js
// react-reconciler/src/ReactFiberWorkLoop.js
function commitMutationEffects(){
     if (effectTag & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }
}
```

#### commitAttachRef 调用时机

```js
function commitLayoutEffects(){
     if (effectTag & Ref) {
      commitAttachRef(nextEffect);
    }
}
```

从上可以清晰的看到只有含有 Ref tag 的时候，才会执行更新 ref，那么是每一次更新都会打 Ref tag 吗？

```js
// react-reconciler/src/ReactFiberBeginWork.js
function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||      // 初始化的时候
    (current !== null && current.ref !== ref)  // ref 指向发生改变
  ) {
    workInProgress.effectTag |= Ref;
  }
}
```

首先 markRef 方法执行在两种情况下：

- 第一种就是类组件的更新过程中。
- 第二种就是更新 HostComponent 的时候，什么是 HostComponent 就不必多说了，比如 `<div />` 等元素。

markRef 会在以下两种情况下给 effectTag 标记 Ref，只有标记了 Ref tag 才会有后续的 commitAttachRef 和 commitDetachRef 流程。（ current 为当前调和的 fiber 节点 ）

- 第一种 current === null && ref !== null：就是在 fiber 初始化的时候，第一次 ref 处理的时候，是一定要标记 Ref 的。
- 第二种 current !== null && current.ref !== ref：就是 fiber 更新的时候，但是 ref 对象的指向变了。

只有在 Ref tag 存在的时候才会更新 ref ，那么回到最初的 DemoRef 上来，为什么每一次按钮，都会打印 ref ，那么也就是 ref 的回调函数执行了，ref 更新了。

```js
<div ref={(node)=>{
               this.node = node
               console.log('此时的参数是什么：', this.node )
}}>ref元素节点</div>
```

每一次更新的时候，都给 ref 赋值了新的函数，那么 markRef 中就会判断成 current.ref !== ref，所以就会重新打 Ref 标签，那么在 commit 阶段，就会更新 ref 执行 ref 回调函数了。

```js
export default class Index extends React.Component{
    state={ num:0 }
    node = null
    getDom= (node)=>{
        this.node = node
        console.log('此时的参数是什么：', this.node )
     }
    render(){
        return <div >
            <div ref={this.getDom}>ref元素节点</div>
            <button onClick={()=> this.setState({ num: this.state.num + 1  })} >点击</button>
        </div>
    }
}
```

在点击按钮更新的时候，由于此时 ref 指向相同的函数 getDom ，所以就不会打 Ref 标签，不会更新 ref 逻辑，直观上的体现就是 getDom 函数不会再执行。

### 卸载 ref

上述讲了 ref 更新阶段的特点，接下来分析一下当组件或者元素卸载的时候，ref 的处理逻辑是怎么样的。

被卸载的 fiber 会被打成 Deletion effect tag ，然后在 commit 阶段会进行 commitDeletion 流程。对于有 ref 标记的 ClassComponent （类组件） 和 HostComponent （元素），会统一走 safelyDetachRef 流程，这个方法就是用来卸载 ref。

```js
// react-reconciler/src/ReactFiberCommitWork.js
function safelyDetachRef(current) {
  const ref = current.ref;
  if (ref !== null) {
    if (typeof ref === 'function') {  // 函数式 ｜ 字符串
        ref(null)
    } else {
      ref.current = null;  // ref 对象
    }
  }
}
```

对于字符串 `ref="dom"` 和函数类型 `ref={(node)=> this.node = node }` 的 ref，会执行传入 null 置空 ref 。
对于 ref 对象类型，会清空 ref 对象上的 current 属性。

![ref5](/blog/images/react/ref5.png)

[一文弄懂 React ref](https://juejin.cn/post/7175174485534834749)

[React 之 Refs 的使用和 forwardRef 的源码解读](https://juejin.cn/post/7161719602652086308)

[从 React 源码彻底搞懂 Ref 的全部 api](https://juejin.cn/post/7166224289383841823)

[精读《useRef 与 createRef 的区别》](https://juejin.cn/post/6844904079164964878)
