# CSS 常见问题

## Q1. 描述下面盒模型

```html
<html>
<style>
  body{
    background-color: gray;
  }
  div{
    box-sizing: content-box;
    color: blue;
    width: 100px;
    background-color: pink;
    border: 10px solid;
    padding: 20px;
  }
</style>
<body>
  <div></div>
</body>
</html>
```

- 整个盒子的大小

   整个盒子的大小 = 0，因为这是标准盒模型，盒子大小由 content 决定。height = contnet = 0，整个盒子的大小为 0。

- padding 的颜色

    padding 的颜色 = pick；继承 content 颜色。

- border 的颜色

    border 的颜色 = blue；继承 color 字体颜色，默认 blank。

- height 为 0 时，盒子可见吗

    盒子还是可见的，虽然 height = content = 0，但由 border 和 padding，盒子大小虽为 0，但盒子可见。

## Q2: 行内元素可以设置 padding，margin 吗？

- 行内元素(display: inline)

  - 设置 width, height 宽高无效
  - 设置 margin 仅左右方向有效，上下无效；
  - 设置 padding 仅左右方向有效，上下可设置但无效；
  - 不会自动进行换行

- 行内块元素（display: inline-block）

  - 设置 width, height 宽高有效
  - 设置 margin 上下左右都有效
  - 设置 padding 上下左右都有效
  - 不会自动进行换行

::: tip 注意
在行内元素中有几个特殊的标签，`<img>,<input>` 可以设置它们的宽高度以及对齐属性。

文字块级标签 `<h1>~<h6>,<p>,<dt>`等里面不能放块级元素。

链接里面不能再存放链接
:::

## Q3：内边距的百分数值是如何计算的？为什么？

例如 padding: 20%; 如果设置成百分数值，padding 会根据父元素的宽度计算。
如果不根据父元素，而是根据本身元素宽度的话。那么当 padding 生效后，本身的宽度不就变大了吗？(border-box IE盒模型)。那么 padding 不是也要变大吗？这就陷入了死循环。或者要是本身没有宽度，那岂不是怎么设置padding都是无效的！！！

## Q4：当元素设置成 inline-block 会出现什么问题？怎么消除？

不光是行内元素，如果将一个元素设为 inline-block ，水平呈现的元素之间，换行显示或空格分隔的情况下会有间距。元素间留白间距出现的原因就是标签段之间的空格，因此，去掉 HTML 中的空格，自然间距就没有了。

所以可以通过以下方式去除间距：

- HTML 标签书写

``` html
<div class="space">
    <a href="##">
    惆怅</a><a href="##">
    淡定</a><a href="##">
    热血</a>
</div>
```

- 借助 HTNL 注释

``` html
<div class="space">
    <a href="##">
    惆怅</a><a href="##">
    淡定</a><a href="##">
    热血</a>
</div
```

- 使用 margin 负值
- 让闭合标签吃胶囊
- 使用 font-size: 0  

## Q5：几种获取盒模型的宽高？

- dom.style.width/height

    dom.currentStyle.width/height

- dom.currentStyle.width/height

    获取的是浏览器渲染以后的元素的宽和高，无论是用何种方式引入的 css 样式都可以，但只有IE浏览器支持这种写法。

- window.getComputedStyle(dom).width/height
  
  这种方法获取的也是浏览器渲染以后的元素的宽和高，但这种写法兼容性更好一些。

- dom.getBoundingClientRect().width/height
  
  这种方法经常使用的场所是，计算一个元素的绝对位置（相对于视窗左上角），根据元素在视窗中的绝对位置来获取宽高，它能拿到元素的left、top、width、height 4个属性。

- dom.offsetWidth/offsetHeight

  最常用的，也是兼容最好的

::: tip 拓展获得宽高的方式

- 获取屏幕的高度和宽度（屏幕分辨率）：
window.screen.height/width
- 获取屏幕工作区域的高度和宽度（去掉状态栏）：
window.screen.availHeight/availWidth
- 网页全文的高度和宽度：
document.body.scrollHeight/Width
- 滚动条卷上去的高度和向右卷的宽度：
document.body.scrollTop/scrollLeft
- 网页可见区域的高度和宽度（不加边线）：
document.body.clientHeight/clientWidth
- 网页可见区域的高度和宽度（加边线）：
document.body.offsetHeight/offsetWidth
:::

## Q6. 如何解决边距重叠

**边距重叠** 指两个box如果都设置了边距，那么在垂直方向上，两个box的边距会发生重叠，以绝对值大的那个为最终结果显示在页面上。

边距重叠分为两种：

- 父子关系的边距重叠(即，父子元素垂直外边距重叠问题)
  
  如果子元素设置了外边距，在没有把父元素变成 BFC 的情况下，父元素也会产生外边距。给父元素添加 overflow：hidden 这样父元素就变为 BFC，不会随子元素产生外边距，但是父元素的高会变化

- 同级关系的重叠(即，相邻元素垂直外边距重叠问题)

  同级元素在垂直方向上外边距会出现重叠情况，最后外边距的大小取两者绝对值大的那个

通过生成 BFC 解决垂直外边距重叠问题

## Q7. 浮动及清除浮动的方法

不清楚浮动会发生高度塌陷：浮动元素父元素高度自适应（父元素不写高度时，子元素写了浮动后，父元素会发生高度塌陷）

浮动布局（Float Layout）是CSS中一种常用的布局方式，它允许元素脱离正常的文档流，向左或向右浮动。这种布局方式常用于创建多列布局，如常见的头部、内容、侧边栏的网页布局。

### 浮动布局的基本概念

在CSS中，通过设置元素的`float`属性为`left`或`right`，可以使元素浮动。浮动的元素会移动到包含块的左侧或右侧，直到它的外边缘接触到包含块或另一个浮动元素的边缘。

```css
.element {
  float: left; /* 或者 right */
}
```

**清除浮动**：

由于浮动元素会脱离文档流，这可能会导致一些布局问题，比如父元素的高度塌陷（父元素无法包含浮动的子元素）。为了解决这些问题，通常需要清除浮动。以下是几种清除浮动的方法：

1. **使用`clear`属性**：
   - `clear`属性可以设置为`left`、`right`或`both`，表示不允许元素的两侧有浮动元素。
   - 通常在浮动元素之后添加一个清除浮动的元素。

   ```html
   <div class="floated">浮动元素</div>
   <div style="clear: both;"></div> <!-- 清除浮动 -->
   ```

2. **使用伪元素（推荐方法）**：
   - 给父元素添加一个`::after`伪元素，并设置`clear`属性。
   - 这种方法不需要添加额外的HTML元素。

   ```css
   .parent::after {
     content: "";
     display: table;
     clear: both;
   }
   ```

3. **使用`overflow`属性**：
   - 设置父元素的`overflow`属性为`auto`或`hidden`可以清除内部的浮动。
   - 这种方法会影响父元素的滚动行为。

   ```css
   .parent {
     overflow: auto; /* 或者 hidden */
   }
   ```

4. **使用Flexbox或Grid布局**：
   - 如果使用现代布局技术，如Flexbox或Grid，可以避免使用浮动。
   - 这些布局方式提供了更灵活和强大的布局控制。

   ```css
   .parent {
     display: flex; /* 或者 display: grid */
   }
   ```

