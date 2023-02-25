# 异步实现

手撕模拟几种异步的实现：

- Promise
- Generator
- Async

## Promise

### Promise 简介

Promise 是一个对象，从它可以获取异步操作的消息。本质上 Promise 是一个函数返回的对象，我们可以在它上面绑定回调函数，这样我们就不需要在一开始把回调函数作为参数传入这个函数了。Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大

#### 2 个特点

- **对象的状态不受外界影响**。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。
- **一旦状态改变，就不会再变，任何时候都可以得到这个结果(状态不可逆)**。Promise 对象的状态改变，只有两种可能：从 pending 变为 fulfilled 和从 pending 变为 rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。如果改变已经发生了，你再对 Promise 对象添加回调函数，也会立即得到这个结果。**这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。**

#### 3 个状态

- pending（进行中/待定）: 初始状态，既没有被兑现，也没有被拒绝。在此状态下可以落定 (settled) 为 fulfilled 或 rejected 状态。
- fulfilled（已成功/已兑现）: 意味着操作成功完成。Promise 被 resolve 后的状态，状态不可再改变，且有一个私有的值 value。
- rejected（已失败/已拒绝）: 意味着操作失败。Promise 被 reject 后的状态，状态不可再改变，且有一个私有的原因 reason。

::: tip 注意
**value 和 reason 也是不可变的**，它们包含原始值或对象的不可修改的引用，默认值为 undefined
:::

![Promise](/blog/images/javascript/Promise2.png)

#### 3 大手段

Promise 利用 3 大手段解决回调地狱：

- 回调函数延时绑定
- 返回值穿透
- 错误冒泡

#### 4 个缺点

- **无法取消 Promise**。一旦新建它就会立即执行，无法中途取消。
- **错误被吃掉**。错误被吃掉**指 Promise 内部的错误不会影响到 Promise 外部的代码**。如果不设置回调函数，Promise 内部抛出的错误，不会反应到外部。这也是为什么一般推荐在 Promise 链的最后添加一个 catch 函数的原因。其实这并不是 Promise 独有的局限性，`try/catch` 也是这样，同样会捕获一个异常并简单的吃掉错误。不过，Node.js 有一个 `unhandledRejection` 事件，专门监听未捕获的 reject 错误。注意，Node 有计划在未来废除 `unhandledRejection` 事件。如果 Promise 内部有未捕获的错误，会直接终止进程，并且进程的退出码不为 0。
- **无法得知 pending 状态**。当处于 pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。
- **单一值**。Promise 只能有一个完成值或一个拒绝原因，当需要传递多个值时，构造成一个对象或数组，然后再传递，then 中获得这个值后，又会进行取值赋值的操作。

