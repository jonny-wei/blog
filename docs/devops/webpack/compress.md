# 代码压缩

**代码压缩** 是指在不改变代码功能的前提下，从声明式（HTML、CSS）或命令式（JavaScript）语言中删除所有不必要的字符（备注、变量名压缩、逻辑语句合并等），减少代码体积的过程，这在 Web 场景中能够有效减少浏览器从服务器获取代码资源所需要消耗的传输量，降低网络通讯耗时，提升页面启动速度，是一种非常基础且性价比特别高的应用性能优化方案。

## 原理

先将字符串形态的代码转换为结构化、容易分析处理的 AST（抽象语法树）形态，之后在 AST 上应用上面的规则做各种语法、语义、逻辑推理与简化替换，最后按精简过的 AST 生成结果代码

## 实践

### 使用 TerserWebpackPlugin 压缩 JS

[Terser](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fterser%2Fterser) 是当下 [最为流行](https://link.juejin.cn/?target=https%3A%2F%2Fnpmtrends.com%2Fbabel-minify-vs-terser-vs-uglify-js) 的 ES6 代码压缩工具之一，支持 [Dead-Code Eliminate](https://link.juejin.cn/?target=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FDead-code_elimination)、删除注释、删除空格、代码合并、变量名简化等等[一系列](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fterser%2Fterser%23compress-options)代码压缩功能。Terser 的前身是大名鼎鼎的 [UglifyJS](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fmishoo%2FUglifyJS)，它在 UglifyJS 基础上增加了 ES6 语法支持，并重构代码解析、压缩算法，使得执行效率与压缩率都有较大提升。

Webpack5.0 后默认使用 Terser 作为 JavaScript 代码压缩器，简单用法只需通过 optimization.minimize 配置项开启压缩功能即可。

[terser-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack-contrib%2Fterser-webpack-plugin) 插件并不只是 Terser 的简单包装，它更像是一个代码压缩功能骨架，底层还支持使用 SWC、UglifyJS、ESBuild 作为压缩器，使用时只需要通过 minify 参数切换即可。不同压缩器功能、性能差异较大，据我了解，ESBuild 与 SWC 这两个基于 Go 与 Rust 编写的压缩器性能更佳，且效果已经基本趋于稳定，虽然功能还比不上 Terser，但某些构建性能敏感场景下不失为一种不错的选择。

::: tip 配置项
[terser-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack-contrib%2Fterser-webpack-plugin) 是一个颇为复杂的 Webpack 插件，提供下述 [配置项](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fterser-webpack-plugin%23options)：

- `test`：只有命中该配置的产物路径才会执行压缩，功能与 [module.rules.test](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fconfiguration%2Fmodule%2F%23ruletest) 相似；
- `include`：在该范围内的产物才会执行压缩，功能与 [module.rules.include](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fconfiguration%2Fmodule%2F%23ruleinclude) 相似；
- `exclude`：与 `include` 相反，不在该范围内的产物才会执行压缩，功能与 [module.rules.exclude](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fconfiguration%2Fmodule%2F%23ruleexclude) 相似；
- `parallel`：是否启动并行压缩，默认值为 `true`，此时会按 `os.cpus().length - 1` 启动若干进程并发执行；
- `minify`：用于配置压缩器，支持传入自定义压缩函数，也支持 `swc/esbuild/uglifyjs` 等值，下面我们再展开讲解；
- `terserOptions`：传入 `minify` —— “压缩器”函数的配置参数；
- `extractComments`：是否将代码中的备注抽取为单独文件，可配合特殊备注如 `@license` 使用。
:::

::: tip 内置压缩器
TerserPlugin 内置如下压缩器：

- `TerserPlugin.terserMinify`：依赖于 `terser` 库；
- `TerserPlugin.uglifyJsMinify`：依赖于 `uglify-js`，需要手动安装 `yarn add -D uglify-js`；
- `TerserPlugin.swcMinify`：依赖于 `@swc/core`，需要手动安装 `yarn add -D` `@swc/core`；
- `TerserPlugin.esbuildMinify`：依赖于 `esbuild`，需要手动安装 `yarn add -D esbuild`。

另外，`terserOptions` 配置也不仅仅专供 `terser` 使用，而是会透传给具体的 `minifier`，因此使用不同压缩器时支持的配置选项也会不同。
:::

### 使用 CssMinimizerWebpackPlugin 压缩 CSS

- CssMinimizerPlugin.cssnanoMinify：默认值，使用 [cssnano](https://link.juejin.cn/?target=https%3A%2F%2Fcssnano.co%2F) 压缩代码，不需要额外安装依赖；
- CssMinimizerPlugin.cssoMinify：使用 [csso](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fcss%2Fcsso) 压缩代码，需要手动安装依赖 yarn add -D csso；
- CssMinimizerPlugin.cleanCssMinify：使用 [clean-css](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fclean-css%2Fclean-css) 压缩代码，需要手动安装依赖 yarn add -D clean-css；
- CssMinimizerPlugin.esbuildMinify：使用 [ESBuild](https://link.juejin.cn/?target=https%3A%2F%2Fesbuild.github.io%2F) 压缩代码，需要手动安装依赖 yarn add -D esbuild；
- CssMinimizerPlugin.parcelCssMinify：使用 [parcel-css](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fparcel-bundler%2Fparcel-css) 压缩代码，需要手动安装依赖 yarn add -D @parcel/css。

其中 `parcel-css` 与 `ESBuild` 压缩性能相对较佳，但两者功能与兼容性稍弱，多数情况下推荐使用 `cssnano`。

### 使用 HtmlMinifierTerser 压缩 HTML

某些场景如 SSG 或官网一类偏静态的应用中就存在大量可被优化的 HTML 代码，为此社区也提供了一些相关的工程化工具，例如 `html-minifier-terser`。

[html-minifier-terser](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fterser%2Fhtml-minifier-terser) 是一个基于 JavaScript 实现的、高度可配置的 HTML 压缩器，支持一系列 [压缩特性](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fterser%2Fhtml-minifier-terser%23options-quick-reference) 。我们可以借助 [html-minimizer-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fplugins%2Fhtml-minimizer-webpack-plugin%2F) 插件接入 html-minifier-terser 压缩器。

[html-minifier-terser](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fterser%2Fhtml-minifier-terser) 提供的默认配置有点过于保守，例如 `removeComments` —— 用于移除代码备注的配置，或者 `useShortDoctype` 用于简化 `<doctype>` 标签的配置，默认竟然都是 false，这放在当下浏览器功能已经非常强劲，兼容性问题已经被大大抹平的背景下，有点大可不必了。因此，建议你使用时先到 [官网](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fterser%2Fhtml-minifier-terser%23options-quick-reference) 仔细了解各项配置，尽可能开启更多压缩功能。

## 小结

代码压缩的重点就在于“保持功能性”的前提下尽可能“删除”不必要的字符，原理虽不复杂但必须对语言特性有比较深的理解才能实现，所幸社区已经提供了各种各样的压缩工具，我们只需要简单配置就能轻松接入。

在 Webpack 中需要使用 `optimization.minimizer` 数组接入代码压缩插件，比较常用的插件有：

- `terser-webpack-plugin`：用于压缩 ES6 代码的插件；
- `css-minimizer-webpack-plugin`：用于压缩 CSS 代码的插件；
- `html-minifier-terser`：用于压缩 HTML 代码的插件。

这些插件用法非常相似，都支持 `include/test/exclude` 配置项，用于控制压缩功能的应用范围；也都支持 `minify` 配置项，用于切换压缩器，借助这个配置我们可以使用性能更佳的工具，如 ESBuild 执行压缩。
