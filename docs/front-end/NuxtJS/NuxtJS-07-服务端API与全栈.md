# NuxtJS-07 服务端 API 与全栈

> 进阶篇第 7 章：server 目录、API 路由与 h3/Nitro。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-06-中间件与布局]]

---

## 一、server 目录约定

- **server/api/**：自动映射为 `/api/*` 的 HTTP 接口。
- **server/routes/**：映射到根路径，如 `server/routes/health.ts` → `GET /health`。
- **server/middleware/**：服务端中间件，在每次服务端请求前执行。

Nuxt 使用 **Nitro** 作为服务端引擎，基于 **h3**，因此可用 h3 的 event、工具函数。

---

## 二、API 路由 (server/api)

### 2.1 基本写法

```typescript
// server/api/hello.ts
export default defineEventHandler((event) => {
  return { hello: 'world' }
})
```

请求 `GET /api/hello` 得到 `{ hello: 'world' }`。

### 2.2 动态路由

```typescript
// server/api/posts/[id].ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return { id }
})
```

对应 `/api/posts/123`，`id` 为 `'123'`。

### 2.3 读取 query 与 body

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)      // GET ?a=1
  const body = await readBody(event) // POST body
  return { query, body }
})
```

### 2.4 返回状态码与 header

```typescript
export default defineEventHandler((event) => {
  setResponseStatus(event, 201)
  setHeader(event, 'X-Custom', 'value')
  return { created: true }
})
```

---

## 三、非 /api 根路由 (server/routes)

`server/routes/` 下文件映射到网站根路径，不带 `/api` 前缀。

```typescript
// server/routes/health.ts
export default defineEventHandler(() => ({ status: 'ok' }))
```

访问 `GET /health` 得到 `{ status: 'ok' }`。

---

## 四、在前端调用

- 使用相对路径即可，SSR 时请求会发到当前 Nuxt 服务：
  - `useFetch('/api/hello')`
  - `$fetch('/api/posts/1')`
- Cookie 在服务端请求时会自动带上；若需把服务端接口的 Set-Cookie 带回浏览器，需在服务端用 `appendResponseHeader(event, 'set-cookie', ...)` 等方式写回。

---

## 五、与 useFetch 配合

在页面或 composable 中：

```vue
<script setup>
const { data } = await useFetch('/api/products')
</script>
```

服务端渲染时会在本机请求 `/api/products`，数据进入 payload；客户端不再重复请求（除非 refresh）。

---

## 小结

- **server/api/*.ts** → `/api/*`，**server/routes/*.ts** → 根路径；使用 `defineEventHandler`、`getQuery`、`readBody`、`getRouterParam` 等。
- 前端用 `useFetch`/`$fetch` 调相对路径即可，SSR 下请求走当前应用，Cookie 一致。
- 全栈逻辑可全部放在同一 Nuxt 项目中，无需单独起后端服务（也可再对接外部 API）。

---

#Nuxt #进阶 #server #API #Nitro #h3
