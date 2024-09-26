# Vue SSR

## 为什么需要 SSR

### 更快的首屏加载

客户端 CSR 所有的路由和页面都是在客户端进行解析和渲染的。项目部署上线之后的入口文件，body 内部就是一个空的 div 标签，用户访问这个页面后，页面的首屏需要等待 JavaScript 加载和执行完毕才能看到，这样白屏时间肯定比 body 内部写页面标签的要长一些，尤其在客户端网络环境差的情况下，等待 JavaScript 下载和执行的白屏时间影响用户体验。

服务端渲染的 HTML 无需等到所有的 JavaScript 都下载并执行完成之后才显示，所以你的用户将会更快地看到完整渲染的页面。除此之外，数据获取过程在首次访问时在服务端完成，相比于从客户端获取，可能有更快的数据库连接。这通常可以带来更高的核心 Web 指标评分、更好的用户体验，而对于那些“首屏加载速度与转化率直接相关”的应用来说，这点可能至关重要。

### 更好的 SEO

搜索引擎的爬虫抓取到你的页面数据后，发现 body 是空的，也会认为你这个页面是空的，这对于 SEO 是很不利的。即使现在基于 Google 的搜索引擎爬虫已经能够支持 JavaScript 的执行，但是爬虫不会等待页面的网络数据请求，何况国内主要的搜索引擎还是百度。所以如果你的项目对白屏时间和搜索引擎有要求，我们就需要在用户访问页面的时候，能够把首屏渲染的 HTML 内容写入到 body 内部，也就是说我们需要在服务器端实现组件的渲染，这就是 SSR 的用武之地。

### 统一的心智模型

你可以使用相同的语言以及相同的声明式、面向组件的心智模型来开发整个应用，而不需要在后端模板系统和前端框架之间来回切换。

## SSR 权衡考量

SSR 时还有一些权衡之处需要考量：

- **开发中的限制**。浏览器端特定的代码只能在某些生命周期钩子中使用；一些外部库可能需要特殊处理才能在服务端渲染的应用中运行。

- **更多的与构建配置和部署相关的要求**。服务端渲染的应用需要一个能让 Node.js 服务器运行的环境，不像完全静态的 SPA 那样可以部署在任意的静态文件服务器上。

- **更高的服务端负载**。在 Node.js 中渲染一个完整的应用要比仅仅托管静态文件更加占用 CPU 资源，因此如果你预期有高流量，请为相应的服务器负载做好准备，并采用合理的缓存策略。

## SSR 使用

Vue 提供了 @vue/server-renderer 这个专门做服务端解析的库。

首先创建一个新的文件夹 vue-ssr，执行下面命令来安装 server-renderer、vue 和 express：

```bash
npm init -y 
npm install @vue/server-renderer vue@next express --save
```

然后新建 `server.js`，核心就是要实现在服务器端解析 Vue 的组件，直接把渲染结果返回给浏览器。下面的代码中我们使用 express 启动了一个服务器，监听 9093 端口，在用户访问首页的时候，通过 `createSSRApp` 创建一个 Vue 的实例，并且通过 `@vue/compiler-ssr` 对模板的 template 进行编译，返回的函数配置在 vueapp 的 `ssrRender` 属性上，最后通过 `@vue/server-renderer` 的 `renderToString()` 方法渲染 Vue 的实例，把 `renderToString()` 返回的字符串通过 `res.send` 返回给客户端。

```js
// 引入express
const express = require('express') 
const app = express()
const Vue = require('vue') // vue@next
const renderer3 = require('@vue/server-renderer')
const vue3Compile= require('@vue/compiler-ssr')

// 一个vue的组件
const vueapp = {
  template: `<div>
    <h1 @click="add">{{num}}</h1>
    <ul >
      <li v-for="(todo,n) in todos" >{{n+1}}--{{todo}}</li>
    </ul>
  </div>`,
  data(){
    return {
      num:1,
      todos:['吃饭','睡觉','学习Vue']
    }
  },
  methods:{
    add(){
      this.num++
    }
  } 
}
// 使用@vue/compiler-ssr解析template
vueapp.ssrRender = new Function('require',vue3Compile.compile(vueapp.template).code)(require)
// 路由首页返回结果
app.get('/',async function(req,res){
    let vapp = Vue.createSSRApp(vueapp)
    let html = await renderer3.renderToString(vapp)
    const title = "Vue SSR"
    let ret = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="app">
      ${html}
    </div>
  </body>
</html>`    
    res.send(ret)
})

