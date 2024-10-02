# React Context

为什么 React 会提供 context 的 API 呢？

首先假设一个场景：在 React 的项目有一个全局变量 theme（ theme 可能是初始化数据交互获得的，也有可能是切换主题变化的），有一些视图 UI 组件（比如表单 input 框、button 按钮），需要 theme 里面的变量来做对应的视图渲染，现在的问题是怎么能够把 theme 传递下去，合理分配到用到这个 theme 的地方。

那么，首先想到的是 props 的可行性，如果让 props 来解决上述问题可以是可以，不过会有两个问题。假设项目的组件树情况如下图所示，因为在设计整个项目的时候，不确定将来哪一个模块需要 theme ，所以必须将 theme 在根组件 A 注入，但是需要给组件 N 传递 props ，需要在上面每一层都去手动绑定 props ，如果将来其他子分支上有更深层的组件需要 theme ，还需要把上一级的组件全部绑定传递 props ，这样维护成本是巨大的

假设需要动态改变 theme ，那么需要从根组件更新，只要需要 theme 的组件，由它开始到根组件的一条组件链结构都需要更新，会造成牵一发动全身的影响。props 方式看来不切实际。

为了解决上述 props 传递的两个问题，React提供了context‘上下文’模式，具体模式是这样的，React组件树A节点，用Provider提供者注入theme，然后在需要theme的地方，用 Consumer 消费者形式取出theme，供给组件渲染使用即可，这样减少很多无用功。用官网上的一句话形容就是Context 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。

但是必须注意一点是，提供者永远要在消费者上层，正所谓水往低处流，提供者一定要是消费者的某一层父级。

## 老版本 context

在v16.3.0之前，React 用 PropTypes 来声明 context 类型，提供者需要 getChildContext 来返回需要提供的 context ，并且用静态属性 childContextTypes 声明需要提供的 context 数据类型。具体如下:

老版本提供者：

```js
// 提供者
import propsTypes from 'proptypes'
class ProviderDemo extends React.Component{ 
    getChildContext(){
        const theme = { /* 提供者要提供的主题颜色，供消费者消费 */
            color:'#ccc',
            background:'pink'
        }
        return { theme }
    }
    render(){
        return <div>
            hello,let us learn React!
            <Son/>
        </div>
    }
 }

ProviderDemo.childContextTypes = {
    theme:propsTypes.object
}
```

老版本 api 在 v16 版本还能正常使用，对于提供者，需要通过 getChildContext 方法，将传递的 theme 信息返回出去，并通过 childContextTypes 声明要传递的 theme 是一个对象结构。声明类型需要propsTypes库来助力。

老版本消费者

```js
// 消费者
class ConsumerDemo extends React.Component{
   render(){
       console.log(this.context.theme) // {  color:'#ccc',  bgcolor:'pink' }
       const { color , background } = this.context.theme
       return <div style={{ color,background } } >消费者</div>
   }
}
ConsumerDemo.contextTypes = {
    theme:propsTypes.object
}

const Son = ()=> <ConsumerDemo/>
```

作为消费者，需要在组件的静态属性指明我到底需要哪个提供者提供的状态，在 demo 项目中，ConsumerDemo 的 contextTypes 明确的指明了需要 ProviderDemo 提供的 theme信息，然后就可以通过 this.context.theme 访问到 theme ，用做渲染消费。

这种模式和 vue 中的 provide 和 inject 数据传输模式很像，在提供者中声明到底传递什么，然后消费者指出需要哪个提供者提供的 context 。打个比方，就好比去一个高档餐厅，每一个厨师都可以理解成一个提供者，而且每个厨师各有所长，有的擅长中餐，有的擅长西餐，每个厨师都把擅长的用 childContextTypes 贴出来，你作为消费者，用 contextTypes 明确出想要吃哪个厨师做的餐饮，借此做到物尽所需。

## 新版本 context

上述的 API 用起来流程可能会很繁琐，而且还依赖于 propsTypes 等第三方库。所以 v16.3.0 之后，context api 正式发布了，所以可以直接用 createContext 创建出一个 context 上下文对象，context 对象提供两个组件，Provider和 Consumer作为新的提供者和消费者，这种 context 模式，更便捷的传递 context ，还增加了一些新的特性，但是也引出了一些新的问题

### 创建 context 上下文

createContext

```js
const ThemeContext = React.createContext(null) //
const ThemeProvider = ThemeContext.Provider  //提供者
const ThemeConsumer = ThemeContext.Consumer // 订阅消费者
```

createContext 接受一个参数，作为初始化 context 的内容，返回一个context 对象，Context 对象上的 Provider 作为提供者，Context 对象上的 Consumer 作为消费者。

