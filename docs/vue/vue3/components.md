# 组件化原理

- 组件化的过程是什么？
- 组件是如何挂载渲染和更新的？
- 组件的生命周期是如何执行的？
- 组件被动更新过程是什么？
- `setup` 的作用是什么，是如何实现的？
- 组件的事件和 emit 是如何实现的？
- 插槽的原理是什么，如何实现的？
- 生命周期是如何注册的？

## 组件化过程与更新

```js
// 任务队列，使用 Set 数据结构自动去重
const queue = new Set();
// 标志变量，用于避免重复刷新队列
let isFlushing = false;
// 立即 resolve 的 Promise 实例，用于在微任务中执行任务
const p = Promise.resolve();

// 任务调度器 将任务加入队列并在微任务中执行
function queueJob(job) {
  if (!queue.has(job)) {
    queue.add(job);
    if (!isFlushing) {
      isFlushing = true;
      p.then(() => {
        try {
          // 执行任务队列中的所有任务
          queue.forEach(job => job());
        } finally {
          isFlushing = false;
          queue.clear();
        }
      });
    }
  }
}

// resolveProps 函数用于解析组件 props 和 attrs 数据
function resolveProps(options, propsData) {
  const props = {};
  const attrs = {};

  // 遍历为组件传递的 props 数据
  for (const key in propsData) {
    // 以字符串 on 开头的 props，无论是否显式地声明，都将其添加到 props 数据中，而不是添加到 attrs 中
    if (key in options || key.startsWith('on')) {
      props[key] = propsData[key];
    } else {
      attrs[key] = propsData[key];
    }
  }

  // 最后返回 props 与 attrs 数据
  return [props, attrs];
}

// 检查 props 是否发生变化
function hasPropsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps);
  // 如果新旧 props 的数量变了，则说明有变化
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  // 检查每个 prop 是否有变化
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    // 有不相等的 props，则说明有变化
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}

// 当前组件实例的全局变量
let currentInstance = null;
// 设置当前组件实例的函数
function setCurrentInstance(instance) {
  currentInstance = instance;
}
// onMounted 函数，用于注册 mounted 生命周期钩子
function onMounted(fn) {
  if (currentInstance) {
    // 将生命周期函数添加到 instance.mounted 数组中
    currentInstance.mounted.push(fn);
  } else {
    console.error('onMounted 函数只能在 setup 中调用');
  }
}

// 挂载组件
function mountComponent(vnode, container, anchor) {
  // 从虚拟节点中获取组件选项对象
  const componentOptions = vnode.type;
  // 从组件选项对象中提取各种生命周期钩子和方法
  const { render, data, setup, props: propsOption, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = componentOptions;

  // 调用 beforeCreate 钩子
  beforeCreate && beforeCreate();

  // 将 data 函数返回的数据转换为响应式对象
  const state = data ? reactive(data()) : null;

  // 调用 resolveProps 函数解析出最终的 props 数据与 attrs 数据
  const [props, attrs] = resolveProps(propsOption, vnode.props);

  // 直接使用编译好的 vnode.children 对象作为 slots 对象
  const slots = vnode.children || {};

  // 创建组件实例对象，并将组件实例绑定到虚拟节点上
  const instance = {
    state, // 组件自身状态
    props: shallowReactive(props), // 将解析出的 props 数据包装为浅响应式并定义到组件实例上
    isMounted: false, // 是否已挂载
    subTree: null, // 组件所渲染的内容
    attrs, // 保存 attrs 数据
    slots, // 保存 slots 数据
    // 在组件实例中添加 mounted 数组，用来存储通过 onMounted 函数注册的生命周期钩子函数
    mounted: []
  };
  vnode.component = instance;

  // 定义 emit 函数，它接收两个参数
  // event: 事件名称
  // payload: 传递给事件处理函数的参数
  function emit(event, ...payload) {
    // 根据约定对事件名称进行处理，例如 change --> onChange
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
    // 根据处理后的事件名称去 props 中寻找对应的事件处理函数
    const handler = instance.props[eventName];
    if (handler) {
      // 调用事件处理函数并传递参数
      handler(...payload);
    } else {
      console.error(`事件 ${event} 不存在`);
    }
  }

  // setupContext，包含 attrs、emit、slots
  const setupContext = { attrs, emit, slots };

  // 在调用 setup 函数之前，设置当前组件实例
  setCurrentInstance(instance);
  // 调用 setup 函数，将只读版本的 props 作为第一个参数传递，避免用户意外地修改 props 的值，
  const setupResult = setup(shallowReadonly(instance.props), setupContext);
  // 在 setup 函数执行完毕之后，重置当前组件实例
  setCurrentInstance(null);

  // setupState 用来存储由 setup 返回的数据
  let setupState = null;

  // 如果 setup 函数的返回值是函数，则将其作为渲染函数
  if (typeof setupResult === 'function') {
    // 报告冲突
    if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略');
    // 将 setupResult 作为渲染函数
    render = setupResult;
  } else {
    // 如果 setup 的返回值不是函数，则作为数据状态赋值给 setupState
    setupState = setupResult;
  }

  // 创建渲染上下文对象，本质上是组件实例的代理
  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      const { state, props, slots, setupState } = t;
      if (state && k in state) {
        // 自身 state
        return state[k];
      } else if (k in props) {
        // props
        return props[k];
      } else if (k === '$slots') {
        // 插槽
        return slots;
      } else if (setupState && k in setupState) {
        // setupState
        return setupState[k];
      } else {
        console.error(`Property '${k}' does not exist on the component instance.`);
      }
    },
    set(t, k, v, r) {
      const { state, props, setupState } = t;
      if (state && k in state) {
        state[k] = v;
      } else if (k in props) {
        console.warn(`Attempting to mutate prop "${k}". Props are readonly.`);
      } else if (setupState && k in setupState) {
        // setupState
        setupState[k] = v;
      } else {
        console.error(`Property '${k}' does not exist on the component instance.`);
      }
    }
  });

  // 生命周期钩子调用时要绑定渲染上下文对象
  created && created.call(renderContext);

  // 创建一个响应式副作用函数，用于组件的渲染和更新，实现组件的自更新
  effect(() => {
    // 获取子树渲染内容，this 指向 renderContext，使得 render 函数中通过 this 访问组件自身状态和 props
    const subTree = render.call(renderContext);

    if (!instance.isMounted) {
      // 调用 beforeMount 钩子
      beforeMount && beforeMount.call(renderContext);
      // 将虚拟 DOM 挂载到容器中，初次挂载第一参数组件实例为 null
      patch(null, subTree, container, anchor);
      // 防止更新时再次挂载
      instance.isMounted = true;
      // 调用 mounted 钩子
      mounted && mounted.call(renderContext);
      // 遍历 instance.mounted 数组并逐个执行即可
      instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext));
    } else {
      // 调用 beforeUpdate 钩子
      beforeUpdate && beforeUpdate.call(renderContext);
      // 更新虚拟 DOM，instance.subTree 上一次的子树(旧的)，需要更新的子树(新的)
      patch(instance.subTree, subTree, container, anchor);
      // 调用 updated 钩子
      updated && updated.call(renderContext);
    }
    // 更新组件实例的子树
    instance.subTree = subTree;
  }, { scheduler: queueJob });
}

// 更新组件
function patchComponent(n1, n2, anchor) {
  // 获取组件实例，即 n1.component，同时让新的组件虚拟节点 n2.component 也指向组件实例
  const instance = (n2.component = n1.component);
  // 获取当前的 props 数据
  const { props } = instance;

  // 调用 hasPropsChanged 检测为子组件传递的 props 是否发生变化，如果没有变化，则不需要更新
  if (hasPropsChanged(n1.props, n2.props)) {
    // 调用 resolveProps 函数重新获取 props 数据
    const [nextProps] = resolveProps(n2.type.props, n2.props);
    // 更新 props
    for (const k in nextProps) {
      props[k] = nextProps[k];
    }
    // 删除不存在的 props
    for (const k in props) {
      if (!(k in nextProps)) {
        delete props[k];
      }
    }
  }

  // 调用 beforeUpdate 钩子
  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      const { state, props } = t;
      if (state && k in state) {
        return state[k];
      } else if (k in props) {
        return props[k];
      } else if (instance.setupState && k in instance.setupState) {
        // 渲染上下文需要增加对 setupState 的支持
        return instance.setupState[k];
      } else {
        console.error(`Property '${k}' does not exist on the component instance.`);
      }
    },
    set(t, k, v, r) {
      const { state, props } = t;
      if (state && k in state) {
        state[k] = v;
      } else if (k in props) {
        console.warn(`Attempting to mutate prop "${k}". Props are readonly.`);
      } else if (instance.setupState && k in instance.setupState) {
        // 渲染上下文需要增加对 setupState 的支持
        instance.setupState[k] = v;
      } else {
        console.error(`Property '${k}' does not exist on the component instance.`);
      }
    }
  });

  // 调用 beforeUpdate 钩子
  instance.type.beforeUpdate && instance.type.beforeUpdate.call(renderContext);

  // 更新子树
  patch(instance.subTree, n2.type.render.call(renderContext), instance.vnode.el, anchor);

  // 调用 updated 钩子
  instance.type.updated && instance.type.updated.call(renderContext);

  // 更新组件实例的子树
  instance.subTree = n2.type.render.call(renderContext);
}
```