清除浮动是CSS布局中的一个重要概念，正确地清除浮动可以确保布局的准确性和可维护性。

## Q8. CSS 定位计算参照物

- padding: 10%; 基于父元素的宽度的百分比的内边距
- position: static; HTML 元素的默认值，即没有定位，遵循正常的文档流对象。静态定位的元素不会受到 top, bottom, left, right影响。
- position: relative; 相对定位元素的定位是相对其左上顶点的正常位置进行定位,定位后元素还会占据原来的空间。
- position: absolute; 相对于 static 定位以外的第一个父元素进行定位，如果父级不是，会一直往上到 body，脱离文档流
- position: fixed; 生成固定定位的元素，相对于浏览器窗口进行定位，脱离文档流。（老 IE 不支持），即使窗口是滚动的它也不会移动。
- position: sticky; 粘性定位可以被认为是相对定位和固定定位的混合。元素在跨越特定阈值前为相对定位，之后为固定定位。主要用于 scroll 事件的监听上
- position: inherit; 规定应该从父元素继承 position 属性的值。

无论属于哪种，都要先找到其祖先元素中最近的 position 值不为 static 的元素，然后再判断：若此元素为 inline 元素，则 containing block 为能够包含这个元素生成的第一个和最后一个 inline box 的 padding box （除 margin, border 外的区域）的最小矩形；否则,则由这个祖先元素的 padding box 构成。

- static（默认的）/ relative：简单说就是它的父元素的内容框（即去掉 padding 的部分）
- absolute: 向上找最近的定位为 absolute/relative 的元素
- fixed: 它的 containing block 一律为根元素（html/body），根元素也是 initial containing block

## Q9. link 和 @import 区别

以下是`<link>`标签和`@import`指令在引入外部样式表时的主要区别：

### 加载时机

- **`<link>`标签**：在HTML文档加载时就会同时加载外部样式表，不会阻塞页面的渲染。
- **`@import`指令**：需要等待整个HTML文档被解析完后，再加载外部样式表，会在渲染页面之前进行加载，可能会导致页面闪烁或延迟。

### 兼容性

- **`<link>`标签**：适用于所有现代浏览器，包括旧版浏览器。
- **`@import`指令**：在一些古老的浏览器中可能无法正常支持，如IE5及以下版本。

### 权重和作用范围

- **`<link>`标签**：外部样式表通过`<link>`引入，它们的样式会具有较高的优先级，不受嵌套或权重的影响。
- **`@import`指令**：引入的样式会受到嵌套和权重的影响，可能会导致样式覆盖问题。

### 页面加载性能

- **`<link>`标签**：由于并行加载，可以同时请求多个外部样式表，从而提高页面加载性能。
- **`@import`指令**：串行加载，必须等待前一个样式表加载完后才会加载下一个，可能会降低页面加载性能。

### 浏览器缓存

- **`<link>`标签**：可以通过设置`rel`属性为"stylesheet"，来允许浏览器缓存样式表。
- **`@import`指令**：无法单独设置缓存属性，会受到外部样式表的缓存设置影响。

### 其他区别

- **`<link>`标签**：是HTML标签，除了能导入CSS外，还能导入其他资源，如图片、脚本和字体等；可以通过JS操作DOM动态引入样式表改变样式；可以直接在HTML中使用`media`属性。
- **`@import`指令**：是CSS的语法，只能用来导入CSS；不支持`media`属性。

综上所述，`<link>`标签在现代Web开发中更受推荐，因为它提供了更好的性能和兼容性，而`@import`指令由于其加载时机和兼容性问题，使用较少。

`@import`规则在CSS中用于导入其他样式表。当使用`@import`引入CSS时，被导入的样式表的加载时机如下：

1. **在CSS文件中解析**：`@import`规则是在CSS文件被解析时处理的。这意味着，当浏览器开始解析一个CSS文件时，它会查找`@import`规则并加载被引用的外部样式表。

2. **阻塞渲染**：`@import`规则会阻塞CSS文件的解析。也就是说，浏览器会先完全加载并解析包含`@import`规则的CSS文件，然后才会继续解析其他CSS文件。这可能会导致页面渲染的延迟，因为浏览器需要等待所有`@import`的样式表被加载和解析完成后才能渲染页面。

3. **在样式表的开始处使用**：为了确保样式的正确应用，建议将`@import`规则放在CSS文件的顶部。这样，当浏览器开始解析样式表时，它会立即处理`@import`规则并开始加载被引用的样式表。

4. **不阻塞HTML解析**：虽然`@import`会阻塞CSS文件的解析，但它不会阻塞HTML文档的解析。浏览器会继续解析HTML，直到遇到`link`标签引入的外部样式表或`style`标签。

5. **加载顺序**：如果一个CSS文件中包含多个`@import`规则，它们将按照出现的顺序被加载。这意味着，如果一个样式表依赖于另一个通过`@import`加载的样式表，那么依赖的样式表应该先被导入。

6. **媒体类型和`@import`**：`@import`规则本身不支持媒体类型（如`screen`、`print`等），但如果`@import`用于一个带有媒体类型的规则集中，那么它将只对匹配的媒体类型生效。

由于`@import`可能导致性能问题，现代Web开发中推荐使用`link`标签来引入CSS文件，因为它允许浏览器并行下载CSS文件，从而提高页面加载速度。`@import`的使用应该谨慎，尤其是在性能敏感的应用中。

要优化使用`@import`引入CSS时的加载性能，可以采取以下几种策略：

1. **避免使用`@import`**：尽可能使用`link`标签代替`@import`引入CSS。这样可以减少页面渲染的延迟，提高用户体验。

2. **将`@import`放在底部**：如果必须使用`@import`，请将被导入的样式表放在主样式表的底部。这样做可以将`@import`的影响降到最低，因为主样式表会在浏览器加载页面之前完成加载。

3. **使用CSS预处理器**：CSS预处理器，如Less或Sass，可以将多个样式表合并成一个文件。这消除了`@import`的需要，并通过减少浏览器请求的数量来优化加载速度。

4. **优化CSS文件**：使用CSS加载优化工具，如CSSmin或UglifyCSS，可以压缩和优化CSS文件，减少文件大小并加快加载速度。

5. **媒体查询优化**：对于需要响应式设计的网站，可以使用`link`标签的`media`属性来定义不同屏幕尺寸下的样式表，减少不必要的样式加载。

6. **服务器端缓存**：利用服务器端缓存机制，将常用的CSS文件缓存一段时间，减少对服务器的请求，提升页面加载速度。

7. **使用CDN**：将CSS文件部署到CDN（内容分发网络），利用CDN的全球分布节点加速文件的下载速度。

8. **异步加载和延迟加载**：对于非关键的CSS文件，可以采用异步或延迟加载的方式，即在页面主要内容渲染后再加载次要的样式表。

通过这些方法，可以显著提高CSS的加载速度和效率，从而提升网页的用户体验。在实际开发中，根据具体需求和场景选择合适的加载方式，并进行持续的性能优化是至关重要的。

## Q10. 什么是CSS的层叠性？

CSS（层叠样式表）的层叠性是指在CSS中，多个样式规则可以应用于同一个元素，浏览器会根据一定的规则来确定最终应用到元素上的样式。这种特性允许开发者在不同的上下文中重写样式，以适应复杂的布局和设计需求。层叠性的规则主要包括以下几点：

