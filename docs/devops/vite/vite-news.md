# Vite 新特性

## Vite 3.0

### 开箱即用的 WebSocket 连接策略

Vite 2 中有存在一个痛点，即在存在代理的情况下(比如 Web IDE)需要我们手动配置 WebSocket 使 HMR 生效。目前 Vite 内置了一套更加完善的 WebSocket 连接策略，自动满足更多场景的 HMR 需求。

### 服务冷启动性能提升

Vite 3.0 在服务冷启动方面做了非常多的工作，来最大程度提升项目启动的速度。

首先我们来盘点一下 Vite 2.x 阶段服务冷启动的一些问题。

从 Vite 2.0 到 2.9 版本之前，Vite 会在服务启动之前进行依赖预构建，也就是使用 Esbuild 将项目中使用到的依赖扫描出来(Scan)，然后分别进行一次打包(Optimize)。

![vite-news1](/blog/images/devops/vite-news1.png)

这样会造成两个问题:

- 依赖预构建会阻塞 Dev Server 启动，但其实不阻塞的情况下，Dev Server 也可以正常启动。
- 当某些 Vite 插件手动注入了 import 语句，比如调用 babel-plugin-import 添加import Button from 'antd/lib/button'，就会导致 Vite 的二次预构建，因为 antd/lib/button 的引入代码由 Vite 插件注入，属于 Dev Server 运行时发现的依赖，冷启动阶段无法扫描到。

所谓的二次预构建包含两个步骤，一是需要将所有的依赖全量预构建，二是由于依赖更新，页面需要进行 reload，加载最新的依赖代码。这样会导致 Dev Server 性能明显下降，尤其是在新增依赖较多的场景下，很容易出现浏览器卡住的情况。因此二次预构建也是需要极力避免的。当时 [vite-plugin-optimize-persist](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fantfu%2Fvite-plugin-optimize-persist) 就是为了解决二次预构建带来的问题，通过持久化的方式记录 Dev Server 运行时扫描到的依赖，从而让首次预构建便可以感知到，避免二次预构建的发生。

到了 2.9 版本，Vite 将预构建的逻辑做了一次整体的重构，最后的效果是下面这样的:

- Dev Server 启动后预构建(Optimize 阶段)在后台执行，也就是预构建不再阻塞 Dev Server 的启动，只需要等待 Scan 阶段完成，不过通常这个阶段的开销非常小。

![vite-news2](/blog/images/devops/vite-news2.png)

- 如果某些依赖是 Dev Server 运行时才发现的，那么 Vite 会尽可能地复用已有预构建产物，尽量不进行 page reload。

那问题就完全解决了吗？其实并不是，在某些场景下，Vite 仍然不可避免地需要二次预构建。如下面的这个例子:

![vite-news3](/blog/images/devops/vite-news3.png)

A 和 B 都是项目的第三方依赖，它们也同时依赖 C。那么当 Vite 预构建 A 的时候，将会 A 和 C 一起进行打包。但 Vite 在运行时发现了依赖 B，而 A 和 B 需要共享 C 的代码，这样 C 的代码可能就会被抽离成一个公共的 chunk，因此之前 A 的预构建产物可能就发生变化了，那么此时 Vite 必须要强制刷新页面，让浏览器使用最新的预构建产物。这仍然是一个二次预构建(所有依赖再次打包 + page reload)的过程。

总体而言，2.9 版本解决了预构建阻塞服务启动的问题，但并没有完全解决二次预构建的问题。

但在 Vite 3.0，二次预构建的问题也得到了根本的解决。那 Vite 3.0 是如何做到的呢？

核心的解决思路在于延迟处理，即把预构建的行为延迟到**页面加载的最后阶段**进行，此时 Vite 已经编译完了所有的源文件，可以准确地记录下所有需要预构建的依赖(包括 Vite 插件添加的一些依赖)，然后统一进行预构建，将预构建的产物响应给给浏览器即可。

因此，与 Vite 2.0 相比，Vite 3.0 在冷启动阶段所做的优化主要有两个方面:

