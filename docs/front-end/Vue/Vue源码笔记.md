# 从 Vue Reactivity 到 Signals：前端响应式系统的本质与未来

> 当我们在 Vue 中写下 `ref(0)` 的那一刻，一个精密的依赖追踪系统便悄然运转。而当整个前端生态不约而同地走向 Signals 时，我们不禁要问：响应式的本质到底是什么？这篇文章将从 Vue3 的响应式源码出发，结合 Signals 的核心思想与 TC39 提案，带你深入理解前端响应式系统的过去、现在与未来。

---

## 一、响应式的本质：一个被低估的计算机科学问题

在正式聊代码之前，我想先谈一个更根本的问题——**什么是响应式？**

Ryan Carniato（SolidJS 作者）给出了一个精炼的定义：

> A declarative programming model for updating based on changes to state.
> 一种基于状态变化进行更新的声明式编程模型。

这看起来很简单，但它背后隐藏着一个深刻的计算机科学问题：**状态同步（State Synchronization）**。

想象一个电子表格：当你修改 A1 单元格的值时，所有依赖 A1 的公式单元格都会自动重新计算。这正是响应式的原型——事实上，响应式编程的根源可以追溯到 1960 年代的研究，甚至比 JavaScript 本身还要古老。

在前端开发中，这个问题的表现形式是：**数据变了，UI 怎么高效更新？**

不同的框架给出了不同的解答：

| 策略 | 代表 | 核心思想 |
|------|------|----------|
| 脏检查（Dirty Checking） | AngularJS | 不知道什么变了，全部检查一遍 |
| 不可变数据 + Virtual DOM diff | React | 不关心什么变了，通过 diff 算出最小更新 |
| 细粒度响应式（Fine-Grained Reactivity） | Vue / Solid / Svelte | 精确知道什么变了，直接更新对应的地方 |

Vue 和 Signals 都属于第三种——**细粒度响应式**。它们的核心哲学是相通的：**与其在变化发生后去"找"差异，不如在变化发生时就"知道"该更新什么。**

---

## 二、Vue3 响应式的内核：Proxy、Track 与 Trigger

### 2.1 从 defineProperty 到 Proxy——拦截策略的进化

Vue2 使用 `Object.defineProperty` 劫持每个属性的 getter/setter，这带来了众所周知的限制：

- 无法检测属性的新增和删除
- 数组索引和 length 变化无法追踪
- 需要递归遍历对象，初始化性能开销大

Vue3 果断切换到 `Proxy`，这不仅是 API 层面的升级，更是**拦截策略从"逐个盯梢"到"全面监控"的范式转换**：

```javascript
// Vue2 的方式：逐一劫持（像给每扇门装监控）
Object.defineProperty(obj, 'name', {
  get() { /* track */ },
  set(newVal) { /* trigger */ }
})

// Vue3 的方式：代理整个对象（像在大楼入口设置门禁）
new Proxy(obj, {
  get(target, key, receiver) { /* track */ },
  set(target, key, value, receiver) { /* trigger */ }
})
```

这个看似简单的变化带来了深远影响：

1. **惰性代理（Lazy Proxy）**：只有被访问到的嵌套对象才会被包装为响应式——这就是为什么 `reactive` 的深层嵌套不会有初始化性能问题
2. **全面拦截**：`has`、`deleteProperty`、`ownKeys` 等操作都能被捕获，`for...in`、`in` 操作符、`Object.keys()` 都能触发追踪
3. **集合类型支持**：`Map`、`Set`、`WeakMap`、`WeakSet` 都有了原生的响应式支持

### 2.2 Effect——响应式系统的心脏

如果说 `Proxy` 是响应式系统的眼睛（感知变化），那 `ReactiveEffect` 就是它的心脏（驱动更新）。

直接看 Vue3 源码中 `ReactiveEffect` 的核心：

```typescript
export class ReactiveEffect<T = any> implements Subscriber {
  deps?: Link = undefined
  depsTail?: Link = undefined
  flags: EffectFlags = EffectFlags.ACTIVE | EffectFlags.TRACKING

  constructor(public fn: () => T) {
    if (activeEffectScope && activeEffectScope.active) {
      activeEffectScope.effects.push(this)
    }
  }

  run(): T {
    this.flags |= EffectFlags.RUNNING
    cleanupEffect(this)
    prepareDeps(this)
    const prevEffect = activeSub
    const prevShouldTrack = shouldTrack
    activeSub = this        // 关键：将自己设为「当前活跃订阅者」
    shouldTrack = true

    try {
      return this.fn()      // 执行副作用函数，期间所有被读取的信号都会追踪到 this
    } finally {
      cleanupDeps(this)
      activeSub = prevEffect
      shouldTrack = prevShouldTrack
      this.flags &= ~EffectFlags.RUNNING
    }
  }
}
```

