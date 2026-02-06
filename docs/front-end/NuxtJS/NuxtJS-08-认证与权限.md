# NuxtJS-08 认证与权限

> 专家篇第 8 章：在 Nuxt 中实现登录态与受保护路由。

返回 [[NuxtJS学习路线]] | 上一章 [[NuxtJS-07-服务端API与全栈]] | 下一章 [[NuxtJS-09-性能与SEO]]

---

## 一、认证思路概览

- **登录**：表单提交到 `server/api/auth/login`，校验通过后写 cookie（如 session 或 JWT 存 httpOnly cookie）或返回 token 由前端存（如 localStorage，注意 XSS 风险）。
- **状态**：可用 `useState('user')` 存当前用户，在服务端从 cookie 解析后写入，随 payload 到客户端。
- **保护路由**：在需要登录的页面或全局中间件里检查 `useState('user')` 或 cookie，未登录则 `navigateTo('/login')` 或 `abortNavigation()`。

---

## 二、服务端：登录接口与 cookie

```typescript
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; password: string }>(event)
  // 校验用户，查库等
  const user = await validateUser(body)
  if (!user) throw createError({ statusCode: 401, message: 'Invalid credentials' })

  setCookie(event, 'session', signSession(user), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })
  return { user }
})
```

登出时删除 cookie：`deleteCookie(event, 'session')`。

---

## 三、服务端：从 cookie 恢复 user 并写入 payload

在服务端可写一个**插件**或**服务端中间件**，在每次请求时读取 cookie，解析出 user，并写入 `useState('user')`，这样首屏 SSR 和后续客户端都能拿到同一份 user。

```typescript
// server/middleware/auth.ts 或插件中在服务端分支里
// 示例：在能访问 event 的地方（如 server 中间件）
export default defineEventHandler((event) => {
  const session = getCookie(event, 'session')
  const user = session ? parseSession(session) : null
  // 通过 event 或 payload 把 user 带到 useState 的初始值
  // 实际做法可能是 setResponseHeader 或写入 event.context，由 Nuxt 注入 state
})
```

具体实现可结合 Nuxt 的 `useRequestEvent()` 与 payload 的 state 注入方式，或使用社区模块（如 nuxt-auth 系）统一处理。

---

## 四、路由中间件：未登录重定向

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState('user')
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
```

在需要登录的页面：

```vue
<script setup>
definePageMeta({ middleware: 'auth' })
</script>
```

或把该中间件设为全局（如命名为 `auth.global.ts` 并在逻辑里排除 `/login`、`/register` 等），避免每个页面都写一遍。

---

## 五、权限（按角色/权限控制）

- 在 user 上挂 `roles` 或 `permissions`，在中间件或页面逻辑里根据 `to.path` 或 `definePageMeta` 里自定义字段判断是否允许访问。
- 不允许时 `abortNavigation('无权限')` 或 `navigateTo('/403')`。

---

## 小结

- 登录在 **server API** 里校验并写 **cookie**（或返回 token）；登出删 cookie。
- 用 **useState('user')** 存当前用户，服务端从 cookie 解析后注入，保证 SSR 与客户端一致。
- **路由中间件** 中根据 user 是否存在做重定向或 abort，需登录的页面通过 `definePageMeta({ middleware: 'auth' })` 或全局中间件保护。

---

#Nuxt #专家 #认证 #权限 #中间件 #cookie
