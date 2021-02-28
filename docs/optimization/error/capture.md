# 前端异常捕获与处理

## 异常分类

- JS 运行时错误
  
  JS 运行时错误分为 **同步错误** 与 **异步错误** 。代码错误一般在开发和测试阶段就能发现，用 `try-catch` 也能捕获到， `try-catch` 只能捕获运行时同步错误，其他类型无法捕获。可以使用 ` onerror`  它都可以捕获到运行时的同步/异步错误

- JS 语法错误

    语法错误在开发阶段就可以发现，但有时线上会收到一些语法错误的警告，一般是 JSON 解析出错和浏览器兼容性导致。语法错误无法通过 `try-catch` 捕获。JSON 的解析出错可以通过 `try-catch` 捕获

- 异步错误

   异步错误(Promise 错误): try-catch 对语法和异步错误却无能为力，捕获不到。需要监听 `unhandledrejection` 来帮我们捕获这部分错误。

- 静态资源加载异常

    通过 `onerror` 或 `addEventListener("error")` 捕获

- ajax 请求异常
  
  如果使用 axios 库，可以使用 axios 的拦截器处理

## 异常类型

从根本上来说，异常就是一个数据结构，它存了异常发生时相关信息，譬如错误码、错误信息等。其中 message 属性是唯一一个能够保证所有浏览器都支持的属性，除此之外，IE、Firefox、Safari、Chrome 以及 Opera 都为事件对象添加了其它相关信息。譬如 IE 添加了与 message 属性完全相同的 description 属性，还添加了保存这内部错误数量的 number 属性。Firefox 添加了 fileName、lineNumber 和 stack（包含堆栈属性）。所以，在考虑浏览器兼容性时，最好还是只使用 message 属性。

执行 JS 期间可能会发生的错误有很多类型。每种错误都有对应的错误类型，而当错误发生的时候就会抛出响应的错误对象。ECMA-262 中定义了下列 7 种错误类型：

- Error：错误的基类，其他错误都继承自该类型
- EvalError：Eval 函数执行异常
- RangeError：数组越界
- ReferenceError：尝试引用一个未被定义的变量时，将会抛出此异常
- SyntaxError：语法解析不合理
- TypeError：类型错误，用来表示值的类型非预期类型时发生的错误
- URIError：以一种错误的方式使用全局 URI 处理函数而产生的错误

## 异常捕获与处理

### try-catch

try-catch 在我们的代码中经常见到，通过给代码块进行 try-catch 进行包装后，当代码块发生出错时 catch 将能捕捉到错误的信息，页面也将可以继续执行。但是 try-catch 处理异常的能力有限，**只能捕获捉到运行时非异步错误，对于语法错误和异步错误就显得无能为力，捕捉不到**。可以使用 ` onerror`  它都可以捕获到运行时的同步/异步错误

一般语法错误在编辑器就会体现出来，常表现的错误信息为： `Uncaught SyntaxError: Invalid or unexpected token xxx` 这样。但是这种错误会直接抛出异常，常使程序崩溃，一般在编码时候容易观察得到。

如果 try 块中的任何代码发生了错误，就会立即退出代码执行过程，然后执行 catch 块。此时 catch 块会接收到一个包含错误信息的对象，这个对象中包含的信息因浏览器而异，但共同的是有一个保存着错误信息的 message 属性。finally 子句在 try-catch 语句中是可选的，但是 finally 子句一经使用，其代码无论如何都会执行。换句话说，try 语句块中代码全部正常执行，finally 子句会执行；如果因为出错执行了 catch 语句，finally 子句照样会执行。只要代码中包含 finally 子句，则无论 try 或 catch 语句中包含什么代码，甚至是 return 语句，都不会阻止 finally 子句执行。

### window.onerror

全局监听捕获 JS 产生的错误。当 JS 运行时错误发生时，window 会触发一个 ErrorEvent 接口的 error 事件，并执行 `window.onerror()`。**同步错误可以捕获到，但是 `window.onerror()` 无法捕获静态资源异常和 JS 代码错误**。

```js
/**
 * @param {String}  message    错误信息
 * @param {String}  source     出错文件
 * @param {Number}  lineno     行号
 * @param {Number}  colno      列号
 * @param {Object}  error      Error对象（对象）
 */
window.onerror = function (message, source, lineno, colno, error) {
  console.log("捕获到异常：", { message, source, lineno, colno, error });
};
```

### 静态资源加载异常

#### 方法一 onerror 捕获

通过在静态资源标签加 `onerror` 方法，捕获静态资源加载异常。

**缺点** : 

- 每一个静态资源标签都要加上 onerror 方法, 代码侵入性太强。
- 在单页面应用中，当我们使用 script 标签引入了 JS 文件，当该 JS 文件的来源域名和网页的域名不同时，这时如果该 JS 文件内部报错，则我们只能捕获到 Script Error，而不是详细的错误信息，这是由于浏览器的跨域限制。解决方法：

    - 需要在跨域的 script 标签中加入 crossorigin 属性，例如 `<script type="text/javascript" src="example.js" crossorigin></script>`
    - 需要给跨域资源的服务器的 response header 设置允许跨域：`Access-Control-Allow-Origin: *`

- 不能全局捕获到非JS脚本资源的加载异常，解决方案： 使用 `window.addEventListener` 捕获。
- 无法捕获语法错误
- 最好写在所有 JS 脚本的前面，否则有可能捕获不到错误

