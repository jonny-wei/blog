# 插件机制

Vue 是一个渐进式 JavaScript 框架，它本身的核心是解决视图渲染的问题，其它的能力就通过插件的方式来解决。

上文也说过，vue-router以插件机制和Vue.js的核心深度集成，那么先了解vue插件是有必要的。

Vue有个全局性的API，就是`Vue.use(plugin)` 这个方法。我们看一下官方文档的解释：

```text
Vue.use( plugin )
 
参数：
 {Object | Function} plugin
 
用法：
 安装 Vue.js 插件。如果插件是一个对象，必须提供 install 方法。如果插件是一个函数，
 它会被作为 install 方法。install 方法调用时，会将 Vue 作为参数传入。
 当 install 方法被同一个插件多次调用，插件将只会被安装一次。
```


## 插件和组件的关系

插件就是按照一定的封装方式，暴露接口。让我们利用这些接口更快捷的实现功能。

插件可以封装组件，组件可以暴露数据给插件。你可能会遇到这样的场景：在页面中使用组件，每次需要通过components注册组件，那些使用率低的组件可以用这种方式，
但当我们用到像Loading、Notice，Alert等使用率较高的组件时，就可以将其开发成一个插件，在全局频繁使用。

## 插件分类

插件通常用来为 Vue 添加全局功能。插件的功能范围没有严格的限制，官方提供了5个方面

- 添加全局`方法`或者`属性`
- 添加全局资源：`指令/过滤器/过渡`等
- 通过`全局混入`来添加一些组件选项（vue-router就是这种）
- 添加 Vue `实例方法`，通过把它们添加到 `Vue.prototype` 上实现(this.$echart)
- 一个库，提供自己的 API，同时提供上面提到的`一个或多个功能`。如 vue-router

## 使用插件

通过全局方法` Vue.use(MyPlugin, { someOption: true }) `使用插件。它需要在你调用 new Vue() 启动应用之前完成。

Vue.use 会自动阻止多次注册相同插件，届时即使多次调用也只会注册一次该插件。

```javascript
// 调用 `MyPlugin.install(Vue)`
Vue.use(MyPlugin)

new Vue({
  // ...组件选项
})
```

Vue.js 官方提供的一些插件 (例如 vue-router) 在检测到 Vue 是可访问的全局变量时会自动调用 Vue.use()。

## 开发插件

Vue.js 的插件应该**暴露一个 install 方法**。这个方法的第一个参数是` Vue 构造器`，第二个参数是一个可选的`选项对象`：

```javascript
MyPlugin.install = function (Vue, options) {
  // 1. 添加全局方法或属性(方面1)
  // 当该插件注册后只要存在Vue实例的地方,
  // 你都可以获取到Vue.$myName的值或使用myGlobalMethod()方法，
  // 因为其直接绑定在了Vue实例上。
  Vue.$myName = 'Jonny Wei';
  Vue.myGlobalMethod = function () {
    // 逻辑...
  }

  // 2.添加全局资源：`指令/过滤器/过渡`等(方面2)
  // 下面代码我们通过Vue.directive()添加了一个全局指令v-focus，
  // 其主要包含了5种方法，其中inserted代表当绑定元素插入到 DOM 中执行，
  // 而el.focus()代表聚焦绑定的元素，
  // 这样如果我们在一个input输入框上绑定该指令就会自动进行focus聚焦。
   Vue.directive('focus', {
              bind: function() {},
              // 当绑定元素插入到 DOM 中。
              inserted: function(el, binding, vnode, oldVnode) {
                  // 聚焦元素
                  el.focus();
              },
              update: function() {},
              componentUpdated: function() {},
              unbind: function() {}
          });

  // 3. 通过`全局混入`来添加一些组件选项(方面3)
  // 全局注册一个混入，其会影响注册之后创建的每个 Vue 实例，
  // 下面代码注册后会在每个组件实例中添加myFunction方法，
  // 在单文件组件中可以直接通过this.myFunction()调用。
  // 当然如果实例中存在同名方法，则mixin方法中创建的会被覆盖，
  // 同时mixin对象中的钩子将在组件自身钩子之前调用。
  Vue.mixin({
    methods:{
      myFunction: function (){
          // 逻辑...
      }  
    },
    created: function () {
      // 逻辑...
    },
    ...
  })

  // 4. 添加 Vue 实例方法，通过把它们添加到 Vue.prototype 上实现(方面4)
  // 添加实例方法是最常用的一种方法，
  // 其直接绑定在vue的原型链上，
  // 我们可以回想一下 JS 里的类的概念。实例方法可以在组件内部，
  // 通过this.$myMethod来调用。
  Vue.prototype.$myMethod = function (methodOptions) {
    // 逻辑...
  }
  
  // 5.  一个库，提供自己的 API，同时提供上面提到的一个或多个功能。
     // 就是上面的多种组合
}
```
此外，上文说了插件和组件的关系，插件也可以封装成组件，供全局使用

