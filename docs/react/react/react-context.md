# React Context 原理

 `Context`　提供了一种直接访问祖先节点上的状态的方法, 避免了多级组件层层传递　`props`的问题。

- Provder 如何传递 context？
- 三种获取 context 原理 （ `Consumer`， `useContext`，`contextType` ）？
- 消费 `context` 的组件，context 改变，为什么会订阅更新 （如何实现） 。
- context 更新，如何避免 `pureComponent` ， `shouldComponentUpdate` 渲染控制策略的影响。
- 如何实现的 context 嵌套传递 （ 多个 Povider ）?

## Context 对象

老版本 context 就是 Legacy Context 模式下的 context ，老版本的 context 是采用约定式的使用规则，于是有了 `getChildContext` 和 `childContextTypes` 协商的属性和方法，这种方式不仅不够灵活，而且对于函数组件也存在局限性，所以在 `v16.3` 推出了新版本的 `context`，开发者能够更加灵活的运用 Context。新版本引入 context 对象的概念，而且 context 对象上除了保留了传递的信息 `value` 外 ， 还有提供者 `Provder` 和消费者 `Consumer`。

### 回顾老版本 Context API

```js
class Child extends React.Component {
  render() {
    // 4. 这里使用 this.context.value 获取
    return <p>{this.context.value}</p>
  }
}

// 3. 子组件添加 contextTypes 静态属性
Child.contextTypes = {
  value: PropTypes.string
};

class Parent extends React.Component {

  state = {
    value: 'foo'
  }

  // 1. 当 state 或者 props 改变的时候，getChildContext 函数就会被调用
  getChildContext() {
    return {value: this.state.value}
  }

  render() {
    return (
      <div>
        <Child />
      </div>
    )
  }
}

// 2. 父组件添加 childContextTypes 静态属性
Parent.childContextTypes = {
  value: PropTypes.string
};
```

### Context 中断问题

对于这个 API，React 官方并不建议使用，对于可能会出现的问题，React 文档给出的介绍为：

> 问题是，如果组件提供的一个 context 发生了变化，而中间父组件的 shouldComponentUpdate 返回 false，那么使用到该值的后代组件不会进行更新。使用了 context 的组件则完全失控，所以基本上没有办法能够可靠的更新 context。

对于这个问题，我们写个示例代码：

```jsx
// 1. Child 组件使用 PureComponent
class Child extends React.Component {
  render() {
    return <GrandChild />
  }
}

class GrandChild extends React.Component {
  render() {
    return <p>{this.context.theme}</p>
  }
}

GrandChild.contextTypes = {
  theme: PropTypes.string
};

class Parent extends React.Component {

  state = {
    theme: 'red'
  }

  getChildContext() {
    return {theme: this.state.theme}
  }

  render() {
    return (
      <div onClick={() => {
        this.setState({
          theme: 'blue'
        })
      }}>
        <Child />
        <Child />
      </div>
    )
  }
}

Parent.childContextTypes = {
  theme: PropTypes.string
};
```

在这个示例代码中，当点击文字 `red` 的时候，文字并不会修改为 `blue`，如果我们把 Child 改为 `extends Component`，则能正常修改

这说明当中间组件的 `shouldComponentUpdate` 为 `false` 时，会中断  Context 的传递。

PureComponent 的存在是为了减少不必要的渲染，但我们又想 Context 能正常传递，有办法可以解决吗？既然 PureComponent 的存在导致了 Context 无法再更新，那就干脆不更新了，Context 不更新，GrandChild 就无法更新吗？

#### 解决方案

