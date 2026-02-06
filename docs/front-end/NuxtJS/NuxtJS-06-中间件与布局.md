# NuxtJS-06 中间件与布局

> 进阶篇第 6 章：路由中间件、布局与错误页。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-05-状态与Composables]] | 下一章 [[NuxtJS-07-服务端API与全栈]]

---

## 一、路由中间件 (Route Middleware)

在进入页面之前执行，常用于：鉴权、重定向、权限校验。

### 1.1 定义

```typescript
// middleware/auth.ts 或 app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState('user')
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
```

- **navigateTo**：返回即可触发重定向。
- **abortNavigation()**：中止导航，可传错误信息。

注意：重定向前判断 `to.path`，避免重定向到自身造成死循环。

### 1.2 使用方式

- **全局**：文件名为 `global` 或通过 `definePageMeta` 不指定则部分版本会全局生效；更常见的是在需要保护的页面里通过 `definePageMeta({ middleware: 'auth' })` 按页启用。
- **页面级**：在页面中 `definePageMeta({ middleware: ['auth'] })`，可多个。

```vue
<!-- pages/dashboard.vue -->
<script setup>
definePageMeta({ middleware: 'auth' })
</script>
```

### 1.3 命名与执行顺序

中间件按文件名或在 `definePageMeta` 中的顺序执行；`navigateTo` 或 `abortNavigation` 会中断后续中间件与页面渲染。

---

## 二、布局 (Layouts)

### 2.1 定义布局

`layouts/` 目录下每个文件是一个布局，需包含 `<slot />` 或默认插槽以放置页面内容。

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <AppHeader />
    <slot />
    <AppFooter />
  </div>
</template>
```

### 2.2 使用布局

在 `app.vue` 中包一层 `<NuxtLayout>`，页面会渲染在 layout 的 slot 中：

```vue
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

默认使用 `default` 布局。为页面指定其他布局：

```vue
<script setup>
definePageMeta({ layout: 'admin' })
</script>
```

则使用 `layouts/admin.vue`。

---

## 三、错误页 (error.vue)

根目录下 `error.vue` 用于展示未捕获错误（如 404、500）。接收 `error` 属性，可调用 `clearError({ redirect: '/' })` 清除错误并跳转。

```vue
<template>
  <div>
    <h2>{{ error?.statusCode }}</h2>
    <button @click="clearError({ redirect: '/' })">返回首页</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } }>()
</script>
```

---

## 小结

- **中间件**：`defineNuxtRouteMiddleware`，用 `navigateTo` / `abortNavigation` 控制进入页面前的行为；通过 `definePageMeta` 绑定到页面。
- **布局**：`layouts/*.vue` 提供外壳，`app.vue` 用 `<NuxtLayout><NuxtPage /></NuxtLayout>`，页面用 `definePageMeta({ layout })` 选择布局。
- **错误页**：`error.vue` 统一处理错误展示与 `clearError`。

---

#Nuxt #进阶 #中间件 #布局 #error.vue
