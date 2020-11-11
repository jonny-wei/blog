# 准备工作

## Vuex 诞生的原因

下面引用官方的例子：

```javascript
new Vue({
  // state 数据源
  data () {
    return {
      count: 0
    }
  },
  // view 视图
  template: `<div>{{ count }}</div>`,
  // actions 触发的变化 
  methods: {
    increment () {
      this.count++
    }
  }
})
```
- state，驱动应用的数据源
- view，以声明方式将 state 映射到视图
- actions，响应在 view 上的用户输入导致的状态变化

以上是一个**单向数据流**的简单示例，通常我们在单文件组件中用单向数据流较多，下面是示意图：

![flow](/blog/images/flow.png)

#### 单向数据流在多个组件共享状态中引发的问题

当我们的应用遇到多个组件共享状态时，单向数据流的简洁性很容易被破坏：

- 多个视图依赖于同一状态。
- 来自不同视图的行为需要变更同一状态。

对于问题一，传参的方法对于多层嵌套的组件将会非常繁琐，并且对于兄弟组件间的状态传递无能为力。
对于问题二，我们经常会采用父子组件直接引用或者通过事件来变更和同步状态的多份拷贝。

以上的这些模式非常脆弱，通常会导致无法维护的代码。因此，我们为什么不把组件的共享状态抽取出来，以一个全局单例模式管理呢？

在这种模式下，我们的组件树构成了一个巨大的“视图”，不管在树的哪个位置，任何组件都能获取状态或者触发行为！
通过定义和隔离状态管理中的各种概念并通过强制规则维持视图和状态间的独立性，我们的代码将会变得更结构化且易维护。

## Vuex 的使用

每一个 Vuex 应用的核心就是 `store`（仓库）。“store”基本上就是一个容器，它包含着你的应用中大部分的状态 (state)。

当我们使用 vuex 时，我们一般会这么做：

```javascript
const store = new Vuex.Store({
    strict: debug,
    state,
    getters,
    mutations,
    actions,
    modules: {},
    plugins: [myPlugin]
})
```
也就是说，我们是实例化了 Vuex 中的 Store 函数，然后传入一个对象，包含了已经定义好的 state、getters、mutations、actions、plugins 等，当我们还拥有子模块的时候，还会传入 modules 对象。

下面举一个简单的 store：

### store "容器"

```javascript
// 如果在模块化构建系统中，请确保在开头调用了 Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
```

现在，你可以通过 store.state 来获取状态对象，以及通过 store.commit 方法触发状态变更：

```javascript
new Vue({
  el: '#app',
  computed: {
    count () {
	    return store.state.count
    }
  },
  methods: {
    increment () {
      store.commit('increment')
    },
    decrement () {
    	store.commit('decrement')
    }
  }
})
```

再次强调，我们通过 **commit 提交 mutation** 的方式，而非直接改变 store.state.count，是因为我们想要**更明确地追踪到状态的变化**。
这个简单的约定能够让你的意图更加明显，这样你在阅读代码的时候能更容易地解读应用内部的状态改变。
此外，这样也让我们有机会去实现一些能记录每次状态改变，保存状态快照的调试工具。有了它，我们甚至可以实现如时间穿梭般的调试体验。

由于 store 中的**状态是响应式**的，在组件中调用 store 中的状态简单到仅需要在计算属性 computed 中返回即可。
触发变化也仅仅是在组件的 methods 中提交 mutation。

Vuex 和单纯的全局对象有以下两点不同：

- Vuex 的**状态存储是响应式的**。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。

- 你不能直接改变 store 中的状态。改变 store 中的状态的**唯一途径**就是显式地提交 (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化，
从而让我们能够实现一些工具帮助我们更好地了解我们的应用。

### vuex 模块

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  // state：用于数据的存储，是store中的唯一数据源
  // 组件中使用：this.$store.state.user.name
  state: {
    user: {
      name: 'Jonny Wei',
      age: 23
    }
  },
  // getters：如同computed计算属性，基于state数据的二次包装，常用于数据的筛选和多个数据的相关性计算
  // 组件中使用：this.$store.getters.userName
  getters: {
     userName: state => state.user.name,
     // 或者
     // userName(state){
     //   return state.user.name;
     // }
     userString: (state, getters) => (getters.userName + state.user.name),
  },
  // mutations：类似 methods，改变state数据的唯一途径，注意 不能用于处理异步事件
  // 组件中使用：this.$store.commit('setUserName', {//..options})
  mutations: {
      setUserName (state, userName) {
          state.user.name = userName
      },
      // 如果定义了 mutation-types 常量
      [types.SET_USERNAME] (state, userName) {
          state.user.name = userName
      },
  },
  // actions：处理异步操作，只能通过提交 mutation 来改变状态，不能直接改变状态
  // 组件中使用：this.$store.dispatch('getUserName', {//..payload})
  actions: {
      getUserName ({ commit }, payload) {
          api.getUser((data) => {
              commit('setUserName', data.user.name)
              // 如果定义了 mutation-types 常量
              commit(types.SET_USERNAME, data.user.name)
          })
      }
  }
  
})

// mutation-types.js 文件：
export const SET_USERNAME = 'SET_USERNAME'

// 导入
import * as types from './mutation-types'

import store from './store'
// 最后
// 创建和挂载根实例。
// 记得要通过 store 配置参数注入store，
const app = new Vue({
  store  // store: store
}).$mount('#app')
```
也可以将 Store 分成各个模块：

**模块 modules**：类似于命名空间，用于项目中将各个模块的状态分开定义和操作，便于维护

```javascript
// 定义模块
const moduleA = {
    state: { ... },
    getters: { ... },
    mutations: { ... },
    actions: { ... },
}

