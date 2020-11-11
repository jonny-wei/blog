# 路由匹配

上一章节我们分析了**路由过渡**(或者叫路由切换)和视图渲染，通过以下方式，进行路由过渡时，会先进行**路由匹配**

- router.push(location, onComplete?, onAbort?)
- router.push(location).then(onComplete).catch(onAbort)
- router.replace(location, onComplete?, onAbort?)
- router.replace(location).then(onComplete).catch(onAbort)
- router.go(n)
- router.back()
- router.forward()

这里以 `hash` 模式为例:

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
在上一章节我们分析知道路由的**过渡实质**都执行了 `push` 方法，而 `push` 方法调用了 `transitionTo` 方法实现路由过渡
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
      this.confirmTransition(route, () => { /*...*/ }
  }
```
如你所见，在 `transitionTo` 中执行 `confirmTransition` 实现真正的路由过渡之前需要调用 **VueRouter实例** 的 `match` 方法，
`match` 方法会根据当前的 `location` 和 之前生成的`路由映射表`（`nameMap`,`pathMap`）生成 `$route` 对象。

`match` 的定义如下:
```javascript
/* src/index.js  */

match (
    raw: RawLocation,
    current?: Route,
    redirectedFrom?: Location
  ): Route {
    // 最终执行实例的 matcher 属性的 match 方法（src/create-matcher.js:31）
    return this.matcher.match(raw, current, redirectedFrom)
  }
```
我们可以清楚的看到，最终执行的是实例的 `matcher` 属性的 `match` 方法。

那么路由过渡时是怎么匹配到我们在 routes 中定义的路由呢？ 下面我们就重点分析一下 vue-router 的**路由匹配机制**。
 
## 匹配器 Matcher

先从 匹配器 matcher 的数据结构说起：

```javascript
/* src/create-matcher.js  */

export type Matcher = {
  match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
  addRoutes: (routes: Array<RouteConfig>) => void;
};
```
`Matcher` 返回了两个方法，`match` 和 `addRoutes`，前面说过 `match` 方法会根据当前的  `location` 和 之前生成的`路由映射表（nameMap,pathMap）`生成 `$route` 对象。
所以在分析 `Matcher` 前，我们先分析一下 `match` 方法中的 `Route` 和 `Loaction` 两个对象的数据结构：

### Route 的定义
```javascript
/* flow/declarations.js */

// Route
declare type Route = {
  path: string; // 当前路由的路径
  name: ?string; // 当前路由的名称
  hash: string; // 当前路由的 hash 值 (带 #) 
  query: Dictionary<string>; // 表示 URL 查询参数
  params: Dictionary<string>; // 包含了动态片段和全匹配片段
  fullPath: string; // 完成解析后的 URL，包含查询参数和 hash 的完整路径
  /**
  * 匹配的路有记录 一个 RouteRecord 类型的数组 
  * 当一个路由匹配成功后，他可能匹配多个路由记录。包含当前路由的所有嵌套路径片段的路由记录 
  * 路由记录就是 routes 配置数组中的对象副本 (还有在 children 数组)
  */
  matched: Array<RouteRecord>; 
  redirectedFrom?: string; // 如果存在重定向，即为重定向来源的路由的名字
  meta?: any; // 路由元信息 通过遍历 $route.matched 来检查路由记录中的 meta 字段
}
```
`Route` 表示的是路由中的一条线路，它除了描述了**类似 Loctaion** 的 `path`、`name`、`hash`、`query`、`params` 这些概念，还
有 `matched` 表示**匹配到的**所有的 `RouteRecord`。其他属性我们之后会介绍。

### Loaction 的定义
```javascript
/* flow/declarations.js */