**这段代码里有一个极其精妙的设计模式——全局变量 `activeSub` 充当"暗号"。** 当 Effect 执行 `fn()` 时，它先把自己挂在全局的 `activeSub` 上。当 `fn()` 内部读取任何响应式数据时，Proxy 的 get trap 会检查 `activeSub`，发现"哦，现在有人在监听我"，于是将当前 Effect 登记为自己的订阅者。

这就是自动依赖收集的全部秘密：**没有显式的声明，没有依赖数组，仅凭执行时的读取行为来建立依赖关系。**

### 2.3 依赖关系的数据结构——双向链表

Vue3 最新版本中，依赖关系使用**双向链表（Doubly Linked List）** 来管理，而不是早期版本中的 `Set`：

```
Signal(Dep)                    Subscriber(Effect)
  ┌──────────┐                  ┌──────────┐
  │  subs ───┼─── Link ◄──────►│  deps    │
  │          │    ┌────────┐    │          │
  │          │    │prevSub │    │          │
  │          │    │nextSub │    │          │
  │          │    │prevDep │    │          │
  │          │    │nextDep │    │          │
  │          │    │version │    │          │
  └──────────┘    └────────┘    └──────────┘
```

每个 `Link` 节点同时存在于两条链表中：
- **横向**（nextDep/prevDep）：一个 Effect 的所有依赖
- **纵向**（nextSub/prevSub）：一个 Dep 的所有订阅者

这种设计比 `Set` 有两个关键优势：
1. **O(1) 的增删操作**，不需要哈希计算
2. **版本号比对**：每个 Link 记录 `version`，可以快速判断依赖是否还有效，避免重复收集

源码中的 `prepareDeps` 和 `cleanupDeps` 正是利用版本号来实现**精确的依赖清理**——每次 Effect 重新执行时，先给所有旧依赖标记 `version = -1`，执行过程中被重新读取的依赖会恢复版本号，执行结束后仍然是 `-1` 的依赖就是"过期的"，直接移除。

```typescript
function prepareDeps(sub: Subscriber) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1                    // 标记为"待确认"
    link.prevActiveLink = link.dep.activeLink
    link.dep.activeLink = link
  }
}

function cleanupDeps(sub: Subscriber) {
  let head
  let tail = sub.depsTail
  let link = tail
  while (link) {
    const prev = link.prevDep
    if (link.version === -1) {           // 未被重新读取——移除
      if (link === tail) tail = prev
      removeSub(link)
      removeDep(link)
    } else {
      head = link
    }
    link.dep.activeLink = link.prevActiveLink
    link.prevActiveLink = undefined
    link = prev
  }
  sub.deps = head
  sub.depsTail = tail
}
```

**这是一个非常深刻的设计取舍**：依赖关系不是静态的，它随着每次执行动态变化。比如一个条件分支：

```javascript
const displayName = computed(() => {
  if (!showFullName.value) return firstName.value
  return `${firstName.value} ${lastName.value}`
})
```

当 `showFullName` 从 `true` 变为 `false` 时，`lastName` 应该从 `displayName` 的依赖中移除。否则 `lastName` 变化时，`displayName` 会做一次无意义的重算。

这种**动态依赖追踪**是细粒度响应式系统的标志性特征，也是它优于"声明依赖数组"方案的核心优势。React Hooks 的 `useEffect` 需要你手动写依赖数组，不仅容易出错，还做不到运行时的动态依赖收集。

### 2.4 ref vs reactive——两条路径的统一

Vue3 提供了两个创建响应式数据的 API：

```javascript
const count = ref(0)             // 基于 getter/setter 的包装器
const state = reactive({ x: 1 }) // 基于 Proxy 的深度代理
```

这不是冗余设计，而是对**不同数据粒度**的精准回应：

