# React 生命周期

React 类组件为开发者提供了一些生命周期钩子函数，能让开发者在 React 执行的重要阶段，在钩子函数里做一些该做的事。自从 React Hooks 问世以来，函数组件也能优雅地使用 Hooks ，弥补函数组件没有生命周期的缺陷。

## 类组件生命周期

React 两个重要阶段，render 阶段和 commit 阶段，React 在调和( render )阶段会深度遍历 React fiber 树，目的就是发现不同( diff )，不同的地方就是接下来需要更新的地方，对于变化的组件，就会执行 render 函数。在一次调和过程完毕之后，就到了commit 阶段，commit 阶段会创建修改真实的 DOM 节点。

如果在一次调和的过程中，发现了一个 fiber tag = 1 类组件的情况，就会按照类组件的逻辑来处理。对于类组件的处理逻辑，首先判断类组件是否已经被创建过

```js
// react-reconciler/src/ReactFiberBeginWork.js
/* workloop React 处理类组件的主要功能方法 */
function updateClassComponent(){
    let shouldUpdate
    const instance = workInProgress.stateNode // stateNode 是 fiber 指向 类组件实例的指针。
     if (instance === null) { // instance 为组件实例,如果组件实例不存在，证明该类组件没有被挂载过，那么会走初始化流程
        constructClassInstance(workInProgress, Component, nextProps); // 组件实例将在这个方法中被new。
        mountClassInstance(  workInProgress,Component, nextProps,renderExpirationTime ); //初始化挂载组件流程
        shouldUpdate = true; // shouldUpdate 标识用来证明 组件是否需要更新。
     }else{  
        shouldUpdate = updateClassInstance(current, workInProgress, Component, nextProps, renderExpirationTime) // 更新组件流程
     }
     if(shouldUpdate){
         nextChildren = instance.render(); /* 执行render函数 ，得到子节点 */
        reconcileChildren(current,workInProgress,nextChildren,renderExpirationTime) /* 继续调和子节点 */
     }
}
```

几个重要概念：

1. instance 类组件对应实例。
2. workInProgress 树，当前正在调和的 fiber 树 ，一次更新中，React 会自上而下深度遍历子代 fiber ，如果遍历到一个 fiber ，会把当前 fiber 指向 workInProgress。
3. current 树，在初始化更新中，current = null ，在第一次 fiber 调和之后，会将 workInProgress 树赋值给 current 树。React 来用 workInProgress 和 current 来确保一次更新中，快速构建，并且状态不丢失。
4. Component 就是项目中的 class 组件。
5. nextProps 作为组件在一次更新中新的 props 。
6. renderExpirationTime 作为下一次渲染的过期时间。

在组件实例上可以通过 _reactInternals 属性来访问组件对应的 fiber 对象。在 fiber 对象上，可以通过 stateNode 来访问当前 fiber 对应的组件实例。

## React 类组件生命周期执行过程

React 的大部分生命周期的执行，都在 mountClassInstance 和updateClassInstance 这两个方法中执行，把流程简化成 mount (初始化渲染) 和 update (更新)两个方向。从组件初始化，组件更新 ， 组件销毁 ，三大阶段分析。

### 初始化阶段

#### constructor 执行

在 mount 阶段，首先执行的 constructClassInstance 函数，用来实例化 React 组件，组件中 constructor 就是在这里执行的。在实例化组件之后，会调用 mountClassInstance 组件初始化。

```js
function mountClassInstance(workInProgress,ctor,newProps,renderExpirationTime){
    const instance = workInProgress.stateNode;
     const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  if (typeof getDerivedStateFromProps === 'function') { /* ctor 就是我们写的类组件，获取类组件的静态方法 */
     const partialState = getDerivedStateFromProps(nextProps, prevState); /* 这个时候执行 getDerivedStateFromProps 生命周期 ，得到将合并的state */
     const memoizedState = partialState === null || partialState === undefined ? prevState : Object.assign({}, prevState, partialState); // 合并state
     workInProgress.memoizedState = memoizedState;
     instance.state = workInProgress.memoizedState; /* 将state 赋值给我们实例上，instance.state  就是我们在组件中 this.state获取的state*/
  }
  if(typeof ctor.getDerivedStateFromProps !== 'function' &&   typeof instance.getSnapshotBeforeUpdate !== 'function' && typeof instance.componentWillMount === 'function' ){
      instance.componentWillMount(); /* 当 getDerivedStateFromProps 和 getSnapshotBeforeUpdate 不存在的时候 ，执行 componentWillMount*/
  }
}
```

#### getDerivedStateFromProps 执行

