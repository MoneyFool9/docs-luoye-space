#!/usr/bin/env node
/**
 * 同步 docs/ 下的 Markdown 文档到 Dify 知识库
 *
 * 设计要点：
 * 1. 幂等 —— 按文档名匹配远端，已存在则更新、不存在则创建，可反复运行
 * 2. 分片 —— 默认把同一目录下的系列笔记合并成一篇，规避 Dify 的文档数配额
 * 3. 限流 —— 默认按免费版「10 次知识库请求/分钟」节流，避免被临时封禁
 * 4. 增量 —— --changed-since 只同步指定 git ref 之后改动过的文件
 * 5. 可验证 —— 同步后轮询索引状态，把失败如实报出来
 *
 * 用法：
 *   node scripts/sync-to-dify.mjs                          # 分片全量同步
 *   node scripts/sync-to-dify.mjs --dry-run                # 只打印计划，不写远端
 *   node scripts/sync-to-dify.mjs --no-merge               # 一篇文件一篇文档（需大配额）
 *   node scripts/sync-to-dify.mjs --changed-since=HEAD~1   # 只同步改动过的文件
 *   node scripts/sync-to-dify.mjs --prune                  # 删除远端多余文档
 *   node scripts/sync-to-dify.mjs --limit=3                # 只处理前 N 篇（冒烟测试）
 *   node scripts/sync-to-dify.mjs --inspect                # 导出分段明细，诊断检索质量
 *   node scripts/sync-to-dify.mjs --inspect=NestJS         # 只看名称含 NestJS 的文档
 *   node scripts/sync-to-dify.mjs --probe                  # 探测 Dify 分段行为（临时文档，用完即删）
 *   node scripts/sync-to-dify.mjs --retrieve="模块怎么定义"    # 直查知识库召回，隔离验证 chunk 质量
 *
 * 环境变量（.env 或 CI secrets）：
 *   DIFY_API_KEY      知识库 API 密钥（dataset- 开头）
 *   DIFY_DATASET_ID   知识库 ID
 *   DIFY_BASE_URL     可选，默认 https://api.dify.ai/v1
 *   DIFY_THROTTLE_MS  可选，请求间隔毫秒，默认 6500（≈9 次/分钟）
 */

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { glob } from 'glob'
import dotenv from 'dotenv'
import { normalizeForIndexing, stripObsidianNoise, buildShardDocuments, CHUNK_MARKER } from './lib/dify-shard.mjs'

dotenv.config()

