# SDK 设计

本文探讨了SDK的设计原则和设计模式的应用。介绍了如何通过模块化、策略模式、工厂模式、适配器模式和模板方法模式等来构建一个可扩展、解耦和易于维护的SDK。展示了SDK的模块化分层设计，包括核心功能模块、平台相关实现、API模块等，并提供了一个示例项目结构。讨论了如何通过静态代码分析工具（如ts-morph）来实现一个canIUse功能，以判断SDK中的API、回调、参数、组件等在当前版本中的可用性。介绍了如何使用TypeDoc工具从JSDoc注释中生成API文档，并提供了tsconfig.json的配置示例和如何在代码中使用JSDoc注释的示例。

## 设计原则

以下是设计原则的汇总表格，涵盖了常见的设计原则、目的、应用场景和示例：

| **设计原则**         | **定义**                                                                                   | **目的**                                      | **应用场景**                                                  | **示例**                                                                                                                                                                               |
|----------------------|--------------------------------------------------------------------------------------------|-----------------------------------------------|---------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **单一职责原则 (SRP)** | 一个类应该只有一个职责，且每个类应该仅有一个引起它变化的原因。                                | 提高类的可维护性，减少类的复杂性。              | 类有多个职责时，修改一个功能可能会影响其他功能。                    | 将报告生成和打印分离到不同的类：<br> `class Report { generateReport() {} }` <br> `class ReportPrinter { printReport(report) {} }`                                                       |
| **开放封闭原则 (OCP)** | 软件实体（类、模块、函数等）应该对扩展开放，对修改封闭。                                        | 提高系统的灵活性和可扩展性。                    | 需要在不修改原有代码的情况下，增加新功能时。                          | 使用继承和多态来扩展功能，而不是修改原有类的代码：<br> `class Shape { area() {} }` <br> `class Circle extends Shape { area() {} }`                                                       |
| **里氏替换原则 (LSP)** | 子类对象应该可以替换父类对象出现在任何地方，并且不影响程序的正确性。                          | 确保继承关系合理，避免修改父类行为破坏子类行为。      | 子类和父类之间存在继承关系，确保子类可以正确替换父类使用。               | 子类 `Penguin` 不应覆盖父类 `Bird` 的行为，导致异常：<br> `class Penguin extends Bird { fly() { throw "Cannot fly!" } }`                                                                   |
| **接口隔离原则 (ISP)** | 不应强迫一个类依赖它不需要的接口。                                                           | 使接口保持简洁，避免不必要的依赖。                | 类依赖过大的接口，导致不需要的功能被实现或依赖时。                        | 将接口拆分成小接口：<br> `class Workable { work() {} }` <br> `class Eatable { eat() {} }`                                                                                                 |
| **依赖倒转原则 (DIP)** | 高层模块不应依赖低层模块，二者应依赖抽象；抽象不应依赖细节，细节应依赖抽象。                      | 提高系统灵活性和可维护性。                        | 高层模块和低层模块紧耦合时，难以扩展和维护。                              | 使用接口或抽象类来替代具体实现类：<br> `class Switch { constructor(device) { this.device = device; } operate() { this.device.turnOn(); } }`                                                |
| **合成复用原则 (CRP)** | 尽量使用对象组合，而不是继承来复用代码。                                                     | 提高代码的灵活性，避免继承关系的复杂性。             | 当对象之间是“拥有关系”而不是“是一个关系”时。                           | 使用组合而非继承来复用代码：<br> `class Engine { start() {} }` <br> `class Car { constructor() { this.engine = new Engine(); } start() { this.engine.start(); } }`                          |
| **最小知识原则 (LoD)** | 一个对象应该对其他对象有尽可能少的了解。                                                     | 减少系统间的耦合，增加模块独立性。                   | 当类之间有过多依赖关系时，避免暴露内部细节。                            | 避免多次调用 `getB().getC().doSomething()`，而是通过间接方法调用：<br> `class A { getB() { return new B(); } }` <br> `class B { doSomething() {} }`                                       |
| **避免重复代码原则 (DRY)** | 同一功能的代码不应在系统中重复出现。                                                         | 提高代码的可维护性和可复用性。                     | 当相同的代码在多个地方出现时，避免冗余代码。                              | 将公共方法提取到一个函数中来减少代码重复：<br> `function calculateArea(radius) { return Math.PI * radius * radius; }` <br> `function calculateVolume(radius, height) { return calculateArea(radius) * height; }` |

## 设计模式

下面是一个设计模式汇总表格，包括每种设计模式的**目的**、**应用场景**、**示例代码**等关键信息，帮助更清晰地理解和应用这些模式。