1. **优先级（Specificity）**：CSS选择器有不同的优先级。内联样式（直接在HTML元素上使用`style`属性定义的样式）具有最高优先级，其次是ID选择器（如`#id`），然后是类选择器（如`.class`）、伪类选择器（如`:hover`）和属性选择器（如`[type="text"]`），最后是元素选择器（如`div`）和伪元素选择器（如`::before`）。如果优先级相同，则后定义的样式会覆盖先定义的样式。

2. **继承（Inheritance）**：某些CSS属性是可继承的，这意味着如果一个元素没有指定某个属性的值，它会从其父元素继承该属性的值。

3. **重要性（Importance）**：使用`!important`规则可以提高样式规则的优先级。如果两个规则的优先级相同，那么使用了`!important`的规则会覆盖没有使用`!important`的规则。

4. **来源（Origin）**：样式可以来自不同的来源，包括浏览器默认样式、用户自定义样式和网页开发者定义的样式。通常情况下，开发者定义的样式会覆盖浏览器默认样式和用户自定义样式。

5. **层叠顺序（Cascading Order）**：当多个样式规则应用于同一个元素时，浏览器会按照一定的顺序来决定最终的样式。这个顺序通常遵循LIFO（后进先出）的原则，即最后加载的样式表中的规则会覆盖先前加载的样式表中的规则。

理解CSS的层叠性对于编写有效和可维护的CSS代码非常重要，它允许开发者精确控制网页的外观和布局。

## Q11. CSS样式优先级顺序规则是什么?

CSS样式的优先级顺序规则，也就是层叠规则（Cascading Order），决定了当多个样式规则冲突时，哪个规则会被应用。以下是CSS样式优先级顺序的规则：

1. **!important**：
   - 如果规则中包含`!important`声明，则该规则的优先级最高。`!important`可以应用于任何选择器。

2. **内联样式**：
   - 直接在HTML元素的`style`属性中定义的样式具有高优先级。

3. **ID选择器**：
   - ID选择器（如`#id`）的优先级高于类选择器、伪类和元素选择器。

4. **类选择器、伪类和属性选择器**：
   - 类选择器（如`.class`）、伪类选择器（如`:hover`）和属性选择器（如`[type="text"]`）的优先级相同，按照它们在样式表中出现的顺序进行层叠。

5. **元素选择器和伪元素选择器**：
   - 元素选择器（如`div`）和伪元素选择器（如`::before`）的优先级相同，按照它们在样式表中出现的顺序进行层叠。

6. **通用选择器**：
   - 通用选择器（如`*`）的优先级最低。

7. **组合选择器**：
   - 当选择器组合使用时，它们的优先级是累加的。例如，`#id .class`的优先级高于单独的`#id`或`.class`。

8. **来源顺序**：
   - 如果两个规则的优先级相同，那么后出现的规则会覆盖先出现的规则。

9. **继承**：
   - 可继承的属性会从父元素继承到子元素，除非被覆盖。

10. **!important规则的优先级**：
    - 如果两个规则都使用了`!important`，则后出现的`!important`规则会覆盖先出现的。

11. **!important与内联样式**：
    - 内联样式即使没有使用`!important`，也会覆盖使用`!important`的外部样式表规则。

这些规则共同作用，形成了CSS的层叠效果。在实际开发中，了解和掌握这些规则对于解决样式冲突和编写可维护的CSS代码非常重要。

## Q12. CSS中常见的选择器及其优先级顺序?

CSS中有多种选择器，它们用于指定哪些HTML元素应该应用特定的样式规则。以下是CSS中常见的选择器及其优先级顺序：

1. **通用选择器（Universal Selector）**：
   - `*`：选择所有元素。
   - 优先级：0,0,0,0

2. **元素选择器（Type Selector）**：
   - `div`、`p`、`h1` 等：选择所有指定类型的元素。
   - 优先级：0,0,0,1（其中1表示元素选择器）

3. **类选择器（Class Selector）**：
   - `.className`：选择所有具有指定类属性的元素。
   - 优先级：0,1,0,0（其中1表示一个类选择器）

4. **ID选择器（ID Selector）**：
   - `#idName`：选择具有指定ID属性的元素。
   - 优先级：1,0,0,0（其中1表示一个ID选择器）

5. **属性选择器（Attribute Selector）**：
   - `[type="text"]`：选择所有具有指定属性和值的元素。
   - 优先级：根据属性和属性值的不同而不同，但通常较低。

6. **伪类选择器（Pseudo-class Selector）**：
   - `:hover`、`:focus`、`:nth-child()` 等：选择处于特定状态的元素。
   - 优先级：0,0,1,0（其中1表示一个伪类选择器）

7. **伪元素选择器（Pseudo-element Selector）**：
   - `::before`、`::after`：在元素的内容前后插入内容。
   - 优先级：0,0,1,0（其中1表示一个伪元素选择器）

8. **后代选择器（Descendant Selector）**：
   - `ancestor descendant`：选择作为祖先元素后代的元素。
   - 优先级：累加后代选择器的优先级。

9. **子选择器（Child Selector）**：
   - `parent > child`：选择作为父元素直接子元素的元素。
   - 优先级：累加子选择器的优先级。

10. **相邻兄弟选择器（Adjacent Sibling Selector）**：
    - `A + B`：选择紧接在A元素之后的B元素。
    - 优先级：累加相邻兄弟选择器的优先级。

11. **通用兄弟选择器（General Sibling Selector）**：
    - `A ~ B`：选择A元素之后的所有B元素。
    - 优先级：累加通用兄弟选择器的优先级。

12. **否定伪类（否定伪类）**：
    - `:not()`：选择不匹配指定选择器的元素。
    - 优先级：累加否定伪类的优先级。

13. **关系伪类（关系伪类）**：
    - `:nth-of-type()`、`:nth-last-of-type()` 等：选择特定类型的元素。
    - 优先级：累加关系伪类的优先级。

优先级顺序通常表示为四个数字，格式为：`a, b, c, d`，其中：

- `a` 代表内联样式的优先级（!important）。
- `b` 代表ID选择器的数量。
- `c` 代表类选择器、属性选择器和伪类选择器的数量。
- `d` 代表元素选择器和伪元素选择器的数量。

当两个选择器的优先级相同时，后定义的选择器会覆盖先定义的选择器。如果优先级不同，具有更高优先级的选择器会应用其样式。

## Q13. 如何理解CSS选择器的特异性权重？

CSS选择器的特异性权重（Specificity）是CSS计算规则中用来确定哪些样式应该被应用到元素上的一个数值。当多个选择器应用于同一个元素时，特异性高的规则会覆盖特异性低的规则。理解特异性权重对于编写有效和可预测的CSS代码至关重要。

特异性权重由四个部分组成，分别是四个数字，格式为：`a, b, c, d`。这四个数字分别代表：

1. **内联样式（Inline styles）**：
   - `a`：表示内联样式（在HTML元素的`style`属性中定义的样式）。`!important`规则不计入这个数字，而是作为一个更高级别的规则存在。

2. **ID选择器（ID selectors）**：
   - `b`：表示ID选择器的数量（如`#id`）。

