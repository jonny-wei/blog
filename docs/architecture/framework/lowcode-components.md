# 低代码组件设计与实现

低代码组件一般由两部分组成：

- 组件描述：对源码组件在低代码搭建平台中使用时所具备的配置能力和交互行为进行规范化描述，让不同平台对组件接入的实现保持一致，让组件针对不同的搭建平台接入时可以使用一份统一的描述内容，让组件在不同的业务中流通成为可能。
- 组件实现：源码组件针对低代码的实现，比如针对业务场景，定制低代码或者零代码的组件。

## 组件描述

单个组件描述内容为 json 结构，主要包含以下三部分内容，分别为：

- 基础信息： 描述组件的基础信息，通常包含包信息、组件名称、标题、描述等。
- 组件属性信息： 描述组件属性信息，通常包含参数、说明、类型、默认值 4 项内容。
- 能力配置/体验增强： 推荐用于优化搭建产品编辑体验，定制编辑能力的配置信息。

```js
{
  "componentName": "MyCustomComponent",  // 组件名称
  "title": "我的自定义组件",  // 组件标题
  "description": "这是一个示例自定义组件，用于展示如何配置低代码组件。",  // 组件描述
  "docUrl": "https://example.com/docs/my-custom-component",  // 组件文档链接
  "screenshot": "https://example.com/images/my-custom-component.png",  // 组件截图
  "icon": "https://example.com/icons/my-custom-component-icon.png",  // 组件图标
  "tags": ["自定义", "示例"],  // 组件标签
  "keywords": ["custom", "example"],  // 关键词
  "devMode": "lowCode",  // 开发模式，这里是 lowCode
  "npm": {  // NPM包信息
    "package": "@myorg/my-custom-component",  // 源码组件库名
    "exportName": "MyCustomComponent",  // 源码组件名称
    "subName": "",  // 子组件名（如果有）
    "destructuring": false,  // 是否解构
    "main": "lib/index.js",  // 组件路径
    "version": "1.0.0"  // 源码组件版本号
  },
  "props": [  // 组件属性列表
    {
      "name": "text",  // 属性名
      "type": "string",  // 属性类型
      "description": "显示的文本内容",  // 属性描述
      "defaultValue": "Hello, World!"  // 默认值
    },
    {
      "name": "color",  // 属性名
      "type": "string",  // 属性类型
      "description": "文本颜色",  // 属性描述
      "defaultValue": "#000000"  // 默认值
    }
  ],
  "configure": {  // 配置项
    "props": [  // 属性面板配置
      {
        "type": "field",  // 面板配置隶属于单个 field
        "name": "text",  // 设置字段名
        "title": "文本内容",  // 字段标题
        "setter": {  // 单个属性的 setter 配置
          "type": "StringSetter"  // 设置器类型
        }
      },
      {
        "type": "field",  // 面板配置隶属于单个 field
        "name": "color",  // 设置字段名
        "title": "文本颜色",  // 字段标题
        "setter": {  // 单个属性的 setter 配置
          "type": "ColorSetter"  // 设置器类型
        }
      },
      {
        "type": "group",  // 面板配置隶属于分组
        "name": "styleGroup",  // 分组名
        "title": "样式设置",  // 分组标题
        "items": [  // 分组内的设置项
          {
            "type": "field",  // 面板配置隶属于单个 field
            "name": "fontSize",  // 设置字段名
            "title": "字体大小",  // 字段标题
            "setter": {  // 单个属性的 setter 配置
              "type": "NumberSetter"  // 设置器类型
            }
          },
          {
            "type": "field",  // 面板配置隶属于单个 field
            "name": "backgroundColor",  // 设置字段名
            "title": "背景颜色",  // 字段标题
            "setter": {  // 单个属性的 setter 配置
              "type": "ColorSetter"  // 设置器类型
            }
          }
        ]
      }
    ],
    "component": {  // 组件能力配置
      "isContainer": false,  // 是否容器组件
      "isModal": false,  // 组件是否带浮层
      "isNullNode": false,  // 是否存在渲染的根节点
      "descriptor": "这是一个简单的自定义组件",  // 组件树描述信息
      "nestingRule": {  // 嵌套控制规则
        "parentWhitelist": ["Container"]  // 允许的父组件白名单
      },
      "isMinimalRenderUnit": true,  // 是否是最小渲染单元
      "rootSelector": ".my-custom-component-root",  // 组件选中框的 cssSelector
      "disableBehaviors": ["remove"],  // 禁用的行为
      "actions": [  // 用于详细配置上述操作项的内容
        {
          "type": "copy",  // 操作类型
          "title": "复制组件"  // 操作标题
        },
        {
          "type": "move",  // 操作类型
          "title": "移动组件"  // 操作标题
        }
      ]
    },
    "supports": {  // 通用扩展面板支持性配置
      "events": [  // 支持事件列表
        {
          "name": "onClick",  // 事件名
          "description": "点击事件"  // 事件描述
        }
      ],
      "className": true,  // 支持 className 设置
      "style": true,  // 支持样式设置
      "lifecycles": [],  // 支持生命周期设置
      "loop": false,  // 支持循环设置
      "condition": true  // 支持条件式渲染设置
    },
    "advanced": {  // 高级特性配置
      "context": {  // 上下文
        "theme": "dark"  // 上下文信息
      },
      "view": {  // 视图
        "type": "ReactElement",  // 视图类型
        "content": "<div>预览视图</div>"  // 视图内容
      },
      "transducers": [],  // 转换器
      "filters": [],  // 过滤器
      "autoruns": [],  // 自动运行
      "callbacks": {  // 回调
        "onNodeAdd": "function(node) { console.log('节点添加', node); }"  // 节点添加时的回调
      },
      "initialChildren": [  // 拖入容器时，自动带入 children 列表
        {
          "componentName": "Text",  // 子组件名称
          "props": {  // 子组件属性
            "text": "初始子节点"
          }
        }
      ],
      "isAbsoluteLayoutContainer": false,  // 是否是绝对布局容器
      "hideSelectTools": false,  // 是否隐藏选择工具
      "getResizingHandlers": "function(currentNode) { return [{ type: 'N', appearOn: 'mouse-hover' }, { type: 'S', appearOn: 'mouse-hover' }]; }",  // 获取调整大小的处理程序
      "liveTextEditing": [  // 实时文本编辑
        {
          "selector": ".editable-text",  // 选择器
          "propName": "text"  // 属性名
        }
      ]
    }
  },
  "snippets": [  // 代码片段
    {
      "title": "基本示例",  // 片段标题
      "screenshot": "https://example.com/images/snippet-basic.png",  // 片段截图
      "schema": {  // 待插入的 schema
        "componentName": "MyCustomComponent",
        "props": {
          "text": "示例文本",
          "color": "#ff0000"
        }
      }
    },
    {
      "title": "复杂示例",  // 片段标题
      "screenshot": "https://example.com/images/snippet-advanced.png",  // 片段截图
      "schema": {  // 待插入的 schema
        "componentName": "MyCustomComponent",
        "props": {
          "text": "复杂示例文本",
          "color": "#0000ff",
          "fontSize": 20,
          "backgroundColor": "#ffffff"
        }
      }
    }
  ],
  "group": "Custom",  // 组件所在的组
  "category": "Basic",  // 组件所在的类别
  "priority": 10  // 组件在同一类别中的优先级
}
```

