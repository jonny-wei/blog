# VueRouter 核心原理

前端路由的核心就在于改变视图的同时不会向后端发出请求。

vue-router 默认 hash 模式 —— 使用 URL 的 hash 来模拟一个完整的 URL，于是当 URL 改变时，页面不会重新加载。hash（#）虽然在 url 中，但不会被包括在http 请求中，对后端完全没有影响，因此改变 hash 不会重新加载页面。

用路由的 history 模式，这种模式充分利用 `history.pushState` API 来完成 URL 跳转而无须重新加载页面。不过这种模式要玩好，还需要后台配置支持。因为我们的应用是个单页客户端应用，如果后台没有正确的配置，当用户在浏览器直接访问 `http://oursite.com/user/id` 就会返回 404，这就不好看了。所以呢，你要在服务端增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 index.html 页面，这个页面就是你 app 依赖的页面。这么做以后，你的服务器就不再返回 404 错误页面，因为对于所有路径都会返回 index.html 文件。为了避免这种情况，你应该在 Vue 应用里面覆盖所有的路由情况，然后在给出一个 404 页面。或者，如果你使用 Node.js 服务器，你可以用服务端路由匹配到来的 URL，并在没有匹配到路由的时候返回 404，以实现回退。

### History 模式

History 模式，利用了 `html5 History Interface` 中新增的 `pushState()` 和 `replaceState()` 方法。这两个方法应用于浏览器的历史记录栈，在当前已有的 back、forward、go 的基础之上，它们提供了对历史记录进行修改的功能。只是当它们执行修改时，虽然改变了当前的 url，但浏览器不会立即向后端发送请求。hash 模式和 history 模式都属于浏览器自身的特性，vue-router 只是利用了这两个特性（通过浏览器提供的接口）来实现前端路由。**pushState 方法不会触发页面刷新，只是导致了 history 对象发生变化，地址栏会有反应。如果 pushState 的 url 参数，设置了一个新的锚点值（即hash），并不会触发 hashChange 事件，如果设置了一个跨域网址，则会报错**。

每当同一个文档的浏览历史（即history）出现变化时，就会触发 `popState 事件`。**需要注意：仅仅调用 pushState 方法或 replaceState 方法，并不会触发该事件，只有用户点击浏览器后退和前进按钮时，或者使用 js 调用 back、forward、go 方法时才会触发**。另外该事件只针对同一个文档，如果浏览历史的切换，导致加载不同的文档，该事件不会被触发。使用的时候，可以为 popState 事件指定回调函数。注意：页面第一次加载的时候，浏览器不会触发 popState 事件。

History 模式缺点是需要在服务器上添加一个简单的回退路由解决 404 问题。如果 URL 不匹配任何静态资源，它应提供与你的应用程序中的 index.html 相同的页面。它是用 `createWebHistory()` 创建的：

```js
// vue-router@4 创建路由如下：
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    //...
  ],
})
```

::: tip 补充
history.pushState(state, title, url) 方法接受三个参数

- state: 一个与指定网址相关的状态对象，popState 事件触发时，该对象会传入回调函数，如果不需要这个对象，此处可填 null
- title: 新页面的标题，但是所有浏览器目前都忽略这个值，因此这里可以填 null
- url: 新的网址，必须与当前页面处在同一个域，浏览器的地址栏将显示这个网址

history.replaceState() 方法的参数和 pushState() 方法一摸一样，区别是它修改浏览器历史当中的记录。
:::

### Hash 模式

- Hash 模式：地址栏 URL 中有 #。vue-router 优先判断浏览器是否支持 pushState，若支持，则通过 `pushState` 改变 hash 值，进行目标路由匹配，渲染组件，`popstate` 监听浏览器操作，完成导航功能，若不支持，使用 `location.hash` 设置 hash 值，`onhashchange 事件` 监听 URL 变化完成路由导航。Hash 模式不需要在服务器层面上进行任何特殊处理。

- 回退策略：History 模式地址栏 URL 中没有 #。与 Hash 模式实现导航的思路是一样的。不同的是，vue-router 提供了 fallback 配置，当浏览器不支持 `history.pushState` 控制路由是否应该回退到 hash 模式。默认值为 true。

