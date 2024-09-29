# 设计响应式系统

- 副作用：一个函数的执行会直接或间接影响其他函数的执行，这时我们说该函数函数产生了副作用，即是副作用函数。
- 响应式数据：副作用函数中所依赖的数据发生变化后，副作用函数能自动执行，那么该数据就是响应式数据。
- 实现响应式数据：拦截一个对象的读取和设置操作，读取时收集依赖的副作用函数，设置时触发对应的副作用函数执行。
- 如何拦截对象读写操作：`Object.defineProperty`(vue2)、`Proxy`(vue3)。
- 可调度性设计：指的是当在设置时触发依赖，副作用函数重新执行时，有能力决定副作用函数执行的时机、次数以及方式。
- 计算属性设计：基于可调度性设计，实现懒执行的副作用函数和结果的缓存。
- 侦听器设计：基于可调度性设计和懒执行副作用函数，实现响应式数据的可观测。

## 响应式系统

### 核心设计

```js
// 存储依赖关系的桶
// 响应式对象与副作用的依赖关系，key 是响应式对象，弱应用，不影响垃圾回收
const bucket = new WeakMap();
// 当前激活的副作用函数
let activeEffect = null;
// 用于存储当前激活的副作用函数，主要解决副作用嵌套导致的依赖相互影响的问题
const effectStack = [];

// 创建一个响应式对象
function reactive(target) {
  return new Proxy(target, {
    // 拦截读取操作 - 收集依赖追踪变化，
    get(target, key) {
      // 将副作用函数 activeEffect 添加到存储到依赖关系桶中
      track(target, key);
      return target[key];
    },
    // 拦截设置操作 - 触发依赖更新
    set(target, key, value) {
      target[key] = value;
      // 把副作用函数从桶里取出并执行
      trigger(target, key);
      return true;
    }
  });
}

// 收集依赖，跟踪依赖关系
function track(target, key) {
  if (!activeEffect) return;
  // 获取响应式对象所有字段的依赖关系 depsMap (Map 数据类型)
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  // 获取该当前段的依赖集合 deps (Set 数据类型)
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  // 将当前副作用加入依赖集合，收集依赖
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

// 触发依赖更新
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  // 获取该字段所欲依赖副作用函数并执行
  const effects = depsMap.get(key);

  // 重新用 Set 构造并遍历，解决直接遍历 effects 集合，可能导致的无限执行问题
  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行，避免无限循环栈溢出
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })

  effectsToRun.forEach(effectFn => effectFn()) 
}

// 创建一个副作用函数
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    // 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
    activeEffect = effectFn;
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(effectFn);
    fn();
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };
  // 存储所有与该副作用函数关联的依赖集合，用于准确清理
  effectFn.deps = [];
  effectFn();
}

// 清理旧的依赖关系，目的是清除可能会产生遗留的副作用函数，例如三元表达式等条件分支产生遗留的副作用函数
function cleanup(effectFn) {
  for (let deps of effectFn.deps) {
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

// 示例使用
const data = { text: 'hello' };
const state = reactive(data);

effect(() => {
  console.log(state.text); // 输出: hello
});

setTimeout(() => {
  state.text = 'world'; // 输出: world
}, 1000);
```

### 依赖关系 “bucket” 的数据结构设计

- `WeakMap` 由 `target --> Map` 构成。**WeakMap 经常用于存储那些只有当 key 所引用的对象存在时（没有被回收）才有价值的信息**。由于 WeakMap 的 key 是弱引用，它不影响垃圾回收器的工作，所以一旦表达式执行完毕，垃圾回收器就会把对象从内存中移除，防止内存溢出。
- `Map` 由 `key --> Set` 构成。

其中 WeakMap 的键是原始对象 target，WeakMap 的值是一个 Map 实例，而 Map 的键是原始对象 target 的 key，Map 的值是一个由副作用函数组成的 Set：

![vue3响应式数据结构设计](/blog/images/vue/vue3响应式数据结构设计.png)

### 依赖收集和触发，副作用函数的处理