| **设计模式**    | **目的**                                                                                  | **应用场景**                                                                             | **示例代码简要**                                                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| **单例模式**    | 确保一个类只有一个实例，并提供一个全局访问点。                                              | 配置管理、日志管理、数据库连接池等。                                                       | 通过静态变量确保类的唯一实例，且构造函数私有化，防止外部创建多个实例。                                                                             |
| **工厂方法模式**| 定义一个创建对象的接口，由子类决定实例化哪个类。                                            | 系统中有多个相似的对象，并希望将对象的创建与使用解耦。                                     | 定义一个抽象工厂类，通过子类重写工厂方法来创建具体的产品。                                                                                         |
| **抽象工厂模式**| 提供一个接口，用于创建相关或依赖对象的家族，而无需明确指定具体类。                            | 当系统需要独立于其产品的创建、组合和表示时。                                                | 提供多个工厂方法创建不同类型的产品系列，避免直接实例化具体类。                                                                                   |
| **适配器模式**  | 将一个类的接口转换成客户端希望的另一个接口，使得不兼容的接口可以一起工作。                    | 当你希望将一个已有的类与一个不兼容的接口进行适配时。                                      | 通过一个适配器类将现有类的接口转换为目标接口，解耦原始类和使用类。                                                                                |
| **装饰器模式**  | 动态地给一个对象添加一些额外的职责。                                                        | 需要扩展对象功能，但又不想影响原始类的代码或多个类的功能。                                 | 通过装饰器类扩展原有对象的行为，可以动态添加新的功能。                                                                                           |
| **观察者模式**  | 定义对象间的一对多依赖关系，当一个对象改变状态时，所有依赖它的对象都会自动得到通知并更新。      | 事件系统、数据绑定、UI更新等。                                                             | 定义一个主题类，当状态变化时，通知所有观察者对象执行更新操作。                                                                                   |
| **策略模式**    | 定义一系列算法，将每一个算法封装起来，并让它们可以互换。                                     | 当多个算法之间需要互换，且希望避免大量条件判断时。                                          | 定义一个策略接口，不同算法实现该接口，客户端根据需要选择策略执行。                                                                                |
| **状态模式**    | 允许对象在内部状态改变时改变其行为，仿佛改变了其类。                                        | 当对象的行为依赖于其状态，并且必须在运行时根据状态变化时。                                 | 将不同状态封装为状态类，状态变化时通过上下文切换不同状态的行为。                                                                                 |
| **代理模式**    | 为其他对象提供一种代理以控制对这个对象的访问。                                              | 当需要控制对某个对象的访问，或需要在访问前后做一些处理时（如懒加载、缓存、权限检查等）。    | 创建一个代理类，委托实际的业务处理给真实对象，代理类可在实际处理之前或之后插入额外的逻辑。                                                       |
| **命令模式**    | 将请求封装为一个对象，从而使你可以用不同的请求对客户进行参数化。                             | 解耦请求发送者和接收者，尤其是在涉及多个请求的情境中。                                      | 将请求封装为命令对象，命令对象可以被请求发送者调用，支持撤销等功能。                                                                               |
| **中介者模式**  | 通过一个中介对象来封装一系列对象之间的交互，避免对象间的直接依赖。                          | 复杂的对象交互，尤其是当多个对象之间有很多相互依赖时。                                      | 创建一个中介者类，通过它管理多个对象之间的通信，避免对象间的紧耦合。                                                                             |
| **责任链模式**  | 允许多个处理者处理同一个请求，每个处理者决定是否将请求转发给下一个处理者。                    | 当有多个对象可以处理一个请求时，需要动态选择一个合适的处理者。                            | 创建一个处理者链，每个处理者处理自己关心的部分，然后将请求传递给下一个处理者。                                                                   |
| **桥接模式**    | 将抽象与实现分离，使得它们可以独立变化。                                                     | 需要在多个维度上扩展系统时，比如将不同的实现与抽象组合成不同的变体。                       | 抽象类和实现类分开，并通过桥接类将它们连接，支持多维度扩展。                                                                                     |
| **组合模式**    | 使客户端可以统一处理单个对象和对象集合。                                                     | 需要处理树形结构的对象，例如文件系统、UI组件树等。                                          | 将对象组织成树形结构，客户端可以以统一的方式处理单个对象和对象集合。                                                                             |
| **迭代器模式**  | 提供一种方法顺序访问集合对象，而不暴露该对象的内部表示。                                      | 需要遍历集合对象，并且集合内部结构可能发生变化时。                                          | 创建一个迭代器类，实现对集合的遍历，客户端通过迭代器类访问集合中的元素。                                                                        |
| **模板方法模式**| 在一个方法中定义算法的骨架，将具体步骤的实现延迟到子类。                                        | 当算法的结构不变，而某些步骤的实现可能变化时。                                              | 创建一个模板方法，在父类中定义算法的步骤，子类实现具体的步骤。                                                                                 |
| **访问者模式**  | 允许在不修改元素类的前提下，定义作用于这些元素的新操作。                                      | 系统有很多不同的元素类，并且需要对这些元素做各种不同操作。                                 | 定义一个访问者类，提供不同的操作，而每个元素类只需要接受一个访问者并调用相应的方法。                                                               |
| **享元模式**    | 通过共享技术有效地支持大量细粒度对象的复用。                                                  | 当需要创建大量相似对象，且这些对象可以共享时（例如图形、文本字符等）。                     | 将共享部分提取出来，集中管理，避免为每个对象创建新实例，而是复用已有的实例。                                                                     |
| **外观模式**    | 为复杂子系统提供一个简单接口，使得客户端可以方便地访问复杂的系统。                             | 系统复杂且有多个子模块，需要提供一个统一的访问入口。                                        | 创建一个外观类，封装系统中多个模块的调用，使得客户端通过外观类与系统交互。                                                                       |
| **备忘录模式**  | 在不暴露对象实现细节的情况下，保存对象的状态，以便以后恢复。                                   | 需要保存对象的状态并支持回滚或恢复操作。                                                    | 通过备忘录对象保存状态，发起者可以请求保存状态，或恢复为某个历史状态。                                                                            |

