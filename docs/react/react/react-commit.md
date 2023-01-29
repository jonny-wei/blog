# Commit 阶段

- commit 阶段具体分为那几个部分，分别做了哪些事？
- 父子组件在 commit 阶段各个部分的执行顺序是什么样的？
- 如何执行生命周期和 hooks 钩子的回调函数？
- commit 阶段如何更新的 dom 节点？

`commit`阶段的主要工作（即`Renderer`的工作流程）分为三部分：

- before mutation 阶段（执行`DOM`操作前）
- mutation 阶段（执行`DOM`操作）
- layout 阶段（执行`DOM`操作后）

在 `before mutation阶段` 之前和 `layout阶段` 之后还有一些额外工作，涉及到比如 `useEffect` 的触发、`优先级相关` 的重置、`ref` 的绑定/解绑。

## 场景分析

#### 举例一

```js
function Son(){
    React.useEffect(()=>{
        console.log('--------Son useEffect-------')
    })
    React.useLayoutEffect(()=>{
        console.log('--------Son useLayoutEffect-------')
    })
    React.useInsertionEffect(()=>{
        console.log('--------Son useInsertionEffect-------')
    })
    return <div>子组件</div>
}

function Father(){
    React.useEffect(()=>{
        console.log('--------Father useEffect-------')
    })
    React.useLayoutEffect(()=>{
        console.log('--------Father useLayoutEffect-------')
    })
    React.useInsertionEffect(()=>{
        console.log('--------Father useInsertionEffect-------')
    })
    return <div>
         <div>父组件</div>
        <Son/>
    </div>
}
```

打印顺序：

1. --------Son useInsertionEffect-------

2. --------Father useInsertionEffect-------

3. --------Son useLayoutEffect-------

4. --------Father useLayoutEffect-------

5. --------Son useEffect-------

6. --------Father useEffect-------

commit 阶段具体又分别三个小阶段，分别是 :

- `before mutation`

