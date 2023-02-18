# React HOC

高阶组件可以看作 React 对装饰模式的一种实现，高阶组件就是一个函数，且该函数接受一个组件作为参数，并返回一个新的组件，他会返回一个增强的 React 组件，高阶组件可以让我们的代码更具有**复用性，逻辑性与抽象性**，可以对 render 方法进行劫持，也可以控制 props 与 state 等。**高阶组件就是一个没有副作用的纯函数**。

## 高阶组件能解决什么问题

HOC 的产生根本作用就是解决大量的**代码复用，逻辑复用**问题。既然说到了逻辑复用，那么具体复用了哪些逻辑呢？

- 首先第一种就是**拦截问题**，本质上是**对渲染的控制**，对渲染的控制可不仅仅指**是否渲染组件**，还可以像 dva 中 dynamic 那样**懒加载/动态加载组件**。

- 还有一种场景，比如项目中想让一个非 Route 组件，也能通过 props 获取路由实现跳转，但是**不想通过父级路由组件层层绑定 props** ，这个时候就需要一个 HOC 把改变路由的 history 对象混入 props 中，于是 withRoute 诞生了。所以 HOC 还有一个重要的作用就是**让 props 中混入一些你需要的东西**。

- 还有一种情况，如果不想改变组件，只是**监控组件的内部状态，对组件做一些赋能**，HOC 也是一个不错的选择，比如对组件内的点击事件做一些监控，或者加一次额外的生命周期，开源项目 react-keepalive-router，可以缓存页面，项目中的 keepaliveLifeCycle 就是通过 HOC 方式，给业务组件增加了额外的生命周期。

高阶函数就是一个将函数作为参数并且返回值也是函数的函数。高阶组件是以组件作为参数，返回组件的函数。返回的组件把传进去的组件进行功能强化。

## 两种不同的高阶组件

常用的高阶组件有**属性代理**和**反向继承**两种，两者之间有一些共性和区别

### 属性代理

属性代理，就是用组件包裹一层代理组件，在代理组件上，可以做一些，对源组件的强化操作。这里注意**属性代理返回的是一个新组件，被包裹的原始组件，将在新的组件里被挂载**。传入原始组件，返回新组建。

```js
function HOC(WrapComponent){
    return class Advance extends React.Component{
       state={
           name:'alien'
       }
       render(){
           return <WrapComponent  { ...this.props } { ...this.state }  />
       }
    }
}
```

优点：

- 属性代理可以和业务组件低耦合，零耦合，对于条件渲染和 props 属性增强，只负责控制子组件渲染和传递额外的 props 就可以了，所以无须知道，业务组件做了些什么。所以正向属性代理，更适合做一些开源项目的 HOC ，目前开源的 HOC 基本都是通过这个模式实现的。
- 同样适用于类组件和函数组件。
- 可以完全隔离业务组件的渲染，因为属性代理说白了是一个新的组件，相比反向继承，可以完全控制业务组件是否渲染。
- 可以嵌套使用，多个 HOC 是可以嵌套使用的，而且一般不会限制包装 HOC 的先后顺序。

缺点：

- 一般无法直接获取原始组件的状态，如果想要获取，需要 ref 获取组件实例。
- 无法直接继承静态属性。如果需要继承需要手动处理，或者引入第三方库。
- 因为本质上是产生了一个新组件，所以需要配合 forwardRef 来转发 ref。

### 反向继承

反向继承和属性代理有一定的区别，在于**包装后的组件继承了原始组件本身**，所以此时无须再去挂载业务组件。直接继承需要包装的组件（原组件）

```js
class Index extends React.Component{
  render(){
    return <div> hello,world  </div>
  }
}
function HOC(Component){
    return class wrapComponent extends Component{ /* 直接继承需要包装的组件 */
        
    }
}
export default HOC(Index) 
```

优点：

- 方便获取组件内部状态，比如 state ，props ，生命周期，绑定的事件函数等。
- es6继承可以良好继承静态属性。所以无须对静态属性和方法进行额外的处理。

缺点：

- 函数组件无法使用。
- 和被包装的组件耦合度高，需要知道被包装的原始组件的内部状态，具体做了些什么？
- 如果多个反向继承 HOC 嵌套在一起，当前状态会覆盖上一个状态。这样带来的隐患是非常大的，比如说有多个 componentDidMount ，当前 componentDidMount 会覆盖上一个 componentDidMount 。这样副作用串联起来，影响很大。

## 高阶组件的功能

### 强化 props

强化 props 就是**在原始组件的 props 基础上，加入一些其他的 props ，强化原始组件功能**。举个例子，为了让组件也可以获取到路由对象，进行路由跳转等操作，所以 React Router 提供了类似 withRouter 的 HOC 。

```js
function withRouter(Component) {
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  const C = props => {
      /*  获取 */
    const { wrappedComponentRef, ...remainingProps } = props;
    return (
      <RouterContext.Consumer>
        {context => {
          return (
            <Component
              {...remainingProps} // 组件原始的props 
              {...context}        // 存在路由对象的上下文，history  location 等 
              ref={wrappedComponentRef}
            />
          );
        }}
      </RouterContext.Consumer>
    );
  };

  C.displayName = displayName;
  C.WrappedComponent = Component;
  /* 继承静态属性 */
  return hoistStatics(C, Component);
}
export default withRouter
```

流程分析：

- 分离出 props 中 wrappedComponentRef 和 remainingProps ， remainingProps 是原始组件真正的 props， wrappedComponentRef 用于转发 ref。
- 用 Context.Consumer 上下文模式获取保存的路由信息。（ React Router 中路由状态是通过 context 上下文保存传递的）
- 将路由对象和原始 props 传递给原始组件，所以可以在原始组件中获取 history ，location 等信息。

