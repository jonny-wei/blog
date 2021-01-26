# 异步实现

手撕模拟几种异步的实现：

- Promise
- Generator
- Async

## Promise

### Promise 简介

Promise 是一个对象，从它可以获取异步操作的消息。本质上 Promise 是一个函数返回的对象，我们可以在它上面绑定回调函数，这样我们就不需要在一开始把回调函数作为参数传入这个函数了。

#### 2 个特点：

- **对象的状态不受外界影响**。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。
- **一旦状态改变，就不会再变，任何时候都可以得到这个结果(状态不可逆)**。Promise 对象的状态改变，只有两种可能：从 pending 变为 fulfilled 和从 pending 变为 rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。


#### 3 个状态：

- pending（进行中/待定）: 初始状态，既没有被兑现，也没有被拒绝。在此状态下可以落定 (settled) 为 fulfilled 或 rejected 状态。
- fulfilled（已成功/已兑现）: 意味着操作成功完成。Promise 被 resolve 后的状态，状态不可再改变，且有一个私有的值 value。
- rejected（已失败/已拒绝）: 意味着操作失败。Promise 被 reject 后的状态，状态不可再改变，且有一个私有的原因 reason。

::: tip 注意
value 和 reason 也是不可变的，它们包含原始值或对象的不可修改的引用，默认值为 undefined
:::

![Promise](/blog/images/javascript/Promise2.png)

#### 3 大手段

Promise 利用 3 大手段解决回调地狱：

- 回调函数延时绑定
- 返回值穿透
- 错误冒泡

#### 4 个缺点：

- **无法取消Promise**。一旦新建它就会立即执行，无法中途取消。
- **错误被吃掉**。如果不设置回调函数，Promise 内部抛出的错误，不会反应到外部。这也是为什么一般推荐在 Promise 链的最后添加一个 catch 函数的原因。其实这并不是 Promise 独有的局限性，try/catch 也是这样，同样会捕获一个异常并简单的吃掉错误。
- **无法得知 pending 状态**。当处于 pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。
- **单一值**。Promise 只能有一个完成值或一个拒绝原因，当需要传递多个值时，构造成一个对象或数组，然后再传递，then 中获得这个值后，又会进行取值赋值的操作。

#### 核心观点

Promsie 的核心观点是 **异步链式调用**。

```js
new myPromsie(resolve => {
  setTimeout(() => {
      resolve('1');
  },1000)
})
.then((data) => {
  console.log(data);
  return new myPromsie(resolve => {
      setTimeout(() => {
          resolve('2');
      },1000)
  })
}).then(data => {
  console.log(data);
  return '3'
}).then(data => {
  console.log(data);
})
```

#### 构造方法

Promise()

#### 静态方法

- Promise.all(iterable) 都成功时才成功

    这个方法返回一个新的 promise 对象，该 promise 对象在 iterable 参数对象里所有的 promise 对象都成功的时候才会触发成功，一旦有任何一个 iterable 里面的 promise 对象失败则立即触发该 promise 对象的失败。如果这个新的promise对象触发了失败状态，它会把 iterable 里第一个触发失败的 promise 对象的错误信息作为它的失败错误信息。

-  Promise.allSettled(iterable) ES2020

    等到所有 promises 都已敲定（settled）（每个promise都已兑现（fulfilled）或已拒绝（rejected））。返回一个promise，该 promise 在所有 promise 完成后完成。并带有一个对象数组，每个对象对应每个 promise 的结果。当您有多个彼此不依赖的异步任务成功完成时，或者您总是想知道每个 promise 的结果时，通常使用它。比之下，Promise.all() 更适合彼此相互依赖或者在其中任何一个 reject 时立即结束。

- Promise.any(iterable) 一个成功即返回 ES2021

    接收一个 Promise 对象的集合，当其中的一个 promise 成功，就返回那个成功的promise的值。本质上，这个方法和Promise.all() 是相反的。

- Promise.race(iterable)

    当 iterable 参数里的任意一个子 promise 被成功或失败后，父 promise 马上也会用子 promise 的成功返回值或失败详情作为参数调用父 promise 绑定的相应句柄，并返回该 promise 对象。

- Promise.resolve(value)

    返回一个状态由给定 value 决定的 Promise 对象。有时需要将现有对象转为 Promise 对象，Promise.resolve()方法就起到这个作用。

