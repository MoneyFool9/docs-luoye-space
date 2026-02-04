<template>
  <div class="hero-profile">
    <!-- Terminal-style Header -->
    <div class="terminal-header">
      <div class="terminal-controls">
        <span class="control-dot red"></span>
        <span class="control-dot yellow"></span>
        <span class="control-dot green"></span>
      </div>
      <div class="terminal-title">~/developer/profile.sh</div>
    </div>

    <!-- Profile Content -->
    <div class="profile-content">
      <!-- Avatar & Name Section -->
      <div class="profile-main">
        <div class="avatar-wrapper">
          <div class="avatar-hexagon">
            <img src="/person.jpg" alt="钱嘉豪" class="avatar-img" />
          </div>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">Available for work</span>
          </div>
        </div>

        <div class="profile-info">
          <div class="command-prompt">
            <span class="prompt-symbol">$</span>
            <span class="command-text">whoami</span>
          </div>
          <h1 class="profile-name">
            <span class="name-const">const</span>
            <span class="name-variable">developer</span>
            <span class="name-equal">=</span>
            <span class="name-value">"钱嘉豪"</span>
          </h1>
          <p class="profile-bio">
            <span class="comment-symbol">//</span>
            全栈开发者 | 技术探索者 | 开源爱好者
          </p>
          <p class="profile-description">
            热爱编程，专注于前端工程化与全栈开发。
            喜欢研究新技术，分享技术心得，用代码创造价值。
          </p>
        </div>
      </div>

      <!-- Tech Stack Section -->
      <div class="tech-stack">
        <div class="command-prompt">
          <span class="prompt-symbol">$</span>
          <span class="command-text">cat techstack.json</span>
        </div>
        <div class="tech-grid">
          <div class="tech-item" v-for="tech in techStack" :key="tech.name">
            <div class="tech-icon">
              <img :src="tech.icon" :alt="tech.name" />
            </div>
            <span class="tech-name">{{ tech.name }}</span>
            <div class="tech-bar">
              <div class="tech-progress" :style="{ width: tech.level }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Social Links Section -->
      <div class="social-links">
        <div class="command-prompt">
          <span class="prompt-symbol">$</span>
          <span class="command-text">ls -la ~/social</span>
        </div>
        <div class="links-grid">
          <a v-for="link in socialLinks" :key="link.name" :href="link.url" target="_blank" class="social-link">
            <div class="link-icon" v-html="link.icon"></div>
            <div class="link-info">
              <span class="link-name">{{ link.name }}</span>
              <span class="link-handle">{{ link.handle }}</span>
            </div>
            <svg class="link-arrow" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="command-prompt">
          <span class="prompt-symbol">$</span>
          <span class="command-text">git stats --summary</span>
        </div>
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in stats" :key="stat.label">
            <div class="stat-icon" v-html="stat.icon"></div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Terminal Footer -->
    <div class="terminal-footer">
      <span class="footer-text">
        <span class="prompt-symbol">❯</span>
        Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search docs
        <span class="cursor-blink">|</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const techStack = ref([
  {
    name: 'Vue.js',
    level: '90%',
    icon: '/vue.svg'
  },
  {
    name: 'React',
    level: '85%',
    icon: '/react.svg'
  },
  {
    name: 'Node.js',
    level: '80%',
    icon: '/nodejs.svg'
  },
  {
    name: 'NestJS',
    level: '75%',
    icon: '/NestJS.svg'
  }
])

const socialLinks = ref([
  {
    name: 'GitHub',
    handle: '@MoneyFool9',
    url: 'https://github.com/MoneyFool9',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>'
  },
  {
    name: 'Blog',
    handle: 'www.ly57.cn',
    url: 'https://www.ly57.cn',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm8 16H7v-1h10v1zm2-2H5V4h2v9l3-2.25L13 13V4h6v14z"/></svg>'
  },
  {
    name: 'Email',
    handle: 'jiahqian@gmail.com',
    url: 'mailto:jiahqian@gmail.com',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>'
  }
])