### Provider 提供者

```js
const ThemeProvider = ThemeContext.Provider  //提供者
export default function ProviderDemo(){
    const [ contextValue , setContextValue ] = React.useState({  color:'#ccc', background:'pink' })
    return <div>
        <ThemeProvider value={ contextValue } > 
            <Son />
        </ThemeProvider>
    </div>
}
```

provider 作用有两个：

- value 属性传递 context，供给 Consumer 使用。
- value 属性改变，ThemeProvider 会让消费 Provider value 的组件重新渲染。

### Consumer 消费者

对于新版本想要获取 context 的消费者，React 提供了3种形式，接下来一一介绍这三种方式。

1. 类组件之contextType 方式
2. 函数组件之 useContext 方式

#### 1. 类组件之contextType 方式

React v16.6 提供了 contextType 静态属性，用来获取上面 Provider 提供的 value 属性，这里注意的是 contextType ，不是上述老版的 contextTypes

```js
const ThemeContext = React.createContext(null)
// 类组件 - contextType 方式
class ConsumerDemo extends React.Component{
   render(){
       const { color,background } = this.context
       return <div style={{ color,background } } >消费者</div> 
   }
}
ConsumerDemo.contextType = ThemeContext

const Son = ()=> <ConsumerDemo />
```

- 类组件的静态属性上的 contextType 属性，指向需要获取的 context（ demo 中的 ThemeContext ），就可以方便获取到最近一层 Provider 提供的 contextValue 值。
- 记住这种方式只适用于类组件。

#### 2. 函数组件之 useContext 方式

既然类组件都可以快捷获取 context 了，那么函数组件也应该研究一下如何快速获取 context 吧，于是乎 v16.8 React hooks 提供了 useContext，下面看一下 useContext 使用。

```js
const ThemeContext = React.createContext(null)
// 函数组件 - useContext方式
function ConsumerDemo(){
    const  contextValue = React.useContext(ThemeContext) /*  */
    const { color,background } = contextValue
    return <div style={{ color,background } } >消费者</div> 
}
const Son = ()=> <ConsumerDemo />
```

useContext 接受一个参数，就是想要获取的 context ，返回一个 value 值，就是最近的 provider 提供 contextValue 值。

#### 3. 订阅者之 Consumer 方式

React 还提供了一种 Consumer 订阅消费者方式，我们研究一下这种方式如何传递 context

```js
const ThemeConsumer = ThemeContext.Consumer // 订阅消费者

function ConsumerDemo(props){
    const { color,background } = props
    return <div style={{ color,background } } >消费者</div> 
}
const Son = () => (
    <ThemeConsumer>
       { /* 将 context 内容转化成 props  */ }
       { (contextValue)=> <ConsumerDemo  {...contextValue}  /> }
    </ThemeConsumer>
) 
```

Consumer 订阅者采取 render props 方式，接受最近一层 provider 中value 属性，作为 render props 函数的参数，可以将参数取出来，作为 props 混入 ConsumerDemo 组件，说白了就是 context 变成了 props。

### 动态 context

上面讲到的 context 都是静态的，不变的，但是实际的场景下，context 可能是动态的，可变的，比如说回到了本章节最开始的话题切换主题，因为切换主题就是在动态改变 context 的内容。所以接下来看一下动态改变 context 。

```js
function ConsumerDemo(){
     const { color,background } = React.useContext(ThemeContext)
    return <div style={{ color,background } } >消费者</div> 
}
const Son = React.memo(()=> <ConsumerDemo />) // 子组件

const ThemeProvider = ThemeContext.Provider //提供者
export default function ProviderDemo(){
    const [ contextValue , setContextValue ] = React.useState({  color:'#ccc', background:'pink' })
    return <div>
        <ThemeProvider value={ contextValue } >
            <Son />
        </ThemeProvider>
        <button onClick={ ()=> setContextValue({ color:'#fff' , background:'blue' })  } >切换主题</button>
    </div>
}
```

Provider 模式下 context 有一个显著的特点，就是 Provder 的 value 改变，会使所有消费 value 的组件重新渲染，如上通过一个 useState 来改变 contextValue 的值，contextValue 改变，会使 ConsumerDemo 自动更新，注意这个更新并不是由父组件 son render 造成的，因为给 son 用 memo 处理过，这种情况下，Son 没有触发 render，而是 ConsumerDemo 自发的 render。

### displayName

context 对象接受一个名为 displayName 的 property，类型为字符串。React DevTools 使用该字符串来确定 context 要显示的内容。

