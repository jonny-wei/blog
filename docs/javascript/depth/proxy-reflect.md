# Proxy 和 Reflect

## Proxy

### 简介

一个 Proxy 对象包装另一个对象并拦截诸如读取/写入属性和其他操作，可以选择自行处理它们，或者透明地允许该对象处理它们。

`var proxy = new Proxy(target, handler);`

new Proxy() 表示生成一个 Proxy 实例，target 参数表示所要拦截的目标对象(包括函数)，handler 参数也是一个对象，用来定制拦截行为。

### Proxy 实例的方法

#### get(target, propKey, receiver)

拦截对象属性的读取，比如 `proxy.foo` 和 `proxy['foo']`。如果一个属性不可配置（configurable）且不可写（writable），则 Proxy 不能修改该属性，通过 Proxy 对象访问该属性会报错。

#### set(target, propKey, value, receiver)

拦截对象属性的设置，比如 `proxy.foo = v` 或 `proxy['foo'] = v`，返回一个布尔值。

set 方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 Proxy 实例本身，其中最后一个参数可选。如果目标对象自身的某个属性不可写，那么 set 方法将不起作用。严格模式下，set 代理如果没有返回 true，就会报错。

#### has(target, propKey)

拦截 `propKey in proxy` 的操作，返回一个布尔值。用来拦截 `HasProperty` 操作，即判断对象是否具有某个属性时，这个方法会生效。典型的操作就是 in 运算符。has()方法可以接受两个参数，分别是目标对象、需查询的属性名。`has()` 方法拦截的是 `HasProperty` 操作，而不是 `HasOwnProperty` 操作，即 `has()` 方法不判断一个属性是对象自身的属性，还是继承的属性。另外，虽然 `for...in` 循环也用到了 `in` 运算符，但是 `has()` 拦截对 `for...in` 循环不生效。

#### deleteProperty(target, propKey)

拦截 `delete proxy[propKey]` 的操作，返回一个布尔值。

#### ownKeys(target)

拦截 `Object.getOwnPropertyNames(proxy)`、`Object.getOwnPropertySymbols(proxy)`、`Object.keys(proxy)`、`for...in`循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而 `Object.keys()` 的返回结果仅包括目标对象自身的可遍历属性。

#### getOwnPropertyDescriptor(target, propKey)

拦截 `Object.getOwnPropertyDescriptor(proxy, propKey)`，返回属性的描述对象。

#### defineProperty(target, propKey, propDesc)

拦截 `Object.defineProperty(proxy, propKey, propDesc)`、`Object.defineProperties(proxy, propDescs)`，返回一个布尔值。

#### preventExtensions(target)

拦截 `Object.preventExtensions(proxy)`，返回一个布尔值。

#### getPrototypeOf(target)

拦截 `Object.getPrototypeOf(proxy)`，返回一个对象。

#### isExtensible(target)

拦截 `Object.isExtensible(proxy)`，返回一个布尔值。

#### setPrototypeOf(target, proto)

拦截 `Object.setPrototypeOf(proxy, proto)`，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。

#### apply(target, object, args)

拦截 Proxy 实例作为函数调用的操作，比如 `proxy(...args)`、`proxy.call(object, ...args)`、`proxy.apply(...)`。apply 方法可以接受三个参数，分别是目标对象、目标对象的上下文对象（this）和目标对象的参数数组。

#### construct(target, args)

拦截 Proxy 实例作为构造函数调用的操作，比如 `new proxy(...args)`。 construct() 方法用于拦截 new 命令。

### Proxy 实例的方法一览表

| 内部方法                | Handler 方法               | 何时触发                                                     |
| ----------------------- | -------------------------- | ------------------------------------------------------------ |
| `[[Get]]`               | `get`                      | 读取属性                                                     |
| `[[Set]]`               | `set`                      | 写入属性                                                     |
| `[[HasProperty]]`       | `has`                      | `in` 运算符                                                  |
| `[[Delete]]`            | `deleteProperty`           | `delete` 操作                                                |
| `[[Call]]`              | `apply`                    | proxy 对象作为函数被调用                                     |
| `[[Construct]]`         | `construct`                | `new` 操作                                                   |
| `[[GetPrototypeOf]]`    | `getPrototypeOf`           | [Object.getPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) |
| `[[SetPrototypeOf]]`    | `setPrototypeOf`           | [Object.setPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf) |
| `[[IsExtensible]]`      | `isExtensible`             | [Object.isExtensible](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible) |
| `[[PreventExtensions]]` | `preventExtensions`        | [Object.preventExtensions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions) |
| `[[DefineOwnProperty]]` | `defineProperty`           | [Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty), [Object.defineProperties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties) |
| `[[GetOwnProperty]]`    | `getOwnPropertyDescriptor` | [Object.getOwnPropertyDescriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor), `for..in`, `Object.keys/values/entries` |
| `[[OwnPropertyKeys]]`   | `ownKeys`                  | [Object.getOwnPropertyNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames), [Object.getOwnPropertySymbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols), `for..in`, `Object/keys/values/entries` |

## Reflect

Reflect 对象与 Proxy 对象一样，也是 ES6 为了操作对象而提供的新 API。

1. 将 Object 对象的一些明显属于 **语言内部** 的方法（比如 `Object.defineProperty`），放到 Reflect 对象上。现阶段，某些方法同时在 Object 和 Reflect 对象上部署，未来的新方法将只部署在 Reflect 对象上。也就是说，从 Reflect 对象上可以拿到语言内部的方法。
2. 修改某些 Object 方法的返回结果，让其变得更合理。比如，`Object.defineProperty(obj, name, desc)` 在无法定义属性时，会抛出一个错误，而 `Reflect.defineProperty(obj, name, desc)` 则会返回 false。
3. 让 Object 操作都变成函数行为。某些 Object 操作是命令式，比如 `name in obj` 和 `delete obj[name]`，而 `Reflect.has(obj, name)` 和 `Reflect.deleteProperty(obj, name)` 让它们变成了函数行为。
4. Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。这就让 Proxy 对象可以方便地调用对应的 Reflect 方法，完成默认行为，作为修改行为的基础。也就是说，不管 Proxy 怎么修改默认行为，你总可以在Reflect 上获取默认行为。

### Reflect 静态方法

Reflect对象一共有 13 个静态方法。

- Reflect.apply(target, thisArg, args)
- Reflect.construct(target, args)
- Reflect.get(target, name, receiver)
- Reflect.set(target, name, value, receiver)
- Reflect.defineProperty(target, name, desc)
- Reflect.deleteProperty(target, name)
- Reflect.has(target, name)
- Reflect.ownKeys(target)
- Reflect.isExtensible(target)
- Reflect.preventExtensions(target)
- Reflect.getOwnPropertyDescriptor(target, name)
- Reflect.getPrototypeOf(target)
- Reflect.setPrototypeOf(target, prototype)