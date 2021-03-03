# 网络层面优化

减少请求数、减小请求资源体积、提升网络传输速率

- **使用 CDN 加速**。使用 CDN 降低网络延时即丢包率，分布式 CDN 增加并发连接，CDN 长缓存，加速下载静态资源
- **开启 gzip 压缩**。使用 gzip 压缩编码技术，减小资源体积。
- **浏览器缓存**。利用浏览器缓存(强缓存与协商缓存)与 Nginx 代理层缓存，缓存静态资源文件。
- **减少网络请求次数**。通过压缩文件及合并小文件为大文件，减少网络请求次数，但需要找到合理的平衡点。
- **使用 http2 协议**。多路复用，基于帧的解析速度，优先级与流量控制，服务器推送与 server worker 线程。

##  使用 CDN 加速

使用 CDN 加速下载静态资源

内容分发网络（CDN）是一组分布在多个不同地理位置的 Web 服务器。当服务器离用户越远时，经过的路由器越多，延迟越高。CDN 就是为了解决这一问题，在多个位置部署服务器，让用户离服务器更近，从而缩短请求时间。用户请求资源时，就近返回节点上缓存的资源，而不需要每个用户的请求都回您的源站获取，避免网络拥塞、缓解源站压力，保证用户访问资源的速度和体验。当然不仅仅如此，CDN 还可以分担 IDC(运营商数据服务器) 压力。CDN 可以通过不同的域名来加载文件，从而使下载文件的并发连接数大大增加，且 CDN 具有更好的可用性，更低的网络延迟和丢包率 。

由于 CDN 会为资源开启长时间的缓存，例如用户从 CDN 上获取了 index.html，即使之后替换了 CDN 上的 index.html，用户那边仍会在使用之前的版本直到缓存时间过期。**业界做法**：

- HTML 文件：放在自己的服务器上且关闭服务器上的缓存，不接入 CDN
- 静态的 JS、CSS、图片等资源：开启 CDN 和缓存，同时文件名带上由内容计算出的 Hash 值，这样只要内容变化 hash 就会变化，文件名就会变化，就会被重新下载而不论缓存时间多长。

::: tip 减少 DNS 查询次数与解析时间
HTTP1.x 版本的协议下，浏览器会对于向同一域名并行发起的请求数限制在 4~8 个。那么把所有静态资源放在同一域名下的 CDN 服务上就会遇到这种限制，所以可以把他们分散放在不同的 CDN 服务上，例如 JS 文件放在 js.cdn.com 下，将 CSS 文件放在 css.cdn.com 下等。这样又会带来一个新的问题：增加了域名解析时间，这个可以通过 `dns-prefetch`(**DNS 预解析**) 来解决 `<link rel='dns-prefetch' href='//js.cdn.com'>` 来缩减域名解析的时间。形如 `//xx.com` 这样的 URL 省略了协议，这样做的好处是，浏览器在访问资源时会自动根据当前 URL 采用的模式来决定使用 HTTP 还是 HTTPS 协议。 
:::

总之，**构建需要满足以下几点**：

- 静态资源导入的 URL 要变成指向 CDN 服务的绝对路径的 URL
- 静态资源的文件名需要带上根据内容计算出的 Hash 值
- 不同类型资源放在不同域名的 CDN 上

webpack 配置资源存放 CDN

- 体积较大的第三方依赖单独拆出来放到 CDN 上，这样这个依赖既不会占用打包资源，也不会影响最终包体积。
- 如果一个依赖有直接打包压缩好的单文件 CDN 资源，就可以直接使用。例如 vue.min.js

```js
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { WebPlugin } = require('web-webpack-plugin');
module.exports = {
  output: {
    filename: '[name]_[chunkhash:8].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '//js.cdn.com/id/', // 指定CSS文件中导入的图片等资源存放的CDN地址
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader?minimize'],
          publicPath: '//img.cdn.com/id/', // 指定CSS文件中导入的图片等资源存放的CDN地址
        }),
      },
      {
        test: /\.png/,
        use: ['file-loader?name=[name]_[hash:8].[ext]'], // 为输出的PNG文件名加上Hash值
      },
    ],
  },
  plugins: [
    new WebPlugin({
      template: './template.html',
      filename: 'index.html',
      stylePublicPath: '//css.cdn.com/id/', //指定存放CSS文件的CDN地址
    }),
    new ExtractTextPlugin({
      filename: `[name]_[contenthash:8].css`, //为输出的CSS文件加上Hash
    }),
  ],
};
```

