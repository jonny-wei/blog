# Web Worker

## 概览

### 简介

Web Worker 作为浏览器多线程技术，在当下，成为缓解页面卡顿,，提升应用性能的可选方案。Web Worker 实现了多线程运行 JS 能力，使 JS 可以并行执行，进而提升执行效率，加之运行任务拆分，减少页面卡顿。

由于 JavaScript 语言采用的是单线程，同一时刻只能做一件事，如果有多个同步计算任务执行，则在这段同步计算逻辑执行完之前，它下方的代码不会执行，从而造成了阻塞，用户的交互也可能无响应。但如果把这段同步计算逻辑放到 Web Worker 执行，在这段逻辑计算运行期间依然可以执行它下方的代码，用户的操作也可以响应了。**Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行**。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程就会很流畅，不会被阻塞或拖慢。

#### 多线程与主线程

Web Worker 会创建操作系统级别的线程。JS 多线程, 是有独立于主线程的 JS 运行环境。

![webworker1](/blog/images/architecture/webworker1.png)

如图所示:，Worker 线程有独立的内存空间, `Message Queue`, `Event Loop`, `Call Stack` 等, 线程间通过 `postMessage` 通信。

**Web Worker 多线程并发与异步编程中的并发之间的区别**：

Web Worker 多个线程可以并发运行 JS。这里不同于 JS 异步编程中的并发（Promise.all），JS 单线程中的"并发", 准确来说是 Concurrent。运行时只有一个函数调用栈, 通过 Event Loop 实现不同 Task 的上下文切换(Context Switch)。这些 Task 通过 BOM API 调起其他线程为主线程工作，但回调函数代码逻辑依然由 JS 串行运行。

Web Worker 是 JS 多线程运行技术, 准确来说是 Parallel。其与 Concurrent 的区别在于 Parallel 有多个函数调用栈， 每个函数调用栈可以独立运行 Task，互不干扰。

### 分类

Web Worker 规范中包括（不包括 `Service Worker`）:

- `DedicatedWorker`（专用线程）：简称 Worker, 其线程只能与一个页面渲染进程(Render Process)进行绑定和通信, 不能多 Tab 共享。`DedicatedWorker` 是最早实现并最广泛支持的 Web Worker 能力。

- SharedWorker（共享线程）：可以在多个浏览器 Tab 中访问到同一个 Worker 实例，实现多 Tab 共享数据，共享 `webSocket` 连接等。看起来很美好， 但 safari 放弃了 `SharedWorker` 支持，因为 `webkit` 引擎的技术原因。

本文后面讨论中的 Worker 都是特指 `DedicatedWorker`。

### 使用限制

Worker 运行环境与主线程的共同点主要包括:

- 包含完整的 JS 运行时, 支持 ECMAScript 规范定义的语言语法和内置对象.
- 支持 [XmlHttpRequest](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FXMLHttpRequest), 能独立发送网络请求与后台交互.
- 包含[只读的 Location](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWorkerLocation), 指向 Worker 线程执行的 script url, 可通过 url 传递参数给 Worker 环境.
- 包含[只读的 Navigator](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWorkerNavigator), 用于获取浏览器信息, 如通过 `Navigator.userAgent` 识别浏览器.
- 支持 setTimeout / setInterval 计时器, 可用于实现异步逻辑.
- 支持 WebSocket 进行网络 I/O; 支持 IndexedDB 进行文件 I/O.

从共同点上看, Worker 线程其实很强大, 除了利用独立线程执行重度逻辑外, 其网络 I/O 和文件 I/O 能力给业务和技术方案带来很大的想象空间

另一方面, Worker 线程运行环境和主线程的差异点有:

- Worker 线程没有 DOM API, 无法新建和操作 DOM; 也无法访问到主线程的 DOM Element.
- Worker 线程和主线程间内存独立, Worker 线程无法访问页面上的全局变量(window, document 等)和 JS 函数.
- Worker 线程不能调用 alert() 或 confirm() 等 UI 相关的 BOM API.
- Worker 线程被主线程控制, 主线程可以新建和销毁 Worker.
- Worker 线程可以通过 `self.close` 自行销毁.

从差异点上看, Worker 线程无法染指 UI, 并受主线程控制, 适合默默干活.

#### 同源限制

分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源。

#### 文件限制

Worker 线程无法读取本地文件（`file://`），会拒绝使用 file 协议来创建 Worker实例，它所加载的脚本，必须来自网络。

#### DOM 操作限制

Worker 线程所在的全局对象，与主线程不一样，区别是：

- 无法读取主线程所在网页的 DOM 对象
- 无法使用`document`、`window`、`parent`这些对象

#### 通信限制