- ``mutation`

- `layout`

而 DOM 的改变是在 mutation 阶段进行的。那么对于 effect 钩子在 commit 阶段执行时机如下：

- useInsertionEffect 是在 mutation 阶段执行的，虽然 mutation 是更新 DOM ，但是 useInsertionEffect 是在更新 DOM 之前 。
- useLayoutEffect 是在 layout 阶段执行，此时 DOM 已经更新了。
- useEffect 是在浏览器绘制之后，异步执行的。

明白了 effect 每个钩子的执行时机 ，从上面的例子中还可以总结出，对于不同的 effect 钩子父子组件的执行顺序是：**先子后父。**

#### 举例二

```js
function Index(){
    const [ color, setColor ] = React.useState('#000')
    React.useEffect(()=>{
        console.log('--------useEffect-------')
    })
    React.useLayoutEffect(()=>{
        console.log('--------useLayoutEffect-------')
    })
    React.useInsertionEffect(()=>{
        console.log('--------useInsertionEffect-------')
    })
    return <div>
        <div id="text" style={{ color }}> hello,react </div>
        <button onClick={() => setColor('red')} >点击改变颜色</button>
    </div>
}
```

commit 阶段主要的执行函数就是 `commitRootImpl`:

```js
// react-reconciler/src/ReactFiberWorkLoop.new.js
function commitRootImpl(){

    if ((finishedWork.subtreeFlags & PassiveMask) !== NoFlags || (finishedWork.flags & PassiveMask) !== NoFlags) {
         /* 通过异步的方式处理 useEffect  */
        scheduleCallback$1(NormalPriority, function () {
            flushPassiveEffects(); 
            return null;
        });
    }

    /* BeforeMutation 阶段执行 */
    const text = document.getElementById('text')
    console.log('-----BeforeMutation 执行-------')
    commitBeforeMutationEffects(root, finishedWork);
    console.log('-----BeforeMutation 执行完毕------')
    /* Mutation 阶段执行 */
    console.log('-----Mutation 执行-----')
    if(text) console.log('颜色获取：',window.getComputedStyle(text).color)
    commitMutationEffects(root, finishedWork, lanes);
    console.log('-----Mutation 执行完毕-----')
    if(text) console.log('颜色获取：',window.getComputedStyle(text).color)
    /* Layout 阶段执行 */
    console.log('-----Layout 执行-----')
    commitLayoutEffects(finishedWork, root, lanes);
    console.log('-----Layout 执行完毕-----')
}
```

打印内容：

1. -----BeforeMutation 执行-------
2. -----BeforeMutation 执行完毕------
3. -----Mutation 执行-----
4. 颜色获取：rgb（0，0，0）
5. --------useInsertionEffect-------
6. -----Mutation 执行完毕-----
7. 颜色获取：rgb（255，0，0）
8. -----Layout 执行-----
9. --------useLayoutEffect-------
10. -----Layout 执行完毕-----
11. --------useEffect-------

可以看出，真实 DOM 改变确实在 mutation 阶段执行的，在 mutation 前后的两次打印，可以看出打印颜色的变化。

通过上面两个例子，直观地表现出在 commit 阶段的大致更新流程。

## 更新标志

在 render 阶段，会遍历 fiber 树，收集需要更新的地方，打不同的标志，这些标志的更新会在 commit 阶段执行：

- 更新相关：`Update` - 组件更新标志， `Ref` - 处理绑定元素和组件实例，
- 元素相关：`Placement` - 插入元素，`Update` - 更新元素，`ChildDeletion` - 删除元素，`Snapshot` - 元素快照，`Visibility` - offscreen 新特性，`ContentReset` - 文本内容更新。
- 更新回调，执行 effect：`Callback` - root 回调函数，类组件回调，`Passive` - useEffect 的钩子函数，`Layout` - useLayoutEffect 的钩子函数，`Insertion` - useInsertionEffect 的钩子函数。

在老版本的 React 中会形成一个 `effectList` ，然后执行 `effectList` 就可以了。在 v17 和 v18 新版本的 React ，不再用 `effectList`，而是通过`rootFiber` 自上而下的调和方式来处理这些标志。

这些标志在 commit 各种阶段被执行，看一下在具体标志的执行时机：

```js
/* Before Mutation 阶段标志 */
var BeforeMutationMask = Update | Snapshot 
/* Mutation 阶段标志 */
var MutationMask = Placement | Update | ChildDeletion | ContentReset | Ref | Visibility;
/* Layout 阶段标志 */
var LayoutMask = Update | Callback | Ref | Visibility;
/* useEffect 阶段标志 */
var PassiveMask = Passive | ChildDeletion;
```

## beforeMutation 阶段

`before mutation` 之前主要做一些变量赋值，状态重置的工作。

在 beforeMutation 阶段会做哪些事情呢？接着 commitRootImpl 中的 commitBeforeMutationEffects 中来看。

```js
// react-reconciler/src/ReactFiberCommitWork.new.js
function commitBeforeMutationEffects(root, firstChild) {
    /* root 为 fiberRoot, firstChild 为 render 阶段调和完毕的 fiber 节点。  */
    nextEffect = firstChild;
    /* 开始进入 Before Mutation 流程 */
    commitBeforeMutationEffects_begin();
}
```

`commitBeforeMutationEffects` 为 `Before Mutation` 阶段的入口函数。

- `nextEffect` 为整个 commit 阶段的将要处理的 fiber 节点，类似于 render 阶段的 `workInProgress` 。
- 接下来会执行 begin 流程。

```js
// react-reconciler/src/ReactFiberCommitWork.new.js
function commitBeforeMutationEffects_begin() {
    while (nextEffect !== null) {
        var fiber = nextEffect;
        var child = fiber.child;
        if ((fiber.subtreeFlags & BeforeMutationMask) !== NoFlags && child !== null) {
            /* 这里如果子代 fiber 树有 Before Mutation 的标志，那么把 nextEffect 赋值给子代 fiber  */
            nextEffect = child;
        } else {
            /* 找到最底层有 Before Mutation 的标志的 fiber ，执行 complete */
            commitBeforeMutationEffects_complete();
        }
    }
}
```

begin 流程解决了一个重要的问题，就是 **commit 阶段执行的生命周期** 或者 **effect 钩子为什么先子后父的**。

首先为什么是先子后父的执行呢？

本质上 commit 阶段处理的事情和 dom 元素有关系，commit 阶段生命周期是可以改变真实 dom 元素的状态的，所以如果在子组件生命周期内改变 dom 状态，并且想要在父组件的生命周期中同步状态，就需要确保父组件的生命周期执行时机要晚于子组件。

回到 begin 流程上来，begin 流程主要做了两件事：

- 如果子代 fiber 树有 `Before Mutation` 的标志，那么把 nextEffect 赋值给子代 fiber 。这里可以理解成 begin 会向下递归，找到最底部并且有此标志的 fiber 。
- 找到最底层有 `Before Mutation` 的标志的 fiber ，执行 complete 。

begin 流程本质上有上到下遍历，找到最底层的节点。接下来看一下 complete 流程：

```js
// react-reconciler/src/ReactFiberCommitWork.new.js
function commitBeforeMutationEffects_complete(){
    while (nextEffect !== null) {
        var fiber = nextEffect;
        try{
            /* 真正的处理 Before Mutation 需要做的事情。 */
            commitBeforeMutationEffectsOnFiber(fiber);
        }
        /* 优先处理兄弟节点上的 Before Mutation  */
        var sibling = fiber.sibling;
        if (sibling !== null) {
            nextEffect = sibling;
            return;
        }
        /* 如果没有兄弟节点，那么返回父级节点，继续进行如上流程。 */
        nextEffect = fiber.return;
    }
}
```

complete 的流程是向上归并的流程，首先会执行 `commitBeforeMutationEffectsOnFiber` 真正的处理 `Before Mutation` 需要做的事情。在向上归并的过程中，会先处理兄弟节点上的 `Before Mutation`，如果没有兄弟节点，那么返回父级节点，继续进行如上流程。

那么最重要的部分来了，就是 `commitBeforeMutationEffectsOnFiber` 做了什么事情：

```js
// react-reconciler/src/ReactFiberCommitWork.new.js
function commitBeforeMutationEffectsOnFiber(){
    if ((flags & Snapshot) !== NoFlags) { /* 如果有 Snapshot 标志 */
        switch (finishedWork.tag) {
            case ClassComponent:
              var snapshot = instance.getSnapshotBeforeUpdate(finishedWork.elementType === finishedWork.type ? prevProps : resolveDefaultProps(finishedWork.type, prevProps), prevState);
              instance.__reactInternalSnapshotBeforeUpdate = snapshot;
        }
    }
}
```

`commitBeforeMutationEffectsOnFiber` 主要是用来处理 Snapshot，获取 DOM 更新前的快照信息，包括类组件执行生命周期 `getSnapshotBeforeUpdate` 。到此为止，`Before Mutation` 事情执行完毕。整个过程就是遍历 effectList 并调用 commitBeforeMutationEffects 函数处理。

在`before mutation阶段`，会遍历`effectList`，依次执行：

1. 处理`DOM节点`渲染/删除后的 `autoFocus`、`blur`逻辑
2. 调用`getSnapshotBeforeUpdate`生命周期钩子
3. 调度`useEffect`

::: tip 生命周期钩子 - getSnapshotBeforeUpdate
`render阶段`的任务可能中断/重新开始，对应的组件在`render阶段`的生命周期钩子（即`componentWillXXX`）可能触发多次。为此，`React`提供了替代的生命周期钩子`getSnapshotBeforeUpdate`。`getSnapshotBeforeUpdate`是在 `commit阶段` 内的 `before mutation阶段`调用的，由于 `commit阶段` 是同步的，所以不会遇到多次调用的问题。
:::

## mutation 阶段

接下来就到了 mutation 阶段，mutation 阶段切切实实地更新了 DOM 元素，这个阶段对于整个 commit 阶段起着举足轻重的作用，mutation 的入口函数是 `commitMutationEffects` ，这个函数和 `Before Mutation` 做的事情差不多。

通过 `Before Mutation` 一下一上的操作之后，`nextEffect` 又返回的起点，接下来会和 `Before Mutation` 的操作一样，进入向下遍历，向上归并的流程，执行所有 `mutation 阶段`应该做的任务。那么我们这里对比 `Before Mutation` ，看看 Mutation 会有哪些不同点:

```js
// react-reconciler/src/ReactFiberCommitWork.new.js
function commitMutationEffects_begin(root, lanes) {
     while (nextEffect !== null) {
        var deletions = fiber.deletions;
        if (deletions !== null) {
            for (var i = 0; i < deletions.length; i++) {
                var childToDelete = deletions[i];
                commitDeletion(root, childToDelete, fiber);
            }
        }
     }

     /* 这里做的事情和 commitBeforeMutationEffects_begin 一样，找到最底层有 Mutation 的标志的 fiber ，执行 complete*/
}
```

`Mutation begin` 做的事，除了和 `BeforeMutation` 一样，找到最底层有 Mutation 的标志的 fiber ，执行 complete 外。还有一件事情就是通过调用 `commitDeletion` 来执行删除元素操作。`commitDeletion` 本质上会调用方法 `unmountHostComponents

