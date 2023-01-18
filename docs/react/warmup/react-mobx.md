# React Mobx

## Mobx 特性

### 观察者模式

Mobx 采用了一种'观察者模式'——Observer，整个设计架构都是围绕 Observer 展开：

- 在 mobx 的状态层，每一个需要观察的属性都会添加一个观察者，可以称之为 ObserverValue 。
- 有了观察者，那么就需要向观察者中收集 listener ，mobx 中有一个 Reaction 模块，可以对一些行为做依赖收集，在 React 中，是通过劫持 render 函数执行行为，进行的依赖收集。
- 如何监听改变，用自定义存取器属性中的 get 和 set ，来进行的依赖收集和更新派发，当状态改变，观察者会直接精确通知每个 listener 。

### 状态提升

在正常情况下，在 React 应用中使用 Mobx ，本质上 mobx 里面的状态，并不是存在 React 组件里面的，是在外部由一个个 mobx 的模块 model 构成，每一个 model 可以理解成一个对象，状态实质存在 model 中，model 状态通过 props 添加到组件中，可以用 mobx-react 中的 Provder 和 inject 便捷获取它们，虽然 mobx 中响应式处理这些状态，但是不要试图直接修改 props 来促使更新，这样违背了 React Prop 单向数据流的原则。正确的处理方法，还是通过 model 下面的 action 方法，来改变状态，React 实质上调用的是 action 方法。

### 装饰器模式

为了建立观察者模式，便捷地获取状态/监听状态，mobx 很多接口都支持装饰器模式的写法

### 精确颗粒化收集

mobx 还有一个重要特点，就是对于属性的依赖收集是精确的，颗粒化的

```js
class Root {
    @observable object = {                  //C组件使用
         name:'alien',                     // A组件使用
         mes:'let us learn React!'         // B组件使用
    }
    @action setName(name){ this.object.name = name  }
    @action setMes(mes){ this.object.mes = mes }
    @action setObject(object){ this.object = object  }
}
```

- 对于 observable 处理过的属性，每一个属性都会有 ObserverValue ，比如上面的结构会产生三个 ObserverValue ，分别对应 object ，name ，mes 。
- 当上面通过 setName 改变 name 属性的时候，只有组件 A 会更新。也就是 name ObserverValue 只收集了用到 name 的依赖项 A 组件。
- 调用 setMes 同理，只有组件 B 更新。 mes ObserverValue 只收集了 B 组件的依赖。
- 当上面通过 setObject 改变 object 的时候，即使 object 里面name ，mes 的值没有变化，也会让组件 A ，组件 B ，组件 C ，全部渲染。object 的 Observer 同样收集了name的 ObserverValue 和 mes 的 ObserverValue 。

![mobx1](/blog/images/react/mobx1.png)

引用类型处理

observable 对于引用数据类型，比如 Object ，Array ，Set ，Map等，除了新建一个 observable 之外，还会做如下两点操作。

- Proxy：会把原始对象用 Proxy 代理，Proxy 会精确响应原始对象的变化，比如增加属性——给属性绑定 ObserverValue ，删除属性——给属性解绑 ObserverValue 等。
- ObservableAdministration： 对于子代属性，会创建一个 ObservableAdministration，用于管理子代属性的ObserverValue。

对于外层 Root ，在 constructor 使用 makeObservable ，mobx 会默认给最外层的 Root 添加 ObservableAdministration 。

## 基本用法

### mobx 常用 api

mobx的 api 基本用于构建每一个响应式模块。

#### makeObservable

在新版本 mobx 中，想要让整个模块变成可响应式的，那么需要在 constructor 调用 makeObservable。老版本的 mobx 不需要这么做。

```js
constructor(){ makeObservable(this) }
```

#### observable

会给属性值加一个观察者对象，使其能变成可观察的，当属性值改变的时候，观察者会通知每一个依赖项。

```js
@observable name = '《React进阶实践指南》'
```

#### action

通过 action 包裹的函数，可以用来修改 mobx 中的状态。

```js
@action setName(newName){ this.name = newName  }
```

#### computed

根据现有的状态或其它计算值衍生出的值。如下 total 是通过 price 和 count 衍生出来的新值。

```js
@observable price = 666  // 可观察属性——价格
@observable count = 1    // 可观察属性——数量
@computed get total() {  
    return this.price * this.count
}
```

