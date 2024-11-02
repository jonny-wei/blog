# Metro Bundler

Metro 是专为 React Native 开发提供的 Javascript 捆包器 (bundler) ，可以理解为打包器。它为 React Native 提供开发服务和打包功能，开箱即用。

初始化 React Native 项目后，可以在 `node_modules` 里找到 `metro-*` 相关的依赖包。虽然作为内置依赖项，但是它是可以独立 CLI 或编程方式运行。独立的编程方式利于三方框架执行 React Native 的集成打包，例如跨端框架： Taro

Metro 打包进程中有以下三个独立的阶段：

- 解析 (Resolution) ：从入口文件开始，构建模块依赖图，解析各个模块的文件路径；
- 转换 (Transformation) ：可并行的处理模块文件转义；
- 序列化 (Serialization) ：生成一个或多个 bundle 包。

Metro 有个到目前为止仍然 Open 的一个 symlinks 问题，即 Metro 不能支持项目根目录之外的符号链接依赖项。

## 打包流程

Metro 的打包过程有三个阶段：

- Resolution (解析)
- Transformation (转换)
- Serialization (序列化)

![metro1](/blog/images/mobile/metro1.png)

### Resolution 解析

在解析阶段，Metro 从入口文件开始，寻找依赖模块的文件路径，构建一张所有模块的图。这个过程涉及到 Node 模块解析的一个版本，它会确定哪些文件是入口文件的依赖，以及这些依赖之间的关系。

具体顶层执行位置在 IncrementalBundler.js 文件的 `buildGraph()` 方法，该函数有两个返回值：`prepend` 和 `graph`。

- `prepend` 包含了一些垫片（Polyfill）文件路径组成的数组，这些垫片代码会在最终的代码合并后位于 jsbundle 的顶部，并在加载 jsbundle 时预先执行。
- `graph` 则是一个包含了所有模块详细信息的数据结构，包括模块的路径、依赖关系等

#### prepend

prepend 的值为一些垫片 (Polyfill)文件路径组成的数组，在最终的代码合并之后，垫片代码会处于 jsbundle 的顶部，在加载 jsbundle 时，预先执行：

```js
[
  {
    dependencies: Map(0) {},
    getSource: [Function: getSource],
    inverseDependencies: CountingSet {},
    path: '__prelude__',
    output: [ [Object], [Object] ]
  },
  {
    inverseDependencies: CountingSet {},
    path: '/Users/lumin/Desktop/AwesomeTSProject/node_modules/metro-runtime/src/polyfills/require.js',
    dependencies: Map(0) {},
    getSource: [Function: getSource],
    output: [ [Object] ]
  },
  {
    inverseDependencies: CountingSet {},
    path: '/Users/lumin/Desktop/AwesomeTSProject/node_modules/@react-native/polyfills/console.js',
    dependencies: Map(0) {},
    getSource: [Function: getSource],
    output: [ [Object] ]
  },
  {
    inverseDependencies: CountingSet {},
    path: '/Users/lumin/Desktop/AwesomeTSProject/node_modules/@react-native/polyfills/error-guard.js',
    dependencies: Map(0) {},
    getSource: [Function: getSource],
    output: [ [Object] ]
  },
  {
    inverseDependencies: CountingSet {},
    path: '/Users/lumin/Desktop/AwesomeTSProject/node_modules/@react-native/polyfills/Object.es8.js',
    dependencies: Map(0) {},
    getSource: [Function: getSource],
    output: [ [Object] ]
  }
]
```

#### graph

entryPoints 是应用的入口文件路径，而 dependencies 是由模块文件绝对路径为 key 组成的所有模块 map 结构。