在初始化阶段，getDerivedStateFromProps 是第二个执行的生命周期，值得注意的是它是从 ctor 类上直接绑定的静态方法，传入 props ，state 。 返回值将和之前的 state 合并，作为新的 state ，传递给组件实例使用。

#### componentWillMount 执行

如果存在 getDerivedStateFromProps 和 getSnapshotBeforeUpdate 就不会执行生命周期componentWillMount。

#### render 函数执行

到此为止 mountClassInstancec 函数完成，但是上面 updateClassComponent 函数， 在执行完 mountClassInstancec 后，执行了 render 渲染函数，形成了 children ， 接下来 React 调用 reconcileChildren 方法深度调和 children 。

#### componentDidMount执行

细心的同学可能发现，生命周期 componentDidMount 还没有出现，那么 componentDidMount 是如何执行的呢？上文中简单介绍了 render 和 commit 两个阶段，上述提及的几生命周期都是在 render 阶段执行的。一旦 React 调和完所有的 fiber 节点，就会到 commit 阶段，在组件初始化 commit 阶段，会调用 componentDidMount 生命周期。

```js
// react-reconciler/src/ReactFiberCommitWork.js
function commitLifeCycles(finishedRoot,current,finishedWork){
     switch (finishedWork.tag){                             /* fiber tag 在第一节讲了不同fiber类型 */
        case ClassComponent: {                              /* 如果是 类组件 类型 */
             const instance = finishedWork.stateNode        /* 类实例 */
             if(current === null){                          /* 类组件第一次调和渲染 */
                instance.componentDidMount() 
             }else{                                         /* 类组件更新 */
                instance.componentDidUpdate(prevProps,prevState，instance.__reactInternalSnapshotBeforeUpdate); 
             }
        }
     }
}
```

从上面可以直观看到 componentDidMount 执行时机 和 componentDidUpdate 执行时机是相同的 ，只不过一个是针对初始化，一个是针对组件再更新。到此初始化阶段，生命周期执行完毕。

执行顺序：`constructor -> getDerivedStateFromProps / componentWillMount -> render -> componentDidMount`

![类组件生命周期过程](/blog/images/react/类组件生命周期过程.png)

### 更新阶段

类组件的更新阶段，到底会执行那些生命周期函数呢，回到了最开始 updateClassComponent 函数了，当发现 current 不为 null 的情况时，说明该类组件被挂载过，那么直接按照更新逻辑来处理。

```js
// react-reconciler/src/ReactFiberClassComponent.js
function updateClassInstance(current,workInProgress,ctor,newProps,renderExpirationTime){
    const instance = workInProgress.stateNode; // 类组件实例
    const hasNewLifecycles =  typeof ctor.getDerivedStateFromProps === 'function'  // 判断是否具有 getDerivedStateFromProps 生命周期
    if(!hasNewLifecycles && typeof instance.componentWillReceiveProps === 'function' ){
         if (oldProps !== newProps || oldContext !== nextContext) {     // 浅比较 props 不相等
            instance.componentWillReceiveProps(newProps, nextContext);  // 执行生命周期 componentWillReceiveProps 
         }
    }
    let newState = (instance.state = oldState);
    if (typeof getDerivedStateFromProps === 'function') {
        ctor.getDerivedStateFromProps(nextProps,prevState)  /* 执行生命周期getDerivedStateFromProps  ，逻辑和mounted类似 ，合并state  */
        newState = workInProgress.memoizedState;
    }   
    let shouldUpdate = true
    if(typeof instance.shouldComponentUpdate === 'function' ){ /* 执行生命周期 shouldComponentUpdate 返回值决定是否执行render ，调和子节点 */
        shouldUpdate = instance.shouldComponentUpdate(newProps,newState,nextContext,);
    }
    if(shouldUpdate){
        if (typeof instance.componentWillUpdate === 'function') {
            instance.componentWillUpdate(); /* 执行生命周期 componentWillUpdate  */
        }
    }
    return shouldUpdate
}
```

#### 执行生命周期 componentWillReceiveProps

首先判断 getDerivedStateFromProps 生命周期是否存在，如果不存在就执行componentWillReceiveProps生命周期。传入该生命周期两个参数，分别是 newProps 和 nextContext 。

#### 执行生命周期 getDerivedStateFromProps

接下来执行生命周期getDerivedStateFromProps， 返回的值用于合并state，生成新的state。

#### 执行生命周期 shouldComponentUpdate

接下来执行生命周期shouldComponentUpdate，传入新的 props ，新的 state ，和新的 context ，返回值决定是否继续执行 render 函数，调和子节点。这里应该注意一个问题，getDerivedStateFromProps 的返回值可以作为新的 state ，传递给 shouldComponentUpdate 。

