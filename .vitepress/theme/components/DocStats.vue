<template>
  <div class="doc-stats-terminal">
    <!-- Terminal Header -->
    <div class="terminal-header">
      <div class="terminal-controls">
        <span class="control-dot red"></span>
        <span class="control-dot yellow"></span>
        <span class="control-dot green"></span>
      </div>
      <div class="terminal-title">~/docs/stats.sh</div>
    </div>

    <!-- Stats Content -->
    <div class="terminal-content">
      <!-- Main Stats -->
      <div class="command-section">
        <div class="command-prompt">
          <span class="prompt-symbol">$</span>
          <span class="command-text">du -sh ~/knowledge-base/*</span>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <div class="stat-value">{{ stats.total?.totalDocs || 0 }}</div>
            <div class="stat-label">文档总数</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div class="stat-value">{{ formatNumber(stats.total?.totalWords) }}</div>
            <div class="stat-label">总字数</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="stat-value">{{ stats.total?.categories || 0 }}</div>
            <div class="stat-label">分类数量</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="stat-value">{{ stats.total?.lastUpdate || '未知' }}</div>
            <div class="stat-label">最后更新</div>
          </div>
        </div>
      </div>

      <!-- Category Stats -->
      <div class="command-section" v-if="stats.byCategory">
        <div class="command-prompt">
          <span class="prompt-symbol">$</span>
          <span class="command-text">ls -la ~/docs/categories/</span>
        </div>
        <div class="category-list">
          <div 
            v-for="(stat, category) in stats.byCategory" 
            :key="category"
            class="category-item"
          >
            <span class="file-permissions">drwxr-xr-x</span>
            <span class="category-name">{{ stat.displayName }}</span>
            <span class="category-count">{{ stat.count }}篇</span>
            <span class="category-words">{{ formatNumber(stat.wordCount) }}字</span>
          </div>
        </div>
      </div>

      <!-- Recent Docs -->
      <div class="command-section" v-if="stats.recent && stats.recent.length > 0">
        <div class="command-prompt">
          <span class="prompt-symbol">$</span>
          <span class="command-text">git log --oneline -n 5</span>
        </div>
        <ul class="recent-list">
          <li v-for="doc in stats.recent" :key="doc.path" class="recent-item">
            <a :href="doc.path" class="recent-link">
              <span class="commit-hash">{{ generateHash(doc.name) }}</span>
              <span class="recent-name">{{ doc.name }}</span>
              <span class="recent-category">{{ doc.category }}</span>
              <span class="recent-date">{{ doc.lastModified }}</span>
            </a>
          </li>
        </ul>
      </div>
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

function generateHash(name) {
  // 生成伪git commit hash
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash.toString(16).substring(0, 7)
}
</script>

<style scoped>
.doc-stats-terminal {
  max-width: 100%;
  margin: 3rem auto;
  padding: 0 2rem;
}

@media (min-width: 1440px) {
  .doc-stats-terminal {
    max-width: 1400px;
  }
}

@media (min-width: 1920px) {
  .doc-stats-terminal {
    max-width: 1600px;
  }
}

/* Terminal Header */
.terminal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px 12px 0 0;
  border: 1px solid var(--vp-c-divider);
  border-bottom: none;
}

.terminal-controls {
  display: flex;
  gap: 0.5rem;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: opacity 0.2s;
}

.control-dot:hover {
  opacity: 0.8;
}

.control-dot.red {
  background: #ff5f56;
}

.control-dot.yellow {
  background: #ffbd2e;
}

.control-dot.green {
  background: #27c93f;
}

.terminal-title {
  color: var(--vp-c-text-2);
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

/* Terminal Content */
.terminal-content {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.command-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.command-prompt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.prompt-symbol {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.command-text {
  color: var(--vp-c-text-2);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-4px);
}

.stat-icon {
  width: 32px;
  height: 32px;
  color: var(--vp-c-brand-1);
}

.stat-icon svg {
  width: 100%;
  height: 100%;
}

.stat-value {
  color: var(--vp-c-brand-1);
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-label {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  text-align: center;
}

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.category-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
}

.file-permissions {
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}

.category-name {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.category-count {
  color: var(--vp-c-brand-1);
}

.category-words {
  color: var(--vp-c-text-2);
}

/* Recent List */
.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-item {
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.recent-link {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.recent-link:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
}

.commit-hash {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.recent-name {
  color: var(--vp-c-text-1);
}

.recent-category {
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}

.recent-date {
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .doc-stats-terminal {
    padding: 0 0.75rem;
    margin: 1.5rem auto;
  }

  .terminal-content {
    padding: 1.5rem 1rem;
  }

  .terminal-header {
    padding: 0.75rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .file-permissions {
    display: none;
  }

  .recent-link {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .commit-hash {
    font-size: 0.75rem;
  }
}

/* Remove shadow effects for cleaner look */
</style>
