# Tree Shaking

Tree Shaking 它能充分优化产物代码，使用频率颇高，并且底层实现逻辑比较复杂，需要持续读取、修改 ModuleGraph 对象的状态；需要通过 Template.apply 函数定制打包结果，等等，实现逻辑几乎贯穿了 Webpack 整个构建过程。

## 定义

是一种基于 ES Module 规范的 Dead Code Elimination 技术，它会在运行过程中静态分析模块之间的导入导出，确定 ESM 模块中哪些导出值未曾其他模块使用，并将其删除，以此实现打包产物的优化。

Dead Code 一般具有以下几个特征

- 代码不会被执行，不可到达

- 代码执行的结果不会被用到

- 代码只会影响死变量（只写不读）

## 条件

在 Webpack 中，启动 Tree Shaking 功能必须同时满足三个条件：

- 使用 ESM 规范编写模块代码；
- 配置 `optimization.usedExports` 为 true，启动标记功能；
- 启动代码优化功能，可以通过如下方式实现：

  - 配置 `mode = production`
  - 配置 `optimization.minimize = true`
  - 提供 `optimization.minimizer` 数组

## 原理

Webpack 中，Tree-shaking 的实现，一是需要先 「**标记**」 出模块导出值中哪些没有被用过；二是使用代码压缩插件 —— 如 [Terser](https://www.npmjs.com/package/terser-webpack-plugin) 删掉这些没被用到的导出变量。标记的效果就是删除那些没有被其它模块使用的“**导出语句**”，真正执行“**Shaking**”操作的是 Terser 插件。

::: tip 注意
标记功能需要配置 `optimization.usedExports = true` 开启
:::

Tree-Shaking 的实现大致上可以分为三个步骤：

- 「**构建**」阶段，「**收集**」 模块导出变量并记录到模块依赖关系图 ModuleGraph 对象中；
- 「**封装**」阶段，遍历所有模块，「**标记**」 模块导出变量有没有被使用；
- 使用代码优化插件 —— 如 Terser，删除无效导出代码。

### 第一步：构建阶段收集导出列表

首先，Webpack 需要弄清楚每个模块分别有什么导出值，收集各个模块的导出列表，这一过程发生在 「构建」 阶段，大体流程：

1. 将模块的所有 ESM 导出语句转换为 Dependency 对象，并记录到 `module` 对象的 `dependencies` 集合，转换规则：
   - 具名导出转换为 `HarmonyExportSpecifierDependency` 对象；
   - `default` 导出转换为 `HarmonyExportExpressionDependency` 对象。
2. 所有模块都编译完毕后，触发 [compilation.hooks.finishModules](https://webpack.js.org/api/compilation-hooks/#finishmodules) 钩子，开始执行 [FlagDependencyExportsPlugin](https://github1s.com/webpack/webpack/blob/HEAD/lib/FlagDependencyExportsPlugin.js) 插件回调；
3. `FlagDependencyExportsPlugin` 插件 [遍历](https://github1s.com/webpack/webpack/blob/HEAD/lib/FlagDependencyExportsPlugin.js#L51-L53) 所有 `module` 对象；
4. [遍历](https://github1s.com/webpack/webpack/blob/HEAD/lib/FlagDependencyExportsPlugin.js#L331-L333) `module` 对象的 `dependencies` 数组，找到所有 `HarmonyExportXXXDependency` 类型的依赖对象，将其转换为 `ExportInfo` 对象并记录到 ModuleGraph 对象中。

经过 `FlagDependencyExportsPlugin` 插件处理后，所有 ESM 风格的模块导出信息都会记录到 ModuleGraph 体系内，后续操作就可以从 ModuleGraph 中直接读取出模块的导出值。

### 第二步：封装阶段标记未使用模块

接下来，Webpack 需要再次遍历所有模块，逐一 「**标记**」 出模块导出列表中，哪些导出值有被其它模块用到，哪些没有，这个过程主要发生在 `FlagDependencyUsagePlugin` 插件中，主流程：

1. [触发](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L2804-L2806) `compilation.hooks.optimizeDependencies` 钩子，执行 `FlagDependencyUsagePlugin` 插件 [回调](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FFlagDependencyUsagePlugin.js%23L41-L42)；
2. 在 `FlagDependencyUsagePlugin` 插件中，[遍历](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FFlagDependencyUsagePlugin.js%23L288-L289) `modules` 数组；
3. 遍历每一个 `module` 对象的 `exportInfo` 数组；
4. 为每一个 `exportInfo` 对象执行 [compilation.getDependencyReferencedExports](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FCompilation.js%23L3737-L3738) 方法，确定其对应的 `dependency` 对象有否被其它模块使用；
5. 被任意模块使用到的导出值，调用 [exportInfo.setUsedConditionally](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fwebpack%2Fwebpack%2Fblob%2FHEAD%2Flib%2FExportsInfo.js%23L954-L955) 方法将其标记为已被使用；
6. `exportInfo.setUsedConditionally` 内部修改 `exportInfo._usedInRuntime` 属性，记录该导出被如何使用。

执行完毕后，Webpack 会将所有导出语句的使用状况记录到 `exportInfo._usedInRuntime` 字典中。

### 第三步：优化阶段删除无效导出代码

经过前面的收集与标记步骤后，Webpack 已经在 ModuleGraph 体系中清楚地记录了每个模块都导出了哪些值，每个导出值又被哪些模块所使用。接下来，Webpack 会根据导出值的使用情况生成不同的代码，具体逻辑由导出语句对应的 `HarmonyExportXXXDependency` 类实现，大体流程：

1. 在 `compilation.seal` 函数中，完成 ChunkGraph 后，开始调用 `compilation.codeGeneration` 函数生成最终代码；
2. `compilation.codeGeneration` 中会逐一遍历模块的 `dependencies` ，并调用 `HarmonyExportXXXDependency.Template.apply` 方法生成导出语句代码；
3. 在 `apply` 方法内，读取 ModuleGraph 中存储的 `exportsInfo` 信息，判断哪些导出值被使用，哪些未被使用；
4. 对已经被使用及未被使用的导出值，分别创建对应的 `HarmonyExportInitFragment` 对象，保存到 `initFragments` 数组；
5. 遍历 `initFragments` 数组，生成最终结果。

在此之后，将由 Terser、UglifyJS 等 DCE 工具“摇”掉这部分无效代码，构成完整的 Tree Shaking 操作。

综上所述，Webpack 中 Tree Shaking 的实现分为如下步骤：

- 在 `FlagDependencyExportsPlugin` 插件中根据模块的 `dependencies` 列表收集模块导出值，并记录到 ModuleGraph 体系的 `exportsInfo` 中；
- 在 `FlagDependencyUsagePlugin` 插件中收集模块的导出值的使用情况，并记录到 `exportInfo._usedInRuntime` 集合中；
- 在 `HarmonyExportXXXDependency.Template.apply` 方法中根据导出值的使用情况生成不同的导出语句；
- 使用 DCE 工具删除 Dead Code，实现完整的树摇效果

## 实践

虽然 Webpack 自 2.x 开始就原生支持 Tree Shaking 功能，但受限于 JS 的动态特性与模块的复杂性，直至最新的 5.0 版本，依然**没有解决许多代码副作用带来的问题**，使得优化效果并不如 Tree Shaking 原本设想的那么完美，所以需要使用者有意识地优化代码结构，或使用一些补丁技术帮助 Webpack 更精确地检测无效代码，完成 Tree Shaking 操作。

现实是你的 tree-shaking 似乎没用，其实基本都是副作用惹的祸。其次，开发了几个组件，且没有副作用，tree-shaking 也没有用，那大概是因为 Babel。Babel 提供的部分功能特性会致使 Tree Shaking 功能失效，由于它的编译，一些我们原本看似没有副作用的代码，便转化为了(可能)有副作用的。例如 Babel 可以将 `import/export` 风格的 ESM 语句等价转译为 CommonJS 风格的模块化语句，但该功能却导致 Webpack 无法对转译后的模块导入导出内容做静态分析。

**副作用**：它大致可以理解成，一个函数会、或者可能会对函数外部变量产生影响的行为。举个例子：

```js
var V8Engine = (function () {
  function V8Engine () {}
  V8Engine.prototype.toString = function () { return 'V8' }
  return V8Engine
}())
var V6Engine = (function () {
  function V6Engine () {}
  V6Engine.prototype = V8Engine.prototype // <---- side effect
  V6Engine.prototype.toString = function () { return 'V6' }
  return V6Engine
}())
console.log(new V8Engine().toString())
```

变量赋值就是有可能产生副作用的！V6Engine 虽然没有被使用，但是它修改了 V8Engine 原型链上的属性，这就产生副作用了。

### 始终使用 ESM

Tree-Shaking 强依赖于 ESM 模块化方案的静态分析能力，所以应尽量坚持使用 ESM 编写模块代码。对比而言，在过往的 CommonJS、AMD、CMD 旧版本模块化方案中，导入导出行为是高度动态，难以预测。而 ESM 方案则从规范层面规避这一行为，它要求所有的导入导出语句只能出现在模块顶层，且导入导出的模块名必须为字符串常量。所以，ESM 下模块之间的依赖关系是高度确定的，与运行状态无关，编译工具只需要对 ESM 模块做静态分析，就可以从代码字面量中推断出哪些模块值未曾被其它模块使用，这是实现 Tree Shaking 技术的必要条件。

### 避免无意义的赋值

使用 Webpack 时，需要有意识规避一些不必要的赋值操作

![tree-shaking1](/blog/images/devops/tree-shaking1.png)

示例中，`index.js` 模块引用了 `bar.js` 模块的 `foo` 并赋值给 `f` 变量，但后续并没有继续用到 `foo` 或 `f` 变量，这种场景下， `bar.js` 模块导出的 `foo` 值实际上并没有被使用，理应被删除，但 Webpack 的 Tree Shaking 操作并没有生效，产物中依然保留 `foo` 导出：

![tree-shaking2](/blog/images/devops/tree-shaking2.png)

造成这一结果，浅层原因是 Webpack 的 Tree Shaking 逻辑停留在代码静态分析层面，只是浅显地判断：

- 模块导出变量是否被其它模块引用；
- 引用模块的主体代码中有没有出现这个变量。

没有进一步，从语义上分析模块导出值是不是真的被有效使用。

更深层次的原因则是 JavaScript 的赋值语句并不纯，具体场景下有可能产生意料之外的副作用，例如：

```js
import { bar, foo } from "./bar";

let count = 0;
const mock = {}

Object.defineProperty(mock, 'f', {
    set(v) {
        mock._f = v;
        count += 1;
    }
})

mock.f = foo;
console.log(count);
```

示例中，对 `mock` 对象施加的 `Object.defineProperty` 调用，导致 `mock.f = foo` 赋值语句对 `count` 变量产生了副作用，这种场景下即使用复杂的动态语义分析，也很难在确保正确副作用的前提下，完美地 Shaking 掉所有无用的代码枝叶。

因此，在使用 Webpack 时开发者需要有意识地规避这些无意义的重复赋值操作。

### 尽量不写带有副作用的代码

Tree Shaking 并不能消除所有未使用的代码，Tree Shaking 并不能自动判断哪些脚本是副作用，因此手动指定它们非常重要。

你需要明确知道你的代码是否有副作用，通过这句话判定：关于副作用的定义是，在导入时会执行特殊行为的代码（修改全局对象、立即执行的代码等），而不是仅仅暴露一个 export 或多个 export。举例说明，例如 polyfill，它影响全局作用域，并且通常不提供 export。

- 立即执行函数 IIFE
- 函数里又使用了外部变量

UglifyJS 不能消除未引用的类，uglify 不进行程序流分析，所以不能排除有可能有副作用的代码

函数的参数若是引用类型，对于它属性的操作，都是有可能会产生副作用的。因为首先它是引用类型，对它属性的任何修改其实都是改变了函数外部的数据。其次获取或修改它的属性，会触发 `getter` 或者 `setter` ，而`getter`、`setter`是不透明的，有可能会产生副作用。uglify 没有完善的程序流分析。它可以简单的判断变量后续是否被引用、修改，但是不能判断一个变量完整的修改过程，不知道它是否已经指向了外部变量，所以很多有可能会产生副作用的代码，都只能保守的不删除。rollup 有程序流分析的功能，可以更好的判断代码是否真正会产生副作用。

所以，如果是开发 JavaScript 库，请使用 rollup。并且提供 ES6 module 的版本，入口文件地址设置到package.json的module字段

### 手动标记副作用

#### 使用 `#pure` 标注纯函数调用

与赋值语句类似，JavaScript 中的函数调用语句也可能产生副作用，因此默认情况下 Webpack 并不会对函数调用做 Tree Shaking 操作。不过，开发者可以在调用语句前添加 `/*#__PURE__*/` 备注，将函数调用标记为无副作用，明确告诉 Webpack 该次函数调用并不会对上下文环境产生副作用，例如：

![tree-shaking3](/blog/images/devops/tree-shaking3.png)

示例中，`foo('be retained')` 调用没有带上 `/*#__PURE__*/` 备注，代码被保留；作为对比，`foo('be removed')` 带上 Pure 声明后则被 Tree Shaking 删除。

#### 使用 sideEffects 标记

要将某些文件标记为副作用，我们需要将它们添加到 `package.json` 文件中。它类似于 `/*#**PURE***/` 但是作用于模块的层面，而不是代码语句的层面。它表示的意思是(指"sideEffects" 属性)：“如果被标记为无副作用的模块没有被直接导出使用，打包工具会跳过进行模块的副作用分析评估。”。

例如，一个副作用是：有一些代码，是在 import 时执行了一些行为，这些行为不一定和任何导出相关。例如 polyfill ，Polyfills 通常是在项目中全局引用，而不是在 index.js 中使用导入的方式引用。

```js
{
    ...,
    "sideEffects": [
        "./src/polyfill.js"
    ],
    ...,
}
```

sideEffects 和 usedExports（更多被认为是 tree shaking）是两种不同的优化方式。

sideEffects 更为有效 是因为它允许跳过整个模块/文件和整个文件子树。

usedExports 依赖于 terser 去检测语句中的副作用。它是一个 JavaScript 任务而且没有像 sideEffects 一样简单直接。而且它不能跳转子树/依赖由于细则中说副作用需要被评估。尽管导出函数能运作如常，但 React 框架的高阶函数（HOC）在这种情况下是会出问题的。

### 禁止 Babel 转译模块导入导出语句

Babel 提供的部分功能特性会致使 Tree Shaking 功能失效，例如 Babel 可以将 `import/export` 风格的 ESM 语句等价转译为 CommonJS 风格的模块化语句，但该功能却导致 Webpack 无法对转译后的模块导入导出内容做静态分析，示例：

![tree-shaking4](/blog/images/devops/tree-shaking4.png)

示例使用 `babel-loader` 处理 `*.js` 文件，并设置 Babel 配置项 `modules = 'commonjs'`，将模块化方案从 ESM 转译到 CommonJS，导致转译代码（右图上一）没有正确标记出未被使用的导出值 `foo`。作为对比，右图 2 为 `modules = false` 时打包的结果，此时 `foo` 变量被正确标记为 Dead Code。

所以，在 Webpack 中使用 `babel-loader` 时，建议将 `babel-preset-env` 的 `moduels` 配置项设置为 `false`，关闭模块导入导出语句的转译。

### 优化导出值的粒度

Tree Shaking 逻辑作用在 ESM 的 export 语句上，因此对于下面这种导出场景，即使实际上只用到 `default` 导出值的其中一个属性，整个 `default` 对象依然会被完整保留。所以实际开发中，应该尽量保持导出值颗粒度和原子性

```js
// 优化前
export default {
    bar: 'bar',
    foo: 'foo'
}

// 优化后
const bar = 'bar'
const foo = 'foo'

export {
    bar,
    foo
}
```

### 使用支持 Tree Shaking 的包

如果可以的话，应尽量使用支持 Tree Shaking 的 npm 包，例如：

- 使用 `lodash-es` 替代 `lodash` ，或者使用 `babel-plugin-lodash` 实现类似效果。

不过，并不是所有 npm 包都存在 Tree Shaking 的空间，诸如 React、Vue2 一类的框架，原本已经对生产版本做了足够极致的优化，此时业务代码需要整个代码包提供的完整功能，基本上不太需要进行 Tree Shaking。

### 在异步模块中使用 Tree-Shaking

Webpack5 之后，我们还可以用一种特殊的备注语法，实现异步模块的 Tree-Shaking 功能，例如：

```js
import(/* webpackExports: ["foo", "default"] */ "./foo").then((module) => {
  console.log(module.foo);
});
```

示例中，通过 `/* webpackExports: xxx */` 备注语句，显式声明即将消费异步模块的那些导出内容，Webpack 即可借此判断模块依赖，实现 Tree-Shaking。

综上，Tree-Shaking 是一种只对 ESM 有效的 Dead Code Elimination 技术，它能够自动删除无效（没有被使用，且没有副作用）的模块导出变量，优化产物体积。不过，受限于 JavaScript 语言灵活性所带来的高度动态特性，Tree-Shaking 并不能完美删除所有无效的模块导出，需要我们在业务代码中遵循若干最佳实践规则，帮助 Tree-Shaking 更好地运行。
