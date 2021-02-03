# 微前端

[前端微服务化解决方案](https://alili.tech/archive/ea599f7c/)

[每日优鲜供应链前端团队微前端改造](https://juejin.cn/post/6844903943873675271#heading-0)

[闲庭信步聊前端 - 见微知著微前端](https://juejin.cn/post/6911873800669757447)

[微前端：未来前端开发的新趋势](https://github.com/xitu/gold-miner/blob/master/TODO1/micro-frontends-1.md)

微前端架构具备以下几个核心价值：

- 技术栈无关。主框架不限制接入应用的技术栈，微应用具备完全自主权

- 独立开发、独立部署。微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新

- 增量升级。在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略

- 独立运行时。每个微应用之间状态隔离，运行时状态不共享

qiankun 特点

- 基于 single-spa 封装，提供了更加开箱即用的 API。
- 技术栈无关，任意技术栈的应用均可 使用/接入，不论是 React/Vue/Angular/JQuery 还是其他等框架。
- HTML Entry 接入方式，让你接入微应用像使用 iframe 一样简单。
- 样式隔离，确保微应用之间样式互相不干扰。
- JS 沙箱，确保微应用之间 全局变量/事件 不冲突。
- 资源预加载，在浏览器空闲时间预加载未打开的微应用资源，加速微应用打开速度。
- umi 插件，提供了 @umijs/plugin-qiankun 供 umi 应用一键切换成微前端架构系统。

qiankun@2.0 新功能
- 支持多应用并行及多实例沙箱
- 支持手动 加载/卸载 微应用
- 支持 IE11 沙箱兼容
- 官方的极简微应用通信方案
- 支持基于 Shadow DOM 的样式隔离

## 踩坑

### 样式与事件监听污染

样式隔离也是微前端面临的一个重要问题，在 qiankun@1.x  中，支持了微应用之间的样式隔离（仅沙箱开启时生效），但尚存一些问题：

- 主子应用之间的样式隔离依赖手动配置插件处理
- 多应用场景下微应用之间的样式隔离亟待处理

为此，引入了一个新的选项，`sandbox: { strictStyleIsolation?: boolean }` 。在该选项开启的情况下，会以 `Shadow DOM` 的形式嵌入微应用，以此来做到应用样式的真正隔离。

在开启 strictStyleIsolation 时，我们会将微应用插入到 qiankun 创建好的 Shadow Tree 中，微应用的样式（包括动态插入的样式）都会被挂载到这个 Shadow Host 节点下，因此微应用的样式只会作用在 Shadow Tree 内部，这样就做到了样式隔离。

但是开启 Shadow DOM 也会引发一些别的问题：

一个典型的问题是，一些组件可能会越过 Shadow Boundary 到外部 Document Tree 插入节点，而这部分节点的样式就会丢失；比如 antd 的 Modal 就会渲染节点至 ducument.body ，引发样式丢失；针对刚才的 antd 场景你可以通过他们提供的 ConfigProvider.getPopupContainer API 来指定在 Shadow Tree 内部的节点为挂载节点，但另外一些其他的组件库，或者你的一些代码也会遇到同样的问题，需要你额外留心。

此外 Shadow DOM 场景下还会有一些额外的事件处理、边界处理等问题。

在 qiankun@2.2.2版本之前，qiankun 只能解决子应用之间的样式相互污染，不能解决子应用与主应用的样式相互污染。子应用切换到主应用时，会出现样式丢失问题和事件监听不生效问题。在具有路由懒加载的 Vue 子应用之间互相切换，懒加载组件的样式不会重建。路由懒加载的子应用(异步加载的组件)，多次切换时也同样会出现样式丢失问题。

原因：子应用跳转时，子应用的卸载需要一点点时间，在这段时间内主项目加载了，插入了 css，但是被子项目的 css 沙箱记录了，连同子项目一同卸载移除了。换句话说，主应用样式丢失的问题跟子应用卸载的时机有关系：当切换子应用时，当前子应用沙箱环境还未被卸载，但主应用 css 已被插入，当卸载时会连带主应用 css 一起被清除。在 `<head></head>` 能看到。主项目事件监听也是一样的，所以需要在子项目卸载完成后再跳转。

css 样式隔离常用的方式：

- css 前缀
- css Module
- 动态加载/卸载样式表

qiankun 中的 css 沙箱机制采用 **动态加载/卸载样式表**。重写 HTMLHeadElement.prototype.appendChild 和 window.addEventListener 事件，当子应用加载时，在 head 插入 `style/link` ; 当卸载时，直接移除。

但是，无法解决多个子项目同时运行时的 css 污染，以及子项目对主项目的 css 污染。

js 沙箱只劫持了 window.addEventListener，使用 document.body.addEventListener 或者 document.body.onClick 添加的事件并不会被沙箱移除，会对其他的页面产生影响，请在 unmount 周期清除。

解决办法：我原本想在路由钩子函数里面判断下，子项目是否卸载完成，卸载完成再跳转路由，然而路由不跳转，子项目根本不会卸载。临时解决办法是先复制一下 HTMLHeadElement.prototype.appendChild 和 window.addEventListener ，路由钩子函数 beforeEach 中判断一下，如果当前路由是子项目，并且去的路由是父项目的，则还原这两个对象。

```js
const isChildRoute = path => childRoute.some(item => path.startsWith(item))
const rawAppendChild = HTMLHeadElement.prototype.appendChild;
const rawAddEventListener = window.addEventListener;

router.beforeEach((to, from, next) => {
  // 从子项目跳转到主项目
  if(isChildRoute(from.path) && !isChildRoute(to.path)){
    HTMLHeadElement.prototype.appendChild = rawAppendChild;
    window.addEventListener = rawAddEventListener;
  }
  next();
});
```

针对项目搭建上的一些思考与优化，可借鉴[使用mono-repo实现跨项目组件共享](https://mp.weixin.qq.com/s/-A3Yg2TX4fCkkx9vXgREFA)

::: warning 参考文献
[Micro Frontends](https://micro-frontends.org/)

[qiankun 技术圆桌](https://www.yuque.com/kuitos/gky7yw)

[说说JS中的沙箱](https://juejin.cn/post/6844903954074058760)

[解密微前端：从qiankun看沙箱隔离](https://juejin.cn/post/6896643767353212935)

[解密微前端：从qiankun看子应用加载](https://juejin.cn/post/6891888458919641096)

[qiankun 2.x 运行时沙箱 源码分析](https://juejin.cn/post/6885214342552223757)

[微前端框架 之 qiankun 从入门到源码分析](https://juejin.cn/post/6885211340999229454#heading-32)

[qiankun 微前端原理与实践](https://juejin.cn/post/6902212398841593869)

[基于 qiankun 的微前端最佳实践](https://juejin.cn/post/6844904115999342600)

[微前端连载](https://juejin.cn/post/6846687602439897101#heading-28)

[微前端架构推进参考资料汇总](https://github.com/iuap-design/blog/issues/382)

[qiankun 微前端方案实践及总结](https://juejin.cn/post/6844904185910018062#heading-0)

[使用mono-repo实现跨项目组件共享](https://mp.weixin.qq.com/s/-A3Yg2TX4fCkkx9vXgREFA)

[项目级 monorepo 策略最佳实践](https://juejin.cn/post/6924854598268108807#heading-2)

[qiankun 官网常见问题](https://qiankun.umijs.org/zh/faq)
:::