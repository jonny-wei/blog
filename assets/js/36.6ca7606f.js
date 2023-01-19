(window.webpackJsonp=window.webpackJsonp||[]).push([[36],{487:function(n,t,s){"use strict";s.r(t);var a=s(15),e=Object(a.a)({},(function(){var n=this,t=n.$createElement,s=n._self._c||t;return s("ContentSlotsDistributor",{attrs:{"slot-key":n.$parent.slotKey}},[s("h1",{attrs:{id:"构建后产物"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#构建后产物"}},[n._v("#")]),n._v(" 构建后产物")]),n._v(" "),s("p",[n._v("ChunkGraph 依赖关系对象的主流程")]),n._v(" "),s("p",[n._v("在上一篇中，已经详细讲解了「构建」阶段如何从 Entry 开始逐步递归读入、解析模块内容，并最终构建出模块依赖关系图 —— ModuleGraph 对象。本文我们继续往下，讲解在接下来的「封装」阶段，如何根据 ModuleGraph 内容组织 Chunk，并进一步构建出 ChunkGroup、ChunkGraph 依赖关系对象的主流程。")]),n._v(" "),s("h2",{attrs:{id:"chunkgraph-构建过程"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#chunkgraph-构建过程"}},[n._v("#")]),n._v(" ChunkGraph 构建过程")]),n._v(" "),s("p",[n._v("在前文介绍了 Webpack 的构建流程，Webpack 底层构建逻辑大体上可以划分为：「"),s("strong",[n._v("初始化、构建、封装")]),n._v("」三个阶段：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk1.png",alt:"chunk1"}})]),n._v(" "),s("p",[n._v("其中，「"),s("strong",[n._v("构建")]),n._v("」阶段负责分析模块间的依赖关系，建立起模块之间的依赖关系图（ModuleGraph）。紧接着，在「"),s("strong",[n._v("封装")]),n._v("」阶段根据依赖关系图，将模块分开封装进若干 Chunk 对象中，并将 Chunk 之间的父子依赖关系梳理成 ChunkGraph 与若干 ChunkGroup 对象。")]),n._v(" "),s("p",[n._v("「封装」阶段最重要的目标就是根据「构建」阶段收集到的 ModuleGraph 关系图构建 ChunkGraph 关系图，这个过程的逻辑比较复杂：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk2.png",alt:"chunk2"}})]),n._v(" "),s("p",[n._v("下面简单分析其几个关键步骤：")]),n._v(" "),s("p",[s("strong",[n._v("第一步：")]),n._v(" 调用 "),s("code",[n._v("seal()")]),n._v(" 函数后，遍历 "),s("code",[n._v("entry")]),n._v(" 配置，为每个入口创建一个空的 "),s("code",[n._v("Chunk")]),n._v(" 与 "),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FEntrypoint.js",target:"_blank",rel:"noopener noreferrer"}},[n._v("EntryPoint"),s("OutboundLink")],1),n._v(" 对象（一种特殊的 "),s("code",[n._v("ChunkGroup")]),n._v("），并初步设置好基本的 "),s("code",[n._v("ChunkGraph")]),n._v(" 结构关系，为下一步骤做好准备，关键代码：")]),n._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("class")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[n._v("Compilation")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v("\n  "),s("span",{pre:!0,attrs:{class:"token function"}},[n._v("seal")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[n._v("callback")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// ...")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("const")]),n._v(" chunkGraphInit "),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v("=")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("new")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[n._v("Map")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 遍历入口模块列表")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("for")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("const")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("[")]),n._v("name"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v(" dependencies"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" includeDependencies"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" options "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("]")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("of")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("this")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),n._v("entries"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 为每一个 entry 创建对应的 Chunk 对象")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("const")]),n._v(" chunk "),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v("=")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[n._v("addChunk")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),n._v("name"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 为每一个 entry 创建对应的 ChunkGroup 对象")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("const")]),n._v(" entrypoint "),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v("=")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("new")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[n._v("Entrypoint")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),n._v("options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 关联 Chunk 与 ChunkGroup")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token function"}},[n._v("connectChunkGroupAndChunk")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),n._v("entrypoint"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" chunk"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n\n      "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 遍历 entry Dependency 列表")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("for")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("const")]),n._v(" dep "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("of")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("[")]),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v("...")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),n._v("globalEntry"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),n._v("dependencies"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v("...")]),n._v("dependencies"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v("\n        "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 为每一个 EntryPoint 关联入口依赖对象，以便下一步从入口依赖开始遍历其它模块")]),n._v("\n        entrypoint"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[n._v("addOrigin")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("null")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v(" name "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("/** @type {any} */")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),n._v("dep"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),n._v("request"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("const")]),n._v(" module "),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v("=")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),n._v("moduleGraph"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[n._v("getModule")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),n._v("dep"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("if")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),n._v("module"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v("\n          "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 在 ChunkGraph 中记录入口模块与 Chunk 关系")]),n._v("\n          chunkGraph"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[n._v("connectChunkAndEntryModule")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),n._v("chunk"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" module"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" entrypoint"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n          "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// ...")]),n._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),n._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 调用 buildChunkGraph 方法，开始构建 ChunkGraph")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[n._v("buildChunkGraph")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" chunkGraphInit"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// 触发各种优化钩子")]),n._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// ...")]),n._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),n._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),n._v("\n")])]),n._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[n._v("1")]),s("br"),s("span",{staticClass:"line-number"},[n._v("2")]),s("br"),s("span",{staticClass:"line-number"},[n._v("3")]),s("br"),s("span",{staticClass:"line-number"},[n._v("4")]),s("br"),s("span",{staticClass:"line-number"},[n._v("5")]),s("br"),s("span",{staticClass:"line-number"},[n._v("6")]),s("br"),s("span",{staticClass:"line-number"},[n._v("7")]),s("br"),s("span",{staticClass:"line-number"},[n._v("8")]),s("br"),s("span",{staticClass:"line-number"},[n._v("9")]),s("br"),s("span",{staticClass:"line-number"},[n._v("10")]),s("br"),s("span",{staticClass:"line-number"},[n._v("11")]),s("br"),s("span",{staticClass:"line-number"},[n._v("12")]),s("br"),s("span",{staticClass:"line-number"},[n._v("13")]),s("br"),s("span",{staticClass:"line-number"},[n._v("14")]),s("br"),s("span",{staticClass:"line-number"},[n._v("15")]),s("br"),s("span",{staticClass:"line-number"},[n._v("16")]),s("br"),s("span",{staticClass:"line-number"},[n._v("17")]),s("br"),s("span",{staticClass:"line-number"},[n._v("18")]),s("br"),s("span",{staticClass:"line-number"},[n._v("19")]),s("br"),s("span",{staticClass:"line-number"},[n._v("20")]),s("br"),s("span",{staticClass:"line-number"},[n._v("21")]),s("br"),s("span",{staticClass:"line-number"},[n._v("22")]),s("br"),s("span",{staticClass:"line-number"},[n._v("23")]),s("br"),s("span",{staticClass:"line-number"},[n._v("24")]),s("br"),s("span",{staticClass:"line-number"},[n._v("25")]),s("br"),s("span",{staticClass:"line-number"},[n._v("26")]),s("br"),s("span",{staticClass:"line-number"},[n._v("27")]),s("br"),s("span",{staticClass:"line-number"},[n._v("28")]),s("br"),s("span",{staticClass:"line-number"},[n._v("29")]),s("br"),s("span",{staticClass:"line-number"},[n._v("30")]),s("br"),s("span",{staticClass:"line-number"},[n._v("31")]),s("br"),s("span",{staticClass:"line-number"},[n._v("32")]),s("br"),s("span",{staticClass:"line-number"},[n._v("33")]),s("br")])]),s("p",[n._v("执行完成后，形成如下数据结构：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk3.png",alt:"chunk3"}})]),n._v(" "),s("p",[n._v("其次，若此时配置了 "),s("code",[n._v("entry.runtime")]),n._v("，Webpack 还会在这个阶段为运行时代码 "),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2933-L2934",target:"_blank",rel:"noopener noreferrer"}},[n._v("创建"),s("OutboundLink")],1),n._v(" 相应的 Chunk 并直接 "),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2937-L2938",target:"_blank",rel:"noopener noreferrer"}},[n._v("分配"),s("OutboundLink")],1),n._v(" 给 "),s("code",[n._v("entry")]),n._v(" 对应的 "),s("code",[n._v("ChunkGroup")]),n._v("对象。一切准备就绪后调用 "),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FbuildChunkGraph.js%23L1347-L1348",target:"_blank",rel:"noopener noreferrer"}},[n._v("buildChunkGraph"),s("OutboundLink")],1),n._v(" 函数，进入下一步骤。")]),n._v(" "),s("p",[s("strong",[n._v("第二步：")]),n._v(" 在 "),s("code",[n._v("buildChunkGraph")]),n._v(" 函数内 "),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FbuildChunkGraph.js%23L1367-L1368",target:"_blank",rel:"noopener noreferrer"}},[n._v("调用"),s("OutboundLink")],1),n._v(" "),s("code",[n._v("visitModules")]),n._v(" 函数，遍历 ModuleGraph，将所有 Module 按照依赖关系分配给不同 "),s("code",[n._v("Chunk")]),n._v(" 对象；这个过程中若遇到 "),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fblog%2F2020-10-10-webpack-5-release%2F%23async-modules",target:"_blank",rel:"noopener noreferrer"}},[n._v("异步模块"),s("OutboundLink")],1),n._v("，则为该模块 "),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FbuildChunkGraph.js%23L740-L742",target:"_blank",rel:"noopener noreferrer"}},[n._v("创建"),s("OutboundLink")],1),n._v("新的 "),s("code",[n._v("ChunkGroup")]),n._v(" 与 "),s("code",[n._v("Chunk")]),n._v(" 对象，最终形成如下数据结构：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk4.png",alt:"chunk4"}})]),n._v(" "),s("p",[s("strong",[n._v("第三步：")]),n._v(" 在 "),s("code",[n._v("buildChunkGraph")]),n._v(" 函数中"),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FbuildChunkGraph.js%23L1381-L1382",target:"_blank",rel:"noopener noreferrer"}},[n._v("调用"),s("OutboundLink")],1),n._v(" "),s("code",[n._v("connectChunkGroups")]),n._v(" 方法，建立 "),s("code",[n._v("ChunkGroup")]),n._v(" 之间、"),s("code",[n._v("Chunk")]),n._v(" 之间的依赖关系，生成完整的 "),s("code",[n._v("ChunkGraph")]),n._v(" 对象，最终形成如下数据结构：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk5.png",alt:"chunk5"}})]),n._v(" "),s("p",[s("strong",[n._v("第四步：")]),n._v(" 在 "),s("code",[n._v("buildChunkGraph")]),n._v(" 函数中"),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FbuildChunkGraph.js%23L1397-L1398",target:"_blank",rel:"noopener noreferrer"}},[n._v("调用"),s("OutboundLink")],1),n._v(" "),s("code",[n._v("cleanupUnconnectedGroups")]),n._v(" 方法，清理无效 "),s("code",[n._v("ChunkGroup")]),n._v("，主要起到性能优化作用。")]),n._v(" "),s("p",[n._v("自上而下经过这四个步骤后，"),s("code",[n._v("ModuleGraph")]),n._v(" 中存储的模块将根据模块本身的性质，被分配到 Entry、Async、Runtime 三种不同的 Chunk 对象，并将 Chunk 之间的依赖关系存储到 ChunkGraph 与 ChunkGroup 集合中，后续可在这些对象基础上继续修改分包策略（例如 "),s("code",[n._v("SplitChunksPlugin")]),n._v("），通过重新组织、分配 Module 与 Chunk 对象的归属实现分包优化。")]),n._v(" "),s("h2",{attrs:{id:"三种产物区别"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#三种产物区别"}},[n._v("#")]),n._v(" 三种产物区别")]),n._v(" "),s("p",[n._v("上述构建过程涉及 Chunk、ChunkGroup、ChunkGraph 三种关键对象")]),n._v(" "),s("ul",[s("li",[s("code",[n._v("Chunk")]),n._v("：Module 用于读入模块内容，记录模块间依赖等；而 Chunk 则根据模块依赖关系合并多个 Module，输出成资产文件。")])]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk6.png",alt:"chunk6"}})]),n._v(" "),s("ul",[s("li",[s("code",[n._v("ChunkGroup")]),n._v("：一个 "),s("code",[n._v("ChunkGroup")]),n._v(" 内包含一个或多个 "),s("code",[n._v("Chunk")]),n._v(" 对象；"),s("code",[n._v("ChunkGroup")]),n._v(" 与 "),s("code",[n._v("ChunkGroup")]),n._v(" 之间形成父子依赖关系：")])]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk7.png",alt:"chunk7"}})]),n._v(" "),s("ul",[s("li",[s("code",[n._v("ChunkGraph")]),n._v("：最后，Webpack 会将 Chunk 之间、ChunkGroup 之间的依赖关系存储到 "),s("code",[n._v("compilation.chunkGraph")]),n._v(" 对象中，形成如下类型关系：")])]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk8.png",alt:"chunk8"}})]),n._v(" "),s("h2",{attrs:{id:"默认分包策略"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#默认分包策略"}},[n._v("#")]),n._v(" 默认分包策略")]),n._v(" "),s("p",[n._v("综合上述 ChunkGraph 构建流程最终会将 Module 组织成三种不同类型的 Chunk：")]),n._v(" "),s("ul",[s("li",[n._v("Entry Chunk：同一个 entry 下触达到的模块组织成一个 Chunk；")]),n._v(" "),s("li",[n._v("Async Chunk：异步模块单独组织为一个 Chunk；")]),n._v(" "),s("li",[n._v("Runtime Chunk：entry.runtime 不为空时，会将运行时模块单独组织成一个 Chunk。")])]),n._v(" "),s("p",[n._v("这是 Webpack 内置的，在不使用 splitChunks 或其它插件的情况下，模块输入映射到输出的默认规则，是 Webpack 底层关键原理之一，因此有必要展开介绍每一种 Chunk 的具体规则。")]),n._v(" "),s("h3",{attrs:{id:"entry-chunk"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#entry-chunk"}},[n._v("#")]),n._v(" Entry Chunk")]),n._v(" "),s("p",[n._v("先从 Entry Chunk 开始，Webpack 首先会为每一个 "),s("code",[n._v("entry")]),n._v(" 创建 "),s("code",[n._v("Chunk")]),n._v(" 对象。初始化完毕后，Webpack 会根据 "),s("code",[n._v("ModuleGraph")]),n._v(" 的依赖关系数据，将 "),s("code",[n._v("entry")]),n._v(" 下所触及的所有 Module 塞入 Chunk （发生在 "),s("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FbuildChunkGraph.js%23L187-L188",target:"_blank",rel:"noopener noreferrer"}},[n._v("visitModules"),s("OutboundLink")],1),n._v(" 方法）。例如，"),s("code",[n._v("main.js")]),n._v(" 以同步方式直接或间接引用了 a/b/c/d 四个文件，Webpack 会首先为 "),s("code",[n._v("main.js")]),n._v(" 模块创建 Chunk 与 EntryPoint 对象，之后将 a/b/c/d 模块逐步添加到 "),s("code",[n._v("chunk[main]")]),n._v(" 中。")]),n._v(" "),s("h3",{attrs:{id:"async-chunk"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#async-chunk"}},[n._v("#")]),n._v(" Async Chunk")]),n._v(" "),s("p",[n._v("其次，Webpack 会将每一个异步导入语句（"),s("code",[n._v("import(xxx)")]),n._v(" 及 "),s("code",[n._v("require.ensure")]),n._v("）处理为一个单独的 Chunk 对象，并将其子模块都加入这个 Chunk 中 —— 我们称之为 Async Chunk。")]),n._v(" "),s("p",[n._v("例如：")]),n._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// index.js")]),n._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("import")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[n._v("'./sync-a.js'")]),n._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("import")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[n._v("'./sync-b.js'")]),n._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("import")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[n._v("'./async-a.js'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(")")]),n._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[n._v("// async-a.js")]),n._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("import")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[n._v("'./sync-c.js'")]),n._v("\n")])]),n._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[n._v("1")]),s("br"),s("span",{staticClass:"line-number"},[n._v("2")]),s("br"),s("span",{staticClass:"line-number"},[n._v("3")]),s("br"),s("span",{staticClass:"line-number"},[n._v("4")]),s("br"),s("span",{staticClass:"line-number"},[n._v("5")]),s("br"),s("span",{staticClass:"line-number"},[n._v("6")]),s("br"),s("span",{staticClass:"line-number"},[n._v("7")]),s("br"),s("span",{staticClass:"line-number"},[n._v("8")]),s("br")])]),s("p",[n._v("在入口模块 index.js 中，以同步方式引入 sync-a、sync-b；以异步方式引入 async-a 模块；同时，在 async-a 中以同步方式引入 sync-c 模块，形成如下模块依赖关系图：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk9.png",alt:"chunk9"}})]),n._v(" "),s("p",[n._v("此时，Webpack 会为入口 index.js、异步模块 async-a.js 分别创建分包，形成如下 Chunk 结构：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk10.png",alt:"chunk10"}})]),n._v(" "),s("p",[n._v("并且 "),s("code",[n._v("chunk[index]")]),n._v(" 与 "),s("code",[n._v("chunk[async-a]")]),n._v(" 之间形成了单向依赖关系，Webpack 会将这种依赖关系保存在 "),s("code",[n._v("ChunkGroup._parents")]),n._v(" 、"),s("code",[n._v("ChunkGroup._children")]),n._v(" 属性中。")]),n._v(" "),s("h3",{attrs:{id:"runtime-chunk"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#runtime-chunk"}},[n._v("#")]),n._v(" Runtime Chunk")]),n._v(" "),s("p",[n._v("除了 entry、异步模块外，Webpack5 还支持将 Runtime 代码单独抽取为 Chunk。这里说的 Runtime 代码是指一些为了确保打包产物能正常运行，而由 Webpack 注入的一系列基础框架代码")]),n._v(" "),s("p",[n._v("Webpack 动态生成的运行时代码，编译时，Webpack 会根据业务代码，决定输出哪些支撑特性的运行时代码（基于 "),s("code",[n._v("Dependency")]),n._v(" 子类），例如：")]),n._v(" "),s("ul",[s("li",[n._v("需要 "),s("code",[n._v("__webpack_require__.f")]),n._v("、"),s("code",[n._v("__webpack_require__.r")]),n._v(" 等功能实现最起码的模块化支持；")]),n._v(" "),s("li",[n._v("如果用到动态加载特性，则需要写入 "),s("code",[n._v("__webpack_require__.e")]),n._v(" 函数；")]),n._v(" "),s("li",[n._v("如果用到 Module Federation 特性，则需要写入 "),s("code",[n._v("__webpack_require__.o")]),n._v(" 函数；")]),n._v(" "),s("li",[n._v("等等。")])]),n._v(" "),s("p",[n._v("虽然每段运行时代码可能都很小，但随着特性的增加，最终结果会越来越大，特别对于多 entry 应用，在每个入口都重复打包一份相似的运行时显得有点浪费，为此 Webpack5 提供了 "),s("code",[n._v("entry.runtime")]),n._v(" 配置项用于声明如何打包运行时代码。用法上只需在 "),s("code",[n._v("entry")]),n._v(" 项中增加字符串形式的 "),s("code",[n._v("runtime")]),n._v(" 值，例如：")]),n._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[n._v("module"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(".")]),n._v("exports "),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v("=")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v("\n  entry"),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v(":")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v("\n    index"),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v(":")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("{")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[n._v("import")]),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v(":")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[n._v('"./src/index"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v(" runtime"),s("span",{pre:!0,attrs:{class:"token operator"}},[n._v(":")]),n._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[n._v('"solid-runtime"')]),n._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(",")]),n._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),n._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[n._v(";")]),n._v("\n")])]),n._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[n._v("1")]),s("br"),s("span",{staticClass:"line-number"},[n._v("2")]),s("br"),s("span",{staticClass:"line-number"},[n._v("3")]),s("br"),s("span",{staticClass:"line-number"},[n._v("4")]),s("br"),s("span",{staticClass:"line-number"},[n._v("5")]),s("br")])]),s("p",[n._v("在 "),s("code",[n._v("compilation.seal")]),n._v(" 函数中，Webpack 首先为 "),s("code",[n._v("entry")]),n._v(" 创建 "),s("code",[n._v("EntryPoint")]),n._v("，之后判断 "),s("code",[n._v("entry")]),n._v(" 配置中是否带有 "),s("code",[n._v("runtime")]),n._v(" 属性，有则创建以 "),s("code",[n._v("runtime")]),n._v(" 值为名的 Chunk，因此，上例配置将生成两个 Chunk："),s("code",[n._v("chunk[index.js]")]),n._v(" 、"),s("code",[n._v("chunk[solid-runtime]")]),n._v("，并据此最终产出两个文件：")]),n._v(" "),s("ul",[s("li",[n._v("入口 index 对应的 "),s("code",[n._v("index.js")]),n._v(" 文件；")]),n._v(" "),s("li",[n._v("运行时配置对应的 "),s("code",[n._v("solid-runtime.js")]),n._v(" 文件。")])]),n._v(" "),s("p",[n._v("在多 "),s("code",[n._v("entry")]),n._v(" 场景中，只要为每个 "),s("code",[n._v("entry")]),n._v(" 都设定相同的 "),s("code",[n._v("runtime")]),n._v(" 值，Webpack 运行时代码就会合并写入到同一个 Runtime Chunk 中，最终达成产物性能优化效果。")]),n._v(" "),s("h2",{attrs:{id:"默认分包的问题"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#默认分包的问题"}},[n._v("#")]),n._v(" 默认分包的问题")]),n._v(" "),s("p",[n._v("默认分包规则最大的问题是无法解决模块重复，如果多个 Chunk 同时包含同一个 Module，那么这个 Module 会被不受限制地重复打包进这些 Chunk。比如假设我们有两个入口 main/index 同时依赖了同一个模块：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk11.png",alt:"chunk11"}})]),n._v(" "),s("p",[n._v("默认情况下，Webpack 不会对此做额外处理，只是单纯地将 c 模块同时打包进 main/index 两个 Chunk，最终形成：")]),n._v(" "),s("p",[s("img",{attrs:{src:"/blog/images/devops/chunk12.png",alt:"chunk12"}})]),n._v(" "),s("p",[n._v("可以看到 chunk 间互相孤立，模块 c 被重复打包，对最终产物可能造成不必要的性能损耗！")]),n._v(" "),s("p",[n._v("为了解决这个问题，Webpack 3 引入 "),s("code",[n._v("CommonChunkPlugin")]),n._v(" 插件试图将 entry 之间的公共依赖提取成单独的 "),s("code",[n._v("chunk")]),n._v("，但 "),s("code",[n._v("CommonChunkPlugin")]),n._v(" 本质上还是基于 Chunk 之间简单的父子关系链实现的，很难推断出提取出的第三个包应该作为 "),s("code",[n._v("entry")]),n._v(" 的父 "),s("code",[n._v("chunk")]),n._v(" 还是子 "),s("code",[n._v("chunk")]),n._v("，"),s("code",[n._v("CommonChunkPlugin")]),n._v(" 统一处理为父 "),s("code",[n._v("chunk")]),n._v("，某些情况下反而对性能造成了不小的负面影响。")]),n._v(" "),s("p",[n._v("为此，在 Webpack4 之后才专门引入了更复杂的数据结构 —— "),s("code",[n._v("ChunkGroup")]),n._v(" 专门实现关系链管理，配合 "),s("code",[n._v("SplitChunksPlugin")]),n._v(" 能够更高效、智能地实现"),s("strong",[n._v("启发式分包。")])]),n._v(" "),s("h2",{attrs:{id:"小结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#小结"}},[n._v("#")]),n._v(" 小结")]),n._v(" "),s("p",[n._v("综上，「构建」阶段负责根据模块的引用关系构建 ModuleGraph；「封装」阶段则负责根据 ModuleGraph 构建一系列 Chunk 对象，并将 Chunk 之间的依赖关系（异步引用、Runtime）组织为 ChunkGraph —— Chunk 依赖关系图对象。与 ModuleGraph 类似，ChunkGraph 结构的引入也能解耦 Chunk 之间依赖关系的管理逻辑，整体架构逻辑更合理更容易扩展。")]),n._v(" "),s("p",[n._v("不过，虽然看着很复杂，但「封装」阶段最重要的目标还是在于：确定有多少个 Chunk，以及每一个 Chunk 中包含哪些 Module —— 这些才是真正影响最终打包结果的关键因素。")]),n._v(" "),s("p",[n._v("针对这一点，我们需要理解 Webpack5 内置的三种分包规则：Entry Chunk、Async Chunk 与 Runtime Chunk，这些是最最原始的分包逻辑，其它插件（例如 splitChunksPlugin）都是在此基础，借助 buildChunkGraph 后触发的各种钩子进一步拆分、合并、优化 Chunk 结构，实现扩展分包效果。")])])}),[],!1,null,null,null);t.default=e.exports}}]);