# 初始化与降级处理

在这一节，我们会分析 VueRouter 类及其构造方法、路由初始化工作和路由模式降级处理原理，有关代码在 index.js 入口文件中。
在阅读这部分源码时，参考 [官方 vue-router 的 API 参考文档](https://router.vuejs.org/zh/api/) 会理解的更好。 

## VueRouter 类

首先还是先看看代码骨架，从整体认识：

```javascript
/* 导出的VueRouter对象，用来包装store */
export default class VueRouter {
    constructor (options: RouterOptions = {}) { /*...*/}
    
    match (
        raw: RawLocation,
        current?: Route,
        redirectedFrom?: Location
     ): Route {/*...*/}
     
     /* 当前路由对应的路由信息对象 */
     get currentRoute (): ?Route {/*...*/}
     
     init (app: any /* Vue component instance */) {/*...*/}
}
```
在 VueRouter 类中定义了一些属性和方法，我们关注的重点有 **`constructor (options: RouterOptions = {})`** 构造方法，
**`match`** 匹配方法以及 **`init()`** 初始化操作。

接下来具体分析

## 构造方法及降级处理

当我们执行  new VueRouter() 时，会执行构造方法，那么我们看看构造方法中做了哪些事情：

```javascript
/* scr/index.js */

constructor (options: RouterOptions = {}) {
    this.app = null // vue根实例
    this.apps = [] // 保存有$options.router 属性的 Vue 实例
    this.options = options // 传入的路由配置
    /* 一些钩子函数 */
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    /*  this.matcher 创建核心的matcher对象 路由匹配器*/
    this.matcher = createMatcher(options.routes || [], this)
    /* 默认hash模式 */
    let mode = options.mode || 'hash'
    /* 是否降级处理
       this.fallback 选择了history模式但是浏览器不支持 则回退到hash路由 降级处理*/
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    /* 降级为hash模式（显示声明为hash模式 | 不支持history模式 | 要求降级fallback:true）*/
    if (this.fallback) {
      mode = 'hash'
    }
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode // this.mode路由模式
    /**
    * 根据mode来新建不同的实例（HTML5History | HashHistory | AbstractHistory）给history属性
    * 根据 history 的类型，采取不同的方式切换路由
    */
    switch (mode) {
      /*  this.history 路由历史的具体的实现实例  */
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }
```
构造函数定义了一些属性，其中 `this.app `表示**根 Vue 实例**，`this.apps` 保存`持有 $options.router 属性的 Vue 实例`，
`this.options` 保存传入的**路由配置**，`this.beforeHooks`、` this.resolveHooks`、`this.afterHooks` 表示一些**钩子函数**，
我们之后会介绍，`this.matcher` 表示**路由匹配器**，我们之后会介绍，`this.fallback` 表示在浏览器不支持 history.pushState 的情况下，
根据传入的 fallback 配置参数，**决定是否回退到 hash 模式**，
`this.mode` 表示**路由**创建的**模式**，`this.history` 表示**路由历史的具体的实现实例**，
它是根据 this.mode 的不同实现不同，它有 `History 基类`，然后不同的 history 实现都是继承 History。

::: tip 路由模式
- hash: 使用 URL hash 值来作路由。支持所有浏览器，包括不支持 HTML5 History Api 的浏览器。
- history: 依赖 HTML5 History API 和服务器配置。可查看 HTML5 History 模式。
- abstract: 支持所有 JavaScript 运行环境，如 Node.js 服务器端。如果发现没有浏览器的 API，路由会自动强制进入这个模式。
:::

vue-router 默认是 hash 模式 ， 即使用 URL 的 hash 来模拟一个完整的 URL ，于是当 URL 改变时，页面不会重新加载。

vue-router 还支持 history 模式，这种模式充分利用了 history.pushState 来完成 URL 跳转,在不支持 history.pushState 的浏览器，
会自动会退到 hash 模式。

判断是否支持 history ， 然后根据 fallback 来确定是否要降级。接着根据不同的 mode，
分别实例化不同的 history ：HTML5History、HashHistory、AbstractHistory。

那么，接下来我们就剖析一下 VueRouter 构造方法中根据 mode 路由模式是如何实例化不同的 history 的。

## 实例化不同的 history

三种不同的 history 实例 `HTML5History`、`HashHistory`、`AbstractHistory` 分别在 history 文件夹中的 
`html5.js` 、`hash.js` 以及 `abstract.js`。除此之外，还有个`base.js`，这个文件中主要定义了一个` History 基类`，而
`HTML5History`、`HashHistory`、`AbstractHistory`  这仨实例均**继承自** `History 基类`。

```text
├── history  // 操作浏览器记录的一系列内容
│   ├── abstract.js  // 非浏览器的history
│   ├── base.js    // 基本的history
│   ├── hash.js    // hash模式的history
│   └── html5.js   // html5模式的history
```
`HTML5History`、`HashHistory`、`AbstractHistory`  分别继承了 `History 基类` 中的方法，并实现了自己特有的逻辑。
从外部调用的时候，会直接调用到 this.history , 然后，由于初始化对象的不同，而进行不同的操作。

上述，先对 history 初步了解一下，我们在后续介绍完一些核心逻辑（比如，路由切换transitionTo，路由匹配等）后，再后头做
进一步的分析。

::: tip 总结
到此，我们知道了 VueRouter 的构造方法主要做了以下事情：
- 定义了一些实例属性，钩子函数对象
- 根据路由模式 `mode` 降级处理
- 根据 `mode` 实例化不同的 history (后续会深入)。
::: 

我们知道实例化 VueRouter（new VueRouter()） 后会返回它的实例 router，我们在 new Vue 的时候会把 router 作为配置的属性传入，
回顾一下上一节我们讲 beforeCreate 混入的时候有这么一段代码：
```javascript
beforeCreate() {
  if (isDef(this.$options.router)) {
    // ...
    this._router = this.$options.router
    this._router.init(this)
    // ...
  }
}  
```
组件在执行 beforeCreate 钩子函数的时候，如果传入了 router 实例，都会执行 router.init 方法,
下面我们就分析一下 VueRouter 的初始化操作：

## 初始化 router 实例

```javascript
/* src/index.js */

init (app: any /* Vue component instance 参数：app 为vue根实例 构造函数中定义的 */) {
    process.env.NODE_ENV !== 'production' && assert(
      install.installed,
      `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
      `before creating root instance.`
    )
    /**
    * this.apps 保存有$options.router 属性的 Vue 实例 将当前vm实例保存在app中
    * app为在router对象初始化时执行init方法的参数（根实例）
    * 将根实例添加到apps数组中（用于多次执行 VueRouter 创建多个实例，比较少用）
    */
    this.apps.push(app)

    // main app already initialized.
    /* 判断是否初始化过，保证app实例只有一个 */
    if (this.app) {
      return
    }

    this.app = app // this.app保存当前vm实例

    const history = this.history // this.history路由历史实例

    /* 根据不同的路由历史实例 做相应的操作 进行路由切换 后面详细分析*/
    if (history instanceof HTML5History) {
      history.transitionTo(history.getCurrentLocation())
    } else if (history instanceof HashHistory) {
      const setupHashListener = () => {
        history.setupListeners()
      }
      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener, // 成功回调(给哈希路由的模式监听浏览器的popState和hashchange)
        setupHashListener // 取消回调
      )
    }
    /**
    * 注册回调，当history发生改变后会执行回调（src/history/base.js:221）
    * 即修改_route属性，因为_route属性是一个视图依赖的响应式变量，
    * 所以会触发视图的重新渲染至于触发 _route 的 setter 为什么会更新视图，
    * 请参考 router-view 组件 
    */
    history.listen(route => {
      this.apps.forEach((app) => {
        app._route = route
      })
    })
  }
