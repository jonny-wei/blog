# 初始化与模块安装

上一章节我们有讲到 vuex 的使用，现在来回顾一下：
```javascript
// store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({ ... })
```

如你所见 Vuex 也是使用 vue 的 [插件机制](/vue/vue-router/plugin.html)。`import Vuex from 'vuex'` 这句主要将 `vuex` 的 `src/index.js` 中 `export` 
的方法导入进来。`Vue.use(Vuex)` 执行这句将自动调用 `vuex` 暴露的 `install` 方法进行 `vuex` 的安装或者叫注册。再接着 `new Vuex.Store({ ... })` 
执行 `vuex` 暴露的 `Store` 方法，实例化一个 `store`，完成初始化。


## 入口文件

vuex 暴露的方法在入口文件 `src/index.js` 文件中，下面具体看一下

```javascript
/* src/index.js */

import { Store, install } from './store'
import { mapState, mapMutations, mapGetters, mapActions, 
createNamespacedHelpers } from './helpers'

export default {
  Store, // Store vuex的核心 去初始化一个 store
  install, // vuex 插件安装 Vue.use(Vuex) 时自动调用
  version: '__VERSION__',
  /* 4 个辅助函数 */
  mapState, 
  mapMutations,
  mapGetters,
  mapActions,
  /* 命名空间 */
  createNamespacedHelpers
}
```
此外，`vuex` 还有一个入口文件 `src/index.esm.js`：

```javascript
/* src/index.esm.js */

import { Store, install } from './store'
import { mapState, mapMutations, mapGetters, mapActions,
 createNamespacedHelpers } from './helpers'

export default {
  Store,
  install,
  version: '__VERSION__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
}

export {
  Store,
  install,
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
}

```
基本和 `src/index.js` 一样，这个文件主要用于 `es module` 的打包，而 ` src/index.js` 用于 `commonjs` 的打包

到这儿，我们也就清楚的知道了 `vuex` 的安装与初始化的 在 `src/store.js` 中,下面先具体分析一下 **vuex的安装**。

## 安装

```javascript
/* src/store.js */
import applyMixin from './mixin'

/* 暴露install方法，供Vue.use调用安装插件 */
export function install (_Vue) {
  /**
  * 判断是否已安装过 避免重复安装
  * 存在Vue实例_Vue 代表已安装 直接return 否则继续执行下面的代码
  */
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  /**
  * 保存 Vue 实例，给当前作用域提供Vue
  * 这里把 install 方法的参数 _Vue 对象赋值给 Vue 变量
  * 这样我们就可以在 index.js 文件的其它地方使用 Vue 这个变量了
  * 好处是不在import Vue (在Vue-Router也是这样处理的 作用在源码分析中也说过)
  */
  Vue = _Vue
   /* 将 vuexInit 混入进Vue的beforeCreate */
  applyMixin(Vue)
}
```
可以看到 `install` 中调用了` applyMixin(Vue)` 参数是` Vue 实例`

### applyMixin 的实现

```javascript
/* src/mixin.js */

export default function (Vue) {
   /* 获取Vue版本，判断 Vue1.0 还是 Vue2.0 */
  const version = Number(Vue.version.split('.')[0])
  /* 如果是 vue 2.0+*/
  if (version >= 2) {
    /* 通过mixin将 vuexInit 混入到 Vue实例 的 beforeCreate 钩子中 */
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // 覆盖init并注入vuex init方法中 (vue1.0提供的init)
    // for 1.x backwards compatibility.
    /* 将vuexInit放入_init中调用 */
    const _init = Vue.prototype._init
    // _init 方法
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   * Vuex初始化钩子，注入到每个实例的初始化挂钩子列表中。
   */
  function vuexInit () {
    const options = this.$options
    // store injection 向 Vue 实例注入 store  让所有组件都拥有 $store 属性，
    // 指向根实例的 store 对象
    // 根组件从这里拿到store
    /* 判断是否存在store 当我们在执行 new Vue 的时候，需要提供store字段 存在代表是 root 节点*/
    if (options.store) {
      /**
      * 存在store 
      * 如果是个function 则执行 store() 方法
      * 如果不是function 则直接使用store
      */
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      /**
      * 否则拿 parent 上的 $store 从而实现所有组件共用一个 store实例
      * 子组件从父组件拿到，这样一层一层传递下去，实现所有组件都有$store属性，
      * 这样我们就可以在任何组件中通过this.$store访问到store
      */
      this.$store = options.parent.$store
    }
  }
}
```
这段代码的作用就是在 Vue 的**生命周期**中的**初始化**（1.0 版本是 init，2.0 版本是 `beforeCreated`）钩子前插入一段 Vuex 初始化代码。
这里做的事情很简单——给 Vue 的实例注入一个` $store` 的属性，这就是为什么我们在 Vue 的组件中可以通过 `this.$store` 访问到 Vuex 的各种数据和状态。

## 实例化 Store 

```javascript
// store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({ ... })

const app = new Vue({
  store  // store: store
}).$mount('#app')
```

我们在导入 Vuex 之后，通过 `Vue.use(Vuex)` 安装后，接着会`实例化 Store 对象`，返回 `store 实例`，
最后传入`new Vue` 的 `options` 中，也就是我们刚才提到的 `options.store`。下面具体分析一下 vuex 的核心 **实例化 Store**：

### Store 类

首先还是先看看代码骨架，从整体认识：

```javascript
/* src/store.js */

/* Store构造类 */
export class Store {
  constructor (options = {}) { ... }
  
  /* 将 store.state 即 rootState 代理到之前声明的 vm 实例中的 $state 中 */
  get state () { ... }
  
  set state (v) { ... }
  /**
  * 提交 mutation。支持载荷方式和对象方式进行提交
  * 参数
  *   _type：一个字符串的 事件类型
  *   _payload：载荷 store.commit 时传入额外的参数 在大多数情况下，载荷应该是一个对象
  *   _options：options 里可以有 root: true，它允许在命名空间模块里提交根的 mutation
  */
  commit (_type, _payload, _options) { ... }
  /**
  * 分发 action。支持同样的载荷方式和对象方式进行分发
  * 参数
  *   _type：一个字符串的 事件类型
  *   _payload：载荷 store.dispatch 时传入额外的参数 在大多数情况下，载荷应该是一个对象
  *   返回一个解析所有被触发的 action 处理器的 Promise。
  */ 
  dispatch (_type, _payload) { ... }
  /**
  * 注册一个 mutation 订阅函数，返回取消订阅的函数
  * 通常用于插件
  */
  subscribe (fn) { ... }
  /**
  * 注册一个 action 订阅函数 2.5.0 新增
  * 从 3.1.0 起，subscribeAction 也可以指定订阅处理函数的被调用时机
  * 应该在一个 action 分发之前还是之后 (默认行为是之前)
  * 常用于插件
  */
  subscribeAction (fn) { ... }
  /**
  * 观察一个getter方法
  * @param getter getter方法
  * @param cb 回调函数 当getter值改变时调用
  * @param options 可选的对象参数表示 Vue 的 vm.$watch 方法的参数
  * 要停止侦听，调用此方法返回的函数即可停止侦听。
  */
  watch (getter, cb, options) { ... }
  /* 重置state 替换 store 的根状态，仅用状态合并或时光旅行调试 */
  replaceState (state) { ... }
  /**
  * 注册一个动态模块
  * 当业务进行异步加载的时候，可以通过该接口进行注册动态module
  * @param path
  * @param rawModule
  * @param options 可以包含 preserveState: true 以允许保留之前的 state。用于服务端渲染
  */
  registerModule (path, rawModule, options = {}) { ... }
  /* 卸载一个动态模块 */
  unregisterModule (path) { ... }
  /* 热替换新的 action 和 mutation */
  hotUpdate (newOptions) { ... }
  /* 保证通过mutation修改store的数据 */
  _withCommit (fn) { ... }
}
```
### Store 类构造方法