## 组件消费方式

低代码组件最终被发布成npm包供低代码平台消费，组件被如何消费，取决于组件提供了哪些消费方式。组件有静态导入和动态加载这两种消费方式。

- 静态导入：使用ES6规范引入import关键字导入组件，该规范要求组件是一个ES6规范的模块。静态导入适用于导入确定的模块。
- 动态加载：动态加载指的是程序运行过程中按需加载组件。浏览器自身支持的动态加载有两种。第一种是动态嵌入脚本标签，引用远程资源的URL，例如JavaScript或CSS文件；第二种是ES动态导入，用法是import('模块路径')。

组件如何被消费？这里有一个不得不谈的问题：组件被打包成什么样的模块格式?

- UMD: 主要用来解决CommonJS规范和AMD规范不能通用的问题，同时还支持老式的全局变量。先判断是否存在exports和module，存在则认为这是CommonJS模块。再判断是否有define函数并且define.amd是否为真，有define函数且define.amd为真则认为这是AMD模块。如果前两步都不满足，则将模块公开到全局。
- ESM: 导入ES模块用到的关键字是import，它根据模块路径将模块导入当前模块，模块路径又称模块说明符。模块说明符一共有3种类型，分别是相对路径、绝对路径和bare（裸露）模式。。

从组件模块的打包结果来看，它不仅有一个index.min.js文件，还有一个index.esm.js文件，前者是符合UMD规范的模块，后者是符合ES modules规范的模块。