```html
<script>
  function errorHandler(error) {
    console.log("捕获到静态资源加载异常", error);
  }
</script>
<script src="http://cdn.xxx.com/js/test.js" onerror="errorHandler(this)"></script>
<link rel="stylesheet" href="http://cdn.xxx.com/styles/test.css" onerror="errorHandler(this)">
```

#### 方法二 addEventListener("error")

当一项资源加载失败，加载资源的元素会触发一个 Event 接口的 error 事件，并执行该元素上的 onerror() 处理函数。这些 error 事件不会向上冒泡到 window，不过能被单一的 window.addEventListener 捕获。

由于网络请求异常不会事件冒泡，因此必须在捕获阶段将其捕捉到才行，但是这种方式虽然 **可以捕捉到网络请求的异常**，但是无法判断 HTTP 的状态是 404 还是其他比如 500 等等，所以还需要配合服务端日志才进行排查分析才可以。window.addEventListener 在运行时错误和资源加载错误时返回的错误对象不同。

**缺点** : 无法判断 HTTP 的状态是 404 还是其他比如 500 等等，所以还需要配合服务端日志才进行排查分析才可以。

```html
<!DOCTYPE html>
<html lang="zh">
 
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>error</title>
  <script>
    window.addEventListener('error', (error) => {
      console.log('捕获到异常：', error);
    }, true)
  </script>
</head>
 
<body>
  <img src="https://itemcdn.zcycdn.com/15af41ec-e6cb-4478-8fad-1a47402f0f25.png">
</body>
 
</html>

```

::: tip 注意
- 不同浏览器下返回的 error 对象可能不同，需要注意兼容处理。
- 需要注意避免 addEventListener 重复监听。
:::

### 异步异常

Promise 异常：Promise 中的没有写 catch 的 Promise 中抛出的异常不能被 `try-catch` 和 `window.onerror` 捕获，这时候我们就需要监听 `unhandledrejection` 来帮我们捕获这部分错误。所以务必要在 Promise 中不要忘记写 catch 处理抛出的异常。为了防止有漏掉的 Promise 异常，建议在全局增加一个对 unhandledrejection 的监听，用来全局监听 `Uncaught Promise Error` 。

```js
window.addEventListener("unhandledrejection", function (e) {
  e.preventDefault();
  console.log("捕获到 promise 错误了");
  console.log("错误的原因是", e.reason);
  console.log("Promise 对象是", e.promise);
  return true;
});

Promise.reject("promise error");
new Promise((resolve, reject) => {
  reject("promise error");
});
new Promise((resolve) => {
  resolve();
}).then(() => {
  throw "promise error";
});

```

### React 异常

React 处理异常的方式不同。虽然 `try-catch` 适用于许多非普通 JavaScript 应用程序，但它 **只适用于命令式代码**。因为 React 组件是声明性的，所以 `try-catch` 不是一个可靠的选项。为了弥补这一点，React 实现了所谓的 **错误边界(error boundaries)**。错误边界是 React 组件，**它捕获子组件树中的任何地方的 JavaScript 错误，同时还记录错误并显示回退用户界面**。

**缺点**: 错误边界无法捕获以下异常：

- 事件处理器
- 异步代码
- 服务端的渲染代码
- 在错误边界区域内的错误

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // 展示出错的UI
    this.setState({ hasError: true });
    // 将错误信息上报到日志服务器
    logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // 可以展示自定义的错误样式
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

```

使用错误边界处理组件：

```xml
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary
```

### Vue 异常

errorHandler 获组件生命周期钩子里的错误，从 2.4.0 起这个钩子也会捕获 Vue 自定义事件处理函数内部的错误。

```js
Vue.config.errorHandler = (err, vm, info) => {
  console.error("通过vue errorHandler捕获的错误");
  console.error(err);
  console.error(vm);
  console.error(info);
};
```

生命周期钩子里的错误是可以被 errorHandler 捕获到，但是比如当我们主动点击 div 触发 clickerror 时，会发现这时错误并没有被 errorHandler 捕获到，控制台输出的是 `Uncaught Error`，也就是没有被捕获到的错误，所以需要注意的是，errorHandler 方法 **目前还捕获不到绑定监听事件触发的异常，但是可以捕获到在生命周期钩子中调用的方法的错误**。可以使用 `winbdow.onerror` 但在 MVVM 框架中使用 onerror 监听全局异常会发现并不能捕获到绑定事件的详细错误信息，只会输出 `Script Error`，这时我们可以尝试进入 webpack 配置，设置 `devtool:"source-map"`,这时在控制台再次打印可以看见成功捕获到绑定事件的错误。

### 请求异常

重写 XMLHttpRequest 对象的方法 或 以最常用的 HTTP 请求库 axios 为例，使用 axios 的拦截器统一处理的异常。

### 总结

- 可疑区域增加 try-catch 主动捕获异常
- 全局监控 JS 异常 window.onerror
- 全局监控静态资源异常 window.addEventListener
- 捕获没有 catch 的 Promise 异常用 unhandledrejection 主动捕获异常
- Vue errorHandler 和 React componentDidCatch 等 MVVM 框架的异常处理 API
- Axios 请求统一异常处理用拦截器 interceptors
- 使用日志监控服务收集用户错误信息


::: warning 参考文献
[前端异常的捕获与处理](https://juejin.cn/post/6932620551827488775#heading-9)

[前端监控知识点](https://github.com/rico-c/Front-End-Monitoring/blob/master/BasicKnowledge.md)
:::