- **`cleanup`** 函数接收副作用函数作为参数，遍历副作用函数的 `effectFn.deps` 数组，该数组的每一项都是一个依赖集合，然后将该副作用函数从依赖集合中移除，最后重置 `effectFn.deps` 数组。避免副作用函数产生遗留。

- **`effectStack` 副作用函数栈作用**：在副作用函数执行时，将当前副作用函数压入栈中，待副作用函数执行完毕后将其从栈中弹出，并始终让 `activeEffect` 指向栈顶的副作用函数。这样就能做到一个响应式数据只会收集直接读取其值的副作用函数，而不会出现副作用嵌套导致互相影响的情况。activeEffect 没有变化，它仍然指向当前正在执行的副作用函数。不同的是，当前执行的副作用函数会被压入栈顶，这样当副作用函数发生嵌套时，栈底存储的就是外层副作用函数，而栈顶存储的则是内层副作用函数

## 调度设计

- **任务调度队列 jobQueue**，是一个 Set 数据结构，目的是利用 Set 数据结构的自动去重能力，存储待执行的副作用函数，避免重复添加相同的函数。
- **isFlushing 标志**：用于标记是否正在执行调度队列中的任务，防止多次调度。
- **trigger 函数**：
  - 当属性值发生变化时，将相关的副作用函数添加到 `jobQueue` 中。
  - 如果副作用函数有自定义的调度器（scheduler），则调用该调度器。
  - 如果当前没有正在执行调度队列中的任务，则调用 `queueFlush` 函数开始调度。
- **queueFlush 函数**：使用 `Promise.resolve().then(flushJobs)` 添加进微任务队列来异步执行 `flushJobs` 函数，确保调度在当前宏任务结束后执行。
- **flushJobs 函数**：
  - 遍历 `jobQueue` 中的所有副作用函数并执行它们，在微任务队列内完成对 jobQueue 的遍历执行。
  - 清空 `jobQueue`，并将 `isFlushing` 标志重置为 false。

```js
// 存储依赖关系的桶
const bucket = new WeakMap();
// 当前激活的副作用函数
let activeEffect = null;
// 用于存储当前激活的副作用函数，主要解决副作用嵌套导致的依赖相互影响的问题
const effectStack = [];

// 调度队列， 利用 Set 数据结构去重
const jobQueue = new Set();
// 标记是否正在刷新队列
let isFlushing = false;

// 创建一个响应式对象
function reactive(target) {
  return new Proxy(target, {
    // 拦截读取操作 - 收集依赖追踪变化
    get(target, key) {
      // 将副作用函数 activeEffect 添加到存储到依赖关系桶中
      track(target, key);
      return target[key];
    },
    // 拦截设置操作 - 触发依赖更新
    set(target, key, value) {
      target[key] = value;
      // 把副作用函数从桶里取出并执行
      trigger(target, key);
      return true;
    }
  });
}

// 收集依赖，跟踪依赖关系
function track(target, key) {
  if (!activeEffect) return;
  // 获取响应式对象所有字段的依赖关系 depsMap (Map 数据类型)
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  // 获取该当前段的依赖集合 deps (Set 数据类型)
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  // 将当前副作用加入依赖集合，收集依赖
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

// 触发依赖更新
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  // 获取该字段所欲依赖副作用函数并执行
  const effects = depsMap.get(key);

  // 重新用 Set 构造并遍历，解决直接遍历 effects 集合，可能导致的无限执行问题
  const effectsToRun = new Set();
  effects && effects.forEach(effectFn => {
    // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行，避免无限循环栈溢出
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn);
    }
  });

  // 将需要执行的副作用函数加入调度队列
  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      jobQueue.add(effectFn);
    }
  });

  // 如果当前没有正在执行调度队列中的任务，则调用 queueFlush 函数开始调度
  if (!isFlushing) {
    isFlushing = true;
    queueFlush();
  }
}

// 清理旧的依赖关系，目的是清除可能会产生遗留的副作用函数，例如三元表达式等条件分支产生遗留的副作用函数
function cleanup(effectFn) {
  for (let deps of effectFn.deps) {
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

// 创建一个副作用函数
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    // 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
    activeEffect = effectFn;
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(effectFn);
    fn();
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };
  // 存储所有与该副作用函数关联的依赖集合，用于准确清理
  effectFn.deps = [];

  effectFn.options = options;
  
  // 没加入懒执行前时立即执行
  effectFn();
}

// 调度器
function queueFlush() {
  Promise.resolve().then(flushJobs);
}

// 执行调度队列中的任务
function flushJobs() {
  jobQueue.forEach(job => job());
  jobQueue.clear();
  isFlushing = false;
}

// 示例使用
const data = { text: 'hello' };
const state = reactive(data);

effect(() => {
  console.log(state.text); // 输出: hello
});

setTimeout(() => {
  state.text = 'world'; // 输出: world
}, 1000);

// 带有调度器的副作用函数
effect(
  () => {
    console.log('Scheduled effect:', state.text);
  },
  {
    scheduler: (effectFn) => {
      // 自定义调度逻辑，例如防抖、节流等
      setTimeout(effectFn, 1000);
    }
  }
);

// 懒执行示例
const lazyEffect = effect(
  () => {
    console.log('Lazy effect:', state.text);
  },
  { lazy: true }
);

// 手动触发懒执行
lazyEffect();
```