Worker 线程和主线程不在同一个上下文环境，它们**不能直接通信**，必须通过消息完成，交互方法是`postMessage`和`onMessage`，并且在数据传递的时候， Worker 是使用**拷贝**的方式。

#### 脚本限制

Worker 线程不能执行`alert()`方法和`confirm()`方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求，也可以使用`setTimeout/setInterval`等API

## 使用方式

### 基本 API

```js
const worker = new Worker(aURL, options);
```

- `worker.postMessage`: 向 worker 的内部作用域发送一个消息，消息可由任何 JavaScript 对象组成
- `worker.terminate`: 立即终止 worker。该方法并不会等待 worker 去完成它剩余的操作；worker 将会被立刻停止
- `worker.onmessage`:当 worker 的父级接收到来自其 worker 的消息时，会在 Worker 对象上触发 message 事件
- `worker.onerror`: 当 worker 出现运行中错误时，它的 onerror 事件处理函数会被调用。它会收到一个扩展了 ErrorEvent 接口的名为 error 的事件

```js
worker.addEventListener('error', function (e) {
    console.log(e.message) // 可读性良好的错误消息
    console.log(e.filename) // 发生错误的脚本文件名
    console.log(e.lineno) // 发生错误时所在脚本文件的行号
})
```

主要流程为:

1. 主线程调用 `new Worker(url)` 创建 Worker 实例, `url` 为 Worker JS 资源 url。
2. 主线程调用 `postMessage` 发送消息, 在 `onmesssage` 中监听 Worker 线程消息。
3. Worker 线程在 `onmessage` 中监听主线程消息, 收到主线程的消息; 通过 `postMessage` 回复。
4. 主线程在消息回调中收到 Worker 的信息。

postMessage 会在接收线程创建一个MessageEvent, 传递的数据添加到 `event.data`, 再触发该事件; MessageEvent 的回调函数进入 Message Queue, 成为**待执行的宏任务**. 因此 postMessage **顺序发送**的信息, 在接收线程中会**顺序执行回调函数**. 而且我们无需担心实例化 Worker 过程中 postMessage 的信息丢失问题, 对此 Worker 内部机制已经处理.

Worker 事件驱动(postMessage/onmessage) 的通信 API 虽然简洁, 但大多数场景下通信需要等待响应(类似 HTTP 请求的 Request 和 Response), 并且多次同类型通信要匹配到各自的响应. 所以业务使用一般会封装原生 API, 如封装为 Promise 调用。

### 直接指定脚本文件

```js
const myWorker = new Worker(aURL, options);
```

`aURL`表示 worker 将执行的脚本的 URL（脚本文件）， 即 Web Worker 所要执行的任务。案例如下：

```js
// 主线程下创建worker线程
const worker = new Worker('./worker.js')

// 监听接收worker线程发的消息
worker.onmessage = function (e) {
  console.log('主线程收到worker线程消息：', e.data)
}

// 向worker线程发送消息
worker.postMessage('主线程发送hello world')

// worker.js
// self 代表子线程自身，即子线程的全局对象
self.addEventListener("message", function (e) {
  // e.data表示主线程发送过来的数据
  self.postMessage("worker线程收到的：" + e.data); // 向主线程发送消息
});
```

Web Worker 的执行上下文名称是 self，无法调用主线程的 window 对象的。上述写法等同于以下写法：

```jsx
this.addEventListener("message", function (e) {
  // e.data表示主线程发送过来的数据
  this.postMessage("worker线程收到的：" + e.data); // 向主线程发送消息
});

// 将JS文件引入html挂在本地开发环境运行，运行结果如下：
// 主线程收到 worker 线程消息： worker 线程收到的：主线程发送 hello world 
```

### 使用 Blob URL 创建

除了这种通过引入js文件的方式，也可以通过`URL.createObjectURL()`创建URL对象，创建内嵌的worker

```js
/**
 * const blob = new Blob(array, options);
 * Blob() 构造函数返回一个新的 Blob 对象。blob 的内容由参数数组中给出的值的串联组成。
 * @params array 是一个由ArrayBuffer, ArrayBufferView, Blob, DOMString 等对象构成的 Array
 * @options type，默认值为 ""，它代表了将会被放入到 blob 中的数组内容的 MIME 类型。还有两个这里忽略不列举了
 */
 
/**
 * URL.createObjectURL()：静态方法会创建一个 DOMString，其中包含一个表示参数中给出的对象的 URL。这个 URL 的生命周期和创建它的窗口中的 document 绑定。这个新的 URL 对象表示指定的 File 对象或 Blob 对象
 */
const worker = new Worker(URL.createObjectURL(blob));

function func() {
  console.log('hello')
}

function createWorker(fn) {
  // const blob = new Blob([fn.toString() + ' fn()'], { type: 'text/javascript' })
  const blob = new Blob([`(${fn.toString()})()`], { type: 'text/javascript' })
  return URL.createObjectURL(blob)
}

createWorker(func)
```