declare type Location = {
  _normalized?: boolean; // 是否 归一化 
  name?: string; // 当前路由的名称 
  path?: string; // 当前路由的路径
  hash?: string;  // 当前路由的 hash 值 (带 #) 
  query?: Dictionary<string>; // 表示 URL 查询参数
  params?: Dictionary<string>; // 包含了动态片段和全匹配片段
  /**
  * 是否允许在 current(当前默认的路由) 路由上附加路径 (如同 router-link)
  * 设置 append 属性后，则在当前 (相对) 路径前添加基路径。
  * 例如，我们从 /a 导航到一个相对路径 b，如果没有配置 append，则路径为 /b，
  * 如果配了，则为 /a/b
  */
  append?: boolean;
  /**
  * 设置 replace 属性的话，当点击时，会调用 router.replace() 而不是 router.push()，
  * 于是导航后不会留下 history 记录 ，会替换掉当前的 history 记录。
  */
  replace?: boolean; 
}
```

`Location` 数据结构和浏览器提供的 `window.location` 部分结构有点类似，它们都是对 `url` 的**结构化描述**。
举个例子：`/user?name=Jonny&age=23`，它的 `path` 是 `/user`，`query` 是 `{ name:'Jonny',age: 23 }`。其他属性我们之后会介绍。

之前分析 `VueRouter` 类的时候，还记得我们在哪创建的 `Matcher` 匹配器的吗？

```javascript
/* scr/index.js */

export default class VueRouter {
    constructor() {
      // ...more

      /*  this.matcher 创建核心的matcher对象 路由匹配器*/
      this.matcher = createMatcher(options.routes || [], this)

      // ...more
    }
}
```
没错，在 `VueRouter` 的构造方法中我们定义了 `matcher` 对象，它是通过 `createMatcher` 返回了两个方法，`match` 和 `addRoutes` ，
下面具体分析 `createMatcher`：

### createMatcher 的实现

```javascript
/* src/create-matcher.js */

/* createMatcher返回一个含有match方法和addRoutes方法的对象给router对象的matcher属性 */
export function createMatcher (
  routes: Array<RouteConfig>, // routes为实例化vueRouter的路由列表 就是用户配置的路由 routes
  router: VueRouter //  new VueRouter 返回的实例 router
): Matcher {
  /* 创建路由映射表（ pathList,pathMap,nameMap） 路由映射的关系 */ 
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
  /**
  * createMatcher会返回一个动态添加路由API
  * 原理是给已有的包含路由信息的路由映射表（pathList,pathMap,nameMap）再添加新增的routes
  */
  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }

  /**
  * 之前经常看到调用 this.router.match 或 this.router.matcher.match 实质上是调用这个方法
  * 通过当前的路径结合之前生成的所有路由的record记录生成一个route对象并返回（createRoute方法）
  */
  function match (
    raw: RawLocation, //值为location.pathname（第一次跳转）或者 location 对象
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {
    /**
    * 如果raw是 location.pathname 将它规范化为一个location对象
    * （详情：test/unit/specs/location.spec.js:4）
    */
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location

    /**
    * 找出匹配的
    * 如果路由信息location中有name属性
    * 则去 nameMap映射表 找对应name的记录 record
    */
    if (name) { 
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        warn(record, `Route with name '${name}' does not exist`)
      }
      /* 如果没找到对应name的记录 则创建路由对象,一般情况下会执行createRoute方法 */
      if (!record) return _createRoute(null, location)
      
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)

      if (typeof location.params !== 'object') {
        location.params = {}
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (const key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }

      if (record) {
        location.path = fillParams(record.path, location.params, `named route "${name}"`)
         /* 创建route路由对象 */
        return _createRoute(record, location, redirectedFrom)
      }
    } else if (location.path) {
      /* 不匹配，路由信息location中没有name属性 就去pathList和pathMap根据path找对应的路由信息 */
      location.params = {}
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]
        /* 使用当前 location 的 path 属性和每个路由记录的正则属性进行匹配 */
        if (matchRoute(record.regex, location.path, location.params)) {
          /* 结合 record 创建route路由对象 */
          return _createRoute(record, location, redirectedFrom)
        }
      }
    }
    // no match
    // 创建一个匹配失败的route对象（会在视图中创建一个注释节点）
    return _createRoute(null, location)
  }

  /* 重定向 */
  function redirect (
    record: RouteRecord,
    location: Location
  ): Route {
    const originalRedirect = record.redirect
    let redirect = typeof originalRedirect === 'function'
      ? originalRedirect(createRoute(record, location, null, router))
      : originalRedirect

    if (typeof redirect === 'string') {
      redirect = { path: redirect }
    }

    if (!redirect || typeof redirect !== 'object') {
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false, `invalid redirect option: ${JSON.stringify(redirect)}`
        )
      }
      return _createRoute(null, location)
    }

    const re: Object = redirect
    const { name, path } = re
    let { query, hash, params } = location
    query = re.hasOwnProperty('query') ? re.query : query
    hash = re.hasOwnProperty('hash') ? re.hash : hash
    params = re.hasOwnProperty('params') ? re.params : params

    if (name) {
      // resolved named direct
      const targetRecord = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        assert(targetRecord, `redirect failed: named route "${name}" not found.`)
      }
      return match({
        _normalized: true,
        name,
        query,
        hash,
        params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      const rawPath = resolveRecordPath(path, record)
      // 2. resolve params
      const resolvedPath = fillParams(rawPath, params,
       `redirect route with path "${rawPath}"`)
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query,
        hash
      }, undefined, location)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        warn(false, `invalid redirect option: ${JSON.stringify(redirect)}`)
      }
      return _createRoute(null, location)
    }
  }

  /* 重命名 */
  function alias (
    record: RouteRecord,
    location: Location,
    matchAs: string
  ): Route {
    const aliasedPath = fillParams(matchAs, location.params,
     `aliased route with path "${matchAs}"`)
    const aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    })
    if (aliasedMatch) {
      const matched = aliasedMatch.matched
      const aliasedRecord = matched[matched.length - 1]
      location.params = aliasedMatch.params
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }

  // 创建路由对象,一般情况下会执行createRoute方法
  function _createRoute (
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: Location
  ): Route {
    // 如果有重定向记录 则调用重定向 匹配路由
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    // 如果有重命名记录 则调用重命名 匹配路由
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
  }

  return {
    match,
    addRoutes
  }
}
```
`createMatcher` 接收两个参数，第一个 `routes` 为实例化vueRouter的路由列表，就是用户定义的路由配置。
 第二个是 `router`，它是我们 `new VueRouter` 返回的实例。再回顾一下：

```javascript
// 如果使用模块化机制编程，导入Vue和VueRouter，要调用 Vue.use(VueRouter)

