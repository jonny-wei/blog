# Taro Next

- Taro 之前的重编译时的架构是如何实现的？
- Taro 之前的编译时和运行时做了什么事情？
- Taro 之前的架构有什么缺陷？
- Taro Next 有什么特性？
- Taro Next 如何适配 React 的？
- Taro Next 重运行时都做了什么事情？

## Taro 架构

Taro 当前的架构主要分为编译时和运行时

![taro1](/blog/images/mobile/taro1.png)

### 编译时

Taro 架构的编译时主要负责将开发代码转换成各个端上可以运行的代码。这一过程主要通过 `Babel` 来实现，具体包括以下几个步骤：

1. **代码解析**：使用 `babel-parser` 将 Taro 代码（包括 JSX 语法）解析成抽象语法树（AST）。

2. **语法树转换**：通过 `babel-types` 对 AST 进行一系列的修改和转换操作，以适配目标平台的代码规范。

3. **代码生成**：最后通过 `babel-generate` 根据修改后的 AST 生成对应的目标代码，如 `JS`、`WXML`、`WXSS`、`JSON` 等。

4. **JSX 编译**：JSX 编译是编译时最复杂的部分，因为 JSX 的写法千变万化。Taro 采用**穷举**的方式对 JSX 可能的写法进行适配，以支持 JSX 的各种写法。

5. **模板化处理**：Taro 将小程序的所有组件进行模板化处理，得到小程序组件对应的模板，然后根据运行时提供的 DOM 树数据结构，各模板递归地相互引用，最终渲染出对应的动态 DOM 树。

6. **样式和静态资源处理**：Taro 还会处理项目中的静态资源文件（如图片、字体），将其转换为适用于不同平台的格式，并进行压缩和优化。

### 运行时

Taro 架构的运行时主要负责在各个小程序端上进行适配，包括生命周期、事件、data 等部分的处理和对接，使得代码能够运行在不同的小程序平台上。具体包括：

1. **模拟 DOM/BOM API**：Taro 在小程序端模拟实现了一套高效的 `DOM/BOM` API，使得前端框架可以直接运行在小程序环境中。

2. **事件系统**：Taro 实现了一个事件系统，包括 `TaroEventTarget` 类，实现 `addEventListener` 和 `removeEventListener` 方法。

3. **TaroNode 类**：继承自 `TaroEventTarget` 类，主要实现操作 DOM 节点的方法，如 `insertBefore`、`appendChild` 等。

4. **渲染函数**：Taro 使用 `react-reconciler` 提供的渲染函数，将 React 代码在小程序的运行时正常运行，并生成 `Taro DOM Tree`。

5. **从虚拟 DOM 到小程序页面渲染**：由于小程序没有提供动态创建节点的能力，Taro 使用模板拼接的方式，根据运行时提供的 DOM 树数据结构，渲染出对应的动态 DOM 树。

6. **生命周期、事件、data 处理**：运行时还负责处理生命周期、事件、`data` 等部分的对接，使得不同框架的代码能够在小程序平台上正常运行。

![taro2](/blog/images/mobile/taro2.png)

Taro 当前架构的主要特点：

- **重编译时，轻运行时**：编译时是 Taro 架构的核心，主要负责将开发代码转换成各个端上可以运行的代码，而运行时则负责生命周期、事件、data 等部分的处理和对接。
- **编译后代码与 React 无关**：Taro 只是在开发时遵循了 React 的语法，编译时和 React DSL 强绑定。
- **直接使用 Babel 进行编译**：Taro 利用 Babel 进行代码编译，这使得 Taro 在工程化和插件方面具有一定的灵活性，但也导致了一些限制，特别是在 JSX 支持和 source-map 方面。

### 缺陷

- 编译时缺陷
  - **JSX 支持程度不完美**：Taro 对 JSX 的支持是通过编译时的适配实现的，但由于 JSX 非常灵活，Taro 无法做到 100% 支持所有 JSX 语法。
  - **不支持 source-map**：Taro 在对源代码进行一系列转换操作后，不再支持 source-map，这使得用户调试和使用项目变得不方便。
  - **维护和迭代困难**：Taro 编译时代码非常复杂且分散，导致维护和迭代都非常困难。