- **`queueJob` 任务调度器的目的**：组件自身的响应式数据发生变化，组件就会自动重新执行渲染函数，从而完成更新。但是，由于 effect 的执行是同步的，因此当响应式数据发生变化时，与之关联的副作用函数会同步执行。换句话说，如果多次修改响应式数据的值，将会导致渲染函数执行多次，这实际上是没有必要的。因此，我们需要设计一个机制，以使得无论对响应式数据进行多少次修改，副作用函数都只会重新执行一次。为此，我们需要实现一个调度器，当副作用函数需要重新执行时，我们不会立即执行它，而是将它缓冲到一个微任务队列中，等到执行栈清空后，再将它从微任务队列中取出并执行。有了缓存机制，我们就有机会对任务进行去重，从而避免多次执行副作用函数带来的性能开销。当响应式数据发生变化时，副作用函数不会立即同步执行，而是会被 queueJob 函数调度，最后在一个微任务中执行。
- **组件实例 `instance`**： 组件实例本质上就是一个状态集合（或一个对象）​，它维护着组件运行过程中的所有信息，例如注册到组件的生命周期函数、组件渲染的子树（subTree）​、组件是否已经被挂载、组件自身的状态（data）​，等等。
- **组件的被动更新**：props 本质上是父组件的数据，当 props 发生变化时，会触发父组件重新渲染，父组件会进行自更新。在更新过程中，渲染器发现父组件的 subTree 包含组件类型的虚拟节点，所以会调用 `patchComponent` 函数完成子组件的更新。所以，把由父组件自更新所引起的子组件更新叫作子组件的被动更新。当子组件发生被动更新时，我们需要做的是：
  - 检测子组件是否真的需要更新，因为子组件的 props 可能是不变的；
  - 如果需要更新，则更新子组件的 props、slots 等内容。
