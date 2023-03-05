# 异步更新队列

Vue 在更新 DOM 时是异步执行的。只要侦听到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作是非常重要的。然后，在下一个的事件循环 `“tick”` 中，Vue 刷新队列并执行实际 (已去重的) 工作。Vue 在内部对异步队列尝试使用原生的 `Promise.then`、`MutationObserver` 和 `setImmediate`，如果执行环境不支持，则会采用 `setTimeout(fn, 0)` 代替。

Vue 在更新 DOM 时是异步执行的。响应式数据变化，组件不会立即重新渲染。当刷新队列时，组件会在下一个事件循环 `“tick”` 中更新。多数情况我们不需要关心这个过程，但是如果你想基于更新后的 DOM 状态来做点什么，这就可能会有些棘手。虽然 Vue.js 通常鼓励开发人员使用 `“数据驱动”` 的方式思考，避免直接接触 DOM，但是有时我们必须要这么做。为了在数据变化之后等待 Vue 完成更新 DOM，可以在数据变化之后立即使用 `Vue.nextTick(callback)`。这样回调函数将在 DOM 更新完成后被调用。

**Vue.nextTick( [callback, context] )**

在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

在组件内使用 `vm.$nextTick()` 实例方法特别方便，因为它不需要全局 Vue，并且回调函数中的 this 将自动绑定到当前的 Vue 实例上。因为 `$nextTick()` 返回一个 Promise 对象，所以你可以使用新的 `ES2017 async/await`语法完成相同的事情：

```js
methods: {
  updateMessage: async function () {
    this.message = '已更新'
    console.log(this.$el.textContent) // => '未更新'
    await this.$nextTick()
    console.log(this.$el.textContent) // => '已更新'
  }
}
```

## 重温 JS 运行机制

JS 执行是单线程的，它是基于事件循环的。事件循环大致分为以下几个步骤：

1. 所有 **同步任务** 都在 **主线程** 上执行，形成一个执行栈（execution context stack）。

2. 主线程之外，还存在一个任务队列。只要异步任务有了运行结果，就在任务队列之中放置一个事件。

3. 一旦执行栈中的所有同步任务执行完毕，系统就会读取任务队列，即一些异步任务(微任务)，也进入执行栈，开始执行。

4. 主线程不断重复上面的第三步。

主线程的执行过程就是一个 tick，而所有的异步结果都是通过 “任务队列” 来调度。 消息队列中存放的是一个个的任务（task）。 规范中规定 task 分为两大类，分别是 macro task 和 micro task，并且每个 macro task 结束后，都要清空所有的 micro task。

## Vue 异步更新实现

### Watcher 队列

当外界通过 Watcher 读取数据时，便会触发 getter 从而将 Watcher 添加到依赖中，哪个 Watcher 触发了 getter，就把哪个 Watcher 收集到 Dep 中。当某个响应式数据发生变化的时候，它的 setter 函数会通知闭包中的 Dep，Dep 则会调用它管理的所有 Watcher 对象。触发 Watcher 对象的 update 实现:

```js
update () {
    /* istanbul ignore else */
    if (this.lazy) {
        this.dirty = true
    } else if (this.sync) {
        /*同步则执行run直接渲染视图*/
        this.run()
    } else {
        /*异步推送到观察者队列中，下一个tick时调用。*/
        queueWatcher(this)
    }
}
```

queueWatcher 的实现：

```js
/*将一个观察者对象 push 进观察者队列，在队列中已经存在相同的 id 则该观察者对象将被跳过，除非它是在队列被刷新时推送*/
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  /*检验id是否存在，已经存在则直接跳过，不存在则标记哈希表has，用于下次检验*/
  if (has[id] == null) {
    has[id] = true
    /*如果没有 flush 掉，直接 push 到观察者队列*/
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id 如果已经刷新，添加到队列
      // if already past its id, it will be run next immediately. 如果已经超过了它的id，它将立即被运行
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)  //重点 调用下一个 tick
    }
  }
}
```

Watcher 对象并不是立即更新视图，而是被 push 进了一个队列 queue，此时状态处于 waiting 的状态，这时候会继续会有 Watcher 对象被 push 进这个队列 queue，等到下一个 tick 运行时，这些 Watcher 对象才会被遍历取出，更新视图。同时，id 重复的 Watcher 不会被多次加入到 queue 中去，因为在最终渲染时，我们只需要关心数据的最终结果。

### nextTick

nextTick 的实现比较简单，执行的目的是在 微任务 或者 宏任务 中推入一个 function，在当前栈执行完毕（也许还会有一些排在前面的需要执行的任务）以后执行nextTick 传入的 function，看一下源码：

