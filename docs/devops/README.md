# Webpack 常用配置

::: danger 注意
Webpack 常用配置在 Webpack 不同版本间有所差异，详细配置以官网为主
:::

## entry

entry 对象是用于 webpack 查找启动并构建 bundle。其上下文是入口文件所处的目录的绝对路径的字符串。

### context

基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader。默认使用当前目录，但是推荐在配置中传递一个值。这使得你的配置独立于 CWD(current working directory - 当前执行路径)。

Webpack 在寻找相对路径的文件时会以 context 为根目录，context 默认为执行启动 Webpack 时所在的当前工作目录。 如果想改变 context 的默认配置，则可以在配置文件里这样设置它：

```javascript
module.exports = {
  //...
  context: path.resolve(__dirname, 'app')
};
```

Entry 的路径和其依赖的模块的路径可能采用相对于 context 的路径来描述，context 会影响到这些相对路径所指向的真实文件。

::: danger 注意
 context 必须是一个绝对路径的字符串。 除此之外，还可以通过在启动 Webpack 时带上参数 webpack --context 来设置 context。
:::

### entry

简单规则：每个 HTML 页面都有一个入口起点。单页应用(SPA)：一个入口起点，多页应用(MPA)：多个入口起点。
如果传入一个字符串或字符串数组，chunk 会被命名为 main。如果传入一个对象，则每个键(key)会是 chunk 的名称，该值描述了 chunk 的入口起点。

entry 有以下几种设置

```javascript
module.exports = {
  // String类型
  entry: './src/main.js' // 可以是相对路径 chunk 默认为 main
  // Object类型
  entry:{
    app: './src/main.js'  // chunk 为 app 
  }
  // Array类型
  entry: ['./app/entry1', './app/entry2']
  // 多个入口 Object类型
  entry: {
    home: './home.js',
    about: './about.js',
    contact: './contact.js'
  }
  // 多个入口 混合类型
  entry: {
    a: './app/entry-a',
    b: ['./app/entry-b1', './app/entry-b2']
  } 
  // 动态入口
  entry: () => './demo' // 同步
  // 或者 Array 数组类型
  entry: () => new Promise((resolve) => resolve(['./demo', './demo2'])) // 异步
  // 同步函数
  entry: () => {
    return { a:'./pages/a',b:'./pages/b'}
  }
  // 异步函数
  entry: () => {
    return new Promise((resolve)=>{
      resolve({ a:'./pages/a',b:'./pages/b'});
    });
  }
};
```

如果是 array 类型，则搭配 output.library 配置项使用时，只有数组里的最后一个入口文件的模块会被导出。

::: tip 知识点
Webpack 会为每个生成的 Chunk 取一个名称，Chunk 的名称和 Entry 的配置有关：

- 如果 entry 是一个 string 或 array，就只会生成一个 Chunk，这时 Chunk 的名称是 main；
- 如果 entry 是一个 object，就可能会出现多个 Chunk，这时 Chunk 的名称是 object 键值对里键的名称。
:::

动态 entry 的使用场景是：当有多个页面需要为每个页面的入口配置一个 Entry ，但这些页面的数量可能会不断增长，则这时 Entry 的配置会受到到其他因素的影响导致不能写成静态的值。
其解决方法是把 Entry 设置成一个函数去动态返回上面所说的配置。

## output

output 是一个 object，里面包含一系列配置项，下面分别介绍它们。

### path

output.path 配置输出文件存放在本地的目录，必须是 string 类型的绝对路径。通常通过 Node.js 的 path 模块去获取绝对路径：

```javascript
module.exports = {
  //...
  output: {
    path: path.resolve(__dirname, 'dist/assets')
    // 常见
    path: config.build.assetsRoot 
    // 其中config.build.assetsRoot = path.resolve(__dirname, '..dist') 当前工作目录下dist文件
  }
};
```

### filename

当通过多个入口起点(entry point)、代码拆分(code splitting)或各种插件(plugin)创建多个 bundle，就需要借助模版和变量了。前面说到 Webpack 会为每个 Chunk取一个名称，
可以根据 Chunk 的名称来区分输出的文件名：

```javascript
module.exports = {
  //...
  output: {
    filename: '[name].bundle.js'
    // 或者
    filename: '[name].[hash].bundle.js'
  }
};
```

代码里的 `[name]` 代表用内置的 name 变量去替换 `[name]`，这时你可以把它看作一个字符串模块函数， 每个要输出的 Chunk 都会通过这个函数去拼接出输出的文件名称。

