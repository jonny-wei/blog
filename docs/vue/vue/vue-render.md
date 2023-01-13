# 渲染器

组件的本质：组件的本质是一个函数。在模板引擎年代，给什么样的数据，就渲染对应的 html 内容（模板 + 数据 = html）；
在如今的前端框架年代，给什么样的数据，就渲染什么样的 Virtual DOM （模板 + 数据 = Virtual DOM）。

组件的产出：组件的产出是 Virtual DOM。组件的核心是 render 函数，通过 render 函数生成 Virtual DOM，然后通过 patch "打补丁" 将虚拟 DOM 节点高效的渲染成真实的 DOM。

为什么要 Virtual DOM：主要原因是 Virtual DOM 带来了 分层设计、跨平台以及 SSR 等特性。至于 Virtual DOM 比 原生 DOM 谁的性能好，需要 “控制变量法” 才能比较。

Virtual DOM 是 真实 DOM 的描述。

组件 VNode 对的描述：可以让 VNode 的 tag 属性指向组件本身，从而使用 VNode 来描述组件。

```javascript
function MyComponent(props) {}
```
函数式组件：
- 是一个纯函数
- 没有自身状态，只接收外部数据
- 产 VNode 的方式：单纯的函数调用
```javascript
class MyComponent {}
```
有状态组件：
- 是一个类，可实例化
- 可以有自身状态
- 产出 VNode 的方式：需要实例化，然后调用其 render 函数

Fragment：渲染一个片段，多个根元素组成的抽象元素（通常用一个根元素包裹其他元素，而 Fragment 一个片段可以直接包含多个根元素）。 
Fragment 根元素并不是一个实实在在的真实 DOM，而是一个抽象的标识，即 Fragment。

Portal：它允许你把内容渲染到任何地方。组件要渲染的内容不受 DOM 层级关系限制，即可以渲染到任何位置。应用场景：如，蒙层组件。所谓 Portal 就是把子节点渲染到给定的目标。

VNode分类：不同类型的 VNode 拥有不同的设计。我们可以把 VNode 分成五类，分别是：html/svg 元素、组件、纯文本、Fragment 以及 Portal。可以把组件细分为 有状态组件 和 函数式组件。
同时有状态组件还可以细分为三部分：普通的有状态组件、需要被 keepAlive 的有状态组件 以及 已经被 keepAlive 的有状态组件 。

使用 flags 作为 VNode 的标识：使用一个唯一的标识，来标明某一个 VNode 属于哪一类。同时给 VNode 添加 flags 也是 Virtual DOM 算法的优化手段之一。

比如在 Vue2 中区分 VNode 是 html 元素还是组件亦或是普通文本，是这样做的：

- 拿到 VNode 后先尝试把它当作组件去处理，如果成功地创建了组件，那说明该 VNode 就是组件的 VNode
- 如果没能成功地创建组件，则检查 vnode.tag 是否有定义，如果有定义则当作普通标签处理
- 如果 vnode.tag 没有定义则检查是否是注释节点
- 如果不是注释节点，则会把它当作文本节点对待

以上这些判断都是在挂载(或patch)阶段进行的，换句话说，一个 VNode 到底描述的是什么是在挂载或 patch 的时候才知道的。这就带来了两个难题：无法从 AOT 的层面优化、开发者无法手动优化。
为了解决这个问题，我们的思路是在 VNode 创建的时候就把该 VNode 的类型通过 flags 标明，这样在挂载或 patch 阶段通过 flags 可以直接避免掉很多消耗性能的判断。

判断 flags 即 VNode 的类型使用位运算进一步提高判断性能。实际上 Vue3 在 Virtual DOM 的优化上采用的就是 inferno 的手段。

