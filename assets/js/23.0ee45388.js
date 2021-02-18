(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{476:function(t,v,_){"use strict";_.r(v);var a=_(14),s=Object(a.a)({},(function(){var t=this,v=t.$createElement,_=t._self._c||v;return _("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[_("h1",{attrs:{id:"http-前世今生"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-前世今生"}},[t._v("#")]),t._v(" HTTP 前世今生")]),t._v(" "),_("p",[t._v("HTTP 超文本传输协议，传输超媒体文档的应用层协议，遵循 C/S 模型，客户端发起请求知道服务器响应。HTTP 为无状态协议(服务器不会在两个请求之间保留任何数据，状态)，基于 TCP/IP 层，但可以在任何可靠的传输层上使用，即不会像 UDP 静默丢失数据。")]),t._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/javascript/http%E5%8F%91%E5%B1%95%E5%8F%B2.png",alt:"http发展史"}})]),t._v(" "),_("h2",{attrs:{id:"http-0-9"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-0-9"}},[t._v("#")]),t._v(" HTTP 0.9")]),t._v(" "),_("h3",{attrs:{id:"出现时间"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#出现时间"}},[t._v("#")]),t._v(" 出现时间")]),t._v(" "),_("p",[t._v("1991年")]),t._v(" "),_("h3",{attrs:{id:"出现原因"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#出现原因"}},[t._v("#")]),t._v(" 出现原因")]),t._v(" "),_("p",[t._v("用来在网络之间传递 HTML 超文本的内容。")]),t._v(" "),_("h3",{attrs:{id:"实现"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#实现"}},[t._v("#")]),t._v(" 实现")]),t._v(" "),_("p",[t._v("采用了基于请求响应的模式，从客户端发出请求，服务器返回数据。")]),t._v(" "),_("h3",{attrs:{id:"流程"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#流程"}},[t._v("#")]),t._v(" 流程")]),t._v(" "),_("ul",[_("li",[t._v("因为 HTTP 都是基于 TCP 协议的，所以客户端先要根据 IP 地址、端口和服务器建立 TCP 连接，而建立连接的过程就是 TCP 协议三次握手的过程。")]),t._v(" "),_("li",[t._v("建立好连接之后，会发送一个 GET 请求行的信息，如 GET /index.html 用来获取 index.html。")]),t._v(" "),_("li",[t._v("服务器接收请求信息之后，读取对应的 HTML 文件，并将数据以 ASCII 字符流返回给客户端。")]),t._v(" "),_("li",[t._v("HTML 文档传输完成后，断开连接。")])]),t._v(" "),_("h3",{attrs:{id:"图示"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#图示"}},[t._v("#")]),t._v(" 图示")]),t._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/javascript/http0.9.png",alt:"http0.9"}})]),t._v(" "),_("h3",{attrs:{id:"特点"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#特点"}},[t._v("#")]),t._v(" 特点")]),t._v(" "),_("ul",[_("li",[t._v("只有一个请求行，并没有 HTTP 请求头和请求体因为只需要一个请求行就可以完整表达客户端的需求了。")]),t._v(" "),_("li",[t._v("服务器也没有返回头信息。这是因为服务器端并不需要告诉客户端太多信息，只需要返回数据就可以了。")]),t._v(" "),_("li",[t._v("返回的文件内容是以 ASCII 字符流来传输的")])]),t._v(" "),_("h2",{attrs:{id:"http-1-0"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-1-0"}},[t._v("#")]),t._v(" HTTP 1.0")]),t._v(" "),_("h3",{attrs:{id:"出现时间-2"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#出现时间-2"}},[t._v("#")]),t._v(" 出现时间")]),t._v(" "),_("p",[t._v("1994年")]),t._v(" "),_("h3",{attrs:{id:"出现原因-2"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#出现原因-2"}},[t._v("#")]),t._v(" 出现原因")]),t._v(" "),_("ul",[_("li",[t._v("随着浏览器的发展在浏览器中展示的不单是 HTML 文件了，还包括了 JavaScript、CSS、图片、音频、视频等不同类型的文件。因此需要支持多种类型的文件下载。")]),t._v(" "),_("li",[t._v("文件格式不仅仅局限于 ASCII 编码，还有很多其他类型编码的文件。")])]),t._v(" "),_("h3",{attrs:{id:"图示-2"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#图示-2"}},[t._v("#")]),t._v(" 图示")]),t._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/javascript/http1.0.png",alt:"http1.0"}})]),t._v(" "),_("h3",{attrs:{id:"新增特性"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#新增特性"}},[t._v("#")]),t._v(" 新增特性")]),t._v(" "),_("ul",[_("li",[t._v("对多文件提供良好的支持，支持多种不同类型的数据。HTTP/1.0 的方案是通过请求头和响应头来进行协商，在发起请求时候会通过 HTTP 请求头告诉服务器它期待服务器返回什么类型的文件、采取什么形式的压缩、提供什么语言的文件以及文件的具体编码。")]),t._v(" "),_("li",[t._v("引入状态码，有的请求服务器可能无法处理，或者处理出错，这时候就需要告诉浏览器服务器最终处理该请求的情况，状态码是通过响应行的方式来通知浏览器的。")]),t._v(" "),_("li",[t._v("提供了 Cache 机制，用来缓存已经下载过的数据以减轻服务器的压力")]),t._v(" "),_("li",[t._v("加入了用户代理的字段以统计客户端的基础信息，比如 Windows 和 macOS 的用户数量分别是多少。")])]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("http 1.0")]),t._v(" "),_("p",[t._v("更好的多类型文件支持，引入状态码，提供缓存机制，加入User-Agent")])]),t._v(" "),_("h2",{attrs:{id:"http-1-1"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-1-1"}},[t._v("#")]),t._v(" HTTP 1.1 "),_("Badge",{attrs:{text:"里程碑"}})],1),t._v(" "),_("h3",{attrs:{id:"出现时间-3"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#出现时间-3"}},[t._v("#")]),t._v(" 出现时间")]),t._v(" "),_("p",[t._v("1999年")]),t._v(" "),_("h3",{attrs:{id:"出现原因-3"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#出现原因-3"}},[t._v("#")]),t._v(" 出现原因")]),t._v(" "),_("p",[t._v("随着技术的继续发展，需求也在不断迭代更新，很快 HTTP/1.0 也不能满足需求了。")]),t._v(" "),_("h3",{attrs:{id:"新增特性-2"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#新增特性-2"}},[t._v("#")]),t._v(" 新增特性")]),t._v(" "),_("ul",[_("li",[_("p",[t._v("改进持久连接。")]),t._v(" "),_("ul",[_("li",[t._v("由于 http 1.0 是短连接，所以 HTTP/1.0 每进行一次 HTTP 通信，都需要经历建立 TCP 连接、传输 HTTP 数据和断开 TCP 连接三个阶段。这样做会增加大量的开销。为解决这个问题，HTTP/1.1 中增加了 "),_("strong",[t._v("持久连接")]),t._v(" 的方法，它的特点是在 "),_("strong",[t._v("一个 TCP 连接上可以传输多个 HTTP 请求")]),t._v("，只要浏览器或者服务器没有明确断开连接，那么 "),_("strong",[t._v("该 TCP 连接会一直保持")]),t._v("。持久连接在 HTTP/1.1 中是默认开启的，如不想采用持久连接，可以在 HTTP 请求头中加上 "),_("code",[t._v("Connection: close")]),t._v("。")]),t._v(" "),_("li",[t._v("目前浏览器中对于同一个域名，默认允许同时建立 6 个 TCP 持久连接。")]),t._v(" "),_("li",[t._v("使用 CDN 实现域名分片机制")])])]),t._v(" "),_("li",[_("p",[t._v("不成熟的 HTTP 管线化")]),t._v(" "),_("p",[t._v("HTTP/1.1 中的 "),_("strong",[t._v("管线化")]),t._v(" 是指将多个 HTTP 请求整批提交给服务器的技术，虽然可以整批发送请求，不过服务器依然需要根据请求顺序来回复浏览器的请求。由于持久连接虽然能减少 TCP 的建立和断开次数，但是它需要等待前面的请求返回之后，才能进行下一次请求。如果 TCP 通道中的某个请求因为某些原因没有及时返回，那么就会阻塞后面的所有请求，这就是著名的"),_("strong",[t._v("队头阻塞")]),t._v("的问题。HTTP/1.1 试图用管线化解决队头阻塞问题。")])]),t._v(" "),_("li",[_("p",[t._v("提供虚拟主机的支持")]),t._v(" "),_("p",[t._v("在 HTTP/1.0 中，每个域名绑定了一个唯一的 IP 地址，因此一个服务器只能支持一个域名。但是随着"),_("strong",[t._v("虚拟主机技术")]),t._v("的发展，需要实现在"),_("strong",[t._v("一台物理主机上绑定多个虚拟主机，每个虚拟主机都有自己的单独的域名，这些单独的域名都公用同一个 IP 地址")]),t._v("。因此，HTTP/1.1 的请求头中"),_("strong",[t._v("增加了 Host 字段")]),t._v("，用来表示当前的域名地址，这样服务器就可以根据不同的 Host 值做不同的处理。")])]),t._v(" "),_("li",[_("p",[t._v("对动态生成的内容提供了完美支持")]),t._v(" "),_("p",[t._v("HTTP/1.0 时，需要在响应头中设置完整的数据大小，如 Content-Length: 901，这样浏览器就可以根据设置的数据大小来接收数据。不过随着服务器端的技术发展，很多页面的"),_("strong",[t._v("内容都是动态生成的")]),t._v("，因此在传输数据之前并"),_("strong",[t._v("不知道最终的数据大小")]),t._v("，这就导致了浏览器不知道何时会接收完所有的文件数据。HTTP/1.1 通过"),_("strong",[t._v("引入 Chunk transfer 机制")]),t._v("（分块传输编码机制）来解决这个问题，服务器会将数据分割成若干个任意大小的数据块，每个数据块发送时会附上上个数据块的长度，最后使用一个零长度的块作为发送数据完成的标志。这样就提供了对动态内容的支持。")])]),t._v(" "),_("li",[_("p",[t._v("客户端 Cookie、安全机制")]),t._v(" "),_("p",[t._v("HTTP/1.1 还引入了客户端 Cookie 机制和安全机制")])])]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("http 1.1")]),t._v(" "),_("p",[t._v("持久性连接，管线化技术解决持久性连接引起的对头阻塞但还未彻底解决，支持虚拟主机(Host)，数据分块传输，引入 Cookie 机制和安全机制")])]),t._v(" "),_("h2",{attrs:{id:"http-2-0"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-2-0"}},[t._v("#")]),t._v(" HTTP 2.0 "),_("Badge",{attrs:{text:"主流"}})],1),t._v(" "),_("h3",{attrs:{id:"出现时间-4"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#出现时间-4"}},[t._v("#")]),t._v(" 出现时间")]),t._v(" "),_("p",[t._v("2015年，大多数主流浏览器也于当年年底支持该标准")]),t._v(" "),_("h3",{attrs:{id:"出现原因-4"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#出现原因-4"}},[t._v("#")]),t._v(" 出现原因")]),t._v(" "),_("p",[t._v("虽然 HTTP/1.1 采取了很多优化资源加载速度的策略，也取得了一定的效果，但是 HTTP/1.1 对带宽的利用率却并不理想。主要是由于以下几个原因：")]),t._v(" "),_("ul",[_("li",[_("p",[t._v("TCP 的慢启动")]),t._v(" "),_("p",[t._v("一旦一个 TCP 连接建立之后，就进入了发送数据状态，刚开始 TCP 协议会采用一个非常慢的速度去发送数据，然后慢慢加快发送数据的速度，直到发送数据的速度达到一个理想状态，我们把这个过程称为"),_("strong",[t._v("慢启动")]),t._v("。慢启动是 TCP 为了减少网络拥塞的一种策略，我们是没有办法改变的。因为页面中常用的一些关键资源文件本来就不大，如 HTML 文件、CSS 文件和 JavaScript 文件，通常这些文件在 TCP 连接建立好之后就要发起请求的，但这个过程是慢启动，所以耗费的时间比正常的时间要多很多，这样就增加了首次渲染页面的时长了。")])]),t._v(" "),_("li",[_("p",[t._v("同时开启了多条 TCP 连接，那么这些连接会竞争固定的带宽")]),t._v(" "),_("p",[t._v("系统同时建立了多条 TCP 连接，当带宽充足时，每条连接发送或者接收速度会慢慢向上增加，而一旦带宽不足时，这些 TCP 连接又会减慢发送或者接收的速度。这样就会出现一个问题，因为有的 TCP 连接下载的是一些关键资源，如 CSS 文件、JavaScript 文件等，而有的 TCP 连接下载的是图片、视频等普通的资源文件，但是多条 TCP 连接之间又"),_("strong",[t._v("不能协商让哪些关键资源优先下载")]),t._v("，这样就有可能影响那些关键资源的下载速度了。")])]),t._v(" "),_("li",[_("p",[t._v("HTTP/1.1 队头阻塞的问题")]),t._v(" "),_("p",[t._v("在 HTTP/1.1 中使用持久连接时，虽然能公用一个 TCP 管道，"),_("strong",[t._v("但在一个管道中同一时刻只能处理一个请求")]),t._v("，在当前的请求没有结束之前，其他的请求只能处于阻塞状态。这意味着我们不能随意在一个管道中发送请求和接收内容。这是一个很严重的问题，因为阻塞请求的因素有很多，并且都是一些不确定性的因素，假如有的请求被阻塞了 5 秒，那么后续排队的请求都要延迟等待 5 秒，在这个等待的过程中，带宽、CPU 都被白白浪费了。并且"),_("strong",[t._v("队头阻塞使得数据不能并行请求")]),t._v("，所以队头阻塞是很不利于浏览器优化的。")])])]),t._v(" "),_("h3",{attrs:{id:"实现思路"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#实现思路"}},[t._v("#")]),t._v(" 实现思路")]),t._v(" "),_("p",[t._v("HTTP/2 的思路就是一个域名只使用一个 TCP 长连接来传输数据，这样整个页面资源的下载过程只需要一次慢启动，同时也避免了多个 TCP 连接竞争带宽所带来的问题。另外队头阻塞的问题，等待请求完成后才能去请求下一个资源，这种方式无疑是最慢的，所以 HTTP/2 需要实现"),_("strong",[t._v("资源的并行请求")]),t._v("，也就是任何时候都可以将请求发送给服务器，"),_("strong",[t._v("而并不需要等待其他请求的完成")]),t._v("，然后服务器也可以随时返回处理好的请求资源给浏览器。即一个域名只使用一个 TCP 长连接和消除队头阻塞问题。")]),t._v(" "),_("h3",{attrs:{id:"图示-3"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#图示-3"}},[t._v("#")]),t._v(" 图示")]),t._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/javascript/http2.0.png",alt:"http2.0"}})]),t._v(" "),_("h3",{attrs:{id:"新增特性-3"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#新增特性-3"}},[t._v("#")]),t._v(" 新增特性")]),t._v(" "),_("ul",[_("li",[_("p",[t._v("多路复用，通过引入二进制分帧层，就实现了 HTTP 的多路复用技术。")]),t._v(" "),_("p",[t._v("首先，浏览器准备好请求数据，包括了请求行、请求头等信息，如果是 POST 方法，那么还要有请求。这些数据经过二进制分帧层处理之后，会被"),_("strong",[t._v("转换为一个个带有请求 ID 编号的帧")]),t._v("，通过协议栈将这些帧发送给服务器。服务器接收到所有帧之后，会将"),_("strong",[t._v("所有相同 ID 的帧合并为一条完整的请求信息")]),t._v("。然后服务器处理该条请求，并将处理的响应行、响应头和响应体分别发送至二进制分帧层。同样，二进制分帧层会将这些响应数据转换为一个个带有请求 ID 编号的帧。经过协议栈发送给浏览器。浏览器接收到响应帧之后，会根据 ID 编号将帧的数据提交给对应的请求。")])]),t._v(" "),_("li",[_("p",[t._v("设置请求的优先级")]),t._v(" "),_("p",[t._v("我们知道浏览器中有些数据是非常重要的，但是在发送请求时，重要的请求可能会晚于那些不怎么重要的请求，如果服务器按照请求的顺序来回复数据，那么这个重要的数据就有可能推迟很久才能送达浏览器。为了解决这个问题，HTTP/2 提供了"),_("strong",[t._v("请求优先级")]),t._v("，可以在发送请求时，标上该请求的优先级，这样服务器接收到请求之后，会优先处理优先级高的请求。")])]),t._v(" "),_("li",[_("p",[t._v("服务器推送")]),t._v(" "),_("p",[t._v("除了设置请求的优先级外，HTTP/2 还可以直接将数据"),_("strong",[t._v("提前推送")]),t._v("到浏览器。")])]),t._v(" "),_("li",[_("p",[t._v("头部压缩")]),t._v(" "),_("p",[t._v("HTTP/2 对请求头和响应头进行了压缩，你可能觉得一个 HTTP 的头文件没有多大，压不压缩可能关系不大，但你这样想一下，在浏览器发送请求的时候，基本上都是发送 HTTP 请求头，很少有请求体的发送，通常情况下页面也有 100 个左右的资源，如果将这 100 个请求头的数据压缩为原来的 20%，那么传输效率肯定能得到大幅提升。")])])]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("http 2.0")]),t._v(" "),_("p",[t._v("引入二进制分帧层，实现 HTTP 多路复用技术，并行处理请求。设置请求优先级，优先处理高优先级请求。\n提前向客户端推送数据。压缩头部，提高传输效率。")])]),t._v(" "),_("h2",{attrs:{id:"http-3-0"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-3-0"}},[t._v("#")]),t._v(" HTTP 3.0 "),_("Badge",{attrs:{text:"未来"}})],1),t._v(" "),_("ul",[_("li",[_("p",[t._v("TCP层面依旧存在队头阻塞")]),t._v(" "),_("p",[t._v("在 TCP 传输过程中，由于单个数据包的丢失会造成的阻塞。随着丢包率的增加，HTTP/2 的传输效率也会越来越差。有测试数据表明，当系统达到了 2% 的丢包率时，HTTP/1.1 的传输效率反而比 HTTP/2 表现得更好。")])]),t._v(" "),_("li",[_("p",[t._v("TCP 建立连接的延时")]),t._v(" "),_("p",[t._v("TCP 的握手过程也是影响传输效率的。我们知道 HTTP/1 和 HTTP/2 都是使用 TCP 协议来传输的，而如果使用 HTTPS 的话，还需要使用 TLS 协议进行安全传输，而使用 TLS 也需要一个握手过程，这样就需要有两个握手延迟过程。总之，在传输数据之前，我们需要花掉 3～4 个 RTT，若服务器相隔较远，那么 1 个 RTT 就可能需要 100 毫秒以上了，这种情况下整个握手过程需要 300～400 毫秒，这时用户就能明显地感受到“慢”了。")])]),t._v(" "),_("li",[_("p",[t._v("TCP 协议僵化")]),t._v(" "),_("p",[t._v("中间设备的僵化：如果我们在客户端升级了 TCP 协议，但是当新协议的数据包经过这些中间设备时，它们可能不理解包的内容，于是这些数据就会被丢弃掉。这就是中间设备僵化，它是阻碍 TCP 更新的一大障碍。操作系统也是导致 TCP 协议僵化的另外一个原因, 因为 TCP 协议都是通过操作系统内核来实现的，应用程序只能使用不能修改。通常操作系统的更新都滞后于软件的更新，因此要想自由地更新内核中的 TCP 协议也是非常困难的。")])])]),t._v(" "),_("h3",{attrs:{id:"实现思路-2"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#实现思路-2"}},[t._v("#")]),t._v(" 实现思路")]),t._v(" "),_("p",[t._v("HTTP/3 选择了一个折衷的方法 —— UDP 协议，基于 UDP 实现了类似于 TCP 的多路数据流、传输可靠性等功能，我们把这套功能称为 QUIC 协议。\n"),_("img",{attrs:{src:"/blog/images/javascript/http3.0.png",alt:"http3.0"}})]),t._v(" "),_("h3",{attrs:{id:"特性"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#特性"}},[t._v("#")]),t._v(" 特性")]),t._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/javascript/http3.0-1.png",alt:"http3.0"}})]),t._v(" "),_("ul",[_("li",[_("p",[t._v("实现了类似 TCP 的流量控制、传输可靠性的功能")]),t._v(" "),_("p",[t._v("虽然 UDP 不提供可靠性的传输，但 QUIC 在 UDP 的基础之上增加了一层来保证数据可靠性传输。它提供了数据包重传、拥塞控制以及其他一些 TCP 中存在的特性。")])]),t._v(" "),_("li",[_("p",[t._v("集成了 TLS 加密功能")]),t._v(" "),_("p",[t._v("目前 QUIC 使用的是 TLS1.3，相较于早期版本 TLS1.3 有更多的优点，其中最重要的一点是减少了握手所花费的 RTT 个数。")])]),t._v(" "),_("li",[_("p",[t._v("实现了 HTTP/2 中的多路复用功能")]),t._v(" "),_("p",[t._v("和 TCP 不同，QUIC 实现了在同一物理连接上可以有多个独立的逻辑数据流。实现了数据流的单独传输，就解决了 TCP 中队头阻塞的问题。")])]),t._v(" "),_("li",[_("p",[t._v("实现了快速握手功能")]),t._v(" "),_("p",[t._v("由于 QUIC 是基于 UDP 的，所以 QUIC 可以实现使用 0-RTT 或者 1-RTT 来建立连接，这意味着 QUIC 可以用最快的速度来发送和接收数据，这样可以大大提升首次打开页面的速度。")])])]),t._v(" "),_("h3",{attrs:{id:"面对的问题"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#面对的问题"}},[t._v("#")]),t._v(" 面对的问题")]),t._v(" "),_("ul",[_("li",[t._v("服务器和浏览器端都没有对 HTTP/3 提供比较完整的支持")]),t._v(" "),_("li",[t._v("系统内核对 UDP 的优化远远没有达到 TCP 的优化程度，这也是阻碍 QUIC 的一个重要原因。")]),t._v(" "),_("li",[t._v("中间设备僵化的问题。这些设备对 UDP 的优化程度远远低于 TCP，据统计使用 QUIC 协议时，大约有 3%～7% 的丢包率")])]),t._v(" "),_("h3",{attrs:{id:"未来"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#未来"}},[t._v("#")]),t._v(" 未来")]),t._v(" "),_("p",[t._v("从标准制定到实践再到协议优化还需要走很长一段路；并且因为动了底层协议，所以 HTTP/3 的增长会比较缓慢，这和 HTTP/2 有着本质的区别。但是腾讯等公司已经尝试在生产中落地 http3 的使用，例如 QQ 兴趣部落。2020年五月初，微软宣布开源自己的内部 QUIC 库 -- MsQuic，将全面推荐 QUIC 协议替换 TCP/IP 协议。所以总体来说 http3 未来可期。")])])}),[],!1,null,null,null);v.default=s.exports}}]);