```javascript
/* src/store.js */

/**
* 构造函数
* 参数：一个对象参数
* { state,getters, mutations,actions,modules,...}
*/
constructor (options = {}) {
    // Auto install if it is not done yet and `window` has `Vue`.
    // To allow users to avoid auto-installation in some cases,
    // this code should be placed here. See #731
    /**
    * 如果尚未安装且`window`具有`Vue`，则自动安装。为了在某些情况下允许用户避免自动安装，
    * 挂载在window上的自动安装，也就是通过script标签引入时不需要手动调用Vue.use(Vuex)
    */
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    if (process.env.NODE_ENV !== 'production') {
      // 断言必须使用Vue.use(Vuex),在install方法中会给Vue赋值
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      // 断言必须存在Promise
      assert(typeof Promise !== 'undefined', `vuex requires a Promise 
      polyfill in this browser.`)
      // 断言必须使用new操作符
      assert(this instanceof Store, `store must be called with the new operator.`)
    }

    /* ES6的解构赋值拿到的 options(用户配置的) 中的 plugins 和 strict  */
    const {
      /**
      * 一个数组，包含应用在 store 上的插件方法。这些插件直接接收 store 作为唯一参数，
      * 可以监听 mutation（用于外部地数据持久化、记录或调试）
      * 或者提交 mutation （用于内部数据，例如 websocket 或 某些观察者） 
      * 插件默认是空数组
      */
      plugins = [],
       /* 使 Vuex store 进入严格模式，在严格模式下，
       任何 mutation 处理函数以外修改 Vuex state 都会抛出错误。*/
      strict = false
    } = options

    // store internal state 以下 初始化store内部状态 
    /* 用来判断严格模式下是否是用mutation修改state的 */
    this._committing = false
    /* 存放action Object.create(null) 创建空对象*/
    this._actions = Object.create(null)
    /* 保存订阅action的回调 */
    this._actionSubscribers = []
    /* 存放mutation */
    this._mutations = Object.create(null)
    /* 保存包装后的getter */
    this._wrappedGetters = Object.create(null)
    /* module收集器 保存一棵module树 vuex支持模块，
    即将state通过key-value的形式拆分为多个模块*/
    this._modules = new ModuleCollection(options)
    /* 根据namespace存放module 保存namespaced的模块 */
    this._modulesNamespaceMap = Object.create(null)
    /* 保存订阅mutation的回调 用于监听mutation 监听队列，当执行commit时会执行队列中的函数 */
    this._subscribers = []
     /* 使用 $watch 观测 getters 用于响应式地监测一个 getter 方法的返回值 监控state的改变*/
    this._watcherVM = new Vue()
    /* 用来存放生成的本地 getters 的缓存 */
    this._makeLocalGettersCache = Object.create(null)

    // bind commit and dispatch to self
    const store = this
    /**
    * 将dispatch与commit调用的this绑定为store对象本身，
    * 否则在组件内部this.dispatch时的this会指向组件的vm
    */
    const { dispatch, commit } = this
     /* 定义dispatch方法 为dispatch与commit绑定this（Store实例本身）*/
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      /* 定义commit方法 */
      return commit.call(store, type, payload, options)
    }

    // strict mode
    /**
    * 严格模式(使 Vuex store 进入严格模式
    * 严格模式下，任何 mutation 处理函数以外修改 Vuex state 都会抛出错误
    */
    this.strict = strict

    const state = this._modules.root.state

    // init root module.
    // this also recursively registers all sub-modules
    // and collects all module getters inside this._wrappedGetters
    /**
    * 初始化根module，这也同时递归注册了所有子module，
    * 收集所有module的getter到_wrappedGetters中去，
    * this._modules.root代表根module才独有保存的Module对象
    * 根据命名空间注册 state,actions,mutations,getters，并且提供访问当前模块的便捷方法（local）
    * installModule 方法是把我们通过 options 传入的各种属性模块注册和安装
    */
    installModule(this, state, [], this._modules.root)

    // initialize the store vm, which is responsible for the reactivity
    // (also registers _wrappedGetters as computed properties)
    /*
    * 新建一个vm实例保存state，在computed属性中保存getters，
    * 通过watch观察state，保证都使用commit修改state
    * 通过vm重设store，新建Vue对象使用Vue内部的响应式实现注册state以及computed
    * 初始化 store._vm，观测 state 和 getters 的变化
    * */
    resetStoreVM(this, state)

    // apply plugins 调用插件
    /* 执行插件，plugins前面已定义 是一个数组，遍历然后执行每个插件的函数 */
    plugins.forEach(plugin => plugin(this))

    /* devtool插件 */
    // 如果开启了开发工具，也会把实例对象传给开发工具。
    const useDevtools = options.devtools !== undefined ? options.devtools : 
    Vue.config.devtools
    if (useDevtools) {
      devtoolPlugin(this)
    }
  }
```
#### 断言判断

断言函数 `assert()`：断言就是当不满足某些条件时，会抛出错误，用于对一些条件进行校验。

```javascript
/* /src/util.js */

export function assert (condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`)
}
```
`Store` 构造函数中做了以下断言：
```javascript
if (process.env.NODE_ENV !== 'production') {
      // 断言必须使用Vue.use(Vuex),在install方法中会给Vue赋值
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      // 断言必须存在Promise
      assert(typeof Promise !== 'undefined', `vuex requires a Promise 
      polyfill in this browser.`)
      // 断言必须使用new操作符
      assert(this instanceof Store, `store must be called with the new operator.`)
    }
```
- **第一个**  是确保创建实例前已经在 `Vue` 中注册了 `Vuex`，也就是 `Vue.use(Vuex)`,前面也说过，当我们在调用 `Vue.use()` 函数时，
会调用 Vuex 的 `install()` 函数，来给 Vue 的实例**注入初始化函数**，初始化函数会在 **vue 实例化过程中执行**，
然后给 `Vue实例` 注入一个 `$store` 的属性，保证我们可以通过通过 `this.$store` 访问到 Vuex 的各种数据和状态。
所以如果在 `new Vue()` 之后再去 `Vue.use(Vuex)` 的话，**初始化函数**并没有挂在到 Vue 上， `$store` 属性就无法添加到 Vue 的实例化对象上。

- **第二个**  是为了确保 `Promsie` 可以使用的，因为 Vuex 的源码是依赖 `Promise` 的。`Promise` 是 `ES6` 提供新的 API，
由于现在的浏览器并不是都支持 ES6 语法的，所以通常我们会用 `Babel` 编译我们的代码，如果想使用 `Promise` 这个 特性，
我们需要在 `package.json` 中添加对 `babel-polyfill` 的依赖并在代码的入口加上 `import 'babel-polyfill'` 这段代码。

- **第三个**  是验证**调用方**是否是通过 `new` 出来的，也就是说**是否是 Store 的原型**，防止通过直接调用 `Stroe()` 这样，把 `Store` 当成普通函数来调用。

构造函数中除了创建了一些内部属性初始化 `store` 内部状态外，最重要的做了三件事：

- **`ModuleCollection`**：  模块收集器，保存一棵 `module` 树，初始化模块
- **`installModule`**： 安装模块，初始化`根 module`，这也同时递归注册了所有`子 module`。
- **`resetStoreVM`**：新建一个 `vm实例` 保存 `state`，用于初始化 `store._vm `

下面就先从这三件事开始深入分析

### 模块收集器

在上一章节中我们提到过 `vuex的模块`，模块 `modules`：类似于命名空间，用于项目中将各个模块的状态分开定义和操作，便于维护。
由于 `vuex` 使用单一状态树，应用的所有状态会集中到一个比较大的对象 `Store` 中，当应用变得非常复杂时，`store` 对象就有可能变得相当臃肿。
为了解决以上问题，vuex支持模块，即将 `store` 通过 `key-value` 的形式拆分为多个模块（module）。
每个模块拥有自己的 `state、getter、mutation、action` 甚至` module 子模块`，这样的话模块的设计就是一个树型结构，
`store` 本身可以理解为一个 `root module 根模块`，它下面的 `modules` 就是子模块，Vuex 需要完成这颗树的构建，构建过程的入口就是：
**`this._modules = new ModuleCollection(options)`**。

下面具体分析 `ModuleCollection` 的实现：

```javascript
/* src/module/module-collection.js */

