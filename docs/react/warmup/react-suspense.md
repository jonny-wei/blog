# V18 - Suspense

目前阶段我们可以通过 Suspense + React.lazy 的方式实现代码分割，间接地减少了白屏时间，但是 Suspense 的用途远不止这些。比如异步组件，SuspenseList 这些新特性能够让开发者更优雅的编排展示页面内容。v18 下 Suspense 的两个新特性:

- SuspenseList
- Selective Hydration

在了解 Suspense 特性之前，有必要了解一下 Suspense 能解决什么问题，其诞生背景是什么？ - React 中的 **竞态条件**（Race Condition）

## Race Condition

**竞态条件**（Race Condition），旨在描述一个系统或者进程的输出，依赖于不受控制事件的出现顺序或者出现时机。

举个简单的例子：

```javascript
if (x == 5) // The "Check"
{
   y = x * 2; // The "Act"

   // 如果其他的线程在 "if (x == 5)" and "y = x * 2" 执行之间更改了 x 的值
   // y 就可能不等于 10.
}
```

你可能想，JavaScript 是单线程，怎么可能出现这个问题？确实如此，但前端有异步渲染，所以竞态条件依然有可能出现，我们举个 React 中常见的例子。这是一个非常典型的数据获取代码：

```javascript
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

看起来没什么问题，但这段代码还没有实现数据更新，我们再改一下：

```javascript
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

当组件传入新的 `id` 时，我们根据新的 `id` 请求数据，然后 `setState` 最新获取的数据。

这时就可能出现竞态条件，比如用户选完立刻点击下一页，我们请求 `id` 为 1 的数据，紧接着请求  `id` 为 2 的数据，但因为网络或者接口处理等原因，`id`为 2 的接口提前返回，便会先展示 `id` 为 2 的数据，再展示 `id` 为 1 的数据，这就导致了错误。

我们可以想想遇到这种问题的场景，比如类似于百度的搜索功能，切换 tab 等场景，虽然我们也可以使用诸如 debounce 的方式来缓解，但效果还是会差点，比如使用 debounce，用户在输入搜索词的时候，展示内容会长期处于空白状态，对于用户体验而言，我们可以做的更好。

那么我们该如何解决呢？一种是在切换的时候取消请求，还有一种是借助一个布尔值来判断是否需要更新，比如这样：

```javascript
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      // 如果 didCancel 为 true 说明用户已经取消了
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    // 执行下一个 effect 之前会执行
    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```

当然你也可以用 ahooks 中的 `useRequest`，它的内部有一个 ref 变量记录最新的 promise，也可以解决 Race Condition 的问题：

```jsx
function Article({ id }) {
  const { data, loading, error} = useRequest(() => fetchArticle(id), {
   refreshDeps: [id]
  });

  // ...
}
```

借助 Suspense，同样可以解决 Race Condition。

## Suspense

`<Suspense>` 组件，让你可以“等待”目标代码加载，并且可以直接指定一个加载的界面（像是个 spinner），让它在用户等待的时候显示。

目前，Suspense 仅支持的使用场景是：通过 `React.lazy` 动态加载组件

```jsx
const ProfilePage = React.lazy(() => import('./ProfilePage')); // 懒加载

// 在 ProfilePage 组件处于加载阶段时显示一个 spinner
<Suspense fallback={<Spinner />}>
  <ProfilePage />
</Suspense>
```

但这并不意味着 Suspense 不可以单独使用，我们可以写个 Suspense 单独使用的例子，不过目前使用起来会有些麻烦，但相信 React 官方会持续优化这个 API。

### 执行时机

```jsx
let data, promise;

function fetchData() {
  if (data) return data;
  promise = new Promise(resolve => {
    setTimeout(() => {
      data = 'data fetched'
      resolve()
    }, 3000)
  })
  throw promise;
}

function Content() {
  const data = fetchData();
  return <p>{data}</p>
}

function App() {
  return (
    <Suspense fallback={'loading data'}>
      <Content />
    </Suspense>
  )
}
```

