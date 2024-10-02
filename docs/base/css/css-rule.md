# 规则与继承性

## 规则

CSS 规则是样式表的主体，通常样式表会包括大量的规则列表。但有时候也需要在样式表中包括其他的一些信息，比如字符集，导入其它的外部样式表，字体等，这些需要专门的语句表示。

CSS 里包含了以下 @规则：

- `@font-face` 用于设置嵌入 HTML 文档的字体。
- `@keyframes` 描述 CSS 动画的关键帧，用于指定动画名称和动画效果。
- `@media` 如果满足媒体查询的条件则条件规则组里的规则生效。具体见[media](https://tsejx.github.io/css-guidebook/concept/rules/media)
- `@import` 规则用于指定导入的外部样式表及目标媒体。该规则必须在样式表头部最先声明。并且其后的分号是必需的，如果省略了此分号，外部样式表将无法正确导入，并会生成错误信息。IE 使用 `@import` 无法引入超过 35 条的样式表。`@import` 规则一定要先于除了 `@charset` 的其他任何 CSS 规则。
- `@namespace` 告诉 CSS 引擎必须考虑 XML 命名空间。
- `@page` 描述打印文档时布局的变化.
- `@document` 如果文档样式表满足给定条件则条件规则组里的规则生效。 (推延至 CSS Level 4 规范)
- `@charset` 用于定义样式表使用的字符集。它必须是样式表中的第一个元素。如果有多个 `@charset` 被声明，只有第一个会被使用，而且不能在HTML元素或HTML页面的 `<style>` 元素内使用。值必须是双引号包裹。
- `@supports` 用于查询特定的 CSS 是否生效，可以结合 not、and 和 or 操作符进行后续的操作。

### @font-face 属性
- `<identifier>`：字体名称
- `<url>`：此值指的是你自定义的字体的存放路径，可以是相对路径也可以是绝对路径。可以是本地字体文件（IE9+支持），也可以是线上地址（可能有跨域限制）。
- `<string>`：此值指的是你自定义的字体的格式，主要用来帮助浏览器识别，其值主要有以下几种类型：truetype、opentype、embedded-opentype、svg 等
- `<font>`：定义字体相关样式


### 字体在什么时候下载的
src 中加载的字体地址受跨域的约束，如果想跨域加载字体，需要设置 CORS。

通常情况下(IE8 在只要是定义了 font-face，即使页面元素没有使用对应的字体，也会下载)，只有当我们的页面元素用到了 font-face 中定义的字体的情况下，才会下载对应的字体，而不是页面加载时就去下载。

- IE8 只要定义了 font-face，就会去下载字体，不论实际有没有应用该字体。
- Firefox, IE 9+ 只有定义了 font-face 并且页面有元素应用了该字体，就会去下载，不论该元素是否有文本内容。
- Chrome, Safari 只有定义了 font-face 并且页面有元素应用了该字体，并且该元素有文本内容，才会去下载字体。

**DOM 元素是通过动态插入的情况下上述字体下载规则也一样**

`<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin />` 通常和最基本的字体用法配合使用进行预加载。


### link 和 @import 都能导入一个样式文件，它们有什么区别嘛？

- link 是 HTML 标签，除了能导入 CSS 外，还能导入别的资源，比如图片、脚本和字体等；而 `@import` 是 CSS 的语法，只能用来导入 CSS；
- link 导入的样式会在页面加载时同时加载，@import 导入的样式需等页面加载完成后再加载；
- link 没有兼容性问题，`@import` 不兼容 ie5 以下；
- link 可以通过 JS 操作 DOM 动态引入样式表改变样式，而 `@import` 不可以。


### CSS 文件到底是用的什么字符编码的呢？

平时写样式文件都没写 @charset 规则，那这个 CSS 文件到底是用的什么字符编码的呢？某个样式表文件到底用的是什么字符编码，浏览器有一套识别顺序（优先级由高到低）：

- 文件开头的 Byte order mark 字符值，不过一般编辑器并不能看到文件头里的 BOM 值；
- HTTP 响应头里的 content-type 字段包含的 charset 所指定的值，比如：`Content-Type: text/css; charset=utf-8`
- CSS 文件头里定义的 @charset 规则里指定的字符编码；
- `<link>` 标签里的 charset 属性，该条已在 HTML5 中废除；
- 默认是 UTF-8。

## 层叠性

层叠样式表，这里的层叠怎么理解呢？其实它是 CSS 中的核心特性之一，用于合并来自多个源的属性值的算法。比如说针对某个 HTML 标签，有许多的 CSS 声明都能作用到的时候，那最后谁应该起作用呢？层叠性说的大概就是这个。

## 优先级

- !important
- 行内样式
- ID 选择符
- 类选择符
- 标签选择符 | 伪类选择符 | 属性选择符
- 伪对象选择符
- 通配选择符 | 关系选择符 | 否定伪类

可以看到内联样式（通过元素中 style 属性定义的样式）的优先级大于任何选择器；而给属性值加上 !important 又可以把优先级提至最高，就是因为它的优先级最高，所以需要谨慎使用它，以下有些使用注意事项：

- 一定要优先考虑使用样式规则的优先级来解决问题而不是 !important
- 只有在需要覆盖全站或外部 CSS 的特定页面中使用 !important
- 永远不要在你的插件中使用 !important
- 永远不要在全站范围的 CSS 代码中使用 !important


## 继承性

CSS 属性很多，但并不是所有的属性默认都是能继承父元素对应属性的，那哪些属性存在默认继承的行为呢？一定是那些不会影响到页面布局的属性，可以分为如下几类：

- 字体相关：font-family、font-style、font-size、font-weight 等
- 文本相关：text-align、text-indent、text-decoration、text-shadow、letter-spacing、word-spacing、white-space、line-height、color 等
- 列表相关：list-style、list-style-image、list-style-type、list-style-position 等
- 其他属性：visibility、cursor 等

对于其他默认不继承的属性也可以通过以下几个属性值来控制继承行为：

- inherit：继承父元素对应属性的计算值
- initial：应用该属性的默认值，比如 color 的默认值是 #000
- unset：如果属性是默认可以继承的，则取 inherit 的效果，否则同 initial
- revert：效果等同于 unset，兼容性差

::: warning 参考文献
[1.5 万字 CSS 基础拾遗（核心知识、常见需求）](https://juejin.cn/post/6941206439624966152#heading-40)
:::