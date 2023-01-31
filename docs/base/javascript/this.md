# This

JavaScript 执行一段可执行代码时，会创建对应的执行上下文，那么每个执行上下文中都有哪些内容？

执行上下文 3 个重要的属性:

- 变量对象(Variable Object，VO)
- 作用域链(Scope Chain)
- this

这节主讲 This

![this](/blog/images/javascript/this.png)

## this 的几种调用场景

- 作为对象调用时，指向该对象 `obj.b();` // 指向 obj
- 作为函数调用, `var b = obj.b; b();` // 指向全局 window
- 作为构造函数调用 `var b = new Fun();` // this 指向当前实例对象
- 作为 call 与 apply 调用 `obj.b.apply(object, []);` // this 指向当前的 object

## this 指向

- 全局作用域里的 this 是 window，严格模式下是 undefined，window.fn() 把 window. 省略了；
- 函数的 this，看执行主体前有没有点，有点，前面是谁，函数里的 this 就是谁，没有点，函数的 this 就是 window，严格模式下是 undefined
- 自执行函数里的 this 是 window，严格模式下是 undefined
- 回调函数里的 this 一般情况下是 window
- 箭头函数没有 this，在箭头函数中使用的 this，是上级作用域或作用域链中找到的 this，直到找到全局的 window。
- 构造函数里的 this 是当前实例
- 实例原型上的公有方法里的 this 一般是当前实例
- 给元素绑定事件行为事件里的 this 就是当前被绑定的元素本身

## 捋一捋

每个执行上下文，都有三个重要属性：变量对象(Variable object，VO)，作用域链(Scope chain)，this。下面结合起来分析：
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
```
1. 执行全局代码，创建全局执行上下文，全局上下文被压入执行上下文栈：
```js
ECStack = [
        globalContext
];
```
2. 全局上下文初始化：
```js
globalContext = {
    VO: [global],
    Scope: [globalContext.VO],
    this: globalContext.VO
}
```
初始化的同时，checkscope 函数被创建，保存作用域链到函数的内部属性 `[[scope]]`:
```js
checkscope.[[scope]] = [
    globalContext.VO
];
```
3. 执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 函数执行上下文被压入执行上下文栈：
```js
ECStack = [
    checkscopeContext,
    globalContext
];
```
4. checkscope 函数执行上下文初始化：

   - 复制函数 [[scope]] 属性创建作用域链
   - 用 arguments 创建活动对象
   - 初始化活动对象，即加入形参、函数声明、变量声明
   - 将活动对象压入 checkscope 作用域链顶端，同时 f 函数被创建，保存作用域链到 f 函数的内部属性 `[[scope]]`
```js
checkscopeContext = {
    AO: {
        arguments: {
            length: 0
        },
        scope: undefined,
        f: reference to function f(){}
    },
    Scope: [AO, globalContext.VO],
    this: undefined
}
```
5.	执行 f 函数，创建 f 函数执行上下文，f 函数执行上下文被压入执行上下文栈
```js
ECStack = [
    fContext,
    checkscopeContext,
    globalContext
];
```
6.	f 函数执行上下文初始化, 以下跟第 4 步相同：

- 复制函数 `[[scope]]` 属性创建作用域链
- 用 arguments 创建活动对象
- 初始化活动对象，即加入形参、函数声明、变量声明
- 将活动对象压入 f 作用域链顶端
```js
fContext = {
    AO: {
        arguments: {
        length: 0
        }
    },
    Scope: [AO, checkscopeContext.AO, globalContext.VO],
    this: undefined
}
```
7. f 函数执行，沿着作用域链查找 scope 值，返回 scope 值
8. f 函数执行完毕，f 函数上下文从执行上下文栈中弹出
```js
ECStack = [
    checkscopeContext,
    globalContext
];
```
9. checkscope 函数执行完毕，checkscope 执行上下文从执行上下文栈中弹出
```js
ECStack = [
    globalContext
];
```

::: warning 参考文献
[JavaScript深入之从ECMAScript规范解读this](https://github.com/mqyqingfeng/Blog/issues/7)
:::