const DIFY_API_KEY = process.env.DIFY_API_KEY
const DIFY_DATASET_ID = process.env.DIFY_DATASET_ID
const DIFY_BASE_URL = (process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1').replace(/\/+$/, '')

const argv = process.argv.slice(2)
const hasFlag = (name) => argv.some((a) => a === `--${name}`)
const getOption = (name, fallback = null) => {
  const withEq = argv.find((a) => a.startsWith(`--${name}=`))
  if (withEq) return withEq.slice(name.length + 3)
  const idx = argv.indexOf(`--${name}`)
  if (idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) return argv[idx + 1]
  return fallback
}

const DRY_RUN = hasFlag('dry-run')
const PRUNE = hasFlag('prune')
const MERGE = !hasFlag('no-merge')
const CHANGED_SINCE = getOption('changed-since')
const LIMIT = getOption('limit') ? Number(getOption('limit')) : null
// --inspect[=关键词]：不写入，而是导出知识库文档的分段明细，用于诊断检索质量
const INSPECT = argv.includes('--inspect') ? '' : (getOption('inspect') ?? null)
// --probe：用临时文档探测 Dify 的分段行为（用完即删）
const PROBE = hasFlag('probe')
// --retrieve=<问题>：直查知识库召回，隔离验证 chunk 质量
const RETRIEVE = getOption('retrieve')
const THROTTLE_MS = Number(process.env.DIFY_THROTTLE_MS || 6500)
// Dify 默认把每个空行段落切成独立 chunk，导致命中片段过碎（实测平均仅 84 字）。
// 改用 custom 分段规则，让相邻段落合并且到上限，保证每个 chunk 自带完整上下文。
const MAX_TOKENS = Number(process.env.DIFY_MAX_TOKENS || 800)
const PAGE_SIZE = 100
const REQUEST_TIMEOUT_MS = 120_000

// ────────────────────────────── 前置校验 ──────────────────────────────

const HAS_CREDENTIALS = Boolean(DIFY_API_KEY && DIFY_DATASET_ID)

if (!HAS_CREDENTIALS) {
  if (!DRY_RUN) {
    console.error('❌ 缺少必需的环境变量 DIFY_API_KEY / DIFY_DATASET_ID')
    console.error('   本地：复制 .env.example 为 .env 并填写')
    console.error('   CI：在仓库 Settings → Secrets 中配置')
    process.exit(1)
  }
  console.warn('⚠️  未配置 DIFY_API_KEY / DIFY_DATASET_ID，DRY-RUN 跳过远端比对（全部按新建展示）\n')
}
if (DIFY_API_KEY?.startsWith('app-')) {
  console.error('❌ DIFY_API_KEY 是「应用」的 App Token（app- 开头），不能用于知识库接口。')
  console.error('   请到 Dify 控制台 → 知识库 → API 密钥，生成 dataset- 开头的密钥。')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * 自定义分段规则。
 *
 * 不指定时 Dify 会把每个空行段落直接当成一个 chunk（实测 NestJS 分片
 * 371 个段落 = 371 个 chunk，平均 84 字、43% 短于 50 字）。这种碎片
 * 与问题词面重合度可能很高，却装不下完整答案，表现为「命中了片段但
 * AI 答不出来」。详见 --probe 的实测结论。
 *
 * separator 用 CHUNK_MARKER（正文里绝不会出现的标记），而不是 \n\n：
 * Dify 只按 separator 切分且不合并相邻块，用 \n\n 就必须删掉正文所有空行，
 * 连带代码块空行也保不住，会把 `import ...` 与 `@Module({` 切到两个 chunk。
 */
const PROCESS_RULE = {
  mode: 'custom',
  rules: {
    pre_processing_rules: [
      { id: 'remove_extra_spaces', enabled: false }, // 保留原格式，避免破坏代码块缩进
      { id: 'remove_urls_emails', enabled: false }, // 保留文档里的链接
    ],
    segmentation: {
      separator: CHUNK_MARKER,
      max_tokens: MAX_TOKENS,
    },
  },
}

// ────────────────────────────── Dify API ──────────────────────────────

async function request(endpoint, { method = 'GET', body } = {}) {
  const res = await fetch(`${DIFY_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    /* 非 JSON 响应，保留原文 */
  }

  if (!res.ok) {
    const message = json?.message || text.slice(0, 300) || res.statusText
    const err = new Error(`HTTP ${res.status}: ${message}`)
    err.status = res.status
    throw err
  }
  return json
}

/** 分页拉取知识库全部文档，返回 name -> document 的映射 */
async function listAllDocuments({ silent = false } = {}) {
  const byName = new Map()
  let page = 1

  for (;;) {
    const data = await request(`/datasets/${DIFY_DATASET_ID}/documents?page=${page}&limit=${PAGE_SIZE}`)
    const items = data?.data ?? []
    for (const doc of items) {
      // 同名时保留较早创建的那条，避免重复文档互相覆盖
      const prev = byName.get(doc.name)
      if (!prev || (doc.created_at ?? 0) < (prev.created_at ?? 0)) byName.set(doc.name, doc)
    }

    if (!data?.has_more || items.length === 0) break
    page += 1
    if (page > 200) break // 安全阀
    if (!silent) await sleep(THROTTLE_MS)
  }

  return byName
}

const createByText = (name, text) =>
  request(`/datasets/${DIFY_DATASET_ID}/document/create-by-text`, {
    method: 'POST',
    body: {
      indexing_technique: 'high_quality',
      doc_form: 'text_model',
      name,
      text,
      process_rule: PROCESS_RULE,
    },
  })

const updateByText = (documentId, name, text) =>
  request(`/datasets/${DIFY_DATASET_ID}/documents/${documentId}/update-by-text`, {
    method: 'POST',
    body: { doc_form: 'text_model', name, text, process_rule: PROCESS_RULE },
  })

const deleteDocument = (documentId) =>
  request(`/datasets/${DIFY_DATASET_ID}/documents/${documentId}`, { method: 'DELETE' })

/**
 * 直接检索知识库（用 App Token 做不到，必须用 Dataset API Key）。
 *
 * 用途：把「知识库本身召回得好不好」与「应用侧配置（问题优化 / 重排序 /
 * Top K）」分离开。若这里能准确召回目标 chunk、而线上问答仍不稳定，
 * 那问题就在应用配置而不在知识库内容。
 */
async function retrieveFromDataset(query, { topK = 5 } = {}) {
  const res = await request(`/datasets/${DIFY_DATASET_ID}/retrieve`, {
    method: 'POST',
    body: {
      query,
      retrieval_model: {
        search_method: 'semantic_search',
        reranking_enable: false,
        top_k: topK,
        score_threshold_enabled: false,
      },
    },
  })
  return res?.records ?? []
}

async function inspectRetrieval(query) {
  console.log(`🔍 直接检索知识库：「${query}」\n`)
  const records = await retrieveFromDataset(query)
  if (records.length === 0) {
    console.log('   ⚠️ 未召回任何分段')
    return
  }
  records.forEach((r, i) => {
    const head = (r.segment?.content || '').match(/^【([^】]+)】/)?.[1] ?? '(无标题路径)'
    console.log(`── #${i + 1} score=${(r.score ?? 0).toFixed(4)} ──`)
    console.log(`   路径：${head}`)
    console.log(`   内容：${(r.segment?.content || '').replace(/\s+/g, ' ').slice(0, 170)}`)
    console.log('')
  })

  const top1 = records[0]
  console.log('═══ 结论 ═══')
  console.log(`   Top1 分数：${(top1.score ?? 0).toFixed(4)}`)
  const spread = (records[0].score ?? 0) - (records.at(-1)?.score ?? 0)
  console.log(`   首末分差：${spread.toFixed(4)}`)
  if ((top1.score ?? 0) < 0.4) {
    console.log('   ⚠️ Top1 分数偏低，向量模型对中文的区分度可能不足')
    console.log('      可在 Dify 知识库设置里更换 embedding 模型，或开启重排序（Rerank）')
  }
}

/** 列出某文档的全部分段（用于诊断 Dify 实际切成了什么） */
async function listSegments(documentId) {
  const all = []
  let page = 1
  for (;;) {
    const data = await request(
      `/datasets/${DIFY_DATASET_ID}/documents/${documentId}/segments?page=${page}&limit=100`
    )
    const items = data?.data ?? []
    all.push(...items)
    if (!data?.has_more || items.length === 0) break
    page += 1
    if (page > 100) break
    await sleep(THROTTLE_MS)
  }
  return all
}

/**
 * 诊断模式：导出分段明细，回答「Dify 到底把文档切成了什么」
 * 分段过碎会让检索只能命中零碎行，是「命中片段却答不出来」的常见原因。
 */
async function inspectSegments(keyword) {
  console.log('🔬 诊断知识库分段\n')
  const remote = await listAllDocuments()

  const targets = [...remote.values()].filter(
    (d) => !keyword || d.name.toLowerCase().includes(keyword.toLowerCase())
  )
  if (targets.length === 0) {
    console.log(`未找到名称包含「${keyword}」的文档。现有文档：`)
    ;[...remote.keys()].forEach((n) => console.log(`   - ${n}`))
    return
  }

  const buckets = { '<50': 0, '50-200': 0, '200-500': 0, '500-1000': 0, '>1000': 0 }
  let sumAll = 0
  let countAll = 0

  for (const doc of targets) {
    const segs = await listSegments(doc.id)
    const lens = segs.map((s) => (s.content || '').length).sort((a, b) => a - b)
    const sum = lens.reduce((a, b) => a + b, 0)
    const avg = lens.length ? Math.round(sum / lens.length) : 0
    sumAll += sum
    countAll += segs.length

    console.log(`\n═══ ${doc.name} ═══`)
    console.log(`   分段数 ${segs.length} | 总字数 ${sum} | 平均 ${avg} 字 | 最短 ${lens[0] ?? 0} | 最长 ${lens.at(-1) ?? 0}`)

    for (const s of segs) {
      const n = (s.content || '').length
      if (n < 50) buckets['<50']++
      else if (n < 200) buckets['50-200']++
      else if (n < 500) buckets['200-500']++
      else if (n < 1000) buckets['500-1000']++
      else buckets['>1000']++
    }

    // 最长的 3 段与最短的 5 段，看清分布
    const sorted = [...segs].sort((a, b) => (b.content || '').length - (a.content || '').length)
    console.log('   ── 最长的 3 段 ──')
    sorted.slice(0, 3).forEach((s) =>
      console.log(`      [${(s.content || '').length}字] ${(s.content || '').replace(/\s+/g, ' ').slice(0, 95)}`)
    )
    console.log('   ── 最短的 5 段 ──')
    sorted.slice(-5).forEach((s) =>
      console.log(`      [${(s.content || '').length}字] ${(s.content || '').replace(/\s+/g, ' ').slice(0, 95)}`)
    )
    await sleep(THROTTLE_MS)
  }

  const total = Object.values(buckets).reduce((a, b) => a + b, 0)
  console.log('\n═══ 分段长度分布 ═══')
  Object.entries(buckets).forEach(([k, v]) => {
    const pct = total ? ((v / total) * 100).toFixed(0) : 0
    const bar = '█'.repeat(Math.round(pct / 3))
    console.log(`   ${k.padEnd(9)} ${String(v).padStart(5)} 段  ${String(pct).padStart(3)}%  ${bar}`)
  })

  // 分段过碎是「命中片段却答不出来」的主因，这里给出明确结论
  const tiny = buckets['<50']
  if (total > 0) {
    const tinyPct = (tiny / total) * 100
    console.log('')
    if (tinyPct > 25) {
      console.log(`   ⚠️ ${tinyPct.toFixed(0)}% 的分段短于 50 字，检索容易命中碎片而非完整答案。`)
      console.log('      建议按 scripts/sync-to-dify.mjs 的 PROCESS_RULE 重新同步以合并段落。')
    } else {
      console.log(`   ✅ 碎片比例正常（${tinyPct.toFixed(0)}% 短于 50 字）`)
    }
    const avg = Math.round(sumAll / total)
    console.log(`   全库平均分段长度：${avg} 字`)
  }
}

// ────────────────────────────── 文档准备 ──────────────────────────────

/** 用 git 过滤出指定 ref 之后改动过的文件；git 不可用时退化为全量 */
function resolveChangedFiles(ref) {
  try {
    const out = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', ref, '--', 'docs'], {
      encoding: 'utf-8',
    })
    return new Set(out.split('\n').map((l) => l.trim()).filter(Boolean))
  } catch (error) {
    console.warn(`⚠️  无法通过 git 解析 ${ref} 的改动（${error.message.split('\n')[0]}），退化为全量同步\n`)
    return null
  }
}

