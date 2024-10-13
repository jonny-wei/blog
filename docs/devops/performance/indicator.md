# 性能指标与采集

## 性能指标

### 传统性能指标

传统性能指标，通过记录一个文档从发起请求到加载完毕的各阶段的性能耗时，以加载速度来衡量性能。

![indicator3](/blog/images/devops/indicator3.png)

#### 初始化阶段

- navigationStart: 用户完成卸载前一个文档的时间点。

- redirectStart：页面重定向时的开始时间，或者是 0。

- redirectEnd：页面重定向的结束时间，或者是 0。

#### 请求阶段

- fetchStart：浏览器发起资源请求时，有缓存时，则返回读取缓存的开始时间。

- domainLookupStart：查询 DNS 的开始时间。

- domainLookupEnd：查询 DNS 的结束时间。

- connectStart：浏览器开始与服务器连接时的时间。

- secureConnectionStart：如果页面使用 HTTPS，它的值是安全连接握手之前的时刻。

- connectEnd：当浏览器端完成与服务器端建立连接的时刻。

- responseStart：指客户端收到从服务器端（或缓存、本地资源）响应回的第一个字节的数据的时刻。

- responseEnd：指客户端收到从服务器端（或缓存、本地资源）响应回的最后一个字节的数据的时刻。

#### 解析渲染阶段

- domLoading： 浏览器即将开始解析第一批收到的 HTML 文档字节，`Document.readyState` 变为 `loading`。

- domInteractive: 当前网页 DOM结构结束解析、开始加载内嵌资源的时间点。`Document.readyState` 变为 `interactive`。

- domContentLoadedEventStart: 当解析器发送 `DomContentLoaded` 事件，所有需要被执行的脚本已经被解析。

- domContentLoadedEventEnd: 所有需要立即执行的脚本已经被执行。

- domComplete: 当前文档解析完成， `Document.readyState` 变为 `complete`。

- loadEventStart: 作为每个网页加载的最后一步，浏览器会触发 `load` 事件，以便触发额外的应用逻辑。如果这个事件还未被发送，它的值将会是 0。

- loadEventEnd:`load` 事件执行完成。如果这个事件还未被发送，或者尚未完成，它的值将会是 0。

![indicator4](/blog/images/devops/indicator4.png)

#### 各阶段耗时

- 重定向 Redirect:  `redirectEnd - redirectStart`

- 缓存 App cache:  `domainLookupStart - fetchStart`

- DNS 解析 DNS: `domainLookupEnd - domainLookupStart`

- TCP建连 TCP:  `connectEnd - connectStart`

- SSL 握手 SSL:  `connectEnd - secureConnectionStart`

- 请求耗时 Request: `responseStart - requestStart`  

- 响应耗时 Response: `responseEnd - responseStart`

- Processing:  `domComplete - domLoading`

#### 实际运用中的常见指标

- 页面完全加载耗时 Load:  `loadEventEnd - navigationStart`

- DOMReady: `domContentLoaded - fetchStart`

- dom 解析耗时 DOMParse: `domInteractive - responseEnd`

- 页面请求到收到应答 TTFB: `responseStart - navigationStart`

TTFB（Time To First Byte） 是发出页面请求到接收到应答数据第一 个字节的时间总和，它包含了DNS解析时间、 TCP连接时间、发送HTTP请求时间和获得响应消息第一个字节的时间

- 剩余资源加载耗时 ResourceLoad: domComplete - domContentLoaded

传统的性能指标专注于容易衡量的技术细节，但是它们很难反应出用户所真正关心的是什么。如果你仅仅是把加载速度优化的更快，你很快就会发现网站的用户体验依然很差。

以用户为中心的性能指标衡量页面显示有用内容的速度，用户是否可以与之交互，以及这些交互是否流畅且无延迟。

下面是常用的以用户为中心的性能指标，也是我们比较关注的指标。

### 何时开始渲染  - FP & FCP

#### FP

FP（First Paint）: **首次渲染**的时间点。用于记录页面第一次绘制像素的时间。 FP 时间点之前，用户看到的都是**没有任何内容的白色屏幕**，可以视为**白屏时间**。

#### FCP

