# 插槽

Vue 实现了一套**内容分发的 API**，这套 API 的设计灵感源自 Web Components 规范草案，将 `<slot>` 元素作为承载分发内容的出口。

## 定义与作用

通过插槽可以让用户可以拓展组件，去更好地复用组件和对其做定制化处理。如果父组件在使用到一个复用组件的时候，获取这个组件在不同的地方有少量的更改，如果去重写组件是一件不明智的事情。通过 slot 插槽向组件内部指定位置传递内容，完成这个复用组件在不同场景的应用：比如布局组件、表格列、下拉选、弹框显示内容等

在 Vue 中插槽（Slot）的类型分为：

- 默认插槽：又名匿名插槽，当 slot 没有指定 name 属性值的时候一个默认显示插槽，一个组件内只有一个匿名插槽
- 具名插槽：带有具体名字的插槽，也就是带有 name 属性的 slot，一个组件可以出现多个具名插槽
- 作用域插槽：默认插槽、具名插槽的一个变体，可以是匿名插槽，也可以是具名插槽，该插槽的不同点是在子组件渲染作用域插槽时，可以将子组件内部的数据传递给父组件，让父组件根据子组件的传递过来的数据决定如何渲染该插槽

::: tip 编译作用域
父级模板里的所有内容都是在父级作用域中编译的；子模板里的所有内容都是在子作用域中编译的。
:::

普通插槽是在父组件编译和渲染阶段生成 vnodes，所以数据的作用域是父组件实例，子组件渲染的时候直接拿到这些渲染好的 vnodes。而对于作用域插槽，父组件在编译和渲染阶段并不会直接生成 vnodes，而是在父节点 vnode 的 data 中保留一个 scopedSlots 对象，存储着不同名称的插槽以及它们对应的渲染函数，只有在编译和渲染子组件阶段才会执行这个渲染函数生成 vnodes，由于是在子组件环境执行的，所以对应的数据作用域是子组件实例。简单地说，两种插槽的目的都是让子组件 slot 占位符生成的内容由父组件来决定，但数据的作用域会根据它们 vnodes 渲染时机不同而不同。

- 插槽就是一个返回 VNode 的函数而已。

- 普通插槽和作用域插槽根本就没有区别，因为普通插槽就是作用域插槽的子集，这也是 Vue 为什么将二者合并的原因。

## 实现原理

`slot` 本质上是返回 `VNode` 的函数，一般情况下，Vue 中的组件要渲染到页面上需要经过 `template -> render function -> VNode -> DOM` 过程，这里看看 slot 如何实现。

### 普通插槽

还是先从编译说起，我们知道编译是发生在调用 `vm.$mount` 的时候，所以编译的顺序是先编译父组件，再编译子组件。首先编译父组件，在 `parse` 阶段，会执行 `processSlot` 处理 `slot`:

```js
// src\compiler\parser\index.js
function processSlot (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
    if (process.env.NODE_ENV !== 'production' && el.key) {
      warn(
        `\`key\` does not work on <slot> because slots are abstract outlets ` +
        `and can possibly expand into multiple elements. ` +
        `Use the key on a wrapping element instead.`,
        getRawBindingAttr(el, 'key')
      )
    }
  } else {
    let slotScope
    if (el.tag === 'template') {
      slotScope = getAndRemoveAttr(el, 'scope')
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && slotScope) {
        warn(
          `the "scope" attribute for scoped slots have been deprecated and ` +
          `replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
          `can also be used on plain elements in addition to <template> to ` +
          `denote scoped slots.`,
          el.rawAttrsMap['scope'],
          true
        )
      }
      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
        warn(
          `Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
          `(v-for takes higher priority). Use a wrapper <template> for the ` +
          `scoped slot to make it clearer.`,
          el.rawAttrsMap['slot-scope'],
          true
        )
      }
      el.slotScope = slotScope
      if (process.env.NODE_ENV !== 'production' && nodeHas$Slot(el)) {
        warn('Unepxected mixed usage of `slot-scope` and `$slot`.', el)
      }
    } else {
      // 2.6 $slot support
      // Context: https://github.com/vuejs/vue/issues/9180
      // Ideally, all slots should be compiled as functions (this is what we
      // are doing in 3.x), but for 2.x e want to preserve complete backwards
      // compatibility, and maintain the exact same compilation output for any
      // code that does not use the new syntax.

      // recursively check component children for presence of `$slot` in all
      // expressions until running into a nested child component.
      if (maybeComponent(el) && childrenHas$Slot(el)) {
        processScopedSlots(el)
      }
    }
    const slotTarget = getBindingAttr(el, 'slot')
    if (slotTarget) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
      // preserve slot as an attribute for native shadow DOM compat
      // only for non-scoped slots.
      if (el.tag !== 'template' && !el.slotScope && !nodeHas$Slot(el)) {
        addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'))
      }
    }
  }
}
```

当解析到标签上有 slot 属性的时候，会给对应的 AST 元素节点添加 slotTarget 属性，然后在 codegen 阶段，在 genData 中会处理 slotTarget：

```js
if (el.slotTarget && !el.slotScope) {
  data += `slot:${el.slotTarget},`
}
```

会给 data 添加一个 slot 属性，并指向 slotTarget，之后会用到。在我们的例子中，父组件最终生成的代码如下：

```js
with(this){
  return _c('div',
    [_c('app-layout',
      [_c('h1',{attrs:{"slot":"header"},slot:"header"},
         [_v(_s(title))]),
       _c('p',[_v(_s(msg))]),
       _c('p',{attrs:{"slot":"footer"},slot:"footer"},
         [_v(_s(desc))]
         )
       ])
     ],
   1)}
