# 微前端的沙箱设计

随着微前端的不断发展、被更多的团队采用，越来越多开始对沙箱这个概念有所了解。沙箱，即 sandbox，意指一个允许你独立运行程序的虚拟环境，沙箱可以隔离当前执行的环境作用域和外部的其他作用域，外界无法修改该环境内任何信息，沙箱内的东西单独运行，环境间相互不受影响。

只要遇到不可信的第三方代码，我们就可以使用沙箱将代码进行隔离，从而保障外部程序的稳定运行。如果不做任何处理地执行不可信代码，在前端中最直观的副作用/危害就是污染、篡改全局 `window` 状态，影响主页面功能甚至被 XSS 攻击。

要实现一个 JavaScript 沙箱，可以有很多种分类方式，比如按照具体的实现方式来区分，就至少包含如下：

- 基于 with + eval/ new Function 的简单实现

- 基于 Proxy 快照存储 + window 修改的实现
- 基于 Proxy 代理拦截 + window 激活/卸载的实现
- 基于普通对象快照存储的 window 属性 diff 实现
- 基于 iframe + 消息通信的实现
- 基于 ShadowRealm 提案的实现

而纵观各类技术方案，有一个大前提决定了沙箱如何做：

- 单实例：同一个时刻只有一个微应用实例存在，此刻浏览器所有浏览器资源都是这个应用独占的，方案要解决的很大程度是**应用切换的时候的清理和现场恢复**。比较轻量，实现起来也简单。

- 多实例：资源不是应用独占，就要**解决资源共享的情况**，比如路由，样式，全局变量读写，DOM，可能需要考虑的情况比较多，实现较为复杂。

## JS 简单沙箱

### eval

程序中访问的**所有变量均来自可靠或自主实现的上下文环境而不会从全局的执行环境中取值，** 那么要实现变量的访问均来自一个可靠上下文环境，我们需要为待执行程序构造一个作用域。**`eval()`** 函数会将传入的字符串当做 JavaScript 代码进行执行。

```js
// 执行上下文对象
const ctx = {
    func: variable => {
        console.log(variable)
    },
    foo: 'foo'
}
// 最简陋的沙箱
function poorestSandbox(code, ctx) {
    eval(code) // 为执行程序构造了一个函数作用域
}
// 待执行程序
const code = `
    ctx.foo = 'bar'
    ctx.func(ctx.foo)
`
poorestSandbox(code, ctx) // bar
```

这样的一个沙箱要求源程序在获取任意变量时都要加上执行上下文对象的前缀，这显然是非常不合理的，因为我们没有办法控制第三方的行为，是否有办法去掉这个前缀呢？

### with

`with` 会在作用域链的顶端添加一个新的作用域，该作用域的变量对象会加入 `with` 传入的对象，因此相较于外部环境其内部的代码在查找变量时会优先在该对象上进行查找。

**with 对于沙箱的意义**：可以实现所有变量均来自可靠或自主实现的上下文环境，而不会从全局的执行环境中取值，相当于做了一层拦截，实现隔离的效果

```js
// 定义全局变量foo
var foo = "foo1";
// 执行上下文对象
const ctx = {
  func: variable => {
    console.log(variable);
  },
  foo: "f1"
};
// 非常简陋的沙箱
function veryPoorSandbox(code, ctx) {
  // 使用 with，将 eval 函数执行时的执行上下文指定为 ctx
  with (ctx) {
    // eval 可以将字符串按 js 代码执行，如 eval('1+2')
    eval(code);
  }
}
// 待执行程序
const code = `func(foo)`;
veryPoorSandbox(code, ctx); // 打印结果："f1"，不是最外层的全局变量"foo1"
```

这样一来就实现了执行程序中的变量在沙箱提供的上下文环境中查找先于外部执行环境的效果。但这个沙箱有一个明显的问题，若提供的 ctx 上下文对象中，没有找到某个变量时，代码仍会沿着作用域链一层层向上查找。

我们**希望沙箱中的代码只在手动提供的上下文对象中查找变量，如果上下文对象中不存在该变量则直接报错或返回** `undefined`

### with + Proxy

