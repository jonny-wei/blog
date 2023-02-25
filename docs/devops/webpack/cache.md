# 持久化缓存

## 定义

webpack 的持久化缓存它能够将首次构建的过程与结果数据持久化保存到本地文件系统，在下次执行构建时跳过解析、链接、编译等一系列非常消耗性能的操作，直接复用上次的 Module/ModuleGraph/Chunk 对象数据，迅速构建出最终产物。

空间换时间是见效非常明显的提速方案，在 Webpack5 中通过配置 `cache: 'filesystem'` 来开启持久缓存，开启后命中缓存的情况下会直接反序列化缓存文件并跳过构建流程。

```js
module.exports = {
    //...
    cache: {
        type: 'filesystem'
    },
    //...
};
```

此外，`cache` 还提供了若干用于配置缓存效果、缓存周期的配置项，包括：

- `cache.type`：缓存类型，支持 `'memory' | 'filesystem'`，需要设置为 `filesystem` 才能开启持久缓存；
- `cache.cacheDirectory`：缓存文件路径，默认为 `node_modules/.cache/webpack` ；
- `cache.buildDependencies`：额外的依赖文件，当这些文件内容发生变化时，缓存会完全失效而执行完整的编译构建，通常可设置为各种配置文件
- `cache.managedPaths`：受控目录，Webpack 构建时会跳过新旧代码哈希值与时间戳的对比，直接使用缓存副本，默认值为 `['./node_modules']`；
- `cache.profile`：是否输出缓存处理过程的详细日志，默认为 `false`；
- `cache.maxAge`：缓存失效时间，默认值为 `5184000000` 。

## 原理

Webpack5 会将首次构建出的 Module、Chunk、ModuleGraph 等对象序列化后保存到硬盘中，后面再运行的时候，就可以跳过许多耗时的编译动作，直接复用缓存数据。回顾  Webpack 构建三大阶段，过程中存在许多 CPU 密集型操作，例如调用 Loader 链加载文件时，遇到 babel-loader、eslint-loader、ts-loader 等工具时可能需要重复生成 AST；分析模块依赖时则需要遍历 AST，执行大量运算；Seal 阶段也同样存在大量 AST 遍历，以及代码转换、优化操作，等等。而 Webpack5 的持久化缓存功能则将构建结果保存到文件系统中，在下次编译时对比每一个文件的内容哈希或时间戳，未发生变化的文件跳过编译操作，直接使用缓存副本，减少重复计算；发生变更的模块则重新执行编译流程。缓存执行时机如下图：

![cache1](/blog/images/devops/cache1.png)

Webpack 在首次构建完毕后将 Module、Chunk、ModuleGraph 三类对象的状态序列化并记录到缓存文件中；在下次构建开始时，尝试读入并恢复这些对象的状态，从而跳过执行 Loader 链、解析 AST、解析依赖等耗时操作，提升编译性能。

## V4 缓存

Webpack5 的持久化缓存用法简单，效果出众，但可惜在 Webpack4 及之前版本原生还没有相关实现，只能借助一些第三方组件实现类似效果，包括：

1. [cache-loader](https://www.npmjs.com/package/cache-loader) 能够将 Loader 处理结果保存到硬盘，下次运行时若文件内容没有发生变化则直接返回缓存结果。但其只缓存了 Loader 执行结果，缓存范围与精度不如 Webpack5 内置的缓存功能，所以性能效果相对较低。此外，`cache-loader` 还提供了一系列控制缓存逻辑的配置属性，特别是 `read/write` 可以用于改变缓存数据的持久化逻辑，借助这两个属性我们甚至能够实现多台机器间的缓存共享。借助这种能力，我们可以打通本地与线上 CI/CD 环境，实现开发与生产环境构建的构建性能优化。
2. [hard-source-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fmzgoddard%2Fhard-source-webpack-plugin) 也是一种实现缓存功能的第三方组件，与 cache-loader 不同的是，它并不仅仅缓存了 Loader 运行结果，还保存了 Webpack 构建过程中许多中间数据，包括：模块、模块关系、模块 Resolve 结果、Chunks、Assets 等，效果几乎与 Webpack5 自带的 Cache 对齐。首次运行时，`hard-source-webpack-plugin` 会在缓存文件夹 `node_module/.cache` 写入一系列日志文件。下次运行时，`hard-source-webpack-plugin` 插件会复用缓存中记录的数据，跳过一系列构建步骤，从而提升构建性能。
3. Loader自带的缓存能力。例如，babel-loader：针对 Babel 工具的专用缓存能力。

## 小结

Webpack5 持久化缓存用法简单，且优化效果非常出色，确实是一个特别让人振奋的新功能，甚至特定情况下能够让构建性能达到 Unbundle 方案的量级，妥妥的 Webpack 性能优化利器！

而在 Webpack4 中，我们还可以借助下述组件实现缓存优化：

- `cache-loader`：针对 Loader 运行结果的通用缓存方案；
- `hard-source-webpack-plugin`：针对 Webpack 全生命周期的通用缓存方案；
- `babel-loader`：针对 Babel 工具的专用缓存能力；
- `eslint-loader`/`eslint-webpack-plugin`：针对 ESLint 的专用缓存方案；
- `stylelint-webpack-plugin`：针对 StyleLint 的专用缓存方案。

持久缓存效果非常好，但是对于首次启动的项目来说没有任何提升。那么有没有办法直接提升首次构建速度？

使用 `swc-loader / esbuild-loader` 替换 `babel-loader` 也可以一定程度上减少构建耗时。

ESBuild/SWC 效果也非常不错，但对于部分项目来说无法完全脱离 Babel ，即使使用了 ESBuild 或 SWC 后也会受到来自 node_modules 模块数量过多的影响无法达到更快的构建速度。
