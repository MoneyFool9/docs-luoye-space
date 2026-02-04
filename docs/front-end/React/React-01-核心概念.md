# React 核心概念

> 基础篇第 1 章：理解 React 的核心概念，为后续学习打下坚实基础。

返回 [[React学习路线]]

---

## 一、React 是什么

### 1.1 定义

React 是一个用于构建用户界面的 **JavaScript 库**（不是框架）。

核心特点：
- **声明式**：描述 UI 应该是什么样子，而非如何操作 DOM
- **组件化**：将 UI 拆分为独立、可复用的组件
- **单向数据流**：数据从父组件流向子组件

### 1.2 React vs 其他框架

| 特性 | React | Vue | Angular |
|------|-------|-----|---------|
| 类型 | 库 | 渐进式框架 | 完整框架 |
| 数据流 | 单向 | 双向可选 | 双向 |
| 模板 | JSX | 模板语法 | 模板语法 |
| 学习曲线 | 中等 | 较低 | 较高 |

---

## 二、JSX 详解

### 2.1 JSX 是什么

JSX 是 JavaScript 的语法扩展，允许在 JS 中编写类似 HTML 的代码。

```jsx
// JSX 代码
const element = <h1 className="title">Hello, React!</h1>;

// 编译后的 JavaScript
const element = React.createElement(
  'h1',
  { className: 'title' },
  'Hello, React!'
);
```

**本质**：JSX 是 `React.createElement()` 的语法糖。

### 2.2 JSX 语法规则

```jsx
function App() {
  const name = 'React';
  const isLoggedIn = true;
  const items = ['Apple', 'Banana', 'Orange'];

  return (
    // 规则 1：必须有一个根元素（或使用 Fragment）
    <>
      {/* 规则 2：使用 {} 嵌入 JS 表达式 */}
      <h1>Hello, {name}!</h1>
      
      {/* 规则 3：className 代替 class */}
      <div className="container">
        
        {/* 规则 4：条件渲染 */}
        {isLoggedIn && <p>Welcome back!</p>}
        {isLoggedIn ? <LogoutButton /> : <LoginButton />}
        
        {/* 规则 5：列表渲染需要 key */}
        <ul>
          {items.map((item, index) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        
        {/* 规则 6：style 使用对象 */}
        <p style={{ color: 'red', fontSize: '16px' }}>Styled text</p>
      </div>
    </>
  );
}
```

### 2.3 JSX 注意事项

| 场景 | 正确写法 | 错误写法 |
|------|----------|----------|
| CSS 类名 | `className` | `class` |
| 标签属性 | `htmlFor` | `for` |
| 内联样式 | `style={{ color: 'red' }}` | `style="color: red"` |
| 事件名 | `onClick` | `onclick` |
| 自闭合标签 | `<img />` | `<img>` |

---

## 三、组件

### 3.1 函数组件（推荐）

```jsx
// 函数组件定义
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 箭头函数形式
const Welcome = (props) => {
  return <h1>Hello, {props.name}</h1>;
};

// 使用组件
<Welcome name="Sara" />
```

### 3.2 类组件（了解）

```jsx
// 类组件定义（旧方式，了解即可）
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### 3.3 组件命名规范

```jsx
// ✅ 组件名必须大写开头
function MyComponent() { ... }

// ❌ 小写开头会被当作 HTML 标签
function myComponent() { ... }
```

---

## 四、Props（属性）

### 4.1 Props 基础

```jsx
// 父组件传递 props
function App() {
  return (
    <UserCard 
      name="John" 
      age={25} 
      isAdmin={true}
      hobbies={['reading', 'gaming']}
      onClick={() => console.log('clicked')}
    />
  );
}

// 子组件接收 props
function UserCard(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>Age: {props.age}</p>
      {props.isAdmin && <span>Admin</span>}
    </div>
  );
}

// 解构写法（推荐）
function UserCard({ name, age, isAdmin }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
}
```

### 4.2 默认 Props

```jsx
function Button({ text = 'Click me', type = 'primary' }) {
  return <button className={type}>{text}</button>;
}
```

### 4.3 children Props

```jsx
// children 是特殊的 prop，表示组件的子元素
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// 使用
<Card title="My Card">
  <p>This is the card content</p>
  <button>Action</button>
</Card>
```

### 4.4 Props 是只读的

```jsx
function Wrong({ name }) {
  // ❌ 永远不要修改 props
  name = 'New Name';
  return <h1>{name}</h1>;
}
```

---

## 五、State（状态）

### 5.1 useState Hook

```jsx
import { useState } from 'react';

