# 响应式原理

响应式原理

数据驱动是数据(状态)的变化引起视图的变化；数据双向绑定(响应式)是数据的变化引起视图的变化，视图的变化引起数据的变化。公式表示：

`UI = render(state)`。

那么如何实现数据驱动呢？如何实现数据双向绑定呢？如何实现一个响应式系统呢？**Vue 实现的响应式系统设计思路如下**：

- 侦测数据的变化(数据劫持/数据代理)
- 收集视图依赖了哪些数据(依赖收集)
- 数据变化时，自动通知更新视图(发布订阅模式)

**基于以上思想 Vue2 的响应式系统实现步骤如下**：

- 实现一个监听器 Observer，用来劫持并监听所有属性，如果属性发生变化，就通知订阅者(Watcher)；
- 实现一个订阅器 Dep，用来收集订阅者，对监听器 Observer 和 订阅者 Watcher 进行统一管理；
- 实现一个订阅者 Watcher，可以收到属性的变化通知并执行相应的方法，从而更新视图；
- 实现一个解析器 Compile，可以解析每个节点的相关指令，对模板数据和订阅器进行初始化。

![vue响应式原理1](/blog/images/vue/vue响应式原理1.png)

## 如何侦测数据的变化

实现侦测数据的变化，使数据变得“可观测”，JavaScript 有两种办法：

- 使用 Object.defineProperty 数据劫持(vue2)
- ES6 的 Proxy 数据代理(vue3)

在 Vue2 中，基于 Object.defineProperty 对象属性级别的拦截，为每个属性设置 getter/setter。由于局限于 Object.defineProperty 是对象原型上的方法，并且是对象属性层面上的数据劫持，不是对象层面的数据代理。所以 Vue2 侦测数据的变化分为 Object 型的数据和 Array 型数据两种不同的侦测方式。

### 使 Object 类型的数据可观测

定义一个 Observer 观察类(监听器)，判断数据是否是 Array 类型，如果不是那么就是 Object 类型数据，进而走 `this.walk(value)` 逻辑。在 walk 方法中
遍历对象的所有属性走 `defineReactive(obj, keys[i])` 方法，在 defineReactive 方法中通过 `Object.defineProperty` 为其添加 getter/setter，在 defineReactive 中如果 obj 对象里嵌套对象，那么需要通过 `new Observer(val)` **递归**添加响应式，这就是 Object 的**深度侦测**。


```js
// 源码位置：src/core/observer/index.js 下面是简化后的代码

// Observer类 会通过递归的方式把一个对象的所有属性都转化成可观测对象
export class Observer {
  constructor (value) {
    // 拿到需要做成响应式的数据(状态)  
    this.value = value
    // 新增一个__ob__属性，标记此 value 已经变为响应式了，避免重复操作，值为该 value 的 Observers 实例
    def(value,'__ob__',this) 
    if (Array.isArray(value)) {
      // value 为 Array 型的侦测逻辑
    } else {
      // value 为 Object 型的侦测逻辑
      this.walk(value)
    }
  }

  // 观测 Object：遍历对象的所有属性为其添加get/set
  walk (obj: Object) {
    const keys = Object.keys(obj)
    // for循环的特点： 不可遍历自定义或原型链上的自定义属性
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}
/**
 * 为对象的属性定义响应式，使一个对象转化成可观测对象
 * @param { Object } obj 对象
 * @param { String } key 对象的key
 * @param { Any } val 对象的某个key的值
 * 通过 Object.defineProperty 方法实现了对 Object 数据的可观测，
 * 但是这个方法仅仅只能观测到 Object 数据的取值getter及设置值setter，
 * 当我们向 Object 数据里添加一对新的 key/value 或删除一对已有的 key/value 时，它是无法观测到的，
 * 导致当我们对 Object 数据添加或删除值时，无法通知依赖，无法驱动视图进行响应式更新。
 * 
 * Vue也注意到了这一点，为了解决这一问题，Vue 增加了两个全局API: Vue.set(vm.$set) 和 Vue.delete(vm.$delete)
 */
function defineReactive (obj,key,val) {
  // 如果是不可配置属性，则搞不了响应式，直接结束程序
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }
  // 参数处理，只传了obj和key，那么val = obj[key]
  if (arguments.length === 2) {
    val = obj[key];
  }
  // obj对象里嵌套对象，递归添加响应式，Object的深度侦测 
  if (typeof val === "object") {
    new Observer(val);
  }
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get(){
      console.log(`${key}属性被读取了`);
      return val;
    },
    set(newVal){
      if(val === newVal){
          return
      }
      console.log(`${key}属性被修改了`);
      val = newVal;
    }
  })
}
```

