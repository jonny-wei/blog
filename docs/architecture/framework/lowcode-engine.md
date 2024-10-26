# 低代码引擎设计与实现

- 设计一个低代码引擎或者低代码设计器，需要的核心模块是什么？
- 低代码组件如何加载和解析？低代码设计器如何加载低代码组件？
- 设计器如何实现？
- 设计器和渲染器之间如何相互通信，使得低代码组件实时渲染在设计器中？
- 设计器中低代码组件拖拽是要如何实现？
- 设计器中通过设置器修改组件属性，如何实现？

设计一个基于私有 JSON Scheme 的低代码引擎或者低代码设计器，主要包括以下几个模块：

- 入料：向低代码引擎注入设置器、插件和组件。
- 设计：对组件进行布局设置、属性设置以及增删改操作，产生符合页面搭建协议的 JSON Schema。
- 渲染：将 JSON Schema 渲染成 UI 界面。为了贴近生产环境，这里给渲染器提供一个纯净的渲染环境，渲染器与设计器处于不同的 Frame 中。

## 页面搭建协议

页面搭建协议是低代码引擎与页面搭建器之间进行通信的协议。用来约束设计器的输出，以及渲染器和编译器的输入。页面搭建协议描述的整个组件树由组件结构和容器结构嵌套构成。

- 组件结构：组件结构位于组件树的叶子节点，描述单个组件的名称和属性等。
- 容器结构：容器是一种特殊的组件，它在组件结构的基础上增加了对子集、数据源和生命周期的描述，减少了联动规则和校验规则。容器分为页面容器、数据容器和布局容器，其中页面容器可以设置生命周期和网络请求拦截器。
- 属性值类型描述：在上述组件结构和容器结构描述中，每一个属性所对应的值，除了传统的 JS 值类型（String、Number、Object、Array、Boolean）外，还包含有节点类型、事件函数类型、变量类型等多种复杂类型。
  - JSSlot：通常用于描述组件的某一个属性为 ReactNode 或 Function-Return-ReactNode 的场景。该类属性的描述均以 JSSlot 的方式进行描述。
  - JSFunction：所有事件函数的描述，均以 JSFunction 的方式进行描述，保留与原组件属性、生命周期（React / 小程序）一致的输入参数，并给所有事件函数 binding 统一一致的上下文（当前组件所在容器结构的 this 对象）。
  - JSExpression：所有的变量表达式均通过 JSExpression 表达式，上下文与事件函数描述一致，表达式内通过 this 对象获取上下文
- 上下文 API 描述：上下文 API 描述用于描述组件的上下文，包括组件的 props、state、refs、context 等。

