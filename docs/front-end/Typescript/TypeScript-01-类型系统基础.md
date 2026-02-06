# TypeScript-01-类型系统基础

> 类型系统是 TypeScript 的核心，掌握它是高效使用 TypeScript 的基础。

## 1. 基本类型

### 1.1 原始类型

```typescript
// 字符串
let name: string = "TypeScript";

// 数字（整数和浮点数统一为 number）
let age: number = 25;
let price: number = 99.99;

// 布尔值
let isActive: boolean = true;

// ES6 新增的原始类型
let uniqueId: symbol = Symbol("id");
let bigNumber: bigint = 100n;
```

### 1.2 特殊类型

```typescript
// null 和 undefined
let empty: null = null;
let notDefined: undefined = undefined;

// void - 表示没有返回值
function logMessage(msg: string): void {
  console.log(msg);
}

// never - 表示永远不会有返回值
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// unknown - 类型安全的 any
let userInput: unknown;
userInput = 5;
userInput = "hello";
// 使用前必须进行类型检查
if (typeof userInput === "string") {
  console.log(userInput.toUpperCase());
}

// any - 放弃类型检查（尽量避免使用）
let flexible: any = "anything";
flexible = 123;
flexible.nonExistentMethod(); // 不会报错，但运行时会出错
```

### 1.3 数组与元组

```typescript
// 数组的两种写法
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// 只读数组
let readonlyArr: readonly number[] = [1, 2, 3];
// readonlyArr.push(4); // 错误：不能修改只读数组

// 元组 - 固定长度和类型的数组
let tuple: [string, number] = ["hello", 42];
let [greeting, count] = tuple; // 解构赋值

// 可选元素的元组
let optionalTuple: [string, number?] = ["hello"];

// 剩余元素的元组
let restTuple: [string, ...number[]] = ["hello", 1, 2, 3];

// 命名元组（TypeScript 4.0+）
type NamedTuple = [name: string, age: number];
```

## 2. 对象类型

### 2.1 对象字面量类型

```typescript
// 直接定义对象类型
let user: { name: string; age: number } = {
  name: "Alice",
  age: 25,
};

// 可选属性
let config: { host: string; port?: number } = {
  host: "localhost",
};

// 只读属性
let point: { readonly x: number; readonly y: number } = {
  x: 10,
  y: 20,
};
// point.x = 5; // 错误：不能修改只读属性

// 索引签名
let dictionary: { [key: string]: string } = {
  hello: "你好",
  world: "世界",
};
```

### 2.2 接口 (Interface)

```typescript
// 基本接口定义
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // 可选属性
  readonly createdAt: Date; // 只读属性
}

// 使用接口
const alice: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date(),
};

// 接口继承
interface Employee extends User {
  department: string;
  salary: number;
}

// 多重继承
interface Manager extends Employee {
  subordinates: Employee[];
}

// 接口合并（同名接口会自动合并）
interface Config {
  host: string;
}
interface Config {
  port: number;
}
// 等同于 interface Config { host: string; port: number; }
```

### 2.3 类型别名 (Type Alias)

```typescript
// 基本类型别名
type ID = string | number;
type Point = { x: number; y: number };

// 与接口的区别
// 1. 类型别名可以定义联合类型、交叉类型、元组等
type Status = "pending" | "approved" | "rejected";
type Coordinate = [number, number];

// 2. 类型别名不能被重复声明（接口可以合并）
// type Status = "active"; // 错误：重复声明

// 3. 类型别名使用交叉类型实现扩展
type ExtendedPoint = Point & { z: number };
```

### 2.4 接口 vs 类型别名

```typescript
// 推荐使用场景

// 使用 interface：
// - 定义对象结构
// - 需要被类实现（implements）
// - 需要声明合并

interface Animal {
  name: string;
  speak(): void;
}

class Dog implements Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  speak() {
    console.log("Woof!");
  }
}

// 使用 type：
// - 定义联合类型、交叉类型
// - 定义元组
// - 定义函数类型
// - 定义复杂的类型运算

type Result<T> = { success: true; data: T } | { success: false; error: string };
type Handler = (event: Event) => void;
```

## 3. 联合类型与交叉类型

### 3.1 联合类型 (Union Types)

```typescript
// 基本联合类型
type StringOrNumber = string | number;

function printId(id: StringOrNumber) {
  // 类型收窄
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}

// 字面量联合类型
type Direction = "up" | "down" | "left" | "right";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function move(direction: Direction) {
  console.log(`Moving ${direction}`);
}

// 可辨识联合（Discriminated Unions）
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

type Shape = Circle | Square | Rectangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

### 3.2 交叉类型 (Intersection Types)

```typescript
// 合并多个类型
interface HasName {
  name: string;
}

interface HasAge {
  age: number;
}

interface HasEmail {
  email: string;
}

type Person = HasName & HasAge & HasEmail;

const person: Person = {
  name: "Alice",
  age: 25,
  email: "alice@example.com",
};

// 常用于 mixin 模式
function withTimestamp<T extends object>(obj: T): T & { timestamp: Date } {
  return { ...obj, timestamp: new Date() };
}