### 使 Array 类型的数据可观测

Object 变化时通过 setter 来追踪的，只有某个数据发生了变化，就一定会触发这个数据上的 setter。但是 Array 型数据没有 setter。要想让 Array 型数据发生变化，那必然是操作了 Array，而 JS 中提供的操作数组的方法就那么几种，我们可以把这些方法都重写一遍。

为 Array.prototype 添加属性，重写 7 大方法。首先创建了继承自 Array 原型的空对象 arrayMethods，接着在 arrayMethods 上使用 object.defineProperty 方法将这些可以改变数组自身的 7 个方法遍历，逐个进行封装重写。

- push
- pop
- shift
- unshift
- splice
- sort
- reverse

```js
const arrayProto = Array.prototype // 继承原型对象
export const arrayMethods = Object.create(arrayProto) // 建一个自己的原型 并且重写methods这些方法

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method 缓存原生方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 改变this指向 拦截
    const result = original.apply(this, args)
    // 获取Observer实例
    const ob = this.__ob__
    // 改变数组的元素,待添加响应式的元素
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 调用 Observer 类的 observeArray 方法，遍历数组中每一项(inserted)为其添加响应式 
    if (inserted) ob.observeArray(inserted) // Array 的深度侦测
    // notify change
    ob.dep.notify()
    return result
  })
})
```
Array 类型数据的侦测：

```js
// 源码位置：src/core/observer/index.js 下面是简化后的代码

// Observer类 会通过递归的方式把一个对象的所有属性都转化成可观测对象
export class Observer {
  constructor (value) {
    // 拿到需要做成响应式的数据(状态)  
    this.value = value
    // 新增一个__ob__属性，标记此 value 已经变为响应式了，避免重复操作，值为该 value 的 Observers 实例
    def(value,'__ob__',this) 
    if (Array.isArray(value)) {
      // value 为 Array 型的侦测逻辑
      // 当前环境下的Object是否支持__proto__(隐式原型)属性
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      // value 为 Object 型的侦测逻辑
    }
  }

  // 观测 Array：遍历对象的所有属性为其添加get/set
  observeArray(items: Array<any>) {
    for (const item of items) {
      new Observer(item) // 实际源码调用 observe Array 的深度侦测
    }
  }
}

/**
 * 如果支持__proto__访问prototype原型对象，则拦截
 * 将源对象的 __proto__ 指向目标对象 value.__proto__ = arrayMethods
 * @param target
 * @param src
 */
function protoAugment(target: Array<any>, src: Object): void {
  target.__proto__ = src;
}

/**
 * 如果不支持__proto__访问prototype原型对象，则把拦截器中重写的7个方法循环加入到value上
 * @param target
 * @param src
 * @param keys
 */
function copyAugment(target: Object, src: Object, keys: Array<string>): void {
  for (const key of keys) {
    def(target, key, src[key]);
  }
}
```

### 小结

**数据侦测的目的是**监测数据何时发生了变化，从而收集或更新依赖。为侦测数据的变化，使数据变得“可观测”，JavaScript 有两种办法：`使用 Object.defineProperty 数据劫持(vue2)` 和 `ES6 的 Proxy 数据代理(vue3)`。在 Vue2 中，是基于 `Object.defineProperty` 实现数据劫持。由于局限于 Object.defineProperty 是对象原型上的方法，并且是对象属性层面上的数据劫持，不是对象层面的数据代理。所以 Vue2 侦测数据的变化分为 Object 型的数据和 Array 型数据两种不同的侦测方式。对于 Object 类型的数据，**Vue 在 defineReactive 方法中通过 `Object.defineProperty` 为其添加 getter/setter 追踪数据的变化，监测数据何时发生了变化**；对于 Array 类型的数据，**Vue 通过拦截重写数组原型上可以改变数组的 7 大操作数组方法监测数据何时发生了变化**。以上实现了数据的侦测，知道数据何时发生了变化，从而知道在什么时候收集依赖，在什么时候更新依赖。
## 依赖收集与更新

