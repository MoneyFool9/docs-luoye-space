# NuxtJS-03 组件与自动导入

> 基础篇第 3 章：components 自动注册与全局自动导入（Vue/Nuxt API、composables）。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-02-文件路由与页面]]

---

## 一、组件自动导入

`components/` 目录下的 Vue 组件会**按路径与文件名**自动注册，无需在页面中写 `import`。

### 1.1 基本规则

- `components/AppHeader.vue` → 模板中可直接用 `<AppHeader />`
- `components/base/Button.vue` → 默认会带路径前缀，如 `<BaseButton />`（可配置为无前缀则 `<Button />`）

在 `nuxt.config` 中可调整 `components` 的 `pathPrefix`、`global` 等。

### 1.2 使用示例

```vue
<template>
  <div>
    <AppHeader />
    <BaseButton>点击</BaseButton>
  </div>
</template>
<!-- 无需 script 里 import -->
```

---

## 二、Vue 与 Nuxt 的自动导入

以下在 `<script setup>` 中可直接使用，无需 import：

- **Vue**：`ref`、`reactive`、`computed`、`watch`、`onMounted`、`nextTick` 等
- **Nuxt**：`useRoute`、`useRouter`、`useState`、`useFetch`、`navigateTo`、`useRuntimeConfig` 等

---

## 三、composables 自动导入

`composables/` 目录下导出的函数会自动作为 composable 注入，按**文件名**或**导出名**使用。

### 3.1 默认导出（文件名转 camelCase）

```typescript
// composables/useCounter.ts
export default function () {
  const count = ref(0)
  return { count, increment: () => count.value++ }
}
```

在任意组件中：`const { count, increment } = useCounter()`。

### 3.2 命名导出

```typescript
// composables/useFoo.ts
export const useFoo = () => useState('foo', () => 'bar')
```

使用：`const foo = useFoo()`。

---

## 四、显式导入（可选）

若关闭某目录的自动导入，或使用非约定目录的组件/函数，可手动 `import`，Nuxt 不禁止。

---

## 小结

- `components/` 下组件按路径与配置自动注册，可直接在模板中使用。
- Vue 与 Nuxt 的 API、以及 `composables/` 下导出会自动导入，在 `<script setup>` 中直接调用即可。

---

#Nuxt #基础 #组件 #自动导入 #composables
