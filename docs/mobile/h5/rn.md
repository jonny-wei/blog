# RN 新架构

从 0.68 版本开始，React Native 提供了新架构，它为开发者提供了构建高性能和响应式应用的新功能。

- 为何要设计新架构？
- 新架构带来哪些功能？
- 新架构优势是什么，带来哪些收益？

## 旧架构

### 旧架构下的机制

下面从线程模型角度，先回顾一下 RN 的运行机制：

![cross3](/blog/images/mobile/cross3.png)

- **UI 主线程**：应用的主线程，单线程。主要负责原生渲染和调用原生能力，用于处理原生控件的绘制。JavaScript 线程将 UI 更新指令发送到原生模块，原生模块再将这些指令传递给 UI 线程进行实际的渲染。与 JavaScript 线程是分离的，因此即使 JavaScript 线程被阻塞，UI 线程仍然可以继续处理动画和其他视觉效果。
- **JS 线程**：应用执行的核心线程，单线程。主要解释执行 JS 代码。在大多数情况下，`react native` 使用的 js 引擎是 `JSC`(JavaScriptCore) ；在使用 chrome 调试时，所有的 js 代码都运行在 chrome 中，并且通过 `websocket` 与原生代码通信。此时的运行环境是 `v8`。负责执行所有的 JavaScript 代码。所有的 React 组件生命周期方法、事件处理函数、状态更新等都在这个线程上运行，如果某个任务耗时较长，会阻塞整个线程，导致应用卡顿。
- **Shadow 线程**：主要用于构建 JS 与原生控件的布局镜像数据。渲染界面的重要步骤就是布局，布局需要知道每个组件应该渲染到什么位置，这个过程是通过 `yoga` 去实现的，这是一个基于 `flexbox` 的跨平台布局引擎。`shadow thread` 会维护一个 `shadow tree` 来计算我们的各个组件在 native 页面的实际布局，然后通过 `bridge` 通知 `native thread` 渲染 ui。Yoga 引擎可以在**原生线程上运行，而不是在 JavaScript 线程上运行**，从而减轻 JavaScript 线程的负担。
- **Native Modules 线程**：多线程。提供原生能力，处理原生模块的调用。iOS 端通过 `GCD` 实现，Android 端通过 `AsyncTask` 实现。

ReactNative 的运行机制通过 JavaScript 引擎、Bridge、Native Modules、UIManager 和 Shadow Tree 等组件的协同工作，实现了高效的跨平台应用开发。在应用启动时，ReactNative 会初始化一个 `ReactInstanceManager`，该管理器负责创建和管理 React 应用的实例，加载 JavaScript 代码并初始化 Bridge。`ReactInstanceManager` 会通过 `JavaScriptExecutor` 加载 JavaScript 代码，例如从本地文件系统或网络加载，然后创建一个 `CatalystInstanceImpl`，负责 JavaScript 代码的加载和执行，以及 Bridge 的初始化。`CatalystInstanceImpl` 会创建一个 `NativeToJsBridge`，用于处理 JavaScript 和原生代码之间的通信，并通过 `ReactPackage` 注册所有需要的 `Native Modules` 和 `Views`。

Native Modules 是用原生语言编写的模块，提供了 JavaScript 代码可以调用的 API，每个 Native Module 都是一个 ReactContextBaseJavaModule 的子类。开发者需要创建一个 ReactPackage，并在其中注册所需的 Native Modules 和 Views，ReactInstanceManager 会调用 createNativeModules 方法，获取所有注册的 Native Modules，并将这些模块注入到 JavaScript 环境中，JavaScript 代码可以通过全局对象 NativeModules 访问这些模块。

UIManager 是一个特殊的 Native Module，负责处理 UI 相关的操作，如创建、更新和删除视图。JavaScript 代码通过 UIManager.createView 方法创建一个新的视图，通过 UIManager.updateView 方法更新视图的属性，通过 UIManager.measure 方法获取视图的尺寸和位置。UIManager 在 JavaScript 环境中使用的代理对象，通过 Bridge 调用 UIManagerModule 的方法。

