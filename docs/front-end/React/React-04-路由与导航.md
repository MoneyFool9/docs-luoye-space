# React 路由与导航

> 基础篇第 4 章：掌握 React Router，实现单页应用的路由导航。

返回 [[React学习路线]] | 上一章 [[React-03-组件设计模式]] | 下一章 [[React-05-表单处理]]

---

## 一、React Router 概述

### 1.1 安装

```bash
npm install react-router-dom
```

### 1.2 基本概念

| 概念 | 说明 |
|------|------|
| `BrowserRouter` | 路由器容器，使用 HTML5 History API |
| `Routes` | 路由集合容器 |
| `Route` | 单个路由规则 |
| `Link` | 声明式导航链接 |
| `useNavigate` | 编程式导航 |

---

## 二、基础路由配置

### 2.1 基本用法

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users">Users</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2.2 嵌套路由

```jsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="users" element={<Users />}>
            <Route index element={<UserList />} />
            <Route path=":userId" element={<UserDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Layout 组件使用 Outlet 渲染子路由
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />  {/* 子路由渲染在这里 */}
      </main>
      <Footer />
    </div>
  );
}
```

---

## 三、路由参数

### 3.1 URL 参数

```jsx
// 路由配置
<Route path="/users/:userId" element={<UserProfile />} />

// 获取参数
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams();
  return <div>User ID: {userId}</div>;
}
```

### 3.2 查询参数

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const category = searchParams.get('category');
  const page = searchParams.get('page') || '1';

  const updatePage = (newPage) => {
    setSearchParams({ category, page: newPage });
  };

  return (
    <div>
      <p>Category: {category}</p>
      <p>Page: {page}</p>
      <button onClick={() => updatePage(Number(page) + 1)}>
        Next Page
      </button>
    </div>
  );
}

// URL: /products?category=electronics&page=2
```

---

## 四、导航方式

### 4.1 声明式导航（Link）

```jsx
import { Link, NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      {/* 基本链接 */}
      <Link to="/about">About</Link>
      
      {/* 带状态的链接 */}
      <Link to="/users" state={{ from: 'navigation' }}>
        Users
      </Link>
      
      {/* NavLink：自动添加 active 类 */}
      <NavLink 
        to="/products"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        Products
      </NavLink>
    </nav>
  );
}
```

### 4.2 编程式导航（useNavigate）

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
    
    // 导航到首页
    navigate('/');
    
    // 替换当前历史记录
    navigate('/dashboard', { replace: true });
    
    // 传递状态
    navigate('/profile', { state: { from: 'login' } });
    
    // 返回上一页
    navigate(-1);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 五、路由守卫

### 5.1 认证保护

```jsx
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // 重定向到登录页，保存当前位置
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// 使用
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### 5.2 角色权限

```jsx
function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// 使用
<Route 
  path="/admin" 
  element={
    <RoleRoute allowedRoles={['admin']}>
      <AdminPanel />
    </RoleRoute>
  } 
/>
```

---

## 六、路由配置对象

### 6.1 使用 useRoutes

```jsx
import { useRoutes } from 'react-router-dom';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'users',
        element: <Users />,
        children: [
          { index: true, element: <UserList /> },
          { path: ':userId', element: <UserDetail /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];

function App() {
  const element = useRoutes(routes);
  return <BrowserRouter>{element}</BrowserRouter>;
}
```

### 6.2 懒加载路由

```jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## 七、常用 Hooks

| Hook | 用途 |
|------|------|
| `useParams` | 获取 URL 参数 |
| `useSearchParams` | 获取/设置查询参数 |
| `useNavigate` | 编程式导航 |
| `useLocation` | 获取当前位置信息 |
| `useMatch` | 检查当前 URL 是否匹配 |

```jsx
import { useLocation, useMatch } from 'react-router-dom';

function CurrentPath() {
  const location = useLocation();
  const match = useMatch('/users/:id');

  return (
    <div>
      <p>Path: {location.pathname}</p>
      <p>Search: {location.search}</p>
      <p>State: {JSON.stringify(location.state)}</p>
      <p>Match: {match ? `User ID: ${match.params.id}` : 'No match'}</p>
    </div>
  );
}
```

---

## 八、本章小结

### 核心概念

| 组件/Hook | 用途 |
|-----------|------|
| `BrowserRouter` | 路由容器 |
| `Routes` / `Route` | 路由定义 |
| `Link` / `NavLink` | 声明式导航 |
| `Outlet` | 渲染子路由 |
| `Navigate` | 重定向 |
| `useNavigate` | 编程式导航 |
| `useParams` | URL 参数 |

### 下一步

- [[React-05-表单处理]] - 学习表单处理
- [[React-11-性能优化]] - 路由懒加载优化

---

#React #Router #路由 #导航