- Promise.reject(reason)

    返回一个状态为失败的 Promise 对象

#### Promise 原型

- Promise.prototype.then(onFulfilled, onRejected)

  - then 方法接受两个函数作为参数，且参数可选
  - 如果可选参数不为函数时会被忽略
  - 两个函数都是异步执行，会放入事件队列等待下一轮 tick
  - then 函数的返回值为 Promise
  - then 可以被同一个 Promise 多次调用

   添加解决(fulfillment)和拒绝(rejection)回调到当前 promise, 返回一个新的 promise, 将以回调的返回值来 resolve.

- Promise.prototype.catch(onRejected)

    添加一个拒绝(rejection) 回调到当前 promise, 返回一个新的 promise。当这个回调函数被调用，新 promise 将以它的返回值来resolve，否则如果当前 promise 进入 fulfilled 状态，则以当前 promise 的完成结果作为新 promise 的完成结果.

- Promise.prototype.finally(onFinally) ES2018

    添加一个事件处理回调于当前 promise 对象，并且在原 promise 对象解析完毕后，返回一个新的 promise 对象。回调会在当前 promise 运行完毕后被调用，无论当前 promise 的状态是完成(fulfilled)还是失败(rejected)。finally() 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。finally 方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。
#### 串行与并行

- 串行：一个异步请求完了之后在进行下一个请求
- 并行：多个异步请求同时进行

### Promise/A+ 规范

![PromiseA+ 规范](/blog/images/javascript/PromiseA.png)

### 手撕 Peomise 全家桶

Promise 的简单实现

