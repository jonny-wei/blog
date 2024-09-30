# H5 移动端适配

## 像素相关概念

| 概念 | 描述 |
| :----| :---- |
| 像素 px | 是图像显示的基本单元，相对单位。每个像素的大小是不固定的，他是根据设备的分辨率决定的|
| 设备像素(物理像素) dp | device pixels，显示屏就是由一个个物理像素点组成，屏幕从工厂出来那天起物理像素点就固定不变了。也就是我们经常看到的手机分辨率所描述的数字。单位 pt。 |
| 设备独立像素(逻辑像素) dip | device-independent pixels，就是我们手机的**实际视口大小**。是操作系统为了方便开发者而提供的一种抽象。程序与操作系统之间描述长度是以设备独立像素为单位。不随页面缩放、浏览器窗口大小而改变。一个设备独立像素对应CSS 中的 1px，一个单位的设备独立像素（也就是1px）表示 N 个物理像素。|
| 设备像素比 dpr | devicePixelRatio，是物理像素和设备独立像素的比值。|
| CSS 像素 | 在 CSS 中使用的 px 都是指 CSS 像素。**不考虑缩放情况下，1个 CSS 像素等于1个设备独立像素(逻辑像素)。**|
| 屏幕尺寸 | 屏幕对角线长度，单位inch |
| 屏幕分辨率 | 750*1334，手机屏幕纵、横方向像素点数，单位是px。常说的分辨率指的就是**物理像素**。相同大小的屏幕而言，屏幕分辨率越高显示的像素越多，单个像素尺寸较小，显示效果就越精细。|
| 像素密度 dpi(ppi) | dot per inch(pixels per inch)，每英寸像素数，通过屏幕尺寸和分辨率来计算像素密度。也是屏幕出厂时就确定了。屏幕像素密度(PPI)越大，设备独立像素对应的物理像素越多，屏幕越清晰|

总的来说，像素单位基本分为三种：设备像素(物理像素)、设备独立像素(逻辑像素)、CSS 像素。设备像素比 = 物理像素/逻辑像素； （可以通过 JS 来获取设备像素比 window.devicePixelRatio）。


一个单位的设备独立像素（也就是1px）表示N个物理像素，如果固定用一个设备独立像素表示一个物理像素会带来什么问题呢，假设有两块 5 英寸的屏幕，一块的分别率是 `500*500`，另一块的分别率是 `1000*1000`，因为设备独立像素和物理像素是一比一的关系当把250px 的盒子渲染到屏幕上时，在 `500*500` 的屏幕盒子占宽度的二分之一，到了 `1000*1000` 的屏幕就只占到四分之一，这是完全不同的用户体验。因此我们在物理像素上抽象一个逻辑层，以固定数量的物理像素来表示一个设备独立像素，重新构成页面渲染的像素点。至于多少个物理像素对应一个设备独立像素就需要设备像素比(DPR)来说明。

设备像素比主要用来告诉屏幕设备独立像素（也就是CSS里的1px）对应在显示器上渲染几个物理像素。这样我们用 CSS 设置的 1px，不论在什么设备上显示的都是 1px，但是这个 1px 对应的物理像素是不确定的。

::: tip 网页放大
我们在 PC 浏览器上按 `Ctrl + 加号` 键，改变的就是设备像素比（DPR），可以 console.log(window.devicePixelRatio) 看一下，DPR 变大了，一个设备独立像素(CSS的px)对应的物理像素变多了，所以视觉上页面变大了。
:::


## 1px 问题

### 为什么出现 1px 问题

自从 2010 年 iPhone4 推出了 Retina 屏开始，移动设备屏幕的像素密度越来越高，于是便有了 2 倍屏、3 倍屏的概念。简单来说，就是手机屏幕尺寸没有发生变化，但屏幕的分辨率却提高了一倍，**即同样大小的屏幕上，像素多了一倍**。那么我们**获取到的 CSS 像素就不是真实的物理像素点了**，于是便有了**设备像素比的概念（ devicePixelRatio 简称 dpr）**。它用来描述屏幕物理像素与逻辑像素的比值。不同手机有不同的设备像素比。

