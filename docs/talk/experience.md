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

## CSS

### 清除浮动的几种方法

#### 浮动元素的父元素设置固定高度

子元素为浮动元素脱离文档流，父元素无法获取子元素高度因此无法被撑高，通过设置父元素高度，避免与父容器处于相同文档流下的块级元素顶上

缺点：只适合高度固定的布局，要给出精确的高度，如果高度和父级 `div` 不一样时，会产生问题

不推荐

#### 添加空标签子元素

与浮动元素同级额外添加一个空标签子元素，为其设置 clear 属性为 both 清除浮动，让父级元素能自动获取到高度

缺点：如果页面浮动布局多，就要增加很多空 `div`，让人感觉很不好

不推荐

#### 添加 br 标签作为空标签

原理其实和第二种方法一样，只是这里的空标签使用的是 `<br/>` 标签。同样需要设置 clear 为 both。

不推荐

#### 父元素设置伪类作为空标签

父级块级元素定义 伪类 `:after` 和 `zoom`。原理与添加空标签类似，伪类会在父元素尾部添加一个子元素，内容为空并设置为隐藏不可见。

推荐使用，建议定义公共类，以减少 CSS 代码。

#### 使用 overflow: hidden 触发 BFC

定义父元素的 overflow 为 hidden，width 或 zoom 设定为 1，同时不能定义容器高度，父元素触发实现 BFC

只推荐没有使用 position 或对 overflow: hidden 理解比较深的开发者使用。

#### 使用 overflow: auto 触发 BFC

定义父元素的 overflow 为 auto，width 或 zoom 设定为 1，同时不能定义容器高度，父元素触发实现 BFC。

缺点：内部宽高超过父级 div 时，会出现滚动条。

不推荐使用，如果你需要出现滚动条或者确保你的代码不会出现滚动条就使用吧

#### 设置父元素浮动触发 BFC

将包裹浮动元素的父元素设置为浮动元素，从而触发 BFC

缺点：会产生新的浮动问题。

不推荐使用。

#### 设置父级为表格元素触发 BFC

将父级元素变成表格元素，从而触发 BFC

缺点：会产生新的未知问题。

不推荐使用

### 水平居中

- 内联元素：`text-align: center`
- 块级元素：`margin: 0 auto`
- 内联块实现：将行内多个元素设定为 inline-block 行内块，然后在父元素添加 text-align。
- 弹性布局：`justify-content: center`。
- 固定宽度-外边距偏移：先相对于父元素向右偏离半个父元素宽度，然后使用负左外边距(负 margin)校正居中元素的偏移量。
- 固定宽度-外边距适配：(position: absolute; left: 0; right: 0; margin: 0 auto)
- 未知宽度：当定位元素未知宽度时，使用 transform 对自身进行偏移可以解决这个问题(left + transform)

### 垂直居中

- 单行内联元素：设置内联元素的高度 height 和行高 line-height 相等，从而使元素垂直居中。
- 表格布局：使用表格布局的 vertical-align: middle 可以实现子元素的垂直居中。
- 弹性布局：为父元素设置为 flex 弹性布局，并设置布局方向 flex-direction 为垂直，子元素适配 justify-content 为居中即可实现垂直居中
- 精灵元素：利用精灵元素（Ghost Element）技术实现垂直居中，即在父容器内放一个 100% 高度的伪元素，让 文本 和 伪元素 垂直对齐，从而达到垂直居中的目的。
- 固定高度-外边距偏移：当居中元素的 高度和宽度 已知时，垂直居中问题就很简单。通过 绝对定位 元素距离顶部 50%，并设置 margin-top 向上偏移元素高度的一半，就可以实现垂直居中了。
- 固定高度-外边距适配
- 未知高度：与 块级元素-有滚动条 实现效果类似，只是对定位元素自身的偏移使用 transform 实现(top + transform)
- 图片垂直居中：`font-size: 0`。在 font-size 不为 0 时，图片设置垂直居中时的中线位置并不是它的父元素的绝对中线位置，它们会有一个和字符 x 高度相关的高度差。设置 font-size 为 0，会消除这个高度差，使图片的中线位置和父元素中线重合。

### 水平垂直居中

