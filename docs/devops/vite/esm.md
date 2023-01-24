# 模块化规范

## IIFE(立即执行函数)

相比于`命名空间`的模块化手段，`IIFE`实现的模块化安全性要更高，对于模块作用域的区分更加彻底。

```ts
// module-a.js
(function () {
  let data = "moduleA";

  function method() {
    console.log(data + "execute");
  }

  window.moduleA = {
    method: method,
  };
})();

// module-b.js
(function () {
  let data = "moduleB";

  function method() {
    console.log(data + "execute");
  }

  window.moduleB = {
    method: method,
  };
})();

// index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script src="./module-a.js"></script>
    <script src="./module-b.js"></script>
    <script>
      // 此时 window 上已经绑定了 moduleA 和 moduleB
      console.log(moduleA.data);
      moduleB.method();
    </script>
  </body>
</html>
```

每个`IIFE` 即`立即执行函数`都会创建一个私有的作用域，在私有作用域中的变量外界是无法访问的，只有模块内部的方法才能访问。拿上述的`module-a`来说，对于其中的 `data`变量，我们只能在模块内部的 `method` 函数中通过闭包访问，而在其它模块中无法直接访问。这就是模块`私有成员`功能，避免模块私有成员被其他模块非法篡改，相比于`命名空间`的实现方式更加安全。

但实际上，无论是`命名空间`还是`IIFE`，都是为了解决全局变量所带来的命名冲突及作用域不明确的问题，而并没有真正解决另外一个问题——**模块加载**。如果模块间存在依赖关系，那么 script 标签的加载顺序就需要受到严格的控制，一旦顺序不对，则很有可能产生运行时 Bug。

## CommonJS 规范

CommonJS 是业界最早正式提出的 JavaScript 模块规范，主要用于服务端，随着 Node.js 越来越普及，这个规范也被业界广泛应用。对于模块规范而言，一般会包含 2 方面内容:

- 统一的模块化代码规范
- 实现自动加载模块的加载器(也称`loader`)

使用 `require` 来导入一个模块，用 `module.exports` 来导出一个模块。实际上 Node.js 内部会有相应的 loader 转译模块代码，最后模块代码会被处理成下面这样:

```javascript
(function (exports, require, module, __filename, __dirname) {
  // 执行模块代码
  // 返回 exports 对象
});
```

对 CommonJS 而言，一方面它定义了一套完整的模块化代码规范，另一方面 Node.js 为之实现了自动加载模块的 loader，看上去是一个很不错的模块规范，但也存在一些问题:

1. 模块加载器由 Node.js 提供，依赖了 Node.js 本身的功能实现，比如文件系统，如果 CommonJS 模块直接放到浏览器中是无法执行的。当然, 业界也产生了 [browserify](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fbrowserify%2Fbrowserify) 这种打包工具来支持打包 CommonJS 模块，从而顺利在浏览器中执行，相当于社区实现了一个第三方的 loader。
2. CommonJS 本身约定以同步的方式进行模块加载，这种加载机制放在服务端是没问题的，一来模块都在本地，不需要进行网络 IO，二来只有服务启动时才会加载模块，而服务通常启动后会一直运行，所以对服务的性能并没有太大的影响。但如果这种加载机制放到浏览器端，会带来明显的性能问题。它会产生大量同步的模块请求，浏览器要等待响应返回后才能继续解析模块。也就是说，**模块请求会造成浏览器 JS 解析过程的阻塞**，导致页面加载速度缓慢。

CommonJS 是一个不太适合在浏览器中运行的模块规范。

## AMD 规范

`AMD`全称为`Asynchronous Module Definition`，即异步模块定义规范。模块根据这个规范，在浏览器环境中会被异步加载，而不会像 CommonJS 规范进行同步加载，也就不会产生同步请求导致的浏览器解析过程阻塞的问题了。

在 AMD 规范当中，我们可以通过 define 去定义或加载一个模块，比如上面的 `main` 模块和`print`模块，如果模块需要导出一些成员需要通过在定义模块的函数中 return 出去(参考 `print` 模块)，如果当前模块依赖了一些其它的模块则可以通过 define 的第一个参数来声明依赖(参考`main`模块)，这样模块的代码执行之前浏览器会先**加载依赖模块**。

