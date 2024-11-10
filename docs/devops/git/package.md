# 包管理 及 package.json

在 `Node.js` 中，模块是一个库或框架，也是一个 `Node.js` 项目。`Node.js` 项目遵循模块化的架构，当我们创建了一个 `Node.js` 项目，意味着创建了一个模块，这个模块必须有一个描述文件，即 `package.json`。

![package1](/blog/images/devops/package1.png)

## 基本属性

`package.json` 中有非常多的属性，其中必须填写的只有两个：`name` 和 `version` ，这两个属性组成一个 `npm` 模块的唯一标识。

1. `name` 即模块名称，其命名时需要遵循官方的一些规范和建议：

- 包名会成为模块`url`、命令行中的一个参数或者一个文件夹名称，任何非`url`安全的字符在包名中都不能使用，可以使用 `validate-npm-package-name` 包来检测包名是否合法。
- 语义化包名，可以帮助开发者更快的找到需要的包，并且避免意外获取错误的包。
- 若包名称中存在一些符号，将符号去除后不得与现有包名重复
  - 例如：由于`react-native`已经存在，`react.native`、`reactnative`都不可以再创建。
- 如果你的包名与现有的包名太相近导致你不能发布这个包，那么推荐将这个包发布到你的作用域下。
  - 例如：用户名 `conard`，那么作用域为 `@conard`，发布的包可以是`@conard/react`。

`name` 是一个包的唯一标识，不得和其他包名重复，我们可以执行 `npm view packageName` 查看包是否被占用，并可以查看它的一些基本信息

2. `description`用于添加模块的的描述信息，方便别人了解你的模块。

3. `keywords`用于给你的模块添加关键字。

当然，他们的还有一个非常重要的作用，就是利于模块检索。当你使用 `npm search` 检索模块时，会到`description` 和 `keywords` 中进行匹配。写好 `description` 和 `keywords` 有利于你的模块获得更多更精准的曝光：

4. `homepage` 用于指定该模块的主页。

5. `repository` 用于指定模块的代码仓库。

6. `bugs` 指定一个地址或者一个邮箱，对你的模块存在疑问的人可以到这里提出问题。

7. `main` 属性可以指定程序的主入口文件，例如， `antd` 指定的模块入口 `lib/index.js` ，当我们在代码用引入 `antd` 时：`import { notification } from 'antd';` 实际上引入的就是 `lib/index.js` 中暴露出去的模块。

8. `files` 属性用于描述你 `npm publish` 后推送到 `npm` 服务器的文件列表，如果指定文件夹，则文件夹内的所有内容都会包含进来。

9. `sideEffects`：用于告诉打包工具（如Webpack、Rollup、Parcel等）项目中的哪些文件是“副作用免费”的（side-effect free）。副作用免费意味着这些文件除了导出内容外，不会对外部环境产生任何影响，也就是说，它们不会产生任何外部的DOM操作、不会执行API调用、不会读取或写入文件等。这个属性的主要作用是：
    - 优化打包体积：当打包工具知道某个包是副作用免费的，它可以安全地将多个入口点（entry points）合并到一个文件中，而不用担心不同模块之间的代码会有相互影响。这样可以减少最终打包文件的大小，因为不需要重复打包相同的代码。
    - 提高构建速度：副作用免费的模块可以被缓存，这意味着在后续的构建过程中，如果这些模块没有发生变化，打包工具可以直接使用缓存，而不需要重新处理它们。
    - 减少不必要的代码分割：如果一个模块不是副作用免费的，打包工具可能会为了避免潜在的副作用而将其单独分割出来，即使它很小。这可能会导致更多的HTTP请求和更长的加载时间。通过正确标记副作用，可以减少不必要的代码分割。
10. `type`:指定了项目的主入口文件类型。这通常用于 TypeScript 项目，以指定编译器应该首先处理的文件。当你的项目是一个 TypeScript 库或应用程序，并且你希望指定主入口文件时，这个字段非常有用。
11. `types`指定了 TypeScript 项目中类型声明文件（.d.ts 文件）的位置。这允许 TypeScript 编译器在编译时找到并使用这些类型声明。当你的项目包含 TypeScript 代码，并且你希望提供类型声明给其他开发者使用时，这个字段非常有用。
12. `workspaces`:定义了项目的工作区（workspaces），允许你在一个单一的包管理器（如 npm 或 yarn）的上下文中管理多个包。这在 monorepo 结构中非常有用，其中多个包或项目共享相同的依赖和工具。当你有多个相关的包或项目，并且希望在一个单一的仓库中管理它们时，这个字段非常有用。

