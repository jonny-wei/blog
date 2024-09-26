# 代码方面优化

## 使用函数式组件

```html
<template>
  <div class="cell">
    <div v-if="value" class="on"></div>
    <section v-else class="off"></section>
  </div>
</template>

<script>
export default {
  props: ['value'],
}
</script>
```

使用函数式组件(无状态组件)优化：

```html
<template functional>
  <div class="cell">
    <div v-if="props.value" class="on"></div>
    <section v-else class="off"></section>
  </div>
</template>
```

为什么用函数式组件 JS 的执行时间就变短了呢？

函数式组件不会有状态，不会有响应式数据，生命周期钩子函数这些东西。你可以把它当成把普通组件模板中的一部分 DOM 剥离出来，通过函数的方式渲染出来，是一种在 DOM 层面的复用。

函数式组件和普通的对象类型的组件不同，它不会被看作成一个真正的组件，我们知道在 patch 过程中，如果遇到一个节点是组件 vnode，会递归执行子组件的初始化过程；而函数式组件的 render 生成的是普通的 vnode，不会有递归子组件的过程，因此渲染开销会低很多。

## 子组件拆分与计算属性

由于 Vue 的更新是组件粒度的，通过数据修改导致父组件的重新渲染，但是子组件却不会重新渲染，因为它的内部也没有任何响应式数据的变化。所以优化后的组件不会在每次渲染都执行耗时任务，自然执行的 JavaScript 时间就变少了。

在实际工作中，vue 中使用 **计算属性** 优化复杂数据计算，计算属性体现了一种空间换时间的优化思想。

- computed： 是计算属性，依赖其它属性值，并且 computed 的值有缓存，只有它依赖的属性值发生改变，下一次获取 computed 的值时才会重新计算 computed  的值。当我们需要进行数值计算，并且依赖于其它数据时，应该使用 computed，因为可以利用 computed 的缓存特性，避免每次获取值时，都要重新计算。
- watch： 更多的是「观察」的作用，类似于某些数据的监听回调 ，每当监听的数据变化时都会执行回调进行后续操作。当我们需要在数据变化时执行异步或开销较大的操作时，应该使用 watch，使用 watch 选项允许我们执行异步操作 ( 访问一个 API )，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。

## 局部变量

```js
<template>
  <div :style="{ opacity: start / 300 }">{{ result }}</div>
</template>

<script>
export default {
  props: ['start'],
  computed: {
    base () {
      return 42
    },
    result () {
      let result = this.start
      for (let i = 0; i < 1000; i++) {
        result += Math.sqrt(Math.cos(Math.sin(this.base))) + this.base * this.base + this.base + this.base * 2 + this.base * 3
      }
      return result
    },
  },
}
</script>
```

优化后:

```js
<template>
  <div :style="{ opacity: start / 300 }">{{ result }}</div>
</template>

<script>
export default {
  props: ['start'],
  computed: {
    base () {
      return 42
    },
    result ({ base, start }) {
      let result = start
      for (let i = 0; i < 1000; i++) {
        result += Math.sqrt(Math.cos(Math.sin(base))) + base * base + base + base * 2 + base * 3
      }
      return result
    },
  },
}
</script>
```

优化前的组件多次在计算过程中访问 this.base，而优化后的组件会在计算前先用局部变量 base，缓存 this.base，后面直接访问 base。

那么为啥这个差异会造成性能上的差异呢？ 原因是你每次访问 this.base 的时候，**由于 this.base 是一个响应式对象，所以会触发它的 getter，进而会执行依赖收集相关逻辑代码**。类似的逻辑执行多了，像示例这样，几百次循环更新几百个组件，每个组件触发 computed 重新计算，然后又多次执行依赖收集相关逻辑，性能自然就下降了。

从需求上来说，this.base 执行一次依赖收集就够了，把它的 getter 求值结果返回给局部变量 base，后续再次访问 base 的时候就不会触发 getter，也不会走依赖收集的逻辑了，性能自然就得到了提升。

这是一个非常实用的性能优化技巧。因为很多人在开发 Vue.js 项目的时候，每当取变量的时候就习惯性直接写 this.xxx 了，因为大部分人并不会注意到访问 this.xxx 背后做的事情。在访问次数不多的时候，性能问题并没有凸显，但是一旦访问次数变多，比如在一个大循环中多次访问，类似示例这种场景，就会产生性能问题了。