## 脚手架

为了让开发者快速创建低代码组件，我们需要一个脚手架工具，它可以自动生成组件的基本结构和配置文件。

1. 可执行的命令

   在项目的package.json文件中添加一个bin字段。这个字段会定义一个命令到文件的映射，这样当用户全局安装你的脚手架工具时，可以通过命令行直接执行。

2. 交互数据收集

   当用户开始创建一个新的项目时，你需要收集一些必要的信息，比如组件的英文名、中文名等。这可以通过命令行交互来实现。使用prompts库，你可以创建一个交互式的命令行界面，引导用户输入所需的信息。在用户输入信息后，你需要对这些数据进行格式化和验证。例如，使用validate-npm-package-name库来检查组件名是否符合npm包名的规范。

3. 项目模板下载

  一旦收集了用户的数据，下一步是下载项目模板。你可以使用download-git-repo库来从GitHub等代码托管平台下载模板。你需要指定模板的仓库地址，并指定下载到本地的路径

4. 模板引擎

  下载模板后，你需要使用模板引擎来替换模板中的占位符。handlebars是一个流行的模板引擎，可以用来完成这个任务。你将使用用户之前输入的数据，通过模板引擎替换模板文件中的相应占位符，从而生成个性化的项目结构。

5. 抽象语法树

  如果你的脚手架需要处理JavaScript或TypeScript代码，你可能需要使用抽象语法树（AST）来分析和修改代码。用转换之后的抽象语法树生成源代码。

6. 文件系统操作

  最后，你需要使用文件系统操作库，例如fs-extra，来完成文件的创建、复制、重命名等操作。

组件开发脚手架的核心功能是创建一个新的项目，它需要收集用户的输入，下载模板，替换占位符，生成项目结构，并完成一些必要的文件操作。

## 组件开发

组件开发需要注意以下几个方面：

- 组件描述：给 props 接口中的字段写注释，这不仅可以生成对使用者友好的组件文档，还可以生成组件描述。
- 组件实例：组件需要接收 Ref，并将其绑定到组件的根 dom 节点上，这是为了在设计态时拖曳组件能计算出组件的插入位置。
- 属性设置器：属性设置器是一个React组件，低代码使用者用引擎设计App时，设置器为他们提供修改组件属性值的接口，使用体验如同填写表单。属性设置器接收的value是属性的当前值，onChange用来修改属性的当前值。
- 测试与发布：组件编写单元测试，发布到 NPM。使用 npm 的 CDN 托管服务，比如 unpkg，用包名+版本号拼接出组件资源的URL。

## 自动低代化

自动生成低代码组件的核心是通过分析组件的源码，提取出组件的属性、事件、样式等信息，然后生成低代码组件的描述文件。

下面是一个简易的 `lowcode-material-parser` 核心实现：

