# React 生态与工具链

> 专家篇第 5 章：全面了解 React 生态系统。

返回 [[React学习路线]] | 上一章 [[React-16-大型应用架构]]

---

## 一、框架选择

| 框架 | 特点 | 适用场景 |
|------|------|----------|
| **Next.js** | 全栈、SSR/SSG | 生产应用首选 |
| **Remix** | 全栈、数据加载优先 | 复杂表单应用 |
| **Vite + React** | 快速、轻量 | SPA、工具类 |
| **Create React App** | 零配置 | 学习、原型 |

---

## 二、核心生态库

### 2.1 UI 组件库

| 库 | 特点 |
|---|------|
| **shadcn/ui** | Tailwind、可复制组件 |
| **Radix UI** | 无样式、可访问性好 |
| **Ant Design** | 企业级、功能全 |
| **Material UI** | Material Design |

### 2.2 状态管理

| 库 | 适用场景 |
|---|----------|
| **Zustand** | 简单、轻量（推荐） |
| **Jotai** | 原子化状态 |
| **Redux Toolkit** | 大型应用 |
| **React Query** | 服务端状态 |

### 2.3 表单

| 库 | 特点 |
|---|------|
| **React Hook Form** | 性能好（推荐） |
| **Formik** | 功能全面 |
| **Zod** | 类型安全验证 |

### 2.4 数据请求

| 库 | 特点 |
|---|------|
| **TanStack Query** | 缓存、自动重获取 |
| **SWR** | Vercel 出品、轻量 |
| **Axios** | HTTP 客户端 |

---

## 三、开发工具

### 3.1 必备工具

- **React DevTools**：组件调试
- **ESLint + Prettier**：代码规范
- **TypeScript**：类型检查

### 3.2 构建工具

| 工具 | 特点 |
|------|------|
| **Vite** | 快、现代（推荐） |
| **Turbopack** | Next.js 新构建器 |
| **esbuild** | 极快编译 |

---

## 四、推荐技术栈

### 4.1 个人项目

```
框架：Next.js App Router
样式：Tailwind CSS
组件：shadcn/ui
状态：Zustand
表单：React Hook Form + Zod
请求：TanStack Query
```

### 4.2 企业应用

```
框架：Next.js
样式：Tailwind CSS
组件：Radix UI / Ant Design
状态：Redux Toolkit / Zustand
表单：React Hook Form
请求：TanStack Query
测试：Jest + Testing Library + Playwright
```

---

## 五、学习资源

### 官方资源

- [React 官方文档](https://react.dev/)
- [Next.js 文档](https://nextjs.org/docs)

### 社区资源

- [React 技术揭秘](https://react.iamkasong.com/)
- [Josh Comeau 博客](https://www.joshwcomeau.com/)

### 实践项目

1. TodoList（基础）
2. 博客系统（SSR）
3. 电商后台（完整应用）
4. 实时协作工具（高级）

---

## 六、系列总结

恭喜完成 React 学习路线全部内容！

### 学习路径回顾

**基础篇**（1-6）
- [[React-01-核心概念]] → [[React-02-Hooks基础]] → [[React-03-组件设计模式]]
- [[React-04-路由与导航]] → [[React-05-表单处理]] → [[React-06-样式方案]]

**进阶篇**（7-12）
- [[React-07-Hooks进阶]] → [[React-08-自定义Hooks]] → [[React-09-状态管理]]
- [[React-10-TypeScript实战]] → [[React-11-性能优化]] → [[React-12-测试策略]]

**专家篇**（13-17）
- [[React-13-源码解析]] → [[React-14-并发模式]] → [[React-15-服务端渲染]]
- [[React-16-大型应用架构]] → [[React-17-生态与工具链]]

### 持续学习

- 关注 React 官方博客
- 参与开源项目
- 实践真实项目

---

#React #生态 #工具链 #技术栈