::: danger 注意
如果某些事件不断地反复发生，一般来说，使用 [Stream](https://nodejs.org/api/stream.html) 模式是比部署 Promise 更好的选择。
:::

#### 核心观点

Promsie 的核心观点是 **异步链式调用**。

```js
new myPromsie(resolve => {
  setTimeout(() => {
    resolve("1");
  }, 1000);
})
  .then(data => {
    console.log(data);
    return new myPromsie(resolve => {
      setTimeout(() => {
        resolve("2");
      }, 1000);
    });
  })
  .then(data => {
    console.log(data);
    return "3";
  })
  .then(data => {
    console.log(data);
  });
```

#### 构造方法

Promise()

```js
new Promise(executor)
new Promise(function(resolve, reject){...})
```

Promise 的参数 executor 是带有 resolve 和 reject 两个参数的函数。而这两个参数也是函数，由 JavaScript 引擎提供，不用开发者部署。

- Promise 构造函数执行时立即调用 executor 函数，resolve 和 reject 两个函数作为参数传入 executor （executor 函数会在 Promise 构造函数返回新建对象前被调用，Promise 新建后就会立即执行。）。
- executor 内部通常会执行一些异步操作，一旦完成，可以调用 resolve 函数来将 Promise 状态改成 Fulfilled，或者在发生错误时将它的状态改为 Rejected
- 无法取消 Promise，一旦新建它就会立即执行，**无法中途取消**
- **如果不设置回调函数（executor），Promise 内部抛出错误，不会反应到外部**
- 当处于 Pending 状态时，无法得知目前进展到哪一个阶段（**无法得知 pending 状态**）

```js
const promise = new Promise((resolve,reject) => {
  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
})

promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```

#### 静态方法

- Promise.all(iterable)：所有成功才成功，失败返回第一个失败。

  这个方法返回一个新的 promise 对象，该 promise 对象在 iterable 参数对象里所有的 promise 对象都成功的时候才会触发成功，一旦有任何一个 iterable 里面的 promise 对象失败则立即触发该 promise 对象的失败。如果这个新的 promise 对象触发了失败状态，它会把 iterable 里第一个触发失败的 promise 对象的错误信息作为它的失败错误信息。`Promise.all()` 方法接受一个数组作为参数，**数组元素都是 Promise 实例，如果不是，就会先调用 Promise.resolve 方法，将参数转为 Promise 实例**，再进一步处理。另外，`Promise.all()` 方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例。

  iterable 参数对象里所有的 promise 都执行成功时返回一个数组，数组中存放每个 promise 执行成功的结果，传递给新 promise 的回调函数。若有一个 promise 执行失败，此时第一个被 reject 的实例的返回值，传递给新 promise 的回调函数。**一般 Promise.all(iterable) 中的 promise 都是互相有关联的**。

- Promise.allSettled(iterable) ES2020：所有状态落定才返回，无论成功与失败。

  等到所有 promises 都已敲定（settled）（每个 promise 都已兑现（fulfilled）或已拒绝（rejected））。返回一个 promise，该 promise 在所有 promise 完成后完成。并带有一个对象数组，每个对象对应每个 promise 的结果。当您**有多个彼此不依赖的异步任务成功完成时，或者您总是想知道每个 promise 的结果时，通常使用它**。比之下，`Promise.all()` 更适合彼此相互依赖或者在其中任何一个 reject 时立即结束。

- Promise.any(iterable) ES2021：有一个成功即返回，所有失败才返回，与 all 相反。

  接收一个 Promise 对象的集合，当其中的一个 promise 成功，就返回那个成功的 promise 的值。有一个成功或就返回 ，所有失败后才返回失败。本质上，这个方法和 `Promise.all()` 是相反的。

- Promise.race(iterable)：任意失败或成功，返回第一个落定的，“跑的最快的”

  当 iterable 参数里的任意一个子 promise 被成功或失败后，父 promise 马上也会用子 promise 的成功返回值或失败详情作为参数调用父 promise 绑定的相应句柄，并返回该 promise 对象。率先改变状态的 Promise 实例返回，不论结果是否成功或失败。

- Promise.resolve(value)

  返回一个状态由给定 value 决定的 Promise 对象。有时需要**将现有对象转为 Promise 对象，`Promise.resolve()` 方法就起到这个作用**。从 Pending（待定） 变为 Fullfilled（实现），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去。该函数的参数除了正常的值以外，还可能是另一个 Promise 实例。**需要注意的是，立即 resolve()的 Promise 对象，是在本轮“事件循环”（event loop）的结束时执行，而不是在下一轮“事件循环”的开始时。**

- Promise.reject(reason)

  返回一个状态为失败的 Promise 对象。也会返回一个新的 Promise 实例，该实例的状态为 rejected。从 Pending（待定） 变为 Rejected（否决），在异步失败时调用，并将异步操作报出的错误，作为参数传递出去。该函数的参数通常是 Error 对象的实例，表示抛出的错误。

```js
const p1 = new Promise(function(resolve, reject) {
  // ...
});

const p2 = new Promise(function(resolve, reject) {
  // ...
  resolve(p1);
});
```

p1 和 p2 都是 Promise 的实例，但是 p2 的 resolve 方法将 p1 作为参数，即一个异步操作的结果是返回另一个异步操作。注意，**这时 p1 的状态就会传递给 p2，也就是说，p1 的状态决定了 p2 的状态**。如果 p1 的状态是 pending，那么 p2 的回调函数就会等待 p1 的状态改变；如果 p1 的状态已经是 resolved 或者 rejected，那么 p2 的回调函数将会立刻执行。

```js
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
}).then(r => {
  console.log(r);
});
// 2
// 1
```

**调用 resolve 或 reject 并不会终结 Promise 的参数函数的执行**。上面代码中，调用 `resolve(1)` 以后，后面的 `console.log(2)` 还是会执行，并且会首先打印出来。这是因为**立即 resolved 的 Promise 是在本轮事件循环的末尾执行，总是晚于本轮循环的同步任务**。**本轮同步任务(宏任务) 执行完才去执行异步微任务**。

```js
new Promise((resolve, reject) => {
  return resolve(1);
  // 后面的语句不会执行
  console.log(2);
});
```

一般来说，调用 resolve 或 reject 以后，Promise 的使命就完成了，后继操作应该放到 then 方法里面，而不应该直接写在 resolve 或 reject 的后面。所以，最好在它们前面加上 return 语句，**return 后面的语句不会执行**，这样就不会有意外。

```js
const p = Promise.resolve("Hello");

p.then(function(s) {
  console.log(s);
});
// Hello
```

`Promise.resolve()` 方法会将这个对象转为 Promise 对象，然后就立即执行 thenable 对象的 `then()` 方法。上面代码生成一个新的 Promise 对象的实例 p。由于字符串 Hello 不属于异步操作（判断方法是字符串对象不具有 then 方法），返回 Promise 实例的状态从一生成就是 resolved，所以回调函数会立即执行。`Promise.resolve()` 方法的参数，会同时传给回调函数。

```js
setTimeout(function() {
  console.log("three");
}, 0);

Promise.resolve().then(function() {
  console.log("two");
});

console.log("one");

// one
// two
// three
```

**需要注意的是，立即 `resolve()` 的 Promise 对象，是在本轮“事件循环”（event loop）的结束时执行，而不是在下一轮“事件循环”的开始时**。上面代码中， `setTimeout(fn, 0)` 在下一轮“事件循环”开始时执行，`Promise.resolve()` 在本轮“事件循环”结束时执行，`console.log('one')` 则是立即执行，因此最先输出。

#### Promise 原型

- Promise.prototype.then(onFulfilled, onRejected)

  - then 方法接受两个函数作为参数，且参数可选
  - 如果可选**参数不为函数时会被忽略**
  - 两个函数都是异步执行，会放入事件队列等待下一轮 tick
  - then 函数的返回值为 Promise
  - then 可以被同一个 Promise 多次调用

  它的作用是为 Promise 实例添加状态改变时的回调函数。添加解决(fulfillment)和拒绝(rejection)回调到当前 promise, 返回一个新的 promise, 将以回调的返回值来 resolve。then 方法的第一个参数是 resolved 状态的回调函数，第二个参数是 rejected 状态的回调函数，它们都是可选的。

- Promise.prototype.catch(onRejected)

  添加一个拒绝(rejection) 回调到当前 promise, 返回一个新的 promise。当这个回调函数被调用，新 promise 将以它的返回值来 resolve，否则如果当前 promise 进入 fulfilled 状态，则以当前 promise 的完成结果作为新 promise 的完成结果.

- Promise.prototype.finally(onFinally) ES2018

  添加一个事件处理回调于当前 promise 对象，并且在原 promise 对象解析完毕后，返回一个新的 promise 对象。回调会在当前 promise 运行完毕后被调用，无论当前 promise 的状态是完成(fulfilled)还是失败(rejected)。`finally()` 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。finally 方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。

```js
p.then(val => console.log("fulfilled:", val)).catch(err =>
  console.log("rejected", err)
);

// 等同于
p.then(val => console.log("fulfilled:", val)).then(null, err =>
  console.log("rejected:", err)
);

const promise = new Promise(function(resolve, reject) {
  try {
    throw new Error("test");
  } catch (e) {
    reject(e);
  }
});
promise.catch(function(error) {
  console.log(error);
});

// 等同于
const promise = new Promise(function(resolve, reject) {
  reject(new Error("test"));
});
promise.catch(function(error) {
  console.log(error);
});
```

如果该对象状态变为 resolved，则会调用 `then()` 方法指定的回调函数；如果异步操作抛出错误，状态就会变为 rejected，就会调用 `catch()` 方法指定的回调函数，处理这个错误。另外，`then()` 方法指定的回调函数，如果运行中抛出错误，也会被 `catch()` 方法捕获。如果 Promise 状态已经变成 resolved，再抛出错误是无效的。**一般来说，不要在 `then()` 方法里面定义 Reject 状态的回调函数（即 then 的第二个参数），总是使用 catch 方法。**

```js
const promise = new Promise(function(resolve, reject) {
  resolve("ok");
  setTimeout(function() {
    throw new Error("test");
  }, 0);
});
promise.then(function(value) {
  console.log(value);
});
// ok
// Uncaught Error: test
```

上面代码中，Promise 指定在下一轮“事件循环”再抛出错误。到了那个时候，Promise 的运行已经结束了，所以这个错误是在 Promise 函数体外抛出的，会冒泡到最外层，成了未捕获的错误。一般总是建议，Promise 对象后面要跟 `catch()` 方法，这样可以处理 Promise 内部发生的错误。`catch()` 方法返回的还是一个 Promise 对象，因此后面还可以接着调用 `then()` 方法。

#### 串行与并行

- 串行：一个异步请求完了之后在进行下一个请求
- 并行：多个异步请求同时进行

### Promise/A+ 规范

![PromiseA+ 规范](/blog/images/javascript/promiseA.png)

### 手撕 Peomise 全家桶

Promise 的简单实现

```js
// 定义Promise的 3 种状态
var PENDING = "pending";
var FULFILLED = "fulfilled";
var REJECTED = "rejected";

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
    typeof onFulfilled === "function"
      ? onFulfilled
      : function(x) {
          return x;
        };
  onRejected =
    typeof onRejected === "function"
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
    return reject(new TypeError("x 不能与 promise 相等"));
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
  } else if (x !== null && (typeof x === "object" || typeof x === "function")) {
    var executed;
    try {
      var then = x.then;
      if (typeof then === "function") {
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
      reject
    };
  }
};

// 静态方法 resolve
Promise.resolve = function(value) {
  if (value instanceof Promise) {
    return value; // 如果是Promise实例直接返回
  }

  return new Promise(function(resolve, reject) {
    resolve(value);
  });
};

// 静态方法 reject
Promise.reject = function(reason) {
  return new Promise(function(resolve, reject) {
    reject(reason);
  });
};

// 原型属性(方法) catch
Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

// 原型属性(方法) finally
Promise.prototype.finally = function(fn) {
  return this.then(
    function(value) {
      return Promise.resolve(fn()).then(function() {
        return value;
      });
    },
    function(error) {
      return Promise.resolve(fn()).then(function() {
        throw error;
      });
    }
  );
};

// 静态方法 all
Promise.all = function(promiseArr) {
  return new Promise(function(resolve, reject) {
    const length = promiseArr.length;
    const result = [];
    let count = 0;
    if (length === 0) {
      return resolve(result);
    }
    // promiseArr 不一定是数组，可以是任何迭代器，所以用for...of更好
    for (let [i, p] of promiseArr.entries()) {
      // 这里不直接promiseArr[i].then是为了防止传入的不是Promsie对象的情况
      Promise.resolve(p).then(
        function(data) {
          result[i] = data;
          count++;
          if (count === length) {
            resolve(result);
          }
        },
        function(reason) {
          reject(reason);
        }
      );
    }
  });
};

// 静态方法 race
Promise.race = function(promiseArr) {
  return new Promise(function(resolve, reject) {
    const length = promiseArr.length;
    if (length === 0) {
      return resolve();
    }

    for (let item of promiseArr) {
      Promise.resolve(item).then(
        function(value) {
          return resolve(value);
        },
        function(reason) {
          return reject(reason);
        }
      );
    }
  });
};

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
      Promise.resolve(p).then(
        value => {
          return resolve(value);
        },
        reason => {
          result[i] = reason;
          count++;
          if (count === length) {
            reject(result);
          }
        }
      );
    }
  });
};

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
        Promise.resolve(p).then(
          value => {
            result[i] = { status: "fulfilled", value: value };
            count++;
            if (count === length) {
              return resolve(result);
            }
          },
          reason => {
            result[i] = { status: "rejected", reason: reason };
            count++;
            if (count === length) {
              return resolve(result);
            }
          }
        );
      }
    }
  });
};

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
      promiseArr[i]
        .then(
          value => {
            result[i] = { status: "fulfilled", value: value };
          },
          reason => {
            result[i] = { status: "rejected", reason: reason };
          }
        )
        .finally(() => {
          if (!--count) {
            resolve(result);
          }
        });
    }
  });
};

// 使用 Promise.all 实现 Promise.allSettled
Promise.allSettled = function(promises) {
  // 也可以使用扩展运算符将 Iterator 转换成数组
  // const promiseArr = [...promises];
  const promiseArr = Array.from(promises);
  return Promise.all(
    promiseArr.map(p =>
      Promise.resolve(p).then(
        res => {
          return { status: "fulfilled", value: res };
        },
        error => {
          return { status: "rejected", reason: error };
        }
      )
    )
  );
};
```

### 实现并行限制的 Promise 调度器

实现有并行限制的 Promise 调度器问题。一个任务并发控制器，要求每次都有两个任务在执行：

```js
class Scheduler {
  constructor() {
    this.queue = []; // 任务队列
    this.maxCount = 2; // 最大并行数
    this.runCounts = 0; // 跑了几个任务了
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
    // 不同情况要改造
    this.queue
      .shift()()
      .then(() => {
        this.runCounts--; // 这里 this.queue.shift() 和 !this.queue || !this.queue.length 可以用这种办法
        this.request();
      });
  }
}

const timeout = time =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });

const scheduler = new Scheduler();

const addTask = (time, order) => {
  scheduler.add(() => {
    return timeout(time).then(() => {
      console.log(order);
    });
  });
};
addTask(1000, "1");
addTask(500, "2");
addTask(300, "3");
addTask(400, "4");
scheduler.taskStart();
// 2
// 3
// 1
// 4
```

### 实现 Ajax 并发请求控制

实现一个批量请求函数 multiRequest(urls, maxNum, callback)，要求如下：

- 要求最大并发数 maxNum
- 每当有一个请求返回，就留下一个空位，可以增加新的请求
- 所有请求完成后，结果按照 urls 里面的顺序依次打出
- multiRequest 可以返回一个 promise 或者 直接执行 callback 回调

```js
function multiRequest(urls = [], maxNum, callback) {
  const len = urls.length;
  const result = new Array(len).fill(false);
  let runCount = 0;
  return new Promise((resolve, reject) => {
    // 最多同时发送maxNum个请求
    while (runCount < maxNum) {
      sendRequest();
    }
    function sendRequest() {
      let curCount = runCount; // curCount 从 0 开始是 urls 的下标
      runCount++;
      if (runCount >= len) {
        callback(result); // 可以执行回调
        resolve(result); // 也可以返回一个新 promise
        return
      }
      console.log(`开始发送第 ${curCount} 个请求`);
      let curUrl = urls[curCount];
      fetch(curUrl)
        .then(value => {
          console.log(`第 ${curCount} 个请求：${value} 成功了！`);
          result[curCount] = `${value} 成功`;
        })
        .catch(reason => {
          console.log(`第 ${curCount} 个请求：${reason} 失败了！`);
          result[curCount] = `${reason} 失败`;
        })
        .finally(() => {
          if (runCount < len) {
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
  const promise = new Promise(function(resolve, reject) {
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

getJSON("/posts.json").then(
  function(json) {
    console.log("Contents: " + json);
  },
  function(error) {
    console.error("出错了", error);
  }
);
```

## Generator

### 基本概念

Generator 函数是一个状态机，封装了多个内部状态。执行 Generator 函数会**返回一个遍历器对象**。也就是说，Generator 函数除了状态机，还是一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。

Generator 函数是一个普通函数，但是有两个特征：

- function 关键字与函数名之间有一个星号(`*`)；
- 函数体内部使用 yield 表达式，定义不同的内部状态（yield 在英语里的意思就是“产出”）

Generator 函数的调用方法与普通函数一样，也是在函数名后面加上一对圆括号。不同的是，调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，也就是遍历器对象（Iterator Object）。

必须调用遍历器对象的 next 方法，使得指针移向下一个状态。换言之，Generator 函数是分段执行的，yield 表达式是暂停执行的标记，而 next 方法可以恢复执行。因此等于为 JavaScript 提供了手动的“惰性求值”（Lazy Evaluation）的语法功能。

::: tip 小结 Generator 基本概念

- 状态机，封装了多个内部状态；
- 返回一个遍历器对象，通过改对象可以一次遍历 Generator 函数内部的每一个状态
- 带 `*` 号，yeild 表达式定义不同的内部状态；
- 调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，也就是遍历器对象；
- Generator 函数是分段执行的，**yield 表达式是暂停执行的标记，而 next 方法可以恢复执行**
  :::

### yield 与 next

#### yield

yield 表达式只能用在 Generator 函数里面，用在其他地方都会报错。yield 表达式本身没有返回值，或者说总是返回 undefined。next 方法可以带一个参数，该参数就会被当作上一个 yield 表达式的返回值。

yield 表达式与 return 语句既有相似之处，也有区别。相似之处在于，都能返回紧跟在语句后面的那个表达式的值。区别在于**每次遇到 yield，函数暂停执行**，下一次再从该位置继续向后执行，**而 return 语句不具备位置记忆的功能**。一个函数里面，只能执行一次（或者说一个）return 语句，但是可以执行多次（或者说多个）yield 表达式。正常函数只能返回一个值，因为只能执行一次 return。

#### next

`next()` 方法返回值：`{ value: undefined, done: true/false }`

通过 next 方法的参数，就有办法在 Generator 函数开始运行之后，继续向函数体内部注入值(第二次传参)。也就是说，可以在 Generator 函数运行的不同阶段，从外部向内部注入不同的值，从而调整函数行为。

由于 next 方法的参数表示上一个 yield 表达式的返回值，所以在第一次使用 next 方法时，传递参数是无效的。V8 引擎直接忽略第一次使用 next 方法时的参数，只有从第二次使用 next 方法开始，参数才是有效的。**从语义上讲，第一个 next 方法用来启动遍历器对象，所以不用带有参数**。

遍历器对象的 next 方法的运行逻辑如下：

- （1）遇到 yield 表达式，就暂停执行后面的操作，并将紧跟在 yield 后面的那个表达式的值，作为返回的对象的 value 属性值。

- （2）下一次调用 next 方法时，再继续往下执行，直到遇到下一个 yield 表达式。

- （3）如果没有再遇到新的 yield 表达式，就一直运行到函数结束，直到 return 语句为止，并将 return 语句后面的表达式的值，作为返回的对象的 value 属性值。

- （4）如果该函数没有 return 语句，则返回的对象的 value 属性值为 undefined。

### 与 Iterator 接口的关系

任意一个对象的 `Symbol.iterator` 方法，等于该对象的遍历器生成函数，调用该函数会返回该对象的一个遍历器对象。

由于 Generator 函数就是遍历器生成函数，因此可以把 Generator 赋值给对象的 `Symbol.iterator` 属性，从而使得该对象具有 Iterator 接口。

```js
var myIterable = {};
myIterable[Symbol.iterator] = function*() {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable]; // [1, 2, 3]
```

### Generator 原型上的方法

#### Generator.prototype.throw()

Generator 函数返回的遍历器对象，都有一个 throw 方法，可以在函数体外抛出错误，然后在 Generator 函数体内捕获。throw 方法可以接受一个参数，该参数会被 catch 语句接收，建议抛出 Error 对象的实例。如果 Generator 函数内部没有部署 `try...catch` 代码块，那么 throw 方法抛出的错误，将被外部 `try...catch` 代码块捕获。

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
var fetch = require("node-fetch");

function* gen() {
  var r1 = yield fetch("https://api.github.com/users/github");
  var r2 = yield fetch("https://api.github.com/users/github/followers");
  var r3 = yield fetch("https://api.github.com/users/github/repos");
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
    result.value
      .then(function(data) {
        return data.json();
      })
      .then(function(data) {
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
      };
    }
  };
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

**async/await 做的事情就是将 Generator 函数转换成 Promise，说白了，async 函数就是 Generator 函数的语法糖，await 命令就是内部 then 命令的语法糖**。async 函数就是将 Generator 函数的星号（`*`）替换成 async，将 yield 替换成 await，仅此而已。其实 async 函数的实现原理，就是将 Generator 函数和自动执行器(比如 co)，包装在一个函数里。

async 函数内部 return 语句返回的值，会成为 then 方法回调函数的参数。

async 函数内部抛出错误，会导致返回的 Promise 对象变为 reject 状态。抛出的错误对象会被 catch 方法回调函数接收到。

async 是一种语法，Promise 是一个内置对象，两者并不具备可比性，更何况 async 函数也返回一个 Promise 对象。

### 手撕 async/await

async/await 的简单实现

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
          return Promise.resolve(value).then(
            function(value) {
              step("next", value);
            },
            function(err) {
              step("throw", err);
            }
          );
        }
      }
      return step("next");
    });
  };
}
```

## 问题

### Q1. 为什么 Promsie 要引入微任务?

因为同步任务和宏任务都不行。

- 同步任务：难道代码执行一半去发送一个 Ajax 请求然后等待响应吗？
- 宏任务：我们知道发送 Ajax，操作 DOM，定时器都属于宏任务，假设此时我们增加了 100 个 DOM 难道等待 DOM 操作完成之后我们再来发送下一个 Ajax 请求（异步链式调用情况）？

### Q2. new Promise() 返回的实例和实例 then 方法执行后返回的 promise 是一个吗?

实例 then 返回的是一个新的 Promise 对象，这个新 Promsie 的状态由 then 中的返回值决定，如果 then 内部 return 一个 Promsie 对象，那么返回的 Promsie 对象状态便是 return 的 Promise 的状态，如果 return 一段字符串那么便是一个 resolve 状态的 Promsie 对象。

### Q3. Promise 和 async 差异点是什么？

async 是 Generator 函数的语法糖，不同的是 Generator 函数是手动调用的，而 async 函数是 await 执行完之后才会自动执行下一个 await 前面的语句，无论 await 前面是异步方法还是同步方法。

await 后面可以跟很多值，如基本数据类型、（字符，数值，布尔等会被自动转换为立即 resolved 的 Promsie 对象）Promise 对象。

async 内部是异步执行的，无论 await 后面跟的是同步任务还是异步任务，最终 async 函数会返回一个 Promise 对象，所以 async 函数可以看成是多个异步操作包装成的 Promise 对象，async 让 Promsie 的使用更顺滑。

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

尽管我们可以使用 try catch 捕获错误，但是当我们需要捕获多个错误并做不同的处理时，很快 `try catch` 就会导致代码杂乱。

为了简化这种错误的捕获，我们可以给 await 后的 promise 对象添加 catch 函数，为此我们需要写一个 helper:

```js
// to.js
export default function to(promise) {
  return promise
    .then(data => {
      return [null, data];
    })
    .catch(err => [err]);
}

