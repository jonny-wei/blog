# 构建流程与原理

- 理解 Webpack 的作用
- 理解 Webpack 的构建流程（3大阶段）
- 理解构建流程过程中资源形态的转变
- 理解 Dependency、Module、Chunk 及其之间的关系
- 理解 Compiler 和 Compilation 的区别

Webpack 的核心能力就是**静态模块打包能力**。Webpack 能够将各种类型的资源 —— 包括图片、音视频、CSS、JavaScript 代码等，通通转译、组合、拼接、生成标准的、能够在不同版本浏览器兼容执行的 JavaScript 代码文件，这一特性能够轻易抹平开发 Web 应用时处理不同资源的逻辑差异，使得开发者以一致的心智模型开发、消费这些不同的资源文件。

## 构建流程

Webpack 底层的工作流程大致可以总结为这么几个阶段：

1. 初始化阶段：

   - **初始化参数**：从配置文件、 配置对象、Shell 参数中读取，与默认配置结合得出最终的参数；
   - **创建编译器对象 Compiler**：用上一步得到的参数创建 Compiler 对象, 其中存储了配置信息，挂载了许多生命周期 hook。
   - **初始化编译环境**：包括注入内置插件、注册各种模块工厂、初始化 RuleSet 集合、加载配置的插件等；
   - **开始编译**：执行 compiler 对象的 run 方法，创建 Compilation 对象，调用 `compiler.compile` 方法开始执行构建。
   - **确定入口**：根据配置中的 entry 找出所有的入口文件，调用 compilation.addEntry 将入口文件转换为 dependence 对象。把入口文件的绝对路径添加到依赖数组，记录此次编译依赖的模块。

2. 构建阶段：

   - **编译模块(make)**：从 entry 文件开始，调用 loader 将模块转译为标准 JS 内容，调用 JS 解析器 [Acorn](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Facornjs%2Facorn) 将内容转换为 AST 对象，从中找出该模块依赖的模块，再 **递归** 处理这些依赖模块，直到所有入口依赖的文件都经过了本步骤的处理；
   - **完成模块编译**：上一步递归处理所有能触达到的模块后，得到了每个模块被翻译后的内容以及它们之间的依赖关系图 - `ModuleGraph`。构建阶段经历了 `module => ast => dependences => module` 的流转，先将源码解析为 AST 结构，再在 AST 中遍历 import 等模块导入语句，收集模块依赖数组 —— `dependences`，最后遍历 dependences 数组将 `Dependency` 转换为 `Module` 对象，之后递归处理这些新的 Module，直到所有项目文件处理完毕。

3. 封装阶段：

   - **合并(seal)**：根据入口和模块之间的依赖关系，模块转译，收集运行时依赖（其实在上一阶段就已经进行了，基于静态代码分析的方式收集运行时依赖），将模块代码与运行时代码合并，组装成一个个包含多个模块的 Chunk；
   - **优化(optimization)**：对上述 Chunk 施加一系列优化操作，包括：tree-shaking、terser、scope-hoisting、压缩、Code Split 等；
   - **写入文件系统(emitAssets)**：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统，生成 Bundle IIFE。

三个阶段环环相扣，「**初始化**」的重点是根据用户配置设置好构建环境；「**构建阶段**」则重在解读文件输入与文件依赖关系；最后在「**生成阶段**」按规则组织、包装模块，并翻译为适合能够直接运行的产物包。三者结合，实现 Webpack 最核心的打包能力，其它功能特性也几乎都是在此基础上，通过 Hook 介入、修改不同阶段的对象状态、流程逻辑等方式实现。

![核心流程](/blog/images/devops/building1.png)

- 初始化，主要是根据配置信息设置内置的各类插件。
- Make - 构建阶段，从 entry 模块开始，执行：
  - 读入文件内容；
  - 调用 Loader 转译文件内容；
  - 调用 [acorn](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Facorn) 生成 AST 结构；
  - 分析 AST，确定模块依赖列表；
  - 遍历模块依赖列表，对每一个依赖模块重新执行上述流程，直到生成完整的模块依赖图 —— ModuleGraph 对象。