对于前端来说，在高清屏出现之前，前端代码的 1px 即等于手机物理像素点(设备像素)的 1px。但有了 dpr 的概念之后，由于前端代码中的使用的是 CSS 像素，手机会根据 dpr 换算成实际的物理像素大小来渲染页面。比如 iPhone6 的设备像素比 dpr = 2 ，相当于一个 CSS 像素等于两个物理像素，即 1px 由 2个物理像素点(设备像素)组成。那么问题来了，以 iPhone6 为例，其 dpr = 2、屏幕尺寸(CSS 像素) 为 375x667，一般设计稿提供 2 倍图尺寸为 750x1334 。那么设计稿中的 1px，对应屏幕尺寸其实应该写成 0.5px。再由 dpr 计算公式可知，0.5 * 2 = 1px 物理像素。此时你应该已经发现了，设计稿要实现 1px 细线、1px 边框，为什么前端实现总是偏粗的？那是因为如果你在代码中直接写成 1px，再通过 dpr 计算之后其实是 2px 物理像素，并不符合设计稿的要求。总的来说，**CSS 中的 1px 并不等于设备的 1px**。

那么当 dpr=2 时，代码中直接写成 0.5px 就解决问题了吗？

### 小数像素 0.5px 的兼容性问题

解决 1px 问题的核心思路是 在 web 中，浏览器为我们提供了 `window.devicePixelRatio` 来帮助我们获取 dpr。在 css 中，可以使用媒体查询 `min-device-pixel-ratio`，区分 dpr： 我们根据这个像素比，来算出他对应应该有的大小，但是暴露个非常大的兼容问题。

在 PC 端浏览器的最小识别像素为 1px。在手机端，不同手机浏览器对小数点像素的处理效果就更千奇百怪了。

其中 Chrome 把 0.5px 四舍五入变成了 1px，而 firefox/safari 能够画出半个像素的边，并且 Chrome 会把小于 0.5px 的当成 0，而 Firefox 会把不小于 0.55px 当成 1px，Safari 是把不小于 0.75px 当成 1px，进一步在手机上观察 iOS 的 Chrome 会画出 0.5px 的边，而安卓 (5.0) 原生浏览器是不行的。所以直接设置 0.5px 不同浏览器的差异比较大，并且我们看到不同系统的不同浏览器对小数点的 px 有不同的处理。所以如果我们把单位设置成小数的 px 包括宽高等，其实不太可靠，因为不同浏览器表现不一样。

## 解决 1px 问题

- 使用 伪元素 + 缩放 的方式
- 使用 动态 viewport + rem 布局 的方式
- 使用 vw 单位 进行适配方案

优点：

针对老项目使用缩放的形式可以快速实现 1px 的效果。

注意：

- 如果项目中使用了 rem 单位的话，此处的 1px 是不能用 rem 单位的，否则根据 rem 换算后再进行缩放，会使得边框变得更细。