## 依赖配置

我们的项目可能依赖一个或多个外部依赖包，根据依赖包的不同用途，我们将他们配置在下面几个属性下：

- dependencies 生产依赖
- devDependencies 开发依赖
- peerDependencies 同版本的依赖
- bundledDependencies 捆绑依赖
- optionalDependencies 可选依赖

### dependencies

`dependencies` 指定了项目运行所依赖的模块，开发环境和生产环境的依赖模块都可以配置到这里。当它关联到 npm 包被下载的时候，dependencies 下的模块也会作为依赖，一起被下载。

```json
{ 
  "dependencies" :{ 
    "foo" : "1.0.0 - 2.9999.9999", // 指定版本范围
    "bar" : ">=1.0.2 <2.1.2", 
    "baz" : ">1.0.2 <=2.3.4", 
    "boo" : "2.0.1", // 指定特定版本
    "qux" : "<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0", 
    "asd" : "http://asdf.com/asdf.tar.gz", // 指定包地址
    "til" : "~1.2",  // ~ 最近可用版本
    "elf" : "~1.2.3", 
    "elf" : "^1.2.3", // ^ 兼容版本
    "two" : "2.x", // 2.1、2.2、...、2.9皆可用
    "thr" : "*",  // 任意版本
    "thr2": "", // 任意版本
    "lat" : "latest", // 当前最新
    "dyl" : "file:../dyl", // 本地地址
    "xyz" : "git+ssh://git@github.com:npm/npm.git#v1.0.27", // git 地址
    "fir" : "git+ssh://git@github.com:npm/npm#semver:^5.0",
    "wdy" : "git+https://isaacs@github.com/npm/npm.git",
    "xxy" : "git://github.com/npm/npm.git#v1.0.27",
  }
}
```

### devDependencies

`devDependencies`有一些包有可能你只是在开发环境中用到，例如你用于检测代码规范的 `eslint` ,用于进行测试的 `jest` ，用户使用你的包时即使不安装这些依赖也可以正常运行，反而安装他们会耗费更多的时间和资源，所以你可以把这些依赖添加到 `devDependencies` 中，这些依赖照样会在你本地进行 `npm install` 时被安装和管理，但是不会被安装到生产环境。

当我们只开发应用，不对外开源的话，包随意放在 `dependencies` 或 `devDependencies` 是不影响的，因为被用到的模块不管你再哪个依赖里面都会被打包。但是如果开发的是库文件，是开源的，已经上传到 npm 仓库的，这个你就得严格区分 `dependencies` 和 `devDependencies` 依赖了。因为当你在安装第三方包的时候，只会同步下载第三方包 `dependencies` 里面的依赖，所以，当你第三方包的某依赖写到 `devDependencies` 中，被别人下载后没下载到该依赖是会报错运行不了的。

### peerDependencies

`peerDependencies` 同等依赖，或者叫同伴依赖，用于指定当前包（也就是你写的包）兼容的宿主版本。用于指定你正在开发的模块所依赖的版本以及用户安装的依赖包版本的兼容性。当别人使用我们的插件时，peerDependencies 就会告诉明确告诉使用方，你需要安装该插件哪个宿主版本。例如：

```json
  "peerDependencies": {
    "react": ">=16.0.0",
    "react-dom": ">=16.0.0"
  }
```

当你正在开发一个系统，使用了 `ant-design` ，所以也肯定需要依赖 `React`。同时， `ant-design` 也是需要依赖 `React` 的，它要保持稳定运行所需要的 `React` 版本是`16.0.0`，而你开发时依赖的 `React` 版本是 `15.x`：

这时，`ant-design` 要使用 `React`。此时引入的`React`是宿主环境也就是你的环境中的 `React` 版本，这就可能造成一些问题

- 在 `npm2` 的时候，指定上面的 `peerDependencies` 将意味着强制宿主环境安装 `react@>=16.0.0和react-dom@>=16.0.0` 的版本。