app.listen(9093,()=>{
    console.log('listen 9093')
}) 
```

详细参考官网 [Vue SSR](https://cn.vuejs.org/guide/scaling-up/ssr) 和 [Vite SSR 工程化](/devops/vite/ssr.html)

## SSR 源码解析

在 CSR 环境下，template 解析的 render 函数用来返回组件的虚拟 DOM，而 SSR 环境下 template 解析的 ssrRender 函数，函数内部是通过 _push 对字符串进行拼接，最终生成组件渲染的结果的。

```js
const { mergeProps: _mergeProps } = require("vue")
const { ssrRenderAttrs: _ssrRenderAttrs, ssrInterpolate: _ssrInterpolate, ssrRenderList: _ssrRenderList } = require("vue/server-renderer")

return function ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _cssVars = { style: { color: _ctx.color }}
  _push(`<div${_ssrRenderAttrs(_mergeProps(_attrs, _cssVars))}><ul><!--[-->`)
  _ssrRenderList(_ctx.todos, (todo, n) => {
    _push(`<li>${
      _ssrInterpolate(n+1)
    }--${
      _ssrInterpolate(todo)
    }</li>`)
  })
  _push(`<!--]--></ul></div>`)
}
```

可以看到 `ssrRender` 函数内部通过传递的 `_push` 函数拼接组件渲染的结果后，直接返回 `renderToString()` 函数的执行结果。

那 `renderToString()` 是如何工作的呢？

```js
// vue-next/packages/server-renderer

