# 其他

## watch

**watch** 是`Vuex.Store` 的实例方法，官方 API 说明如下：

```text
watch(fn: Function, callback: Function, options?: Object): Function

  响应式地侦听 fn 的返回值，当值改变时调用回调函数。
  fn 接收 store 的 state 作为第一个参数，其 getter 作为第二个参数。
  最后接收一个可选的对象参数表示 Vue 的 vm.$watch 方法的参数。
  
  要停止侦听，调用此方法返回的函数即可停止侦听。
```
```javascript
/* src/store.js */

/**
 * 观测某个值
 * @param {Function} getter 函数
 * @param {Function} cb 回调
 * @param {Object} options 参数对象
 */
watch (getter, cb, options) {
    if (process.env.NODE_ENV !== 'production') {
      assert(typeof getter === 'function', `store.watch only accepts a function.`)
    }
    /**
    * his._watcherVM 就是一个 vue 的实例，所以可以利用它的 watch 来实现 vuex 的 watch，原理都一样，
    * 当监听的值或者函数的返回值发送改变的时候，就触发相应的回调函数，
    * 也就是我们传入的 cb 参数，options 则可以来让监听立即执行和深度监听对象
    */
    return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
  }
```
首先判断 getter 必须是函数类型，使用 `$watch` 方法来监控 getter 的变化，传入 state 和 getters 作为参数，当值变化时会执行 `cb` 回调。调用此方法返回的函数可停止侦听。
`watch` 的作用就是响应式地监测一个 getter 方法的返回值，当值改变时调用回调函数，原理其实就是利用 vue 中的 `watch` 方法。

## hotUpdate

**hotUpdate** 是`Vuex.Store` 的实例方法，官方 API 说明如下：

```text
hotUpdate(newOptions: Object)

热替换新的 action 和 mutation
```

```javascript
/* src/store.js */

hotUpdate (newOptions) {
    // 调用的是 ModuleCollection 的 update 方法，最终调用对应的是每个 Module 的 update
    this._modules.update(newOptions)
    // 重置 Store
    resetStore(this, true)
  }
```
函数首先调用 `update` 方法去更新状态，其中要更新的 `newOptions` 会作为参数。来看一下这个函数的实现：

```javascript
/* src/module/module-collection.js */

update (rawRootModule) {
    update([], this.root, rawRootModule)
  }
```
内部调用了 `update` 方法，它的具体实现如下：

```javascript
/* src/module/module-collection.js */

function update (path, targetModule, newModule) {
  if (process.env.NODE_ENV !== 'production') {
    assertRawModule(path, newModule)
  }

  // update target module 更新 module
  targetModule.update(newModule)

  // update nested modules
  /* 更新嵌套的module */
  if (newModule.modules) {
    for (const key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[vuex] trying to add a new module '${key}' on hot reloading, ` +
            'manual reload is needed'
          )
        }
        return
      }
      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      )
    }
  }
}
```
内部调用 `assertRawModule` 方法，如果有嵌套的 module，则循环递归调用 `update`。
```javascript
/* src/module/module-collection.js */

function assertRawModule (path, rawModule) {
  Object.keys(assertTypes).forEach(key => {
    if (!rawModule[key]) return

    const assertOptions = assertTypes[key]

    forEachValue(rawModule[key], (value, type) => {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      )
    })
  })
}
```
首先我们调用 `assertRawModule` 方法 `module` 做了判断，并且更新 `targetModule`。最后判断如果 `newOptions` 包含 `modules` 这个 `key`，
则遍历这个 `modules` 对象，如果 `modules` 对应的 `key` 不在**之前的 modules** 中，则报一条警告，**因为这是添加一个新的 module ，
需要手动重新加载**。如果 `key` 在之前的 `modules`，则递归调用 `updateModule`，**热更新子模块**。调用完 `update` 后，回到 `hotUpdate` 函数，
接着调用 `resetStore` 方法`重新设置 store`，`resetStore` 我们已经介绍过了。

## createNamespacedHelpers 辅助函数

**createNamespacedHelpers** 创建基于命名空间的组件绑定辅助函数，官方 API 说明如下：

```text
createNamespacedHelpers(namespace: string): Object

其返回一个包含 mapState、mapGetters、mapActions 和 mapMutations 的对象。
它们都已经绑定在了给定的命名空间上。
```

```javascript
/* src/helpers.js */

/**
 * Rebinding namespace param for mapXXX function in special scoped, and return them by simple object
 * @param {String} namespace
 * @return {Object}
 */
/* 作用 把这些辅助函数放在一个对象中 */
export const createNamespacedHelpers = (namespace) => ({
  // bind(null) 严格模式下，napState等的函数 this 指向就是 null
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})
```

## 插件

**plugins** 是 `Vuex.Store` 构造器选项之一，需要用户设置，官方 API 说明如下：

```text
plugins
  类型: Array<Function>

  一个数组，包含应用在 store 上的插件方法。
  
  这些插件直接接收 store 作为唯一参数，可以监听 mutation（用于外部地数据持久化、记录或调试）
  或者提交 mutation （用于内部数据，例如 websocket 或 某些观察者）
```

我们在实例化 Store 的时候可以传入插件，它是一个数组，然后在执行 Store 构造函数的时候，会执行这些插件：

```javascript
/* src/store.js */

constructor (options = {}) {
  // ... more
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

Vuex 的 store 接受 plugins 选项，这个选项暴露出每次 mutation 的钩子。Vuex 插件就是一个函数，它接收 store 作为唯一参数：

```javascript
const myPlugin = store => {
  // 当 store 初始化后调用
  store.subscribe((mutation, state) => {
    // 每次 mutation 之后调用
    // mutation 的格式为 { type, payload }
  })
}
```
然后这样使用：

```javascript
const store = new Vuex.Store({
  // ...
  plugins: [myPlugin]
})
```
在插件中不允许直接修改状态——类似于组件，只能通过提交 mutation 来触发变化。通过提交 mutation，插件可以用来同步数据源到 store。
例如，同步 websocket 数据源到 store（下面是个大概例子，实际上 createPlugin 方法可以有更多选项来完成复杂任务）：

```javascript
export default function createWebSocketPlugin (socket) {
  return store => {
    socket.on('data', data => {
      // 在插件内提交 Mutation
      store.commit('receiveData', data)
    })
    store.subscribe(mutation => {
      if (mutation.type === 'UPDATE_DATA') {
        socket.emit('update', mutation.payload)
      }
    })
  }
}
```

```javascript
const plugin = createWebSocketPlugin(socket)

const store = new Vuex.Store({
  state,
  mutations,
  plugins: [plugin]
})
```