如果我们想引用一个库，但是又不想让 webpack 打包，并且又不影响我们在程序中以 import、require 或者 window/global 全局等方式进行使用，那就可以通过配置 externals。externals 配置选项提供了「从输出的 bundle 中排除依赖」的方法。

使用 `externals` 可以防止某些库被打包，而通过其他方式引用库（如 CDN），这样做的好处是当更新代码时不会影响库代码的缓存，用户只需下载新的代码即可。当然我们也可以使用 `chunk` 来把不常更新的库打包在另一个文件。

```js
// 从 CDN 引入 React
<script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js" defer></script>
<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js" defer></script>
<script src="./dist/index.js" defer></script>
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
```

::: tip 注意
可以借助 html-webpack-plugin 将 CDN 文件打入 html。在 html 中配置的 CDN 引入脚本一定要在 body 内的最底部，因为：

- 如果放在 body 上面或 header 内，则加载会阻塞整个页面渲染。
- 如果放在 body 外，则会在业务代码被加载之后加载，模块中使用了该模块将会报错。
:::

### CDN 原理

#### 1. 没有的 CDN 网路请求过程：

![CDN原理](/blog/images/optimization/CDN原理1.png)

- 浏览器要将域名解析为 IP 地址，所以需要向本地 DNS 发出请求。
- 本地 DNS 依次向根服务器、顶级域名服务器、权限服务器发出请求，得到网站服务器的 IP 地址。
- 本地 DNS 将 IP 地址发回给浏览器，浏览器向网站服务器 IP 地址发出请求并得到资源。

#### 2. 有 CDN 服务器网路请求过程：

![CDN原理](/blog/images/optimization/CDN原理2.png)

- 浏览器要将域名解析为 IP 地址，所以需要向本地 DNS 发出请求。
- 本地 DNS 依次向根服务器、顶级域名服务器、权限服务器发出请求，得到全局负载均衡系统（GSLB）的 IP 地址。
- 本地 DNS 再向 GSLB 发出请求，GSLB 的主要功能是根据本地 DNS 的 IP 地址判断用户的位置，筛选出距离用户较近的本地- 负载均衡系统（SLB），并将该 SLB 的 IP 地址作为结果返回给本地 DNS。
- 本地 DNS 将 SLB 的 IP 地址发回给浏览器，浏览器向 SLB 发出请求。
- SLB 根据浏览器请求的资源和地址，选出最优的缓存服务器发回给浏览器。
- 浏览器再根据 SLB 发回的地址重定向到缓存服务器。
- 如果缓存服务器有浏览器需要的资源，就将资源发回给浏览器。如果没有，就向源服务器请求资源，再发给浏览器并缓存在本地。

### DNS 预解析

一般来说，在前端优化中与 DNS 有关的有两点： 减少 DNS 请求次数和 DNS Prefetch。

DNS 预解析(pre-resolve)

- 提前解析主机地址，以减少 DNS 延迟 TCP 预连接(pre-connect) 提前连接到目标服务器，以减少 TCP 握手延迟资源预加载(prefetching) 提前加载页面的核心资源，以加载页面显示页面预渲染(prerendering)。
- 提前获取整个页面和相关子资源，这样可以做到及时显示。
- 每一个决策都包含着一个或多个的优化， 用来克服大量的限制因素. 不过毕竟都只是预测性的优化策略，如果效果不理想，就会引入多余的处理和网络传输。甚至可能会带来一些加载时间上的负体验

DNS 预解析具体用法：

```html
// 用 meta 信息来告知浏览器, 当前页面要做 DNS 预解析
<meta http-equiv="x-dns-prefetch-control" content="on">
// 在页面header中使用 link 标签来强制对 DNS 预解析: 
<link rel="dns-prefetch" href="//www.zhix.net">
```
注意：dns-prefetch 需慎用，多页面重复 DNS 预解析会增加重复 DNS 查询次数，因为有开发者指出 禁用 DNS 预读取能节省每月100亿的DNS查询。

```html
// 如果需要禁止隐式的 DNS Prefetch
<meta http-equiv="x-dns-prefetch-control" content="off">
```

## 开启 gzip 压缩