FCP（First Contentful Paint）: **首次有内容渲染**的时间点。用于记录页面首次绘制文本、图片、非空白 Canvas 或 SVG 的时间。在用户访问 Web 网页的过程中，FCP 时间点之前，用户看到的都是**没有任何实际内容的屏幕**。FCP 反映当前 Web 页面的网络加载性能情况、页面 DOM 结构复杂度情况、`inline script` 的执行效率的情况。当所有的阶段性能做的非常好的情况下，首次出现内容的时间就会越短，用户等待的时间就会越短，流失的概率就会降低，可以作为**首屏时间**。

通过这两个指标，就可以衡量页面**何时开始渲染内容**。官方推荐，FP 及 FCP 两指标在 2 秒内完成的话我们的页面就算体验优秀。

::: tip FP vs FCP

- FP：从开始加载到第一次渲染

- FCP：从开始加载到第一次内容渲染。

- FCP 是 FP 的增强版，对用户来说更关键。因为 FCP 带着图像和文字这些内容信息，是用户更关心的。

- FP 和 FCP 可能是重合的。

:::

### 何时渲染出主要内容 - FMP & LCP & SI

#### FMP

FMP（First Meaningful Paint）: **首次绘制有意义内容**的时间点。当整体页面的布局和文字内容全部渲染完成后，可认为是完成了首次有意义内容的绘制。业界比较认可的方式是在加载和渲染过程中最大布局变动之后的那个绘制时间即为当前页面的 FMP。FMP 通常被认为是用户获取到了页面主要信息的时刻，也就是说此时**用户的需求是得到了满足的**，所以产品通常也会关注 FMP 指标。只不过它计算相对复杂，且存在准确性等问题，Lighthouse 6.0 中**已被废弃**。

FMP 代码实现原理：

认为`DOM 结构变化的时间点`与之对应`渲染的时间点`近似相同。所以 FMP 的时间点为 `DOM 结构变化最剧烈的时间点`。

