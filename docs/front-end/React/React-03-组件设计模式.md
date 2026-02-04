# React 组件设计模式

> 基础篇第 3 章：掌握组件设计的最佳实践，写出可复用、可维护的组件。

返回 [[React学习路线]] | 上一章 [[React-02-Hooks基础]] | 下一章 [[React-04-路由与导航]]

---

## 一、组件拆分原则

### 1.1 单一职责原则

每个组件只做一件事。

```jsx
// ❌ 一个组件做太多事
function UserPage() {
  // 获取用户数据
  // 渲染用户信息
  // 渲染用户文章列表
  // 处理关注/取消关注
  // ...
}

// ✅ 拆分为多个组件
function UserPage() {
  return (
    <div>
      <UserProfile userId={userId} />
      <UserArticles userId={userId} />
      <FollowButton userId={userId} />
    </div>
  );
}
```

### 1.2 何时拆分组件

- 代码超过 200-300 行
- 有明显独立的 UI 区块
- 逻辑可以被复用
- 需要独立管理状态

---

## 二、组合模式

### 2.1 children 组合

```jsx
// 容器组件
function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// 使用：灵活插入任何内容
<Card title="User Profile">
  <Avatar src={user.avatar} />
  <p>{user.bio}</p>
  <FollowButton userId={user.id} />
</Card>
```

### 2.2 插槽模式（多个 children）

```jsx
function Layout({ header, sidebar, children, footer }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}

// 使用
<Layout
  header={<NavBar />}
  sidebar={<Menu />}
  footer={<Copyright />}
>
  <ArticleContent />
</Layout>
```

### 2.3 复合组件模式

```jsx
// 定义复合组件
function Select({ children, value, onChange }) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

Select.Option = function Option({ value, children }) {
  const { value: selected, onChange } = useContext(SelectContext);
  return (
    <div 
      className={`option ${selected === value ? 'selected' : ''}`}
      onClick={() => onChange(value)}
    >
      {children}
    </div>
  );
};

// 使用：API 清晰，结构灵活
<Select value={color} onChange={setColor}>
  <Select.Option value="red">Red</Select.Option>
  <Select.Option value="blue">Blue</Select.Option>
  <Select.Option value="green">Green</Select.Option>
</Select>
```

---

## 三、受控与非受控组件

### 3.1 受控组件

组件的状态由父组件控制。

```jsx
function ControlledInput({ value, onChange }) {
  return (
    <input 
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  );
}

// 使用
function Form() {
  const [name, setName] = useState('');
  return <ControlledInput value={name} onChange={setName} />;
}
```

### 3.2 非受控组件

组件自己管理状态。

```jsx
function UncontrolledInput({ defaultValue, onSubmit }) {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    onSubmit(inputRef.current.value);
  };

  return (
    <div>
      <input ref={inputRef} defaultValue={defaultValue} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### 3.3 受控与非受控的选择

| 场景 | 推荐 |
|------|------|
| 表单验证 | 受控 |
| 实时搜索 | 受控 |
| 简单输入 | 非受控 |
| 文件上传 | 非受控 |

---

## 四、Props 设计

### 4.1 Props 命名规范

```jsx
// 布尔值：is/has/can/should 前缀
<Button isLoading={true} isDisabled={false} />

// 事件处理：on 前缀
<Button onClick={handleClick} onHover={handleHover} />

// 渲染函数：render 前缀
<List renderItem={(item) => <Item {...item} />} />

// 子元素相关
<Modal header={<Title />} footer={<Actions />} />
```

### 4.2 Props 默认值

```jsx
function Button({
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  children,
  ...rest  // 剩余 props 透传
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={isDisabled}
      {...rest}
    >
      {children}
    </button>
  );
}
```

### 4.3 Props 类型定义（TypeScript）

```typescript
interface ButtonProps {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'danger';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  isDisabled?: boolean;
  /** 是否加载中 */
  isLoading?: boolean;
  /** 点击事件 */
  onClick?: () => void;
  /** 子元素 */
  children: React.ReactNode;
}

function Button({
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  onClick,
  children,
}: ButtonProps) {
  // ...
}
```

---

## 五、状态提升

### 5.1 基本模式

```jsx
// 状态提升到共同父组件
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Display count={count} />
      <Controls onIncrement={() => setCount(c => c + 1)} />
    </div>
  );
}

function Display({ count }) {
  return <p>Count: {count}</p>;
}

function Controls({ onIncrement }) {
  return <button onClick={onIncrement}>+1</button>;
}
```

### 5.2 何时提升状态

- 多个组件需要访问同一状态
- 需要同步多个组件的状态
- 父组件需要知道子组件的状态

---

## 六、渲染 Props 模式

```jsx
// 渲染 Props：将渲染逻辑交给使用者
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return render(position);
}

// 使用
<MouseTracker 
  render={({ x, y }) => (
    <div>
      Mouse position: {x}, {y}
    </div>
  )}
/>

// 也可以用 children 作为函数
function MouseTracker({ children }) {
  // ...
  return children(position);
}

<MouseTracker>
  {({ x, y }) => <div>Position: {x}, {y}</div>}
</MouseTracker>
```

---

## 七、高阶组件（HOC）

```jsx
// 高阶组件：接收组件，返回增强后的组件
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <Spinner />;
    }
    return <WrappedComponent {...props} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);

<UserListWithLoading isLoading={loading} users={users} />
```

**注意**：现代 React 推荐使用 Hooks 替代 HOC。

---

## 八、组件组织结构

### 8.1 文件结构

```
src/
├── components/
│   ├── Button/
│   │   ├── index.ts          # 导出
│   │   ├── Button.tsx        # 组件
│   │   ├── Button.test.tsx   # 测试
│   │   └── Button.module.css # 样式
│   │
│   ├── Card/
│   │   ├── index.ts
│   │   ├── Card.tsx
│   │   └── CardHeader.tsx
│   │
│   └── index.ts              # 统一导出
│
├── hooks/                    # 自定义 Hooks
├── contexts/                 # Context
└── utils/                    # 工具函数
```

### 8.2 组件导出

```typescript
// components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';

// components/index.ts
export * from './Button';
export * from './Card';
export * from './Input';
```

---

## 九、本章小结

| 模式 | 适用场景 |
|------|----------|
| 组合模式 | 灵活的 UI 结构 |
| 受控组件 | 需要实时响应的表单 |
| 状态提升 | 多组件共享状态 |
| 渲染 Props | 复用逻辑，自定义渲染 |
| 复合组件 | API 清晰的复杂组件 |

### 下一步

- [[React-04-路由与导航]] - 学习 React Router
- [[React-08-自定义Hooks]] - 深入自定义 Hooks

---

#React #组件设计 #设计模式 #最佳实践