- Seal - 生成阶段，过程：
  - 遍历模块依赖图，对每一个模块执行：
    - 代码转译，如 import 转换为 require 调用
    - 分析运行时依赖
  - 合并模块代码与运行时代码，生成 chunk；
  - 执行产物优化操作，如 Tree-shaking；
  - 将最终结果写出到产物文件。

但其构建过程可能造成的性能问题：**文件层次深度**、 **Loader 的数量与复杂度、代码复杂度导致的AST计算复杂度、模块数量导致的依赖递归处理复杂度、分包算法导致的计算复杂度、产物代码量及产物优化复杂度。** 针对其构建过程的性能优化详见后文及相关章节。

### 初始化阶段

初始化阶段主要完成三个功能：修整 & 校验配置对象、运行插件、调用 `compiler.compile` 方法开始执行构建操作：

![building2](/blog/images/devops/building2.png)

首先，校验用户参数，并合并默认配置对象：

1. 启动时，首先将 process.args 参数与 webpack.config.js 文件合并成用户配置；
2. 调用 [validateSchema](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FvalidateSchema.js%23L77-L78) 校验配置对象（validateSchema 底层依赖于 [schema-utils](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fschema-utils) 库）；
3. 调用 [getNormalizedWebpackOptions](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2Fconfig%2Fnormalization.js%23L116-L117) + [applyWebpackOptionsBaseDefaults](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2Fconfig%2Fdefaults.js%23L120-L121) 合并出最终配置。

之后，创建 Compiler 对象并开始启动插件：

1. 调用 [createCompiler](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2Fwebpack.js%23L61-L62) 函数创建 compiler 对象。
2. [遍历](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2Fwebpack.js%23L68-L69) 配置中的 plugins 集合，执行插件的 apply 方法。
3. [调用](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2Fwebpack.js%23L80-L81) new WebpackOptionsApply().process 方法，根据配置内容动态注入相应插件，包括：
   - 调用 [EntryOptionPlugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FEntryOptionPlugin.js) 插件，该插件根据 entry 值注入 DynamicEntryPlugin 或 EntryPlugin 插件；
   - 根据 devtool 值注入 Sourcemap 插件，包括：SourceMapDevToolPlugin、EvalSourceMapDevToolPlugin 、EvalDevToolModulePlugin；
   - 注入 RuntimePlugin ，用于根据代码内容动态注入 webpack 运行时。

最后，调用 `compiler.compile` 方法开始执行构建。调用 compile 函数触发 make 钩子后，初始化阶段就算是结束了，流程逻辑开始进入「**构建阶段**」。

```js
// webpack/lib/compiler.js 
compile(callback) {
    const params = this.newCompilationParams();
    this.hooks.beforeCompile.callAsync(params, err => {
      // ...
      const compilation = this.newCompilation(params);
      this.hooks.make.callAsync(compilation, err => {
        // ...
        this.hooks.finishMake.callAsync(compilation, err => {
          // ...
          process.nextTick(() => {
            compilation.finish(err => {
              // ...
              compilation.seal(err => {
                // ...
                this.hooks.afterCompile.callAsync(compilation, err => {
                    if (err) return callback(err);
                    return callback(null, compilation);
                });
              });
            });
          });
        });
      });
    });
  }
```

虽然 [compile](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompiler.js%23L1159-L1160) 方法并没有任何实质的功能逻辑，但它搭建起了后续构建流程框架：

1. 调用 newCompilation 方法创建 compilation 对象；
2. 触发 make 钩子，紧接着 [EntryPlugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FEntryPlugin.js%23L47-L49) 在这个钩子中调用 compilation 对象的 addEntry 方法创建入口模块，主流程开始进入「**构建阶段**」；
3. make 执行完毕后，触发 finishMake 钩子；
4. 执行 compilation.seal 函数，进入「**生成阶段**」，开始封装 Chunk，生成产物；
5. seal 函数结束后，触发 afterCompile 钩子，开始执行收尾逻辑。

调用 compile 函数触发 make 钩子后，初始化阶段就算是结束了，流程逻辑开始进入「构建阶段」。

### 构建阶段

「**构建阶段**」从 entry 模块开始递归解析模块内容、找出模块依赖，按图索骥逐步构建出项目整体 module 集合以及 module 之间的 [依赖关系图](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fconcepts%2Fdependency-graph%2F)，这个阶段的**主要作用就是读入并理解所有原始代码**。

