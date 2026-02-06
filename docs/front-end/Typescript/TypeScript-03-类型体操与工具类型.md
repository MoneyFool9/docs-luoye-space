# TypeScript-03-类型体操与工具类型

> 类型体操是 TypeScript 高级用法的精髓，掌握它能让你写出更加灵活和类型安全的代码。

## 1. 内置工具类型详解

### 1.1 属性修饰工具类型

```typescript
// Partial<T> - 将所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string }

// 实际应用：更新操作
function updateUser(id: number, updates: Partial<User>) {
  // updates 可以只包含部分字段
}
updateUser(1, { name: "Alice" }); // ✓


// Required<T> - 将所有属性变为必选
type Required<T> = {
  [P in keyof T]-?: T[P];
};

interface Config {
  host?: string;
  port?: number;
}

type RequiredConfig = Required<Config>;
// { host: string; port: number }


// Readonly<T> - 将所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string; readonly email: string }


// Mutable<T> - 移除 readonly（自定义）
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
```

### 1.2 属性选择工具类型

```typescript
// Pick<T, K> - 从 T 中选择部分属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

type PublicUser = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string }


// Omit<T, K> - 从 T 中排除部分属性
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type UserWithoutPassword = Omit<User, "password">;
// { id: number; name: string; email: string; createdAt: Date }


// Record<K, T> - 创建键类型为 K，值类型为 T 的对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type UserRoles = Record<string, string[]>;
// { [key: string]: string[] }

type HttpStatus = Record<number, string>;
// { [key: number]: string }

// 实际应用
const errorMessages: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  500: "Internal Server Error",
};
```

### 1.3 联合类型工具

```typescript
// Exclude<T, U> - 从 T 中排除可分配给 U 的类型
type Exclude<T, U> = T extends U ? never : T;

type T0 = Exclude<"a" | "b" | "c", "a">;
// "b" | "c"

type T1 = Exclude<string | number | boolean, boolean>;
// string | number


// Extract<T, U> - 从 T 中提取可分配给 U 的类型
type Extract<T, U> = T extends U ? T : never;

type T2 = Extract<"a" | "b" | "c", "a" | "f">;
// "a"

type T3 = Extract<string | number | (() => void), Function>;
// () => void


// NonNullable<T> - 从 T 中排除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T;

type T4 = NonNullable<string | null | undefined>;
// string
```

### 1.4 函数工具类型

```typescript
// ReturnType<T> - 获取函数返回类型
type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

function getUser() {
  return { id: 1, name: "Alice" };
}

type UserType = ReturnType<typeof getUser>;
// { id: number; name: string }


// Parameters<T> - 获取函数参数类型（元组）
type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

function createUser(name: string, age: number, email: string) {
  return { name, age, email };
}

type CreateUserParams = Parameters<typeof createUser>;
// [string, number, string]


// ConstructorParameters<T> - 获取构造函数参数类型
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;

class Person {
  constructor(public name: string, public age: number) {}
}

type PersonConstructorParams = ConstructorParameters<typeof Person>;
// [string, number]


// InstanceType<T> - 获取构造函数实例类型
type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;

type PersonInstance = InstanceType<typeof Person>;
// Person


// ThisParameterType<T> - 提取函数的 this 参数类型
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any
  ? U
  : unknown;


// OmitThisParameter<T> - 移除函数的 this 参数
type OmitThisParameter<T> = unknown extends ThisParameterType<T>
  ? T
  : T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T;
```

### 1.5 Promise 工具类型

```typescript
// Awaited<T> - 递归解包 Promise（TypeScript 4.5+）
type Awaited<T> = T extends null | undefined
  ? T
  : T extends object & { then(onfulfilled: infer F): any }
  ? F extends (value: infer V, ...args: any) => any
    ? Awaited<V>
    : never
  : T;

type T0 = Awaited<Promise<string>>;
// string

type T1 = Awaited<Promise<Promise<number>>>;
// number

type T2 = Awaited<boolean | Promise<string>>;
// boolean | string
```