- 文本元素：通过设置父元素容器 text-align 实现水平居中，设置一致的高度（height）和行高（line-height）实现对子元素的垂直居中，垂直居中元素设置 vertical-align 以及 line-height 为 initial 实现子元素内部的基准线垂直居中
- 固定垂直居中元素的宽高：相对于父元素容器左边距和上边距坐标偏移 50%，通过计算垂直居中元素宽/高，利用负 margin 偏移自身宽/高的 50%。或者通过设置上下左右坐标为 0，外边距自适应 auto 实现垂直居中。两种处理手法都需要设置垂直居中元素为标准盒模型。
- 不确定垂直居中元素的宽高：相对于父元素容器左边距和上边距坐标偏移 50%，使用 transform + translate 将垂直居中元素自身偏移负 50%，使用标准盒模型
- 弹性布局：父元素设置为弹性布局容器，并将 justify-content 和 align-items 设置为 center 居中
- 网格布局：父元素设置为网格布局容器，垂直居中元素设置外边距 margin 为自适应 auto 即可

### 双栏布局

左固定右适应：

- float + margin
- float + margin 偏移
- float + overflow(BFC)
- table
- 绝对定位
- flex
- grid

左适应右固定:

- float + margin
- table
- flex
- grid

### 三栏布局

两侧栏固定宽度，中间栏自适应

- float
- 绝对定位
- 表格布局
- 弹性布局
- 网格布局
- 圣杯布局
- 双飞翼布局

### 画三角形的方法

#### 利用 border

```css
.triangle {
  width: 0;
  height: 0;
  border-width: 100px;
  border-style: solid;
  border-color: transparent transparent #000 transparent;
}
```

#### 利用 clip-path 剪裁

[CSS clip-path 生成器](https://www.html.cn/tool/css-clip-path/)

```css
.triangle {
  width: 200px;
  height: 200px;
  background: #000;
  clip-path: polygon(0% 0%, 50% 100%, 100% 0%);
}
```

### 文本溢出

#### 单行文本

```css
.text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- overflow: hidden（文字长度超出限定宽度，则隐藏超出的内容）
- white-space: nowrap（设置文字在一行显示，不能换行）
- text-overflow: ellipsis（规定当文本溢出时，显示省略符号来代表被修剪的文本）

#### 多行文本（css）

```css
.text {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

// 加省略号
.mulLineTruncate {
  position: relative;
  max-height: 40px;
  overflow: hidden;
  line-height: 20px;
  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 0 20px 0 10px;
    content: "...";
  }
}
```

- -webkit-line-clamp: 2（用来限制在一个块元素显示的文本的行数, 2 表示最多显示 2 行。 为了实现该效果，它需要组合其他的 WebKit 属性）
- display: -webkit-box（和 1 结合使用，将对象作为弹性伸缩盒子模型显示 ）
- -webkit-box-orient: vertical（和 1 结合使用 ，设置或检索伸缩盒对象的子元素的排列方式 ）
- overflow: hidden（文本溢出限定的宽度就隐藏内容）
- text-overflow: ellipsis（多行文本的情况下，用省略号“…”隐藏溢出范围的文本)

#### 多行文本（js）

- 监听 DOM 尺寸变化
- 判断是否溢出 scrollHeight > offsetHeight
- 二分查找多行截取字符临界值（算法的解法：判断字符串是否溢出，二分查找字符串溢出临界子串，控制...显示）

## CSS 中的相对

- padding: 10%; 基于父元素的宽度的百分比的内边距
- position: static; HTML 元素的默认值，即没有定位，遵循正常的文档流对象。静态定位的元素不会受到 top, bottom, left, right影响。
- position: relative; 相对定位元素的定位是相对其左上顶点的正常位置进行定位,定位后元素还会占据原来的空间。
- position: absolute; 相对于 static 定位以外的第一个父元素进行定位，如果父级不是，会一直往上到 body，脱离文档流
- position: fixed; 生成固定定位的元素，相对于浏览器窗口进行定位，脱离文档流。（老 IE 不支持），即使窗口是滚动的它也不会移动。
- position: sticky; 粘性定位可以被认为是相对定位和固定定位的混合。元素在跨越特定阈值前为相对定位，之后为固定定位。主要用于 scroll 事件的监听上
- position: inherit;	规定应该从父元素继承 position 属性的值。

无论属于哪种，都要先找到其祖先元素中最近的 position 值不为 static 的元素，然后再判断：若此元素为 inline 元素，则 containing block 为能够包含这个元素生成的第一个和最后一个 inline box 的 padding box （除 margin, border 外的区域）的最小矩形；否则,则由这个祖先元素的 padding box 构成。

- static（默认的）/ relative：简单说就是它的父元素的内容框（即去掉 padding 的部分）
- absolute: 向上找最近的定位为 absolute/relative 的元素
- fixed: 它的 containing block 一律为根元素（html/body），根元素也是 initial containing block
