(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{482:function(t,s,a){"use strict";a.r(s);var n=a(14),e=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#跨域"}},[t._v("#")]),t._v(" 跨域")]),t._v(" "),a("h2",{attrs:{id:"什么是同源"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#什么是同源"}},[t._v("#")]),t._v(" 什么是同源")]),t._v(" "),a("p",[t._v("页面的协议，域名和端口都相同，则属于同一源，否则就是非同源")]),t._v(" "),a("h2",{attrs:{id:"什么是同源策略-sop-same-origin-policy"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#什么是同源策略-sop-same-origin-policy"}},[t._v("#")]),t._v(" 什么是同源策略(SOP：Same-Origin Policy)")]),t._v(" "),a("p",[t._v("同源策略是对浏览器的安全保护机制。")]),t._v(" "),a("p",[t._v("同源策略是浏览器的行为，是为了保护本地数据不被JavaScript代码获取回来的数据污染，因此拦截的是客户端发出请求后响应回来的数据。即请求发送了，服务器响应了，但是无法被浏览器接收。")]),t._v(" "),a("p",[t._v("这是一个用于隔离潜在恶意文件的重要安全机制。（请求发送了，服务器也响应了，但是浏览器检测到如果是不同源，就会根据同源策略拦截响应后返回来的数据，无法接收）。")]),t._v(" "),a("p",[t._v("缺少了同源策略，浏览器很容易受到XSS、CSFR等攻击")]),t._v(" "),a("h2",{attrs:{id:"什么是同源策略限制-不同源的3类交互分类"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#什么是同源策略限制-不同源的3类交互分类"}},[t._v("#")]),t._v(" 什么是同源策略限制(不同源的3类交互分类)")]),t._v(" "),a("ul",[a("li",[t._v("允许跨域写操作（Cross-origin writes）。例如：链接，重定向，表单提交，特定少数的 "),a("code",[t._v("http请求")]),t._v(" 需要添加 "),a("code",[t._v("preflight")]),t._v("。")]),t._v(" "),a("li",[t._v("允许跨域资源嵌入（Cross-origin embedding），例如：img，script等 标签")]),t._v(" "),a("li",[t._v("不允许跨域读操作（Cross-origin reads），但可以通过内嵌资源来巧妙的进行读取访问。")])]),t._v(" "),a("h2",{attrs:{id:"浏览器从哪几方面做同源策略限制"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#浏览器从哪几方面做同源策略限制"}},[t._v("#")]),t._v(" 浏览器从哪几方面做同源策略限制")]),t._v(" "),a("ul",[a("li",[t._v("Cookie、LocalStorage 和 IndexDB 同源策略")])]),t._v(" "),a("blockquote",[a("p",[t._v("禁止读取存储在不同源下的 Cookie，LocalStorage 和 IndexDB。")])]),t._v(" "),a("ul",[a("li",[t._v("DOM同源策略")])]),t._v(" "),a("blockquote",[a("p",[t._v("禁止对不同源页面的 DOM 进行操作，DOM 和 JS 对象无法获得。主要包括 iframe、canvas 之类的。")])]),t._v(" "),a("ul",[a("li",[t._v("XMLHttpRequest同源策略")])]),t._v(" "),a("blockquote",[a("p",[t._v("禁止不同源的 AJAX 请求，主要用来防止 CSRF 攻击。\n浏览器中，script，img、link 等标签都可以加载跨域资源，而不受同源限制，但浏览器限制了 JavaScript 的权限使其不能读、写加载的内容。\n因为script标签引入的文不能够被客户端的 js 获取到, 不会影响到原页面的安全，所以 script 不受同源限制。")])]),t._v(" "),a("h2",{attrs:{id:"什么是跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#什么是跨域"}},[t._v("#")]),t._v(" 什么是跨域")]),t._v(" "),a("p",[t._v("非同源请求，均是跨域。只要协议、域名、端口号其中任意一者不同，均属跨域。")]),t._v(" "),a("p",[t._v("须知：跨域请求是浏览器根据同源策略对请求的限制，但服务器仍然能收到客户端请求，服务器之间的通信不存在跨域问题。(跨域是浏览器行为)")]),t._v(" "),a("h2",{attrs:{id:"什么时候需要跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#什么时候需要跨域"}},[t._v("#")]),t._v(" 什么时候需要跨域")]),t._v(" "),a("ul",[a("li",[t._v("XMLHttpRequest 或 Fetch 发起的跨源 HTTP 请求。")]),t._v(" "),a("li",[t._v("Web 字体 (CSS 中通过 @font-face 使用跨源字体资源)。")]),t._v(" "),a("li",[t._v("WebGL 贴图。")]),t._v(" "),a("li",[t._v("使用d rawImage 将 images/video 绘制到 canvas。")]),t._v(" "),a("li",[t._v("此外有样式表，脚本等。")])]),t._v(" "),a("h2",{attrs:{id:"为什么出现跨域问题-跨域产生的条件"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#为什么出现跨域问题-跨域产生的条件"}},[t._v("#")]),t._v(" 为什么出现跨域问题(跨域产生的条件)")]),t._v(" "),a("p",[t._v("由于浏览器同源策略的限制，浏览器会拒绝跨域请求（确切的说是拒绝跨域读操作）。")]),t._v(" "),a("h2",{attrs:{id:"如何解决跨域-9种跨域解决方案"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#如何解决跨域-9种跨域解决方案"}},[t._v("#")]),t._v(" 如何解决跨域(9种跨域解决方案)")]),t._v(" "),a("ul",[a("li",[t._v("document.domain + iframe跨域")]),t._v(" "),a("li",[t._v("location.hash + iframe跨域")]),t._v(" "),a("li",[t._v("window.name + iframe跨域")]),t._v(" "),a("li",[t._v("postMessage跨域")]),t._v(" "),a("li",[t._v("通过jsonp跨域")]),t._v(" "),a("li",[t._v("跨域资源共享（CORS）")]),t._v(" "),a("li",[t._v("WebSocket协议跨域")]),t._v(" "),a("li",[t._v("nginx代理跨域")]),t._v(" "),a("li",[t._v("nodejs中间件代理跨域")])]),t._v(" "),a("h3",{attrs:{id:"一-跨域解决原理一document-domain-iframe跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#一-跨域解决原理一document-domain-iframe跨域"}},[t._v("#")]),t._v(" (一)跨域解决原理一document.domain + iframe跨域")]),t._v(" "),a("p",[t._v("此方案仅限主域相同，子域不同的跨域应用场景。")]),t._v(" "),a("p",[t._v("实现原理：")]),t._v(" "),a("p",[t._v("两个页面都通过js强制设置document.domain为基础主域，就实现了同域。document.domain 的设置是有限制的，只能设置成自身或者更高级的父域，且主域必须相同。")]),t._v(" "),a("p",[t._v("例如：")]),t._v(" "),a("div",{staticClass:"language-HTML line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-html"}},[a("code",[t._v("// 父窗口为https://www.baidu.com\n// 跨域请求子窗口数据\n"),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("iframe")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("id")]),a("span",{pre:!0,attrs:{class:"token attr-value"}},[a("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("iframe"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),a("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("src")]),a("span",{pre:!0,attrs:{class:"token attr-value"}},[a("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v(" https://www.doc.baidu.com/b.html"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("iframe")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("script")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),a("span",{pre:!0,attrs:{class:"token script"}},[a("span",{pre:!0,attrs:{class:"token language-javascript"}},[t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 设置为基础域名")]),t._v("\n    document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("domain "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" baidu"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("com'"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" user "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'admin'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("script")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n// 子窗口为https://www.doc.baidu.com\n"),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("script")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),a("span",{pre:!0,attrs:{class:"token script"}},[a("span",{pre:!0,attrs:{class:"token language-javascript"}},[t._v("\n    document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("domain "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" baidu"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("com'"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获取父窗口中变量")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("alert")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("‘"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("get")]),t._v(" js data "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" parent "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("--")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("’"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v("window"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("parent"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("user"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("script")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br"),a("span",{staticClass:"line-number"},[t._v("13")]),a("br"),a("span",{staticClass:"line-number"},[t._v("14")]),a("br")])]),a("h3",{attrs:{id:"二-跨域解决原理二location-hash-iframe跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#二-跨域解决原理二location-hash-iframe跨域"}},[t._v("#")]),t._v(" (二)跨域解决原理二location.hash + iframe跨域")]),t._v(" "),a("p",[t._v("实现原理：")]),t._v(" "),a("p",[t._v("a欲与b跨域相互通信，通过中间页c来实现。 三个页面，不同域之间利用iframe的location.hash传值，相同域之间直接js访问来通信。a与b不同域只能通过hash值单向通信，b与c也不同域也只能单向通信，但c与a同域，所以c可通过parent.parent访问a页面所有对象。")]),t._v(" "),a("p",[t._v("因为父窗口可以对iframe进行URL读写，iframe也可以读写父窗口的URL，URL有一部分被称为hash，就是#号及其后面的字符，它一般用于浏览器锚点定位，Server端并不关心这部分，应该说HTTP请求过程中不会携带hash，所以这部分的修改不会产生HTTP请求，但是会产生浏览器历史记录。")]),t._v(" "),a("p",[t._v("此方法的原理就是改变URL的hash部分来进行双向通信。每个window通过改变其他 window的location来发送消息（由于两个页面不在同一个域下IE、Chrome不允许修改parent.location.hash的值，所以要借助于父窗口域名下的一个代理iframe），并通过监听自己的URL的变化来接收消息。这个方式的通信会造成一些不必要的浏览器历史记录，而且有些浏览器不支持onhashchange事件，需要轮询来获知URL的改变，")]),t._v(" "),a("p",[t._v("最后，这样做也存在缺点，诸如数据直接暴露在了url中，数据容量和类型都有限等。")]),t._v(" "),a("p",[t._v("例如：")]),t._v(" "),a("div",{staticClass:"language-javascript line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-javascript"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n * A页面：\n * a.html 传送数据到 b.html\n * a.html 下修改 iframe 的 src 为 google.com/b.html#paco\n * b.html 监听到url发生变化，触发相应操作\n */")]),t._v("\n "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v('/** \n * B页面：b.html 传送数据到 a.html\n * 由于两个页面不在同一个域下 IE、Chrome 不允许修改 parent.location.hash 的值，\n * 所以要借助于父窗口域名下的一个代理iframe。\n * b.html 下创建一个隐藏的 iframe，此 iframe 的 src 是 baidu.com 域下的，\n * 并挂上要传送的 hash 数据，如 src="www.baidu.com/proxy.html# 传输的数据"\n * b.html页面的关键代码如下:\n */')]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("try")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("  \n    parent"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("location"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("hash "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'data'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("catch")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("e"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("  \n    "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// ie、chrome的安全机制无法修改parent.location.hash，  ")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" ifrproxy "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("createElement")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'iframe'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    ifrproxy"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("style"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("display "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'none'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    ifrproxy"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("src "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"http://www.baidu.com/proxy.html#data"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("appendChild")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("ifrproxy"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/** \n * C页面：\n * proxy.html监听\n * proxy.html监听到url发生变化，修改a.html的url（因为a.html和proxy.html同域，\n * 所以proxy.html可修改a.html的url hash）a.html监听到url发生变化，触发相操作。\n * proxy.html页面的关键代码如下 :\n */")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//因为parent.parent（即baidu.com/a.html）和baidu.com/proxy.html属于同一个域，所以可以改变其location.hash的值  ")]),t._v("\nparent"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("parent"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("location"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("hash "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" self"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("location"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("hash"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("substring")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br"),a("span",{staticClass:"line-number"},[t._v("13")]),a("br"),a("span",{staticClass:"line-number"},[t._v("14")]),a("br"),a("span",{staticClass:"line-number"},[t._v("15")]),a("br"),a("span",{staticClass:"line-number"},[t._v("16")]),a("br"),a("span",{staticClass:"line-number"},[t._v("17")]),a("br"),a("span",{staticClass:"line-number"},[t._v("18")]),a("br"),a("span",{staticClass:"line-number"},[t._v("19")]),a("br"),a("span",{staticClass:"line-number"},[t._v("20")]),a("br"),a("span",{staticClass:"line-number"},[t._v("21")]),a("br"),a("span",{staticClass:"line-number"},[t._v("22")]),a("br"),a("span",{staticClass:"line-number"},[t._v("23")]),a("br"),a("span",{staticClass:"line-number"},[t._v("24")]),a("br"),a("span",{staticClass:"line-number"},[t._v("25")]),a("br"),a("span",{staticClass:"line-number"},[t._v("26")]),a("br"),a("span",{staticClass:"line-number"},[t._v("27")]),a("br"),a("span",{staticClass:"line-number"},[t._v("28")]),a("br"),a("span",{staticClass:"line-number"},[t._v("29")]),a("br"),a("span",{staticClass:"line-number"},[t._v("30")]),a("br"),a("span",{staticClass:"line-number"},[t._v("31")]),a("br"),a("span",{staticClass:"line-number"},[t._v("32")]),a("br"),a("span",{staticClass:"line-number"},[t._v("33")]),a("br"),a("span",{staticClass:"line-number"},[t._v("34")]),a("br")])]),a("h3",{attrs:{id:"三-跨域解决原理三window-name-iframe跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#三-跨域解决原理三window-name-iframe跨域"}},[t._v("#")]),t._v(" (三)跨域解决原理三window.name + iframe跨域")]),t._v(" "),a("p",[t._v("window对象有个name属性，该属性有个特征：即在一个窗口(window)的生命周期内,窗口载入的所有的页面都共享一个window.name，\n每个页面对window.name都有读写的权限，window.name是持久存在一个窗口载入过的所有页面中的，并不会因新页面的载入而进行重置。\nwindow.name属性的独特之处在于：name值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的 name 值（2MB）。\n如果在一个标签里面跳转网页的话，我们的 window.name 是不会改变的。")]),t._v(" "),a("p",[t._v("基于这个思想，我们可以在某个页面设置好 window.name 的值，然后跳转到另外一个页面。\n在这个页面中就可以获取到我们刚刚设置的 window.name 了。由于安全原因，浏览器始终会保持 window.name 是string 类型。")]),t._v(" "),a("p",[t._v("location.hash + iframe跨域和window.name + iframe跨域都是通过中间代理页实现。")]),t._v(" "),a("h3",{attrs:{id:"四-跨域解决原理四postmessage跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#四-跨域解决原理四postmessage跨域"}},[t._v("#")]),t._v(" (四)跨域解决原理四postMessage跨域")]),t._v(" "),a("p",[t._v("postMessage是HTML5 XMLHttpRequest Level 2中的API，且是为数不多可以跨域操作的window属性之一，它可用于解决以下方面的问题：")]),t._v(" "),a("ul",[a("li",[t._v("页面和其打开的新窗口的数据传递")]),t._v(" "),a("li",[t._v("多窗口之间消息传递")]),t._v(" "),a("li",[t._v("页面与嵌套的iframe消息传递")]),t._v(" "),a("li",[t._v("上面三个场景的跨域数据传递")])]),t._v(" "),a("p",[t._v("用法：")]),t._v(" "),a("p",[t._v("postMessage(data,origin)方法接受两个参数")]),t._v(" "),a("ul",[a("li",[t._v("data： html5规范支持任意基本类型或可复制的对象，但部分浏览器只支持字符串，所以传参时最好用JSON.stringify()序列化。")]),t._v(" "),a("li",[t._v('origin： 协议+主机+端口号，也可以设置为"*"，表示可以传递给任意窗口，如果要指定和当前窗口同源的话设置为"/"。')])]),t._v(" "),a("h3",{attrs:{id:"五-跨域解决原理五jsonp跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#五-跨域解决原理五jsonp跨域"}},[t._v("#")]),t._v(" (五)跨域解决原理五JSONP跨域")]),t._v(" "),a("p",[t._v("因为通过script标签引入的js是不受同源策略的限制的。所以我们可以通过script标签引入一个js或者是一个其他后缀形式（如php，jsp等）的文件，此文件引入后，触发回调，返回一个js函数的调用。基于此原理，我们可以通过动态创建script，再请求一个带参网址实现跨域通信。")]),t._v(" "),a("p",[t._v("JSONP 是一种非正式传输协议，允许用户传递一个callback给服务端，然后服务端返回数据时会将这个callback 参数作为函数名来包裹住 JSON 数据，这样客户端就可以随意定制自己的函数来自动处理返回数据了。当GET请求从后台页面返回时，可以返回一段JavaScript代码，这段代码会自动执行，可以用来负责调用后台页面中的一个callback函数。")]),t._v(" "),a("ul",[a("li",[t._v("优点：兼容性好")]),t._v(" "),a("li",[t._v("缺点：只支持GET请求")])]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("jsonp")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" url"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" params"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" callbackName "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("generateUrl")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" dataSrc "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('""')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" key "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" params"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Object")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("prototype"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("hasOwnProperty")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("call")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("params"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" key"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        dataSrc "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token template-string"}},[a("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token interpolation"}},[a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("${")]),t._v("key"),a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("}")])]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token interpolation"}},[a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("${")]),t._v("params"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("}")])]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("&")]),a("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    dataSrc "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token template-string"}},[a("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("callback=")]),a("span",{pre:!0,attrs:{class:"token interpolation"}},[a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("${")]),t._v("callbackName"),a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("}")])]),a("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token template-string"}},[a("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token interpolation"}},[a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("${")]),t._v("url"),a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("}")])]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("?")]),a("span",{pre:!0,attrs:{class:"token interpolation"}},[a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("${")]),t._v("dataSrc"),a("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("}")])]),a("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Promise")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("resolve"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" reject")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" scriptEle "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("createElement")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"script"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    scriptEle"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("src "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("generateUrl")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("appendChild")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("scriptEle"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    window"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("callbackName"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("data")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("resolve")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("data"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n      document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("removeChild")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("scriptEle"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$http"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("jsonp")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'http://www.domain2.com:8080/login'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    params"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    jsonp"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'handleCallback'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 自定义回调函数")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("then")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("res")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    console"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("res"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" \n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br"),a("span",{staticClass:"line-number"},[t._v("13")]),a("br"),a("span",{staticClass:"line-number"},[t._v("14")]),a("br"),a("span",{staticClass:"line-number"},[t._v("15")]),a("br"),a("span",{staticClass:"line-number"},[t._v("16")]),a("br"),a("span",{staticClass:"line-number"},[t._v("17")]),a("br"),a("span",{staticClass:"line-number"},[t._v("18")]),a("br"),a("span",{staticClass:"line-number"},[t._v("19")]),a("br"),a("span",{staticClass:"line-number"},[t._v("20")]),a("br"),a("span",{staticClass:"line-number"},[t._v("21")]),a("br"),a("span",{staticClass:"line-number"},[t._v("22")]),a("br"),a("span",{staticClass:"line-number"},[t._v("23")]),a("br"),a("span",{staticClass:"line-number"},[t._v("24")]),a("br"),a("span",{staticClass:"line-number"},[t._v("25")]),a("br"),a("span",{staticClass:"line-number"},[t._v("26")]),a("br"),a("span",{staticClass:"line-number"},[t._v("27")]),a("br"),a("span",{staticClass:"line-number"},[t._v("28")]),a("br")])]),a("h3",{attrs:{id:"六-跨域解决原理六cors跨域-跨域资源共享"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#六-跨域解决原理六cors跨域-跨域资源共享"}},[t._v("#")]),t._v(" (六)跨域解决原理六CORS跨域(跨域资源共享)")]),t._v(" "),a("p",[t._v("CORS（跨域资源共享Cross-origin resource sharing） 是W3C 推荐的一种新的官方方案，能使服务器支持 XMLHttpRequest 的跨域请求。")]),t._v(" "),a("p",[t._v("它允许浏览器向跨源服务器，发出XMLHttpRequest请求，从而克服了AJAX只能同源使用的限制。CORS 实现起来非常方便，只需要增加一些 HTTP 头，让服务器能声明允许的访问来源。")]),t._v(" "),a("p",[t._v("基本思想就是使用自定义的HTTP头部让浏览器与服务器进行沟通，从而决定请求或响应是应该成功还是失败。\n目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。整个CORS通信过程，都是浏览器自动完成，不需要用户参与。")]),t._v(" "),a("p",[t._v("普通跨域请求：在服务端设置Access-Control-Allow-Origin即可，前端无须设置，若要带cookie请求：前后端都需要设置。")]),t._v(" "),a("p",[t._v("CORS请求分两类：")]),t._v(" "),a("p",[t._v("简单请求（simple request）和非简单请求（not-so-simple request）。")]),t._v(" "),a("h4",{attrs:{id:"_1-简单请求需满足以下条件-否则都是非简单请求"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-简单请求需满足以下条件-否则都是非简单请求"}},[t._v("#")]),t._v(" (1) 简单请求需满足以下条件，否则都是非简单请求：")]),t._v(" "),a("ul",[a("li",[t._v("请求方法是以下三种方法之一：\n"),a("ul",[a("li",[t._v("HEAD")]),t._v(" "),a("li",[t._v("GET")]),t._v(" "),a("li",[t._v("POST")])])]),t._v(" "),a("li",[t._v("HTTP的头信息不超出以下几种字段：\n"),a("ul",[a("li",[t._v("Accept")]),t._v(" "),a("li",[t._v("Accept-Language")]),t._v(" "),a("li",[t._v("Content-Language")]),t._v(" "),a("li",[t._v("Last-Event-ID")]),t._v(" "),a("li",[t._v("Content-Type：只限于三个值 application/x-www-form-urlencoded、multipart/form-data、text/plain")])])])]),t._v(" "),a("h4",{attrs:{id:"_2-非简单请求"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-非简单请求"}},[t._v("#")]),t._v(" (2) 非简单请求：")]),t._v(" "),a("p",[t._v('服务器有特殊要求的请求，比如请求方法是 PUT 或 DELETE，或者 Content-Type 字段的类型是 application/json。\n非简单请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为"预检"请求（preflight）。\n浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段。\n只有得到肯定答复，浏览器才会发出正式的XMLHttpRequest请求，否则就报错。')]),t._v(" "),a("p",[t._v("几个字段说明：")]),t._v(" "),a("ul",[a("li",[t._v("Access-Control-Allow-Origin：必须。它的值是请求时Origin字段的值，或者是一个*，表示接受任意域名的请求。")]),t._v(" "),a("li",[t._v("Access-Control-Allow-Credentials：可选。表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可。")]),t._v(" "),a("li",[t._v("Access-Control-Expose-Headers：可选。CORS请求时，XMLHttpRequest对象的getResponseHeader()方法只能拿到6个基本字段：Cache-Control、Content-Language")]),t._v(" "),a("li",[t._v("Content-Type、Expires、Last-Modified、Pragma。如果想拿到其他字段，就必须在Access-Control-Expose-Headers里面指定。")]),t._v(" "),a("li",[t._v('Access-Control-Request-Method：必须。用来列出浏览器的CORS请求会用到哪些HTTP方法。注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。')]),t._v(" "),a("li",[t._v("Access-Control-Request-Headers：该字段是一个逗号分隔的字符串，指定浏览器CORS请求会额外发送的头信息字段。")]),t._v(" "),a("li",[t._v("Access-Control-Max-Age：可选。指定本次预检请求的有效期，单位为秒。")])]),t._v(" "),a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[t._v("关于 Cookie")]),t._v(" "),a("p",[t._v("CORS请求默认不发送Cookie和HTTP认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定Access-Control-Allow-Credentials字段。另一方面需要在AJAX中打开打开withCredentials属性。如果要发送Cookie，Access-Control-Allow-Origin就不能设为星号，必须指定明确的、与请求网页一致的域名。同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的document.cookie也无法读取服务器域名下的Cookie。")])]),t._v(" "),a("p",[t._v("CORS优点：支持所有类型的HTTP请求。使用CORS，开发者可以使用普通的XMLHttpRequest发起请求和获得数据，比起JSONP有更好的错误处理。")]),t._v(" "),a("p",[t._v("CORS缺点：低版本IE不支持(小于IE10)")]),t._v(" "),a("h3",{attrs:{id:"七-跨域解决原理七websocket跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#七-跨域解决原理七websocket跨域"}},[t._v("#")]),t._v(" (七)跨域解决原理七webSocket跨域")]),t._v(" "),a("p",[t._v("WebSocket protocol是HTML5一种新的协议。它实现了浏览器与服务器全双工通信，同时允许跨域通讯，是server push技术的一种很好的实现。")]),t._v(" "),a("p",[t._v("我们所指的跨域是浏览器与服务器基于http通信时，浏览器同源策略的限制。\n而WebSocket不是基于http的，而是与http处于同层(应用层)，\n但WebSocket与TCP/IP建立连接是通过http协议传输的，建立连接后，真正的数据传送不再需要http。\n所以，WebSocket没有同源限制，允许跨域通信。\n全双工通信，客户端和服务端均可主动推送消息。\n实时性和灵活性高。")]),t._v(" "),a("h3",{attrs:{id:"八-跨域解决原理八nginx跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#八-跨域解决原理八nginx跨域"}},[t._v("#")]),t._v(" (八)跨域解决原理八Nginx跨域")]),t._v(" "),a("p",[t._v("跨域原理：同源策略是浏览器的安全策略，不是HTTP协议的一部分。")]),t._v(" "),a("p",[t._v("服务器端调用HTTP接口只是使用HTTP协议，不会执行JS脚本，不需要同源策略，也就不存在跨越问题。")]),t._v(" "),a("p",[t._v("在此理论基础上通过Nginx配置一个反向代理服务器，从而实现跨域。")]),t._v(" "),a("p",[t._v("实现思路：通过nginx配置一个代理服务器（域名与domain1相同，端口不同）做跳板机，反向代理访问domain2接口，并且可以顺便修改cookie中domain信息，方便当前域cookie写入，实现跨域登录。")]),t._v(" "),a("h3",{attrs:{id:"九-跨域解决原理九node跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#九-跨域解决原理九node跨域"}},[t._v("#")]),t._v(" (九)跨域解决原理九Node跨域")]),t._v(" "),a("p",[t._v("原理和Nginx一样，通过代理服务器。node中间件实现跨域代理，是通过启一个代理服务器，实现数据的转发，\n也可以通过设 cookieDomainRewrite 参数修改响应头中cookie中域名，实现当前域的cookie写入，方便接口登录认证。")])])}),[],!1,null,null,null);s.default=e.exports}}]);