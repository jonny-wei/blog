# 原型与原型链

![原型/实例/构造函数/原型链关系图](/blog/images/javascript/prototype3.png)

## 什么是原型

每一个 JavaScript 对象( null 除外)在创建时会与之关联另一个对象，这个被关联的对象称之为 **原型**(原型对象)。每一个对象都会从原型中‘继承’（委托）原型对象的属性。原型对象就是用来存放实例中共有的那部分属性。**每个函数都有一个特殊的属性叫作原型（prototype）**，这个属性指向调用该构造函数而创建的实例的原型。原型对象中有一个属性 constructor, 它指向函数对象。

## 什么是 prototype

显示原型

prototype 是函数才有的属性，这个属性指向一个对象，该对象正是调用该构造函数而创建的实例的原型。**指向原型对象**。**箭头函数是没有 prototype 属性的**。在最新 ES 规范里，prototype 被定义为：给其它对象**提供共享属性的对象**。prototype 自己也是对象，只是被用以承担某个职能罢了。prototype 描述的是两个对象之间的某种（委托）关系（其中一个，为另一个提供属性访问权限）。每个函数都有一个 prototype 属性，它默认指向一个 Object 空对象(即称为:原型对象)。

当需要为大量实例添加相同效果的方法时，可以将它们存放在 prototype 对象中，并将该 prototype 对象放在这些实例的构造函数上，达到共享、公用的效果，实质上是为了内存着想。

::: tip 注意
并不是所有的函数都有 prototype 属性，由函数 bind()方法返回的函数就没有 prototype 属性。

函数的 prototype 属性，在定义函数时自动添加 prototype，默认是一个空 Object 对象
:::

## 什么是 `__proto__`

隐式原型

每一个 JavaScript 对象( null 除外)都有一个属性，叫 **`__proto__`** ,这个属性**指向该对象的原型**。**指向原型对象**, 原型对象其实就是通过 Object 构造函数生成的。它是历史遗留，在某些环境中，比如 Deno，它是不被支持的。所有函数的 `__proto__` 指向他们的原型对象。

- 所有的函数都是 `Function` 函数的实例（包括Function自己），所以他们的 `__proto__` 自然也就都指向 Function 原型对象(Function.prototype)
- Object函数是所有对象通过原型链追溯到最根的构造函数。Object 函数的 `prototype` 中的 `__proto__` 指向 null。

::: tip 进一步阐述
`__proto__` ，绝大部分浏览器都支持这个非标准的方法访问原型，然而它并不存在于 `Person.prototype` 中。实际上，它是来自于 `Object.prototype` ，与其说是一个属性，不如说是一个 `getter/setter`，当使用 `obj.__proto__` 时，可以理解成返回了 `Object.getPrototypeOf(obj)`。所以 `Object.prototype.__proto__` 的值为 `null` 跟 `Object.prototype` 没有原型，其实表达了一个意思。

所以 `__proto__` 来自 Object.prototype 通过原型链委托返回 Object.getPrototypeOf(obj)
:::

## 什么是 constructor

既然实例对象和构造函数都可以指向原型，那么原型是否有属性指向构造函数或者实例呢？那就是 constructor：

每个原型都有一个 constructor 属性指向关联的构造函数。

constructor 属性其实就是一个拿来保存自己构造函数引用的属性，没有其他特殊的地方。默认 constructor 实际上是被当做共享属性放在它们的原型对象中。

## 原型/构造函数/实例之间的关系

每一个 JavaScript 对象( null 除外)在创建时会与之关联另一个对象，这个被关联的对象就是**原型**。所以原型就是一个对象，用来存放公共属性，供其他对象(实例)从原型(原型对象)中‘继承’（委托）原型对象的属性(原型链继承)。 而 **prototype** (显示原型)是函数的专有属性，函数才有的属性，它指向原型(原型对象)，具体指向的是调用该构造函数而创建的实例的原型。除此之外，每一个 JavaScript 对象( null 除外)都有一个属性，叫 **`__proto__`**(隐式原型)，它也指向原型(原型对象)，具体来说，就是指向实例的原型。既然实例对象和构造函数都可以指向原型，那么原型是否有属性指向构造函数或者实例呢？有，原型上有个 **constructor** 属性，指向关联的构造函数。下面是它们三者的关系：

![原型/构造函数/实例之间的关系](/blog/images/javascript/prototype1.png)

```js
Person <===> Person.prototype.constructor
person.__proto__ <===> Person.prototype <===> new Person() 
Object.getPrototypeOf(person) <===> Person.prototype
```

## 原型链

当读取实例对象的属性时，如果找不到，就会查找与该对象关联的原型对象中的属性，如果还查不到，就去找原型的原型，一直找到为止，如果还找不到就是 null（也是对象）。在此过程中，由互相关联的原型组成的链状结构就是 **原型链**。

![原型/实例/构造函数/原型链关系图](/blog/images/javascript/prototype2.png)

