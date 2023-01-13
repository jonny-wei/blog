# Webpack 模块联邦

## 定义

**Webpack 模块联邦** 是 Webpack 5 新引入的一种远程模块动态加载、运行技术。允许运行时把当前构建的应用作为容器应用，异步加载远程模块。MF 允许我们将原本单个巨大应用按我们理想的方式拆分成多个体积更小、职责更内聚的小应用形式，理想情况下各个应用能够实现独立部署、独立开发(不同应用甚至允许使用不同技术栈)、团队自治，从而降低系统与团队协作的复杂度 —— 没错，这正是所谓的微前端架构。虽然国内讨论热度较低，但使用简单，功能强大，非常适用于微前端或代码重构迁移场景。

**模块联邦** 让 Webpack 达到了线上 Runtime 的效果，让代码直接在项目间利用 CDN 直接共享，不再需要本地安装 Npm 包、构建再发布了！我们知道 Webpack 可以通过 DLL 或者 Externals 做代码共享时 Common Chunk，但不同应用和项目间这个任务就变得困难了，我们几乎无法在项目之间做到按需热插拔。模块联邦是 Webpack5 新内置的一个重要功能，可以让跨应用间真正做到模块共享。 它支持直接将一个应用的包应用于另一个应用，同时具备整体应用一起打包的公共依赖抽取能力。

## 特性
- **模块化**：应用可按需导出若干模块，这些模块最终会被单独打成模块包，功能上有点像 NPM 模块
- **动态加载**：应用可在运行时基于 HTTP(S) 协议动态加载其它应用暴露的模块，且用法与动态加载普通 NPM 模块一样简单
- **微前端**：与其它微前端方案不同，MF 的应用之间关系平等，没有主应用/子应用之分，每个应用都能导出/导入任意模块

## 用法

1. 对于模块生成方，需要使用 `ModuleFederationPlugin` 插件的 `expose` 参数声明需要导出的模块列表，使用 `filename` 指定生成的入口文件
2. 对于模块使用方，需要使用 `ModuleFederationPlugin` 插件的 `remotes` 参数声明需要从哪些地方导入远程模块，代码中使用异步导入语法 `import("module")` 引入模块
3. 依赖共享问题。简单用上面的方式会出现依赖被重复打包，造成产物冗余的问题。为此 `ModuleFederationPlugin` 提供了 `shared` 配置用于声明该应用可被共享的依赖模块。注意：依赖共享对依赖的版本有一定要求，所以 MF 对共享模块做了版本化管理，可以通过 `shared.[lib].requiredVersion` 配置项显式声明应用需要的依赖库版本来解决。除此之外，我们还可以通过 `shared.[lib].shareScope` 属性更精细地控制依赖的共享范围。`shareScope` 在多团队协作时能够切分出多个资源共享空间，降低依赖冲突的概率。
```javascript
const { ModuleFederationPlugin } = require("webpack").container;

// app1负责模块导出（子应用）
module.exports = {
   plugins: [
    new ModuleFederationPlugin({
      // MF 应用名称
      name: "app1",
      // MF 模块入口，可以理解为该应用的资源清单
      filename: `remoteEntry.js`,
      // 定义应用导出哪些模块
      exposes: {
        "./utils": "./src/utils",
        "./foo": "./src/foo",
      },
      // 实际项目可以导入路由配置
      // exposes: {
      //   "./routes": "./src/routes",
      // },
      // 可被共享的依赖模块
+     shared: ['lodash']
    }),
  ],
}

// app1 编译产物
/**
1. main.js 为整个应用的编译结果，此处可忽略；
2. src_utils_js.js 与 src_foo_js.js 分别为 exposes 声明的模块的编译产物；
3. remoteEntry.js 是 ModuleFederationPlugin 插件生成的应用入口文件，
包含模块清单、MF 运行时代码。 
*/

// app2 负责模块导入（主应用）
module.exports = {
  plugins: [
    // 模块使用方也依然使用 ModuleFederationPlugin 插件搭建 MF 环境
    new ModuleFederationPlugin({
      // 使用 remotes 属性声明远程模块列表
      remotes: {
        // 地址需要指向导出方生成的应用入口文件
        RemoteApp: "app1@http://localhost:8081/dist/remoteEntry.js",
      },
      // 运行页面可以看到最终只加载了一次 lodash 产物
      shared: ['lodash']
    }),
  ],
}

// app1 模块在 app-2/src/main.js 中使用
(async () => {
  const { sayHello } = await import("RemoteApp/utils");
  sayHello();
})();
```

