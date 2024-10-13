# 模块依赖关系

如何从 Entry 开始逐步递归读入、解析模块内容，并最终构建出模块依赖关系图 —— ModuleGraph 对象。为什么需要先将依赖文件构建为 Dependency，之后再根据 Dependency 创建文件对应的 Module 对象？Dependency 对象到底有什么作用？

Dependency Graph 贯穿 Webpack 整个运行周期，从「**构建阶段**」的模块解析，到「**生成阶段**」的 Chunk 生成，以及 Tree-shaking 等功能都高度依赖于Dependency Graph ，是 Webpack 资源构建流程中一个非常核心的数据结构。

## Dependency Graph 是什么

回顾 Webpack 构建阶段的关键过程：

1. 首先根据 entry 配置信息创建若干 EntryDependency 对象
2. 调用 NormalModuleFactory ，根据 EntryDependency 对象的资源路径创建 Module 子类对象
3. 将 Module 代码解析为 AST 结构
4. 遍历 AST，找到所有模块导入语句（import/require）
5. 根据导入语句创建对应的 Dependency 子类对象
6. 递归执行步骤 2，直到所有项目文件都处理完毕。

这个过程从 entry 模块开始，逐步递归找出所有依赖文件，模块之间隐式形成了以 entry 为起点，以模块为节点，以导入导出依赖为边的有向图关系 - Dependency Graph 模块依赖关系图。

这个 Dependency Graph 是 Webpack 内部非常重要的过程信息之一，后续封装 Chunk、Code Splits、Tree-Shaking、Hot Module Replacement 等等，几乎所有功能都需要依赖这一信息实现。

Webpack5 之前，Dependency Graph 关系隐含在 Dependence、Module 对象的一系列属性中，例如：

- 通过 module.dependencies 数组记录模块依赖对象；
- 通过 dependency.module 记录依赖对应的模块对象引用；
- 通过 module.issuer 记录父模块引用。

这种设计存在很多问题，例如：模块之间的关系非常隐晦难懂；模块搜索算法与模块资源构建逻辑耦合在同一个 Class 实体内，Module 职责不单一且复杂度非常高；同一个 Module 对象无法在多个 Dependency Graph 之间共享，等等。为此，Webpack5 重构 了 Dependency Graph 的具体实现，将依赖关系从 Dependence/Module 类型中解耦出来，以一套独立的 Graph 数据结构记录模块间依赖关系，并基于 Map/Set 等原生模块实现更高效的模块搜索、校验、遍历算法。

## Dependency Graph 设计

Webpack 5.0 之后的 Dependency Graph 涉及如下数据类型：

- `ModuleGraph`：记录 Dependency Graph 信息的容器，记录构建过程中涉及到的所有 `module`、`dependency` 对象，以及这些对象互相之间的引用；
- `ModuleGraphConnection` ：记录模块间引用关系的数据结构，内部通过 `originModule` 属性记录引用关系中的父模块，通过 `module` 属性记录子模块；
- `ModuleGraphModule` ：`Module` 对象在 Dependency Graph 体系下的补充信息，包含模块对象的 `incomingConnections` —— 指向模块本身的 `ModuleGraphConnection` 集合，即谁引用了模块自身；`outgoingConnections` —— 该模块对外的依赖，即该模块引用了其他那些模块。

![dependency1](/blog/images/devops/dependency1.png)

这些类型之间关系的基本逻辑是：

- `Compilation` 类内部会维护一个全局唯一的 `ModuleGraph` 实例对象
- 每次解析出新模块后，将 Module、Dependency，以及模块之间的关系 —— `ModuleConnection` 记录到 `compilation.moduleGraph` 对象中
- `ModuleGraph` 除了记录依赖关系外，还提供了许多工具方法，方便使用者迅速读取出 `module` 或 `dependency` 附加的信息。`ModuleGraph` 内部有两个关键属性：
  - 通过 `_dependencyMap` 属性记录 `Dependency` 对象与 `ModuleGraphConnection` 连接对象之间的映射关系，后续的处理中可以基于这层映射迅速找到 `Dependency` 实例对应的引用与被引用者；
  - 通过 `_moduleMap` 属性记录 `Module` 与 `ModuleGraphModule` 之间的映射关系。

