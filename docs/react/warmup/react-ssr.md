# V18 - Streaming SSR

React Streaming SSR（流式服务端渲染） 出现之前 React 的服务端渲染是这样做的：

- 服务端获取渲染所需数据，通过 ReactDOMServer.renderToString 在服务端将组件渲染成字符串形式的 HTML。
- 将此 HTML 发送给客户端，这样客户端能够在 JavaScript 渲染完成前展示基本的静态 HTML 内容，从而实现快速的 FCP，减少白屏等待的时间。
- 这时还没有完成， 我们仍然需要下载并执行客户端 JavaScript 以将 JavaScript 逻辑连接到服务端生成的 HTML 以使页面具有交互性（这个过程就是 “注水”）。使用 ReactDOM.hydrate 方法将服务端渲染的 HTML 与客户端 React 代码合并。 Hydration 完成后才是一个正常的 React 应用。

但是这类 SSR 同样存在**弊端**：

- 服务端需要准备好所有组件的 HTML 才能返回。如果某个组件需要的数据耗时较久，就会阻塞整个 HTML 的生成。
- Hydration 是一次性的，用户需要等待客户端加载所有组件的 JavaScript 并 Hydrated 完成后才能和任一组件交互。（渲染逻辑复杂时，页面首次渲染到可交互之间可能存在较长的不可交互时间）
- 在 React SSR 中不支持客户端渲染常用的代码分割组合`React.lazy`和`Suspense`。

React 18 提供了一种新的 SSR 渲染模式： Streaming SSR。通过 Streaming SSR，实现以下两个功能，解决上述的缺陷：

- **Streaming HTML**（流式 HTML）：服务端可以**分段传输 HTML 到浏览器**，而不是像 React 18 以前一样，需要等待服务端渲染完成整个页面后才返回给浏览器。这样，浏览器可以更快的启动 HTML 的渲染，提高 FP、FCP 等性能指标。
- **Selective Hydration**（选择性注水）：在浏览器端 hydration 阶段，可以**只对已经完成渲染的区域做 hydration**，而不需要等待整个页面渲染完成、所有组件的 JS  bundle 加载完成，才能开始 hydration。这样可以更早的对已经完成渲染的区域做事件绑定，从而让页面获得更好的可交互性。

React 中的 SSR 总是发生在几个步骤中：

- 在服务器端，获取整个应用程序的数据。
- 在服务器端，将整个应用程序呈现为 HTML 字符串并将其发送到客户端。
- 在客户端，加载整个应用程序的JavaScript 代码。
- 在客户端，将JavaScript 逻辑连接到整个应用程序的服务器生成的HTML（这就是“hydration”）。

## 流式渲染（Streaming HTML）

一般来说，流式渲染就是把 HTML 分块通过网络传输，然后客户端收到分块后逐步渲染，提升页面打开时的用户体验。通常是利用`HTTP/1.1`中的分块传输编码（Chunked transfer encoding）机制（HTTP 的 Response header 设置 Transfer-Encoding: chunked ）支持以 stream 格式进行数据传输。

### renderToNodeStream

早在 React 16 中同样有一个用于流式传输的 API`renderToNodeStream`来返回一个可读的流（然后就可以将这个流 pipe 给 node.js 的 response 流）给客户端渲染，比原始的`renderToString`有着更短的 TFFB 时间（发出页面请求到接收到应答数据第一个字节所花费的毫秒数）。但是`renderToNodeStream`需要从 DOM 树自顶向下开始渲染，并不能等待某个组件的数据然后渲染其他部分的 HTML。无法在流的部分内容准备好后立即发送部分内容，而必须等待整个流结束。

```js
app.get("/", (req, res) => {
  res.write(
    "<!DOCTYPE html><html><head><title>Hello World</title></head><body>"
  );
  res.write("<div id='root'>");
  const stream = renderToNodeStream(<App />);
  stream.pipe(res, { end: false });
  stream.on("end", () => {
    // 流结束后再写入剩余的HTML部分
    res.write("</div></body></html>");
    res.end(); // 必须结束后才发送
  });
});
```

### renderToPipeableStream

新推出`renderToPipeableStream` API 则同时具备 Streaming 和 Suspense 的特性，不过在用法上更复杂：

