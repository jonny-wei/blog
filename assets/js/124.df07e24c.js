(window.webpackJsonp=window.webpackJsonp||[]).push([[124],{425:function(e,v,_){"use strict";_.r(v);var t=_(6),r=Object(t.a)({},(function(){var e=this,v=e._self._c;return v("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[v("h1",{attrs:{id:"跨端技术通识"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#跨端技术通识"}},[e._v("#")]),e._v(" 跨端技术通识")]),e._v(" "),v("p",[e._v("write once, run everywhere。一次编写，四处运行就是跨端的真谛。跨端的基本原理是跨端引擎需要实现一个渲染引擎、实现一个 vm，基于这套架构实现各种组件和 api，跨端容器上层对接一个 ui 框架，再上层的业务代码可以基于容器的 api 实现跨端的渲染和逻辑。跨平台和跨端的区别在于跨平台是指跨操作系统，而跨端则是指跨客户端。")]),e._v(" "),v("h2",{attrs:{id:"主流跨端方案"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#主流跨端方案"}},[e._v("#")]),e._v(" 主流跨端方案")]),e._v(" "),v("h3",{attrs:{id:"web-渲染"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#web-渲染"}},[e._v("#")]),e._v(" Web 渲染")]),e._v(" "),v("p",[e._v("浏览器本就是一个跨端实现方案，因为你只需要输入网址，就能在任何端的浏览器上打开你的网页。那么，如果我们把浏览器嵌入 "),v("code",[e._v("app")]),e._v(" 中，再将地址栏等内容隐藏掉，是不是就能将我们的网页嵌入原生 "),v("code",[e._v("app")]),e._v(" 了。而这个嵌入 "),v("code",[e._v("app")]),e._v(" 的浏览器，我们把它称之为 "),v("code",[e._v("webview")]),e._v(" ，所以只要某个端支持 "),v("code",[e._v("webview")]),e._v(" ，那么它就能使用这种方案跨端。同时这也是开发成本最小的一种方案。")]),e._v(" "),v("p",[e._v("使用原生 "),v("code",[e._v("WebView")]),e._v(" 控件渲染 HTML 页面，并在原生应用中定义可供 H5 页面访问原生部分能力的接口 "),v("code",[e._v("JSBridge")]),e._v("，从而实现 H5 和 Native 双向通信，也使得 H5 的能力向端侧进一步扩展。")]),e._v(" "),v("p",[e._v("Web 渲染方案本质上是依托原生应用的内嵌浏览器控件 "),v("code",[e._v("WebView")]),e._v(" 去渲染 H5 页面，因此 h5 App 的渲染流水线和 Web 页面渲染相一致，能力也局限在 "),v("code",[e._v("WebView")]),e._v(" 这一沙箱。")]),e._v(" "),v("p",[e._v("Web 渲染方案的性能瓶颈和 Web 页面开发中遇到的类似，即"),v("strong",[e._v("首屏渲染优化问题")]),e._v("（白屏），同时多出了一个 "),v("strong",[e._v("WebView 初始化问题")]),e._v("。")]),e._v(" "),v("ul",[v("li",[v("p",[e._v("针对资源加载所带来的白屏问题，业界又提出了"),v("strong",[e._v("离线包的优化方案")]),e._v("。所谓离线包机制，大体思路就是将原有从线上加载 H5 应用，提前下发到本地，通过 FileIO 或是内存等方式直接进行页面渲染，达到接近原生的用户体验。")])]),e._v(" "),v("li",[v("p",[e._v("对于 WebView 初始化所带来的性能开销，不少公司针对自身的 APP 进行"),v("strong",[e._v("内核的定制化改造")]),e._v("，诸如腾讯的 X5 内核以及阿里 UC 技术团队的 UCWebView 等。")])])]),e._v(" "),v("p",[e._v("在这基础上业内又提出 "),v("strong",[e._v("H5 容器")]),e._v("的技术解决方案，H5 容器提供丰富的内置 JSAPI，增强版的 WebView 控件以及插件机制等能力，对原始版本的方案做了进一步功能高内聚和模块低耦合。")]),e._v(" "),v("h3",{attrs:{id:"原生渲染"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#原生渲染"}},[e._v("#")]),e._v(" 原生渲染")]),e._v(" "),v("p",[e._v("典型的代表是 "),v("code",[e._v("React Native")]),e._v(" 和 "),v("code",[e._v("Weex")]),e._v("。")]),e._v(" "),v("p",[e._v("Web 渲染方案的致命弱点在于无法出色地完成高性能和体验的目标，但是其良好的社区生态、跨平台一致性和高研发效率都是其无法忽视的优势，那么如何做到二者的平衡，答案就是原生渲染方案。")]),e._v(" "),v("p",[e._v("原生渲染方案的基本思路是在 UI 层采用前端框架，然后通过 JavaScript 引擎解析 JS 代码，JS 代码通过 Bridge 层调用原生组件和能力，不同于一般 "),v("code",[e._v("react")]),e._v(" 应用，它需要借助原生的能力来进行渲染，组件最终都会被渲染为原生组件，这可以给用户带来比较好的体验。")]),e._v(" "),v("h3",{attrs:{id:"自渲染引擎渲染"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#自渲染引擎渲染"}},[e._v("#")]),e._v(" 自渲染引擎渲染")]),e._v(" "),v("p",[e._v("典型代表就是 "),v("code",[e._v("flutter")]),e._v("。自渲染引擎渲染有别于 Web 渲染采用 WebView 容器进行渲染 UI、原生渲染通过 Bridge 方式转化为原生控件渲染 UI 等方案。它并没有直接借用原生能力去渲染组件，而是利用了更底层的渲染能力，直接从底层渲染上实现 UI 的绘制。这种方式显然链路会比上述方案的链路跟短，那么性能也就会更好，同时在保证多端渲染一致性上也会比上一种方案更加可靠 。")]),e._v(" "),v("h3",{attrs:{id:"小程序另类跨端"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#小程序另类跨端"}},[e._v("#")]),e._v(" 小程序另类跨端")]),e._v(" "),v("p",[e._v("小程序采用的技术手段仍脱离不了 Web 渲染方案，即采用 WebView 作为渲染引擎、JSBridge 的封装和离线包机制等，但是其最大创新之处在于将渲染层和逻辑层进行了分离，提供一个干净纯粹的 JavaScript 运行时，多 WebView 的架构使得用户体验进一步逼近原生体验。")]),e._v(" "),v("p",[e._v("小程序的渲染层和逻辑层分别由两个线程管理，渲染层采用 WebView 进行页面渲染（iOS 使用 UIWebView/WKWebView，Android 使用 WebView），小程序的多页面也由多 WebView 接管。逻辑层从 WebView 分离，使用 JavaScript 引擎（iOS 使用 JavaScriptCore，Android 使用 V8）单独开启一个 Worker 线程去执行 JavaScript 代码。逻辑层和渲染层之间的通信经由 Native 层中转，网络 IO 也通过 Native 层进行转发。")]),e._v(" "),v("p",[e._v("和之前的 Web 渲染技术相比较来看，小程序采用多 WebView + 双线程模型的架构。由多 WebView 构成的视图层为页面性能赋予更加接近原生的用户体验，单个 WebView 承载更加轻量的页面渲染任务，JavaScript 脚本单独抽离在 Worker 线程限制了开发者直接操作页面的能力，进一步约束在微信小程序的规范下，这也是小程序无法直接操作 DOM 的缘由。")]),e._v(" "),v("p",[e._v("这里多提一点的是，小程序的组件分为原生组件和非原生组件，对于原生组件而言，这就脱离的 Web 渲染方案的范畴，属于原生渲染方案的一部分，所以从这点上看，小程序也可以算得上是 Web 渲染和原生渲染的融合解决方案。综上来看，Web 渲染跨平台方案经历了三个阶段性的发展，从原始时期的 h5 + JSBridge + WebView，到 h5 容器的抽象提升，再到目前如火如荼的小程序。不难看出，Web 渲染方案的有如下特点：")]),e._v(" "),v("ul",[v("li",[v("p",[e._v("开发效率高。采用 Web 技术，技术门槛相对较低，技术人员积累丰厚，社区资源丰富，对前端友好，一次开发，多端运行")])]),e._v(" "),v("li",[v("p",[e._v("动态化好。Web 技术的天然动态特性支持，无需发版")])]),e._v(" "),v("li",[v("p",[e._v("表现一致性佳。Web 页面除了个别元素和属性的差异、多屏适配外，其双端表现相对一致")])]),e._v(" "),v("li",[v("p",[e._v("性能较差。页面采用 WebView 渲染，页面加载耗时长，功能受限于沙箱，能力有限，难以承接复杂交互或是需要高性能的任务，整体用户体验差")])])]),e._v(" "),v("p",[e._v("现在许多大厂都有一套自己的小程序实现，但相互之间还是有不小差异的，通常可以借助 "),v("code",[e._v("taro")]),e._v(" ，"),v("code",[e._v("uni-app")]),e._v("，"),v("code",[e._v("remax")]),e._v(" 这类框架实现一套代码，多端运行的效果，这也算是一种另类的跨端。")]),e._v(" "),v("h2",{attrs:{id:"了解-rn-原生渲染"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#了解-rn-原生渲染"}},[e._v("#")]),e._v(" 了解 RN 原生渲染")]),e._v(" "),v("h3",{attrs:{id:"整体架构"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#整体架构"}},[e._v("#")]),e._v(" 整体架构")]),e._v(" "),v("p",[e._v("React Native 的整体架构图如下：")]),e._v(" "),v("p",[v("img",{attrs:{src:"/blog/images/mobile/cross1.png",alt:"cross1"}})]),e._v(" "),v("ul",[v("li",[e._v("React 层：利用 React 框架进行 UI 的数据描述，开发者使用 Class Component 或 Function Component 进行页面开发，框架内部将会把页面描述转化为 ReactElement 这一代表的虚拟 DOM 的数据结构，用于运行时的 Diff 对比和消息收发等。")]),e._v(" "),v("li",[e._v("JS Bundle 中间产物：React Native 通过 metro 打包功能直接将整个 RN 应用打包为一个 JSBundle，通过 Bridge 层在 RN 应用初始化时加载整个 JS 包进来")]),e._v(" "),v("li",[e._v("Bridge 层：Bridge 是连接 React 和 Native 的中间层，React 层的 UI 需要通过 Bridge 层的 UIManager 接口实现原生控件的创建和更新，通过 NativeModules 接口实现原生能力的调用")]),e._v(" "),v("li",[e._v("Native 层：在 Native 层中，Native Modules 实现了与上层交互的原生能力接口，Native UI 实现终端实际的控件展示，Yoga 跨平台布局引擎实现了基于 Flexbox 布局系统的 JS 和 Native 的镜像映射关系。")])]),e._v(" "),v("p",[e._v("值得注意的是，整个 RN 架构中，存在以下 UI 视图数据结构：")]),e._v(" "),v("p",[v("img",{attrs:{src:"/blog/images/mobile/cross2.png",alt:"cross2"}})]),e._v(" "),v("h3",{attrs:{id:"rn-运行机制"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#rn-运行机制"}},[e._v("#")]),e._v(" RN 运行机制")]),e._v(" "),v("p",[e._v("下面从线程模型角度，分析一下 RN 的运行机制：")]),e._v(" "),v("p",[v("img",{attrs:{src:"/blog/images/mobile/cross3.png",alt:"cross3"}})]),e._v(" "),v("ul",[v("li",[e._v("UI 线程：应用的主线程，主要负责原生渲染和调用原生能力，用于处理原生控件的绘制。")]),e._v(" "),v("li",[e._v("JS 线程：解释执行 JS 代码。在大多数情况下，"),v("code",[e._v("react native")]),e._v(" 使用的 js 引擎是 "),v("code",[e._v("JSC")]),e._v("(JavaScriptCore) ；在使用 chrome 调试时，所有的 js 代码都运行在 chrome 中，并且通过 "),v("code",[e._v("websocket")]),e._v(" 与原生代码通信。此时的运行环境是 "),v("code",[e._v("v8")]),e._v("。")]),e._v(" "),v("li",[e._v("Shadow 线程：主要用于构建 JS 与原生控件的布局镜像数据。渲染界面的重要步骤就是布局，布局需要知道每个组件应该渲染到什么位置，这个过程是通过 "),v("code",[e._v("yoga")]),e._v(" 去实现的，这是一个基于 "),v("code",[e._v("flexbox")]),e._v(" 的跨平台布局引擎。"),v("code",[e._v("shadow thread")]),e._v(" 会维护一个 "),v("code",[e._v("shadow tree")]),e._v(" 来计算我们的各个组件在 native 页面的实际布局，然后通过 "),v("code",[e._v("bridge")]),e._v(" 通知 "),v("code",[e._v("native thread")]),e._v(" 渲染 ui。")]),e._v(" "),v("li",[e._v("Native Modules 线程：提供原生能力，这里采用的是多线程模型，iOS 端通过 "),v("code",[e._v("GCD")]),e._v(" 实现，Android 端通过 "),v("code",[e._v("AsyncTask")]),e._v(" 实现。")])]),e._v(" "),v("h4",{attrs:{id:"初始化流程"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#初始化流程"}},[e._v("#")]),e._v(" 初始化流程")]),e._v(" "),v("ol",[v("li",[v("code",[e._v("native")]),e._v(" 启动一个原生界面，比如"),v("code",[e._v("android")]),e._v("会起一个新的"),v("code",[e._v("activity")]),e._v("来承载"),v("code",[e._v("rn")]),e._v("，并做一些初始化的操作。")]),e._v(" "),v("li",[e._v("加载 "),v("code",[e._v("js")]),e._v(" 引擎，运行 "),v("code",[e._v("js")]),e._v(" 代码，此时的流程和 "),v("code",[e._v("react")]),e._v(" 的启动流程就非常相似了，只不过我们在"),v("code",[e._v("js")]),e._v("层是无法拿到真实结点。")]),e._v(" "),v("li",[v("code",[e._v("js")]),e._v(" 线程通知"),v("code",[e._v("shadow thread")]),e._v("。在"),v("code",[e._v("react")]),e._v("中，走到"),v("code",[e._v("createInstance")]),e._v("以后我们就可以直接调用"),v("code",[e._v("createElement")]),e._v("来创建真实结点了，但是在"),v("code",[e._v("rn")]),e._v("中我们没办法做到这一步，所以我们会通知"),v("code",[e._v("native")]),e._v("层让它来帮助我们创建一个对应的真实结点。")]),e._v(" "),v("li",[v("code",[e._v("shadow thread")]),e._v(" 计算布局，通知"),v("code",[e._v("native Thread")]),e._v(" 创建原生组件。")]),e._v(" "),v("li",[v("code",[e._v("native")]),e._v(" 在界面上渲染原生组件，呈现给用户。")])]),e._v(" "),v("h4",{attrs:{id:"更新流程"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#更新流程"}},[e._v("#")]),e._v(" 更新流程")]),e._v(" "),v("p",[e._v("比如某个时候，用户点击了屏幕上的一个按钮触发了一个点击事件，此时界面需要进行相应的更新操作：")]),e._v(" "),v("ol",[v("li",[v("code",[e._v("native")]),e._v(" 获取到了点击事件，传给了"),v("code",[e._v("js thread")])]),e._v(" "),v("li",[v("code",[e._v("js thread")]),e._v("根据 "),v("code",[e._v("react")]),e._v(" 代码进行相应的处理，比如处理 "),v("code",[e._v("onClick")]),e._v(" 函数，触发了 "),v("code",[e._v("setState")]),e._v("。")]),e._v(" "),v("li",[e._v("和 "),v("code",[e._v("react")]),e._v(" 的更新流程一样，触发了 "),v("code",[e._v("setState")]),e._v(" 之后会进行 "),v("code",[e._v("diff")]),e._v("，找到需要更新的结点")]),e._v(" "),v("li",[e._v("通知 "),v("code",[e._v("shadow thread")])]),e._v(" "),v("li",[v("code",[e._v("shadow thread")]),e._v(" 计算布局之后通知 "),v("code",[e._v("native thread")]),e._v(" 进行真正的渲染。")])]),e._v(" "),v("p",[e._v("RN 应用在 UI 线程进行初始化，初始化的内容包括加载 JSBundle、初始化 Native Modules 等原生能力模块、创建 JSC/Hermes JavaScript 引擎，执行 JS 代码。创建的 JS 引擎独立在一个 JS 线程，解释执行 React 代码，并将生成的布局或逻辑信息序列化后经由 Bridge 发送给 Native。")]),e._v(" "),v("p",[e._v("React 代码中视图层的渲染通过 UIManager 调 createView/updateView 等方法，基于 Yoga 布局引擎创建对应的 shadowView；逻辑层中涉及原生能力调用的部分通过 RCTBridge 对象转发到相应的原生接口。Native 接收到 Bridge 层的消息，进行视图的更新或是功能处理。")]),e._v(" "),v("p",[e._v("原生渲染方案通过直接接管渲染层的方案，弥补了 Web 渲染方法在性能和体验上的不足，同时在顶层采用类 Web 的语法集，将开发技术边界延展至 Web 领域，同时可以很好的复用当前前端主流 UI 框架 React/Vue 的繁荣生态系统。")]),e._v(" "),v("h3",{attrs:{id:"rn-方案存在的问题"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#rn-方案存在的问题"}},[e._v("#")]),e._v(" RN 方案存在的问题")]),e._v(" "),v("p",[e._v("虽然原生渲染方案有上述的优势，但是有一个致命的弱点就是 Native 层和 JS 层的通信所带来的性能瓶颈。一方面页面的更新和事件的响应经由 Native 触达 JS 层，再由 JS 层返回给 Native 层需要来回的时间成本，整个通信是一个**「异步」"),v("strong",[e._v("的过程。这样做好处就是各自之间不会有阻塞关系，比如 不会"),v("code",[e._v("native thread")]),e._v("因为"),v("code",[e._v("js thread")]),e._v("而阻塞渲染，给用户良好的体验。但是这种")]),e._v("「异步」**也存在一个比较明显的问题：因为通信过程花费的时间比较长，所以在一些时效性要求较高场景上体验较差。另一方面数据的交互需要频繁进行序列化和反序列化的转换。因此，在一些 UI 线程和 JS 线程存在持续频繁交互的场景（动画、滚动）等，RN 表现就不尽如人意。")]),e._v(" "),v("p",[e._v("比如长列表快速滚动的时候或者需要做一些跟手的动画，整个过程是这样的：")]),e._v(" "),v("ol",[v("li",[v("code",[e._v("native thread")]),e._v("监听到了滚动事件，发送消息通知"),v("code",[e._v("js thread")])]),e._v(" "),v("li",[v("code",[e._v("js thread")]),e._v(" 处理滚动事件，如果需要修改 "),v("code",[e._v("state")]),e._v(" 需要经过一层"),v("code",[e._v("js diff")]),e._v("，拿到最终需要更新的结点")]),e._v(" "),v("li",[v("code",[e._v("js thread")]),e._v(" 通知 "),v("code",[e._v("shadow thread")])]),e._v(" "),v("li",[v("code",[e._v("shadow thread")]),e._v(" 通知 "),v("code",[e._v("native")]),e._v(" 渲染")])]),e._v(" "),v("p",[e._v("当用户操作过快的时候，就会导致界面来不及更新，进而导致在快速滑动的时候会出现白屏、卡顿的现象。")]),e._v(" "),v("h3",{attrs:{id:"从-rn-看本质"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#从-rn-看本质"}},[e._v("#")]),e._v(" 从 RN 看本质")]),e._v(" "),v("p",[e._v("知道了"),v("code",[e._v("rn")]),e._v("是如何实现的跨端，那么我们就可以来探究一下它本质上是在干什么。首先，跨端可以分为 "),v("strong",[e._v("逻辑跨端")]),e._v(" 和 "),v("strong",[e._v("渲染跨端")]),e._v("：")]),e._v(" "),v("ul",[v("li",[v("p",[v("strong",[e._v("逻辑跨端")]),e._v("：通常通过 "),v("code",[e._v("vm")]),e._v("来实现，例如利用 "),v("code",[e._v("v8")]),e._v(" 引擎，我们就能在各个平台上运行我们的 "),v("code",[e._v("js")]),e._v(" 代码，实现逻辑跨端。")])]),e._v(" "),v("li",[v("p",[v("strong",[e._v("渲染跨端")]),e._v("：把业务代码的实现抽象为开发层，比如 "),v("code",[e._v("react-native")]),e._v(" 中我们写的 "),v("code",[e._v("react")]),e._v(" 代码就属于开发层，再把具体要渲染的端称为渲染层。作为开发层来说，我一定知道我想要的"),v("code",[e._v("ui")]),e._v("长什么样，但是我没有能力去渲染到界面上，所以当我声明了一个组件之后，我们需要考虑的问题是如何把我想要什么告诉渲染层。最直观的方式肯定是我能够实现一种通信方式，在开发层将消息通知到各个系统，再由各个系统自己去调用对应的 "),v("code",[e._v("api")]),e._v(" 来实现最终的渲染。这一部分的工作就是跨端框架需要帮助我们做的，它可以把这一步放到 "),v("code",[e._v("JS")]),e._v(" 层，也可以把这一步放到"),v("code",[e._v("c++")]),e._v(" 层。我们应该把这部分工作尽量往底层放，也就是我们可以对各个平台的 "),v("code",[e._v("api")]),e._v(" 进行一层封装，上层只负责调用封装的 "),v("code",[e._v("api")]),e._v("，再由这一层封装层去调用真正的 "),v("code",[e._v("api")]),e._v("。")])])]),e._v(" "),v("p",[e._v("归根结底，所有跨端相关操作其实都在做："),v("strong",[e._v("我知道我想要什么，但是我没有能力去渲染，我要通知有能力渲染的人来帮助我渲染")])]),e._v(" "),v("p",[v("img",{attrs:{src:"/blog/images/mobile/cross4.png",alt:"cross4"}})]),e._v(" "),v("p",[e._v("比如"),v("code",[e._v("hybrid")]),e._v("跨端方案中，"),v("code",[e._v("webview")]),e._v("其实就充当了桥接层的角色，"),v("code",[e._v("createElement")]),e._v("，"),v("code",[e._v("appendChild")]),e._v("等"),v("code",[e._v("api")]),e._v("就是给我们封装好的跨平台"),v("code",[e._v("api")]),e._v("，底层最终调用到了什么地方，又是如何渲染到界面上的细节都被屏蔽掉了。所以我们利用这些"),v("code",[e._v("api")]),e._v("就能很轻松的实现跨端开发，写一个网页，只要能够加载 "),v("code",[e._v("webview")]),e._v(" 的地方，我们的代码就能跑在这个上面。")]),e._v(" "),v("p",[e._v("又比如"),v("code",[e._v("flutter")]),e._v("的方案通过研发一个自渲染的引擎来实现跨端，这种思路是不是相当于另外一个浏览器？但是不同的点在于 "),v("code",[e._v("flutter")]),e._v(" 是一个非常新的东西，而 "),v("code",[e._v("webview")]),e._v(" 需要遵循大量的 "),v("code",[e._v("w3c")]),e._v(" 规范和背负一堆历史包袱。"),v("code",[e._v("flutter")]),e._v(" 并没有什么历史包袱，所以它能够从架构，设计的方面去做的更好更快，能够做更多的事情。")]),e._v(" "),v("h2",{attrs:{id:"了解-fultter-自渲染引擎"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#了解-fultter-自渲染引擎"}},[e._v("#")]),e._v(" 了解 Fultter 自渲染引擎")]),e._v(" "),v("h3",{attrs:{id:"整体架构-2"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#整体架构-2"}},[e._v("#")]),e._v(" 整体架构")]),e._v(" "),v("p",[e._v("Flutter 的整体架构设计：")]),e._v(" "),v("p",[v("img",{attrs:{src:"/blog/images/mobile/cross5.png",alt:"cross5"}})]),e._v(" "),v("p",[e._v("Flutter 应用可以分为四层：")]),e._v(" "),v("ul",[v("li",[v("strong",[e._v("Dart App 层")]),e._v("：最顶层是 Dart App 层，以 Widget 为基本视图描述单元，构建起 UI 体系")]),e._v(" "),v("li",[v("strong",[e._v("Flutter Framework 层")]),e._v("：内置基础的 Flutter 组件，并根据不同平台的视觉风格体系，封装 Material 和 Cupertino 两套 UI 库供上层使用")]),e._v(" "),v("li",[v("strong",[e._v("Flutter Engine 层")]),e._v("：Flutter 框架的核心所在，包括 Dart 虚拟机、Skia 跨平台渲染引擎、文字排版、平台通道等，通过 Engine 层，建立起 Dart App 层和原生平台之间联系，从而实现二者的双向通信")]),e._v(" "),v("li",[v("strong",[e._v("Embedder 层")]),e._v("：平台嵌入层为 Flutter App 提供宿主环境、线程创建以及基于插件机制的原生能力扩展等 Flutter 在打包的时候，将 Dart 业务代码和 Flutter Engine 代码基于 iOS/Android 不同平台分别进行打包。Native 在启动时会通过调用 C++ 的各自实现（Java 通过 JNI，OC 天然支持）初始化 Flutter Engine 层提供的接口，创建 UI/GPU/IO 三个线程和实例化 Dart VM。Dart 业务代码在 Release 模式下采用 AOT 的方式进行编译，并运行在 Dart VM 中。")])]),e._v(" "),v("h3",{attrs:{id:"运行机制"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#运行机制"}},[e._v("#")]),e._v(" 运行机制")]),e._v(" "),v("p",[e._v("Flutter 运行机制如下：")]),e._v(" "),v("p",[v("img",{attrs:{src:"/blog/images/mobile/cross6.png",alt:"cross6"}})]),e._v(" "),v("ul",[v("li",[e._v("Platform 线程：Flutter 的主线程，由 Native 创建。负责平台 vsync 信号的回调注册，即当接收到从显示设备的 vsync 信号后，Platform 线程驱动 UI 线程的执行")]),e._v(" "),v("li",[e._v("UI 线程：负责响应 vsync 信号，执行 Dart 层代码，驱动渲染管线的运行，将 Widget Tree 生成 Layer Tree 并提交给 GPU 线程做进一步处理")]),e._v(" "),v("li",[e._v("GPU 线程：GPU 线程将 Layer Tree 转化为具体的绘制指令，并调用 skia 跨平台渲染引擎进行光栅化上屏")]),e._v(" "),v("li",[e._v("IO 线程：主要负责请求图片资源并完成解码，然后将解码的图片生成纹理并传递给 GPU 线程。显示器在一帧 vblank 后，会向 GPU 发送 vsync 信号，Native 的 Plaform 线程接收到 vsync 信号后，执行绘制帧回调方法，即驱动 UI 线程进行 UI 绘制。")])]),e._v(" "),v("p",[e._v("UI 线程中，Native 通过调用 C++ 的各自实现，将绘制指令通过 window 对象发送给 Dart 层，Dart 层会重构代表 UI 的数据树（Widget Tree，Element Tree 和 RenderObject Tree）并生成布局信息。根据布局信息生成一系列绘制指令的 Layer Tree，并通过 window 对象传递给 GPU 线程。")]),e._v(" "),v("p",[e._v("Dart 层通过三棵树去描述 UI 的视图结构。")]),e._v(" "),v("ul",[v("li",[e._v("Widget Tree 是直接面向开发者的 UI 元素的配置信息，Widget 是 Immutable 的，如果 Widget 的状态发生更新，会发生重建。实际业务场景中，Widget 会频繁触发重建。")]),e._v(" "),v("li",[e._v("Element Tree 是 Widget Tree 和 RenderObject Tree 的桥梁，当Widget 发生变化后，会将其 Element 标记为 Dirty Element，在下一次 vsync 信号到来时进行渲染。当 Widget 挂载到 Widget Tree 时，会调用 widget.createElement 方法，创建其对应的 Element，Flutter 再讲这个 Element 挂载到 Element Tree 并持有有创建它的 Widget 的引用")]),e._v(" "),v("li",[e._v("RenderObject Tree 是真正执行组件布局渲染的工作，通过 RenderObjectToWidgetAdapter 这个 RenderObjectWidget 建立起 Widget 、Element 和 RenderObject 三者之间的联系")])]),e._v(" "),v("p",[e._v("GPU 线程从 UI 线程获取 Layer Tree 构成的绘制指令，通过 Skia 这一跨平台渲染引擎进行光栅化，绘制成帧数据，将帧数据放在帧缓冲区，然后等待显示器上屏。综上来看，以 Flutter 为代表的的自建渲染引擎方案的优势在于：")]),e._v(" "),v("ul",[v("li",[e._v("UI 控件是直接采用 Skia 这一跨平台渲染引擎进行绘制。顶层使用 Dart 的语法进行 UI 的配置信息描述，并通过 Diff 算法优化渲染流程，生成 Layer Tree 后，再调用 C++ 的代码将布局信息发送给 Flutter Engine，Flutter Engine 直接通过 Skia 将 UI 控件绘制上屏。这里与原生渲染方案最大的不同点在于，Native 应用仅作为宿主环境，UI 控件不需要转化为原生控件，直接采用渲染引擎进行绘制，从而保证了双端的一致性和良好的性能与体验。")]),e._v(" "),v("li",[e._v("Dart 在 Release下采用 AOT 的 编译模式。Dart 代码在 Release 采用 AOT 的编译模式转化为二进制代码，从而在 Dart 运行时环境中执行效率更高，性能也更为卓越。对比 React Native 来说，由于打包的是 JSBundle，所以在运行时仍是基于 JavaScript 运行时进行解释执行 JS 代码，因而产生较大的性能瓶颈。")]),e._v(" "),v("li",[e._v("UI 层与原生层的数据交换性能更高")])]),e._v(" "),v("p",[v("a",{attrs:{href:"https://mp.weixin.qq.com/s/G_2eBJyrr6FHm7WjI_MIPw",target:"_blank",rel:"noopener noreferrer"}},[e._v("聊聊跨端技术的本质与现状"),v("OutboundLink")],1)]),e._v(" "),v("p",[v("a",{attrs:{href:"https://mp.weixin.qq.com/s/6UzhBRScBW67Ev95BK0ulg",target:"_blank",rel:"noopener noreferrer"}},[e._v("跨平台解决方案的技术分析"),v("OutboundLink")],1)]),e._v(" "),v("p",[v("a",{attrs:{href:"https://juejin.cn/post/6966626823912308772#heading-11",target:"_blank",rel:"noopener noreferrer"}},[e._v("跨平台方案、跨端引擎的本质"),v("OutboundLink")],1)]),e._v(" "),v("p",[v("a",{attrs:{href:"https://mp.weixin.qq.com/s/x07fhB1LT7L2Pq0yt34iqA",target:"_blank",rel:"noopener noreferrer"}},[e._v("新一代Web技术栈的演进：SSR/SSG/ISR/DPR都在做什么"),v("OutboundLink")],1)]),e._v(" "),v("p",[v("a",{attrs:{href:"https://mp.weixin.qq.com/s/8R9S4C5Av5-C09wC7Cjzgw",target:"_blank",rel:"noopener noreferrer"}},[e._v("React Native原理之跨端通信机制"),v("OutboundLink")],1)]),e._v(" "),v("p",[v("a",{attrs:{href:"https://mp.weixin.qq.com/s/QTHqQ-jaO7yPV-rQzAqglA",target:"_blank",rel:"noopener noreferrer"}},[e._v("React Native 原理与实践"),v("OutboundLink")],1)]),e._v(" "),v("p",[v("a",{attrs:{href:"https://mp.weixin.qq.com/s/7FpdGEN0KJPtG0yR0zH62A",target:"_blank",rel:"noopener noreferrer"}},[e._v("React-native源码解析"),v("OutboundLink")],1)]),e._v(" "),v("p",[v("a",{attrs:{href:"https://mp.weixin.qq.com/s/xxdgoEBIC3Bg4OCOZcm-aQ",target:"_blank",rel:"noopener noreferrer"}},[e._v("超详解析Flutter渲染引擎"),v("OutboundLink")],1)])])}),[],!1,null,null,null);v.default=r.exports}}]);