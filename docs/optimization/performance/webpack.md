# 构建层面优化

## 分离样式

通过 css-loader，style-loader，postcss-loader，less-loader/sass-loader(node-sass/fast-sass-loader)等一系列 loader 打包好了 css，但是它们都内联到了 js 中，这样会存在以下几个问题：

- 使得 css 无法缓存
- 增加了 js 文件体积
- 未样式化元素闪动（FOUC）问题

发生 FOUC 是因为浏览器需要一段时间才能加载 JavaScript，并且到那时才会应用样式。将 CSS 分离到自己的文件可以让浏览器单独管理它，并将 css 的加载放在 js 加载前(即通常将 js 的引入放在 `<body>` 尾部)，从而避免了这个问题。

**mini-css-extract-plugin** 分离样式，生成单独的 css 样式文件。它可以将多个 CSS 文件聚合为一个。出于这个原因，它配备了一个 loader(MiniCssExtractPlugin.loader) 来专门处理这个过程。然后，插件会获取 loader 抽取的结果并发出单独的文件。由于这个过程会产生比较大的开销，所以，MiniCssExtractPlugin 只会作用于编译阶段，它不适用于热模块更换（HMR）。鉴于这个插件只是在生产环境中使用，所以也不是什么大的问题。

::: tip 注意

- style-loader 用于将 css 通过 `<style>` 标签插入到 `<head>` 中，违背了 **mini-css-extract-plugin** 分离样式，所以 style-loader 不能与 MiniCssExtractPlugin 同时使用。需要使用 MiniCssExtractPlugin.loader 替代 style-loader 。

- css-loader 用于加载 `.css` 文件，并且转换成 commonjs 对象。

:::

::: tip 文件指纹策略补充
- js 文件使用 `[name]_[chunkhash:8].js`
- css 文件使用 `[name]_[contenthash:8].css`
- 图片 文件使用 `[name]_[hash:8].[ext]`
:::

## 静态资源内联

```html
<head>
    ${ require('raw-loader!./meta.html')}
    <title>Document</title>
    <script>${ require('raw-loader!babel-loader!../../node_modules/lib-flexible/flexible.js')}</script>
</head>
```

## 图片内联与压缩

加载大量小的资源会使基于 HTTP/1 的应用变慢，因为每个请求都会产生开销。HTTP/2 在这方面有所改善，并且在某种程度上改变了这种情况。除了使用 HTTP/2 外，webpack 也有一些优化办法：

- 使用 `url-loader` 内联资源，将小图像转为 base64 形式的字符串，从而减少 HTTP 请求，但是它会增加打包结果的尺寸，生产环境可能不太适合。
- 使用 `file-loader` 对其延迟加载同时为较大的文件生成单独的请求地址。file-loader 能够将导入的图片存放到特定的目录，并返回图片的路径地址。此技术适用于其他类型的资源，例如字体。
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

## 压缩混淆净化 HTML/JS/CSS

### 压缩 HTML

使用 HtmlWebpackPlugin 插入引用，根据模版生成 HTML，压缩 HTML。

- filename：表示输出的文件名
- template：模版文件
- removeComments：移除 HTML 中的注释
- collapseWhitespace：删除空白符与换行符
- inlineSource：插入到 HTML 的 CSS、JS 文件要内联，即不是以 link、script 形式引入
- inject：是否能注入内容到输出的页面
- chunks：指定插入某些模块
- hash：每次会在插入的文件后面加上 hash，用于处理缓存
- 其他：favicon、meta、title 页面内使用 `<%= htmlWebpackPlugin.options.title %>` 即可

### 压缩净化 CSS

- css-loader?minimize。css-loader 内置了 cssnano，只需要使用 css-loader?minimize 就可以开启 cssnano 压缩。
- PurifyCSSPlugin。需要配置 extract-text-webpack-plugin 使用，它主要的作用是可以去除没有用到的 CSS 代码，类似 JS 的 TreeShaking。PurifyCSSPlugin 已停止维护，使用 PurgecssPlugin 替代，配合 MiniCssExtractPlugin 使用。
- MiniCssExtractPlugin 用于提取 CSS。
- OptimizeCssAssetsWebpackPlugin 用于压缩 CSS。