const timestamped = withTimestamp({ name: "Alice" });
// timestamped 的类型是 { name: string } & { timestamp: Date }
```

## 4. 类型推断

### 4.1 基本推断

```typescript
// 变量初始化时推断
let message = "Hello"; // 推断为 string
let count = 42; // 推断为 number
let isReady = true; // 推断为 boolean

// 数组推断
let numbers = [1, 2, 3]; // 推断为 number[]
let mixed = [1, "two", true]; // 推断为 (string | number | boolean)[]

// 对象推断
let user = {
  name: "Alice",
  age: 25,
}; // 推断为 { name: string; age: number }
```

### 4.2 最佳公共类型

```typescript
// TypeScript 会找出最佳公共类型
class Animal {}
class Dog extends Animal {}
class Cat extends Animal {}

let pets = [new Dog(), new Cat()]; // 推断为 (Dog | Cat)[]

// 如果需要推断为基类，需要显式指定
let animals: Animal[] = [new Dog(), new Cat()];
```

### 4.3 上下文类型

```typescript
// 根据上下文推断参数类型
const names = ["Alice", "Bob", "Charlie"];

// forEach 的回调参数自动推断为 string
names.forEach((name) => {
  console.log(name.toUpperCase()); // name 被推断为 string
});

// 事件处理器的上下文推断
document.addEventListener("click", (event) => {
  // event 被推断为 MouseEvent
  console.log(event.clientX, event.clientY);
});
```

### 4.4 const 断言

```typescript
// 普通声明
let colors = ["red", "green", "blue"]; // string[]

// as const 断言 - 将类型收窄为字面量类型
const colorsConst = ["red", "green", "blue"] as const;
// 类型为 readonly ["red", "green", "blue"]

// 对象的 const 断言
const config = {
  host: "localhost",
  port: 3000,
} as const;
// 类型为 { readonly host: "localhost"; readonly port: 3000 }

// 常用于定义常量配置
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
// HttpMethod 的类型是 "GET" | "POST" | "PUT" | "DELETE"
```

## 5. 类型守卫与类型收窄

### 5.1 typeof 类型守卫

```typescript
function padLeft(value: string, padding: string | number): string {
  if (typeof padding === "number") {
    // 这里 padding 被收窄为 number
    return " ".repeat(padding) + value;
  }
  // 这里 padding 被收窄为 string
  return padding + value;
}
```

### 5.2 instanceof 类型守卫

```typescript
class Bird {
  fly() {
    console.log("Flying...");
  }
}

