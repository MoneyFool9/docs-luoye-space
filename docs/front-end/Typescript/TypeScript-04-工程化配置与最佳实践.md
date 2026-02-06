# TypeScript-04-工程化配置与最佳实践

> 掌握 TypeScript 的工程化配置和最佳实践，让你在实际项目中更高效地使用 TypeScript。

## 1. tsconfig.json 配置详解

### 1.1 基础配置结构

```json
{
  "compilerOptions": {
    // 编译器选项
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"],
  "extends": "./tsconfig.base.json",
  "references": []
}
```

### 1.2 常用编译器选项

#### 目标与模块

```json
{
  "compilerOptions": {
    // 编译目标 ES 版本
    "target": "ES2022",

    // 模块系统
    "module": "ESNext",

    // 模块解析策略
    "moduleResolution": "bundler", // Node16, NodeNext, bundler

    // 允许导入 JSON 模块
    "resolveJsonModule": true,

    // 允许从 CommonJS 模块默认导入
    "esModuleInterop": true,

    // 允许合成默认导入
    "allowSyntheticDefaultImports": true
  }
}
```

#### 严格模式

```json
{
  "compilerOptions": {
    // 启用所有严格类型检查选项
    "strict": true,

    // 以下是 strict: true 包含的选项，可单独配置

    // 启用严格的 null 检查
    "strictNullChecks": true,

    // 函数参数双向协变检查
    "strictFunctionTypes": true,

    // 严格的属性初始化检查
    "strictPropertyInitialization": true,

    // 禁止隐式 any
    "noImplicitAny": true,

    // 禁止隐式 this
    "noImplicitThis": true,

    // 严格的 bind/call/apply 检查
    "strictBindCallApply": true,

    // 使用未知类型的 catch 变量
    "useUnknownInCatchVariables": true,

    // 精确的可选属性类型
    "exactOptionalPropertyTypes": true
  }
}
```

#### 代码质量检查

```json
{
  "compilerOptions": {
    // 检测未使用的局部变量
    "noUnusedLocals": true,

    // 检测未使用的函数参数
    "noUnusedParameters": true,

    // 检测函数所有代码路径是否有返回值
    "noImplicitReturns": true,

    // 检测 switch 语句的 case 穿透
    "noFallthroughCasesInSwitch": true,

    // 检测无法到达的代码
    "allowUnreachableCode": false,

    // 强制使用索引访问器
    "noPropertyAccessFromIndexSignature": true,

    // 强制使用 override 关键字
    "noImplicitOverride": true
  }
}
```

#### 输出配置

```json
{
  "compilerOptions": {
    // 输出目录
    "outDir": "./dist",

    // 根目录
    "rootDir": "./src",

    // 生成声明文件
    "declaration": true,

    // 声明文件输出目录
    "declarationDir": "./types",

    // 生成 source map
    "sourceMap": true,

    // 内联 source map
    "inlineSourceMap": false,

    // 移除注释
    "removeComments": true,

    // 不生成输出文件（仅类型检查）
    "noEmit": false,

    // 导入辅助函数
    "importHelpers": true
  }
}
```

#### 路径映射

```json
{
  "compilerOptions": {
    // 基础路径
    "baseUrl": ".",

    // 路径别名
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

### 1.3 推荐配置模板

#### React 项目配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### Node.js 项目配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 库开发配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",

    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,

    "stripInternal": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## 2. 项目结构与模块化

### 2.1 推荐项目结构

```
project/
├── src/
│   ├── components/       # UI 组件
│   │   ├── Button/
│   │   │   ├── index.ts
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── Button.test.tsx
│   │   └── index.ts      # barrel 导出
│   ├── hooks/            # 自定义 Hooks
│   ├── services/         # API 服务
│   ├── utils/            # 工具函数
│   ├── types/            # 全局类型定义
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   ├── constants/        # 常量
│   └── App.tsx
├── tests/                # 测试文件
├── types/                # 外部类型声明
│   └── global.d.ts
├── tsconfig.json
├── tsconfig.node.json
└── package.json
```

### 2.2 类型文件组织

```typescript
// src/types/index.ts - 统一导出
export * from "./api.types";
export * from "./common.types";
export * from "./user.types";

// src/types/common.types.ts - 通用类型
export type ID = string | number;

export type Nullable<T> = T | null;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// src/types/user.types.ts - 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "editor" | "viewer";
export type UserStatus = "active" | "inactive" | "banned";

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  avatar?: string;
}
```

### 2.3 模块导入导出最佳实践

```typescript
// ✅ 好的做法：使用 barrel 导出
// src/components/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Modal } from "./Modal";
export type { ButtonProps } from "./Button";
export type { InputProps } from "./Input";

// 使用
import { Button, Input, Modal } from "@/components";

// ✅ 好的做法：类型单独导出
// src/components/Button/Button.types.ts
export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// src/components/Button/Button.tsx
import type { ButtonProps } from "./Button.types";

export function Button({ variant = "primary", ...props }: ButtonProps) {
  // ...
}