```js
// 定义Promise的 3 种状态
var PENDING = 'pending';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';

// Promise 构造函数
function Promise(execute) {
    var that = this;
    that.state = PENDING; // 状态初始化

    that.value = undefined; // 成功结果 放在this上便于then访问
    that.reason = undefined; // 失败结果 放在this上便于catch访问

    that.onFulfilledFn = []; // 已兑现回调队列
    that.onRejectedFn = []; // 已拒绝回调队列

    // 这里用 setTimeout 是为了模仿异步微任务，真正的微任务只有通过浏览器底层才可以调用
    function resolve(value) {
        setTimeout(function() {
            if (that.state === PENDING) {
                that.state = FULFILLED;
                // 为了后面在 then 的回调中可以得到 resolve 传递的参数,将其保存在构造函数里。
                that.value = value;  
                // 此时 onFulfilledFn 还是空的又怎么执行里面的回调呢？
                // 大家注意看这里我们采用的 setTimeout 异步任务，
                // 虽然没有延时时间但在执行时其还是会被放在宏任务队列里，等待同步任务执行完再执行
                that.onFulfilledFn.forEach(function(f) {
                    f(that.value);
                });
            }
        });
    }

    function reject(reason) {
        setTimeout(function() {
            if (that.state === PENDING) {
                that.state = REJECTED;
                that.reason = reason;
                that.onRejectedFn.forEach(function(f) {
                    f(that.reason);
                });
            }
        });
    }

    try {
        // 把内部的 resolve 和 reject 传入 executor，用户可调用 resolve 和 reject
        execute(resolve, reject); 
    } catch (e) {
        reject(e);
    }
}

// 原型属性(方法) then
Promise.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled =
        typeof onFulfilled === 'function'
            ? onFulfilled
            : function(x) {
                  return x;
              };
    onRejected =
        typeof onRejected === 'function'
            ? onRejected
            : function(e) {
                  throw e;
              };
    var that = this;
    var promise;
    if (that.state === FULFILLED) {
        promise = new Promise(function(resolve, reject) {
            setTimeout(function() {
                // onFulfilled有可能执行失败
                try {
                    // 判断x返回的是不是一个promise
                    var x = onFulfilled(that.value);
                    resolvePromise(promise, x, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            });
        });
    }
    if (that.state === REJECTED) {
        promise = new Promise(function(resolve, reject) {
            setTimeout(function() {
                try {
                    var x = onRejected(that.reason);
                    resolvePromise(promise, x, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            });
        });
    }
    if (that.state === PENDING) {
        promise = new Promise(function(resolve, reject) {
            that.onFulfilledFn.push(function() {
                try {
                    var x = onFulfilled(that.value);
                    resolvePromise(promise, x, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            });
            that.onRejectedFn.push(function() {
                try {
                    var x = onRejected(that.reason);
                    resolvePromise(promise, x, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            });
        });
    }
    return promise;
};

function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
        return reject(new TypeError('x 不能与 promise 相等'));
    }
    if (x instanceof Promise) {
        if (x.state === FULFILLED) {
            resolve(x.value);
        } else if (x.state === REJECTED) {
            reject(x.reason);
        } else {
            x.then(function(y) {
                resolvePromise(promise, y, resolve, reject);
            }, reject);
        }
    } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        var executed;
        try {
            var then = x.then;
            if (typeof then === 'function') {
                then.call(
                    x,
                    function(y) {
                        if (executed) return;
                        executed = true;
                        resolvePromise(promise, y, resolve, reject);
                    },
                    function(e) {
                        if (executed) return;
                        executed = true;
                        reject(e);
                    }
                );
            } else {
                resolve(x);
            }
        } catch (e) {
            if (executed) return;
            executed = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}

module.exports = {
    deferred() {
        var resolve;
        var reject;
        var promise = new Promise(function(res, rej) {
            resolve = res;
            reject = rej;
        });
        return {
            promise,
            resolve,
            reject,
        }
    }
}

// 静态方法 resolve
Promise.resolve = function(value) {
    if (value instanceof Promise) {
        return value; // 如果是Promise实例直接返回
    }

    return new Promise(function(resolve, reject) {
        resolve(value);
    });
}

// 静态方法 reject
Promise.reject = function(reason) {
    return new Promise(function(resolve, reject) {
        reject(reason);
    });
}

// 原型属性(方法) catch
Promise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}

// 原型属性(方法) finally
Promise.prototype.finally = function(fn) {
    return this.then(function(value) {
        return Promise.resolve(fn()).then(function() {
            return value;
        })
    }, function(error) {
        return Promise.resolve(fn()).then(function() {
            throw error;
        });
    });
}

// 静态方法 all
Promise.all = function(promiseArr) {
    return new Promise(function(resolve, reject) {
        const length = promiseArr.length;
        const result = [];
        let count = 0;
        if (length === 0) {
            return resolve(result);
        }

        for (let [i, p] of promiseArr.entries()) {
            // 这里不直接promiseArr[i].then是为了防止传入的不是Promsie对象的情况
            Promise.resolve(p).then(function(data) {
                result[i] = data;
                count++;
                if (count === length) {
                    resolve(result);
                }
            }, function(reason) {
                reject(reason);
            });
        }
    });
}

// 静态方法 race
Promise.race = function(promiseArr) {
    return new Promise(function(resolve, reject) {
        const length = promiseArr.length;
        if (length === 0) {
            return resolve();
        } 

        for (let item of promiseArr) {
            Promise.resolve(item).then(function(value) {
                return resolve(value);
            }, function(reason) {
                return reject(reason);
            });
        }
    });
}

// 静态方法 any
Promise.any = function(promiseArr) {
    return new Promise(function(resolve, reject) {
        const length = promiseArr.length;
        const result = [];
        let count = 0;
        if (length === 0) {
            return resolve(result);
        } 

        for (let [i, p] of promiseArr.entries()) {
            Promise.resolve(p).then((value) => {
                return resolve(value);
            }, (reason) => {
                result[i] = reason;
                count++;
                if (count === length) {
                    reject(result);
                }
            });
        }
     });
}

// 静态方法 allSettled
Promise.allSettled = function(promiseArr) {
  return new Promise(function(resolve) {
    const length = promiseArr.length;
    const result = [];
    let count = 0;

    if (length === 0) {
      return resolve(result);
    } else {
      for (let [i, p] of promiseArr.entries()) {
        Promise.resolve(p).then((value) => {
            result[i] = { status: 'fulfilled', value: value };
            count++;
            if (count === length) {
                return resolve(result);
            }
        }, (reason) => {
            result[i] = { status: 'rejected', reason: reason };
            count++;
            if (count === length) {
                return resolve(result);
            }
        });
      }
    }
  });
}

// 使用 Promise.finally 实现 Promise.allSettled
Promise.allSettled = function(promises) {
    // 也可以使用扩展运算符将 Iterator 转换成数组
    // const promiseArr = [...promises];
    const promiseArr = Array.from(promises);
    return new Promise(resolve => {
        const result = [];
        const len = promiseArr.length;
        let count = len;
        if (len === 0) {
          return resolve(result);
        }
        for (let i = 0; i < len; i++) {
            promiseArr[i].then((value) => {
                result[i] = { status: 'fulfilled', value: value };
            }, (reason) => {
                result[i] = { status: 'rejected', reason: reason };
            }).finally(() => { 
                if (!--count) {
                    resolve(result);
                }
            });
        }
    });
}

// 使用 Promise.all 实现 Promise.allSettled
Promise.allSettled = function(promises) {
    // 也可以使用扩展运算符将 Iterator 转换成数组
    // const promiseArr = [...promises];
    const promiseArr = Array.from(promises);
    return Promise.all(promiseArr.map(p => Promise.resolve(p).then(res => {
      return { status: 'fulfilled', value: res }
    }, error => {
      return { status: 'rejected', reason: error }
    })));
}
```

