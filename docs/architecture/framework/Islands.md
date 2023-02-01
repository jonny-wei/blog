# 了解 Islands 架构

## MPA 和 SPA 的取舍

MPA 和 SPA 是构建前端页面常见的两种方式，理解 MPA 和 SPA 的区别和不同场景的取舍是理解 Islands 架构的关键。

### 概念

MPA (Multi-page application) 即多页应用，是从服务器加载多个 HTML 页面的应用程序。每个页面都彼此独立，有自己的 URL。当单击 a 标签链接导航到另一个页面时，浏览器将向服务器发送请求并加载新页面。例如，传统的模板技术如 JSP、Python、Django、PHP、Laravel 等都是基于 MPA 的框架，包括目前比较火的 Astro 也是采用的 MPA 方案。

SPA (Single-page application) 即单页应用，它只有一个不包含具体页面内容的 HTML，当浏览器拿到这份 HTML 之后，会请求页面所需的 JavaScript 代码，通过执行 JavaScript 代码完成 DOM 树的构建和 DOM 的事件绑定，从而让页面可以交互。如现在使用的大多数 Vue、React 中后台应用都是 SPA 应用。

### 对比

#### 性能

在 MPA 中，服务器将响应完整的 HTML 页面给浏览器，但是 SPA 需要先请求客户端的 JS Bundle 然后执行 JS 以渲染页面。因此，MPA 中的页面的首屏加载性能比 SPA 更好。

但 SPA 在后续页面加载方面有更好的性能和体验。因为 SPA 在完成首屏加载之后，在访问其它的页面时只需要动态加载页面的一部分组件，而不是整个页面。而且，当页面发生跳转时，SPA 不会重新加载页面，对用户更友好。

#### SEO

MPA 中服务端会针对每个页面返回完整的 HTML 内容，对 SEO 更加友好；而 SPA 的页面内容则需要执行 JS 才能拉取到，不利于 SEO。

#### 路由

MPA 在浏览器侧其实不需要路由，每个页面都在服务端都有一份 URL 地址，浏览器拿到 URL 直接请求服务端即可。

但 SPA 则不同，它需要 JS 掌管后续所有路由跳转的逻辑，因此会引入一些路由方案来管理前端的路由，比如基于 hashchange 事件或者浏览器 history API 来实现。

#### 状态管理

除了路由，SPA 另外一个复杂的点在于状态管理。SPA 当中所有路由的状态都是由 JS 进行管理，在不同的路由进行跳转时通过 JS 代码进行一些状态的流转，在页面的规模越来越大的时候，状态管理就变得越来越复杂了。因此，社区也诞生了不少的状态管理方案，如传统的 Redux、社区新秀 Valtio、Zustand 包括字节自研的 Reduck，都是为了解决 SPA 状态管理的问题，一方面降低操作的复杂度、另一方面引入一些规范和限制 (比如 Redux 中的 action 机制) 来提高项目可维护性。

而 MPA 则会简单很多，因为每个页面之间都是相互独立的，不需要在前端做复杂的状态管理。

### 取舍

总而言之，MPA 有更好的首屏性能，SPA 在后续页面的访问中有更好的性能和体验，但 SPA 也带来了更高的工程复杂度、略差的首屏性能和 SEO。这样就需要在不同的场景中做一些取舍。

不过，MPA 和 SPA 也并不是完全割裂的，两者也是能够有所结合的，比如 SSR/SSG 同构方案就是一个典型的体现，首先框架侧会在服务端生成完整的 HTML 内容，并且同时注入客户端所需要的 SPA 脚本。这样浏览器会拿到完整的 HTML 内容，然后执行客户端的脚本事件的绑定 (这个过程也叫 hydrate)，后续路由的跳转由 JS 来掌管。当下很多的框架都是采用这样的方案，比如 Next.js、Gatsby、公司内部的 Eden SSR、Modern.js。

但实际上，把 MPA 和 SPA 结合的方案也并不是完美无缺的，主要的问题在于这类方案仍然会下载全量的客户端 JS 及执行全量的组件 Hydrate 过程，造成页面的首屏 TTI 劣化。

我们可以试想对于一个文档类型的站点，其实里面的大多数组件是不需要交互的，主要以静态页面的渲染为主，因此直接采用 MPA 方案是一个比 MPA + SPA 更好的一个选择。进一步讲，对于更多的轻交互、重内容的应用场景，MPA 也依然是一个更好的方案。

由于页面中有时仍然不可避免的需要一些交互的逻辑，那放在 MPA 中如何来完成呢？这就是 Islands 架构所要解决的问题。

## 什么是 Islands 架构

我们知道，在传统的 SSR 应用中，服务端会给浏览器响应完整的 HTML 内容，并在 HTML 中注入一段完整的 JS 脚本用于完成事件的绑定，也就是完成 hydration (注水) 的过程。当注水的过程完成之后，页面也才能真正地能够进行交互。当一个页面中只有部分的组件交互，那么对于这些可交互的组件，我们可以执行 hydration 过程，因为组件之间是互相独立的。而对于静态组件，即不可交互的组件，我们可以让其不参与 hydration 过程，直接复用服务端下发的 HTML 内容。可交互的组件就犹如整个页面中的孤岛 (Island)，因此这种模式叫做 Islands 架构。

总体思路非常简单：在服务端渲染 HTML 页面，并在高度动态的区域周围，注入占位符或插槽。这些占位符 / 槽包含了服务端渲染的 HTML 输出，来自其相应的小部件。它们表示的区域可以在客户端 “水合” 为小型的独立部件，重新使用其服务端渲染的初始 HTML。

