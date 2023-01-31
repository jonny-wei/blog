# JSBridge

## 介绍

**JSBridge**  是一种 JS 实现的 Bridge，连接着桥两端的 Native 和 WebView。它在 APP 内方便地让 Native 调用 JS，JS 调用 Native ，是双向通信的通道。JSBridge 主要是 **给 JavaScript 提供调用 Native 功能的接口**，实现原生功能如查看本地相册、打开摄像头、指纹支付等 Native 功能。它的核心是 **构建 Native 和非 Native 间消息通信的通道**，而且是 **双向通信的通道**。

**H5 与 Native 对比**

| name        | H5                                                | Native                                             |
| ----------- | ------------------------------------------------- | -------------------------------------------------- |
| 稳定性      | 调用系统浏览器内核，稳定性较差                    | 使用原生内核，更加稳定                             |
| 灵活性      | 版本迭代快，上线灵活                              | 迭代慢，需要应用商店审核，上线速度受限制           |
| 受网速 影响 | 较大                                              | 较小                                               |
| 流畅度      | 有时加载慢，给用户“卡顿”的感觉                    | 加载速度快，更加流畅                               |
| 用户体验    | 功能受浏览器限制，体验有时较差                    | 原生系统 api 丰富，能实现的功能较多，体验较好      |
| 可移植性    | 兼容跨平台跨系统，如 PC 与 移动端，iOS 与 Android | 可移植性较低，对于 iOS 和 Android 需要维护两套代码 |

## 双向通信原理

### JS 调用 Native

JS 调用 Native 的实现方式较多，主要有拦截 `URL Scheme` 、重写 prompt 、注入 API 等方法。

#### 拦截 URL Scheme

URL Schema 是类 UR L的一种请求格式，格式如下：

```
<protocol>://<host>/<path>?<qeury>#fragment
```

我们可以自定义 JSBridge 通信的 URL Schema，比如：`jsbridge://showToast?text=hello`

Native 加载 WebView之后，Web 发送的所有请求都会经过 WebView 组件，所以 Native 可以重写 WebView 里的方法，从来拦截 Web发起的请求，我们对请求的格式进行判断：

- 如果符合我们自定义的URL Schema，对URL进行解析，拿到相关操作、操作，进而调用原生Native的方法
- 如果不符合我们自定义的URL Schema，我们直接转发，请求真正的服务

![jsbridge1](/blog/images/mobile/jsbridge1.png)

Web发送URL请求的方法有这么几种：

1. `a`标签
2. `location.href`
3. 使用`iframe.src`
4. 发送`ajax`请求

这些方法，`a`标签需要用户操作，`location.href`可能会引起页面的跳转丢失调用，发送`ajax`请求Android没有相应的拦截方法，所以使用`iframe.src`是经常会使用的方案。

Android 和 iOS 都可以通过拦截 URL Scheme 并解析 Scheme 来决定是否进行对应的 Native 代码逻辑处理：

- Android 侧，`Webview` 提供了 `shouldOverrideUrlLoading` 方法来提供给 Native 拦截 H5 发送的 `URL Scheme` 请求。
- iOS 侧  `WKWebview` 可以根据拦截到的 `URL Scheme` 和对应的参数执行相关的操作。

拦截 URL Scheme 这种方法的优点是不存在漏洞问题、使用灵活，可以实现 H5 和 Native 页面的无缝切换。例如在某一页面需要快速上线的情况下，先开发出 H5 页面。某一链接填写的是 H5 链接，在对应的 Native 页面开发完成前先跳转至 H5 页面，待 Native 页面开发完后再进行拦截，跳转至 Native 页面，此时 H5 的链接无需进行修改。但是使用 iframe.src 来发送 `URL Scheme` 需要对 URL 的长度作控制，使用复杂，速度较慢。

拦截 URL Scheme 这种方式从早期就存在，兼容性很好，但是由于是基于URL的方式，长度受到限制而且不太直观，数据格式有限制，而且建立请求有时间耗时。

#### 重写 prompt 等原生 JS 方法

- Android 4.2 之前注入对象的接口是 addJavascriptInterface ，但是由于安全原因慢慢不被使用。一般会通过修改浏览器的部分 Window 对象的方法来完成操作。主要是拦截 alert、confirm、prompt、console.log 四个方法，分别被 `Webview` 的 onJsAlert、onJsConfirm、onConsoleMessage、onJsPrompt 监听。
- iOS 由于安全机制，`WKWebView` 对 alert、confirm、prompt 等方法做了拦截，如果通过此方式进行 Native 与 JS 交互，需要实现 `WKWebView` 的三个 `WKUIDelegate` 代理方法。

使用该方式时，可以与 Android 和 iOS 约定好使用传参的格式，这样 H5 可以无需识别客户端，传入不同参数直接调用 Native 即可。剩下的交给客户端自己去拦截相同的方法，识别相同的参数，进行自己的处理逻辑即可实现多端表现一致。另外，如果能与 Native 确定好方法名、传参等调用的协议规范，这样其它格式的 prompt 等方法是不会被识别的，能起到隔离的作用。

