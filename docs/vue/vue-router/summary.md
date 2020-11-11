# 总结

## create-route-map.js 创建路由映射

create-route-map.js 中实现了 4 个方法
- createRouteMap (export)
- addRouteRecord
- compileRouteRegex
- normalizePath

### createRouterMap 创建路由映射

#### 传入 4 个参数 ( routes, oldPathList, oldPathMap, oldNameMap )：

```javascript
  /**
  * 用户定义的 routes 路由配置 
  * 常见项: meta name path component redirect alias children props
  * RouteConfig自定义类型的数组，数组中的每一项都是 RouteConfig 结构的对象
  */
  routes: Array<RouteConfig>, // 每一项都是一个路由
  // 字符串类型的数组 数组中每一项都是个字符串
  oldPathList?: Array<string>,  // 每一项都是 path 组成 一个 pathList
  // RouteRecord类型的字典Dictionary<T> T就是 RouteRecord 自定义数据类型
  oldPathMap?: Dictionary<RouteRecord>, // 通过 path 的路由记录
  // RouteRecord类型的字典Dictionary<T> T就是 RouteRecord 自定义数据类型
  oldNameMap?: Dictionary<RouteRecord> // 通过 name 的路由记录
```

#### 返回 3 个对象 { pathList, pathMap, nameMap }：

```javascript
  // 字符串数组 每一项都是一个路由路径 path  路径列表用于控制路径匹配优先级
  pathList: Array<string>; 
  // RouteRecord类型的key/value 的对象 key 为 path ，值 为路由对象
  pathMap: Dictionary<RouteRecord>;
  // RouteRecord类型的key/value 的对象 key 为 name ， 值为路由对象
  nameMap: Dictionary<RouteRecord>;
```

其中 RouteConfig 路由配置的数据结构定义如下：

```javascript
/* flow/declarations.js */

declare type RouteConfig = {
  path: string;
  name?: string;  // 命名路由
  component?: any;
  components?: Dictionary<any>; // 命名视图组件 查看官方文档 命名视图 章节
  redirect?: RedirectOption; // 重定向 RedirectOption 自定义类型
  alias?: string | Array<string>; // 重命名 字符串|字符串数组 
  children?: Array<RouteConfig>; // 嵌套路由也是 RouteConfig 类型
  beforeEnter?: NavigationGuard; // 全局前置守卫 导航守卫自定义类型
  meta?: any; // 路由元信息 通过遍历 $route.matched 来检查路由记录中的 meta 字段
  props?: boolean | Object | Function;
  caseSensitive?: boolean; // 匹配规则是否大小写敏感？(默认值：false) 2.6.0+
  pathToRegexpOptions?: PathToRegexpOptions; // 编译正则的选项 2.6.0+
}
```
Dictionary 就是构造一个 key/value 对象，其中 Dictionary 数据字典的数据结构定义如下：
```javascript
/* flow/declarations.js */

declare type Dictionary<T> = { [key: string]: T }
```
我们称 routes 配置中的每个路由对象为 路由记录。路由记录就是 routes 配置数组中的对象副本 (还有在 children 数组)。
路由记录可以是嵌套的，因此，当一个路由匹配成功后，他可能匹配多个路由记录。
一个路由匹配到的所有路由记录会暴露为 $route 对象 (还有在导航守卫中的路由对象) 的 $route.matched 数组。
因此，我们需要遍历 $route.matched 来检查路由记录中的 meta 字段。
其中 RouteRecord 路由记录的数据结构定义如下：
```javascript
/* flow/declarations.js */

declare type RouteRecord = {
  path: string; // path 映射的主要根据之一
  regex: RouteRegExp; // 正则表达式
  components: Dictionary<any>; // 命名视图组件
  instances: Dictionary<any>;
  name: ?string;  // name 映射的主要根据之一
  parent: ?RouteRecord; // 父路由的路由记录
  redirect: ?RedirectOption; // 重定向 RedirectOption 自定义类型
  matchAs: ?string; //路由别名
  beforeEnter: ?NavigationGuard;  // 全局前置守卫 导航守卫自定义类型
  meta: any; // 路由元信息 通过遍历 $route.matched 来检查路由记录中的 meta 字段
  props: boolean | Object | Function | Dictionary<boolean | Object | Function>;
}
```
```javascript
/* flow/declarations.js */

// 继承js的一个 RegExp 对象，它表示正则表达式，是对字符串执行模式匹配的强大工具。
declare class RouteRegExp extends RegExp {
  keys: Array<{ name: string, optional: boolean }>;
}
```

```javascript
/* flow/declarations.js */

// RedirectOption 重定向配置项
declare type RedirectOption = RawLocation | ((to: Route) => RawLocation)

// RawLocation 行定位
declare type RawLocation = string | Location // 默认是 Location 类型

// Location 定位
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

Route 的数据结构定义如下：
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
NavigationGuard 导航守卫的数据结构定义如下：
```javascript
/* flow/declarations.js */

