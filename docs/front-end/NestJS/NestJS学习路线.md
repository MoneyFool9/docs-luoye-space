# NestJS 学习路线

> 从基础到专家的 NestJS 学习指南，覆盖模块化架构、依赖注入、请求生命周期与企业级实践。

---

## 学习路线总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NestJS 学习路线                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│   │   基础篇    │───▶│   进阶篇    │───▶│   专家篇    │                 │
│   │  2-3 周     │    │  3-4 周     │    │  持续深入   │                 │
│   └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                          │
│   模块/控制器/服务    管道/守卫/拦截器     微服务/GraphQL                 │
│   依赖注入            数据库/校验/配置    认证授权/测试/部署              │
│   请求生命周期        异常过滤/中间件     性能与架构设计                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 核心知识点总览

| 层级 | 核心概念 | 说明 |
|------|----------|------|
| **基础** | Module / Controller / Provider | 应用骨架与依赖注入 |
| **基础** | 请求生命周期 | Middleware → Guard → Interceptor → Pipe → Handler → Interceptor |
| **进阶** | Pipe / Guard / Interceptor / Exception Filter | 横切关注点与请求处理链 |
| **进阶** | 数据库与校验 | TypeORM / Prisma、class-validator、ConfigModule |
| **专家** | 认证与安全 | JWT、Passport、RBAC、限流与 CORS |
| **专家** | 微服务与 GraphQL | TCP/Redis/MQ、Schema First / Code First |

---

## 基础篇 (Foundation)

> 目标：能使用 NestJS 搭建 REST API，理解模块化与依赖注入

### 1. 环境与项目结构

- Node.js 与 TypeScript 基础
- CLI：`nest new`、`nest generate module/controller/service`
- 目录约定：`src/`、`app.module.ts`、`main.ts`
- 启动与热重载

### 2. 模块 (Module)

- `@Module()`：`imports`、`controllers`、`providers`、`exports`
- 根模块 `AppModule` 与功能模块拆分
- 模块导入导出与模块边界

### 3. 控制器 (Controller)

- `@Controller('path')` 与路由前缀
- HTTP 方法装饰器：`@Get()`、`@Post()`、`@Put()`、`@Patch()`、`@Delete()`
- 路由参数：`@Param()`、`@Query()`、`@Body()`、`@Headers()`
- 状态码：`@HttpCode()`、`@Header()`

### 4. 提供者与依赖注入 (Provider / DI)

- `@Injectable()` 与 Provider 注册
- 构造函数注入：`constructor(private readonly xxxService: XxxService)`
- 作用域：默认单例；可选 `Scope.REQUEST`、`Scope.TRANSIENT`
- 遵循 SOLID，控制器只做路由与调用，业务放在 Service

### 5. 请求生命周期（概念）

- 顺序：**Middleware → Guard → Interceptor（前）→ Pipe → 路由处理 → Interceptor（后）→ 异常过滤器**
- 知道各环节职责即可，进阶再实现

### 基础篇学习检查清单

- [ ] 能用 CLI 创建模块、控制器、服务并注册到模块
- [ ] 理解 Controller 处理请求、Service 承载业务、Module 组织依赖
- [ ] 能写出带 CRUD 的 REST 接口（含 DTO 与简单类型）
- [ ] 理解依赖注入：谁注入谁、在哪个模块里 provide

---

## 进阶篇 (Advanced)

> 目标：掌握管道/守卫/拦截器/异常过滤，集成数据库与配置，写出可维护的接口层

### 6. 管道 (Pipe)

- 用途：校验、转换（如 string → number）、默认值
- 内置：`ValidationPipe`、`ParseIntPipe`、`ParseUUIDPipe`、`DefaultValuePipe`
- 自定义 Pipe：实现 `PipeTransform<T, R>`，`transform(value, metadata)`
- 全局/控制器/路由级别绑定

### 7. 守卫 (Guard)

- 用途：鉴权与授权（如是否登录、是否有权限）
- 实现 `CanActivate`，返回 `boolean | Promise<boolean>`
- `ExecutionContext`：`switchToHttp()` 取 Request/Response
- 执行顺序：在 Middleware 之后、Interceptor 与 Pipe 之前

### 8. 拦截器 (Interceptor)

- 用途：日志、超时、缓存、统一包装响应格式
- 实现 `NestInterceptor`，使用 `next.handle()` 与 RxJS
- 可修改返回流：`map()`、`tap()`、`catchError()` 等
- 请求前后都可介入（before/after 路由处理）

### 9. 异常过滤器 (Exception Filter)

- 用途：统一捕获异常并返回约定格式的 HTTP 响应
- `@Catch(HttpException)` 或具体异常类
- 使用 `ArgumentsHost` 拿到 Response，`response.status().json(...)`
- 与 `HttpException`、`BadRequestException` 等配合

### 10. 中间件 (Middleware)

- 基于 Express/Fastify，用于日志、CORS、请求体解析等
- 函数式或类（`NestMiddleware`），`next()` 调用
- 在 Module 中通过 `configure(consumer)` 绑定

### 11. 数据校验与 DTO

