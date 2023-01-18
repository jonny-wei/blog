# 模块联邦

## 定义

Webpack 模块联邦是 Webpack 5 新引入的一种远程模块动态加载、运行技术。允许运行时把当前构建的应用作为容器应用，异步加载远程模块。MF 允许我们将原本单个巨大应用按我们理想的方式拆分成多个体积更小、职责更内聚的小应用形式，理想情况下各个应用能够实现独立部署、独立开发(不同应用甚至允许使用不同技术栈)、团队自治，从而降低系统与团队协作的复杂度 —— 没错，这正是所谓的微前端架构。虽然国内讨论热度较低，但使用简单，功能强大，非常适用于微前端或代码重构迁移场景。

模块联邦 让 Webpack 达到了线上 Runtime 的效果，让代码直接在项目间利用 CDN 直接共享，不再需要本地安装 Npm 包、构建再发布了！我们知道 Webpack 可以通过 DLL 或者 Externals 做代码共享时 Common Chunk，但不同应用和项目间这个任务就变得困难了，我们几乎无法在项目之间做到按需热插拔。模块联邦是 Webpack5 新内置的一个重要功能，可以让跨应用间真正做到模块共享。 它支持直接将一个应用的包应用于另一个应用，同时具备整体应用一起打包的公共依赖抽取能力。

## 特性

- 应用可按需导出若干模块，这些模块最终会被单独打成模块包，功能上有点像 NPM 模块
- 应用可在运行时基于 HTTP(S) 协议动态加载其它应用暴露的模块，且用法与动态加载普通 NPM 模块一样简单，挣脱 npm 包体无法动态更新的桎梏
- 与其它微前端方案不同，MF 的应用之间关系平等，没有主应用/子应用之分，每个应用都能导出/导入任意模块。本质上就是多个独立的应用之间，可以相互引用，可以减少重复的代码，更好的维护多个应用。
- Module Federation 依赖于 Webpack5 内置的 ModuleFederationPlugin 实现模块导入导出功能

## 用法

### Webpack 中使用模块联邦

1. 对于**模块生成方（Remote 提供方）**，需要使用 `ModuleFederationPlugin` 插件的 `expose` 参数声明需要导出的模块列表，使用 filename 指定生成的入口文件。Webpack 会将 exposes 声明的模块分别**编译为独立产物**，并将**产物清单、MF 运行时**等代码打包进 filename 定义的应用入口文件
2. 对于**模块使用方（Host 消费方）**，需要使用 `ModuleFederationPlugin` 插件的 `remotes` 参数声明需要从哪些地方导入远程模块，代码中使用异步导入语法 `import("module")` 引入模块。
3. **依赖共享**问题。简单用上面的方式会出现依赖被重复打包，造成产物冗余的问题。为此 **ModuleFederationPlugin** 提供了 shared 配置用于声明该应用可被共享的依赖模块。注意：依赖共享对依赖的版本有一定要求，两个应用使用**版本号完全相同**的依赖才能被复用，所以 MF 对共享模块做了版本化管理，可以通过 `shared.[lib].requiredVersion` 配置项显式声明应用需要的依赖库版本来解决。除此之外，我们还可以通过 `shared.[lib].shareScope` 属性更精细地控制依赖的共享范围。`shareScope` 在多团队协作时能够切分出多个资源共享空间，降低依赖冲突的概率。

::: tip shared
• singleton：是否开启单例模式，如果开启的话，共享的依赖则只会加载一次（优先取版本高的）。
• requiredVersion：指定共享依赖的版本。
比如 singleton 为 true，app1 的 react 版本为 16.13.0，app2 的 react 版本为 16.14.0，那么 app1 和 app2 将会共同使用 16.14.0 的 react 版本，也就是 app2 提供的 react。
:::