```jsx
// 1. 建立一个订阅发布器，当然你也可以称呼它为依赖注入系统（dependency injection system），简称 DI
class Theme {
  constructor(value) {
    this.value = value
    this.subscriptions = []
  }

  setValue(value) {
    this.value = value
    this.subscriptions.forEach(f => f())
  }

  subscribe(f) {
    this.subscriptions.push(f)
  }
}


class Child extends React.PureComponent {
    render() {
        return <GrandChild />
    }
}


class GrandChild extends React.Component {
    componentDidMount() {
      // 4. GrandChild 获取 store 后，进行订阅
        this.context.theme.subscribe(() => this.forceUpdate())
    }

    // 5. GrandChild 从 store 中获取所需要的值
    render() {
        return <p>{this.context.theme.value}</p>
    }
}

GrandChild.contextTypes = {
  theme: PropTypes.object
};

class Parent extends React.Component {
    constructor(p, c) {
      super(p, c)
      // 2. 我们实例化一个 store（想想 redux 的 store），并存到实例属性中
      this.theme = new Theme('blue')
    }

    // 3. 通过 context 传递给 GrandChild 组件
    getChildContext() {
        return {theme: this.theme}
    }

    render() {
        // 6. 通过 store 进行发布
        return (
            <div onClick={() => {
                this.theme.setValue('red')
            }}>
              <Child />
              <Child />
            </div>
        )
    }
}

Parent.childContextTypes = {
  theme: PropTypes.object
};
```

为了管理我们的 theme ，我们建立了一个依赖注入系统（DI），并通过 Context 向下传递 store，需要用到 store 数据的组件进行订阅，传入一个 forceUpdate 函数，当 store 进行发布的时候，依赖 theme 的各个组件执行 forceUpdate，由此实现了在 Context 不更新的情况下实现了各个依赖组件的更新。

你可能也发现了，这有了一点 react-redux 的味道。

## 新的 Context API

```jsx
// 1. 创建 Provider 和 Consumer
const {Provider, Consumer} = React.createContext('dark');

class Child extends React.Component {
  // 3. Consumer 组件接收一个函数作为子元素。这个函数接收当前的 context 值，并返回一个 React 节点。
  render() {
    return (
      <Consumer>
        {(theme) => (
        <button>
          {theme}
        </button>
      )}
      </Consumer>
    )
  }
}

class Parent extends React.Component {

  state = {
    theme: 'dark',
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        theme: 'light'
      })
    }, 2000)
  }


  render() {
    // 2. 通过 Provider 的 value 传递值
    return (
      <Provider value={this.state.theme}>
        <Child />
      </Provider>
    )
  }
}
复制代码
```

当 Provider 的 value 值发生变化时，它内部的所有 consumer 组件都会重新渲染。

新 API 的好处就在于从 Provider 到其内部 consumer 组件（包括 .contextType 和 useContext）的传播不受制于 shouldComponentUpdate 函数，因此当 consumer 组件在其祖先组件跳过更新的情况下也能更新。

#### createContext 模拟实现

```jsx
class Store {
    constructor() {
        this.subscriptions = []
    }

    publish(value) {
        this.subscriptions.forEach(f => f(value))
    }

    subscribe(f) {
        this.subscriptions.push(f)
    }
}

function createContext(defaultValue) {
    const store = new Store();

    // Provider
    class Provider extends React.PureComponent {
        componentDidUpdate() {
            store.publish(this.props.value);
        }

        componentDidMount() {
            store.publish(this.props.value);
        }

        render() {
            return this.props.children;
        }
    }

    // Consumer
    class Consumer extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                value: defaultValue
            };

            store.subscribe(value => {
                this.setState({
                        value
                });
            });
        }

        render() {
            return this.props.children(this.state.value);
        }
    }

    return {
            Provider,
            Consumer
    };
}
```

用我们写的 createContext 替换 React.createContext 方法，你会发现，同样可以运行。它其实跟解决老 Context API 问题的方法是一样的，只不过是做了一层封装。Consumer 组件构建的时候进行订阅，当 Provider 有更新的时候进行发布，这样就跳过了 PureComponent  的限制，实现 Consumer 组件的更新。

### createContext 源码

要想吃透 context ，首先要研究一下 Context 对象是什么。上述讲到可以通过 `createContext` 创建一个 context 。那么万物之源就是这个 API :

