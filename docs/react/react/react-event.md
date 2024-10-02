# React 事件系统

- React 为什么有自己的事件系统？
- 什么是事件合成 ？
- 如何实现的批量更新？
- 事件系统如何模拟冒泡和捕获阶段？
- 如何通过 dom 元素找到与之匹配的 fiber？
- 为什么不能用 return false 来阻止事件的默认行为？
- 事件是绑定在真实的dom上吗？如何不是绑定在哪里？
- V17 对事件系统有哪些改变？

React 为什么要写出一套自己的事件系统呢？

1. 首先，对于不同的浏览器，对事件存在不同的兼容性，React 想实现一个兼容全浏览器的框架， 为了实现这个目标就需要创建一个兼容全浏览器的事件系统，以此抹平不同浏览器的差异。

2. 其次，v17 之前 React 事件都是绑定在 document 上，v17 之后 React 把事件绑定在应用对应的容器 container 上，将事件绑定在同一容器统一管理，防止很多事件直接绑定在原生的 DOM 元素上。造成一些不可控的情况。由于不是绑定在真实的 DOM 上，所以 React 需要模拟一套事件流：`事件捕获-> 事件源 -> 事件冒泡`，也包括重写一下事件源对象 event 。

3. 最后，这种事件系统，大部分处理逻辑都在底层处理了，这对后期的 ssr 和跨端支持度很高。

## 事件冒泡和捕获

- 冒泡阶段：开发者正常给 React 绑定的事件比如 onClick，onChange，默认会在模拟冒泡阶段执行。
- 捕获阶段：如果想要在捕获阶段执行可以将事件后面加上 Capture 后缀，比如 onClickCapture，onChangeCapture。

```js
export default function Index(){
    const handleClick=()=>{ console.log('模拟冒泡阶段执行') } 
    const handleClickCapture = ()=>{ console.log('模拟捕获阶段执行') }
    return <div>
        <button onClick={ handleClick  } onClickCapture={ handleClickCapture }  >点击</button>
    </div>
}
```

React 中如果想要阻止事件向上冒泡，可以用 `e.stopPropagation()`:

```js
export default function Index(){
    const handleClick=(e)=> {
        e.stopPropagation() /* 阻止事件冒泡，handleFatherClick 事件讲不在触发 */
    }
    const handleFatherClick=()=> console.log('冒泡到父级')
    return <div onClick={ handleFatherClick } >
        <div onClick={ handleClick } >点击</div>
    </div>
}
```

React 阻止冒泡和原生事件中的写法差不多，当如上 handleClick上 阻止冒泡，父级元素的 handleFatherClick 将不再执行，但是底层原理完全不同

React 阻止默认行为和原生的事件也有一些区别。

原生事件： `e.preventDefault()` 和 `return false` 可以用来阻止事件默认行为，由于在 React 中给元素的事件并不是真正的事件处理函数。所以导致 `return false` 方法在 React 应用中完全失去了作用。

React 事件在 React 应用中，可以用 `e.preventDefault()` 阻止事件默认行为，这个方法并非是原生事件的 `preventDefault` ，由于 React 事件源 e 也是独立组建的，所以 `preventDefault` 也是单独处理的。

## 事件合成

React 事件系统可分为三个部分：

- 第一个部分是事件合成系统，初始化会注册不同的事件插件。
- 第二个就是在一次渲染过程中，对事件标签中事件的收集，向 container 注册事件。
- 第三个就是一次用户交互，事件触发，到事件执行一系列过程。

什么叫事件合成？

```js
export default function Index(){
  const handleClick = () => {}
  return <div >
     <button onClick={ handleClick } >点击</button>
  </div>
}
```

上面在 button 元素绑定的事件中，没有找到 handleClick 事件。但是在 document 上绑定一个 onclick 事件。于是如下将应用中再添加一个 input 并绑定一个 onChange 事件

```js
export default function Index(){
  const handleClick = () => {}
  const handleChange =() => {}
  return <div >
     <input onChange={ handleChange }  />
     <button onClick={ handleClick } >点击</button>
  </div>
}
```

在 input 上还是没有找到绑定的事件 handleChange ，但是 document 的事件多了 blur，change ，focus ，keydown，keyup 等事件。

