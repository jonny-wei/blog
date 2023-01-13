# 模板编译与渲染

## 什么是模板编译

Vue会把在 `<template></template>` 标签中写的类似于 `原生HTML` 的内容进行编译，把 `原生HTML` 的内容找出来，再把 `非原生HTML` 找出来，经过一系列的逻辑处理生成渲染函数，也就是 `render函数`，而 `render函数` 会将模板内容生成对应的`VNode`，而 `VNode` 再经过前几篇文章介绍的 `patch` 过程从而得到将要渲染的视图中的 `VNode`，最后根据 `VNode` 创建 `真实的DOM节点` 并插入到视图中， 最终完成视图的渲染更新。

而把在 `<template></template>` 标签中写的类似于`原生HTML`的内容进行编译，把`原生HTML`的内容找出来，再把`非原生HTML`找出来，经过一系列的逻辑处理生成渲染函数，也就是`render函数`的这一段过程称之为**模板编译**过程。

## 模板转换成视图的过程

- Vue.js 通过编译将 template 模板转换成渲染函数 render，执行渲染函数就可以得到一个虚拟节点树。
- 在对 Model 进行操作的时候，会触发对应 Dep 中的 Watcher 对象。Watcher 对象会调用对应的 update 来修改视图。这个过程主要是将新旧虚拟节点进行差异对比，然后根据对比结果进行 DOM 操作来更新视图。

简单点讲，在 Vue 的底层实现上，Vue 将模板编译成虚拟 DOM 渲染函数。结合 Vue 自带的响应系统，在状态改变时，Vue 能够智能地计算出重新渲染组件的最小代价并应到 DOM 操作上。

![模板编译与渲染1](/blog/images/vue/模板编译与渲染1.png)

- 渲染函数：渲染函数是用来生成 Virtual DOM 的。Vue 推荐使用模板来构建我们的应用界面，在底层实现中 Vue 会将模板编译成渲染函数，当然我们也可以不写模板，直接写渲染函数，以获得更好的控制。
- VNode 虚拟节点：它可以代表一个真实的 dom 节点。通过 createElement 方法能将 VNode 渲染成 dom 节点。简单地说，vnode可以理解成节点描述对象，它描述了应该怎样去创建真实的DOM节点。
- patch：虚拟DOM最核心的部分，它可以将 vnode 渲染成真实的 DOM，这个过程是对比新旧虚拟节点之间有哪些不同，然后根据对比结果找出需要更新的的节点进行更新。这点我们从单词含义就可以看出， patch 本身就有补丁、修补的意思，其实际作用是在现有 DOM 上进行修改来实现更新视图的目的。Vue 的 Virtual DOM Patching 算法是基于 Snabbdom 的实现，并在些基础上作了很多的调整和改进。

![模板编译与渲染2](/blog/images/vue/模板编译与渲染2.png)

## 模板编译原理

之前我们分析过模板到真实 DOM 渲染的过程，中间有一个环节是把模板编译成 render 函数，这个过程我们把它称作**编译**。虽然我们可以直接为组件编写 `render` 函数，但是编写 `template` 模板更加直观，也更符合我们的开发习惯。`Vue.js` 提供了 2 个版本，一个是 `Runtime + Compiler` 的，一个是 `Runtime only` 的，前者是包含编译代码的，可以把编译过程放在运行时做，后者是不包含编译代码的，需要借助 webpack 的 `vue-loader` 事先把模板编译成 `render函数`。

### 编译入口

```js
// src\platforms\web\entry-runtime-with-compiler.js
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}
```

这段函数逻辑之前分析过，关于编译的入口就是在这里：

```js
const { render, staticRenderFns } =  compileToFunctions(template, {
    shouldDecodeNewlines,
    shouldDecodeNewlinesForHref,
    delimiters: options.delimiters,
    comments: options.comments
  }, this)
options.render = render
options.staticRenderFns = staticRenderFns
```

`compileToFunctions` 方法就是把模板 `template` 编译生成 `render` 以及 `staticRenderFns`。可以看到 compileToFunctions 方法实际上是 createCompiler 方法的返回值，该方法接收一个编译配置参数：

```js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```

`createCompiler` 方法实际上是通过调用 `createCompilerCreator` 方法返回的，该方法传入的参数是一个函数，真正的编译过程都在这个 `baseCompile` 函数里执行。`baseCompile` 才是真正的模板编译流程及原理所在。

