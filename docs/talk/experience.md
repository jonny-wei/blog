# 撸码点滴

## Vue

### 通过 v-html 渲染富文本

可能会导致 xss 攻击

`v-html` 更新的是元素的 innerHTML 。内容按普通 HTML 插入， 不会作为 Vue 模板进行编译 。

但是有的时候我们需要渲染的 html 片段中有插值表达式，或者按照 Vue 模板语法给 dom 元素绑定了事件。

在单文件组件里，scoped 的样式不会应用在 `v-html` 内部，因为那部分 HTML 没有被 Vue 的模板编译器处理。如果你希望针对 `v-html` 的内容设置带作用域的 CSS，你可以替换为 CSS Modules 或用一个额外的全局 `<style>` 元素手动设置类似 BEM 的作用域策略。

后台返回的 html 片段，以及 css 样式和 js，但是返回的 js 是不执行的，因为浏览器在渲染的时候并没有将 js 渲染，这时要在 \$nextTick 中动态创建 script 标签并插入

[处理 v-html 的潜在 XSS 风险](https://blog.csdn.net/lj1530562965/article/details/108790220)

### 多选拖拽与排序

场景：项目中要做一个一份数据在多个列表之间拖拽分配并排序，且要支持多选拖拽的功能

调研：轮子市场转了一圈，找到了一个 [Vue.Draggable](https://github.com/SortableJS/Vue.Draggable) 的组件，Vue.Draggable 使用基于 sortable.js 实现拖拽排序功能，支持 vue 过渡动画，支持智能滚动(选中拖拽要让它自动滚动列表)，支持撤销操作等，非常适合使用。但是这个组件没有集成元素多选功能(例如 windows 中文件的多选，shift、ctrl 的多选)，然而 sortable.js 这个库以插件的方式实现了多选的功能，Vue.Draggable 又是基于 sortable.js 的，所以最后只能在 Vue.Draggable 源码中引入 sortable.js 的 [MultiDrag](https://github.com/SortableJS/Sortable/tree/master/plugins) 插件。

使用： [Vue.Draggable 文档总结](https://blog.csdn.net/zjiang1994/article/details/79809687)

```js
// vuedraggable.js

// 引入 MultiDrag 插件
import Sortable, { MultiDrag } from 'sortablejs';
import {
  insertNodeAt, camelize, console, removeNode,
} from './helper';

if (MultiDrag && !MultiDrag.singleton) {
  MultiDrag.singleton = new MultiDrag();
  Sortable.mount(MultiDrag.singleton);
}

const props = {
  ...
  // 加入 multiDrag 与 selectedClass 的 props
  multiDrag: {
    type: Boolean,
    required: false,
    default: false,
  },
  selectedClass: {
    type: String,
    required: false,
    default: null,
  },
};

mounted() {
  // 合并 options
  if (this.multiDrag) {
      options.multiDrag = true;
      options.selectedClass = this.selectedClass;
    }
  // 实例化 Sortable
  this._sortable = new Sortable(this.rootContainer, options);
}
```

## JS

### for, for...in, for...of, forEach, map 对比

- for

  - 可遍历数组，字符串。不可遍历自定义或原型链上的自定义属性

- forEach

  - 只能遍历数组。不可遍历自定义或原型链上的自定义属性。forEach 从头遍历到尾，不能使用 break、continue 跳出循环体，for 可以。

- for...in(key)

  - 可遍历对象，数组，字符串。以原始插入顺序访问对象的可枚举属性，包括从原型继承而来的可枚举属性。**可遍历自定义或原型链上的自定义属性**。遍历数组时不一定会按照数组的索引顺序，更适合遍历对象。当不想遍历原型链上的属性时可使用 Object.hasOwnProperty() 过滤自身以外的属性。

- for...of(value)[常用]

- ES6 中引入，以替代 for...in 和 forEach ，并支持新的迭代协议。允许遍历数组，字符串，Map（映射），Set（集合），TypedArray，arguments 对象等可迭代的数据结构。不可遍历自定义或原型链上的自定义属性。根据值遍历，弥补 for...in 不能根据值遍历的不足，ES6 语法，兼容性不好。

* map

  - 只能遍历数组，不可遍历自定义或原型链上的自定义属性。map 返回一个新数组，新数组的内容是回调函数的返回值，可以用来克隆数组。

### 四种相等性算法

- 严格相等比较 ===, indexOf, lastIndexOf 认为 NaN 与 NaN 不等，+0 与 -0 相等
- 非严格相等比较 ==
- 同值零 Set，Map，include 等 认为 NaN 与 NaN 相等，+0 与 -0 相等
- 同值 Object.is() 认为 NaN 与 NaN 相等，+0 与 -0 不等

### 强制类型转换规则

转布尔值规则：

- undefined、null、false、NaN、''、0、-0 都转为 false。
- 其他所有值都转为 true，包括所有对象。

转数字规则：

- true 为 1，false 为 0
- null 为 0，undefined 为 NaN，symbol 报错
- 字符串看内容，如果是数字或者进制值就正常转，否则就 NaN

### 相等运算符 == 隐式转换规则

相等运算符 == 会对操作值进行隐式转换后进行比较

- 如果其中一个操作值为布尔值，则在比较之前先将其转换为数值
- 如果其中一个操作值为字符串，另一个操作值为数值，则通过 Number() 函数将字符串转换为数值
- 如果其中一个操作值是对象，另一个不是，则调用对象的 valueOf() 方法，得到的结果按照前面的规则进行比较
- null 与 undefined 是相等的
- 如果一个操作值为 NaN，则返回 false
- 如果两个操作值都是对象，则比较它们是不是指向同一个对象

```js
"1" == true; // true
"1" == 1; // true
"1" == {}; // false
"1" == []; // false
undefined == undefined; // true
undefined == null; // true
nul == null; // true
```

### 5 种类型检测

- typeof： typeof 操作符适合对 基本类型（除 null 之外）及 function 的检测使用，而对引用数据类型（如 Array）等不适合使用。
- instanceof：instanceof 运算符用与检测一个对象在其 原型链 中是否存在一个构造函数的 prototype 属性。不同 window 或 iframe 之间的对象类型检测无法使用 instanceof 检测。
- Object.prototype.toString：Object.prototype.toString 属于 Object 的原型方法，而 Array ， Function 等类型作为 Object 的实例，都重写了 toString 方法。因此，不同对象类型调用 toString 方法时，调用的是重写后的 toString 方法，而非 Object 上原型 toString 方法。`Object.prototype.toString.call(value).slice(8, -1)`
- constructor：任何对象都有 constructor 属性，继承自原型对象，constructor 会指向构造这个对象的构造器或构造函数。`Student.prototype.constructor === Student;`
- Array.isArray()：数组检测

此外 `Number.isNaN()` 判断 NaN；类似使用原型链上的方法判断数组与对象：obj.push() push is not a function。

### setTimeout 和 setImmediate

定时器线程其实只是一个计时的作用，他并不会真正执行时间到了的回调，真正执行这个回调的还是 JS 主线程。所以当时间到了定时器线程会将这个回调事件给到事件触发线程，然后事件触发线程将它加到事件队列里面去。最终 JS 主线程从事件队列取出这个回调执行。事件触发线程不仅会将定时器事件放入任务队列，其他满足条件的事件也是他负责放进任务队列。

setTimeout(fn, 0) 不是立即执行的意思，而是任务 fn 会添加到 event-loop 的事件队列中。仅当，浏览器处理事件队列时， 0 毫秒，确保让这个任务 fn 会被执行。setImmediate 就是 setTimeout(fn, 0) 的替代函数。新旧两种解决方案，目的都是，为了让浏览器处理 更重要的任务时 进行让道。与 setTimeout(fn, 0) 不同的是，setImmediate 的处理优先级更高，即 setImmediate 优先于 setTimeout 执行。setImmediate 的设计更像 nodejs 中的 process.nextTick。process.nextTick 不在 Event Loop 的任何阶段，他是一个特殊 API，他会立即执行，然后才会继续执行 Event Loop。