实现上，在上述「**初始化阶段**」的最后，`compiler.compile` 函数会触发 `compiler.hook.make` 钩子，EntryPlugin 监听该钩子并开始调用 compilation.addEntry 添加入口：

```js
class EntryPlugin {
    apply(compiler) {
        const { entry, options, context } = this;
        // 创建入口 Dependency 对象
        const dep = EntryPlugin.createDependency(entry, options);

        compiler.hooks.make.tapAsync("EntryPlugin", (compilation, callback) => {
            compilation.addEntry(context, dep, options, err => {
                callback(err);
            });
        });
    }
}
```

addEntry 之后的执行逻辑：

![building3](/blog/images/devops/building3.png)

1. 调用 [handleModuleCreation](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L1476-L1477)，根据文件类型构建 module 子类 —— 一般是 [NormalModule](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FNormalModule.js)
2. 调用 [loader-runner](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Floader-runner) 转译 module 内容，将各类资源类型转译为 Webpack 能够理解的标准 JavaScript 文本
3. 调用 [acorn](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Facorn) 将 JavaScript 代码解析为 AST 结构
4. 在 [JavaScriptParser](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2Fjavascript%2FJavascriptParser.js) 类中遍历 AST，触发各种钩子，其中最关键的：
   - 遇到 import/require 语句时，触发 [exportImportSpecifier](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2Fjavascript%2FJavascriptParser.js%23L1983-L1984) 钩子；
   - [HarmonyExportDependencyParserPlugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2Fdependencies%2FHarmonyExportDependencyParserPlugin.js%23L153-L154) 监听该钩子，将依赖资源添加为 Dependency 对象
   - 调用 module 对象的 addDependency， 将 Dependency 对象转换为 Module 对象并添加到依赖数组中
5. AST 遍历完毕后，调用 module.handleParseResult 处理模块依赖数组
6. 对于 module 新增的依赖，调用 handleModuleCreate，控制流回到第一步
7. 所有依赖都解析完毕后，构建阶段结束。

过程中模块源码经历了 `module => ast => dependences => module` 的流转，先将源码解析为 AST 结构，再在 AST 中遍历 import 等模块导入语句，收集模块依赖数组 —— dependences，最后遍历 dependences 数组将 Dependency 转换为 Module 对象，之后递归处理这些新的 Module，直到所有项目文件处理完毕。

### 生成阶段

「构建阶段」负责读入与分析源代码文件，将之一一转化为 [Module](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FModule.js)、[Dependency](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FDependency.js) 对象，解决的是资源“输入”问题；而「生成阶段」则负责根据一系列内置规则，将上一步构建出的所有 Module 对象拆分编排进若干 Chunk 对象中，之后以 Chunk 粒度将源码转译为适合在目标环境运行的产物形态，并写出为产物文件，解决的是资源“输出”问题。

「生成阶段」发生在 make 阶段执行完毕，compiler.compile 调用 compilation.seal 函数时:

```js
// webpack/lib/compiler.js 
compile(callback) {
    // ...
    const compilation = this.newCompilation(params);
    this.hooks.make.callAsync(compilation, err => {
        // ...
        compilation.seal(err => {/* */});
    });
}
```

也就是说，compilation.seal 函数是「生成阶段」的入口函数 - 将模块装进 Chunk。

![building4](/blog/images/devops/building4.png)

1. 创建本次构建的 [ChunkGraph](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FChunkGraph.js) 对象。
2. [遍历](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2815-L2816) 入口集合 compilation.entries：
   - 调用 addChunk 方法为每一个入口 [创建](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2817-L2818) 对应的 Chunk 对象（EntryPoint Chunk）
   - [遍历](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2832-L2833) 该入口对应的 Dependency 集合，[找到](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2835-L2836) 相应 Module 对象并 [关联](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2837-L2838) 到该 Chunk。
