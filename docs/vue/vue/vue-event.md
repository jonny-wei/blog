# 事件绑定原理

Vue 的事件有 2 种，一种是原生 DOM 事件，一种是用户自定义事件。

Vue 中通过 `v-on` 或其语法糖 `@指令` 来给元素绑定事件并且提供了事件修饰符，基本流程是进行模板编译生成 AST，生成 render 函数后并执行得到 VNode，VNode 生成真实 DOM 节点或者组件时候使用 `addEventListener` 方法进行事件绑定。

事件绑定以及事件修饰符的使用如下：

```html
<!-- 方法处理器 -->
<button v-on:click="doThis"></button>

<!-- 动态事件 (2.6.0+) -->
<button v-on:[event]="doThis"></button>

<!-- 内联语句 -->
<button v-on:click="doThat('param', $event)"></button>

<!-- 缩写 -->
<button @click="doThis"></button>

<!-- 动态事件缩写 (2.6.0+) -->
<button @[event]="doThis"></button>

<!-- 停止冒泡 -->
<button @click.stop="doThis"></button>

<!-- 阻止默认行为 -->
<button @click.prevent="doThis"></button>

<!-- 阻止默认行为，没有表达式 -->
<form @submit.prevent></form>

<!--  串联修饰符 -->
<button @click.stop.prevent="doThis"></button>

<!-- 键修饰符，键别名 -->
<input @keyup.enter="onEnter">

<!-- 键修饰符，键代码 -->
<input @keyup.13="onEnter">

<!-- 点击回调只会触发一次 -->
<button v-on:click.once="doThis"></button>

<!-- 对象语法 (2.4.0+) -->
<button v-on="{ mousedown: doThis, mouseup: doThat }"></button>

<!-- 自定义事件 -->
<my-component @my-event="handleThis"></my-component>

<!-- 内联语句 -->
<my-component @my-event="handleThis('param', $event)"></my-component>

<!-- 组件中的原生事件 -->
<my-component @click.native="onClick"></my-component>
```

## 原理分析

Vue 在挂载实例前，有相当多的工作是进行模板的编译，将 template 模板进行编译，解析成 AST 树，再转换成 render 函数，而在编译阶段，就是对事件的指令做收集处理。在 template 模板中，定义事件的部分是属于 XML 的 Attribute，所以收集指令时需要匹配 Attributes 以确定哪个 Attribute 是属于事件。编译模板提取事件收集指令以及生成 render 字符串和 render 函数，但是事件真正的绑定到 DOM 上还是离不开事件注册，此阶段就发生在 patchVnode 过程中，在生成完成 VNode 后，进行
patchVnode 过程中创建真实 DOM 时会进行事件注册的相关钩子处理。invokeCreateHooks 就是一个模板指令处理的任务，他分别针对不同的指令为真实阶段创建不同的任务，针对事件，这里会调 updateDOMListeners 对真实的 DOM 节点注册事件任务。最终添加与移除事件都是调用的 add 与 remove 方法，最终调用的方法即 DOM 的 ddEventListener 方法与 removeEventListener 方法。

- vue 通过解析 template 里的 html 提取出 DOM 上的所有属性
- 过正则匹配出对应的事件名和对应的事件执行方法
- 通过 gen 方法生成事件虚拟渲染函数，事件作为属性注入到虚拟 DOM 里
- 在 el 的 events 里维护了事件和事件对应的内容方法以及修饰符，以及是否是动态事件名等信息
- 虚拟 DOM 转化到实际 DOM，并调用原生 addEventListener 绑定事件

### vue 如何优化事件

vue 在处理大列表绑定事件的时候，是有一定的性能问题的，框架内部没有把事件提到父节点上来做事件委托，唯一优化的是列表之间绑定的事件指向的函数都是同一个引用，且在 DOM 销毁的时候能主动销毁事件，所以能负载一定的数据量，如果业务里的确存在非常大量的数据，建议还是自己在父节点上进行事件绑定，或者改变交互，进行分页。

## 原生 DOM 事件