- `npm3` 以后不会再要求 `peerDependencies` 所指定的依赖包被强制安装，相反 `npm3` 会在安装结束后检查本次安装是否正确，如果不正确会给用户打印警告提示。

再比如，Vuex 依赖于 Vue，当使用 Vuex 时候必定是在 vue 环境下使用，所以一定会安装 Vue，所以在 Vuex package 中就没必要再在 `dependencies` 下申明 vue 依赖了，只需要在 `peerDependencies` 申明依赖就行了，和主项目共用同一个 `vue` 依赖，避免了重复安装。这样的好处就是 `node_modules` 里面不会安装两个 `vue`。减少了 `node_modules` 体积的同时大大提高了安装速度。

### optionalDependencies

某些场景下，依赖包可能不是强依赖的，这个依赖包的功能可有可无，当这个依赖包无法被获取到时，你希望 `npm install` 继续运行，而不会导致失败，你可以将这个依赖放到 `optionalDependencies` 中，注意 `optionalDependencies` 中的配置将会覆盖掉 `dependencies` 所以只需在一个地方进行配置，不要在两个地方都写。

当然，引用 `optionalDependencies` 中安装的依赖时，一定要做好异常处理，否则在模块获取不到时会导致报错。

### bundledDependencies

和以上几个不同，`bundledDependencies` 的值是一个数组，数组里可以指定一些模块，这些模块将在这个包发布时被一起打包。

```json
  "bundledDependencies": ["package1" , "package2"]
```

在 bundledDependencies 中指定的依赖包, 必须先在dependencies 和 devDependencies 声明过, 否则 npm pack 阶段是会报错的

### 配置规则

在介绍几种依赖配置之前，首先我们来看一下依赖的配置规则，你看到的依赖包配置可能是下面这样的：

```json
 "dependencies": {
    "axios": "^1.2.0",
      "antd": "ant-design/ant-design#4.0.0-alpha.8",
      "test-js": "file:../test",
      "test2-js": "http://cdn.com/test2-js.tar.gz",
 }
```

依赖配置遵循下面几种配置规则：

- `VERSION`是一个遵循`SemVer`规范的版本号配置，`npm install` 时将到npm服务器下载符合指定版本范围的包。
- `GITHUB_URL` 即 `github` 的 `username/modulename` 的写法，例如：`ant-design/ant-design`，你还可以在后面指定 `tag` 和 `commit id`。
- `LOCAL_PATH` 是一个本地的依赖包路径，例如 `file:../pacakges/pkgName`。适用于你在本地测试一个`npm`包，不应该将这种方法应用于线上。
- `DWONLOAD_URL` 是一个可下载的`tarball`压缩包地址，模块安装时会将这个`.tar`下载并安装到本地。

`GIT_URL` 即我们平时 clone 代码库的 `git url`，其遵循以下形式：

```js
<protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>]
```

其中 `protocal` 可以是以下几种形式：

- `git://github.com/user/project.git#commit-ish`
- `git+ssh://user@hostname:project.git#commit-ish`
- `git+ssh://user@hostname/project.git#commit-ish`
- `git+http://user@hostname/project/blah.git#commit-ish`
- `git+https://user@hostname/project/blah.git#commit-ish`

## package-lock.json

`package-lock.json` 它会**在 npm 更改 node_modules 目录树或者 package.json 时自动生成的** ，它准确的描述了当前项目`npm`包的依赖树，并且在随后的安装中会根据 `package-lock.json` 来安装，保证是相同的一个依赖树，不考虑这个过程中是否有某个依赖有小版本的更新。

当我们在一个项目中`npm install`时候，会自动生成一个`package-lock.json`文件，和`package.json`在同一级目录下。`package-lock.json`记录了项目的一些信息和所依赖的模块。这样在每次安装都会出现相同的结果，不管你在什么机器上面或什么时候安装。

可以看到`package-lock.json`里面包的版本不再是最优版本啦，而是一个固定版本，这也是它为什么锁定版本的原因。并且我们依赖的依赖它也会安装一个特定的版本，并锁定起来。当我们下次再`npm install`时候，`npm` 发现如果项目中有 `package-lock.json` 文件，则会根据 `package-lock.json` 里的内容来处理和安装依赖而不再根据 `package.json`。

可见`package-lock.json`原理就是将项目中用到的所有依赖都指定一个固定的版本，后续安装直接读取该文件来安装依赖。