### 实现并行限制的 Promise 调度器

实现有并行限制的 Promise 调度器问题。一个任务并发控制器，要求每次都有两个任务在执行：
  
```js
class Scheduler {
  constructor() {
    this.queue = [];
    this.maxCount = 2;
    this.runCounts = 0;
  }
  add(promiseCreator) {
    this.queue.push(promiseCreator);
  }
  taskStart() {
    for (let i = 0; i < this.maxCount; i++) {
      this.request();
    }
  }
  request() {
    if (!this.queue || !this.queue.length || this.runCounts >= this.maxCount) {
      return;
    }
    this.runCounts++;
    this.queue
      .shift()()
      .then(() => {
        this.runCounts--;
        this.request();
      });
  }
}

const timeout = (time) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });

const scheduler = new Scheduler();

const addTask = (time, order) => {
  scheduler.add(() => {
    timeout(time).then(() => {
      console.log(order);
    });
  });
};
addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');
scheduler.taskStart()
```

### 实现 Ajax 并发请求控制

实现一个批量请求函数 multiRequest(urls, maxNum)，要求如下：

- 要求最大并发数 maxNum
- 每当有一个请求返回，就留下一个空位，可以增加新的请求
- 所有请求完成后，结果按照 urls 里面的顺序依次打出

```js
function multiRequest(urls = [], maxNum) {
  const len = urls.length;
  const result = new Array(len).fill(false);
  let count = 0;
  return new Promise((resolve, reject) => {
    // 最多同时发送maxNum个请求
    while (count < maxNum) {
      sendRequest();
    }
    function sendRequest() {
      let curCount = count;
      count++;
      if (curCount >= len) {
        !result.includes(false) && resolve(result);
        return;
      }
      let curUrl = urls[curCount];
      console.log(
        `开始发送第 ${curCount}个请求 ${curUrl}`,
        new Date().toLocaleString()
      );
      fetch(curUrl)
        .then((data) => {
          console.log(
            `第 ${curCount}个请求：${curUrl}成功了！`,
            new Date().toLocaleString()
          );
          result[curCount] = data;
          if (count < len) {
            sendRequest();
          }
        })
        .catch((err) => {
          console.log(
            `第 ${curCount}个请求：${curUrl}失败了！`,
            new Date().toLocaleString()
          );
          result[curCount] = err;
          if (count < len) {
            sendRequest();
          }
        });
    }
  });
}
```

### Promise 对象实现 Ajax 操作

```js
const getJSON = function(url) {
  const promise = new Promise(function(resolve, reject){
    const handler = function() {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    const client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    client.setRequestHeader("Accept", "application/json");
    client.send();

  });

  return promise;
};

getJSON("/posts.json").then(function(json) {
  console.log('Contents: ' + json);
}, function(error) {
  console.error('出错了', error);
});
```

## Generator

### 基本概念

Generator 函数是一个状态机，封装了多个内部状态。执行 Generator 函数会返回一个遍历器对象。也就是说，Generator 函数除了状态机，还是一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。

Generator 函数是一个普通函数，但是有两个特征：
- function 关键字与函数名之间有一个星号(*)；
- 函数体内部使用 yield 表达式，定义不同的内部状态（yield 在英语里的意思就是“产出”）