/* module收集类 */
export default class ModuleCollection {
  constructor (rawRootModule) {
    // register root module (Vuex.Store options)
    /**
    *  将 new Vuex.Store 传入的用户配置项作为参数 通过 rawRootModule 传入
    *  即 { strict,state,getters mutations,actions,modules,plugins}
    */
    this.register([], rawRootModule, false)
  }

  /**
  * 根据 path 获取 module， register中会调用
  * 根据传入的 path （数组），递归的遍历，不断的从模块的子模块中找
  * 直到 path 遍历完毕，找到这个 path 数组最后一个元素对应的模块
  */
  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }
  
  /**
  * 获取namespace 命名空间，当namespaced为true的时候会 
  * 将当前模块的属性名拼接到整个 namespace 组成的字符串中
  * 返回'moduleName/name'
  * 并且这个模块下面所有的 actions/mutations/getters 都会加上 namespace 前缀
  * 这样使得多个模块能够对同一 mutation 或 action 作出响应。
  * 如果希望你的模块更加自包含或提高可重用性，
  * 你可以通过添加 namespaced: true 的方式使其成为命名空间模块。
  * 当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。
  */
  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }

  update (rawRootModule) {
    update([], this.root, rawRootModule)
  }
  /**
  * 根据配置项生成 ModuleCollection 实例，即所有模块集合
  * 一般一个 Vuex 实例只有一个模块集合，一个模块集合又有多个模块实例组成
  * runtime 为 true 时，代表动态注入的模块，初始化时传入 false
  */
  register (path, rawModule, runtime = true) {
    if (process.env.NODE_ENV !== 'production') {
      assertRawModule(path, rawModule)
    }

    /* 实例化一个module 传入当前 Module 的配置项 */
    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) {
      /* path为空数组的代表跟节点 将根module 绑定到root属性上 
      定义唯一的一个实例属性 root，指向根 module 实例*/
      this.root = newModule
    } else {
      /**
      *  获取父级module 找到当前模块的父模块
      *  path.slice(0, -1) 为除去最后一个元素的 path 数组，即当前模块父模块的 path 数组
      */
      const parent = this.get(path.slice(0, -1))
      /**
      * 在父module中插入一个子module
      * 给当前模块的父模块的 _children 属性添加当前模块
      * 即注册子模块 
      */
      parent.addChild(path[path.length - 1], newModule)
    }

    // register nested modules 
    // 递归注册当前 module 的子 modules 遍历子模块，逐个注册，最终形成一个树
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        /**
        * 将 path 数组合并上当前模块子模块的属性名，
        * 传入递归 register 函数中，作为模块的前缀（命名空间）
        */
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }
  /* 注销 */
  unregister (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]
    if (!parent.getChild(key).runtime) return

    parent.removeChild(key)
  }
}
```
`ModuleCollection` 实例化的过程就是执行了 `register` 方法， `register` 接收 3 个参数：
- **`path`**  表示路径，因为我们整体目标是要构建一颗模块树，path 是在构建树的过程中维护的路径
- **`rawModule`**  表示定义模块的原始配置
- **`runtime`**  表示是否是一个运行时创建的模块

`register` 方法中传入当前 Module 的配置项并实例化一个 Module，下面具体分析 实例化 Module 的过程

### Module 类

```javascript
/* src/module/module.js */


// Base data struct for store's module, package with some attribute and method
/**
*  Module 实例
*  _children（当前模块子模块实例组成的数组）
*  _rawModule当前模块的最初的定义（用户定义）
*/
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // Store some children item 
    /* 存放 当前模块的子模块实例 用于保存子模块*/
    this._children = Object.create(null)
    // Store the origin module object which passed by programmer
    /* 保存module 保存用户传递的原始模块对象*/
    this._rawModule = rawModule
    /* 保存modele的state */
    const rawState = rawModule.state

    // Store the origin module's state 前模块的最初定义的state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }
  /* 获取namespace */
  get namespaced () {
    return !!this._rawModule.namespaced
  }
  /* 插入一个子module，存入_children中 */
  addChild (key, module) {
    // 将子模块添加到_children中
    this._children[key] = module
  }
 /* 移除一个子module */
  removeChild (key) {
    delete this._children[key]
  }
  /* 根据key获取子module */
  getChild (key) {
    return this._children[key]
  }
  /* 更新module */
  update (rawModule) {
    this._rawModule.namespaced = rawModule.namespaced
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters
    }
  }
   /* 遍历child */
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }
  /* 遍历getter */
  forEachGetter (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }
  /* 遍历action */
  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }
  /* 遍历matation */
  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}
```
来看一下 Module 的构造函数，对于每个模块而言：
- **`this.runtime`**  表示是否是一个运行时创建的模块
- **`this._rawModule`**  表示模块的配置
- **`this._children`**  表示它的所有子模块
- **`this.state`**  表示这个模块定义的 state

回到 register 方法，在实例化一个 Module 后，接着判断当前的 path 的长度，如果为 0 则说明它是一个根模块，
就把 `newModule` 赋值给了 `this.root` （定义唯一的一个实例属性 root，指向根 module 实例），否则就需要建立父子关系了：

```javascript
/* src/module/module-collection.js */

  /**
  *  根据path获取父级module 找到当前模块的父模块
  *  path.slice(0, -1) 为除去最后一个元素的 path 数组，即当前模块父模块的 path 数组
  */
   const parent = this.get(path.slice(0, -1))
   /**
   * 在父module中插入一个子module
   * 给当前模块的父模块的 _children 属性添加当前模块
   * 即注册子模块 
   */
   parent.addChild(path[path.length - 1], newModule)
```
首先根据路径获取到父模块，然后再调用父模块的 `addChild` 方法建立父子关系。

最后，是递归调用 register 方法 遍历当前模块定义中的所有 modules，**根据 key 作为 path，递归调用 register 方法**。
```javascript
/* src/module/module-collection.js */

  // register nested modules 
  // 递归注册当前 module 的子 modules 遍历子模块，逐个注册，最终形成一个树
  if (rawModule.modules) {
    forEachValue(rawModule.modules, (rawChildModule, key) => {
      /**
      * 将 path 数组合并上当前模块子模块的属性名，
      * 传入递归 register 函数中，作为模块的前缀（命名空间）
      */
      this.register(path.concat(key), rawChildModule, runtime)
    })
  }
