# 事件循环

了解 **事件循环** 前，有必要先了解浏览器进程，浏览器渲染进程下的多线程， js 为什么采用单线程。 具体见 [浏览器渲染](../browser/browser-render)

![事件循环](/blog/images/javascript/事件循环.png)

1. 主线程每次执行时，先看看要执行的是同步任务，还是异步的 API
2. 同步任务就继续执行，一直执行完
3. 遇到异步 API 就将它交给对应的异步线程，自己继续执行同步任务
4. 异步线程执行异步 API，执行完后，将异步回调事件放入任务队列里
5. 主线程手上的同步任务干完后就来任务队列看看有没有任务
6. 主线程发现任务队列有任务，就取出里面的任务执行
7. 主线程不断循环上述流程

JavaScript 代码的执行过程中，除了依靠函数调用栈来搞定函数的执行顺序外，还依靠任务队列(task queue)来搞定另外一些代码的执行。使用异步的好处是你只需要设置好异步的触发条件就可以去干别的事情了，所以异步不会阻塞主线程的执行。整个执行过程，我们称为**事件循环过程**。

## 事件循环机制

前面简化了任务队列，其实任务队列里面的任务还可以分两类：宏任务和微任务。微任务拥有更高的优先级，当事件循环遍历队列时，先检查微任务队列，如果里面有任务，就全部拿来执行，执行完之后再执行一个宏任务。执行每个宏任务之前都要检查下微任务队列是否有任务，如果有，优先执行微任务队列。所以完整的流程图如下

![任务队列](/blog/images/javascript/event-loop2.png)

::: tip 注意

- 一个 Event Loop 可以有一个或多个事件队列，但是只有一个微任务队列。
- 微任务队列全部执行完会重新渲染一次
- 每个宏任务执行完都会重新渲染一次
- requestAnimationFrame 处于渲染阶段，不在微任务队列，也不在宏任务队列
  :::

事件循环既可能是浏览器的主事件循环也可能是被一个 web worker 所驱动的事件循环。

Chrome 中的事件循环：

![chrome事件循环](/blog/images/javascript/chrome事件循环.png)

现在知道页面主线程是如何接收外部任务了：如果其他进程想要发送任务给页面主线程，那么先通过 IPC 把任务发送给渲染进程的 IO 线程，IO 线程再把任务发送给页面主线程

chromium 内核基本的事件循环系统：

- JavaScript V8 引擎在渲染进程的主线程上工作
- 主线程有循环机制，能在线程运行过程中，能接收并执行新的任务
- 交给主线程执行的任务会先放入任务队列中，等待主线程空闲后依次调用
- 渲染进程会有一个 IO 线程：IO 线程负责和其它进程 IPC 通信，接收其他进程传进来的消息

::: tip 事件循环执行流程

1. 检查 Macrotask 队列是否为空，若不为空，则进行下一步，若为空，则跳到 3
2. 从 Macrotask 队列中取队首(在队列时间最长)的任务进去执行栈中执行(仅仅一个)，执行完后进入下一步
3. 检查 Microtask 队列是否为空，若不为空，则进入下一步，否则，跳到 1（开始新的事件循环）
4. 从 Microtask 队列中取队首(在队列时间最长)的任务进去事件队列执行，执行完后，跳到 3 其中，在执行代码过程中新增的 microtask 任务会在当前事件循环周期内执行，而新增的 macrotask 任务只能等到下一个事件循环才能执行了。
   :::

页面线程所有执行的任务都来自于任务队列。任务队列是“先进先出”的，也就是说放入队列中的任务，需要等待前面的任务被执行完，才会被执行。这就导致两个问题了：

- 如何处理高优先级的任务？
- 如何处理执行时间长的任务？

## 处理高优先级的任务

微任务。

解决方案 V8 引擎已经给出了：在每个任务内部，开辟一个属于该任务的队列(任务队列)，把需要兼顾实时性和效率的任务，先放到这个任务内部的队列中等待执行，等到当前任务快执行完准备退出前，执行该任务内部的队列。咱们把放入到这个特殊队列中的任务称为 **微任务**。

这样既不会影响当前的任务又不会降低多少实时性。

![微任务](/blog/images/javascript/微任务.png)

- 任务队列中的任务都是宏观任务
- 每个宏观任务都有一个自己的微任务队列
- 微任务在当前宏任务中的 JavaScript 快执行完成时，也就在 V8 引擎准备退出全局执行上下文并清空调用栈的时候，V8 引擎会检查全局执行上下文中的微任务队列，然后按照顺序执行队列中的微任务。
- V8 引擎一直循环执行微任务队列中的任务，直到队列为空才算执行结束。也就是说在执行微任务过程中产生的新的微任务并不会推迟到下个宏任务中执行，而是在当前的宏任务中继续执行。

