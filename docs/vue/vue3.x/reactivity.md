# 响应式系统方面

vue3.0 中，响应式数据弃用了 `Object.defineProperty` ，使用 `Proxy` 来代替。下文将主要通过以下三个方面来分析为什么 Vue 选择弃用 Object.defineProperty。

- [响应式系统方面](#响应式系统方面)
  - [驳-无法响应数组](#驳-无法响应数组)
  - [对数组的响应式处理](#对数组的响应式处理)
  - [Object.defineProperty 与 Proxy](#objectdefineproperty-与-proxy)
  - [总结](#总结)

## 驳-无法响应数组

一些技术博客认为 `Object.defineProperty` 有一个缺陷是无法监听数组变化：

>无法监控到数组下标的变化，导致直接通过数组的下标给数组设置值，不能实时响应。所以 Vue 才设置了 7 个变异数组（push、pop、shift、unshift、splice、sort、reverse）的 hack 方法来解决问题。

>Object.defineProperty的第一个缺陷是无法监听数组变化。然而 Vue 的文档提到了 Vue 是可以检测到数组变化的，但是只有以下七种方法，vm.items[indexOfItem] = newValue 这种是无法检测的。

>...

这些说法是有问题的，事实上，`Object.defineProperty` 本身是可以监控到数组下标的变化的，只是在 Vue 的实现中，从性能 / 体验的性价比考虑，放弃了这个特性。

下面具体分析一下：

```javascript
function defineReactive(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
     get: function defineGet() {
      console.log(`get key: ${key} value: ${value}`)
      return value
    },
     set: function defineSet(newVal) {
      console.log(`set key: ${key} value: ${newVal}`)
      value = newVal
    }
  })
}
function observe(data) {
  Object.keys(data).forEach(function(key) {
    defineReactive(data, key, data[key])
  })
}
let arr = [1, 2, 3]
observe(arr)
```

上面的代码对数组 arr 的每个属性通过 `Object.defineProperty` 进行劫持，下面我们对数组 arr 进行操作，看看哪些行为会触发数组的 getter 和 setter 方法。

- **通过下标获取某个元素和修改某个元素的值**

通过下标获取某个元素会触发 getter 方法, 设置某个值会触发 setter 方法。

- **数组的 push 方法**

push 并未触发 setter 和 getter方法，数组的下标可以看做是对象中的 key ，这里 push 之后相当于增加了下索引为 3 的元素，但是并未对新的下标进行 observe ，所以不会触发。

- **数组的 unshift 方法**

unshift 操作会导致原来索引为 0、1、2、3 的值发生变化，这就需要将原来索引为 0、1、2、3 的值取出来，然后重新赋值，所以取值的过程触发了 getter ，赋值时触发了 setter 。

尝试通过索引获取一下对应的元素：

这里我们可以对比对象来看，arr 数组初始值为 [1, 2, 3]，即只对索引为 0，1，2 执行了 observe 方法，所以无论后来数组的长度发生怎样的变化，依然只有索引为 0、1、2 的元素发生变化才会触发。其他的新增索引，就相当于对象中新增的属性，需要再手动 observe 才可以。

- **数组的 pop 方法**

当移除的元素为引用为 2 的元素时，会触发 getter 。

删除了索引为 2 的元素后，再去修改或获取它的值时，不会再触发 setter 和 getter 。

这和对象的处理是同样的，数组的索引被删除后，就相当于对象的属性被删除一样，不会再去触发 observe。

**到这里，我们可以简单地总结一下结论：**

`Object.defineProperty` 在数组中的表现和在对象中的表现是一致的，数组的索引就可以看做是对象中的 key。

- 通过索引访问或设置对应元素的值时，可以触发 getter 和 setter 方法。
- 通过 push 或 unshift 会增加索引，对于新增加的属性，需要再手动初始化才能被 observe。
- 通过 pop 或 shift 删除元素，会删除并更新索引，也会触发 setter 和 getter 方法。

所以，`Object.defineProperty 是有监控数组下标变化的能力的`，只是性能代价和获得的用户体验收益不成正比， Vue2.x 放弃了这个特性。

## 对数组的响应式处理

Vue 的 Observer 对数组做了单独的处理。

对于 Object 类型的数据，**Vue 在 defineReactive 方法中通过 `Object.defineProperty` 为其添加 getter/setter 追踪数据的变化，监测数据何时发生了变化**。由于局限于 Object.defineProperty 是对象属性层面上的数据劫持，不是对象层面的数据代理。Vue 无法检测 property 的添加或移除。由于 Vue 会**在初始化实例时**对 property 执行 getter/setter 转化，所以 property 必须在 `data` 对象上存在才能让 Vue 将它转换为响应式，不能在初始化完后添加或移除对象属性触发视图更新。

对于 Array 类型的数据，出于`Object.defineProperty`对数组监听的缺陷和性能代价。 **Vue 通过拦截改变数组自身的 7 个方法，监测数据何时发生了变化**。对于新增加的元素，需要再手动调用 observeArray 为数组的每个新增元素添加响应式，实现数组深度侦测 ，其他方法的变更会在当前的索引上进行更新，所以不需要再执行 observeArray。但其导致 Vue 不能检测利用索引修改数组元素以及修改数组长度的变化。下面是这部分源码的分析：

```javascript
/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */
import { def } from '../util/index'
// 复制数组构造函数的原型，Array.prototype 也是一个数组。
const arrayProto = Array.prototype
// 创建对象，对象的 __proto__ 指向 arrayProto，所以 arrayMethods 的 __proto__ 包含数组的所有方法。
export const arrayMethods = Object.create(arrayProto)
// 下面的数组是要进行重写的方法
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
// 遍历 methodsToPatch 数组，对其中的方法进行重写
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  // def 方法定义在 lang.js 文件中，是通过 object.defineProperty 对属性进行重新定义。
  // 即在 arrayMethods 中找到我们要重写的方法，对其进行重新定义
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      // 上面已经分析过，对于 push，unshift 会新增索引，所以需要手动 observe
      case 'push':
      case 'unshift':
        inserted = args
        break
      // splice 方法，如果传入了第三个参数，也会有新增索引，所以也需要手动 observe
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // push，unshift，splice 三个方法触发后，在这里手动 observe，
    // 其他方法的变更会在当前的索引上进行更新，所以不需要再执行 ob.observeArray
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

## Object.defineProperty 与 Proxy

前面已经知道 `Object.defineProperty` 对数组和对象的表现是一致的，那么它和 `Proxy` 对比存在哪些优缺点呢？

1. `Object.defineProperty` 只能劫持对象的属性，而 `Proxy` 是直接代理对象（劫持整个对象），并返回一个新对象，我们可以只操作新的对象达到响应式目的

由于 `Object.defineProperty` 只能对属性进行劫持，**需要遍历对象的每个属性，如果属性值也是对象，则需要深度遍历**。而  `Proxy` 直接代理对象，不需要遍历操作。

2. `Object.defineProperty` 对新增属性需要手动进行 `Observe`。

由于 `Object.defineProperty` 劫持的是对象的属性，所以**新增属性时，需要重新遍历对象**，对其新增属性再使用 `Object.defineProperty` 进行劫持。

也正是因为这个原因，使用 Vue 给 data 中的数组或对象新增属性时，需要使用 `vm.$set` 才能保证新增的属性也是响应式的。

下面看一下 Vue 的 set 方法是如何实现的，下面是核心代码。

```typescript
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  // 如果 target 是数组，且 key 是有效的数组索引，会调用数组的 splice 方法，
  // 我们上面说过，数组的 splice 方法会被重写，重写的方法中会手动 Observe
  // 所以 vue 的 set 方法，对于数组，就是直接调用重写 splice 方法
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // 对于对象，如果 key 本来就是对象中的属性，直接修改值就可以触发更新
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // vue 的响应式对象中都会添加了 __ob__ 属性，所以可以根据是否有 __ob__ 属性判断是否为响应式对象
  const ob = (target: any).__ob__
  // 如果不是响应式对象，直接赋值
  if (!ob) {
    target[key] = val
    return val
  }
  // 调用 defineReactive 给数据添加了 getter 和 setter，
  // 所以 vue 的 set 方法，对于响应式的对象，就会调用 defineReactive 重新定义响应式对象，defineReactive 函数
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```

在 set 方法中，对 target 是数组和对象分别做了处理。target 是数组时，会调用重写过的 `splice` 方法进行手动 Observe 。

对于对象，如果 key 本来就是对象的属性，则直接修改值触发更新，否则调用 `defineReactive` 方法重新定义响应式对象。

如果采用 proxy 实现，Proxy 通过 `set(target, propKey, value, receiver)` 拦截对象属性的设置，是**可以拦截到对象的新增属性的**。

不止如此，**Proxy 对数组的方法也可以监测到，不需要像上面 vue2.x 源码中那样进行 hack**。

3. Proxy 支持 13 种拦截操作，这是 defineProperty 所不具有的。

- get(target, propKey, receiver)：拦截对象属性的读取，比如 proxy.foo 和proxy['foo']。
- set(target, propKey, value, receiver)：拦截对象属性的设置，比如proxy.foo = v 或 proxy['foo'] = v，返回一个布尔值。
- has(target, propKey)：拦截 propKey in proxy 的操作，返回一个布尔值。
- deleteProperty(target, propKey)：拦截 delete proxy[propKey] 的操作，返回一个布尔值。
- ownKeys(target)：拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、for...in循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而 Object.keys() 的返回结果仅包括目标对象自身的可遍历属性。
- getOwnPropertyDescriptor(target, propKey)：拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。
- defineProperty(target, propKey, propDesc)：拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值。
- preventExtensions(target)：拦截 Object.preventExtensions(proxy)，返回一个布尔值。
- getPrototypeOf(target)：拦截 Object.getPrototypeOf(proxy)，返回一个对象。
- isExtensible(target)：拦截 Object.isExtensible(proxy)，返回一个布尔值。
- setPrototypeOf(target, proto)：拦截 Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
- apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)。
- construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args)。

4. 新标准性能红利

Proxy 作为新标准，从长远来看，JS 引擎会继续优化 Proxy，但 getter 和 setter 基本不会再有针对性优化。Proxy 减少了内存使用和代理开销，处理嵌套对象时更高效。

5. Proxy 兼容性差

Proxy 对于 IE 浏览器来说简直是灾难。并且目前并没有一个完整支持 Proxy 所有拦截方法的 Polyfill 方案，有一个 Google 编写的 proxy-polyfill 也只支持了 get、set、apply、construct 四种拦截，可以支持到 IE9+ 和 Safari 6+。defineProperty 能支持到 IE9，IE8 以下不支持。

## 总结

1. `Object.defineProperty` 并非不能监控数组下标的变化，Vue2.x 中无法通过数组索引来实现响应式数据的自动更新是 Vue 本身的设计导致的，不是 defineProperty 的锅。
2. `Object.defineProperty` 和 Proxy 本质差别是，defineProperty 只能对属性进行劫持，所以出现了需要递归遍历，新增属性需要手动 Observe 的问题。
3. Proxy 作为新标准，浏览器厂商势必会对其进行持续优化，但它的兼容性也是块硬伤，并且目前还没有完整的 polyfill 方案。
