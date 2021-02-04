# Set 和 Map

## Set

Set本身是一个构造函数，用来生成 Set 数据结构。

### 静态属性

- Set.prototype.constructor：构造函数，默认就是 Set 函数。
- Set.prototype.size：返回 Set 实例的成员总数。
  
### 操作方法

用于操作数据

- Set.prototype.add(value)：添加某个值，返回 Set 结构本身。
- Set.prototype.delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
- Set.prototype.has(value)：返回一个布尔值，表示该值是否为Set的成员。
- Set.prototype.clear()：清除所有成员，没有返回值。

### 遍历方法

用于遍历成员

- Set.prototype.keys()：返回键名的遍历器
- Set.prototype.values()：返回键值的遍历器
- Set.prototype.entries()：返回键值对的遍历器
- Set.prototype.forEach()：使用回调函数遍历每个成员

由于 Set 结构没有键名，只有键值（或者说键名和键值是同一个值），所以 keys 方法和 values 方法的行为完全一致。默认遍历器生成函数就是它的 values 方法，可以省略 values 方法，直接用 for...of(value) 循环遍历 Set。

### 特性

- 成员的值都是唯一的，没有重复的值
- 向 Set 加入值的时候，不会发生类型转换。类似 `===` 的算法判断两个值是否不同，主要的区别是向 Set 加入值时认为 NaN 等于自身，而精确相等运算符认为 NaN 不等于自身。
- keys 方法和 values 方法的行为完全一致。原因是 Set 结构没有键名，只有键值（或者说键名和键值是同一个值）
- 直接用 for...of(value) 循环遍历 Set
- 实现并集（Union）、交集（Intersect）和差集（Difference）。

## WeakSet

WeakSet 结构与 Set 类似，也是不重复的值的集合。

### 操作方法

- WeakSet.prototype.add(value)：向 WeakSet 实例添加一个新成员。
- WeakSet.prototype.delete(value)：清除 WeakSet 实例的指定成员。
- WeakSet.prototype.has(value)：返回一个布尔值，表示某个值是否在 WeakSet 实例之中。

### 与 Set 的区别

- WeakSet 的成员只能是对象，而不能是其他类型的值。
- WeakSet 中的对象都是弱引用
- WeakSet 没有 size 静态属性
- WeakSet 没有 clear 方法
- WeakSet 没有遍历方法，WebSet 不能遍历

WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于 WeakSet 之中。

这是因为垃圾回收机制依赖引用计数，如果一个值的引用次数不为0，垃圾回收机制就不会释放这块内存。结束使用该值之后，有时会忘记取消引用，导致内存无法释放，进而可能会引发内存泄漏。WeakSet 里面的引用，都不计入垃圾回收机制，所以就不存在这个问题。因此，WeakSet 适合临时存放一组对象，以及存放跟对象绑定的信息。只要这些对象在外部消失，它在 WeakSet 里面的引用就会自动消失。

由于上面这个特点，WeakSet 的成员是不适合引用的，因为它会随时消失。另外，由于 WeakSet 内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行是不可预测的，因此 ES6 规定 WeakSet 不可遍历。

### 特性

- 成员的值都是唯一的，没有重复的值
- 员只能是对象，而不能是其他类型的值
- WeakSet 中的对象都是弱引用，引用不计入垃圾回收机制
- WeakSet 中的对象都是弱引用，所以不会引发内存泄漏
- WeakSet 中的对象都是弱引用，所以 WeakSet 适合临时存放一组对象，以及存放跟对象绑定的信息
- WeakSet 的成员是不适合引用的，因为它会随时消失
- WeakSet 不可遍历。因为 WeakSet 内部有多少个成员，取决于垃圾回收机制有没有运行。
- WeakSet 没有 size 属性，因为 WeakSet 内部有多少个成员，取决于垃圾回收机制有没有运行，没有 size 也就没法遍历。
- WeakSet 的一个用处，是储存 DOM 节点，而不用担心这些节点从文档移除时，会引发内存泄漏。

