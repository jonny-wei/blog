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

## 问题

### Q1. RN 与 React 的区别？

React Native 和 React 在底层渲染原理上有一些关键的区别，这些区别主要体现在它们如何处理 UI 渲染和与原生平台的交互。

1. **渲染目标**：
   - **React**：React 是为 Web 开发设计的，它通过虚拟 DOM 来渲染浏览器中的 DOM 元素。它允许 React 通过比较新旧虚拟 DOM 树来高效地更新实际的 DOM。
   - **React Native**：React Native 用于移动应用开发，它不使用虚拟 DOM，而是将 JavaScript 组件直接映射到原生平台的 UI 组件。这意味着 React Native 的渲染目标是 iOS 的 UIView 或 Android 的 View 等原生组件，而不是 Web 的 DOM 元素。

2. **桥接层**：
   - **React**：React 没有 RN 那样的桥接层，因为它直接与浏览器的 DOM API 交互。
   - **React Native**：React Native 有一个 JavaScript 到原生的桥接层，它允许 JavaScript 代码调用原生模块和组件。这个桥接层是 React Native 特有的，React 没有这样的桥接层。例如，React Native 中的 `<View>` 组件最终会通过桥接层渲染为原生平台的 `<UIView>` 或 `<ViewGroup>`。
  
3. **渲染原理**：
   - **React**：当组件的状态（state）或属性（props）发生变化时，React 会触发组件的重新渲染。React 会使用当前的状态和属性来构建一个新的虚拟 DOM 树。React 会将新的虚拟 DOM 树与旧的虚拟 DOM 树进行比较。找出两棵树之间的差异，即哪些元素被添加、删除或修改了。React 通过构建一个待执行更新的副作用列表，然后在一个单独的阶段执行这些副作用，批量处理 DOM 更新。在副作用执行阶段，React 会更新实际的 DOM，调用生命周期方法，如 componentDidUpdate，以及处理状态更新引起的任何副作用。
   - **React Native**：React Native 的渲染流程包括三个阶段：渲染（Render）、提交（Commit）和挂载（Mount）。在渲染阶段，React 创建 React 元素树，然后通过 Fabric 渲染器创建 React 影子树。在提交阶段，React 影子树被提升为下一棵要挂载的树，并计算布局信息。在挂载阶段，React 影子树被转化为宿主视图树（Host View Tree），即原生平台的 UI 组件树。

4. **性能优化**：
   - **React**：React 中的性能优化通常涉及到减少不必要的 DOM 操作，使用 shouldComponentUpdate、React.memo、useMemo 和 useCallback 等来防止不必要的组件重新渲染。React 还通过事件池技术复用事件对象，减少了内存分配和垃圾回收的压力。
   - **React Native**：在 React Native 中，性能优化可能涉及到原生层面的优化，如利用原生模块和原生 UI 渲染。React Native 也支持使用 shouldComponentUpdate 以及 Hooks 来进行性能优化。此外，React Native 的新架构 Fabric 提供了更好的宿主平台互操作性，性能提升，以及更快的启动速度。

5. **事件处理**：
   - **React**：React 使用合成事件系统，这意味着它在 document 层面统一处理事件，而不是在每个具体的 DOM 元素上。这样可以减少内存消耗并提升性能，同时解决了跨浏览器的兼容性问题。
   - **React Native**：React Native 使用的是原生事件处理系统，它直接与移动设备的事件系统交互。React Native 提供了类似于原生平台的事件处理机制，支持“冒泡”和“下沉”两个方向的事件处理，类似于 Android Native 的 NestedScrolling。由于 React Native 的异步通信和执行机制，所有回调函数都在 JS 线程中处理，而不是在 Native 的 UI 线程中

React Native 和 React 在设计理念和实现细节上存在一些关键的区别，尤其是在渲染原理和与原生平台的交互方面。

首先，React Native 允许开发者使用 React 的编程模型来开发原生移动应用。这意味着，虽然开发者使用 JavaScript 和 React 的组件系统来构建用户界面，但这些界面并不是运行在浏览器中，而是直接渲染为 iOS 和 Android 的原生 UI 组件。这种能力是通过 React Native 的桥接层实现的，它允许 JavaScript 代码与原生平台进行通信，调用原生模块和组件。

在渲染流程上，React Native 通过 JSX 编译成 JavaScript 代码，然后在 JavaScript 线程中执行。与 React 不同的是，React Native 不使用虚拟 DOM。相反，它使用一个称为“影子树”（Shadow Tree）的概念，这是一个 C++ 表示的树，模拟了 React 组件树的结构。React Native 使用 Facebook 自己的 Yoga 布局引擎来计算布局，然后将这些信息发送到原生 UI 线程，最终转化为屏幕上的原生视图。

