# React Hooks 进阶

> 进阶篇第 1 章：掌握高级 Hooks，深入理解其原理和使用场景。

返回 [[React学习路线]] | 上一章 [[React-06-样式方案]] | 下一章 [[React-08-自定义Hooks]]

---

## 一、useReducer

### 1.1 基本用法

```jsx
import { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initialState;
    default:
      throw new Error('Unknown action');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

### 1.2 复杂状态管理

```jsx
const initialState = {
  items: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    default:
      return state;
  }
}
```

### 1.3 useState vs useReducer

| 场景 | 推荐 |
|------|------|
| 单一值 | useState |
| 多个相关状态 | useReducer |
| 复杂更新逻辑 | useReducer |
| 下一个状态依赖前一个 | useReducer |

---

## 二、useMemo

### 2.1 缓存计算结果

```jsx
import { useMemo, useState } from 'react';

function ExpensiveComponent({ list, filter }) {
  // 仅当 list 或 filter 变化时才重新计算
  const filteredList = useMemo(() => {
    console.log('Filtering...');
    return list.filter(item => item.name.includes(filter));
  }, [list, filter]);

  return (
    <ul>
      {filteredList.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

### 2.2 避免不必要的重渲染

```jsx
function Parent({ data }) {
  // 缓存配置对象，避免每次渲染都创建新对象
  const config = useMemo(() => ({
    columns: ['name', 'age', 'email'],
    sortable: true,
    pageSize: 10,
  }), []);

  return <Table data={data} config={config} />;
}
```

### 2.3 何时使用 useMemo

```jsx
// ✅ 适用：昂贵的计算
const sorted = useMemo(() => items.sort((a, b) => a.value - b.value), [items]);

// ✅ 适用：避免子组件重渲染（配合 React.memo）
const memoizedValue = useMemo(() => ({ id, name }), [id, name]);

// ❌ 不需要：简单计算
const doubled = useMemo(() => count * 2, [count]); // 过度优化
```

---

## 三、useCallback

### 3.1 缓存函数引用

```jsx
import { useCallback, useState } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  // 不使用 useCallback：每次渲染创建新函数
  // const handleClick = () => setCount(c => c + 1);

  // 使用 useCallback：函数引用稳定
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <MemoizedChild onClick={handleClick} />;
}

const MemoizedChild = React.memo(function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
```

### 3.2 配合依赖使用

```jsx
function SearchComponent({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
```

### 3.3 useMemo vs useCallback

```jsx
// 这两个是等价的
const memoizedFn = useCallback(() => doSomething(a, b), [a, b]);
const memoizedFn = useMemo(() => () => doSomething(a, b), [a, b]);

// useCallback 是 useMemo 的语法糖，专门用于缓存函数
```

---

## 四、useLayoutEffect

### 4.1 与 useEffect 的区别

```jsx
import { useEffect, useLayoutEffect, useState, useRef } from 'react';

function Tooltip() {
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const ref = useRef(null);

  // useEffect: 浏览器绑制后异步执行（可能闪烁）
  useEffect(() => {
    setTooltipHeight(ref.current.getBoundingClientRect().height);
  }, []);

  // useLayoutEffect: DOM 更新后、浏览器绑制前同步执行（无闪烁）
  useLayoutEffect(() => {
    setTooltipHeight(ref.current.getBoundingClientRect().height);
  }, []);

  return <div ref={ref}>...</div>;
}
```

### 4.2 使用场景

| Hook | 执行时机 | 适用场景 |
|------|----------|----------|
| useEffect | 绘制后异步 | 数据获取、订阅、日志 |
| useLayoutEffect | 绘制前同步 | DOM 测量、同步更新 |

---

## 五、useId

### 5.1 生成唯一 ID

```jsx
import { useId } from 'react';

function FormField({ label }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}

// 多个关联 ID
function Form() {
  const id = useId();

  return (
    <form>
      <label htmlFor={`${id}-name`}>Name</label>
      <input id={`${id}-name`} />
      
      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} />
    </form>
  );
}
```

---

## 六、useImperativeHandle

### 6.1 暴露自定义方法

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    getValue: () => inputRef.current.value,
  }));

  return <input ref={inputRef} {...props} />;
});

// 父组件使用
function Parent() {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.focus();
    inputRef.current.clear();
  };

  return (
    <div>
      <FancyInput ref={inputRef} />
      <button onClick={handleClick}>Focus & Clear</button>
    </div>
  );
}
```

---

## 七、本章小结

| Hook | 用途 |
|------|------|
| useReducer | 复杂状态逻辑 |
| useMemo | 缓存计算结果 |
| useCallback | 缓存函数引用 |
| useLayoutEffect | DOM 测量、同步更新 |
| useId | 生成唯一 ID |
| useImperativeHandle | 暴露组件方法 |

### 性能优化组合

```jsx
// React.memo + useCallback + useMemo 配合使用
const Parent = () => {
  const data = useMemo(() => processData(rawData), [rawData]);
  const handleClick = useCallback(() => doSomething(id), [id]);
  
  return <MemoizedChild data={data} onClick={handleClick} />;
};
```

### 下一步

- [[React-08-自定义Hooks]] - 学习自定义 Hook 设计
- [[React-11-性能优化]] - 深入性能优化

---

#React #Hooks #useReducer #useMemo #useCallback #性能优化