- React 的事件不是绑定在元素上的，而是统一绑定在顶部容器上，在 v17 之前是绑定在 document 上的，在 v17 改成了 app 容器上。这样更利于一个 html 下存在多个应用（微前端）。
- 绑定事件并不是一次性绑定所有事件，比如发现了 onClick 事件，就会绑定 click 事件，比如发现 onChange 事件，会绑定 `[blur，change ，focus ，keydown，keyup]`多个事件。
- React 事件合成的概念：React 应用中，元素绑定的事件并不是原生事件，而是React 合成的事件，比如 onClick 是由 click 合成，onChange 是由 blur ，change ，focus 等多个事件合成。

## 事件插件机制

React 有一种事件插件机制，比如上述 onClick 和 onChange ，会有不同的事件插件 SimpleEventPlugin ，ChangeEventPlugin 处理

```js
const registrationNameModules = {
    onBlur: SimpleEventPlugin,
    onClick: SimpleEventPlugin,
    onClickCapture: SimpleEventPlugin,
    onChange: ChangeEventPlugin,
    onChangeCapture: ChangeEventPlugin,
    onMouseEnter: EnterLeaveEventPlugin,
    onMouseLeave: EnterLeaveEventPlugin,
    ...
}
```

registrationNameModules 记录了 React 事件（比如 onBlur ）和与之对应的处理插件的映射，比如上述的 onClick ，就会用 SimpleEventPlugin 插件处理，onChange 就会用 ChangeEventPlugin 处理。应用于事件触发阶段，根据不同事件使用不同的插件。

registrationNameDependencies 这个对象保存了 React 事件和原生事件对应关系，这就解释了为什么上述只写了一个 onChange ，会有很多原生事件绑定在 document 上。在事件绑定阶段，如果发现有 React 事件，比如 onChange ，就会找到对应的原生事件数组，逐一绑定。

## 事件绑定

事件绑定，就是在 React 处理 props 时候，如果遇到事件比如 onClick ，就会通过 addEventListener 注册原生事件

```js
export default function Index(){
  const handleClick = () => console.log('点击事件')
  const handleChange =() => console.log('change事件)
  return <div >
     <input onChange={ handleChange }  />
     <button onClick={ handleClick } >点击</button>
  </div>
}
```

对于如上结构，最后 onChange 和 onClick 会保存在对应 DOM 元素类型 fiber 对象（ hostComponent ）的 memoizedProps 属性上，如上结构会变成这样。

![事件系统1](/blog/images/react/事件系统1.png)

```js
// react-dom/src/client/ReactDOMComponent.js
function diffProperties(){
    /* 判断当前的 propKey 是不是 React合成事件 */
    if(registrationNameModules.hasOwnProperty(propKey)){
         /* 这里多个函数简化了，如果是合成事件， 传入成事件名称 onClick ，向document注册事件  */
         legacyListenToEvent(registrationName, document）;
    }
}
```

`diffProperties` 函数在 diff props 如果发现是合成事件( onClick ) 就会调用 `legacyListenToEvent` 函数。注册事件监听器。接下来看一下 `legacyListenToEvent` 是如何注册事件的。

```js
// react-dom/src/events/DOMLegacyEventPluginSystem.js
function legacyListenToEvent(registrationName，mountAt){
   const dependencies = registrationNameDependencies[registrationName]; // 根据 onClick 获取  onClick 依赖的事件数组 [ 'click' ]。
    for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    //  addEventListener 绑定事件监听器
    ...
  }
}
```

这个就是应用上述 `registrationNameDependencies` 对 React 合成事件，分别绑定原生事件的事件监听器。比如发现是 onChange ，那么取出 `['blur', 'change', 'click', 'focus', 'input', 'keydown', 'keyup', 'selectionchange']` 遍历绑定。

绑定在 document 的事件处理函数是如上写的handleChange，handleClick 吗？

答案是否定的，绑定在 document 的事件，是 React 统一的事件处理函数 dispatchEvent ，React 需要一个统一流程去代理事件逻辑，包括 React 批量更新等逻辑。

