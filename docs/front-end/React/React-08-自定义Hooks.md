# React 自定义 Hooks

> 进阶篇第 2 章：学习设计和实现自定义 Hooks，提升代码复用性。

返回 [[React学习路线]] | 上一章 [[React-07-Hooks进阶]] | 下一章 [[React-09-状态管理]]

---

## 一、自定义 Hook 基础

### 1.1 什么是自定义 Hook

自定义 Hook 是以 `use` 开头的函数，可以调用其他 Hooks，用于复用状态逻辑。

```jsx
// 自定义 Hook
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// 使用
function Counter() {
  const { count, increment, decrement, reset } = useCounter(10);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 1.2 设计原则

1. **以 `use` 开头**：遵循 React 约定
2. **单一职责**：一个 Hook 只做一件事
3. **返回值一致**：考虑返回数组或对象
4. **参数设计**：提供合理的默认值

---

## 二、常用自定义 Hooks

### 2.1 useToggle

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// 使用
const { value: isOpen, toggle, setFalse: close } = useToggle();
```

### 2.2 useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// 使用
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### 2.3 useFetch

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network error');
        const json = await response.json();
        if (!cancelled) {
          setData(json);
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

    fetchData();
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// 使用
const { data: users, loading, error } = useFetch('/api/users');
```

### 2.4 useDebounce

```jsx
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 使用
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      // 执行搜索
      search(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

### 2.5 useClickOutside

```jsx
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// 使用
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div className="dropdown-menu">...</div>}
    </div>
  );
}
```

### 2.6 useMediaQuery

```jsx
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => 
    window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// 使用
function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

---

## 三、Hook 组合模式

### 3.1 组合多个 Hooks

```jsx
function useUser(userId) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
  const [isFollowing, setIsFollowing] = useLocalStorage(`following-${userId}`, false);

  const toggleFollow = useCallback(() => {
    setIsFollowing(prev => !prev);
  }, [setIsFollowing]);

  return {
    user,
    loading,
    error,
    isFollowing,
    toggleFollow,
  };
}
```

### 3.2 Hook 工厂模式

```jsx
function createResourceHook(resourceName) {
  return function useResource(id) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(`/api/${resourceName}/${id}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        });
    }, [id]);

    return { data, loading };
  };
}

// 创建特定资源的 Hook
const useUser = createResourceHook('users');
const usePost = createResourceHook('posts');
```

---

## 四、推荐的 Hook 库

| 库 | 特点 |
|---|------|
| [ahooks](https://ahooks.js.org/) | 阿里出品，功能全面 |
| [react-use](https://github.com/streamich/react-use) | 社区流行，Hook 丰富 |
| [usehooks-ts](https://usehooks-ts.com/) | TypeScript 优先 |

---

## 五、本章小结

### 常用自定义 Hooks 速查

| Hook | 用途 |
|------|------|
| useToggle | 布尔值切换 |
| useLocalStorage | 本地存储 |
| useFetch | 数据请求 |
| useDebounce | 防抖 |
| useClickOutside | 点击外部检测 |
| useMediaQuery | 媒体查询 |

### 下一步

- [[React-09-状态管理]] - 学习状态管理方案
- [[React-11-性能优化]] - 了解 Hook 性能优化

---

#React #Hooks #自定义Hook #代码复用
