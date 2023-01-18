# React Router

## 三者关系

弄清楚 Router 原理之前，用一幅图表示 History ，React-Router ， React-Router-Dom 三者的关系。

![reactRouter1](/blog/images/react/reactRouter1.png)

- history： history 是整个 React-router 的核心，里面包括两种路由模式下改变路由的方法，和监听路由变化方法等。
- react-router：既然有了 history 路由监听/改变的核心，那么需要调度组件负责派发这些路由的更新，也需要容器组件通过路由更新，来渲染视图。所以说 React-router 在 history 核心基础上，增加了 Router ，Switch ，Route 等组件来处理视图渲染。
- react-router-dom： 在 react-router 基础上，增加了一些 UI 层面的拓展比如 Link ，NavLink 。以及两种模式的根部路由 BrowserRouter ，HashRouter 。

## 路由原理

对于 BrowserRouter 或者是 HashRouter，实际上原理很简单，就是React-Router-dom 根据 history 提供的 createBrowserHistory 或者 createHashHistory 创建出不同的 history 对象。

### BrowserHistory 模式

创建路由：通过 createBrowserHistory 创建一个 history 对象，并传递给 Router 组件。

```js
// react-router-dom/modules/BrowserRouter.js
import { createBrowserHistory as createHistory } from "history";
class BrowserRouter extends React.Component {
  history = createHistory(this.props) 
  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}
```

改变路由：本质上是调用 `window.history.pushState` 和 `window.history.replaceState` 方法。

监听路由 popstate：同一个文档的 history 对象出现变化时，就会触发 popstate 事件。 `history.pushState` 可以使浏览器地址改变，但是无需刷新页面。注意的是：用 `history.pushState()` 或者 `history.replaceState()` 不会触发 popstate 事件。 popstate 事件只会在浏览器某些行为下触发, 比如点击后退、前进按钮或者调用 `history.back()`、`history.forward()`、`history.go()`方法。

### HashHistory 模式

改变路由 `window.location.hash`：通过 `window.location.hash` 属性获取和设置 hash 值。开发者在哈希路由模式下的应用中，切换路由，本质上是改变 `window.location.hash` 。

监听路由：hash 路由模式下，监听路由变化用的是 hashchange

## 路由组件

### Router

Router 是整个应用路由的传递者和派发更新者。 Router 作为一个传递路由和更新路由的容器，而 BrowserRouter 或 HashRouter 是不同模式下向容器 Router 中注入不同的 history 对象。

```js
// react-router/modules/Router.js
class Router extends React.Component{
    constructor(props){
        super(props)
        this.state = {
           location: props.history.location
        }
        this.unlisten = props.history.listen((location)=>{ /* 当路由发生变化，派发更新 */
            this.setState({ location })
        })
    }
    /* .... */
    componentWillUnmount(){  if (this.unlisten) this.unlisten() } 
    render(){
        return  <RouterContext.Provider  
            children={this.props.children || null}  
            value={{
                history: this.props.history, 
                location: this.state.location,
                match: Router.computeRootMatch(this.state.location.pathname),
                staticContext: this.props.staticContext
            }}
        />
    }
}
```

- 首先 React-Router 是通过 context 上下文方式传递的路由信息。在 context 章节讲过，context 改变，会使消费 context 组件更新，这就能合理解释了，当开发者触发路由改变，为什么能够重新渲染匹配组件。
- props.history 是通过 BrowserRouter 或 HashRouter 创建的history 对象，并传递过来的，当路由改变，会触发 listen 方法，传递新生成的 location ，然后通过 setState 来改变 context 中的 value ，所以改变路由，本质上是 location 改变带来的更新作用。

### Route

Route 是整个路由核心部分，它的工作主要就是一个： 匹配路由，路由匹配，渲染组件。 由于整个路由状态是用 context 传递的，所以 Route 可以通过 `RouterContext.Consumer` 来获取上一级传递来的路由进行路由匹配，如果匹配，渲染子代路由。并利用 context 逐层传递的特点，将自己的路由信息，向子代路由传递下去。这样也就能轻松实现了嵌套路由。

```js
function Index(){ 
    const mes = { name:'alien',say:'let us learn React!' }
    return <div>      
        <Meuns/>
        <Switch>
            <Route path='/router/component'   component={RouteComponent}   /> { /* Route Component形式 */ }
            <Route path='/router/render'  render={(props)=> <RouterRender { ...props }  /> }  {...mes}  /> { /* Render形式 */ }
            <Route path='/router/children'  > { /* chilren形式 */ }
                <RouterChildren  {...mes} />
            </Route>
            <Route path="/router/renderProps"  >
                { (props)=> <RouterRenderProps {...props} {...mes}  /> }  {/* renderProps形式 */}
            </Route>
        </Switch>
    </div>
}
export default Index
```

