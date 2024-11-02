# Code Push 热更新

它能绕过应用市场审核，实现快速多次迭代和问题修复。更准确得说是 JavaScript 能够被 Android 和 iOS 的动态执行的支持，所以才会产生替换执行代码的热更新技术。目前微软已经将其统一个到 App center 中来实现多端的更新管理。而对于我们而言只需其中的混合应用更新模块。

## 热更新流程

1. **配置 CodePush：**
   - 在项目中安装 `react-native-code-push` 依赖，并链接到项目中。
   - 对于 Android，需要在 `android/settings.gradle` 和 `android/app/build.gradle` 中添加相关配置，并在 `MainApplication.java` 中初始化 CodePush。
   - 对于 iOS，需要在 `AppDelegate.m` 中指定 CodePush 的 bundle URL，并在 `Info.plist` 中添加 CodePush 的部署密钥。

2. **发布更新：**
   - 使用 `code-push release-react` 命令将 React Native 项目的 JavaScript bundle 和资源文件上传到 CodePush 服务器，创建一个新的更新。
   - 可以指定平台、部署环境（如 Staging 或 Production）、版本号、描述等参数。

3. **客户端更新逻辑：**
   - 应用启动或通过 API 调用时，CodePush 会检查服务器上是否有可用的更新。
   - 如果有更新，根据配置自动或提示用户下载更新包。
   - 下载完成后，根据设置的安装模式（如静默安装或立即安装），应用更新。

4. **应用更新：**
   - 用户重启应用后，如果设置了静默更新，新的 JS bundle 将被加载，应用更新内容将被应用。
   - 如果更新是强制性的，用户可能需要立即重启应用以应用更新。

5. **更新回滚：**
   - 如果更新失败或用户选择回滚，CodePush 支持回滚到上一个稳定版本。

6. **调试和监控：**
   - CodePush 提供了调试工具和 API，以便开发者可以监控更新的状态和分发效果。

## 架构

![rn-code-push1](/blog/images/mobile/rn-code-push1.png)

它由三个部件组成：

- code-push-server 服务端。提供身份认证、更新包存储、更新校验、更新包下载、统计等等服务；负责存储应用信息、部署信息、版本信息以及更新包的具体内容。
- code-push-cli 命令行。提供登录、代码打包、更新包部署等功能；允许开发者在本地生成更新包并推送到服务器。
- react-native-code-push 客户端 SDK。校验更新、下载安装更新包、更新上报等功能。集成在应用中，使得应用能够检查更新、下载并应用这些更新。

### 服务端表设计

- **apps**：存储应用信息，每个平台（Android、iOS、Windows）的包需要分别创建一个应用来发布更新包。
- **deployments**：存储部署信息，包括访问凭证、部署环境（如 Staging 和 Production）和最后一次部署的版本 ID。
- **deployments_versions**：存储发布更新包的版本信息，记录可被更新的原生端版本号范围。
- **packages**：存储更新包的信息，包括下载地址、hash、是否强制更新、标签、发布者 ID 等。
- **packages_diff**：存储 diff 更新包的信息。

### 身份认证及权限管理

- Code Push 有自己独立的身份认证模块，通过 `users`、`user_tokens`、`collaborators` 表来管理用户信息、登录状态和用户角色（**owner** 和 **collaborator**）。

### 版本策略

- Code Push 使用 semver 语义化的版本规范，允许使用逻辑操作符约束版本号，以指定二进制版本范围所更新。
- 版本号范围表达式的例子包括 `1.2.3`、`*`、`1.2.*`、`1.2.3-1.2.7`、`>=1.2.3<1.2.7`、`~1.2.3`、`^1.2.3` 等。

### 增量更新

- 增量更新（差异更新）是热更新的核心功能，通过比较当前发布的全量包和最近几次发布的全量包生成 diff 包，减少用户更新时间和流量。
- Code Push Server 端默认对最近 3 个版本的全量包进行合并，生成的 diff 包信息由 `packages_diff` 表记录。

### 回滚机制

- Code Push 支持回滚到上一个版本或指定版本。
- 回滚在服务器端实现时，会创建一条新的 packages 表记录，通过字段 `origin_label` 指向回滚的更新包，其 `release_method` 字段被标记为 **Rollback**。

## 增量更新

增量更新（差异更新）是热更新的核心功能，通过比较当前发布的全量包和最近几次发布的全量包生成 diff 包，减少用户更新时间和流量。

它的基本工作原理是把当前发布的全量包和最近几次发布的全量包进行比对，生成 diff 包。如果用户更新命中当前发版的包版本，则只需要下载 diff 包即可。下载完 diff 包成后，在原生端本地当前版本的包和 diff 包合并成新的本地全量包，最后进行新版本包的安装。

在新包发布时，Code Push Server 端默认对最近 3 个版本的全量包进行合并。生成的 diff 包信息，由 packages_diff 表来记录。因此，一次版本的发布，对于服务器而言会存储 1 个全量包和 3 个差异包，过多版本进行 diff，会加大服务器存储空间。对于超过 3 个迭代的版本原生端，它会接收到的全量包的更新。

`shm-open/code-push-server` 中，你可以在 config.ts 里的 diffNums 配置来修改此设置

![rn-code-push2](/blog/images/mobile/rn-code-push2.png)

内置包和部署到服务器的更新包必须保持一样。否则，热更新会因为 hash 不匹配而进行全量更新

::: warning 参考文献
[Code Push 热更新设计](https://www.lumin.tech/blog/react-native-6-hot-update/)
:::