- **props 浅响应式**：`instance.props` 对象本身是浅响应的（即`shallowReactive`）​。因此，在更新组件的 `props` 时，只需要设置 `instance.props` 对象下的属性值即可触发组件重新渲染。
- **props 解析 resolveProps**：解析组件的 props 和 attrs 数据，将 on 开头的 props 也视为有效的 props
- **渲染函数上下文对象 `renderContext`**： 由于 props 数据与组件自身的状态数据都需要暴露到渲染函数中，并使得渲染函数能够通过 this 访问它们，因此我们需要封装一个渲染上下文对象，其本质时组件实例的代理。它的意义在于拦截数据状态的读取和设置操作，每当在渲染函数或生命周期钩子中通过 this 来读取数据时，都会优先从组件的自身状态中读取，如果组件本身并没有对应的数据，则再从 props 数据中读取。最后我们将渲染上下文作为渲染函数以及生命周期钩子的 this 值即可。实际上，除了组件自身的数据以及 props 数据之外，完整的组件还包含 methods、computed 等选项中定义的数据和方法，这些内容都应该在渲染上下文对象中处理。

## setup 函数的作用与实现

因为 setup 函数主要用于配合组合式 API，为用户提供一个地方，用于建立组合逻辑、创建响应式数据、创建通用函数、注册生命周期钩子等能力。在组件的整个生命周期中，setup 函数只会在被挂载时执行一次，它的返回值可以有两种情况。

1. 返回一个函数，该函数将作为组件的 render 函数：常用于组件不是以模板来表达其渲染内容的情况。如果组件以模板来表达其渲染的内容，那么 setup 函数不可以再返回函数，否则会与模板编译生成的渲染函数产生冲突。
2. 返回一个对象，该对象中包含的数据将暴露给模板使用，setup 函数暴露的数据可以在渲染函数中通过 this 来访问。 另外，setup 函数接收两个参数。第一个参数是 props 数据对象，第二个参数也是一个对象，通常称为 setupContext。

```js
// 返回一个函数的情况
const Comp1 = {
  setup() {
    return () => {
      return { type: 'div', children: 'hello' };
    }
  }
}

// 返回一个对象的情况
const Comp2 = {
  props: {
    foo: String
  },
  setup(props, setupContext) {
    const count = ref(0);
    const { slots, emit, attrs, expose } = setupContext;

    // 使用 props 访问父组件传递的数据
    console.log(props.foo); // 示例：打印传入的 prop

    // 返回一个对象，其中的数据会被暴露给模板或渲染函数
    return {
      count,
      slots,
      emit,
      attrs,
      expose
    };
  },
  render() {
    // 在渲染函数中，通过 this 访问 setup 中暴露的数据
    return {
      type: 'div',
      children: [
        `count is: ${this.count}`,
        this.slots.default ? this.slots.default() : null // 渲染默认插槽（如果存在）
      ]
    };
  }
}
```

- `setupContext` 是一个对象，它包含了组件的一些上下文信息，通常在 setup 函数中使用。这个对象提供了以下属性：
  - `attrs`: 包含所有未声明为 props 的属性。这些属性通常是由父组件传递给子组件的，但没有在 props 选项中声明。
  - `emit`: 一个函数，用于触发自定义事件。父组件可以通过监听这些事件来接收子组件的状态变化。
  - `slots`: 包含所有插槽内容的对象。插槽是 Vue 中的一种内容分发机制，允许父组件向子组件传递内容。

2. `setupResult` 是 setup 函数的返回值。setup 函数可以返回以下几种类型的数据：
   - `Object`: 返回一个对象，该对象中的属性和方法将被合并到组件实例中，可以在模板中直接使用。
   - `Function`: 返回一个渲染函数（render 函数），这个函数将被用作组件的渲染函数，替代 template 或 render 选项。