在 patch 过程中的创建阶段和更新阶段都会执行 updateDOMListeners，首先获取 vnode.data.on，就是 data 中对应的事件对象，target 是当前 vnode 对于的 DOM 对象，normalizeEvents 主要是对 v-model 相关的处理，接着调用 updateListeners(on, oldOn, add, remove, vnode.context) 方法。updateListeners 的逻辑很简单，遍历 on 去添加事件监听，遍历 oldOn 去移除事件监听，关于监听和移除事件的方法都是外部传入的，因为它既处理原生 DOM 事件的添加删除，也处理自定义事件的添加删除。add 和 remove 的逻辑很简单，就是实际上调用原生 addEventListener 和 removeEventListener，并根据参数传递一些配置，注意这里的 hanlder 会用 withMacroTask(hanlder) 包裹一下，实际上就是强制在 DOM 事件的回调函数执行期间如果修改了数据，那么这些数据更改推入的队列会被当做 macroTask 在 nextTick 后执行

## 自定义事件

Vue 还支持了自定义事件，并且自定义事件只能作用在组件上，如果在组件上使用原生事件，需要加 .native 修饰符，普通元素上使用 .native 修饰符无效。对于自定义事件和原生 DOM 事件处理的差异就在 updateListeners 事件添加 add 和删除 delete 的实现上的差异，自定义的事件添加删除用的是利用 Vue 定义的事件中心：

Vue 事件机制本质上就是一个发布-订阅模式的实现。vue 实例上有 4 种方法，分别是 `vm.$on`、`vm.$emit`、`vm.$off` 和 `vm.$once`。首先定义一个事件中心，通过 `$on` 订阅事件，将事件存储在事件中心里面，然后通过 `$emit` 触发事件中心里面存储的订阅事件。

```js
export function eventsMixin (Vue: Class<Component>) {
    const hookRE = /^hook:/

    Vue.prototype.$on = function (event, fn) {...}
    Vue.prototype.$once = function (event, fn) {...}
    Vue.prototype.$off = function (event, fn) {...}
    Vue.prototype.$emit = function (event) {...}
}
```

### `$on`

`vm.$on( event, callback )`

监听当前实例上的自定义事件。事件可以由 vm.\$emit 触发。回调函数会接收所有传入事件触发函数的额外参数。

```js
vm.$on("test", function(msg) {
  console.log(msg);
});
vm.$emit("test", "hi");
// => "hi"
```

#### 原理

```js
Vue.prototype.$on = function(
  event: string | Array<string>, // 订阅的事件名，可以是数组，表示订阅多个事件
  fn: Function // 回调函数，当触发所订阅的事件时会执行该回调函数
): Component {
  const vm: Component = this;
  if (Array.isArray(event)) {
    /**
     * 如果是数组，就表示需要一次性订阅多个事件，就遍历该数组，
     * 将数组中的每一个事件都递归调用$on方法将其作为单个事件订阅
     */
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$on(event[i], fn);
    }
  } else {
    /**
     * 如果不是数组，那就当做单个事件名来处理，以该事件名作为key，
     * 先尝试在当前实例的 _events 属性中获取其对应的事件列表，
     * 如果获取不到就给其赋空数组为默认值，并将第二个参数回调函数添加进去。
     * 这个 _events 属性就是用来作为当前实例的事件中心，
     * 所有绑定在这个实例上的事件都会存储在事件中心 _events 属性中。
     */

    (vm._events[event] || (vm._events[event] = [])).push(fn);
    // optimize hook:event cost by using a boolean flag marked at registration
    // instead of a hash lookup
    if (hookRE.test(event)) {
      vm._hasHookEvent = true;
    }
  }
  return vm;
};
```

### `$emit`

`vm.$emit( eventName, [...args] )`

触发当前实例上的事件。附加参数都会传给监听器回调。

#### 原理