这是一个非常简单的使用示例，但却可以用来解释 **Suspense 的执行机制**。最一开始 `<Content>` 组件会 throw 一个 promise，React 会捕获这个异常，发现是 promise 后，会在这个 promise 上追加一个 then 函数，在 then 函数中执行 Suspense 组件的更新，然后展示 fallback 内容。等 fetchData 中的 promise resolve 后，会执行追加的 then 函数，触发 Suspense 组件的更新，此时有了 data 数据，因为没有异常，React 会删除 fallback 组件，正常展示 `<Content />` 组件。

### Suspense 特性

如果我们每个请求都这样去写，代码会很冗余，虽然有 `react-cache` 这个 npm 包，但上次更新已经是 4 年之前了，不过通过查看包源码以及参考 React 官方的示例代码，在实际项目中，我们可以这样去写：

```jsx
// 1. 通用的 wrapPromise 函数
function wrapPromise(promise) {
  let status = "pending";
  let result;
  let suspender = promise.then(
    r => {
      status = "success";
      result = r;
    },
    e => {
      status = "error";
      result = e;
    }
  );
  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    }
  };
}

// 这里我们模拟了请求过程
const fakeFetch = () => {
  return new Promise(res => {
    setTimeout(() => res('data fetched'), 3000);
  });
};

// 2. 在渲染前发起请求
const resource = wrapPromise(fakeFetch());

function Content() {
  // 3. 通过 resource.read() 获取接口返回结果
  const data = resource.read();
  return <p>{data}</p>
}

function App() {
  return (
    <Suspense fallback={'loading data'}>
      <Content />
    </Suspense>
  )
}
```

在这段代码里，我们声明了一个 `wrapPromise` 函数，它接收一个 promise，比如 fetch 请求。函数返回一个带有 read 方法的对象，这是因为封装成方法后，代码可以延迟执行，我们就可以在 Suspense 组件更新的时候再执行方法，从而获取最新的返回结果。函数内部记录了三种状态，`pending`、`success`、`error`，根据状态返回不同的内容。你可能会想，如果我们还要根据 id 之类的数据点击请求数据呢？使用 Suspense 该怎么做呢？

```jsx
const fakeFetch = (id) => {
  return new Promise(res => {
    setTimeout(() => res(`${id} data fetched`), 3000);
  });
};

// 1. 依然是直接请求数据
const initialResource = wrapPromise(fakeFetch(1));

function Content({resource}) {
  // 3. 通过 resource.read() 获取接口返回结果
  const data = resource.read();
  return <p>{data}</p>
}

function App() {

  // 2. 将 wrapPromise 返回的对象作为 props 传递给组件
  const [resource, setResource] = useState(initialResource);

  // 4. 重新请求
  const handleClick = (id) => () => {
    setResource(wrapPromise(fakeFetch(id)));
  }

  return (
    <Fragment>
      <button onClick={handleClick(1)}>tab 1</button>
      <button onClick={handleClick(2)}>tab 2</button>
      <Suspense fallback={'loading data'}>
        <Content resource={resource} />
      </Suspense>
    </Fragment>
  )
}
```

#### 请求前置

使用 Suspense 一个非常大的好处就是请求是一开始就执行的。回想过往的发送请求的时机，我们都是在 compentDidMount 的时候再请求的，React 是先渲染的节点再发送的请求，然而使用 Suspense，我们是先发送请求再渲染的节点，这就带来了体验上的提升。

尤其当请求多个接口的时候，借助 Suspense，我们可以实现接口并行处理以及提早展现，举个例子：

```jsx
function fetchData(id) {
  return {
    user: wrapPromise(fakeFetchUser(id)),
    posts: wrapPromise(fakeFetchPosts(id))
  };
}

const fakeFetchUser = (id) => {
  return new Promise(res => {
    setTimeout(() => res(`user ${id} data fetched`), 5000 * Math.random());
  });
};

const fakeFetchPosts = (id) => {
  return new Promise(res => {
    setTimeout(() => res(`posts ${id} data fetched`), 5000 * Math.random());
  });
};

const initialResource = fetchData(1);

function User({resource}) {
  const data = resource.user.read();
  return <p>{data}</p>
}

function Posts({resource}) {
  const data = resource.posts.read();
  return <p>{data}</p>
}

function App() {

  const [resource, setResource] = useState(initialResource);

  const handleClick = (id) => () => {
    setResource(fetchData(id));
  }

  return (
    <Fragment>
      <p><button onClick={handleClick(Math.ceil(Math.random() * 10))}>next user</button></p>
      <Suspense fallback={'loading user'}>
        <User resource={resource} />
        <Suspense fallback={'loading posts'}>
          <Posts resource={resource} />
        </Suspense>
      </Suspense>
    </Fragment>
  )
}
```