## Map

JavaScript 的对象（Object），本质上是键值对的集合（Hash 结构），但是传统上只能用字符串当作键。这给它的使用带来了很大的限制。为了解决这个问题，ES6 提供了 Map 数据结构。它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。Set 和 Map 都可以用来生成新的 Map。

Map 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。这就解决了同名属性碰撞（clash）的问题，我们扩展别人的库的时候，如果使用对象作为键名，就不用担心自己的属性与原作者的属性同名。

如果 Map 的键是一个简单类型的值（数字、字符串、布尔值），则只要两个值严格相等，Map 将其视为一个键，比如 0 和 -0 就是一个键，布尔值 true 和字符串 true 则是两个不同的键。另外，undefined 和 null 也是两个不同的键。虽然 NaN 不严格相等于自身，但 Map 将其视为同一个键。

### 静态属性

- Map.prototype.size：size 属性返回 Map 结构的成员总数。

### 操作方法

- Map.prototype.set(key, value)：set 方法设置键名 key 对应的键值为 value，然后返回整个 Map 结构。如果 key 已经有值，则键值会被更新，否则就新生成该键。set 方法返回的是当前的 Map 对象，因此可以采用链式写法。
- Map.prototype.get(key)：get 方法读取 key 对应的键值，如果找不到 key，返回 undefined。
- Map.prototype.has(key)：has 方法返回一个布尔值，表示某个键是否在当前 Map 对象之中。
- Map.prototype.delete(key)：delete方法删除某个键，返回 true。如果删除失败，返回 false。
- Map.prototype.clear()：clear 方法清除所有成员，没有返回值。

### 遍历方法 

- Map.prototype.keys()：返回键名的遍历器。
- Map.prototype.values()：返回键值的遍历器。
- Map.prototype.entries()：返回所有成员的遍历器。等同于 `for (let [key, value] of map.entries()) {}`
- Map.prototype.forEach()：遍历 Map 的所有成员。



### 特性

- Map 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键
- Map 的键若是一个简单类型的值（数字、字符串、布尔值），则只要两个值严格相等(`===`)，Map 将其视为一个键
- Map 的 set 方法返回的是当前的 Map 对象，因此可以采用链式写法。
- Map 结构转数组结构，可用扩展运算符（...）


## WeakMap

WeakMap 结构与 Map 结构类似，也是用于生成键值对的集合。

### 与 Map 的区别

- WeakMap 只接受对象作为键名（null除外），不接受其他类型的值作为键名。
- WeakMap 的键名所指向的对象都是弱引用，不计入垃圾回收机制。
- WeakMap 没有 size 静态属性
- WeakMap 没有 clear 方法
- WeakMap 没有遍历方法，WeakMap 不能遍历
- WeakMap 只有四个方法可用：get()、set()、has()、delete()。

WeakMap 的键名所引用的对象都是弱引用，即垃圾回收机制不将该引用考虑在内。因此，只要所引用的对象的其他引用都被清除，垃圾回收机制就会释放该对象所占用的内存。也就是说，一旦不再需要，WeakMap 里面的键名对象和所对应的键值对会自动消失，不用手动删除引用。如果你要往对象上添加数据，又不想干扰垃圾回收机制，就可以使用 WeakMap。一个典型应用场景是，在网页的 DOM 元素上添加数据，就可以使用 WeakMap 结构。当该 DOM 元素被清除，其所对应的 WeakMap 记录就会自动被移除。WeakMap 的专用场合就是，它的键所对应的对象，可能会在将来消失。WeakMap 结构有助于防止内存泄漏。WeakMap 弱引用的只是键名，而不是键值。键值依然是正常引用。

::: warning 参考文献
[ECMAScript 6 入门](https://es6.ruanyifeng.com/#docs/set-map)

[你不知道的 WeakMap](https://mp.weixin.qq.com/s/9Mscr5f4V5lXtAqdGorkmA)

:::