**为什么进行依赖收集**：数据变的可观测以后，我们就能知道数据什么时候发生了变化，那么当数据发生变化时，我们去通知视图更新就好了。那么问题又来了，视图那么大，我们到底该通知谁去变化？总不能一个数据变化了，把整个视图全部更新一遍吧，这样显然是不合理的。

**什么是依赖收集**：谁用到了这个数据就是谁依赖了这个数据，我们给每个数据都建一个依赖数组(因为一个数据可能被多处使用)，谁依赖了这个数据(即谁用到了这个数据)我们就把谁放入这个依赖数组中，那么当这个数据发生变化的时候，我们就去它对应的依赖数组中，把每个依赖都通知一遍，告诉他们："你们依赖的数据变啦，你们该更新啦！"。这个过程就是依赖收集。

**何时收集依赖，何时更新依赖**：在 getter 中收集依赖，在 setter 中通知依赖更新。在 getter 中调用了 `dep.depend()` 方法收集依赖，在 setter 中调用 `dep.notify()` 方法通知所有依赖更新。

**Array 的依赖收集疑问**：不是说 Array 无法使用 Object.defineProperty 方法吗？无法使用怎么还在 getter 中收集依赖呢？其实在平常开发的时候，全局的 data 是一个对象，组件的 data 是一个函数并 return 一个对象，不论是全局还是组件中的 data 都是通过 `{}` 包裹需要响应式的数据，所以 Array 型数据还是在getter 中收集依赖。

**依赖收集到哪里**：收集依赖需要为依赖找一个存储依赖的地方，我们给每个数据都建一个依赖数组，谁依赖了这个数据我们就把谁放入这个依赖数组中。单单用一个数组来存放依赖的话，功能好像有点欠缺并且代码过于耦合。我们应该将依赖数组的功能扩展一下，更好的做法是我们应该为每一个数据都建立一个依赖管理器，把这个数据所有的依赖都管理起来。为此 Vue 定义了一个订阅器 Dep，用来收集订阅者，主要作用是用来存放 Watcher 观察者对象。它用来收集依赖、删除依赖和向依赖发送消息等。Watcher 可以理解成一个中介，数据发生变化时通知 Watcher，然后 Watcher 再通知其他地方。

### 发布者 Dep 

如何管理依赖？Dep 订阅器类。主要做两件事情：

- 用 addSub 方法可以在目前的 Dep 对象中增加一个 Watcher 的订阅操作；
- 用 notify 方法通知目前 Dep 对象的 subs 中的所有 Watcher 对象触发更新操作。

其实 Dep 就是一个发布者(被观察者)，可以订阅多个观察者，依赖收集之后 Deps 中会存在一个或多个 Watcher 对象，在数据变更的时候通知所有的 Watcher。

```js
export default class Dep {
  static target: ?Watcher; // 取 Watcher 存放的依赖者
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = [] // 存放依赖(Watcher订阅) 添加 删除 通知
  }
  // 添加依赖
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  // 删除依赖
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  // 添加一个依赖 调用 Watcher 中的 addDep ,addDep中调用上面的 addSub
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  //通知依赖更新
  notify () {
    // stabilize the subscriber list first 不改变原数组，浅拷贝
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    // 遍历Watcher订阅者(subs依赖者实例数组)
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update() // Watcher 实例上的依赖 watcher.update()
    }
  }
}
```
之前对 Object 和 Array 数据分别进行了观测，利用 `Object.defineProperty` 为其属性和元素添加响应式机制，使数据变得可观测。知道了数据何时发生了变化以及何时通知依赖更新，明白在 getter 中触发依赖收集，在 setter 中触发依赖更新。为了使代码解耦，提供接口等因素用一个 Dep类(依赖管理订阅器)代替依赖数组管理依赖。在依赖管理器中添加依赖，删除依赖，以及通知依赖更新，核心方法就是 `update()`。剩下的问题就是：我们在 getter 中收集的依赖到底是谁的问题。口语层面我们可以说：“谁用到了这个数据谁就是依赖”，那么在代码层面该如何表示呢？

