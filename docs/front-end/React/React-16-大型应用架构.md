# React 大型应用架构

> 专家篇第 4 章：学习大型 React 应用的架构设计。

返回 [[React学习路线]] | 上一章 [[React-15-服务端渲染]] | 下一章 [[React-17-生态与工具链]]

---

## 一、目录结构

### 1.1 功能模块式（Feature-based）

```
src/
├── features/              # 功能模块
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   ├── users/
│   └── products/
├── shared/               # 共享资源
│   ├── components/
│   ├── hooks/
│   └── utils/
├── app/                  # 应用层
│   ├── routes/
│   └── store/
└── index.tsx
```

### 1.2 分层架构

```
src/
├── presentation/         # UI 层
│   ├── components/
│   ├── pages/
│   └── layouts/
├── application/          # 应用层
│   ├── hooks/
│   └── services/
├── domain/              # 领域层
│   ├── models/
│   └── repositories/
└── infrastructure/      # 基础设施
    ├── api/
    └── storage/
```

---

## 二、模块化设计

### 2.1 功能模块封装

```typescript
// features/auth/index.ts
export { LoginForm } from './components/LoginForm';
export { useAuth } from './hooks/useAuth';
export { authService } from './services/authService';
export type { User, AuthState } from './types';
```

### 2.2 依赖规则

```
app → features → shared
  ↓       ↓         ↓
  └───────┴─────────┘
     只能向下依赖
```

---

## 三、状态管理分层

```
┌─────────────────────────────────────┐
│           UI State                  │  组件本地状态
│         (useState)                  │  
├─────────────────────────────────────┤
│         Feature State               │  功能模块状态
│    (Context / Zustand Store)        │  
├─────────────────────────────────────┤
│         Server State                │  服务端数据
│      (React Query / SWR)            │  
├─────────────────────────────────────┤
│         Global State                │  全局状态
│    (Zustand / Redux Toolkit)        │  
└─────────────────────────────────────┘
```

---

## 四、API 层设计

```typescript
// infrastructure/api/client.ts
const apiClient = {
  get: <T>(url: string) => fetch(url).then(r => r.json() as T),
  post: <T>(url: string, data: unknown) => 
    fetch(url, { method: 'POST', body: JSON.stringify(data) })
      .then(r => r.json() as T),
};

// features/users/services/userService.ts
export const userService = {
  getUsers: () => apiClient.get<User[]>('/api/users'),
  getUser: (id: string) => apiClient.get<User>(`/api/users/${id}`),
  createUser: (data: CreateUserDto) => apiClient.post<User>('/api/users', data),
};
```

---

## 五、错误边界

```jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 六、微前端（可选）

### 6.1 方案选择

| 方案 | 特点 |
|------|------|
| Module Federation | Webpack 5 原生支持 |
| qiankun | 阿里出品，生态好 |
| single-spa | 框架无关 |

### 6.2 适用场景

- 多团队独立开发
- 渐进式重构
- 技术栈迁移

---

## 七、架构原则

1. **关注点分离**：UI、业务逻辑、数据获取分层
2. **模块内聚**：相关代码放在一起
3. **依赖倒置**：核心逻辑不依赖具体实现
4. **渐进式复杂化**：从简单开始，按需增加抽象

### 下一步

- [[React-17-生态与工具链]] - 了解生态工具

---

#React #架构 #大型应用 #模块化