### 单例模式（Singleton）

**目的**：确保一个类只有一个实例，并提供一个全局访问点。

**应用场景**：例如配置管理类、日志管理类、数据库连接池等。

```js
// 单例类
class Singleton {
  // 静态属性来保存唯一的实例
  static instance = null;

  // 构造函数私有化，防止外部通过 new 创建实例
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;  // 如果实例已存在，则直接返回该实例
    }
    Singleton.instance = this;  // 否则保存当前实例
    this.data = []; // 初始化数据
  }

  addData(data) {
    this.data.push(data);
  }

  getData() {
    return this.data;
  }
}

// 测试单例模式
const instance1 = new Singleton();
instance1.addData("Item 1");

const instance2 = new Singleton();
instance2.addData("Item 2");

console.log(instance1.getData());  // ["Item 1", "Item 2"]
console.log(instance1 === instance2); // true，验证两个实例是相同的
```

### 工厂方法模式（Factory Method）

**目的**：定义一个创建对象的接口，由子类决定实例化哪个类。

**应用场景**：当系统中有多个相似的对象，并且希望将对象的创建与使用解耦时。

```js
// 抽象产品类
class Product {
  operation() {
    throw new Error("This method must be overridden.");
  }
}

// 具体产品 A
class ConcreteProductA extends Product {
  operation() {
    return "Product A operation";
  }
}

// 具体产品 B
class ConcreteProductB extends Product {
  operation() {
    return "Product B operation";
  }
}

// 抽象工厂类
class Creator {
  createProduct() {
    return new Product(); // 工厂方法
  }
}

// 具体工厂 A
class ConcreteCreatorA extends Creator {
  createProduct() {
    return new ConcreteProductA();
  }
}

// 具体工厂 B
class ConcreteCreatorB extends Creator {
  createProduct() {
    return new ConcreteProductB();
  }
}

// 测试工厂方法模式
const creatorA = new ConcreteCreatorA();
console.log(creatorA.createProduct().operation()); // "Product A operation"

const creatorB = new ConcreteCreatorB();
console.log(creatorB.createProduct().operation()); // "Product B operation"
```

### 适配器模式（Adapter）

**目的**：将一个类的接口转换成客户端希望的另一个接口，使得不兼容的接口可以一起工作。

**应用场景**：当你希望将一个已有的类与一个不兼容的接口进行适配时。

```js
// 目标接口
class Target {
  request() {
    throw new Error("This method must be overridden.");
  }
}

// 现有类，接口不兼容
class Adaptee {
  specificRequest() {
    return "Special request from Adaptee";
  }
}

// 适配器类
class Adapter extends Target {
  constructor(adaptee) {
    super();
    this.adaptee = adaptee;
  }

  request() {
    return this.adaptee.specificRequest();  // 将特定请求适配成通用请求
  }
}

// 测试适配器模式
const adaptee = new Adaptee();
const adapter = new Adapter(adaptee);
console.log(adapter.request());  // "Special request from Adaptee"
```

### 装饰器模式（Decorator）

**目的**：动态地给一个对象添加一些额外的职责。

**应用场景**：当你需要扩展对象的功能时，可以使用装饰器模式，而无需修改原有类。

```js
// 基本组件类
class Coffee {
  cost() {
    return 5;  // 基础咖啡价格
  }
}

// 装饰器基类
class CoffeeDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost();
  }
}

// 具体装饰器类
class MilkDecorator extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 2;  // 加奶装饰，价格增加
  }
}

class SugarDecorator extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 1;  // 加糖装饰，价格增加
  }
}

// 测试装饰器模式
let coffee = new Coffee();
console.log(coffee.cost());  // 5

coffee = new MilkDecorator(coffee);  // 添加奶
console.log(coffee.cost());  // 7

coffee = new SugarDecorator(coffee);  // 再加糖
console.log(coffee.cost());  // 8
```

### 观察者模式（Observer）

**目的**：定义对象间的一对多依赖关系，当一个对象改变状态时，所有依赖它的对象都会自动得到通知并更新。

**应用场景**：例如事件系统、数据绑定等。

```js
// 主题类，管理所有观察者
class Subject {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers() {
    this.observers.forEach(observer => observer.update());
  }
}

// 观察者类
class Observer {
  constructor(name) {
    this.name = name;
  }

  update() {
    console.log(`${this.name} received an update!`);
  }
}

// 测试观察者模式
const subject = new Subject();

const observer1 = new Observer("Observer 1");
const observer2 = new Observer("Observer 2");

subject.addObserver(observer1);
subject.addObserver(observer2);

subject.notifyObservers();
// Output:
// Observer 1 received an update!
// Observer 2 received an update!
```

### 策略模式（Strategy）

**目的**：定义一系列算法，将每一个算法封装起来，并让它们可以互换。

**应用场景**：当你需要在不同算法之间进行选择时，使用策略模式可以避免使用大量的条件判断。