### Worker 线程中引入其他脚本

Worker线程内部要加载其他脚本，可以使用 `importScripts()`

```js
// worker.js
importScripts("constants.js");

// self 代表子线程自身，即子线程的全局对象
self.addEventListener("message", function (e) {
  self.postMessage(foo); // 可拿到 `foo`、`getAge()`、`getName`的结果值 
});


// constants.js
const foo = "变量";

function getAge() {
  return 25;
}

const getName = () => {
  return "jacky";
};
复制代码
```

还可以同时加载多个脚本

```js
importScripts('script1.js', 'script2.js');
```

Worker 多线程虽然实现了 JS 任务的并行运行, 也带来额外的**通信开销**。在线程计算能力固定的情况下, 要通过多线程提升更多性能, 需要尽量**减少通信消耗**。而且主线程 postMessage 会占用主线程同步执行, **占用时间与数据传输方式和数据规模相关**. 要避免多线程通信导致的主线程卡顿, 需选择合适的传输方式, 并控制每个渲染周期内的数据传输规模。

![webworker2](/blog/images/architecture/webworker2.png)

### 数据传输方式

我们先来聊聊主线程和 Worker 线程的数据传输方式。根据计算机进程模型, 主线程和 Worker 线程属于同一进程, 可以访问和操作进程的内存空间. 但为了降低多线程并发的逻辑复杂度, 部分传输方式直接隔离了线程间的内存, 相当于默认加了锁。通信方式有 3 种:

- Structured Clone,
- Transfer Memory
- Shared Array Buffer.

#### Structured Clone

[Structured Clone](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWeb_Workers_API%2FStructured_clone_algorithm) 是 postMessage 默认的通信方式。复制一份线程A 的 JS Object 内存给到线程B, 线程B 能获取和操作新复制的内存。

![webworker3](/blog/images/architecture/webworker3.png)

Structured Clone 通过复制内存的方式简单有效地隔离不同线程内存, 避免冲突; 且传输的 Object 数据结构很灵活. 但复制过程中, 线程A 要**同步执行** Object Serialization, 线程B 要**同步执行** Object Deserialization; 如果 Object 规模过大, 会占用大量的线程时间.

#### Transfer Memory

[Transfer Memory](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FTransferable) 意为转移内存, 它不需要 Serialization/Deserialization, 能大大减少传输过程占用的线程时间. 如下图所示 , 线程A 将指定内存的所有权和操作权转给线程B, 但转让后线程A 无法再访问这块内存.

![webworker4](/blog/images/architecture/webworker4.png)

Transfer Memory **以失去控制权来换取高效传输**, 通过内存独占给多线程并发加锁. 但只能转让 [ArrayBuffer](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FJavaScript%2FReference%2FGlobal_Objects%2FArrayBuffer) 等大小规整的二进制(Raw Binary)数据; 对矩阵数据(如 RGB 图片)比较适用. 实践上也要考虑从 JS Object 生成二进制数据的运算成本.

#### Shared Array Buffers

[Shared Array Buffer](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FJavaScript%2FReference%2FGlobal_Objects%2FSharedArrayBuffer) 是共享内存, 线程A 和线程B 可以**同时访问和操作**同一块内存空间. 数据都共享了, 也就没有传输什么事了。

![webworker5](/blog/images/architecture/webworker5.png)

但多个并行的线程共享内存, 会产生竞争问题(Race Conditions). 不像前 2 种传输方式默认加锁, Shared Array Buffers 把难题抛给开发者, 开发者可以用 [Atomics](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FJavaScript%2FReference%2FGlobal_Objects%2FAtomics) 来维护这块共享的内存. 作为较新的传输方式, 浏览器兼容性可想而知。

### 传输方式小结

- 全浏览器兼容的 Structured Clone 是较好的选择, 但要考虑数据传输规模, 下文我们会详细展开.
- Transfer Memory 的兼容性也不错(IE11+), 但数据独占和数据类型的限制, 使得它是特定场景的最优解, 不是通用解;
- Shared Array Buffers 当下糟糕的兼容性和线程锁的开发成本, 建议先暗中观察

使用 `Structured Clone` 传输数据时, 有个阴影一直笼罩着我们: postMessage 前要不要对数据 JSON.stringify 一把, **听说那样更快?**