```js
{
  "version": "1.1.0",  // 当前协议版本号
  "componentsMap": [  // 组件映射关系
    {
      "componentName": "Button",
      "package": "@alifd/next",
      "version": "1.0.0",
      "destructuring": false,
      "exportName": "Button",
      "subName": "",
      "main": "lib/button.js"
    },
    {
      "componentName": "Input",
      "package": "@alifd/next",
      "version": "1.0.0",
      "destructuring": false,
      "exportName": "Input",
      "subName": "",
      "main": "lib/input.js"
    }
  ],
  "componentsTree": [  // 描述模版/页面/区块/低代码业务组件的组件树
    {
      "id": "home",  // 页面ID
      "componentName": "Page",  // 页面容器组件
      "fileName": "Home",  // 页面文件名
      "props": {},  // 页面属性
      "css": "body {font-size: 12px;}",  // 内联CSS样式
      "state": {},  // 页面状态
      "static": {},  // 自定义静态属性
      "defaultProps": {},  // 默认属性
      "lifecycles": {  // 生命周期方法
        "componentDidMount": {
          "type": "JSFunction",
          "value": "function() { console.log('Page componentDidMount'); }"
        },
        "componentDidUpdate": {
          "type": "JSFunction",
          "value": "function(prevProps, prevState, snapshot) { console.log('Page componentDidUpdate'); }"
        },
        "componentWillUnmount": {
          "type": "JSFunction",
          "value": "function() { console.log('Page componentWillUnmount'); }"
        },
        "componentDidCatch": {
          "type": "JSFunction",
          "value": "function(error, info) { console.log('Page componentDidCatch', error, info); }"
        }
      },
      "children": [  // 子组件
        {
          "componentName": "Div",
          "props": {
            "className": "container"
          },
          "children": [
            {
              "componentName": "Input",
              "props": {
                "placeholder": "请输入内容"
              },
              "lifecycles": {  // Input 组件的生命周期方法
                "componentDidMount": {
                  "type": "JSFunction",
                  "value": "function() { console.log('Input componentDidMount'); }"
                },
                "componentDidUpdate": {
                  "type": "JSFunction",
                  "value": "function(prevProps, prevState, snapshot) { console.log('Input componentDidUpdate'); }"
                },
                "componentWillUnmount": {
                  "type": "JSFunction",
                  "value": "function() { console.log('Input componentWillUnmount'); }"
                }
              }
            },
            {
              "componentName": "Button",
              "props": {
                "text": "点击我",
                "onClick": {
                  "type": "JSFunction",
                  "value": "function(e) { alert('按钮被点击了！'); }"
                }
              },
              "lifecycles": {  // Button 组件的生命周期方法
                "componentDidMount": {
                  "type": "JSFunction",
                  "value": "function() { console.log('Button componentDidMount'); }"
                },
                "componentDidUpdate": {
                  "type": "JSFunction",
                  "value": "function(prevProps, prevState, snapshot) { console.log('Button componentDidUpdate'); }"
                },
                "componentWillUnmount": {
                  "type": "JSFunction",
                  "value": "function() { console.log('Button componentWillUnmount'); }"
                }
              }
            }
          ]
        }
      ]
    },
    {
      "id": "notFound",
      "componentName": "Page",
      "fileName": "NotFound",
      "props": {},
      "css": "body {font-size: 12px;}",
      "state": {},
      "static": {},
      "defaultProps": {},
      "lifecycles": {  // 生命周期方法
        "componentDidMount": {
          "type": "JSFunction",
          "value": "function() { console.log('404 Page componentDidMount'); }"
        },
        "componentDidUpdate": {
          "type": "JSFunction",
          "value": "function(prevProps, prevState, snapshot) { console.log('404 Page componentDidUpdate'); }"
        },
        "componentWillUnmount": {
          "type": "JSFunction",
          "value": "function() { console.log('404 Page componentWillUnmount'); }"
        }
      },
      "children": [
        {
          "componentName": "Div",
          "props": {
            "className": "container"
          },
          "children": [
            {
              "componentName": "Text",
              "props": {
                "text": "404 - 页面未找到"
              },
              "lifecycles": {  // Text 组件的生命周期方法
                "componentDidMount": {
                  "type": "JSFunction",
                  "value": "function() { console.log('Text componentDidMount'); }"
                },
                "componentDidUpdate": {
                  "type": "JSFunction",
                  "value": "function(prevProps, prevState, snapshot) { console.log('Text componentDidUpdate'); }"
                },
                "componentWillUnmount": {
                  "type": "JSFunction",
                  "value": "function() { console.log('Text componentWillUnmount'); }"
                }
              }
            }
          ]
        }
      ]
    }
  ],
  "utils": [  // 工具类扩展映射关系
    {
      "name": "clone",
      "type": "npm",
      "content": {
        "package": "lodash",
        "version": "4.17.21",
        "exportName": "clone",
        "subName": "",
        "destructuring": false,
        "main": "/lodash.js"
      }
    }
  ],
  "i18n": {  // 国际化语料
    "zh-CN": {
      "i18n-jwg27yo4": "你好",
      "i18n-jwg27yo3": "中国"
    },
    "en-US": {
      "i18n-jwg27yo4": "Hello",
      "i18n-jwg27yo3": "China"
    }
  },
  "constants": {  // 应用范围内的全局常量
    "ENV": "prod",
    "DOMAIN": "example.com"
  },
  "css": "body {font-size: 12px; .table { width: 100px; }}",  // 应用范围内的全局样式
  "config": {  // 当前应用配置信息
    "sdkVersion": "1.0.3",  // 渲染模块版本
    "historyMode": "hash",  // 历史模式
    "targetRootID": "J_Container",  // 目标根ID
    "layout": {  // 布局配置
      "componentName": "BasicLayout",
      "props": {
        "logo": "https://example.com/logo.png",
        "name": "测试网站"
      }
    },
    "theme": {  // 主题配置
      "package": "@alife/theme-fusion",
      "version": "^0.1.0",
      "primary": "#ff9966"
    }
  },
  "meta": {  // 应用元数据信息
    "name": "demo 应用",
    "git_group": "appGroup",
    "project_name": "app_demo",
    "description": "这是一个测试应用",
    "spma": "spa23d",
    "creator": "月飞",
    "gmt_create": "2020-02-11 00:00:00",
    "gmt_modified": "2020-02-11 00:00:00"
  },
  "dataSource": [  // 当前应用的公共数据源
    {
      "id": "userList",
      "url": "/api/users",
      "method": "GET",
      "params": {}
    }
  ],
  "router": {  // 当前应用的路由配置信息
    "baseName": "/",
    "historyMode": "hash",
    "routes": [
      {
        "path": "home",
        "page": "home"
      },
      {
        "path": "/*",
        "redirect": "notFound"
      }
    ]
  },
  "pages": [  // 当前应用的所有页面信息
    {
      "id": "home",
      "treeId": "home",
      "meta": {
        "title": "首页"
      }
    },
    {
      "id": "notFound",
      "treeId": "notFound",
      "meta": {
        "title": "404页面"
      }
    }
  ]
}
```

