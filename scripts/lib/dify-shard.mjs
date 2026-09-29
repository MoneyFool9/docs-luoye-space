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
 * 从章节首行提取标题路径。
 *
 * 每个 chunk 都是独立的检索单元，脱离文档后「3.1 @Module() 装饰器」
 * 这种标题看不出它属于哪篇笔记、哪一章。给它补上完整路径能让向量
 * 与关键词匹配都更准，也能让 AI 判新片段是否与问题相关。
 */
function headingPath(profile, section) {
  const m = section.match(/^(#{1,6})\s+(.+)$/m)
  if (!m) return ''
  const title = m[2].trim()
  return profile ? `${profile} > ${title}` : title
}

/**
 * 章节分隔标记。
 *
 * 为什么要自定义分隔符（而不是用 \n\n）：
 * Dify 严格按 separator 切分且不合并，用 \n\n 切分就必须删掉正文里所有空行，
 * 连带代码块里的空行也保不住，会导致 `import` 与 `@Module({` 被切到两个 chunk。
 * 改用内容里绝不会出现的标记作 separator，就能：
 *   1. 完整保留代码块空行与可读性
 *   2. 让 chunk 边界精确落在章节之间
 * 分隔符在切分时会被移除，不会进入 chunk 内容。
 */
export const CHUNK_MARKER = '\n\n<<<DIFY-SECTION>>>\n\n'

/**
 * 以标题为边界切分章节，并用 CHUNK_MARKER 拼接。
 *
 * 过短的章节（如「## 二、项目结构」后面直接跟子标题）会并入下一节，
 * 否则它们单独成块后没有任何信息量，却仍可能与问题词面重合而挤占检索名额。
 */
export function splitIntoSections(markdown, { maxHeadingLevel = 3, minChars = 120 } = {}) {
  const lines = markdown.split('\n')
  const isFence = (t) => /^(`{3,}|~{3,})/.test(t)
  const headingLevel = (t) => {
    const m = t.match(/^(#{1,6})\s/)
    return m ? m[1].length : 0
  }

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

  // 过短章节并入下一节（用单换行拼接，保证仍是同一块）
  const merged = []
  for (const section of sections) {
    const text = section.join('\n').trim()
    if (!text) continue
    if (merged.length > 0 && text.length < minChars) merged[merged.length - 1] += `\n${text}`
    else merged.push(text)
  }
  if (merged.length > 1 && merged[merged.length - 1].length < minChars) {
    const tail = merged.pop()
    merged[merged.length - 1] += `\n${tail}`
  }

  return merged
}

/**
 * 单块字符上限。
 *
 * 这个值需要与 Dify 的 max_tokens 配合：Dify 对超过 max_tokens 的块会硬切，
 * 而硬切不认代码围栏——实测有 17.6% 的分段因此出现半截代码。所以由我们
 * 在安全位置预先切开，上限要略低于 Dify 的阈值，避免它再动手。
 *
 * 取 2000 而非更小的值，是因为代码块的完整性比 chunk 粒度更重要：阈值
 * 700 时全库有 156 个代码块（14.6%）会被切开，切成两半的代码两边都看不懂；
 * 提到 2000 后只剩 6 个（0.6%）。
 */
export const DEFAULT_CHUNK_CHARS = 2000

/**
 * 把章节拆成「单元」，供装箱阶段使用。
 *
 * - 正文行：自由切分，打包成不超过 limit 的单元
 * - 代码块：原子单元；若自身超限，则等分为若干块，且每块都补齐围栏
 *   （等分而非尽量装満，避免尾部只剩几行而变成无信息碎片）
 */
function toUnits(section, limit) {
  const lines = section.split('\n')
  const units = []
  let inFence = false
  let fenceMark = '```'
  let textBuf = []
  let codeBuf = []

  // 正文行打包成不超过 limit 的单元
  const flushText = () => {
    if (!textBuf.length) return
    let cur = []
    let len = 0
    for (const line of textBuf) {
      const add = cur.length ? line.length + 1 : line.length
      if (len + add > limit && cur.length) {
        units.push(cur.join('\n'))
        cur = []
        len = 0
      }
      cur.push(line)
      len += cur.length > 1 ? line.length + 1 : line.length
    }
    if (cur.length) units.push(cur.join('\n'))
    textBuf = []
  }

  const flushCode = () => {
    if (!codeBuf.length) return
    const opener = codeBuf[0]
    const closed = /^\s*(`{3,}|~{3,})\s*$/.test(codeBuf[codeBuf.length - 1]) && codeBuf.length > 1
    const body = closed ? codeBuf.slice(1, -1) : codeBuf.slice(1)
    const full = codeBuf.join('\n')

    if (full.length <= limit || body.length === 0) {
      units.push(full)
    } else {
      // 等分为若干块，使每块大小接近，不开空壳
      const parts = Math.ceil(full.length / limit)
      const per = Math.ceil(body.length / parts)
      for (let i = 0; i < body.length; i += per) {
        const slice = body.slice(i, i + per)
        units.push([opener, ...slice, fenceMark].join('\n'))
      }
    }
    codeBuf = []
  }

  for (const line of lines) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/)

    if (!inFence) {
      if (fence) {
        flushText()
        inFence = true
        fenceMark = fence[1]
        codeBuf = [line]
      } else {
        textBuf.push(line)
      }
      continue
    }

    codeBuf.push(line)
    if (fence && line.trim().startsWith(fenceMark)) {
      inFence = false
      flushCode()
    }
  }

  if (inFence) {
    // 围栏未闭合：当普通文本处理，不强行补围栏
    textBuf.push(...codeBuf)
    codeBuf = []
  }
  flushText()
  flushCode()

  return units.filter((u) => u.trim())
}

/**
 * 粗化：把章节切成与章节对齐、且不超 limit 的块，再用 CHUNK_MARKER 拼接。
 *
 * 为什么要自己切（不能交给 Dify）：Dify 对超过 max_tokens 的块会硬切，
 * 而硬切不认代码围栏——实测有 17.6% 的分段因此出现半截代码，两段都
 * 无法独立作答。自己在安全位置切开，就能让每块的围栏都成对。
 *
 * profile 是所属笔记名（如「NestJS-01 项目与模块」），作为标题路径前缀
 * 到该章节的第一块上，使片段脱离文档后仍能自述出处。
 */
export function coarsenForChunking(
  markdown,
  { profile = '', limit = DEFAULT_CHUNK_CHARS, ...options } = {}
) {
  const pieces = []

  for (const section of splitIntoSections(markdown, options)) {
    // 贪心装箱：尽量装满但不超限，只在单元边界处断开
    const packed = []
    let cur = ''
    const flush = () => {
      if (cur.trim()) packed.push(cur.trim())
      cur = ''
    }

    for (const unit of toUnits(section, limit)) {
      const candidate = cur ? `${cur}\n${unit}` : unit
      if (candidate.length <= limit || !cur.trim()) {
        cur = candidate
      } else {
        flush()
        cur = unit
      }
    }
    flush()

    // 尾部过短则并回上一块：Dify 实测硬切阈值约 800 字，limit 默认 700，
    // 还有余量；并回能避免出现「## 4. 路由」这类只有标题的孤立碎片
    if (packed.length > 1 && packed[packed.length - 1].length < 80) {
      const tail = packed.pop()
      packed[packed.length - 1] += `\n${tail}`
    }

    // 开头的短块（常见于「标题行」与其后长代码被分开安放）向前并入下一块。
    // 标题紧跟其正文才有意义，单独成块既无信息量又会白白占一个检索名额。
    if (packed.length > 1 && packed[0].length < 80) {
      const head = packed.shift()
      packed[0] = `${head}\n${packed[0]}`
    }

    const path = headingPath(profile, section)
    packed.forEach((body, i) => {
      // 标题路径只加在第一块上，续块靠内容自行衔接
      pieces.push(i === 0 && path ? `【${path}】\n${body}` : body)
    })
  }

  return pieces.join(CHUNK_MARKER)
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
        return {
          name: s.rel,
          text: coarsenForChunking(s.text, { profile: path.basename(s.rel, '.md') }),
          entry: `docs/${s.rel}`,
          count: 1,
        }
      }

      const title = path.basename(key)

      // 每篇笔记单独粗化（带上自己的标题路径），而不是整个分片一次性粗化：
      // 否则 H1 会把分片标题当成路径首段，丢失「哪篇笔记」这一层信息
      return {
        name: `${key}.md`,
        text: items
          .map((s) => {
            const content = s.text.trim()
            // 笔记自带 H1 时不再叠加文件名标题，避免同义标题各占一个 chunk
            const withHeading = /^#\s+/.test(content)
              ? content
              : `## ${path.basename(s.rel, '.md')}\n\n${content}`
            return coarsenForChunking(withHeading, { profile: path.basename(s.rel, '.md') })
          })
          .join(CHUNK_MARKER),
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
