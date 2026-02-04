# 话题 1：Design Token 核心概念与分层哲学

> 本文是「设计系统与 Tailwind CSS 深度实践」系列的第一篇，系统阐述 Design Token 的本质、分层哲学与命名规范。

---

## 一、Design Token 到底是什么？

### 1.1 一个明确的定义

**Design Token 是设计决策的最小可存储单元**，它将视觉属性（颜色、字体、间距、圆角等）从具体实现中抽象出来，形成**跨平台、跨技术栈、可版本化**的设计语言。

这个定义有三个关键词：

| 关键词 | 含义 |
|--------|------|
| **设计决策** | Token 不是随意的值，而是经过设计思考后确定的"决策" |
| **最小单元** | 不可再分割，是设计系统的"原子" |
| **可存储** | 必须能被序列化、版本化、分发 |

### 1.2 Token vs 变量：本质区别

很多人会问：「Token 不就是 CSS 变量吗？」

**我的明确观点：不是。**

| 维度 | CSS 变量 | Design Token |
|------|----------|--------------|
| **本质** | 技术实现手段 | 设计语言载体 |
| **作用域** | 仅限 CSS/Web | 跨平台（Web/iOS/Android/设计工具） |
| **语义** | 可有可无 | 必须携带设计意图 |
| **生命周期** | 代码层面 | 设计→代码→多端 全链路 |
| **维护者** | 开发者 | 设计师 + 开发者协作 |

```
Token 与 CSS 变量的关系：

┌─────────────────────────────────────────────────────┐
│                  Design Token                        │
│            (设计语言的单一真相源)                      │
│                                                       │
│   tokens.json / tokens.yaml / Figma Tokens           │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼ 构建/转换
    ┌───────────────┼───────────────┬─────────────────┐
    ▼               ▼               ▼                 ▼
CSS Variables   Tailwind Config   Swift/Kotlin    Figma Tokens
  :root {        theme: {         struct Colors   (设计工具内)
    --color-     colors: {        { ... }
    primary      primary          }
  }              }
                 }
```

**关键洞察**：CSS 变量是 Token 在 Web 端的**消费形式之一**，不是 Token 本身。Token 是上游的"源头"，CSS 变量是下游的"出口"。

### 1.3 Design Token 解决什么问题？

在没有 Token 体系之前，设计系统面临这些痛点：

1. **设计与开发脱节**：设计师在 Figma 用 `#3B82F6`，开发者在代码里写 `blue-500`，两边对不上
2. **多端不一致**：Web 用一套颜色，App 用另一套，品牌感碎片化
3. **修改成本高**：改个主色要全局搜索替换，漏改一个就是 bug
4. **暗黑模式灾难**：没有语义化，`#FFFFFF` 在暗黑模式下该变成什么？
5. **多品牌无解**：如何让同一套组件适配不同品牌？硬编码走不通

**Token 体系的核心价值：建立"单一真相源"（Single Source of Truth）**

```
修改前：
设计师改 Figma → 通知开发 → 开发改 Web → 开发改 App → 漏改 → Bug

修改后（有 Token 体系）：
设计师改 Token 源文件 → 自动同步到所有端 → 完成
```

---

## 二、Token 分层体系：三层哲学

### 2.1 为什么需要分层？

考虑一个场景：你定义了 `--color-blue-500: #3B82F6`，然后在整个项目中用了 200 次。

现在问题来了：
- 按钮背景用了这个蓝色
- 链接文字用了这个蓝色
- 图标颜色用了这个蓝色
- 边框 hover 用了这个蓝色

**当需要把按钮换成绿色，但链接保持蓝色时，怎么办？**

答案是：200 次使用中，你根本分不清哪些是"按钮语义"，哪些是"链接语义"。

**分层的本质是：在"原始值"和"使用场景"之间建立映射关系。**

### 2.2 经典三层模型

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Component-specific Tokens（组件级）               │
│  button-bg-default, input-border-focus, card-shadow        │
│  ↑ 引用                                                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Semantic Tokens（语义级）                         │
│  color-bg-primary, color-text-muted, spacing-page-gutter   │
│  ↑ 引用                                                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Primitive Tokens（原始级）                        │
│  blue-500, gray-100, space-4, radius-md                    │
│  ↑ 定义                                                     │
├─────────────────────────────────────────────────────────────┤
│  原始值                                                      │
│  #3B82F6, #F3F4F6, 16px, 8px                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 每一层的职责