只要是 React 事件触发，首先执行的就是 dispatchEvent ，那么有的同学会问，dispatchEvent 是如何知道是什么事件触发的呢？实际在注册的时候，就已经通过 bind ，把参数绑定给 dispatchEvent 了。

## 事件触发

```js
export default function Index(){
    const handleClick1 = () => console.log(1)
    const handleClick2 = () => console.log(2)
    const handleClick3 = () => console.log(3)
    const handleClick4 = () => console.log(4)
    return <div onClick={ handleClick3 }  onClickCapture={ handleClick4 }  >
        <button onClick={ handleClick1 }  onClickCapture={ handleClick2 }  >点击</button>
    </div>
}
```

如果上述点击按钮，触发点击事件，那么在 React 系统中，整个流程会是这个样子的：

### 第一步：批量更新

首先上面讲到执行 dispatchEvent ，dispatchEvent 执行会传入真实的事件源 button 元素本身。通过元素可以找到 button 对应的 fiber ，fiber 和原生 DOM 之间是如何建立起联系的呢？

React 在初始化真实 DOM 的时候，用一个随机的 key internalInstanceKey 指针指向了当前 DOM 对应的 fiber 对象，fiber 对象用 stateNode 指向了当前的 DOM 元素。

![事件系统2](/blog/images/react/事件系统2.png)

接下来就是批量更新环节：

```js
// react-dom/src/events/ReactDOMUpdateBatching.js
export function batchedEventUpdates(fn,a){
    isBatchingEventUpdates = true; //打开批量更新开关
    try{
       fn(a)  // 事件在这里执行
    }finally{
        isBatchingEventUpdates = false //关闭批量更新开关
    }
}
```

![事件系统3](/blog/images/react/事件系统3.png)

### 第二步：合成事件源

接下来会通过 onClick 找到对应的处理插件 SimpleEventPlugin ，合成新的事件源 e ，里面包含了 preventDefault 和 stopPropagation 等方法。

![事件系统4](/blog/images/react/事件系统4.png)

### 第三步：形成事件执行队列

在第一步通过原生 DOM 获取到对应的 fiber ，接着会从这个 fiber 向上遍历，遇到元素类型 fiber ，就会收集事件，用一个数组收集事件：

- 如果遇到捕获阶段事件 onClickCapture ，就会 unshift 放在数组前面。以此模拟事件捕获阶段。
- 如果遇到冒泡阶段事件 onClick ，就会 push 到数组后面，模拟事件冒泡阶段。
- 一直收集到最顶端 app ，形成执行队列，在接下来阶段，依次执行队列里面的函数。

```js
 while (instance !== null) {
    const {stateNode, tag} = instance;
    if (tag === HostComponent && stateNode !== null) { /* DOM 元素 */
        const currentTarget = stateNode;
        if (captured !== null) { /* 事件捕获 */
            /* 在事件捕获阶段,真正的事件处理函数 */
            const captureListener = getListener(instance, captured); // onClickCapture
            if (captureListener != null) {
            /* 对应发生在事件捕获阶段的处理函数，逻辑是将执行函数unshift添加到队列的最前面 */
                dispatchListeners.unshift(captureListener);
                
            }
        }
        if (bubbled !== null) { /* 事件冒泡 */
            /* 事件冒泡阶段，真正的事件处理函数，逻辑是将执行函数push到执行队列的最后面 */
            const bubbleListener = getListener(instance, bubbled); // 
            if (bubbleListener != null) {
                dispatchListeners.push(bubbleListener); // onClick
            }
        }
    }
    instance = instance.return;
}
```

那么如上点击一次按钮，4个事件执行顺序是这样的：

- 首先第一次收集是在 button 上，handleClick1 冒泡事件 push 处理，handleClick2 捕获事件 unshift 处理。形成结构 [ handleClick2 , handleClick1 ]
- 然后接着向上收集，遇到父级，收集父级 div 上的事件，handleClick3 冒泡事件 push 处理，handleClick4 捕获事件 unshift 处理。[handleClick4, handleClick2 , handleClick1,handleClick3 ]
- 依次执行数组里面的事件，所以打印 4 2 1 3。