#### 注入 API

这个方法会通过 webView 提供的接口，App 将 Native 的相关接口注入到 JS 的 Context（window）的对象中，一般来说这个对象内的方法名与 Native 相关方法名是相同的，Web 端就可以直接在全局 **window** 下使用这个暴露的全局 JS 对象，进而调用原生端的方法。

- Android 的 `Webview` 提供了 `addJavascriptInterface` 方法，支持 Android 4.2 及以上系统。
- iOS 的 `UIWebview` 提供了 `JavaScriptScore` 方法，支持 iOS 7.0 及以上系统。`WKWebview` 提供了 `window.webkit.messageHandlers` 方法，支持 iOS 8.0 及以上系统。`UIWebview` 在几年前常用，目前已不常见。

### Native 调用 JS

Native 调用 JS 比较简单，只要 H5 将 JS 方法暴露在 Window 上给 Native 调用即可。

- Android 中主要有两种方式实现。在 4.4 以前，通过 `loadUrl` 方法，执行一段 JS 代码来实现。在 4.4 以后，可以使用 `evaluateJavascript` 方法实现。`loadUrl` 方法使用起来方便简洁，但是效率低无法获得返回结果且调用的时候会刷新 WebView。`evaluateJavascript` 方法效率高获取返回值方便，调用时候不刷新 WebView，但是只支持 Android 4.4+。

- iOS 在 `UIWebView` 使用 `stringByEvaluatingJavaScriptFromString` 实现。在 `WKWebview` 中可以通过 `evaluateJavaScript:javaScriptString` 来实现，且支持 iOS 8.0 及以上系统。

## JSBridge 的使用

### webview 调用 native

当 webview 调用 native 时，会调用 `callHandler` 方法。实际上就是先生成一个 message，然后 push 到 `sendMessageQueue` 里，然后更改 iframe 的 `src`。然后，当 native 端检测到 `iframe src` 的变化时，会走到 `isQueueMessageURL` 的判断逻辑，然后执行 `WKFlushMessageQueue` 函数，获取到 JS 侧的 `sendMessageQueue` 中的所有 message。

当一个 message 结构存在 responseId 的时候说明这个 message 是执行 bridge 后传回的。取不到 responseId 说明是第一次调用 bridge 传过来的，这个时候会生成一个返回给调用方的 message，其 reponseId 是传过来的 message 的 callbackId，当 native 执行 responseCallback 时，会触发 _dispatchMessage 方法执行 webview 环境的的 js 逻辑，将生成的包含 responseId 的 message 返回给webview。

如果从 native 获取到的 message 中有 responseId，说明这个 message 是 JS 调 Native 之后回调接收的 message，所以从一开始 sendData 中添加的 responseCallbacks 中根据 responseId（一开始存的时候是用的callbackId，两个值是相同的）取出这个回调函数并执行，这样就完成了一次 JS 调用 Native 的流程。

![jsbridge2](/blog/images/mobile/jsbridge2.png)

1、native 端注册 jsb。

2、webview 侧创建 iframe，设置 src 为 `__bridge_load__。`

3、native 端捕获请求，注入jsb初始化代码，在window上挂载相关对象和方法。

4、webview 侧调用 `callHandler`方法，并在 `responseCallback` 上添加 `callbackId: responseCallback`，并修改 iframe 的 src，触发捕获。

5、native 收到 message，生成一个 `responseCallback`，并执行 native 侧注册好的方法

6、native 执行完毕后，通过 webview 执行`_handleMessageFromObjC`方法，取出 callback 函数，并执行。

#### 优缺点

- 优点：JavaScript 端可以确定 JSBridge 的存在，直接调用即可。
- 缺点：如果桥的实现方式有更改，JSBridge 需要兼容多版本的 Native Bridge 或者 Native Bridge 兼容多版本的 JSBridge。。

### native 调用 webview

native 调用 webview 注册的 jsb 的逻辑是相似的，不过就不是通过触发 iframe 的 src 触发执行的了，因为 Native 可以自己主动调用 JS侧的方法。其具体过程如下图：

![jsbridge3](/blog/images/mobile/jsbridge3.png)

1、native 侧调用`callHandler`方法，并在 `responseCallback`上添加 `callbackId: responseCallback`。

2、native 侧主动调用 `_handleMessageFromObjC` 方法，在webview中执行对应的逻辑。

3、webview 侧执行结束后，生成带有 `responseId` 的 message，添加到 `sendMessageQueue` 中，并修改 iframe 的 src 为`__wvjb_queue_message__`。

4、native 端拦截到 url 变化，调用 webview 的逻辑获取到 message，拿到 `responseId`，并执行对应的 callback 函数。

#### 优缺点

- 优点：桥的版本很容易与 Native 保持一致，Native 端不用对不同版本的 JSBridge 进行兼容。
- 缺点：注入时机不确定，需要实现注入失败后重试的机制，保证注入的成功率，同时 JavaScript 端在调用接口时，需要优先判断 JSBridge 是否已经注入成功。