### 订阅者 Watcher

Vue 实现了一个 Watcher 类(观察者)，Watcher 类的实例就是我们上面所说的那个"谁"。换句话说就是：谁用到了数据，谁就是依赖，我们就为谁创建一个 Watcher 实例。在之后数据变化时，我们不直接去通知依赖更新，而是通知依赖对应的 Watcher 实例，由 Watcher 实例去通知真正的视图。

**为什么要引入 Watcher 类**：当属性发生变化后，我们要通知用到数据的地方，而使用这个数据的地方有很多，而且类型还不一样，既有可能是模板，也有可能是用户写的一个 watch,这时需要抽象出一个能集中处理这些情况的类。然后，我们在依赖收集阶段 **只收集这个封装好的类的实例进来**，通知也只通知它一个，再由它负责通知其他地方。

**依赖收集的目的** 是将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中。

所谓的依赖，其实就是 Watcher。至于如何收集依赖，总结起来就一句话，在 getter 中收集依赖，在 setter 中触发依赖。先收集依赖，即把用到该数据的地方收集起来，然后等属性发生变化时，把之前收集好的依赖循环触发一遍就行了。具体来说，当外界通过 Watcher 读取数据时，便会触发 getter 从而将 Watcher 添加到依赖中，哪个 Watcher 触发了 getter，就把哪个 Watcher 收集到 Dep 中。当数据发生变化时，会循环依赖列表，把所有的 Watcher 都通知一遍。

```js
// Watcher 简化：
mountComponent(vm: Component, el: ?Element, ...) {
    vm.$el = el

    ...

    updateComponent = () => {
      vm._update(vm._render(), ...)
    }

    new Watcher(vm, updateComponent, ...)
    ...
}

export default class Watcher {
  constructor (vm,expOrFn,cb) {
    this.vm = vm;
    this.cb = cb;
    this.getter = parsePath(expOrFn)
    this.value = this.get()
  }
  get () {
    window.target = this; // 将 Dep.target 指向自身，从而使得收集到了对应的 Watcher
    const vm = this.vm
    let value = this.getter.call(vm, vm)
    window.target = undefined;
    return value
  }
  update () {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}
```

Watcher 先把自己设置到全局唯一的指定位置（window.target），然后读取数据。因为读取了数据，所以会触发这个数据的 getter。接着，在 getter 中就会从全局唯一的那个位置读取当前正在读取数据的 Watcher，并把这个 Watcher 收集到 Dep 中去。收集好之后，当数据发生变化时，会向 Dep 中的每个 Watcher 发送通知。通过这样的方式，Watcher 可以主动去订阅任意一个数据的变化。

Dep.target 表示当前正在计算的 Watcher，它是全局唯一的，因为在同一时间只能有一个 Watcher 被计算。

![vue响应式原理2](/blog/images/vue/vue响应式原理2.png)

### 小结

- 在 new Vue() 后， Vue 会调用 _init 函数进行初始化，在 init 过程 data 通过 Observer 转换成了 getter/setter 的形式，来对数据追踪变化，当被设置的对象被读取的时候会执行 getter 函数，而在当被赋值的时候会执行 setter 函数。
- 当render function 执行的时候，因为会读取所需对象的值，所以会触发 getter 函数从而将 Watcher 添加到依赖中进行依赖收集。
- 在修改对象的值的时候，会触发对应的 setter， setter 通知之前依赖收集得到的 Dep 中的每一个 Watcher，告诉它们自己的值改变了，需要重新渲染视图。这时候这些 Watcher 就会开始调用 update 来更新视图。

## 总结