```js
import { renderToPipeableStream } from "react-dom/server";
import App from "../src/App";
import { DataProvider } from "../src/data";

function render(url, res) {
  // res 为 writable response 流
  res.socket.on("error", (error) => {
    console.error("Fatal", error);
  });
  let didError = false;
  const data = createServerData();
  // 返回一个 Writable Stream
  const { pipe, abort } = renderToPipeableStream(
    <DataProvider data={data}>
      <App assets={assets} />
    </DataProvider>,
    {
      bootstrapScripts: [assets["main.js"]],
      onCompleteShell() {
        // Stream 传输之前设置正确的状态码
        res.statusCode = didError ? 500 : 200;
        res.setHeader("Content-type", "text/html");
        pipe(res);
      },
      onErrorShell(x) {
        // 错误发生时替换外壳
        res.statusCode = 500;
        res.send("<!doctype><p>Error</p>");
      },
      onError(x) {
        didError = true;
        console.error(x);
      },
    }
  );
  // 放弃服务端渲染，切换到客户端渲染.
  setTimeout(abort, ABORT_DELAY);
}
```

React Streaming SSR，服务器会首先渲染不依赖于异步操作的组件，并将这些部分的 HTML 流式传输到客户端。对于被`<Suspense>` 包裹的组件，如果它们依赖于异步数据，服务器会等待这些数据变得可用，然后将这部分 HTML 和相关的 hydration 代码（一个 JS 函数）一起发送到客户端。客户端接收到这些代码后，会通过 hydration 过程将它们与 React 的内部状态同步并更新 DOM，得到完整的 HTML 结构使得应用变得可交互。如果 `<Suspense>` 的 children 不需要异步渲染，那么服务器渲染的 HTML 将一次性发送到客户端，只有需要异步渲染时 HTML 才会被分段传输。这样，可以优先传输那些不需要等待异步数据或代码加载的组件的 HTML，从而提升用户体验。

此外，React 18 还引入了选择性 hydration 的概念，允许客户端在 JS 代码加载过程中，就开始对已经接收到的 HTML 进行 hydration。这意味着即使应用的某些部分的 JS 还未加载完成（不可交互），用户也可以开始与页面的其他部分交互。

## 选择性注水 （Selective Hydration）

React 18 之前，SSR 实际上是不支持 code splitting 的，只能使用一些 workaround，常见的方式有：

1. 对于需要 code splitting 的组件，不在服务端渲染，而是在浏览器端渲染；
2. 提前将 `code splitting` 的 JS 写到 `html script` 标签中，在客户端等待所有的 JS 加载完成后再执行 `hydration`。

如果在没有等待所有的 `JS bundle` 都加载完成，就开始 `hydration`，会出现什么问题呢？

考虑下面的例子，Content 组件做了 code splitting，如果在浏览端，在 Content 组件的 JS bundle 还未加载完成时，就开始 hydration，hydration 得到的 HTML 结构将缺少 Content 组件的内容，而服务端 SSR 返回的结构则是包含 Content 组件的，导致报错.

```js
import loadable from '@loadable/component'

const Content = loadable(() => import("./Content"));

export default function App() {
  return (
    <html>
      <head></head>
      <body>
        <div>App shell</div>
        <Content />
      </body>
    </html>
  );
}

// lazy + suspense 改写
import {lazy, Suspense} from 'react'

const Content = lazy(() => import("./Content"));

export default function App() {
  return (
    <html>
      <head></head>
      <body>
        <div>App shell</div>
        <Suspense>
          <Content />
        </Suspense>
      </body>
    </html>
  );
}
```

用 React 18 的 lazy 和 Suspense 改写，就可以支持 Selective Hydration，使得 SSR 真正支持 code splitting。如果 Content 组件的 JS bundle 还没有加载完成，在 hydration 阶段，渲染到 Suspense 节点时会跳出，而不会让整个 hydration 过程失败。

有了`lazy`和`Suspense`的支持， React SSR 就能够尽早对已经就绪的页面部分注水，而不会被其他部分阻塞。从另一个角度看，在 React 18 中注水本身也是 lazy 的。

这样就可以将不需要同步加载的组件选择性地用`lazy`和`Suspense`包起来（和客户端渲染时一样）。而 React 注水的粒度取决于`Suspense`包含的范围，每一层`Suspense`就是一次注水的“层级”（要么组件都完成注水要么都没完成）。

同样的，流式传输的 HTML 也不会阻塞注水过程。如果 JavaScript 早于 HTML 加载完成，React 就会开始对已完成的 HTML 部分注水。

React 通过维护几个优先队列，能够记录用户的交互点击来优先给对应组件注水，在注水完成后组件就会响应这次交互，即事件重放（event replay）

总结一下，React 18 的 hydration 阶段，当渲染到 Suspense 组件时，会根据 Suspense 的 children 是否已经渲染完成，而选择是否继续向子组件执行 hydration。未渲染完成的组件待渲染完成后，会恢复执行 hydration。 Suspense 的 children 异步渲染的两种场景：