如果我们要在组件的基础上编写插件，我们可以使用Vue.extend(component)来进行，可以见下方loading插件实例。

```vue
<!-- loading.vue组件 -->
<template>
    <div class="loading-box" v-show="show">
        <div class="loading-mask"></div>
        <div class="loading-content">
            <div class="animate">
            </div>
            <div class="text">{{text}}</div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        show: Boolean,
        text: {
          type: String,
          default: '正在加载中...'
        },
    }
}
</script>
```
没有封装插件之前，我们只能通过import引入,并在components对象中注册才能在页面中使用。

将其封装成一个插件：

```javascript
// loading.js
import LoadingComponent from '../components/loading.vue'

let $vm

export default {
    install(Vue, options) {
        if (!$vm) {
            const LoadingPlugin = Vue.extend(LoadingComponent);

            $vm = new LoadingPlugin({
                el: document.createElement('div')
            });

            document.body.appendChild($vm.$el);
        }

        $vm.show = false;

        let loading = {
            show(text) {
                $vm.show = true;
                $vm.text = text;
            },
            hide() {
                $vm.show = false;
            }
        };

        if (!Vue.$loading) {
            Vue.$loading = loading;
        }

        // Vue.prototype.$loading = Vue.$loading;
        Vue.mixin({
            created() {
                this.$loading = Vue.$loading;
            }
        })
    }
}
```
上面我们新建一个 loading.js 文件，`引入我们的 loading.vue 组件`，然后通过 Vue.extend() 方法`创建了一个构造器 LoadingPlugin` ，
其次我们再通过 new LoadingPlugin() `创建了 $vm 实例`，并`挂载`到一个 div 元素上。最后我们需要通过 document.body.appendChild($vm.$el) 将其`插入到DOM节点`中。

当我们创建了 $vm 实例后，我们可以访问该实例的属性和方法，比如通过 $vm.show 就可以改变 loading 组件的 show 值来控制其显示隐藏。

最终我们通过 Vue.mixin 或者 Vue.prototype.$loading 来全局添加了 $loading 事件，其又包含了 show 和 hide 两个方法。
我们可以直接在页面中使用 this.$loading.show() 来显示加载，使用 this.$loading.hide() 来关闭加载。

## 发布插件

开发的插件也可以发布到 npm 上供大家使用或在其他项目中直接安装插件使用。

#### 发布准备

注册 npm 账号

#### 发布命令

拥有账号后，你需要在控制台输入 npm login 命令来登录你的账号，并且输入邮箱地址。然后打开你的插件目录，允许 npm publish 发布。

> npm login  
cd 目录    
npm publish

#### 发布后的目录结构

```text
├── lib // 插件源码
│   ├── components // 组件目录
│   │   └── loading.vue // 组件
│   └── index.js  // 插件入口文件
├── index.js // 入口文件
└── package.json  // 包管理文件
```

::: warning 承上启下
以上，是vue插件的应用基础，包括插件的使用、开发和发布。

下文，从vue源码层面的解析vue插件机制。
:::

## 插件机制源码解析

Vue.use(MyPlugin, { someOption: true }); 这个方法是所有插件入侵 vue 的起点。
Vue 提供了 Vue.use 的全局 API 来注册插件，所以我们先来分析一下它的实现原理：

```javascript
/* vue/src/core/global-api/use.js */
/* 初始化use */
import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    /* 维护了一个 _installedPlugins 数组，它存储所有注册过的 plugin */  
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters 获取插件的配置参数
    const args = toArray(arguments, 1)
    args.unshift(this)
    /**
    * 判断 plugin 有没有定义 install 方法，如果有的话则调用该方法，
    * 并且该方法执行的第一个参数是 Vue 
    */
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)  // install执行插件安装 调用的是插件的install方法
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args) // 插件本身就是一个函数。则直接调用该函数
    }
    installedPlugins.push(plugin) // 最后把 plugin 存储到 installedPlugins 中
    return this
  }
}
```
可以看到 Vue 提供的插件注册机制很简单，每个插件都需要实现一个静态的 install 方法，当我们执行 Vue.use 注册插件的时候，
就会执行这个 install 方法，并且在这个 install 方法的第一个参数我们可以拿到 Vue 对象，
这样的好处就是作为插件的编写方不需要再额外去 import Vue 了。

