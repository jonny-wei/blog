# Scheduler 调度器

- 异步调度原理？
- React 为什么不用 setTimeout ？
- 说一说React 的时间分片？
- React 如何模拟 requestIdleCallback？
- 简述一下调度流程？

## 异步调度

### 为什么采用异步调度

v15 版本的 React 同样面临着如上的问题，由于对于大型的 React 应用，会存在一次更新，递归遍历大量的虚拟 DOM ，造成占用 js 线程，使得浏览器没有时间去做一些动画效果，伴随项目越来越大，项目会越来越卡。

如何解决以上的问题呢，首先对比一下 vue 框架，vue 有这 template 模版收集依赖的过程，轻松构建响应式，使得在一次更新中，vue 能够迅速响应，找到需要更新的范围，然后以组件粒度更新组件，渲染视图。但是在 React 中，一次更新 React 无法知道此次更新的波及范围，所以 React 选择从根节点开始 diff ，查找不同，更新这些不同。

React 似乎无法打破从 root 开始‘找不同’的命运，但是还是要解决浏览器卡顿问题，那怎么办，解铃还须系铃人，既然更新过程阻塞了浏览器的绘制，那么把 React 的更新，交给浏览器自己控制不就可以了吗，如果浏览器有绘制任务那么执行绘制任务，在空闲时间执行更新任务，就能解决卡顿问题了。与 vue 更快的响应，更精确的更新范围，React 选择更好的用户体验。

### 时间分片

React 如何让浏览器控制 React 更新呢，首先浏览器每次执行一次事件循环（一帧）都会做如下事情：处理事件，执行 js ，调用 requestAnimationFrame ，布局 Layout ，绘制 Paint ，在一帧执行后，如果没有其他事件，那么浏览器会进入休息时间，那么有的一些不是特别紧急 React 更新，就可以执行了。

那么首先就是**如何知道浏览器有空闲时间？**

requestIdleCallback 是谷歌浏览器提供的一个 API， 在浏览器有空余的时间，浏览器就会调用 requestIdleCallback 的回调。首先看一下 requestIdleCallback的基本用法：

```js
requestIdleCallback(callback,{ timeout })
```

- callback 回调，浏览器空余时间执行回调函数。
- timeout 超时时间。如果浏览器长时间没有空闲，那么回调就不会执行，为了解决这个问题，可以通过 requestIdleCallback 的第二个参数指定一个超时时间。

React 为了防止 requestIdleCallback 中的任务由于浏览器没有空闲时间而卡死，所以设置了 5 个优先级。

- `Immediate` -1 需要立刻执行。
- `UserBlocking` 250ms 超时时间250ms，一般指的是用户交互。
- `Normal` 5000ms 超时时间5s，不需要直观立即变化的任务，比如网络请求。
- `Low` 10000ms 超时时间10s，肯定要执行的任务，但是可以放在最后处理。
- `Idle` 一些没有必要的任务，可能不会执行。

React 的异步更新任务就是通过类似 requestIdleCallback 去向浏览器做一帧一帧请求，等到浏览器有空余时间，去执行 React 的异步更新任务，这样保证页面的流畅。

::: tip 注意
Scheduler 是独立于 React 的包，所以他的优先级也是独立于 React 的优先级。`Scheduler`对外暴露了一个方法　`unstable_runWithPriority` 。这个方法接受一个`优先级`与一个`回调函数`，在`回调函数`内部调用获取`优先级`的方法都会取得第一个参数对应的`优先级`。

在`React`内部凡是涉及到`优先级`调度的地方，都会使用`unstable_runWithPriority`。比如，我们知道`commit`阶段是同步执行的。可以看到，`commit`阶段的起点`commitRoot`方法的优先级为`ImmediateSchedulerPriority`。`ImmediateSchedulerPriority`即`ImmediatePriority`的别名，为最高优先级，会立即执行。
:::

### 模拟 requestIdleCallback

