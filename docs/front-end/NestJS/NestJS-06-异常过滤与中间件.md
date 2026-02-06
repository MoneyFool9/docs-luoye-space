# NestJS-06 异常过滤与中间件

> 进阶篇第 6 章：统一异常响应格式（Exception Filter）与请求前处理（Middleware）。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-05-守卫与拦截器]] | 下一章 [[NestJS-07-配置与数据库]]

---

## 一、异常过滤器 (Exception Filter)

### 1.1 作用

当管道、守卫、控制器或服务中抛出异常时，异常过滤器可以**统一**捕获并返回约定格式的 HTTP 响应（如 `{ code, message, path }`），避免每个接口各自处理。

### 1.2 内置 HTTP 异常

Nest 提供一系列继承自 `HttpException` 的异常类，抛出后默认会得到对应状态码的 JSON：

- `BadRequestException`（400）
- `UnauthorizedException`（401）
- `ForbiddenException`（403）
- `NotFoundException`（404）
- `ConflictException`（409）
- `InternalServerErrorException`（500）
- 等

使用示例：`throw new NotFoundException('用户不存在');`

### 1.3 自定义异常过滤器

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: exception.message,
    });
  }
}
```

### 1.4 绑定方式

- 全局：`app.useGlobalFilters(new HttpExceptionFilter())`
- 控制器/方法：`@UseFilters(HttpExceptionFilter)`

若需捕获「非 HttpException」的未知错误，可 `@Catch()` 不传参，并在 filter 里区分处理，返回 500 等。

---

## 二、中间件 (Middleware)

### 2.1 作用与顺序

中间件在**最早**执行，常用于：日志、请求体解析、CORS、维护 request 上的自定义属性等。  
顺序：**Middleware** → Guard → Interceptor → Pipe → 路由处理器。

### 2.2 函数式中间件

```typescript
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.url}`);
  next();
}
```

在模块中通过 `consumer.apply(logger).forRoutes('*')` 等绑定。

### 2.3 类中间件（实现 NestMiddleware）

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

### 2.4 在模块中注册

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');  // 或 .forRoutes(CatsController)、'cats'
  }
}
```

---

## 三、请求生命周期回顾

完整顺序：

1. **Middleware**
2. **Guard**
3. **Interceptor（前）**
4. **Pipe**
5. **路由处理器**
6. **Interceptor（后）**（包装响应）
7. 若发生异常：**Exception Filter** 处理并返回错误响应

---

## 小结

- **Exception Filter**：统一捕获异常并返回约定 JSON，用 `@Catch()` 指定要处理的异常类型。
- **Middleware**：最早执行，做日志、CORS、请求增强等，在模块的 `configure(consumer)` 中 `apply().forRoutes()` 绑定。

---

#NestJS #进阶 #异常过滤 #中间件 #ExceptionFilter #Middleware
