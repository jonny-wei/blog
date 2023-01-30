# 安全管控与登录

## H5 存在的隐患

要知道，Web 技术是非常开放灵活的，开发者可以利用 JavaScript 脚本随意地操作 DOM，这是会带来以下的问题：

1. **随意地跳转网页，改变界面上的任意内容**。开发者可以利用 JavaScript 脚本随意地跳转网页，或是改变界面上的任意内容。当然，恶意攻击者也能利用这种便利。

2. **获取页面数据**。小程序也提供可一种可以展示敏感数据的组件，`<open-data>`能展示包括用户昵称、头像、性别、地理位置等信息（无需用户授权）。 如果开发者可以操作 DOM，意味着他们可以随意拿到用户的敏感信息。

3. **常见的前端漏洞**。在前端常见的有 XSS 和 CSRF，XSS 是通过注入  JavaScript  脚本的方式来达到特定目的，而 CSRF 则是利用了 cookie。

为了解决管控与安全问题，小程序需要禁用掉：

- 危险的 HTML 标签或者相关属性，如外跳 url 的 a 标签
- 危险的 API，如操作界面的 API、动态运行脚本的 API

如果要一个一个禁止，JavaScript 的灵活性以及浏览器接口的丰富性，会导致很容易遗漏一些危险的接口。并且浏览器内核在不断更新，或许下一版本会新增一个可能会在这套体系下产生漏洞的接口，无法完全避免。

## 安全管控解决方案

### 沙箱环境

**沙箱环境**。通过提供一个纯  JavaScript 的解释执行环境，这个环境没有浏览器相关接口，当然也不用担心操作 DOM、跳转等问题了。在 iOS 下是用内置的 JavaScriptCore 框架，在安卓下是 JsCore 环境（旧版是腾讯 x5 内核提供，新版是 v8 提供）。

客户端系统有 JavaScript 的解释引擎，则可以创建一个单独的线程去执行 JavaScript，这个环境下只执行有关小程序业务逻辑的代码。界面渲染相关的任务呢，就丢到 webview 线程里面，通过逻辑层代码去控制渲染哪些界面。把开发者的 JS 逻辑代码放到单独的线程去运行，因为不在 Webview 线程里，所以这个环境没有 Webview 任何接口，自然的开发者就没法直接操作 DOM，也就没法动态去更改界面或者抓取页面数据。同时小程序不支持动态载入脚本，XSS 漏洞自然也无缝可钻。

### 质量管控

为了保证小程序的质量，以及符合相关的规范，小程序的发布是需要经过审核的。经过审核的小程序才能对外发布，同时在出现问题时，小程序会被下架停用。 -  **小程序的审核机制**。

另外，每个微信小程序需要事先设置一个通讯域名，小程序只可以跟指定的域名与进行网络通信，包括普通 HTTPS 请求、上传文件、下载文件和 WebSocket 通信。这些通讯域名，也都必须要求通过备案。

同时，小程序必须使用 HTTPS 发起网络请求。请求时系统会对服务器域名使用的 HTTPS 证书进行校验，如果校验失败，则请求不能成功发起。

这些种种的限制和管理模式，都进一步保障了用户的数据和隐私安全。

### 登录安全

跨站请求攻击（CSRF），简单地说，是攻击者通过一些技术手段欺骗用户的浏览器去访问一个自己曾经认证过的网站并运行一些操作（如发邮件，发消息，甚至财产操作如转账和购买商品）。由于浏览器曾经认证过，所以被访问的网站会认为是真正的用户操作而去运行。

这利用了 web 中用户身份验证的一个漏洞：简单的身份验证只能保证请求发自某个用户的浏览器，却不能保证请求本身是用户自愿发出的。通常的罪魁祸首则是浏览器的 cookie 登录态。

除了检查 Referer 字段来防范，更有效的一种方式是使用 token。小程序也是这么做的。

小程序可以通过微信官方提供的登录能力方便地获取微信提供的用户身份标识，快速建立小程序内的用户体系。参考官方时序图：

![security1](/blog/images/mobile/security1.png)

在小程序中调用`wx.login()`，能拿到一个`code`作为用户登录凭证（有效期五分钟）。在开发者服务器后台，开发者可使用`code`换取`openid`和`session_key`等信息（`code`只能使用一次）。

#### 可靠的 code

假设现在有个接口，请求 <https://test.com/getUserInfo?id=1> 拉取到微信用户 id 为 1 在我们业务侧的个人信息，那么黑客就可以通过遍历所有的 id，把整个业务侧的个人信息数据全部拉走，会给业务带来很大的安全风险。