- **`ref`** 解决的是「原始值无法被 Proxy」的问题。JavaScript 的 Proxy 只能代理对象，而 `number`、`string` 等原始类型不行。`ref` 的方案是将原始值包装在 `{ value: T }` 对象中，通过 `value` 的 getter/setter 来实现追踪。这也是为什么你总要写 `.value`。
- **`reactive`** 则直接用 Proxy 包装对象，访问任何层级的属性都能被追踪。

有趣的是，`ref` 包装对象类型时，内部其实调用了 `reactive`：

```javascript
// ref 的简化逻辑
class RefImpl<T> {
  private _value: T
  constructor(value: T) {
    this._value = isObject(value) ? reactive(value) : value
  }
  get value() {
    track(this, 'get', 'value')
    return this._value
  }
  set value(newVal) {
    if (hasChanged(newVal, this._value)) {
      this._value = isObject(newVal) ? reactive(newVal) : newVal
      trigger(this, 'set', 'value')
    }
  }
}
```

**这种设计体现了一个重要的工程思维：提供统一的心智模型，但在底层根据数据特征选择最优实现。**

### 2.5 watchEffect——响应式的 Effect 消费者

Vue 的 `watchEffect` 是对底层 `ReactiveEffect` 最直接的上层封装：

```javascript
watchEffect(() => {
  // 函数体中读取的所有响应式数据，都会被自动追踪
  // 任何一个依赖变化，这个函数就会重新执行
  console.log(temp.value, height.value)
})
```

**它的行为和 Solid 的 `createEffect` 以及 Preact Signals 的 `effect` 几乎一模一样。** 这不是巧合——因为它们解决的是同一个问题，采用的是同一套算法。

---

## 三、Signals——响应式的"公约数"

### 3.1 什么是 Signal？

如果把各个框架的响应式实现做一次"最大公约数"提取，你会得到三个核心原语（Primitives）：

| 原语 | 职责 | Vue3 | SolidJS | Preact | Angular | TC39 提案 |
|------|------|------|---------|--------|---------|-----------|
| **State Signal** | 存储可变状态 | `ref()` / `reactive()` | `createSignal()` | `signal()` | `signal()` | `Signal.State` |
| **Computed/Derivation** | 派生计算（缓存） | `computed()` | `createMemo()` | `computed()` | `computed()` | `Signal.Computed` |
| **Effect/Reaction** | 副作用执行 | `watchEffect()` | `createEffect()` | `effect()` | `effect()` | 基于 `Watcher` 实现 |

**Signal 的核心思想是：状态是一等公民（First-Class Value），而不是依附于组件的属性。**

看一个 Preact Signals 的例子：

```javascript
import { signal, computed, effect } from "@preact/signals-core"

const counter = signal(0)
const isEven = computed(() => (counter.value & 1) === 0)
const parity = computed(() => isEven.value ? "even" : "odd")

effect(() => console.log(parity.value))

counter.value = 1   // 自动打印 "odd"
counter.value = 2   // 自动打印 "even"
```

对比 Vue3：

```javascript
import { ref, computed, watchEffect } from "vue"

const counter = ref(0)
const isEven = computed(() => (counter.value & 1) === 0)
const parity = computed(() => isEven.value ? "even" : "odd")

watchEffect(() => console.log(parity.value))

counter.value = 1   // 自动打印 "odd"
counter.value = 2   // 自动打印 "even"
```

**几乎一字不差。** 这不是因为谁抄了谁——而是因为**细粒度响应式的底层拓扑结构就是这样的**。

### 3.2 Signal 的自动追踪机制

Signals 最"魔法"的部分——自动依赖追踪——其实原理极其简洁。用不到 50 行代码就能实现一个最小可工作版本：

```javascript
// 全局追踪栈
let currentEffect = null

function createSignal(initialValue) {
  let value = initialValue
  const subscribers = new Set()

  const read = () => {
    // 读取时：如果有正在执行的 effect，注册为订阅者
    if (currentEffect) subscribers.add(currentEffect)
    return value
  }

  const write = (newValue) => {
    value = newValue
    // 写入时：通知所有订阅者重新执行
    for (const sub of subscribers) sub()
  }

  return [read, write]
}

function createEffect(fn) {
  const execute = () => {
    currentEffect = execute  // 将自己设为"当前活跃 effect"
    fn()                     // 执行过程中，被读取的 signal 会收集到 execute
    currentEffect = null
  }
  execute()  // 立即执行一次，建立初始依赖
}
```

