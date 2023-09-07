(window.webpackJsonp=window.webpackJsonp||[]).push([[33],{332:function(v,_,e){"use strict";e.r(_);var t=e(6),a=Object(t.a)({},(function(){var v=this,_=v._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[_("h1",{attrs:{id:"微前端架构"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#微前端架构"}},[v._v("#")]),v._v(" 微前端架构")]),v._v(" "),_("p",[v._v("微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。")]),v._v(" "),_("p",[v._v("微前端是一种类似于微服务的架构，是一种由独立交付的多个前端应用组成整体的架构风格，将前端应用分解成一些更小、更简单的能够独立开发、测试、部署的应用，而在用户看来仍然是内聚的单个产品。")]),v._v(" "),_("h2",{attrs:{id:"微前端价值"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#微前端价值"}},[v._v("#")]),v._v(" 微前端价值")]),v._v(" "),_("p",[v._v("为啥要选择微前端架构？微前端能解决什么问题？微前端对业务能产生什么价值？")]),v._v(" "),_("h3",{attrs:{id:"微前端工程价值"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#微前端工程价值"}},[v._v("#")]),v._v(" 微前端工程价值")]),v._v(" "),_("ul",[_("li",[_("strong",[v._v("技术栈无关，框架版本无关")]),v._v("。主框架不限制接入应用的技术栈和版本，微应用具备完全自主权。")]),v._v(" "),_("li",[_("strong",[v._v("独立开发、独立部署")]),v._v("。微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新。")]),v._v(" "),_("li",[_("strong",[v._v("渐进式迭代升级和迁移")]),v._v("。在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略。解决技术迁移成本。")]),v._v(" "),_("li",[_("strong",[v._v("大型单页应用无限扩展")]),v._v("。随着项目迭代应用越来越庞大，难以维护。基于微前端技术，大型单体应用可拆分并扩展。解决项目量级大、巨石应用难以扩展、维护、升级、构建、部署等问题。")]),v._v(" "),_("li",[_("strong",[v._v("多团队、多业务线协作")]),v._v("。基于微前端与技术栈无关、多应用可独立开发和部署，所以可多团队协作。解决跨团队或跨部门协作开发项目导致效率低下的问题。")]),v._v(" "),_("li",[_("strong",[v._v("多应用统一管理")]),v._v("。主应用统一注册子应用，统一管理各个子应用的路由。解决多系统独立无管控。")]),v._v(" "),_("li",[_("strong",[v._v("多应用独立运行时")]),v._v("。每个微应用之间状态隔离，运行时状态不共享。解决二方接入成本。")]),v._v(" "),_("li",[_("strong",[v._v("一致的开发体验")]),v._v("。 开发者在微前端下开发子应用，和平时开发其它 Web 应用没有太大区别，没有因为是微前端架构而做过多的特殊处理。解决升级成本问题。")])]),v._v(" "),_("p",[v._v("微前端并不是单单技术上的创新，它在团队协同、用户体验上都给我们带来非常大的提升，它借鉴了微服务的概念，在技术架构上它能够做到各个系统模块的拆分，既能让模块之间低耦合，又能让所有的模块聚合到同一个页面上运行。")]),v._v(" "),_("h3",{attrs:{id:"微前端业务价值"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#微前端业务价值"}},[v._v("#")]),v._v(" 微前端业务价值")]),v._v(" "),_("p",[v._v("主要的场景有两个：")]),v._v(" "),_("ul",[_("li",[_("p",[v._v("工作台的场景（portal 系统），基于产品体验的纬度")]),v._v(" "),_("ul",[_("li",[_("p",[v._v("一些公司内部会存在很多的系统平台，而日常运营流程中会涉及到跨系统的操作，那不同系统间会存在"),_("strong",[v._v("体验交互不一致")]),v._v("的问题、一些无谓的页面跳转也会导致的操作效率低下")])]),v._v(" "),_("li",[_("p",[v._v("在多独立系统不管是在 BFF 层 或一些中间网关处理层，还是前端的一些基础能力上，都会存在有很多的"),_("strong",[v._v("重复建设")]),v._v("。多个系统相互独立，大部分系统其实是无法管控到它具体的实现逻辑。从一个整体产品的的角度去思考，重复建设和不可管控的情况无疑是不可接受的。")])])])]),v._v(" "),_("li",[_("p",[v._v("大型单体应用，侧重于从技术维度进行优化")]),v._v(" "),_("ul",[_("li",[v._v("巨石应用，系统体量非常大。大体量构建，在日常调试开发的时候便会严重"),_("strong",[v._v("影响开发体验和效率")]),v._v("。")]),v._v(" "),_("li",[v._v("大型单体应用，当业务上需要进行功能迭代，或者说技术架构升级的时候，对一个巨石应用而言，它"),_("strong",[v._v("开发和协作的成本都很高")]),v._v("。因为体量大直接导致改动带来的影响面也非常的广。")]),v._v(" "),_("li",[v._v("如果存在一些二方的需求和功能，想直接复用这块能力的时候，基于目前的 SPA 的架构其实是很难做到，基本上是需要往现有系统上再去实现同样的代码逻辑。即，"),_("strong",[v._v("模块复用能力困难")]),v._v("。")])])])]),v._v(" "),_("p",[v._v("除此之外，涉及跨团队间的应用协作开发，需要渲染不可控的二三方内容，存在多个技术栈开发等都适用微前端。")]),v._v(" "),_("p",[v._v("微前端业务价值包括：")]),v._v(" "),_("ul",[_("li",[_("strong",[v._v("快速整合业务")]),v._v("：尤其对与运营场景，通过 SOP 的形式串联和编排业务，提升运营能力。解决操作效率低的问题。")]),v._v(" "),_("li",[_("strong",[v._v("产品原子化")]),v._v("：按功能模块扩展、组合、局部迭代，提高产品交付能力。")]),v._v(" "),_("li",[_("strong",[v._v("体验一致性")]),v._v("：解决跨系统操作体验交互不一致问题，开发体验方面还表现在低成本甚至零成本的迁移。解决体验不一致问题。")]),v._v(" "),_("li",[_("strong",[v._v("多系统统一管理")]),v._v("：统一管理账权、页面、路由、全局配置、统一渲染、统一监控等。解决多个系统相互独立，系统无法管控问题以及基础设施重复建设问题。")])]),v._v(" "),_("h3",{attrs:{id:"微前端缺点"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#微前端缺点"}},[v._v("#")]),v._v(" 微前端缺点")]),v._v(" "),_("ul",[_("li",[v._v("体验有折损")]),v._v(" "),_("li",[v._v("维护成本高")]),v._v(" "),_("li",[v._v("管理版本复杂、依赖复杂")]),v._v(" "),_("li",[v._v("模块功能拆分困难，粒度不宜太小")]),v._v(" "),_("li",[v._v("复杂度从代码转向基础设施")]),v._v(" "),_("li",[v._v("整个应用的稳定性和安全性变得更加不可控")]),v._v(" "),_("li",[v._v("具备一定的学习和了解成本")]),v._v(" "),_("li",[v._v("需要建立全面的微前端周边设施，才能充分发挥其架构的优势\n"),_("ul",[_("li",[v._v("调试工具")]),v._v(" "),_("li",[v._v("监控系统")]),v._v(" "),_("li",[v._v("上层 Web 框架")]),v._v(" "),_("li",[v._v("部署平台")])])])]),v._v(" "),_("h2",{attrs:{id:"技术选型"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#技术选型"}},[v._v("#")]),v._v(" 技术选型")]),v._v(" "),_("h3",{attrs:{id:"spa"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#spa"}},[v._v("#")]),v._v(" SPA")]),v._v(" "),_("p",[v._v("将平台内多个系统放置同一个代码仓库维护 ，采用 SPA（Single-page Application） 单页应用模式")]),v._v(" "),_("p",[v._v("优势：")]),v._v(" "),_("ul",[_("li",[v._v("统一的权限管控、统一的 Open API 开发能力")]),v._v(" "),_("li",[v._v("更好的代码复用，基础库复用")]),v._v(" "),_("li",[v._v("统一的运营管理能力")]),v._v(" "),_("li",[v._v("不同系统可以很好的通信")]),v._v(" "),_("li",[v._v("SPA 应用特有优势：\n"),_("ul",[_("li",[v._v("更好的性能")]),v._v(" "),_("li",[v._v("具备局部更新，无缝的用户体验")]),v._v(" "),_("li",[v._v("提前预加载用户下一页的内容")])])])]),v._v(" "),_("p",[v._v("劣势：")]),v._v(" "),_("ul",[_("li",[v._v("代码权限管控问题")]),v._v(" "),_("li",[v._v("项目构建时间长")]),v._v(" "),_("li",[v._v("需求发布相互阻塞")]),v._v(" "),_("li",[v._v("代码 commit 混乱、分支混乱")]),v._v(" "),_("li",[v._v("技术体系要求统一")]),v._v(" "),_("li",[v._v("无法同时灰度多条产品功能")]),v._v(" "),_("li",[v._v("代码回滚相互影响")]),v._v(" "),_("li",[v._v("错误监控无法细粒度拆分")])]),v._v(" "),_("p",[v._v("大体量单页应用，代码构建时间长、发布需求时被需求阻塞、无法局部灰度局部升级、项目遇到问题时回滚影响其他业务、无法快速引进新的技术体系提高生产力，项目的迭代和维护困难。")]),v._v(" "),_("p",[v._v("尽管降低了开发体验，如果对项目整体的代码拆分，懒加载控制得当，其实对于使用平台的用户而言体验却是提升的，这一切都归因于 SPA 应用带来的优势，SPA 应用跳转页面时无需刷新整个页面，路由变化时仅更新局部，不用让用户产生在 MPA 应用切换时整个页面刷新带来的抖动感而降低体验，并且由于页面不刷新的特性可以极大程度的复用页面间的资源，降低切换页面时带来的性能损耗，用户也不会感知他在使用不同平台。")]),v._v(" "),_("h3",{attrs:{id:"mpa"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#mpa"}},[v._v("#")]),v._v(" MPA")]),v._v(" "),_("p",[v._v("将系统分为多个仓库维护，在首页聚合所有平台的入口，采用 MPA（Multi-page Application）多页应用模式")]),v._v(" "),_("p",[v._v("优势")]),v._v(" "),_("ul",[_("li",[v._v("可以以项目维度拆分代码，解决权限管控问题")]),v._v(" "),_("li",[v._v("仅构建本项目代码，构建速度快")]),v._v(" "),_("li",[v._v("可以使用不同的技术体系")]),v._v(" "),_("li",[v._v("不存在同一个仓库维护时的 commit 混乱和分支混乱等问题")]),v._v(" "),_("li",[v._v("功能灰度互不影响")])]),v._v(" "),_("p",[v._v("劣势")]),v._v(" "),_("ul",[_("li",[v._v("用户在使用时体验割裂，会在不同平台间跳转，无法达到 SPA 应用带来的用户体验")]),v._v(" "),_("li",[v._v("只能以页面维度拆分，无法拆分至区块部分，只能以业务为维度划分")]),v._v(" "),_("li",[v._v("多系统同灰度策略困难")]),v._v(" "),_("li",[v._v("公共包基础库重复加载")]),v._v(" "),_("li",[v._v("不同系统间不可以直接通信")]),v._v(" "),_("li",[v._v("公共部分只能每个系统独立实现，同一运维通知困难")]),v._v(" "),_("li",[v._v("产品权限无法进行统一收敛")])]),v._v(" "),_("p",[v._v("一定程度上提升了开发体验，但却降低了用户体验，研发在日常开发工作中需要使用大量的平台，但是却需要跳转到不同的平台上进行日常的研发工作，整体使用体验较差。体验较差的原因在于将由于通过项目维度拆分了整体。使各个产品之间是独立的孤岛，系统间相互跳转都是传统意义上的 MPA，跳转需要重新加载整个页面的资源，除了性能是远不如 SPA 应用的并且应用间是没法直接通信，这就进一步增强了用户在使用产品时的割裂感。")]),v._v(" "),_("h3",{attrs:{id:"iframe"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#iframe"}},[v._v("#")]),v._v(" iframe")]),v._v(" "),_("p",[v._v("iframe 在微前端方案流行前，它其实是一个比较好的解决方案。不管是一些二方或是三方的接入，它都能够很好地满足需求。iframe 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。")]),v._v(" "),_("p",[v._v("但他的最大问题也在于他的隔离性无法被突破，导致应用间上下文无法被共享，随之带来的开发体验、产品体验的问题。")]),v._v(" "),_("p",[v._v("缺点：")]),v._v(" "),_("ul",[_("li",[_("p",[_("strong",[v._v("路由不同步")]),v._v("。刷新一下， "),_("code",[v._v("iframe url")]),v._v(" 状态丢失、后退前进按钮无法使用。")])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("DOM 割裂严重")]),v._v("。如果 iframe 里来一个带遮罩层的弹框，同时我们要求这个弹框要浏览器居中显示，那么需要浏览器 resize 时自动居中。内部弹框不能够覆盖全局、滚动条问题。")])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("通信困难")]),v._v("。iframe 内外系统的通信、数据同步等需求实现困难，只能通过 postmessage 传递序列化的消息。")])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("资源加载慢，白屏时间太长")]),v._v("。每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程。")])]),v._v(" "),_("li",[_("p",[v._v("使用 Iframe 会大幅增加内存和计算资源，因为 iframe 内所承载的页面需要一个全新并且完整的文档环境")])]),v._v(" "),_("li",[_("p",[v._v("Iframe 与上层应用并非同一个文档上下文导致")]),v._v(" "),_("ul",[_("li",[v._v("事件冒泡不穿透到主文档树上，焦点在子应用时，事件无法传递上一个文档流\n"),_("ul",[_("li",[v._v("主应用劫持快捷键操作")]),v._v(" "),_("li",[v._v("事件无法冒泡顶层，针对整个应用统一处理时效")])])]),v._v(" "),_("li",[v._v("跳转路径无法与上层文档同步，刷新丢失路由状态")]),v._v(" "),_("li",[v._v("Iframe 内元素会被限制在文档树中，视窗宽高限制问题")]),v._v(" "),_("li",[v._v("Iframe 登录态无法共享，子应用需要重新登录")]),v._v(" "),_("li",[v._v("Iframe 在禁用三方 cookie 时，iframe 平台服务不可用")]),v._v(" "),_("li",[v._v("Iframe 应用加载失败，内容发生错误主应用无法感知")]),v._v(" "),_("li",[v._v("难以计算出 iframe 作为页面一部分时的性能情况")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("无法预加载缓存 iframe 内容")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("无法共享基础库进一步减少包体积")])])])]),v._v(" "),_("h3",{attrs:{id:"框架组件-npm-包"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#框架组件-npm-包"}},[v._v("#")]),v._v(" 框架组件 - npm 包")]),v._v(" "),_("p",[v._v("框架组件的方案，通常在一些通用的头部或吊顶逻辑共用的场景下。常用的逻辑封装成一个组件，其实就是以 npm 包的形式去引入进来。")]),v._v(" "),_("p",[v._v("把各个拆分的项目引用公共头、尾和导航组件看似一个较好的解决方案，但是当公共组件一旦升级，往往各个拆分项目都要重新升级并上线，即，未解决渐进升级问题，开发体验和升级成本大打折扣，同时它也会因为各个项目不及时更新而导致项目之间跳转后体验不一致的现象。-")]),v._v(" "),_("p",[v._v("npm 包这种静态的共享方式，丧失了动态下发代码的能力，导致了其过慢的工程响应速度，这在现在云服务流行的时代就会显得格外扎眼。而微前端这种纯动态的服务依赖方式，恰好能方便的解决上面的问题：被依赖的微应用更新后的产物，在产品刷新后即可动态的获取到，如果我们在微应用加载器中再辅以灰度逻辑，那么动态更新带来的变更风险也能得到有效的控制。")]),v._v(" "),_("h2",{attrs:{id:"微前端设计"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#微前端设计"}},[v._v("#")]),v._v(" 微前端设计")]),v._v(" "),_("p",[v._v("尽管难以将 Iframe 作为微前端应用的加载器，但是却可以参考其设计思想，一个传统的 Iframe 加载文档的能力可以分为四层：文档的加载能力、HTML 的渲染、执行 JavaScript、隔离样式和 JavaScript 运行环境。那么微前端库的基础能力也可以参考其设计思想。")]),v._v(" "),_("p",[v._v("基于 SPA 的微前端架构，从设计层面采取的是基座+子应用分治的概念，部署平台负责进行服务发现和服务注册，将注册的应用列表信息下发至基座，通过基座来动态控制子系统的渲染和销毁，并提供集中式的模式来完成应用间的通信和应用的公共依赖管理")]),v._v(" "),_("ul",[_("li",[v._v("**主应用：**定义路由加载规则 + 配置子应用资源")]),v._v(" "),_("li",[v._v("**子应用：**定义应用加载的生命周期")])]),v._v(" "),_("p",[v._v("基于上述职责的区分意味着一个微前端框架需要考虑以下几个方面的设计：")]),v._v(" "),_("ol",[_("li",[_("p",[_("strong",[v._v("应用加载（Loader）")]),v._v("：在应用被激活之后，我们需要考虑加载应用面对不同标准的应用时，框架需要采取的加载策略也不同。比如常规的 JS bundle 和 UMD 规范的资源，我们可以借助 Fetch 或者 Script 标签能力直接进行加载，但对于 ESM 标准的应用，则直接采用 Dynamic Import 即可。")]),v._v(" "),_("ul",[_("li",[v._v("负责注册平台侧提供的应用列表")]),v._v(" "),_("li",[v._v("负责加载和解析子应用入口资源\n"),_("ul",[_("li",[v._v("HTML 入口类型，拆解 HTML Dom、Script、Style")]),v._v(" "),_("li",[v._v("JS 入口类型，提供基础 Dom 容器")])])]),v._v(" "),_("li",[v._v("预加载能力")]),v._v(" "),_("li",[v._v("解析子应用导出内容")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("应用调度（Lifecycle）")]),v._v("：完成路由接触之后，框架还需要设计应用的调度，包括激活应用和卸载应用，即，应用的生命周期。")]),v._v(" "),_("ul",[_("li",[v._v("bootstrap 初始化")]),v._v(" "),_("li",[v._v("mount 激活渲染")]),v._v(" "),_("li",[v._v("unmout 卸载")]),v._v(" "),_("li",[v._v("自定义")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("沙箱隔离（Sandbox）")])]),v._v(" "),_("ul",[_("li",[v._v("提供代码执行能力，收集执行代码时存在的副作用")]),v._v(" "),_("li",[v._v("提供销毁收集副作用的能力")]),v._v(" "),_("li",[v._v("支持沙箱多实例，收集不同实例的副作用")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("路由系统（Router）")])]),v._v(" "),_("ul",[_("li",[v._v("核心解决不同应用间的路由不同步问题、不同应用对于路由的响应。")]),v._v(" "),_("li",[v._v("提供路由劫持能力，在主应用上管控子应用路由，掌握子应用加载时机，而触发劫持的路由事件可以让子应用响应路由变化")]),v._v(" "),_("li",[v._v("提供路由驱动能力来拼装完整的平台的能力")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("应用通信（Store）")])]),v._v(" "),_("ul",[_("li",[v._v("建立通信桥梁")]),v._v(" "),_("li",[v._v("提供共享机制")])])])]),v._v(" "),_("h3",{attrs:{id:"应用加载设计"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#应用加载设计"}},[v._v("#")]),v._v(" 应用加载设计")]),v._v(" "),_("p",[v._v("加载器的整体设计应具备以下能力：")]),v._v(" "),_("ul",[_("li",[v._v("异步加载组件资源")]),v._v(" "),_("li",[v._v("可以预加载资源")]),v._v(" "),_("li",[v._v("可以缓存组件资源")]),v._v(" "),_("li",[v._v("缓存组件实例")])]),v._v(" "),_("p",[v._v("与组件不同的是微前端作为一种能够将单体应用拆解成多个子应用的架构模式，不同于组件，这些被拆分出去的子应用最好的研发模式是在开发、测试、部署都与宿主环境分离，子应用本身应具备自治能力。")]),v._v(" "),_("p",[v._v("那么此时就与 Iframe 提供的能力非常类似，Iframe 通过加载 HTML 文档的形式加载整个子应用的资源，那么子应用本身就可作为一个独立站点，天然具备独立开发、测试的能力。")]),v._v(" "),_("p",[v._v("因此加载器提供了一般提供两种应用入口类型：HTML 类型和 JS 入口类型，但需要注意的是 并非像 Iframe 一样将其分为了另一个文档流，而是将其与主应用作为同一个文档流处理，用以规避其不再同一个文档流带来的体验感割裂问题。")]),v._v(" "),_("p",[v._v("由于 HTML 入口类型天然具备独立、开发、测试的特性，在微前端整体架构设计中，对于跨团队协作而言，最好的研发模式是能降低其沟通成本，而降低沟通成本的最好方式是不沟通，所以一般项目类型都尽可能的推荐用户使用 HTML 的入口类型。")]),v._v(" "),_("h3",{attrs:{id:"应用调度设计"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#应用调度设计"}},[v._v("#")]),v._v(" 应用调度设计")]),v._v(" "),_("p",[v._v("整个微前端子应用的生命周期基本可以总结为：")]),v._v(" "),_("ul",[_("li",[v._v("渲染阶段\n"),_("ul",[_("li",[v._v("主应用通过路由驱动或手动挂载的方式触发子应用渲染")]),v._v(" "),_("li",[v._v("开始加载应用的资源内容，并初始化子应用的沙箱运行时环境")]),v._v(" "),_("li",[v._v("判断入口类型\n"),_("ul",[_("li",[v._v("若入口类型为 HTML 类型，将开始解析和拆解子应用资源")]),v._v(" "),_("li",[v._v("若入口类型为 JS，创建子应用的挂点 DOM")])])]),v._v(" "),_("li",[v._v("将子应用存在”副作用“（对当前页面可能产生影响的内容）交由沙箱处理")]),v._v(" "),_("li",[v._v("开始渲染子应用的 DOM 树")]),v._v(" "),_("li",[v._v("触发子应用的渲染 Hook")])])]),v._v(" "),_("li",[v._v("销毁阶段\n"),_("ul",[_("li",[v._v("若路由变化离开子应用的激活范围或主动触发销毁函数，触发应用的销毁")]),v._v(" "),_("li",[v._v("清除应用在渲染时和运行时产生的副作用")]),v._v(" "),_("li",[v._v("移除子应用的 DOM 元素")])])])]),v._v(" "),_("h3",{attrs:{id:"沙箱隔离设计"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#沙箱隔离设计"}},[v._v("#")]),v._v(" 沙箱隔离设计")]),v._v(" "),_("p",[v._v("在过去的 Web 应用中是很少提及到沙箱这一概念的，因为组件的开发一般都会由研发通过研发规范来尽可能的去避免组件对当前应用环境造成副作用，诸如：组件渲染后添加了定时器、全局变量、滚动事件、全局样式并且在组件销毁后会及时的清除子应用对当前环境产生的副作用。")]),v._v(" "),_("p",[v._v("与组件完全不同的是微前端是由多个独立运行的应用组成的架构风格，这些系统可能分别来自不同的技术体系。项目的开发、测试从空间和时间上都是分离的，由于没有 Iframe 一样原生能力的隔离很难应用间不发生冲突，这些冲突可能会导致应用发生异常、报错、甚至不可用等状态。")]),v._v(" "),_("p",[v._v("为了保证应用能够稳定的运行且互不影响，需要提供安全的运行环境，能够有效地隔离、收集、清除应用在运行期间所产生的副作用，那应用运行期间主要会产生哪些副作用呢，可以将其分为以下几类：全局变量、全局事件、定时器、网络请求、localStorage、Style 样式、DOM 元素。")]),v._v(" "),_("p",[v._v("针对子应用可能产生的副作用类型主要分为两类，一类是：静态副作用、另一类则是：动态副作用。")]),v._v(" "),_("ul",[_("li",[v._v("静态副作用指的是 HTML 中静态标签内容例如：Script 标签、Style 标签、Link 标签，这些内容属于在 HTML 文档流中就包含的。")]),v._v(" "),_("li",[v._v("动态副作用指的是由 JavaScript 动态创建出来的，例如 JavaScript 可以动态创建 Style、动态创建 Script、动态创建 Link、动态执行代码、动态添加 DOM 元素、添加全局变量、添加定时器、网络请求、localStorage 等对当前页面产生副作用的内容。")])]),v._v(" "),_("p",[v._v("如何有效收集、隔离、清除应用的副作用是保障应用能够平稳运行的核心能力之一。沙箱的主要能力也在于能够捕获动态创建的副作用，对应用的副作用进行隔离和清除。")]),v._v(" "),_("p",[v._v("那么如何能够有效的捕获到动态创建的副作用、收集、并隔离呢？一种是快照模式，另外一种是 VM 模式。")]),v._v(" "),_("h4",{attrs:{id:"快照沙箱"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#快照沙箱"}},[v._v("#")]),v._v(" 快照沙箱")]),v._v(" "),_("p",[v._v("在应用运行前通过快照的模式来保存当前执行环境，在应用销毁后恢复回应用之前的执行环境，用于实现应用间副作用的隔离和清除。")]),v._v(" "),_("p",[v._v("核心设计思想简述：")]),v._v(" "),_("ol",[_("li",[v._v("针对每一种副作用提供一个 Patch 类，这个类需要提供 save 和 load 两个方法")]),v._v(" "),_("li",[v._v("Save 对应着该副作用的环境快照存储，Load 对应着销毁该副作用的销毁恢复环境")]),v._v(" "),_("li",[v._v("并且针对每一种 Patch 还可以存储其在运行期间发生的变化，在优化场景时并不用所有代码，仅恢复执行环境即可")])]),v._v(" "),_("h4",{attrs:{id:"vm-沙箱"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#vm-沙箱"}},[v._v("#")]),v._v(" VM 沙箱")]),v._v(" "),_("p",[v._v("通过快照沙箱的最简化的核心实现后可以发现，它的设计理念依赖于整个代码的执行，即：存储执行环境 => 执行具备副作用的代码 => 恢复执行环境。但在实际的场景中对于应用的划分并以页面为维度划分，同一个页面可能存在多个应用，所以它的执行顺序并非线性，可能同时存在多个快照沙箱的实例环境，也就是快照沙箱多实例。")]),v._v(" "),_("p",[v._v("Node 中也提供了 "),_("a",{attrs:{href:"https://link.juejin.cn?target=https%3A%2F%2Fnodejs.org%2Fapi%2Fvm.html",target:"_blank",rel:"noopener noreferrer"}},[v._v("VM 模块"),_("OutboundLink")],1),v._v("，不过不过不同于传统的 VM，它并不具备虚拟机那么强的隔离性，并没有从模拟完整的硬件系统，仅仅将指定代码放置了特定的上下文中编译并执行代码，所以它无法用于不可信来源的代码。")]),v._v(" "),_("p",[v._v("参考 Node 中"),_("a",{attrs:{href:"https://link.juejin.cn?target=https%3A%2F%2Fnodejs.org%2Fapi%2Fvm.html",target:"_blank",rel:"noopener noreferrer"}},[v._v("VM 模块"),_("OutboundLink")],1),v._v("的设计，以及 "),_("a",{attrs:{href:"https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fgetify%2FYou-Dont-Know-JS%2Fblob%2F2nd-ed%2Fscope-closures%2Fch2.md",target:"_blank",rel:"noopener noreferrer"}},[v._v("JavaScript 词法作用域"),_("OutboundLink")],1),v._v(" 的特性，可以设计出 VM 沙箱，不过与传统的 VM 差异也同样存在，它并能执行不可信的代码，因为它的隔离能力仅限于将其运行在一个指定的上下文环境中。")]),v._v(" "),_("p",[v._v("隔离环境需要哪些上下文？")]),v._v(" "),_("p",[v._v("针对副作用的类型：全局变量、全局事件、定时器、网络请求、localStorage、Style 样式、DOM 元素，分别提供了全新的执行上下文：")]),v._v(" "),_("ul",[_("li",[v._v("Window\n"),_("ul",[_("li",[v._v("用于隔离全局环境")])])]),v._v(" "),_("li",[v._v("document\n"),_("ul",[_("li",[v._v("用于捕获动态创建的 DOM 节点、Style、Script\n"),_("ul",[_("li",[v._v("收集 DOM 副作用")]),v._v(" "),_("li",[v._v("收集 Style 副作用，进行处理")]),v._v(" "),_("li",[v._v("收集 Script，继续放置沙箱处理")])])])])]),v._v(" "),_("li",[v._v("timeout、interval\n"),_("ul",[_("li",[v._v("处理定时器")])])]),v._v(" "),_("li",[v._v("localstorage\n"),_("ul",[_("li",[v._v("隔离 localStorage")])])]),v._v(" "),_("li",[v._v("listener\n"),_("ul",[_("li",[v._v("收集全局事件")])])])]),v._v(" "),_("p",[v._v("新的执行上下文有两个来源，")]),v._v(" "),_("ul",[_("li",[v._v("来源于当前环境")]),v._v(" "),_("li",[v._v("来源于 Iframe 的执行环境")])]),v._v(" "),_("p",[v._v("由于 Iframe 创建后需要需要较多的内存资源和计算资源，而微前端中的 VM 沙箱并不需要一个完全的执行上下文，所以可以基于当前环境。")]),v._v(" "),_("h4",{attrs:{id:"css-样式隔离方案"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#css-样式隔离方案"}},[v._v("#")]),v._v(" css 样式隔离方案")]),v._v(" "),_("p",[v._v("样式隔离，通常有以下几个方案：")]),v._v(" "),_("ul",[_("li",[_("p",[v._v("CSS Module")]),v._v(" "),_("p",[v._v("CSS Modules 指的是我们像 import js 一样去引入我们的 css 代码，代码中的每一个类名都是引入对象的一个属性, 编译时会将 css 类名 加上唯一 hash。CSS Modules 作用域：")]),v._v(" "),_("ul",[_("li",[v._v("作用域默认为 local 即只在当前模块生效")]),v._v(" "),_("li",[v._v("global 被 :global 包裹起来的类名，不会被模块化")])])]),v._v(" "),_("li",[_("p",[v._v("样式约定 + 工程化")]),v._v(" "),_("p",[v._v("这种方案非常简单可靠，各个子应用都约定自己的特有前缀（自定义基础组件 prefix），然后通过前端工程化工具 Webpack，在编译期对整体项目的样式做统一前缀处理。不过也会有一些问题，比如：嵌套应用组件样式优先级的问题。")])]),v._v(" "),_("li",[_("p",[v._v("Shadow DOM")]),v._v(" "),_("p",[v._v("完全彻底的解决了样式隔离，它通过游离在 DOM 树之外的 Shadow DOM，完全将 DOM 和 CSS 隔离开来。于浏览器兼容性问题，它是否可靠还有待进一步验证。")])]),v._v(" "),_("li",[_("p",[v._v("Runtime css transformer 动态加载/卸载样式表")]),v._v(" "),_("p",[v._v("过 js 运行时动态加载卸载微应用样式表来避免样式的冲突。这种方案虽然可行，但也有几个局限性")]),v._v(" "),_("ul",[_("li",[v._v("站点框架本身或其部件（header/menu/footer）与当前运行的微应用间仍存在样式冲突的可能性")]),v._v(" "),_("li",[v._v("没有办法支持多个微应用同时运行显示的情况")]),v._v(" "),_("li",[v._v("运行时动态的增加、修改、删除样式，会在性能上有一定的消耗")])])]),v._v(" "),_("li",[_("p",[v._v("CSS in JS")]),v._v(" "),_("p",[v._v("在 js 中写 css 变成了内联样式")])]),v._v(" "),_("li",[_("p",[v._v("给所有的样式规则增加一个特殊的选择器规则来限定其影响范围。与CSS Module、vue style 中的 scope 一样的原理，生成唯一的标识限定作用域。")])])]),v._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[v._v("样式隔离")]),v._v(" "),_("p",[v._v("在最新的 qiankun 版本中，你也可以尝试通过配置 "),_("code",[v._v("{ scope: { experimentalStyleIsolation: true } }")]),v._v(" 的方式开启"),_("strong",[v._v("运行时的 scoped css 功能")]),v._v("，从而解决应用间的样式隔离问题。")]),v._v(" "),_("p",[_("a",{attrs:{href:"https://juejin.cn/post/6867345501860151309",target:"_blank",rel:"noopener noreferrer"}},[v._v("css 模块化 & 样式隔离"),_("OutboundLink")],1)])]),v._v(" "),_("h4",{attrs:{id:"shadow-dom"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#shadow-dom"}},[v._v("#")]),v._v(" Shadow DOM")]),v._v(" "),_("p",[v._v("Web components 的一个重要属性是封装——可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁。其中，Shadow DOM 接口是关键所在，它可以将一个隐藏的、独立的 DOM 附加到一个元素上。")]),v._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/talk/shadow-dom.png",alt:"Shadow DOM"}})]),v._v(" "),_("p",[v._v("你可以使用同样的方式来操作 Shadow DOM，就和操作常规 DOM 一样——例如添加子节点、设置属性，以及为节点添加自己的样式（例如通过 "),_("code",[v._v("element.style")]),v._v(" 属性），或者为整个 Shadow DOM 添加样式（例如在 "),_("code",[v._v("<style>")]),v._v(" 元素内添加样式）。不同的是，Shadow DOM 内部的元素始终不会影响到它外部的元素（除了 "),_("code",[v._v(":focus-within")]),v._v("），这为封装提供了便利。")]),v._v(" "),_("p",[_("code",[v._v("<video>")]),v._v(" 元素为例。你所能看到的只是一个 "),_("code",[v._v("<video>")]),v._v(" 标签，实际上，在它的 Shadow DOM 中，包含来一系列的按钮和其他控制器。Shadow DOM 标准允许你为你自己的元素（custom element）维护一组 Shadow DOM。")]),v._v(" "),_("p",[v._v("可以使用 "),_("code",[v._v("Element.attachShadow()")]),v._v(" 方法来将一个 shadow root 附加到任何一个元素上。")]),v._v(" "),_("p",[v._v("具体操作见 "),_("a",{attrs:{href:"https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM",target:"_blank",rel:"noopener noreferrer"}},[v._v("Shadow DOM"),_("OutboundLink")],1)]),v._v(" "),_("h3",{attrs:{id:"路由系统设计"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#路由系统设计"}},[v._v("#")]),v._v(" 路由系统设计")]),v._v(" "),_("p",[v._v("假设存在一个 Garfish 站点，这个站点它是由主应用+三个子应用构成，主应用的 basename 为 "),_("code",[v._v("/demo")]),v._v("，并存在三个 Tab 分别指向跳转至不同的应用，理想的路由效果：")]),v._v(" "),_("ol",[_("li",[v._v("在点击 vue-app Tab，跳转至 "),_("code",[v._v("/demo/vue-app")]),v._v(" 路由后，分别激活 "),_("code",[v._v("vue-app")]),v._v(" 下，为 Vue 类型的 A 应用和 B 应用，并激活 A 应用和 B 应用中的 Home 组件")]),v._v(" "),_("li",[v._v("点击 React-app Tab 进入到 "),_("code",[v._v("/demo/react-app")]),v._v(" 路由后，分别激活 "),_("code",[v._v("react-app")]),v._v(" 下，为 React 类型的 C 应用，并激活 C 应用的 Home 组件")]),v._v(" "),_("li",[v._v("在激活 C 应用的基础上，点击 Detail 按钮，跳转至 "),_("code",[v._v("/demo/react-app/detail")]),v._v("，并激活 C 应用的 detail 组件。")]),v._v(" "),_("li",[v._v("点击浏览器返回按钮展示，跳转 "),_("code",[v._v("/demo/react-app/detail")]),v._v("，并激活 C 应用的 Home 组件，至此完成浏览器的基本路由跳转能力。")])]),v._v(" "),_("h2",{attrs:{id:"微前端运行过程"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#微前端运行过程"}},[v._v("#")]),v._v(" 微前端运行过程")]),v._v(" "),_("ul",[_("li",[v._v("浏览器访问主应用：此时主应用会被下载到浏览器，并且开始运行主应用；")]),v._v(" "),_("li",[v._v("主应用注册子应用：设置子应用相关配置：子应用名称、子应用入口、子应用加载到哪个 DOM、子应用激活路径等等；")]),v._v(" "),_("li",[v._v("启动主应用；")]),v._v(" "),_("li",[v._v("加载子应用：浏览器会根据子应用入口下载子应用 HTML 模版；")]),v._v(" "),_("li",[v._v("解析子应用：框架开始解析子应用 HTML 模版，DOM、JavaScript 资源和 CSS 资源；")]),v._v(" "),_("li",[v._v("加载子应用资源：浏览器开始下载子应用 JavaScript 和 CSS 资源；")]),v._v(" "),_("li",[v._v("创建沙箱环境：为了将多个应用隔离开来，互不干扰，主应用为子应用创建沙箱环境；")]),v._v(" "),_("li",[v._v("挂载子应用：子应用开始运行；")]),v._v(" "),_("li",[v._v("预加载其它子应用资源： 由于微前端采用了预加载技术，在网络空闲的时候会加载其它的子应用资源，这样当其它子应用在唤起时资源- 已经准备好，立马可以运行起来~~")])]),v._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/talk/%E5%BE%AE%E5%89%8D%E7%AB%AF%E8%BF%90%E8%A1%8C%E5%8A%A0%E8%BD%BD%E5%8E%9F%E7%90%86.png",alt:"微前端运行加载原理"}})]),v._v(" "),_("p",[v._v("Preload 技术在微前端项目中优势尤为明显，微前端有很多子应用，它在网络空闲时间为微前端预先加载好子应用的静态资源，再加上 HTTP2.0 的多路复用加持，并行下载能力大大加强。当用户要使用到某个子应用时，资源已经准保好，不用下载，性能得到极大提升。")]),v._v(" "),_("h2",{attrs:{id:"微前端方案"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#微前端方案"}},[v._v("#")]),v._v(" 微前端方案")]),v._v(" "),_("p",[_("a",{attrs:{href:"https://mp.weixin.qq.com/s/gVDmKQriJY8jAWUWRpqirw",target:"_blank",rel:"noopener noreferrer"}},[v._v("关于微前端架构的几种技术选型，看这篇就够了"),_("OutboundLink")],1)]),v._v(" "),_("h3",{attrs:{id:"qiankun-方案"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#qiankun-方案"}},[v._v("#")]),v._v(" qiankun 方案")]),v._v(" "),_("p",[v._v("qiankun 方案是基于 single-spa 的微前端方案。")]),v._v(" "),_("h4",{attrs:{id:"与路由绑定的方式渲染微应用"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#与路由绑定的方式渲染微应用"}},[v._v("#")]),v._v(" 与路由绑定的方式渲染微应用")]),v._v(" "),_("p",[v._v("以路由(url)为维度来划分微应用，基于 qiankun 的 "),_("code",[v._v("registerMicroApps")]),v._v(" API，提供 entry html 地址，并为其分配一个路由规则即可。路由与应用绑定的方式简单直观，是微前端中最为常见的使用场景，通常我们会用这种方式"),_("strong",[v._v("将一堆独立域名访问的 MPA 应用，整合成一个一体化的 SPA 应用")]),v._v("。")]),v._v(" "),_("p",[v._v("局限性：")]),v._v(" "),_("ul",[_("li",[v._v("由于 "),_("strong",[v._v("URL/路由")]),v._v(" 的 "),_("strong",[v._v("唯一性/排他性")]),v._v(" 的特点，这种方式只适用单实例场景需求")]),v._v(" "),_("li",[v._v("微应用的调度都是由路由系统来自动处理的，虽然省事但是碰到更复杂的需求，如同一个路由下，根据不同的用户权限展示不同的微应用这类个性化诉求，需要写一些中间层代码来曲线救国")]),v._v(" "),_("li",[v._v("应用挂载的容器节点等需提前准备好，不然碰到 "),_("strong",[v._v("动态/嵌套")]),v._v(" 路由这类情况，可能会因为路由 listener 监听触发的时序不确定，导致微应用无法完成挂载的问题")])]),v._v(" "),_("h4",{attrs:{id:"以组件的方式使用微应用"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#以组件的方式使用微应用"}},[v._v("#")]),v._v(" 以组件的方式使用微应用")]),v._v(" "),_("p",[v._v("qiankun 2.0 的发布带来一个全新的 API "),_("code",[v._v("loadMicroApp")]),v._v("，通过这个 API 我们可以自己去控制一个微应用加载/卸载。开发者可以在脱离路由的限制下，以更自由的方式去渲染我们的微应用。基于 "),_("code",[v._v("loadMicroApp")]),v._v(" API，我们只需要做一些简单的封装，即可以类似组件的开发体验，完成微应用的接入。这类方式适用于一些可共用的、带业务逻辑的服务型组件。通过组件的这种方式，我们可以完全自主的控制微应用的渲染，并与之做一些复杂的交互。不论是在开发者的编码心智，还是用户的体验上，都跟使用一个普通的业务组件无异。")]),v._v(" "),_("p",[v._v("局限性：")]),v._v(" "),_("p",[v._v("组件的方式非常灵活，几乎解决了所有路由绑定方式渲染微应用的问题，但也有自己的一些局限：需要确保被加载的微应用是不含自己的路由系统，否则会出现多个应用间路由系统互相 "),_("code",[v._v("抢占/冲突")]),v._v(" 的情况。")]),v._v(" "),_("p",[_("strong",[v._v("特点")])]),v._v(" "),_("ul",[_("li",[v._v("html entry 的方式引入子应用，相比 js entry 极大的降低了应用改造的成本")]),v._v(" "),_("li",[v._v("监听路由自动的加载、卸载当前路由对应的子应用")]),v._v(" "),_("li",[v._v("路由保持，浏览器刷新、前进、后退，都可以作用到子应用")]),v._v(" "),_("li",[v._v("完备的沙箱方案，js 沙箱做了 SnapshotSandbox、LegacySandbox、ProxySandbox 三套渐进增强方案，css 沙箱做了 strictStyleIsolation、experimentalStyleIsolation 两套适用不同场景的方案*（类"),_("code",[v._v("vue")]),v._v("的"),_("code",[v._v("scoped")]),v._v("）*")]),v._v(" "),_("li",[v._v("提供多应用并行与多实例沙箱支持，同一时刻，渲染多个微应用，使一个应用可以加载多个其他应用的模块")]),v._v(" "),_("li",[v._v("做了静态资源预加载能力")]),v._v(" "),_("li",[v._v("应用间通信简单，全局注入")])]),v._v(" "),_("p",[_("strong",[v._v("不足")])]),v._v(" "),_("ul",[_("li",[v._v("适配成本比较高，工程化、生命周期、静态资源路径、路由等都要做一系列的适配工作")]),v._v(" "),_("li",[v._v("css 沙箱无法绝对的隔离，采用严格隔离会有各种问题；js 沙箱在某些场景下执行性能下降严重")]),v._v(" "),_("li",[v._v("基于路由匹配，无法同时激活多个子应用，也不支持子应用保活")]),v._v(" "),_("li",[v._v("有一定的改造成本，从 "),_("code",[v._v("webpack")]),v._v("、代码、路由等等都要做一系列的适配")]),v._v(" "),_("li",[v._v("无法支持 vite 等 ESM 脚本运行")])]),v._v(" "),_("h3",{attrs:{id:"micro-app-方案"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#micro-app-方案"}},[v._v("#")]),v._v(" micro-app 方案")]),v._v(" "),_("p",[v._v("micro-app 是基于 webcomponent + qiankun sandbox 的微前端方案。")]),v._v(" "),_("p",[_("strong",[v._v("特点")])]),v._v(" "),_("ul",[_("li",[v._v("使用 webcomponet 加载子应用相比 single-spa 这种注册监听方案更加优雅")]),v._v(" "),_("li",[v._v("复用经过大量项目验证过 qiankun 的沙箱机制也使得框架更加可靠")]),v._v(" "),_("li",[v._v("组件式的 api 更加符合使用习惯，支持子应用保活")]),v._v(" "),_("li",[v._v("降低子应用改造的成本，提供静态资源预加载能力")])]),v._v(" "),_("p",[_("strong",[v._v("不足")])]),v._v(" "),_("ul",[_("li",[v._v("接入成本较 qiankun 有所降低，但是路由依然存在依赖")]),v._v(" "),_("li",[v._v("多应用激活后无法保持各子应用的路由状态，刷新后全部丢失")]),v._v(" "),_("li",[v._v("css 沙箱依然无法绝对的隔离，js 沙箱做全局变量查找缓存，性能有所优化")]),v._v(" "),_("li",[v._v("支持 vite 运行，但必须使用 plugin 改造子应用，且 js 代码没办法做沙箱隔离")]),v._v(" "),_("li",[v._v("对于不支持 webcompnent 的浏览器没有做降级处理")])]),v._v(" "),_("h3",{attrs:{id:"emp-方案"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#emp-方案"}},[v._v("#")]),v._v(" EMP 方案")]),v._v(" "),_("p",[v._v("EMP 方案是基于 webpack 5 module federation 的微前端方案。")]),v._v(" "),_("p",[_("strong",[v._v("特点")])]),v._v(" "),_("ul",[_("li",[v._v("webpack 联邦编译可以保证所有子应用依赖解耦")]),v._v(" "),_("li",[v._v("应用间去中心化的调用、共享模块")]),v._v(" "),_("li",[v._v("模块远程 ts 支持")])]),v._v(" "),_("p",[_("strong",[v._v("不足")])]),v._v(" "),_("ul",[_("li",[v._v("对 webpack 强依赖，老旧项目不友好")]),v._v(" "),_("li",[v._v("没有有效的 css 沙箱和 js 沙箱，需要靠用户自觉")]),v._v(" "),_("li",[v._v("子应用保活、多应用激活无法实现")]),v._v(" "),_("li",[v._v("主、子应用的路由可能发生冲突")])]),v._v(" "),_("h3",{attrs:{id:"无界-iframe-方案"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#无界-iframe-方案"}},[v._v("#")]),v._v(" 无界 iframe 方案")]),v._v(" "),_("p",[v._v("无界微前端的功能非常强大，支持子应用保活、子应用内嵌、多应用激活、去中心化通信、生命周期、插件系统、vite 框架支持、兼容 IE9、应用共享。")]),v._v(" "),_("p",[_("strong",[v._v("特点")]),v._v("：")]),v._v(" "),_("ul",[_("li",[_("p",[_("strong",[v._v("接入成本低")]),v._v("：无界微前端的成本非常低，主要体现在主应用的使用成本、子应用的适配成本两个方面。")]),v._v(" "),_("ul",[_("li",[_("p",[v._v("主应用使用成本：主应用使用无界不需要学习额外的知识，无界提供基于 vue 封装的 wujie-vue 和基于 react 封装的 wujie-react，用户可以当初普通组件一样加载子应用。子应用加载和普通 vue 组件加载并无二致，所有配置都收敛到组件的属性上。")])]),v._v(" "),_("li",[_("p",[v._v("子应用接入成本：子应用首先需要做支持跨域请求改造，这个是所有微前端框架运行的前提，除此之外子应用可以不做任何改造就可以在无界框架中运行，不过此时运行的方式是重建模式。")])])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("速度快")]),v._v("：主要体现在首屏打开快、运行速度快两个方面。")]),v._v(" "),_("ul",[_("li",[_("p",[_("strong",[v._v("首屏打开快")])]),v._v(" "),_("p",[v._v("目前大部分微前端只能做到静态资源预加载，但是就算子应用所有资源都预加载完毕，等到子应用打开时页面仍然有不短的白屏时间，这部分白屏时间主要是子应用 js 的解析和执行。无界微前端不仅能够做到静态资源的预加载，还可以做到子应用的预执行。预执行会阻塞主应用的执行线程，所以无界提供 fiber 执行模式，采取类似 react fiber 的方式间断执行 js，每个 js 文件的执行都包裹在 requestidlecallback 中，每执行一个 js 可以返回响应外部的输入，但是这个颗粒度是 js 文件，如果子应用单个 js 文件过大，可以通过拆包的方式降低体积达到 fiber 执行模式效益最大化。")])])])]),v._v(" "),_("li",[_("h5",{attrs:{id:"运行速度快"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#运行速度快"}},[v._v("#")]),v._v(" 运行速度快")]),v._v(" "),_("p",[v._v("子应用的 js 在 iframe 内运行，由于 iframe 是一个天然的 js 运行沙箱，所以无需采用 with (fakewindow) 这种方式来指定子应用的执行上下文，从而避免由于采用 with 语句执行子应用代码而导致的性能下降，整体的运行性能和原生性能差别不大。")])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("原生隔离")])]),v._v(" "),_("ul",[_("li",[v._v("利用"),_("code",[v._v("iframe")]),v._v("的"),_("code",[v._v("history")]),v._v("和主应用的"),_("code",[v._v("history")]),v._v("在同一个"),_("a",{attrs:{href:"https://html.spec.whatwg.org/multipage/browsers.html#top-level-browsing-context",target:"_blank",rel:"noopener noreferrer"}},[v._v("top-level browsing context"),_("OutboundLink")],1),v._v("来搭建天然的路由同步机制")]),v._v(" "),_("li",[v._v("副作用局限在沙箱内部，子应用切换无需任何清理工作，没有额外的切换成本")]),v._v(" "),_("li",[v._v("css 沙箱隔离：无界将子应用的 dom 放置在 "),_("code",[v._v("webcomponent + shadowdom")]),v._v(" 的容器中，除了可继承的 css 属性外实现了应用之间 css 的原生隔离。")]),v._v(" "),_("li",[v._v("js 沙箱隔离：无界将子应用的 js 放置在 "),_("code",[v._v("iframe（js-iframe）")]),v._v("中运行，实现了应用之间 window、document、location、history 的完全解耦和隔离。")]),v._v(" "),_("li",[v._v("js 沙箱和 css 沙箱连接：无界在底层采用 "),_("code",[v._v("proxy + Object.defineproperty")]),v._v(" 的方式将 js-iframe 中对 dom 操作劫持代理到 "),_("code",[v._v("webcomponent shadowRoot")]),v._v(" 容器中，开发者无感知也无需关心。")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("多应用同时激活在线")])]),v._v(" "),_("p",[v._v("框架具备同时激活多应用，并保持这些应用路由同步的能力")])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("组件式的使用方式")])]),v._v(" "),_("p",[v._v("无需注册，更无需路由适配，在组件内使用，跟随组件装载、卸载")])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("应用级别的 keep-alive")])]),v._v(" "),_("p",[v._v("子应用开启"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/startApp.html#alive",target:"_blank",rel:"noopener noreferrer"}},[v._v("保活模式"),_("OutboundLink")],1),v._v("后，应用发生切换时整个子应用的状态可以保存下来不丢失，结合"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/preloadApp.html#exec",target:"_blank",rel:"noopener noreferrer"}},[v._v("预执行模式"),_("OutboundLink")],1),v._v("可以获得类似"),_("code",[v._v("ssr")]),v._v("的打开体验")])]),v._v(" "),_("li",[_("h5",{attrs:{id:"vite-框架支持"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#vite-框架支持"}},[v._v("#")]),v._v(" vite 框架支持")]),v._v(" "),_("p",[v._v("无界子应用运行在 iframe 中原生支持 esm 的脚本，而且不用担心子应用运行的上下文问题，因为子应用读取的就是 iframe 的 window 上下文，所以无界微前端原生支持 vite 框架。")])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("性能和体积兼具")])]),v._v(" "),_("ul",[_("li",[v._v("子应用执行性能和原生一致，子应用实例"),_("code",[v._v("instance")]),v._v("运行在"),_("code",[v._v("iframe")]),v._v("的"),_("code",[v._v("window")]),v._v("上下文中，避免"),_("code",[v._v("with(proxyWindow){code}")]),v._v("这样指定代码执行上下文导致的性能下降，但是多了实例化"),_("code",[v._v("iframe")]),v._v("的一次性的开销，可以通过 "),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/api/preloadApp.html",target:"_blank",rel:"noopener noreferrer"}},[v._v("preload"),_("OutboundLink")],1),v._v(" 提前实例化")]),v._v(" "),_("li",[v._v("体积比较轻量，借助"),_("code",[v._v("iframe")]),v._v("和"),_("code",[v._v("webcomponent")]),v._v("来实现沙箱，有效的减小了代码量")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("开箱即用")])]),v._v(" "),_("p",[v._v("不管是样式的兼容、路由的处理、弹窗的处理、热更新的加载，子应用完成接入即可开箱即用无需额外处理，应用"),_("a",{attrs:{href:"https://wujie-micro.github.io/doc/guide/start.html#%E5%AD%90%E5%BA%94%E7%94%A8%E6%94%B9%E9%80%A0",target:"_blank",rel:"noopener noreferrer"}},[v._v("接入成本"),_("OutboundLink")],1),v._v("也极低。")])]),v._v(" "),_("li",[_("h5",{attrs:{id:"兼容-ie9"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#兼容-ie9"}},[v._v("#")]),v._v(" 兼容 IE9")]),v._v(" "),_("p",[v._v("由于无界采用了 webcomponent + shadowdom + proxy 的方案，在某些低版本浏览器上无法运行时，无界微前端会自动降级。")]),v._v(" "),_("p",[v._v("降级方案采用：")]),v._v(" "),_("ul",[_("li",[v._v("webcomponent + shadowdom ⇒ iframe（dom-iframe）")]),v._v(" "),_("li",[v._v("proxy + Object.defineproperty ⇒ Object.defineproperty")]),v._v(" "),_("li",[v._v("子应用运行的方式是 dom-iframe + js-iframe + Object.defineproperty，IE9+ 都可以兼容（无界没有 polyfill es6，需用户手动 babel 处理）。")])]),v._v(" "),_("p",[v._v("自动降级后无界依然可以保证子应用的 css 和 js 原生隔离，但是由于 dom-iframe 的限制，弹窗将只能在子应用内部打开")])])]),v._v(" "),_("p",[_("a",{attrs:{href:"https://juejin.cn/post/7004661323124441102#heading-14",target:"_blank",rel:"noopener noreferrer"}},[v._v("从零到一实现企业级微前端框架"),_("OutboundLink")],1)]),v._v(" "),_("p",[_("a",{attrs:{href:"https://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247512424&idx=1&sn=2b545e4ae53b3ada37a4914a18b7c6a7&chksm=f992b7b9cee53eaf5a3b89f05083950719497534744cf6f1db1b2295bdee2a2e745dc803706f&scene=178&cur_album_id=1532020216900141059#rd",target:"_blank",rel:"noopener noreferrer"}},[v._v("深入浅出解析阿里成熟的微前端框架 qiankun 源码"),_("OutboundLink")],1)]),v._v(" "),_("p",[_("a",{attrs:{href:"https://juejin.cn/post/6846687602439897101",target:"_blank",rel:"noopener noreferrer"}},[v._v("微前端框架 - qiankun 大法好"),_("OutboundLink")],1)])])}),[],!1,null,null,null);_.default=a.exports}}]);