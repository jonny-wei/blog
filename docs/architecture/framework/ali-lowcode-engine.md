# Ali-lowcode-engine

## 协议

### 搭建协议

[低代码引擎搭建协议](https://lowcode-engine.cn/lowcode) 一套面向开发者的 schema 规范，用于规范化**约束搭建编辑器的输出**，以及**渲染模块和出码模块的输入**，将搭建编辑器、渲染模块、出码模块解耦，保障搭建编辑器、渲染模块、出码模块的独立升级。通过约束让上层低代码编辑器的产出物保持一致性，可跨低代码研发平台进行流通而提效，亦不阻碍集团业务间融合的发展。

低代码编辑器的产出物包括：低代码搭建平台产物（应用、页面、区块、组件）的 schema 结构，以及实现其数据状态更新（内置 api)、能力扩展、国际化等方面完整，只在低代码搭建场景下可用

### 物料协议

[低代码引擎物料协议规范](https://lowcode-engine.cn/material) 目前集团业务融合频繁，而物料规范的不统一给业务融合带来额外的高成本，另一方面集团各个 BU 的前端物料也存在不同程度的重复建设。我们期望通过集团层面的物料通不阻碍业务融合的发展，同时通过集团层面的物料流通来提升物料丰富度，通过丰富物料的复用来提效中后台系统研发，同时也能给新业务场景提供高质量的启动物料。

- 源码物料规范：一套面向开发者的目录规范，用于规范化约束开发过程中的代码、文档、接口规范，以方便物料在集团内的流通。
- 搭建物料规范：一套面向开发者的 Schema 规范，用于规范化约束开发过程中的代码、文档、接口规范，以方便物料在集团内的流通。

### 资产包协议

[低代码引擎资产包协议规范](https://lowcode-engine.cn/site/docs/specs/assets-spec) 根据低代码引擎的实现，一个组件要在引擎上渲染和配置，需要提供组件的 umd 资源以及组件的`低代码描述`，并且组件通常都是以集合的形式被引擎消费的；除了组件之外，还有组件的依赖资源、引擎的动态插件/设置器等资源也需要注册到引擎中。“低代码资产包”这个数据结构，来描述引擎所需加载的动态资源的集合。主要包含组件及其依赖的资源、组件低代码描述、动态插件/设置器资源等。

## 接入SDK

低代码引擎的编辑器将产出两份数据：

- 资产包数据 assets：包含物料名称、包名及其获取方式，对应协议中的[《低代码引擎资产包协议规范》](https://lowcode-engine.cn/assets)
- 页面数据 schema：包含页面结构信息、生命周期和代码信息，对应协议中的[《低代码引擎搭建协议规范》](https://lowcode-engine.cn/lowcode)

经过上述两份数据，可以直接交由渲染模块或者出码模块来运行，二者的区别在于：

- 渲染模块：使用资产包数据、页面数据和低代码运行时，并且允许维护者在低代码编辑器中用 Low Code 的方式继续维护；
- 出码模块：不依赖低代码运行时和页面数据，直接生成可直接运行的代码，并且允许维护者用 Pro Code 的方式继续维护，但无法再利用用低代码编辑器；

基于官方提供的渲染模块 [@alifd/lowcode-react-renderer](https://github.com/alibaba/lowcode-engine/tree/main/packages/react-renderer)，你可以在 React 上下文渲染低代码编辑器产出的页面。

### 渲染数据

构造渲染模块所需数据

渲染模块所需要的数据需要通过编辑器产出的数据进行一定的转换，规则如下：

- schema：从编辑器产出的 projectSchema 中拿到 componentsTree 中的首项，即 `projectSchema.componentsTree[0]`；
- components：需要根据编辑器产出的资产包 assets 中，根据页面 projectSchema 中声明依赖的 componentsMap，来加载所有依赖的资产包，最后获取资产包的实例并生成物料 - 资产包的键值对 components。

```javascript
async function getSchemaAndComponents() {
  const packages = JSON.parse(window.localStorage.getItem('packages') || '');
  const projectSchema = JSON.parse(window.localStorage.getItem('projectSchema') || '');
  const { componentsMap: componentsMapArray, componentsTree } = projectSchema;
  const componentsMap: any = {};
  componentsMapArray.forEach((component: any) => {
    componentsMap[component.componentName] = component;
  });
  const schema = componentsTree[0];
  
  const libraryMap = {};
  const libraryAsset = [];
  packages.forEach(({ package: _package, library, urls, renderUrls }) => {
    libraryMap[_package] = library;
    if (renderUrls) {
      libraryAsset.push(renderUrls);
    } else if (urls) {
      libraryAsset.push(urls);
    }
  });
  
  const vendors = [assetBundle(libraryAsset, AssetLevel.Library)];
  
  const assetLoader = new AssetLoader();
  await assetLoader.load(libraryAsset);
  const components = await injectComponents(buildComponents(libraryMap, componentsMap));
  
  return {
    schema,
    components,
  };
}
```

### 进行渲染

拿到 schema 和 components 以后，您可以借由资产包数据和页面数据来完成页面的渲染：

```javascript
import React from 'react';
import ReactRenderer from '@alilc/lowcode-react-renderer';

const SamplePreview = () => {
  return (
    <ReactRenderer
      schema={schema}
      components={components}
    />
  )
}
```

### 低代码的生产和消费

经过“接入编辑器” - “接入运行时” 这两节的介绍，我们已经可以了解到低代码所构建的生产和消费流程了，梳理如下图：

![lowcode1](/blog/images/architecture/lowcode1.png)

如上述流程所示，您一般需要一个后端项目来保存页面数据信息，如果资产包信息是动态的，也需要保存资产包信息。

## 引擎架构图

![lowcode3](/blog/images/architecture/lowcode3.png)

### 元概念

- **Model**：是对某个实际问题或客观事物、规律进行抽象后的一种形式化表达方式。在低代码语境下，模型是 **编排引擎** 的基础之一，模型包含低代码引擎运作所需要的全部数据信息，模型分为三层，自低而上为数据模型、领域模型、视图模型。

  - [数据模型](https://wiki.mbalib.com/wiki/数据模型)：数据模型是现实世界数据特征的抽象，用于描述一组数据的概念和定义。数据模型是数据库中数据的存储方式，是数据库系统的基础。在数据库中，数据的物理结构又称数据的存储结构，就是数据元素在计算机存储器中的表示及其配置；数据的逻辑结构则是指数据元素之间的逻辑关系，它是数据在用户或程序员面前的表现形式，数据的存储结构不一定与逻辑结构一致。
  - [领域模型](https://baike.baidu.com/item/领域模型)：领域模型是描述业务用例实现的对象模型。它是对业务角色和业务实体之间应该如何联系和协作以执行业务的一种抽象。业务对象模型从业务角色内部的观点定义了业务用例。该模型为产生预期效果确定了业务人员以及他们处理和使用的对象（业务类和对象）之间应该具有的静态和动态关系。它注重业务中承担的角色及其当前职责。这些模型类的对象组合在一起可以执行所有的业务用例。
  - 视图模型：视图模型类似一张虚拟的表，包含一些列带有名称的行和列数据，但是其并不在数据库中以存储的数据值集形式存在。这类模型需要处理视图、模型和外部服务间的交汇的问题。

- **Schema**：是元数据的一个抽象集合，包含一套 Schema Component: 主要是元素与属性的声明、复杂与简单数据类型的定义。用于规范化约束 **入料引擎、编排引擎** 的输出，**渲染引擎**、**编排引擎**、**出码引擎** 的输入，从架构层面对低代码各大引擎进行解耦，以方便各引擎的独立运作与升级。
- **Code**：这里特指源代码（Source code），是指一系列人类可读的计算机语言指令。通过低代码 **出码引擎** 产出的代码一定是具备 **良好工程体系** 的 **好代码** 。

### 物料概念

- **基础组件（Basic Components）**：前端领域通用的基础组件，比如：[Ant Design](https://ant.design/index-cn)、[Fusion Next](https://fusion.design/component/doc/102)。
- **图表组件（Chart Components）**：前端领域通用的图表组件，比如：[BizCharts](https://bizcharts.net/)、[ECharts](https://echarts.baidu.com/)。
- **业务组件（Business Components）**：业务领域内基于基础组件之上定义的组件，可能会包含特定业务域的交互或者是业务数据，对外仅暴露可配置的属性，且必须发布到公域如 NPM；在同一个业务域内可以流通，但不需要确保可以跨业务域复用。
- **布局组件（Layout Components）**：前端领域通用的用于实现基础组件、图表组件、业务组件之间各类布局关系的组件，如 Ant Desion 中支持的 [栅格 Grid](https://ant.design/components/grid-cn/)，Fusion Next 中 [Grid 栅格](https://fusion.design/component/basic/grid)。
- **区块（Block）**：一系列业务组件、布局组件等组合而成的代码片段，不对外提供可配置的属性；区块内部具备完整的内部样式、事件、生命周期管理、状态管理、数据流转机制，能独立存在和运行，通过代码片段的复制实现跨页面、跨应用的快速复用，保障功能和数据的正常。
- **模板（Template）**：特定垂直业务领域内的业务组件、区块可组合为单个页面，或者是再配合路由组合为多个页面集，统称为模板。

### 引擎概念

![lowcode2](/blog/images/architecture/lowcode2.png)

- **入料引擎（Materialin Engine）**：专注于物料接入。能自动扫描、解析物料代码，并最终产出一份适配搭建接入规范的 Schema 给开发者；开发者可以在此基础上做少量配置，以实现一定的业务定制需求。**简而言之，Material for Schema**。
- **编排引擎（Choreography Engine）**：专注于 Schema 可视化编排。为上层用户提供可视化的交互方式来对页面和数据进行编排搭建，如：物料编排、数据流编排、事件行为绑定等，并最终产出一份符合搭建基础协议规范的 Schema。**简而言之，Schema to Schema**。
- **渲染引擎（Rendering Engine）**：专注于将 Schema 渲染为 UI 元素。将物料、数据模型、Schema 三者融合到一起，最终呈现一个可交互的页面给用户；同时还面向开发者提供了可插拔的能力，可以对渲染引擎能力进行扩展和定制。**简而言之，Schema to UI**。
- **出码引擎（Codeout Engine）**：专注于将 Schema 生成为好代码。解析 Schema 并按照策略配置调度执行一系列处理流程后，独立产出可运行、可维护的好代码。其中处理流程包括：解析、分析、重组、优化、生成代码与格式优化；产出的代码为包含简单交互逻辑与数据模型的展现层代码。**简而言之，Schema to Code**。

### UIPaaS与引擎的关系

![lowcode4](/blog/images/architecture/lowcode4.png)

## 引擎原理概览

### 引擎源码结构

![lowcode5](/blog/images/architecture/lowcode5.png)

### 引擎模块划分

![lowcode6](/blog/images/architecture/lowcode6.png)

- **入料**，就是将外部的物料，比如海量的 npm 组件，按照《物料描述协议》进行描述。注意，这里仅是增加描述，而非重写一套，这样我们能最大程度复用ProCode体系已沉淀的组件。将描述后的数据通过引擎 API 注册后，在编辑器中使用。将物料，按照[《中后台搭建组件描述协议》](https://f2e.alibaba-inc.com/markdown?spm=a2o8t.11089562.0.0.62e26654yMPon3&gitlab=f2e-specs%2Fmo-specs%2F4.beta%2F1.component-for-lowcode-spec.md)进行元数据描述后，导入到设计器中，成为一个可被编排的物料。
- **编排**，本质上来讲，就是不断在生成符合《搭建协议》的页面描述，将编辑器中的所有物料，进行布局设置、组件 CRUD 操作、以及 JS/CSS编写/逻辑编排等，最终转换成页面描述。将设计器中的所有物料，进行布局设置、组件设置(CRUD)、交互设置(JS编写/逻辑编排)后，形成符合业务诉求的 schema 描述，此 schema 遵循 [《阿里经济体中后台搭建协议规范》](https://f2e.alibaba-inc.com/markdown?spm=a2o8t.11089562.0.0.2db46654DcMnT4&gitlab=f2e-specs%2Fmo-specs%2F2.specs%2F2.lowcode-spec.md)；
- **渲染**，顾名思义，就是将编排生成的页面描述结构渲染成视图的过程，视图是面向用户的，所以必须处理好内部数据流、生命周期、事件绑定、国际化等。将编排得到的 schema 渲染成可交互的页面。
- **出码**，就是将页面描述结构解析和转换成应用代码的机制。将编排得到的 schema 转成真实的代码结构，比如 Recore / Ice / Remax / Umi 等应用框架结构；

### 插件机制/微内核架构设计

阿里低代码引擎奉行最小内核，最强生态的原则。

通过阅读[低代码引擎扩展相关官方文档](https://lowcode-engine.cn/docV2/srdo3s)、以及官方的[lowcode-demo](https://github.com/alibaba/lowcode-demo)可以了解到，低代码引擎也使用插件机制/微内核架构，使得开发人员在不修改引擎源代码的情况下、通过开发插件的形式对引擎进行扩展。

::: tip 微内核架构

微内核架构（Microkernel Architecture）也叫 Plugin Architecture，是一种基于插件的架构方式，通过编写精简的微内核来支撑以 plugin 的方式来添加更多丰富的功能。[微内核架构应用研究](https://yunsong0922.github.io/2018/12/09/微内核架构应用研究/)

微内核架构在我们常用的应用和框架里面非常常见，比如工具有 IntelliJ、Chrome、VS Code等等。前端框架中的 jQuery、Babel、Webpack等等，也都采用了微内核架构，利用插件机制带来框架的扩展性和灵活性。

:::

插件可以扩展的功能，被叫做扩展点（ExtensionPoint），[低代码引擎提供的扩展点](https://lowcode-engine.cn/docV2/srdo3s)包括[物料](https://lowcode-engine.cn/docV2/funcv8)、[插件（低代码编辑器的功能和面板）](https://lowcode-engine.cn/docV2/tbgyp3)和[设置器](https://lowcode-engine.cn/docV2/cl03wo_nmhznb)，官方的扩展架构图如下：

![lowcode7](/blog/images/architecture/lowcode7.png)

#### 分层系统设计

为了方便理解，我把低代码引擎提供的各个API划分成三类，分别是**组件系统，对象系统，事件系统**。

而低代码引擎提供了`9大类API`，我也把它划分为三类，分别是`组件系统`，`对象系统`和`事件系统`。

- `组件系统`是指[skeleton（面板）](https://www.yuque.com/lce/doc/bv3und)、[material（物料）](https://www.yuque.com/lce/doc/mu7lml)、[setters（设置器）](https://www.yuque.com/lce/doc/xwnsu3)等等，跟组件开发相关的模块。
- `事件系统`是指[event（事件）](https://www.yuque.com/lce/doc/qrotb6)、[hotkey（快捷键）](https://www.yuque.com/lce/doc/dne3ry)等等，跟内外部事件相关的模块。
- `对象系统`就是除了上述的模块的其他模块，比如[project（模型）](https://www.yuque.com/lce/doc/dcrbff)，就是对UI可视化搭建的面向对象建模。

![lowcode8](/blog/images/architecture/lowcode8.png)

## 友情链接

[低代码领域名词解释](https://lowcode-engine.cn/docV2/ub70ke)

[低代码引擎物料协议规范](https://lowcode-engine.cn/material)

[低代码引擎搭建协议(简化版)](https://lowcode-engine.cn/docV2/sde3wf)

[低代码引擎搭建协议](https://lowcode-engine.cn/lowcode)

[低代码引擎资产包协议规范](https://lowcode-engine.cn/assets)

[低代码相关仓库](https://lowcode-engine.cn/docV2/qtrtpp)

[NPM包对应源码位置汇总](https://www.yuque.com/lce/doc/ngm44i)
