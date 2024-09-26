# 准备工作

## 目录结构

```text
├── components  // 两个组件
│   ├── link.js   // route-link组件的实现
│   └── view.js   // route-view组件的实现
├── history  // 路由历史记录的处理
│   ├── abstract.js  // 非浏览器的history
│   ├── base.js    // History 基类
│   ├── hash.js    // hash模式的history
│   └── html5.js   // html5模式的history
└── util   // 工具类库
    ├── async.js    // runQueue 异步操作的工具库
    ├── dom.js    // 判断是否在浏览器环境
    ├── location.js    // 对 location 的处理
    ├── misc.js     // 一个工具方法 extend 
    ├── params.js   // 处理参数
    ├── path.js     // 处理路径
    ├── push-state.js  // 处理html模式的 pushState
    ├── query.js  //对query的处理
    ├── resolve-components.js  //异步加载组件 
    ├── route.js  // 创建路由
    ├── scroll.js  //处理滚动
    └── warn.js  // 打印一些警告
├── create-matcher.js  // 路由匹配
├── create-route-map.js  // 路由映射与路由过渡
├── index.js   // 入口文件
├── install.js  // 插件安装的方法
```

## 使用 vue-router

我们使用 `vue-router` 时主要有以下几步：

- 第一步  `npm install vue-router --save`
- 第二步  导入`Vue`和`VueRoute` `模块化机制编程,要通过Vue.use(VueRouter)`
- 第三步  定义`组件`(路由组件)
- 第四步  定义`路由`(定义路由与组件映射表)【routes】
- 第五步  创建`配置参数实例`【router】 `const router = new VueRouter({routes:routes})` 其中 routes 是参数
- 第六步  创建和挂载根实例并将`router注入路由` `new Vue({router:router}).$mount('#app')` 其中 router 是参数

以上是自己总结的使用步骤，下面是官方的例子 <https://router.vuejs.org/zh/guide/>

#### HTML

```html
<div id="app">
  <h1>Hello App!</h1>
  <p>
    <!-- 使用 router-link 组件来导航. -->
    <!-- 通过传入 `to` 属性指定链接. -->
    <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
    <router-link to="/foo">Go to Foo</router-link>
    <router-link to="/bar">Go to Bar</router-link>
  </p>
  <!-- 路由出口 -->
  <!-- 路由匹配到的组件将渲染在这里 -->
  <router-view></router-view>
</div>
```

#### JavaScript

```javascript
// 如果使用模块化机制编程，导入Vue和VueRouter，要调用 Vue.use(VueRouter)

// 1. 定义 (路由) 组件。
// 可以从其他文件 import 进来
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

// 3. 创建 router 实例，然后传 `routes` 配置
// 你还可以传别的配置参数, 不过先这么简单着吧。
const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

// 4. 创建和挂载根实例。
// 记得要通过 router 配置参数注入路由，
// 从而让整个应用都有路由功能
const app = new Vue({
  router
}).$mount('#app')

// 现在，应用已经启动了
```

`VueRouter` 原型上也定义了一系列的函数，比如 ：`push` 、 `replace` 、  `go` 、 `back` 和 `forward` 。定义了一些导航守卫 ： `beforeEach` 、`beforeResolve` 及 `afterEach` 。

## 完整的导航解析流程 <Badge text="v4" />

- 导航被触发。
- 在失活的组件里调用 beforeRouteLeave 守卫。
- 调用全局的 beforeEach 守卫。
- 在重用的组件里调用 beforeRouteUpdate 守卫(2.2+)。
- 在路由配置里调用 beforeEnter。
- 解析异步路由组件。
- 在被激活的组件里调用 beforeRouteEnter。
- 调用全局的 beforeResolve 守卫(2.5+)。
- 导航被确认。
- 调用全局的 afterEach 钩子。
- 触发 DOM 更新。
- 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。

下文，我们将从以下方面深入理解 vue-router 及其原理。可和最新的 [VueRouter4 源码解析](/vue/vue3/vue-router4.html) 结合理解.

[vue插件机制](./plugin)

[初始化及降级处理](./initialization)

[路由过渡与视图渲染](./transitions)

[路由匹配](./match)

[滚动行为](./scroll)
