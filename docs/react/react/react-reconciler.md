# Reconciler 调和器

- 什么是 fiber？ Fiber 架构解决了什么问题？
- Fiber root 和 root fiber 有什么区别？
- 不同 fiber 之间如何建立起关联的？
- React 调和流程？
- 两大阶段 commit 和 render 都做了哪些事情？
- 什么是双缓冲树？ 有什么作用？
- Fiber 深度遍历流程？
- Fiber 的调和能中断吗？ 如何中断？

## Fiber

**什么是 fiber**

fiber 架构，目的就是解决大型 React 应用卡顿；fiber 在 React 中是最小粒度的执行单元，无论 React 还是 Vue ，在遍历更新每一个节点的时候都不是用的真实 DOM ，都是采用虚拟 DOM ，所以可以理解成 fiber 就是 React 的虚拟 DOM 。

Fiber 是一个**基于优先级策略**和**帧间回调**的**循环任务调度算法**的架构方案。

大量的组件渲染会导致主进程长时间被占用，导致一些动画或高频操作出现卡顿和掉帧的情况。而关键点，便是 同步阻塞。在之前的调度算法中，React 需要实例化每个类组件，生成一棵组件树，使用 同步递归 的方式进行遍历渲染，而这个过程最大的问题就是无法 暂停和恢复。

当遇到进程同步阻塞的问题时，任务分割、异步调用 和 缓存策略 是三个显著的解决思路。而 React Fiber 便是为了实现任务分割而诞生的。 Fiber 架构的核心思想就是 任务拆分 和 协同，主动把执行权交给主线程，使主线程有时间空档处理其他高优先级任务。

React Fiber 最终提供的关键特性主要是：

- 增量渲染（把渲染任务拆分成块，均匀分布到多帧）
- 更新时能够暂停、终止、复用渲染任务
- 给不同类型的更新赋予优先级
- 并发方面新的基础能力

**为什么要用 fiber**

在浏览器中，页面是一帧一帧绘制出来的，渲染的帧率与设备的刷新率保持一致。一般情况下，设备的屏幕刷新率为1s 60次，当每秒内绘制的帧数（FPS）超过60时，页面渲染是流畅的；而当FPS小于60时，会出现一定程度的卡顿现象。下面来看完整的一帧中，具体做了哪些事情：

![reconciler3](/blog/images/react/reconciler3.png)
![reconciler4](/blog/images/react/reconciler4.png)

**一帧** 内可完成如下六个步骤的任务：

- 用户交互输入事件（Input events），能够让用户得到最早的反馈。

  - Blocking input events（阻塞输入事件）：例如 touch 或 wheel
  - Non-blocking input events（非阻塞输入事件）：例如 click 或 keypress

- JavaScript 引擎解析执行：执行定时器（Timers）事件等回调，需要检查定时器是否到时间，并执行对应的回调。
- 帧开始（Begin frame）：每一帧事件（Per frame events），例如 window resize、scroll 或 media query change
- 执行请求动画帧 rAF（requestAnimationFrame），即在每次绘制之前，会执行 rAF 回调。
- 页面布局（Layout）：计算样式（Recalculate style）和更新布局（Update Layout）。即这个元素的样式是怎样的，它应该在页面如何展示。
- 绘制渲染（Paint）：合成更新（Compositing update）、重绘部分节点（Paint invalidation）和 Record。得到树中每个节点的尺寸与位置等信息，浏览器针对每个元素进行内容填充。
- 上述6个阶段完成，就处于 空闲阶段（Idle Peroid）会执行 RIC (RequestIdelCallback)注册的任务。

JS 引擎和页面渲染引擎是在同一个渲染线程(主线程)之内，两者是互斥关系。如果在某个阶段执行任务特别长，例如在定时器阶段或 Begin Frame 阶段执行时间非常长，时间已经明显超过了 16ms，那么就会阻塞页面的渲染，从而出现卡顿现象。

在 `Reactv15` 以及之前的版本，React 对于虚拟 DOM 是采用自顶向下递归（深度优先遍历）对比虚拟 DOM 树，找出需要变动的节点，然后同步更新它们，这个过程 react 称为 reconcilation（调和）。在 reconcilation 期间，react 会一直占用浏览器资源，会导致用户触发的事件得不到响应。随着项目越来越复杂，层级越来越深，导致更新的时间越来越长，给前端交互上的体验就是卡顿。**所以 V16 之前有一下 3 个痛点**：

- 递归调用，执行栈会越来越深。
- 同步更新虚拟　DOM，不能中断，中断后也不能恢复。
- JS 代码执行时间长，会持续占用主线程，出现渲染卡顿。

当遇到进程同步阻塞的问题时，**任务分割、异步调用** 和 **缓存策略** 是三个显著的解决思路。因此，为了解决以上的痛点问题，React 设计了 Fiber 架构， 把更新、渲染过程拆分为一个个小块的任务，通过合理的调度机制来调控时间，指定任务执行的时机，实现异步可中断执行，从而降低页面卡顿的概率，提升页面交互体验。通过 Fiber 架构，让 reconcilation 过程变得可被中断，适时地让出 CPU 执行权，可以让浏览器及时地响应用户的交互。（就是使 JS 的执行变成可控，不希望 JS 不受控制地长时间执行）

