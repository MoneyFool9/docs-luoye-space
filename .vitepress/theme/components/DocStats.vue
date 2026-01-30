<template>
  <div class="doc-stats">
    <h2>📊 知识库统计</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total?.totalDocs || 0 }}</div>
        <div class="stat-label">文档总数</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ formatNumber(stats.total?.totalWords) }}</div>
        <div class="stat-label">总字数</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ stats.total?.categories || 0 }}</div>
        <div class="stat-label">分类数量</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ stats.total?.lastUpdate || '未知' }}</div>
        <div class="stat-label">最后更新</div>
      </div>
    </div>

    <div class="category-stats" v-if="stats.byCategory">
      <h3>📁 分类统计</h3>
      <div class="category-list">
        <div 
          v-for="(stat, category) in stats.byCategory" 
          :key="category"
          class="category-item"
        >
          <span class="category-name">{{ stat.displayName }}</span>
          <span class="category-count">{{ stat.count }} 篇</span>
          <span class="category-words">{{ formatNumber(stat.wordCount) }} 字</span>
        </div>
      </div>
    </div>

    <div class="recent-docs" v-if="stats.recent && stats.recent.length > 0">
      <h3>🕒 最近更新</h3>
      <ul class="recent-list">
        <li v-for="doc in stats.recent" :key="doc.path" class="recent-item">
          <a :href="doc.path" class="recent-link">
            <span class="recent-name">{{ doc.name }}</span>
            <span class="recent-meta">
              <span class="recent-category">{{ doc.category }}</span>
              <span class="recent-date">{{ doc.lastModified }}</span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({})

onMounted(async () => {
  try {
    const response = await fetch('/doc-stats.json')
    stats.value = await response.json()
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
})

function formatNumber(num) {
  if (!num) return '0'
  return num.toLocaleString('zh-CN')
}
</script>

<style scoped>
.doc-stats {
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin: 24px 0;
}

.doc-stats h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--vp-c-text-1);
  font-size: 24px;
}

.doc-stats h3 {
  margin: 24px 0 16px;
  color: var(--vp-c-text-1);
  font-size: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--vp-c-bg);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--vp-c-brand-1);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 14px;
}

.category-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
  flex: 1;
}

.category-count {
  color: var(--vp-c-brand-1);
  margin-right: 16px;
}

.category-words {
  color: var(--vp-c-text-3);
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-item {
  margin-bottom: 8px;
}

.recent-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.recent-link:hover {
  background: var(--vp-c-default-soft);
}

.recent-name {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.recent-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.recent-category {
  color: var(--vp-c-brand-1);
}

.recent-date {
  color: var(--vp-c-text-3);
}

@media (max-width: 768px) {
  .doc-stats {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-link {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .recent-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
