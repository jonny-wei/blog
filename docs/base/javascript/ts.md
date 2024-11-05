# TypeScript

[TypeScript 教程](https://wangdoc.com/typescript/)

[TypeScript 高级使用技巧](https://www.lumin.tech/articles/typescript-tricks/)

## 问题

### Q1. 什么是动态类型与静态类型?

JavaScript 的类型系统非常弱，而且没有使用限制，运算符可以接受各种类型的值。在语法上，JavaScript 属于动态类型语言。TypeScript 的主要功能是为 JavaScript 添加类型系统，TypeScript 引入了一个更强大、更严格的类型系统，属于静态类型语言。

静态类型优点：

- 有利于代码的静态分析
- 有利于发现错误
- 更好的 IDE 支持，做到语法提示和自动补全
- 提供了代码文档
- 有助于代码重构

静态类型缺点：

- 引入了独立的编译步骤
- 丧失了动态类型的代码灵活性
- 增加了编程工作量
- 更高的学习成本
- 兼容性问题

### Q2. TS 有哪些类型？

- boolean
- string
- number
- bigint
- symbol
- null
- undefined
- object
- array
- tuple
- enum
- any
- unknown
- never
- void

JavaScript 的 8 种类型之中，undefined 和 null 其实是两个特殊值，object 属于复合类型，剩下的五种属于原始类型（primitive value），代表最基本的、不可再分的值。

- boolean
- string
- number
- bigint
- symbol

- null
- undefined

- object

五种原始类型都有对应的包装对象，包装类型：

- Boolean 和 boolean
- String 和 string
- Number 和 number
- BigInt 和 bigint
- Symbol 和 symbol

```ts
const s1:String = 'hello'; // 正确
const s2:String = new String('hello'); // 正确

const s3:string = 'hello'; // 正确
const s4:string = new String('hello'); // 报错

const o1:Object = { foo: 0 };
const o2:object = { foo: 0 };

o1.toString() // 正确
o1.foo // 报错

o2.toString() // 正确
o2.foo // 报错

const obj:object = undefined;
obj.toString() // 编译不报错，运行就报错
```

大写类型同时包含包装对象和字面量两种情况，小写类型只包含字面量，不包含包装对象。建议只使用小写类型，不使用大写类型。因为绝大部分使用原始类型的场合，都是使用字面量，不使用包装对象。而且，TypeScript 把很多内置方法的参数，定义成小写类型，使用大写类型会报错。

大写的 Object 类型代表 JavaScript 语言里面的广义对象。所有可以转成对象的值，都是 Object 类型。除了 undefined  和 null 这两个值不能转为对象，其他任何值都可以赋值给 Object 类型。另外，空对象 {} 是 Object 类型的简写形式，所以使用 Object 时常常用空对象代替。

小写的 object 类型代表 JavaScript 里面的狭义对象，即可以用字面量表示的对象，只包含对象、数组和函数，不包括原始类型的值。大多数时候，我们使用对象类型，只希望包含真正的对象，不希望包含原始类型。所以，建议总是使用小写类型 object，不使用大写类型 Object。

undefined 和 null 既是值，又是类型。变量如果等于 undefined 就表示还没有赋值，如果等于 null 就表示值为空。为了避免这种情况，及早发现错误，TypeScript 提供了一个编译选项 strictNullChecks。只要打开这个选项，undefined 和 null 就不能赋值给其他类型的变量（除了 any 类型和 unknown 类型）。

### Q3. any 和 unknown 区别？

- any 类型是一种“逃脱类型检查”的类型。当一个变量被声明为 any 类型时，你可以对它进行任何操作，包括调用任意属性或方法，而不会收到 TypeScript 编译器的任何错误提示。
- unknown 类型表示该变量的类型是未知的，它是一种安全的“多类型”类型。对 unknown 类型的变量进行操作时，**必须进行类型检查或类型断言**（如 typeof），否则 TypeScript 编译器会报错。
- unknown 可以看作是更安全的 any。一般来说，凡是需要设为 any 类型的地方，通常都应该优先考虑设为 unknown 类型

### Q2. interface 接口和 type 类型别名区别？

很多对象类型既可以用 interface 表示，也可以用 type 表示。而且，两者往往可以换用，几乎所有的 interface 命令都可以改写为 type 命令。

- interface 可以被多次声明，同名 interface 会自动合并；type 不能被多次声明，同名 type 则会报错，每个 type 必须是唯一的。
- interface 可以继承其他类型，通过 extends 关键字扩展多个接口，合并多个接口的成员；type 不支持继承，可以使用 &（交叉类型）操作符来合并多个类型。
- interface 只能表示对象类型（包括数组、函数等），无法表达某些复杂类型；type 能够表示非对象类型，直接与字面量类型联合，适合定义复杂的类型，包括联合类型、交叉类型、元组和字面量类型。
- interface 不能包含属性映射（mapping），type 可以。
- this 关键字只能用于 interface。
- type 可以扩展原始数据类型，interface 不行。
- interface无法表达某些复杂类型（比如交叉类型和联合类型），但是 type 可以。

综上所述，如果有复杂的类型运算，那么没有其他选择只能使用 type；一般情况下，interface 灵活性比较高，便于扩充类型或自动合并，建议优先使用。

### Q3. keyof 和 typeof 关键字的作用？keyof 使用场景？

- keyof 关键字用于获取一个类型的所有键的联合（Union），这些键通常是类型中存在的公共属性名。它常用于索引访问操作中，以确保访问的属性确实存在于对象上。使用场景：当你需要操作一个类型的键，或者需要确保某个属性确实存在于对象上时
- typeof 关键字用于获取一个变量或属性的类型。使用场景：当你需要获取一个变量或对象的类型，或者需要创建一个与现有变量或对象具有相同类型的新类型时。

keyof 是一个单目运算符，接受一个对象类型作为参数，返回该对象的所有键名组成的联合类型。keyof 类型操作符在 TypeScript 中的几种常见使用场景如下：

- 索引签名：keyof 可以用来创建索引签名，确保对象的键只能是某些特定的类型。
- 类型守卫：keyof 可以与类型守卫结合使用，以确保变量的属性访问是安全的。可以使用 keyof 来定义泛型约束，限制泛型参数为某个对象的键。
- 映射类型：keyof 可以与映射类型结合使用，创建新类型，其属性是原始类型的子集。
- 条件类型：keyof 可以用于条件类型中，基于类型的键来分支类型。
- 函数重载：keyof 可以用于函数重载，以区分不同的函数签名。
- ...

```ts
// 1. 索引签名：keyof 可以用来创建索引签名，确保对象的键只能是某些特定的类型。
interface Person {
  name: string;
  age: number;
}

// 使用 keyof 创建索引签名
type PersonIndexSignature = {
  [K in keyof Person]?: Person[K];
};

const personData: PersonIndexSignature = {
  name: "John Doe",
  age: 30
};

// 2. 类型守卫：keyof 可以与类型守卫结合使用，以确保变量的属性访问是安全的。
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const person: Person = { name: "Jane", age: 25 };

const name: string = getProperty(person, "name"); // OK
const age: number = getProperty(person, "age"); // OK
// const unknownProperty: any = getProperty(person, "unknownKey"); // Error

// 3. 映射类型：keyof 可以与映射类型结合使用，创建新类型，其属性是原始类型的子集。
type EventNames = "click" | "scroll" | "mousemove";

type EventListeners<T extends EventNames> = {
  [K in T]?: (event: any) => void;
};

const listeners: EventListeners<EventNames> = {
  click: (event) => console.log("Clicked!"),
  scroll: (event) => console.log("Scrolled!"),
};

// 4. 条件类型：keyof 可以用于条件类型中，基于类型的键来分支类型。
type OptionalKeys<T> = {
  [K in keyof T]?: T[K];
};

interface Todo {
  title: string;
  description?: string;
  completed: boolean;
}

type TodoOptionals = OptionalKeys<Todo>;
// { title?: string; description?: string; completed?: boolean }

// 5. 函数重载：keyof 可以用于函数重载，以区分不同的函数签名。
function getValue<T>(obj: T, key: keyof T): T[K] {
  return obj[key];
}

// 可以用于具有不同属性的对象
const user: { name: string; age: number } = { name: "Alice", age: 25 };
console.log(getValue(user, "name")); // string
console.log(getValue(user, "age")); // number
```

### Q4. 泛型使用场景及泛型约束？

泛型允许你在定义函数、接口或类时不指定具体的类型，而是使用一个占位符来表示类型。这样，你可以为同一个函数、接口或类定义多种类型版本，而不必为每种类型编写多个版本。

- 使用泛型约束（extends关键字）来限制泛型参数的类型范围，确保泛型参数符合某种特定的条件。
- keyof 是 TypeScript 中用来获取对象类型所有键（属性名）的操作符。可以使用 keyof 来定义泛型约束，限制泛型参数为某个对象的键。

```ts
// 1. 泛型接口
interface GenericArray<T> {
  add(item: T): void;
  get(index: number): T;
}

class ConcreteArray implements GenericArray<number> {
  private array = [];

  add(item: number) {
    this.array.push(item);
  }

  get(index: number) {
    return this.array[index];
  }
}

// 2. 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("myString");  // 类型为 string
let output2 = identity<number>(123);       // 类型为 number

// 3. 泛型类：
class C<NumType> {
  value!: NumType;
  add!: (x: NumType, y: NumType) => NumType;
}

let foo = new C<number>();

foo.value = 0;
foo.add = function (x, y) {
  return x + y;
};

// 4. 泛型约束 - extends keyof
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const person: Person = { name: "Jane", age: 25 };

const name: string = getProperty(person, "name"); // OK
const age: number = getProperty(person, "age"); // OK
// const unknownProperty: any = getProperty(person, "unknownKey"); // Error
```

### Q6. 常用的类型工具？

#### `Partial<T>`

用于构造一个新类型，并将类型 T 的所有属性变为可选属性。这个工具类型在需要创建一个对象，其中某些属性可能是未定义的，但又想保持其他属性类型不变时非常有用。

```ts
interface Todo {
  title: string;
  description: string;
}

type PartialTodo = Partial<Todo>;
// type PartialTodo = { title?: string | undefined; description?: string | undefined; }
```

#### `Required<T>`

用于构造一个新类型，并将类型 T 的所有属性变为必选属性。这与 `Partial<T>` 相反，当你需要确保对象的所有属性都被定义时，这个类型非常有用。

```ts
interface Props {
  a?: number;
  b?: string;
}

type RequiredProps = Required<Props>;
// type RequiredProps = { a: number; b: string; }
```

#### `Readonly<T>`

用于构造一个新类型，并将类型 T 的所有属性变为只读属性。这意味着属性的值不能被重新赋值。

```ts
interface Todo {
  title: string;
}

type ReadonlyTodo = Readonly<Todo>;
// type ReadonlyTodo = { readonly title: string; }
```

#### `Pick<T, K>`

用于从类型 T 中选取一组属性 K，构造一个新类型。这个工具类型在需要从现有类型中选择部分属性时非常有用。

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, 'title' | 'completed'>;
// type TodoPreview = { title: string; completed: boolean; }
```

#### `Omit<T, K>`

用于从类型 T 中剔除一组属性 K，构造一个新类型。这个工具类型在需要从现有类型中排除部分属性时非常有用。

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoTitle = Omit<Todo, 'title' | 'completed'>;
// type TodoTitle = { description: string; }
```

#### `Exclude<T, U>`

用于从联合类型 T 中排除掉 U 中定义的类型，即 T 减去 U 的类型。这个工具类型在需要从联合类型中排除某些值时非常有用。

```ts
type Colors = 'red' | 'green' | 'blue';
type NonBlueColors = Exclude<Colors, 'blue'>;
// type NonBlueColors = 'red' | 'green'
```

#### `Extract<UnionType, Union>`

用来从联合类型 UnionType 之中，提取指定类型 Union，组成一个新类型返回。它与 `Exclude<T, U>` 正好相反。

```ts
type T1 = Extract<'a'|'b'|'c', 'a'>; // 'a'
type T2 = Extract<'a'|'b'|'c', 'a'|'b'>; // 'a'|'b'
type T3 = Extract<'a'|'b'|'c', 'a'|'d'>; // 'a'
type T4 = Extract<string | string[], any[]>; // string[]
type T5 = Extract<(() => void) | null, Function>; // () => void
type T6 = Extract<200 | 400, 200 | 201>; // 200

type T = Extract<string|number, boolean>; // never
type Extract<T, U> = T extends U ? T : never; // 如果参数类型Union不包含在联合类型UnionType之中，则返回never类型
```

#### `NonNullable<T>`

用于构造一个新类型，从类型 T 中排除 null 和 undefined。这个工具类型在需要确保值不是 null 或 undefined 时非常有用。

```ts
type T = string | null | undefined;
type NonNullableT = NonNullable<T>;
// type NonNullableT = string
```

#### `Record<K, T>`

用于构造一个对象类型，其属性名为类型 K 的值，属性值为类型 T。这个工具类型在需要创建一个对象，其属性是动态的，但值类型是固定的时非常有用。

```ts
type CatName = 'miffy' | 'boris' | 'mordred';
interface CatInfo {
  age: number;
  breed: string;
}

const cats: Record<CatName, CatInfo> = {
  miffy: { age: 10, breed: 'Persian' },
  boris: { age: 5, breed: 'Maine Coon' },
  mordred: { age: 16, breed: 'British Shorthair' },
};
```

#### `ReturnType<Type>`

提取函数类型 Type 的返回值类型，作为一个新类型返回。

```ts
type T1 = ReturnType<() => string>; // string

type T2 = ReturnType<() => {
  a: string; b: number
}>; // { a: string; b: number }

type T3 = ReturnType<(s:string) => void>; // void

type T4 = ReturnType<() => () => any[]>; // () => any[]

type T5 = ReturnType<typeof Math.random>; // number

type T6 = ReturnType<typeof Array.isArray>; // boolean
```

### Q7. TypeScript 模块的加载机制？

模块本身就是一个作用域，不属于全局作用域。模块内部的变量、函数、类只在内部可见，对于模块外部是不可见的。暴露给外部的接口，必须用 export 命令声明；如果其他文件要使用模块的接口，必须用 import 命令来输入。

- （1）编译阶段：当你使用 TypeScript 编译器 (tsc) 编译 TypeScript 代码时，它会将 TypeScript 代码转换成 JavaScript 代码。编译器处理模块声明，并生成相应的 export 和 import 语句。
- （2）加载阶段：在运行时，JavaScript 模块的加载取决于环境（浏览器或 Node.js）。浏览器使用 HTML 的 `<script>` 标签或模块加载器来加载模块。Node.js 使用 require() 函数来加载模块，或者使用 import 语句（在支持 ES6 模块的环境中）。
- （3）模块解析：TypeScript 使用 Node.js 的模块解析算法，这意味着它遵循 "node_modules" 查找路径和 "package.json" 中的 "main" 属性。TypeScript 也支持非标准路径的模块导入，这需要在 tsconfig.json 中配置路径映射。
- （4）模块绑定：当模块被加载时，它们的导出被绑定到一个模块对象上。当模块被导入时，导入的绑定指向模块对象的相应导出。

### Q8. TypeScript 中 const 与 readonly 的区别？

- const 声明的是整个变量或对象是不可变的（作用于变量），而 readonly 只声明对象或类的某个属性是不可变的（作用于属性），readonly 可以用于类的属性，而 const 不能用于类的属性。
- const 用于声明一个常量，它必须在声明时立即初始化，并且之后不能被重新赋值。如果 const 用于对象或数组，对象或数组中的属性仍然可以被修改，只是不能重新赋值给这个变量；Readonly 表示该属性是只读的。实例对象不能修改这个属性，但是在构造方法修改只读属性的值是可以的。

### Q9. JIT 与 AOT 编译区别？

JIT（Just-In-Time）和AOT（Ahead-of-Time）是两种不同的编译技术，它们在编译时间、执行效率、资源占用和灵活性等方面存在显著差异：

1. **JIT（即时编译）**：
   - **定义**：JIT编译器在程序运行时逐段地进行编译，这意味着编译过程与程序的执行过程并行进行。
   - **优点**：
     - 动态优化：可以根据程序的实际运行情况进行优化，生成更加高效的机器代码。
     - 平台无关性：可以针对不同的平台在运行时进行特定优化。
   - **缺点**：
     - 启动延迟：程序启动时需要时间来编译代码。
     - 资源消耗：运行时编译和优化会占用额外的CPU资源。
   - 边运行边编译；吞吐量高，有运行时性能加成，可以跑得更快，并可以做到动态生成代码等，但是相对启动速度较慢，并需要一定时间和调用频率才能触发 JIT 的分层机制，即当代码执行到一定程度时，JIT 编译器会将代码编译成机器码，并缓存起来，下次执行时直接从缓存中获取机器码，而无需重新编译。

2. **AOT（预先编译）**：
   - **定义**：AOT编译器在程序运行前一次性完成编译工作，将源代码编译成机器码。
   - **优点**：
     - 快速启动：程序启动时不需要编译时间，可以直接运行编译后的机器码。
     - 较低的运行时开销：减少了运行时的资源消耗。
   - **缺点**：
     - 缺乏动态优化：无法根据运行时条件进行优化。
     - 编译时间长：大型项目可能需要较长时间来完成编译。
   - 内存占用低，启动速度快，可以无需 runtime 运行，直接将 runtime 静态链接至最终的程序中，但是无运行时性能加成，不能根据程序运行情况做进一步的优化。

总的来说，JIT编译器在运行时优化和灵活性方面表现出色，但可能会增加编译时间和内存占用；而AOT编译器则具有较短的编译时间和较低的内存占用优势，但在灵活性和执行效率方面可能略逊于JIT编译器。在选择使用哪种编译技术时，需要根据具体的应用场景和需求进行权衡和选择。

AOT编译：

- 适合对启动时间要求较高的应用场景，如移动应用或桌面应用。AOT编译在程序运行之前将代码编译成机器码，这样可以在应用程序启动时无需进行编译，直接运行编译后的机器码，从而缩短启动时间。
- 适合对内存消耗有严格限制的应用，因为AOT编译减少了运行时的资源消耗，不需要在运行时进行编译和优化。
- 适合云原生场景。AOT编译后的代码不容易被反编译和修改，增强了应用程序的安全性。
- 适合需要改善SEO的应用，因为AOT可以生成静态HTML文件，使搜索引擎更容易抓取和索引应用程序的内容

JIT编译：

- 适合需要动态优化和灵活性的场景，如服务器端应用和桌面应用。JIT编译器在程序运行时根据实际执行情况进行优化，可以生成更加高效的机器代码，提高程序的执行效率。
- 适合需要跨平台运行的应用，因为JIT编译器可以根据运行它的具体平台（操作系统和硬件）进行适配和优化，具有较好的跨平台能力。
- 适合在开发过程中需要快速迭代和修改代码的场景，因为JIT允许在运行时编译代码，从而可以更快地看到修改效果

### Q10. JS 中的隐式转换？

JavaScript中的隐式类型转换遵循一些规律和规则，这些规则在不同的运算和上下文中有所不同。了解这些规律有助于预测和控制代码的行为。以下是一些主要的隐式类型转换规律：

1. 字符串转换

- 任何对象（包括数组和函数）通过`String`方法或在字符串上下文中被转换为字符串时，都会调用该对象的`toString()`方法。
- `null`和`undefined`在字符串上下文中被转换为空字符串`""`。
- `Boolean`对象在字符串上下文中被转换为`"true"`或`"false"`。
- `Number`对象被转换为其对应的字符串表示。

2. 数字转换

- 字符串在数字上下文中被转换为数字时，会移除空白字符，然后解析剩余部分。如果字符串以合法的数字开始，则转换为该数字；否则，转换为`NaN`。
- `null`在数字上下文中被转换为`0`。
- `undefined`在数字上下文中被转换为`NaN`。
- `Boolean`对象在数字上下文中被转换为`1`（`true`）或`0`（`false`）。
- `Number`对象保持不变。
- `Symbol`对象在数字上下文中被转换为`NaN`。

3. 布尔转换

- 字符串在布尔上下文中被转换为`false`，除非字符串是非空的，此时转换为`true`。
- `null`和`undefined`在布尔上下文中被转换为`false`。
- `Number`对象被转换为`false`，除非该数字是`0`、`NaN`或`-0`，这些被转换为`false`，其他数字被转换为`true`。
- `Boolean`对象保持不变。
- `Symbol`对象在布尔上下文中被转换为`true`。

4. 相等性比较（==）

- 在相等性比较中，如果两个操作数类型不同，JavaScript会尝试将它们转换为相同的类型，然后进行比较。
- `null`和`undefined`相等，都转换为对方。
- `String`和`Number`比较时，字符串会被转换为数字。
- `Boolean`对象比较时，会被转换为数字（`true`转换为`1`，`false`转换为`0`）。
- 对象（包括数组和函数）和非对象比较时，对象会被转换为字符串，然后进行比较。

5. 严格相等性比较（===）

- 在严格相等性比较中，不会发生类型转换。如果两个操作数类型不同，比较结果为`false`。

了解这些规律可以帮助你避免一些常见的JavaScript陷阱，并确保你的代码在不同环境下的行为一致。在实际编程中，最好尽量避免依赖隐式类型转换，而是显式地进行类型转换，以提高代码的可读性和可预测性。

在JavaScript中，隐式类型转换会在表达式被计算时自动发生。以下是一些包含所有情况的详细例子：

#### 数字转换（Number Conversion）

1. **字符串转数字**：

   ```javascript
   "42" + 5 // "425"，字符串 "42" 被转换成数字 42
   "3.14" - 1 // 2.14，字符串 "3.14" 被转换成数字 3.14
   "0" === false // true，字符串 "0" 被转换成数字 0，然后与 false（转换为 0）比较
   ```

2. **布尔值转数字**：

   ```javascript
   true + 5 // 6，布尔值 true 被转换成数字 1
   false - 7 // -7，布尔值 false 被转换成数字 0
   ```

3. **null转数字**：

   ```javascript
   null + 10 // 10，null 被转换成数字 0
   ```

4. **undefined转数字**：

   ```javascript
   undefined + 20 // NaN，undefined 被转换成 NaN
   ```

5. **对象转数字**：

   ```javascript
   ({ value: 10 }) + 5 // 15，对象被转换成字符串，然后 "[value: 10]" 被转换成数字 NaN，但在这个例子中，我们通常使用 Object 的 valueOf 或 toString 方法来获取值
   ```

#### 字符串转换（String Conversion）

1. **数字转字符串**：

   ```javascript
   5 + "test" // "5test"，数字 5 被转换成字符串 "5"
   ```

2. **布尔值转字符串**：

   ```javascript
   false + "true" // "falsetrue"，布尔值 false 被转换成字符串 "false"
   ```

3. **null转字符串**：

   ```javascript
   null + "null" // "nullnull"，null 被转换成字符串 "null"
   ```

4. **undefined转字符串**：

   ```javascript
   undefined + "undefined" // "undefinedundefined"，undefined 被转换成字符串 "undefined"
   ```

5. **对象转字符串**：

   ```javascript
   ({}) + "object" // "[object Object]object"，对象被转换成字符串 "[object Object]"
   ```

#### 布尔转换（Boolean Conversion）

1. **字符串转布尔值**：

   ```javascript
   "" ? false : true // false，空字符串转换成布尔值 false
   "non-empty" ? false : true // true，非空字符串转换成布尔值 true
   ```

2. **数字转布尔值**：

   ```javascript
   0 ? false : true // false，数字 0 转换成布尔值 false
   1 ? false : true // true，数字 1 转换成布尔值 true
   ```

3. **null转布尔值**：

   ```javascript
   null ? false : true // false，null 转换成布尔值 false
   ```

4. **undefined转布尔值**：

   ```javascript
   undefined ? false : true // false，undefined 转换成布尔值 false
   ```

5. **对象转布尔值**：

   ```javascript
   ({}) ? false : true // true，对象转换成布尔值 true
   ```

#### 相等性比较（Equality Comparison）

1. **字符串与数字的比较**：

   ```javascript
   "5" == 5 // true，字符串 "5" 被转换成数字 5 后与 5 比较
   ```

2. **布尔值与数字的比较**：

   ```javascript
   true == 1 // true，布尔值 true 被转换成数字 1 后与 1 比较
   false == 0 // true，布尔值 false 被转换成数字 0 后与 0 比较
   ```

3. **null与数字的比较**：

   ```javascript
   null == 0 // true，null 被转换成数字 0 后与 0 比较
   ```

4. **undefined与数字的比较**：

   ```javascript
   undefined == 0 // false，undefined 被转换成 NaN，NaN 与任何值（包括 0）比较都返回 false
   ```

这些例子展示了JavaScript中隐式类型转换的一些常见情况。了解这些规则对于编写可靠的JavaScript代码至关重要，因为隐式类型转换可能会导致不易察觉的错误。
