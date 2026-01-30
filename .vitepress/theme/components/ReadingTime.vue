<template>
  <div class="reading-time">
    <span class="reading-time-icon">📖</span>
    <span class="reading-time-text">预计阅读时长：{{ readingTime }} 分钟</span>
    <span class="word-count">字数：{{ wordCount }}</span>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page } = useData()
const route = useRoute()
const content = ref('')

// 更新文章内容的函数
const updateContent = async () => {
  // 等待 DOM 更新
  await nextTick()
  // 获取文章内容
  const articleContent = document.querySelector('.vp-doc')
  if (articleContent) {
    content.value = articleContent.textContent || ''
  }
}

// 首次加载时获取内容
onMounted(() => {
  updateContent()
})

// 监听路由变化，重新获取内容
watch(() => route.path, () => {
  updateContent()
})

// 计算字数
const wordCount = computed(() => {
  if (!content.value) return 0
  // 中文字符
  const chineseChars = content.value.match(/[\u4e00-\u9fa5]/g) || []
  // 英文单词
  const englishWords = content.value.match(/[a-zA-Z]+/g) || []
  return chineseChars.length + englishWords.length
})

// 计算阅读时长（分钟）
const readingTime = computed(() => {
  if (!content.value) return 0
  // 中文：300字/分钟
  const chineseChars = content.value.match(/[\u4e00-\u9fa5]/g) || []
  const chineseTime = chineseChars.length / 300
  
  // 英文：200词/分钟
  const englishWords = content.value.match(/[a-zA-Z]+/g) || []
  const englishTime = englishWords.length / 200
  
  const totalMinutes = Math.ceil(chineseTime + englishTime)
  return totalMinutes < 1 ? 1 : totalMinutes
})
</script>

<style scoped>
.reading-time {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  margin: 16px 0;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.reading-time-icon {
  font-size: 18px;
}

.reading-time-text {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.word-count {
  color: var(--vp-c-text-3);
}

@media (max-width: 768px) {
  .reading-time {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
  }
}
</style>