```javascript
const VNodeFlags = {
  // html 标签
  ELEMENT_HTML: 1,
  // SVG 标签
  ELEMENT_SVG: 1 << 1,

  // 普通有状态组件
  COMPONENT_STATEFUL_NORMAL: 1 << 2,
  // 需要被keepAlive的有状态组件
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,
  // 已经被keepAlive的有状态组件
  COMPONENT_STATEFUL_KEPT_ALIVE: 1 << 4,
  // 函数式组件
  COMPONENT_FUNCTIONAL: 1 << 5,

  // 纯文本
  TEXT: 1 << 6,
  // Fragment
  FRAGMENT: 1 << 7,
  // Portal
  PORTAL: 1 << 8,
  
  // html 和 svg 都是标签元素，可以用 ELEMENT 表示
  VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG,
  // 普通有状态组件、需要被keepAlive的有状态组件、已经被keepAlice的有状态组件 
  // 都是“有状态组件”，统一用 COMPONENT_STATEFUL 表示
  VNodeFlags.COMPONENT_STATEFUL =
    VNodeFlags.COMPONENT_STATEFUL_NORMAL |
    VNodeFlags.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE |
    VNodeFlags.COMPONENT_STATEFUL_KEPT_ALIVE,
  // 有状态组件 和  函数式组件都是“组件”，用 COMPONENT 表示
  VNodeFlags.COMPONENT = VNodeFlags.COMPONENT_STATEFUL | VNodeFlags.COMPONENT_FUNCTIONAL
}
``` 
给 VNode 定义了 children 属性，用来存储子 VNode。

总的来说无非有以下几种：

- 没有子节点
- 只有一个子节点
- 多个子节点
  - 有 key
  - 无 key
- 不知道子节点的情况

```javascript
const ChildrenFlags = {
  // 未知的 children 类型
  UNKNOWN_CHILDREN: 0,
  // 没有 children
  NO_CHILDREN: 1,
  // children 是单个 VNode
  SINGLE_VNODE: 1 << 1,

  // children 是多个拥有 key 的 VNode
  KEYED_VNODES: 1 << 2,
  // children 是多个没有 key 的 VNode
  NONE_KEYED_VNODES: 1 << 3
  
  ChildrenFlags.MULTIPLE_VNODES = ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES
}
```
组件的“子 VNode”其实不应该作为 children 而是应该作为 slots，所以我们会定义 VNode.slots 属性来存储这些子 VNode。

VNode设计如下：
```javascript
export interface VNode {
  // _isVNode 属性在上文中没有提到，它是一个始终为 true 的值，有了它，我们就可以判断一个对象是否是 VNode 对象
  _isVNode: true
  // el 属性在上文中也没有提到，当一个 VNode 被渲染为真实 DOM 之后，el 属性的值会引用该真实DOM
  el: Element | null
  flags: VNodeFlags
  tag: string | FunctionalComponent | ComponentClass | null
  data: VNodeData | null
  children: VNodeChildren
  childFlags: ChildrenFlags
}
```
如何根据 tag 属性确定该 VNode 对象的 flags 值，很简单如下：

```javascript
function h(tag, data = null, children = null) {
  let flags = null
  if (typeof tag === 'string') {
    flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML
  } else if (tag === Fragment) {
    flags = VNodeFlags.FRAGMENT
  } else if (tag === Portal) {
    flags = VNodeFlags.PORTAL
    tag = data && data.target
  } else {
    // 兼容 Vue2 的对象式组件
    if (tag !== null && typeof tag === 'object') {
      flags = tag.functional
        ? VNodeFlags.COMPONENT_FUNCTIONAL       // 函数式组件
        : VNodeFlags.COMPONENT_STATEFUL_NORMAL  // 有状态组件
    } else if (typeof tag === 'function') {
      // Vue3 的类组件
      flags = tag.prototype && tag.prototype.render
        ? VNodeFlags.COMPONENT_STATEFUL_NORMAL  // 有状态组件
        : VNodeFlags.COMPONENT_FUNCTIONAL       // 函数式组件
    }
  }
}
```
确定一个 VNode 对象的 childFlags：

```javascript
function h(tag, data = null, children = null) {
  // 省略用于确定 flags 相关的代码

  let childFlags = null
  if (Array.isArray(children)) {
    const { length } = children
    if (length === 0) {
      // 没有 children
      childFlags = ChildrenFlags.NO_CHILDREN
    } else if (length === 1) {
      // 单个子节点
      childFlags = ChildrenFlags.SINGLE_VNODE
      children = children[0]
    } else {
      // 多个子节点，且子节点使用key
      childFlags = ChildrenFlags.KEYED_VNODES
      children = normalizeVNodes(children)
    }
  } else if (children == null) {
    // 没有子节点
    childFlags = ChildrenFlags.NO_CHILDREN
  } else if (children._isVNode) {
    // 单个子节点
    childFlags = ChildrenFlags.SINGLE_VNODE
  } else {
    // 其他情况都作为文本节点处理，即单个子节点，会调用 createTextVNode 创建纯文本类型的 VNode
    childFlags = ChildrenFlags.SINGLE_VNODE
    children = createTextVNode(children + '')
  }
}
```

