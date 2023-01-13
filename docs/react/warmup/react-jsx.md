# React JSX

## 认识 JSX

- 了解常用的元素会被 React 处理成什么，有利于后续理解 react fiber 类型；
- 理解 jsx 的编译过程，方便操纵 children、控制 React 渲染，有利于便捷使用 React 插槽组件

```js
const toLearn = [ 'react' , 'vue' , 'webpack' , 'nodejs'  ]

const TextComponent = ()=> <div> hello , i am function component </div> 

class Index extends React.Component{
    status = false /* 状态 */
    renderFoot=()=> <div> i am foot</div>
    render(){
        /* 以下都是常用的jsx元素节 */
        return <div style={{ marginTop:'100px' }}   >
            { /* element 元素类型 */ }
            <div>hello,world</div>
            { /* fragment 类型 */ }
            <React.Fragment>
                <div> 👽👽 </div>
            </React.Fragment>
            { /* text 文本类型 */ }
            my name is alien 
            { /* 数组节点类型 */ }
            { toLearn.map(item=> <div key={item} >let us learn { item } </div> ) }
            { /* 组件类型 */ }
            <TextComponent/>
            { /* 三元运算 */  }
            { this.status ? <TextComponent /> : <div>三元运算</div> }
            { /* 函数执行 */ } 
            { this.renderFoot() }
            <button onClick={ ()=> console.log( this.render() ) } >打印render后的内容</button>
        </div>
    }
}
```

 JSX 元素节点会被编译成 React Element 形式

```js
React.createElement(
  type,
  [props],
  [...children]
)
```

- 第一个参数：如果是组件类型，会传入组件对应的类或函数；如果是 dom 元素类型，传入 div 或者 span 之类的字符串。
- 第二个参数：一个对象，在 dom 类型中为标签属性，在组件类型中为 props 。
- 其他参数：依次为 children，根据顺序排列。

最终，在调和阶段，上述 React element 对象的每一个子节点都会形成一个与之对应的 fiber 对象，然后通过 sibling、return、child 将每一个 fiber 对象联系起来。

React 针对不同 React element 对象会产生不同 tag (种类) 的fiber 对象。首先，来看一下 tag 与 element 的对应关系：

```js
export const FunctionComponent = 0;       // 函数组件
export const ClassComponent = 1;          // 类组件
export const IndeterminateComponent = 2;  // 初始化的时候不知道是函数组件还是类组件 
export const HostRoot = 3;                // Root Fiber 可以理解为根元素 ， 通过reactDom.render()产生的根元素
export const HostPortal = 4;              // 对应  ReactDOM.createPortal 产生的 Portal 
export const HostComponent = 5;           // dom 元素 比如 <div>
export const HostText = 6;                // 文本节点
export const Fragment = 7;                // 对应 <React.Fragment> 
export const Mode = 8;                    // 对应 <React.StrictMode>   
export const ContextConsumer = 9;         // 对应 <Context.Consumer>
export const ContextProvider = 10;        // 对应 <Context.Provider>
export const ForwardRef = 11;             // 对应 React.ForwardRef
export const Profiler = 12;               // 对应 <Profiler/ >
export const SuspenseComponent = 13;      // 对应 <Suspense>
export const MemoComponent = 14;          // 对应 React.memo 返回的组件
```

fiber 对应关系：

- child： 一个由父级 fiber 指向子级 fiber 的指针。
- return：一个子级 fiber 指向父级 fiber 的指针。
- sibling: 一个 fiber 指向下一个兄弟 fiber 的指针。

对于上述在 jsx 中写的 map 数组结构的子节点，外层会被加上 fragment；map 返回数组结构，作为 fragment 的子节点。

## 可控 Render

上面的 demo 暴露出了如下问题：

1. 返回的 children 虽然是一个数组，但是数组里面的数据类型却是不确定的，有对象类型( 如ReactElement ) ，有数组类型(如 map 遍历返回的子节点)，还有字符串类型(如文本)；
2. 法对 render 后的 React element 元素进行可控性操作。

针对上述问题，我们需要对 demo 项目进行改造处理，具体过程可以分为4步：

1. 将上述 children 扁平化处理，将数组类型的子节点打开
2. 干掉 children 中文本类型节点；
3. 向 children 最后插入元素
4. 克隆新的元素节点并渲染。

想要把 render 过程变成可控的，需要把上述代码进行改造:

```js
class Index extends React.Component{
    status = false /* 状态 */
    renderFoot=()=> <div> i am foot</div>
    /* 控制渲染 */
    controlRender=()=>{
        const reactElement = (
            <div style={{ marginTop:'100px' }} className="container"  >   
                 { /* element 元素类型 */ }
                <div>hello,world</div>  
                { /* fragment 类型 */ }
                <React.Fragment>      
                    <div> 👽👽 </div>
                </React.Fragment>
                { /* text 文本类型 */ }
                my name is alien       
                { /* 数组节点类型 */ }
                { toLearn.map(item=> <div key={item} >let us learn { item } </div> ) } 
                { /* 组件类型 */ }
                <TextComponent/>  
                { /* 三元运算 */  }
                { this.status ? <TextComponent /> :  <div>三元运算</div> }  
                { /* 函数执行 */ } 
                { this.renderFoot() }  
                <button onClick={ ()=> console.log( this.render() ) } >打印render后的内容</button>
            </div>
        )
        console.log(reactElement)
        const { children } = reactElement.props
        /* 第1步 ： 扁平化 children  */
        const flatChildren = React.Children.toArray(children)
        console.log(flatChildren)
        /* 第2步 ： 除去文本节点 */
        const newChildren :any= []
        React.Children.forEach(flatChildren,(item)=>{
            if(React.isValidElement(item)) newChildren.push(item)
        })
        /* 第3步，插入新的节点 */
        const lastChildren = React.createElement(`div`,{ className :'last' } ,`say goodbye`)
        newChildren.push(lastChildren)
        
        /* 第4步：修改容器节点 */
        const newReactElement =  React.cloneElement(reactElement,{} ,...newChildren )
        return newReactElement
    }
    render(){
        return this.controlRender()
    }
}
```