```js
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
      // shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
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

### Vite 中使用模块联邦

1. 在模块联邦中的配置中，exposes 和 remotes 参数其实并不冲突，也就是说一个模块既可以作为本地模块，又可以作为远程模块。
2. 由于 Vite 的插件机制与 Rollup 兼容，**vite-plugin-federation** 方案在 Rollup 中也是完全可以使用的。

```js
// 远程模块配置
// remote/vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 模块联邦配置
    federation({
      name: "remote_app",
      filename: "remoteEntry.js",
      // 导出模块声明
      exposes: {
        "./Button": "./src/components/Button.js",
        "./App": "./src/App.vue",
        "./utils": "./src/utils.ts",
      },
      // 共享依赖声明
      shared: ["vue"],
    }),
  ],
  // 打包配置
  build: {
    target: "esnext",
  },
});

// 本地模块配置
// host/vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      // 远程模块声明
      remotes: {
        remote_app: "http://localhost:3001/assets/remoteEntry.js",
      },
      // 共享依赖声明
      shared: ["vue"],
    }),
  ],
  build: {
    target: "esnext",
  },
});
```

::: tip 国外大神整理的模块联邦的使用案例
[Module Federation Examples](https://github.com/module-federation/module-federation-examples/)
:::

## 原理

实现模块联邦有三大主要的要素:

1. Host模块: 即本地模块，用来消费远程模块。
2. Remote模块: 即远程模块，用来生产一些模块，并暴露运行时容器供本地模块消费。
3. Shared依赖: 即共享依赖，用来在本地模块和远程模块中实现第三方依赖的共享。

本地模块是如何消费远程模块？

通过 remoteMap 访问远端的运行时容器来拉取对应名称的模块。而运行时容器其实就是指远程模块打包产物 `remoteEntry.js` 的导出对象。

```js
// remoteEntry.js
const moduleMap = {
  "./Button": () => {
    return import('./__federation_expose_Button.js').then(module => () => module)
  },
  "./App": () => {
    dynamicLoadingCss('./__federation_expose_App.css');
    return import('./__federation_expose_App.js').then(module => () => module);
  },
  './utils': () => {
    return import('./__federation_expose_Utils.js').then(module => () => module);
  }
};

// 加载 css
const dynamicLoadingCss = (cssFilePath) => {
  const metaUrl = import.meta.url;
  if (typeof metaUrl == 'undefined') {
    console.warn('The remote style takes effect only when the build.target option in the vite.config.ts file is higher than that of "es2020".');
    return
  }
  const curUrl = metaUrl.substring(0, metaUrl.lastIndexOf('remoteEntry.js'));
  const element = document.head.appendChild(document.createElement('link'));
  element.href = curUrl + cssFilePath;
  element.rel = 'stylesheet';
};

// 关键方法，暴露模块
const get =(module) => {
  return moduleMap[module]();
};

const init = () => {
  // 初始化逻辑，用于共享模块，暂时省略
}