插件入侵的起点是调用插件自身的 install 函数，那么不同的插件入侵的机制有些时候不一样，不一样就体现在上文说到过的**插件的开发**中的 install 方法。

当全局使用插件中的(指令/过滤器/方法等) api 时，vue 会把这些 api 放在相应的属性数组里。形如：

```javascript
Vue.options = {
    components: {},
    directives: {},
    filters: {},
    _base: Vue
}
```
options 挂在 vue 实例上，vue 初始化时会调用 init 方法时，会执行：

```javascript
 vm.$options = mergeOptions(
     resolveConstructorOptions(vm.constructor),//策略合并核心函数(重点)。
     options || {},
     vm
  );
```
vue 在创建实例时，会把 vue.options 中的属性提取出来，并和传入的 `options 做合并`(使用合并策略)。
vue 的每个配置项都有自己的合并策略。mergeOptions 会根据合并的类目去`选择对应的合并规则`。这里的 component.directive.filter 根据合并规则。
Vue 对象上的全局的这些属性会被放在实例的 `__proto__` 上。

如果是全局的指令过滤器时，vue 统一把它`放在根构造方法`上。根实例初始化时，通过合并策略合并到 $options 中。
而子组件稍微绕了一下，但最终也是放在 $options 的原型上。这样只要是全局的组件/指令/过滤器，每个子组件都可以继承使用，达到了插件的效果。

::: warning 承上启下
以上，从vue源码层面认识了插件的机制，这将是下文讲解的基础。

下文，将解析vue-router插件的实现。
:::

## vue-router 插件实现

首先进入入口文件index.js，下面代码是提炼的骨架：
```javascript
/* src/index.js */

import { install } from './install'
/* more */

export default class VueRouter {/*...*/}

VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}
```

可以看到，入口文件中定义了 VueRouter 类，也实现了 install 的静态方法：VueRouter.install = install，而 install 定义在 src/install.js 中。

::: tip 好习惯
好的阅读代码的方式是先看整个代码结构和提炼骨架
:::

那么，vue-router 的插件实现就在 install.js 文件中，下面具体看看：

首先提炼出代码骨架：

```javascript
import View from './components/view'
import Link from './components/link'

export function install (Vue) {
    
  // 封装了一个全局混入
  Vue.mixin({
    beforeCreate () {/*...*/},
    destroyed () {/*...*/}
  })
  
  // 定义了两个挂载在原型上的变量
  Object.defineProperty(Vue.prototype, '$router', {/*...*/})
  Object.defineProperty(Vue.prototype, '$route', {/*...*/})
  
  // 注册了两个组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
}
```
你会发现，这就是摘要中提到的。vue-router 一句话总结：**封装了一个`全局混入`，定义了两个挂载在`原型`上的`变量`，注册了两个`组件`。**

下面具体解析：