```

接下来编译子组件，同样在 parser 阶段会执行 processSlot 处理函数

```js
function processSlot (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
  }
  // ...
}
```

当遇到 slot 标签的时候会给对应的 AST 元素节点添加 slotName 属性，然后在 codegen 阶段，会判断如果当前 AST 元素节点是 slot 标签，则执行 genSlot 函数:

```js
function genSlot (el: ASTElement, state: CodegenState): string {
  const slotName = el.slotName || '"default"'
  const children = genChildren(el, state)
  let res = `_t(${slotName}${children ? `,${children}` : ''}`
  const attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join(',')}}`
  const bind = el.attrsMap['v-bind']
  if ((attrs || bind) && !children) {
    res += `,null`
  }
  if (attrs) {
    res += `,${attrs}`
  }
  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`
  }
  return res + ')'
}
```

我们先不考虑 slot 标签上有 attrs 以及 v-bind 的情况，那么它生成的代码实际上就只有：

```js
const slotName = el.slotName || '"default"'
const children = genChildren(el, state)
let res = `_t(${slotName}${children ? `,${children}` : ''}`
```

这里的 slotName 从 AST 元素节点对应的属性上取，默认是 default，而 children 对应的就是 slot 开始和闭合标签包裹的内容。来看一下我们例子的子组件最终生成的代码，如下：

```js
with(this) {
  return _c('div',{
    staticClass:"container"
    },[
      _c('header',[_t("header")],2),
      _c('main',[_t("default",[_v("默认内容")])],2),
      _c('footer',[_t("footer")],2)
      ]
   )
}
```

`_t` 函数对应的就是 `renderSlot` 方法

```js
// src\core\instance\render-helpers\render-slot.js

import { extend, warn, isObject } from 'core/util/index'

/**
 * Runtime helper for rendering <slot>
 */