## 入料模块

入料模块的职责是向设计器注入插件、属性设置器和组件，它的工作是收集外部资源。低代码引擎向外暴露的API主要与入料模块有关。

![lowcode14](/blog/images/architecture/lowcode14.png)

- 加载低代码组件描述：低代码引擎的宿主环境主动调用低代码引擎提供的API加载组件描述。一个是从npm包中加载规格JSON文件，另一个是用 JOSN 文件的内容生成 ComponentSpec 实例。
- 加载组件：组件实现是一段JavaScript代码，负责渲染HTML元素。可使用script标签加载，加载成功之后低代码引擎会收集React组件，并注册组件包自带的设置器。组件被加载完成之后系统会判断组件包是否携带设置器，如果是，则需要将设置器注册到引擎内部。这里要注意加载组件将在渲染器环境中进行。

## 画布渲染与通信

为了使渲染器和设计器不相互污染，当App处于设计态时，渲染器环境和设计器环境处于不同的Frame中。那么设计器环境如何唤起渲染器环境。

对设计器环境而言，渲染器环境是一个用iframe内嵌的网页，iframe元素的常见用法是将它的src属性设置成固定的URL。但渲染器环境没有固定的URL，所以这里使用一种不常见的用法，即调用document.write方法给iframe写入要加载的内容。

![lowcode17](/blog/images/architecture/lowcode17.png)

设计器环境调用iframe加载渲染器环境，但它不关心渲染器如何完成画布渲染。当渲染器环境的外部资源加载成功后，会把渲染器环境提供的实例对象暴露出去供设计器环境访问。

### 渲染器与设计器的通信

设计器环境与渲染器环境同源，因此不受浏览器跨域限制，它们之间的通信可以理解为：持有对方的变量，从而调用对方的API来完成自己的功能。

- 渲染器环境提供的API主要是帮助设计器环境获取低代码组件的位置。设计器环境使用 `frame.contentWindow.SimulatorRenderer` 访问渲染器 renderer 实例，以此访问渲染器环境提供的API。
- 设计器环境给渲染器环境提供了一些用于完成画布渲染的API。设计器环境将它的API赋给渲染器环境的全局变量，以便渲染器环境可以调用。渲染器环境通过window便能访问设计器环境提供的API。
- 当设计器环境提供的Schema变化时，渲染器环境要重新渲染画布，使最新的结果显示在界面上。重新渲染画布需要设计器环境主动调用渲染器环境提供的rerender方法。该方法的返回值是Promise，当画布上的低代码组件被装载之后，该Promise的状态变为resolved，此时设计器环境能获取画布上低代码组件的位置信息。

