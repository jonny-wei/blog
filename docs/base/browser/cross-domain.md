# 跨域

## 什么是同源

页面的协议，域名和端口都相同，则属于同一源，否则就是非同源

## 什么是同源策略(SOP：Same-Origin Policy)

同源策略是对浏览器的安全保护机制。

同源策略是浏览器的行为，是为了保护本地数据不被JavaScript代码获取回来的数据污染，因此拦截的是客户端发出请求后响应回来的数据。即请求发送了，服务器响应了，但是无法被浏览器接收。

这是一个用于隔离潜在恶意文件的重要安全机制。（请求发送了，服务器也响应了，但是浏览器检测到如果是不同源，就会根据同源策略拦截响应后返回来的数据，无法接收）。

缺少了同源策略，浏览器很容易受到XSS、CSFR等攻击

## 什么是同源策略限制(不同源的3类交互分类)

- 允许跨域写操作（Cross-origin writes）。例如：链接，重定向，表单提交，特定少数的 `http请求` 需要添加 `preflight`。
- 允许跨域资源嵌入（Cross-origin embedding），例如：img，script等 标签
- 不允许跨域读操作（Cross-origin reads），但可以通过内嵌资源来巧妙的进行读取访问。

## 浏览器从哪几方面做同源策略限制

- Cookie、LocalStorage 和 IndexDB 同源策略

> 禁止读取存储在不同源下的 Cookie，LocalStorage 和 IndexDB。

- DOM同源策略

> 禁止对不同源页面的 DOM 进行操作，DOM 和 JS 对象无法获得。主要包括 iframe、canvas 之类的。

- XMLHttpRequest同源策略

> 禁止不同源的 AJAX 请求，主要用来防止 CSRF 攻击。
> 浏览器中，script，img、link 等标签都可以加载跨域资源，而不受同源限制，但浏览器限制了 JavaScript 的权限使其不能读、写加载的内容。
> 因为script标签引入的文件不能够被客户端的 js 获取到, 不会影响到原页面的安全，所以 script 不受同源限制。

## 什么是跨域

非同源请求，均是跨域。只要协议、域名、端口号其中任意一者不同，均属跨域。

须知：跨域请求是浏览器根据同源策略对请求的限制，但服务器仍然能收到客户端请求，服务器之间的通信不存在跨域问题。(跨域是浏览器行为)

## 什么时候需要跨域

- XMLHttpRequest 或 Fetch 发起的跨源 HTTP 请求。
- Web 字体 (CSS 中通过 @font-face 使用跨源字体资源)。
- WebGL 贴图。
- 使用 drawImage 将 images/video 绘制到 canvas。
- 此外有样式表，脚本等。

## 为什么出现跨域问题(跨域产生的条件)

由于浏览器同源策略的限制，浏览器会拒绝跨域请求（确切的说是拒绝跨域读操作）。

## 如何解决跨域(9种跨域解决方案)

- document.domain + iframe跨域
- location.hash + iframe跨域
- window.name + iframe跨域
- postMessage跨域
- 通过jsonp跨域
- 跨域资源共享（CORS）
- WebSocket协议跨域
- nginx代理跨域
- nodejs中间件代理跨域

### (一)跨域解决原理一document.domain + iframe跨域

此方案仅限主域相同，子域不同的跨域应用场景。

实现原理：

两个页面都通过js强制设置document.domain为基础主域，就实现了同域。document.domain 的设置是有限制的，只能设置成自身或者更高级的父域，且主域必须相同。

例如：

```HTML
// 父窗口为https://www.baidu.com
// 跨域请求子窗口数据
<iframe id="iframe" src=" https://www.doc.baidu.com/b.html"></iframe>
<script>
 // 设置为基础域名
    document.domain = baidu.com';
    var user = 'admin';
</script>
// 子窗口为https://www.doc.baidu.com
<script>
    document.domain = baidu.com';
    // 获取父窗口中变量
    alert(‘get js data from parent --->’+window.parent.user);
</script>
```

### (二)跨域解决原理二location.hash + iframe跨域

实现原理：

