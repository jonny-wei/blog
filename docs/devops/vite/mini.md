# Vite Mini 实现

## 痛点

Webpack 的核心原理就是通过分析 JavaScript 中的 require 语句，分析出当前 JavaScript 文件所有的依赖文件，然后递归分析之后，就得到了整个项目的一个依赖图。对图中不同格式的文件执行不同的 loader，比如会把 CSS 文件解析成加载 CSS 标签的 JavaScript 代码，最后基于这个依赖图获取所有的文件。进行打包处理之后，放在内存中提供给浏览器使用，然后 dev-server 会启动一个测试服务器打开页面，并且在代码文件修改之后可以通过 WebSocket 通知前端自动更新页面，也就是我们熟悉的热更新功能。

由于 Webpack 在项目调试之前，要把所有文件的依赖关系收集完，打包处理后才能启动测试，很多大项目我们执行调试命令后需要等 1 分钟以上才能开始调试。这对于开发者来说体验太差，而且热更新也需要等几秒钟才能生效，极大地影响了我们开发的效率。所以针对 Webpack 这种打包 bundle 的思路，社区就诞生了 bundless 的框架，例如 Vite。

前端的项目之所以需要 Webpack 打包，是因为浏览器里的 JavaScript Webpack 提供的打包功能可以帮助我们更好地组织开发代码，但是现在大部分浏览器都支持了 ES6 的 module 功能，我们在浏览器内使用 `type="module"` 标记一个 script 后，在 `src/main.js` 中就可以直接使用 import 语法去引入一个新的 JavaScript 文件。这样我们其实可以不依赖 Webpack 的打包功能，利用浏览器的 module 功能就可以重新组织我们的代码。

## Mini Vite

首先，浏览器的 module 功能有一些限制需要额外处理。

浏览器识别出 JavaScript 中的 import 语句后，会发起一个新的网络请求去获取新的文件，所以只支持 `/`、`./` 和 `…/` 开头的路径。首先浏览器并不知道 Vue 是从哪来，第一就是分析文件中的 import 语句。如果路径不是一个相对路径或者绝对路径，那就说明这个模块是来自 node_modules，我们需要去 node_modules 查找这个文件的入口文件后返回浏览器。然后 `./App.vue` 是相对路径，可以找到文件，但是浏览器不支持 `.vue` 文件的解析，并且 `index.css` 也不是一个合法的 JavaScript 文件。

怎么做才能解决上述问题呢？首先我们使用 Koa 搭建一个 server，用来拦截浏览器发出的所有网络请求。在下面代码中，我们使用 Koa 启动了一个服务器，并且访问首页内容读取 index.html 的内容。

### 启动服务

```js
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const app = new Koa()

app.use(async ctx=>{
  const {request:{url,query} } = ctx
if(url=='/'){
    ctx.type="text/html"
    let content = fs.readFileSync('./index.html','utf-8')
    
    ctx.body = content
  }
})

app.listen(9999, ()=>{
  console.log('服务启动了，端口 9999')
})
```

### 解析路径

启动后发起了一个 `main.js` 的 HTTP 请求，但是 `import {createApp} from 'Vue';` 这一步由于浏览器无法识别 Vue 的路径，就会直接抛出错误，所以我们要在 Koa 中把 Vue 的路径重写。

为了方便演示，我们可以直接使用 replace 语句，把 `Vue` 改成 `/@modules/vue`，使用 `@module` 开头的地址来告诉 Koa 这是一个需要去 `node_modules` 查询的模块。

在下面的代码中，我们判断如果请求地址是 js 结尾，就去读取对应的文件内容，使用 `rewriteImport` 函数处理后再返回文件内容。在 `rewriteImport` 中我们实现了路径的替换，把 `Vue` 变成了 `@modules/vue`， 现在浏览器就会发起一个`<http://localhost:9999/@modules/vue>` 的请求，下一步我们要在 Koa 中拦截这个请求，并且返回 Vue 的代码内容。

