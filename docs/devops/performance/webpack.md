# 打包方面优化

- 减少产物体积：代码压缩、代码分割、摇树优化、优化 SourceMap、按需引入、路由懒加载、动态垫片、依赖外置、作用提升等
- 减少打包时间：缩减范围、定向搜索、持久化缓存、提前构建、按需构建、并行构建、可视结构等

减小产物体积，提高首屏性能

- **压缩 HTML/JS/CSS**。利用 AST 压缩混淆代码，压缩的过程中还伴随着 tree-shaking。目的是减小产物体积，减小页面加载和渲染时间，防止反向编译工程的可能性，进而提高首屏性能。
- **分离 CSS 样式，成单独 bundle**。避免大量 CSS 内联 JS，减小 JS Bundle 体积与样式闪动，提高资源下载速度；利用浏览器强缓存，减少静态资源的网络请求，进而提高首屏性能。
- **按需引入**。组件库、工具库按需引入，减小产物体积，进而提高首屏性能。
- **利用 Tree-Shaking**。始终使用 ESM，避免无意义的赋值、尽量不写带有副作用的代码、禁止 Babel 转译模块导入导出语句、优化导出值的粒度、使用支持 Tree Shaking 的包、在异步模块中使用 Tree-Shaking 等手段，利用 Tree-Shaking，减小产物体积，进而提高首屏性能。
- **图片内联或使用 CDN**。HTTP1.1 经常将小体积图片利用一些 loader 将小图像转为 base64 形式的字符串，内敛到产物中，从而减少 HTTP 请求。但目前的网站大多使用 HTTP2，所以图片内联优化收效甚微，有时还会有反作用，因为图片内联增加了产物体积，所以生产环境尽量将图片上传图床，并利用 CDN 加载，减小产物体积，进而提高首屏性能。
- **优化 SourceMap**。生产环境用 `cheap-module-source-map`，减少 SourceMap 体积，进而减小产物体积，进而提高首屏性能
- **路由懒加载**。懒加载的本质实际上就是代码分离。把代码分离到不同的 bundle 中，然后按需加载或并行加载这些文件。单页面应用，可能会有很多的路由引入，打包后产物很大。当进入首页时，加载的资源过多，页面会出现白屏的情况，不利于用户体验，通过路由懒加载，需要时再异步加载资源，减少首页产物体积，提高首屏性能。
- **Code Split 代码分割**。根据产物包的体积、引用次数等做分包优化，减少产物体积，有效利用浏览器缓存，提高首屏性能。
- **CDN 动态加载 polyfil（动态垫片）**。polyfill 通过 CDN 加载， 减小产物体积，提高首屏性能。
- **依赖外置并 CDN 加载**。公共依赖外置，防止将某些 import 的包打包到 bundle 中，在运行时去从外部获取这些扩展依赖(external dependencies)，并且通过 CDN 加载，减小产物体积，提高首屏性能。

减少打包时间，提高开发体验

- **缩小文件搜索范围**。约束 Loader 执行范围，使用 noParse 跳过文件编译，设置 resolve 缩小搜索范围，提高构建速度，提高开发体验。
- **持久化缓存**。提高二次构建速度，提高构建速度，提升开发体验。
- **并行构建**。多进程多线程并行构建，提高构建速度，提升开发体验。

## 压缩 HTML/JS/CSS

### 压缩 HTML

使用 HtmlWebpackPlugin 插入引用，根据模版生成 HTML，通过 `HtmlMinifierTerser` 压缩 HTML。

某些场景如 SSG 或官网一类偏静态的应用中就存在大量可被优化的 HTML 代码，为此社区也提供了一些相关的工程化工具，例如 `html-minifier-terser`。

html-minifier-terser 是一个基于 JavaScript 实现的、高度可配置的 HTML 压缩器，支持一系列 压缩特性。我们可以借助 html-minimizer-webpack-plugin 插件接入 html-minifier-terser 压缩器。

html-minifier-terser 提供的默认配置有点过于保守，例如 `removeComments` —— 用于移除代码备注的配置，或者 `useShortDoctype` 用于简化 `<doctype>` 标签的配置，默认竟然都是 false，这放在当下浏览器功能已经非常强劲，兼容性问题已经被大大抹平的背景下，有点大可不必了。因此，建议你使用时先到官网仔细了解各项配置，尽可能开启更多压缩功能。

### 压缩 CSS