## 计算属性

### 懒执行副作用函数

懒执行的 effect，即 lazy 的 effect，之前的 effect 函数会立即执行传递给它的副作用函数。但在有些场景下，我们并不希望它立即执行，而是希望它在需要的时候才执行。

我们将副作用函数 effectFn 作为 effect 函数的返回值，这就意味着当调用 effect 函数时，通过其返回值能够拿到对应的副作用函数，这样我们就能手动执行该副作用副作用函数。

```js
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    // 将 fn 的执行结果存储到 res 中
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    // 将 res 作为 effectFn 的返回值
    return res;
  };
  effectFn.options = options;
  effectFn.deps = [];

  // 只有非 lazy 的时候，才执行
  if (!options.lazy) {
    // 执行副作用函数
    effectFn();
  }
  // 将副作用函数作为返回值返回
  return effectFn;
}

// 用例
function computed(getter) {
  // 将 getter 作为副作用函数，并创建一个惰性执行的 effect
  const effectFn = effect(getter, {
    lazy: true
  });

  const obj = {
    // 当访问 value 属性时，才执行 effectFn
    get value() {
      return effectFn();
    }
  };

  return obj;
}
```

通过新增的代码可以看到，传递给 effect 函数的参数 fn 才是真正的副作用函数，而 effectFn 是我们包装后的副作用函数。为了通过 effectFn 得到真正的副作用函数 fn 的执行结果，我们需要将其保存到 res 变量中，然后将其作为 effectFn 函数的返回值。

定义一个 computed 函数，它接收一个 getter 函数作为参数，我们把 getter 函数作为副作用函数，用它创建一个lazy 的 effect。computed 函数的执行会返回一个对象，该对象的 value 属性是一个访问器属性，只有当读取 value 的值时，才会执行 effectFn 并将其结果作为返回值返回。

上面实现的计算属性只做到了懒计算，也就是说，只有当你真正读取 obj.value 的值时，它才会进行计算并得到值。但是还做不到对值进行缓存，即假如我们多次访问 obj.value 的值，会导致 effectFn 进行多次计算，即使 obj.value 的值本身并没有变化。

那么就需要对值进行缓存：

### 缓存计算结果

```js
function computed(getter) {
  let value;
  let dirty = true;

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true;
        // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
        trigger(obj, 'value');
      }
    }
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      // 当读取 value 时，手动调用 track 函数进行追踪
      track(obj, 'value');
      return value;
    }
  };

  return obj;
}
```

上述就是 `computed` 的简单实现：