- 对SourceFile进行语义分析。
- 用react-docgen-typescript得到componentInfo。
- 处理componentInfo的props字段，处理的字段有属性的默认值、属性的数据类型和属性设置器。
  - 属性的默认值：由于组件规格最终被保存到JSON文件中，因此它必须是可JSON序列化的。扫描组件源码之后，函数将被转换成字符串的形式，TypeScript代码不能直接在浏览器中运行，还要调用typescript模块的编译器API将TypeScript代码转换成JavaScript代码
  - 属性的数据类型：用一个大的条件判断语句去处理各种取值。propType的取值参考了prop-types包导出的各个类型。
  - 属性设置器：设置器的取值由属性的数据类型决定，比如，字符串属性的设置器为StringSetter。

```js
import { resolve } from 'path';
import fs from 'fs-extra';
import parse from './parse/index'

export default async function run(componentAbsolutePath: string, args: {workDir: string, tsconfigFileName?: string}): Promise<string> {
    const componentDoc = parse(componentAbsolutePath, args)[0] || {}
    const { componentConfig = {}, version = '0.0.0', description, name } = JSON.parse(fs.readFileSync( resolve(process.cwd(), 'package.json'), {encoding: 'utf-8'} ))
    // 如果该组件能接受 children 属性就说明它是容器组件
    const isContainer = !!(componentDoc.props||[]).find(prop => prop.name === 'children')
    // children 不在属性面板中配置，而是从组件面板中拖入，所以这里去掉 children 属性
    componentDoc.props = isContainer ? componentDoc.props.filter(prop => prop.name !== 'children'): componentDoc.props
    // 该组件是否能接受样式
    const isSupportStyle = !!(componentDoc.props||[]).find(prop => prop.name === 'style')
    // 样式在属性面板中配置，而是在样式面板中配置，所以这里去掉 style 属性
    componentDoc.props = isContainer ? componentDoc.props.filter(prop => prop.name !== 'style'): componentDoc.props

    return JSON.stringify(
        {
          componentName: componentConfig.name || '',
          packageName: name,
          title: componentConfig.title || '',
          iconUrl: componentConfig.iconUrl || '',
          description,
          docUrl:`https://unpkg.com/${name}@${version}/docs/index.html`,
          version: version,
          props: componentDoc.props ? componentDoc.props: [],
          // "base"|"layout"|"subjoin"，描述该组件位于组件面板中哪个区域
          group: 'subjoin',
          advanced: {
            // 组件的嵌套规则
            nestingRule: {
              // 父级组件白名单
              // 非容器组件必须放置在容器组件中
              parentWhitelist: isContainer ? ['Page']: ['Layout-*'],
              // 子组件白名单。
              // 空数组则说明其他组件不能放置在该组件中, undefined 则说明其他组件能放置在该组件中
              childWhitelist: isContainer ? undefined: []
            },
            supports: {
              // 是否能配置样式
              styles: isSupportStyle,
              // 是否能配置校验规则
              validation: false,
              // 是否能配置联动规则
              linkage: false,
              // 支持的事件列表，空数组意味着不支持任何事件
              events: []
            },
            component: {
              // 是否是容器
              isContainer: isContainer,
              // 容器类型，非必填，可选值：‘Layout’、‘Data’、‘Page’
              containerType: isContainer ? 'Layout': undefined,
              // 是否是表单组件
              isFormControl: false,
             },
          },
        },
        null,
        2,
    )
}
```

核心的解析器是 `parse/index.ts`，它会解析组件的源码，提取出组件的属性信息。

```js
import findConfig from 'find-config'; // 用于查找项目中的配置文件，如tsconfig.json
import ts from 'typescript'; // TypeScript的类型定义和API
import { Parser } from 'react-docgen-typescript'; // 用于解析TypeScript文件中的React组件信息
import _ from 'lodash'; // 一个常用的JavaScript工具库，这里用于检查对象是否为空
import fs from 'fs-extra'; // 一个扩展了Node.js内置fs模块的库，提供了更多便利的文件操作API
import { transformProp } from './transform'; // 一个自定义的函数，用于转换属性信息
import { Prop } from '../schema/type'; // 定义了属性（Prop）的数据结构