```js
const MyContext = React.createContext(/* 初始化内容 */);
MyContext.displayName = 'MyDisplayName';

<MyContext.Provider> // "MyDisplayName.Provider" 在 DevTools 中
<MyContext.Consumer> // "MyDisplayName.Consumer" 在 DevTools 中
```

### 小结

在 Provider 里 value 的改变，会使引用contextType,useContext 消费该 context 的组件重新 render ，同样会使 Consumer 的 children 函数重新执行，与前两种方式不同的是 Consumer 方式，当 context 内容改变的时候，不会让引用 Consumer 的父组件重新更新。

但是上述的 demo 暴露出一个问题，就是在上述 son 组件是用 memo 处理的，如果没有 memo 处理，useState 会让 ProviderDemo 重新 render ，此时 son 没有处理，就会跟随父组件 render ，问题是如果 son 还有很多子组件，那么全部 render 一遍。那么如何阻止 Provider value 改变造成的 children （ demo 中的 Son ）不必要的渲染？

1. 第一种就是利用 memo，pureComponent 对子组件 props 进行浅比较处理。

```js
const Son = React.memo(()=> <ConsumerDemo />) 
```

2. 第二种就是 React 本身对 React element 对象的缓存。React 每次执行 render 都会调用 createElement 形成新的 React element 对象，如果把 React element 缓存下来，下一次调和更新时候，就会跳过该 React element 对应 fiber 的更新。

```js
<ThemeProvider value={ contextValue } >
    { React.useMemo(()=>  <Son /> ,[]) }
</ThemeProvider>
```

## context 高阶用法

### 嵌套 Provider

多个 Provider 之间可以相互嵌套，来保存/切换一些全局数据：

```js
const ThemeContext = React.createContext(null) // 主题颜色Context
const LanContext = React.createContext(null) // 主题语言Context

function ConsumerDemo(){
    return <ThemeContext.Consumer>
        { (themeContextValue)=> (
            <LanContext.Consumer>
                { (lanContextValue) => {
                    const { color , background } = themeContextValue
                    return <div style={{ color,background } } > { lanContextValue === 'CH'  ? '大家好，让我们一起学习React!' : 'Hello, let us learn React!'  }  </div> 
                } }
            </LanContext.Consumer>
        )  }
    </ThemeContext.Consumer>
}

const Son = memo(()=> <ConsumerDemo />)
export default function ProviderDemo(){
    const [ themeContextValue ] = React.useState({  color:'#FFF', background:'blue' })
    const [ lanContextValue ] = React.useState('CH') // CH -> 中文 ， EN -> 英文
    return <ThemeContext.Provider value={themeContextValue}  >
         <LanContext.Provider value={lanContextValue} >
             <Son  />
         </LanContext.Provider>
    </ThemeContext.Provider>
}
```

- ThemeContext 保存主题信息，用 LanContext 保存语言信息。
- Theme两个 Provider 嵌套来传递全局信息。
- 用两个 Consumer 嵌套来接受信息。

### 逐层传递 Provider

Provider 还有一个良好的特性，就是可以逐层传递 context ，也就是一个 context 可以用多个 Provder 传递，下一层级的 Provder 会覆盖上一层级的 Provder 。React-redux 中 connect 就是用这个良好特性传递订阅器的。

```js
// 逐层传递Provder
const ThemeContext = React.createContext(null)
function Son2(){
    return <ThemeContext.Consumer>
        { (themeContextValue2)=>{
            const { color , background } = themeContextValue2
            return  <div  className="sonbox"  style={{ color,background } } >  第二层Provder </div>
        }  }
    </ThemeContext.Consumer>
}
function Son(){
    const { color, background } = React.useContext(ThemeContext)
    const [ themeContextValue2 ] = React.useState({  color:'#fff', background:'blue' }) 
    /* 第二层 Provder 传递内容 */
    return <div className='box' style={{ color,background } } >
        第一层Provder
        <ThemeContext.Provider value={ themeContextValue2 } >
            <Son2  />
        </ThemeContext.Provider>
    </div>

}

export default function Provider1Demo(){
    const [ themeContextValue ] = React.useState({  color:'orange', background:'pink' })
     /* 第一层  Provider 传递内容  */
    return <ThemeContext.Provider value={ themeContextValue } >
        <Son/>
    </ThemeContext.Provider> 
}
```

- 全局只有一个 ThemeContext ，两次用 provider 传递两个不同 context 。
- 组件获取 context 时候，会获取离当前组件最近的上一层 Provider 。
- 下一层的 provider 会覆盖上一层的 provider 。

Provider 特性总结：

1. Provider 作为提供者传递 context ，provider中value属性改变会使所有消费 context 的组件重新更新。
2. Provider可以逐层传递 context，下一层Provider会覆盖上一层 Provider。