内置变量除了 name 还包括：

- id： Chunk 的唯一标识，从0开始
- name： Chunk 的名称
- hash： Chunk 的唯一标识的 Hash 值
- chunkhash：  Chunk 内容的 Hash 值
- query：  模块的 query，例如，文件名 ? 后面的字符串

`[hash]` 和 `[chunkhash]` 的长度可以使用 `[hash:16]`（默认为20）来指定。或者，通过指定 output.hashDigestLength 在全局配置长度。

::: danger 注意
注意 ExtractTextWebpackPlugin 插件是使用 contenthash 来代表哈希值而不是 chunkhash，
原因在于 ExtractTextWebpackPlugin 提取出来的内容是代码内容本身而不是由一组模块组成的 Chunk。

在使用 ExtractTextWebpackPlugin 时，可以用 `[contenthash]`来获取提取文件的 hash（既不是 `[hash]` 也不是 `[chunkhash]`）。
:::

### chunkFilename

output.chunkFilename 配置无入口的 Chunk 在输出时的文件名称。 chunkFilename 和上面的 filename 非常类似，
但 chunkFilename 只用于指定在运行过程中生成的 Chunk 在输出时的文件名称。
常见的会在运行时生成 Chunk 场景有在使用 CommonChunkPlugin、使用 import('path/to/module') 动态加载等时。 chunkFilename 支持和 filename 一致的内置变量。

### publicPath

对于按需加载(on-demand-load)或加载外部资源(external resources)（如图片、文件等）来说，output.publicPath 是很重要的选项。
如果指定了一个错误的值，则在加载这些资源时会收到 404 错误。

在复杂的项目里可能会有一些构建出的资源需要异步加载，加载这些异步资源需要对应的 URL 地址。

output.publicPath 配置发布到线上资源的 URL 前缀，为string 类型。 默认值是空字符串 ''，即使用相对路径。

这样说可能有点抽象，举个例子，需要把构建出的资源文件上传到 CDN 服务上，以利于加快页面的打开速度。配置代码如下：

```javascript
filename:'[name]_[chunkhash:8].js'
publicPath: 'https://cdn.example.com/assets/'
```

这时发布到线上的 HTML 在引入 JavaScript 文件时就需要：

```html
<script src='https://cdn.example.com/assets/a_12345678.js'></script>
```

output.path 和 output.publicPath 都支持字符串模版，内置变量只有一个：hash 代表一次编译操作的 Hash 值。

```javascript
module.exports = {
  //...
  output: {
    // One of the below
    publicPath: 'https://cdn.example.com/assets/', // CDN（总是 HTTPS 协议）
    publicPath: '//cdn.example.com/assets/', // CDN（协议相同）
    publicPath: '/assets/', // 相对于服务(server-relative)
    publicPath: 'assets/', // 相对于 HTML 页面
    publicPath: '../assets/', // 相对于 HTML 页面
    publicPath: '', // 相对于 HTML 页面（目录相同）
  }
};
```

### crossOriginLoading

Webpack 输出的部分代码块可能需要异步加载，而异步加载是通过 JSONP 方式实现的。 JSONP 的原理是动态地向 HTML 中插入一个 <script src="url"></script> 标签去加载异步资源。
output.crossOriginLoading 则是用于配置这个异步插入的标签的 crossorigin 值。

只用于 target 是 web，使用了通过 script 标签的 JSONP 来按需加载 chunk。script 标签的 crossorigin 属性可以取以下值：

- crossOriginLoading: false - 禁用跨域加载（默认）
- crossOriginLoading: 'anonymous' - 不带凭据(credential)启用跨域加载 在加载此脚本资源时不会带上用户的 Cookies
- crossOriginLoading: 'use-credentials' - 带凭据(credential)启用跨域加载 with credentials 在加载此脚本资源时会带上用户的 Cookies

通常用设置 crossorigin 来获取异步加载的脚本执行时的详细错误信息。

### libraryTarget 和 library

当用 Webpack 去构建一个可以被其他模块导入使用的库时需要用到它们。它们通常搭配在一起使用。

- output.libraryTarget 配置以何种方式导出库。
- output.library 配置导出库的名称。

output.libraryTarget 是字符串的枚举类型，支持以下配置。

## mode

mode 配置选项，告知 webpack 使用相应环境的内置优化。能的值有：none, development 或 production（默认）。

使用方式：