// 1. 定义 (路由) 组件。
// 可以从其他文件 import 进来
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

// 2. 定义路由 createMatcher 传入的第一个参数
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

// 3. 创建 router 实例，然后传 `routes` 配置
// 你还可以传别的配置参数, 不过先这么简单着吧。
// createMatcher 传入的第二个参数
const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

// 4. 创建和挂载根实例。
// 记得要通过 router 配置参数注入路由，
// 从而让整个应用都有路由功能
const app = new Vue({
  router
}).$mount('#app')

```

`createMatcher` 创建匹配器中首先执行的是 `createRouteMap` **创建路由映射表**

```javascript
/* src/create-matcher.js */

/* 创建路由映射表（ pathList,pathMap,nameMap） 路由映射的关系 */ 
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
```
下面具体看一下 `createRouteMap` 的实现：

### createRouteMap 的实现

```javascript
/* src/create-route-map.js */

/* 第一次执行时后面3个参数都是undefined */
export function createRouteMap (
  routes: Array<RouteConfig>,
  oldPathList?: Array<string>,
  oldPathMap?: Dictionary<RouteRecord>,
  oldNameMap?: Dictionary<RouteRecord>
): {
  /* 返回3个对象 pathList, pathMap, nameMap */
  pathList: Array<string>;
  pathMap: Dictionary<RouteRecord>;
  nameMap: Dictionary<RouteRecord>;
} {
  /**
  * 设置默认值  数组，包括所有的 path 
  * 当已经完整执行过createRouteMap，使用addRoutes动态添加路由时，pathMap，nameMap会有
  * 否则为空
  * the path list is used to control path matching priority 
  * 路径列表用于控制路径匹配优先级
  */
  const pathList: Array<string> = oldPathList || []
  // $flow-disable-line 对象, key 为 path ， 值为路由对象
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  // $flow-disable-line 对象 ， key 为 name ， 值为路由对象
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

   /**
   *  遍历每项路由数组，执行addRouteRecord函数，将上面3个参数和当前的遍历项作为参数传入
   *  根据配置项routes生成3个路由信息(pathList, pathMap, nameMap)
   *  循环遍历 routes ，添加路由记录
   */
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

   /**
   * pathList数组中含有通配符（*），会把他放到结尾
   * 确保 * 匹配符放到最后面
   * ensure wildcard routes are always at the end
   */
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}
```
`createRouteMap` 函数的目标是**把用户的路由配置转换成一张路由映射表**，它包含 3 个部分，
`pathList` 存储所有的 `path`，`pathMap` 表示一个 `path` 到 `RouteRecord` 的**映射关系**，
而 `nameMap` 表示 `name` 到 `RouteRecord` 的**映射关系**。那么 `RouteRecord` 到底是什么，先来看一下它的数据结构：

```javascript
/* flow/declarations.js */