## 使用 v-show 复用 DOM

v-show 替代 v-if 渲染控制，虽然从表现上看，v-show 和 v-if 类似，都是控制组件的显隐，但内部实现差距还是很大的。

v-if 是真正的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建；也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。

使用 v-if 条件渲染时当满足条件后会触发对应的组件更新，对于 v-if 渲染的节点，由于新旧节点 vnode 不一致，在核心 diff 算法比对过程中，会移除旧的 vnode 节点，创建新的 vnode 节点，那么就会创建新组件，又会经历组件自身初始化、渲染 vnode、patch 等过程。

对于 v-show 渲染的节点，由于新旧 vnode 一致，它们只需要一直 patchVnode 即可。在 patchVnode 过程中，内部会对执行 v-show 指令对应的钩子函数 update，然后它会根据 v-show 指令绑定的值来设置它作用的 DOM 元素的 style.display 的值控制显隐。

因此相比于 v-if 不断删除和创建函数新的 DOM，v-show 仅仅是在更新现有 DOM 的显隐值，所以 v-show 的开销要比 v-if 小的多。所以，v-if 适用于在运行时很少改变条件，不需要频繁切换条件的场景；v-show 则适用于需要非常频繁切换条件的场景。

::: tip 注意
v-show 相比于 v-if 的性能优势是在组件的更新阶段，如果仅仅是在初始化阶段，v-if 性能还要高于 v-show，原因是在于它仅仅会渲染一个分支，而 v-show 把两个分支都渲染了，通过 style.display 来控制对应 DOM 的显隐。在使用 v-show 的时候，所有分支内部的组件都会渲染，对应的生命周期钩子函数都会执行，而使用 v-if 的时候，没有命中的分支内部的组件是不会渲染的，对应的生命周期钩子函数都不会执行。
:::

## 使用 KeepAlive 缓存 DOM

在未使用 KeepAlive 场景下，我们每次点击按钮切换路由视图，都会重新渲染一次组件，渲染组件就会经过组件初始化，render、patch 等过程，如果组件比较复杂，或者嵌套较深，那么整个渲染耗时就会很长。

而在使用 KeepAlive 后，被 KeepAlive 包裹的组件在经过第一次渲染后，的 vnode 以及 DOM 都会被缓存起来，然后再下一次再次渲染该组件的时候，直接从缓存中拿到对应的 vnode 和 DOM，然后渲染，并不需要再走一次组件初始化，render 和 patch 等一系列流程，减少了 script 的执行时间，性能更好。

但是使用 KeepAlive 组件并非没有成本，因为它会占用更多的内存去做缓存，这是一种典型的空间换时间优化思想的应用。

## 延迟功能

Deferred features：使用 Deferred 组件延时分批渲染组件，渐进式渲染，降低 JS 执行时间过长导致渲染卡住的现象。

```html
<template>
  <div class="deferred-off">
    <VueIcon icon="fitness_center" class="gigantic"/>

    <h2>I'm an heavy page</h2>

    <Heavy v-for="n in 8" :key="n"/>

    <Heavy class="super-heavy" :n="9999999"/>
  </div>
</template>
```

优化后：

```js
<template>
  <div class="deferred-on">
    <VueIcon icon="fitness_center" class="gigantic"/>

    <h2>I'm an heavy page</h2>

    <template v-if="defer(2)">
      <Heavy v-for="n in 8" :key="n"/>
    </template>

    <Heavy v-if="defer(3)" class="super-heavy" :n="9999999"/>
  </div>
</template>

<script>
import Defer from '@/mixins/Defer'

export default {
  mixins: [
    Defer(),
  ],
}
</script>
```

使用了 Defer 这个 mixin：

```js
export default function (count = 10) {
  return {
    data () {
      return {
        displayPriority: 0
      }
    },

    mounted () {
      this.runDisplayPriority()
    },

    methods: {
      runDisplayPriority () {
        const step = () => {
          requestAnimationFrame(() => {
            this.displayPriority++
            if (this.displayPriority < count) {
              step()
            }
          })
        }
        step()
      },

      defer (priority) {
        return this.displayPriority >= priority
      }
    }
  }
}
```

