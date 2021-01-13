# 浏览器攻击

常见的浏览器攻击分为两种，一种为XSS（跨站脚本攻击），另一种则为CSRF（跨站请求伪造）。

![web安全](/blog/images/javascript/web安全.png)

## XSS（跨站脚本攻击）
### 定义
XSS 全称是 Cross Site Scripting，为了与 “CSS” 区分开来，故简称 XSS，翻译过来就是“跨站脚本”。XSS 攻击是指黑客往 HTML 文件中或者 DOM 中注入恶意脚本，从而在用户浏览页面时利用注入的恶意脚本对用户实施攻击的一种手段。
### 存在原因
浏览器为了在安全和自由之间找到一个平衡点。支持了页面中的引用第三方资源和 跨域资源共享（CORS），这样做带来了很多安全问题，其中最典型的就是 XSS 攻击。
### 攻击方式
- 存储型 XSS 攻击
 - 首先黑客利用站点漏洞将一段恶意 JavaScript 代码提交到网站的数据库中；
 - 然后用户向网站请求包含了恶意 JavaScript 脚本的页面；
 - 当用户浏览该页面的时候，恶意脚本就会执行
- 反射型 XSS 攻击
  - 恶意 JavaScript 脚本属于用户发送给网站请求中的一部分。
  - 随后网站又把恶意 JavaScript 脚本返回给用户。
  - 恶意 JavaScript 脚本就可以在用户页面中被执行
- 基于 DOM 的 XSS 攻击
    基于 DOM 的 XSS 攻击是不牵涉到页面 Web 服务器的。黑客通过各种手段将恶意脚本注入用户的页面中，比如通过网络劫持在页面传输过程中修改 HTML 页面的内容，这种劫持类型很多，有通过 WiFi 路由器劫持的，有通过本地恶意软件来劫持的，它们的共同点是在 Web 资源传输过程或者在用户使用页面的过程中修改 Web 页面的数据。
- 危害
- 窃取 Cookie 信息
    窃取到Cookie后，就可以在其他电脑上模拟用户的登录。
- 监听用户行为
可以使用“addEventListener”接口来监听键盘事件
  - 修改 DOM
可以通过修改 DOM 伪造假的登录窗口，用来欺骗用户输入用户名和密码等信息
防御
- 服务器对输入脚本进行过滤或转码
- 充分利用 CSP
实施严格的 CSP 可以有效地防范 XSS 攻击，具体来讲 CSP 有如下几个功能：
  - 限制加载其他域下的资源文件
  - 禁止向第三方域提交数据，这样用户数据也不会外泄；
  - 禁止执行内联脚本和未授权的脚本；
  - 还提供了上报机制，这样可以帮助我们尽快发现有哪些 XSS 攻击，以便尽快修复问题。
- 防止Cookie被盗用,使用 HttpOnly 属性
使用 HttpOnly 标记的 Cookie 只能使用在 HTTP 请求过程中，所以无法通过 JavaScript 来读取这段 Cookie。

## 参考资料
[浏览器攻击](https://www.yuque.com/suihangadam/liulanqi/rqnbs7)