```js
export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []
      finalOptions.warn = (msg, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      const compiled = baseCompile(template, finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        errors.push.apply(errors, detectErrors(compiled.ast))
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```

该方法返回了一个 createCompiler 的函数，它接收一个 baseOptions 的参数，返回的是一个对象，包括 compile 方法属性和 compileToFunctions 属性，这个 compileToFunctions 对应的就是 $mount 函数调用的 compileToFunctions 方法，它是调用 createCompileToFunctionFn 方法的返回值，我们接下来看一下 createCompileToFunctionFn 方法:

```js
export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production') {
      // detect possible CSP restriction
      try {
        new Function('return 1')
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          )
        }
      }
    }

    // check cache
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      return cache[key]
    }

    // compile
    const compiled = compile(template, options)

    // check compilation errors/tips
    if (process.env.NODE_ENV !== 'production') {
      if (compiled.errors && compiled.errors.length) {
        warn(
          `Error compiling template:\n\n${template}\n\n` +
          compiled.errors.map(e => `- ${e}`).join('\n') + '\n',
          vm
        )
      }
      if (compiled.tips && compiled.tips.length) {
        compiled.tips.forEach(msg => tip(msg, vm))
      }
    }

    // turn code into functions
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production') {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(
          `Failed to generate render function:\n\n` +
          fnGenErrors.map(({ err, code }) => `${err.toString()} in\n\n${code}\n`).join('\n'),
          vm
        )
      }
    }

    return (cache[key] = res)
  }
}
```

`compileToFunctions` 接收 3 个参数、`编译模板 template`，`编译配置 options` 和 `Vue 实例 vm`。

**模板编译的过程**：`template ---z> compiler(parse,optimize,generate) ---> render 函数(VNode)`

模板编译通过 Compiler 完成，compiler 可以分成 `parse`、`optimize` 与 `generate` 三个阶段，最终得到 `render function`。compile 函数在执行 `createCompileToFunctionFn` 的时候作为参数传入，它是 `createCompiler` 函数中定义的 compile 函数。Vue.js 利用了函数柯里化的技巧很好的实现了 baseOptions 的参数保留。同样，Vue.js 也是利用函数柯里化技巧把基础的编译过程函数抽出来，通过 `createCompilerCreator(baseCompile)` 的方式把真正编译的过程和其它逻辑如对编译配置处理、缓存处理等剥离开，这样的设计还是非常巧妙的。

编译的入口最终终于找到了，主要就是执行了如下几个逻辑：

1. Parse 解析：解析模板字符串生成 AST

   Parse 会用正则等方式解析 template 模版中的指令、class、style 等数据，形成 AST。

2. Optimize 优化：优化语法树

   Optimize 的主要作用是标记 static 静态节点，这时 Vue 在编译过程中的优化，后面当 update 更新界面时，会有一个 patch 的过程，diff 算法会直接跳过静态节点，从而减少了比较的过程，优化了 patch 的性能。

3. Generate 生成：生成代码

   Generate 是将 AST 转化成 render function 字符串的过程，得到结果是 render 的字符串以及 staticRenderFns 字符串。

最终 baseCompile 的返回值:

```js
{
  ast: ast,
  render: code.render,
  staticRenderFns: code.staticRenderFns
}
```

最终返回了`抽象语法树( ast )`，`渲染函数( render )`，`静态渲染函数( staticRenderFns )`，且 render 的值为 `code.render`，staticRenderFns 的值为 `code.staticRenderFns`，也就是说通过 generate 处理 ast 之后得到的返回值 code 是一个对象。

在经历过 Parse、Optimize 与 Generate 这三个阶段之后，组件中就会得到用于渲染 VNode 所需的 render 函数了。

### Parse 解析

解析整个模板的时候它的流程应该是这样子的：HTML解析器是主线，先用HTML解析器进行解析整个模板，在解析过程中如果碰到文本内容，那就调用文本解析器来解析文本，如果碰到文本中包含过滤器那就调用过滤器解析器来解析。

![模板解析1](/blog/images/vue/模板解析1.png)