但是 requestIdleCallback 目前只有谷歌浏览器支持 ，为了兼容每个浏览器，React需要自己实现一个 requestIdleCallback ，那么就要具备两个条件：

- 实现的这个 requestIdleCallback ，可以主动让出主线程，让浏览器去渲染视图。
- 一次事件循环只执行一次，因为执行一个以后，还会请求下一次的时间片。

能够满足上述条件的，就只有 **宏任务**，宏任务是在下次事件循环中执行，不会阻塞浏览器更新。而且浏览器一次只会执行一个宏任务。首先看一下两种满足情况的宏任务。

#### setTimeout(fn, 0)

`setTimeout(fn, 0)` 可以满足创建宏任务，让出主线程，为什么 React 没选择用它实现 Scheduler 呢？原因是递归执行 setTimeout(fn, 0) 时，最后间隔时间会变成 4 毫秒左右，而不是最初的 1 毫秒。所以 React 优先选择的并不是 setTimeout 实现方案。

接下来模拟一下 setTimeout 4毫秒延时的真实场景：

```js
let time = 0 
let nowTime = +new Date()
let timer
const poll = function(){
    timer = setTimeout(()=>{
        const lastTime = nowTime
        nowTime = +new Date()
        console.log( '递归setTimeout(fn,0)产生时间差：' , nowTime -lastTime )
        poll()
    },0)
    time++
    if(time === 20) clearTimeout(timer)
}
poll()
```

#### MessageChannel

为了让视图流畅地运行，可以按照人类能感知到最低限度每秒 60 帧的频率划分时间片，这样每个时间片就是 16ms 。也就是这 16 毫秒要完成如上 js 执行，浏览器绘制等操作，而上述 setTimeout 带来的浪费就足足有 4ms，react 团队应该是注意到这 4ms 有点过于铺张浪费，所以才采用了一个新的方式去实现，那就是 `MessageChannel` 。

MessageChannel 接口允许开发者创建一个新的消息通道，并通过它的两个 MessagePort 属性发送数据。

- MessageChannel.port1 只读返回 channel 的 port1 。
- MessageChannel.port2 只读返回 channel 的 port2 。 下面来模拟一下 MessageChannel 如何触发异步宏任务的。

```js
  let scheduledHostCallback = null 
  /* 建立一个消息通道 */
  var channel = new MessageChannel();
  /* 建立一个port发送消息 */
  var port = channel.port2;

  channel.port1.onmessage = function(){
      /* 执行任务 */
      scheduledHostCallback() 
      /* 执行完毕，清空任务 */
      scheduledHostCallback = null
  };
  /* 向浏览器请求执行更新任务 */
  requestHostCallback = function (callback) {
    scheduledHostCallback = callback;
    if (!isMessageLoopRunning) {
      isMessageLoopRunning = true;
      port.postMessage(null);
    }
  };
```

- 在一次更新中，React 会调用 requestHostCallback ，把更新任务赋值给 scheduledHostCallback ，然后 port2 向 port1 发起 postMessage 消息通知。
- port1 会通过 onmessage ，接受来自 port2 消息，然后执行更新任务 scheduledHostCallback ，然后置空 scheduledHostCallback ，借此达到异步执行目的。

## 异步调度原理

React 发生一次更新，会统一走 ensureRootIsScheduled（调度应用）。

- 对于正常更新会走 performSyncWorkOnRoot 逻辑，最后会走 `workLoopSync` 。
- 对于低优先级的异步更新会走 performConcurrentWorkOnRoot 逻辑，最后会走 `workLoopConcurrent` 。

