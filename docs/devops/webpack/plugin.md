# Webpack Plugin

## 理解 Plugin

Webpack Plugin 其实就是一个普通的函数，在该函数中需要我们定制一个 apply 方法。当 Webpack 内部进行插件挂载时会执行 apply 函数。我们可以在 apply 方法中订阅各种生命周期钩子，当到达对应的时间点时就会执行。

插件通常是一个带有 `apply` 函数的类。Webpack 在启动时会调用插件对象的 `apply` 函数，并以参数方式传递核心对象 `compiler` ，以此为起点，插件内可以注册 `compiler` 对象及其子对象的钩子([Hook](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fplugins%2F))回调，例如：

```js
class SomePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("SomePlugin", (compilation) => {
      compilation.addModule(/* ... */);
    });
  }
}
```

示例中的 `compiler` 为 Hook 挂载的对象；`thisCompilation` 为 Hook 名称；后面调用的 `tap` 为调用方式，支持 `tap/tapAsync/tapPromise` 等。

在 Webpack 运行过程中，随着构建流程的推进会触发各个钩子回调，并传入上下文参数(例如上例回调函数中的 `compilation` 对象)，插件可以通过调用上下文接口、修改上下文状态等方式「篡改」构建逻辑，从而将扩展代码「勾入」到 Webpack 构建流程中。

基于 Hook 这一设计，开发插件时我们需要重点关注两个问题：

1. 针对插件需求，我们应该使用什么钩子？
2. 选定钩子后，我怎么跟上下文参数交互？

### 什么时候触发什么构子

Webpack5 暴露了多达 200+ 个 Hook，基本上覆盖了整个构建流程的所有环节 —— 这也就意味着通过编写插件，我们几乎可以改写 Webpack 的所有执行逻辑。问题是，我们在什么情况下该用什么钩子？这就需要了解 Webpack 内部几个核心对象，以及各对象下 Hook 的触发时机，例如：

- [Compiler](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fcompiler-hooks%2F)：全局构建管理器，Webpack 启动后会首先创建 `compiler` 对象，负责管理配置信息、Loader、Plugin 等。从启动构建到结束，`compiler` 大致上会触发如下钩子：

![plugin1](/blog/images/devops/plugin1.png)

- [Compilation](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fcompilation-hooks%2F)：单次构建过程的管理器，负责遍历模块，执行编译操作；当 `watch = true` 时，每次文件变更触发重新编译，都会创建一个新的 `compilation` 对象；`compilation` 生命周期中主要触发如下钩子：

![plugin2](/blog/images/devops/plugin2.png)

- 此外，还有 [Module](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fnormalmodulefactory-hooks%2F)、Resolver、[Parser](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fparser%2F)、Generator 等关键类型，也都相应暴露了许多 Hook。

由此可见，Webpack Hook 与构建流程强相关，使用时结合上面流程图分析 Hook 对应的流程环节，以及这个环节主要完成了什么工作，可以借助 Hook 做出哪些修改。

### 使用 Hook 上下文接口

Webpack Hook 有两个重点，一是上面介绍的触发时机；二是触发时传递的上下文参数。例如：

- `compiler.hooks.compilation`：
  - 时机：Webpack 刚启动完，创建出 `compilation` 对象后触发；
  - 参数：当前编译的 `compilation` 对象。
- `compiler.hooks.make`：
  - 时机：正式开始构建时触发；
  - 参数：同样是当前编译的 `compilation` 对象。
- `compilation.hooks.optimizeChunks`：
  - 时机： `seal` 函数中，`chunk` 集合构建完毕后触发；
  - 参数：`chunks` 集合与 `chunkGroups` 集合。
- `compiler.hooks.done`：
  - 时机：编译完成后触发；
  - 参数： `stats` 对象，包含编译过程中的各类统计信息。

每个钩子传递的上下文参数不同，但主要包含如下几种类型(以 Webpack5 为例)：

- complation 对象：构建管理器，使用率非常高，主要提供了一系列与单次构建相关的接口，包括：
  - `addModule`：用于添加模块，例如 Module 遍历出依赖之后，就会调用该接口将新模块添加到构建需求中；
  - `addEntry`：添加新的入口模块，效果与直接定义 `entry` 配置相似；
  - `emitAsset`：用于添加产物文件，效果与 Loader Context 的 `emitAsset` 相同；
  - `getDependencyReference`：从给定模块返回对依赖项的引用，常用于计算模块引用关系；
  - 等等。
