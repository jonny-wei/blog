# CSS 工程化

谈到开发前端的样式，首先想到的便是直接写原生 CSS。但时间一长，难免会发现原生 CSS 开发的各种问题。那么，如果我们不用任何 CSS 工程方案，又会出现哪些问题呢？

1. **开发体验**欠佳。比如原生 CSS 不支持选择器的嵌套。

2. **样式污染**问题。如果出现同样的类名，很容易造成不同的样式互相覆盖和污染。

3. **浏览器兼容**问题。为了兼容不同的浏览器，我们需要对一些属性(如`transition`)加上不同的浏览器前缀，比如 `-webkit-`、`-moz-`、`-ms-`、`-o-`，意味着开发者要针对同一个样式属性写很多的冗余代码。

4. 打包后的**代码体积**问题。如果不用任何的 CSS 工程化方案，所有的 CSS 代码都将打包到产物中，即使有部分样式并没有在代码中使用，导致产物体积过大。

针对如上原生 CSS 的痛点，社区中诞生了不少解决方案，常见的有 5 类。

1. `CSS 预处理器`：主流的包括`Sass/Scss`、`Less`和`Stylus`。这些方案各自定义了一套语法，让 CSS 也能使用嵌套规则，甚至能像编程语言一样定义变量、写条件判断和循环语句，大大增强了样式语言的灵活性，解决原生 CSS 的**开发体验问题**。
2. `CSS Modules`：能将 CSS 类名处理成哈希值，这样就可以避免同名的情况下**样式污染**的问题。
3. CSS 后处理器`PostCSS`，用来解析和处理 CSS 代码，可以实现的功能非常丰富，比如将 `px` 转换为 `rem`、根据目标浏览器情况自动加上类似于`--moz--`、`-o-`的属性前缀等等。
4. `CSS in JS` 方案，主流的包括`emotion`、`styled-components`等等，顾名思义，这类方案可以实现直接在 JS 中写样式代码，基本包含`CSS 预处理器`和 `CSS Modules` 的各项优点，非常灵活，解决了开发体验和全局样式污染的问题。
5. CSS 原子化框架，如`Tailwind CSS`、`Windi CSS`，通过类名来指定样式，大大简化了样式写法，提高了样式开发的效率，主要解决了原生 CSS **开发体验**的问题。

## CSS 预处理器

Vite 本身对 CSS 各种预处理器语言(`Sass/Scss`、`Less`和`Stylus`)做了内置支持。也就是说，即使你不经过任何的配置也可以直接使用各种 CSS 预处理器。我们以 `Sass/Scss` 为例，来具体感受一下 Vite 的`零配置`给我们带来的便利。

由于 Vite 底层会调用 CSS 预处理器的官方库进行编译，而 Vite 为了实现按需加载，并没有内置这些工具库，而是让用户根据需要安装。

## CSS Modules

CSS Modules 在 Vite 也是一个开箱即用的能力，Vite 会对后缀带有`.module`的样式文件自动应用 CSS Modules。

```js
// index.tsx
import styles from './index.module.scss';
export function Header() {
  return <p className={styles.header}>This is Header</p>
};
```

![css1](/blog/images/devops/css1.png)

同样的，你也可以在配置文件中的css.modules选项来配置 CSS Modules 的功能

```js
// vite.config.ts
export default {
  css: {
    modules: {
      // 一般我们可以通过 generateScopedName 属性来对生成的类名进行自定义
      // 其中，name 表示当前文件名，local 表示类名
      generateScopedName: "[name]__[local]___[hash:base64:5]"
    },
    preprocessorOptions: {
      // 省略预处理器配置
    }

  }
}
```

## PostCSS

一般你可以通过 `postcss.config.js` 来配置 postcss ，不过在 Vite 配置文件中已经提供了 PostCSS 的配置入口，我们可以直接在 Vite 配置文件中进行操作。

首先，我们来安装一个常用的 PostCSS 插件——`autoprefixer`:

```bash
pnpm i autoprefixer -D
```

这个插件主要用来自动为不同的目标浏览器添加样式前缀，解决的是浏览器兼容性的问题。接下来让我们在 Vite 中接入这个插件:

```ts
// vite.config.ts 增加如下的配置
import autoprefixer from 'autoprefixer';

export default {
  css: {
    // 进行 PostCSS 配置
    postcss: {
      plugins: [
        autoprefixer({
          // 指定目标浏览器
          overrideBrowserslist: ['Chrome > 40', 'ff > 31', 'ie 11']
        })
      ]
    }
  }
}
```

由于有 CSS 代码的 AST (抽象语法树)解析能力，PostCSS 可以做的事情非常多，甚至能实现 CSS 预处理器语法和 CSS Modules，社区当中也有不少的 PostCSS 插件，除了刚刚提到的`autoprefixer`插件，常见的插件还包括:

- [postcss-pxtorem](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fcuth%2Fpostcss-pxtorem)： 用来将 px 转换为 rem 单位，在适配移动端的场景下很常用。
- [postcss-preset-env](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fcsstools%2Fpostcss-preset-env): 通过它，你可以编写最新的 CSS 语法，不用担心兼容性问题。
- [cssnano](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fcssnano%2Fcssnano): 主要用来压缩 CSS 代码，跟常规的代码压缩工具不一样，它能做得更加智能，比如提取一些公共样式进行复用、缩短一些常见的属性值等等。

## CSS In JS

社区中有两款主流的`CSS In JS` 方案: `styled-components`和`emotion`。