```js
// 策略接口
class PaymentStrategy {
  pay(amount) {
    throw new Error("This method must be overridden.");
  }
}

// 具体策略：支付宝支付
class AlipayStrategy extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} using Alipay`);
  }
}

// 具体策略：微信支付
class WeChatStrategy extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} using WeChat`);
  }
}

// 上下文类，持有策略并委托处理支付
class PaymentContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  executePayment(amount) {
    this.strategy.pay(amount);  // 委托给具体策略
  }
}

// 测试策略模式
const alipay = new AlipayStrategy();
const weChat = new WeChatStrategy();

const context = new PaymentContext(alipay);
context.executePayment(100);  // "Paid 100 using Alipay"

context.strategy = weChat;  // 切换策略
context.executePayment(200);  // "Paid 200 using WeChat"
```

### 状态模式（State）

**目的**：允许对象在内部状态改变时改变其行为，仿佛改变了其类。

**应用场景**：当对象的行为依赖于其状态，并且必须在运行时根据状态变化时。

```js
// 状态接口
class State {
  handle() {
    throw new Error("This method must be overridden.");
  }
}

// 具体状态 A
class ConcreteStateA extends State {
  handle() {
    console.log("Handling in State A");
  }
}

// 具体状态 B
class ConcreteStateB extends State {
  handle() {
    console.log("Handling in State B");
  }
}

// 上下文类，保存当前状态并根据状态切换行为
class Context {
  constructor(state) {
    this.state = state;
  }

  setState(state) {
    this.state = state;  // 切换状态
  }

  request() {
    this.state.handle();  // 根据当前状态执行行为
  }
}

// 测试状态模式
const context = new Context(new ConcreteStateA());
context.request();  // "Handling in State A"

context.setState(new ConcreteStateB());
context.request();  // "Handling in State B"
```