声明两个变量：

- macroTimerFunc： marco task 宏任务函数
- microTimerFunc：micro task 微任务函数

```js
import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false

const callbacks = [] // 回调队列 存放异步执行的回调
let pending = false // 异步锁 一个标记位，如果已经有 timerFunc 被推送到任务队列中去则不需要重复推送

// 下一个tick时执行队列中的每一个回调
function flushCallbacks () {
  pending = false // 重置异步锁
  // 防止出现nextTick中包含nextTick时出现问题，在执行回调函数队列前，提前复制备份并清空回调函数队列
  const copies = callbacks.slice(0) 
  callbacks.length = 0
  // 执行回调函数队列
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let timerFunc  // 一个函数指针，指向函数将被推送到任务队列中，等到主线程任务执行完时，任务队列中的 timerFunc 被调用



/**
 * 一共有 Promise、MutationObserver setImmediate 以及 setTimeout 四种尝试得到 timerFunc 的方法 
 */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // 使用 Promise  
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
   /**  
   * 使用 MutationObserver
   * 新建一个 textNode 的 DOM 对象，用 MutationObserver 绑定该 DOM 并指定回调函数，
   * 在 DOM 变化的时候则会触发回调,该回调会进入主线程（比任务队列优先执行），
   * 即 textNode.data = String(counter) 时便会触发回调
   */
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // 使用(回退到) setImmediate
  // 技术上它利用了(宏)任务队列,
  // 但是它仍然是一个比setTimeout更好的选择。
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // 最后使用(回退到) setTimeout(cb,0).
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}


// 导出 nextTick
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // 回调函数推入回调队列
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 如果异步锁未锁上，锁上异步锁，调用异步函数，准备等同步函数执行完后，就开始执行回调函数队列
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line  // 如果没有提供回调，并且支持Promise，返回一个Promise
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

```

`next-tick.js` 申明了 `microTimerFunc` 和 `macroTimerFunc` 2 个变量，它们分别对应的是 `micro task` 的函数和 `macro task` 的函数。对于 `micro task` 的实现，则检测浏览器是否原生支持 `Promise`，不支持的话直接指向 `macro task` 的实现。而对于 `macro task` 的实现，优先检测是否支持原生 `setImmediate`，这是一个高版本 IE 和 Edge 才支持的特性，不支持的话再去检测是否支持原生的 `MessageChannel`，如果也不支持的话就会降级为 `setTimeout 0`。

`next-tick.js` 还对外暴露了 `withMacroTask` 函数，它是对函数做一层包装，确保函数执行过程中对数据任意的修改，触发变化执行 `nextTick` 的时候强制走 `macroTimerFunc`。比如对于一些 DOM 交互事件，如 `v-on` 绑定的事件回调函数的处理，会强制走 `macro task`。

::: tip 注意

- JS 的 event loop 执行时会区分 task(宏任务) 和 microtask(微任务)，引擎在每个 宏任务 执行完毕，从队列中取下一个 宏任务 来执行之前，会先执行完所有 微任务 队列中的 微任务。

- setTimeout 回调会被分配到一个新的 宏任务 中执行，**而 Promise 的 resolve、MutationObserver 的回调都会被安排到一个新的 微任务 中执行**，会比 setTimeout 产生的 宏任务 先执行。

- 要创建一个新的 微任务，优先使用 Promise，如果浏览器不支持，再尝试 MutationObserver。实在不行，再尝试 setImmediate 和 setTimeout 创建 task 宏任务了。

为啥要用 microtask？

**根据 HTML Standard，在每个 宏任务 运行完以后，UI 都会重渲染，那么在 微任务 中就完成数据更新，当前 宏任务 结束就可以得到最新的 UI 了。反之如果新一个 宏任务 来做数据更新，那么渲染就会进行两次**。
:::

综上，nextTick 的目的就是产生一个回调函数加入 task 或者 microtask 中，当前栈执行完以后（可能中间还有别的排在前面的函数）调用该回调函数，起到了异步触发（即下一个tick时触发）的目的。

### flushSchedulerQueue

flushSchedulerQueue 是下一个 tick 时的回调函数，主要目的是执行 Watcher 的 run 函数，用来更新视图。