- 运行时缺项
  - **多平台适配问题**：对于每个小程序平台，Taro 都提供对应的运行时框架进行适配。当需要修改 Bug 或新增特性时，需要同时修改多份运行时框架，这种做法不合理。
  - **多框架支持困难**：Taro 不仅要支持 React，还要支持 Vue、Preact、Svelte 等不同运行时框架。

## Taro Next 架构

Taro Next 旨在解决 Taro 架构的编译时和运行时缺陷，以及支持更多框架如 Vue、Preact、Svelte 等。Taro Next 的新特性包括更强大的功能、更快的速度和更高的灵活性。

和之前的架构不同，Taro Next 是近乎**全运行**：

![taro3](/blog/images/mobile/taro3.png)

- **近乎全运行时架构**：Taro Next 架构的核心是运行时，它通过模拟 `DOM/BOM` API 实现了一套高效的运行时渲染代码 `@tarojs/runtime`，使得 React、Vue 等框架能够直接运行在小程序环境中。
- **无 DSL 限制**：Taro Next 允许开发者使用任意视图框架开发，不再受限于特定的 DSL（领域特定语言），提高了框架的灵活性和适用性。不限制语言和语法，还提供了渲染 HTML 和跨框架组件的功能。
- **模板动态构建**：与之前模板通过编译生成的方式不同，Taro Next 的模板是固定的，基于组件的 template 动态“递归”渲染整棵 Taro DOM 树。
- **新特性无缝支持**：由于 Taro Next 本质上是将 React/Vue 运行在小程序上，因此各种新特性能够无缝支持。
- **更快的构建速度**：通过剥离 AST 操作，Taro Next 加快了构建速度；其次提升了初始化、更新操作的性能；处理 Taro 自身的优化，还提供了一系列优化选项给用户。
- **基于 Webpack 高灵活性**：Taro Next 提供了插件化系统和更多的配置项，使得开发者可以根据项目需求定制化开发，提高了框架的灵活性和可扩展性，比如暴露更多的 Taro 内部的配置、Webpack 的配置给用户；其次对 Taro 做了依赖瘦身，按需安装依赖。
- **性能优化**：Taro Next 在更新粒度上进行了优化，实现了 DOM 级别的更新，相比 Data 级别的更新更加高效，减少了冗余。
- **预渲染技术**：为了解决初始化性能问题，Taro Next 采用了预渲染技术，将页面初始化的状态直接渲染为无状态的 `WXML`，提高了初始渲染速度。

## 重运行时

无论开发这是用的是什么框架，React 也好，Vue 也罢，最终代码经过运行之后都是调用了浏览器的那几个 BOM/DOM 的 API，因此实现了一套高效、精简版的 DOM/BOM API —— `taro-runtime`

![taro4](/blog/images/mobile/taro4.png)

- TaroEventTarget 类，实现 addEventListener 和 removeEventListener。
- TaroNode 类继承 TaroEventTarget 类，主要实现 insertBefore、appendChild 等操作 DOM 节点的方法。
- TaroElement 类继承 TaroNode 类，主要是节点属性相关的方法和 dispatchEvent 方法。
- TaroRootElement 类继承 TaroElement 类，其中最主要是 enqueueUpdate 和 performUpdate，把虚拟 DOM setData 成小程序 data 的操作就是这两个函数。

然后，我们通过 Webpack 的 `ProvidePlugin` 插件，注入到小程序的逻辑层

![taro5](/blog/images/mobile/taro5.png)

```js
// trao-mini-runner/src/webpack/build.conf.ts
plugin.providerPlugin = getProviderPlugin({
  window: ['@tarojs/runtime', 'window'],
  document: ['@tarojs/runtime', 'document'],
  navigator: ['@tarojs/runtime', 'navigator'],
  requestAnimationFrame: ['@tarojs/runtime', 'requestAnimationFrame'],
  cancelAnimationFrame: ['@tarojs/runtime', 'cancelAnimationFrame'],
  Element: ['@tarojs/runtime', 'TaroElement'],
  SVGElement: ['@tarojs/runtime', 'SVGElement'],
  MutationObserver: ['@tarojs/runtime', 'MutationObserver'],
  history: ['@tarojs/runtime', 'history'],
  location: ['@tarojs/runtime', 'location'],
  URLSearchParams: ['@tarojs/runtime', 'URLSearchParams'],
  URL: ['@tarojs/runtime', 'URL'],
})

// trao-mini-runner/src/webpack/chain.ts
export const getProviderPlugin = args => {
  return partial(getPlugin, webpack.ProvidePlugin)([args])
}

```

