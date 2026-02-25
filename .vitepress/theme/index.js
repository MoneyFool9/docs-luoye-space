// https://vitepress.dev/guide/custom-theme
import { defineComponent, h, onMounted, provide, ref, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import 'viewerjs/dist/viewer.min.css'
import './style.css'
import ReadingTime from './components/ReadingTime.vue'
import DocStats from './components/DocStats.vue'
import DifyChat from './components/DifyChat.vue'
import ImageViewer from './components/ImageViewer.vue'
import NavigationButtons from './components/NavigationButtons.vue'
import HeroProfile from './components/HeroProfile.vue'
import CodeRunnerEnhancer from './components/CodeRunnerEnhancer.vue'
import SidebarToggle from './components/SidebarToggle.vue'

const SIDEBAR_STATE_KEY = 'vp-sidebar-collapse'
const SIDEBAR_STORAGE_KEY = 'vp-sidebar-collapsed'

const LayoutWithSidebarToggle = defineComponent({
  name: 'LayoutWithSidebarToggle',
  setup() {
    const isSidebarCollapsed = ref(false)

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    provide(SIDEBAR_STATE_KEY, {
      isSidebarCollapsed,
      toggleSidebar
    })

    onMounted(() => {
      try {
        const cached = localStorage.getItem(SIDEBAR_STORAGE_KEY)
        isSidebarCollapsed.value = cached === '1'
      } catch (error) {
        console.warn('Failed to read sidebar collapsed state:', error)
      }
    })

    watch(isSidebarCollapsed, (value) => {
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, value ? '1' : '0')
      } catch (error) {
        console.warn('Failed to persist sidebar collapsed state:', error)
      }
    })

    return () =>
      h(
        'div',
        { class: { 'vp-sidebar-collapsed': isSidebarCollapsed.value } },
        [
          h(DefaultTheme.Layout, null, {
            // 在文档内容顶部插入阅读时长组件
            'doc-before': () => h(ReadingTime),
            // 添加图片查看器、导航按钮、AI助手、侧边栏切换（全部挂在全局层，不受侧边栏overflow裁剪）
            'layout-bottom': () => [h(SidebarToggle), h(DifyChat), h(ImageViewer), h(NavigationButtons), h(CodeRunnerEnhancer)]
          })
        ]
      )
  }
})

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: LayoutWithSidebarToggle,
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('ReadingTime', ReadingTime)
    app.component('DocStats', DocStats)
    app.component('DifyChat', DifyChat)
    app.component('ImageViewer', ImageViewer)
    app.component('NavigationButtons', NavigationButtons)
    app.component('HeroProfile', HeroProfile)
    app.component('CodeRunnerEnhancer', CodeRunnerEnhancer)
    app.component('SidebarToggle', SidebarToggle)
  }
}
