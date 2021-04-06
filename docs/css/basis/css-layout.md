# CSS布局与定位

## 块级元素

**块级元素的特点**：

- 默认情况下，块级元素会独占一行
- 宽度自动填满其父元素宽度 100%
- 可以设置 `width, height, line-height` 属性
- 可以设置 `margin` 和 `padding` 属性
- 可以包含行内元素和其他块级元素
- 一个 `block` 元素通常被叫做块级元素 `display: block;`
- 当元素的 display 为 block、list-item 或 table 时，它就是块级元素


**常见的块级元素如下**：

- 文档分区 `<div>`
- 行 `<p>`
- 标题标签 `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
- 表格 `<table>`
- 有序列表 `<ol>`
- 无序列表 `<ul>`
- 定义列表中定义条目描述 `<dd>`
- 定义列表 `<dl>`
- 表单 `<form>`
- 水平分割线 `<hr>`
- 区段头或页头 `<header>` HTML5
- 文章内容 `<article>` HTML5
- 伴随内容 `<aside>` HTML5
- 一个页面区段 `<section>` HTML5
- 区段尾或页尾 `<footer>` HTML5
- 音频播放 `<audio>` HTML5
- 视频 `<video>` HTML5
- 绘制图形 `<canvas>` HTML5
- 图文信息组 `<figure>` HTML5

详细块级元素可参考 <https://developer.mozilla.org/zh-CN/docs/Web/HTML/Block-level_elements>

## 行内元素

**行内元素的特点**：

- 一般情况下，行内元素只能包含数据和其他行内元素，相邻的行内元素在一行上，但是中间会有空白的间隙，一般用 `font-size：0` 解决空白间隙。
- 行内元素设置 `width，height` 属性无效，默认的宽度就是本身内容的宽度
- 水平方向上的 `padding` 和 `margin` 可以设置，垂直方向上的无效
- 行内元素只能容纳纯文本或者是其他的行内元素（`<a> `除外）
- 一个 `inline` 元素通常被叫做行内元素 `display: inline;`
- 当元素的 display 为 inline、inline-block 或 inline-table 时，它就是行内级元素

**常见的行内元素如下**：

- 锚元素 `<a>`
- 缩写元素 `<abbr>`
- 粗体元素 `<b>`
- 粗体显示 `<strong>`
- `<span>`
- 标签，表示用户界面中某个元素的说明 `<label>`
- 输入控件 `<input>`
- 一个多行纯文本编辑控件 `<textarea>`
- 选项菜单控件 `<select>`
- 可点击的按钮 `<button>`
- 图片 `<img>`

详细行内元素可参考 <https://developer.mozilla.org/zh-CN/docs/Web/HTML/Inline_elements>

::: danger 注意
在行内元素中有几个特殊的标签，`<img>`,`<input>` 可以设置它们的宽高度以及对齐属性。

文字块级标签 `<h1>~<h6>`,`<p>`,`<dt>`等里面不能放块级元素。

链接里面不能再存放链接
:::


## display 属性

display 属性指定了元素的显示类型，它包含两类基础特征，用于指定元素怎样生成盒模型，即，盒子的类型取决于 CSS display 属性：

- 外部显示类型定义了元素怎样参与流式布局的处理，影响一个元素的外部表现，但不影响子元素的表现。
- 内部显示类型定义了元素内子元素的布局方式

**外部显示类型** 
- display: block; 指定对象为块元素。(常用)
- display: inline; 指定对象为内联元素。(常用)
- display: run-in; 根据上下文决定对象是内联对象还是块级对象。只有 IE 和 Opera 支持。(基本不用)

**内部显示类型** 
- display: flow; 实验室概念，chrome 不支持。(基本不用)
- display: flow-root; 它可以撑起被 `float` 掉的块级元素的高度。(基本不用)
- display: table; 指定对象作为块元素级的表格。在`<div>`上使用等价于`<table>`的实现
- display: flex; 将对象作为弹性伸缩盒显示。(常用)
- display: grid; 网格布局。(常用)
- display: ruby; 旁注标记，类似拼音汉字显示。 (不常用)

**列表值**
- display: list-item; 指定对象为列表项目。在`<div>`上使用等价于`<ul><li>`的实现。

**属性值**
- display: table-row-group; 指定对象作为表格行组。类同于html标签`<tbody>`（CSS2）
- display: table-header-group; 指定对象作为表格标题组。类同于html标签`<thead>`（CSS2）
- display: table-footer-group; 指定对象作为表格脚注组。类同于html标签`<tfoot>`（CSS2）
- display: table-row; 指定对象作为表格行。类同于html标签`<tr>`（CSS2）
- display: table-cell; 指定对象作为表格单元格。类同于html标签`<td>`（CSS2）
- display: table-column-group; 指定对象作为表格列组显示。类同于html标签`<colgroup>`（CSS2）
- display: table-column; 指定对象作为表格列。类同于html标签`<col>`（CSS2）
- display: table-caption; 指定对象作为表格标题。类同于html标签`<caption>`（CSS2）
- display: ruby-base;
- display: ruby-text;
- display: ruby-base-container;
- display: ruby-text-container;

**显示值**
- display: contents; 让子元素拥有和父元素一样的布局方式
- display: none; 隐藏对象。与 `visibility` 属性的 `hidden` 值不同，其不为被隐藏的对象保留其物理空间(常用)

**混合值**
- display: inline-block; 指定对象为内联块元素。
- display: inline-table; 指定对象作为内联元素级的表格。类同于html标签`<table>`
- display: inline-flex; 将对象作为内联块级弹性伸缩盒显示。
- display: inline-grid; 在行内进行网格布局。

**全局值**
- display: inherit; 继承`父 display` 属性
- display: initial; 不管父元素如何设定，恢复到浏览器最初的 `display` 属性
- display: unset; 混合 `inherit` 和 `initial` 如果父元素设值了就用父元素，如果父元素没设置值，就用浏览器的缺省值。

每个元素都有一个默认的 display 类型。不过你可以随时随地的重写它！比如你可以把有特定语义的元素改成行内元素，
常见的例子是：把 li 元素修改成 inline，制作成水平菜单。

## 定位

定位一般有**相对定位(relative)**、**绝对定位(absolute)**、**固定定位(fixed)**，relative和absolute在移动端用的最多，
fixed 在移动端有兼容性问题，因此不推荐使用，在移动端替代 fixed 的方案是 absolute+内部滚动。



## 正常布局流

正常布局流是指在不对页面进行任何布局控制时，浏览器默认的 HTML 布局方式。

默认的，一个块级元素的内容宽度是其父元素的` 100%`，其高度与其内容高度一致。
行内元素的 `height` `width` 与内容一致。你无法设置行内元素的 `height` `width`,
它们就那样置于块级元素的内容里。如果你想控制行内元素的尺寸，
你需要为元素设置 `display: block;` 
（或者，`display: inline-block;` `inline-block` 混合了 `inline` 和 `block` 的特性。)

默认的，块级元素按照在文档中书写出现的顺序放置，即每个块级元素会在上一个元素下面另起一行，
它们会被设置好的 `margin` 分隔。在英语，或者其他水平书写、自上而下模式里，块级元素是垂直组织的。

行内元素的表现有所不同，它们不会另起一行；只要在其父级块级元素的宽度内有足够的空间，
它们与其他行内元素、相邻的文本内容（或者被包裹的）被安排在同一行。如果空间不够，
溢出的文本或元素将移到新的一行。

如果两个相邻的元素都设置了 `margin` 并且两个 `margin` 有重叠，
那么更大的设置会被保留，小的则会消失，这被称为外边距叠加。

在 CSS 的世界中，会把内容按照从左到右、从上到下的顺序进行排列显示。正常情况下会把页面分割成一行一行的显示，而每行又可能由多列组成，所以从视觉上看起来就是从上到下从左到右，而这就是 CSS 中的流式布局，又叫文档流。文档流就像水一样，能够自适应所在的容器，一般它有如下几个特性：

- 块级元素默认会占满整行，所以多个块级盒子之间是从上到下排列的；
- 内联元素默认会在一行里一列一列的排布，当一行放不下的时候，会自动切换到下一行继续按照列排布；

#### 如何脱离文档流呢？

脱流文档流指节点脱流正常文档流后，在正常文档流中的其他节点将忽略该节点并填补其原先空间。文档一旦脱流，计算其父节点高度时不会将其高度纳入，脱流节点不占据空间。有两种方式可以让元素脱离文档流：浮动和定位。

- 使用浮动（float）会将元素脱离文档流，移动到容器左/右侧边界或者是另一个浮动元素旁边，该浮动元素之前占用的空间将被别的元素填补，另外浮动之后所占用的区域不会和别的元素之间发生重叠；
- 使用绝对定位（position: absolute;）或者固定定位（position: fixed;）也会使得元素脱离文档流，且空出来的位置将自动被后续节点填补。


## 浮动

浮动被用来将元素盒子向左或向右移动，同时让内容环绕其展示。要让一个元素进行浮动，需要给该元素的 flaot 属性设置为 left 或 right。float 的默认值为 none。
值得注意的是，当你使某个元素浮动并让文字环绕它时，内容的行框（Line Box）被缩短。如果你让一个元素浮动，
同时为紧跟着的包含文本的元素设置一个背景颜色，你会发现背景色会出在浮动元素下方。如果想要在浮动元素和环绕的文本之间有一定的间距，
需要给浮动元素设置 margin。在文本元素上设置 margin 只会让其相对于容器缩进。一旦对一个元素进行了浮动，所有接下来的元素都会环绕它，
直到内容处理它下方且开始应用正常文档流。如果想要避免这种情形，可以手动清除浮动。
如果不想要在某个元素受到其之前的浮动元素影响时，可以为其添加 clear 属性。left 值表示清除左边的浮动，right 值表示清除右浮动，
both 值表示清除左右两边的浮动。

设置 float 为 left 或 right，就能使该元素脱离文档流，向左或向右浮动。一般在做宫格模式布局时会用到，如果子元素全部设置为浮动，则父元素是塌陷的，
这时就需要清除浮动，清除浮动的方法也很多，常用的方法是在元素末尾加空元素设置 clear:both, 更高级一点的就给父容器设置 before/after 
来模拟一个空元素，还可以直接设置 overflow:auto/hidden。除过浮动可以实现宫格模式，行内盒子 (inline-block) 和 table 也可以。

## Flex 布局

Flex 布局是一种一维的布局，一个 flexbox 一次只能处理一个维度上的元素布局，一行或者一列。
作为对比的是另外一个二维布局 CSS Grid Layout（CSS栅格布局），可以同时处理行和列上的布局。

Flexbox布局是最合适的一个应用程序的组件，以及小规模的布局，而网格布局是用于较大规模的布局。

最重要的是弹性盒子布局与方向无关，相对于常规的布局（块是垂直和内联水平为基础）较灵活。

我们把一个容器的 display 属性值改为 flex 或者 inline-flex。容器中的直系子元素就会变为 flex 元素。

- flex 容器（flex container）：采用 flex 布局的元素
- flex 元素（flex item）：flex 容器中的所有子元素，即 flex 容器成员
- 主轴：水平方向，flex 元素 默认沿主轴排列。
- 交叉轴：垂直于主轴。

::: danger 注意
设为 Flex 布局以后，子元素的 float 、 clear 和 vertical-align 属性将失效。
:::


### Flex Container 属性

容器属性有以下几个：

- flex-direction
- flex-wrap
- flex-flow
- justify-content
- align-items
- align-content

#### flex-direction

flex-direction属性决定主轴的方向（即项目的排列方向）

- row（默认值）：主轴为水平方向，起点在左端
- row-reverse：主轴为水平方向，起点在右端
- column：主轴为垂直方向，起点在上沿
- column-reverse：主轴为垂直方向，起点在下沿

#### flex-wrap

默认子元素都排在一行，一行排不下，可设置此属性换行

- nowrap（默认值）：不换行
- warp：换行且第一行在上方
- warp-reverse：换行但第一行在下方

#### flex-flow

flex-flow 属性是 flex-direction 属性和 flex-wrap 属性的简写形式，默认：

flex-flow：row nowrap。即取上面两个属性的默认值

#### justify-content

justify-content 属性定义了子元素在主轴上的对齐方式

- flex-start（默认值）：左对齐
- flex-end：右对齐
- center：居中
- space-between：两端对齐，子元素之间的间隔都相等
- space-around：每个子元素两侧的间隔相等。所以，子元素与子元素的间隔 比 子元素与边框的间隔 大一倍
- space-evenly：弹性容器子项均匀分布，所有项目之间及项目与边框之间的距离相等。

#### align-items

align-items 属性定义子元素在交叉轴上对齐方式

- flex-start：交叉轴的起点对齐
- flex-end：交叉轴的终点对齐
- center：交叉轴的中点对齐
- baseline：项目的第一行文字的基线对齐。
- stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。

#### align-content

align-content 属性定义了多根轴线的对齐方式。如果子元素只有一根轴线，该属性不起作用

- flex-start：与交叉轴的起点对齐。
- flex-end：与交叉轴的终点对齐。
- center：与交叉轴的中点对齐。
- space-between：与交叉轴两端对齐，轴线之间的间隔平均分布。
- space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
- stretch（默认值）：轴线占满整个交叉轴。

### Flex Item 属性

- order
- flex-grow
- flex-shrink
- flex-basis
- flex
- align-self

#### order

order 属性定义子元素的排列顺序。数值越小，排列越靠前，默认为0。

#### flex-grow

flex-grow 属性定义子元素的放大比例，默认值为0，即如果存在剩余空间，也不放大。

如果所有子元素的 flex-grow 属性都为 1，如果存在剩余空间，则它们将等分剩余空间。
如果一个子元素的 flex-grow 属性为 2，其他子元素为1，则它占据的剩余空间将比其他项多一倍

#### flex-shrink

flex-shrink 属性定义了子元素的缩小比例，默认为1，即如果空间不足，子元素将缩小。

如果所有子元素的 flex-shrink 属性都为1，当空间不足时，都将等比例缩小。
如果一个子元素的 flex-shrink 属性为0，其他项目都为1，则空间不足时，前者不缩小。
负值对该属性无效。

#### flex-basis

flex-basis 属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。
浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为 auto，即子元素的本来大小。
如果设置成像 width 或 height 属性一样的值，则子元素将占据固定空间。

#### flex

flex 属性是 flex-grow，flex-shrink 和 flex-basis 的缩写

flex: 0 1 auto 默认值取上面三个属性的默认值

::: danger 注意
该属性有以下快捷设置:

- flex: 0 1 auto (默认值)
- flex: auto (1 1 auto)
- flex: none (0 0 auto)
- flex: 1 (1 1 0%)[取非负数字]
- flex: 0% (1 1 0%)[取百分比]
- flex: 24px (1 1 24px)[取长度]

建议优先使用这个属性，而不是单独写三个分离的属性，因为浏览器会推算相关值
:::

#### align-self

align-self 属性允许单个子元素有与其他子元素不一样的对齐方式，可覆盖 align-items 属性。
默认值为 auto，表示继承父元素的 align-items 属性，如果没有父元素，等同于 stretch。

该属性可能取6个值，除了auto，其他都与align-items属性完全一致:

align-self: auto | flex-start | flex-end | center | baseline | stretch;

## Grid 网格布局

Grid 布局与 Flex 布局有一定的相似性，都可以指定容器内部多个项目的位置。但是，它们也存在重大区别。

Flex 布局是轴线布局，只能指定"项目"针对轴线的位置，可以看作是一维布局。
Grid 布局则是将容器划分成"行"和"列"，产生单元格，然后指定"项目所在"的单元格，可以看作是二维布局。Grid 布局远比 Flex 布局强大。

网格通常具有列（column），行（row），以及在每行和列之间的间隙——通常称为沟槽（gutter）。display: grid 指定一个容器采用网格布局。
display: inline-grid; 指定行内元素使用网格布局。

::: danger 注意
设为网格布局以后，容器子元素（项目）的 float、display: inline-block、display: table-cell、vertical-align 和 column-* 等设置都将失效。
:::

- `grid-template-columns` 属性： 定义每一列的列宽
- `grid-template-rows` 属性： 定义每一行的行高
  - `repeat()` 函数： 有时候，重复写同样的值非常麻烦，尤其网格很多时。这时，可以使用，简化重复的值。`repeat()` 接受两个参数，第一个参数是重复的次数；
第二个参数是所要重复的值。
  - `auto-fill` 关键字： 表示自动填充。有时，单元格的大小是固定的，但是容器的大小不确定。如果希望每一行（或每一列）容纳尽可能多的单元格，这时可以使用。
  - `fr关键字`（fraction 的缩写，意为"片段"）： 表示比例关系。
  - `minmax()` 函数： 产生一个长度范围，表示长度就在这个范围之中。它接受两个参数，分别为最小值和最大值。
  - `auto 关键字`： 表示由浏览器自己决定长度。
  - `网格线的名称`： `grid-template-columns` 属性和 `grid-template-rows` 属性里面，还可以使用方括号，指定每一根网格线的名字，方便以后的引用。
- `grid-row-gap` 属性： 设置行与行的间隔（行间距）
- `grid-column-gap` 属性：设置列与列的间隔（列间距）
- `grid-gap` 属性： `grid-column-gap` 和 `grid-row-gap` 的合并简写形式；`grid-gap: <grid-row-gap> <grid-column-gap>;`。
如果 `grid-gap `省略了第二个值，浏览器认为第二个值等于第一个值。

::: danger 注意
根据最新标准，下面三个属性名的grid-前缀已经删除，grid-column-gap和grid-row-gap写成column-gap和row-gap，grid-gap写成gap。
:::
 
- `grid-template-areas` 属性： 用于定义区域。网格布局允许指定"区域"（area），一个区域由单个或多个单元格组成。如果某些区域不需要利用，则使用"点"（.）表示。

::: danger 注意
区域的命名会影响到网格线。每个区域的起始网格线，会自动命名为 `区域名-start`，终止网格线自动命名为 `区域名-end`。
比如，区域名为header，则起始位置的水平网格线和垂直网格线叫做 header-start，终止位置的水平网格线和垂直网格线叫做 header-end。
:::

- `grid-auto-flow` 属性： 划分网格以后，容器的子元素会按照顺序，自动放置在每一个网格。默认的放置顺序是"先行后列"，即先填满第一行，再开始放入第二行。
`grid-auto-flow` 属性默认值是 `row`，即"先行后列"。也可以将它设成 `column`，变成"先列后行"。
还可以设成 `row dense` 和 `column dense`。这两个值主要用于，某些项目指定位置以后，剩下的项目怎么自动放置。

- `justify-items` 属性： 设置单元格内容的水平位置（左中右）
- `align-items` 属性： 设置单元格内容的垂直位置（上中下）。
  - `start`：对齐单元格的起始边缘。
  - `end`：对齐单元格的结束边缘。
  - `center`：单元格内部居中。
  - `stretch`：拉伸，占满单元格的整个宽度（默认值）。
- `place-items` 属性：是 `align-items` 属性和 `justify-items` 属性的合并简写形式。`place-items: <align-items> <justify-items>;`。
如果省略第二个值，则浏览器认为与第一个值相等。
- `justify-content` 属性： 是整个内容区域在容器里面的水平位置（左中右）
- `align-content` 属性： 是整个内容区域的垂直位置（上中下）。
  - `start`：对齐容器的起始边框。
  - `end`：对齐容器的结束边框。
  - `center`：容器内部居中。
  - `stretch`：项目大小没有指定时，拉伸占据整个网格容器。
  - `space-around`：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与容器边框的间隔大一倍。
  - `space-between`：项目与项目的间隔相等，项目与容器边框之间没有间隔。
  - `pace-evenly`：项目与项目的间隔相等，项目与容器边框之间也是同样长度的间隔。
- `place-content` 属性：是 `align-content` 属性和 `justify-content` 属性的合并简写形式。`place-content: <align-content> <justify-content>`。
如果省略第二个值，浏览器就会假定第二个值等于第一个值。
- `grid-auto-columns` 属性： 自动创建的多余网格的列宽
- `grid-auto-rows` 属性： 自动创建的多余网格的行高

::: tip 提示
上面俩属性与 `grid-template-columns和grid-template-rows` 完全相同。如果不指定这两个属性，浏览器完全根据单元格内容的大小，决定新增网格的列宽和行高。
:::

- `grid-template` 属性：简写模式，`grid-template: <grid-template-columns> <grid-template-rows> <grid-template-areas>;`
- `grid` 属性：简写模式，`grid: <grid-template-rows> <grid-template-columns> <grid-template-areas> <grid-auto-rows> <grid-auto-columns> <grid-auto-flow>` 这六个属性的合并简写形式。
- `grid-column-start` 属性：左边框所在的垂直网格线
- `grid-column-end` 属性：右边框所在的垂直网格线
- `grid-row-start` 属性：上边框所在的水平网格线
- `grid-row-end` 属性：下边框所在的水平网格线

::: tip 提示
上面4个属性可以设置 **span关键字**，表示"跨越"，即左右边框（上下边框）之间跨越多少个网格。
这四个属性，如果产生了项目的重叠，则使用z-index属性指定项目的重叠顺序
:::

- `grid-column` 属性：合并简写形式 `grid-column: <grid-column-start> <grid-column-end> `
- `grid-row` 属性： 合并简写形式 `grid-row: <grid-row-start> <grid-row-end> `
- `grid-area` 属性：指定项目放在哪一个区域。也可以是合并形式，`grid-area: <row-start> <column-start> <row-end> <column-end>;`
- `justify-self` 属性：设置单元格内容的水平位置（左中右）
- `justify-items` 属性：的用法完全一致，但只作用于单个项目。
- `align-self` 属性：设置单元格内容的垂直位置（上中下）
  - start：对齐单元格的起始边缘。
  - end：对齐单元格的结束边缘。
  - center：单元格内部居中。
  - stretch：拉伸，占满单元格的整个宽度（默认值）。
- `place-self` 属性：是合并简写形式。`place-self: <align-self> <justify-self>;`




## 参考资料
[最强大的 CSS 布局 —— Grid 布局](https://juejin.cn/post/6854573220306255880)

[干货!各种常见布局实现+知名网站实例分析](https://juejin.cn/post/6844903574929932301#heading-82)

[从零开始の CSS 学习笔记——定位](https://juejin.cn/post/6859685615269576718#heading-3)