**如果是销毁，删除真实 DOM 节点** 如果 fiber 类型是 HostComponent （dom元素节点）HostText 文本元素节点。会走如下逻辑：

```js
if (node.tag === HostComponent || node.tag === HostText) {
      /* 省去一些逻辑，这里调用真实 DOM 操作方法，删除 DOM 元素。 */
      currentParent.removeChild(node.stateNode);
}
```

如果是 DOM 元素，那么会调用 removeChild 方法，删除 DOM 元素。如果其他类型的 fiber ，会调用 commitUnmount 方法。我们看一下 commitUnmount 会做些什么事情。

```js
switch (current.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent:
       do {
           /* 函数组件执行所有 effect 的， */
            if (destroy !== undefined) {
                if ((tag & Insertion) !== NoFlags$1) {
                    /* 执行 useInsertionEffect 的 destroy */
                  safelyCallDestroy(current, nearestMountedAncestor, destroy);
                }else if((tag & Layout) !== NoFlags$1){
                   /* 执行 useLayoutEffect 的 destroy  */ 
                   safelyCallDestroy(current, nearestMountedAncestor, destroy);
                }
            }
           
       }      
}
```

**如果是销毁，执行 destroy 函数** 对于函数组件，commitUnmount 会执行所有 useInsertionEffect 和 useLayoutEffect 销毁函数 destroy。