## 适配 React

### 渲染器

在 DOM/BOM 注入之后，理论上来说，Nerv/Preact 就可以直接运行了。但是 React 有点特殊，因为 React-DOM 包含大量浏览器兼容类的代码，导致包太大，而这部分代码我们是不需要的，因此我们需要做一些定制和优化。

回顾 React 的架构，`react-reconciler` 维护 Virtual DOM 树，内部实现了 Diff/Fiber 算法，决定什么时候更新、以及要更新什么，而 `Renderer` 负责具体平台的渲染工作，它会提供宿主组件、处理事件等等。例如 `React-DOM` 就是一个渲染器，负责 DOM 节点的渲染和 DOM 事件处理。

![taro9](/blog/images/mobile/taro9.png)

那么在 Taro 也应该有一个适配 React 的渲染器，负责调用底层 `BOM/DOM API`,增删改 DOM 及 DOM 事件处理。因此, `taro-react` 包，就用来连接 `react-reconciler` 和 `taro-runtime` 的 `BOM/DOM API`，处理 DOM 的渲染。

![taro10](/blog/images/mobile/taro10.png)

具体的实现主要分为两步：

- 实现 react-reconciler 的 hostConfig 配置

Taro Next 通过实现 react-reconciler 的 hostConfig 接口来适配 React。这个接口定义了一系列方法，用于创建、更新和管理渲染目标平台的元素。这些方法包括 createInstance、createTextInstance、appendChild、removeChild、commitUpdate 等，它们在 hostConfig 的方法中调用对应的 Taro BOM/DOM 的 API，从而将 React 的操作转换为 Taro 虚拟节点树的操作

- 实现渲染函数（类似于 ReactDOM.render）

类似于在浏览器环境中使用 ReactDOM.render 来渲染 React 组件，Taro Next 实现了自己的渲染函数，这个函数负责创建 Taro DOM Tree 的容器，并将其与 react-reconciler 连接起来，使得 React 代码可以在小程序环境中运行并生成 Taro DOM Tree

经过上面的步骤，React 代码实际上就可以在小程序的运行时正常运行了，并且会生成 Taro DOM Tree，那么偌大的 Taro DOM Tree 怎样更新到页面呢？

### 模版化处理

由于小程序没有提供动态创建节点的能力，Taro Next 使用模板拼接的方式，根据运行时提供的 DOM 树数据结构，各 templates 递归地相互引用，最终渲染出对应的动态 DOM 树。小程序的所有组件都经过模板化处理，得到小程序组件对应的模板。

![taro11](/blog/images/mobile/taro11.png)

对于每个组件，Taro Next 会有一个对应的模板，这个模板会列出所有属性，并遍历渲染所有子节点。子节点会引用中间层模板，中间层模板根据 nodeName 找到对应的组件模板，通过这种方式逐步拼接模板，最终渲染出动态的 DOM 树。

![taro12](/blog/images/mobile/taro12.png)

### 事件处理与更新

#### 事件处理

![taro13](/blog/images/mobile/taro13.png)

- 在小程序组件的模版化过程中，将所有事件方法全部指定为 调用 ev 函数，如：`bindtap`、`bindchange`、`bindsubmit`等。
- 在运行时实现 `eventHandler` 函数，和 eh 方法绑定，**收集所有的小程序事件**
- 通过 `document.getElementById()` 方法获取触发事件对应的 `TaroNode`
- 通过 `createEvent()` 创建符合规范的 `TaroEvent`
- 调用 `TaroNode.dispatchEvent` 重新触发事件