渲染器，简单的说就是将 Virtual DOM 渲染成特定平台下真实 DOM 的工具(就是一个函数，通常叫 render)，
渲染器的工作流程分为两个阶段：mount 和 patch，如果旧的 VNode 存在，则会使用新的 VNode 与旧的 VNode 进行对比，
试图以最小的资源开销完成 DOM 的更新，这个过程就叫 patch，或“打补丁”。如果旧的 VNode 不存在，则直接将新的 VNode 挂载成全新的 DOM，这个过程叫做 mount。

渲染器的责任非常之大，是因为它不仅仅是一个把 VNode 渲染成真实 DOM 的工具，它还负责以下工作：

- 控制部分组件生命周期钩子的调用

在整个渲染周期中包含了大量的 DOM 操作、组件的挂载、卸载，控制着组件的生命周期钩子调用的时机。

- 多端渲染的桥梁

渲染器也是多端渲染的桥梁，自定义渲染器的本质就是把特定平台操作“DOM”的方法从核心算法中抽离，并提供可配置的方案。

- 与异步渲染有直接关系

Vue3 的异步渲染是基于调度器的实现，若要实现异步渲染，组件的挂载就不能同步进行，DOM的变更就要在合适的时机，一些需要在真实DOM存在之后才能执行的操作(如 ref)也应该在合适的时机进行。
对于时机的控制是由调度器来完成的，但类似于组件的挂载与卸载以及操作 DOM 等行为的入队还是由渲染器来完成的，这也是为什么 Vue2 无法轻易实现异步渲染的原因。

- 包含最核心的 Diff 算法

Diff 算法是渲染器的核心特性之一，可以说正是 Diff 算法的存在才使得 Virtual DOM 如此成功。


挂载普通元素标签
```javascript
const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/
function mountElement(vnode, container, isSVG) {
  // 省略...

  const data = vnode.data
  if (data) {
    for (let key in data) {
      switch (key) {
        case 'style':
          for (let k in data.style) {
            el.style[k] = data.style[k]
          }
          break
        case 'class':
          if (isSVG) {
            el.setAttribute('class', data[key])
          } else {
            el.className = data[key]
          }
          break
        default:
          if (key[0] === 'o' && key[1] === 'n') {
            // 事件
            el.addEventListener(key.slice(2), data[key])
          } else if (domPropsRE.test(key)) {
            // 当作 DOM Prop 处理
            el[key] = data[key]
          } else {
            // 当作 Attr 处理
            el.setAttribute(key, data[key])
          }
          break
      }
    }
  }

  // 省略...
}
```
有些属性不能通过 setAttribute 设置，而是应该直接通过 DOM 元素设置：value、checked、selected、muted。
除此之外还有一些属性也需要使用 Property 的方式设置到 DOM 元素上，例如 innerHTML 和 textContent 等等。

挂载文本节点
```javascript
function mountText(vnode, container) {
  const el = document.createTextNode(vnode.children)
  vnode.el = el
  container.appendChild(el)
}
```

挂载 Fragment 
```javascript
function mountFragment(vnode, container, isSVG) {
  const { children, childFlags } = vnode
  switch (childFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      mount(children, container, isSVG)
      // 单个子节点，就指向该节点
      vnode.el = children.el
      break
    case ChildrenFlags.NO_CHILDREN:
      const placeholder = createTextVNode('')
      mountText(placeholder, container)
      // 没有子节点指向占位的空文本节点
      vnode.el = placeholder.el
      break
    default:
      for (let i = 0; i < children.length; i++) {
        mount(children[i], container, isSVG)
      }
      // 多个子节点，指向第一个子节点
      vnode.el = children[0].el
  }
}
```
对于 Fragment 类型的 VNode 来说，当它被渲染为真实DOM之后，其 el 属性的引用是谁呢？这需要根据片段中节点的数量来决定，
如果只有一个节点，那么 el 属性就指向该节点；如果有多个节点，则 el 属性值是第一个节点的引用；
如果片段中没有节点，即空片段，则 el 属性引用的是占位的空文本节点元素。

