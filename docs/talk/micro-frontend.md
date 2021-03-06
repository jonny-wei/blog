# 微前端

## 核心价值

微前端架构具备以下几个核心价值：

- 技术栈无关。主框架不限制接入应用的技术栈，微应用具备完全自主权

- 独立开发、独立部署。微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新

- 增量升级。在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略

- 独立运行时。每个微应用之间状态隔离，运行时状态不共享

- 中心化路由。主应用统一注册子应用，统一管理各个子应用的路由

- 一致的开发体验。 开发者在微前端下开发子应用，和平时开发其它 Web 应用没有太大区别，没有因为是微前端架构而做过多的特殊处理；

微前端并不是单单技术上的创新，它在团队协同、用户体验上都给我们带来非常大的提升，它借鉴了微服务的概念，在技术架构上它能够做到各个系统模块的拆分，既能让模块之间低耦合，又能让所有的模块聚合到同一个页面上运行。

## 其他方案

### 为什么不用 路由分发式

路由分发式：即通过路由将不同的业务分发到不同的、独立前端应用上。通常通过 HTTP 服务器的反向代理来实现(Nginx)，又或者是应用框架自带的路由来解决。但是这种方式看上去更像是多个前端应用的聚合，只是将不同的前端应用拼凑到一起，使他们看起来像是一个完整的整体。但是实际并不是，每次用户从 A 应用到 B 应用的时候，往往需要刷新页面，重新加载资源文件。

缺点：刷新页面，重新加载了资源

### 为什么不用 iframe

iframe 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。但他的最大问题也在于他的隔离性无法被突破，导致应用间上下文无法被共享，随之带来的开发体验、产品体验的问题。

缺点：

- url 不同步。浏览器刷新 iframe url 状态丢失、后退前进按钮无法使用。
- UI 不同步，DOM 结构不共享。想象一下屏幕右下角 1/4 的 iframe 里来一个带遮罩层的弹框，同时我们要求这个弹框要浏览器居中显示，还要浏览器 resize 时自动居中。内部弹框不能够覆盖全局、滚动条问题。
- 全局上下文完全隔离，内存变量不共享。iframe 内外系统的通信、数据同步等需求，主应用的 cookie 要透传到根域名都不同的子应用中实现免登效果。
- 慢。每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程。

### 为什么不用 npm 包

把各个拆分的项目引用公共头、尾和导航组件看似一个较好的解决方案，但是当公共组件一旦升级，往往各个拆分项目都要重新升级并上线，开发体验和升级成本大打折扣，同时它也会因为各个项目不及时更新而导致项目之间跳转后体验不一致的现象。

npm 包这种静态的共享方式，丧失了动态下发代码的能力，导致了其过慢的工程响应速度，这在现在云服务流行的时代就会显得格外扎眼。而微前端这种纯动态的服务依赖方式，恰好能方便的解决上面的问题：被依赖的微应用更新后的产物，在产品刷新后即可动态的获取到，如果我们在微应用加载器中再辅以灰度逻辑，那么动态更新带来的变更风险也能得到有效的控制。

## 为什么使用微前端及 qinkun 框架

1. 与技术栈无关
   
   不限制接入应用的技术栈，应用之间没有隐性依赖。考虑到以后用 vue3 或 webpack5、vite等技术栈；考虑到应用的升级，版本不一致，技术栈不同等，降低系统升级成本，提高可维护性和可扩展性，做到增量升级，渐进式重构。

2. 独立开发，独立部署

  项目独立开发，独立部署，自动接入基座应用，降低项目的打包时长和项目臃肿问题，同时可以前端协作开发。一部分是空间分离带来的协作，另一部分是时间延续带来的升级维护。

3. 开发体验和用户体验

#### 选择 qiankun 原因

除了上面 3 个原因还包括：

1. qiankun 基于 singal-spa 封装，接入简单，目前最完善的微前端解决方案
2. 功能完备，样式隔离，JS沙箱，预加载微应用等
3. 提供多应用并行与多实例沙箱支持，同一时刻，渲染多个微应用，使一个应用可以加载多个其他应用的模块
4. 生成可用，经受了大量实践，可靠性高，维护积极
5. 官方文档友好



## 使用场景