过 require 与 define 的区别在于前者只能加载模块，而`不能定义一个模块`。由于没有得到浏览器的原生支持，AMD 规范需要由第三方的 loader 来实现，最经典的就是 [requireJS](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Frequirejs%2Frequirejs) 库了，它完整实现了 AMD 规范，至今仍然有不少项目在使用。

不过 AMD 规范使用起来稍显复杂，代码阅读和书写都比较困难。因此，这个规范并不能成为前端模块化的终极解决方案，仅仅是社区中提出的一个妥协性的方案，关于新的模块化规范的探索，业界从仍未停止脚步。同期出现的规范当中也有 CMD 规范，这个规范是由淘宝出品的`SeaJS`实现的，解决的问题和 AMD 一样。不过随着社区的不断发展，SeaJS 已经被`requireJS`兼容了。

## UMD 规范

`UMD` (Universal Module Definition)规范，其实它并不算一个新的规范，只是兼容 AMD 和 CommonJS 的一个模块化方案，可以同时运行在浏览器和 Node.js 环境。顺便提一句，后面将要介绍的 ES Module 也具备这种跨平台的能力。

## ES Module

`ES6 Module` 也被称作 `ES Module`(或 `ESM`)， 是由 ECMAScript 官方提出的模块化规范，作为一个官方提出的规范，`ES Module` 已经得到了现代浏览器的内置支持。在现代浏览器中，如果在 HTML 中加入含有`type="module"`属性的 script 标签，那么浏览器会按照 ES Module 规范来进行依赖加载和模块解析，这也是 Vite 在开发阶段实现 no-bundle 的原因，由于模块加载的任务交给了浏览器，即使不打包也可以顺利运行模块代码。