```javascript
module.exports = {
  mode: 'production'
};

或者通过cli命令

webpack --mode=production
```

如果没有设置，webpack 会将 mode 的默认值设置为 production。

::: danger 注意
设置 NODE_ENV 并不会自动地设置 mode
:::

| 选项 | 描述 |
| :-----| :---- |
| development | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 development。启用 NamedChunksPlugin 和 NamedModulesPlugin。 |
| production | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 production。启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, SideEffectsFlagPlugin 和 TerserPlugin。 |
| none | 退出任何默认优化选项 |

## module

### noParse

防止 webpack 解析那些任何与给定正则表达式相匹配的文件。忽略的文件中不应该含有 import, require, define 的调用，或任何其他导入机制。忽略大型的 library 可以提高构建性能。

忽略对部分没采用模块化的文件的递归解析和处理，提高构建性能。例如 jQuery 、ChartJS 它们庞大又没有采用模块化标准，让 Webpack 去解析这些文件耗时又没有意义。

noParse 是可选配置项，类型需要是 `RegExp`、`[RegExp]`、`function` 其中一个。

```javascript
// 使用正则表达式
noParse: /jquery|chartjs/

// 使用函数，从 Webpack 3.0.0 开始支持
noParse: (content)=> {
  // content 代表一个模块的文件路径
  // 返回 true or false
  return /jquery|chartjs/.test(content);
}
```

### parser

解析器(parser)可以查阅这些选项，并相应地禁用或重新配置。大多数默认插件，会如下解释值：

- 将选项设置为 false，将禁用解析器。
- 将选项设置为 true，或不修改将其保留为 undefined，可以启用解析器。
然而，一些解析器(parser)插件可能不光只接收一个布尔值。例如，内部的 NodeStuffPlugin 差距，可以接收一个对象，而不是 true，来为特定的规则添加额外的选项。

因为 Webpack 是以模块化的 JavaScript 文件为入口，所以内置了对模块化 JavaScript 的解析功能，支持 AMD、CommonJS、SystemJS、ES6。
parser 属性可以更细粒度的配置哪些模块语法要解析哪些不解析，和 noParse 配置项的区别在于 parser 可以精确到语法层面， 而 noParse 只能控制哪些文件不被解析。

默认的插件解析器 parser 如下：

```javascript
module.exports = {
  //...
  module: {
    rules: [
      {
        //...
        parser: {
          amd: false, // 禁用 AMD
          commonjs: false, // 禁用 CommonJS
          system: false, // 禁用 SystemJS
          harmony: false, // 禁用 ES2015 Harmony import/export
          requireInclude: false, // 禁用 require.include
          requireEnsure: false, // 禁用 require.ensure
          requireContext: false, // 禁用 require.context
          browserify: false, // 禁用特殊处理的 browserify bundle
          requireJs: false, // 禁用 requirejs.*
          node: false, // 禁用 __dirname, __filename, module, require.extensions, require.main 等。
          node: {...} // 在模块级别(module level)上重新配置 node 层(layer)
        }
      }
    ]
  }
}
```

### loader

rules 配置模块的读取和解析规则，通常用来配置 Loader。其类型是一个数组，数组里每一项都描述了如何去处理部分文件。 配置一项 rules 时大致通过以下方式：

- 条件匹配：通过 test 、 include 、 exclude 三个配置项来命中 Loader 要应用规则的文件。
- 应用规则：对选中后的文件通过 use 配置项来应用 Loader，可以只应用一个 Loader 或者按照从后往前的顺序应用一组 Loader，同时还可以分别给 Loader 传入参数。
- 重置顺序：一组 Loader 的执行顺序默认是从右到左执行，通过 enforce 选项可以让其中一个 Loader 的执行顺序放到最前或者最后。

Loader 可以看作具有文件转换功能的翻译员，配置里的 module.rules 数组配置了一组规则，告诉 Webpack 在遇到哪些文件时使用哪些 Loader 去加载和转换。
在配置 Loader 时需要注意的是：

- use 属性的值需要是一个由 Loader 名称组成的数组，Loader 的执行顺序是由后到前的；
- 每一个 Loader 都可以通过 URL querystring 的方式传入参数，例如 css-loader?minimize 中的 minimize 告诉 css-loader 要开启 CSS 压缩。

下面具体看例子：