```js
function workLoopSync() {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

在一次更新调度过程中，workLoop 会更新执行每一个待更新的 fiber 。他们的区别就是异步模式会调用一个 shouldYield() ，如果当前浏览器没有空余时间， shouldYield 会中止循环，直到浏览器有空闲时间后再继续遍历，从而达到终止渲染的目的。这样就解决了一次性遍历大量的 fiber ，导致浏览器没有时间执行一些渲染任务，导致了页面卡顿。

### scheduleCallback

无论是上述正常更新任务 `workLoopSync` 还是低优先级的任务 `workLoopConcurrent` ，都是由调度器 `scheduleCallback` 统一调度的，那么两者在进入调度器时候有什么区别呢？

对于正常更新任务，最后会变成类似如下结构：

```js
scheduleCallback(Immediate,workLoopSync)
```

对于异步任务：

```js
/* 计算超时等级，就是如上那五个等级 */
var priorityLevel = inferPriorityFromExpirationTime(currentTime, expirationTime);
scheduleCallback(priorityLevel,workLoopConcurrent)
```

低优先级异步任务的处理，比同步多了一个超时等级的概念。会计算上述那五种超时等级。

**scheduleCallback 到底做了些什么呢？**

```js
function scheduleCallback(){
   /* 计算过期时间：超时时间  = 开始时间（现在时间） + 任务超时的时间（上述设置那五个等级）     */
   const expirationTime = startTime + timeout;
   /* 创建一个新任务 */
   const newTask = { ... }
  if (startTime > currentTime) {
      /* 通过开始时间排序 */
      newTask.sortIndex = startTime;
      /* 把任务放在timerQueue中 */
      push(timerQueue, newTask);
      /*  执行setTimeout ， */
      requestHostTimeout(handleTimeout, startTime - currentTime);
  }else{
    /* 通过 expirationTime 排序  */
    newTask.sortIndex = expirationTime;  
    /* 把任务放入taskQueue */
    push(taskQueue, newTask);
    /*没有处于调度中的任务， 然后向浏览器请求一帧，浏览器空闲执行 flushWork */
     if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
         requestHostCallback(flushWork)
     }
    
  }
  
} 
```

对于调度本身，有几个概念必须掌握。

- `taskQueue`，里面存的都是过期的任务，依据任务的过期时间( `expirationTime` ) 排序，需要在调度的 `workLoop` 中循环执行完这些任务。
- `timerQueue` 里面存的都是没有过期的任务，依据任务的开始时间( `startTime` )排序，在调度 workLoop 中 会用`advanceTimers`检查任务是否过期，如果过期了，放入 `taskQueue` 队列。

scheduleCallback 流程如下。

- 创建一个新的任务 newTask。
- 通过任务的开始时间( startTime ) 和 当前时间( currentTime ) 比较:当 startTime > currentTime, 说明未过期, 存到 timerQueue，当 startTime <= currentTime, 说明已过期, 存到 taskQueue。
- 如果任务过期，并且没有调度中的任务，那么调度 requestHostCallback。本质上调度的是 flushWork。
- 如果任务没有过期，用 requestHostTimeout 延时执行 handleTimeout。

### requestHostTimeout

上述当一个任务，没有超时，那么 React 把它放入 timerQueue中了，但是它什么时候执行呢 ？这个时候 Schedule 用 requestHostTimeout 让一个未过期的任务能够到达恰好过期的状态， 那么需要延迟 startTime - currentTime 毫秒就可以了。requestHostTimeout 就是通过 setTimeout 来进行延时指定时间的。

```js
requestHostTimeout = function (cb, ms) {
_timeoutID = setTimeout(cb, ms);
};

