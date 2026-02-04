# React 状态管理

> 进阶篇第 3 章：掌握 React 状态管理方案，从 Context 到专业状态库。

返回 [[React学习路线]] | 上一章 [[React-08-自定义Hooks]] | 下一章 [[React-10-TypeScript实战]]

---

## 一、状态管理概述

### 1.1 何时需要状态管理

- 多个组件共享状态
- 状态需要跨层级传递
- 复杂的状态更新逻辑
- 需要状态持久化或同步

### 1.2 方案对比

| 方案 | 复杂度 | 适用场景 | 特点 |
|------|:------:|----------|------|
| useState | ⭐ | 组件内状态 | 最简单 |
| Context | ⭐⭐ | 跨组件共享 | 内置方案 |
| Zustand | ⭐⭐ | 中小型应用 | 简洁、轻量 |
| Jotai | ⭐⭐ | 原子化状态 | 细粒度更新 |
| Redux Toolkit | ⭐⭐⭐ | 大型应用 | 生态完善 |

---

## 二、Context 进阶

### 2.1 Context + useReducer

```jsx
// contexts/CartContext.jsx
import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const initialState = { items: [], total: 0 };

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        items: [...state.items, action.payload],
        total: state.total + action.payload.price,
      };
    case 'REMOVE_ITEM':
      const item = state.items.find(i => i.id === action.payload);
      return {
        items: state.items.filter(i => i.id !== action.payload),
        total: state.total - (item?.price || 0),
      };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
```

### 2.2 Context 性能优化

```jsx
// 拆分 Context 避免不必要的重渲染
const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

// 只需要状态的组件
export function useCartState() {
  return useContext(CartStateContext);
}

// 只需要 dispatch 的组件
export function useCartDispatch() {
  return useContext(CartDispatchContext);
}
```

---

## 三、Zustand（推荐）

### 3.1 基本用法

```jsx
import { create } from 'zustand';

// 创建 store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// 使用
function Counter() {
  const { count, increment, decrement } = useStore();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// 选择性订阅（性能优化）
function Display() {
  const count = useStore((state) => state.count);
  return <p>{count}</p>;
}
```

### 3.2 异步操作

```jsx
const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  
  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 3.3 持久化

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage', // localStorage key
    }
  )
);
```

---

## 四、Jotai

### 4.1 原子化状态

```jsx
import { atom, useAtom } from 'jotai';

// 创建原子
const countAtom = atom(0);
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 使用
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubleCount] = useAtom(doubleCountAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

### 4.2 异步原子

```jsx
const userAtom = atom(async () => {
  const response = await fetch('/api/user');
  return response.json();
});

function User() {
  const [user] = useAtom(userAtom);
  return <p>{user.name}</p>;
}
```

---

## 五、Redux Toolkit

### 5.1 创建 Slice

```jsx
// store/slices/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

### 5.2 配置 Store

```jsx
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// App.jsx
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

### 5.3 使用 Hooks

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './store/slices/counterSlice';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
```

---

## 六、方案选择建议

| 场景 | 推荐方案 |
|------|----------|
| 简单共享状态 | Context |
| 中小型应用 | **Zustand**（首选） |
| 细粒度状态 | Jotai |
| 大型应用/团队协作 | Redux Toolkit |
| 服务端状态 | React Query / SWR |

### 下一步

- [[React-10-TypeScript实战]] - TypeScript 类型化状态管理
- [[React-11-性能优化]] - 状态管理的性能优化

---

#React #状态管理 #Zustand #Redux #Jotai