React Native 的渲染流水线可以分为三个阶段：渲染（Render）、提交（Commit）和挂载（Mount）。在渲染阶段，React 创建 React 元素树，并在 C++ 中创建对应的 React 影子树。提交阶段包括布局信息的计算，并将 React 元素树提升为下一棵要挂载的树。挂载阶段则是将包含布局计算数据的 React 影子树转化为宿主视图树，这个过程涉及到实际的原生视图创建和配置。

React Native 还引入了新的架构，如 Fabric，它改变了线程模型，允许在任意线程上同步调用 JavaScript 进行 UI 更新，同时将低优先级工作推出主线程，保持对 UI 的响应。这种新架构还引入了异步渲染能力和简化的 JSBridge，提升了性能。

总的来说，React Native 的渲染原理涉及到将 React 组件转换为原生 UI 组件的多个步骤，包括 JavaScript 执行、影子树的创建、布局计算、以及通过 UIManager 进行原生视图的创建和更新。这个过程中，React Native 利用了 JavaScript Bridge、Yoga 布局引擎和 UIManager 等关键组件，以实现跨平台的高效渲染。随着新架构的引入，React Native 的性能和开发体验得到了进一步的提升。

### Q2. RN 与原生开发有什么区别？

React Native 和原生开发在构建移动应用时有一些显著的区别。以下是两者的对比：

1. **开发语言和框架**：
   - 原生开发通常使用平台特定的编程语言，如 iOS 的 Swift 或 Objective-C，Android 的 Java 或 Kotlin。这意味着开发者需要为每个平台学习不同的语言和使用不同的开发工具，如 Xcode 对于 iOS 和 Android Studio 对于 Android。
   - React Native 允许开发者使用 JavaScript 和 React 框架来构建应用，这使得 Web 开发者也能参与到移动应用的开发中，且代码可以在 iOS 和 Android 之间共享，减少了开发和维护成本。

2. **渲染更新**：
   - React Native 使用 JavaScript 来构建应用，并通过桥接层将 JavaScript 组件转换为原生组件。更新时，React Native 会重新渲染组件并使用原生平台的渲染器进行展示。
   - 原生开发直接操作设备的原生组件，没有中间层。当状态更新时，原生开发通常是直接修改 UI 组件的属性或状态，触发界面的重绘。

3. **性能**：
   - 原生应用通常能够提供最佳的性能和用户体验，因为它们直接访问设备的硬件和软件特性，没有额外的渲染层或桥接开销。
   - React Native 也提供了接近原生应用的性能，因为它使用原生组件来渲染 UI。然而，对于一些复杂的动画和交互，React Native 可能需要额外的优化来匹配原生应用的性能。

4. **开发效率和维护**：
   - 原生开发可能需要更长的时间来开发和维护，因为需要为每个平台单独编写代码。
   - React Native 提供了更高的开发效率，尤其是在需要在多个平台上发布应用时。它还支持热重载功能，允许开发者实时查看代码更改的效果，加快了开发迭代的速度。

5. **UI组件与动画**：
   - 原生开发使用各自平台的 UI 组件和库，这意味着开发者可以创建完全符合平台设计指南的应用。原生开发利用平台的动画框架，如 iOS 的 Core Animation，可以轻松实现复杂的动画效果，通常有更好的性能。
   - React Native 提供了一套自己的组件，这些组件映射到原生平台的 UI 组件。这使得在不同平台之间保持一致的用户体验变得更容易，但可能不如纯原生开发那样灵活。React Native 的动画可以通过原生动画库或者 JavaScript 实现，但可能需要更多的配置和优化来达到原生的流畅度

6. **可扩展性和原生模块集成**：
   - 原生开发可以轻松集成任何原生模块和第三方库，因为它们都是为特定平台设计的。
   - React Native 也支持集成原生模块，但这可能需要额外的工作来创建桥接层，以便 JavaScript 代码可以调用原生代码。

7. **社区和生态系统**：
   - 原生开发有着成熟的社区和大量的资源，包括第三方库、教程和工具。
   - React Native 拥有一个活跃的社区和不断增长的生态系统，得到了 Facebook 和其他大公司的支持。

8. **应用大小和内存占用**：
   - React Native 应用可能比纯原生应用有更大的安装包，因为它们需要包含 JavaScript 引擎和 React Native 框架。
   - 原生应用通常有更小的安装包，因为它们直接编译成机器代码，不需要额外的运行时环境。

9. **动态化能力**：
    - React Native 提供了较强的动态化能力，允许在运行时动态加载和执行代码，这意味着可以无需重新发布应用即可更新应用内容。这种能力使得React Native非常适合需要快速迭代和频繁更新的应用场景。
    - 原生开发通常不具备这种热更新能力。原生应用的更新通常需要通过应用商店的审核流程，这意味着更新速度较慢，无法实现即时更新。
10. **跨平台开发**
    - React Native 允许使用一套代码同时在 iOS 和 Android 平台上运行，这减少了开发成本，提高了开发效率。
    - 原生开发通常需要为每个平台单独开发，这不仅增加了开发成本，也增加了维护成本。