在 hostConfig 中的 finalizeInitialChildren 方法里，Taro Next 会调用 updateProps 方法来注册事件。Taro Next 事件本质上是基于 Taro DOM 实现了一套自己的事件机制，这样做的好处之一是，无论小程序是否支持事件的冒泡与捕获，Taro 都能支持。

![taro18](/blog/images/mobile/taro18.png)

#### 更新

无论是 React 还是 Vue ，最终都会调用 Taro DOM 方法，如：appendChild、insertChild 等。

这些方法在修改 Taro DOM Tree 的同时，还会调用 `enqueueUpdate` 方法，这个方法能获取到每一个 DOM 方法最终修改的节点路径和值，如：`{root.cn.[0].cn.[4].value: "1"}`，并通过 setData 方法更新到视图层。

![taro14](/blog/images/mobile/taro14.png)

新的粒度是 DOM 级别，只有最终发生改变的 DOM 才会被更新过去，相对于之前 data 级别的更新会更加精准，性能更好。

### 生命周期

生命周期的实现是在运行时维护的 App 实例 / Page 实例进行了生命周期方法的一一对应。生命周期可能是变动最小的部分之一。

- React 生命周期方法的支持：Taro 支持 React 组件的所有生命周期方法，包括 `componentWillMount`、`componentDidMount`、`componentDidShow`、`componentDidHide`、`componentWillUpdate`、`componentDidUpdate` 和 `componentWillUnmount`。这些方法在 Taro 中都可以直接使用，使得开发者可以在小程序开发中应用 React 的生命周期管理。

- 小程序特有生命周期的适配：除了 React 的生命周期方法，Taro 还提供了小程序特有的生命周期方法，如 `componentDidShow` 和 `componentDidHide`，以适应小程序的页面显示和隐藏的场景。

- 生命周期触发机制：在 Taro3 中，React 的生命周期触发时机与 Web 开发中的理解有所不同。例如，`componentWillMount` 在页面的 `onLoad` 之后、页面组件渲染到 Taro 的虚拟 DOM 之前触发；`componentDidMount` 在页面组件渲染到 Taro 的虚拟 DOM 之后触发。

- 页面方法的适配：小程序页面的方法，在 Taro 的页面中同样可以使用。在 Class Component 中书写同名方法、在 Functional Component 中使用对应的 Hooks。需要注意的是，小程序页面方法在各端的支持程度不一，且使用了 HOC 包裹的小程序页面组件，必须处理 `forwardRef` 或使用继承组件的方式而不是返回组件的方式，否则小程序页面方法可能不会被触发。

- Hooks 的支持：Taro 提供了一系列的 Hooks，如 `useLoad`、`useReady`、`useDidShow`、`useDidHide`、`useUnload`、`usePullDownRefresh` 等，这些 Hooks 对应于小程序的页面生命周期，使得在 Function Component 中也能方便地使用生命周期特性。

- 页面组件配置：对于页面组件，Taro 允许通过 `index.config.js` 等配置文件进行页面配置，同时支持 React 的生命周期方法以及小程序特有的生命周期方法。

![taro17](/blog/images/mobile/taro17.png)

应用级生命周期

```js
App({
  // 小程序启动之后触发，全局只触发一次
  onLaunch: function (options) {
    console.log('App Launch', options);
  },
  // 小程序启动，或从后台进入前台显示时触发
  onShow: function (options) {
    console.log('App Show', options);
  },
  // 小程序从前台进入后台时触发
  onHide: function () {
    console.log('App Hide');
  },
  // 小程序发生脚本错误或 API 调用失败时触发
  onError: function (msg) {
    console.log('App Error', msg);
  },
  // 小程序要打开的页面不存在时触发
  onPageNotFound: function (res) {
    console.log('Page Not Found', res);
  },
  // 小程序全局数据，可以在这里设置
  globalData: {
    userInfo: null
  }
});
```

页面级生命周期