**整个自动追踪的本质就是一个"暗号协议"**：
1. Effect 执行前，把自己挂到全局变量上（"我正在执行"）
2. Signal 被读取时，检查全局变量（"有人在关注我吗？"），如果有，就记住它
3. Signal 被写入时，通知所有记住的 Effect（"我变了，你们重新来一趟"）

这跟 Vue3 的 `activeSub` 机制完全同构。

### 3.3 Glitch-Free 执行——不一致状态的消除

一个看起来简单的响应式系统，实际上暗藏陷阱。考虑以下场景：

```
a = signal(1)
b = signal(2)
sum = computed(() => a.value + b.value)     // 3
isEven = computed(() => sum.value % 2 === 0) // false

effect(() => console.log(sum.value, isEven.value))
```

当我们执行 `batch(() => { a.value = 2; b.value = 3 })` 时：

- `sum` 应该变为 `5`
- `isEven` 应该变为 `false`

但如果不加控制，可能出现这样的执行序列：
1. `a` 变化 → `sum` 重算为 `4` → `isEven` 重算为 `true` → Effect 打印 `4, true`
2. `b` 变化 → `sum` 重算为 `5` → `isEven` 重算为 `false` → Effect 打印 `5, false`

中间那个 `4, true` 就是一个 **glitch（毛刺）**——它是一个逻辑上从未真正存在的中间状态，被用户观察到了。这在 UI 中可能导致闪烁，在业务逻辑中可能导致错误决策。

**消除 glitch 的关键在于 Push-Pull 混合策略：**

1. **Push 阶段**：当 Signal 被修改时，沿着依赖图"向下推送"脏标记（dirty flag），但**不立即执行**计算
2. **Pull 阶段**：当 Effect 真正需要读取值时，沿着依赖链"向上拉取"最新值，按照拓扑顺序计算

Vue3 源码中的 `isDirty` 和 `refreshComputed` 正是这种策略的实现：

```typescript
function isDirty(sub: Subscriber): boolean {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (
      link.dep.version !== link.version ||
      (link.dep.computed &&
        (refreshComputed(link.dep.computed) ||   // 递归检查 computed 的源头
          link.dep.version !== link.version))
    ) {
      return true
    }
  }
  return false
}
```

当一个 Effect 被通知"你的某个依赖可能变了"时，它不会立即重新执行，而是检查自己的依赖链是否真的有变化。如果一个 `computed` 的输入变了但输出没变（比如 `computed(() => x.value > 0)` 在 x 从 1 变成 2 时），下游的 Effect 甚至不会被触发。

**这就是 `version` 字段的深意——它是一个单调递增的计数器，每当 computed 的值真正改变时才递增，让下游可以通过版本号比对快速判断是否需要更新。**

### 3.4 Batch——事务性更新

Vue 的响应式系统默认使用微任务队列来批处理更新（这也是为什么修改数据后 DOM 不会立即更新，需要 `nextTick`）。而 Signals 生态普遍提供了显式的 `batch` 机制：

```javascript
// Preact Signals
batch(() => {
  name.value = "Foo"
  surname.value = "Bar"
})
// effect 只执行一次，看到的是 "Foo Bar"
```

Vue3 源码中的 batch 实现：

```typescript
let batchDepth = 0
let batchedSub: Subscriber | undefined

export function startBatch(): void {
  batchDepth++
}

export function endBatch(): void {
  if (--batchDepth > 0) return  // 嵌套 batch 时，等最外层结束

  // 统一触发所有收集到的 effect
  while (batchedSub) {
    let e = batchedSub
    batchedSub = undefined
    while (e) {
      const next = e.next
      e.next = undefined
      e.flags &= ~EffectFlags.NOTIFIED
      if (e.flags & EffectFlags.ACTIVE) {
        (e as ReactiveEffect).trigger()
      }
      e = next
    }
  }
}
```

**Batch 的本质是事务（Transaction）**：将多个状态修改合并为一个原子操作，只在事务结束时统一清算。这跟数据库的事务概念完全一致——先收集所有变更，最后 commit。

---

## 四、TC39 Signals 提案——响应式走向语言标准

2024 年，一个重磅提案进入了 TC39 Stage 1：**JavaScript Signals 标准化**。

这个提案的推动者包括 Angular、Vue、Solid、Preact、Svelte、MobX、Ember、Qwik 等几乎所有主流框架的核心开发者。它的目标不是取代任何框架，而是提供一个**通用的底层响应式原语**。

