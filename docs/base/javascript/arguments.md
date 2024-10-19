# 参数传递与 Arguments

## 参数按值传递

ECMAScript 中所有的函数的参数都是按值传递的。

一般参数传递方式有以下 3 种：

- 按值传递指：把函数外部的值复制给函数内部的参数，就和把值从一个变量复制到另一个变量，函数内部对参数的修改不会影响到外部变量。
- 按引用传递：传递对象的引用（堆中对象在栈中的地址值），这意味着函数内部的参数和外部的变量指向同一块内存地址，函数内部对参数的修改会影响到外部变量。
- 按共享传递：传递对象的引用副本（被引用对象的栈地址），函数内对参数的修改不会影响原来的对象，所以也是值传递。

但 JS 中值类型（基本数据类型）按值传递；引用类型按共享传递（传拷贝后的引用的副本，拷贝的过程就是值传递，所以本质也是值传递）

综上，javaScript 参数**如果是值类型按值传递；如果是引用类型按共享传递（传递引用的副本）**。

::: tip 注意
按引用传递是传递对象的引用，而按共享传递是传递对象的引用的副本！
引用传递，不产生副本，会修改原值；共享传递，产生引用的副本，不会修改原值

参数如果是基本类型是按值传递，如果是引用类型按共享传递。
但是因为拷贝副本也是一种值的拷贝，所以在高程中也直接认为是按值传递了。
:::

很多人还认为按引用传递也是按值传递，只是值是指针而已，这个说法也对，只是我们把所有的情况都归到按值传递上，看似统一了，但是如果我们要分析具体的情况时，一句按值传递可不好让人清晰的明白问题呐，所以才有了按引用传递和按共享传递的概念的出现。

毕竟值类型的值传递和引用类型的值传递在内存栈上的拷贝方式是完全相同的, 唯一差别就在于值类型和引用类型的差别了。

```js
// 值传递（基本类型）
var value = 1;
function foo(v) {
    v = 2;
    console.log(v); // 2
}
foo(value);
console.log(value) // 1 值传递（基本类型），foo 拷贝副本 value 为 v，内部对 v 的修改，不影响原来的 value

// 值传递（引用类型共享传递）
var obj = {
    value: 1
};
function foo(o) {
    o = 2;  // 注意修改了引用副本的地址（栈地址），不是原引用的地址
    console.log(o); // 2
}
foo(obj);
console.log(obj.value) // 1  值传递（引用类型共享传递），foo 拷贝副本 obj 引用对象的地址为 o，对 o 的修改，不影响原来的 obj，此时 obj 和 o 的引用地址不一样

// 引用类型传递副本
var obj = {
    value: 1
};
function foo(o) {
    o.value = 2; // 注意 o 是 obj 的引用地址的副本，引用所指向的内容被修改
    console.log(o.value); // 2
}
foo(obj);
console.log(obj.value) // 2 函数内部对参数的任何改变都会影响该对象的值，因为两者虽然引用地址不一样但是引用的都是同一个对象
```

## 类数组对象与 arguments

### 什么是类数组对象

用于一个 length 属性和若干索引属性的对象。类数组对象可以进行**读写**，**获取长度**，**遍历** 3个方面，**但不能使用数组的方法**。如果非要使用数组的方法可以通过 call() 等函数。

::: tip 类数组转数组
- Array.prototype.slice.call(arrayLike);
- Array.prototype.splice.call(arrayLike, 0); 
- Array.from(arrayLike);
- Array.prototype.concat.apply([], arrayLike)
- ES6的 ... 运算符
:::

### Arguments 对象

Arguments 对象只定义在函数体中，包括了函数的参数和其他属性。在函数体中，arguments 指代该函数的 Arguments 对象。

Arguments 对象的属性：

- length属性：表示实参的长度
- callee属性：通过 callee 可以调用函数自身

::: tip 注意
Arguments 和对应参数的绑定：传入的参数，实参和 arguments 的值会共享，当没有传入时，实参与 arguments 值不会共享。除此之外，以上是在非严格模式下，如果是在严格模式下，实参和 arguments 是不会共享的。
:::

Arguments的应用场景：

- 参数不定长
- 函数柯里化
- 递归调用
- 函数重载

等等。。。

::: warning 参考文献
[JavaScript深入之参数按值传递](https://github.com/mqyqingfeng/Blog/issues/10)

[JavaScript深入之类数组对象与arguments ](https://github.com/mqyqingfeng/Blog/issues/14)
:::
