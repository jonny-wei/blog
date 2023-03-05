(window.webpackJsonp=window.webpackJsonp||[]).push([[147],{604:function(v,t,e){"use strict";e.r(t);var _=e(15),r=Object(_.a)({},(function(){var v=this,t=v.$createElement,e=v._self._c||t;return e("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[e("h1",{attrs:{id:"vue-组件通信"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#vue-组件通信"}},[v._v("#")]),v._v(" Vue 组件通信")]),v._v(" "),e("p",[v._v("vue 组件间通信方式：")]),v._v(" "),e("h2",{attrs:{id:"props-emit"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#props-emit"}},[v._v("#")]),v._v(" props / $emit")]),v._v(" "),e("p",[v._v("常用的父子间通信方式。父组件向子组件传值，通过绑定属性来向子组件传入数据，子组件通过 Props 属性获取对应数据。")]),v._v(" "),e("ul",[e("li",[e("p",[v._v("适用场景：父组件传递数据给子组件")])]),v._v(" "),e("li",[e("p",[v._v("子组件设置 props 属性，定义接收父组件传递过来的参数")])]),v._v(" "),e("li",[e("p",[v._v("父组件在使用子组件标签中通过字面量来传递值")])]),v._v(" "),e("li",[e("p",[v._v("适用场景：子组件传递数据给父组件")])]),v._v(" "),e("li",[e("p",[v._v("子组件通过 "),e("code",[v._v("$emit")]),v._v(" 触发自定义事件，"),e("code",[v._v("$emit")]),v._v(" 第二个参数为传递的数值")])]),v._v(" "),e("li",[e("p",[v._v("父组件绑定监听器获取到子组件传递过来的参数")])])]),v._v(" "),e("h2",{attrs:{id:"emit-on"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#emit-on"}},[v._v("#")]),v._v(" $emit / $on")]),v._v(" "),e("p",[v._v("eventBus 中央事件总线")]),v._v(" "),e("p",[v._v("这个方法是通过创建了一个空的 vue 实例，当做 $emit 事件的处理中心（事件总线），通过他来触发以及监听事件，方便的实现了任意组件间的通信，包含父子，兄弟，隔代组件。")]),v._v(" "),e("ul",[e("li",[v._v("使用场景：兄弟组件传值")]),v._v(" "),e("li",[v._v("创建一个中央时间总线 EventBus")]),v._v(" "),e("li",[v._v("兄弟组件通过 "),e("code",[v._v("$emit")]),v._v(" 触发自定义事件，"),e("code",[v._v("$emit")]),v._v(" 第二个参数为传递的数值")]),v._v(" "),e("li",[v._v("另一个兄弟组件通过 "),e("code",[v._v("$on")]),v._v(" 监听自定义事件")])]),v._v(" "),e("h2",{attrs:{id:"attrs-listeners"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#attrs-listeners"}},[v._v("#")]),v._v(" $attrs / $listeners")]),v._v(" "),e("p",[v._v("Vue 2.4 版本后有了新方法。在创建高级别的组件或封装第三方组件时非常有用。")]),v._v(" "),e("ul",[e("li",[e("p",[e("code",[v._v("$attrs")])]),v._v(" "),e("p",[v._v("包含了父作用域中不作为 Prop 被识别 (且获取) 的特性绑定(Class 和 Style 除外)。当一个组件没有声明任何 Prop 时，这里会包含所有父作用域的绑定 (Class 和 Style 除外)，并且可以通过 "),e("code",[v._v('v-bind="$attrs"')]),v._v(" 传入内部组件。")])]),v._v(" "),e("li",[e("p",[e("code",[v._v("$listeners")])]),v._v(" "),e("p",[v._v("包含了父作用域中的 (不含 "),e("code",[v._v(".native")]),v._v("修饰器的) "),e("code",[v._v("v-on")]),v._v(" 事件监听器。它可以通过 "),e("code",[v._v('v-on="$listeners"')]),v._v(" 传入内部组件。")])]),v._v(" "),e("li",[e("p",[v._v("适用场景：祖先传递数据给子孙")])]),v._v(" "),e("li",[e("p",[v._v("设置批量向下传属性 "),e("code",[v._v("$attrs")]),v._v(" 和 "),e("code",[v._v("$listeners")])])]),v._v(" "),e("li",[e("p",[v._v("包含了父级作用域中不作为 prop 被识别 (且获取) 的特性绑定 ( class 和 style 除外)。")])]),v._v(" "),e("li",[e("p",[v._v("可以通过 "),e("code",[v._v('v-bind="$attrs"')]),v._v(" 传⼊内部组件")])])]),v._v(" "),e("h2",{attrs:{id:"provider-inject"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#provider-inject"}},[v._v("#")]),v._v(" Provider / Inject")]),v._v(" "),e("p",[v._v("Vue 2.2 版本以后新增了这两个 API 。 这对选项需要一起使用，以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在其上下游关系成立的时间里始终生效。")]),v._v(" "),e("p",[v._v("简单来说，就是父组件通过 Provider 传入变量，任意子孙组件通过 Inject 来拿到变量。")]),v._v(" "),e("p",[v._v("Provide 和 Inject 绑定并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的属性还是可响应的。")]),v._v(" "),e("p",[v._v("Provider / Inject 在项目中需要有较多公共传参时使用还是颇为方便的。传输数据父级一次注入，子孙组件一起共享的方式。")]),v._v(" "),e("ul",[e("li",[v._v("在祖先组件定义 provide 属性，返回传递的值")]),v._v(" "),e("li",[v._v("在后代组件通过 inject 接收组件传递过来的值")])]),v._v(" "),e("h2",{attrs:{id:"parent-children"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#parent-children"}},[v._v("#")]),v._v(" $parent / $children")]),v._v(" "),e("p",[v._v("指定已创建的实例之父实例，在两者之间建立父子关系。子实例可以用 "),e("code",[v._v("this.$parent")]),v._v(" 访问父实例，子实例被推入父实例的 "),e("code",[v._v("$children")]),v._v(" 数组中。不能跨级以及兄弟间通信。")]),v._v(" "),e("h2",{attrs:{id:"refs"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#refs"}},[v._v("#")]),v._v(" $refs")]),v._v(" "),e("p",[v._v("一个对象，持有注册过 ref 的所有 DOM 元素和组件实例。ref 被用来给元素或子组件注册引用信息。引用信息将会注册在父组件的 "),e("code",[v._v("$refs")]),v._v(" 对象上。如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件。不能跨级以及兄弟间通信。")]),v._v(" "),e("ul",[e("li",[v._v("父组件在使用子组件的时候设置 ref")]),v._v(" "),e("li",[v._v("父组件通过设置子组件 ref 来获取数据")])]),v._v(" "),e("h2",{attrs:{id:"vuex"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#vuex"}},[v._v("#")]),v._v(" Vuex")]),v._v(" "),e("p",[v._v("vue 状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。")]),v._v(" "),e("p",[v._v("Vuex 实现了一个单项数据流，通过创建一个全局的 State 数据，组件想要修改 State 数据只能通过 Mutation 来进行，例如页面上的操作想要修改 State 数据时，需要通过 Dispatch (触发 Action )，而 Action 也不能直接操作数据，还需要通过 Mutation 来修改 State 中数据，最后根据 State 中数据的变化，来渲染页面。")]),v._v(" "),e("p",[v._v("Mutation: 是修改 State 数据的唯一推荐方法，且只能进行同步操作。\nGetter: Vuex 允许在 Store 中定义 “ Getter”（类似于 Store 的计算属性）。Getter 的返回值会根据他的依赖进行缓存，只有依赖值发生了变化，才会重新计算。统一的维护了一份共同的 State 数据，方便组件间共同调用。")]),v._v(" "),e("ul",[e("li",[v._v("state 用来存放共享变量的地方")]),v._v(" "),e("li",[v._v("getter 可以增加一个 getter 派生状态，(相当于store中的计算属性），用来获得共享变量的值")]),v._v(" "),e("li",[v._v("mutations 用来存放修改 state 的方法。")]),v._v(" "),e("li",[v._v("actions 也是用来存放修改 state 的方法，不过 action 是在 mutations 的基础上进行。常用来做一些异步操作。")])]),v._v(" "),e("div",{staticClass:"custom-block tip"},[e("p",{staticClass:"custom-block-title"},[v._v("小结")]),v._v(" "),e("ul",[e("li",[e("p",[v._v("父子通信："),e("code",[v._v("Props/$emit")]),v._v("，"),e("code",[v._v("$emit/$on")]),v._v("，"),e("code",[v._v("Vuex")]),v._v("，"),e("code",[v._v("$attrs/$listeners")]),v._v("，"),e("code",[v._v("provide/inject")]),v._v("，"),e("code",[v._v("$parent/$children")]),v._v("，"),e("code",[v._v("$refs")])])]),v._v(" "),e("li",[e("p",[v._v("兄弟通信："),e("code",[v._v("$emit/$on")]),v._v("，"),e("code",[v._v("Vuex")])])]),v._v(" "),e("li",[e("p",[v._v("隔代（跨级）通信："),e("code",[v._v("$emit/$on")]),v._v("，"),e("code",[v._v("Vuex")]),v._v("，"),e("code",[v._v("provide/inject")]),v._v("，"),e("code",[v._v("$attrs/$listeners")])])])])])])}),[],!1,null,null,null);t.default=r.exports}}]);