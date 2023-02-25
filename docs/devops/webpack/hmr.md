# HMR 热更新

`Hot Module Replacement`（模块热更新），简称 `HMR`，是指在应用程序运行过程中，替换、添加或删除模块，而无需重新加载整个页面。

页面的刷新一般分为两种：

- 一种是页面刷新，**不保留页面状态**，就是简单粗暴，直接 `window.location.reload()`
- 另一种是基于 WDS (webpack-dev-server) 的模块热替换，只需要**局部刷新页面上发生变化的模块，同时可以保留当前的页面状态**，比如复选框的选中状态、输入框的输入等

相对于 Live Reload 刷新页面的方案，HMR 的优点在于可以保存应用的状态，提高了开发效率。

## HMR 原理

Webpack HMR 特性的执行过程并不复杂，核心：

1. 使用 `webpack-dev-server` （后面简称 WDS）托管静态资源，同时以 Runtime 方式注入一段处理 HMR 逻辑的客户端代码；
2. 浏览器加载页面后，与 WDS 建立 WebSocket 连接；
3. Webpack 监听到文件变化后，增量构建发生变更的模块，并通过 WebSocket 发送 `hash` 事件；
4. 浏览器接收到 `hash` 事件后，请求 `manifest` 资源文件，确认增量变更范围；
5. 浏览器加载发生变更的增量模块；
6. Webpack 运行时触发变更模块的 `module.hot.accept` 回调，执行代码变更逻辑；
7. done。

![hmr1](/blog/images/devops/hmr1.png)

首先是 **注入 HMR 客户端运行时**：在 HMR 场景下，执行 `npx webpack serve` 命令后，`webpack-dev-server` 首先会调用 `HotModuleReplacementPlugin` 插件向应用的主 Chunk 注入一系列 HMR Runtime，包括：

- 用于建立 WebSocket 连接，处理 `hash` 等消息的运行时代码；
- 用于加载热更新资源的 `RuntimeGlobals.hmrDownloadManifest` 与 `RuntimeGlobals.hmrDownloadUpdateHandlers` 接口；
- 用于处理模块更新策略的 `module.hot.accept` 接口；
- ……

经过 `HotModuleReplacementPlugin` 处理后，构建产物中即包含了所有运行 HMR 所需的客户端运行时与接口。这些 HMR 运行时会在浏览器执行一套基于 WebSocket 消息的时序框架，如图：

![hmr2](/blog/images/devops/hmr2.png)

**其次，实现增量构建**：除注入客户端代码外，`HotModuleReplacementPlugin` 插件还会借助 Webpack 的 `watch` 能力，在代码文件发生变化后执行增量构建，生成：

- `manifest` 文件：JSON 格式文件，包含所有发生变更的模块列表，命名为 `[hash].hot-update.json`；
- 模块变更文件：js 格式，包含编译后的模块代码，命名为 `[hash].hot-update.js`。

增量构建完毕后，Webpack 将触发 `compilation.hooks.done` 钩子，并传递本次构建的统计信息对象 `stats`。WDS 则监听 `done` 钩子，在回调中通过 WebSocket 发送模块更新消息

**再次，加载更新**：客户端通过 WebSocket 接收到 `hash` 消息后，首先发出 `manifest` 请求获取本轮热更新涉及的 chunk。`manifest` 请求完成后，客户端 HMR 运行时开始下载发生变化的 chunk 文件，将最新模块代码加载到本地。

::: tip 注意
在 Webpack 4 及之前，热更新文件以模块为单位，即所有发生变化的模块都会生成对应的热更新文件； Webpack 5 之后热更新文件以 chunk 为单位
:::

**最后，执行 `module.hot.accept` 回调**：经过上述步骤，浏览器加载完最新模块代码后，HMR 运行时会继续触发 `module.hot.accept` 回调，将最新代码替换到运行环境中。

```js
module.hot.accept(path?: string, callback?: function);
```

- `path`：指定需要拦截变更行为的模块路径；
- `callback`：模块更新后，将最新模块代码应用到运行环境的函数。

`module.hot.accept` 是 Webpack 开放出来，由用户自定义模块更新逻辑的重要函数

1. **处理失败兜底逻辑**

`module.hot.accept` 函数只接受具体路径的 `path` 参数，也就是说，我们无法通过 `glob` 或类似风格的方式批量注册热更新回调。