使用 `CssMinimizerWebpackPlugin` 压缩 CSS。这个插件使用 [cssnano](https://cssnano.co/) 优化和压缩 CSS。就像 [optimize-css-assets-webpack-plugin](https://github.com/NMFR/optimize-css-assets-webpack-plugin) 一样，但在 source maps 和 assets 中使用查询字符串会更加准确，支持缓存和并发模式下运行。

- CssMinimizerPlugin.cssnanoMinify：默认值，使用 [cssnano](https://link.juejin.cn/?target=https%3A%2F%2Fcssnano.co%2F) 压缩代码，不需要额外安装依赖；
- CssMinimizerPlugin.cssoMinify：使用 [csso](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fcss%2Fcsso) 压缩代码，需要手动安装依赖 yarn add -D csso；
- CssMinimizerPlugin.cleanCssMinify：使用 [clean-css](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fclean-css%2Fclean-css) 压缩代码，需要手动安装依赖 yarn add -D clean-css；
- CssMinimizerPlugin.esbuildMinify：使用 [ESBuild](https://link.juejin.cn/?target=https%3A%2F%2Fesbuild.github.io%2F) 压缩代码，需要手动安装依赖 yarn add -D esbuild；
- CssMinimizerPlugin.parcelCssMinify：使用 [parcel-css](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fparcel-bundler%2Fparcel-css) 压缩代码，需要手动安装依赖 yarn add -D @parcel/css。

其中 `parcel-css` 与 `ESBuild` 压缩性能相对较佳，但两者功能与兼容性稍弱，多数情况下推荐使用 `cssnano`。

[CssMinimizerWebpackPlugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/)

### 压缩 JavaScript

[Terser](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fterser%2Fterser) 是当下 [最为流行](https://link.juejin.cn/?target=https%3A%2F%2Fnpmtrends.com%2Fbabel-minify-vs-terser-vs-uglify-js) 的 ES6 代码压缩工具之一，支持 [Dead-Code Eliminate](https://link.juejin.cn/?target=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FDead-code_elimination)、删除注释、删除空格、代码合并、变量名简化等等[一系列](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fterser%2Fterser%23compress-options)代码压缩功能。Terser 的前身是大名鼎鼎的 [UglifyJS](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fmishoo%2FUglifyJS)，它在 UglifyJS 基础上增加了 ES6 语法支持，并重构代码解析、压缩算法，使得执行效率与压缩率都有较大提升。

Webpack5.0 后默认使用 Terser 作为 JavaScript 代码压缩器，简单用法只需通过 optimization.minimize 配置项开启压缩功能即可。

[terser-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack-contrib%2Fterser-webpack-plugin) 插件并不只是 Terser 的简单包装，它更像是一个代码压缩功能骨架，底层还支持使用 SWC、UglifyJS、ESBuild 作为压缩器，使用时只需要通过 minify 参数切换即可。不同压缩器功能、性能差异较大，据我了解，ESBuild 与 SWC 这两个基于 Go 与 Rust 编写的压缩器性能更佳，且效果已经基本趋于稳定，虽然功能还比不上 Terser，但某些构建性能敏感场景下不失为一种不错的选择。

压缩代码的目的:

- 压缩混淆代码
- 降低浏览加载资源体积
- 降低页面渲染时间
- 防止反向编译工程的可能性

代码压缩的重点就在于“保持功能性”的前提下尽可能“删除”不必要的字符，原理虽不复杂但必须对语言特性有比较深的理解才能实现，所幸社区已经提供了各种各样的压缩工具，我们只需要简单配置就能轻松接入。

在 Webpack 中需要使用 `optimization.minimizer` 数组接入代码压缩插件，比较常用的插件有：

- `terser-webpack-plugin`：用于压缩 ES6 代码的插件；
- `css-minimizer-webpack-plugin`：用于压缩 CSS 代码的插件；
- `html-minifier-terser`：用于压缩 HTML 代码的插件。

这些插件用法非常相似，都支持 `include/test/exclude` 配置项，用于控制压缩功能的应用范围；也都支持 `minify` 配置项，用于切换压缩器，借助这个配置我们可以使用性能更佳的工具，如 ESBuild 执行压缩。

## 分离 CSS 样式

通过 `css-loader`，`style-loader`，`postcss-loader`，`less-loader/sass-loader(node-sass/fast-sass-loader)` 等一系列 loader 打包好了 css，但是它们都内联到了 js 中，这样会存在以下几个问题：

- 使得 css 无法利用缓存
- 增加了 js 文件体积，以及无法与 JS 并行加载
- 未样式化元素闪动（FOUC）问题

发生 FOUC 的原因：当使用单文件组件时，组件内的 CSS 会以 style 标签的方式通过 JavaScript 动态注入。这有一些小小的运行时开销，如果你使用服务端渲染，这会导致一段 “无样式内容闪烁 (fouc) ” 。将所有组件的 CSS 提取到同一个文件可以避免这个问题，也会让 CSS 更好地进行压缩和缓存。

作者：我是你的超级英雄
链接：<https://juejin.cn/post/6844903913410314247>
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

[MiniCssExtractPlugin](https://webpack.docschina.org/plugins/mini-css-extract-plugin) 分离样式，生成单独的 css 样式文件。它可以将多个 CSS 文件聚合为一个。出于这个原因，它配备了一个 loader(MiniCssExtractPlugin.loader) 来专门处理这个过程。然后，插件会获取 loader 抽取的结果并发出单独的文件。由于这个过程会产生比较大的开销，所以，MiniCssExtractPlugin 只会作用于编译阶段，它不适用于热模块更换（HMR）。鉴于这个插件只是在生产环境中使用，所以也不是什么大的问题。

推荐 `production` 环境的构建将 CSS 从你的 bundle 中分离出来，这样可以使用 CSS/JS 文件的并行加载。 这可以通过使用 `mini-css-extract-plugin` 来实现，因为它可以创建单独的 CSS 文件。 对于 `development` 模式（包括 `webpack-dev-server`），你可以使用 [style-loader](https://webpack.docschina.org/loaders/style-loader/)，因为它可以使用多个 标签将 CSS 插入到 DOM 中，并且反应会更快。

::: tip 注意

- style-loader 用于将 css 通过 `<style>` 标签插入到 `<head>` 中，违背了 **mini-css-extract-plugin** 分离样式，所以 style-loader 不能与 MiniCssExtractPlugin 同时使用。需要使用 MiniCssExtractPlugin.loader 替代 style-loader 。

- css-loader 用于加载 `.css` 文件，并且转换成 commonjs 对象。

:::

::: tip 文件指纹策略补充

- js 文件使用 `[name]_[chunkhash:8].js`
- css 文件使用 `[name]_[contenthash:8].css`
- 图片 文件使用 `[name]_[hash:8].[ext]`
:::

## 按需引入

在项目中，如果我们直接引入整个组件库、工具库等，会导致项目的体积太大，通过按需引入，引入需要的组件，以达到减小项目体积的目的。

- babel-plugin-import
- babel-plugin-component

按需引入原理

```js
import { Button } from "antd"
// 经插件转变为
import Button from "antd/lib/Button"
const Button = require("antd/lib/Button")
```

- 第一步：在插件中拿到我们在插件调用时传递的参数`libraryName`
- 第二步：获取`import`节点，找出引入模块是`libraryName`的语句
- 第三步：进行批量替换旧节点

## 利用 Tree-Shaking

始终使用 ESM，避免无意义的赋值、尽量不写带有副作用的代码、禁止 Babel 转译模块导入导出语句、优化导出值的粒度、使用支持 Tree Shaking 的包、在异步模块中使用 Tree-Shaking等手段，利用 Tree-Shaking，减小产物体积。

你需要明确知道你的代码是否有副作用，关于副作用的定义是，在导入时会执行特殊行为的代码（修改全局对象、立即执行的代码等），而不是仅仅暴露一个 export 或多个 export。举例说明，例如 polyfill，它影响全局作用域，并且通常不提供 export。

Tree-Shaking 的实现大致上可以分为三个步骤：

- 「构建」阶段，「收集」 模块导出变量并记录到模块依赖关系图 ModuleGraph 对象中；
- 「封装」阶段，遍历所有模块，「标记」 模块导出变量有没有被使用；
- 使用代码优化插件 —— 如 Terser，「删除」无效导出代码。

详细了解参考[Tree-Shaking](/devops/webpack/tree-shaking.html#定)

## 图片内联或使用 CDN

小体积图片可利用一些 loader 将小图像转为 base64 形式的字符串，内敛到产物中，从而减少 HTTP 请求。但目前的网站大多使用 HTTP2，所以图片内联优化收效甚微，有时还会有反作用。因为图片内联增加了产物体积，所以生产环境尽量将图片上传图床，并利用 CDN 加载。图片的优化对于有大量图片的网站（例如，电商，设计）来说比较重要，后续文章会有专门的章节讲解。

加载大量小的资源会使基于 HTTP/1 的应用变慢，因为每个请求都会产生开销。HTTP/2 在这方面有所改善，并且在某种程度上改变了这种情况。除了使用 HTTP/2 外，webpack 也有一些优化办法：

- 使用 `url-loader` 内联资源，将小图像转为 base64 形式的字符串，从而减少 HTTP 请求，但是它会增加打包结果的尺寸，生产环境可能不太适合。[url-loader](https://link.juejin.cn/?target=https%3A%2F%2Fv4.webpack.js.org%2Floaders%2Furl-loader%2F)：有两种表现，对于小于阈值 `limit` 的图像直接转化为 base64 编码；大于阈值的图像则调用 `file-loader` 进行加载。`url-loader` 同样适用于大多数图片格式，且能将许多细小的图片直接内嵌进产物中，减少页面运行时需要发出的网络请求数，在 HTTP 1.1 及之前版本中能带来正向的性能收益。
- 使用 `file-loader` 对其延迟加载同时为较大的文件生成单独的请求地址。file-loader 能够将导入的图片存放到特定的目录，并返回图片的路径地址。此技术适用于其他类型的资源，例如字体。[file-loader](https://link.juejin.cn/?target=https%3A%2F%2Fv4.webpack.js.org%2Floaders%2Ffile-loader%2F)：将图像引用转换为 url 语句并生成相应图片文件，经过 `file-loader` 处理后，原始图片会被重命名并复制到产物文件夹，同时在代码中插入图片 URL 地址。
- raw-loader：不做任何转译，只是简单将文件内容复制到产物中，适用于 SVG 场景。经过 raw-loader 处理后，SVG 资源会被直接复制成字符串形式。

::: tip 提示
除 `raw-loader` 外，我们还可以使用如下 Loader 加载 SVG 资源：

- [svg-inline-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fsvg-inline-loader)：能够自动删除 SVG 图片中与显式无关的各种原信息，达到压缩效果；
- [svg-url-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fsvg-url-loader)：以 [DataURL](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FHTTP%2FBasics_of_HTTP%2FData_URIs) 方式导入 SVG 图片，相比于 Base64 更节省空间；
- [react-svg-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Freact-svg-loader)：导入 SVG 图片并自动转化为 React 组件形态，效果类似 [@svgr/webpack](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40svgr%2Fwebpack)；
- [vue-svg-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fvue-svg-loader)：导入 SVG 图片并自动转化为 Vue 组件形态。
:::
- svg 图片使用 `svg-sprite-loader`、`svg-url-loader` 等处理。前者将小的 SVG 文件合并为一个 sprite 文件，从而可以更有效地加载，因为您可以避免请求开销。后者将 SVG 加载为 UTF-8 编码的数据 URL。结果比 Base64 更小，解析更快。
- 使用 `image-webpack-loader`、`svgo-loader`（专用于 SVG）或 `imagemin-webpack-plugin` 压缩图片，减少图片下载所需带宽量。
- 使用图片占位符。`image-trace-loader` 加载图像并将结果编码为 image/svg+xml 格式的 URL 数据。它可以于 file-loader 和 url-loader 一起使用，以便在加载实际图像时显示占位符。
- 利用 srcset。`resize-image-loader` 和 `responsevie-loader` 允许您为现代浏览器生成 srcset 属性所需要的图像集合。srcset 属性可以让浏览器决定加载哪些图像以及何时提高性能。
- 加载 Sprite(雪碧图)。Spriting 技术允许您将多个较小的图像组合成单个图像。它已经被用于游戏中的动画，但对于 Web 开发也很有价值，因为它节省了很多请求开销。`webpack-spritesmith` 生成雪碧图。
- 使用字体图标（iconfont）。不论是压缩后的图片，还是雪碧图，终归还是图片，只要是图片，就还是会占用大量网络传输资源。字体图标是往HTML里插入字符和CSS样式而已，和图片请求比起来资源占用完全不在一个数量级。icomoon这个网站也为我们提供了将 SVG 图片自动转化成 CSS 样式的功能。
- 使用 WebP 格式的图片。谷歌公司开发的一种旨在加快图片加载速度的图片格式。图片压缩体积大约只有JPEG的2/3，并能节省大量的服务器带宽资源和数据空间。Facebook、Ebay等知名网站已经开始测试并使用WebP格式。

```js
{
    test: /.(png|jpg|gif|jpeg)$/,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: '[name]_[hash:8].[ext]'
            }
        },
        {
            loader: 'image-webpack-loader',
            options: {
                mozjpeg: {
                    progressive: true,
                    quality: 65
                },
                // optipng.enabled: false will disable optipng
                optipng: {
                    enabled: false,
                },
                pngquant: {
                    quality: '65-90',
                    speed: 4
                },
                gifsicle: {
                    interlaced: false,
                },
                // the webp option will enable WEBP
                webp: {
                    quality: 75
                }
            }
        }
    ]
}
```

图片压缩：

在 Webpack 生态中有不少优秀的图像压缩组件，包括：[image-webpack-loader](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftcoopman%2Fimage-webpack-loader)、[imagemin-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fimagemin-webpack-plugin)、[image-minimizer-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack-contrib%2Fimage-minimizer-webpack-plugin) 等，以我的使用经验来看，[image-webpack-loader](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftcoopman%2Fimage-webpack-loader) 组件功能齐全且用法简单，更推荐使用。[image-webpack-loader](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftcoopman%2Fimage-webpack-loader) 底层依赖于 [imagemin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fimagemin%2Fimagemin) 及一系列的图像优化工具：

- [mozjpeg](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fimagemin%2Fimagemin-mozjpeg)：用于压缩 JPG(JPEG) 图片；
- [optipng](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fkevva%2Fimagemin-optipng)：用于压缩 PNG 图片；
- [pngquant](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fimagemin%2Fimagemin-pngquant)：同样用于压缩 PNG 图片；
- [svgo](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fkevva%2Fimagemin-svgo)：用于压缩 SVG 图片；
- [gifsicle](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fkevva%2Fimagemin-gifsicle)：用于压缩 Gif 图；
- [webp](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fimagemin%2Fimagemin-webp)：用于将 JPG/PNG 图压缩并转化为 WebP 图片格式。

基本上已经覆盖 Web 页面常用的图片格式，具体用法可点击上述链接查阅，此处不再赘述。最后补充一点，图像压缩是一种非常耗时的操作，建议只在生产环境下开启。

1. **雪碧图**： 将许多细小的图片合并成一张大图 —— 从而将复数次请求合并为一次请求，之后配合 CSS 的 background-position 控制图片的可视区域。在 Webpack 中，我们可以使用 [webpack-spritesmith](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fwebpack-spritesmith) 插件自动实现雪碧图效果。

::: tip 注意
雪碧图曾经是一种使用广泛的性能优化技术，但 HTTP2 实现 TCP 多路复用之后，雪碧图的优化效果已经微乎其微 —— 甚至是反优化，可以预见随 HTTP2 普及率的提升，未来雪碧图的必要性会越来越低，因此建议读者们了解作用与基本原理即可，不必深究。
:::

2. **响应式图片**：根据客户端设备情况下发适当分辨率的图片，有助于减少网络流量。Webpack 中有不少能够自动生成响应式图片的组件，例如： [resize-image-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fresize-image-loader)、[html-loader-srcset](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fhtml-loader-srcset)、[responsive-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fresponsive-loader) 等。

## 优化 SourceMap

开发环境推荐： cheap-module-eval-source-map

生产环境推荐： cheap-module-source-map

一般开发环境开启，线上环境关闭，线上排查问题时可将 sourcemap 上传错误监控系统。

- eval：使用 eval 包裹模块代码，包裹最后有 sourcemap 信息
- source map：产生 `.map` 文件，包括行列信息，loader 也有对应的 sourcemap
- cheap：不包含列信息，只有行信息，没有列信息，loader 也没有对应的 sourcemap，对应的都是 loader 转换后的代码，不是纯正的源代码
- inline：将 `.map` 作为 DataURL 嵌入，不单独生成 `.map` 文件，不推荐使用，因为这样会造成源代码体积巨大
- module：包含 loader 的 sourcemap

(inline-)(cheap-)(module-)(eval-)source-map 按序组合

## 路由懒加载（异步加载）

对于大的 Web 应用来讲，将所有的代码都放在一个文件中显然是不够有效的，特别是当你的某些代码块是在某些特殊的时候才会被使用到。Webpack 异步加载，将代码分割成单独 Chunks，当代码运行到需要它们的时候再进行加载。

适用的场景：

- 抽离相同代码到单个共享块（公共模块） common chunk
- 脚本懒加载，使得初始加载的文件更小

而 Webpack 异步加载就是根据 Async Chunk，当涉及到动态代码拆分时，Webpack 提供了两个类似的技术：

- 使用 Webpack 特定的 require.ensure - 不推荐，历史遗留，主要支持 CommonJS 规范
- import() 语法实现动态导入 - 推荐

以 Vue 为例，Vue 是单页面应用，可能会有很多的路由引入 ，这样使用 webpcak 打包后的文件很大，当进入首页时，加载的资源过多，页面会出现白屏的情况，不利于用户体验。如果我们能把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应的组件，这样就更加高效了。这样会大大提高首屏显示的速度，但是可能其他的页面的速度就会降下来。对于每个路由都使用懒加载的方式引入，则每个模块都会被单独打为一个 js，首屏只会加载当前模块引入的 js。

最终目标是得到一个按需加载的分割点。分割内部也可以再次分割，您可以根据分割构建整个应用程序。这样做的好处是，应用程序的初始有效负载会更小。

Babel 本身不支持动态 import 语法，它需要 `@babel/plugin-syntax-dynamic-import` 配合才能工作。

```js
// .babelrc
{
    "presets": [
        [
            "@babel/preset-env"
        ],
        "@babel/preset-react"
    ],
    "plugins": [
        "@babel/plugin-syntax-dynamic-import"
    ]
}

// 使用如点击按钮懒加载test，通过 webpackJsonp 方法发起一个 jsonp 请求懒加载脚本

loadComponent(){
  import('./test.js').then(()={})
}
```

有时候我们想把某个路由下的所有组件都打包在同个异步块 (chunk) 中。只需要使用命名 chunk：

```js
// webpack 会将任何一个异步模块与相同的块名称组合到相同的异步块中。
const UserDetails = () =>
  import(/* webpackChunkName: "group-user" */ './UserDetails.vue')
const UserDashboard = () =>
  import(/* webpackChunkName: "group-user" */ './UserDashboard.vue')
const UserProfileEdit = () =>
  import(/* webpackChunkName: "group-user" */ './UserProfileEdit.vue')

  
// 或者
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#outputmanualchunks
      output: {
        manualChunks: {
          'group-user': [
            './src/UserDetails',
            './src/UserDashboard',
            './src/UserProfileEdit',
          ],
        },
      },
    },
  },
})
```

## Code Split 代码分割

Webpack 默认会将尽可能多的模块代码打包在一起，优点是能减少最终页面的 HTTP 请求数，但缺点也很明显：

- 页面初始代码包过大，影响首屏渲染性能；
- 无法有效应用浏览器缓存，特别对于 NPM 包这类变动较少的代码，业务代码哪怕改了一行都会导致 NPM 包缓存失效。

Webpack 提供了提取公共代码的分包插件，专门用于根据产物包的体积、引用次数等做分包优化，规避上述问题，特别适合生产环境使用。

- Webpack 4+：SplitChunksPlugin
- Webpack 3：CommonsChunkPlugin

最佳分包策略，包括：

- 针对 `node_modules` 资源：
  - 可以将 `node_modules` 模块打包成单独文件(通过 `cacheGroups` 实现)，防止业务代码的变更影响 NPM 包缓存，同时建议通过 `maxSize` 设定阈值，防止 vendor 包体过大；
  - 更激进的，如果生产环境已经部署 HTTP2/3 一类高性能网络协议，甚至可以考虑将每一个 NPM 包都打包成单独文件，具体实现可查看小册[示例](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2FTecvan-fe%2Fwebpack-book-samples%2Fblob%2F50c9a47ce3%2Fsplitchunks-seperate-npm%2Fwebpack.config.js%23L19-L20)；

- 针对业务代码：
  - 设置 `common` 分组，通过 `minChunks` 配置项将使用率较高的资源合并为 Common 资源；
  - 首屏用不上的代码，尽量以异步方式引入；
  - 设置 `optimization.runtimeChunk` 为 `true`，将运行时代码拆分为独立资源。

Chunk 是 Webpack 实现模块打包的关键设计，Webpack 会首先为 Entry 模块、异步模块、Runtime 模块(取决于配置) 创建 Chunk 容器，之后按照 `splitChunks` 配置进一步优化、裁剪分包内容。

实践中，分包策略的好坏直接影响应用的运行性能，常用策略一是单独打包 `node_modules` 代码(习惯称为 `vendor`)，二是单独打包被频繁使用的模块(习惯称为 `common`)。

- 使用 html-webpack-externals-plugin 基础库分离，通过 CDN 引入，不打入 bundle 中。
- 使用 SplitChunksPlugin 不仅可以分离基础包，还可以提取公共带代码(推荐)。
- 使用 DLLPlugin 预编译资源模块分离基础包(内置插件，更好的分包)
- 使用 hard-source-webpack-plugin 是 DLL 的更好替代者

```js
plugins: [
  new HtmlWebpackPlugin({
      inlineSource: '.css$',
      template: path.join(__dirname, `src/${pageName}/index.html`),
      filename: `${pageName}.html`,
      chunks: ['vendors', pageName], // 'vendors' 分离的基础包 chunks
      inject: true,
        minify: {
          html5: true,
          collapseWhitespace: true,
          preserveLineBreaks: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false
      }
  })
  new HtmlWebpackExternalsPlugin({
    externals: [
      {
        module: 'react',
        entry: 'https://11.url.cn/now/lib/16.2.0/react.min.js',
        global: 'React',
      },
      {
        module: 'react-dom',
        entry: 'https://11.url.cn/now/lib/16.2.0/react-dom.min.js',
        global: 'ReactDOM',
      },
    ]
  }),
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        vendors: {
          test: /(react|react-dom)/,
          name: 'vendors', // 需要在 HtmlWebpackPlugin 的 chunks 中加入
          chunks: 'all'
        },
        commons: {
          name: 'chunk-commons',
          minChunks: 2,
          chunks: 'all'
        }
      }
    }
  }
]
```

引入基础包脚本：

```html
<body>
    <div id="root"><!--HTML_PLACEHOLDER--></div>
    <script type="text/javascript" src="https://11.url.cn/now/lib/16.2.0/react.min.js"></script>
    <script type="text/javascript" src="https://11.url.cn/now/lib/16.2.0/react-dom.min.js"></script>
    <!--INITIAL_DATA_PLACEHOLDER-->
</body>
```

- 使用 html-webpack-externals-plugin 基础库分离，通过 CDN 引入，不打入 bundle 中。
- 使用 SplitChunksPlugin 不仅可以分离基础包，还可以提取公共带代码(推荐)。
- 使用 DLLPlugin 预编译资源模块分离基础包(内置插件，更好的分包)
- 使用 hard-source-webpack-plugin 是 DLL 的更好替代者

使用 HtmlWebpackExternalsPlugin 的方式分离基础包的缺点是一个基础库必须指定一个 CDN，当分离的基础包或业务包多时，会产生很多 `<script>` 插入 html 中；使用 SplitChunksPlugin 分离基础包的缺点是每次会对基础包进行分析。

::: tip Chunk 和 Bundle 的关系

- **Chunk（块）**：指若干个 JS Module 的集合
- **Bundle**：形式上是块的集合，意义是代表一个可以运行的整体
:::

分包原理与实践参考 [分包策略](/devops/webpack/split-chunks.html)

## CDN 动态加载 polyfill

babel-ployfill 打包体积 88.49K，如果每个页面都要做兼容，都要 ployfill，体积就会变大。所以动态按需加载 polyfill。

使用 Ployfill Service 。动态 Polyfill 是根据不同浏览器的特性，载入需要的特性补丁。Polyfill.io 通过尝试使用 polyfill 重新创建缺少的功能，可以轻松地支持不同的浏览器，并且可以大幅度地减少构建体积。Polyfill.io 通过分析请求头信息中的 UserAgent 实现自动加载浏览器所需的 polyfill。

使用方法，直接引入代码即可使用默认配置的 Polyfill：

```html
<script crossOrigin="anonymous" src="https://polyfill.io/v3/polyfill.min.js"></script>

阿里提供的动态 Polyfill 服务：

<script src="https://polyfill.alicdn.com/polyfill.min.js?features=Promise%2CArray.prototype.includes"></script>
```

## 依赖外置并 CDN 加载

`externals` 的主要作用是将部分模块排除在 Webpack 打包系统之外。使用 externals 时必须确保这些外置依赖代码已经被正确注入到上下文环境中，这在 Web 应用中通常可以通过 CDN 方式实现。

`externals` 声明了 react 与 lodash 两个外置依赖，并在后续的 `html-webpack-plugin` 模板中注入这两个模块的 CDN 引用，以此构成完整 Web 应用。

虽然结果上看浏览器还是得消耗这部分流量，但结合 CDN 系统特性，一是能够就近获取资源，缩短网络通讯链路；二是能够将资源分发任务前置到节点服务器，减轻原服务器 QPS 负担；三是用户访问不同站点能共享同一份 CDN 资源副本。所以网络性能效果往往会比重复打包好很多。

## 缩小文件搜索范围

- **优化 resolve.modules 配置**。指定第三方模块存放的绝对路径，避免层层查找，减少搜索步骤，减少模块搜索层级。
- **优化 resolve.mainFields 配置**。尽量少的值可以减少入口文件的搜索步骤。
- **优化 resolve.extensions 配置**。指定定需要 Webpack 解析的文件类型，指定文件扩展名能加快寻找速度
- **合理使用 alias**：当我们代码出现 import 时，Webpack 会采用向上递归搜索的方式去 node_modules 目录下找。为了减少搜索范围我们可以直接告诉 Webpack 去哪个路径下查找。让 Webpack 直接使用第三方模块的压缩版本，不再对库进行解析。缺点是会无法使用 Tree-Shaking 优化输出的打包文件，所以一般对 React 这种整体性比较强的使用比较好，而像 lodash 这样的工具库还是建议使用 Tree-Shaking 去除多余代码，还可以使用别名方便引用文件。
- **noParse**：该属性告诉 Webpack 不用解析某些包。让 Webpack 排除对非模块化库文件的解析。如 jQuery、ChartJS 一些没有采用模块化标准的库，另外如果是用 resovle.alias 配置了 react.min.js，则也应该排除解析，因为 react.min.js 已是经过构建，并且可直接运行在浏览器的、非模块化的文件。被忽略掉的文件里不应该包含 import、 require、 define 等模块化语句，不 然会导致在构建出的代码中包含无法在浏览器环境下执行的模块化语句。
- **使用 IgnorePlugin 的 Webpack 的内置插件**，忽略第三方包指定目录。
- **充分利用 loader 的 include 和 exclude**。使用 include 配置项指明要转换的文件目录，使用 exclude 排除不必解析的文件目录

### 约束 Loader 执行范围

Loader 组件用于将各式文件资源转换为可被 Webpack 理解、构建的标准 JavaScript 代码，正是这一特性支撑起 Webpack 强大的资源处理能力。不过，Loader 在执行内容转换的过程中可能需要比较密集的 CPU 运算，如 babel-loader、eslint-loader、vue-loader 等，需要反复执行代码到 AST，AST 到代码的转换。

使用 module.rules.include、module.rules.exclude 等配置项，限定 Loader 的执行范围 —— 通常可以排除 node_module 文件夹。配置 exclude: /node_modules/ 属性后，Webpack 在处理 node_modules 中的 js 文件时会直接跳过这个 rule 项，不会为这些文件执行 Loader 逻辑。

```javascript
const path = require("path");
module.exports = {
  // ...
  module: {
    rules: [{
      test: /\.js$/,
      exclude: {
        and: [/node_modules/],
        not: [/node_modules\/lodash/]
      },
      use: ["babel-loader", "eslint-loader"]
    }],
  }
};
```

### 使用 noParse 跳过文件编译

有不少 NPM 库已经提前做好打包处理（文件合并、Polyfill、ESM 转 CJS 等），不需要二次编译就可以直接放在浏览器上运行，例如：

- Vue2 的 node_modules/vue/dist/vue.runtime.esm.js 文件；
- React 的 node_modules/react/umd/react.production.min.js 文件；
- Lodash 的 node_modules/lodash/lodash.js 文件。

对我们来说，这些资源文件都是独立、内聚的代码片段，没必要重复做代码解析、依赖分析、转译等操作，此时可以使用 module.noParse 配置项跳过这些资源，例如：

```javascript
// webpack.config.js
module.exports = {
  //...
  module: {
    noParse: /lodash|react/,
  },
};
```

配置后，所有匹配该正则的文件都会跳过前置的构建、分析动作，直接将内容合并进 Chunk，从而提升构建速度。不过，使用 noParse 时需要注意：

- 由于跳过了前置的 AST 分析动作，构建过程无法发现文件中可能存在的语法错误，需要到运行（或 Terser 做压缩）时才能发现问题，所以必须确保 noParse 的文件内容正确性；
- 由于跳过了依赖分析的过程，所以文件中，建议不要包含 import/export/require/define 等模块导入导出语句 —— 换句话说，noParse 文件不能存在对其它文件的依赖，除非运行环境支持这种模块化方案；
- 由于跳过了内容分析过程，Webpack 无法标记该文件的导出值，也就无法实现 Tree-shaking。

### 设置 resolve 缩小搜索范围

**resolve.extensions** **配置：**Webpack 在针对不带后缀名的引入语句时，可能需要执行三次判断逻辑才能完成文件搜索
**resolve.modules** **配置：**当 Webpack 遇到 import 'lodash' 这样的 npm 包导入语句时，会先尝试在当前项目 node_modules 目录搜索资源，如果找不到，则按目录层级尝试逐级向上查找 node_modules 目录，如果依然找不到，则最终尝试在全局 node_modules 中搜索。通过修改 resolve.modules 配置项，主动关闭逐层搜索功能

**resolve.mainFiles** **配置：**实际项目中应控制 resolve.mainFiles 数组数量，减少匹配次数

## 持久化缓存

webpack 的持久化缓存它能够将首次构建的过程与结果数据持久化保存到本地文件系统，在下次执行构建时跳过解析、链接、编译等一系列非常消耗性能的操作，直接复用上次的 Module/ModuleGraph/Chunk 对象数据，迅速构建出最终产物。

- Webpack5 通过配置 cache: 'filesystem' 来开启持久缓存
- Webpack4
  - `cache-loader`：针对 Loader 运行结果的通用缓存方案；
  - `hard-source-webpack-plugin`：针对 Webpack 全生命周期的通用缓存方案；
  - `babel-loader`：针对 Babel 工具的专用缓存能力；
  - `eslint-loader`/`eslint-webpack-plugin`：针对 ESLint 的专用缓存方案；
  - `stylelint-webpack-plugin`：针对 StyleLint 的专用缓存方案。

持久缓存效果非常好，但是对于首次启动的项目来说没有任何提升。那么有没有办法直接提升首次构建速度？

使用 `swc-loader / esbuild-loader` 替换 `babel-loader` 也可以一定程度上减少构建耗时。

ESBuild/SWC 效果也非常不错，但对于部分项目来说无法完全脱离 Babel ，即使使用了 ESBuild 或 SWC 后也会受到来自 node_modules 模块数量过多的影响无法达到更快的构建速度。

关于构建中的缓存策略参考 [持久化缓存](/devops/webpack/cache.html)

## 并行构建

受限于 Node.js 的单线程架构，原生 Webpack 对所有资源文件做的所有解析、转译、合并操作本质上都是在同一个线程内串行执行，CPU 利用率极低，因此，理所当然地，社区出现了一些以多进程方式运行 Webpack。

- [HappyPack](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Famireh%2Fhappypack)：多进程方式运行资源加载(Loader)逻辑 - 已不再维护。
- [Thread-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Floaders%2Fthread-loader%2F)：Webpack 官方出品，同样以多进程方式运行资源加载逻辑。Thread-loader 放在其他 loader 之前，会将之后的 loader 放在一个单独的 worker 池中运行，将串行执行改为并行执行。HappyPack、Thread-loader 都面临着频繁的子进程创建、销毁所带来的性能问题。Thread-loader不能获取 compilation、compiler 等实例对象，也无法获取 Webpack 配置。Thread-loader、HappyPack 这类组件所提供的并行能力都仅作用于文件加载过程，对后续 AST 解析、依赖收集、打包、优化代码等过程均没有影响，理论收益还是比较有限的。
- [Parallel-Webpack](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fparallel-webpack)：多进程方式运行多个 Webpack 构建实例。这种实现，对单 entry 的项目没有任何收益，只会徒增进程创建成本；但特别适合 MPA 等多 entry 场景，或者需要同时编译出 esm、umd、amd 等多种产物形态的类库场景。
- [TerserWebpackPlugin](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fterser-webpack-plugin%23terseroptions)：支持多进程方式执行代码压缩、uglify 功能。

::: danger 相关链接

- [并行构建](/devops/webpack/parallel.html)
:::

## 减少基础模块编译次数

使用 DllPlugin 预编译资源模块分离基础包(内置插件，更好的分离)，将 react，react-dom，redux，react-redux 基础包和业务包打包成一个文件。使用 DllPlugin 进行分包，使用 DllReferencePlugin 对 mainifest.json 引用。

DllPlugin 动态链接库插件，其原理是把网页依赖的基础模块抽离出来打包到 dll 文件中，当需要导入的模块存在于某个 dll 中时，这个模块不再被打包，而是去 dll 中获取。

由于 dll 中大多包含的是常用的第三方模块，如 react、react-dom，所以只要这些模块版本不升级，就只需被编译一次，在之后的构建过程中被动态链接库包含的模块将不会重新编译，而是直接使用动态链接库中的代码。

我认为这样做和配置 resolve.alias 和 module.noParse 的效果有异曲同工的效果。

使用方法:

- DllPlugin - 用于打包出一个个单独的动态链接库文件
- DllReferencePlugin - 用于在主要的配置文件中引入 DllPlugin 插件打包好的动态链接库文件

```js
// webpack.dll.js
module.exports = {
    entry: {
        library: [
            'react',
            'react-dom'
        ]
    },
    output: {
        filename: '[name]_[chunkhash].dll.js',
        path: path.join(__dirname, 'build/library'),
        library: '[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            name: '[name]_[hash]',
            path: path.join(__dirname, 'build/library/[name].json') // mainfest.json 的位置
        })
    ]
};

// webpack.prod.js
new webpack.DllReferencePlugin({
    manifest: require('./build/library/library.json')
}),
```

在 Webpack4 中，`hard-source-webpack-plugin` 是 DLL 的更好替代者。hard-source-webpack-plugin 是 Webpack 的插件，为模块提供中间缓存步骤。为了查看结果，您需要使用此插件运行 Webpack 两次：第一次构建将花费正常的时间。第二次构建将显着加快（大概提升 90%的构建速度）。

## 使用 Prepack 提前求值

Prepack 是一个部分求值器，编译代码时提前将计算结果放到编译后的代码中，而不是在代码运行时才去求值。升代码运行时效率。通过在便一阶段预先执行源码来得到执行结果，再直接将运行结果输出以提升性能。但是现在 Prepack 还不够成熟，**用于线上环境还为时过早**。

```js
const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
module.exports = {
  plugins: [new PrepackWebpackPlugin()],
};
```

## 使用 Scope Hoisting

默认情况下 Webpack 会将模块打包成一个个单独的函数，例如：

```js
// common.js
export default "common";

// index.js
import common from './common';
console.log(common);
```

经过 Webpack 打包后会生成：

```js
"./src/common.js":
  ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
     const __WEBPACK_DEFAULT_EXPORT__ = ("common");
     __webpack_require__.d(__webpack_exports__, {
      /* harmony export */
      "default": () => (__WEBPACK_DEFAULT_EXPORT__)
      /* harmony export */
    });
  }),
"./src/index.js":
  ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      var _common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__( /*! ./common */ "./src/common.js");
      console.log(_common__WEBPACK_IMPORTED_MODULE_0__)
  })
```

现象：

- 构建后代码存在大量的函数闭包包裹代码，导致体积增大，模块越多越明显。
- 运行代码时创建的函数作用域变多，内存开销大

译作“作用域提升”，是在 Webpack3 中推出的功能，它分析模块间的依赖关系，尽可能将被打散的模块合并到一个函数中，但不能造成代码冗余，所以只有被引用一次的模块才能被合并。由于需要分析模块间的依赖关系，所以源码 **必须是采用了ES6 模块化的**，否则 Webpack 会降级处理不采用 Scope Hoisting。将所有模块的代码按照引用顺序放在一个函数作用域里，然后适当的重命名一些变量以防止变量名冲突。

这种处理方式需要将每一个模块都包裹进一段相似的函数模板代码中，好看是好看，但浪费网络流量啊。为此，Webpack 提供了 Scope Hoisting 功能，用于 **将符合条件的多个模块合并到同一个函数空间** 中，从而减少产物体积，优化性能。例如上述示例经过 Scope Hoisting 优化后，生成代码：

```js
((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    ;// CONCATENATED MODULE: ./src/common.js
    /* harmony default export */ const common = ("common");
    
    ;// CONCATENATED MODULE: ./src/index.js
    console.log(common);
})
```

Webpack 提供了三种开启 Scope Hoisting 的方法：

- 使用 `mode = 'production'` 开启生产模式；
- 使用 `optimization.concatenateModules` 配置项；
- 直接使用 `ModuleConcatenationPlugin` 插件。

```js
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

module.exports = {
    // 方法1： 将 `mode` 设置为 production，即可开启
    mode: "production",
    // 方法2： 将 `optimization.concatenateModules` 设置为 true
    optimization: {
        concatenateModules: true,
        usedExports: true,
        providedExports: true,
    },
    // 方法3： 直接使用 `ModuleConcatenationPlugin` 插件
    plugins: [new ModuleConcatenationPlugin()]
};
```

三种方法最终都会调用 `ModuleConcatenationPlugin` 完成模块分析与合并操作。

与 Tree-Shaking 类似，Scope Hoisting 底层基于 ES Module 方案的 [静态特性](https://link.juejin.cn/?target=https%3A%2F%2Fstackoverflow.com%2Fquestions%2F52965907%2Fwhat-is-the-meaning-of-static-import-in-es6)，推断模块之间的依赖关系，并进一步判断模块与模块能否合并，因此在以下场景下会失效：

1. **非 ESM 模块**

遇到 AMD、CMD 一类模块时，由于导入导出内容的动态性，Webpack 无法确保模块合并后不会产生意料之外的副作用，因此会关闭 Scope Hoisting 功能。这一问题在导入 NPM 包尤其常见，许多框架都会自行打包后再上传到 NPM，并且默认导出的是兼容性更佳的 CommonJS 包，因而无法使用 Scope Hoisting 功能，此时可通过 `mainFileds` 属性尝试引入框架的 ESM 版本：

```js
module.exports = {
  resolve: {
    // 优先使用 jsnext:main 中指向的 ES6 模块化语法的文件
    mainFields: ['jsnext:main', 'browser', 'main']
  },
};
```

1. **模块被多个 Chunk 引用**

如果一个模块被多个 Chunk 同时引用，为避免重复打包，Scope Hoisting 同样会失效，例如：

```js
// common.js
export default "common"

// async.js
import common from './common';

// index.js 
import common from './common';
import("./async");
```

示例中，入口 `index.js` 与异步模块 `async.js` 同时依赖 `common.js` 文件，`common.js` 无法被合并入任一 Chunk，而是作为生成为单独的作用域，最终打包结果：

```js
 "./src/common.js":
  (() => {
    var __WEBPACK_DEFAULT_EXPORT__ = ("common");
  }),
 "./src/index.js":
  (() => {
    var _common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__( /*! ./common */ "./src/common.js");
    __webpack_require__.e( /*! import() */ "src_async_js").then(__webpack_require__.bind(__webpack_require__, /*! ./async */ "./src/async.js"));
  }),  
```

## 语言包优化

如果最开始选择日期库，那直接推荐使用 dayjs 了，如果你选择了 moment ，一定要注意把不使用的语言包过滤掉，推荐使用 ContextReplacementPlugin，它会告诉 webpack 我们会使用到哪个本地文件：

```js
plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
  ]
```

或使用内置插件 webpack.IgnorePlugin:

```js
plugins: [
    //忽略 moment 下的 ./locale 目录
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
```

在使用的时候，如果我们需要指定语言，那么需要我们手动的去引入语言包，例如，引入中文语言包:

```js
import moment from 'moment';
// 手动引入
import 'moment/locale/zh-cn';
```

## 多页面打包优化

- 页面间解耦
- 更友好 SEO

利用 glob 动态获取 entry 和设置 html-webpack-plugin 数量

```js
// 设置多页应用
const setMPA = () => {
    const entry = {};
    const htmlWebpackPlugins = [];
    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));

    Object.keys(entryFiles).map((index) => {
            const entryFile = entryFiles[index];

            const match = entryFile.match(/src\/(.*)\/index\.js/);
            const pageName = match && match[1];

            entry[pageName] = entryFile;
            htmlWebpackPlugins.push(
                new HtmlWebpackPlugin({
                    inlineSource: '.css$',
                    template: path.join(__dirname, `src/${pageName}/index.html`),
                    filename: `${pageName}.html`,
                    chunks: ['vendors', pageName], // 'vendors' 分离的基础包 chunks
                    inject: true,
                    minify: {
                        html5: true,
                        collapseWhitespace: true,
                        preserveLineBreaks: false,
                        minifyCSS: true,
                        minifyJS: true,
                        removeComments: false
                    }
                })
            );
        });

    return {
        entry,
        htmlWebpackPlugins
    }
}

const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
    entry: entry,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]_[chunkhash:8].js'
    },
    mode: 'production',
    plugins: [].concat(htmlWebpackPlugins)
}
```

## 激进合并

Webpack 通过两个插件提供对生成的块的更多控制：AggressiveSplittingPlugin 和 AggressiveMergingPlugin。

- AggressiveSplittingPlugin： 产生更多的小块 bundles，但同时会增加客户端的请求数量（HTTP2 采取多路复用，可以很好适应）
- AggressiveMergingPlugin： 产生更少的 bundles

如果你分成多个小的块，对于客户端缓存来说是比较有利的；但是，在 HTTP/1 环境中还会有额外的请求开销。目前，由于 HtmlWebpackPlugin 中的 BUG，如果启用该插件，这个方法不会起作用。

## PWA 优化策略

在你第一次访问一个网站的时候，如果成功，做一个缓存，当服务器挂了之后，你依然能够访问这个网页 ，这就是 PWA。

```js
 cnpm i workbox-webpack-plugin -D

const WorkboxPlugin = require('workbox-webpack-plugin') // 引入 PWA 插件
const prodConfig = {
  plugins: [
    // 配置 PWA
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    })
  ]
}

在入口文件加上
// 判断该浏览器支不支持 serviceWorker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('service-worker registed')
      })
      .catch(error => {
        console.log('service-worker registed error')
      })
  })
}
```

## 按需编译

 [lazyCompilation](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fconfiguration%2Fexperiments%2F%23experimentslazycompilation) 用于实现 entry 或异步引用模块的**按需编译.**

### 背景

项目中有一个入口（entry）文件及若干按路由划分的异步模块，Webpack 启动后会立即将这些入口与异步模块全部一次性构建好 —— 即使页面启动后实际上只是访问了其中一两个异步模块， 这些花在异步模块构建的时间着实是一种浪费！

### 用法

```javascript
// webpack.config.js
module.exports = {
  // ...
  experiments: {
    lazyCompilation: true,
  },
};
```

### 原理

启动 lazyCompilation 后，代码中通过异步引用语句如 `import('./xxx')` 导入的模块（以及未被访问到的 entry）都不会被立即编译，而是直到页面正式请求该模块资源（例如切换到该路由）时才开始构建，效果与 Vite 相似，能够极大提升冷启速度。不过，lazyCompilation 还处于实验阶段，无法保证稳定性，接口形态也可能发生变更，建议只在开发环境使用。