### 控制渲染

#### 渲染劫持

HOC 反向继承模式，可以通过 `super.render()` 得到 render 之后的内容，利用这一点，可以做渲染劫持 ，更有甚者可以修改 render 之后的 React element 对象。

```js
const HOC = (WrapComponent) =>
  class Index  extends WrapComponent {
    render() {
      if (this.props.visible) {
        return super.render()
      } else {
        return <div>暂无数据</div>
      }
    }
  }

```

#### 修改渲染树

```js
class Index extends React.Component{
  render(){
    return <div>
       <ul>
         <li>react</li>
         <li>vue</li>
         <li>Angular</li>
       </ul>
    </div>
  }
}
function HOC (Component){
  return class Advance extends Component {
    render() {
      const element = super.render()
      const otherProps = {
        name:'alien'
      }
      /* 替换 Angular 元素节点 */
      const appendElement = React.createElement('li' ,{} , `hello ,world , my name  is ${ otherProps.name }` )
      const newchild =  React.Children.map(element.props.children.props.children,(child,index)=>{
           if(index === 2) return appendElement
           return  child
      }) 
      return  React.cloneElement(element, element.props, newchild)
    }
  }
}
export  default HOC(Index)
```

#### 动态加载

dva 中 dynamic 就是配合 import ，实现组件的动态加载的，而且每次切换路由，都会有 Loading 效果，接下来看看大致的实现思路。

```js
export default function dynamicHoc(loadRouter) {
  return class Content extends React.Component {
    state = {Component: null}
    componentDidMount() {
      if (this.state.Component) return
      loadRouter()
        .then(module => module.default) // 动态加载 component 组件
        .then(Component => this.setState({Component},
         ))
    }
    render() {
      const {Component} = this.state
      return Component ? <Component {
      ...this.props
      }
      /> : <Loading />
    }
  }
}
```

```js
const Index = AsyncRouter(()=>import('../pages/index'))
```

Index 组件中，在 componentDidMount 生命周期动态加载上述的路由组件 Component，如果在切换路由或者没有加载完毕时，显示的是 Loading 效果。

### 组件赋能

#### ref 获取实例

对于属性代理虽然不能直接获取组件内的状态，但是可以**通过 ref 获取组件实例，获取到组件实例，就可以获取组件的一些状态，或是手动触发一些事件，进一步强化组件**，但是注意的是：**类组件才存在实例，函数组件不存在实例**。

```js
function Hoc(Component){
  return class WrapComponent extends React.Component{
      constructor(){
        super()
        this.node = null /* 获取实例，可以做一些其他的操作。 */
      }
      render(){
        return <Component {...this.props}  ref={(node) => this.node = node }  />
      }
  }
}
```

#### 事件监控

HOC 不一定非要对组件本身做些什么？也可以单纯增加一些事件监听，错误监控。

```js
function ClickHoc (Component){
  return  function Wrap(props){
    const dom = useRef(null)
    useEffect(()=>{
       const handerClick = () => console.log('发生点击事件') 
       dom.current.addEventListener('click',handerClick)
     return () => dom.current.removeEventListener('click',handerClick)
    },[])
    return  <div ref={dom}  ><Component  {...props} /></div>
  }
}

@ClickHoc
class Index extends React.Component{
   render(){
     return <div className='index'  >
       <p>hello，world</p>
       <button>组件内部点击</button>
    </div>
   }
}
export default ()=>{
  return <div className='box'  >
     <Index />
     <button>组件外部点击</button>
  </div>
}
```

### 小结

HOC 具体能实现以下几个功能：

1. 强化 props ，可以通过 HOC ，向原始组件混入一些状态。
2. 渲染劫持，可以利用 HOC ，动态挂载原始组件，还可以先获取原始组件的渲染树，进行可控性修改。
3. 可以配合 import 等 api ，实现动态加载组件，实现代码分割，加入 loading 效果。
4. 可以通过 ref 来获取原始组件实例，操作实例下的属性和方法。
5. 可以对原始组件做一些事件监听，错误监控等。

## 高价组件注意事项

### 谨慎修改原型链

```js
function HOC (Component){
  const proDidMount = Component.prototype.componentDidMount 
  Component.prototype.componentDidMount = function(){
     console.log('劫持生命周期：componentDidMount')
     proDidMount.call(this)
  }
  return  Component
}
```

如上 HOC 作用仅仅是修改了原来组件原型链上的 componentDidMount 生命周期。但是这样有一个弊端就是如果再用另外一个 HOC 修改原型链上的 componentDidMount ，那么这个 HOC 的功能即将失效。

### 不要在函数组件内部或类组件 render 函数中使用 HOC

错误写法

```js
class Index extends React.Component{
  render(){
     const WrapHome = HOC(Home)
     return <WrapHome />
  }
}

function Index(){
     const WrapHome = HOC(Home)
     return  <WrapHome />
}
```

这么写的话每一次类组件触发 render 或者函数组件执行都会产生一个新的WrapHome，react diff 会判定两次不是同一个组件，那么就会卸载老组件，重新挂载新组件，老组件内部的真实 DOM 节点，都不会合理的复用，从而造成了性能的浪费，而且原始组件会被初始化多次。

### ref 的处理

高阶组件的约定是将所有 props 传递给被包装组件，但这对于 ref 并不适用。那是因为 ref 实际上并不是一个 prop ， 就像 key 一样，对于 ref 属性它是由 React 专门处理的。那么如何通过 ref 正常获取到原始组件的实例呢？在 ref 章节已经讲到，可以用 forwardRef做 ref 的转发处理。

