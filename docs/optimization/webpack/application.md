# 项目应用
## 使用 ES6+ 语言
目前部分浏览器和 Node.js 已经支持 ES6，但由于它们对 ES6 所有的标准支持不全，这导致在开发中不敢全面地使用 ES6，但是完全支持ES5，
所以在项目中使用 ES6+ 的语言，需要用 Babel 将 ES6+ 转换成 ES5，让你使用最新的语言特性而不用担心兼容性问题，并且可以通过插件机制根据需求灵活的扩展。 
在 Babel 执行编译的过程中，会从项目根目录下的 .babelrc 文件读取配置。.babelrc 是一个 JSON 格式的文件，在 Vue 项目中内容大致如下(使用vue-cli3.x+ 构建的项目有专门的 babel.config.js 配置文件)：
```json
{
  "presets": [
    ["env", {
      "modules": false,
      "targets": {
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      }
    }],
    "stage-2"
  ],
  "plugins": ["transform-vue-jsx", "transform-runtime"]
}
```
babel.config.js：
```javascript
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/presets'
  ]
}
```
plugins 属性告诉 Babel 要使用哪些插件，插件可以控制如何转换代码。babel-plugin-transform-runtime 是 Babel 官方提供的一个插件，作用是减少冗余代码。
Babel 在把 ES6 代码转换成 ES5 代码时通常需要一些 ES5 写的辅助函数来完成新语法的实现，它的作用是不把辅助函数的内容注入到文件中，而是注入一条导入语句。
这样可以减小 Babel 编译出来的代码文件的大小。同时需要注意的是由于 babel-plugin-transform-runtime 注入了导入语句到编译后的代码里，需要安装 babel-runtime 依赖到你的项目后，
代码才能正常运行。 也就是说 babel-plugin-transform-runtime 和 babel-runtime 需要配套使用，使用了 babel-plugin-transform-runtime 后一定需要 babel-runtime。

presets 属性告诉 Babel 要转换的源码使用了哪些新的语法特性，一个 Presets 对一组新语法特性提供支持，多个 Presets 可以叠加。 Presets 其实是一组 Plugins 的集合，
每一个 Plugin 完成一个新语法的转换工作。Presets 是按照 ECMAScript 草案来组织的，通常可以分为以下三大类：

1. 已经被写入 ECMAScript 标准里的特性，由于之前每年都有新特性被加入到标准里，所以又可细分为：
- es2015 包含在2015里加入的新特性；
- es2016 包含在2016里加入的新特性；
- es2017 包含在2017里加入的新特性；
- env 包含当前所有 ECMAScript 标准里的最新特性。

2. 被社区提出来的但还未被写入 ECMAScript 标准里特性，这其中又分为以下四种：
- stage0 只是一个美好激进的想法，有 Babel 插件实现了对这些特性的支持，但是不确定是否会被定为标准；
- stage1 值得被纳入标准的特性；
- stage2 该特性规范已经被起草，将会被纳入标准里；
- stage3 该特性规范已经定稿，各大浏览器厂商和 Node.js 社区开始着手实现；
- stage4 在接下来的一年将会加入到标准里去。

3. 为了支持一些特定应用场景下的语法，和 ECMAScript 标准没有关系，例如 babel-preset-react 是为了支持 React 开发中的 JSX 语法。

```text
# Webpack 接入 Babel 必须依赖的模块
npm i -D babel-core babel-loader 
# 根据你的需求选择不同的 Plugins 或 Presets
npm i -D babel-preset-env
```

## 使用 TypeScript 语言

首先，执行以下命令安装 TypeScript compiler 和 loader：

```text
npm install --save-dev typescript ts-loader
```

TypeScript 官方提供了能把 TypeScript 转换成 JavaScript 的编译器。 你需要在当前项目根目录下新建一个用于配置编译选项的 tsconfig.json 文件，
编译器默认会读取和使用这个文件，配置文件内容大致如下：

```json
{
  "compilerOptions": {
    "target": "esnext", // 编译出的代码采用 ES 的哪个版本
    "module": "esnext", // 编译出的代码采用的模块规范
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true, // 不让同样的辅助函数重复的出现在多个文件中 减少代码冗余 原理和 Babel 中介绍的 babel-plugin-transform-runtime 非常类似
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "lib": [
      "es2015",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```
要让 Webpack 支持 TypeScript，需要解决以下2个问题：
- 通过 Loader 把 TypeScript 转换成 JavaScript。
- Webpack 在寻找模块对应的文件时需要尝试 ts 后缀。

