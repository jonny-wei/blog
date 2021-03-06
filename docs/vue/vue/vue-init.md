# 构建与初始化

## 构建版本

通常我们利用 vue-cli 去初始化我们的 Vue.js 项目的时候会询问我们用 Runtime Only 版本的还是 Runtime + Compiler 版本。

### Runtime only

编译时转化，离线编译。

 Runtime Only 版本通常需要借助如 webpack 的 vue-loader ⼯具把 `.vue` ⽂件编译成 JavaScript，因为是在编译阶段做的，所以它只包含运⾏时的 Vue.js 代码，因此代码体积也会 更轻量，性能更优。

### Runtime + Compiler

运行时，客户端编译。

如果没有对代码做预编译，但又使用了 Vue 的 template 属性并传入一个字符串，则需要在客户端编译模板，即运行时编译。因为在 Vue2.0 中，最终渲染都是通过 render 函数，如果写 template 属性，则需要编译成 render 函数，那么这个编译过程会发生运行时，所以需要带有编译器的版本。很显然，这个编译过程对性能会有一定损耗，所以通常我们更推荐使用 Runtime-Only 的 Vue.js。

## 初始化

当代码执行 `import Vue from 'vue'` 的时候，是从这个入口执行代码来初始化 Vue。Vue 实际是一个用 Function 实现的类，只能通过 `new Vue()` 实例化。


为何 Vue 不用 ES6 的 Class 去实现呢？

在 Vue 初始化文件中有很多 xxxMixin 的函数调用，并把 Vue 当参数传入，它们的功能都是给 Vue 的 prototype 上扩展一些方法，**Vue 按功能把这些扩展分散到多个模块中去实现，而不是在一个模块里实现所有，这种方式是用 Class 难以实现的**。这么做的好处是非常方便代码的维护和管理，这种编程技巧也非常值得我们去学习。


Vue.js 在整个初始化过程中，除了给它的原型 prototype 上扩展方法，还会通过 initGlobalAPI 给 Vue 这个对象本身扩展全局的静态方法，即 Vue 的 [全局API](https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80-API)。

```js
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

Vue 初始化主要就干了以下几件事情：合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等。在初始化的最后，检测到如果有 el 属性，则调用 vm.$mount 方法挂载 vm，挂载的目标就是把模板渲染成最终的 DOM。