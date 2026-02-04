# React 并发模式

> 专家篇第 2 章：掌握 React 18 的并发特性。

返回 [[React学习路线]] | 上一章 [[React-13-源码解析]] | 下一章 [[React-15-服务端渲染]]

---

## 一、并发模式概述

### 1.1 什么是并发渲染

- **可中断渲染**：长任务可以被高优先级任务打断
- **优先级调度**：紧急更新优先处理
- **后台渲染**：不阻塞用户交互

### 1.2 启用并发模式

```jsx
// React 18 默认启用
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

---

## 二、useTransition

### 2.1 区分紧急和非紧急更新

```jsx
import { useState, useTransition } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    
    // 紧急更新：立即响应输入
    setQuery(value);
    
    // 非紧急更新：可以延迟
    startTransition(() => {
      setResults(searchData(value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Loading...</span>}
      <ResultList results={results} />
    </div>
  );
}
```

---

## 三、useDeferredValue

### 3.1 延迟更新值

```jsx
import { useState, useDeferredValue } from 'react';

function SearchResults({ query }) {
  // query 变化时，deferredQuery 会延迟更新
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <ExpensiveList query={deferredQuery} />
    </div>
  );
}
```

---

## 四、Suspense

### 4.1 数据获取

```jsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  );
}

// 配合支持 Suspense 的数据获取库
function UserProfile() {
  const user = use(fetchUser()); // React 19 的 use hook
  return <div>{user.name}</div>;
}
```

### 4.2 嵌套 Suspense

```jsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
</Suspense>
```

---

## 五、并发特性对比

| 特性 | 用途 |
|------|------|
| useTransition | 标记非紧急状态更新 |
| useDeferredValue | 延迟派生值的更新 |
| Suspense | 声明式加载状态 |

### 使用场景

| 场景 | 推荐方案 |
|------|----------|
| 搜索输入 | useTransition |
| 列表筛选 | useDeferredValue |
| 数据加载 | Suspense |
| Tab 切换 | useTransition |

---

## 六、最佳实践

```jsx
// 搜索场景的最佳实践
function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Suspense fallback={<Loading />}>
        <Results query={deferredQuery} />
      </Suspense>
    </div>
  );
}
```

### 下一步

- [[React-15-服务端渲染]] - 学习 SSR

---

#React #并发模式 #useTransition #Suspense