3. **类选择器、属性选择器和伪类选择器（Class selectors, attribute selectors, and pseudo-classes）**：
   - `c`：表示类选择器（如`.className`）、属性选择器（如`[type="text"]`）和伪类选择器（如`:hover`）的数量。

4. **元素选择器和伪元素选择器（Element selectors and pseudo-elements）**：
   - `d`：表示元素选择器（如`div`）和伪元素选择器（如`::before`）的数量。

特异性权重的计算规则如下：

- **内联样式**：如果你在元素的`style`属性中定义了样式，那么这个样式的特异性权重的`a`值会是1，其余都是0。
- **ID选择器**：每个ID选择器增加特异性权重的`b`值。
- **类选择器、属性选择器和伪类选择器**：每个类选择器、属性选择器和伪类选择器增加特异性权重的`c`值。
- **元素选择器和伪元素选择器**：每个元素选择器和伪元素选择器增加特异性权重的`d`值。

当比较两个选择器的特异性时，你从左到右比较这四个数字。如果最左边的数字不同，那么具有较大数字的选择器具有更高的特异性。如果最左边的数字相同，那么比较下一个数字，依此类推。

例如，比较以下两个选择器的特异性：

- 选择器A：`ul li a`（特异性：0,0,3,1）
- 选择器B：`#nav a`（特异性：0,1,0,1）

比较这两个选择器：

- `a`值都是0，所以继续比较。
- `b`值不同，选择器B的`b`值为1，而选择器A的`b`值为0，因此选择器B的特异性更高。

如果两个选择器的特异性完全相同，那么后定义的选择器会覆盖先定义的选择器。

理解特异性权重有助于你预测和控制样式的层叠，避免不必要的样式冲突，并编写更清晰、更可维护的CSS代码。

## Q14. 伪类、伪元素及其区别？

伪类（Pseudo-classes）和伪元素（Pseudo-elements）是CSS中用于选择元素的特殊状态或创建与元素相关但不在文档树中实际存在的元素的机制。它们都以冒号（`:`）开始，但它们的目的和用法有所不同。

### 伪类（Pseudo-classes）

伪类用于根据元素的状态或特性选择元素，而不是根据它们的名称或属性。它们用于动态状态，比如用户交互或语言方向。

一些常见的伪类包括：

- `:hover`：鼠标悬停在元素上时。
- `:focus`：元素获得焦点时。
- `:active`：元素被激活（比如点击）时。
- `:nth-child()`：选择父元素中的第n个子元素。
- `:nth-of-type()`：选择父元素中特定类型的第n个子元素。
- `:checked`：用于表单元素，当元素被选中时。
- `:first-child`、`:last-child`：选择第一个或最后一个子元素。
- `:not()`：否定伪类，用于排除符合特定选择器的元素。

### 伪元素（Pseudo-elements）

伪元素用于创建一个虚拟的子元素，并为其添加样式，这个子元素并不在文档的DOM树中实际存在。它们用于装饰性的效果，比如添加前缀、后缀或创建三角形等。

一些常见的伪元素包括：

- `::before`：在元素的内容前面插入内容。
- `::after`：在元素的内容后面插入内容。
- `::first-line`：选择元素的第一行文本。
- `::first-letter`：选择元素的第一个字母。
- `::selection`：选择用户选中的文本部分。

### 伪类和伪元素的区别

1. **目的不同**：
   - 伪类用于根据元素的状态或特性选择元素。
   - 伪元素用于创建和样式化不在DOM树中的虚拟子元素。

2. **语法不同**：
   - 伪类使用单个冒号（`:`），如 `:hover`。
   - 伪元素使用双冒号（`::`），如 `::before`。

3. **内容插入**：
   - 伪类不涉及内容的插入，它们只影响元素的样式。
   - 伪元素可以插入内容，使用 `content` 属性。

4. **DOM操作**：
   - 伪类选择的是实际的DOM元素。
   - 伪元素不是DOM元素，不能直接通过JavaScript操作。

5. **浏览器支持**：
   - 伪类和伪元素都得到了广泛的浏览器支持，但某些伪元素可能在旧版浏览器中不被支持。

了解伪类和伪元素的区别有助于更精确地控制元素的样式和行为，以及在网页设计中实现更复杂的效果。

## Q15. 隐藏元素的方法有哪些？

| CSS属性 | 元素是否占据空间 | 是否可见 | 是否可触发事件 | 备注 |
|---------|----------------|----------|----------------|------|
| `display: none;` | 不占据 | 不可见 | 不可触发 | 完全从文档流中移除，常用于完全隐藏元素 |
| `visibility: hidden;` | 占据 | 不可见 | 可触发 | 元素位置保留，内容不可见，常用于临时隐藏 |
| `opacity: 0;` | 占据 | 透明可见 | 可触发 | 元素完全透明，常用于动画效果 |
| `height: 0; width: 0;` | 不占据 | 不可见 | 不可触发 | 元素尺寸为0，不占据空间 |
| `position: absolute; left: -9999px;` 或 `clip-path: inset(100%);` | 不占据 | 不可见 | 不可触发 | 通过定位和裁剪隐藏元素 |
| `z-index: -1;` | 占据 | 可见 | 可触发 | 元素位于其他元素后面，视觉上隐藏 |

## Q16. 字体资源的加载方式、时机与失败处理?

在CSS中加载字体可以通过几种不同的方法实现，下面是一些常用的方法：

- 使用`@font-face`规则：`@font-face`规则允许你定义一个字体族名称，并将其映射到一个具体的字体文件。这样，你就可以在CSS中引用这个字体族名称来使用这个字体。
- 使用`<link>`标签：直接在HTML文档的`<head>`部分使用`<link>`标签来加载字体文件

优化CSS字体加载可以通过以下几种策略实现：

1. **使用`font-display`属性**：这个CSS属性允许你控制字体在加载过程中的显示策略。例如，`font-display: swap;`会立即使用备用字体显示文本，并在自定义字体加载完成后立即替换。

2. **字体子集化**：只包含网页实际使用的字符的字体文件可以显著减少字体文件的大小，加快加载速度。大多数现代字体托管服务（如Google Fonts）都支持自动生成字体子集。

3. **使用Web字体服务**：使用像Google Fonts、Adobe Fonts或Typekit这样的Web字体服务，它们通常会对字体进行优化，并提供多种格式的字体文件，以确保跨浏览器的兼容性。同时，这些服务也支持字体子集化和按需加载等功能。

4. **延迟加载非关键字体**：对于非关键字体（即不影响页面主要内容的字体），可以考虑在页面加载完成后再加载这些字体，以减少对首屏加载时间的影响。可以使用JavaScript或CSS的媒体查询等技术来实现。

5. **缓存字体文件**：确保字体文件被浏览器缓存，以便在用户重复访问网站时能够更快地加载。可以通过设置适当的HTTP缓存头部（如`Cache-Control`）来实现。

6. **优化字体格式**：选择最优的字体格式可以加快加载速度。通常，`woff2`格式是最优选择，因为它在保持高质量的同时具有较小的文件大小。然而，为了确保最大的兼容性，可能还需要提供`woff`或其他格式的字体文件。

7. **使用`<link rel="preload">`**：在页面中加入`<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin />`可以更快地加载字体。

8. **监控和优化**：使用性能分析工具（如Google PageSpeed Insights、Lighthouse等）来监控和分析字体加载的性能，并根据结果进行相应的优化。

