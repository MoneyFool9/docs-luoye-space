# NestJS-02 控制器与路由

> 基础篇第 2 章：使用控制器处理 HTTP 请求与路由参数。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-01-项目与模块]] | 下一章 [[NestJS-03-提供者与依赖注入]]

---

## 一、控制器职责

控制器负责：
- 接收 HTTP 请求；
- 调用 Service 完成业务；
- 返回 HTTP 响应。

不负责具体业务逻辑，业务应放在 Service 中。

---

## 二、路由与 HTTP 方法

### 2.1 基本写法

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('cats')  // 路由前缀：/cats
export class CatsController {
  @Get()             // GET /cats
  findAll() {
    return [];
  }

  @Get(':id')        // GET /cats/:id
  findOne(@Param('id') id: string) {
    return { id };
  }

  @Post()            // POST /cats
  create(@Body() body: CreateCatDto) {
    return body;
  }
}
```

### 2.2 常用 HTTP 装饰器

| 装饰器 | 方法 | 说明 |
|--------|------|------|
| `@Get()` | GET | 查询 |
| `@Post()` | POST | 创建 |
| `@Put()` | PUT | 全量更新 |
| `@Patch()` | PATCH | 部分更新 |
| `@Delete()` | DELETE | 删除 |

---

## 三、参数装饰器

### 3.1 路径参数 @Param

```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return this.service.findOne(id);
}

// 多个参数
@Get(':type/:id')
find(@Param('type') type: string, @Param('id') id: string) {
  return { type, id };
}
```

### 3.2 查询参数 @Query

```typescript
@Get()
findAll(
  @Query('page') page: string,
  @Query('limit') limit: string,
) {
  return this.service.findAll({ page, limit });
}

// 或用 DTO 接收（配合 ValidationPipe 做校验与类型）
@Get()
findAll(@Query() query: PaginationDto) {
  return this.service.findAll(query);
}
```

### 3.3 请求体 @Body

```typescript
@Post()
create(@Body() createCatDto: CreateCatDto) {
  return this.service.create(createCatDto);
}
```

### 3.4 请求头 @Headers

```typescript
@Get()
find(@Headers('authorization') auth: string) {
  return this.service.findByAuth(auth);
}
```

### 3.5 其他

- `@Req()` / `@Request()`：Express 的 `req` 对象
- `@Res()`：需配合 `passthrough: true` 或手动发响应，一般不推荐
- `@Ip()`：客户端 IP
- `@HostParam()`：主机参数

---

## 四、状态码与响应头

```typescript
import { HttpCode, HttpStatus, Header } from '@nestjs/common';

@Post()
@HttpCode(HttpStatus.CREATED)   // 201
@Header('X-Custom', 'value')
create(@Body() dto: CreateCatDto) {
  return this.service.create(dto);
}
```

---

## 五、路由通配与版本（选学）

- 路由可含通配符，如 `@Get('ab*cd')` 匹配 `abcd`、`abxxxcd`。
- 版本控制可用 `VERSION_NEUTRAL` 或 `Version()` 等，见官方文档。

---

## 小结

- 用 `@Controller('path')` 定义前缀，用 `@Get`/`@Post` 等绑定方法与路径。
- 用 `@Param`、`@Query`、`@Body`、`@Headers` 等取参数，业务交给 Service。

---

#NestJS #基础 #控制器 #路由