a欲与b跨域相互通信，通过中间页c来实现。 三个页面，不同域之间利用iframe的location.hash传值，相同域之间直接js访问来通信。a与b不同域只能通过hash值单向通信，b与c也不同域也只能单向通信，但c与a同域，所以c可通过parent.parent访问a页面所有对象。

因为父窗口可以对iframe进行URL读写，iframe也可以读写父窗口的URL，URL有一部分被称为hash，就是#号及其后面的字符，它一般用于浏览器锚点定位，Server端并不关心这部分，应该说HTTP请求过程中不会携带hash，所以这部分的修改不会产生HTTP请求，但是会产生浏览器历史记录。

此方法的原理就是改变URL的hash部分来进行双向通信。每个window通过改变其他 window的location来发送消息（由于两个页面不在同一个域下IE、Chrome不允许修改parent.location.hash的值，所以要借助于父窗口域名下的一个代理iframe），并通过监听自己的URL的变化来接收消息。这个方式的通信会造成一些不必要的浏览器历史记录，而且有些浏览器不支持onhashchange事件，需要轮询来获知URL的改变，

最后，这样做也存在缺点，诸如数据直接暴露在了url中，数据容量和类型都有限等。

例如：

```javascript
/**
 * A页面：
 * a.html 传送数据到 b.html
 * a.html 下修改 iframe 的 src 为 google.com/b.html#paco
 * b.html 监听到url发生变化，触发相应操作
 */
 /** 
 * B页面：b.html 传送数据到 a.html
 * 由于两个页面不在同一个域下 IE、Chrome 不允许修改 parent.location.hash 的值，
 * 所以要借助于父窗口域名下的一个代理iframe。
 * b.html 下创建一个隐藏的 iframe，此 iframe 的 src 是 baidu.com 域下的，
 * 并挂上要传送的 hash 数据，如 src="www.baidu.com/proxy.html# 传输的数据"
 * b.html页面的关键代码如下:
 */
try {  
    parent.location.hash = 'data';  
} catch (e) {  
    // ie、chrome的安全机制无法修改parent.location.hash，  
    var ifrproxy = document.createElement('iframe');  
    ifrproxy.style.display = 'none';  
    ifrproxy.src = "http://www.baidu.com/proxy.html#data";  
    document.body.appendChild(ifrproxy);  
}
/** 
 * C页面：
 * proxy.html监听
 * proxy.html监听到url发生变化，修改a.html的url（因为a.html和proxy.html同域，
 * 所以proxy.html可修改a.html的url hash）a.html监听到url发生变化，触发相操作。
 * proxy.html页面的关键代码如下 :
 */

//因为parent.parent（即baidu.com/a.html）和baidu.com/proxy.html属于同一个域，所以可以改变其location.hash的值  
parent.parent.location.hash = self.location.hash.substring(1);

```

### (三)跨域解决原理三window.name + iframe跨域

window对象有个name属性，该属性有个特征：即在一个窗口(window)的生命周期内,窗口载入的所有的页面都共享一个window.name，
每个页面对window.name都有读写的权限，window.name是持久存在一个窗口载入过的所有页面中的，并不会因新页面的载入而进行重置。
window.name属性的独特之处在于：name值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的 name 值（2MB）。
如果在一个标签里面跳转网页的话，我们的 window.name 是不会改变的。

基于这个思想，我们可以在某个页面设置好 window.name 的值，然后跳转到另外一个页面。
在这个页面中就可以获取到我们刚刚设置的 window.name 了。由于安全原因，浏览器始终会保持 window.name 是string 类型。

location.hash + iframe跨域和window.name + iframe跨域都是通过中间代理页实现。

### (四)跨域解决原理四postMessage跨域

postMessage是HTML5 XMLHttpRequest Level 2中的API，且是为数不多可以跨域操作的window属性之一，它可用于解决以下方面的问题：

- 页面和其打开的新窗口的数据传递
- 多窗口之间消息传递
- 页面与嵌套的iframe消息传递
- 上面三个场景的跨域数据传递

用法：

