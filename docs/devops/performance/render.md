# 渲染方面优化

结合 **渲染进程(浏览器内核)** 即 **关键渲染路径** 优化首屏渲染，减少白屏。

## 温故知新

### 什么是 CRP

CRP（关键渲染路径）: 指浏览器通过把 HTML、CSS 和 JavaScript 转化成屏幕上的像素的步骤顺序。优化关键渲染路径可以提高渲染性能。关键渲染路径包含了 Document Object Model (DOM)，CSS Object Model (CSSOM)，渲染树和布局。优化关键渲染路径可以提升首屏渲染时间。理解和优化关键渲染路径对于确保回流和重绘可以每秒 60 帧、确保高性能的用户交互和避免无意义渲染至关重要。

### 为何 js 是单线程

JavaScript 的单线程，与它的用途有关。作为浏览器脚本语言，JavaScript 的主要用途是与用户互动，以及操作 DOM。这决定了它只能是单线程。如果 JS 是多线程的方式来操作这些 UI DOM，则可能出现UI操作的冲突；如果在多线程的交互下，处于 UI中的 DOM节点就可能成为一个临界资源，假设存在两个线程同时操作一个 DOM，一个负责修改一个负责删除，那么这个时候就需要浏览器来裁决如何生效哪个线程的执行结果，当然我们可以通过锁来解决上面的问题。但为了避免因为引入了锁而带来更大的复杂性，JS 在最初就选择了单线程执行。

### CSS 的阻塞

CSS 被视为 **渲染阻塞资源**(包括JS)，这意味着浏览器将不会渲染任何已处理的内容，直至 CSSOM 构建完毕，才会进行下一阶段。

存在阻塞的 CSS 资源时，浏览器会延迟 JavaScript 的执行和 DOM 构建。另外：当浏览器遇到一个 script 标记时，DOM 构建将暂停，直至脚本完成执行。JavaScript 可以查询和修改 DOM 与 CSSOM。CSSOM 构建时，JavaScript 执行将暂停，直至 CSSOM 就绪。CSSOM 树构建完才会进入下一步，哪怕 html 解析完，也要等 CSSOM

**关于 CSS 加载的阻塞情况**：

- css 加载不会阻塞 DOM 树的解析，但会阻塞 DOM 树的生成与渲染
- css 加载会阻塞 JS 的**执行**，但不会阻塞 JS 的解析与加载

没有 js 的理想情况下，html 与 css 会并行解析，分别生成 DOM 与 CSSOM，然后合并成 Render Tree，进入 Rendering Pipeline；但如果有 js，css 加载会阻塞后面 js 语句的执行，而（同步）js 脚本执行会阻塞其后的 DOM 解析（所以通常会把 css 放在头部，js 放在 body 尾）

### JS 的阻塞

由于 JavaScript 是可操纵 DOM 的，如果在修改这些元素属性同时渲染界面（即 JavaScript 线程和 UI 线程同时运行），那么渲染线程前后获得的元素数据就可能不一致了。
因此为了防止渲染出现不可预期的结果，浏览器设置 **GUI 渲染线程与 JavaScript 引擎为互斥的关系**。当 JavaScript 引擎执行时 GUI 线程会被挂起，GUI 更新会被保存在一个队列中等到引擎线程空闲时立即被执行。因此如果 JS 执行的时间过长，这样就会造成页面的渲染不连贯，导致页面渲染加载阻塞的感觉。

JavaScript 被认为是 **解释器阻塞资源**，浏览器解析文档，当遇到 `<script>` 标签的时候，会立即交给 JS 引擎解析脚本，停止解析 DOM 与 CSSOM（因为JS可能会改动 DOM 和 CSS，所以继续解析会造成浪费）。**如果脚本是外部的，会等待脚本下载完毕，再继续解析文档**。现在可以在 script 标签上增加属性 **defer** 或者 **async**。脚本解析会将脚本中改变 DOM 和 CSS 的地方分别解析出来，追加到 DOM Tree 和 Style Rules 上。

JS 对关键路径渲染的影响不只是阻塞 DOM 构建，也会导致 CSSOM 阻塞 DOM 构建。**如果浏览器尚未完成 CSSOM 的下载和构建，而我们却想在此时运行脚本，那么浏览器将延迟脚本执行和 DOM 构建，直至其完成 CSSOM 的下载和构建**。

**如果没有 defer 或 async，浏览器会立即加载并执行指定的脚本**，“立即”指的是在渲染该 script 标签之下的 HTML 元素之前，也就是说不等待后续载入的 HTML 元素，读到就加载并执行。

解析过程中无论遇到的 JavaScript 是内联还是外链，只要浏览器遇到 script 标记，唤醒 JavaScript 解析器，就会进行暂停 (blocked) 浏览器解析 HTML，并等到 CSSOM 构建完毕，才去执行 js 脚本。因为脚本中可能会操作 DOM 元素，而如果在加载执行脚本的时候 DOM 元素并没有被解析，脚本就会因为 DOM 元素没有生成取不到响应元素，所以实际工程中，我们常常将资源放到文档底部。

**JS 阻塞 DOM树、CSSOM树的解析与生成**。

### DOMContentLoaded 与 load 的区别

当 DOMContentLoaded 事件触发时，仅当 DOM 解析完成后，不包括样式表，图片。我们前面提到 CSS 加载会阻塞 Dom 的渲染和后面 js 的执行，js 会阻塞 Dom 解析，所以我们可以得到结论:

当文档中没有脚本时，浏览器解析完文档便能触发 DOMContentLoaded 事件。如果文档中包含脚本，则脚本会阻塞文档的解析，而脚本需要等 CSSOM 构建完成才能执行。在任何情况下，DOMContentLoaded 的触发不需要等待图片等其他资源加载完成。

当 onload 事件触发时，页面上所有的 DOM，样式表，脚本，图片等资源已经加载完毕。

DOMContentLoaded -> load。

### preload 和 prefetch 的区别

- **preload 优先加载，提高下载优先级**。会提升资源的优先级因为它标明这个资源是本页肯定会用到 —— **本页优先**。使用 preload 来提升资源加载的优先级。 preload 最大的作用就是将下载与执行分离，并且将下载的优先级提到了一个很高的地步，再由我们去控制资源执行的位置。

- **prefetch 预加载**。会降低这个资源的优先级因为它标明这个资源是下一页可能用到的 —— **为下一页提前加载**。例如：首页不需要这样的字体文件，下个页面需要，首页会以最低优先级来提前加载。

### defer 与 async 的区别

