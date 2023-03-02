# iframe 微前端方案

iframe 在微前端方案流行前，它其实是一个比较好的解决方案。不管是一些二方或是三方的接入，它都能够很好地满足需求。iframe 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。

这个概念已经和[微前端](https://micro-frontends.org/)不谋而合，相对于目前配置复杂、高适配成本的微前端方案来说，采用`iframe`方案具有一些显著的**优点**：

- **非常简单**。使用没有任何心智负担
- **隔离完美**。无论是 js、css、dom 都完全隔离开来
- **多应用激活**。页面上可以摆放多个`iframe`来组合业务

但是开发者又厌恶使用`iframe`，因为**缺点**也非常明显：

- **路由不同步**。刷新一下， `iframe url` 状态丢失、后退前进按钮无法使用。
- **DOM 割裂严重**。如果 iframe 里来一个带遮罩层的弹框，同时我们要求这个弹框要浏览器居中显示，那么需要浏览器 resize 时自动居中。内部弹框不能够覆盖全局、滚动条问题。
- **全局上下文完全隔离，通信困难**。iframe 内外系统的通信、数据同步等需求实现困难，只能通过 postmessage 传递序列化的消息。
- **资源加载慢，白屏时间太长**。每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程。

能否打造一个完美的`iframe`，保留所有的优点的同时，解决掉所有的缺点呢？

## 无界架构设计

微前端已经是一个非常成熟的领域了，但开发者不管采用哪个现有方案，在适配成本、样式隔离、运行性能、页面白屏、子应用通信、子应用保活、多应用激活、vite 框架支持、应用共享等用户核心诉求都或存在问题，或无法提供支持。

[无界微前端框架](https://wujie-micro.github.io/doc/)通过继承`iframe`的优点，解决`iframe`的缺点，基于 `webcomponent` 容器 + `iframe`沙箱，能够完善的解决适配成本，解决这些核心诉求。

### 应用加载机制和 js 沙箱机制

将子应用的`js`注入主应用同域的`iframe`中运行，`iframe`是一个原生的`window`沙箱，内部有完整的`history`和`location`接口，子应用实例`instance`运行在`iframe`中，路由也彻底和主应用解耦，可以直接在业务组件里面启动应用。

- **组件方式来使用微前端**：不用注册，不用改造路由，直接使用无界组件，化繁为简

- **一个页面可以同时激活多个子应用**：子应用采用 iframe 的路由，不用关心路由占用的问题

- **天然 js 沙箱，不会污染主应用环境**：不用修改主应用`window`任何属性，只在`iframe`内部进行修改

- **应用切换没有清理成本**：由于不污染主应用，子应用销毁也无需做任何清理工作

### 路由同步机制

在`iframe`内部进行`history.pushState`，浏览器会自动的在[joint session history](https://html.spec.whatwg.org/multipage/history.html#joint-session-history)中添加`iframe`的[session-history](https://html.spec.whatwg.org/multipage/history.html#session-history)，浏览器的前进、后退在不做任何处理的情况就可以直接作用于子应用

劫持`iframe`的`history.pushState`和`history.replaceState`，就可以将子应用的`url`同步到主应用的`query`参数上，当刷新浏览器初始化`iframe`时，读回子应用的`url`并使用`iframe`的`history.replaceState`进行同步

- **浏览器刷新、前进、后退都可以作用到子应用**
- **实现成本低，无需复杂的监听来处理同步问题**
- **多应用同时激活时也能保持路由同步**

### 原生隔离与 iframe 连接机制

#### CSS 沙箱隔离

无界采用[webcomponent](https://developer.mozilla.org/en-US/docs/Web/Web_Components)来实现页面的样式隔离，无界会创建一个`wujie`自定义元素，然后将子应用的完整结构渲染在内部。

无界将子应用的 dom 放置在 `webcomponent + shadowdom` 的容器中，除了可继承的 css 属性外实现了应用之间 css 的原生隔离。

#### JS 沙箱隔离

无界将子应用的 js 放置在 iframe（js-iframe）中运行，实现了应用之间 window、document、location、history 的完全解耦和隔离。

#### JS 沙箱和 CSS 沙箱连接

无界在底层采用 `proxy + Object.defineproperty` 的方式将 `js-iframe` 中对 `dom 操作`劫持代理到 `webcomponent shadowRoot` 容器中，开发者无感知也无需关心。

子应用的实例`instance`在`iframe`内运行，`dom`在主应用容器下的`webcomponent`内，通过代理 `iframe`的`document`到`webcomponent`，可以实现两者的互联。将`document`的查询类接口：`getElementsByTagName、getElementsByClassName、getElementsByName、getElementById、querySelector、querySelectorAll、head、body`全部代理到`webcomponent`，这样`instance`和`webcomponent`就精准的链接起来。

当子应用发生切换，`iframe`保留下来，子应用的容器可能销毁，但`webcomponent`依然可以选择保留，这样等应用切换回来将`webcomponent`再挂载回容器上，子应用可以获得类似`vue`的`keep-alive`的能力.

- **天然 css 沙箱**：直接物理隔离，样式隔离子应用不用做任何修改

- **天然适配弹窗问题**：`document.body`的`appendChild`或者`insertBefore`会代理直接插入到`webcomponent`，子应用不用做任何改造

- **子应用保活**：子应用保留`iframe`和`webcomponent`，应用内部的`state`不会丢失

- **完整的 DOM 结构**：`webcomponent`保留了子应用完整的`html`结构，样式和结构完全对应，子应用不用做任何修改

### 通信机制

承载子应用的`iframe`和主应用是同域的，所以主、子应用天然就可以很好的进行通信，在无界我们提供三种通信方式

- **props 注入机制**：子应用通过`$wujie.props`可以轻松拿到主应用注入的数据

- **window.parent 通信机制**：子应用`iframe`沙箱和主应用同源，子应用可以直接通过`window.parent`和主应用通信

- **去中心化的通信机制**：无界提供了`EventBus`实例，注入到主应用和子应用，所有的应用可以去中心化的进行通信

### 预加载 & 预执行

- **预加载**。预加载指的是在应用空闲的时候`requestIdleCallback`将所需要的静态资源提前从网络中加载到内存中，详见[preloadApp](https://wujie-micro.github.io/doc/api/preloadApp.html)
- **预执行**。预执行指的是在应用空闲的时候将子应用提前渲染出来，可以进一步提升子应用打开时间只需要在`preloadApp`中将 [exec](https://wujie-micro.github.io/doc/api/preloadApp.html#exec) 设置为`true`即可。由于子应用提前渲染可能会导致阻塞主应用的线程，所以无界提供了类似 [react-fiber](https://github.com/acdlite/react-fiber-architecture) 方式来防止阻塞线程，详见 [fiber](https://wujie-micro.github.io/doc/api/startApp.html#fiber)

### 运行模式

在微前端框架中，子应用放置在主应用页面中随着主应用页面的打开和关闭反复的激活和销毁，而在无界微前端框架中子应用是否保活以及是否进行生命周期的改造会进入完全不同的处理流程

![micro10](/blog/images/architecture/micro10.png)

子应用适配，子应用首先需要做支持跨域请求改造，这个是所有微前端框架运行的前提，除此之外子应用可以不做任何改造就可以在无界框架中运行，不过此时运行的方式是重建模式。子应用在无界中会根据是否保活、是否做了生命周期适配进入不同的运行模式：

#### 保活模式

在保活模式下，子应用只会进行一次渲染，页面发生切换时承载子应用`dom`的`webcomponent`会保留在内存中，当子应用重新激活时无界会将内存中的`webcomponent`重新挂载到容器上

保活模式下改变 [url](https://wujie-micro.github.io/doc/api/startApp.html#url) 子应用的路由不会发生变化，需要采用 [通信](https://wujie-micro.github.io/doc/guide/communication.html) 的方式对子应用路由进行跳转。保活的子应用的实例不会销毁，子应用被切走了也可以响应 bus 事件，非保活的子应用切走了监听的事件也会全部销毁，需要等下次重新 mount 后重新监听。

#### 单例模式

子应用页面如果切走，会调用`window.__WUJIE_UNMOUNT`销毁子应用当前实例，子应用页面如果切换回来,会调用`window.__WUJIE_MOUNT`渲染子应用新的子应用实例

在单例式下，改变 [url](https://wujie-micro.github.io/doc/api/startApp.html#url) 子应用的路由会发生跳转到对应路由

如果主应用上有多个菜单栏用到了子应用的不同页面，在每个页面启动该子应用的时候将`name`设置为同一个，这样可以共享一个`wujie`实例，承载子应用`js`的`iframe`也实现了共享，不同页面子应用的`url`不同，切换这个子应用的过程相当于：销毁当前应用实例 => 同步新路由 => 创建新应用实例

#### 重建模式

子应既没有设置为保活模式，也没有进行生命周期的改造则进入了重建模式，每次页面切换不仅会销毁承载子应用`dom`的`webcomponent`，还会销毁承载子应用`js`的`iframe`，相应的`wujie`实例和子应用实例都会被销毁

重建模式下改变 [url](https://wujie-micro.github.io/doc/api/startApp.html#url) 子应用的路由会跳转对应路由，但是在 [路由同步](https://wujie-micro.github.io/doc/guide/sync.html) 场景并且子应用的路由同步参数已经同步到主应用`url`上时则无法生效，因为改变`url`后会导致子应用销毁重新渲染，此时如果有同步参数则同步参数的优先级最高

### 生命周期

无界提供完善的生命周期钩子供主应用调用：

- beforeLoad：子应用开始加载静态资源前触发
- beforeMount：子应用渲染前触发 （生命周期改造专用）
- afterMount：子应用渲染后触发（生命周期改造专用）
- beforeUnmount：子应用卸载前触发（生命周期改造专用）
- afterUnmount：子应用卸载后触发（生命周期改造专用）
- activated：子应用进入后触发（保活模式专用）
- deactivated：子应用离开后触发（保活模式专用

### 降级处理

在非降级场景下，子应用的`dom`在`webcomponent`中，运行环境在`iframe`中，`iframe`对`dom`的操作通过`proxy`来代理到`webcomponent`上，而`webcomponent`和`proxy` `IE`都无法支持，这里采用另一个的`iframe`替换`webcomponent`，用`Object.defineProperty`替换`proxy`来做代理的方案。

优点：

1. 降级的行为由框架判断，当浏览器不支持时自动降级
2. 降级后，应用之间也保证了绝对的隔离度
3. 代码无需做任何改动，之前的预加载、保活还有通信的代码都生效，用户不需要为了降级做额外的代码改动导致降级前后运行的代码不一致
4. 用户也可以强制降级，比如说当前浏览器对 webcomponent 和 proxy 是支持的，但是用户还是想将 dom 运行在 iframe 中，就可以将 [degrade](https://wujie-micro.github.io/doc/api/startApp.html#degrade) 设置为 true

缺点：

1. 弹窗只能在子应用内部
2. 由于无法使用`proxy`，无法劫持子应用的`location`，导致访问`window.location.host`的时候拿到的是主应用的`host`，子应用可以从 [$wujie.location](https://wujie-micro.github.io/doc/api/wujie.html#wujie-location) 中拿到子应用正确的`host`

### 接入成本

#### 跨域设置

无界对子应用的侵入非常小，在满足跨域条件下子应用可以不用改造。前提：子应用的资源和接口的请求都在主域名发起，所以会有跨域问题，子应用必须做[cors 设置](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)、

#### 生命周期改造

子应用适配，子应用首先需要做支持跨域请求改造，这个是所有微前端框架运行的前提，除此之外子应用可以不做任何改造就可以在无界框架中运行，不过此时运行的方式是重建模式。子应用在无界中会根据是否保活、是否做了生命周期适配进入不同的运行模式：

无界有三种运行模式：[单例模式](https://wujie-micro.github.io/doc/guide/mode.html#单例模式)、[保活模式](https://wujie-micro.github.io/doc/guide/mode.html#保活模式)、[重建模式](https://wujie-micro.github.io/doc/guide/mode.html#重建模式)

其中[保活模式](https://wujie-micro.github.io/doc/guide/mode.html#保活模式)、[重建模式](https://wujie-micro.github.io/doc/guide/mode.html#重建模式)子应用无需做任何改造工作，[单例模式](https://wujie-micro.github.io/doc/guide/mode.html#单例模式)需要做生命周期改造

改造入口函数：

- 将子应用路由的创建、实例的创建渲染挂载到`window.__WUJIE_MOUNT`函数上
- 将实例的销毁挂载到`window.__WUJIE_UNMOUNT`上
- 如果子应用的实例化是在异步函数中进行的，在定义完生命周期函数后，请务必主动调用无界的渲染函数 `window.__WUJIE.mount()`

其中保活模式、单例模式、重建模式适用于不同的业务场景，就算复杂点的单例模式用户也只是需要做一点简单的生命周期改造工作，可以说子应用适配成本极低。

#### 其他

对于非`webpack`打包的老项目，无需做任何改造但是子应用切换可能出现白屏问题。对于老项目情况，尽可能使用[保活模式](https://wujie-micro.github.io/doc/guide/mode.html#保活模式)降低白屏时间。

## 小结

无界微前端的功能非常强大，支持子应用保活、子应用内嵌、多应用激活、去中心化通信、生命周期、插件系统、vite 框架支持、兼容 IE9、应用共享。

**特点**：

- **接入成本低**：无界微前端的成本非常低，主要体现在主应用的使用成本、子应用的适配成本两个方面。

  - 主应用使用成本：主应用使用无界不需要学习额外的知识，无界提供基于 vue 封装的 wujie-vue 和基于 react 封装的 wujie-react，用户可以当初普通组件一样加载子应用。子应用加载和普通 vue 组件加载并无二致，所有配置都收敛到组件的属性上。

  - 子应用接入成本：子应用首先需要做支持跨域请求改造，这个是所有微前端框架运行的前提，除此之外子应用可以不做任何改造就可以在无界框架中运行，不过此时运行的方式是重建模式。

- **速度快**：主要体现在首屏打开快、运行速度快两个方面。

  - **首屏打开快**

    目前大部分微前端只能做到静态资源预加载，但是就算子应用所有资源都预加载完毕，等到子应用打开时页面仍然有不短的白屏时间，这部分白屏时间主要是子应用 js 的解析和执行。无界微前端不仅能够做到静态资源的预加载，还可以做到子应用的预执行。预执行会阻塞主应用的执行线程，所以无界提供 fiber 执行模式，采取类似 react fiber 的方式间断执行 js，每个 js 文件的执行都包裹在 requestidlecallback 中，每执行一个 js 可以返回响应外部的输入，但是这个颗粒度是 js 文件，如果子应用单个 js 文件过大，可以通过拆包的方式降低体积达到 fiber 执行模式效益最大化。

- ##### 运行速度快

    子应用的 js 在 iframe 内运行，由于 iframe 是一个天然的 js 运行沙箱，所以无需采用 with (fakewindow) 这种方式来指定子应用的执行上下文，从而避免由于采用 with 语句执行子应用代码而导致的性能下降，整体的运行性能和原生性能差别不大。

- **原生隔离**

  - 利用`iframe`的`history`和主应用的`history`在同一个[top-level browsing context](https://html.spec.whatwg.org/multipage/browsers.html#top-level-browsing-context)来搭建天然的路由同步机制
  - 副作用局限在沙箱内部，子应用切换无需任何清理工作，没有额外的切换成本
  - css 沙箱隔离：无界将子应用的 dom 放置在 `webcomponent + shadowdom` 的容器中，除了可继承的 css 属性外实现了应用之间 css 的原生隔离。
  - js 沙箱隔离：无界将子应用的 js 放置在 `iframe（js-iframe）`中运行，实现了应用之间 window、document、location、history 的完全解耦和隔离。
  - js 沙箱和 css 沙箱连接：无界在底层采用 `proxy + Object.defineproperty` 的方式将 js-iframe 中对 dom 操作劫持代理到 `webcomponent shadowRoot` 容器中，开发者无感知也无需关心。
  
- **多应用同时激活在线**

  框架具备同时激活多应用，并保持这些应用路由同步的能力

- **组件式的使用方式**

  无需注册，更无需路由适配，在组件内使用，跟随组件装载、卸载

- **应用级别的 keep-alive**

  子应用开启[保活模式](https://wujie-micro.github.io/doc/api/startApp.html#alive)后，应用发生切换时整个子应用的状态可以保存下来不丢失，结合[预执行模式](https://wujie-micro.github.io/doc/api/preloadApp.html#exec)可以获得类似`ssr`的打开体验

- ##### vite 框架支持

  无界子应用运行在 iframe 中原生支持 esm 的脚本，而且不用担心子应用运行的上下文问题，因为子应用读取的就是 iframe 的 window 上下文，所以无界微前端原生支持 vite 框架。

- **性能和体积兼具**

  - 子应用执行性能和原生一致，子应用实例`instance`运行在`iframe`的`window`上下文中，避免`with(proxyWindow){code}`这样指定代码执行上下文导致的性能下降，但是多了实例化`iframe`的一次性的开销，可以通过 [preload](https://wujie-micro.github.io/doc/api/preloadApp.html) 提前实例化
  - 体积比较轻量，借助`iframe`和`webcomponent`来实现沙箱，有效的减小了代码量

- **开箱即用**

  不管是样式的兼容、路由的处理、弹窗的处理、热更新的加载，子应用完成接入即可开箱即用无需额外处理，应用[接入成本](https://wujie-micro.github.io/doc/guide/start.html#子应用改造)也极低。
  
- ##### 兼容 IE9

  由于无界采用了 webcomponent + shadowdom + proxy 的方案，在某些低版本浏览器上无法运行时，无界微前端会自动降级。
  
  降级方案采用：
  
  - webcomponent + shadowdom ⇒ iframe（dom-iframe）
  - proxy + Object.defineproperty ⇒ Object.defineproperty
  - 子应用运行的方式是 dom-iframe + js-iframe + Object.defineproperty，IE9+ 都可以兼容（无界没有 polyfill es6，需用户手动 babel 处理）。
  
  自动降级后无界依然可以保证子应用的 css 和 js 原生隔离，但是由于 dom-iframe 的限制，弹窗将只能在子应用内部打开。

[基于 iframe 的全新微前端方案](https://mp.weixin.qq.com/s/6ioo7xXngaOaWBaqcNFalg)

[无界极的微前端框架](https://wujie-micro.github.io/doc/)