- value: 用于存储计算后的值。
- dirty: 用于标记计算值是否需要重新计算。初始值为 true，表示需要计算。
- effectFn: 是一个惰性的 effect，它不会立即执行，而是在首次被调用时执行。
- scheduler: 是一个调度器函数，当 effect 的依赖发生变化时，会调用这个调度器。在这里，调度器的作用是：
  - 检查 dirty 是否为 false，如果是，则将其设置为 true。
  - 调用 trigger 函数，手动触发响应，通知所有依赖此计算属性的观察者。解决 effect 嵌套问题。
- obj 对象有一个 value 属性，该属性是一个 getter。当访问 value 属性时：
  - 如果 dirty 为 true，则调用 effectFn 重新计算值，并将 dirty 标记为 false。
  - 调用 track 函数，手动追踪对 value 的访问，以便在依赖的数据发生变化时能够触发重新计算。返回计算后的值。

## 侦听器

通过前面的介绍，我们知道这会在副作用函数与响应式数据之间建立联系，当响应式数据变化时，会触发副作用函数重新执行。但有一个例外，即如果副作用函数存在 scheduler 选项，当响应式数据发生变化时，会触发 scheduler 调度函数执行，而非直接触发副作用函数执行。从这个角度来看，其实 scheduler 调度函数就相当于一个回调函数，而 watch 的实现就是利用了这个特点。

```js
// 深度遍历响应式对象
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return;
  }
  seen.add(value);
  for (const k in value) {
    traverse(value[k], seen);
  }
  return value;
}

// 创建一个监听器
function watch(source, cb) {
  let getter;

  if (typeof source === 'function') {
    getter = source;
  } else {
    // 确保所有嵌套的响应式属性都被收集到依赖关系中
    getter = () => traverse(source);
  }

  // 定义旧值与新值
  let oldValue, newValue;
  // 使用 effect 注册副作用函数时，开启 lazy 选项，并把返回值存储到 effectFn 中以便后续手动调用
  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler() {
        // 在 scheduler 中重新执行副作用函数，得到的是新值
        newValue = effectFn();
        // 将旧值和新值作为回调函数的参数
        cb(newValue, oldValue);
        // 更新旧值，不然下一次会得到错误的旧值
        oldValue = newValue;
      }
    }
  );
  // 手动调用副作用函数，拿到的值就是旧值
  oldValue = effectFn();
}
```

手动调用 effectFn 函数得到的返回值就是旧值，即第一次执行得到的值。当变化发生并触发 scheduler 调度函数执行时，会重新调用 effectFn 函数并得到新值，这样我们就拿到了旧值与新值。

### 立即执行和回调时机

`immediate`：如果为 true，则在第一次调用 watch 时立即执行回调函数。
`flush`：控制回调函数的执行时机，可以是 `pre`（同步执行，组件更新前）、`post`（在当前同步任务完成后执行, 代表调度函数需要将副作函数放到一个微任务队列中，并等待 DOM 更新结束后再执行）或 `sync`（立即同步执行）。

本质上是利用了调用器和异步的微任务队列。

```js
// 创建一个监听器
function watch(source, cb, options = {}) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  // 定义旧值与新值
  let oldValue, newValue;


  const job = () => {
    newValue = effectFn();
    cb(newValue, oldValue);
    oldValue = newValue;
  };

  // 使用 effect 注册副作用函数时，开启 lazy 选项，并把返回值存储到 effectFn 中以便后续手动调用
  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        // 在调度函数中判断 flush 是否为 'post'，如果是，将其放到微任务队列中执行
        if (options.flush === 'post') {
          const p = Promise.resolve();
          p.then(job);
        } else {
          job();
        }
      }
    }
  );

  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}

// 示例使用
const data = { text: 'hello', count: 1 };
const state = reactive(data);

watch(
  () => state.text,
  (newValue, oldValue) => {
    console.log(`text changed from ${oldValue} to ${newValue}`);
  },
  { immediate: true, flush: 'post' }
);

watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log(`count changed from ${oldValue} to ${newValue}`);
  },
  { immediate: true, flush: 'pre' }
);

setTimeout(() => {
  state.text = 'world'; // 输出: text changed from hello to world
  state.count = 2; // 输出: count changed from 1 to 2
}, 1000);
```