![事件系统5](/blog/images/react/事件系统5.png)

## 阻止事件冒泡

那么 React 是如何阻止事件冒泡的呢。来看一下事件队列是怎么执行的。

```js
// legacy-events/EventBatching.js
function runEventsInBatch(){
    const dispatchListeners = event._dispatchListeners;
    if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) { /* 判断是否已经阻止事件冒泡 */
        break;
      }    
      dispatchListeners[i](event) /* 执行真正的处理函数 及handleClick1... */
    }
  }
}
```

对于上述队列 `[handleClick4, handleClick2 , handleClick1, handleClick3 ]`

假设在上述队列中，`handleClick2` 中调用 `e.stopPropagation()`，那么事件源里将有状态证明此次事件已经停止冒泡，那么下次遍历的时候， `event.isPropagationStopped()`就会返回 true ，所以跳出循环，`handleClick1`, `handleClick3` 将不再执行，模拟了阻止事件冒泡的过程。

## V18 事件系统 <Badge text="v18"/>

### 背景

在上几节中，我们讲到了老版本的事件原理，老版本的事件原理有一个问题就是，捕获阶段和冒泡阶段的事件都是模拟的，本质上都是在冒泡阶段执行的，比如如下例子中：

```js
function Index(){
    const refObj = React.useRef(null)
    useEffect(()=>{
        const handler = ()=>{
            console.log('事件监听')
        }
        refObj.current.addEventListener('click',handler)
        return () => {
            refObj.current.removeEventListener('click',handler)
        }
    },[])
    const handleClick = ()=>{
       console.log('冒泡阶段执行')
    }
    const handleCaptureClick = ()=>{
       console.log('捕获阶段执行')
    }
    return  <button ref={refObj} onClick={handleClick} onClickCapture={handleCaptureClick} >点击</button>
}
```

如上通过 onClick，onClickCapture 和原生的 DOM 监听器给元素 button 绑定了三个事件处理函数，那么当触发一次点击事件的时候，处理函数的执行，老版本打印顺序为：

老版本事件系统：`事件监听 -> 捕获阶段执行 -> 冒泡阶段执行`

但是老版本的事件系统，一定程度上，不符合事件流的执行时机，但是在新版本 v18 的事件系统中，这个问题得以解决。

新版本事件系统：`捕获阶段执行 -> 事件监听 -> 冒泡阶段执行`

### 事件绑定 —— 事件初始化

在 React 新版的事件系统中，在 createRoot 会一口气向外层容器上注册完全部事件:

```js
// react-dom/client.js
function createRoot(container, options) {
    /* 省去和事件无关的代码，通过如下方法注册事件 */
    listenToAllSupportedEvents(rootContainerElement);
}
```

在 createRoot 中，通过 listenToAllSupportedEvents 注册事件:

```js
// react-dom/src/events/DOMPluginEventSystem.js
function listenToAllSupportedEvents(rootContainerElement) {
    /* allNativeEvents 是一个 set 集合，保存了大多数的浏览器事件 */
    allNativeEvents.forEach(function (domEventName) {
      if (domEventName !== 'selectionchange') {
         /* nonDelegatedEvents 保存了 js 中，不冒泡的事件 */ 
        if (!nonDelegatedEvents.has(domEventName)) {
          /* 在冒泡阶段绑定事件 */ 
          listenToNativeEvent(domEventName, false, rootContainerElement);
        }
        /* 在捕获阶段绑定事件 */
        listenToNativeEvent(domEventName, true, rootContainerElement);
      }
    });
}
```

`listenToAllSupportedEvents` 这个方法比较核心，主要目的就是通过 `listenToNativeEvent` 绑定浏览器事件，这里引出了两个常量，`allNativeEvents` 和 `nonDelegatedEvents` ，它们分别代表的意思如下：

- allNativeEvents：allNativeEvents 是一个 set 集合，保存了 81 个浏览器常用事件。
- nonDelegatedEvents ：这个也是一个集合，保存了浏览器中不会冒泡的事件，一般指的是媒体事件，比如 pause，play，playing 等，还有一些特殊事件，比如 cancel ，close，invalid，load，scroll 。