postMessage(data,origin)方法接受两个参数

- data： html5规范支持任意基本类型或可复制的对象，但部分浏览器只支持字符串，所以传参时最好用JSON.stringify()序列化。
- origin： 协议+主机+端口号，也可以设置为"*"，表示可以传递给任意窗口，如果要指定和当前窗口同源的话设置为"/"。

### (五)跨域解决原理五JSONP跨域

因为通过script标签引入的js是不受同源策略的限制的。所以我们可以通过script标签引入一个js或者是一个其他后缀形式（如php，jsp等）的文件，此文件引入后，触发回调，返回一个js函数的调用。基于此原理，我们可以通过动态创建script，再请求一个带参网址实现跨域通信。

JSONP 是一种非正式传输协议，允许用户传递一个callback给服务端，然后服务端返回数据时会将这个callback 参数作为函数名来包裹住 JSON 数据，这样客户端就可以随意定制自己的函数来自动处理返回数据了。当GET请求从后台页面返回时，可以返回一段JavaScript代码，这段代码会自动执行，可以用来负责调用后台页面中的一个callback函数。

- 优点：兼容性好
- 缺点：只支持GET请求

```js
const jsonp = ({ url, params, callbackName }) => {
  const generateUrl = () => {
    let dataSrc = "";
    for (let key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        dataSrc += `${key}=${params[key]}&`;
      }
    }
    dataSrc += `callback=${callbackName}`;
    return `${url}?${dataSrc}`;
  };
  return new Promise((resolve, reject) => {
    const scriptEle = document.createElement("script");
    scriptEle.src = generateUrl();
    document.body.appendChild(scriptEle);
    window[callbackName] = (data) => {
      resolve(data);
      document.removeChild(scriptEle);
    };
  });
};

this.$http.jsonp('http://www.domain2.com:8080/login', {
    params: {},
    jsonp: 'handleCallback' // 自定义回调函数
}).then((res) => {
    console.log(res); 
})
```

### (六)跨域解决原理六CORS跨域(跨域资源共享)

CORS（跨域资源共享Cross-origin resource sharing） 是W3C 推荐的一种新的官方方案，能使服务器支持 XMLHttpRequest 的跨域请求。

它允许浏览器向跨源服务器，发出XMLHttpRequest请求，从而克服了AJAX只能同源使用的限制。CORS 实现起来非常方便，只需要增加一些 HTTP 头，让服务器能声明允许的访问来源。

基本思想就是使用自定义的HTTP头部让浏览器与服务器进行沟通，从而决定请求或响应是应该成功还是失败。
目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。整个CORS通信过程，都是浏览器自动完成，不需要用户参与。

普通跨域请求：在服务端设置Access-Control-Allow-Origin即可，前端无须设置，若要带cookie请求：前后端都需要设置。

CORS请求分两类：

简单请求（simple request）和非简单请求（not-so-simple request）。

#### (1) 简单请求需满足以下条件，否则都是非简单请求

- 请求方法是以下三种方法之一：
  - HEAD
  - GET
  - POST
- HTTP的头信息不超出以下几种字段：
  - Accept
  - Accept-Language
  - Content-Language
  - Last-Event-ID
  - Content-Type：只限于三个值 application/x-www-form-urlencoded、multipart/form-data、text/plain

#### (2) 非简单请求

服务器有特殊要求的请求，比如请求方法是 PUT 或 DELETE，或者 Content-Type 字段的类型是 application/json。
非简单请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为"预检"请求（preflight）。
浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段。
只有得到肯定答复，浏览器才会发出正式的XMLHttpRequest请求，否则就报错。

几个字段说明：