Shadow Tree 是一个虚拟的 UI 树，用于管理和优化 UI 更新。JavaScript 代码通过 ReactNativeRenderer 构建一个虚拟的 UI 树，当 UI 需要更新时，ReactNative 会计算新的 Shadow Tree 与现有 Shadow Tree 之间的差异，差异信息通过 Bridge 发送到 UIManagerModule，UIManagerModule 应用这些差异，更新原生视图。Shadow Tree 由 ShadowNode 表示，包含节点的属性和布局信息，ShadowNodeRegistry 管理所有 ShadowNodes 的注册表。

原生渲染是将 Shadow Tree 的变化应用到实际的原生视图上，UIManagerModule 会调用相应的 ViewManager 创建原生视图，并调用 ViewManager 的方法更新视图的属性和布局，更新后的视图会被添加到 ReactRootView 中，最终显示在屏幕上。ReactRootView 包含整个 React 应用的根视图。

ReactNative 通过多种方式优化性能，包括批量更新和异步处理。NativeToJsBridge 会将多个 JavaScript 调用批处理成一个批次，减少与原生环境的交互次数，UI 更新通常是异步执行的，不会阻塞 JavaScript 线程，确保应用的响应性。综上所述，ReactNative 的运行机制通过在 JavaScript 环境与原生环境之间建立一座 Bridge，使得前端开发者能够利用熟悉的 React 技术栈来开发跨平台的应用，同时保持良好的性能和用户体验。

### 旧架构的问题

![rn1](/blog/images/mobile/rn1.png)

React Native 以 React 技术为开发基础，通过 Metro 捆绑器打包成最终目标代码文件 JS Bundle。JS Bundle 运行在 JavaScriptCore 执行引擎，通过 Bridge 传递布局及相关渲染数据。最后，由 Yoga 进行与 Native UI 模块管理布局和渲染的工作。

旧的架构通过使用一个叫做桥（Bridge）的组件将所有必须从 JS 层传递到 native 层的数据序列化来工作。桥可以被想象成一条总线，生产者层为消费者层发送一些数据。消费者可以读取数据，将其反序列化并执行所需的操作。但是 Bridge 有一些固有的限制：

- 异步：某个层将数据提交给桥，再异步地"等待"另一个层来处理它们，即使有时候这并不是真正必要的。
- 单线程：JS 是单线程的，因此发生在 JS 中的计算也必须在单线程上进行。
- 额外的开销：每当一个层必须使用另一个层时，它就必须序列化一些数据。另一层则必须对其进行反序列化。这里选择的格式是 JSON，因为它的简单性和人的可读性，但尽管是轻量级的，它也是有开销的。

对于简单的 Native API 调用来说性能还能接受，而对于 UI 来说，每次的操作都是需要通过 bridge 的，包括高度计算、更新等，且 bridge 限制了调用频率、只允许异步操作，导致一些前端的更新很难及时反应到 UI 上，特别是类似于滑动、动画，更新频率较高的操作，所以经常能看到白屏或者卡顿。此外还有其他一些问题：

- 无法使用 React 新特性，例如异步更新并发渲染、更细粒度的 DOM 更新机制、Suspense等新功能，以及更容易实现 React Native 的服务端渲染。
- 布局计算效率低。旧的 UIManager 在处理复杂的布局计算时效率较低，尤其是在大型应用中。
- 需要更好的模块化。原架构的代码耦合度较高，增加了维护和扩展的难度。所有 Native Modules 在应用启动时都会被加载，增加了启动时间和内存占用