**数据侦测的目的是**监测数据何时发生了变化，从而收集或更新依赖。为侦测数据的变化，使数据变得“可观测”，JavaScript 有两种办法：`使用 Object.defineProperty 数据劫持(vue2)` 和 `ES6 的 Proxy 数据代理(vue3)`。在 Vue2 中，是基于 `Object.defineProperty` 实现数据劫持。由于局限于 Object.defineProperty 是对象原型上的方法，并且是对象属性层面上的数据劫持，不是对象层面的数据代理。所以 Vue2 侦测数据的变化分为 Object 型的数据和 Array 型数据两种不同的侦测方式。对于 Object 类型的数据，**Vue 在 defineReactive 方法中通过 `Object.defineProperty` 为其添加 getter/setter 追踪数据的变化，监测数据何时发生了变化**；对于 Array 类型的数据，**Vue 通过拦截重写数组原型上可以改变数组的 7 大操作数组方法监测数据何时发生了变化**。以上实现了数据的侦测，知道数据何时发生了变化，从而知道在什么时候收集依赖，在什么时候更新依赖。在 getter 中收集依赖，在 setter 中通知依赖更新。

那么这些依赖存放在哪里呢？为了使代码解耦，提供接口等因素用Vue 定义了一个依赖管理器 Dep 类(发布者，被观察者)代替依赖数组管理依赖。在依赖管理器中添加依赖，删除依赖，以及通知依赖更新。剩下的问题就是：我们在 getter 中收集的依赖到底是谁的问题。谁用到了这个数据谁就是依赖。当属性发生变化后，我们要通知用到数据的地方，而使用这个数据的地方有很多，而且类型还不一样，既有可能是模板，也有可能是用户写的一个 watch（computed watcher，user watcher实例），这时需要抽象出一个能集中处理这些情况的类。然后，我们在依赖收集阶段 **只收集这个封装好的类的实例进来**，通知也只通知它一个，再由它负责通知其他地方。


为此 Vue 又定义了一个 Watcher 类(订阅者，观察者)。所谓的依赖，其实就是 Watcher 实例。当外界通过 Watcher 读取数据时，便会触发 getter 从而将 Watcher 添加到依赖中，哪个 Watcher 触发了 getter，就把哪个 Watcher 收集到 Dep 中。当数据发生变化时，会循环依赖列表，把所有的 Watcher 都通知一遍。依赖管理器 Dep 主要用来收集订阅者，主要作用是用来存放 Watcher 观察者对象。它用来收集依赖、删除依赖和向依赖发送消息等。在 mount 阶段的时候，会创建一个 Watcher 类的对象。这个 Watcher 实际上是连接 Vue 组件与 Dep 的桥梁。每一个 Watcher 对应一个 vue component。


总之，当创建 Vue 实例时，Vue 会遍历 data 选项的属性，利用 `Object.defineProperty` 为每个属性添加 getter 和 setter 对数据的读取进行劫持（在 getter 中收集依赖，在 setter 中通知依赖更新），并且在内部追踪依赖，在属性被访问和修改时通知变化。每个组件实例会有相应的 Watcher 实例，会在组件渲染的过程中记录依赖的所有数据属性（进行依赖收集，还有computed watcher，user watcher实例），之后依赖项被改动时，setter 方法会通知依赖与此 data 的 Watcher 实例重新计算（派发更新），从而使它关联的组件重新渲染。

- 组件初始化的时候，先给每一个 data 属性都注册 getter，setter，也就是 reactive 化。然后再 new 一个自己的 Watcher 对象，此时 Watcher 会立即调用组件的 render 函数去生成虚拟 DOM。在调用 render 的时候，就会需要用到 data 的属性值，此时会触发 getter 函数，将当前的 Watcher 函数注册进 Dep 的 subs 里。
- 当 data 属性发生改变之后，就会遍历 subs 里所有的 Watcher 对象，通知它们去重新渲染组件。

Vue 是如何给 data 对象添加 Observer 的？我们知道，Vue 实例创建的过程会有一个生命周期，其中有一个过程就是调用 vm.initData 方法处理 data 选项。在 initData 中我们要特别注意 proxy 方法，它的功能就是遍历 data 的 key，把 data 上的属性代理到 vm 实例上。proxy 方法主要通过 Object.defineProperty 的 getter 和 setter 方法实现了代理，把每一个值 vm._data.xxx 都代理到 vm.xxx 上。在 _initData 方法的最后，我们调用了 observe(data, this) 方法来对 data 做监听。observe 方法首先判断 value 是否已经添加了 ob 属性，它是一个 Observer 对象的实例。如果是就直接用，否则在 value 满足一些条件（数组或对象、可扩展、非 vue 组件等）的情况下创建一个 Observer 对象。defineReactive 方法最核心的部分就是通过调用 Object.defineProperty 给 data 的每个属性添加 getter 和 setter 方法。当 data 的某个属性被访问时，则会调用 getter 方法，判断当 Dep.target 不为空时调用 dep.depend 和 childObj.dep.depend 方法做依赖收集。如果访问的属性是一个数组，则会遍历这个数组收集数组元素的依赖。当改变 data 的属性时，则会调用 setter 方法，这时调用 dep.notify 方法进行通知。Dep 类中 subs 用来存储所有订阅它的 Watcher。至此，vm 实例中给 data 对象添加 Observer 的过程就结束了。

