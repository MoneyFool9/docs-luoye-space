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
 * 把段落合并成与「章节」对齐的粗块。
 *
 * 必须从输入文本侧动手的原因（已用 --probe 实测）：Dify 严格按 separator
 * 切分且不合并相邻块，max_tokens 只是「超长才强切」的上限，不是合并目标。
 * 所以传入 process_rule 并不能把碎段落合并起来，只能减少文本里 separator 的出现次数。
 *
 * 做法：以标题为边界，把同一标题下的段落之间的空行去掉。
 * 这样 separator（\n\n）只出现在章节之间，每个 chunk 就是一个完整章节。
 * 代码块内的空行完整保留，不会破坏缩进与可读性。
 */
export function coarsenForChunking(markdown, { maxHeadingLevel = 3, minChars = 120 } = {}) {
  const lines = markdown.split('\n')
  const isFence = (t) => /^(`{3,}|~{3,})/.test(t)
  const headingLevel = (t) => {
    const m = t.match(/^(#{1,6})\s/)
    return m ? m[1].length : 0
  }

  // 1) 先按标题切成章节（代码块内的 # 开头行不算标题）
  const sections = []
  let cur = []
  let inFence = false

  for (const line of lines) {
    const t = line.trim()
    if (isFence(t)) {
      inFence = !inFence
      cur.push(line)
      continue
    }
    const level = inFence ? 0 : headingLevel(t)
    if (level > 0 && level <= maxHeadingLevel) {
      if (cur.some((l) => l.trim())) sections.push(cur)
      cur = [line]
      continue
    }
    cur.push(line)
  }
  if (cur.some((l) => l.trim())) sections.push(cur)

  // 2) 删掉章节内部的空行（代码块内的保留），使 separator 只落在章节边界
  const compact = (section) => {
    const kept = []
    let fence = false
    for (const line of section) {
      const t = line.trim()
      if (isFence(t)) {
        fence = !fence
        kept.push(line)
        continue
      }
      if (!fence && !t) continue // 章节内空行：删除
      kept.push(line)
    }
    return kept.join('\n').trim()
  }

  // 3) 过短的章节并入下一节。
  //    形如「## 二、项目结构」后面直接跟子标题的章节，去掉空行后只剩标题本身，
  //    单独成块就是没有信息量的碎片。这里用单换行拼接（不能用空行，
  //    否则又会被 separator 切开），保证合并后仍是一个 chunk。
  const merged = []
  for (const section of sections) {
    const text = compact(section)
    if (!text) continue
    if (merged.length > 0 && text.length < minChars) {
      merged[merged.length - 1] += `\n${text}`
    } else {
      merged.push(text)
    }
  }
  // 最后一节若仍然过短，并入前一节
  if (merged.length > 1 && merged[merged.length - 1].length < minChars) {
    const tail = merged.pop()
    merged[merged.length - 1] += `\n${tail}`
  }

  return merged.join('\n\n')
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
        return { name: s.rel, text: coarsenForChunking(s.text), entry: `docs/${s.rel}`, count: 1 }
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

      const assembled = `# ${title} 系列笔记\n\n> 本文档由 ${items.length} 篇相关笔记合并而成，属于同一主题系列。\n\n${body}`

      return {
        name: `${key}.md`,
        // 组装后再粗化：让 chunk 与章节对齐，避免检索命中碎行
        text: coarsenForChunking(assembled),
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
