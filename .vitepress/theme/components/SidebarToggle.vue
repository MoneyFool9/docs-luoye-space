<template>
  <button
    class="sidebar-toggle-btn"
    type="button"
    :aria-expanded="String(!isCollapsed)"
    :aria-label="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
    @click="toggle"
  >
    <span class="sidebar-toggle-icon" aria-hidden="true">{{ isCollapsed ? "»" : "«" }}</span>
    <span class="sidebar-toggle-label">{{ isCollapsed ? "展开" : "收起" }}</span>
  </button>
</template>

<script setup>
import { computed, inject } from 'vue'

const sidebarState = inject('vp-sidebar-collapse', null)

const isCollapsed = computed(() => {
  return sidebarState?.isSidebarCollapsed?.value ?? false
})

const toggle = () => {
  sidebarState?.toggleSidebar?.()
}
</script>

<style scoped>
.sidebar-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 8px 0 10px;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.sidebar-toggle-icon {
  font-size: 14px;
  font-weight: 700;
}
</style>