function Counter() {
  // 声明状态：[当前值, 更新函数] = useState(初始值)
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
    </div>
  );
}
```

### 5.2 State 更新规则

```jsx
function Example() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: 'John', age: 25 });
  const [items, setItems] = useState([1, 2, 3]);

  // ✅ 基于前一个值更新，使用函数形式
  const increment = () => {
    setCount(prev => prev + 1);
  };

  // ✅ 更新对象，需要展开保留其他属性
  const updateAge = () => {
    setUser(prev => ({ ...prev, age: prev.age + 1 }));
  };

  // ✅ 更新数组
  const addItem = () => {
    setItems(prev => [...prev, prev.length + 1]);
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };
}
```

### 5.3 State vs Props

| 特性 | Props | State |
|------|-------|-------|
| 来源 | 父组件传入 | 组件内部声明 |
| 可变性 | 只读 | 可通过 setter 更新 |
| 用途 | 配置组件 | 管理组件内部数据 |

---

## 六、事件处理

### 6.1 基本事件处理

```jsx
function Button() {
  // 事件处理函数
  const handleClick = (e) => {
    e.preventDefault(); // 阻止默认行为
    console.log('Button clicked');
  };

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}
```

### 6.2 传递参数

```jsx
function ItemList() {
  const items = ['A', 'B', 'C'];

  const handleItemClick = (item, index) => {
    console.log(`Clicked ${item} at index ${index}`);
  };

  return (
    <ul>
      {items.map((item, index) => (
        <li 
          key={item}
          onClick={() => handleItemClick(item, index)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

### 6.3 常用事件

| 事件 | 触发时机 |
|------|----------|
| `onClick` | 点击 |
| `onChange` | 值改变（输入框） |
| `onSubmit` | 表单提交 |
| `onFocus` / `onBlur` | 获得/失去焦点 |
| `onMouseEnter` / `onMouseLeave` | 鼠标进入/离开 |
| `onKeyDown` / `onKeyUp` | 键盘按下/抬起 |

---

## 七、条件渲染

### 7.1 几种方式对比

```jsx
function ConditionalRendering({ isLoggedIn, role, notifications }) {
  return (
    <div>
      {/* 方式 1：&& 短路运算（适合"有就显示"） */}
      {isLoggedIn && <UserProfile />}
      
      {/* 方式 2：三元运算符（适合二选一） */}
      {isLoggedIn ? <LogoutButton /> : <LoginButton />}
      
      {/* 方式 3：提前返回（适合复杂条件） */}
      {(() => {
        if (role === 'admin') return <AdminPanel />;
        if (role === 'user') return <UserPanel />;
        return <GuestPanel />;
      })()}
      
      {/* 方式 4：对象映射（适合多分支） */}
      {{
        admin: <AdminPanel />,
        user: <UserPanel />,
        guest: <GuestPanel />,
      }[role]}
    </div>
  );
}
```

### 7.2 避免 && 的陷阱

```jsx
// ❌ 当 count 为 0 时，会渲染 "0"
{count && <p>Count: {count}</p>}

// ✅ 明确转为布尔值
{count > 0 && <p>Count: {count}</p>}
{!!count && <p>Count: {count}</p>}
{Boolean(count) && <p>Count: {count}</p>}
```

---

## 八、列表渲染

### 8.1 基本列表渲染

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

### 8.2 Key 的重要性

```jsx
// ✅ 使用唯一且稳定的 id
{items.map(item => <Item key={item.id} {...item} />)}

// ⚠️ 没有 id 时，使用 index（不推荐，除非列表不会变化）
{items.map((item, index) => <Item key={index} {...item} />)}

// ❌ 不要使用随机值
{items.map(item => <Item key={Math.random()} {...item} />)}
```

**Key 的作用**：帮助 React 识别哪些元素发生了变化，优化渲染性能。

---

## 九、本章小结

### 核心概念回顾

| 概念 | 说明 |
|------|------|
| JSX | `React.createElement` 的语法糖 |
| 组件 | UI 的独立可复用单元 |
| Props | 父传子的只读数据 |
| State | 组件内部可变数据 |
| 事件 | 用户交互的响应 |

### 下一步

- [[React-02-Hooks基础]] - 深入学习 React Hooks

---

## 练习题

1. 创建一个计数器组件，包含 +1、-1、重置按钮
2. 创建一个 TodoList，支持添加、删除、标记完成
3. 创建一个用户卡片组件，接收用户信息作为 props

---

#React #基础 #JSX #组件 #Props #State
