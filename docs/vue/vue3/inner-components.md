# 异步与内置组件

## defineAsyncComponent

异步组件，即组件懒加载，异步的方式加载并渲染一个组件，在代码分割、服务端下发组件等场景中尤为重要。

从根本上来说，异步组件的实现不需要任何框架层面的支持，用户完全可以自行实现：

```js
// 页面整体懒加载
const loader = () => import('App.vue') // 动态导入 App.vue 组件
loader().then(App => { // 当 App.vue 导入完成后
  createApp(App).mount('#app') // 创建一个 Vue 应用实例，并挂载到 id 为 app 的 DOM 元素上
})
```

若一个页面会由多个组件构成，每个组件负责渲染页面的一部分。那么，如果只想异步渲染部分页面，要怎么办呢？这时，只需要有能力异步加载某一个组件就可以了:

```vue
<template>
  <CompA /> <!-- 渲染 CompA 组件 -->
  <component :is="asyncComp" /> <!-- 动态渲染 asyncComp 组件 -->
</template>

<script>
import { shallowRef } from 'vue' // 从 Vue 中导入 shallowRef 函数
import CompA from 'CompA.vue' // 同步导入 CompA 组件

export default {
  components: { CompA }, // 注册 CompA 组件
  setup() {
    const asyncComp = shallowRef(null) // 使用 shallowRef 创建一个响应式引用，初始值为 null

    // 异步加载 CompB 组件
    import('CompB.vue').then(CompB => asyncComp.value = CompB) // 当 CompB.vue 加载完成，更新 asyncComp 的值

    return {
      asyncComp // 返回 asyncComp，使其可以在模板中使用
    }
  }
}
</script>
```

虽然可以自己实现异步懒加载组件，但是考虑不全面，开发体验差，若是从框架层面解决，那么对开发者来说就非常友好。如何设计一个异步组件呢？通常在异步加载组件时，我们还要考虑以下几个方面:

- 如果组件加载失败或加载超时，是否要渲染 Error 组件？
- 组件在加载时，是否要展示占位的内容？例如渲染一个Loading 组件。
- 组件加载的速度可能很快，也可能很慢，是否要设置一个延迟展示 Loading 组件的时间？如果组件在 200ms 内没有加载成功才展示 Loading 组件，这样可以避免由组件加载过快所导致的闪烁。
- 组件加载失败后，是否需要重试？

为了替用户更好地解决上述问题，我们需要在框架层面为异步组件提供更好的封装支持，与之对应的能力如下：

- 允许用户指定加载出错时要渲染的组件。
- 允许用户指定 Loading 组件，以及展示该组件的延迟时间。
- 允许用户设置加载组件的超时时长。
- 组件加载失败时，为用户提供重试的能力。

### 接口定义

定义一个异步组件，它在运行时是懒加载的。参数可以是一个异步加载函数，或是对加载行为进行更具体定制的一个选项对象。

