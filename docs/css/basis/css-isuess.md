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
行内元素（inline-block）的 padding 左右有效 ，但是由于设置 padding 上下不占页面空间，无法显示效果，所以无效。此外，对行内元素设置宽高 width，height无效。

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

- overflow: hidden

    父元素添加 overflow:hidden，通过触发 BFC 方式，实现清除浮动
    - 缺点：内容增多的时候容易造成不会自动换行导致内容被隐藏掉，无法显示要溢出的元素
    - 不推荐使用
    - 
- 给浮动元素父级设置高度
- 父级同时浮动（需要给父级同级元素添加浮动）
- 父级设置成 inline-block，其 margin: 0 auto 居中方式失效
- after 伪元素

    使用 after 伪元素清除浮动，符合闭合浮动思想，结构语义化正确
    - 缺点：ie6-7 不支持伪元素：after，使用 zoom:1 触发 hasLayout
    - 推荐使用

- before、after 双伪元素
  
    使用 before 和 after 双伪元素清除浮动
    - 缺点：ie6-7 不支持伪元素：after，使用 zoom:1 触发 hasLayout
    - 推荐使用

### 参考资料
[CSS十九问](https://juejin.cn/post/6880111680153059341#heading-11)
[你未必知道的49个CSS知识点](https://juejin.cn/post/6844903902123393032#heading-0)