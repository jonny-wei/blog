# Vuex 实现原理

Vuex 背后的设计思想：

应用遇到多个组件共享状态时，单向数据流的简洁性很容易被破坏：

- 多个视图依赖于同一状态。传参的方法对于多层嵌套的组件将会非常繁琐，并且对于兄弟组件间的状态传递无能为力
- 来自不同视图的行为需要变更同一状态。我们经常会采用父子组件直接引用或者通过事件来变更和同步状态的多份拷贝。以上的这些模式非常脆弱，通常会导致无法维护的代码。

因此，我们为什么不把组件的共享状态抽取出来，以一个全局单例模式管理呢？在这种模式下，我们的组件树构成了一个巨大的“视图”，不管在树的哪个位置，任何组件都能获取状态或者触发行为！通过定义和隔离状态管理中的各种概念并通过强制规则维持视图和状态间的独立性，我们的代码将会变得更结构化且易维护。如果有些状态严格属于单个组件，最好还是作为组件的局部状态。

## 全局数据状态管理

常见全局数据管理有以下几种方式：

- eventBus
- 共享对象
- 单向数据流
- 树状作用域

### eventBus

中央事件总线，全局事件管理。

事件的监听和触发机制，在许多的场景下都能适用，如浏览器点击、输入框的输入操作，则是典型的事件机制。而在很多时候，我们也可以通过事件通知的方式，来进行数据间的交互，如 Websocket 机制。在 Vue 中，除了使用根实例来绑定作为事件中心，更常见的就是我们自行创建一个事件中心来进行管理：

```js
// eventBus.js

/**
 * events：事件注册中心 events = [{eventName: '', listeners: []},{}]
 * MyEvent：一个实例一组同类(eventName)事件的回调任务队列(listeners)
 * eventName：回调函数名(类型)
 * listeners：回调队列
 */

const events = [];

function on(eventName, callback) {
  let event = events.find(x => x.eventName === eventName);
  if (event) {
    // 如果已有该事件，添加到监听者中
    event.addListener(callback);
  } else {
    // 如果没有该事件，则添加新事件，并添加到监听者
    event = new MyEvent(eventName);
    event.addListener(callback);
    events.push(event);
  }
}

function emit(eventName, ...params) {
  let event = events.find(x => x.eventName === eventName);
  // 如果已有该事件，则触发
  if (event) {
    event.trigger(...params);
  }
}

class MyEvent {
  constructor(eventName) {
    // 创建一个事件，传入事件名
    this.eventName = eventName;
    // 同时动态生成一个监听者管理
    this.listeners = [];
  }
  // 触发事件，传入参数
  trigger(...params) {
    // 遍历监听者，触发回调
    this.listeners.forEach(x => {
      x(...params);
    });
  }
  // 添加监听者
  addListener(callback) {
    this.listeners.push(callback);
  }
}
export default {
  on,
  emit
};
```

使用 eventBus：

```js
// confirm.js
// 获取事件中心
import eventBus from "./eventBus";
export function confirmDialog({ title, text, cancelText, confirmText }) {
  return new Promise((resolve, reject) => {
    // 把 reject 和 resolve 通过 emit 事件传参带过去，方便进行 Promise 状态扭转
    eventBus.emit("setDialog", {
      title,
      text,
      cancelText,
      confirmText,
      resolve,
      reject
    });
  });
}

// App.vue
// 获取事件中心
import eventBus from "./utils/eventBus";
export default {
  // 其他选型省略
  mounted() {
    this.$nextTick(() => {
      eventBus.on("setDialog", dialogInfo => {
        // 将弹窗相关信息、弹窗组件添加进 component 数组中
        this.items.push({ dialogInfo, component: ConfirmDialog });
      });
    });
  }
};
```

事件通知机制很方便，可以随意地定义触发的时机，也可以任意地点使用监听或是触发。但是事件机制的弊端也是很明显：

eventBus 事件通知方式的数据交互管理的缺点：

- 每一个事件的触发对应一个监听，关系是一一对应。
- 整个应用中看，事件监听与触发散落在各处，数据流动不明确。
- 需要定位的时候，只能通过全局搜索的方式来跟踪数据的去向。

可以定义一个中转站，所有的事件数据流都经过中转站，这样的维护方式会有所改善。这样我们在新增一个事件的时候，就不会担心和已有的事件名冲突，同时也可以使用 Typescript 来定义每个事件的参数类型，就可以稍微避免一些改动引起不必要的错误了。

### 共享对象

共享对象是很简单的一种方式，当我们需要多个地方使用相同的数据，我们就把它们放置在一个地方，大家都去那理获取和更新。使用这种方式的全局数据，是会在页面刷新之后丢失的。如果像用户的登录态信息这种需要缓存的，更好的方式是存到 cookie 或者缓存里。

