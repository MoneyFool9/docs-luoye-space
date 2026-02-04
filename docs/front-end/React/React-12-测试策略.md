# React 测试策略

> 进阶篇第 6 章：掌握 React 应用的测试方法。

返回 [[React学习路线]] | 上一章 [[React-11-性能优化]] | 下一章 [[React-13-源码解析]]

---

## 一、测试类型

| 类型 | 范围 | 工具 | 执行速度 |
|------|------|------|:--------:|
| 单元测试 | 函数、Hook | Jest | 快 |
| 组件测试 | 单个组件 | Testing Library | 中 |
| 集成测试 | 多组件交互 | Testing Library | 中 |
| E2E 测试 | 完整流程 | Playwright/Cypress | 慢 |

---

## 二、Jest + Testing Library

### 2.1 安装

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### 2.2 组件测试

```jsx
// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2.3 测试 Hooks

```jsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments counter', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(6);
  });
});
```

### 2.4 异步测试

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';

it('loads and displays user', async () => {
  render(<UserProfile userId="1" />);
  
  // 等待加载完成
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

---

## 三、常用查询方法

| 方法 | 用途 |
|------|------|
| `getByRole` | 按角色查询（推荐） |
| `getByText` | 按文本内容 |
| `getByLabelText` | 按表单标签 |
| `getByPlaceholderText` | 按占位符 |
| `getByTestId` | 按 data-testid |

```jsx
// 推荐优先级
screen.getByRole('button', { name: /submit/i });  // 最推荐
screen.getByLabelText('Email');                    // 表单元素
screen.getByText('Welcome');                       // 静态文本
screen.getByTestId('custom-element');              // 最后选择
```

---

## 四、Mock

### 4.1 Mock 函数

```jsx
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: 'test' });
```

### 4.2 Mock 模块

```jsx
// 模拟 API 模块
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ name: 'John' }),
}));
```

---

## 五、E2E 测试 (Playwright)

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

---

## 六、测试最佳实践

1. **测试行为，而非实现**
2. **使用 `getByRole` 优先**
3. **避免测试实现细节**
4. **保持测试独立**
5. **合理的测试覆盖率（70-80%）**

### 下一步

- [[React-13-源码解析]] - 进入专家篇

---

#React #测试 #Jest #TestingLibrary