Generator 函数的调用方法与普通函数一样，也是在函数名后面加上一对圆括号。不同的是，调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，也就是遍历器对象（Iterator Object）。

必须调用遍历器对象的 next 方法，使得指针移向下一个状态。换言之，Generator 函数是分段执行的，yield 表达式是暂停执行的标记，而 next 方法可以恢复执行。因此等于为 JavaScript 提供了手动的“惰性求值”（Lazy Evaluation）的语法功能。

::: tip 小结 Generator 基本概念
- 状态机，封装了多个内部状态；
- 返回一个遍历器对象，通过改对象可以一次遍历 Generator 函数内部的每一个状态
- 带 * 号，yeild 表达式定义不同的内部状态；
- 调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，也就是遍历器对象；
- Generator 函数是分段执行的，yield表达式是暂停执行的标记，而next方法可以恢复执行；
:::

### yield 与 next

#### yield

yield 表达式只能用在 Generator 函数里面，用在其他地方都会报错。yield 表达式本身没有返回值，或者说总是返回 undefined。next 方法可以带一个参数，该参数就会被当作上一个 yield 表达式的返回值。

yield 表达式与 return 语句既有相似之处，也有区别。相似之处在于，都能返回紧跟在语句后面的那个表达式的值。区别在于每次遇到yield，函数暂停执行，下一次再从该位置继续向后执行，而 return 语句不具备位置记忆的功能。一个函数里面，只能执行一次（或者说一个）return 语句，但是可以执行多次（或者说多个）yield 表达式。正常函数只能返回一个值，因为只能执行一次 return。

#### next

next() 方法返回值：{ value: undefined, done: true/false }



通过 next 方法的参数，就有办法在 Generator 函数开始运行之后，继续向函数体内部注入值(第二次传参)。也就是说，可以在 Generator 函数运行的不同阶段，从外部向内部注入不同的值，从而调整函数行为。

由于 next 方法的参数表示上一个 yield 表达式的返回值，所以在第一次使用 next 方法时，传递参数是无效的。V8 引擎直接忽略第一次使用 next 方法时的参数，只有从第二次使用 next 方法开始，参数才是有效的。从语义上讲，第一个 next 方法用来启动遍历器对象，所以不用带有参数。

遍历器对象的 next 方法的运行逻辑如下：

- （1）遇到 yield 表达式，就暂停执行后面的操作，并将紧跟在 yield 后面的那个表达式的值，作为返回的对象的 value 属性值。

- （2）下一次调用 next 方法时，再继续往下执行，直到遇到下一个 yield 表达式。

- （3）如果没有再遇到新的 yield 表达式，就一直运行到函数结束，直到 return 语句为止，并将 return 语句后面的表达式的值，作为返回的对象的 value 属性值。

- （4）如果该函数没有 return 语句，则返回的对象的 value 属性值为 undefined。



### 与 Iterator 接口的关系

任意一个对象的 Symbol.iterator方法，等于该对象的遍历器生成函数，调用该函数会返回该对象的一个遍历器对象。

由于 Generator 函数就是遍历器生成函数，因此可以把 Generator 赋值给对象的 Symbol.iterator 属性，从而使得该对象具有 Iterator 接口。

```js
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```

### Generator 原型上的方法

#### Generator.prototype.throw()

Generator 函数返回的遍历器对象，都有一个 throw 方法，可以在函数体外抛出错误，然后在 Generator 函数体内捕获。throw 方法可以接受一个参数，该参数会被 catch 语句接收，建议抛出 Error 对象的实例。如果 Generator 函数内部没有部署 try...catch 代码块，那么 throw 方法抛出的错误，将被外部 try...catch 代码块捕获。

#### Generator.prototype.return()

Generator 函数返回的遍历器对象，还有一个 return() 方法，可以返回给定的值，并且终结遍历 Generator 函数。

::: tip next()、throw()、return() 的共同点 
它们的作用都是让 Generator 函数恢复执行，并且使用不同的语句替换 yield 表达式。

- next() 是将 yield 表达式替换成一个值。如果 next 方法没有参数，就相当于替换成 undefined。
- throw() 是将 yield 表达式替换成一个 throw 语句。
- return() 是将 yield 表达式替换成一个 return 语句。
:::

### Generator 的自动执行

