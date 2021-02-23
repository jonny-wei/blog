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

-  DOM同源策略

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

#### (1) 简单请求需满足以下条件，否则都是非简单请求：
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

#### (2) 非简单请求：

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