const stats = ref([
  {
    label: 'Projects',
    value: '24+',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>'
  },
  {
    label: 'Contributions',
    value: '500+',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
  },
  {
    label: 'Articles',
    value: '50+',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'
  },
  {
    label: 'Stars',
    value: '100+',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
  }
])
</script>

<style scoped>
.hero-profile {
  max-width: 100%;
  margin: 3rem auto;
  padding: 0 2rem;
}

@media (min-width: 1440px) {
  .hero-profile {
    max-width: 1400px;
  }
}

@media (min-width: 1920px) {
  .hero-profile {
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

/* Profile Content */
.profile-content {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Main Profile Section */
.profile-main {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2.5rem;
  align-items: start;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-hexagon {
  position: relative;
  width: 160px;
  height: 160px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: linear-gradient(135deg, #007acc 0%, #569cd6 100%);
  padding: 3px;
  transition: transform 0.3s ease;
}

.avatar-hexagon:hover {
  transform: scale(1.05) rotate(5deg);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  color: #4caf50;
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.75rem;
}

.profile-info {
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
  margin-bottom: 0.5rem;
}

.prompt-symbol {
  color: #4ec9b0;
  font-weight: 600;
}

.command-text {
  color: #d7ba7d;
}

.profile-name {
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.name-const {
  color: #569cd6;
}

.name-variable {
  color: #9cdcfe;
}

.name-equal {
  color: #d4d4d4;
}

.name-value {
  color: #ce9178;
  white-space: nowrap;
}

.profile-bio {
  color: #6a9955;
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 1rem;
  margin: 0;
}

.comment-symbol {
  opacity: 0.8;
  margin-right: 0.5rem;
}

.profile-description {
  color: var(--vp-c-text-1);
  line-height: 1.7;
  margin: 0;
}

/* Tech Stack Section */
.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tech-item:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.tech-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tech-name {
  flex: 1;
  color: var(--vp-c-text-1);
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 500;
}

.tech-bar {
  flex: 0 0 80px;
  height: 6px;
  background: var(--vp-c-divider);
  border-radius: 3px;
  overflow: hidden;
}

.tech-progress {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 3px;
  transition: width 1s ease;
}

/* Social Links Section */
.social-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
  transform: translateX(4px);
}

.link-icon {
  width: 24px;
  height: 24px;
  color: var(--vp-c-brand-1);
}

.link-icon svg {
  width: 100%;
  height: 100%;
}

.link-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.link-name {
  color: var(--vp-c-text-1);
  font-weight: 500;
  font-size: 0.875rem;
}

.link-handle {
  color: var(--vp-c-text-2);
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.75rem;
}

.link-arrow {
  width: 16px;
  height: 16px;
  color: var(--vp-c-brand-1);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s ease;
}

.social-link:hover .link-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Stats Section */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Terminal Footer */
.terminal-footer {
  padding: 0.875rem 1rem;
  background: var(--vp-c-brand-1);
  border-radius: 0 0 12px 12px;
  margin-top: -0.5rem;
}

.footer-text {
  color: #ffffff;
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-text kbd {
  padding: 0.125rem 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.cursor-blink {
  animation: blink 1s infinite;
  margin-left: auto;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-profile {
    padding: 0 0.75rem;
    margin: 1.5rem auto;
  }

  .profile-main {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .avatar-wrapper {
    margin: 0 auto;
  }

  .profile-name {
    font-size: 1.25rem;
    justify-content: center;
  }
  
  .name-value {
    font-size: 1.5rem;
  }

  .tech-grid,
  .links-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .profile-content {
    padding: 1.5rem 1rem;
  }

  .terminal-header {
    padding: 0.75rem;
  }
}

/* Remove shadow effects for cleaner look */
</style>