不同于 iFrame 方式的融合，iFrame 是通过一些视觉样式的欺骗，让用户感觉各个应用在同一个页面，从本质上讲 iFrame 和重新打开一个页面没有什么太大区别。但是微前端的融合方式，是将子应用的 DOM（文档对象模型）整个加载到了当前页面，并且解析文档的 JavaScript 和 CSS 资源并运行，它就像在同一个项目的单页应用一样。

- 一致的开发体验
- 独立开发、独立部署
- 与技术栈无关
- 独立运行。每个子应用之间状态隔离，运行时状态不共享
- 项目臃肿，打包构建时间长

### 与路由绑定的方式渲染微应用

以路由(url)为维度来划分微应用，基于 qiankun 的 `registerMicroApps` API，提供 entry html 地址，并为其分配一个路由规则即可。路由与应用绑定的方式简单直观，是微前端中最为常见的使用场景，通常我们会用这种方式**将一堆独立域名访问的 MPA 应用，整合成一个一体化的 SPA 应用**。

局限性：

- 由于 **URL/路由** 的 **唯一性/排他性** 的特点，这种方式只适用单实例场景需求
- 微应用的调度都是由路由系统来自动处理的，虽然省事但是碰到更复杂的需求，如同一个路由下，根据不同的用户权限展示不同的微应用这类个性化诉求，需要写一些中间层代码来曲线救国
- 应用挂载的容器节点等需提前准备好，不然碰到 **动态/嵌套** 路由这类情况，可能会因为路由 listener 监听触发的时序不确定，导致微应用无法完成挂载的问题

### 以组件的方式使用微应用

qiankun 2.0 的发布带来一个全新的 API `loadMicroApp`，通过这个 API 我们可以自己去控制一个微应用加载/卸载。开发者可以在脱离路由的限制下，以更自由的方式去渲染我们的微应用。基于 `loadMicroApp` API，我们只需要做一些简单的封装，即可以类似组件的开发体验，完成微应用的接入。这类方式适用于一些可共用的、带业务逻辑的服务型组件。通过组件的这种方式，我们可以完全自主的控制微应用的渲染，并与之做一些复杂的交互。不论是在开发者的编码心智，还是用户的体验上，都跟使用一个普通的业务组件无异。

局限性：

组件的方式非常灵活，几乎解决了所有路由绑定方式渲染微应用的问题，但也有自己的一些局限：需要确保被加载的微应用是不含自己的路由系统，否则会出现多个应用间路由系统互相 `抢占/冲突` 的情况。

## 工程思考

### 嵌套渲染场景

在应用 A 中通过调用 loadMicroApp(B) 的方式唤起微应用 B，然后在微应用 B 中通过 loadMicroApp(C) 的方式唤起微应用 C，通过这样的调用链路即可很完美的完成产品上的诉求。但是现实情况往往没有那么简单，前面提到过，若想要 `loadMicroApp` API 能符合预期的运行，我们需要确保被加载的微应用是不含自己的路由系统，否则会出现多个应用间路由系统互相 `抢占/冲突` 的情况。而现实情况是，我们**大部分需要复用的页面/组件，都会是某个站点的局部路由页**，很少有人会专门起一个仓库，用来专门把这个页面抽取成一个微应用。这种场景下，我们其实**只需要确保微应用的路由系统不会干扰到全局的 URL 系统即可**。A/B 均是子应用，但是在 A 中可以再通过抽屉呼出 B，同时浏览器地址栏也不会被 B 的路由干扰，还是 A 的路由。

### 极限渲染场景

把一个微应用的 20+ 路由页同时渲染到了一个 url 下，例如，列表中每一个 demo 都是通过 qiankun 渲染的一个独立微应用实例，而每一个微应用实例，实际对应是同一个应用的不同路由页。不同于前面几个场景，将同一个应用的不同页面，同时渲染到主应用的不同 UI 容器中这个需求下，有几个比较特殊的问题需要去考虑：

- 是否需要特殊的微应用生产方式
- 多路由系统共存带来的 冲突/抢占 问题
- 不同微应用间的样式隔离
- 如何优化渲染性能：既然每一个微应用实例实际对应的是同一个应用，那我们如何尽可能多的复用一些运行时或者沙箱，从而降低这么多微应用同时渲染代理的运行时开销

### 新的 UI 共享模式

