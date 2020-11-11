# 路由过渡与视图渲染

路由过渡是 vue-router 的重要的核心逻辑之一。

从之前的章节中我们就可以感知 `history.transitionTo` 方法是 vue-router 中非常重要的方法，
当路由过渡的时候，就会执行到该方法，接下来我们来完整分析一下 transitionTo 的实现。

## transitionTo 的实现
```javascript
  /* src/history/base.js  */
  
  /**
  * vue-router路由跳转的核心逻辑
  *   执行所有的路由钩子
  *   解析异步路由组件
  * location: 跳转的路由信息
  * onComplete: 成功回调
  */
  transitionTo (location: RawLocation,onComplete?: Function, onAbort?: Function) {
      /**
      * this是history路由实例（HashHistory | HTML5History）
      * this.router是vueRouter实例
      * match方法会根据当前的location 和 之前生成的路由映射表（nameMap,pathMap），
      * 生成$route对象（src/create-matcher.js:31）
      * current是切换前的$route对象
      * (有关路由匹配将在下一章节详解)
      */
      const route = this.router.match(location, this.current)
      /*  触发路由钩子 执行一系列路由钩子 和 解析异步路由组件 */
      this.confirmTransition(route, () => {
        /* 更新视图以及执行afterEach钩子 */
        this.updateRoute(route)
        /* 执行transitionTo成功的回调(src/index.js:116) */
        onComplete && onComplete(route)
        
        this.ensureURL()
 
        // fire ready cbs once
        if (!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => { cb(route) })
        }
      }, err => {
        if (onAbort) {
          onAbort(err) // 失败回调
        }
        if (err && !this.ready) {
          this.ready = true
          this.readyErrorCbs.forEach(cb => { cb(err) })
        }
      })
    }
```
`transitionTo` 首先根据要**跳转的路由信息** `location` 和**当前路径** `this.current` 执行 `this.router.match` 方法去**匹配要跳转目标的路径**。
这里 `this.current` 是 history 维护的**当前路径**，它的初始值是在 History 基类的构造函数中初始化的：
```javascript {7}
/* src/history/base.js */

 constructor (router: Router, base: ?string) {
    this.router = router
    this.base = normalizeBase(base)
    // start with a route object that stands for "nowhere"
    this.current = START
    this.pending = null
    this.ready = false
    this.readyCbs = []
    this.readyErrorCbs = []
    this.errorCbs = []
  }
```
START：
```javascript
/* src/util/route.js */

export const START = createRoute(null, {
  path: '/'
})
```
这样就创建了一个**初始的 Route**，而 **transitionTo 实际上就是在切换 this.current**，稍后我们会看到。

拿到新的路径后，那么接下来就会执行 `confirmTransition` 方法去做**真正的过渡**，由于这个过程可能有一些**异步的操作**（如异步组件），
所以整个 confirmTransition API 设计成带有`成功回调`函数和`失败回调`函数，先来看一下它的定义：

## confirmTransition 的实现
```javascript
  /* src/history/base.js */
  /**
  * transitionTo的核心，执行一系列路由钩子
  * 传入route对象，成功回调，失败回调
  */
  confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    /* 切换前的route对象 */
    const current = this.current
    /* 定义失败的回调 */
    const abort = err => {
      if (isError(err)) {
        if (this.errorCbs.length) {
          this.errorCbs.forEach(cb => { cb(err) })
        } else {
          warn(false, 'uncaught error during route navigation:')
          console.error(err)
        }
      }
      onAbort && onAbort(err)
    }
    /* 判断 当前路由 和要 跳转路由 是否是相同路径 */
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      route.matched.length === current.matched.length
    ) {
      this.ensureURL()
      /* 相同路径则取消路由跳转 */
      return abort()
    }

   /* 计算出 当前路由 和 跳转路由 在路径上的 相同点 不同点（路由记录），来执行不同的导航守卫 */
   /* this.current指的是当前路由，route是跳转路由 */
    const {
      updated,
      deactivated,
      activated
    } = resolveQueue(this.current.matched, route.matched)
    /**
    * queue是 NavigationGuard (导航守卫)concat组成的数组
    * NavigationGuard 是路由守卫的函数，
    * 传入to,from,next 3个参数
    * 参考官方文档 导航守卫
    */
    const queue: Array<?NavigationGuard> = [].concat(
      // in-component leave guards 离开导航的组件内路由守卫
      /* 返回离开组件的 beforeRouteLeave 钩子函数（数组，子 => 父） */
      extractLeaveGuards(deactivated),
      // global before hooks 全局路由前置守卫
      /* 返回路由实例（全局）的 beforeEach 钩子函数（数组） */
      this.router.beforeHooks, 
      // in-component update hooks 当前路由改变，但是该组件被复用时调用 的组件内路由守卫
      /* 返回当前组件的 beforeRouteUpdate 钩子函数（数组，父 => 子）*/
      extractUpdateHooks(updated), 
      // in-config enter guards
      /* 返回当前组件的 beforeEnter 钩子函数（数组） */
      activated.map(m => m.beforeEnter),
      // async components
      /* 解析异步组件(同样会返回一个导航守卫函数的签名，但是用不到 to,from 这 2 个参数) */
      resolveAsyncComponents(activated) 
    )

    this.pending = route

     /**
     * runQueue每次遍历都会执行 iterator 函数并且传入 当前的路由守卫函数 进行解析
     * 解析后会执行next回调（即step+1）
     */
    const iterator = (hook: NavigationGuard, next) => {
      if (this.pending !== route) {
        return abort()
      }
      try {
        /* 执行某个生命周期中的导航守卫 */
        hook(route, current, /*iterator next*/(to: any) => {
          if (to === false || isError(to)) {
            // next(false) -> abort navigation, ensure current URL
            /* 如果传入的是next(false)会中断导航，并且会重置到form的路由 */
            this.ensureURL(true)
            abort(to)
          } else if ( //跳转到指定路由
            typeof to === 'string' ||
            (typeof to === 'object' && (
              typeof to.path === 'string' ||
              typeof to.name === 'string'
            ))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort() //取消导航并且执行push/replace跳转到指定路由
            if (typeof to === 'object' && to.replace) {
              this.replace(to)
            } else {
              this.push(to)
            }
          } else {
            /**
            * confirm transition and pass on the value
            * 如果next没有参数则直接执行runQueue next
            * 即解析queue的下个元素
            */
            next(to)
          }
        })
      } catch (e) {
        abort(e)
      }
    }
    /**
    * 等到队列中所有的组件（懒加载的组件）都解析完毕后，就会执行第三个参数回调
    * 即为什么 beforeRouteEnter钩子需要在 next回调中 执行的原因
    * 队列遍历结束后，执行异步组件的回调（此时懒加载组件已经被解析完毕）
    * queue：前面定义的路由钩子队列
    * iterator：前面定义的遍历器
    */
    runQueue(queue, iterator, /* 异步组件的回调 */() => {
      const postEnterCbs = [] // 保存beforeRouterEnter的next回调
      const isValid = () => this.current === route
      // wait until async components are resolved before
      // extracting in-component enter guards
      /**
      * 等到异步组件被解析完后再提取组件内的进入守卫
      * 返回当前组件的 beforeRouteEnter 钩子函数（数组）
  `   */
      const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
      // 将 beforeResolve 钩子放到 beforeRouteEnter 钩子数组的后面依次执行
      const queue = enterGuards.concat(this.router.resolveHooks)
      // 递归 遍历队列执行 beforeRouteEnter 和 beforeResolve 钩子
      runQueue(queue, iterator, () => {
        if (this.pending !== route) {
          return abort()
        }
        this.pending = null
        /**
        * 确认导航，执行onComplete成功回调，包含：$nextTick 后更新视图  执行afterEach钩子
        */
        onComplete(route)
        if (this.router.app) {
          /*
          * 在nextTick后执行 postEnterCbs 数组即 beforeRouteEnter 的next方法的参数（函数）
          * 因为此时 nextTick 队列中存在一个 render watcher 所以先执行 render watcher 更新视图
          * 最终 再执行 beforeRouteEnter 的回调
          * 因此 beforeRouteEnter 需要通过回调传入this 的值
          */
          this.router.app.$nextTick(() => {
            postEnterCbs.forEach(cb => { cb() })
          })
        }
      })
    })
  }