3. `setupState` 是一个变量，用于存储 setup 函数返回的对象。如果 setup 函数返回的是一个对象，这个对象会被存储在 setupState 中，并且可以通过渲染上下文对象 renderContext 访问。

4. `setup` 函数的实现:

```js
// setupContext，包含 attrs、emit 和 slots
  const setupContext = { attrs, emit: instance.emit, slots: instance.slots };

  // 调用 setup 函数，将只读版本的 props 作为第一个参数传递，避免用户意外地修改 props 的值，
  // 将 setupContext 作为第二个参数传递
  const setupResult = setup(shallowReadonly(instance.props), setupContext);

  // setupState 用来存储由 setup 返回的数据
  let setupState = null;

  // 如果 setup 函数的返回值是函数，则将其作为渲染函数
  if (typeof setupResult === 'function') {
    // 报告冲突
    if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略');
    // 将 setupResult 作为渲染函数
    render = setupResult;
  } else {
    // 如果 setup 的返回值不是函数，则作为数据状态赋值给 setupState
    setupState = setupResult;
  }
```

## 组件事件与 emit 的实现

`emit` 自定义事件的本质就是根据事件名称去 props 数据对象中寻找对应的事件处理函数并执行。

```js
// 定义 emit 函数，它接收两个参数
  // event: 事件名称
  // payload: 传递给事件处理函数的参数
  function emit(event, ...payload) {
    // 根据约定对事件名称进行处理，例如 change --> onChange
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
    // 根据处理后的事件名称去 props 中寻找对应的事件处理函数
    const handler = instance.props[eventName];
    if (handler) {
      // 调用事件处理函数并传递参数
      handler(...payload);
    } else {
      console.error(`事件 ${event} 不存在`);
    }
  }

  // 将 emit 函数添加到 setupContext 中，用户可以通过 setupContext 取得 emit 函数
  const setupContext = { attrs, emit, slots };

  // 调用 setup 函数
  const setupResult = setup(shallowReadonly(instance.props), setupContext);
```

整体实现并不复杂，只需要实现一个 `emit` 函数并将其添加到 `setupContext` 对象中，这样用户就可以通过 `setupContext` 取得 `emit` 函数了。另外，当 emit 函数被调用时，我们会根据约定对事件名称进行转换，以便能够在 `props` 数据对象中找到对应的事件处理函数。最后，调用事件处理函数并透传参数即可。

这里有一点需要额外注意，我们在讲解 props 时提到，任何没有显式地声明为 `props` 的属性都会存储到 `attrs` 中。换句话说，任何事件类型的 props，即 `onXxx` 类的属性，都不会出现在 props 中。这导致我们无法根据事件名称在 `instance.props` 中找到对应的事件处理函数。

为了解决这个问题，我们需要在解析 props 数据的时候对事件类型的 props 做特殊处理。通过检测 `propsData` 的 `key` 值来判断它是否以字符串 `on` 开头，如果是，则认为该属性是组件的自定义事件。这时，即使组件没有显式地将其声明为 props，我们也将它添加到最终解析的 props 数据对象中，而不是添加到 `attrs` 对象中。

## 插槽的原理与实现

组件件模板中的插槽内容会被编译为插槽函数，而插槽函数的返回值就是具体的插槽内容：

```js
// MyComponent 组件模板的编译结果
function render() {
  return [
    {
      type: 'header',
      children: [this.$slots.header()]
    },
    {
      type: 'body',
      children: [this.$slots.body()]
    },
    {
      type: 'footer',
      children: [this.$slots.footer()]
    }
  ];
}
```

渲染插槽内容的过程，就是调用插槽函数并渲染由其返回的内容的过程。这与 React 中 `render props` 的概念非常相似。

在运行时的实现上，插槽则依赖于 `setupContext` 中的 `slots` 对象。最基本的 slots 的实现非常简单。只需要将编译好的 `vnode.children` 作为 `slots` 对象，然后将 `slots` 对象添加到 `setupContext` 对象中。为了在 render 函数内和生命周期钩子函数内能够通过 `this.$slots` 来访问插槽内容，

我们还需要在 renderContext 中特殊对待 `$slots` 属性。通过对渲染上下文 renderContext 代理对象的 `get` 拦截函数做了特殊处理，当读取的键是 `$slots` 时，直接返回组件实例上的 `slots` 对象，这样用户就可以通过 `this.$slots` 来访问插槽内容了。

```js
function mountComponent(vnode, container, anchor) {
  // 省略部分代码

  const slots = vnode.children || {};

  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null,
    // 将插槽添加到组件实例上
    slots
  };

  // 省略部分代码

  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      const { state, props, slots } = t;
      // 当 k 的值为 $slots 时，直接返回组件实例上的 slots
      if (k === '$slots') return slots;

      // 省略部分代码
    },
    set(t, k, v, r) {
      // 省略部分代码
    }
  });

  // 省略部分代码
}
```

## 注册生命周期