// 简化后
import to from "./to.js";

async function asyncTask() {
  let err, user, savedTask;

  [err, user] = await to(UserModel.findById(1));
  if (!user) throw new CustomerError("No user found");

  [err, savedTask] = await to(
    TaskModel({ userId: user.id, name: "Demo Task" })
  );
  if (err) throw new CustomError("Error occurred while saving task");

  if (user.notificationsEnabled) {
    const [err] = await to(
      NotificationService.sendNotification(user.id, "Task Created")
    );
    if (err) console.error("Just log the error and continue flow");
  }
}
```

::: warning 参考文献
[Promises/A+](https://promisesaplus.com/)

[30 分钟，带你实现一个符合规范的 Promise](https://segmentfault.com/a/1190000022561448)

[手写 Promise 全家桶+Generator+async/await](https://juejin.cn/post/6907673648216145928#heading-11)

[手写 Promise 全家桶 + Generator + async/await](https://mp.weixin.qq.com/s/wBnev5LhSL7qIGFjg8ZvrQ)

[手写 Promise 全家桶](https://github.com/Geekhyt/fe-interview/issues/1)

[Promise 之你看得懂的 Promise](https://juejin.cn/post/6844903629187448845#heading-3)

[来 45 道 Promise 面试题一次爽到底](https://juejin.cn/post/6844904077537574919)

[Promise 灵魂十二问](https://mp.weixin.qq.com/s/yPRi3yjPoYE1XFFoc9IFOA)

[ECMAScript 6 入门 - Promise](https://es6.ruanyifeng.com/#docs/promise)

[手写 async await 的最简实现](https://juejin.cn/post/6844904102053281806#heading-5)

[ES6 系列之我们来聊聊 Async](https://github.com/mqyqingfeng/Blog/issues/100)
:::