```
`confirmTransition `首先暂存了当前路由，定义了 abort 回调，然后判断 **当前路由 current** 和要 **跳转路由 route** 是否是相同路径，
如果路径相同则调用 `this.ensureUrl` 和` abort` 取消路由跳转（ensureUrl 函数之后介绍）。

接着又根据 `current.matched `和 `route.matched `执行了` resolveQueue` 方法解析出 3 个队列：` updated`,`deactivated`,` activated`。
之后定义了一个` Queue `导航守卫**钩子队列** 和一个**遍历器** `iterator` 传入当前的路由守卫函数进行解析，解析后会**执行next回调**。

最后 `runQueue(Queue,iterator，callback)` 解析所有懒加载的组件(异步组件)后，执行回调函数中的钩子函数并更新视图。

```javascript
/* src/history/base.js */

 // 确认导航成功，执行afterEach钩子
  updateRoute (route: Route) {
    const prev = this.current
    this.current = route
    /** 执行回调给route赋值，随即触发视图更新（src/index.js:125）*/
    this.cb && this.cb(route)
    this.router.afterHooks.forEach(hook => {
      hook && hook(route, prev)
    })
  }
```

下面是根据 `current.matched`和 `route.matched` 计算出 当前路由 和 跳转路由 在路径上的 `相同点` `不同点`，来执行不同的导航守卫
执行 `resolveQueue `方法解析出 3 个队列 代码如下：

## resolveQueue 的实现
```javascript
/* src/history/base.js   resolveQueue 方法解析出 3 个队列 */
/* 计算出 当前路由 和 跳转路由 在路径上的 相同点 不同点，来执行不同的导航守卫 */
function resolveQueue (
  current: Array<RouteRecord>,
  next: Array<RouteRecord>
): {
  updated: Array<RouteRecord>,
  activated: Array<RouteRecord>,
  deactivated: Array<RouteRecord>
} {
  let i
  const max = Math.max(current.length, next.length)
  /* 
  * i 为 current,next 中的分叉点
  * i 前的两个数组的对应的路由记录是相同的 i 后的不同
  * 之所以能够使用这种算法来区分相同/不同的路由记录
  *  是因为路由记录是由 routerConfig 转换过来的，而 routerConfig 是一棵树形结构
  * */
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i), // 相同的match数组
    activated: next.slice(i),  // 新增match数组 
    deactivated: current.slice(i)  // 删除match数组
  }
}
```
因为 `route.matched` 是一个 `RouteRecord` 路由记录数组，由于**路径是由 current 变向 route**，那么就**遍历**对比**两边的 RouteRecord**，
找到一个不一样的位置(**分叉点**)` i`，那么得到以下结论：

- `updated` 的部分：next 中从 0 到 i 的 RouteRecord 两边都一样
- `activated` 的部分：从 i 到最后的 RouteRecord 是 next 独有的
- `deactivated` 的部分：current 中从 i 到最后的 RouteRecord 则没有了

拿到 updated、activated、deactivated 这三个 ReouteRecord 数组后，接下来就是路径变换后的一个重要部分，**执行一系列的钩子函数**。

## 导航守卫钩子

导航守卫实质就是在路由过渡时执行的一系列钩子函数。我们先从整体上看一下这些钩子函数执行的逻辑，
首先构造一个`队列 queue`，它实际上是一个数组；然后再定义一个`遍历器函数 iterator`；
最后再执行 `runQueue` 方法来执行这个队列。我们先来看一下 runQueue 的实现：

### runQueue 的实现

```javascript
 /* src/util/async.js */
 
 /**
 * 因为路由之间的切换可能是异步的（可能会写setTimeout(next,2000)）
 * 所以设计了一个队列，当前面一个元素被解析后调用next方法才继续解析下个元素
 *  queue 是导航守卫钩子队列
 *  fn 是iterator
 *  cb 是回调
 */
 export function runQueue (queue: Array<?NavigationGuard>,fn: Function, cb: Function) {
   const step = index => {
     if (index >= queue.length) {
       cb() //遍历结束后执行回调
     } else {
       if (queue[index]) {
         /**
         * queue[index] 即 hook 函数
         * 第二个参数即 next 方法，解析队列中下个元素
         * 执行 iterator 函数，传入 NavigationGuard（函数）组成的数组的每个元素，
         * 执行完后执行回调（index+1）
         */
         fn(queue[index], /*runQueue next*/() => {
           step(index + 1)
         })
       } else {
         step(index + 1)
       }
     }
   }
   step(0)
 }
```
这是一个非常经典的**异步函数队列化**执行的`模式`， queue 是一个 NavigationGuard 类型的数组，我们定义了` step 函数`，
每次根据 index 从 queue 中**取一个 guard 守卫**，然后**执行 fn 函数**，并且把 **guard 作为参数传入**，第二个参数是一个函数，
当这个函数执行的时候再**递归执行 step 函数**，前进到下一个，注意这里的 fn 就是我们刚才的 iterator 函数，
那么我们再回到 iterator 函数的定义：

```javascript
/* src/history/base.js */
    /**
    * runQueue每次遍历都会执行 iterator 函数并且传入 当前的路由守卫函数 进行解析
    * 解析后会执行next回调（即step+1）
    */
    const iterator = (hook: NavigationGuard, next) => {
      if (this.pending !== route) {
        return abort()
      }
      try {
        /* 执行某个生命周期中的导航守卫 */
        hook(route, current, /*iterator next*/(to: any) => {
          if (to === false || isError(to)) {
            // next(false) -> abort navigation, ensure current URL
            /* 如果传入的是next(false)会中断导航，并且会重置到form的路由 */
            this.ensureURL(true)
            abort(to)
          } else if ( //跳转到指定路由
            typeof to === 'string' ||
            (typeof to === 'object' && (
              typeof to.path === 'string' ||
              typeof to.name === 'string'
            ))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort() //取消导航并且执行push/replace跳转到指定路由
            if (typeof to === 'object' && to.replace) {
              this.replace(to)
            } else {
              this.push(to)
            }
          } else {
            /**
            * confirm transition and pass on the value
            * 如果next没有参数则直接执行runQueue next
            * 即解析queue的下个元素
            */
            next(to)
          }
        })
      } catch (e) {
        abort(e)
      }
    }
