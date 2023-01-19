(window.webpackJsonp=window.webpackJsonp||[]).push([[78],{528:function(t,e,s){"use strict";s.r(e);var a=s(15),n=Object(a.a)({},(function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"模块"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#模块"}},[t._v("#")]),t._v(" 模块")]),t._v(" "),s("h2",{attrs:{id:"模块风格"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#模块风格"}},[t._v("#")]),t._v(" 模块风格")]),t._v(" "),s("p",[t._v("一些广为使用的模块格式有：")]),t._v(" "),s("ul",[s("li",[t._v("CommonJS")]),t._v(" "),s("li",[t._v("Asynchronous Module Definition（AMD）- RequireJS")]),t._v(" "),s("li",[t._v("Common Module Definition（CMD）- SeaJS")]),t._v(" "),s("li",[t._v("Universal Module Definition（UMD）")]),t._v(" "),s("li",[t._v("ES6 Module")])]),t._v(" "),s("h3",{attrs:{id:"commonjs"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#commonjs"}},[t._v("#")]),t._v(" CommonJS")]),t._v(" "),s("p",[t._v("2009 年 Nodejs 发布，其中 Commonjs 是作为 Node 中模块化规范以及原生模块面世的。基本上 Commonjs 发布之后，就成了 Node 里面标准的模块化管理工具。同时 Node 还推出了 npm 包管理工具，npm 平台上的包均满足 Commonjs 规范。")]),t._v(" "),s("h4",{attrs:{id:"使用"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#使用"}},[t._v("#")]),t._v(" 使用")]),t._v(" "),s("ul",[s("li",[t._v("module.exports")]),t._v(" "),s("li",[t._v("require")])]),t._v(" "),s("p",[t._v("CommonJS 还可以细分为 CommonJSl 和 CommonJS2，区别在于 CommonJSl 只能通过 "),s("code",[t._v("exports.XX = XX")]),t._v(" 的方式导出，而 CommonJS2 在 CommonJSl 的基础上加入了 "),s("code",[t._v("module.exports = XX")]),t._v(" 的导出方式。 CommonJS 通常指 CommonJS2。")]),t._v(" "),s("p",[t._v("module.exports 属性表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取 module.exports 变量。node 为每一个模块提供了一个 exports 变量(可以说是一个对象)，指向 module.exports。这相当于每个模块中都有一句这样的命令 "),s("code",[t._v("var exports = module.exports")]),t._v("。既然两个不好区分，那就放弃 exports, 只用 module.exports 就好。")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("Module 对象")]),t._v(" "),s("ul",[s("li",[t._v("module.id 模块的识别符，通常是带有绝对路径的模块文件名。")]),t._v(" "),s("li",[t._v("module.filename 模块的文件名，带有绝对路径。")]),t._v(" "),s("li",[t._v("module.loaded 返回一个布尔值，表示模块是否已经完成加载。")]),t._v(" "),s("li",[t._v("module.parent 返回一个对象，表示调用该模块的模块。")]),t._v(" "),s("li",[t._v("module.children 返回一个数组，表示该模块要用到的其他模块。")]),t._v(" "),s("li",[t._v("module.exports 表示模块对外输出的值。")])])]),t._v(" "),s("h4",{attrs:{id:"特点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#特点"}},[t._v("#")]),t._v(" 特点")]),t._v(" "),s("ul",[s("li",[t._v("原生 Module 对象，每个文件都是一个 Module 实例")]),t._v(" "),s("li",[t._v("文件内通过 require 对象引入指定模块")]),t._v(" "),s("li",[t._v("所有文件加载均是同步完成")]),t._v(" "),s("li",[t._v("通过 module 关键字暴露内容")]),t._v(" "),s("li",[t._v("每个模块加载一次之后就会被缓存")]),t._v(" "),s("li",[t._v("模块编译本质上是沙箱编译")]),t._v(" "),s("li",[t._v("由于使用了 Node 的 api，只能在服务端环境上运行")]),t._v(" "),s("li",[t._v("所有代码都运行带模块作用域、不会污染全局作用域")]),t._v(" "),s("li",[t._v("模块加载的顺序是按照其在代码中出现的顺序")])]),t._v(" "),s("h4",{attrs:{id:"优点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#优点"}},[t._v("#")]),t._v(" 优点")]),t._v(" "),s("ul",[s("li",[t._v("强大的查找模块功能，开发十分方便")]),t._v(" "),s("li",[t._v("标准化的输入输出，非常统一")]),t._v(" "),s("li",[t._v("每个文件引入自己的依赖，最终形成文件依赖树")]),t._v(" "),s("li",[t._v("模块缓存机制，提高编译效率")]),t._v(" "),s("li",[t._v("利用 node 实现文件同步读取")]),t._v(" "),s("li",[t._v("依靠注入变量的沙箱编译实现模块化")])]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("沙箱编译")]),t._v(" "),s("p",[t._v("require 进来的 js 模块会被 Module 模块注入一些变量，使用立即执行函数编译，看起来就好像：")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("exports"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" require"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" module"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" __filename"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" __dirname")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//原始文件内容")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br")])]),s("p",[t._v("Node 内部提供一个 Module 构建函数。所有模块都是 Module 的实例。")])]),t._v(" "),s("p",[t._v("CommonJS 的缺点在于: 这样的代码无法直接运行在浏览器环境下，必须通过工具转换 成标准的 ES5。")]),t._v(" "),s("h3",{attrs:{id:"amd"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#amd"}},[t._v("#")]),t._v(" AMD")]),t._v(" "),s("p",[t._v("Commonjs 的诞生给 js 模块化发展有了重要的启发，Commonjs 非常受欢迎，但是局限性很明显：")]),t._v(" "),s("p",[t._v("Commonjs 基于 Node 原生 api 在服务端可以实现模块同步加载，但是仅仅局限于服务端，客户端如果同步加载依赖的话时间消耗非常大，所以需要一个在客户端上基于 Commonjs但 是对于加载模块做改进的方案，于是 AMD 规范诞生了。")]),t._v(" "),s("p",[t._v("AMD(Asynchronous Module Definition) 异步模块定义。它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到所有依赖加载完成之后（前置依赖），这个回调函数才会运行。它大大的利用了浏览器的并发请求能力，让模块的依赖过程的阻塞变得更少了。requireJs 就是 AMD 模块化规范的实现。")]),t._v(" "),s("p",[t._v("CommonJS 规范加载模块是同步的，也就是说，只有加载完成，才能执行后面的操作。AMD 规范则是非同步加载模块，允许指定回调函数。由于 Node.js 主要用于服务器编程，模块文件一般都已经存在于本地硬盘，所以加载起来比较快，不用考虑非同步加载的方式，所以 CommonJS 规范比较适用。但是，如果是浏览器环境，要从服务器端加载模块，这时就必须采用非同步模式，因此浏览器端一般采用 AMD 规范。")]),t._v(" "),s("h4",{attrs:{id:"使用-2"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#使用-2"}},[t._v("#")]),t._v(" 使用")]),t._v(" "),s("p",[t._v("模块功能主要的几个命令：define、require、return 和 define.amd。")]),t._v(" "),s("p",[t._v("使用 define 来定义模块，return 来输出接口， require 来加载模块，这是 AMD 官方推荐用法。")]),t._v(" "),s("ul",[s("li",[s("code",[t._v("define(id?, dependencies?, factory);")])]),t._v(" "),s("li",[s("code",[t._v("require([module], callback);")])])]),t._v(" "),s("p",[t._v("AMD 模块运行在浏览器环境下，它使用 define 函数来定义模块。不同于CommonJS，它要求两个参数：")]),t._v(" "),s("p",[s("code",[t._v("require([module], callback);")])]),t._v(" "),s("p",[t._v("第一个参数[module]，是一个数组，里面的成员就是要加载的模块；第二个参数callback，则是加载成功之后的回调函数。如果将前面的代码改写成AMD形式，就是下面这样：")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token function"}},[t._v("define")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'dep1'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'dep2'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("dep1"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" dep2")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br")])]),s("p",[t._v("不同于 Commonjs，在定义模块的时候需要使用 define 函数定义：")]),t._v(" "),s("p",[s("code",[t._v("define(id?, dependencies?, factory);")])]),t._v(" "),s("p",[t._v("define方法与require类似，id是定义模块的名字，仍然会在所有依赖加载完毕之后执行factory。")]),t._v(" "),s("h4",{attrs:{id:"requirejs"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#requirejs"}},[t._v("#")]),t._v(" RequireJs")]),t._v(" "),s("p",[t._v("RequireJs 是 js 模块化的工具框架，是 AMD 规范的具体实现。RequireJs 有两个最鲜明的特点：")]),t._v(" "),s("ul",[s("li",[t._v("依赖前置：动态创建 "),s("code",[t._v("<script>")]),t._v(" 引入依赖，在 "),s("code",[t._v("<script>")]),t._v(" 标签的 onload 事件监听文件加载完毕；一个模块的回调函数必须得等到所有依赖都加载完毕之后，才可执行，类似 "),s("code",[t._v("Promise.all")]),t._v("。")]),t._v(" "),s("li",[t._v("配置文件：有一个 main 文件，配置不同模块的路径，以及 shim 不满足 AMD 规范的 js 文件。")])]),t._v(" "),s("h4",{attrs:{id:"优点-2"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#优点-2"}},[t._v("#")]),t._v(" 优点")]),t._v(" "),s("ul",[s("li",[t._v("动态并行加载 js，依赖前置，无需再考虑 js 加载顺序问题。")]),t._v(" "),s("li",[t._v("核心还是注入变量的沙箱编译，解决模块化问题。")]),t._v(" "),s("li",[t._v("规范化输入输出，使用起来方便。")]),t._v(" "),s("li",[t._v("对于不满足 AMD 规范的文件可以很好地兼容。")])]),t._v(" "),s("h3",{attrs:{id:"cmd"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#cmd"}},[t._v("#")]),t._v(" CMD")]),t._v(" "),s("p",[t._v("同样是受到 Commonjs 的启发，国内（阿里）诞生了一个 CMD（Common Module Definition）规范。该规范借鉴了 Commonjs 的规范与 AMD 规范，在两者基础上做了改进。一个文件就是一个模块，可以像 Node.js 一般书写模块代码。主要在浏览器中运行，当然也可以在 Node.js 中运行。现在 CMD 已经凉了。")]),t._v(" "),s("h4",{attrs:{id:"特点-2"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#特点-2"}},[t._v("#")]),t._v(" 特点")]),t._v(" "),s("p",[t._v("与 AMD 相比非常类似，CMD 规范（2011）具有以下特点：")]),t._v(" "),s("ul",[s("li",[t._v("define 定义模块，require 加载模块，exports 暴露变量。")]),t._v(" "),s("li",[t._v("不同于 AMD 的依赖前置，CMD 推崇依赖就近（需要的时候再加载）")]),t._v(" "),s("li",[t._v("推崇 api 功能单一，一个模块干一件事。")])]),t._v(" "),s("h4",{attrs:{id:"seajs"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#seajs"}},[t._v("#")]),t._v(" SeaJS")]),t._v(" "),s("p",[t._v("SeaJs 是 CMD 规范的实现，跟 RequireJs 类似，CMD 也是 SeaJs 推广过程中诞生的规范。CMD 借鉴了很多 AMD 和 Commonjs 优点，同样 SeaJs 也对 AMD 和 Commonjs\n做出了很多兼容。")]),t._v(" "),s("ul",[s("li",[t._v("需要配置模块对应的url。")]),t._v(" "),s("li",[t._v("入口文件执行之后，根据文件内的依赖关系整理出依赖树，然后通过插入 "),s("code",[t._v("<script>")]),t._v(" 标签加载依赖。")]),t._v(" "),s("li",[t._v("依赖加载完毕之后，执行根factory。")]),t._v(" "),s("li",[t._v("在 factory 中遇到 require，则去执行对应模块的 factory，实现就近依赖。")]),t._v(" "),s("li",[t._v("类似 Commonjs，对所有模块进行缓存（模块的 url 就是 id）。")]),t._v(" "),s("li",[t._v("类似 Commonjs，可以使用相对路径加载模块。")]),t._v(" "),s("li",[t._v("可以向 RequireJs 一样前置依赖，但是推崇就近依赖。")]),t._v(" "),s("li",[t._v("exports 和 return 都可以暴露变量。")])]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("AMD vs CMD")]),t._v(" "),s("ul",[s("li",[t._v("AMD 是提前执行， CMD 是延迟执行")]),t._v(" "),s("li",[t._v("CMD 推崇依赖就近，AMD 推崇依赖前置")]),t._v(" "),s("li",[t._v("AMD 的 API 默认是一个当多个用，CMD 的 API 严格区分，推崇职责单一")])])]),t._v(" "),s("h3",{attrs:{id:"umd"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#umd"}},[t._v("#")]),t._v(" UMD")]),t._v(" "),s("p",[t._v("UMD(Universal Module Definition)通用模块定义模式，该模式主要用来解决 CommonJS 模式和 AMD 模式代码不能通用的问题，并同时还支持老式的全局变量规范。它可以通过运行时或者编译时让同一个代码模块在使用 CommonJs、CMD 甚至是 AMD 的项目中运行。未来同一个 JavaScript 包运行在浏览器端、服务区端甚至是 APP 端都只需要遵守同一个写法就行了。它没有自己专有的规范，是集结了 CommonJs、CMD、AMD 的规范于一身。它或许不是未来最好的模块化方式，未来在 ES6+、TypeScript、Dart 这些拥有高级语法的语言回代替这些方案。")]),t._v(" "),s("h3",{attrs:{id:"es-modules"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#es-modules"}},[t._v("#")]),t._v(" ES Modules")]),t._v(" "),s("p",[t._v("ES modules（ESM）是 JavaScript 官方的标准化模块系统。")]),t._v(" "),s("ul",[s("li",[t._v("它因为是标准，所以未来很多浏览器会支持，可以很方便的在浏览器中使用。(浏览器默认加载不能省略.js)")]),t._v(" "),s("li",[t._v("它同时兼容在 node 环境下运行。")]),t._v(" "),s("li",[t._v("模块的导入导出，通过 import 和 export 来确定。")]),t._v(" "),s("li",[t._v("可以和 Commonjs 模块混合使用。")]),t._v(" "),s("li",[s("Highlighters",[t._v("ES modules 输出的是值的引用，输出接口动态绑定，而 CommonJS 输出的是值的拷贝")])],1),t._v(" "),s("li",[s("Highlighters",[t._v("ES modules 模块编译时执行，而 CommonJS 模块总是在运行时加载")])],1),t._v(" "),s("li",[t._v("无论是 ES6 模块还是 CommonJS 模块，当你重复引入某个相同的模块时，模块只会执行一次。")]),t._v(" "),s("li",[t._v("ES modules 静态编译，CommonJS 运行时加载")]),t._v(" "),s("li",[t._v("import 命令会被 JavaScript 引擎静态分析，优先于模块内的其他内容执行，即 import 优先执行。")]),t._v(" "),s("li",[t._v("export 命令会有变量声明提前的效果，即 export 变量声明提升。")])]),t._v(" "),s("p",[s("strong",[t._v("require.ensure 的出现是 webpack 的产物")]),t._v("：")]),t._v(" "),s("p",[t._v("它是因为浏览器需要一种异步的机制可以用来异步加载模块，从而减少初始的加载文件的体积，所以如果在服务端的话 "),s("code",[t._v("require.ensure")]),t._v(" 就无用武之地了，因为服务端不存在异步加载模块的情况，模块同步进行加载就可以满足使用场景了。 CommonJS 模块可以在运行时确认模块加载。")]),t._v(" "),s("p",[s("strong",[t._v("Tree shaking 就是得益 ES modules 的发展的产物")]),t._v("：")]),t._v(" "),s("p",[t._v("ES Modules 之所以能 Tree-shaking 主要为以下四个原因（摘自尤雨溪在知乎的回答）:")]),t._v(" "),s("ul",[s("li",[t._v("import 只能作为模块顶层的语句出现，不能出现在 function 里面或是 if 里面。")]),t._v(" "),s("li",[t._v("import 的模块名只能是字符串常量。")]),t._v(" "),s("li",[t._v("不管 import 的语句出现的位置在哪里，在模块初始化的时候所有的 import 都必须已经导入完成。")]),t._v(" "),s("li",[t._v("import binding 是 immutable 的，类似 const。比如说你不能 import { a } from ‘./a’ 然后给 a 赋值个其他什么东西。")])]),t._v(" "),s("div",{staticClass:"custom-block warning"},[s("p",{staticClass:"custom-block-title"},[t._v("参考文献")]),t._v(" "),s("p",[s("a",{attrs:{href:"https://github.com/xuexueq/blog/issues/3",target:"_blank",rel:"noopener noreferrer"}},[t._v("js模块化编程不完全指北"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://juejin.cn/post/6844904066233925639#heading-6",target:"_blank",rel:"noopener noreferrer"}},[t._v("彻底理清 AMD,CommonJS,CMD,UMD,ES6"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://juejin.cn/post/6917810024253227021#heading-0",target:"_blank",rel:"noopener noreferrer"}},[t._v("一文搞懂JS模块、模块格式、模块加载器和模块打包器"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://juejin.cn/post/6907529287880933384#heading-23",target:"_blank",rel:"noopener noreferrer"}},[t._v("前端模块化发展历史"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://juejin.cn/post/6844903565236895758",target:"_blank",rel:"noopener noreferrer"}},[t._v("深入理解 ES6 模块机制"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://juejin.cn/post/6844904053676195847#heading-0",target:"_blank",rel:"noopener noreferrer"}},[t._v("[译]JavaScript 模块打包方案"),s("OutboundLink")],1)])])])}),[],!1,null,null,null);e.default=n.exports}}]);