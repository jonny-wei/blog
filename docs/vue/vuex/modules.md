# Modules 相关

Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块。

对于模块内部的 mutation 和 getter，接收的第一个参数是模块的局部状态对象 state 。同样，对于模块内部的 action，局部状态通过 context.state 暴露出来，根节点状态则为 context.rootState。
对于模块内部的 getter，根节点状态会作为第三个参数暴露出来。

默认情况下，模块内部的 action、mutation 和 getter 是注册在全局命名空间的——这样使得多个模块能够对同一 mutation 或 action 作出响应。
但可以通过添加 namespaced: true 的方式使其成为带命名空间的模块。当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。
启用了命名空间的 getter 和 action 会收到局部化的 getter，dispatch 和 commit。不需要在同一模块内额外添加空间名前缀。

## 构造器选项之一

**modules** 是 `Vuex.Store` 构造器选项之一，需要用户设置，官方 API 说明如下：

包含了子模块的对象，会被合并到 store：
```text
{
  key: {
    state,
    namespaced?,
    mutations,
    actions?,
    getters?,
    modules?
  },
  ...
}
```
与根模块的选项一样，每个模块也包含 state 和 mutations 选项。模块的状态使用 key 关联到 store 的根状态。
模块的 mutation 和 getter 只会接收 module 的局部状态作为第一个参数，而不是根状态，并且模块 action 的 context.state 同样指向局部状态。

## 模块动态注册

在 Vuex 初始化阶段我们构造了模块树，初始化了模块上各个部分。在有一些场景下，我们需要动态去注入一些新的模块，
Vuex 提供了模块动态注册功能，在 store 上提供了一个 `registerModule` 的 API。

### 如何动态注册

在 store 创建之后，你可以使用 store.registerModule 方法注册模块：
```javascript
// 注册模块 `myModule`
store.registerModule('myModule', {
  // ...
})
// 注册嵌套模块 `nested/myModule`
store.registerModule(['nested', 'myModule'], {
  // ...
})
```
之后就可以通过 store.state.myModule 和 store.state.nested.myModule 访问模块的状态。

```javascript
store.registerModule('a', module, { preserveState: true })
```
在注册一个新 module 时，你很有可能想保留过去的 state，例如从一个服务端渲染的应用保留 state。可以设置 `{ preserveState: true }`，
设置 `preserveState` 为 `true` 后，该模块会被注册，`action`、`mutation` 和 `getter` 会被添加到 `store` 中，**但是 state 不会**。
这里假设 store 的 state 已经包含了这个 module 的 state 并且你不希望将其覆写。

### registerModule

**registerModule** 是`Vuex.Store` 的实例方法，官方 API 说明如下：

```text
registerModule(path: string | Array<string>, module: Module, options?: Object)
  注册一个动态模块。
  options 可以包含 preserveState: true 以允许保留之前的 state。用于服务端渲染。
```

`registerModule` 的作用是注册一个动态模块，有的时候当我们异步加载一些业务的时候，可以通过这个 API 接口去动态注册模块。

`registerModule` 的实现逻辑如下：

```javascript
/* src/store.js */

/**
 * 动态注册模块
 * @param {Array|String} path 路径
 * @param {Object} rawModule 原始未加工的模块
 * @param {Object} options 参数选项
 */
registerModule (path, rawModule, options = {}) {
    /* 保证path是一个数组（符合vuex安装的规则）*/
    if (typeof path === 'string') path = [path]

    if (process.env.NODE_ENV !== 'production') {
      assert(Array.isArray(path), `module path must be a string or an Array.`)
      assert(path.length > 0, 'cannot register the root module by using registerModule.')
    }
     /* 调用 moduleCollection 实例的 register 方法，根据 path 动态注册模块 */
    this._modules.register(path, rawModule)
    /* 初始化 */
    installModule(this, this.state, path, this._modules.get(path), options.preserveState)
    // reset store to update getters...
    /* 重新重置所有的state（实例化一个vm存储state和getters）*/
    resetStoreVM(this, this.state)
  }
```
和**初始化 Store** 的逻辑一样，调用 `installModule` 和 `resetStoreVm` 方法安装一遍动态注入的 `module`