### 注意多个 HOC 嵌套顺序问题

多个 HOC 嵌套，应该留意一下 HOC 的顺序，还要分析出要各个 HOC 之间是否有依赖关系。

对于 class 声明的类组件，可以用装饰器模式，对类组件进行包装：

```js
@HOC1(styles)
@HOC2
@HOC3
class Index extends React.Componen{
    /* ... */
}
```

函数组件：

```js
function Index(){
    /* .... */
}
export default HOC1(styles)(HOC2( HOC3(Index) )) 
```

HOC1 -> HOC2 -> HOC3 -> Index。要注意一下包装顺序，越靠近 Index 组件的，就是越内层的 HOC ,离组件 Index 也就越近。

还有一些其他的小细节：

1. 如果2个 HOC 相互之间有依赖。比如 HOC1 依赖 HOC2 ，那么 HOC1 应该在 HOC2 内部。

2. 如果想通过 HOC 方式给原始组件添加一些额外生命周期，因为涉及到获取原始组件的实例 instance ，那么当前的 HOC 要离原始组件最近。

### 继承静态属性

上述讲到在属性代理 HOC 本质上返回了一个新的 component ，那么如果给原来的 component 绑定一些静态属性方法，如果不处理，新的 component 上就会丢失这些静态属性方法。那么如何解决这个问题呢。

#### 手动继承

当然可以手动将原始组件的静态方法 copy 到 HOC 组件上来，但前提是必须准确知道应该拷贝哪些方法。

```js
function HOC(Component) {
  class WrappedComponent extends React.Component {
      /*...*/
  }
  // 必须准确知道应该拷贝哪些方法 
  WrappedComponent.staticMethod = Component.staticMethod
  return WrappedComponent
}
```

#### 引入第三方库

每个静态属性方法都手动绑定会很累，尤其对于开源的 HOC ，对原生组件的静态方法是未知 ，为了解决这个问题可以使用 hoist-non-react-statics 自动拷贝所有的静态方法:

```js
import hoistNonReactStatic from 'hoist-non-react-statics'
function HOC(Component) {
  class WrappedComponent extends React.Component {
      /*...*/
  }
  hoistNonReactStatic(WrappedComponent,Component)
  return WrappedComponent
}
```

## HOC 实现权限拦截

思路：

1. 需要权限的页面或者组件，用 HOC 包裹，并输入唯一的权限签名。
2. 用 Context 上下文保存全局的权限菜单列表，用 Provider 注入异步获取到的权限菜单。
3. HOC 中用 Consumer 获取权限列表，并且和签名做匹配，如果有权限，就展示，如果没有权限，展示默认没有权限组件。

### 在根部注入权限

```js
export const Permission = React.createContext([]) 

export default function Index(){
    const [ rootPermission , setRootPermission ] = React.useState([])
    React.useEffect(()=>{
        /* 获取权限列表 */
        getRootPermission().then(res=>{
            const { code , data } = res as any
            code === 200 && setRootPermission(data) //  [ 'docList'  , 'tagList' ]
        }) 
    },[])
    return <Permission.Provider value={rootPermission} >
         <RootRouter/>
    </Permission.Provider>
}
```

- useState 用于动态注入获取的权限列表。
- 根组件通过 Context.Provider 包裹。权限列表改变，所有消费权限列表的组件重新更新。 （假设一下数据交互返回的权限列表`[ 'docList' , 'tagList' ]）`

### 重点编写 HOC

```js
/* 没有权限 */
function NoPermission (){
    return <div>您暂时没有权限，请联系管理员开通权限！</div>
}
/* 编写HOC */
export function PermissionHoc(authorization){
    return function(Component){ 
        return function Home (props){
            const matchPermission =(value,list)=> list.indexOf(value) /* 匹配权限 */
            return <Permission.Consumer>
                {
                    (permissionList) => matchPermission(authorization,permissionList) >= 0 ? <Component  {...props} /> : <NoPermission />
                }
            </Permission.Consumer>
        }
    }
}
```

1. 用两层包装函数的 HOC，第一层用于获取 HOC 绑定的当前组件的权限签名，因为要用这个权限签名和权限列表做匹配。第二层接受的原始组件。
2. 在 HOC 中用 Context.Consumer 接收权限列表，做权限匹配。组件有权限展示，没有权限展示无权限组件。

### 绑定权限

```js
@PermissionHoc('writeDoc')  // 绑定文档录入页面
export default class Index extends React.Component{}

export default PermissionHoc('writeTag')(index) //绑定标签录入页面
export default PermissionHoc('tagList')(index) //绑定标签列表页面
export default PermissionHoc('docList')(Index) // 绑定文档列表页面
```

对于业务组件进行权限 HOC 的包裹。因为上述模拟数据返回的是 `[ 'docList' , 'tagList' ]`，所以最终只能看到 标签列表 和 文档列表 页面。

## 从 Mixin 到 HOC 再到 Hook

代码及状态逻辑复用 - 从 Mixin 到 HOC/Render Props 再到 Hook

![hoc1](/blog/images/react/hoc1.png)

组件复用的 4 种方式

- Mixin
- HOC
- Render Props
- Hooks

### Minix

`Mixin`（混入）是一种通过扩展收集功能的方式，它本质上是将一个对象的属性拷贝到另一个对象上面去，不过你可以拷贝`任意多`个对象的`任意个`方法到一个新对象上去，这是`继承`所不能实现的。它的出现主要就是为了解决代码复用问题。