`Proxy` 中的 `get` 和 `set` 方法只能拦截已存在于代理对象中的属性，对于代理对象中不存在的属性这两个钩子是无感知的。因此这里我们使用 `Proxy.has()` 来拦截 `with` 代码块中的任意变量的访问，并设置一个白名单，在白名单内的变量可以正常走作用域链的访问方式，不在白名单内的变量会继续判断是否存在沙箱自行维护的上下文对象中，存在则正常访问，不存在则直接报错。实现步骤如下：

- 使用 `Proxy.has()` 来拦截 with 代码块中的任意变量的访问
- 设置一个白名单，在白名单内的变量可以正常走作用域链的访问方式，不在白名单内的变量，会继续判断是否存 ctx 对象中，存在则正常访问，不存在则直接报错
- 使用`new Function`替代eval，使用 `new Function()` 运行代码比 `eval` 更为好一些，函数的参数提供了清晰的接口来运行代码

```js
// 构造一个 with 来包裹需要执行的代码，返回 with 代码块的一个函数实例
function withedYourCode(code) {
  code = "with(shadow) {" + code + "}";
  return new Function("shadow", code);
}

// 可访问全局作用域的白名单列表
const access_white_list = ["func"];

// 待执行程序
const code = `func(foo)`;

// 执行上下文对象的代理对象
const ctxProxy = new Proxy(ctx, {
  has: (target, prop) => {
    // has 可以拦截 with 代码块中任意属性的访问
    if (access_white_list.includes(prop)) {
      // 在可访问的白名单内，可继续向上查找
      return target.hasOwnProperty(prop);
    }
    if (!target.hasOwnProperty(prop)) {
      throw new Error(`Not found - ${prop}!`);
    }
    return true;
  }
});

// 没那么简陋的沙箱
function littlePoorSandbox(code, ctx) {
  // 将 this 指向手动构造的全局代理对象
  withedYourCode(code).call(ctx, ctx); 
}
littlePoorSandbox(code, ctxProxy);
// 执行 func(foo)，报错：Uncaught Error: Not found - foo!
```

到这一步，其实很多较为简单的场景就可以覆盖了（eg: Vue 的模板字符串），那如果想要实现 **CodeSanbox**这样的 web 编辑器呢？在这样的编辑器中我们可以任意使用诸如 `document`、`location` 等全局变量且不会影响主页面。从而又衍生出另一个问题——如何让子程序**使用所有全局对象的同时不影响外部的全局状态**呢？

## 基于 Proxy 的代理沙箱

既然 Proxy 可以用于代理对象，那么我们同样可以用其代理 window。无数的 API 也同样挂靠在 window 上，要达到允许独立运行的微前端环境，首先需要 window 隔开。

在采用 Proxy 作为沙箱机制方案时，主要还是基于 get、set、has、getOwnPropertyDescriptor 等关键拦截器对 window 进行代理拦。为了让沙箱的代理拦截完备，除了 window 外，我们通常都需要关注几方面，比如一些难以代理（或者说没必要代理）的 Web API，如 Array、Number、Promise 等，此外还需要保证通过 with、eval、new Function 等方式执行的代码作用域不会逃逸，动态加载的 JavaScript 代码也算一个。

谈到这里，我们首先看看通过 Proxy 进行属性查找时的一些处理逻辑。除了在拦截器中进行一些常规的无需拦截 case 判断外，还需要对 `Symbol.unscopables` 属性 get 拦截器的返回值做些定义，以方便 with 等方式下代码的执行作用域正常处理。

`Symbol.unscopables` 属性，指用于指定对象值，其对象自身和继承的从关联对象的 with 环境绑定中排除的属性名称。当我们在 unscopables 对象上将属性设置为 true，将使其 unscopable 并且因此该属性也将不会在词法环境变量中出现。

```js
const object1 = {
  property1: 42
};

object1[Symbol.unscopables] = {
  property1: true
};

with (object1) {
  console.log(property1);
  // expected output: Error: property1 is not defined
}
```

以 qiankun 实现为例，一共存在三类沙箱，基于 Proxy 实现方式不同以及是否支持多实例，可以分为两类：

- 支持子应用单实例沙箱（LegacySandbox）
- 支持子应用多实例沙箱（ProxySandbox）

### 单实例代理沙箱

LegacySandbox 的思路在于虽然建立了沙箱代理，但在子应用运行过程中，所有的赋值仍旧会直接操作 window 对象，代理所做的事情就是记录变化（形成快照）；而针对激活和卸载，沙箱会在激活时还原子应用的状态，而卸载时还原主应用的状态，以此达到沙箱隔离的目的。

