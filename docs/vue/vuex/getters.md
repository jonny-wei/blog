# Getters 相关

## 构造器选项之一

**getters** 是 `Vuex.Store` 构造器选项之一，需要用户设置，官方 API 说明如下：

```text
getters
  类型: { [key: string]: Function }
```
在 store 上注册 getter，getter 方法接受以下参数：
- state  如果在模块中定义则为`模块的局部状态`
- getters  等同于 `store.getters`

当定义在一个模块里时会特别一些，注册的 getter 暴露为 `store.getters`，接受以下参数：
- state  如果在模块中定义则为模块的局部状态
- getters  等同于 `store.getters`
- rootState  等同于 `store.state`
- rootGetters  `所有 getters`

## 实例属性
**getters** 是 `Vuex.Store` 的实例属性，官方 API 说明如下：
```text
getters
  类型: Object
  暴露出注册的 getter，只读。
```

## getters 的使用

### 通过属性方式访问

Getter 会暴露为 `store.getters 对象`，可以通过属性的形式访问这些值：

```javascript
getters: {
  // Getter 也可以接受其他 getter 作为第二个参数
  doneTodos: (state, getters) => {
    return store.getters.doneTodos + getters.doneTodos.length
  }
}
// 使用
store.getters.doneTodos
store.getters.doneTodosCount
// 组件中使用
this.$store.getters.doneTodosCount
```

::: danger 注意
getter 在通过属性访问时是作为 Vue 的响应式系统的一部分缓存其中的
:::

### 通过方法访问

可以通过让 getter 返回一个函数，来实现给 getter 传参。在你对 store 里的数组进行查询时非常有用：

```javascript
getters: {
  // ...
  getTodoById: (state) => (id) => {
    return state.todos.find(todo => todo.id === id)
  }
}
// 使用
store.getters.getTodoById(2) // -> { id: 2, text: '...', done: false }
```

::: danger 注意
getter 在通过方法访问时，每次都会去进行调用，而不会缓存结果
:::

## mapGetters 辅助函数

`mapGetters` 组件绑定的辅助函数，为组件创建计算属性以返回 getter 的返回值。官方 API 说明如下：

```text
mapGetters(namespace?: string, map: Array<string> | Object<string>): Object
```

`mapGetters` 辅助函数仅仅是将 store 中的 getter 映射到**局部计算属性**，下面具体分析一下 `mapGetters` 的实现：

```javascript
/* src/helpers.js */

/**
 * Reduce the code which written in Vue.js for getting the getters
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} getters
 * @return {Object}
 */
export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}
  // 非生产环境 判断参数 getters 必须是数组或者是对象 isValidMap 方法的实现上文讲述过
  if (process.env.NODE_ENV !== 'production' && !isValidMap(getters)) {
    console.error('[vuex] mapGetters: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(getters).forEach(({ key, val }) => {
    // The namespace has been mutated by normalizeNamespace
    val = namespace + val
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if (process.env.NODE_ENV !== 'production' && !(val in this.$store.getters)) {
        console.error(`[vuex] unknown getter: ${val}`)
        return
      }
      // mapGetters 通过拼上命名前缀最终去 this.$store.getters 找
      return this.$store.getters[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```
`mapGetters` 的实现也和 `mapState` 很类似，不同的是它的 `val` 不能是函数，只能是一个字符串，而且会检查 `val` 是否是 `this.$store.getters` 的值，如果为 false 会输出一条错误日志。

`mapGetters` 也同样支持 `namespace`，如果不写 namespace ，访问一个子 module 的属性需要写很长的 `key`，一旦我们使用了 namespace，就可以方便我们的书写，
每个 **`mappedGetter`** 的实现实际上就是取 `this.$store.getters[val]`。

`mapGetters` 的作用就是将 store 中的 getter 映射到局部计算属性，举个例子:
```javascript
computed: {
  ...mapGetters('user', {
    myName: 'getName',
    myAge: 'getAge'
  })
}
```
通过 `mapGetters` 转化为：
```javascript
computed: {
  myName: this.$store.getters['user/getName'],
  myAge: this.$store.getters['user/getAge'],
}
```



