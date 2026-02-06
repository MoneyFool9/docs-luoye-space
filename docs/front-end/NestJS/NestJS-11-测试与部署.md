# NestJS-11 测试与部署

> 专家篇第 11 章：单元测试、E2E 测试与生产部署要点。

返回 [[NestJS学习路线]] | 上一章 [[NestJS-10-GraphQL]]

---

## 一、单元测试

### 1.1 使用 Test.createTestingModule

对 Service、Controller 等单独测试，依赖用 mock 替代：

```typescript
import { Test } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CatsService', () => {
  let service: CatsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(CatEntity),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  it('should return list', async () => {
    // 编写断言
    await expect(service.findAll()).resolves.toEqual([]);
  });
});
```

### 1.2 覆盖 Controller

将 Controller 也加入 `controllers`，Provider 用 mock，然后对 `controller.getXxx()` 或通过 `module.get(Controller)` 调用方法做断言。

---

## 二、E2E 测试

对完整 HTTP 请求做测试，使用 `supertest` + Nest 的 `INestApplication`：

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });
});
```

可配合真实或内存数据库，视需求决定是否 mock 外部服务。

---

## 三、生产部署要点

### 3.1 构建与运行

```bash
npm run build
node dist/main
```

或使用 `nest start --prod`（内部也是先 build 再运行）。  
确保 `NODE_ENV=production` 及所需环境变量已配置。

### 3.2 环境变量与 12-Factor

- 所有配置（数据库、JWT 密钥、第三方 API）通过环境变量或 ConfigService 注入。
- 不同环境使用不同 `.env` 或 CI/平台配置，不要将敏感信息提交到代码库。

### 3.3 容器化（Docker）

- 使用 Node 官方镜像，多阶段构建：先 `npm ci --production` 再只拷贝 `dist` 与 `node_modules`。
- 暴露应用端口，通过环境变量注入配置；可加健康检查接口（如 `GET /health`）供编排使用。

### 3.4 进程管理与反向代理

- 使用 PM2、systemd 或 K8s 等管理进程，保证崩溃重启。
- 前接 Nginx/负载均衡做 HTTPS、限流、静态资源等，反向代理到 Nest 进程。

### 3.5 日志与监控

- 使用 Logger 或统一日志库，避免直接 `console.log`；生产可输出 JSON 便于采集。
- 按需接入 APM、错误追踪、指标监控（如 Prometheus）。

---

## 小结

- **单元测试**：`Test.createTestingModule()` + mock Provider，对 Service/Controller 做隔离测试。
- **E2E**：`supertest` + `app.getHttpServer()` 对完整请求做验证。
- **部署**：build → 环境变量 → 进程管理 → 容器/反向代理 → 日志与监控，按 12-Factor 管理配置。

---

#NestJS #专家 #测试 #部署 #单元测试 #E2E #Docker
