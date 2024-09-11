import { defineConfig } from 'vitepress'
import { set_nav_and_sidebar } from "../utils/auto_siderbar_nav.mjs";	// 改成自己的路径

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // base: "/docs-luoye-space/",
  lang: 'zh-CN',
  title: "小落叶的个人知识库",
  description: "A VitePress Site",
  head: [["link", {rel: "icon", href: "/logo.svg"}]],
  themeConfig: {
    outlineTitle: "文章目录",
    outline: [2, 6],
    logo: "logo.svg", // 配置logo位置，public目录
     // 文章翻页
     docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    // 移动端 - 外观
    darkModeSwitchLabel: '外观',

    // 移动端 - 返回顶部
    returnToTopLabel: '返回顶部',

    // 移动端 - menu
    sidebarMenuLabel: '菜单',

    

    ...set_nav_and_sidebar(),

    // navbar: true, //开启导航栏，我设置成false也没啥用不知道为啥
    // sidebar: false, // 关闭侧边栏
    // lastUpdated: true, // 显示上次修改时间
    // aside: "left", // 设置右侧侧边栏在左侧显示
    // 社交链接，内置的都是国外的，国内只能通过svg设置
    socialLinks: [
      { icon: "github", link: "/" },
      {
        icon: {
          svg: '<svg t="1704636138195" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4340" width="200" height="200"><path d="M1024 499.2c0-209.066667-230.4-375.466667-512-375.466667S0 290.133333 0 499.2c0 204.8 230.4 375.466667 512 375.466667s512-170.666667 512-375.466667z m-371.2-136.533333c0 4.266667-8.533333 4.266667-8.533333 4.266666-4.266667-4.266667-8.533333-8.533333-4.266667-17.066666l12.8 12.8z m93.866667 38.4h-21.333334v-12.8l-4.266666-4.266667v-4.266667l-4.266667-4.266666-4.266667-4.266667h-4.266666v-4.266667h-8.533334v-4.266666h-12.8l-4.266666-4.266667h-21.333334l-4.266666 4.266667h-4.266667l-12.8-12.8 4.266667-4.266667h4.266666v-4.266667h46.933334l4.266666 4.266667h8.533334l4.266666 4.266667h4.266667l4.266667 8.533333v4.266667h4.266666l4.266667 4.266666 8.533333 4.266667v4.266667l4.266667 4.266666v8.533334l4.266667 4.266666v8.533334z m0 0c0 4.266667-4.266667 8.533333-8.533334 8.533333-8.533333 0-12.8-4.266667-12.8-8.533333h21.333334z m-89.6-4.266667c-4.266667 4.266667-8.533333 0-8.533334-4.266667-4.266667 0 0-8.533333 4.266667-8.533333l4.266667 12.8z m55.466666 17.066667h-17.066666v-4.266667h-4.266667v-8.533333h-8.533333v-4.266667h-25.6l-4.266667-12.8h4.266667v-4.266667h25.6v4.266667h8.533333l4.266667 4.266667h4.266666v4.266666h4.266667v4.266667l4.266667 4.266667v4.266666l4.266666 4.266667v4.266667z m0 0c0 8.533333-4.266667 12.8-8.533333 12.8s-8.533333-4.266667-8.533333-12.8h17.066666z m59.733334 106.666666c0 12.8 4.266667 25.6 8.533333 34.133334 8.533333 4.266667 21.333333 8.533333 29.866667 8.533333 12.8 0 25.6-4.266667 34.133333-17.066667 4.266667-25.6 8.533333-55.466667 21.333333-106.666666-29.866667 0-51.2 8.533333-72.533333 25.6-12.8 17.066667-21.333333 34.133333-21.333333 55.466666z m98.133333 140.8c-12.8 17.066667-25.6 29.866667-42.666667 38.4s-38.4 12.8-55.466666 12.8-34.133333-4.266667-46.933334-12.8c-12.8-4.266667-17.066667-12.8-17.066666-29.866666 0-12.8 4.266667-25.6 12.8-38.4 17.066667 17.066667 29.866667 25.6 51.2 25.6 12.8 0 29.866667-8.533333 42.666666-17.066667 12.8-12.8 21.333333-29.866667 25.6-55.466667l-4.266666-4.266666c-17.066667 29.866667-42.666667 42.666667-68.266667 42.666666-17.066667 0-38.4-8.533333-46.933333-29.866666-12.8-12.8-17.066667-34.133333-17.066667-64 0-21.333333 4.266667-42.666667 17.066667-68.266667 21.333333-21.333333 42.666667-38.4 68.266666-51.2 17.066667-4.266667 34.133333-8.533333 46.933334-8.533333s21.333333 4.266667 38.4 4.266666v21.333334c12.8-12.8 21.333333-17.066667 34.133333-17.066667s25.6 12.8 25.6 29.866667v55.466666c-4.266667 17.066667-12.8 34.133333-17.066667 59.733334-4.266667 17.066667-8.533333 38.4-17.066666 59.733333-8.533333 17.066667-17.066667 29.866667-29.866667 46.933333z m-230.4-230.4c12.8 0 25.6 8.533333 38.4 17.066667 8.533333 12.8 12.8 25.6 12.8 51.2 0 17.066667-4.266667 34.133333-8.533333 55.466667-8.533333 17.066667-21.333333 29.866667-34.133334 42.666666-8.533333 12.8-21.333333 21.333333-38.4 29.866667-17.066667 4.266667-29.866667 8.533333-46.933333 8.533333-34.133333 0-55.466667-8.533333-72.533333-25.6-21.333333-21.333333-29.866667-42.666667-29.866667-76.8s8.533333-68.266667 38.4-93.866666c21.333333-25.6 55.466667-38.4 93.866667-38.4 8.533333 0 21.333333 4.266667 29.866666 4.266666 0 8.533333 4.266667 21.333333 4.266667 29.866667 4.266667 0 8.533333-4.266667 12.8-4.266667z m-46.933333 55.466667c0-12.8 4.266667-21.333333 4.266666-25.6 4.266667-8.533333 12.8-17.066667 21.333334-21.333333-34.133333 8.533333-55.466667 17.066667-68.266667 42.666666-12.8 12.8-17.066667 29.866667-17.066667 46.933334 0 21.333333 4.266667 34.133333 12.8 42.666666 8.533333 12.8 17.066667 17.066667 25.6 17.066667 25.6 0 46.933333-17.066667 55.466667-51.2-25.6-12.8-34.133333-29.866667-34.133333-51.2zM396.8 396.8l-17.066667-29.866667c29.866667-21.333333 55.466667-29.866667 72.533334-29.866666 8.533333 0 12.8 4.266667 17.066666 8.533333 4.266667 0 12.8 12.8 12.8 25.6 0 8.533333-8.533333 38.4-21.333333 89.6-8.533333 55.466667-12.8 93.866667-12.8 110.933333 0 21.333333 0 38.4 8.533333 46.933334-17.066667 8.533333-29.866667 17.066667-46.933333 17.066666-12.8 0-21.333333-4.266667-29.866667-12.8-4.266667-8.533333-8.533333-25.6-8.533333-42.666666 0-12.8 4.266667-46.933333 12.8-93.866667 8.533333-51.2 12.8-85.333333 12.8-89.6z m-230.4 238.933333c-17.066667 0-29.866667-4.266667-34.133333-12.8-8.533333-8.533333-12.8-25.6-12.8-42.666666s8.533333-72.533333 21.333333-153.6l-17.066667-42.666667c25.6-17.066667 55.466667-25.6 76.8-25.6 12.8 0 21.333333 8.533333 29.866667 21.333333 21.333333-12.8 46.933333-21.333333 72.533333-21.333333 12.8 0 25.6 4.266667 38.4 12.8 17.066667 8.533333 25.6 21.333333 25.6 38.4 0 38.4-21.333333 64-59.733333 81.066667 38.4 8.533333 59.733333 25.6 59.733333 64 0 25.6-8.533333 42.666667-34.133333 59.733333-17.066667 12.8-38.4 21.333333-64 21.333333s-46.933333-4.266667-59.733333-17.066666c-12.8 12.8-29.866667 17.066667-42.666667 17.066666z m110.933333-85.333333c0-17.066667 0-25.6-8.533333-29.866667-4.266667-4.266667-12.8-8.533333-25.6-8.533333-8.533333 0-25.6 4.266667-38.4 8.533333-4.266667 17.066667-4.266667 38.4-4.266667 55.466667 8.533333 4.266667 21.333333 4.266667 38.4 4.266667 12.8 0 21.333333 0 29.866667-8.533334 8.533333-4.266667 8.533333-12.8 8.533333-21.333333z m-21.333333-145.066667c-8.533333 0-17.066667 0-34.133333 4.266667 0 12.8-4.266667 38.4-12.8 76.8 25.6 0 42.666667-8.533333 55.466666-17.066667s17.066667-21.333333 17.066667-34.133333c0-21.333333-8.533333-29.866667-25.6-29.866667z" p-id="4341" fill="#1296db"></path><path d="M183.466667 776.533333l-81.066667 123.733334 285.866667-46.933334z" p-id="4342" fill="#1296db"></path></svg>',
        },
        link: "https://blog.ly57.cn",
      },
      {
        icon: {
          svg: '<svg t="1704626282666" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4227" width="200" height="200"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" fill="#C71D23" p-id="4228"></path></svg>',
        },
        link: "/",
      },
    ],
    // 底部配置
    footer: {
      copyright: "Copyright@ 2024 Luoye Zero",
    },
    // 设置搜索框的样式
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },
  },
})