gzip 编码是改进 web  应用程序性能的技术，web 服务器和客户端(浏览器)必须同时支持 gzip。gzip 压缩效率非常高，通常可达 70% 压缩率。

response header 中 `Content-Encoding: gzip`


webpack 中使用 `CompressionWebpackPlugin` 插件进行压缩

```js
if (process.env.NODE_ENV === 'production') {
  plugins.push(new CompressionWebpackPlugin({
    filename: '[path].gz[query]',
    algorithm: 'gzip',
    test: new RegExp(`\\.(${productionGzipExtensions.join('|')})$`),
    threshold: 10240,
    minRatio: 0.8,
    deleteOriginalAssets: false
  }))
}
```

同时服务端需支持 gzip，以 Nginx 配置为例：

```text
gzip on;
gzip_static on;
gzip_min_length 1k;
gzip_buffers 4 16k;
gzip_comp_level 2;
gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php application/vnd.ms-fontobject font/ttf font/opentype font/x-woff image/png image/jpeg image/svg+xml image/gif;
gzip_vary off;
gzip_disable "MSIE [1-6]\.";
```
## 浏览器缓存设置

主要使用 **强缓存** 与 **协商缓存** 机制，具体参考 [浏览器缓存](/javascript/browser/browser-cache.md)

### 强缓存

强缓存是最彻底的缓存，无需向服务器发送请求，通常用于 css、js、图片等静态资源。浏览器发送请求后会先判断本地是否有缓存。如果无缓存，则直接向服务器发送请求；如果有缓存，则判断缓存是否命中强缓存，如果命中则直接使用本地缓存，如果没命中则向服务器发送请求。判断是否命中本地缓存的方法有两种：**Expires** 和 **Cache-Control**。

#### Expires

Expires 是http1.0的响应头，代表的含义是资源本地缓存的过期时间，由服务器设定。服务器返回给浏览器的响应头中如果包含Expires字段，浏览器发送请求时拿当前时间和Expires字段值进行比较，判断资源缓存是否失效。

#### Cache-Control

Cache-Control 是http1.0中新增的字段。由于Expires设置的是资源的具体过期时间，如果服务器时间和客户端时间不一样，就会造成缓存错乱，比如认为调节了客户端的时间，所以设置资源有效期的时长更合理。http1.1 添加了 Cache-Control 的 max-age 字段。max-age 代表的含义是资源有效期的时长，是一个相对时长，单位为s。浏览器再次发送请求时，会把第一次请求的时间和 max-age 字段值相加和当前时间比较，以此判断是否命中本地缓存。max-age 使用的都是客户端时间，比 Expires 更可靠。如果 max-age 和Expires 同时出现，max-age 的优先级更高。Cache-Control 提供了更多的字段来控制缓存：

- no-store,不判断强缓存和协商缓存，服务器直接返回完整资源
- no-cache,不判断强缓存，每次都需要向浏览器发送请求，进行协商缓存判断
- public,指示响应可被任何缓存区缓存
- private,通常只为单个用户缓存，不允许任何共享缓存对其进行缓存,通常用于用户个人信息

### 协商缓存

协商缓存的判断在服务器端进行，判断是否命中的依据就是这次请求和上次请求之间资源是否发生改变。未发生改变命中，发生改变则未命中。判断文件是否发生改变的方法有两个：**Last-Modified、If-Modified-Since** 和 **Etag、If-None-Match**。

#### Last-Modified、If-Modified-Since

Last-Modified 是 http1.0 中的响应头字段，代表请求的资源最后一次的改变时间。If-Modified-Since 是 http1.0 的请求头，If-Modified-Since 的值是上次请求服务器返回的Last-Modified 的值。浏览器第一次请求资源时，服务器返回 Last-Modified,浏览器缓存该值。浏览器第二次请求资源时，用于缓存的 Last-Modified 赋值给If-Modified-Since，发送给服务器。服务器判断 If-Modified-Since 和服务器本地的 Last-Modified 是否相等。如果相等，说明资源未发生改变，命中协商缓存；如果不相等，说明资源发生改变，未命中协商缓存。