```js
/**
 * person 上没有 constructor 属性，所以就通过 person.__proto__ 去原型对象中找，
 * 刚好 Person.prototype 这个原型对象中有 constructor
*/
person.constructor <===> Person.prototype.constructor <===> Persion 
```

::: tip 注意

- 在原型链中查找属性或方法，如果没有查找到相关属性或方法，返回的是 undefined，表示原型链中没有该属性或方法。
- 原型链的末端是 Object.prototype，因为 Object 是所有其他对象的基类。Object.prototype 的原型是 null，这意味着它没有自己的原型，因此原型链在这里结束。当沿着原型链查找属性时，如果到达了 Object.prototype 仍然没有找到该属性，那么最终的返回值将是 `undefined`，而不是 null。
- 当通过字面量方式创建对象时，它的原型就是 `Object.prototype`。
- 通过 `Object.create()` 方式创建的对象会以传入的对象参数为对象的原型。
- 通过 `Object.getPrototypeOf(obj)` 方法可以获取对象的原型（`obj.__proto__` 已废弃）。
- 通过 `instanceof` 操作符可以确定原型与实例的关系，判断一个实例是否属于某种类型。instanceof 操作符会递归查找原型链直到找到了或者到达顶层为止。
- 通过 `obj.hasOwnProperty('property')` 可以判断对象自身是否包含某个属性，不包括原型链上的属性。 而通过`'property' in obj` 可以判断对象自身或其原型链上是否包含某个属性。
:::

## 问题

### Q1. Object 和 Function 的鸡和蛋的问题

先说说  `Function.__proto__ === Function.prototype` 的鸡和蛋的问题：

```js
// 这是底层实现的
const protoObj = Function.prototype;
Function.__proto__ = protoObj;
// 也就是说
// Function.prototype --> addressA
// Function.__proto__ --> addressA
({}).toString.call(Function.prototype).slice(8, -1) === 'Function'


typeof Function.prototype  === typeof Function // true
Function.prototype instanceof Function // false
```

永远把引用类型看成一个地址，Function 在任何引擎执行代码之前已经在内存中了。只不过一个对象标识符 (Function) 的两个属性标识符 (`prototype`, `__proto__`) 引用了同一个地址而已。之所以这样设置，作者前面已经说了，为了保持一致性。毕竟 Function 自身就是一个函数。就是先有的 Function，然后实现上把原型指向了 Function.prototype，但是我们不能倒过来推测因为 `Function.__proto__ === Function.prototype`，所以 Function 调用了自己生成了自己。而 `Function.__proto__` 和 `Function.prototype` 因为功能和普通函数不同，并且自身又是函数对象，所以才恰好的指向了相同的对象。

先有 `Object.prototype`（原型链顶端），`Function.prototype` 继承 `Object.prototype` 而产生，最后，Function 和 Object 和其它构造函数继承 `Function.prototype` 而产生。具体见下图：

![原型/实例/构造函数/原型链关系图](/blog/images/javascript/prototype3.png)

Function 函数同时是自己的构造函数，Function函数同样是Object这类内置对象的构造函数。对象由函数创建，函数都是 Function 对象实例。

### Q2. 原型对象的属性或方法可以修改吗

```js
function Demo() {}
Demo.prototype.say = () => {  //给原型添加say方法
     console.log("hello world")
}
let fn = new Demo(); // 实例化对象
console.log("为修改前",fn.__proto__ === Demo.prototype)  // true
fn.__proto__ = {  // 修改实例中的隐式原型
       say: () => {
           console.log("hello 隐式原型")
      },
      name : 'new name'
}
console.log("修改实例中的隐式原型",fn.__proto__ === Demo.prototype)  // false
```

通过修改 fn 的隐式原型,让它指向一个新的对象。那么 `fn.__proto__` 不等于 `Demo.prototype`。结论：

ES6 之前不能直接操作隐式原型，也不推荐你这么做。原因：例如对象调用属性时，实例对象不具有该属性时，是通过隐式原型去找的该属性的，找不到的话，在它的隐式原型对象的隐式原型对象上找（原型链）。这也就是我们常说的，在原型上添加属性或者方法，实例可以共享，原因就在于我们并不推荐去修改实例的 `__proto__` 属性。

一般而言，可以直接操作显式原型，不能直接操作隐式原型(ES6)

`__proto__` 属性已在 ECMAScript 6 语言规范中标准化，用于确保 Web 浏览器的兼容性。它不被推荐使用, 现在更推荐使用 `Object.getPrototypeOf/Reflect.getPrototypeOf` 和 `Object.setPrototypeOf/Reflect.setPrototypeOf`（尽管如此，设置对象的 `[[Prototype]]`是一个缓慢的操作，如果性能是一个问题，应该避免）。