1. children 组件做了 code splitting；
2. children 组件中有异步操作。

### 降级逻辑

Streaming SSR 过程中，如果某个 Suspense 的 children 渲染过程抛出异常，那么这个 children 组件将降级到 CSR，即在浏览器端重新尝试渲染。

当 Suspense 的 children SSR 阶段渲染失败时，可以在 renderToPipeableStream 的 onError 回调中执行专门的逻辑处理。如果还没有渲染到任一 Suspense 组件时，就发生了错误，这意味着应用对应的整棵组件树都没有渲染成功，SSR 完全失败，这个时候 onShellReady 不会被调用，onShellError 会调用，我们可以在 onShellError 中返回 CSR 使用的 HTML 模版，让整个应用完全降级到 CSR 。

## 小结

### React 中当前的渲染模式

- 在 CSR 应用中，用户必须下载所有必要的 JavaScript 并执行它以查看 / 与页面交互。
- 在 SSR 应用中，我们通过在服务端生成 HTML 来解决了其中的一些问题。然而这并不是最优的，因为首先我们必须等待服务端获取所有数据并生成 HTML。然后客户端必须下载整个页面的 JavaScript。最后，我们必须执行 JavaScript 以连接服务端生成的 HTML 和 JavaScript 逻辑，以便页面可以交互。所以主要问题是我们必须要等待每一步完成，然后才能开始下一步。

### SSR 的优点

- 与 CSR 不同，SEO 要好得多，因为所有 HTML 都是从服务端预先生成的，网络爬虫可以毫无问题地爬取它。
- FCP 和 LCP 非常快。因此，用户可以很快看到内容，而不是像 CSR 应用那样查看空白屏幕。

### SSR 的缺点

- 由于我们在每次请求时首先在服务端渲染页面，并且必须等待页面的数据需求，这可能会导致 TTFB 速度变慢。这可能是由多种原因导致的，包括未优化的服务端代码或者许多并发的服务端请求。不过，使用像 Next.js 这样的框架可以提前生成页面并使用 SSG（静态站点生成）和 ISR（增量静态站点生成）等技术将它们缓存在服务端，从而在一定程度上解决了这个问题。
- 即使初始加载速度很快，用户仍然需要等待下载页面的所有 JavaScript 并对其进行处理，以便页面可以重新注水并变得可交互。

### 流式 SSR

浏览器可以通过 HTTP 流接收 HTML。流式传输允许 Web 服务端通过单个 HTTP 连接将数据发送到客户端，该连接可以无限期保持打开状态。因此，我们可以通过网络以多个块的形式在浏览器上加载数据，这些数据在渲染时按顺序加载。

### React 18 之前的流式渲染

流式渲染并不是 React 18 中全新的东西。事实上，它从 React 16 开始就存在了。React 16 有一个名为 renderToNodeStream 的方法，与 renderToString 不同，它将前端渲染为浏览器的 HTTP 流。这允许在渲染它的同时以块的形式发送 HTML，从而为用户提供更快的 TTFB 和 LCP，因为初始 HTML 更快地到达浏览器。

### React 18 中的流式 SSR

React 18 弃用了 `renderToNodeStream` API，取而代之的是一个名为 `renderToPipeableStream` 的新 API，它通过 `Suspense` 解锁了一些新功能，允许将应用分解为更小的独立单元，这些单元可以独立完成我们在 SSR 中看到的步骤。这是因为 Suspense 添加了两个主要功能：

- 服务端流式渲染；
- 客户端选择性注水。

**服务端流式渲染**：React 18 之前的 SSR 是一种全有或全无的方法。首先，需要获取页面所需的数据，并生成 HTML，然后将其发送到客户端。由于 HTTP 流，情况不再如此。在 React 18 中想要使用这种方式，可以包装可能需要较长时间才能加载且在 Suspense 中不需要立即显示在屏幕上的组件。因为现在不需要等待服务端获取所有数据，浏览器可以开始渲染应用的其余部分，即使某些部分尚未准备好。