## 2. 自定义工具类型

### 2.1 深度工具类型

```typescript
// DeepPartial - 深度可选
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

type PartialConfig = DeepPartial<NestedConfig>;
// 所有嵌套属性都变为可选


// DeepReadonly - 深度只读
type DeepReadonly<T> = T extends (infer U)[]
  ? DeepReadonlyArray<U>
  : T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}


// DeepRequired - 深度必选
type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;


// DeepMutable - 深度可变
type DeepMutable<T> = T extends object
  ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
  : T;
```

### 2.2 对象操作工具类型

```typescript
// KeysOfType - 获取指定类型的键
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

type StringKeys = KeysOfType<User, string>;
// "name" | "email"

type NumberKeys = KeysOfType<User, number>;
// "id" | "age"


// PickByType - 选择指定类型的属性
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type UserStrings = PickByType<User, string>;
// { name: string; email: string }


// OmitByType - 排除指定类型的属性
type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

type UserWithoutStrings = OmitByType<User, string>;
// { id: number; age: number; isActive: boolean }


// Merge - 合并两个对象类型
type Merge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? U[K]
    : K extends keyof T
    ? T[K]
    : never;
};

type A = { a: string; b: number };
type B = { b: string; c: boolean };
type Merged = Merge<A, B>;
// { a: string; b: string; c: boolean }


// Diff - 获取 T 有但 U 没有的属性
type Diff<T, U> = Pick<T, Exclude<keyof T, keyof U>>;

type DiffResult = Diff<A, B>;
// { a: string }


// Intersection - 获取 T 和 U 共有的属性
type Intersection<T, U> = Pick<T, Extract<keyof T, keyof U>>;

type CommonProps = Intersection<A, B>;
// { b: number }
```

### 2.3 函数工具类型

```typescript
// PromisifyFunction - 将函数返回值包装为 Promise
type PromisifyFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

function syncAdd(a: number, b: number): number {
  return a + b;
}

type AsyncAdd = PromisifyFunction<typeof syncAdd>;
// (a: number, b: number) => Promise<number>


// Curry - 柯里化函数类型
type Curry<F extends (...args: any[]) => any> = Parameters<F> extends [
  infer First,
  ...infer Rest
]
  ? Rest extends []
    ? F
    : (arg: First) => Curry<(...args: Rest) => ReturnType<F>>
  : F;

type CurriedAdd = Curry<(a: number, b: number, c: number) => number>;
// (arg: number) => (arg: number) => (arg: number) => number


// Promisify - 改变回调风格为 Promise 风格
type CallbackFunction<T> = (error: Error | null, result: T) => void;

type Promisify<T extends (...args: any[]) => void> = T extends (
  ...args: [...infer Args, CallbackFunction<infer R>]
) => void
  ? (...args: Args) => Promise<R>
  : never;
```

### 2.4 字符串工具类型

```typescript
// Split - 字符串分割（TypeScript 4.1+）
type Split<
  S extends string,
  D extends string
> = S extends `${infer Head}${D}${infer Tail}`
  ? [Head, ...Split<Tail, D>]
  : [S];

type Parts = Split<"a-b-c", "-">;
// ["a", "b", "c"]


// Join - 字符串连接
type Join<T extends string[], D extends string> = T extends []
  ? ""
  : T extends [infer F extends string]
  ? F
  : T extends [infer F extends string, ...infer R extends string[]]
  ? `${F}${D}${Join<R, D>}`
  : string;

type Joined = Join<["a", "b", "c"], "-">;
// "a-b-c"


// TrimLeft - 去除左侧空白
type TrimLeft<S extends string> = S extends ` ${infer R}` ? TrimLeft<R> : S;

type TL = TrimLeft<"   hello">;
// "hello"


// TrimRight - 去除右侧空白
type TrimRight<S extends string> = S extends `${infer R} ` ? TrimRight<R> : S;


// Trim - 去除两侧空白
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type Trimmed = Trim<"   hello   ">;
// "hello"


// Replace - 字符串替换
type Replace<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends `${infer Head}${From}${infer Tail}`
  ? `${Head}${To}${Tail}`
  : S;

type Replaced = Replace<"hello world", "world", "TypeScript">;
// "hello TypeScript"


// ReplaceAll - 全部替换
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends `${infer Head}${From}${infer Tail}`
  ? ReplaceAll<`${Head}${To}${Tail}`, From, To>
  : S;

type ReplacedAll = ReplaceAll<"a-b-c-d", "-", "_">;
// "a_b_c_d"


// CamelCase - 转换为驼峰命名
type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Lowercase<Head>}${Capitalize<CamelCase<Tail>>}`
  : Lowercase<S>;

