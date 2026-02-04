# React 源码解析

> 专家篇第 1 章：深入理解 React 的核心原理与实现。

返回 [[React学习路线]] | 上一章 [[React-12-测试策略]] | 下一章 [[React-14-并发模式]]

---

## 一、React 架构演进

### 1.1 Stack Reconciler (React 15)

- **同步递归**：一旦开始就无法中断
- **问题**：长任务会阻塞主线程，导致卡顿

### 1.2 Fiber Reconciler (React 16+)

- **可中断**：将渲染工作分片
- **优先级调度**：高优先级任务优先执行
- **增量渲染**：利用浏览器空闲时间

---

## 二、Fiber 架构

### 2.1 Fiber 节点结构

```javascript
// 简化的 Fiber 节点
const fiber = {
  // 静态结构
  tag: FunctionComponent,    // 组件类型
  type: App,                 // 组件函数/类
  key: null,
  
  // 树结构
  return: parentFiber,       // 父节点
  child: childFiber,         // 第一个子节点
  sibling: siblingFiber,     // 兄弟节点
  
  // 状态
  memoizedState: null,       // Hook 链表
  memoizedProps: {},         // 上次渲染的 props
  
  // 副作用
  flags: Placement,          // 副作用标记
  
  // 调度
  lanes: DefaultLane,        // 优先级
};
```

### 2.2 双缓冲机制

```
Current Fiber Tree          WorkInProgress Fiber Tree
(当前显示的)                  (正在构建的)
     │                              │
     │         构建完成后            │
     │      ─────────────►          │
     │         指针切换              │
     ▼                              ▼
  屏幕显示                      成为新的 Current
```

---

## 三、Reconciliation（协调）

### 3.1 Diff 算法策略

1. **同层比较**：只比较同一层级的节点
2. **类型优先**：类型不同直接替换整棵子树
3. **Key 标识**：通过 key 识别节点移动

### 3.2 Diff 过程

```jsx
// 单节点 Diff
if (key 相同 && type 相同) {
  复用 Fiber;
} else {
  创建新 Fiber;
}

// 多节点 Diff（两轮遍历）
// 第一轮：处理更新的节点
// 第二轮：处理新增/删除/移动的节点
```

---

## 四、Hooks 原理

### 4.1 Hook 链表

```javascript
// 每个函数组件的 Fiber 上有一个 Hook 链表
fiber.memoizedState = {
  memoizedState: 0,          // useState 的值
  next: {                    // 下一个 Hook
    memoizedState: effect,   // useEffect 的 effect
    next: null,
  },
};
```

### 4.2 为什么 Hook 不能条件调用

```javascript
// React 通过调用顺序来匹配 Hook
// 第一次渲染：Hook1 → Hook2 → Hook3
// 第二次渲染：Hook1 → Hook2 → Hook3  ✅ 顺序一致

// 如果条件调用：
// 第一次渲染：Hook1 → Hook2 → Hook3
// 第二次渲染：Hook1 → Hook3  ❌ 顺序不一致，Hook 错位
```

---

## 五、调度器（Scheduler）

### 5.1 优先级

| 优先级 | 场景 |
|--------|------|
| 同步 | ReactDOM.flushSync |
| 用户阻塞 | 点击、输入 |
| 普通 | 数据请求 |
| 低优先级 | Suspense |
| 空闲 | offscreen |

### 5.2 时间切片

```javascript
// 简化的工作循环
function workLoop(deadline) {
  while (workInProgress && deadline.timeRemaining() > 0) {
    workInProgress = performUnitOfWork(workInProgress);
  }
  
  if (workInProgress) {
    // 还有工作，请求下一次调度
    requestIdleCallback(workLoop);
  }
}
```

---

## 六、渲染流程

```
触发更新
    │
    ▼
Scheduler（调度器）
    │ 选择优先级
    ▼
Reconciler（协调器）
    │ 构建 Fiber 树
    │ 标记副作用
    ▼
Renderer（渲染器）
    │ 执行 DOM 操作
    ▼
完成渲染
```

---

## 七、学习资源

- [React 技术揭秘](https://react.iamkasong.com/)
- [React 源码](https://github.com/facebook/react)
- 《React 设计原理》- 卡颂

### 下一步

- [[React-14-并发模式]] - 学习并发特性

---

#React #源码 #Fiber #Reconciliation