`legacySandbox`设置了三个参数来记录全局变量，分别是

- 记录沙箱**新增**的全局变量 Map：`addedPropsMapInSandbox`
- 记录沙箱**修改/更新**的全局变量 Map： `modifiedPropsOriginalValueMapInSandbox`
- **持续记录新增和修改/更新**的全局变量的 Map：用于在任意时刻做 snapshot 的 `currentUpdatedPropsValueMap`。

伪代码实现：

```js
// 修改window属性的公共方法
const updateWindowProp = (prop, value, isDel) => {
    if (value === undefined || isDel) {
        delete window[prop];
    } else {
        window[prop] = value;
    }
}
// 单实例代理沙箱
class ProxySandbox {
        constructor(name) {
        this.name = name;
        this.proxy = null;
        // 存放新增的全局变量
        this.addedPropsMap  = new Map(); 
        // 存放沙箱期间更新的全局变量
        this.modifiedPropsMap = new Map();
        // 存在新增和修改的全局变量，在沙箱激活的时候使用
        this.currentUpdatedPropsValueMap = new Map();
        const { addedPropsMap, currentUpdatedPropsValueMap, modifiedPropsMap } = this;
          // proxy 代理 window     
        const fakeWindow = Object.create(null);   
        const proxy = new Proxy(fakeWindow, {
            set(target, prop, value) {
                if (!window.hasOwnProperty(prop)) {
                    // 如果 window 上没有的属性，记录到新增属性里
                    // debugger;
                    addedPropsMap.set(prop, value);
                } else if (!modifiedPropsMap.has(prop)) {
                    // 如果当前 window 对象有该属性，且未更新过，则记录该属性在 window 上的初始值
                    const originalValue = window[prop];
                    modifiedPropsMap.set(prop, originalValue);
                }
                // 记录修改属性以及修改后的值
                currentUpdatedPropsValueMap.set(prop, value);
                // 设置值到全局window上
                updateWindowProp(prop, value);
                return true;
            },
            get(target, prop) {
                return window[prop];
            },
        });
        this.proxy = proxy;
    }
    // 沙箱激活时
    // 通过曾经记录好的更新过的全局变量 `currentUpdatedPropsValueMap`（也可以称为快照）
    // 还原子应用所需要的沙箱环境（即上下文）
    active() {
        // 根据记录还原沙箱
        this.currentUpdatedPropsValueMap.forEach((v, p) => updateWindowProp(p, v));
    }
    // 沙箱卸载时
    // 1. 将子应用运行时修改过的全局变量还原
    // 2. 删除子应用运行时新增的全局变量
    inactive() {
        // 1 将沙箱期间修改的属性还原为原先的属性
        this.modifiedPropsMap.forEach((v, p) => updateWindowProp(p, v));
        // 2 将沙箱期间新增的全局变量消除
        this.addedPropsMap.forEach((_, p) => updateWindowProp(p, undefined, true));
    }
}


const newSandBox = new ProxySandbox('代理沙箱');
const proxyWindow = newSandBox.proxy;
proxyWindow.a = '1'
console.log('开启沙箱：', proxyWindow.a, window.a);
newSandBox.inactive(); //失活沙箱
console.log('失活沙箱：', proxyWindow.a, window.a);
newSandBox.active(); //失活沙箱
console.log('重新激活沙箱：', proxyWindow.a, window.a);
```

qiankun 微前端 **legacySandbox** 单例代理沙箱流程图：

![micro12](/blog/images/architecture/micro12.png)

**优劣势**：这种方式同一时刻只能有一个激活的沙箱，否则全局对象上的变量会有两个以上的沙箱更新，同样会对window造成污染， 造成全局变量冲突。但是性能比快照沙箱（diff）好，不用遍历 window 对象。

LegacySandbox 由于会修改 window 对象，在多个实例运行时肯定会存在冲突，因此，该沙箱模式只能在单实例场景下使用。

### 多实例代理沙箱

在单实例中，proxy 代理的 `fakeWindow` 是一个空的对象，其没有任何储存变量的功能，子应用创建的变量最终实际都是挂载在 `window` 上的，这就限制了同一时刻不能有两个激活的子应用。

