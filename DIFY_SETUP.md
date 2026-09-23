# Dify AI助手配置指南

本文档说明如何配置 Dify AI 助手与知识库同步。

## 📋 前置准备

已完成的工作：
- ✅ 环境变量模板（`.env.example`）
- ✅ 同步脚本（`scripts/sync-to-dify.mjs`）+ 分片规则（`scripts/lib/dify-shard.mjs`）
- ✅ Vue组件（`.vitepress/theme/components/DifyChat.vue`）
- ✅ GitHub Actions工作流（`.github/workflows/sync-dify.yml`）
- ✅ VitePress主题集成

## 🚀 配置步骤

### 1. 在Dify平台创建知识库

1. 访问 [Dify官网](https://dify.ai) 并注册/登录账号
2. 进入控制台，创建新的知识库（Dataset）
3. 记录以下信息：
   - **Dataset API Key**：在知识库的「API 密钥」中生成，以 `dataset-` 开头（用于上传文档）
   - **Dataset ID**：知识库的唯一标识符，即知识库 URL 中 `/datasets/` 后面那段

> ⚠️ 知识库接口必须用 `dataset-` 开头的密钥。误用应用 Token（`app-` 开头）会得到 401，同步脚本会直接报错提示。

### 2. 创建Dify应用

1. 在Dify控制台创建一个新的「对话型应用」
2. 关联刚才创建的知识库
3. 配置应用设置：
   - 设置欢迎语
   - 配置提示词（可选）
   - **选择可用的模型**（注意：若模型被供应商下线，对话会返回 `Model xxx not exist`，需在此处更换）
   - 调整AI参数（温度、top-p等）
4. 发布应用并获取 **App Token**（以 `app-` 开头）

### 3. 配置域名白名单（推荐）

在 Dify 应用设置中配置允许访问的域名白名单，这样可以安全地在前端使用 Token：
- 添加你的网站域名（如 `https://space.ly57.cn`）
- 本地开发时添加 `http://localhost:5173`

> App Token 会随构建产物打包进 `/assets/app.*.js`（明文字符串），域名白名单是防止被滥用的主要手段。

### 4. 本地开发配置

复制`.env.example`为`.env`：

```bash
cp .env.example .env
```

编辑`.env`文件，填入实际的配置信息：

```ini
# 前端配置（使用 App Token）
VITE_DIFY_TOKEN=app-xxxxxxxxxxxxxx
VITE_DIFY_ENABLED=true

# 后端配置（用于同步脚本，使用 Dataset API Key）
DIFY_API_KEY=dataset-xxxxxxxxxxxxxx
DIFY_DATASET_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**注意：**
- `VITE_DIFY_TOKEN`：使用应用的 App Token（以 `app-` 开头，用于前端对话）
- `DIFY_API_KEY`：使用知识库的 API 密钥（以 `dataset-` 开头，用于上传文档）
- 两者用途不同，请在 Dify 控制台分别获取

### 5. 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets（Settings → Secrets and variables → Actions）：

**部署相关：**
- `VITE_DIFY_TOKEN`：应用的 App Token（用于前端对话）

**文档同步相关：**
- `DIFY_API_KEY`：知识库 API 密钥（`dataset-` 开头）
- `DIFY_DATASET_ID`：知识库 ID
- `DIFY_BASE_URL`（可选）：默认为 `https://api.dify.ai/v1`

### 6. 同步文档

**本地同步：**

```bash
# 安装依赖
npm install

# 预演：只打印计划，不写入 Dify
node scripts/sync-to-dify.mjs --dry-run

# 正式同步
npm run sync:dify
```

**通过GitHub Actions同步：**

1. 进入仓库的 Actions 标签页
2. 选择「Sync Docs to Dify」工作流
3. 点击「Run workflow」，按需选择参数：
   - **mode**：`incremental`（只同步本次改动的文档）或 `full`（全量比对）
   - **merge**：是否按目录合并为分片文档（**建议保持开启**，见下方配额说明）
   - **prune**：删除本地已不存在的远端文档
   - **dry_run**：仅预演
4. 查看执行日志确认同步结果

### 7. 启动本地开发服务器

```bash
npm run docs:dev
```

访问 http://localhost:5173，右下角会看到「AI助手」悬浮按钮。

## 📦 关于文档分片（重要）

Dify 免费版（Sandbox）的配额限制：

| 配额项 | 免费版 | 本站实际需求 |
|---|---|---|
| 知识库文档数 | 50 篇 | 90 篇（逐篇上传会超额） |
| 知识库存储 | 50 MB | 约 1.1 MB 文本（索引后膨胀，通常仍可容纳） |
| 知识库请求速率 | 10 次/分钟 | 同步脚本默认按 9 次/分钟节流 |

因此同步脚本**默认按叶子目录把同系列笔记合并成一篇**：

- 90 个源文件 → **18 篇**分片文档，稳在免费版配额内
- 同一主题（如 React 的 18 篇笔记）合并后，检索时能拿到更完整的上下文
- 每篇分片会记录「入口文件」用于引用跳转，映射表由 `npm run gen:map` 自动生成

若你有更高的配额（Professional 为 500 篇），可用 `--no-merge` 切回逐篇上传：

```bash
node scripts/sync-to-dify.mjs --no-merge
```

## 🎨 自定义配置

### 修改AI助手外观

组件读取 `window.difyConfig`（见 `.vitepress/theme/components/DifyChat.vue`），未配置时使用组件内默认值：

| 配置项 | 组件默认值 |
|---|---|
| `botName` | `AI助手` |
| `welcomeMessage` | `你好！有什么可以帮你的吗？` |
| `placeholder` | `输入你的问题...` |

> ⚠️ 注意：`.vitepress/public/dify-config.js` **不会生效**。VitePress 的 `publicDir` 是仓库根目录的 `public/`，而 `.vitepress/public/` 不会被拷贝到构建产物，也没有被页面引用（线上访问 `/dify-config.js` 返回 404）。如需改文案，直接改 `DifyChat.vue` 中的默认值，或按 VitePress 的方式注入该配置文件。

### 会话缓存策略

- AI 助手会将聊天记录保存到浏览器本地。
- 聊天记录默认保留 7 天，超过 7 天会自动清除。
- 可通过对话框右上角「清除会话」按钮手动清空。

### 禁用AI助手

```ini
VITE_DIFY_ENABLED=false
```

## 🔄 文档更新同步

### 增量同步

工作流默认使用 `incremental` 模式，只同步本次改动过的文档。启用自动同步（编辑 `.github/workflows/sync-dify.yml`，取消 `push` 触发器注释）：

```yaml
push:
  branches: [main]
  paths: ['docs/**/*.md']
```

## ⚠️ 注意事项

1. **API密钥安全**：
   - 不要将 `.env` 文件提交到 Git
   - GitHub Secrets 是安全的存储方式
   - 但 App Token 会被打包进前端产物，请务必配置域名白名单

2. **免费额度限制**：见上方「关于文档分片」表格。

3. **API限流**：
   - 同步脚本默认按 6500ms 间隔节流（约 9 次/分钟），避免触发免费版 10 次/分钟限制
   - 可用 `DIFY_THROTTLE_MS` 环境变量调整

4. **模型可用性**：
   - Dify 应用所选的模型若被供应商下线，对话会返回 `Model xxx not exist`
   - 需要在 Dify 控制台「编排」中更换模型并重新发布

## 🐛 故障排查

### AI助手按钮不显示

- 检查 `.env` 中的 `VITE_DIFY_ENABLED` 是否为 `true`
- 检查 `VITE_DIFY_TOKEN` 是否正确配置
- 查看浏览器控制台是否有错误信息

### 对话返回「Model xxx not exist」

应用配置的模型已被供应商下线。到 Dify 控制台 → 应用 → 编排 → 更换为可用模型 → 发布。

### 知识库直查有结果，但 AI 回答「不清楚」

**知识库的检索设置与应用里的检索设置是两套独立配置**，改了一个不一定影响另一个。

用 `node scripts/sync-to-dify.mjs --dataset` 能看到知识库侧的配置与实时自检结果。若自检显示能正常召回（如混合检索 9 条、Top1 分数 0.67），但线上问答仍拿不到任何引用片段，就说明问题在**应用侧**：

到 Dify 控制台 → 应用「小落叶机器人」→ 编排 → **上下文** → 检索设置，逐项核对：

| 检查项 | 说明 |
|---|---|
| 检索方式 | ⚠️ 不要选「关键词检索」。该知识库不会生成 keywords（`--probe` 已实测 automatic 与 custom 模式均为 0），关键词检索必然召回 0 条。请用「向量检索」或「混合检索」 |
| 重排序 | 开启前确认所选重排序模型可用；模型不可用会导致检索整体失败 |
| Top K | 建议 4～6，过小则没有容错空间 |
| 分数阈值 | 确认没有开启过高的阈值。知识库实测分数约 0.67，阈值设成 0.9 会把结果全部过滤掉 |

> 知识库侧的「召回测试」用的是知识库自己的设置，与应用的设置无关——所以它通过并不代表应用侧也能召回。

### 对话无响应

- 检查 API 密钥是否正确
- 检查网络连接
- 查看浏览器控制台 Network 标签，确认 API 请求状态
- 确认 Dify 应用的域名白名单包含当前站点

### 同步脚本失败

- 确认 `DIFY_API_KEY` 是 `dataset-` 开头（`app-` 开头会直接报错）
- 确认 Dify 服务可访问
- 若报配额错误：改用分片模式（默认），或升级套餐
- 查看脚本输出的详细错误信息

## 📚 相关资源

- [Dify官方文档](https://docs.dify.ai)
- [Dify API参考](https://docs.dify.ai/guides/application-publishing/developing-with-apis)
- [VitePress文档](https://vitepress.dev)