[Vue 异步组件](https://cn.vuejs.org/guide/components/async.html)

```js
function defineAsyncComponent(
  source: AsyncComponentLoader | AsyncComponentOptions
): Component

type AsyncComponentLoader = () => Promise<Component>

interface AsyncComponentOptions {
  // 加载函数
  loader: AsyncComponentLoader
  // 加载异步组件时使用的组件
  loadingComponent?: Component
  // 展示加载组件前的延迟时间，默认为 200ms，防止组件闪烁
  delay?: number
  // 加载失败后展示的组件
  errorComponent?: Component
  // 如果提供了一个 timeout 时间限制，并超时了也会显示这里配置的报错组件，默认值是：Infinity
  timeout?: number
  suspensible?: boolean
  // 错误回调，可以处理失败与重试
  onError?: (
    error: Error,
    retry: () => void,
    fail: () => void,
    attempts: number
  ) => any
}


// 使用
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => {
  return new Promise((resolve, reject) => {
    // ...从服务器获取组件
    resolve(/* 获取到的组件 */)
  })
})
// ... 像使用其他一般组件一样使用 `AsyncComp`

// 通常结合打包工具这样用，作为打包时的代码分割点
const AsyncComp = defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
)
```

最后得到的 AsyncComp 是一个外层包装过的组件，仅在页面需要它渲染时才会调用加载内部实际组件的函数。它会将接收到的 props 和插槽传给内部组件，所以你可以使用这个异步的包装组件无缝地替换原始组件，同时实现延迟加载。

如果提供了一个加载组件，它将在内部组件加载时先行显示。在加载组件显示之前有一个默认的 200ms 延迟——这是因为在网络状况较好时，加载完成得很快，加载组件和最终组件之间的替换太快可能产生闪烁，反而影响用户感受。

如果提供了一个报错组件，则它会在加载器函数返回的 Promise 抛错时被渲染。你还可以指定一个超时时间，在请求耗时超过指定时间时也会渲染报错组件。

异步组件可以搭配内置的 `<Suspense>` 组件一起使用。

### 设计实现

- **加载机制**：`defineAsyncComponent` 本质上是一个高阶组件，它的返回值是一个包装组件。包装组件会根据加载器的状态来决定渲染什么内容。如果加载器成功地加载了组件，则渲染被加载的组件，否则会渲染一个占位内容。通常占位内容是一个注释节点。组件没有被加载成功时，页面中会渲染一个注释节点来占位。
- **延迟与 Loading 组件机制**: 通常，我们会从加载开始的那一刻起就展示 Loading 组件。但在网络状况良好的情况下，异步组件的加载速度会非常快，这会导致 Loading 组件刚完成渲染就立即进入卸载阶段，于是出现闪烁的情况。对于用户来说这是非常不好的体验。因此，我们需要为 Loading 组件设置一个延迟展示的时间。要一个标记变量 `loading` 来代表组件是否正在加载。如果用户指定了延迟时间，则开启延迟定时器。定时器到时后，再将 `loading.value` 的值设置为 true。无论组件加载成功与否，都要清除延迟定时器，否则会出现组件已经加载成功，但仍然展示 Loading 组件的问题。在渲染函数中，如果组件正在加载，并且用户指定了 Loading 组件，则渲染该 Loading 组件。
- **超时与错误机制**：要一个标志变量来标识异步组件的加载是否已经超时，即 `timeout.value`。开始加载组件的同时，开启一个定时器进行计时。当加载超时后，将 `timeout.value` 的值设置为 true，代表加载已经超时。这里需要注意的是，当包装组件被卸载时，需要清除定时器。包装组件根据 `loaded` 变量的值以及 `timeout` 变量的值来决定具体的渲染内容。如果异步组件加载成功，则渲染被加载的组件；如果异步组件加载超时，并且用户指定了 Error 组件，则渲染 Error 组件。为了更细腻度的控制，可为加载器添加 `catch` 语句来捕获所有加载错误。接着，当加载超时后，我们会创建一个新的错误对象，并将其赋值给 `error.value` 变量。在组件渲染时，只要 `error.value` 的值存在，且用户配置了 `errorComponent` 组件，就直接渲染 `errorComponent` 组件并将 `error.value` 的值作为该组件的 `props` 传递。这样，用户就可以在自己的 Error 组件上，通过定义名为 `error` 的 `props` 来接收错误对象，从而实现细粒度的控制。
- **失败重试机制**: 将新的 Promise 实例的 resolve 和 reject 分别封装为 `retry` 函数和 `fail` 函数，并将它们作为 onError 回调函数的参数。这样，用户就可以在错误发生时主动选择重试或直接抛出错误。

```js
import { ref, shallowRef, h, onBeforeUnmount, nextTick } from 'vue';

/**
 * 加载异步组件
 * @param {Function} loader - 加载器函数
 * @param {Function} onError - 错误处理回调函数
 * @param {number} retries - 当前重试次数
 * @returns {Promise} - 返回一个 Promise 实例
 */
function load(loader, onError, retries = 0) {
  return loader()
    .catch((err) => {
      // 如果用户指定了 onError 回调，则将控制权交给用户
      if (onError) {
        // 返回一个新的 Promise 实例
        return new Promise((resolve, reject) => {
          // 重试
          const retry = () => {
            retries++;
            resolve(load(loader, onError, retries));
          };
          // 失败
          const fail = () => reject(err);
          // 作为 onError 回调函数的参数，让用户来决定下一步怎么做
          onError(retry, fail, retries);
        });
      } else {
        throw err; // 如果没有指定 onError，则直接抛出错误
      }
    });
}

/**
 * 定义异步组件
 * @param {Object|Function} options - 异步组件的配置选项或加载器函数
 * @returns {Object} - 返回一个 Vue 组件对象
 */
function defineAsyncComponent(options) {
  // 如果 options 是一个函数，则将其转换为对象形式，其中 loader 为该函数
  if (typeof options === 'function') {
    options = { loader: options };
  }

  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    timeout,
    onError
  } = options;

  let InnerComp = null; // 存储加载的组件

  // 创建一个 Vue 组件对象
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false);
      const error = shallowRef(null);
      const loading = ref(false);

      let loadingTimer = null; // 延迟加载的定时器
      let timeoutTimer = null; // 超时的定时器

      // 如果配置了延迟加载，则设置定时器，在延迟时间后将 loading 设置为 true
      if (delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true;
        }, delay);
      } else {
        // 如果没有配置延迟，则立即设置为加载中
        loading.value = true;
      }

      // 如果配置了超时时间，则设置超时定时器
      if (timeout) {
        timeoutTimer = setTimeout(() => {
          const err = new Error(`Async component timed out after ${timeout}ms.`);
          error.value = err;
        }, timeout);
      }

      // 调用 load 函数加载组件
      load(loader, onError)
        .then(c => {
          InnerComp = c;
          loaded.value = true;
        })
        .catch((err) => {
          error.value = err;
        })
        .finally(() => {
          loading.value = false;
          clearTimeout(loadingTimer);
          clearTimeout(timeoutTimer);
        });

      // 在组件卸载前清理定时器，防止内存泄漏
      onBeforeUnmount(() => {
        clearTimeout(loadingTimer);
        clearTimeout(timeoutTimer);
      });

      // 渲染逻辑
      return () => {
        if (loaded.value) {
          // 如果组件已加载，则渲染组件
          return h(InnerComp);
        } else if (error.value && errorComponent) {
          // 如果有错误且提供了错误组件，则渲染错误组件
          return h(errorComponent, { error: error.value });
        } else if (loading.value && loadingComponent) {
          // 如果正在加载且提供了加载组件，则渲染加载组件
          return h(loadingComponent);
        } else {
          // 如果以上条件都不满足，则返回占位符
          return h('div', { style: 'visibility: hidden;' }, 'Loading...');
        }
      };
    }
  };
}
```

## KeepAlive

`<KeepAlive>` 是一个内置组件，它的功能是在多个组件间动态切换时缓存被移除的组件实例。`<KeepAlive>` 包裹动态组件时，会缓存不活跃的组件实例，而不是销毁它们。何时候都只能有一个活跃组件实例作为 `<KeepAlive>` 的直接子节点。当一个组件在 `<KeepAlive>` 中被切换时，它的 `activated` 和 `deactivated` 生命周期钩子将被调用，用来替代 `mounted` 和 `unmounted`。这适用于 `<KeepAlive>` 的直接子节点及其所有子孙节点。

[Vue KeepAlive](https://cn.vuejs.org/guide/built-ins/keep-alive.html)

### 接口定义

```js
interface KeepAliveProps {
  /**
   * 如果指定，则只有与 `include` 名称
   * 匹配的组件才会被缓存。
   */
  include?: MatchPattern
  /**
   * 任何名称与 `exclude`
   * 匹配的组件都不会被缓存。
   */
  exclude?: MatchPattern
  /**
   * 最多可以缓存多少组件实例。
   */
  max?: number | string
}

type MatchPattern = string | RegExp | (string | RegExp)[]
```

### 设计实现

- **标记后不被卸载而是失活**: `shouldKeepAlive` 该属性会被添加到“内部组件”的 vnode 对象上，这样当渲染器卸载“内部组件”时，可以通过检查该属性得知“内部组件”需要被 `KeepAlive`。于是，渲染器就不会真的卸载“内部组件”​，而是会调用 `_deActivate` 函数完成搬运工作。
- **访问缓存的组件实例**：`keepAliveInstance`​“内部组件”的 `vnode` 对象会持有 `KeepAlive` 组件实例，在 `unmount` 函数中会通过 `keepAliveInstance` 来访问 `_deActivate` 函数。
- **执行激活和失活钩子**：失活的本质就是将组件所渲染的内容移动到隐藏容器中，而激活的本质是将组件所渲染的内容从隐藏容器中搬运回原来的容器。
- **缓存策略与管理**：采用 **LRU** 算法，见 [KeepAlive 原理 - 问题Q2](/vue/vue/vue-diff.html#问题)

```js
import { ref, shallowReactive, createVNode, render, unmount, createApp, h, isVNode } from 'vue';

// KeepAlive 组件
const KeepAlive = {
  // KeepAlive 组件独有的属性，用作标识
  __isKeepAlive: true,
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array]
  },
  setup(props, { slots }) {
    // 创建一个缓存对象，用于存储组件的虚拟节点 [vnode.type, vnode]
    const cache = new Map();

    // 当前 KeepAlive 组件的实例
    const instance = getCurrentInstance();

    // 对于 KeepAlive 组件来说，它的实例上存在特殊的 keepAliveCtx 对象，该对象由渲染器注入
    // 该对象会暴露渲染器的一些内部方法，其中 move 函数用来将一段 DOM 移动到另一个容器中
    const { move, createElement } = instance.keepAliveCtx;

    // 创建隐藏容器，用于存储缓存的组件
    const storageContainer = createElement('div');

    // KeepAlive 组件的实例上会被添加两个内部函数，分别是 _deActivate 和 _activate
    // 这两个函数会在渲染器中被调用
    instance._deActivate = (vnode) => {
      // 将组件从当前位置移动到隐藏容器中
      move(vnode, storageContainer);
    };

    instance._activate = (vnode, container, anchor) => {
      // 将组件从隐藏容器中移动到目标容器中
      move(vnode, container, anchor);
    };

    return () => {
      // KeepAlive 的默认插槽就是要被 KeepAlive 的组件
      let rawVNode = slots.default ? slots.default()[0] : null;

      // 如果不是组件，直接渲染即可，因为非组件的虚拟节点无法被 KeepAlive
      if (!rawVNode || typeof rawVNode.type !== 'object') {
        return rawVNode;
      }

      // 获取“内部组件”的 name
      const name = getComponentName(rawVNode.type);

      // 对 name 进行匹配
      if (
        name &&
        (
          // 如果 name 无法被 include 匹配
          (props.include && !matches(props.include, name)) ||
          // 或者被 exclude 匹配
          (props.exclude && matches(props.exclude, name))
        )
      ) {
        // 则直接渲染“内部组件”，不对其进行后续的缓存操作
        return rawVNode;
      }

      // 在挂载时先获取缓存的组件 vnode
      const cachedVNode = cache.get(rawVNode.type);

      if (cachedVNode) {
        // 如果有缓存的内容，则说明不应该执行挂载，而应该执行激活
        // 继承组件实例
        rawVNode.component = cachedVNode.component;
        // 在 vnode 上添加 keptAlive 属性，标记为 true，避免渲染器重新挂载它
        rawVNode.keptAlive = true;
      } else {
        // 如果没有缓存，则将其添加到缓存中，这样下次激活组件时就不会执行新的挂载动作了
        cache.set(rawVNode.type, rawVNode);
      }

      // 在组件 vnode 上添加 shouldKeepAlive 属性，并标记为 true，避免渲染器真的将组件卸载
      rawVNode.shouldKeepAlive = true;
      // 将 KeepAlive 组件的实例也添加到 vnode 上，以便在渲染器中访问
      rawVNode.keepAliveInstance = instance;

      // 渲染组件 vnode
      return rawVNode;
    };
  }
};

// 获取组件的名称
function getComponentName(Component) {
  return Component.name || Component.displayName || (Component.__file && Component.__file.match(/\/([^/]+)\.vue$/)[1]);
}

// 匹配函数
function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.some(p => matches(p, name));
  } else if (typeof pattern === 'string') {
    return pattern.split(',').includes(name);
  } else if (pattern instanceof RegExp) {
    return pattern.test(name);
  }
  return false;
}

// 获取当前组件实例
function getCurrentInstance() {
  // 这里假设有一个全局变量 currentInstance 来存储当前组件实例
  // 在实际的 Vue 3 源码中，这个变量是由运行时环境提供的
  return currentInstance;
}

// 卸载操作
function unmount(vnode) {
  if (vnode.type === Fragment) {
    vnode.children.forEach(c => unmount(c));
    return;
  } else if (typeof vnode.type === 'object') {
    // vnode.shouldKeepAlive 是一个布尔值，用来标识该组件是否应该被 KeepAlive
    if (vnode.shouldKeepAlive) {
      // 对于需要被 KeepAlive 的组件，我们不应该真的卸载它，而应调用该组件的父组件，
      // 即 KeepAlive 组件的 _deActivate 函数使其失活
      vnode.keepAliveInstance._deActivate(vnode);
    } else {
      unmount(vnode.component.subTree);
    }
    return;
  }
  const parent = vnode.el.parentNode;
  if (parent) {
    parent.removeChild(vnode.el);
  }
}

// 补丁函数
function patch(n1, n2, container, anchor) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1);
    n1 = null;
  }

  const { type } = n2;

  if (typeof type === 'string') {
    // 省略部分代码
  } else if (type === Text) {
    // 省略部分代码
  } else if (type === Fragment) {
    // 省略部分代码
  } else if (typeof type === 'object' || typeof type === 'function') {
    // component
    if (!n1) {
      // 如果该组件已经被 KeepAlive，则不会重新挂载它，而是会调用 _activate 来激活它
      if (n2.keptAlive) {
        n2.keepAliveInstance._activate(n2, container, anchor);
      } else {
        mountComponent(n2, container, anchor);
      }
    } else {
      patchComponent(n1, n2, anchor);
    }
  }
}

// 挂载组件
function mountComponent(vnode, container, anchor) {
  const instance = {
    state: {},
    props: shallowReactive(vnode.props || {}),
    isMounted: false,
    subTree: null,
    slots: vnode.children,
    mounted: [],
    // 只有 KeepAlive 组件的实例下会有 keepAliveCtx 属性
    keepAliveCtx: null
  };

  // 检查当前要挂载的组件是否是 KeepAlive 组件
  const isKeepAlive = vnode.type.__isKeepAlive;
  if (isKeepAlive) {
    // 在 KeepAlive 组件实例上添加 keepAliveCtx 对象
    instance.keepAliveCtx = {
      // move 函数用来移动一段 vnode
      move(vnode, container, anchor) {
        // 本质上是将组件渲染的内容移动到指定容器中，即隐藏容器中
        insert(vnode.component.subTree.el, container, anchor);
      },
      createElement
    };
  }

  // 调用组件的 setup 函数
  const setupResult = vnode.type.setup ? vnode.type.setup(vnode.props, { slots: vnode.children }) : null;

  // 如果 setup 返回的是一个渲染函数或 VNode，则直接使用
  if (typeof setupResult === 'function' || isVNode(setupResult)) {
    instance.subTree = createVNode('div');
    render(instance.subTree, container, anchor);
  } else if (typeof setupResult === 'object') {
    // 如果 setup 返回的是一个对象，则将其作为组件的上下文
    instance.ctx = setupResult;
  }

  // 标记组件已挂载
  instance.isMounted = true;
}
```

## Teleport

`<Teleport>` 是一个内置组件，它可以将一个组件内部的一部分模板“传送”到该组件的 DOM 结构外层的位置去。常用于 `<Teleport>` 和 `<Transition>` 结合使用来创建一个带动画的模态框。

痛点：一个组件模板的一部分在逻辑上从属于该组件，但从整个应用视图的角度来看，它在 DOM 中应该被渲染在整个 Vue 应用外部的其他地方。这类场景最常见的例子就是全屏的模态框。理想情况下，我们希望触发模态框的按钮和模态框本身是在同一个组件中，因为它们都与组件的开关状态有关。但这意味着该模态框将与按钮一起渲染在应用 DOM 结构里很深的地方。这会导致该模态框的 CSS 布局代码很难写。这种 “蒙层” 优先级的问题在 Vue.js 2 中我们只能通过原生 DOM API 来手动搬运 DOM 元素实现需求。这么做的缺点在于，手动操作 DOM 元素会使得元素的渲染与 Vue.js 的渲染机制脱节，并导致各种可预见或不可预见的问题。

### 接口定义

将其插槽内容渲染到 DOM 中的另一个位置。

```js
interface TeleportProps {
  /**
   * 必填项。指定目标容器。
   * 可以是选择器或实际元素。
   */
  to: string | HTMLElement
  /**
   * 当值为 `true` 时，内容将保留在其原始位置
   * 而不是移动到目标容器中。
   * 可以动态更改。
   */
  disabled?: boolean
  /**
   * 当值为 `true` 时，Teleport 将推迟
   * 直到应用的其他部分挂载后
   * 再解析其目标。(3.5+)
   */
  defer?: boolean
}
```

### 设计实现

首先我们要将 Teleport 组件的渲染逻辑从渲染器中分离出来，这么做有两点好处：

- 可以避免渲染器逻辑代码“膨胀”​；
- 当用户没有使用 Teleport 组件时，由于 Teleport 的渲染逻辑被分离，因此可以利用 TreeShaking 机制在最终的 bundle 中删除 Teleport 相关的代码，使得最终构建包的体积变小。

**实现了渲染逻辑分离**：`_isTeleport` 标识来判断该组件是否是 `Teleport` 组件。如果是，则直接调用组件选项中定义的 `process` 函数将渲染控制权完全交接出去，这样就实现了渲染逻辑的分离。
**组件挂载**：即使 Teleport 渲染逻辑被单独分离出来，它的渲染思路仍然与渲染器本身的渲染思路保持一致。通过判断旧的虚拟节点（n1）是否存在，来决定是执行挂载还是执行更新。如果要执行挂载，则需要根据 `props.to` 属性的值来取得真正的挂载点。最后，遍历 Teleport 组件的 `children` 属性，并逐一调用 `patch` 函数完成子节点的挂载。
**组件更新**：只需要调用 `patchChildren` 函数完成更新操作即可。不过有一点需要额外注意，更新操作可能是由于 Teleport 组件的 to 属性值的变化引起的，因此，在更新时我们应该考虑组件的类型并通过 `move` 移动节点。

```js
const Teleport = {
  __isTeleport: true, // 标识该组件为 Teleport 组件
  process(n1, n2, container, anchor, internals) {
    // 参数解释：
    // n1: 旧的 VNode，如果存在则表示这是一个更新操作
    // n2: 新的 VNode，表示当前要处理的 VNode
    // container: 当前组件的容器，即父组件的挂载点
    // anchor: 挂载点的锚点，用于确定子节点在容器中的位置
    // internals: 渲染器的内部方法，包括 patch、move 等

    // 通过 internals 参数取得渲染器的内部方法
    const { patch, move } = internals;

    // 如果旧 VNode n1 不存在，则是全新的挂载，否则执行更新
    if (!n1) {
      // 挂载
      // 获取容器，即挂载点
      const target = typeof n2.props.to === 'string'
        ? document.querySelector(n2.props.to) // 如果 to 是字符串，使用 querySelector 获取 DOM 元素
        : n2.props.to; // 如果 to 是 DOM 元素，直接使用

      // 将 n2.children 渲染到指定挂载点
      n2.children.forEach(c => patch(null, c, target, anchor)); // 逐个子节点进行挂载
    } else {
      // 更新
      // 获取新旧挂载点
      const prevTarget = n1.target; // 旧挂载点
      const newTarget = typeof n2.props.to === 'string'
        ? document.querySelector(n2.props.to) // 新挂载点
        : n2.props.to;

      // 如果新旧挂载点不同，则需要移动子节点
      if (prevTarget !== newTarget) {
        // 移动子节点到新的挂载点
        n2.children.forEach(c => {
          // 移动每个子节点
          if (c.component) {
            // 如果子节点是组件，移动其子树的根元素
            move(c.component.subTree, newTarget, anchor);
          } else {
            // 如果子节点是普通元素，直接移动
            move(c, newTarget, anchor);
          }
        });
      }

      // 更新子节点
      n2.children.forEach(c => {
        patch(n1.children.find(n => n.key === c.key), c, newTarget, anchor); // 逐个子节点进行更新
      });
    }

    // 将新的挂载点保存到 VNode 上，以便在卸载时使用
    n2.target = newTarget;
    n2.targetAnchor = anchor;
  }
};
```

Teleport 本质上是渲染器逻辑的合理抽象，它完全可以作为渲染器的一部分而存在。
