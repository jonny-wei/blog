(window.webpackJsonp=window.webpackJsonp||[]).push([[67],{520:function(t,v,r){"use strict";r.r(v);var s=r(15),_=Object(s.a)({},(function(){var t=this,v=t.$createElement,r=t._self._c||v;return r("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[r("h1",{attrs:{id:"词法作用域和动态作用域"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#词法作用域和动态作用域"}},[t._v("#")]),t._v(" 词法作用域和动态作用域")]),t._v(" "),r("h2",{attrs:{id:"什么是作用域"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#什么是作用域"}},[t._v("#")]),t._v(" 什么是作用域")]),t._v(" "),r("p",[r("strong",[t._v("作用域")]),t._v(" 是定义变量的区域，规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。JavaScrip 采用词法作用域(lexical scoping)，也就是静态作用域。")]),t._v(" "),r("h2",{attrs:{id:"两作用域的区别"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#两作用域的区别"}},[t._v("#")]),t._v(" 两作用域的区别")]),t._v(" "),r("p",[t._v("词法作用域(静态作用域)和动态作用域的区别：")]),t._v(" "),r("p",[r("strong",[t._v("词法作用域")]),t._v("：因为 JavaScript 采用的是词法作用域，函数的作用域在函数定义的时候就决定了。"),r("strong",[t._v("函数的作用域基于函数创建的位置")]),t._v("。")]),t._v(" "),r("p",[r("strong",[t._v("动态作用域")]),t._v("：而与词法作用域相对的是动态作用域，"),r("strong",[t._v("函数的作用域是在函数调用的时候才决定的")]),t._v("。")]),t._v(" "),r("p",[t._v("在全局作用域中“定义”一个函数到时候，只会创建包含全局作用域的作用域链。只有“执行”该函数的时候，才会复制创建时的作用域，并将当前函数的局部作用域放在作用域链的顶端。 "),r("strong",[t._v("词法作用域是通过作用域链来实现的")]),t._v("。")]),t._v(" "),r("p",[t._v("动态作用域和静态作用域，决定的是作用域链的顺序。")]),t._v(" "),r("h2",{attrs:{id:"闭包与作用域的理解"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#闭包与作用域的理解"}},[t._v("#")]),t._v(" 闭包与作用域的理解")]),t._v(" "),r("p",[t._v("JavaScript 是采用词法作用域的，这就意味着 "),r("strong",[t._v("函数的执行依赖于函数定义的时候所产生（而不是函数调用的时候产生的）的变量作用域")]),t._v("。为了去实现这种词法作用域，JavaScript 函数对象的内部状态不仅包含函数逻辑的代码，除此之外还 "),r("strong",[t._v("包含当前作用域链的引用")]),t._v("。函数对象可以通过这个 "),r("strong",[t._v("作用域链")]),t._v(" 相互关联起来，如此，函数体内部的变量都可以保存在函数的作用域内，这在计算机的文献中被称之为 "),r("strong",[t._v("闭包")]),t._v("。")]),t._v(" "),r("p",[t._v("从技术的角度去将，所有的 JavaScript 函数都是闭包：他们都是对象，他们都有一个关联到他们的作用域链。绝大多数函数在调用的时候使用的作用域链和他们在定义的时候的作用域链是相同的，但是这并不影响闭包。")]),t._v(" "),r("p",[t._v("当 "),r("strong",[t._v("调用函数的时候闭包所指向的作用域链")]),t._v(" 和 "),r("strong",[t._v("定义函数时的作用域链")]),t._v(" 不是同一个作用域链的时候，闭包 become interesting。这种 interesting 的事情往往发生在这样的情况下： 当一个函数嵌套了另外的一个函数，外部的函数将内部嵌套的这个函数作为对象返回。一大批强大的编程技术都利用了这类嵌套的函数闭包，当然，javascript 也是这样。可能你第一次碰见闭包觉得比较难以理解，但是去明白闭包然后去非常自如的使用它是非常重要的。")]),t._v(" "),r("p",[t._v("通俗点说，在程序语言范畴内的 "),r("strong",[t._v("闭包是指函数把其它的变量作用域也包含在这个函数的作用域内，形成一个所谓的“闭包”")]),t._v("，这样的话外部的函数就无法去访问内部变量。所以按照第二段所说的，严格意义上所有的函数都是闭包。")]),t._v(" "),r("p",[t._v("需要注意的是：我们常常所说的闭包指的是让外部函数访问到内部的变量，也就是说，按照一般的做法，是使内部函数返回一个函数，然后操作其中的变量。这样做的话一是可以读取函数内部的变量，二是可以让这些变量的值始终保存在内存中。")]),t._v(" "),r("div",{staticClass:"custom-block warning"},[r("p",{staticClass:"custom-block-title"},[t._v("参考文献")]),t._v(" "),r("p",[r("a",{attrs:{href:"https://github.com/mqyqingfeng/Blog/issues/3",target:"_blank",rel:"noopener noreferrer"}},[t._v("JavaScript深入之词法作用域和动态作用域"),r("OutboundLink")],1)])])])}),[],!1,null,null,null);v.default=_.exports}}]);