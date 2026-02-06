# NestJS-08 认证与授权

> 专家篇第 8 章：JWT + Passport 实现登录与受保护接口，以及 RBAC 思路。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-07-配置与数据库]]

---

## 一、认证 vs 授权

- **认证 (Authentication)**：确认「你是谁」，如登录校验用户名密码、校验 JWT。
- **授权 (Authorization)**：确认「你能做什么」，如角色/权限校验（RBAC）。

先认证再授权，通常用 Guard 在路由前完成。

---

## 二、JWT 认证流程简述

1. 用户登录：提交用户名/密码，服务端校验通过后签发 JWT（access_token）。
2. 后续请求：客户端在 Header 中携带 `Authorization: Bearer <token>`。
3. 服务端：用 JWT 策略解析并校验 token，将用户信息挂到 `request.user`，供守卫和控制器使用。

---

## 三、使用 @nestjs/jwt 与 @nestjs/passport

### 3.1 安装

```bash
npm i @nestjs/jwt @nestjs/passport passport passport-jwt
npm i -D @types/passport-jwt
```

### 3.2 认证模块结构示例

- **AuthModule**：导入 `JwtModule.register({ secret, signOptions: { expiresIn } })`、`PassportModule`，注册 `AuthService`、`JwtStrategy`、`LocalStrategy`（若做本地登录）。
- **AuthService**：提供 `signIn(username, password)`，校验用户后调用 `JwtService.signAsync(payload)` 返回 `{ access_token }`。
- **AuthController**：`POST /auth/login` 调 `AuthService.signIn`；`GET /auth/profile` 用 `@UseGuards(AuthGuard('jwt'))` 保护，从 `req.user` 取当前用户。

### 3.3 JWT 策略要点

```typescript
// jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; username: string }) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

校验通过后，`validate` 的返回值会挂到 `request.user`。

### 3.4 保护路由

在需要登录的控制器或方法上使用：

```typescript
@UseGuards(AuthGuard('jwt'))
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

---

## 四、授权（RBAC 思路）

- 在用户/角色表中维护「用户 – 角色 – 权限」关系。
- 自定义装饰器取出当前用户角色，如 `@Roles('admin')`。
- 自定义 Guard 在 `canActivate` 中比对 `req.user.roles` 与路由要求的角色，不满足则抛 `ForbiddenException`。

```typescript
// roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('roles', context.getHandler());
    if (!required) return true;
    const { user } = context.switchToHttp().getRequest();
    return required.some((role) => user?.roles?.includes(role));
  }
}
```

使用：`@UseGuards(AuthGuard('jwt'), RolesGuard)`、`@Roles('admin')`。

---

## 五、安全实践简要

- JWT 密钥从环境变量读取，足够长且随机。
- 敏感信息不要放进 JWT payload（仅放 id、角色等必要信息）。
- 生产使用 HTTPS；可配合 refresh token、限流、CORS 等。
- 密码必须哈希存储（如 bcrypt），登录时只比较哈希值。

---

## 小结

- **认证**：登录接口签发 JWT，受保护接口用 `AuthGuard('jwt')` + JwtStrategy 校验并注入 `req.user`。
- **授权**：用自定义装饰器 + Guard 做角色/权限校验（RBAC）。
- 密钥与敏感配置走环境变量，密码哈希存储。

---

#NestJS #专家 #认证 #授权 #JWT #Passport #RBAC
