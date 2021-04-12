# Vue 指令

`Vue.directive( id, [definition] )`

Vue对于自定义指令定义对象提供了几个钩子函数，这几个钩子函数分别对应着指令的几种状态，一个指令从第一次被绑定到元素上到最终与被绑定的元素解绑，它会经过以下几种状态：

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。
- componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
- unbind：只调用一次，指令与元素解绑时调用。
- 
有了每个状态的钩子函数，这样我们就可以让指令在不同状态下做不同的事情。

```js
// 注册
Vue.directive('my-directive', {
  bind: function () {},
  inserted: function () {},
  update: function () {},
  componentUpdated: function () {},
  unbind: function () {}
})

// 注册 (指令函数)
Vue.directive('my-directive', function () {
  // 这里将会被 `bind` 和 `update` 调用
})

// getter，返回已注册的指令
var myDirective = Vue.directive('my-directive')
```

## 自定义指令

在 Vue 中，除了 Vue 本身为我们提供的一些内置指令之外，Vue 还支持用户自定义指令。并且用户有两种定义指令的方式：一种是使用全局 API—— `Vue.directive` 来定义全局指令，这种方式定义的指令会被存放在 `Vue.options['directives']` 中；另一种是在组件内的 directive 选项中定义专为该组件使用的局部指令，这种方式定义的指令会被存放在 `vm.$options['directives']` 中。那么定义的指令什么时候才会生效呢？或者说它是如何生效的呢？

其实，在虚拟DOM渲染更新的时候，它在执行相关操作的同时，还会在每个阶段触发相应的钩子函数，我们只需监听不同的钩子函数，就可以在虚拟DOM渲染更新的不同阶段做一些额外的事情。下表给出了虚拟DOM在渲染更新的不同阶段所触发的不同的钩子函数及其触发时机：

| 钩子函数名称 | 触发时机  | 回调参数 |
| :---- | :------ | :----|
| init | 已创建VNode，在patch期间发现新的虚拟节点时被触发 | VNode |
| create | 已基于VNode创建了DOM元素 | emptyNode和VNode |
| activate  | keep-alive组件被创建 | emptyNode和innerNode  |
| insert   | VNode对应的DOM元素被插入到父节点中时被触发  | VNode  |
| prepatch  | 一个VNode即将被patch之前触发  | oldVNode和VNode       |
| update   | 一个VNode更新时触发 | oldVNode和VNode       |
| postpatch | 一个VNode被patch完毕时触发 | oldVNode和VNode       |
| destory  | 一个VNode对应的DOM元素从DOM中移除时或者它的父元素从DOM中移除时触发 | VNode |
| remove | 一个VNode对应的DOM元素从DOM中移除时触发。与destory不同的是，如果是直接将该VNode的父元素从DOM中移除导致该元素被移除，那么不会触发 | VNode和removeCallback |

所以我们只需在恰当的阶段监听对应的钩子函数来处理指令的相关逻辑，从而就可以使指令生效了。

现在我们来设想一下，在什么阶段处理指令的逻辑会比较合适？仔细想一下，当一个节点被创建成DOM元素时，如果这个节点上有指令，那此时得处理指令逻辑，让指令生效；当一个节点被更新时，如果节点更新之前没有指令，而更新之后有了指令，或者是更新前后节点上的指令发生了变化，那此时得处理指令逻辑，让指令生效；另外，当节点被移除时，那节点上的指令自然也就没有用了，此时还得处理指令逻辑。

基于以上设想，我们得出一个结论：在虚拟 DOM 渲染更新的 create、update、destory 阶段都得处理指令逻辑，所以我们需要监听这三个钩子函数来处理指令逻辑。事实上，Vue 也是这么做的：

```js
export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    updateDirectives(vnode, emptyNode)
  }
}
```

## 原理分析

我们知道如果一个 DOM 节点上绑定了指令，那么在这个 DOM 节点所对应虚拟 DOM 节点进行渲染更新的时候，不但会处理节点渲染更新的逻辑，还会处理节点上指令的相关逻辑。具体处理指令逻辑的时机是在虚拟 DOM 渲染更新的 create、update、destory 阶段。Vue 对于自定义指令定义对象提供了几个钩子函数，这几个钩子函数分别对应着指令的几种状态，我们可以根据实际的需求将指令逻辑写在合适的指令状态钩子函数中，比如，我们想让指令所绑定的元素一插入到 DOM 中就执行指令逻辑，那我们就应该把指令逻辑写在指令的 inserted 钩子函数中。在 updateDirectives 函数中就是对比新旧两份 VNode 上的指令列表，通过对比的异同点从而执行指令不同的钩子函数，让指令生效。最后，一句话概括就是：所谓让指令生效，其实就是在合适的时机执行定义指令时所设置的钩子函数。