```js
Page({
  data: {
    message: 'Hello, 小程序!'
  },
  // 页面加载时触发，注意这是一个页面生命周期函数
  onLoad: function (options) {
    console.log('Page Load', options);
    // 可以在这里进行数据初始化
  },
  // 页面显示/切入前台时触发
  onShow: function () {
    console.log('Page Show');
    // 可以在这里刷新数据
  },
  // 页面初次渲染完成时触发，注意这是一个页面生命周期函数
  onReady: function () {
    console.log('Page Ready');
    // 可以在这里进行DOM查询、定时器操作等
  },
  // 页面隐藏/切后台时触发
  onHide: function () {
    console.log('Page Hide');
    // 可以在这里保存页面状态、停止计时器等
  },
  // 页面卸载时触发
  onUnload: function () {
    console.log('Page Unload');
    // 可以在这里进行资源清理
  },
  // 页面下拉刷新时触发
  onPullDownRefresh: function () {
    console.log('Page Pull Down Refresh');
  },
  // 页面上拉触底时触发
  onReachBottom: function () {
    console.log('Page Reach Bottom');
  },
  // 页面分享时触发
  onShareAppMessage: function () {
    console.log('Page Share App Message');
  },
  // 页面滚动时触发
  onPageScroll: function (options) {
    console.log('Page Scroll', options);
  },
  // 点击 tab 时触发
  onTabItemTap: function (item) {
    console.log('Tab Item Tap', item);
  }
});
```

## 适配 ArkUI

首先，在 ArkUI 层面实现一套与 Taro 组件对应的组件库，建立 Taro 组件和 ArkUI 组件之间的映射关系。然后，处理复合组件结构和层级位置调整，以及平台特定组件的适配。

![taro15](/blog/images/mobile/taro15.png)

在节点映射的过程中，我们注意到 Taro 虚拟节点树与实际 ArkUI 视图结构存在差异。这些差异主要体现在以下几个方面：

- 复合组件结构：某些 Taro 组件在 ArkUI 中可能需要多个组件配合实现，如 ScrollView 组件。
- 层级位置调整：特殊定位的节点（如 Fixed 定位的元素）在最终渲染时的位置可能与其在虚拟节点树中的层级不一致。
- 平台特定组件：某些 Taro 组件可能需要使用 ArkUI 特有的组件或布局方式来实现。

Taro 通过自定义 Renderer 将 React 操作转换为虚拟节点树，然后通过三步转换过程将其映射到 ArkUI 结构。这个过程涉及 Taro Element、Taro RenderNode 和 ArkUI Node 这三棵树的维护，主要通过这三个流程步骤实现：

- 创建 Taro Element：这一步将 React 组件转换为 Taro 内部表示。
- 创建 Taro RenderNode：将 Taro 的内部表示进一步转化为更接近 ArkUI 层级结构的渲染节点。
- 创建 ArkUI Node：最后一步是将 Taro RenderNode 转换为实际的 ArkUI 节点，直接与 ArkUI 的底层 API 交互。

![taro16](/blog/images/mobile/taro16.png)

## 性能优化

### setData 优化

- **减少冗余数据更新**：Taro Next 在更新时会进行 hydrate 操作来识别出会影响视图更新的 Data，只 setData 这些渲染所需要的数据，从而减小 setData 数据量，提高了性能。Taro Next 的更新是 DOM 级别的，比 Data 级别的更新更加高效，因为 Data 粒度更新实际上是有冗余的，并不是所有的 Data 的改变最后都会引起 DOM 的更新。

![taro6](/blog/images/mobile/taro6.png)

- **按路径更新**：在更新数据时，会对比 Taro DOM Tree，然后将 diff 的结果按小程序的按路径更新语法并对 path 进行压缩，减少 setData 发送的数据量，提升性能。

![taro7](/blog/images/mobile/taro7.png)

### 预渲染

Taro Next 架构中的预渲染技术是一种在小程序端提高页面初始化渲染速度的技术。其实现原理与服务端渲染类似，即将页面初始化的状态直接渲染为无状态的 `wxml`，在框架和业务逻辑运行之前执行渲染流程。预渲染技术可以减少 setData() 方法需要传递的数据量，从而减少初始化页面时的白屏时间，特别是在页面初始化渲染的 `wxml` 节点数较多或用户机器性能较低时效果显著。

Taro Next 在一个页面加载时需要经历以下步骤：