9. **避免CSS @import**：避免使用`@import`规则，因为它会阻塞CSS的加载和渲染。

通过实施上述策略，可以有效地优化字体加载性能，并减少或避免字体加载时出现的"闪烁"或"无样式内容"的问题。

CSS 字体资源的加载时机与浏览器如何处理网页中的字体请求有关。以下是字体加载的几个关键阶段：

1. **解析HTML文档**：
   - 当浏览器解析HTML文档时，它会识别到`<link>`标签或`@font-face`规则，并开始准备加载外部字体文件。

2. **构建渲染树**：
   - 在构建渲染树的过程中，浏览器会确定哪些元素需要使用自定义字体。如果字体文件尚未加载完成，浏览器可能会暂时使用系统默认字体或指定的备用字体来显示文本。

3. **字体文件下载**：
   - 浏览器会异步下载字体文件。下载过程不会阻塞页面渲染，但字体的实际渲染会等待字体文件下载完成。

4. **字体文件解析和合成**：
   - 一旦字体文件被下载，浏览器会解析字体文件，并将其合成到渲染树中。这个过程可能会涉及到字体的渲染和文本的重新布局。

5. **文本渲染**：
   - 字体文件解析完成后，浏览器会使用新的字体渲染文本。如果字体加载较慢，可能会发生文本闪烁，即文本从默认字体切换到自定义字体时的视觉效果。

6. **`font-display`属性**：
   - CSS的`font-display`属性允许开发者控制字体的加载行为。它定义了在字体文件下载完成之前，字体应该如何显示。这个属性可以影响字体加载的时机和用户体验。

7. **字体可见性**：
   - 对于不在视口中的字体（即用户需要滚动才能看到的内容），浏览器可能会延迟加载这些字体，直到它们即将进入视口。

8. **网络条件**：
   - 网络条件也会影响字体加载的时机。在网络连接慢的情况下，字体加载可能会被延迟。

9. **浏览器缓存**：
   - 如果字体文件已经被缓存，浏览器可以直接从缓存中加载字体，这会大大加快加载速度。

10. **预加载（Preload）**：
    - 使用`<link rel="preload">`可以指示浏览器提前加载字体资源，这样可以在渲染树构建之前就开始下载字体文件。

总的来说，CSS字体资源的加载是一个异步过程，它与页面的解析、渲染树的构建和渲染过程紧密相关。通过合理优化，可以减少字体加载对页面渲染的影响，提升用户体验。

在CSS中，有几个属性可以用来控制字体加载的行为：

1. **`@font-face`**:
   - 这是最核心的CSS规则，用于定义字体族名称并映射到具体的字体文件。通过`@font-face`，你可以指定字体的多个源（src），浏览器会按照指定的顺序尝试加载字体文件。

2. **`font-family`**:
   - 用于指定元素的字体族名称。当使用`@font-face`定义了自定义字体后，可以通过`font-family`属性引用这些自定义字体。

3. **`font-display`**:
   - 这是一个CSS描述符，用于`@font-face`规则中，控制如何显示字体。它影响字体文件下载和渲染的时机。`font-display`有以下几个值：
     - `auto`：浏览器决定字体加载的最佳策略。
     - `block`：字体文件必须在指定时间内加载完成，否则使用备用字体。
     - `swap`：字体文件加载完成后立即替换备用字体。
     - `fallback`：字体文件必须在很短的时间内加载完成，否则使用备用字体。
     - `optional`：字体文件加载是可选的，如果加载失败，浏览器不会使用备用字体。

4. **`src`**:
   - 在`@font-face`规则中，`src`描述符用于指定字体文件的路径和格式。它允许你列出多个字体文件，浏览器会按照列出的顺序尝试加载。

5. **`unicode-range`**:
   - 这个描述符允许你定义字体文件应该包含的Unicode字符范围。这有助于实现字体子集化，减少字体文件的大小，加快加载速度。

6. **`font-weight` 和 `font-style`**:
   - 这两个描述符用于指定字体的粗细和样式，它们在`@font-face`规则中定义特定粗细和样式的字体。

通过合理使用这些属性，你可以优化字体的加载行为，提升网页的性能和用户体验。例如，通过`font-display`属性，你可以控制字体的加载策略，减少文本闪烁，确保页面的平滑渲染。

在CSS中，当字体加载失败时，有几种备用方案可以控制字体的加载行为：

1. **`font-family`属性**：
   - 在使用`font-family`属性时，可以指定多个字体作为备选。如果首选字体无法加载，浏览器会按照指定的顺序尝试下一个字体。例如：

     ```css
     body {
       font-family: 'MyCustomFont', Arial, sans-serif;
     }
     ```

   - 如果`MyCustomFont`字体加载失败，浏览器会回退到`Arial`，如果`Arial`也无法加载，则使用系统的默认无衬线字体（`sans-serif`）。

2. **`@font-face`规则中的`src`描述符**：
   - 在`@font-face`规则中，可以通过`src`描述符指定多个字体文件源，浏览器会按顺序尝试加载，直到成功：

     ```css
     @font-face {
       font-family: 'MyCustomFont';
       src: url('myfont.woff2') format('woff2'),
             url('myfont.woff') format('woff');
     }
     ```

   - 如果`.woff2`文件加载失败，浏览器会尝试加载`.woff`文件。

3. **`font-display`属性**：
   - `font-display`属性是专为`@font-face`设计的，可以控制字体加载期间的文本渲染行为。它有以下几个值：
     - `auto`：浏览器自行决定字体加载策略，类似于`block`。
     - `block`：使用备用字体渲染，直到字体加载完成。
     - `swap`：立即使用备用字体，字体加载完成后替换。
     - `fallback`：短暂使用备用字体，然后尝试加载自定义字体。
     - `optional`：字体加载是可选的，如果短时间内未加载完成，则使用备用字体。

     ```css
     @font-face {
       font-family: 'MyCustomFont';
       src: url('myfont.woff2') format('woff2');
       font-display: swap;
     }
     ```

   - 这个属性允许开发者根据不同情况选择最合适的字体加载策略。

4. **本地字体作为备用**：
   - 使用`src`描述符的`local()`函数，可以在用户本地查找指定的字体名称，如果找到了匹配项，就使用本地字体，否则尝试下载的字体资源：

     ```css
     @font-face {
       font-family: 'MyHelvetica';
       src: local("Helvetica Neue Bold"), local("HelveticaNeue-Bold"),
             url(MgOpenModernaBold.ttf);
       font-weight: bold;
     }
     ```

   - 这样可以优先使用用户已经安装的字体，减少对网络字体的依赖。

通过这些方法，可以确保即使自定义字体加载失败，页面也能使用合适的备用字体，保证文本的可读性和页面的美观。

## Q17. 给元素设置负外边距会发生什么？

您的总结非常到位，负外边距确实会对元素的位置和布局产生深远的影响。以下是对您提到的几点的进一步解释和补充：

1. **重叠与间距**：
   - 负外边距可以用于创建负间距，使得元素之间的距离小于它们边框的总和。这可以用来紧密排列元素，或者使元素相互重叠。

2. **元素移动**：
   - 负外边距可以模拟元素的“移动”效果，尤其是在与`position`属性结合使用时。例如，`position: relative;`配合负外边距可以实现元素的微调。