// 创建TypeScript编译程序（Program），用于后续的类型检查和AST操作
function createProgram(filePath: string, args: { workDir: string; tsconfigFileName?: string }) {
  const tsconfigFileName = args.tsconfigFileName || 'tsconfig.json'; // 如果没有指定tsconfig文件名，则默认为tsconfig.json
  const tsConfigPath = findConfig(tsconfigFileName, { cwd: args.workDir }); // 在指定的工作目录中查找tsconfig.json文件

  if (!tsConfigPath) {
      throw new Error(`在 ${args.workDir} 没有找到 tsconfig.json`);
  }

  // 读取并解析tsconfig.json文件
  const { config, error } = ts.readConfigFile(tsConfigPath, (filename) => {
      return fs.readFileSync(filename, 'utf8')
  });

  if (error !== undefined) {
      throw new Error(`在 ${args.workDir} 不能加载 tsconfig.json，错误码 ${error.code}, 错误信息 ${error.messageText}`);
  }

  // 解析tsconfig.json中的配置，并创建一个TypeScript程序
  const { options, errors } = ts.parseJsonConfigFileContent(config, ts.sys, args.workDir, {}, tsConfigPath);

  if (errors.length) {
      throw errors[0];
  }
  return ts.createProgram([filePath], options); // 创建TypeScript程序，用于后续的类型检查和AST操作
}

// 获取默认导出的Symbol
function getExportDefaultSymbol(checker: ts.TypeChecker, node: ts.Node) {
  const symbol = checker.getSymbolAtLocation(node);

  if (!symbol) {
      return undefined;
  }
  const exportSymbols = checker.getExportsOfModule(symbol);
  let exportDefaultSymbol: ts.Symbol | undefined = undefined;

  for (let index = 0; index < exportSymbols.length; index++) {
      const sym: ts.Symbol = exportSymbols[index];

      // 排除命名导出
      if (sym.getName() !== "default") {
        continue;
      }

      sym.valueDeclaration =
        sym.valueDeclaration || (Array.isArray(sym.declarations) ? sym.declarations[0] : undefined);

      if (!sym.valueDeclaration) {
        continue;
      }
      exportDefaultSymbol = sym;
      break;
  }

  return exportDefaultSymbol;
}

// 获取组件信息
function getComponentInfo(filePath: string, args: { workDir: string; tsconfigFileName?: string }) {
  const program = createProgram(filePath, args);
    
  const sourceFile = program.getSourceFile(filePath);

  if (!sourceFile) {
      return null;
  }
  const checker = program.getTypeChecker();
  let exportDefaultSymbol = getExportDefaultSymbol(checker, sourceFile);

  if (!exportDefaultSymbol) {
    return null;
  }
  const parser = new Parser(program, {});

  return parser.getComponentInfo(exportDefaultSymbol, sourceFile);
}

// 默认导出函数，用于解析文件并提取组件的属性信息
export default function(filePath: string, args: { workDir: string; tsconfigFileName?: string }): { props: Prop[] }[] {
    if (!filePath) {
        return [];
    }

    const componentInfo = getComponentInfo(filePath, args);
    if (!componentInfo || !componentInfo.props || _.isEmpty(componentInfo.props)) {
      return [];
    }

    const propsName = Object.keys(componentInfo.props);
    const props: Prop[] = [];

    propsName.forEach(name => {
      if (!name.startsWith('aria-')) {
        try {
          const item: Prop = transformProp(name, componentInfo.props[name]);
          props.push(item);
        } catch (e) {
          console.error(e);
        }
      }
    })

    return [{ props }];
}
```

主要功能是解析TypeScript文件中的React组件，提取其属性信息，并进行一些转换处理。它使用了react-docgen-typescript库来解析组件信息，lodash库来检查对象是否为空，以及fs-extra库来读取文件。代码中还定义了一些自定义函数，如transformProp，用于转换属性信息。
