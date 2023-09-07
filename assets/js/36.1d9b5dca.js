(window.webpackJsonp=window.webpackJsonp||[]).push([[36],{336:function(t,a,r){"use strict";r.r(a);var v=r(6),_=Object(v.a)({},(function(){var t=this,a=t._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"微前端"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#微前端"}},[t._v("#")]),t._v(" 微前端")]),t._v(" "),a("h2",{attrs:{id:"工程思考"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#工程思考"}},[t._v("#")]),t._v(" 工程思考")]),t._v(" "),a("h3",{attrs:{id:"嵌套渲染场景"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#嵌套渲染场景"}},[t._v("#")]),t._v(" 嵌套渲染场景")]),t._v(" "),a("p",[t._v("在应用 A 中通过调用 loadMicroApp(B) 的方式唤起微应用 B，然后在微应用 B 中通过 loadMicroApp(C) 的方式唤起微应用 C，通过这样的调用链路即可很完美的完成产品上的诉求。但是现实情况往往没有那么简单，前面提到过，若想要 "),a("code",[t._v("loadMicroApp")]),t._v(" API 能符合预期的运行，我们需要确保被加载的微应用是不含自己的路由系统，否则会出现多个应用间路由系统互相 "),a("code",[t._v("抢占/冲突")]),t._v(" 的情况。而现实情况是，我们"),a("strong",[t._v("大部分需要复用的页面/组件，都会是某个站点的局部路由页")]),t._v("，很少有人会专门起一个仓库，用来专门把这个页面抽取成一个微应用。这种场景下，我们其实"),a("strong",[t._v("只需要确保微应用的路由系统不会干扰到全局的 URL 系统即可")]),t._v("。A/B 均是子应用，但是在 A 中可以再通过抽屉呼出 B，同时浏览器地址栏也不会被 B 的路由干扰，还是 A 的路由。")]),t._v(" "),a("h3",{attrs:{id:"极限渲染场景"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#极限渲染场景"}},[t._v("#")]),t._v(" 极限渲染场景")]),t._v(" "),a("p",[t._v("把一个微应用的 20+ 路由页同时渲染到了一个 url 下，例如，列表中每一个 demo 都是通过 qiankun 渲染的一个独立微应用实例，而每一个微应用实例，实际对应是同一个应用的不同路由页。不同于前面几个场景，将同一个应用的不同页面，同时渲染到主应用的不同 UI 容器中这个需求下，有几个比较特殊的问题需要去考虑：")]),t._v(" "),a("ul",[a("li",[t._v("是否需要特殊的微应用生产方式")]),t._v(" "),a("li",[t._v("多路由系统共存带来的 冲突/抢占 问题")]),t._v(" "),a("li",[t._v("不同微应用间的样式隔离")]),t._v(" "),a("li",[t._v("如何优化渲染性能：既然每一个微应用实例实际对应的是同一个应用，那我们如何尽可能多的复用一些运行时或者沙箱，从而降低这么多微应用同时渲染代理的运行时开销")])]),t._v(" "),a("h3",{attrs:{id:"新的-ui-共享模式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#新的-ui-共享模式"}},[t._v("#")]),t._v(" 新的 UI 共享模式")]),t._v(" "),a("p",[t._v("在以前，如果我们希望复用一个站点的局部 UI，几乎只有这样一条路径：从业务系统中"),a("code",[t._v("抽取出一个组件 -> 发布 npm 包 -> 调用方使用 npm 包")]),t._v("。将这部分代码抽取成若干个单独的文件，同时还要考虑如何跟已有的系统做上下文解耦，这类工作出现在一个越是年代久远的项目上，实施起来就越是困难。")]),t._v(" "),a("p",[t._v("不同于组件库的研发流程，微前端的场景下，大部分时候我们不会为了去复用一个 UI，而去专门写一个微应用出来。通常我们期望的是，从一个已有系统中，直接选取我们需要复用的部分，嵌入到我们自己的容器里进行渲染。基于上面提到过的微应用多实例的渲染方案，我们可以考虑将需要复用的组件，以路由 URL 作为 ID 的方式导出。")])])}),[],!1,null,null,null);a.default=_.exports}}]);