1. 框架（React/Nerv/Vue）把页面渲染到虚拟 DOM 中
2. Taro 运行时把页面的虚拟 DOM 序列化为可渲染数据，并使用 setData() 驱动页面渲染
3. 小程序本身渲染序列化数据

和原生小程序或编译型小程序框架相比，步骤 1 和 步骤 2 是多余的。如果页面的业务逻辑代码没有性能问题的话，大多数性能瓶颈出在步骤 2 的 setData() 上：由于初始化渲染是页面的整棵虚拟 DOM 树，数据量比较大，因此 setData() 需要传递一个比较大的数据，导致初始化页面时会一段白屏的时间。这样的情况通常发生在页面初始化渲染的 wxml 节点数比较大或用户机器性能较低时发生。

![taro8](/blog/images/mobile/taro8.png)

和所有技术一样，Prerender 并不是银弹，使用 Prerender 之后将会有以下的 trade-offs 或限制：

- 页面打包的体积会增加。Prerender 本质是一种以空间换时间的技术，体积增加的多寡取决于预渲染 wxml 的数量。
- 在 Taro 运行时把真实 DOM 和事件挂载之前（这个过程在服务端渲染被称之为 hydrate），预渲染的页面不会相应任何操作。
- Prerender 不会执行例如 componentDidMount()(React)/ready()(Vue) 这样的生命周期，这点和服务端渲染一致。如果有处理数据的需求，可以把生命周期提前到 static getDerivedStateFromProps()(React) 或 created()(Vue)

## 问题

### Q1. Taro Next 对 React 如何适配的？

1. **模拟 DOM/BOM API**
   - Taro Next 创建了一个名为 `taro-runtime` 的包，并在这个包中实现了一套高效、精简版的 DOM/BOM API。这使得在小程序的运行时环境中，可以拥有类似于浏览器环境中的 DOM 和 BOM 对象，从而为 React 等前端框架提供了运行的基础。

2. **提供自定义渲染器**
   - 由于 React 16+ 的架构中，`react-reconciler` 负责维护 Virtual DOM 树，并内部实现了 Diff/Fiber 算法，而 Renderer 负责具体平台的渲染工作。Taro 实现了 `taro-react` 包，用来连接 `react-reconciler` 和 `taro-runtime` 的 BOM/DOM API。这个自定义渲染器允许 React 代码在小程序环境中渲染。

3. **实现宿主配置（hostConfig）**
   - 在 React 架构中，需要实现 `react-reconciler` 的 hostConfig 配置，这些配置项定义了如何创建节点实例、构建节点树、提交和更新等操作。Taro Next 在 hostConfig 的方法中调用对应的 Taro BOM/DOM 的 API，从而实现了 React 操作到 Taro 虚拟节点树的转换。

4. **渲染函数的实现**
   - Taro Next 实现了类似于 `ReactDOM.render` 的 render 函数，这个函数负责创建 Taro DOM Tree 的容器。

5. **模板化处理和动态渲染**
   - Taro Next 将小程序的所有组件进行模板化处理，得到小程序组件对应的模板，然后基于组件的 template，动态 “递归” 渲染整棵树。

6. **事件处理**
   - Taro Next 实现了一套自己的事件机制，基于 Taro DOM 实现，使得无论小程序是否支持事件的冒泡与捕获，Taro 都能支持。

7. **更新粒度控制**
   - Taro Next 在修改 Taro DOM Tree 的同时，会调用 `enqueueUpdate` 方法，这个方法能获取到每一个 DOM 方法最终修改的节点路径和值，并通过 `setData` 方法更新到视图层，实现了 DOM 级别的更新粒度控制。

### Q2. Taro Next 如何适配 ArkUI？

1. **Taro 运行时原理**
   - React Reconciler：React 的协调器（Reconciler）负责比较新旧虚拟 DOM 树，并计算出需要执行的最小更新操作。Taro 通过实现 **ReactReconciler** 接口，创建了自己的协调器，称为 **Taro Reconciler**。
   - HostConfig 接口：Taro 实现了 **ReactReconciler** 所需的 **hostConfig** 接口，这个接口定义了一系列方法，用于创建、更新和管理渲染目标平台的元素。这些方法包括 **createElement**、**createTextInstance**、**appendChild**、**removeChild**、**insertBefore** 和 **commitUpdate** 等。