// ✅ 好的做法：使用 type-only 导入
import type { User, UserRole } from "@/types";
import { validateEmail } from "@/utils";
```

## 3. 与构建工具集成

### 3.1 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 类型检查由 tsc 处理，Vite 只负责构建
    // 可以使用 vite-plugin-checker 实现构建时类型检查
  },
});
```

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch"
  }
}
```

### 3.2 ESLint 配置

```javascript
// eslint.config.js (ESLint 9+ flat config)
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      // TypeScript 特定规则
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",

      // 关闭 JS 规则，使用 TS 版本
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];
```

### 3.3 Prettier 配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## 4. 代码规范与最佳实践

### 4.1 命名规范

```typescript
// ✅ 接口名不加 I 前缀
interface User {}
interface ButtonProps {}

// ✅ 类型别名使用 PascalCase
type UserRole = "admin" | "user";
type ApiResponse<T> = { data: T; error?: string };

// ✅ 泛型参数使用有意义的名称
function transform<TInput, TOutput>(
  input: TInput,
  fn: (item: TInput) => TOutput
): TOutput {
  return fn(input);
}

// ✅ 常量使用 UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = "https://api.example.com";

// ✅ 枚举成员使用 PascalCase
enum HttpStatus {
  Ok = 200,
  NotFound = 404,
  InternalError = 500,
}

// ✅ 文件命名
// 组件：PascalCase (Button.tsx, UserProfile.tsx)
// 工具函数：camelCase (formatDate.ts, validateEmail.ts)
// 类型文件：camelCase 或带 .types 后缀 (user.types.ts)
// 常量：camelCase (constants.ts, config.ts)
```

### 4.2 类型定义最佳实践

```typescript
// ✅ 优先使用 interface 定义对象类型
interface User {
  id: number;
  name: string;
}

// ✅ 使用 type 定义联合类型、交叉类型、工具类型
type Status = "pending" | "success" | "error";
type UserWithPosts = User & { posts: Post[] };

// ✅ 使用 const 断言定义常量对象
const COLORS = {
  primary: "#007bff",
  secondary: "#6c757d",
  success: "#28a745",
} as const;

type ColorKey = keyof typeof COLORS;
type ColorValue = (typeof COLORS)[ColorKey];

// ✅ 避免使用 any，使用 unknown 或具体类型
function processData(data: unknown): void {
  if (typeof data === "string") {
    console.log(data.toUpperCase());
  }
}

// ✅ 使用 readonly 防止意外修改
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// ✅ 使用 as const 创建字面量类型
const routes = ["home", "about", "contact"] as const;
type Route = (typeof routes)[number]; // "home" | "about" | "contact"
```

### 4.3 函数类型最佳实践

```typescript
// ✅ 使用类型推断，避免重复声明
const add = (a: number, b: number) => a + b; // 返回类型自动推断

// ✅ 复杂函数声明返回类型
interface User {
  id: number;
  name: string;
}

async function fetchUser(id: number): Promise<User | null> {
  // 复杂函数声明返回类型有助于类型检查和文档化
  try {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  } catch {
    return null;
  }
}

// ✅ 使用函数重载处理多种情况
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "span"): HTMLSpanElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

// ✅ 使用泛型创建可复用函数
function identity<T>(value: T): T {
  return value;
}

// ✅ 使用 Readonly 参数防止修改
function processItems(items: readonly string[]): void {
  // items.push("new"); // 错误：不能修改
  items.forEach((item) => console.log(item));
}
```

### 4.4 React + TypeScript 最佳实践

```typescript
// ✅ 组件 Props 类型定义
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ✅ 使用 FC 类型或直接声明
// 方式 1：直接声明（推荐）
function Button({ variant = "primary", children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}

// 方式 2：使用 FC（不再推荐，因为隐式包含 children）
// const Button: React.FC<ButtonProps> = (props) => { ... }

// ✅ 事件处理器类型
function Form() {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // ...
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    console.log(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}

// ✅ Ref 类型
function InputWithRef() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focus = () => {
    inputRef.current?.focus();
  };

  return <input ref={inputRef} />;
}

// ✅ forwardRef 类型
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  )
);

// ✅ 泛型组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}