以上实现了一个简单的 watch，调度器函数内检测 `options.flush` 的值是否为 `post`，如果是，则将 `job` 函数放到微任务队列中，从而实现异步延迟执行；否则直接执行 `job` 函数，这本质上相当于 `sync` 的实现机制，即同步执行。对于 `options.flush` 的值为 `pre` 的情况，我们暂时还没有办法模拟，因为这涉及组件的更新时机，其中 `pre` 和 `post` 原本的语义指的就是组件更新前和更新后，不过这并不影响我们理解如何控制回调函数的更新时机。

### 竞态问题 - 过期的副作用

```js
let finalData;

watch(obj, async () => {
  // 发送并等待网络请求
  const res = await fetch('/path/to/request');
  // 将请求结果赋值给 finalData
  finalData = res;
});
```

假设我们第一次修改 obj 对象的某个字段值，这会导致回调函数执行，同时发送了第一次请求A。随着时间的推移，在请求 A 的结果返回之前，我们对 obj对象的某个字段值进行了第二次修改，这会导致发送第二次请 求 B。此时请求 A 和请求 B 都在进行中，那么哪一个请求会先返回结果呢？我们不确定，如果请求 B 先于请求 A 返回结果，就会导致最终 finalData 中存储的是 A 请求的结果，但由于请求 B 是后发送的，因此我们认为请求 B 返回的数据才是“最新”的，而请求 A 则应该被视为“过期”的，所以我们希望变量 finalData 存储的值应该是由请求 B 返回的结果，而非请求 A 返回的结果。产生竟态问题。

请求 A 是副作用函数第一次执行所产生的副作用，请求 B 是副作用函数第二次执行所产生的副作用。由于请求 B 后发生，所以请求 B 的结果应该被视为“最新”的，而请求 A 已经“过期”了，其产生的结果应被视为无效。通过这种方式，就可以避免竞态问题导致的错误结果。

```js
function watch(source, cb, options = {}) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }

  let oldValue, newValue;
  let cleanup;

  // 定义 onInvalidate 函数
  function onInvalidate(fn) {
    // 将过期回调存储到 cleanup 中
    cleanup = fn;
  }

  const job = () => {
    newValue = effectFn();
    // 在调用回调函数 cb 之前，先调用过期回调
    if (cleanup) {
      cleanup();
    }
    // 将 onInvalidate 作为回调函数的第三个参数，以便用户使用
    cb(newValue, oldValue, onInvalidate);
    oldValue = newValue;
  };

  const effectFn = effect(
    // 执行 getter
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          const p = Promise.resolve();
          p.then(job);
        } else {
          job();
        }
      }
    }
  );

  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}

// 示例使用
const data = { text: 'hello', count: 1 };
const state = reactive(data);

watch(
  () => state.text,
  (newValue, oldValue, onInvalidate) => {
    console.log(`text changed from ${oldValue} to ${newValue}`);
    onInvalidate(() => console.log('Invalidating text watch'));
  },
  { immediate: true, flush: 'post' }
);

watch(
  () => state.count,
  (newValue, oldValue, onInvalidate) => {
    console.log(`count changed from ${oldValue} to ${newValue}`);
    onInvalidate(() => console.log('Invalidating count watch'));
  },
  { immediate: true, flush: 'pre' }
);

setTimeout(() => {
  state.text = 'world'; // 输出: Invalidating text watch, text changed from hello to world
  state.count = 2; // 输出: Invalidating count watch, count changed from 1 to 2
}, 1000);
```

- `cleanup`：用于存储用户通过 `onInvalidate` 注册的过期回调。
- `onInvalidate`：用户可以在回调中注册过期回调。在 job 函数内，每次执行回调函数 cb 之前，先检查是否存在过期回调，如果存在，则执行过期回调函数 cleanup。

## 总结