```javascript
module: {
  rules: [
    {
      // 命中 JavaScript 文件
      test: /\.js$/,
      // 用 babel-loader 转换 JavaScript 文件
      // ?cacheDirectory 表示传给 babel-loader 的参数，用于缓存 babel 编译结果加快重新编译速度
      use: ['babel-loader?cacheDirectory'],
      // 只命中src目录里的js文件，加快 Webpack 搜索速度
      include: path.resolve(__dirname, 'src')
    },
    {
      // 命中 SCSS 文件
      test: /\.scss$/,
      // 使用一组 Loader 去处理 SCSS 文件。
      /* 处理顺序为从后到前，即先交给 sass-loader 处理，
      再把结果交给 css-loader 最后再给 style-loader。*/
      use: ['style-loader', 'css-loader', 'sass-loader'],
      // 排除 node_modules 目录下的文件
      exclude: path.resolve(__dirname, 'node_modules'),
    },
    {
      // 对非文本文件采用 url-loader 加载
      test: /\.(gif|png|jpe?g|eot|woff|ttf|svg|pdf)$/,
      use: ['url-loader'],
    },
    // 给 Loader 传入属性的方式除了有 querystring 外，还可以通过 Object 传入 也可以 
    {
      // 命中 JavaScript 文件
      test:[
        /\.jsx?$/,
        /\.tsx?$/
      ],
      // 用 babel-loader 转换 JavaScript 文件
      // ?cacheDirectory 表示传给 babel-loader 的参数，用于缓存 babel 编译结果加快重新编译速度
      use: [
        {
          loader:'babel-loader',
           options:{
             cacheDirectory:true,
           },
          // enforce:'post' 的含义是把该 Loader 的执行顺序放到最后
          // enforce 的值还可以是 pre，代表把 Loader 的执行顺序放到最前面
          enforce:'post'
        },
        // 省略其它 Loader
      ]
      include:[
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'tests'),
      ],
      exclude:[
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'bower_modules'),
      ]
    },
  ]
}
```

test include exclude 这三个命中文件的配置项只传入了一个字符串或正则，其实它们还都支持数组类型。
数组里的每项之间是或的关系，即文件路径符合数组中的任何一个条件就会被命中。

### enforce

指定 loader 种类。没有值表可能的值有："pre" | "post" 。还有一个额外的种类"内联 loader"，loader 被应用在 import/require 行内。

## resolve

Webpack 在启动后会从配置的入口模块出发找出所有依赖的模块，Resolve 配置 Webpack 如何寻找模块所对应的文件。
Webpack 内置 JavaScript 模块化语法解析功能，默认会采用模块化标准里约定好的规则去寻找，但你也可以根据自己的需要修改默认的规则。

### alias

创建 import 或 require 的别名，通过别名来把原导入路径映射成一个新的导入路径，来确保模块引入变得更简单。

```javascript
module.exports = {
  //...
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components/'),
      util: path.resolve(__dirname, './src/util/')
    }
  }
};
```

当你通过 import Button from 'components/Button' 当入时，实际被替换为 import Button from './src/components/Button'

alias 还支持 $ 符号来缩小范围到只命中以关键字结尾的导入语句：

```javascript
module.exports = {
  //...
  resolve: {
    alias: {
      xyz$: path.resolve(__dirname, 'path/to/file.js')
    }
  }
};
```

```text
import Test1 from 'xyz'; // 精确匹配，所有 path/to/file.js 被解析和导入
import Test2 from 'xyz/file.js'; // 非精确匹配，触发普通解析
```

### mainFields

有一些第三方模块会针对不同环境提供几分代码。 例如分别提供采用 ES5 和 ES6 的2份代码，这2份代码的位置写在 package.json 文件里，如下：

```javascript
{
  "jsnext:main": "es/index.js",// 采用 ES6 语法的代码入口文件
  "main": "lib/index.js" // 采用 ES5 语法的代码入口文件
}
```

Webpack 会根据 mainFields 的配置去决定优先采用那份代码，当 target 属性设置为 webworker, web 或者没有指定，mainFields 默认值如下：

```javascript
module.exports = {
  //...
  resolve: {
    mainFields: ['browser', 'module', 'main']
  }
};
```

对于其他任意的 target（包括 node），默认值为：

```javascript
module.exports = {
  //...
  resolve: {
    mainFields: ['module', 'main']
  }
};
```

Webpack 会按照数组里的顺序去package.json 文件里寻找，只会使用找到的第一个。

假如你想优先采用 ES6 的那份代码，可以这样配置：

```javascript
mainFields: ['jsnext:main', 'browser', 'main']
```

