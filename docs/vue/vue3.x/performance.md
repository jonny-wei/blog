# 性能方面

## tree-shaking (摇树优化)

vue 第 3 大版本将支持 tree-shaking，这将意味着你如果不使用 vue 中的一些功能，它将不会出现在打包后的项目中。

摇树是前端开发中的一个概念，涉及消除无效代码或未使用的代码。它取决于 ES6（ES2015）中导入和导出模块的静态语法。
通过在编写代码时考虑摇树概念，我们可以通过消除未使用的 JavaScript 来显着缩小捆绑包的大小，从而优化应用程序并提高其性能。

在当前版本中，无论我们使用 Vue 核心中的哪些功能，所有未使用的功能最终都会进入我们的生产代码中，因为 vue 实例
是作为单个对象导出的，并且打包器无法检测出代码中使用了对象的哪些属性。

```javascript
 // Vue 2.x - whole `Vue` object is bundled for production
import Vue from 'vue' // 如你所见，我们将整个vue实例导入了代码中

Vue.nextTick(() => {})
const obj =  Vue.observable({})
```
vue3 将通过命名导入导出大多数 API 使全局 API 支持 tree-shaking，以便打包器可以检测出未使用的代码并删除它们。

```javascript
 // Vue 3.x - only imported properties are bundled
import { nextTick, observable } from 'vue' // 如你所见，通过命名导入

nextTick(() => {})
const obj = observable({})
```
tree-shaking 依赖 es6 的模块引入或输出语法。

tree-shaking 的本质是消除无用的代码。在传统的编程语言编译器中，编译器可以判断出某些代码根本不影响输出，然后消除这些代码，
这个称之为 DCE（dead code elimination）。

tree-shaking 是 DCE 的一种新的实现，javascript 同传统的编程语言不同，我们通过网络请求加载静态资源(多数是JS文件)，加载的文件越小，整体执行时间越短，
所以去除无用代码以减少文件体积，对 javascript 来说意义很大。

传统的 DCE 消除`不可能执行的代码`，而 tree-shaking 消除`没有用到的代码`。

所谓静态分析就是不执行代码，从字面量上对代码进行分析，ES6 之前的模块化，比如我们可以动态 require 一个模块，只有执行后才知道引用的什么模块。
这个就不能通过静态分析去做优化。这是 ES6 modules 在设计时的一个重要考量，也是为什么没有直接采用 CommonJS，正是基于这个基础上，
才使得 tree-shaking 成为可能，这也是为什么 rollup 和 webpack(webpack2开始使用tree-shaking) 都要用 ES6 module syntax 才能 tree-shaking。

## 基于代理的响应系统

当前版本的 Vue 响应系统是基于 Object.defineProperty 的，其存在一些局限。最常见且令人沮丧的一个限制是 Vue 无法跟踪响应对象的属性添加 / 删除。
为此我们需要使用 Vue.set 和 Vue.delete 来保证响应系统的运行符合预期。有了 JS 代理后，我们终于可以摆脱这种丑陋的解决方案了。

```javascript
// Adding a new property to reacitve object in Vue 2.x
Vue.set(this.myObject, key, value)

// Adding a new property to reactive object in Vue 3
this.myObject[key] = value
```
这种改进尤为重要，因为 Vue 必须使用 getters/setters 来递归地遍历所有对象及其属性，并转换它们。使用代理后，这一过程就变得容易很多。
使用 JS 代理后，Vue3 会放弃对 IE 的支持（不包括 Edge）, 如果需要支持IE，使用兼容版本。

## 时间分片

时间分片在 vue3 中是试验性支持，相对前卫。

CPU 运行 Web 应用程序的工作机制：我们有一条“主”队列（称为“主线程”），需要完成应用的所有主要任务（加载静态资源、渲染等），然后才能响应用户交互。
对于某些页面来说，这可能会导致非常糟糕的用户体验，具体取决于 Vue 组件加载或重新渲染所需的时间。

为了让它更加可靠，最好将任务运算过程“切成”小段，并在每小段执行后查看是否有用户输入要处理。这样，无论需要多少次渲染或重新渲染，
应用程序都将保持响应状态。这就是在 Vue 3 未来版本中的工作机制。

## 识别组件重新渲染

工具与开箱即用的性能同等重要。据此，在 Vue3 中一个新的生命周期 hook `renderTriggered`。
通过它来跟踪和消除不必要的组件重新渲染，与时间分片配合使用，就成为了优化运行时性能的强大的杀器。