# React Hooks 基础

> 基础篇第 2 章：掌握 React 最常用的 Hooks，理解其工作原理。

返回 [[React学习路线]] | 上一章 [[React-01-核心概念]] | 下一章 [[React-03-组件设计模式]]

---

## 一、Hooks 概述

### 1.1 什么是 Hooks

Hooks 是 React 16.8 引入的特性，让你在函数组件中使用 state 和其他 React 特性。

### 1.2 Hooks 规则

```jsx
// ✅ 只在函数组件或自定义 Hook 的顶层调用
function Component() {
  const [count, setCount] = useState(0);  // ✅
  
  // ❌ 不能在条件语句中调用
  if (condition) {
    const [value, setValue] = useState(0);  // ❌
  }
  
  // ❌ 不能在循环中调用
  for (let i = 0; i < 3; i++) {
    useEffect(() => {});  // ❌
  }
}
```

**为什么？** React 依赖 Hooks 的调用顺序来正确关联状态。

---

## 二、useState

### 2.1 基本用法

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### 2.2 函数式更新

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 多次调用只会 +1（因为 count 是同一个值）
  const addThree = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  // ✅ 使用函数式更新，会 +3
  const addThreeCorrect = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };
}
```

### 2.3 复杂状态

```jsx
// 对象状态
const [user, setUser] = useState({ name: '', age: 0 });
setUser(prev => ({ ...prev, name: 'John' }));

// 数组状态
const [items, setItems] = useState([]);
setItems(prev => [...prev, newItem]);           // 添加
setItems(prev => prev.filter(x => x.id !== id)); // 删除
setItems(prev => prev.map(x => 
  x.id === id ? { ...x, done: true } : x        // 更新
));
```

### 2.4 惰性初始化

```jsx
// 如果初始值需要复杂计算，传入函数避免每次渲染都计算
const [state, setState] = useState(() => {
  const initialValue = someExpensiveComputation();
  return initialValue;
});
```

---

## 三、useEffect

### 3.1 基本用法

```jsx
import { useEffect, useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 每次渲染后执行
  useEffect(() => {
    document.title = `Count: ${count}`;
  });

  // 仅在挂载时执行（空依赖数组）
  useEffect(() => {
    console.log('Component mounted');
  }, []);

  // 当 count 变化时执行
  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);
}
```

### 3.2 清理副作用

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 设置定时器
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // 返回清理函数（组件卸载或依赖变化前调用）
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <p>Seconds: {seconds}</p>;
}
```

### 3.3 数据获取

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        // 防止设置已卸载组件的状态
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    // 清理：取消请求
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <div>{user?.name}</div>;
}
```

### 3.4 依赖数组详解

| 依赖数组 | 执行时机 |
|----------|----------|
| 不传 | 每次渲染后 |
| `[]` | 仅挂载和卸载时 |
| `[a, b]` | 挂载时 + a 或 b 变化时 |

```jsx
// 常见错误：缺少依赖
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  // ❌ 缺少 query 依赖，query 变化不会重新获取
  useEffect(() => {
    fetchResults(query).then(setResults);
  }, []);

  // ✅ 正确
  useEffect(() => {
    fetchResults(query).then(setResults);
  }, [query]);
}
```

---

## 四、useContext

### 4.1 创建和使用 Context

```jsx
import { createContext, useContext, useState } from 'react';

// 1. 创建 Context
const ThemeContext = createContext('light');

// 2. 提供 Context
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </ThemeContext.Provider>
  );
}

// 3. 消费 Context
function Toolbar() {
  return <ThemedButton />;
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>I am {theme}</button>;
}
```

### 4.2 Context + State 模式

```jsx
// contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook 封装
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

```jsx
// 使用
function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  
  if (!user) return <LoginPage />;
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 五、useRef

### 5.1 访问 DOM 元素

```jsx
import { useRef, useEffect } from 'react';

function TextInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // 组件挂载后自动聚焦
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
}
```

### 5.2 保存可变值（不触发重渲染）

```jsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    return () => stop(); // 清理
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### 5.3 保存前一个值

```jsx
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// 使用
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <p>
      Now: {count}, Before: {prevCount}
    </p>
  );
}
```

### 5.4 useRef vs useState

| 特性 | useRef | useState |
|------|--------|----------|
| 更新时重渲染 | ❌ | ✅ |
| 值保持跨渲染 | ✅ | ✅ |
| 适用场景 | DOM 引用、定时器 ID | UI 相关数据 |

---

## 六、Hooks 执行顺序

```jsx
function Example() {
  console.log('1. Render');

  const [count, setCount] = useState(() => {
    console.log('2. useState initializer (only first render)');
    return 0;
  });

  useEffect(() => {
    console.log('4. useEffect');
    return () => {
      console.log('5. useEffect cleanup');
    };
  }, [count]);

  console.log('3. Before return');

  return <div>{count}</div>;
}

// 首次渲染输出：
// 1. Render
// 2. useState initializer (only first render)
// 3. Before return
// 4. useEffect

// 更新时输出：
// 1. Render
// 3. Before return
// 5. useEffect cleanup
// 4. useEffect
```

---

## 七、常见问题

### 7.1 闭包陷阱

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 闭包问题：alert 中的 count 永远是 0
  const handleClick = () => {
    setTimeout(() => {
      alert(count);  // 捕获的是旧值
    }, 3000);
  };

  // ✅ 使用 ref 获取最新值
  const countRef = useRef(count);
  countRef.current = count;

  const handleClickFixed = () => {
    setTimeout(() => {
      alert(countRef.current);  // 总是最新值
    }, 3000);
  };
}
```

### 7.2 依赖数组中的对象/数组

```jsx
// ❌ 每次渲染都是新对象，会导致无限循环
useEffect(() => {
  fetchData(options);
}, [{ page: 1, limit: 10 }]);  // ❌

// ✅ 拆分为基本类型
useEffect(() => {
  fetchData({ page, limit });
}, [page, limit]);

// ✅ 或使用 useMemo
const options = useMemo(() => ({ page, limit }), [page, limit]);
useEffect(() => {
  fetchData(options);
}, [options]);
```

---

## 八、本章小结

| Hook | 用途 |
|------|------|
| `useState` | 声明状态变量 |
| `useEffect` | 处理副作用（数据获取、订阅、DOM 操作） |
| `useContext` | 消费 Context |
| `useRef` | 引用 DOM 或保存可变值 |

### 下一步

- [[React-03-组件设计模式]] - 学习组件设计的最佳实践
- [[React-07-Hooks进阶]] - 学习更多高级 Hooks

---

#React #Hooks #useState #useEffect #useContext #useRef