接下来如果事件是不冒泡的，那么会执行一次，`listenToNativeEvent`，第二个参数为 true 。 如果是常规的事件，那么会执行两次 `listenToNativeEvent`，分别在冒泡和捕获阶段绑定事件。那么 listenToNativeEvent 就是事件监听，这个函数这里给它精简化，listenToNativeEvent 主要逻辑如下:

```js
var listener = dispatchEvent.bind(null,domEventName,...)
if(isCapturePhaseListener){
    target.addEventListener(eventType, dispatchEvent, true);
}else{
    target.addEventListener(eventType, dispatchEvent, false);
}
```

`isCapturePhaseListener` 就是 `listenToNativeEvent` 的第二个参数，target 为 DOM 对象。`dispatchEvent` 为统一的事件监听函数。

如上可以看到 listenToNativeEvent 本质上就是向原生 DOM 中去注册事件，上面还有一个细节，就是 dispatchEvent 已经通过 bind 的方式将事件名称等信息保存下来了。经过这第一步，在初始化阶段，就已经注册了很多的事件监听器了。

此时如果发生一次点击事件，就会触发两次 dispatchEvent ：

- 第一次捕获阶段的点击事件
- 第二次冒泡阶段的点击事件

### 事件触发

当触发一次点击事件，会发生什么，首先就是执行 dispatchEvent 事件，dispatchEvent 保留核心的代码如下：

```js
batchedUpdates(function () {
    return dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, ancestorInst);
});
```

`dispatchEvent` 如果是正常的事件，就会通过 `batchedUpdates` 来处理 `dispatchEventsForPlugins` ，`batchedUpdates` 是批量更新的逻辑，在之前的章节中已经讲到通过这种方式来让更新变成可控的。所有的矛头都指向了 `dispatchEventsForPlugins`:

```js
function dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
  /* 找到发生事件的元素——事件源 */  
  var nativeEventTarget = getEventTarget(nativeEvent);
  /* 待更新队列 */
  var dispatchQueue = [];
  /* 找到待执行的事件 */
  extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
  /* 执行事件 */
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}
```

这个函数非常重要，首先通过 `getEventTarget` 找到发生事件的元素，也就是事件源。然后创建一个待更新的事件队列，接下来通过 `extractEvents` 找到待更新的事件，然后通过 `processDispatchQueue` 执行事件。

先举一个例子如下：

```js
function Index(){
    const handleClick = ()=>{
       console.log('冒泡阶段执行')
    }
    const handleCaptureClick = ()=>{
       console.log('捕获阶段执行')
    }
    const handleParentClick = () => {
        console.log('div 点击事件')
    }
    return  <div onClick={handleParentClick} >
        <button onClick={handleClick} onClickCapture={handleCaptureClick} >点击</button>
    </div>
}
```

如上的例子，有一个 div 和 button 均绑定了一个正常的点击事件 ，div 是 button 的父元素，除此之外 button 绑定了一个在捕获阶段执行的点击事件。当点击按钮，触发一次点击事件的时候，如果 nativeEventTarget 本质上就是发生点击事件的 button 对应的 DOM 元素。那么第一个问题就是 dispatchQueue 是什么？ extractEvents 有如何处理的 dispatchQueue。

发生点击事件，通过上面我们知道，会触发两次 dispatchEvents，第一次是捕获阶段，第二次是冒泡阶段。

产生一次事件就会向 dispatchQueue 放入一个对象，对象中有两个状态，一个是 event ，一个是 listeners。那么这两个东西是如何来的呢？

event 是通过事件插件合成的事件源 event，在 React 事件系统中，事件源也不是原生的事件源，而是 React 自己创建的事件源对象。对于不同的事件类型，会创建不同的事件源对象。本质上是在 extractEvents 函数中，有这么一段处理逻辑：

```js
 var SyntheticEventCtor = SyntheticEvent;
 /* 针对不同的事件，处理不同的事件源 */
 switch (domEventName) {
    case 'keydown':
    case 'keyup':
      SyntheticEventCtor = SyntheticKeyboardEvent;
      break;
    case 'focusin':
      reactEventType = 'focus';
      SyntheticEventCtor = SyntheticFocusEvent;
      break;
    ....    
 }
/* 找到事件监听者，也就是我们 onClick 绑定的事件处理函数 */ 
var _listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase, accumulateTargetOnly);
/* 向 dispatchQueue 添加 event 和 listeners  */
if(_listeners.length > 0){
    var _event = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget);
    dispatchQueue.push({
        event: _event,
        listeners: _listeners
    });
}
```