#### 执行生命周期 componentWillUpdate

接下来执行生命周期 componentWillUpdate。updateClassInstance 方法到此执行完毕了。

#### 执行 render 函数

接下来会执行 render 函数，得到最新的 React element 元素。然后继续调和子节点。

#### 执行 getSnapshotBeforeUpdate

```js
function commitBeforeMutationLifeCycles(current,finishedWork){
     switch (finishedWork.tag) {
          case ClassComponent:{
               const snapshot = instance.getSnapshotBeforeUpdate(prevProps,prevState) /* 执行生命周期 getSnapshotBeforeUpdate   */
                instance.__reactInternalSnapshotBeforeUpdate = snapshot; /* 返回值将作为 __reactInternalSnapshotBeforeUpdate 传递给 componentDidUpdate 生命周期  */
          }
     }
}
```

`getSnapshotBeforeUpdate` 的执行也是在 commit 阶段，commit 阶段细分为 `before Mutation`( DOM 修改前)，Mutation ( DOM 修改)，Layout( DOM 修改后) 三个阶段，`getSnapshotBeforeUpdate`发生在 `before Mutation` 阶段，生命周期的返回值，将作为第三个参数 `__reactInternalSnapshotBeforeUpdate` 传递给 `componentDidUpdate` 。

#### 执行 componentDidUpdate

接下来执行生命周期 componentDidUpdate ，此时 DOM 已经修改完成。可以操作修改之后的 DOM 。到此为止更新阶段的生命周期执行完毕。

![类组件更新生命周期](/blog/images/react/类组件更新生命周期.png)

更新阶段对应的生命周期的执行顺序：

`componentWillReceiveProps( props 改变) / getDerivedStateFromProp -> shouldComponentUpdate -> componentWillUpdate -> render -> getSnapshotBeforeUpdate -> componentDidUpdate`

### 销毁阶段

```js
function callComponentWillUnmountWithTimer(){
    instance.componentWillUnmount();
}
```

#### 执行生命周期 componentWillUnmount

销毁阶段就比较简单了，在一次调和更新中，如果发现元素被移除，就会打对应的 Deletion 标签 ，然后在 commit 阶段就会调用 componentWillUnmount 生命周期，接下来统一卸载组件以及 DOM 元素。

### 类组件生命周期总览

![生命周期总览](/blog/images/react/生命周期总览.png)

## 各阶段生命周期的功能

上面介绍了 React 各生命周期的执行时机和执行顺序。下面介绍一下各个 lifecycle 能做些什么？

### constructor

React 在不同时期抛出不同的生命周期钩子，也就意味这这些生命周期钩子的使命。上面讲过 constructor 在类组件创建实例时调用，而且初始化的时候执行一次，所以可以在 constructor 做一些初始化的工作。

```js
constructor(props){
    super(props)        // 执行 super ，别忘了传递props,才能在接下来的上下文中，获取到props。
    this.state={       //① 可以用来初始化state，比如可以用来获取路由中的
        name:'alien'
    }
    this.handleClick = this.handleClick.bind(this) /* ② 绑定 this */
    this.handleInputChange = debounce(this.handleInputChange , 500) /* ③ 绑定防抖函数，防抖 500 毫秒 */
    const _render = this.render
    this.render = function(){
        return _render.bind(this)  /* ④ 劫持修改类组件上的一些生命周期 */
    }
}
/* 点击事件 */
handleClick(){ /* ... */ }
/* 表单输入 */
handleInputChange(){ /* ... */ }
```

constructor 作用：

- 初始化 state ，比如可以用来截取路由中的参数，赋值给 state 。
- 对类组件的事件做一些处理，比如绑定 this ， 节流，防抖等。
- 对类组件进行一些必要生命周期的劫持，渲染劫持，这个功能更适合反向继承的 HOC ，在 HOC 环节，会详细讲解反向继承这种模式。[React HOC](/react/warmup/react-hoc.html)

### getDerivedStateFromProps

```js
getDerivedStateFromProps(nextProps,prevState)
```

两个参数：

- nextProps 父组件新传递的 props ;
- prevState 传入 getDerivedStateFromProps 待合并的 state 。

getDerivedStateFromProps 方法作为类的静态属性方法执行，内部是访问不到 this 的，它更趋向于纯函数，从源码中就能够体会到 React 对该生命周期定义为取缔 componentWillMount 和 componentWillReceiveProps 。

这个生命周期用于，在初始化和更新阶段，接受父组件的 props 数据， 可以对 props 进行格式化，过滤等操作，返回值将作为新的 state 合并到 state 中，供给视图渲染层消费。