Generator 函数的自动执行需要一种机制，即当异步操作有了结果，能够自动交回执行权，Generator 才可以自动执行。

#### 多个异步任务

```js
var fetch = require('node-fetch');

function* gen() {
    var r1 = yield fetch('https://api.github.com/users/github');
    var r2 = yield fetch('https://api.github.com/users/github/followers');
    var r3 = yield fetch('https://api.github.com/users/github/repos');
}

// 利用递归封装一个多个异步任务执行函数
function run(gen) {
    var g = gen();

    function next(data) {
        var result = g.next(data);

        if (result.done) return;

        // 执行 g.next()，yield 返回的是一个 Promise 对象。
        // 给这个 Promise 对象添加 then 方法，当异步操作成功时执行 then 中的 onFullfilled 函数，
        // onFullfilled 函数中又去执行 g.next，从而让 Generator 继续执行，然后再返回一个 Promise，
        // 再在成功时执行 g.next，然后再返回……
        result.value.then(function(data) {
            return data.json();
        }).then(function(data) {
            next(data);
        });

    }

    next();
}

// 执行多个异步任务
run(gen);
```

### 手撕 Generator

Generator 的简单实现

```js
function webCanteenGenerator(list) {
    var index = 0;
    var len = list.length;
    return {
      next: function() {
            var done = index >= len;
            var value = !done ? list[index++] : undefined; 
            return {
                done: done,
                value: value
            }
        }
    }
}
```

## async/await

Generator 缺陷：

- 1. 函数外部无法捕获异常
- 2. 多个 yield 会导致调试困难


async 函数对 Generator 函数改进如下：

- 1. 内置执行器
- 2. 更好的语义
- 3. 更广的适用性
- 4. 返回值是 Promise
  
async/await 做的事情就是将 Generator 函数转换成 Promise，说白了，async 函数就是 Generator 函数的语法糖，await 命令就是内部 then 命令的语法糖。async 函数就是将 Generator 函数的星号（*）替换成 async，将 yield 替换成 await，仅此而已。其实 async 函数的实现原理，就是将 Generator 函数和自动执行器(比如 co)，包装在一个函数里。

async 函数内部 return 语句返回的值，会成为 then 方法回调函数的参数。

async 函数内部抛出错误，会导致返回的 Promise 对象变为 reject 状态。抛出的错误对象会被 catch 方法回调函数接收到。

async 是一种语法，Promise 是一个内置对象，两者并不具备可比性，更何况 async 函数也返回一个 Promise 对象。

### 手撕 async/await

async/await的简单实现

```js
function asyncToGenerator(generatorFn) {
    // 返回的是一个新的函数
    return function() {
         // 先调用generator函数 生成迭代器
        var gen = generatorFn.apply(this, arguments);
         // 返回一个promise 因为外部是用.then的方式 或者await的方式去使用这个函数的返回值的
        return new Promise(function(resolve, reject) {
            // 内部定义一个 step 函数 用来一步一步的跨过 yield 的阻碍
            // key 有 next 和 throw 两种取值，分别对应了gen 的 next 和 throw 方法
            // arg 参数则是用来把 promise resolve 出来的值交给下一个 yield
            function step(key, arg) {
                // 这个方法需要包裹在 try/catch 中
                // 如果报错了就把 promise 给 reject 掉, 外部通过.catch可以获取到错误
                try {
                    var info = gen[key](arg);
                    var value = info.value;
                } catch (error) {
                    reject(error);
                    return;
                }

                if (info.done) {
                    resolve(value);
                } else {
                    return Promise.resolve(value).then(function(value) {
                        step('next', value);
                    }, function(err) {
                        step('throw', err);
                    });
                }
            }
            return step('next');
        });
    }
}
```

## 问题

### Q1. 为什么 Promsie 要引入微任务?

因为同步任务和宏任务都不行。

- 同步任务：难道代码执行一半去发送一个Ajax请求然后等待响应吗？
- 宏任务：我们知道发送 Ajax，操作 DOM，定时器都属于宏任务，假设此时我们增加了 100 个 DOM 难道等待 DOM 操作完成之后我们再来发送下一个 Ajax 请求（异步链式调用情况）？

### Q2. new Promise() 返回的实例和实例 then 方法执行后返回的 promise 是一个吗?