- Access-Control-Allow-Origin：必须。它的值是请求时Origin字段的值，或者是一个*，表示接受任意域名的请求。
- Access-Control-Allow-Credentials：可选。表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可。
- Access-Control-Expose-Headers：可选。CORS请求时，XMLHttpRequest对象的getResponseHeader()方法只能拿到6个基本字段：Cache-Control、Content-Language
- Content-Type、Expires、Last-Modified、Pragma。如果想拿到其他字段，就必须在Access-Control-Expose-Headers里面指定。
- Access-Control-Request-Method：必须。用来列出浏览器的CORS请求会用到哪些HTTP方法。注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。
- Access-Control-Request-Headers：该字段是一个逗号分隔的字符串，指定浏览器CORS请求会额外发送的头信息字段。
- Access-Control-Max-Age：可选。指定本次预检请求的有效期，单位为秒。
::: tip 关于 Cookie
CORS请求默认不发送Cookie和HTTP认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定Access-Control-Allow-Credentials字段。另一方面需要在AJAX中打开打开withCredentials属性。如果要发送Cookie，Access-Control-Allow-Origin就不能设为星号，必须指定明确的、与请求网页一致的域名。同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的document.cookie也无法读取服务器域名下的Cookie。
:::

CORS优点：支持所有类型的HTTP请求。使用CORS，开发者可以使用普通的XMLHttpRequest发起请求和获得数据，比起JSONP有更好的错误处理。

CORS缺点：低版本IE不支持(小于IE10)

### (七)跨域解决原理七webSocket跨域

WebSocket protocol是HTML5一种新的协议。它实现了浏览器与服务器全双工通信，同时允许跨域通讯，是server push技术的一种很好的实现。

我们所指的跨域是浏览器与服务器基于http通信时，浏览器同源策略的限制。
而WebSocket不是基于http的，而是与http处于同层(应用层)，
但WebSocket与TCP/IP建立连接是通过http协议传输的，建立连接后，真正的数据传送不再需要http。
所以，WebSocket没有同源限制，允许跨域通信。
全双工通信，客户端和服务端均可主动推送消息。
实时性和灵活性高。

### (八)跨域解决原理八Nginx跨域

跨域原理：同源策略是浏览器的安全策略，不是HTTP协议的一部分。

服务器端调用HTTP接口只是使用HTTP协议，不会执行JS脚本，不需要同源策略，也就不存在跨越问题。

在此理论基础上通过Nginx配置一个反向代理服务器，从而实现跨域。

实现思路：通过nginx配置一个代理服务器（域名与domain1相同，端口不同）做跳板机，反向代理访问domain2接口，并且可以顺便修改cookie中domain信息，方便当前域cookie写入，实现跨域登录。

### (九)跨域解决原理九Node跨域

原理和Nginx一样，通过代理服务器。node中间件实现跨域代理，是通过启一个代理服务器，实现数据的转发，
也可以通过设 cookieDomainRewrite 参数修改响应头中cookie中域名，实现当前域的cookie写入，方便接口登录认证。

## 跨标签页通信

跨标签页通信是指在同一个浏览器的不同标签页或窗口之间进行数据交换。以下是一些常见的跨标签页通信方式：

- BroadcastChannel
- ServiceWorker
- SharedWorker
- localStorage + window.onstorage
- window.open + window.postMessage
- IndexedDB + 定时器轮询（setInterval）
- Cookie + 定时器轮询（setInterval）
- WebSockets
- URL 参数

### BroadcastChannel API

`Broadcast Channel API` 允许同源下的不同浏览器标签页、iframe 或 workers 之间进行简单的消息传递。这种机制基于发布-订阅模式，使得一个窗口可以向所有其他窗口发送消息，这些消息会被广播到所有监听相同频道的其他 BroadcastChannel 对象，但不会向发送消息的窗口触发事件。

- 它遵循浏览器的同源策略，即只有在同一个协议、主机和端口下的窗口才能进行通信。
- 它不支持跨浏览器通信，即不同浏览器间的标签页无法通过 BroadcastChannel 进行通信。
- 它允许发送任意类型的数据，包括字符串、对象、数组、Blob 等。
- 它不会向发送消息的窗口触发 message 事件，即发送者不会接收到自己发送的消息。

BroadcastChannel 是一种简单且高效的方式来实现同源窗口间的实时通信，适用于需要实时更新多个标签页的场景，如实时协作工具、多标签页数据同步等，但也存在一些缺点：

