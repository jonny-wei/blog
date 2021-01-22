# webpack

webpack实践

- webpack核心概念：`entry`,`output`,`loaders`,`plugins`,`mode` 等
- 解析ES6，CSS，Less，Scss，stylus
- 解析图片和字体
- webpack文件监听
- webpack的热更新及原理
- 代码压缩
- 自动清理构建目录产物
- postcss插件 autoprefixer 自动补齐css前缀
- 移动端css的px自动转换为rem
- 静态资源内联
- 多页面打包通用方案
- 使用sourceMap
- 提取页面公共资源
- Tree Shaking摇树优化
- Scope Hoisting 的使用和原理
- 代码分割及动态import
- 在webpack中使用ESLint
- webpack实现SSR打包
- prerender 渲染骨架屏
- webpack打包组件和基础库
- 如何分析页面打包问题
- 初级分析 使用 webpack 内置 stats
- 速度分析 使用 speed-measure-webpack-plugin
- 体积分析 使用 webpack-bundle-analyzer
- 多进程 多实例构建
- 多进程并行压缩代码
- 进一步分包：预编译资源模块
- 充分利用缓存提升二次构建速度
- 使用动态 ployfill 服务
- webpack 的本质与 Tapable
- webpack事件流
- compile 和 compilation 对象
- webapck 入口文件
- webpack 参数传递与编译启动
- 编译与构建主流程
- loader的执行顺序
- loader匹配文件的可选方式
- 编写loader
- webpack plugin 的 API 
- 编写webpack 的 插件

## 构建包大小的诱因

在做优化工作前，我们首先要知道是我们要针对什么做优化。为此，我们要通过 webpack-bundle-analyzer 插件。
它能提供可视化指南分析构建包中文件的大小。

>npm install --save-dev webpack-bundle-analyzer

在 vue.config.js 文件中配置：

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()]
  }
}
```
下面举几个在项目中遇到的：

### 减少 Lodash 的大小

我经常在项目中使用lodash这个js工具库，它提供了许多友好的工具函数，同时也是vue官方推荐的。

通常loadsh会占用许多空间，那么针对它做一些优化是必要的。在项目中加载整个库是得不偿失的，我们应该按需加载。
就像这样：
```javascript
import { sortBy,forEach,filters,finds,cloneDeep,isEmpty } from 'lodash/core';
```
而不是这样：
```javascript
import _ from 'lodash';
```
### 减少 moment.js 的大小

我们也经常使用moment这个js库来处理有关时间/日期的逻辑。虽然它没有lodash那样占用很多空间，但是我们通常
也不会用到它的所有功能，比如许多国际化语言包。如果只用到日期的操作可以这样
```javascript
import moment from 'moment/src/moment'
```
而不是这样：
```javascript
import moment from 'moment';
```
但是更好的做法是在 webpack 中创建一个快捷方式别名。该快捷方式将用'moment/src/moment'替换所有导入'moment'的调用。
我们可以使用 resolve 在我们的 vue.config.js 文件中添加该别名并进行设置。
```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()],
    resolve: {
      alias:{
        moment: 'moment/src/moment'
      }
    }
  }
}
```

删除 moment.js 中的语言环境后，每当我启动服务器运行我的代码时都会发生错误，说它无法找到./locale。
经过一些研究我发现这是 moment.js 的一个存在多年的已知问题：moment.js 总是会加载 locales，
还假定 locales 存在。你不能让 moment 只加载日期操作函数。

为了解决这个问题，我使用内置的 webpack IgnorePlugin 忽略了这个消息。
下面是我添加到 vue.config.js 文件中的插件代码：

```javascript
new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
```

## webpack进阶

- 有哪些常见的 loader？他们能解决什么问题？
- webpack 的构建流程是什么? 从读取配置到输出文件的整个过程
- 是否写过 loader 和 Plugin ？描述一下编写 loader 或 Plugin 的思路？
- webpack 的热更新是如何做到的？说明其原理？
- 如何利用 webpack 来优化前端性能？（提高性能和体验）

在掌握 webpack 打包的速度、体积，及页面加载时的性能优化之前，
你需要先搞懂 webpack 内部的运行原理和插件机制。