3. 到这里可以得到若干 Chunk，之后调用 [buildChunkGraph](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FbuildChunkGraph.js%23L1347-L1348) 方法将这些 Chunk 处理成 Graph 结构，方便后续处理。
4. 之后，触发 optimizeModules/optimizeChunks 等钩子，由插件（如 [SplitChunksPlugin](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fplugins%2Fsplit-chunks-plugin%2F)）进一步修剪、优化 Chunk 结构。
5. 一直到最后一个 Optimize 钩子 optimizeChunkModules 执行完毕后，开始调用 [compilation.codeGeneration](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L3160-L3161) 方法生成 Chunk 代码，在 codeGeneration 方法内部：
    - 遍历每一个 Chunk 的 Module 对象，调用 [_codeGenerationModule](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L3297-L3298)
    - _codeGenerationModule 又会继续往下调用 [module.codeGeneration](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FModule.js%23L876-L877) 生成单个 Module 的代码，这里注意不同 Module 子类有不同 codeGeneration 实现，对应不同产物代码效果。
6. 所有 Module 都执行完 codeGeneration，生成模块资产代码后，开始调用 [createChunkAssets](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L4520-L4521) 函数，为每一个 Chunk 生成资产文件。
7. 调用 [compilation.emitAssets](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L4638-L4639) 函数“**提交**”资产文件，注意这里还只是记录资产文件信息，还未写出磁盘文件。
8. 上述所有操作正常完成后，触发 callback 回调，控制流回到 compiler 函数。
9. 最后，[调用](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompiler.js%23L466-L467) compiler 对象的 [emitAssets](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompiler.js%23L592-L593) 方法，输出资产文件。

seal 过程中会不断调用 `compilation.emitAssets` 提交资产记录，而直到 seal 结束后则调用 `compiler.emitAssets` 函数，函数内部调用 `compiler.outputFileSystem.writeFile` 方法将 assets 集合写入文件系统，Webpack 完成从源码到资产文件的转换，构建工作至此结束。

::: tip seal
seal 很复杂，重点在于将 Module 按入口组织成多个 Chunk 对象，之后暴露 optimizeXXX 钩子，交由插件根据不同需求对 Chunk 做进一步修剪、整形、优化，最后按 Chunk 为单位做好代码合并与转换，输出为资产文件。optimizeXXX 钩子常被用于优化最终产物代码，例如 SplitChunksPlugin 就可以在这里分析 Chunk、Module 关系，将使用率较高的 Module 封装进新的 Chunk，实现 Common Chunk 效果。
:::

## 资源形态流转

![building5](/blog/images/devops/building5.png)

- compiler.make 阶段：

  - entry 文件以 dependence 对象形式加入 compilation 的依赖列表，**dependence 对象记录了 entry 的类型、路径等信息**；
  - 根据 dependence 调用对应的工厂函数创建 module 对象，之后读入 module 对应的文件内容，调用 loader-runner 对内容做转化，转化结果若有其它依赖则继续读入依赖资源，重复此过程直到**所有依赖均被转化为 module**。

- compilation.seal 阶段：

  - 遍历 module 集合，根据 entry 配置及引入资源的方式，将 module 分配到不同的 Chunk；
  - Chunk 之间最终形成 ChunkGraph 结构；
  - 遍历 ChunkGraph，调用 compilation.emitAsset 方法标记 chunk 的输出规则，即转化为 assets 集合。

- compiler.emitAssets 阶段：

  - 将 assets 写入文件系统

这个过程用到很多 Webpack 基础对象，包括：

- `Entry`：编译入口；
- `Compiler`：编译管理器，Webpack 启动后会创建 `compiler` 对象，该对象一直存活直到构建结束进程退出。Compiler 暴露许多钩子，插件根据不同的生命周期，在不同的 hook 中处理不同的事情。
- `Compilation`：单次构建过程的管理器，比如 `watch = true` 时，运行过程中只有一个 `compiler`，但每次文件变更触发重新编译时，都会创建一个新的 `compilation` 对象。Compilation 负责构建编译模块并生成 chunk，并利用插件进行优化。
- `Dependence`：依赖对象，记录模块间依赖关系；dependence 对象记录了 entry 的类型、路径等信息。
- `Module`：Webpack 内部所有资源都会以 Module 对象形式存在，所有关于资源的操作、转译、合并都是以 Module 为单位进行的；
- `Chunk`：编译完成准备输出时，将 Module 按特定的规则组织成一个一个的 Chunk。Chunk 是一个或多个 Module 的集合。Chunk 又分为 Entry Chunk（入口文件作为单独的 chunk）、Async Chunk（异步模块作为单独 chunk）、Runtime Chunk（收集的运行时作为单独的 chunk）