```javascript
import View from './components/view'
import Link from './components/link'

export let _Vue

/* 暴露install方法 安装路由*/
export function install (Vue) {
  /**
  * (路由安装）判断是否已安装过
  * 当install.installed为true并且存在Vue实例_Vue 代表已安装 直接return 否则继续执行下面的代码
  */
  if (install.installed && _Vue === Vue) return
  install.installed = true

 /* 保存Vue实例 */
  _Vue = Vue

 /* 判断变量是否已定义 */
  const isDef = v => v !== undefined

  /* 注册router实例 */
  /* 当组件被初始化后进入 beforeCreate 钩子时，才会有组件实例，这时候才会执行 registerInstance */
  const registerInstance = (vm, callVal) => {
    /**
    * i为 router-view 组件占位符 vnode
    * 这里会执行 registerRouteInstance，将当前组件实例赋值给匹配到的路由记录
    *（用于beforeRouteEnter的回调获取vm实例）
    */
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  /* 定义一个全局混入，混入Vue实例 */
  Vue.mixin({
    /**
    * 在beforeCreate钩子中初始化当前路由的信息 
    *  vue-router流程: 
    *    触发路由跳转 => 执行beforeCreate钩子的init => transitionTo =>  
    *    执行准备离开相关的路由钩子(后置守卫) =>
    *    接受异步组件并解析 => 执行准备进入的路由的钩子(前置守卫) => 
    *    更新视图（触发完组件的所有生命周期）=> 触发beforeRouterEnter的回调
    */
    beforeCreate () {
      /* Vue.options中是否存在根实例router 存在router时进行路由初始化操作 
       否则则直接从父组件_routerRoot中获取 */
      if (isDef(this.$options.router)) {
        /* 将根实例赋值给_routerRoot 保存根实例vm */
        this._routerRoot = this
        /* 给根实例添加_router属性等于router对象 保存router */
        this._router = this.$options.router
        /* VueRouter对象的init方法 执行init方法初始化路由 参数：根实例 */
        this._router.init(this)
        /**
        * Vue内部方法defineProperty响应式
        * 组件实例的$route属性(根实例的_router属性)定义为响应式，每次路由确认导航时会触发setter，
        * 将根实例重新渲染，每次路由切换都会执行回调修改_router(src/index.js:124)
        */
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        /**
        * 非根组件则直接从父组件_routerRoot中获取
        * (因为是树形结构所以所有的组件的_routerRoot都等于根实例)
        */
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      /* 通过registerRouteInstance方法注册router实例 */
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
  
  /**
  * 定义$router指向根实例的router对象
  * 在Vue的prototype上面绑定$router，这样可以在任意Vue对象中使用this.$router访问，
  * 同时经过Object.defineProperty，访问this.$router即访问this._routerRoot._router
  */
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  /**
  * 定义$router指向当前的路由
  * 指向根实例的 _route 属性，当 router-view 被生成时，会触发 $route 的 getter 函数
  * 同时会给 _route 收集到当前的渲染 watcher，访问this.$route即访问this._routerRoot._route
  */
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  /* 注册touter-view以及router-link组件 */
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

 /* 该对象保存了两个option合并的规则 */
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```
::: tip 提示
这里通过 Object.defineProperty 定义 get 来实现 ， 而不使用 Vue.prototype.$router = this._routerRoot._router。 是为了让其只读，不可修改
注册全局组件
:::

## 注解

当执行 Vue.use(VueRouter) 的时候，实际上是在执行 install 函数，为了确保 install 逻辑只执行一次，用了 installed 做已安装的标志位。
另外用一个全局的 _Vue 来接收参数 Vue，因为作为 Vue 的插件对 Vue 对象是有依赖的，但又不能去单独去 import Vue，
因为那样会增加包体积，所以就通过这种方式拿到 Vue 对象。

利用 Vue.mixin 去把 beforeCreate 和 destroyed 钩子函数注入到每一个组件中。
```javascript
export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```
把要混入的对象通过` mergeOptions `合并到 Vue 的 options 中，由于每个组件的构造函数都会在 extend `构造阶段合并 Vue.options 到自身的 options 中`，
所以也就相当于每个组件都定义了 mixin 定义的选项。

回到 install 方法，先看混入的 `beforeCreate `钩子函数，对于 Vue 根实例而言，执行该钩子函数时定义了` this._routerRoot` 表示它自身；
`this._router` 表示 VueRouter 的实例 router，它是在 new Vue 的时候传入的。

另外执行了 `this._router.init() `方法初始化 router，这个逻辑之后介绍，
然后用 `defineReactive` 方法把 this._route 变成`响应式对象`，这个作用我们之后会介绍。

而对于子组件而言，由于组件是树状结构，在遍历组件树的过程中，它们在执行该钩子函数的时候 this._routerRoot 
始终指向的离它最近的传入了 router 对象作为配置而实例化的父实例。

对于 beforeCreate 和 destroyed 钩子函数，它们都会执行 registerInstance 方法，这个方法的作用我们也是之后会介绍。

接着给 Vue 原型上定义了 $router 和 $route 两个属性的 get 方法，这就是为什么我们可以在组件实例上可以访问 this.$router 以及 this.$route，它们的作用之后介绍。

接着又通过 Vue.component 方法定义了全局的 `<router-link>` 和 `<router-view>` 两个个组件，这也是为什么我们在写模板的时候可以使用这两个标签，它们的作用也是之后介绍。

最后定义了路由中的钩子函数的合并策略，和普通的钩子函数一样。

## 总结

那么到此为止，我们分析了 Vue-Router 的安装过程，Vue 编写插件的时候通常要提供静态的 install 方法，
我们通过 Vue.use(VueRouter) 时候，就是在执行 install 方法。
VueRouter 的 install 方法会给每一个组件注入 beforeCreate 和 destoryed 钩子函数，
在 beforeCreate 做一些私有属性定义和路由初始化工作。

下一节我们就来分析一下 VueRouter 对象的实现和它的初始化工作。