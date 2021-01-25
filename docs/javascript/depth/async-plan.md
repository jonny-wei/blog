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

::: warning 参考文献
[ES6 系列之 Promise 及异步处理的几种方式](https://github.com/yangtao2o/learn/issues/73)
:::

