# React 中 CSS 的模块化

css 模块化一直是 React 痛点，为什么这么说呢？ 因为 React 没有像 Vue 中 style scoped 的模版写法，可以直接在 .vue 文件中声明 css 作用'域'。随着 React 项目日益复杂化、繁重化，React 中 css 面临很多问题，比如样式类名全局污染、命名混乱、样式覆盖等。这时， css 模块化就显得格外重要。

css 模块化的几个重要作用:

1. 防止全局污染，样式被覆盖

全局污染、样式覆盖。有时候甚至不得不用 `!important` 或者 `行内样式` 来解决，但是只是一时痛快，如果后续有其他样式冲突，那么更难解决这个问题。 `Web Components` 标准中的 `Shadow DOM` 能彻底解决这个问题，但它的做法有点极端，样式彻底局部化，造成外部无法重写样式，损失了灵活性。

2. 命名混乱 没有 css 模块化和统一的规范，会使得多人开发，没有一个规范，比如命名一个类名，有的人用驼峰 `.contextBox`，有的人用下划线 `.context_box`，还有的人用中划线 `.context-box`，使得项目不堪入目。

3. css 代码冗余，体积庞大。 这种情况也普遍存在，因为 React 中各个组件是独立的，所以导致引入的 css 文件也是相互独立的，比如在两个 css 中，有很多相似的样式代码，如果没有用到 css 模块化，构建打包上线的时候全部打包在一起，那么无疑会增加项目的体积。

为了解决如上问题 css 模块化也就应运而生了，关于 React 使用 css 模块化的思路主要有两种：

- 第一种 css module ，依赖于 webpack 构建和 css-loader 等 loader 处理，将 css 交给 js 来动态加载。

- 第二种就是直接放弃 css ，`css in js` 用 js 对象方式写 css ，然后作为 style 方式赋予给 React 组件的 DOM 元素，这种写法将不需要 `.css .less .scss` 等文件，取而代之的是每一个组件都有一个写对应样式的 js 文件。

## CSS Modules

css Modules ，使得项目中可以像加载 js 模块一样加载 css ，本质上通过一定自定义的命名规则生成唯一性的 css 类名，从根本上解决 css 全局污染，样式覆盖的问题。对于 css modules 的配置，推荐使用 css-loader，因为它对 CSS Modules 的支持最好，而且很容易使用。

```js
// css-loader配置
{
    test: /\.css$/,/* 对于 css 文件的处理 */
    use:[
       'css-loader?modules' /* 配置css-loader ,加一个 modules */
    ]
}

// css文件
.text {
    color: blue;
}

// jsx 文件
import style from './style.css'
export default ()=> <div>
    <div className={ style.text } >验证 css modules </div>
</div>
```

css-loader 将 text 变成了全局唯一的类似 `_1WHQzhI7PwBzQ_NMib7jy6` 的类名。这样有效的避免了样式冲突，全局类名污染的情况。

### 自定义命名规则

上述的命名有一个致命问题，就是命名中没有了 text，在调试阶段，不容易找到对应的元素。对于这个问题可以自定义命名规则。只需要在 css-loader 配置项这么写：

**自定义规则命名**

```js
{
     test: /\.css$/,/* 对于 css 文件的处理 */
     use:[
        {
            loader: 'css-loader',
            options:{
              modules: {
                localIdentName: "[path][name]__[local]--[hash:base64:5]", /* 命名规则  [path][name]__[local] 开发环境 - 便于调试   */
              },
            }
        },
     ],
}
```

此时类名变成了类似 `src-pages-cssModule-style__text--1WHQz` ，这个命名规则意义如下

- `[path][name]__[local]` -> 开发环境，便于调试。可以直接通过 src-pages-cssModule-style 找到此类名对应的文件。

- `[hash:base64:5]` -> 生产环境，1WHQz 便于生产环境压缩类名。

### 全局变量

一旦经过 css modules 处理的 css 文件类名 ，再引用的时候就已经无效了。因为声明的类名，比如如上的 .text 已经被处理成了哈希形式。那么怎么样快速引用声明好的全局类名呢？CSS Modules 允许使用 `:global(.className)` 的语法，声明一个全局类名。凡是这样声明的 class ，都不会被编译成哈希字符串。

