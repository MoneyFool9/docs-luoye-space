# NuxtJS-01 项目与目录结构

> 基础篇第 1 章：从零创建 Nuxt 项目，理解核心目录与配置。

返回 [[NuxtJS学习路线]] | 下一章 [[NuxtJS-02-文件路由与页面]]

---

## 一、创建项目

### 1.1 使用 nuxi

```bash
npx nuxi@latest init my-app
cd my-app
npm install
npm run dev
```

默认会生成基于 Nuxt 3 的项目，带 `app.vue`、`nuxt.config.ts`、`pages/` 等。

### 1.2 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器，支持 HMR |
| `npm run build` | 生产构建（默认 SSR） |
| `npm run generate` | 静态预渲染（SSG），输出到 `.output/public` |
| `npm run preview` | 预览构建结果 |

---

## 二、核心目录结构

```
项目根目录/
├── app.vue           # 根组件，包裹整个应用
├── nuxt.config.ts    # Nuxt 配置
├── pages/            # 文件即路由
├── components/       # 组件，自动导入
├── composables/      # 组合式函数，自动导入
├── layouts/          # 布局
├── server/           # 服务端：api、routes、middleware
├── public/           # 静态资源，原样提供
├── assets/           # 需构建的静态资源
├── plugins/          # 插件
├── middleware/       # 路由中间件（也可在 app/middleware）
└── app/              # Nuxt 4 中部分目录可放 app 下
```

### 2.1 app.vue

应用根组件，必须包含 `<NuxtPage />` 才能渲染当前路由对应的页面；常在此包一层 `<NuxtLayout>`。

```vue
<template>
  <div>
    <!-- 全局导航等 -->
    <NuxtPage />
  </div>
</template>
```

### 2.2 nuxt.config.ts

```typescript
export default defineNuxtConfig({
  ssr: true,
  app: {
    head: {
      title: 'My App',
      meta: [{ name: 'description', content: '...' }],
    },
  },
  // 模块、路由、别名等
})
```

---

## 三、public 与 assets

- **public/**：不经过构建，直接通过根路径访问，如 `public/favicon.ico` → `/favicon.ico`。
- **assets/**：可被构建工具处理（如压缩、hash），在代码中通过路径或别名引用。

---

## 四、环境变量

- `.env`、`.env.production` 等，通过 `useRuntimeConfig()` 或 `runtimeConfig` 在 `nuxt.config` 中暴露。
- 服务端专用变量放在 `runtimeConfig` 的 `private` 部分，避免泄露到客户端。

---

## 小结

- 使用 `nuxi init` 创建项目，通过 `app.vue` 与 `nuxt.config.ts` 控制根结构与配置。
- 核心内容放在 `pages`、`components`、`server` 等约定目录，Nuxt 会按约定自动处理。

---

#Nuxt #基础 #目录结构 #app.vue #nuxt.config