- 同源限制：只能在同源上下文之间通信，不同源的页面无法使用 BroadcastChannel 进行通信
- 不持久化：传递的消息不会持久化，页面刷新或关闭后，之前的消息无法再获取
- 消息大小限制：BroadcastChannel 消息的大小限制约为 1MB
- 不支持文件传输：BroadcastChannel 不支持文件传输

```javascript
// 在一个标签页中发送消息
const channel = new BroadcastChannel('myChannel');
channel.postMessage('Hello from Tab 1!');

// 在另一个标签页中接收消息
const channel = new BroadcastChannel('myChannel');
channel.onmessage = function(event) {
  console.log(event.data);
};
```

### ServiceWorker

Service Worker 是一种在浏览器后台运行的脚本，它为网络应用提供了离线体验、消息推送和后台同步等能力。通过拦截和处理网络请求，Service Worker 能够缓存资源，使得网站在没有网络连接的情况下仍然可以被访问。它还支持推送通知，允许网站在服务器端发送消息时，即使用户没有打开网页，也能接收到实时通知。Service Worker 运行在主线程之外，不会影响页面的性能，但它需要仔细管理其生命周期和更新逻辑。与 Web Workers 和 SharedWorkers 不同，Service Worker 更专注于网络请求和缓存管理，适用于实现跨页面通信和提供离线功能。推送通知可以是标准的、静默的、交互式的，或者是基于特定事件和时间的，它们可以包含自定义消息，并支持用户交互。实现 Service Worker 推送通知需要考虑用户权限、服务器支持以及安全传输，同时还需要处理用户的交互事件，以提供流畅的用户体验。尽管 Service Worker 提供了强大的功能，但它也要求开发者对缓存策略和数据一致性进行细致的设计。

1. **后台线程**：Service Worker 运行在浏览器的后台，独立于网页线程，不会影响页面的性能和响应速度。
2. **网络代理**：Service Worker 可以拦截和处理网页请求，允许开发者控制如何响应这些请求，包括使用缓存的资源或从网络获取数据。
3. **离线缓存**：Service Worker 可以缓存资源，包括 HTML、CSS、JavaScript 和图像等，从而提供更快的加载速度和离线访问能力。
4. **生命周期管理**：Service Worker 有明确的生命周期，包括安装、激活和终止阶段，允许开发者在不同阶段执行不同的操作。

#### 使用场景

1. **离线体验**：通过缓存资源，Service Worker 可以实现应用的离线访问，即使在没有网络连接的情况下，用户也可以访问和使用应用。
2. **推送通知**：Service Worker 可以接收来自服务器的推送消息，即使页面未打开，也可以向用户发送通知。
3. **后台同步**：Service Worker 可以在用户与网页交互的间隙，处理一些耗时的后台任务，如数据同步、索引构建等。
4. **性能优化**：通过预先缓存资源和拦截网络请求，Service Worker 可以提高网页的加载速度和响应性能。

#### 优缺点

**优点**：

- 提供离线体验和更快的加载速度。
- 支持推送通知和后台同步功能。
- 允许更细粒度的缓存控制和缓存策略定制。
- 可以在后台执行任务，不阻塞主线程。

**缺点**：

- 需要处理 Service Worker 的生命周期和更新逻辑。
- 调试可能比普通的前端代码更复杂。
- 需要对缓存策略进行仔细设计，以确保数据的一致性。

#### Service Worker 与其他 Worker 的区别

- **Web Workers**：主要用于在后台执行计算密集型任务，避免阻塞主线程。它们与主线程之间可以通过 `postMessage` 进行通信，但不能直接访问 DOM 或进行网络请求的拦截。
- **SharedWorkers**：允许多个页面或标签页共享同一个 Worker 实例，适用于需要在多个上下文之间共享数据的场景。SharedWorker 可以被多个文档访问，但每个文档都需要独立地连接到 SharedWorker。
- **Service Workers**：专注于处理网络请求和缓存数据，提供离线访问和推送通知等功能。它们运行在浏览器的后台，独立于网页运行，并可以在网页关闭后继续运行。