[React Native 原跨端通信机制设计](https://mp.weixin.qq.com/s/8R9S4C5Av5-C09wC7Cjzgw)

## 新架构

- JSI，新通信机制，JSI 是一个接口，允许 JavaScript 对象持有对 C++ 的引用，反之亦然。
- Turbo Modules，新的原生模块体系，一个支持与原生代码高效、灵活集成的框架。
- Fabric 渲染器和组件，它提供了更好的功能、跨平台的一致性和渲染性能。
- Codegen，它通过 JavaScript 的静态类型化，生成新架构所需的 C++ 模板。
- Hermes，使用新的 JavaScript 引擎、采用了 Hades 的全新并发 GC，更快的启动时间和更小的内存。
- 其他优化和支持：互操作层( Interop Layers )、更完善的 React 新特性支持、支持 Tailwind、更友好的 Devtools等

### JSI 接口

JavaScript 接口（JSI）：JSI 是一个接口，允许 JavaScript 对象持有对 C++ 的引用，反之亦然。一旦一个对象拥有另一个对象的引用，它就可以直接调用该对象的方法。例如一个 C++ 对象现在可以直接调用一个 JavaScript 对象在 JavaScript 环境中执行一个方法，反之亦然。任何当前使用 Bridge 在 JavaScript 和原生端之间进行通信的原生模块都可以通过用 C++ 编写一个简单的层来转换为 JSI 模块。

这个想法可以带来几个好处：

- **同步执行**：现在可以同步执行那些本来就不应该是异步的函数。
- **并发**：可以在 JavaScript 中调用在不同线程上执行的函数。
- **更低的开销**：新架构不需要再对数据进行序列化/反序列化，因此可以避免序列化的开销。
- **代码共享**：通过引入 C++，现在有可能抽象出所有与平台无关的代码，并在平台之间轻松共享它。
- **类型安全**：为了确保 JS 可以正确调用 C++ 对象的方法，反之亦然，因此增加了一层自动生成的代码。这些代码必须通过 Flow 或 TypeScript 类型化的 JS 规范来生成。

通过 JSI，JS 对象可以直接获得 C++ 对象(Host Objects)引用，并调用对应方法。另外 JSI 与 React 无关，可以用在任何JS 引擎 V8、Hermes。有了 JSI，JS 和 Native 就可以直接通信了（`JS -> JSI -> C++ -> ObjectC/Java`），使得像 VisionCamera 这样处理实时帧的库能够高效运行，消除大量序列化的开销。这些优势是 TurboModule 系统的基础，也是进一步增强功能的跳板。例如，我们有可能开发出一种新的渲染器，它的速度更快，性能更强：Fabric及其 Fabric 组件，Fabric 使用它在 Fabric 的 C++ 核心和 React 之间进行通信。

虽然 JSI 使得每个 API 更加独立化，不再全部依赖 Native Module，但这也带来了另外一个问题，相比以前的设计更复杂了，设计一个 API，开发者需要封装 JS、C++、JNI、Java 等一套接口。所以在设计 JSI 的时候，提供了一个 `Codegen` 模块，帮忙大家完成基础代码和环境的搭建。

JSI 属于 JavaScript 接口，它是一个统一的轻量级通用 API，理论上适用于任何 JavaScript 虚拟机，并且它采用 C++ 实现，让 JS 可以使用它直接执行或者调用 Native 代码，所以它的作用就是让 JavaScript 接口与 Engine 分离。所以 JSI 的出现让 RN 可以切换 JS 引擎，比如 Chakra、v8、Hermes ，同时允许 JS 和 Native 线程之间的同步相互执行。JSI 作为接口，它允许 JS 保存对 C++ 对象的引用，反之亦然，例如使用内存引用时，可以直接调用方法而无需序列化成本，例如在实时处理帧数据时，JSI 可以轻松处理更大的帧速率数据，所以 JSI 将最大限度地减少 JS 和原生内存之间的开销。

### Fabric 新渲染系统

ReactNative (RN) 的新架构引入了 Fabric 作为新的 UI 框架，旨在解决原有 UIManager 框架在渲染性能上的瓶颈，特别是在快速滑动、复杂动画和手势处理等方面的不足。Fabric 是 React Native 的新渲染系统，是传统渲染系统的概念演变。简单理解它就是 RN 在 UI 层的重新实现，类似取代了原本的 UI Manager，主要是为了以充分利用 React 的并发渲染能力，特别是现在的新架构支持 React 18 及更高版本中提供的并发渲染功能。而得益于前面的 JSI， JS 可以直接调用 Native 方法，其实就包括了 UI 方法，所以 JS 和 UI 线程可以同步执行从而提高列表、跳转、手势处理等的性能。核心原则是在 C++ 中统一更多渲染逻辑，提高与主机平台的互操作性，实现跨平台，并解锁 React Native 的新功能。在此之前，JS 和 UI 线程不同步，因此在某些情况下 App 可能会因为丢帧而显得卡顿。

- 更好的用户体验
  - 通过改进宿主视图和 React 视图之间的互操作性，渲染器能够同步测量和渲染 React 表面。在遗留架构中，React Native 布局是异步的，这导致在宿主视图中嵌入 React Native 渲染视图时出现布局“跳转”问题。
  - 通过支持多优先级和同步事件，渲染器可以对某些用户交互进行优先级排序，以确保及时处理它们。
  - 与 React Suspense 集成，允许在 React 应用程序中更直观地设计数据获取。
  - 在 React Native 上启用 React并发功能。
  - 更容易实现 React Native 的服务器端渲染。、
- 类型安全：代码生成以确保跨 JS 和主机平台的类型安全。代码生成使用 JavaScript 组件声明作为事实来源来生成 C++ 结构来保存 props。 JavaScript 和主机组件 props 之间的不匹配会触发构建错误。
- 共享 C++ 核心：渲染器是用 C++ 实现的，核心在平台之间共享。这提高了一致性，并使在新平台上采用 React Native 变得更容易。可以使用 C++ 编写组件或迁移其它平台的原生代码，以此避免在跨平台重复实现组件。
- 更好的主机平台互操作性：同步和线程安全的布局计算改善了将主机组件嵌入到 React Native 中时的用户体验，这意味着更容易与需要同步 API 的主机平台框架集成。
- 改进的性能：通过渲染器系统的新跨平台实现，每个平台都可以从性能改进中受益，而性能改进可能是由于某个平台的限制而引起的。例如，视图扁平化最初是 Android 的性能解决方案，现在 Android 和 iOS 上都默认提供。
- 一致性：新的渲染系统是跨平台的，更容易保持不同平台之间的一致性。
- 更快的启动：默认情况下，主机组件会延迟初始化。
- 结合使用 JSI 改善通信效率：通过 JSI 使得 JS 和主机平台之间的数据序列化较少，React 用于在 JavaScript 和主机平台之间以序列化 JSON 的形式传输数据。新的渲染器通过使用JavaScript 接口 (JSI)直接访问 JavaScript 值来改进数据传输。

在开发 Fabric 组件前，需要先创建一个 JavaScript 接口描述文件。之后 Codegen 会根据这个文件创建一些 C++ 脚手架代码，用于将部分组件逻辑（比如调用原生平台接口能力）与 React Native 结合起来。C++ 代码在各个平台都是一样的，只要组件能够与生成的 C++ 代码连接起来，就可以导入到 App 并运行。

[Fabric 组件](https://reactnative.cn/docs/the-new-architecture/pillars-fabric-components)

引入 Fabric 新渲染系统前后工作流程对比：

![rn-fabric-before](/blog/images/mobile/rn-fabric-before.png)
![rn-fabric-after](/blog/images/mobile/rn-fabric-after.png)

### TurboModule 新原生模块

TurboModules 是创建利用某些平台特定 API 的库的首选方法。如果您使用过 React Native，您可能了解过 Native Modules 这个概念。它可以通过 React Native 的「Bridge」帮助 JavaScript 和原生代码进行交互，并使用跨平台的数据格式 JSON 进行通讯。在之前的架构中 JS 使用的所有 Native Modules（例如蓝牙、地理位置、文件存储等）都必须在应用打开之前进行初始化，这意味着即使用户不需要某些模块，但是它仍然必须在启动时进行初始化。Turbo Modules 基本上是对这些旧的 Native 模块的增强，现在 JS 将能够持有这些模块的引用，所以 JS 代码可以仅在需要时才加载对应模块，这样可以将显着缩短 RN 应用的启动时间。

Turbo Native Modules 与 Native Modules 相比，存在以下优势：

- 各个平台的强类型接口声明是一致的；
- 您可以使用 C++ 编写模块或迁移其它平台的原生代码，以此避免在跨平台重复实现模块；
- 模块支持懒加载，可以加快 App 启动速度；
- 通过替换 Bridge 为 JSI（使用原生代码编写的 JavaScript 接口），提升 JavaScript 与原生代码的通讯效率。

[TurboModule](https://reactnative.cn/docs/the-new-architecture/pillars-turbomodules)

### CodeGen

新架构 UI 增加了 C++ 层的 shadow、component 层，而且大部分组件都是基于 JSI，因而开发 UI 组件和 API 的流程更复杂了，要求开发者具有 c++、JNI 的编程能力，为了方便开发者快速开发 Facebook 也提供了 codegen 工具，帮助生成一些自动化的代码。

Codegen 主要是用于保证 JS 代码和 C++ 的 JSI 可以正常通信的静态类型检查器，通过使用类型化的 JS 作为参考来源，CodeGen 将定义可以被 Turbo 模块和 Fabric 使用的接口，另外 Codegen 会在构建时生成 Native 代码，减少运行时的开支。

### Hermes

Hermes 是 RN 研发的全新 JS 引擎，而之所以有 Hermes ，是因为它是专为资源受限的设备而设计的存在，并针对启动、应用大小和内存消耗进行了相应优化，Hermes 和其他 JS 引擎之间的一个关键区别是：它能够提前将 JavaScript 源代码预编译优化为字节码。

#### 启动速度和内存优化

**Hermes 支持提前执行编译的能力，使得代码体积更小，内存占用更少，启动时间更快**。启用了 Hermes 的 React Native 应用会带有预编译的优化字节码，而不是纯 JavaScript 源代码。Hermes 把 JS 的解析和编译过程前置到项目打包阶段，应用程序运行时可以直接执行字节码，从而极大的提高了 runtime 的执行效率。这种预编译的优化思路除了可以有效的提高程序的执行效率之外，由于直接放弃了 JIT 编译器，所以执行引擎的体积大小和内存损耗都可以得到极大的优化。

#### 建立新的垃圾收集器

在新一代 React Native 架构中崭露头角的 Fabric 渲染器可谓万众瞩目，它能够在 UI 线程上同步调用 JavaScript。但如果 JavaScript 线程的执行时间过长，则会导致明显的 UI 丢帧、令用户无法正常输入。React Fiber 提供的并发渲染机制能够将渲染工作拆分成多个块，由此避免单一 JavaScript 任务占用过长时间。此外，JavaScript 线程当中还有另一大常见延迟来源——垃圾收集（GC）机制。因为一旦开始垃圾收集，整个 JavaScript 引擎必须放下手头的所有工作。

Hermes 当中的原有默认垃圾收集器 GenGC 属于单线程分代垃圾收集方案。其中会对新生代采用典型的半空间复制策略，而对老年代则使用 mark-compact 策略、从而更主动将内存返还至操作系统。这在有些情况下导致 JavaScript 线程中 GC 任务占用过长时间。为了缓解这种情况，Hermes 建立起全新的、以并发为主要取向的垃圾回收方案，即 Hades。

Hades 同样采用分代设计，其新生代回收方式与 GenGC 完全相同，而老年代回收方式则通过快照式标记扫描收集器进行管理。Hades 能够将大部分工作负载交由后台线程执行，从而显著缩短垃圾回收暂停时长，同时不会阻止引擎主线程继续执行 JavaScript 代码。和过去就的 GenGC 只能在单个线程与解释器抢占执行资源不同，新的垃圾回收器 Hades 可以将回收工作在后台与 JavaScript 解释器同时执行。这样做的好处就是你的应用程序不会因为垃圾回收而导致长时间的延迟，从感官上来说，程序的运行流畅度将会因此得到巨大的提升。

Hades 依然基于新生代和老生代的分配进行垃圾回收处理，但是不同的是，Hades 的老生代具有不同的分配策略。这里主要的目的是为了能够在后台并行运行回收垃圾，因此 Hades 的老生代被设计为一个堆内存块的列表。例如一个堆内存块 8 个字节，这里我们可以把它理解为最小分配单位。这样做的好处是在内存分配上可以变得更快，坏处就是内存的利用并不充分，可能会出现空闲内存间隔无法被使用。 不过这是被允许的，因为我们更需要方便的并行去标记内存块，并回收他们，这是实现多线程并行回收的重要基础条件。由于回收得非常快，因此浪费的内存间隔是可以被允许的。但由于需要资源成本更高的写屏障、速度更慢的基于空闲列表的分配机制（与碰撞指针分配器相反）以及更多的堆碎片，Hades 实际是在用整体吞吐量来换取更短的暂停时间。

除此之外，也正是由于这个设计，我们可以把回收任务轻松的拆分为多个子任务，从而方便实现 React 中一致践行的并发模式，对于大任务的中断会非常友好。这也是 Hades 可以以极短的时间来暂停任务的核心原因，垃圾回收工作对程序的正常运行几乎不会有什么的影响。

## 总结

JSI (JavaScript Interface) 取代老架构中的 Bridge，它为 JS 执行引擎提供 API，使 JS 直接调用原生 (Java/ObjC) 函数。JSI 带来的一个优势是 JS 线程 和 Native Modules 的完全同步。在 JSI 的帮助下，JS 将能够持有对 C++ 对象的引用 并直接调用它们的方法。它还会附带共享所有权的概念，允许原生端直接与 JS 线程通信。老架构的 Bridge 使用消息队列，JS 和 Native 在高频通信时容易阻塞队列，最后导致事件响应不及时和 UI 卡顿现象。同时 Bridge 里的序列化和反序列也是性能影响关键因素，同时它也是异步的。

Fabric 是负责 Native 端的 UIManager 的新名称。现在最大的不同是它也不再通过 Bridge 与 JS 端通信了，而是使用 JSI 暴露一个 Native 函数，因此 JS 端可以直接通过 ref 函数进行通信，反之亦然。更好、更高效的性能以及在双方之间传递数据。React Native 原生组件实现上，以往基于 Bridge 来实现。现在基于 JSI 来实现的 Fabric 原生组件会极大提供通信效率。Fabric 原生组件 和老架构的原生组件是一样的，但 Fabric 原生组件却可以获得新架构所有收益：

- 各个平台的强类型接口声明是一致的；
- 能够使用 C++ 编写代码，这样可以使用一套代码集成至其他 Native 平台；
- 通过替换 Bridge 为 JSI，提升 JS 与 Native 的通讯效率。

Fabric Renderer，在上一代 React Native 渲染器中，React 影子树、布局逻辑、视图拍平算法是在各个平台单独实现的，并通过 Bridge 被 JS 调用。当前的 Fabric 渲染器的设计上采用的是基于 JSI 的跨平台的解决方案，共享了核心的 C++ 实现。

Turbo Modules 的目的与老架构的 Native Modules 相同，但实现和行为不同。首先，它们是懒加载 (lazy-loaded) 的，这意味着它只在应用程序需要它们时加载，而不是在启动时加载所有它们。此外，它们也使用 JSI API，JS 持有一个引用以在 React Native JS 库端使用它们，从而获得更好的性能，尤其是在启动时间上。

Codegen 不算是新架构的主要组成部分，它是一个帮助我们避免编写重复代码的工具。主要应用于 Turbo Modules 和 Fabric 组件 的开发，通过它能快速生成脚手架代码。

[RN 新架构](https://reactnative.cn/architecture/overview)

[怎么理解React Native的新架构](https://mp.weixin.qq.com/s/6q5r9CMmIL3O5yyHRTU5FA)

[React Native 新架构分析](https://mp.weixin.qq.com/s/tU08eVhNfqwsdxAPjB0OAw)

[RN 新架构为默认模式](https://mp.weixin.qq.com/s/DkL4r2Dg0dpfzK5SFihHOg)