没有 defer 或 async,浏览器会立即加载并执行指定的脚本，“立即” 指的是在渲染该 script 标签之下的文档元素之前，也就是说不等待后续载入的文档元素，读到就加载并执行。

- 脚本与DOM/其它脚本的依赖关系很强：对 `<script>` 设置defer
- 脚本与DOM/其它脚本的依赖关系不强：对 `<script>` 设置async

#### defer

**延迟执行引入的 js**。即 js 加载时 HTML 未停止解析，两个过程是并行的。 整个 document 解析完毕且 `defer-script` 也加载完成之后（这两件事情的顺序无关），会执行所有由 `defer-script` 加载的 JavaScript 代码，再触发 `DOMContentLoaded`(初始的 HTML 文档被完全加载和解析完成之后触发，无需等待样式表图像和子框架的完成加载) 事件。

- 载入 JavaScript 文件时不阻塞 HTML 的解析
- 执行阶段被放到 HTML 标签解析完成之后

有 defer，加载后续文档元素的过程将和 js 的加载并行进行（异步），但是 **js 的执行要在所有元素解析完成之后，DOMContentLoaded 事件触发之前完成**。

#### async

**异步执行引入的 js**。如果已经加载好，就会开始执行，无论此刻是 HTML 解析阶段还是 DOMContentLoaded 触发(HTML解析完成事件)之后。

- 依然会阻塞 load 事件。换句话说，`async-script` 可能在 `DOMContentLoaded` 触发之前或之后执行，但一定在 load 触发之前执行。
- 多个 `async-script` 的执行顺序是不确定的，谁先加载完谁执行。值得注意的是，向 document 动态添加 script 标签时，async 属性默认是 true。
- 使用 `document.createElement("script")` 创建的 script 默认是异步的。所以，通过动态添加 script 标签引入 JavaScript 文件默认是不会阻塞页面的。

有 async，加载和渲染后续文档元素的过程将和 script.js 的加载与执行并行进行（异步）

- defer 和 async 在网络读取（下载）这块儿是一样的,都是异步的（相较于 HTML 解析）
- 它俩的差别在于脚本下载完之后何时执行,显然 defer 是最接近我们对于应用脚本加载和执行的要求的
- defer 是按照加载顺序执行脚本的，这一点要善加利用
- async 则是一个乱序执行的主，反正对它来说脚本的加载和执行是紧紧挨着的，所以不管你声明的顺序如何，只要它加载完了就会立刻执行。仔细想 ,async 对于应用脚本的用处不大，因为它完全不考虑依赖（哪怕是最低级的顺序执行），不过它对于那些可以不依赖任何脚本或不被任何脚本依赖的脚本来说却是非常合适的。