### 压缩净化 JavaScript

webpack4 只要在生产模式下，JS 代码就会自动压缩。

- Webpack 内置 UglifyJS(UglifyjsWebpackPlugin) 插件
- ParallelUglifyPlugin
- TerserWebpackPlugin(webpack4 替代推荐)

在 Webpack 4 中，通过两个配置字段控制压缩过程：optimization.minimize 字段切换压缩处理器，而 optimization.minimizer 数组用来配置压缩处理器。

会分析 JavaScript 代码语法树，理解代码的含义，从而做到去除无效代码、去掉日志输出代码、缩短变量名等优化。产环境必备:

- 压缩混淆代码
- 降低浏览加载资源体积
- 降低页面渲染时间
- 防止反向编译工程的可能性


### 使用 TreeShaking

webpack4 生产环境默认开启。

TreeShaking 可以去除无用代码，它依赖于 ES6 的 import、export 的模块化语法，最先在 Rollup 中出现，Webpack2.0 开始引入使用。适合用于 lodash、utils.js 等工具类较分散的文件。

#### DCE (Elimination)

- 代码不会被执行到，不可达
- 代码执行的结果不会被用到
- 代码只会影响死变量(只写不读)

#### TreeShaking 原理

- 利用 ES6 模块化语法
  - 只能作为模块顶层的语句出现
  - import 的模块只能时字符串常量(不能动态)
  - import binding 时 immutable 的(不能修改)
- 压缩阶段删除无用的代码


它正常工作的前提是代码必须采用 ES6 的模块化语法，因为 ES6 模块化语法是静态的（在导入、导出语句中的路径必须是静态字符串，且不能放入其他代码块中）。

在项目中使用大量第三方库时，我们会发现 TreeShaking 似乎不生效了，原因是大部分 NPM 中的代码都采用了 CommonJS 语法，这导致 TreeShaking 无法正常工作而降级处理。但幸运的是，有些库考虑到了这一点，这些库在发布到 NPM 上时会同时提供两份代码，一份采用 CommonJS 模块化语法，一份采用 ES6 模块化语法。


以下是压缩 HTML/CSS/JS，分离CSS，文件指纹策略，移动端 rem + lib-flexible 适配方案 简单示例：

```js
const PATHS = {
    src: path.join(__dirname, 'src')
};

module.exports = {
    entry: {
        index: './src/index.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]_[chunkhash:8].js'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /.js$/,
                use: 'babel-loader'
            },
            {
                test: /.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer')({
                                    browsers: ['last 2 version', '>1%', 'ios 7']
                                })
                            ]
                        }
                    },
                     {
                        loader: 'px2rem-loader',
                        options: {
                            remUnit: 75,
                            remPrecision: 8
                        }
                    }
                ]
            },
            {
                test: /.(png|jpg|gif|jpeg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name]_[hash:8].[ext]'
                        }
                    }
                ]
            },
            {
                test: /.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]_[hash:8][ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name]_[contenthash:8].css'
        }),
        new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }), // 需要绝对路径
        })
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            /**
             * cssnano 是一个 PostCSS 插件，可以添加到你的构建流程中，
             * 用于确保最终生成的 用于生产环境的 CSS 样式表文件尽可能的小。
             * 
             * cssnano 基于 PostCSS 来处理 CSS 代码。因为很多 现代化的 CSS 工具都是基于 PostCSS 开发的，
             * 因此你可以把这些工具组合起来 并生成一棵单一的抽象语法树（AST）。
             * 这就意味着总的处理时间 减少了，因为 CSS 不再需要进行多次解析了
             */
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions: {
              // 预设
              preset: ['default', {
                  discardComments: {
                    removeAll: true,
                  },
                  normalizeUnicode: false
                }]
              },
              canPrint: true
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html'),
            filename: 'index.html',
            chunks: ['index'],
            inject: true,
            minify: {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false
            }
        }),
        new CleanWebpackPlugin(),
        new HardSourceWebpackPlugin()
    ]
};
```