Defer 的主要思想就是把一个组件的一次渲染拆成多次，它内部维护了 displayPriority 变量，然后在通过 requestAnimationFrame 在每一帧渲染的时候自增，最多加到 count。然后使用 Defer mixin 的组件内部就可以通过 `v-if="defer(xxx)"` 的方式来控制在 displayPriority 增加到 xxx 的时候渲染某些区块了。当你有渲染耗时的组件，使用 Deferred 做渐进式渲染是不错的注意，它能避免一次 render 由于 JS 执行时间过长导致渲染卡住的现象。

::: tip 异步加载(懒加载)与组件延时分批渲染(Deferred features)的区别
异步加载的异步体现在当组件渲染的时候，我才去网络中加载组件对应的 JS，加载完了才渲染出来，这个异步是可控的，比如满足某种条件再去加载，首屏不一定加载。而 Deferred features 是把一个渲染过重的组件拆成几个时间片去渲染，它可以控制某一块延时渲染出来，但最终都会渲染，也没有异步加载组件 JS 的逻辑。
:::

## 时间片切割

使用 Time slicing 时间片切割技术。

```js
fetchItems ({ commit }, { items }) {
  commit('clearItems')
  commit('addItems', items)
}
```

优化后的代码如下：

```js
fetchItems ({ commit }, { items, splitCount }) {
  commit('clearItems')
  const queue = new JobQueue()
  splitArray(items, splitCount).forEach(
    chunk => queue.addJob(done => {
      // 分时间片提交数据
      requestAnimationFrame(() => {
        commit('addItems', chunk)
        done()
      })
    })
  )
  await queue.start()
}
```

优化前，因为一次性提交的数据过多，内部 JS 执行时间过长，阻塞了 GUI 线程，导致页面卡死。

通常只要让页面的 fps 达到 60，页面就会非常流畅，如果我们把数据拆分粒度变成 100 条，基本上 fps 能达到 50 以上，虽然页面渲染变流畅了，但是完成 10000 条数据总的提交时间还是变长了。

使用 Time slicing 技术可以避免页面卡死，通常我们在这种耗时任务处理的时候会加一个 loading 效果。优化前由于一次性提交数据过多，JS 一直长时间运行，阻塞 GUI 线程，这个 loading 动画是不会展示的，而优化后，由于我们拆成多个时间片去提交数据，单次 JS 运行时间变短了，这样 loading 动画就有机会展示了。

::: tip 注意
虽然我们拆时间片使用了 requestAnimationFrame API，但是使用 requestAnimationFrame 本身是不能保证满帧运行的，requestAnimationFrame 保证的是在浏览器每一次重绘后会执行对应传入的回调函数，想要保证满帧，只能让 JS 在一个 Tick 内的运行时间不超过 17ms。
:::

## 使用非响应式数据

使用 Non-reactive data 非响应式数据。有些数据不需要响应式，此时可以将其弄成非响应式数据，禁止 Vue 劫持。常用于长列表性能优化。

```js
const data = items.map(
  item => ({
    id: uid++,
    data: item,
    vote: 0
  })
)
```

优化后:

```js
const data = items.map(
  item => optimizeItem(item)
)

function optimizeItem (item) {
  const itemData = {
    id: uid++,
    vote: 0
  }
  Object.defineProperty(itemData, 'data', {
    // Mark as non-reactive
    configurable: false,
    value: item
  })
  return itemData
}
```

因为内部提交的数据的时候，会默认把新提交的数据也定义成响应式，如果数据的子属性是对象形式，还会递归让子属性也变成响应式，因此当提交数据很多的时候，这个过程就变成了一个耗时过程。

优化后我们把新提交的数据中的对象属性 data 手动变成了 configurable 为 false，这样内部在 walk 时通过 Object.keys(obj) 获取对象属性数组会忽略 data，也就不会为 data 这个属性 defineReactive，由于 data 指向的是一个对象，这样也就会减少递归响应式的逻辑，相当于减少了这部分的性能损耗。数据量越大，这种优化的效果就会更明显。

此外也可以使用 Object.freeze(data) 冻结对象，一旦被冻结的对象就再也不能被修改了，禁止 Vue 劫持使其无法响应式。

再如我们在组件中定义的一些数据，也不一定都要在 data 中定义。有些数据我们并不是用在模板中，也不需要监听它的变化，只是想在组件的上下文中共享这个数据，这个时候我们可以仅仅把这个数据挂载到组件实例 this 上：

```js
export default {
  created() {
    this.scroll = null
  },
  mounted() {
    this.scroll = new BScroll(this.$el)
  }
}
```