例如下面的例子，很多组件或页面都需要记录用户行为，性能指标等。如果我们在每个组件都引入写日志的逻辑，会产生大量重复代码，通过`Mixin`我们可以解决这一问题：

```javascript
var LogMixin = {
  log: function() {
    console.log('log');
  },
  componentDidMount: function() {
    console.log('in');
  },
  componentWillUnmount: function() {
    console.log('out');
  }
};

var User = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});

var Goods = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});
```

React 官方文档在[Mixins Considered Harmful](https://link.juejin.cn?target=https%3A%2F%2Freact.docschina.org%2Fblog%2F2016%2F07%2F13%2Fmixins-considered-harmful.html)一文中提到了Mixin带来了危害：

- Mixin 可能会相互依赖，相互耦合，不利于代码维护
- 不同的 Mixin 中的方法可能会相互冲突
- Mixin 非常多时，组件是可以感知到的，甚至还要为其做相关处理，这样会给代码造成滚雪球式的复杂性

而`HOC`的出现可以解决这些问题：

- 高阶组件就是一个没有副作用的纯函数，各个高阶组件不会互相依赖耦合
- 高阶组件也有可能造成冲突，但我们可以在遵守约定的情况下避免这些行为
- 高阶组件并不关心数据使用的方式和原因，而被包裹的组件也不关心数据来自何处。高阶组件的增加不会为原组件增加负担

React 现在已经不再推荐使用 Mixin 来解决代码复用问题，因为 Mixin 带来的危害比他产生的价值还要巨大，并且 React 全面推荐使用高阶组件（HOC）来替代它。

### HOC 总览

![hoc2](/blog/images/react/hoc2.png)

### HOC 的实现

不要试图以任何方式在 HOC 中修改组件原型，而应该使用组合的方式，通过将组件包装在容器组件中实现功能。通常情况下，实现高阶组件的方式有以下两种:

- 属性代理 Props Proxy。
- 反向继承 Inheritance Inversion。

#### 属性代理

函数返回一个我们自己定义的组件，然后在 render 中返回要包裹的组件，这样我们就可以代理所有传入的 props，并且决定如何渲染，实际上 ，这种方式生成的高阶组件就是原组件的父组件。

- 可操作所有传入的 props
- 可操作组件的生命周期
- 可操作组件的 static 方法
- 获取 refs

```typescript
function proxyHOC(WrappedComponent) {
  return class extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
}
```

#### 反向继承

返回一个组件，继承原组件，在 render 中调用原组件的 render。由于继承了原组件，能通过 this 访问到原组件的生命周期、props、state、render 等，相比属性代理它能操作更多的属性。

- 可操作所有传入的 props
- 可操作组件的生命周期
- 可操作组件的 static 方法
- 获取 refs
- 可操作 state
- 可以渲染劫持

```typescript
function inheritHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      return super.render();
    }
  }
}
```

### HOC 可以解决什么问题

HOC 具体能实现以下几个功能：

1. 强化 props ，可以通过 HOC ，向原始组件混入一些状态。
2. 渲染劫持，可以利用 HOC ，动态挂载原始组件，还可以先获取原始组件的渲染树，进行可控性修改。
3. 可以配合 import 等 api ，实现动态加载组件，实现代码分割，加入 loading 效果。
4. 可以通过 ref 来获取原始组件实例，操作实例下的属性和方法。
5. 可以对原始组件做一些事件监听，错误监控等。

#### 强化 props

可以对传入组件的 props 进行增加、修改、删除或者根据特定的 props 进行特殊的操作。

```typescript
// 属性代理
function proxyHOC(WrappedComponent) {
  return class extends Component {
    render() {
      const newProps = {
        ...this.props,
        user: 'ConardLi'
      }
      return <WrappedComponent {...newProps} />;
    }
  }
}
```

#### 渲染劫持 - 组合渲染

可使用任何其他组件和原组件进行组合渲染，达到样式、布局复用等效果。

```typescript
// 属性代理
function stylHOC(WrappedComponent) {
  return class extends Component {
    render() {
      return (<div>
        <div className="title">{this.props.title}</div>
        <WrappedComponent {...this.props} />
      </div>);
    }
  }
}

// 反向代理
function styleHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      return <div>
        <div className="title">{this.props.title}</div>
        {super.render()}
      </div>
    }
  }
}
```

#### 渲染劫持 - 条件渲染

根据特定的属性决定原组件是否渲染

```typescript
// 属性代理
function visibleHOC(WrappedComponent) {
  return class extends Component {
    render() {
      if (this.props.visible === false) return null;
      return <WrappedComponent {...props} />;
    }
  }
}

// 反向代理
function visibleHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      if (this.props.visible === false) {
        return null
      } else {
        return super.render()
      }
    }
  }
}
```

#### 渲染劫持

高阶组件可以在 render 函数中做非常多的操作，从而控制原组件的渲染输出。只要改变了原组件的渲染，我们都将它称之为一种渲染劫持。

实际上，上面的组合渲染和条件渲染都是渲染劫持的一种，通过反向继承，不仅可以实现以上两点，还可直接增强由原组件render函数产生的React元素。

```typescript
function hijackHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      const tree = super.render();
      let newProps = {};
      if (tree && tree.type === 'input') {
        newProps = { value: '渲染被劫持了' };
      }
      const props = Object.assign({}, tree.props, newProps);
      const newTree = React.cloneElement(tree, props, tree.props.children);
      return newTree;
    }
  }
}

注意上面的说明我用的是增强而不是更改。
render函数内实际上是调用 React.creatElement 产生的React元素，
所有属性是不可变的，不能直接修改，
我们可以借助 cloneElement 方法来在原组件的基础上增强一个新组件
```

#### 获取 refs

高阶组件中可获取原组件的 ref，通过 ref 获取组件实例：

调用高阶组件的时候并不能获取到原组件的真实 ref，需要手动进行传递

```typescript
function refHOC(WrappedComponent) {
  return class extends Component {
    componentDidMount() {
      this.wapperRef.log()
    }
    render() {
      return <WrappedComponent {...this.props} ref={ref => { this.wapperRef = ref }} />;
    }
  }
}

function logProps(Component) {
  class LogProps extends React.Component { 
    render() {
      const {forwardedRef, ...rest} = this.props;
      // 将自定义的 prop 属性 “forwardedRef” 定义为 ref
      return <Component ref={forwardedRef} {...rest} />;
    }
  }

  // 注意 React.forwardRef 回调的第二个参数 “ref”。
  // 我们可以将其作为常规 prop 属性传递给 LogProps，例如 “forwardedRef”
  // 然后它就可以被挂载到被 LogProps 包裹的子组件上。
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
```

#### 状态管理

将原组件的状态提取到 HOC 中进行管理，如下面的代码，我们将 Input 的 value 提取到 HOC 中进行管理，使它变成受控组件，同时不影响它使用 onChange 方法进行一些其他操作。基于这种方式，我们可以实现一个简单的双向绑定。利用高阶组件将新组件的状态装入到被包装组件中，例如我们可以使用高阶组件将非受控组件转化为受控组件。

```typescript
function proxyHoc(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = { value: '' };
    }

    onChange = (event) => {
      const { onChange } = this.props;
      this.setState({
        value: event.target.value,
      }, () => {
        if(typeof onChange ==='function'){
          onChange(event);
        }
      })
    }

    render() {
      const newProps = {
        value: this.state.value,
        onChange: this.onChange,
      }
      return <WrappedComponent {...this.props} {...newProps} />;
    }
  }
}

class HOC extends Component {
  render() {
    return <input {...this.props}></input>
  }
}

export default proxyHoc(HOC);
```

#### 操作 state

面的例子通过属性代理利用 HOC 的 state 对原组件进行了一定的增强，但并不能直接控制原组件的 state，而通过反向继承，我们可以直接操作原组件的 state。但是并不推荐直接修改或添加原组件的 state，因为这样有可能和组件内部的操作构成冲突。

```typescript
function debugHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      console.log('props', this.props);
      console.log('state', this.state);
      return (
        <div className="debuging">
          {super.render()}
        </div>
      )
    }
  }
}
上面的 HOC 在 render 中将 props 和 state 打印出来，可以用作调试阶段，
当然你可以在里面写更多的调试代码。

想象一下，只需要在我们想要调试的组件上加上@debug就可以对该组件进行调试，
而不需要在每次调试的时候写很多冗余代码。
```

### 如何使用 HOC

在实际应用中，一个组件可能被多个HOC增强，我们使用的是被所有的HOC增强后的组件。

#### compose

很多第三方库都提供了类似 compose 的函数，例如 lodash.flowRight，Redux 提供的 combineReducers 函数等。

```typescript
logger(visible(style(Input)))

// 转换
const compose = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)));
compose(logger,visible,style)(Input);
```

#### decorators

借助 ES7 为我们提供的 Decorators 来让我们的写法变的更加优雅

```typescript
// babel 配置:  "plugins": ["transform-decorators-legacy"]
@logger
@visible
@style
class Input extends Component {
  // ...
}

// 结合 compose 使用
const hoc = compose(logger, visible, style);
@hoc
class Input extends Component {
  // ...
}
```

### HOC 常见使用场景

#### 日志打点

某些页面需要记录用户行为，性能指标等等，通过高阶组件做这些事情可以省去很多重复代码。这属于一类最常见的应用，多个组件拥有类似的逻辑，我们要对重复的逻辑进行复用。

```typescript
function logHoc(WrappedComponent) {
  return class extends Component {
    componentWillMount() {
      this.start = Date.now();
    }
    componentDidMount() {
      this.end = Date.now();
      console.log(`${WrappedComponent.dispalyName} 渲染时间：${this.end - this.start} ms`);
      console.log(`${user}进入${WrappedComponent.dispalyName}`);
    }
    componentWillUnmount() {
      console.log(`${user}退出${WrappedComponent.dispalyName}`);
    }
    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}
```

#### 可用、权限控制

```typescript
function auth(WrappedComponent) {
  return class extends Component {
    render() {
      const { visible, auth, display = null, ...props } = this.props;
      if (visible === false || (auth && authList.indexOf(auth) === -1)) {
        return display
      }
      return <WrappedComponent {...props} />;
    }
  }
}

authList 是我们在进入程序时向后端请求的所有权限列表，当组件所需要的权限不列表中，
或者设置的 visible 是 false，我们将其显示为传入的组件样式，或者 null。
我们可以将任何需要进行权限校验的组件应用 HOC：

@auth
class Input extends Component {  ...  }
@auth
class Button extends Component {  ...  }

<Button auth="user/addUser">添加用户</Button>
<Input auth="user/search" visible={false} >添加用户</Input>
```

#### 双向绑定

在 vue 中，绑定一个变量后可实现双向数据绑定，即表单中的值改变后绑定的变量也会自动改变。而 React 中没有做这样的处理，在默认情况下，表单元素都是非受控组件。给表单元素绑定一个状态后，往往需要手动书写onChange 方法来将其改写为受控组件，在表单元素非常多的情况下这些重复操作是非常痛苦的。

我们可以借助高阶组件来实现一个简单的双向绑定：

![hoc3](/blog/images/react/hoc3.png)

#### 表单校验

基于上面的双向绑定的例子，我们再来一个表单验证器，表单验证器可以包含验证函数以及提示信息，当验证不通过时，展示错误信息：

```typescript
function validateHoc(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = { error: '' }
    }
    onChange = (event) => {
      const { validator } = this.props;
      if (validator && typeof validator.func === 'function') {
        if (!validator.func(event.target.value)) {
          this.setState({ error: validator.msg })
        } else {
          this.setState({ error: '' })
        }
      }
    }
    render() {
      return <div>
        <WrappedComponent onChange={this.onChange}  {...this.props} />
        <div>{this.state.error || ''}</div>
      </div>
    }
  }
}


const validatorName = {
  func: (val) => val && !isNaN(val),
  msg: '请输入数字'
}
const validatorPwd = {
  func: (val) => val && val.length > 6,
  msg: '密码必须大于6位'
}
<HOCInput validator={validatorName} v_model="name"></HOCInput>
<HOCInput validator={validatorPwd} v_model="pwd"></HOCInput>
```

#### Redux 的 connect

redux 中的 connect，其实就是一个 HOC，下面就是一个简化版的 connect 实现：

```typescript
// connect函数其实就做了一件事，将 mapStateToProps 和 mapDispatchToProps 
// 分别解构后传给原组件，
// 这样我们在原组件内就可以直接用 props 获取 state 以及 dispatch 函数了
export const connect = (mapStateToProps, mapDispatchToProps) => (WrappedComponent) => {
  class Connect extends Component {
    static contextTypes = {
      store: PropTypes.object
    }

    constructor () {
      super()
      this.state = {
        allProps: {}
      }
    }

    componentWillMount () {
      const { store } = this.context
      this._updateProps()
      store.subscribe(() => this._updateProps())
    }

    _updateProps () {
      const { store } = this.context
      let stateProps = mapStateToProps ? mapStateToProps(store.getState(), this.props): {} 
      let dispatchProps = mapDispatchToProps? mapDispatchToProps(store.dispatch, this.props) : {} 
      this.setState({
        allProps: {
          ...stateProps,
          ...dispatchProps,
          ...this.props
        }
      })
    }

    render () {
      return <WrappedComponent {...this.state.allProps} />
    }
  }
  return Connect
}
```

### HOC 使用注意事项

#### 告诫 — 静态属性拷贝

当我们应用HOC去增强另一个组件时，我们实际使用的组件已经不是原组件了，所以我们拿不到原组件的任何静态属性，我们可以在HOC的结尾手动拷贝他们：

```typescript
function proxyHOC(WrappedComponent) {
  class HOCComponent extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  HOCComponent.staticMethod = WrappedComponent.staticMethod;
  // ... 
  return HOCComponent;
}
```

如果原组件有非常多的静态属性，这个过程是非常痛苦的，而且你需要去了解需要增强的所有组件的静态属性是什么，我们可以使用[hoist-non-react-statics](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fmridgway%2Fhoist-non-react-statics)来帮助我们解决这个问题，它可以自动帮我们拷贝所有非React的静态方法，使用方式如下：

```typescript
import hoistNonReactStatic from 'hoist-non-react-statics';
function proxyHOC(WrappedComponent) {
  class HOCComponent extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  hoistNonReactStatic(HOCComponent,WrappedComponent);
  
  return HOCComponent;
}
```

#### 告诫 — 传递 refs

使用高阶组件后，获取到的 ref 实际上是最外层的容器组件，而非原组件，但是很多情况下我们需要用到原组件的ref。高阶组件并不能像透传 props 那样将 refs 透传，我们可以用一个回调函数来完成 ref 的传递：

```typescript
function hoc(WrappedComponent) {
  return class extends Component {
    getWrappedRef = () => this.wrappedRef;
    render() {
      return <WrappedComponent ref={ref => { this.wrappedRef = ref }} {...this.props} />;
    }
  }
}

@hoc
class Input extends Component {
  render() { return <input></input> }
}
class App extends Component {
  render() {
    return (
      <Input ref={ref => { this.inpitRef = ref.getWrappedRef() }} ></Input>
    );
  }
}
```

React 16.3 版本提供了一个 forwardRef API 来帮助我们进行refs传递，这样我们在高阶组件上获取的 ref 就是原组件的 ref 了，而不需要再手动传递，如果你的 React 版本大于 16.3，可以使用下面的方式:

```typescript
function hoc(WrappedComponent) {
  class HOC extends Component {
    render() {
      const { forwardedRef, ...props } = this.props;
      return <WrappedComponent ref={forwardedRef} {...props} />;
    }
  }
  return React.forwardRef((props, ref) => {
    return <HOC forwardedRef={ref} {...props} />;
  });
}
```

#### 告诫 — 不要在 render 方法内创建高阶组件

React Diff 算法的原则是：

- 使用组件标识确定是卸载还是更新组件
- 如果组件的和前一次渲染时标识是相同的，递归更新子组件
- 如果标识不同卸载组件重新挂载新组件

每次调用高阶组件生成的都是一个全新的组件，组件的唯一标识响应的也会改变，如果在 render 方法调用了高阶组件，这会导致组件每次都会被卸载后重新挂载。

#### 约定 — 不要改变原始组件

高阶组件就是一个没有副作用的纯函数。如果我们在高阶组件对原组件进行了修改，例如下面的代码：

```typescript
InputComponent.prototype.componentWillReceiveProps = function(nextProps) { ... }
```

这样就破坏了我们对高阶组件的约定，同时也改变了使用高阶组件的初衷：我们使用高阶组件是为了增强而非改变原组件。

#### 约定 — 透传不相关的props

使用高阶组件，我们可以代理所有的 props，但往往特定的 HOC 只会用到其中的一个或几个 props。我们需要把其他不相关的 props 透传给原组件，如下面的代码：

```typescript
// 我们只使用visible属性来控制组件的显示可隐藏，把其他props透传下去。
function visible(WrappedComponent) {
  return class extends Component {
    render() {
      const { visible, ...props } = this.props;
      if (visible === false) return null;
      return <WrappedComponent {...props} />;
    }
  }
}
```

#### 约定 — displayName

在使用React Developer Tools进行调试时，如果我们使用了HOC，调试界面可能变得非常难以阅读。

为了方便调试，我们可以手动为HOC指定一个displayName，官方推荐使用HOCName(WrappedComponentName)：

```typescript
static displayName = `Visible(${WrappedComponent.displayName})`
```

#### HOC 的缺陷

- **扩展性限制**: HOC 并不能完全替代 Mixin，一些场景下，Mixin 可以而 HOC 做不到，比如 PureRenderMixin，因为 HOC 无法从外部访问子组件的 state，同时通过 shouldComponentUpdate 滤掉不必要的更新，因此，React 在支持 ES6 Class 之后提供了  React.PureComponent  来解决这个问题。
- **Ref 传递问题**: Ref 被隔断，Ref 的传递问题在层层包装下相当恼人，函数 Ref 能够缓解一部分(让 HOC 得以获知节点创建与销毁)，以致于后来有了 React.forwardRef API。
- **WrapperHell:** HOC 泛滥，出现 WrapperHell (没有包一层解决不了的问题，如果有，那就包两层)，多层抽象同样增加了复杂度和理解成本，这是最关键的缺陷，而 HOC 模式下没有很好的解决办法。
- **props 冲突**：HOC 可以劫持 props，在不遵守约定的情况下也可能造成冲突。

### Render Props

`render props` 指在一种 React 组件之间使用一个值为函数的 props 共享代码的简单技术，具有 `render props` 的组件接收一个函数，该函数返回一个 React 元素并调用它而不是实现一个自己的渲染逻辑，render props 是一个用于告知组件需要渲染什么内容的函数 props，也是组件逻辑复用的一种实现方式，简单来说就是在被复用的组件中，通过一个名为 render(属性名也可以不是render，只要值是一个函数即可)的 prop 属性，该属性是一个函数，这个函数接受一个对象并返回一个子组件，会将这个函数参数中的对象作为 props 传入给新生成的组件，而在使用调用者组件这里，只需要决定这个组件在哪里渲染以及该以何种逻辑渲染并传入相关对象即可。

对比 HOC 与 Render Props，技术上，二者都基于组件组合机制，Render Props 拥有与 HOC 一样的扩展能力。称之为 `Render Props`，并不是说只能用来复用渲染逻辑，而是表示在这种模式下，组件是通过 render() 组合起来的，类似于 HOC 模式下通过 Wrapper 的 render() 建立组合关系形式上，二者非常相像，同样都会产生一层Wrapper，而实际上 Render Props 与 HOC 甚至能够相互转换。

同样，`Render Props` 也会存在一些问题:

- 数据流向更直观了，子孙组件可以很明确地看到数据来源，但本质上Render Props是基于闭包实现的，大量地用于组件的复用将不可避免地引入了 callback hell 问题。
- 丢失了组件的上下文，因此没有 `this.props` 属性，不能像 HOC 那样访问 `this.props.children`。

### 使用 Hooks 的动机

为什么要引入Hooks ？Hooks解决了什么问题？

在 hooks 之前组件状态复用有以下几个痛点：

**1. 组件复用逻辑难 - 减少状态逻辑复用的风险和地狱式嵌套**

没有 hooks 之前使用 render props（渲染属性） 、 HOC （高阶组件）以及 状态管理框架。render props 是接受一个组件作为props， HOC 是一个函数，接受一个组件作为参数，返回另一个组件。但无论是渲染属性，还是高阶组件，都会在原先的组件外包裹一层父容器（一般都是 div 元素），导致层级冗余，形成“嵌套地狱”，调试困难。类组件有着耦合性高的缺点，数据之间和功能部分的重复较高，数据问题 Redux 和 flux 解决了问题。hooks的出现就是为了解决功能复用的问题。

- Hook 和 Mixin 在用法上有一定的相似之处，但是 Mixin 引入的逻辑和状态是可以相互覆盖的，而多个Hook之间互不影响，这让我们不需要在把一部分精力放在防止避免逻辑复用的冲突上。
- HOC 的使用在不遵守约定的情况下使用也有可能带来一定冲突，比如 props 覆盖等等，使用 Hook 则可以避免这些问题。

**2. 复杂组件状态逻辑多 - 让组件更易理解**

很多组件在最开始写的时候都是很简单的，基本上就是只做一件事，当你的业务逻辑变得复杂之后，组件也会变得复杂起来。大多数情况下，我们不大可能把组件拆分的更小，因为可能有很多共用的状态逻辑，拆分后，组件之间的通信也会很复杂，甚至需要引用 Redux 来管理组件之间的状态。类组件中到处都是对状态的访问和处理，导致组件难以拆分成更小的组件。使用Hook，可以让你更大限度的将公用逻辑抽离，将一个组件分割成更小的函数，而不是强制基于生命周期方法进行分割。

**3. class学习成本高 - 函数替代 class**

相比函数，编写一个 class 可能需要掌握更多的知识，需要注意的点也越多，比如 this 指向、绑定事件等等。另外，计算机理解一个函数比理解一个 class 更快。Hooks 让你可以在 class 之外使用更多 React 的新特性。

Redux 的作者 Dan Abramov 总结了类组件的几个缺点：

- 大型组件很难拆分和重构，也很难测试。
- 业务逻辑分散在组件的各个方法之中，导致重复逻辑或关联逻辑。
- 组件类引入了复杂的编程模式，比如 render props 和高阶组件。

**React Hooks 的意思是，组件尽量写成纯函数，如果需要外部功能和副作用，就用钩子把外部代码"钩"进来。** React Hooks 就是那些钩子。你需要什么功能，就使用什么钩子。React 默认提供了一些常用钩子，你也可以封装自己的钩子。

**hook 有以下几个作用和好处，以此解决上述痛点：**

- 让函数式组件拥有自身的状态和生命周期，在没有使用Class的情况下使用React特性。
- 让组件的通用逻辑复用更简单（跨组件复用，只共享数据处理逻辑，不会共享数据本身），避免使用HOC来复用组件的通用逻辑带来嵌套地狱的问题。
- 状态与 UI 隔离。正是由于 Hooks 的特性，状态逻辑会变成更小的粒度(**相互关联的部分拆分成更小的函数方便复用**)，并且极容易被抽象成一个自定义 Hooks，组件中的状态和 UI 变得更为清晰和隔离。

**hook 也有以下几个缺点：**

- 额外的学习成本，主要在于 Functional Component 与 Class Component 之间的比较上。
- 写法上有限制(不能出现在条件、循环中)，并且写法限制增加了重构成本。
- 破坏了 PureComponent、React.memo 浅比较的性能优化效果，为了取最新的 props 和 state，每次 render() 都要重新创建事件处函数。
- 在闭包场景可能会引用到旧的state、props值。
- 内部实现上不直观，依赖一份可变的全局状态，不再那么pure。
- React.memo 并不能完全替代 shouldComponentUpdate (因为拿不到 state change，只针对 props change)。
- useState API 设计上不太完美。

### hooks 注意事项

#### 不是所有的依赖都必须放到依赖数组中

useEffect 使用规范：“useEffect 中使用到外部变量，都应该放到第二个数组参数中”，同时我们会安装 [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks#installation) 插件，来提醒自己是不是忘了某些变量。但是当满足 useEffect 使用规范时，业务需求就不能满足了。当满足业务需求时，useEffect 就不规范了。我的建议为：

- 不要使用 eslint-plugin-react-hooks 插件，或者可以选择性忽略该插件的警告。
- 只有一种情况，需要把变量放到 deps 数组中，那就是当该变量变化时，需要触发 useEffect 函数执行。而不是因为 useEffect 中用到了这个变量！

#### deps 参数不能缓解闭包问题

假如完全按第二个建议来写代码，很多人又担心，会不会造成一些不必要的闭包问题？我的结论是：闭包问题和 useEffect 的 deps 参数没有太大关系。

#### 延迟调用会存在闭包问题

在延迟调用的场景下，一定会存在闭包问题。 什么是延迟调用？使用 setTimeout、setInterval、Promise.then 等

#### useEffect 的卸载函数

通过 useRef 来保证任何时候访问的 countRef.current 都是最新的，以解决闭包问题。到这里，我重申下我对 useEffect 的建议：

- 只有变化时，需要重新执行 useEffect 的变量，才要放到 deps 中。而不是 useEffect 用到的变量都放到 deps 中。
- 在有延迟调用场景时，可以通过 ref 来解决闭包问题。

#### useCallback 建议不使用

useCallback 可以记住函数，避免函数重复生成，这样函数在传递给子组件时，可以避免子组件重复渲染，提高性能。但是使用前提是，子组件必须使用了 shouldComponentUpdate 或者 React.memo 来忽略同样的参数重复渲染。否则 useCallback 不仅没有提升性能，反而让代码可读性变的很差。建议一般项目中不用考虑性能优化的问题，也就是不要使用 useCallback 了，除非有个别非常复杂的组件，单独使用即可。期望不要用 useCallback，直接裸写函数就好。

#### useMemo 建议适当使用

useMemo 建议适当使用

#### useState 要正确使用

- 能用其他状态计算出来就不用单独声明状态：一个 state 必须不能通过其它 state/props 直接计算出来，否则就不用定义 state。
- 保证数据源唯一。在项目中同一个数据，保证只存储在一个地方。不要既存在 redux 中，又在组件中定义了一个 state 存储。不要既存在父级组件中，又在当前组件中定义了一个 state 存储。不要既存在 url query 中，又在组件中定义了一个 state 存储。
- useState 适当合并。大量使用了 useSetState 来代替 useState，来管理复杂类型的 state

[从Mixin到HOC再到Hook](https://juejin.cn/post/6844903815762673671)

[React组件逻辑复用的那些事儿](https://juejin.cn/post/6844904162472247304)

[源码解析React Hook构建过程：没有设计就是最好的设计](https://mp.weixin.qq.com/s/968ukIjEhhEOeLD5SQoKaw)

[一文吃透React高阶组件(HOC)](https://juejin.cn/post/6940422320427106335)

[React Hooks 详解](https://juejin.cn/post/6844903985338400782#heading-0)

[一文吃透react-hooks原理](https://juejin.cn/post/6944863057000529933#heading-1)