export async function renderToString(
  input: App | VNode,
  context: SSRContext = {}
): Promise<string> {
  if (isVNode(input)) {
    // raw vnode, wrap with app (for context)
    return renderToString(createApp({ render: () => input }), context)
  }
  const vnode = createVNode(input._component, input._props)
  vnode.appContext = input._context
  // provide the ssr context to the tree
  input.provide(ssrContextKey, context)
  const buffer = await renderComponentVNode(vnode)

  await resolveTeleports(context)

  return unrollBuffer(buffer as SSRBuffer)
}
```

通过 `renderComponentVNode` 函数对创建的 `Vnode` 进行渲染，生成一个 `buffer` 变量，最后通过 `unrollBuffer` 返回字符串。

我们先继续看 `renderComponentVNode` 函数，它内部通过 `renderComponentSubTree` 进行虚拟 DOM 的子树渲染，而 `renderComponentSubTree` 内部调用组件内部的 `ssrRender` 函数，这个函数就是我们代码中通过 `@vue/compiler-ssr` 解析之后的 `ssrRender` 函数，传递的 `push` 参数是通过 `createBuffer` 传递的：

```js
export function renderComponentVNode(
  vnode: VNode,
  parentComponent: ComponentInternalInstance | null = null,
  slotScopeId?: string
): SSRBuffer | Promise<SSRBuffer> {
  const instance = createComponentInstance(vnode, parentComponent, null)
  const res = setupComponent(instance, true /* isSSR */)
  if (hasAsyncSetup || prefetches) {
    ....
    return p.then(() => renderComponentSubTree(instance, slotScopeId))
  } else {
    return renderComponentSubTree(instance, slotScopeId)
  }
}
function renderComponentSubTree(instance,slotScopeId){
  const { getBuffer, push } = createBuffer()
  const ssrRender = instance.ssrRender || comp.ssrRender
  if (ssrRender) {
      ssrRender(
        instance.proxy,
        push,
        instance,
        attrs,
        // compiler-optimized bindings
        instance.props,
        instance.setupState,
        instance.data,
        instance.ctx
      )
  }
}
```

`createBuffer` 的实现也很简单，`buffer` 是一个数组，`push` 函数就是不停地在数组最后新增数据，如果 `item` 是字符串，就在数组最后一个数据上直接拼接字符串，否则就在数组尾部新增一个元素，这种提前合并字符串的做法，也算是一个小优化。

```js
export function createBuffer() {
  let appendable = false
  const buffer: SSRBuffer = []
  return {
    getBuffer(): SSRBuffer {
      // Return static buffer and await on items during unroll stage
      return buffer
    },
    push(item: SSRBufferItem) {
      const isStringItem = isString(item)
      if (appendable && isStringItem) {
        buffer[buffer.length - 1] += item as string
      } else {
        buffer.push(item)
      }
      appendable = isStringItem
      if (isPromise(item) || (isArray(item) && item.hasAsync)) {
        // promise, or child buffer with async, mark as async.
        // this allows skipping unnecessary await ticks during unroll stage
        buffer.hasAsync = true
      }
    }
  }
}
```

最后我们看下返回字符串的 `unrollBuffer` 函数，由于 `buffer` 数组中可能会有异步的组件，服务器返回渲染内容之前，我们要把组件依赖的异步任务使用 `await` 等待执行完毕后，进行字符串的拼接，最后返回给浏览器。

```js
async function unrollBuffer(buffer: SSRBuffer): Promise<string> {
  if (buffer.hasAsync) {
    let ret = ''
    for (let i = 0; i < buffer.length; i++) {
      let item = buffer[i]
      if (isPromise(item)) {
        item = await item
      }
      if (isString(item)) {
        ret += item
      } else {
        ret += await unrollBuffer(item)
      }
    }
    return ret
  } else {
    // sync buffer can be more efficiently unrolled without unnecessary await
    // ticks
    return unrollBufferSync(buffer)
  }
}
```

至此我们就把 Vue 中 SSR 的渲染流程梳理完毕了，通过 `compiler-ssr` 模块把 `template` 解析成 `ssrRender` 函数后，整个组件通过 `renderToString` 把组件渲染成字符串返回给浏览器。SSR 最终实现了通过服务器端解析 Vue 组件的方式，提高首屏的响应时间和页面的 SEO 友好度。

## 同构与其他渲染

如果我们既需要提供服务器渲染的首屏内容，又需要 CSR 带来的优秀交互体验，这个时候我们就需要使用同构的方式来构建 Vue 的应用。

![vue-ssr同构架构图](/blog/images/vue/vue-ssr同构架构图.png)

左边可以拆分为 component + store + router 三大模块。这一部分的源码，设置了两个入口，分别是客户端入口 `client entry` 和服务器端入口 `server entry`。打包的过程中也有两个打包的配置文件，分别客户端的配置和服务器端的配置。最终在服务端实现用户首次访问页面的时候通过服务器端入口进入，显示服务器渲染的结果，然后用户在后续的操作中由客户端接管，通过 vue-router 来提高页面跳转的交互体验，这就是同构应用的概念。

### 同构的问题

SSR 和同构带来了很好的首屏速度和 SEO 友好度，但是也让我们的项目多了一个 Node 服务器模块。

首先，我们部署的难度会提高。之前的静态资源直接上传到服务器的 Nginx 目录下，做好版本管理即可，现在还需要在服务器上部署一个 Node 环境，额外带来了部署和监控的成本。

其次，SSR 和同构的架构，实际上，是把客户端渲染组件的计算逻辑移到了服务器端执行，在并发量大的场景中，会加大服务器的负载。所以，所有的同构应用下还需要有降级渲染的逻辑，在服务器负载过高或者服务器有异常报错的情况下，让页面恢复为客户端渲染。

总的来说，同构解决问题的同时，也带来了额外的系统复杂度。每个技术架构的出现都是为了解决一些特定的问题，但是它们的出现也必然会带来新的问题。

### SSG

针对 SSR 架构的问题，我们也可以使用静态网站生成（Static Site Generation，SSG）的方式来解决，针对页面中变动频率不高的页面，直接渲染成静态页面来展示。

比如极客时间的首页变化频率比较高，每次我们都需要对每个课程的销量和评分进行排序，这部分的每次访问都需要从后端读取数据；但是每个课程内部的页面，比如文章详情页，变化频率其实是很低的，虽然课程的文本是存储在数据库里，但是每次上线前，我们可以把课程详情页生成静态的 HTML 页面再上线。Vue 的 SSR 框架 nuxt 就提供了很好的 SSG 功能，由于这一部分页面变化频率低，我们静态化之后还可以通过部署到 CDN 来进行页面加速，每次新文章发布或者修改的时候，重新生成一遍即可。

当然 SSG 也不是完全没有问题，比如极客时间如果有一万门课了，每门课几十篇文章，每次部署都全量静态生成一遍，耗时是非常惊人的，所以也不断有新的解决方案出现。

### NSR

如果你的页面是内嵌在客户端内部的，可以借助客户端的运算能力，把 SSR 的逻辑移动到客户端进行，使用客户端渲染（Native Side Rendering，NSR）的方式降低服务端的负载，同时也能提高首屏的响应时间。

### ISR

针对 SSG 全量生成的性能问题，我们可以采用增量渲染（Incremental Site Rendering，ISR）的方式，每次只生成核心重点的页面，比如每个课程的开篇词，其他的页面访问的时候先通过 CSR 的方式渲染，然后把渲染结果存储在 CDN 中。

### ESR

此外还有边缘渲染（Edge Side Rendering，ESR），把静态内容和动态的内容都以流的方式返回给用户，在 CDN 节点上返回给用户缓存静态资源，同时在 CDN 上负责发起动态内容的请求。

### WebContainer

新出现的在浏览器里跑 node 的 [WebContainer 技术](https://blog.stackblitz.com/posts/introducing-webcontainers/)，技术成熟后，我们甚至可以把 Express、Egg.js 等后端应用也部署到 CDN 节点上，在浏览器端实现服务器应用的 ESR。

想了解这些渲染方式可移步 [渲染模式通识](/blog/architecture)
