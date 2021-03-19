# Vuex 实现原理

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

### Store

Store 指数据仓库。它包含着我们应用中大部分的状态(State)。状态也是数据的一种，相比直接展示在页面中的内容，状态更多时候是控制展示方式和逻辑的一些数据。像我们常说的用户登录态、地理位置等，一般来说我们存到 Store 中的数据，大多数都是需要多组件、多页面或是整个应用中共享的数据。


### State 

State 指全局的应用状态。一个绑定到界面或组件的状态变量，就像是data中的变量一样。vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。这样所有 State 的集合，就是 Store。

每个应用将仅仅包含一个 Store 实例，单一状态树让我们能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。但如果每个应用只包含了一个 Store，我们要怎样避免在不断引入全局状态的时候，避免 Store 变得臃肿呢？答案是通过 Module

### Module

为了解决应用变得复杂时 Store 难以维护，Vuex 允许我们将 Store 分割成模块 Module。每个模块拥有自己的 State、Mutation、Action 等，其实相当于我们将一个 Store 单一对象分成多个对象来维护，但最终也会合并为一个来进行更新，这样即使是多个模块也能够对同一 Mutation 或 Action 作出响应。

那如果我们在不同的页面中，有相同的一些状态命名发生了冲突，要如何解决呢？我们还可以通过添加namespaced: true的方式，来创建带命名空间的模块，同时 Module 还支持嵌套使用。

### Mutation

数据流的单向流动可以让开发者掌握所有数据状态的变更来源和去向。而 Mutation 的作用类似于一个守卫，所有的状态变更都必须来自 Mutation。也就是说，在 Vuex 中状态的变更只能通过提交 Mutation 来更新状态，而提交 Mutation 也只能通过 commit 对应的的事件 type 来进行。在 Vuex 中，Mutation 都是同步函数，如果是异步的话，我们的状态变更就不实时，这会影响后续其他地方获取状态的实时性。那如果我们需要异步操作，例如从后台接口拉取的数据更新，这种情况下我们可以使用 Action。

### Action

相比与 Mutation，Action 的不同之处在于：

-  Action 提交的是 Mutation，而不是直接变更状态。
- Action 可以包含任意异步操作。


### Getter

Getter 类似于 computed 之类的，Getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算


[从头开始学习Vuex](https://github.com/ljianshu/Blog/issues/36)