- compiler 对象：全局构建管理器，提供如下接口：
  - `createChildCompiler`：创建子 `compiler` 对象，子对象将继承原始 Compiler 对象的所有配置数据；
  - `createCompilation`：创建 `compilation` 对象，可以借此实现并行编译；
  - `close`：结束编译；
  - `getCache`：获取缓存接口，可借此复用 Webpack5 的缓存功能；
  - `getInfrastructureLogger`：获取[日志对象](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fconfiguration%2Fother-options%2F%23infrastructurelogging)；
  - 等等。
- module 对象：资源模块，有诸如`NormalModule/RawModule/ContextModule`等子类型，其中 `NormalModule` 使用频率较高，提供如下接口：
  - `identifier`：读取模块的唯一标识符；
  - `getCurrentLoader`：获取当前正在执行的 Loader 对象；
  - `originalSource`：读取模块原始内容；
  - `serialize/deserialize`：模块序列化与反序列化函数，用于实现持久化缓存，一般不需要调用；
  - `issuer`：模块的引用者；
  - `isEntryModule`：用于判断该模块是否为入口文件；
  - 等等。
- chunk 对象：模块封装容器，提供如下接口：
  - `addModule`：添加模块，之后该模块会与 Chunk 中其它模块一起打包，生成最终产物；
  - `removeModule`：删除模块；
  - `containsModule`：判断是否包含某个特定模块；
  - `size`：推断最终构建出的产物大小；
  - `hasRuntime`：判断 Chunk 中是否包含运行时代码；
  - `updateHash`：计算 Hash 值。
- [stats](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fstats%2F) 对象：构建过程收集到的统计信息，包括模块构建耗时、模块依赖关系、产物文件列表等。

## 实例分析

### imagemin-webpack-plugin

如何遍历、修改最终产物文件？

[imagemin-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2FKlathmon%2Fimagemin-webpack-plugin) 是一个用于实现图像压缩的插件，它会在 Webpack 完成前置的代码分析构建，提交([emit](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fcompiler-hooks%2F%23emit))产物时，找出所有图片资源并调用 [imagemin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fimagemin%2Fimagemin) 压缩图像。核心逻辑：

```js
export default class ImageminPlugin {
  constructor(options = {}) {
    // init options
  }

  apply(compiler) {
    // ...
    const onEmit = async (compilation, callback) => {
      // ...
      await Promise.all([
        ...this.optimizeWebpackImages(throttle, compilation),
        ...this.optimizeExternalImages(throttle),
      ]);
    };

    compiler.hooks.emit.tapAsync(this.constructor.name, onEmit);
  }

  optimizeWebpackImages(throttle, compilation) {}

  optimizeExternalImages(throttle) {}
}
```

上述代码主要用到 `compiler.hooks.emit` 钩子，该钩子在 Webpack 完成代码构建与打包操作，准备将产物发送到输出目录之前执行，我们可以在此修改产物内容，如上例 `optimizeWebpackImages` 函数：

```js
export default class ImageminPlugin {
  optimizeWebpackImages(throttle, compilation) {
    const {
        // 用于判断是否对特定文件做图像压缩操作
        testFunction,
        // 缓存目录
        cacheFolder
      } = this.options
  
    // 遍历 `assets` 产物数组
      return map(compilation.assets, (asset, filename) => throttle(async () => {
        // 读取产物内容
        const assetSource = asset.source()
        if (testFunction(filename, assetSource)) {
          // 尝试从缓存中读取
          let optimizedImageBuffer = await getFromCacheIfPossible(cacheFolder, assetSource, () => {
            // 调用 `imagemin` 压缩图片
            return optimizeImage(assetSource, this.options)
          })
  
          // 之后，使用优化版本替换原始文件
          compilation.assets[filename] = new RawSource(optimizedImageBuffer)
        }
      }))
  }
}
```

这里面的关键逻辑是：

1. 遍历 `compilation.assets` 产物列表，调用 `asset.source()` 方法读取产物内容；
2. 调用 `imagemin` 压缩图片；
3. 修改 `compilation.assets`，使用优化后的图片 `RawSource` 对象替换原始 `asset` 对象。

至此完成文件压缩操作。

::: tip 提示
`Source` 是 Webpack 内代表资源内容的类，由 [webpack-source](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack-sources%2Fblob%2FHEAD%2Flib%2Findex.js) 库实现，支持 `RawSource/ConcatSource` 等子类型，用于实现文件读写、合并、修改、Sourcemap 等操作。
:::

### eslint-webpack-plugin

如何提交错误日志?