**客户端选择性注水**：即使 HTML 被流式传输，页面也不会可交互的，除非页面的整个 JavaScript 被下载完。这就是选择性注水的用武之地。在客户端渲染期间避免页面上出现大型包的一种方法就是通过 `React.lazy` 进行代码拆分。它指定了应用的某个特定部分不需要同步加载，并且打包工具会将其拆分为单独的 `<script>` 标签。`React.lazy` 的限制是它不适用于服务端渲染。但在 React 18 中，`<Suspense>` 除了允许流式传输 HTML 之外，它还可以为应用的其余部分注水。所以，现在 `React.lazy` 在服务端开箱即用。当你将 lazy 组件包裹在 `<Suspense>` 中时，不仅告诉 React 你希望它被流式传输，而且即使包裹在 `<Suspense>` 中的组件仍在被流式传输，也允许其余部分注水。因此，在开始注水之前，不再需要等待所有 JavaScript 下载完毕。

### React Server Components(RSC)

上面，我们介绍了如何通过将应用分解为更小的单元并分别对它们进行流式处理和选择性注水来提高服务端渲染性能。但是，如果有一种方法可以完全不需要对应用的某些部分进行注水呢？这就是全新的 Server Components 的用武之地。它旨在补充服务端渲染，允许拥有仅在服务端渲染且没有交互性的组件。

- **不影响客户端包**：服务端组件仅在服务端渲染，不需要注水。它允许我们在服务端渲染静态内容，同时对客户端包大小没有影响。如果使用的是繁重的库并且没有交互性，这可能特别有用，并且它可以完全渲染在服务端，而不会影响客户端包。

- **服务端组件不具有交互性，但可以与客户端组件组合**：由于它们只在服务端渲染，它们只是接收 props 并渲染视图的 React 组件。因此，它们不能像常规客户端组件中那样拥有状态、effects 和事件处理程序之类的东西。

- **服务端组件可以直接访问后端**：由于它们仅在服务端渲染，因此可以使用它们直接从组件访问数据库和其他仅限后端的数据源。

- **自动代码拆分**：代码拆分是一个概念，它允许将应用分成更小的块，向客户端发送更少的代码。对应用进行代码拆分的最常见方式就是按路由进行拆分。这也是 Next.js 等框架默认拆分包的方式。除了自动代码拆分之外，React 还允许使用 React.lazy API 在运行时延迟加载不同的模块。这种技术通过在运行时只动态导入需要的组件来提高性能，但它确实有一些问题。例如，这种方法会延迟应用开始加载代码的时间，从而抵消了加载更少代码的好处。正如我们之前在客户端组件如何与服务器组件组合中看到的那样，它们通过将所有客户端组件导入视为潜在的代码拆分点，并允许开发人员选择要在服务端更早渲染的内容，从而使客户端能够更早下载。

- **服务端组件可以在保留客户端状态的同时重新加载**：我们可以随时从客户端重新获取服务端树，以从服务端获取更新的状态，而不会破坏本地客户端状态、焦点甚至正在进行的动画。这是可能的，因为接收到的 UI 描述是数据而不是纯 HTML，这允许 React 将数据合并到现有组件中，从而使客户端状态不会被破坏。

- **服务端组件与 Suspense 集成**：服务器组件可以通过 `<Suspense>` 逐步流式传输，允许我们在等待页面剩余部分加载时创建加载状态并快速显示重要内容。

目前，服务端组件仍处于 alpha 阶段，而具有新 Suspense 架构的流式 SSR 所需的用于数据获取的 Suspense 还没有正式发布，将在 React 18 的小更新中发布。

[如何在React18中利用Suspense实现服务端渲染](https://mp.weixin.qq.com/s/1joPNPZytROexglKv4IcrA)

[React Streaming SSR 原理解析](https://mp.weixin.qq.com/s/w4FS5sBcHqRl-Saqi19Y6g)

[React 渲染的未来](https://mp.weixin.qq.com/s/d0Sh0tanTJ6x0jsXcA4PFQ)

[React 18中新的Suspense SSR架构](https://mp.weixin.qq.com/s/hqvLam9RYLfolKkFrZ9DfQ)

[React Server Component: 混合式渲染](https://mp.weixin.qq.com/s/BIxGyA1cnmWjFNNpL5NLmw)

[大前端时代，如何做好C 端业务下的React SSR](https://mp.weixin.qq.com/s/zzKfcP8sNEU68-UOVIiDvg)

[React 中同构（SSR）原理脉络梳理](https://mp.weixin.qq.com/s/BXC6tZyY6fsi8l8dJ40nug)

[一文吃透React SSR服务端同构渲染](https://mp.weixin.qq.com/s/N1L92AdeCGofGIYwIb7qZw)

[这⼀次彻底弄懂：React 服务端渲染](https://mp.weixin.qq.com/s/w5Atyiq01EtKSi7WXTI2zQ)

[大势所趋：流式服务端渲染](https://mp.weixin.qq.com/s/XP0BAhpTiONGXwUlMbbfIw)
