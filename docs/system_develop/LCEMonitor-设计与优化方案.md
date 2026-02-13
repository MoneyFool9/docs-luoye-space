# LCEMonitor 设计与优化方案

> 基于 [LCEMonitor](https://github.com/MoneyFool9/LCEMonitor) 当前实现做的结构梳理、问题诊断与分阶段优化建议，可与《前端监控埋点平台-功能与优化头脑风暴》配合使用。

---

## 一、项目现状概览

### 1.1 仓库结构

| 应用 | 技术栈 | 职责 |
|------|--------|------|
| **apps/sdk** | TypeScript，输出 CJS | 前端埋点 SDK（@lce-monitor/jssdk） |
| **apps/server** | NestJS + ClickHouse + Kafka + MySQL + Redis | 接收上报、消息队列、存储与查询 |
| **apps/admin** | Vue + Element Plus 等 | 监控后台（看板、表格等） |
| **apps/docs** | - | 文档站 |
| **apps/test-app** | - | SDK 联调测试用 |
| **apps/cleaner-server** | - | 清理服务（推测为数据过期清理） |
| **packages/utils** | - | 公共工具（如 formatTimestamp、get_uuid） |

### 1.2 SDK 当前能力（apps/sdk/src/index.ts）

- **行为**：PV、UV（24h 去重）、点击（`data-lce-event`）、路由变化（hash + history）、页面停留时长（visibilitychange）。
- **性能**：TTFB、FCP、LCP、TTI、DOMContentLoaded、资源分类耗时（通过 `performance.getEntriesByType`）。
- **错误**：全局 error（JS 错误 + 资源加载错误）、unhandledrejection。
- **上报**：内存队列 + `localStorage` 缓存、批量/单条可选、`visibilitychange === 'hidden'` 时 flush、`fetch` + `keepalive: true`，失败重试并写回队列。

### 1.3 服务端当前数据流（从代码推断）

- 上报入口：`POST /monitoring` → `AppService.processData` → 写入 **Kafka**（topic: `monitoring-events`），并附加 `receivedAt`、`environment`。
- 查询：`GET /monitoring/all` → `ClickhouseService.selectData()` 查表 `monitor_log`。
- **需确认**：Kafka 消费端是否将数据写入 ClickHouse；若未打通，需补充 Consumer 或改为接收入库后再异步发 Kafka。

---

## 二、当前问题与风险

### 2.1 SDK 侧

| 问题 | 说明 | 优先级 |
|------|------|--------|
| **单文件过大** | 逻辑全在 `index.ts`（约 15k 行级），不利于按需加载与维护 | 高 |
| **无 sendBeacon 双通道** | 仅用 `fetch` + `keepalive`，页面关闭/刷新时仍有丢数风险，建议 sendBeacon + fetch 双通道 | 高 |
| **LCP/FCP 采集方式不标准** | 使用 `getEntriesByName('first-contentful-paint')` / `largest-contentful-paint`，标准做法应为 `PerformanceObserver` 监听 `paint` / `largest-contentful-paint`，且 LCP 需在用户交互或页面隐藏前取最后值 | 高 |
| **缓存仅用 localStorage** | 容量与同源限制明显，大量事件或录屏场景建议 IndexedDB 离线队列 | 中 |
| **无错误指纹/聚合** | 未做 stack 或 message 标准化与去重，不利于告警与趋势 | 中 |
| **无采样与降级** | 高流量时无法按比例采样或降级非关键类型 | 中 |
| **控制台日志未收敛** | 生产环境仍有 `console.log`，建议通过配置或环境变量关闭 | 低 |
| **类型不严谨** | `data: Record` 过于松散，不利于后端解析与检索 | 低 |

### 2.2 服务端侧

| 问题 | 说明 | 优先级 |
|------|------|--------|
| **Kafka 与 ClickHouse 链路未在代码中体现** | 仅见写入 Kafka，未见写入 ClickHouse 的调用关系，需明确并实现「Kafka Consumer → ClickHouse」或「先写 ClickHouse 再发 Kafka」 | 高 |
| **ClickHouse 每次查询后 close** | `insertData` / `selectData` 中 `finally` 里 `await this.client.close()`，频繁创建/关闭连接，建议单例长连接 | 高 |
| **SQL 拼接存在注入风险** | `selectData` 中 `level` 等条件直接拼字符串，应使用参数化或白名单校验 | 高 |
| **接收体未校验** | `receiveData(@Body() data: any)` 无 DTO 校验与类型约束，易脏数据 | 中 |
| **无鉴权** | 上报与查询接口未做认证/签名，存在滥用风险 | 中 |

### 2.3 工程与协作

- SDK 仅 CJS 输出，无 ESM/UMD，不利于现代项目与 CDN 接入。
- 无 README/接入文档（或未在仓库根目录体现），不利于推广与协作。
- 未体现错误聚合、告警、Source Map 还原等平台能力，与《头脑风暴》中的 P0 能力有差距。

---

## 三、架构与设计优化建议

### 3.1 SDK 架构：插件化 + 多格式

**目标**：核心只做「采集抽象 + 上报队列 + 传输」，具体能力由插件注册，便于按需加载与体积控制。

- **核心包**（必选，控制 <10KB gzip）  
  - 配置与单例、事件队列、传输层（sendBeacon + fetch 双通道）、本地缓存（localStorage，可选 IndexedDB 适配层）。
- **插件**（按需注册，可异步加载）  
  - 错误采集（error + unhandledrejection + 资源）、性能（PerformanceObserver 标准实现）、行为（PV/UV/点击/路由/停留）、白屏检测、录屏（如 rrweb）。
- **构建**  
  - 使用 tsup 或 rollup 输出 **ESM + CJS + UMD**，支持 `import { init } from '@lce-monitor/jssdk'` 与 `<script src="lce-monitor.umd.js">`。

建议目录结构示例（仅 SDK）：

```
apps/sdk/src/
  core/           # 核心：配置、队列、传输、缓存
  plugins/        # 插件：error、performance、behavior、whiteScreen、replay
  types.ts
  index.ts        # 入口：注册默认插件并导出
```

### 3.2 上报与传输层

- **双通道**：页面卸载或 `visibilitychange === 'hidden'` 时优先 `navigator.sendBeacon`，失败或非卸载场景用 `fetch`（可带 `keepalive`）。
- **离线队列**：在需要支持「大量事件/录屏」时，使用 IndexedDB 做持久化队列，恢复网络后重传；可设置最大条数/大小与过期时间，避免占满。
- **批量与压缩**：保持现有批量逻辑，可增加「按条数或按时间窗口」两种触发策略；对 body 做 gzip（或 SDK 内压缩）需评估兼容性与收益。
- **重试与退避**：失败后指数退避重试，避免雪崩；可区分「丢弃」与「必须重试」的事件类型（如错误优先重试）。

### 3.3 服务端数据流建议

- **明确主路径**：推荐「接收入库为主、Kafka 为辅」—— 先校验 DTO，写入 ClickHouse（或先写 MySQL 再异步同步到 ClickHouse），再异步发 Kafka 供下游分析/告警。
- **Kafka 使用方式**：若已有 Kafka，可作为「实时消费」通道（如告警、实时大屏）；若暂无消费者，可先不做 Kafka，减少运维成本。
- **ClickHouse**：连接单例、参数化查询、表结构按事件类型或统一 JSON 列设计，便于与 SDK 的 `type` + `data` 对应；必要时做分区与 TTL。

### 3.4 后台与平台能力

- **错误聚合**：按错误指纹（stack/message 标准化）聚合，支持按时间、项目、版本筛选与趋势图。
- **告警**：错误率/数量超阈值时触发钉钉/飞书/邮件，可与 Kafka 或定时扫描 ClickHouse 结合。
- **Source Map**：上报 stack 与 release 信息，后端或独立服务解析 Source Map 还原源码位置，便于定位。
- **录屏与错误关联**：若接入 rrweb，会话 ID 与错误关联，错误详情页可跳转回放。

---

## 四、分阶段落地建议

### 4.1 第一阶段：稳定性与数据正确性（优先）

| 项 | 动作 |
|----|------|
| SDK 上报可靠性 | 实现 sendBeacon + fetch 双通道，卸载场景优先 sendBeacon |
| SDK 性能指标 | 使用 PerformanceObserver 采集 LCP/FCP，并在 beforehide 或 visibilitychange 时取最终 LCP |
| 服务端数据流 | 明确并实现「接收 → 校验 → 写入 ClickHouse」主路径；若有 Kafka，再补 Consumer 或异步发送 |
| ClickHouse | 连接改为单例，查询参数化，避免注入与频繁 close |
| 生产环境 | SDK 去掉或通过配置关闭 console.log，避免干扰业务 |

### 4.2 第二阶段：可维护性与扩展性

| 项 | 动作 |
|----|------|
| SDK 拆分 | 拆出 core + plugins（error/performance/behavior），至少逻辑分模块，构建可仍打单 bundle |
| SDK 构建 | 增加 ESM/UMD 输出，便于不同场景接入 |
| 错误聚合 | 后端对 error/unhandledrejection 做指纹与聚合，admin 展示趋势与列表 |
| 类型与校验 | SDK 的 TrackEvent.data 按 type 细化类型；服务端接收入口 DTO 校验 |

### 4.3 第三阶段：体验与差异化

| 项 | 动作 |
|----|------|
| 白屏检测 | SDK 插件：采样点 + elementFromPoint，与错误关联上报 |
| 离线队列 | IndexedDB 持久化队列，弱网/关页后可补发 |
| 采样与降级 | 按用户/比例采样、按类型降级（如仅保错误与关键行为） |
| 录屏 | 集成 rrweb，路由切换时打快照，错误会话提高采样率 |
| 告警与 Source Map | 告警规则 + 钉钉/飞书；Source Map 上传与还原接口 |

---

## 五、与《头脑风暴》文档的对照

- **P0 能力**：你已有错误采集、基础性能、PV/点击/自定义事件、队列与重试；**待补**：sendBeacon 双通道、LCP/FCP 标准采集、错误聚合、Source Map、SDK 插件化与多格式。
- **P1 能力**：可优先做白屏检测、离线队列（IndexedDB）、错误关联与聚合展示；录屏与 SPA 快照可放在第三阶段。
- **差异化**：可在「体积可控 + SPA 友好 + 白屏闭环」上先做深，再考虑一体化与合规（脱敏、采样）。

---

## 六、小结

- **当前亮点**：Monorepo 清晰、SDK 已覆盖行为/性能/错误、服务端有 ClickHouse + Kafka、有 admin 与测试应用，具备继续演进的基础。
- **优先建议**：  
  1）补齐 **sendBeacon + PerformanceObserver(LCP/FCP)** 与 **服务端接收入库 + ClickHouse 单例与安全**；  
  2）再做了 **SDK 插件化与多格式、错误聚合与基础告警**；  
  3）最后按资源做白屏、离线队列、录屏与 Source Map。  

按上述阶段推进，可以在不影响现有能力的前提下，逐步对齐《前端监控埋点平台-功能与优化头脑风暴》中的 P0/P1，并形成可维护、可扩展的监控与埋点平台。
