# TypeScript-02-高级类型与泛型

> 泛型是 TypeScript 最强大的特性之一，让我们能够编写可复用且类型安全的代码。

## 1. 泛型基础

### 1.1 为什么需要泛型

```typescript
// 没有泛型的情况
function identityNumber(arg: number): number {
  return arg;
}

function identityString(arg: string): string {
  return arg;
}

// 使用 any 会失去类型安全
function identityAny(arg: any): any {
  return arg;
}

// 使用泛型 - 既保持类型安全，又具有复用性
function identity<T>(arg: T): T {
  return arg;
}

// 使用时可以显式指定类型
let output1 = identity<string>("hello");

// 也可以让 TypeScript 自动推断
let output2 = identity(42); // T 被推断为 number
```

### 1.2 泛型函数

```typescript
// 基本泛型函数
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const firstNumber = first([1, 2, 3]); // number | undefined
const firstString = first(["a", "b"]); // string | undefined

// 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const numberAndString = pair(1, "hello"); // [number, string]
const booleanAndDate = pair(true, new Date()); // [boolean, Date]

// 泛型箭头函数
const map = <T, U>(arr: T[], fn: (item: T) => U): U[] => {
  return arr.map(fn);
};

const lengths = map(["a", "bb", "ccc"], (s) => s.length); // number[]
```

### 1.3 泛型接口

```typescript
// 泛型接口
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

// 使用泛型接口
const numberContainer: Container<number> = {
  value: 42,
  getValue() {
    return this.value;
  },
  setValue(value: number) {
    this.value = value;
  },
};

// 泛型函数接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

const myIdentity: GenericIdentityFn<number> = (arg) => arg;
```

### 1.4 泛型类

```typescript
// 泛型类
class Queue<T> {
  private data: T[] = [];

  push(item: T): void {
    this.data.push(item);
  }

  pop(): T | undefined {
    return this.data.shift();
  }

  peek(): T | undefined {
    return this.data[0];
  }

  size(): number {
    return this.data.length;
  }
}

const numberQueue = new Queue<number>();
numberQueue.push(1);
numberQueue.push(2);
console.log(numberQueue.pop()); // 1

const stringQueue = new Queue<string>();
stringQueue.push("hello");
stringQueue.push("world");
```

## 2. 泛型约束

### 2.1 extends 约束

```typescript
// 基本约束
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): void {
  console.log(arg.length); // 现在可以访问 length 属性
}

logLength("hello"); // ✓
logLength([1, 2, 3]); // ✓
logLength({ length: 10 }); // ✓
// logLength(123); // ✗ 错误：number 没有 length 属性

// 约束为特定类型
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 25 };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// getProperty(person, "email"); // 错误：email 不是 person 的属性
```

### 2.2 多重约束

```typescript
// 使用交叉类型实现多重约束
interface Printable {
  print(): void;
}

interface Loggable {
  log(): void;
}

function process<T extends Printable & Loggable>(item: T): void {
  item.print();
  item.log();
}

// 约束为构造函数
interface Constructor<T> {
  new (...args: any[]): T;
}

function create<T>(Ctor: Constructor<T>, ...args: any[]): T {
  return new Ctor(...args);
}

class Person {
  constructor(public name: string) {}
}

const alice = create(Person, "Alice");
```

### 2.3 条件约束

```typescript
// 根据条件约束类型
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null>; // string
type B = NonNullable<number | undefined>; // number
type C = NonNullable<string | null | undefined>; // string

// 复杂的条件约束
type Flatten<T> = T extends Array<infer U> ? U : T;

type Num = Flatten<number[]>; // number
type Str = Flatten<string>; // string
```

## 3. 条件类型

### 3.1 基本条件类型

```typescript
// 语法：T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// 实用条件类型
type TypeName<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends undefined
  ? "undefined"
  : T extends Function
  ? "function"
  : "object";

type T0 = TypeName<string>; // "string"
type T1 = TypeName<() => void>; // "function"
```

### 3.2 分布式条件类型