export function renderSlot (
  name: string,
  fallback: ?Array<VNode>,
  props: ?Object,
  bindObject: ?Object
): ?Array<VNode> {
  const scopedSlotFn = this.$scopedSlots[name]
  let nodes
  if (scopedSlotFn) { // scoped slot
    props = props || {}
    if (bindObject) {
      if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
        warn(
          'slot v-bind without argument expects an Object',
          this
        )
      }
      props = extend(extend({}, bindObject), props)
    }
    nodes = scopedSlotFn(props) || fallback
  } else {
    nodes = this.$slots[name] || fallback
  }

  const target = props && props.slot
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}
```

`renderSlot` 的参数 name 代表插槽名称 `slotName`，fallback 代表插槽的默认内容生成的 `vnode 数组`。先忽略 `scoped-slot`，只看默认插槽逻辑。如果 `this.$slot[name]` 有值，就返回它对应的 `vnode 数组`，否则返回 `fallback`。那么这个 `this.$slot` 是哪里来的呢？我们知道子组件的 `init` 时机是在**父组件执行 patch 过程**的时候，那这个时候**父组件已经编译完成了**。并且子组件在 `init` 过程中会执行 `initRender` 函数，`initRender` 的时候获取到 `vm.$slot`

```js
// src/core/instance/render.js
export function initRender (vm: Component) {
  // ...
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
}
```

`vm.$slots` 是通过执行 `resolveSlots(options._renderChildren, renderContext)` 返回的:

```js
/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
export function resolveSlots (
  children: ?Array<VNode>,
  context: ?Component
): { [key: string]: Array<VNode> } {
  const slots = {}
  if (!children) {
    return slots
  }
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      const name = data.slot
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || [])
      } else {
        slot.push(child)
      }
    } else {
      (slots.default || (slots.default = [])).push(child)
    }
  }
  // ignore slots that contains only whitespace
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }
  return slots
}
```

`resolveSlots` 方法接收 2 个参数，第一个参数 `chilren` 对应的是`父 vnode 的 children`，在我们的例子中就是 `<app-layout>` 和 `</app-layout>` 包裹的内容。第二个参数 `context` 是`父 vnode 的上下文`，也就是`父组件的 vm 实例`。

`resolveSlots` 函数的逻辑就是遍历 `chilren`，拿到每一个 child 的 data，然后通过 `data.slot` 获取到插槽名称，这个 slot 就是我们之前编译父组件在 `codegen` 阶段设置的 `data.slot`。接着以插槽名称为 key 把 child 添加到 slots 中，如果 data.slot 不存在，则是默认插槽的内容，则把对应的 child 添加到 `slots.defaults` 中。这样就获取到整个 `slots`，它是一个对象，key 是插槽名称，`value` 是一个 vnode 类型的数组，因为它可以有多个同名插槽。

这样我们就拿到了 `vm.$slots` 了，回到 `renderSlot` 函数，`const slotNodes = this.$slots[name]`，我们也就能根据插槽名称获取到对应的 vnode 数组了，这个数组里的 vnode 都是在父组件创建的，这样就实现了在父组件替换子组件插槽的内容了。

对应的 slot 渲染成 vnodes，作为当前组件渲染 vnode 的 children，之后的渲染过程之前分析过，不再赘述。

我们知道在普通插槽中，父组件应用到子组件插槽里的数据都是绑定到父组件的，因为它渲染成 vnode 的时机的上下文是父组件的实例。但是在一些实际开发中，我们想通过子组件的一些数据来决定父组件实现插槽的逻辑，Vue 提供了另一种插槽 —— 作用域插槽

### 作用域插槽

作用域插槽就是将子组件的数据反馈到父组件，父组件对数据进行编辑，然后再插入到子组件指定位置。在编译阶段，仍然是先编译父组件，同样是通过 `processSlot` 函数去处理 `scoped-slot`:

```js
function processSlot (el) {
  // ...
  let slotScope
  if (el.tag === 'template') {
    slotScope = getAndRemoveAttr(el, 'scope')
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && slotScope) {
      warn(
        `the "scope" attribute for scoped slots have been deprecated and ` +
        `replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
        `can also be used on plain elements in addition to <template> to ` +
        `denote scoped slots.`,
        true
      )
    }
    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
  } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
      warn(
        `Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
        `(v-for takes higher priority). Use a wrapper <template> for the ` +
        `scoped slot to make it clearer.`,
        true
      )
    }
    el.slotScope = slotScope
  }
  // ...
} 
```

读取 scoped-slot 属性并赋值给当前 AST 元素节点的 slotScope 属性，接下来在构造 AST 树的时候，会执行以下逻辑：

```js
if (element.elseif || element.else) {
  processIfConditions(element, currentParent)
} else if (element.slotScope) { 
  currentParent.plain = false
  const name = element.slotTarget || '"default"'
  ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
} else {
  currentParent.children.push(element)
  element.parent = currentParent
}
```

可以看到对于拥有 scopedSlot 属性的 AST 元素节点而言，是不会作为 children 添加到当前 AST 树中，而是存到父 AST 元素节点的 scopedSlots 属性上，它是一个对象，以插槽名称 name 为 key。

然后在 genData 的过程，会对 scopedSlots 做处理：

```js
if (el.scopedSlots) {
  data += `${genScopedSlots(el.scopedSlots, state)},`
}

function genScopedSlots (
  slots: { [key: string]: ASTElement },
  state: CodegenState
): string {
  return `scopedSlots:_u([${
    Object.keys(slots).map(key => {
      return genScopedSlot(key, slots[key], state)
    }).join(',')
  }])`
}