这样我们就可以在组件上下文中共享 scroll 对象了，尽管它不是一个响应式对象。

## 虚拟滚动组件

使用 Virtual scrolling 虚拟滚动组件，优化无限列表性能。

```html
<div class="items no-v">
  <FetchItemViewFunctional
    v-for="item of items"
    :key="item.id"
    :item="item"
    @vote="voteItem(item)"
  />
</div>
```

优化后：

```html
<recycle-scroller
  class="items"
  :items="items"
  :item-size="24"
>
  <template v-slot="{ item }">
    <FetchItemView
      :item="item"
      @vote="voteItem(item)"
    />
  </template>
</recycle-scroller>
```

在非优化的情况下，10000 条数据在滚动情况下 fps 只有个位数，在非滚动情况下也就十几，原因是非优化场景下渲染的 DOM 太多，渲染本身的压力很大。优化后，即使 10000 条数据，在滚动情况下的 fps 也能有 30 多，在非滚动情况下可以达到 60 满帧。

之所以有这个差异，是因为虚拟滚动的实现方式，是只渲染视口内的 DOM，这样总共渲染的 DOM 数量就很少了，自然性能就会好很多。

虚拟滚动组件基本原理就是监听滚动事件，动态更新需要显示的 DOM 元素，计算出它们在视图中的位移。

虚拟滚动组件也并非没有成本，因为它需要在滚动的过程中实时去计算(可以加防抖节流)，所以会有一定的 script 执行的成本。因此如果列表的数据量不是很大的情况，我们使用普通的滚动就足够了。

## 路由懒加载

Vue  是单页面应用，可能会有很多的路由引入 ，这样使用 webpcak 打包后的文件很大，当进入首页时，加载的资源过多，页面会出现白屏的情况，不利于用户体验。如果我们能把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应的组件，这样就更加高效了。这样会大大提高首屏显示的速度，但是可能其他的页面的速度就会降下来。

对于每个路由都使用懒加载的方式引入，则每个模块都会被单独打为一个 js，首屏只会加载当前模块引入的 js。

不过路由懒加载也有一个很明显的弊端，就是每个模块的资源是只有加载这个模块的时候才回去下载的，所以在切换模块的时候可能会有一小段白屏或 loading 效果，这个要结合业务自身的情况综合判断要不要使用。

## 动态异步加载

CommonJS 和 ES Module 在用法上有个非常大的区别，CommonJS 允许你可以在用到的时候再去加载这个模块，而不用全部放到顶部加载。而 ES Module 的语法是静态的，静态 import 语法只能在文件的顶层使用。这种引用方式有个巨大缺陷，就是无法实现按需引入模块。

幸好， ES Module 目前也支持了 Dynamic import 的用法，动态的 import 会返回一个 promise ，你可以等待模块加载完成后再去做一些事情，而不用在页面初始化就加载它。

将 vendor 拆分后，依赖仍然会在首屏被加载，如果依赖不在首屏使用，仍然会造成网络资源的浪费，并阻塞页面渲染，对于没必要在首屏进行加载的依赖，我们可以采用动态 import 的方式。

不是所有依赖都适合异步加载，如果你对使用该依赖有很高的性能要求，然后依赖本身也比较大，这种情况是不适合的，因为你可能会看到明显的延迟。以上 export 其实是一个比较合适的场景，下载 excel 本身需要延迟时间，加上动态加载依赖的时间是可接收的。

Babel 本身不支持动态 import 语法，它需要 @babel/plugin-syntax-dynamic-import 配合才能工作。

```js
<script type="module">
  const moduleSpecifier = './utils.js';
  import(moduleSpecifier)
    .then((module) => {
      module.default();
      // → logs 'Hi from the default export!'
      module.doStuff();
      // → logs 'Doing stuff…'
    });
</script>

<script type="module">
  (async () => {
    const moduleSpecifier = './utils.js';
    const module = await import(moduleSpecifier)
    module.default();
    // → logs 'Hi from the default export!'
    module.doStuff();
    // → logs 'Doing stuff…'
  })();
</script>
```

## 数据分屏加载

实现原理：先加载一部分数据，当触发某个条件时加载剩余的数据，新得到的数据不会影响原有数据的显示，同时最大幅度的减少服务器端资源耗用。 基于以上原理，主要有三种实现方式：