```css
.text{
    color: blue;
}

:global(.text_bg) {
    background-color: pink;
}
```

```js
import style from './style.css'
export default ()=><div>
    <div className={ style.text + ' text_bg'} >验证 CSS Modules </div>
</div>
```

CSS Modules 还提供一种显式的局部作用域语法: `local(.text)`，等同于 `.text`。

```js
.text{
    color: blue;
}
/* 等价于 */
:local(.text_bg) {
    background-color: pink;
}
```

### 组合样式

CSS Modules 提供了一种 composes组合方式，实现对样式的复用。比如通过 composes 方式的实现上面的效果。

```css
.base{ /* 基础样式 */
    color: blue;
}
.text { /* 继承基础样式 ，增加额外的样式 backgroundColor */
    composes:base;
    background-color: pink;
}
```

```js
import style from './style.css'
export default ()=><div>
    <div className={ style.text } >验证 css modules </div>
</div>
```

用了 composes 可以将多个 class 类名添加到元素中。composes 还有一个更灵活的方法，支持动态引入别的模块下的类名。比如上述写的 .base 样式在另外一个文件中，完全可以如下这么写：

```css
.text{
    color: pink;
}
.text { /* 继承基础样式 ，增加额外的样式 backgroundColor */
    composes:base from './style1.css';  /* base 样式在 style1.css 文件中 */
    background-color: pink;
}
```

### 配置 less 和 sass

配置 less 和 sass 的 CSS Modules 和配置 css 一模一样。以 less 为例子。接下来在刚才的基础上，配置一下 less 的 CSS Modules。

```js
{
     test: /\.less$/,
     use:[
        {
          loader: 'css-loader',
          options:{
                modules: {
                    localIdentName:'[path][name]---[local]---[hash:base64:5]'
                },
          },
        },
        {
            // 可能是其他 loader, 不过不重要。
        },
        'less-loader'
     ]
}
```

然后在刚才的文件同级目录下，新建 index.less

```less
.text {
    color: orange;
    background-color: #ccc;
}
```

```js
import  React from 'react'
import style from './style.css'      /* css  module*/ 
import lessStyle from './index.less' /*  less css module */

export default ()=><div>
    <div className={ style.text } >验证 css modules </div>
    <div className={ lessStyle.text } >验证 less + css modules </div>
</div>
```

### 组合方案

正常情况下，React 项目可能在使用 css 处理样式之外，还会使用 scss 或者 less 预处理。那么可不可以使用一种组合方法。

- 可以约定对于**全局样式或者是公共组件样式**，可以用 `.css` 文件 ，不需要做 `CSS Modules` 处理，这样就不需要写 `:global` 等繁琐语法。

- 对于项目中开发的**页面和业务组件**，统一用 `scss` 或者 `less` 等做 `CSS Module`，也就是 `css 全局样式 + less / scss CSS Modules` 方案。这样就会让 React 项目更加灵活的处理 CSS 模块化。

```js
import  React from 'react'

import Style from './index.less' /*  less css module */

export default ()=><div>
     {/* 公共样式 */}
    <button className="searchbtn" >公共按钮组件</button> 
    <div className={ Style.text } >验证 less + css modules </div>
</div>
```

### 动态添加 class

CSS Modules 可以配合 classNames 库 实现更灵活的动态添加类名。

```less
.base{ /* ...基础样式 */ }
.dark{ // 主题样式-暗色调
    background:#000;
    color: #fff;
}
.light{// 主题样式-亮色调
    border: 1px solid #000;
    color: #000;
    background: #fff;
}
```

```js
import classNames from 'classnames' 
import Style from './index.less' /*  less css module */
/* 动态加载 */
export default function Index(){
    const [ theme , setTheme  ] = React.useState('light')
    return <div  >
        <button  
         className={ classNames(Style.base, theme === 'light' ? Style.light : Style.dark ) }  
         onClick={ ()=> setTheme(theme === 'light' ? 'dark' : 'light')  }
        > 
           切换主题 
        </button>
    </div>
}
```

通过 CSS Modules 配合 classNames 灵活的实现了样式的动态加载。

