# RN Fabric 渲染系统

Fabric 渲染器完成的主要任务还是将你声明的组件转换为最终原生 API 的调用，Fabric 渲染器的转换过程主要涉及到 3 棵树：

- Element Tree
  Element Tree 是在 JavaScript 侧，由 React 通过开发者书写的 JSX 创建而成的，它由若干个 Element 组成。一般而言，根节点 就是一个 Element，同时它也是棵 Element Tree。一个 Element 就是一个普通的对象，该对象描述的是组件的实例或宿主视图的实例。一棵 Element Tree 的每个节点都是一个 Element。React Element 有两种类型，一种是通过函数或类自定义的合成组件生成的，另一种是宿主组件生成的。其中，宿主组件指的框架通过 JavaScript 引擎暴露给 JavaScript 的原生组件。
- Fiber Tree
  Fiber Tree 是由若干个 Fiber 节点组成的，如果某个 Fiber 节点是通过用于描述宿主视图的 Element 生成的，那么该 Fiber 会对应一个同样的宿主视图。Fiber Tree 也可以看做 Element Tree 的映射，每次 render 的最小的渲染单位。同样，Fiber 节点也分两种，一种是由合成组件生成的 Element 所映射的 Fiber 节点，它没有对应的宿主组件的实例；一种是由宿主组件生成 Element 所映射的 Fiber 节点，它拥有对应的宿主组件实例。
- Shadow Tree
  Shadow Tree 是在 C++ 层创建的树，它由若干个 Shadow 节点组成。这些 Shadow 节点是在创建对应的拥有 stateNode 值的 Fiber 节点时，同步创建的。shadow Tree 不仅继承了由 JSX 所创建 Element Tree 的相关属性、父子节点关系，还新增了该视图如何在屏幕上进行布局的具体值。最后，在 Fabric 渲染器的 C++ 层，通过 Diff 算法对比更新前后的两棵 Shadow Tree，计算出更新视图的操作指令完成最终的渲染。

Fabric 渲染器实现将 JSX 渲染成原生视图的整体流程：

![rn-fabric渲染流程](/blog/images/mobile/rn-fabric渲染流程.png)

## 渲染流水线

React Native 渲染器通过一系列加工处理，将 React 代码渲染到宿主平台。这一系列加工处理就是渲染流水线（pipeline），它的作用是初始化渲染和 UI 状态更新。渲染流水线可大致分为三个阶段，并且渲染流水线的各个阶段可能发生在不同的线程中：

- 渲染（Render）：在 JavaScript 中，React 执行那些产品逻辑代码创建 React 元素树（React Element Trees）。然后在 C++ 中，用 React 元素树创建 React 影子树（React Shadow Tree）。
- 提交（Commit）：在 React 影子树完全创建后，渲染器会触发一次提交。这会将 React 元素树和新创建的 React 影子树的提升为“下一棵要挂载的树”。 这个过程中也包括了布局信息计算。
- 挂载（Mount）：React 影子树有了布局计算结果后，它会被转化为一个宿主视图树（Host View Tree）。

![rn-fabric-render](/blog/images/mobile/rn-fabric-render.png)

渲染流水线存在三种不同场景：

- 初始化渲染
- React 状态更新
- React Native 渲染器的状态更新

[RN 渲染流水线](https://reactnative.cn/architecture/render-pipeline)

## 跨平台

在上一代 React Native 渲染器中，React 影子树、布局逻辑、视图拍平算法是在各个平台单独实现的。当前的渲染器的设计上采用的是跨平台的解决方案，共享了核心的 C++ 实现。

React Native 团队计划将动画系统加入到渲染系统中，并将 React Native 的渲染系统扩展到新的平台，例如 Windows、游戏机、电视等等。

使用 C++ 作为核心渲染系统有几个要点。首先，单一实现降低了开发和维护成本。其次，它提升了创建 React 影子树的性能，同时在 Android 上，也因为不再使用 JNI for Yoga，降低了 Yoga 渲染引擎的开销，布局计算的性能也有所提升。最后，每个 React 影子节点在 C++ 中占用的内存，比在 Kotlin 或 Swift 中占用的要小。

React Native 团队还使用了强制不可变的 C++ 特性，来确保并发访问时共享资源即便不加锁保护，也不会有问题。

但在 Android 端还有两种例外，渲染器依然会有 JNI 的开销：

复杂视图，比如 Text、TextInput 等，依然会使用 JNI 来传输属性 props。
在挂载阶段依然会使用 JNI 来发送变更操作。
React Native 团队在探索使用 ByteBuffer 序列化数据这种新的机制，来替换 ReadableMap，减少 JNI 的开销。目标是将 JNI 的开销减少 35~50%。

渲染器提供了 C++ 与两边通信的 API：

- Fabric 与 React 通信。包括渲染（render） React 树和监听事件（event），比如 onLayout、onKeyPress、touch 等。
- Fabric 与宿主平台通信。括在屏幕上挂载（mount）宿主视图，包括 create、insert、update、delete 宿主视图，和监听用户在宿主平台产生的事件。

![rn-fabric-cross](/blog/images/mobile/rn-fabric-cross.png)

## 视图拍平

视图拍平（View Flattening）是 React Native 渲染器避免布局嵌套太深的优化手段。
React API 在设计上希望通过组合的方式，实现组件声明和重用，这为更简单的开发提供了一个很好的模型。但是在实现中，API 的这些特性会导致一些 React 元素会嵌套地很深，而其中大部分 React 元素节点只会影响视图布局，并不会在屏幕中渲染任何内容。这就是所谓的**只参与布局**类型节点。

从概念上讲，React 元素树的节点数量和屏幕上的视图数量应该是 1:1 的关系。但是，渲染一个很深的“只参与布局”的 React 元素会导致性能变慢。

举个很常见的例子，例子中“只参与布局”视图导致了性能损耗。

想象一下，你要渲染一个标题。你有一个应用，应用中拥有外边距 ContainerComponent的容器组件，容器组件的子组件是 TitleComponent 标题组件，标题组件包括一个图片和一行文字。React 代码示例如下：

```js
function MyComponent() {
  return (
    <View>                          // ReactAppComponent
      <View style={{margin: 10}} /> // ContainerComponent
        <View style={{margin: 10}}> // TitleComponent
          <Image {...} />
          <Text {...}>This is a title</Text>
        </View>
      </View>
    </View>
  );
}
```

React Native 在渲染时，会生成以下三棵树：

![rn-fabric-layout](/blog/images/mobile/rn-fabric-layout.png)

注意视图 2 和视图 3 是“只参与布局”的视图，因为它们在屏幕上渲染只是为了提供 10 像素的外边距。为了提升 React 元素树中“只参与布局”类型的性能，渲染器实现了一种视图拍平的机制来合并或拍平这类节点，减少屏幕中宿主视图的层级深度。该算法考虑到了如下属性，比如 margin, padding, backgroundColor, opacity等等。

视图拍平算法是渲染器的对比（diffing）阶段的一部分，这样设计的好处是我们不需要额外的 CPU 耗时，来拍平 React 元素树中“只参与布局”的视图。此外，作为 C++ 核心的一部分，视图拍平算法默认是全平台共用的。

在前面的例子中，视图 2 和视图 3 会作为“对比算法”（diffing algorithm）的一部分被拍平，而它们的样式结果会被合并到视图 1 中。虽然，这种优化让渲染器少创建和渲染两个宿主视图，但从用户的角度看屏幕内容没有任何区别。

![rn-fabric-layout2](/blog/images/mobile/rn-fabric-layout2.png)