`package.json`里面的包版本不是一个具体的版本，而是一个最优版本。而`package-lock.json`里面定义的是某个包的具体版本，以及包之间的层叠关系。

### package-lock.json 实践建议

当我们的项目第一次去搭建的时候, 使用 `npm install` 安装依赖包, 并去提交 `package.json、package-lock.json`, 至于`node_moduled`目录是不用提交的。

当我们作为项目的新成员的时候, `checkout/clone`项目的时候, 执行一次 `npm install` 去安装依赖包，它会根据`package-lock.json`下载对应固定版本的包。

当我们出现了需要升级依赖的需求的时候:

1. 升级小版本的时候, 依靠 **npm update**
2. 升级大版本的时候, 依靠 **npm install xxx**
3. 当然我们也有一种方法, 直接去修改 **package.json** 中的版本号, 并去执行 **npm install** 去升级版本
4. 当我们本地升级新版本后确认没有问题之后, 去提交新的 **package.json** 和 **package-lock.json**文件。

当我们出现了需要降级依赖的需求的时候:

1. 我们去执行**npm install @x.x.x** 命令后，验证没有问题之后, 是需要提交新的 **package.json** 和 **package-lock.json** 文件。

当我们出现了需要删除依赖的需求的时候:

1. 当我们执行 **npm uninstall** 命令后，需要去验证，提交新的 `package.json` 和 `package-lock.json` 文件。
2. 或者是更加暴力一点, 直接操作 `package.json`, 删除对应的依赖, 执行 **npm install** 命令, 需要去验证，提交新的**package.json** 和 **package-lock.json** 文件。

当你把更新后的**package.json** 和 **package-lock.json**提交到代码仓库的时候, 需要通知你的团队成员, 保证其他的团队成员拉取代码之后，更新依赖可以有一个更友好的开发环境保障持续性的开发工作。

如果你的 **package-lock.json** 出现冲突或问题, 我的建议是将本地的 **package-lock.json**文件删掉, 然后去找远端没有冲突的 **package.json** 和 **package-lock.json**, 再去执行 `npm install` 命令。

#### 可以不使用 `package-lock.json` 吗?

在项目中如果没有锁版本的必要，可以不使用 `package-lock.json`，在安装模块时指定 `--no-lock` 即可。

#### 那什么情况下 package.json 和 package-lock.json 里面的版本号一致呢？

- 当`package.json`里面不再使用最优版本，而是一个特定有效版本，也就是版本号前不带修饰符，这样`package.json`和`package-lock.json`里面的版本号才是一致的。

- `npm install xxx@1.1.2` 带上版本号，安装特定版本的包`package.json`和`package-lock.json`里面的版本号也是一致的。

- `package.json`里面定义的包版本就是最新的，我们安装的时候`package.json`和`package-lock.json`里面的版本号也会是一致的。

#### package-lock.json 什么时候会变

1. `package-lock.json`在`npm install`的时候会自动生成。
2. 当我们修改依赖位置，比如将部分包的位置从 `dependencies` 移动到 `devDependencies` 这种操作，虽然包未变，但是也会影响 `package-lock.json`，会将部分包的 `dev` 字段设置为 `true`。
3. 还有如果我们安装源 `registry` 不同，执行 `npm install` 时也会修改 `package-lock.json`。

#### package-lock.json 需要提交到仓库吗

至于我们要不要提交 **lockfiles** 到仓库中？这个就需要看我们具体的项目的定位了。

1. 如果是开发一个应用, 我的理解是 `package-lock.json`文件提交到代码版本仓库.这样可以保证项目中成员、运维部署成员或者是 CI 系统, 在执行 `npm install`后, 保证在不同的节点能得到完全一致的依赖安装的内容，减少`bug`的出现。
2. 如果你的目标是开发一个给外部环境用的库，那么就需要认真考虑一下了, 因为**库文件一般都是被其他项目依赖的，在不使用 package-lock.json的情况下，就可以复用主项目已经加载过的包，减少依赖重复和体积**
3. 如果说我们开发的库依赖了一个精确版本号的模块，那么在我们去提交 `lockfiles` 到仓库中可能就会出现, 同一个依赖被不同版本都被下载的情况，这样加大了`node_modules`的体积。如果我们作为一个库的开发者， 其实如果真的使用到某个特定的版本依赖的需求, 那么定义**peerDependencies** 是一个更好的选择。