```
这样我们再回过头看一下建立父子关系的逻辑，首先执行了 `this.get(path.slice(0, -1)` 方法：

```javascript
/* src/module/module-collection.js */

 /**
  * 根据 path 获取 module 
  * 根据传入的 path （数组），递归的遍历，不断的从模块的子模块中找
  * 直到 path 遍历完毕，找到这个 path 数组最后一个元素对应的模块
  */
  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }
```
传入的 `path` 是它的**父模块**的 `path`，然后从**根模块**开始，通过 `reduce` 方法一层层去找到对应的模块，
查找的过程中，执行的是` module.getChild(key)` 方法：

```javascript
/* src/module/module.js */

/* 根据key获取子module */
getChild (key) {
    return this._children[key]
  }
```
其实就是返回当前模块的 _`children` 中对应 `key` 的模块，那么每个模块的 __children 是如何添加的呢_，
是通过执行 `parent.addChild(path[path.length - 1], newModule)` 方法：

```javascript
/* src/module/module.js */

/* 插入一个子module，存入_children中 */
  addChild (key, module) {
    this._children[key] = module
  }
```
所以说对于 root module 的下一层 modules 来说，它们的 parent 就是 root module，
那么他们就会被添加的 root module 的 _children 中。
每个子模块通过路径找到它的父模块，然后通过父模块的 `addChild` 方法建立父子关系，
递归执行这样的过程，最终就建立一颗完整的模块树。

到此，我们分析了 `Module 类` 和 `ModuleCollection 类`的 register 方法，这也意味着 ModuleCollection 类及其构造方法分析完了。
整个过程就是 `this._modules = new ModuleCollection(options)` vuex 模块树的构建过程，即初始化模块。

## 模块安装

初始化模块后，执行安装模块的相关逻辑，初始化根module，这也同时递归注册了所有子module。
它的作用就是对模块中的 state、getters、mutations、actions以及 子module 做初始化工作。

```javascript
/* src/store.js */

  const state = this._modules.root.state

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  /**
  * 初始化根module，这也同时递归注册了所有子module，
  * 收集所有module的getter到_wrappedGetters中去，
  * this._modules.root代表根module才独有保存的Module对象
  * 根据命名空间注册 state,actions,mutations,getters，并且提供访问当前模块的便捷方法（local）
  */
  installModule(this, state, [], this._modules.root)
```
执行 `installModule` 方法，`installModule` 方法是把我们通过 `options` 传入的各种属性模块注册和安装

### installModule 的实现
```javascript
/* src/store.js */

/**
* 这里是module处理的核心，包括处理根module、命名空间、action、mutation、getters和递归注册子module
* @param store 传入的 this 即root store
* @param rootState 传入的 state 即root state
* @param path 传入的 [] 模块的访问路径 即path数组 初始为空 之后若有命名空间会转为命名空间组成的数组
* @param module 传入的 this._modules.root 当前的模块
* @param hot 是否热更新
*/
function installModule (store, rootState, path, module, hot) {
  /* 是否是根module path为空数组的代表跟节点 */
  const isRoot = !path.length
 
  /* 获取module的namespace */
  /* 根据 path 数组获取命名前缀，根模块为空字符串
   * {
   *   // ...
   *   modules: {
   *     moduleA: {
   *       namespaced: true
   *     },
   *     moduleB: {}
   *   }
   * }
   * moduleA的namespace -> 'moduleA/'
   * moduleB的namespace -> ''
   * 设置了 namespaced 的模块会根据嵌套的层级拼接（a/b/c/）
   */
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  /**
  * 如果有namespace则在_modulesNamespaceMap中注册
  * 生成 _modulesNamespaceMap 对象，存放 namespaced 为 true 的模块
  * 属性名是所有的父级 module 名 +  '/'，值为当前注册的 module 实例
  * 通过加上父级模块的路径，保证了每个模块都有自己的命名空间，
  * 防止名字相同的 getter/actions/mutations 命名冲突
  */
  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate namespace ${namespace} 
      for the namespaced module ${path.join('/')}`)
    }
    // 保存namespaced模块
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  /* 添加当前模块，作为父模块的 state 对象中的属性，在 state 中建立父子关系 */
  if (!isRoot && !hot) {
     /* 获取父级的state */
    const parentState = getNestedState(rootState, path.slice(0, -1))
     /* 模块名称 */
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      if (process.env.NODE_ENV !== 'production') {
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden 
            by a module with the same name at "${path.join('.')}"`
          )
        }
      }
      /**
      * 在父模块的 state 属性中添加当前模块，属性名是当前模块名，值是 state 对象
      * Vuex 之所以这么做可能是因为需要让所有的模块状态都保存在 state 中
      * 使得在重置模块时能够通过保留 state 从而保留所有的模块依赖关系
      * 将子module设置称响应式的
      */
      Vue.set(parentState, moduleName, module.state)
    })
  }
  /**
  * 给当前模块添加 context 属性，即 action 的第一个参数 ctx
  * ctx 中的 dispatch 会添加当前模块的命名空间
  * 再执行全局的 dispatch 去 _actions 中找到对应的 action
  * local 返回的是一个含有 dispatch,commit,getters,state 的对象，即 ctx
  */
  const local = module.context = makeLocalContext(store, namespace, path)
  /* 遍历注册mutation */
  module.forEachMutation((mutation, key) => {
    /* mutation 是 mutations 中定义的函数，key 为这个 mutation 函数的 key */
    const namespacedType = namespace + key
    /* 给 store 的 _mutations 对象添加当前模块包含的所有 mutations */
    registerMutation(store, namespacedType, mutation, local)
  })
  /* 遍历注册action */
  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })
  /* 遍历注册getter */
  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })
  /**
  * 递归注册子模块，建立 module 树，并且给 path 数组推入当前命名空间（字符串）
  * 此时所有的子模块中的 state，actions，mutations，getters 都被注册完毕
  */
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```
`installModule` 方法支持 5 个参数，store、rootState、path、module、hot。
- `store` 表示当前 Store 实例
- `rootState` 表示根 state
- `path` 表示当前嵌套模块的路径数组 
- `module` 表示当前安装的模块
- `hot` 当动态改变 modules 或者热更新的时候为 true


### 命名空间

接下来看函数逻辑，这里涉及到了**命名空间**的概念，默认情况下，模块内部的 action、mutation 和 getter 是注册在全局命名空间的
——这样使得多个模块能够对同一 mutation 或 action 作出响应。如果希望你的模块具有更高的封装度和复用性，
你可以通过添加 `namespaced: true` 的方式使其成为**带命名空间的模块**。
当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。例如：

```javascript
const store = new Vuex.Store({
  modules: {
    account: {
      namespaced: true,

      // 模块内容（module assets）
      state: { ... }, // 模块内的状态已经是嵌套的了，使用 `namespaced` 属性不会对其产生影响
      getters: {
        isAdmin () { ... } // -> getters['account/isAdmin']
      },
      actions: {
        login () { ... } // -> dispatch('account/login')
      },
      mutations: {
        login () { ... } // -> commit('account/login')
      },

      // 嵌套模块
      modules: {
        // 继承父模块的命名空间
        myPage: {
          state: { ... },
          getters: {
            profile () { ... } // -> getters['account/profile']
          }
        },

        // 进一步嵌套命名空间
        posts: {
          namespaced: true,

          state: { ... },
          getters: {
            popular () { ... } // -> getters['account/posts/popular']
          }
        }
      }
    }
  }
})
```
启用了命名空间的 getter 和 action 是**局部化**的 getter，dispatch 和 commit。换言之，
你在使用模块内容（module assets）时不需要在同一模块内额外添加空间名前缀。更改 namespaced 属性后不需要修改模块内的代码。

#### 在带命名空间的模块内`访问全局内容`（Global Assets）

如果你希望**使用全局 state 和 getter**，`rootState` 和 `rootGetters` 会作为第三和第四参数传入 `getter`，也会通过 `context` 对象的属性传入 `action`。

若需要在全局命名空间内**分发 action** 或**提交 mutation**，将 `{ root: true }` 作为第三参数传给 `dispatch` 或 `commit` 即可。

```javascript
modules: {
  foo: {
    namespaced: true,

    getters: {
      // 在这个模块的 getter 中，`getters` 被局部化了
      // 你可以使用 getter 的第四个参数来调用 `rootGetters`
      someGetter (state, getters, rootState, rootGetters) {
        getters.someOtherGetter // -> 'foo/someOtherGetter'
        rootGetters.someOtherGetter // -> 'someOtherGetter'
      },
      someOtherGetter: state => { ... }
    },

    actions: {
      // 在这个模块中， dispatch 和 commit 也被局部化了
      // 他们可以接受 `root` 属性以访问根 dispatch 或 commit
      someAction ({ dispatch, commit, getters, rootGetters }) {
        getters.someGetter // -> 'foo/someGetter'
        rootGetters.someGetter // -> 'someGetter'

        dispatch('someOtherAction') // -> 'foo/someOtherAction'
        dispatch('someOtherAction', null, { root: true }) // -> 'someOtherAction'

        commit('someMutation') // -> 'foo/someMutation'
        commit('someMutation', null, { root: true }) // -> 'someMutation'
      },
      someOtherAction (ctx, payload) { ... }
    }
  }
}
```
#### 在带命名空间的模块`注册全局 action`

若需要在**带命名空间的**模块**注册全局 action**，你可添加 `root: true`，并将这个 `action` 的定义放在函数 `handler` 中。例如：

```javascript
{
  actions: {
    someOtherAction ({dispatch}) {
      dispatch('someAction')
    }
  },
  modules: {
    foo: {
      namespaced: true,

      actions: {
        someAction: {
          root: true,
          handler (namespacedContext, payload) { ... } // -> 'someAction' 注册为全局的 action
        }
      }
    }
  }
}
```
#### 带命名空间的`绑定函数`

当使用 `mapState`, `mapGetters`, `mapActions` 和 `mapMutations` 这些函数来**绑定带命名空间的模块**时，写起来可能比较繁琐：

```javascript
computed: {
  ...mapState({
    a: state => state.some.nested.module.a,
    b: state => state.some.nested.module.b
  })
},
methods: {
  ...mapActions([
    'some/nested/module/foo', // -> this['some/nested/module/foo']()
    'some/nested/module/bar' // -> this['some/nested/module/bar']()
  ])
}
```
对于这种情况，你可以将模块的**空间名称**字符串**作为第一个参数**传递给上述函数，这样所有绑定都会**自动将该模块作为`上下文`**。于是上面的例子可以简化为：

```javascript
computed: {
  ...mapState('some/nested/module', {
    a: state => state.a,
    b: state => state.b
  })
},
methods: {
  ...mapActions('some/nested/module', [
    'foo', // -> this.foo()
    'bar' // -> this.bar()
  ])
}
```
而且，你可以通过使用 `createNamespacedHelpers` 创建**基于某个命名空间辅助函数**。它返回一个对象，对象里有新的绑定在**给定命名空间值**上的组件**绑定辅助函数**：

```javascript
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapActions } = createNamespacedHelpers('some/nested/module')

