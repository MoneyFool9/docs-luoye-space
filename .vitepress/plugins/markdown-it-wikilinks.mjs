/**
 * markdown-it 插件：支持 Obsidian 风格的双链语法 [[...]]
 * 
 * 支持的语法：
 * - [[文件名]]
 * - [[文件名|显示文本]]
 * - [[文件名#锚点]]
 * - [[文件名#锚点|显示文本]]
 */

/**
 * 解析双链内容
 * @param {string} content - 双链内部的内容
 * @returns {{ filename: string, alias: string|null, anchor: string|null }}
 */
function parseWikilink(content) {
  let filename = content
  let alias = null
  let anchor = null

  // 处理别名：[[文件名|别名]]
  if (content.includes('|')) {
    const parts = content.split('|')
    filename = parts[0].trim()
    alias = parts[1].trim()
  }

  // 处理锚点：[[文件名#锚点]]
  if (filename.includes('#')) {
    const parts = filename.split('#')
    filename = parts[0].trim()
    anchor = parts[1].trim()
  }

  return { filename, alias, anchor }
}

/**
 * 将文件路径转换为 VitePress URL
 * @param {string} filePath - 文件路径（如：docs/front-end/Vue/Vue3快速上手.md）
 * @param {string|null} anchor - 锚点
 * @returns {string} - VitePress URL
 */
function pathToUrl(filePath, anchor = null) {
  // 移除 .md 后缀
  let url = filePath.replace(/\.md$/, '')
  
  // 添加前导斜杠
  url = '/' + url
  
  // 添加锚点
  if (anchor) {
    // 将锚点转换为 URL 友好格式（小写、替换空格为连字符）
    const anchorSlug = anchor
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u4e00-\u9fa5a-z0-9\-]/g, '')
    url += '#' + anchorSlug
  }
  
  // 对中文等特殊字符进行 URL 编码（但保留路径分隔符和锚点）
  url = url.split('/').map(segment => {
    if (segment.startsWith('#')) {
      return segment // 保留锚点部分
    }
    return encodeURIComponent(segment)
  }).join('/')
  
  return url
}

/**
 * markdown-it 插件
 * @param {object} md - markdown-it 实例
 * @param {object} options - 插件选项
 * @param {object} options.docPathMap - 文档路径映射表
 */
export default function markdownItWikilinks(md, options = {}) {
  const { docPathMap = {} } = options

  // 双链的正则表达式
  const WIKILINK_RE = /\[\[([^\]]+)\]\]/

  /**
   * inline rule 的解析函数
   */
  function wikilink(state, silent) {
    const start = state.pos
    const max = state.posMax

    // 检查是否以 [[ 开头
    if (state.src.charCodeAt(start) !== 0x5B /* [ */ ||
        state.src.charCodeAt(start + 1) !== 0x5B /* [ */) {
      return false
    }

    // 查找结束的 ]]
    const match = state.src.slice(start).match(WIKILINK_RE)
    
    if (!match) {
      return false
    }

    // 如果是 silent 模式（用于检测），直接返回 true
    if (silent) {
      return true
    }

    // 解析双链内容
    const content = match[1]
    const { filename, alias, anchor } = parseWikilink(content)

    // 查找文件路径
    let filePath = docPathMap[filename]
    
    // 处理同名文件（数组情况）
    if (Array.isArray(filePath)) {
      filePath = filePath[0]
    }

    // 如果没有 .md 后缀，尝试添加
    if (filePath === undefined && !filename.endsWith('.md')) {
      filePath = docPathMap[filename + '.md']
      if (Array.isArray(filePath)) {
        filePath = filePath[0]
      }
    }

    // 生成 token
    if (filePath) {
      // 文件存在，生成链接
      const url = pathToUrl(filePath, anchor)
      const displayText = alias || filename

      // 创建 link_open token
      const token_open = state.push('link_open', 'a', 1)
      token_open.attrSet('href', url)
      token_open.attrSet('class', 'wikilink')

      // 创建 text token
      const token_text = state.push('text', '', 0)
      token_text.content = displayText

      // 创建 link_close token
      state.push('link_close', 'a', -1)
    } else {
      // 文件不存在，保持原样但添加特殊样式
      const token_open = state.push('span_open', 'span', 1)
      token_open.attrSet('class', 'wikilink-broken')
      token_open.attrSet('title', '文档不存在')

      const token_text = state.push('text', '', 0)
      token_text.content = `[[${content}]]`

      state.push('span_close', 'span', -1)
    }

    // 更新位置
    state.pos += match[0].length

    return true
  }

  // 注册 inline rule
  md.inline.ruler.before('link', 'wikilink', wikilink)
}