```typescript
// 当条件类型作用于联合类型时，会分布到每个成员上
type ToArray<T> = T extends any ? T[] : never;

type StrOrNumArray = ToArray<string | number>;
// 等价于 string[] | number[]

// 实际应用
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;

type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
type T1 = Extract<"a" | "b" | "c", "a" | "f">; // "a"

// 阻止分布式条件类型
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type StrOrNumArray2 = ToArrayNonDist<string | number>;
// (string | number)[]
```

### 3.3 infer 关键字

```typescript
// infer 用于在条件类型中推断类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Func = () => string;
type FuncReturnType = ReturnType<Func>; // string

// 推断函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type FuncParams = Parameters<(a: string, b: number) => void>;
// [string, number]

// 推断数组元素类型
type ArrayElementType<T> = T extends (infer U)[] ? U : T;

type T0 = ArrayElementType<string[]>; // string
type T1 = ArrayElementType<number>; // number

// 推断 Promise 的值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type T2 = UnwrapPromise<Promise<string>>; // string
type T3 = UnwrapPromise<number>; // number

// 深度解包 Promise
type DeepUnwrapPromise<T> = T extends Promise<infer U>
  ? DeepUnwrapPromise<U>
  : T;

type T4 = DeepUnwrapPromise<Promise<Promise<Promise<string>>>>; // string
```

### 3.4 复杂条件类型示例

```typescript
// 获取对象的可选属性
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface User {
  id: number;
  name: string;
  age?: number;
  email?: string;
}

type UserOptionalKeys = OptionalKeys<User>; // "age" | "email"

// 获取对象的必选属性
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type UserRequiredKeys = RequiredKeys<User>; // "id" | "name"

// 函数重载的返回类型
type OverloadedReturnType<T> = T extends {
  (...args: any[]): infer R;
  (...args: any[]): infer R;
  (...args: any[]): infer R;
}
  ? R
  : T extends {
      (...args: any[]): infer R;
      (...args: any[]): infer R;
    }
  ? R
  : T extends (...args: any[]) => infer R
  ? R
  : never;
```

## 4. 映射类型

### 4.1 基本映射类型

```typescript
// 基本语法
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 使用示例
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type ReadonlyTodo = Readonly<Todo>;
// {
//   readonly title: string;
//   readonly description: string;
//   readonly completed: boolean;
// }

type PartialTodo = Partial<Todo>;
// {
//   title?: string;
//   description?: string;
//   completed?: boolean;
// }
```

### 4.2 映射修饰符

```typescript
// 添加/移除 readonly 和 ?

// 添加 readonly
type AddReadonly<T> = {
  +readonly [P in keyof T]: T[P];
};

// 移除 readonly
type RemoveReadonly<T> = {
  -readonly [P in keyof T]: T[P];
};

// 添加可选
type AddOptional<T> = {
  [P in keyof T]?: T[P];
};

// 移除可选（变为必选）
type RemoveOptional<T> = {
  [P in keyof T]-?: T[P];
};

// Required 工具类型的实现
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

### 4.3 键重映射

```typescript
// TypeScript 4.1+ 支持键重映射
// 使用 as 子句重新映射键

// 为属性添加前缀
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

// 过滤属性
type RemoveKindField<T> = {
  [K in keyof T as Exclude<K, "kind">]: T[K];
};

interface Circle {
  kind: "circle";
  radius: number;
}

type CircleWithoutKind = RemoveKindField<Circle>;
// { radius: number }

// 条件键映射
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

type UserStrings = PickByType<User, string>;
// { name: string; email: string }
```

### 4.4 复杂映射类型

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface NestedData {
  user: {
    profile: {
      name: string;
    };
  };
}

type ReadonlyNestedData = DeepReadonly<NestedData>;
// {
//   readonly user: {
//     readonly profile: {
//       readonly name: string;
//     };
//   };
// }

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 可空类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// 可空或可选
type Optional<T> = {
  [P in keyof T]?: T[P] | null;
};
```

## 5. 模板字面量类型

### 5.1 基本用法

