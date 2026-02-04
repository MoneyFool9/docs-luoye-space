<template>
  <div></div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import Viewer from 'viewerjs'

const route = useRoute()

// 为普通图片添加查看器
const initImageViewer = () => {
  nextTick(() => {
    setTimeout(() => {
      const images = document.querySelectorAll('.vp-doc img:not(.no-preview)')
      
      if (images.length > 0) {
        // 为所有图片创建一个viewer实例
        const viewer = new Viewer(document.querySelector('.vp-doc'), {
          inline: false,
          toolbar: {
            zoomIn: 4,
            zoomOut: 4,
            oneToOne: 4,
            reset: 4,
            prev: 0,
            play: 0,
            next: 0,
            rotateLeft: 4,
            rotateRight: 4,
            flipHorizontal: 4,
            flipVertical: 4,
          },
          title: false,
          navbar: false,
          tooltip: true,
          movable: true,
          zoomable: true,
          rotatable: true,
          scalable: true,
          transition: true,
          fullscreen: true,
          keyboard: true,
          filter(image) {
            // 只处理文档中的图片，排除带no-preview类的
            return image.tagName === 'IMG' && !image.classList.contains('no-preview')
          }
        })
      }
    }, 300)
  })
}

// 将SVG转换为DataURL
const svgToDataUrl = (svg) => {
  try {
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    return URL.createObjectURL(svgBlob)
  } catch (e) {
    console.error('SVG转换失败:', e)
    return null
  }
}

// 为Mermaid SVG添加查看器功能
const initMermaidViewer = () => {
  // 使用更长的延迟确保Mermaid已完全渲染
  const checkAndInit = () => {
    const mermaidContainers = document.querySelectorAll('.vp-doc .mermaid')
    
    mermaidContainers.forEach(container => {
      const svg = container.querySelector('svg')
      if (svg && !svg.hasAttribute('data-viewer-initialized')) {
        // 标记已初始化
        svg.setAttribute('data-viewer-initialized', 'true')
        svg.style.cursor = 'pointer'
        
        // 添加点击事件
        svg.addEventListener('click', (e) => {
          console.log('Mermaid SVG clicked!')
          e.preventDefault()
          e.stopPropagation()
          openSvgViewer(svg)
        })
      }
    })
  }
  
  nextTick(() => {
    // 第一次尝试（300ms）
    setTimeout(checkAndInit, 300)
    // 第二次尝试（1000ms，确保Mermaid渲染完成）
    setTimeout(checkAndInit, 1000)
    // 第三次尝试（2000ms，兜底）
    setTimeout(checkAndInit, 2000)
  })
}

// 打开SVG查看器
const openSvgViewer = (svg) => {
  console.log('openSvgViewer called!')
  try {
    // 创建临时容器
    const tempContainer = document.createElement('div')
    tempContainer.style.display = 'none'
    tempContainer.className = 'temp-viewer-container'
    
    // 将SVG转换为图片
    const dataUrl = svgToDataUrl(svg)
    console.log('DataURL created:', dataUrl ? 'success' : 'failed')
    if (!dataUrl) {
      console.error('SVG转换为DataURL失败')
      return
    }
    
    const img = document.createElement('img')
    img.alt = 'Mermaid Diagram'
    img.src = dataUrl
    
    tempContainer.appendChild(img)
    document.body.appendChild(tempContainer)
    
    // 创建Viewer实例并立即显示
    const viewer = new Viewer(img, {
      inline: false,
      toolbar: {
        zoomIn: 4,
        zoomOut: 4,
        oneToOne: 4,
        reset: 4,
        prev: 0,
        play: 0,
        next: 0,
        rotateLeft: 4,
        rotateRight: 4,
        flipHorizontal: 4,
        flipVertical: 4,
      },
      title: false,
      navbar: false,
      tooltip: true,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      transition: true,
      fullscreen: true,
      keyboard: true,
      hide() {
        // 清理资源
        URL.revokeObjectURL(dataUrl)
        viewer.destroy()
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer)
        }
      }
    })
    
    // 立即显示viewer并设置默认缩放为400%
    viewer.show()
    
    // 设置初始缩放为400%（4倍）
    setTimeout(() => {
      viewer.zoomTo(4)
    }, 100)
  } catch (e) {
    console.error('Mermaid查看器初始化失败:', e)
  }
}

onMounted(() => {
  initImageViewer()
  initMermaidViewer()
})

watch(() => route.path, () => {
  // 清除Mermaid的初始化标记
  document.querySelectorAll('.vp-doc .mermaid svg[data-viewer-initialized]').forEach(svg => {
    svg.removeAttribute('data-viewer-initialized')
  })
  
  // 重新初始化
  initImageViewer()
  initMermaidViewer()
})
</script>