- 纯粹的延迟加载，使用 setTimeout 和 setInterval 进行加载延迟。
- 条件加载，符合某种条件，或是触发某些事件才开始异步加载。
- 可视区加载，仅记载用户的可视区域，这个主要监控滚动条来实现，一般会距用户看到某些图片前的一段距离时开始进行记载，这样就可保证用户拉下时正好可以看到加载完毕后的图片或是内容。

第一种方式最简单但是还是会存在一定服务器端资源浪费，延迟加载的内容可能用户并没有实际滑动到展示区域，所以我采用第三种方式，也就是数据分屏加载，vue中监测滚动事件进行数据分屏加载，以会场活动为例： 根据页面数据请求情况将页面分屏数，此处以四屏为例：

```js
data() {
  return {
    firstScreenLoad: false, // 首屏加载是否完成
    loadFloor: ['header','dapai','sence','brand'],
    floorLoaded: [] // 已加载楼层
  };
},
created() {
    this.floorLoaded = Array.from({length: this.loadFloor.length}, () => false)
},
methods: {
    loadData() {
        window.addEventListener('scroll', () => {
        if (!this.firstScreenLoad) return false

        let top = (document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop)
        let height = window.innerHeight
        let loadIndex = 0

        if (top > height * 5) {
          loadIndex = 4
        } else if (top > height * 2.5) {
          loadIndex = 3
        } else if (top > height * 1) {
          loadIndex = 2
        } else if (top > this.height) {
          loadIndex = 1
        }

        let min
        this.floorLoaded.map((item, index) => {
          if (item == false && !min) {
            min = index
          }
        })
        if(min && loadIndex>min) {
          this.getLazyData(loadIndex)
        }
      })
    }
}
```

为保证首屏数据加载速度，分屏加载的数据需要在首屏数据加载完成之后再执行，所以定义一个首屏数据加载完成的标识firstScreenLoad，只有当首屏数据加载完成后才去执行分屏数据加载。通过监听滚动事件，当滚动到第二屏时加载下一屏的数据，但是在第二屏里为了避免数据反复加载，我们需要对已经加载的数据做过滤处理，所以定义一个已加载楼层的数组floorLoaded，初始化全部为false，当每加载一屏时，就将数组相应的标识置为true，然后将加载的屏数和已加载楼层的序号做对比，只有当加载屏数大于已加载楼层的序号数时才去进行数据加载，如此就可以避免每次滚动都会触发数据加载的问题。

## 图片资源懒加载

对于图片过多的页面，为了加速页面加载速度，所以很多时候我们需要将页面内未出现在可视区域内的图片先不做加载， 等到滚动到可视区域后再去加载。这样对于页面加载性能上会有很大的提升，也提高了用户体验。Vue  项目中可以使用 vue-lazyload 插件。

实现原理：

- 设置图片src属性为同一张图片，同时自定义一个data-src属性来存储图片的真实地址
- 页面初始化显示的时候或者浏览器发生滚动的时候判断图片是否在视野中
- 当图片在视野中时，通过js自动改变该区域的图片的src属性为真实地址

基于以上功能我们引入vue-lazyload，在main.js进行引入插件并配置。

```js
import VueLazyLoad from 'vue-lazyload'
Vue.use(VueLazyload, {
  preLoad: 1.5,
  attempt: 2,
  loading: '//img30.360buyimg.com/uba/jfs/t22357/176/210555046/9106/323dc062/5b03bd29Nb8dda14d.jpg'
});
```

vue文件中将需要懒加载的图片绑定 v-bind:src 修改为 v-lazy:

```html
<img v-lazy="cate.pictureUrl" :key="cate.pictureUrl" alt />
```

但是vue使用swiper循环播放，如果同时用了懒加载VueLazyload，轮播一圈之后第一张显示空白，解决思路就是首尾两张图片不用懒加载，中间的所有图片都使用懒加载，代码：

```js
<img v-if="index===0||index==(swiperData.list.length-1)" :src="cate.pictureUrl" alt />
<img v-else v-lazy="cate.pictureUrl" :key="cate.pictureUrl" alt />
```

## 无限下拉加载

对于有很多相似条目需要展示的页面，可以用无限下拉的方式来避免资源浪费，只有当用户操作向下滚动才加载更多的条目。