## 主题切换实战

```js
const ThemeContext = React.createContext(null) // 主题颜色Context

const theme = { //主题颜色
    dark:{  color:'#1890ff' , background:'#1890ff', border: '1px solid blue' ,type:'dark',  },
    light: {  color:'#fc4838' , background:'#fc4838', border: '1px solid pink' ,type:'light'  }
}

/* input输入框 - useContext 模式 */
function Input(props){
    const  { color,border } = useContext(ThemeContext)
    const { label , placeholder } = props
    return <div>
        <label style={{ color }} >{ label }</label>
        <input className="input" placeholder={placeholder}  style={{ border }} />
    </div>
}
/* 容器组件 -  Consumer模式 */
function Box(props){
    return <ThemeContext.Consumer>
        { (themeContextValue)=>{
            const { border,color } = themeContextValue
            return <div className="context_box" style={{ border,color }} >
            { props.children }
        </div>
        } }
    </ThemeContext.Consumer>
}

function  Checkbox (props){
    const { label ,name, onChange } = props
    const { type , color } = React.useContext(ThemeContext)
    return <div className="checkbox"  onClick={onChange} >
        <label htmlFor="name" > {label} </label>
       <input type="checkbox" id={name} value={type} name={name} checked={ type === name }  style={{ color } } />
    </div>
}

// contextType 模式
class App extends React.PureComponent{
    static contextType = ThemeContext
    render(){
        const { border , setTheme ,color  ,background} = this.context
        return <div className="context_app" style={{ border , color }}  >
          <div className="context_change_theme"   >
             <span> 选择主题： </span>
             <Checkbox label="light"  name="light" onChange={ ()=> setTheme(theme.light) }  />
             <Checkbox label="dark" name="dark"  onChange={ ()=> setTheme(theme.dark) }   />
          </div>
          <div className='box_content' >
            <Box >
                <Input label="姓名："  placeholder="请输入姓名"  />
                <Input label="age："  placeholder="请输入年龄"  />
                <button className="searchbtn" style={ { background } } >确定</button>
                <button className="concellbtn" style={ { color } } >取消</button>
            </Box>
            <Box >
                <HomeOutlined  twoToneColor={ color } />
                <SettingFilled twoToneColor={ color }  />
                <SmileOutlined twoToneColor={ color }  />
                <SyncOutlined spin  twoToneColor={ color }  />
                <SmileOutlined twoToneColor={ color }  rotate={180} />
                <LoadingOutlined twoToneColor={ color }   />
            </Box>
            <Box >
                <div className="person_des" style={{ color:'#fff' , background }}  >
                    I am alien  <br/>
                    let us learn React!
                </div>
            </Box>
          </div>
     </div>
    }
}

export default function (){
    const [ themeContextValue ,setThemeContext ] = React.useState(theme.dark) 
    /* 传递颜色主题 和 改变主题的方法 */
    return <ThemeContext.Provider value={ { ...themeContextValue, setTheme:setThemeContext  } } >
        <App/>
    </ThemeContext.Provider>
}
```

- 在 Root 组件中，用 Provider 把主题颜色 themeContextValue 和改变主题的 setTheme 传入 context 。
- 在 App 中切换主题。
- 封装统一的 Input Checkbox Box 组件，组件内部消费主题颜色的 context ，主题改变，统一更新，这样就不必在每一个模块都绑定主题，统一使用主体组件就可以了。

## 问题

### Q1. context 与 props 和 react-redux 的对比？

context解决了：

1. 解决了 props 需要每一层都手动添加 props 的缺陷。
2. 解决了改变 value ，组件全部重新渲染的缺陷。

react-redux 就是通过 Provider 模式把 redux 中的 store 注入到组件中的。

### Q2. 如何解决 Context Provider 提供的对象可能引起的重复渲染问题？

当 Context Provider 接收的 value 发生变化的时候，React 会向下深度优先遍历组件树，找到消费了该 Context 的组件并标志为需要更新，在组件更新的 render 阶段，这些消费了该 Context 的组件就会重新渲染，读取到最新的 Context 值。我们通常传递给 Context Provider 的 value 是一个对象，对象里包含多个字段，然而这种常见的场景却可能导致多次不必要的重复渲染。

解决方案： [use-context-selector](https://www.npmjs.com/package/use-context-selector)，它可以让我们从 context value 中选择你会用到的状态，且只有在这些被选择的状态更新时，才会使组件重新渲染。

[从 0 实现 use-context-selector](https://mp.weixin.qq.com/s/vp7Jfxh7AmseD6L1NVpvZA)