最终，通过 `ModuleGraph`、`ModuleGraphConnection`、`ModuleGraphModule` 三种类型的协作，在主体的 `Module`、`Dependency` 体系之外，记录模块之间的依赖信息。

依赖关系收集过程，主要发生在构建阶段的两个节点：

![dependency2](/blog/images/devops/dependency2.png)

- `addDependency` ：webpack 从模块内容中解析出引用关系后，创建适当的 `Dependency` 子类并调用该方法记录到 `module` 实例；
- `handleModuleCreation` ：模块解析完毕后，webpack 遍历父模块的依赖集合，调用该方法创建 `Dependency` 对应的子模块对象，之后调用 `moduleGraph.setResolvedModule` 方法将父子引用信息记录到 `moduleGraph` 对象上。moduleGraph.setResolvedModule 方法的逻辑大致为：

```js
class ModuleGraph {
    constructor() {
        /** @type {Map<Dependency, ModuleGraphConnection>} */
        this._dependencyMap = new Map();
        /** @type {Map<Module, ModuleGraphModule>} */
        this._moduleMap = new Map();
    }

    /**
     * @param {Module} originModule the referencing module
     * @param {Dependency} dependency the referencing dependency
     * @param {Module} module the referenced module
     * @returns {void}
     */
    setResolvedModule(originModule, dependency, module) {
        const connection = new ModuleGraphConnection(
            originModule,
            dependency,
            module,
            undefined,
            dependency.weak,
            dependency.getCondition(this)
        );
        this._dependencyMap.set(dependency, connection);
        const connections = this._getModuleGraphModule(module).incomingConnections;
        connections.add(connection);
        const mgm = this._getModuleGraphModule(originModule);
        if (mgm.outgoingConnections === undefined) {
            mgm.outgoingConnections = new Set();
        }
        mgm.outgoingConnections.add(connection);
    }
}
```

- 主要更改了 `_dependencyMap` 及 `moduleGraphModule` 的出入 `connections` 属性，以此收集当前模块的上下游依赖关系。

### 案例分析

案例：index.js 依赖 a.js 和 b.js，那么其构建过程中模块间依赖关系生成过程如下：

1. 首先创建 `index.js` 对应的 `EntryDependency` 对象；
2. 调用 `NormalModuleFactory` 创建 `EntryDependency` 对应的 `NormalModule` 实例；
3. 执行 `compilation.handleModuleCreation`，经过解析、遍历 AST 等操作，最终得到 `a.js`、`b.js` 两个新 Dependency 对象；
4. 调用 `NormalModuleFactory` 为这两个 Dependency 对象创建对应的 `NormalModule` 对象；
5. 调用 `moduleGraph.setResolvedModule` 记录 `entry` 模块与 `a/b` 模块的依赖关系。

最终生成如下数据结果：

