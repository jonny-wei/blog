(window.webpackJsonp=window.webpackJsonp||[]).push([[35],{334:function(e,_,r){"use strict";r.r(_);var v=r(6),t=Object(v.a)({},(function(){var e=this,_=e._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[_("h1",{attrs:{id:"iframe-微前端方案"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#iframe-微前端方案"}},[e._v("#")]),e._v(" iframe 微前端方案")]),e._v(" "),_("p",[e._v("iframe 在微前端方案流行前，它其实是一个比较好的解决方案。不管是一些二方或是三方的接入，它都能够很好地满足需求。iframe 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。")]),e._v(" "),_("p",[e._v("这个概念已经和"),_("a",{attrs:{href:"https://micro-frontends.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("微前端"),_("OutboundLink")],1),e._v("不谋而合，相对于目前配置复杂、高适配成本的微前端方案来说，采用"),_("code",[e._v("iframe")]),e._v("方案具有一些显著的"),_("strong",[e._v("优点")]),e._v("：")]),e._v(" "),_("ul",[_("li",[_("strong",[e._v("非常简单")]),e._v("。使用没有任何心智负担")]),e._v(" "),_("li",[_("strong",[e._v("隔离完美")]),e._v("。无论是 js、css、dom 都完全隔离开来")]),e._v(" "),_("li",[_("strong",[e._v("多应用激活")]),e._v("。页面上可以摆放多个"),_("code",[e._v("iframe")]),e._v("来组合业务")])]),e._v(" "),_("p",[e._v("但是开发者又厌恶使用"),_("code",[e._v("iframe")]),e._v("，因为"),_("strong",[e._v("缺点")]),e._v("也非常明显：")]),e._v(" "),_("ul",[_("li",[_("strong",[e._v("路由不同步")]),e._v("。刷新一下， "),_("code",[e._v("iframe url")]),e._v(" 状态丢失、后退前进按钮无法使用。")]),e._v(" "),_("li",[_("strong",[e._v("DOM 割裂严重")]),e._v("。如果 iframe 里来一个带遮罩层的弹框，同时我们要求这个弹框要浏览器居中显示，那么需要浏览器 resize 时自动居中。内部弹框不能够覆盖全局、滚动条问题。")]),e._v(" "),_("li",[_("strong",[e._v("全局上下文完全隔离，通信困难")]),e._v("。iframe 内外系统的通信、数据同步等需求实现困难，只能通过 postmessage 传递序列化的消息。")]),e._v(" "),_("li",[_("strong",[e._v("资源加载慢，白屏时间太长")]),e._v("。每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程。")])]),e._v(" "),_("p",[e._v("能否打造一个完美的"),_("code",[e._v("iframe")]),e._v("，保留所有的优点的同时，解决掉所有的缺点呢？")]),e._v(" "),_("h2",{attrs:{id:"无界架构设计"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#无界架构设计"}},[e._v("#")]),e._v(" 无界架构设计")]),e._v(" "),_("p",[e._v("微前端已经是一个非常成熟的领域了，但开发者不管采用哪个现有方案，在适配成本、样式隔离、运行性能、页面白屏、子应用通信、子应用保活、多应用激活、vite 框架支持、应用共享等用户核心诉求都或存在问题，或无法提供支持。")]),e._v(" "),_("p",[_("a",{attrs:{href:"https://wujie-micro.github.io/doc/",target:"_blank",rel:"noopener noreferrer"}},[e._v("无界微前端框架"),_("OutboundLink")],1),e._v("通过继承"),_("code",[e._v("iframe")]),e._v("的优点，解决"),_("code",[e._v("iframe")]),e._v("的缺点，基于 "),_("code",[e._v("webcomponent")]),e._v(" 容器 + "),_("code",[e._v("iframe")]),e._v("沙箱，能够完善的解决适配成本，解决这些核心诉求。")]),e._v(" "),_("h3",{attrs:{id:"应用加载机制和-js-沙箱机制"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#应用加载机制和-js-沙箱机制"}},[e._v("#")]),e._v(" 应用加载机制和 js 沙箱机制")]),e._v(" "),_("p",[e._v("将子应用的"),_("code",[e._v("js")]),e._v("注入主应用同域的"),_("code",[e._v("iframe")]),e._v("中运行，"),_("code",[e._v("iframe")]),e._v("是一个原生的"),_("code",[e._v("window")]),e._v("沙箱，内部有完整的"),_("code",[e._v("history")]),e._v("和"),_("code",[e._v("location")]),e._v("接口，子应用实例"),_("code",[e._v("instance")]),e._v("运行在"),_("code",[e._v("iframe")]),e._v("中，路由也彻底和主应用解耦，可以直接在业务组件里面启动应用。")]),e._v(" "),_("ul",[_("li",[_("p",[_("strong",[e._v("组件方式来使用微前端")]),e._v("：不用注册，不用改造路由，直接使用无界组件，化繁为简")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("一个页面可以同时激活多个子应用")]),e._v("：子应用采用 iframe 的路由，不用关心路由占用的问题")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("天然 js 沙箱，不会污染主应用环境")]),e._v("：不用修改主应用"),_("code",[e._v("window")]),e._v("任何属性，只在"),_("code",[e._v("iframe")]),e._v("内部进行修改")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("应用切换没有清理成本")]),e._v("：由于不污染主应用，子应用销毁也无需做任何清理工作")])])]),e._v(" "),_("h3",{attrs:{id:"路由同步机制"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#路由同步机制"}},[e._v("#")]),e._v(" 路由同步机制")]),e._v(" "),_("p",[e._v("在"),_("code",[e._v("iframe")]),e._v("内部进行"),_("code",[e._v("history.pushState")]),e._v("，浏览器会自动的在"),_("a",{attrs:{href:"https://html.spec.whatwg.org/multipage/history.html#joint-session-history",target:"_blank",rel:"noopener noreferrer"}},[e._v("joint session history"),_("OutboundLink")],1),e._v("中添加"),_("code",[e._v("iframe")]),e._v("的"),_("a",{attrs:{href:"https://html.spec.whatwg.org/multipage/history.html#session-history",target:"_blank",rel:"noopener noreferrer"}},[e._v("session-history"),_("OutboundLink")],1),e._v("，浏览器的前进、后退在不做任何处理的情况就可以直接作用于子应用")]),e._v(" "),_("p",[e._v("劫持"),_("code",[e._v("iframe")]),e._v("的"),_("code",[e._v("history.pushState")]),e._v("和"),_("code",[e._v("history.replaceState")]),e._v("，就可以将子应用的"),_("code",[e._v("url")]),e._v("同步到主应用的"),_("code",[e._v("query")]),e._v("参数上，当刷新浏览器初始化"),_("code",[e._v("iframe")]),e._v("时，读回子应用的"),_("code",[e._v("url")]),e._v("并使用"),_("code",[e._v("iframe")]),e._v("的"),_("code",[e._v("history.replaceState")]),e._v("进行同步")]),e._v(" "),_("ul",[_("li",[_("strong",[e._v("浏览器刷新、前进、后退都可以作用到子应用")])]),e._v(" "),_("li",[_("strong",[e._v("实现成本低，无需复杂的监听来处理同步问题")])]),e._v(" "),_("li",[_("strong",[e._v("多应用同时激活时也能保持路由同步")])])]),e._v(" "),_("h3",{attrs:{id:"原生隔离与-iframe-连接机制"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#原生隔离与-iframe-连接机制"}},[e._v("#")]),e._v(" 原生隔离与 iframe 连接机制")]),e._v(" "),_("h4",{attrs:{id:"css-沙箱隔离"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#css-沙箱隔离"}},[e._v("#")]),e._v(" CSS 沙箱隔离")]),e._v(" "),_("p",[e._v("无界采用"),_("a",{attrs:{href:"https://developer.mozilla.org/en-US/docs/Web/Web_Components",target:"_blank",rel:"noopener noreferrer"}},[e._v("webcomponent"),_("OutboundLink")],1),e._v("来实现页面的样式隔离，无界会创建一个"),_("code",[e._v("wujie")]),e._v("自定义元素，然后将子应用的完整结构渲染在内部。")]),e._v(" "),_("p",[e._v("无界将子应用的 dom 放置在 "),_("code",[e._v("webcomponent + shadowdom")]),e._v(" 的容器中，除了可继承的 css 属性外实现了应用之间 css 的原生隔离。")]),e._v(" "),_("h4",{attrs:{id:"js-沙箱隔离"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#js-沙箱隔离"}},[e._v("#")]),e._v(" JS 沙箱隔离")]),e._v(" "),_("p",[e._v("无界将子应用的 js 放置在 iframe（js-iframe）中运行，实现了应用之间 window、document、location、history 的完全解耦和隔离。")]),e._v(" "),_("h4",{attrs:{id:"js-沙箱和-css-沙箱连接"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#js-沙箱和-css-沙箱连接"}},[e._v("#")]),e._v(" JS 沙箱和 CSS 沙箱连接")]),e._v(" "),_("p",[e._v("无界在底层采用 "),_("code",[e._v("proxy + Object.defineproperty")]),e._v(" 的方式将 "),_("code",[e._v("js-iframe")]),e._v(" 中对 "),_("code",[e._v("dom 操作")]),e._v("劫持代理到 "),_("code",[e._v("webcomponent shadowRoot")]),e._v(" 容器中，开发者无感知也无需关心。")]),e._v(" "),_("p",[e._v("子应用的实例"),_("code",[e._v("instance")]),e._v("在"),_("code",[e._v("iframe")]),e._v("内运行，"),_("code",[e._v("dom")]),e._v("在主应用容器下的"),_("code",[e._v("webcomponent")]),e._v("内，通过代理 "),_("code",[e._v("iframe")]),e._v("的"),_("code",[e._v("document")]),e._v("到"),_("code",[e._v("webcomponent")]),e._v("，可以实现两者的互联。将"),_("code",[e._v("document")]),e._v("的查询类接口："),_("code",[e._v("getElementsByTagName、getElementsByClassName、getElementsByName、getElementById、querySelector、querySelectorAll、head、body")]),e._v("全部代理到"),_("code",[e._v("webcomponent")]),e._v("，这样"),_("code",[e._v("instance")]),e._v("和"),_("code",[e._v("webcomponent")]),e._v("就精准的链接起来。")]),e._v(" "),_("p",[e._v("当子应用发生切换，"),_("code",[e._v("iframe")]),e._v("保留下来，子应用的容器可能销毁，但"),_("code",[e._v("webcomponent")]),e._v("依然可以选择保留，这样等应用切换回来将"),_("code",[e._v("webcomponent")]),e._v("再挂载回容器上，子应用可以获得类似"),_("code",[e._v("vue")]),e._v("的"),_("code",[e._v("keep-alive")]),e._v("的能力.")]),e._v(" "),_("ul",[_("li",[_("p",[_("strong",[e._v("天然 css 沙箱")]),e._v("：直接物理隔离，样式隔离子应用不用做任何修改")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("天然适配弹窗问题")]),e._v("："),_("code",[e._v("document.body")]),e._v("的"),_("code",[e._v("appendChild")]),e._v("或者"),_("code",[e._v("insertBefore")]),e._v("会代理直接插入到"),_("code",[e._v("webcomponent")]),e._v("，子应用不用做任何改造")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("子应用保活")]),e._v("：子应用保留"),_("code",[e._v("iframe")]),e._v("和"),_("code",[e._v("webcomponent")]),e._v("，应用内部的"),_("code",[e._v("state")]),e._v("不会丢失")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("完整的 DOM 结构")]),e._v("："),_("code",[e._v("webcomponent")]),e._v("保留了子应用完整的"),_("code",[e._v("html")]),e._v("结构，样式和结构完全对应，子应用不用做任何修改")])])]),e._v(" "),_("h3",{attrs:{id:"通信机制"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#通信机制"}},[e._v("#")]),e._v(" 通信机制")]),e._v(" "),_("p",[e._v("承载子应用的"),_("code",[e._v("iframe")]),e._v("和主应用是同域的，所以主、子应用天然就可以很好的进行通信，在无界我们提供三种通信方式")]),e._v(" "),_("ul",[_("li",[_("p",[_("strong",[e._v("props 注入机制")]),e._v("：子应用通过"),_("code",[e._v("$wujie.props")]),e._v("可以轻松拿到主应用注入的数据")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("window.parent 通信机制")]),e._v("：子应用"),_("code",[e._v("iframe")]),e._v("沙箱和主应用同源，子应用可以直接通过"),_("code",[e._v("window.parent")]),e._v("和主应用通信")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("去中心化的通信机制")]),e._v("：无界提供了"),_("code",[e._v("EventBus")]),e._v("实例，注入到主应用和子应用，所有的应用可以去中心化的进行通信")])])]),e._v(" "),_("h3",{attrs:{id:"预加载-预执行"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#预加载-预执行"}},[e._v("#")]),e._v(" 预加载 & 预执行")]),e._v(" "),_("ul",[_("li",[_("strong",[e._v("预加载")]),e._v("。预加载指的是在应用空闲的时候"),_("code",[e._v("requestIdleCallback")]),e._v("将所需要的静态资源提前从网络中加载到内存中，详见"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/preloadApp.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("preloadApp"),_("OutboundLink")],1)]),e._v(" "),_("li",[_("strong",[e._v("预执行")]),e._v("。预执行指的是在应用空闲的时候将子应用提前渲染出来，可以进一步提升子应用打开时间只需要在"),_("code",[e._v("preloadApp")]),e._v("中将 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/preloadApp.html#exec",target:"_blank",rel:"noopener noreferrer"}},[e._v("exec"),_("OutboundLink")],1),e._v(" 设置为"),_("code",[e._v("true")]),e._v("即可。由于子应用提前渲染可能会导致阻塞主应用的线程，所以无界提供了类似 "),_("a",{attrs:{href:"https://github.com/acdlite/react-fiber-architecture",target:"_blank",rel:"noopener noreferrer"}},[e._v("react-fiber"),_("OutboundLink")],1),e._v(" 方式来防止阻塞线程，详见 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/startApp.html#fiber",target:"_blank",rel:"noopener noreferrer"}},[e._v("fiber"),_("OutboundLink")],1)])]),e._v(" "),_("h3",{attrs:{id:"运行模式"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#运行模式"}},[e._v("#")]),e._v(" 运行模式")]),e._v(" "),_("p",[e._v("在微前端框架中，子应用放置在主应用页面中随着主应用页面的打开和关闭反复的激活和销毁，而在无界微前端框架中子应用是否保活以及是否进行生命周期的改造会进入完全不同的处理流程")]),e._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/architecture/micro10.png",alt:"micro10"}})]),e._v(" "),_("p",[e._v("子应用适配，子应用首先需要做支持跨域请求改造，这个是所有微前端框架运行的前提，除此之外子应用可以不做任何改造就可以在无界框架中运行，不过此时运行的方式是重建模式。子应用在无界中会根据是否保活、是否做了生命周期适配进入不同的运行模式：")]),e._v(" "),_("h4",{attrs:{id:"保活模式"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#保活模式"}},[e._v("#")]),e._v(" 保活模式")]),e._v(" "),_("p",[e._v("在保活模式下，子应用只会进行一次渲染，页面发生切换时承载子应用"),_("code",[e._v("dom")]),e._v("的"),_("code",[e._v("webcomponent")]),e._v("会保留在内存中，当子应用重新激活时无界会将内存中的"),_("code",[e._v("webcomponent")]),e._v("重新挂载到容器上")]),e._v(" "),_("p",[e._v("保活模式下改变 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/startApp.html#url",target:"_blank",rel:"noopener noreferrer"}},[e._v("url"),_("OutboundLink")],1),e._v(" 子应用的路由不会发生变化，需要采用 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/communication.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("通信"),_("OutboundLink")],1),e._v(" 的方式对子应用路由进行跳转。保活的子应用的实例不会销毁，子应用被切走了也可以响应 bus 事件，非保活的子应用切走了监听的事件也会全部销毁，需要等下次重新 mount 后重新监听。")]),e._v(" "),_("h4",{attrs:{id:"单例模式"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#单例模式"}},[e._v("#")]),e._v(" 单例模式")]),e._v(" "),_("p",[e._v("子应用页面如果切走，会调用"),_("code",[e._v("window.__WUJIE_UNMOUNT")]),e._v("销毁子应用当前实例，子应用页面如果切换回来,会调用"),_("code",[e._v("window.__WUJIE_MOUNT")]),e._v("渲染子应用新的子应用实例")]),e._v(" "),_("p",[e._v("在单例式下，改变 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/startApp.html#url",target:"_blank",rel:"noopener noreferrer"}},[e._v("url"),_("OutboundLink")],1),e._v(" 子应用的路由会发生跳转到对应路由")]),e._v(" "),_("p",[e._v("如果主应用上有多个菜单栏用到了子应用的不同页面，在每个页面启动该子应用的时候将"),_("code",[e._v("name")]),e._v("设置为同一个，这样可以共享一个"),_("code",[e._v("wujie")]),e._v("实例，承载子应用"),_("code",[e._v("js")]),e._v("的"),_("code",[e._v("iframe")]),e._v("也实现了共享，不同页面子应用的"),_("code",[e._v("url")]),e._v("不同，切换这个子应用的过程相当于：销毁当前应用实例 => 同步新路由 => 创建新应用实例")]),e._v(" "),_("h4",{attrs:{id:"重建模式"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#重建模式"}},[e._v("#")]),e._v(" 重建模式")]),e._v(" "),_("p",[e._v("子应既没有设置为保活模式，也没有进行生命周期的改造则进入了重建模式，每次页面切换不仅会销毁承载子应用"),_("code",[e._v("dom")]),e._v("的"),_("code",[e._v("webcomponent")]),e._v("，还会销毁承载子应用"),_("code",[e._v("js")]),e._v("的"),_("code",[e._v("iframe")]),e._v("，相应的"),_("code",[e._v("wujie")]),e._v("实例和子应用实例都会被销毁")]),e._v(" "),_("p",[e._v("重建模式下改变 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/startApp.html#url",target:"_blank",rel:"noopener noreferrer"}},[e._v("url"),_("OutboundLink")],1),e._v(" 子应用的路由会跳转对应路由，但是在 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/sync.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("路由同步"),_("OutboundLink")],1),e._v(" 场景并且子应用的路由同步参数已经同步到主应用"),_("code",[e._v("url")]),e._v("上时则无法生效，因为改变"),_("code",[e._v("url")]),e._v("后会导致子应用销毁重新渲染，此时如果有同步参数则同步参数的优先级最高")]),e._v(" "),_("h3",{attrs:{id:"生命周期"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#生命周期"}},[e._v("#")]),e._v(" 生命周期")]),e._v(" "),_("p",[e._v("无界提供完善的生命周期钩子供主应用调用：")]),e._v(" "),_("ul",[_("li",[e._v("beforeLoad：子应用开始加载静态资源前触发")]),e._v(" "),_("li",[e._v("beforeMount：子应用渲染前触发 （生命周期改造专用）")]),e._v(" "),_("li",[e._v("afterMount：子应用渲染后触发（生命周期改造专用）")]),e._v(" "),_("li",[e._v("beforeUnmount：子应用卸载前触发（生命周期改造专用）")]),e._v(" "),_("li",[e._v("afterUnmount：子应用卸载后触发（生命周期改造专用）")]),e._v(" "),_("li",[e._v("activated：子应用进入后触发（保活模式专用）")]),e._v(" "),_("li",[e._v("deactivated：子应用离开后触发（保活模式专用")])]),e._v(" "),_("h3",{attrs:{id:"降级处理"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#降级处理"}},[e._v("#")]),e._v(" 降级处理")]),e._v(" "),_("p",[e._v("在非降级场景下，子应用的"),_("code",[e._v("dom")]),e._v("在"),_("code",[e._v("webcomponent")]),e._v("中，运行环境在"),_("code",[e._v("iframe")]),e._v("中，"),_("code",[e._v("iframe")]),e._v("对"),_("code",[e._v("dom")]),e._v("的操作通过"),_("code",[e._v("proxy")]),e._v("来代理到"),_("code",[e._v("webcomponent")]),e._v("上，而"),_("code",[e._v("webcomponent")]),e._v("和"),_("code",[e._v("proxy")]),e._v(" "),_("code",[e._v("IE")]),e._v("都无法支持，这里采用另一个的"),_("code",[e._v("iframe")]),e._v("替换"),_("code",[e._v("webcomponent")]),e._v("，用"),_("code",[e._v("Object.defineProperty")]),e._v("替换"),_("code",[e._v("proxy")]),e._v("来做代理的方案。")]),e._v(" "),_("p",[e._v("优点：")]),e._v(" "),_("ol",[_("li",[e._v("降级的行为由框架判断，当浏览器不支持时自动降级")]),e._v(" "),_("li",[e._v("降级后，应用之间也保证了绝对的隔离度")]),e._v(" "),_("li",[e._v("代码无需做任何改动，之前的预加载、保活还有通信的代码都生效，用户不需要为了降级做额外的代码改动导致降级前后运行的代码不一致")]),e._v(" "),_("li",[e._v("用户也可以强制降级，比如说当前浏览器对 webcomponent 和 proxy 是支持的，但是用户还是想将 dom 运行在 iframe 中，就可以将 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/startApp.html#degrade",target:"_blank",rel:"noopener noreferrer"}},[e._v("degrade"),_("OutboundLink")],1),e._v(" 设置为 true")])]),e._v(" "),_("p",[e._v("缺点：")]),e._v(" "),_("ol",[_("li",[e._v("弹窗只能在子应用内部")]),e._v(" "),_("li",[e._v("由于无法使用"),_("code",[e._v("proxy")]),e._v("，无法劫持子应用的"),_("code",[e._v("location")]),e._v("，导致访问"),_("code",[e._v("window.location.host")]),e._v("的时候拿到的是主应用的"),_("code",[e._v("host")]),e._v("，子应用可以从 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/wujie.html#wujie-location",target:"_blank",rel:"noopener noreferrer"}},[e._v("$wujie.location"),_("OutboundLink")],1),e._v(" 中拿到子应用正确的"),_("code",[e._v("host")])])]),e._v(" "),_("h3",{attrs:{id:"接入成本"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#接入成本"}},[e._v("#")]),e._v(" 接入成本")]),e._v(" "),_("h4",{attrs:{id:"跨域设置"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#跨域设置"}},[e._v("#")]),e._v(" 跨域设置")]),e._v(" "),_("p",[e._v("无界对子应用的侵入非常小，在满足跨域条件下子应用可以不用改造。前提：子应用的资源和接口的请求都在主域名发起，所以会有跨域问题，子应用必须做"),_("a",{attrs:{href:"https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS",target:"_blank",rel:"noopener noreferrer"}},[e._v("cors 设置"),_("OutboundLink")],1),e._v("、")]),e._v(" "),_("h4",{attrs:{id:"生命周期改造"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#生命周期改造"}},[e._v("#")]),e._v(" 生命周期改造")]),e._v(" "),_("p",[e._v("子应用适配，子应用首先需要做支持跨域请求改造，这个是所有微前端框架运行的前提，除此之外子应用可以不做任何改造就可以在无界框架中运行，不过此时运行的方式是重建模式。子应用在无界中会根据是否保活、是否做了生命周期适配进入不同的运行模式：")]),e._v(" "),_("p",[e._v("无界有三种运行模式："),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/mode.html#%E5%8D%95%E4%BE%8B%E6%A8%A1%E5%BC%8F",target:"_blank",rel:"noopener noreferrer"}},[e._v("单例模式"),_("OutboundLink")],1),e._v("、"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/mode.html#%E4%BF%9D%E6%B4%BB%E6%A8%A1%E5%BC%8F",target:"_blank",rel:"noopener noreferrer"}},[e._v("保活模式"),_("OutboundLink")],1),e._v("、"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/mode.html#%E9%87%8D%E5%BB%BA%E6%A8%A1%E5%BC%8F",target:"_blank",rel:"noopener noreferrer"}},[e._v("重建模式"),_("OutboundLink")],1)]),e._v(" "),_("p",[e._v("其中"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/mode.html#%E4%BF%9D%E6%B4%BB%E6%A8%A1%E5%BC%8F",target:"_blank",rel:"noopener noreferrer"}},[e._v("保活模式"),_("OutboundLink")],1),e._v("、"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/mode.html#%E9%87%8D%E5%BB%BA%E6%A8%A1%E5%BC%8F",target:"_blank",rel:"noopener noreferrer"}},[e._v("重建模式"),_("OutboundLink")],1),e._v("子应用无需做任何改造工作，"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/mode.html#%E5%8D%95%E4%BE%8B%E6%A8%A1%E5%BC%8F",target:"_blank",rel:"noopener noreferrer"}},[e._v("单例模式"),_("OutboundLink")],1),e._v("需要做生命周期改造")]),e._v(" "),_("p",[e._v("改造入口函数：")]),e._v(" "),_("ul",[_("li",[e._v("将子应用路由的创建、实例的创建渲染挂载到"),_("code",[e._v("window.__WUJIE_MOUNT")]),e._v("函数上")]),e._v(" "),_("li",[e._v("将实例的销毁挂载到"),_("code",[e._v("window.__WUJIE_UNMOUNT")]),e._v("上")]),e._v(" "),_("li",[e._v("如果子应用的实例化是在异步函数中进行的，在定义完生命周期函数后，请务必主动调用无界的渲染函数 "),_("code",[e._v("window.__WUJIE.mount()")])])]),e._v(" "),_("p",[e._v("其中保活模式、单例模式、重建模式适用于不同的业务场景，就算复杂点的单例模式用户也只是需要做一点简单的生命周期改造工作，可以说子应用适配成本极低。")]),e._v(" "),_("h4",{attrs:{id:"其他"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#其他"}},[e._v("#")]),e._v(" 其他")]),e._v(" "),_("p",[e._v("对于非"),_("code",[e._v("webpack")]),e._v("打包的老项目，无需做任何改造但是子应用切换可能出现白屏问题。对于老项目情况，尽可能使用"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/mode.html#%E4%BF%9D%E6%B4%BB%E6%A8%A1%E5%BC%8F",target:"_blank",rel:"noopener noreferrer"}},[e._v("保活模式"),_("OutboundLink")],1),e._v("降低白屏时间。")]),e._v(" "),_("h2",{attrs:{id:"小结"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#小结"}},[e._v("#")]),e._v(" 小结")]),e._v(" "),_("p",[e._v("无界微前端的功能非常强大，支持子应用保活、子应用内嵌、多应用激活、去中心化通信、生命周期、插件系统、vite 框架支持、兼容 IE9、应用共享。")]),e._v(" "),_("p",[_("strong",[e._v("特点")]),e._v("：")]),e._v(" "),_("ul",[_("li",[_("p",[_("strong",[e._v("接入成本低")]),e._v("：无界微前端的成本非常低，主要体现在主应用的使用成本、子应用的适配成本两个方面。")]),e._v(" "),_("ul",[_("li",[_("p",[e._v("主应用使用成本：主应用使用无界不需要学习额外的知识，无界提供基于 vue 封装的 wujie-vue 和基于 react 封装的 wujie-react，用户可以当初普通组件一样加载子应用。子应用加载和普通 vue 组件加载并无二致，所有配置都收敛到组件的属性上。")])]),e._v(" "),_("li",[_("p",[e._v("子应用接入成本：子应用首先需要做支持跨域请求改造，这个是所有微前端框架运行的前提，除此之外子应用可以不做任何改造就可以在无界框架中运行，不过此时运行的方式是重建模式。")])])])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("速度快")]),e._v("：主要体现在首屏打开快、运行速度快两个方面。")]),e._v(" "),_("ul",[_("li",[_("p",[_("strong",[e._v("首屏打开快")])]),e._v(" "),_("p",[e._v("目前大部分微前端只能做到静态资源预加载，但是就算子应用所有资源都预加载完毕，等到子应用打开时页面仍然有不短的白屏时间，这部分白屏时间主要是子应用 js 的解析和执行。无界微前端不仅能够做到静态资源的预加载，还可以做到子应用的预执行。预执行会阻塞主应用的执行线程，所以无界提供 fiber 执行模式，采取类似 react fiber 的方式间断执行 js，每个 js 文件的执行都包裹在 requestidlecallback 中，每执行一个 js 可以返回响应外部的输入，但是这个颗粒度是 js 文件，如果子应用单个 js 文件过大，可以通过拆包的方式降低体积达到 fiber 执行模式效益最大化。")])])])]),e._v(" "),_("li",[_("h5",{attrs:{id:"运行速度快"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#运行速度快"}},[e._v("#")]),e._v(" 运行速度快")]),e._v(" "),_("p",[e._v("子应用的 js 在 iframe 内运行，由于 iframe 是一个天然的 js 运行沙箱，所以无需采用 with (fakewindow) 这种方式来指定子应用的执行上下文，从而避免由于采用 with 语句执行子应用代码而导致的性能下降，整体的运行性能和原生性能差别不大。")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("原生隔离")])]),e._v(" "),_("ul",[_("li",[e._v("利用"),_("code",[e._v("iframe")]),e._v("的"),_("code",[e._v("history")]),e._v("和主应用的"),_("code",[e._v("history")]),e._v("在同一个"),_("a",{attrs:{href:"https://html.spec.whatwg.org/multipage/browsers.html#top-level-browsing-context",target:"_blank",rel:"noopener noreferrer"}},[e._v("top-level browsing context"),_("OutboundLink")],1),e._v("来搭建天然的路由同步机制")]),e._v(" "),_("li",[e._v("副作用局限在沙箱内部，子应用切换无需任何清理工作，没有额外的切换成本")]),e._v(" "),_("li",[e._v("css 沙箱隔离：无界将子应用的 dom 放置在 "),_("code",[e._v("webcomponent + shadowdom")]),e._v(" 的容器中，除了可继承的 css 属性外实现了应用之间 css 的原生隔离。")]),e._v(" "),_("li",[e._v("js 沙箱隔离：无界将子应用的 js 放置在 "),_("code",[e._v("iframe（js-iframe）")]),e._v("中运行，实现了应用之间 window、document、location、history 的完全解耦和隔离。")]),e._v(" "),_("li",[e._v("js 沙箱和 css 沙箱连接：无界在底层采用 "),_("code",[e._v("proxy + Object.defineproperty")]),e._v(" 的方式将 js-iframe 中对 dom 操作劫持代理到 "),_("code",[e._v("webcomponent shadowRoot")]),e._v(" 容器中，开发者无感知也无需关心。")])])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("多应用同时激活在线")])]),e._v(" "),_("p",[e._v("框架具备同时激活多应用，并保持这些应用路由同步的能力")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("组件式的使用方式")])]),e._v(" "),_("p",[e._v("无需注册，更无需路由适配，在组件内使用，跟随组件装载、卸载")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("应用级别的 keep-alive")])]),e._v(" "),_("p",[e._v("子应用开启"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/startApp.html#alive",target:"_blank",rel:"noopener noreferrer"}},[e._v("保活模式"),_("OutboundLink")],1),e._v("后，应用发生切换时整个子应用的状态可以保存下来不丢失，结合"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/preloadApp.html#exec",target:"_blank",rel:"noopener noreferrer"}},[e._v("预执行模式"),_("OutboundLink")],1),e._v("可以获得类似"),_("code",[e._v("ssr")]),e._v("的打开体验")])]),e._v(" "),_("li",[_("h5",{attrs:{id:"vite-框架支持"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#vite-框架支持"}},[e._v("#")]),e._v(" vite 框架支持")]),e._v(" "),_("p",[e._v("无界子应用运行在 iframe 中原生支持 esm 的脚本，而且不用担心子应用运行的上下文问题，因为子应用读取的就是 iframe 的 window 上下文，所以无界微前端原生支持 vite 框架。")])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("性能和体积兼具")])]),e._v(" "),_("ul",[_("li",[e._v("子应用执行性能和原生一致，子应用实例"),_("code",[e._v("instance")]),e._v("运行在"),_("code",[e._v("iframe")]),e._v("的"),_("code",[e._v("window")]),e._v("上下文中，避免"),_("code",[e._v("with(proxyWindow){code}")]),e._v("这样指定代码执行上下文导致的性能下降，但是多了实例化"),_("code",[e._v("iframe")]),e._v("的一次性的开销，可以通过 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/preloadApp.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("preload"),_("OutboundLink")],1),e._v(" 提前实例化")]),e._v(" "),_("li",[e._v("体积比较轻量，借助"),_("code",[e._v("iframe")]),e._v("和"),_("code",[e._v("webcomponent")]),e._v("来实现沙箱，有效的减小了代码量")])])]),e._v(" "),_("li",[_("p",[_("strong",[e._v("开箱即用")])]),e._v(" "),_("p",[e._v("不管是样式的兼容、路由的处理、弹窗的处理、热更新的加载，子应用完成接入即可开箱即用无需额外处理，应用"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/start.html#%E5%AD%90%E5%BA%94%E7%94%A8%E6%94%B9%E9%80%A0",target:"_blank",rel:"noopener noreferrer"}},[e._v("接入成本"),_("OutboundLink")],1),e._v("也极低。")])]),e._v(" "),_("li",[_("h5",{attrs:{id:"兼容-ie9"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#兼容-ie9"}},[e._v("#")]),e._v(" 兼容 IE9")]),e._v(" "),_("p",[e._v("由于无界采用了 webcomponent + shadowdom + proxy 的方案，在某些低版本浏览器上无法运行时，无界微前端会自动降级。")]),e._v(" "),_("p",[e._v("降级方案采用：")]),e._v(" "),_("ul",[_("li",[e._v("webcomponent + shadowdom ⇒ iframe（dom-iframe）")]),e._v(" "),_("li",[e._v("proxy + Object.defineproperty ⇒ Object.defineproperty")]),e._v(" "),_("li",[e._v("子应用运行的方式是 dom-iframe + js-iframe + Object.defineproperty，IE9+ 都可以兼容（无界没有 polyfill es6，需用户手动 babel 处理）。")])]),e._v(" "),_("p",[e._v("自动降级后无界依然可以保证子应用的 css 和 js 原生隔离，但是由于 dom-iframe 的限制，弹窗将只能在子应用内部打开。")])])]),e._v(" "),_("p",[_("a",{attrs:{href:"https://mp.weixin.qq.com/s/6ioo7xXngaOaWBaqcNFalg",target:"_blank",rel:"noopener noreferrer"}},[e._v("基于 iframe 的全新微前端方案"),_("OutboundLink")],1)]),e._v(" "),_("p",[_("a",{attrs:{href:"https://wujie-micro.github.io/doc/",target:"_blank",rel:"noopener noreferrer"}},[e._v("无界极的微前端框架"),_("OutboundLink")],1)])])}),[],!1,null,null,null);_.default=t.exports}}]);