DOM 结构变化的时间点」可以利用 [MutationObserver](https://dom.spec.whatwg.org/)[API](https://dom.spec.whatwg.org/) 来获得。

1. 通过 `MutationObserver` 监听每一次页面整体的 DOM 变化，触发 `MutationObserver` 的回调。
2. 在回调计算出当前 DOM 树的分数，分数变化最剧烈的时刻，即为 FMP 的时间点。

#### LCP

LCP（Largest Contentful Paint）:  **最大的内容在可视区域内变得可见**的时间点。用于记录视窗内最大的元素绘制的时间，该时间会随着页面渲染变化而变化，因为页面中的最大元素在渲染过程中可能会发生改变，另外该指标会在用户第一次交互后停止记录。页面的最大内容（通常是比较核心的内容）加载完成的时间，这个最大内容可以是图片/文本块。它是一个 **SEO 相关的指标**。

LCP 其实能比前两个指标更能体现一个页面的性能好坏程度，因为这个指标会持续更新。举个例子：当页面出现骨架屏或者 Loading 动画时 FCP 其实已经被记录下来了，但是此时用户希望看到的内容其实并未呈现，我们更想知道的是页面主要的内容是何时呈现出来的。此时 LCP 指标是能够帮助我们实现想要的需求的。官方推荐，在 2.5 秒内表示体验优秀。

::: tip  FMP vs LCP

- FMP: 早期比较推荐的性能指标，但是计算更复杂，而且准确性不是很好

- LCP: 更新的数据指标，有 API 直接支持，统计简单，且准确，但也存在最大内容是否为最核心内容这样的问题。

:::

::: tip FCP vs LCP

- FCP：页面加载过程中，比较早期的一个指标，如果一个页面有 loading 态，这个指标表现可能很好，但是实际内容什么时候呈现给用户，这个指标没办法衡量。

- LCP：关注页面核心内容呈现时间，这个内容是用户更感兴趣的，更加用户相关。

:::

#### SI

SI（Speed Index）: 衡量**页面可视区域加载速度**，帮助检测页面的加载体验差异。两个页面如果首次内容出现和完全加载时间一样，那么渐进加载的页面体验更好。

::: tip 何时渲染出主要内容：FMP && LCP && SI

- FMP：First Meaningful Paint，完成首次有意义内容绘制的时间点。

- LCP：Largest Contentful Paint，最大的内容在可视区域内变得可见的时间点。

- SI：Speed Index，衡量页面可视区域的加载速度，反映页面的加载体验差异。

:::

有了这三个指标，就可以衡量页面何时渲染出主要内容了。不过业界有测试得出， LCP  非常近似于 FMP 的时间点，同时 FMP 性能消耗较大，且会因为一些细小的变化导致数值巨大波动，所以**推荐使用 LCP。** 而 SI 因为计算复杂，指标难以解释，所以一般只在实验室环境下使用。

### 何时可以交互 - TTI & TBT

#### TTI

TTI（Time to Interactive）: 测量页面**从开始加载到主要子资源完成渲染**，并能够快速、可靠地响应用户输入所需的时间。通常是发生在页面依赖的资源已经加载完成，此时浏览器可以快速响应用户交互的时间。TTI 反映页面可用性的重要指标。**TTI 值越小，代表用户可以更早地操作页面**，用户体验就更好。指标的计算过程，需要满足以下几个条件：

1. 从 FCP 指标后开始计算；
2. 持续 5 秒内无长任务（执行时间超过 50 ms）且无两个以上正在进行中的 GET 请求；
3. 往前回溯至 5 秒前的最后一个长任务结束的时间。

::: tip Long Task

如果浏览器主线程执行的一个 task 耗时大于 50ms，那么这个 task 称为 long task。

用户的交互操作也是在主线程执行的，所以当发生 Long Task 时，用户的交互操作很可能无法及时执行，这时用户就会体验到卡顿（当页面响应时间超过 100ms 时，用户可以体验到卡顿），进而影响用户体验。

:::

#### TBT

TBT（Total Blocking Time）: **阻塞总时间**。量化主线程在空闲之前的繁忙程度，有助于理解在加载期间，**页面无法响应用户输入的时间有多久**。一个页面的 TBT，是**从 FCP 到 TTI 之间所有长任务的阻塞时间的总和**。主线程执行的任务分为长任务和短任务。规定持续时间超过 50ms 的任务为长任务，低于 50ms 的任务为短任务。长任务中超过 50ms 的时间被认为是“阻塞”的，因此，TBT 是所有长任务中阻塞时间的总和。

这个指标的高低其实也影响了 TTI 的高低，或者说和长任务相关的几个指标都有关联性。TTI 虽然可以衡量页面可以交互的时间点，但是却无法感知这个期间浏览器的繁忙状态。而结合 TBT ，就能帮助理解在加载期间，页面无法响应用户输入的时间有多久。

### 交互时是否有延迟 - FID & MPFID

#### FID

FID（First Input Delay）: **首次输入延迟**。测量从用户第一次与页面交互（比如当他们单击链接、点按按钮等等）直到浏览器对交互作出响应，实际能够**开始处理事件处理程序所经过的时间**，即**交互延迟时间**。一般来说，发生输入延迟是因为浏览器的主线程正忙着执行其他工作（比如解析和执行大型 JS 文件），还不能响应用户。

1. FID 反映用户对页面交互性和响应性的第一印象，良好的第一印象有助于用户建立对整个应用的良好印象。
2. 页面加载阶段，资源的处理任务最重，也最容易产生输入延迟。因此**关注 FID 指标对于提升页面的可交互性有很大收益**。
3. FID 和页面加载完成后的 Input Delay 具有不同的解决方案。针对 FID，我们一般建议通过 `Code Splitting` 等方式减少页面加载阶段 JS 的加载、解析和执行时间。而页面加载完成后的 `Input Delay`，通常是由于开发人员代码编写不当、引起 JS 执行时间过长而产生的。

#### MPFID

MPFID（Max Potential First Input Delay）：记录在页面加载过程中用户和页面进行首次交互操作可能花费的最长时间。

MPFID 是一个虚拟的可能的延迟时间，而FID是用户真实的首次交互的延迟时间。所以一般推荐使用FID，它是用户对页面交互性和响应性的第一印象。良好的第一印象有助于用户建立对整个应用的良好印象。同时在页面加载阶段，资源的处理任务最重，最容易产生输入延迟。

### 页面是否稳定 - CLS

#### CLS

CLS（Cumulative Layout Shift）: **累积布局偏移**。量化了**在页面加载期间，视口中元素的移动程度**。在一个页面的生命周期中，会不断的发生布局变化（layout shift），对每一次布局变化做一个累积的记分，其中得分最大布局变化即为 CLS，是**衡量页面稳定性**的重要指标。

CLS 推荐值为低于 0.1，越低说明页面跳来跳去的情况就越少，用户体验越好。毕竟很少有人喜欢阅读或者交互过程中网页突然动态插入 DOM 的情况，比如说插入广告~

::: tip Core Web Vitals 三核心指标

2020 年 5 月，Google 提出的衡量网站用户体验的核心数据指标，涵盖了页面的加载速度、可交互性和稳定性，会影响 SEO 的重要指标，包含一下三项：

- LCP：衡量加载速度。代表了页面的速度指标。LCP 能体现的东西更多一些。一是指标实时更新，数据更精确，二是代表着页面最大元素的渲染时间，通常来说页面中最大元素的快速载入能让用户感觉性能还挺好。
- FID：衡量交互性。代表了页面的交互体验指标。没有一个用户希望触发交互以后页面的反馈很迟缓，交互响应的快会让用户觉得网页挺流畅。
- CLS：衡量稳定性。代表了页面的稳定指标。CLS 值一大的话会让用户觉得页面体验做的很差。

:::

## 指标采集

### 传统指标采集

采集页面加载过程的各阶段耗时

页面加载过程中的时间点主要依赖 Navigation Timing 标准，这个标准后来升级到了 2.0 版本， 对应 Navigation Timing 2 标准，两者虽然不尽相同，但是可计算出的指标基本一致。获取各个阶段的响应时间，我们所要用到的接口是`PerformanceNavigationTiming` 接口。`PerformanceNavigationTiming` 提供了用于存储和检索有关浏览器文档事件的指标的方法和属性。在浏览器中可以通过下面的方式获取：

```javascript
// navigation timing
const timing = window.performance.timing

// navigation timing 2
performance.getEntriesByType('navigation')
```

![indicator1](/blog/images/devops/indicator1.png)

基于这些数据，不仅可以计算出 DNS / TCP / Request 等耗时，还可以计算出 DOMReady / DOMParse / Load 等耗时。

![indicator2](/blog/images/devops/indicator2.png)

#### DOMContentLoaded(DCL)

DOM 加载完成即触发，不用等页面资源加载。

#### Load(L)

页面及其依赖的资源全部加载完成的时间，包括所有的资源文件，如样式表和图片等。

#### 采集 DOMContentLoaded & Load

```js
new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    const Load = entry.loadEventStart - entry.fetchStart;
    console.log('Load:', Load);
  }
}).observe({ type: 'navigation', buffered: true});

new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    const DOMContentLoaded = entry.domContentLoadedEventStart - entry.fetchStart;
    console.log('DOMContentLoaded:', DOMContentLoaded);
  }
}).observe({type: 'navigation', buffered: true});
```

### 采集 FP & FCP

- FP：衡量白屏时间

- FCP：衡量首屏时间

通过这两个指标，就可以衡量页面**何时开始渲染内容**。官方推荐，FP 及 FCP 两指标在 2 秒内完成的话我们的页面就算体验优秀。

FP 和 FCP 可以通过浏览器提供的 API 直接获取，所以采集原理并不复杂。如果页面已经完成了首次绘制和首次内容绘制，可以使用下面的方式直接获取。

```js
window.performance.getEntriesByType('paint')
// or
window.performance.getEntriesByName('first-paint')
window.performance.getEntriesByName('first-contentful-paint')
```

但是如果页面还没有开始首次绘制，就需要通过监听获取。

```js
const observer = new PerformanceObserver(function(list) {
  const perfEntries = list.getEntries();
  for (const perfEntry of perfEntries) {
      // Process entries
      // report back for analytics and monitoring
      // ...
  }
});

// register observer for paint timing notifications
observer.observe({entryTypes: ["paint"]});
```

### 采集 FMP & LCP

- FMP：首次绘制有意义内容的时间点。早期比较推荐的性能指标，但是计算更复杂，实际内容什么时候呈现给用户，这个指标没办法衡量，而且准确性不是很好

- LCP：最大的内容在可视区域内变得可见的时间点。一个 SEO 相关的指标，关注页面核心内容呈现时间。官方推荐，在 2.5 秒内表示体验优秀。

通过这两个指标，就可以衡量页面**何时渲染出主要内容**。官方推荐，使用 LCP 指标，在 2.5  秒内完成的话我们的页面就算体验优秀。

#### 采集 FMP

与 `FP / FCP / LCP` 相比， FMP 的采集相对比较复杂，它需要通过算法计算得出，而业界并没有统一的算法。不过比较认可的一个计算 FMP 的方式是「认定页面在加载和渲染过程中最大布局变动之后的那个绘制时间即为当前页面的 FMP 」。由于在页面渲染过程中，「 DOM 结构变化的时间点」和与之对应的「渲染的时间点」近似相同，所以一般计算 FMP 的方式是：计算出 DOM 结构变化最剧烈的时间点，即为 FMP。具体步骤为：

1. 通过 MutationObserver 监听每一次页面整体的 DOM 变化，触发 MutationObserver 的回调
2. 在回调计算出当前 DOM 树的分数
3. 在结算时，通过对比得出分数变化最剧烈的时刻，即为 FMP

```js
new MutationObserver(() => {
  // 这里是剧烈程度分的计算
}).observe(document, {childList: true, subtree: true});
```

通过 MutationObserver 对 DOM 变化进行监听，每次回调根据新旧 DOM 数量、种类、深度等，计算出当前 DOM 树的分数，分数变化最剧烈的时刻视为 FMP ，`Load` 事件触发后 200ms 停止监听，取最大变动的记录做上报。

FMP 计算相对复杂，且存在准确性等问题，Lighthouse 6.0 中**已被废弃**

#### 采集 LCP

LCP 主要依赖 PerformanceObserver，具体监听方式如下：

```javascript
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('LCP candidate:', entry.startTime, entry);
  }
}).observe({type: 'largest-contentful-paint', buffered: true});
```

`largest-contentful-paint` 事件会在页面加载过程中根据此时已渲染最大元素的变化，不断的被触发，实际上报中会一直监听这些变化，直到用户与页面发生交互行为（比如 click、keydown）或者页面被隐藏或者页面被 `unload` 等，取监听到的最后值做上报。

浏览器会多次报告 LCP ，而一般真正的 LCP 是用户交互前最近一次报告的 LCP ，因为交互往往会改变用户可见的内容，所以用户交互后新报告的 LCP 不再符合 LCP 的指标定义。

### 采集 TTI & TBT

- TTI：衡量页面页面可用性。测量页面从开始加载到主要子资源完成渲染。TTI 值越小，代表用户可以更早地操作页面，用户体验就更好。TTI 虽然可以衡量页面可以交互的时间点，但是却无法感知这个期间浏览器的繁忙状态。
- TBT: 衡量主线程长任务（> 50ms）阻塞时间，繁忙程度。测量从 FCP 到 TTI 之间所有长任务的阻塞时间的总和。

通过这两个指标，就可以衡量页面**何时可以交互**。

与 FMP 相似，浏览器也没有提供直接获取 TTI 的 API ，不过针对如何计算 TTI 有详细的描述，实现对应描述就可以得出 TTI 的时间点。

TTI 的采集依赖 `Long Tasks API` 和 `Resource Timing API` 这两个 API，计算过程：

1. 先采集 FCP，作为起点
2. 沿时间轴正向搜索时长至少为 5 秒的安静窗口。安静窗口需要满足三个条件：
   - 没有 Long Task
   - 窗口中正在处理的 GET 请求不超过两个
   - 窗口时间窗读应该至少 5s
3. 沿时间轴反向搜索安静窗口之前的最后一个长任务，如果没有找到长任务，则在 FCP 步骤停止执行
4. TTI 是安静窗口之前最后一个长任务的结束时间，如果没有找到长任务，则与 FCP 值相同

窗口前的最后一个长任务的结束时间就是 TTI 。

而通过计算 FCP 和 TTI 之间的长任务的阻塞时间的总和，就能得出 TBT 。

### 采集 FID & MPFID

- FID：测量实际能够开始处理事件处理程序所经过的时间，即交互延迟时间。FID 反映用户对页面交互性和响应性的第一印象。一般建议通过 `Code Splitting` 等方式减少页面加载阶段 JS 的加载、解析和执行时间。
- MPFID：记录在页面加载过程中用户和页面进行首次交互操作可能花费的最长时间

通过这两个指标，就可以衡量页面**交互时是否有延迟、反应页面可交互性**。

FID 同样依赖 PerformanceObserver，FID 监听用户的第一次输入（first-input）事件，`FID = 开始处理 input 的时间 - input 操作的起始时间`, 具体监听方式如下：

```js
new PerformanceObserver(function(list, obs) {
  const firstInput = list.getEntries()[0];

  // Measure the delay to begin processing the first input event.
  // FID = 开始处理 input 的时间 - input 操作的起始时间
  const firstInputDelay = firstInput.processingStart - firstInput.startTime;
  // Measure the duration of processing the first input event.
  // Only use when the important event handling work is done synchronously in the handlers.
  const firstInputDuration = firstInput.duration;
  // Obtain some information about the target of this event, such as the id.
  const targetId = firstInput.target ? firstInput.target.id : 'unknown-target';
  // Process the first input delay and perhaps its duration...

  // Disconnect this observer since callback is only triggered once.
  obs.disconnect();
}).observe({type: 'first-input', buffered: true});
```

MPFID 是 FCP 之后最长的长任务耗时，可以通过**监听 FCP 之后的 Long tasks**，对比拿到**最长的长任务就是 MPFID**。

虽然浏览器提供了足够的 API 来帮助采集各个性能指标，但是在 JS 中计算具体指标要更为复杂。原因有两点：

- API 报告的内容和指标本身的定义有部分差异，所以计算时要处理这些差异；
- 部分场景下浏览器不会报告对应内容，这些场景下需要模拟测量。

### 采集 CLS

- CLS：量页面稳定性。累积布局偏移。量化了在页面加载期间，视口中元素的移动程度。CLS 推荐值为低于 0.1，越低说明页面跳来跳去的情况就越少，用户体验越好。

收集 CLS，将加载过程分块（session），监听 `layout-shift` 变化获得每次布局变动的 `value` 值，统计每个 `session` 的布局变动分数，**最大的布局变动分数时段，即为 CLS**。

```js
let sessionEntries = [];
let sessionValue = 0;
let metric = {
  value: 0
}

new PerformanceObserver(entryList => {
  for (const entry of entryList.getEntries()) {
    if (!entry.hadRecentInput) {
      const firstSessionEntry = sessionEntries[0];
      const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
      if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
        // 如果时间靠近上一个 session, 将本轮 layout-shift 累加进上一个 session  
        sessionValue += entry.value;
        sessionEntries.push(entry);
      } else { 
        // 新起一个 session
        sessionValue = entry.value;
        sessionEntries = [entry];
      }
      // 如果当前 session 的 value 大于之前的最大值，替换为现在这个大的
      if (sessionValue > metric.value) {
        metric.value = sessionValue;
        metric.entries = sessionEntries;
        console.log('CLS: ', metric)
      }
    }
  }
}).observe({type: 'layout-shift',buffered: true});
```

## 性能评估

### 性能指标基准线

Google 提供了各个性能指标的基准线，有一定的参考意义。为什么只说是有一定参考意义？首先基准线本身是在变化的，随着指标计算的逐渐更新以及软件硬件的更新，基准线也会有一定的调整。其次用户的使用场景对性能指标也会有很大的影响，比如 iOS 用户上报的性能指标一般都优于 Android 用户上报的性能指标。

![indicator5](/blog/images/devops/indicator5.png)

经过测试，LCP 非常近似于FMP的时间点，FMP 渐渐可以通过 LCP 代替。SI 的计算逻辑比较复杂，更常用在 lighthouse 中，而非线上监控。虽然 TBT 可以在线上进行测量，但不建议这样做，因为用户交互会影响网页的 TBT，从而导致报告中出现大量差异，线上监控推荐使用 FID。

### 衡量站点满意度

站点满意度的衡量除了要考虑常规的性能指标外，还要考虑体验类的指标，比如专门衡量视觉稳定性的指标 CLS。

线上的站点满意度衡量，一般会在参考lighthouse的满意度计算规则的基础上，去除一些推荐在实验室环境测量的指标的权重。

![indicator6](/blog/images/devops/indicator6.png)

[一文搞懂得物前端监控](https://mp.weixin.qq.com/s/bruENZY_hyNAetmxuc33SA)

[前端白屏检测](https://mp.weixin.qq.com/s/06HcyA5KwMOUJxTtCoVbkQ)

[如何衡量一个站点的性能好坏](https://juejin.cn/post/7130830761137012766#heading-1)

[做性能优化时，我们关注哪些指标？](https://mp.weixin.qq.com/s/SlS0J9eSb20PCLW062sQVg)
