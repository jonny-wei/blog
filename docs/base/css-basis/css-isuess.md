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

## Q7. 清除浮动的方法

不清楚浮动会发生高度塌陷：浮动元素父元素高度自适应（父元素不写高度时，子元素写了浮动后，父元素会发生高度塌陷）

- clear：both
  
    本质就是闭合浮动， 就是让父盒子闭合出口和入口，不让子盒子出来。在最后一个浮动标签后，新加一个标签(例如`<div>`)，给其设置 clear:both;height:0;overflow:hidden
  - 缺点：添加无意义标签，语义化差
  - 不建议使用

- overflow: hidden 触发 BFC

    父元素添加 overflow:hidden，通过触发 BFC 方式，实现清除浮动。
  - 缺点：内容增多的时候容易造成不会自动换行导致内容被隐藏掉，无法显示要溢出的元素
  - 不推荐使用，只推荐没有使用 position 或对 overflow: hidden 理解比较深的开发者使用。

- overflow: auto 触发 BFC

    定义父元素的 overflow 为 auto，width 或 zoom 设定为 1，同时不能定义容器高度，父元素触发实现 BFC。
  - 缺点：内部宽高超过父级 div 时，会出现滚动条。
  - 不推荐使用，如果你需要出现滚动条或者确保你的代码不会出现滚动条就使用吧

- 父元素浮动 float 触发 BFC

    将包裹浮动元素的父元素设置为浮动元素，从而触发 BFC
  - 缺点：会产生新的浮动问题。
  - 不推荐使用。
  -
- 设置父级为表格元素触发 BFC

    将父级元素变成表格元素，从而触发 BFC
  - 缺点：会产生新的未知问题。
  - 不推荐使用
  
- 给浮动元素父级设置高度

    子元素为浮动元素脱离文档流，父元素无法获取子元素高度因此无法被撑高，通过设置父元素高度，避免与父容器处于相同文档流下的块级元素顶
  - 缺点：只适合高度固定的布局，要给出精确的高度，如果高度和父级 `div` 不一样时，会产生问题
  - 不推荐

- 父元素设置伪类作为空标签

  父级块级元素定义 伪类 `:after` 和 `zoom`。原理与添加空标签类似，伪类会在父元素尾部添加一个子元素，内容为空并设置为隐藏不可见。
  - 缺点：ie6-7 不支持伪元素：after，使用 zoom:1 触发
  - 推荐使用，建议定义公共类，以减少 CSS 代码。

- 添加空标签子元素

  与浮动元素同级额外添加一个空标签子元素，为其设置 clear 属性为 both 清除浮动，让父级元素能自动获取到高度
  - 缺点：如果页面浮动布局多，就要增加很多空 `div`，让人感觉很不好
  - 不推荐

- 添加 br 标签作为空标签
    原理其实和第二种方法一样，只是这里的空标签使用的是 `<br/>` 标签。同样需要设置 clear 为 both。
  - 不推荐

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

- link 是 HTML 标签，除了能导入 CSS 外，还能导入别的资源，比如图片、脚本和字体等；而 @import 是 CSS 的语法，只能用来导入 CSS；
- link 导入的样式会在页面加载时同时加载，@import 导入的样式需等页面加载完成后再加载；
- link 没有兼容性问题，@import 不兼容 ie5 以下；
- link 可以通过 JS 操作 DOM 动态引入样式表改变样式，而 @import 不可以。

## 参考资料

[CSS十九问](https://juejin.cn/post/6880111680153059341#heading-11)

[你未必知道的49个CSS知识点](https://juejin.cn/post/6844903902123393032#heading-0)

[CSS知识点及技巧整理](https://juejin.cn/post/6844903567707357197)

[css3新特性](https://juejin.cn/post/6844903518520901639)