- 预构建不再阻塞 Dev Server 的启动，真正做到服务秒启动的效果；
- 从根本上防止二次预构建的发生

### import.meta.glob 语法更新

Vite 3.0 对 import.meta.glob 的实现进行了重写，支持了更加灵活的 glob 语法，增加了如下的一些特性:

- 多种模式匹配:

```javascript
import.meta.glob(["./dir/*.js", "./another/*.js"]); 
```

- 否定模式(!):

```javascript
import.meta.glob(["./dir/*.js", "!**/bar.js"]); 
```

- 命名导入，可以更好地做到 Tree Shaking:

```javascript
import.meta.glob("./dir/*.js", { import: "setup" }); 
```

- 自定义 query 参数:

```javascript
import.meta.glob("./dir/*.js", { query: { custom: "data" } }); 
```

- 指定 eager 模式，替换掉原来import.meta.globEager:

```javascript
import.meta.glob("./dir/*.js", { eager: true });
```

### 将 WASM import 与未来标准对齐

修改了 WebAssembly import API，以避免与未来的标准发生冲突，并使其更加灵活：

```javascript
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

### ESM 成为 SSR 构建的默认格式

生态系统中的大多数SSR框架已经在使用ESM构建。因此，Vite 3 使 ESM 成为 SSR 构建的默认格式。这使我们能够简化以前的 SSR 外部化启发式方法，默认情况下外部化依赖项。

### 改进的 Relative Base 支持

Vite 3 现在正确支持 **Relative Base**（使用base: ''），允许将构建的产物部署到不同的 base，而无需重新构建。这在构建时不知道 base 的情况时很有用。

## Vite 4.0

### Rollup 3

Vite 现在正在使用 **Rollup 3**，这使我们能够简化 Vite 的内部资源处理并有许多改进。

### **Vite core monorepo 框架插件**

`@vitejs/plugin-vue` 和 `@vitejs/plugin-react` 从 Vite 的第一个版本开始就是 Vite core monorepo 的一部分。这有助于在进行更改时获得紧密的反馈循环，因为同时测试和发布了 Core 和插件。

借助 `vite-ecosystem-ci`，可以通过在独立仓库上开发的这些插件获得此反馈，因此从 Vite 4 开始，它们已从 Vite core monorepo 中移出。

### **在开发过程中使用 SWC 的新 React 插件**

SWC 现在是 Babel 的成熟替代品，尤其是在 React 项目中。SWC 的 React 快速重新刷新比 Babel 快很多，对于某些项目来说，SWC 现在是一个更好的选择。从 Vite 4 开始，有两个插件可用于不同的 React 项目。

- `@vitejs/plugin-react` 是一个使用 esbuild 和 Babel 的插件，以较小的包占用空间和能够使用 babel transform pipeline 的灵活性实现快速 HMR。

- `@vitejs/plugin-react-swc` 是一个新的插件，在构建过程中使用 esbuild，但在开发过程中将 Babel 替换为 SWC。 对于不需要非标准 React 扩展的大型项目，冷启动和热更新 (HMR) 会加快。

### **兼容性**

现代浏览器构建现在默认以 Safari 14 为目标，以实现更广泛的 ES2020 兼容性。这意味着现代构建现在可以使用 BigInt，并且不再转译空值合并运算符。如果需要支持旧的浏览器，可以像往常一样添加`@vitejs/plugin-legacy`。

### **将 CSS 作为字符串导入**

在 Vite 3 中，`.css` 文件的默认导出可能会引入 CSS 的双重加载。

```text
import cssString from './global.css';
```

这种双重加载可能会发生，因为会发出`.css`文件，并且很可能 css 字符串也会被应用代码使用。从 Vite 4 开始，`.css`默认导出被弃用。在这种情况下，需要使用 `?inline` 查询后缀修饰符，因为它不会发出导入的`.css`样式。

```text
import stuff from './global.css?inline'
```

### **其它功能**

- 预打包依赖项时支持 patch-package；
- 更简洁的构建日志输出并切换到 kB 以与浏览器开发工具保持一致；
- 改进 SSR 期间的错误消息。
