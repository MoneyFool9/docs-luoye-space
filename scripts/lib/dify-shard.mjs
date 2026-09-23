/**
 * Dify 知识库分片规则（构建时与同步脚本共用）
 *
 * 为什么要把「多篇笔记」合并成一个知识库文档：
 * Dify 免费版（Sandbox）限制「50 个知识库文档」+「10 次知识库请求/分钟」。
 * 本站共有 90 篇有效笔记，逐篇上传会直接超出配额、且触发限流。
 * 按目录合并后约为 18 篇，既在配额内，也保留了「同系列笔记」的上下文。
 */

import path from 'path'

/**
 * 知识库里的文本会被 AI 引用给读者，所以把 Obsidian 双链还原成可读文本，
 * 否则检索片段里会夹带 [[目标|别名]] 这种语法噪音。
 */
export function normalizeForIndexing(markdown) {
  return markdown
    .replace(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '（图片：$1）') // 图片嵌入
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2') // [[目标|别名]] -> 别名
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // [[目标]] -> 目标
}

/**
 * 去掉 Obsidian 笔记里的检索噪音。
 *
 * 这些行的词面与问题高度重合，向量检索会把它们排到很前面，但信息量为零，
 * 结果就是「命中了 4 条片段，AI 却答不出来」。需要剔除三类：
 *   1. 标签行   `#NestJS #基础 #模块`（注意与 markdown 标题 `# 标题` 区分）
 *   2. 导航行   `返回 [[学习路线]] | 上一章 [[...]] | 下一章 [[...]]`
 *   3. 空段落   `---` 分隔线、只剩链接的无意义行
 */
export function stripObsidianNoise(markdown) {
  const lines = markdown.split('\n')
  const kept = []
  let inFence = false

  for (const line of lines) {
    const t = line.trim()

    // 代码块内一律保留，避免误删注释行（如 `# 注释` / `#!/bin/bash`）
    if (/^(`{3,}|~{3,})/.test(t)) {
      inFence = !inFence
      kept.push(line)
      continue
    }
    if (inFence) {
      kept.push(line)
      continue
    }

    // 1) 标签行：#tag #tag（`#` 后无空格，因此不会误伤 markdown 标题 `# 标题`）
    if (t && !t.startsWith('#!') && /^#[^\s#]+(?:\s+#[^\s#]+)*$/.test(t)) continue

    // 2) 笔记间的跳转条：返回 [[X]] | 上一章 [[Y]] | 下一章 [[Z]]
    //    只认含「上一章 / 下一章」的整行，避免误删正文里的「返回」动词
    if (/上一章|下一章/.test(t) && t.length < 120) continue
    if (/^返回\s+\S/.test(t) && t.includes('|') && t.length < 120) continue

    kept.push(line)
  }

  return (
    kept
      .join('\n')
      // 3) 折叠 3 个以上连续换行
      .replace(/\n{3,}/g, '\n\n')
      // 4) 去掉单独成段的分隔线（段落级 `---`，无信息量）
      .replace(/\n\s*-{3,}\s*\n/g, '\n')
      .replace(/^\s*-{3,}\s*\n/, '')
      .trim()
  )
}

/**
 * 分片模式下挑选一个「入口文件」，用于 AI 回答里的引用跳转。
 * 优先级：readme/index > 与目录同名 > 名字包含目录名 > 字典序第一个
 */
export function pickEntryFile(shardKey, filePaths) {
  const base = path.basename(shardKey).toLowerCase()
  const score = (f) => {
    const n = path.basename(f, '.md').toLowerCase()
    if (n === 'readme' || n === 'index') return 0
    if (n === base) return 1
    if (n.includes(base)) return 2
    return 3
  }
  return [...filePaths].sort((a, b) => score(a) - score(b) || a.localeCompare(b))[0]
}

/**
 * 把源文件列表组装成待上传的知识库文档。
 * @param {Array<{rel: string, text: string, dir: string}>} sources
 *   其中 rel 为相对 docs/ 的路径（如 'front-end/React/React-01.md'），
 *   且 text 已经过 normalizeForIndexing 处理。
 * @returns {Array<{name: string, text: string, entry: string, count: number}>}
 *   name  知识库文档名（相对 docs/ 的路径）
 *   entry 前端引用跳转用的源文件路径（docs/ 前缀）
 */
export function buildShardDocuments(sources) {
  // 按叶子目录分组；docs 根目录下的散文件各自成篇
  const groups = new Map()
  for (const s of sources) {
    const key = s.dir === '.' || !s.dir ? s.rel : s.dir
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(s)
  }

  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, items]) => {
      if (items.length === 1) {
        const s = items[0]
        return { name: s.rel, text: s.text, entry: `docs/${s.rel}`, count: 1 }
      }

      const title = path.basename(key)
      const body = items
        .map((s) => {
          // 若笔记自带 H1 标题，就不再叠加 `## 文件名`，
          // 否则两行几乎同义的标题会各自成为一段，挤占检索名额
          const content = s.text.trim()
          return /^#\s+/.test(content) ? content : `## ${path.basename(s.rel, '.md')}\n\n${content}`
        })
        .join('\n\n') // 不再插 `---`：它自己会成为一个无信息量的 chunk

      return {
        name: `${key}.md`,
        text: `# ${title} 系列笔记\n\n> 本文档由 ${items.length} 篇相关笔记合并而成，属于同一主题系列。\n\n${body}`,
        entry: `docs/${pickEntryFile(key, items.map((s) => s.rel))}`,
        count: items.length,
      }
    })
}

/**
 * 分片名 -> 源文件路径 的附加映射，供 doc-path-map.json 使用。
 *
 * 没有这一步的话，AI 回答里引用「React.md」这类合并文档时，
 * 前端 DifyChat.vue 用 basename 查不到路径，引用就点不动。
 * 单篇成组的名字与真实文件名一致，无需重复添加。
 */
export function buildShardEntryMap(sources) {
  const map = {}
  for (const doc of buildShardDocuments(sources)) {
    if (doc.count <= 1) continue // 单篇：basename 已由原有逻辑覆盖
    const base = doc.name.split('/').pop()
    map[base] = doc.entry
  }
  return map
}