在给 data 添加 Observer 之后，有一个过程是调用 vm.compile 方法对模板进行编译。compile 方法主要通过 compileNode(el, options) 方法完成节点的解析，如果节点拥有子节点，则调用 compileNodeList(el.childNodes, options) 方法完成子节点的解析。compileNodeList 方法其实就是遍历子节点，递归调用 compileNode 方法。因为 DOM 元素本身就是树结构，这种递归方法也就是常见的树的深度遍历方法，这样就可以完成整个 DOM 树节点的解析。主要通过正则表达式解析模板语法(插值表达式，指令等等)生成 Directive 对象。Directive 在初始化时定义了 this.update 方法，并创建了 Watcher，把 this.update 方法作为 Watcher 的回调函数。这里就把 Directive 和 Watcher 做了关联，当 Watcher 观察到指令表达式值变化时，会调用 Directive 实例的 _update 方法，最终调用 watcher 的 update 方法更新 DOM 节点。至此，vm 实例中编译模板、解析指令、绑定 Watcher 的过程就结束了

Watcher 巧妙地把 Observer 和 Directive 关联起来，实现了数据一旦更新，视图就会自动变化的效果。

## 问题

### Q1：为什么 Object 和 Array 型数据会有两种不同的变化侦测方式？

在 Vue2 中，基于 Object.defineProperty 对象属性级别的拦截，为每个属性设置 getter/setter。由于局限于 Object.defineProperty 是对象原型上的方法，并且是对象属性层面上的数据劫持，不是对象层面的数据代理，同理无法对数组进行劫持。所以 Vue2 侦测数据的变化分为 Object 型的数据和 Array 型数据两种不同的侦测方式。

### Q2：怎么实现对象和数组的监听？

Object.defineProperty() 只能对属性进行数据劫持，不能对整个对象进行劫持，同理无法对数组进行劫持。对于 Object 类型的数据，**Vue 在 defineReactive 方法中通过 `Object.defineProperty` 为其添加 getter/setter 追踪数据的变化，监测数据何时发生了变化**；对于 Array 类型的数据，**Vue 通过拦截重写数组原型上可以改变数组的 7 大操作数组方法监测数据何时发生了变化**。

### Q3：如何解决对象新增或删除属性不能响应的问题？

通过 Object.defineProperty 数据劫持存在以下几个问题：

- Object.defineProperty 只能对属性进行数据劫持，不能对整个对象进行劫持，同理无法对数组进行劫持。
- 通过 Object.defineProperty 方法实现了对 Object 数据的可观测，但是这个方法仅仅只能观测到 Object 数据的取值及设置值（getter/setter），无法检测到对象属性的添加或删除，导致当我们对 Object 数据添加或删除值时，无法通知依赖，无法驱动视图进行响应式更新。
- 对于 Array 只要是通过数组原型上的方法对数组进行操作就都可以侦测到，但是在日常开发中，还可以通过数组的下标来操作数据，例如通过修改数组长度，用索引直接设置一个数组项，这也是无法侦测到的。
- 只有在 Vue 初始化实例时对属性执行 getter/setter 转化，所以属性必须在 data 对象上存在才能让 Vue 将它转换为响应式的。

Vue 不能检测以下数组的变动：

- 当你利用索引直接设置一个数组项时，例如：`vm.items[indexOfItem] = newValue`
- 当你修改数组的长度时，例如：`vm.items.length = newLength`

