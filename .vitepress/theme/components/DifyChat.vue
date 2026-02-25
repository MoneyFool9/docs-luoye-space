<template>
  <div :class="['dify-chat-wrapper', `is-${positionMode}`]" v-if="isEnabled">
    <!-- AI助手按钮 -->
    <button
      :class="['dify-chat-button', { floating: positionMode === 'float' }]"
      @click="toggleChat"
      :title="config.uiSettings?.buttonText || 'AI助手'"
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
      <div
        v-if="isOpen"
        :class="['dify-chat-dialog', { fullscreen: isFullscreen, dragging: isDragging }]"
        :style="dialogStyle"
        @click.stop
      >
        <!-- 对话框头部 -->
        <div
          class="dify-chat-header"
          @mousedown="startDrag"
        >
          <div class="header-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="9" cy="9" r="1" fill="currentColor"/>
              <circle cx="15" cy="9" r="1" fill="currentColor"/>
            </svg>
            <span class="header-title">{{ config.chatSettings?.botName || 'AI助手' }}</span>
          </div>
          <div class="header-right">
            <button class="fullscreen-button" @mousedown.stop @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
              <!-- 全屏图标 -->
              <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 退出全屏图标 -->
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="clear-button" @mousedown.stop @click="clearConversation" title="清除会话" v-if="messages.length > 0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="close-button" @mousedown.stop @click="toggleChat" title="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
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
              <!-- 思考过程 -->
              <div v-if="message.thinking" class="thinking-block">
                <div class="thinking-header" @click="toggleThinking(index)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>思考过程</span>
                  <svg :class="['thinking-arrow', { expanded: message.thinkingExpanded }]" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div v-show="message.thinkingExpanded" class="thinking-content" v-html="formatMessage(message.thinking)"></div>
              </div>
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <!-- 引用来源 -->
              <div v-if="message.references && message.references.length" class="references-block">
                <div class="references-header" @click="toggleReferences(index)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>引用来源 ({{ message.references.length }})</span>
                  <svg :class="['references-arrow', { expanded: message.referencesExpanded }]" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div v-show="message.referencesExpanded" class="references-content">
                  <div 
                    v-for="(ref, refIndex) in message.references" 
                    :key="refIndex" 
                    class="reference-item"
                    @click="navigateToReference(ref)"
                  >
                    <div class="reference-title">
                      <span>{{ ref.document_name || '未知文档' }}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="reference-text">{{ ref.content }}</div>
                  </div>
                </div>
              </div>
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
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'

const isEnabled = ref(false)
const isOpen = ref(false)
const isFullscreen = ref(false)
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const error = ref('')
const messagesContainer = ref(null)
const inputArea = ref(null)
const isDragging = ref(false)
const dialogPosition = ref({ left: 0, top: 0 })
const hasCustomPosition = ref(false)
const config = ref({
  chatSettings: {},
  uiSettings: {}
})
const token = ref('')
const conversationId = ref('')

// localStorage 存储 key
const STORAGE_KEY = 'dify-chat-history'
const CONVERSATION_KEY = 'dify-conversation-id'
const USER_ID_KEY = 'dify-user-id'
const STORAGE_META_KEY = 'dify-chat-meta'
const CHAT_EXPIRE_DAYS = 7

const positionMode = computed(() => config.value.uiSettings?.position || 'float')

const dialogStyle = computed(() => {
  const dialog = config.value.uiSettings?.dialog || {}
  const style = {
    width: dialog.width ? `${dialog.width}px` : undefined,
    height: dialog.height ? `${dialog.height}px` : undefined,
    maxWidth: dialog.maxWidth,
    maxHeight: dialog.maxHeight
  }

  if (!isFullscreen.value && hasCustomPosition.value) {
    style.left = `${dialogPosition.value.left}px`
    style.top = `${dialogPosition.value.top}px`
    style.right = 'auto'
  }

  return style
})

const getExpireMs = () => CHAT_EXPIRE_DAYS * 24 * 60 * 60 * 1000