```js
// globalData.js
// globalData 用来存全局数据
let globalData = {};

// 获取全局数据
// 传 key 获取对应的值
// 不传 key 获取全部值
export function getGlobalData(key) {
  return key ? globalData[key] : globalData;
}

// 设置全局数据
export function setGlobalData(key, value) {
  // 需要传键值对
  if (key === undefined || value === undefined) {
    return;
  }
  globalData = { ...globalData, [key]: value };
  return globalData;
}

// 清除全局数据
// 传 key 清除对应的值
// 不传 key 清除全部值
export function clearGlobalData(key) {
  // 需要传键值对
  if (key === undefined) {
    globalData = {};
  } else {
    delete globalData[key];
  }
  return globalData;
}
```

通过注入对象的引用，来在不同组件中获取相同的数据源。在服务端开发的时候使用这样的方式，需要考虑锁的问题，当然单线程的 JS 里面这样的情况比较少，几乎可以不考虑。同时，很多时候我们定义了一个对象，某些地方想要共享这个对象包括它的状态数据，有些地方又想要获取一个全新初始化的对象。这种情况下，我们需要考虑怎样去维护一套这种数据与实例。

### 单向数据流

在全局数据的使用变频繁之后，我们在定位问题的时候还会遇到不知道这个数据为何改变的情况，因为所有引用到这个全局数据的地方都可能对它进行改变。这种情况下，给数据的流动一个方向，则可以方便地跟踪数据的来源和去处。通过流的方式来管理状态，常见的状态管理工具像 Vuex、Redux 等，都是这样管理的。

### 树状作用域

很多时候，我们的应用通过一层层地封装和隔离，最终会呈现为树状。我们可以根据组件的树状作用域，结合共享对象的管理，来注入树状的数据结构。典型如 Angular 里，则是通过提供通用的依赖注入方式，配合树状的模块管理，可通过局部注入实例来获取共享或是隔离的数据。当然，这样的做法在其他框架中并不常见，而 Vue 中使用的更多是平级的单向数据流动，毕竟在 Angular 中树状结构的出现部分是为了优化脏检查机制，Vue 中我们只需要将数据变动更新到界面中就可以了

## Vuex 单向数据流

vuex 采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

vuex 通过单向数据流的方式来维护状态变更。所有的数据都会存到 Store 里，只能通过提交 Mutation 或者触发 Action 的方式来改变数据，在这个过程中就会形成一个单向流动：`(Action) -> Mutation -> Store -> update view`

在 Vue 组件中是通过 prop 属性和自定义事件 $on、$emit 可以实现父子组件间的通信。但很多时候我们的数据是需要跨组件、甚至跨页面进行共享，这种情况下我们需要更好的方式来维护这些全局的数据。

使用 Vuex 我们可以获得以下效果：

- 当 Vue 组件从 Store 中读取状态的时候，若 Store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。
- 改变 Store 中的状态只能通过 Action 或者 Mutation，这样使得我们可以方便地跟踪每一个状态的变化，来定位具体问题。

每一个 Vuex 应用的核心就是 store（仓库）。“store”基本上就是一个容器，它包含着你的应用中大部分的状态 (state)。Vuex 和单纯的全局对象有以下两点不同：

- Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。
- 你不能直接改变 store 中的状态。改变 store 中的状态的唯一途径就是显式地提交 (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。

### Store

Store 指数据仓库。它包含着我们应用中大部分的状态(State)。状态也是数据的一种，相比直接展示在页面中的内容，状态更多时候是控制展示方式和逻辑的一些数据。像我们常说的用户登录态、地理位置等，一般来说我们存到 Store 中的数据，大多数都是需要多组件、多页面或是整个应用中共享的数据。Vuex 通过 store 选项，提供了一种机制将状态从根组件“注入”到每一个子组件中（需调用 `Vue.use(Vuex)`）。该 store 实例会注入到根组件下的所有子组件中，且子组件能通过 `this.$store` 访问到。

### State

State 指全局的应用状态。一个绑定到界面或组件的状态变量，就像是data中的变量一样。vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。这样所有 State 的集合，就是 Store。

每个应用将仅仅包含一个 Store 实例，单一状态树让我们能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。但如果每个应用只包含了一个 Store，我们要怎样避免在不断引入全局状态的时候，避免 Store 变得臃肿呢？答案是通过 Module。

当一个组件需要获取多个状态的时候，将这些状态都声明为计算属性会有些重复和冗余。为了解决这个问题，我们可以使用 mapState 辅助函数帮助我们生成计算属性。

### Module

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。为了解决以上问题，Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割。

那如果我们在不同的页面中，有相同的一些状态命名发生了冲突，要如何解决呢？我们还可以通过添加namespaced: true的方式，来创建带命名空间的模块，同时 Module 还支持嵌套使用。

### Namespaced

默认情况下，模块内部的 action、mutation 和 getter 是注册在全局命名空间的——这样使得多个模块能够对同一 mutation 或 action 作出响应。

如果希望你的模块具有更高的封装度和复用性，你可以通过添加 namespaced: true 的方式使其成为带命名空间的模块。当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。

### Mutation

数据流的单向流动可以让开发者掌握所有数据状态的变更来源和去向。而 Mutation 的作用类似于一个守卫，所有的状态变更都必须来自 Mutation。也就是说，在 Vuex 中状态的变更只能通过提交 Mutation 来更新状态，而提交 Mutation 也只能通过 commit 对应的的事件 type 来进行。在 Vuex 中，Mutation 都是同步函数，如果是异步的话，我们的状态变更就不实时，这会影响后续其他地方获取状态的实时性。那如果我们需要异步操作，例如从后台接口拉取的数据更新，这种情况下我们可以使用 Action。

Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数。你可以向 store.commit 传入额外的参数，即 mutation 的 载荷（payload）。

在组件中使用 `this.$store.commit('xxx')` 提交 mutation，或者使用 `mapMutations` 辅助函数将组件中的 methods 映射为 store.commit 调用（需要在根节点注入 store

::: tip  为什么 mutation 必须是同步函数
有这样一种场景，我们正在 debug 一个 app 并且观察 devtool 中的 mutation 日志。每一条 mutation 被记录，devtools 都需要捕捉到前一状态和后一状态的快照。然而，如果 mutation 中使用异步函数，异步函数的回调不可能完成上述情况：因为当 mutation 触发的时候，回调函数还没有被调用，devtools 不知道什么时候回调函数实际上被调用——实质上任何在回调函数中进行的状态的改变都是不可追踪的。在 mutation 中混合异步调用会导致你的程序很难调试。例如，当你调用了两个包含异步回调的 mutation 来改变状态，你怎么知道什么时候回调和哪个先回调呢？这就是为什么我们要区分 Mutation 和 Action 这两个概念。在 Vuex 中，mutation 都是同步事务。
:::

### Action

相比与 Mutation，Action 的不同之处在于：

- Action 提交的是 Mutation，而不是直接变更状态。
- Action 可以包含任意异步操作。
- Action 通过 store.dispatch 方法触发

在组件中使用 `this.$store.dispatch('xxx')` 分发 action，或者使用 `mapActions` 辅助函数将组件的 methods 映射为 `store.dispatch` 调用

### Getter

getters 是 store 的计算属性，对 state 的加工，是派生出来的数据。就像 computed 计算属性一样，getter 返回的值会根据它的依赖被缓存起来，且只有当它的依赖值发生改变才会被重新计算。由于 Vuex 的状态存储是响应式的，从 store 实例中读取状态最简单的方法就是在计算属性中返回某个状态。

## Vuex 原理

vuex 规定所有的数据操作必须通过 `action -> mutation -> state(响应式数据)` 的流程来进行，再结合 Vue 的数据视图双向绑定特性来实现页面的展示更新。统一的页面状态管理以及操作处理，可以让复杂的组件交互与通信变得简单清晰，同时可在调试模式下进行时光机般的倒退前进操作，查看数据改变过程，使代码调试更加方便。

### vuex 单向数据流

![vuex的单向数据流](/blog/images/vue/vuex单向数据流.png)

- Vue Components：Vue组件。HTML页面上，负责接收用户操作等交互行为，执行 dispatch 方法触发对应 action 进行回应。

- dispatch：操作行为触发方法，是唯一能执行 action 的方法。

- actions：操作行为处理模块。负责处理 Vue Components 接收到的所有交互行为。包含同步/异步操作，支持多个同名方法，按照注册的顺序依次触发。向后台 API 请求的操作就在这个模块中进行，包括触发其他 action 以及提交 mutation 的操作。该模块提供了 Promise 的封装，以支持 action 的链式触发。

- commit：状态改变提交操作方法。对 mutation 进行提交，是唯一能执行 mutation 的方法。

- mutations：状态改变操作方法。是 Vuex 修改 state 的唯一**推荐**方法，**其他修改方式在严格模式下将会报错**。该方法只能进行同步操作，且方法名只能全局唯一。操作之中会有一些 hook 暴露出来，以进行 state 的监控等。

- state：页面状态管理容器对象。集中存储 Vue components 中 data 对象的零散数据，全局唯一，以进行统一的状态管理。页面显示所需的数据从该对象中进行读取，利用 Vue 的细粒度数据响应机制来进行高效的状态更新。

- getters：state 对象读取方法。图中没有单独列出该模块，应该被包含在了 render 中，Vue Components 通过该方法读取全局 state 对象。

### vuex 的组成

![vuex的构成](/blog/images/vue/vuex的构成.png)

### Q1. vuex 的 store 是如何注入到组件中呢？

利用vue的插件机制，使用 Vue.use(vuex) 时，会调用 vuex 的 install 方法，装载 vuex。applyMixin 方法使用 vue 混入机制，vuex 是利用 vue 的 mixin 混入机制，在 beforeCreate 钩子前混入 vuexInit 方法，vuexInit 方法实现了 store 注入 vue 组件实例，并注册了 vuex store 的引用属性 `$store`。store 注入过程如下图所示：

![vuex的注入过程](/blog/images/vue/vuex注入过程.png)

将初始化 Vue 根组件时传入的 store 设置到 this 对象的 `$store` 属性上，子组件从其父组件引用 `$store` 属性，层层嵌套进行设置。在任意组件中执行 `this.$store` 都能找到装载的那个 store 对象。

Vue.use(Vuex) 方法执行的是 install 方法，它实现了 Vue 实例对象的 init 方法封装和注入，使传入的 store 对象被设置到 Vue 上下文环境的 `$store` 中。因此在 Vue Component 任意地方都能够通过 `this.$store` 访问到该 store。

### Q2. state 内部支持模块配置和模块嵌套，如何实现的？

在 store 构造方法中有 makeLocalContext 方法，所有 module 都会有一个 local context，根据配置时的 path 进行匹配。所以执行如 `dispatch('user', payload)` 这类 action 时，默认的拿到都是 module 的 local state，如果要访问最外层或者是其他 module 的 state，只能从 rootState 按照 path 路径逐步进行访问。

### Q3. 为什么actions、getters、mutations中能从arguments[0]中拿到store的相关数据?

store 初始化时，所有配置的 action 和 mutation 以及 getters 均被封装过。在执行如 `dispatch('user', payload)`的时候，actions 中 type 为 user 的所有处理方法都是被封装后的，其第一个参数为当前的 store 对象，所以能够获取到 { dispatch, commit, state, rootState } 等数据。

![store注入](/blog/images/vue/store的实现.png)

### Q4. Vuex 如何区分 state 是外部直接修改，还是通过 mutation 方法修改的？

Vuex 中修改 state 的唯一渠道就是执行 `commit` 方法，其底层通过执行 `this._withCommit(fn)` 设置 `_committing` 标志变量为 true，然后才能修改 state，修改完毕还需要还原 `_committing` 变量。外部修改虽然能够直接修改 state，但是并没有修改 `_committing` 标志位，所以只要 `watch` 一下 state，state 改变时判断是否 `_committing` 值为 true，即可判断修改的合法性。

### Q5. vuex 的 state 和 getters 是如何映射到各个组件实例中响应式更新状态呢？

```js
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  // 设置 getters 属性
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  // 遍历 wrappedGetters 属性
  forEachValue(wrappedGetters, (fn, key) => {
    // 给 computed 对象添加属性
    computed[key] = partial(fn, store)
    // 重写 get 方法
    // store.getters.xx 其实是访问了store._vm[xx]，其中添加 computed 属性
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  const silent = Vue.config.silent
  Vue.config.silent = true
  // 创建Vue实例来保存state，同时让state变成响应式
  // store._vm._data.$$state = store.state
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // 只能通过commit方式更改状态
  if (store.strict) {
    enableStrictMode(store)
  }
}
```

Vuex 的 state 状态是响应式，是借助 vue 的 data 响应式，将 state 存入 vue 实例组件的 data 中；Vuex 的getters 则是借助 vue 的计算属性 computed 实现数据实时监听。

![vuex的响应式数据](/blog/images/vue/vuex响应式实现.png)

### Q6. 调试时的"时空穿梭"功能是如何实现的？

devtoolPlugin 中提供了此功能。因为 dev 模式下所有的 state 的改变都会被记录下来，'时空穿梭' 功能其实就是将当前的 state 替换为记录中某个时刻的 state状态，利用 `store.replaceState(targetState)` 方法将执行 `this._vm.state = state` 实现。

### Q7. actions 和 mutations 区别

actions 和 Mutations功能基本一样，不同点是，actions 是异步的改变 state 状态，而 Mutations 是同步改变状态。

同步的意义在于这样每一个 mutation 执行完成后都可以对应到一个新的状态（和 reducer 一样），这样 devtools 就可以打个 snapshot 存下来，然后就可以随便 time-travel 了。如果你开着 devtool 调用一个异步的 action，你可以清楚地看到它所调用的 mutation 是何时被记录下来的，并且可以立刻查看它们对应的状态----尤雨溪

::: warning 参考文献
[从头开始学习Vuex](https://github.com/ljianshu/Blog/issues/36)

[Vuex框架原理与源码分析](https://mp.weixin.qq.com/s/8Q_r3cyx1ly28GnkY_DHpQ)

[Vuex源码解析](https://github.com/answershuto/learnVue/blob/master/docs/Vuex%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90.MarkDown)
:::