declare type RouteRecord = {
  path: string;
  regex: RouteRegExp;
  components: Dictionary<any>;
  instances: Dictionary<any>;
  name: ?string;
  parent: ?RouteRecord;
  redirect: ?RedirectOption;
  matchAs: ?string;
  beforeEnter: ?NavigationGuard;
  meta: any;
  props: boolean | Object | Function | Dictionary<boolean | Object | Function>;
}
```
它的创建是通过遍历 `routes` 为每一个 `route` 执行 `addRouteRecord` 方法生成一条记录，下面具体分析一下 `addRouteRecord` 的实现：

### addRouteRecord 的实现

```javascript
/* src/create-route-map.js */

/* addRouteRecord会遍历所有routes逐步给pathMap/nameMap添加路由的信息（record）*/
function addRouteRecord (
  //第一次调用前3个参数为空对象
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>,
  route: RouteConfig,  // 第一次调用时只有route有值，为当前遍历到的route对象
  parent?: RouteRecord,
  matchAs?: string  // 路由别名
) {
  /* 获取路由的path属性和name属性 */
  const { path, name } = route

  if (process.env.NODE_ENV !== 'production') {
    assert(path != null, `"path" is required in a route configuration.`)
    assert(
      typeof route.component !== 'string',
      `route config "component" for path: ${String(path || name)} cannot be a ` +
      `string id. Use an actual component instead.`
    )
  }

  const pathToRegexpOptions: PathToRegexpOptions = route.pathToRegexpOptions || {}
  /* 规范化路由（如果当前route有父route，则返回一个父子的完整路径）*/
  // e.g "/parent/child"
  const normalizedPath = normalizePath(
    path,
    parent,
    pathToRegexpOptions.strict
  )
  // 用的不多
  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive
  }

  /* 定义当前route的路由记录 */
  const record: RouteRecord = {
    path: normalizedPath, // 规范化后的路由
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    instances: {},
    name,
    parent,
    matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props: route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
  }

  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (process.env.NODE_ENV !== 'production') {
      if (route.name && !route.redirect && 
      route.children.some(child => /^\/?$/.test(child.path))) {
        warn(
          false,
          `Named Route '${route.name}' has a default child route. ` +
          `When navigating to this named route (:to="{name: '${route.name}'"), ` +
          `the default child route will not be rendered. Remove the name from ` +
          `this route and use the name of the default child route for named ` +
          `links instead.`
        )
      }
    }
    /* 递归遍历children数组执行addRouteRecord方法 */
    route.children.forEach(child => {
      const childMatchAs = matchAs ? cleanPath(`${matchAs}/${child.path}`) : undefined
      /**
      * 与第一次调用addRouteRecord不同的是，递归遍历children会额外传入record,childMatchAs参数
      * record是当前路由项，即子组件父路由的路由记录
      */
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
  }
  // 用的不多
  if (route.alias !== undefined) {
    const aliases = Array.isArray(route.alias)
      ? route.alias
      : [route.alias]

    aliases.forEach(alias => {
      const aliasRoute = {
        path: alias,
        children: route.children
      }
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs
      )
    })
  }

  /**
  * 递归遍历到最底部的route(叶子节点) 构造pathMap和nameMap映射表
  * 第一次pathMap为空对象，后续使用addRoutes动态添加路由时会有已有的路由映射表）
  */
  if (!pathMap[record.path]) {
      /* pathList是一个数组，保存着routes列表中所有route的路径 */
      pathList.push(record.path)
      /**
      * pathMap是一个对象，保存着routes列表中所有route的记录（87）
      *  属性是route的路径，值是route的记录
      */
      pathMap[record.path] = record
  }
  /**
  * 给nameMap同样添加record对象
  * pathMap和nameMap不同的是键名，一个由path路由路径作为键,一个由name路由名称作为键
  */
  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if (process.env.NODE_ENV !== 'production' && !matchAs) {
      warn(
        false,
        `Duplicate named routes definition: ` +
        `{ name: "${name}", path: "${record.path}" }`
      )
    }
  }
}
```
`addRouteRecord` 主要完成了几项工作

- 生成 `normalizedPath` 复制给` record.path`
- 通过 `compileRouteRegex` 生成 `record.regex` , 用于后期的路由匹配
- 将 `record` 分别加入到 `pathMap` 、 `pathList`、`nameMap` 里面

`addRouteRecord` 中创建了 `RouteRecord`

```javascript
 /* 定义当前route的路由记录 */
  const record: RouteRecord = {
    path: normalizedPath, // 规范化后的路由
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    /* 配置中写的 component 实际上这里会被转换成 {components: route.component} */
    components: route.components || { default: route.component },
    instances: {},
    name,
    parent,
    matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props: route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
  }
