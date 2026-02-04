# React 服务端渲染

> 专家篇第 3 章：掌握 SSR、SSG 和 React Server Components。

返回 [[React学习路线]] | 上一章 [[React-14-并发模式]] | 下一章 [[React-16-大型应用架构]]

---

## 一、渲染模式对比

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| **CSR** | 客户端渲染 | 后台系统、SPA |
| **SSR** | 服务端渲染 | SEO 重要、首屏要求高 |
| **SSG** | 静态生成 | 博客、文档站 |
| **ISR** | 增量静态生成 | 内容更新频繁的静态站 |
| **RSC** | React Server Components | Next.js 13+ App Router |

---

## 二、Next.js 基础

### 2.1 页面路由 (Pages Router)

```
pages/
├── index.js          → /
├── about.js          → /about
├── posts/
│   ├── index.js      → /posts
│   └── [id].js       → /posts/:id
```

### 2.2 数据获取

```jsx
// SSR: 每次请求时执行
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

// SSG: 构建时执行
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}

// ISR: 带重新验证的 SSG
export async function getStaticProps() {
  return {
    props: { data },
    revalidate: 60, // 60 秒后重新生成
  };
}
```

---

## 三、App Router (Next.js 13+)

### 3.1 目录结构

```
app/
├── layout.js         # 根布局
├── page.js           # 首页 /
├── about/
│   └── page.js       # /about
├── posts/
│   ├── page.js       # /posts
│   └── [id]/
│       └── page.js   # /posts/:id
```

### 3.2 Server Components（默认）

```jsx
// app/posts/page.js
// 默认是 Server Component，可以直接 async
export default async function PostsPage() {
  const posts = await fetchPosts(); // 直接在服务端获取数据

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 3.3 Client Components

```jsx
'use client'; // 声明为客户端组件

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

---

## 四、Server Components vs Client Components

| 特性 | Server Components | Client Components |
|------|-------------------|-------------------|
| 运行环境 | 服务端 | 客户端 |
| 可以使用 Hooks | ❌ | ✅ |
| 可以使用浏览器 API | ❌ | ✅ |
| 可以直接访问数据库 | ✅ | ❌ |
| 打包到客户端 | ❌ | ✅ |
| 可以是 async | ✅ | ❌ |

### 组合使用

```jsx
// Server Component
import ClientCounter from './ClientCounter';

export default async function Page() {
  const data = await fetchData(); // 服务端获取数据

  return (
    <div>
      <h1>{data.title}</h1>
      <ClientCounter /> {/* 客户端交互 */}
    </div>
  );
}
```

---

## 五、选择建议

| 场景 | 推荐 |
|------|------|
| 博客/文档 | SSG + ISR |
| 电商/内容站 | SSR 或 RSC |
| 后台系统 | CSR |
| 混合需求 | Next.js App Router |

### 下一步

- [[React-16-大型应用架构]] - 学习架构设计

---

#React #SSR #NextJS #ServerComponents