```js
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const app = new Koa()

function rewriteImport(content){
  return content.replace(/ from ['|"]([^'"]+)['|"]/g, function(s0,s1){
    // . ../ /开头的，都是相对路径
    if(s1[0]!=='.'&& s1[1]!=='/'){
      return ` from '/@modules/${s1}'`
    }else{
      return s0
    }
  })
}

app.use(async ctx=>{
  const {request:{url,query} } = ctx
  if(url=='/'){
      ctx.type="text/html"
      let content = fs.readFileSync('./index.html','utf-8')
      
      ctx.body = content
  }else if(url.endsWith('.js')){
    // js文件
    const p = path.resolve(__dirname,url.slice(1))
    ctx.type = 'application/javascript'
    const content = fs.readFileSync(p,'utf-8')
    ctx.body = rewriteImport(content)
  }
})

app.listen(9999, ()=>{
  console.log('服务启动了，端口 9999')
})
```

然后，我们在 Koa 中判断请求地址，如果是 `@module` 的地址，就把后面的 Vue 解析出来，去 `node_modules` 中查询，拼接出目标路径 `./node_modules/vue/package.json` 去读取 Vue 项目中 `package.json` 的 `module 字段`，这个字段的地址就是 ES6 规范的入口文件。

在我们读取到文件后，再使用 `rewriteImport` 处理后返回即可。这里还要使用 `rewriteImport` 的原因是，Vue 文件内部也会使用 import 的语法去加载其他模块。然后我们就可以看到浏览器网络请求列表中多了好几个 Vue 的请求。

```js
else if(url.startsWith('/@modules/')){
    // 这是一个node_module里的东西
    const prefix = path.resolve(__dirname,'node_modules',url.replace('/@modules/',''))
    const module = require(prefix+'/package.json').module
    const p = path.resolve(prefix,module)
    const ret = fs.readFileSync(p,'utf-8')
    ctx.type = 'application/javascript'
    ctx.body = rewriteImport(ret)
}
```

这样我们就实现了 `node_modules` 模块的解析，然后我们来处理浏览器无法识别 .vue 文件的错误。

### 解析 vue 文件

`.vue` 文件通过 `@vue/compiler-sfc` 来解析单文件组件，把组件分成 `template`、`style`、`script` 三个部分，我们要做的就是在 Node 环境下，把 `template` 的内容解析成 `render 函数`，并且和 `script` 的内容组成组件对象，再返回即可。

在下面的代码中，我们判断 `.vue` 的文件请求后，通过 `compilerSFC.parse` 方法解析 Vue 组件，通过返回的 `descriptor.script` 获取 JavaScript 代码，并且发起一个 `type=template` 的方法去获取 `render 函数`。在 `query.type` 是 `template` 的时候，调用 `compilerDom.compile` 解析 template 内容，直接返回 render 函数。

```js
const compilerSfc = require('@vue/compiler-sfc') // .vue
const compilerDom = require('@vue/compiler-dom') // 模板

if(url.indexOf('.vue')>-1){
    // vue单文件组件
    const p = path.resolve(__dirname, url.split('?')[0].slice(1))
    const {descriptor} = compilerSfc.parse(fs.readFileSync(p,'utf-8'))

    if(!query.type){
      ctx.type = 'application/javascript'
      // 借用vue自导的compile框架 解析单文件组件，其实相当于vue-loader做的事情
      ctx.body = `
  ${rewriteImport(descriptor.script.content.replace('export default ','const __script = '))}
  import { render as __render } from "${url}?type=template"
  __script.render = __render
  export default __script
      `
    }else if(query.type==='template'){
      // 模板内容
      const template = descriptor.template
      // 要在server端吧compiler做了
      const render = compilerDom.compile(template.content, {mode:"module"}).code
      ctx.type = 'application/javascript'

      ctx.body = rewriteImport(render)
    }

```

面的代码实现之后，可以在浏览器中看到 `App.vue` 组件解析的结果。`App.vue` 会额外发起一个 `App.vue?type=template` 的请求，最终完成了整个 App 组件的解析。

### 处理 css 文件