export { dynamicLoadingCss, get, init }
```

1. moduleMap 用来记录导出模块的信息，所有在 exposes 参数中声明的模块都会打包成单独的文件，然后通过 dynamic import 进行导入。
2. 容器导出了十分关键的 get 方法，让本地模块能够通过调用这个方法来访问到该远程模块。

梳理清楚了远程模块的运行时容器与本地模块的交互流程，如下图所示：

![FM1](/blog/images/devops/FM1.png)

共享依赖的实现：

拿之前的示例项目来说，本地模块设置了 `shared: ['vue']` 参数之后，当它执行远程模块代码的时候，一旦遇到了引入 `vue` 的情况，会优先使用本地的 `vue`，而不是远端模块中的 `vue`。

```js
// host
// 下面是共享依赖表。每个共享依赖都会单独打包
const shareScope = {
  'vue':{'3.2.31':{get:()=>get('./__federation_shared_vue.js'), loaded:1}}
};
async function ensure(remoteId) {
  const remote = remotesMap[remoteId];
  if (remote.inited) {
    return new Promise(resolve => {
      .then(lib => {
        // lib 即运行时容器对象
        if (!remote.inited) {
          remote.lib = lib;
          remote.lib.init(shareScope);
          remote.inited = true;
        }
        resolve(remote.lib);
    });
  })
  }
}
```

ensure 函数的主要逻辑是将共享依赖信息传递给远程模块的运行时容器，并进行容器的初始化。接下来我们进入容器初始化的逻辑 init 中。由于远程模块运行时容器初始化时已经挂载了共享依赖的信息，远程模块内部可以很方便的感知到当前的依赖是不是共享依赖，如果是共享依赖则使用本地模块的依赖代码，否则使用远程模块自身的依赖产物代码。

![FM2](/blog/images/devops/FM2.png)

## MF与微前端

在微前端中：

- 加载微应用必须预定义接口方法（mounted、unmount 等）来实现微应用的动态挂载和卸载等功能，这意味着每个微应用必须手动实现这些接口方法；
- 在[《微前端（二）- 实现篇》](https://www.lumin.tech/blog/micro-frontends-2-implementation/)中，我们了解到微应用在独立开发模式下，通常也是手动调用接口方法，来动态加载视图；
- 如果我们想要共享某个微应用的模块给其它微应用使用，这并不是轻松地事。这意味着你需要把该模块独立出去，并以合理调用方式被其它微应用远程加载。
- 微应用的切换通常由路由状态改变来触发的。
- 它虽然解决了按需加载、依赖管理和多个版本共存的问题，但自身的模块管理并不成标准，无法与社区的其他方案融合，而且需要成套的技术体系来支撑。

在模块联邦中：

- 上面我们了解了模块联合每个微应用可以是一个容器应用，所以他们之间可以相互依赖及加载；
- 每个应用允许暴露（exposes）多个接口，其它应用可以在动态远程加载该应用后，直接使用其接口。这解决了上面微前端提到的的模块共享问题；
- 在模块使用上非常灵活，当你引用一个远程模块时，可以像使用普通的 npm 包一样使用它，当然也允许懒加载模块；
- 远程模块和路由没有任何关联，加载的契机完全由 host 应用自己灵活决定。

## 模块共享方案

### NPM 模块共享

发布 npm 包是一种常见的复用模块的做法，我们可以将一些公用的代码封装为一个 npm 包。

封装 npm 包可以解决模块复用的问题，但它本身又引入了新的问题:

1. **开发效率问题**。每次改动都需要发版，并所有相关的应用安装新依赖，流程比较复杂。
2. **项目构建问题**。引入了公共库之后，公共库的代码都需要打包到项目最后的产物后，导致产物体积偏大，构建速度相对较慢。

因此，这种方案并不能作为最终方案，只是暂时用来解决问题的无奈之举。

### Git Submodule

通过 **git submodule** 的方式，我们可以将代码封装成一个公共的 Git 仓库，然后复用到不同的应用中，但也需要经历如下的步骤：

1. 公共库 lib1 改动，提交到 Git 远程仓库；
2. 所有的应用通过 `git submodule` 命令更新子仓库代码，并进行联调。

你可以看到，整体的流程其实跟发 npm 包相差无几，仍然存在 npm 包方案所存在的各种问题。

### 依赖外部化(external) + CDN 引入

即对于某些第三方依赖我们并不需要让其参与构建，而是使用某一份公用的代码。按照这个思路，我们可以在构建引擎中对某些依赖声明 external，然后在 HTML 中加入依赖的 CDN 地址。一般使用UMD格式产物，这样不同的项目间就可以通过 `window.React` 来使用同一份依赖的代码了，从而达到模块复用的效果。不过在实际的使用场景，这种方案的局限性也很突出:

1. **兼容性问题**。并不是所有的依赖都有 UMD 格式的产物，因此这种方案不能覆盖所有的第三方 npm 包。
2. **依赖顺序问题**。我们通常需要考虑间接依赖的问题，如对于 antd 组件库，它本身也依赖了 react 和 moment，那么 react 和 moment 也需要 external，并且在 HTML 中引用这些包，同时也要**严格保证**引用的顺序，比如说 moment 如果放在了 antd 后面，代码可能无法运行。而第三方包背后的间接依赖数量一般很庞大，如果逐个处理，对于开发者来说简直就是噩梦。
3. **产物体积问题**。由于依赖包被声明 external 之后，应用在引用其 CDN 地址时，会全量引用依赖的代码，这种情况下就没有办法通过 Tree Shaking 来去除无用代码了，会导致应用的性能有所下降。

### Monorepo

在 Monorepo 架构下，多个项目可以放在同一个 Git 仓库中，各个互相依赖的子项目通过软链的方式进行调试，代码复用显得非常方便，如果有依赖的代码变动，那么用到这个依赖的项目当中会立马感知到。不得不承认，对于应用间模块复用的问题，Monorepo 是一种非常优秀的解决方案，但与此同时，它也给团队带来了一些挑战:

1. **所有的应用代码必须放到同一个仓库**。如果是旧有项目，并且每个应用使用一个 Git 仓库的情况，那么使用 Monorepo 之后项目架构调整会比较大，也就是说改造成本会相对比较高。
2. Monorepo 本身也存在一些**天然的局限性**，如项目数量多起来之后依赖安装时间会很久、项目整体构建时间会变长等等，我们也需要去解决这些局限性所带来的的开发效率问题。而这项工作一般需要投入专业的人去解决，如果没有足够的人员投入或者基建的保证，Monorepo 可能并不是一个很好的选择。
3. **项目构建问题**。跟 发 npm 包的方案一样，所有的公共代码都需要进入项目的构建流程中，产物体积还是会偏大。

### 模块联邦

1. **实现任意粒度的模块共享**。这里所指的模块粒度可大可小，包括第三方 npm 依赖、业务组件、工具函数，甚至可以是整个前端应用！而整个前端应用能够共享产物，代表着各个应用单独开发、测试、部署，这也是一种微前端的实现。
2. **优化构建产物体积**。远程模块可以从本地模块运行时被拉取，而不用参与本地模块的构建，可以加速构建过程，同时也能减小构建产物。
3. **运行时按需加载**。远程模块导入的粒度可以很小，如果你只想使用 app1 模块的add函数，只需要在 app1 的构建配置中导出这个函数，然后在本地模块中按照诸如import('app1/add')的方式导入即可，这样就很好地实现了模块按需加载。
4. **第三方依赖共享**。通过模块联邦中的共享依赖机制，我们可以很方便地实现在模块间公用依赖代码，从而避免以往的external + CDN 引入方案的各种问题。

模块联邦近乎完美地解决了以往模块共享的问题，甚至能够实现应用级别的共享，进而达到微前端的效果。

## 问题

### Q1. 什么是模块联邦？

Webpack5 模块联邦是一种允许运行时把当前构建的应用作为容器应用，异步加载远程模块的技术。模块联邦让 webpack 达到了线上 runtime 的效果，能够让代码在项目间利用 CDN 直接共享，不再需要本地安装 npm 包，构建再发布。模块联邦可以真正实现跨应用间模块共享，支持将一个应用的包应用于另一个应用，同时具备整体应用一起打包的公共依赖抽取能力。

### Q2. 模块联邦解决了什么问题，其意义是什么？

模块联邦的功能意义在于如何通过构建工具对应用进行模块划分、模块共享、模块加载。联邦模块主要是用来解决多个应用之间代码共享的问题，可以让我们的更加优雅的实现跨应用的代码共享

### Q3. 模块联邦的原理？

webpack 每次打包都会将资源全部包裹在一个立即执行函数里面，这样虽然避免了全局环境的污染，但也使得外部不能访问内部模块。

在这个立即执行函数里面，webpack使用 **webpack_modules** 对象保存所有的模块代码，然后用内部定义的`__webpack_require__` 方法从 **webpack_modules** 中加载模块。并且在异步加载和文件拆分两种情况下向全局暴露一个 webpackChunk 数组用于沟通多个 webpack 资源，这个数组通过被webpack重写push方法，会在其他资源向 `webpackChunk` 数组中新增内容时同步添加到 **webpack_modules** 中从而实现模块整合。

联邦模块就是基于这个机制，修改了 **webpack_require** 的部分实现，在require的时候从远程加载资源，然后合并到`__webpack_modules__` 中。

`ModuleFederationPlugin` `主要做了三件事：