ProxySandbox 的方案是同时用 Proxy 给子应用运行环境做了 get 与 set 拦截。沙箱在初始构造时建立一个状态池，当应用操作 window 时，赋值通过 set 拦截器将变量写入状态池，而取值也是从状态池中优先寻找对应属性。由于状态池与子应用绑定，那么运行多个子应用，便可以产生多个相互独立的沙箱环境。

由于取值赋值均在建立的状态池上操作，因此，在第一种沙箱环境下激活和卸载需要做的工作，这里也就不需要了。激活沙箱后，每次对`window`取值的时候，先从自己沙箱环境的`fakeWindow`里面找，如果不存在，就从`rawWindow`(外部的`window`)里去找；当对沙箱内部的`window`对象赋值的时候，会直接操作`fakeWindow`，而不会影响到`rawWindow`。

伪代码

```js
 class ProxySandbox {
    constructor() {
      const rawWindow = window;
      const fakeWindow = {};
      const proxy = new Proxy(fakeWindow, {
        set: (target, prop, value) => {
          if(this.sandboxRunning) {
            target[prop] = value;
            return true;
          }
        },
        get: (target, prop) => {
          // 如果 fakeWindow 里面有，就从 fakeWindow 里面取，否则，就从外部的 window 里面取
          let value = prop in target ? target[prop] : rawWindow[prop];
          return value
        }
      })
      this.proxy = proxy;
    }
    // 沙箱激活时
    active() {
      this.sandboxRunning = true;
    }
    // 沙箱卸载时 
    inactive() {
      this.sandboxRunning = false;
    } 
}
```

qiankun 微前端 **ProxySandbox** 单例代理沙箱流程图：

![micro13](/blog/images/architecture/micro13.png)

ProxySandbox 不会污染全局window，支持多个子应用同时加载。

## 基于 diff 的快照沙箱

由于 Proxy 为 ES6 引入的 API，在不支持 ES6 的环境下，我们可以通过一类原始的方式来实现所要的沙箱，即在应用运行的时候保存一个快照 window 对象，将当前 window 对象的全部属性都复制到快照对象上，子应用卸载的时候将 window 对象修改做个 diff，将不同的属性用个 `modifyMap` 保存起来，再次挂载的时候再加上这些修改的属性。在 qiankun 中也有该降级方案，被称为 SnapshotSandbox。

这类方案的主要思路与 LegacySandbox 有些类似，同样主要分为激活与卸载两个部分的操作。

- 在激活时首先将 window 属性遍历存储起来（作为还原 window 所需的快照），然后在 window 上恢复子应用所需的属性变更，直接修改 window 对象
- 卸载时，将此时 window 上所包含的属性遍历存储起来（作为以后还原子应用所需的快照），然后从先前保存的 window 对象中将环境恢复。

```js
// 伪代码
class SnapshotSandbox {
  constructor(name) {
    this.name = name;
    this.modifyMap = {}; // 存放修改的属性
    this.windowSnapshot = {};
  }
  // 沙箱激活时  
  active() {
    // 缓存active状态的沙箱
    this.windowSnapshot = {};
    for (const item in window) {
      this.windowSnapshot[item] = window[item];
    }

    Object.keys(this.modifyMap).forEach(p => {
      window[p] = this.modifyMap[p];
    })

  } 
  // 沙箱卸载时  
  inactive() {
    for (const item in window) {
      if (this.windowSnapshot[item] !== window[item]) {
        // 记录变更
        this.modifyMap[item] = window[item];
        // 还原window
        window[item] = this.windowSnapshot[item];
      }
    }
  }
}

const diffSandbox = new SnapshotSandbox('diff沙箱');
diffSandbox.active();  // 激活沙箱
window.a = '1'
console.log('开启沙箱：',window.a);
diffSandbox.inactive(); //失活沙箱
console.log('失活沙箱：', window.a);
diffSandbox.active();   // 重新激活
console.log('再次激活', window.a);
```

激活沙箱时，将`window`的快照信息存到`windowSnapshot`中， 如果`modifyPropsMap`有值，还需要还原上次的状态；激活期间，可能修改了`window`的数据；退出沙箱时，将修改过的信息存到`modifyPropsMap`里面，并且把`window`还原成初始进入的状态。