```js
 /*nextTick的回调函数，在下一个tick时flush掉两个队列同时运行watchers*/
function flushSchedulerQueue () {
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  /*
    给queue排序，这样做可以保证：
    1.组件更新的顺序是从父组件到子组件的顺序，因为父组件总是比子组件先创建。
    2.一个组件的user watchers比render watcher先运行，因为user watchers往往比render watcher更早创建
    3.如果一个组件在父组件watcher运行期间被销毁，它的watcher执行将被跳过。
  */
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  /*这里不用index = queue.length;index > 0; index--的方式写是因为不要将length进行缓存，因为在执行处理现有watcher对象期间，更多的watcher对象可能会被push进queue*/
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    id = watcher.id
    /*将has的标记删除*/
    has[id] = null
    /*执行watcher*/
    watcher.run()
    // in dev build, check and stop circular updates.
    /*
      在测试环境中，检测watch是否在死循环中
      比如这样一种情况
      watch: {
        test () {
          this.test++;
        }
      }
      持续执行了一百次watch代表可能存在死循环
    */
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  /**/
  /*得到队列的拷贝*/
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  /*重置调度者的状态*/
  resetSchedulerState()

  // call component updated and activated hooks
  /*使子组件状态都改编成active同时调用activated钩子*/
  callActivatedHooks(activatedQueue)
  /*调用updated钩子*/
  callUpdateHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}
```

综上，据的变化到 DOM 的重新渲染是一个异步过程，发生在下一个 tick。这就是我们平时在开发的过程中，比如从服务端接口去获取数据的时候，数据做了修改，如果我们的某些方法去依赖了数据修改后的 DOM 变化，我们就必须在 nextTick 后执行。

```js
// 伪代码
getData(res).then(()=>{
  this.xxx = res.data
  this.$nextTick(() => {
    // 这里我们可以获取变化后的 DOM
  })
})
```

## 为什么要异步更新视图

有这么一种场景：

```html
<template>
  <div>
    <div>{{test}}</div>
  </div>
</template>
```

```js
export default {
    data () {
        return {
            test: 0
        };
    },
    mounted () {
      for(let i = 0; i < 1000; i++) {
        this.test++;
      }
    }
}
```

每次 `++` 时，都会根据响应式触发 `setter -> Dep -> Watcher -> update -> patch`。 如果这时候没有异步更新视图，那么每次 `++` 都会直接操作 DOM 更新视图，这是非常消耗性能的。 所以 Vue 实现了一个 `queue队列（queueWatcher）`，在下一个 tick 的时候会统一执行 queue 中 Watcher 的 run。同时，拥有相同 id 的 Watcher 不会被重复加入到该 queue 中去，所以不会执行 1000 次 Watcher 的 run。最终更新视图只会直接将 test 对应的 DOM 的 0 变成 1000。 **保证更新视图操作 DOM 的动作是在当前栈执行完以后下一个 tick 的时候调用，大大优化了性能**。只要让 nextTick 里的代码放在 UI Render 步骤后执行，就能访问到更新后的 DOM。

Vue 就是这样的思路，并不是用 MutationObserver 进行 DOM 变动监听，而是用队列控制的方式达到目的。那么 Vue 又是如何做到队列控制的呢？我们可以很自然地想到 setTimtout，把 nextTick 要执行的代码当作下一个 task 放入队列末尾。

## 降级策略

微任务队列和宏任务队列是交替执行，执行微任务的过程中又产生新的微任务，也会接着执行新的微任务，不会留在下一次事件循环中。也就是说，宏任务总要等到微任务都执行完后才能执行，微任务有着更高的优先级。

队列控制的最佳选择是微任务，而微任务的最佳选择是 Promise。但是如果当前环境不支持 Promise，Vue 就不得不降级为宏任务来做队列控制了。

Vue2.5+ 降级方案：

- Promise（需要 ES6 兼容）【微任务】
- MutationObserver（iOS9.3.3+ 版本存在问题/IE11 不可靠等兼容问题）【微任务】
- setImmdediate（只有 IE 和 Node.js 支持）【宏任务】
- setTimeout（至少有 4ms 延迟，兜底方案）【宏任务】

### MutationObserver

MutationObserver 是 HTML5 新增的内置对象，用于监听 DOM 修改事件，能够监听到节点的属性、文本内容、子节点等的改动。基本用法如下：

```js
const observer = new MutationObserver(function() {
  // 这里是回调函数
  console.log('Done had been modified!');
});

const article = document.querySelector('article');
observer.observer(article);
```

## 总结

- Vue 用**异步更新队列**的方式来控制 DOM 更新与 nexTick 回调的先后顺序执行
- microtask（微任务）因为其高优先级特性，能确保队列中的微任务在一次事件循环前被执行完毕
- 因为兼容性问题，Vue 不得不做 microtask（微任务）向 macrotask（宏任务）的降级方案