接下来我们再来实现对 CSS 文件的支持。下面的代码中，如果 url 是 CSS 结尾，我们就返回一段 JavaScript 代码。这段 JavaScript 代码会在浏览器里创建一个 style 标签，标签内部放入我们读取的 CSS 文件代码。这种对 CSS 文件的处理方式，让 CSS 以 JavaScript 的形式返回，这样我们就实现了在 Node 中对 Vue 组件的渲染。

```js
if(url.endsWith('.css')){
    const p = path.resolve(__dirname,url.slice(1))
    const file = fs.readFileSync(p,'utf-8')
    const content = `
    const css = "${file.replace(/\n/g,'')}"
    let link = document.createElement('style')
    link.setAttribute('type', 'text/css')
    document.head.appendChild(link)
    link.innerHTML = css
    export default css
    `
    ctx.type = 'application/javascript'
    ctx.body = content
  }
```

### 热更新

热更新的目的就是在我们修改代码之后，浏览器能够自动渲染更新的内容，所以我们要在客户端注入一个额外的 JavaScript 文件，这个文件用来和后端实现 `WebSocket` 通信。然后后端启动 `WebSocket` 服务，通过 `chokidar` 库监听文件夹的变化后，再通过 `WebSocket` 去通知浏览器即可。下面的代码中，我们通过 `chokidar.watch` 实现了文件夹变更的监听，并且通过 `handleHMRUpdate` 通知客户端文件更新的类型。

```js

export function watch() {
  const watcher = chokidar.watch(appRoot, {
    ignored: ['**/node_modules/**', '**/.git/**'],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    disableGlobbing: true,
  });
  watcher;

  return watcher;
}
export function handleHMRUpdate(opts: { file: string; ws: any }) {
  const { file, ws } = opts;
  const shortFile = getShortName(file, appRoot);
  const timestamp = Date.now();

  console.log(`[file change] ${chalk.dim(shortFile)}`);
  let updates;
  if (shortFile.endsWith('.css')) {
    updates = [
      {
        type: 'js-update',
        timestamp,
        path: `/${shortFile}`,
        acceptedPath: `/${shortFile}`,
      },
    ];
  }

  ws.send({
    type: 'update',
    updates,
  });
}

```

然后客户端注入一段额外的 JavaScript 代码，判断后端传递的类型是 `js-update` 还是 `css-update` 去执行不同的函数即可。

```js
async function handleMessage(payload: any) {
  switch (payload.type) {
    case 'connected':
      console.log(`[vite] connected.`);

      setInterval(() => socket.send('ping'), 30000);
      break;

    case 'update':
      payload.updates.forEach((update: Update) => {
        if (update.type === 'js-update') {
          fetchUpdate(update);
        } 
      });
      break;
  }
}

```

## 总结

首先，我们通过了解 Webpack 的大致原理，知道了现在 Webpack 在开发体验上的痛点。除了用户体验 UX 之外，开发者的体验 DX 也是项目质量的重要因素。

Webpack 启动服务器之前需要进行项目的打包，而 Vite 则是可以直接启动服务，通过浏览器运行时的请求拦截，实现首页文件的按需加载，这样开发服务器启动的时间就和整个项目的复杂度解耦。任何时候我们启动 Vite 的调试服务器，基本都可以在一秒以内响应，这极大地提升了开发者的体验，这也是 Vite 的使用率越来越高的原因。并且我们可以看到，Vite 的主要目的就是提供一个调试服务器。Vite 也可以和 Vue 解耦，实现对任何框架的支持，如果使用 Vite 支持 React，只需要解析 React 中的 JSX 就可以实现。这也是 Vite 项目的现状，我们只需要使用框架对应的 Vite 插件就可以支持任意框架。

Vite 能够做到这么快的原因，还有一部分是因为使用了 esbuild 去解析 JavaScript 文件。esbuild 是一个用 Go 语言实现的 JavaScript 打包器，支持 JavaScript 和 TypeScript 语法，现在前端工程化领域的工具也越来越多地使用 Go 和 Rust 等更高效的语言书写，这也是性能优化的一个方向。