3. **边界框重叠**：
   - 边界框重叠可能会导致元素的可见性问题，特别是当负外边距使得元素部分或完全位于其他元素内部时。这可能会影响元素的可访问性和交互性。

4. **父元素高度塌陷**：
   - 负外边距可能导致父元素的高度塌陷，尤其是在没有浮动或清除浮动的情况下。这是因为父元素可能不会考虑到负外边距的子元素，导致高度计算不正确。

5. **相邻元素的影响**：
   - 负外边距不仅影响设置外边距的元素，还可能影响其相邻元素。例如，一个元素的负外边距可能会推动其相邻元素移动，从而影响整体布局。

6. **定位与堆叠上下文**：
   - 在定位元素时，负外边距可能会影响元素的最终位置。此外，负外边距可能会影响元素的堆叠上下文，尤其是在涉及`z-index`属性时。
  
## Q18. 什么是外边距重叠，会有什么结果？

外边距重叠（Margin Collapsing）：外边距重叠是指在特定条件下，相邻的两个或多个元素的外边距会合并成一个较大的外边距，从而导致元素之间的间距比预期的要大。外边距重叠通常会在垂直方向上发生，并且会影响元素的垂直间距和布局。

**外边距重叠发生的情况**:

- 相邻元素：当两个相邻的块级元素之间没有边框、内边距和内联内容（即没有隔断的容器）时，它们的上下外边距可能会发生重叠。
- 父子元素：如果父元素的外边距与其第一个或最后一个子元素的外边距重叠，也会发生外边距重叠。
- 空元素：如果一个没有实际内容的块级元素的外边距与其兄弟元素的外边距相遇，也可能发生外边距重叠。

**外边距重叠导致的结果**：

- 间距变大：外边距重叠会导致相邻元素之间的间距比预期的要大，这可能不符合设计意图。
- 布局问题：外边距重叠可能影响页面布局，导致元素的位置发生变化。
- 塌陷问题：外边距重叠可能导致父元素的高度塌陷，使其高度变得不准确。

**避免外边距重叠的措施**：

1. **添加边框、内边距、背景色等**
   给元素添加边框、内边距、背景色等，这可以阻止外边距重叠。

2. **使用空的 border、padding 或 inline-block 布局技巧**
   使用空的 border、padding 或 inline-block 布局技巧来破坏外边距重叠。

3. **创建 BFC（块级格式上下文）**
   使用 `overflow: hidden;` 或 `display: flow-root;` 在父元素上创建 BFC（块级格式上下文），从而阻止外边距重叠。

## Q19. 什么是 BFC？有什么作用？

BFC，全称为块级格式上下文（Block Formatting Context），是CSS中一个重要的渲染概念，用于定义一个区域，其中的元素如何布局以及它们与其他元素的关系。

在BFC中，元素的布局是独立的，也就是说，BFC内的元素不会影响BFC外的元素，反之亦然。BFC是页面上的一个独立容器，其内部元素的渲染不会影响外部元素。

BFC的作用：

1. **防止外边距重叠**：
   - BFC可以阻止内部元素的外边距与外部元素的外边距重叠。

2. **创建独立的布局环境**：
   - BFC内的元素布局不会受到外部元素的影响，这样可以创建更加独立的布局环境。

3. **清除浮动**：
   - BFC可以包含浮动元素，这意味着一个元素如果创建了BFC，它不会被内部的浮动元素所影响，可以用来清除内部浮动。

4. **自适应内部高度**：
   - BFC的元素可以包含其所有子元素的高度，即使这些子元素是浮动的。

5. **避免外边距折叠**：
   - 在BFC中，子元素的外边距会与BFC的外边距折叠，但不会与相邻的BFC的外边距折叠。

如何创建BFC？

以下几种方式可以创建BFC：

1. **浮动元素**：
   - 元素设置了`float`属性（`left`或`right`）。

2. **绝对定位元素**：
   - 元素设置了`position`属性为`absolute`或`fixed`。

3. **块级元素**：
   - 元素是块级元素（如`div`）。

4. **`overflow`属性值不为`visible`**：
   - 元素的`overflow`属性值不为`visible`（例如`hidden`、`auto`、`scroll`）。

5. **`display`属性值为`flow-root`**：
   - 元素的`display`属性值为`flow-root`。

6. **`table-cell`、`table-caption`或`inline-block`元素**：
   - 元素的`display`属性值为`table-cell`、`table-caption`或`inline-block`。

BFC是CSS布局中的一个重要概念，理解并掌握BFC可以帮助开发者更好地控制页面布局和解决一些常见的布局问题。

## Q20. z-index属性在什么情况下会失效？

`z-index`失效的情况:

1. **未创建层叠上下文**：
   - `z-index`只在层叠上下文中有效。如果元素没有创建层叠上下文（例如，通过设置`position`、`opacity`、`transform`等属性），`z-index`可能不会按预期工作。

2. **父元素没有设置定位**：
   - 如果父元素未设置定位属性（例如，`position: relative;`或`position: absolute;`），子元素的`z-index`可能无法正确生效。

3. **相对定位的元素**：
   - 如果一个元素使用相对定位（`position: relative;`），而且没有设置`z-index`，那么该元素的层叠顺序可能会被其他具有`z-index`值的元素覆盖。

4. **父子关系**：
   - 如果父元素和子元素都设置了`z-index`，则子元素的`z-index`不影响父元素之间的层叠关系。子元素的层叠顺序仅影响同一父元素下的其他子元素。

5. **Flexbox 布局**：
   - 在某些情况下，Flexbox容器的`z-index`行为可能会比预期复杂。使用`z-index`来影响Flexbox内部的元素堆叠顺序时要特别注意。

6. **浮动元素**：
   - 浮动元素可能会与定位元素的`z-index`发生冲突，导致层叠关系出现问题。

避免`z-index`失效的建议:

1. **确保定位元素的父元素设置了定位属性**：
   - 以创建正确的层叠上下文。

2. **避免过度使用`z-index`**：
   - 尽量采用更简单的布局方案。

3. **使用开发者工具检查元素的层叠顺序**：
   - 以确定是否达到了预期效果。

4. **将元素的`z-index`值设置为大于或小于其他元素的值**：
   - 而不是随意的值，以确保正确的层叠顺序。

5. **理解`z-index`的工作原理**：
   - `z-index`仅在定位元素（`position`属性值为`relative`、`absolute`、`fixed`或`sticky`）上有效。

6. **注意`z-index`的值范围**：
   - `z-index`可以是整数，也可以是`auto`。负值也是允许的，这可以用来将元素置于较低的层叠级别。

通过这些方法，可以更好地控制和预测元素的层叠顺序，从而避免`z-index`失效的问题。

## Q21. 边框实现渐变？

在CSS中，创建边框圆角渐变通常涉及到两个主要的属性：`border-radius`和`background-image`（或者`linear-gradient`）。以下是如何实现边框圆角渐变的步骤：

### 1. 使用`border-radius`创建圆角

首先，你需要使用`border-radius`属性来创建圆角边框。这个属性允许你设置元素边框的圆角大小。

```css
.element {
  border-radius: 10px; /* 设置圆角大小 */
  border: 2px solid transparent; /* 设置边框宽度和颜色（这里使用透明色） */
}
```

### 2. 使用`linear-gradient`创建渐变背景

