# 执行上下文栈

javaScript 引擎不是一行行执行的，而是一段段执行的。当执行一段代码的时候，会进行一个 **“准备工作”**，比如变量提升或函数提升，这个“准备工作”就是**构建执行上下文**。JavaScript 引擎创建执行上下文栈(ECS)来管理执行上下文。而重点是如何理解“一段段”是如何划分的？

## JavaScript 的可执行代码

- 全局代码(表达式,赋值语句等)
- 函数代码
- eval代码
  
JS 引擎在解释代码时，最先遇到全局代码，所以初始化的时候首先就会向执行上下文压入全局执行上下文(globalContext)，并且只有当整个应用程序结束的时候，ECStack 才会被清空，所以程序结束之前，ECStrack 底部永远有一个 globalContext。

当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。（堆栈处理）

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
[JavaScript深入之执行上下文栈 ](https://github.com/mqyqingfeng/Blog/issues/4)
:::