```
这里要注意几个点，`path` 是规范化后的路径，它会根据 `parent` 的 `path` 做计算；
`regex` 是一个正则表达式的扩展，它利用了`path-to-regexp` 这个工具库，把 `path` 解析成一个正则表达式的扩展。有关路由匹配规则，
将在下一章节具体阐述，下面先简单举个例子：

```javascript
var keys = []
var re = pathToRegexp('/foo/:bar', keys)
// re = /^\/foo\/([^\/]+?)\/?$/i
// keys = [{ name: 'bar', prefix: '/', delimiter: '/', optional: false, repeat: false, pattern: '[^\\/]+?' }]
```
`components` 是一个对象，通常我们在配置中写的 `component` 实际上这里会被转换成 `{ components: route.component }`；
`instances` 表示组件的实例，也是一个对象类型；
`parent` 表示父的 `RouteRecord`，因为我们配置的时候有时候`会配置子路由`，所以整个 `RouteRecord` 也就是一个**树型结构**。

```javascript
if (route.children){
  /* 递归遍历children数组执行addRouteRecord方法 */
   route.children.forEach(child => {
     const childMatchAs = matchAs ? cleanPath(`${matchAs}/${child.path}`) : undefined
       /**
       * 与第一次调用addRouteRecord不同的是，递归遍历children会额外传入record,childMatchAs参数
       * record是当前路由项，即子组件父路由的路由记录
       */
        addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
   })
} 
```
如果配置了 `children`，那么递归执行 `addRouteRecord` 方法，并把当前的 `record` 作为 `parent` 传入，通过这样的**深度遍历**，
我们就可以拿到一个 `route` 下的**完整记录**。

```javascript
 /**
  * 递归遍历到最底部的route(叶子节点) 构造pathMap和nameMap映射表
  * 第一次pathMap为空对象，后续使用addRoutes动态添加路由时会有已有的路由映射表）
  */
  if (!pathMap[record.path]) {
    // pathList是一个数组，保存着routes列表中所有route的路径
      pathList.push(record.path)
      // pathMap是一个对象，保存着routes列表中所有route的记录（87）
      // 属性是route的路径，值是route的记录
    pathMap[record.path] = record
  }
```
为 `pathList` 和 `pathMap` 各添加一条记录。
```javascript
/**
  * 给nameMap同样添加record对象
  * pathMap和nameMap不同的是键名，一个由path路由路径作为键,一个由name路由名称作为键
  */
  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if (process.env.NODE_ENV !== 'production' && !matchAs) {
      warn(
        false,
        `Duplicate named routes definition: ` +
        `{ name: "${name}", path: "${record.path}" }`
      )
    }
  }
```
如果我们在路由配置中配置了 `name`，则给 `nameMap` 添加一条记录。

由于 `pathList`、`pathMap`、`nameMap` 都是**引用类型**，所以在遍历整个 `routes` 过程中去执行 `addRouteRecord` 方法，
会不断给他们添加数据。那么经过整个 `createRouteMap` 方法的执行，我们得到的就是 `pathList`、`pathMap` 和 `nameMap`。
其中 `pathList` 是为了记录路由配置中的所有 `path`，而 `pathMap` 和 `nameMap` 都是为了通过 `path` 和 `name` 能快速查到对应的 `RouteRecord`。

再回到 `createMatcher` 函数，接下来就定义了一系列方法，最后返回了一个对象。
```javascript
return {
    match,
    addRoutes
  }