const moduleB = {
   state: { ... },
   getters: { ... },
   mutations: { ... },
   actions: { ... },
}

const store = new Vuex.Store({
  modules: {
      a: moduleA,
      b: moduleB
   }
})

// 组件中使用
store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态

```
默认情况下，模块内部的 actions、mutations 和 getters 是注册在**全局命名空间**的。这样使得多个模块能够**对同一 mutation 或 action 作出响应**，
仅有 `state 是局部作用`。_因此_，常用 getters 将 state 包装后输出，这样可以直接通过 `this.$store.getters` 的方式拿到数据，
而不用去访问某个模块下的 state。

::: danger 注意
getter 在 **通过属性访问** 时是作为 Vue 的响应式系统的一部分缓存其中的。

你也可以通过让 getter 返回一个函数，来实现给 getter 传参。在你对 store 里的数组进行查询时非常有用。

但是，getter 在 **通过方法访问** 时，每次都会去进行调用，而不会缓存结果
:::

### 辅助函数

**辅助函数**是为了解决在组件中使用 store 中的数据或方法时，每次都要通过 `this.$store` 的方式使用得重复性与复杂性操作。

```javascript
// 组件中按需引入辅助函数
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
    computed: {
        // 数组形式，当映射的计算属性的名称与 state 的子节点名称相同时使用
        ...mapState(['user']),
        // 对象形式，可重命名 state 子节点名称
        ...mapState({
            userInfo: state => state.user
        }),
        // mapState在项目中较少使用，较多通过 mapGetters 获取需要的 state
        // 下面为了简便，均以数组形式使用
        ...mapGetters(['userName'])
    },
    methods: {
        ...mapMutations(['setUserName']),
        ...mapActions(['getUserName'])
    }
}

// 组件中使用
// 变量
this.user.userName;
this.userInfo.userName
// 方法
this.setUserName({/*...*/})
this.getUserName()
```
### 实践应用

中大型单页应用中使用状态管理的一般目录结构：

```text
vuex(或store) // 应用层级的状态应该集中到单个 store 对象中。
    ├── index.js  // 实例化store 并导出 store 
    ├── state.js  // 根级别的 state 
    ├── getters.js  // 包装 state 数据 根级别的 getters
    ├── mutations.js  // 根级别的 mutations
    ├── mutation-types.js  //  所有 mutation 的常量映射表
    ├── actions.js  // 根级别的 actions
    └── modules  // 模块化
        ├── user.js
        ├── role.js
        ├── ...
```

`mutation-types` 使用常量替代 mutation 事件类型，这样可以使 linter 之类的工具发挥作用，
同时把这些常量放在单独的文件中可以让你的代码合作者对整个项目包含的 mutation 一目了然。

## Vuex 工作流程

![flow](/blog/images/vuex.png)

#### 注解
- **`State`(数据源) --> `Vue Components`(组件视图)**： state 中的数据最终会 render 渲染到 Vue Components 中。store 中的 state 状态是响应式的,
因为 Vuex 依赖 Vue 的数据双向绑定，需要 new 一个 Vue 对象来实现响应式化，所以 state 中数据的改变会同步影响组件视图的渲染。每当 state 变化的时候, 
都会重新求取计算属性，并且触发更新相关联的 DOM。

-  **`Vue Components`(组件视图) --> `Actions`(异步操作)**：组件中通过 dispatch 触发调用 Backend API 后台接口，这个过程是个异步操作，需要在 Actions 中，异步逻辑都应该封装到 action 里面。

- **`Actions`(异步操作) --> `Mutations`(同步变更)**：Actions 中不能直接改变 state 状态，mutations 中是改变 state 数据的唯一途径，并且这个过程是同步的。
通过 commit mutation 来改变 state 状态，可以更明确地追踪到状态的变化。这个简单的约定能够让你的意图更加明显，
这样你在阅读代码的时候能更容易地解读应用内部的状态改变。 此外，这样也让我们有机会去实现一些能记录每次状态改变，保存状态快照的 Devtools 调试工具。
有了它，我们甚至可以实现如时间穿梭般的调试体验。

- **`Mutations`(同步变更) --> `State`(数据源)**：通过 commit mutation 在 mutation 中 mutate 变更 state 状态。

::: warning 承上启下
通过上文的阐述，我们了解到 vuex 是用来干什么的；了解到在项目中如何使用 vuex；了解到 vuex 的工作流程。下面我们正式进入 vuex 的底层实现。
作者建议，解读后续章节，要结合 vuex 的官方文档 以及 vuex 的 API <https://vuex.vuejs.org/zh/api/>，这样会更加容易深刻理解。
:::

## 目录结构

```text
├── module  // vuex模块化处理 主要是对state的处理，最后构建成一棵 module tree
│   ├── module.js // 主要导出一个Module类 vuex中模块的功能
│   └── module-collection.js // 主要导出一个ModuleCollection类
├── plugins  // 两个插件
│   ├── devtool.js  // 调试
│   ├── logger.js   // 日志
├── helpers.js  // 辅助函数 api
├── index.esm.js  // 用于es module的打包
├── index.js   // 入口文件 抛出 Store和 mapActions 等api 用于commonjs的打包
├── mixin.js   // 提供install方法，用于注入$store
├── store.js  // vuex的核心代码 store 仓库
├── util.js  // 一些工具函数库，如deepClone、isPromise、assert
```