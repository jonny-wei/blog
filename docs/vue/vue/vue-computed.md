# 计算属性与侦听器

## computed vs watch

- computed：计算属性，依赖其它属性值，并且 computed 的值有缓存，只有它依赖的属性值发生改变，下一次获取 computed 的值时才会重新计算 computed 的值。当我们需要进行数值计算，并且依赖于其它数据时，应该使用 computed，因为可以利用 computed 的缓存特性，避免每次获取值时，都要重新计算。当我们需要进行数值计算，并且依赖于其它数据时，应该使用 computed，因为可以利用 computed 的缓存特性，避免每次获取值时都要重新计算。

- watch：侦听器，侦听属性，无缓存性，类似于某些数据的监听回调 ，每当监听的数据变化时都会执行回调进行后续操作。当我们需要在数据变化时执行异步或开销较大的操作时，应该使用 watch，使用  watch  选项允许我们执行异步操作 ( 访问一个 API )，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。

::: tip 注意
注意，不应该使用箭头函数来定义 watcher 函数 (例如 `searchQuery: newValue => this.updateAutocomplete(newValue)`)。理由是箭头函数绑定了父级作用域的上下文，所以 this 将不会按照期望指向 Vue 实例，`this.updateAutocomplete` 将是 undefined。
:::

## computed vs methods

**计算属性是基于它们的响应式依赖进行缓存的**。只在相关响应式依赖发生改变时它们才会重新求值，而不必再次执行函数。如果需要每当触发就重新渲染时，那么就使用 methods 调用方法，它总会再次执行函数。

## 初始化

计算属性与侦听器的初始化都发生在 Vue 实例初始化阶段的 initState 函数中:

```js
// src/core/instance/state.js

export function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  // 初始化 computed
  if (opts.computed) initComputed(vm, opts.computed);
  // 初始化 watch
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

## computed

计算属性是一个 `computed watcher`, 计算属性的初始化：

```js
function initComputed(vm: Component, computed: Object) {
  // $flow-disable-line
  // 首先创建 vm._computedWatchers 为一个空对象
  const watchers = (vm._computedWatchers = Object.create(null));
  // computed properties are just getters during SSR
  const isSSR = isServerRendering();
  // 遍历 computed 对象
  for (const key in computed) {
    // 拿到计算属性的每一个 userDef 用户定义的 computed
    const userDef = computed[key];
    // computed 类型分为 function 和 对象类型，尝试获取这个 userDef 对应的 getter 函数
    const getter = typeof userDef === "function" ? userDef : userDef.get;
    if (process.env.NODE_ENV !== "production" && getter == null) {
      warn(`Getter is missing for computed property "${key}".`, vm);
    }
    /**
     * 为每一个 getter 创建一个 watcher
     * 这个 watcher 和渲染 watcher 有一点很大的不同，它是一个 computed watcher
     * 因为 const computedWatcherOptions = { computed: true }
     * computed watcher 和普通 watcher 的差别我稍后会介绍
     */
    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      );
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    /**
     * 遍历的 computed 对象中 key 是不是 vm 的属性
     * 如果是则调用 defineComputed(vm, key, userDef)，
     * 否则判断计算属性对于的 key 是否已经被 data 或者 prop 所占用
     */

    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if (process.env.NODE_ENV !== "production") {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(
          `The computed property "${key}" is already defined as a prop.`,
          vm
        );
      }
    }
  }
}
```

需要重点关注 defineComputed，其实就是利用 Object.defineProperty 给计算属性对应的 key 值添加 getter 和 setter，setter 通常是计算属性是一个对象，并且拥有 set 方法的时候才有，否则是一个空函数

```js
export function defineComputed(
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering();
  if (typeof userDef === "function") {
    // 当计算属性为一个函数时
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    // 当计算属性不是一个函数时，即为一个有 get() 和 set() 的对象
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if (
    process.env.NODE_ENV !== "production" &&
    sharedPropertyDefinition.set === noop
  ) {
    sharedPropertyDefinition.set = function() {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      );
    };
  }
  // 给计算属性对应的 key 值添加 getter 和 setter
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

createComputedGetter 返回一个函数 computedGetter，它就是计算属性对应的 getter：

```js
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}

function createGetterInvoker(fn) {
  return function computedGetter() {
    return fn.call(this, this);
  };
}
```
computed 本质是一个惰性求值的观察者。computed 内部实现了一个惰性的 watcher，也就是 computed watcher，computed watcher 不会立刻求值，同时持有一个 dep 实例。其内部通过 this.dirty 属性标记计算属性是否需要重新求值。当 computed 的依赖状态发生改变时，就会通知这个惰性的 watcher，computed watcher 通过 this.dep.subs.length 判断有没有订阅者，有的话会重新计算，然后对比新旧值，如果变化了会重新渲染。没有的话，仅仅把 this.dirty = true。 当计算属性依赖于其他数据时，属性并不会立即重新计算，只有之后其他地方需要读取属性的时候，它才会真正计算，即具备 lazy（懒计算）特性。 Vue 想确保的不仅仅是计算属性依赖的值发生变化，而是当计算属性最终计算的值发生变化时才会触发渲染 watcher 重新渲染，本质上是一种优化。 


## watch

watch 初始化：

```js
/**
 * 对 watch 对象做遍历，拿到每一个 handler，因为 Vue 是支持 watch 的同一个 key 对应多个 handler，
 * 所以如果 handler 是一个数组，则遍历这个数组，调用 createWatcher 方法，否则直接调用 createWatcher
 */
function initWatch(vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

/**
 * 首先对 hanlder 的类型做判断，拿到它最终的回调函数，
 * 最后调用 vm.$watch(keyOrFn, handler, options) 函数，
 * $watch 是 Vue 原型上的方法，它是在执行 stateMixin 的时候定义的
 */
function createWatcher(
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options);
}
```

可以看到 watch 的实现主要通过 `$watch`

```js
export function stateMixin(Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {};
  dataDef.get = function() {
    return this._data;
  };
  const propsDef = {};
  propsDef.get = function() {
    return this._props;
  };
  if (process.env.NODE_ENV !== "production") {
    dataDef.set = function() {
      warn(
        "Avoid replacing instance root $data. " +
          "Use nested data properties instead.",
        this
      );
    };
    propsDef.set = function() {
      warn(`$props is readonly.`, this);
    };
  }
  Object.defineProperty(Vue.prototype, "$data", dataDef);
  Object.defineProperty(Vue.prototype, "$props", propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function(
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options);
    }
    options = options || {};
    options.user = true;
    const watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value);
      } catch (error) {
        handleError(
          error,
          vm,
          `callback for immediate watcher "${watcher.expression}"`
        );
      }
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };
}
```

也就是说，侦听属性 watch 最终会调用 `$watch` 方法，这个方法首先判断 cb 如果是一个对象，则调用 `createWatcher` 方法，这是因为 `$watch` 方法是用户可以直接调用的，它可以传递一个对象，也可以传递函数。接着执行 `const watcher = new Watcher(vm, expOrFn, cb, options)` 实例化了一个 watcher，这里需要注意一点这是一个 `user watcher`，因为 `options.user = true`。通过实例化 watcher 的方式，一旦我们 watch 的数据发送变化，它最终会执行 watcher 的 `run` 方法，执行回调函数 cb，并且如果我们设置了 `immediate` 为 true，则直接会执行回调函数 cb。最后返回了一个 `unwatchFn` 方法，它会调用 `teardown` 方法去移除这个 watcher。

所以本质上侦听属性也是基于 Watcher 实现的，它是一个 `user watcher`。其实 Watcher 支持了 5 种不同的类型：

```js
// src/core/observer/watcher.js

if (options) {
  this.deep = !!options.deep;
  this.user = !!options.user;
  this.lazy = !!options.lazy;
  this.sync = !!options.sync;
  this.before = options.before;
} else {
  this.deep = this.user = this.lazy = this.sync = false;
}
```

### deep watcher

通常，如果我们想对一下对象做深度观测的时候，需要设置这个属性为 true。deep watcher 中调用 `traverse` 方法对一个对象做深层递归遍历，因为遍历过程中就是对一个子对象的访问，会触发它们的 getter 过程，这样就可以收集到依赖，也就是订阅它们变化的 watcher，这个函数实现还有一个小的优化，遍历过程中会把子响应式对象通过它们的 `dep id` 记录到 seenObjects，避免以后重复访问。在执行了 traverse 后，我们再对 watch 的对象内部任何一个值做修改，也会调用 watcher 的回调函数了。

### user watcher

前面我们分析过，通过 vm.\$watch 创建的 watcher 是一个 user watcher，其实它的功能很简单，在对 watcher 求值以及在执行回调函数的时候，会处理一下错误，handleError 在 Vue 中是一个错误捕获并且暴露给用户的一个利器。

### computed watcher

computed watcher 几乎就是为计算属性量身定制的，我们刚才已经对它做了详细的分析，这里不再赘述了

### sync watcher

当响应式数据发送变化后，触发了 watcher.update()，只是把这个 watcher 推送到一个队列中，在 nextTick 后才会真正执行 watcher 的回调函数。而一旦我们设置了 sync，就可以在当前 Tick 中同步执行 watcher 的回调函数。只有当我们需要 watch 的值的变化到执行 watcher 的回调函数是一个同步过程的时候才会去设置该属性为 true。

```js
update () {
  if (this.computed) {
    // ...
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```