export default {
  computed: {
    // 在 `some/nested/module` 中查找
    ...mapState({
      a: state => state.a,
      b: state => state.b
    })
  },
  methods: {
    // 在 `some/nested/module` 中查找
    ...mapActions([
      'foo',
      'bar'
    ])
  }
}
```

回到 `installModule` 方法，我们首先根据 `path` 获取 `namespace`：

```javascript
/* 获取module的namespace */
const namespace = store._modules.getNamespace(path)
```
调用了 `getNamespace` 方法

```javascript
/* src/module/module-collection.js */

/**
  * 获取namespace 命名空间，当namespaced为true的时候会 
  * 将当前模块的属性名拼接到整个 namespace 组成的字符串中
  * 返回'moduleName/name'
  * 并且这个模块下面所有的 actions/mutations/getters 都会加上 namespace 前缀
  * 这样使得多个模块能够对同一 mutation 或 action 作出响应。
  * 如果希望你的模块更加自包含或提高可重用性，
  * 你可以通过添加 namespaced: true 的方式使其成为命名空间模块。
  * 当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。
  */
  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }
```
从 `root module` 开始，通过 `reduce` 方法一层层找子模块，如果发现该模块配置了 namespaced 为 true，则把该模块的 key 拼到 namesapce 中，最终返回完整的 namespace 字符串。

回到 `installModule` 方法，接下来把 namespace 对应的模块保存下来，为了方便以后能根据 namespace 查找模块：

```javascript
/**
  * 如果有namespace则在_modulesNamespaceMap中注册
  * 生成 _modulesNamespaceMap 对象，存放 namespaced 为 true 的模块
  * 属性名是所有的父级 module 名 +  '/'，值为当前注册的 module 实例
  * 通过加上父级模块的路径，保证了每个模块都有自己的命名空间，
  * 防止名字相同的 getter/actions/mutations 命名冲突
  */
  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate namespace ${namespace} 
      for the namespaced module ${path.join('/')}`)
    }
    // 保存namespaced模块
    store._modulesNamespaceMap[namespace] = module
  }
```
接下来判断`非 root module` 且`非 hot` 的情况执行一些逻辑：

```javascript
/* 添加当前模块，作为父模块的 state 对象中的属性，在 state 中建立父子关系 */
  if (!isRoot && !hot) {
     /* 获取父级的state */
    const parentState = getNestedState(rootState, path.slice(0, -1))
     /* 模块名称 */
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      if (process.env.NODE_ENV !== 'production') {
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden 
            by a module with the same name at "${path.join('.')}"`
          )
        }
      }
      /**
      * 在父模块的 state 属性中添加当前模块，属性名是当前模块名，值是 state 对象
      * Vuex 之所以这么做可能是因为需要让所有的模块状态都保存在 state 中
      * 使得在重置模块时能够通过保留 state 从而保留所有的模块依赖关系
      * 将子module设置称响应式的
      */
      Vue.set(parentState, moduleName, module.state)
    })
  }
```
首先保存 namespaced 模块到 `store._modulesNamespaceMap`，再判断**是否为根组件**且**不是 hot**，得到**父级 module 的 state** 和**当前 module 的 name**，
调用 `Vue.set(parentState, moduleName, module.state)` 将**当前 module 的 state** 挂载到**父 state** 上。
接下去会**设置 module 的上下文**，因为可能存在 namespaced，需要额外处理。

`makeLocalContext`，构造了一个**本地上下文环境**：

```javascript
const local = module.context = makeLocalContext(store, namespace, path)
```

### makeLocalContext 的实现

```javascript
/* src/store.js */