`registerModule` 支持传入一个 `path 模块路径` 和 `rawModule 模块定义`，首先调用 `moduleCollection` 实例的 `register` 方法扩展我们的模块树，
接着执行 `installModule` 去初始化模块，最后执行 `resetStoreVM` **重新实例化 store._vm**，并**销毁旧的 store._vm**。

函数首先对 `path` 判断，如果 path 是一个 `string` 则把 path 转换成一个 `Array`。接着 `this._modules.register` 把 `module` 注册到 `_modules` 中。
`this._modules.register` 方法如下：

```javascript
/* src/module/module-collection.js */

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
```
这个方法之前解析过，可以去 [回顾一下](/vue/vuex/initialization.html#installmodule-的实现)

### unregisterModule

**unregisterModule** 是`Vuex.Store` 的实例方法，官方 API 说明如下：

```text
unregisterModule(path: string | Array<string>)
  卸载一个动态模块。
```

`unregisterModule` 的实现逻辑如下：

```javascript
/* src/store.js */

 unregisterModule (path) {
    /* 转化称Array */
    if (typeof path === 'string') path = [path]

    if (process.env.NODE_ENV !== 'production') {
      assert(Array.isArray(path), `module path must be a string or an Array.`)
    }
     /* 通过 path 从对应的模块中通过 delete 操作符删除属性 */
    this._modules.unregister(path)
    this._withCommit(() => {
      /* 获取父级的state */
      const parentState = getNestedState(this.state, path.slice(0, -1))
      /* 从父级中删除该模块*/
      Vue.delete(parentState, path[path.length - 1])
    })
    /* 重制 store */
    resetStore(this)
  }
```
函数首先还是对 path 的类型做了判断，这部分逻辑和注册是一样的。接着从 `_modules` 里删掉模块。`this._modules.unregister(path)` 方法如下：

```javascript
/* src/module/module-collection.js */

unregister (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]
    if (!parent.getChild(key).runtime) return

    parent.removeChild(key)
  }
```
接着通过 `this._withCommit` 方法把当前模块的 state 对象**从父 state 上删除**。这里用到了 `resetStore()`，我们来看一下：

```javascript
/* src/store.js */

// 重新初始化模块
function resetStore (store, hot) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  // 保留了重置前的所有状态（包括模块）
  const state = store.state
  // init all modules
  installModule(store, state, [], store._modules.root, true)
  // reset vm
  resetStoreVM(store, state, hot)
}
```
这个方法作用就是**重置 store 对象**，重置清空 store 的 `_actions`、`_mutations`、_`wrappedGetters` 等等属性。
然后重新调用 `installModule` 重新安装一遍 Module 对应的这些属性，以及 `resetStoreVM` 重置 `store._vm`。参数 `hot` 为true，表示它是一次热更新。
这样在 `installModule` 这个方法体类，如下这段逻辑就不会执行：

```javascript
/* src/store.js */

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
```
由于 `hot` 始终为 true，这里我们就**不会重新对状态树做设置**，我们的 **state 保持不变**。因为我们已经明确的删除了对应 path 下的 state 了，
要做的事情只不过就是**重新注册一遍 muations、actions 以及 getters**。

::: danger 注意
你不能使用 unregisterModule 方法卸载静态模块（即创建 store 时声明的模块）, 只能卸载我们运行时动态创建的模块。
:::

## 模块重用

有时我们可能需要创建一个模块的多个实例，例如：

- 创建多个 store，他们公用同一个模块 (例如当 runInNewContext 选项是 false 或 'once' 时，[为了在服务端渲染中避免有状态的单例](https://ssr.vuejs.org/guide/structure.html#avoid-stateful-singletons))
- 在一个 store 中多次注册同一个模块
如果我们使用一个纯对象来声明模块的状态，那么这个状态对象会通过引用被共享，导致状态对象被修改时 store 或模块间数据互相污染的问题。

实际上这和 Vue 组件内的 data 是同样的问题。因此解决办法也是相同的——使用一个函数来声明模块状态（仅 2.3.0+ 支持）：

```javascript
const MyReusableModule = {
  state () {
    return {
      foo: 'bar'
    }
  },
  // mutation, action 和 getter 等等...
}
```