# NuxtJS-02 文件路由与页面

> 基础篇第 2 章：基于 pages 目录的文件路由与动态路由。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-01-项目与目录结构]] | 下一章 [[NuxtJS-03-组件与自动导入]]

---

## 一、约定即路由

`pages/` 下每个文件对应一条路由，无需手写路由表。

| 文件路径 | 路由 |
|----------|------|
| `pages/index.vue` | `/` |
| `pages/about.vue` | `/about` |
| `pages/posts/index.vue` | `/posts` |
| `pages/posts/[id].vue` | `/posts/:id` |
| `pages/posts/[...slug].vue` | `/posts/*`（捕获剩余路径） |

---

## 二、页面组件基本写法

```vue
<!-- pages/about.vue -->
<template>
  <section>
    <p>该页对应路由 /about</p>
  </section>
</template>
```

无需在别处注册，Nuxt 会根据目录自动生成路由并渲染对应组件。

---

## 三、动态路由

### 3.1 单参数 [id].vue

```vue
<!-- pages/posts/[id].vue -->
<template>
  <div>文章 ID: {{ route.params.id }}</div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
```

访问 `/posts/123` 时 `route.params.id` 为 `'123'`。

### 3.2 多段捕获 [...slug].vue

```vue
<!-- pages/docs/[...slug].vue -->
```

匹配 `/docs/a`、`/docs/a/b` 等，`route.params.slug` 为数组如 `['a']`、`['a','b']`。

---

## 四、嵌套路由

父路由需要「子出口」时，使用**与路由同名的目录 + 子页面**，并在父页面中放 `<NuxtPage />`。

目录示例：

```
pages/
├── parent.vue      # 父页，对应 /parent
└── parent/
    └── child.vue   # 子页，对应 /parent/child
```

父页面：

```vue
<!-- pages/parent.vue -->
<template>
  <div>
    <h1>父布局</h1>
    <NuxtPage />   <!-- 子页面渲染在这里 -->
  </div>
</template>
```

---

## 五、路由跳转

- 声明式：`<NuxtLink to="/about">关于</NuxtLink>`
- 编程式：`await navigateTo('/about')` 或 `navigateTo({ name: 'posts-id', params: { id: '1' } })`

---

## 小结

- 在 `pages/` 下按路径创建 `.vue` 即可得到对应路由；`[id]`、`[...slug]` 表示动态与捕获段。
- 嵌套路由通过「父页 + 同名目录下的子页」实现，父页用 `<NuxtPage />` 作为子出口。

---

#Nuxt #基础 #文件路由 #动态路由 #NuxtPage
