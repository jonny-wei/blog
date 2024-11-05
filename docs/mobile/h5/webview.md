# WebView

现如今，在做移动端 H5 开发时，少不了与 Native 之间进行交互。而在Native中，H5的承载容器为 WebView，其核心是使用 WebView 控件实现加载 url。

![webview3](/blog/images/mobile/webview3.png)

[WebView有难度的场景 - 浅谈Web容器设计的边界和目标](https://mp.weixin.qq.com/s/2WC4OsT7Wk_Rnh6KvQPpuQ)

## 简介

`WebView` 用来展示网页的 `view` 组件，该组件是你运行自己的浏览器或者在你的线程中展示线上内容的基础。使用 `Webkit` 渲染引擎来展示，并且支持前进后退等基于浏览历史，放大缩小，等更多功能。简单来说 `WebView` 是手机中内置了一款高性能 `Webkit` 内核浏览器，在 SDK 中封装的一个组件。不过没有提供地址栏和导航栏，只是单纯的展示一个网页界面。

`WebView` 可以简单理解为页面里的 `iframe` 。原生 `app` 与 `WebView` 的交互可以简单看作是页面与页面内 `iframe` 页面进行的交互。就如页面与页面内的 `iframe` 共用一个 `Window`  一样，原生与 `WebView` 也共用了一套原生的方法。

使用了 `WebView` 来承载 `H5`，那么便少不了与 `Native` 之间发生交互，`WebView` 所承载的页面，通过 `JS` 与 `Native` 进行通信，我们将这个通信的”桥梁“为 `JSBridge`。微信内置浏览器的 `H5` 开发，有个经常出现的东西，叫做 `WeixinJSBridge`（js-sdk）。

![webview1](/blog/images/mobile/webview1.png)

## Android WebView

Android 4.4 前：`Android WebView` 在低版本 & 高版本采用了不同的 Webkit 版本的内核（正因为如此，H5 的很多新特性，在 Android 版本小于4.4的安卓机上，都不支持） Android 4.4后：原本基于 `Webkit` 的 `WebView` 开始基于 `Chromium` 内核，这一改动大大提升了 `WebView` 组件的性能以及对 `HTML5`, `CSS3`, `JavaScript`的支持。不过它的API却没有很大的改动，在兼容低版本的同时只引进了少部分新的 API，并不需要你做很大的改动。

在 Android WebView，要实现 JS 调用 Java，有 3 种方法：

- `JavascriptInterface`
- `WebViewClient.shouldOverrideUrlLoading()`
- `WebChromeClient.onXXX()`

## IOS WebView

在 IOS8 之前，苹果手机的 WebView 使用的 UIWebView，UIWebView长期以来存在某些问题：

- 加载速度慢
- 存在内存泄漏
- 内存占用多，内存优化困难
- 如果内存占用过多还可能因为占用过多被系统kill掉 在 WWDC 2014 大会上，IOS8推出了 WKWebView，WKWebView 是现代 Webkit API 在 iOS 8 和 OS X Yosemite 应用中的核心部分。它代替了 UIKit 中的 UIWebView 和 AppKit 中的 WebView，提供了统一的跨双平台 API。拥有 60fps 滚动刷新率、内置手势、高效的 app 和 web 信息交换通道、和 Safari 相同的 JavaScript 引擎。

## 通信桥梁 - JSBridge

WebView 通过 JSBridge 与 Native 侧通信。通信原理是 `JSBridge` 实现的核心，实现方式可以各种各样，但是万变不离其宗。这里，推荐的实现方式如下：

- `JavaScript` 调用 `Native` 推荐使用 **`注入 API`** 的方式。（ iOS6 忽略，Android 4.2 以下使用 `WebViewClient` 的 `onJsPrompt` 方式。）
- `Native` 调用 `JavaScript` 则直接执行拼接好的 `JavaScript` 代码即可。

对于其他方式，诸如 React Native、微信小程序 的通信方式都与上描述的近似，并根据实际情况进行优化。

JSBridge 只是解决了 Native 和 Web 的互相调用问题，如果我想借助 Native 加强 Web 怎么办？这时候就有了一些探索：

- **预热**：提前创建和初始化 WebView，甚至实现 WebView 容器池，减少 WebView 的启动时间
- **缓存**：把常用的 Web 资源预先存在 Native 本地，然后拦截浏览器网络请求重定向到本地，这样就可以加快 Web 的资源加载速度（也叫“离线包”方案）；
- **劫持**：比如说 Web 对网络加载的控制力比较弱，部分有能力的厂商会把所有的网络请求都劫持下来交给 Native 去做，这样做可以更灵活的管理 Web 请求
- **替换**：替换一般指替换 Web 的 `Img` 标签和 `Video` 标签，这个最常见的地方就是各大新闻类客户端。因为新闻的动态性和实时性，新闻都是由各个编辑/自媒体通过后台编辑下发的，这时候要利用 **Web 强大的排版功能**去显示文本内容；但是为了加载速度和观看体验，图片和视频都是 Native 组件替换的

## WebView 缓存

打开一个 WebView 通常会经历以下几个阶段：

- 交互无反馈
- 到达新的页面，页面白屏
- 页面基本框架出现，但是没有数据；页面处于 loading 状态
- 出现所需的数据

**除了白屏，影响 Web 体验的问题还有缺少操作的反馈，主要表现在两个方面：页面切换的生硬和点击的迟滞感。**

如果从程序上观察，WebView 启动过程大概分为以下几个阶段：

![webview2](/blog/images/mobile/webview2.png)

WebView 经常会加载一些 js 文件（例如和 WebView 用来 Native 通信的 bridge.js），而这些 js 文件不会经常发生变化，所以我们希望 js 在 WebView 里面加载一次之后，如果 js 没有发生变化，下次就不用再发起网络请求去加载，从而减少流量和资源的占用。那么有什么方式可以达到这个目的呢？得从 WebView 的缓存入手：

WebView 主要包括两类缓存：

- 浏览器自带的网页数据缓存，这是所有的浏览器都支持的、由HTTP协议定义的缓存。
- H5 缓存，这是由 web 页面的开发者设置的，H5 缓存主要包括了 App Cache、DOM Storage、Local Storage、Web SQL Database 存储机制等。

## 问题

### Q1. 从页面 A 打开一个新页面 B，B 页面关闭（包括意外崩溃），如何通知 A 页面？

A、B 页面通信方式有：

- url 传参
- postmessage：允许来自不同源的脚本采用异步方式进行有效的通信，可以实现跨文本文档、多窗口、跨域消息传递，可在多用于窗口间数据通信，这也使它成为跨域通信的一种有效的解决方案。
- localStorage：仅允许你访问一个Document 源（origin）的对象 Storage；存储的数据将保存在浏览器会话中。如果 A 打开的 B 页面和 A 是不同源，则无法访问同一  Storage。
- WebSocket
- SharedWorker：代表一种特定类型的 worker，可以从几个浏览上下文中访问，例如几个窗口、iframe 或其他 worker。它们实现一个不同于普通 worker 的接口，具有不同的全局作用域, SharedWorkerGlobalScope
- Service Worker：一个可以长期运行在后台的 Worker，能够实现与页面的双向通信。多页面共享间的 Service Worker 可以共享，将 Service Worker 作为消息的处理中心（中央站）即可实现广播效果。

页面正常关闭时，会先执行 window.onbeforeunload ，然后执行 window.onunload ，我们可以在这两个方法里向 A 页面通信。崩溃就不一样了，页面看不见了，JS 都不运行了，那还有什么办法可以获取B页面的崩溃？可以利用 window 对象的 load 和 beforeunload 事件，通过心跳监控来获取 B 页面的崩溃：

在页面加载时（load 事件）在 sessionStorage 记录 good_exit 状态为 pending，如果用户正常退出（beforeunload 事件）状态改为 true，如果 crash 了，状态依然为 pending，在用户第2次访问网页的时候（第2个load事件），查看 good_exit 的状态，如果仍然是 pending 就是可以断定上次访问网页崩溃了！

但有一个问题，用 sessionStorage 保存状态，在用户关闭了B页面，sessionStorage 值就会丢失，所以换种方式，使用 Service Worker 来实现：

- Service Worker 有自己独立的工作线程，与网页区分开，网页崩溃了，Service Worker 一般情况下不会崩溃；
- Service Worker 生命周期一般要比网页还要长，可以用来监控网页的状态；
- 网页可以通过 `navigator.serviceWorker.controller.postMessage` API 向掌管自己的 SW 发送消息

基于以上几点优势，完整设计一套流程如下：

- B 页面加载后，通过 `postMessage` API 每 5s 给 sw 发送一个心跳，表示自己的在线，sw 将在线的网页登记下来，更新登记时间；
- B 页面在 `beforeunload` 时，通过 `postMessage` API 告知自己已经正常关闭，sw 将登记的网页清除；
- 如果 B页面在运行的过程中 crash 了，sw 中的 `running` 状态将不会被清除，更新时间停留在奔溃前的最后一次心跳；
- A 页面 Service Worker 每 10s 查看一遍登记中的网页，发现登记时间已经超出了一定时间（比如 15s）即可判定该网页 crash 了。

```js
// B
if (navigator.serviceWorker.controller !== null) {
  let HEARTBEAT_INTERVAL = 5 * 1000 // 每五秒发一次心跳
  let sessionId = uuid() // B页面会话的唯一 id
  let heartbeat = function () {
    navigator.serviceWorker.controller.postMessage({
      type: 'heartbeat',
      id: sessionId,
      data: {} // 附加信息，如果页面 crash，上报的附加数据
    })
  }
  window.addEventListener("beforeunload", function() {
    navigator.serviceWorker.controller.postMessage({
      type: 'unload',
      id: sessionId
    })
  })
  setInterval(heartbeat, HEARTBEAT_INTERVAL);
  heartbeat();
}

// A
// 每 10s 检查一次，超过15s没有心跳则认为已经 crash
const CHECK_CRASH_INTERVAL = 10 * 1000 
const CRASH_THRESHOLD = 15 * 1000
const pages = {}
let timer
function checkCrash() {
  const now = Date.now()
  for (var id in pages) {
    let page = pages[id]
    if ((now - page.t) > CRASH_THRESHOLD) {
      // 上报 crash
      delete pages[id]
    }
  }
  if (Object.keys(pages).length == 0) {
    clearInterval(timer)
    timer = null
  }
}

worker.addEventListener('message', (e) => {
  const data = e.data;
  if (data.type === 'heartbeat') {
    pages[data.id] = {
      t: Date.now()
    }
    if (!timer) {
      timer = setInterval(function () {
        checkCrash()
      }, CHECK_CRASH_INTERVAL)
    }
  } else if (data.type === 'unload') {
    delete pages[data.id]
  }
})
```

[前端工程师所需要了解的WebView](https://juejin.cn/post/6932083257286590477#heading-6)

[Android WebView H5 秒开方案总结](https://juejin.cn/post/7016883220025180191#heading-5)

[WebView秒开方案探索](https://juejin.cn/post/7038775031597367310)
