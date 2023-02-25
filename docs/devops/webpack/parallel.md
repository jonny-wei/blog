# 并行构建

受限于 Node.js 的单线程架构，原生 Webpack 对所有资源文件做的所有解析、转译、合并操作本质上都是在同一个线程内串行执行，CPU 利用率极低，因此，理所当然地，社区出现了一些以多进程方式运行 Webpack。

- [HappyPack](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Famireh%2Fhappypack)：多进程方式运行资源加载(Loader)逻辑 - 已不再维护。
- [Thread-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Floaders%2Fthread-loader%2F)：Webpack 官方出品，同样以多进程方式运行资源加载逻辑。Thread-loader 放在其他 loader 之前，会将之后的 loader 放在一个单独的 worker 池中运行，将串行执行改为并行执行。HappyPack、Thread-loader 都面临着频繁的子进程创建、销毁所带来的性能问题。Thread-loader不能获取 compilation、compiler 等实例对象，也无法获取 Webpack 配置。Thread-loader、HappyPack 这类组件所提供的并行能力都仅作用于文件加载过程，对后续 AST 解析、依赖收集、打包、优化代码等过程均没有影响，理论收益还是比较有限的。
- [Parallel-Webpack](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fparallel-webpack)：多进程方式运行多个 Webpack 构建实例。这种实现，对单 entry 的项目没有任何收益，只会徒增进程创建成本；但特别适合 MPA 等多 entry 场景，或者需要同时编译出 esm、umd、amd 等多种产物形态的类库场景。
- [TerserWebpackPlugin](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fterser-webpack-plugin%23terseroptions)：支持多进程方式执行代码压缩、uglify 功能。

## 原理

针对某种计算任务创建子进程，之后将运行所需参数通过 IPC 传递到子进程并启动计算操作，计算完毕后子进程再将结果通过 IPC 传递回主进程，寄宿在主进程的组件实例，再将结果提交给 Webpack。

## 用法

- 对于 Webpack4 之前的项目，可以使用 HappyPack 实现并行文件加载；
- Webpack4 之后则建议使用 Thread-loader；
- 多实例并行构建场景建议使用 Parallel-Webpack 实现并行；
- 生产环境下还可配合 terser-webpack-plugin 的并行压缩功能，提升整体效率。

理论上，并行确实能够提升系统运行效率，但 Node 单线程架构下，所谓的并行计算都只能依托与派生子进程执行，而创建进程这个动作本身就有不小的消耗 —— 大约 600ms，对于小型项目，构建成本可能可能很低，引入多进程技术反而导致整体成本增加，因此建议大家按实际需求斟酌使用上述多进程方案。

### 使用 HappyPack

[HappyPack](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Famireh%2Fhappypack) 能够将耗时的**文件加载**（Loader）操作拆散到多个子进程中并发执行，子进程执行完毕后再将结果合并回传到 Webpack 进程，从而提升构建性能。不过，HappyPack 的用法稍微有点难以理解，需要同时：

- 使用 `happypack/loader` 代替原本的 Loader 序列；
- 使用 `HappyPack` 插件注入代理执行 Loader 序列的逻辑。

开启 HappyPack 前，构建耗时大约为 11000ms 到 18000ms 之间，开启后耗时降低到 5800ms 到 8000ms 之间，提升约47%。

HappyPack 虽然确实能有效提升 Webpack 的打包构建速度，但它有一些明显的缺点：

- 作者已经明确表示不会继续维护，扩展性与稳定性缺乏保障，随着 Webpack 本身的发展迭代，可以预见总有一天 HappyPack 无法完全兼容 Webpack；
- HappyPack 底层以自己的方式重新实现了加载器逻辑，源码与使用方法都不如 Thread-loader 清爽简单，而且会导致一些意想不到的兼容性问题，如 `awesome-typescript-loader`；
- HappyPack 主要作用于文件加载阶段，并不会影响后续的产物生成、合并、优化等功能，性能收益有限。

### 使用 Thread-loader

[Thread-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Floaders%2Fthread-loader%2F) 与 HappyPack 功能类似，都是以多进程方式加载文件的 Webpack 组件，两者主要区别：

1. Thread-loader 由 Webpack 官方提供，目前还处于持续迭代维护状态，理论上更可靠；
2. Thread-loader 只提供了一个 Loader 组件，用法简单很多；
3. HappyPack 启动后会创建一套 Mock 上下文环境 —— 包含 `emitFile` 等接口，并传递给 Loader，因此对大多数 Loader 来说，运行在 HappyPack 与运行在 Webpack 原生环境相比没有太大差异；但 Thread-loader 并不具备这一特性，所以要求 Loader 内不能调用特定上下文接口，兼容性较差。

