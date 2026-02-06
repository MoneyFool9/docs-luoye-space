# NestJS-10 GraphQL

> 专家篇第 10 章：在 Nest 中集成 GraphQL（Schema First / Code First）与守卫、拦截器。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-09-微服务]] | 下一章 [[NestJS-11-测试与部署]]

---

## 一、Nest 中的 GraphQL 选型

- **Code First**：用 TypeScript 类 + 装饰器定义模型和 Resolver，Nest 自动生成 schema。
- **Schema First**：先写 `.graphql` 的 schema 文件，再写 Resolver 和实现。

两者可混用，一般新项目多用 Code First，与 TypeORM/Prisma 实体结合方便。

---

## 二、安装与模块配置

```bash
npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

```typescript
// app.module.ts
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,  // Code First 时自动生成 schema
      // 或 schemaFirst 时：typePaths: ['**/*.graphql'],
    }),
  ],
})
export class AppModule {}
```

---

## 三、Code First 要点

### 3.1 对象类型（对应 schema 的 type）

```typescript
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  email?: string;
}
```

### 3.2 Resolver：Query / Mutation

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './user.model';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.usersService.create(input);
  }
}
```

### 3.3 输入类型与参数

用 `@Args()` 或 `@Args('input', { type: () => CreateUserInput })` 接收输入；输入类型用 `@InputType()` 定义。

---

## 四、Guard / Interceptor / Filter 在 GraphQL 中的用法

- **Guard**：Resolver 同样支持 `@UseGuards(AuthGuard)`。GraphQL 上下文中需用 `GqlExecutionContext.create(context)` 从 `context.getArgs()`、`context.getContext()` 取参数和 request，再在 Guard 里做鉴权。
- **Interceptor / Exception Filter**：可全局或挂在 Resolver 上，逻辑与 HTTP 类似，只是拿到的 `ExecutionContext` 是 GraphQL 的，可用 `GqlExecutionContext` 转换。

---

## 五、与 REST 并存

同一 Nest 应用可同时挂 HTTP 控制器和 GraphQL 模块：  
GraphQL 默认常挂在 `/graphql`，REST 照常写 Controller。  
模块按业务拆分，部分只提供 Resolver，部分只提供 Controller，或同一业务既提供 REST 又提供 GraphQL，按需选择。

---

## 小结

- Nest 通过 `@nestjs/graphql` + Apollo Driver 提供 GraphQL；Code First 用装饰器定义类型和 Resolver，Schema First 用 `.graphql` 文件。
- Resolver 中 `@Query`、`@Mutation`（及 `@Subscription`）对应 schema 操作；Guard/Interceptor/Filter 需结合 `GqlExecutionContext` 使用。
- GraphQL 与 REST 可在同一应用中并存，按路由和模块组织即可。

---

#NestJS #专家 #GraphQL #Resolver #CodeFirst #SchemaFirst