四种 Route 编写格式:

- **Component 形式**：将组件直接传递给 Route 的 component 属性，Route 可以将路由信息隐式注入到页面组件的 props 中，但是无法传递父组件中的信息，比如如上 mes 。
- **render 形式**：Route 组件的 render 属性，可以接受一个渲染函数，函数参数就是路由信息，可以传递给页面组件，还可以混入父组件信息。
- **children 形式**：直接作为 children 属性来渲染子组件，但是这样无法直接向子组件传递路由信息，但是可以混入父组件信息。
- **renderProps 形式**：可以将 childen 作为渲染函数执行，可以传递路由信息，也可以传递父组件信息。

Route 可以加上 exact ，来进行精确匹配，精确匹配原则，pathname 必须和 Route 的 path 完全匹配，才能展示该路由信息。所以如果是嵌套路由的父路由，千万不要加 exact=true 属性。换句话只要当前路由下有嵌套子路由，就不要加 exact 。

### Switch

Switch Switch 作用就是匹配唯一正确的路由并渲染。每个页面路由展示与否，是通过 Route 内部 location 信息匹配的。

### Redirect

假设有下面两种情况：

- 当如果修改地址栏或者调用 api 跳转路由的时候，当找不到匹配的路由的时候，并且还不想让页面空白，那么需要重定向一个页面。

- 当页面跳转到一个无权限的页面，期望不能展示空白页面，需要重定向跳转到一个无权限页面。

这时候就需要重定向组件 Redirect ，Redirect 可以在路由不匹配情况下跳转指定某一路由，适合路由不匹配或权限路由的情况。

::: danger 注意
Switch 包裹的 Redirect 要放在最下面，否则会被 Switch 优先渲染 Redirect ，导致路由页面无法展示。
:::

### 跳转流程图

![reactRouter2](/blog/images/react/reactRouter2.png)

## 使用指南

### 路由状态获取

对于路由状态获取，首先如果想要在一些子页面中获取 history 或者 location ，实现路由匹配或者路由跳转。

#### 1. 路由组件 props

被 Route 包裹的路由组件 props 中会默认混入 history 等信息，那么如果路由组件的子组件也想共享路由状态信息和改变路由的方法，那么 props 可以是一个很好的选择。

#### 2. withRouter

对于距离路由组件比较远的深层次组件，通常可以用 react-router 提供的 withRouter 高阶组件方式获取 histroy ，loaction 等信息。

```js
import { withRouter } from 'react-router-dom'
@withRouter
class Home extends React.Component{
    componentDidMount(){
        console.log(this.props.history)
    }
    render(){
        return <div>
            { /* ....*/ }
        </div>
    }
}
```

#### 3. useHistory 和 useLocation

对于函数组件，可以用 React-router 提供的自定义 hooks 中的 useHistory 获取 history 对象，用 useLocation 获取 location 对象。

```js
import { useHistory ,useLocation  } from 'react-router-dom'
function Home(){
    const history = useHistory() /* 获取history信息 */
    const useLocation = useLocation() /* 获取location信息 */
}
```

::: danger 注意
无论是 withRouter ，还是 hooks ，都是从保存的上下文中获取的路由信息，所以要保证想要获取路由信息的页面，都在根部 Router 内部。
:::

### 路由带参数跳转

关于路由跳转有声明式路由和函数式路由两种。

- 声明式：`<NavLink to='/home' />` ，利用 react-router-dom 里面的 `Link` 或者 `NavLink` 。
- 函数式：`histor.push('/home')` 。

有的时候页面间需要传递信息。这里介绍几种传递参数的方式：

#### 1. url 拼接

```js
const name = 'alien'
const mes = 'let us learn React!'
history.push(`/home?name=${name}&mes=${mes}`)
```

这种方式通过 url 拼接，比如想要传递的参数，会直接暴露在 url 上，而且需要对 url 参数，进行解析处理，实际开发中我不推荐这种方式，我更推荐下面的方式。

#### 2. state 路由状态

```js
const name = 'alien'
const mes = 'let us learn React!'
history.push({
    pathname:'/home',
    state:{
        name,
        mes
    }
})

const {state = {}} = this.prop.location
const { name , mes } = state
```

### 动态路径参数路由

```js
<Route path="/post/:id"  />

history.push('/post/'+id) // id为动态的文章id
```