- 如何共享依赖：使用 **SharePlugin**
- 如何公开模块：使用 **ContainerPlugin**
- 如何引用模块：使用 **ContainerReferencePlugin**

ContainerPlugin：该插件为指定的公开模块创建 entry。entry.js 执行后会在 window 上挂一下对象，该对象有两个方法，get 和 init。get 方法用来获取模块。init 方法用来初始化容器，它可以提供共享模块。在使用 Remote 的模块时候，通过 init 将自身 shared 写入 Remote 中，再通过 get 获取 Remote 中 expose 的组件，而作为 Remote 时，判断 Host 中是否有可用的共享依赖，若有，则加载 Host 的这部分依赖，若无，则加载自身依赖。

`ContainerReferencePlugin` ：该插件将特定的引用添加到作为外部资源（externals）的容器中，并允许从这些容器中导入远程模块。在导入时会调用容器使用者提供的 remote 进行重载。

![FM3](/blog/images/devops/FM3.png)

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

在模块联邦中：

- 模块联合每个微应用可以是一个容器应用，所以他们之间可以相互依赖及加载；
- 每个应用允许暴露（exposes）多个接口，其它应用可以在动态远程加载该应用后，直接使用其接口。这解决了上面微前端提到的的模块共享问题；
- 在模块使用上非常灵活，当你引用一个远程模块时，可以像使用普通的 npm 包一样使用它，当然也允许懒加载模块；
- 远程模块和路由没有任何关联，加载的契机完全由 host 应用自己灵活决定。