虽然可以修改原型对象，但这种做法通常不推荐，特别是在对象已经被实例化之后。修改原型对象会影响所有基于该原型创建的对象实例，这可能会导致不可预测的副作用和难以追踪的错误。此外，修改内置对象的原型（如Array.prototype或Object.prototype）可能会导致与第三方库的冲突，因为这些库可能依赖于原型对象的原始行为。如果你需要添加方法或属性，最好直接在构造函数中添加。如果你需要修改对象的行为，最好创建一个新的方法或属性，而不是修改现有的原型对象。

### Q3. new 一个对象发生了什么？

new 关键词创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一。

因为 new 的结果是一个新对象，所以在模拟实现的时候，我们也要建立一个新对象，这个新对象可以访问到构造函数中的属性。根据原型与原型链，我们知道实例的 **proto** 属性会指向构造函数的 prototype，也正是因为建立起这样的关系，实例可以访问原型上的属性。所以：

- 访问到 Otaku **构造函数里的属性**
- 访问到 Otaku.prototype **原型对象上的属性**

new 一个对象发生了什么？

- （1）创建一个新的对象（创建一个新的对象）
- （2）设置这个新对象的原型为构造函数的原型（设置对象的原型属性）
- （3）执行构造函数，设置构造函数的 this 指向为新创建的对象，执行构造函数中定义的行为。（确定 this 指向）
- （4）返回值处理
  - 如果构造函数返回值是**引用类型**，则**返回执行构造函数后的返回值**。构造函数返回了一个对象，在实例中只能访问返回的对象中的属性
  - 如果构造函数的返回值是**基本类型(undefined、null、string、number、boolean、symbol、bigint(大于 2^53 - 1 的整数))**，则**返回新创建的对象**。尽管有返回值，但是相当于没有返回值进行处理。

实现：

```js
/**
 * 方法一
 * 
 * 工厂方法实现 new
 * objectFactory(constructor, ...restParams)
 */
function myNew1() {
  // 创建一个新对象 从 Object.prototype 上克隆一个对象
  let obj = new Object();
  // 取出第一个参数，就是我们要传入的构造函数。此外因为 shift 会修改原数组，所以 arguments 会被去除第一个参数
  // 使 new 出的对象 可以访问构造函数及其原型对象上的的属性和方法
  // 取出构造函数，从 arguments 对象 中取出第一个参数即为构造函数
  let con = Array.prototype.shift.call(arguments);
  // 将 obj 的原型指向构造函数，这样 obj 就可以访问到构造函数原型中的属性
  // 将 new 出的对象原型 指向 构造函数的原型对象 这样 obj 就可以访问到构造函数原型中的属性
  // 执行构造函数，并改变 new 出的对象的 this， 这样 obj 就可以访问到构造函数中的属性
  // 区别：
  // 一个能访问的构造函数原型上的属性和方法 - 原型链
  // 一个能访问到构造函数本身上的属性和方法 - 借助 apply 改变 this 指向
  obj.__proto__ = con.prototype; // Object.setPrototypeOf(obj, con.prototype)
  // 绑定this，执行构造函数，使用 apply 借用构造函数，改变构造函数 this 的指向到新建的对象，这样 obj 就可以访问到构造函数中的属性
  // 执行并返回结果，arguments 数组经过上面 shift 的处理已经只剩下参数了，shift 可改变原数组 arguments
  let result = con.apply(obj, arguments);
  // 返回值处理 确保 new 出来的是个对象
  // 如果执行构造函数后返回的是一个对象且不是null，则返回该对象，否则返回创建的对象
  return (typeof result === 'object' && result !== null) ? result : : obj;
}

/**
 * 方法二 （推荐）
 * @param {} constructor 
 * @param  {...any} restParams 
 * @returns 
 * 当通过字面量方式创建对象时，它的原型就是 Object.prototype。
 * 通过 Object.create() 方式创建的对象会以传入的对象参数为对象的原型。
 */
function myNew2(constructor, ...restParams) {
  // 创建空对象，空对象关联构造函数的原型对象
  const obj = Object.create(constructor.prototype);
  // 执行对象类的构造函数，同时该实例的属性和方法被 this 所引用，即 this 指向新构造的实例
  const result = constructor.apply(obj, restParams);
  // 如果执行构造函数后返回的是一个对象且不是null，则返回该对象，否则返回创建的对象
  return (typeof result === 'object' && result !== null) ? result : obj;
}

// 测试用例1
function Otaku(name, age) {
  this.name = name;
  this.age = age;
  this.habit = "Games";

  // return {
  //   name
  // }
}
Otaku.prototype.strength = 60;
Otaku.prototype.sayYourName = function () {
  console.log("I am " + this.name);
};

var person = myNew1(Otaku, "Kevin", "18");

console.log(person.name); // Kevin
console.log(person.habit); // Games
console.log(person.strength); // 60
person.sayYourName(); // I am Kevin
```

::: warning 参考文献
[JavaScript深入之从原型到原型链](https://github.com/mqyqingfeng/Blog/issues/2)
:::
