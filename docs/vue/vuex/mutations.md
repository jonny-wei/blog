# Mutations 相关

## 构造器选项之一

**mutations** 是 `Vuex.Store` 构造器选项之一，需要用户设置，官方 API 说明如下：

```text
mutations

  类型: { [type: string]: Function }
  
  在 store 上注册 mutation，处理函数总是接受 ：
    state 作为第一个参数（如果定义在模块中，则为模块的局部状态）
    payload 作为第二个参数（可选）。
```
Vuex 中的 `mutation` 非常类似于**事件**：每个 `mutation` 都有一个字符串的 **事件类型 (type)** 和 一个 **回调函数 (handler)**。
这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数。不能直接调用一个 m`utation handler`，
需要以相应的 `type` 调用 `store.commit` 方法。接受 `payload` 载荷作为第二个参数，在大多数情况下，载荷应该是一个对象，这样可以包含多个字段并且记录的 mutation 会更易读。

对象风格提交方式，使用对象风格的提交方式，整个对象都作为载荷传给 mutation 函数：
```javascript
store.commit({
  type: 'setUserName',
  name: 'Jonny Wei'
})
// 组件中提交
this.$store.commit('setUserName','Jonny Wei')

mutations: {
  setUserName (state, payload) {
    state.user.name = payload.name
  }
}
```

## 实例方法

### commit

**commit** 是`Vuex.Store` 的实例方法，官方 API 说明如下：

```text
commit

    commit(type: string, payload?: any, options?: Object)
    
    commit(mutation: Object, options?: Object)
    
    提交 mutation。options 里可以有 root: true，它允许在命名空间模块里提交根的 mutation。
```
每个 mutation 都有一个字符串的 **事件类型 (type)** 和 一个 **回调函数 (handler)**。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数，
也可以向` store.commit` 传入额外的参数，即 mutation 的 `载荷（payload）`。

`commit` 的实现如下：

```javascript
/* src/store.js */

// 这里的this已经被绑定为store
 commit (_type, _payload, _options) {
    // check object-style commit 统一格式，因为支持对象风格和payload风格
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)
    /*  缓存本次commit操作的类型和负荷，以供后续监听队列（this._subscribers）使用 */
    const mutation = { type, payload }
    /* 获取当前type对应保存下来的mutations数组 */
    const entry = this._mutations[type]
    if (!entry) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }
    /* 包裹在_withCommit中执行mutation，mutation是修改state的唯一方法 */
    this._withCommit(() => {
      /**
      * handler 同样包裹了一层函数 wrappedMutation ，在内部会加入当前的 local 对象，再合并 payload
      * 执行mutation中的所有方法
      */
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })
    /**
    * 调用订阅者的回调函数（默认会在devtools会记录这个mutation名字和当前的state状态）
    * 这个就是之前说的监听队列，在每次执行commit函数时都会遍历执行一下这个队列
    */
    this._subscribers.forEach(sub => sub(mutation, this.state))

    if (
      process.env.NODE_ENV !== 'production' &&
      options && options.silent
    ) {
      console.warn(
        `[vuex] mutation type: ${type}. Silent option has been removed. ` +
        'Use the filter functionality in the vue-devtools'
      )
    }
  }
```
使用 `this.commit(type,payload,{root:true})` 调用 commit 方法是，参数如下：
- `_type` 是 mutation 的 type
- `_payload` 是 payload 载荷 额外传入的
_ `_options` 可以有{ root:true }，它允许在命名空间模块里提交根的 mutation

首先执行 `unifyObjectStyle` 对参数进行**统一处理**，因为 commit 支持**对象风格**和**载荷风格**，然后根据 `type` 从 `store._mutations` 找到对应的**函数数组**，
遍历对应的函数数组，依次执行对应的 `handler` 回调函数，实际上就是执行了 `wrappedMutationHandler(playload)`。逐一执行时会使用 `_withCommit 包裹`，
这样做的目的是保证只能在 mutations 中同步修改 state。接着会执行我们定义的 mutation 函数，我们执行` this.$store.commit` 的时候会调用对应的 mutation，
而且第一个参数是 state，所以我们的 mutation 函数也就是对当前模块的 state 做修改，最后再执行 mutation 的订阅函数。

### subscribe

**subscribe** 是`Vuex.Store` 的实例方法，官方 API 说明如下：

```text
subscribe
  subscribe(handler: Function): Function
  
  订阅 store 的 mutation。handler 会在每个 mutation 完成后调用，
  接收 mutation 和经过 mutation 后的状态作为参数：
  
  store.subscribe((mutation, state) => {
    console.log(mutation.type)
    console.log(mutation.payload)
  })
  
  要停止订阅，调用此方法返回的函数即可停止订阅。
  通常用于插件
```

下面是 `subscribe` 的实现逻辑：

```javascript
/* src/store.js */

subscribe (fn) {
    return genericSubscribe(fn, this._subscribers)
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
`subscribe` 的逻辑很简单，就是往 `this._subscribers` 去添加一个函数，并返回一个 unsubscribe 的方法。
而我们在执行 store.commit 的方法的时候，会遍历 `this._subscribers` 执行它们对应的回调函数。

`subscribe` 方法会调用 `genericSubscribe` 方法将其放到 `_subscribers` 中，每次通过 commit 触发 mutations 时，会触发 _subscribers 上保存的**回调函数**。

## mapMutations 辅助函数

**`mapMutations`** 组件绑定的辅助函数，创建组件方法提交 mutation。官方 API 说明如下：
```text
mapMutations(namespace?: string, map: Array<string> | Object<string | function>): Object

  第一个参数是可选的，可以是一个命名空间字符串。
  
  对象形式的第二个参数的成员可以是一个函数。function(commit: function, ...args: any[])
```
使用 `mapMutations` 辅助函数将组件中的 `methods` 映射为 `store.commit 调用`（需要在根节点注入 store）。`mapMutations` 的具体实现
如下：
```javascript
/* src/helpers.js */

/**
 * Reduce the code which written in Vue.js for committing the mutation
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} mutations # Object's item can be a function which 
 * accept `commit` function as the first param, it can accept anthor params. 
 * You can commit mutation and do any other things in this function. specially, 
 * You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapMutations = normalizeNamespace((namespace, mutations) => {
   /* mapMutations 最终返回一个对象，并放入到 methods 属性中 */
  const res = {}
  if (process.env.NODE_ENV !== 'production' && !isValidMap(mutations)) {
    console.error('[vuex] mapMutations: mapper parameter must be either an Array or an Object')
  }
  /**
  * 将 mapState 的参数转为 key/value 组成的对象数组，如果为数组则 key/value 相同
  */
  normalizeMap(mutations).forEach(({ key, val }) => {
    res[key] = function mappedMutation (...args) {
      // Get the commit method from store
      let commit = this.$store.commit
      if (namespace) {
         /* 通过 namespace 从 store._modulesNamespaceMap 中找到这个 namespace 对应的模块 */
        const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
        if (!module) {
          return
        }
        /* 从当前模块的 context 中拿到作用于当前模块的 commit */
        commit = module.context.commit
      }

      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})
```
`mapMutations` 的作用就是将组件中的 methods 映射为 store.commit 调用，举个例子:

```javascript
methods: {
  ...mapMutations('user', ['setUserName']),
}
```
通过 `mapMutations` 转化为：
```javascript
methods: {
  setUserName(...args){
     return this.$store.commit.apply(this.$store, ['setUserName'].concat(args))
   },
   setUserName(...args){
     return this.$store._modulesNamespaceMap.['user/'].context.commit.apply(this.$store, ['setUserName'].concat(args))
   },
}
```