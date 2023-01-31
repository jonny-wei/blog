# 异步方案

六种异步方案:

- 回调函数
- 事件监听
- 发布/订阅
- Promise
- Generator
- Async
  
![异步方案](/blog/images/javascript/异步方案.png)

下面通过一道场景题深入了解异步处理的几种方式：

## 异步处理的几种方式

题目：红灯三秒亮一次，绿灯一秒亮一次，黄灯两秒亮一次，不断交替循环

```js 
// 先定义下红绿灯：
function red() {
  console.log("red");
}
function green() {
  console.log("green");
}
function yellow() {
  console.log("yellow");
}
```

### 回调函数

这是最常见的一种方式，把函数作为参数送入，然后回调。

```js
// 封装定时器
var light = (timmer, cb) => {
  setTimeout(() => {
    cb();
  }, timmer);
};

function step(cb) {
  light(3000, () => {
    red();
    light(1000, () => {
      green();
      light(2000, () => {
        yellow();
        step();
      });
    });
  });
  typeof cb === "function" && cb();
}

step(() => console.log("wait for about 3 seconds..."));
```
### 事件监听

采用事件驱动模式。任务的执行不取决于代码的顺序，而取决于某个事件是否发生。监听一个事件，然后触发这个事件，并且执行事件里的回调函数

```js
// 引入 Node events 模块
const events = require("events");
const emitter = new events.EventEmitter();

// 封装定时器
const lightHandler = (timmer, cb) => {
  setTimeout(() => {
    cb();
  }, timmer);
};

// 监听
emitter.on("lightEvent", str => console.log(str));

// 触发
function step() {
  lightHandler(3000, () => {
    emitter.emit("lightEvent", "red");
    lightHandler(1000, () => {
      emitter.emit("lightEvent", "green");
      lightHandler(2000, () => {
        emitter.emit("lightEvent", "yellow");
        step();
      });
    });
  });
}

step();
```
### 发布/订阅

"事件"，完全可以理解成 "信号"。我们假定，存在一个"信号中心"，某个任务执行完成，就向信号中心"发布"（publish）一个信号，其他任务可以向信号中心"订阅"（subscribe）这个信号，从而知道什么时候自己可以开始执行。这就叫做 **发布/订阅模式**（publish-subscribe pattern），又称 **观察者模式**（observer pattern）。

订阅者（Subscriber）把自己想订阅的事件注册（Subscribe）到调度中心（Event Channel），当发布者（Publisher）发布该事件（Publish Event）到调度中心，也就是该事件触发时，由调度中心统一调度（Fire Event）订阅者注册到调度中心的处理代码。

```js
const publisher = {
  // 缓存列表
  lists: {},

  // 订阅
  subscribe: function(event, handler) {
    (this.lists[event] || (this.lists[event] = [])).push(handler);
  },

  // 取消订阅
  unsubscribe: function(event, handler) {
    const events = this.lists[event];
    if (!events) {
      return false;
    }
    if (!handler) {
      events && (events.length = 0);
    } else {
      events.forEach((item, i) => {
        if (item === handler) {
          events.splice(i, 1);
        }
      });
    }
  },

  // 发布
  publish: function() {
    const event = [].shift.call(arguments);
    const events = this.lists[event];

    if (!events || events.length === 0) {
      return false;
    }

    events.forEach(item => {
      item.apply(this, arguments);
    });
  }
};

// 封装定时器
const lightHandler = (timmer, cb) => {
  setTimeout(() => {
    cb();
  }, timmer);
};

const colorHandler = color => console.log(color);

// 订阅
publisher.subscribe("redEvent", colorHandler);
publisher.subscribe("greenEvent", colorHandler);
publisher.subscribe("yellowEvent", colorHandler);

function step() {
  lightHandler(3000, () => {
    publisher.publish("redEvent", "red");
    lightHandler(1000, () => {
      publisher.publish("greenEvent", "green");
      lightHandler(2000, () => {
        publisher.publish("yellowEvent", "yellow");
        step();
      });
    });
  });
}

step();
```

### Promise

```js
var light = (timmer, cb) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      cb();
      resolve();
    }, timmer);
  });
};

var step = () => {
  Promise.resolve()
    .then(() => {
      return light(3000, red);
    })
    .then(() => {
      return light(1000, green);
    })
    .then(() => {
      return light(2000, yellow);
    })
    .then(() => {
      step();
    })
    .catch(err => console.log(err));
};

step();
```

### Generator

```js
const light = (timmer, cb) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      cb();
      resolve();
    }, timmer);
  });
};

function* gen() {
  yield light(3000, red);
  yield light(1000, green);
  yield light(3000, yellow);
}

const iterator = gen();

const step = (gen, iterator) => {
  const s = iterator.next();
  // 返回 { value: Promise { <pending> }, done: false }
  if (s.done) {
    step(gen, gen());
  } else {
    // value 返回 Promise 对象
    s.value.then(() => {
      step(gen, iterator);
    });
  }
};

step(gen, iterator);
```
### Async/await

```js
const light = (timmer, cb) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      cb();
      resolve();
    }, timmer);
  });
};

async function step() {
  await light(3000, red);
  await light(1000, green);
  await light(2000, yellow);
  step();
}

step();
```

## 异步处理实战