cancelHostTimeout = function () {
clearTimeout(_timeoutID);
};
```

- requestHostTimeout 延时执行 handleTimeout，cancelHostTimeout 用于清除当前的延时器。

### handleTimeout

延时指定时间后，调用的 handleTimeout 函数， handleTimeout 会把任务重新放在 requestHostCallback 调度。

```js
function handleTimeout(){
  isHostTimeoutScheduled = false;
  /* 将 timeQueue 中过期的任务，放在 taskQueue 中 。 */
  advanceTimers(currentTime);
  /* 如果没有处于调度中 */
  if(!isHostCallbackScheduled){
      /* 判断有没有过期的任务， */
      if (peek(taskQueue) !== null) {   
      isHostCallbackScheduled = true;
      /* 开启调度任务 */
      requestHostCallback(flushWork);
    }
  }
}
```

- 通过 advanceTimers 将 timeQueue 中过期的任务转移到 taskQueue 中。
- 然后调用 requestHostCallback 调度过期的任务。

### advanceTimers

```js
function advanceTimers(){
   var timer = peek(timerQueue);
   while (timer !== null) {
      if(timer.callback === null){
        pop(timerQueue);
      }else if(timer.startTime <= currentTime){ /* 如果任务已经过期，那么将 timerQueue 中的过期任务，放入taskQueue */
         pop(timerQueue);
         timer.sortIndex = timer.expirationTime;
         push(taskQueue, timer);
      }
   }
}
```

- 如果任务已经过期，那么将 timerQueue 中的过期任务，放入 taskQueue。

### flushWork和workloop

综上所述要明白两件事：

- 第一件是 React 的更新任务最后都是放在 taskQueue 中的。
- 第二件是 requestHostCallback ，放入 MessageChannel 中的回调函数是flushWork。

**flushWork**

```js
function flushWork(){
  if (isHostTimeoutScheduled) { /* 如果有延时任务，那么先暂定延时任务*/
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }
  try{
     /* 执行 workLoop 里面会真正调度我们的事件  */
     workLoop(hasTimeRemaining, initialTime)
  }
}
```

- flushWork 如果有延时任务执行的话，那么会先暂停延时任务，然后调用 workLoop ，去真正执行超时的更新任务。

**workLoop**

这个 workLoop 是调度中的 workLoop，不要把它和调和中的 workLoop 弄混淆了。

```js
function workLoop(){
  var currentTime = initialTime;
  advanceTimers(currentTime);
  /* 获取任务列表中的第一个 */
  currentTask = peek();
  while (currentTask !== null){
      /* 真正的更新函数 callback */
      var callback = currentTask.callback;
      if(callback !== null ){
         /* 执行更新 */
         callback()
        /* 先看一下 timeQueue 中有没有 过期任务。 */
        advanceTimers(currentTime);
      }
      /* 再一次获取任务，循环执行 */ 
      currentTask = peek(taskQueue);
  }
}
```

- workLoop 会依次更新过期任务队列中的任务。**到此为止，完成整个调度过程。**

### shouldYield 中止 workloop

在 fiber 的异步更新任务 workLoopConcurrent 中，每一个 fiber 的 workloop 都会调用 shouldYield 判断是否有超时更新的任务，如果有，那么停止 workLoop。

```js
function unstable_shouldYield() {
  var currentTime = exports.unstable_now();
  advanceTimers(currentTime);
  /* 获取第一个任务 */
  var firstTask = peek(taskQueue);
  return firstTask !== currentTask && currentTask !== null && firstTask !== null && firstTask.callback !== null && firstTask.startTime <= currentTime && firstTask.expirationTime < currentTask.expirationTime || shouldYieldToHost();
}
```

- 如果存在第一个任务，并且已经超时了，那么 shouldYield 会返回 true，那么会中止 fiber 的 workloop。

## 调度整体流程

![scheduler1](/blog/images/react/scheduler1.png)

`优先级`意味着任务的过期时间。设想一个大型`React`项目，在某一刻，存在很多不同`优先级`的`任务`，对应不同的过期时间。

同时，又因为任务可以被延迟，所以我们可以将这些任务按是否被延迟分为：

- 已就绪任务
- 未就绪任务

`Scheduler`存在两个队列：

- timerQueue：保存未就绪任务
- taskQueue：保存已就绪任务

每当有新的未就绪的任务被注册，我们将其插入`timerQueue`并根据开始时间重新排列`timerQueue`中任务的顺序。

当`timerQueue`中有任务就绪，即`startTime <= currentTime`，我们将其取出并加入`taskQueue`。

取出`taskQueue`中最早过期的任务并执行他。

为了能在O(1)复杂度找到两个队列中时间最早的那个任务，`Scheduler`使用小顶堆实现了`优先级队列`。

## 异步调度流程

![scheduler2](/blog/images/react/scheduler2.png)
