# 生命周期

每个 Vue 实例在被创建时都要经过一系列的初始化过程——例如，需要设置数据监听、编译模板、将实例挂载到 DOM 并在数据变化时更新 DOM 等。同时在这个过程中也会运行一些叫做生命周期钩子的函数，这给了用户在不同阶段添加自己的代码的机会。生命周期并非指 Vue 中的生命周期钩子，而是指 Vue 内部从初始化到挂载 DOM 的完整流程。从`开始创建、初始化数据、编译模版、挂载 Dom -> 渲染、更新 -> 渲染、卸载`等一系列过程，我们称这是 Vue 的生命周期。

## 生命周期过程

![生命周期过程](/blog/images/vue/生命周期过程.png)

### 初始化

new Vue() --- init ---> $mount

在 new Vue() 之后。Vue 会调用挂载在其原型上的 _init 函数进行初始化，也就是这里的 init 过程，它会初始化生命周期、事件、props、methods、data、computed 与 watch 等。其中最重要的是通过 Object.defineProperty 设置 setter 与 getter 函数，用来实现响应式以及依赖收集。

初始化后会调用 $mount 进行挂载组件，如果是运行时编译（Runtime with Compiler），即不存在 render function 但是存在 template 的情况，则需要进行模板编译步骤。

### 模板编译

template --- compiler(parse,optimize,generate) ---> render 函数(VNode)

模板编译通过 Compiler 完成，compiler 可以分成 parse、optimize 与 generate 三个阶段，最终得到 render function。

#### Parse 解析

Parse 会用正则等方式解析 template 模版中的指令、class、style 等数据，形成 AST。

#### Optimize 优化

Optimize 的主要作用是标记 static 静态节点，这时 Vue 在编译过程中的优化，后面当 update 更新界面时，会有一个 patch 的过程，diff 算法会直接跳过静态节点，从而减少了比较的过程，优化了 patch 的性能。

#### Generate 生成

Generate 是将 AST 转化成 render function 字符串的过程，得到结果是 render 的字符串以及 staticRenderFns 字符串。

在经历过 Parse、Optimize 与 Generate 这三个阶段之后，组件中就会得到用于渲染 VNode 所需的 render 函数了。

### 响应式系统

在 init 过程中通过 `Object.defineProperty` 对响应式数据的 getter 和 setter 进行绑定，它使得当被设置的对象被读取的时候会执行 getter 函数，而在当被赋值的时候会执行 setter 函数。

当 render 函数被渲染的时候，因为会读取所需对象的值，所以会触发 getter 函数进行依赖收集，依赖收集的目的是将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中。

在修改对象的值时候，会触发 setter，setter 通知之前依赖收集得到的 Dep 中的每个 Watcher，告诉它们自己的值改变了，需要重新渲染视图。这时候这些 Watcher 就会开始调用 update 来更新视图，当然这中间还有一个 patch 过程以及使用队列来异步更新的策略。

### 更新视图

render ---> VNode ---> createElm/removeElm/patch(diff) ----> UI

在修改对象值时，会通过 setter => Watcher => update 的流程来修改对应的视图，那么最终是如何更新视图呢？

当数据变化后，执行 render function 就可以得到一个新的 VNode 节点，我们如果想要得到新的视图，最简单粗暴的方法就是直接解析这个新的 VNode，然后用 innerHTML 直接全部渲染到真实 DOM 中。但是其实我们只对其中的一小块内容进行了修改，这样做似乎会消耗大量成本。通过新的 VNode 与旧的 VNode 传入 patch 进行比较，经过 diff 算法得出它们的差异。最后我们只需要将这些差异的对应 DOM 进行修改即可。

### 生命周期过程总结