接下来，使用`linear-gradient`来创建一个渐变效果。你可以定义多个颜色停止点来创建渐变效果。

```css
.element {
  border-radius: 10px;
  border: 2px solid transparent;
  background-image: linear-gradient(45deg, red, blue); /* 从红色到蓝色的渐变 */
}
```

### 3. 结合使用

将上述两个属性结合起来，就可以创建一个具有圆角和渐变背景的边框。

```css
.element {
  border-radius: 10px;
  border: 2px solid transparent; /* 边框颜色设置为透明 */
  background-image: linear-gradient(45deg, red, blue); /* 渐变背景 */
}
```

### 4. 调整渐变角度和颜色

你可以通过调整`linear-gradient`的角度和颜色来改变渐变的效果。

```css
.element {
  border-radius: 10px;
  border: 2px solid transparent;
  background-image: linear-gradient(135deg, #ff7e5f, #feb47b); /* 调整渐变角度和颜色 */
}
```

### 5. 使用多个颜色

你也可以使用多个颜色来创建更复杂的渐变效果。

```css
.element {
  border-radius: 10px;
  border: 2px solid transparent;
  background-image: linear-gradient(135deg, #ff7e5f, #feb47b, #ff7e5f); /* 使用多个颜色 */
}
```

### 6. 盒子阴影增加深度

为了增加视觉效果，你可以添加`box-shadow`属性来给元素添加阴影，从而增加深度感。

```css
.element {
  border-radius: 10px;
  border: 2px solid transparent;
  background-image: linear-gradient(135deg, #ff7e5f, #feb47b);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}
```

通过这些步骤，你可以创建一个具有圆角和渐变背景的边框，这在现代网页设计中是一种常见的视觉效果。

## Q22. 文字描边与渐变？

在CSS中实现文字描边的效果，可以通过`-webkit-text-stroke`属性来完成，这个属性目前主要在基于WebKit的浏览器中得到支持，比如Chrome和Safari。以下是如何使用`-webkit-text-stroke`来实现文字描边的示例：

#### 基本的文字描边

```css
.text-stroke {
  font-size: 48px; /* 设置字体大小 */
  font-weight: bold; /* 设置字体加粗 */
  color: #000; /* 设置文字颜色 */
  -webkit-text-stroke: 2px #ff0000; /* 设置描边宽度和颜色 */
}
```

在这个例子中，`-webkit-text-stroke`属性为文字添加了2像素宽的红色描边。

#### 透明背景的文字描边

如果你想要文字有描边但没有填充颜色，可以将文字颜色设置为透明：

```css
.text-stroke-transparent {
  font-size: 48px;
  color: transparent; /* 文字颜色设置为透明 */
  -webkit-text-stroke: 2px #ff0000; /* 设置描边宽度和颜色 */
}
```

#### 调整描边宽度和颜色

你可以通过改变`-webkit-text-stroke`的值来调整描边的宽度和颜色：

```css
.text-stroke-thick {
  font-size: 48px;
  color: transparent;
  -webkit-text-stroke: 4px #00ff00; /* 增加描边宽度 */
}
```

- `-webkit-text-stroke`是一个非标准的CSS属性，主要用于WebKit浏览器。在非WebKit浏览器上，这个属性不会有任何效果。
- 由于`-webkit-text-stroke`可能会影响文本的可访问性，使用时应谨慎，并确保它不会对阅读造成障碍。
- 在设计中使用文字描边时，应考虑到不同背景和光照条件下的可见性，确保文本内容清晰可读。

使用这些方法，你可以为你的网页设计添加一些有趣的视觉效果。

在CSS中，实现文字渐变效果可以通过几种不同的方法来完成。以下是一些常用的技巧：

### 方法1：使用`background-clip`和`-webkit-text-fill-color`

这种方法使用CSS的`background-clip`属性将背景剪裁到文本的轮廓，并使用`-webkit-text-fill-color`来设置文本颜色为透明，以便显示背景渐变。

```css
.gradient-text {
  font-size: 48px;
  font-weight: bold;
  background-image: linear-gradient(45deg, #ff69b4, #8a2be2); /* 设置渐变颜色 */
  -webkit-background-clip: text; /* 将背景剪裁到文本轮廓 */
  color: transparent; /* 设置文本颜色为透明，以显示背景 */
  -webkit-text-fill-color: transparent; /* 确保文本颜色为透明 */
}
```

### 方法2：使用`text-shadow`和渐变

这种方法使用`text-shadow`属性来模拟渐变效果。这种方法的优点是兼容性较好，但可能需要较多的计算和调整来达到理想的效果。

```css
.gradient-text-shadow {
  font-size: 48px;
  font-weight: bold;
  text-shadow:
    0 0 10px #ff69b4,
    0 0 20px #8a2be2;
}
```

### 方法3：使用SVG

对于需要更复杂渐变效果的情况，可以使用SVG来实现。这种方法提供了最大的灵活性，但也是最复杂的。

```html
<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="50%" font-size="48" font-weight="bold" text-anchor="middle" fill="url(#gradient)" dy=".3em">
    Gradient Text
  </text>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff69b4" />
      <stop offset="100%" style="stop-color:#8a2be2" />
    </linearGradient>
  </defs>
</svg>
```

### 注意事项

- 方法1中使用的`-webkit-background-clip: text`和`-webkit-text-fill-color`属性主要是Webkit内核的浏览器支持，如Chrome和Safari，但不是所有浏览器都支持。
- 方法2中的`text-shadow`可以提供较好的兼容性，但可能需要调整多个阴影来模拟渐变效果。
- 方法3使用SVG可以提供最大的灵活性和控制，但需要更多的代码和可能的额外布局调整。

## Q23. CSS实现自适应正方形、等宽高比矩形

- width 设置百分比
- padding 撑高
- 如果只是要相对于 body 而言的话，还可以使用 vw 和 vh
- 伪元素设置 margin-top: 100%撑高

1. 双重嵌套，外层 relative，内层 absolute

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .outer {
        padding-top: 50%;
        height: 0;
        background: #ccc;
        width: 50%;
        position: relative;
      }

      .inner {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: blue;
      }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="inner">hello</div>
    </div>
  </body>
</html>

```

2. padding 撑高画正方形

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .outer {
        width: 400px;
        height: 600px;
        background: blue;
      }

      .inner {
        width: 100%;
        height: 0;
        padding-bottom: 100%;
        background: red;
      }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="inner"></div>
    </div>
  </body>
</html>
```

3. 相对于视口 VW VH

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .inner {
        width: 1vw;
        height: 1vw;
        background: blue;
      }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="inner"></div>
    </div>
  </body>
</html>
```

4. 伪元素设置 margin-top

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .inner {
        width: 100px;
        overflow: hidden;
        background: blue;
      }

      .inner::after {
        content: "";
        margin-top: 100%;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="inner"></div>
    </div>
  </body>
</html>

```