#### Etag、If-None-Match
Last-Modified、If-Modified-Since 使用的都是服务器提供的时间，所以相对来说还是很可靠的。但是由于修改时间的精确级别或者定期生成文件这种情况，会造成一定的错误。所以 http1.1 添加 Etag、If-None-Match 字段，完善协商缓存的判断。Etag 是根据资源文件内容生成的资源唯一标识符，一旦资源内容发生改变，Etag 就会发生改变。基于内容的标识符比基于修改时间的更可靠。If-None-Match 的值是上次请求服务器返回的 Etag 的值。Etag、If-None-Match 的判断过程和 Last-Modified、If-Modified-Since一致，Etag、If-None-Match 的优先级更高。

强缓存的优势很明显，无需向服务器发送请求，节省了大量的时间和带宽。但是有一个问题，缓存有效期内想更新资源怎么办？如何使强缓存失效，是问题的关键。通常的解决方法是通过 webpack 文件指纹策略添加占位符，更新文件名，文件名不一样的话，浏览器就会重新请求资源。


下面以 Nginx 为例配置缓存，Nginx 可配置的缓存又有 2 种：

- 客户端的缓存(一般指浏览器的缓存)。
- 服务端的缓存(Nginx代理层缓存，使用 proxy-cache 实现的)。

具体配置参考 [Nginx 静态资源服务器](https://tsejx.github.io/devops-guidebook/server/nginx/static-resource-server)

## 减少网络请求

一个完整的 HTTP 请求需要经历 DNS 查找，TCP 握手，浏览器发出 HTTP 请求，服务器接收请求，服务器处理请求并发回响应，浏览器接收响应等过程。http 80% 响应时间花在了图片、样式、脚本等资源下载上。我们不能减少页面请求资源，所以通过将资源整合到一个文件，从而减少 HTTP 请求次数，来达到优化目的。通过以下手段减少 http 请求次数：

- 压缩静态资源文件
- 合并js和css文件
- 减少外部脚本数量
- 延迟加载与懒加载
- 行内图片(Base64编码)
- 使用字体图标
- 浏览器缓存(强缓存与协商缓存)


## 使用 HTTP2 协议

- 解析速度快

    服务器解析 HTTP1.1 的请求时，必须不断地读入字节，直到遇到分隔符 CRLF 为止。而解析 HTTP2 的请求就不用这么麻烦，因为 HTTP2 是基于帧的协议，每个帧都有表示帧长度的字段。

- 多路复用

    HTTP1.1 如果要同时发起多个请求，就得建立多个 TCP 连接，因为一个 TCP 连接同时只能处理一个 HTTP1.1 的请求。在 HTTP2 上，多个请求可以共用一个 TCP 连接，这称为多路复用。同一个请求和响应用一个流来表示，并有唯一的流 ID 来标识。多个请求和响应在 TCP 连接中可以乱序发送，到达目的地后再通过流 ID 重新组建。


- 首部压缩

    HTTP2 提供了首部压缩功能。HTTP/2 在客户端和服务器端使用“首部表”来跟踪和存储之前发送的键－值对，对于相同的数据，不再通过每次请求和响应发送。

- 优先级

    HTTP2 可以对比较紧急的请求设置一个较高的优先级，服务器在收到这样的请求后，可以优先处理。

- 流量控制

    由于一个 TCP 连接流量带宽（根据客户端到服务器的网络带宽而定）是固定的，当有多个请求并发时，一个请求占的流量多，另一个请求占的流量就会少。流量控制可以对不同的流的流量进行精确控制。

- 服务器推送(server push)

    HTTP2 新增的一个强大的新功能，就是服务器可以对一个客户端请求发送多个响应。换句话说，除了对最初请求的响应外，服务器还可以额外向客户端推送资源，而无需客户端明确地请求。

- Server Worker

    Service Worker 借鉴了 Web Worker 的 思路，即让 JS 运行在主线程之外，由于它脱离了浏览器的窗体，因此无法直接访问 DOM。虽然如此，但它仍然能帮助我们完成很多有用的功能，比如离线缓存、消息推送和网络代理等功能。其中的离线缓存就是 Service Worker Cache。Service Worker 同时也是 PWA 的重要实现机制。

    Service Worker 是运行在浏览器背后的独立线程，一般可以用来实现缓存功能。使用 Service Worker的话，传输协议必须为 HTTPS。因为 Service Worker 中涉及到请求拦截，所以必须使用 HTTPS 协议来保障安全。

::: warning 参考文献
[关于 CDN 内容分发网络](https://tsejx.github.io/blog/about-content-delivery-network/)
:::

