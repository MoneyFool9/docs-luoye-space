<template>
  <div class="dify-chat-wrapper" v-if="isEnabled">
    <!-- AI助手按钮 -->
    <button 
      class="dify-chat-button" 
      @click="toggleChat"
      :title="config.chatSettings.buttonText || 'AI助手'"
    >
      <svg class="dify-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="dify-button-text">{{ config.uiSettings?.buttonText || 'AI助手' }}</span>
    </button>
    
    <!-- 对话框 -->
    <Transition name="fade-slide">
      <div v-if="isOpen" class="dify-chat-dialog" @click.stop>
        <!-- 对话框头部 -->
        <div class="dify-chat-header">
          <div class="header-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="9" cy="9" r="1" fill="currentColor"/>
              <circle cx="15" cy="9" r="1" fill="currentColor"/>
            </svg>
            <span class="header-title">{{ config.chatSettings?.botName || 'AI助手' }}</span>
          </div>
          <button class="close-button" @click="toggleChat" title="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <!-- 消息列表 -->
        <div class="dify-chat-messages" ref="messagesContainer">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-message">
            <p>{{ config.chatSettings?.welcomeMessage || '你好！有什么可以帮你的吗？' }}</p>
            <div class="example-questions" v-if="config.chatSettings?.exampleQuestions?.length">
              <p class="example-title">试试问我：</p>
              <button 
                v-for="(question, index) in config.chatSettings.exampleQuestions" 
                :key="index"
                class="example-question"
                @click="sendMessage(question)"
              >
                {{ question }}
              </button>
            </div>
          </div>
          
          <!-- 对话消息 -->
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            :class="['message', message.role]"
          >
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="message assistant">
            <div class="message-content">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="error" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <span>{{ error }}</span>
          </div>
        </div>
        
        <!-- 输入框 -->
        <div class="dify-chat-input">
          <textarea 
            v-model="inputMessage"
            :placeholder="config.chatSettings?.placeholder || '输入你的问题...'"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.exact="inputMessage += '\n'"
            ref="inputArea"
            rows="1"
          ></textarea>
          <button 
            class="send-button" 
            @click="handleSend"
            :disabled="!inputMessage.trim() || isLoading"
            title="发送 (Enter)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
    
    <!-- 背景遮罩 -->
    <Transition name="fade">
      <div v-if="isOpen" class="dify-chat-backdrop" @click="toggleChat"></div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'

const isEnabled = ref(false)
const isOpen = ref(false)
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const error = ref('')
const messagesContainer = ref(null)
const inputArea = ref(null)
const config = ref({
  chatSettings: {},
  uiSettings: {}
})
const apiKey = ref('')
const conversationId = ref('')

// 初始化配置
onMounted(() => {
  // 从环境变量或全局配置读取
  if (typeof window !== 'undefined') {
    config.value = window.difyConfig || config.value
    
    // 检查是否启用
    const envEnabled = import.meta.env.VITE_DIFY_ENABLED
    const configEnabled = config.value.enabled
    
    isEnabled.value = envEnabled !== 'false' && configEnabled !== false
    
    // 获取API密钥
    apiKey.value = import.meta.env.VITE_DIFY_API_KEY || config.value.apiKey || ''
    
    if (isEnabled.value && !apiKey.value) {
      console.warn('[Dify] API密钥未配置，AI助手功能已禁用')
      isEnabled.value = false
    }
  }
})

// 切换对话框
const toggleChat = () => {
  isOpen.value = !isOpen.value
  error.value = ''
  
  if (isOpen.value) {
    nextTick(() => {
      inputArea.value?.focus()
    })
  }
}

// 发送消息
const handleSend = () => {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return
  
  sendMessage(message)
}

const sendMessage = async (message) => {
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: message,
    time: formatTime(new Date())
  })
  
  inputMessage.value = ''
  error.value = ''
  isLoading.value = true
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  
  try {
    // 调用Dify API
    const response = await fetch(`${config.value.baseUrl || 'https://api.dify.ai/v1'}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'blocking',
        conversation_id: conversationId.value || undefined,
        user: 'vitepress-user'
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 保存会话ID
    if (data.conversation_id) {
      conversationId.value = data.conversation_id
    }
    
    // 添加AI回复
    messages.value.push({
      role: 'assistant',
      content: data.answer || '抱歉，我无法回答这个问题。',
      time: formatTime(new Date())
    })
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (err) {
    console.error('[Dify] API调用失败:', err)
    error.value = `发送失败: ${err.message}。请检查网络连接或稍后重试。`
  } finally {
    isLoading.value = false
  }
}

// 格式化消息内容（支持简单的markdown）
const formatMessage = (content) => {
  if (!content) return ''
  
  // 转义HTML
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // 代码块
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
  
  // 行内代码
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // 粗体
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  
  // 链接
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
  
  // 换行
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}

// 格式化时间
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.dify-chat-wrapper {
  position: relative;
}

/* 按钮样式 */
.dify-chat-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 37px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.dify-chat-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.dify-icon {
  flex-shrink: 0;
}

.dify-button-text {
  white-space: nowrap;
}

/* 对话框样式 */
.dify-chat-dialog {
  position: fixed;
  top: calc(var(--vp-nav-height) + 12px);
  right: 12px;
  width: 600px;
  height: 500px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - var(--vp-nav-height) - 24px);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: var(--vp-shadow-3);
  z-index: 100;
  overflow: hidden;
}

/* 头部 */
.dify-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-1);
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

/* 消息列表 */
.dify-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome-message {
  text-align: center;
  color: var(--vp-c-text-2);
  padding: 20px;
}

.welcome-message p {
  margin-bottom: 20px;
  font-size: 15px;
}

.example-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.example-title {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}

.example-question {
  padding: 8px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 80%;
  text-align: left;
}

.example-question:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* 消息气泡 */
.message {
  display: flex;
  animation: fadeIn 0.3s ease;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.user .message-content {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.message.assistant .message-content {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.message-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.message-text :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.message-text :deep(pre) {
  margin: 8px 0;
  padding: 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.message-text :deep(pre code) {
  padding: 0;
  background: none;
}

.message-text :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
  text-align: right;
}

/* 加载动画 */
.loading-dots {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  font-size: 13px;
}

/* 输入框 */
.dify-chat-input {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.dify-chat-input textarea {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.dify-chat-input textarea:focus {
  border-color: var(--vp-c-brand-1);
}

.send-button {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 背景遮罩 */
.dify-chat-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
}

/* 动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .dify-button-text {
    display: none;
  }
  
  .dify-chat-dialog {
    left: 12px;
    right: 12px;
    width: auto;
    height: calc(100vh - var(--vp-nav-height) - 24px);
  }
}

/* 滚动条样式 */
.dify-chat-messages::-webkit-scrollbar {
  width: 6px;
}

.dify-chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.dify-chat-messages::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 3px;
}

.dify-chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-3);
}
</style>