type Camel = CamelCase<"hello_world_foo">;
// "helloWorldFoo"


// KebabCase - 转换为短横线命名
type KebabCase<S extends string> = S extends `${infer C}${infer T}`
  ? T extends Uncapitalize<T>
    ? `${Lowercase<C>}${KebabCase<T>}`
    : `${Lowercase<C>}-${KebabCase<T>}`
  : S;

type Kebab = KebabCase<"helloWorldFoo">;
// "hello-world-foo"
```

## 3. 类型递归与循环

### 3.1 递归类型基础

```typescript
// 数组长度类型
type Length<T extends readonly any[]> = T["length"];

type L = Length<[1, 2, 3]>;
// 3


// 数组第一个元素
type First<T extends readonly any[]> = T extends readonly [infer F, ...any[]]
  ? F
  : never;

type F = First<[1, 2, 3]>;
// 1


// 数组最后一个元素
type Last<T extends readonly any[]> = T extends readonly [...any[], infer L]
  ? L
  : never;

type L2 = Last<[1, 2, 3]>;
// 3


// 数组除第一个外的元素
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer R]
  ? R
  : [];

type T = Tail<[1, 2, 3]>;
// [2, 3]


// 数组除最后一个外的元素
type Init<T extends readonly any[]> = T extends readonly [...infer I, any]
  ? I
  : [];

type I = Init<[1, 2, 3]>;
// [1, 2]
```

### 3.2 递归数组操作

```typescript
// Reverse - 数组反转
type Reverse<T extends any[]> = T extends [infer F, ...infer R]
  ? [...Reverse<R>, F]
  : [];

type Reversed = Reverse<[1, 2, 3, 4]>;
// [4, 3, 2, 1]


// Flatten - 数组扁平化
type Flatten<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends any[]
    ? [...Flatten<F>, ...Flatten<R>]
    : [F, ...Flatten<R>]
  : [];

type Flattened = Flatten<[1, [2, [3, 4]], 5]>;
// [1, 2, 3, 4, 5]


// Unique - 数组去重
type Includes<T extends any[], U> = T extends [infer F, ...infer R]
  ? Equal<F, U> extends true
    ? true
    : Includes<R, U>
  : false;

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;

type Unique<T extends any[], R extends any[] = []> = T extends [
  infer F,
  ...infer Rest
]
  ? Includes<R, F> extends true
    ? Unique<Rest, R>
    : Unique<Rest, [...R, F]>
  : R;

type Uniqued = Unique<[1, 2, 2, 3, 3, 3]>;
// [1, 2, 3]


// Concat - 数组连接
type Concat<T extends any[], U extends any[]> = [...T, ...U];

type Concatenated = Concat<[1, 2], [3, 4]>;
// [1, 2, 3, 4]


// Push - 数组添加元素
type Push<T extends any[], U> = [...T, U];

type Pushed = Push<[1, 2], 3>;
// [1, 2, 3]


// Unshift - 数组头部添加
type Unshift<T extends any[], U> = [U, ...T];

type Unshifted = Unshift<[1, 2], 0>;
// [0, 1, 2]
```

### 3.3 数字运算类型

```typescript
// 构建指定长度的元组
type BuildTuple<
  N extends number,
  R extends any[] = []
> = R["length"] extends N ? R : BuildTuple<N, [...R, unknown]>;