- 首先，在实例化的过程中，把普通的 JavaScript 对象传给 Vue 实例的 data 选项，Vue 将遍历此对象所有的属性，并使用 Object.defaineProperty 把这些属性全部转为 getter 和 setter。
- Dep 是依赖收集器。data 下的每个属性都有一个唯一的 Dep 对象，在 get 中收集仅针对该属性的依赖，然后在 set 方法中触发所有收集的依赖。
- 在 Watcher 中对表达式求值，从而触发数据的 get。在求值之前将当前 Watch 实例设置到全局，使用 pushTarget(this) 方法。
- 在 get 中收集依赖，this.subs.push(sub) 和 set 的时候触发回调 Dep.notify。
- Compile 中首先将 template 或 el 编译成 render 函数，render 函数返回一个虚拟 DOM 对象（将模版转为 render 函数的时候，实际是先生成的抽象语法树 AST，再将抽象语法树转成的 render 函数）
- 当 vm._render 执行的时候，所依赖的变量就会被求值，并被收集为依赖。按照 Vue 中 watch.js 的逻辑，当依赖的变量有变化时不仅仅回调函数被执行，实际上还要重新求值，即还要执行一遍。
- 如果还没有 preVnode 说明是首次渲染，直接创建真实 DOM。如果已经有了 prevVnode 说明不是首次渲染，那么就采用 patch 算法进行必要的 DOM 操作。这就是 Vue 更新 DOM 的逻辑。

## 生命周期钩子

![生命周期钩子](/blog/images/vue/vue生命周期钩子.png)

### Vue3 生命周期

![vue3生命周期](/blog/images/vue/vue3生命周期.png)

Vue实例的生命周期大致可分为4个阶段：

- 初始化阶段：为 Vue 实例上初始化一些属性，事件以及响应式数据；
- 模板编译阶段：将模板编译成渲染函数；
- 挂载阶段：将实例挂载到指定的 DOM 上，即将模板渲染到真实 DOM 中；
- 销毁阶段：将实例自身从父组件中删除，并取消依赖追踪及事件监听器；

### create

实例化 Vue 阶段。

在谈到 Vue 的生命周期的时候，我们首先需要创建一个实例，也就是在 new Vue() 对象过程中，首先执行了 init 函数（init 是 Vue 构造函数内部默认执行的），为当前实例完成 基础配置，包括定义 Vue 构造函数上的 静态方法 以及相关的 生命周期钩子函数。

在 beforeCreate 和 created 的钩子调用是在 initState 前后，该函数作用是初始化 props、data、methods、computed、watch 等属性，因此 beforeCreated 的钩子函数也就无法获取到 props 和 data 等定义的值，也不能调用 methods 中定义的函数。

在这俩个钩子函数执行的时候，并没有渲染 DOM，所以我们也不能够访问 DOM，一般来说，如果组件在加载的时候需要和后端有交互，放在这俩个钩子函数执行都可以，如果是需要访问 props、data 等数据的话，就需要使用 created 钩子函数。

完成配置对象的初始化后，会调用 created 生命周期钩子函数，这个时候 Vue 对象实例化完毕，DOM 树依旧未生成，页面还是一片空白，但是，实例已完成以下配置：数据观察（data observer）、属性和方法运算 以及 watch / event 事件回调。此时，该钩子函数适合 处理网络请求 等逻辑操作。

如果在实例化配置中存在 el 选项，实例将立即进入 编译阶段，否则，则停止编译，也就意味着停止了生命周期，知道在该 Vue 实例上调用 vm.$mount(el)。

编译阶段，如果存在 render 选项，则 template 将被忽略，因为 render 渲染函数是字符串模版的代替方案。如果存在 template 选项，则会通过 compiler 编译成 render function（渲染函数），预编译是在 Webpack 等构建工具中完成的，而运行时编译则是在运行时编译的。如果既无 render 选项也无 template 选项，则查找 el 选项的 outerHTML 作为 template 并编译成 render function。

::: tip 优先级
Render 选项 > template 选项 > outerHTML
:::

### mount

开始挂载前，会先执行钩子函数 beforeMount，编译 template 里的内容并在虚拟 DOM 中执行，页面上依旧没有任何展示。

接着，Vue 内部将给 vm 实例对象添加 $el 属性，并使用编译好的 HTML 内容替换 el 选项指向的 DOM 对象或者选择对应的 HTML 标签里面的内容。当真实 DOM 挂载完毕后，执行 mounted 钩子函数。此时，该钩子函数适合用于 访问真实 DOM 数据坐标信息。