需要一个占位的空文本节点作为位置的引用：作用是在 patch 阶段对DOM元素进行移动时，应该确保将其放到正确的位置，而不应该始终使用 appendChild 函数，
有时需要使用 insertBefore 函数，这时候我们就需要拿到相应的节点引用，这时候 vnode.el 属性是必不可少的。

挂载 Portal

挂载 Portal 的关键是我们需要通过 vnode.tag 获取到真正的挂载点，也就是 target，真正挂载时使用此挂载点代替 container 即可
```javascript
function mountPortal(vnode, container) {
  const { tag, children, childFlags } = vnode
  const target = typeof tag === 'string' ? document.querySelector(tag) : tag
  if (childFlags & ChildrenFlags.SINGLE_VNODE) {
    mount(children, target)
  } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
    for (let i = 0; i < children.length; i++) {
      mount(children[i], target)
    }
  }

  // 占位的空文本节点
  const placeholder = createTextVNode('')
  // 将该节点挂载到 container 中
  mountText(placeholder, container, null)
  // el 属性引用该节点
  vnode.el = placeholder.el
}
```
虽然 Portal 所描述的内容可以被挂载到任何位置，但仍然需要一个占位元素，并且 Portal 类型的 VNode 其 el 属性应该指向该占位元素。因为，
Portal 的另外一个特性：虽然 Portal 的内容可以被渲染到任意位置，但它的行为仍然像普通的 DOM 元素一样，如事件的捕获/冒泡机制仍然按照代码所编写的 DOM 结构实施。
要实现这个功能就必须需要一个占位的 DOM 元素来承接事件。

有状态组件的挂载和原理
```javascript
function mountComponent(vnode, container, isSVG) {
  if (vnode.flags & VNodeFlags.COMPONENT_STATEFUL) {
    mountStatefulComponent(vnode, container, isSVG)
  } else {
    mountFunctionalComponent(vnode, container, isSVG)
  }
}
```
```javascript
function mountStatefulComponent(vnode, container, isSVG) {
  // 创建组件实例
  const instance = new vnode.tag()
  // 渲染VNode
  instance.$vnode = instance.render()
  // 挂载
  mount(instance.$vnode, container, isSVG)
  // el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
  instance.$el = vnode.el = instance.$vnode.el
}
```
组件的 render 函数会返回该组件产出的 VNode，当该 VNode 被挂载为真实DOM之后，就可以通过 instance.$vnode.el 元素拿到组件的根DOM元素，
接着我们就可以让组件实例的 $el 属性和 vnode.el 属性的值都引用该DOM元素。如果组件的 render 返回的是一个片段(Fragment)，
那么 instance.$el 和 vnode.el 引用的就是该片段的第一个DOM元素。

函数式组件的挂载和原理

在挂载函数式组件的时候，比挂载有状态组件少了一个实例化的过程，如果一个 VNode 描述的是函数式组件，那么其 tag 属性值就是该函数的引用

```javascript
function mountFunctionalComponent(vnode, container, isSVG) {
  // 获取 VNode
  const $vnode = vnode.tag()
  // 挂载
  mount($vnode, container, isSVG)
  // el 元素引用该组件的根元素
  vnode.el = $vnode.el
}
```

patch 函数会对新旧 VNode 进行比对，也就是我们所说的 diff。

只有相同类型的 VNode 才有比对的意义。

```javascript
function patch(prevVNode, nextVNode, container) {
  // 分别拿到新旧 VNode 的类型，即 flags
  const nextFlags = nextVNode.flags
  const prevFlags = prevVNode.flags

  // 检查新旧 VNode 的类型是否相同，如果类型不同，则直接调用 replaceVNode 函数替换 VNode
  // 如果新旧 VNode 的类型相同，则根据不同的类型调用不同的比对函数
  if (prevFlags !== nextFlags) {
    replaceVNode(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.ELEMENT) {
    patchElement(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.COMPONENT) {
    patchComponent(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.TEXT) {
    patchText(prevVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.FRAGMENT) {
    patchFragment(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.PORTAL) {
    patchPortal(prevVNode, nextVNode)
  }
}
```

替换操作并不复杂，本质就是把旧的 VNode 所渲染的DOM移除，再挂载新的 VNode。如果新旧 VNode 的类型相同，则会根据不同的类型调用不同的比对函数。