从源码中可以看到，只要组件更新，就会执行 getDerivedStateFromProps，不管是 props 改变，还是 setState ，或是 forceUpdate 。

```js
static getDerivedStateFromProps(newProps){
    const { type } = newProps
    switch(type){
        case 'fruit' : 
        return { list:['苹果','香蕉','葡萄' ] } /* ① 接受 props 变化 ， 返回值将作为新的 state ，用于 渲染 或 传递给s houldComponentUpdate */
        case 'vegetables':
        return { list:['菠菜','西红柿','土豆']}
    }
}
render(){
    return <div>{ this.state.list.map((item)=><li key={item} >{ item  }</li>) }</div>
}
```

getDerivedStateFromProps 作用：

- 代替 componentWillMount 和 componentWillReceiveProps
- 组件初始化或者更新时，将 props 映射到 state。
- 返回值与 state 合并完，可以作为 shouldComponentUpdate 第二个参数 newState ，可以判断是否渲染组件。(请不要把 getDerivedStateFromProps 和 shouldComponentUpdate 强行关联到一起，两者没有必然联系)

### componentWillMount 和 UNSAFE_componentWillMount

在 React V16.3 `componentWillMount` ，`componentWillReceiveProps` ， `componentWillUpdate` 三个生命周期加上了不安全的标识符 `UNSAFE`，变成了如下形式，在目前最新的版本 `React V17.0.2` 也没有废弃这三个生命周期。可能不久之后更高级的版本会被废除吧，首先先来看一下为什么要加 `UNSAFE`，首先根据源码，大家有没有发现一个问题，就是这三个生命周期，都是在 render 之前执行的，React 对于执行 render 函数有着像 shouldUpdate 等条件制约，但是对于执行在 render 之前生命周期没有限制，存在一定隐匿风险，如果 `updateClassInstance` 执行多次，React 开发者滥用这几个生命周期，可能导致生命周期内的上下文多次被执行。

- UNSAFE_componentWillMount
- UNSAFE_componentWillReceiveProps
- UNSAFE_componentWillUpdate

`UNSAFE_componentWillMount` 的作用还是做一些初始化操作，但是不建议在这个生命周期写，毕竟未来 React 可能完全取缔它。

### omponentWillReceiveProps 和 UNSAFE_componentWillReceiveProps

`UNSAFE_componentWillReceiveProps` 函数的执行是在更新组件阶段，该生命周期执行驱动是因为父组件更新带来的 props 修改，但是只要父组件触发 render 函数，调用 `React.createElement` 方法，那么 props 就会被重新创建，生命周期 `componentWillReceiveProps` 就会执行了。这就解释了即使 props 没变，该生命周期也会执行。

`componentWillReceiveProps` 可以用来干什么

```js
UNSAFE_componentWillReceiveProps(newProps){
        const { type } = newProps
        console.log('父组件render执行') /*  ① 监听父组件执行render  */
        setTimeout(()=>{  /* ② 异步控制props改变，派生出来的 state 的修改  */
            switch(type){
                case 'fruit' : 
                this.setState({list:['苹果','香蕉','葡萄' ] }) 
                break
                case 'vegetables':
                this.setState({list:['苹果','香蕉','葡萄' ] }) 
                break
            }
        },0)
}
```

- `componentWillReceiveProps` 可以用来监听父组件是否执行 render 。
- `componentWillReceiveProps` 可以用来接受 props 改变，组件可以根据 props 改变，来决定是否更新 state ，因为可以访问到 this ， 所以可以在异步成功回调(接口请求数据)改变 state 。这个是 `getDerivedStateFromProps` 不能实现的。

不建议用这种方式，props 改变，再触发 `componentWillReceiveProps` 异步请求数据渲染，这样首先在没做优化前提下会带来两次子组件的更新，第一次 props 改变，第二次 props 改变，异步改变state 。其次该生命周期的不安全性。再者需要在该生命周期内部，设置大量的条件判断语句，通过 this.props ， nextProps 判断 props 到底改变与否。所以完全可以换一种思路，那就是状态提升，把数据层完全托管父组件，子组件没有副作用，只负责渲染父组件传递的 props 即可。

当 props 不变的前提下， PureComponent 组件能否阻止 `componentWillReceiveProps` 执行？

答案是否定的，`componentWillReceiveProps` 生命周期的执行，和纯组件没有关系，纯组件是在 `componentWillReceiveProps` 执行之后浅比较 props 是否发生变化。所以 PureComponent 下不会阻止该生命周期的执行。