对于 CSS In JS 方案，在构建侧我们需要考虑`选择器命名问题`、`DCE`(Dead Code Elimination 即无用代码删除)、`代码压缩`、`生成 SourceMap`、`服务端渲染(SSR)`等问题，而`styled-components`和`emotion`已经提供了对应的 babel 插件来解决这些问题，我们在 Vite 中要做的就是集成这些 babel 插件。

具体来说，上述的两种主流 CSS in JS 方案在 Vite 中集成方式如下:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        // 加入 babel 插件
        // 以下插件包都需要提前安装
        // 当然，通过这个配置你也可以添加其它的 Babel 插件
        plugins: [
          // 适配 styled-component
          "babel-plugin-styled-components"
          // 适配 emotion
          "@emotion/babel-plugin"
        ]
      },
      // 注意: 对于 emotion，需要单独加上这个配置
      // 通过 `@emotion/react` 包编译 emotion 中的特殊 jsx 语法
      jsxImportSource: "@emotion/react"
    })
  ]
})
```

## CSS 原子化框架

在目前的社区当中，CSS 原子化框架主要包括`Tailwind CSS` 和 `Windi CSS`。Windi CSS 作为前者的替换方案，实现了按需生成 CSS 类名的功能，开发环境下的 CSS 产物体积大大减少，速度上比`Tailwind CSS v2`快 20~100 倍！当然，Tailwind CSS 在 v3 版本也引入 [JIT(即时编译)](https://link.juejin.cn/?target=https%3A%2F%2Fv2.tailwindcss.com%2Fdocs%2Fjust-in-time-mode) 的功能，解决了开发环境下 CSS 产物体积庞大的问题。接下来我们将这两个方案分别接入到 Vite 中，在实际的项目中你只需要使用其中一种就可以了。我个人比较喜欢 Windi CSS 本身的`attributify`、`shortcuts`等独有的特性，因此首先从 windicss 开始说起。

### Windi CSS 接入

首先安装 `windicss` 及对应的 Vite 插件:

```css
pnpm i windicss vite-plugin-windicss -D
```

随后我们在配置文件中来使用它:

```ts
// vite.config.ts
import windi from "vite-plugin-windicss";

export default {
  plugins: [
    // 省略其它插件
    windi()
  ]
}
```

接着要注意在`src/main.tsx`中引入一个必需的 import 语句:

```ts
// main.tsx
// 用来注入 Windi CSS 所需的样式，一定要加上！
import "virtual:windi.css";
```

这样我们就完成了 Windi CSS 在 Vite 中的接入，接下来我们在 Header 组件中来测试，组件代码修改如下:

```tsx
// src/components/Header/index.tsx
import { devDependencies } from "../../../package.json";

export function Header() {
  return (
    <div className="p-20px text-center">
      <h1 className="font-bold text-2xl mb-2">
        vite version: {devDependencies.vite}
      </h1>
    </div>
  );
}
```

除了本身的原子化 CSS 能力，Windi CSS 还有一些非常好用的高级功能，在此我给大家推荐自己常用的两个能力: **attributify** 和 **shortcuts**。

要开启这两个功能，我们需要在项目根目录新建`windi.config.ts`，配置如下:

```ts
import { defineConfig } from "vite-plugin-windicss";

export default defineConfig({
  // 开启 attributify
  attributify: true,
});
```

首先我们来看看`attributify`，翻译过来就是`属性化`，也就是说我们可以用 props 的方式去定义样式属性，如下所示:

```html
<button 
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
```

这样的开发方式不仅省去了繁琐的 className 内容，还加强了语义化，让代码更易维护，大大提升了开发体验。

不过使用`attributify`的时候需要注意类型问题，你需要添加`types/shim.d.ts`来增加类型声明，以防类型报错:

```ts
import { AttributifyAttributes } from 'windicss/types/jsx';

declare module 'react' {
  type HTMLAttributes<T> = AttributifyAttributes;
}
```

`shortcuts` 用来封装一系列的原子化能力，尤其是一些常见的类名集合，我们在 `windi.config.ts`来配置它:

```ts
//windi.config.ts
import { defineConfig } from "vite-plugin-windicss";

export default defineConfig({
  attributify: true,
  shortcuts: {
    "flex-c": "flex justify-center items-center",
  }
});
```

比如这里封装了`flex-c`的类名，接下来我们可以在业务代码直接使用这个类名:

```HTML
<div className="flex-c"></div>
<!-- 等同于下面这段 -->
<div className="flex justify-center items-center"></div>
```

### Tailwind CSS

首先安装 `tailwindcss` 及其必要的依赖:

```ts
pnpm install -D tailwindcss postcss autoprefixer
```

然后新建两个配置文件`tailwind.config.js`和`postcss.config.js`:

```ts
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// postcss.config.js
// 从中你可以看到，Tailwind CSS 的编译能力是通过 PostCSS 插件实现的
// 而 Vite 本身内置了 PostCSS，因此可以通过 PostCSS 配置接入 Tailwind CSS 
// 注意: Vite 配置文件中如果有 PostCSS 配置的情况下会覆盖掉 post.config.js 的内容!
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

接着在项目的入口 CSS 中引入必要的样板代码:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

现在，你就可以在项目中安心地使用 Tailwind 样式了，如下所示:

```ts
// App.tsx

import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div>
      <header className="App-header">
        <img src={logo} className="w-20" alt="logo" />
        <p className="bg-red-400">Hello Vite + React!</p>
      </header>
    </div>
  );
}

export default App;
```