**如果是销毁，置空 ref**

```js
  case ClassComponent:
    {
        /* 清空 ref  */
        safelyDetachRef(current, nearestMountedAncestor);
        var instance = current.stateNode;
        if (typeof instance.componentWillUnmount === 'function') {
          /* 调用类组件生命周期 componentWillUnmount  */
          safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance);
        }
        return;
    }
```

对于类组件，commitUnmount 会清空 ref 对象，如果有生命周期 componentWillUnmount ，会调用该生命周期。

在 Mutation 的 begin 里面会做这么些操作，接下来在 complete 函数里会做同样的事情，优先处理兄弟节点，最后处理父节点，然后分别调用 commitMutationEffectsOnFiber。那么这个函数又做了哪些事情呢？

commitMutationEffectsOnFiber 做的事情比较重要，这里重点分了几个部分：

```js
function commitMutationEffectsOnFiber(){
  /* 如果是文本节点，那么重置节点内容 */  
  if (flags & ContentReset) {
    commitResetTextContent(finishedWork);
  }
  /* 如果是 ref 更新，那么重置 alternate 属性上的 ref */
  if (flags & Ref) {
    var current = finishedWork.alternate;
    if (current !== null) {
      commitDetachRef(current);
    }
  }
  if(flags & Visibility){
      /* 这一块和 v18 新属性有关，下面会介绍 */
  }

  var primaryFlags = flags & (Placement | Update );
  switch (primaryFlags) {
    /* 如果新插入节点 */
    case Placement:
      { 
        commitPlacement(finishedWork); 

        finishedWork.flags &= ~Placement;
        break;
      }
    /* ... 省去其他的相关逻辑 */  
    /* 对于更新会有 Update */
    case Update:
      {
        var _current5 = finishedWork.alternate;
        commitWork(_current5, finishedWork);
        break;
      }  
}
```