```js
// 页面端代码

// 检查浏览器是否支持ServiceWorker
if ("serviceWorker" in navigator && navigator.serviceWorker) {
  // 注册ServiceWorker
  navigator.serviceWorker.register('sw.js').then(function(registration) {
    console.log('ServiceWorker 注册成功:', registration);
    
    // 注册成功后，发送消息给ServiceWorker
    registration.installing.postMessage({
      'message': 'Hello from the main page!'
    });
  }).catch(function(error) {
    console.log('ServiceWorker 注册失败:', error);
  });

  // 监听ServiceWorker发送的消息
  navigator.serviceWorker.addEventListener('message', function(event) {
    console.log('Received message from ServiceWorker:', event.data);
  });

  // 使用MessageChannel与ServiceWorker通信
  const messageChannel = new MessageChannel();
  navigator.serviceWorker.controller.postMessage('setup', [messageChannel.port2]);
  messageChannel.port1.onmessage = function(event) {
    console.log('Received from ServiceWorker via MessageChannel:', event.data);
  };
}

// ServiceWorker端代码

// 监听消息事件，接收页面发送的消息
self.addEventListener('message', function(event) {
  console.log('Received message from main page:', event.data);
  
  // 根据消息内容进行处理
  if (event.data.message) {
    event.source.postMessage({
      'message': 'Message received by ServiceWorker'
    });
  }
});

// 监听MessageChannel的端口消息
self.addEventListener('message', function(event) {
  if (event.data === 'setup') {
    const port = event.ports[0];
    port.onmessage = function(event) {
      console.log('Received from main page via MessageChannel:', event.data);
      port.postMessage('Hello back from ServiceWorker via MessageChannel!');
    };
  }
});
```

1. **页面端代码**：
   - 首先检查浏览器是否支持ServiceWorker。
   - 注册ServiceWorker，并在注册成功后发送消息。
   - 监听ServiceWorker发送的消息。
   - 使用`MessageChannel`与ServiceWorker建立持久通信。

2. **ServiceWorker端代码**：
   - 监听`message`事件，接收页面发送的消息，并根据消息内容进行处理。
   - 当接收到`MessageChannel`的设置请求时，建立通信并发送消息。

### SharedWorker

SharedWorker 运行在浏览器的主线程之外，提供一个后台线程，可以在多个页面之间共享。当多个页面创建了指向同一个 SharedWorker 的连接时，它们共享同一个 worker 实例，可以通过 `MessagePort` 进行通信。SharedWorker 通过 `onconnect` 事件来接受新的连接，并使用 `ports` 集合来管理这些连接。

SharedWorker 是一种特殊的 Web Worker，它允许在多个浏览器上下文（例如多个页面、iframe 或其他 workers）之间共享一个后台线程。

- 优点
  
  1. **跨页面通信**：允许在多个浏览器窗口或标签页之间共享数据，实现信息的实时同步和交互 。
  2. **后台线程处理**：在主线程之外运行，不会阻塞用户界面，提升响应性和性能。
  3. **资源共享**：减少网络请求，提高页面加载速度 。
  4. **与Service Worker相比更简单**：专注于跨页面通信和后台线程处理，相对更为简单和轻量级 。

- 缺点

  1. **同源限制**：只能与创建它的页面（同源）进行通信，限制了其在跨域通信场景中的应用 。
  2. **异步操作问题**：如果在 `onconnected` 之前执行了异步操作，可能会导致通信异常 。
  3. **资源消耗**：需要消耗一定的系统资源（如内存和CPU），如果创建过多的 SharedWorker 或处理大量的数据，可能会对系统性能造成负面影响 。
  4. **调试和错误处理**：由于在后台运行，其调试和错误处理相对较为困难 。

- 与其他 Worker 的区别

- **普通 Worker**：只能在创建它的页面中使用，不与其他页面共享数据。
- **SharedWorker**：可以在多个同源的页面之间共享数据和状态，适用于需要跨页面通信的场景。
- **ServiceWorker**：作为浏览器和网络请求之间的代理，主要用于实现离线体验、推送通知和后台同步等功能，通常用于提供网络优化和缓存资源 。