#### Layer 1: Primitive Tokens（原始级/基础级）

**职责**：定义"有什么"——调色板、字号表、间距刻度

```json
// tokens/primitive/colors.json
{
  "color": {
    "blue": {
      "50":  { "value": "#EFF6FF" },
      "100": { "value": "#DBEAFE" },
      "200": { "value": "#BFDBFE" },
      "300": { "value": "#93C5FD" },
      "400": { "value": "#60A5FA" },
      "500": { "value": "#3B82F6" },
      "600": { "value": "#2563EB" },
      "700": { "value": "#1D4ED8" },
      "800": { "value": "#1E40AF" },
      "900": { "value": "#1E3A8A" }
    },
    "gray": {
      "50":  { "value": "#F9FAFB" },
      "100": { "value": "#F3F4F6" },
      "200": { "value": "#E5E7EB" },
      "300": { "value": "#D1D5DB" },
      "400": { "value": "#9CA3AF" },
      "500": { "value": "#6B7280" },
      "600": { "value": "#4B5563" },
      "700": { "value": "#374151" },
      "800": { "value": "#1F2937" },
      "900": { "value": "#111827" }
    }
  },
  "space": {
    "0":  { "value": "0" },
    "1":  { "value": "4px" },
    "2":  { "value": "8px" },
    "3":  { "value": "12px" },
    "4":  { "value": "16px" },
    "5":  { "value": "20px" },
    "6":  { "value": "24px" },
    "8":  { "value": "32px" },
    "10": { "value": "40px" },
    "12": { "value": "48px" },
    "16": { "value": "64px" }
  },
  "radius": {
    "none": { "value": "0" },
    "sm":   { "value": "4px" },
    "md":   { "value": "8px" },
    "lg":   { "value": "12px" },
    "xl":   { "value": "16px" },
    "full": { "value": "9999px" }
  }
}
```

**特点**：
- 纯粹的值，不带任何使用语义
- 通常与设计工具（Figma）的色板一一对应
- 数量有限且固定（体现"约束式设计"思想）

#### Layer 2: Semantic Tokens（语义级）

**职责**：定义"做什么"——这个颜色用于什么场景

```json
// tokens/semantic/colors.json
{
  "color": {
    "bg": {
      "primary":   { "value": "{color.white}" },
      "secondary": { "value": "{color.gray.50}" },
      "tertiary":  { "value": "{color.gray.100}" },
      "inverse":   { "value": "{color.gray.900}" },
      "brand":     { "value": "{color.blue.500}" },
      "success":   { "value": "{color.green.50}" },
      "warning":   { "value": "{color.yellow.50}" },
      "error":     { "value": "{color.red.50}" }
    },
    "text": {
      "primary":   { "value": "{color.gray.900}" },
      "secondary": { "value": "{color.gray.600}" },
      "tertiary":  { "value": "{color.gray.400}" },
      "inverse":   { "value": "{color.white}" },
      "brand":     { "value": "{color.blue.600}" },
      "success":   { "value": "{color.green.700}" },
      "warning":   { "value": "{color.yellow.700}" },
      "error":     { "value": "{color.red.700}" }
    },
    "border": {
      "default":   { "value": "{color.gray.200}" },
      "muted":     { "value": "{color.gray.100}" },
      "emphasis":  { "value": "{color.gray.400}" },
      "brand":     { "value": "{color.blue.500}" },
      "error":     { "value": "{color.red.500}" }
    }
  }
}
```

**关键洞察**：语义层是**多主题切换的关键**。

```
Light Mode:                    Dark Mode:
color.bg.primary = white   →   color.bg.primary = gray.900
color.text.primary = gray.900 → color.text.primary = gray.50

组件代码不变，只切换语义层映射！
```

#### Layer 3: Component-specific Tokens（组件级）

**职责**：定义"谁用"——精确到具体组件的特定状态