// NavigationGuard 导航守卫  to 和 from 都是路由对象
declare type NavigationGuard = (
  to: Route, // 跳转后的路由 即将要进入的目标 路由对象 Route自定义类型
  from: Route, // 要跳转的路由 当前导航正要离开的路由  Route自定义类型
  // 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
  next: (to?: RawLocation | false | Function | void) => void  
) => any
```
::: warning 重要
**参数或查询的改变并不会触发进入/离开的导航守卫**
:::

当一个导航触发时，全局前置守卫按照创建顺序调用。守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于 等待中。

每个守卫方法接收三个参数：

- **`to`**: 即将要进入的目标 路由对象

- **`from`**: 当前导航正要离开的路由

- **`next`**: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。

    - _`next()`_: 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。

    - _`next(false)`_: 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。

    - _`next('/')`_ 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。你可以向 next 传递任意位置对象，
    且允许设置诸如 replace: true、name: 'home' 之类的选项以及任何用在 router-link 的 to prop 或 router.push 中的选项。

    - _`next(error)`_: (2.4.0+) 如果传入 next 的参数是一个 Error 实例，则导航会被终止且该错误会被传递给 router.onError() 注册过的回调。

**确保要调用 next 方法，否则钩子就不会被 resolved**。

#### 做了哪些事情

1. 初始化 { pathList, pathMap, nameMap }
设置默认值，当已经完整执行过createRouteMap，使用addRoutes动态添加路由时，pathMap，nameMap会有值，否则为空

2. 遍历 routes (用户定义的路由配置) 中的每项路由，执行 addRouteRecord 函数，将 { pathList, pathMap, nameMap } 和 当前的遍历项 route 作为参数传入
addRouteRecord 会遍历所有 routes 逐步给 pathMap、nameMap 添加路由信息记录 record ( record 是一个 RouteRecord类型的对象 )

3. 执行一个 for 循环  如果 pathList 数组中含有通配符（*），确保把他放到 pathList 的结尾

4 . 最后 return { pathList, pathMap, nameMap } 完成 路由映射 的创建。

## create-match.js 创建路由匹配器

create-match.js 文件中 定义了一个 Matcher 类型，实现了 3 个方法

- createMatcher (export)
- matchRoute
- resolveRecordPath

### Matcher 
```javascript
/* src/create-matcher.js  */

/* Matcher 封装了两个方法，match 和 addRoutes 通过 matcher.match 和 matcher.addRouter 访问*/
export type Matcher = {
  /* match 方法 */
  /**
  * 参数 
  * raw: RawLocation 自定义类型 前面分析过了
  * current: Route 自定义类型
  * redirectedFrom: Location 类型
  * 
  * 返回值
  * 是一个Route类型的 $route 对象
  * 通过 当前的路径 结合之前 生成的所有路由的record记录(路由映射表（nameMap,pathMap）) 
  * 生成一个route对象并返回
  */
  match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
  /* addRoutes 方法 */
  /**
  * 给已有的 包含路由信息 的路由映射表（pathList,pathMap,nameMap）(生成的所有路由的record记录)
  * 再添加新增的routes
  * 参数
  * routes 用户定义的路由配置 RouteConfig 类型
  */
  addRoutes: (routes: Array<RouteConfig>) => void;
};
```

### createMatcher

#### 传入 2 个参数 { routes , router }
```javascript
 /* routes RouteConfig类型的数组 实例化vueRouter的路由列表 即用户定义的路由配置 */
 routes: Array<RouteConfig>, 
 router: VueRouter // $router 对象(this.$router)
```
#### 返回 一个 Matcher 对象 即 { match, addRoutes }

#### 做了哪些事情
1. 通过 createRouteMap(routes) 创建路由映射表 { pathList, pathMap, nameMap }
2. 通过 createRouteMap(routes, pathList, pathMap, nameMap) 实现 addRoutes(routes) 方法 给已有的 包含路由信息 的路由映射表（pathList,pathMap,nameMap）
(生成的所有路由的record记录)，再添加新增的routes
3. 实现 match 方法 router.match 和 router.matcher.match 实质上是调用这个方法。 通过当前的路径结合之前生成的所有路由的record记录生成一个route对象。
4. 实现 redirect 方法 参数 { record: RouteRecord, location: Location } 返回 Route 对象，在 _createRoute中调用
5. 实现 alias 方法 参数 { record: RouteRecord, location: Location, matchAs: string } 返回 Route 对象，在 _createRoute中调用
6. 实现 _createRoute 方法 创建路由对象 参数 { record: ?RouteRecord, location: Location, redirectedFrom?: Location } 如果 record.redirect为 true，
即设置了重定向 那么调用 redirect 方法 创建 路由对象。如果 record.matchAs 为 true ，即设置了重命名 那么调用 alias 方法 创建路由对象。其他情况 通过
createRoute 创建路由对象。
7. 最后返回 Matcher 对象 即 { match, addRoutes }。创建路由匹配器完成。

### 另外两个方法
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

function resolveRecordPath (path: string, record: RouteRecord): string {
  // resolvePath 详见 src/util/path.js
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}
```