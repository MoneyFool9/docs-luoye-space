# NestJS-07 配置与数据库

> 进阶篇第 7 章：使用 ConfigModule 管理配置，以及 TypeORM / Prisma 集成要点。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-06-异常过滤与中间件]]

---

## 一、配置 (Configuration)

### 1.1 安装与基本用法

```bash
npm i @nestjs/config
```

根模块中导入（推荐全局）：

```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class AppModule {}
```

### 1.2 使用 ConfigService

在任意注入过 ConfigModule 的类中：

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}

  getDbHost(): string {
    return this.config.get<string>('DATABASE_HOST', 'localhost');
  }
}
```

- `config.get('KEY')`：取环境变量，可传第二参数为默认值。
- 多环境：通过 `NODE_ENV` 或不同 `envFilePath` 区分 dev/test/prod。

### 1.3 校验环境变量（选学）

可使用 `joi` 等库在 `ConfigModule.forRoot({ validate: (config) => {...} })` 中校验必填项，启动时即失败，避免运行时缺配置。

---

## 二、数据库集成概览

Nest 常与 **TypeORM** 或 **Prisma** 搭配，下面只做要点罗列。

### 2.1 TypeORM

安装：`@nestjs/typeorm`、`typeorm`、对应数据库驱动（如 `mysql2`）。

根模块中注册数据源：

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: +process.env.DATABASE_PORT || 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,  // 生产务必用迁移，不用 true
    }),
  ],
})
export class AppModule {}
```

功能模块中注册实体与仓库：

```typescript
TypeOrmModule.forFeature([UserEntity])
```

在 Service 中注入 `Repository<UserEntity>`，使用 `repository.find()`、`save()`、`delete()` 等。

### 2.2 Prisma

安装 Prisma 与生成客户端后，创建 `PrismaService` 继承 `PrismaClient`，并在 `onModuleInit` 中 `await this.$connect()`，在 `onModuleDestroy` 中 `await this.$disconnect()`。  
将该 Service 放在全局或对应模块的 `providers` 中，其它 Service 注入后即可使用 `this.prisma.user.findMany()` 等。

### 2.3 注意点

- 生产环境不要开启 TypeORM 的 `synchronize: true`，用迁移管理表结构。
- 连接池、超时等可在 TypeORM/Prisma 的配置中按需调整。
- 敏感信息一律从环境变量读取，不要写死在代码里。

---

## 小结

- **ConfigModule**：统一加载 `.env`，通过 **ConfigService** 注入使用，建议全局 + 多环境文件。
- **数据库**：TypeORM 用 `forRoot`/`forFeature` + Entity/Repository；Prisma 用自定义 PrismaService + 生成客户端，按项目选型即可。

---

#NestJS #进阶 #配置 #ConfigModule #TypeORM #Prisma #数据库
