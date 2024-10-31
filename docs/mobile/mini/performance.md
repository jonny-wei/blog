# 小程序性能优化

## 性能优化

### 半编译模式

在节点数量增多到一定量级时，Taro3 的渲染性能会大幅下降，出现白屏时间长、交互延时等问题。经排查发现是目前 Taro 的 `<template>` 模板语法所造成的。CompileMode 适合长列表 Item 这类会被重复渲染多次的组件使用，在长列表场景能提升 30% 以上的首开速度，同时能有效减少节点过多时产生的交互延时问题。CompileMode 可以说是应对复杂页面性能优化的“银弹”。

CompileMode 在编译阶段对开发者的代码进行扫描，将 JSX 和 Vue template 代码提前编译为相应的小程序模板代码。这样可以减少小程序渲染层虚拟 DOM 树节点的数量，从而提高渲染性能。通过使用 CompileMode，可以有效减少小程序的渲染负担，提升应用的性能表现。

要最大限度的发挥半编译模式的优势，就是要把尽量把静态节点，尽可能的写到同一个 jsx 里面去。自我检查的最简单的方式就是看看编译后的模版数量是否足够少，每个模版是否包含了足够多节点。 如果一个 template 只是包含了少数节点，那其实无法带来很大的提升。可以结合半编译预处理，使用组件内的 render 开头的函数，进行模块化拆分

```js
const config = {
  mini: {
    experimental: {
      compileMode: true
    }
  }
  // ...
}
```

::: tip 参考
[半编译模式](https://docs.taro.zone/docs/next/complier-mode)
:::

### 优化初次渲染性能

如果初次渲染的数据量非常大，可能会导致页面在加载过程中出现一段时间的白屏，为了解决这个问题，Taro 提供了预渲染功能（Prerender）

```js
const config = {
  ...
  mini: {
    prerender: {
      match: 'pages/shop/**', // 所有以 `pages/shop/` 开头的页面都参与 prerender
      include: ['pages/any/way/index'], // `pages/any/way/index` 也会参与 prerender
      exclude: ['pages/shop/index/index'] // `pages/shop/index/index` 不用参与 prerender
    }
  }
};

module.exports = config
```

### 优化更新性能

由于 Taro 使用小程序的 template 进行渲染，这会引发一个问题：所有的 setData 更新都需要由页面对象调用。当页面结构较为复杂时，更新的性能可能会下降。

1. 全局配置项 baseLevel：DOM 结构超过 N 层后，会使用原生自定义组件进行渲染。N 默认是 16 层，可以通过修改配置项 baseLevel 修改 N，例如设置成 8 或者 4。
2. CustomWrapper 组件：创建一个原生自定义组件，对后代节点的 setData 将由此自定义组件进行调用，达到局部更新的效果。使用它去包裹遇到更新性能问题的模块，提升更新时的性能。

### 优化长列表性能

Taro 提供了 VirtualList 组件和 VirtualWaterfall 组件。它们的原理是只渲染当前可见区域（Visible Viewport）的视图，非可见区域的视图在用户滚动到可见区域时再进行渲染，以提高长列表滚动的流畅性。

### 跳转预加载

在小程序中，从调用 Taro.navigateTo 等路由跳转 API 后，到小程序页面触发 onLoad 会有一定延时，因此一些网络请求可以提前到发起跳转的前一刻去请求。Taro 3 提供了 Taro.preload API，可以把需要预加载的内容作为参数传入，然后在新页面加载后通过 `Taro.getCurrentInstance().preloadData` 获取到预加载的内容。

### 避免 setData 数据量较大

对小程序性能的影响较大的主要有两个因素，即 setData 的数据量和单位时间内调用 setData 函数的次数。在 Taro 中，会对 setData 进行**批量更新**操作，因此通常只需要关注 setData 的**数据量大小**。下面通过几个例子来说明如何避免数据量过大的问题：

1. 删除楼层节点要谨慎处理

如果待删除节点的兄弟节点的 DOM 结构非常复杂，比如一个个楼层组件，删除操作的副作用会导致 setData 的数据量变大，从而影响性能。通过隔离删除操作来进行优化：

```js
<View>
  <!-- 轮播 -->
  <Slider />
  <!-- 商品组 -->
  <Goods />
  <!-- 模态弹窗 -->
  {isShowModal && <Modal />}
</View>

// 优化后
<View>
  <!-- 轮播 -->
  <Slider />
  <!-- 商品组 -->
  <Goods />
  <!-- 模态弹窗 -->
  <View>
    {isShowModal && <Modal />}
  </View>
</View>
```

2. 基础组件的属性要保持引用

当基础组件（例如 View、Input 等）的属性值为非基本类型时，每次渲染时，React 会对基础组件的属性进行浅比较。如果发现 markers 的引用不同，就会触发组件属性的更新。这最终导致了 setData 操作的频繁执行和数据量的增加。为了解决这个问题，可以使用状态（state）或闭包等方法来保持对象的引用，从而避免不必要的更新：

```js
<Map
  latitude={22.53332}
  longitude={113.93041}
  markers={[
    {
      latitude: 22.53332,
      longitude: 113.93041,
    },
  ]}
/>

// 优化后
<Map
  latitude={22.53332}
  longitude={113.93041}
  markers={this.state.markers}
/>
```

3. 基础组件不要挂载额外属性

基础组件（如 View、Input 等）如若设置了非标准的属性，目前这些额外属性会被一并进行 setData，而实际上小程序并不会理会这些属性，所以 setData 的这部分数据是冗余的。

例如 Text 组件的标准属性有 selectable、user-select、space 、decode 四个，如果我们为它设置一个额外属性 something，那么这个额外的属性也是会被 setData。

## 编译优化

### 分包优化

在开发小程序时，Taro 编译器依赖 SplitChunksPlugin 插件抽取公共文件，默认主包、分包依赖的 module 都会打包到根目录 vendors.js 文件中（有一个例外，当只有分包里面有且只有一个页面依赖 module 时，会打包到分包中依赖页面源码中），直接影响到小程序主包大小，很容易超出 2M 的限制大小。

那么应该如何对分包公共依赖的进行抽取，减少主包大小呢？

在打包时通过继承 SplitChunksPlugin 进行相关 module 依赖树分析，过滤出主包中无依赖但分包独自依赖的 module 提取成 sub vendor chunks，过滤出主包中无依赖但多个分包共同依赖的 module 为 sub common chunks，利用 SplitChunksPlugin 的 cacheGroup 功能，将相关分包依赖进行文件 split。

### 依赖预加载

通过 webpack5 可以预先把项目的 node_modules 依赖打包为一个模块联邦（Module Federation） remote 应用，再次编译时 Webpack 则无需再对依赖进行编译，从而提升编译速度。

Taro 参考 Vite 使用了 esbuild 收集用户使用到的第三方依赖，并分别进行打包。打包后的模块会作为 Webpack 的 entry，最终打包为模块联邦 Remote 应用，供主应用（Host）消费。

```js
/** config/index.js */
const config = {
  compiler: {
    type: 'webpack5',
    // 仅 webpack5 支持依赖预编译配置
    prebundle: {
      enable: true,
    },
  },
}
```

::: warning 参考文献
[高性能小程序的最佳实践](https://mp.weixin.qq.com/s/8yi7TI_2xIXROA4u-WypWw)

[京东小程序-LBS业务场景的性能提升](https://mp.weixin.qq.com/s/yTAQwoq-MMlKYbsOFJYioQ)
:::