// 获取或生成用户ID
const getUserId = () => {
  if (typeof window === 'undefined') return 'anonymous'
  
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    // 生成唯一用户ID
    userId = 'user-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

// 保存会话到 localStorage
const saveConversation = () => {
  if (typeof window === 'undefined') return
  
  try {
    // 保存消息列表（排除临时状态）
    const messagesToSave = messages.value.map(msg => ({
      role: msg.role,
      content: msg.content,
      thinking: msg.thinking || '',
      references: msg.references || [],
      time: msg.time
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave))
    localStorage.setItem(STORAGE_META_KEY, JSON.stringify({ savedAt: Date.now() }))
    
    // 保存会话ID
    if (conversationId.value) {
      localStorage.setItem(CONVERSATION_KEY, conversationId.value)
    }
  } catch (e) {
    console.warn('[Dify] 保存会话失败:', e)
  }
}

// 从 localStorage 恢复会话
const loadConversation = () => {
  if (typeof window === 'undefined') return
  
  try {
    const metaRaw = localStorage.getItem(STORAGE_META_KEY)
    if (metaRaw) {
      const meta = JSON.parse(metaRaw)
      const savedAt = Number(meta?.savedAt || 0)
      if (!savedAt || Date.now() - savedAt > getExpireMs()) {
        clearConversation()
        return
      }
    }

    // 恢复消息列表
    const savedMessages = localStorage.getItem(STORAGE_KEY)
    if (savedMessages) {
      if (!metaRaw) {
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify({ savedAt: Date.now() }))
      }
      const parsed = JSON.parse(savedMessages)
      messages.value = parsed.map(msg => ({
        ...msg,
        thinkingExpanded: false,
        referencesExpanded: false
      }))
    }
    
    // 恢复会话ID
    const savedConversationId = localStorage.getItem(CONVERSATION_KEY)
    if (savedConversationId) {
      conversationId.value = savedConversationId
    }
  } catch (e) {
    console.warn('[Dify] 恢复会话失败:', e)
  }
}

// 清除会话
const clearConversation = () => {
  messages.value = []
  conversationId.value = ''
  error.value = ''
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CONVERSATION_KEY)
    localStorage.removeItem(STORAGE_META_KEY)
  }
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    hasCustomPosition.value = false
  }
}

const getDialogRect = () => {
  const dialog = config.value.uiSettings?.dialog || {}
  const width = Number(dialog.width || 600)
  const height = Number(dialog.height || 500)
  return { width, height }
}

const clampDialogPosition = (left, top) => {
  if (typeof window === 'undefined') return { left, top }
  const { width, height } = getDialogRect()
  const maxLeft = Math.max(0, window.innerWidth - width)
  const maxTop = Math.max(0, window.innerHeight - height)
  return {
    left: Math.min(Math.max(0, left), maxLeft),
    top: Math.min(Math.max(0, top), maxTop)
  }
}

const initDialogPosition = () => {
  if (typeof window === 'undefined') return
  const { width } = getDialogRect()
  const defaultLeft = Math.max(12, window.innerWidth - width - 12)
  const defaultTop = 12 + 64
  dialogPosition.value = clampDialogPosition(defaultLeft, defaultTop)
}

const dragState = {
  startX: 0,
  startY: 0,
  startLeft: 0,
  startTop: 0
}

