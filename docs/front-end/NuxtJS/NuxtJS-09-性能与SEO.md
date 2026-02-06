# NuxtJS-09 性能与 SEO

> 专家篇第 9 章：useHead、meta、懒加载与预渲染、sitemap 思路。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-08-认证与权限]] | 下一章 [[NuxtJS-10-模块与Nitro]]

---

## 一、SEO：标题与 Meta

### 1.1 useHead / useSeoMeta

在页面或布局中设置当前页的 title、description、og 等，便于爬虫与分享。

```vue
<script setup>
useHead({
  title: '文章标题',
  meta: [
    { name: 'description', content: '页面描述' },
    { property: 'og:title', content: '文章标题' },
  ],
})
// 或使用 useSeoMeta 简化
useSeoMeta({
  title: '文章标题',
  description: '页面描述',
  ogTitle: '文章标题',
  ogDescription: '页面描述',
})
</script>
```

### 1.2 nuxt.config 默认 head

在 `nuxt.config` 的 `app.head` 中配置全局默认值，页面内可覆盖。

---

## 二、性能：懒加载

### 2.1 路由级懒加载

文件路由本身会按路由做 code splitting，无需额外配置。

### 2.2 组件懒加载

非首屏大组件用 `defineAsyncComponent` 或 `<LazyXxx>`（Nuxt 对 `components/` 下组件会自动生成 Lazy 版本）：

```vue
<template>
  <LazyHeavyChart v-if="showChart" />
</template>
```

### 2.3 图片

使用 `@nuxt/image` 模块可自动优化图片、懒加载、合适尺寸；或自行用 `loading="lazy"` 与 srcset。

---

## 三、预渲染与 SSG

- **nuxt generate**：根据路由预渲染为静态 HTML，适合内容相对固定的站点（博客、文档、落地页）。
- 动态路由可通过 `nitro.prerender.routes` 或 `routeRules` 指定要预渲染的路径列表。
- 预渲染后可直接部署到静态托管（如 Netlify、Vercel、OSS），无需 Node 运行时。

---

## 四、sitemap 与 robots

- 使用社区模块（如 `@nuxtjs/sitemap`）根据路由生成 sitemap。
- `robots.txt` 可通过 `public/robots.txt` 或服务端路由返回，引导爬虫。

---

## 五、其他

- 关键 CSS 内联、非关键资源异步，Nuxt/Vite 已有部分默认优化。
- 第三方脚本尽量异步或放 body 末尾，或用 `useHead` 的 `script: [{ src: '...', defer: true }]`。

---

## 小结

- **SEO**：用 **useHead** / **useSeoMeta** 设 title、description、og 等；预渲染可提升首屏 HTML 可抓取性。
- **性能**：路由自动分包；大组件用 **Lazy** 或异步组件；图片用模块或懒加载。
- **预渲染**：`nuxt generate` + 可选 prerender 配置；sitemap/robots 用模块或自定义。

---

#Nuxt #专家 #性能 #SEO #useHead #预渲染