相同的数据规模, 直接 postMessage 的传输时间普遍比 `JSON.stringify` 更少。当下, **不需要再使用 `JSON.stringify`**. 其一是 Structured Clone 内置的 `serialize/deserialize` 比 `JSON.stringify` 性能更高; 其二是 `JSON.stringify` 只适合序列化基本数据类型, 而 Structured Clone 还支持复制其他内置数据类型(如 Map, Blob, RegExp 等, 虽然大部分应用场景只用到基本数据类型)

`Structured Clone` 的 `serialize/deserialize` 执行耗时**主要受数据对象复杂度影响**, 这很好理解, 因为 `serialize/deserialize` 至少要以某种方式遍历对象. 数据对象的复杂度本身难以度量, 可以用序列化后的数据规模(size)作为参考。

总之, 数据传输规模并没有最佳实践. 而是充分理解 Worker postMessage 的传输成本, 在实际应用中, 根据业务场景去评估和控制数据规模。

## 应用场景

### 减少卡顿

根据 Chrome 团队提出的用户感知性能模型 RAIL, 同步 JS 执行时间不能过长。量化来说, 播放动画时建议小于 16ms, 用户操作响应建议小于 100ms, 页面打开到开始呈现内容建议小于 1000ms。

### 性能提升

##### 逻辑异步化

减少主线程卡顿的主要方法为异步化执行, 比如播放动画时, 将同步任务拆分为多个小于 16ms 的子任务, 然后在页面每一帧前通过 requestAnimationFrame 按计划执行一个子任务, 直到全部子任务执行完毕。

拆分同步逻辑的异步方案对大部分场景有效果, 但并不是一劳永逸的银弹. 有以下几个问题:

不是所有 JS 逻辑都可拆分. 比如数组排序, 树的递归查找, 图像处理算法等, 执行中需要维护当前状态, 且调用上非线性, 无法轻易地拆分为子任务。

可以拆分的逻辑难以把控粒度. 拆分的子任务在高性能机器(iphoneX)上可以控制在 16ms 内, 但在性能落后机器(iphone6)上就超过了 deadline. 16ms 的用户感知时间, 并不会因为用户手上机器的差别而变化, Google 给出的建议是再拆小到 3-4ms。

拆分的子任务并不稳定. 对同步 JS 逻辑的拆分, 需要根据业务场景寻找原子逻辑, 而原子逻辑会跟随业务变化, 每次改动业务都需要去 review 原子逻辑。

##### Worker 一步到位

Worker 的多线程能力, 使得同步 JS 任务的拆分一步到位: 从宏观上将整个同步 JS 任务异步化. 不需要再去苦苦寻找原子逻辑, 逻辑异步化的设计上也更加简单和可维护。

这给我们带来更多的想象空间. 在浏览器主线程渲染周期内, 将可能阻塞页面渲染的 JS 运行任务(Jank Job)迁移到 Worker 线程中, 进而减少主线程的负担, 缩短渲染间隔, 减少页面卡顿。

##### 性能提升

Worker 多线程并不会直接带来计算性能的提升, 能否提升与设备 CPU 核数和线程策略有关

### 把主线程还给 UI

Worker 的应用场景, 本质上是从主线程中剥离逻辑, 让主线程专注于 UI 渲染. 这种架构设计并非 Web 技术上的独创。

Android 和 iOS 的原生开发中, [主线程负责 UI 工作](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.android.com%2Ftopic%2Fperformance%2Fthreads); 前端领域热门的小程序, 实现原理上就是[渲染和逻辑的完全分离](https://link.juejin.cn?target=https%3A%2F%2Fwechat-miniprogram.github.io%2Fkbone%2Fdocs%2Fguide%2Fprinciple.html)。

[Service Worker 实践指南](https://mp.weixin.qq.com/s/JdG-FP04s0gUnN8dWcxFgg)

[Web Worker 现状](https://mp.weixin.qq.com/s/WP2RT6VBPtD5bpq3WaEpeQ)

[Web Worker 文献综述](https://juejin.cn/post/6854573213297410062#heading-16)

[一文搞懂 Web Worker(原理到实践)](https://mp.weixin.qq.com/s/SCFk6FgtKQ8N-VrV6OmioA)

[梳理 Web Worker 及实战场景](https://juejin.cn/post/7176788060619669565#heading-16)

[浅探 Web Worker 与 JavaScript 沙箱](https://juejin.cn/post/6948752328715403300#heading-2)

[一文彻底了解Web Worker，十万、百万条数据](https://mp.weixin.qq.com/s/Bm-TI9K8Za8Ret22WucOFA)

[将 useReducer 应用于 Web Worker](https://mp.weixin.qq.com/s/eX2dFf999GleZiarpKbdoA)

[换一种风格理解 Chrome 浏览器渲染全过程](https://mp.weixin.qq.com/s/ZK5tk1I4fZZ4SEETNtMsVA)
