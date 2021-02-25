# 网络层面优化

减少请求数、减小请求资源体积、提升网络传输速率

- **使用 CDN 加速**。使用 CDN 降低网络延时即丢包率，分布式 CDN 增加并发连接，CDN 长缓存，加速下载静态资源
- **开启 gzip 压缩**。使用 gzip 压缩编码技术，减小资源体积。
- **浏览器缓存**。利用浏览器缓存(强缓存与协商缓存)与 Nginx 代理层缓存，缓存静态资源文件。
- **减少网络请求次数**。通过压缩文件及合并小文件为大文件，减少网络请求次数，但需要找到合理的平衡点。
- **使用 http2 协议**。多路复用，基于帧的解析速度，优先级与流量控制，服务器推送与 server worker 线程。

##  使用 CDN 加速

使用 CDN 加速下载静态资源

内容分发网络（CDN）是一组分布在多个不同地理位置的 Web 服务器。当服务器离用户越远时，经过的路由器越多，延迟越高。CDN 就是为了解决这一问题，在多个位置部署服务器，让用户离服务器更近，从而缩短请求时间。当然不仅仅如此，CDN 还可以分担IDC压力。CDN 可以通过不同的域名来加载文件，从而使下载文件的并发连接数大大增加，且 CDN 具有更好的可用性，更低的网络延迟和丢包率 。

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


