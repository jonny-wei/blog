# 功能方面

## Composition API

Composition API 是 Vue 的新大版本中讨论最多的特色语法。这是一种全新的逻辑复用和代码组织方法。

目前我们用 Options API 构建组件。为了将逻辑添加到 Vue 组件中，我们要填充诸如 data、methods、computed 之类的 option 属性。这种方法的最大缺点是它本身并非有效的 JavaScript 代码。你需要准确了解模板中可以访问哪些属性，以及 this 关键字的行为。在后台，Vue 编译器需要将属性转换为可用的代码。因此我们无法享受自动提示或类型检查功能的帮助。

Composition API 会将组件属性中当前可用的机制暴露为 JavaScript 函数，从而解决这个问题。Vue 核心团队将 Composition API 定义为“一组基于函数的附加 API，可以灵活地组合组件逻辑”。Composition API 解决了 Vue2 开发过程中反复横跳的问题。因此提高了代码的可读性和可维护性。

```vue
<template>
  <button @click="increment">
    Count is: {{ count }}, double is {{ double }}, click to increment.
  </button>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)

    function increment() {
      count.value++
    }

    onMounted(() => console.log('component mounted!'))

    return {
      count,
      double,
      increment
    }
  }
}
</script>
```

现在我们将这段代码分解为几部分，看看到底发生了什么事情：

Composition API 将组件属性暴露为函数，因此第一步是导入所需的函数。在我们的示例中，我们需要用 ref 创建响应性引用、用 computed 创建计算属性， 并用 onMounted 访问挂载的生命周期 hook。

```javascript
import { ref, computed, onMounted } from 'vue'
```

setup()是一个将属性和函数返回到模板的函数，仅此而已。我们在这里声明所有响应属性、计算属性、观察者和生命周期 hooks，
然后返回它们，以便在模板中使用。没有从setup函数返回的内容将无法在模板中使用。

```javascript
export default {
  setup() {}
}
```

我们使用 ref 函数声明了称为 count 的响应属性。它可以包装任何原语或对象，并返回其响应性引用。传递的元素的值将保留在所创建引用的 value 属性中。例如，如果要访问 count 引用的值，则需要显式请求 count.value。

```javascript
const count = ref(0)
```

声明计算属性 double 和 increment 函数

```javascript

const double = computed(() => count.value * 2)

function increment() {
  count.value++
}
```

使用 onMounted hook 在组件挂载时记录了一些消息

```javascript
onMounted(() => console.log('component mounted!'))
```

最后，我们使用 increment 方法返回 count 和 double 属性，以使其在模板中可用。

```javascript
return {
  count,
  double,
  increment
}
```