commitMutationEffectsOnFiber 阶段主要做的事情很多，这里列举了几个非常重要的节点，对于 ContentReset ，执行 commitResetTextContent 置空文本节点的内容。

```js
// node 为 stateNode 属性，为 fiber 元素的真实节点。
var firstChild = node.firstChild;

if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
    firstChild.nodeValue = '';
    return;
}
```

**置空文本节点和 ref 属性** 对于文本节点，会先做准备工作，会置空文本节点的内容。对于 ref 属性，也会调用 commitDetachRef，做更新前的重置 ref。commitDetachRef 在 ref 章节，已经讲解了，这里就不赘述了。

```js
if (current !== null) {
    commitDetachRef(current);
}
```

那么如果是插入新的 fiber 节点，会调用 commitPlacement 。commitPlacement 做了些什么事情呢？

```js
function commitPlacement(finishedWork){
    /* 获取父级 fiber */
    var parentFiber = getHostParentFiber(finishedWork);
    switch (parentFiber.tag) {
        /* 如果节点类型是元素类型，比如 div */
        case HostComponent:
           /* 获取下一个兄弟节点 */
           var before = getHostSibling(finishedWork); 
           /* 执行 insertOrAppendPlacementNode，插入节点。 */
           insertOrAppendPlacementNode(finishedWork, before, parent);
    }
}
```

可以看出 commitPlacement 主要找到当前元素的父级和兄弟 fiber，然后执行 insertOrAppendPlacementNode ，这个方法做了如下事情。

**插入元素节**

```js
if (before) {
    insertBefore(parent, stateNode, before);
} else {
    appendChild(parent, stateNode);
}
```

如果有兄弟节点，那么在调用 insertBefore 往兄弟节点之前插入就可以了。如果没有之后的兄弟节点，说明需要插入最后一个子节点，那么调用 appendChild 插入节点就可以了。最后对于更新节点，调用 commitWork 就可以了。

```js
function commitWork(current, finishedWork) {
    switch (finishedWork.tag) {
        case FunctionComponent:
        case ForwardRef:
        case MemoComponent:
        case SimpleMemoComponent:
            /* 先执行上一次 useInsertionEffect 的 destroy */
            commitHookEffectListUnmount(Insertion | HasEffect, finishedWork, finishedWork.return);
            /* 执行 useInsertionEffect 的 create  */
            commitHookEffectListMount(Insertion | HasEffect, finishedWork);
        case HostComponent:
            /* 元素节点会执行 commitUpdate */
            if (updatePayload !== null) {
                commitUpdate(instance, updatePayload, type, oldProps, newProps);
            }    
        case HostText: 
            /* 文本节点更新 */
            commitTextUpdate(textInstance, oldText, newText);
            return
    }
}
```

**执行 hooks useInsertionEffect** 可以看到 commitWork 对于函数组件会执行 hooks useInsertionEffect，也就证实了 useInsertionEffect 是在 Mutation 阶段执行的。

在 effect 的执行特点上，所有的 effect hooks，会先执行上一个次 destroy 函数，然后再调用本次的 create 函数，这就比如在 effect 里面绑定事件监听器，如果绑定新的监听器，需要先解绑老的监听器。