[设计模式](https://refactoringguru.cn/design-patterns/catalog)

## 支付 SDK

这里以封装一个支付 SDK，支持多端，多渠道支付为例，理解开发一个 SDK 设计原则和思想：

### 架构设计原则

- **模块化**：将 SDK 分为多个模块（支付策略、平台适配、支付上下文、API 交互等），每个模块职责单一，遵循单一职责原则（SRP）。
- **可扩展性**：通过策略模式、工厂模式和适配器模式实现了高度的灵活性和可扩展性。可以方便地扩展新的支付渠道（如微信支付、支付宝、苹果支付等）和支持新的平台（H5、React Native、PC 等）。
- **解耦性**：支付渠道、平台适配和支付逻辑都被解耦成不同的模块，避免了对 SDK 核心功能的影响，增加了 SDK 的灵活性和可维护性。
- **统一接口**：通过统一的支付上下文（`PaymentContext`），不同的支付方式和平台都遵循同样的接口规范，保证 SDK 在调用过程中的一致性。

### 设计模式的应用

- **策略模式（Strategy Pattern）**：支付渠道（微信支付、支付宝等）通过策略模式实现不同支付方式的封装。每个支付方式都是独立的策略，遵循同一接口，便于后续的扩展和替换。
  - `PaymentStrategy` 接口定义了支付的基本操作（如生成订单、发起支付、查询支付状态、退款等）。
  - 每个支付渠道实现对应的支付策略类，如 `WeChatPayStrategy`、`AlipayStrategy` 等。
  
- **工厂模式（Factory Pattern）**：`PaymentFactory` 用于创建具体的支付策略对象。根据支付类型，选择相应的支付渠道策略。
  - 通过工厂方法来动态选择支付渠道，避免了大量条件判断，使得扩展支付渠道时只需要添加相应的策略类和工厂方法。

- **适配器模式（Adapter Pattern）**：通过适配器模式实现对不同平台（H5、React Native、PC 等）的适配。每个平台有对应的适配器类，将支付流程与平台的具体实现分离。
  - 适配器模式帮助统一了各个平台的调用接口，开发者无需关心不同平台的差异。

- **模板方法模式（Template Method Pattern）**：通过支付上下文（`PaymentContext`）封装了支付流程的模板，支付流程中涉及的步骤由具体的支付策略类来实现。`PaymentContext` 作为模板类，定义了支付流程的基本步骤，具体的支付渠道通过策略模式来实现每个步骤的细节。

### 模块化分层设计

```shell
/payment-sdk
├── /src
│   ├── /core               # 核心功能模块，如支付上下文、支付策略、工厂等
│   │   ├── /strategies      # 支付策略（微信支付、支付宝支付、苹果支付等）
│   │   ├── /factories      # 支付工厂（生成支付策略）
│   │   ├── /adapters       # 支付适配器（处理平台适配，如H5、React Native等）
│   │   ├── /context        # 支付上下文（执行支付流程）
│   │   ├── /models         # 数据模型（订单、支付状态等）
│   │   └── /utils          # 工具类（签名、加密、时间等工具函数）
│   ├── /platforms          # 针对不同平台的实现（H5、React Native、PC等）
│   │   ├── /h5             # H5平台实现
│   │   ├── /react-native   # React Native平台实现
│   │   └── /pc             # PC平台实现
│   ├── /api                # 与支付服务端交互的 API 模块
│   │   ├── /wechat         # 微信支付相关 API
│   │   ├── /alipay         # 支付宝支付相关 API
│   │   └── /apple          # 苹果支付相关 API
│   ├── /config             # 配置文件（支付方式、平台信息等）
│   └── /index.ts           # SDK 入口文件
├── /test                   # 单元测试文件夹
│   ├── /core               # 核心功能测试
│   ├── /platforms          # 平台相关测试
│   ├── /api                # API 测试
│   └── /utils              # 工具类测试
├── /docs                   # SDK 文档
│   └── /usage.md           # SDK 使用文档
├── /examples               # SDK 示例项目
├── /build                  # 构建输出文件夹
├── /package.json           # npm 配置文件
└── /tsconfig.json          # TypeScript 配置文件
```

### 核心模块（/core）

核心模块包含了 SDK 的主要逻辑，包括支付策略、支付上下文、支付工厂和适配器等内容

- 支付策略（/strategies）：根据不同的支付渠道（如微信支付、支付宝支付、苹果支付等）实现各自的支付流程。每种支付方式都有一个策略类，负责支付过程的具体实现。支付策略类需要实现统一的接口，如 generateOrder、initiatePayment、checkPaymentStatus、refund 等
- 支付工厂（/factories）：支付工厂负责根据支付方式（如微信支付、支付宝支付等）来创建不同的支付策略对象。
- 支付上下文（/context）：支付上下文类协调支付策略的调用，负责顺序执行支付流程中的各个步骤。
- 支付适配器（/adapters）: 适配器模式用于处理不同平台（如 H5、React Native、PC）之间的差异性。每个平台的实现都可以调用相应的支付策略，并封装平台特定的调用逻辑。

#### 支付策略（/strategies）

根据不同的支付渠道（如微信支付、支付宝支付、苹果支付等）实现各自的支付流程。每种支付方式都有一个策略类，负责支付过程的具体实现。支付策略类需要实现统一的接口，如 generateOrder、initiatePayment、checkPaymentStatus、refund 等

```js
// /src/core/strategies/WeChatPayStrategy.ts
export class WeChatPayStrategy implements PaymentStrategy {
  async generateOrder(orderDetails: any): Promise<string> {
    // 微信支付订单生成逻辑
    return 'wechat_order_str_with_signature';
  }

  async initiatePayment(orderStr: string): Promise<string> {
    // 微信支付发起预下单
    return 'wechat_perpay_id';
  }

  async checkPaymentStatus(perpayId: string): Promise<PaymentStatus> {
    // 查询微信支付状态
    return { status: 'success', transactionId: 'wechat_txn_12345' };
  }

  async refund(orderDetails: any): Promise<boolean> {
    // 微信支付退款
    return true;
  }
}

```

#### 支付工厂（/factories）

支付工厂负责根据支付方式（如微信支付、支付宝支付等）来创建不同的支付策略对象。

```js
// /src/core/factories/PaymentFactory.ts
export class PaymentFactory {
  static getStrategy(paymentType: 'wechat' | 'alipay' | 'apple'): PaymentStrategy {
    switch (paymentType) {
      case 'wechat':
        return new WeChatPayStrategy();
      case 'alipay':
        return new AlipayStrategy();
      case 'apple':
        return new ApplePayStrategy();
      default:
        throw new Error('Unsupported payment type');
    }
  }
}

```

#### 支付上下文（/context）

支付上下文类协调支付策略的调用，负责顺序执行支付流程中的各个步骤。

```js
// /src/core/context/PaymentContext.ts
import { PaymentStrategy } from '../strategies/PaymentStrategy';
import { PaymentStatus } from '../models/PaymentStatus';

export class PaymentContext {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  // 生成订单
  async generateOrder(orderDetails: any): Promise<string> {
    try {
      const orderStr = await this.strategy.generateOrder(orderDetails);
      return orderStr;
    } catch (error) {
      throw new Error('订单生成失败：' + error.message);
    }
  }

  // 发起支付
  async initiatePayment(orderStr: string): Promise<string> {
    try {
      const perpayId = await this.strategy.initiatePayment(orderStr);
      return perpayId;
    } catch (error) {
      throw new Error('支付发起失败：' + error.message);
    }
  }

  // 查询支付状态
  async checkPaymentStatus(perpayId: string): Promise<PaymentStatus> {
    try {
      const status = await this.strategy.checkPaymentStatus(perpayId);
      return status;
    } catch (error) {
      throw new Error('支付状态查询失败：' + error.message);
    }
  }

  // 发起退款
  async refundPayment(orderDetails: any): Promise<boolean> {
    try {
      const isRefundSuccessful = await this.strategy.refund(orderDetails);
      return isRefundSuccessful;
    } catch (error) {
      throw new Error('退款失败：' + error.message);
    }
  }

  // 一站式支付流程：生成订单 -> 发起支付 -> 查询状态
  async startPayment(orderDetails: any): Promise<PaymentStatus> {
    try {
      const orderStr = await this.generateOrder(orderDetails);
      const perpayId = await this.initiatePayment(orderStr);
      const paymentStatus = await this.checkPaymentStatus(perpayId);
      return paymentStatus;
    } catch (error) {
      throw new Error('支付流程发生错误：' + error.message);
    }
  }
}

```

#### 支付适配器（/adapters）

适配器模式用于处理不同平台（如 H5、React Native、PC）之间的差异性。每个平台的实现都可以调用相应的支付策略，并封装平台特定的调用逻辑。

```js
// /src/core/adapters/H5PaymentAdapter.ts
export class H5PaymentAdapter implements PaymentAdapter {
  async pay(amount: number): Promise<boolean> {
    // H5 支付特定实现
    console.log(`H5支付: ￥${amount}`);
    return true;
  }
}
```

#### 模型（/models）

数据模型类，用于表示订单信息、支付状态等。通过这些模型类，SDK 可以与支付服务端进行交互。

```js
// /src/core/models/PaymentStatus.ts
export interface PaymentStatus {
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
}

```

#### 工具类（/utils）

工具类包含一些常用的功能，如签名生成、加密、解密等。

```js
// /src/core/utils/Signature.ts
export class Signature {
  static generateSignature(data: any, secretKey: string): string {
    // 签名生成逻辑
    return 'generated_signature';
  }
}

```

### 平台相关实现（/platforms）

包含了平台特定的代码，处理不同平台的支付交互方式

#### H5 支付实现（/h5）

```js
// /src/platforms/h5/PaymentService.ts
import { H5PaymentAdapter } from '../../core/adapters/H5PaymentAdapter';

export class H5PaymentService {
  private adapter: H5PaymentAdapter;

  constructor() {
    this.adapter = new H5PaymentAdapter();
  }

  async pay(amount: number): Promise<boolean> {
    return this.adapter.pay(amount);
  }
}

```

#### React Native 支付实现（/react-native）

```js
// /src/platforms/react-native/PaymentService.ts
import { RNPamentAdapter } from '../../core/adapters/RNPamentAdapter';

export class RNPaymentService {
  private adapter: RNPamentAdapter;

  constructor() {
    this.adapter = new RNPamentAdapter();
  }

  async pay(amount: number): Promise<boolean> {
    return this.adapter.pay(amount);
  }
}

```

### API 模块（/api）

封装了与支付服务端的交互，调用不同支付平台的支付接口（如微信、支付宝、苹果支付等）。

```js
// /src/api/wechat/WechatAPI.ts
export class WechatAPI {
  async generateOrder(orderDetails: any): Promise<string> {
    // 调用微信支付 API 生成订单
    return 'wechat_order_str_with_signature';
  }

  async initiatePayment(orderStr: string): Promise<string> {
    // 调用微信支付 API 发起预下单
    return 'wechat_perpay_id';
  }

  async checkPaymentStatus(perpayId: string): Promise<PaymentStatus> {
    // 查询微信支付状态
    return { status: 'success', transactionId: 'wechat_txn_12345' };
  }

  async refund(orderDetails: any): Promise<boolean> {
    // 调用微信支付 API 发起退款
    return true;
  }
}

```

### SDK 入口文件（index.ts）

```js
// /src/index.ts
// SDK 入口文件，提供支付接口
import { PaymentFactory } from './core/factories/PaymentFactory';
import { PaymentContext } from './core/context/PaymentContext';
import { PaymentStrategy } from './core/strategies/PaymentStrategy';

// 初始化支付工厂和支付上下文
const paymentType = 'wechat'; // 假设选择了微信支付
const strategy: PaymentStrategy = PaymentFactory.getStrategy(paymentType);
const paymentContext = new PaymentContext(strategy);

// 使用 SDK 调用支付
async function startPayment() {
  const orderDetails = { amount: 100 }; // 订单信息
  const orderStr = await paymentContext.generateOrder(orderDetails);
  console.log('订单字符串：', orderStr);

  const perpayId = await paymentContext.initiatePayment(orderStr);
  console.log('预支付 ID：', perpayId);

  // 查询支付状态
  const status = await paymentContext.checkPaymentStatus(perpayId);
  console.log('支付状态：', status);
}

// 发起支付
startPayment();

```

### Rollup 打包

```js
// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import path from 'path';

export default {
  input: 'src/index.ts', // SDK 入口文件
  output: [
    {
      file: 'dist/your-payment-sdk.esm.js', // ESM 格式，适用于现代前端框架
      format: 'esm', // ES Module 格式
      sourcemap: true, // 启用源映射，便于调试
    },
    {
      file: 'dist/your-payment-sdk.cjs.js', // CommonJS 格式，适用于 Node.js 环境
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/your-payment-sdk.umd.js', // UMD 格式，兼容浏览器和 Node.js
      format: 'umd',
      name: 'PaymentSDK', // UMD 格式的全局变量名称
      sourcemap: true,
    },
    {
      file: 'dist/your-payment-sdk.min.js', // 压缩后的文件
      format: 'umd',
      name: 'PaymentSDK', // UMD 格式的全局变量名称
      sourcemap: true,
      plugins: [terser()], // 压缩代码
    },
  ],
  external: ['axios', 'dayjs'], // 外部依赖，防止将其打包进 SDK，减少体积
  plugins: [
    resolve(), // 解析 Node.js 模块
    commonjs(), // 支持 CommonJS 模块
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'), // 使用 TypeScript 配置文件
      useTsconfigDeclarationDir: true, // 指定声明文件输出目录
    }),
  ],
  treeshake: {
    moduleSideEffects: false, // 禁用模块副作用，启用 tree-shaking
  },
  preserveModules: true, // 保留模块结构，便于按需加载
  // 如果你的 SDK 依赖了动态导入，可以设置输出目录
  output: {
    dir: 'dist',
    format: 'esm',
    chunkFileNames: 'chunks/[name]-[hash].js', // 按需加载的文件命名
  },
};

```

### 使用

```js
import { PaymentFactory } from 'your-payment-sdk';
import { PaymentContext } from 'your-payment-sdk';

// 配置支付类型，假设是微信支付
const paymentType = 'wechat'; // 或 'alipay'
const strategy = PaymentFactory.getStrategy(paymentType);
const paymentContext = new PaymentContext(strategy);

// 调用支付流程
async function makePayment() {
  const orderDetails = { amount: 100, orderId: '123456789' };

  try {
    const paymentStatus = await paymentContext.startPayment(orderDetails);
    if (paymentStatus.status === 'success') {
      console.log('支付成功！');
    } else {
      console.log('支付失败');
    }
  } catch (error) {
    console.error('支付失败，错误信息：', error.message);
  }
}

// 发起支付
makePayment();

```

## canIUse 兼容性设计

可利用 `ts-morph` 来实现支付 SDK 的 `caniuse` 功能，主要的目标是基于 TypeScript 代码的分析，判断 SDK 中的 **API、回调、参数、组件** 等是否在当前版本中可用。我们可以通过 `ts-morph` 对 SDK 的 TypeScript 代码进行静态分析，识别出不同功能的支持情况，并根据版本信息来判断该功能是否可用。

### 目标

1. **API**：支付 SDK 中的接口方法（如：`createOrder`, `processPayment`）。
2. **回调**：SDK 中的回调函数或事件（如：`onSuccess`, `onError`）。
3. **参数**：SDK 方法或回调中使用的参数（如：`amount`, `currency`）。
4. **组件**：SDK 中的组件（如：支付按钮、订单面板等）。

### 基本设计思路

我们需要实现以下几个步骤：

1. **定义支持版本的注释**：通过在 SDK 中的 API、回调、参数、组件等上添加版本注释，指明该功能从哪个版本开始支持。
2. **静态分析 SDK 代码**：使用 `ts-morph` 来解析 TypeScript 代码，分析 SDK 中的类、方法、参数、回调等。
3. **提取支持版本信息**：从代码中的注释中提取版本信息，并生成 `canIUseFeatures` 数据结构。
4. **判断功能是否可用**：通过动态检测当前平台的 SDK 版本，并根据 `canIUseFeatures` 来判断功能是否可用。

### 实现示例

```js
import { Project } from 'ts-morph';

// 假设这是 SDK 类型定义文件路径
const sdkFilePath = 'path/to/PaymentAPI.d.ts';

// 支持的版本范围，这里你可以设定具体的版本范围（如 3.0 到 5.0）
const SUPPORTED_VERSIONS = ['3.0', '3.1', '4.0', '5.0'];

/**
 * @description 用于表示每个功能的支持信息，包括版本、废弃状态等。
 */
interface FeatureSupportInfo {
  version: string; // 版本号
  deprecated: boolean; // 是否废弃
  replacement?: string; // 如果废弃，推荐的替代方法或参数
}

/**
 * @description 构建 SDK 支持信息，获取每个函数、接口、属性的版本信息和废弃状态。
 */
const buildSupportInfo = (sourceFile: any) => {
  const apiSupportInfo: { [key: string]: FeatureSupportInfo } = {};

  // 获取所有函数信息，包括注释和版本
  sourceFile.getFunctions().forEach(fn => {
    const functionName = fn.getName();
    const docComment = fn.getJsDoc()[0]?.getComment();
    const versionMatch = docComment?.match(/@version (\d+\.\d+)/);
    const version = versionMatch ? versionMatch[1] : null;
    const deprecated = docComment?.includes('@deprecated') || false;
    const replacement = docComment?.match(/@deprecated (.*)/)?.[1] || undefined;

    if (version) {
      apiSupportInfo[functionName] = {
        version,
        deprecated,
        replacement
      };
    }
  });

  // 获取所有类中的方法，并构建相应的信息
  sourceFile.getClasses().forEach(cls => {
    const className = cls.getName();
    cls.getMethods().forEach(method => {
      const methodName = method.getName();
      const docComment = method.getJsDoc()[0]?.getComment();
      const versionMatch = docComment?.match(/@version (\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : null;
      const deprecated = docComment?.includes('@deprecated') || false;
      const replacement = docComment?.match(/@deprecated (.*)/)?.[1] || undefined;

      if (version) {
        apiSupportInfo[`${className}.${methodName}`] = {
          version,
          deprecated,
          replacement
        };
      }
    });
  });

  // 获取接口中的属性信息
  sourceFile.getInterfaces().forEach(intf => {
    const interfaceName = intf.getName();
    intf.getProperties().forEach(prop => {
      const propertyName = prop.getName();
      const docComment = prop.getJsDoc()[0]?.getComment();
      const versionMatch = docComment?.match(/@version (\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : null;
      const deprecated = docComment?.includes('@deprecated') || false;
      const replacement = docComment?.match(/@deprecated (.*)/)?.[1] || undefined;

      if (version) {
        apiSupportInfo[`${interfaceName}.${propertyName}`] = {
          version,
          deprecated,
          replacement
        };
      }
    });
  });

  return apiSupportInfo;
};

/**
 * @description canIUse 函数，用于判断特定路径的功能是否可用。
 * @param {string} path - 用户传入的功能路径，例如 'PaymentAPI.processPayment.amount.currency'
 * @param {string} currentVersion - 当前目标版本，通常是应用的版本。
 * @returns {string} - 返回功能是否支持，以及是否废弃。
 */
const canIUse = (path: string, currentVersion: string): string => {
  const parts = path.split('.'); // 将路径拆分成各个层级
  let currentPath = '';
  let supportStatus = 'not found'; // 默认返回功能未找到

  // 遍历路径的每个部分，逐层检查支持情况
  for (let i = 0; i < parts.length; i++) {
    currentPath += (i > 0 ? '.' : '') + parts[i];

    if (apiSupportInfo[currentPath]) {
      const info = apiSupportInfo[currentPath];
      // 检查版本是否支持，并处理废弃的情况
      if (SUPPORTED_VERSIONS.includes(info.version) && !info.deprecated) {
        supportStatus = `supported in ${info.version}`;
      } else if (info.deprecated) {
        supportStatus = `deprecated in ${info.version}${info.replacement ? `. Please use ${info.replacement}` : ''}`;
      } else {
        supportStatus = `not supported`;
      }
    }
  }

  return `Path: ${path}, Status: ${supportStatus}`;
};

// 创建 ts-morph 项目并加载 SDK 文件
const project = new Project();
const sourceFile = project.addSourceFileAtPath(sdkFilePath);

// 获取 SDK 支持信息
const apiSupportInfo = buildSupportInfo(sourceFile);

// 测试用例
const testPaths = [
  'processPayment',
  'PaymentAPI.processPayment.methods',
  'PaymentAPI.processPayment.amount.currency',
  'PaymentAPI.processPayment.method'
];

testPaths.forEach(path => {
  const result = canIUse(path, '3.1'); // 假设我们在 3.1 版本中进行检查
  console.log(result);
});

```

### JSDOC 注释

```js
// PaymentAPI.d.ts

/**
 * @version 3.0
 * 处理支付请求的 API，使用 `method` 参数指定支付方式（如信用卡、PayPal）。
 * @param {number} amount - 支付金额
 * @param {string} currency - 支付货币（支持 USD、EUR 等）
 * @param {string} method - 支付方式（如信用卡、PayPal）
 * @returns {void} - 无返回值
 * @deprecated 从版本 3.1 开始，`method` 参数已被废弃，使用 `methods` 替代。
 * 
 * 示例：
 * ```ts
 * PaymentAPI.processPayment(100, 'USD', 'credit_card');
 * ```
 */
export function processPayment(amount: number, currency: string, method: string): void;

/**
 * @version 3.1
 * 处理支付请求的 API，使用 `methods` 参数指定支付方式。
 * 支持多个支付方式的并行选择，改为接受一个数组。
 * @param {number} amount - 支付金额
 * @param {string} currency - 支付货币（支持 USD、EUR 等）
 * @param {string[]} methods - 支付方式数组（如 `['credit_card', 'paypal']`）
 * @returns {void} - 无返回值
 * 
 * 示例：
 * ```ts
 * PaymentAPI.processPayment(100, 'USD', ['credit_card', 'paypal']);
 * ```
 */
export function processPayment(amount: number, currency: string, methods: string[]): void;
```

## TypeDoc 文档生成

### tsconfig.json 配置

在 tsconfig.json 文件中配置 TypeDoc 相关的设置。这是推荐的方式，便于管理项目的编译和文档生成设置。

```js
{
  "out": "./docs",                  // 输出文档的目录
  "exclude": "**/test/**",           // 排除测试目录
  "excludePrivate": true,            // 排除私有成员
  "excludeProtected": true,          // 排除受保护成员
  "includeDeclarations": false,      // 是否包括声明文件
  "theme": "default",                // 使用默认主题
  "readme": "none",                  // 不包括 README 文件
  "hideGenerator": true,             // 隐藏生成器信息
  "ignoreCompilerErrors": true,      // 忽略 TypeScript 编译错误
  "name": "Payment SDK API"          // 文档标题
}
```

### 在代码中使用 JSDoc 注释

```js
/**
 * 处理支付的 API。
 * @version 3.0
 * @example
 * ```ts
 * PaymentAPI.processPayment(100, 'USD', 'credit_card');
 * ```
 */
export class PaymentAPI {
  
  /**
   * 处理支付请求。
   * @param amount 支付金额
   * @param currency 支付货币（如 USD、EUR）
   * @param method 支付方式（如信用卡、PayPal）
   * @returns 无返回值
   * @throws {Error} 如果支付失败则抛出错误
   * @version 3.0
   */
  public static processPayment(amount: number, currency: string, method: string): void {
    if (amount <= 0) {
      throw new Error("Invalid amount");
    }
    // 处理支付逻辑
  }
}

```

### 通过命令行生成文档

```js
npx typedoc --out docs --exclude **/test/** --excludePrivate --excludeProtected --name "Payment SDK API" src

```
