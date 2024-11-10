# 浏览器存储

存储方式：

- cookie
- webStorage(localStorage和sessionStorage)
- indexedDB

## Cookie

### 目的

Cookie诞生之初的作用就是解决HTTP的无状态请求，用来记录一些用户相关的一些状态。

- 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
- 个性化设置（如用户自定义设置、主题等）
- 浏览器行为跟踪（如跟踪分析用户行为等）

Cookie 本质上就是浏览器里面存储的一个很小的文本文件，内部以键值对的方式来存储(在chrome开发者面板的Application这一栏可以看到)。向同一个域名下发送请求，都会携带相同的 Cookie，服务器拿到 Cookie 进行解析，便能拿到客户端的状态。

### 缺点

h5之前，存储主要用cookies，缺点：

- 容量缺陷。大小限制4k。
- 性能缺陷。请求头上带着数据，导致流量增加。Cookie 紧跟域名，不管域名下面的某一个地址需不需要这个 Cookie ，请求都会携带上完整的 Cookie，这样随着请求数的增多，其实会造成巨大的性能浪费的，因为请求携带了很多不必要的内容。
- 安全缺陷。由于 Cookie 以纯文本的形式在浏览器和服务器中传递，很容易被非法用户截获，然后进行一系列的篡改，在 Cookie 的有效期内重新发送给服务器，这是相当危险的。另外，在HttpOnly为 false 的情况下，Cookie 信息能直接通过 JS 脚本来读取。
- 操作缺陷。Cookie的原生api不友好，需要自行封装

### 参数

|参数|说明|
|:---|:---|
|key|cookie key|
|value|cookie value|
|expires|过期时间。一旦过期浏览器自动删除cookie。删除：可以设置一个过去的时间；如果不设置过期时间，则cookie有效期是会话期间。|
|path|路径。在指定路径的时候，凡是来自同一服务器，URL里有相同路径的所有WEB页面都可以共享cookies。|
|domain|主机名，是指同一个域下的不同主机，例如：www.baidu.com和map.baidu.com就是两个不同的主机名。默认情况下，一个主机中创建的cookie在另一个主机下是不能被访问的，但可以通过domain参数来实现对其的控制：document.cookie = "name=value;domain=.baidu.com" 这样，所有*.baidu.com的主机都可以访问该cookie。|
|secure|当 secure 属性设置为 true 时，cookie 只有在 https 协议下才能上传到服务器，而在 http 协议下是没法上传的，所以也不会被窃听。|
|httponly|用于防止客户端脚本通过 document.cookie 属性访问 Cookie，有助于保护 Cookie 不被跨站脚本攻击窃取或篡改。但是，HTTPOnly 的应用仍存在局限性，一些浏览器可以阻止客户端脚本对 Cookie 的读操作，但允许写操作；此外大多数浏览器仍允许通过 XMLHTTP 对象读取 HTTP 响应中的 Set-Cookie 头。|

## webStorage

HTML5 提供了两种在客户端存储数据的新方法：localStorage 和 sessionStorage，挂载在 window 对象下。
webStorage 是本地存储，数据不是由服务器请求传递的。从而它可以存储大量的数据，而不影响网站的性能。

### 目的

Web Storage的目的是为了克服由cookie带来的一些限制，当数据需要被严格控制在客户端上时，无须持续地将数据发回服务器。比如客户端需要保存的一些用户行为或数据，或从接口获取的一些短期内不会更新的数据，都可以利用Web Storage来存储。

### localStorage

以键值对(Key-Value)的方式存储，永久存储，永不失效，除非手动删除。IE8+支持，每个域名限制5M
打开同域的新页面也能访问得到。可以存储数组、数字、对象等可以被序列化为字符串的内容

```js
window.localStorage.username = 'hehe'                   // 设置
window.localStorage.setItem('username', 'hehe')         // 设置
window.localStorage.getItem('username')                 // 读取
window.localStorage.removeItem('username')              // 删除
window.localStorage.key(1)                              // 读取索引为1的值
window.localStorage.clear() 
```

### sessionStorage

sessionStorage 在关闭页面后即被清空，而 localStorage 则会一直保存。很多时候数据只需要在用户浏览一组页面期间使用，关闭窗口后数据就可以丢弃了，这种情况使用 sessionStorage 就比较方便。
注意，**刷新页面 sessionStorage 不会清除，但是打开同域新页面访问不到**。

```js
window.sessionStorage.username = 'hehe'                   // 设置
window.sessionStorage.setItem('username', 'hehe')         // 设置
window.sessionStorage.getItem('username')                 // 读取
window.sessionStorage.removeItem('username')              // 删除
window.sessionStorage.key(1)                              // 读取索引为1的值
window.sessionStorage.clear()       
```

## indexedDB

IndexedDB 是一种底层 API，用于在客户端存储大量的结构化数据（也包括文件/二进制大型对象（blobs））。该 API 使用索引实现对数据的高性能搜索。虽然 Web Storage 在存储较少量的数据很有用，但对于存储更大量的结构化数据来说力不从心。而 IndexedDB 提供了这种场景的解决方案。