// 使用
<List items={users} renderItem={(user) => <li key={user.id}>{user.name}</li>} />;
```

### 4.5 异步代码最佳实践

```typescript
// ✅ 定义 API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// ✅ 封装类型安全的 fetch
async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ✅ 类型安全的错误处理
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithErrorHandling<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new ApiError(response.status, `Request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      // 处理 API 错误
      console.error(`API Error ${error.statusCode}: ${error.message}`);
    } else if (error instanceof Error) {
      // 处理其他错误
      console.error(`Error: ${error.message}`);
    }
    throw error;
  }
}
```

## 5. 常见问题与解决方案

### 5.1 类型报错处理

```typescript
// 问题 1：对象字面量可能有多余属性
interface User {
  name: string;
}

// ❌ 错误
// const user: User = { name: "Alice", age: 25 };

// ✅ 解决方案 1：使用类型断言
const user = { name: "Alice", age: 25 } as User;

// ✅ 解决方案 2：使用索引签名
interface UserWithExtra {
  name: string;
  [key: string]: unknown;
}

// 问题 2：类型 'xxx' 上不存在属性 'yyy'
// ❌
// const obj: object = { name: "Alice" };
// console.log(obj.name);

// ✅ 使用具体类型或 Record
const obj: Record<string, unknown> = { name: "Alice" };
console.log(obj.name);

// 问题 3：不能将类型 'xxx' 分配给类型 'yyy'
function processValue(value: string | number) {
  // ❌ 错误：不能直接使用 string 方法
  // value.toUpperCase();

  // ✅ 使用类型守卫
  if (typeof value === "string") {
    value.toUpperCase();
  }
}
```

### 5.2 第三方库类型处理

```typescript
// 方案 1：安装 @types 包
// npm install @types/lodash

// 方案 2：创建声明文件
// types/untyped-lib.d.ts
declare module "untyped-lib" {
  export function someFunction(arg: string): number;
  export interface SomeInterface {
    prop: string;
  }
}

// 方案 3：扩展现有类型
// types/express.d.ts
import "express";

declare module "express" {
  interface Request {
    user?: {
      id: number;
      role: string;
    };
  }
}

// 方案 4：全局类型扩展
// types/global.d.ts
declare global {
  interface Window {
    __APP_CONFIG__: {
      apiUrl: string;
      version: string;
    };
  }
}

export {};
```

### 5.3 类型兼容性问题

```typescript
// 问题：函数参数的协变与逆变
type Handler<T> = (arg: T) => void;

interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// 函数参数是逆变的
const animalHandler: Handler<Animal> = (animal) => console.log(animal.name);
const dogHandler: Handler<Dog> = (dog) => console.log(dog.breed);

// ❌ 不安全的赋值
// const handler: Handler<Dog> = animalHandler;

// ✅ 安全的赋值
const handler: Handler<Animal> = dogHandler;

// 解决方案：使用双向协变
// 在 tsconfig 中设置 strictFunctionTypes: false（不推荐）
// 或者使用类型断言
```

### 5.4 性能优化建议

```typescript
// 1. 使用 Project References 加速大型项目编译
// tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" }
  ]
}

// 2. 使用 incremental 编译
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}

// 3. 跳过库文件检查
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}

// 4. 合理使用 include/exclude
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}

// 5. 使用 isolatedModules 确保与 Babel/esbuild 兼容
{
  "compilerOptions": {
    "isolatedModules": true
  }
}
```

## 6. 类型声明文件编写

### 6.1 创建 .d.ts 文件

```typescript
// types/my-library.d.ts

// 声明模块
declare module "my-library" {
  // 导出类型
  export interface Options {
    timeout?: number;
    retries?: number;
  }

  // 导出函数
  export function init(options?: Options): void;
  export function fetch<T>(url: string): Promise<T>;

  // 导出类
  export class Client {
    constructor(baseUrl: string);
    get<T>(path: string): Promise<T>;
    post<T, U>(path: string, data: U): Promise<T>;
  }

  // 默认导出
  const _default: {
    init: typeof init;
    fetch: typeof fetch;
    Client: typeof Client;
  };
  export default _default;
}
```

### 6.2 全局类型声明

```typescript
// types/global.d.ts

// 扩展全局对象
declare global {
  // 扩展 Window
  interface Window {
    __CONFIG__: AppConfig;
  }

  // 扩展全局变量
  var DEBUG: boolean;

  // 扩展全局函数
  function gtag(...args: any[]): void;
}

interface AppConfig {
  apiUrl: string;
  version: string;
  features: {
    darkMode: boolean;
    analytics: boolean;
  };
}

// 必须导出使其成为模块
export {};
```

### 6.3 环境变量类型

```typescript
// types/env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_ENABLE_ANALYTICS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Node.js 环境变量
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}
```

## 7. 小结

本章介绍了 TypeScript 工程化配置和最佳实践：

1. **tsconfig.json 配置**：编译选项、严格模式、路径映射
2. **项目结构**：推荐的目录组织、类型文件管理
3. **构建工具集成**：Vite、ESLint、Prettier 配置
4. **代码规范**：命名规范、类型定义、函数编写最佳实践
5. **常见问题**：类型报错、第三方库类型、兼容性问题
6. **类型声明文件**：.d.ts 编写、全局类型扩展

遵循这些最佳实践，能够让你的 TypeScript 项目更加健壮、可维护。

## 8. 总结与进阶路线

恭喜你完成了 TypeScript 学习系列！以下是进阶建议：

1. **实践 Type Challenges**：https://github.com/type-challenges/type-challenges
2. **阅读优秀库的类型定义**：React、Vue、Lodash 等
3. **关注 TypeScript 更新**：每个版本都会带来新特性
4. **参与开源项目**：为 DefinitelyTyped 贡献类型定义
5. **深入源码**：了解 TypeScript 编译器的工作原理

祝你 TypeScript 之旅愉快！
