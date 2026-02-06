# NuxtJS-05 状态与 Composables

> 进阶篇第 5 章：useState 共享状态、composables 组织逻辑、插件执行时机。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-04-数据获取与SSR]] | 下一章 [[NuxtJS-06-中间件与布局]]

---

## 一、useState（SSR 安全的共享状态）

`useState` 是 Nuxt 提供的跨组件、跨请求的响应式状态。同一 key 在服务端与客户端会对应同一份数据，且会随 payload 序列化到客户端，避免水合不一致。

```typescript
// composables/useUser.ts
export const useUser = () => useState<User | null>('user', () => null)
```

在任意组件或插件中：

```vue
<script setup>
const user = useUser()
user.value = { id: '1', name: 'Alice' }
</script>
```

- 第一个参数是**唯一 key**，同 key 共享同一 ref。
- 第二个参数是**初始值或工厂函数**（服务端会执行一次用于初始化）。

适合：当前用户、主题、全局 UI 状态等。

---

## 二、Composables 组织方式

### 2.1 放在 composables/ 目录

- 默认导出：按文件名转 camelCase 使用，如 `useCounter.ts` → `useCounter()`。
- 命名导出：按导出名使用，如 `export const useAuth = () => ...` → `useAuth()`。

### 2.2 在 composable 里使用其他 composable

可以在一个 composable 里调用 `useState`、`useFetch`、`useRoute` 等，Nuxt 会正确处理执行顺序。

### 2.3 在插件中使用 composables

`defineNuxtPlugin` 中可以使用已注册的 composables；但依赖「组件生命周期」或「晚于当前插件注册的插件」的 composable 可能不可用，需注意顺序。

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  const color = useColor() // 假设 useColor 来自 composables
})
```

---

## 三、插件 (plugins)

### 3.1 定义与执行顺序

`plugins/` 目录下文件会自动注册为插件（或使用 `nuxt.config` 的 `plugins` 数组指定）。执行顺序：服务端按注册顺序执行；客户端同样。

```typescript
// plugins/01.my.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 可注入到 nuxtApp
  return {
    provide: {
      hello: (msg: string) => `Hello ${msg}`,
    },
  }
})
```

使用：`const { $hello } = useNuxtApp()`，然后 `$hello('world')`。

### 3.2 仅客户端或仅服务端

文件名带 `.client` 或 `.server` 后缀，则只在该端执行，如 `analytics.client.ts`。

---

## 小结

- **useState**：同 key 共享、SSR 安全、会序列化到 payload，适合全局共享状态。
- **composables/**：按文件/导出名自动导入，用于封装可复用逻辑。
- **plugins**：在应用启动时执行，可 provide 全局方法或状态；注意 .client/.server 与执行顺序。

---

#Nuxt #进阶 #useState #Composables #插件
