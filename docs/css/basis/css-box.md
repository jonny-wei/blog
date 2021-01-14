# CSS 盒模型

浏览器的渲染引擎就会根据**基础盒模型(CSS basic box model)** ，将所有元素划分为一个个矩形的盒子，这些盒子的外观，属性由 CSS 来决定。

可以认为每个 html 元素都是一个方块，然后这个方块又包着几个小方块，如同盒子一层层的包裹着，这就是所谓的**盒模型**。

盒模型由外而内包括：外边距（margin）、边框（border）、填充（亦称内边距）（padding）、内容（content）。但是，盒模型有标准盒模型和 IE 盒模型之分：

- W3C 盒模型(标准盒模型)
- IE 盒模型(怪异盒模型)

::: tip 注意
盒模型由外边距（margin）、边框（border）、填充（亦称内边距）（padding）、内容（content）。组成。但盒子由 content + padding + border 这几部分**决定盒子的大小**，如果再加上 margin 那决定的是**盒子占据的位置**，而不是盒子的大小！margin 虽然是盒模型的组成成分，但盒子的大小与 margin 没半毛钱关系！
:::

## W3C 盒模型

### 设置

```css
box-sizing: content-box;
```


### 图示

![W3C 盒模型](/blog/images/css/W3C盒模型.png)

盒子的大小：width/height = content(content-box)

盒子的大小只由内容 content决定，不包含 border 和 padding。

## IE 盒模型

### 设置

```css
box-sizing: border-box;
```

### 图示

![IE 盒模型](/blog/images/css/IE盒模型.png)

盒子的大小：width/height = content + padding + border(border-box)

盒子的大小由content + padding + border 决定。

## 视觉格式化模型

CSS 视觉格式化模型（visual formatting model）是用来处理和在视觉媒体上显示文档时使用的计算规则。该模型会根据盒子的边界来渲染盒子，通常盒子会创建一个包含其子元素的包含块，但是子元素并不由包含块所限制，当子元素跑到包含块的外面时称为溢出（overflow）。

盒子的生成是 CSS 视觉格式化模型的一部分，用于从文档元素生成盒子。盒子有不同的类型，盒子的类型取决于 display 属性。

- 块盒子：display: block | list-item | table

  - 一个块级元素会被格式化成一个块，默认按照垂直方向依次排列。
  - 每个块级盒都会参与 BFC 的创建。

- 行内盒子：display: inline | inline-block | inline-table

  - 行内元素不会生成内容块，但是可以与其他行内级内容一起显示为多行。
  - 行内级元素会生成行内级盒子，该盒子参与 IFC 的创建。

- 匿名盒子：CSS 也会创建一些无法被 CSS 选择器选中的盒子，我们叫它匿名盒子。

  - 匿名盒子会从父元素继承可继承属性，其他属性保持默认值 initial。
  - 通常 CSS 引擎会自动为直接包含在块盒子中的文本创建一个匿名盒子。