在 setup 函数中调用 `onMounted` 函数即可注册 `mounted 生命周期钩子函数`，并且可以通过多次调用 `onMounted` 函数来注册多个钩子函数，这些函数会在组件被挂载之后再执行，问在于，在 A 组件的 setup 函数中调用 `onMounted` 函数会将该钩子函数注册到 A 组件上；而在 B 组件的 setup 函数中调用 `onMounted` 函数会将钩子函数注册到 B 组件上，这是如何实现的呢？

我们需要维护一个变量 `currentInstance`，用它来存储当前组件实例，每当初始化组件并执行组件的 setup 函数之前，先将 `currentInstance` 设置为当前组件实例，再执行组件的 setup 函数，这样我们就可以通过 `currentInstance` 来获取当前正在被初始化的组件实例，从而将那些通过 onMounted 函数注册的钩子函数与组件实例进行关联。

以 onMounted 生命周期钩子为例进行说明。为了存储由 onMounted 函数注册的生命周期钩子，我们需要在组件实例对象上添加 `instance.mounted` 数组。**之所以 `instance.mounted` 的数据类型是数组，是因为在 setup 函数中，可以多次调用 onMounted 函数来注册不同的生命周期函数，这些生命周期函数都会存储在 `instance.mounted` 数组中**。

```js
function mountComponent(vnode, container, anchor) {
  // 省略部分代码

  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null,
    slots,
    // 在组件实例中添加 mounted 数组，用来存储通过 onMounted 函数注册的生命周期钩子函数
    mounted: []
  };

  // 省略部分代码

  // setup
  const setupContext = { attrs, emit, slots };

  // 在调用 setup 函数之前，设置当前组件实例
  setCurrentInstance(instance);
  // 执行 setup 函数
  const setupResult = setup(shallowReadonly(instance.props), setupContext);
  // 在 setup 函数执行完毕之后，重置当前组件实例
  setCurrentInstance(null);

  // 省略部分代码

  // 创建一个响应式副作用函数，用于组件的渲染和更新，实现组件的自更新
  effect(() => {
    const subTree = render.call(renderContext, renderContext);
    if (!instance.isMounted) {
      // 省略部分代码

      // 遍历 instance.mounted 数组并逐个执行即可
      instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext));
    } else {
      // 省略部分代码
    }
    instance.subTree = subTree;
  }, {
    scheduler: queueJob
  });
}
```

对于除 `mounted` 以外的生命周期钩子函数，其原理同上.

## SSR

对于服务端渲染不，存在数据变更后的重新渲染，所以无须调用 reactive 函数对 data 等数据进行包装，也无须使用shallowReactive 函数对 props 数据进行包装。正因如此，我们也无须调用 beforeUpdate 和 updated 钩子。服务端渲染时，由于不需要渲染真实 DOM 元素，所以无须调用组件的 beforeMount 和 mounted 钩子。

客户端激活的原理：在同构渲染过程中，组件的代码会分别在服务端和浏览器中执行一次。在服务端，组件会被渲染为静态的 HTML 字符串，并发送给浏览器。浏览器则会渲染由服务端返回的静态的 HTML 内容，并下载打包在静态资源中的组件代码。当下载完毕后，浏览器会解释并执行该组件代码。当组件代码在客户端执行时，由于页面中已经存在对应的 DOM 元素，所以渲染器并不会执行创建 DOM 元素的逻辑，而是会执行激活操作。激活操作可以总结为两个步骤：

- 在虚拟节点与真实 DOM 元素之间建立联系，即 `vnode.el =el`。这样才能保证后续更新程序正确运行。
- 为 DOM 元素添加事件绑定。

SSR 开发需要注意：

- 组件的生命周期。beforeUpdate、updated、beforeMount、mounted、beforeUnmount、unmounted 等生命周期钩子函数不会在服务端执行。
- 使用跨平台的 API。由于组件的代码既要在浏览器中运行，也要在服务器中运行，所以编写组件代码时，要额外注意代码的跨平台性。通常我们在选择第三方库的时候，会选择支持跨平台的库，例如使用 Axios 作为网络请求库。
- 特定端的实现。无论在客户端还是在服务端，都应该保证功能的一致性。例如，组件需要读取 cookie 信息。在客户端，我们可以通过 document.cookie 来实现读取；而在服务端，则需要根据请求头来实现读取。所以，很多功能模块需要我们为客户端和服务端分别实现。
- 避免交叉请求引起的状态污染。状态污染既可以是应用级的，也可以是模块级的。对于应用，我们应该为每一个请求创建一个独立的应用实例。对于模块，我们应该避免使用模块级的全局变量。这是因为在不做特殊处理的情况下，多个请求会共用模块级的全局变量，造成请求间的交叉污染。

## 问题

### Q1. Vue3 生命周期

![vue3生命周期](/blog/images/vue/vue3生命周期.png)

1. **setup()**
   - 用途：这是组合式 API 中最核心的部分，它在组件实例创建时同步执行，类似于 `beforeCreate` 和 `created` 钩子的组合。在这个阶段，可以初始化状态、设置响应式属性、定义计算属性等。
   - 原理：`setup()` 函数在组件实例化时被调用，它允许开发者在组件生命周期的早期阶段执行代码，相当于选项式 API 中的 `beforeCreate` 和 `created` 钩子的结合。

