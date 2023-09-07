(window.webpackJsonp=window.webpackJsonp||[]).push([[31],{331:function(t,s,a){"use strict";a.r(s);var n=a(6),e=Object(n.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"低代码扩展点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#低代码扩展点"}},[t._v("#")]),t._v(" 低代码扩展点")]),t._v(" "),s("h2",{attrs:{id:"简介"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#简介"}},[t._v("#")]),t._v(" 简介")]),t._v(" "),s("h3",{attrs:{id:"什么是扩展点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#什么是扩展点"}},[t._v("#")]),t._v(" 什么是扩展点")]),t._v(" "),s("p",[t._v("对于一个中后台 SaaS 应用来说，在标准产品设计阶段，提供的往往是产品的核心功能和标准化业务流程，而当 SaaS 产品需要交付给某个客户时，每个客户都或多或少需要对标品进行一些需求上的改动，如新增一些功能或屏蔽一些功能等，但站着产品设计的角度来说，哪些地方能够新增一些东西，哪些地方可以屏蔽，还有哪些地方是在任何时候都不能被改动的，都是在提供标品阶段就需要明确和设计好的。因此，针对产品定义好的这些在未来，可以基于租户或客户做差异化定制或扩展的地方，就被成为"),s("strong",[t._v("扩展点")]),t._v("。")]),t._v(" "),s("h3",{attrs:{id:"扩展点定义是什么"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#扩展点定义是什么"}},[t._v("#")]),t._v(" 扩展点定义是什么")]),t._v(" "),s("p",[t._v("对于一个产品上定义好的扩展点，在技术层面需要考虑的细节就会更多，比如一个扩展点需要有自己的编号或标识，需要有自己的描述或名称，同时还会有各方面的功能上的约束（可修改、可屏蔽等），因此，我们把对一个扩展点的标识、描述和功能约束，统称为"),s("strong",[t._v("扩展点定义")]),t._v("。")]),t._v(" "),s("p",[t._v("而标品的研发同学来实现上述扩展点定义的过程，也就是扩展开发方案生命周期的第一个阶段——扩展点定义阶段；")]),t._v(" "),s("h3",{attrs:{id:"扩展点实现是什么"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#扩展点实现是什么"}},[t._v("#")]),t._v(" 扩展点实现是什么")]),t._v(" "),s("p",[t._v("当一个标准SaaS产品需要被交付给最终客户使用的时候，有一个非常重要的工作——交付实施。在这个阶段里，需要基于前期SA对接时承诺的差异化需求，由交付实施同学，基于上一阶段定义好的各个扩展点，基于需求来实现这些差异化需求，如在屏蔽一些需要且可以被屏蔽的视图内容（该视图内容定义了一个可以被屏蔽的扩展点），或者在可以添加新内容的地方来新增一些视图和逻辑功能（该处位置定义了一个可以新增视图和逻辑的扩展点）等。这个针对已经被定义好的扩展点，结合客户需要进行扩展开发的交付实施过程，对应了方案生命周期的第二个阶段——扩展点实现阶段，这个动作最终实现的产物也就是我们说的扩展点实现。")]),t._v(" "),s("h2",{attrs:{id:"物料扩展"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#物料扩展"}},[t._v("#")]),t._v(" 物料扩展")]),t._v(" "),s("p",[t._v("物料是页面搭建的原料，按照粒度可分为组件、区块和模板：")]),t._v(" "),s("ol",[s("li",[t._v("组件：组件是页面搭建最小的可复用单元，其只对外暴露配置项，用户无需感知其内部实现；")]),t._v(" "),s("li",[t._v("区块：区块是一小段符合低代码协议的 schema，其内部会包含一个或多个组件，用户向设计器中拖入一个区块后可以随意修改其内部内容；")]),t._v(" "),s("li",[t._v("模板：模板和区块类似，也是一段符合低代码协议的 schema，不过其根节点的 componentName 需固定为 Page，它常常用于初始化一个页面；")])]),t._v(" "),s("p",[t._v("低代码编辑器中的物料需要进行一定的配置和处理，才能让用户在低代码平台使用起来。这个过程中，需要一份一份配置文件，也就是资产包。资产包文件中，针对每个物料定义了它们在低代码编辑器中的使用描述。")]),t._v(" "),s("div",{staticClass:"language-typescript line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" ReactRenderer "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'@ali/lowcode-react-renderer'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" ReactDOM "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'react-dom'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" Button "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'@alifd/next'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" schema "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  componentName"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Page'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  props"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  children"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      componentName"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Button'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      props"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        type"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'primary'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        style"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n          color"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'#2077ff'")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      children"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'确定'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" components "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  Button"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\nReactDOM"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("render")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("ReactRenderer\n    schema"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("schema"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    components"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("components"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getElementById")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'root'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br"),s("span",{staticClass:"line-number"},[t._v("20")]),s("br"),s("span",{staticClass:"line-number"},[t._v("21")]),s("br"),s("span",{staticClass:"line-number"},[t._v("22")]),s("br"),s("span",{staticClass:"line-number"},[t._v("23")]),s("br"),s("span",{staticClass:"line-number"},[t._v("24")]),s("br"),s("span",{staticClass:"line-number"},[t._v("25")]),s("br"),s("span",{staticClass:"line-number"},[t._v("26")]),s("br"),s("span",{staticClass:"line-number"},[t._v("27")]),s("br"),s("span",{staticClass:"line-number"},[t._v("28")]),s("br"),s("span",{staticClass:"line-number"},[t._v("29")]),s("br"),s("span",{staticClass:"line-number"},[t._v("30")]),s("br"),s("span",{staticClass:"line-number"},[t._v("31")]),s("br")])]),s("p",[t._v("资产包是什么？")]),t._v(" "),s("div",{staticClass:"language-typescript line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Assets")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  version"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("string")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 资产包协议版本号")]),t._v("\n  packages"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("Array")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("Package"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 大包列表，external与package的概念相似，融合在一起")]),t._v("\n  components"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("Array")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("ComponentDescription"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("Array")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("RemoteComponentDescription"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 所有组件的描述协议列表")]),t._v("\n  sort"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" ComponentSort"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 新增字段，用于描述组件面板中的 tab 和 category")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ComponentSort")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  groupList"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" String"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v('// 用于描述组件面板的 tab 项及其排序，例如：["精选组件", "原子组件"]')]),t._v("\n  categoryList"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" String"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 组件面板中同一个 tab 下的不同区间用 category 区分，category 的排序依照 categoryList 顺序排列；")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("RemoteComponentDescription")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  exportName"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("string")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 组件描述导出名字，可以通过 window[exportName] 获取到组件描述的 Object 内容；")]),t._v("\n  url"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("string")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 组件描述的资源链接；")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("package")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 组件(库)的 npm 信息；")]),t._v("\n    npm"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("string")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br")])]),s("p",[t._v("中后台前端体系中，存在大量的组件，程序员可以通过阅读文档，知悉组件的用法。可是搭建平台无法理解 README，而且很多时候，README 里并没有属性列表。这时，我们需要一份额外的描述，来告诉低代码搭建平台，组件接受哪些属性，又是该用怎样的方式来配置这些属性，于是，"),s("a",{attrs:{href:"http://lowcode-engine.cn/material",target:"_blank",rel:"noopener noreferrer"}},[s("strong",[t._v("《中后台低代码组件描述协议》")]),s("OutboundLink")],1),t._v("应运而生。协议主要包含三部分：基础信息、属性信息 props、能力配置/体验增强 configure。")]),t._v(" "),s("ol",[s("li",[t._v("物料配置")])]),t._v(" "),s("p",[t._v("就是产出一份符合"),s("a",{attrs:{href:"http://lowcode-engine.cn/material",target:"_blank",rel:"noopener noreferrer"}},[s("strong",[t._v("《中后台低代码组件描述协议》")]),s("OutboundLink")],1),t._v("的 JSON Schema。如果需要补充属性描述信息，或需要定制体验增强部分（如修改 Setter、调整展示顺序等），就可以通过修改这份 Schema 来实现。目前有自动生成、手工配置这两种方式生成物料描述配置。")]),t._v(" "),s("ol",[s("li",[t._v("自动生成物料描述")])]),t._v(" "),s("p",[t._v("可以使用官方提供的 "),s("code",[t._v("@alilc/lowcode-material-parser")]),t._v(" 解析本地组件，自动生成物料描述。把物料描述放到资产包定义中，就能让低代码引擎理解如何制作物料")]),t._v(" "),s("ol",[s("li",[t._v("手工配置物料描述")])]),t._v(" "),s("p",[t._v("如果自动生成的物料无法满足需求，我们就需要手动配置物料描述。")]),t._v(" "),s("ol",[s("li",[t._v("进阶配置")])]),t._v(" "),s("ul",[s("li",[t._v("组件的 children 属性允许传入 ReactNode：isContainer、childWhitelist")]),t._v(" "),s("li",[t._v("组件的非 children 属性允许传入 ReactNode：SlotSetter、createSlot")]),t._v(" "),s("li",[t._v("屏蔽组件在设计器中的操作按钮：disableBehaviors")])]),t._v(" "),s("ol",[s("li",[t._v("高级配置")])]),t._v(" "),s("ul",[s("li",[t._v("props 联动")]),t._v(" "),s("li",[t._v("动态 setter 配置")])]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.yuque.com/lce/doc/funcv8",target:"_blank",rel:"noopener noreferrer"}},[t._v("物料扩展"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.yuque.com/mark.ck/blog/kk06ev",target:"_blank",rel:"noopener noreferrer"}},[t._v("前端物料在低代码研发模式下的探索"),s("OutboundLink")],1)]),t._v(" "),s("h2",{attrs:{id:"设置器扩展"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#设置器扩展"}},[t._v("#")]),t._v(" 设置器扩展")]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.yuque.com/lce/doc/cl03wo_nmhznb",target:"_blank",rel:"noopener noreferrer"}},[t._v("设置器扩展"),s("OutboundLink")],1)]),t._v(" "),s("h2",{attrs:{id:"插件扩展"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#插件扩展"}},[t._v("#")]),t._v(" 插件扩展")]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.yuque.com/lce/doc/tbgyp3",target:"_blank",rel:"noopener noreferrer"}},[t._v("插件扩展 - 面板扩展"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.yuque.com/lce/doc/eahwvb",target:"_blank",rel:"noopener noreferrer"}},[t._v("插件扩展 - 编排扩展"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.yuque.com/siluhuayu/kb/waxppg",target:"_blank",rel:"noopener noreferrer"}},[t._v("数据源面板"),s("OutboundLink")],1)]),t._v(" "),s("h2",{attrs:{id:"运行时扩展"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#运行时扩展"}},[t._v("#")]),t._v(" 运行时扩展")]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.yuque.com/lce/doc/nhilce",target:"_blank",rel:"noopener noreferrer"}},[t._v("使用渲染模块"),s("OutboundLink")],1),t._v(" "),s("a",{attrs:{href:"https://www.yuque.com/lce/doc/cplfv0",target:"_blank",rel:"noopener noreferrer"}},[t._v("使用出码功能"),s("OutboundLink")],1)])])}),[],!1,null,null,null);s.default=e.exports}}]);