```
也就是说，`matcher` 是一个对象，它对外暴露了 `match` 和 `addRoutes` 方法。

### `match` 的实现
```javascript
/**
  * 之前经常看到调用 this.router.match 或 this.router.matcher.match 实质上是调用这个方法
  * 通过当前的路径结合之前生成的所有路由的record记录生成一个route对象并返回（createRoute方法）
  */
  function match (
    raw: RawLocation, //值为location.pathname（第一次跳转）或者 location 对象
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {
    /**
    * 如果raw是 location.pathname 将它规范化为一个location对象
    * （详情：test/unit/specs/location.spec.js:4）
    */
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location

    /**
    * 找出匹配的
    * 如果路由信息location中有name属性
    * 则去 nameMap映射表 找对应name的记录 record
    */
    if (name) {  // 
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        warn(record, `Route with name '${name}' does not exist`)
      }
      /* 如果没找到对应name的记录 则创建路由对象,一般情况下会执行createRoute方法 */
      if (!record) return _createRoute(null, location)
      
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)

      if (typeof location.params !== 'object') {
        location.params = {}
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (const key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }

      if (record) {
        location.path = fillParams(record.path, location.params, `named route "${name}"`)
         /* 创建route路由对象 */
        return _createRoute(record, location, redirectedFrom)
      }
    } else if (location.path) {
      /* 不匹配，路由信息location中没有有name属性 就去pathList和pathMap根据path找对应的路由信息 */
      location.params = {}
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]
        /* 使用当前 location 的 path 属性和每个路由记录的正则属性进行匹配 */
        if (matchRoute(record.regex, location.path, location.params)) {
          /* 结合 record 创建route路由对象 */
          return _createRoute(record, location, redirectedFrom)
        }
      }
    }
    // no match
    // 创建一个匹配失败的route对象（会在视图中创建一个注释节点）
    return _createRoute(null, location)
  }
```
`match` 方法接收 3 个参数，其中 `raw` 是 `RawLocation` 类型，它可以是一个 `url` 字符串，也可以是一个 `Location` 对象。
`currentRoute` 是 `Route` 类型，它表示**当前的路径**。`redirectedFrom` 和**重定向相关**，这里先忽略。
`match` 方法返回的是一个路径，它的作用是根据传入的 `raw` 和当前的路径 `currentRoute` 计算出一个**新的路径**并返回。

### normalizeLocation 的实现

`match` 首先执行了 `normalizeLocation`，下面分析一下 `normalizeLocation` 的实现：

```javascript
/* src/util/location.js */