所以, 我个人比较推荐的一个做法是:`把 package-lock.json`一起提交到仓库中去, 不需要 `ignore`。但是在执行 `npm publish` 命令的时候,也就是发布一个库的时候, 它其实应该是被忽略的不应该被发布出去的。

[package.json 配置完全解读](https://juejin.cn/post/7145001740696289317#heading-45)

[详解package.json和package-lock.json](https://juejin.cn/post/7137110113277444126#heading-62)

## 包管理

### npm

`npm`（Node Package Manager）是 Node.js 的默认包管理器，通过中心化的包注册表（如 `https://registry.npmjs.org`）管理 JavaScript 包的安装和发布。以下是 `npm` 的主要工作原理：

1. **包注册表 (Registry)**
   - `npm` 使用一个中心化的包注册表，通常位于 `https://registry.npmjs.org`。注册表是一个巨大的 JSON 数据库，包含了所有可用的 npm 包的信息，包括包的名称、版本、依赖关系、作者、许可证等元数据。
   - 当你运行 `npm install <package>` 命令时，`npm` 会从注册表中获取包的元数据，并根据这些信息下载和安装所需的文件。

2. **依赖管理**
   - `npm` 使用 `package.json` 文件来管理项目的依赖关系。这个文件列出了项目所需的包及其版本范围。
   - 当你运行 `npm install` 命令时，`npm` 会读取 `package.json` 文件，解析其中的依赖关系，并从注册表下载和安装这些依赖。
   - `npm` 会生成或更新 `package-lock.json` 文件（或 `npm-shrinkwrap.json` 文件），记录每个依赖的具体版本，确保在不同环境中安装的依赖版本一致。

3. **节点模块目录 (node_modules)**
   - `npm` 会在项目的根目录下创建一个 `node_modules` 文件夹，用于存放所有安装的依赖包。
   - `node_modules` 文件夹可以包含多个层级的子目录，每个子目录对应一个依赖包及其自身的依赖。
   - 从 `npm` 3.0 版本开始，引入了扁平化依赖管理机制，尽量将相同版本的依赖包安装在顶层 `node_modules` 目录中，避免重复安装。

4. **全局安装**
   - `npm` 支持全局安装包，通常用于安装命令行工具或开发工具。
   - 全局安装的包会被放置在系统的全局 `node_modules` 目录中，并且会将可执行文件的路径添加到系统的 `PATH` 环境变量中，以便直接调用。

5. **扁平化依赖管理**
   - 从 `npm` 3.0 开始，引入了扁平化依赖管理机制。核心思想是尽量将相同版本的依赖包安装在顶层 `node_modules` 目录中，避免重复安装。
   - 通过解析依赖树，`npm` 会尝试合并相同版本的依赖包，减少磁盘空间占用和安装时间。
   - 对于那些需要引用顶层依赖的子依赖包，`npm` 会使用符号链接（symlinks）或直接引用的方式，确保它们能够正确访问所需的依赖包。

#### npm 缺点

1. **磁盘空间占用大**
   - `npm` 会为每个项目创建独立的 `node_modules` 目录，导致大量重复的依赖包被多次下载和存储，占用大量磁盘空间。

2. **安装速度慢**
   - 由于 `npm` 需要为每个项目单独下载和安装依赖包，安装过程可能会比较慢，尤其是在依赖树复杂或网络条件不佳的情况下。

3. **依赖树复杂**
   - `npm` 的依赖管理机制可能导致复杂的依赖树，多层嵌套的 `node_modules` 目录结构使得依赖关系难以管理和理解，有时会导致“依赖地狱”问题。

4. **全局安装管理不直观**
   - 全局安装的包管理和版本控制不够直观，容易导致版本混乱。

5. **安全性和审计功能有限**
   - 虽然 `npm` 提供了一些安全性和审计功能（如 `npm audit`），但这些功能相对有限，不如一些现代包管理器（如 `pnpm`）提供的功能强大。依赖审计和安全更新的流程不够自动化，需要用户手动干预。

6. **缓存机制不够高效**
   - `npm` 的缓存机制虽然存在，但不如 `pnpm` 等现代包管理器高效。缓存命中率较低，导致重复下载的情况较多，影响安装速度和磁盘空间利用率。

7. **工作区支持较弱**
   - `npm` 的工作区（monorepo）支持相对较弱，管理大型多包项目时不够灵活和高效，导致开发和构建过程复杂。

8. **社区和生态系统问题**
   - 虽然 `npm` 的社区非常庞大，但也存在包的质量参差不齐、恶意包的存在等问题。依赖包的审核和管理机制不够严格，有时会导致安全漏洞或恶意代码的传播。

通过这些原理和缺点的分析，可以看出 `npm` 在许多方面仍然是一个强大的包管理器，但在某些方面仍有改进的空间，特别是磁盘空间占用、安装速度、依赖管理、全局包管理、安全性和审计功能等方面。这些不足促使了一些现代包管理器（如 `pnpm` 和 `Yarn`）的出现和发展，这些工具在某些方面提供了更好的解决方案。

### pnpm

- 内容寻址存储 (Content-Addressable Storage, CAS)

  高效的磁盘空间利用，快速的依赖安装。pnpm 使用内容寻址存储（CAS）来管理依赖包。每个文件根据其内容生成一个唯一的哈希值，并存储在全局缓存中。当项目需要某个依赖时，pnpm 会检查全局缓存中是否存在该哈希值对应的文件。如果存在，则直接使用缓存中的文件；如果不存在，则从远程仓库下载并存储到缓存中。这种方式避免了重复下载和存储相同的文件，从而节省了磁盘空间并加快了安装速度。同时，通过哈希值校验，pnpm 可以确保下载的文件没有被篡改，保证了文件的完整性和安全性。

  - **不会重复安装同一个包**。用 npm/yarn 的时候，如果 100 个项目都依赖 lodash，那么 lodash 很可能就被安装了 100 次，磁盘中就有 100 个地方写入了这部分代码。但在使用 pnpm 只会安装一次，磁盘中只有一个地方写入，后面再次使用都会直接使用 hardlink 硬链接。

  - **即使一个包的不同版本**。pnpm 也会极大程度地复用之前版本的代码。举个例子，比如 lodash 有 100 个文件，更新版本之后多了一个文件，那么磁盘当中并不会重新写入 101 个文件，而是保留原来的 100 个文件的 hardlink，仅仅写入那一个新增的文件。

- 依赖链接 (Dependency Linking)

  减少磁盘占用，加快安装速度。pnpm 不会将依赖包复制到每个项目的 node_modules 文件夹中，而是通过符号链接（symlinks）将依赖包链接到全局存储中的实际文件。这种方式使得多个项目可以共享同一个依赖包的实例，从而大大减少了磁盘空间的占用，并且安装过程也更快，因为不需要进行大量的文件复制操作。同时，种方式不仅减少了磁盘空间的占用，还提高了环境的隔离性，避免了全局污染和依赖冲突。每个项目都有独立的依赖树，确保了不同项目之间的依赖不会相互影响，从而减少了潜在的安全风险。

- 并行化下载

  加快网络下载速度。pnpm 支持并行下载多个包，可以在同一时间从多个源下载不同的包。通过并行化下载，pnpm 能够更有效地利用网络带宽，减少总的下载时间，尤其是在网络条件较好的情况下效果更加明显。

- 智能解析算法

  最小化不必要的下载和处理。pnpm 使用高效的解析算法来确定需要下载哪些包及其版本。在解析 package.json 文件时，pnpm 会智能地判断哪些依赖已经存在于全局缓存中，哪些需要下载，从而避免不必要的网络请求和文件处理。

- 支持 monorepo。

  pnpm 通过工作区（workspaces）功能，允许在一个 package.json 文件中定义多个包的依赖关系。工作区可以指定一个或多个目录，这些目录中的每个子项目都可以有自己的 package.json 文件，但它们共享同一个根 package.json 文件中的依赖配置。通过这种方式，pnpm 可以确保所有子项目使用相同的依赖版本，避免版本不一致带来的问题。在 Monorepo 中，多个子项目可能会使用相同的依赖包。pnpm 只需要下载一次这些依赖包，并通过符号链接将它们链接到各个子项目的 node_modules 目录中。

- 安全性高。
  
  之前在使用 npm/yarn 的时候，由于 node_module 的扁平结构，如果 A 依赖 B， B 依赖 C，那么 A 当中是可以直接使用 C 的，但问题是 A 当中并没有声明 C 这个依赖。因此会出现这种非法访问的情况。pnpm 可以解决这种问题，保证了安全性。pnpm 通过严格模式和锁定文件（pnpm-lock.yaml）确保依赖版本的一致性，防止意外的依赖冲突和漏洞；使用内容寻址存储（CAS）和哈希值校验来验证文件的完整性和防止恶意文件篡改；提供内置的依赖审计功能（pnpm audit）检测已知的安全漏洞并提供修复建议，从而全面提高项目的安全性。

### npm vs npx

#### npm install 流程与原理

`npm install` 的工作原理可以分为几个主要步骤，这些步骤确保了项目的依赖能够被正确地解析、下载和安装。

1. 检查 `.npmrc` 文件。`npm` 会首先读取配置文件来确定一些重要的设置，比如认证信息、注册表地址等。配置文件的优先级顺序如下：

   - **项目级别的 `.npmrc` 文件**（位于项目根目录）
   - **用户级别的 `.npmrc` 文件**（通常位于用户主目录）
   - **全局级别的 `.npmrc` 文件**（通常位于 npm 安装路径下）
   - **npm 内置的 `.npmrc` 文件**

2. 检查锁文件。`npm` 会检查项目中是否存在 `package-lock.json` 或 `npm-shrinkwrap.json` 文件。这些文件用于锁定项目依赖的确切版本，以保证不同环境中安装的依赖一致。

   - 如果不存在锁文件：npm 会从远程仓库获取最新的包信息。根据 package.json 中定义的依赖关系构建依赖树。在构建依赖树时，所有依赖（无论是直接依赖还是间接依赖）都会尽量放置在 node_modules 的根目录下，以减少嵌套层级。如果发现重复的模块，npm 会检查现有模块的版本是否满足新模块的版本要求。如果满足，则不再重复安装；如果不满足，则会在适当的 node_modules 子目录中安装所需版本。

   - 如果存在锁文件：npm 会先检查 package.json 中的依赖版本与锁文件中的记录是否有冲突。如果没有冲突，npm 将直接使用锁文件中指定的版本进行安装，跳过从远程仓库获取最新包信息和构建依赖树的步骤。

3. 从缓存或远程仓库获取包

   - **缓存中存在所需版本的包**：直接从缓存中复制包到 `node_modules`。
   - **缓存中不存在所需版本的包**：从远程仓库下载包。下载完成后，`npm` 会对包进行完整性校验。如果校验失败，`npm` 会重新下载直到成功。校验通过后，将包复制到缓存目录，并解压到 `node_modules` 中相应的路径。

4. 生成锁文件。如果之前没有锁文件，或者在安装过程中对依赖进行了更新，`npm` 会在安装完成后生成或更新 `package-lock.json` 文件，以记录当前安装的所有依赖及其确切版本。

![npm流程](/blog/images/devops/npm.png)

#### npx 流程与原理

npx 是 npm 提供的一个命令行工具，它的设计目的是简化命令的执行和包的临时安装。

- 自动安装缺失的包：如果某个命令需要的包尚未安装，npx 会自动从 npm 仓库下载并安装该包。
- 无需全局安装：可以在不全局安装包的情况下运行命令，避免了全局污染和版本冲突。
- 临时环境：适合在临时环境中运行一次性命令，如脚本或工具。
- 简化命令：可以直接运行包中的命令，而不需要显式地指定路径或版本。

首先，npx 会在当前项目的 `node_modules/.bin` 目录中查找命令。如果找不到，npx 会检查全局安装的包。如果仍然找不到，npx 会尝试从 npm 仓库下载并安装所需的包。一旦找到或安装了所需的包，npx 会执行该命令。执行过程中，npx 会传递所有额外的参数给命令。如果 npx 临时安装了包，执行完命令后，这些临时安装的包会被删除（除非指定了 --no-install 选项）。

[NPM 依赖管理的复杂性](https://mp.weixin.qq.com/s/UyOX30WSXh-LjvrIM9wa0A)

[包管理工具的演进](https://mp.weixin.qq.com/s/beP1bxgbTT1Z91KS3svDvw)

[现代包管理器的深度思考](https://juejin.cn/post/6932046455733485575)