### mobx-react 常用 api

mobx-react 中的 api ，用于把 mobx 中的状态，提供给组件，并把组件也变成可观察的 —— mobx 状态改变，组件触发更新。

#### Provider

用于把 mobx 的各个模块，用 Context 上下文形式，保存起来，供给组件使用。

```js
<Provider Root={Root} > { /* ... */ } </Provider>
```

#### inject

inject 高阶组件可以把 Provider 中的 mobx 模块，混入到组件的 props 中，所以就可以在组件中消费状态，或者调用改变状态的方法。

```js
@inject('Root')
class Index extends React.Component{}
```

#### observer

被 observer 高阶组件包装的组件，如果组件内部引入了 mobx 可观察属性值，当值改变的时候，会追溯到当前组件，促使当前组件更新。

```js
@observer
class Index extends  React.Component{}
```

### 实现状态共享

首先创建 Root 模块，用于保存全局的一些数据。

```js
import { observable ,action ,makeObservable } from 'mobx'
class Root{
   constructor(){
      makeObservable(this)
   }
   @observable info={ name:'xxx', mes:'xxx' }
   // @observable number = 1
   @action setInfo(info){  this.info = info }
}
export default new Root()
```

根本组件注入状态：

```js
import Root from './mobx'
export default function Index(){
    return <Provider Root={Root} >
        <Child />
    </Provider>
}
```

全局通过 mobx-react 中的 Provider 传递内容。inject 引入 Root，observer 做数据响应，模拟数据交互，调用 setInfo 改变 Root 中 info 内容。 info 内容改变，重新渲染视图。

```js
const getUserInfo = () => {
   return new Promise((resolve=>{
            setTimeout(()=>{resolve({ name:'alien', mes:'let us learn React!'})
       },1000)
   }))
}
@inject('Root')
@observer
class Child extends React.Component{
    async componentDidMount(){
       /*  模拟数据交互 */
       const res = await getUserInfo()
       this.props.Root.setInfo(res)
    }
    render(){
        const { info } = this.props.Root
        return <div className="box" >
            <p> 姓名：{info.name} </p>
            <p> 想对大家说：{info.mes} </p>
        </div>
    }
}
```

### 实现组件通信

先注册模块用于组件通信

```js
class Communi {
   constructor(){
       makeObservable(this)
   }
   @observable mesA = ''
   @observable mesB = ''
   @action setMesA(mes){ this.mesA = mes }
   @action setMesB(mes){ this.mesB = mes }
}
export default new Communi()
```

组件通信：

```js
@inject('Communi')
@observer
class ComponentA extends React.Component{ /* 组件A */
    state={ CompAsay:''}
    render(){
        const { CompAsay } = this.state
        const { mesB  } = this.props.Communi
        return <div className="box" >
        <p>我是组件A</p>
        <div> B组件对我说：{mesB} </div>
        我对B组件说： <input onChange={(e) => this.setState({ CompAsay :e.target.value })} placeholder="CompAsay" />
        <button onClick={() => this.props.Communi.setMesA(CompAsay)} >确定</button>
      </div>
    }
}
@inject('Communi')
@observer
class ComponentB extends React.Component{ /* 组件B */
   state={ compBsay:''}
   render(){
       const { compBsay } = this.state
       const {  mesA  } = this.props.Communi
       return <div className="box pt50" >
            <p>我是组件B</p>
           <div> A组件对我说：{mesA} </div>
           我对A组件说：<input onChange={(e) => this.setState({ compBsay :e.target.value })}  placeholder="CompAsay" />
           <button onClick={() => this.props.Communi.setMesB(compBsay)} >确定</button>
       </div>
   }
}
```

## Mobx 实现原理

可以从三个角度分析 mobx 和 mobx-react 整个流程：

- 初始化：首先就是 mobx 在初始化的时候，是如何处理 observable 可观察属性的。
- 依赖收集：第二点就是通过 mobx-react 中的 observer ，如何收集依赖项，与 observable 建立起关系的。
- 派发更新：最后就是当改变可观察属性的值的时候，如何更新对应组件的。

### 模块初始化

首先被 observable 装饰器包裹的属性到底做了些什么呢？

#### 绑定状态 —— observable