具体思路就是监听滚动事件，页面首先加载一屏数据，当滚动到一定位置再加载一批，以此类推。思路可能很简单：判断滚动到当前元素，然后动态添加 dom 内容。但是实现起来可能有很多小问题：

- 如何判断是否滚动到当前元素
- 是在某个 div 里滚动还是整个页面滚动
- 每次加载时记录第几次加载
- 加载失败的处理等。
-
- 此处使用了自定义指令，定义了一个 v-scroll 指令。 首先定义几个参数：

```js
data() {
    return {
      energyList: null, // 数据总列表
      energyRender: null, // 数据渲染列表
      times: 1, // 数据已经加载次数
      count: 0 // 数据需要加载总次数
    }
}
```

然后给对应参数赋值，这里要对不足偶数的商品做一次隐藏处理，因为页面模块是一行展示两个，然后这里以一屏6个商品为例，所以首次渲染列表为总列表的前6个商品。

```js
watch: {
    energyData: function (newVal, oldVal) { 
      if (newVal) {
        this.energyList = this.energyData.nengliangbujizhan.list;
        if (this.energyList.length % 2 !== 0) {
          this.energyList.pop();
        }
        this.energyRender = this.energyList.slice(0, 6);
        this.count = Math.floor(this.energyList.length / 6);
      }
    }
}
```

接下来就是我们最关键的自定义指令，主要就是监听页面的滚动事件，判断页面是否滚动到当前元素，当滚动到当前元素则执行loadMore函数，再加载一屏数据，直至数据加载完成，实现代码如下：

```js
directives: {
    scroll: {
      bind: function (el, binding) {
        window.addEventListener('scroll', () => {
          const top = (document.documentElement.scrollTop ||
                  window.pageYOffset || document.body.scrollTop);
          const height = window.screen.height;
          if (top + height >= el.offsetHeight) {
            const fnc = binding.value;
            fnc();
          }
        });
      }
    }
  },
  methods: {
    loadMore() {
      if (this.times <= this.count) {
        const newAry = [];
        for (let i = 0; i < 6; i += 1) {
          if (this.energyList.length > (this.times * 6) + i) {
            newAry.push(this.energyList[(this.times * 6) + i]);
          }
        }
        this.energyRender = [...this.energyRender, ...newAry];
        this.times += 1;
      }
    }
  }
```

最后在需要按需加载的模块的外层dom元素上增加 v-scroll="loadMore" 属性，内层数据列表循环取 energyRender 列表的数据即可。

## 第三方插件的按需引入

我们在项目中经常会需要引入第三方插件，如果我们直接引入整个插件，会导致项目的体积太大，我们可以借助 babel-plugin-component ，然后可以只引入需要的组件，以达到减小项目体积的目的。

## v-for 与 v-if 使用

v-for 遍历须为 item 添加 key，且避免同时使用 v-if。

v-for 遍历须使用唯一 id 作为 key，而不是 index 其作用：

没有绑定 key 的情况下，并且在遍历模板简单的情况下，会导致虚拟新旧节点对比更快，节点也会复用。而这种复用是 **就地复用**。没有 key 的情况， 节点位置不变，但是节点 innerText 内容更新了。有 key 的情况，dom 节点位置进行了交换，但是内容没有更新。所以 diff 速度也不是说带 key 就更快速，要相对而言。带 key 在增删节点上有耗时。这就是 vue 文档所说的 **默认模式**。但是这个并不是 key 作用，而是没有 key 的情况下可以对节点就地复用，提高性能。这种模式会带来一些隐藏的副作用，比如可能不会产生过渡效果，或者在某些节点有绑定数据（表单）状态，会出现状态错位。Vue 文档也说明了，这个默认的模式是高效的，但是只适用于不依赖子组件状态或临时 DOM 状态 (例如：表单输入值) 的列表渲染输出。

在不带key的情况下，对于简单列表页渲染来说diff节点更快是没有错误的。但是这并不是 key 的作用。

vue 和 react 都是采用 diff 算法来对比新旧虚拟节点，从而更新节点。在 vue 的 diff 采用双端比较法。在交叉对比中，当新节点跟旧节点头尾交叉对比没有结果时，会根据新节点的 key 去对比旧节点数组中的 key，从而找到相应旧节点（这里对应的是一个key => index 的 map 映射）。如果没找到就认为是一个新增节点。而如果没有 key，那么就会采用遍历查找的方式去找到对应的旧节点。一种是 map 映射(hashMap)，另一种是遍历查找。相比而言。map 映射的速度更快。