在以前，如果我们希望复用一个站点的局部 UI，几乎只有这样一条路径：从业务系统中`抽取出一个组件 -> 发布 npm 包 -> 调用方使用 npm 包`。将这部分代码抽取成若干个单独的文件，同时还要考虑如何跟已有的系统做上下文解耦，这类工作出现在一个越是年代久远的项目上，实施起来就越是困难。

不同于组件库的研发流程，微前端的场景下，大部分时候我们不会为了去复用一个 UI，而去专门写一个微应用出来。通常我们期望的是，从一个已有系统中，直接选取我们需要复用的部分，嵌入到我们自己的容器里进行渲染。基于上面提到过的微应用多实例的渲染方案，我们可以考虑将需要复用的组件，以路由 URL 作为 ID 的方式导出。

## 实战经验

微前端分主应用和子应用，主应用主要是负责整个布局、注册子应用以及路由管理；子应用主要是按照业务拆分的独立的单页应用。

### qiankun 特点

single-spa 解决了以应用为维度的路由，应用的注册，监听，最重要的是赋予了应用生命周期和生命周期相关事件，qiankun 继承了这些特性，在其基础上增加了 js 沙箱、样式隔离、HTML Loader、预加载 等微前端系统所需的能力。qiakun 升级 2.0 后，支持多个微应用的同时加载，有了这个特性，我们基本可以像接入 iframe 一样方便的接入微应用。

- 基于 single-spa 封装，提供了更加开箱即用的 API。
- 技术栈无关，任意技术栈的应用均可 使用/接入，不论是 React/Vue/Angular/JQuery 还是其他等框架。
- HTML Entry 接入方式，让你接入微应用像使用 iframe 一样简单。
- 样式隔离，确保微应用之间样式互相不干扰。
- JS 沙箱，确保微应用之间 全局变量/事件 不冲突。
- 资源预加载，在浏览器空闲时间预加载未打开的微应用资源，加速微应用打开速度。
- umi 插件，提供了 @umijs/plugin-qiankun 供 umi 应用一键切换成微前端架构系统。

qiankun@2.0 新功能

- 支持多应用并行及多实例沙箱
- 支持手动 加载/卸载 微应用
- 支持 IE11 沙箱兼容
- 官方的极简微应用通信方案
- 支持基于 Shadow DOM 的样式隔离

### 运行原理

微前端运行过程如下：

- 浏览器访问主应用：此时主应用会被下载到浏览器，并且开始运行主应用；
- 主应用注册子应用：设置子应用相关配置：子应用名称、子应用入口、子应用加载到哪个 DOM、子应用激活路径等等；
- 启动主应用；
- 加载子应用：浏览器会根据子应用入口下载子应用 HTML 模版；
- 解析子应用：框架开始解析子应用 HTML 模版，DOM、JavaScript 资源和 CSS 资源；
- 加载子应用资源：浏览器开始下载子应用 JavaScript 和 CSS 资源；
- 创建沙箱环境：为了将多个应用隔离开来，互不干扰，主应用为子应用创建沙箱环境；
- 挂载子应用：子应用开始运行；
- 预加载其它子应用资源： 由于微前端采用了预加载技术，在网络空闲的时候会加载其它的子应用资源，这样当其它子应用在唤起时资源- 已经准备好，立马可以运行起来~~

![微前端运行加载原理](/blog/images/talk/微前端运行加载原理.png)

Preload 技术在微前端项目中优势尤为明显，微前端有很多子应用，它在网络空闲时间为微前端预先加载好子应用的静态资源，再加上 HTTP2.0 的多路复用加持，并行下载能力大大加强。当用户要使用到某个子应用时，资源已经准保好，不用下载，性能得到极大提升

### 路由跳转

由于微前端的子应用会在一级路由下被激活，激活后的路由将被对应的子应用接管。

当微应用信息注册完之后，一旦浏览器的 url 发生变化，便会自动触发 qiankun 的匹配逻辑，所有 activeRule 规则匹配上的微应用就会被插入到指定的 container 容器中，同时依次调用微应用暴露出的生命周期钩子。

- 主应用和微应用都是 hash 模式，主应用根据 hash 来判断微应用，则不用考虑这个问题。

- 主应用根据 path 来判断微应用

  - history 模式的微应用之间的跳转，或者微应用跳主应用页面，直接使用微应用的路由实例是不行的，原因是微应用的路由实例跳转都基于路由的 base。有两种办法可以跳转：
    1. history.pushState()
    2. 将主应用的路由实例通过 props 传给微应用，微应用这个路由实例跳转。