- `class-validator` + `class-transformer`
- 全局 `ValidationPipe`（`whitelist`、`forbidNonWhitelisted`、`transform`）
- DTO 类与 `@IsString()`、`@IsNumber()`、`@Min()`、`@IsOptional()` 等

### 12. 配置 (Configuration)

- `@nestjs/config`，`ConfigModule.forRoot()` 与 `ConfigService`
- 环境变量与 `.env`，多环境（dev/test/prod）
- 类型安全的配置键与默认值

### 13. 数据库集成

- **TypeORM**：`TypeOrmModule.forRoot()` / `forFeature()`，Entity、Repository 注入
- **Prisma**：`PrismaService` 封装、在 Service 中 CRUD
- 连接池、迁移、生产环境慎用 `synchronize: true`

### 进阶篇学习检查清单

- [ ] 会写自定义 Pipe、Guard、Interceptor、Exception Filter 并绑定到路由/控制器/全局
- [ ] 能说清请求生命周期中各组件执行顺序
- [ ] 使用 ValidationPipe + DTO 做入参校验与转换
- [ ] 用 ConfigModule 管理环境配置
- [ ] 至少掌握 TypeORM 或 Prisma 之一，完成一个模块的 CRUD

---

## 专家篇 (Expert)

> 目标：独立设计认证授权、微服务与 GraphQL，具备测试、部署与架构能力

### 14. 认证与授权

- **认证**：JWT + `@nestjs/jwt`、`@nestjs/passport`，登录签发 token
- **Passport 策略**：Local（用户名密码）、JWT（校验 token）
- **守卫**：`AuthGuard('jwt')` 保护需要登录的接口
- **授权**：RBAC、自定义 Decorator（如 `@Roles()`）+ Guard 校验角色/权限

### 15. 安全实践

- CORS、Helmet、限流（throttler）
- 敏感信息不入 JWT、HTTPS、环境变量管理密钥
- 防注入、XSS 与 CSRF 意识

### 16. 微服务

- `@nestjs/microservices`，传输层：TCP、Redis、MQTT、Kafka、NATS 等
- `ClientProxy`、`MessagePattern`、`EventPattern`
- 混合应用：同一项目内 HTTP + 微服务
- 服务发现、健康检查、超时与重试

### 17. GraphQL

- `@nestjs/graphql`，Schema First / Code First
- Resolver、Query、Mutation、Subscription
- Guard、Interceptor、Filter 在 GraphQL 中的用法（如 `GqlExecutionContext`）
- 与 REST 并存时的模块划分

### 18. 测试

- 单元测试：`Test.createTestingModule()`、mock Provider
- E2E：`supertest` 测 HTTP 接口
- 覆盖率与 CI 集成

### 19. 部署与运维

- 构建与生产启动（`node dist/main`）
- 环境变量与 12-Factor
- 容器化（Docker）、健康检查接口、日志与监控
- 多实例与反向代理（Nginx/负载均衡）

### 20. 架构与最佳实践

- 模块划分：按业务域（User、Order、Auth）而非按技术层
- 共享内核：公共 DTO、异常、装饰器、工具
- 动态模块与可选依赖（`forRoot` / `forRootAsync`）
- 性能：懒加载模块、缓存、连接池与查询优化

### 专家篇学习检查清单

- [ ] 能实现完整的 JWT 登录 + 受保护接口 + 角色/权限控制
- [ ] 能搭建至少一种传输层的微服务并完成消息通信
- [ ] 能使用 GraphQL 提供 Query/Mutation 并与 REST 共存
- [ ] 能编写单元测试与 E2E 测试并融入流水线
- [ ] 能容器化部署并配置健康检查与基本监控

---

## 学习资源推荐

### 官方资源

- [NestJS 官方文档](https://docs.nestjs.com/)（英文）
- [NestJS 中文网](https://nestjs.bootcss.com/)（中文）
- [NestJS GitHub](https://github.com/nestjs/nest)

### 前置知识

- Node.js、ES6+、异步与 Promise/async-await
- TypeScript：类型、装饰器、泛型
- HTTP、REST、简单数据库与 SQL 概念

### 实践项目建议

| 阶段 | 项目 | 涉及知识点 |
|------|------|------------|
| 基础 | 待办/笔记 API | Module、Controller、Service、CRUD、DTO |
| 进阶 | 带角色的用户系统 API | Pipe、Guard、异常过滤、TypeORM/Prisma、Config |
| 专家 | 多服务博客/论坛（含评论、标签） | JWT、RBAC、GraphQL 或微服务、测试、Docker |

---

## 文档索引

**基础篇**
- [[NestJS-01-项目与模块]]
- [[NestJS-02-控制器与路由]]
- [[NestJS-03-提供者与依赖注入]]

**进阶篇**
- [[NestJS-04-管道与校验]]
- [[NestJS-05-守卫与拦截器]]
- [[NestJS-06-异常过滤与中间件]]
- [[NestJS-07-配置与数据库]]

**专家篇**
- [[NestJS-08-认证与授权]]
- [[NestJS-09-微服务]]
- [[NestJS-10-GraphQL]]
- [[NestJS-11-测试与部署]]

---

#NestJS #Node.js #后端 #学习路线
