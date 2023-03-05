# Vue 修饰符

在Vue中，修饰符处理了许多DOM事件的细节，让我们不再需要花大量的时间去处理这些烦恼的事情，而能有更多的精力专注于程序的逻辑处理

vue中修饰符分为以下五种：

- 表单修饰符
- 事件修饰符
- 鼠标按键修饰符
- 键盘修饰符
- v-bind 修饰符

## 表单修饰符

在我们填写表单的时候用得最多的是 input 标签，指令用得最多的是 v-model

关于表单的修饰符有如下：

- lazy 光标离开标签的时候，才会将值赋予给 value，也就是在 change 事件之后再进行信息同步
- trim 动过滤用户输入的首空格字符，而中间的空格不会过滤
- number 自动将用户的输入值转为数值类型，但如果这个值无法被parseFloat解析，则会返回原来的值

## 事件修饰符

事件修饰符是对事件捕获以及目标进行了处理，有如下修饰符：

- stop 阻止了事件冒泡，相当于调用了 `event.stopPropagation` 方法。 阻止事件冒泡。

```js
<div @click="shout(2)">
  <button @click.stop="shout(1)">ok</button>
</div>
//只输出1
```

- prevent 阻止了事件的默认行为，相当于调用了 `event.preventDefault` 方法。阻止默认事件。

```js
<form v-on:submit.prevent="onSubmit"></form>
```

- self 只当在 `event.target` 是当前元素自身时触发处理函数。将事件绑定在自身身上，相当于阻止事件冒泡。
- once 绑定了事件以后只能触发一次，第二次就不会触发
- capture 使事件触发从包含这个元素的顶层开始往下触发。用于事件捕获。
- passive 在移动端，当我们在监听元素滚动事件的时候，会一直触发 onscroll 事件会让我们的网页变卡，因此我们使用这个修饰符的时候，相当于给 onscroll 事件整了一个 `.lazy` 修饰符

```html
<!-- 滚动事件的默认行为 (即滚动行为) 将会立即触发 -->
<!-- 而不会等待 `onScroll` 完成  -->
<!-- 这其中包含 `event.preventDefault()` 的情况 -->
<div v-on:scroll.passive="onScroll">...</div>
```

- native 让组件变成像 html 内置标签那样监听根元素的原生事件，否则组件上使用 v-on 只会监听自定义事件。绑定原生事件。

::: tip 注意

- 使用修饰符时，顺序很重要；相应的代码会以同样的顺序产生。因此，用 `v-on:click.prevent.self` 会阻止所有的点击，而 `v-on:click.self.prevent` 只会阻止对元素自身的点击
- 不要把 .passive 和 .prevent 一起使用，因为 .prevent 将会被忽略，同时浏览器可能会向你展示一个警告。passive 会告诉浏览器你不想阻止事件的默认行为。
- 使用 .native 修饰符来操作普通 HTML 标签是会令事件失效的
:::

## 鼠标按键修饰符

鼠标按键修饰符针对的就是左键、右键、中键点击，有如下：

- left 左键点击
- right 右键点击
- middle 中键点击

## 键盘修饰符

键盘修饰符是用来修饰键盘事件（onkeyup，onkeydown）的，有如下：

keyCode存在很多，但 vue 为我们提供了别名，分为以下两种：

- 普通键（enter、tab、delete、space、esc、up...）
- 系统修饰键（ctrl、alt、meta、shift...）
- 还可以通过以下方式自定义一些全局的键盘码别名 `Vue.config.keyCodes.f2 = 113`
- .exact 修饰符允许你控制由精确的系统修饰符组合触发的事件。(2.5.0新增)

```html
<!-- 即使 Alt 或 Shift 被一同按下时也会触发 -->
<button v-on:click.ctrl="onClick">A</button>

<!-- 有且只有 Ctrl 被按下的时候才触发 -->
<button v-on:click.ctrl.exact="onCtrlClick">A</button>

<!-- 没有任何系统修饰符被按下的时候才触发 -->
<button v-on:click.exact="onClick">A</button>
```

## v-bind 修饰符

v-bind 修饰符主要是为属性进行操作，用来分别有如下：

- sync 能对 props 进行一个双向绑定
- prop 设置自定义标签属性，避免暴露数据，防止污染 HTML 结构
- camel 将命名变为驼峰命名法，如将 view-Box 属性名转换为 viewBox

```js
//父组件
<comp :myMessage.sync="bar"></comp> 
//子组件
this.$emit('update:myMessage',params);

// 相当于
//父亲组件
<comp :myMessage="bar" @update:myMessage="func"></comp>
func(e){
 this.bar = e;
}
//子组件js
func2(){
  this.$emit('update:myMessage',params);
}
```

::: tip 使用 sync 需要注意以下几点：

- 使用 sync 的时候，子组件传递的事件名格式必须为 `update:value`，其中 value 必须与子组件中 props 中声明的名称完全一致

- 注意带有 .sync 修饰符的 v-bind 不能和表达式一起使用

- 将 `v-bind.sync` 用在一个字面量的对象上，例如 `v-bind.sync=”{ title: doc.title }”`，是无法正常工作
:::

::: warning 参考文献
[vue 修饰符](https://cn.vuejs.org/v2/guide/events.html#%E4%BA%8B%E4%BB%B6%E4%BF%AE%E9%A5%B0%E7%AC%A6)
:::
