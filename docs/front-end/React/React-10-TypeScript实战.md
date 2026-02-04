# React TypeScript 实战

> 进阶篇第 4 章：掌握 TypeScript 在 React 中的应用。

返回 [[React学习路线]] | 上一章 [[React-09-状态管理]] | 下一章 [[React-11-性能优化]]

---

## 一、组件类型定义

### 1.1 函数组件

```typescript
// 基本组件
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// 使用 FC（可选，不强制）
const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

### 1.2 Props 类型技巧

```typescript
// children 类型
interface Props {
  children: React.ReactNode;      // 任意内容
  children: React.ReactElement;   // 必须是 React 元素
  children: string;               // 只能是字符串
}

// 扩展原生属性
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

// 组合类型
type ButtonProps = {
  variant?: 'primary' | 'secondary';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```

### 1.3 泛型组件

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}

// 使用
<List
  items={[{ id: 1, name: 'Alice' }]}
  renderItem={(item) => <li key={item.id}>{item.name}</li>}
/>
```

---

## 二、Hooks 类型

### 2.1 useState

```typescript
// 自动推断
const [count, setCount] = useState(0);

// 显式指定
const [user, setUser] = useState<User | null>(null);

// 联合类型
type Status = 'idle' | 'loading' | 'success' | 'error';
const [status, setStatus] = useState<Status>('idle');
```

### 2.2 useReducer

```typescript
interface State {
  count: number;
  error: string | null;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setError'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'setError':
      return { ...state, error: action.payload };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0, error: null });
```

### 2.3 useRef

```typescript
// DOM 引用
const inputRef = useRef<HTMLInputElement>(null);

// 可变值
const timerRef = useRef<number | null>(null);
```

### 2.4 useContext

```typescript
interface AuthContext {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContext | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 三、事件类型

```typescript
// 常用事件类型
function Form() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {};

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

---

## 四、常用类型速查

| 类型 | 用途 |
|------|------|
| `React.ReactNode` | 任何可渲染内容 |
| `React.ReactElement` | JSX 元素 |
| `React.FC<Props>` | 函数组件类型 |
| `React.CSSProperties` | style 对象 |
| `React.MouseEvent<T>` | 鼠标事件 |
| `React.ChangeEvent<T>` | 输入变化事件 |
| `React.FormEvent<T>` | 表单事件 |

---

## 五、实用技巧

### 5.1 组件 Props 提取

```typescript
// 提取组件的 props 类型
type ButtonProps = React.ComponentProps<typeof Button>;
type InputProps = React.ComponentProps<'input'>;
```

### 5.2 Omit 和 Pick

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 排除某些属性
type PublicUser = Omit<User, 'password'>;

// 选取某些属性
type UserCredentials = Pick<User, 'email' | 'password'>;
```

### 下一步

- [[React-11-性能优化]] - 学习性能优化
- [[React-12-测试策略]] - 学习测试

---

#React #TypeScript #类型系统