2. **onBeforeMount()**
   - 用途：在挂载开始之前调用，此时模板编译已完成，但尚未渲染到 DOM 中。
   - 原理：在组件的挂载阶段，`onBeforeMount` 钩子在 DOM 渲染之前被调用，允许开发者在组件挂载前执行操作，如设置 DOM 操作所需的资源。

3. **onMounted()**
   - 用途：在组件挂载完成后调用，此时可以进行 DOM 操作或访问子组件实例。
   - 原理：`onMounted` 钩子在实例挂载到 DOM 后被调用，此时可以安全地访问和操作 DOM，或者执行依赖于 DOM 的操作。

4. **onBeforeUpdate()**
   - 用途：在组件更新之前调用，此时数据已经被更改，但页面还未重新渲染。
   - 原理：`onBeforeUpdate` 钩子在响应式数据变化触发组件更新前调用，允许开发者在 Vue 更新 DOM 之前访问 DOM 状态。

5. **onUpdated()**
   - 用途：在组件更新并重新渲染后调用，此时可以访问到最新的 DOM 状态。
   - 原理：`onUpdated` 钩子在组件的 DOM 更新后被调用，允许开发者在 DOM 更新后执行操作，如检查更新后的 DOM 状态。

6. **onBeforeUnmount()**
   - 用途：在组件卸载之前调用，此时组件仍然可用，但 DOM 已经被删除。
   - 原理：`onBeforeUnmount` 钩子在组件卸载前被调用，允许开发者在组件卸载前执行清理工作，如移除事件监听器或取消网络请求。

7. **onUnmounted()**
   - 用途：在组件卸载之后调用，此时组件已经完全销毁，无法再次使用。
   - 原理：`onUnmounted` 钩子在组件被完全卸载后被调用，用于执行最终的清理工作，确保没有内存泄漏。

8. **onActivated() 和 onDeactivated()**
   - 用途：用于 `keep-alive` 包裹的组件，在它们进入或离开缓存时调用。
   - 原理：这两个钩子用于控制 `keep-alive` 缓存的组件活动状态，`onActivated` 在组件被激活时调用，`onDeactivated` 在组件被停用时调用。

9. **onErrorCaptured()**
   - 用途：当捕获一个来自子孙组件的错误时被调用。
   - 原理：`onErrorCaptured` 钩子提供了错误边界功能，允许开发者捕获并处理组件树中的错误。

10. **onRenderTracked() 和 onRenderTriggered()**
    - 用途：这两个钩子用于调试，分别在组件的渲染过程中追踪到响应式依赖时和响应式依赖触发重新渲染时调用。
    - 原理：这两个钩子仅在开发模式下可用，用于提供更细粒度的调试信息，帮助开发者理解组件的渲染依赖和触发重渲染的原因。

### Q2. Vue3 中常用的 API

1. `ref()`：创建一个响应式引用，用于基本数据类型的响应式包装。
2. `computed()`：创建一个计算属性，它是基于它们的响应式依赖进行计算的。
3. `reactive()`：创建一个响应式的对象，用于对象或数组的响应式包装。
4. `readonly()`：创建一个只读的响应式对象，用于防止修改原始数据。
5. `watchEffect()`：立即执行并跟踪其依赖项的变化，当依赖项变化时重新执行。
6. `watchPostEffect()`：类似于`watchEffect`，但只在依赖项变化后执行。
7. `watchSyncEffect()`：类似于`watchEffect`，但确保副作用同步执行。
8. `watch()`：监听一个或多个源的响应式引用，并在其变化时执行回调。
9. `onWatcherCleanup()`：注册一个回调函数，在watcher被清理时执行。
10. `shallowRef()`：创建一个浅层响应式的引用，只有最外层的属性是响应式的。
11. `triggerRef()`：手动触发一个ref的getter，使其依赖项被跟踪。
12. `customRef()`：创建一个自定义的ref，允许更细粒度的控制依赖项跟踪和更新。
13. `shallowReactive()`：创建一个浅层响应式对象，只有最外层的属性是响应式的。
14. `shallowReadonly()`：创建一个浅层只读的响应式对象。
15. `toRaw()`：将一个响应式对象转换为原始对象。
16. `markRaw()`：标记一个对象，使其不会被Vue的响应式系统转换。
17. `effectScope()`：创建一个新的effect作用域，允许手动控制effect的启动和停止。
18. `getCurrentScope()`：获取当前的effect作用域。
19. `onScopeDispose()`：注册一个回调函数，当effect作用域被销毁时执行。
20. `isRef()`：检查一个值是否是一个ref。
21. `unref()`：将一个ref或reactive对象转换为其包裹的值。
22. `toRef()`：将一个reactive对象的属性转换为ref。
23. `toValue()`：将一个ref转换为其包裹的值。
24. `toRefs()`：将一个reactive对象的所有属性转换为独立的ref。
25. `isProxy()`：检查一个对象是否是一个响应式代理。
26. `isReactive()`：检查一个对象是否是响应式的。
27. `isReadonly()`：检查一个对象是否是只读的。