SharedWorker 提供了一种在多个页面之间共享数据和后台处理能力的机制，适用于需要实时数据共享和协作的应用场景。然而，开发者需要注意其同源限制、资源消耗和调试难度等问题。

```javascript
// 创建 Shared Worker
var myWorker = new SharedWorker('worker.js');
     
// 向 worker 发送消息
myWorker.port.start();
myWorker.port.postMessage('Hello, worker!');
     
// 接收 worker 的消息
myWorker.port.onmessage = function(event) {
  console.log('Received message:', event.data);
};
```

SharedWorker 可以通过以下几种方式优化页面加载速度：

1. **减少重复的网络请求**：通过 SharedWorker，可以将数据获取的逻辑集中处理，这样多个标签页或页面可以共享同一个数据获取任务，而不是每个页面都独立发起请求。这减少了服务器的负载，也减少了网络请求的次数，从而加快了页面的加载速度。

2. **数据缓存和共享**：SharedWorker 可以作为多个页面共享的数据缓存中心。页面可以通过 SharedWorker 存储和访问共享数据，避免了重复的数据加载和处理，从而提高了页面加载的速度。

3. **后台处理耗时任务**：SharedWorker 可以在后台执行耗时的任务，如数据的预处理和计算，这样主线程可以专注于渲染和交互，不会被耗时的计算任务阻塞，提高了页面的响应速度和加载性能。

4. **优化轮询请求**：使用 SharedWorker 可以优化前端的轮询请求。通过在 SharedWorker 中实现轮询逻辑，所有连接到该 SharedWorker 的页面都可以接收到最新的数据，而不需要每个页面独立进行轮询，这样可以减少资源消耗，提高响应时间，并增强应用程序的可扩展性。

5. **预加载关键资源**：虽然 SharedWorker 本身不直接支持预加载，但可以通过 SharedWorker 来协调不同页面的资源预加载策略，确保关键资源在需要之前就被加载和缓存，从而减少页面加载时的等待时间。

6. **跨页面状态同步**：SharedWorker 允许多个页面共享状态和事件，这意味着可以跨页面同步用户的操作和应用状态，而不需要重新加载页面或发起额外的网络请求，这可以提供更流畅的用户体验并减少页面加载时间。

7. **避免资源竞争**：当多个标签页或页面需要访问相同资源时，SharedWorker 可以协调这些请求，避免资源竞争和重复加载，从而提高资源加载效率。

总的来说，SharedWorker 通过提供跨页面的数据共享和后台处理能力，有助于减少网络请求、提高资源利用效率、加快数据处理速度，从而优化页面的加载性能。

### localStorage + window.onstorage

当一个标签页修改了 `localStorage` 或 `sessionStorage` 中的数据时，会触发 `storage` 事件，其他监听了这个事件的标签页可以响应这个变化，从而实现数据的同步。

```javascript
// 监听 storage 事件
window.addEventListener('storage', function(e) {
    if (e.key === 'myKey') {
    console.log('Data changed:', e.newValue);
  }
});
// 修改数据
localStorage.setItem('myKey', 'newValue');
```

### window.open + window.postMessage

`postMessage` 方法允许跨文档通信，可以在不同的标签页、窗口或者嵌入的 iframe 之间传递消息。

```javascript
// 发送消息
window.open('http://example.com', '_blank').postMessage('Hello', 'http://example.com');
// 接收消息
window.addEventListener('message', function(event) {
  if (event.origin === 'http://example.com') {
    console.log('Received message:', event.data);
  }
}, false);
```

### IndexedDB + 定时器轮询（setInterval）

IndexedDB是一种在浏览器中存储大量结构化数据的Web API。通过定时器轮询（setInterval），一个标签页可以定期检查IndexedDB中的数据变化，并将这些变化通知到其他标签页。