## 最佳实践

最佳实践的 JSBridge 要求做到以下几点：

- 官方认可，符合规范
- 跨平台通用
- APP 内和 APP 外规范通用
- 安全可靠
- 约定大于配置的原则

综合上文介绍的内容，JSBridge 的最佳实践是：

1. 协议规范都使用：`hybrid://action/method?arg1=xxx&arg2=xxx`
2. iOS 使用 Universal Link 和 UIWebview 的 `delegate`
3. 安卓使用 `shouldOverrideUrlLoading` 和 Applink

### 规范和约定

先理解下 URL scheme的组成部分：

```js
yourappscheme://module/action?arg1=x&arg2=x&ios_version=xxx&andr_version=xxx&upgrade=1/0&callback=xxx&sendlog=1/0
```

- 整体小写
- `yourappscheme`：就是你的 scheme，可辨识，别冲突，通过这个可以进行 Universal Link 和 Applink 的分发
- `module` 和 `action`：某个模块组件的某个方法
- `?`后面是 `querystring`，这里预定了几个特殊的参数：
  - `ios_version/andr_version`：非必须，iOS 和安卓的最小版本，即本协议从哪个版本开始支持的，低版本不支持则忽略，配合 upgrade 使用进行 APP 升级
  - `upgrade`：是否强制升级，即当版本低于设置的 ios/andr_version 是否弹出提示用户升级的对话框（yourappscheme 已经可以调起 app，只不过功能可能因为版本低不支持，这时候可以引导用户升级）
  - `callback`：异步回调函数，下面详细树下 callback 的最佳实践
  - `sendlog`：调起后是否打点发送日志
  示例：

```js
// 账号相关
// 打开用户个人主页
fb://account/userprofile?id=xxx

// 打开登录界面
fb://account/login?callback=xxx

// 工具类
// 获取定位
fb://utils/getgeolocation?callback=xx
```

### 回调方法设计

当 Native 操作成功之后，会将处理结束后的结果或者数据通过 `callback` 回调传给 Web，当然有成果就又失败，`callback` 的参数设计有两种方式：

#### 错误优先

即下面的回调方法格式：

```js
function callback(error, data) {
  if (error) {
    throw error;
  }
  console.log(data);
}
```

#### JSON 结构

即回调方法只接收一个 JSON 对象，JSON 格式如下：

```json
{
  "error_code": 0,
  "data": {}
}
```

### 预留升级/日志能力

做 APP 开发经常会遇见下面的问题：

1. 功能/端能力是从某个版本开始的，低版本用不了，但是 `scheme` 还是会调起 APP。
2. 对于低版本，PM 希望提示用户升级
3. 统计调起成功率，分发次数之类的统计需求

`scheme` 的 `querystring` 部分由 `ios_version/andr_version` 和 `upgrade` 这三个成对的参数，可以解决升级问题，`sendlog` 解决日志统计问题。

- `ios_version/andr_version`：是标示该协议的最低支持版本，如果低于这个版本可能因为功能并未实现而能识别。
- `upgrade`：是是否强制低版本弹出升级对话框
- `sendlog`：当为 1 的时候，则发送调起成功失败之类的统计需求

### 简易代码实现

简单封装下 JSBridge 调用的方法，参数如下：

- `module`：类名称，如果 `account`
- `action`：具体操作方法，如 `login`
- `args`：非必须，协议参数，支持 `string` 和对象
- `callback`：非必须，回调单独提出来，方便全局方法命名

具体代码如下

```js
function invoke(module, action, args, callback) {
  let scheme = `yourappscheme://${module}/${action}?`;
  if (isFunction(args)) {
    callback = args;
    args = null;
  }
  // 处理下参数
  if (isString(args)) {
    scheme += args;
  } else if (isObject(args)) {
    each(args, (k, v) => {
      if (isObject(v) || isArray(v)) {
        v = JSON.stringify(v);
      }
      scheme += `${k}=${v}`;
    });
  }
  // callback 独立传，方便全局函数名命名
  if (isFunction(callback)) {
    var funcName = '_jsbridge_cb_' + getId();
    window[funcName] = function() {
      callback.apply(window, [].slice.call(arguments, 0));
    };
    scheme += (!~scheme.indexOf('?') ? '&' : '?') + `callback=${funcName}`;
  }

  if (os.ios && versionCompare(os.version, '9.0') >= 0) {
    window.location.href = scheme;
  } else {
    var $node = document.createElement('iframe');
    $node.style.display = 'none';
    $node.src = scheme;
    var body = document.body || document.getElementsByTagName('body')[0];
    body.appendChild($node);
    setTimeout(function() {
      body.removeChild($node);
      $node = null;
    }, 10);
  }
}
```

[JSBridge 初探](https://juejin.cn/post/6844904070881214471#heading-8)

[App实现JSBridge的最佳方案](https://juejin.cn/post/7177407635317063735)

[H5与Native交互之JSBridge技术](https://juejin.cn/post/6844903491970793480#heading-1)
