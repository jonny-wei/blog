(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{482:function(v,_,e){"use strict";e.r(_);var t=e(15),l=Object(t.a)({},(function(){var v=this,_=v.$createElement,e=v._self._c||_;return e("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[e("h1",{attrs:{id:"双引擎架构"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#双引擎架构"}},[v._v("#")]),v._v(" 双引擎架构")]),v._v(" "),e("p",[v._v("Vite 底层所深度使用的两个构建引擎 —— "),e("code",[v._v("Esbuild")]),v._v(" 和 "),e("code",[v._v("Rollup")]),v._v("。")]),v._v(" "),e("p",[e("img",{attrs:{src:"/blog/images/devops/engines1.png",alt:"engines1"}})]),v._v(" "),e("h2",{attrs:{id:"性能利器-esbuild"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#性能利器-esbuild"}},[v._v("#")]),v._v(" 性能利器 —— Esbuild")]),v._v(" "),e("p",[v._v("Esbuild 到底在 Vite 的构建体系中发挥了哪些作用？")]),v._v(" "),e("p",[v._v("作为 Vite 的双引擎之一，Esbuild 在很多关键的构建阶段(如"),e("code",[v._v("依赖预编译")]),v._v("、"),e("code",[v._v("TS 语法转译")]),v._v("、"),e("code",[v._v("代码压缩")]),v._v(")让 Vite 获得了相当优异的性能。")]),v._v(" "),e("p",[v._v("Esbuild 基于 Golang 开发的一款打包工具，相比传统的打包工具，主打性能优势，在构建速度上可以比传统工具快 "),e("code",[v._v("10~100")]),v._v(" 倍。那么，它是如何达到这样超高的构建性能的呢？主要原因可以概括为 4 点。")]),v._v(" "),e("ol",[e("li",[e("strong",[v._v("使用 Golang 开发")]),v._v("，构建逻辑代码直接被编译为原生机器码，而不用像 JS 一样先代码解析为字节码，然后转换为机器码，大大节省了程序运行时间。")]),v._v(" "),e("li",[e("strong",[v._v("多核并行")]),v._v("。内部打包算法充分利用多核 CPU 优势，所有的步骤尽可能并行，这也是得益于 Go 当中多线程共享内存的优势。")]),v._v(" "),e("li",[e("strong",[v._v("从零造轮子")]),v._v("。 几乎没有使用任何第三方库，所有逻辑自己编写，大到 AST 解析，小到字符串的操作，保证极致的代码性能。")]),v._v(" "),e("li",[e("strong",[v._v("高效的内存利用")]),v._v("。Esbuild 中从头到尾尽可能地复用一份 AST 节点数据，而不用像 JS 打包工具中频繁地解析和传递 AST 数据（如 "),e("code",[v._v("string -> TS -> JS -> string")]),v._v(")，造成内存的大量浪费。")])]),v._v(" "),e("h3",{attrs:{id:"依赖预构建-作为-bundle-工具"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#依赖预构建-作为-bundle-工具"}},[v._v("#")]),v._v(" 依赖预构建——作为 Bundle 工具")]),v._v(" "),e("p",[e("strong",[v._v("开发阶段的依赖预构建阶段")]),v._v("。")]),v._v(" "),e("p",[v._v("一般来说，"),e("code",[v._v("node_modules")]),v._v(" 依赖的大小动辄几百 MB 甚至上 GB ，会远超项目源代码，相信大家都深有体会。如果这些依赖直接在 Vite 中使用，会出现一系列的问题，这些问题我们在"),e("strong",[v._v("依赖预构建")]),v._v("的小节已经详细分析过，主要是 ESM 格式的兼容性问题和海量请求的问题，不再赘述。总而言之，对于第三方依赖，需要在应用启动前进行"),e("strong",[v._v("打包")]),v._v("并且"),e("strong",[v._v("转换为 ESM 格式")]),v._v("。")]),v._v(" "),e("p",[v._v("Vite 1.x 版本中使用 Rollup 来做这件事情，但 Esbuild 的性能实在是太恐怖了，Vite 2.x 果断采用 Esbuild 来完成第三方依赖的预构建。")]),v._v(" "),e("p",[v._v("当然，Esbuild 作为打包工具也有一些缺点：")]),v._v(" "),e("ul",[e("li",[v._v("不支持降级到 "),e("code",[v._v("ES5")]),v._v(" 的代码。这意味着在低端浏览器代码会跑不起来。")]),v._v(" "),e("li",[v._v("不支持 "),e("code",[v._v("const enum")]),v._v(" 等语法。这意味着单独使用这些语法在 esbuild 中会直接抛错。")]),v._v(" "),e("li",[v._v("不提供操作打包产物的接口，像 Rollup 中灵活处理打包产物的能力(如"),e("code",[v._v("renderChunk")]),v._v("钩子)在 Esbuild 当中完全没有。")]),v._v(" "),e("li",[v._v("不支持自定义 Code Splitting 策略。传统的 Webpack 和 Rollup 都提供了自定义拆包策略的 API，而 Esbuild 并未提供，从而降级了拆包优化的灵活性。")])]),v._v(" "),e("h3",{attrs:{id:"单文件编译-作为-ts-和-jsx-编译工具"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#单文件编译-作为-ts-和-jsx-编译工具"}},[v._v("#")]),v._v(" 单文件编译——作为 TS 和 JSX 编译工具")]),v._v(" "),e("p",[v._v("在依赖预构建阶段， Esbuild 作为 Bundler 的角色存在。而在 TS(X)/JS(X) 单文件编译上面，Vite 也使用 Esbuild 进行语法转译，也就是将 Esbuild 作为 Transformer 来用。也就是说，Esbuild 转译 TS 或者 JSX 的能力通过 Vite 插件提供，这个 Vite 插件在开发环境和生产环境都会执行，因此，我们可以得出下面这个结论：Vite 已经将 Esbuild 的 Transformer 能力用到了生产环境。尽管如此，对于低端浏览器场景，Vite 仍然可以做到语法和 Polyfill 安全。")]),v._v(" "),e("p",[v._v("虽然 "),e("code",[v._v("Esbuild Transfomer")]),v._v(" 能带来巨大的性能提升，但其自身也有局限性，最大的局限性就在于 TS 中的类型检查问题。这是因为 Esbuild 并没有实现 TS 的类型系统，在编译 "),e("code",[v._v("TS")]),v._v("(或者 "),e("code",[v._v("TSX")]),v._v(") 文件时仅仅抹掉了类型相关的代码，暂时没有能力实现类型检查。")]),v._v(" "),e("p",[v._v("也因此在初始化工程的构建脚本中，"),e("code",[v._v("vite build")]),v._v(" 之前会先执行 "),e("code",[v._v("tsc")]),v._v(" 命令，也就是借助 TS 官方的编译器进行类型检查。")]),v._v(" "),e("p",[v._v("当然，要解决类型问题，我更推荐大家使用 TS 的编辑器插件。在开发阶段就能早早把问题暴露出来并解决，不至于等到项目要打包上线的时候。")]),v._v(" "),e("h3",{attrs:{id:"代码压缩-作为压缩工具"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#代码压缩-作为压缩工具"}},[v._v("#")]),v._v(" 代码压缩——作为压缩工具")]),v._v(" "),e("p",[v._v("Vite 从 2.6 版本开始，就官宣默认使用 Esbuild 来进行生产环境的代码压缩，包括 JS 代码和 CSS 代码。")]),v._v(" "),e("p",[v._v("在生产环境中 Esbuild 压缩器通过插件的形式融入到了 Rollup 的打包流程中。那为什么 Vite 要将 Esbuild 作为生产环境下默认的压缩工具呢？因为压缩效率实在太高了！")]),v._v(" "),e("p",[v._v("Terser 其实很慢，主要有 2 个原因。")]),v._v(" "),e("ol",[e("li",[v._v("压缩这项工作涉及大量 AST 操作，并且在传统的构建流程中，AST 在各个工具之间无法共享，比如 Terser 就无法与 Babel 共享同一个 AST，造成了很多重复解析的过程。")]),v._v(" "),e("li",[v._v("JS 本身属于解释性 + JIT（即时编译） 的语言，对于压缩这种 CPU 密集型的工作，其性能远远比不上 Golang 这种原生语言。")])]),v._v(" "),e("p",[v._v("因此，Esbuild 这种从头到尾"),e("strong",[v._v("共享 AST")]),v._v(" 以及"),e("strong",[v._v("原生语言编写")]),v._v("的 Minifier 在性能上能够甩开传统工具的好几十倍。")]),v._v(" "),e("p",[v._v("压缩一个大小为"),e("code",[v._v("3.2 MB")]),v._v("的库，Terser 需要耗费"),e("code",[v._v("8798 ms")]),v._v("，而 Esbuild 仅仅需要"),e("code",[v._v("361 ms")]),v._v("，压缩效率较 Terser 提升了二三十倍，并且产物的体积几乎没有劣化，因此 Vite 果断将其内置为默认的压缩方案。")]),v._v(" "),e("p",[v._v("总的来说，Vite 将 Esbuild 作为自己的性能利器，将 Esbuild 各个垂直方向的能力(Bundler、Transformer、Minifier)利用的淋漓尽致，给 Vite 的高性能提供了有利的保证。")]),v._v(" "),e("h2",{attrs:{id:"构建基石-rollup"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#构建基石-rollup"}},[v._v("#")]),v._v(" 构建基石——Rollup")]),v._v(" "),e("p",[v._v("Rollup 在 Vite 中的重要性一点也不亚于 Esbuild，它既是 Vite 用作生产环境打包的核心工具，也直接决定了 Vite 插件机制的设计。那么，Vite 到底基于 Rollup 做了哪些事情？")]),v._v(" "),e("h3",{attrs:{id:"生产环境-bundle"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#生产环境-bundle"}},[v._v("#")]),v._v(" 生产环境 Bundle")]),v._v(" "),e("p",[v._v("虽然 ESM 已经得到众多浏览器的原生支持，但生产环境做到完全"),e("code",[v._v("no-bundle")]),v._v("也不行，会有网络性能问题。为了在生产环境中也能取得优秀的产物性能，Vite 默认选择在生产环境中利用 "),e("code",[v._v("Rollup")]),v._v(" 打包，并基于 Rollup 本身成熟的打包能力进行扩展和优化，主要包含 3 个方面:")]),v._v(" "),e("ol",[e("li",[v._v("CSS 代码分割。如果某个异步模块中引入了一些 CSS 代码，Vite 就会自动将这些 CSS 抽取出来生成单独的文件，提高线上产物的"),e("code",[v._v("缓存复用率")]),v._v("。")]),v._v(" "),e("li",[v._v("自动预加载。Vite 会自动为入口 chunk 的依赖自动生成预加载标签"),e("code",[v._v('<link rel="modulepreload">')]),v._v("。这种适当预加载的做法会让浏览器提前下载好资源，优化页面性能。")]),v._v(" "),e("li",[v._v("异步 Chunk 加载优化。在异步引入的 Chunk 中，通常会有一些公用的模块，如现有两个异步引入的 "),e("code",[v._v("Chunk: A 和 B")]),v._v("，而且两者有一个"),e("code",[v._v("公共依赖 C")]),v._v("一般情况下，Rollup 打包之后，会先请求 "),e("code",[v._v("A")]),v._v("，然后浏览器在加载 "),e("code",[v._v("A")]),v._v(" 的过程中才决定请求和加载 "),e("code",[v._v("C")]),v._v("，但 Vite 进行优化之后，请求 "),e("code",[v._v("A")]),v._v("的同时会自动预加载 "),e("code",[v._v("C")]),v._v("，通过优化 Rollup 产物依赖加载方式节省了不必要的网络开销。")])]),v._v(" "),e("h3",{attrs:{id:"兼容插件机制"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#兼容插件机制"}},[v._v("#")]),v._v(" 兼容插件机制")]),v._v(" "),e("p",[v._v("在开发阶段，Vite 借鉴了 "),e("a",{attrs:{href:"https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fpreactjs%2Fwmr",target:"_blank",rel:"noopener noreferrer"}},[v._v("WMR"),e("OutboundLink")],1),v._v(" 的思路，自己实现了一个 Plugin Container，用来模拟 Rollup 调度各个 Vite 插件的执行逻辑，而 Vite 的插件写法完全兼容 Rollup，因此在生产环境中将所有的 Vite 插件传入 Rollup 也没有问题。")]),v._v(" "),e("p",[v._v("反过来说，Rollup 插件却不一定能完全兼容 Vite。不过，目前仍然有不少 Rollup 插件可以直接复用到 Vite 中，你可以通过这个站点查看所有兼容 Vite 的 "),e("a",{attrs:{href:"%5Bvite-rollup-plugins.patak.dev/%5D(https://link.juejin.cn/?target=https%3A%2F%2Fvite-rollup-plugins.patak.dev%2F)"}},[v._v("Rollup 插件")]),v._v("。")])])}),[],!1,null,null,null);_.default=l.exports}}]);