在这个示例代码中，user 和 posts 接口是并行请求的，如果 posts 接口提前返回，而 user 接口还未返回，会等到 user 接口返回后，再一起展现，但如果 user 接口提前返回，posts 接口后返回，则会先展示 user 信息，然后显示 loading posts，等 posts 接口返回，再展示 posts 内容。

这听起来好像没什么，但是想想如果我们是以前会怎么做，我们可能会用一个 Promise.all 来实现，但是 Promise.all 的问题就在于必须等待所有接口返回才会执行，而且如果其中有一个 reject 了，都会走向 catch 逻辑。使用 Suspense，我们可以做到更好的展示效果。

#### 解决竞态条件

使用 Suspense 可以有效的解决 Race Conditions（竞态条件） 的问题。Suspense 之所以能够有效的解决 Race Conditions 问题，就在于传统的实现中，我们需要考虑 setState 的正确时机，执行顺序是：1. 请求数据 2. 数据返回 3. setState 数据

而在 Suspense 中，我们请求后，立刻就设置了 setState，然后就只用等待请求返回，React 执行 Suspense 的再次更新就好了，执行顺序是：1. 请求数据 2. setState 数据 3. 数据返回 4. Suspense 重新渲染，所以大大降低了出错的概率。

```jsx
const fakeFetch = person => {
  return new Promise(res => {
    setTimeout(() => res(`${person}'s data`), Math.random() * 5000);
  });
};

function fetchData(userId) {
  return wrapPromise(fakeFetch(userId))
}

const initialResource = fetchData('Nick');

function User({ resource }) {
  const data = resource.read();
  return <p>{ data }</p>
}

const App = () => {

  const [person, setPerson] = useState('Nick');

  const [resource, setResource] = useState(initialResource);

  const handleClick = (name) => () => {
    setPerson(name)
    setResource(fetchData(name));
  }

  return (
    <Fragment>
      <button onClick={handleClick('Nick')}>Nick's Profile</button>
      <button onClick={handleClick('Deb')}>Deb's Profile</button>
     <button onClick={handleClick('Joe')}>Joe's Profile</button>
      <Fragment>
        <h1>{person}</h1>
        <Suspense fallback={'loading'}>
          <User resource={resource} />
        </Suspense>
      </Fragment>
    </Fragment>
  );
};
```

#### 错误处理

注意我们使用的 wrapPromise 函数：

```javascript
function wrapPromise(promise) {
 // ...
  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    }
  };
}
复制代码
```

当 status 为 error 的时候，会 throw result 出来，如果 throw 是一个 promise，React 可以处理，但如果只是一个 error，React 就处理不了了，这就会导致渲染出现问题，所以我们有必要针对 status 为 error 的情况进行处理，React 官方文档也提供了方法，那就是定义一个错误边界组件：

```jsx
// 定义一个错误边界组件
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function App() {
  // ...
  return (
    <Fragment>
      <button onClick={handleClick(1)}>tab 1</button>
      <button onClick={handleClick(2)}>tab 2</button>
      <ErrorBoundary fallback={<h2>Could not fetch posts.</h2>}>
        <Suspense fallback={'loading data'}>
          <Content resource={resource} />
        </Suspense>
      </ErrorBoundary>
    </Fragment>
  )
}
```

当 `<Content />` 组件 throw 出 error 的时候，就会被 `<ErrorBoundary />`组件捕获，然后展示 fallback 的内容。

### Suspense 源码实现

```javascript
import {
  REACT_SUSPENSE_TYPE
} from 'shared/ReactSymbols';

export {
  REACT_SUSPENSE_TYPE as Suspense
};

// shared/ReactSymbols
export const REACT_SUSPENSE_TYPE: symbol = Symbol.for('react.suspense');
```

所以当我们写一个 Suspense 组件的时候，`createElement` 传入的 `Suspense` 就只是一个常量而已

```jsx
<Suspense fallback={'loading data'}>
  <Content />
</Suspense>

