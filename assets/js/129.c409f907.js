(window.webpackJsonp=window.webpackJsonp||[]).push([[129],{430:function(a,t,e){"use strict";e.r(t);var v=e(6),r=Object(v.a)({},(function(){var a=this,t=a._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[t("h1",{attrs:{id:"rn-多线程与渲染"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#rn-多线程与渲染"}},[a._v("#")]),a._v(" RN 多线程与渲染")]),a._v(" "),t("p",[a._v("React Native 应用也需要处理并行任务，比如，在用户滚动页面的时候，不仅要处理用户的滚动手势，并需要将页面绘制到新位置上，与此同时，还可能需要发起新的请求和做一些局部的渲染。只有单个线程时，处理任务就需要排队，前一个没完成，后一个就需要等待，这就容易导致交互的卡顿。")]),a._v(" "),t("p",[a._v("那么新架构是如何改善交互体验？")]),a._v(" "),t("h2",{attrs:{id:"进程和线程"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#进程和线程"}},[a._v("#")]),a._v(" 进程和线程")]),a._v(" "),t("p",[a._v("任何 React Native 应用，都是一个多线程的应用，这是由其架构设计的特点所决定的。一个应用由一个或多个进程组成。一个进程，用最简单的话说，就是一个正在执行的程序，该程序的上下文中运行着一个或多个线程。一个线程是操作系统分配处理器时间的基本单位，一个线程可以执行进程代码的任何部分，包括目前正在被另一个线程执行的部分。")]),a._v(" "),t("p",[a._v("在计算机底层，线程是操作系统分配 CPU 时间的基本单元，同一个线程在同一个时间单元中，只能执行一个代码模块，这个代码模块代表的是某个具体的工作任务，比如计算 1+1，在该线程执行 1+1 的时候它不能同时去执行其他任务，比如同时发起请求。如果要让应用在计算的同时处理多个任务，那怎么办呢？再另起一个线程。在同一时间内，不同的线程可以同时处理不同的任务。")]),a._v(" "),t("p",[a._v("当我们给计算机分配一个任务时，如果这个任务可被分解成若干个可独立执行子任务，那么这时可以在主线程中创建若干个线程，来分别处理这些子任务。从计算机底层视角看，一个计算机可能会有多个 CPU，而每个 CPU 又是可以开多个线程的，因此计算机是可以同时处理这些可独立执行的子任务的，这就是并行的原理。")]),a._v(" "),t("p",[a._v("那什么时候我们需要多线程多进程来处理并发任务呢？这需要根据任务的复杂度来确定。任务的复杂度不一样，需要的进程和线程的数量也不一样。打个比方，在一个大型项目中，要多个不同职能团队紧密合作，而且每个职能团队又会配备多个人，这就类似于多进程多线程。在一个中型项目中，一个多人团队就能完成好，这就类似单进程多线程模型。而一个人就能搞定的小型项目，就类似于单进程单线程。")]),a._v(" "),t("h2",{attrs:{id:"rn-中的多线程"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#rn-中的多线程"}},[a._v("#")]),a._v(" RN 中的多线程")]),a._v(" "),t("p",[a._v("React Native 框架底层，采用的是单进程多线程的设计。在 React Native 应用中至少会有三个线程：")]),a._v(" "),t("ol",[t("li",[a._v("主线程（也叫做 UI 线程）")]),a._v(" "),t("li",[a._v("JavaScript 线程")]),a._v(" "),t("li",[a._v("Background 线程（也叫做 ShadowQueue 线程）")])]),a._v(" "),t("p",[t("strong",[a._v("主线程是唯一一个可以操作视图的线程")]),a._v("。React Native 应用本质是 iOS 应用或 Android 应用，因此，在启动时，操作系统也会为其创建唯一可操作视图的主线程。无论是 iOS 应用还是 Android 应用，在启动应用的时候，系统都会为该应用创建一个主线程，来负责用户交互和界面绘制，而除了主线程外，其他线程是不可以操作视图的。")]),a._v(" "),t("p",[t("strong",[a._v("JavaScript 线程是用于执行 JavaScript 脚本的线程")]),a._v("。大多数情况下，JavaScript 脚本会交由 JavaScript 引擎来执行，比如处理点击手势、拼接接口字段、发起请求和执行 React Render 函数等任务。但值得注意的是，并不是任何的 JavaScript 脚本的执行都在 JavaScript 线程进行。")]),a._v(" "),t("p",[t("strong",[a._v("ShadowQueue 线程是用于布局的线程")]),a._v("。React Native 应用的布局任务，会交由 Yoga 布局引擎来执行，而 Yoga 布局引擎的执行，大多数情况下，是在 ShadowQueue 线程执行的。")]),a._v(" "),t("p",[a._v("除了以上三大线程之外，React Native 还会开启另外一些线程用于任务的执行，例如调用 Module 模块、WebSocket 长链接和 Storage 存储，每次调用相关模块的时候，React Native 都会为它们创建单独的线程。当然，还有 HTTP 请求之类的任务，也都有单独的线程进行处理，就不一一列举了。")]),a._v(" "),t("h2",{attrs:{id:"渲染与线程模型"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#渲染与线程模型"}},[a._v("#")]),a._v(" 渲染与线程模型")]),a._v(" "),t("p",[a._v("多线程机制正是保障 React Native 渲染体验的核心要素之一。一般而言，在 React Native 中，一个渲染任务可分为 5 个子任务。比如，先处理点击手势（Event），接着执行 "),t("code",[a._v("React Render 函数")]),a._v("，之后 Yoga 引擎开始计算布局（"),t("code",[a._v("Layout")]),a._v("），再然后框架提交（"),t("code",[a._v("Commit")]),a._v("）为渲染而准备的 "),t("code",[a._v("“React Shadow Tree”")]),a._v("，最后将挂载（"),t("code",[a._v("Mount")]),a._v("）“React Shadow Tree”，并在屏幕上显示。")]),a._v(" "),t("p",[t("img",{attrs:{src:"/blog/images/mobile/rn%E6%89%A7%E8%A1%8C%E5%9C%BA%E6%99%AF.png",alt:"rn执行场景"}})]),a._v(" "),t("p",[a._v("我们可以发现，渲染子任务之间的关系必须是串行的，它的后一个子任务必须等待前一个子任务执行完成后才能继续执行。在介绍多线程时，我们提到过，只有当任务可被分解成若干个可独立执行子任务时，多线程才能并行地处理它们，从而提高任务整体执行的效率。虽然渲染任务能被分解成若干个子任务，但是"),t("strong",[a._v("这些子任务之间是有先后顺序和依赖关系的，并不能完全独立地执行，这就不满足多线程并行执行的要求")]),a._v("。那么，为什么 React Native 还要弄三个线程来处理渲染任务？要弄清楚这点，就必须得弄清楚 React Native 的线程模型了。")]),a._v(" "),t("p",[a._v("React Native 渲染器将渲染管道的工作分配给多个线程，根据不同场景采用不同的方案来执行渲染任务，只需握住核心：不同优先级的渲染任务用不一样的线程解决方案。其中，最重要的两个场景方案是：")]),a._v(" "),t("ul",[t("li",[a._v("在主线程中渲染：对于高优先级的渲染任务，它的所有子任务会同步地在主线程上执行。")]),a._v(" "),t("li",[a._v("在背景线程中渲染：对于一般场景的渲染任务，它的大部分子任务会在 JavaScript 线程和 Background 线程中执行。")])]),a._v(" "),t("p",[t("a",{attrs:{href:"https://reactnative.dev/architecture/threading-model",target:"_blank",rel:"noopener noreferrer"}},[a._v("RN 线程模型"),t("OutboundLink")],1)]),a._v(" "),t("h3",{attrs:{id:"在主线程中渲染"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#在主线程中渲染"}},[a._v("#")]),a._v(" 在主线程中渲染")]),a._v(" "),t("p",[a._v("由于 iOS 和 Android 的更新 UI 机制的限制，非主线程一般是不能操作 UI 的，加之多线程本身也会增加复杂度，因此，只在主线程中渲染的流程最简单，因此，我们先讨论它。")]),a._v(" "),t("p",[a._v("可能会怀疑，只有主线程，会不会导致 React Native 的卡顿。这种担心是不无道理的，因为，对于纯 Native 应用而言，它可以直接操作 UI，而 React Native 应用还需要额外考虑 JavaScript 执行的时间，这就更可能会导致卡顿。")]),a._v(" "),t("p",[a._v("但可能会卡顿并不等同于一定会卡顿。有些高优先级的渲染任务，就非常适合只在主线程中执行。根据渲染原理可知，若在 1s 之内能够稳定地渲染出 60 帧，也就是 16ms 每帧，那么渲染就是流畅的；只有超过 16ms，用户才可能会觉得卡顿。换句话说，在单次渲染任务中，只要 JavaScript 执行和 UI 操作的总耗时不超过 16ms，那么，用户就不会感觉卡顿。")]),a._v(" "),t("p",[a._v("例如用户通过文本框输入的这种高优先级场景，用户输入文字触发的回调方法，以及后续的其他的渲染子任务，都会在主线程中执行。主线程执行的 5 个任务依次是：先执行关于文字输入事件（Event）的回调函数，若回调函数触发了 setState 方法后，就会接着执行 React 的 “Render” 方法，然后在计算具体的元素布局（Layout），再然后框架提交（Commit）为渲染而准备的 “React Shadow Tree”，最后将挂载（Mount）“React Shadow Tree”，并在屏幕上显示。")]),a._v(" "),t("p",[a._v("当然，官方也提示了这种高优先级的同步渲染的风险性："),t("code",[a._v("unstable_onChangeSync")]),a._v(" 回调将会在主线程中执行，并且它可能会导致掉帧。")]),a._v(" "),t("h3",{attrs:{id:"在背景线程中渲染"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#在背景线程中渲染"}},[a._v("#")]),a._v(" 在背景线程中渲染")]),a._v(" "),t("p",[a._v("React Native 应用相对于 Native 应用而言，多了 JavaScript 执行这一步，这就增加了渲染任务不能在 16ms 内执行完成的风险。因此，在大部分情况下，开发者只需使用 TextInput 组件的 onChange 回调来更新页面即可。和其他组件方法一样，TextInput 组件的 onChange 方法是多线程异步执行的，这种机制就叫做在背景线程中渲染。")]),a._v(" "),t("p",[a._v("该渲染任务依旧可分为 5 个子任务，Event、Render、Layout、Commit 和 Mount，并且这些子任务也需要依次执行。但和只在主线中渲染的方案不同，该方案极大地降低了主线程卡顿的问题，因为 Event 和 Render 相关的 JavaScript 代码是在 JavaScript 线程中执行的，而 Layout、Commit 是在背景线程中执行的。")]),a._v(" "),t("p",[a._v("由于主线程、JavaScript 线程和 Background 线程是三个相互独立的线程，因此它们可以并行地执行任务，并且不相互干扰。例如，在执行前四个子任务（Event、Render、Layout、Commit）时，主线程是空闲的状态，这时，主线程可以并行地处理类似于用户滚动之类的交互任务。这就意味着，即便前四个子任务中的耗时超过了 16ms，但只要主线程的 Mount 子任务不超过 16ms，用户也感觉不到卡顿。这就是，在背景线程中渲染方法的优势。")]),a._v(" "),t("h2",{attrs:{id:"总结"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[a._v("#")]),a._v(" 总结")]),a._v(" "),t("p",[a._v("React Native 新架构在底层会创建至少三个线程。框架默认采用三线程异步渲染，对于高优先级的渲染任务可采用同步渲染。三线程异步渲染的优势在于，即便 JavaScript 任务执行时间过长，但主线程依旧可以同时响应用户的操作。例如，极端情况下 JavaScript 假死，页面依旧可以滑动。根据实践经验，大部分的卡顿确实是 JavaScript 中的任务执行耗时长导致的。此外，某些特定场景下，提高交互事件优先级，使用主线程同步渲染，也是一种保障交互体验的手段。例如，在用户输入 TextInput 文字，并有大范围渲染页面的场景下，提高用户输入文字的优先级，可减少渲染导致的输入文字卡顿问题。")]),a._v(" "),t("p",[a._v("React Native 在第一版的时候，就将其设置成了双线程异步消息通信的架构。后来 React Native 团队又为 Yoga 布局引擎，并又新增了一个线程，专门用于处理布局。整体而言，相对于单线程同步调用的架构，多线程的异步消息通信的架构，它能大幅地减少卡顿的可能性。一方面，因为，渲染任务被分解到了三个线程中，JavaScript 线程、布局线程和 UI 线程，所以 UI 线程的任务量会减少，UI 线程的渲染卡顿的几率也会减少。另一方面，采用异步通信而不是同步通信后，JavaScript 线程任务的执行不会阻塞 UI 线程。")])])}),[],!1,null,null,null);t.default=r.exports}}]);