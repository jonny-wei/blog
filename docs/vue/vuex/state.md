# State 相关

## 构造器选项之一

**state** 是 `Vuex.Store` 构造器选项之一，需要用户设置，官方 API 说明如下：

```text
state

  类型: Object | Function
  
  Vuex store 实例的根 state 对象。
```
如果你传入 `返回一个对象的` 函数，其 `返回的对象` 会被用作 `根 state`。
这在你想要`重用 state 对象`，尤其是对于`重用 module` 来说**非常有用**。

```javascript
/* src/store.js */

constructor (options = {}) {
  // ... more
  const state = this._modules.root.state
}
```
在 Store 类的构造方法中，初始化为 store 实例的根 state 对象。

## 实例属性

**state** 是 `Vuex.Store` 的实例属性，官方 API 说明如下：

```text
state

  类型: Object

  根状态，只读。
```

可以通过 `this.$store.state` 读取 state 中的状态，该实例属性的定义如下：

```javascript
/* src/store.js */

   /* 将 store.state 即 rootState 代理到之前声明的 vm 实例中的 $state 中 */
  get state () {
      return this._vm._data.$$state
    }

  set state (v) {
    if (process.env.NODE_ENV !== 'production') {
      assert(false, `use store.replaceState() to explicit replace store state.`)
    }
  }
```
只能 `get` 即只读，不能直接 `set`。可以使用 `store.replaceState()` 显式替换 state 状态。

## 实例方法

### replaceState 

**replaceState** 是`Vuex.Store` 的实例方法，官方 API 说明如下：

```text
replaceState

  replaceState(state: Object)
  
  替换 store 的根状态，仅用于状态合并或时光旅行调试
```

```javascript
/* src/store.js */

replaceState (state) {
    this._withCommit(() => {
      this._vm._data.$$state = state
    })
  }
// 其内部调用了 _withCommit 方法  
 _withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
```

使用 `_withCommit` 包裹，修改 store 的`根状态`。之所以提供这个 API 是由于在我们是**不能**在 `muations` 的**回调函数外部**去**改变 state**。

## mapState 辅助函数

`mapState` 组件绑定的辅助函数，为组件创建计算属性以返回 Vuex store 中的状态。官方 API 说明如下：

```text
mapState(namespace?: string, map: Array<string> | Object<string | function>): Object
```

由于 Vuex 的状态存储是响应式的，从 store 实例中读取状态最简单的方法就是在计算属性中返回某个状态。
每当 state 变化的时候, 都会重新求取计算属性，并且触发更新相关联的 DOM。下面是 `mapState` 的使用方式：

```javascript
// 在单独构建的版本中辅助函数为 Vuex.mapState
import { mapState } from 'vuex'

export default {
  computed: {
    /* namespace缺省 使用对象方式 */
    mapState({
        // 箭头函数可使代码更简练  
        count: state => state.count, // 对象形式的第二个参数的成员可以是一个函数
    
        // 传字符串参数 'count' 等同于 `state => state.count`
        countAlias: 'count', // 对象形式的第二个参数的成员可以是一个字符串
    
        // 为了能够使用 `this` 获取局部状态，必须使用常规函数
        countPlusLocalState (state) {
          return state.count + this.localCount
        }
      })
    /* namespace缺省 使用数组映射 */
    // 当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 mapState 传一个字符串数组
    mapState([
      // 映射 this.count 为 store.state.count
      'count'
      ])
    /* namespace缺省 使用ES6对象展开运算符 */
    // mapState 函数返回的是一个对象。我们可以和局部计算属性混合使用
    ...mapState({ ... })
    // 或者
    ...mapState([ ... ])
  }
}
```
下面具体分析 `mapState` 的实现：

```javascript
/* src/helpers.js */

/**
 * Reduce the code which written in Vue.js for getting the state.
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} states # Object's item can be a function which accept state 
 * and getters for param, you can do something for state and getters in it.
 * @param {Object}
 */
/**
* 
*/
export const mapState = normalizeNamespace((namespace, states) => {
  /* mapState 最终返回一个对象，并放入到 computed 属性中 */
  const res = {}
  if (process.env.NODE_ENV !== 'production' && !isValidMap(states)) {
    console.error('[vuex] mapState: mapper parameter must be either an Array or an Object')
  }
  /**
  * 将 mapState 的参数转为 key/value 组成的对象数组，如果为数组则 key/value 相同
  */
  normalizeMap(states).forEach(({ key, val }) => {
    /**
    *  key 为映射到组件中的属性
    *  computed 计算属性的值是一个函数，对应 mappedState
    *  返回一个对象，值都是函数
    */
    res[key] = function mappedState () {
      /* 依赖了 $store 属性，如果 $store 发生改变会重新触发计算 */
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
         /* 通过 namespace 从 store._modulesNamespaceMap 中找到这个 namespace 对应的模块 */
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        /* 将从当前模块的 context 中拿到作用域当前模块的 state 和 getters 并赋值给 state,getters */
        state = module.context.state
        getters = module.context.getters
      }
      /**
      * 可以通过函数的返回值，方便的访问嵌套的子模块的 state
      * 如果不含有子模块，可以直接从根模块中获取 state 的值
      */
      return typeof val === 'function'
        ? val.call(this, state, getters) 
        : state[val]
    }
    // mark vuex getter for devtools 标记为 vuex 方便在 devtools 显示
    res[key].vuex = true
  })
  return res
})
```
首先 `mapState` 是执行 `normalizeNamespace` 后返回的函数，`normalizeNamespace` 方法用于标准化统一命名空间( normalizeNamespace 的实现在下文)。返回的函数接收 2 个参数：

- `namespace` 表示命名空间 可以缺省
- `map` 表示具体的对象