1. React.Children.toArray 扁平化，规范化 children 数组

React.Children.toArray 可以扁平化、规范化 React.element 的 children 组成的数组，只要 children 中的数组元素被打开，对遍历 children 很有帮助，而且 React.Children.toArray 还可以深层次 flat 。

2. 遍历 children ，验证 React.element 元素节点，除去文本节点

用 React.Children.forEach 去遍历子节点，如果是 react Element 元素，就添加到新的 children 数组中，通过这种方式过滤掉非 React element 节点。React.isValidElement 这个方法可以用来检测是否为 React element 元素，接收一个参数——待验证对象，如果是返回 true ， 否则返回 false 。React.Children.forEach 本身就可以把 children 扁平化,述第一步操作多此一举。`React.Children.forEach = React.Children.toArray + Array.prototype.forEach`。

3. 用 React.createElement ，插入到 children 最后

4. 已经修改了 children，现在做的是，通过 cloneElement 创建新的容器元素

为什么要用 `React.cloneElement` ，createElement 把上面写的 jsx，变成 element 对象; 而 cloneElement 的作用是以 element 元素为样板克隆并返回新的 `React element 元素`。返回元素的 props 是将新的 props 与原始元素的 props 浅层合并后的结果。这里 `React.cloneElement` 做的事情就是，把 `reactElement` 复制一份，再用新的 children 属性，从而达到改变 render 结果的目的。

::: tip 可控 render
在实际的业务中用的比较少，有一些封装高阶组件的场景可能会用到。开源组件库中比较常见，例如 `<ButtonGroup>` 等，一方面扩展、过滤组件props，另外一方面根据props参数拓展render。
:::

## Babel 解析 JSX 流程

### babel 插件

JSX 语法实现来源于这两个 babel 插件：

- @babel/plugin-syntax-jsx ： 使用这个插件，能够让 Babel 有效的解析 JSX 语法。
- @babel/plugin-transform-react-jsx ：这个插件内部调用了 @babel/plugin-syntax-jsx，可以把 React JSX 转化成 JS 能够识别的 createElement 格式。

### Automatic Runtime

新版本 React 已经不需要引入 createElement ，这种模式来源于 `Automatic Runtime`:

```js
// 业务代码
function Index(){
    return <div>
        <h1>hello,world</h1>
        <span>let us learn React</span>
    </div>
}

// 编译结果
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
function Index() {
  return  _jsxs("div", {
            children: [
                _jsx("h1", {
                   children: "hello,world"
                }),
                _jsx("span", {
                    children:"let us learn React" ,
                }),
            ],
        });
}
```

plugin-syntax-jsx 已经向文件中提前注入了 `_jsxRuntime api`。不过这种模式下需要我们在 .babelrc 设置 runtime: automatic 。

```js
"presets": [    
    ["@babel/preset-react",{
    "runtime": "automatic"
    }]     
],
```

### Classic Runtime

在经典模式下，使用 JSX 的文件需要引入 React ，不然就会报错。

```js
// 业务代码
import React from 'react'
function Index(){
    return <div>
        <h1>hello,world</h1>
        <span>let us learn React</span>
    </div>
}

// 编译后文件
import React from 'react'
function Index(){
    return  React.createElement(
        "div",
        null,
        React.createElement("h1", null,"hello,world"),
        React.createElement("span", null, "let us learn React")
    );
}
```

### babel 编译过程

```js
const fs = require('fs')
const babel = require("@babel/core")

/* 第一步：模拟读取文件内容。 */
fs.readFile('./element.js',(e,data)=>{ 
    const code = data.toString('utf-8')
    /* 第二步：转换 jsx 文件 */
    const result = babel.transformSync(code, {
        plugins: ["@babel/plugin-transform-react-jsx"],
    });
    /* 第三步：模拟重新写入内容。 */
    fs.writeFile('./element.js',result.code,function(){})
})

// 转译后 成功转成 React.createElement 形式
import React from 'react';

function TestComponent() {
  return /*#__PURE__*/React.createElement("p", null, " hello,React ");
}

function Index() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "\u6A21\u62DF babel \u5904\u7406 jsx \u6D41\u7A0B\u3002"), /*#__PURE__*/React.createElement(TestComponent, null));
}
export default Index;
```

## 问题

### Q1. 老版本的 React 中，为什么写 jsx 的文件要默认引入 React?

```js
import React from 'react'
function Index(){
    return <div>hello,world</div>
}
```

因为 jsx 在被 babel 编译后，写的 jsx 会变成 React.createElement 形式，所以需要引入 React，防止找不到 React 引起报错。@babel/plugin-syntax-jsx ,在编译的过程中注入 `_jsxRuntime api` ，使得新版本 React 已经不需要引入 createElement

### Q2. `React.createElement` 和 `React.cloneElement` 到底有什么区别?

一个是用来创建 element 。另一个是用来修改 element，并返回一个新的 `React.element` 对象。