```js
{
  entryPoints: Set(1) { '/Users/lumin/Desktop/AwesomeTSProject/index.js' },
  transformOptions: {
    customTransformOptions: [Object: null prototype] {},
    dev: false,
    hot: false,
    minify: true,
    platform: 'android',
    runtimeBytecodeVersion: null,
    type: 'module',
    unstable_transformProfile: undefined
  },
  dependencies: Map(388) {
    '/Users/lumin/Desktop/AwesomeTSProject/index.js' => {
      inverseDependencies: CountingSet {},
      path: '/Users/lumin/Desktop/AwesomeTSProject/index.js',
      dependencies: Map(4) {
        'XEo4Z+Aarw9Y7I7ZLBt66vGLAVQ=' => [Object],
        '7kvm5yrOpz4NYiDi6sn4qxa8DVQ=' => [Object],
        'THJ70LbOuESuoZ1vCvaV/6cOUg0=' => [Object],
        '1udmcfu0G1JlZthWUoMNlgdDqG0=' => [Object]
      },
      getSource: [Function: getSource],
      output: [Array]
    },
    ...,
    '/Users/lumin/Desktop/AwesomeTSProject/App.tsx' => {
      inverseDependencies: CountingSet {},
      path: '/Users/lumin/Desktop/AwesomeTSProject/App.tsx',
      dependencies: [Map],
      getSource: [Function: getSource],
      output: [Array]
    },
    ...,
    '/Users/lumin/Desktop/AwesomeTSProject/app.json' => {
      inverseDependencies: CountingSet {},
      path: '/Users/lumin/Desktop/AwesomeTSProject/app.json',
      dependencies: Map(0) {},
      getSource: [Function: getSource],
      output: [Array]
    }
  },
  importBundleNames: Set(0) {},
  privateState: {
    resolvedContexts: Map(0) {},
    gc: {
      color: [Map],
      possibleCycleRoots: Set(0) {},
      importBundleRefs: Map(0) {}
    }
  }
}
```

举个模块依赖图构成的例子：

```js
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

// 解析后：
{
  inverseDependencies: CountingSet {},
  path: '/Users/lumin/Desktop/AwesomeTSProject/index.js',
  dependencies: Map(4) {
    'XEo4Z+Aarw9Y7I7ZLBt66vGLAVQ=' => {
      absolutePath: '/Users/lumin/Desktop/AwesomeTSProject/node_modules/react-native/index.js',
      data: [Object]
    },
    '7kvm5yrOpz4NYiDi6sn4qxa8DVQ=' => {
      absolutePath: '/Users/lumin/Desktop/AwesomeTSProject/node_modules/@babel/runtime/helpers/interopRequireDefault.js',
      data: [Object]
    },
    'THJ70LbOuESuoZ1vCvaV/6cOUg0=' => {
      absolutePath: '/Users/lumin/Desktop/AwesomeTSProject/App.tsx',
      data: [Object]
    },
    '1udmcfu0G1JlZthWUoMNlgdDqG0=' => {
      absolutePath: '/Users/lumin/Desktop/AwesomeTSProject/app.json',
      data: [Object]
    }
  },
  getSource: [Function: getSource],
  output: [ { data: [Object], type: 'js/module' } ]
}
```

你可以使用 `react-native-bundle-visualizer` 来分析你的模块依赖。通过它你可以很方便的看到那些占用体积较大的模块，并优化它们。该工具原理是通过 `react-native bundle` 命令打包，在系统临时目录生成 jsbundle 及对应的 source map 文件，通过分析 source map 输出可视化的依赖 html 报告。因此，需要提前确认 `react-native bundle` 命令能够正确的打出 jsbundle 包。

### Transformation (转换)

转换阶段是 Metro 使用 Babel 作为转义工具，将文件转换成目标平台能够理解的代码。这一阶段涉及到代码的转译，例如将 JSX 转换成 JavaScript，或者将 ES6+ 的代码转换成目标平台支持的 ES5 代码。Metro 提供了预设 `metro-react-native-babel-preset`，该预设包含了一些默认插件，用于处理 React Native 应用中的代码转换。