/**
* 根据是否开启命名空间来获取上下文
* 设置module的上下文，绑定对应的dispatch、commit、getters、state
* 声明了 namespace 的模块中的 actions dispatch 时不需要加上命名空间，
* 自动作用与当前模块 namespace (a/b/c/)
* 如果没有声明 namespaced，namespace 为一个空字符串
*/
function makeLocalContext (store, namespace, path) {
  const noNamespace = namespace === ''
  // local 为 action 中第一个 ctx 参数
  const local = {
    /**
    * 如果没有命名空间，则使用普通的 dispatch
    */
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      // 统一格式 因为支持payload风格和对象风格
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args
      // 如果root: true 不会加上namespace 即在命名空间模块里提交根的 action
      if (!options || !options.root) {
        type = namespace + type
        if (process.env.NODE_ENV !== 'production' && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: 
          ${args.type}, global type: ${type}`)
          return
        }
      }
      // 触发action
      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      // 统一格式 因为支持payload风格和对象风格
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        /* 如果定义了 namespace:true 则会自动在 type 前加上模块的命名空间（a/b/c/ + type）*/
        // 如果root: true 不会加上namespace 即在命名空间模块里提交根的 mutation
        type = namespace + type
        if (process.env.NODE_ENV !== 'production' && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: 
          ${args.type}, global type: ${type}`)
          return
        }
      }
      // 触发mutation
      store.commit(type, payload, options)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  // 定义 local.getters 和 local.state
  /* 这里的getters和state需要延迟处理，需要等数据更新后才进行计算，
  所以使用getter函数，当访问的时候再进行一次计算 */
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        /**
        * 生成上下文的 getters 对象 获取namespace下的getters
        * 允许在 module 中通过 ctx.getters ，使得访问当前 module 的 getter 不需要添加命名空间
        */
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}
```
`makeLocalContext` 传入 3 个参数：
- `store` 表示 root store
- `namespace` 表示模块的命名空间
- `path` 表示模块的 path

该方法定义了 **local 对象**，这里会判断 **module 是否设置了 namespace** ，如果没有 namespace，它们就**直接指向了 root store** 的 dispatch 和 commit 方法。
如果存在，创建方法，给 type **自动拼接上 namespace**。如果声明了**`{ root: true }`也不做处理**。

**对于 getters 和 states 而言**，需要**延迟处理**，需要等**数据更新后**才进行计算，所以使用 `Object.defineProperties` 的 getter 函数，当访问的时候再进行计算。
**对于 getters 而言**，如果没有 namespace，则直接返回 root store 的 getters，否则返回 `makeLocalGetters(store, namespace) `的返回值; **对于 states 而言**，
则是通过 `getNestedState(store.state, path)` 方法获取。

### makeLocalGetters 的实现

```javascript
/* src/store.js */

function makeLocalGetters (store, namespace) {
  const gettersProxy = {}

  const splitPos = namespace.length
  // store.getters 保存了所有 getters，并且同名的 getters 会添加命名空间
  Object.keys(store.getters).forEach(type => {
    // 如果getter不在该命名空间下 直接return
    if (type.slice(0, splitPos) !== namespace) return

    // 去掉type上的命名空间
    // 根据 type 获取 localType 名
    // type(a/b/c/getter1) = splitPos(a/b/c/) + localType(getter1)
    const localType = type.slice(splitPos)

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    // 给getters加一层代理 这样在module中获取到的getters不会带命名空间，
    // 实际返回的是store.getters[type] type是有命名空间的
    Object.defineProperty(gettersProxy, localType, {
      // 访问localType实际上映射到 store.getters 中的type
      /* 即访问 local.getter 最终会拼上命名空间从 store.getters 找 */
      get: () => store.getters[type],
      enumerable: true
    })
  })

  return gettersProxy
}
```
`makeLocalGetters` 首先获取了 `namespace` 的长度，然后**遍历** `root store` 下的所有 `getters`，先判断它的类型**是否匹配** `namespace`，
只有匹配的时候我们从 `namespace` 的位置**截取**后面的字符串得到 `localType`，
接着用 `Object.defineProperty` 定义了 `gettersProxy`，获取 `localType` 实际上是访问了 `store.getters[type]`。

### getNestedState 的实现

```javascript
/* src/store.js */

function getNestedState (state, path) {
  return path.reduce((state, key) => state[key], state)
}

```
`getNestedState` 方法很简单，就是根据 path 查找 state 上的**嵌套 state**，最终找到**目标模块的 state**。在这里就是传入 `rootState` 和 `path`，计算出当前模块的**父模块的 state**，
由于模块的 path 是根据模块的名称 `concat` 连接的，**所以 path 的最后一个元素就是当前模块的模块名**

那么构造完 **local 上下文**后，我们再回到 `installModule` 方法，接下来它就会遍历模块中定义的 mutations、actions、getters 以及 子module，分别执行它们的注册工作，
它们的实现都差不多。

### registerMutation 的实现

```javascript
/* src/store.js */

/* 遍历注册mutation */
  module.forEachMutation((mutation, key) => {
    /* mutation 是 mutations 中定义的函数，key 为这个 mutation 函数的 key */
    const namespacedType = namespace + key
    /* 给 store 的 _mutations 对象添加当前模块包含的所有 mutations */
    registerMutation(store, namespacedType, mutation, local)
  })
```
首先遍历模块中的 mutations 的定义，拿到**每一个 mutation 和 key**，并把 key **拼接上 namespace**，然后执行 `registerMutation` 方法。
该方法实际上就是给 root store 上的 `_mutations[types]` 添加 `wrappedMutationHandler` 方法，
该方法的具体实现我们之后会提到。**`注意，同一 type 的 _mutations 可以对应多个方法`**。

`registerMutation` 方法的实现 :

```javascript
/* src/store.js */

// 参数是store、mutation的key（namespace处理后的）、handler函数、当前module上下文
function registerMutation (store, type, handler, local) {
  /**
  * 所有的mutation会被push进一个数组中，
  * 这样相同的mutation就可以调用不同module中的同名的mutation了
  * 首先判断store._mutations是否存在，否则给空数组
  */
  const entry = store._mutations[type] || (store._mutations[type] = [])
  /**
   * 将mutation包一层函数，push到数组中
   * mutations对象中的mutation实际上是一个数组，当有重复名字的mutation存在时，依次执行
   */
  entry.push(function wrappedMutationHandler (payload) {
    /**
     * handler 为 mutation 函数，并且让这个 mutation 能够不用命名前缀访问当前模块的state 
     * 包一层，commit执行时只需要传入payload
     * 执行时让this指向store，参数为当前module上下文的state和用户额外添加的payload
     */
    handler.call(store, local.state, payload)
  })
}
```
`registerMutation` 是对 store 的 mutation 的初始化，它接受 4 个参数:
- `store`  当前 Store 实例
- `type`  模块 的 名称
- `handler`  mutation 执行的**回调函数**
- `local`  **makeLocalContext(store, namespace, path)**生成的**当前模块的路径**

mutation 的作用就是同步修改当前模块的 state ，函数首先通过 `type` 拿到对应的 **mutation 对象数组**， 
然后把一个 mutation 的**包装函数** push 到这个数组中，这个函数接收一个参数 payload，这个就是我们在定义 mutation 的时候接收的额外参数。
这个函数执行的时候**会调用 mutation 的回调函数**，并将**实例对象 store**，**当前模块的 state**，和 **playload** 一起作为回调函数的参数。

### registerAction 的实现
```javascript
/* src/store.js */

