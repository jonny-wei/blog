# 性能方面

## 基于代理的响应系统

当前版本的 Vue 响应系统是基于 `Object.defineProperty` 的，其存在一些局限。最常见且令人沮丧的一个限制是 Vue 无法跟踪响应对象的属性添加 / 删除。
为此我们需要使用 Vue.set 和 Vue.delete 来保证响应系统的运行符合预期。有了 JS 代理后，我们终于可以摆脱这种丑陋的解决方案了。

```javascript
// Adding a new property to reacitve object in Vue 2.x
Vue.set(this.myObject, key, value)

// Adding a new property to reactive object in Vue 3
this.myObject[key] = value
```

这种改进尤为重要，因为 Vue 必须使用 getters/setters 来递归地遍历所有对象及其属性，并转换它们。由于 `Object.defineProperty` 只能对属性进行劫持，**需要遍历对象的每个属性，如果属性值也是对象，则需要深度遍历**。而  `Proxy` 直接代理对象，不需要遍历操作。使用代理后，这一过程就变得容易很多。
使用 JS 代理后，Vue3 会放弃对 IE 的支持（不包括 Edge）, 如果需要支持IE，使用兼容版本。

[Vue3 深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)

## diff 算法的优化

预编译优化。

vue2 中的虚拟 dom 是全量的对比，当 Virtual DOM 节点发生改变时，会生成新的 VNode, 该 VNode 和 oldVNode 节点作对比，如果发现有差异，则直接在真实的 DOM 上操作修改成新值，同时替换 oldVNode 的值为 VNode。

vue3 新增了静态标记（patchflag）与上次虚拟节点对比时，只对比带有 patch flag 的节点（动态数据所在的节点）；可通过 flag 信息得知当前节点要对比的具体内容。

## 静态提升 hoistStatic

在 **静态标记** 的部分我们了解到，有一些静态元素是不需要参与更新的，但是他们仍然需要每一次的创建过程，在这之后进行渲染。这个时候，通过静态提升（`_hostied` 标记的元素），就可以让指定元素只创建一次，在渲染时直接复用第一次也是唯一一次的创建结果，从而省去开销。

```vue
<div>
    <div>共创1</div>
    <div>共创2</div>
    <div>{{name}}</div>
</div>

// 静态提升前
export function render(...) {
    return (
        _openBlock(),
        _createBlock('div', null, [
            _createVNode('div', null, '共创1'),
            _createVNode('div', null, '共创2'),
            _createVNode(
                'div',
                null,
                _toDisplayString(_ctx.name),
                1 /* TEXT */
            ),
        ])
    )
}
// 静态提升后
const _hoisted_1 = /*#__PURE__*/ _createVNode(
    'div',
    null,
    '共创1',
    -1 /* HOISTED */
)
const _hoisted_2 = /*#__PURE__*/ _createVNode(
    'div',
    null,
    '共创2',
    -1 /* HOISTED */
)

export function render(...) {
    return (
        _openBlock(),
        _createBlock('div', null, [
            _hoisted_1,
            _hoisted_2,
            _createVNode(
                'div',
                null,
                _toDisplayString(_ctx.name),
                1 /* TEXT */
            ),
        ])
    )
}
```

[Vue3 渲染机制](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)

## 事件侦听器缓存

Vue2 中的事件绑定被视为动态绑定，但实际上每次点击事件执行的内容是一样的，于是在 Vue3 中，就把这个事件想办法直接缓存起来，通过复用就会提升性能。

vue2.x中，绑定事件每次触发都要重新生成全新的 function 去更新，cacheHandlers 是 Vue3 中提供的事件缓存对象，当 cacheHandlers 开启，会自动生成一个内联函数，同时生成一个静态节点。当事件再次触发时，只需从缓存中调用即可，无需再次更新。

默认情况下 onClick 会被视为动态绑定，所以每次都会追踪它的变化，但是同一个函数没必要追踪变化，直接缓存起来复用即可。

```js
export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock("div", _hoisted_1, [
    _createVNode("button", {
      onClick: _cache[1] || (_cache[1] = $event => (_ctx.confirmHandler($event)))
    }, "确认"),
    _createVNode("span", null, _toDisplayString(_ctx.vue3), 1 /* TEXT */)
  ]))
}
// 首次渲染时， 将事件缓存在 _cache[1] 中
// 再次调用时， 判断是否有缓存，如果有直接从缓存中获取事件，无需再次创建更新，减少消耗 
```