Vue 不允许动态添加根级别的响应式 property。为了解决这一问题，Vue 增加了两个全局API: `Vue.set(vm.$set)` 和 `Vue.delete(vm.$delete)` 。

- Vue.set( target, propertyName/index, value )
- Vue.delete( target, propertyName/index )

vm.$set 的实现原理是：

- 如果目标是数组，直接使用数组的 splice 方法触发响应式；
- 如果目标是对象，会先判读属性是否存在、对象是否是响应式，最终如果要对属性进行响应式处理，则是通过调用 defineReactive 方法进行响应式处理（ defineReactive 方法就是 Vue 在初始化对象时，给对象属性采用 Object.defineProperty 动态添加 getter 和 setter 的功能所调用的方法）

```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  // target 为数组  
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 修改数组的长度, 避免索引>数组长度导致splcie()执行有误
    target.length = Math.max(target.length, key)
    // 利用数组的splice变异方法触发响应式  
    target.splice(key, 1, val)
    return val
  }
  // key 已经存在，直接修改属性值  
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  // target 本身就不是响应式数据, 直接赋值
  if (!ob) {
    target[key] = val
    return val
  }
  // 对属性进行响应式处理
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```
有时你可能需要为已有对象赋值多个新 property，比如使用 `Object.assign()` 或 `_.extend()`。但是，这样添加到对象上的新 property 不会触发更新。在这种情况下，你应该用原对象与要混合进去的对象的 property 一起创建一个新的对象。

```js
// 代替 `Object.assign(this.someObject, { a: 1, b: 2 })`
this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 })
```
Vue.delete( target, propertyName/index ) 的实现：

```js
export function del (target: Array<any> | Object, key: any) {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}
```

### Q4：发布订阅设计模式

​发布-订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状态改变时，所有依赖于它的对象都将得到通知。

优点：

- 发布-订阅模式广泛应用于异步编程中，这是一种替代传递回调函数的方案(异步编程实现的一种方案，在JS专栏中有讲)。比如，我们可以订阅 ajax 请求的 error 、success 等事件。在异步编程中使用发布-订阅模式， 我们就无需过多关注对象在异步运行期间的内部状态，而只需要订阅感兴趣的事件发生点。
- 发布-订阅模式可以取代对象之间硬编码的通知机制，一个对象不用再显式地调用另外一个对象的某个接口。发布-订阅模式让两个对象松耦合地联系在一起，虽然不太清楚彼此的细节，但这不影响它们之间相互通信。当有新的订阅者出现时，发布者的代码不需要任何修改；同样发布者需要改变时，也不会影响到之前的订阅者。只要之前约定的事件名没有变化，就可以自由地改变它们。

生活实例：

​我们以售楼处的例子来举例说明发布-订阅模式：

小明最近看上了一套房子，到了售楼处之后才被告知，该楼盘的房子早已售罄。好在售楼 MM 告诉小明，不久后还有一些尾盘推出，开发商正在办理相关手续，手续办好后便可以购买。

但到底是什么时候，目前还没有人能够知道。 于是小明记下了售楼处的电话，以后每天都会打电话过去询问是不是已经到了购买时间。除 了小明，还有小红、小强、小龙也会每天向售楼处咨询这个问题。一个星期过后，售楼 MM 决定辞职，因为厌倦了每天回答 1000个相同内容的电话。

当然现实中没有这么笨的销售公司，实际上故事是这样的：小明离开之前，把电话号码留在 了售楼处。售楼 MM 答应他，新楼盘一推出就马上发信息通知小明。小红、小强和小龙也是一样，他们的电话号码都被记在售楼处的花名册上，新楼盘推出的时候，售楼 MM会翻开花名册，遍历上面的电话号码，依次发送一条短信来通知他们。




::: warning 参考文献
[深入理解vue响应式原理 8000字](https://mp.weixin.qq.com/s/SypAULMnbaSu8MSm2Ugl6g)

[Vue 源码解析：深入响应式原理](https://www.imooc.com/article/14466)

[0 到 1 掌握：Vue 核心之数据双向绑定](https://juejin.cn/post/6844903903822086151#heading-12)

[你可以手写Vue3的响应式原理吗](https://mp.weixin.qq.com/s/FxeXNAFuOrVBV-GK__nh6g)
:::