- 如果项目中使用了 `postcss-pxtorem` 插件进行编译的话，记得不要对 1px 进行编译。配置文档参考 [postcss-pxtorem](https://www.npmjs.com/package/postcss-pxtorem) 。

## scale 缩放

缩放的方式就是避免了直接写小数像素带来的不同手机的兼容性处理不同。

```css
// 通过伪元素实现 0.5px border
.border::after {
    content: "";
    box-sizing: border-box; // 为了与原元素等大
    position: absolute;
    left: 0;
    top: 0;
    width: 200%; 
    height: 200%; 
    border: 1px solid gray;
    transform: scale(0.5); 
    transform-origin: 0 0;
}

// 通过伪元素实现 0.5px 细线
.line::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 1px;
    background: #b3b4b8;
    transform: scale(0.5);
    transform-origin: 0 0;
}

// 进行 dpr 适配可以这样写
@media (-webkit-min-device-pixel-ratio: 2)  {
    .line::after {
        ...
        height: 1px;
        transform: scale(0.5);
        transform-origin: 0 0;
    }
}

@media (-webkit-min-device-pixel-ratio: 3)  {
    .line::after {
        ...
        height: 1px;
        transform: scale(0.333);
        transform-origin: 0 0;
    }
}
```

::: tip 扩展补充
CSS 最新的规范中正在计划通过标准的属性实现一像素边框，通过给 `border-width` 属性添加 `hairline` 关键字属性来实现，之所以叫 hairline，是因为一像素边框就跟头发丝一样。
:::

### 为什么要先放大 200% 再缩小 0.5？

为了只缩放 border 1px 的粗细，而保证 border 的大小不变。如果直接 scale(0.5) 的话 border 整体大小也会变成二分之一，所以先放大 200%（放大的时候 border 的粗细是不会被放大的）再缩放，就能保持原大小不变了。

### 为什么采用缩放的方式，就可以解决手机对小数点处理的兼容性问题？

首先代码中处理的是 1px ，避免了直接操作小数像素的问题；当 dpr=2 时，换算成物理像素为 2px，此时去缩放 scale(0.5)、当 dpr=3 时，换算成物理像素为 3px，此时缩放 scale(0.3) 后，手机均会默认使用最小物理像素 1px 来渲染。按照 CSS3 transform 的 scale 定义，边框可以任意细，理论上可以实现任意细的缩放效果。

## 动态 Viewport + REM 适配方式

采用动态设置 `viewport + rem` 布局，该方案其实是参考了阿里早期开源的一个移动端适配解决方案 flexible ，本文进行了一些改进。**该方案不仅解决了移动端适配的问题，同时也较好的解决了 1px 的问题**。

先了解几个概念：

### viewport 视口

就是浏览器上(或者是一个 APP 中的 webview )用来显示网页的那部分区域，但 viewport 又不局限于浏览器可视区域的大小，它可能比浏览器的可视区域要大，也可能比浏览器的可视区域要小。我们一般最常用的是 layout viewport (浏览器默认的 viewport)。默认宽度大于浏览器可视区域的宽度，所以浏览器默认会出现横向滚动条。

```js
const clientWidth = document.documentElement.clientWidth || document.body.clientWidth
```

### 通过 meta 标签设置 viewport

由于 viewport 默认宽度是大于浏览器可视区域的，所以需要通过设置 viewport 的宽度等于屏幕宽 width=device-width 来避免出现横向滚动条。

```html
<meta name="viewport" content="
    width=device-width,  // 设置viewport的宽等于屏幕宽
    initial-scale=1.0,  // 初始缩放为1
    maximum-scale=1.0, 
    user-scalable=no,  // 不允许用户手动缩放
    viewport-fit=cover // 缩放以填充满屏幕
    " 
>
```

- name 设置元数据的名称，content 设置元数据的值。name 属性值为 viewport 时，表示设置有关视口初始大小的提示，仅供移动端使用
- 同时设置 width=device-width,initial-scale=1.0 是为了兼容 iOS 和 IE 浏览器

### 关于页面缩放 initial-scale

initial-scale 缩放值越大，当前 viewport 的宽度就会越小，反之亦然。 比如屏幕宽度是 320px 的话，如果我们设置 initial-scale=2 ，此时 viewport 的宽度会变为只有 160px 了。这也好理解，放大了一倍嘛，就是原来 1px 的东西变成 2px 了，但是并不是把原来的 320px 变为 640px ，而是在实际宽度不变的情况下，1px 变得跟原来的 2px 的长度一样了。所以缩放页面的时候，实际上改变了 CSS 像素的大小，而数量不变。所以原来需要 320px 才能填满的宽度现在只需要 160px 就做到了。

### rem 单位

rem 是 CSS3 新增的一个相对单位，这个单位与 em 的区别在于使用 rem 为元素设定字体大小时，仍然是相对大小，但相对的只是 HTML 根元素。这个单位可谓集相对大小和绝对大小的优点于一身，通过它**既可以做到只修改根元素就成比例地调整所有字体大小，又可以避免字体大小逐层复合的连锁反应**。目前，除了 IE8 及更早版本外，所有浏览器均已支持 rem。对于不支持它的浏览器，应对方法也很简单，就是多写一个绝对单位的声明。这些浏览器会忽略用 rem 设定的字体大小。

rem 的布局，不得不提 flexible，flexible 方案是阿里早期开源的一个移动端适配解决方案，引用 flexible 后，我们在页面上统一使用 rem 来布局。

### flexible 适配方案原理及问题

Flexible 的大致实现思路是，首先根据 dpr 来动态修改 meta 标签中 viewport 中的 initial-scale 的值，以此来动态改变 viewport 的大小；然后页面上统一使用 rem 来布局，viewport 宽度变化会动态影响 html 中的font-size 值，以此来实现适配。Flexible 方案主要是借助 JavaScript 控制 viewport 的能力，使用 rem 模拟 vw 的特性从而达到适配目的的一套解决方案。

-  使用 rem 模拟 vw 特性适配多种屏幕尺寸

```js
// set 1rem = viewWidth / 10
function setRemUnit () {
    var rem = docEl.clientWidth / 10
    // docEl为document.documentElement，即html元素
    docEl.style.fontSize = rem + 'px'
}
setRemUnit();
```

Flexible 将整个页面的宽度切成了 10 份，然后将计算出来的页面宽度的 1/10 设置为 html 节点的 fontSize，也就意味着，之后我们在当前页面的 html 节点的子节点上应用 rem 为单位时都是按照页面比例来计算的。

- 控制 viewport 的 width 和 scale 值适配高倍屏显示

设置 viewport 的 width=device-width，改变浏览器 viewport（布局视口和视觉视口）的默认宽度为理想视口宽度，从而使得用户可以在理想视口内看到完整的布局视口的内容。等比设置 viewport 的 initial-scale、maximum-scale、minimum-scale 的值，从而实现 `1物理像素 = 1css像素`，以适配高倍屏的显示效果（就是在这个地方规避了大家熟知的“1px问题”）

```js
var metaEL= doc.querySelector('meta[name="viewport"]');
var dpr = window.devicePixelRatio;
var scale = 1 / dpr
metaEl.setAttribute('content', 'width=device-width, initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
```

为什么不直接引用 flexible 库来进行移动端适配呢？

因为这个方案只是个过渡方案。由于该方案诞生较早，官方也是认为 flexible 已经完成了它的历史使命，比如当时它只处理了 iOS 不同 dpr的场景，安卓设备下默认都设置为 dpr = 1 等(对高倍屏的安卓手机没做处理)，这是有问题的。当年 viewport 在低版本安卓设备上还有兼容问题，而 vw，vh 还没能实现所有浏览器兼容，所以 flexible 方案用 rem 来模拟 vmin 来实现在不同设备等比缩放的“过度”方案。根据设备大小去判断页面的方案是根据屏幕大小去百分百还原设计稿，从而让人看到的大小效果是一样的。本质上，用户使用更大的屏幕，是想看到更多的内容，而不是更大的字。所以，这个用缩放来解决问题的方案是个过渡方案，注定被时代所淘汰。

- 对高倍屏的安卓手机没做处理。
- 不兼容响应式布局。
- 无法正确响应系统字体大小。
- flexible 对 iframe 的使用不兼容。


### viewport + rem 利用 flexiable 原理适配

在日常的业务场景中，虽然我们不会去使用 flexible 库，但其实大多还是沿用 flexible 实现的原理来进行移动端适配，并从中进行了一些改进来达到适配的目的。

viewport + rem 利用 flexiable 原理进行移动端适配，也可以使用 postcss-pxtorem 可以帮我们把我们需要转的 px 值计算转换为对应的 rem 值：

```html
<head>
    <meta
      name="viewport"
      content="width=device-width,user-scalable=no,initial-scale=1,minimum-scale=1,maximum-scale=1,viewport-fit=cover"
    />
    <script type="text/javascript">
      // 动态设置 viewport 的 initial-scale
      var viewport = document.querySelector("meta[name=viewport]");
      var dpr = window.devicePixelRatio || 1; // 获取 dpr
      var scale = 1 / dpr;
      viewport.setAttribute(
        "content",
        "width=device-width," +
          "initial-scale=" +
          scale +
          ", maximum-scale=" +
          scale +
          ", minimum-scale=" +
          scale +
          ", user-scalable=no"
      );
      // 计算 rem font-size
      var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
      clientWidth > 750 && (clientWidth = 750);
      var ft = (clientWidth / 7.5).toFixed(2); // 以 750 设计稿为例
      document.documentElement.style.fontSize = ft + "px";
    </script>
  </head>
```

#### 为什么页面缩放比例 initial-scale设置为 1/dpr？

通过设置页面缩放比例为 1/dpr，可将 viewport 的宽度扩大 dpr 倍。还是以 iPhone6 手机为例，不进行页面缩放时 viewport 宽度 375px、dpr=2。由于 dpr 的存在使得一个 CSS 像素需要两个物理像素来渲染。当设置 `initial-scale = 1/dpr = 0.5` 时，获取到的 viewport 宽度 `clientWidth = 750px` ，被扩大了 dpr 倍，就正好是设备物理像素的宽度。 简单推导一下就是，当 scale=0.5 时，由于 viewport 内可容纳的 CSS 像素数量的增多，相当于一个设备独立像素在横纵向上会覆盖两个 CSS 像素。

此时我们写的 1px 其实正好是一个物理像素的大小，并且可以较好的画出 1px 的边框，从而提高显示精度，从此我们就可以愉快地直接写 1px 啦！ 同时这个方案也较好的解决了只使用 rem 进行布局时，出现计算后的各种 0.5px、0.55px 等兼容性问题。

#### 动态设置 viewport+ rem 布局方式下 1px 问题对比

- 直接写 1px
- 使用 0.01rem，不同机型 fontSize 在 100px~144px之间，0.01rem 计算后基本都大于等于 1px

- iPhone6 屏幕宽 375px，dpr = 2、initial-scale= 0.5 时，clientWidth 变为 750px，根元素 fontSize = 100px，那么 0.01rem 正好等于 1px，并且大小和设计稿一致，展示效果理论上应该是最好的。
- Huawei P30 屏幕宽 360px，dpr = 3、initial-scale= 0.3 时，clientWidth 变为 1080px，根元素 fontSize = 144px，那么 0.01rem = 1.44px。其实这个时候我们实现的已经大于 1px 了。相当于大于1个物理像素来渲染。


## vw，vh 适配

视口指的是在桌面端，指的是浏览器的可视区域；而在移动端较为复杂，它涉及到三个视口：分别是 **Layout Viewport（布局视口）**、 **Visual Viewport（视觉视口）**、**Ideal Viewport**。在桌面端，毫无疑问指的就是浏览器的可视区域；但是在移动端，它指的则是三个 Viewport 中的 Layout Viewport 。

- vw : 1vw 等于视口宽度的1%
- vh : 1vh 等于视口高度的1%
- vmin : 选取 vw 和 vh 中最小的那个
- vmax : 选取 vw 和 vh 中最大的那个

就主流的响应式布局、弹性布局来说，通过 Media 查询实现的布局需要配置多个响应断点，而且带来的体验也对用户十分的不友好：布局在响应断点范围内的分辨率下维持不变，而在响应断点切换的瞬间，布局带来断层式的切换变化。而通过采用 rem 单位的动态计算的弹性布局，则是需要在头部内嵌一段脚本来进行监听分辨率的变化来动态改变根元素字体大小，使得 CSS 与 JS 耦合了在一起。

通过利用视口单位实现适配的页面，是既能解决响应式断层问题，又能解决脚本依赖的问题的。

### 仅使用 vw 作为 CSS 单位

vh、vw 方案即将视觉视口宽度 window.innerWidth 和视觉视口高度 window.innerHeight 等分为 100 份。将 px 单位自动转换成viewport 单位。vh 和 vw 方案和 rem 类似也是相当麻烦需要做单位转化，而且 px 转换成 vw 不一定能完全整除，因此有一定的像素差。不过，webpack 解析 css 的时候用 postcss-loader 有个 `postcss-px-to-viewport` 能自动实现 px 到 vw 的转化。

```js

module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-px-to-viewport': {
      viewportWidth: 750,   // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
      viewportHeight: 1334, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
      unitPrecision: 3,     // 指定`px`转换为视窗单位值的小数位数
      viewportUnit: "vw",   //指定需要转换成的视窗单位，建议使用vw
      selectorBlackList: ['.ignore'],// 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
      minPixelValue: 1,     // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
      mediaQuery: false     // 允许在媒体查询中转换`px`
    }
  }
}
```

::: tip 问题
1. @keyframes 和 media 查询 里的 px 默认是不转化的，通过以下方式解决：
   - 设置 mediaQuery：true 则媒体查询里也会转换 px
   - @keyframes 可以暂时手动填写 vw 单位的转化结果

2. 一般来说使用 px 转为 vw、vh 就可以应付 99% 的移动端适配了，但偶尔会有个别情况需要使用媒体查询适配小屏分辨率。可以通过媒体查询处理边界情况。

3. 当我们在项目中同时引入了 `postcss-px-to-viewport` 插件及第三方组件库时会出现样式冲突。既第三方组件库的 px 单位也被转为了 vw 或 vh，会严重影响组件库的美观，这是我们不想看到的情况。一般组件库的 class 命名都会带上自己独有的前缀，所以我们借助此前缀名通过配置 selectorBlackList 来进行过滤。

4. 至于 vw、vh 属性的兼容性，pc 端也许有点差强人意，但手机上基本可以放心使用了。

5. 部分安卓机型 1px 边框（边距）无法显示。android 部分手机机 `0.x` 像素会被识别为 0，即无边框状态。当边框、边距、圆角小于 1px 的时候，避免使用 vw，但 postcss-px-to-viewport 会自动将 px 转换为 vw，怎么才能让某一个属性不转化为 vw 呢？
   - 把 px 改成大写的字母，PX、Px、pX 都可以
   - 在 postcss-px-to-viewport 的配置参数里加上 minPixelValue：1，小于或等于 1px 不会转换为 vw
:::

### 搭配 vw 和 rem 布局更优化

单纯的利用视口单位 vw、vh 做适配，会有一点小瑕疵。由于它是利用视口单位实现的布局，依赖于视口大小而自动缩放，无论视口过大还是过小，它也随着视口过大或者过小，失去了最大最小宽度的限制。于是，联想到不如结合 rem 单位来实现布局？rem 弹性布局的核心在于动态改变根元素大小，那么我们可以通过：

- 给根元素大小设置随着视口变化而变化的 vw 单位，这样就可以实现动态改变其大小。
- 限制根元素字体大小的最大最小值，配合 body 加上最大宽度和最小宽度

这样我们就能够实现对布局宽度的最大最小限制。

```scss
// rem 单位换算：定为 75px 只是方便运算，750px-75px、640-64px、1080px-108px，如此类推
$vw_fontsize: 75; // iPhone 6尺寸的根元素大小基准值
@function rem($px) {
     @return ($px / $vw_fontsize ) * 1rem;
}

// 根元素大小使用 vw 单位
$vw_design: 750;
html {
    font-size: ($vw_fontsize / ($vw_design / 2)) * 100vw; 
    // 同时，通过Media Queries 限制根元素最大最小值
    @media screen and (max-width: 320px) {
        font-size: 64px;
    }
    @media screen and (min-width: 540px) {
        font-size: 108px;
    }
}

// body 也增加最大最小宽度限制，避免默认100%宽度的 block 元素跟随 body 而过大过小
body {
    max-width: 540px;
    min-width: 320px;
}
```

搭配 vw 和 rem 布局更优化相比 单纯的 vw 有以下优点：

- 相对来说用户视觉体验更好，增加了最大最小宽度的限制；

- 更重要是，如果选择主流的 rem 弹性布局方式作为项目开发的适配页面方法，那么更适合于后期项目从 rem 单位过渡到 vw 单位。只需要通过改变根元素大小的计算方式，你就可以不需要其他任何的处理，就无缝过渡到另一种 CSS 单位，更何况 vw 单位的使用必然会成为一种更好适配方式，目前它只是碍于兼容性的支持而得不到广泛的应用。


## 横屏适配

因为页面适配的场景往往是竖屏式的，因此 VW + REM 方案表现得十分完美。但是遇上横屏式，它的缺点就暴露了出来。

**现行的 vw 单位适配方案带来的问题**：由于响应断点的限制最大宽度处理，会导致页面两侧留白，当然这可以通过去掉最大宽度限制来解决。而真正的缺点在于，由于 vw 单位的特性，适配换算大小是根据屏幕宽度而言的，因此屏幕宽度越大导致容器、文字会越大，还可能导致 DOM 元素超出屏幕外，且文字过大并不是我们所想要的用户体验。

**换成 px 单位的固定布局如何**？px 单位的固定布局只适合于部分场景，对于需要内容全屏覆盖的场景，就可能存在这样的不理想的用户体验：绝对定位的元素之间空隙过大，导致布局不美观，又或者空隙过小，导致元素叠放被遮挡。

vw 单位的特点是适配换算大小时是根据屏幕宽度而定的，那么在强制横屏显示时，我们就可以同理转换为屏幕高度来而定，也就是 vw 单位替换成 vh 单位。更好的适配解决方案 —— vw、vh 单位搭配：

```scss
$vw_base: 375;
$vw_fontsize: 20;
html {
  font-size: 20px; //不支持vw单位时，回退到px单位
  font-size: ($vw_fontsize / $vw_base) * 100vw;
}
@media screen and (orientation: landscape) {
  html {
    font-size: 20px;
    font-size: ($vw_fontsize / $vw_base) * 100vh;
  }
}
```

JavaScript 检测横屏:

```js
window.addEventListener("resize", ()=>{
    if (window.orientation === 180 || window.orientation === 0) { 
      // 正常方向或屏幕旋转180度
        console.log('竖屏');
    };
    if (window.orientation === 90 || window.orientation === -90 ){ 
       // 屏幕顺时钟旋转90度或屏幕逆时针旋转90度
        console.log('横屏');
    }  
}); 
```

CSS 检测横屏

```scss
@media screen and (orientation: portrait) {
  /*竖屏...*/
} 
@media screen and (orientation: landscape) {
  /*横屏...*/
}
```


## 总结

移动端适配主要就分为两方面，一方面要适配不同机型的屏幕尺寸，一方面是对细节像素的处理过程。如果你在项目中直接写了 1px ，由于 dpr 的存在展示导致渲染偏粗，其实是不符合设计稿的要求。如果你使用了 rem 布局计算出了对应的小数值，不同手机又有明显的兼容性问题。此时老项目的话整体修改 viewport 成本过高，可以采用第一种实现方案进行 1px 的处理；新项目的话可以采用动态设置 viewport 的方式，一键解决所有适配问题。

::: warning 参考文献
[关于移动端适配，你必须要知道的](https://juejin.cn/post/6844903845617729549)

[移动端适配 - 基础知识篇](https://juejin.cn/post/6844904112270622728)

[移动端适配-实践篇](https://juejin.cn/post/6844904112274817031)

[flexible.js 原理解析](https://juejin.cn/post/6923060568437817351)

[详解移动端1px 问题](https://juejin.cn/post/6916034386320179207)

[Web移动端最强适配方案总结](https://mp.weixin.qq.com/s/HEanrLroo_9OJdSChUeS1Q)

[最后一次探究 1px](https://jelly.jd.com/article/5f5a4b31da524a0147e97da0)

[移动端H5页面布局适配总结](https://mp.weixin.qq.com/s/OayQZ39yK85xQsWCWkfY_g)

[H5游戏开发：横屏适配](https://jelly.jd.com/article/6006b1045b6c6a01506c87f8)

[H5页面适配 iPhoneX](https://mp.weixin.qq.com/s/xkG4TDlhp6WqHYFXEkwH4g)

[移动端适配指南！聊聊安卓折叠屏给交互设计和开发带来的变化](https://mp.weixin.qq.com/s/zuQ4933_ZqnFVDBTAQ75ag)

[移动端Web页面适配方案（整理版）](https://www.jianshu.com/p/2c33921d5a68)

:::