### 4.1 提案 API 概览

```typescript
// 状态 Signal
const counter = new Signal.State(0)

// 计算 Signal
const isEven = new Signal.Computed(() => (counter.get() & 1) === 0)
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd")

// 底层 Watcher（框架用于实现 effect）
const w = new Signal.subtle.Watcher(() => {
  // 某个依赖变化了，安排稍后执行更新
  scheduleUpdate()
})
w.watch(parity)

counter.set(counter.get() + 1)
```

注意这个 API 有几个刻意的设计决策：

1. **使用 `.get()` / `.set()` 而非 `.value`**：避免与任何现有框架的语法冲突
2. **不内置 `effect`**：只提供底层的 `Watcher`，让框架自己控制调度策略
3. **`subtle` 命名空间**：类似 `crypto.subtle`，标记"这是给框架作者用的高级 API"

### 4.2 为什么需要标准化？

**互操作性（Interoperability）** 是最核心的驱动力。

目前，每个框架都有自己的依赖追踪机制。这意味着：
- 一个用 Vue `reactive` 创建的状态对象，无法被 SolidJS 的 `createEffect` 追踪
- 一个 MobX 的 `observable`，无法驱动 Angular 的变更检测
- 框架无关的状态管理库（如一个通用的购物车逻辑）很难实现

如果有了标准化的 Signal 原语，框架们可以共享同一个依赖追踪图。一个用标准 Signal 构建的业务模型，可以无缝地在 Vue、Solid、Angular 之间迁移。

**这类似于 Promise 的标准化历程**：在 ES2015 之前，有 Bluebird、Q、RSVP 等各种 Promise 实现。标准化之后，所有库都基于同一套原语，`async/await` 才成为可能。Signal 的标准化，可能为前端带来类似的飞跃。

### 4.3 性能潜力

标准化的另一个维度是**运行时性能**。当 Signal 成为语言内置：

- 引擎可以用 C++ 实现核心的依赖图管理，比 JS 层面更高效
- 不再需要将响应式库打包到 bundle 中，减小体积
- DevTools 可以原生理解 Signal 的依赖关系图，大幅提升调试体验

### 4.4 可能的未来：Signal + DOM 原生绑定

TC39 提案中明确提到了一个激动人心的远景：

> HTML/DOM Integration — Current work in W3C is seeking to bring native templating to HTML (DOM Parts and Template Instantiation). To accomplish both of these goals, eventually a reactive primitive will be needed by HTML.

想象一下：

```html
<!-- 假想的未来语法 -->
<p>Count: {{ counter }}</p>

<script>
  const counter = new Signal.State(0)
  setInterval(() => counter.set(counter.get() + 1), 1000)
</script>
```

浏览器原生理解 Signal，不需要任何框架，不需要 Virtual DOM，不需要编译步骤——直接将 Signal 绑定到 DOM 节点。**这将是 Web 平台自 DOM 诞生以来最大的范式变革。**

---

## 五、深度对比：Vue Reactivity vs Signals 生态

### 5.1 API 风格的哲学分歧

虽然底层同构，但表层 API 的差异反映了不同的设计哲学：

**Solid 的 Signal —— 读写分离的函数式风格：**
```javascript
const [count, setCount] = createSignal(0)
console.log(count())    // 通过函数调用读取
setCount(5)             // 通过独立函数写入
```

**Vue 的 ref —— 属性访问风格：**
```javascript
const count = ref(0)
console.log(count.value) // 通过 .value 读取
count.value = 5          // 通过 .value 写入
```

**Preact 的 signal —— 对象属性风格：**
```javascript
const count = signal(0)
console.log(count.value) // 通过 .value 读取
count.value = 5          // 通过 .value 写入
```

**Svelte —— 编译器魔法，语法层面消除了仪式感：**
```javascript
let count = $state(0)
console.log(count)       // 直接读取
count = 5                // 直接赋值
```

Ryan Carniato 在解释 Solid 选择 tuple 风格时说了一句很有见地的话：

> "With tuples you can name them exactly as you want. They have explicit meaning. A read is always just a function."

**读写分离的好处是类型安全和意图清晰**：当你把 `count`（getter）传给一个子组件时，接收方天然就是只读的，不需要额外的 `readonly` 包装。而 Vue 的 `.value` 方式虽然多了一次属性访问，但允许同一个引用同时可读可写，在模板中还能自动解包，开发体验更顺滑。