![micro14](/blog/images/architecture/micro14.png)

这种方式也无法支持多实例，因为运行期间所有的属性都是保存在 window上的。缺点：

- 只支持**浅层的隔离**，如果是 window 下复杂的引用对象则不能处理。
- 无法支持多实例模式，因为大家本质上还是**共享一个 window**。

## 沙箱逃逸

不论是基于 Proxy 还是 diff，其沙箱机制的方案都是通过模拟和代理来实现一个环境隔离的沙箱，只是所用 API 不同。由于是模拟，因此不可避免的在使用中需要考虑一些边界 case，我们简单来看两个问题：

#### case 1

```js
var foo = "hello";
// 微前端下需要显示申明
// window.foo = "hello"

function foo() {}
```

在无沙箱环境下两种写法可以自动提升为 `[window.foo]`，但是 Proxy 沙箱下这类代码就需要注意，由于代码执行作用域发生了变更，所以生效的环境不再是全局 window，这时通过 proxy 的 get 拦截器大概率就会返回 undefined，于是便会产生疑问“我本地运行是有值的，为什么到微前端里就 undefined 了呢？”，对于后者，诸如 qiankun 框架中可以通过`window.proxy`获取对应上下文来取值达到目的，但前者由于限制，必须显式的定义为 `window.foo` 否则无法获取。

#### case 2

**访问沙箱执行上下文中某个对象内部属性时，** `Proxy` **无法捕获到这个属性的访问操作**。例如我们可以直接在沙箱的执行上下文中通过 `window.parent` 拿到外层的全局对象。

```js
// 访问沙箱对象中对象的属性时，省略了上文中的部分代码
const ctx = {
    window: {
        parent: {...},
        ...
    }
}
const code = `
    window.parent.abc = 'xxx'
`
window.abc // xxx
```

#### case 3

**通过访问原型链实现逃逸**，JS 可以直接声明一个字面量，沿着该字面量的原型链向上查找原型对象即可访问到外层的全局对象，这种行为亦是无法感知的。

```js
const code = `
    ({}).constructor.prototype.toString = () => {
        console.log('Escape!')
    }
`
({}).toString() // Escape!  预期是 [object Object]
```

#### case 4

子应用新建了一个 iframe 来做些 JavaScript 逻辑，但在里面通过 `window.parent.xxx` 无法获取子应用 window 上的全局变量？但这个变量实际上是存在的，我在子应用中可以把它打印出来的。

造成这个问题是 iframe 中的 JavaScript 不在沙箱里执行，会读到外面真实的 window 上。而当你在子应用中定义了一个全局变量，方法是在沙箱里面拦截定义的，也就是**方法实现写在沙箱里、方法调用读在沙箱外**。解决方法有两种：

- 把变量做白名单处理，强制写在外面真实的 window 上
- 在 iframe 中用 `window.parent.proxy` 来获取对应的变量

如何抹平的这类的边界情况，有没有更好一些的解决方案呢？-  天然隔离 iframe

## 基于 iframe 的沙箱

常规思路下，大家想到的 iframe 都是在页面内起一个 iframe 元素，然后将需要加载的 url 填入进行加载，由于体验上的割裂，这种方式并不为大家认可，这也是为什么基于 Proxy 和 diff 的沙箱机制被提出的原因。但 iframe 也有许多优点：

- 使用简单，一个 url 即可，不需要其他微前端方案那样手动写入很多钩子以适配在微前端环境中的运行
- 利用浏览器的设计，可以实现样式、DOM、JavaScript 代码执行的完美隔离
- 页面原则上可以起无数多个 iframe 标签来加载应用，所以可以实现多应用共存
- 通过 iframe 实现的沙箱可以绕过 eval 执行的限制，比如当我们的代码中使用了原生 es modules 的写法时（eval 中不支持 `import()`），如果不做转译，代码便会抛出异常

iframe 标签可以创造一个独立的浏览器级别的运行环境，该环境与主环境隔离，并有自己的 window 上下文；在通信机制上，也可以利用 postMessage 等 API 与宿主环境进行通信。具体来说，在执行 JavaScript 代码上，我们不需要做什么处理

思路：通过 iframe 对象，把原生浏览器对象通过`contentWindow`取出来，这个对象天然具有所有的属性，而且与主应用的环境隔离。

