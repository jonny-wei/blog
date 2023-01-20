(window.webpackJsonp=window.webpackJsonp||[]).push([[41],{494:function(e,t,a){"use strict";a.r(t);var s=a(15),n=Object(s.a)({},(function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[a("h1",{attrs:{id:"tree-shaking"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#tree-shaking"}},[e._v("#")]),e._v(" Tree Shaking")]),e._v(" "),a("p",[e._v("Tree Shaking 它能充分优化产物代码，使用频率颇高，并且底层实现逻辑比较复杂，需要持续读取、修改 ModuleGraph 对象的状态；需要通过 Template.apply 函数定制打包结果，等等，实现逻辑几乎贯穿了 Webpack 整个构建过程。")]),e._v(" "),a("h2",{attrs:{id:"定义"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#定义"}},[e._v("#")]),e._v(" 定义")]),e._v(" "),a("p",[e._v("是一种基于 ES Module 规范的 Dead Code Elimination 技术，它会在运行过程中静态分析模块之间的导入导出，确定 ESM 模块中哪些导出值未曾其他模块使用，并将其删除，以此实现打包产物的优化。")]),e._v(" "),a("h2",{attrs:{id:"条件"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#条件"}},[e._v("#")]),e._v(" 条件")]),e._v(" "),a("p",[e._v("在 Webpack 中，启动 Tree Shaking 功能必须同时满足三个条件：")]),e._v(" "),a("ul",[a("li",[a("p",[e._v("使用 ESM 规范编写模块代码；")])]),e._v(" "),a("li",[a("p",[e._v("配置 "),a("code",[e._v("optimization.usedExports")]),e._v(" 为 true，启动标记功能；")])]),e._v(" "),a("li",[a("p",[e._v("启动代码优化功能，可以通过如下方式实现：")]),e._v(" "),a("ul",[a("li",[e._v("配置 "),a("code",[e._v("mode = production")])]),e._v(" "),a("li",[e._v("配置 "),a("code",[e._v("optimization.minimize = true")])]),e._v(" "),a("li",[e._v("提供 "),a("code",[e._v("optimization.minimizer")]),e._v(" 数组")])])])]),e._v(" "),a("h2",{attrs:{id:"原理"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#原理"}},[e._v("#")]),e._v(" 原理")]),e._v(" "),a("p",[e._v("Webpack 中，Tree-shaking 的实现，一是需要先 「"),a("strong",[e._v("标记")]),e._v("」 出模块导出值中哪些没有被用过；二是使用代码压缩插件 —— 如 "),a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fterser-webpack-plugin",target:"_blank",rel:"noopener noreferrer"}},[e._v("Terser"),a("OutboundLink")],1),e._v(" 删掉这些没被用到的导出变量。标记的效果就是删除那些没有被其它模块使用的“"),a("strong",[e._v("导出语句")]),e._v("”，真正执行“"),a("strong",[e._v("Shaking")]),e._v("”操作的是 Terser 插件。")]),e._v(" "),a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[e._v("注意")]),e._v(" "),a("p",[e._v("标记功能需要配置 "),a("code",[e._v("optimization.usedExports = true")]),e._v(" 开启")])]),e._v(" "),a("p",[e._v("Tree-Shaking 的实现大致上可以分为三个步骤：")]),e._v(" "),a("ul",[a("li",[e._v("「"),a("strong",[e._v("构建")]),e._v("」阶段，「"),a("strong",[e._v("收集")]),e._v("」 模块导出变量并记录到模块依赖关系图 ModuleGraph 对象中；")]),e._v(" "),a("li",[e._v("「"),a("strong",[e._v("封装")]),e._v("」阶段，遍历所有模块，「"),a("strong",[e._v("标记")]),e._v("」 模块导出变量有没有被使用；")]),e._v(" "),a("li",[e._v("使用代码优化插件 —— 如 Terser，删除无效导出代码。")])]),e._v(" "),a("h3",{attrs:{id:"第一步-构建阶段收集导出列表"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#第一步-构建阶段收集导出列表"}},[e._v("#")]),e._v(" 第一步：构建阶段收集导出列表")]),e._v(" "),a("p",[e._v("首先，Webpack 需要弄清楚每个模块分别有什么导出值，收集各个模块的导出列表，这一过程发生在 「构建」 阶段，大体流程：")]),e._v(" "),a("ol",[a("li",[e._v("将模块的所有 ESM 导出语句转换为 Dependency 对象，并记录到 "),a("code",[e._v("module")]),e._v(" 对象的 "),a("code",[e._v("dependencies")]),e._v(" 集合，转换规则：\n"),a("ul",[a("li",[e._v("具名导出转换为 "),a("code",[e._v("HarmonyExportSpecifierDependency")]),e._v(" 对象；")]),e._v(" "),a("li",[a("code",[e._v("default")]),e._v(" 导出转换为 "),a("code",[e._v("HarmonyExportExpressionDependency")]),e._v(" 对象。")])])]),e._v(" "),a("li",[e._v("所有模块都编译完毕后，触发 "),a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fcompilation-hooks%2F%23finishmodules",target:"_blank",rel:"noopener noreferrer"}},[e._v("compilation.hooks.finishModules"),a("OutboundLink")],1),e._v(" 钩子，开始执行 "),a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FFlagDependencyExportsPlugin.js",target:"_blank",rel:"noopener noreferrer"}},[e._v("FlagDependencyExportsPlugin"),a("OutboundLink")],1),e._v(" 插件回调；")]),e._v(" "),a("li",[a("code",[e._v("FlagDependencyExportsPlugin")]),e._v(" 插件 "),a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FFlagDependencyExportsPlugin.js%23L51-L53",target:"_blank",rel:"noopener noreferrer"}},[e._v("遍历"),a("OutboundLink")],1),e._v(" 所有 "),a("code",[e._v("module")]),e._v(" 对象；")]),e._v(" "),a("li",[a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FFlagDependencyExportsPlugin.js%23L331-L333",target:"_blank",rel:"noopener noreferrer"}},[e._v("遍历"),a("OutboundLink")],1),e._v(" "),a("code",[e._v("module")]),e._v(" 对象的 "),a("code",[e._v("dependencies")]),e._v(" 数组，找到所有 "),a("code",[e._v("HarmonyExportXXXDependency")]),e._v(" 类型的依赖对象，将其转换为 "),a("code",[e._v("ExportInfo")]),e._v(" 对象并记录到 ModuleGraph 对象中。")])]),e._v(" "),a("p",[e._v("经过 "),a("code",[e._v("FlagDependencyExportsPlugin")]),e._v(" 插件处理后，所有 ESM 风格的模块导出信息都会记录到 ModuleGraph 体系内，后续操作就可以从 ModuleGraph 中直接读取出模块的导出值。")]),e._v(" "),a("h3",{attrs:{id:"第二步-封装阶段标记未使用模块"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#第二步-封装阶段标记未使用模块"}},[e._v("#")]),e._v(" 第二步：封装阶段标记未使用模块")]),e._v(" "),a("p",[e._v("接下来，Webpack 需要再次遍历所有模块，逐一 「"),a("strong",[e._v("标记")]),e._v("」 出模块导出列表中，哪些导出值有被其它模块用到，哪些没有，这个过程主要发生在 "),a("code",[e._v("FlagDependencyUsagePlugin")]),e._v(" 插件中，主流程：")]),e._v(" "),a("ol",[a("li",[a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2804-L2806",target:"_blank",rel:"noopener noreferrer"}},[e._v("触发"),a("OutboundLink")],1),e._v(" "),a("code",[e._v("compilation.hooks.optimizeDependencies")]),e._v(" 钩子，执行 "),a("code",[e._v("FlagDependencyUsagePlugin")]),e._v(" 插件 "),a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FFlagDependencyUsagePlugin.js%23L41-L42",target:"_blank",rel:"noopener noreferrer"}},[e._v("回调"),a("OutboundLink")],1),e._v("；")]),e._v(" "),a("li",[e._v("在 "),a("code",[e._v("FlagDependencyUsagePlugin")]),e._v(" 插件中，"),a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FFlagDependencyUsagePlugin.js%23L288-L289",target:"_blank",rel:"noopener noreferrer"}},[e._v("遍历"),a("OutboundLink")],1),e._v(" "),a("code",[e._v("modules")]),e._v(" 数组；")]),e._v(" "),a("li",[e._v("遍历每一个 "),a("code",[e._v("module")]),e._v(" 对象的 "),a("code",[e._v("exportInfo")]),e._v(" 数组；")]),e._v(" "),a("li",[e._v("为每一个 "),a("code",[e._v("exportInfo")]),e._v(" 对象执行 "),a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L3737-L3738",target:"_blank",rel:"noopener noreferrer"}},[e._v("compilation.getDependencyReferencedExports"),a("OutboundLink")],1),e._v(" 方法，确定其对应的 "),a("code",[e._v("dependency")]),e._v(" 对象有否被其它模块使用；")]),e._v(" "),a("li",[e._v("被任意模块使用到的导出值，调用 "),a("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FExportsInfo.js%23L954-L955",target:"_blank",rel:"noopener noreferrer"}},[e._v("exportInfo.setUsedConditionally"),a("OutboundLink")],1),e._v(" 方法将其标记为已被使用；")]),e._v(" "),a("li",[a("code",[e._v("exportInfo.setUsedConditionally")]),e._v(" 内部修改 "),a("code",[e._v("exportInfo._usedInRuntime")]),e._v(" 属性，记录该导出被如何使用。")])]),e._v(" "),a("p",[e._v("执行完毕后，Webpack 会将所有导出语句的使用状况记录到 "),a("code",[e._v("exportInfo._usedInRuntime")]),e._v(" 字典中。")]),e._v(" "),a("h3",{attrs:{id:"第三步-优化阶段删除无效导出代码"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#第三步-优化阶段删除无效导出代码"}},[e._v("#")]),e._v(" 第三步：优化阶段删除无效导出代码")]),e._v(" "),a("p",[e._v("经过前面的收集与标记步骤后，Webpack 已经在 ModuleGraph 体系中清楚地记录了每个模块都导出了哪些值，每个导出值又被哪些模块所使用。接下来，Webpack 会根据导出值的使用情况生成不同的代码，具体逻辑由导出语句对应的 "),a("code",[e._v("HarmonyExportXXXDependency")]),e._v(" 类实现，大体流程：")]),e._v(" "),a("ol",[a("li",[e._v("在 "),a("code",[e._v("compilation.seal")]),e._v(" 函数中，完成 ChunkGraph 后，开始调用 "),a("code",[e._v("compilation.codeGeneration")]),e._v(" 函数生成最终代码；")]),e._v(" "),a("li",[a("code",[e._v("compilation.codeGeneration")]),e._v(" 中会逐一遍历模块的 "),a("code",[e._v("dependencies")]),e._v(" ，并调用 "),a("code",[e._v("HarmonyExportXXXDependency.Template.apply")]),e._v(" 方法生成导出语句代码；")]),e._v(" "),a("li",[e._v("在 "),a("code",[e._v("apply")]),e._v(" 方法内，读取 ModuleGraph 中存储的 "),a("code",[e._v("exportsInfo")]),e._v(" 信息，判断哪些导出值被使用，哪些未被使用；")]),e._v(" "),a("li",[e._v("对已经被使用及未被使用的导出值，分别创建对应的 "),a("code",[e._v("HarmonyExportInitFragment")]),e._v(" 对象，保存到 "),a("code",[e._v("initFragments")]),e._v(" 数组；")]),e._v(" "),a("li",[e._v("遍历 "),a("code",[e._v("initFragments")]),e._v(" 数组，生成最终结果。")])]),e._v(" "),a("p",[e._v("在此之后，将由 Terser、UglifyJS 等 DCE 工具“摇”掉这部分无效代码，构成完整的 Tree Shaking 操作。")]),e._v(" "),a("p",[e._v("综上所述，Webpack 中 Tree Shaking 的实现分为如下步骤：")]),e._v(" "),a("ul",[a("li",[e._v("在 "),a("code",[e._v("FlagDependencyExportsPlugin")]),e._v(" 插件中根据模块的 "),a("code",[e._v("dependencies")]),e._v(" 列表收集模块导出值，并记录到 ModuleGraph 体系的 "),a("code",[e._v("exportsInfo")]),e._v(" 中；")]),e._v(" "),a("li",[e._v("在 "),a("code",[e._v("FlagDependencyUsagePlugin")]),e._v(" 插件中收集模块的导出值的使用情况，并记录到 "),a("code",[e._v("exportInfo._usedInRuntime")]),e._v(" 集合中；")]),e._v(" "),a("li",[e._v("在 "),a("code",[e._v("HarmonyExportXXXDependency.Template.apply")]),e._v(" 方法中根据导出值的使用情况生成不同的导出语句；")]),e._v(" "),a("li",[e._v("使用 DCE 工具删除 Dead Code，实现完整的树摇效果")])]),e._v(" "),a("h2",{attrs:{id:"实践"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#实践"}},[e._v("#")]),e._v(" 实践")]),e._v(" "),a("p",[e._v("虽然 Webpack 自 2.x 开始就原生支持 Tree Shaking 功能，但受限于 JS 的动态特性与模块的复杂性，直至最新的 5.0 版本，依然没有解决许多代码副作用带来的问题，使得优化效果并不如 Tree Shaking 原本设想的那么完美，所以需要使用者有意识地优化代码结构，或使用一些补丁技术帮助 Webpack 更精确地检测无效代码，完成 Tree Shaking 操作。")]),e._v(" "),a("h3",{attrs:{id:"始终使用-esm"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#始终使用-esm"}},[e._v("#")]),e._v(" 始终使用 ESM")]),e._v(" "),a("p",[e._v("Tree-Shaking 强依赖于 ESM 模块化方案的静态分析能力，所以应尽量坚持使用 ESM 编写模块代码。对比而言，在过往的 CommonJS、AMD、CMD 旧版本模块化方案中，导入导出行为是高度动态，难以预测。而 ESM 方案则从规范层面规避这一行为，它要求所有的导入导出语句只能出现在模块顶层，且导入导出的模块名必须为字符串常量。所以，ESM 下模块之间的依赖关系是高度确定的，与运行状态无关，编译工具只需要对 ESM 模块做静态分析，就可以从代码字面量中推断出哪些模块值未曾被其它模块使用，这是实现 Tree Shaking 技术的必要条件。")]),e._v(" "),a("h3",{attrs:{id:"避免无意义的赋值"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#避免无意义的赋值"}},[e._v("#")]),e._v(" 避免无意义的赋值")]),e._v(" "),a("p",[e._v("使用 Webpack 时，需要有意识规避一些不必要的赋值操作")]),e._v(" "),a("p",[a("img",{attrs:{src:"/blog/images/devops/tree-shaking1.png",alt:"tree-shaking1"}})]),e._v(" "),a("p",[e._v("示例中，"),a("code",[e._v("index.js")]),e._v(" 模块引用了 "),a("code",[e._v("bar.js")]),e._v(" 模块的 "),a("code",[e._v("foo")]),e._v(" 并赋值给 "),a("code",[e._v("f")]),e._v(" 变量，但后续并没有继续用到 "),a("code",[e._v("foo")]),e._v(" 或 "),a("code",[e._v("f")]),e._v(" 变量，这种场景下， "),a("code",[e._v("bar.js")]),e._v(" 模块导出的 "),a("code",[e._v("foo")]),e._v(" 值实际上并没有被使用，理应被删除，但 Webpack 的 Tree Shaking 操作并没有生效，产物中依然保留 "),a("code",[e._v("foo")]),e._v(" 导出：")]),e._v(" "),a("p",[a("img",{attrs:{src:"/blog/images/devops/tree-shaking2.png",alt:"tree-shaking2"}})]),e._v(" "),a("p",[e._v("造成这一结果，浅层原因是 Webpack 的 Tree Shaking 逻辑停留在代码静态分析层面，只是浅显地判断：")]),e._v(" "),a("ul",[a("li",[e._v("模块导出变量是否被其它模块引用；")]),e._v(" "),a("li",[e._v("引用模块的主体代码中有没有出现这个变量。")])]),e._v(" "),a("p",[e._v("没有进一步，从语义上分析模块导出值是不是真的被有效使用。")]),e._v(" "),a("p",[e._v("更深层次的原因则是 JavaScript 的赋值语句并不纯，具体场景下有可能产生意料之外的副作用，例如：")]),e._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("import")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v(" bar"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" foo "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("from")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[e._v('"./bar"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("let")]),e._v(" count "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[e._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("const")]),e._v(" mock "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n\nObject"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[e._v("defineProperty")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("mock"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[e._v("'f'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),a("span",{pre:!0,attrs:{class:"token function"}},[e._v("set")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("v"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n        mock"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("_f "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" v"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n        count "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("+=")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[e._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v("\n\nmock"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("f "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" foo"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\nconsole"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[e._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("count"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n")])]),e._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[e._v("1")]),a("br"),a("span",{staticClass:"line-number"},[e._v("2")]),a("br"),a("span",{staticClass:"line-number"},[e._v("3")]),a("br"),a("span",{staticClass:"line-number"},[e._v("4")]),a("br"),a("span",{staticClass:"line-number"},[e._v("5")]),a("br"),a("span",{staticClass:"line-number"},[e._v("6")]),a("br"),a("span",{staticClass:"line-number"},[e._v("7")]),a("br"),a("span",{staticClass:"line-number"},[e._v("8")]),a("br"),a("span",{staticClass:"line-number"},[e._v("9")]),a("br"),a("span",{staticClass:"line-number"},[e._v("10")]),a("br"),a("span",{staticClass:"line-number"},[e._v("11")]),a("br"),a("span",{staticClass:"line-number"},[e._v("12")]),a("br"),a("span",{staticClass:"line-number"},[e._v("13")]),a("br"),a("span",{staticClass:"line-number"},[e._v("14")]),a("br")])]),a("p",[e._v("示例中，对 "),a("code",[e._v("mock")]),e._v(" 对象施加的 "),a("code",[e._v("Object.defineProperty")]),e._v(" 调用，导致 "),a("code",[e._v("mock.f = foo")]),e._v(" 赋值语句对 "),a("code",[e._v("count")]),e._v(" 变量产生了副作用，这种场景下即使用复杂的动态语义分析，也很难在确保正确副作用的前提下，完美地 Shaking 掉所有无用的代码枝叶。")]),e._v(" "),a("p",[e._v("因此，在使用 Webpack 时开发者需要有意识地规避这些无意义的重复赋值操作。")]),e._v(" "),a("h3",{attrs:{id:"使用-pure-标注纯函数调用"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#使用-pure-标注纯函数调用"}},[e._v("#")]),e._v(" 使用 "),a("code",[e._v("#pure")]),e._v(" 标注纯函数调用")]),e._v(" "),a("p",[e._v("与赋值语句类似，JavaScript 中的函数调用语句也可能产生副作用，因此默认情况下 Webpack 并不会对函数调用做 Tree Shaking 操作。不过，开发者可以在调用语句前添加 "),a("code",[e._v("/*#__PURE__*/")]),e._v(" 备注，明确告诉 Webpack 该次函数调用并不会对上下文环境产生副作用，例如：")]),e._v(" "),a("p",[a("img",{attrs:{src:"/blog/images/devops/tree-shaking3.png",alt:"tree-shaking3"}})]),e._v(" "),a("p",[e._v("示例中，"),a("code",[e._v("foo('be retained')")]),e._v(" 调用没有带上 "),a("code",[e._v("/*#__PURE__*/")]),e._v(" 备注，代码被保留；作为对比，"),a("code",[e._v("foo('be removed')")]),e._v(" 带上 Pure 声明后则被 Tree Shaking 删除。")]),e._v(" "),a("h3",{attrs:{id:"禁止-babel-转译模块导入导出语句"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#禁止-babel-转译模块导入导出语句"}},[e._v("#")]),e._v(" 禁止 Babel 转译模块导入导出语句")]),e._v(" "),a("p",[e._v("Babel 提供的部分功能特性会致使 Tree Shaking 功能失效，例如 Babel 可以将 "),a("code",[e._v("import/export")]),e._v(" 风格的 ESM 语句等价转译为 CommonJS 风格的模块化语句，但该功能却导致 Webpack 无法对转译后的模块导入导出内容做静态分析，示例：")]),e._v(" "),a("p",[a("img",{attrs:{src:"/blog/images/devops/tree-shaking4.png",alt:"tree-shaking4"}})]),e._v(" "),a("p",[e._v("示例使用 "),a("code",[e._v("babel-loader")]),e._v(" 处理 "),a("code",[e._v("*.js")]),e._v(" 文件，并设置 Babel 配置项 "),a("code",[e._v("modules = 'commonjs'")]),e._v("，将模块化方案从 ESM 转译到 CommonJS，导致转译代码（右图上一）没有正确标记出未被使用的导出值 "),a("code",[e._v("foo")]),e._v("。作为对比，右图 2 为 "),a("code",[e._v("modules = false")]),e._v(" 时打包的结果，此时 "),a("code",[e._v("foo")]),e._v(" 变量被正确标记为 Dead Code。")]),e._v(" "),a("p",[e._v("所以，在 Webpack 中使用 "),a("code",[e._v("babel-loader")]),e._v(" 时，建议将 "),a("code",[e._v("babel-preset-env")]),e._v(" 的 "),a("code",[e._v("moduels")]),e._v(" 配置项设置为 "),a("code",[e._v("false")]),e._v("，关闭模块导入导出语句的转译。")]),e._v(" "),a("h3",{attrs:{id:"优化导出值的粒度"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#优化导出值的粒度"}},[e._v("#")]),e._v(" 优化导出值的粒度")]),e._v(" "),a("p",[e._v("Tree Shaking 逻辑作用在 ESM 的 export 语句上，因此对于下面这种导出场景，即使实际上只用到 "),a("code",[e._v("default")]),e._v(" 导出值的其中一个属性，整个 "),a("code",[e._v("default")]),e._v(" 对象依然会被完整保留。所以实际开发中，应该尽量保持导出值颗粒度和原子性")]),e._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// 优化前")]),e._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("export")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("default")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    bar"),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[e._v("'bar'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    foo"),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[e._v("'foo'")]),e._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// 优化后")]),e._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("const")]),e._v(" bar "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[e._v("'bar'")]),e._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("const")]),e._v(" foo "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[e._v("'foo'")]),e._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("export")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    bar"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    foo\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])]),e._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[e._v("1")]),a("br"),a("span",{staticClass:"line-number"},[e._v("2")]),a("br"),a("span",{staticClass:"line-number"},[e._v("3")]),a("br"),a("span",{staticClass:"line-number"},[e._v("4")]),a("br"),a("span",{staticClass:"line-number"},[e._v("5")]),a("br"),a("span",{staticClass:"line-number"},[e._v("6")]),a("br"),a("span",{staticClass:"line-number"},[e._v("7")]),a("br"),a("span",{staticClass:"line-number"},[e._v("8")]),a("br"),a("span",{staticClass:"line-number"},[e._v("9")]),a("br"),a("span",{staticClass:"line-number"},[e._v("10")]),a("br"),a("span",{staticClass:"line-number"},[e._v("11")]),a("br"),a("span",{staticClass:"line-number"},[e._v("12")]),a("br"),a("span",{staticClass:"line-number"},[e._v("13")]),a("br"),a("span",{staticClass:"line-number"},[e._v("14")]),a("br")])]),a("h3",{attrs:{id:"使用支持-tree-shaking-的包"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#使用支持-tree-shaking-的包"}},[e._v("#")]),e._v(" 使用支持 Tree Shaking 的包")]),e._v(" "),a("p",[e._v("如果可以的话，应尽量使用支持 Tree Shaking 的 npm 包，例如：")]),e._v(" "),a("ul",[a("li",[e._v("使用 "),a("code",[e._v("lodash-es")]),e._v(" 替代 "),a("code",[e._v("lodash")]),e._v(" ，或者使用 "),a("code",[e._v("babel-plugin-lodash")]),e._v(" 实现类似效果。")])]),e._v(" "),a("p",[e._v("不过，并不是所有 npm 包都存在 Tree Shaking 的空间，诸如 React、Vue2 一类的框架，原本已经对生产版本做了足够极致的优化，此时业务代码需要整个代码包提供的完整功能，基本上不太需要进行 Tree Shaking。")]),e._v(" "),a("h3",{attrs:{id:"在异步模块中使用-tree-shaking"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#在异步模块中使用-tree-shaking"}},[e._v("#")]),e._v(" 在异步模块中使用 Tree-Shaking")]),e._v(" "),a("p",[e._v("Webpack5 之后，我们还可以用一种特殊的备注语法，实现异步模块的 Tree-Shaking 功能，例如：")]),e._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("import")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),a("span",{pre:!0,attrs:{class:"token comment"}},[e._v('/* webpackExports: ["foo", "default"] */')]),e._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[e._v('"./foo"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[e._v("then")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[e._v("module")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=>")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n  console"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[e._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("module"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("foo"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n")])]),e._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[e._v("1")]),a("br"),a("span",{staticClass:"line-number"},[e._v("2")]),a("br"),a("span",{staticClass:"line-number"},[e._v("3")]),a("br")])]),a("p",[e._v("示例中，通过 "),a("code",[e._v("/* webpackExports: xxx */")]),e._v(" 备注语句，显式声明即将消费异步模块的那些导出内容，Webpack 即可借此判断模块依赖，实现 Tree-Shaking。")]),e._v(" "),a("p",[e._v("综上，Tree-Shaking 是一种只对 ESM 有效的 Dead Code Elimination 技术，它能够自动删除无效（没有被使用，且没有副作用）的模块导出变量，优化产物体积。不过，受限于 JavaScript 语言灵活性所带来的高度动态特性，Tree-Shaking 并不能完美删除所有无效的模块导出，需要我们在业务代码中遵循若干最佳实践规则，帮助 Tree-Shaking 更好地运行。")])])}),[],!1,null,null,null);t.default=n.exports}}]);