模板解析其实就是根据被解析内容的特点使用正则等方式将有效信息解析提取出来，根据解析内容的不同分为 HTML 解析器，文本解析器和过滤器解析器。而文本信息与过滤器信息又存在于 HTML 标签中，所以在解析器主线函数 parse 中先调用 HTML 解析器parseHTML 函数对模板字符串进行解析，如果在解析过程中遇到文本或过滤器信息则再调用相应的解析器进行解析，最终完成对整个模板字符串的解析。解析器内维护了一个栈，用来保证构建的AST节点层级与真正DOM层级一致。文本解析器的作用就是将HTML解析器解析得到的文本内容进行二次解析，解析文本内容中是否包含变量，如果包含变量，则将变量提取出来进行加工，为后续生产render函数做准备。

### Optimize 优化

有一种节点一旦首次渲染上了之后不管状态再怎么变化它都不会变了，这种节点叫做静态节点。模板编译的最终目的是用模板生成一个 render 函数，而用 render 函数就可以生成与模板对应的 VNode，之后再进行 patch 算法，最后完成视图渲染。这中间的 patch 算法又是用来对比新旧 VNode 之间存在的差异。在上面我们还说了，静态节点不管状态怎么变化它是不会变的，基于此，我们可以在模板编译的时候就先找出模板中所有的静态节点和静态根节点，然后给它们打上标记，告诉后面 patch 过程打了标记的这些节点是不需要对比的，只需克隆一份，在 patch 过程中不用去对比这些静态节点了，这就是优化阶段存在的意义。

优化阶段其实就干了两件事：

1. 在 AST 中找出所有**静态节点**并打上标记；
2. 在 AST 中找出所有**静态根节点**并打上标记；

```js
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // 标记静态节点
  markStatic(root)
  // 标记静态根节点
  markStaticRoots(root, false)
}
```

#### 标记静态节点

从 AST 中找出所有静态节点并标记其实不难，我们只需从根节点开始，先标记根节点是否为静态节点，然后看根节点如果是元素节点，那么就去向下递归它的子节点，子节点如果还有子节点那就继续向下递归，直到标记完所有节点。

如果元素节点是静态节点，那就必须满足以下几点要求：

- 如果节点使用了 `v-pre` 指令，那就断定它是静态节点；
- 如果节点没有使用 `v-pre` 指令，那它要成为静态节点必须满足：
  - 不能使用动态绑定语法，即标签上不能有 `v-`、`@`、`:`开头的属性
  - 不能使用 `v-if`、`v-else`、`v-for`指令
  - 不能是内置组件，即标签名不能是 `slot` 和 `component`
  - 标签名必须是平台保留标签，即不能是组件
  - 当前节点的父节点不能是带有 `v-for` 的 `template` 标签
  - 节点的所有属性的 key 都必须是静态节点才有的 key，注：静态节点的 key 是有限的，它只能是 type, tag, attrsList,attrsMap, plain, parent, children, attrs 之一

#### 标记静态根节点

寻找静态根节点根寻找静态节点的逻辑类似，都是从AST根节点递归向下遍历寻找。一个节点要想成为静态根节点，它必须满足以下要求，否则的话，对它的优化成本将大于优化后带来的收益。

- 节点本身必须是静态节点
- 必须拥有子节点 children
- 子节点不能只是只有一个文本节点

### Generate 生成

Vue 实例在挂载的时候会调用其自身的 render 函数来生成实例上的 template 选项所对应的 VNode，简单的来说就是 Vue 只要调用了render 函数，就可以把模板转换成对应的虚拟 DOM。那么 Vue 要想调用 render 函数，那必须要先有这个 render 函数，那这个render函数又是从哪来的呢？是用户手写的还是 Vue 自己生成的？答案是都有可能。我们知道，我们在日常开发中是可以在 Vue 组件选项中手写一个 render 选项，其值对应一个函数，那这个函数就是 render 函数，当用户手写了 render 函数时，那么 Vue 在挂载该组件的时候就会调用用户手写的这个 render 函数。那如果用户没有写呢？那这个时候 Vue 就要自己根据模板内容生成一个 render 函数供组件挂载的时候调用。而 Vue 自己根据模板内容生成 render 函数的过程就是本篇文章所要介绍的代码生成阶段。

生成代码就是要生成 render 函数字符串。所谓代码生成其实就是根据模板对应的抽象语法树 AST 生成一个函数供组件挂载时调用，通过调用这个函数就可以得到模板对应的虚拟DOM。

## 模板编译整体流程

![模板编译2](/blog/images/vue/模板编译2.png)