/**
* 解析传入的跳转路由信息，并提取相应字段，返回一个标准路由对象（可见单元测试location.spec.js）
* raw可以是一个字符串（'/home'），也可以是一个对象即route.push({.....})中的跳转路由信息
*/
export function normalizeLocation (
  raw: RawLocation,
  current: ?Route,
  append: ?boolean,
  router: ?VueRouter
): Location {
  /* 当raw是字符串时包裹成一个对象 */
  let next: Location = typeof raw === 'string' ? { path: raw } : raw
  // named target
  // row如果有name或者被规范化了就直接返回
  if (next.name || next._normalized) {
    return next
  }

  // 即没有 name 也没有 path 的跳转？？
  // relative params
  if (!next.path && next.params && current) {
    next = extend({}, next)
    next._normalized = true
    const params: any = extend(extend({}, current.params), next.params)
    if (current.name) {
      next.name = current.name
      next.params = params
    } else if (current.matched.length) {
      const rawPath = current.matched[current.matched.length - 1].path
      next.path = fillParams(rawPath, params, `path ${current.path}`)
    } else if (process.env.NODE_ENV !== 'production') {
      warn(false, `relative params navigation requires a current route.`)
    }
    return next
  }
  // 返回一个解析后的对象
  const parsedPath = parsePath(next.path || '')
  const basePath = (current && current.path) || '/'
  const path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath

  const query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery
  )

  let hash = next.hash || parsedPath.hash
  if (hash && hash.charAt(0) !== '#') {
    hash = `#${hash}`
  }

  return {
    _normalized: true,
    path,
    query,
    hash
  }
}
```
`normalizeLocation` 方法的作用是根据 `raw`，`current` 计算出**新**的 `location`，它**主要处理了 raw 的两种情况**，
一种是有 `params` 且**没有** `path`，一种是**有** `path` 的，对于第一种情况，如果 `current` 有 `name`，则计算出的 `location` 也有 `name`。

计算出新的 `location` 后，对 `location` 的 `name` 和 `path` 的两种情况做了处理。

#### `normalizeLocation` 对 `name` 的处理

有 `name` 的情况下就根据 `nameMap` 匹配到 `record`，它就是一个 `RouterRecord` 对象，如果 `record` 不存在，则**匹配失败**，返回一个**空路径**。
然后拿到 `record` 对应的 `paramNames`，再对比 `currentRoute` 中的 `params`，把**交集**部分的 `params` 添加到 `location` 中，
然后在通过 `fillParams` 方法根据` record.path` 和 `location.path` 计算出 `location.path`，
最后调用 `_createRoute(record, location, redirectedFrom)` 去生成一条**新路径**，该方法我们之后会介绍。

#### `normalizeLocation` 对 `path` 的处理

通过 `name` 我们可以很快的找到 `record`，但是通过 `path` 并**不能**，因为我们计算后的 `location.path` 是一个**真实路径**，
而 `record` 中的 `path` 可能会有 `param`，因此需要对所有的 `pathList` 做**顺序遍历**， 
然后通过 `matchRoute` 方法根据 `record.regex`、`location.path`、`location.params` 匹配，
如果匹配到则通过` _createRoute(record, location, redirectedFrom)` 去生成一条**新路径**。
因为是**顺序遍历**，所以我们书写**路由配置要注意路径的顺序**，因为**写在前面的会优先尝试匹配**。

### **addRoutes** 的实现

**addRoutes** 方法的作用是**动态添加路由配置**，因为在实际开发中有些场景是不能提前把路由写死的 比如根据用户角色和权限动态加载路由，
需要根据一些条件动态添加路由，所以 `vue-router` 提供了 `addRoutes API`：

```javascript
 /**
  * createMatcher会返回一个动态添加路由API
  * 原理是给已有的包含路由信息的路由映射表（pathList,pathMap,nameMap）再添加新增的routes
  */
  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }
```
其内部也是调用 `createRouteMap` ，传入新的 `routes` 配置，由于 `pathList`、`pathMap`、`nameMap` 都是**引用类型**，执行 `addRoutes` 后会修改它们的值

最后我们来看一下 `_createRoute` 的实现：

### `_createRoute` 的实现

```javascript
 // 创建路由对象,一般情况下会执行createRoute方法
  function _createRoute (
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: Location
  ): Route {
    // 如果有重定向记录 则调用重定向 匹配路由
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    // 如果有重命名记录 则调用重命名 匹配路由
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
  }
```
我们先不考虑 `record.redirect` 和 `record.matchAs` 的情况，`_createRoute` 最终会调用 `createRoute` 方法，下面就分析一下 `createRoute` 的实现：

### `createRoute` 的实现

```javascript
/* src/uitl/route.js */

// 创建 $route 路由对象
export function createRoute (
  record: ?RouteRecord,
  location: Location,
  redirectedFrom?: ?Location,
  router?: VueRouter
): Route {
  const stringifyQuery = router && router.options.stringifyQuery

  let query: any = location.query || {}  // 请求参数
  // 深拷贝query对象
  try {
    query = clone(query)
  } catch (e) {}
  // 生成路由对象
  const route: Route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery),
    /* 返回当前的路由记录以及所有的父路由的记录（父 => 子）*/
    matched: record ? formatMatch(record) : []
  }
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
  }
  // 冻结路由对象，防止篡改
  return Object.freeze(route)
}
```
`createRoute` 可以根据 `record` 和 `location` 创建出来，最终返回的是一条 `Route` 路径，我们之前也介绍过它的数据结构。
在 `vue-router` 中，所有的 `Route` **最终都会通过** `createRoute` 函数创建，并且它最后**是不可以被外部修改**的。`createRoute` 生成的对象，便是是我们**经常用到的路由对象**。 
**当前激活的路由**信息对象则是 `this.$route`。
`Route` 对象中有一个非常重要属性是 `matched`，它通过 `formatMatch(record)` 计算而来：

```javascript
/* src/uitl/route.js */