```js
let iframe  = document.createElement('iframe',{src:'about:blank'});
document.body.appendChild(iframe);
const sandboxGlobal = iframe.contentWindow;
```

::: tip 注意

只有同域的 `ifame`才能取出对应的 `contentWindow`, iframe 的 src 设置为`about:blank`,可以保证一定是同域的，也不会发生资源加载

:::

但是要让 iframe 成为符合我们要求的沙箱，还需要重新设计。其中，和沙箱机制有关的几点包含：

- 应用间运行时隔离
- 路由劫持
- 应用间通信
- 动态脚本情况

对运行环境的代理与隔离，这也是大多数沙箱必备的基础之一。由于利用了 iframe，所以我们几乎不用担心 JavaScript 的代码运行会给沙箱外环境带来什么影响，因为在 iframe 中运行的 JavaScript 代码都是直接操作 iframe 的 window 上下文，但这里却需要考虑另一方面：如何将一些必要的操作传递出沙箱，因此也需要用到 Proxy 来做一些共享，比如路由、DOM操作等，这涉及到 location、history 等对象。通过将主应用环境下的对象透传给 iframe 中 JavaScript 使用，可以保证子应用在执行操作时，返回前进等操作可以同步到浏览器 top level 层面。此外，对于动态执行的 JavaScript 脚本（比如动态增加一个 script 元素），也需要单独考虑限制作用域，以使 script 中代码在执行时可以对应上具体的全局环境，这里可以通过为 script 包裹一层以锁定作用域内的部分全局变量取值。

#### 对于 DOM 操作

当 JavaScript 操作 DOM 时，我们肯定需要让其中的操作透传到 iframe 外部进行实现，因为 iframe 里面我们不构建 DOM。如果想在隔离方案上一步到位，这里可以使用 `Shadow DOM` 作为样式隔离的方案，来构建子应用渲染所需的 DOM 结构，而回到 DOM 操作本身，依旧是通过 `Proxy` 对 `iframe documen`t 进行拦截和替换来实现的，这里依据你的样式隔离方案，来决定 document 究竟是指向主应用中的 `Shadow DOM Root` 节点，还是其他代理的 document 对象。此外，诸如 `MutationObserver` 这类的操作也需要通过代理保证在主应用上进行。

#### 对于通信

一个完备的微前端方案需要考虑主子应用间的通信（与沙箱的通信），这样才可以对框架内的的全局状态或者子应用状态进行感知与响应。

构建一个同域的 iframe 元素，此时，iframe 内外通信并不会存在障碍，通过各自 window 便能方便的获取对应属性值；因为是同域环境，从中取出对应的 `contentWindow` 便可以对 iframe 内容属性进行随意读取，而与此同时还与外部环境隔离。

```js
const iframe = document.createElement('iframe',{url:'about:blank'});
document.body.appendChild(iframe);
const sandboxGlobal = iframe.contentWindow;
```

而如果要单独构建通信机制，也可以利用自定义 props、event 等方式实现，或者通过 Web API 诸如 `postMessage` 或者 `BroadcastChannel` 来实现。

#### 对于路由状态

路由状态，要保证 JavaScript 沙箱环境内与主应用路由状态保持一致，我们有两种实现方案：

- 让 JavaScript 沙箱内路由变更**操作在主应用环境生效**
- **同步**沙箱内路由变化至主应用环境

其中，针对第一种情况，我们需要做的是将诸如 `location` 、`history` 等变量代理到沙箱环境中，在这种情况下，因为我们不关心 iframe 自身的路由变化，便可以**自由设置 `src` 属性**，比如 `about:blank` 的方式来构建 iframe，而在沙箱实现上我们可以通过前述的 `Proxy` 来拦截实现。

但稍微考虑下实际生产环境便会发现，第一种情况存在的限制较多，最基本的便是对**沙箱内网络请求发送的处理**，所以这就需要我们考虑第二种情况的实现，在这种操作下，我们的**路由变化会同步到 iframe 上下文**，所以我们**需要针对 iframe 路由添加一个监听器**，在监听到变化时处理主应用的路由，以实现两者路由同步。当然，这种情况下，我们需要针对主应用所在域名设计一个 iframe 的同域方案，比如**同一域名+自定义 path 或者 hash**的实现就很简单易懂，这样也不存在跨域限制。

