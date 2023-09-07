(window.webpackJsonp=window.webpackJsonp||[]).push([[55],{355:function(t,v,_){"use strict";_.r(v);var e=_(6),r=Object(e.a)({},(function(){var t=this,v=t._self._c;return v("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[v("h1",{attrs:{id:"浏览器攻击"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#浏览器攻击"}},[t._v("#")]),t._v(" 浏览器攻击")]),t._v(" "),v("p",[t._v("常见的浏览器攻击有以下几种：")]),t._v(" "),v("ul",[v("li",[t._v("XSS（跨站脚本攻击）")]),t._v(" "),v("li",[t._v("CSRF（跨站请求伪造）")]),t._v(" "),v("li",[t._v("点击劫持")]),t._v(" "),v("li",[t._v("中间人攻击")]),t._v(" "),v("li",[t._v("SQL注入攻击")]),t._v(" "),v("li",[t._v("文件上传漏洞")])]),t._v(" "),v("p",[t._v("下面重点讲解前两种，后几种参考文献：")]),t._v(" "),v("p",[v("img",{attrs:{src:"/blog/images/javascript/web%E5%AE%89%E5%85%A8.png",alt:"web安全"}})]),t._v(" "),v("h2",{attrs:{id:"xss-跨站脚本攻击"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#xss-跨站脚本攻击"}},[t._v("#")]),t._v(" XSS（跨站脚本攻击）")]),t._v(" "),v("p",[t._v("XSS 全称是 Cross Site Scripting，为了与 “CSS” 区分开来，故简称 XSS，翻译过来就是“跨站脚本”。XSS 攻击是指黑客往 HTML 文件中或者 DOM 中注入恶意脚本，从而在用户浏览页面时利用注入的恶意脚本对用户实施攻击的一种手段。")]),t._v(" "),v("h3",{attrs:{id:"存在原因"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#存在原因"}},[t._v("#")]),t._v(" 存在原因")]),t._v(" "),v("p",[t._v("浏览器为了在安全和自由之间找到一个平衡点。支持了 "),v("strong",[t._v("页面中的引用第三方资源")]),t._v(" 和 "),v("strong",[t._v("跨域资源共享（CORS）")]),t._v("，这样做带来了很多安全问题，其中最典型的就是 XSS 攻击。")]),t._v(" "),v("h3",{attrs:{id:"攻击方式"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击方式"}},[t._v("#")]),t._v(" 攻击方式")]),t._v(" "),v("ul",[v("li",[v("p",[t._v("存储型 XSS 攻击( server 端)")]),t._v(" "),v("p",[t._v("常见于带有用户保存数据的网站功能，如论坛发帖、商品评论、用户私信等")]),t._v(" "),v("ul",[v("li",[t._v("首先黑客利用站点漏洞将一段恶意 JavaScript 代码提交到网站的数据库中；")]),t._v(" "),v("li",[t._v("用户打开目标网站时，服务端将恶意代码从数据库中取出来，拼接在HTML中返回给浏览器；")]),t._v(" "),v("li",[t._v("用户浏览器在收到响应后解析执行，混在其中的恶意代码也同时被执行")]),t._v(" "),v("li",[t._v("恶意代码窃取用户数据，并发送到指定攻击者的网站，或者冒充用户行为，调用目标网站的接口，执行恶意操作")])])]),t._v(" "),v("li",[v("p",[t._v("反射型 XSS 攻击( server 端)")]),t._v(" "),v("p",[t._v("与存储型的区别在于，存储型的恶意代码存储在数据库中，反射型的恶意代码在 URL 上。常见于通过 URL 传递参数的功能，如网站搜索、跳转等")]),t._v(" "),v("ul",[v("li",[t._v("攻击者构造出特殊的 URL，其中包含恶意代码。")]),t._v(" "),v("li",[t._v("用户打开带有恶意代码的 URL 时，网站服务端将恶意代码从 URL 中取出，拼接在 HTML 中返回给浏览器。")]),t._v(" "),v("li",[t._v("用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行")]),t._v(" "),v("li",[t._v("恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作")])])]),t._v(" "),v("li",[v("p",[t._v("基于 DOM 的 XSS 攻击")]),t._v(" "),v("p",[t._v("基于 DOM 的 XSS 攻击是不牵涉到页面 Web 服务器的。黑客通过各种手段将恶意脚本注入用户的页面中，比如通过网络劫持在页面传输过程中修改 HTML 页面的内容，这种劫持类型很多，有通过 WiFi 路由器劫持的，有通过本地恶意软件来劫持的，它们的共同点是在 Web 资源传输过程或者在用户使用页面的过程中修改 Web 页面的数据。")])])]),t._v(" "),v("h3",{attrs:{id:"危害"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#危害"}},[t._v("#")]),t._v(" 危害")]),t._v(" "),v("ul",[v("li",[v("p",[t._v("窃取 Cookie 信息")]),t._v(" "),v("p",[t._v("窃取到Cookie后，就可以在其他电脑上模拟用户的登录。")])]),t._v(" "),v("li",[v("p",[t._v("监听用户行为")]),t._v(" "),v("p",[t._v("可以使用 addEventListener 接口来监听键盘事件。")])]),t._v(" "),v("li",[v("p",[t._v("修改 DOM")]),t._v(" "),v("p",[t._v("可以通过修改 DOM 伪造假的登录窗口，用来欺骗用户输入用户名和密码等信息。")])])]),t._v(" "),v("h3",{attrs:{id:"防御"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#防御"}},[t._v("#")]),t._v(" 防御")]),t._v(" "),v("ul",[v("li",[v("p",[t._v("服务器对输入脚本进行过滤或转码。")])]),t._v(" "),v("li",[v("p",[t._v("防止 Cookie 被盗用，使用 HttpOnly 属性。")]),t._v(" "),v("p",[t._v("使用 HttpOnly 标记的 Cookie 只能使用在 HTTP 请求过程中，所以无法通过 JavaScript 来读取这段 Cookie。")])]),t._v(" "),v("li",[v("p",[t._v("充分利用 CSP（CSP HTTP Header)，即 Content-Security-Policy、X-XSS-Protection")]),t._v(" "),v("p",[t._v("实施严格的 CSP 可以有效地防范 XSS 攻击，具体来讲 CSP 有如下几个功能：")]),t._v(" "),v("ul",[v("li",[v("p",[t._v("限制加载其他域下的资源文件")])]),t._v(" "),v("li",[v("p",[t._v("禁止向第三方域提交数据，这样用户数据也不会外泄；")])]),t._v(" "),v("li",[v("p",[t._v("禁止执行内联脚本和未授权的脚本；")])]),t._v(" "),v("li",[v("p",[t._v("还提供了上报机制，这样可以帮助我们尽快发现有哪些 XSS 攻击，以便尽快修复问题。")])]),t._v(" "),v("li",[v("p",[t._v("增加攻击难度，配置CSP(本质是建立白名单，由浏览器进行拦截)")])]),t._v(" "),v("li",[v("p",[t._v("Content-Security-Policy: default-src 'self' -所有内容均来自站点的同一个源（不包括其子域名）")])]),t._v(" "),v("li",[v("p",[t._v("Content-Security-Policy: default-src 'self' *.trusted.com-允许内容来自信任的域名及其子域名 (域名不必须与CSP设置所在的域名相同)")])]),t._v(" "),v("li",[v("p",[t._v("Content-Security-Policy: default-src https://yideng.com-该服务器仅允许通过 HTTPS 方式并仅从 yideng.com 域名来访问文档")])])])]),t._v(" "),v("li",[v("p",[t._v("输入验证：比如一些常见的数字、URL、电话号码、邮箱地址等等做校验判断")])]),t._v(" "),v("li",[v("p",[t._v("验证码")])])]),t._v(" "),v("h2",{attrs:{id:"csrf-跨站请求伪造"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#csrf-跨站请求伪造"}},[t._v("#")]),t._v(" CSRF（跨站请求伪造）")]),t._v(" "),v("p",[t._v("CSRF 英文全称是 Cross-site request forgery，是指黑客引诱用户打开黑客的网站，在黑客的网站中，利用用户的登录状态发起的跨站请求。简单来讲，CSRF 攻击就是"),v("strong",[t._v("利用了用户的登录状态，并通过第三方的站点来做一些坏事")]),t._v("。而且 CSRF 攻击并不需要将恶意代码注入用户的页面，仅仅是利用服务器的漏洞和用户的登录状态来实施攻击。")]),t._v(" "),v("h3",{attrs:{id:"存在原因-2"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#存在原因-2"}},[t._v("#")]),t._v(" 存在原因")]),t._v(" "),v("p",[t._v("利用了web 中用户身份验证的一个漏洞：简单的身份验证只能保证请求发自某个用户的浏览器，却不能保证请求本身是用户自愿发出的。")]),t._v(" "),v("h3",{attrs:{id:"攻击方式-2"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击方式-2"}},[t._v("#")]),t._v(" 攻击方式")]),t._v(" "),v("ul",[v("li",[t._v("自动发起 Get 请求")]),t._v(" "),v("li",[t._v("自动发起 POST 请求")]),t._v(" "),v("li",[t._v("引诱用户点击链接")])]),t._v(" "),v("div",{staticClass:"custom-block tip"},[v("p",{staticClass:"custom-block-title"},[t._v("CSRF 攻击前提")]),t._v(" "),v("ul",[v("li",[t._v("目标站点一定要有 CSRF 漏洞；")]),t._v(" "),v("li",[t._v("用户要登录过目标站点，并且在浏览器上保持有该站点的登录状态；")]),t._v(" "),v("li",[t._v("需要用户打开一个第三方站点，可以是黑客的站点，也可以是一些论坛。")])])]),t._v(" "),v("p",[v("img",{attrs:{src:"/blog/images/javascript/CSRF%E6%94%BB%E5%87%BB.png",alt:"CSRF攻击"}})]),t._v(" "),v("h3",{attrs:{id:"危害-2"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#危害-2"}},[t._v("#")]),t._v(" 危害")]),t._v(" "),v("p",[t._v("利用登陆态，可以做任何你登陆某网站后的操作，例如转账，更改信息等等。")]),t._v(" "),v("h3",{attrs:{id:"防御-2"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#防御-2"}},[t._v("#")]),t._v(" 防御")]),t._v(" "),v("ul",[v("li",[v("p",[t._v("充分利用好 Cookie 的 SameSite 属性")])]),t._v(" "),v("li",[v("p",[t._v("验证请求的来源站点(同源检测)")]),t._v(" "),v("p",[t._v("根据 HTTP 请求头中的 Referer 和 Origin 属性在服务器端验证请求来源的站点。Referer 和 Origin 都是 HTTP 请求头中的一个字段，Referer 记录了该 HTTP 请求的来源地址。Origin 属性只包含了域名信息，并没有包含具体的 URL 路径。服务器的策略是优先判断 Origin，如果请求头中没有包含 Origin 属性，再根据实际情况判断是否使用 Referer 值。")])]),t._v(" "),v("li",[v("p",[t._v("CSRF Token")]),t._v(" "),v("ul",[v("li",[v("p",[t._v("在浏览器向服务器发起请求时，服务器生成一个 CSRF Token。CSRF Token 其实就是服务器生成的字符串，然后将该字符串植入到返回的页面中。")])]),t._v(" "),v("li",[v("p",[t._v("在浏览器端如果要发起某些请求，那么需要带上页面中的 CSRF Token，然后服务器会验证该 Token 是否合法。如果是从第三方站点发出的请求，那么将无法获取到 CSRF Token 的值，所以即使发出了请求，服务器也会因为 CSRF Token 不正确而拒绝请求。")])])])]),t._v(" "),v("li",[v("p",[t._v("加大请求成本，如验证码")])]),t._v(" "),v("li",[v("p",[t._v("限制白名单请求")])])]),t._v(" "),v("div",{staticClass:"custom-block tip"},[v("p",{staticClass:"custom-block-title"},[t._v("Cookie SameSite")]),t._v(" "),v("p",[t._v("Cookie 的 SameSite 属性用来限制第三方 Cookie，从而减少安全风险。他可以设置三个值:")]),t._v(" "),v("ul",[v("li",[v("p",[t._v("Strict")]),t._v(" "),v("p",[t._v("浏览器会完全禁止第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie。换言之，只有当前网页的 URL 与请求目标一致，才会带上 Cookie。")])]),t._v(" "),v("li",[v("p",[t._v("Lax")]),t._v(" "),v("p",[t._v("在跨站点的情况下 Lax 规则稍稍放宽，大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外。包括链接，预加载请求，GET 表单。而如果在第三方站点中使用 Post 方法，或者通过 img、iframe 等标签加载的 URL，这些场景都不会携带 Cookie。")])]),t._v(" "),v("li",[v("p",[t._v("None")])])]),t._v(" "),v("p",[t._v("在任何情况下都会发送 Cookie 数据，最新版本的 Chrome 中 Lax 变为默认设置。这时，网站可以选择显式关闭 SameSite 属性，将其设为 None。不过，前提是必须同时设置 Secure 属性（Cookie 只能通过 HTTPS 协议发送），否则无效。")])]),t._v(" "),v("h2",{attrs:{id:"csrf-和-xss-的区别"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#csrf-和-xss-的区别"}},[t._v("#")]),t._v(" CSRF 和 XSS 的区别")]),t._v(" "),v("ul",[v("li",[v("p",[t._v("CSRF：需要用户先登录网站 A，获取 cookie。XSS：不需要登录。")])]),t._v(" "),v("li",[v("p",[t._v("CSRF：是利用网站 A 本身的漏洞，去请求网站 A 的 api 。XSS：是向网站 A 注入 JS代码，然后执行 JS 里的代码，篡改网站 A 的内容。")])])]),t._v(" "),v("h2",{attrs:{id:"参考资料"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#参考资料"}},[t._v("#")]),t._v(" 参考资料")]),t._v(" "),v("p",[v("a",{attrs:{href:"https://segmentfault.com/a/1190000016551188",target:"_blank",rel:"noopener noreferrer"}},[t._v("前端安全系列（一）：如何防止XSS攻击？"),v("OutboundLink")],1)]),t._v(" "),v("p",[v("a",{attrs:{href:"https://segmentfault.com/a/1190000016659945",target:"_blank",rel:"noopener noreferrer"}},[t._v("前端安全系列之二：如何防止CSRF攻击？"),v("OutboundLink")],1)]),t._v(" "),v("p",[v("a",{attrs:{href:"https://www.yuque.com/suihangadam/liulanqi/rqnbs7",target:"_blank",rel:"noopener noreferrer"}},[t._v("浏览器攻击"),v("OutboundLink")],1)]),t._v(" "),v("p",[v("a",{attrs:{href:"https://juejin.cn/post/6844903844216832007#heading-23",target:"_blank",rel:"noopener noreferrer"}},[t._v("前端基础篇之HTTP协议"),v("OutboundLink")],1)]),t._v(" "),v("p",[v("a",{attrs:{href:"https://segmentfault.com/a/1190000006672214",target:"_blank",rel:"noopener noreferrer"}},[t._v("聊一聊WEB前端安全那些事儿"),v("OutboundLink")],1)]),t._v(" "),v("p",[v("a",{attrs:{href:"https://github.com/lgwebdream/FE-Interview/issues/16",target:"_blank",rel:"noopener noreferrer"}},[t._v("前端安全、中间人攻击"),v("OutboundLink")],1)])])}),[],!1,null,null,null);v.default=r.exports}}]);