一旦某个模块没有注册对应的 `module.hot.accept` 函数后，HMR 运行时会执行兜底策略，通常是刷新页面，确保页面上运行的始终是最新的代码，因此有时候你可能明明已经注册了 `accept` 回调，但热更新无法生效，此时可以检查一下文件路径是否真的命中资源。

2. **更新事件冒泡**

`module.hot.accept` 函数只能捕获当前模块对应子孙模块的更新事件

3. **使用无参数调用风格**

除上述调用方式外，`module.hot.accept` 函数还支持无参数调用风格，作用是捕获当前文件的变更事件，并从模块第一行开始重新运行该模块的代码

综上，Webpack 的 HMR 特性底层有两个重点，一是监听文件变化并通过 WebSocket 发送变更消息；二是需要客户端配合，通过 module.hot.accept 接口定制特定模块的热替换规则。

在开发项目时，我们自己通过 module.hot.accept 接口定制特定模块的热替换规则是比较痛苦的。不过幸好，在社区中已经针对这些有很成熟的解决方案了：

- 比如 Vue 开发中，我们使用 [vue-loader](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fvue-loader)，此 loader 支持 Vue 组件的 HMR，提供开箱即用的体验
- 比如 React 开发中，有 [React Hot Loader](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Freact-hot-loader)，实时调整 React 组件（目前 React 官方已经弃用了，改成使用 [react-refresh](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Freact-refresh))

下面以 Vue 为例，看看 vue-loader 如何实现 HMR。

## vue-loader 如何实现 HMR

除常规的代码转译外，在 HMR 模式下，vue-loader 还会为每一个 Vue 文件注入一段处理模块替换的逻辑，如：

```js
"./src/a.vue":
/*!*******************!*\
    !*** ./src/a.vue ***!
    \*******************/
/***/
((module, __webpack_exports__, __webpack_require__) => {
    // 模块代码
    // ...
    /* hot reload */
    if (true) {
    var api = __webpack_require__( /*! ../node_modules/vue-hot-reload-api/dist/index.js */ "../node_modules/vue-hot-reload-api/dist/index.js")
    api.install(__webpack_require__( /*! vue */ "../node_modules/vue/dist/vue.runtime.esm.js"))
    if (api.compatible) {
        module.hot.accept()
        if (!api.isRecorded('45c6ab58')) {
        api.createRecord('45c6ab58', component.options)
        } else {
        api.reload('45c6ab58', component.options)
        }
        module.hot.accept( /*! ./a.vue?vue&type=template&id=45c6ab58& */ "./src/a.vue?vue&type=template&id=45c6ab58&", __WEBPACK_OUTDATED_DEPENDENCIES__ => {
        /* harmony import */
        _a_vue_vue_type_template_id_45c6ab58___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__( /*! ./a.vue?vue&type=template&id=45c6ab58& */ "./src/a.vue?vue&type=template&id=45c6ab58&");
        (function () {
            api.rerender('45c6ab58', {
            render: _a_vue_vue_type_template_id_45c6ab58___WEBPACK_IMPORTED_MODULE_0__.render,
            staticRenderFns: _a_vue_vue_type_template_id_45c6ab58___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns
            })
        })(__WEBPACK_OUTDATED_DEPENDENCIES__);
        })
    }
    }
    // ...

    /***/
})
```

这段被注入用于处理模块热替换的代码，主要步骤有：

- 首次执行时，调用 `api.createRecord` 记录组件配置，`api` 为 `vue-hot-reload-api` 库暴露的接口；
- 执行 `module.hot.accept()` 语句，监听当前模块变更事件，当模块发生变化时调用 `api.reload`；
- 执行 `module.hot.accept("xxx.vue?vue&type=template&xxxx", fn)` ，监听 Vue 文件 template 代码的变更事件，当 template 模块发生变更时调用 `api.rerender`。

可以看到，`vue-loader` 对 HMR 的支持，基本上围绕 `vue-hot-reload-api` 展开，当代码文件发生变化触发 `module.hot.accept` 回调时，会根据情况执行 `vue-hot-reload-api` 暴露的 `reload` 与 `rerender` 函数，两者最终都会触发组件实例的 `$forceUpdate` 函数强制执行重新渲染。

另外，为什么这里需要调用两次 `module.hot.accept`？这是因为 `vue-loader` 在做转译时，会将 SFC 不同板块拆解成多个 module，例如 `template` 对应生成 `xxx.vue?vue&type=template` ；`script` 对应生成 `xxx.vue?vue&type=script`。因此，`vue-loader` 必须为这些不同的 module 分别调用 `accept` 接口，才能处理好不同代码块的变更事件