```js
// 伪代码
// 核心依旧在 window 隔离与共享对象的处理上，主要的实现手段依旧是完善 Proxy 的 get/set 拦截器
class SandboxWindow {
    /**
     * 构造函数
     * @param {*} context 需要共享的对象
     * @param {*} frameWindow iframe的window
     */
    constructor(context, frameWindow) {
         return new Proxy(frameWindow, {
            get(target, name) {
                if (name in context) { // 优先使用共享对象
                    return context[name];
                } else if(typeof target[name] === 'function' && /^[a-z]/.test(name) ){
                    return target[name].bind && target[name].bind(target);
                } else {
                    return target[name];
                }
            },
            set(target, name, value) {
                if (name in context) { // 修改共享对象的值
                    return context[name] = value;
                }
                target[name] = value;
            }
        })
    }
}

// 需要全局共享的变量
const context = { 
    document: window.document, 
    history: window.history, 
    location: window.location,
}

// 创建 iframe
const userInputUrl = '';
const iframe = document.createElement('iframe',{url: userInputUrl});
document.body.appendChild(iframe);
const sandboxGlobal = iframe.contentWindow;

// 创建沙箱
const newSandboxWindow = new SandboxWindow(context, sandboxGlobal);  
// 判断沙箱上的对象和全局对象是否相等
console.log('equal',newSandboxWindow.document === window.document)

newSandboxWindow.abc = '1'; //在沙箱上添加属性
console.log(window.abc);   // 在全局上查看属性
console.log(newSandboxWindow.abc) //在沙箱上查看属性

```

在实现上，如果需要区分 iframe 与主应用环境，可以通过代码 `window.parent !== window` 进行判断。

## 基于 ShadowRealm 提案的沙箱

ShadowRealm 是一个 ECMAScript 标准提案，旨在创建一个独立的全局环境，它的全局对象包含自己的内建函数与对象（未绑定到全局变量的标准对象，如 Object.prototype 的初始值），有自己独立的作用域。

谈及提案之前，我们简单来看看什么是 **Realm**

领域（`realm`），其实就代表了一个 `JavaScript` 独立的运行环境，里面有独立的变量作用域。

```html
<body>
  <iframe></iframe>
  <script>
    const win = frames[0].window;
    console.assert(win.globalThis !== globalThis); // (A)
    console.assert(win.Array !== Array); // (B)
  </script>
</body>
```

在前面 iframe 沙箱机制中我们也有介绍，由于每个 iframe 都有一个独立的运行环境，于是在执行时，当前 html 中的全局对象肯定与 iframe的全局对象不相同（A），类似的，全局对象上的 Array与 iframe 中获取到的 Array 也不同（B）。

ShadowRealm 允许一个 JS 运行时创建多个高度隔离的 JS 运行环境（`realm`），每个 `realm` 具有独立的全局对象和内建对象。

### ShadowRealm API

ShadowRealm 具有下面的类型签名：

```
declare class ShadowRealm {
  constructor();
  evaluate(sourceText: string): PrimitiveValueOrCallable;
  importValue(specifier: string, bindingName: string): Promise<PrimitiveValueOrCallable>;
}
```

每个 `ShadowRealm` 实例都有自己独立的运行环境，它提供了两种方法让我们来执行运行环境中的代码：

- `.evaluate()`：同步执行代码字符串，类似 `eval()`。
- `.importValue()`：返回一个 `Promise` 对象，异步执行代码字符串。

#### evaluate

`.evaluate()` 的类型签名：

```
evaluate(sourceText: string): PrimitiveValueOrCallable;
```

`.evaluate()` 的工作原理很像 `eval()`：

```
const sr = new ShadowRealm();
console.assert(
  sr.evaluate(`'ab' + 'cd'`) === 'abcd'
);
```

但是与 `eval()` 不同的是，比如执行作用域、调用方式以及传值类型等，代码是在 `.evaluate()` 的**独立运行环境中执行**的:

```
globalThis.realm = 'incubator realm';

const sr = new ShadowRealm();
sr.evaluate(`globalThis.realm = 'ConardLi realm'`);
console.assert(
  sr.evaluate(`globalThis.realm`) === 'ConardLi realm'
);
```

如果 `.evaluate()` 返回一个函数，为了方便在外部调用这个函数会被包装，然后在 `ShadowRealm` 中运行：

