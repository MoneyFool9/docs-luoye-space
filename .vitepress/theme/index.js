// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import ReadingTime from './components/ReadingTime.vue'
import DocStats from './components/DocStats.vue'
import DifyChat from './components/DifyChat.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // 在文档内容顶部插入阅读时长组件
      'doc-before': () => h(ReadingTime),
      // 在导航栏添加AI助手按钮
      'nav-bar-content-after': () => h(DifyChat)
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('ReadingTime', ReadingTime)
    app.component('DocStats', DocStats)
    app.component('DifyChat', DifyChat)
  }
}