### componentWillUpdate 和 UNSAFE_componentWillUpdate

`UNSAFE_componentWillUpdate` 可以意味着在更新之前，此时的 DOM 还没有更新。在这里可以做一些获取 DOM 的操作。就比如说在一次更新中，保存 DOM 之前的信息(记录上一次位置)。但是 React 已经出了新的生命周期 `getSnapshotBeforeUpdate` 来代替 `UNSAFE_componentWillUpdate`。

```js
UNSAFE_componentWillUpdate(){
    const position = this.getPostion(this.node) /* 获取元素节点 node 位置 */
}
```

作用：获取组件更新之前的状态。比如 DOM 元素位置等。

### render

所谓 render 函数，就是 jsx 的各个元素被 React.createElement 创建成 React element 对象的形式。一次 render 的过程，就是创建 React.element 元素的过程。那么可以在 render 里面做一些,createElement创建元素 , cloneElement 克隆元素 ，React.children 遍历 children 的操作。

### getSnapshotBeforeUpdate

```js
getSnapshotBeforeUpdate(prevProps,preState){}
```

- prevProps更新前的props
- prevState更新前的state

获取更新前 DOM 的状态。该生命周期是在 commit 阶段的before Mutation ( DOM 修改前)，此时 DOM 还没有更新，但是在接下来的 Mutation 阶段会被替换成真实 DOM 。此时是获取 DOM 信息的最佳时期，getSnapshotBeforeUpdate 将返回一个值作为一个snapShot(快照)，传递给 componentDidUpdate作为第三个参数。

getSnapshotBeforeUpdate 这个生命周期意义就是配合componentDidUpdate 一起使用，计算形成一个 snapShot 传递给 componentDidUpdate 。保存一次更新前的信息。

### componentDidUpdate

```js
componentDidUpdate(prevProps, prevState, snapshot){
    const style = getComputedStyle(this.node)
    const newPosition = { /* 获取元素最新位置信息 */
        cx:style.cx,
        cy:style.cy
    }
}
```

- prevProps 更新之前的 props ；
- prevState 更新之前的 state ；
- snapshot 为 getSnapshotBeforeUpdate 返回的快照，可以是更新前的 DOM 信息。

作用

- componentDidUpdate 生命周期执行，此时 DOM 已经更新，可以直接获取 DOM 最新状态。这个函数里面如果想要使用 setState ，一定要加以限制，否则会引起无限循环。
- 接受 getSnapshotBeforeUpdate 保存的快照信息。

### componentDidMount

componentDidMount 生命周期执行时机和 componentDidUpdate 一样，一个是在初始化，一个是组件更新。此时 DOM 已经创建完，既然 DOM 已经创建挂载，就可以做一些基于 DOM 操作，DOM 事件监听器。

```js
async componentDidMount(){
    this.node.addEventListener('click',()=>{
        /* 事件监听 */
    }) 
    const data = await this.getData() /* 数据请求 */
}
```

作用：

- 可以做一些关于 DOM 操作，比如基于 DOM 的事件监听器。
- 对于初始化向服务器请求数据，渲染视图，这个生命周期也是蛮合适的。

### shouldComponentUpdate

```js
shouldComponentUpdate(newProps,newState,nextContext){}
```

shouldComponentUpdate 三个参数，第一个参数新的 props ，第二个参数新的 state ，第三个参数新的 context 。

这个生命周期，一般用于性能优化，shouldComponentUpdate 返回值决定是否重新渲染的类组件。需要重点关注的是第二个参数 newState ，如果有 getDerivedStateFromProps 生命周期 ，它的返回值将合并到 newState ，供 shouldComponentUpdate 使用。

```js
shouldComponentUpdate(newProps,newState){
    if(newProps.a !== this.props.a ){ /* props中a属性发生变化 渲染组件 */
        return true
    }else if(newState.b !== this.props.b ){ /* state 中b属性发生变化 渲染组件 */
        return true
    }else{ /* 否则组件不渲染 */
        return false
    }
}
```

### componentWillUnmount

componentWillUnmount 是组件销毁阶段唯一执行的生命周期，主要做一些收尾工作，比如清除一些可能造成内存泄漏的定时器，延时器，或者是一些事件监听器。

```js
componentWillUnmount(){
    clearTimeout(this.timer)  /* 清除延时器 */
    this.node.removeEventListener('click',this.handerClick) /* 卸载事件监听器 */
}
```

作用

清除延时器，定时器。
一些基于 DOM 的操作，比如事件监听器。

## 函数组件生命周期