### mainFiles

解析目录时要使用的文件名。

```javascript
module.exports = {
  //...
  resolve: {
    mainFiles: ['index']
  }
};
```

### modules

告诉 webpack 解析模块时应该搜索的目录。

绝对路径和相对路径都能使用，但是要知道它们之间有一点差异。
通过查看当前目录以及祖先路径（即 ./node_modules, ../node_modules 等等），相对路径将类似于 Node 查找 'node_modules' 的方式进行查找。
使用绝对路径，将只在给定目录中搜索。

```javascript
module.exports = {
  //...
  resolve: {
    modules: ['node_modules']
  }
};
```

如果你想要添加一个目录到模块搜索目录，此目录优先于 node_modules/ 搜索：

```javascript
module.exports = {
  //...
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
};
```

### extensions

在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试访问文件是否存在。 resolve.extensions 用于配置在尝试过程中用到的后缀列表，默认是：

```javascript
extensions: ['.js', '.json']
```

也就是说当遇到 require('./data') 这样的导入语句时，Webpack 会先去寻找 ./data.js 文件，如果该文件不存在就去寻找 ./data.json 文件， 如果还是找不到就报错。

假如你想让 Webpack 优先使用目录下的 TypeScript 或 Vue 文件，可以这样配置

```javascript
extensions: ['.ts', '.vue', '.js', '.json']
```

### enforceExtension

resolve.enforceExtension 如果配置为 true 所有导入语句都必须要带文件后缀， 例如开启前 import './foo' 能正常工作，开启后就必须写成 import './foo.js'。

### enforceModuleExtension

enforceModuleExtension 和 enforceExtension 作用类似，但 enforceModuleExtension 只对 node_modules 下的模块生效。
enforceModuleExtension 通常搭配 enforceExtension 使用，在 enforceExtension:true 时，因为安装的第三方模块中大多数导入语句没带文件后缀，
所以这时通过配置 enforceModuleExtension:false 来兼容第三方模块。

## optimization

从 webpack 4 开始，会根据你选择的 mode 来执行不同的优化，不过所有的优化还是可以手动配置和重写。

### minimize

告知 webpack 使用 TerserPlugin 压缩 bundle。production 模式下，这里默认是 true。

```javascript
module.exports = {
  //...
  optimization: {
    minimize: false
  }
};
```

### minimizer

允许你通过提供一个或多个定制过的 TerserPlugin 实例，覆盖默认压缩工具(minimizer)。

以插件的形式

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // 在生产环境如果使用source-map则必须设为true。Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      }),
    ],
  }
};
```

以 function 的形式

```javascript
module.exports = {
  optimization: {
    minimizer: [
      (compiler) => {
        const TerserPlugin = require('terser-webpack-plugin');
        new TerserPlugin({ /* your config 配置项如上*/ }).apply(compiler);
      }
    ],
  }
};
```

### splitChunks

对于动态导入模块，默认使用 webpack v4+ 提供的全新的通用分块策略(common chunk strategy)。

最初，chunks（及其内部导入的 modules）通过内部 Webpack 依赖图的父子关系连接。通过使用 CommonsChunkPlugin 避免重复的依赖，但进一步的优化是不可能的。
从webpack v4开始，CommonsChunkPlugin 删除了，而改为 optimization.splitChunks。

webpack默认将根据以下条件自动分割块：

- 可以共享新块，或者模块来自node_modules文件夹
- 新的块将大于30kb（在min + gz之前）
- 按需加载块时并行请求的最大数量将小于或等于5
- 初始页面加载时并行请求的最大数量将小于或等于3
当试图满足最后两个条件时，最好使用较大的块。

optimization.splitChunks 默认配置参数如下

```javascript
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

