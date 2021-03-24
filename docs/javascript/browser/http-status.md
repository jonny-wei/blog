# HTTP 状态码

![http状态码](/blog/images/javascript/http状态码.png)

## 1XX 信息性状态码(Informational)
### 描述
代表请求已被接受，需要继续处理。这类响应是临时响应，只包含状态行和某些可选的响应头信息，并以空行结束。由于 HTTP/1.0 协议中没有定义任何 1xx 状态码，所以除非在某些试验条件下，服务器禁止向此类客户端发送 1xx 响应。
### 种类
- 100 Continue
- 101 Switching Protocols 协议切换 ws:https://10.2.0.126:8000/websocket
- 102 Processing

### 常用
1XX 状态码都不常用

## 2XX 成功状态码(Success)

### 描述
代表请求已成功被服务器接收、理解、并接受。

### 种类
一共有8种,从200到207
- 200 OK
- 201 Created 新资源被创建
- 202 Accepted 已接受处理请求但尚未完成（异步处理）
- 203 Non-Authoritative Information
- 204 No Content 无内容，资源有空表示
- 205 Reset Content
- 206 Partial Content
- 207 Multi-Status

### 常用
- 200 OK （请求成功）
    请求已成功，请求所希望的响应头或数据体将随此响应返回。出现此状态码是表示正常状态。
- 204  No Content（请求成功无返回）
    服务器成功处理了请求，但不需要返回任何实体内容，并且希望返回更新了的元信息。响应可能通过实体头部的形式，返回新的或更新后的元信息。常见用例是 204 作为 PUT 请求的结果返回，更新资源，而不更改向用户显示的页面的当前内容。如果资源已创建，201 Created 则返回。如果页面应该更改为新更新的页面，则 200 应该使用该页面。
- 206 Partial Content（范围请求）
    表示客户端进行了范围请求，而服务器成功执行了这部分的GET请求，响应报文中包含的Content-Range指定范围的实体内容，类似于 FlashGet 或者迅雷这类的 HTTP下载工具都是使用此类响应实现断点续传或者将一个大文档分解为多个下载段同时下载。

## 3XX 重定向状态码(Redirection)
### 描述

需要进行附加操作已完成请求。这类状态码代表需要客户端采取进一步的操作才能完成请求。通常，这些状态码用来重定向，后续的请求地址（重定向目标）在本次响应的 Location 域中指明。

### 种类

- 300 Multiple Choices
- 301 Moved Permanently 资源的URI已被更新
- 302 Move Temporarily
- 303 See Other 重定向另一个 URI，如，负载均衡
- 304 Not Modified
- 305 Use Proxy
- 306 Switch Proxy
- 307 Temporary Redirect
- 308 Permanent Redirect
  
### 常用
- 301 Moved Permanently

    永久性重定向，被请求的资源已永久移动到新位置，并且将来任何对此资源的引用都应该使用本响应返回的若干个 URI 之一。如果可能，拥有链接编辑功能的客户端应当自动把请求的地址修改为从服务器反馈回来的地址。除非额外指定，否则这个响应也是可缓存的。
- 302 Move Temporarily

    临时性重定向，请求的资源临时从不同的 URI响应请求。由于这样的重定向是临时的，客户端应当继续向原有地址发送以后的请求。只有在Cache-Control或Expires中进行了指定的情况下，这个响应才是可缓存的。由于历史原因，用户代理可能会在重定向后的请求中把 POST 方法改为 GET 方法
- 303 See Other

    该状态码表示由于请求对应的资源存在着另一个 URI，应使用 GET 方法定向获取请求的资源。303 和302 有相同的功能，不同点在于 303 明确表示客户端应该用 GET 方法来请求，不管原请求是什么方法，重定向请求的方法都是 GET（或 HEAD，不常用）。
- 304 Not Modified

    很常见的一个状态码，用来表示协商缓存。
::: tip 注意
304 虽然在 3XX 类别中，但是和重定向没关系
:::      
- 307 Temporary Redirect

    临时重定向，和302相同的含义，区别在于307会遵从浏览器标准，不允许浏览器将原本为 POST 的请求重定向到 GET 请求上。
- 308  Permanent Redirect

    308 的定义实际上和 301 是一致的，唯一的区别在于，308 状态码不允许浏览器将原本为 POST 的请求重定向到 GET 请求上。

## 4XX 客户端错误状态码(Client Error)

### 描述
表明客户端是发生错误的原因所在

### 种类

400 - 426; 449 - 451; 494 - 499。种类很多, 不列出了，具体参考文档。
### 常用
- 400 Bad Request

    - 语义有误，当前请求无法被服务器理解。除非进行修改，否则客户端不应该重复提交这个请求。
    - 请求参数有误。
- 401 Unauthorized

    该状态码表示发送的请求需要有通过HTTP认证的认证信息，若之前已进行过1次请求，则表示用户认证失败。
- 403 Forbidden

    该状态表明请求资源的访问被服务器拒绝了，服务端没有给出拒绝的详细理由。未获得文件系统的访问授权，访问权限出现某些问题等情况都是可能发生403的原因。
- 404 NOT Found

    服务器上无法找到请求的资源，除此之外，也可以在服务端拒绝请求且不想说明理由时使用
- 405 Method Not Allowed

    响应状态码指示服务器已知请求方法，但已被禁用且无法使用。这两个强制性方法，GET和HEAD，绝不能被禁用，不应返回该错误代码。  

- 408 Request Timeout

    响应状态码意味着服务器想要关闭这个未使用的连接。它由一些服务器在空闲连接上发送，即使客户端没有任何先前的请求。服务器应该在响应中发送“close”Connection 标题字段，因为408意味着服务器决定关闭连接而不是继续等待。  

## 5XX 服务器错误状态码(Server Error)   

### 描述
表明服务器本身发生了错误
### 种类

- 500 Internal Server Error
- 501 Not Implemented
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout
- 505 HTTP Version Not Supported
- 506 Variant Also Negotiates
- 507 Insufficient Storage
- 508 Loop Detected 
- 509 Bandwidth Limit Exceeded
- 510 Not Extended
- 511 Network Authentication Required

### 常用

- 500 Internal Server Error

    服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。一般来说，这个问题都会在服务器端的源代码出现错误时出现。
- 502 Bad Gateway

    作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应。
- 503 Service Unavailable

    由于临时的服务器维护或者过载，服务器当前无法处理请求。这个状况是临时的，并且将在一段时间以后恢复
- 504 Gateway Timeout

    作为网关或者代理工作的服务器尝试执行请求时，未能及时从上游服务器（URI标识出的服务器，例如HTTP、FTP、LDAP）或者辅助服务器（例如DNS）收到响应。

::: tip 注意
某些代理服务器在DNS查询超时时会返回400或者500错误
:::    

## Isues 问题
### 301，308，302，303，307 有什么区别
301 和 308 都是永久性重定向，不同的是 308 遵循浏览器规范不允许将 POST 请求重定向为 GET。
302，303，307 都是临时重定向，但是 303 不管原请求是什么方法，重定向请求的方法都是 GET（或 HEAD，不常用），而 307 不允许将 POST 重定向为 GET。

[http 301 302 307之间的区别](https://github.com/sisterAn/JavaScript-Algorithms/issues/154)

## 参考资料

[HTTP状态码](https://baike.baidu.com/item/HTTP%E7%8A%B6%E6%80%81%E7%A0%81/5053660?fr=aladdin)