::: tip 注意
宿主（如浏览器）发起的任务称为宏观任务
JavaScript 引擎发起的任务称为微观任务
:::

一个线程中，事件循环是唯一的，但是任务队列可以拥有多个。任务队列又分为 **macro-task（宏任务）** 与 **micro-task（微任务）**，在最新标准中，它们被分别称为 task 与 jobs。在异步模式下，创建 **异步任务** 主要分为 **宏任务** 与 **微任务** 两种。ES6 规范中，宏任务（Macrotask） 称为 Task， 微任务（Microtask） 称为 Jobs。宏任务是由宿主（浏览器、Node）发起的，而微任务由 JS 自身发起。

### 宏任务与微任务

**macro-task 宏任务** 大概包括：

- script(整体代码)
- setTimeout
- setInterval
- setImmediate(Node 环境)
- I/O，事件队列
- UI render

**micro-task 微任务** 大概包括:

- process.nextTick(Node 环境)
- Promise.[ then/catch/finally ]
- Async/Await(实际就是 promise)
- queueMicrotask
- MutationObserver(html5 新特性)
- requestAnimationFrame(有争议，处于渲染阶段，不在微任务队列，也不在宏任务队列)
- Object.observe(已废弃)

[在 JavaScript 中通过 queueMicrotask() 使用微任务](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide)

## 处理执行时间长的任务

回调。

要知道**排版引擎 Blink** 和 **JavaScript 引擎 V8** 都工作在渲染进程的主线程上并且是互斥的。在单线程中，每次只能执行一个任务，而其他任务就都处于等待状态。如果其中一个任务执行时间过久，那么下一个任务就要等待很长时间。这当然是非常糟糕的用户体验。想要避免这种问题，就需要用到回调来解决。

setTimeout/Promise 等我们称之为任务源。而进入任务队列的是他们指定的具体执行任务。来自不同任务源的任务会进入到不同的任务队列。其中 setTimeout 与 setInterval 是同源的。

## 从底层看 setTimeout 实现

到现在已经知道了，**JS 世界是由事件循环和任务队列来驱动的**。

setTimeout 大家都很熟悉，它是一个定时器，用来指定某个函数在多少毫秒后执行。那浏览器是怎么实现 setTimeout 的呢？

要搞清楚浏览器是怎么实现 setTimeout 就先要弄明白下面几个问题：

- setTimeout 任务存到哪了？
- setTimeout 到时间后怎么触发？
- 取消 setTimeout 是如何实现的？

### setTimeout 任务存到哪了

首先要清楚，任务队列不止有一个，Chrome 还维护着一个**延迟任务队列**，这个队列维护了需要延迟执行的任务，所以当你通过 Javascript 调用 setTimeout 时，渲染进程会**将该定时器的回调任务添加到延迟任务队列中**。

回调任务的信息包含：

- 回调函数
- 当前发起时间
- 延迟执行时间

![setTimeout存储](/blog/images/javascript/setTimeout存储.png)

### setTimeout 到时间后怎么触发

当主线程执行完任务队列中的一个任务之后，主线程会对延迟任务队列中的任务，通过**当前发起时间**和**延迟执行时间**计算出**已经到期的任务**，然后依次的执行这些到期的任务，等到期的任务全部执行完后，主线程就进入到下一次循环中。

![setTimeout触发](/blog/images/javascript/setTimeout触发.png)

::: tip setTimeout 是如何实现的：

- setTimeout 存储到延迟任务队列中
- 当主线程执行完任务队列中的一个任务后，计算延迟任务队列中到期到任务，并执行所有到期任务
- 执行完所有到期任务后，让出主线程，进行下一次事件循环
  :::

## 事件循环顺序

**事件循环的顺序，决定了 JavaScript 代码的执行顺序**。它从 script (整体代码) 开始第一次循环。之后**全局上下文**进入**函数调用栈**。直到调用栈清空(只剩全局)，然后执行所有的 micro-task。当所有可执行的 micro-task 执行完毕之后。循环再次从 macro-task 开始，找到其中一个任务队列执行完毕，然后再执行所有的 micro-task，这样一直循环下去。其中每一个任务的执行，无论是 macro-task 还是 micro-task，都是借助函数调用栈来完成。

总的结论就是，执行宏任务，然后执行该宏任务产生的微任务，若微任务在执行过程中产生了新的微任务，则继续执行微任务，微任务执行完毕后，再回到宏任务中进行下一轮循环。

## Node 中的事件循环