## Q24. 垂直水平居中，高度永远是宽度的一半?

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }

      html,
      body {
        width: 100%;
        height: 100%;
      }

      .outer {
        width: 400px;
        height: 100%;
        background: blue;
        margin: 0 auto;

        display: flex;
        align-items: center;
      }

      .inner {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 50%;
        background: red;
      }

      .box {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="inner">
        <div class="box">hello</div>
      </div>
    </div>
  </body>
</html>
```

## Q25. 画一个大小为父元素宽度一半的正方形？

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .outer {
        width: 400px;
        height: 600px;
        background: red;
      }

      .inner {
        width: 50%;
        padding-bottom: 50%;
        background: blue;
      }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="inner"></div>
    </div>
  </body>
</html>

```

## Q26. CSS 动画有哪些？

- transition（过渡）：允许你在元素的某些 CSS 属性值发生变化时，以平滑的过渡效果过渡到新状态。常用于响应用户交互（如鼠标悬停、聚焦、激活等）。适用于简单的状态变化（例如，按钮在鼠标悬停时的颜色变化、元素尺寸的变化），用于页面中需要平滑过渡效果的地方。
  - `<property>`：要应用过渡的 CSS 属性（例如：color、background-color、width）。
  - `<duration>`：过渡持续的时间（例如：0.3s）。
  - `<timing-function>`：过渡的动画曲线（例如：ease、linear、ease-in）。
  - `<delay>`：过渡的延迟时间。
- animation（动画）：一种更复杂的动画方式，允许你通过定义多个关键帧（@keyframes）来创建多阶段的动画效果。你可以控制动画的持续时间、延迟、循环次数、动画方向等。适合需要多个状态之间切换的情况，如页面加载时的元素动画、复杂的状态切换等。用于更复杂的连续动画，支持多个属性的动画，能够处理关键帧和动画控制。
  - `<animation-name>`：定义动画名称，关联到 @keyframes 中定义的动画。
  - `<duration>`：动画的持续时间。
  - `<timing-function>`：动画的时间曲线（例如：ease, linear）。
  - `<delay>`：动画开始前的延迟时间。
  - `<iteration-count>`：动画的循环次数（例如：infinite 表示无限循环）。
  - `<direction>`：动画的播放方向（例如：normal, reverse, alternate）。
  - `<fill-mode>`：动画结束后元素的样式状态（例如：forwards，backwards，both）。
- transform（变换）：用于改变元素的形状、位置、大小、倾斜或旋转等。这些变换不会影响元素的文档布局或对其他元素的位置产生影响。需要进行位置、旋转、缩放等变换的情况，动画和过渡效果中常常使用 transform 来改变元素的外观，和设置样式的动画并没有什么关系。
  - translateX(), translateY(), translateZ()：用于在不同轴向上移动元素。
  - rotate(): 用于旋转元素。
  - scale(), scaleX(), scaleY()：用于缩放元素。
  - skew(), skewX(), skewY()：用于倾斜元素。
- translate（平移）：translate() 是 transform 的一部分，用于在二维或三维空间中移动元素。它不改变元素的位置、大小等布局，只是 在视觉上 将元素平移。常用于动画效果中，尤其是配合 transform 使用时，能够实现平滑的位移效果。

| 属性        | 作用描述                       | 使用场景                             | 特点                              | 性能                              |
|-------------|--------------------------------|-------------------------------------|-----------------------------------|-----------------------------------|
| **transition** | 使元素的 CSS 属性在两种状态之间平滑过渡 | 常用于交互效果，如鼠标悬停、焦点等      | 简单，平滑过渡，通常涉及单一属性的变化 | 高效，只处理已变化的属性，性能较好 |
| **animation**  | 定义多个关键帧，实现更复杂的动画效果   | 用于连续、复杂的动画效果，如页面加载时的动画 | 支持多阶段控制，灵活性高，能处理多个属性变化 | 性能较低，尤其是涉及多个元素或复杂动画时 |
| **transform**  | 改变元素的外观（位置、旋转、缩放、倾斜等） | 用于位移、旋转、缩放、倾斜等视觉效果   | 不影响布局，性能较高，适用于 2D/3D 变换 | 高效，尤其是在动画中，通常不会影响布局 |
| **translate**  | 元素在 X、Y 或 Z 轴上的平移         | 用于平移元素位置而不影响其他元素布局   | 改变元素的视觉位置，不影响文档流     | 高效，因为它不改变布局，适用于动画和交互 |

## Q27. BFC会与float元素相互覆盖吗？

不会，因为 BFC 是页面中一个独立的隔离容器，其内部的元素不会与外部的元素相互影响，比如两个 div，上面的 div 设置了 float，那么如果下面的元素不是 BFC，也没有设置 float，会形成对上面的元素进行包裹内容的情况，如果设置了下面元素为 overflow：hidden；属性那么就能够实现经典的两列布局，左边内容固定宽度，右边因为是 BFC 所以会进行自适应。

## Q28. CSS 模块化的方式？

CSS 模块化是一种将CSS封装成独立、可重用单元的方法，有助于提高大型应用的可维护性和可扩展性。以下是一些流行的CSS模块化方式：

1. **CSS Modules**：
   - CSS Modules 是一种由Webpack推广的技术，它通过将CSS类名和动画名转换为唯一值来实现局部作用域。这种方式需要构建工具支持，并且可以在构建过程中处理CSS文件。

2. **BEM (Block Element Modifier)**：
   - BEM 是一种命名约定，用于创建可预测和可重用的CSS类名。它将UI分解为块（独立的组件）、元素（块的子部分）和修饰符（块或元素的变体）。

3. **SMACSS (Scalable and Modular Architecture for CSS)**：
   - SMACSS 是一种组织CSS的架构方法，它定义了五种类别：基础、布局、模块、状态和主题。这种结构有助于创建模块化的CSS代码。

4. **OOCSS (Object Oriented CSS)**：
   - OOCSS 是一种CSS编程范式，它鼓励将CSS视为对象的集合，这些对象可以被继承和重用，以创建更少、更具体的样式。

5. **SUIT CSS**：
   - SUIT CSS 是一个CSS命名约定，它遵循组件化和可嵌套的类名模式，以实现更模块化的CSS代码。

6. **Atomic CSS/Utility-First CSS**：
   - 这种模式强调使用功能性的、原子级的样式类，这些类可以组合在一起以创建复杂的UI组件。Tailwind CSS是这种模式的一个流行例子。

7. **PostCSS**：
   - PostCSS 是一个工具，可以让你使用JavaScript插件来转换CSS。它可以用来实现CSS模块化，例如通过插件如`postcss-modules`来实现。

8. **Styled-Components**：
   - 这是一个用于React的CSS-in-JS库，它允许你在JavaScript中直接编写CSS代码，并自动将其封装到组件的局部作用域中。

9. **CSS-in-JS**：
   - CSS-in-JS是一种将CSS代码直接嵌入到JavaScript模块中的技术。这种方法可以自动处理样式的作用域问题，并且可以与任何前端框架一起使用。

10. **预处理器**：
    - 像Sass、Less和Stylus这样的预处理器提供了变量、混合（mixins）、函数等功能，可以帮助你创建模块化的CSS代码。

每种方法都有其优势和适用场景。在实际项目中，你可能会根据项目需求、团队习惯和构建工具的支持来选择一种或多种方法来实现CSS模块化。

## 参考资料

[CSS十九问](https://juejin.cn/post/6880111680153059341#heading-11)

[你未必知道的49个CSS知识点](https://juejin.cn/post/6844903902123393032#heading-0)

[CSS知识点及技巧整理](https://juejin.cn/post/6844903567707357197)

[css3新特性](https://juejin.cn/post/6844903518520901639)