### CSS Modules 总结

首先 CSS Modules 优点：

- CSS Modules 的类名都有自己的私有域的，可以避免类名重复/覆盖，全局污染问题。
- 引入 css 更加灵活，css 模块之间可以互相组合。
- class 类名生成规则配置灵活，方便压缩 class 名。

CSS Modules 的注意事项：

- 仅用 class 类名定义 css ，不使用其他选择器。
- 不要嵌套 css `.a{ .b{} }` 或者重叠 css `.a .b {}` 。

## CSS in JS

### 基本用法

CSS IN JS 放弃css ，用 js 对象形式直接写 style

```js
// index.js 
import React from 'react'
import Style from './style'

export default function Index(){
    return <div  style={ Style.boxStyle }  >
        <span style={ Style.textStyle }  >hi , i am CSS IN JS!</span>
    </div>
}

// style.js
/* 容器的背景颜色 */
const boxStyle = {
    backgroundColor:'blue',
}
/* 字体颜色 */
const textStyle = {
    color:'orange'
}

export default {
    boxStyle,
    textStyle
}
```

由于 CSS IN JS 本质上就是运用 js 中对象形式保存样式， 所以 js 对象的操作方法都可以灵活的用在 CSS IN JS上。

**拓展运算符实现样式继承**

```js
const baseStyle = { /* 基础样式 */ }

const containerStyle = { 
    ...baseStyle,  // 继承  baseStyle 样式
    color:'#ccc'   // 添加的额外样式
}
```

**动态添加样式变得更加灵活**

```js
/* 暗色调  */
const dark = {
    backgroundColor:'black',
}
/* 亮色调 */
const light = {
    backgroundColor:'white',
}

<span style={ theme==='light' ? Style.light : Style.dark  }  >hi , i am CSS IN JS!</span>

<span style={ { ...Style.textStyle , ...(theme==='light' ? Style.light : Style.dark  ) }}  >hi , i am CSS IN JS!</span>
```

### style-components 库使用

CSS IN JS 也可以由一些第三方库支持，比如我即将介绍的 style-components。 style-components 可以把写好的 css 样式注入到组件中，项目中应用的已经是含有样式的组件。

```js
import styled from 'styled-components'
/* 给button标签添加样式，形成 Button React 组件 */
const Button = styled.button`
    background: #6a8bad;
    color: #fff;
    min-width: 96px;
    height :36px;
    border :none;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-left: 20px !important;
`
export default function Index(){
    return <div>
        <Button>按钮</Button>
    </div>
}
```

#### 基于 props 动态添加样式

style-components 可以通过给生成的组件添加 props 属性 ，来动态添加样式。

```js
const Button = styled.button`
    background: ${ props => props.theme ? props.theme : '#6a8bad'  };
    color: #fff;
    min-width: 96px;
    height :36px;
    border :none;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-left: 20px !important;
`
export default function Index(){
    return <div>
        <Button theme={'#fc4838'}  >props主题按钮</Button>
    </div>
}
```

#### 继承样式

style-components 可以通过继承方式来达到样式的复用。

```js
const NewButton = styled(Button)`
    background: orange;
    color: pink;
`
export default function Index(){
    return <div>
       <NewButton > 继承按钮</NewButton>
    </div>
}
```

### 小结

CSS IN JS 特点：

- CSS IN JS 本质上放弃了 css ，变成了 css in line 形式，所以根本上解决了全局污染，样式混乱等问题。
- 运用起来灵活，可以运用 js 特性，更灵活地实现样式继承，动态添加样式等场景。
- 由于编译器对 js 模块化支持度更高，使得可以在项目中更快地找到 style.js 样式文件，以及快捷引入文件中的样式常量。
- 无须 webpack 额外配置 css，less 等文件类型。

CSS IN JS 注意事项：

虽然运用灵活，但是写样式不如 css 灵活，由于样式用 js 写，所以无法像 css 写样式那样可以支持语法高亮，样式自动补全等。所以要更加注意一些样式单词拼错的问题。

[CSS 模块化方案探讨](https://juejin.cn/post/6947335144894103583)

[使用styled-components来进行react开发](https://juejin.cn/post/6844903621000183821)