// 被转译为
React.createElement(Suspense, {
  fallback: 'loading data'
}, React.createElement(Content, null));
```

## SuspenseList

Suspense 异步组件的原理本质上是让组件先挂起来，等到请求数据之后，再直接渲染已经注入数据的组件。但是如果存在多个 Suspense 异步组件，并且想要控制这些组件的展示顺序，那么此时通过 Suspense 很难满足需求。

React 18 提供了一个新组件 —SuspenseList ，SuspenseList 通过编排向用户显示这些组件的顺序，来帮助协调许多可以挂起的组件。

可以理解成 SuspenseList 可以管理一组 Suspense ，并且可以控制 Suspense 的展示顺序。

SuspenseList 接受两个 props：

第一个就是 revealOrder，这个属性表示了 SuspenseList 子组件应该显示的顺序。属性值有三个：

- forwards：从前向后展示，也就是如果后面的先请求到数据，也会优先从前到后。
- backwards：和 forwards 刚好相反，从后向前展示。
- together：在所有的子组件都准备好了的时候显示它们，而不是一个接着一个显示。

比如看一下官方的例子：

```js
<SuspenseList revealOrder="forwards">
  <Suspense fallback={'加载中...'}>
    <CompA  />
  </Suspense>
  <Suspense fallback={'加载中...'}>
    <CompB  />
  </Suspense>
  <Suspense fallback={'加载中...'}>
    <CompC  />
  </Suspense>
  ...
</SuspenseList>
```

如上当 revealOrder 属性设置成 forwards 之后，异步组件会按照 CompA -> CompB -> CompC 顺序展示。

另外一个属性就是 tail，这个属性决定了如何显示 SuspenseList 中未加载的组件。

- 默认情况下，SuspenseList 会显示列表中每个 Suspense 的 fallback。
- collapsed 仅显示 Suspense 列表中下一个 Suspense 的 fallback。
- hidden 未加载的组件不显示任何信息。

## SSR 中的 Suspense

在 React v18 中 对服务端渲染 SSR 增加了流式渲染的特性 [New Suspense SSR Architecture in React 18](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Freactwg%2Freact-18%2Fdiscussions%2F37)

![suspense1](/blog/images/react/suspense1.png)

刚开始的时候，因为服务端渲染，只会渲染 html 结构，此时还没注入 js 逻辑，所以我们把它用灰色不能交互的模块表示。（如上灰色的模块不能做用户交互，比如点击事件之类的。）

js 加载之后，此时的模块可以正常交互，所以用绿色的模块展示，我们可以把视图注入 js 逻辑的过程叫做 hydrate （注水）。

但是如果其中一个模块，服务端请求数据，数据量比较大，耗费时间长，我们不期望在服务端完全形成 html 之后在渲染，那么 React 18 给了一个新的可能性。可以使用 Suspense 包装页面的一部分，然后让这一部分的内容先挂起。

接下来会通过 script 加载 js 的方式 流式注入 html 代码的片段，来补充整个页面。接下来的流程如下所示：

![suspense2](/blog/images/react/suspense2.png)

- 页面 A B 是初始化渲染的，C 是 Suspense 处理的组件，在开始的时候 C 没有加载，C 通过流式渲染的方式优先注入 html 片段。
- 接下来 A B 注入逻辑，C 并没有注水。
- A B 注入逻辑之后，接下来 C 注入逻辑，这个时候整个页面就可以交互了。

在这个原理基础之上， React 个特性叫 Selective Hydration，可以**根据用户交互改变 hydrate 的顺序**。

比如有两个模块都是通过 Suspense 挂起的，当两个模块发生交互逻辑时，会根据交互来选择性地改变 hydrate 的顺序。

![suspense3](/blog/images/react/suspense3.png)

我们来看一下如上 hydrate 流程，在 SSR 上的流程如下：

- 初始化的渲染 A B 组件，C 和 D 通过 Suspense 的方式挂起。
- 接下来会优先注水 A B 的组件逻辑，流式渲染 C D 组件，此时 C D 并没有注入逻辑。
- 如果此时 D 发生交互，比如触发一次点击事件，那么 D 会优先注入逻辑。
- 接下来才是 C 注入逻辑，整个页面 hydrate 完毕。

[React Streaming SSR 原理解析](https://mp.weixin.qq.com/s/w4FS5sBcHqRl-Saqi19Y6g)