启动后，Thread-loader 会在加载文件时创建新的进程，在子进程中使用 loader-runner 库运行 thread-loader 之后的 Loader 组件，执行完毕后再将结果回传到 Webpack 主进程，从而实现性能更佳的文件加载转译效果。

不过，Thread-loader 也同样面临着频繁的子进程创建、销毁所带来的性能问题，为此，Thread-loader 提供了 warmup 接口用于前置创建若干工作子进程，降低构建时延。

与 HappyPack 相比，Thread-loader 有两个突出的优点，一是产自 Webpack 官方团队，后续有长期维护计划，稳定性有保障；二是用法更简单。但它不可避免的也存在一些问题：

- 在 Thread-loader 中运行的 Loader 不能调用 `emitAsset` 等接口，这会导致 `style-loader` 这一类加载器无法正常工作，解决方案是将这类组件放置在 `thread-loader` 之前，如 `['style-loader', 'thread-loader', 'css-loader']`；
- Loader 中不能获取 `compilation`、`compiler` 等实例对象，也无法获取 Webpack 配置。

### 使用 Parallel-Webpack

Thread-loader、HappyPack 这类组件所提供的并行能力都仅作用于文件加载过程，对后续 AST 解析、依赖收集、打包、优化代码等过程均没有影响，理论收益还是比较有限的。对此，社区还提供了另一种并行度更高，以多个独立进程运行 Webpack 实例的方案 —— [Parallel-Webpack](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftrivago%2Fparallel-webpack)

Parallel-Webpack 会为配置文件中导出的每个 Webpack 配置对象启动一个独立的构建进程，从而实现并行编译的效果。底层原理很简单，基本上就是在 Webpack 上套了个壳：

- 根据传入的配置项数量，调用 `worker-farm` 创建复数个工作进程；
- 工作进程内调用 Webpack 执行构建；
- 工作进程执行完毕后，调用 `node-ipc` 向主进程发送结束信号。

这种方式在需要同时执行多份配置的编译时特别有效，但若配置文件本身只是导出了单个配置对象则意义不大。

为了更好地支持多种配置的编译，Parallel-Webpack 还提供了 `createVariants` 函数，用于根据给定变量组合，生成多份 Webpack 配置对象。

虽然，parallel-webpack 相对于 Thread-loader、HappyPack 有更高的并行度，但进程实例之间并没有做任何形式的通讯，这可能导致相同的工作在不同进程 —— 或者说不同 CPU 核上被重复执行。

例如需要对同一份代码同时打包出压缩和非压缩版本时，在 parallel-webpack 方案下，前置的资源加载、依赖解析、AST 分析等操作会被重复执行，仅仅最终阶段生成代码时有所差异。

这种技术实现，对单 entry 的项目没有任何收益，只会徒增进程创建成本；但特别适合 MPA 等多 entry 场景，或者需要同时编译出 esm、umd、amd 等多种产物形态的类库场景。

### 并行压缩

Webpack4 默认使用 [Uglify-js](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fuglifyjs-webpack-plugin) 实现代码压缩，Webpack5 之后则升级为 [Terser](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fplugins%2Fterser-webpack-plugin%2F) —— 一种[性能](https://link.juejin.cn/?target=https%3A%2F%2Fblog.logrocket.com%2Fterser-vs-uglify-vs-babel-minify-comparing-javascript-minifiers%2F)与兼容性更好的 JavaScript 代码压缩混淆工具，两种组件都原生实现了多进程并行压缩能力。

## 小结

受限于 JavaScript 的单线程架构，Webpack 构建时并不能充分使用现代计算机的多核 CPU 能力，为此社区提供了若干基于多进程实现的并行构建组件，包括文中介绍的 HappyPack、Thread-loader、Parallel-Webpack、Terser。

- 对于 Webpack4 之前的项目，可以使用 HappyPack 实现并行文件加载；
- Webpack4 之后则建议使用 Thread-loader；
- 多实例并行构建场景建议使用 Parallel-Webpack 实现并行；
- 生产环境下还可配合 `terser-webpack-plugin` 的并行压缩功能，提升整体效率。

理论上，并行确实能够提升系统运行效率，但 Node 单线程架构下，所谓的并行计算都只能依托与派生子进程执行，而创建进程这个动作本身就有不小的消耗 —— 大约 600ms，对于小型项目，构建成本可能可能很低，引入多进程技术反而导致整体成本增加，因此建议大家按实际需求斟酌使用上述多进程方案。