更多详细配置参考 [splitChunks插件](https://webpack.docschina.org/plugins/split-chunks-plugin/)

### runtimeChunk

将 optimization.runtimeChunk 设置为 true 或 "multiple"，会为每个单独包含 runtime 的入口起点添加一个额外的 chunk。此设置是如下设置的**别名**：

```javascript
module.exports = {
  //...
  optimization: {
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}`
    }
  }
};
```

将 optimization.runtimeChunk 设置为"single"，会创建一个在所有生成块之间共享的运行时文件。此设置是如下设置的**别名**：

```javascript
module.exports = {
  //...
  optimization: {
    runtimeChunk: {
      name: 'runtime'
    }
  }
};
```

通过将 optimization.runtimeChunk 设置为 object，对象中可以设置只有 name 属性，其中属性值可以是名称或返回名称的函数，用于为运行时块命名。

默认值是false：每个入口chunk中直接嵌入runtime。

::: warning 警告
对于每个运行时块，引入的模块会被分别初始化，因此如果你在同一个页面中引用多个入口起点，请注意此行为。你或许应该将其设置为single，或者使用其他只有一个runtime实例的配置。
:::

## plugins

webpack 附带了各种内置插件，可以通过 `webpack.[plugin-name]` 访问这些插件。

- [内置插件列表参考](https://webpack.docschina.org/plugins)
- [第三方插件列表参考](https://github.com/webpack-contrib/awesome-webpack#webpack-plugins)

内置插件详细使用将在后文专门讲述。

## devServer

devServer 会启动一个 HTTP 服务器用于服务网页请求，同时会帮助启动 Webpack ，并接收 Webpack 发出的文件更变信号，通过 WebSocket 协议自动刷新网页做到实时预览。

要配置 DevServer ，除了在配置文件里通过 devServer 传入参数外，还可以通过命令行参数传入。

注意只有在通过 DevServer 去启动 Webpack 时配置文件里 devServer 才会生效，因为这些参数所对应的功能都是 DevServer 提供的，Webpack 本身并不认识 devServer 配置项。

devServer 与 webpack-dev-server 和 webpack-dev-middleware 插件有关联，具体联系将在后文讲述 webpack 热重载背后的原理时具体阐述。

下面是 devServer 中常见的配置项：

### after

在服务内部的所有其他中间件之后， 提供执行自定义中间件的功能

```javascript
module.exports = {
  //...
  devServer: {
    after: function(app, server) {
      // 做些有趣的事
    }
  }
};
```

### before

在服务内部的所有其他中间件之前， 提供执行自定义中间件的功能。 这可以用来配置自定义处理程序，例如：

```javascript
module.exports = {
  //...
  devServer: {
    before: function(app, server) {
      app.get('/some/path', function(req, res) {
        res.json({ custom: 'response' });
      });
    }
  }
};
```

### allowedHosts

白名单列表，允许一些开发服务器访问。

```javascript
module.exports = {
  //...
  devServer: {
    allowedHosts: [
      // 匹配单个域名
      'host.com',
      'sub.host.com',
      // host2.com 和所有的子域名 *.host2.com 都将匹配
      '.host2.com'
    ]
  }
};

// CLI 用法

webpack-dev-server --entry /entry/file --output-path /output/path --allowed-hosts .host.com,host2.com
```

### compress

是否启用 gzip 压缩

```javascript
module.exports = {
  //...
  devServer: {
    compress: true
  }
};

// CLI 用法

webpack-dev-server --compress
```

### headers

在所有响应中添加首部内容

```javascript
module.exports = {
  //...
  devServer: {
    headers: {
      'X-Custom-Foo': 'bar'
    }
  }
};
```

### historyApiFallback

devServer.historyApiFallback 用于方便的开发使用了 HTML5 History API 的单页应用。 这类单页应用要求服务器在针对任何命中的路由时都返回一个对应的 HTML 文件。
当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html。devServer.historyApiFallback 默认禁用。
简单配置：

```javascript
module.exports = {
  //...
  devServer: {
    historyApiFallback: true
  }
};
```

使用 rewrites 选项，通过传入一个对象，进一步地控制：

```javascript
module.exports = {
  //...
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/views/landing.html' },
        { from: /^\/subpage/, to: '/views/subpage.html' },
        { from: /./, to: '/views/404.html' }
      ]
    }
  }
};
```

该配置项属性是用来应对返回404页面时定向跳转到特定页面的。一般是应用在单页应用，比如在访问路由时候，访问不到该路由的时候，通过该配置项，设置属性值为true的时候，
会自动跳转到 index.html下。

### https

DevServer 默认使用 HTTP 协议服务，它也能通过 HTTPS 协议服务。 有些情况下你必须使用 HTTPS，例如 HTTP2 和 Service Worker 就必须运行在 HTTPS 之上。
要切换成 HTTPS 服务，最简单的方式是：

```javascript
devServer:{
  https: true
}
```

DevServer 会自动的为你生成一份 HTTPS 证书。如果你想用自己的证书可以这样配置：

```javascript
devServer:{
  https: {
    key: fs.readFileSync('path/to/server.key'),
    cert: fs.readFileSync('path/to/server.crt'),
    ca: fs.readFileSync('path/to/ca.pem')
  }
}
```

### hot

启用 webpack 的 模块热替换 功能：

```javascript
module.exports = {
  //...
  devServer: {
    hot: true
  }
};
```

### proxy

如果你有单独的后端开发服务器 API，并且希望在同域名下发送 API 请求 ，那么代理某些 URL 会很有用。
dev-server 使用了非常强大的 http-proxy-middleware 包。[更多 proxy 配置项参考](https://github.com/chimurai/http-proxy-middleware#options)

```javascript
module.exports = {
  //...
  devServer: {
    // 请求到 /api/xxx 现在会被代理到请求 http://localhost:3000/api/xxx
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,  // 如果是https接口，需要配置这个参数 验证SSL证书
        ws: true,// 是否要代理websocket
        changeOrigin: true,// 默认值：false-将主机头的来源更改为目标URL
        pathRewrite: {'^/api' : ''}
      }
    }
  }
};
```

要代理多个路径特定到同一个 target 下，你可以使用由一个或多个「具有 context 属性的对象」构成的数组：

```javascript
module.exports = {
  //...
  devServer: {
    proxy: [{
      context: ['/auth', '/api'],
      target: 'http://localhost:3000',
    }]
  }
};
```

## 整体配置

```javascript
const path = require('path');

