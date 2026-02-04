# React 样式方案

> 基础篇第 6 章：了解 React 中的各种样式方案及其选择。

返回 [[React学习路线]] | 上一章 [[React-05-表单处理]] | 下一章 [[React-07-Hooks进阶]]

---

## 一、方案概览

| 方案 | 特点 | 推荐度 |
|------|------|:------:|
| **Tailwind CSS** | 原子化、开发快 | ⭐⭐⭐⭐⭐ |
| **CSS Modules** | 作用域隔离、零运行时 | ⭐⭐⭐⭐ |
| **CSS-in-JS** | 动态样式、组件绑定 | ⭐⭐⭐ |
| **内联样式** | 简单直接 | ⭐⭐ |
| **全局 CSS** | 传统方式 | ⭐⭐ |

---

## 二、Tailwind CSS（推荐）

### 2.1 基本用法

```jsx
function Button({ variant = 'primary', children }) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  };

  return (
    <button className={`px-4 py-2 rounded-md font-medium ${variants[variant]}`}>
      {children}
    </button>
  );
}
```

### 2.2 条件类名

```jsx
// 使用 clsx 或 classnames 库
import clsx from 'clsx';

function Button({ isActive, isDisabled, children }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-md',
        isActive && 'bg-blue-500 text-white',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isActive && !isDisabled && 'bg-gray-200 hover:bg-gray-300'
      )}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}
```

> 详细配置参考 [[设计系统-02-Tailwind-CSS设计哲学与深度定制]]

---

## 三、CSS Modules

### 3.1 基本用法

```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.primary:hover {
  background-color: #2563eb;
}
```

```jsx
import styles from './Button.module.css';

function Button({ variant = 'primary', children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

### 3.2 组合类名

```jsx
import styles from './Card.module.css';
import clsx from 'clsx';

function Card({ isHighlighted, children }) {
  return (
    <div className={clsx(styles.card, isHighlighted && styles.highlighted)}>
      {children}
    </div>
  );
}
```

---

## 四、CSS-in-JS

### 4.1 styled-components

```jsx
import styled from 'styled-components';

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  background-color: ${props => props.primary ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.primary ? 'white' : '#374151'};
  
  &:hover {
    background-color: ${props => props.primary ? '#2563eb' : '#d1d5db'};
  }
`;

// 使用
<Button primary>Primary</Button>
<Button>Secondary</Button>
```

### 4.2 Emotion

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const buttonStyle = css`
  padding: 8px 16px;
  border-radius: 6px;
`;

function Button({ children }) {
  return <button css={buttonStyle}>{children}</button>;
}
```

---

## 五、方案选择建议

| 场景 | 推荐方案 |
|------|----------|
| 新项目 | Tailwind CSS |
| 需要 shadcn/ui | Tailwind CSS |
| 复杂动态样式 | CSS-in-JS |
| 需要零运行时 | CSS Modules |
| 简单项目 | CSS Modules |

### 下一步

- [[React-07-Hooks进阶]] - 进入进阶篇
- [[设计系统-03-技术选型对比与取舍]] - 深入了解技术选型

---

#React #CSS #Tailwind #样式
