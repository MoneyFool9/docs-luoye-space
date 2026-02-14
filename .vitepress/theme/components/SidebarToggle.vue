<template>
  <button
    class="sidebar-toggle-btn"
    type="button"
    :aria-expanded="String(!isCollapsed)"
    :aria-label="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
    :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
    @click="toggle"
  >
    <span class="sidebar-toggle-icon" aria-hidden="true">{{ isCollapsed ? "›" : "‹" }}</span>
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
.sidebar-toggle-icon {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}
</style>
