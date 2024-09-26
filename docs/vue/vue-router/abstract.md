# 摘要

**vue-router**：以插件机制和 Vue.js 的核心深度集成，让构建单页面应用变得易如反掌。

新一代路由实现原理可移步 [VueRouter4 源码解析](/vue/vue3/vue-router4.html)

一句话总结：**封装了一个`全局混入`，定义了两个挂载在`原型`上的`变量`，注册了两个`组件`。**

支持三种路由方式：`hash`、 `history`、`abstract`

提供两种组件：`<router-link>`、 `<router-view>`

定义两个变量： `$router`、 `$route`

提供了简单的路由配置 (`构建选项`) 和实例属性 (`app`,`mode`,`currentRouter`)

暴露了一系列实例方法、全局导航守卫钩子以及组件内的守卫：
***

- push
- replace
- go
- back
- forward
- getMatchedComponents
- resolve
- addRoutes
- onReady
- onError

***

- beforeEach
- beforeResolve
- afterEach

***

- beforeRouteEnter
- beforeRouteUpdate
- beforeRouteLeave

[VueRouter 导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