```

初始化时传入 Vue 实例（参数app），然后存储到 this.apps 中；只有根 Vue 实例会保存到 this.app 中，接着拿到当前的路由历史实例 this.history，
判断实例类型执行不同逻辑。如果是 history 模式，则直接执行 history.transitionTo 方法；如果是 hash 模式，则先定义一个 setupHashListener 函数，
接着执行 history.transitionTo 方法，它是定义在 History 基类中：

```javascript
/* src/history/base.js */

 transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
   const route = this.router.match(location, this.current)
   // more 具体逻辑后续分析
 }
```
两种模式执行 history.transitionTo 方法时，都先执行了 history.getCurrentLocation() 它在 history 中是这样定义的：
```javascript
/* src/history/html5.js */

getCurrentLocation (): string {
    return getLocation(this.base)
  }
```
在 hash 中是这样定义的：
```javascript
/* src/history/hash.js */

getCurrentLocation () {
    return getHash()
  }
```

我们先不去看 transitionTo 的具体逻辑(后续会分析)，先看第一行代码，它调用了 this.router.match 方法,
match方法定义在 VueRouter 类中：
```javascript
/* src/index.js */

 match (
    raw: RawLocation,
    current?: Route,
    redirectedFrom?: Location
  ): Route {
    return this.matcher.match(raw, current, redirectedFrom)
  }
```
如你所见，实际调用了 this.matcher.match() 去做路由匹配。

::: tip 总结
初始化 VueRouter 时传入 Vue 实例（参数app），然后存储到 this.apps 中；只有根 Vue 实例会保存到 this.app 中，接着拿到当前的路由历史实例 this.history，
判断实例类型执行不同逻辑。如果是 history 模式，则直接执行 history.transitionTo 方法；如果是 hash 模式，则先定义一个 setupHashListener 函数，
再执行 history.transitionTo 方法，完成初始化。执行 transitionTo 路由切换方法时，执行 match 路由匹配方法，接着执行 confirmTransition 导航确认方法。
然后 updateRoute更新路由，触发DOM更新。
:::

下面，我们就深入 transitionTo （路由过渡或叫路由切换）和 match （路由匹配）的相关实现