### Q3. ref 与 reactive 的区别？

- ref 可以存储原始类型，而 reactive 不能。
- ref 需要通过 `<ref>.value` 访问数据，而 reactive() 可以直接用作常规对象。
可以重新分配一个全新的对象给ref的value属性，而reactive()不能。
- ref 类型为 `Ref<T>`，而 reactive 返回的反应类型为原始类型本身。
基于第四条，ref 可以自身管理依赖而 reactive 则借助全局变量以键值对的形式进行管理。
- watch 默认只观察 ref 的 value，而对 reactive 则执行深度监听。
- ref 默认会用 reactive 对象类型的原始值进行深层响应转换。

### Q4. Watch 与 WatchEffect 区别？

1. **watchEffect**：
   - 立即执行传入的函数，并在其执行过程中自动追踪其依赖的响应式数据。当这些依赖的数据发生变化时，`watchEffect`会重新执行函数。
   - 不提供新旧值的比较，因为它不追踪具体的数据源，而是追踪执行过程中访问的所有响应式数据。
   - 执行时机是在依赖变化时同步执行，除非通过配置项`flush`来指定不同的执行时机。
   - 适用于那些不需要知道具体哪些数据变化，只需要在依赖的任何数据变化时执行副作用的场景。

2. **watchPostEffect**：
   - `watchEffect`的一个变体，它会在Vue更新DOM之后执行副作用。
   - 这是`watchEffect`的默认行为，即在组件更新后触发副作用。
   - 适用于需要在DOM更新后访问更新后的DOM或执行与DOM更新相关的副作用的场景。

3. **watchSyncEffect**：
   - `watchEffect`的另一个变体，它会在响应式数据变化时同步执行副作用，而不是等待下一个事件循环。
   - 适用于需要立即响应数据变化的场景，比如在数据变化时立即执行某些计算。
   - 需要注意的是，同步执行可能会影响性能，尤其是在处理大量数据或复杂计算时。

4. **watch**：
   - 允许你明确指定要侦听的响应式引用或getter函数，并在数据变化时执行回调函数。
   - 提供了新旧值的比较，允许你在回调函数中访问变化前后的值。
   - 可以根据配置项`flush`来控制副作用的刷新时机，可以是`pre`（默认，组件更新前执行）、`post`（组件更新后执行）或`sync`（同步执行）。
   - 适用于需要精确控制监听的数据源、需要比较新旧值或需要控制回调函数触发时机的场景。

总结来说，watch提供了更精确的控制，允许你指定侦听的数据源并比较变化前后的值，而watchEffect及其变体则提供了一种更自动化的方式来追踪依赖和执行副作用，适用于不同的场景和需求。

### Q5. vue component 中 name 的作用？

组件的名字有以下用途：

- 在组件自己的模板中递归引用自己时
- 在 Vue 开发者工具中的组件树显示时
- 在组件抛出的警告追踪栈信息中显示时
- 使用 name 选项使你可以覆盖推导出的名称，或是在没有推导出名字时显式提供一个。(例如没有使用构建工具时，或是一个内联的非单文件组件)
- 有一种场景下 name 必须是已显式声明的：即 `<KeepAlive>` 通过其 include / exclude prop 来匹配其需要缓存的组件时。

::: tip 注意
在 3.2.34 或以上的版本中，使用 `<script setup>` 的单文件组件会自动根据文件名生成对应的 name 选项，即使是在配合 `<KeepAlive>` 使用时也无需再手动声明。
:::

### Q6. vue scope 的原理?

CSS作用域化：当 `<style>` 标签带有 scoped attribute 的时候，它的 CSS 只会影响当前组件的元素，和 Shadow DOM 中的样式封装类似。

```vue
<style scoped>
.example {
  color: red;
}
</style>

<template>
  <div class="example">hi</div>
</template>

// 转换为
<style>
.example[data-v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" data-v-f3f3eg9>hi</div>
</template>
```

使用 scoped 后，父组件的样式将不会渗透到子组件中。不过，子组件的根节点会同时被父组件的作用域样式和子组件的作用域样式影响。这样设计是为了让父组件可以从布局的角度出发，调整其子组件根元素的样式。

处于 scoped 样式中的选择器如果想要做更“深度”的选择，也即：影响到子组件，可以使用 `:deep()` 这个伪类

```css
<style scoped>
.a :deep(.b) {
  /* ... */
}
</style>

// 编译后
.a[data-v-f3f3eg9] .b {
  /* ... */
}
```

### Q7. CSS Modules 与 scope 的区别？

一个 `<style module>` 标签会被编译为 CSS Modules 并且将生成的 CSS class 作为 `$style` 对象暴露给组件：

```vue
<template>
  <p :class="$style.red">This should be red</p>
</template>

<style module>
.red {
  color: red;
}
</style>
```

CSS Modules 和 Vue 的 `style scoped` 都是用于封装CSS样式，确保样式的作用域局限于当前组件的技术。不过，它们在实现方式和使用场景上有所不同：