**这不是对错之分，而是在「安全性」和「便利性」之间的权衡。**

### 5.2 组件更新粒度的差异

这是 Vue 和 Solid/Preact Signals 最本质的区别。

**Vue 的更新单位是组件**：

```
Signal 变化 → 标记组件为 dirty → 下一个微任务执行组件的 render 函数 → Virtual DOM diff → 最小化 DOM 更新
```

**Solid 的更新单位是 DOM 节点**：

```
Signal 变化 → 直接执行绑定到该 Signal 的 DOM 更新函数 → DOM 更新完成
```

**Preact Signals 做了更激进的优化**——当 Signal 直接出现在 JSX 中时，完全绕过 Virtual DOM：

```jsx
const count = signal(0)
// 这里 {count} 不会触发组件重渲染
// Preact 会直接更新对应的 Text 节点
return <p>Value: {count}</p>
```

**从性能角度看**：Solid 和 Preact Signals 的方式理论上更快，因为跳过了 Virtual DOM diff。但 Vue 的组件级更新也有其优势——**组件是天然的错误边界和代码组织单元**，组件级更新让调试和性能分析更加直观。

### 5.3 调度策略的不同

| 框架 | 默认调度策略 | 同步/异步 |
|------|------------|----------|
| Vue | 微任务队列（queueJob） | 异步，通过 `nextTick` 批处理 |
| Solid | 同步执行 | 同步，在事务内完成所有更新 |
| Preact Signals | 同步执行 | 同步，自动 batch |
| Angular Signals | 与 Zone.js / Signal 集成 | 混合策略 |

Vue 的异步调度使得它天然支持**批处理优化**：在同一个事件循环中的多次状态修改只会触发一次组件更新。而 Solid 的同步执行保证了**状态的即时一致性**——任何时刻读取 Signal 都能得到最新值。

TC39 提案有意不内置调度策略，把这个选择权留给框架——这是一个明智的决定，因为最优的调度策略取决于应用场景。

---

## 六、从框架底层看响应式的本质规律

### 6.1 响应式系统的四个不变量

纵观所有细粒度响应式实现，有四个核心不变量（Invariants）始终成立：

1. **因果一致性（Causal Consistency）**：如果 B 依赖 A，那么 A 变化后，B 一定会在被读取前更新
2. **无毛刺（Glitch-Free）**：任何 Effect 观察到的状态都是全局一致的，不会出现中间状态
3. **最小化执行（Minimal Execution）**：只有真正依赖变化数据的计算才会重新执行
4. **惰性求值（Lazy Evaluation）**：Computed 值只在被读取时才计算，不主动浪费算力

这四条规则限定了算法的设计空间，也解释了为什么不同框架的底层实现殊途同归。

### 6.2 响应式 vs 不可变——两种世界观

React 和 Vue/Solid 代表了状态管理的两种根本哲学：

**React（不可变流派）**：
- 状态是不可变的快照
- 每次更新创建新的状态对象
- 通过比较引用来判断变化
- 需要 `useMemo` / `React.memo` 来优化

**Vue/Solid（响应式流派）**：
- 状态是可变的容器
- 直接修改状态，系统自动追踪变化
- 通过依赖图来传播更新
- 默认就是最优的

这两种方式本质上是**声明式状态管理的两种实现策略**。有趣的是，React 团队在 React 19 中引入了一个新的编译器（React Compiler），它的作用正是**自动插入 `useMemo`**——本质上是在用编译器弥补不可变模型在性能优化上的人工成本。

而 Svelte 5 的 Runes 系统更是直接转向了 Signal 模型，放弃了之前基于赋值语句的编译时分析。

**当 React 在向编译时优化靠拢，而 Svelte 在向 Signal 靠拢时，前端框架的响应式模型正在趋同。**

### 6.3 所有权与内存管理——响应式的阿喀琉斯之踵

细粒度响应式系统最棘手的工程问题是**内存管理**。

一个 Signal 对它的订阅者持有强引用。如果一个长期存活的 Signal（如全局状态）被一个临时 Effect（如组件内部的 watchEffect）订阅，那么即使组件卸载了，Effect 也不会被垃圾回收——除非手动取消订阅。

