# NestJS-05 守卫与拦截器

> 进阶篇第 5 章：用 Guard 做鉴权/授权，用 Interceptor 做日志与响应包装。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-04-管道与校验]] | 下一章 [[NestJS-06-异常过滤与中间件]]

---

## 一、守卫 (Guard)

### 1.1 作用与执行顺序

守卫用于在**路由处理器执行前**判断「是否允许继续」，典型场景：登录校验、权限校验。  
顺序：Middleware → **Guard** → Interceptor → Pipe → 路由处理器。  
若 `canActivate` 返回 `false` 或抛出异常，请求会被拒绝（如 403/401）。

### 1.2 实现 CanActivate

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // 例如校验 request.headers.authorization 或 session
    return !!request.headers['x-auth-token'];
  }
}
```

### 1.3 绑定方式

- 全局：`app.useGlobalGuards(new AuthGuard())`（或在根模块 `providers` 中注）
- 控制器：`@UseGuards(AuthGuard)` 修饰控制器类
- 方法：`@UseGuards(AuthGuard)` 修饰单个方法

### 1.4 与 JWT/Passport 配合

实际项目中常用 `@nestjs/passport` 的 `AuthGuard('jwt')` 等，在认证章节会展开；上面是「手写 Guard」的通用写法。

---

## 二、拦截器 (Interceptor)

### 2.1 作用

拦截器在**请求前后**都可介入，常用于：

- 统一包装响应格式（如 `{ data, code, message }`）
- 日志、耗时统计
- 超时、缓存、错误映射（如把内部错误转成固定格式）

顺序：请求 → Interceptor（前）→ Pipe → 路由处理器 → Interceptor（后）→ 响应。

### 2.2 实现 NestInterceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### 2.3 异常处理示例（在 Interceptor 中统一转异常）

```typescript
import { catchError, throwError } from 'rxjs';

return next.handle().pipe(
  catchError((err) => throwError(() => new BadGatewayException('服务异常'))),
);
```

### 2.4 绑定方式

- 全局：`app.useGlobalInterceptors(new TransformInterceptor())`
- 控制器/方法：`@UseInterceptors(TransformInterceptor)`

---

## 三、ExecutionContext 简要

- `context.switchToHttp()`：获取 HTTP 的 `getRequest()`、`getResponse()`、`getNext()`
- GraphQL 场景用 `GqlExecutionContext.create(context)` 获取 args/context 等

守卫和拦截器都通过 `ExecutionContext` 拿到当前请求上下文。

---

## 小结

- **Guard**：在进入路由前做「能不能访问」的判断，返回 boolean 或抛异常。
- **Interceptor**：在请求/响应流中用 RxJS 做包装、日志、错误转换等。
- 两者都可全局或挂在控制器/方法上，按需选择粒度。

---

#NestJS #进阶 #守卫 #拦截器 #Guard #Interceptor