由于`code` 5 分钟后会过期，如果黑客要冒充一个用户的话，那他就必须在 5 分钟内穷举所有的身份证 id，然后去开发者服务器换取真实的用户身份。而`code`在成功换取一次信息之后也会立即失效，即便凭证`code`生成时间还没过期。显然，黑客要付出非常大的成本才能获取到一个用户信息，同时，开发者服务器也可以通过一些技术手段检测到 5 分钟内频繁从某个 ip 发送过来的登录请求，从而拒绝掉这些请求。

#### 需要保护的 AppSecret

开发者的后台就拿到了前边`wx.login()`所生成的微信登录凭证`code`，此时就可以拿这个`code`到微信服务器换取微信用户身份。微信服务器为了确保拿`code`过来换取身份信息的人就是刚刚对应的小程序开发者，到微信服务器的请求要同时带上`AppId`和`AppSecret`。

`AppId`和`AppSecret`是微信鉴别开发者身份的重要信息，`AppId`是公开信息，泄露 AppId 不会带来安全风险，但是`AppSecret`是开发者的隐私数据不应该泄露，开发者需要好好保护。

## 登录与静默续期

每一个有数据交互的小程序，都会涉及到登录、token 等问题，openid 又是什么呢？怎么使用静默续期，来提升用户体验呢？

### 小程序登录

![security2](/blog/images/mobile/security2.png)

通常情况下，我们的小程序都会有业务身份，如何将**微信帐号**和**业务身份**关联起来呢？这个时候我们需要上图的步骤：

1. 小程序调用`wx.login()`获取临时登录凭证`code`。
2. 小程序将`code`传到开发者服务器。
3. 开发者服务器以`code`换取用户唯一标识`openid`和会话密钥`session_key`。
4. 开发者服务器可绑定微信用户身份`id`和业务用户身份。
5. 开发者服务器可以根据用户标识来生成自定义登录态，用于后续业务逻辑中前后端交互时识别用户身份。

### 相关数据或参数

上面的登录时序中，我们会涉及到一些数据和参数，先来了解下它们都是用来做啥的：

- **临时登录凭证 code** 在小程序中调用`wx.login()`，能拿到一个`code`作为用户登录凭证（有效期五分钟）。在开发者服务器后台，开发者可使用`code`换取`openid`和`session_key`等信息（`code`只能使用一次）。`code`的设计，主要用于防止黑客使用穷举等方式把业务侧个人信息数据全拉走。

- **AppId 与 AppSecret** 为了确保拿`code`过来换取身份信息的人就是对应的小程序开发者，到微信服务器的请求要同时带上`AppId`和`AppSecret`。

- **session_key** 会话密钥`session_key`是对用户数据进行加密签名的密钥。**为了应用自身的数据安全，开发者服务器不应该把会话密钥下发到小程序，也不应该对外提供这个密钥。**设计`session_key`主要是为了节省流程消耗，如果每次都通过小程序前端`wx.login()`生成微信登录凭证`code`去微信服务器请求信息，步骤太多会造成整体耗时比较严重。使用接口`wx.checkSession()`可以校验`session_key`是否有效。用户越频繁使用小程序，`session_key`有效期越长。`session_key`失效时，可以通过重新执行登录流程获取有效的`session_key`。

- **openid** `openid`是微信用户`id`，可以用这个`id`来区分不同的微信用户。 微信针对不同的用户在不同的应用下都有唯一的一个`openid`, 但是要想确定用户是不是同一个用户，就需要靠`unionid`来区分。

- **unionid** 如果开发者拥有多个移动应用、网站应用、和公众帐号（包括小程序），可通过`unionid`来区分用户的唯一性。同一用户，对同一个微信开放平台下的不同应用，`unionid`是相同的。

### 加锁的登录

在某些情况下，我们或许多个地方会同时触发登录逻辑（如多个接口同时拉取，发现登录态过期的情况）。一般来说，我们会简单地给请求加个锁来解决：

1. 使用`isLogining`来标志是否请求中。
2. 方法返回 Promise，登录态过期时静默续期后重新发起。
3. 使用`sessionId`来记录业务侧的登录态。