type Tuple5 = BuildTuple<5>;
// [unknown, unknown, unknown, unknown, unknown]


// Add - 加法
type Add<A extends number, B extends number> = [
  ...BuildTuple<A>,
  ...BuildTuple<B>
]["length"];

type Sum = Add<3, 4>;
// 7 (实际类型为 number，但值是 7)


// Subtract - 减法
type Subtract<A extends number, B extends number> = BuildTuple<A> extends [
  ...BuildTuple<B>,
  ...infer R
]
  ? R["length"]
  : never;

type Diff = Subtract<10, 3>;
// 7


// LessThan - 小于比较
type LessThan<
  A extends number,
  B extends number,
  Arr extends any[] = []
> = Arr["length"] extends B
  ? false
  : Arr["length"] extends A
  ? true
  : LessThan<A, B, [...Arr, unknown]>;

type IsLess = LessThan<3, 5>;
// true


// Range - 生成数字范围
type Range<
  Start extends number,
  End extends number,
  R extends number[] = []
> = Start extends End ? R : Range<Add<Start, 1> & number, End, [...R, Start]>;

type NumberRange = Range<0, 5>;
// [0, 1, 2, 3, 4]
```

## 4. 实战类型体操

### 4.1 实现 Chainable 链式调用

```typescript
type Chainable<T = {}> = {
  option<K extends string, V>(
    key: K extends keyof T ? never : K,
    value: V
  ): Chainable<T & { [P in K]: V }>;
  get(): T;
};

declare const config: Chainable;

const result = config
  .option("foo", 123)
  .option("bar", { value: "Hello" })
  .option("name", "TypeScript")
  .get();

// result 的类型：
// {
//   foo: number;
//   bar: { value: string };
//   name: string;
// }
```

### 4.2 实现 Vue 的 computed 类型推断

```typescript
type GetComputed<C> = C extends Record<string, (...args: any[]) => any>
  ? { [K in keyof C]: ReturnType<C[K]> }
  : never;

interface Options<D, C, M> {
  data?: () => D;
  computed?: C & ThisType<D & GetComputed<C> & M>;
  methods?: M & ThisType<D & GetComputed<C> & M>;
}

declare function defineComponent<D, C, M>(
  options: Options<D, C, M>
): ThisType<D & GetComputed<C> & M>;

// 使用示例
defineComponent({
  data() {
    return {
      count: 0,
      message: "Hello",
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2; // this.count 类型为 number
    },
  },
  methods: {
    increment() {
      this.count++;
      console.log(this.doubleCount); // 类型为 number
    },
  },
});
```

### 4.3 实现 ParseQueryString

```typescript
// 解析 URL 查询字符串为对象类型
type ParseQueryString<S extends string> = S extends ""
  ? {}
  : S extends `${infer Param}&${infer Rest}`
  ? MergeParams<ParseParam<Param>, ParseQueryString<Rest>>
  : ParseParam<S>;

type ParseParam<S extends string> = S extends `${infer Key}=${infer Value}`
  ? { [K in Key]: Value }
  : {};

type MergeParams<T, U> = {
  [K in keyof T | keyof U]: K extends keyof T
    ? K extends keyof U
      ? T[K] | U[K]
      : T[K]
    : K extends keyof U
    ? U[K]
    : never;
};

type Query = ParseQueryString<"name=Alice&age=25&city=Beijing">;
// { name: "Alice"; age: "25"; city: "Beijing" }
```

### 4.4 实现 JSON 类型

```typescript
// JSON 值类型
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// JSON 对象类型
type JSONObject = { [key: string]: JSONValue };

// JSON 数组类型
type JSONArray = JSONValue[];

// 类型安全的 JSON 解析
function parseJSON<T extends JSONValue>(json: string): T {
  return JSON.parse(json) as T;
}

// 类型安全的 JSON 序列化
function stringifyJSON<T extends JSONValue>(value: T): string {
  return JSON.stringify(value);
}
```

### 4.5 实现 PathOf 获取对象路径

```typescript
// 获取对象的所有路径
type PathOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? PathOf<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