/** 扫描本地 markdown，返回 { file, rel, dir, text } 列表 */
async function collectSourceFiles() {
  let files = await glob('docs/**/*.md', { cwd: process.cwd(), absolute: false, nodir: true })
  files = files.map((f) => f.replace(/\\/g, '/')).sort()

  const total = files.length
  if (CHANGED_SINCE) {
    const changed = resolveChangedFiles(CHANGED_SINCE)
    if (changed) {
      files = files.filter((f) => changed.has(f))
      console.log(`🔍 --changed-since=${CHANGED_SINCE}：${total} 个文件中有 ${files.length} 个发生改动`)
    }
  }

  const out = []
  const skippedEmpty = []
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf-8')
    if (!raw.trim()) {
      skippedEmpty.push(file)
      continue
    }
    out.push({
      file,
      rel: file.replace(/^docs\//, ''),
      dir: path.dirname(file.replace(/^docs\//, '')),
      // 先还原双链为可读文本，再去掉会干扰检索的 Obsidian 噪音行
      text: stripObsidianNoise(normalizeForIndexing(raw)),
    })
  }

  if (skippedEmpty.length > 0) {
    console.log(`⏭️  跳过 ${skippedEmpty.length} 个空文件：${skippedEmpty.join(', ')}`)
  }
  return out
}

/**
 * 探针：验证 process_rule 是否真的生效、以及 Dify 是否合并相邻段落。
 *
 * 用同一段内容配不同 separator 创建临时文档，看分段数如何变化：
 *   若 process_rule 生效且不合并 → 分段数应等于该 separator 切出的块数
 *   若被忽略（沿用旧规则）→ 三种配置的分段数会相同
 * 结束后自动删除临时文档，不污染知识库。
 */
async function probeSegmentation() {
  console.log('🧪 分段规则探针（将创建并删除临时文档）\n')

  // 5 个非空行、3 个空行分隔的块，能区分各种切分方式
  const content = '甲段第一行\n甲段第二行\n\n乙段第一行\n乙段第二行\n\n丙段第一行'

  const cases = [
    { key: 'nl2', label: 'separator = "\\n\\n"', separator: '\n\n', expect: '3 段' },
    { key: 'nl', label: 'separator = "\\n"', separator: '\n', expect: '5 段' },
    { key: 'none', label: 'separator = "🦄"（内容中不存在）', separator: '🦄', expect: '1 段' },
  ]

  const created = []
  try {
    for (const c of cases) {
      const name = `__probe_${c.key}__.md`
      const res = await request(`/datasets/${DIFY_DATASET_ID}/document/create-by-text`, {
        method: 'POST',
        body: {
          indexing_technique: 'high_quality',
          doc_form: 'text_model',
          name,
          text: content,
          process_rule: {
            mode: 'custom',
            rules: {
              pre_processing_rules: [{ id: 'remove_extra_spaces', enabled: false }],
              segmentation: { separator: c.separator, max_tokens: 500 },
            },
          },
        },
      })
      created.push({ ...c, name, id: res?.document?.id, batch: res?.batch })
      console.log(`   ✓ 已创建 ${c.label}（预期 ${c.expect}）`)
      await sleep(THROTTLE_MS)
    }

    // 等索引就绪
    console.log('\n   等待索引完成…')
    for (const d of created) {
      if (!d.batch) continue
      for (let i = 0; i < 20; i++) {
        const res = await request(`/datasets/${DIFY_DATASET_ID}/documents/${d.batch}/indexing-status`)
        const st = (res?.data ?? []).map((x) => x.indexing_status)
        if (st.length && st.every((s) => s === 'completed' || s === 'error')) break
        await sleep(THROTTLE_MS)
      }
      await sleep(THROTTLE_MS)
    }

    const observed = []
    for (const d of created) {
      const segs = await listSegments(d.id)
      observed.push(segs.length)
      console.log(`\n═══ ${d.label} ═══`)
      console.log(`   预期 ${d.expect} | 实际 ${segs.length} 段`)
      segs.forEach((s, i) =>
        console.log(`      [${i + 1}] (${(s.content || '').length}字) ${JSON.stringify((s.content || '').slice(0, 70))}`)
      )
      await sleep(THROTTLE_MS)
    }

    console.log('\n═══ 结论 ═══')
    const allSame = observed.every((n) => n === observed[0])
    if (allSame) {
      console.log(`   ⚠️ 三种 separator 都得到 ${observed[0]} 段 → process_rule 未生效，沿用旧规则`)
    } else if (observed[1] > observed[0]) {
      console.log('   ✅ process_rule 生效；Dify 按 separator 切分后不合并相邻块')
      console.log('      → 要得到粗分段，需让输入文本里 separator 出现得更少')
    } else {
      console.log(`   ℹ️ process_rule 生效，但切分行为与预期不同：${observed.join(' / ')} 段`)
    }
  } finally {
    console.log('\n🧹 清理临时文档…')
    for (const d of created) {
      if (d.id) {
        try {
          await deleteDocument(d.id)
          console.log(`   🗑️ 已删除 ${d.name}`)
        } catch (e) {
          console.log(`   ❌ 删除 ${d.name} 失败：${e.message}`)
        }
      }
      await sleep(THROTTLE_MS)
    }
  }
}

// ────────────────────────────── 索引结果核验 ──────────────────────────────

/**
 * 轮询索引状态。
 * 注意：Dify 的 indexing-status 端点接收的是创建/更新时返回的 batch ID，
 * 不是 document ID —— 传 document ID 会得到 404 Documents not found。
 */
async function verifyIndexing(batches, { maxWaitMs = 300_000, cycleMs = 10_000 } = {}) {
  const pending = new Map(batches)
  const status = new Map()
  const deadline = Date.now() + maxWaitMs

  while (pending.size > 0 && Date.now() < deadline) {
    for (const [batch] of [...pending]) {
      try {
        const res = await request(`/datasets/${DIFY_DATASET_ID}/documents/${batch}/indexing-status`)
        const items = res?.data ?? []
        if (items.length === 0) {
          await sleep(THROTTLE_MS)
          continue
        }
        const statuses = items.map((i) => i.indexing_status)
        if (statuses.every((s) => s === 'completed' || s === 'error')) {
          status.set(batch, statuses.includes('error') ? 'error' : 'completed')
          pending.delete(batch)
        }
      } catch (error) {
        status.set(batch, `检查失败：${error.message}`)
        pending.delete(batch)
      }
      await sleep(THROTTLE_MS)
    }
    if (pending.size > 0) await sleep(cycleMs)
  }

  for (const [batch] of pending) status.set(batch, '超时未完成（索引可能仍在后台进行）')
  return status
}

// ────────────────────────────── 主流程 ──────────────────────────────

async function main() {
  if (RETRIEVE !== null || INSPECT !== null || PROBE) {
    if (!HAS_CREDENTIALS) {
      console.error('❌ --retrieve / --inspect / --probe 需要 DIFY_API_KEY / DIFY_DATASET_ID')
      process.exit(1)
    }
    if (PROBE) await probeSegmentation()
    if (INSPECT !== null) await inspectSegments(INSPECT)
    if (RETRIEVE !== null) await inspectRetrieval(RETRIEVE)
    return { created: 0, updated: 0, failed: [], pruned: 0, bytes: 0 } // 诊断模式不写入正文
  }

  const sources = await collectSourceFiles()
  // 分片规则与构建时映射表共用 scripts/lib/dify-shard.mjs，避免两处逻辑漂移
  const documents = MERGE
    ? buildShardDocuments(sources)
    : sources.map((s) => ({ name: s.rel, text: s.text, entry: `docs/${s.rel}`, count: 1 }))

  console.log('\n🚀 同步 docs/ 到 Dify 知识库')
  console.log(`   接口：${DIFY_BASE_URL}`)
  console.log(`   知识库：${DIFY_DATASET_ID || '(未配置)'}`)
  console.log(`   模式：${MERGE ? '分片（同目录合并）' : '逐文件'}${DRY_RUN ? ' + DRY-RUN 不写入' : ''}${PRUNE ? ' + 清理远端多余文档' : ''}`)
  console.log(`   分段：custom 规则，上限 ${MAX_TOKENS} tokens（Dify 默认不合并段落，碎片会拉低检索质量）`)
  console.log(`   节流：${THROTTLE_MS}ms/请求（约 ${Math.floor(60000 / THROTTLE_MS)} 次/分钟）`)
  console.log(`   规模：${sources.length} 个源文件 → ${documents.length} 篇文档`)

  if (documents.length > 50) {
    console.log(`\n⚠️  将上传 ${documents.length} 篇文档，超过 Dify 免费版「50 个知识库文档」配额。`)
    console.log('   如遇配额报错：改用默认分片模式，或升级到 Professional（500 篇）。')
  }

  const limited = LIMIT && Number.isFinite(LIMIT) ? documents.slice(0, LIMIT) : documents
  if (limited.length !== documents.length) {
    console.log(`   ⚠️ --limit=${LIMIT}：本次只处理前 ${limited.length} 篇（冒烟测试）`)
  }
  console.log('')

  if (limited.length === 0) {
    console.log('⚠️  没有需要同步的文档，结束。')
    return { created: 0, updated: 0, failed: [], pruned: 0, bytes: 0 }
  }

  let remote = new Map()
  if (HAS_CREDENTIALS) {
    console.log('📡 读取知识库现状…')
    remote = await listAllDocuments()
    console.log(`📚 知识库现有 ${remote.size} 篇文档\n`)
    await sleep(THROTTLE_MS)
  }

  const result = { created: 0, updated: 0, failed: [], pruned: 0, touched: [], bytes: 0 }
  const localNames = new Set(limited.map((d) => d.name))

  // 预演时把「远端有、本地没有」的文档列出来，让 --prune 的后果可见
  if (DRY_RUN && HAS_CREDENTIALS) {
    const remoteOnly = [...remote.values()].filter((d) => !localNames.has(d.name))
    if (remoteOnly.length > 0) {
      console.log(`🔎 远端有 ${remoteOnly.length} 篇本地不存在的文档：`)
      remoteOnly.forEach((d) => console.log(`      - ${d.name}`))
      console.log('      （--prune 会删除这些；不传则保留，可能与前文分片并存造成重复）\n')
    }
  }

  for (let i = 0; i < limited.length; i++) {
    const doc = limited[i]
    const existing = remote.get(doc.name)
    const label = `[${i + 1}/${limited.length}] ${doc.name}`
    const sizeKb = (Buffer.byteLength(doc.text) / 1024).toFixed(1)
    const mergedNote = doc.count > 1 ? `  (合并 ${doc.count} 篇)` : ''

    if (DRY_RUN) {
      console.log(`${label}  ${existing ? '→ 将更新' : '→ 将创建'}  ${sizeKb} KB${mergedNote}`)
      existing ? result.updated++ : result.created++
      result.bytes += Buffer.byteLength(doc.text)
      continue
    }

    try {
      if (existing) {
        const res = await updateByText(existing.id, doc.name, doc.text)
        result.updated++
        if (res?.batch) result.touched.push([res.batch, doc.name])
        console.log(`${label}  ✅ 已更新  ${sizeKb} KB${mergedNote}`)
      } else {
        const res = await createByText(doc.name, doc.text)
        const documentId = res?.document?.id
        if (res?.batch) result.touched.push([res.batch, doc.name])
        remote.set(doc.name, { id: documentId, name: doc.name })
        result.created++
        console.log(`${label}  ✅ 已创建  ${sizeKb} KB${mergedNote}`)
      }
      result.bytes += Buffer.byteLength(doc.text)
    } catch (error) {
      // 远端已存在同名文档但列表未反映 → 退回更新
      const isConflict = error.status === 409 || /already exists/i.test(error.message)
      if (isConflict && HAS_CREDENTIALS) {
        try {
          const refreshed = await listAllDocuments({ silent: true })
          const hit = refreshed.get(doc.name)
          if (hit?.id) {
            const res = await updateByText(hit.id, doc.name, doc.text)
            result.updated++
            result.bytes += Buffer.byteLength(doc.text)
            if (res?.batch) result.touched.push([res.batch, doc.name])
            console.log(`${label}  ✅ 已更新（重试命中已存在文档）`)
            await sleep(THROTTLE_MS)
            continue
          }
        } catch {
          /* 交给下面的失败分支处理 */
        }
      }
      result.failed.push({ name: doc.name, error: error.message })
      console.log(`${label}  ❌ 失败：${error.message}`)
    }

    if (i < limited.length - 1) await sleep(THROTTLE_MS)
  }

  // 清理远端已不存在的文档
  if (PRUNE && !DRY_RUN && HAS_CREDENTIALS) {
    const stale = [...remote.values()].filter((d) => d.id && !localNames.has(d.name))
    if (stale.length > 0) {
      console.log(`\n🧹 清理 ${stale.length} 篇本地已不存在的文档…`)
      for (const doc of stale) {
        try {
          await deleteDocument(doc.id)
          result.pruned++
          console.log(`   🗑️  已删除 ${doc.name}`)
        } catch (error) {
          result.failed.push({ name: `(清理) ${doc.name}`, error: error.message })
          console.log(`   ❌ 删除失败 ${doc.name}：${error.message}`)
        }
        await sleep(THROTTLE_MS)
      }
    }
  }

  // 核验索引状态
  if (!DRY_RUN && result.touched.length > 0) {
    console.log(`\n🔎 核验 ${result.touched.length} 篇文档的索引状态（最长等待 5 分钟）…`)
    const verified = await verifyIndexing(result.touched)
    const bad = [...verified].filter(([, state]) => state !== 'completed')
    if (bad.length > 0) {
      console.log(`   ⚠️  ${bad.length} 篇索引异常：`)
      bad.forEach(([batch, state]) => console.log(`      - ${new Map(result.touched).get(batch)}: ${state}`))
    } else {
      console.log('   ✅ 全部索引完成')
    }
  }

  // ── 报告 ──
  console.log('\n═══════════════════════════════════════')
  console.log('📊 同步完成报告')
  console.log('═══════════════════════════════════════')
  console.log(`✅ 新建：${result.created}`)
  console.log(`♻️  更新：${result.updated}`)
  console.log(`🗑️  清理：${result.pruned}`)
  if (result.bytes > 0) console.log(`🎯 提交体积：${(result.bytes / 1024).toFixed(0)} KB`)
  console.log(`❌ 失败：${result.failed.length}`)
  if (result.failed.length > 0) {
    console.log('\n失败明细：')
    result.failed.forEach(({ name, error }) => console.log(`  - ${name}: ${error}`))
  }
  console.log('═══════════════════════════════════════\n')

  return result
}

main()
  .then((result) => {
    if (result.failed.length > 0) {
      console.error(`❌ 有 ${result.failed.length} 篇文档同步失败`)
      process.exit(1)
    }
    console.log('🎉 同步成功')
  })
  .catch((error) => {
    console.error('❌ 同步过程发生致命错误:', error.message)
    process.exit(1)
  })