patch 标签元素

即使两个 VNode 的类型同为标签元素，但它们也可能是不同的标签。“相同 VNode 类型，不同标签元素”：
不会对旧的标签元素打补丁，而是使用新的标签元素替换旧的标签元素，这就需要用到我们前面讲过的 replaceVNode 函数。
“相同 VNode 类型，相同标签元素”：两个 VNode 之间的比对，本质上就是对 VNodeData 和 children 的比对。

更新 VNodeData

实际上无论是 mountElement 函数中用来处理 VNodeData 的代码还是 patchElement 函数中用来处理 VNodeData 的代码，它们的本质都是将 VNodeData 中的数据应用到 DOM 元素上，
唯一的区别就是在 mountElement 函数中没有“旧”数据可言，而在 patchElement 函数中既有旧数据也有新数据，所以我们完全可以封装一个叫做 patchData 的函数，
该函数接收新旧数据作为参数，对于 mountElement 函数来讲，由于它没有旧数据可言，所以在调用 patchData 函数时只需要传递 null 作为旧数据即可。

```javascript
function patchElement(prevVNode, nextVNode, container) {
  // 如果新旧 VNode 描述的是不同的标签，则调用 replaceVNode 函数，使用新的 VNode 替换旧的 VNode
  if (prevVNode.tag !== nextVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container)
    return
  }

  // 拿到 el 元素，注意这时要让 nextVNode.el 也引用该元素
  const el = (nextVNode.el = prevVNode.el)
  const prevData = prevVNode.data
  const nextData = nextVNode.data

  if (nextData) {
    // 遍历新的 VNodeData，将旧值和新值都传递给 patchData 函数
    for (let key in nextData) {
      const prevValue = prevData[key]
      const nextValue = nextData[key]
      patchData(el, key, prevValue, nextValue)
    }
  }
  if (prevData) {
    // 遍历旧的 VNodeData，将已经不存在于新的 VNodeData 中的数据移除
    for (let key in prevData) {
      const prevValue = prevData[key]
      if (prevValue && !nextData.hasOwnProperty(key)) {
        // 第四个参数为 null，代表移除数据
        patchData(el, key, prevValue, null)
      }
    }
  }
}
```
历新的 VNodeData，将旧值和新值都传递给 patchData 函数，并由 patchData 函数负责更新数据；同时也需要遍历旧的 VNodeData，将已经不存在于新的 VNodeData 中的数据从元素上移除
```javascript
export function patchData(el, key, prevValue, nextValue) {
  switch (key) {
   case 'style':
     for (let k in nextValue) {
       el.style[k] = nextValue[k]
     }
     for (let k in prevValue) {
       if (!nextValue.hasOwnProperty(k)) {
         el.style[k] = ''
       }
     }
     break
   case 'class':
     el.className = nextValue
     break
    default:
      if (key[0] === 'o' && key[1] === 'n') {
        // 事件
        // 移除旧事件
        if (prevValue) {
          el.removeEventListener(key.slice(2), prevValue)
        }
        // 添加新事件
        if (nextValue) {
          el.addEventListener(key.slice(2), nextValue)
        }
      } else if (domPropsRE.test(key)) {
        // 当作 DOM Prop 处理
        el[key] = nextValue
      } else {
        // 当作 Attr 处理
        el.setAttribute(key, nextValue)
      }
      break
  }
}
```
更新子节点
```javascript
function patchElement(prevVNode, nextVNode, container) {
  // 如果新旧 VNode 描述的是不同的标签，则调用 replaceVNode 函数，使用新的 VNode 替换旧的 VNode
  if (prevVNode.tag !== nextVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container)
    return
  }

  // 拿到 el 元素，注意这时要让 nextVNode.el 也引用该元素
  const el = (nextVNode.el = prevVNode.el)
  const prevData = prevVNode.data
  const nextData = nextVNode.data

  if (nextData) {
    // 遍历新的 VNodeData，将旧值和新值都传递给 patchData 函数
    for (let key in nextData) {
      const prevValue = prevData[key]
      const nextValue = nextData[key]
      patchData(el, key, prevValue, nextValue)
    }
  }
  if (prevData) {
    // 遍历旧的 VNodeData，将已经不存在于新的 VNodeData 中的数据移除
    for (let key in prevData) {
      const prevValue = prevData[key]
      if (prevValue && !nextData.hasOwnProperty(key)) {
        // 第四个参数为 null，代表移除数据
        patchData(el, key, prevValue, null)
      }
    }
  }

  // 调用 patchChildren 函数递归地更新子节点
  patchChildren(
    prevVNode.childFlags, // 旧的 VNode 子节点的类型
    nextVNode.childFlags, // 新的 VNode 子节点的类型
    prevVNode.children,   // 旧的 VNode 子节点
    nextVNode.children,   // 新的 VNode 子节点
    el                    // 当前标签元素，即这些子节点的父节点
  )
}
```
patch 文本节点

