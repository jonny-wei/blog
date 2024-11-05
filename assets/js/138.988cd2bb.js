(window.webpackJsonp=window.webpackJsonp||[]).push([[138],{438:function(v,_,e){"use strict";e.r(_);var s=e(6),t=Object(s.a)({},(function(){var v=this,_=v._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[_("h1",{attrs:{id:"code-push-热更新"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#code-push-热更新"}},[v._v("#")]),v._v(" Code Push 热更新")]),v._v(" "),_("p",[v._v("它能绕过应用市场审核，实现快速多次迭代和问题修复。更准确得说是 JavaScript 能够被 Android 和 iOS 的动态执行的支持，所以才会产生替换执行代码的热更新技术。目前微软已经将其统一个到 App center 中来实现多端的更新管理。而对于我们而言只需其中的混合应用更新模块。")]),v._v(" "),_("h2",{attrs:{id:"热更新流程"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#热更新流程"}},[v._v("#")]),v._v(" 热更新流程")]),v._v(" "),_("ol",[_("li",[_("p",[_("strong",[v._v("配置 CodePush：")])]),v._v(" "),_("ul",[_("li",[v._v("在项目中安装 "),_("code",[v._v("react-native-code-push")]),v._v(" 依赖，并链接到项目中。")]),v._v(" "),_("li",[v._v("对于 Android，需要在 "),_("code",[v._v("android/settings.gradle")]),v._v(" 和 "),_("code",[v._v("android/app/build.gradle")]),v._v(" 中添加相关配置，并在 "),_("code",[v._v("MainApplication.java")]),v._v(" 中初始化 CodePush。")]),v._v(" "),_("li",[v._v("对于 iOS，需要在 "),_("code",[v._v("AppDelegate.m")]),v._v(" 中指定 CodePush 的 bundle URL，并在 "),_("code",[v._v("Info.plist")]),v._v(" 中添加 CodePush 的部署密钥。")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("发布更新：")])]),v._v(" "),_("ul",[_("li",[v._v("使用 "),_("code",[v._v("code-push release-react")]),v._v(" 命令将 React Native 项目的 JavaScript bundle 和资源文件上传到 CodePush 服务器，创建一个新的更新。")]),v._v(" "),_("li",[v._v("可以指定平台、部署环境（如 Staging 或 Production）、版本号、描述等参数。")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("客户端更新逻辑：")])]),v._v(" "),_("ul",[_("li",[v._v("应用启动或通过 API 调用时，CodePush 会检查服务器上是否有可用的更新。")]),v._v(" "),_("li",[v._v("如果有更新，根据配置自动或提示用户下载更新包。")]),v._v(" "),_("li",[v._v("下载完成后，根据设置的安装模式（如静默安装或立即安装），应用更新。")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("应用更新：")])]),v._v(" "),_("ul",[_("li",[v._v("用户重启应用后，如果设置了静默更新，新的 JS bundle 将被加载，应用更新内容将被应用。")]),v._v(" "),_("li",[v._v("如果更新是强制性的，用户可能需要立即重启应用以应用更新。")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("更新回滚：")])]),v._v(" "),_("ul",[_("li",[v._v("如果更新失败或用户选择回滚，CodePush 支持回滚到上一个稳定版本。")])])]),v._v(" "),_("li",[_("p",[_("strong",[v._v("调试和监控：")])]),v._v(" "),_("ul",[_("li",[v._v("CodePush 提供了调试工具和 API，以便开发者可以监控更新的状态和分发效果。")])])])]),v._v(" "),_("h2",{attrs:{id:"架构"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#架构"}},[v._v("#")]),v._v(" 架构")]),v._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/mobile/rn-code-push1.png",alt:"rn-code-push1"}})]),v._v(" "),_("p",[v._v("它由三个部件组成：")]),v._v(" "),_("ul",[_("li",[v._v("code-push-server 服务端。提供身份认证、更新包存储、更新校验、更新包下载、统计等等服务；负责存储应用信息、部署信息、版本信息以及更新包的具体内容。")]),v._v(" "),_("li",[v._v("code-push-cli 命令行。提供登录、代码打包、更新包部署等功能；允许开发者在本地生成更新包并推送到服务器。")]),v._v(" "),_("li",[v._v("react-native-code-push 客户端 SDK。校验更新、下载安装更新包、更新上报等功能。集成在应用中，使得应用能够检查更新、下载并应用这些更新。")])]),v._v(" "),_("h3",{attrs:{id:"服务端表设计"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#服务端表设计"}},[v._v("#")]),v._v(" 服务端表设计")]),v._v(" "),_("ul",[_("li",[_("strong",[v._v("apps")]),v._v("：存储应用信息，每个平台（Android、iOS、Windows）的包需要分别创建一个应用来发布更新包。")]),v._v(" "),_("li",[_("strong",[v._v("deployments")]),v._v("：存储部署信息，包括访问凭证、部署环境（如 Staging 和 Production）和最后一次部署的版本 ID。")]),v._v(" "),_("li",[_("strong",[v._v("deployments_versions")]),v._v("：存储发布更新包的版本信息，记录可被更新的原生端版本号范围。")]),v._v(" "),_("li",[_("strong",[v._v("packages")]),v._v("：存储更新包的信息，包括下载地址、hash、是否强制更新、标签、发布者 ID 等。")]),v._v(" "),_("li",[_("strong",[v._v("packages_diff")]),v._v("：存储 diff 更新包的信息。")])]),v._v(" "),_("h3",{attrs:{id:"身份认证及权限管理"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#身份认证及权限管理"}},[v._v("#")]),v._v(" 身份认证及权限管理")]),v._v(" "),_("ul",[_("li",[v._v("Code Push 有自己独立的身份认证模块，通过 "),_("code",[v._v("users")]),v._v("、"),_("code",[v._v("user_tokens")]),v._v("、"),_("code",[v._v("collaborators")]),v._v(" 表来管理用户信息、登录状态和用户角色（"),_("strong",[v._v("owner")]),v._v(" 和 "),_("strong",[v._v("collaborator")]),v._v("）。")])]),v._v(" "),_("h3",{attrs:{id:"版本策略"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#版本策略"}},[v._v("#")]),v._v(" 版本策略")]),v._v(" "),_("ul",[_("li",[v._v("Code Push 使用 semver 语义化的版本规范，允许使用逻辑操作符约束版本号，以指定二进制版本范围所更新。")]),v._v(" "),_("li",[v._v("版本号范围表达式的例子包括 "),_("code",[v._v("1.2.3")]),v._v("、"),_("code",[v._v("*")]),v._v("、"),_("code",[v._v("1.2.*")]),v._v("、"),_("code",[v._v("1.2.3-1.2.7")]),v._v("、"),_("code",[v._v(">=1.2.3<1.2.7")]),v._v("、"),_("code",[v._v("~1.2.3")]),v._v("、"),_("code",[v._v("^1.2.3")]),v._v(" 等。")])]),v._v(" "),_("h3",{attrs:{id:"增量更新"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#增量更新"}},[v._v("#")]),v._v(" 增量更新")]),v._v(" "),_("ul",[_("li",[v._v("增量更新（差异更新）是热更新的核心功能，通过比较当前发布的全量包和最近几次发布的全量包生成 diff 包，减少用户更新时间和流量。")]),v._v(" "),_("li",[v._v("Code Push Server 端默认对最近 3 个版本的全量包进行合并，生成的 diff 包信息由 "),_("code",[v._v("packages_diff")]),v._v(" 表记录。")])]),v._v(" "),_("h3",{attrs:{id:"回滚机制"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#回滚机制"}},[v._v("#")]),v._v(" 回滚机制")]),v._v(" "),_("ul",[_("li",[v._v("Code Push 支持回滚到上一个版本或指定版本。")]),v._v(" "),_("li",[v._v("回滚在服务器端实现时，会创建一条新的 packages 表记录，通过字段 "),_("code",[v._v("origin_label")]),v._v(" 指向回滚的更新包，其 "),_("code",[v._v("release_method")]),v._v(" 字段被标记为 "),_("strong",[v._v("Rollback")]),v._v("。")])]),v._v(" "),_("h2",{attrs:{id:"增量更新-2"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#增量更新-2"}},[v._v("#")]),v._v(" 增量更新")]),v._v(" "),_("p",[v._v("增量更新（差异更新）是热更新的核心功能，通过比较当前发布的全量包和最近几次发布的全量包生成 diff 包，减少用户更新时间和流量。")]),v._v(" "),_("p",[v._v("它的基本工作原理是把当前发布的全量包和最近几次发布的全量包进行比对，生成 diff 包。如果用户更新命中当前发版的包版本，则只需要下载 diff 包即可。下载完 diff 包成后，在原生端本地当前版本的包和 diff 包合并成新的本地全量包，最后进行新版本包的安装。")]),v._v(" "),_("p",[v._v("在新包发布时，Code Push Server 端默认对最近 3 个版本的全量包进行合并。生成的 diff 包信息，由 packages_diff 表来记录。因此，一次版本的发布，对于服务器而言会存储 1 个全量包和 3 个差异包，过多版本进行 diff，会加大服务器存储空间。对于超过 3 个迭代的版本原生端，它会接收到的全量包的更新。")]),v._v(" "),_("p",[_("code",[v._v("shm-open/code-push-server")]),v._v(" 中，你可以在 config.ts 里的 diffNums 配置来修改此设置")]),v._v(" "),_("p",[_("img",{attrs:{src:"/blog/images/mobile/rn-code-push2.png",alt:"rn-code-push2"}})]),v._v(" "),_("p",[v._v("内置包和部署到服务器的更新包必须保持一样。否则，热更新会因为 hash 不匹配而进行全量更新")]),v._v(" "),_("div",{staticClass:"custom-block warning"},[_("p",{staticClass:"custom-block-title"},[v._v("参考文献")]),v._v(" "),_("p",[_("a",{attrs:{href:"https://www.lumin.tech/blog/react-native-6-hot-update/",target:"_blank",rel:"noopener noreferrer"}},[v._v("Code Push 热更新设计"),_("OutboundLink")],1)])])])}),[],!1,null,null,null);_.default=t.exports}}]);