```js
export function createContext(defaultValue,calculateChangedBits){
   /* context 对象本质  */ 
  const context  = {
        $$typeof: REACT_CONTEXT_TYPE, /* 本质上就是 Consumer element 类型 */
        _calculateChangedBits: calculateChangedBits,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null,
  };
  /* 本质上就是 Provider element 类型。  */
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };
  context.Consumer = context 
}
```

如上可以很容易的看清楚 context 对象的本质，这里重点介绍三个属性

- **`Provider`** 本质上是一个 element 对象 $$typeof -> `REACT_PROVIDER_TYPE`
- **`Consumer`** 本质上也是一个 element 对象 $$typeof -> `REACT_CONTEXT_TYPE`
- **`_currentValue`** 这个用来保存传递给 Provider 的 value 。

`createContext`核心逻辑就是：其初始值保存在`context._currentValue`(同时保存到`context._currentValue2`。 保存 2 个 value 是为了支持多个渲染器并发渲染)。同时创建了`context.Provider`, `context.Consumer`2 个`reactElement`对象。

在`fiber树渲染`时, 在`beginWork`中`ContextProvider`类型的节点对应的处理函数是[updateContextProvider](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberBeginWork.old.js#L2842-L2898) 详见下文 - Provider 提供者。

## Provider 提供者

上述明白了 Provider 本质上是一个特殊的 `React Element` 对象，那么接下来重点看一下 Provider 的实现原理，研究 Provider 重点围绕这两个点。

- Provider 如何传递 context 状态的。
- Provider 中 value 改变，如何通知订阅 context。

之前的章节讲述了 **jsx -> element -> fiber** 的流程，按照这个逻辑，接下来看一下 Provdier 的处理。

- 首先标签形式的 `<Provider>` 本质上就是 `REACT_PROVIDER_TYPE` 的 React Element 。`<Provider>` -> `REACT_PROVIDER_TYPE` React element 。
- 接下来 element 会转化成 fiber ，fiber 类型为 **ContextProvider** ， React element -> `ContextProvide fiber`。

`ContextProvider` 类型的 fiber ，在 fiber 调和阶段会进入到 `beginWork` 流程，这个阶段会发生两件事。

- 如果当前类型的 fiber 不需要更新，那么会 `FinishedWork` 中止当前节点和子节点的更新。
- 如果当前类型 fiber 需要更新，那么会调用不同类型 fiber 的处理方法。当然 `ContextProvider` 也有特有的 fiber 更新方法 —— `updateContextProvider`

```js
function updateContextProvider(current ,workInProgress,renderExpirationTime,) {
  /*  获取 Provder 上的 value  */
  /* pushProvider实际上是一个存储函数, 利用栈的特性, 先把context._currentValue压栈, 之后更新context._currentValue = nextValue */
  pushProvider(workInProgress, newProps.value;);
  /* 更新 context  */
  if (oldProps !== null) {
    const changedBits = calculateChangedBits(context, newProps.value;, oldProps.value);
    if (changedBits === 0) {
      //context 没有变化。如果孩子们都是一样的话。那么不需要更新
      if (
        oldProps.children === newProps.children &&
        !hasLegacyContextChanged() 
      ) {
         return ...  // 停止调合子节点,收尾工作
      }
    } else { /* context 改变，更新 context */
      propagateContextChange( workInProgress,context, changedBits, renderExpirationTime,);
    }
  }
  /* 继续向下调和子代 fiber  */
  ...
}
```

`updateContextProvider`　在　`fiber`　初次创建时十分简单，仅仅就是保存了　`pendingProps.value`　做为　`context`　的最新值, 之后这个最新的值用于供给消费。

如上保留了 `updateContextProvider` 的核心流程如下：

- 第一步： 首先会调用 `pushProvider`，`pushProvider` 会获取 type 属性上的 `_context` 对象，就是上述通过 `createContext` 创建的 context 对象。然后将 Provider 的 value 属性，赋值给 context 的 `_currentValue` 属性上。**这里解释了 Provder 通过什么手段传递 context value，即通过挂载 context 的 `_currentValue` 属性。**
- 第二步： 通过 `calculateChangedBits` 计算出 changedBits ，`calculateChangedBits` 内部触发 context 对象上的 `_calculateChangedBits` ，细心的同学可以发现，在调用 `createContext` 的时候，实际上是有第二个参数的 `calculateChangedBits`，在更新 Provider 的时候这个参数就派上用场了，当它返回的 `changedBits === 0` 的时候，那么还会浅比较 children 是否发生变化，还有就是有没有 `legacy context`，如果这三点都满足的话，那么会判断当前 Provider 和子节点不需要更新，那么会 return 停止向下调和子节点。
- 第三步（**重点**）：在实际开发中，绝大多数当 value 发生变化，会走 `propagateContextChange` 这个流程，也是 Provider 更新的特点。

**propagateContextChange** 函数流程很繁琐，这里简化了流程，保留了最核心的部分：

```js
function propagateContextChange(workInProgress,context){
    let fiber = workInProgress.child;
    if (fiber !== null) {
        fiber.return = workInProgress;
    }
    while(fiber !== null){
        const list = fiber.dependencies;
         while (dependency !== null) {
              if (dependency.context === context){
                   /* 类组件：不受 PureComponent 和 shouldComponentUpdate 影响 */
                   if (fiber.tag === ClassComponent) {
                         /* 会走 forceUpdate 逻辑 */
                        const update = createUpdate(renderExpirationTime, null);
                        update.tag = ForceUpdate;
                        enqueueUpdate(fiber, update);
                   }
                   /* 重要：TODO: 提高 fiber 的优先级，让当前 fiber 可以 beginWork ，并且向上更新父级 fiber 链上的优先级 */
                   ...
              } 
         }
    }
}
```

`propagateContextChange` 非常重要，它的职责就是深度遍历所有的子代 fiber ，然后找到里面具有 `dependencies` 的属性，对比 dependencies 中的 context 和当前 Provider 的 context 是否是同一个，如果是同一个，那么如果当前 fiber 是类组件，那么会给绑定一个 forceUpdate 标识 。然后会提高 fiber 的更新优先级，让 fiber 在接下来的调和过程中，处于一个高优先级待更新的状态。接下来的代码比较长，我这里没有全部罗列出来，大致逻辑就是，找到当前 fiber 向上的父级链上的 fiber ，统一更新他们的优先级，使之变成高优先级待更新状态。

那么上述流程中暴露出几个问题：

- 什么情况下 fiber 会存在 dependencies ，首先 dependencies 在第十七章中会讲到，它保存的是 context 的依赖项，那么什么情况下会存在 **context 依赖项**。
- 为什么对于 class 类组件会创建一个 ForceUpdate 类型的 update 对象呢？

- 存在 dependency 的 fiber ，为什么要向上更新父级 fiber 链上的优先级，让所有父级 fiber 都处于一个高优先级。

在类组件中，通过调用 `this.forceUpdate()` 带来的更新就会被打上 ForceUpdate 类型的 update tag，这里可以理解为强制更新。 生命周期章节讲过， 在类组件更新流程中，强制更新会跳过 `PureComponent` 和 `shouldComponentUpdate` 等优化策略。

**第一个问题：** 首先就是 dependencies 属性，这个属性可以把当前的 fiber 和 context 建立起关联，那么可以理解成，使用了当前 context 的 fiber 会把 context 放在 dependencies 中，dependencies 属性本身是一个链表结构，一个 fiber 可以有多个 context 与之对应。反过来推测一下，什么情况下会使用 context 呢。那么有以下几种可能：

- 有 `contextType` 静态属性指向的类组件。
- 使用 `useContext` hooks 的函数组件。
- context 提供的 `Consumer`。

那么可以大胆的推测一下，**使用过 contextType useContext 的组件对应 fiber,和 Consumer 类型 fiber，会和 dependencies 建立起联系，会把当前消费的 context 放入 dependencies 中。**

**第二个问题：** 为什么对于 class 组件会创建一个 ForceUpdate 的 update 呢？

在**生命周期章节**和**渲染控制章节**，讲到过如果想要让类组件调用 render，得到新的 children，那么就要通过 `PureComponent` 和 `shouldComponentUpdate` 等层层阻碍，那么 context 要突破这些控制，就要做到当 value 改变，消费 context 的类组件更新，则需要通过 forceUpdate 强制更新。这样就解决了类组件更新限制。

那么总结一下流程，当 Provider 的 value 更新之后，Provider 下面的只要有消费了 context 的类组件，就会触发强制更新。这也就解释了最开始的问题——**context 更新，如何避免 `pureComponent` ， `shouldComponentUpdate` 渲染控制策略的影响。** 用一幅流程图表示：

**第三个问题：** 这个问题就要从 Provider 类型的 fiber 调和开始讲。接下来重点介绍 Provider 和 beiginWork 调和更新机制。首先引出两个思考点：

- 第一个类组件执行 render ，函数组件执行就是渲染么？
- 第二个 Context 改变如何做到消费 context 的组件更新的？（更新原理）

先来看一下第一个思考点，关于渲染的思考，实际上在 React 整个 `Reconciler` 调和流程中，从更新调度任务的发起，再到在 commit 和 render 两大阶段，再到真实的 dom 元素绘制，每一个环节都属于渲染的一部分。而开发者能够控制的 render ，只是其中的一小部分——类组件执行 render ，函数组件执行。而且这些本质上都发生在 FunctionComponent fiber 和 ClassComponent fiber 上。但是整个 fiber 树在调和阶段都需要更新的。更新调和 fiber 的方法在 React 底层叫做 **`beginWork`**。有一个问题需要注意，就是 `beginWork` 非 render。先来看看两者的区别。

- `beginWork` ： 在一次更新中，只要需要更新的 fiber 或者受到牵连的 fiber，都会执行 beginWork 。
- `render` ： 在一次更新中，只有组件类型的 fiber 会执行 render ，得到新的 children 。如果组件触发 render 那么它一定经历过 `beginWork`

比如发生一次更新任务，此次更新可能发生整个 fiber 树的任意枝叶上，但是因为 `context props` 穿透影响，React 不知道此次更新的波及范围，那么如何处理呢？ React 会从 `rootFiber` 开始更新，每一个更新 fiber 都会走 `beginWork` 流程，开始找不同，找到有没有需要更新的地方，那么指标是什么呢，其中一个重要的指标就是**更新的优先级**，老版本用的是 `expirationTime` ，新版本用的是 `lane`，那么就要保证一个问题，就是如果更新发生在一个子代节点，那么只有父节点 `beginWork` 才能让子代节点 `beginWork`。这样就形成了一条 `root fiber -> 父 fiber -> 子 fiber` 的 `beginWork` 链。在 `beginwork` 过程中，有几种情况：

- 第一种： 如果遇到组件，而且更新不涉及当前组件，也不在当前组件的父子递归链上，那么就不会 render，也不会向下 `beginWork` 。
- 第二种： 如果遇到组件，而且更新不涉及当前组件，但是更新组件属于当前组件的子孙后代，那么不会 render，但是会向下 `beginWork` ，目的很明确，找到对应的更新组件。
- 第三种： 如果遇到其他类型的 fiber 比如 `hostComponent` `<div>` ，那么会对比当前的更新优先级，如果低优先级，那么不需要向下 `beginWork` 。反之向下 `beginWork`。

举例：

如下当点击 componentB 下面的 span 触发 setState 更新 ，如下可以清晰看见 beginWork 和 render 流程。

![context1](/blog/images/react/context1.png)

- 从 root 开始第一次调和， 三个 fiber 都会经历 beginWork ，通过对比优先级， `componentA` 和 `div` 停止向下 beginwork。
- 更新发生在 componentB ，所以 componentB 渲染，触发 `render` ，得到新的 element，通过对比， `div` `span` 都会 beginwork。
- componentC 由于父组件更新，没有任何优化策略的情况，那么也会跟着 `render`，接着 div 也会跟着 beginwork。

那么如上，如果 componentC 通过 `PureComponent` 或者 `shouldComponentUpdate` 限制更新之后。那么会变成如下的样子：

![context2](/blog/images/react/context2.png)

- 如上 componentC 通过 `PureComponent` 处理后，不再 render ，当然也不会再向下 beginwork。

接下来，如果点击 componentC 下的 div，触发 setState 更新，那么又会发生什么呢？

- 此时更新发生在 `componentC` 上，所以 componentB 只会发生 beginwork ，不会发生 render。
- `componentB` 下面的 `div` 会停止向下的 beiginwork 。

![context3](/blog/images/react/context3.png)

**总结流程如下：**

- 如果一个组件发生更新，那么当前组件到 fiber root 上的父级链上的所有 fiber ，更新优先级都会升高，都会触发 beginwork 。
- render 不等于 beginWork，但是 render 发生，一定触发了 beginwork 。
- 一次 beginwork ，一个 fiber 下的同级兄弟 fiber 会发生对比，找到任务优先级高的 fiber 。向下 beginwork 。

## Consumer 消费者

Consumer 本质上是类型为 `REACT_CONTEXT_TYPE` 的 element 对象。在调和阶段，会转化成 `ContextConsumer` 类型的 fiber 对象。在 beginwork 中，会调用 `updateContextConsumer` 方法。那么这个方法做了些什么呢？

```js
// react/react-reconcider/src/ReactFiberBeginWork.js
function updateContextConsumer(current,workInProgress,renderExpirationTime,) {
  let context  = workInProgress.type;
  const newProps = workInProgress.pendingProps;
  /* 得到 render props children */
  const render = newProps.children;
  /* 读取 context */ 
  prepareToReadContext(workInProgress, renderExpirationTime);
  /* 得到最新的新的 context value */
  const newValue = readContext(context, newProps.unstable_observedBits);
  let newChildren;
  /* 得到最新的 children element */
  newChildren = render(newValue);
  workInProgress.effectTag |= PerformedWork;
  /* 调和 children */
  reconcileChildren(current, workInProgress, newChildren, renderExpirationTime);
  return workInProgress.child;
}
```

`updateContextConsumer`的核心流程：

- 首先调用 `readContext` 获取最新的 value 。
- 然后通过 `render props` 函数，传入最新的 value，得到最新的 `children` 。
- 接下来调和 children 。

那么有一个问题**就是 fiber 上的 dependencies 如何和 context 建立起关联。** 那么就是 **`readContext`** 这个函数做的事，可以提前透露一下，useContext 和 contextType 本质上也是。

### readContext

```js
// react/react-reconcider/src/ReactFiberNewContext.js
export function readContext( context,observedBits ){
    /* 创建一个 contextItem */
    const contextItem = {
      context,
      observedBits: resolvedObservedBits,
      next: null,
    };
    /* 不存在最后一个 context Dependency  */
    if (lastContextDependency === null) {
      lastContextDependency = contextItem;
      currentlyRenderingFiber.dependencies = {
        expirationTime: NoWork,
        firstContext: contextItem,
        responders: null,
      };
    } else {
      /* 存在的情况 */
      lastContextDependency = lastContextDependency.next = contextItem;
    }
   
  return isPrimaryRenderer ? context._currentValue : context._currentValue2;
}
```

- readContext 主要做的事情是这样的，首先会创建一个 contextItem ，上述说到过 fiber 上会存在多个 `dependencies` ，它们以链表的形式联系到一起，如果不存在最后一个 `context dependency` ，那证明 context dependencies 为空 ，那么会创建第一个 dependency ，如果存在最后一个 dependency ，那么 contextItem 会以链表形式保存，并变成最后一个 lastContextDependency 。

### 多个 Provider 嵌套

如果有多个 Provider 的情况，那么后一个 contextValue 会覆盖前一个 contextValue，在开发者脑海中，要有一个定律就是：**`Provider` 是用来传递 value，而非保存 value 。**

### contextType 和 useContext

#### useContext 原理


`useContext` 原理，调用 useContext 本质上调用 `readContext` 方法。

```js
// react/react-reconcider/src/ReactFiberHooks.js
const HooksDispatcherOnMount ={
    useContext: readContext
}
```

- 进入`updateFunctionComponent`后, 会调用`prepareToReadContext`
- 无论是初次[创建阶段](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L1780), 还是[更新阶段](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L1801), `useContext`都直接调用了`readContext`
- 函数组件通过 readContext ，将函数组件的 `dependencies`和当前 context 建立起关联，context 改变，将当前函数组件设置高优先级，促使其渲染。

#### contextType 原理

类组件的静态属性 `contextType` 和 useContext 一样，本质上就是调用 `readContext` 方法。

```js
// react/react-reconcider/src/ReactFiberClassComponent.js
function constructClassInstance(workInProgress,ctor,props){
     if (typeof contextType === 'object' && contextType !== null) {
         /* 读取 context  */
        context = readContext(contextType);
    } 

    const instance = new ctor(props, context);
}
```

- 进入`updateClassComponent`后, 会调用`prepareToReadContext`
- 无论[constructClassInstance](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberClassComponent.old.js#L573),[mountClassInstance](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberClassComponent.old.js#L807), [updateClassInstance](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberClassComponent.old.js#L1031)内部都调用`context = readContext((contextType: any));`
- 静态属性 `contextType` ，在类组件实例化的时候被使用，本质上也是调用 `readContext`将 context 和 fiber 上的 `dependencies` 建立起关联。

所以消费 consumer 的 3 种方式（ `contextType` ， `useContext`， `Consumer`）只是`react`根据不同使用场景封装的`api`, 内部都会调用[prepareToReadContext](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberNewContext.old.js#L297-L317)和[readContext(contextType)](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberNewContext.old.js#L319-L381)。

`prepareToReadContext` 核心逻辑:

1. `prepareToReadContext`: 设置`currentlyRenderingFiber = workInProgress`, 并重置`lastContextDependency`等全局变量.
2. `readContext`: 返回`context._currentValue`, 并构造一个`contextItem`添加到`workInProgress.dependencies`链表之后.

注意: 这个`readContext`并不是纯函数, 它还有一些副作用, 会更改`workInProgress.dependencies`, 其中`contextItem.context`保存了当前`context`的引用。这个`dependencies`属性会在更新时使用, 用于判定是否依赖了`ContextProvider`中的值。返回`context._currentValue`之后，之后继续进行`fiber树构造`直到全部完成即可。

更新 Context，同样进入`updateContextConsumer`，核心逻辑:

1. `value`没有改变, 直接进入`Bailout`。
2. `value`改变, 调用`propagateContextChange`

`propagateContextChange`源码比较长, 核心逻辑如下:

1. 向下遍历: 从`ContextProvider`类型的节点开始, 向下查找所有`fiber.dependencies`依赖该`context`的节点(假设叫做`consumer`)。
2. 向上遍历: 从`consumer`节点开始, 向上遍历, 修改父路径上所有节点的`fiber.childLanes`属性, 表明其子节点有改动, 子节点会进入更新逻辑。

通过以上 2 个步骤, 保证了所有消费该`context`的子节点都会被重新构造, 进而保证了状态的一致性, 实现了`context`更新。

## 小结

- Provider 传递流程：Provider 的更新，会深度遍历子代 fiber，消费 context 的 fiber 和父级链都会提升更新优先级。 对于类组件的 fiber ，会 forceUpdate 处理。接下来所有消费的 fiber，都会 beginWork 。
- context 订阅流程： `contextType` ， `useContext`， `Consumer` 会内部调用 `readContext` ，readContext 会把 fiber 上的 `dependencies` 属性和 context 对象建立起关联。

`Context`的实现思路还是比较清晰, 总体分为 2 步：

1. 在消费状态时,`ContextConsumer`节点调用`readContext(MyContext)`获取最新状态。
2. 在更新状态时, 由`ContextProvider`节点负责查找所有`ContextConsumer`节点, 并设置消费节点的父路径上所有节点的`fiber.childLanes`, 保证消费节点可以得到更新。