```typescript
// TypeScript 4.1+ 支持模板字面量类型
type World = "world";
type Greeting = `hello ${World}`; // "hello world"

// 组合多个字符串字面量类型
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
```

### 5.2 与映射类型结合

```typescript
// 创建事件处理器类型
type PropEventSource<T> = {
  on<K extends string & keyof T>(
    eventName: `${K}Changed`,
    callback: (newValue: T[K]) => void
  ): void;
};

declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;

const person = makeWatchedObject({
  firstName: "John",
  lastName: "Doe",
  age: 30,
});

person.on("firstNameChanged", (newName) => {
  // newName 的类型是 string
  console.log(`New name: ${newName}`);
});

// person.on("ageChanged", (newAge: string) => {}); // 错误：参数类型应该是 number
```

### 5.3 内置字符串操作类型

```typescript
// Uppercase - 转大写
type UppercaseGreeting = Uppercase<"hello">; // "HELLO"

// Lowercase - 转小写
type LowercaseGreeting = Lowercase<"HELLO">; // "hello"

// Capitalize - 首字母大写
type CapitalizedGreeting = Capitalize<"hello">; // "Hello"

// Uncapitalize - 首字母小写
type UncapitalizedGreeting = Uncapitalize<"Hello">; // "hello"

// 实际应用
type HTTPMethod = "get" | "post" | "put" | "delete";
type HTTPMethodUppercase = Uppercase<HTTPMethod>;
// "GET" | "POST" | "PUT" | "DELETE"

// 创建 getter/setter
type Getter<T> = `get${Capitalize<T>}`;
type Setter<T> = `set${Capitalize<T>}`;

type GetterForName = Getter<"name">; // "getName"
type SetterForAge = Setter<"age">; // "setAge"
```

### 5.4 复杂模板类型

```typescript
// CSS 属性类型
type CSSProperty =
  | "width"
  | "height"
  | "margin"
  | "padding"
  | "border"
  | "background";
type CSSValue = string | number;
type CSSPropertyWithValue = `${CSSProperty}: ${CSSValue}`;

// REST API 路径类型
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type Entity = "user" | "post" | "comment";
type APIRoute = `/${Entity}` | `/${Entity}/:id`;
type APIEndpoint = `${HTTPMethod} ${APIRoute}`;

type UserEndpoints = APIEndpoint & { includes: "user" };
// 可能的值：
// "GET /user" | "POST /user" | "PUT /user" | "DELETE /user"
// "GET /user/:id" | "POST /user/:id" | ...
```

## 6. 高级泛型模式

### 6.1 泛型工厂模式

```typescript
// 工厂函数
interface Factory<T> {
  create(...args: any[]): T;
}

class UserFactory implements Factory<User> {
  create(name: string, email: string): User {
    return { id: Date.now(), name, email, role: "viewer", status: "active", createdAt: new Date() };
  }
}

// 抽象工厂
interface AbstractFactory<T, U> {
  createProduct(): T;
  createService(): U;
}
```

### 6.2 Builder 模式

```typescript
class QueryBuilder<T> {
  private conditions: string[] = [];

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  and(condition: string): this {
    this.conditions.push(`AND ${condition}`);
    return this;
  }

  or(condition: string): this {
    this.conditions.push(`OR ${condition}`);
    return this;
  }

  build(): string {
    return this.conditions.join(" ");
  }
}

// 使用
const query = new QueryBuilder()
  .where("age > 18")
  .and("city = 'Beijing'")
  .or("city = 'Shanghai'")
  .build();
```

### 6.3 状态机类型

```typescript
// 使用泛型构建类型安全的状态机
type State = "idle" | "loading" | "success" | "error";

type StateValue<S extends State> = S extends "success"
  ? { data: any }
  : S extends "error"
  ? { error: Error }
  : {};

type MachineState<S extends State = State> = {
  state: S;
} & StateValue<S>;

// 使用
const idleState: MachineState<"idle"> = { state: "idle" };
const successState: MachineState<"success"> = {
  state: "success",
  data: { message: "Success" },
};
const errorState: MachineState<"error"> = {
  state: "error",
  error: new Error("Failed"),
};
```