[eslint-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack-contrib%2Feslint-webpack-plugin) 是一个基于 ESLint 实现的代码风格检查插件，它的实现比较巧妙，一是使用多个 Hook，在不同时间点执行 Lint 检查；二是复用 Webpack 内置的 `error/warn` 方法提交代码风格问题。核心逻辑：

```js
class ESLintWebpackPlugin {
  constructor(options = {}) {
    // ...
  }

  apply(compiler) {
    compiler.hooks.run.tapPromise(this.key, (c) =>
      this.run(c, options, wanted, exclude)
    );
  }

  async run(compiler, options, wanted, exclude) {
    compiler.hooks.compilation.tap(this.key, (compilation) => {
      ({ lint, report, threads } = linter(this.key, options, compilation));

      const files = [];

      // 单个模块成功编译后触发
      compilation.hooks.succeedModule.tap(this.key, ({ resource }) => {
        // 判断是否需要检查该文件
        if (
          isMatch(file, wanted, { dot: true }) &&
          !isMatch(file, exclude, { dot: true })
        ) {
          lint(file);
        }
      });

      // 所有模块构建完毕后触发
      compilation.hooks.finishModules.tap(this.key, () => {
        if (files.length > 0 && threads <= 1) {
          lint(files);
        }
      });

      // 等待检查结果
      compilation.hooks.additionalAssets.tapPromise(this.key, processResults);

      async function processResults() {}
    });
  }
}
```

代码用到如下 Hook：

- `compiler.hooks.compilation`：Compiler 环境初始化完毕，创建出 `compilation` 对象，准备开始执行构建前触发；
- `compilation.hooks.succeedModule`：Webpack 完成单个「模块」的读入、运行 Loader、AST 分析、依赖分析等操作后触发；
- `compilation.hooks.finishModules`：Webpack 完成「所有」模块的读入、运行 Loader、依赖分析等操作后触发；
- `compilation.hooks.additionalAssets`：构建、打包完毕后触发，通常用于为编译创建附加资产。

其中，比较重要的是借助 `compilation.hooks.succeedModule` 钩子，在每个模块处理完毕之后立即通过 `lint` 函数添加非阻塞代码检查任务，相比于过去的 [eslint-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Feslint-loader) 的阻塞式执行，这种方式能够提高 ESLint 的并发度，效率更高。

其次，借助 `compilation.hooks.additionalAssets` 钩子，在所有模块处理完毕后读取检查结果 —— 即 `processResults` 函数，核心代码：

```js
async function processResults() {
  const { errors, warnings } = await report();

  if (warnings && !options.failOnWarning) {
    compilation.warnings.push(warnings);
  } else if (warnings && options.failOnWarning) {
    compilation.errors.push(warnings);
  }

  if (errors && options.failOnError) {
    compilation.errors.push(errors);
  } else if (errors && !options.failOnError) {
    compilation.warnings.push(errors);
  }
}
```

代码读取 ESLint 执行结果(`report` 函数)，并使用 `compilation` 的 `errors` 与 `warnings` 数组提交错误/警告信息，这种方式只会输出错误信息，不会中断编译流程

### DefinePlugin

插件中如何与 AST 结构交互?

[DefinePlugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack) 是 Webpack 官方实现的，用于构建时注入预定义常量的插件，先简单回顾一下[用法](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fplugins%2Fdefine-plugin%2F)，如：

```js
const { DefinePlugin } = require("webpack");

const baseConfig = {
  // ...
  plugins: [
    new DefinePlugin({
      PROD: true,
      VERSION: JSON.stringify("12.13.0"),
    }),
  ],
};
```

之后，Webpack 会帮我们替换掉代码中所有 `DefinePlugin` 声明的属性值，例如：

```js
// 源码：
console.log(PROD, VERSION);

// 构建结果：
console.log(true, "5fa3b9");
```

`DefinePlugin` 的 [底层实现](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FDefinePlugin.js) 比较复杂，需要遍历 AST 找出变量名对应的代码位置之后再做替换，插件核心结构：