```js
Vue.prototype.$emit = function(event: string): Component {
  const vm: Component = this;
  if (process.env.NODE_ENV !== "production") {
    const lowerCaseEvent = event.toLowerCase();
    if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
      tip(
        `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(
            vm
          )} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
      );
    }
  }
  let cbs = vm._events[event];
  if (cbs) {
    cbs = cbs.length > 1 ? toArray(cbs) : cbs;
    const args = toArray(arguments, 1);
    const info = `event handler for "${event}"`;
    for (let i = 0, l = cbs.length; i < l; i++) {
      invokeWithErrorHandling(cbs[i], vm, args, vm, info);
    }
  }
  return vm;
};
```

### `$off`

`vm.$off( [event, callback] )`

移除自定义事件监听器。

- 如果没有提供参数，则移除所有的事件监听器；
- 如果只提供了事件，则移除该事件所有的监听器；
- 如果同时提供了事件与回调，则只移除这个回调的监听器。

#### 原理

```js
Vue.prototype.$off = function(
  event?: string | Array<string>,
  fn?: Function
): Component {
  const vm: Component = this;
  // all
  if (!arguments.length) {
    vm._events = Object.create(null);
    return vm;
  }
  // array of events
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$off(event[i], fn);
    }
    return vm;
  }
  // specific event
  const cbs = vm._events[event];
  if (!cbs) {
    return vm;
  }
  if (!fn) {
    vm._events[event] = null;
    return vm;
  }
  // specific handler
  let cb;
  let i = cbs.length;
  while (i--) {
    cb = cbs[i];
    if (cb === fn || cb.fn === fn) {
      cbs.splice(i, 1);
      break;
    }
  }
  return vm;
};
```

### `$once`

`vm.$once( event, callback )`

监听一个自定义事件，但是只触发一次。一旦触发之后，监听器就会被移除。

#### 原理

该方法的作用是先订阅事件，但是该事件只能触发一次，也就是说当该事件被触发后会立即移除。要实现这个功能也不难，我们可以定义一个子函数，用这个子函数来替换原本订阅事件所对应的回调，也就是说当触发订阅事件时，其实执行的是这个子函数，然后再子函数内部先把该订阅移除，再执行原本的回调，以此来达到只触发一次的目的。

```js
Vue.prototype.$once = function(event: string, fn: Function): Component {
  const vm: Component = this;
  /**
   * 当事件event被触发时，会执行子函数on。
   * 然后在子函数内部先通过$off方法移除订阅的事件，
   * 这样确保该事件不会被再次触发，接着执行原本的回调fn
   */
  function on() {
    vm.$off(event, on);
    fn.apply(vm, arguments);
  }
  on.fn = fn;
  vm.$on(event, on);
  return vm;
};
```

## 简易版实现

```js
class Vue {
  constructor() {
    //  事件通道调度中心
    this._events = Object.create(null);
  }

  $on(event, fn) {
    if (Array.isArray(event)) {
      event.map(item => {
        this.$on(item, fn);
      });
    } else {
      (this._events[event] || (this._events[event] = [])).push(fn);
    }
    return this;
  }

  $once(event, fn) {
    function on() {
      this.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  }

  $off(event, fn) {
    if (!arguments.length) {
      this._events = Object.create(null);
      return this;
    }
    if (Array.isArray(event)) {
      event.map(item => {
        this.$off(item, fn);
      });
      return this;
    }
    const cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (!fn) {
      this._events[event] = null;
      return this;
    }
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  }

  $emit(event) {
    let cbs = this._events[event];
    if (cbs) {
      const args = [].slice.call(arguments, 1);
      cbs.map(item => {
        args ? item.apply(this, args) : item.call(this);
      });
    }
    return this;
  }
}
```

## 总结

Vue 支持 2 种事件类型，原生 DOM 事件和自定义事件，它们主要的区别在于添加和删除事件的方式不一样，并且自定义事件的派发是往当前实例上派发，但是可以利用在父组件环境定义回调函数来实现父子组件的通讯。另外要注意一点，只有组件节点才可以添加自定义事件，并且添加原生 DOM 事件需要使用 native 修饰符；而普通元素使用 .native 修饰符是没有作用的，也只能添加原生 DOM 事件。
