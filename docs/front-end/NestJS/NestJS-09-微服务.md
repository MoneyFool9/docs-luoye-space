# NestJS-09 微服务

> 专家篇第 9 章：使用 @nestjs/microservices 做进程间通信（TCP、Redis、MQ 等）。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-08-认证与授权]] | 下一章 [[NestJS-10-GraphQL]]

---

## 一、微服务在 Nest 中的含义

Nest 的「微服务」指通过 **传输层**（TCP、Redis、Kafka、NATS、MQTT 等）进行进程间通信的服务端应用。  
可以是独立进程的微服务，也可以是**混合应用**：同一项目中既有 HTTP 接口，又监听消息（如 Redis 消息、TCP 端口）。

---

## 二、基本用法

### 2.1 安装

根据传输层选择，例如 TCP 无需额外包，Redis 需：

```bash
npm i @nestjs/microservices ioredis
```

### 2.2 创建微服务实例（独立进程时）

```typescript
// main.ts 微服务入口示例
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3001 },
  });
  await app.listen();
}
bootstrap();
```

### 2.3 混合应用（HTTP + 微服务）

在主 `main.ts` 中先 `create(AppModule)` 再 `connectMicroservice()`，这样同一个 AppModule 既提供 HTTP 又处理微服务消息。

---

## 三、消息模式

### 3.1 请求-响应：MessagePattern

客户端发一条消息，等待一条响应（类似 RPC）。

```typescript
@Controller()
export class AppController {
  @MessagePattern({ cmd: 'sum' })
  sum(data: number[]): number {
    return (data || []).reduce((a, b) => a + b, 0);
  }
}
```

客户端通过 `ClientProxy` 的 `send({ cmd: 'sum' }, [1, 2, 3]).subscribe(...)` 调用。

### 3.2 事件（单向）：EventPattern

只发事件，不等待响应，适合日志、通知等。

```typescript
@EventPattern('user_created')
handleUserCreated(data: { userId: string }) {
  console.log('User created', data.userId);
}
```

客户端用 `emit('user_created', payload)`。

---

## 四、客户端 (ClientProxy)

在调用方（如另一个 Nest 应用或同一应用中的模块）注入 `ClientProxy`：

```typescript
@Injectable()
export class AppService {
  constructor(@Inject('MATH_SERVICE') private client: ClientProxy) {}

  sum(arr: number[]) {
    return this.client.send<number>({ cmd: 'sum' }, arr);
  }
}
```

需在模块中注册：

```typescript
ClientsModule.register([
  {
    name: 'MATH_SERVICE',
    transport: Transport.TCP,
    options: { host: 'localhost', port: 3001 },
  },
]),
```

---

## 五、传输层选型简要

| 传输层 | 场景 |
|--------|------|
| TCP | 简单 RPC、内网服务 |
| Redis | 利用 Redis 做消息队列/发布订阅 |
| Kafka / NATS | 高吞吐、事件流、多消费者 |
| MQTT | 物联网、轻量消息 |

按运维能力和业务需求选择；开发时可用 TCP 或 Redis 快速验证。

---

## 小结

- 使用 `createMicroservice()` 或 `connectMicroservice()` 绑定传输层与选项。
- 用 **MessagePattern** 做请求-响应，用 **EventPattern** 做事件推送。
- 调用端通过 **ClientProxy** 的 `send()`/`emit()` 配合注册的 `ClientsModule` 与微服务通信。

---

#NestJS #专家 #微服务 #MessagePattern #EventPattern #ClientProxy
