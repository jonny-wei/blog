# 前端异常监控系统

## 错误上报

两种主流上报方式：

- 通过 Ajax 发送数据
  
  因为 Ajax 请求本身也有可能会发生异常，而且有可能会引发跨域问题，一般情况下更推荐使用动态创建 img 标签的形式进行上报。

- 动态创建 img 标签的形式
  
  `new Image().src = reportUrl + '?msg=' + msg;`


::: warning 参考文献
[腾讯开源前端监控 bad.js 源代码解析](https://github.com/rico-c/Front-End-Monitoring/blob/master/badjs-sourcedoce-explain.md)
:::