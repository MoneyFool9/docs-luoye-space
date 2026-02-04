# React 性能优化

> 进阶篇第 5 章：掌握 React 性能优化的核心策略。

返回 [[React学习路线]] | 上一章 [[React-10-TypeScript实战]] | 下一章 [[React-12-测试策略]]

---

## 一、渲染优化

### 1.1 React.memo

```jsx
// 避免不必要的重渲染
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // 只有 data 变化时才重渲染
  return <div>{/* ... */}</div>;
});

// 自定义比较函数
const Component = React.memo(
  function Component({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 1.2 useMemo 和 useCallback

```jsx
function Parent({ items }) {
  // 缓存计算结果
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.value - b.value);
  }, [items]);

  // 缓存函数引用
  const handleClick = useCallback((id) => {
    console.log(id);
  }, []);

  return <List items={sortedItems} onClick={handleClick} />;
}
```

### 1.3 避免的陷阱

```jsx
// ❌ 内联对象每次渲染都是新引用
<Child style={{ color: 'red' }} />

// ✅ 提取到组件外或使用 useMemo
const style = { color: 'red' };
<Child style={style} />

// ❌ 内联函数
<Child onClick={() => handleClick(id)} />

// ✅ 使用 useCallback
const onClick = useCallback(() => handleClick(id), [id]);
<Child onClick={onClick} />
```

---

## 二、代码分割

### 2.1 React.lazy

```jsx
import { lazy, Suspense } from 'react';

// 懒加载组件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 2.2 动态导入

```jsx
function loadComponent(name) {
  return lazy(() => import(`./components/${name}`));
}
```

---

## 三、列表优化

### 3.1 虚拟列表

```jsx
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  );

  return (
    <FixedSizeList
      height={400}
      width="100%"
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 3.2 Key 的正确使用

```jsx
// ✅ 使用稳定的唯一 ID
{items.map(item => <Item key={item.id} {...item} />)}

// ❌ 避免使用 index（除非列表不变）
{items.map((item, index) => <Item key={index} {...item} />)}
```

---

## 四、状态优化

### 4.1 状态下沉

```jsx
// ❌ 状态放太高，整个组件树重渲染
function Parent() {
  const [inputValue, setInputValue] = useState('');
  return (
    <div>
      <ExpensiveComponent />
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
    </div>
  );
}

// ✅ 状态下沉到需要的地方
function Parent() {
  return (
    <div>
      <ExpensiveComponent />
      <SearchInput />
    </div>
  );
}

function SearchInput() {
  const [inputValue, setInputValue] = useState('');
  return <input value={inputValue} onChange={e => setInputValue(e.target.value)} />;
}
```

### 4.2 状态合并

```jsx
// ❌ 多个相关状态分开管理
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');

// ✅ 合并为一个对象
const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
```

---

## 五、性能分析工具

### 5.1 React DevTools Profiler

1. 安装 React DevTools 浏览器扩展
2. 打开 Profiler 标签
3. 点击录制，操作应用
4. 分析组件渲染时间和原因

### 5.2 useDebugValue

```jsx
function useCustomHook(value) {
  useDebugValue(value ? 'Online' : 'Offline');
  // ...
}
```

---

## 六、优化清单

| 策略 | 适用场景 |
|------|----------|
| React.memo | 纯展示组件 |
| useMemo | 昂贵计算 |
| useCallback | 传递给子组件的函数 |
| lazy + Suspense | 路由级别代码分割 |
| 虚拟列表 | 长列表（>100 项） |
| 状态下沉 | 局部状态 |

### 下一步

- [[React-12-测试策略]] - 学习测试
- [[React-14-并发模式]] - 了解并发特性优化

---

#React #性能优化 #React.memo #代码分割