```
iterator 函数逻辑很简单，它就是去**执行每一个 导航守卫 hook**，并**传入 route、current 和匿名函数**，
这些参数对应官方文档中的 **`to`、`from`、`next`**，当执行了匿名函数，会根据一些条件执行` abort` 或 `next`，
只有执行 next 的时候，才会前进到下一个导航守卫钩子函数中，这也就是**为什么官方文档会说只有执行 next 方法来 resolve 这个钩子函数**。

那么我们再回头看 queue 是怎么构造的：

```javascript
/* src/history/base.js */
    /**
    * queue是 NavigationGuard 组成的数组， NavigationGuard 是路由守卫的函数，
    * 传入to,from,next 3个参数
    * 参考官方文档 导航守卫
    */
    const queue: Array<?NavigationGuard> = [].concat(
      // in-component leave guards 离开导航的组件内路由守卫
      /* 返回离开组件的 beforeRouteLeave 钩子函数（数组，子 => 父） */
      extractLeaveGuards(deactivated),
      // global before hooks 全局路由前置守卫
      /* 返回路由实例（全局）的 beforeEach 钩子函数（数组） */
      this.router.beforeHooks, 
      // in-component update hooks 当前路由改变，但是该组件被复用时调用 的组件内路由守卫
      /* 返回当前组件的 beforeRouteUpdate 钩子函数（数组，父 => 子）*/
      extractUpdateHooks(updated), 
      // in-config enter guards
      /* 返回当前组件的 beforeEnter 钩子函数（数组） */
      activated.map(m => m.beforeEnter),
      // async components
      /* 解析异步组件(同样会返回一个导航守卫函数的签名，但是用不到 to,from 这 2 个参数) */
      resolveAsyncComponents(activated) 
    )
```
执行顺序如下：

- 在失活的组件里调用**离开守卫 beforeRouteLeave** (组件内守卫) 可以访问组件实例 `this`。
- 调用全局的 **beforeEach 前置守卫**。
- 在复用的组件里调用 **beforeRouteUpdate 守卫** (在当前路由改变，但是该**组件被复用时调用**) 。比如：
带有动态参数的路径 `/foo/:id`，在 `/foo/1` 和 `/foo/2 `之间跳转的时候，由于会渲染同样的` Foo 组件`，因此组件实例会被复用。
- 在激活的路由配置里调用 beforeEnter (路由独享的守卫)。
- 解析异步路由组件。

守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于 等待中。

接下来我们来分别介绍这 5 步的实现。

### extractLeaveGuards 的实现

**第一步** 是执行 `extractLeaveGuards(deactivated)`，在失活的组件里调用**离开守卫 beforeRouteLeave** 。
先来看一下 **extractLeaveGuards** 的定义：
```javascript
/* src/history/base.js */

function extractLeaveGuards (deactivated: Array<RouteRecord>): Array<?Function> {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}
```

内部调用了 extractGuards 的通用方法，可以从 RouteRecord 数组中提取各个阶段的守卫：

#### extractGuards 的实现

```javascript
/* src/history/base.js */

  // 根据records数组，返回当前这个组件对应的某个生命周期的路由守卫（数组）
  function extractGuards (
    records: Array<RouteRecord>,
    name: string,
    bind: Function,
    reverse?: boolean
  ): Array<?Function> {
    // 扁平化 + 数组Map
    const guards = flatMapComponents(records, (def, instance, match, key) => {
      // 通过name（路由守卫的名字），获取到当前组件对应的路由守卫函数
      const guard = extractGuard(def, name)
      if (guard) {
        return Array.isArray(guard)
            // 绑定上下文this，传入当前路由守卫函数，实例，record和视图名字
          ? guard.map(guard => bind(guard, instance, match, key))
          : bind(guard, instance, match, key)
      }
    })
      // 倒序数组，之前是父=>子，如果reverse为true则为子 => 父
      // 对于离开某个路由时，由于子路由需要先离开所以要倒序数组，让子组件先触发beforeLeave钩子
    return flatten(reverse ? guards.reverse() : guards)
  }
```
这里用到了 flatMapComponents 方法去从 records 中获取到的所有导航，下面再看看 flatMapComponents 方法的实现：

#### flatMapComponents 的实现

```javascript
/*  src/util/resolve-components.js */

// 扁平化后执行fn作为返回值
export function flatMapComponents (
  matched: Array<RouteRecord>,
  fn: Function
): Array<?Function> {
  // 数组扁平化
  return flatten(matched.map(m => {
    /*
    * 遍历components属性
    * （一般为component，vue-router会把component变成components，因为有命名视图的可能）
    * 如果是component衍变的key为default，否则为自己定义的key值
    */
    return Object.keys(m.components).map(key => fn(
        /* 组件(key一般为default)，当是路由懒加载时这个值为函数（()=> import(.....)）*/
        m.components[key],
        /* 实例(实例默认为空对象，在registerInstance时，会在router-view中创建组件实例) */
        m.instances[key],
        m, // 路由记录
        key // 视图名（一般为default）即使用默认组件
    ))
  }))
}
```
`flatMapComponents` 的作用就是**返回一个数组**，数组的元素**是从 matched 里获取到所有组件的 key**，然后返回 `fn `函数执行的结果，
`flatten` 作用是把**二维数组拍平成一维数组**。

那么对于 `extractGuards` 中 `flatMapComponents` 的调用，执行每个` fn` 的时候，通过` extractGuard(def, name) `
获取到组件中对应 name 的导航守卫：

#### extractGuard 的实现

```javascript
/* src/history/base.js */

function extractGuard (
  def: Object | Function,
  key: string // 路由钩子的name
): NavigationGuard | Array<NavigationGuard> {
  // 非懒加载
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    /* 将配置项变成组件构造器 */
    def = _Vue.extend(def)
  }
  return def.options[key] // 返回组件构造器 options 配置项中对应的路由钩子函数
}
```
获取到 `guard` 后，还会调用 `bind` 方法**把组件的实例 instance 作为函数执行的上下文绑定到 guard 上**，bind 方法的对应的是` bindGuard`：

#### bindGuard 的实现

```javascript
/* src/history/base.js */

function bindGuard (guard: NavigationGuard, instance: ?_Vue): ?NavigationGuard {
  if (instance) {
    return function boundRouteGuard () {
      return guard.apply(instance, arguments)
    }
  }
}
```
那么对于 `extractLeaveGuards(deactivated)` 而言，获取到的就是**所有失活组件中**定义的 `beforeRouteLeave 钩子函数`。

### beforeHooks 的实现

**第二步** 是 `this.router.beforeHooks`，在我们的 **VueRouter 类**中定义了 `beforeEach` 方法，在 src/index.js 中：

```javascript
/* src/index.js */

beforeEach (fn: Function): Function {
  return registerHook(this.beforeHooks, fn)
}

