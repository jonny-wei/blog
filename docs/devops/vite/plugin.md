# Vite Plugin

虽然 Vite 的插件机制是基于 Rollup 来设计的，并且上一小节我们也已经对 Rollup 的插件机制进行了详细的解读，但实际上 Vite 的插件机制也包含了自己独有的一部分，与 Rollup 的各个插件 Hook 并非完全兼容。

## 插件 Hook 介绍

### 通用 Hook

Vite 会调用一系列与 Rollup 兼容的钩子，这个钩子主要分为三个阶段:

- **服务器启动阶段**: options 和 buildStart 钩子会在服务启动时被调用。
- **请求响应阶段**: 当浏览器发起请求时，Vite 内部依次调用 resolveId、load和transform 钩子。
- **服务器关闭阶段**: Vite 会依次执行 buildEnd 和 closeBundle 钩子。

除了以上钩子，其他 Rollup 插件钩子(如moduleParsed、renderChunk)均不会在 Vite **开发阶段**调用。而生产环境下，由于 Vite 直接使用 Rollup，Vite 插件中所有 Rollup 的插件钩子都会生效。

### 独有 Hook

#### 给配置再加点料: config

Vite 在读取完配置文件（即vite.config.ts）之后，会拿到用户导出的配置对象，然后执行 `config` 钩子。在这个钩子里面，你可以对配置文件导出的对象进行自定义的操作：

```javascript
// 返回部分配置（推荐）
const editConfigPlugin = () => ({
  name: 'vite-plugin-modify-config',
  config: () => ({
    alias: {
      react: require.resolve('react')
    }
  })
})
```

官方推荐的姿势是在 `config` 钩子中返回一个配置对象，这个配置对象会和 Vite 已有的配置进行深度的合并。

#### 记录最终配置: configResolved

Vite 在解析完配置之后会调用 `configResolved` 钩子，这个钩子一般用来记录最终的配置信息，而不建议再修改配置，用法如下图所示:

```javascript
const exmaplePlugin = () => {
  let config

  return {
    name: 'read-config',

    configResolved(resolvedConfig) {
      // 记录最终配置
      config = resolvedConfig
    },

    // 在其他钩子中可以访问到配置
    transform(code, id) {
      console.log(config)
    }
  }
}
```

#### 获取 Dev Server 实例: configureServer

这个钩子仅在**开发阶段**会被调用，用于扩展 Vite 的 `Dev Server`，一般用于增加自定义 `server` 中间件，如下代码所示:

```javascript
const myPlugin = () => ({
  name: 'configure-server',
  configureServer(server) {
    // 姿势 1: 在 Vite 内置中间件之前执行
    server.middlewares.use((req, res, next) => {
      // 自定义请求处理逻辑
    })
    // 姿势 2: 在 Vite 内置中间件之后执行 
    return () => {
      server.middlewares.use((req, res, next) => {
        // 自定义请求处理逻辑
      })
    }
  }
})
```

#### 转换 HTML 内容: transformIndexHtml

这个钩子用来灵活控制 HTML 的内容，你可以拿到原始的 html 内容后进行任意的转换:

```javascript
const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      return html.replace(
        /<title>(.*?)</title>/,
        `<title>换了个标题</title>`
      )
    }
  }
}
// 也可以返回如下的对象结构，一般用于添加某些标签
const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      return {
        html,
        // 注入标签
        tags: [
          {
            // 放到 body 末尾，可取值还有`head`|`head-prepend`|`body-prepend`，顾名思义
            injectTo: 'body',
            // 标签属性定义
            attrs: { type: 'module', src: './index.ts' },
            // 标签名
            tag: 'script',
          },
        ],
      }
    }
  }
}
```

#### 热更新处理: handleHotUpdate

这个钩子会在 Vite 服务端处理热更新时被调用，你可以在这个钩子中拿到热更新相关的上下文信息，进行热更模块的过滤，或者进行自定义的热更处理

```javascript
const handleHmrPlugin = () => {
  return {
    async handleHotUpdate(ctx) {
      // 需要热更的文件
      console.log(ctx.file)
      // 需要热更的模块，如一个 Vue 单文件会涉及多个模块
      console.log(ctx.modules)
      // 时间戳
      console.log(ctx.timestamp)
      // Vite Dev Server 实例
      console.log(ctx.server)
      // 读取最新的文件内容
      console.log(await read())
      // 自行处理 HMR 事件
      ctx.server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: { a: 1 }
      })
      return []
    }
  }
}

// 前端代码中加入
if (import.meta.hot) {
  import.meta.hot.on('special-update', (data) => {
    // 执行自定义更新
    // { a: 1 }
    console.log(data)
    window.location.reload();
  })
}
```

以上就是 Vite 独有的五个钩子，我们来重新梳理一下:

- `config`: 用来进一步修改配置。
- `configResolved`: 用来记录最终的配置信息。
- `configureServer`: 用来获取 `Vite Dev Server` 实例，添加中间件。
- `transformIndexHtml`: 用来转换 HTML 的内容。
- `handleHotUpdate`: 用来进行热更新模块的过滤，或者进行自定义的热更新处理。

### 插件 Hook 执行顺序

```javascript
// test-hooks-plugin.ts
// 注: 请求响应阶段的钩子
// 如 resolveId, load, transform, transformIndexHtml在下文介绍
// 以下为服务启动和关闭的钩子
export default function testHookPlugin () {
  return {
    name: 'test-hooks-plugin', 
    // Vite 独有钩子
    config(config) {
      console.log('config');
    },
    // Vite 独有钩子
    configResolved(resolvedCofnig) {
      console.log('configResolved');
    },
    // 通用钩子
    options(opts) {
      console.log('options');
      return opts;
    },
    // Vite 独有钩子
    configureServer(server) {
      console.log('configureServer');
      setTimeout(() => {
        // 手动退出进程
        process.kill(process.pid, 'SIGTERM');
      }, 3000)
    },
    // 通用钩子
    buildStart() {
      console.log('buildStart');
    },
    // 通用钩子
    buildEnd() {
      console.log('buildEnd');
    },
    // 通用钩子
    closeBundle() {
      console.log('closeBundle');
    }
}
```

各个 Hook 的执行顺序:

![vite-plugin1](/blog/images/devops/vite-plugin1.png)

由此我们可以梳理出 Vite 插件的执行顺序:

![vite-plugin2](/blog/images/devops/vite-plugin2.png)

- 服务启动阶段: `config`、`configResolved`、`options`、`configureServer`、`buildStart`
- 请求响应阶段: 如果是 `html` 文件，仅执行`transformIndexHtml`钩子；对于非 HTML 文件，则依次执行`resolveId`、`load`和`transform`钩子。相信大家学过 Rollup 的插件机制，已经对这三个钩子比较熟悉了。
- 热更新阶段: 执行`handleHotUpdate`钩子。
- 服务关闭阶段: 依次执行`buildEnd`和`closeBundle`钩子。

### 插件应用位置

Vite 中插件的执行顺序如下图所示:

![vite-plugin3](/blog/images/devops/vite-plugin3.png)

Vite 会依次执行如下的插件:

- Alias (路径别名)相关的插件。
- 带有 `enforce: 'pre'` 的用户插件。
- Vite 核心插件。
- 没有 enforce 值的用户插件，也叫`普通插件`。
- Vite 生产环境构建用的插件。
- 带有 `enforce: 'post'` 的用户插件。
- Vite 后置构建插件(如压缩插件)。