与 Islands 方法更接近的是 “渐进式增强”，我们本质上是通过添加 SSR hydration、一致性隐喻，来为页面的某个区域添加交互性。在传统的渐进式增强模式中，我们可能会有一个 `<script>` 标签，来寻找页面中的图片轮播，并在上面实例化一个 jQuery 插件。而现在，图片轮播会在服务器上被渲染，生成一个专门的 `<script>` 标签，来加载图片轮播的实现，并在原地将其升级为交互式的。

## Islands 实践

### Astro

在 Astro 中，默认所有的组件都是静态组件，比如：

```js
 // index.astro
 import MyReactComponent from '../components/MyReactComponent.jsx';
 ---
 <MyReactComponent />
```

这种写法不会在浏览器添加任何的 JS 代码。但有时我们需要在组件中绑定一些交互事件，那么这时就需要激活孤岛组件了，在使用组件时加上 `client:load` 指令即可:

```js
 // index.astro
 ---
 import MyReactComponent from '../components/MyReactComponent.jsx';
 ---
 <MyReactComponent client:load />
```

Astro 除了支持本身 Astro 语法之外，也支持 Vue、React 等框架，可以通过插件的方式来导入。在构建的时候，Astro 只会打包并注入 Islands 组件的代码，并且在浏览器渲染，分别调用不同框架 (Vue、React) 的渲染函数完成各个 Islands 组件的 hydrate 过程。Astro 是典型的 MPA 方案，不支持引入 SPA 的路由和状态管理。

Astro 的主要优势包括如下几点:

- Islands 架构，解决传统 SSR/SSG 框架的全量 hydration 问题，做到尽可能少的 Client 端 JS 的开销，甚至是 0 JS。
- 学习成本低。`.astro` 语法和传统的 `.jsx` 和 `.vue` 非常相似，对于新手前端来说也比较容易掌握。
- 使用灵活。对于页面的开发，你既可以使用官方的`.astro` 语法，也同样可以使用 `.md`、`.vue`、`.jsx` 语法，也就是说，你可以自由选择其它前端框架的语法来开发，甚至可以在一个项目中同时写 Vue 组件和 React 组件！
- 构建迅速。底层构建体系基于 Vite 以及 Esbuild 实现，项目启动速度非常快。

那么 Astro 中的 Islands 架构，即 `Partial Hydration`，和 React 的 `Selection Hydration` 有什么区别？

- 从渲染框架上来看， `Selection Hydration` 依附于具体框架的实现，而 `Partial Hydration` 可以做到框架无关，即使是 Vue、Solid 的项目也可以做到 `Partial Hydration`。
- 从客户端执行的 JS 总量来看， `Partial Hydration` 可以做到加载部分组件的 JS 代码，而 `Selection Hydration` 仍然需要加载和执行全量的 JS 代码。
- 从服务端和客户端的交互来看，  `Selection Hydration` 严重依赖于流式(Streaming)渲染，服务端需要加上 `transfer-encoding: chunked` 的响应头，而 `Partial Hydration` 没有这个限制。

因此，虽然两者都是在 Hydration 上做文章，但其实是两种完全不同的方案，而且 `Partial Hydration` 更加通用，限制更少，执行的 JS 更少。

### Fresh

Fresh 是一个基于 Preact 和 Deno 的全栈框架，同时也主打 Islands 架构。

Fresh 在渲染层核心主要做了以下的事情:

- 通过扫描 islands 目录记录项目中声明的所有 Islands 组件。
- 拦截 Preact 中 vnode 的创建逻辑，目的是为了匹配之前记录的 Island 组件，如果能匹配上，则记录 Island 组件的 props 信息，并将组件用 的注释标签来包裹，id 值为 Island 的 id，数字为该 Island 的 props 在全局 props 列表中的位置，方便 hydrate 的时候能够找到对应组件的 props。
- 调用 Preact 的 renderToString 方法将组件渲染为 HTML 字符串。
- 向 HTML 中注入客户端 hydrate 的逻辑。
- 拼接完整的 HTML，返回给前端。

值得注意的是客户端 hydrate 方法的实现，传统的 SSR 一般都是直接对根节点调用 hydrate，而在 Islands 架构中，Fresh 对每个 Island 进行独立渲染。

## Islands 优缺点

### 优点

1. 性能：降低客户端 JS 代码的体积。加载的代码，仅包含交互式组件所需的 JS，这比为整个页面重新创建 Virtual DOM，并重新 hydrate 页面上的所有元素所需的 JS 要少得多。较小的 JS 会带来更快的页面加载和交互时间 (TTI)
2. SEO：由于所有静态内容经过服务端渲染，所以页面对 SEO 场景是友好的
3. 关键内容优先：用户几乎可以立即获得关键内容（尤其是博客、新闻文章和产品类的页面）。在关键内容逐渐可
   用后，可交互的次要功能也是必须的。
4. 可访问性：使用标准静态 HTML 链接导航，有助于提高网站的可访问性（Accessibility）。
5. 基于组件：该架构具有基于组件的架构的所有优点，如：可重用、可维护。

### 缺点

1. 开发人员实现 Islands 的唯一选择，是使用少数可用的框架之一，或自己实现架构。将现有站点迁移到 Astro 或 Marko 需要额外的工作量。
2. 有一些新框架声称支持 Islands Architecture，因此筛选出适合你的架构和实践落地比较困难难。
3. 该架构不适合复杂交互页面，例如可能需要数千个 Islands 的社交应用。

[Islands 架构原理和实践](https://mp.weixin.qq.com/s/hLDtOz2AEbLCdRVBHkb3MQ)