indexedDB 就是一个非关系型数据库，它不需要你去写一些特定的 sql 语句来对数据库进行操作，因为它是 nosql 的，数据形式使用的是 json。IndexedDB 很适合存储大量数据，它的 API 是异步调用的。

### 特点

- IndexedDB 是一种低级 API，用于客户端存储大量结构化数据。该 API 使用索引来实现对该数据的高性能搜索。
- 为应用创建离线版本。

### 操作方式

1. 打开数据库并且开启一个事务。
2. 创建一个 object store。
3. 构建一个请求来执行一些数据库操作，像增加或提取数据等。
4. 通过监听正确类型的 DOM 事件以等待操作完成。
5. 在操作结果上进行一些操作（可以在 request 对象中找到）

### 基础 API

- 建立打开indexedDB：window.indexedDB.open("testDB")
- 关闭indexedDB：indexdb.close()；
- 删除indexedDB：window.indexedDB.deleteDatabase(indexdb)。

::: tip 注意

- 键值对存储。内部采用对象仓库存放数据，在这个对象仓库中数据采用键值对的方式来存储。
- 异步操作。数据库的读写属于 I/O 操作, 浏览器中对异步 I/O 提供了支持。
- 受同源策略限制，即无法访问跨域的数据库。
:::

具体查看

[indexedDB MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)

[indexedDB 操作](https://www.jianshu.com/p/bb116c7a74b3)

## 存储方式对比

||cookie|localStorage|sessionStorage|IndexedDB|Web SQL|
|:---|:---|:---|:---|:---|:---|
|规范|HTTP规范|HTML5规范|HTML5规范|HTML5规范|已被W3C规范废弃，但浏览器广泛支持|
|挂载对象|DOM|BOM|BOM|BOM|BOM|BOM|
|传输|cookie数据始终在同源的http请求中携带（即使不需要）仅在本地保存，不会传输|仅在本地保存，不会传输|仅在本地保存，不会传输|仅在本地保存，不会传输|
|存储大小|4k|5M左右，各浏览器的存储空间有差异|5M左右，各浏览器的存储空间有差异
|有效期|在设置的cookie过期时间之前一直有效，可以设置过期时间，也可以设置为会话级别的（浏览器关闭时过期）|始终有效，窗口或浏览器关闭也一直保存|仅在当前浏览器窗口关闭前有效|始终有效，窗口或浏览器关闭也一直保存|始终有效，窗口或浏览器关闭也一直保存|
|作用域|属于服务器端，每次请求都会自动发送到服务器，适用于需要在服务器端读取的场景；所有同源窗口中都是共享的；设置 domain 后子域也共享|所有同源窗口中都是共享的|数据只在页面会话期间有效，关闭标签页或窗口后数据被清除；即使多个标签页访问的是同一域名下的同一页面，它们也无法共享 sessionStorage 数据|所有同源窗口中都是共享的|所有同源窗口中都是共享的|
|安全性|可以设置为 HttpOnly，防止 XSS 攻击；常用于存储会话信息，如用户登录状态|存储在客户端，容易受到 XSS 攻击；适用于存储不敏感的大量数据|存储在客户端，容易受到 XSS 攻击；适用于存储临时数据，如表单数据|存储在客户端，容易受到 XSS 攻击；适用于存储大量结构化数据，如数据库应用|

## 存储方式跨域

cookie、localStorage 、sessionStorage 和 indexedDB 都是客户端存储技术，但它们在跨域访问方面有所不同：

- Cookie
  - Cookie 是可以跨域的，但需要服务器在设置 Cookie 时指定 `domain` 属性，并且 Path 属性通常设置为 `/`。这样，**同一域名下的所有子域都可以访问该 Cookie**。
  - 为了实现跨域 Cookie 共享，服务器需要设置 `Access-Control-Allow-Credentials` 为 true，并且 `Access-Control-Allow-Origin` 不能使用 `*`，**必须指定具体的域名**。同时，客户端请求时需要携带 `credentials: 'include'` 或者在 XMLHttpRequest 中设置 `withCredentials = true`;
- localStorage 、sessionStorage 和 indexedDB
  - 根据同源策略，localStorage 、sessionStorage 和 indexedDB 默认情况下不能被跨域访问。它们只能被同一域名、协议和端口下的页面访问。
  - 但是，可以通过以下几种方法实现跨域访问：
    - **使用 iframe 嵌套**：在一个页面中嵌入另一个页面的 iframe，并将其 src 属性设置为存储数据的页面所在的域名下的页面地址。然后，可以通过 iframe 的 contentWindow 访问存储在另一个域名下的数据。
    - **使用代理页面**：创建一个代理页面，该页面与目标域名具有相同的域，并通过这个代理页面来操作 localStorage 或 sessionStorage。
    - **跨域资源共享（CORS）**：这是一种现代的跨域技术，可以让前端直接跨域访问 localStorage 或 sessionStorage 中的数据。不过，这需要后端配置适当的 HTTP 头部，以允许跨域访问。
    - **使用 postMessage API**：这是一种浏览器提供的 API，用于在不同窗口或跨域的 iframe 之间进行安全的消息传递。可以在不同域名的页面中使用 postMessage 将数据从一个窗口传递到另一个窗口，并在目标窗口中将数据存储到 localStorage 或 sessionStorage 中