所以 key 的作用是：

**key 是 vue 中 VNode 的唯一标识，通过 key 我们的 diff 操作会更准确，更快速拿到 oldVnode 中对应的 vnode 节点**。

节点内容相同，只是位置顺序不同时，应通过移动元素位置更新，而非移除和新建，需要新旧节点保持映射关系以便旧 VNode 中找到可复用的节点，所以要给节点加唯一的标识 key，以便尽可能的复用 DOM。利用 key 标识新旧节点映射关系可以知道节点是否复用。遍历新 VNode 中每个节点，并去旧 VNode 中寻找是否有相同的 key。

[key的作用](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/1)

v-for 比 v-if 优先级高，如果每一次都需要遍历整个数组，将会影响速度，尤其是当之需要渲染很小一部分的时候，必要情况下应该替换成 computed 属性。

## 事件及时销毁

Vue 组件销毁时，会自动清理它与其它实例的连接，解绑它的全部指令及事件监听器，但是仅限于组件本身的事件。 如果在 js 内使用 addEventListene 等方式是不会自动销毁的，我们需要在组件销毁时手动移除这些事件的监听，以免造成内存泄露。

```js
created() {
  addEventListener('click', this.click, false)
},
beforeDestroy() {
  removeEventListener('click', this.click, false)
}
```

## 事件委托

事件委托（也叫事件代理）利用了事件冒泡，把监听函数绑定在父容器上。在触发DOM上的某个事件时，会产生一个事件对象event，这个对象中包含着所有与事件有关的信息。 使用事件委托的优点：

- 减少DOM操作，使事件处理时间减少。
- 减少内存空间的使用，提升性能。

简单例子：

```javascript
let myUl = document. getElementByld("my-ul"); 
myUl.addEventListener('click',function(e){ 
    if(e.target.tagName == "LI"){
        //如果点击的目标的标签名为LI
        alert(e.target.innerText)
    }
})
```

## 服务端渲染与预渲染

服务端渲染是指 Vue 在客户端将标签渲染成的整个 html 片段的工作在服务端完成，服务端形成的 html 片段直接返回给客户端这个过程就叫做服务端渲染。

#### 服务端渲染的优点

- 更好的 SEO： 因为 SPA 页面的内容是通过 Ajax 获取，而搜索引擎爬取工具并不会等待 Ajax 异步完成后再抓取页面内容，所以在 SPA 中是抓取不到页面通过 Ajax 获取到的内容；而 SSR 是直接由服务端返回已经渲染好的页面（数据已经包含在页面中），所以搜索引擎爬取工具可以抓取渲染好的页面；

- 更快的内容到达时间（首屏加载更快）： SPA 会等待所有 Vue 编译后的 js 文件都下载完成后，才开始进行页面的渲染，文件下载等需要一定的时间等，所以首屏渲染需要一定的时间；SSR 直接由服务端渲染好页面直接返回显示，无需等待下载 js 文件及再去渲染等，所以 SSR 有更快的内容到达时间；

#### 服务端渲染的缺点

- 更多的开发条件限制： 例如服务端渲染只支持 beforCreate 和 created 两个钩子函数，这会导致一些外部扩展库需要特殊处理，才能在服务端渲染应用程序中运行；并且与可以部署在任何静态文件服务器上的完全静态单页面应用程序 SPA 不同，服务端渲染应用程序，需要处于 Node.js server 运行环境；

- 更多的服务器负载：在 Node.js 中渲染完整的应用程序，显然会比仅仅提供静态文件的 server 更加大量占用CPU 资源，因此如果你预料在高流量环境下使用，请准备相应的服务器负载，并明智地采用缓存策略。

如果你的 Vue 项目只需改善少数营销页面（例如  /， /about， /contact 等）的 SEO，那么你可能需要预渲染，在构建时 (build time) 简单地生成针对特定路由的静态 HTML 文件。优点是设置预渲染更简单，并可以将你的前端作为一个完全静态的站点，具体你可以使用 prerender-spa-plugin 就可以轻松地添加预渲染 。

## Vuex 刷新保持状态

使用 vuex 做状态管理时，当用户刷新页面，vuex 里的状态会全部丢失，为了刷新前后保持原有状态，可以在 created 构造函数中添加以下方法：