配置 webpack 处理 TypeScript：

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader', // 推荐速度更快的 awesome-typescript-loader
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ] // 修改默认的 resolve.extensions 配置项
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```
这会让 webpack 直接从 ./index.ts _进入_，然后通过 ts-loader 加载所有的 .ts 和 .tsx 文件，并且在当前目录输出 _一个 bundle.js 文件_。

## 使用 SCSS/SASS 语言

```text
# 安装 Webpack Loader 依赖
npm i -D  sass-loader css-loader style-loader
# sass-loader 依赖 node-sass
npm i -D node-sass
```
node-sass 核心模块是由 C++ 编写，再用 Node.js 封装了一层，以供给其它 Node.js 调用。 node-sass 还支持通过命令行调用，安装它到全局可以通过
命令编译成 css
```text
# 把 main.scss 源文件编译成 main.css
node-sass main.scss main.css
```
webpack 的相关配置
```javascript
module.exports = {
  module: {
    rules: [
      {
        // 增加对 SCSS 文件的支持
        test: /\.scss$/,
        // SCSS 文件的处理顺序为先 sass-loader 再 css-loader 再 style-loader
         use: [
            "style-loader", // 将 JS 字符串生成为 style 节点
            "css-loader", // 将 CSS 转化成 CommonJS 模块
            "sass-loader" // 将 Sass 编译成 CSS，默认使用 Node Sass
         ]
      },
    ]
  },
};
```
以上配置通过正则 /\.scss$/ 匹配所有以 .scss 为后缀的 SCSS 文件，再分别使用3个 Loader 去处理。具体处理流程如下：
- 通过 sass-loader 把 SCSS 源码转换为 CSS 代码，再把 CSS 代码交给 css-loader 去处理。

- css-loader 会找出 CSS 代码中的 @import 和 url() 这样的导入语句，告诉 Webpack 依赖这些资源。同时还支持 CSS Modules、压缩 CSS 等功能。处理完后再把结果交给 style-loader 去处理。

- style-loader 会把 CSS 代码转换成字符串后，注入到 JavaScript 代码中去，通过 JavaScript 去给 DOM 增加样式。
如果你想把 CSS 代码提取到一个单独的文件而不是和 JavaScript 混在一起，可以使用使用 ExtractTextPlugin 插件。
但是通常，生产环境下比较推荐的做法是，使用mini-css-extract-plugin将样式表抽离成专门的单独文件。这样，样式表将不再依赖于JavaScript：
```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    ...
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                // fallback to style-loader in development
                process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                "css-loader",
                "sass-loader"
            ]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ]
};
```
从bundle中提取样式表，有2种可用的方法：
- extract-loader（简单，专门针对css-loader的输出）
- mini-css-extract-plugin（在使用webpack 4配置时使用此插件。在所有用例中均适用）

## 使用 PostCSS 语言

PostCSS 是一个 CSS 处理工具，和 SCSS 不同的地方在于它通过插件机制可以灵活的扩展其支持的特性，而不是像 SCSS 那样语法是固定的。 
PostCSS 的用处非常多，包括给 CSS 自动加前缀、使用下一代 CSS 语法等，目前越来越多的人开始用它，它很可能会成为 CSS 预处理器的最终赢家。

PostCSS 和 CSS 的关系就像 Babel 和 JavaScript 的关系，它们解除了语法上的禁锢，通过插件机制来扩展语言本身，用工程化手段给语言带来了更多的可能性。

PostCSS 和 SCSS 的关系就像 Babel 和 TypeScript 的关系，PostCSS 更加灵活、可扩张性强，而 SCSS 内置了大量功能而不能扩展。

```text
# 安装 Webpack Loader 依赖
npm i -D postcss-loader css-loader style-loader
# 根据你使用的特性安装对应的 PostCSS 插件依赖
npm i -D postcss-cssnext
```

PostCSS 全部采用 JavaScript 编写，运行在 Node.js 之上，即提供了给 JavaScript 代码调用的模块，也提供了可执行的文件。 
在 PostCSS 启动时，会从目录下的 postcss.config.js 文件中读取所需配置，所以需要新建该文件，文件内容大致如下：

```javascript
module.exports = {
  parser: 'sugarss',
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {},
    'cssnano': {}
  }
}
```
在 webpack 中的配置如下：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader'
        ]
      }
    ]
  }
}
```