### Q5. 模块联邦与 NPM 包、UMD代码共享等方式的区别？

**npm**： 将共享的模块抽离成lib包，发布npm，再项目中安装，打包。依然需要走本地编译。

**umd**：真正 Runtime 的方式可能是 UMD 方式共享代码模块，即将模块用 Webpack UMD 模式打包，并输出到其他项目中。但这种技术方案问题也很明显，就是包体积无法达到本地编译时的优化效果，且库之间容易冲突。

**微前端**：微前端就是要解决多项目并存问题，多项目并存的最大问题就是模块共享，不能有冲突。微前端还要考虑样式冲突、生命周期管理。

**MF**：直接将一个应用的包应用于另一个应用，同时具备整体应用一起打包的公共依赖抽取能力。让应用具备模块化输出能力，其实开辟了一种新的应用形态，即 “中心应用”，这个中心应用用于在线动态分发 Runtime 子模块，并不直接提供给用户使用。

### Q6. 模块联邦在工程上还存在什么问题？

- CSS 样式污染问题，建议避免在 component 中使用全局样式。
- 模块联邦并未提供沙箱能力，可能会导致 JS 变量污染
- 在 vite 中， React 项目还无法将 webpack 打包的模块公用模块
- 为了实现依赖共享，资源需要各种异步加载，可能会对页面的性能造成负面影响。
- 依赖的远程应用需要显式配置其资源路径，在版本控制方面存在和 NPM 包管理一样的问题。
- 引用远程应用模块的时候，没有类型提示，存在代码质量问题。
- 缺乏官方工具支持多个应用一起启动、一起开发。

## 相关文章

[一文看透 Module Federation](https://mp.weixin.qq.com/s/WCQvPbd_w8P-Tn36Sc0SXQ)

[Webpack 5 之 模块联合（Module Federation）](https://www.lumin.tech/articles/webpack-module-federation/#%E5%85%B1%E4%BA%AB%E6%A8%A1%E5%9D%97)

[精读《Webpack5 新特性 - 模块联邦》](https://zhuanlan.zhihu.com/p/115403616)

[今天来聊聊 webpack 5.0 模块联邦 - 掘金](https://juejin.cn/post/7119298510247165965)

[利用联邦模块实现跨应用的代码共享 - 掘金](https://juejin.cn/post/6961678963680739359#heading-17)

[浅谈低代码平台远程组件加载方案](https://mp.weixin.qq.com/s/o9mOo2PvVnLqZ2GpKm8F_Q)

[基于Module Federation的模块化跨栈方案探索](https://mp.weixin.qq.com/s/m39x8cXWwktyTJHygjyhjg)