Metro 使用 Babel 作为转义工具，如果你使用 react-native init 初始化项目的话，可以在项目根目录看到 babel.config.js 配置文件，内容如下：

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
};
```

Metro 提供了预设 metro-react-native-babel-preset，该预设是 Metro 项目的一个子包。其内置的一些默认插件：

- `@babel/plugin-syntax-flow`：用于支持 Facebook 自家的 Flow 静态类型文件 (.flow.js) 。 Flow 和 Typescript 类似，却并未推广开；
- `@babel/plugin-transform-block-scoping`：支持作用块 (let) ；
- `@babel/plugin-transform-typescript`：支持 typescript 的转义；
- `@babel/plugin-transform-arrow-functions`：对箭头函数的支持；
- `@babel/plugin-syntax-dynamic-import`：模块的异步加载支持；

预设提供了实验性设置选项 `unstable_transformProfile` 。如果 `unstable_transformProfile` 的值为 `hermes-stable` 或 `hermes-canary` 其中之一，并且项目中采用 Hermes 作为 Javascript 引擎，那么一些插件会被忽略。

在 React Native 0.70 之后， Hermes 作为默认内置引擎，实现了很多标准，这带来了些许好处：

- 无需 Babel 额外的转义代码，最终打包的 jsbundle 体积变小；
- 由于原生语法支持，对这些语法代码执行性能得到一定的提升。

#### 多个 Worker 的并行转换

Metro 使用了多个 Worker 并行转换，每个 Worker 负责转换一个模块，并将转换后的代码发送给主进程。这样可以提高转换的效率，因为多个 Worker 可以同时进行转换，而主进程只需要等待所有 Worker 完成转换后，再将转换后的代码合并成一个 jsbundle 文件。

Worker 的执行入口文件为：`Worker.flow.js`，并暴露的执行的函数为 `transform(…)`。通过 `maxworkers` 选项，可以指定多少个 worker 一起并行执行模块转换工作。不过通常不需要进行设置，默认配置会根据 cpu 核数来进行合理配置。

metro-transform-worker 做模块转换前，Metro 会通过 metro-transform-worker 子包来指定对应模块类型的转换器，它暴露一个 transform 方法。

```js
module.exports = {
  transform: async (
    config: JsTransformerConfig,
    projectRoot: string,
    filename: string,
    data: Buffer,
    options: JsTransformOptions,
  ): Promise<TransformResponse>{
    ...
  }
}
```

Metro 提供了 transformerpath 选项允许让开发者替换 metro-transform-worker 。如果需要做模块转义的完全的开发，该配置项将必不可少。不过，一旦你选择自定义，则官方提供的 transformer 选项都将失效。那么是否可以自定义转换呢？可以的，在 tranformer 选项中提供了 babelTransformerPath 配置，你可以指定一个实现 transform 接口函数的模块绝对路径。

```js
module.exports.transform = ({ filename, options, plugins, src }) => {
  // transform file...
  return { ast: AST };
}
```

Metro 会指定其子包 `metro-react-native-babel-transformer` 解析后的绝对路径作为 `babelTransformerpath` 的默认值。

目前 Metro 有三种模块类型的转换器：

- JS 文件转换器
- JSON 文件转换器
- 资源文件转换器

其中，JS 文件转换器 是对外部开放的，也就是 `babelTransformerPath` 选项配置。

`metro-react-native-babel-transformer` 作为 JS 模块的默认转换器，来执行真正转换任务。可以看到其暴露了两个函数：

```js
...
module.exports = {
  transform, // 执行转换任务，该函数接收一个对象参数，包含了模块的路径、内容、转换配置等
  getCacheKey, // 作为配置缓存函数
};
```

### Serialization (序列化)

序列化阶段是将转换后的模块按照一定顺序组合到单个或者多个 jsbundle 文件中。在这个阶段，Metro 会处理模块整合，将每个模块代码使用类 AMD 模块化的方式组织起来，并最终生成一个完整的打包文件 bundle.js。序列化阶段的核心代码是 `baseJSBundle` 和 `bundleToString`，它们负责将模块代码和垫片代码合并，并生成最终的代码字符串。

### 缓存

Metro 为构建提供了缓存 (cache) 功能。在上面我们提到过通过设置 cacheStores 可以设置多个缓存存储位置，它的缓存功能实现由子包 metro-cache 和 metro-cache-key 提供。

目前为止，metro-cache-key 还是只是个很简单的工具库。

metro-cache 为实现多层级缓存系统的一个子包，目前包括两种存储类型：FileStore 和 HttpStore 。

- FileStore：文件系统的持久化缓存；
- HttpStore：基于 Http 协议的网络存储缓存。目前没有提供鉴权相关的复杂实现，只需要提供一个简单的静态资源服务器。
Metro 开放了 cacheStores 配置项，那就说明你可以自定义一个缓存存储实现的 store。

## 拆包原理

Metro 打包工具，本身并没有拆包功能。它只能将 JavaScript 代码，打包成一个 Bundle 文件，而且 Metro 也不支持第三方插件，所以社区也没有第三方拆包插件。但当初，我们在阅读 Metro 源码的时候，发现了一个可配置的函数 customSerializer，从而找到了不入侵 Metro 源码，通过配置的方式给 Metro 写第三方插件的方法。有了 Metro 的 customSerializer 方法后，现在我们也可以给 Metro 来写插件了，通过插件来提供单独拆包能力。metro-code-split 就是我们为 Metro 写的拆包插件。下面我们就来分析下这个插件的原理和使用。

`metro-code-split` 是一个基于 Metro 打包器的拆包工具，它利用 JavaScript 的动态导入语法（如 `import()` 函数）来实现代码拆分。这个工具通过构建一个模块依赖图来识别哪些模块可以被独立打包，并且根据这些动态导入语句来确定包的边界。这样，应用就可以在运行时按需加载特定的代码模块，而不是在启动时加载整个应用的代码。

在应用运行时，`metro-code-split` 支持预加载和懒加载策略，允许应用预先加载可能很快会被需要的代码，或者仅在需要时加载代码。这种方式不仅减少了首屏加载的时间，也减少了首屏代码的下载量，从而提高了应用的执行速度。同时，`metro-code-split` 利用浏览器的缓存机制来存储已下载的包，这样用户在后续访问时可以更快地加载应用，因为许多代码可以直接从缓存中获取。

此外，`metro-code-split` 支持增量更新，这意味着只有自上次更新以来发生变化的代码会被下载和执行，而不是每次都下载完整的包。这不仅节省了用户的流量，也减少了加载时间。开发者可以通过配置 `metro-code-split` 的选项来控制拆包的行为，例如指定哪些模块应该被拆分，以及如何优化包的加载顺序和加载方式，从而实现更细粒度的代码拆分和加载，优化应用的加载时间和性能。

## 总结

Metro 作为构建工具可以看到常见的功能点：构建缓存、构建任务的并行执行、构建定制的配置化， Metro 分包实现这些功能也是一种不错的模块化编程实践。在构建缓存上，Metro 的多层级缓存是个不错的设计。虽然实用性有待考量，但缓存共享的概念令人耳目一新。不过，Metro 并不完全像现代构建工具那样 (例如：webpack) ，拥有完善且丰富的功能，比如缺少代码分割。

Metro 打包阶段的原理主要分为三个核心阶段：Resolution（解析）、Transformation（转换）和 Serialization（序列化）。以下是每个阶段的详细解释：

- Resolution（解析）
在解析阶段，Metro 从入口文件开始，寻找依赖模块的文件路径，构建一张所有模块的图。这个过程涉及到 Node 模块解析的一个版本，它会确定哪些文件是入口文件的依赖，以及这些依赖之间的关系。具体来说，这一阶段会返回两个重要的值：prepend 和 graph。prepend 包含了一些垫片（Polyfill）文件路径组成的数组，这些垫片代码会在最终的代码合并后位于 jsbundle 的顶部，并在加载 jsbundle 时预先执行。而 graph 则是一个包含了所有模块详细信息的数据结构，包括模块的路径、依赖关系等。

- Transformation（转换）
转换阶段是 Metro 使用 Babel 作为转义工具，将文件转换成目标平台能够理解的代码。这一阶段涉及到代码的转译，例如将 JSX 转换成 JavaScript，或者将 ES6+ 的代码转换成目标平台支持的 ES5 代码。Metro 提供了预设 metro-react-native-babel-preset，该预设包含了一些默认插件，用于处理 React Native 应用中的代码转换。

- Serialization（序列化）
序列化阶段是将转换后的模块按照一定顺序组合到单个或者多个 jsbundle 文件中。在这个阶段，Metro 会处理模块整合，将每个模块代码使用类 AMD 模块化的方式组织起来，并最终生成一个完整的打包文件 bundle.js。序列化阶段的核心代码是 baseJSBundle 和 bundleToString，它们负责将模块代码和垫片代码合并，并生成最终的代码字符串。

这三个阶段共同完成了从源代码到打包文件的转换过程，使得 React Native 应用能够在目标平台上运行。Metro 作为一个强大的打包工具，提供了丰富的配置选项，允许开发者根据项目需求定制打包行为，从而优化应用的性能和构建效率