rerender 方法如何保证画布上的低代码组件都装载之后，返回值的状态变为 resolved，这里用到的知识点有 useEffect、MobX 和 Promise。

## 设计器与编排

设计器的主要功能是增删组件、拖曳组件以及设置组件的属性，可以将它们类比为操作DOM树上的节点。

- 对象建模：编排实际上操作 schema，为了方便操作，引擎将 schema 转化成 Node 和 Props 等。
- 拖曳定位：拖曳过程中探测组件的可插入点
- 设置属性：选中组件利用属性设置器修改属性值。

### 对象建模

浏览器运行的网页，至少包括一个全局变量window。window上有document和其他对象。document管理了所有的DOM节点，每个DOM节点有自己的属性。低代码引擎也按类似的结构建模，包含的实例对象主要有Skeleton、Project、DocumentModel、Node、Props、Prop、Designer、ComponentSpec、Dragon、Host和SettingTopEntry等，它们的职责如下：

- Skeleton：管理引擎面板上的所有插槽
- Project：提供项目管理能力，通过它能访问除Skeleton之外的所有实例。引擎启动之后将自动创建一个Project实例，它有且仅有一个Project实例。Project包含一个DocumentModel实例，它们是一对一的关系。
- DocumentModel：提供文档管理能力，每个应用对应一个DocumentModel实例。它包含一个由Node组成的树，类似于DOM树。访问DocumentModel实例的schema属性即可导出整个文档的JSON Schema。
- Node、Props和Prop：在画布上显示的低代码组件将被转化成Node，每个Node都对应一个画布上的低代码组件，Node和Props是引擎的基石几乎贯穿所有模块。Props用来管理Node的props和extraProps属性，Prop用来管理props和extraProps下每个字段的内容，Node与Props是1对1的关系，Props与Prop是一对多的关系。
- Designer：提供页面设计能力，它将Host、Dragon和所有的ComponentSpec实例组合在一起。
- Host：作为设计器和渲染器的桥梁，使处于不同Frame的设计器和渲染器能访问彼此，完成相应功能。
- Dragon：提供组件拖曳能力，包括将组件从组件面板拖曳到画布，也包括对画布内的组件进行拖曳。
- ComponentSpec：它是进行页面设计的基础，描述组件支持的属性，以及组件的嵌套规则等。
- SettingTopEntry：将属性设置面板与Node关联，每个Node都有一个SettingTopEntry实例。

![lowcode19](/blog/images/architecture/lowcode19.png)

### 拖拽定位

渲染器和设计器处于不同的Frame中，因此拖曳组件，不仅涉及在同一个Frame中拖曳，还涉及跨Frame拖曳。拖曳定位指的是当组件被拖曳到画布区域时，界面上显示组件最近的可放置位置，这是一个与设计器强相关的功能，因此它与设计器处于同一个iFrame。

点画线指示了被拖曳组件最近的可放置点，点画线对应的DOM元素与画布位于不同的iFrame，涉及的知识点包含如下：

- Ref：给渲染器中的低代码组件设置ref属性，当其装载到界面之后即可得到组件的DOM节点
- Element.getBoundingClientRect：用这个API计算DOM元素的位置信息，从而计算出拖曳过程中鼠标经过的低代码组件。
- 绝对定位：用CSS绝对定位将点画线相关的DOM元素叠放在画布区域上。
- HTML5拖曳事件：让低代码组件能够被拖曳。低代码组件的拖曳能力由Dragon实例提供，与拖曳相关的概念有如下3个。
  - DragObject：被拖曳的对象，指代画布中的低代码组件或组件面板上的低代码组件。
  - LocationEvent：携带的信息包含被拖曳的对象和拖曳过程中产生的坐标信息。
  - DropLocation：被拖曳对象在画布上最近的可放置点。