```js
class DefinePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "DefinePlugin",
      (compilation, { normalModuleFactory }) => {
        const handler = (parser) => {
          // 递归处理 `DefinePlugin` 参数
          const walkDefinitions = (definitions, prefix) => {
            Object.keys(definitions).forEach((key) => {
              const code = definitions[key];
              if (isObject /*...*/) {
                // 递归处理对象属性
                walkDefinitions(code, prefix + key + ".");
                applyObjectDefine(prefix + key, code);
                return;
              }
              applyDefineKey(prefix, key);
              applyDefine(prefix + key, code);
            });
          };

          // 替换基本类型的表达式值
          const applyDefine = (key, code) => {
            if (!isTypeof) {
              // 借助 expression 钩子替换内容
              parser.hooks.expression.for(key).tap("DefinePlugin", (expr) => {
                /*...*/
              });
            }
            // 处理 `'typeof window': JSON.stringify('object'),` 场景
            parser.hooks.typeof.for(key).tap("DefinePlugin", (expr) => {
              /*...*/
            });
          };

          // 替换引用类型的表达式值
          const applyObjectDefine = (key, obj) => {
            // ...
            parser.hooks.expression.for(key).tap("DefinePlugin", (expr) => {
              /*...*/
            });
          };

          walkDefinitions(definitions, "");
        };

        // 监听 `parser` 钩子
        normalModuleFactory.hooks.parser
          .for("javascript/auto")
          .tap("DefinePlugin", handler);
        normalModuleFactory.hooks.parser
          .for("javascript/dynamic")
          .tap("DefinePlugin", handler);
        normalModuleFactory.hooks.parser
          .for("javascript/esm")
          .tap("DefinePlugin", handler);
      }
    );
  }
}
module.exports = DefinePlugin;
```

核心逻辑：

1. 使用 `normalModuleFactory.hooks.parser` 钩子(上例 48 行)，在 Webpack 创建出代码解析器 `Parser` 对象后执行 `handler` 函数。注意，此时还没有执行代码转 AST 操作；
2. `walkDefinitions` 函数中递归遍历 `DefinePlugin` 参数对象，为每一个属性注册 `parser.hooks.expression` 钩子回调，该钩子会在 Webpack 遍历 AST 过程遇到表达式语句时触发；
3. 在 `parser.hooks.expression` 回调中创建新的 `Dependency` 对象，调用 [addPresentationalDependency](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FModule.js%23L494) 添加为模块依赖：

```js
const toConstantDependency = (parser, value, runtimeRequirements) => {
  return function constDependency(expr) {
    const dep = new ConstDependency(value, expr.range, runtimeRequirements);
    dep.loc = expr.loc;
    // 创建静态依赖对象，替换 loc 指定位置内容
    parser.state.module.addPresentationalDependency(dep);
    return true;
  };
};

const applyDefine = (key, code) => {
  parser.hooks.expression.for(key).tap("DefinePlugin", (expr) => {
    const strCode = toCode(/*...*/);
    if (/*...*/) {
      /*...*/
    } else {
      return toConstantDependency(parser, strCode)(expr);
    }
  });
};
```

之后，Webpack 会借助 Template 接口将上述 `Dependency` 打包进 Chunk 中，替换对应位置(`loc`)代码。

这一个功能效果看起来简单，但实现特别复杂的例子，底层需要使用 Parser 钩子遍历 AST 结构，之后借助 Dependency 声明代码依赖，最后借助 Template 替换代码内容，过程中已经涉及到许多 Webpack 底层对象。

## 插件架构

插件架构至少需要解决三个方面的问题：

- **接口**：需要提供一套逻辑接入方法，让开发者能够将代码插入特定环节，变更原始逻辑；
- **输入**：如何将上下文信息高效传导给插件；
- **输出**：插件内部通过何种方式影响整套运行体系。

针对这些问题，webpack 基于 [tapable](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Ftapable) 实现了：

1. 编译过程的特定节点以钩子形式，通知插件此刻正在发生什么事情；
2. 通过 tapable 提供的回调机制，以参数方式传递上下文信息；
3. 在上下文参数对象中附带了很多存在 Side Effect 的交互接口，插件可以通过这些接口改变。

这一切都离不开 tapable，举例来说：

```js
class Compiler {
  // 在构造函数中，先初始化钩子对象
  constructor() {
    this.hooks = {
      thisCompilation: new SyncHook(["compilation", "params"]),
    };
  }

  compile() {
    // 特定时机触发特定钩子
    const compilation = new Compilation();
    this.hooks.thisCompilation.call(compilation);
  }
}
```

`Compiler` 类型内部定义了 `thisCompilation` 钩子，并在 `compilation` 创建完毕后发布事件消息，插件开发者就可以基于这个钩子获取到最新创建出的 `compilation` 对象：

```js
class SomePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("SomePlugin", (compilation, params) => {
        // 上下文信息： compilation、params
    });
  }
}
```

钩子回调传递的 `compilation/params` 参数，就是 Webpack 希望传递给插件的上下文信息，也是插件能拿到的输入。不同钩子会传递不同的上下文对象，这一点在钩子被创建的时候就定下来了，比如：