[Vue3 Composition API 优点和理念](https://cn.vuejs.org/guide/extras/composition-api-faq.html)

## 代码复用新方式

目前，如果我们要在其他组件之间共享一些代码，则有两个选择可用——分别是 mixins 和作用域插槽。两者都有自己的缺点。mixins 的最大缺点是我们对它实际上添加到组件中的内容一无所知。这不仅让代码很难理解，而且还可能导致命名与已有的属性和函数发生冲突。使用作用域插槽时，我们确切地知道可以通过 v-slot 属性访问哪些属性，因此代码更容易理解。这种方法的缺点是我们只能在模板中访问它，并且只能在组件作用域中使用。

使用Composition API，我们不受模板和组件作用域的限制，并且确切地知道可以访问哪些属性。使用 hook 的形式，将相同逻辑的代码封装起来，需要用的时候直接调用函数。

使用第三方库也能变得更优雅。例如，如果我们要使用 Vuex，则可以显式使用 useStore 函数，而不用污染 Vue 原型（this.$store），这种方法也消除了 Vue 插件的幕后魔法。

```javascript
const { commit, dispatch } = useStore()
```

文档：<https://vue-composition-api-rfc.netlify.com/>

存储库：<https://github.com/LinusBorg/composition-api-demos>

## 全局挂载/配置API更改

目前我们使用全局Vue对象来提供配置并创建新的 Vue 实例。对Vue对象所做的任何更改都会影响每个 Vue 实例和组件。

```javascript
import Vue from 'vue'
import App from './App.vue'

Vue.config.ignoredElements = [/^app-/]
Vue.use(/* ... */)
Vue.mixin(/* ... */)
Vue.component(/* ... */)
Vue.directive(/* ... */)

new Vue({
  render: h => h(App)
}).$mount('#app')
```

在实例化和配置应用程序的方式方面，还有一项重大变化。看看vue3如何做的：

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.ignoredElements = [/^app-/]
app.use(/* ... */)
app.mixin(/* ... */)
app.component(/* ... */)
app.directive(/* ... */)

app.mount('#app')
```

每个配置都局限于使用createApp定义的某个 Vue 应用程序。它可以让你的代码更容易理解，并且不容易出现由第三方插件引起的意外问题。
当前，如果某些第三方解决方案正在修改 Vue 对象，则可能会以意想不到的方式（尤其是全局 mixins）影响你的应用程序，
而 Vue 3 则不会出现这种情况。

## Fragments

Vue 3 中值得期待的另一个激动人心的新功能是片段（Fragments）。如果你创建一个 Vue 组件，则它只能有一个根节点。
这意味着无法创建这样的组件：

```vue
<template>
  <div>Hello</div>
  <div>World</div>
</template>
```

原因是代表任何 Vue 组件的 Vue 实例都需要绑定到单个 DOM 元素中。想要创建具有多个 DOM 节点的组件，唯一的方法是创建一个没有基础 Vue 实例的功能组件。

事实证明，React 社区也有同样的问题。他们提出的解决方案是一个名为片段（Fragment）的虚拟元素。它看起来差不多是这个样子：

```jsx harmony
class Columns extends React.Component {
  render() {
    return (
      <React.Fragment>
        <td>Hello</td>
        <td>World</td>
      </React.Fragment>
    );
  }
}
```

尽管片段看起来像是普通的 DOM 元素，但它是虚拟的，根本不会在 DOM 树中渲染。这样我们可以将组件功能绑定到单个元素中，而无需创建多余的 DOM 节点。

目前，你可以在 Vue 2 中使用 vue-fragments 库来应用片段，而在 Vue 3 中它是开箱即用的！

## Suspense

React 生态系统中还有一个好主意也将在 Vue 3 中采用，就是 Suspense 组件。

Suspense 会暂停你的组件渲染，并渲染回退组件，直到满足一个条件为止。到头来 Suspense 只是一个具有插槽的组件：

```vue
<Suspense>
  <template >
    <Suspended-component />
  </template>
  <template #fallback>
    Loading...
  </template>
</Suspense>
```

在 Suspended 完全渲染之前将显示回退组件。Suspense 可以等待组件下载完毕（如果该组件是异步的），或者在 setup 函数中执行一些异步操作。

[Vue Suspense](https://cn.vuejs.org/guide/built-ins/suspense.html)

[Vue 异步组件](https://cn.vuejs.org/guide/components/async.html)

## 多个 v-model

v-model 是一种指令，可用于在给定组件上实现双向绑定。我们可以传递响应性属性，并从组件内部对其进行修改。

Vue3 中将 v-model 和 .sync 进行了功能的整合，抛弃了.sync，表示：多个双向绑定 value 值直接用多个 v-model 传就好了；同时也将 v-model 默认传的 prop 名称由 value 改成了 modelValue

```vue
<InviteeForm
  v-model:name="inviteeName"
  v-model:email="inviteeEmail"
/>
```

[Vue3 v-model](https://cn.vuejs.org/guide/components/v-model.html)

## Teleport

Teleport 是特殊的组件，用来在当前组件之外渲染某些内容。这也是 React 原生实现的功能之一。React 文档关于 Teleport 是这样介绍的：

>Teleport 提供了一种一流的方式来将子级渲染到父组件的 DOM 层级之外的 DOM 节点中。”

这是一种处理模态、弹出窗口以及页面顶部组件的非常好用的方法。通过 Teleport，你可以确保没有任何主机组件 CSS 规则会影响你要显示的组件，也无需使用z-index搞些小动作了。

对于每个 Teleport，我们需要指定其目标位置，在其中渲染 Teleport 内容。下面是 Teleport-vue 库的实现，它为 Vue 2 添加了这一功能：

```vue
<template>
  <button @click="showDialog = true">打开模态框</button>

  <teleport to="body">
    <div class="modal" v-if="showDialog" style="position: fixed">
      我是一个模态框
      <button @click="showDialog = false">关闭</button>
      <child-component :msg="msg"></child-component>
    </div>
  </teleport>
</template>
<script>
export default {
  data() {
    return {
      showDialog: false,
      msg: "hello"
    };
  },
};
</script>
```

Vue 3 将提供对 Teleport 的开箱即用支持！[Vue3 Teleport](https://cn.vuejs.org/guide/built-ins/teleport.html)

## 新的自定义指令 API

自定义指令 API 在 Vue 3 中将略有变化，以更好地与组件生命周期保持一致。这项更改会让 API 更加直观，从而帮助新手更容易地理解和学习 API。

这是当前的自定义指令 API：

```javascript
const MyDirective = {
  bind(el, binding, vnode, prevVnode) {},
  inserted() {},
  update() {},
  componentUpdated() {},
  unbind() {}
}
```

下面是 Vue 3 中的样子：

```javascript
const MyDirective = {
  beforeMount(el, binding, vnode, prevVnode) {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {}, // new
  unmounted() {}
}
```

虽然这是一项重大更改，使用 Vue 兼容构建也应该能轻松覆盖。

上面的内容只介绍了主要的 API 更改和改进。如果你对其他内容感到好奇，请务必查看 Vue RFCs 存储库。
Vue RFCs 存储库：<https://github.com/vuejs/rfcs/>
