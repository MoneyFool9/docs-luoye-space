# NestJS-03 提供者与依赖注入

> 基础篇第 3 章：理解 Provider、@Injectable 与依赖注入（DI）。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-02-控制器与路由]]

---

## 一、什么是提供者 (Provider)

在 Nest 中，Provider 是可通过 **依赖注入** 注入到类（如 Controller、其他 Service）的依赖，常见形式是 **Service 类**。  
控制器应只处理 HTTP，复杂逻辑放在 Provider 里，符合单一职责。

---

## 二、@Injectable() 与注册

### 2.1 定义 Service

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private readonly items: Cat[] = [];

  create(cat: Cat) {
    this.items.push(cat);
  }

  findAll(): Cat[] {
    return this.items;
  }

  findOne(id: string): Cat | undefined {
    return this.items.find((c) => c.id === id);
  }
}
```

### 2.2 在模块中注册

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

只有在某模块的 `providers` 中声明，Nest 才会为该模块创建实例并参与 DI。

---

## 三、依赖注入 (DI)

### 3.1 构造函数注入

在需要用到 Service 的类（如 Controller）中，通过 **构造函数参数** 注入：

```typescript
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll() {
    return this.catsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCatDto) {
    return this.catsService.create(dto);
  }
}
```

Nest 会根据类型自动解析 `CatsService` 并注入，无需手动 `new`。

### 3.2 跨模块注入

若 Controller 在 A 模块，Service 在 B 模块：

1. B 模块的 `providers` 中有该 Service，且 `exports` 中导出；
2. A 模块 `imports: [BModule]`；
3. A 的 Controller 中即可 `constructor(private readonly bService: BService)`。

---

## 四、Provider 作用域（选学）

默认所有 Provider 是 **单例**（应用内共享同一实例）。

- `Scope.DEFAULT`：单例（默认）
- `Scope.REQUEST`：每个请求一个实例，请求结束即销毁
- `Scope.TRANSIENT`：每次注入时新建实例

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {}
```

使用 REQUEST/TRANSIENT 时，依赖链上的其它 Provider 也需兼容该作用域，否则会报错。

---

## 五、可选依赖 @Optional()

若某依赖可能不存在（如未配置的模块），可标记为可选，未注册时注入 `undefined`：

```typescript
import { Injectable, Optional } from '@nestjs/common';

@Injectable()
export class MyService {
  constructor(@Optional() private readonly optional: OptionalService) {}
}
```

---

## 六、设计原则小结

- **Controller**：只做路由、参数解析、调用 Service、返回结果。
- **Service（Provider）**：承载业务逻辑、调用其他 Service 或外部资源。
- **Module**：组织 Controller 与 Provider，通过 `imports`/`exports` 划分边界。
- 依赖都通过构造函数注入，便于测试时替换为 mock。

---

#NestJS #基础 #依赖注入 #Provider #Service