```json
// tokens/components/button.json
{
  "button": {
    "primary": {
      "bg": {
        "default": { "value": "{color.bg.brand}" },
        "hover":   { "value": "{color.blue.600}" },
        "active":  { "value": "{color.blue.700}" },
        "disabled": { "value": "{color.gray.200}" }
      },
      "text": {
        "default": { "value": "{color.text.inverse}" },
        "disabled": { "value": "{color.text.tertiary}" }
      },
      "border": {
        "default": { "value": "transparent" },
        "focus":   { "value": "{color.blue.300}" }
      }
    },
    "secondary": {
      "bg": {
        "default": { "value": "{color.bg.secondary}" },
        "hover":   { "value": "{color.gray.100}" }
      },
      "text": {
        "default": { "value": "{color.text.primary}" }
      }
    }
  }
}
```

### 2.4 分层的取舍：是否需要第三层？

**我的观点：个人项目/小型组件库可以只用两层。**

| 项目规模 | 推荐层数 | 理由 |
|----------|----------|------|
| 个人项目 | 2 层（Primitive + Semantic） | 维护成本低，灵活性够用 |
| 中型组件库 | 2.5 层（部分组件有专属 Token） | 高频组件值得投入 |
| 大型设计系统 | 3 层完整 | 多团队协作需要精确控制 |

```
两层体系示例（推荐你先从这里开始）：

tokens/
├── primitive/
│   ├── colors.json      # 调色板
│   ├── typography.json  # 字体
│   └── spacing.json     # 间距
└── semantic/
    ├── colors.json      # 语义颜色（含暗黑模式）
    └── spacing.json     # 语义间距
```

---

## 三、命名规范：语义化 vs 原子化的边界

### 3.1 常见命名流派对比

| 流派 | 示例 | 优点 | 缺点 |
|------|------|------|------|
| **数值型** | `gray-100`, `blue-500` | 简单、无歧义、与 Tailwind 天然兼容 | 无语义，不知道用在哪 |
| **语义型** | `text-primary`, `bg-surface` | 有使用意图，切换主题友好 | 命名难、边界模糊 |
| **组件型** | `button-bg-hover` | 精确、无歧义 | 数量爆炸、维护成本高 |
| **混合型** | 数值 + 语义两层 | 兼顾灵活和语义 | 需要维护两套 |

### 3.2 我的推荐：混合策略

```
Primitive 层用数值型：
- color.blue.500
- color.gray.100
- space.4
- radius.md

Semantic 层用语义型：
- color.bg.primary
- color.text.secondary
- color.border.emphasis
- spacing.page.gutter

组件层（如果需要）用组件型：
- button.primary.bg.hover
- input.border.focus
```

### 3.3 命名规范的黄金法则

**法则 1：层级体现在命名结构中**

```
❌ 不好：primaryColor, bgBlue, textSecondary
✅ 好：  color.bg.primary, color.text.secondary

# 用 . 或 - 分隔层级，保持一致性
```

**法则 2：状态后置，类别前置**

```
❌ 不好：hover-button-bg, disabled-text-color
✅ 好：  button.bg.hover, text.color.disabled

# 先类别，后状态，便于分组和自动补全
```

**法则 3：避免"伪语义"**

```
❌ 伪语义：color.main, color.sub
           （main 和 sub 是什么？太模糊）

✅ 真语义：color.bg.primary, color.bg.secondary
           （明确是背景色，primary 表示主要层级）
```

**法则 4：预留扩展空间**

```
❌ 不好：color.error（无法区分背景、文字、边框）
✅ 好：  color.bg.error, color.text.error, color.border.error
```

### 3.4 一个完整的命名体系示例

```
命名结构：{category}.{property}.{variant}.{state}

category:  color, space, size, radius, shadow, font, ...
property:  bg, text, border, ...
variant:   primary, secondary, brand, success, error, ...
state:     default, hover, active, disabled, focus, ...

完整示例：
color.bg.primary          # 主背景色
color.bg.primary.hover    # 主背景色悬停态（如果需要）
color.text.secondary      # 次要文字色
color.border.error        # 错误边框色
space.page.gutter         # 页面边距
space.stack.md            # 纵向堆叠间距（中）
```

---

## 四、单一真相源原则