function genScopedSlot (
  key: string,
  el: ASTElement,
  state: CodegenState
): string {
  if (el.for && !el.forProcessed) {
    return genForScopedSlot(key, el, state)
  }
  const fn = `function(${String(el.slotScope)}){` +
    `return ${el.tag === 'template'
      ? el.if
        ? `${el.if}?${genChildren(el, state) || 'undefined'}:undefined`
        : genChildren(el, state) || 'undefined'
      : genElement(el, state)
    }}`
  return `{key:${key},fn:${fn}}`
}
```

genScopedSlots 就是对 scopedSlots 对象遍历，执行 genScopedSlot，并把结果用逗号拼接，而 genScopedSlot 是先生成一段函数代码，并且函数的参数就是我们的 slotScope，也就是写在标签属性上的 scoped-slot 对应的值，然后再返回一个对象，key 为插槽名称，fn 为生成的函数代码。

对于我们这个例子而言，父组件最终生成的代码如下：

```js
with(this){
  return _c('div',
    [_c('child',
      {scopedSlots:_u([
        {
          key: "default",
          fn: function(props) {
            return [
              _c('p',[_v("Hello from parent")]),
              _c('p',[_v(_s(props.text + props.msg))])
            ]
          }
        }])
      }
    )],
  1)
}
```

可以看到它和普通插槽父组件编译结果的一个很明显的区别就是没有 children 了，data 部分多了一个对象，并且执行了 `_u` 方法，在编译章节我们了解到，`_u` 函数对的就是 `resolveScopedSlots` 方法

```js
export function resolveScopedSlots (
  fns: ScopedSlotsData, // see flow/vnode
  res?: Object
): { [key: string]: Function } {
  res = res || {}
  for (let i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn
    }
  }
  return res
}
```

其中，`fns` 是一个数组，每一个数组元素都有一个 key 和一个 fn，key 对应的是插槽的名称，fn 对应一个函数。整个逻辑就是遍历这个 fns 数组，生成一个对象，对象的 key 就是插槽名称，value 就是函数。

再来看一下子组件的编译，和普通插槽的过程基本相同，唯一一点区别是在 genSlot 的时候：

```js
function genSlot (el: ASTElement, state: CodegenState): string {
  const slotName = el.slotName || '"default"'
  const children = genChildren(el, state)
  let res = `_t(${slotName}${children ? `,${children}` : ''}`
  const attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join(',')}}`
  const bind = el.attrsMap['v-bind']
  if ((attrs || bind) && !children) {
    res += `,null`
  }
  if (attrs) {
    res += `,${attrs}`
  }
  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`
  }
  return res + ')'
}
```

它会对 attrs 和 v-bind 做处理，对应到我们的例子，最终生成的代码如下:

```js
with(this){
  return _c('div',
    {staticClass:"child"},
    [_t("default",null,
      {text:"Hello ",msg:msg}
    )],
  2)}
```

`_t` 方法我们之前介绍过，对应的是 renderSlot 方法：

```js
export function renderSlot (
  name: string,
  fallback: ?Array<VNode>,
  props: ?Object,
  bindObject: ?Object
): ?Array<VNode> {
  const scopedSlotFn = this.$scopedSlots[name]
  let nodes
  if (scopedSlotFn) {
    props = props || {}
    if (bindObject) {
      if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
        warn(
          'slot v-bind without argument expects an Object',
          this
        )
      }
      props = extend(extend({}, bindObject), props)
    }
    nodes = scopedSlotFn(props) || fallback
  } else {
    // ...
  }

  const target = props && props.slot
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}
```

只关注作用域插槽的逻辑，那么这个 this.$scopedSlots 又是在什么地方定义的呢:

```js
 if (_parentVnode) {
  vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject
}
```

这个 `_parentVNode.data.scopedSlots` 对应的就是我们在父组件通过执行 `resolveScopedSlots` 返回的对象。所以回到 `genSlot` 函数，我们就可以通过插槽的名称拿到对应的 `scopedSlotFn`，然后把相关的数据扩展到 props 上，作为函数的参数传入，原来之前我们提到的函数这个时候执行，然后返回生成的 vnodes，为后续渲染节点用。

## 小结

普通插槽和作用域插槽的实现。它们有一个很大的差别是数据作用域，普通插槽是在父组件编译和渲染阶段生成 vnodes，所以数据的作用域是父组件实例，子组件渲染的时候直接拿到这些渲染好的 vnodes。而对于作用域插槽，父组件在编译和渲染阶段并不会直接生成 vnodes，而是在父节点 vnode 的 data 中保留一个 `scopedSlots` 对象，存储着不同名称的插槽以及它们对应的渲染函数，只有在编译和渲染子组件阶段才会执行这个渲染函数生成 vnodes，由于是在子组件环境执行的，所以对应的数据作用域是子组件实例。

简单地说，两种插槽的目的都是让子组件 slot 占位符生成的内容由父组件来决定，但数据的作用域会根据它们 vnodes 渲染时机不同而不同。

- `v-slot`属性只能在`<template>`上使用，但在只有默认插槽时可以在组件标签上使用
- 默认插槽名为`default`，可以省略default直接写`v-slot`
- 缩写为`#`时不能不写参数，写成`#default`
- 可以通过解构获取`v-slot={user}`，还可以重命名`v-slot="{user: newName}"`和定义默认值`v-slot="{user = '默认值'}"`