S.js（2013）首先提出了**响应式所有权（Reactive Ownership）** 的概念：每个 Effect 有一个"所有者"（通常是父 Effect 或根 Scope），当所有者被销毁时，所有子 Effect 自动被清理。

Vue3 用 `effectScope` 实现了这个模式：

```javascript
const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)
  watchEffect(() => console.log(doubled.value))
})

// 一键清理 scope 内的所有响应式效果
scope.stop()
```

在组件中，Vue 自动创建了一个与组件生命周期绑定的 `effectScope`，所以 `onUnmounted` 时所有 `watchEffect` 和 `computed` 都会被自动清理。

TC39 提案目前选择了一个更激进的方向——**期望 Computed Signal 在没有活跃的 Watcher 时可以被垃圾回收**，即使它被其他 Signal 引用。这需要引擎层面的弱引用支持，是标准化讨论中最具挑战性的议题之一。

### 6.4 编译器的角色——响应式的下一个前沿

Svelte 在 2019 年用编译器展示了一种革命性的可能：**在编译时分析响应式依赖关系，生成精确的更新代码，运行时零开销。**

这启发了整个生态：

- **Qwik** 利用编译器实现了"可恢复性（Resumability）"——不需要 hydration，直接从服务端状态恢复交互
- **Marko** 通过编译时分析实现了自动的代码分割——只将用户交互需要的代码发送到客户端
- **Vue Vapor Mode**（实验中）正在探索一种 Virtual DOM-less 的编译输出，将模板直接编译为细粒度的 DOM 操作

**编译器让我们可以在写作时（authoring time）享受声明式的便利，在运行时（runtime）获得命令式的性能。** 这是前端框架设计中最激动人心的方向之一。

---

## 七、总结与展望

回到开篇的问题：**响应式的本质是什么？**

我的理解是：**响应式是一种将「数据的因果关系」从隐式变为显式的编程范式。**

在传统命令式编程中，`c = a + b` 只是一次赋值——之后 `a` 或 `b` 变了，`c` 不会变。而在响应式编程中，`c = computed(() => a.value + b.value)` 声明了一种永久的关系——`c` 永远等于 `a + b`。

这种从"操作"到"关系"的思维转换，跟数据库从命令式 SQL 到声明式约束、跟 UI 从 jQuery 手动操作到 React 声明式渲染，是同一条进化路径。

当我们审视 Vue 的 `ReactiveEffect`、Solid 的 `createSignal`、Preact 的 `signal`、以及 TC39 的 `Signal.State`，它们表层语法各异，但底层拓扑结构相同：

```
┌─────────────────────────────────────────────┐
│                                             │
│   State ──→ Computed ──→ Computed ──→ Effect│
│     │                        ↑              │
│     └────────────────────────┘              │
│                                             │
│          响应式依赖图 (Reactive Graph)       │
└─────────────────────────────────────────────┘
```

**框架会兴衰，API 会迭代，但这张图不会变。因为它不是某个框架的发明，而是"基于状态变化的声明式更新"这一问题的数学最优解。**

从 2010 年 Knockout.js 的 `observable`，到 2014 年 Vue 的 `data()`，到 2020 年 Vue3 的 `ref()`，到 2024 年 TC39 的 `Signal.State`——十四年间，前端社区走了一个大圆，又回到了起点。

但这不是简单的轮回。每一次迭代都在：
- **算法上**更精确（从脏检查到 Push-Pull 混合）
- **工程上**更健壮（从手动订阅到自动依赖追踪与清理）
- **生态上**更统一（从框架私有到 TC39 标准提案）

也许在不远的将来，当你在浏览器控制台输入 `new Signal.State(0)` 时，你用的不是某个框架的 API，而是 JavaScript 语言本身的能力。

**那一刻，响应式将不再是框架的特性，而是 Web 平台的基础设施。**

---

### 参考资料

- [Vue3 Reactivity 源码 - effect.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts)
- [Ryan Carniato - A Hands-on Introduction to Fine-Grained Reactivity](https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf)
- [Ryan Carniato - The Evolution of Signals in JavaScript](https://dev.to/this-is-learning/the-evolution-of-signals-in-javascript-8ob)
- [TC39 Proposal: JavaScript Signals](https://github.com/tc39/proposal-signals)
- [Preact Signals](https://github.com/preactjs/signals)
- [Preact Blog - Introducing Signals](https://preactjs.com/blog/introducing-signals/)