```js
class Compiler {
    constructor() {
        this.hooks = {
            /** @type {SyncBailHook<Compilation>} */
            shouldEmit: new SyncBailHook(["compilation"]),
            /** @type {AsyncSeriesHook<Stats>} */
            done: new AsyncSeriesHook(["stats"]),
            /** @type {AsyncSeriesHook<>} */
            additionalPass: new AsyncSeriesHook([]),
            /** @type {AsyncSeriesHook<Compiler>} */
            beforeRun: new AsyncSeriesHook(["compiler"]),
            /** @type {AsyncSeriesHook<Compiler>} */
            run: new AsyncSeriesHook(["compiler"]),
            /** @type {AsyncSeriesHook<Compilation>} */
            emit: new AsyncSeriesHook(["compilation"]),
            /** @type {AsyncSeriesHook<string, Buffer>} */
            assetEmitted: new AsyncSeriesHook(["file", "content"]),
            /** @type {AsyncSeriesHook<Compilation>} */
            afterEmit: new AsyncSeriesHook(["compilation"]),
        };
    }
}
```

- `shouldEmit` 会被传入 `compilation` 参数；
- `done` 会被传入 `stats` 参数；
- ……

这一设计贯穿 Webpack 整个执行过程，几乎无处不在，我们可以借此介入 Webpack 的运行逻辑。

插件架构的精髓又在于其灵活多变的 Hook 体系，可以说，只有真正掌握 Hook 底层设计与实现逻辑，深入理解不同 Hook 的运行特性与用法，才能灵活处理各种问题，更快更好地编写出 Webpack 插件。

## Tapable 浅析

Webpack 的插件体系是一种基于 [Tapable](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Ftapable) 实现的强耦合架构，它在特定时机触发钩子时会附带上足够的上下文信息，插件定义的钩子回调中，能也只能与这些上下文背后的数据结构、接口交互产生 side effect，进而影响到编译状态和后续流程。

[Tapable](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Ftapable) 是 Webpack 插件架构的核心支架，但它的代码量其实很少，本质上就是围绕着 `订阅/发布` 模式叠加各种特化逻辑，适配 Webpack 体系下复杂的事件源-处理器之间交互需求，比如：

- 有些场景需要支持将前一个处理器的结果传入下一个回调处理器；
- 有些场景需要支持异步并行调用这些回调处理器。

先简单看看 Tapable 的用法：

```js
const { SyncHook } = require("tapable");

// 1. 创建钩子实例
const sleep = new SyncHook();

// 2. 调用订阅接口注册回调
sleep.tap("test", () => {
  console.log("callback A");
});

// 3. 调用发布接口触发回调
sleep.call();

// 运行结果：
// callback A
```

使用 Tapable 时通常需要经历三个步骤：

- 创建钩子实例，如上例第 4 行；
- 调用订阅接口注册回调，包括：`tap`、`tapAsync`、`tapPromise`，如上例第 7 行；
- 调用发布接口触发回调，包括：`call`、`callAsync`、`promise`，如上例第 12 行。

Webpack 内部的钩子大体上都遵循上面三个步骤，只是在某些钩子中还可以使用异步风格的 `tapAsync/callAsync`、promise 风格 `tapPromise/promise`，具体使用哪一类函数与钩子类型有关。

## Hook 类型汇总

Tabable 提供如下类型的钩子：

| 名称                       | 简介               | 统计                                                         |
| -------------------------- | ------------------ | ------------------------------------------------------------ |
| `SyncHook`                 | 同步钩子           | Webpack 共出现 71 次，如 `Compiler.hooks.compilation`        |
| `SyncBailHook`             | 同步熔断钩子       | Webpack 共出现 66 次，如 `Compiler.hooks.shouldEmit`         |
| `SyncWaterfallHook`        | 同步瀑布流钩子     | Webpack 共出现 37 次，如 `Compilation.hooks.assetPath`       |
| `SyncLoopHook`             | 同步循环钩子       | Webpack 中未使用                                             |
| `AsyncParallelHook`        | 异步并行钩子       | Webpack 仅出现 1 次：`Compiler.hooks.make`                   |
| `AsyncParallelBailHook`    | 异步并行熔断钩子   | Webpack 中未使用                                             |
| `AsyncSeriesHook`          | 异步串行钩子       | Webpack 共出现 16 次，如 `Compiler.hooks.done`               |
| `AsyncSeriesBailHook`      | 异步串行熔断钩子   | Webpack 中未使用                                             |
| `AsyncSeriesLoopHook`      | 异步串行循环钩子   | Webpack 中未使用                                             |
| `AsyncSeriesWaterfallHook` | 异步串行瀑布流钩子 | Webpack 共出现 5 次，如 `NormalModuleFactory.hooks.beforeResolve` |