```js
created(){
   console.log('页面执行刷新时，保存Vuex的状态到LocalStorage')
    //在页面加载时读取localStorage里的状态信息
    localStorage.getItem("store") && this.$store.replaceState(Object.assign(this.$store.state,JSON.parse(localStorage.getItem("store"))));
    
    //在页面刷新时将vuex里的信息保存到localStorage里
    window.addEventListener("beforeunload",()=>{
        localStorage.setItem("store",JSON.stringify(this.$store.state))
    })
```

通过 localStorage 或者 sessionStorage 做 vuex 数据持久化，因为 localStorage 与 sessionStorage 页面刷新是数据不会丢失。

## Vuex 按需加载

vuex 按需加载，避免首页初始化所有数据。原理：

利用 vue 的插件机制，使用 Vue.use(vuex) 时，会调用 vuex 的 install 方法，装载 vuex。applyMixin 方法使用 vue 混入机制，vuex 是利用 vue 的 mixin 混入机制，在 beforeCreate 钩子前混入 vuexInit 方法，vuexInit 方法实现了 store 注入 vue 组件实例，并注册了 vuex store 的引用属性 `$store`。所以我们可以自己写一个 mixin ，在 beforeCreate 钩子中通过 registerModule 动态注册模块，实现组件按需加载 vuex 状态数据。

```js
Vue.use(function() {
    Vue.mixin({
        beforeCreate: function() {
            // $options是组件选项，包含组件.vue文件的 `export default` 的属性
            // 为了拿到在组件定义的是否按需加载的属性值 `isNeedVuex`
            if(this.$options.isNeedVuex) {
                // 需要设置.vue文件的name属性，跟单文件组件名字命名一样
                let name = this.$options.name;
                import("./store/modules/" + name).then((res) => {
                    console.log(res);
                    // res.default就是代表我们在store/modules文件夹下对应文件的 export default对象
                    // registerModule 模块动态注册功能使得其他 Vue 插件可以通过在 store 中附加新模块的方式来使用 Vuex 管理状态。
                    this.$store.registerModule(name, res.default);
                });
            }
        }
    });
});
```

## 前端容灾

### Service Workers 缓存离线化

[Service Workers 缓存离线化](https://juejin.cn/post/6844903783240204301)

### CDN 容灾

除了 Localstorage 同时也备份一份静态数据到 CDN，在接口请求和 Localstorage 都没有数据的情况下，从 CDN 获取备份数据。

## SEO 优化措施

1. 使用CSS图标，背景图片压缩，使用雪碧图，减少HTTP请求数等。
2. 结构、表现和行为的分离：尽量不要把CSS和JS 放在同一个页面，采用外链的方式。
3. 优化网站分级结构，调整页面布局。在每个内页加面包屑导航，页面内容尽量不要做成flash、视频。
4. 集中网站权重，可以使用"rel=nofollown"属性，告诉爬虫无需抓取此页，从而将权重分绐其他的链接
5. strong、em标签强调关键字。strong标签在搜索引擎中能够得到高度的重视。
6. 利用a标签的title属性。在不影响页面功能的情况下，尽量绐a标签加上title属性，更有利于爬虫抓取信息。
7. img应使用"alt"属性加以说明，这个属性可以在图片加载不出来的时候显示在页面上相关的文字信息。
8. 精心设置meta标签，如title， keywords，description等，反映网站的定位。内容与关键字要对应，增加关键字的密度。
9. 增加网站的404页面，利于提高用户体验，主要防止爬虫丟失。
10. 重要内容不要用JS输出，爬虫不识别JS代码里的程序内容。
11. 尽量少使用iframe框架，爬虫一般不会读取其中的内容
12. 添加外链。选择与网站相关性比较高，整体质量比较好的网站交换友链，巩固稳定关键词排名。
13. 填充优质的原创内容。

::: warning 参考文献
[Vue 官方性能优化](https://cn.vuejs.org/guide/best-practices/performance.html)

[揭秘 Vue.js 九个性能优化技巧](https://juejin.cn/post/6922641008106668045#heading-0)

[我是如何将网页性能提升5倍的 — 构建优化篇](https://juejin.cn/post/6910893471339708429#heading-4)

[Vue 项目性能优化 — 实践指南](https://juejin.cn/post/6844903913410314247#heading-11)

[javaScript 性能优化](https://juejin.cn/post/6926899302455312391)
:::