```js
// session 参数 key（后台吐回）
export const SESSION_KEY = 'sessionId';

let isLogining = false;
export function doLogin() {
  return new Promise((resolve, reject) => {
    const session = wx.getStorageSync(SESSION_KEY);
    if (session) {
      // 缓存中有 session
      resolve();
    } else if (isLogining) {
      // 正在登录中，请求轮询稍后，避免重复调用登录接口
      setTimeout(() => {
        doLogin()
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      }, 500);
    } else {
      isLogining = true;
      wx.login({
        success: (res) => {
          if (res.code) {
            const reqData: ILoginRequest = {
                code: res.code
            }
            wx.request({
              url: API.login,
              data: reqData,
              // method: "POST",
              success: (resp) => {
                const data = resp.data;
                isLogining = false;
                // 保存登录态
                if (data.return_code === 0) {
                  wx.setStorageSync(SESSION_KEY, data[SESSION_KEY]);
                  resolve();
                } else {
                  reject(data.return_msg);
                }
              },
              fail: err => {
                // 登录失败，解除锁，防止死锁
                isLogining = false;
                reject(err);
              }
            });
          } else {
            // 登录失败，解除锁，防止死锁
            isLogining = false;
            reject();
          }
        },
        fail: (err) => {
          // 登录失败，解除锁，防止死锁
          isLogining = false;
          reject(err);
        }
      });
    }
  });
}
```

### 静默续期

登录态静默需求的实现。怎么使用静默续期，来提升用户体验呢？

#### checkSession

前面也提到，微信不会把`session_key`的有效期告知开发者，因此需要使用接口`wx.checkSession()`来校验`session_key`是否有效。

这里我们：

1. 使用`isCheckingSession`来标志是否查询中。
2. 返回 Promise。
3. 使用`isSessionFresh`来标志`session_key`是否有效。

```js
import { doLogin } from "./doLogin";
import { SESSION_KEY } from "./doLogin";

let isCheckingSession = false;
let isSessionFresh = false;

export function checkSession(): Promise<string> {
  return new Promise((resolve, reject) => {
    const session = wx.getStorageSync(SESSION_KEY);
    if (isCheckingSession) {
      setTimeout(() => {
        checkSession()
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      }, 500);
    } else if (!isSessionFresh && session) {
      isCheckingSession = true;
      wx.checkSession({
        success: () => {
          // session_key 未过期，并且在本生命周期一直有效
          isSessionFresh = true;
          resolve();
        },
        fail: () => {
          // session_key 已经失效，需要重新执行登录流程
          wx.removeStorage({
            key: "skey",
            complete: () => {
              doLogin()
                .then(() => {
                  resolve();
                })
                .catch(err => {
                  reject(err);
                });
            }
          });
        },
        complete: () => {
          isCheckingSession = false;
        }
      });
    } else {
      doLogin()
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    }
  });
}
```

#### 静默续期的接口请求

至此，我们可以封装一个简单的接口，来在每次登录态过期的时候自动续期：

1. 在请求前，使用`checkSession()`检车本次周期内`session_key`是否有效，无效则`doLogin()`拉起登录获取`sessionId`。
2. 请求接口，若返回特定登录态失效错误码（此处假设为`LOGIN_FAIL_CODE`），则`doLogin()`拉起登录获取`sessionId`。
3. 使用`tryLoginCount`来标志重试次数，`TRY_LOGIN_LIMIT`来标志重试次数上限，避免进入死循环。

```js
import { doLogin } from "./doLogin";
import { SESSION_KEY } from "./doLogin";
import { checkSession } from "./checkSession";

// 会话过期错误码，需要重新登录
export const LOGIN_FAIL_CODES = [10000];

const TRY_LOGIN_LIMIT = 3;

export function request(obj: any = {}): Promise<object> {
  return new Promise((resolve, reject) => {
    checkSession()
      .then(() => {
        let session = wx.getStorageSync(SESSION_KEY);
        const { url, data, method, header, dataType } = obj;
        let tryLoginCount = obj.tryLoginCount || 0;
        // 如果需要通过 data 把登录态 sessionId 带上
        const dataWithSession = { ...data, [SESSION_KEY]: session, appid: APPID };
        wx.request({
          url,
          data: dataWithSession,
          method,
          header,
          dataType,
          success: (res: any) => {
            if (res.statusCode === 200) {
              const data: ICommonResponse = res.data;
              // 登陆态失效特定错误码判断，且重试次数未达到上限
              if (LOGIN_FAIL_CODES.indexOf(data.return_code) > -1 && tryLoginCount < TRY_LOGIN_LIMIT) {
                doLogin().then(() => {
                  obj.tryLoginCount = ++tryLoginCount;
                  request(obj)
                    .then(res => {
                      resolve(res);
                    })
                    .catch(err => {
                      reject(err);
                    });
                });
              } else {
                resolve(res);
              }
            } else {
              reject(res);
            }
          },
          fail: function(err) {
            reject(err);
          }
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}
```

至此，我们大概包装了一个能自动登录或是进行静默续期的一个请求接口。


[被删的前端游乐场](https://godbasin.github.io/front-end-playground/wxapp/wxapp-technique/wxapp-login.html)

[手把手教会你小程序登录鉴权](https://juejin.cn/post/6844903588498522120)
