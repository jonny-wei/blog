# Actions 相关

## 构造器选项之一

**actions** 是 `Vuex.Store` 构造器选项之一，需要用户设置，官方 API 说明如下：

```text
actions

  类型: { [type: string]: Function }
  
  在 store 上注册 action。处理函数总是接受 context 作为第一个参数，payload 作为第二个参数（可选）。
```
`context` 对象包含以下属性：
```javascript
{
  state,      // 等同于 `store.state`，若在模块中则为局部状态
  rootState,  // 等同于 `store.state`，只存在于模块中
  commit,     // 等同于 `store.commit`
  dispatch,   // 等同于 `store.dispatch`
  getters,    // 等同于 `store.getters`
  rootGetters // 等同于 `store.getters`，只存在于模块中
}
```

来看看下面这个例子：

```javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment') // context 对象
    }
    // 或者
    increment ({ commit }) {
        commit('increment')  // 使用ES 参数结构 context 对象
    }
    // 组合Action
    /* 一个 store.dispatch 在不同模块中可以触发多个 action 函数。
     在这种情况下，只有当所有触发函数完成后，返回的 Promise 才会执行。*/
    async actionA ({ commit }) {
      commit('gotData', await getData())
    },
    async actionB ({ dispatch, commit }) {
      await dispatch('actionA') // 等待 actionA 完成
      commit('gotOtherData', await getOtherData())
    }
  }
})

// 分发
// 以载荷形式分发
store.dispatch('incrementAsync', {
  amount: 10
})

// 以对象形式分发
store.dispatch({
  type: 'incrementAsync',
  amount: 10
})
// 组件中分发
methods: {
    ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`

      // `mapActions` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
    ]),
    ...mapActions({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    })
}
```
`Action` 函数接受一个与 store 实例具有相同方法和属性的 `context 对象`，因此你可以调用 `context.commit` 提交一个 mutation，
或者通过 `context.state` 和 `context.getters` 来获取 state 和 getters。当我们在之后介绍到 Modules 时，你就知道 context 对象为什么不是 store 实例本身了。

## 实例方法

###  dispatch

**dispatch** 是`Vuex.Store` 的实例方法，官方 API 说明如下：
```text
dispatch(type: string, payload?: any, options?: Object)

dispatch(action: Object, options?: Object)


分发 action。options 里可以有 root: true，它允许在命名空间模块里分发根的 action。
返回一个解析所有被触发的 action 处理器的 Promise。
```
`dispatch` 实现逻辑：
```javascript
/* src/store.js */

dispatch (_type, _payload) {
    // check object-style dispatch
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload)

    const action = { type, payload }
    const entry = this._actions[type]
    if (!entry) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[vuex] unknown action type: ${type}`)
      }
      return
    }

    try {
      this._actionSubscribers
        .filter(sub => sub.before)
        .forEach(sub => sub.before(action, this.state))
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[vuex] error in before action subscribers: `)
        console.error(e)
      }
    }
    /**
    * 因为 dispatch 支持异步，所以这里作者使用 Promise.all 来执行异步函数
    * 并且判断所有异步函数是否都已经执行完成，
    * 所以在文件最开始判断了当前环境必须支持 promise 就是这个原因
    */
    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)

    return result.then(res => {
      try {
        this._actionSubscribers
          .filter(sub => sub.after)
          .forEach(sub => sub.after(action, this.state))
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[vuex] error in after action subscribers: `)
          console.error(e)
        }
      }
      return res
    })
  }
```
`store.dispatch` 可以处理被触发的 `action` ，`action` 的处理函数返回的 `Promise`，并且` store.dispatch` 仍旧返回 `Promise`。一个` store.dispatch `在不同模块中可以**触发多个 action 函数**。
在这种情况下，**只有当所有触发函数完成后，返回的 Promise 才会执行**。根据 `type` 找到 `actions`，然后使用 `Promise` 异步的调用回调函数。这也是为什么 `dispatch` 可以异步执行的原因。

### subscribeAction

**subscribeAction** 是`Vuex.Store` 的实例方法，官方 API 说明如下：

```text
subscribeAction(handler: Function): Function 
订阅 store 的 action
```
handler 会在每个 action 分发的时候调用并接收 **action 描述**和**当前的 store 的 state** 这两个参数：

```javascript
// 2.5.0 新增
store.subscribeAction((action, state) => {
  console.log(action.type)
  console.log(action.payload)
})
```
要**停止订阅**，调用此方法返回的函数即可停止订阅。

从 3.1.0 起，`subscribeAction` 也可以指定订阅处理函数的被调用时机应该在一个 action **分发之前还是之后** (默认行为是之前)：

```javascript
// 3.1.0 新增
store.subscribeAction({
  before: (action, state) => {
    console.log(`before action ${action.type}`)
  },
  after: (action, state) => {
    console.log(`after action ${action.type}`)
  }
})
```
`subscribeAction` 的实现逻辑：
```javascript
/* src/store.js */

subscribeAction (fn) {
    const subs = typeof fn === 'function' ? { before: fn } : fn
    return genericSubscribe(subs, this._actionSubscribers)
}

function genericSubscribe (fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}
```
同 `subscribe` 一样，调用 `subscribeAction` 时会将`回调函数`**保存**到 `_actionSubscribers` 中，每次通过 dispatch 触发 action 时，会根据 `_actionSubscribers` 保存的**回调函数**依次触发。

## mapActions 辅助函数

`mapActions` 组件绑定的辅助函数，创建组件方法分发 action。官方 API 说明如下：

```text
mapActions

  mapActions(namespace?: string, map: Array<string> | Object<string | function>): Object
  
  创建组件方法分发 action。
  
  第一个参数是可选的，可以是一个命名空间字符串。
  对象形式的第二个参数的成员可以是一个函数。function(dispatch: function, ...args: any[])
```

使用 `mapActions` 辅助函数将组件的 `methods` 映射为 `store.dispatch` 调用（需要先在根节点注入 store）

```javascript
/* src/helpers.js */

/**
 * Reduce the code which written in Vue.js for dispatch the action
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} actions # Object's item can be a function which accept `dispatch` function 
 * as the first param, it can accept anthor params. You can dispatch action and do any other things 
 * in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  if (process.env.NODE_ENV !== 'production' && !isValidMap(actions)) {
    console.error('[vuex] mapActions: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction (...args) {
      // get dispatch function from store
      let dispatch = this.$store.dispatch
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
        if (!module) {
          return
        }
        dispatch = module.context.dispatch
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})
```
实现逻辑与 `mapMutations` 异曲同工，不在赘述。