class Fish {
  swim() {
    console.log("Swimming...");
  }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

### 5.3 in 操作符

```typescript
interface Admin {
  name: string;
  privileges: string[];
}

interface Employee {
  name: string;
  startDate: Date;
}

type UnknownEmployee = Admin | Employee;

function printEmployeeInfo(emp: UnknownEmployee) {
  console.log(`Name: ${emp.name}`);

  if ("privileges" in emp) {
    // emp 被收窄为 Admin
    console.log(`Privileges: ${emp.privileges.join(", ")}`);
  }

  if ("startDate" in emp) {
    // emp 被收窄为 Employee
    console.log(`Start Date: ${emp.startDate.toISOString()}`);
  }
}
```

### 5.4 自定义类型守卫

```typescript
// 类型谓词 (Type Predicate)
interface Cat {
  meow(): void;
}

interface Dog {
  bark(): void;
}

// 返回类型是类型谓词
function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // animal 被收窄为 Cat
  } else {
    animal.bark(); // animal 被收窄为 Dog
  }
}

// 断言函数 (Assertion Functions)
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }
}

function processValue(value: unknown) {
  assertIsString(value);
  // 这里 value 被收窄为 string
  console.log(value.toUpperCase());
}
```

## 6. 函数类型

### 6.1 函数类型声明

```typescript
// 函数声明
function add(a: number, b: number): number {
  return a + b;
}

// 函数表达式
const multiply: (a: number, b: number) => number = (a, b) => a * b;

// 使用类型别名
type MathOperation = (a: number, b: number) => number;
const subtract: MathOperation = (a, b) => a - b;

// 使用接口
interface MathFunc {
  (a: number, b: number): number;
}
const divide: MathFunc = (a, b) => a / b;
```

### 6.2 可选参数与默认参数

```typescript
// 可选参数（必须放在必选参数后面）
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

// 默认参数
function createUser(name: string, role: string = "user"): object {
  return { name, role };
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}
```

### 6.3 函数重载

```typescript
// 重载签名
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;

// 实现签名
function format(value: string | number | Date): string {
  if (typeof value === "string") {
    return value.trim();
  } else if (typeof value === "number") {
    return value.toFixed(2);
  } else {
    return value.toISOString();
  }
}

// 调用
format("  hello  "); // string 版本
format(3.14159); // number 版本
format(new Date()); // Date 版本

// 更复杂的重载示例
interface User {
  id: number;
  name: string;
}

function getUser(id: number): User;
function getUser(name: string): User[];
function getUser(idOrName: number | string): User | User[] {
  if (typeof idOrName === "number") {
    return { id: idOrName, name: "User" };
  }
  return [{ id: 1, name: idOrName }];
}
```

### 6.4 this 类型

```typescript
// 显式声明 this 类型
interface Calculator {
  value: number;
  add(n: number): this;
  multiply(n: number): this;
}

const calc: Calculator = {
  value: 0,
  add(this: Calculator, n: number) {
    this.value += n;
    return this;
  },
  multiply(this: Calculator, n: number) {
    this.value *= n;
    return this;
  },
};

// 链式调用
calc.add(5).multiply(2).add(3);
console.log(calc.value); // 13
```

## 7. 枚举类型

### 7.1 数字枚举

```typescript
// 默认从 0 开始
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}

// 自定义起始值
enum Status {
  Pending = 1,
  Approved, // 2
  Rejected, // 3
}

// 使用枚举
let dir: Direction = Direction.Up;
console.log(dir); // 0
console.log(Direction[0]); // "Up" (反向映射)
```

### 7.2 字符串枚举

```typescript
enum HttpStatus {
  OK = "OK",
  NotFound = "NOT_FOUND",
  InternalError = "INTERNAL_ERROR",
}

// 字符串枚举没有反向映射
console.log(HttpStatus.OK); // "OK"
```

### 7.3 const 枚举

```typescript
// const 枚举在编译时被内联，不会生成额外代码
const enum Colors {
  Red = "#FF0000",
  Green = "#00FF00",
  Blue = "#0000FF",
}

// 编译后直接替换为值
let red = Colors.Red; // 编译为: let red = "#FF0000"
```

### 7.4 枚举的替代方案

```typescript
// 推荐：使用 const 对象 + as const
const Direction = {
  Up: "UP",
  Down: "DOWN",
  Left: "LEFT",
  Right: "RIGHT",
} as const;

type Direction = (typeof Direction)[keyof typeof Direction];
// 类型为 "UP" | "DOWN" | "LEFT" | "RIGHT"

// 优点：
// 1. 更好的 tree-shaking
// 2. 与 JavaScript 兼容
// 3. 类型推断更精确
```

## 8. 类型断言

### 8.1 基本断言

```typescript
// 使用 as 语法（推荐）
let value: unknown = "hello";
let length = (value as string).length;

// 使用尖括号语法（在 JSX 中不可用）
let length2 = (<string>value).length;
```

### 8.2 非空断言

```typescript
// 非空断言操作符 !
function getLength(str: string | null): number {
  // 告诉编译器 str 一定不为 null
  return str!.length;
}

// 注意：非空断言只是告诉编译器信任你，不会在运行时检查
// 如果 str 实际为 null，会导致运行时错误
```

### 8.3 双重断言

```typescript
// 当直接断言不被允许时，可以使用双重断言
// 但这通常是一个代码坏味道，应该避免

interface Cat {
  meow(): void;
}

interface Dog {
  bark(): void;
}

// 错误：Cat 和 Dog 没有足够的重叠
// let cat: Cat = dog as Cat;

// 双重断言（不推荐）
let dog = {} as Dog;
let cat = dog as unknown as Cat;
```

## 9. 实践练习

### 练习 1：定义用户系统类型

```typescript
// 定义用户角色
type UserRole = "admin" | "editor" | "viewer";

// 定义用户状态
type UserStatus = "active" | "inactive" | "banned";

// 定义用户接口
interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt?: Date;
  profile?: {
    avatar?: string;
    bio?: string;
  };
}

// 创建用户函数
function createUser(
  username: string,
  email: string,
  role: UserRole = "viewer"
): User {
  return {
    id: Date.now(),
    username,
    email,
    role,
    status: "active",
    createdAt: new Date(),
  };
}

// 类型守卫：检查是否为管理员
function isAdmin(user: User): boolean {
  return user.role === "admin";
}
```

### 练习 2：API 响应类型

```typescript
// 通用 API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 分页响应
interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 使用示例
type UserListResponse = ApiResponse<PaginatedData<User>>;

// 模拟 API 调用
async function fetchUsers(
  page: number,
  pageSize: number
): Promise<UserListResponse> {
  // 模拟实现
  return {
    code: 200,
    message: "success",
    data: {
      items: [],
      total: 0,
      page,
      pageSize,
      hasMore: false,
    },
    timestamp: Date.now(),
  };
}
```

## 10. 小结

本章介绍了 TypeScript 类型系统的基础知识：

1. **基本类型**：string、number、boolean、null、undefined、void、never、unknown、any
2. **对象类型**：对象字面量、接口、类型别名
3. **联合与交叉类型**：灵活组合类型
4. **类型推断**：让 TypeScript 自动推导类型
5. **类型守卫**：在运行时收窄类型
6. **函数类型**：参数、返回值、重载
7. **枚举**：定义常量集合
8. **类型断言**：告诉编译器你比它更了解类型

下一章我们将深入学习泛型和高级类型特性。