React hooks也提供了 api ，用于弥补函数组件没有生命周期的缺陷。其原理主要是运用了 hooks 里面的 useEffect 和 useLayoutEffect。

### useEffect

```js
useEffect(()=>{
    return destory
},dep)
```

- useEffect 第一个参数 callback, 返回的 destory ， destory 作为下一次callback执行之前调用，用于清除上一次 callback 产生的副作用。
- 第二个参数作为依赖项，是一个数组，可以有多个依赖项，依赖项改变，执行上一次callback 返回的 destory ，和执行新的 effect 第一个参数 callback 。

对于 useEffect 执行， React 处理逻辑是采用异步调用 ，对于每一个 effect 的 callback， React 会向 setTimeout回调函数一样，放入任务队列，等到主线程任务完成，DOM 更新，js 执行完成，视图绘制完毕，才执行。所以 effect 回调函数不会阻塞浏览器绘制视图。

### useLayoutEffect

useLayoutEffect 和 useEffect 不同的地方是采用了同步执行，那么和useEffect有什么区别呢？

首先 useLayoutEffect 是在 DOM 更新之后，浏览器绘制之前，这样可以方便修改 DOM，获取 DOM 信息，这样浏览器只会绘制一次，如果修改 DOM 布局放在 useEffect ，那 useEffect 执行是在浏览器绘制视图之后，接下来又改 DOM ，就可能会导致浏览器再次回流和重绘。而且由于两次绘制，视图上可能会造成闪现突兀的效果。

useLayoutEffect callback 中代码执行会阻塞浏览器绘制。

### useEffect 与 useLayoutEffect 区别

一句话概括如何选择 useEffect 和 useLayoutEffect ：修改 DOM ，改变布局就用 useLayoutEffect ，其他情况就用 useEffect 。

React.useEffect 回调函数 和 componentDidMount / componentDidUpdate 执行时机有什么区别 ？

useEffect 对 React 执行栈来看是异步执行的，而 componentDidMount / componentDidUpdate 是同步执行的，useEffect代码不会阻塞浏览器绘制。在时机上 ，componentDidMount / componentDidUpdate 和 useLayoutEffect 更类似。

### useInsertionEffect

useInsertionEffect 是在 React v18 新添加的 hooks ，它的用法和 useEffect 和 useLayoutEffect 一样。那么这个 hooks 用于什么呢?

在介绍 useInsertionEffect 用途之前，先看一下 useInsertionEffect 的执行时机。

```js
React.useEffect(()=>{
    console.log('useEffect 执行')
},[])

React.useLayoutEffect(()=>{
    console.log('useLayoutEffect 执行')
},[])

React.useInsertionEffect(()=>{
    console.log('useInsertionEffect 执行')
},[])

//  useInsertionEffect 执行 useLayoutEffect 执行 useEffect 执行
```

可以看到 useInsertionEffect 的执行时机要比 useLayoutEffect 提前，useLayoutEffect 执行的时候 DOM 已经更新了，但是在 useInsertionEffect 的执行的时候，DOM 还没有更新。

本质上 useInsertionEffect 主要是解决 CSS-in-JS 在渲染中注入样式的性能问题。这个 hooks 主要是应用于这个场景，在其他场景下 React 不期望用这个 hooks

::: tip css-in-js 问题
CSS-in-JS 的注入会引发哪些问题呢？ 首先看部分 CSS-in-JS 的实现原理，拿 Styled-components 为例子，通过styled-components，你可以使用ES6的标签模板字符串语法（Tagged Templates）为需要 styled 的 Component 定义一系列CSS属性，当该组件的JS代码被解析执行的时候，styled-components 会动态生成一个 CSS 选择器，并把对应的 CSS 样式通过 style 标签的形式插入到 head 标签里面。动态生成的 CSS 选择器会有一小段哈希值来保证全局唯一性来避免样式发生冲突。这种模式下本质上是动态生成 style 标签。
:::

在 useLayoutEffect 使用 CSS-in-JS 会造成哪里问题呢？

- 首先 useLayoutEffect 执行的时机 DOM 已经更新完成，布局也已经确定了，剩下的就是交给浏览器绘制就行了。
- 如果在 useLayoutEffect 动态生成 style 标签，那么会再次影响布局，导致浏览器再次重回和重排。

这个是时候 useInsertionEffect 的作用就出现了，useInsertionEffect 的执行在 DOM 更新前，所以此时使用 CSS-in-JS 避免了浏览器出现再次重回和重排的可能，解决了性能上的问题。

在 useInsertionEffect 使用 CSS-in-JS 流程