function registerHook (list: Array<any>, fn: Function): Function {
  list.push(fn)
  return () => {
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}
```
当用户使用 `router.beforeEach` 注册了一个**全局守卫**，就会往 `router.beforeHooks` 添加一个钩子函数，
这样` this.router.beforeHooks` 获取的**就是用户注册的全局` beforeEach` 守卫**。

### extractUpdateHooks 的实现

**第三步** 执行了 `extractUpdateHooks(updated)`，来看一下 `extractUpdateHooks` 的实现：

```javascript
/* src/history/base.js */

function extractUpdateHooks (updated: Array<RouteRecord>): Array<?Function> {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}
```
和 `extractLeaveGuards(deactivated)` 类似，`extractUpdateHooks(updated)` 获取到的就是**所有复用的组件**中定义的 **`beforeRouteUpdate` 钩子函数**。

内部调用了 extractGuards 的通用方法，可以从 RouteRecord 数组中提取各个阶段的守卫。flatMapComponents 方法去从 records 中获取到的所有导航。
`flatMapComponents` 的作用就是**返回一个数组**，数组的元素**是从 matched 里获取到所有组件的 key**，然后返回 `fn `函数执行的结果，
`flatten` 作用是把**二维数组拍平成一维数组**。

那么对于 `extractGuards` 中 `flatMapComponents` 的调用，执行每个` fn` 的时候，通过` extractGuard(def, name) `
获取到组件中对应 name 的导航守卫：

获取到 `guard` 后，还会调用 `bind` 方法**把组件的实例 instance 作为函数执行的上下文绑定到 guard 上**，bind 方法的对应的是` bindGuard`

### activated.map 的实现

**第四步** 是执行 activated.map(m => m.beforeEnter)，获取的是在**激活的路由**配置中定义的 **beforeEnter** 函数。

### resolveAsyncComponents 的实现

**第五步** 是执行 `resolveAsyncComponents(activated)` **解析异步组件**，先来看一下 `resolveAsyncComponents` 的实现：

```javascript
/* src/util/resolve-components.js */

//解析异步路由（传入当前新增的路由记录）
export function resolveAsyncComponents (matched: Array<RouteRecord>): Function {
  return (to, from, next) => {
    let hasAsync = false
    let pending = 0
    let error = null

    flatMapComponents(matched, /*解析matched中的异步组件*/(def, _, match, key) => {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.
      /**
      * 异步组件解析函数是一个函数且未附加cid
      * 没有使用Vue的默认异步解析机制，是因为因为我们要先暂停导航，直到传入的组件被解析完成
      */
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true
        pending++

        /* 以下代码会等到异步组件获取到后，在微任务队列中执行 */
        const resolve = once(resolvedDef => {
          if (isESModule(resolvedDef)) {
            resolvedDef = resolvedDef.default
          }
          // save resolved on async factory in case it's used elsewhere
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            : _Vue.extend(resolvedDef) 
          /**
          * 将解析后的组件配置项赋值给路由中components属性
          * （将组件配置项覆盖原来的()=>import(.....)）
          */
          match.components[key] = resolvedDef
          pending--
          if (pending <= 0) {
            /**
            * 当匹配到的route中的 matched属性里记录的路由组件都被解析成功后
            * 执行iterator next ，在 runQueue 中解析 queue 的下个元素
            * iterator next（src/history/base.js:154）
            */
            next()
          }
        })

        const reject = once(reason => {
          const msg = `Failed to resolve async component ${key}: ${reason}`
          process.env.NODE_ENV !== 'production' && warn(false, msg)
          if (!error) {
            error = isError(reason)
              ? reason
              : new Error(msg)
            // 发生错误时，执行iterator next，最终会中断导航
            next(error)
          }
        })

        let res
        try {
          res = def(resolve, reject)
        } catch (e) {
          reject(e)
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject)
          } else {
            // new syntax in Vue 2.3
            const comp = res.component
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject)
            }
          }
        }
      }
    })

    if (!hasAsync) next()
  }
}
```
`resolveAsyncComponents` 返回的是一个**导航守卫函数**，有标准的 **`to`、`from`、`next` 参数**。它的内部实现很简单，
利用了 `flatMapComponents` 方法从 `matched` 中获取到**每个组件的定义**，判断如果是**异步组件**，则执行异步组件加载逻辑，
这块和我们之前分析 Vue 加载异步组件很类似，加载成功后会执行` match.components[key] = resolvedDef` 
把**解析好的异步组件**放到对应的 `components` 上，并且执行 `next` 函数。

这样在 `resolveAsyncComponents(activated)` **解析完所有激活的异步组件后**，
我们就可以拿到这一次所有激活的组件。这样我们在做完这 5 步后又做了一些事情。我们在后过头来看看 `runQueue` ：

```javascript
 /**
    * 等到队列中所有的组件（懒加载的组件）都解析完毕后，就会执行第三个参数回调
    * 即为什么 beforeRouteEnter钩子需要在 next回调中 执行的原因
    * 队列遍历结束后，执行异步组件的回调（此时懒加载组件以及被解析完毕）
    * queue：前面定义的路由钩子队列
    * iterator：前面定义的遍历器
    */
    runQueue(queue, iterator, /* 异步组件的回调 */() => {
      const postEnterCbs = [] // 保存beforeRouterEnter的next回调
      const isValid = () => this.current === route
      // wait until async components are resolved before
      // extracting in-component enter guards
      /**
      * 等到异步组件被解析完后再提取组件内的进入守卫
      * 返回当前组件的 beforeRouteEnter 钩子函数（数组）
  `   */
      const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
      // 将 beforeResolve 钩子放到 beforeRouteEnter 钩子数组的后面依次执行
      const queue = enterGuards.concat(this.router.resolveHooks)
      // 递归 遍历队列执行 beforeRouteEnter 和 beforeResolve 钩子
      runQueue(queue, iterator, () => {
        if (this.pending !== route) {
          return abort()
        }
        this.pending = null
        /**
        * 确认导航，执行onComplete成功回调，包含：$nextTick 后更新视图  执行afterEach钩子
        */
        onComplete(route)
        if (this.router.app) {
          /*
          * 在nextTick后执行 postEnterCbs 数组即 beforeRouteEnter 的next方法的参数（函数）
          * 因为此时 nextTick 队列中存在一个 render watcher 所以先执行 render watcher 更新视图
          * 最终 再执行 beforeRouteEnter 的回调
          * 因此 beforeRouteEnter 需要通过回调传入this 的值
          */
          this.router.app.$nextTick(() => {
            postEnterCbs.forEach(cb => { cb() })
          })
        }
      })
    })
```
- 在被激活的组件里执行 **`extractEnterGuards`** 调用 `beforeRouteEnter`。
- 调用全局的 `beforeResolve` 守卫。
- 调用全局的 `afterEach` 钩子。

下面具体分析一下 `extractEnterGuards` 的实现

### extractEnterGuards 的实现

```javascript
/* src/history/base.js */

function extractEnterGuards (
  activated: Array<RouteRecord>,
  cbs: Array<Function>,
  isValid: () => boolean
): Array<?Function> {
  return extractGuards(activated, 'beforeRouteEnter', (guard, _, match, key) => {
    return bindEnterGuard(guard, match, key, cbs, isValid)
  })
}