2. **Taro 与 React 对接**
   - **Taro Renderer**：**Taro Renderer** 是 Taro 与 React 对接的关键，它实现了 **hostConfig** 接口，将 React 的操作转换为 Taro 虚拟节点树的操作。
   - **Taro 虚拟节点树**：**Taro 虚拟节点树** 是 Taro 跨平台渲染的中间表示，它为不同平台的渲染提供了统一的抽象。

3. **Taro 与 ArkUI 对接**
   - **Taro Element 到 ArkUI 节点的映射**：Taro 需要在 ArkUI 层面实现一套与 Taro 组件对应的组件库，建立 Taro 组件和 ArkUI 组件之间的映射关系。这个过程涉及到将 Taro 的虚拟节点树转换为 ArkUI 可识别的结构。
   - **复合组件结构的处理**：某些 Taro 组件在 ArkUI 中可能需要多个组件配合实现，如 **ScrollView** 组件可能需要一个 **Scroll** 节点搭配一个 **Stack** 来实现。
   - **层级位置调整**：特殊定位的节点（如 **Fixed** 定位的元素）在最终渲染时的位置可能与其在虚拟节点树中的层级不一致，需要在生成渲染树时进行特殊处理。
   - **平台特定组件的处理**：某些 Taro 组件可能需要使用 ArkUI 特有的组件或布局方式来实现，这要求在转换过程中进行适当的调整和映射。

4. **转换过程**
   - **创建 Taro Element**：根据组件类型实例化相应的 Taro 元素，将 React 组件转换为 Taro 内部表示。
   - **创建 Taro RenderNode**：将 Taro 的内部表示进一步转化为更接近 ArkUI 结构的渲染节点。
   - **创建 ArkUI Node**：将 Taro RenderNode 转换为实际的 ArkUI 节点，直接与 ArkUI 的底层 API 交互。

### Q3. 小程序加快冷启动速度有什么解决方案？

加快冷启动就是要优化小程序启动速度和首屏渲染：

1. **代码包体积优化**：
   - **分包加载**：独立分包适用于功能独立、启动性能要求高的页面，如广告页、活动页等。分包预下载解决用户首次进入分包页面时的延迟问题，提升用户体验。分包异步化将分包细化到组件甚至文件粒度，异步加载插件、组件和代码逻辑，降低启动包大小和代码量。
   - **避免非必要的全局自定义组件和插件**：避免全局引入只在某个分包页面中使用的自定义组件，减少不必要的代码注入，优化启动耗时。如果插件只在某个分包中使用，应仅在该分包中引用插件，减少主包的负担。对于确实需要在主包中或被多个分包使用的插件，可以考虑将插件置于一个分包中，并通过“分包异步化”的形式异步引入。
   - **控制代码包内的资源文件**：避免在代码包中包含或在WXSS中使用base64内联过多、过大的图片等资源文件，应尽可能部署到CDN，并使用URL引入。
   - **及时清理无用代码和资源**：不定期地分析代码包的文件构成和依赖关系，利用tree-shaking等特性去除冗余代码，防止打包时引入不需要的库和依赖。

2. **代码注入优化**：
   - **使用按需注入**：使用按需引入组件，及时移除JSON中未使用自定义组件的声明，避免在全局声明使用率低的自定义组件。
   - **使用用时注入**：在“按需注入”特性的前提下，使一部分自定义组件不在启动时注入，而是在真正被渲染时才进行注入。
   - **启动过程中减少同步API的调用**：应尽可能的使用异步API代替同步，并将启动过程中非必要的同步API调用延迟到启动完成后进行。
   - **避免启动过程进行复杂运算**：应避免执行复杂的运算逻辑，将复杂的运算延迟到启动完成后进行。