::: tip 注意
created 阶段的网络请求与 mounted 请求的区别：前者页面视图未出现，如果请求信息过多，页面会长时间处于白屏状态。
:::

### update

当数据产生变化，会进入更新周期函数并先调用 beforeUpdate，这个钩子中可进一步修改 $vm.data，但是不会触发附加的重渲染过程。然后经过新旧对比产生新的 VirtualDOM 并进行重渲染，更新完成后将调用 updated 钩子函数。

当 updated 钩子调用时，组件 DOM 的 data 已经更新，所以你现在可以执行依赖于 DOM 的操作。但是不要在此时修改 data，否则会再次触发 beforeUpdate、updated 这个两个钩子，导致进入死循环。

### destroy

beforeDestroy 钩子函数在实例销毁钱调用，在这步，实例仍然可用。

beforeDestroyed 钩子函数在 Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。

[Vue3 生命周期钩子 API](https://cn.vuejs.org/api/composition-api-lifecycle.html)

### 小结

| 生命周期 | 描述   | 最佳实践|
| :----- | :---- | :----|
| beforeCreate | 组件实例被创建之初，组件的属性生效之前。在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用。数据初始化并未完成，无法访问 props、data | 常用于初始化非响应式变量，插件开发中执行一些初始化任务 |
| created | 组件初始化完毕，实例已完成以下的配置：数据观测 (data observer)，属性绑定和方法的运算，watch/event 事件回调，但真实 dom 还没有生成，`$el` 还不可用 | 常用于简单的 AJAX 请求，页面的初始化 |
| beforeMount| 在挂载开始之前被调用，相关的 render 函数首次被调用，在此阶段可获取到 `vm.el`，此阶段 `vm.el` 虽已完成`DOM` 初始化，但并未挂载在 `el` 选项上  |
| mounted| el 被新创建的 `vm.$el` 替换，并挂载到实例上去之后调用该钩子。注意 mounted 不会保证所有的子组件也都一起被挂载。如果你希望等到整个视图都渲染完毕，可以在 mounted 内部使用 `vm.$nextTick`, 该钩子在服务器端渲染期间不被调用。| 常用于获取 VNode 信息和操作，AJAX 请求|
| beforeUpdate | 数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。该钩子在服务器端渲染期间不被调用，因为只有初次渲染会在服务端进行。| 适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器|
| update| 组件数据更新之后。由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。当这个钩子被调用时，组件 DOM 已经更新，所以你现在可以执行依赖于 DOM 的操作。然而在大多数情况下，你应该避免在此期间更改状态。如果要相应状态改变，通常最好使用计算属性或 watcher 取而代之。注意 updated 不会保证所有的子组件也都一起被重绘。如果你希望等到整个视图都重绘完毕，可以在 updated 里使用 `vm.$nextTick`。该钩子在服务器端渲染期间不被调用。 | 当 updated 钩子调用时，组件 DOM 的 data 已经更新，所以你现在可以执行依赖于 DOM 的操作。但是不要在此时修改 data，否则会再次触发 beforeUpdate、updated 这个两个钩子，导致进入死循环。|
| activited | keep-alive 专属，组件被激活时调用。该钩子在服务器端渲染期间不被调用。 |
| deactivated  | keep-alive 专属，组件被销毁时调用。该钩子在服务器端渲染期间不被调用。  |
| beforeDestory | 实例销毁之前调用。在这一步，**实例仍然完全可用**。该钩子在服务器端渲染期间不被调用。| 常用于销毁定时器、解绑全局事件、销毁插件对象等操作|
| destoryed | 实例销毁后调用。该钩子被调用后，对应 Vue 实例的所有指令都被解绑，所有的事件监听器被移除，所有的子实例也都被销毁。该钩子在服务器端渲染期间不被调用。 |
| errorCaptured | 捕获一个来自子孙组件的错误时被调用 | |

### errorCaptured

errorCaptured (err: Error, vm: Component, info: string) => ?boolean

当捕获一个来自子孙组件的错误时被调用。此钩子会收到三个参数：错误对象、发生错误的组件实例以及一个包含错误来源信息的字符串。此钩子可以返回 false 以阻止该错误继续向上传播。你可以在此钩子中修改组件的状态。因此在捕获错误时，在模板或渲染函数中有一个条件判断来绕过其它内容就很重要；不然该组件可能会进入一个无限的渲染循环。

错误传播规则:

- 默认情况下，如果全局的 config.errorHandler 被定义，所有的错误仍会发送它，因此这些错误仍然会向单一的分析服务的地方进行汇报。

- 如果一个组件的继承或父级从属链路中存在多个 errorCaptured 钩子，则它们将会被相同的错误逐个唤起。

- 如果此 errorCaptured 钩子自身抛出了一个错误，则这个新错误和原本被捕获的错误都会发送给全局的 config.errorHandler。

- 一个 errorCaptured 钩子能够返回 false 以阻止错误继续向上传播。本质上是说“这个错误已经被搞定了且应该被忽略”。它会阻止其它任何会被这个错误唤起的 errorCaptured 钩子和全局的 config.errorHandler。

## 问题

### Q1. 为什么生命周期函数不能使用箭头函数

所有的生命周期钩子自动绑定 this 上下文到实例中，因此你可以访问数据，对 property 和方法进行运算。这意味着你不能使用箭头函数来定义一个生命周期方法 (例如 created: () => this.fetchTodos())。这是**因为箭头函数绑定了父上下文，因此 this 与你期待的 Vue 实例不同**，this.fetchTodos 的行为未定义。

### Q2. Vue 的父组件和子组件生命周期钩子函数执行顺序？

- 加载渲染过程

    父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted

- 子组件更新过程

    父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated

- 父组件更新过程

    父 beforeUpdate -> 父 updated

- 销毁过程

    父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed、

综上：

- 父组件的生命周期钩子在子组件之前执行，确保父组件的状态在子组件被创建时是可用的。
- 在更新和卸载阶段，父组件的钩子在子组件之前执行，保持了父子组件的顺序。

### Q3. 在哪个生命周期内调用异步请求？

如果组件在加载的时候需要和后端有交互，放在 beforeCreate、created、beforeMount、mounted 都可以，如果是需要访问 props、data 等数据的话，可以在钩子函数 created、beforeMount、mounted 中进行调用，因为在这三个钩子函数中，props、data 已经创建，可以将服务端端返回的数据进行赋值。但是本人推荐在 created 钩子函数中调用异步请求，因为在 created 钩子函数中调用异步请求有以下优点：

- 能更快获取到服务端数据，减少页面 loading 时间
- ssr 不支持 beforeMount 、mounted 钩子函数，所以放在 created 中有助于一致性

created 阶段的网络请求与 mounted 请求的区别：前者页面视图未出现，如果请求信息过多，页面会长时间处于白屏状态。
  
### Q4. 在什么阶段才能访问操作DOM？

在钩子函数 mounted 被调用前，Vue 已经将编译好的模板挂载到页面上，所以在 mounted 中可以访问操作 DOM。vue 具体的生命周期示意图可以参见如下:

![vue生命周期注释](/blog/images/vue/vue生命周期注释.png)

### Q5. 父组件可以监听到子组件的生命周期吗？

比如有父组件 Parent 和子组件 Child，如果父组件监听到子组件挂载 mounted 就做一些逻辑处理，可以通过以下写法实现：

```js
// Parent.vue
<Child @mounted="doSomething"/>
    
// Child.vue
mounted() {
  this.$emit("mounted");
}
```

以上需要手动通过 $emit 触发父组件的事件，更简单的方式可以在父组件引用子组件时通过 @hook 来监听即可，如下所示：

```js
//  Parent.vue
<Child @hook:mounted="doSomething" ></Child>

doSomething() {
   console.log('父组件监听到 mounted 钩子函数 ...');
},
    
//  Child.vue
mounted(){
   console.log('子组件触发 mounted 钩子函数 ...');
},    
    
// 以上输出顺序为：
// 子组件触发 mounted 钩子函数 ...
// 父组件监听到 mounted 钩子函数 ...     
```

当然 @hook 方法不仅仅是可以监听 mounted，其它的生命周期事件，例如：created，updated 等都可以监听。