虽然 chrome 和 node 都基于 v8 引擎，但引擎只负责管理内存堆栈，API 还是由各 runtime 自行设计并实现的

```js
setTimeout(() => {
  console.log(2);
}, 2);

setTimeout(() => {
  console.log(1);
}, 1);

setTimeout(() => {
  console.log(0);
}, 0);
```

- 直接从代码中的延时设置来看，有些人会回答：0，1，2
- 根据 MDN 的 setTimeout 文档中提到 HTML 规范，最低延时为 4ms （最低延时的设置是为了给CPU留下休息时间），有些人会回答：2，2，0
- 而真正的答案是：1、0、2。并且，无论是chrome还是node下的运行结果都是一致的（注：node下的输出顺序依然是无法保证的）。

0ms 和 1ms 的延时效果是一致的，那背后的原因是为什么呢？

```js
// https://chromium.googlesource.com/chromium/blink/+/master/Source/core/frame/DOMTimer.cpp#93

double intervalMilliseconds = std::max(oneMillisecond, interval * oneMillisecond); 

```
传入 0 和传入 1 结果都是 oneMillisecond，即 1ms。这样解释了为何 1ms 和 0ms 行为是一致的，那 4ms 到底是怎么回事？我再次确认了HTML规范，发现虽然有 4ms 的限制，但是是存在条件的，详见规范第 11 点：

> If nesting level is greater than 5, and timeout is less than 4, then set timeout to 4. 如果嵌套级别大于 5,timeout 小于 4，则将 timeout 设置为 4。

一开始 HTML5 规范确实有定最低 4ms 的规范，不过在后续修订中进行了修改，甚至不排除规范在向实现看齐，即逆向影响。

那 node 中，为什么 0ms 和 1ms 的延时效果一致呢？是因为直接设置了最低 1ms 的行为是为了向浏览器行为看齐。

- Node 的 Event Loop 分阶段，阶段有先后，依次是:

  - expired timers and intervals，即到期的 setTimeout/setInterval
  - I/O events，包含文件，网络等等
  - immediates，通过 setImmediate 注册的函数
  - close handlers，close 事件的回调，比如 TCP 连接断开

* 同步任务及每个阶段之后都会清空 microtask 队列
  - 优先清空 next tick queue，即通过 process.nextTick 注册的函数
  - 再清空 other queue，常见的如 Promise

而和规范的区别，在于 node 会清空当前所处阶段的队列，即执行所有 task

## 总结

- JS 所谓的“单线程”只是指主线程只有一个，并不是整个运行环境都是单线程
- JS 的异步靠底层的多线程实现
- 不同的异步 API 对应不同的实现线程
- 异步线程与主线程通讯靠的是 Event Loop
- 异步线程完成任务后将其放入任务队列
- 主线程不断轮询任务队列，拿出任务执行
- 任务队列有宏任务队列和微任务队列的区别
- 微任务队列的优先级更高，所有微任务处理完后才会处理宏任务
- Promise 是微任务
- Node.js 的 Event Loop 跟浏览器的 Event Loop 不一样，他是分阶段的
- setImmediate 和 setTimeout(fn, 0) 哪个回调先执行，需要看他们本身在哪个阶段注册的，如果在定时器回调或者 I/O 回调里面，setImmediate 肯定先执行。如果在最外层或者 setImmediate 回调里面，哪个先执行取决于当时机器状况。
- process.nextTick 不在 Event Loop 的任何阶段，他是一个特殊 API，他会立即执行，然后才会继续执行 Event Loop

::: warning 参考文献
[setTimeout 和 setImmediate 到底谁先执行，本文让你彻底理解 Event Loop](https://juejin.cn/post/6844904100195205133)

[深入理解 JS 的事件循环](https://mp.weixin.qq.com/s/4BLQQK8cTec_fQrklf2Qbg)

[事件循环机制的那些事](https://mp.weixin.qq.com/s/PBX_YHw0-f3bbSDH5ZbbJQ)

[JavaScript 事件循环详解(翻译)](https://mp.weixin.qq.com/s/DQdVxdHq36lGNhB3JEh_kw)

[深入解析 Node.js 事件循环工作机制](https://mp.weixin.qq.com/s/qWzxfbrD2LnaI_90Gqm9pw)

[说说事件循环机制(满分答案来了)](https://mp.weixin.qq.com/s/QgfE5Km1xiEkQqADMLmj-Q)

[图解 Event Loop](https://juejin.cn/post/6844904004745592846)

[彻底弄懂 JavaScript 执行机制](https://juejin.cn/post/6844903512845860872)

[说一下事件循环机制(node、浏览器) ](https://github.com/lgwebdream/FE-Interview/issues/26)
:::
