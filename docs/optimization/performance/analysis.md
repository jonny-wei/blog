# 性能分析

[Chrome Devtools 高级调试指南（新）](https://juejin.cn/post/6844903961472974855)

## 速度分析

使用 speed-measure-webpack-plugin 插件进行速度分析，可以看但每个 loader 和 plugin 的执行时间

```js
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin');

const smp = new SpeedMeasureWebpackPlugin();

module.exports = smp.wrap({})
```

## 体积分析

使用 webpack-bundle-analyzer-plugin 分析打包体积大小。