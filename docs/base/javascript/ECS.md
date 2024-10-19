# 执行上下文栈

javaScript 引擎不是一行行执行的，而是一段段执行的。当执行一段代码的时候，会进行一个 **“准备工作”**，比如变量提升（var 声明的变量）或函数提升（函数声明，非函数表达式），这个“准备工作”就是**构建执行上下文**。JavaScript 引擎创建执行上下文栈(ECS)来管理执行上下文。而重点是如何理解“一段段”是如何划分的？

实例1：

```js
var foo = function () {
    console.log('foo1');
}
foo();  // foo1
var foo = function () {
    console.log('foo2');
}
foo(); // foo2

// 原因：存在 `var foo` 变量提升，函数表达式不会提升，实质代码如下：

var foo;
foo = function () {
    console.log('foo1');
}
foo();  // foo1
foo = function () {
    console.log('foo2');
}
foo(); // foo2
```

实例2：

```js
function foo() {
    console.log('foo1');
}
foo();  // foo2
function foo() {
    console.log('foo2');
}
foo(); // foo2

// 原因：存在函数提升，函数声明可以提升，实质代码如下：

var foo;
foo = function () {
    console.log('foo1');
}
foo = function () {
    console.log('foo2');
}
foo();  // foo2
foo(); // foo2
```

关于提升，函数创建有函数声明和函数表达式之分，**函数表达式是不会被提升的， 函数声明存在变量提升**。

```js
// 函数表达式不会提升
foo(); // TypeError: undefined is not a function
var foo = function() {
    console.log('foo');
}

// 函数声明可以提升
foo(); // foo
function foo() {
    console.log('foo');
}
```

## JavaScript 的可执行代码

- 全局代码(表达式,赋值语句等)
- 函数代码
- eval代码
  
JS 引擎在解释代码时，最先遇到全局代码，所以初始化的时候首先就会向执行上下文压入全局执行上下文(globalContext)，并且只有当整个应用程序结束的时候，ECStack 才会被清空，所以程序结束之前，ECStrack 底部永远有一个 globalContext。

**当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈**，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。（堆栈处理）

- 创建阶段，执行上下文会创建变量对象（VO），建立作用域链（scope chain），以及确定 this 的指向
- 代码执行阶段，创建完成后，才会开始执行代码，这个过程就是变量赋值（AO），函数引用，以及执行其他代码

实例1：

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();

ECStack.push(<checkscope> functionContext);
ECStack.push(<f> functionContext);
ECStack.pop();
ECStack.pop();
```

实例2：

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();

ECStack.push(<checkscope> functionContext);
ECStack.pop();
ECStack.push(<f> functionContext);
ECStack.pop();
函数执行结束之后，如果没有显示地返回值，默认是undefined
```

::: warning 参考文献
[JavaScript深入之执行上下文栈](https://github.com/mqyqingfeng/Blog/issues/4)
:::