大家可能会担心 ES Module 的兼容性问题，其实 ES Module 的浏览器兼容性如今已经相当好了，覆盖了 90% 以上的浏览器份额。不仅如此，一直以 CommonJS 作为模块标准的 Node.js 也紧跟 ES Module 的发展步伐，从 `12.20` 版本开始[正式支持](https://link.juejin.cn/?target=https%3A%2F%2Fnodejs.org%2Fapi%2Fesm.html%23modules-ecmascript-modules)原生 ES Module。也就是说，如今 ES Module 能够同时在浏览器与 Node.js 环境中执行，拥有天然的跨平台能力。

### ESM 高级特性

#### import map

在浏览器中我们可以使用包含type="module"属性的script标签来加载 ES 模块，而模块路径主要包含三种:

- 绝对路径，如 <https://cdn.skypack.dev/react>
- 相对路径，如 ./module-a
- bare import 即直接写一个第三方包名，如 react、lodash

对于前两种模块路径浏览器是原生支持的，而对于 bare import，在 Node.js 能直接执行，因为 Node.js 的路径解析算法会从项目的 node_modules 找到第三方包的模块路径，但是放在浏览器中无法直接执行。而这种写法在日常开发的过程又极为常见，除了将 bare import 手动替换为一个绝对路径，还有其它的解决方案吗？

现代浏览器内置的 import map 就是为了解决上述的问题，我们可以用一个简单的例子来使用这个特性:

```javascript
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="root"></div>
  <script type="importmap">
  {
    "imports": {
      "react": "https://cdn.skypack.dev/react"
    }
  }
  </script>

  <script type="module">
    import React from 'react';
    console.log(React)
  </script>
</body>

</html>
```

在支持 import map的浏览器中，在遇到type="importmap"的 script 标签时，浏览器会记录下第三方包的路径映射表，在遇到bare import时会根据这张表拉取远程的依赖代码。如上述的例子中，我们使用 skypack这个第三方的 ESM CDN 服务，通过<https://cdn.skypack.dev/react这个地址我们可以拿到> React 的 ESM 格式产物。

import map特性虽然简洁方便，但浏览器的兼容性却是个大问题。它只能兼容市面上 68% 左右的浏览器份额，而反观type="module"的兼容性(兼容 95% 以上的浏览器)，import map的兼容性实属不太乐观。但幸运的是，社区已经有了对应的 Polyfill 解决方案——[es-module-shims](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fguybedford%2Fes-module-shims)，完整地实现了包含 import map在内的各大 ESM 特性，还包括:

1. dynamic import。即动态导入，部分老版本的 Firefox 和 Edge 不支持。
2. import.meta和import.meta.url。当前模块的元信息，类似 Node.js 中的 __dirname、__filename。
3. modulepreload。以前我们会在 link 标签中加上 rel="preload" 来进行资源预加载，即在浏览器解析 HTML 之前就开始加载资源，现在对于 ESM 也有对应的modulepreload来支持这个行为。
4. JSON Modules和 CSS Modules，即通过如下方式来引入json或者css

值得一提的是，es-module-shims 基于 wasm 实现，性能并不差，相比浏览器原生的行为没有明显的性能下降。

#### Nodejs 包导入导出策略

在 Node.js 中(>=12.20 版本)有一般如下几种方式可以使用原生 ES Module:

- 文件以 .mjs 结尾；
- package.json 中声明type: "module"。

那么，Nodejs 在处理 ES Module 导入导出的时候，如果是处理 npm 包级别的情况，其中的细节可能比你想象中更加复杂：

main和 exports属性。这两个属性均来自于package.json，并且根据 Node 官方的 resolve 算法([查看详情](https://link.juejin.cn/?target=http%3A%2F%2Fnodejs.cn%2Fapi%2Fesm.html%23resolver-algorithm-specification))，exports 的优先级比 main 更高，也就是说如果你同时设置了这两个属性，那么 exports会优先生效。需要重点梳理的是exports属性，它包含了多种导出形式: 默认导出、子路径导出和条件导出，这些导出形式如以下的代码所示:

```javascript
// package.json
{
  "name": "package-a",
  "type": "module",
  "exports": {
    // 默认导出，使用方式: import a from 'package-a'
    ".": "./dist/index.js",
    // 子路径导出，使用方式: import d from 'package-a/dist'
    "./dist": "./dist/index.js",
    "./dist/*": "./dist/*", // 这里可以使用 `*` 导出目录下所有的文件
    // 条件导出，区分 ESM 和 CommonJS 引入的情况
    "./main": {
      "import": "./main.js",
      "require": "./main.cjs"
    },
  }
}
```

条件导出可以包括如下常见的属性:

- node: 在 Node.js 环境下适用，可以定义为嵌套条件导出
- import: 用于 import 方式导入的情况，如import("package-a");
- require: 用于 require 方式导入的情况，如require("package-a");
- default，兜底方案，如果前面的条件都没命中，则使用 default 导出的路径。

当然，条件导出还包含 types、browser、develoment、production 等属性，大家可以参考 Node.js 的[详情文档](https://link.juejin.cn/?target=https%3A%2F%2Fnodejs.org%2Fapi%2Fpackages.html%23conditional-exports)，这里就不一一赘述了。

## Pure ESM

指的是一个是让 npm 包都提供 ESM 格式的产物，另一个是仅留下 ESM 产物，抛弃 CommonJS 等其它格式产物。

Node.js 执行以上的原生 ESM 代码并没有问题，但反过来，如果你想在 CommonJS 中 require 一个 ES 模块，就行不通了。根本原因在于 require 是同步加载的，而 ES 模块本身具有异步加载的特性，因此两者天然互斥，即我们无法 require 一个 ES 模块。那是不是在 CommonJS 中无法引入 ES 模块了呢? 也不尽然，我们可以通过 dynamic import来引入。

为了引入一个 ES 模块，我们必须要将原来同步的执行环境改为异步的，这就带来如下的几个问题:

1. 如果执行环境不支持异步，CommonJS 将无法导入 ES 模块；
2. jest 中不支持导入 ES 模块，测试会比较困难；
3. 在 tsc 中，对于 await import()语法会强制编译成 require的语法([详情](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fmicrosoft%2FTypeScript%2Fissues%2F43329))，只能靠eval('await import()')绕过去。

## 新一代的基础库打包器

`tsup` 是一个基于 Esbuild 的基础库打包器，主打无配置(no config)打包。借助它我们可以轻易地打出 ESM 和 CommonJS 双格式的产物，并且可以任意使用与模块格式强相关的一些全局变量或者 API。`tsup` 在解决了双格式产物问题的同时，本身利用 Esbuild 进行打包，性能非常强悍，也能生成类型文件，同时也弥补了 Esbuild 没有类型系统的缺点
