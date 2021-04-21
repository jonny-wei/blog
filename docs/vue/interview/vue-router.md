# Vue 路由原理

前端路由的核心就在于改变视图的同时不会向后端发出请求。

vue-router 默认 hash 模式 —— 使用 URL 的 hash 来模拟一个完整的 URL，于是当 URL 改变时，页面不会重新加载。hash（#）虽然在 url 中，但不会被包括在http 请求中，对后端完全没有影响，因此改变 hash 不会重新加载页面。

用路由的 history 模式，这种模式充分利用 `history.pushState` API 来完成 URL 跳转而无须重新加载页面。不过这种模式要玩好，还需要后台配置支持。因为我们的应用是个单页客户端应用，如果后台没有正确的配置，当用户在浏览器直接访问 `http://oursite.com/user/id` 就会返回 404，这就不好看了。所以呢，你要在服务端增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 index.html 页面，这个页面就是你 app 依赖的页面。这么做以后，你的服务器就不再返回 404 错误页面，因为对于所有路径都会返回 index.html 文件。为了避免这种情况，你应该在 Vue 应用里面覆盖所有的路由情况，然后在给出一个 404 页面。或者，如果你使用 Node.js 服务器，你可以用服务端路由匹配到来的 URL，并在没有匹配到路由的时候返回 404，以实现回退。

history 模式，利用了 `html5 History Interface` 中新增的 pushState() 和 replaceState() 方法。这两个方法应用于浏览器的历史记录栈，在当前已有的 back、forward、go 的基础之上，它们提供了对历史记录进行修改的功能。只是当它们执行修改时，虽然改变了当前的 url，但浏览器不会立即向后端发送请求。hash 模式和 history 模式都属于浏览器自身的特性，vue-router 只是利用了这两个特性（通过浏览器提供的接口）来实现前端路由。pushState 方法不会触发页面刷新，只是导致了 history 对象发生变化，地址栏会有反应。如果 pushState 的 url 参数，设置了一个新的锚点值（即hash），并不会触发 hashChange 事件，如果设置了一个跨域网址，则会报错。

每当同一个文档的浏览历史（即history）出现变化时，就会触发 popState 事件。需要注意：仅仅调用 pushState 方法或 replaceState 方法，并不会触发该事件，只有用户点击浏览器后退和前进按钮时，或者使用 js 调用 back、forward、go 方法时才会触发。另外该事件只针对同一个文档，如果浏览历史的切换，导致加载不同的文档，该事件不会被触发。使用的时候，可以为 popState 事件指定回调函数。注意：页面第一次加载的时候，浏览器不会触发popState事件


::: tip 补充
history.pushstate(state, title, url) 方法接受三个参数

- state: 一个与指定网址相关的状态对象，popState 事件触发时，该对象会传入回调函数，如果不需要这个对象，此处可填 null
- title: 新页面的标题，但是所有浏览器目前都忽略这个值，因此这里可以填 null
- url: 新的网址，必须与当前页面处在同一个域，浏览器的地址栏将显示这个网址

history.replaceState() 方法的参数和 pushState() 方法一摸一样，区别是它修改浏览器历史当中的记录。
:::

- Hash 模式：地址栏 URL 中有 #。vue-router 优先判断浏览器是否支持 pushState，若支持，则通过 pushState 改变 hash 值，进行目标路由匹配，渲染组件，popstate 监听浏览器操作，完成导航功能，若不支持，使用 location.hash 设置 hash 值，hashchange 监听 URL 变化完成路由导航。

- History 模式：地址栏 URL 中没有 #。与 Hash 模式实现导航的思路是一样的。不同的是，vue-router 提供了 fallback 配置，当浏览器不支持 history.pushState 控制路由是否应该回退到 hash 模式。默认值为 true。


[Vue Router](https://router.vuejs.org/zh/)

[SPA 路由三部曲之核心原理](https://jelly.jd.com/article/5fa4ab6b9475df015078635a?tunnel=tunnel_default)

[SPA 路由三部曲之实践演练](https://jelly.jd.com/article/602e3bf661dbb7014cffbe7a?tunnel=tunnel_default)

[从头开始学习vue-router](https://github.com/ljianshu/Blog/issues/39)