```js
// mobx/src/api/observable.ts
function createObservable(target,name,descriptor){ // 对于如上DEMO1，target——Root类，name——属性名称 authorInfo 或者 name ，descriptor——属性描述，枚举性，可读性等
     if(isStringish(name)){ /* 装饰器模式下 */
         target[Symbol("mobx-stored-annotations")][name] = { /* 向类的mobx-stored-annotations属性的name属性上，绑定 annotationType_ ， extend_ 等方法。 */
            annotationType_: 'observable',  //这个标签证明是 observable，除了observable，还有 action， computed 等。
            options_: null,
            make_,  // 这个方法在类组件 makeObservable 会被激活
            extend_ // 这个方法在类组件 makeObservable 会被激活
        }
     }       
}

function make_(adm,key,descriptor){ /*  */
    return this.extend_(adm,key,descriptor)
}
function extend_(adm,key,descriptor){
    return adm.defineObservableProperty_(key,descriptor,options)
}
```

- 被 observable 装饰器包装的属性，本质上就是调用createObservable 方法。
- 通过 createObservable 将类上绑定当前 observable 对应的配置项，说白了，就是给 observable 绑定的属性添加一些额外的状态，这些状态将在类实例化的时候 makeObservable 中被激活。

当调用 observable 配置项的 make_，本质上调用 `adm.defineObservableProperty_`

#### 激活状态 —— makeObservable

在新版本 mobx 中，必须在类的 constructor 中调用 `makeObservable(this)` 才能建立响应式

```js
function makeObservable (target){ // target 模块实例——this
    const adm = new ObservableObjectAdministration(target) /* 创建一个管理者——这个管理者是最上层的管理者，管理模块下的observable属性 */
    target[Symbol("mobx administration")] = adm  /* 将管理者 adm 和 class 实例建立起关联 */
    startBatch()
    try{
        let annotations = target[Symbol("mobx-stored-annotations"] /* 上面第一步说到，获取状态 */
        Reflect.ownKeys(annotations)  /* 得到每个状态名称 */
        .forEach(key => adm.make_(key, annotations[key])) /* 对每个属性调用 */
    }finally{
        endBatch()
    }
}
```

makeObservable 主要做的事有以下两点：

- 创建一个管理者 ObservableAdministration ，上面讲到过，管理者就是为了管理子代属性的 ObservableValue 。并和模块实例建立起关系。
- 然后会遍历观察者状态下的每一个属性，将每个属性通过adm.make_处理，值得注意的是，这个make_是管理者的，并不是属性状态的make_，这一点不要弄混淆了。

接下来一起看一下，管理者 ObservableAdministration 里面是如何管理状态的。

#### 观察者属性管理者 —— ObservableAdministration

上述初始化创建的管理者，调用的是 `ObservableObjectAdministration` ，实际在 mobx 内部会存在多个种类的管理者，比如数组，对象数据类型。因为不同的类型，里面的方法和状态都是不同的。

```js
class ObservableObjectAdministration{
    constructor(target_,values_){
        this.target_ = target_
        this.values_ = new Map() //存放每一个属性的ObserverValue。
    }
    /* 调用 ObserverValue的 get —— 收集依赖  */
    getObservablePropValue_(key){ 
        return this.values_.get(key)!.get()
    }
    /* 调用 ObserverValue的 setNewValue_   */
    setObservablePropValue_(key,newValue){
        const observable = this.values_.get(key)
        observable.setNewValue_(newValue) /* 设置新值 */
    }
    make_(key,annotation){ // annotation 为每个observable对应的配置项的内容，{ make_,extends }
        const outcome = annotation.make_(this, key, descriptor, source)
    }
    /* 这个函数很重要，用于劫持对象上的get,set */
    defineObservableProperty_(key,value){
        try{
            startBatch()
            const descriptor = {
                get(){      // 当我们引用对象下的属性，实际上触发的是 getObservablePropValue_
                   this.getObservablePropValue_(key)
                },
                set(value){ // 当我们改变对象下的属性，实际上触发的是 setObservablePropValue_
                   this.setObservablePropValue_(key,value)
                }
            }
            Object.defineProperty(this.target_, key , descriptor)
            const observable = new ObservableValue(value) // 创建一个 ObservableValue
            this.values_.set(key, observable)             // 设置observable到value中
        }finally{
            endBatch()
        }
    }
}
```