```js
ModuleGraph: {
    _dependencyMap: Map(3){
        { 
            EntryDependency{request: "./src/index.js"} => ModuleGraphConnection{
                module: NormalModule{request: "./src/index.js"}, 
                // 入口模块没有引用者，故设置为 null
                originModule: null
            } 
        },
        { 
            HarmonyImportSideEffectDependency{request: "./src/a.js"} => ModuleGraphConnection{
                module: NormalModule{request: "./src/a.js"}, 
                originModule: NormalModule{request: "./src/index.js"}
            } 
        },
        { 
            HarmonyImportSideEffectDependency{request: "./src/a.js"} => ModuleGraphConnection{
                module: NormalModule{request: "./src/b.js"}, 
                originModule: NormalModule{request: "./src/index.js"}
            } 
        }
    },

    _moduleMap: Map(3){
        NormalModule{request: "./src/index.js"} => ModuleGraphModule{
            incomingConnections: Set(1) [
                // entry 模块，对应 originModule 为null
                ModuleGraphConnection{ module: NormalModule{request: "./src/index.js"}, originModule:null }
            ],
            outgoingConnections: Set(2) [
                // 从 index 指向 a 模块
                ModuleGraphConnection{ module: NormalModule{request: "./src/a.js"}, originModule: NormalModule{request: "./src/index.js"} },
                // 从 index 指向 b 模块
                ModuleGraphConnection{ module: NormalModule{request: "./src/b.js"}, originModule: NormalModule{request: "./src/index.js"} }
            ]
        },
        NormalModule{request: "./src/a.js"} => ModuleGraphModule{
            incomingConnections: Set(1) [
                ModuleGraphConnection{ module: NormalModule{request: "./src/a.js"}, originModule: NormalModule{request: "./src/index.js"} }
            ],
            // a 模块没有其他依赖，故 outgoingConnections 属性值为 undefined
            outgoingConnections: undefined
        },
        NormalModule{request: "./src/b.js"} => ModuleGraphModule{
            incomingConnections: Set(1) [
                ModuleGraphConnection{ module: NormalModule{request: "./src/b.js"}, originModule: NormalModule{request: "./src/index.js"} }
            ],
            // b 模块没有其他依赖，故 outgoingConnections 属性值为 undefined
            outgoingConnections: undefined
        }
    }
}
```

从上面的 Dependency Graph 可以看出，本质上 `ModuleGraph._moduleMap` 已经形成了一个有向无环图结构，其中字典 `_moduleMap` 的 key 为图的节点，对应 value `ModuleGraphModule` 结构中的 `outgoingConnections` 属性为图的边，则上例中从起点 `index.js` 出发沿 `outgoingConnections` 向前可遍历出图的所有顶点。

## Dependency Graph 作用

- 信息索引
- 辅助构建 ChunkGraph

信息索引是 ModuleGraph 最重要的功能，在 `ModuleGraph` 类型中提供了很多实现 `module` / `dependency` 信息查询的工具函数，例如：

- `getModule(dep: Dependency)` ：根据 `dep` 查找对应的 `module` 实例。
- `getOutgoingConnections(module)` ：查找 `module` 实例的所有依赖。
- `getIssuer(module: Module)` ：查找 `module` 在何处被引用。
- ...

Webpack5 内部的许多插件、Dependency 子类、Module 子类的实现都需要用到这些工具函数查找特定模块、依赖的信息，例如：

- `SplitChunksPlugin` 在优化 `chunks` 处理中，需要使用 `moduleGraph.getExportsInfo` 查询各个模块的 `exportsInfo` (模块导出的信息集合，与 tree-shaking 强相关)信息以确定如何分离 chunk。
- 在 `compilation.seal` 函数中，需要遍历 `entry` 对应的 dep 并调用 `moduleGraph.getModule` 获取完整的 `module` 定义。
- ...

此外，在 Webpack 完成模块构建，进入「**生成阶段**」之后，会按一系列规则将模块逐一分配到不同 Chunk 对象中，在 Webpack4 时，这个过程主要围绕 `Chunk` 及 `ChunkGroup` 两个类型展开。

而 5.0 之后，对 Chunk 之间的依赖关系管理也做了一次大型 [重构](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fblog%2F2020-10-10-webpack-5-release%2F%23module-and-chunk-graph)：首先根据默认规则为每一个 `entry` 创建对应 Chunk 对象 ，之后调用 `buildChunkGraph` 方法，遍历 `moduleGraph` 对象，找出入口模块对应的所有 `Module` 对象，并将依赖关系转化为 ChunkGraph 对象

## 小结

综上，Webpack 构建过程中会持续收集模块之间的引用、被引用关系，并记录到 Dependency Graph 结构中，后续的 Chunk 封装、Code Split、Tree-Shaking 等，但凡需要分析模块关系的功能都强依赖于 Dependency Graph。

可以说，Dependency Graph 是 Webpack 底层最关键的模块地图数据，因此在 Webpack5 之后，Dependency Graph 结构被解耦抽离为以 `ModuleGraph` 为中心的若干独立类型，架构逻辑更合理，模块搜索、分析效率也得到不同程度优化，进而使得 Webpack5 构建速度也有明显提升。
