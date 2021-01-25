# 原型与原型链

![原型/实例/构造函数/原型链关系图](/blog/images/javascript/prototype3.png)
## 什么是原型

每一个 JavaScript 对象( null 除外)在创建时会与之关联另一个对象，这个被关联的对象称之为 **原型**(原型对象)。每一个对象都会从原型中‘继承’（委托）原型对象的属性。原型对象就是用来存放实例中共有的那部分属性。**每个函数都有一个特殊的属性叫作原型（prototype）**，这个属性指向调用该构造函数而创建的实例的原型。原型对象中有一个属性 constructor, 它指向函数对象。

## 什么是 protoype

显示原型

prototype 是函数才有的属性，这个属性指向一个对象，该对象正是调用该构造函数而创建的实例的原型。**指向原型对象**。**箭头函数是没有 prototype 属性的**。在最新 ES 规范里，prototype 被定义为：给其它对象**提供共享属性的对象**。prototype 自己也是对象，只是被用以承担某个职能罢了。prototype 描述的是两个对象之间的某种（委托）关系（其中一个，为另一个提供属性访问权限）。每个函数都有一个 prototype 属性，它默认指向一个 Object 空对象(即称为:原型对象)。

::: tip 注意
并不是所有的函数都有 prototype 属性，由函数 bind()方法返回的函数就没有 prototype 属性。

函数的 prototype 属性，在定义函数时自动添加 prototype，默认是一个空 Object 对象
:::

## 什么是 `__proto__`

隐式原型

每一个 JavaScript 对象( null 除外)都有一个属性，叫 **`__proto__`** ,这个属性**指向该对象的原型**。**指向原型对象**, 原型对象其实就是通过 Object 构造函数生成的。它是历史遗留，在某些环境中，比如 Deno，它是不被支持的。

::: tip 进一步阐述
`__proto__` ，绝大部分浏览器都支持这个非标准的方法访问原型，然而它并不存在于 `Person.prototype` 中。实际上，它是来自于 `Object.prototype` ，与其说是一个属性，不如说是一个 `getter/setter`，当使用 `obj.__proto__` 时，可以理解成返回了 `Object.getPrototypeOf(obj)`。所以 `Object.prototype.__proto__` 的值为 `null` 跟 `Object.prototype` 没有原型，其实表达了一个意思。

所以 `__proto__` 来自 Object.prototype 通过原型链委托返回 Object.getPrototypeOf(obj)
:::


## 什么是 constructor

既然实例对象和构造函数都可以指向原型，那么原型是否有属性指向构造函数或者实例呢？那就是 constructor：

每个原型都有一个 constructor 属性指向关联的构造函数。


## 原型/构造函数/实例之间的关系

每一个 JavaScript 对象( null 除外)在创建时会与之关联另一个对象，这个被关联的对象就是**原型**。所以原型就是一个对象，用来存放公共属性，供其他对象(实例)从原型(原型对象)中‘继承’（委托）原型对象的属性(原型链继承)。 而 **prototype** (显示原型)是函数的专有属性，函数才有的属性，它指向原型(原型对象)，具体指向的是调用该构造函数而创建的实例的原型。除此之外，每一个 JavaScript 对象( null 除外)都有一个属性，叫 **`__proto__`**(隐式原型)，它也指向原型(原型对象)，具体来说，就是指向实例的原型。既然实例对象和构造函数都可以指向原型，那么原型是否有属性指向构造函数或者实例呢？有，原型上有个 **constructor** 属性，指向关联的构造函数。下面是它们三者的关系：

![原型/构造函数/实例之间的关系](/blog/images/javascript/prototype1.png)

```js
Person <===> Person.prototype.constructor
person.__proto__ <===> Person.prototype <===> new Person() 
Object.getPrototypeOf(person) <===> Person.prototype
```

## 原型链

当读取实例对象的属性时，如果找不到，就会查找与该对象关联的原型对象中的属性，如果还查不到，就去找原型的原型，一直找到为止，如果还找不到就是 null。在此过程中，由互相关联的原型组成的链状结构就是 **原型链**。

![原型/实例/构造函数/原型链关系图](/blog/images/javascript/prototype2.png)

```js
/**
 * person 上没有 constructor 属性，所以就通过 person.__proto__ 去原型对象中找，
 * 刚好 Person.prototype 这个原型对象中有 constructor
*/
person.constructor <===> Person.prototype.constructor <===> Persion 
```



## 疑点

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

::: warning 参考文献
[JavaScript深入之从原型到原型链](https://github.com/mqyqingfeng/Blog/issues/2)
:::