## 自定义渲染 API

vue2.x 项目架构对于 weex（移动端跨平台方案）和 myvue（小程序上使用）等渲染到不同平台不太友好，vue3.0 推出了自定义渲染 API 解决了该问题。

## 按需编译

在 Vue 3 中，通过将大多数全局 API 和内部帮助程序移至 ES 模块导出来，实现了这一目标。这使现代的打包工具可以静态分析模块依赖性并删除未使用的导出相关的代码。模板编译器还会生成友好的 Tree-shaking 代码，在模板中实际使用了该功能时才导入该功能的帮助程序。

## SSR 性能提升

Vue2 中也是有 SSR 渲染的，但是 Vue3 中的 SSR 渲染相对于 Vue2 来说，性能方面也有对应的提升。当存在大量静态内容时，这些内容会被当作纯字符串推进一个 buffer 里面，即使存在动态的绑定，会通过模版插值潜入进去。这样会比通过虚拟 dmo 来渲染的快上很多。当静态内容大到一个量级的时候，会用 `_createStaticVNode` 方法在客户端去生成一个 `static node`，这些静态 node，会被直接 `innerHtml`，就不需要再创建对象，然后根据对象渲染。

## 更好的 TS 支持

vue2 不适合使用 ts，原因在于 vue2 的 Option API 风格。options 是个简单对象，而 ts 是一种类型系统、面向对象的语法。两者有点不匹配。在 vue2 结合 ts 的具体实践中，要用 vue-class-component 强化 vue 组件，让 Script 支持 TypeScript 装饰器，用 vue-property-decorator 来增加更多结合 Vue 特性的装饰器，最终搞的ts的组件写法和js的组件写法差别挺大。

在 vue3 中，量身打造了 defineComponent 函数，使组件在 ts 下，更好的利用参数类型推断 。Composition API 代码风格中，比较有代表性的 api 就是 ref 和 reactive，也很好的支持了类型声明。

## tree-shaking

vue 第 3 大版本将支持 tree-shaking，这将意味着你如果不使用 vue 中的一些功能，它将不会出现在打包后的项目中。

在当前版本中，无论我们使用 Vue 核心中的哪些功能，所有未使用的功能最终都会进入我们的生产代码中，因为 vue 实例
是作为单个对象导出的，并且打包器无法检测出代码中使用了对象的哪些属性。在 2.x 版本中，很多函数都挂载在全局 Vue 对象上，比如 `$nextTick`、`$set` 等函数，因此虽然我们可能用不到，但打包时只要引入了 vue 这些全局函数仍然会打包进 bundle 中。

而在 Vue3 中，所有的 API 都通过 ES6 模块化的方式引入，这样就能让 webpack 或 rollup 等打包工具在打包时对没有用到 API 进行剔除，最小化 bundle 体积。采用模块化设计，支持按需导入，能有效减少最终包体积，提高加载速度。相反，Vue2 于全局 API，打包时无法去除未使用的代码，增大了包体积。

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

## 弃用时间分片

时间分片在 vue3 中是试验性支持，相对前卫。

CPU 运行 Web 应用程序的工作机制：我们有一条“主”队列（称为“主线程”），需要完成应用的所有主要任务（加载静态资源、渲染等），然后才能响应用户交互。对于某些页面来说，这可能会导致非常糟糕的用户体验，具体取决于 Vue 组件加载或重新渲染所需的时间。为了让它更加可靠，最好将任务运算过程“切成”小段，并在每小段执行后查看是否有用户输入要处理。这样，无论需要多少次渲染或重新渲染，应用程序都将保持响应状态。这就是在 Vue 3 未来版本中的工作机制。

注意：Vue3 已放弃时间分片。[为什么 Vue 3 里没有时间分片？](https://mp.weixin.qq.com/s/wclLaG4dTjlWjqvmiMMEXg)
## 识别组件重新渲染

工具与开箱即用的性能同等重要。据此，在 Vue3 中一个新的生命周期 hook `renderTriggered`。
通过它来跟踪和消除不必要的组件重新渲染，与时间分片配合使用，就成为了优化运行时性能的强大的杀器。