类型虽多，但整体遵循两种分类规则：

- 按回调逻辑，分为：
  - 基本类型，名称不带 `Waterfall/Bail/Loop` 关键字：与通常 `订阅/回调` 模式相似，按钩子注册顺序，逐次调用回调；
  - `waterfall` 类型：前一个回调的返回值会被带入下一个回调；
  - `bail` 类型：逐次调用回调，若有任何一个回调返回非 `undefined` 值，则终止后续调用；
  - `loop` 类型：逐次、循环调用，直到所有回调函数都返回 `undefined` 。
- 按执行回调的并行方式，分为：
  - `sync` ：同步执行，启动后会按次序逐个执行回调，支持 `call/tap` 调用语句；
  - `async` ：异步执行，支持传入 callback 或 promise 风格的异步回调函数，支持 `callAsync/tapAsync` 、`promise/tapPromise` 两种调用语句。

所有钩子都可以按名称套进这两条规则里面，对插件开发者来说不同类型的钩子会直接影响到回调函数的写法，以及插件与其他插件的互通关系，但是有一些基本能力、概念是通用的：`tap/call`、`intercept`、`context`、动态编译等。

Tapable 合计提供了 10 种钩子，支持同步、异步、熔断、循环、waterfall 等功能特性，以此支撑起 Webpack 复杂的构建需求。虽然多数情况下我们不需要手动调用 Tapable，但编写插件时可以借助这些知识，识别 Hook 类型与执行特性后，正确地调用，正确地实现交互。

## Hook 动态编译

Webpack 中用到的 Hook 子类都已介绍完毕，不同 Hook 适用于不同场景，解决不同问题，而它们底层都基于 Tapable 的“动态编译”实现，可以说，理解了动态编译，也就掌握了 Tapable 的核心实现逻辑。

动态编译是一个非常大胆的设计，不同 Hook 所谓的同步、异步、bail、waterfall、loop 等回调规则都是 Tapable 根据 Hook 类型、参数、回调队列等参数，调用 `new Function` 语句动态拼装出一段控制执行流程的 JavaScript 代码实现控制的。例如：

```js
const { SyncHook } = require("tapable");

const sleep = new SyncHook();

sleep.tap("test", () => {
  console.log("callback A");
});
sleep.call();
```

调用 `sleep.call` 时，Tapable 内部处理流程大致为：

![plugin3](/blog/images/devops/plugin3.png)

编译过程主要涉及三个实体：

- `tapable/lib/SyncHook.js` ：定义 `SyncHook` 的入口文件；
- `tapable/lib/Hook.js` ：`SyncHook` 只是一个代理接口，内部实际上调用了 `Hook` 类，由 `Hook` 负责实现钩子的逻辑（其它钩子也是一样的套路）；
- `tapable/lib/HookCodeFactory.js` ：动态编译出 `call`、`callAsync`、`promise` 函数内容的工厂类，注意，其他钩子也都会用到 `HookCodeFactory` 工厂函数。

`SyncHook` （其他钩子类似)）调用 `call` 后，`Hook` 基类收集上下文信息并调用 `createCall` 及子类传入的 `compiler` 函数；`compiler` 调用 `HookCodeFactory` 进而使用 `new Function` 方法动态拼接出回调执行函数。上面例子对应的生成函数：

```js
(function anonymous(
) {
"use strict";
var _context;
var _x = this._x;
var _fn0 = _x[0];
_fn0();

})
```

那么问题来了，通过 `new Function`、`eval` 等方式实现的动态编译，存在诸如性能、安全性等方面的问题，所以社区很少见到类似的设计，真的有必要用这种方式实现 Hook 吗？

这放在 `SyncHook` 这种简单场景确实大可不必，但若是更复杂的 Hook，如 `AsyncSeriesWaterfallHook`：

```js
const { AsyncSeriesWaterfallHook } = require("tapable");

const sleep = new AsyncSeriesWaterfallHook(["name"]);

sleep.tapAsync("test1", (name, cb) => {
  console.log(`执行 A 回调： 参数 name=${name}`);
  setTimeout(() => {
    cb(undefined, "tecvan2");
  }, 100);
});

sleep.tapAsync("test", (name, cb) => {
  console.log(`执行 B 回调： 参数 name=${name}`);
  setTimeout(() => {
    cb(undefined, "tecvan3");
  }, 100);
});

sleep.tapAsync("test", (name, cb) => {
  console.log(`执行 C 回调： 参数 name=${name}`);
  setTimeout(() => {
    cb(undefined, "tecvan4");
  }, 100);
});

sleep.callAsync("tecvan", (err, name) => {
  console.log(`回调结束， name=${name}`);
});

// 运行结果：
// 执行 A 回调： 参数 name=tecvan
// 执行 B 回调： 参数 name=tecvan2
// 执行 C 回调： 参数 name=tecvan3
// 回调结束， name=tecvan4
```

