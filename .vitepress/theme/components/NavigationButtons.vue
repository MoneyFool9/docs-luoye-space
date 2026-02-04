<template>
  <div class="navigation-buttons">
    <!-- 返回上一页按钮 - 有历史记录时始终显示 -->
    <Transition name="nav-button-fade">
      <button 
        v-if="hasHistory" 
        @click="goBack" 
        class="nav-button back-button"
        title="返回上一页"
        aria-label="返回上一页"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    </Transition>

    <!-- 回到顶部按钮 - 滚动后才显示 -->
    <Transition name="nav-button-fade">
      <button 
        v-if="showTopButton"
        @click="scrollToTop" 
        class="nav-button top-button"
        title="回到顶部"
        aria-label="回到顶部"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        <!-- 滚动进度环（可选） -->
        <svg v-if="showProgress" class="progress-ring" width="52" height="52">
          <circle
            class="progress-ring-circle"
            stroke="var(--vp-c-brand-1)"
            stroke-width="2"
            fill="transparent"
            r="23"
            cx="26"
            cy="26"
            :style="{ strokeDashoffset: progressOffset }"
          />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 状态
const scrollY = ref(0)

// 配置
const SCROLL_THRESHOLD = 300 // 显示回到顶部按钮的滚动阈值（像素）
const SHOW_PROGRESS = true // 是否显示滚动进度环

// 计算是否有历史记录（返回按钮始终显示）
const hasHistory = computed(() => {
  // SSR 安全检查
  if (typeof window === 'undefined') return false
  return window.history.length > 1
})

// 计算是否显示回到顶部按钮（只在滚动后显示）
const showTopButton = computed(() => {
  return scrollY.value > SCROLL_THRESHOLD
})

// 是否显示进度环
const showProgress = computed(() => SHOW_PROGRESS)

// 计算滚动进度（用于进度环）
const scrollProgress = computed(() => {
  // SSR 安全检查
  if (typeof window === 'undefined') return 0
  
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollableHeight = documentHeight - windowHeight
  
  if (scrollableHeight <= 0) return 0
  
  return (scrollY.value / scrollableHeight) * 100
})

// 进度环的 strokeDashoffset（用于绘制进度）
const progressOffset = computed(() => {
  const circumference = 2 * Math.PI * 23 // 2πr，r=23
  const progress = scrollProgress.value / 100
  return circumference * (1 - progress)
})

// 防抖处理滚动事件
let scrollTimeout = null
function handleScroll() {
  // SSR 安全检查
  if (typeof window === 'undefined') return
  
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  scrollTimeout = setTimeout(() => {
    scrollY.value = window.scrollY
  }, 10)
}

// 返回上一页
function goBack() {
  // SSR 安全检查
  if (typeof window === 'undefined') return
  // 直接使用浏览器 History API
  window.history.back()
}

// 回到顶部
function scrollToTop() {
  // SSR 安全检查
  if (typeof window === 'undefined') return
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 生命周期
onMounted(() => {
  // SSR 安全检查
  if (typeof window === 'undefined') return
  
  // 初始化滚动位置
  scrollY.value = window.scrollY
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  // SSR 安全检查
  if (typeof window === 'undefined') return
  
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style scoped>
.navigation-buttons {
  position: fixed;
  right: 24px;
  bottom: 80px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-button {
  position: relative;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 半透明背景 */
.nav-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--vp-c-bg);
  opacity: 0.9;
  z-index: -1;
}

.nav-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  color: var(--vp-c-brand-1);
}

.nav-button:active {
  transform: translateY(0) scale(0.98);
}

/* 返回按钮特殊样式 */
.back-button:hover {
  background: var(--vp-c-brand-soft);
}

/* 回到顶部按钮特殊样式 */
.top-button:hover {
  background: var(--vp-c-brand-soft);
}

/* 滚动进度环 */
.progress-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  transform: rotate(-90deg);
  pointer-events: none;
}

.progress-ring-circle {
  stroke-dasharray: 144.51; /* 2πr = 2 * 3.14159 * 23 */
  stroke-dashoffset: 144.51;
  transition: stroke-dashoffset 0.1s ease;
}

/* 单个按钮淡入淡出动画 */
.nav-button-fade-enter-active,
.nav-button-fade-leave-active {
  transition: all 0.3s ease;
}

.nav-button-fade-enter-from,
.nav-button-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 暗色模式调整 */
.dark .nav-button {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.dark .nav-button:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .navigation-buttons {
    right: 16px;
    bottom: 70px;
    gap: 10px;
  }

  .nav-button {
    width: 40px;
    height: 40px;
  }

  .nav-button svg {
    width: 18px;
    height: 18px;
  }

  .progress-ring {
    width: 44px;
    height: 44px;
    top: -2px;
    left: -2px;
  }

  .progress-ring-circle {
    r: 20;
    cx: 22;
    cy: 22;
    stroke-dasharray: 125.66; /* 2 * 3.14159 * 20 */
    stroke-dashoffset: 125.66;
  }
}

/* 小屏幕进一步优化 */
@media (max-width: 480px) {
  .navigation-buttons {
    right: 12px;
    bottom: 60px;
  }

  .nav-button {
    width: 36px;
    height: 36px;
  }

  .nav-button svg {
    width: 16px;
    height: 16px;
  }
}

/* 确保按钮不会遮挡 Dify 聊天按钮 */
@media (min-width: 769px) {
  .navigation-buttons {
    bottom: 24px;
  }
}

/* 针对有侧边栏的页面调整位置 */
.VPDoc.has-aside .navigation-buttons {
  right: 24px;
}

@media (max-width: 1280px) {
  .VPDoc.has-aside .navigation-buttons {
    right: 16px;
  }
}
</style>