## 代码分割

代码分割以按需加载、分离基础库，提取公共代码。

单页应用的一个问题在于使用一个页面承载复杂的功能，要加载的文件体积很大，不进行优化的话会导致首屏加载时间过长，影响用户体验。做按需加载可以解决这个问题。具体方法如下：

将网站功能按照相关程度划分成几类。每一类合并成一个 Chunk，按需加载对应的 Chunk 例如，只把首屏相关的功能放入执行入口所在的 Chunk，这样首次加载少量的代码，其他代码要用到的时候再去加载。最好提前预估用户接下来的操作，提前加载对应代码，让用户感知不到网络加载

目前，生产环境下的打包结果是单个 JavaScript 文件。如果更改了代码，则客户端也必须重新下载整个包，包括一些外部依赖包。最好的结果是只下载更改的部分。如果外部依赖包发生更改，则客户端应仅获取依赖包。对于应用本身的代码也是如此。在 Webpack4 我们可以使用 optimization.splitChunks.cacheGroups 来进行 **分割打包**。通过分割打包，您可以将外包依赖项单独打包，并从客户端级别缓存中受益。执行了该过程，应用程序的整个大小依然保持不变。尽管需要执行的请求越多，会产生轻微的开销，但缓存的好处弥补了这一成本。

Webpack 提供了提取公共代码的分包插件，根据版本不同使用不同的插件：

- Webpack 4+：SplitChunksPlugin
- Webpack 3：CommonsChunkPlugin

::: tip 注意
要正确使打包结果无效，必须将哈希附加到生成的 bundle 中(使用文件指纹策略向输出文件名添加占位符)。
:::

提取策略：

- 根据网站所使用的技术栈，找出网站的所有页面都需要用到的基础库，以采用 React 技术栈的网站为例，所有页面都会依赖 react、react-dom 等库，将它们提取到一个单独的文件 base.js 中，该文件包含了所有网页的基础运行环境。（为了长期缓存 base.js 文件）
- 在剔除了个页面中被 base.js 包含的部分代码后，再找出所有页面都依赖的公共部分代码，将它们提取出来并放到 common.js 中。
- 再为每个页面都生成一个单独的文件，而只包含各个页面单独需要的部分代码。

生成算法：
- Webpack 先将 entry 中对应的 module 都生成一个新的 Chunk
- 遍历 module 的依赖列表，将依赖的 module 也加入到 Chunk 中
- 如果一个依赖 module 是动态引入的模块，那么就会根据这个 module 创建一个新的 Chunk，继续遍历依赖
- 重复上面的过程，直至得到所有的 Chunks

::: tip Chunk 和 Bundle 的关系
- **Chunk（块）**：指若干个 JS Module 的集合
- **Bundle**：形式上是块的集合，意义是代表一个可以运行的整体
:::

- 使用 html-webpack-externals-plugin 基础库分离，通过 CDN 引入，不打入 bundle 中。
- 使用 SplitChunksPlugin 不仅可以分离基础包，还可以提取公共带代码(推荐)。
- 使用 DLLPlugin 预编译资源模块分离基础包(内置插件，更好的分包)
- 使用 hard-source-webpack-plugin 是 DLL 的更好替代者

- async 异步引入的库进行分离(默认)
- inital 同步引入的库进行分离
- all 所用引入的库进行分离(推荐)

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


## 代码拆分

对于大的 Web 应用来讲，将所有的代码都放在一个文件中显然是不够有效的，特别是当你的某些代码块是在某些特殊的时候才会被使用到。Webpack 有一个功能就是将你的代码库分割成 Chunks（语块），当代码运行到需要它们的时候再进行加载。

适用的场景：

- 抽离相同代码到单个共享块
- 脚本懒加载，使得初始加载的文件更小

Webpack 中以两种主要方式完成代码拆分：

- CommonJS：require.ensure
- ES6：动态 import（目前还没有原生支持，需要 Babel 转换）

最终目标是得到一个按需加载的分割点。分割内部也可以再次分割，您可以根据分割构建整个应用程序。这样做的好处是，应用程序的初始有效负载会更小。