### Q3. RN 性能优化？

使用 React Native 开发应用的主要优势之一是能够达到每秒 60 帧的流畅度，提供类似原生应用的体验。React Native 已经进行了优化以实现这一目标，但仍然存在一些需要手动优化的地方。

- 应用的流畅度和真实感直接受每秒显示的帧数影响。iOS 设备提供了每秒 60 帧的帧率，意味着 UI 系统有大约 16.67ms 的时间来完成生成一张静态图片（帧）所需的所有工作。
- 如果在分配的时间内未能完成这些工作，就会导致界面不够流畅。
- React Native 应用有两个不同的帧率：JS 帧率（JavaScript 线程）和 UI 帧率（主线程）。

#### 性能问题的常见原因

- **开发模式 (`dev=true`)**：开发模式下 JavaScript 线程的性能较差，因为需要执行额外的工作，如警告和错误信息、属性类型检查等。
- **console.log 语句**：在发布版本中，控制台打印语句可能会拖累 JavaScript 线程。
- **ListView 首次渲染缓慢或滑动缓慢**：使用 `FlatList` 或 `SectionList` 替代，它们在性能方面有显著提升。
- **重绘页面时 JS 帧率降低**：通过实现 `shouldComponentUpdate` 或使用 `PureComponent` 来减少不必要的重绘。
- **大量工作在 JavaScript 线程上执行**：使用 `InteractionManager` 或 `LayoutAnimation` 来优化。
- **UI 线程掉帧**：使用 `shouldRasterizeIOS` 或 `renderToHardwareTextureAndroid` 来改善透明合成导致的掉帧问题。
- **改变图片尺寸时 UI 线程掉帧**：使用 `transform: [{scale}]` 来改变图片尺寸，而不是直接修改宽度或高度。
- **Touchable 系列组件响应不佳**：将 `onPress` 处理函数中的操作封装到 `requestAnimationFrame` 中。

#### 优化编译速度

构建 React Native 应用可能会非常耗时，以下是一些建议来改善构建时间：

- **仅在开发过程中构建一个 ABI（仅限 Android）**：使用 `--active-arch-only` 标志减少原生编译时间。
- **使用编译器缓存**：使用 `ccache` 来缓存本地构建编译过程，减少重复编译的时间。对于 CI 构建，可以使用分布式缓存如 `sccache`。

#### 列表配置优化

使用 `FlatList` 组件时，以下是一些提升性能的技巧：

- **removeClippedSubviews**：减少主线程时间，降低丢帧风险。
- **maxToRenderPerBatch**：控制每批渲染的元素数量，减少视觉上的空白区域。
- **updateCellsBatchingPeriod**：设置两次批量渲染之间的延迟，控制渲染节奏。
- **initialNumToRender**：定义初始渲染的元素数量，提升初始渲染性能。
- **windowSize**：控制预渲染的列表项数量，平衡内存消耗和滚动时的空白区域。

#### 优化 JavaScript 加载

- **使用 Hermes**：Hermes 是 React Native 的默认 JavaScript 引擎，它优化了代码加载。
- **延迟加载大型组件**：使用 `React.lazy` 和 `Suspense` 来延迟加载大型组件，直到它们首次需要渲染。
- **内联调用 `require`**：有时，希望将一些代码的加载推迟到第一次使用时，而不是使用 `lazy` 或异步的 `import()`。可以通过在文件顶部本来会静态使用 import 的地方，改用 require() 函数来实现这一点。
- **代码分割**：使用 `import()` 语法来实现代码分割，按需加载组件和模块，减少应用的初始加载时间。
- **优化图片资源**：使用合适的图片格式：比如使用 WebP 格式，它通常比 PNG 或 JPEG 更小，加载更快。使用图片懒加载，在长列表或滚动视图中，只加载可视区域内的图片。
- **减少不必要的渲染**：对于函数组件，使用 React.memo 、useMemo、useCallback 等来防止不必要的渲染。对于类组件，通过实现 shouldComponentUpdate 来控制组件的更新。
- **复杂计算**：对于复杂的计算任务，可以使用 Web Workers 在后台线程中处理，避免阻塞主线程。
- **优化字体加载**：避免在应用中加载过多的字体文件，只加载必要的字体。在字体加载完成之前，使用 fallback 字体来显示文本，避免闪屏

#### 性能分析

- **使用 Perf Monitor**：通过开发者菜单中的 `Show Perf Monitor` 来监控应用的性能。
- **使用 Chrome 分析器**：在 Chrome 的 `Performance` 标签下运行分析器，获取 JavaScript 线程的瓶颈信息。
- **使用 `systrace`**：对于 Android，使用 `systrace` 工具来分析 UI 性能，识别渲染过程中的时间消耗。
- **识别问题**：通过分析工具识别是 JavaScript 问题还是原生 UI 问题，并针对性地优化。
