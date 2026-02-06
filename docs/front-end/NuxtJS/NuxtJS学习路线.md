# NuxtJS 学习路线

> 从基础到专家的 Nuxt 学习指南，覆盖文件路由、SSR/SSG、数据获取、服务端 API 与部署。

---

## 学习路线总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NuxtJS 学习路线                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│   │   基础篇    │───▶│   进阶篇    │───▶│   专家篇    │                 │
│   │  2-3 周     │    │  3-4 周     │    │  持续深入   │                 │
│   └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                          │
│   项目与目录结构      数据获取与 SSR       认证与权限                     │
│   文件路由与页面      Composables/状态     性能与 SEO                     │
│   组件与自动导入      中间件/布局/API      模块与 Nitro/部署               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 核心知识点总览

| 层级 | 核心概念 | 说明 |
|------|----------|------|
| **基础** | 目录结构 / app.vue / nuxt.config | 项目骨架与配置 |
| **基础** | 文件路由 (pages) | 基于目录的自动路由、动态路由 |
| **基础** | 组件与自动导入 | components、composables 自动可用 |
| **进阶** | useFetch / useAsyncData | SSR 友好数据获取、避免重复请求 |
| **进阶** | useState / Composables / 插件 | 共享状态与逻辑复用 |
| **进阶** | 中间件 / 布局 / server API | 路由守卫、布局、全栈 API |
| **专家** | 认证与 SEO | 鉴权、meta、预渲染、sitemap |
| **专家** | 模块 / Nitro / 部署 | 扩展、SSR/静态/Node 部署 |

---

## 基础篇 (Foundation)

> 目标：能基于 Nuxt 创建页面应用，理解文件路由与自动导入

### 1. 项目与目录结构

- 创建项目：`npx nuxi init` 或 `npx nuxi@latest init`
- 核心目录：`app.vue`、`pages/`、`components/`、`nuxt.config.ts`
- 入口与 `<NuxtPage />`、根布局概念

### 2. 文件路由与页面

- `pages/` 下文件即路由：`index.vue` → `/`，`about.vue` → `/about`
- 动态路由：`[id].vue`、`[...slug].vue`
- 嵌套路由与 `<NuxtPage />` 占位

### 3. 组件与自动导入

- `components/` 下组件按目录与文件名自动注册，无需手写 import
- 其他自动导入：Vue API（ref、computed）、Nuxt 工具（useState、navigateTo）、composables 目录

### 基础篇学习检查清单

- [ ] 能创建 Nuxt 项目并理解 app.vue、pages、nuxt.config 的作用
- [ ] 能通过新建/移动 pages 文件添加或调整路由
- [ ] 能在页面中使用 components 下组件且无需 import
- [ ] 能完成一个多页展示型小站（如介绍页 + 列表 + 详情）

---

## 进阶篇 (Advanced)

> 目标：掌握 SSR 数据获取、状态与 Composables、中间件与布局、服务端 API

### 4. 数据获取与 SSR

- `useFetch`、`useAsyncData` 与 `$fetch` 的区别与使用场景
- 服务端取数一次、序列化到客户端（避免重复请求与 hydration 问题）
- `lazy`、`watch`、`transform`、key 等选项

### 5. 状态与 Composables

- `useState` 做跨组件/跨请求的共享状态（SSR 安全）
- `composables/` 目录与自动导入，组合式逻辑复用
- 插件 `defineNuxtPlugin` 与执行顺序

### 6. 中间件与布局

- 路由中间件：`defineNuxtRouteMiddleware`、`navigateTo`、`abortNavigation`
- 全局/页面级中间件、命名中间件
- `layouts/` 与 `<NuxtLayout>`，默认布局与按页面指定布局
- 错误页 `error.vue` 与 `clearError`

### 7. 服务端 API 与全栈

- `server/api/` 下文件即 API 路由，自动带 `/api` 前缀
- `defineEventHandler`、`getQuery`、`readBody`、返回 JSON
- 动态路由 `[id].ts`、h3 与 Nitro 基础概念

### 进阶篇学习检查清单

- [ ] 能使用 useFetch/useAsyncData 正确做服务端数据获取并理解序列化
- [ ] 能用 useState 与 composables 组织共享状态与逻辑
- [ ] 能写路由中间件做登录校验或重定向
- [ ] 能定义 layouts 并在页面中切换
- [ ] 能在 server/api 下实现若干接口并在前端调用

---

## 专家篇 (Expert)

> 目标：认证与权限、性能与 SEO、Nuxt 模块与 Nitro、测试与部署

### 8. 认证与权限

- 登录态存储：cookie、useState、服务端 session 思路
- 路由中间件中校验登录并 `navigateTo('/login')` 或 `abortNavigation`
- 服务端 API 中读取 cookie/session 做鉴权

### 9. 性能与 SEO

- `useHead`、`useSeoMeta` 管理 title/description/meta
- 懒加载组件与路由、图片优化
- 预渲染、sitemap、robots（模块或自定义）

### 10. 模块与 Nitro

- Nuxt 模块概念与 `defineNuxtModule`、hooks
- Nitro 与预设：`node-server`、`static`、各平台 preset
- `ssr: true/false`、`nuxt build` 与 `nuxt generate` 的区别

### 11. 测试与部署

- 单元测试与 E2E 思路（Vitest、Playwright 等）
- 部署方式：Node 服务、静态站点、边缘函数
- 环境变量、CI 与 Docker 简要

### 专家篇学习检查清单

- [ ] 能实现基于中间件与 cookie/state 的登录与受保护页
- [ ] 能为关键页配置 SEO meta 并理解预渲染与 SSG
- [ ] 能说明 Nuxt 模块与 Nitro 预设对部署形态的影响
- [ ] 能完成一次生产构建并部署到至少一种环境

---

## 学习资源推荐

### 官方资源

- [Nuxt 官方文档](https://nuxt.com/)
- [Nuxt GitHub](https://github.com/nuxt/nuxt)

### 前置知识

- Vue 3：组合式 API、`<script setup>`、响应式
- 基础 TypeScript、Node 与 HTTP 概念

### 实践项目建议

| 阶段 | 项目 | 涉及知识点 |
|------|------|------------|
| 基础 | 个人/产品介绍站 | 文件路由、布局、组件 |
| 进阶 | 带列表与详情的博客/商品站 | useFetch、server API、中间件 |
| 专家 | 带登录与后台的完整站 | 认证、SEO、部署 |

---

## 文档索引

**基础篇**
- [[NuxtJS-01-项目与目录结构]]
- [[NuxtJS-02-文件路由与页面]]
- [[NuxtJS-03-组件与自动导入]]

**进阶篇**
- [[NuxtJS-04-数据获取与SSR]]
- [[NuxtJS-05-状态与Composables]]
- [[NuxtJS-06-中间件与布局]]
- [[NuxtJS-07-服务端API与全栈]]

**专家篇**
- [[NuxtJS-08-认证与权限]]
- [[NuxtJS-09-性能与SEO]]
- [[NuxtJS-10-模块与Nitro]]
- [[NuxtJS-11-测试与部署]]

---

#Nuxt #Vue #SSR #学习路线