Babel 本身不支持动态 import 语法，它需要 @babel/plugin-syntax-dynamic-import 配合才能工作。

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

## 动态 polyfill

babel-ployfill 打包体积 88.49K，如果每个页面都要做兼容，都要 ployfill，体积就会变大。所以动态按需加载 polyfill。

使用 Ployfill Service 。动态 Polyfill 是根据不同浏览器的特性，载入需要的特性补丁。Polyfill.io 通过尝试使用 polyfill 重新创建缺少的功能，可以轻松地支持不同的浏览器，并且可以大幅度地减少构建体积。Polyfill.io 通过分析请求头信息中的 UserAgent 实现自动加载浏览器所需的 polyfill。

使用方法，直接引入代码即可使用默认配置的 Polyfill：

```html
<script crossOrigin="anonymous" src="https://polyfill.io/v3/polyfill.min.js"></script>

阿里提供的动态 Polyfill 服务：

<script src="https://polyfill.alicdn.com/polyfill.min.js?features=Promise%2CArray.prototype.includes"></script>
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

## 缩小文件搜索范围

- **优化 resolve.modules 配置**。指定第三方模块存放的绝对路径，避免层层查找，减少搜索步骤，减少模块搜索层级。
- **优化 resolve.mainFields 配置**。尽量少的值可以减少入口文件的搜索步骤。
- **优化 resolve.extensions 配置**。指定定需要 Webpack 解析的文件类型，指定文件扩展名能加快寻找速度
- **合理使用 alias**：当我们代码出现 import 时，Webpack 会采用向上递归搜索的方式去 node_modules 目录下找。为了减少搜索范围我们可以直接告诉 Webpack 去哪个路径下查找。让 Webpack 直接使用第三方模块的压缩版本，不再对库进行解析。缺点是会无法使用 Tree-Shaking 优化输出的打包文件，所以一般对 React 这种整体性比较强的使用比较好，而像 lodash 这样的工具库还是建议使用 Tree-Shaking 去除多余代码，还可以使用别名方便引用文件。
- **noParse**：该属性告诉 Webpack 不用解析某些包。让 Webpack 排除对非模块化库文件的解析。如 jQuery、ChartJS 一些没有采用模块化标准的库，另外如果是用 resovle.alias 配置了 react.min.js，则也应该排除解析，因为 react.min.js 已是经过构建，并且可直接运行在浏览器的、非模块化的文件。被忽略掉的文件里不应该包含 import、 require、 define 等模块化语句，不 然会导致在构建出的代码中包含无法在浏览器环境下执行的模块化语句。
- **使用 IgnorePlugin 的 Webpack 的内置插件**，忽略第三方包指定目录。
- **充分利用 loader 的 include 和 exclude**。使用 include 配置项指明要转换的文件目录，使用 exclude 排除不必解析的文件目录

## 构建缓存策略

提升二次构建速度。node-module 中 .cache 文件下有缓存记录。缓存思路：

- babel-loader 开启缓存
- terser-webpack-plugin 开启缓存
- 使用 cache-loader 或者 hard-source-webpack-plugin

## 多进程/多线程构建与压缩

影响前端发布速度的有两个方面，一个是构建，一个就是压缩，把这两个东西优化起来，可以减少很多发布的时间。

运行在 Node.js 之上的 webpack 是单线程模式的，也就是说，webpack 打包只能逐个文件处理，当 webpack 需要打包大量文件时，打包时间就会比较漫长。

多进程/多实例构建的方案比较知名的有以下三种：

- parallel-webpack
- HappyPack(webpack3使用较多，不怎么维护了)
- thread-loader(webpack4 用于替换 HappyPack)

### 使用 HappyPack 多进程/多实例构建

在 Webpack 构建过程中，实际上耗费时间大多数用在 loader 解析转换以及代码的压缩中，HappyPack 可利用多线程对文件进行打包（默认 CPU 核数 - 1），对多核 CPU 利用率更高。

HappyPack 可以通过 HappyPackPool 线程池将任务分解给多个子进程，最后将结果发给主进程。JS 是单线程模型，只能通过这种多进程的方式提高性能。

HappyPack  就能让 Webpack 做到这点，它把任务分解给 多个子进程 去并发的执行，子进程处理完后再把结果发送给主进程。

HappyPack 的处理思路是开启多进程 Loader 转换，将原有的 Webpack 对 loader 的执行过程从单一进程的形式扩展多进程模式，原本的流程保持不变。使用 HappyPack 也有一些限制，它只兼容部分主流的 loader，具体可以查看官方给出的 兼容性列表。

::: tip 注意
由于 HappyPack 对 file-loader、url-loader 支持的不友好，所以不建议对这些 loader 使用。
:::

### 使用 thread-loader 多进程/多实例构建

原理：每次 webpack 解析一个模块，thread-loader 会将它及它的依赖分配给 worker 线程中


使用 thread-loader 或 HappyPack 多进程/多实例构建简单 DEMO：

```js
module.exports = {
    entry: entry,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]_[chunkhash:8].js'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /.js$/,
                include: path.resolve('src'),
                use: [
                    {
                         loader: 'thread-loader',
                         options: {
                             workers: 3
                         }
                     },
                    'cache-loader',
                    'babel-loader',
                    'happypack/loader'
                    'eslint-loader'
                ]
            },
        ],
        plugins: [
          new HappyPack({
            // 3) re-add the loaders you replaced above in #1:
            loaders: [ 'babel-loader?cacheDirectory=true' ]
        }),
        ]
    }