以**查找指定目录下的最大文件**为例，感受从 `回调函数 -> Promise -> Generator -> Async` 异步处理方式的改变。

### 思路分析

- fs.readdir 方法用于读取目录，返回一个包含文件和目录的数组。

- fs.stat 方法的参数是一个文件或目录，它产生一个对象，该对象包含了该文件或目录的具体信息。此外，该对象还有一个 isFile() 方法可以判断正在处理的到底是一个文件，还是一个目录。

基本的实现思路就是：

- 用 fs.readdir 获取指定目录的内容信息
- 循环遍历内容信息，使用 fs.stat 获取该文件或者目录的具体信息
- 将具体信息储存起来
- 当全部储存起来后，筛选其中的是文件的信息
- 遍历比较，找出最大文件
- 获取并返回最大文件

### 回调函数

```js
var fs = require('fs');
var path = require('path');

function findLargest(dir, cb) {
    // 读取目录下的所有文件
    fs.readdir(dir, function(er, files) {
        if (er) return cb(er);

        var counter = files.length;
        var errored = false;
        var stats = [];

        files.forEach(function(file, index) {
            // 读取文件信息
            fs.stat(path.join(dir, file), function(er, stat) {

                if (errored) return;

                if (er) {
                    errored = true;
                    return cb(er);
                }

                stats[index] = stat;

                // 事先算好有多少个文件，读完 1 个文件信息，计数减 1，当为 0 时，说明读取完毕，此时执行最终的比较操作
                if (--counter == 0) {

                    var largest = stats
                        .filter(function(stat) { return stat.isFile() })
                        .reduce(function(prev, next) {
                            if (prev.size > next.size) return prev
                            return next
                        })

                    cb(null, files[stats.indexOf(largest)])
                }
            })
        })
    })
}

// 使用方式为：
// 查找当前目录最大的文件
findLargest('./', function(er, filename) {
    if (er) return console.error(er)
    console.log('largest file was:', filename)
});
```

### Promise

```js
var fs = require('fs');
var path = require('path');

var readDir = function(dir) {
    return new Promise(function(resolve, reject) {
        fs.readdir(dir, function(err, files) {
            if (err) reject(err);
            resolve(files)
        })
    })
}

var stat = function(path) {
    return new Promise(function(resolve, reject) {
        fs.stat(path, function(err, stat) {
            if (err) reject(err)
            resolve(stat)
        })
    })
}

function findLargest(dir) {
    return readDir(dir)
        .then(function(files) {
            let promises = files.map(file => stat(path.join(dir, file)))
            return Promise.all(promises).then(function(stats) {
                return { stats, files }
            })
        })
        .then(data => {

            let largest = data.stats
                .filter(function(stat) { return stat.isFile() })
                .reduce((prev, next) => {
                    if (prev.size > next.size) return prev
                    return next
                })

            return data.files[data.stats.indexOf(largest)]
        })

}

// 使用方式为：
findLargest('./')
.then(function(filename) {
    console.log('largest file was:', filename);
})
.catch(function() {
    console.log(error);
});
```

### Generator

```js
var fs = require('fs');
var path = require('path');

var co = require('co')

var readDir = function(dir) {
    return new Promise(function(resolve, reject) {
        fs.readdir(dir, function(err, files) {
            if (err) reject(err);
            resolve(files)
        })
    })
}

var stat = function(path) {
    return new Promise(function(resolve, reject) {
        fs.stat(path, function(err, stat) {
            if (err) reject(err)
            resolve(stat)
        })
    })
}

function* findLargest(dir) {
    var files = yield readDir(dir);
    var stats = yield files.map(function(file) {
        return stat(path.join(dir, file))
    })

    let largest = stats
        .filter(function(stat) { return stat.isFile() })
        .reduce((prev, next) => {
            if (prev.size > next.size) return prev
            return next
        })

    return files[stats.indexOf(largest)]

}

// 使用方式为：
co(findLargest, './')
.then(function(filename) {
    console.log('largest file was:', filename);
})
.catch(function() {
    console.log(error);
});
```

### Async

```js
var fs = require('fs');
var path = require('path');

var readDir = function(dir) {
    return new Promise(function(resolve, reject) {
        fs.readdir(dir, function(err, files) {
            if (err) reject(err);
            resolve(files)
        })
    })
}

var stat = function(path) {
    return new Promise(function(resolve, reject) {
        fs.stat(path, function(err, stat) {
            if (err) reject(err)
            resolve(stat)
        })
    })
}

async function findLargest(dir) {
    var files = await readDir(dir);

    let promises = files.map(file => stat(path.join(dir, file)))
    var stats = await Promise.all(promises)

    let largest = stats
        .filter(function(stat) { return stat.isFile() })
        .reduce((prev, next) => {
            if (prev.size > next.size) return prev
            return next
        })

    return files[stats.indexOf(largest)]

}

// 使用方式为：
findLargest('./')
.then(function(filename) {
    console.log('largest file was:', filename);
})
.catch(function() {
    console.log(error);
});
```

::: warning 参考文献
[ES6 系列之 Promise 及异步处理的几种方式](https://github.com/yangtao2o/learn/issues/73)

[ES6 系列之异步处理实战](https://github.com/mqyqingfeng/Blog/issues/101)
:::