```js
export default function Index(){

  React.useInsertionEffect(()=>{
     /* 动态创建 style 标签插入到 head 中 */
     const style = document.createElement('style')
     style.innerHTML = `
       .css-in-js{
         color: red;
         font-size: 20px;
       }
     `
     document.head.appendChild(style)
  },[])

  return <div className="css-in-js" > hello , useInsertionEffect </div>
}
```

## 生命周期在函数组件中的替代方案

### componentDidMount 替代方案

```js
React.useEffect(()=>{
    /* 请求数据 ， 事件监听 ， 操纵dom */
},[])  /* 切记 dep = [] */
```

这里要记住 dep = [] ，这样当前 effect 没有任何依赖项，也就只有初始化执行一次。

### componentWillUnmount 替代方案

```js
 React.useEffect(()=>{
        /* 请求数据 ， 事件监听 ， 操纵dom ， 增加定时器，延时器 */
        return function componentWillUnmount(){
            /* 解除事件监听器 ，清除定时器，延时器 */
        }
},[])/* 切记 dep = [] */
```

在 componentDidMount 的前提下，useEffect 第一个函数的返回函数，可以作为 componentWillUnmount 使用。

### componentWillReceiveProps 代替方案

说 useEffect 代替 componentWillReceiveProps 着实有点牵强。

- 首先因为二者的执行阶段根本不同，一个是在render阶段，一个是在commit阶段。
- 其次 useEffect 会初始化执行一次，但是 componentWillReceiveProps 只有组件更新 props 变化的时候才会执行。

```js
React.useEffect(()=>{
    console.log('props变化：componentWillReceiveProps')
},[ props ])
```

此时依赖项就是 props，props 变化，执行此时的 useEffect 钩子。

```js
React.useEffect(()=>{
    console.log('props中number变化：componentWillReceiveProps')
},[ props.number ]) /* 当前仅当 props中number变化，执行当前effect钩子 */
```

useEffect 还可以针对 props 的某一个属性进行追踪。此时的依赖项为 props 的追踪属性。如上述代码，只有 props 中 number 变化，执行 effect 。

### componentDidUpdate 替代方案

useEffect 和 componentDidUpdate 在执行时期虽然有点差别，useEffect 是异步执行，componentDidUpdate 是同步执行 ，但都是在 commit 阶段 。但是向上面所说 useEffect 会默认执行一次，而 componentDidUpdate 只有在组件更新完成后执行。

```js
React.useEffect(()=>{
    console.log('组件更新完成：componentDidUpdate ')     
}) /* 没有 dep 依赖项 */
```

没有第二个参数，那么每一次执行函数组件，都会执行该 effect。

## 实现一个 ScrollView 组件

主要用于长列表渲染，滑动底部请求渲染列表

```js
class ScrollView extends React.Component{
    /* -----自定义事件---- */
    /* 控制滚动条滚动 */
      handerScroll=(e)=>{
        const { scroll } = this.props
        scroll && scroll(e)
        this.handerScrolltolower()
    }
    /* 判断滚动条是否到底部 */
    handerScrolltolower(){
       const { scrolltolower } = this.props
       const { scrollHeight , scrollTop ,  offsetHeight } = this.node 
       if(scrollHeight === scrollTop + offsetHeight){ /* 到达容器底部位置 */
           scrolltolower && scrolltolower()
       }
    }
    node = null

    /* ---——---生命周期------- */
    constructor(props) {
        super(props)
        this.state={ /* 初始化 Data */
            list:[]
        }
        this.handerScrolltolower = debounce(this.handerScrolltolower,200) /* 防抖处理 */               
    }
    /* 接收props, 合并到state */
    static getDerivedStateFromProps(newProps){
        const { data } = newProps
        return { 
            list : data.list || [] ,
        }
    }
    /* 性能优化，只有列表数据变化，渲染列表 */
    shouldComponentUpdate(newProps,newState){
       return newState.list !== this.state.list
    }
    /* 获取更新前容器高度 */
    getSnapshotBeforeUpdate(){
        return this.node.scrollHeight
    }
    /* 获取更新后容器高度 */
    componentDidUpdate(prevProps, prevState, snapshot){
        console.log('scrollView容器高度变化:' , this.node.scrollHeight - snapshot  )
    }
    /* 绑定事件监听器 - 监听scorll事件 */
    componentDidMount() {
        this.node.addEventListener('scroll',this.handerScroll)
    }
    /* 解绑事件监听器 */
    componentWillUnmount(){
        this.node.removeEventListener('scroll',this.handerScroll)
    }
    render() {
        const { list } = this.state
        const { component } = this.props
        return <div className="list_box"  ref={(node) => this.node = node }  >
            <div >     
                {
                    list.map((item) => (
                        React.createElement(component,{ item , key: item.id  }) //渲染 Item 列表内容。
                    ))
                }
            </div>
        </div>
    }
}
```