#### CSS Modules

1. **局部作用域**：
   - CSS Modules 通过将类名和动画名转换为唯一值来实现局部作用域。例如，一个名为 `.button` 的类在编译后可能变成 `.Button_1J3p3t-nsPc`，这样的命名冲突的概率极低，从而实现了局部作用域。

2. **JavaScript 交互**：
   - 使用CSS Modules时，你需要通过JavaScript导入样式，这允许你利用JavaScript的模块系统来管理样式。

3. **构建时处理**：
   - CSS Modules 的处理发生在构建时，构建工具（如Webpack）会将CSS文件中的类名替换为唯一的标识符。

4. **全局样式**：
   - CSS Modules 默认不支持全局样式。如果你需要全局样式，需要使用 `:global` 伪类或者 `:local()` 函数来指定。

5. **预处理器支持**：
   - CSS Modules 可以与各种CSS预处理器（如Sass、Less）一起使用，但需要构建工具的支持。

6. **兼容性**：
   - CSS Modules 需要构建步骤，因此不支持没有构建过程的旧浏览器。

#### Vue `style scoped`

1. **自动作用域化**：
   - Vue 的 `style scoped` 属性在编译时自动将CSS样式的作用域限制在当前组件内。Vue通过在CSS选择器上添加一个唯一的属性（如 `data-v-<hash>`）来实现这一点。

2. **HTML 模板中的直接使用**：
   - 在Vue单文件组件（.vue文件）中，你可以直接在`<style>`标签中使用`scoped`属性，无需通过JavaScript导入样式。

3. **运行时处理**：
   - Vue 的 `style scoped` 在运行时处理样式的作用域化，不需要构建步骤。

4. **全局样式**：
   - Vue 允许在全局范围内定义样式，这些样式可以被子组件继承。

5. **预处理器支持**：
   - Vue 的 `style scoped` 同样支持CSS预处理器，并且可以直接在.vue文件中使用。

6. **兼容性**：
   - Vue 的 `style scoped` 不需要构建步骤，因此可以在没有构建过程的环境中使用，如直接在浏览器中通过`<script>`标签引入Vue。

CSS Modules 提供了一种通过构建工具实现的模块化CSS的方法，它允许你在JavaScript中导入样式，并且可以很好地与模块打包器和预处理器集成。而Vue的`style scoped`提供了一种更简单、无需构建步骤的方式来实现样式的作用域化，它直接在Vue单文件组件中工作，并且可以利用Vue的构建工具链来处理预处理器。

### Q8. CSS 模块化的方式？

Q28. CSS 模块化的方式？

CSS 模块化是一种将CSS封装成独立、可重用单元的方法，有助于提高大型应用的可维护性和可扩展性。以下是一些流行的CSS模块化方式：

1. **CSS Modules**：
   - CSS Modules 是一种由Webpack推广的技术，它通过将CSS类名和动画名转换为唯一值来实现局部作用域。这种方式需要构建工具支持，并且可以在构建过程中处理CSS文件。

2. **BEM (Block Element Modifier)**：
   - BEM 是一种命名约定，用于创建可预测和可重用的CSS类名。它将UI分解为块（独立的组件）、元素（块的子部分）和修饰符（块或元素的变体）。

3. **SMACSS (Scalable and Modular Architecture for CSS)**：
   - SMACSS 是一种组织CSS的架构方法，它定义了五种类别：基础、布局、模块、状态和主题。这种结构有助于创建模块化的CSS代码。

4. **OOCSS (Object Oriented CSS)**：
   - OOCSS 是一种CSS编程范式，它鼓励将CSS视为对象的集合，这些对象可以被继承和重用，以创建更少、更具体的样式。

5. **SUIT CSS**：
   - SUIT CSS 是一个CSS命名约定，它遵循组件化和可嵌套的类名模式，以实现更模块化的CSS代码。

6. **Atomic CSS/Utility-First CSS**：
   - 这种模式强调使用功能性的、原子级的样式类，这些类可以组合在一起以创建复杂的UI组件。Tailwind CSS是这种模式的一个流行例子。

7. **PostCSS**：
   - PostCSS 是一个工具，可以让你使用JavaScript插件来转换CSS。它可以用来实现CSS模块化，例如通过插件如`postcss-modules`来实现。

8. **Styled-Components**：
   - 这是一个用于React的CSS-in-JS库，它允许你在JavaScript中直接编写CSS代码，并自动将其封装到组件的局部作用域中。

9. **CSS-in-JS**：
   - CSS-in-JS是一种将CSS代码直接嵌入到JavaScript模块中的技术。这种方法可以自动处理样式的作用域问题，并且可以与任何前端框架一起使用。

10. **预处理器**：
    - 像Sass、Less和Stylus这样的预处理器提供了变量、混合（mixins）、函数等功能，可以帮助你创建模块化的CSS代码。

每种方法都有其优势和适用场景。在实际项目中，你可能会根据项目需求、团队习惯和构建工具的支持来选择一种或多种方法来实现CSS模块化。