如上可以看到，首先根据不同事件类型，选用不同的构造函数，通过 new 的方式去合成不同事件源对象。上面还有一个细节就是 _listeners 是什么？_listeners 本质上也是一个对象，里面有三个属性。

- currentTarget：发生事件的 DOM 元素。
- instance ： button 对应的 fiber 元素。
- listener ：一个数组，存放绑定的事件处理函数本身，上面 demo 中就是绑定给 onClick，onClickCapture 的函数。

接下来可以通过 DOM 元素找到对应的 fiber，找到元素对应的 fiber 之后，也就能找到 props 事件了。但是这里有一个细节，就是 listener 可以有多个，比如如上捕获阶段的 listener 只有一个，而冒泡阶段的 listener 有两个，这是因为 div button 上都有 onClick 事件。

当发生一次点击事件，React 会根据事件源对应的 fiber 对象，根据 return指针向上遍历，收集所有相同的事件，比如是 onClick，那就收集父级元素的所有 onClick 事件，比如是 onClickCapture，那就收集父级的所有 onClickCapture。

得到了 dispatchQueue 之后，就需要 processDispatchQueue 执行事件了，这个函数的内部会经历两次遍历：

- 第一次遍历 dispatchQueue，通常情况下，只有一个事件类型，所有 dispatchQueue 中只有一个元素。
- 接下来会遍历每一个元素的 listener，执行 listener 的时候有一个特点：

```js
/* 如果在捕获阶段执行。 */
if (inCapturePhase) {
    for (var i = dispatchListeners.length - 1; i >= 0; i--) {
      var _dispatchListeners$i = dispatchListeners[i],
          instance = _dispatchListeners$i.instance,
          currentTarget = _dispatchListeners$i.currentTarget,
          listener = _dispatchListeners$i.listener;
     
      
      if (instance !== previousInstance && event.isPropagationStopped()) {
        return;
      }
      
      /* 执行事件 */
      executeDispatch(event, listener, currentTarget);
      previousInstance = instance;
    }
  } else {
    for (var _i = 0; _i < dispatchListeners.length; _i++) {
      var _dispatchListeners$_i = dispatchListeners[_i],
          _instance = _dispatchListeners$_i.instance,
          _currentTarget = _dispatchListeners$_i.currentTarget,
          _listener = _dispatchListeners$_i.listener;
      
      if (_instance !== previousInstance && event.isPropagationStopped()) {
        return;
      }
      /* 执行事件 */
      executeDispatch(event, _listener, _currentTarget);
      previousInstance = _instance;
    }
  }
```

如上在 executeDispatch 会负责执行事件处理函数，也就是上面的 handleClick ，handleParentClick 等。这个有一个区别就是，如果是捕获阶段执行的函数，那么 listener 数组中函数，会从后往前执行，如果是冒泡阶段执行的函数，会从前往后执行，用这个模拟出冒泡阶段先子后父，捕获阶段先父后子。

还有一个细节就是如果触发了阻止冒泡事件，上述讲到事件源是 React 内部自己创建的，所以如果一个事件中执行了 e.stopPropagation ，那么事件源中就能感知得到，接下来就可以通过 event.isPropagationStopped 来判断是否阻止冒泡，如果组织，那么就会退出，这样就模拟了事件流的执行过程，以及阻止事件冒泡。

## 小结

![事件系统6](/blog/images/react/事件系统6.png)

[React17 事件机制](https://mp.weixin.qq.com/s/lCHeWE5DrbxEYIdG60aIsw)

## 问题

### Q1. 为什么要用不同的事件插件处理不同的 React 事件?

首先对于不同的事件，有不同的处理逻辑；对应的事件源对象也有所不同，React 的事件和事件源是自己合成的，所以对于不同事件需要不同的事件插件处理。