scrollview组件各个生命周期功能：

- constructor： 做数据初始化，将滑动处理函数，做防抖处理。
- getDerivedStateFromProps: 将 props 中的 list ，合并到 state 。
- componentDidMount: 绑定监听 scroll 事件。
- shouldComponentUpdate：性能优化，只有 list 改变，渲染视图。
- render: 渲染视图，渲染 Item 。
- getSnapshotBeforeUpdate：保存组件更新前的 scrollview 容器高度。
- componentDidUpdate：根据渲染前后容器高度，计算一次高度变化量。
- componentWillUnmount：解除 scroll 事件监听器。

使用：

```js
/* item 完全是单元项的渲染ui */
function Item({item}) {
    return  <div className="goods_item" >
        <img src={item.giftImage} className="item_image" />
        <div className="item_content" >
            <div className="goods_name" >
                {item.giftName}
            </div>
            <div className="hold_price" />
            <div className="new_price" >
                <div className="new_price" >
                    <div className="one view">
                        ¥ {item.price}
                    </div>
                </div>
            </div>
            <img className='go_share  go_text' />
        </div>
    </div>
}

function () { 
    const [ data , setData ] = useState({ list:[],page:0,pageCount:1  }) /* 记录列表数据 */
    /* 请求数据 */
    const getData = async ()=>{
        if(data.page === data.pageCount) return console.log('没有数据了～')
        const res = await fetchData(data.page + 1)
        if(res.code === 0) setData({
            ...res,
            list:res.page === 1 ?  res.list : data.list.concat(res.list) 
        })
    } 
    /* 滚动到底部触发 */
    const handerScrolltolower = () => {
        console.log('scroll已经到底部')
        getData()
    }
    /* 初始化请求数据 */
    useEffect(()=>{
        getData()
    },[])
    return <ScrollView 
            data={ data }       /*  */
            component={ Item }  /* Item 渲染的单元组件 */
            scrolltolower={ handerScrolltolower } 
            scroll={()=>{}} 
        />
}
```

## 问题

### Q1. useEffect/useLayoutEffect/useInsertionEffect 有什么区别？

一句话概括如何选择 useEffect 和 useLayoutEffect ：修改 DOM ，改变布局就用 useLayoutEffect ，其他情况就用 useEffect 。

- useInsertionEffect: useInsertionEffect 的执行时机要比 useLayoutEffect 提前，useLayoutEffect 执行的时候 DOM 已经更新了，但是在 useInsertionEffect 的执行的时候，DOM 还没有更新。本质上 useInsertionEffect 主要是解决 CSS-in-JS 在渲染中注入样式的性能问题。这个 hooks 主要是应用于这个场景，在其他场景下 React 不期望用这个 hooks。useInsertionEffect 的执行在 DOM 更新前，所以此时使用 CSS-in-JS 避免了浏览器出现再次重回和重排的可能，解决了性能上的问题。
- useLayoutEffect: useLayoutEffect 是在 DOM 更新之后，浏览器绘制之前，这样可以方便修改 DOM，获取 DOM 信息，这样浏览器只会绘制一次，如果修改 DOM 布局放在 useEffect ，那 useEffect 执行是在浏览器绘制视图之后，接下来又改 DOM ，就可能会导致浏览器再次回流和重绘。而且由于两次绘制，视图上可能会造成闪现突兀的效果。useLayoutEffect callback 中代码执行会阻塞浏览器绘制。
- useEffect：对于 useEffect 执行， React 处理逻辑是采用异步调用 ，对于每一个 effect 的 callback， React 会向 setTimeout回调函数一样，放入任务队列，等到主线程任务完成，DOM 更新，js 执行完成，视图绘制完毕，才执行。所以 effect 回调函数不会阻塞浏览器绘制视图。

顺序：useInsertionEffect -> DOM 更新 -> useLayoutEffect -> render -> useEffect

### Q2. React.useEffect 回调函数 和 componentDidMount / componentDidUpdate 执行时机有什么区别 ？

useEffect 对 React 执行栈来看是异步执行的，而 componentDidMount / componentDidUpdate 是同步执行的，useEffect代码不会阻塞浏览器绘制。在时机上 ，componentDidMount / componentDidUpdate 和 useLayoutEffect 更类似。

### Q3. 类组件生命周期

![生命周期总览](/blog/images/react/生命周期总览.png)

[React 18.2 - 生命周期](https://juejin.cn/post/7188450404105977914)