function bindEnterGuard (
  guard: NavigationGuard,
  match: RouteRecord,
  key: string,
  cbs: Array<Function>,
  isValid: () => boolean
): NavigationGuard {
  return function routeEnterGuard (to, from, next) {
    /* 将用户定义在beforeRouteEnter中的next函数，作为第三个参数传入guard中 */
    /*c b是一个函数，作为回调函数的参数 */
    return guard(to, from, cb => {
      next(cb)
      /**
      * 当cb是一个函数，即next中传入了一个回调函数时，会将它放到回调数组中，在nextTick后执行它
      * 因为这个时候组件虽然被解析成功了，但是触发视图更新的逻辑还未执行（没有给route赋值）
      * 所以回调需要在nextTick后才能拿到vm实例
      */
      if (typeof cb === 'function') {
        cbs.push(() => {
          // #750
          // if a router-view is wrapped with an out-in transition,
          // the instance may not have been registered at this time.
          // we will need to poll for registration until current route
          // is no longer valid.
          // 如果存在特殊情况（transition） 会延迟到下个宏任务执行，一般不会
          poll(cb, match.instances, key, isValid)
        })
      }
    })
  }
}

function poll (
  cb: any, // somehow flow cannot infer this is a function
  instances: Object,
  key: string,
  isValid: () => boolean
) {
  if (
    instances[key] &&
    !instances[key]._isBeingDestroyed // do not reuse being destroyed instance
  ) {
    /**
    * 只有当组件被生成后，执行registerRouteInstance给matched对象赋值了当前组件的实例
    * instances[key]才会获得组件实例
    * 调用cb并且传入vm实例，所以在next的参数cb中中可以拿到参数vm
    */
    cb(instances[key])
  } else if (isValid()) {
    setTimeout(() => {
      poll(cb, instances, key, isValid)
    }, 16)
  }
}
```
`extractEnterGuards` 函数的实现也是利用了 `extractGuards` 方法**提取组件中的 `beforeRouteEnter` 导航钩子函数**，
和之前不同的是 `bind` 方法的**不同**。文档中特意强调了 **`beforeRouteEnter` 钩子函数中是拿不到组件实例的**，
因为**当守卫执行前，组件实例还没被创建**，但是我们**可以通过传一个回调给 next 来访问组件实例**。
在导航**被确认的时候**执行回调，并且把**组件实例作为回调方法的参数**：

```javascript
beforeRouteEnter (to, from, next) {
  next(vm => {
    // 通过 `vm` 访问组件实例
  })
}
```

在 `bindEnterGuard` 函数中，返回的是 `routeEnterGuard` 函数，所以在执行 `iterator` 中的 `hook` 函数的时候，
就相当于执行 `routeEnterGuard` 函数，那么就会执行我们定义的**导航守卫 guard 函数**，并且当这个回调函数执行的时候，
首先执行 `next` 函数 `rersolve` 当前导航钩子，然后把回调函数的参数，它也是一个回调函数用 **cbs 收集起来**，
其实就是**收集到外面定义的 postEnterCbs 中**，然后在最后会执行：

```javascript
if (this.router.app) {
  this.router.app.$nextTick(() => {
    postEnterCbs.forEach(cb => { cb() })
  })
}
```
在根路由组件重新渲染后，遍历 postEnterCbs 执行回调，每一个回调执行的时候，
其实是执行 poll(cb, match.instances, key, isValid) 方法，因为考虑到一些了路由组件被套 transition 
組件在一些缓动模式下不一定能拿到实例，所以用一个轮询方法不断去判断，直到能获取到组件实例，
再去调用 cb，并把组件实例作为参数传入，这就是我们在回调函数中能拿到组件实例的原因。

### beforeResolve 的实现

获取 `this.router.resolveHooks`，这个和 `this.router.beforeHooks `的获取类似，
在我们的 `VueRouter` 类中定义了 `beforeResolve` 方法：

```javascript
beforeResolve (fn: Function): Function {
  return registerHook(this.resolveHooks, fn)
}
```
当用户使用 `router.beforeResolve` **注册了一个全局守卫**，就会往 `router.resolveHooks` 添加一个钩子函数，
这样 `this.router.resolveHooks` 获取的就是**用户注册的**全局 `beforeResolve` 守卫。

### updateRoute 的实现

在最后执行了 `onComplete(route)` 后，会执行 `this.updateRoute(route)` 方法：
```javascript
updateRoute (route: Route) {
  const prev = this.current
  this.current = route
  this.cb && this.cb(route)
  this.router.afterHooks.forEach(hook => {
    hook && hook(route, prev)
  })
}
```
同样在我们的 `VueRouter` 类中定义了 `afterEach` 方法：
```javascript
afterEach (fn: Function): Function {
  return registerHook(this.afterHooks, fn)
}
```
当用户使用 `router.afterEach` 注册了一个全局守卫，就会往 `router.afterHooks` 添加一个钩子函数，
这样 `this.router.afterHooks `获取的就是**用户注册的**全局 `afterHooks` 守卫。


那么至此我们把所有`导航守卫`的执行分析完毕了，我们知道路由过渡**除了执行这些钩子函数**，
从表象上有两个地方会发生变化，一个是 **url 发生变化**，一个是**组件发生变化**。
接下来我们分别分析这两块的实现原理。

## URL 的变化

当路由过渡时，其实最后都执行了 `router.push` ,下面时 `router.push` 的定义：

```javascript
/* src/index.js */

push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.push(location, onComplete, onAbort)
  }
```
里边执行了 `this.history.push` 函数，这个函数是**子类实现**的，不同模式下该函数的实现略有不同，
我们来看一下平时使用比较多的 hash 模式该函数的实现：

### hash 模式

```javascript
/* src/history/hash.js */

push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      pushHash(route.fullPath)
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    }, onAbort)
  }
```
`push` 函数会先执行 `this.transitionTo` 做路由过渡，在过渡完成后的回调函数中，执行 `pushHash` 函数：

```javascript
/* src/history/hash.js */

function pushHash (path) {
  //不支持 pushState 方法会使用location.hash方式修改hash
  if (supportsPushState) {
    pushState(getUrl(path))
  } else {
    window.location.hash = path
  }
}
// getUrl 方法
//将当前地址的#后面的值替换为path
function getUrl (path) {
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  return `${base}#${path}`
}
```
执行 `pushState` 前需要先根据 `supportsPushState` 判断是否支持 `pushState` ，支持则使用 `pushState`，否则切换 `hash`。`supportsPushState` 的实现：
```javascript
/* src/util/push-state.js */

export const supportsPushState = inBrowser && (function () {
  const ua = window.navigator.userAgent

  if (
    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
    ua.indexOf('Mobile Safari') !== -1 &&
    ua.indexOf('Chrome') === -1 &&
    ua.indexOf('Windows Phone') === -1
  ) {
    return false
  }

  return window.history && 'pushState' in window.history
})()
```
如果支持的话，则执行 `getUrl` 获取当前完整的 `url`，再执行 `pushState` 方法：

```javascript
/* src/util/push-state.js */