```
globalThis.realm = 'incubator realm';

const sr = new ShadowRealm();
sr.evaluate(`globalThis.realm = 'ConardLi realm'`);

const wrappedFunc = sr.evaluate(`() => globalThis.realm`);
console.assert(wrappedFunc() === 'ConardLi realm');
```

每当一个值传入 `ShadowRealm` 时，它必须是原始类型或者可以被调用的。否则会抛出异常：

```
> new ShadowRealm().evaluate('[]')
TypeError: value passing between realms must be callable or primitive
```

#### importValue

`.importValue()` 的类型签名：

```
importValue(specifier: string, bindingName: string): Promise<PrimitiveValueOrCallable>;
```

你可以直接导入一个外部的模块，异步执行并返回一个 `Promise`，用法：

```
// main.js
const sr = new ShadowRealm();
const wrappedSum = await sr.importValue('./my-module.js', 'sum');
console.assert(wrappedSum('hi', ' ', 'folks', '!') === 'hi ConardLi!');

// my-module.js
export function sum(...values) {
  return values.reduce((prev, value) => prev + value);
}
```

与 `.evaluate()` 一样，传入 `ShadowRealms` 的值（包括参数和跨环境函数调用的结果）必须是原始的或可调用的。

### ShadowRealm 应用场景

- 在 `Web IDE` 或 `Web` 绘图应用等程序中运行插件等第三方代码。
- 在 `ShadowRealms` 中创建一个编程环境，运行用户代码。
- 服务器可以在 `ShadowRealms` 中运行第三方代码。
- 在 ShadowRealms 中可以运行测试，这样外部的JS执行环境不会受到影响，并且每个套件都可以在新环境中启动（这有助于提高可复用性）。
- 网页抓取（从网页中提取数据）和网页应用测试等可以在 `ShadowRealms` 中运行。

### 其他方案对比

#### eval 和 Function

`ShadowRealms` 与 `eval()` 和 `Function` 很像，但比它们俩都好一点：我们可以创建新的JS运行环境并在其中执行代码，这可以保护外部的JS运行环境不受代码执行的操作的影响。

#### Web Workers

`Web Worker` 是一个比 `ShadowRealms` 更强大的隔离机制。其中的代码运行在独立的进程中，通信是异步的。

但是，当我们想要做一些更轻量级的操作时，`ShadowRealms` 是一个很好的选择。它的算法可以同步计算，更便捷，而且全局数据管理更自由。

#### iframe

每个 `iframe` 都有自己的运行环境，我们可以在里面同步执行代码。与 `ShadowRealms` 相比，还是有以下缺点：

- 只能在浏览器中使用 `iframe`；
- 需要向 `DOM` 添加一个 `iframe` 以对其进行初始化；
- 每个 `iframe` 环境都包含完整的 DOM，这在一些场景下限制了自定义的灵活度；
- 默认情况下，对象是可以跨环境的，这意味着需要额外的工作来确保代码安全。

#### Node.js 上的 vm 模块

`Node.js` 的 `vm` 模块与 `ShadowRealm API` 类似，但具有更多功能：缓存 `JavaScript` 引擎、拦截 `import()` 等等。但它唯一的缺点就是不能跨平台，只能在 `Node.js` 环境下使用。

[面向微前端，谈谈 JavaScript 隔离沙箱机制的古往今来](https://mp.weixin.qq.com/s/64vnFMJ6dcJOFw3Ex-Q3Hg)

[浅析 JavaScript 沙箱](https://mp.weixin.qq.com/s/euHJpS6rcRRqVBIPAnbUHA)

[快速理解qiankun的js沙箱原理及其实现](https://juejin.cn/post/6920110573418086413#heading-1)

[深入浅出解析阿里成熟的微前端框架 qiankun 源码](https://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247512424&idx=1&sn=2b545e4ae53b3ada37a4914a18b7c6a7&chksm=f992b7b9cee53eaf5a3b89f05083950719497534744cf6f1db1b2295bdee2a2e745dc803706f&scene=178&cur_album_id=1532020216900141059#rd)

[比 eval 和 iframe 更强的新一代 JavaScript 沙箱](https://mp.weixin.qq.com/s/t2VjwrewFuE0DHo_HeJ2zw)