```js
// 打开或创建 IndexedDB 数据库
const request = indexedDB.open('messageDatabase', 1);
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  // 创建一个对象存储空间用于存储消息
  db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
};
request.onsuccess = function(event) {
  const db = event.target.result;
  // 向数据库中添加一条新消息
  const transaction = db.transaction(['messages'], 'readwrite');
  const objectStore = transaction.objectStore('messages');
  const message = { content: 'Hello from sender!' };
  objectStore.add(message);
  transaction.oncomplete = function() {
    console.log('Message sent successfully!');
    // 关闭数据库连接
    db.close();
  };
};
request.onerror = function(event) {
  console.error('Error opening database:', event.target.error);
};

// 打开或创建 IndexedDB 数据库
const request = indexedDB.open('messageDatabase', 1);
request.onsuccess = function(event) {
  const db = event.target.result;
  // 创建一个定时器，每隔一段时间轮询数据库中的消息
  setInterval(function() {
    // 创建一个事务
    const transaction = db.transaction(['messages'], 'readwrite');
    const objectStore = transaction.objectStore('messages');
    // 获取存储在对象存储中的所有消息
    const request = objectStore.getAll();
    request.onsuccess = function(event) {
      const messages = event.target.result;
      // 处理消息
      messages.forEach(function(message) {
        console.log('Received message:', message.content);
        // 在处理完消息后，删除该消息
        objectStore.delete(message.id);
      });
      // 关闭事务
      transaction.oncomplete = function() {
        console.log('Messages processed successfully!');
      };
    };
    request.onerror = function(event) {
      console.error('Error retrieving messages:', event.target.error);
      // 关闭事务
      transaction.abort();
    };
  }, 1000);
};
request.onerror = function(event) {
  console.error('Error opening database:', event.target.error);
};
```

### Cookie + 定时器轮询（setInterval）

Cookie 是一种在浏览器和服务器之间传递的小型文本文件，可以用于在多个标签页之间共享数据。可以使用 setInterval 定时轮询 Cookie 来实现跨标签页通信。

在使用 Cookie 进行跨标签页通信时，需要注意以下几点：

- 跨域名通信：Cookie 默认只能在同一域名下共享。如果需要在不同域名下进行跨标签页通信，需要设置合适的域名和路径。
- Cookie 大小限制：Cookie 的大小有限制，通常为几 KB。如果消息较大，可能需要拆分成多个 Cookie 进行存储。
- 安全性考虑：Cookie 中的数据可以被用户和其他脚本访问和修改。因此，不适合存储敏感信息。 以上示例提供了一个基本的框架来演示如何使用 Cookie 实现跨标签页通信。在实际应用中，您可能需要更复杂的逻辑来处理跨标签页通信，并确保数据同步和一致性。

```js
// 创建一个定时器，每隔一段时间轮询 Cookie 中的数据
setInterval(function () {
  // 获取存储在 Cookie 中的消息
  const cookies = document.cookie.split(';')
  let message = ''
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith('message=')) {
      message = cookie.substring('message='.length)
      break
    }
  }
  // 处理消息
  if (message) {
    console.log('Received message:', decodeURIComponent(message))
    // 清除 Cookie
    document.cookie = 'message=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }
}, 1000)
```

### WebSockets

WebSockets提供全双工通信机制，允许服务器和客户端之间进行实时、双向的通信。通过WebSockets，不同标签页可以订阅相同的事件，并接收服务器推送的消息。

```js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    // 广播消息给所有连接的客户端
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// 在发送消息的标签页中
const socket = new WebSocket('ws://localhost:8080');
socket.onopen = function(event) {
  // 连接打开后可以发送消息
  socket.send('Hello from Tab 1!');
};

// 在接收消息的标签页中
const socket = new WebSocket('ws://localhost:8080');
socket.onmessage = function(event) {
  console.log('Received message:', event.data);
};
```

### URL 参数

通过在 URL 中传递参数，可以在不同标签页间共享简单的数据，比如分享一个带有特定查询参数的链接

```js
// 打开新标签页并传递参数
window.open('http://example.com?param=value', '_blank');

// 在新标签页中获取参数
const params = new URLSearchParams(window.location.search);
const paramValue = params.get('param');
console.log('Received parameter:', paramValue);
```