export function pushState (url?: string, replace?: boolean) {
  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
    // 即使使用hash路由，如果支持 pushState 最终也会使用 pushState 修改路由
    if (replace) {
      history.replaceState({ key: _key }, '', url)
    } else {
      _key = genKey()
      history.pushState({ key: _key }, '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url)
  }
}
```
`pushState` 会调用浏览器**原生**的 `history` 的 `pushState` 接口**或者** `replaceState` 接口，
**更新**浏览器的 `url` 地址，并把当前 `url` **压入历史栈**中。然后在 **history 的初始化**中，会设置一个**监听器**，监听历史栈的变化：

```javascript
/* src/history/hash.js */

// this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
  setupListeners () {
    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
      setupScroll()
    }

    /* 哈希路由在初始化的时候，执行完transitionTo，会给浏览器监听前进和后退的事件 */
    window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', () => {
      const current = this.current
      if (!ensureSlash()) {
        return
      }
      //当点击浏览器前进/后退后，会重新执行 transitionTo 方法
      this.transitionTo(getHash(), route => {
        if (supportsScroll) {
          handleScroll(this.router, route, current, true)
        }
        if (!supportsPushState) {
          replaceHash(route.fullPath)
        }
      })
    })
  }
```
当点击浏览器返回按钮的时候，如果已经有 `url` 被压入历史栈，则会触发 `popstate` 事件，
然后拿到当前要跳转的 `hash`，执行 `transtionTo` 方法做一次路径转换。

我们在使用 `vue-router` 的时候，打开调试页面 `http://localhost:8080` 后会自动把 url 修改为` http://localhost:8080/#/`，
这是怎么做到呢？原来在实例化 `HashHistory` 的时候，构造函数会执行 `ensureSlash()` 方法：

```javascript
/* src/history/hash.js */

function ensureSlash (): boolean {
  const path = getHash()
  if (path.charAt(0) === '/') {
    return true
  }
  //通过replace 替换，防止多余的 history 栈
  replaceHash('/' + path)
  return false
}

//获取#后的值作为hash
export function getHash (): string {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  const href = window.location.href
  const index = href.indexOf('#')
  return index === -1 ? '' : decodeURI(href.slice(index + 1))
}

//将当前地址的#后面的值替换为path
function getUrl (path) {
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  return `${base}#${path}`
}

function pushHash (path) {
  //不支持 pushState 方法会使用location.hash方式修改hash
  if (supportsPushState) {
    pushState(getUrl(path))
  } else {
    window.location.hash = path
  }
}

function replaceHash (path) {
  if (supportsPushState) {
    replaceState(getUrl(path))
  } else {
    window.location.replace(getUrl(path))
  }
}
```
这个时候 `path` 为**空**，所以执行 **`replaceHash('/' + path)`**，然后内部会执行一次 `getUrl`，
计算出来的`新的 url `为 `http://localhost:8080/#/`，最终会执行` pushState(url, true)`，这就是 url 会改变的原因。

上面说了 `hash` 模式时  `this.history.push` 所发生的一些逻辑，下面说说另一个常用的 `history` 模式时该函数的实现

### history 模式

```javascript
/* src/history/html5.js */

push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      /* hash ： pushHash(route.fullPath) */
      pushState(cleanPath(this.base + route.fullPath))
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    }, onAbort)
  }
```
两种模式的 `push` 实现区别并不大，都是调用了 `transitionTo` , 区别在于： 一个调用 `pushHash` ， 一个调用 `pushState`。
history 模式在调用 pushState时，首先调用了 cleanPath ：
```javascript
export function cleanPath (path: string): string {
  return path.replace(/\/\//g, '/')
}
```
接着调用了 pushState 和 hash 一样：
```javascript
/* src/util/push-state.js */

export function pushState (url?: string, replace?: boolean) {
  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
    //即使使用hash路由，如果支持 pushState 最终也会使用 pushState 修改路由
    if (replace) {
      history.replaceState({ key: _key }, '', url)
    } else {
      _key = genKey()
      history.pushState({ key: _key }, '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url)
  }
}
```
两种模式中其他的 go 、 replace 、getCurrentLocation 都是类似的实现方式，就不再赘述了。


## 组件的变化(视图渲染)

### `<router-view>` 组件

路由最终的渲染离不开组件，之前也说过 `vue-router` 定义了两个组件，`<router-view>` 和 `<router-link>`，我们先来看看
`<router-view>` 组件的实现，这里用到了 **函数式组件** 的思想，有关 **函数式组件** 的知识在我的其他专栏中：
```javascript
/* src/components/view.js*/

export default {
  name: 'RouterView', // 组件名称
  functional: true, //函数式组件，它的render函数支持第二个参数
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render (_, { props, children, parent, data }) {
    // used by devtools to display a router-view badge 路由器视图标志
    data.routerView = true

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    /**
    * 直接使用父上下文的 createElement（）函数
    * 以便router-view呈现的组件可以解析 具名插槽
    * 关注官方API文档 v-slot API (3.1.0 新增)
    */
    const h = parent.$createElement
    /* name为命名视图的 name 默认为 default */
    const name = props.name
    /**
    * 由于 _route 在 vue-router 初始化时变成了一个响应式对象
    * 所以会触发 _route 的 getter，收集当前的渲染 watcher（src/install.js:40）
    * 当 /src/index.js:126 路由跳转后，会触发其 setter，重新运行 render 函数更新视图
    * 因为此时是 parent 组件，所以 Dep.target 为 parent 组件的渲染 watcher
    */
    const route = parent.$route
    const cache = parent._routerViewCache || (parent._routerViewCache = {})

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    /**
    * 确定当前视图的深度，还要检查树是否已切换为非活动状态，而不是保持活动的状态。
    */
    let depth = 0
    let inactive = false
    while (parent && parent._routerRoot !== parent) {
      /**
      * depth 表示router-view的深度，当当前router-view的parent又是一个router-view时，
      * 当前的router-view深度就会+1
      * 默认是0，当发生了router-view的嵌套关系时，里层的router-view的depth为1
      * 根据 routes 配置项中的嵌套关系，来渲染对应的视图
      */
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++
      }
      if (parent._inactive) {
        inactive = true
      }
      parent = parent.$parent
    }
    data.routerViewDepth = depth

    // render previous view if the tree is inactive and kept-alive
    /* 如果树处于非活动状态且保持活动状态，则呈现上一个视图 */
    if (inactive) {
      return h(cache[name], data, children)
    }

    // matched来自当前route的matched属性
    // matched是一个数组，顺序由父 => 子（src/util/route.js:32），根据深度来返回对应的路由记录
    const matched = route.matched[depth]
    // render empty node if no matched route
    if (!matched) {
      cache[name] = null
      return h()
    }

    const component = cache[name] = matched.components[name]
    
    /**
    * attach instance registration hook 添加实例注册钩子
    * this will be called in the instance's injected lifecycle hooks
    * 这将在实例的注入生命周期挂钩中调用
    * 将组件的instances属性等于 val 参数(src/install.js:37)
    * 在执行 registerRouteInstance 时，已经可以获取到 vm 实例
    *（因为是在组件的 beforeCreate 中被执行的，而此时已经生成了 vm 实例）
    */
    data.registerRouteInstance = (vm, val) => {
      // val could be undefined for unregistration
      const current = matched.instances[name]
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val
      }
    }

    // also register instance in prepatch hook
    /* 在prepatch钩子中注册实例 */
    // in case the same component instance is reused across different routes
    /* 如果同一组件实例可在不同路径之间重用 */
    ;(data.hook || (data.hook = {})).prepatch = (_, vnode) => {
      matched.instances[name] = vnode.componentInstance
    }

    // resolve props
    // 解析路由的参数并给组件通过 props 传参（在路由记录中会存在 props 属性）
    let propsToPass = data.props = resolveProps(route, matched.props && matched.props[name])
    if (propsToPass) {
      // clone to prevent mutation 克隆以防止突变
      propsToPass = data.props = extend({}, propsToPass)
      // pass non-declared props as attrs
      const attrs = data.attrs = data.attrs || {}
      for (const key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key]
          delete propsToPass[key]
        }
      }
    }

    return h(component, data, children)
  }
}
```
#### 渲染什么组件

