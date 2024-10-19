# 装饰器

装饰器（Decorator）是一种与类（class）相关的语法，用来注释或修改类和类方法。装饰器是一种函数，写成 `@ + 函数名`。它可以放在类和类方法的定义前面。、

装饰器是一个还处于草案中的特性，目前木有直接支持该语法的环境，但是可以通过 babel 之类的进行转换为旧语法来实现效果。

装饰器主要用于：

- 装饰类
- 装饰方法或属性

为什么要用装饰器：

有些时候，我们会对传入参数的类型判断、对返回值的排序、过滤，对函数添加节流、防抖或其他的功能性代码，基于多个类的继承，各种各样的与函数逻辑本身无关的、重复性的代码。

## 装饰类

装饰器是一个对类进行处理的函数。装饰器函数的第一个参数，就是所要装饰的目标类。装饰器对类的行为的改变，是代码编译时发生的，而不是在运行时。这意味着，装饰器能在编译阶段运行代码。也就是说，**装饰器本质就是编译时执行的函数**。

```js
@annotation
class MyClass { }

function annotation(target) {
   target.annotated = true;
}
```

## 装饰方法或属性

```js
class MyClass {
  @readonly
  method() { }
}

function readonly(target, name, descriptor) {
  descriptor.writable = false;
  return descriptor;
}
```

装饰器第一个参数是类的原型对象，装饰器的本意是要 “装饰” 类的实例，但是这个时候实例还没生成，所以只能去装饰原型（这不同于类的装饰，那种情况时 target 参数指的是类本身）；第二个参数是所要装饰的属性名，第三个参数是该属性的描述对象。

## 应用

实现防抖装饰器 `@debounce`

```js
class Toggle extends React.Component {

  @debounce(500, true)
  handleClick() {
    console.log('toggle')
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        button
      </button>
    );
  }
}

function _debounce(func, wait, immediate) {

    var timeout;

    return function () {
        var context = this;
        var args = arguments;

        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(function(){
                timeout = null;
            }, wait)
            if (callNow) func.apply(context, args)
        }
        else {
            timeout = setTimeout(function(){
                func.apply(context, args)
            }, wait);
        }
    }
}

function debounce(wait, immediate) {
  return function handleDescriptor(target, key, descriptor) {
    const callback = descriptor.value;

    if (typeof callback !== 'function') {
      throw new SyntaxError('Only functions can be debounced');
    }

    var fn = _debounce(callback, wait, immediate)

    return {
      ...descriptor,
      value() {
        fn()
      }
    };
  }
}
```

### 类和方法的扩展

装饰器可以用来为类或其方法添加额外的功能，而不需要改变原始的类定义。这在创建通用功能（如日志记录、性能监控、事务处理、缓存等）时非常有用。

```js
// 日志装饰器
function logDecorator(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`Calling ${propertyKey} with arguments:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Method ${propertyKey} returned:`, result);
    return result;
  };
  return descriptor;
}

class MyClass {
  @logDecorator
  myMethod() {
    return "Hello, World!";
  }
}
```

### 权限控制和访问管理

装饰器可以用于实现权限控制，例如，检查用户是否有权访问特定的类方法。

```js
function authorizeDecorator(allowedRoles) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      if (!allowedRoles.includes(this.userRole)) {
        throw new Error("You do not have permission to access this method.");
      }
      return originalMethod.apply(this, args);
    };
  };
}

class SecureClass {
  @authorizeDecorator(['admin', 'moderator'])
  secureMethod() {
    return "This is a secure method.";
  }
}
```

### 属性注入

装饰器可以用于属性注入，例如，依赖注入框架中，自动注入依赖的服务或组件。

```js
function injectDecorator(service) {
  return function(target, propertyKey) {
    target[propertyKey] = service;
  };
}

const myService = { /* service implementation */ };

class DependencyInjection {
  @injectDecorator(myService)
  myService;
}
```

更多装饰器应用了解 [ES6 系列之我们来聊聊装饰器](https://github.com/mqyqingfeng/Blog/issues/109)

## 问题

### 为什么装饰器不能用于函数？

装饰器只能用于类和类的方法，不能用于函数，因为存在函数提升。

由于存在函数提升，使得装饰器不能用于函数。类是不会提升的，所以就没有这方面的问题。

如果一定要装饰函数，可以采用高阶函数的形式直接执行。

```js
var counter = 0;

var add = function () {
  counter++;
};

@add
function foo() {
}

// 实际
var counter;
var add;

@add
function foo() {
}

counter = 0;

add = function () {
  counter++;
};
```

::: warning 参考文献
[ES6 系列之我们来聊聊装饰器](https://github.com/mqyqingfeng/Blog/issues/109)

[ECMAScript装饰器的简单指南](https://juejin.cn/post/6844903640897945613)

[Javascript装饰器的妙用](https://juejin.cn/post/6844903635168526343)

[手把手带你实现装饰器路由](https://juejin.cn/post/6844904183489888270)
:::
