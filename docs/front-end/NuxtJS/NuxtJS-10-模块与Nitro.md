# NuxtJS-10 模块与 Nitro

> 专家篇第 10 章：Nuxt 模块概念、Nitro 预设与部署形态。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-09-性能与SEO]] | 下一章 [[NuxtJS-11-测试与部署]]

---

## 一、Nuxt 模块 (Nuxt Modules)

模块用于扩展 Nuxt：注册插件、添加组件、修改配置、挂 Nitro 钩子等。

### 1.1 使用模块

在 `nuxt.config` 的 `modules` 数组中添加模块名或路径：

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt', '~/modules/my-module'],
})
```

### 1.2 编写简单模块

```typescript
import { defineNuxtModule, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'my-module' },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('app:resolve', (app) => {
      // 注册插件、添加模板等
    })
    nuxt.hook('nitro:config', (config) => {
      // 修改 Nitro 配置
    })
  },
})
```

常用 hooks：`app:resolve`、`components:dirs`、`nitro:config`、`vite:config` 等。

---

## 二、Nitro 与部署形态

Nuxt 的服务端由 **Nitro** 提供：负责 server 目录、API、SSR 渲染、静态生成等。

### 2.1 预设 (preset) 决定输出格式

在 `nuxt.config` 中：

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'node-server',  // 或 'static'、'vercel'、'netlify' 等
  },
})
```

或构建时通过环境变量：`NITRO_PRESET=node-server nuxt build`。

### 2.2 常见预设

| 预设 | 说明 |
|------|------|
| `node-server` | 输出 Node 服务，需在 Node 环境运行，支持 SSR 与 server API |
| `static` | 纯静态，无 Node，配合 `nuxt generate` 或 `ssr: false` |
| `vercel` / `netlify` | 适配对应平台的 serverless/边缘函数 |

### 2.3 ssr 开关

- `ssr: true`（默认）：服务端渲染 HTML，需 Node 或兼容的 serverless 环境。
- `ssr: false`：仅客户端渲染，可 `nuxt generate` 成静态站，或仍用 Node 只提供 HTML 壳和静态资源。

---

## 三、build 与 generate

- **nuxt build**：构建生产应用；若 SSR 开启且 preset 为 node-server，输出可在 Node 中运行。
- **nuxt generate**：预渲染路由为静态 HTML（若路由过多可配合 crawl 或显式列表），输出在 `.output/public`，可单独部署为静态站。

---

## 小结

- **Nuxt 模块**：通过 `defineNuxtModule` 与 hooks 扩展 Nuxt；项目内通过 `modules` 使用。
- **Nitro**：负责服务端与构建产物；**preset** 决定部署形态（Node/static/各平台）。
- **ssr** 与 **preset** 共同决定是 SSR 应用还是纯静态或混合部署。

---

#Nuxt #专家 #模块 #Nitro #部署