```javascript
function patchText(prevVNode, nextVNode) {
  // 拿到文本元素 el，同时让 nextVNode.el 指向该文本元素
  const el = (nextVNode.el = prevVNode.el)
  // 只有当新旧文本内容不一致时才有必要更新
  if (nextVNode.children !== prevVNode.children) {
    el.nodeValue = nextVNode.children
  }
}
```
由于对纯文本类型的 VNode 而言，它的 children 属性存储的就是其文本内容，所以通过对比新旧文本内容是否一致来决定是否需要更新，
只有新旧文本内容不一致时我们才会设置文本节点的 el.nodeValue 属性的值，从而完成文本节点的更新。

patch Fragment
实际上片段的更新是简化版的标签元素的更新,然而由于 Fragment 没有包裹元素，只有子节点，所以我们对 Fragment 的更新本质上就是更新两个片段的“子节点”。
```javascript
function patchFragment(prevVNode, nextVNode, container) {
  // 直接调用 patchChildren 函数更新 新旧片段的子节点即可
  patchChildren(
    prevVNode.childFlags, // 旧片段的子节点类型
    nextVNode.childFlags, // 新片段的子节点类型
    prevVNode.children,   // 旧片段的子节点
    nextVNode.children,   // 新片段的子节点
    container
  )

  switch (nextVNode.childFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      nextVNode.el = nextVNode.children.el
      break
    case ChildrenFlags.NO_CHILDREN:
      nextVNode.el = prevVNode.el
      break
    default:
      nextVNode.el = nextVNode.children[0].el
  }
}
```
通过检查新的片段的 children 类型，如果新的片段的 children 类型是单个子节点，则意味着其 vnode.children 属性的值就是 VNode 对象，
所以直接将 nextVNode.children.el 赋值给 nextVNode.el 即可。如果新的片段没有子节点，我们知道对于没有子节点的片段我们会使用一个空的文本节点占位，
而 prevVNode.el 属性引用的就是该空文本节点，所以我们直接通过旧片段的 prevVNode.el 拿到该空文本元素并赋值给新片段的 nextVNode.el 即可。
如果新的片段的类型是多个子节点，则 nextVNode.children 是一个 VNode 数组，我们会让新片段的 nextVNode.el 属性引用数组中的第一个元素。
实际上这段逻辑与我们在 mountFragment 函数中所实现的逻辑是一致的。

patch Portal

```javascript
function patchPortal(prevVNode, nextVNode) {
  patchChildren(
    prevVNode.childFlags,
    nextVNode.childFlags,
    prevVNode.children,
    nextVNode.children,
    prevVNode.tag // 注意 container 是旧的 container
  )
  // 让 nextVNode.el 指向 prevVNode.el
  nextVNode.el = prevVNode.el

  // 如果新旧容器不同，才需要搬运
  if (nextVNode.tag !== prevVNode.tag) {
    // 获取新的容器元素，即挂载目标
    const container =
      typeof nextVNode.tag === 'string'
        ? document.querySelector(nextVNode.tag)
        : nextVNode.tag

    switch (nextVNode.childFlags) {
      case ChildrenFlags.SINGLE_VNODE:
        // 如果新的 Portal 是单个子节点，就把该节点搬运到新容器中
        container.appendChild(nextVNode.children.el)
        break
      case ChildrenFlags.NO_CHILDREN:
        // 新的 Portal 没有子节点，不需要搬运
        break
      default:
        // 如果新的 Portal 是多个子节点，遍历逐个将它们搬运到新容器中
        for (let i = 0; i < nextVNode.children.length; i++) {
          container.appendChild(nextVNode.children[i].el)
        }
        break
    }
  }
}
```