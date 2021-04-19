# DOM 事件模型(事件流)

## 事件流
DOM的结构是一个树形，每当HTML元素产生事件时，该事件就会在树的根节点和元素节点之间传播，所有经过的节点都会收到该事件，将这种事件传递的过程称为事件流。

## DOM事件模型
DOM事件的模型（事件机制）就是事件捕获和事件冒泡。

![DOM事件的模型](/blog/images/javascript/DOM事件模型.png)

## 事件流3阶段
- 捕获阶段
- 目标阶段
- 冒泡阶段

## 事件绑定
DOM的事件模型（事件机制）主要反映在事件的注册和监听。注册事件回调的方式主要有以下3种：
- DOM0级(on+type)。通过DOM元素属性， 只支持事件冒泡，缺点是每个事件元素只能被设置一个事件回调。
- DOM2级(addEventListener)。通过addEventListener为元素绑定事件回调。IE6-8不兼容这个方法，在低版本的IE中需要使用attachEvent。
- 通过HTML属性。不推荐，这种方式不能将内容和行为很好地分开，使得HTML变大并减少了可读性。

## addEventListener 的第三个参数
element.addEventListener(event, function, useCapture)
|参数|描述|
| :---- | :---- |
|event|  必须。字符串，指定事件名。<br> 注意: 不要使用 "on" 前缀。 例如，使用 "click" ,而不是使用 "onclick"。<br> 提示： 所有 HTML DOM 事件，可以查看 [HTML DOM Event 对象参考手册](https://www.runoob.com/jsref/dom-obj-event.html)。    |
|function|必须。指定要事件触发时执行的函数。<br>当事件对象会作为第一个参数传入函数。 事件对象的类型取决于特定的事件。例如， "click" 事件属于 MouseEvent(鼠标事件) 对象。      |
|useCapture|true - 事件捕获 <br> false - 事件冒泡      |

## 阻止事件冒泡
- 给子级加 `event.stopPropagation()`
- 在事件处理函数中返回 false
  
## 阻止默认事件
- `event.preventDefault()`
- return false  

::: tip 补充
`stopPropagation()` 方法既可以阻止事件冒泡，也可以阻止事件捕获，也可以阻止处于目标阶段。<br>
DOM3 级新增事件 `stopImmediatePropagation()` 方法来阻止事件捕获，另外此方法还可以阻止事件冒泡，阻止该元素的其他事件发生。<br>
由于浏览器兼容性问题，事件捕获很少使用，经常使用事件冒泡。
:::

::: tip 如何让事件先冒泡后捕获
在 DOM 标准事件模型中，是先捕获后冒泡。但是如果要实现先冒泡后捕获的效果，对于同一个事件，监听捕获和冒泡，分别对应相应的处理函数，监听到捕获事件，先暂缓执行，直到冒泡事件被捕获后再执行捕获之间。
:::

## 事件代理(事件委托)
利用事件冒泡机制把本该在元素自身响应的事件交给任意一个上级元素去处理，这种行为称之为事件委托或者事件代理。

事件代理的优点
- 节省内存，节约监听数量
- 可以监听动态元素，不论内部元素是增加还是减少
- `event.target == event.currentTarget`，让触发事件的元素等于绑定事件的元素

事件代理是利用事件冒泡机制处理指定一个事件处理程序，来管理某一类型的所有事件。
利用冒泡的原理，将事件加到父级身上，触发执行效果，这样只在内存中开辟一块空间，既节省内存资源又减少 DOM 操作，提高性能。
此外还可以动态绑定事件，比如，列表新增元素或删除就不用进行重新绑定了。

::: tip event.target 与 event.currentTarget 区别
- `event.target` 返回触发事件的元素
- `event.currentTarget` 返回绑定事件的元素，只有被点击的那个目标元素的 `event.target`才会等于 `event.currentTarget`
:::

## 应用
- 多个同级元素同一种事件绑定
- 监听不存在的元素

## 封装事件委托函数
```javascript
function on(eventType,elDelegate,selector,fn){
    if(!(elDelegate instanceof Element) && (typeof elDelegate === 'string')){
          elDelegate = document.querySelector(elDelegate)
    }
    elDelegate.addEventListener(eventType,(e) => {
        let el = e.target
        while(!el.matches(selector)){ // 注意：matches接收的是CSS选择器
        if(elDelegate === el){
            el = null
            break
        }
        el = el.parentNode
        }
        el && fn.call(el,e,el)
    })
  return elDelegate
}
// 使用方式
on('click','div','#btn1',fn)

/**
 * (1)仅仅判断 target 是否匹配 selector是不够的，
 * 因为如果 selector内还有子元素的话，只进行一次判断是不够的。
 * 还需要向上递归判断target的上一个节点是否是 ()selector，直到找到或者匹配到代理节点后结束匹配；
 * (2)matches()函数参数接收的是CSS选择器，不要误传元素对象；
 * (3)e.target是在页面中被用户操作的元素，e.currentTarget是程序员监听的元素。
 * /
```
## Vue 事件修饰符
- .stop 阻止单击事件继续传播
- .prevent 提交事件不再重载页面
- .capture 添加事件监听器时使用事件捕获模式，一种自上而下的处理方式
- .self 事件只在本身处理
>默认情况下，事件向上传播， 即事件冒泡
- .once 点击事件将只会触发一次，可以用在自定义组件事件上
- .passive 滚动事件的默认行为将会立即触发
> `<div v-on:scroll.passive="onScroll" >...</div>`
  在默认情况下滚动的时候，浏览器会在整个事件处理完毕之后再触发滚动，因为浏览器并不知道这个事件是否在其处理函数中被调用了 event.preventDefault() （通知 Web 浏览器不要执行与事件关联的默认动作）。<br>
  .passive 修饰符用来进一步告诉浏览器这个事件的默认行为不会被取消。 这样可有效的提高浏览器的性能。

::: tip 提示
修饰符可以串联，并且在进行修饰符串联的时候，顺序很重要
:::

::: danger 注意
不要把 .passive 和 .prevent 一起使用，因为 .prevent 将会被忽略，同时浏览器可能会向你展示一个警告。请记住，.passive 会告诉浏览器你不想阻止事件的默认行为。
:::