### normalizeNamespace 的实现

```javascript
/* src/helpers.js */

/**
 * Return a function expect two param contains namespace and map. 
 * it will normalize the namespace and then the param's 
 * function will handle the new namespace and the map.
 * @param {Function} fn
 * @return {Function}
 * 标准化统一命名空间
 */
function normalizeNamespace (fn) {
  return (namespace, map) => {
    // 命名空间没传，交换参数，namespace 为空字符串
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      // 如果是字符串，最后一个字符不是 / 添加 /
      namespace += '/'
    }
    return fn(namespace, map)
  }
}
```

内部调用了 `normalizeMap` 方法，我们先来分析一下  `normalizeMap` 方法的实现：

### normalizeMap 的实现

```javascript
/* src/helpers.js */

/**
 * Normalize the map
 * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 * @param {Array|Object} map
 * @return {Object}
 */
function normalizeMap (map) {
  // 判断map 是数组或者对象
  if (!isValidMap(map)) {
    return [] // 如果既不是数组也不是对象 则返回[]
  }
  // 否则 统一为 { key，value} 形式的对象组成的数组
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

/**
 * 内部调用了 isValidMap 方法
 * Validate whether given map is valid or not
 * @param {*} map
 * @return {Boolean}
 */
function isValidMap (map) {
  return Array.isArray(map) || isObject(map)
}
/* 内部调用了 isObject  src/util.js */
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}
```
`normalizeMap` 方法判断参数 `map` 是否为数组，如果是数组，则调用数组的 `map` 方法，把数组的每个元素转换成一个 `{ key, val: key }` 的对象；
否则传入的 `map` 就是一个对象（从 mapState 的使用场景来看，传入的参数不是数组就是对象），我们调用 `Object.keys` 方法遍历这个 `map` 对象的 `key`，
把数组的每个 `key` 都转换成一个 `{ key, val: key }` 的对象。最后我们把这个**对象数组**作为 `normalizeMap` 的返回值。

再回到 `mapState` 的实现逻辑中

当执行 `mapState(namespace, map)` 函数的时候，实际上就是执行 `normalizeNamespace` 包裹的函数。mapState 最终是要构造一个对象，**每个对象的元素都是一个方法**，
因为这个对象是要扩展到组件的 `computed` 计算属性中的。函数首先执行 `normalizeMap` 方法，把这个 `states` 变成一个**数组**，转换成由 `{ key, val }` 对象构成的数组，
数组的每个元素都是 `{key, val}` 的形式。接着 `forEach` 遍历这个数组，以 `key` 作为对象的 `key`，值为一个 **`mappedState`** 的函数，构造一个新的对象，
这个新对象每个元素都返回一个新的函数 `mappedState` 。在这个函数的内部，获取到 `$store.getters` 和 `$store.state`，然后再判断数组的 `val` 如果是一个函数，如果 `val` 是一个函数，
则直接调用这个 `val` 函数，把当前 store 上的 **state 和 getters 作为参数**，返回值作为 `mappedState` 的返回值；否则直接把 `this.$store.state[val]` 作为 `mappedState` 的返回值。

那么为何 `mapState` 函数的返回值是这样一个对象呢，因为 `mapState` 的作用是把全局的 state 和 getters 映射到当前组件的 `computed` 计算属性中，而 Vue 中每个计算属性都是一个函数。

下面我们来看一下另一个参数 `namespace` 的作用：

```javascript
  if (namespace) {
    /* 通过 namespace 从 store._modulesNamespaceMap 中找到这个 namespace 对应的模块 */
    const module = getModuleByNamespace(this.$store, 'mapState', namespace)
    if (!module) {
      return
    }
    /* 将从当前模块的 context 中拿到作用域当前模块的 state 和 getters 并赋值给 state,getters */
    state = module.context.state
    getters = module.context.getters
}
```
`module.context` 这个赋值主要是给 helpers 中 `mapState`、`mapGetters`、`mapMutations`、`mapActions` 四个辅助函数使用的，`module.context` 的定义如下：
```javascript
/* src/store.js */

function installModule (store, rootState, path, module, hot) {
  // .. more
  /**
    * 给当前模块添加 context 属性，即 action 的第一个参数 ctx
    * ctx 中的 dispatch 会添加当前模块的命名空间
    * 再执行全局的 dispatch 去 _actions 中找到对应的 action
    * local 返回的是一个含有 dispatch,commit,getters,state 的对象，即 ctx
    */
    const local = module.context = makeLocalContext(store, namespace, path)
}
```
在 `mapState` 的实现中，如果有 `namespace`，则执行 `getModuleByNamespace(this.$store, 'mapState', namespace)` 获取对应的 `module`，
然后把 state 和 getters 修改为 module 对应的 state 和 getters。

```javascript
/* src/helpers.js */

/**
 * Search a special module from store by namespace. if module not exist, print error message.
 * @param {Object} store
 * @param {String} helper
 * @param {String} namespace
 * @return {Object}
 */
function getModuleByNamespace (store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace]
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}
```
我们在 Vuex 初始化执行 `installModule` 的过程中，初始化了 `store._modulesNamespaceMap[namespace]` 这个映射表：

```javascript
function installModule (store, rootState, path, module, hot) {
  // ...
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // ...
}
```
`mapState` 为组件创建计算属性以返回 Vuex store 中的状态，做的事情如同下面的例子：

```javascript
computed: {
    ...mapState('user', {
      name: state => state.user.name
    }),
}
```
如果没有命名空间会转化为这样：
```javascript
computed: {
    name: this.$store.user.name
}
```
如果有命名空间会转化成这样：
```javascript
computed: {
    name: this.$store._modulesNamespaceMap.['user/'].context.name
}
```