module.exports = {
  // entry 表示 入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
  // 类型可以是 string | object | array   
  entry: './app/entry', // 只有1个入口，入口只有1个文件
  entry: ['./app/entry1', './app/entry2'], // 只有1个入口，入口有2个文件
  entry: { // 有2个入口
    a: './app/entry-a',
    b: ['./app/entry-b1', './app/entry-b2']
  },

  // 如何输出结果：在 Webpack 经过一系列处理后，如何输出最终想要的代码。
  output: {
    // 输出文件存放的目录，必须是 string 类型的绝对路径。
    path: path.resolve(__dirname, 'dist'),

    // 输出文件的名称
    filename: 'bundle.js', // 完整的名称
    filename: '[name].js', // 当配置了多个 entry 时，通过名称模版为不同的 entry 生成不同的文件名称
    filename: '[chunkhash].js', // 根据文件内容 hash 值生成文件名称，用于浏览器长时间缓存文件

    // 发布到线上的所有资源的 URL 前缀，string 类型
    publicPath: '/assets/', // 放到指定目录下
    publicPath: '', // 放到根目录下
    publicPath: 'https://cdn.example.com/', // 放到 CDN 上去

    // 导出库的名称，string 类型
    // 不填它时，默认输出格式是匿名的立即执行函数
    library: 'MyLibrary',

    // 导出库的类型，枚举类型，默认是 var
    // 可以是 umd | umd2 | commonjs2 | commonjs | amd | this | var | assign | window | global | jsonp ，
    libraryTarget: 'umd', 

    // 是否包含有用的文件路径信息到生成的代码里去，boolean 类型
    pathinfo: true, 

    // 附加 Chunk 的文件名称
    chunkFilename: '[id].js',
    chunkFilename: '[chunkhash].js',

    // JSONP 异步加载资源时的回调函数名称，需要和服务端搭配使用
    jsonpFunction: 'myWebpackJsonp',

    // 生成的 Source Map 文件名称
    sourceMapFilename: '[file].map',

    // 浏览器开发者工具里显示的源码模块名称
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]',

    // 异步加载跨域的资源时使用的方式
    crossOriginLoading: 'use-credentials',
    crossOriginLoading: 'anonymous',
    crossOriginLoading: false,
  },

  // 配置模块相关
  module: {
    rules: [ // 配置 Loader
      {  
        test: /\.jsx?$/, // 正则匹配命中要使用 Loader 的文件
        include: [ // 只会命中这里面的文件
          path.resolve(__dirname, 'app')
        ],
        exclude: [ // 忽略这里面的文件
          path.resolve(__dirname, 'app/demo-files')
        ],
        use: [ // 使用那些 Loader，有先后次序，从后往前执行
          'style-loader', // 直接使用 Loader 的名称
          {
            loader: 'css-loader',      
            options: { // 给 html-loader 传一些参数
            }
          }
        ]
      },
    ],
    noParse: [ // 不用解析和处理的模块
      /special-library\.js$/  // 用正则匹配
    ],
  },

  // 配置插件
  plugins: [
  ],

  // 配置寻找模块的规则
  resolve: { 
    modules: [ // 寻找模块的根目录，array 类型，默认以 node_modules 为根目录
      'node_modules',
      path.resolve(__dirname, 'app')
    ],
    extensions: ['.js', '.json', '.jsx', '.css'], // 模块的后缀名
    alias: { // 模块别名配置，用于映射模块
       // 把 'module' 映射 'new-module'，同样的 'module/path/file' 也会被映射成 'new-module/path/file'
      'module': 'new-module',
      // 使用结尾符号 $ 后，把 'only-module' 映射成 'new-module'，
      // 但是不像上面的，'module/path/file' 不会被映射成 'new-module/path/file'
      'only-module$': 'new-module', 
    },
    alias: [ // alias 还支持使用数组来更详细的配置
      {
        name: 'module', // 老的模块
        alias: 'new-module', // 新的模块
        // 是否是只映射模块，如果是 true 只有 'module' 会被映射，如果是 false 'module/inner/path' 也会被映射
        onlyModule: true, 
      }
    ],
    symlinks: true, // 是否跟随文件软链接去搜寻模块的路径
    descriptionFiles: ['package.json'], // 模块的描述文件
    mainFields: ['main'], // 模块的描述文件里的描述入口的文件的字段名称
    enforceExtension: false, // 是否强制导入语句必须要写明文件后缀
  },

  // 输出文件性能检查配置
  performance: { 
    hints: 'warning', // 有性能问题时输出警告
    hints: 'error', // 有性能问题时输出错误
    hints: false, // 关闭性能检查
    maxAssetSize: 200000, // 最大文件大小 (单位 bytes)
    maxEntrypointSize: 400000, // 最大入口文件大小 (单位 bytes)
    assetFilter: function(assetFilename) { // 过滤要检查的文件
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  },

  devtool: 'source-map', // 配置 source-map 类型

  context: __dirname, // Webpack 使用的根目录，string 类型必须是绝对路径

  // 配置输出代码的运行环境
  target: 'web', // 浏览器，默认
  target: 'webworker', // WebWorker
  target: 'node', // Node.js，使用 `require` 语句加载 Chunk 代码
  target: 'async-node', // Node.js，异步加载 Chunk 代码
  target: 'node-webkit', // nw.js
  target: 'electron-main', // electron, 主线程
  target: 'electron-renderer', // electron, 渲染线程

  externals: { // 使用来自 JavaScript 运行环境提供的全局变量
    jquery: 'jQuery'
  },

  stats: { // 控制台输出日志控制
    assets: true,
    colors: true,
    errors: true,
    errorDetails: true,
    hash: true,
  },

  devServer: { // DevServer 相关的配置
    proxy: { // 代理到后端服务接口
      '/api': 'http://localhost:3000'
    },
    contentBase: path.join(__dirname, 'public'), // 配置 DevServer HTTP 服务器的文件根目录
    compress: true, // 是否开启 gzip 压缩
    historyApiFallback: true, // 是否开发 HTML5 History API 网页
    hot: true, // 是否开启模块热替换功能
    https: false, // 是否开启 HTTPS 模式
    },

    profile: true, // 是否捕捉 Webpack 构建的性能信息，用于分析什么原因导致构建性能不佳

    cache: false, // 是否启用缓存提升构建速度

    watch: true, // 是否开始
    watchOptions: { // 监听模式选项
    // 不监听的文件或文件夹，支持正则匹配。默认为空
    ignored: /node_modules/,
    // 监听到变化发生后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高
    // 默认为300ms 
    aggregateTimeout: 300,
    // 判断文件是否发生变化是不停的去询问系统指定文件有没有变化，默认每隔1000毫秒询问一次
    poll: 1000
  },
}
```

## 小结

Webpack 有以下几个核心概念。

- Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
- Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
- Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
- Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
- Plugin：扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。
- Output：输出结果，在 Webpack 经过一系列处理并得出最终想要的代码后输出结果。

Webpack 启动后会从 Entry 里配置的 Module 开始递归解析 Entry 依赖的所有 Module。 每找到一个 Module， 就会根据配置的 Loader 去找出对应的转换规则，对 Module 进行转换后，
再解析出当前 Module 依赖的 Module。 这些模块会以 Entry 为单位进行分组，一个 Entry 和其所有依赖的 Module 被分到一个组也就是一个 Chunk。
最后 Webpack 会把所有 Chunk 转换成文件输出。 在整个流程中 Webpack 会在恰当的时机执行 Plugin 里定义的逻辑。