`<router-view>` 是一个 **函数式组件**，它的渲染也是依赖 `render` 函数，那么` <router-view>` 具体应该渲染什么组件呢，首先获取当前的路径：
`const route = parent.$route ` ：
```javascript
  /* src/components/view.js*/
  
  const route = parent.$route
  
  /* src/install.js*/

  /**
  * 定义$router指向当前的路由
  * 指向根实例的 _route 属性，当 router-view 被生成时，会触发 $route 的 getter 函数
  * 同时会给 _route 收集到当前的渲染 watcher，访问this.$route即访问this._routerRoot._route
  */
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
```
然后在 `VueRouter` 的实例执行 `router.init` 方法的时候，会执行如下逻辑：

```javascript
/* src/index.js */
    /**
    * 注册回调，当history发生改变后会执行回调（src/history/base.js:221）
    * 即修改_route属性，因为_route属性是一个视图依赖的响应式变量，
    * 所以会触发视图的重新渲染至于触发 _route 的 setter 为什么会更新视图，
    * 请参考 router-view 组件 
    */
    history.listen(route => {
      this.apps.forEach((app) => {
        app._route = route
      })
    })
```
而 `history.listen` 方法定义在 src/history/base.js 中：

```javascript
/* src/history/base.js */

listen (cb: Function) {
  this.cb = cb
}
```
然后在 `updateRoute` 的时候执行 `this.cb`：

```javascript
/* src/history/base.js */
  // 确认导航成功，执行afterEach钩子
  updateRoute (route: Route) {
    const prev = this.current
    this.current = route
    /** 执行回调给route赋值，随即触发视图更新（src/index.js:125）*/
    this.cb && this.cb(route)
    this.router.afterHooks.forEach(hook => {
      hook && hook(route, prev)
    })
  }
```
也就是我们执行 `transitionTo` 方法最后执行 `updateRoute` 的时候会**执行回调**，
然后会**更新** `this.apps` 保存的**组件实例**的 `_route` 值，`this.apps`数组保存的实例的特**点都是在初始化的时候传入了 router 配置项**，
一般的场景数组**只会保存根 Vue 实例**，因为我们是在 `new Vue() `传入了 `router` 实例。
`$route` 是定义在 `Vue.prototype` 上。每个组件实例访问 `$route` 属性，就是访问**根实例的** `_route`，也就是**当前的路由线路**。

`<router-view>` 是**支持嵌套**的，回到 `render` 函数，其中定义了 **`depth` 的概念**，
它表示 `<router-view>` 嵌套的深度。每个` <router-view> `在渲染的时候，执行如下逻辑：

```javascript
/* src/components/view.js*/

data.routerView = true
// ...
while (parent && parent._routerRoot !== parent) {
  if (parent.$vnode && parent.$vnode.data.routerView) {
    depth++
  }
  if (parent._inactive) {
    inactive = true
  }
  parent = parent.$parent
}

const matched = route.matched[depth]
// ...
const component = cache[name] = matched.components[name]
```

`parent._routerRoot` 表示的是**根 Vue 实例**，那么这个循环就是从当前的 `<router-view>` 的父节点向上找，一直找到根 Vue 实例，
在这个过程，如果碰到了父节点也是 `<router-view>` 的时候，说明 `<router-view>` 有嵌套的情况，`depth++`。
遍历完成后，根据**当前线路匹配的路径**和 **depth** 找到对应的 `RouteRecord`，进而找到该渲染的组件。

除了找到了应该渲染的组件，还定义了一个注册路由实例的方法：

```javascript
/* src/components/view.js*/

/**
    * attach instance registration hook 添加实例注册钩子
    * this will be called in the instance's injected lifecycle hooks
    * 这将在实例的注入生命周期挂钩中调用
    * 将组件的instances属性等于 val 参数(src/install.js:37)
    * 在执行 registerRouteInstance 时，已经可以获取到 vm 实例
    *（因为是在组件的 beforeCreate 中被执行的，而此时已经生成了 vm 实例）
    */
    data.registerRouteInstance = (vm, val) => {
      // val could be undefined for unregistration
      const current = matched.instances[name]
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val
      }
    }
```
给 `vnode` 的 `data` 定义了 `registerRouteInstance` 方法，在 src/install.js 中，我们会调用该方法**去注册路由的实例**：
```javascript
/* src/install.js  */

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
  
  
  Vue.mixin({
    beforeCreate () {
      // ...
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
```
在混入的 `beforeCreate` 钩子函数中，会执行 `registerInstance` 方法，进而执行 `render` 函数中定义的 `registerRouteInstance` 方法，
从而给 `matched.instances[name]` 赋值**当前组件的 vm 实例**。

`render` 函数的最后根据 `component` 渲染出对应的组件 `vonde`：

```javascript
return h(component, data, children)
```
#### 重新渲染组件

当我们执行 `transitionTo` 来**更改路由线路**后，组件是如何**重新渲染**的呢？在我们混入的 `beforeCreate` 钩子函数中有这么一段逻辑：

```javascript {18}
/* src/install.js  */

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
```

由于我们把根 Vue 实例的 `_route` 属性定义成**响应式**的，我们在每个 `<router-view>` 执行 `render` 函数的时候，
都会访问 `parent.$route`，我们之前分析访问 `this._routerRoot._route`，触发了它的 `getter`，相当于 `<router-view>` 对它有依赖，
然后再执行完 `transitionTo` 后，修改 `app._route` 的时候，`又触发了setter`，因此会通知 `<router-view>` 的渲染 `watcher` 更新，重新渲染组件。

### `<router-link>` 组件

`<router-link>` 它支持用户在具有路由功能的应用中（点击）导航。 通过 `to` 属性**指定目标地址**，
默认渲染成带有正确链接的 `<a>` 标签，可以通过配置` tag` 属性生成别的标签。另外，当目标路由成功激活时，链接元素自动设置一个表示激活的 CSS 类名。

::: tip 比一比
`<router-link>`比`<a>`的好处:
- 无论是 HTML5 history 模式还是 hash 模式，它的表现行为一致，所以，当你要切换路由模式，或者在 IE9 降级使用 hash 模式，无须作任何变动。
- 在 HTML5 history 模式下，router-link 会守卫点击事件，让浏览器不再重新加载页面。
- 当你在 HTML5 history 模式下使用 base 选项之后，所有的 to 属性都不需要写 (基路径) 了。
:::

那么接下来我们就来分析`<router-link>` 组件的实现：