当 mobx 底层遍历观察者属性，然后调用 `make_` 方法的时候，本质上调用的是如上 `make_` 方法，会激活当前的 observable 属性，触发 observable 配置项上的 `make_` 方法，然后就会进入真正的添加观察者属性环节 `defineObservableProperty_` 。

- 首先会通过 `Object.defineProperty` ，拦截对象的属性，添加get，set ，比如组件中引用对象上的属性，调用 get ——本质上调用 `getObservablePropValue_`，在 observableValues 调用的是 get 方法；当修改对象上的属性，调用 set ——本质上调用 `setObservablePropValue_`，`setObservablePropValue_` 调用的是 ObservableValues 上的 `setNewValue_` 方法。
- 对于每一个属性会增加一个观察者 ObservableValue ，然后把当前 ObservableValue 放入管理者 ObservableAdministration 的 `values_` 属性上。

![mobx2](/blog/images/react/mobx2.png)

### 依赖收集

#### 观察者 —— ObservableValue

只要通过 `@observable` 包裹，就会创建一个 `ObservableValue` 。

在 Mobx 有一个核心的思想就是 Atom 主要是收集依赖，通知依赖。先来看一下 Atom 的重点方法:

```js
// mobx/src/core/atom.ts
class Atom{
    observers_ = new Set() /* 存放每个组件的 */
    /* value改变，通知更新 */
    reportChanged() {
        startBatch()
        propagateChanged(this)
        endBatch()
    }
    /* 收集依赖 */
    reportObserved() {
        return reportObserved(this)
    }
}
```

ObservableValue 继承了 Atom。

```js
// mobx/src/types/observablevalue.ts
class ObservableValue extends Atom{
    get(){ //adm.getObservablePropValue_ 被调用
        this.reportObserved() // 调用Atom中 reportObserved
        return this.dehanceValue(this.value_)
    }
    setNewValue_(newValue) { // adm.setObservablePropValue_
        const oldValue = this.value_
        this.value_ = newValue
        this.reportChanged()  // 调用Atom中reportChanged
    }
}
```

重点看一下在观察者属性管理者最终调用的两个方法 —— `get` 和 `setNewValue_`

#### 注入模块 —— Provider 和 inject（mobx-react）

Provider：mobx-react 中的 Provider 非常简单，就是创建一个上下文 context ，并通过 context.Provider 传递上下文。

```js
// mobx-react/src/Provider.tsx
const MobXProviderContext = React.createContext({})
export function Provider(props) {
    /* ... */
    return <MobXProviderContext.Provider value={value}>{children}</MobXProviderContext.Provider>
}
```

inject：inject 作用很简单，就是将 mobx 的状态，从 context 中混入 props 中。

```js
// mobx-react/src/inject.ts
function inject(...storeNames){
   const Injector = React.forwardRef(((props, ref)=>{
        let newProps = { ...props }
        const context = React.useContext(MobXProviderContext)
        storeNames.forEach(function(storeName){ //storeNames - [ 'Root' ]
            if(storeName in newProps) return 
            if(!(storeName in context)){
                /* 将mobx状态从context中混入到props中。 */
                newProps[storeName] = context[storeName]
            }
        })
        return React.createElement(component, newProps)
   }))
   return Injector 
}
```

#### 可观察组件 —— observer（ mobx-react ）

被 observe 的组件，被赋予一项功能，就是可观察的，当里面引用了 mobx 中的 ObservableValue ，当 ObservableValue 改变，组件会更新。 接下来就是核心了，需要看一下被 observe 包裹的组件会有哪些新特征，以及如何收集的依赖，又是如何更新的。被 observe 的组件分为函数组件和类组件两种情况。这里只讲了类组件的情况。

observer：到这里基本可以弄清楚 mobx-react 中 observer HOC 的作用了——渲染 render 的劫持。通过劫持 render 函数执行，收集里面的依赖。

```js
// mobx-react/src/observer.tsx
function observer(componentClass){
    /* componentClass 是类组件的情况 (函数组件我们暂且忽略) */
    return function makeClassComponentObserver(){
        const target = componentClass.prototype
        const baseRender = target.render /* 这个是原来组件的render */
        /* 劫持render函数 */
        target.render = function () {
            return makeComponentReactive.call(this, baseRender)
        }
    }
}
```