实例 then 返回的是一个新的 Promis e对象，这个新 Promsie 的状态由 then 中的返回值决定，如果 then 内部 return 一个 Promsie 对象，那么返回的 Promsie 对象状态便是 return 的 Promise 的状态，如果 return 一段字符串那么便是一个resolve 状态的 Promsie 对象。

### Q3. Promise 和 async 差异点是什么？

async 是 Generator 函数的语法糖，不同的是 Generator 函数是手动调用的，而 async 函数是 await 执行完之后才会自动执行下一个 await 前面的语句，无论 await 前面是异步方法还是同步方法。

await 后面可以跟很多值，如基本数据类型、（字符，数值，布尔等会被自动转换为立即 resolved 的 Promsie 对象）Promise 对象。

async 内部是异步执行的，无论 await 后面跟的是同步任务还是异步任务，最终 async 函数会返回一个 Promise 对象，所以async 函数可以看成是多个异步操作包装成的 Promise 对象，async 让 Promsie 的使用更顺滑。

如果我们要串行发送很多请求，在使用 Promise 的情况下非常麻烦的。如果使用 async 的话，我们只要使用一个 for...of 循环。async 函数在处理多个异步串行请求时更方便。

- async 函数本质可以看成是多个异步操作包装成的 Promise 对象
- async 函数在处理多个异步串行请求时更方便

### Q4. 给定一个 URL 数组，如何实现接口的继发和并发？

async 继发实现：
```js
// 继发一
async function loadData() {
  var res1 = await fetch(url1);
  var res2 = await fetch(url2);
  var res3 = await fetch(url3);
  return "whew all done";
}

// 继发二
async function loadData(urls) {
  for (const url of urls) {
    const response = await fetch(url);
    console.log(await response.text());
  }
}
```

async 并发实现：
```js
// 并发一
async function loadData() {
  var res = await Promise.all([fetch(url1), fetch(url2), fetch(url3)]);
  return "whew all done";
}

// 并发二
async function loadData(urls) {
  // 并发读取 url
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });

  // 按次序输出
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }
```
### Q5. try/catch 捕获多个错误并做不同的处理时，如何优化？

尽管我们可以使用 try catch 捕获错误，但是当我们需要捕获多个错误并做不同的处理时，很快 try catch 就会导致代码杂乱。

为了简化这种错误的捕获，我们可以给 await 后的 promise 对象添加 catch 函数，为此我们需要写一个 helper:

```js
// to.js
export default function to(promise) {
   return promise.then(data => {
      return [null, data];
   })
   .catch(err => [err]);
}


// 简化后
import to from './to.js';

async function asyncTask() {
     let err, user, savedTask;

     [err, user] = await to(UserModel.findById(1));
     if(!user) throw new CustomerError('No user found');

     [err, savedTask] = await to(TaskModel({userId: user.id, name: 'Demo Task'}));
     if(err) throw new CustomError('Error occurred while saving task');

    if(user.notificationsEnabled) {
       const [err] = await to(NotificationService.sendNotification(user.id, 'Task Created'));
       if (err) console.error('Just log the error and continue flow');
    }
}
```

::: warning 参考文献
[Promises/A+](https://promisesaplus.com/)

[30分钟，带你实现一个符合规范的 Promise])(https://segmentfault.com/a/1190000022561448)

[手写Promise全家桶+Generator+async/await](https://juejin.cn/post/6907673648216145928#heading-11)

[手写 Promise 全家桶 + Generator + async/await](https://mp.weixin.qq.com/s/wBnev5LhSL7qIGFjg8ZvrQ)

[手写 Promise 全家桶](https://github.com/Geekhyt/fe-interview/issues/1)

[Promise之你看得懂的Promise](https://juejin.cn/post/6844903629187448845#heading-3)

[来45道Promise面试题一次爽到底](https://juejin.cn/post/6844904077537574919)

[Promise灵魂十二问](https://mp.weixin.qq.com/s/yPRi3yjPoYE1XFFoc9IFOA)

[ECMAScript 6 入门 - Promise](https://es6.ruanyifeng.com/#docs/promise)

[手写async await的最简实现](https://juejin.cn/post/6844904102053281806#heading-5)

[ES6 系列之我们来聊聊 Async](https://github.com/mqyqingfeng/Blog/issues/100)
:::