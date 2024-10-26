# 入料引擎

入料模块负责物料接入，能自动扫描、解析源码组件，并产出一份符合[**《中后台低代码组件描述协议》**](https://lowcode-engine.cn/site/docs/specs/material-spec#22-%E4%BD%8E%E4%BB%A3%E7%A0%81%E8%A7%84%E8%8C%83)的 **JSON Schema(物料解析输出符合搭建协议的描述)**。这份Schema包含基础信息和属性描述信息部分，低代码引擎会基于它们在运行时自动生成一份configure字段，用作设置面板展示。如果有需要补充的属性描述信息，或者需要定制体验增强部分(如修改Setter、调整展示顺序等)，可以手动修改生成的Schema。

源码物料 ---> 协议 ---> 入料模块(接入器、扫描器、解析器、转换器、生成器、校验器) ---> JSON Schema描述文件(低代码物料) ---> 设计器

## 整体架构

![lowcode9](/blog/images/architecture/lowcode9.png)

**架构说明与解析（重点）：**

入料引擎核先要完成的工作是接收 MATERIAL 通过多种不同的接入渠道发起接入请求，经扫描器扫描分析出 MATERIAL 的入口文件和层次结构(中间态schema)后，再由解析器解析 MATERIAL 源码生成一棵 AST 并从中提取出一些关键信息，并交由生成器生成引擎产物的整个过程。

整个过程可以分为扫描、解析、生成产物三个阶段，每个阶段都有对应的处理器来进行处理，分别对应扫描器、解析器、生成器。

在流程开始阶段，MATERIAL 会先向引擎核心发起接入请求，引擎核心会将这个请求分发给扫描器，扫描器 再根据 MATERIAL 接入渠道的不同来调度不同的扫描器，如：Local 渠道会映射到 LocalScanner、Web 渠道会映射到  WebScanner。因为每种不同的渠道都有其特殊场景特点，Local 渠道适用于拥有一套完整的本地开发环境的开发者，更关注于 MATERIAL 功能实现； Web 渠道适用于使用者，更关注于功能使用。

进入扫描阶段后，扫描器将请求映射到对应的扫描器后，扫描器就会立即开始对 MATERIAL 源码进行扫描分析，得出 MATERIAL **入口文件**和**层次结构**，然后会将这些信息传递下一阶段的解析器，此时会进入到解析阶段。

进入解析阶段后，解析器会分析并识别出 MATERIAL 所处的生态（DSLType），如：React、Vue、Rax。每种生态会分别对应一个解析器，如：React 会对应 ReactParser、Vue 会对应 VueParser。解析器 ③ 会解析 MATERIAL 源码并生成一棵语法树 AST，然后分析语法树 AST 从中抽取出下一阶段需要的关键信息，如：exportName、props、defaultProps 等。

进入生成阶段后，生成器会先判断 MATERIAL 的接入渠道是哪一种，如果是 Local，则调度 LocalGenerator；如果是 Web，则调度 WebGenerator；然后再根据解析器传递过来的信息生成引擎产物，主要包括：MANIFEST 配置文件、CONTAINER 装饰文件和最终会被使用到的 MATERIAL 物料。这一阶段存在的业务扩展点是一键上传和可视化配置 MANIFEST，一键上传功能可以根据实际的需求场景将 MATERIAL 上传到对应的平台，可视化配置则可以根据实际的需求来定制需要让用户可视化地进行配置。

## 原理

入料模块使用动静态分析结合的方案，动态胜在真实，静态胜在细致，不过全都依赖源码中定义的属性，若未定义，或者定义错误，则无法正确入料。

::: tip lowcode-engine/modules/material-parser  重点使用以下包和API：

- [react-docgen](https://github.com/reactjs/react-docgen)
- [react-docgen-typescript](https://github.com/styleguidist/react-docgen-typescript)
- [TypeScript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API)
:::

```json
// modules/material-parser/package.json
"dependencies": {
    "ajv": "^6.12.0", // 非常快的 JSON Schema 校验器。Ajv 生成代码以将 JSON 模式转换为对 v8 优化有效的超快速验证函数。旨在通过将 JSON 模式即时编译为代码来实现最佳的验证性能。
    "ast-types": "^0.13.3", // 一种高效、模块化的 AST 类型系统的解析器，该库能够提供出色的节点迭代和遍历机制。
    "cross-spawn-promise": "^0.10.2", // promise 跨平台写法，不用开发者处理跨平台的逻辑。
    "debug": "^4.1.1",
    "find-config": "^1.0.0", // 目录及文件查找
    "fs-extra": "^8.1.0", // 在 node 内置的 fs(文件系统交互) 的基础上，社区提供的 fs-extra 工具包增强文件系统交互，并且提供了 Promise 的调用方式。
    "lodash": "^4.17.15",
    "parse-prop-types": "^0.3.0", // 在运行时将React 解析prop-types为可读对象。
    "prop-types": "^15.7.2",
    "react-docgen": "5.3.0", // 从React组件中提取信息，并从中生成文档。它使用 ast-types 和 @babel/parser 将源码解析为 AST，并提供处理此 AST 以提取所需信息的方法。输出/返回值是一个 JSON blob / JavaScript 对象。
    "react-docgen-typescript": "^1.16.5", // TypeScript 中定义的 React 属性的简单解析器，而不是 propTypes。
    "safe-eval": "^0.4.1", // 更安全的 eval() 版本.
    "short-uuid": "^3.1.1", // 创建和翻译具有较短格式的标准 UUID 唯一值
    "ts-polyfill": "^3.8.1-rc",
    "typescript": "3.9.4",
    "vm2": "^3.9.2" // vm2 是一个沙箱，可以使用列入白名单的 Node 内置模块运行不受信任的代码。安全！
}
```

### 整体流程

大体分为本地化(接入器)、扫描、解析、转换、生产、校验 6 部分。（DSL）

![lowcode10](/blog/images/architecture/lowcode10.png)

```javascript
// modules/material-parser/src/index.ts
export default async function (options: IMaterializeOptions): Promise<ComponentMeta[]> {
  const { accesser = 'local', dslType } = options;

  // 接入器：物料接入渠道及配置
  let { entry = '' } = options;
  const internalOptions: IInternalMaterializeOptions = {
    ...options,
    accesser,
    entry: options.entry || '',
    root: (options as IMaterializeLocalOptions)?.root || '',
  } as IInternalMaterializeOptions;

  // 本地接入
  if (accesser === 'local') {
    const { root } = options as IMaterializeLocalOptions;
    internalOptions.root = root;
    if (!root) {
      const stats = lstatSync(entry);
      if (stats.isDirectory()) {
        internalOptions.root = entry;
      } else {
        internalOptions.root = process.cwd();
      }
    } else if (!isAbsolute(entry)) {
      internalOptions.entry = join(root, entry);
    }
  }

  let workDir = internalOptions.root || '';
  let moduleDir = '';
  // 线上接入
  if (accesser === 'online') {
    // 本地化：创建临时文件，创建组件包
    const result = await localize(internalOptions as IMaterializeOnlineOptions);
    workDir = result.workDir;
    moduleDir = result.moduleDir;
    internalOptions.entry = result.entry ? join(moduleDir, result.entry) : moduleDir;
    internalOptions.root = moduleDir;
  }

  // 扫描器：根据接入渠道的不同来调度不同的扫描器，得出物料入口文件和层次结构给到解析器
  const scanedModel = await scan(internalOptions); 
  // 解析器：每种生态（dslType）会分别对应一个解析器，解析 MATERIAL 源码并生成一棵语法树 AST, AST 收取关键信息
  const parsedModel = await parse({
    ...scanedModel,
    dslType,
    accesser,
    npmClient: internalOptions.npmClient,
    workDir,
    moduleDir,
  });
  // 生成器：不同的渠道不同的生成器，生成引擎产物
  const result = await generate(scanedModel, parsedModel, internalOptions);
  if (workDir && accesser === 'online') {
    await remove(workDir); // 移除临时文件
  }
  return result;  // json schema
}
```

### 接入器

用于定义物料化组件的接入渠道(接入配置项)，接入方式见上文(入料方式)，线上接入渠道需要本地化(localize)。

```js
  // 本地接入
  if (accesser === 'local') {
    const { root } = options as IMaterializeLocalOptions;
    internalOptions.root = root;
    if (!root) {
      const stats = lstatSync(entry);
      if (stats.isDirectory()) {
        internalOptions.root = entry;
      } else {
        internalOptions.root = process.cwd();
      }
    } else if (!isAbsolute(entry)) {
      internalOptions.entry = join(root, entry);
    }
  }

  let workDir = internalOptions.root || '';
  let moduleDir = '';

  // 线上接入
  if (accesser === 'online') {
    // 本地化：创建临时文件，创建组件包
    const result = await localize(internalOptions as IMaterializeOnlineOptions);
    workDir = result.workDir;
    moduleDir = result.moduleDir;
    internalOptions.entry = result.entry ? join(moduleDir, result.entry) : moduleDir;
    internalOptions.root = moduleDir;
  }
```

### 扫描器

根据接入渠道的不同来调度不同的扫描器，得出物料入口文件和层次结构（文件、目录层次路径）给到解析器

```javascript
export default async function scan(
  options: IInternalMaterializeOptions,
): Promise<IMaterialScanModel> {
  // 扫描生成阶段产物
  const model: IMaterialScanModel = {
    pkgName: '',
    pkgVersion: '',
    mainFileAbsolutePath: '',
    mainFilePath: '',
  };
  // ... 省略 model 阶段产物赋值逻辑
  return model; // 得出物料入口文件和层次结构（文件、目录层次路径）给到解析器
}

/**
 * 对应扫描阶段的产物
 */
export interface IMaterialScanModel {Ï
  /** 当前包名 */
  pkgName: string;
  /** 当前包版本 */
  pkgVersion: string;
  /** 在ts场景下，使用entry */
  useEntry?: boolean;
  /** main文件相对路径 */
  mainFilePath: string;
  /** module文件相对路径 */
  moduleFilePath?: string;
  /** typings文件相对路径 */
  typingsFilePath?: string;
  /** main文件绝对路径 */
  mainFileAbsolutePath: string;
  /** module文件绝对路径 */
  moduleFileAbsolutePath?: string;
  /** typings文件绝对路径 */
  typingsFileAbsolutePath?: string;
}
```

### 解析器

- 静态解析（parseTS & parseJS ）
- 动态解析（parseDynamic）

#### 静态解析 - JS

在 JS 情况下，基于 react-docgen 进行扩展，自定义了 resolver 及 handler，前者用于寻找组件定义，后者用于解析 propTypes、defaultProps 等信息，在静态分析时，分为 JS和 TS 两种情况。parseTS 和  parseJS 两种解析器。整体流程图如下：

![lowcode11](/blog/images/architecture/lowcode11.png)

react-docgen 使用 babel 生成语法树，再使用 ast-types 进行遍历去寻找组件节点及其属性类型定义。原本的 react-docgen 只能解析单文件，且不能解析 IIFE、逗号表达式等语法结构 (一般出现在转码后的代码中)。笔者对其进行改造，使之可以递归解析多文件去查找组件定义，且能够解开 IIFE，以及对逗号表达式进行转换，以方便后续的组件解析。另外，还增加了子组件解析的功能，即类似 `Button.Group = Group` 这种定义。

react-docgen 是一个 CLI 和工具箱，可帮助从 React 组件中提取信息并从中生成文档。它使用 ast 类型和 @ babel / parser 将源解析为 AST，并提供处理此 AST 的方法以提取所需的信息。输出/返回值是一个 JSON blob / JavaScript 对象。简单来说就是：它能提取组件的相关信息。

```javascript
const reactDocs = require('react-docgen');

export default function parse(filePath: string): IMaterialParsedModel[] {
  if (!filePath) return [];
  // 根据文件路径加载文件 stream Buffer
  const fileContent = loadFile(filePath);
  // react-docgen 使用 babel 生成语法树，再使用 ast-types 进行遍历去寻找组件节点及其属性类型定义
  // 递归解析多文件去查找组件定义，且能够解开 IIFE，以及对逗号表达式进行转换，以方便后续的组件解析
  const result = reactDocs.parse(
    fileContent, // source 物料源文件
    (ast: any) => { // resolver 解析器 给定一个 AST 和对解析器的引用，它返回一个（数组）NodePath，它表示组件定义。
      ast.__path = filePath;
      return resolver(ast); // resolver 寻找组件定义
    },
    handlers, // 提取 ast 部分信息，propTypes、defaultProps 等
    {
      filename: filePath, // 与当前正在解析的代码关联的文件的绝对路径（如果有的话）。这用于搜索正确的 babel 配置。
    },
  );
  // 组件描述信息
  const coms = result.reduce((res: any[], info: any) => {
    if (!info || !info.props) return res;
    const props = Object.keys(info.props).reduce((acc: any[], name) => {
      try {
        const item: any = transformItem(name, info.props[name]);
        acc.push(item);
      } catch (e) {
        // TODO
      }
      return acc;
    }, []);
    res.push({
      componentName: info.displayName,
      props,
      meta: info.meta || {},
    });
    return res;
  }, []);
  
  return coms;
}

// 返回以下内容
export interface IMaterialParsedModel {
  // filePath: string;
  componentName: string;
  props?: PropsSection['props'];
  meta?: {
    exportName?: string;
    subName?: string;
  };
}
```

##### 静态解析 - TS

在 TS 情况下，还要再细分为 **TS 源码**和 **TS 编译后的代码**。 TS 源码中，React 组件具有类型签名; TS 编译后的代码中，dts 文件(如有)包含全部的 class /interface/type 类型信息。可以从这些类型信息中获取组件属性描述。

![lowcode12](/blog/images/architecture/lowcode12.png)

react-docgen 内置了 TypeScript 的 babel 插件，所以也**具备解析 interface 的能力，可惜能力有限**，babel 只能解析 TS 代码，但没法做类型检查，类型处理是由 react-docgen 实现的，它对于 extends/implements/utility 的情况处理不好，并且没有类型推断，虽然可以对其功能进行完 善，不过这种情况下，应该借助 TypeScript Compiler 的能力，而非自己造轮子。通过调研，发现市面上有 **typescript-react-docgen** 这个项目。它在底层依赖了 TypeScript，且产出的数据格式 与 react-docgen 一致，所以我们选择基于它进行解析。

TypeScript Compiler 会递归解析某个文件中出现及引用的全部类型，当然，前提是已经定义或安装了相应的类型声明。**typescript-react-docgen 会调用 TypeScript Compiler 的 API，获取每个文件输出的类型，判断其是否为 React 组件**。满足下列条件之一的，会被判定为 React 组件:

- 获取其函数签名，如果只有一个入参，或者第一个入参名称为 props ，会被判定为函数式组件;

- 获取其 constructor 方法，如果其返回值包含 props 属性，会被判定为有状态组件。

然后，**遍历组件的 props 类型，获取每个属性的类型签名字符串**，比如 `(a: string) => void`。 typescript-react-docgen 可以克服 react-docgen 解析 TypeScirpt 类型的问题，但是每个类型都以字符串的形式来呈现，不利于后续的解析。所以，笔者对其进行了扩展，**递归解析每一层的属性值。此外，在函数式组件的判定上，笔者做了完善，会看函数的返回值是否为 ReactElement ，若是，才为函数式组件。**

[TS抽取组件描述](https://www.yuque.com/xiwen-bxuha/pr/ts-trick)

#### 动态解析

当一个组件，使用静态解析无法入料时，会使用动态解析。

![lowcode13](/blog/images/architecture/lowcode13.png)

基本思想很简单，require 组件进来，然后读取其组件类上定义的 propTypes 和 defaultProps 属性。这里使用了**parse-prop-types**库，使用它的时候必须在组件之前引用，因为它会先对 prop- types 库进行修改，在每个 PropTypes 透出的函数上挂上类型，比如 string, number 等等，然后再去遍历。**动态解析可以解析出全部的类型信息，因为 PropTypes 有可能引入依赖组件的一些类型定义，这在静态解析中很难做到，或者成本较高，而对于动态解析来说，都由运行时完成了。**

**技术细节**：值得注意的是，**有些 js 文件里还会引入 css 文件**，而且从笔者了解的情况来看，这种情况在集团内部不在少数。这种组件不配合 webpack 使用，肯定会报错，但是**使用 webpack 会明显拖慢速度**，所以笔者采用了 **sandbox** **的方式**，**对 require 进来的类 css 文件进行 mock**。这里，笔者使用了 **vm2**  这个库，它对 node 自带的 vm 进行了封装，可以**劫持文件中的 require 方法**。因为 parse-prop-types 的修改在沙箱中会失效，所以笔者也 mock 了组件中的 prop-types 库。

```js
import parseDynamic from './dynamic';
import parseJS from './js';
import parseTS from './ts';
import { install, installPeerAndDevDeps, syncTypeModules, installTypeDTS } from '../utils';
import { IMaterialScanModel, DSLType } from '../types';
import { debug } from '../core';

const log = debug.extend('parse');

export interface IParseArgs extends IMaterialScanModel {
  accesser?: 'online' | 'local';
  dslType?: DSLType;
  npmClient?: string;
  workDir: string;
  moduleDir: string;
  typingsFileAbsolutePath?: string;
  mainFileAbsolutePath: string;
  moduleFileAbsolutePath?: string;
}

export function isTSLike(str) {
  return str.endsWith('ts') || str.endsWith('tsx');
}

export default async (args: IParseArgs) => {
  const {
    typingsFileAbsolutePath,
    mainFileAbsolutePath,
    moduleFileAbsolutePath = mainFileAbsolutePath,
    useEntry = false,
  } = args;
  if (args.accesser === 'local') {
    if (isTSLike(mainFileAbsolutePath)) {
      await install(args);
      // in case the developer forgets to install types
      await installTypeDTS(args);
      return parseTS(mainFileAbsolutePath, args);
    } else if (typingsFileAbsolutePath) {
      await installTypeDTS(args);
      return parseTS(typingsFileAbsolutePath, args);
    } else {
      try {
        return parseJS(moduleFileAbsolutePath || mainFileAbsolutePath);
      } catch (e) {
        log(e);
        await install(args);
        const info = parseDynamic(mainFileAbsolutePath);
        if (!info || !info.length) {
          throw Error();
        }
        return info;
      }
    }
  } else if (args.accesser === 'online') {
    // ts
    const entryPath = useEntry ? mainFileAbsolutePath : typingsFileAbsolutePath;
    if (entryPath && isTSLike(entryPath)) {
      await syncTypeModules(args);
      await install(args);
      await installTypeDTS(args);
      await installPeerAndDevDeps(args);
      return parseTS(entryPath, args);
    }
    // js
    try {
      // try dynamic parsing first
      await installPeerAndDevDeps(args);
      const info = parseDynamic(mainFileAbsolutePath);
      if (!info || !info.length) {
        throw Error();
      }
      return info;
    } catch (e) {
      log(e);
      // if error, use static js parsing instead
      return parseJS(moduleFileAbsolutePath || mainFileAbsolutePath);
    }
  }
  return parseJS(moduleFileAbsolutePath || mainFileAbsolutePath);
};
```

### 生成器

生成引擎产物，主要包括：MANIFEST 配置文件、CONTAINER 装饰文件和最终会被使用到的 MATERIAL 物料。这一阶段存在的业务扩展点是一键上传和可视化配置 MANIFEST，一键上传功能可以根据实际的需求场景将 MATEIRAL 上传到对应的平台，可视化配置则可以根据实际的需求来定制需要让用户可视化地进行配置。

```javascript
export default async function (
  matScanModel: IMaterialScanModel, // 扫描阶段的产物 包名、入口文件、文件目录与路径
  matParsedModels: IMaterialParsedModel[], // 解析器分析出的一些关键信息 组件名、props、meta
  options: IInternalMaterializeOptions, // 接入器渠道配置
): Promise<ComponentMeta[]> { // 返回 低代码组件协议的 json schema
  
  const containerList = [];

  for (const matParsedModel of matParsedModels) {
    // 默认排除掉 defaultExportName 为空的组件
    if (!matParsedModel.componentName) {
      continue;
    }
    // 组装 manifest
    const manifest: any = await genManifest(matScanModel, matParsedModel, options);

    containerList.push(manifest);
  }

  return containerList; // 低代码组件协议的 json schema  低代码组件开发就是根据协议配置这份 schema 进行物料的流通和编辑器中使用
}

/**
 * 生成 manifest
 *
 * @param {IMaterialParsedModel} matParsedModel
 * @returns {Promise<
 *     manifestObj: ComponentMeta, // 组件描述
 *   >}
 * @memberof LocalGenerator
 */
export async function genManifest(
  matScanModel: IMaterialScanModel,
  matParsedModel: IMaterialParsedModel,
  options: IInternalMaterializeOptions,
): Promise<ComponentMeta> {
  const manifestObj: Partial<ComponentMeta> = {
    componentName: matParsedModel.componentName,
    title: matScanModel.pkgName,
    docUrl: '',
    screenshot: '',
    devMode: 'proCode', // 需要入料的组件都是源码模式，低代码组件在平台上即可直接生成描述
    npm: {
      package: matScanModel.pkgName,
      version: matScanModel.pkgVersion,
      exportName: matParsedModel.meta?.exportName || matParsedModel.componentName,
      main:
        options.root && path.isAbsolute(matScanModel.mainFilePath)
          ? path.relative(options.root, matScanModel.mainFilePath)
          : matScanModel.mainFilePath,
      destructuring: matParsedModel.meta?.exportName !== 'default',
      subName: matParsedModel.meta?.subName || '',
    },
  };

  // 填充 props
  manifestObj.props = matParsedModel.props;
  // 执行扩展点
  return manifestObj as ComponentMeta;
}
```

### 转换器

计算、适配与转换

```js
// modules/material-parser/src/parse/transform.ts
export function transformItem(name: string, item: any) {
  const {
    description,
    flowType,
    tsType,
    type = tsType || flowType,
    optional,
    required = optional,
    defaultValue,
    ...others
  } = item;
  const result: any = {
    name,
  };

  if (type) {
    result.propType = transformType({
      ...type,
      ...omit(others, ['name']),
      required: !!required,
    });
  }
  if (description) {
    if (description.includes('\n')) {
      result.description = description.split('\n')[0];
    } else {
      result.description = description;
    }
  }
  if (!isNil(defaultValue) && typeof defaultValue === 'object' && isEvaluable(defaultValue)) {
    if (defaultValue === null) {
      result.defaultValue = defaultValue;
    } else if ('computed' in defaultValue) {
      // parsed data from react-docgen
      try {
        if (isEvaluable(defaultValue.value)) {
          result.defaultValue = safeEval(defaultValue.value);
        } else {
          result.defaultValue = defaultValue.value;
        }
      } catch (e) {
        log(e);
      }
    } else {
      // parsed data from react-docgen-typescript
      result.defaultValue = defaultValue.value;
    }
  }
  if (result.propType === undefined) {
    delete result.propType;
  }

  return result;
}
```

### 校验器

```javascript
import Ajv from 'ajv';
import { Json } from '../types/Basic';
import schema from './schema.json';

const ajv = new Ajv({ jsonPointers: true });
const validate = ajv.compile(schema);

export default function validateSchema(json: Json) {
  if (validate(json) === false) {
    throw new Error(JSON.stringify(validate.errors, null, 2));
  }

  return true;
}
```

## 入料解析整体流程

![lowcode14](/blog/images/architecture/lowcode14.png)

- 目前的静态分析和动态分析是分离的，当静态分析失败后，才会尝试动态分析，而且动态时拿不到静态的信息，比如注释等。未来应该结合动态和静态分析，出于速度考虑，优先尝试静态分析，失败后，先静态插桩，再动态分析；
- 目前，用户需正确且完整地定义propTypes或者TypeScript类型，否则入料会错误或者不全。未来，应该结合AI技术，根据组件代码，自动推断出组件的属性（当然，这一步应该前置到写代码的阶段）；
- 组件描述，其实不只可以用在低代码搭建，还可以用来生成组件文档、mock数据等，之后需要结合其他上下游插件，发挥更大作用。

[入料模块设计](https://lowcode-engine.cn/site/docs/guide/design/materialParser)
