# NuxtJS-11 测试与部署

> 专家篇第 11 章：测试思路与生产部署要点。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-10-模块与Nitro]]

---

## 一、测试思路

### 1.1 单元测试

- 使用 **Vitest**（或 Jest）测试 composables、工具函数、纯逻辑。
- 不依赖 Nuxt 的代码可直接测；依赖 `useState`、`useFetch` 等时，可用 `@nuxt/test-utils` 的 `setup` 在测试中创建 Nuxt 上下文并 mock。

### 1.2 组件测试

- 用 **Vue Test Utils** + Vitest 测单文件组件；需要 Nuxt 环境时用 `@nuxt/test-utils` 的 `mountSuspended` 等，自动注入 Nuxt 的 provide/auto-import。

### 1.3 E2E 测试

- 使用 **Playwright** 或 **Cypress** 对完整应用（`nuxt dev` 或 `nuxt preview`）做端到端测试。
- 可配合 CI 在 build 通过后启动 preview 再跑 E2E。

---

## 二、生产构建

- **SSR 应用**：`nuxt build`，用 `node .output/server/index.mjs` 或各平台推荐的启动方式运行。
- **静态站**：`nuxt generate`，将 `.output/public` 部署到任意静态托管。
- 确保 `NODE_ENV=production` 及所需环境变量在运行/构建时可用。

---

## 三、部署方式简述

| 方式 | 适用 | 说明 |
|------|------|------|
| Node 服务器 | SSR、需 server API | 用 preset `node-server`，在 VPS/容器中运行 .output |
| Vercel / Netlify | SSR 或 SSG | 使用对应 preset，按文档配置构建命令与输出目录 |
| 静态托管 | 纯静态/SSG | `nuxt generate`，上传 `.output/public` |
| Docker | 自建环境 | 多阶段构建：安装依赖 → build → 只保留 .output 与 node |

---

## 四、环境变量与 12-Factor

- 环境相关配置用环境变量或 `runtimeConfig`，不要写死在代码里。
- 区分构建时与运行时的变量；敏感信息仅放在运行时，不打进前端 bundle。

---

## 小结

- **测试**：单元测 composables/工具，组件测用 Vue Test Utils + Nuxt test-utils，E2E 用 Playwright/Cypress。
- **部署**：根据 SSR/静态选 build 或 generate 与对应 Nitro preset；Node 部署运行 .output，静态部署 .output/public。
- 环境变量与安全按 12-Factor 管理。

---

#Nuxt #专家 #测试 #部署 #CI