以拖曳组件面板中的低代码组件为例，在画布区域显示组件最近的可放置点，总体而言，需经历6个步骤：

1. 绑定拖曳事件：给iFrame和组件面板中的低代码组件绑定拖曳事件，得到DragObject。
2. 获取拖曳过程中的LocationEvent：LocationEvent将在iFrame的dragover事件处理程序中实时获取
3. 获取离鼠标最近的Node：Node被装载在渲染器环境中，只有SimulatorRenderer实例知道它们的位置，因此这一步需要调用SimulatorRenderer提供的getClosestNodeIdByLocation方法，使用的reactDomCollector保存了在画布上渲染的全部低代码组件的DOM节点，实现这一目的需借助React的ref属性。
4. 获取离拖曳对象最近的可放置容器：每个低代码组件都能设置嵌套规则，这个规则用于规定哪些组件能作为它的子元素和父元素。这一步将使用嵌套规则判断组件是否可放置。
5. 计算被拖曳的对象在容器中的插入点：容器可能包含多个子元素，这一步将利用鼠标位置计算被拖曳的对象在容器中的插入点，得到最终的DropLocation
6. 在界面上显示最近的插入位置：经过前面的步骤得到了插入位置，现在在界面上给用户显示相应的提示，这里使用状态管理库MobX，将Dragon实例变成一个可观察对象，使得当dragon.dropLocation的值发生变化时，InsertionView组件能重新渲染，给用户提示离拖曳对象最近的可插入点。

### 设置属性

低代码App整体由一个大的Schema来描述，该Schema由画布上Node的Schema嵌套构成。编辑属性实际上是用设置器修改Node的Schema。

#### 创建Node

设置属性围绕着Node进行，因此第一步是创建Node，创建Node需要传入初始Schema。属性设置器修改的是props和extraProps包含的属性。props包含哪些属性由低代码组件的开发者决定，它们的值被全部传递给低代码组件的实现。extraProps包含的属性由低代码引擎根据Node类型自动生成，其中涉及数据源、联动规则和表单控件的键名等。props和extraProps都是Props类的实例。

#### SettingTopEntry对象

Prop实例有自己的设置器，设置器最终显示在界面右侧的属性面板上，Node不直接与属性面板关联，而是通过SettingTopEntry对象与属性面板建立间接的联系。SettingTopEntry是Node上的一个属性，管理着多个SettingField，SettingField可以嵌套，嵌套到具体的设置器为止。属性面板上的每个设置器都对应一个SettingField，当设置器的值发生变化时，要调用SettingField上的方法修改Node的属性值。SettingField由SettingTopEntry创建。SettingTopEntry实例是一个可被MobX观察的对象，它能与视图层对接。

![lowcode20](/blog/images/architecture/lowcode20.png)

![lowcode21](/blog/images/architecture/lowcode21.png)

#### 属性面板

到目前为止，Node的settingTopEntry描述了属性面板有哪些配置项，接下来便是将它描述的内容显示在界面上。在视图层遍历settingTopEntry的fields属性。现在看SettingPanel组件，从组件名便能得知它不代表某个具体的配置项，而是将多个配置项组织在一起。SettingFieldView组件才是界面上显示的配置项，它接收的settingField实例用于修改Node的Prop。setter是属性设置器，是一个React组件，给它传入需要的属性便能在界面上显示相应的内容。其中value由field.getValue()取值，这是设置器当前的值，onChange对应field.setValue

### 修改属性

现在我们已经知道如何在界面上显示属性面板，也知道每个配置项都持有一个settingField实例，用户在面板上交互时，程序将调用settingField上的方法去修改Node的Prop。修改属性值的第一步是取属性现在的值。

- 从Node上取属性值：Node有多个Prop，settingField要取Node某个Prop的值，必须知道Prop的键名，因此取值分为两步，第一步取键名，第二步取键名所在的值。
- 修改Node上的属性值：先判断属性位于NodeSchema的extraProps上还是props上，然后调用API修改属性值，最后通知画布并把新的结果显示在界面上。

## 引擎启动时序图

![lowcode22](/blog/images/architecture/lowcode22.png)
