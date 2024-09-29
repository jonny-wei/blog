# Vue 指令

`Vue.directive( id, [definition] )`

Vue对于自定义指令定义对象提供了几个钩子函数，这几个钩子函数分别对应着指令的几种状态，一个指令从第一次被绑定到元素上到最终与被绑定的元素解绑，它会经过以下几种状态：

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。
- componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
- unbind：只调用一次，指令与元素解绑时调用。

有了每个状态的钩子函数，这样我们就可以让指令在不同状态下做不同的事情。

:::tip Vue3 中新指令
[v-memo](<https://cn.vuejs.org/api/built-in-directives.html#v-memo>)
:::

```js
// 注册
Vue.directive('my-directive', {
  bind: function () {},
  inserted: function () {},
  update: function () {},
  componentUpdated: function () {},
  unbind: function () {}
})

// 注册 (指令函数)
Vue.directive('my-directive', function () {
  // 这里将会被 `bind` 和 `update` 调用
})

// getter，返回已注册的指令
var myDirective = Vue.directive('my-directive')
```

## 自定义指令

在 Vue 中，除了 Vue 本身为我们提供的一些内置指令之外，Vue 还支持用户自定义指令。并且用户有两种定义指令的方式：一种是使用全局 API—— `Vue.directive` 来定义全局指令，这种方式定义的指令会被存放在 `Vue.options['directives']` 中；另一种是在组件内的 directive 选项中定义专为该组件使用的局部指令，这种方式定义的指令会被存放在 `vm.$options['directives']` 中。那么定义的指令什么时候才会生效呢？或者说它是如何生效的呢？

其实，在虚拟DOM渲染更新的时候，它在执行相关操作的同时，还会在每个阶段触发相应的钩子函数，我们只需监听不同的钩子函数，就可以在虚拟DOM渲染更新的不同阶段做一些额外的事情。下表给出了虚拟DOM在渲染更新的不同阶段所触发的不同的钩子函数及其触发时机：

| 钩子函数名称 | 触发时机  | 回调参数 |
| :---- | :------ | :----|
| init | 已创建VNode，在patch期间发现新的虚拟节点时被触发 | VNode |
| create | 已基于VNode创建了DOM元素 | emptyNode和VNode |
| activate  | keep-alive组件被创建 | emptyNode和innerNode  |
| insert   | VNode对应的DOM元素被插入到父节点中时被触发  | VNode  |
| prepatch  | 一个VNode即将被patch之前触发  | oldVNode和VNode       |
| update   | 一个VNode更新时触发 | oldVNode和VNode       |
| postpatch | 一个VNode被patch完毕时触发 | oldVNode和VNode       |
| destory  | 一个VNode对应的DOM元素从DOM中移除时或者它的父元素从DOM中移除时触发 | VNode |
| remove | 一个VNode对应的DOM元素从DOM中移除时触发。与destory不同的是，如果是直接将该VNode的父元素从DOM中移除导致该元素被移除，那么不会触发 | VNode和removeCallback |

所以我们只需在恰当的阶段监听对应的钩子函数来处理指令的相关逻辑，从而就可以使指令生效了。

现在我们来设想一下，在什么阶段处理指令的逻辑会比较合适？仔细想一下，当一个节点被创建成DOM元素时，如果这个节点上有指令，那此时得处理指令逻辑，让指令生效；当一个节点被更新时，如果节点更新之前没有指令，而更新之后有了指令，或者是更新前后节点上的指令发生了变化，那此时得处理指令逻辑，让指令生效；另外，当节点被移除时，那节点上的指令自然也就没有用了，此时还得处理指令逻辑。

基于以上设想，我们得出一个结论：在虚拟 DOM 渲染更新的 create、update、destory 阶段都得处理指令逻辑，所以我们需要监听这三个钩子函数来处理指令逻辑。事实上，Vue 也是这么做的：

```js
export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    updateDirectives(vnode, emptyNode)
  }
}
```

## 原理分析

我们知道如果一个 DOM 节点上绑定了指令，那么在这个 DOM 节点所对应虚拟 DOM 节点进行渲染更新的时候，不但会处理节点渲染更新的逻辑，还会处理节点上指令的相关逻辑。具体处理指令逻辑的时机是在虚拟 DOM 渲染更新的 create、update、destory 阶段。Vue 对于自定义指令定义对象提供了几个钩子函数，这几个钩子函数分别对应着指令的几种状态，我们可以根据实际的需求将指令逻辑写在合适的指令状态钩子函数中，比如，我们想让指令所绑定的元素一插入到 DOM 中就执行指令逻辑，那我们就应该把指令逻辑写在指令的 inserted 钩子函数中。在 updateDirectives 函数中就是对比新旧两份 VNode 上的指令列表，通过对比的异同点从而执行指令不同的钩子函数，让指令生效。最后，一句话概括就是：所谓让指令生效，其实就是在合适的时机执行定义指令时所设置的钩子函数。

### 指令钩子函数

Vue对于自定义指令定义对象提供了几个钩子函数，这几个钩子函数分别对应着指令的几种状态，一个指令从第一次被绑定到元素上到最终与被绑定的元素解绑，它会经过以下几种状态：

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。
- componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
- unbind：只调用一次，指令与元素解绑时调用。
  
有了每个状态的钩子函数，这样我们就可以让指令在不同状态下做不同的事情。

### 指令何时生效

虚拟 DOM 渲染更新的时候会触发 `create、update、destory` 这三个钩子函数，从而就会执行 `updateDirectives` 函数来处理指令的相关逻辑，执行指令函数，让指令生效。

```js
function updateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode)
  }
}

function _update (oldVnode, vnode) {
  const isCreate = oldVnode === emptyNode
  const isDestroy = vnode === emptyNode
  const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context)
  const newDirs = normalizeDirectives(vnode.data.directives, vnode.context)

  const dirsWithInsert = []
  const dirsWithPostpatch = []

  let key, oldDir, dir
  for (key in newDirs) {
    oldDir = oldDirs[key]
    dir = newDirs[key]
    if (!oldDir) {
      // new directive, bind
      callHook(dir, 'bind', vnode, oldVnode)
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value
      dir.oldArg = oldDir.arg
      callHook(dir, 'update', vnode, oldVnode)
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir)
      }
    }
  }

  if (dirsWithInsert.length) {
    const callInsert = () => {
      for (let i = 0; i < dirsWithInsert.length; i++) {
        callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode)
      }
    }
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert)
    } else {
      callInsert()
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', () => {
      for (let i = 0; i < dirsWithPostpatch.length; i++) {
        callHook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode)
      }
    })
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy)
      }
    }
  }
}
```

- isCreate: 判断当前节点 vnode 对应的旧节点 oldVnode 是不是一个空节点，如果是的话，表明当前节点是一个新创建的节点。
- isDestroy: 判断当前节点 vnode 是不是一个空节点，如果是的话，表明当前节点对应的旧节点将要被销毁。
- oldDirs: 旧的指令集合，即 oldVnode 中保存的指令。
- newDirs: 新的指令集合，即 vnode 中保存的指令。
- dirsWithInsert: 保存需要触发 inserted 指令钩子函数的指令列表。
- dirsWithPostpatch: 保存需要触发 componentUpdated 指令钩子函数的指令列表。

另外，你可能还看到了在定义新旧指令集合的变量中调用了 normalizeDirectives 函数，其实该函数是用来模板中使用到的指令从存放指令的地方取出来，并将其格式进行统一化。

## 应用场景

使用自定义指令可以满足我们日常一些场景，这里给出几个自定义指令的案例：

### 表单防止重复提交

表单防止重复提交这种情况设置一个`v-throttle`自定义指令来实现

举个例子：

```js
// 1.设置v-throttle自定义指令
Vue.directive('throttle', {
  bind: (el, binding) => {
    let throttleTime = binding.value; // 节流时间
    if (!throttleTime) { // 用户若不设置节流时间，则默认2s
      throttleTime = 2000;
    }
    let cbFun;
    el.addEventListener('click', event => {
      if (!cbFun) { // 第一次执行
        cbFun = setTimeout(() => {
          cbFun = null;
        }, throttleTime);
      } else {
        event && event.stopImmediatePropagation();
      }
    }, true);
  },
});
// 2.为button标签设置v-throttle自定义指令
<button @click="sayHello" v-throttle>提交</button>
```

### 图片懒加载

设置一个`v-lazy`自定义指令完成图片懒加载

```js
const LazyLoad = {
    // install方法
    install(Vue,options){
       // 代替图片的loading图
        let defaultSrc = options.default;
        Vue.directive('lazy',{
            bind(el,binding){
                LazyLoad.init(el,binding.value,defaultSrc);
            },
            inserted(el){
                // 兼容处理
                if('IntersectionObserver' in window){
                    LazyLoad.observe(el);
                }else{
                    LazyLoad.listenerScroll(el);
                }
                
            },
        })
    },
    // 初始化
    init(el,val,def){
        // data-src 储存真实src
        el.setAttribute('data-src',val);
        // 设置src为loading图
        el.setAttribute('src',def);
    },
    // 利用IntersectionObserver监听el
    observe(el){
        let io = new IntersectionObserver(entries => {
            let realSrc = el.dataset.src;
            if(entries[0].isIntersecting){
                if(realSrc){
                    el.src = realSrc;
                    el.removeAttribute('data-src');
                }
            }
        });
        io.observe(el);
    },
    // 监听scroll事件
    listenerScroll(el){
        let handler = LazyLoad.throttle(LazyLoad.load,300);
        LazyLoad.load(el);
        window.addEventListener('scroll',() => {
            handler(el);
        });
    },
    // 加载真实图片
    load(el){
        let windowHeight = document.documentElement.clientHeight
        let elTop = el.getBoundingClientRect().top;
        let elBtm = el.getBoundingClientRect().bottom;
        let realSrc = el.dataset.src;
        if(elTop - windowHeight<0&&elBtm > 0){
            if(realSrc){
                el.src = realSrc;
                el.removeAttribute('data-src');
            }
        }
    },
    // 节流
    throttle(fn,delay){
        let timer; 
        let prevTime;
        return function(...args){
            let currTime = Date.now();
            let context = this;
            if(!prevTime) prevTime = currTime;
            clearTimeout(timer);
            
            if(currTime - prevTime > delay){
                prevTime = currTime;
                fn.apply(context,args);
                clearTimeout(timer);
                return;
            }

            timer = setTimeout(function(){
                prevTime = Date.now();
                timer = null;
                fn.apply(context,args);
            },delay);
        }
    }

}
export default LazyLoad;
```

### 一键 Copy 功能

```js
import { Message } from 'ant-design-vue';

const vCopy = { //
  /*
    bind 钩子函数，第一次绑定时调用，可以在这里做初始化设置
    el: 作用的 dom 对象
    value: 传给指令的值，也就是我们要 copy 的值
  */
  bind(el, { value }) {
    el.$value = value; // 用一个全局属性来存传进来的值，因为这个值在别的钩子函数里还会用到
    el.handler = () => {
      if (!el.$value) {
      // 值为空的时候，给出提示，我这里的提示是用的 ant-design-vue 的提示，你们随意
        Message.warning('无复制内容');
        return;
      }
      // 动态创建 textarea 标签
      const textarea = document.createElement('textarea');
      // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
      textarea.readOnly = 'readonly';
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      // 将要 copy 的值赋给 textarea 标签的 value 属性
      textarea.value = el.$value;
      // 将 textarea 插入到 body 中
      document.body.appendChild(textarea);
      // 选中值并复制
      textarea.select();
      // textarea.setSelectionRange(0, textarea.value.length);
      const result = document.execCommand('Copy');
      if (result) {
        Message.success('复制成功');
      }
      document.body.removeChild(textarea);
    };
    // 绑定点击事件，就是所谓的一键 copy 啦
    el.addEventListener('click', el.handler);
  },
  // 当传进来的值更新的时候触发
  componentUpdated(el, { value }) {
    el.$value = value;
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener('click', el.handler);
  },
};

export default vCopy;
```

关于自定义指令还有很多应用场景，如：拖拽指令、页面水印、权限校验等等应用场景

## 问题

### Q1. v-if 与 v-show 区别？

- 控制手段不同：`v-show` 隐藏则是为该元素添加 `css--display:none`，dom 元素依旧还在。`v-if` 显示隐藏是将 dom 元素整个添加或删除
- 编译过程不同：`v-if` 切换有一个局部编译/卸载的过程，切换过程中合适地销毁和重建内部的事件监听和子组件；`v-show` 只是简单的基于 css 切换
- 编译条件不同：`v-if` 是真正的条件渲染，它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。只有渲染条件为假时，并不做操作，直到为真才渲染

v-show 替代 v-if 渲染控制，虽然从表现上看，v-show 和 v-if 类似，都是控制组件的显隐，但内部实现差距还是很大的。

v-if 是真正的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建；也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。

使用 v-if 条件渲染时当满足条件后会触发对应的组件更新，对于 v-if 渲染的节点，由于新旧节点 vnode 不一致，在核心 diff 算法比对过程中，会移除旧的 vnode 节点，创建新的 vnode 节点，那么就会创建新组件，又会经历组件自身初始化、渲染 vnode、patch 等过程。

对于 v-show 渲染的节点，由于新旧 vnode 一致，它们只需要一直 patchVnode 即可。在 patchVnode 过程中，内部会对执行 v-show 指令对应的钩子函数 update，然后它会根据 v-show 指令绑定的值来设置它作用的 DOM 元素的 style.display 的值控制显隐。

因此相比于 v-if 不断删除和创建函数新的 DOM，v-show 仅仅是在更新现有 DOM 的显隐值，所以 v-show 的开销要比 v-if 小的多。所以，v-if 适用于在运行时很少改变条件，不需要频繁切换条件的场景；v-show 则适用于需要非常频繁切换条件的场景。

- 如果需要非常频繁地切换，则使用 v-show 较好

- 如果在运行时条件很少改变，则使用 v-if 较好

::: tip 注意
v-show 相比于 v-if 的性能优势是在组件的更新阶段，如果仅仅是在初始化阶段，v-if 性能还要高于 v-show，原因是在于它仅仅会渲染一个分支，而 v-show 把两个分支都渲染了，通过 style.display 来控制对应 DOM 的显隐。在使用 v-show 的时候，所有分支内部的组件都会渲染，对应的生命周期钩子函数都会执行，而使用 v-if 的时候，没有命中的分支内部的组件是不会渲染的，对应的生命周期钩子函数都不会执行。
:::

### Q2. v-for 和 v-if 的使用原则？

`v-if`与`v-for`都是`vue`模板系统中的指令。在`vue`模板编译的时候，会将指令系统转化成可执行的`render`函数。

`v-for`优先级是比`v-if`高。Vue3 中相反。

- 永远不要把 `v-if` 和 `v-for` 同时用在同一个元素上，带来性能方面的浪费（每次渲染都会先循环再进行条件判断）
- 要避免出现这种情况，则在外层嵌套`template`（页面渲染不生成`dom`节点），在这一层先进行 `v-if` 判断，然后在内部进行 `v-for` 循环。即先判断，再循环。
- 如果条件出现在循环内部，即，循环过程中需要条件判断，可通过计算属性 `computed` 提前过滤掉那些不需要显示的项。

PS：Vue3 中当 `v-if` 与 `v-for` 一起使用时，`v-if` 具有比 `v-for` 更高的优先级。

[v-for 与 v-memo](https://cn.vuejs.org/api/built-in-directives.html#v-memo)

### Q3. v-model 的原理

我们在 vue 项目中主要使用 v-model 指令在表单 input、textarea、select 等元素上创建双向数据绑定，我们知道 v-model 本质上不过是语法糖，v-model 在内部为不同的输入元素使用不同的属性并抛出不同的事件：

- text 和 textarea 元素使用 value 属性和 input 事件；
- checkbox 和 radio 使用 checked 属性和 change 事件；
- select 字段将 value 作为 prop 并将 change 作为事件。

以 input  表单元素为例：

```html
<input v-model='something'>
    
相当于

<input v-bind:value="something" v-on:input="something = $event.target.value">
```

### Q4. Vue 权限管理如何做？

前端权限归根结底是请求的发起权，请求的发起可能有下面两种形式触发

- 页面加载触发
- 页面上的按钮点击触发

总的来说，所有的请求发起都触发自前端路由或视图

所以我们可以从这两方面入手，对触发权限的源头进行控制，最终要实现的目标是：

- 路由方面，用户登录后只能看到自己有权访问的导航菜单，也只能访问自己有权访问的路由地址，否则将跳转 `4xx` 提示页
- 视图方面，用户只能看到自己有权浏览的内容和有权操作的控件
- 最后再加上请求控制作为最后一道防线，路由可能配置失误，按钮可能忘了加权限，这种时候请求控制可以用来兜底，越权请求将在前端被拦截

前端权限控制可以分为四个方面：

- 接口权限
- 按钮权限
- 菜单权限
- 路由权限

#### 接口权限控制

接口权限目前一般采用`jwt`的形式来验证，没有通过的话一般返回`401`，跳转到登录页面重新进行登录。登录完拿到`token`，将`token`存起来，通过`axios`请求拦截器进行拦截，每次请求的时候头部携带`token`

#### 路由权限控制

- 方式1：前端维护路由、菜单及其角色权限配置，路由与菜单耦合，前端全量挂载路由。初始化即挂载全部路由，并且在路由上标记相应的权限信息，每次路由跳转前做校验。这种方式存在以下四种缺点：
  - 加载所有的路由，如果路由很多，而用户并不是所有的路由都有权限访问，对性能会有影响。
  - 全局路由守卫里，每次路由跳转都要做权限判断。
  - 菜单信息写死在前端，要改个显示文字或权限信息，需要重新编译
  - 菜单跟路由耦合在一起，定义路由的时候还有添加菜单显示标题，图标之类的信息，而且路由不一定作为菜单显示，还要多加字段进行标识
- 方式2：前端维护路由、菜单及其角色权限配置，路由与菜单耦合，前端根据路由权限表动态添加路由。初始化的时候先挂载不需要权限控制的路由，比如登录页，404等错误页。登录后，获取用户的权限信息，然后筛选有权限访问的路由，在全局路由守卫里进行调用`addRoutes`添加路由。按需挂载，需要知道用户的路由权限，也就是在用户登录进来的时候就要知道当前用户拥有哪些路由权限。这种方式也存在了以下的缺点：
  - 全局路由守卫里，每次路由跳转都要做判断
  - 菜单信息写死在前端，要改个显示文字或权限信息，需要重新编译
  - 菜单跟路由耦合在一起，定义路由的时候还有添加菜单显示标题，图标之类的信息，而且路由不一定作为菜单显示，还要多加字段进行标识

#### 菜单权限控制

菜单权限可以理解成将页面与理由进行解耦

- 方案1：菜单与路由分离，前端定义菜单与路由的对应关系，菜单由后端返回，动态挂载路由。 这种方式的缺点：
  - 菜单需要与路由做一一对应，前端添加了新功能，需要通过菜单管理功能添加新的菜单，如果菜单配置的不对会导致应用不能正常使用
  - 全局路由守卫里，每次路由跳转都要做判断
- 方案2：前端统一定义路由组件，菜单和路由都由后端返回，替换 component 为真实组件，动态挂载路由。这种方法也会存在缺点：
  - 全局路由守卫里，每次路由跳转都要做判断
  - 前后端的配合要求更高

#### 按钮权限控制

方案1：`v-if` 判断。每个页面页面都要获取用户权限`role`和路由表里的`meta.btnPermissions`，然后再做判断。

方案2：定义指令进行按钮权限的判断

```js
import Vue from 'vue'
/**权限指令**/
const has = Vue.directive('has', {
    bind: function (el, binding, vnode) {
        // 获取页面按钮权限
        let btnPermissionsArr = [];
        if(binding.value){
            // 如果指令传值，获取指令参数，根据指令参数和当前登录人按钮权限做比较。
            btnPermissionsArr = Array.of(binding.value);
        }else{
            // 否则获取路由中的参数，根据路由的btnPermissionsArr和当前登录人按钮权限做比较。
            btnPermissionsArr = vnode.context.$route.meta.btnPermissions;
        }
        if (!Vue.prototype.$_has(btnPermissionsArr)) {
            el.parentNode.removeChild(el);
        }
    }
});
// 权限检查方法
Vue.prototype.$_has = function (value) {
    let isExist = false;
    // 获取用户按钮权限
    let btnPermissionsStr = sessionStorage.getItem("btnPermissions");
    if (btnPermissionsStr == undefined || btnPermissionsStr == null) {
        return false;
    }
    if (value.indexOf(btnPermissionsStr) > -1) {
        isExist = true;
    }
    return isExist;
};
export {has}
```