// 根据当前路径匹配到的 record 和它的所有父级生成一个match数组
function formatMatch (record: ?RouteRecord): Array<RouteRecord> {
  const res = []
  // 递归遍历当前路由和所有父路由放入match数组中 [父=》子]
  while (record) {
    res.unshift(record)
    record = record.parent
  }
  return res
}
```
可以看它是通过 `record` **循环**向上找 `parent`，直到找到最外层，并把**所有的** `record` 都 `push` 到一个数组中，
最终返回的就是 `record` 的数组，它**记录了一条线路上的所有 record**。`matched` 属性非常有用，它为之后**渲染组件提供了依据**。

## 路由匹配规则

前面提到过 `path` 是规范化后的路径，它会根据 `parent` 的 `path` 做计算； `regex` 是一个正则表达式的扩展，
它利用了 `path-to-regexp` 这个工具库，把 `path` 解析成一个**正则表达式的扩展**。下面重点讲一下路由匹配规则。

```javascript
/* flow/declarations.js */

declare module 'path-to-regexp' {
  declare module.exports: {
    (path: string, keys?: Array<?{ name: string }>, options?: PathToRegexpOptions): RouteRegExp;
    compile: (path: string) => (params: Object) => string;
  }
}
```
关于 `path-to-regexp` ，这里主要讲几个例子

```javascript
import Regexp from 'path-to-regexp';
// 假如我们页面 path 为 /about
let reg = Regexp('/about', [], {}); // reg ==>  /^\/about(?:\/(?=$))?$/i
'/about'.match(reg); // ["/about", index: 0, input: "/about", groups: undefined]
'/home'.match(reg); // null

// 假如我们页面 path 为 /about/:id
let reg = Regexp('/about/:id', [], {}); // reg ==>  /^\/about\/((?:[^\/]+?))(?:\/(?=$))?$/i
'/about'.match(reg); //  null
'/about/123'.match(reg); //["/about/123", "123", index: 0, input: "/about/123", groups: undefined]
```

```javascript
function compileRouteRegex (path: string, pathToRegexpOptions: PathToRegexpOptions): RouteRegExp {
  const regex = Regexp(path, [], pathToRegexpOptions)
  if (process.env.NODE_ENV !== 'production') {
    const keys: any = Object.create(null)
    regex.keys.forEach(key => {
      warn(!keys[key.name], `Duplicate param keys in route with path: "${path}"`)
      keys[key.name] = true
    })
  }
  return regex
}

// 标准化路由的方法
// 如果path的第一个字符为/则直接返回
function normalizePath (path: string, parent?: RouteRecord, strict?: boolean): string {
  if (!strict) path = path.replace(/\/$/, '')
  if (path[0] === '/') return path
  if (parent == null) return path
    // 如果有含有父路由会进入这个方法
    // 将父路由的path值拼上子路由的path值返回该子路由完整的path值
  return cleanPath(`${parent.path}/${path}`)
}
```
最后通过`正则检查`路由是否匹配， 匹配结果`非 null `则表示**路由符合预先设定的规则**

```javascript
// 遍历每个记录的regex正则，匹配传入的当前的location.path，成功则返回true
function matchRoute (
  regex: RouteRegExp,
  path: string,
  params: Object
): boolean {
  const m = path.match(regex)

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (let i = 1, len = m.length; i < len; ++i) {
    const key = regex.keys[i - 1]
    const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
    if (key) {
      // Fix #1994: using * with props: true generates a param named 0
      params[key.name || 'pathMatch'] = val
    }
  }

  return true
}
```
最后，对路由匹配做一个总结 。 路由匹配具体的步骤有：

实例化的时候，创建匹配器 ，并生成路由的映射关系 。匹配器中包含 `match` 方法
`push` 的时候，调用到 `match` 方法
`match` 方法里面，从路由的映射关系里面，通过编译好的正则来判定是否匹配，返回最终匹配的路由对象
`transitionTo` 中，拿到匹配的路由对象，进行路由跳转。