Hash 模式缺点是不利于在 SEO。它是用 `createWebHashHistory()` 创建的。

```js
// vue-router@4 创建路由如下：
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    //...
  ],
})
```

### Memory 模式

- Memory(Abstract) 模式: 支持所有 JavaScript 运行环境，如 Node.js 服务器端。如果发现没有浏览器的 API，路由会自动强制进入这个模式。abstract 路由模式本身是用来在不支持浏览器 API 的环境中，充当 fallback，而不论是 hash 还是 history 模式都会对浏览器上的 url 产生作用，如果要实现在已存在的路由页面中内嵌其他的路由页面，而保持在浏览器当中依旧显示当前页面的路由 path，这就利用到了 abstract 这种与浏览器分离的路由模式, abstract 路由模式利用**数组栈的思想**实现路由栈的维护。

Memory 模式非常适合 Node 环境和 SSR。它是用 `createMemoryHistory()` 创建的，**并且需要你在调用 `app.use(router)` 之后手动 push 到初始导航**。虽然不推荐，你仍可以在浏览器应用程序中使用此模式，但请注意它不会有历史记录，这意味着你无法后退或前进。

```js
// vue-router@4 创建路由如下：
import { createRouter, createMemoryHistory } from 'vue-router'
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    //...
  ],
})
```

## 问题

### Q1. 项目部署 404 问题

前后端分离开发模式下，前后端是独立布署的，前端只需要将最后的构建物上传至目标服务器的web容器指定的静态目录下即可。

404 错误意味着链接指向的资源不存在。

问题在于为什么不存在？且为什么只有 history 模式下会出现这个问题？

SPA 是一种网络应用程序或网站的模型，所有用户交互是通过动态重写当前页面，前面我们也看到了，不管我们应用有多少页面，构建物都只会产出一个 index.html。

```js
server {
  listen  80;
  server_name  www.xxx.com;

  location / {
    index  /dist/index.html;
  }
}
```

根据 nginx 配置得出，当我们在地址栏输入 `<www.xxx.com>` 时，这时会打开我们 dist 目录下的 index.html 文件，然后我们在跳转路由进入到 `<www.xxx.com/login>`

关键在这里，当我们在 website.com/login 页执行刷新操作，nginx location 是没有相关配置的(单页应用，没有login.html)，所以就会出现 404 的情况。

产生问题的本质是因为我们的路由是通过JS来执行视图切换的，当我们进入到子路由时刷新页面，web 容器没有相对应的页面此时会出现 404，所以我们只需要配置将任意页面都重定向到 index.html，把路由交由前端处理。需要做的就是在你的服务器上添加一个简单的回退路由。如果 URL 不匹配任何静态资源，它应提供与你的应用程序中的 index.html 相同的页面：

```js
server {
  listen  80;
  server_name  www.xxx.com;

  location / {
    index  /dist/index.html;
    try_files $uri $uri/ /index.html;
  }
}
```

为了避免这种情况，你应该在 Vue 应用里面覆盖所有的路由情况，然后在给出一个 404 页面。

### Q2. 为什么 hash 模式下没有 404 这种问题？

`hash` 虽然出现在 `URL` 中，但不会被包括在 `HTTP` 请求中，对服务端完全没有影响，因此改变 `hash` 不会重新加载页面。
`hash` 模式下，仅 `hash` 符号之前的内容会被包含在请求中，如 `website.com/#/login` 只有 `website.com` 会被包含在请求中 ，因此对于服务端来说，即使没有配置`location`，也不会返回 404 错误。

[Vue Router Mode](https://router.vuejs.org/zh/guide/essentials/history-mode.html)

[SPA 路由三部曲之核心原理](https://jelly.jd.com/article/5fa4ab6b9475df015078635a?tunnel=tunnel_default)

[SPA 路由三部曲之实践演练](https://jelly.jd.com/article/602e3bf661dbb7014cffbe7a?tunnel=tunnel_default)

[从头开始学习vue-router](https://github.com/ljianshu/Blog/issues/39)