1. **响应式依赖数据结构设计**：使用 WeakMap 配合 Map 构建了“桶”结构，从而能够在响应式数据与副作用函数之间建立更加精确的联系。
   - WeakMap 它的键必须是对象，而值可以是任意类型。WeakMap 中的对象键是弱引用的，这意味着它们不会阻止垃圾回收器回收这些对象。一旦用户代码不再持有对某个对象的引用，即使该对象仍存在于 WeakMap 中，垃圾回收器也可以安全地回收它，从而有效防止内存泄漏。
   - Map 允许任何类型的值（包括对象和原始值）作为键或值。与 WeakMap 不同，Map 中的键值对都是强引用的，这可能会影响垃圾回收过程。
2. **解决分支切换导致的冗余副作用的问题**：分支切换可能会出现副作用函数进行不必要的更新。为了解决这一问题，我们采取了以下措施：在每次副作用函数重新执行之前，首先清除上一次建立的所有响应联系。这样做可以确保当副作用函数重新执行后，只会根据当前的数据状态建立新的响应联系，从而避免了冗余的副作用问题。
3. **遍历 Set 数据结构导致无限循环的问题**：当使用forEach方法遍历Set集合时，如果一个值在被访问后被删除并重新添加到集合中，那么forEach将再次访问这个值，从而造成无限循环。根据 ECMA 规范，这是因为 forEach 在遍历过程中会动态地检查集合的内容。即在调用 forEach 遍历 Set 集合时，如果一个值已经被访问过了，但这个值被删除并重新添加到集合，如果此时 forEach 遍历没有结束，那么这个值会重新被访问。​解决方案是建立一个新的 Set 数据结构用来遍历。
4. **嵌套的副作用函数问题**：在实际场景中，嵌套的副作用函数发生在组件嵌套的场景中，即父子组件关系。这时为了避免在响应式数据与副作用函数之间建立的响应联系发生错乱，我们需要使用副作用函数栈来存储不同的副作用函数。当一个副作用函数执行完毕后，将其从栈中弹出。当读取响应式数据的时候，被读取的响应式数据只会与当前栈顶的副作用函数建立响应联系，从而解决问题。
5. **副作用函数无限递归地调用自身的栈溢出问题**：根本原因在于，对响应式数据的读取和设置操作发生在同一个副作用函数内。解决办法很简单，如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行。
6. **响应系统的可调度性**：所谓可调度，指的是当 trigger 动作触发副作用函数重新执行时，有能力决定副作用函数执行的时机、次数以及方式。为了实现调度能力，我们为 effect 函数增加了第二个选项参数，可以通过 scheduler 选项指定调用器，这样用户可以通过调度器自行完成任务的调度。还讲了如何通过调度器实现任务去重，即通过一个微任务队列对任务进行缓存，从而实现去重。
7. **计算属性 computed**：计算属性实际上是一个懒执行的副作用函数，我们通过 lazy 选项使得副作用函数可以懒执行。被标记为懒执行的副作用函数可以通过手动方式让其执行。利用这个特点，我们设计了计算属性，当读取计算属性的值时，只需要手动执行副作用函数即可。当计算属性依赖的响应式数据发生变化时，会通过 scheduler 将 dirty 标记设置为 true，代表“脏”​。这样，下次读取计算属性的值时，我们会重新计算真正的值。
8. **侦听器 watch**：一个 watch 本身会创建一个 effect，当这个 effect 依赖的响应式数据发生变化时，会执行该 effect 的调度器函数，即 scheduler。这里的 scheduler 可以理解为“回调”​，所以我们只需要在 scheduler 中执行用户通过 watch 函数注册的回调函数即可。此外，我们还讲解了立即执行回调的 watch，通过添加新的 immediate 选项来实现，还讨论了如何控制回调函数的执行时机，通过 flush 选项来指定回调函数具体的执行时机，本质上是利用了调用器和异步的微任务队列。最后，我们讨论了过期的副作用函数，它会导致竞态问题。为了解决这个问题，Vue.js 为 watch 的回调函数设计了第三个参数，即 onInvalidate。它是一个函数，用来注册过期回调。每当 watch 的回调函数执行之前，会优先执行用户通过 onInvalidate 注册的过期回调。这样，用户就有机会在过期回调中将上一次的副作用标记为“过期”​，从而解决竞态问题。