makeComponentReactive：通过改造 render 函数，来实现依赖的收集，里面包含了很多核心流程。

```js
// mobx-react/src/observerClass.ts
function makeComponentReactive(){
    const baseRender = render.bind(this) // baseRender为真正的render方法
     /* 创建一个反应器，绑定类组件的更新函数 —— forceUpdate  */
     const reaction = new Reaction(`${initialName}.render()`,()=>{
          Component.prototype.forceUpdate.call(this) /* forceUpdate 为类组件更新函数 */
     })
    reaction["reactComponent"] = this    /* Reaction 和 组件实例建立起关联 */
    reactiveRender["$mobx"] = reaction
    this.render = reactiveRender 
    function reactiveRender() { /* 改造的响应式render方法 */
        reaction.track(() => {  // track中进行真正的依赖收集
            try {
                rendering = baseRender() /* 执行更新函数 */
            } 
        })
        return rendering
    }
    return reactiveRender.call(this)
}
```

- 每一个组件会创建一个 Reaction，Reaction 的第二个参数内部封装了更新组件的方法。那么如果触发可观察属性的 set ，那么最后触发更新的就是这个方法，对于类组件本质上就是的 forceUpdate 方法。
- 对 render 函数进行改造，改造成 reactiveRender ，在 reactiveRender 中，reaction.track 是真正的进行依赖的收集，track 回调函数中，执行真正的 render 方法，得到 element 对象 rendering 。

#### 反应器 —— Reaction

```js
class Reaction{
    constructor(name_,onInvalidate_){
       this.name_ = name_
       this.onInvalidate_ = onInvalidate_ /* onInvalidate_ 里面有组件的forceUpdate函数，用于更新组件 */
    }
    onBecomeStale_(){
        this.schedule_() /* 触发调度更新 */
    }
    /* 开启调度更新 */
    schedule_(){
       if (!this.isScheduled_) {
            this.isScheduled_ = true
            globalState.pendingReactions.push(this)
            runReactions()
        }
    }
    /* 更新 */
    runReaction_(){
        startBatch()
        this.isScheduled_ = false
        const prev = globalState.trackingContext
        globalState.trackingContext = this
        this.onInvalidate_() /* 更新组件  */
        globalState.trackingContext = prev
        endBatch()
    }
    /* 收集依赖 */
    track(fn){
        startBatch()
        /* 第一阶段 */
        const prevTracking = globalState.trackingDerivation
        globalState.trackingDerivation = this
        /* 第二阶段 */
        const result = fn.call(context)
        globalState.trackingDerivation = prevTracking
        /* 第三阶段 */
        bindDependencies(this) 
    }
 }
```

- 第一阶段： 首先在执行 track 的时候，会把全局变量的 trackingDerivation，指向当前的 trackingDerivation 。这样在收集依赖的过程中，可以直接收集当前的 trackingDerivation ，也就是为什么 ObservableValue 能精确收集每一个 Reaction 。

- 第二阶段：首先当被 observer 包装的组件，只要执行 render 函数，就会执行 track 方法，fn.call(context)，真正的r ender 函数会在里面执行，如果在 render 的过程中，引用了 mobx 可观察模块，比如：

```js
@inject('Root')
class Index extends React.Component{
    render(){
        return <div> 
           <p>{ this.props.Root.name }</p> 
           <button onClick={() => this.props.Root.setName('《React进阶实践指南》666')} >改变Mobx中name</button>
        </div>
    }
}
```

当如上 render 执行的时候，首先会触发 track ，将当前Reaction 赋值给 trackingDerivation ，然后访问了 Root 下面的name 属性，那么首先会触发观察状态管理者的 adm 的 getObservablePropValue_ ，接下来会触发 name 属性的观察者 ObservableValue 下面的 get 方法，最后执行的是 reportObserved(this):

```js
function reportObserved(observable){
    /* 此时获取到当前函数对应的 Reaction。 */
    const derivation = globalState.trackingDerivation 
    /* 将当前的 observable 存放到 Reaction 的 newObserving_ 中。 */
    derivation.newObserving_![derivation.unboundDepsCount_++] = observable 
}
```

reportObserved 做的事情非常直接，就是将当前的 observable 放入 Reaction 的 newObserving_ 中，这样就把观察者属性（如上例子中的name）和组件对应的 Reaction 建立起关联。

