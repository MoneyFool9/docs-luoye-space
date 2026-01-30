// Dify AI助手配置
// 此配置会被注入到全局window对象中
window.difyConfig = {
  // 是否启用Dify功能
  enabled: true,
  
  // Dify API配置
  // 使用 App Token（在 Dify 后台 -> 应用 -> API访问 获取）
  // App Token 以 "app-" 开头，可在 Dify 后台配置域名白名单
  token: '', // 将在构建时从环境变量注入，或直接填写
  baseUrl: 'https://api.dify.ai/v1',
  
  // 聊天设置
  chatSettings: {
    botName: '小落叶AI助手',
    welcomeMessage: '你好！我是基于你的知识库训练的AI助手，有什么可以帮你的吗？',
    placeholder: '向AI助手提问...',
    primaryColor: '#3eaf7c', // VitePress默认绿色主题色
    
    // 示例问题
    exampleQuestions: [
      'Vue3有哪些新特性？',
      '如何使用Ajax发送请求？',
      'ES6的箭头函数有什么特点？'
    ]
  },
  
  // UI配置
  uiSettings: {
    position: 'navbar', // 位置：navbar（导航栏）或 float（浮动按钮）
    buttonText: 'AI助手',
    
    // 对话框尺寸
    dialog: {
      width: 600,
      height: 500,
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100vh - var(--vp-nav-height) - 24px)'
    }
  }
}