### CSS 样式隔离

样式隔离，通常有以下几个方案：

- 样式约定 + 工程化

  这种方案非常简单可靠，各个子应用都约定自己的特有前缀，然后通过前端工程化工具 Webpack，在编译期对整体项目的样式做统一前缀处理。

- Shadow DOM

  完全彻底的解决了样式隔离，它通过游离在 DOM 树之外的 Shadow DOM，完全将 DOM 和 CSS 隔离开来。于浏览器兼容性问题，它是否可靠还有待进一步验证。

- Runtime css transformer 动态加载/卸载样式表

  通过运行时来改变当前子应用所引用的 CSS，这种方案虽然可行，但是在运行时动态的增加、修改、删除样式，会在性能上有一定的消耗。

- CSS Module

  CSS Modules 指的是我们像 import js 一样去引入我们的 css 代码，代码中的每一个类名都是引入对象的一个属性, 编译时会将 css 类名 加上唯一 hash。CSS Modules 作用域：
  - 作用域默认为 local 即只在当前模块生效
  - global 被 :global 包裹起来的类名，不会被模块化

- CSS in JS

  在 js 中写 css 变成了内联样式

- 给所有的样式规则增加一个特殊的选择器规则来限定其影响范围。与CSS Module、vue style 中的 scope 一样的原理，生成唯一的标识限定作用域。
  

::: tip 样式隔离
在最新的 qiankun 版本中，你也可以尝试通过配置 `{ scope: { experimentalStyleIsolation: true } }` 的方式开启**运行时的 scoped css 功能**，从而解决应用间的样式隔离问题。