3. **首屏渲染优化**：
   - **初始渲染缓存**：小程序支持启用初始渲染缓存，在非首次启动时，使视图层不需要等待逻辑层初始化完毕，而直接提前将页面渲染结果展示给用户。
   - **避免引用未使用的自定义组件**：未使用的自定义组件会影响渲染耗时，应及时移除。
   - **精简首屏数据**：对于复杂页面，可以进行渐进式渲染，优先展示关键部分，非关键或不可见部分可以延迟更新。
   - **提前首屏数据请求**：建议在`Page.onLoad`或更早时机发起网络请求，利用小程序的数据预拉取和周期性更新能力。
   - **缓存请求数据**：使用`wx.setStorage`和`wx.getStorage`等API读写本地缓存，优先从缓存中获取数据来渲染视图。
   - **使用预渲染或骨架屏**：如果初次渲染的数据量非常大，可能会导致页面在加载过程中出现一段时间的白屏，使用预渲染功能或骨架屏减少白屏时间。

### Q4. `bindtap`和`catchtap`的区别?

1. **事件冒泡**：
   - `bindtap`支持事件冒泡，当一个元素上的`bindtap`事件被触发时，如果该元素的父节点也有相同类型的`bindtap`事件，父节点的事件处理函数也会被执行。这意味着事件会从最内层的元素向外层元素传递。
   - `catchtap`阻止事件冒泡，当使用`catchtap`时，点击事件只会在当前元素上触发，不会传递到父元素。

2. **绑定顺序**：
   - 当多个元素同时绑定了`bindtap`和`catchtap`事件时，它们的触发顺序是不同的。`bindtap`的触发顺序是由子元素向父元素冒泡的顺序（即从内到外）；而`catchtap`的触发顺序是由父元素向子元素捕获的顺序（即从外到内）。

3. **阻止默认行为**：
   - 对于某些具有默认行为的元素（如`<form>`、`<input type="submit">`等），`bindtap`可以通过返回`false`来阻止默认行为的触发；而`catchtap`无法阻止这些默认行为。

4. **用途**：
   - 在一般情况下，推荐使用`bindtap`来进行事件绑定，因为它可以与父元素的事件一起工作，并且在处理冒泡事件时更加灵活。只有在确实需要阻止事件冒泡或不想触发父元素的事件处理函数时，才使用`catchtap`。

总结来说，`bindtap`和`catchtap`的主要区别在于事件冒泡的处理方式。`bindtap`允许事件冒泡，而`catchtap`阻止事件冒泡。根据具体的应用场景和需求，开发者可以选择适合的方式来绑定和处理事件。

### Q5. 小程序的双向绑定和 vue 双向绑定有什么异同?

两者都采用数据驱动的方式，即通过更新数据来驱动视图的渲染，通过观察者模式来建立数据与视图之间的关联，数据变化时能够自动触发视图的更新，即两者数据双向绑定原理基本一样，但实现方式不一样：

- 小程序主要通过 WXML 模板和 JS 脚本来实现数据驱动，数据变化时通过 setData 方法更新，WXML 模板负责渲染数据到视图，这种方式下数据绑定是单向的，即从数据到视图，其双向绑定能力相对较弱。
- Vue 通过模板引擎和响应式数据机制实现双向绑定。在 Vue 实例的 data 选项中定义数据，使用 v-model 等指令在模板中绑定数据，支持从视图到数据和从数据到视图的双向同步

### Q6. 小程序登录流程？

![security2](/blog/images/mobile/security2.png)

通常情况下，我们的小程序都会有业务身份，如何将**微信帐号**和**业务身份**关联起来呢？这个时候我们需要上图的步骤：

1. 小程序调用`wx.login()`获取临时登录凭证`code`。
2. 小程序将`code`传到开发者服务器。
3. 开发者服务器以`code`换取用户唯一标识`openid`和会话密钥`session_key`。
4. 开发者服务器可绑定微信用户身份`id`和业务用户身份。
5. 开发者服务器可以根据用户标识来生成自定义登录态，用于后续业务逻辑中前后端交互时识别用户身份。

::: warning 参考文献
[如何借助 Taro Next 横穿跨端业务线](https://www.yuque.com/zaotalk/posts/c10-6#HUlMM)

[深入浅出主流的几款小程序跨端框架原理](https://mp.weixin.qq.com/s/598yu_5mPCvArJcw-UY_aw)

[React 代码如何跑在小程序上](https://juejin.cn/post/7290802328722112512?from=search-suggest#heading-7)
:::