```javascript
/* src/components/link.js */

export default {
  name: 'RouterLink', // 组件名
  props: { // 组件属性
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render (h: Function) {
    const router = this.$router
    const current = this.$route
    /**
    * 调用router.resolve解析出一个对象，描述了路由的一些信息
    * 包含了location(类似原生location对象),route(路由对象),href(路径)
    */
    const { location, route, href } = router.resolve(this.to, current, this.append)

    /* 给data属性的动态生成的class */
    const classes = {}
    const globalActiveClass = router.options.linkActiveClass
    const globalExactActiveClass = router.options.linkExactActiveClass
    // Support global empty active class
    const activeClassFallback = globalActiveClass == null
      ? 'router-link-active'
      : globalActiveClass
    const exactActiveClassFallback = globalExactActiveClass == null
      ? 'router-link-exact-active'
      : globalExactActiveClass
    const activeClass = this.activeClass == null
      ? activeClassFallback
      : this.activeClass
    const exactActiveClass = this.exactActiveClass == null
      ? exactActiveClassFallback
      : this.exactActiveClass
    // 生成跳转后路由的route对象
    const compareTarget = location.path
      ? createRoute(null, location, null, router)
      : route

    /* 当current(当前)的route对象和to解析后转换成的route对象是相同的，说明是完全匹配 */
    classes[exactActiveClass] = isSameRoute(current, compareTarget)
    classes[activeClass] = this.exact
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget)

    //最终跳转的函数
    const handler = e => {
      if (guardEvent(e)) {
        if (this.replace) {
          router.replace(location)
        } else {
          router.push(location)
        }
      }
    }

    const on = { click: guardEvent }
    /* 将event的值等于跳转的函数，最终挂载到vnode的data中作为监听的事件 */
    if (Array.isArray(this.event)) {
      this.event.forEach(e => { on[e] = handler })
    } else {
      on[this.event] = handler
    }

    //添加router-link的class
    const data: any = {
      class: classes
    }

    if (this.tag === 'a') {
      data.on = on
      data.attrs = { href }
    } else {
      /**
      * find the first <a> child and apply listener and href
      * 从插槽中找到第一个a标签，防止在router-link的插槽中包含一个跳转到其他路由的a标签
      */
      const a = findAnchor(this.$slots.default)
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false
        const aData = a.data = extend({}, a.data)
        aData.on = on
        const aAttrs = a.data.attrs = extend({}, a.data.attrs)
        aAttrs.href = href
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on
      }
    }

    //通过tag标签名，渲染出不同的标签
    return h(this.tag, data, this.$slots.default)
  }
}
```
`<router-link>` 组件的渲染也是基于 `render` 函数，它首先做了路由解析：
```javascript
  const router = this.$router
  const current = this.$route
 /**
  * 调用router.resolve解析出一个对象，描述了路由的一些信息
  * 包含了location(类似原生location对象),route(路由对象),href(路径)
  */
  const { location, route, href } = router.resolve(this.to, current, this.append)
```
`router.resolve `是 `VueRouter` 的实例方法，它的定义在 src/index.js 中：
```javascript
/* src/index.js */

 //手动解析生成一个路由的对象
  resolve (
    to: RawLocation,
    current?: Route,
    append?: boolean
  ): {
    location: Location,
    route: Route,
    href: string,
    // for backwards compat
    // 向后兼容
    normalizedTo: Location,
    resolved: Route
  } {
    const location = normalizeLocation(
      to,
      current || this.history.current,
      append,
      this
    )
    const route = this.match(location, current)
    const fullPath = route.redirectedFrom || route.fullPath
    const base = this.history.base
    const href = createHref(base, fullPath, this.mode)
    return {
      location,
      route,
      href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  }

```
它先规范生成目标 `location`，再根据 `location` 和 `match` 通过` this.match` 方法**计算生成目标路径** `route`，
然后再根据 `base`、`fullPath` 和 `this.mode` 通过 `createHref` 方法**计算出最终跳转的 href**。

解析完 `router` 获得目标 `location`、`route`、`href` 后，接下来对 `exactActiveClass` 和 `activeClass` 做处理，
当配置 `exact` 为 `true` 的时候，只有当**目标路径**和**当前路径**完全匹配的时候，会添加 `exactActiveClass`；
而当**目标路径包含当前路径**的时候，会添加 `activeClass`。
```javascript
/* 当current(当前)的route对象和to解析后转换成的route对象是相同的，说明是完全匹配 */
    classes[exactActiveClass] = isSameRoute(current, compareTarget)
    classes[activeClass] = this.exact
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget)
```

接着创建了一个**守卫函数** ：
```javascript
 //最终跳转的函数
    const handler = e => {
      if (guardEvent(e)) {
        if (this.replace) {
          router.replace(location)
        } else {
          router.push(location)
        }
      }
    }

    const on = { click: guardEvent }
    /* 将event的值等于跳转的函数，最终挂载到vnode的data中作为监听的事件 */
    if (Array.isArray(this.event)) {
      this.event.forEach(e => { on[e] = handler })
    } else {
      on[this.event] = handler
    }
```
调用了 `guardEvent` ：

```javascript
function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute('target')
    if (/\b_blank\b/i.test(target)) return
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault()
  }
  return true
}
```
最终会**监听点击事件**或者其它可以**通过 prop 传入的事件类型**，执行 `hanlder` 函数，最终执行 `router.push` 或者 r`outer.replace` 函数，
它们的定义在 src/index.js 中：

```javascript
/* src/index.js */

 push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.push(location, onComplete, onAbort)
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.replace(location, onComplete, onAbort)
  }
```
实质调用了不同路由模式下 `this.history.push` 和 `this.history.replace` ，它们的具体实现逻辑前面已经做了分析。

最后判断当前 `tag` 是否是 `<a>` 标签，`<router-link>` 默认会渲染成 `<a>` 标签，当然我们也**可以修改** `tag` 的 `prop` 渲染成其他节点，
这种情况下会尝试找它子元素的 `<a>` 标签，如果有则把**事件绑定**到 `<a>` 标签上并添加 `href` 属性，否则绑定到外层元素本身。
```javascript
    if (this.tag === 'a') {
      data.on = on
      data.attrs = { href }
    } else {
      /**
      * find the first <a> child and apply listener and href
      * 从插槽中找到第一个a标签，防止在router-link的插槽中包含一个跳转到其他路由的a标签
      */
      const a = findAnchor(this.$slots.default)
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false
        const aData = a.data = extend({}, a.data)
        aData.on = on
        const aAttrs = a.data.attrs = extend({}, a.data.attrs)
        aAttrs.href = href
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on
      }
    }
```

## 小结

那么至此我们把路由的 transitionTo 的主体过程分析完毕了，其他一些分支比如重定向、别名、滚动行为等同学们可以自行再去分析。

路径变化是路由中最重要的功能，我们要记住以下内容：
路由始终会维护当前的线路，
路由切换的时候会把当前线路切换到目标线路，
切换过程中会执行一系列的导航守卫钩子函数，会更改 url，
同样也会渲染对应的组件，切换完毕后会把目标线路更新替换当前线路，
这样就会作为下一次的路径切换的依据。