## MF与微前端

在微前端中：

- 加载微应用必须预定义接口方法（mounted、unmount 等）来实现微应用的动态挂载和卸载等功能，这意味着每个微应用必须手动实现这些接口方法；
- 在[《微前端（二）- 实现篇》](https://www.lumin.tech/blog/micro-frontends-2-implementation/)中，我们了解到微应用在独立开发模式下，通常也是手动调用接口方法，来动态加载视图；
- 如果我们想要共享某个微应用的模块给其它微应用使用，这并不是轻松地事。这意味着你需要把该模块独立出去，并以合理调用方式被其它微应用远程加载。
- 微应用的切换通常由路由状态改变来触发的。

在模块联合中：

- 上面我们了解了模块联合每个微应用可以是一个容器应用，所以他们之间可以相互依赖及加载；
- 每个应用允许暴露（exposes）多个接口，其它应用可以在动态远程加载该应用后，直接使用其接口。这解决了上面微前端提到的的模块共享问题；
- 在模块使用上非常灵活，当你引用一个远程模块时，可以像使用普通的 npm 包一样使用它，当然也允许懒加载模块；
- 远程模块和路由没有任何关联，加载的契机完全由 host 应用自己灵活决定。

## QA

### Q1. 什么是模块联邦？

Webpack5 模块联邦是一种允许运行时把当前构建的应用作为容器应用，异步加载远程模块的技术。模块联邦让 webpack 达到了线上 runtime 的效果，能够让代码在项目间利用 CDN 直接共享，不再需要本地安装 npm 包，构建再发布。模块联邦可以真正实现跨应用间模块共享，支持将一个应用的包应用于另一个应用，同时具备整体应用一起打包的公共依赖抽取能力。

### Q2. 模块联邦解决了什么问题，其意义是什么？

模块联邦的功能意义在于如何通过构建工具对应用进行模块划分、模块共享、模块加载。联邦模块主要是用来解决多个应用之间代码共享的问题，可以让我们的更加优雅的实现跨应用的代码共享

### Q3. 模块联邦的原理？

webpack每次打包都会将资源全部包裹在一个立即执行函数里面，这样虽然避免了全局环境的污染，但也使得外部不能访问内部模块。

在这个立即执行函数里面，webpack使用 **webpack_modules** 对象保存所有的模块代码，然后用内部定义的`__webpack_require__` 方法从 **webpack_modules** 中加载模块。并且在异步加载和文件拆分两种情况下向全局暴露一个 webpackChunk 数组用于沟通多个 webpack 资源，这个数组通过被webpack重写push方法，会在其他资源向 `webpackChunk` 数组中新增内容时同步添加到 **webpack_modules** 中从而实现模块整合。

联邦模块就是基于这个机制，修改了 **webpack_require** 的部分实现，在require的时候从远程加载资源，然后合并到`__webpack_modules__` 中。

`ModuleFederationPlugin` `主要做了三件事：

- 如何共享依赖：使用 **SharePlugin**
- 如何公开模块：使用 **ContainerPlugin**
- 如何引用模块：使用 **ContainerReferencePlugin**

ContainerPlugin：该插件为指定的公开模块创建 entry。entry.js 执行后会在 window 上挂一下对象，该对象有两个方法，get 和 init。get方法用来获取模块。init 方法用来初始化容器，它可以提供共享模块。在使用 Remote 的模块时候，通过 init 将自身 shared 写入 Remote 中，再通过 get 获取 Remote 中 expose 的组件，而作为 Remote 时，判断 Host 中是否有可用的共享依赖，若有，则加载 Host 的这部分依赖，若无，则加载自身依赖。

`ContainerReferencePlugin` ：该插件将特定的引用添加到作为外部资源（externals）的容器中，并允许从这些容器中导入远程模块。在导入时会调用容器使用者提供的 remote 进行重载。

![模块联邦原理图](/blog/images/optimization/webpack/模块联邦原理图.png)

模块联邦中模块的加载流程：

1. `__.f.consumes` 执行，对 `module federation` 插件配置的 `share` 相关包进行版本注册(通常是一些公共基础包，例如 react, react-dom 等)。配置 `share`，可以减少重复加载基础包。
2. 加载对应的 `remoteEntry.js` 文件，根据插件配置的全局变量，获取到 remoteEntry 暴露的数据。
3. 调用 remoteEntry 暴露的 `init` 方法，把主应用的公共基础包与 remoteEntry 基础包的版本进行对比，根据 x.y.z 版本号的方式，看双方版本是否适配。如果适配，加载同一份公共基础包，否则，各自加载。
4. 当应用中，有需要用到 `remoteEntry` 中的组件，则会调用这一步， `__.f.remotes`
5. `__.f.remotes` 加载对应远端组件, 调用 `remoteEntry` 暴露的 `get` 方法，根据组件名称，获取到对应的组件，挂载到 **webpack_modules** 变量下，后续会被 **webpack_require** 方法所使用。

### Q4. 模块联邦与微前端间有什么区别？

在微前端中：

- 加载微应用必须预定义接口方法（mounted、unmount 等）来实现微应用的动态挂载和卸载等功能，这意味着每个微应用必须手动实现这些接口方法；
- 微应用在独立开发模式下，通常也是手动调用接口方法，来动态加载视图；
- 如果我们想要共享某个微应用的模块给其它微应用使用，这并不是轻松地事。这意味着你需要把该模块独立出去，并以合理调用方式被其它微应用远程加载。
- 微应用的切换通常由路由状态改变来触发的。

在模块联合中：

- 模块联合每个微应用可以是一个容器应用，所以他们之间可以相互依赖及加载；
- 每个应用允许暴露（exposes）多个接口，其它应用可以在动态远程加载该应用后，直接使用其接口。这解决了上面微前端提到的的模块共享问题；
- 在模块使用上非常灵活，当你引用一个远程模块时，可以像使用普通的 npm 包一样使用它，当然也允许懒加载模块；
- 远程模块和路由没有任何关联，加载的契机完全由 host 应用自己灵活决定。

### Q5. 模块联邦与 NPM 包、UMD代码共享等方式的区别？

**npm**： 将共享的模块抽离成lib包，发布npm，再项目中安装，打包。依然需要走本地编译。

**umd**：真正 Runtime 的方式可能是 UMD 方式共享代码模块，即将模块用 Webpack UMD 模式打包，并输出到其他项目中。但这种技术方案问题也很明显，就是包体积无法达到本地编译时的优化效果，且库之间容易冲突。

**微前端**：微前端就是要解决多项目并存问题，多项目并存的最大问题就是模块共享，不能有冲突。微前端还要考虑样式冲突、生命周期管理。

**MF**：直接将一个应用的包应用于另一个应用，同时具备整体应用一起打包的公共依赖抽取能力。让应用具备模块化输出能力，其实开辟了一种新的应用形态，即 “中心应用”，这个中心应用用于在线动态分发 Runtime 子模块，并不直接提供给用户使用。


## 参考文献
[Webpack 5 之 模块联合（Module Federation）](https://www.lumin.tech/articles/webpack-module-federation/#%E5%85%B1%E4%BA%AB%E6%A8%A1%E5%9D%97)

[精读《Webpack5 新特性 - 模块联邦》](https://zhuanlan.zhihu.com/p/115403616)

[今天来聊聊webpack 5.0 模块联邦 - 掘金](https://juejin.cn/post/7119298510247165965)

[利用联邦模块实现跨应用的代码共享 - 掘金](https://juejin.cn/post/6961678963680739359#heading-17)