### 4.1 什么是单一真相源？

**所有设计值都从一个地方定义，所有平台都从这个地方消费。**

```
┌─────────────────────────────────────────────────────────┐
│                    tokens.json                          │
│              (Single Source of Truth)                   │
└───────────────────────┬─────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   Web    │  │   iOS    │  │ Android  │
    │  :root   │  │  .swift  │  │  .xml    │
    │ Tailwind │  │  UIKit   │  │ Compose  │
    └──────────┘  └──────────┘  └──────────┘
```

### 4.2 实现单一真相源的工具：Style Dictionary

[Style Dictionary](https://amzn.github.io/style-dictionary/) 是 Amazon 开源的 Token 构建工具，它负责：

1. **读取** Token 源文件（JSON/YAML）
2. **转换** 为各平台格式（CSS/SCSS/JS/Swift/Kotlin/XML）
3. **解析** Token 间的引用关系

```javascript
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'dist/tailwind/',
      files: [{
        destination: 'theme.js',
        format: 'javascript/es6'
      }]
    },
    ios: {
      transformGroup: 'ios',
      buildPath: 'dist/ios/',
      files: [{
        destination: 'StyleDictionary.swift',
        format: 'ios/swift'
      }]
    }
  }
};
```

**构建输出示例**：

```css
/* dist/css/variables.css */
:root {
  --color-blue-500: #3B82F6;
  --color-bg-primary: #FFFFFF;
  --color-text-primary: #111827;
}
```

```javascript
// dist/tailwind/theme.js
export const colorBlue500 = "#3B82F6";
export const colorBgPrimary = "#FFFFFF";
export const colorTextPrimary = "#111827";
```

```swift
// dist/ios/StyleDictionary.swift
public enum StyleDictionary {
    public static let colorBlue500 = UIColor(hex: "#3B82F6")
    public static let colorBgPrimary = UIColor(hex: "#FFFFFF")
    public static let colorTextPrimary = UIColor(hex: "#111827")
}
```

---

## 五、本轮小结

### 核心观点回顾

1. **Design Token ≠ CSS 变量**：Token 是设计语言，CSS 变量只是 Token 在 Web 端的一种消费形式
2. **分层是必须的**：至少需要 Primitive + Semantic 两层，才能优雅支持多主题
3. **命名要体现层级**：采用 `{category}.{property}.{variant}` 结构
4. **单一真相源**：Token 定义在一处，构建到多端

### 推荐你的起步方案

```
对于你的场景（个人组件库 + 多主题），我建议：

1. 采用两层 Token 体系（暂不需要组件级）
2. 用 JSON 格式存储 Token
3. 用 Style Dictionary 构建到 CSS Variables + Tailwind Config
4. Semantic 层准备 light/dark 两套映射

目录结构：
packages/
├── tokens/
│   ├── src/
│   │   ├── primitive/
│   │   │   ├── colors.json
│   │   │   └── spacing.json
│   │   └── semantic/
│   │       ├── light.json
│   │       └── dark.json
│   ├── style-dictionary.config.js
│   └── package.json
├── ui/
│   ├── src/components/
│   ├── tailwind.config.js  # 消费 tokens 包的输出
│   └── package.json
└── package.json  # monorepo root
```

---

## 本轮思考问题

在进入下一个话题（Tailwind CSS 的设计哲学与深度定制）之前，请思考以下问题：

1. **你的项目中目前是如何管理颜色/间距的？** 是硬编码、CSS 变量、还是 Tailwind 默认值？有没有遇到"改一个颜色要改很多地方"的痛点？

2. **你对"约束式设计"有什么看法？** 比如 Tailwind 只提供 `space-1` 到 `space-12`，而不是任意像素值。这种限制对你来说是束缚还是帮助？

3. **你的组件库是否有多主题需求？** 如果有，是"暗黑模式"这种全局切换，还是"多品牌"这种业务级切换，还是两者都要？

4. **关于命名，你更倾向于哪种风格？** 数值型（`blue-500`）让你更舒服，还是语义型（`text-primary`）更符合你的设计思维？

5. **你目前的项目有使用 Figma 吗？** 如果有，设计稿中的颜色命名和代码中的命名是否一致？

---

