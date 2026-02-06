# NestJS-04 管道与校验

> 进阶篇第 4 章：使用 Pipe 做参数校验与转换，掌握 ValidationPipe 与 DTO。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-03-提供者与依赖注入]] | 下一章 [[NestJS-05-守卫与拦截器]]

---

## 一、管道 (Pipe) 的作用

管道在「路由处理器执行前」运行，常用于：

- **校验**：请求参数是否合法，不合法则抛出异常（如 400）
- **转换**：将字符串转为数字、给默认值等
- **清洗**：去掉 DTO 中未声明的属性（需配合 ValidationPipe）

请求生命周期中顺序：Middleware → Guard → Interceptor（前）→ **Pipe** → 路由处理器。

---

## 二、内置管道

| 管道 | 说明 |
|------|------|
| `ValidationPipe` | 基于 class-validator 校验 DTO，最常用 |
| `ParseIntPipe` | 将参数转为整数，否则 400 |
| `ParseFloatPipe` | 转为浮点数 |
| `ParseBoolPipe` | 转为布尔 |
| `ParseUUIDPipe` | 校验 UUID 格式 |
| `DefaultValuePipe` | 参数缺失时给默认值 |

### 2.1 路由级使用示例

```typescript
@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('active', new DefaultValuePipe(true), ParseBoolPipe) active: boolean,
) {
  return this.service.findOne(id, active);
}
```

---

## 三、ValidationPipe 与 DTO

### 3.1 安装依赖

```bash
npm i class-validator class-transformer
```

### 3.2 定义 DTO 与校验规则

```typescript
// create-cat.dto.ts
import { IsString, IsInt, Min, MaxLength, IsOptional } from 'class-validator';

export class CreateCatDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @IsOptional()
  @IsString()
  breed?: string;
}
```

### 3.3 全局启用（推荐）

在 `main.ts` 中：

```typescript
import { ValidationPipe } from '@nestjs/common';

const app = await NestFactory.create(AppModule);
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // 自动去掉 DTO 中未声明的属性
    forbidNonWhitelisted: true,    // 若带未声明属性则直接 400
    transform: true,              // 根据类型自动转换（如 string → number）
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

之后在控制器中直接使用 DTO 类型即可：

```typescript
@Post()
create(@Body() dto: CreateCatDto) {
  return this.service.create(dto);
}
```

### 3.4 常用 class-validator 装饰器

- `@IsString()`、`@IsNumber()`、`@IsInt()`、`@IsBoolean()`、`@IsArray()`、`@IsOptional()`
- `@Min()`、`@Max()`、`@Length()`、`@MaxLength()`、`@MinLength()`
- `@IsEmail()`、`@IsUUID()`、`@IsEnum()`
- `@ValidateNested()`、`@Type(() => ChildDto)`：嵌套对象校验

---

## 四、自定义 Pipe

实现 `PipeTransform<T, R>` 接口：

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = parseInt(value, 10);
    if (isNaN(id)) {
      throw new BadRequestException('ID 必须为数字');
    }
    return id;
  }
}
```

使用：`@Param('id', ParseIdPipe) id: number`。  
也可在控制器或方法上用 `@UsePipes(ParseIdPipe)` 绑定。

---

## 小结

- 参数校验与转换用 **Pipe**；校验推荐 **ValidationPipe + DTO + class-validator**。
- 全局配置 `whitelist`、`forbidNonWhitelisted`、`transform` 可兼顾安全与类型。
- 特殊规则可写 **自定义 Pipe**，实现 `PipeTransform` 即可。

---

#NestJS #进阶 #管道 #校验 #DTO #ValidationPipe