[图解 script 标签中的 async 和 defer 属性](https://juejin.cn/post/6894629999215640583)

`defer`和`async`是HTML中用于控制脚本（script）加载和执行行为的两个属性。它们都用于外部JavaScript文件，但它们的工作方式和用途有所不同。

### async

- **定义**：`async`表示脚本会异步加载，即在脚本加载时，文档的解析将继续进行，不会停止。
- **加载和执行**：脚本下载完成后，如果`async`属性存在，浏览器会立即执行它，而不会等待其他脚本。这可能会导致脚本执行的顺序与它们在文档中出现的顺序不同。
- **用途**：当你需要异步加载脚本，但不关心脚本加载顺序时，可以使用`async`。
- **事件**：`async`脚本加载完成后会触发`load`事件，如果加载失败，则触发`error`事件。

### defer

- **定义**：`defer`表示脚本会延迟执行，即脚本的加载是异步的，但执行是推迟到整个文档解析完成后，或者在`DOMContentLoaded`事件触发前。
- **加载和执行**：脚本下载完成后，如果`defer`属性存在，浏览器不会立即执行它，而是等到文档的解析过程完成后，按照`<script>`标签在文档中出现的顺序执行。
- **用途**：当你需要脚本在文档解析完成后按特定顺序执行时，可以使用`defer`。
- **事件**：`defer`脚本不会在加载完成后立即触发`load`事件，而是在执行时触发。

### 主要区别

1. **执行时机**：
   - `async`脚本在下载完成后会尽快执行。
   - `defer`脚本则会等到文档解析完成后按顺序执行。

2. **执行顺序**：
   - `async`不保证脚本的执行顺序。
   - `defer`保证了脚本的执行顺序与它们在文档中出现的顺序相同。

3. **阻塞渲染**：
   - `async`和`defer`脚本都不会阻塞页面渲染，它们都是异步加载的。

4. **兼容性**：
   - `defer`属性在现代浏览器中得到了很好的支持，但`async`属性更古老，支持更广泛。

5. **DOM和Window**：
   - `async`脚本可能在DOM未完全构建时执行，因此可能无法访问完整的DOM。
   - `defer`脚本在DOM构建完成后执行，因此可以访问完整的DOM。

选择`async`还是`defer`取决于你的脚本是否依赖于文档的解析顺序以及是否需要在文档解析完成后执行。如果脚本之间有依赖关系或者需要按照特定顺序执行，`defer`是更好的选择。如果脚本独立且不关心执行顺序，可以使用`async`。

## 阻塞渲染的因素

### 外部样式表

浏览器的渲染需要 render tree， render tree 需要 CSSOM 树才行，所以样式表的加载是会阻塞页面的渲染的，如果有一个外部的样式表处于下载中，那么即使 HTML 已经下载完毕，也会等待外部样式表下载并解析完毕才会开始构建 render tree。

link 和 @import 都能导入一个样式文件，它们有什么区别嘛？

- link 是 HTML 标签，除了能导入 CSS 外，还能导入别的资源，比如图片、脚本和字体等；而 @import 是 CSS 的语法，只能用来导入 CSS；
- link 导入的样式会在页面加载时同时加载，@import 导入的样式需等页面加载完成后再加载；
- link 没有兼容性问题，@import 不兼容 ie5 以下；
- link 可以通过 JS 操作 DOM 动态引入样式表改变样式，而 @import 不可以。

### 脚本

脚本就更麻烦了，先明确一点， JS 引擎和 UI 的渲染引擎是互斥的，所以当脚本在执行的时候浏览器要将控制权就给 JS 引擎，等到 JS 执行完毕再还给 UI 引擎，不论这个脚本是以何种形式加载的，在执行时均会阻塞 UI 的渲染。

接下来分别看不同形式加载的脚本对页面渲染的阻塞情况：

#### 内联脚本

`<script>...</script>` 内联的脚本随着 HTML 一起下载，在开始执行时已经完成了 `字节 → 字符 → 令牌 → 节点 → 对象模型` 的整个过程，所以不存在下载的时间（其实也不能这么说，下载的时间算在了 HTML 的下载时间中），执行时是会阻塞关键渲染路径的。

#### 外部脚本

`<script src="sample.js"></script>`外部脚本的整个加载过程及执行过程都是阻塞关键渲染路径的。

#### 带 defer 和 async 的外部脚本

`<script src="sample.js" defer></script>` `<script src="sample.js" async></script>` 带 defer/async 的脚本会与 HTML 并行下载，下载的过程不会阻塞 DOM 的构建，但是执行是会的，不同的是 defer 是在 DomContentLoaded 之前执行，async 是加载完之后立刻执行。

defer/async 的脚本在下载期间不会阻塞页面解析不是一个技术原因而是一个选择，因为内联脚本/外部脚本是要等待他们执行，所以不得不等待他们下载。而页面并不需要等待 defer/async 的脚本，所以他们的下载与页面的解析是并行的。

#### 动态生成的脚本

```js
var dynamicScript = document.creatElement('script')
dynamicScript.src = 'sample.js'
document.head.appendChild(dynamicScript)
dynamicScript.onload = function(){...}
```

动态生成的脚本的**下载过程不会阻塞**页面的解析，**执行会阻塞解析**，有点 async 的感觉。

#### 脚本与样式表的依赖关系

脚本不仅能够访问 DOM 元素，还能访问 DOM 的样式，如果将要执行脚本时浏览器尚未完成 CSSOM 的下载及构建，浏览器将延迟脚本执行和 DOM 构建，直至其完成 CSSOM 的下载和构建。

所以，CSSOM 的构建会阻塞 HTML 的渲染，也会阻塞 JS 的执行，但不会阻塞 JS 的下载；JS 的下载与执行（内联及外部样式表）也会阻塞 HTML 的渲染。

## 关键渲染路径优化

![浏览器渲染过程](/blog/images/devops/浏览器渲染过程.png)

![渲染流水线](/blog/images/devops/渲染流水线.png)

为尽快完成首次渲染，我们需要最大限度减小以下三种可变因素:

- 关键资源的数量: 可能阻止网页首次渲染的资源。

- 关键路径长度: 获取所有关键资源所需的往返次数或总时间。

- 关键字节: 实现网页首次渲染所需的总字节数,等同于所有关键资源传送文件大小的总和。

优化关键渲染路径的常规步骤如下：

- 对关键路径进行分析和特性描述：资源数、字节数、长度。
- 减少关键资源的大小。可以压缩 CSS 和 JavaScript 资源，移除 HTML、CSS、JavaScript 文件中一些注释内容。
- 最大限度减少关键资源的数量：删除它们，延迟它们的下载，将它们标记为异步等。一种方式是可以将 JavaScript 和 CSS 改成内联的形式；另一种方式，如果 JavaScript 代码没有 DOM 或者 CSSOM 的操作，则可以改成 async 或者 defer 属性
- 优化关键字节数以缩短下载时间 RTT（往返次数）。通过减少关键资源的个数和减少关键资源的大小搭配来实现。除此之外，还可以使用 CDN 来减少每次 RTT 时长
- 优化其余关键资源的加载顺序：您需要尽早下载所有关键资产，以缩短关键路径长度。

总的优化原则就是 **减少关键资源个数，降低关键资源大小，降低关键资源的 RTT 次数**。

## 避免过多 DOM 操作

浏览器有渲染引擎和 JS 引擎，所以当用 JS 操作 DOM 时，这两个引擎要通过接口互相“交流”，因此每一次操作 DOM（包括只是访问DOM的属性），都要进行引擎之间解析的开销，所以常说要减少 DOM 操作。总结下来有以下几点：

- 缓存一些计算属性，如 let left = el.offsetLeft。
- 通过 DOM 的 class 来集中改变样式，而不是通过 style 一条条的去修改。
- 分离读写操作。现代的浏览器都有渲染队列的机制。
- 放弃传统操作 DOM 的时代，基于 vue/react 等采用 virtual dom 的框架

## Dom 离线化

所谓的 Dom 离线化就是将要操作的元素从文档流中脱离，然后再恢复它。离线的 DOM 不属于当前 DOM 树中的任何一部分，这也就意味着我们对离线 DOM 处理就不会引起页面的回流与重绘。可以使用**`display: none`**，上面我们说到了 (**`display: none`**) 将元素从渲染树中完全移除，元素既不可见，也不是布局的组成部分，之后在该 DOM 上的操作不会触发回流与重绘，操作完之后再将**`display`**属性改为显示，只会触发这一次回流与重绘。

## 关键样式分离

样式表会阻塞渲染，在加载完毕之前是不会显示的，为了让用户以最快的速度看到页面上的内容，可以将页面的某一部分的样式抽离出来，单独放在一个样式表中或者内联在页面中，这样的样式称为 **关键样式**，这部分样式会优先它可以是页面的骨架屏或者是用户刚加载进页面时看到的首屏的内容。

- 样式分离，webpack 使用 **mini-css-extract-plugin** 分离样式，生成单独的 css 样式文件，压缩净化 CSS 文件。
- 减少关键 CSS 元素数量
- 当我们声明样式表时，请密切关注媒体查询的类型，它们极大地影响了 CRP 的性能 。
- 可以利用 gzip 压缩文件。
- 浏览器缓存

## CSS 选择器优化

想要优化 CSS 的性能，我们首先需要了解 CSS 的渲染规则，**CSS 选择器是从右向左进行匹配的。** CSS 中更多的选择器是不会匹配的，所以在考虑性能问题时，需要考虑的是如何在选择器不匹配时提升效率。从右向左匹配就是为了达成这一目的的，通过这一策略能够使得 CSS 选择器在不匹配的时候效率更高。这样想来，在匹配时多耗费一些性能也能够想的通了。

- 避免出现超过三层的嵌套规则：元素的嵌套层级不能超过 3 级，过度的嵌套会导致代码变得臃肿，沉余，复杂。导致 css 文件体积变大，造成性能浪费，影响渲染的速度！而且过于依赖 HTML 文档结构。这样的 css 样式，维护起来，极度麻烦。
- 避免为 ID 选择器添加多余选择器：在 ID 选择器前面嵌套其它选择器纯粹是多余的。
- 避免使用通配选择器，只对目标节点声明规则。
- 少用标签选择器。
- 尽量利用属性继承特性，避免重复匹配重复定义，关注可继承属性。

## CSS 属性优化

浏览器绘制图像时，CSS 的计算也是耗费性能的，一些属性需浏览器进行大量的计算，属于昂贵的属性（box-shadows、border-radius、transforms、filters、opcity、:nth-child等），这些属性在日常开发中经常用到，所以并不是说不要用这些属性，而是在开发中，如果有其它简单可行的方案，那可以优先选择没有昂贵属性的方案。

## 合理利用 CSS 合成动画

合成动画是直接在合成线程上执行的，这和在主线程上执行的布局、绘制等操作不同，如果主线程被 JavaScript 或者一些布局任务占用，CSS 动画依然能继续执行。所以要尽量利用好 CSS 合成动画，如果能让 CSS 处理动画，就尽量交给 CSS 来操作。

## 动画使用 transform 实现

对于一些体验要求较高的关键动画，比如一些交互复杂的玩法页面，存在持续变化位置的 animation 元素，我们最好是使用 transform 来实现而不是通过改变 left/top 的方式。这样做的原因是，如果使用 left/top 来实现位置变化，animation 节点和 Document 将被放到了同一个 GraphicsLayer 中进行渲染，持续的动画效果将导致整个 Document 不断地执行重绘，而使用 transform 的话，能够让 animation 节点被放置到一个独立合成层中进行渲染绘制，动画发生时不会影响到其它层。并且另一方面，动画会完全运行在 GPU 上，相比起 CPU 处理图层后再发送给显卡进行显示绘制来说，这样的动画往往更加流畅。

## 减少隐式合成

虽然隐式合成从根本上来说是为了保证正确的图层重叠顺序，但具体到实际开发中，隐式合成很容易就导致一些无意义的合成层生成，归根结底其实就要求我们在开发时约束自己的布局习惯，避免踩坑。

比如 z-index 属性值设置得大一些，让层叠顺序高过于页面其他无关节点就行。当然并不是盲目地设置 z-index 就能避免，有时候 z-index 也还是会导致隐式合成，这个时候可以试着调整一下文档中节点的先后顺序直接让后边的节点来覆盖前边的节点，而不用 z-index 来调整重叠关系。方法不是唯一的，具体方式还是得根据不同的页面具体分析。

## 避免重排与重绘

避免 DOM 的回流。也就是尽量避免重排和重绘操作。

### 重排

- 定义
  
  当通过 JS 或者 CSS 修改元素的几何属性，例如改变元素的宽度、高度等，那么浏览器会触发重新布局，解析之后的一系列子阶段，这个过程就叫重排。无疑，重排需要更新完整的渲染流水线，所以开销也是最大的。
- 图示

![重排](/blog/images/javascript/重排.png)

- 触发条件
  
  - 添加或者删除可见的DOM元素
  - 元素位置改变
  - 元素尺寸改变
  - 元素内容改变（例: 一个文本被另一个不同尺寸的图片替代）
  - 页面渲染初始化（无法避免）
  - 浏览器窗口尺寸改变
  
- 优化方案
  
  - 尽量不要在布局信息改变时做查询（会导致渲染队列强制刷新）。
  - 合并多次 DOM 操作。比如用 class 来改变多个样式。
  - 尽可能在 DOM 树的最末端改变 class;
  - 避免使用 table 布局。
  - 使用 fragment 元素（createDocumentFragment）
  - 让元素脱离文档流。即让当前元素有自己的图层。
  - 多次修改时把 dom 离线 ，修改完再显示。(display:none)
  - 使用采用虚拟 DOM 的库，如Vue，React
  - will-change: transform 启用硬件加速
  - 将动画效果应用到position属性为absolute或fixed的元素上
  - 避免使用 CSS 表达式（例如：calc()）

js 方面：

### 重绘

- 定义
  
  当通过JS或者 CSS 修改元素的绘制属性，例如改变元素的背景颜色，那么布局阶段将不会被执行，因为并没有引起几何位置的变换，所以就直接进入了绘制阶段（即生成待绘制列表），然后执行之后的一系列子阶段，这个过程就叫重绘。相较于重排操作，重绘省去了布局和分层阶段，所以执行效率会比重排操作要高一些。

- 图示
  
![重绘](/blog/images/javascript/重绘.png)

- 触发条件
  - background属性(background, background-color, background-image, background-position,background-repeat, background-size)
  - outline属性(outline, outline-color, outline-style)
  - box-shadow属性
  - border属性(border-style, border-radius)
  - visibility

- 优化方案
  - 合并多次操作

## 减少长任务执行时间

有时 JavaScript 函数的一次执行时间可能有几百毫秒，这就严重霸占了主线程执行其他渲染任务的时间。针对这种情况我们可以采用以下两种策略：

- 一种是将一次执行的函数分解为多个任务，使得每次的执行时间不要过久。- 任务分块，时间片分割、异步可中断，任务优先级；类似 React Fiber。
- 另一种是采用 Web Workers。 - 多线程并行

## 使用 web worker

Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。
合理实用 web worker 可以优化复杂计算任务

## 避免频繁的垃圾回收

我们知道 JavaScript 使用了自动垃圾回收机制，如果在一些函数中频繁创建临时对象，那么垃圾回收器也会频繁地去执行垃圾回收策略。这样当垃圾回收操作发生时，就会占用主线程，从而影响到其他任务的执行，严重的话还会让用户产生掉帧、不流畅的感觉。

## 使用防抖与节流

为什么使用防抖与节流？

防抖和节流是针对响应跟不上触发频率这类问题的两种解决方案。

在给 DOM 绑定事件时，有些事件我们是无法控制触发频率的。如鼠标移动事件 onmousemove, 滚动滚动条事件 onscroll，窗口大小改变事件 onresize，瞬间的操作都会导致这些事件会被高频触发。如果事件的回调函数较为复杂，就会导致响应跟不上触发，出现页面卡顿，假死现象。在实时检查输入时，如果我们绑定 onkeyup 事件发请求去服务端检查，用户输入过程中，事件的触发频率也会很高，会导致大量的请求发出，响应速度会大大跟不上触发。

针对此类快速连续触发和不可控的高频触发问题，debounce 和 throttling 给出了两种解决策略；节流会稀释函数的执行频率。除此之外可以用 requestAnimationFrame。目的就是当多次执行某一动作，进行函数调用次数的限制，节省资源。

### 防抖

#### 定义

在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时。事件触发经过 n 秒后才执行，如果在这 n 秒中又触发了该事件，则以该新事件触发时的时间为准，经 n 秒后，才执行。某个函数在某段时间内，无论触发了多少次回调，都只执行最后一次。你尽管触发事件，但是我一定在事件触发 n 秒后才执行，如果你在一个事件触发的 n 秒内又触发了这个事件，那我就以新的事件的时间为准，n 秒后才执行，总之，就是要等你触发完事件 n 秒内不再触发事件，我才执行。

#### 原理

实现原理就是利用定时器，函数第一次执行时设定一个定时器，之后调用时发现已经设定过定时器就清空之前的定时器，并重新设定一个新的定时器，如果存在没有被清空的定时器，当定时器计时结束后触发函数执行。

#### 应用场景

连续的事件，只需触发一次回调的场景

1. 搜索框搜索输入，搜索框联想场景。防止联想发送请求，只发送最后一次输入。
2. 手机号、邮箱验证输入检测(change、input、blur、keyup等事件触发，每次键入都会触发)
3. 窗口大小 resize 事件的触发。只需窗口调整完成后，计算窗口大小。防止重复渲染。调整浏览器窗口大小时，
4. resize 次数过于频繁，造成计算过多，此时需要一次到位，就用到了防抖
5. 鼠标的 mousemove、mouseover 事件的触发。
6. 导航条上，用户不停的在导航区域滑动
7. 登录、发短信等按钮提交场景，防止多次提交按钮，以致于发送了多次请求，只执行最后提交的一次，需要防抖
8. 文本编辑器实时保存，当无任何更改操作一秒后进行保存

#### 防抖实现

```js
/**
 * 其他写法 （推荐）
 * leading 为是否在进入时立即执行一次，原理是利用定时器，
 * 如果在规定时间内再次触发事件会将上次的定时器清除，
 * 即不会执行函数并重新设置一个新的定时器，直到超过规定时间自动触发定时器中的函数
 * 同时通过闭包向外暴露了一个 cancel 函数，使得外部能直接清除内部的计数器
 */
const debounce = (
  func,
  time,
  options = {
    leading: true,
    context: null,
  }
) => {
  let timer = null;
  const _debounce = function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    if (options.leading && !timer) {
      timer = setTimeout(null, time);
      func.apply(options.context, args);
    } else {
      timer = setTimeout(() => {
        func.apply(options.context, args);
        timer = null;
      }, time);
    }
  };
  _debounce.cancel = function () {
    clearTimeout(timer);
    timer = null;
  };
  return _debounce;
};

// 测试用例
let log = debounce(
  (i) => {
    console.log("防抖", i);
  },
  1000,
  { leading: true, context: this }
);
// 用例1
window.addEventListener("resize", log);
// 用例2
for (let i = 0; i < 1000; i++) {
  log(i);
}
```

### 节流

#### 定义

函数节流 throttle 指某个函数在一定时间间隔内执行一次，在这个时间间隔内将无视后来产生的函数调用请求。持续触发事件，每隔一段时间，只执行一次事件。规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效

#### 原理

节流的实现，有两种主流的实现方式，一种是使用时间戳，一种是设置定时器。

1. 根据首次是否执行以及结束后是否执行，效果有所不同，实现的方式也有所不同。
2. 使用时间戳的实现原理：使用时间戳，当触发事件的时候，我们取出当前的时间戳，然后减去之前的时间戳(最一开始值设为0)，
3. 如果大于设置的时间周期，就执行函数，然后更新时间戳为当前的时间戳，如果小于，就不执行。
4. 使用定时器的实现原理：当触发事件的时候，我们设置一个定时器，再触发事件的时候，
5. 如果定时器存在，就不执行，直到定时器执行，然后执行函数，清空定时器，这样就可以设置下个定时器。

#### 应用场景

间隔一段时间执行一次回调的场景

2. 1. 滚动加载 scroll 场景，加载更多或滚到底部监听，window.onscroll 和滑到底部自动加载更多
2. 谷歌搜索框，搜索联想功能
3. 高频点击提交，表单重复提交
4. 浏览器播放事件，每个一秒计算一次进度信息等
5. input 框实时搜索并发送请求展示下拉列表，没隔一秒发送一次请求 (也可做防抖)
6. 拖拽场景：固定时间内只执行一次，防止超高频次触发位置变动
7. 缩放场景：监控浏览器 resize

#### 节流实现

```js
/**
 * 其他写法（推荐）
 *
 * 和函数防抖类似，区别在于内部额外使用了时间戳作为判断，
 * 在一段时间内没有触发事件才允许下次事件触发，
 * 同时新增了 trailing 选项，表示是否在最后额外触发一次
 */
const throttle = (
  func,
  time,
  options = { leading: true, trailing: false, context: null }
) => {
  let previous = new Date(0).getTime();
  let timer = null;
  const _throttle = function (...args) {
    let now = new Date().getTime();
    if (!options.leading) {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        func.apply(options.context, args);
      }, time);
    } else if (now - previous > time) {
      func.apply(options.context, args);
      previous = now;
    } else if (options.trailing) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(options.context, args);
      }, time);
    }
  };

  _throttle.cancel = () => {
    previous = 0;
    clearTimeout(timer);
    timer = null;
  };

  return _throttle;
};

// 测试用例
let log = throttle(
  () => {
    console.log("throttle");
  },
  1000,
  { leading: true, trailing: true }
);
window.addEventListener("scroll", log, false);
```

## preload & prefetch

- **preload 优先加载，提高下载优先级**。会提升资源的优先级因为它标明这个资源是本页肯定会用到 —— **本页优先**。使用 preload 来提升资源加载的优先级。 preload 最大的作用就是将下载与执行分离，并且将下载的优先级提到了一个很高的地步，再由我们去控制资源执行的位置。

- **prefetch 预加载**。会降低这个资源的优先级因为它标明这个资源是下一页可能用到的 —— **为下一页提前加载**。例如：首页不需要这样的字体文件，下个页面需要，首页会以最低优先级来提前加载。

`PreloadWebpackPlugin` 用于预加载资源。 匹配其他页面可能用到的资源进行预先加载，从而达到无 loading，用户无感知的跳转。

```js
// 1. 配置置于 HtmlWebpackPlugin 之后
// 2. Webpack4之后，请使用最新版 npm install --save-dev preload-webpack-plugin@next
new PreloadWebpackPlugin({
    rel: 'prefetch',
    as: 'script',
    // as(entry){
    //   if(/\.css$/.test(entry)) return 'style';
    //   return 'script'
    // }
    include: 'asyncChunks',
    // fileBlacklist: ["index.css"]
    fileBlackList: [/\index.css|index.js|vendors.js]/,/\.whatever/]
})
```

### 加速样式表下载

样式表是阻塞页面呈现的（注意是呈现，不是解析），正常通过 link 加载的外部样式表要等下载，构建 CSSOM 树才会让页面呈现完成，但是 preload 能够让样式表的下载和呈现分离。

试想，当你在页面的 head 中写了如下的两个样式表：

```html
<link href="critial.css" rel="stylesheet" />
<link href="non-critial.css" rel="stylesheet" />
```

第一个是关键 CSS，第二个不是关键 CSS，当页面解析了这两个 link 标签后开始下载，但是即使 critical.css 下载解析完毕也不会呈现页面，因为页面还要下载和解析 non-critical.css。

这时候，就要将 non-critial.css 作为预加载，当样式表作为被 preload 后，他就不会再阻塞页面的呈现，也就是所谓的异步下载，修改后的代码如下：

```html
<link href="critial.css" rel="stylesheet" />
<link rel="preload" href="non-critial.css" as="style" />
```

如此一来，页面在解析完 `critical.css` 之后就会呈现（暂不考虑脚本），而 `non-critial` 也在下载，但是并不阻塞页面，指导它下载和解析完毕后才会应用到页面上。

现在并不是所有的浏览器都支持 preload，我们可以用 [loadCSS](https://github.com/filamentgroup/loadCSS) 这个库来做 polyfill，其实现的思路也是遍历所有带 preload 和 as 的标签，然后修改标签的 media 为不匹配任何条件并开始下载，在下载完毕后再还原该 link 原来的 media 标签将它应用。

### 加速脚本下载

preload 将脚本的加载及执行分离，加了 preload 的 `<link>` 标签的作用是将脚本提到高优先级尽快完成下载，但并未执行。

```html
<link rel="preload" href="//cdn.staticfile.org/jquery/3.2.1/jquery.min.js" as="script" />
```

还需要在你想要他执行的地方引入一个正常的 `<script>` 标签执行这个脚本

```html
<script src="//cdn.staticfile.org/jquery/3.2.1/jquery.min.js"></script>
```

否则 chrome 大约会在 3s 后报一个 warning 来提醒你这个资源被浪费了完全没有被使用到。

::: tip preload 与 defer
preload 的功能听起来很像被 defer 的脚本，但是：

- defer 无法控制脚本执行的时机，是在 DOMContentLoaded 执行前触发
- defer 会阻塞 DOMContentLoaded 事件
- defer 会阻塞 onload 事件，preload 不会阻塞 onload 事件
- defer 的脚本下载的优先级是 low，preload 的脚本优先级是 high
:::

::: tip 加载优先级
根据脚本在文档中的位置不同和他们是否是 async，defer 和阻塞，它们会有不同的优先级：

- 阻塞脚本在第一个图片前发起请求的优先级为：Medium（DevTools 中为 high）
- 阻塞脚本在第一个图片后发情请求的优先级为：Low（DevTools 中为 Medium）
- async/defer/动态插入的脚本（不论他们在文档中的什么位置）的优先级为：Lowest（DevTools 中为 Low）
:::

### 加速字体下载

自定义的字体在加载之前会处于 FOIT（Flash of Invisible Text）现象，具体的可以看 [关于@font-face加载前空白(FOIT)的解决方案](https://github.com/fi3ework/blog/issues/8)，虽然我们可以使用类似 webFont 一类的库来控制字体的闪现和添加钩子函数，但最佳解决方法还是让字体的加载达到最快的速度。

使用 preload 也可以来加速字体的下载，在 head 中声明 preload，比先下载样式表再从中读到 @font-face 的 src 再去加载要快得多。

```html
<link rel="preload" as="font" href="https://at.alicdn.com/t/font_zck90zmlh7hf47vi.woff">
```

但是要注意，preload 字体不带 `crossorigin` 也将会二次获取！ 确保你对 preload 的字体添加 `crossorigin` 属性，否则他会被下载两次，这个请求使用匿名的跨域模式。这个建议也适用于字体文件在相同域名下，也适用于其他域名的获取(比如说默认的异步获取)。preload 如果不带 `crossorigin meta` ，默认情况下 （即未指定 crossorigin 属性时）, CORS 根本不会使用，这样 http 的 request header 中就不会有 origin，默认不去跨域，但是 @font-face 中去加载字体是默认跨域请求的，所以会造成两次的 request header 不同，无法命中缓存，造成重复请求。

解决方法就是带上 `crossorigin`，空关键字和无效关键字都会被当做 `anonymous`

```html
<link rel="preload" as="font" href="//at.alicdn.com/t/font_327081_19o9k2m6va4np14i.woff" crossorigin>
<link rel="preload" as="font" href="//at.alicdn.com/t/font_327081_19o9k2m6va4np14i.woff" crossorigin="anonymous">
<link rel="preload" as="font" href="//at.alicdn.com/t/font_327081_19o9k2m6va4np14i.woff" crossorigin="fi3ework">
```

### 其他资源

preload 不仅可以将这些在 head 中的资源加速，还可以提前加载一些隐藏在 CSS 和 JS 中的资源，比如刚才隐藏在 CSS 中的字体资源，或者 JS 中请求的资源。

preload 的标签可以动态生成，这意味着在任何时候你都可以在页面中提前加载但不执行一个脚本，然后通过动态脚本来立刻执行它。

```js
var preload = document.createElement("link");
link.href = "myscript.js";
link.rel = "preload";
link.as = "script";
document.head.appendChild(link);
```

```js
var script = document.createElement("script");
script.src = "myscript.js";
document.body.appendChild(script);
```

### 媒体查询

现在的页面基本上都具有响应式设计，即针对移动端或桌面端会采用 media 进行媒体查询，有两种包含媒体查询的 CSS 代码的方法：

1. 将需要媒体查询的代码和基础样式代码放在同一文件中，使用 @media 来使媒体查询生效。
2. 将需要媒体查询的代码放在单独的一个外部样式表中，使用 media meta 对需要媒体查询的 link 进行控制。

这两种方法各有好处，如果需要媒体查询的代码量很小，那么和基础样式放在一起也没有关系，可以节省一次 HTTP 请求。如果比较大的话，那么就会让样式表的体积增加，造成 FOUC 的时间变长，这时候更适合使用第二种。

另外请注意“阻塞渲染”仅是指浏览器是否需要暂停网页的首次渲染，直至该资源准备就绪。无论哪一种情况，浏览器仍会下载 CSS 资源，但是不阻塞渲染的资源优先级较低。

优先级较低意味着浏览器在解析 HTML 时发现要下载这个样式表，但并不一定会立刻开始下载，而是可能会将它滞后一段时间再下载（等级低没人权），从 DevTools 上也可以看到 Highest 和 Lowest 的区别。如果媒体查询的样式表符合当前的页面，那么媒体查询的样式表也会阻塞关键路径渲染（就好像他是个正常的一样），同时，它的下载优先级也会恢复到最高（恢复人权）。

media 配合 preload 能做到响应式加载资源。如下代码，分别是两副图片适配移动端与 PC 端，如果不加 preload 的话，那么其中一幅就会以 Lowest 的等级延迟加载，但是如果我们是一个移动端优先的网站，不希望用户浪费流量及网速下载PC 端的大图的话，就在每个 link 上加上 preload 即可，只有在打开网页时符合 media 的资源会被加载，不符合 media 的资源始终不会被加载，即使后面将浏览器的宽度拉宽也不会加载。

```html
<link rel="preload" href="bg-image-narrow.png" as="image" media="(max-width: 600px)">
<link rel="preload" href="bg-image-wide.png" as="image" media="(min-width: 601px)">
```

如果用户真的拉宽了屏幕，或者切换端设备，可以使用 Window.matchMedia，来进行 media 的匹配。

```js
var mediaQueryList = window.matchMedia("(max-width: 600px)");
var header = document.querySelector('header');

if(mediaQueryList.matches) {
    header.style.backgroundImage = 'url(bg-image-narrow.png)';
} else {
    header.style.backgroundImage = 'url(bg-image-wide.png)';
}
```

## DNS 预解析

`dns-prefetch` 主要用来在用户点击一个链接之前解析对应的域名，这会自动去调用用户浏览器的解析机制。浏览器会在用户浏览网页时多线程完成预加载，当用户真正点击的时候就节省了用户等待域名解析的时间。

Chromium 的官方文档中很详细的介绍了 pre-fetch：

- Chromium 会根据页面中超链接的 href 去寻找主机名自动去 prefetch
- 如果访问的链接被重定向，那么浏览器可能无法自动识别出真正的主机进行 prefetch，此时需要我么手工预加载，也就是使用 prefetch 标签来指定主机。（这也是决定是否使用 dns-prefetch 的判断方法）
- 预加载不会对页面渲染造成损害，因为 Chromium 有8个专门用来预加载的线程。
- dns-prefetch 带来的网络消耗是很小的，用最小的网络开销代价可以换来较好的用户体验。
- 默认情况下，Chromium 和 Firefox 出于安全考虑会关闭在 https 下的自动预加载，可以通过指定 `meta http-equiv` 来开启自动预加载。

```html
<meta http-equiv="x-dns-prefetch-control" content="on">
```

如果通过 meta 显示的关闭了预加载，之后将无法再次开启预加载。

::: tip 图层渲染优化小结
优化渲染性能

- 优化 JS 的执行效率
- 降低样式计算的范围和复杂度
- 避免大规模、复杂的布局
- 简化绘制的复杂度、减少绘制区域
- 优先使用渲染层合并属性、控制层数量
- 对用户输入事件的处理函数去抖动（移动设备）
- 避免频繁使用 style，而是采用修改 class 的方式。
- 使用 createDocumentFragment 文档碎片进行批量的 DOM 操作。
- 对于 resize、scroll 等进行防抖/节流处理。
- 添加 will-change: tranform ，让渲染引擎为其单独实现一个图层，当这些变换发生时，仅仅只是利用合成线程去处理这些变换，而不牵扯到主线程，大大提高渲染效率。当然这个变化不限于 tranform, 任何可以实现合成效果的 CSS 属性都能用 will-change 来声明。

[渲染优化](https://www.jianshu.com/p/a32b890c29b1)
:::

除了页面加载速度之外，还有一个特别影响用户体验的问题，就是页面的白屏，下面介绍白屏优化方案：

## 白屏渲染优化

[渲染模式通识](/architecture/)

白屏优化是前端界面体验的一个重要优化方向，Web 前端诞生了 SSR 、CSR、预渲染等技术。白屏出现的原因是因为要等待文件加载、CSSOM 构建、JS 解析等过程，而这些过程比较耗时，导致用户会长时间出于不可交互的首屏灰白屏状态，从而给用户一种网页很“慢”的感觉。

|      | CSR  | 预渲染 | SSR | 同构 |
| ---- | :--- | :---| :---| :---|
| 优点 | 不依赖数据 FP；时间最快；客户端用户体验好；内存数据共享 | 不依赖数据 FCP；时间比 CSR 快；客户端用户体验好；内存数据共享 | SEO 友好首屏性能高；FMP 比 CSR 和预渲染快 | SEO 友好首屏性能高；FMP 比 CSR 和预渲染快；客户端用户体验好；内存数据共享客户端与服务端代码公用，开发效率高 |
| 缺点 | SEO 不友好FCP 、FMP 慢 | SEO 不友好FMP 慢 | 客户端数据共享成本高模板维护成本高 | Node 容易形成性能瓶颈 |

通过对比，同构方案集合 CSR 与 SSR 的优点，可以适用于大部分业务场景。但由于在同构的系统架构中，连接前后端的 Node 中间层处于核心链路，系统可用性的瓶颈就依赖于 Node ，一旦作为短板的 Node 挂了，整个服务都不可用。

通过对比 FP、FCP、FMP 这三个时期 DOM 的差异，发现区别在于：

- FP：仅有一个 div 根节点。
- FCP：包含页面的基本框架，但没有数据内容。
- FMP：包含页面所有元素及数据。

在 FP 的灰白屏界面停留了很长时间，用户不清楚网站是否有在正常加载，用户体验很差。
试想：如果我们可以将 FCP 或 FMP 完整的 HTML 文档提前到 FP 时机预渲染，用户看到页面框架，能感受到页面正在加载而不是冷冰冰的灰白屏，那么用户更愿意等待页面加载完成，从而降低了流失率。并且这种改观在弱网环境下更明显。

以 Vue 为例， 在其生命周期中，mounted 对应的是 FCP，updated 对应的是 FMP。那么具体应该使用哪个生命周期的 HTML 结构呢？

|      | mounted (FCP) | updated (FMP)  |
| ---- | :----| :----|
| 缺点 | 只是视觉体验将 FCP 提前，实际的 TTI 时间变化不大 | 构建时需要获取数据，编译速度慢构建时与运行时的数据存在差异性有复杂交互的页面，仍需等待，实际的 TTI 时间变化不大 |
| 优点 | 不受数据影响，编译速度快 | 首屏体验好对于纯展示类型的页面，FP 与 TTI 时间近乎一致 |

通过以上的对比，最终选择在 mounted 时触发构建时预渲染。由于我们采用的是 CSR 的架构，没有 Node 作为中间层，因此要实现 DOM 内容的预渲染，就需要在项目构建编译时完成对原始模板的更新替换。

### 服务端渲染 SSR

服务端渲染，服务端直出页面。在客户端将标签渲染成的整个 html 片段的工作在服务端完成，服务端形成的 html 片段直接返回给客户端这个过程就叫做服务端渲染。

#### 服务端渲染的优点

- 更好的 SEO： 因为 SPA 页面的内容是通过 Ajax 获取，而搜索引擎爬取工具并不会等待 Ajax 异步完成后再抓取页面内容，所以在 SPA 中是抓取不到页面通过 Ajax 获取到的内容；而 SSR 是直接由服务端返回已经渲染好的页面（数据已经包含在页面中），所以搜索引擎爬取工具可以抓取渲染好的页面；
- 更快的内容到达时间（首屏加载更快）： SPA 会等待所有 Vue 编译后的 js 文件都下载完成后，才开始进行页面的渲染，文件下载等需要一定的时间等，所以首屏渲染需要一定的时间；SSR 直接由服务端渲染好页面直接返回显示，无需等待下载 js 文件及再去渲染等，所以 SSR 有更快的内容到达时间；

#### 服务端渲染的缺点

- 更多的开发条件限制： 例如服务端渲染只支持 beforCreate 和 created 两个钩子函数，这会导致一些外部扩展库需要特殊处理，才能在服务端渲染应用程序中运行；并且与可以部署在任何静态文件服务器上的完全静态单页面应用程序 SPA 不同，服务端渲染应用程序，需要处于 Node.js server 运行环境；
-更多的服务器负载：在 Node.js  中渲染完整的应用程序，显然会比仅仅提供静态文件的  server 更加大量占用CPU 资源 (CPU-intensive - CPU 密集)，因此如果

### 预渲染

所谓预渲染，就是在项目的构建过程中，通过一些渲染机制，比如 puppeteer或则 jsdom 将页面在构建的过程中就渲染好，然后插入到 html 中，这样在页面启动之前首先看到的就是预渲染的页面了。

可以用 `prerender-spa-plugin` 做预渲染，这样就可以在浏览器进行渲染，而不需要将 Vue 或者 React 代码部署到服务器上。

预渲染的作用:

- 大型单页应用的性能瓶颈：JS下载+解析+执行

- SSR的主要问题：牺牲TTFB 请求过程，来补救首次加载 First Paint 实现起来，也很复杂

- Pre-rendering 打包时提前渲染页面，没有服务端参与

预渲染有什么缺点呢？

- 动态数据无法展示，不同的用户看到的都是同样的页面
- 路由很多时，代码构建时间太长
- 用户容易误操作，由于预渲染时 js 还没有加载，因此展示出来的内容没有 js 的交互逻辑，比如按钮点击，在 js 加载完成之前用户点击是没有反应的
- 预加载内容很少，当页面有内容是依赖动态数据加载时，在编译时是无法加载出动态数据的，因此会导致这部分内容编译不出来

### 骨架屏

骨架屏的实现原理和预加载类似，都是利用了 Puppeteer 爬取页面的功能，Puppeteer 是 chrome 出的一个 headlessChromenode 库，提供了 API 可以抓取 SPA 并生成预渲染内容，和预加载不太一样的是骨架屏技术会在 Puppeteer 生成内容后，利用算法将生成的内容进行替换，生成骨架页面，`page-skeleton-webpack-plugin` 是一个用来生成骨架屏的 webpack 插件。

- CSS 属性读写分离：浏览器每次对元素样式进行读操作时，都必须进行一次重新渲染（重排 + 重绘），所以我们在使用 JS 对元素样式进行读写操作时，最好将两者分离开，先读后写，避免出现两者交叉使用的情况。最最最客观的解决方案，就是不用 JS 去操作元素样式，这也是我最推荐的。

- 通过切换 class 或者 style.csstext 属性去批量操作元素样式

- DOM 元素离线更新：当对 DOM 进行相关操作时，例如 innerHTML、appendChild 等都可以使用 Document Fragment 对象进行离线操作，带元素“组装”完成后再一次插入页面，或者使用 display:none 对元素隐藏，在元素“消失”后进行相关操作。

- 将没用的元素设为不可见：visibility: hidden，这样可以减小重绘的压力，必要的时候再将元素显示。

- 压缩 DOM 的深度，一个渲染层内不要有过深的子元素，少用 DOM 完成页面样式，多使用伪元素或者 box-shadow 取代。

- 图片在渲染前指定大小：因为 img 元素是内联元素，所以在加载图片后会改变宽高，严重的情况会导致整个页面重排，所以最好在渲染前就指定其大小，或者让其脱离文档流。

- 对页面中可能发生大量重排重绘的元素单独触发渲染层，使用 GPU 分担 CPU 压力。（这项策略需要慎用，得着重考量以牺牲 GPU 占用率能否换来可期的性能优化，毕竟页面中存在太多的渲染层对与 GPU 而言也是一种不必要的压力，通常情况下，我们会对动画元素采取硬件加速。）

::: warning 参考文献
[前端性能优化之浏览器渲染优化 —— 打造60FPS页面](https://github.com/fi3ework/blog/issues/9)

[前端性能优化之关键路径渲染优化](https://github.com/fi3ework/blog/issues/16)

[深度剖析浏览器渲染性能原理，你到底知道多少](https://www.jianshu.com/p/a32b890c29b1)

[从 8 道面试题看浏览器渲染过程与性能优化](https://juejin.cn/post/6844904040346681358#heading-24)

[聊一聊前端性能优化 CRP](https://juejin.cn/post/6847902219761778695#heading-14)

[页面生命周期：DOMContentLoaded, load, beforeunload, unload解析](https://github.com/fi3ework/blog/issues/3)

[资源提示 —— 什么是 Preload，Prefetch 和 Preconnect？](https://github.com/fi3ework/blog/issues/32)

[Prefetch & preconnect-dns 的优先级](https://github.com/fi3ework/blog/issues/33)

[浏览器层合成与页面渲染优化](https://juejin.cn/post/6844903966573068301#heading-4)

[聊一聊前端性能优化 CRP](https://juejin.cn/post/6847902219761778695#heading-15)

[首页白屏优化实践](https://juejin.cn/post/6844903941713428487#heading-2)

[前端黑科技：美团网页首帧优化实践](https://juejin.cn/post/6844903715262955533#heading-2)

[今日头条品质优化 - 图文详情页秒开实践](https://juejin.cn/post/6876011410061852680)
:::