`AsyncSeriesWaterfallHook` 的特点是异步 + 串行 + 前一个回调的返回值会传入下一个回调，对应生成函数：

```js
(function anonymous(name, _callback) {
  "use strict";
  var _context;
  var _x = this._x;
  function _next1() {
    var _fn2 = _x[2];
    _fn2(name, function(_err2, _result2) {
      if (_err2) {
        _callback(_err2);
      } else {
        if (_result2 !== undefined) {
          name = _result2;
        }
        _callback(null, name);
      }
    });
  }
  function _next0() {
    var _fn1 = _x[1];
    _fn1(name, function(_err1, _result1) {
      if (_err1) {
        _callback(_err1);
      } else {
        if (_result1 !== undefined) {
          name = _result1;
        }
        _next1();
      }
    });
  }
  var _fn0 = _x[0];
  _fn0(name, function(_err0, _result0) {
    if (_err0) {
      _callback(_err0);
    } else {
      if (_result0 !== undefined) {
        name = _result0;
      }
      _next0();
    }
  });
});
```

核心逻辑：

- 生成函数将回调队列各个项封装为 `_next0/_next1` 函数，这些 `next` 函数内在逻辑高度相似；
- 按回调定义的顺序，逐次执行，上一个回调结束后，才调用下一个回调，例如生成代码中的第39行、27行。

相比于用递归、循环之类的手段实现 `AsyncSeriesWaterfallHook`，这段动态生成的函数逻辑确实会更清晰，更容易理解，这种场景下用动态编译，确实是一个不错的选择。

### 高级特性 Intercept

除了通常的 `tap/call` 之外，tapable 还提供了简易的中间件机制 —— `intercept` 接口，例如

```js
const sleep = new SyncHook();

sleep.intercept({
  name: "test",
  context: true,
  call() {
    console.log("before call");
  },
  loop(){
    console.log("before loop");
  },
  tap() {
    console.log("before each callback");
  },
  register() {
    console.log("every time call tap");
  },
});
```

`intercept` 支持注册如下类型的中间件：

|            | 签名                            | 解释                                       |
| ---------- | ------------------------------- | ------------------------------------------ |
| `call`     | `(...args) => void`             | 调用 `call/callAsync/promise` 时触发       |
| `tap`      | `(tap: Tap) => void`            | 调用 `call` 类函数后，每次调用回调之前触发 |
| `loop`     | `(...args) => void`             | 仅 `loop` 型的钩子有效，在循环开始之前触发 |
| `register` | `(tap: Tap) => Tap | undefined` | 调用 `tap/tapAsync/tapPromise` 时触发      |

其中 `register` 在每次调用 `tap` 时被调用；其他三种中间件的触发时机大致如下：

```js
  var _context;
  const callbacks = [fn1, fn2];
  var _interceptors = this.interceptors;
  // 调用 call 函数，立即触发
  _interceptors.forEach((intercept) => intercept.call(_context));
  var _loop;
  var cursor = 0;
  do {
    _loop = false;
    // 每次循环开始时触发 `loop`
    _interceptors.forEach((intercept) => intercept.loop(_context));
    // 触发 `tap`
    var _fn0 = callbacks[0];
    _interceptors.forEach((intercept) => intercept.tap(_context, _fn0));
    var _result0 = _fn0();
    if (_result0 !== undefined) {
      _loop = true;
    } else {
      var _fn1 = callbacks[1];
      // 再次触发 `tap`
      _interceptors.forEach((intercept) => intercept.tap(_context, _fn1));
      var _result1 = _fn1();
      if (_result1 !== undefined) {
        _loop = true;
      }
    }
  } while (_loop);
```

`intercept` 特性在 Webpack 内主要被用作进度提示，如 `Webpack/lib/ProgressPlugin.js` 插件中，分别对 `compiler.hooks.emit` 、`compiler.hooks.afterEmit` 钩子应用了记录进度的中间件函数。其他类型的插件应用较少。

### 高级特性 - HookMap

