# NuxtJS-04 数据获取与 SSR

> 进阶篇第 4 章：useFetch、useAsyncData 与 SSR 下的数据流与序列化。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-03-组件与自动导入]] | 下一章 [[NuxtJS-05-状态与Composables]]

---

## 一、为什么不用直接 await $fetch

在 SSR 下，若在组件顶层直接写 `const data = await $fetch('/api/xxx')`：

- 服务端会请求一次
- 客户端 hydration 时可能再请求一次，导致重复请求且可能水合不一致

应使用 **useFetch** 或 **useAsyncData**，让 Nuxt 在服务端取数后把结果序列化到 payload，客户端直接复用，只请求一次。

---

## 二、useFetch（推荐）

`useFetch` = `useAsyncData` + 内置 `$fetch`，最常用。

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch('/api/products')
</script>

<template>
  <div v-if="pending">加载中...</div>
  <div v-else-if="error">错误</div>
  <div v-else>{{ data }}</div>
</template>
```

- **服务端**：在渲染前请求，结果写入 payload。
- **客户端**：优先用 payload，不再重复请求（除非 refresh 或 key 变化）。

### 2.1 常用选项

```typescript
const { data } = await useFetch('/api/list', {
  key: 'list',           // 缓存 key，同 key 共享数据
  lazy: true,            // 不阻塞导航，适合非首屏
  server: true,          // 是否在服务端请求（默认 true）
  watch: [page],         // 依赖变化时重新请求
  default: () => [],     // 初始值
  transform: (res) => res.items,
  pick: ['id', 'name'], // 只保留部分字段减小 payload
})
```

---

## 三、useAsyncData（自定义取数逻辑）

当需要自己写请求逻辑（如多接口合并、非 GET）时用 `useAsyncData`：

```vue
<script setup lang="ts">
const { data } = await useAsyncData('cart-summary', async () => {
  const [coupons, offers] = await Promise.all([
    $fetch('/api/cart/coupons'),
    $fetch('/api/cart/offers'),
  ])
  return { coupons, offers }
})
</script>
```

第一个参数是 key，第二个是返回 Promise 的函数；同样会做服务端请求与 payload 序列化。

---

## 四、$fetch 的适用场景

- **仅在客户端触发的请求**：如表单提交、按钮点击、非首屏懒加载。
- 不参与首屏 SSR 数据时，可直接 `await $fetch(...)`，不会造成双重请求。

```vue
<script setup lang="ts">
async function submit() {
  await $fetch('/api/submit', { method: 'POST', body: form })
}
</script>
```

---

## 五、注意点

- 使用相对 URL（如 `/api/xxx`）时，服务端请求会走当前 Nuxt 应用，cookie 等会带上。
- 需要把服务端 Set-Cookie 带回客户端时，可用 `$fetch.raw` 或封装 composable 在服务端把 cookie 写入 event 的 response header。

---

## 小结

- **首屏/路由相关数据**：用 `useFetch` 或 `useAsyncData`，保证服务端取一次并序列化到客户端。
- **仅客户端触发的请求**：可直接 `$fetch`。
- 善用 `key`、`lazy`、`watch`、`transform` 等选项控制缓存与更新。

---

#Nuxt #进阶 #数据获取 #SSR #useFetch #useAsyncData