`Reactv16` 为了解决卡顿问题引入了 fiber ，为什么它能解决卡顿，更新 fiber 的过程叫做 `Reconciler`（调和器），每一个 fiber 都可以作为一个执行单元来处理，所以每一个 fiber 可以根据自身的过期时间`expirationTime`（ v17 版本叫做优先级 `lane` ）来判断是否还有空间时间执行更新，如果没有时间更新，就要把主动权交给浏览器去渲染，做一些动画，重排（ reflow ），重绘 repaints 之类的事情，这样就能给用户感觉不是很卡。然后等浏览器空余时间，在通过 `scheduler` （调度器），再次恢复执行单元上来，这样就能本质上中断了渲染，提高了用户体验。

Fiber 架构的核心思想就是**任务拆分**和**协同**，主动把执行权交给主线程，使主线程有时间空档处理其他高优先级任务。

::: tip 合作式调度
这种把渲染更新过程拆分成多个子任务，每次只做一小部分，做完看是否还有剩余时间，如果有继续下个任务；如果没有，挂起当前任务，将时间控制权交给主线程，等主线程不忙的时候再继续执行。这种策略叫做 [Cooperative Scheduling（合作式调度）](https://www.w3.org/TR/requestidlecallback/)，操作系统常用任务调度策略之一。

操作系统常用任务调度策略：先来先服务（FCFS）调度算法、短作业（进程）有限调度算法（SJ/PF）、最高优先权优先调度算法（FPF）、高响应比优先调度算法（HRN）、时间片轮转法（RR）、多级队列反馈法。
:::

### element,fiber,dom 之间关系

首先必须需要弄明白 React.element ，fiber 和真实 DOM 三者是什么关系。

- element 是 React 视图层在代码层级上的表象，也就是开发者写的 jsx 语法，写的元素结构，都会被创建成 element 对象的形式。上面保存了 props ， children 等信息。
- DOM 是元素在浏览器上给用户直观的表象。
- fiber 可以说是是 element 和真实 DOM 之间的交流枢纽站，一方面每一个类型 element 都会有一个与之对应的 fiber 类型，element 变化引起更新流程都是通过 fiber 层面做一次调和改变，然后对于元素，形成新的 DOM 做视图渲染。

![reconciler](/blog/images/react/reconciler1.png)

首先先来看一下 element 与 fiber 之间的对应关系：

```js
export const FunctionComponent = 0;       // 对应函数组件
export const ClassComponent = 1;          // 对应的类组件
export const IndeterminateComponent = 2;  // 初始化的时候不知道是函数组件还是类组件 
export const HostRoot = 3;                // Root Fiber 可以理解为跟元素 ， 通过reactDom.render()产生的根元素
export const HostPortal = 4;              // 对应  ReactDOM.createPortal 产生的 Portal 
export const HostComponent = 5;           // dom 元素 比如 <div>
export const HostText = 6;                // 文本节点
export const Fragment = 7;                // 对应 <React.Fragment> 
export const Mode = 8;                    // 对应 <React.StrictMode>   
export const ContextConsumer = 9;         // 对应 <Context.Consumer>
export const ContextProvider = 10;        // 对应 <Context.Provider>
export const ForwardRef = 11;             // 对应 React.ForwardRef
export const Profiler = 12;               // 对应 <Profiler/ >
export const SuspenseComponent = 13;      // 对应 <Suspense>
export const MemoComponent = 14;          // 对应 React.memo 返回的组件
```

### fiber 保存的信息

fiber 作为 element 和真实 DOM 元素的沟通枢纽，那么一个 fiber 上到底保存了那些信息呢？

```js
function FiberNode(){

  this.tag = tag;                  // fiber 标签 证明是什么类型fiber。
  this.key = key;                  // key调和子节点时候用到。 
  this.type = null;                // dom元素是对应的元素类型，比如div，组件指向组件对应的类或者函数。  
  this.stateNode = null;           // 指向对应的真实dom元素，类组件指向组件实例，可以被ref获取。
 
  this.return = null;              // 指向父级fiber
  this.child = null;               // 指向子级fiber
  this.sibling = null;             // 指向兄弟fiber 
  this.index = 0;                  // 索引

  this.ref = null;                 // ref指向，ref函数，或者ref对象。

  this.pendingProps = pendingProps;// 在一次更新中，代表element创建
  this.memoizedProps = null;       // 记录上一次更新完毕后的props
  this.updateQueue = null;         // 类组件存放setState更新队列，函数组件存放
  this.memoizedState = null;       // 类组件保存state信息，函数组件保存hooks信息，dom元素为null
  this.dependencies = null;        // context或是时间的依赖项

  this.mode = mode;                //描述fiber树的模式，比如 ConcurrentMode 模式

  this.effectTag = NoEffect;       // effect标签，用于收集effectList
  this.nextEffect = null;          // 指向下一个effect

  this.firstEffect = null;         // 第一个effect
  this.lastEffect = null;          // 最后一个effect

  this.expirationTime = NoWork;    // 通过不同过期时间，判断任务是否过期， 在v17版本用lane表示。

  this.alternate = null;           //双缓存树，指向缓存的fiber。更新阶段，两颗树互相交替。
}
```

### fiber 节点间的关联

对于每一个 element 都会对应一个 fiber ，每一个 fiber 是通过 return ， child ，sibling 三个属性建立起联系的。

- return： 指向父级 Fiber 节点。
- child： 指向子 Fiber 节点。
- sibling：指向兄弟 fiber 节点。

比如项目中元素结构是这样的：

```js
export default class Index extends React.Component{
   state={ number:666 } 
   handleClick=()=>{
     this.setState({
         number:this.state.number + 1
     })
   }
   render(){
     return <div>
       hello，world
       <p > 《React进阶实践指南》 { this.state.number } 👍  </p>
       <button onClick={ this.handleClick } >点赞</button>
     </div>
   }
}
```

## Fiber更新机制

### 初始化

**第一步：创建 fiberRoo t和 rootFiber**

- `fiberRoot`：首次构建应用， 创建一个 fiberRoot ，作为整个 React 应用的根基。
- `rootFiber`： 如下通过 ReactDOM.render 渲染出来的，如上 Index 可以作为一个 rootFiber。一个 React 应用可以有多 ReactDOM.render 创建的 rootFiber ，但是只能有一个 fiberRoot（应用根节点）。

```js
ReactDOM.render(<Index/>, document.getElementById('app'));
```

第一次挂载的过程中，会将 fiberRoot 和 rootFiber 建立起关联。

```js
// react-reconciler/src/ReactFiberRoot.js
function createFiberRoot(containerInfo,tag){
    /* 创建一个root */
    const root = new FiberRootNode(containerInfo,tag)
    const rootFiber = createHostRootFiber(tag);
    root.current = rootFiber
    return root
}
```

**第二步：workInProgress和current**

经过第一步的处理，开始到正式渲染阶段，会进入 `beginwork` 流程，在讲渲染流程之前，要先弄明白两个概念：

- `workInProgress` 是：正在内存中构建的 Fiber 树称为 `workInProgress Fiber 树`。在一次更新中，所有的更新都是发生在 `workInProgress` 树上。在一次更新之后，`workInProgress 树`上的状态是最新的状态，那么它将变成 `current 树`用于渲染视图。
- `current`：正在视图层渲染的树叫做 `current 树`。

接下来会到 `rootFiber` 的渲染流程，首先会复用当前 current 树（ rootFiber ）的 `alternate` 作为 `workInProgress` ，如果没有 alternate （初始化的 rootFiber 是没有 alternate ），那么会创建一个 fiber 作为 `workInProgress` 。会用 `alternate` 将新创建的 `workInProgress` 与 `current` 树建立起关联。这个关联过程只有初始化第一次创建 `alternate` 时候进行。

```js
currentFiber.alternate = workInProgressFiber
workInProgressFiber.alternate = currentFiber
```

**第三步：深度调和子节点，渲染视图**

接下来会按照上述第二步，在新创建的 alternates 上，完成整个 fiber 树的遍历，包括 fiber 的创建。最后会以 workInProgress 作为最新的渲染树，fiberRoot 的 current 指针指向 workInProgress 使其变为 current Fiber 树。到此完成初始化流程。

### 更新

更新时，重新创建一颗 `workInProgresss 树`，复用当前 current 树上的 `alternate` ，作为新的 `workInProgress` ，由于初始化 rootfiber 有 `alternate` ，所以对于剩余的子节点，React 还需要创建一份，和 `current 树`上的 fiber 建立起 `alternate` 关联。渲染完毕后，`workInProgresss` 再次变成 `current 树`。

### 双缓冲树

canvas 绘制动画的时候，如果上一帧计算量比较大，导致清除上一帧画面到绘制当前帧画面之间有较长间隙，就会出现白屏。为了解决这个问题，canvas 在内存中绘制当前动画，绘制完毕后直接用当前帧替换上一帧画面，由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况。这种在内存中构建并直接替换的技术叫做**双缓存**。

React 用 workInProgress 树(内存中构建的树) 和 current (渲染树) 来实现更新逻辑。双缓存一个在内存中构建，一个渲染视图，两颗树用 alternate 指针相互指向，在下一次渲染的时候，直接复用缓存树做为下一次渲染树，上一次的渲染树又作为缓存树，这样可以防止只用一颗树更新状态的丢失的情况，又加快了 DOM 节点的替换与更新。

## 两大阶段

### render 阶段

```js
// react-reconciler/src/ReactFiberWorkLoop.js
function workLoop (){
    while (workInProgress !== null ) {
      workInProgress = performUnitOfWork(workInProgress);
    }
}
```

上述已经说了，每一个 fiber 可以看作一个执行的单元，在调和过程中，每一个发生更新的 fiber 都会作为一次 workInProgress 。那么 workLoop 就是执行每一个单元的调度器，如果渲染没有被中断，那么 workLoop 会遍历一遍 fiber 树。 performUnitOfWork 包括两个阶段 beginWork 和 completeWork 。

```js
// react-reconciler/src/ReactFiberWorkLoop.js
function performUnitOfWork(){
    next = beginWork(current, unitOfWork, renderExpirationTime);
    if (next === null) {
       next = completeUnitOfWork(unitOfWork);
    }
}
```

`beginWork`：是向下调和的过程。就是由 fiberRoot 按照 child 指针逐层向下调和，期间会执行函数组件，实例类组件，diff 调和子节点，打不同effectTag。

`completeUnitOfWork`：是向上归并的过程，如果有兄弟节点，会返回 sibling兄弟，没有返回 return 父级，一直返回到 fiebrRoot ，期间可以形成effectList，对于初始化流程会创建 DOM ，对于 DOM 元素进行事件收集，处理style，className等。

这么一上一下，构成了整个 fiber 树的调和。

#### 向下调和 beginWork

```js
// react-reconciler/src/ReactFiberBeginWork.js
function beginWork(current,workInProgress){

    switch(workInProgress.tag){
       case IndeterminateComponent:{// 初始化的时候不知道是函数组件还是类组件 
           //....
       }
       case FunctionComponent: {//对应函数组件
           //....
       }
       case ClassComponent:{  //类组件
           //...
       }
       case HostComponent:{
           //...  
       }
       ...
    }
}
```

总结 beginWork 作用如下：

- 对于组件，执行部分生命周期，执行 render ，得到最新的 children 。
- 向下遍历调和 children ，复用 oldFiber ( diff 算法)，diff 流程在第十二章已经讲过了。
- 打不同的副作用标签 effectTag ，比如类组件的生命周期，或者元素的增加，删除，更新。

**reconcileChildren**

接下来看一下 React 是如何调和子节点的：

```js
// react-reconciler/src/ReactFiberBeginWork.js
function reconcileChildren(current,workInProgress){
   if(current === null){  /* 初始化子代fiber  */
        workInProgress.child = mountChildFibers(workInProgress,null,nextChildren,renderExpirationTime)
   }else{  /* 更新流程，diff children将在这里进行。 */
        workInProgress.child = reconcileChildFibers(workInProgress,current.child,nextChildren,renderExpirationTime)
   }
}
```

**EffectTag** 我列举几个常用的 effectTag 。

```js
export const Placement = /*             */ 0b0000000000010;  // 插入节点
export const Update = /*                */ 0b0000000000100;  // 更新fiber
export const Deletion = /*              */ 0b0000000001000;  // 删除fiebr
export const Snapshot = /*              */ 0b0000100000000;  // 快照
export const Passive = /*               */ 0b0001000000000;  // useEffect的副作用
export const Callback = /*              */ 0b0000000100000;  // setState的 callback
export const Ref = /*                   */ 0b0000010000000;  // ref
```

#### 向上归并 completeUnitOfWork

completeUnitOfWork 的流程是自下向上的，那么 completeUnitOfWork 过程主要做写什么呢？

- 首先 completeUnitOfWork 会将 effectTag 的 Fiber 节点会被保存在一条被称为 effectList 的单向链表中。在 commit 阶段，将不再需要遍历每一个 fiber ，只需要执行更新 effectList 就可以了。
- completeWork 阶段对于组件处理 context ；对于元素标签初始化，会创建真实 DOM ，将子孙 DOM 节点插入刚生成的 DOM 节点中；会触发 diffProperties 处理 props ，比如事件收集，style，className 处理。

### commit阶段

commit 阶段做的事情是：

- 一方面是对一些生命周期和副作用钩子的处理，比如 componentDidMount ，函数组件的 useEffect ，useLayoutEffect ；
- 另一方面就是在一次更新中，添加节点（ `Placement` ），更新节点（ `Update` ），删除节点（ `Deletion` ），还有就是一些细节的处理，比如 ref 的处理。

commit 细分可以分为：

- `Before mutation` 阶段（执行 DOM 操作前）；
- `mutation` 阶段（执行 DOM 操作）；
- `layout` 阶段（执行 DOM 操作后）

#### Before mutation

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
    if ((effectTag & Snapshot) !== NoEffect) {
      const current = nextEffect.alternate;
      // 调用getSnapshotBeforeUpdates
      commitBeforeMutationEffectOnFiber(current, nextEffect);
    }
    if ((effectTag & Passive) !== NoEffect) {
       scheduleCallback(NormalPriority, () => {
          flushPassiveEffects();
          return null;
        });
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

Before mutation 阶段做的事主要有以下内容：

- 因为 Before mutation 还没修改真实的 DOM ，是获取 DOM 快照的最佳时期，如果是类组件有 getSnapshotBeforeUpdate ，那么会执行这个生命周期。
- 会异步调用 useEffect ，在生命周期章节讲到 useEffect 是采用异步调用的模式，其目的就是防止同步执行时阻塞浏览器做视图渲染。

#### Mutation

```js
function commitMutationEffects(){
    while (nextEffect !== null) {
        if (effectTag & Ref) { /* 置空Ref */
            const current = nextEffect.alternate;
            if (current !== null) {
                commitDetachRef(current);
            }
        }
        switch (primaryEffectTag) {
            case Placement: {} //  新增元素
            case Update:{}     //  更新元素
            case Deletion:{}   //  删除元素
        }
    } 
}
```

mutation 阶段做的事情有：

- 置空 ref ，在 ref 章节讲到对于 ref 的处理。
- 对新增元素，更新元素，删除元素。进行真实的 DOM 操作。

#### Layout

```js
function commitLayoutEffects(root){
     while (nextEffect !== null) {
          const effectTag = nextEffect.effectTag;
          commitLayoutEffectOnFiber(root,current,nextEffect,committedExpirationTime)
          if (effectTag & Ref) {
             commitAttachRef(nextEffect);
          }
     }
}
```

Layout 阶段 DOM 已经更新完毕，Layout 做的事情有：

- commitLayoutEffectOnFiber 对于类组件，会执行生命周期，setState 的callback，对于函数组件会执行 useLayoutEffect 钩子。
- 如果有 ref ，会重新赋值 ref 。

commit 阶段主要做的事就是执行 effectList，更新 DOM，执行生命周期，获取 ref 等操作。

## Reconciler 运作流程

![reconciler2](/blog/images/react/reconciler2.png)

### 输入

在`ReactFiberWorkLoop.js`中, 承接输入的函数只有`scheduleUpdateOnFiber`[源码地址](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L517-L619). 在`react-reconciler`对外暴露的 api 函数中, 只要涉及到需要改变 fiber 的操作(无论是`首次渲染`或`后续更新`操作), 最后都会间接调用`scheduleUpdateOnFiber`, 所以`scheduleUpdateOnFiber`函数是输入链路中的`必经之路`.

```js
// 唯一接收输入信号的函数
export function scheduleUpdateOnFiber(
  fiber: Fiber,
  lane: Lane,
  eventTime: number,
) {
  // ... 省略部分无关代码
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (lane === SyncLane) {
    if (
      (executionContext & LegacyUnbatchedContext) !== NoContext &&
      (executionContext & (RenderContext | CommitContext)) === NoContext
    ) {
      // 直接进行`fiber构造`
      performSyncWorkOnRoot(root);
    } else {
      // 注册调度任务, 经过`Scheduler`包的调度, 间接进行`fiber构造`
      ensureRootIsScheduled(root, eventTime);
    }
  } else {
    // 注册调度任务, 经过`Scheduler`包的调度, 间接进行`fiber构造`
    ensureRootIsScheduled(root, eventTime);
  }
}
```

逻辑进入到`scheduleUpdateOnFiber`之后, 后面有 2 种可能:

1. 不经过调度, 直接进行`fiber构造`.
2. 注册调度任务, 经过`Scheduler`包的调度, 间接进行`fiber构造`.

### 注册调度任务

与`输入`环节紧密相连, `scheduleUpdateOnFiber`函数之后, 立即进入`ensureRootIsScheduled`函数([源码地址](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L674-L736)):

```js
// ... 省略部分无关代码
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
  // 前半部分: 判断是否需要注册新的调度
  const existingCallbackNode = root.callbackNode;
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
  );
  const newCallbackPriority = returnNextLanesPriority();
  if (nextLanes === NoLanes) {
    return;
  }
  if (existingCallbackNode !== null) {
    const existingCallbackPriority = root.callbackPriority;
    if (existingCallbackPriority === newCallbackPriority) {
      return;
    }
    cancelCallback(existingCallbackNode);
  }

  // 后半部分: 注册调度任务
  let newCallbackNode;
  if (newCallbackPriority === SyncLanePriority) {
    newCallbackNode = scheduleSyncCallback(
      performSyncWorkOnRoot.bind(null, root),
    );
  } else if (newCallbackPriority === SyncBatchedLanePriority) {
    newCallbackNode = scheduleCallback(
      ImmediateSchedulerPriority,
      performSyncWorkOnRoot.bind(null, root),
    );
  } else {
    const schedulerPriorityLevel = lanePriorityToSchedulerPriority(
      newCallbackPriority,
    );
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
    );
  }
  root.callbackPriority = newCallbackPriority;
  root.callbackNode = newCallbackNode;
}
```

`ensureRootIsScheduled`的逻辑很清晰, 分为 2 部分:

1. 前半部分: 判断是否需要注册新的调度(如果无需新的调度, 会退出函数)
2. 后半部分: 注册调度任务
   - `performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`被封装到了任务回调(`scheduleCallback`)中
   - 等待调度中心执行任务, 任务运行其实就是执行`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`

### 执行任务回调

任务回调, 实际上就是执行`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`. 简单看一下它们的源码(在`fiber树构造`章节再深入分析), 将主要逻辑剥离出来, 单个函数的代码量并不多.

[performSyncWorkOnRoot](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L965-L1045):

```js
// ... 省略部分无关代码
function performSyncWorkOnRoot(root) {
  let lanes;
  let exitStatus;

  lanes = getNextLanes(root, NoLanes);
  // 1. fiber树构造
  exitStatus = renderRootSync(root, lanes);

  // 2. 异常处理: 有可能fiber构造过程中出现异常
  if (root.tag !== LegacyRoot && exitStatus === RootErrored) {
    // ...
  }

  // 3. 输出: 渲染fiber树
  const finishedWork: Fiber = (root.current.alternate: any);
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  commitRoot(root);

  // 退出前再次检测, 是否还有其他更新, 是否需要发起新调度
  ensureRootIsScheduled(root, now());
  return null;
}
```

`performSyncWorkOnRoot`的逻辑很清晰, 分为 3 部分:

1. fiber 树构造
2. 异常处理: 有可能 fiber 构造过程中出现异常
3. 调用输出

[performConcurrentWorkOnRoot](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L740-L839)

```js
// ... 省略部分无关代码
function performConcurrentWorkOnRoot(root) {

  const originalCallbackNode = root.callbackNode;

  // 1. 刷新pending状态的effects, 有可能某些effect会取消本次任务
  const didFlushPassiveEffects = flushPassiveEffects();
  if (didFlushPassiveEffects) {
    if (root.callbackNode !== originalCallbackNode) {
      // 任务被取消, 退出调用
      return null;
    } else {
      // Current task was not canceled. Continue.
    }
  }
  // 2. 获取本次渲染的优先级
  let lanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
  );
  // 3. 构造fiber树
  let exitStatus = renderRootConcurrent(root, lanes);

  if (
    includesSomeLane(
      workInProgressRootIncludedLanes,
      workInProgressRootUpdatedLanes,
    )
  ) {
    // 如果在render过程中产生了新的update, 且新update的优先级与最初render的优先级有交集
    // 那么最初render无效, 丢弃最初render的结果, 等待下一次调度
    prepareFreshStack(root, NoLanes);
  } else if (exitStatus !== RootIncomplete) {
    // 4. 异常处理: 有可能fiber构造过程中出现异常
    if (exitStatus === RootErrored) {
      // ...
    }.
    const finishedWork: Fiber = (root.current.alternate: any);
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    // 5. 输出: 渲染fiber树
    finishConcurrentRender(root, exitStatus, lanes);
  }

  // 退出前再次检测, 是否还有其他更新, 是否需要发起新调度
  ensureRootIsScheduled(root, now());
  if (root.callbackNode === originalCallbackNode) {
    // 渲染被阻断, 返回一个新的performConcurrentWorkOnRoot函数, 等待下一次调用
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  return null;
}
```

`performConcurrentWorkOnRoot`的逻辑与`performSyncWorkOnRoot`的不同之处在于, 对于`可中断渲染`的支持:

1. 调用`performConcurrentWorkOnRoot`函数时, 首先检查是否处于`render`过程中, 是否需要恢复上一次渲染.
2. 如果本次渲染被中断, 最后返回一个新的 performConcurrentWorkOnRoot 函数, 等待下一次调用.

### 输出

```js
// ... 省略部分无关代码
function commitRootImpl(root, renderPriorityLevel) {
  // 设置局部变量
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

  // 清空FiberRoot对象上的属性
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  root.callbackNode = null;

  // 提交阶段
  let firstEffect = finishedWork.firstEffect;
  if (firstEffect !== null) {
    const prevExecutionContext = executionContext;
    executionContext |= CommitContext;
    // 阶段1: dom突变之前
    nextEffect = firstEffect;
    do {
      commitBeforeMutationEffects();
    } while (nextEffect !== null);

    // 阶段2: dom突变, 界面发生改变
    nextEffect = firstEffect;
    do {
      commitMutationEffects(root, renderPriorityLevel);
    } while (nextEffect !== null);
    root.current = finishedWork;

    // 阶段3: layout阶段, 调用生命周期componentDidUpdate和回调函数等
    nextEffect = firstEffect;
    do {
      commitLayoutEffects(root, lanes);
    } while (nextEffect !== null);
    nextEffect = null;
    executionContext = prevExecutionContext;
  }
  ensureRootIsScheduled(root, now());
  return null;
}
```

在输出阶段,`commitRoot`的实现逻辑是在`commitRootImpl`函数中, 其主要逻辑是处理副作用队列, 将最新的 fiber 树结构反映到 DOM 上.

核心逻辑分为 3 个步骤:

1. commitBeforeMutationEffects

   - dom 变更之前, 主要处理副作用队列中带有`Snapshot`,`Passive`标记的`fiber`节点.

2. commitMutationEffects

   - dom 变更, 界面得到更新. 主要处理副作用队列中带有`Placement`, `Update`, `Deletion`, `Hydrating`标记的`fiber`节点.

3. commitLayoutEffects

   - dom 变更后, 主要处理副作用队列中带有`Update | Callback`标记的`fiber`节点

## 问题

### Q1. 为什么设计 Fiber，React 为什么需要 Fiber ？

解题思路

1. Fiber 设计之前的痛点
2. Fiber 怎么解决的这些痛点

React v15 及之前版本使用的协调算法（diff 算法） 是 Stack Reconciler ，有以下的 3 个痛点：

- 递归对比虚拟 DOM 树，执行栈会越来越深。
- 同步更新DOM，不能中断，中断后也不能恢复。
- JS 代码执行时间长，会持续占用主线程，出现渲染卡顿。

当遇到进程同步阻塞的问题时，**任务分割、异步调用** 和 **缓存策略** 是三个显著的解决思路。因此，为了解决以上的痛点问题，React 设计了 Fiber 架构， 把更新、渲染过程拆分为一个个小块的任务，通过合理的调度机制来调控时间，指定任务执行的时机，实现异步可中断执行，从而降低页面卡顿的概率，提升页面交互体验。通过 Fiber 架构，让 reconcilation 过程变得可被中断，适时地让出 CPU 执行权，可以让浏览器及时地响应用户的交互。（就是使 JS 的执行变成可控，不希望 JS 不受控制地长时间执行）。

Fiber 的主要目标是实现虚拟 DOM 的增量渲染，能够将渲染工作拆分成块并将其分散到多个帧的能力。在新的更新到来时，能够暂停、中止和复用工作，能为不同类型的更新分配优先级顺序的能力，因此 这种 Fiber reconciler 很好的解决了Stack Reconciler  的问题。

### Q2. Fiber 为什么设计成链表结构？为什么中断执行后可以恢复？

fiber 对象中存储的元素上下文信息以及指针域构成的链表结构，使其能够将执行到一半的工作保存在内存的链表中。当 React 停止并完成保存的工作后，让出时间片去处理一些其他优先级更高的事情。之后，在重新获取到可用的时间片后，它能够根据之前保存在内存的上下文信息通过快速遍历的方式找到停止的 fiber 节点并继续工作。由于在此阶段执行的工作并不会导致任何用户可见的更改，因为并没有被提交到真实的 DOM。所以，这种链表结构的 fiber 能让让调度能够实现暂停、中止以及重新开始等增量渲染的能力。

### Q3. React Fiber 是如何实现更新过程可控？执行流程？

更新过程的可控主要体现在下面几个方面：

- 任务拆分
- 任务挂起、恢复、终止
- 任务具备优先级

**任务拆分**

在 React Fiber 机制中，它采用"化整为零"的思想，将调和阶段（Reconciler）递归遍历 VDOM 这个大任务分成若干小任务，每个任务只负责一个节点的处理。

**任务挂起、恢复、终止**

**workInProgress tree**： workInProgress 代表当前正在执行更新的 Fiber 树。在 render 或者 setState 后，会构建一颗 Fiber 树，也就是 workInProgress tree，这棵树在构建每一个节点的时候会收集当前节点的副作用，整棵树构建完成后，会形成一条完整的副作用链。

**currentFiber tree**：currentFiber 表示上次渲染构建的 Filber 树。在每一次更新完成后 workInProgress 会赋值给 currentFiber。在新一轮更新时 workInProgress tree 再重新构建，新 workInProgress 的节点通过 alternate 属性和 currentFiber 的节点建立联系。

在新 workInProgress tree 的创建过程中，会同 currentFiber 的对应节点进行 Diff 比较，收集副作用。同时也会复用和 currentFiber 对应的节点对象，减少新创建对象带来的开销。也就是说无论是创建还是更新、挂起、恢复以及终止操作都是发生在 workInProgress tree 创建过程中的。workInProgress tree 构建过程其实就是循环的执行任务和创建下一个任务。

**挂起**

当第一个小任务完成后，先判断这一帧是否还有空闲时间，没有就挂起下一个任务的执行，记住当前挂起的节点，让出控制权给浏览器执行更高优先级的任务。

**恢复**

在浏览器渲染完一帧后，判断当前帧是否有剩余时间，如果有就恢复执行之前挂起的任务。如果没有任务需要处理，代表调和阶段完成，可以开始进入渲染阶段。

1. 如何判断一帧是否有空闲时间的呢？

使用前面提到的 RIC (RequestIdleCallback) 浏览器原生 API，React 源码中为了兼容低版本的浏览器，对该方法进行了 Polyfill。

1. 恢复执行的时候又是如何知道下一个任务是什么呢？

答案是在前面提到的链表。在 React Fiber 中每个任务其实就是在处理一个 FiberNode 对象，然后又生成下一个任务需要处理的 FiberNode。

**终止**

其实并不是每次更新都会走到提交阶段。当在调和过程中触发了新的更新，在执行下一个任务的时候，判断是否有优先级更高的执行任务，如果有就终止原来将要执行的任务，开始新的 workInProgressFiber 树构建过程，开始新的更新流程。这样可以避免重复更新操作。这也是在 React 16 以后生命周期函数 componentWillMount 有可能会执行多次的原因。

::: tip 注意

React 17 全面开启 async rendering。因此 17 将会废弃多个生命周期钩子函数（will 系列），原因是开启 async rendering，在 render 函数之前的所有函数，都有可能被执行多次。

长期以来，原有的生命周期函数总是会诱惑开发者在 render 之前的生命周期函数做一些动作，现在这些动作还放在这些函数中的话，有可能会被调用多次，这肯定不是你想要的结果。在 componentWillMount 执行网络请求，无论请求多快都无法赶上首次 render，而且 componentWillMount 在服务端渲染也会被调用，这样的 I/O 操作放在 componentDidMount 里更加合适。

在 Fiber 启用 async rendering 之后，更没有理由在 componentWillMount 里执行网络请求，因为 componentWillMount 可能会被调用多次，谁也不会希望无谓地多次调用多次网络请求吧。

:::

### Q4. React 能否像 Vue 那样进行预编译优化

Vue3.0 提出动静结合的 DOM diff 思想，动静结合的 DOM diff其实是在预编译阶段进行了优化。之所以能够做到**预编译优化**，是因为 Vue core 可以**静态分析 template**，在解析模版时，整个 parse 的过程是利用**正则表达式**顺序解析模板，当解析到开始标签、闭合标签和文本的时候都会分别执行对应的回调函数，来达到构造 AST 树的目的。

**借助预编译过程**，Vue 可以做到的预编译优化就很强大了。比如在预编译时标记出模版中可能变化的组件节点，再次进行渲染前 diff 时就可以**跳过“永远不会变化的节点”**，而只需要对比“可能会变化的动态节点”。这也就是**动静结合的 DOM diff 将 diff 成本与模版大小正相关优化到与动态节点正相关的理论依据**。

Vue 需要做数据双向绑定，需要进行数据拦截或代理，那它就需要在**预编译阶段静态分析模版，分析出视图依赖了哪些数据，进行响应式处理**。而 React 就是**局部重新渲染**，React 拿到的或者说掌管的，所负责的就是一堆**递归 React.createElement** 的执行调用（参考下方经过Babel转换的代码），它无法从模版层面进行静态分析。[JSX 和手写的 render function](https://link.juejin.cn?target=https%3A%2F%2Fcn.vuejs.org%2Fv2%2Fguide%2Frender-function.html) 是完全动态的，**过度的灵活性导致运行时可以用于优化的信息不足**。

- JSX 具有 JavaScript 的完整表现力，可以构建非常复杂的组件。但是**灵活**的语法，也意味着**引擎难以理解**，无法预判开发者的用户意图，从而难以优化性能。
- Template 模板是一种非常有**约束**的语言，你只能以某种方式去编写模板。

既然存在以上**编译时先天不足**，在运行时优化方面，React 一直在努力。比如，React15 实现了 batchedUpdates（批量更新）。即**同一事件回调函数上下文**中的多次 setState 只会触发一次更新。但是，如果单次更新就很耗时，页面还是会卡顿（这在一个维护时间很长的大应用中是很常见的）。这是因为 React15 的更新流程是同步执行的，一旦开始更新直到页面渲染前都不能中断。

### Q5. React  hooks 的实现必须依赖 Fiber 吗?

React 的 hooks 是在 fiber 之后出现的特性，所以很多人误以为 hooks 是必须依赖 fiber 才能实现的，其实并不是，它们俩没啥必然联系。

在 React16 之前，会递归渲染这个 vdom，增删改真实 dom。而在 React16 引入了 fiber 架构之后就多了一步：首先把 vdom 转成 fiber，之后再渲染 fiber。vdom 转 fiber 的过程叫做 reconcile，最后增删改真实 dom 的过程叫做 commit。因为 vdom 只有子节点 children 的引用，没有父节点 parent 和其他兄弟节点 sibling 的引用，这导致了要一次性递归把所有 vdom 节点渲染到 dom 才行，不可打断。万一打断了会怎么样呢？因为没有记录父节点和兄弟节点，那只能继续处理子节点，却不能处理 vdom 的其他部分了。所以 React 才引入了这种 fiber 的结构，也就是有父节点 return、子节点 child、兄弟节点 sibling 等引用，可以打断，因为断了再恢复也能找到后面所有没处理过的节点。

所以 fiber 架构就分为了 schdule、reconcile（vdom 转 fiber）、commit（更新到 dom）三个阶段。

函数组件内可以用 hooks 来存取一些值，这些值就是存在 fiber 节点上的。不同的 hook 在 memorizedState 链表不同的元素上存取值，通过 next 串联起来，这就是 react hooks 的原理。

对比其他框架：

- react 是把 vdom 转成 fiber，然后把 hook 链表存放到了 fiber.memorizedState 属性上，通过 next 串联
- preact 没有实现 fiber，它是把 hook 链表放到了 vnode._component._hooks 属性上，数组实现的，通过下标访问
- react ssr 时不需要 fiber，但是也没有把 hook 链表挂到 vdom 上，而是直接放在了一个全局变量上，因为只需要渲染一次，渲染完一个组件就清空这个全局变量就行
- midway 是一个 Node.js 框架，它也实现了 hooks 类似的 api，具体放在哪我们没深入，但是只要有个上下文存放 hook 链表就行

### Q6. React 15/16/17 的架构有什么区别

React渲染页面的两个阶段

- 调度阶段（reconciliation）：在这个阶段 React 会更新数据生成新的 Virtual DOM，然后通过Diff算法，快速找出需要更新的元素，放到更新队列中去，**得到新的更新队列**。
- 渲染阶段（commit）：这个阶段 React 会遍历更新队列，**将其所有的变更一次性更新到DOM上**。

**React15 架构**

React15 架构可以分为两层：

- Reconciler（协调器）—— 负责找出变化的组件；
- Renderer（渲染器）—— 负责将变化的组件渲染到页面上；

在 React15 及以前，Reconciler 采用递归的方式创建虚拟 DOM，**递归过程是不能中断的**。如果组件树的层级很深，递归会占用线程很多时间，递归更新时间超过了16ms，用户交互就会卡顿。

为了解决这个问题，React16 将递归的无法中断的更新重构为**异步的可中断更新**，由于曾经用于递归的虚拟 DOM数据结构已经无法满足需要。于是，全新的 Fiber 架构应运而生。

**React 16 架构**

为了解决同步更新长时间占用线程导致页面卡顿的问题，也为了探索运行时优化的更多可能，React 开始重构并一直持续至今。重构的目标是实现 Concurrent Mode（并发模式）。

从 v15 到 v16，React 团队花了两年时间将源码架构中的 Stack Reconciler 重构为 Fiber Reconciler。

React16 架构可以分为三层：

- Scheduler（调度器）—— **调度任务的优先级**，高优任务优先进入Reconciler；
- Reconciler（协调器）—— 负责找出变化的组件：**更新工作从递归变成了可以中断的循环过程。Reconciler内部采用了Fiber的架构**；
- Renderer（渲染器）—— 负责将变化的组件渲染到页面上。

**React 17 优化**

React16 的 expirationTimes 模型只能区分是否 >=expirationTimes 决定节点是否更新。React17 的 lanes 模型可以选定一个更新区间，并且动态的向区间中增减优先级，可以处理更细粒度的更新。

Lane 用二进制位表示任务的优先级，方便优先级的计算（位运算），不同优先级占用不同位置的“赛道”，而且存在批的概念，优先级越低，“赛道”越多。高优先级打断低优先级，新建的任务需要赋予什么优先级等问题都是Lane 所要解决的问题。

Concurrent Mode的目的是实现一套可中断/恢复的更新机制。其由两部分组成：

- 一套协程架构：Fiber Reconciler
- 基于协程架构的[启发式更新算法](https://zhuanlan.zhihu.com/p/182411298)：控制协程架构工作方式的算法

### Q7. Concurrent Mode

Concurrent Mode 指的就是 React 利用上面 Fiber 带来的新特性的开启的新模式 (mode)。react17开始支持concurrent mode，这种模式的根本目的是为了让应用保持cpu和io的快速响应，它是一组新功能，包括Fiber、Scheduler、Lane，可以根据用户硬件性能和网络状况调整应用的响应速度，核心就是为了实现异步可中断的更新。concurrent mode也是未来react主要迭代的方向。

目前 React 实验版本允许用户选择三种 mode：

1. Legacy Mode: 就相当于目前稳定版的模式
2. Blocking Mode: 应该是以后会代替 Legacy Mode 而长期存在的模式
3. Concurrent Mode: 以后会变成 default 的模式

Concurrent Mode 其实开启了一堆新特性，其中有两个最重要的特性可以用来解决我们开头提到的两个问题：

1. [Suspense](https://juejin.cn/post/6844903981999718407)：Suspense 是 React 提供的一种异步处理的机制, 它不是一个具体的数据请求库。它是React 提供的原生的组件异步调用原语。
2. [useTrasition](https://juejin.cn/post/6844903986420514823)：让页面实现 Pending -> Skeleton -> Complete 的更新路径, 用户在切换页面时可以停留在当前页面，让页面保持响应。 相比展示一个无用的空白页面或者加载状态，这种用户体验更加友好。

其中 Suspense 可以用来解决请求阻塞的问题，UI 卡顿的问题其实开启 concurrent mode 就已经解决的，但如何利用 concurrent mode 来实现更友好的交互还是需要对代码做一番改动的。

[深入分析虚拟DOM的渲染过程和特性](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490064&idx=1&sn=0f5047c2be91db25203c42b0ece074e9&source=41#wechat_redirect)

[React 运行时优化方案的演进](https://juejin.cn/post/7010539227284766751#heading-30)
