# 摘要

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

Vuex 可以帮助我们**管理共享状态**。如果开发中大型单页应用，可能会考虑如何更好地在组件外部管理状态，那么使用 Vuex 再好不过。
但是，如果开发简单应用，一个简单的 store 模式就足够了，不需要 Vuex。Vuex 主要解决**深层嵌套**和**非直接关联组件之间**的**通信**。
通过定义和隔离状态管理中的各种概念并通过强制规则维持视图和状态间的独立性，使我们的代码变得更结构化且易维护。