/* 遍历注册action */
  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })
```

首先遍历模块中的 **actions** 的定义，拿到**每一个 action 和 key**，并判断 `action.root`，如果**否的情况**把 **key 拼接上 namespace**，然后执行 `registerAction` 方法。
该方法实际上就是给 root store 上的 `_actions[types]` 添加 `wrappedActionHandler` 方法，该方法的具体实现我们之后会提到。**`注意，同一 type 的 _actions 可以对应多个方法`**。

`registerAction` 方法的实现:

```javascript
/* src/store.js */

// 参数是store、type（namespace处理后的）、handler函数、module上下文
function registerAction (store, type, handler, local) {
  // 获取_actions数组，不存在即赋值为空数组
  const entry = store._actions[type] || (store._actions[type] = [])
  /**
  * action 会被 wrappedActionHandler 包裹一层，每当 dispatch 执行一个 action 时
  * 都会通过 wrappedActionHandler 将 action 包裹为一个 promise，
  * 并且传入 ctx 中的 dispatch 等方法
  * 执行时需要传入payload和cb
  */
  entry.push(function wrappedActionHandler (payload) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      // rootGetters 为 store 中的根getters
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    /* 判断是否是Promise */
    if (!isPromise(res)) {
      /* 不是Promise对象的时候转化称Promise对象 */
      // 如果action的执行结果不是promise，将他包裹为promise，这样就支持promise的链式调用
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      /* 存在devtool捕获的时候触发vuex的error给devtool */
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}
```

`registerAction` 是对 store 的 **action 的初始化**，它和 `registerMutation` 的**参数一致**，和 mutation 不同一点，mutation 是同步修改当前模块的 state，
而 action 是**异步去修改 state**，在 action 的**回调中并不会直接修改 state**。

- `payload` 表示额外参数 
- `cb` 表示回调函数（实际上我们并没有使用它）

action 是通过提交一个 mutation 去修改 state（mutation 是修改 state 的唯一途径）。

函数首先也是通过 `type` 拿到对应 action 的对象数组，然后把一个 action 的**包装函数** push 到 `store._actions` 数组中，
函数执行的时候会调用 action 的回调函数，传入一个 **context 对象**，context 对象包括了 store 的 `commit` 和 `dispatch` 方法、`getter`、`当前模块的 state 和 rootState` 等等。
接着对这个函数的**返回值做判断**，如果不是一个 Promise 对象，则调用 `Promise.resolve（res）` 给 res 包装成了一个 Promise 对象。
这里也就解释了**为何 Vuex 的源码依赖 Promise**，这里对 Promise 的判断也和简单，参考代码 `src/util.js`，对 `isPromise` 的判断如下：

```javascript
/* src/util.js */

export function isPromise (val) {
  return val && typeof val.then === 'function'
}
```
其实就是简单的**检查对象的 then 方法**，如果包含说明就是一个 Promise 对象。

接着判断 `store._devtoolHook`，这个只有当用到 `Vuex devtools `开启的时候，我们**才能捕获 promise 过程**。
`action` 的**包装函数**最后返回 res ，它就是一个地地道道的 Promise 对象。

### registerGetter 的实现

```javascript
/* src/store.js */

 /* 遍历注册getter */
  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })
```
首先遍历模块中的 `getters` 的定义，拿到**每一个 getter 和 key**，并把 **key 拼接上 namespace**，然后执行 `registerGetter` 方法。
该方法实际上就是给 root store 上的 `_wrappedGetters[key]` 指定 `wrappedGetter` 方法，
该方法的具体实现我们之后会提到。**`注意，同一 type 的 _wrappedGetters 只能定义一个`**。

`registerGetter` 方法的实现：

```javascript
/* src/store.js */

// 参数是store、type（namesapce处理后的）、getter函数、module上下文
function registerGetter (store, type, rawGetter, local) {
  // getter不能有相同命名 不允许重复定义getters
  if (store._wrappedGetters[type]) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }
  /**
  * 包一层，保存到_wrappedGetters中
  * _wrappedGetters 和 store.getters 的区别在于，前者的值是一个函数，后者的值是函数计算后的结果
  * 当执行里面的 getter 函数时，会传入 local 对象来计算出最终值
  */
  store._wrappedGetters[type] = function wrappedGetter (store) {
    // 执行时传入store，执行对应的getter函数
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}
```
`registerGetter` 是对 store 的 **getters 初始化**，它接受 4个 参数， 
- `store` 表示当前 Store 实例
- `type` 表示当前的命名空间的key
- `rawGetter` 表示当前模块下的单个getter
- `local` 对应当前的模块上下文

这个函数做的事情就是**把每一个 getter 包装成一个方法**，添加到 `store._wrappedGetters` 对象中， **getter 的 key 是不允许重复的**，
使用 `store._wrappedGetters[type]` 来判断 key **是否重复**。
在这个包装的方法里，会执行 getter 的**回调函数**，并把`当前模块的 state`，store 的 `getters` 和 `store 的 rootState`，
`store 的 getters` 作为它参数。

再回到 `installModule` 方法，最后一步就是遍历模块中的所有子 modules，递归执行 `installModule` 方法：

```javascript
  /**
  * 递归注册子模块，建立 module 树，并且给 path 数组推入当前命名空间（字符串）
  * 此时所有的子模块中的 state，actions，mutations，getters 都被注册完毕
  */
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
```

所以 `installModule` 实际上就是完成了模块下的 state、getters、actions、mutations 的初始化工作，并且通过递归遍历的方式，就完成了所有子模块的安装工作。

## resetStoreVM

```javascript
/* src/store.js */

 /*
 * 新建一个vm实例保存state，在computed属性中保存getters，
 * 通过watch观察state，保证都使用commit修改state
 * 通过vm重设store，新建Vue对象使用Vue内部的响应式实现注册state以及computed
 * 初始化 store._vm，观测 state 和 getters 的变化
 * */