[css 模块化 & 样式隔离](https://juejin.cn/post/6867345501860151309)
:::

### JS 沙箱隔离

如何确保子应用之间的全局变量不会互相干扰：

JavaScript 沙箱的实现方案有很多例如：eval、new Function、Proxy 等等。在 qiankun 框架中，采用的是 ES6 的新特性 Proxy 实现的，当框架检测到浏览器不支持 Proxy 时，会降级到快照沙箱。

- 代理沙箱（ProxySandbox）。通过 ES6 的 Proxy 特性，对 window（全局环境） 的截获，它可以劫持到子应用对 window 上的操作，例如：增加属性、修改属性、删除等操作，然后将这些变化记录到一个公共存储中（updateValueMap），当子应用离开时我们把记录好的内容从 window 上卸载掉即可。这样一来，我们就可以在多个应用之间随意切换，并且保持应用间环境是隔离的。

- 快照沙箱（SnapshotSandbox）。当浏览器不支持 Proxy 时，会启用快照沙箱，快照沙箱其实就是通过 diff 的方式，将当前环境和原有环境进行对比，然后全量的恢复到原有环境，这种方式的缺点在于无法支持多个实例。

![沙箱隔离](/blog/images/talk/js沙箱.png)

qiankun 内部的实现方式是通过 Proxy 来实现的沙箱模式，即在应用的 bootstrap 及 mount 两个生命周期开始之前分别给全局状态打下快照，然后当应用切出/卸载时，将状态回滚至 bootstrap 开始之前的阶段，确保应用对全局状态的污染全部清零

### 应用间通讯

主应用传递数据到子应用、子应用之间的数据传递，无非采用事件的方式来解决。

其实浏览器自带有 CustomEvent ，它采用发布/订阅模式的设计，我们可以通过它创建一个自定义事件、监听事件并触发这个事件，达到应用之间的数据通讯：

```js
// 创建事件
let event = new CustomEvent("event-a", {
  detail: "hello"
});
// 监听事件
document.addEventListener("event-a", function(e) {
  console.log(e.detail);
});
// 触发事件
document.dispatchEvent(event);
```

qiankun 框架已经为我们准备好了基于 props 的通讯方式，主应用和子应用之间可以通过设置和监听全局状态，来相互传递信息。但是只能做到主、子应用之间的直接通讯。

::: tip 官方链接
[qiankun](https://qiankun.umijs.org/zh/cookbook)
:::

## Shadow DOM

Web components 的一个重要属性是封装——可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁。其中，Shadow DOM 接口是关键所在，它可以将一个隐藏的、独立的 DOM 附加到一个元素上。

![Shadow DOM](/blog/images/talk/shadow-dom.png)

你可以使用同样的方式来操作 Shadow DOM，就和操作常规 DOM 一样——例如添加子节点、设置属性，以及为节点添加自己的样式（例如通过 `element.style` 属性），或者为整个 Shadow DOM 添加样式（例如在 `<style>` 元素内添加样式）。不同的是，Shadow DOM 内部的元素始终不会影响到它外部的元素（除了 `:focus-within`），这为封装提供了便利。

`<video>` 元素为例。你所能看到的只是一个 `<video>` 标签，实际上，在它的 Shadow DOM 中，包含来一系列的按钮和其他控制器。Shadow DOM 标准允许你为你自己的元素（custom element）维护一组 Shadow DOM。

可以使用 `Element.attachShadow()` 方法来将一个 shadow root 附加到任何一个元素上。

具体操作见 [Shadow DOM](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM)

## 踩坑

样式污染与事件监听不生效。

样式隔离也是微前端面临的一个重要问题，在 qiankun@1.x 中，支持了微应用之间的样式隔离（仅沙箱开启时生效），但尚存一些问题：

- 主子应用之间的样式隔离依赖手动配置插件处理
- 多应用场景下微应用之间的样式隔离亟待处理

**qiankun 样式隔离方案**：

为此，引入了一个新的选项，`sandbox: { strictStyleIsolation?: boolean }` 。在该选项开启的情况下，会以 `Shadow DOM` 的形式嵌入微应用，以此来做到应用样式的真正隔离。

默认情况下沙箱可以确保单实例场景子应用之间的样式隔离，但是无法确保主应用跟子应用、或者多实例场景的子应用样式隔离。当配置为 `{ strictStyleIsolation: true }` 时表示开启严格的样式隔离模式。这种模式下 qiankun 会为每个微应用的容器包裹上一个 shadow dom 节点，从而确保微应用的样式不会对全局造成影响。

在开启 strictStyleIsolation 时，我们会将微应用插入到 qiankun 创建好的 Shadow Tree 中，微应用的样式（包括动态插入的样式）都会被挂载到这个 Shadow Host 节点下，因此微应用的样式只会作用在 Shadow Tree 内部，这样就做到了样式隔离。

**但是开启 Shadow DOM 也会引发一些别的问题**：

一个典型的问题是，一些组件可能会越过 Shadow Boundary 到外部 Document Tree 插入节点，而这部分节点的样式就会丢失；比如 antd 的 Modal 就会渲染节点至 ducument.body ，引发样式丢失；针对刚才的 antd 场景你可以通过他们提供的 ConfigProvider.getPopupContainer API 来指定在 Shadow Tree 内部的节点为挂载节点，但另外一些其他的组件库，或者你的一些代码也会遇到同样的问题，需要你额外留心。

此外 Shadow DOM 场景下还会有一些额外的事件处理、边界处理等问题。

::: tip 实验性的隔离隔离
qiankun 还提供了一个实验性的样式隔离特性，当 `experimentalStyleIsolation` 被设置为 true 时，qiankun 会**改写子应用所添加的样式为所有样式规则增加一个特殊的选择器规则来限定其影响范围**
:::

在 qiankun@2.2.2 版本之前，qiankun 只能解决子应用之间的样式相互污染，不能解决子应用与主应用的样式相互污染。子应用切换到主应用时，会出现样式丢失问题和事件监听不生效问题。在具有路由懒加载的 Vue 子应用之间互相切换，懒加载组件的样式不会重建。路由懒加载的子应用(异步加载的组件)，多次切换时也同样会出现样式丢失问题。

原因：子应用跳转时，子应用的卸载需要一点点时间，在这段时间内主项目加载了，插入了 css，但是被子项目的 css 沙箱记录了，连同子项目一同卸载移除了。换句话说，主应用样式丢失的问题跟子应用卸载的时机有关系：当切换子应用时，当前子应用沙箱环境还未被卸载，但主应用 css 已被插入，当卸载时会连带主应用 css 一起被清除。在 `<head></head>` 能看到。主项目事件监听也是一样的，所以需要在子项目卸载完成后再跳转。

css 样式隔离常用的方式：

- css 前缀
- css Module
- 动态加载/卸载样式表

qiankun 中的 css 沙箱机制采用 **动态加载/卸载样式表**。重写 HTMLHeadElement.prototype.appendChild 和 window.addEventListener 事件，当子应用加载时，在 head 插入 `style/link` ; 当卸载时，直接移除。

但是，无法解决多个子项目同时运行时的 css 污染，以及子项目对主项目的 css 污染。

js 沙箱只劫持了 window.addEventListener，使用 document.body.addEventListener 或者 document.body.onClick 添加的事件并不会被沙箱移除，会对其他的页面产生影响，请在 unmount 周期清除。

解决办法：我原本想在路由钩子函数里面判断下，子项目是否卸载完成，卸载完成再跳转路由，然而路由不跳转，子项目根本不会卸载。临时解决办法是先复制一下 HTMLHeadElement.prototype.appendChild 和 window.addEventListener ，路由钩子函数 beforeEach 中判断一下，如果当前路由是子项目，并且去的路由是父项目的，则还原这两个对象。

```js
const isChildRoute = path => childRoute.some(item => path.startsWith(item));
const rawAppendChild = HTMLHeadElement.prototype.appendChild;
const rawAddEventListener = window.addEventListener;

router.beforeEach((to, from, next) => {
  // 从子项目跳转到主项目
  if (isChildRoute(from.path) && !isChildRoute(to.path)) {
    HTMLHeadElement.prototype.appendChild = rawAppendChild;
    window.addEventListener = rawAddEventListener;
  }
  next();
});
```

除了代码中暴露出相应的生命周期钩子之外，为了让主应用能正确识别微应用暴露出来的一些信息，需打包成 umd 风格。

**针对项目搭建上的一些思考与优化，可借鉴** ：

- 可以使用 lerna 统一管理所有项目，方便维护，或者让每个应用拥有独立的仓库，做到独立开发。

  Lerna 是一个使用 git 和 npm 来处理多包依赖管理的工具，利用它能够自动帮助我们管理各种模块包之间的版本依赖关系。

- 可以使用 SystemJS 实现应用的动态加载、独立部署。

  system.js 的作用就是动态按需加载模块。假如我们子项目都使用了 vue, vuex, vue-router，每个项目都打包一次，就会很浪费。 system.js 可以配合 webpack 的 externals 属性，将这些模块配置成外链，然后实现按需加载,当然了，你也可以直接用 script 标签将这些公共的 js 全部引入，借助 system.js 这个插件，我们只需要将子项目的 app.js 暴露给它即可。

[使用 mono-repo 实现跨项目组件共享](https://mp.weixin.qq.com/s/-A3Yg2TX4fCkkx9vXgREFA)

## monorepo

### Monorepo vs Multirepo

![monorepo](/blog/images/talk/monorepo1.png)

### monorepo 优点

- 代码复用更容易;
- 精简依赖管理，去除多个包的重复依赖；
- 方便大规模的重构，可以同时重构多个包然后统一发布，避免不同包管理的问题；
- 跨团队合作更容易，跨团队开发时只需提交代码即可合作，而不需要发布到包管理中心;
- 方便统一管理 lint、test、build 和 release；
- 统一的地方处理 issue;
- 方便统一生成 ChangeLog。

### monorepo 缺点

- 丢失版本信息，统一发布版本的 monorepo，会丢失各自项目的版本信息，尽管也可以单独发布版本；
- 缺乏针对包的权限控制(Git)，只要需要访问一个项目的，就必须要给开发者授权整个仓库，可能存在安全问题；
- 消耗更多硬件资源：当你只需当你只需要开发某个项目时，必须要把整个仓库代码全部下载，会占用更多的网络和本地存储空间。

目前比较主流的方案是采用 yarn workspaces + lerna 来实现 monorepo 策略。

## lerna

Lerna 是一个管理多个 npm 模块的工具，是 Babel 自己用来维护自己的 Monorepo 并开源出的一个项目。优化维护多包的工作流，解决多个包互相依赖，且发布需要手动维护多个包的问题。

lerna 不负责构建，测试等任务，它提出了一种集中管理 package 的目录模式，提供了一套自动化管理程序，让开发者不必再深耕到具体的组件里维护内容，在项目根目录就可以全局掌控，基于 npm scripts，使用者可以很好地完成组件构建，代码格式化等操作。目前最常见的 monorepo 解决方案是 Lerna 和 yarn 的 workspace 特性，基于 lerna 和 yarn workspace 的 monorepo 工作流。

[Lerna 中文教程详解](https://juejin.cn/post/6844903856153821198)

### lerna bootstrap

`packages/` 下面的每个子项目有自己的 `node_modules`，如果将它打开，会发现很多重复的依赖包，这会占用我们大量的硬盘空间。lerna 提供了另一个强大的功能：将子项目的依赖包都提取到最顶层，我们只需要先删除子项目的 `node_modules` 再跑下面这行命令就行了：

```js
lerna bootstrap --hoist
```

`lerna bootstrap --hoist` 虽然可以将子项目的依赖提升到顶层，但是他的方式比较粗暴：先在每个子项目运行 npm install，等所有依赖都安装好后，将他们移动到顶层的 `node_modules`。这会导致一个问题，如果多个子项目依赖同一个第三方库，但是需求的版本不同怎么办？比如我们三个子项目都依赖 antd，但是他们的版本不完全一样。

### yarn workspace

`yarn workspace` 可以解决前面说的版本不一致的问题，`lerna bootstrap --hoist` 会把所有子项目用的最多的版本移动到顶层，而 `yarn workspace` 则会检查每个子项目里面依赖及其版本，如果版本不一样则会留在子项目自己的 `node_modules` 里面，只有完全一样的依赖才会提升到顶层。

### 共享脚手架

脚手架全部 eject 出来，然后手动挪到顶层，让子项目共享

[mono-repo-demo](https://github.com/dennis-jiang/mono-repo-demo)

::: warning 参考文献
[Micro Frontends](https://micro-frontends.org/)

[qiankun 技术圆桌](https://www.yuque.com/kuitos/gky7yw)

[说说 JS 中的沙箱](https://juejin.cn/post/6844903954074058760)

[解密微前端：从 qiankun 看沙箱隔离](https://juejin.cn/post/6896643767353212935)

[解密微前端：从 qiankun 看子应用加载](https://juejin.cn/post/6891888458919641096)

[qiankun 2.x 运行时沙箱 源码分析](https://juejin.cn/post/6885214342552223757)

[微前端框架 之 qiankun 从入门到源码分析](https://juejin.cn/post/6885211340999229454#heading-32)

[qiankun 微前端原理与实践](https://juejin.cn/post/6902212398841593869)

[基于 qiankun 的微前端最佳实践](https://juejin.cn/post/6844904115999342600)

[微前端连载](https://juejin.cn/post/6846687602439897101#heading-28)

[微前端架构推进参考资料汇总](https://github.com/iuap-design/blog/issues/382)

[qiankun 微前端方案实践及总结](https://juejin.cn/post/6844904185910018062#heading-0)

[使用 mono-repo 实现跨项目组件共享](https://mp.weixin.qq.com/s/-A3Yg2TX4fCkkx9vXgREFA)

[项目级 monorepo 策略最佳实践](https://juejin.cn/post/6924854598268108807#heading-2)

[lerna+yarn workspace+monorepo 项目的最佳实践](https://juejin.cn/post/6844903918279852046#heading-0)

[现代前端工程为什么越来越离不开 Monorepo](https://juejin.cn/post/6944877410827370504#heading-6)

[qiankun 官网常见问题](https://qiankun.umijs.org/zh/faq)

[微前端在美团外卖的实践](https://juejin.cn/post/6844904073972432903#heading-5)

[基于 lerna 和 single-spa,sysyem.js 搭建 vue 的微前端框架](https://www.jianshu.com/p/7d1359e29d39)

[微前端在小米 CRM 系统的实践](https://mp.weixin.qq.com/s/5qwgZ9aNKFC3naWRUGajmA)

[滴普大前端|DevOps（A10）基于 qiankun 的微前端实践](https://mp.weixin.qq.com/s/kqINSvBH2QpcTtWtzHc10Q)

[前端微服务化解决方案](https://alili.tech/archive/ea599f7c/)

[每日优鲜供应链前端团队微前端改造](https://juejin.cn/post/6844903943873675271#heading-0)

[闲庭信步聊前端 - 见微知著微前端](https://juejin.cn/post/6911873800669757447)

[微前端：未来前端开发的新趋势](https://github.com/xitu/gold-miner/blob/master/TODO1/micro-frontends-1.md)

[微前端技术在商羚商户端的实战 - 京东](https://jelly.jd.com/article/603c5a026d84e3013e8846f6)

[探索微前端的场景极限](https://mp.weixin.qq.com/s/FE3jsrqHrLWIjdEqaetoiA)
:::