interface DeepObject {
  user: {
    name: string;
    profile: {
      avatar: string;
      bio: string;
    };
  };
  settings: {
    theme: string;
  };
}

type Paths = PathOf<DeepObject>;
// "user" | "user.name" | "user.profile" | "user.profile.avatar" | "user.profile.bio" | "settings" | "settings.theme"


// 根据路径获取类型
type GetByPath<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? GetByPath<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

type AvatarType = GetByPath<DeepObject, "user.profile.avatar">;
// string

type ProfileType = GetByPath<DeepObject, "user.profile">;
// { avatar: string; bio: string }
```

## 5. 类型体操挑战

### 挑战 1：实现 TupleToUnion

```typescript
// 将元组转换为联合类型
type TupleToUnion<T extends any[]> = T[number];

type Union = TupleToUnion<[1, "a", true]>;
// 1 | "a" | true
```

### 挑战 2：实现 UnionToTuple

```typescript
// 将联合类型转换为元组（较复杂）
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type LastOfUnion<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;

type UnionToTuple<T, L = LastOfUnion<T>> = [T] extends [never]
  ? []
  : [...UnionToTuple<Exclude<T, L>>, L];

type Tuple = UnionToTuple<"a" | "b" | "c">;
// ["a", "b", "c"] (顺序可能不同)
```

### 挑战 3：实现 StringToUnion

```typescript
// 将字符串转换为字符联合类型
type StringToUnion<S extends string> = S extends `${infer C}${infer Rest}`
  ? C | StringToUnion<Rest>
  : never;

type CharUnion = StringToUnion<"hello">;
// "h" | "e" | "l" | "o"
```

### 挑战 4：实现 PermString

```typescript
// 字符串排列组合
type PermString<S extends string, U extends string = StringToUnion<S>> = [
  U
] extends [never]
  ? ""
  : U extends U
  ? `${U}${PermString<never, Exclude<StringToUnion<S>, U>>}`
  : never;

// 简化版本
type Permutation<T, U = T> = [T] extends [never]
  ? []
  : T extends T
  ? [T, ...Permutation<Exclude<U, T>>]
  : never;

type Perms = Permutation<"A" | "B" | "C">;
// ["A", "B", "C"] | ["A", "C", "B"] | ["B", "A", "C"] | ...
```

### 挑战 5：实现 IsAny

```typescript
// 判断类型是否为 any
type IsAny<T> = 0 extends 1 & T ? true : false;

type T1 = IsAny<any>; // true
type T2 = IsAny<unknown>; // false
type T3 = IsAny<never>; // false
type T4 = IsAny<string>; // false
```

### 挑战 6：实现 IsNever

```typescript
// 判断类型是否为 never
type IsNever<T> = [T] extends [never] ? true : false;

type T1 = IsNever<never>; // true
type T2 = IsNever<undefined>; // false
type T3 = IsNever<null>; // false
```

### 挑战 7：实现 IsUnion

```typescript
// 判断类型是否为联合类型
type IsUnion<T, U = T> = T extends U
  ? [U] extends [T]
    ? false
    : true
  : never;

type T1 = IsUnion<string | number>; // true
type T2 = IsUnion<string>; // false
type T3 = IsUnion<never>; // false
```

## 6. 小结

本章深入学习了 TypeScript 的类型体操技巧：

1. **内置工具类型**：Partial、Required、Pick、Omit、Record、Exclude、Extract 等
2. **自定义工具类型**：深度类型、对象操作、函数操作、字符串操作
3. **类型递归**：数组操作、数字运算
4. **实战案例**：链式调用、Vue computed、路径类型等
5. **类型挑战**：TupleToUnion、UnionToTuple、IsAny、IsNever 等

类型体操的核心是理解：
- 条件类型的分布式特性
- infer 推断的使用时机
- 递归类型的终止条件
- 模板字面量类型的字符串操作

下一章我们将学习 TypeScript 的工程化配置与最佳实践。
