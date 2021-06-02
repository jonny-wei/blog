# CSS 盒模型

浏览器的渲染引擎就会根据**基础盒模型(CSS basic box model)** ，将所有元素划分为一个个矩形的盒子，这些盒子的外观，属性由 CSS 来决定。

可以认为每个 html 元素都是一个方块，然后这个方块又包着几个小方块，如同盒子一层层的包裹着，这就是所谓的**盒模型**。

盒模型由外而内包括：外边距（margin）、边框（border）、填充（亦称内边距）（padding）、内容（content）。但是，盒模型有标准盒模型和 IE 盒模型之分：

- W3C 盒模型(标准盒模型)
- IE 盒模型(怪异盒模型)

::: tip 注意
盒模型由外边距（margin）、边框（border）、填充（亦称内边距）（padding）、内容（content）。组成。但盒子由 content + padding + border 这几部分**决定盒子的大小**，如果再加上 margin 那决定的是**盒子占据的位置**，而不是盒子的大小！margin 虽然是盒模型的组成成分，但盒子的大小与 margin 没半毛钱关系！
:::

通过 box-sizing 设置，默认值是 content-box 。

## W3C 盒模型

### 设置

```css
box-sizing: content-box;
```


### 图示

![W3C 盒模型](/blog/images/css/W3C盒模型.png)

盒子的大小：width/height = content(content-box)

盒子的大小只由内容 content 决定，不包含 border 和 padding。

盒子的实际尺寸 =  内容（设置的宽/高） + 内边距 + 边框

## IE 盒模型

### 设置

```css
box-sizing: border-box;
```

### 图示

![IE 盒模型](/blog/images/css/IE盒模型.png)

盒子的大小：width/height = content + padding + border(border-box)

盒子的大小由 content + padding + border 决定。

盒子的实际尺寸 = 设置的宽/高 = 内容 + 内边距 + 边框

### 获取盒模型宽高

- 访问元素内联样式宽高：`element.style.width`
- 访问元素计算宽高（仅支持 IE 查询）：`element.currentStyle.width`
- 访问元素计算宽高（支持主流浏览器）：`window.getComputedStyle(element).width`
- 访问元素计算宽高（支持主流浏览器）取到的是盒子总宽度：`element.getBoundingClientRect().width`

## 视觉格式化模型

CSS 视觉格式化模型（visual formatting model）是用来处理和在视觉媒体上显示文档时使用的计算规则。该模型会根据盒子的边界来渲染盒子，通常盒子会创建一个包含其子元素的包含块，但是子元素并不由包含块所限制，当子元素跑到包含块的外面时称为溢出（overflow）。

CSS 中一切皆盒子，而视觉格式化模型简单来理解就是规定这些盒子应该怎么样放置到页面中去，这个模型在计算的时候会依赖到很多的因素，比如：盒子尺寸、盒子类型、定位方案（是浮动还是定位）、兄弟元素或者子元素以及一些别的因素。

盒子的生成是 CSS 视觉格式化模型的一部分，用于从文档元素生成盒子。盒子有不同的类型，盒子的类型取决于 display 属性。

- 块盒子：display: block | list-item | table | flex | grid | flow-root 等

  - 一个块级元素会被格式化成一个块，默认按照垂直方向依次排列。
  - 每个块级盒都会参与 BFC 的创建。

- 行内盒子：display: inline | inline-block | inline-table 等

  - 行内元素不会生成内容块，但是可以与其他行内级内容一起显示为多行。
  - 行内级元素会生成行内级盒子，该盒子参与 IFC 的创建。

- 匿名盒子：CSS 也会创建一些无法被 CSS 选择器选中的盒子，我们叫它匿名盒子。

  - 匿名盒子会从父元素继承可继承属性，其他属性保持默认值 initial。
  - 通常 CSS 引擎会自动为直接包含在块盒子中的文本创建一个匿名盒子。

### block

- 占满一行，默认继承父元素的宽度，多个块元素将从上到下进行排列
- 设置 width/height 将会生效
- 设置 padding 和 margin 将会生效

### inline

- 不会占满一行，宽度随着内容而变化，多个 inline 元素将按照从左到右的顺序在一行里排列显示，如果一行显示不下，则自动换行
- 设置 width/height 不会生效
- 设置竖直方向上的 padding 和 margin 不会生效；需注意的是，竖直方向的 padding 虽然有显示效果但是对其他元素没有影响，所以还是无效果。

### inline-block

- 是行内块元素，不单独占满一行，可以看成是能够在一行里进行左右排列的块元素
- 设置 width/height 会生效
- 设置 padding 和 margin 会生效


## 格式化上下文

- BFC (Block Formatting Context) 块级格式化上下文
- IFC (Inline Formatting Context) 行内格式化上下
- FFC (Flex Formatting Context) 弹性格式化上下文
- GFC (Grid Formatting Context) 格栅格式化上下文

其中 BFC 和 IFC 在 CSS 中扮演着非常重要的角色，因为它们直接影响了网页布局，所以需要深入理解其原理。