**更新文本节点** 上面说到了文本节点已经重置，接下来会调用 commitTextUpdate 来更新文本节点的 nodeValue 属性。

**更新元素节点** 对于元素的更新，本质上调用 commitUpdate ，在 commitUpdate 会更新元素的属性，比如 style 等内容。

```js
if (propKey === STYLE) {
    /* 更新 style 信息。 */
      setValueForStyles(domElement, propValue);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
    /* 更新 innerHTML 。 */
      setInnerHTML(domElement, propValue);
    } else if (propKey === CHILDREN) {
    /* 更新 nodeValue 属性 */  
      setTextContent(domElement, propValue);
    } else {
    /* 更新元素的 props  */    
      setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
}
```

commitUpdate 主要负责更新元素的状态，到此为止，Mutation 阶段执行完毕。commitMutationEffects 会遍历 effectList，对每个 Fiber 节点执行如下三个操作：

- 根据 ContentReset effectTag 重置文字节点
- 更新 ref
- 根据 effectTag 分别处理，其中 effectTag 包括(Placement | Update | Deletion | Hydrating)

## layout 阶段

接下来到了 layout 阶段，Mutation 阶段做了些真实的 DOM 操作，比如元素删除，元素更新，元素添加等操作，那么 layout 阶段，已经能够获取更新之后的 DOM 元素。该阶段的代码都是在`DOM`渲染完成（`mutation阶段`完成）后执行的。该阶段触发的生命周期钩子和`hook`可以直接访问到已经改变后的`DOM`，即该阶段是可以参与`DOM layout`的阶段。

在执行完 commitMutationEffects 之后，会执行 commitLayoutEffects ，这个方法做的事情和 Mutation 阶段一样。接下来也会走 begin 和 complete 流程。

```js
function commitLayoutEffects_begin(){
    while (nextEffect !== null) {
        if ( fiber.tag === OffscreenComponent && isModernRoot) {
            /* 对于 OffscreenComponent 逻辑 */
        }
    }
}
```

Layout 的 begin 流程和 Mutation 差不多，重点就是 Offscreen 处理逻辑，在接下来章节会讲到。Layout 阶段 complete 也没有特殊处理。

重点就是 Layout 阶段的 commitLayoutEffectOnFiber 函数。这个函数非常重要，主要看一下 commitLayoutEffectOnFiber 做了哪些事情？

```js
// react-reconciler/src/ReactFiberCommitWork.new.js
function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork, committedLanes) {
    if ((finishedWork.flags & LayoutMask) !== NoFlags) {
        switch (finishedWork.tag) {
            /* 对于函数组件，执行  useLayoutEffect */
            case FunctionComponent:
            case ForwardRef:
            case SimpleMemoComponent:
                commitHookEffectListMount(Layout | HasEffect, finishedWork);
            /* 对于类组件，如果初始化会执行 d，如果更新会执行 componentDidUpdate  */    
            case ClassComponent:
                var instance = finishedWork.stateNode;
                if (finishedWork.flags & Update) {
                    if (current === null) {
                        /* 执行 componentDidMount 生命周期 */
                        instance.componentDidMount();
                    }else{
                        /* 执行 componentDidUpdate 生命周期 */
                        instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate);
                    }
                }
                var updateQueue = finishedWork.updateQueue;
                /* 如果有 setState 的 callback ，执行回调函数。 */
                if (updateQueue !== null) {
                    commitUpdateQueue(finishedWork, updateQueue, instance);
                }                   
    }
    if (finishedWork.flags & Ref) {
        /* 更新 ref 属性 */
        commitAttachRef(finishedWork);
    }
}
```

commitLayoutEffectOnFiber 做了非常重要的事：

- 首先对于函数组件，执行 useLayoutEffect。
- 对于类组件，如果初始化会执行 componentDidMount，如果更新会执行 componentDidUpdate。如果类组件触发 setState 并且有第二个参数 callback，那么这些 callback 会被放进 updateQueue 中，那么接下来会通过 commitUpdateQueue 执行每个 callback 回调函数。
- 接下来会更新 ref 属性。

