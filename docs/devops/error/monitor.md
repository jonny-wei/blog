# 前端异常监控系统

错误上报两种主流上报方式：

- 通过 Ajax 发送数据
  
  因为 Ajax 请求本身也有可能会发生异常，而且有可能会引发跨域问题，一般情况下更推荐使用动态创建 img 标签的形式进行上报。

- 动态创建 img 标签的形式
  
  `new Image().src = reportUrl + '?msg=' + msg;`


::: warning 参考文献
[Source Map 详解](https://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)

[超详细！搭建一个前端错误监控系统](https://zhuanlan.zhihu.com/p/51446011)

[线上bug追踪之Sentry初步尝试](https://juejin.cn/post/6844903916887343117)

[Vue SPA项目 + Sentry 实现前端错误监控](https://juejin.cn/post/6844903593997238285)

[sentry搭建错误监控系统](https://juejin.cn/post/6844904161415266317#heading-13)

[Vue 项目中接入sentry](https://juejin.cn/post/6844903511872765965)

[前端代码线上出错如何解决？使用sentry](https://juejin.cn/post/6844904137939746823#heading-6)

[生产环境通过SourceMap还原压缩后JavaScript错误，快速定位异常](https://juejin.cn/post/6844903831927521293)

[利用sourcemap库还原错误堆栈-前端监控之数据分析篇](https://juejin.cn/post/6844903901393584142#heading-1)

[自研多端错误监控平台](https://juejin.cn/post/6844904202917904391#heading-49)

[玩转前端监控，全面解析Sentry源码](https://juejin.cn/post/6918290580619902989)

[腾讯开源前端监控 bad.js 源代码解析](https://github.com/rico-c/Front-End-Monitoring/blob/master/badjs-sourcedoce-explain.md)
:::