# 认识 package.json

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