整个 Layout 阶段就结束了，Layout 阶段主要是执行回调函数，比如 setState 的 callback 和生命周期等，还有比如 useLayoutEffect 的钩子就是在这里执行。

从 Fiber 的双缓冲机制中可以得知，`workInProgress Fiber树` 在 `commit阶段` 完成渲染后会变为 `current Fiber树`。在 `mutation阶段` 结束后，`layout阶段`开始前会切换 `fiberRootNode` 指向的 `current Fiber树`。

- `componentWillUnmount` 会在 `mutation阶段` 执行，此时 `current Fiber树` 还指向前一次更新的 `Fiber树`，在生命周期钩子内获取的`DOM`还是更新前的。

- `componentDidMount` 和 `componentDidUpdate`会在 `layout阶段` 执行，此时 `current Fiber树` 已经指向更新后的 `Fiber树`，在生命周期钩子内获取的 `DOM` 就是更新后的。

`layout阶段`会遍历 `effectList`，依次执行 `commitLayoutEffects`。该方法的主要工作为根据 `effectTag`调用不同的处理函数处理`Fiber`并更新`ref`。

## useEffect 执行

对于 useEffect 处理，主要在 commitRootImpl 开始的时候通过 flushPassiveEffects 来执行了，但是细心的同学可以发现，flushPassiveEffects 是在 scheduleCallback 中执行的。

scheduleCallback 是采用异步模式下进行的，所以 useEffect 的钩子函数是在异步条件下执行的。

flushPassiveEffects 本质上会调用 flushPassiveEffectsImpl 。 flushPassiveEffectsImpl 内部会执行 commitPassiveMountEffects 。

commitPassiveMountEffects 会通过 begin ，complete 来从上到下找到最底部 fiber ，然后再从下到上执行 fiber 树上的所有的 effect，最后再执行 commitPassiveMountOnFiber。

```js
// react-reconciler/src/ReactFiberCommitWork.new.js
function commitPassiveMountOnFiber(finishedRoot, finishedWork) {
    switch (finishedWork.tag) {
        case FunctionComponent:
        case ForwardRef:
        case SimpleMemoComponent:
           commitHookEffectListMount(Passive$1 | HasEffect, finishedWork);
    }    
}
```

- commitPassiveMountOnFiber 如果是函数组件，会通过 commitHookEffectListMount 执行所有的 useEffect 钩子函数。

那么最后看一下 commitHookEffectListMount 做了哪些事情：

```js
// react-reconciler/src/ReactFiberCommitWork.new.js
function commitHookEffectListMount(flags, finishedWork) {
    var updateQueue = finishedWork.updateQueue;
    var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
        var firstEffect = lastEffect.next;
        var effect = firstEffect;
        do {
            if ((effect.tag & flags) === flags) {
                var create = effect.create;
                /* 执行 effect hooks 钩子函数，得到 destroy 函数 */
                effect.destroy = create();
            }
        }
    }
}
```

![commit1](/blog/images/react/commit1.png)

## 问题

### Q1. useEffect 如何被异步调度？为什么要异步（而不是同步）调度？

整个`useEffect`异步调用分为三步：

1. `before mutation阶段`在`scheduleCallback`中调度`flushPassiveEffects`
2. `layout阶段`之后将`effectList`赋值给`rootWithPendingPassiveEffects`
3. `scheduleCallback`触发`flushPassiveEffects`，`flushPassiveEffects`内部遍历`rootWithPendingPassiveEffects`

与 componentDidMount、componentDidUpdate 不同的是，在浏览器完成布局与绘制之后，传给 useEffect 的函数会延迟调用。这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因此不应在函数中执行阻塞浏览器更新屏幕的操作。可见，`useEffect`异步执行的原因主要是防止同步执行时阻塞浏览器渲染。