Tapable 还有一个值得注意的特性 —— `HookMap`，它提供了一种集合操作能力，能够降低创建与使用的复杂度，用法比较简单：

```js
const { SyncHook, HookMap } = require("tapable");

const sleep = new HookMap(() => new SyncHook());

// 通过 for 函数过滤集合中的特定钩子
sleep.for("statement").tap("test", () => {
  console.log("callback for statement");
});

// 触发 statement 类型的钩子
sleep.get("statement").call();
```

`HookMap` 能够用于实现的动态获取钩子功能，例如在 Webpack 的 `lib/parser.js` 文件中，`parser` 文件主要完成将资源内容解析为 AST 集合，之后遍历 AST 并以 `HookMap` 方式对外通知遍历到的内容。

例如，遇到表达式的时候触发 `Parser.hooks.expression` 钩子，问题是 AST 结构和内容都很复杂，如果所有情景都以独立的钩子实现，那代码量会急剧膨胀。这种场景就很适合用 `HookMap` 解决，以 `expression` 为例：

```js
class Parser {
  constructor() {
    this.hooks = {
      // 定义钩子
      // 这里用到 HookMap ，所以不需要提前遍历枚举所有 expression 场景
      expression: new HookMap(() => new SyncBailHook(["expression"])),
    };
  }

  //   不同场景下触发钩子
  walkMemberExpression(expression) {
    const exprName = this.getNameForExpression(expression);
    if (exprName && exprName.free) {
      // 触发特定类型的钩子
      const expressionHook = this.hooks.expression.get(exprName.name);
      if (expressionHook !== undefined) {
        const result = expressionHook.call(expression);
        if (result === true) return;
      }
    }
    // ...
  }

  walkThisExpression(expression) {
    const expressionHook = this.hooks.expression.get("this");
    if (expressionHook !== undefined) {
      expressionHook.call(expression);
    }
  }
}
```

上例代码第 15、25 行都通过 `this.hooks.expression.get(xxx)` 语句动态获取对应钩子实例，之后再调用 `call` 触发。HookMap 的消费逻辑与普通 Hook 类似，只需要增加 `for` 函数过滤出你实际监听的 Hook 实例即可，如：

```js
// 钩子消费逻辑
// 选取 CommonJsStuffPlugin 仅起示例作用
class CommonJsStuffPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "CommonJsStuffPlugin",
      (compilation, { normalModuleFactory }) => {
        const handler = (parser, parserOptions) => {
          // 通过 for 精确消费钩子
          parser.hooks.expression
            .for("require.main.require")
            .tap(
              "CommonJsStuffPlugin",
              ParserHelpers.expressionIsUnsupported(
                parser,
                "require.main.require is not supported by Webpack."
              )
            );
          parser.hooks.expression
            .for("module.parent.require")
            .tap(
              "CommonJsStuffPlugin",
              ParserHelpers.expressionIsUnsupported(
                parser,
                "module.parent.require is not supported by Webpack."
              )
            );
          parser.hooks.expression
            .for("require.main")
            .tap(
              "CommonJsStuffPlugin",
              ParserHelpers.toConstantDependencyWithWebpackRequire(
                parser,
                "__Webpack_require__.c[__Webpack_require__.s]"
              )
            );
          // ...
        };
      }
    );
  }
}
```

借助这种能力我们就不需要为每一种情况都单独创建 Hook，只需要在使用时动态创建、获取对应实例即可，能有效降低开发与维护成本。

## 小结

Webpack 的插件体系与平常所见的 `订阅/发布` 模式差别很大，是一种非常强耦合的设计，Hook 回调由 Webpack 决定何时，以何种方式执行；而在 Hook 回调内部可以通过调用上下文 API 、修改上下文状态等方式，对 Webpack 原定流程产生 Side Effect。

由此可见，编写插件时大部分工作都围绕 Hook 展开，因此我们需要理解构建过程中的不同环节会触发什么 Hook、对应传递什么上下文参数、如何与上下文参数对象交互等，而学习这些知识最高效的方式，我认为是阅读、分析各种开源插件源码。例如文章中提及的：

- 从 `imagemin-webpack-plugin` 学习：如何借助 `assets` 数组修改最终产物内容；
- 从 `eslint-webpack-plugin` 学习：如何提交错误信息；
- 从 `DefinePlugin` 学习：如何与 AST 结构交互。

为了应对构建场景下各种复杂需求，Webpack 内部使用了多种类型的 Hook，分别用于实现同步、异步、熔断、串行、并行的流程逻辑，开发插件时需要注意识别 Hook 类型，据此做出正确的调用与交互逻辑。