function resetStoreVM (store, state, hot) {
  /* 存放之前的vm对象 */
  const oldVm = store._vm

  // bind store public getters
  store.getters = {}
  // reset local getters cache
  store._makeLocalGettersCache = Object.create(null)
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  /**
  * 遍历 store._wrappedGetters 对象
  * 依次拿到每个 getter 的包装函数，并把这个包装函数执行的结果用 computed 临时变量保存。
  * 通过 Object.defineProperty 为每一个 getter 方法设置 get 方法
  * 调用 this.$store.getters.xxxgetters 这个方法的时候，
  * 会访问 store._vm[xxxgetters]，也就是 Vue对象 的 computed 属性
  */
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    /**
    * fn 是 wrappedGetters 对象的属性值，即 wrappedGetter 函数
    * 将 wrappedGetters 对象上所有的 getter 函数，作为内部 vm 实例的 computed 属性
    * 这里传入了全局的 store 对象，
    * 因为 getter 的 3，4 参数需要依赖 store 对象（store.state，store.getters）
    */
    computed[key] = partial(fn, store)
    /**
    * 定义 store.getters 属性，使得能直接通过 store.getters.< getter 名> 访问对应的 getter
    * key 为含有命名空间的完整路径
    */
    Object.defineProperty(store.getters, key, {
      // 访问 store.getters 最终会指向 vm 实例对应的 computed 属性，同时触发计算返回结果值
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  /**
  * 使用一个vue实例来保存state和getter
  * 获取到全局 Vue.config.silent 的配置，然后临时把这个配置设成 true
  * 设置 silent 为 true 的目的是为了取消这个 _vm 的所有日志和警告
  */  
  const silent = Vue.config.silent
  Vue.config.silent = true
  /**
  * 实例化一个 Vue 的实例，把 store 的状态树 state 作为 data 传入，
  * 把我们刚才的临时变量 computed 作为计算属性传入
  * 再把之前的 silent 配置重置
  * 把 computed 对象作为 _vm的 computed 属性，这样就完成了 getters 的注册
  * 因为当我们在组件中访问 this.$store.getters.xxxgetters 的时候，
  * 就相当于访问 store._vm[xxxgetters]，
  * 也就是在访问 computed[xxxgetters]，这样就访问到了 xxxgetters 对应的回调函数了
  */
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  // 是否开启 vuex 的 strict 严格模式，目的是禁止 commit 以外的方法修改 state
  if (store.strict) {
    enableStrictMode(store)
  }
  /**
  * 将旧的 _vm 对象的状态设置为 null，并调用 $destroy 方法销毁这个旧的 _vm 对象
  */
  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```

这个方法主要是重置一个**私有的 _vm 对象**，它是一个 Vue 的实例。这个 **_vm 对象**会保留我们的 **state 树**，以及用**计算属性的方式**存储了 store 的 **getters**。

`resetStoreVM` 的作用实际上是想**建立 getters 和 state 的联系**，因为从设计上 getters 的获取就依赖了 state ，并且希望它的依赖能被缓存起来，
且只有当它的依赖值发生了改变才会被重新计算。**因此这里利用了 Vue 中用 computed 计算属性来实现**。

`resetStoreVM` 首先遍历了 `_wrappedGetters` 获得每个 getter 的函数 fn 和 key，然后定义了 `computed[key] = () => fn(store)`。
我们之前提到过 `_wrappedGetters` 的初始化过程，它定义在 `registerGetter` 方法中。这里 `fn(store)` 相当于执行了 `wrappedGetter` 方法，
返回的就是 `rawGetter` 的执行函数。

```javascript
/* src/store.js */

// 参数是store、type（namesapce处理后的）、getter函数、module上下文
function registerGetter (store, type, rawGetter, local) {
  // getter不能有相同命名 不允许重复定义getters
  if (store._wrappedGetters[type]) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }
  /**
  * 包一层，保存到_wrappedGetters中
  * _wrappedGetters 和 store.getters 的区别在于，前者的值是一个函数，后者的值是函数计算后的结果
  * 当执行里面的 getter 函数时，会传入 local 对象来计算出最终值
  */
  store._wrappedGetters[type] = function wrappedGetter (store) {
    // 执行时传入store，执行对应的getter函数
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}
```
`rawGetter` 表示当前模块下的单个 getter，就是用户定义的 getter 函数。它的前 2 个参数是 `local state` 和 `local getters`，后 2 个参数是 `root state` 和 `root getters`。

接着实例化一个 Vue 实例 `store._vm`，并把 `computed` 传入：
```javascript
/**
  * 实例化一个 Vue 的实例，把 store 的状态树 state 作为 data 传入，
  * 把我们刚才的临时变量 computed 作为计算属性传入
  * 再把之前的 silent 配置重置
  * 把 computed 对象作为 _vm的 computed 属性，这样就完成了 getters 的注册
  * 因为当我们在组件中访问 this.$store.getters.xxxgetters 的时候，
  * 就相当于访问 store._vm[xxxgetters]，
  * 也就是在访问 computed[xxxgetters]，这样就访问到了 xxxgetters 对应的回调函数了
  */
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent
```
data 选项里定义了 `$$state` 属性，而我们访问 `store.state` 的时候，实际上会访问 Store 类上定义的 state 的 **get 方法**：

```javascript
/* src/store.js */

get state () {
    return this._vm._data.$$state
}
```
它实际上就访问了 `store._vm._data.$$state`。那么 getters 和 state 是如何建立依赖逻辑的呢，我们再看这段代码逻辑：

```javascript
 /**
  * 遍历 store._wrappedGetters 对象
  * 依次拿到每个 getter 的包装函数，并把这个包装函数执行的结果用 computed 临时变量保存。
  * 通过 Object.defineProperty 为每一个 getter 方法设置 get 方法
  * 调用 this.$store.getters.xxxgetters 这个方法的时候，
  * 会访问 store._vm[xxxgetters]，也就是 Vue对象 的 computed 属性
  */
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    /**
    * fn 是 wrappedGetters 对象的属性值，即 wrappedGetter 函数
    * 将 wrappedGetters 对象上所有的 getter 函数，作为内部 vm 实例的 computed 属性
    * 这里传入了全局的 store 对象，
    * 因为 getter 的 3，4 参数需要依赖 store 对象（store.state，store.getters）
    */
    computed[key] = partial(fn, store)
    /**
    * 定义 store.getters 属性，使得能直接通过 store.getters.< getter 名> 访问对应的 getter
    * key 为含有命名空间的完整路径
    */
    Object.defineProperty(store.getters, key, {
      // 访问 store.getters 最终会指向 vm 实例对应的 computed 属性，同时触发计算返回结果值
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })
```
当根据 `key` 访问 `store.getters` 的某一个 getter 的时候，实际上就是访问了 `store._vm[key]`，也就是 `computed[key]`，在执行 `computed[key]` 对应的函数的时候，
会执行 `rawGetter(local.state,...)` 方法，那么就会访问到 `store.state`，进而访问到 `store._vm._data.$$state`，这样就建立了一个依赖关系。
当 `store.state` 发生变化的时候，下一次再访问 `store.getters` 的时候会重新计算。

再来看一下**严格模式**都干了什么：

```javascript
// enable strict mode for new vm
  // 是否开启 vuex 的 strict 严格模式，目的是禁止 commit 以外的方法修改 state
  if (store.strict) {
    enableStrictMode(store)
  }
  
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (process.env.NODE_ENV !== 'production') {
      assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```
严格模式做的事情很简单，监测 `store._vm.state` 的变化，看看 state 的变化**是否通过执行 mutation 的回调函数而改变**，
如果是外部直接修改 state，那么 `store._committing` 的值为 false，这样就抛出一条错误。再次强调一下，Vuex 中对 state 的修改只能在 mutation 的回调函数里。
`store._committing` 默认值是 false，那么它什么时候会 true 呢，Store 定义了 `_withCommit` 实例方法：

```javascript
/* 保证通过mutation修改store的数据 */
_withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
```
对 `fn` 包装了一个环境，确保在 `fn` 中执行任何逻辑的时候 `this._committing = true`。由于我们是在修改 state，Vuex 中所有对 state 的修改都会用 `_withCommit` 函数包装，
保证在同步修改 state 的过程中 `this._committing` 的值始终为 true。这样当我们观测 state 的变化时，如果 `this._committing` 的值不为 true，则能检查到这个状态修改是有问题的。

::: danger 注意
**不要在发布环境下启用严格模式！** 严格模式会**深度监测状态树**来检测不合规的状态变更——请确保**在发布环境下关闭严格模式**，以避免性能损失。
:::

```javascript
const store = new Vuex.Store({
  // ...
  strict: process.env.NODE_ENV !== 'production'
})
```