# NestJS-01 项目与模块

> 基础篇第 1 章：从零搭建 Nest 项目，理解模块化架构。

返回 [[NestJS学习路线]] | 下一章 [[NestJS-02-控制器与路由]]

---

## 一、环境与 CLI

### 1.1 前置要求

- Node.js >= 18
- npm / yarn / pnpm
- 建议已掌握 TypeScript 与 Node 基础

### 1.2 创建项目

```bash
# 全局安装 CLI（可选，也可用 npx）
npm i -g @nestjs/cli

# 创建新项目
nest new my-app

# 选择包管理器后，进入目录启动
cd my-app && npm run start:dev
```

默认会生成 `src/`、`main.ts`、`app.module.ts`、`app.controller.ts`、`app.service.ts`。

### 1.3 常用 CLI 命令

| 命令 | 说明 |
|------|------|
| `nest new <name>` | 新建项目 |
| `nest g module <name>` | 生成模块（如 `nest g mo users`） |
| `nest g controller <name>` | 生成控制器 |
| `nest g service <name>` | 生成服务 |
| `nest g resource <name>` | 一次性生成模块+控制器+服务+DTO（CRUD 骨架） |

---

## 二、项目结构

### 2.1 默认目录

```
src/
├── app.module.ts      # 根模块
├── app.controller.ts
├── app.service.ts
└── main.ts            # 入口，bootstrap
```

### 2.2 按功能拆分示例

```
src/
├── main.ts
├── app.module.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── posts/
│   ├── posts.module.ts
│   ├── posts.controller.ts
│   └── posts.service.ts
└── common/            # 公共模块、过滤器、守卫等
```

### 2.3 main.ts 入口

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

可在此配置全局前缀、CORS、管道等。

---

## 三、模块 (Module)

### 3.1 @Module() 装饰器

模块是组织应用的基本单元，用 `@Module()` 声明：

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],      // 本模块依赖的其他模块
  controllers: [],  // 本模块内的控制器
  providers: [],    // 本模块内的提供者（如 Service）
  exports: [],      // 对外暴露的 providers，供其他模块使用
})
export class AppModule {}
```

### 3.2 根模块与功能模块

- **根模块** `AppModule`：在 `main.ts` 中 `NestFactory.create(AppModule)` 使用，一般只做 `imports` 聚合。
- **功能模块**：如 `UsersModule`、`PostsModule`，在根模块中 `imports: [UsersModule, PostsModule]`。

### 3.3 模块导出与依赖

若 A 模块要使用 B 模块里的 Service，则：

1. B 模块在 `providers` 中声明该 Service，并在 `exports` 中导出；
2. A 模块在 `imports` 中导入 B 模块；
3. A 的 Controller/Service 中通过构造函数注入 B 的 Service。

```typescript
// users.module.ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // 导出后，其他模块可注入 UsersService
})
export class UsersModule {}

// app.module.ts
@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

### 3.4 全局模块（选学）

在模块上增加 `@Global()`，该模块会被视为全局，其他模块无需在 `imports` 中显式导入即可注入其 `exports` 的 Provider。慎用，通常仅用于 Config、数据库连接等。

---

## 四、热重载与脚本

- `npm run start`：普通启动
- `npm run start:dev`：开发模式，文件变更自动重启
- `npm run start:debug`：调试模式
- `npm run build`：编译到 `dist/`

---

## 小结

- 使用 `nest new` 与 `nest g module/controller/service` 搭建结构。
- 模块通过 `imports`、`controllers`、`providers`、`exports` 组织依赖与边界。
- 按业务域拆分功能模块，在根模块中聚合。

---

#NestJS #基础 #模块