const stopDrag = () => {
  isDragging.value = false
  if (typeof window === 'undefined') return
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

const onDrag = (event) => {
  if (!isDragging.value || isFullscreen.value) return
  const left = dragState.startLeft + (event.clientX - dragState.startX)
  const top = dragState.startTop + (event.clientY - dragState.startY)
  dialogPosition.value = clampDialogPosition(left, top)
}

const startDrag = (event) => {
  if (positionMode.value !== 'float' || isFullscreen.value) return
  if (event.button !== 0) return

  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.startLeft = dialogPosition.value.left
  dragState.startTop = dialogPosition.value.top
  isDragging.value = true
  hasCustomPosition.value = true

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const handleResize = () => {
  if (isFullscreen.value || !hasCustomPosition.value) return
  dialogPosition.value = clampDialogPosition(dialogPosition.value.left, dialogPosition.value.top)
}

// 初始化配置
onMounted(() => {
  // 从环境变量或全局配置读取
  if (typeof window !== 'undefined') {
    config.value = window.difyConfig || config.value
    
    // 检查是否启用
    const envEnabled = import.meta.env.VITE_DIFY_ENABLED
    const configEnabled = config.value.enabled
    
    isEnabled.value = envEnabled !== 'false' && configEnabled !== false
    
    // 获取 App Token（优先级：环境变量 > 配置文件）
    token.value = import.meta.env.VITE_DIFY_TOKEN || config.value.token || ''
    
    if (isEnabled.value && !token.value) {
      console.warn('[Dify] App Token未配置，AI助手功能已禁用')
      isEnabled.value = false
    }
    
    // 加载保存的会话
    loadConversation()
    initDialogPosition()
    window.addEventListener('resize', handleResize)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
  stopDrag()
})

// 切换对话框
const toggleChat = () => {
  isOpen.value = !isOpen.value
  error.value = ''
  
  if (isOpen.value) {
    if (!hasCustomPosition.value) {
      initDialogPosition()
    }
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
    // 调用Dify API（流式模式）
    const response = await fetch(`${config.value.baseUrl || 'https://api.dify.ai/v1'}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: conversationId.value || undefined,
        user: getUserId()
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API错误: ${response.status}`)
    }
    
    // 添加AI回复占位
    const assistantMessage = {
      role: 'assistant',
      content: '',
      thinking: '',
      thinkingExpanded: false,
      references: [],
      referencesExpanded: false,
      time: formatTime(new Date())
    }
    messages.value.push(assistantMessage)
    const messageIndex = messages.value.length - 1
    
    // 处理流式响应
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullAnswer = ''  // 原始完整内容（包含<think>标签）
    let isInThinkTag = false  // 是否在<think>标签内
    
    isLoading.value = false // 开始流式输出后关闭加载状态
    
    // 解析并分离thinking和content
    const parseThinkingContent = (raw) => {
      let thinking = ''
      let content = ''
      
      // 检查是否有完整的<think>标签
      const thinkStartIndex = raw.indexOf('<think>')
      const thinkEndIndex = raw.indexOf('</think>')
      
      if (thinkStartIndex !== -1) {
        if (thinkEndIndex !== -1) {
          // 完整的<think>标签
          thinking = raw.substring(thinkStartIndex + 7, thinkEndIndex).trim()
          content = (raw.substring(0, thinkStartIndex) + raw.substring(thinkEndIndex + 8)).trim()
        } else {
          // <think>标签未闭合，正在思考中
          thinking = raw.substring(thinkStartIndex + 7).trim()
          content = raw.substring(0, thinkStartIndex).trim()
          isInThinkTag = true
        }
      } else if (isInThinkTag && thinkEndIndex !== -1) {
        // 之前在<think>中，现在找到了闭合标签
        // 这种情况不会发生，因为fullAnswer包含完整历史
        content = raw
      } else {
        content = raw
      }
      
      return { thinking, content }
    }
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      // 处理SSE格式数据
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留未完成的行
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue
          
          try {
            const data = JSON.parse(jsonStr)
            
            // 保存会话ID
            if (data.conversation_id) {
              conversationId.value = data.conversation_id
            }
            
            // 处理不同的事件类型
            const eventType = data.event
            
            switch (eventType) {
              case 'agent_thought':
                // Agent思考过程（另一种格式）
                if (data.thought) {
                  messages.value[messageIndex].thinking = data.thought
                  messages.value[messageIndex].thinkingExpanded = true
                }
                break
                
              case 'message':
              case 'agent_message':
                // 正常消息内容（增量）
                if (data.answer !== undefined) {
                  fullAnswer += data.answer
                  
                  // 解析<think>标签
                  const { thinking, content } = parseThinkingContent(fullAnswer)
                  
                  // 更新thinking内容
                  if (thinking) {
                    messages.value[messageIndex].thinking = thinking
                    // 如果还在思考中（未闭合），展开thinking
                    if (isInThinkTag) {
                      messages.value[messageIndex].thinkingExpanded = true
                    } else {
                      // thinking完成后收起
                      messages.value[messageIndex].thinkingExpanded = false
                    }
                  }
                  
                  // 更新正文内容
                  messages.value[messageIndex].content = content
                }
                break
                
              case 'message_end':
                // 消息结束，处理引用来源
                if (data.metadata?.retriever_resources && data.metadata.retriever_resources.length > 0) {
                  messages.value[messageIndex].references = data.metadata.retriever_resources.map(ref => ({
                    document_name: ref.document_name || ref.dataset_name || '未知文档',
                    content: ref.content || ref.segment_content || ''
                  }))
                }
                break
                
              case 'error':
                // 错误
                throw new Error(data.message || '请求处理出错')
                
              default:
                // 兼容旧格式：直接包含answer字段
                if (data.answer !== undefined && !eventType) {
                  fullAnswer += data.answer
                  const { thinking, content } = parseThinkingContent(fullAnswer)
                  if (thinking) {
                    messages.value[messageIndex].thinking = thinking
                  }
                  messages.value[messageIndex].content = content
                }
            }
            
            // 滚动到底部
            nextTick(() => {
              scrollToBottom()
            })
          } catch (e) {
            if (e.message && e.message !== 'Unexpected end of JSON input') {
              console.warn('[Dify] 解析错误:', e.message)
            }
          }
        }
      }
    }
    
    // 如果没有收到任何内容
    if (!messages.value[messageIndex].content) {
      messages.value[messageIndex].content = '抱歉，我无法回答这个问题。'
    }
    
    // 保存会话到 localStorage
    saveConversation()
    
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

// 切换思考过程展开/收起
const toggleThinking = (index) => {
  if (messages.value[index]) {
    messages.value[index].thinkingExpanded = !messages.value[index].thinkingExpanded
  }
}

// 切换引用来源展开/收起
const toggleReferences = (index) => {
  if (messages.value[index]) {
    messages.value[index].referencesExpanded = !messages.value[index].referencesExpanded
  }
}

// 导入文档路径映射表
import docPathMap from '../../doc-path-map.json'

// 从 config.js 导入中文名到英文路径的映射
import { textAndIndexMap } from '../../../utils/config.js'

// 生成反向映射表：name -> key（用于目录名映射）
const pathMap = Object.fromEntries(
  Object.entries(textAndIndexMap).map(([key, value]) => [value.name, key])
)

// 跳转到引用文档
const navigateToReference = (ref) => {
  if (!ref.document_name) return

  // 提取文件名（移除可能的路径前缀）
  let fileName = ref.document_name
  if (fileName.includes('/') || fileName.includes('\\')) {
    fileName = fileName.split(/[/\\]/).pop()
  }

  // 确保有 .md 后缀
  if (!fileName.endsWith('.md')) {
    fileName += '.md'
  }

  // 从映射表查找完整路径
  let fullPath = docPathMap[fileName]

  if (!fullPath) {
    console.warn('[DifyChat] 未找到文档映射:', fileName)
    return
  }

  // 如果是数组（同名文件），取第一个
  if (Array.isArray(fullPath)) {
    console.warn('[DifyChat] 发现同名文件，使用第一个:', fullPath)
    fullPath = fullPath[0]
  }

  // 移除 docs/ 前缀
  let docPath = fullPath.replace(/^docs\//, '')

  // 移除 .md 后缀
  docPath = docPath.replace(/\.md$/, '')

  // 对路径中的每个部分进行目录名映射（中文名 -> 英文路径）
  const parts = docPath.split('/')
  const mappedParts = parts.map(part => {
    return pathMap[part] || part
  })

  // 构建最终 URL
  const finalPath = '/docs/' + mappedParts.join('/') + '.html'

  console.log('[DifyChat] 引用跳转:', {
    原始名称: ref.document_name,
    文件名: fileName,
    映射路径: fullPath,
    最终URL: finalPath
  })

  // 在新窗口打开文档
  window.open(finalPath, '_blank')
}
</script>

<style scoped>
.dify-chat-wrapper {
  position: relative;
}

.dify-chat-wrapper.is-float {
  position: static;
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

.dify-chat-button.floating {
  position: fixed;
  right: 24px;
  bottom: 24px;
  height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
  box-shadow: 0 10px 30px rgba(62, 175, 124, 0.32);
  z-index: 60;
}

.dify-chat-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.dify-chat-button.floating:hover {
  transform: translateY(-1px);
  color: #fff;
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
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
  transition: all 0.3s ease;
}

.dify-chat-dialog.dragging {
  transition: none;
  user-select: none;
}

/* 全屏模式 */
.dify-chat-dialog.fullscreen {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
  border: none;
}

.dify-chat-dialog.fullscreen .dify-chat-messages {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.dify-chat-dialog.fullscreen .message-content {
  max-width: 70%;
}

.dify-chat-dialog.fullscreen .dify-chat-input {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 16px 24px;
}

/* 头部 */
.dify-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
  cursor: move;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.fullscreen-button {
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

.fullscreen-button:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-brand-1);
}

.clear-button {
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

.clear-button:hover {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
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
  min-width: 0;
  padding: 10px 14px;
  border-radius: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  overflow: hidden;
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
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

/* 思考过程样式 */
.thinking-block {
  margin-bottom: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.thinking-header:hover {
  background: var(--vp-c-default-soft);
}

.thinking-header svg {
  flex-shrink: 0;
}

.thinking-arrow {
  margin-left: auto;
  transition: transform 0.2s;
}

.thinking-arrow.expanded {
  transform: rotate(180deg);
}

.thinking-content {
  padding: 10px 12px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  max-height: 200px;
  overflow-y: auto;
}

.thinking-content :deep(code) {
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.08);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

/* 引用来源样式 */
.references-block {
  margin-top: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.references-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.references-header:hover {
  background: var(--vp-c-default-soft);
}

.references-header svg {
  flex-shrink: 0;
}

.references-arrow {
  margin-left: auto;
  transition: transform 0.2s;
}

.references-arrow.expanded {
  transform: rotate(180deg);
}

.references-content {
  border-top: 1px solid var(--vp-c-divider);
  max-height: 300px;
  overflow-y: auto;
}

.reference-item {
  padding: 10px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: background 0.2s;
}

.reference-item:hover {
  background: var(--vp-c-default-soft);
}

.reference-item:last-child {
  border-bottom: none;
}

.reference-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.reference-title::before {
  content: '📄';
  font-size: 11px;
}

.reference-title svg {
  margin-left: auto;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.reference-item:hover .reference-title svg {
  opacity: 1;
}

.reference-text {
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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

  .dify-chat-header {
    cursor: default;
  }

  .dify-chat-button.floating {
    right: 16px;
    bottom: 16px;
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