### 6.4 类型安全的事件系统

```typescript
// 事件映射
interface EventMap {
  click: { x: number; y: number };
  keypress: { key: string; code: number };
  submit: { formData: FormData };
}

// 类型安全的事件发射器
class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: Array<(data: T[K]) => void>;
  } = {};

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }
}

// 使用
const emitter = new TypedEventEmitter<EventMap>();

emitter.on("click", (data) => {
  // data 的类型是 { x: number; y: number }
  console.log(`Clicked at ${data.x}, ${data.y}`);
});

emitter.emit("click", { x: 10, y: 20 }); // ✓
// emitter.emit("click", { x: 10 }); // ✗ 错误：缺少 y 属性
```

## 7. 实践案例

### 案例 1：类型安全的数据获取

```typescript
// API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 通用 fetcher
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return response.json();
}

// 使用
interface User {
  id: number;
  name: string;
  email: string;
}

async function getUser(id: number) {
  const response = await fetchData<User>(`/api/users/${id}`);
  // response.data 的类型是 User
  return response.data;
}
```

### 案例 2：类型安全的表单

```typescript
// 表单值类型
interface FormValues {
  username: string;
  email: string;
  age: number;
  subscribe: boolean;
}

// 表单错误类型
type FormErrors<T> = {
  [K in keyof T]?: string;
};

// 表单验证器
type Validator<T> = (value: T) => string | undefined;

type FormValidators<T> = {
  [K in keyof T]?: Validator<T[K]>;
};

// 使用
const validators: FormValidators<FormValues> = {
  username: (value) => (value.length < 3 ? "用户名至少3个字符" : undefined),
  email: (value) => (!value.includes("@") ? "邮箱格式不正确" : undefined),
  age: (value) => (value < 18 ? "年龄必须大于18岁" : undefined),
};

function validateForm(
  values: FormValues,
  validators: FormValidators<FormValues>
): FormErrors<FormValues> {
  const errors: FormErrors<FormValues> = {};

  for (const key in validators) {
    const validator = validators[key as keyof FormValues];
    if (validator) {
      const error = validator(values[key as keyof FormValues] as any);
      if (error) {
        errors[key as keyof FormValues] = error;
      }
    }
  }

  return errors;
}
```

### 案例 3：类型安全的 Redux

```typescript
// Action 类型
interface Action<T = any> {
  type: T;
}

interface PayloadAction<T = any, P = any> extends Action<T> {
  payload: P;
}

// 创建 Action 的工厂函数
function createAction<T extends string>(type: T): () => Action<T>;
function createAction<T extends string, P>(
  type: T
): (payload: P) => PayloadAction<T, P>;
function createAction<T extends string, P>(type: T) {
  return (payload?: P) => ({ type, payload });
}

// 使用
const increment = createAction("INCREMENT");
const addTodo = createAction<"ADD_TODO", { text: string }>("ADD_TODO");

// Reducer 类型
type Reducer<S, A extends Action> = (state: S, action: A) => S;

// 类型安全的 Reducer
interface State {
  count: number;
  todos: string[];
}

type AppAction =
  | ReturnType<typeof increment>
  | ReturnType<typeof addTodo>;

const reducer: Reducer<State, AppAction> = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "ADD_TODO":
      return { ...state, todos: [...state.todos, action.payload.text] };
    default:
      return state;
  }
};
```

## 8. 小结

本章深入学习了 TypeScript 的高级类型特性：

1. **泛型基础**：函数泛型、接口泛型、类泛型
2. **泛型约束**：extends 约束、多重约束、条件约束
3. **条件类型**：分布式条件类型、infer 推断
4. **映射类型**：属性映射、修饰符、键重映射
5. **模板字面量类型**：字符串类型组合、内置字符串操作
6. **高级模式**：工厂模式、Builder 模式、类型安全的事件系统

下一章我们将学习类型体操与工具类型，进一步提升类型编程能力。
