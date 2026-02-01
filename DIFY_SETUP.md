# Dify AI助手配置指南

本文档说明如何配置Dify AI助手功能。

## 📋 前置准备

已完成的工作：
- ✅ 环境变量模板（`.env.example`）
- ✅ 同步脚本（`scripts/sync-to-dify.mjs`）
- ✅ Vue组件（`.vitepress/theme/components/DifyChat.vue`）
- ✅ GitHub Actions工作流（`.github/workflows/sync-dify.yml`）
- ✅ VitePress主题集成

## 🚀 配置步骤

### 1. 在Dify平台创建知识库

1. 访问 [Dify官网](https://dify.ai) 并注册/登录账号
2. 进入控制台，创建新的知识库（Dataset）
3. 记录以下信息：
   - **Dataset API Key**：在设置中生成API密钥（用于上传文档）
   - **Dataset ID**：知识库的唯一标识符

### 2. 创建Dify应用

1. 在Dify控制台创建一个新的"对话型应用"
2. 关联刚才创建的知识库
3. 配置应用设置：
   - 设置欢迎语
   - 配置提示词（可选）
   - 调整AI参数（温度、top-p等）
4. 发布应用并获取 **App Token**（以 `app-` 开头）

### 3. 配置域名白名单（推荐）

在 Dify 应用设置中配置允许访问的域名白名单，这样可以安全地在前端使用 Token：
- 添加你的网站域名（如 `https://your-domain.github.io`）
- 本地开发时添加 `http://localhost:5173`

### 4. 本地开发配置

复制`.env.example`为`.env`：

```bash
cp .env.example .env
```

编辑`.env`文件，填入实际的配置信息：

```env
# 前端配置（使用 App Token）
VITE_DIFY_TOKEN=app-xxxxxxxxxxxxxx
VITE_DIFY_ENABLED=true

# 后端配置（用于同步脚本，使用 Dataset API Key）
DIFY_API_KEY=dataset-xxxxxxxxxxxxxx
DIFY_DATASET_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**注意：**
- `VITE_DIFY_TOKEN`：使用应用的 App Token（以 `app-` 开头，用于前端对话）
- `DIFY_API_KEY`：使用知识库的 API 密钥（用于上传文档到知识库）
- 两者用途不同，请在 Dify 控制台分别获取

### 5. 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets（Settings → Secrets and variables → Actions）：

**部署相关：**
- `VITE_DIFY_TOKEN`：应用的 App Token（用于前端对话）

**文档同步相关：**
- `DIFY_API_KEY`：知识库 API 密钥
- `DIFY_DATASET_ID`：知识库 ID
- `DIFY_BASE_URL`（可选）：默认为 `https://api.dify.ai/v1`

### 6. 首次同步文档

**本地测试同步：**

```bash
# 安装依赖
npm install

# 运行同步脚本
npm run sync:dify
```

**通过GitHub Actions同步：**

1. 进入仓库的Actions标签页
2. 选择"Sync Docs to Dify"工作流
3. 点击"Run workflow"手动触发
4. 查看执行日志确认同步成功

### 6. 启动本地开发服务器

```bash
npm run docs:dev
```

访问 http://localhost:5173，应该能在导航栏看到"AI助手"按钮。

## 🎨 自定义配置

### 修改AI助手外观

编辑 `.vitepress/public/dify-config.js`：

```javascript
window.difyConfig = {
  chatSettings: {
    botName: '你的AI助手名称',
    welcomeMessage: '自定义欢迎消息',
    placeholder: '自定义输入框占位符...',
    primaryColor: '#your-color', // 主题色
    exampleQuestions: [
      '示例问题1？',
      '示例问题2？'
    ]
  }
}
```

### 禁用AI助手

如果需要临时禁用AI助手功能：

**方法1：环境变量**
```env
VITE_DIFY_ENABLED=false
```

**方法2：配置文件**
在`.vitepress/public/dify-config.js`中设置：
```javascript
window.difyConfig = {
  enabled: false,
  // ...
}
```

## 🔄 文档更新同步

### 手动同步

当文档有重大更新时，可以手动触发同步：

1. GitHub Actions：在仓库的Actions页面手动运行工作流
2. 本地运行：执行 `npm run sync:dify`

### 自动定期同步（可选）

编辑 `.github/workflows/sync-dify.yml`，取消注释schedule部分：

```yaml
schedule:
  - cron: '0 0 * * 0'  # 每周日凌晨执行
```

## ⚠️ 注意事项

1. **API密钥安全**：
   - 不要将`.env`文件提交到Git
   - GitHub Secrets是安全的存储方式

2. **免费额度限制**：
   - Dify免费计划限制：50个文档、50MB存储
   - 当前文档数：14个，约0.36MB
   - 完全在免费额度内

3. **API限流**：
   - 同步脚本已内置1秒延迟避免限流
   - 如遇到限流，可增加延迟时间

4. **浏览器兼容性**：
   - 需要现代浏览器支持ES6+
   - 建议使用Chrome、Firefox、Edge最新版本

## 🐛 故障排查

### AI助手按钮不显示

- 检查`.env`文件中的`VITE_DIFY_ENABLED`是否为`true`
- 检查`VITE_DIFY_API_KEY`是否正确配置
- 查看浏览器控制台是否有错误信息

### 对话无响应

- 检查API密钥是否正确
- 检查网络连接
- 查看浏览器控制台Network标签，确认API请求状态

### 同步脚本失败

- 检查`DIFY_API_KEY`和`DIFY_DATASET_ID`是否正确
- 确认Dify服务可访问
- 查看脚本输出的详细错误信息

## 📚 相关资源

- [Dify官方文档](https://docs.dify.ai)
- [Dify API参考](https://docs.dify.ai/guides/application-publishing/developing-with-apis)
- [VitePress文档](https://vitepress.dev)

## 🎯 下一步

配置完成后，建议：

1. 测试AI助手的对话功能
2. 优化示例问题，使其更符合你的知识库内容
3. 根据用户反馈调整AI参数和提示词
4. 定期同步文档保持知识库最新

---

如有问题，请查看Dify控制台日志或GitHub Actions执行日志。