```

### 使用 TerserWebpackPlugin 多进程/多线程并行压缩

`terser-webpack-plugin` 是一个使用 terser 压缩 JS 的 Webpack 插件。开启 parallel 参数，使用多进程并行运行来提高构建速度。默认并发运行数：`os.cpus().length - 1`。并行化可以显著提高构建速度，因此强烈建议使用。TerserWebpackPlugin 支持 ES6 语法的压缩，UglifyjsWebpackPlugin 不支持。

```js
optimization: {
    minimizer: [
        new TerserPlugin({
            parallel: true,
            cache: true
        })
    ]
},
```

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

## 使用 Prepack 提前求值

Prepack 是一个部分求值器，编译代码时提前将计算结果放到编译后的代码中，而不是在代码运行时才去求值。升代码运行时效率。通过在便一阶段预先执行源码来得到执行结果，再直接将运行结果输出以提升性能。但是现在 Prepack 还不够成熟，**用于线上环境还为时过早**。

```js
const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
module.exports = {
  plugins: [new PrepackWebpackPlugin()],
};
```

## 使用 Scope Hoisting

webpack4 生产环境默认开启 ModuleConcatenationPlugin。

现象：
- 构建后代码存在大量的函数闭包包裹代码，导致体积增大，模块越多越明显。
- 运行代码时创建的函数作用域变多，内存开销大

译作“作用域提升”，是在 Webpack3 中推出的功能，它分析模块间的依赖关系，尽可能将被打散的模块合并到一个函数中，但不能造成代码冗余，所以只有被引用一次的模块才能被合并。由于需要分析模块间的依赖关系，所以源码 **必须是采用了ES6 模块化的**，否则 Webpack 会降级处理不采用 Scope Hoisting。将所有模块的代码按照引用顺序放在一个函数作用域里，然后适当的重命名一些变量以防止变量名冲突。

```js
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
module.exports = {
    //...
    plugins:[
        new ModuleConcatenationPlugin();
    ],
    resolve:{
        mainFields:['jsnext:main','browser','main']
    }
}
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

::: warning 参考文献
[Webpack Guidebook](https://tsejx.github.io/webpack-guidebook/)

[Vue 项目性能优化 — 实践指南](https://juejin.cn/post/6922641008106668045#heading-0)

[项目不知道如何做性能优化？不妨试一下代码分割(代码分割原理)](https://juejin.cn/post/6844904101134729229)

[网站性能优化实战——从12.67s到1.06s的故事](https://juejin.cn/post/6844903655330562062#heading-3)

[在京东，我们这样配置webpack](https://jelly.jd.com/article/5ee390707c53070156dd4078)
:::