# WebSocket 协议

## 轮询

WebSocket 之前，如果需要在客户端和服务之间双向通信，需要通过 HTTP 轮询来实现， HTTP 轮询分为轮询与长轮询：

轮询是指浏览器通过 JavaScript 启动一个定时器，然后以固定的间隔给服务器发请求，询问服务器有没有新消息，缺点：

- 实时性不够
- 频繁的请求会给服务器带来极大的压力

长轮询是指浏览器发送一个请求时，服务器先拖一段时间，等到有消息了再回复。这个机制暂时地解决了实时性问题，相比轮询，长轮询减少了请求的次数，只在有新数据时才响应，从而节省了带宽和服务器资源。但是它带来了新的问题：

- 以多线程模式运行的服务器会让大部分线程大部分时间都处于挂起状态，极大地浪费服务器资源
- 一个HTTP连接在长时间没有数据传输的情况下，链路上的任何一个网关都可能关闭这个连接，而网关是我们不可控的

因此，HTML5 新增了 WebSocket 协议，能够在浏览器和服务器之间建立一个不受限的双向通信的通道。

## WebSocket

http 通过判断 header 中是否包含 Connection: Upgrade 与 Upgrade: websocket 来判断当前是否需要升级到 websocket 协议，除此之外，还有其它 header：

- Sec-WebSocket-Key ：浏览器随机生成的安全密钥
- Sec-WebSocket-Version ：WebSocket 协议版本
- Sec-WebSocket-Extensions ：用于协商本次连接要使用的 WebSocket 扩展
- Sec-WebSocket-Protocol ：协议

当服务器同意进行 WebSocket 连接时，返回响应码 101

WebSocket 特点：

- 支持双向通信，实时性更强；
- 可以发送文本，也可以二进制文件；
- 协议标识符是 ws，加密后是 wss ；
- 较少的控制开销。连接创建后，ws客户端、服务端进行数据交换时，协议控制的数据包头部较小。在不包含头部的情况下，服务端到客户端的包头只有 2~10 字节（取决于数据包长度），客户端到服务端的的话需要加上额外的 4 字节的掩码。而 HTTP 协议每次通信都需要携带完整的头部；
- 支持扩展。ws 协议定义了扩展，用户可以扩展协议，或者实现自定义的子协议。（比如支持自定义压缩算法等）
- 无跨域问题。

## SSE

Server-Sent Events（SSE）是一种基于HTTP的服务器推送技术，它允许服务器主动向客户端推送实时数据更新。

### 工作原理

1. **客户端连接**：客户端通过创建 `EventSource` 对象来打开一个事件流，与服务器建立持久化的连接。
2. **服务器推送**：服务器通过 HTTP 服务向客户端发送数据，数据以 `text/event-stream` 格式发送，每条数据包含一个事件名称和事件数据。
3. **客户端接收**：客户端接收到数据后，会触发相应的事件处理器，根据接收到的数据执行相应的操作。
4. **连接关闭**：当客户端不再需要接收数据时，可以关闭 `EventSource` 对象，从而关闭与服务器之间的连接。

### 特点

1. **单向性**：SSE 是单向的，数据只能从服务器发送到客户端，无法从客户端发送到服务器。这使得 SSE 在某些场景下更加适合，例如实时更新或通知系统。
2. **简单易用**：SSE 的 API 相对简单，易于理解和使用。开发者可以快速实现服务器向客户端推送数据的功能。
3. **持久化连接**：SSE 使用持久化的连接，减少了建立连接的开销。这对于频繁发送数据的场景非常有利。
4. **跨平台兼容性**：SSE 基于 HTTP 协议，因此可以在各种浏览器和平台上使用，具有较好的兼容性。

### 使用场景

SSE 适用于需要服务器向客户端推送实时数据的场景，以下是一些典型的应用场景：

- **实时数据推送**：如股票行情、新闻资讯、聊天消息等。
- **数据监控**：监控服务器或系统的状态，以便及时发现问题。
- **进度更新**：更新任务的进度，如文件上传、视频转码等。

### 实现

客户端可以通过以下方式实现 SSE：

1. **检测支持性**：检查浏览器是否支持 SSE，通过 `window.EventSource` 来检测。
2. **创建连接**：实例化一个 `EventSource` 对象，可以指定 URL 和跨域选项 `withCredentials`。
3. **监听事件**：通过 `onmessage` 或 `addEventListener` 来接收和处理服务器发送的消息。

服务端需要设置 HTTP 头部 `Content-Type: text/event-stream` 并保持连接不断开，以持续发送事件。以下是服务端实现 SSE 的基本步骤：

1. **设置响应头**：设置 `Content-Type` 为 `text/event-stream`，并保持连接打开。
2. **发送事件**：服务器可以通过写入特定的格式来发送事件，每个事件由 `event:`、`data:`、`id:` 等字段组成，并通过两个换行符结束。

SSE 自带客户端重启，在和服务器端失去连接，或者服务器端返回服务器端超时的时候会自动重连。不需要手动维护重连和重试。

### 与 WebSocket 的比较

与 WebSocket 相比，SSE 更简单、更轻量级，且性能更好。WebSocket 支持全双工通信，而 SSE 只支持服务器到客户端的单向数据流。SSE 适用于那些只需要服务器向客户端单向数据流的场景。

[严选 WebSocket 协议](https://juejin.cn/post/6844903909148868621)

[Web 实时推送技术的总结](https://juejin.cn/post/6844903796347240461#heading-4)

[手摸手教你使用WebSocket](https://juejin.cn/post/6844903698498322439)

[WebSocket探秘](https://juejin.cn/post/6844903519649005576)

[WebSockets 与长轮询的较量](https://juejin.cn/post/6844903871710494733#heading-2)