- 第三阶段：当组件中 render 函数执行完毕，也就是 jsx 中的依赖全部收集完成，就会到第三阶段，上述只是 ObservableValue 到 Reaction 收集，但是没有 Reaction 到 ObservableValue ，也就是说 ObservableValue 里面还没有组件的 Reaction：
  
```js
function bindDependencies(Reaction){ /* 当前组件的 Reaction */
    const prevObserving = derivation.observing_ /* 之前的observing_ */
    const observing = (derivation.observing_ = derivation.newObserving_!) /* 新的observing_  */
    let l = prevObserving.length
    while (l--) { /* observableValue 删除之前的 Reaction  */
        const observableValue = prevObserving[l]
        observable.observers_.delete(Reaction)
    }
    let i0 = observing.length 
    while (i0--) { /* 给renderhanobservableValue重新添加 Reaction  */
        const observableValue = observing[i0]
         observable.observers_.add(Reaction)
    }
}
```

bindDependencies 主要做的事情如下：

1. 对于有当前 Reaction的 observableValue，observableValue会统一删除掉里面的 Reaction。
2. 会给这一次 render 中用到的新的依赖 observableValue ，统一添加当前的 Reaction 。
3. 还会有一些细节，比如说在 render 中，引入两次相同的值（如上的 demo 中的 name ），会统一收集一次依赖。

![mobx3](/blog/images/react/mobx3.png)

### 派发更新

接下来就是一次更新中，比如在 demo 中点击按钮，通过 action ，改变 mobx 中的 name 属性。那么会发生什么呢?

- 第一步： 首先对于观察者属性管理者 ObservableAdministration 会触发 setObservablePropValue_，然后找到对应的 ObservableValue 触发 setNewValue_ 方法。

- 第二步： setNewValue_ 本质上会触发Atom中的reportChanged ，然后调用 propagateChanged。首先来看一下propagateChanged

```js
// mobx/src/core/observable.ts
function propagateChanged(observable){
    observable.observers_.forEach((Reaction)=>{
        Reaction.onBecomeStale_()
    })
}
```

调用 propagateChanged 触发，依赖于当前组件的所有 Reaction 会触发 onBecomeStale_ 方法。

- 第三步： Reaction 的 onBecomeStale_触发，会让Reaction 的 schedule_ 执行，注意一下这里 schedule_会开启更新调度。什么叫更新调度呢。就是 schedule_ 并不会马上执行组件更新，而是把当前的 Reaction 放入 globalState.pendingReactions（待更新 Reaction 队列）中，然后会执行 runReactions 外部方法。

```js
// mobx/src/core/reaction.ts
function runReactions(){
    if (globalState.inBatch > 0 || globalState.isRunningReactions) return
    globalState.isRunningReactions = true
    const allReactions = globalState.pendingReactions
    /* 这里的代码是经过修改过后的，源码中要比 */
    allReactions.forEach(Reaction=>{
         /* 执行每一个组件的更新函数 */
         Reaction.runReaction_()
    })
    globalState.pendingReactions = []
    globalState.isRunningReactions = false
}
```

- 第四步： 执行每一个 Reaction ，当一个 `ObservableValue` 的属性值改变，可以收集了多个组件的依赖，所以 mobx 用这个调度机制，先把每一个 Reaction 放入 `pendingReactions` 中，然后集中处理这些 Reaction ， Reaction 会触发 `runReaction_()` 方法，会触发 `onInvalidate_` —— 类组件的 forceupdate 方法完成组件更新。

![mobx4](/blog/images/react/mobx4.png)

### Mobx 与 Redux 区别

- 首先在 Mobx 在上手程度上，要优于 Redux ，比如 Redux 想使用异步，需要配合中间价，流程比较复杂。
- Redux 对于数据流向更规范化，Mobx 中数据更加多样化，允许数据冗余。
- Redux 整体数据流向简单，Mobx 依赖于 Proxy， Object.defineProperty 等，劫持属性 get ，set ，数据变化多样性。
- Redux 可拓展性比较强，可以通过中间件自定义增强 dispatch 。
在 Redux 中，基本有一个 store ，统一管理 store 下的状态，在 mobx 中可以有多个模块，可以理解每一个模块都是一个 store ，相互之间是独立的。
