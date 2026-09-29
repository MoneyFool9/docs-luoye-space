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
 *   node scripts/sync-to-dify.mjs --datasets                 # 列出账号下所有知识库，核对应用绑定的是哪个
 *   node scripts/sync-to-dify.mjs --audit                    # 审核文档与分段状态（含全文索引）
 *   node scripts/sync-to-dify.mjs --structure                # 分析分段结构（代码是否被截断）
 *   node scripts/sync-to-dify.mjs --structure=nodejs         # 只看名称含 nodejs 的文档
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
// --audit：审核文档与分段状态（含全文索引 keywords 是否生成）
const AUDIT = hasFlag('audit')
// --structure[=关键词]：分析分段结构（代码是否被截断、是否脱离上下文）
const STRUCTURE = argv.includes('--structure') ? '' : (getOption('structure') ?? null)
// --datasets：列出账号下所有知识库，确认应用绑定的究竟是哪一个
const LIST_DATASETS = hasFlag('datasets')
// --no-serial：跳过「逐篇等索引完成」，恢复批量提交（快但易触发 embedding 限流）
// --dataset：打印知识库配置（embedding 模型、索引方式、文档统计）
const SHOW_DATASET = hasFlag('dataset')
const THROTTLE_MS = Number(process.env.DIFY_THROTTLE_MS || 6500)
// 分段规则里的 max_tokens。注意它不是合并目标——Dify 严格按 separator 切分且
// 不合并相邻块，max_tokens 只是「单块超过此上限就硬切」的阈值。所以粗分段靠
// 输入文本侧的 coarsenForChunking，而这里保持略高于我们自己的 limit（700 字），
// 避免 Dify 对同一块二次硬切造成代码截断。
const MAX_TOKENS = Number(process.env.DIFY_MAX_TOKENS || 2400)
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

// 每篇提交后等待索引完成：Dify 会把整个文档切成很多分段并并发调用 embedding
// 接口，而 embedding 供应商（如阿里云百炼）有速率限制。一次提交多篇会让
// 并发请求撞上 429 Throttling.RateQuota，结果是全部文档 indexing=error、
// tokens=0——外表看文档都在，实际一个向量都没建，检索自然全部落空。
const SERIAL_INDEX = !hasFlag('no-serial')
const INDEX_WAIT_MS = Number(process.env.DIFY_INDEX_WAIT_MS || 600_000)

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
  const meta = { total: 0, enabled: 0, disabled: 0, statuses: new Set() }
  let page = 1

  for (;;) {
    const data = await request(`/datasets/${DIFY_DATASET_ID}/documents?page=${page}&limit=${PAGE_SIZE}`)
    const items = data?.data ?? []
    for (const doc of items) {
      meta.total++
      if (doc.enabled === false) meta.disabled++
      else meta.enabled++
      for (const s of [doc.indexing_status, doc.status, doc.display_status]) {
        if (s) meta.statuses.add(s)
      }
      // 同名时保留较早创建的那条，避免重复文档互相覆盖
      const prev = byName.get(doc.name)
      if (!prev || (doc.created_at ?? 0) < (prev.created_at ?? 0)) byName.set(doc.name, doc)
    }

    if (!data?.has_more || items.length === 0) break
    page += 1
    if (page > 200) break // 安全阀
    if (!silent) await sleep(THROTTLE_MS)
  }

  return Object.assign(byName, { meta })
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
 * 打印知识库配置。
 *
 * embedding 模型直接决定召回质量：多模态向量模型（如 multimodal-embedding-v1）
 * 面向图文对齐，对中文技术文本的语义区分度往往不足，表现为分数集中在
 * 0.1～0.4 的窄区间、甚至原句匹配也召回不到自己所在的分段。
 */
/**
 * 列出账号下所有知识库。
 *
 * 排查「直查 API 能召回、但应用侧召回归零」时，首先要排除应用绑定的
 * 知识库与脚本同步的不是同一个——换过知识库时极易发生。
 */
async function listDatasets() {
  console.log('📚 账号下所有知识库\n')
  const res = await request('/datasets?page=1&limit=100')
  const items = res?.data ?? []
  if (items.length === 0) {
    console.log('   未找到任何知识库')
    return
  }

  items.forEach((d, i) => {
    const current = d.id === DIFY_DATASET_ID
    console.log(`── ${i + 1}. ${d.name}${current ? '   ← 脚本当前同步的就是这个' : ''} ──`)
    console.log(`   ID            ${d.id}`)
    console.log(`   文档数          ${d.document_count ?? '—'}`)
    console.log(`   索引方式        ${d.indexing_technique ?? '—'}`)
    console.log(`   embedding     ${d.embedding_model_provider ?? '—'} / ${d.embedding_model ?? '—'}`)
    const rm = d.retrieval_model_dict || {}
    console.log(
      `   检索方式        ${rm.search_method ?? '—'}${rm.reranking_enable ? ' + 重排序' : ''}，Top K ${rm.top_k ?? '—'}`
    )
    console.log('')
  })

  if (items.length > 1) {
    console.log('   ⚠️ 存在多个知识库。若 Dify 应用「上下文」里关联的不是标注的那个，')
    console.log('      应用就检索不到脚本同步的内容。')
  }
}

/**
 * 列出知识库全部分段，并统计各文档的索引状态。
 *
 * 用于确认文档是否处于可用状态，以及每个分段是否带 keywords（全文索引
 * 依赖它）。分段没有 keywords 时，keyword_search 会召回 0 条。
 */
async function auditSegments() {
  console.log('🔎 审核文档与分段状态\n')
  const remote = await listAllDocuments()
  // 先看文档级状态：enabled=false 或 indexing_status 异常都会导致
  // 后续 update-by-text 报「Document is not available」
  console.log('═══ 文档级状态 ═══')
  console.log(`   总数 ${remote.meta.total} | enabled ${remote.meta.enabled} | disabled ${remote.meta.disabled}`)
  console.log(`   出现的状态值: ${[...remote.meta.statuses].join(', ') || '(无)'}`)
  console.log('')
  for (const doc of remote.values()) {
    console.log(
      `   ${doc.enabled === false ? '🚫' : '✓'} ${doc.name}\n` +
        `      enabled=${doc.enabled} indexing=${doc.indexing_status ?? '?'} status=${doc.status ?? '?'} display=${doc.display_status ?? '?'}\n` +
        `      word_count=${doc.word_count ?? '?'} tokens=${doc.tokens ?? '?'} segment_count=${doc.segment_count ?? '?'}`
    )
    // Dify 会在文档级或分段级记录失败原因，这是定位 indexing=error 的关键
    const docErr = doc.error ?? doc.indexing_error ?? null
    if (docErr) console.log(`      ❗ 文档错误: ${String(docErr).slice(0, 300)}`)
    try {
      const st = await request(`/datasets/${DIFY_DATASET_ID}/documents/${doc.id}/indexing-status`)
      const arr = st?.data ?? []
      if (arr.length > 0) {
        const sum = arr.map((x) => `${x.indexing_status}${x.error ? `(${String(x.error).slice(0, 80)})` : ''}`)
        console.log(`      批次状态: ${sum.join(', ')}`)
      }
    } catch (e) {
      console.log(`      （批次状态查询失败：${e.message.slice(0, 60)}）`)
    }
    await sleep(THROTTLE_MS)
  }

  let withKeywords = 0
  let withoutKeywords = 0
  const noKwSamples = []

  for (const doc of remote.values()) {
    let status = '?'
    try {
      const st = await request(`/datasets/${DIFY_DATASET_ID}/documents/${doc.id}/indexing-status`)
      status = (st?.data ?? []).map((x) => x.indexing_status).join(',') || '?'
    } catch {
      /* 忽略单个文档的查询失败 */
    }

    const segs = await listSegments(doc.id)
    const kwCount = segs.filter((s) => (s.keywords ?? []).length > 0).length
    withKeywords += kwCount
    withoutKeywords += segs.length - kwCount

    console.log(`   ${doc.name}`)
    console.log(`      索引状态 ${status} | 分段 ${segs.length} | 带 keywords ${kwCount}`)

    if (kwCount === 0 && segs.length > 0 && noKwSamples.length < 2) {
      noKwSamples.push(segs[0])
    }
    await sleep(THROTTLE_MS)
  }

  console.log('═══ 分段字段审视（取一个分段看全部字段）═══')
  try {
    const firstDoc = [...remote.values()][0]
    const segs = await listSegments(firstDoc.id)
    if (segs[0]) {
      const fields = Object.keys(segs[0])
      console.log(`   字段列表: ${fields.join(', ')}`)
      console.log(`   keywords 字段值: ${JSON.stringify(segs[0].keywords ?? null)}`)
      // 全文检索若依赖其他字段（如 index_node_hash / content 分词），这里能看出来
      const hint = fields.filter((f) => /keyword|index|hash|word|token/i.test(f))
      console.log(`   可能影响全文索引的字段: ${hint.join(', ') || '(无)'}`)
    }
  } catch (error) {
    console.log(`   取分段失败：${error.message}`)
  }

  console.log('\n═══ 全文索引（keywords）统计 ═══')
  console.log(`   带 keywords 的分段：${withKeywords}`)
  console.log(`   不带 keywords 的分段：${withoutKeywords}`)

  if (noKwSamples.length > 0) {
    console.log('\n   无 keywords 的分段样例：')
    noKwSamples.forEach((s) => {
      console.log(`      content(${(s.content || '').length}字): ${(s.content || '').replace(/\s+/g, ' ').slice(0, 70)}`)
      console.log(`      keywords: ${JSON.stringify(s.keywords ?? null)}`)
      console.log('')
    })
  }

  console.log('═══ 结论 ═══')
  if (withKeywords === 0 && withoutKeywords > 0) {
    console.log('   ⚠️ 所有分段都没有 keywords → keyword_search 会召回 0 条。')
    console.log('      若 Dify 应用侧的检索方式含关键词检索（单独用或混合），')
    console.log('      整个检索就可能返回空，表现为「知识库直查有结果、应用却答不出来」。')
    console.log('      处理：把应用侧的检索方式改为「向量检索」或调整混合权重为纯向量。')
  } else if (withKeywords > 0) {
    console.log(`   ✅ ${withKeywords} 个分段带 keywords，全文索引正常`)
  }
}

async function showDatasetInfo() {
  console.log('📋 知识库配置\n')
  const info = await request(`/datasets/${DIFY_DATASET_ID}`)

  const rows = [
    ['名称', info?.name],
    ['索引方式', info?.indexing_technique],
    ['权限', info?.permission],
    ['embedding 供应商', info?.embedding_model_provider],
    ['embedding 模型', info?.embedding_model],
    ['文档数', info?.document_count],
    ['总分段数', info?.word_count != null ? `${info.word_count} 字` : undefined],
    ['检索方式', info?.retrieval_model_dict?.search_method],
    ['重排序', info?.retrieval_model_dict?.reranking_enable ? '已开启' : '未开启'],
    ['Top K', info?.retrieval_model_dict?.top_k],
    ['分数阈值', info?.retrieval_model_dict?.score_threshold_enabled ? info.retrieval_model_dict.score_threshold : '未启用'],
  ]
  rows.forEach(([k, v]) => {
    if (v !== undefined && v !== null) console.log(`   ${k.padEnd(16)} ${v}`)
  })

  console.log('\n═══ 原始 retrieval_model_dict ═══')
  console.log(JSON.stringify(info?.retrieval_model_dict ?? null, null, 2))

  // 自检：分别用三种检索方式各查一次。
  // 向量索引缺失时，keyword_search 能用而 semantic/hybrid 会报
  // 「Collection not found」——这正是「切到混合检索后召回变 0」的典型症状。
  console.log('\n═══ 自检：分别测试各种检索方式 ═══')
  const probeQuery = 'NestJS 模块 定义 @Module'
  const modes = [
    ['keyword_search', '关键词检索', false],
    ['semantic_search', '向量检索', false],
    ['hybrid_search', '混合检索', false],
    // 重排序单独测：若应用侧开了重排序而重排序模型不可用，
    // 检索会失败或返回空 → 表现为「直查有结果、应用却答不出来」
    ['hybrid_search', '混合检索 + 重排序', true],
  ]
  const modeResult = {}

  for (const [mode, label, rerank] of modes) {
    try {
      const t0 = Date.now()
      const records = await retrieveFromDataset(probeQuery, { mode, rerank })
      const ms = Date.now() - t0
      modeResult[label] = records.length
      const top = records[0]?.score != null ? `，Top1 分数 ${records[0].score.toFixed(4)}` : ''
      console.log(`   ${records.length > 0 ? '✅' : '❌'} ${label}：召回 ${records.length} 条${top}  [${ms}ms]`)
      if (records.length > 0) {
        const head = (records[0].segment?.content || '').match(/^【([^】]+)】/)?.[1] ?? '(无路径)'
        console.log(`        首位：${head.slice(0, 56)}`)
      }
    } catch (error) {
      modeResult[label] = `错误:${error.message.slice(0, 60)}`
      console.log(`   ❌ ${label}：${error.message.slice(0, 130)}`)
    }
    await sleep(THROTTLE_MS)
  }

  const n = (k) => (typeof modeResult[k] === 'number' ? modeResult[k] : 0)
  const kwOk = n('关键词检索') > 0
  const vecOk = n('向量检索') > 0
  const hybridOk = n('混合检索') > 0
  const rerankOk = n('混合检索 + 重排序') > 0

  console.log('\n═══ 自检结论 ═══')
  if (hybridOk && !rerankOk) {
    console.log('   🔴 不开重排序能召回，开了就失败 → 重排序模型不可用。')
    console.log('      若 Dify 应用侧开启了重排序，就会表现为「知识库直查有结果、')
    console.log('      应用侧上下文为空、回答全是「不清楚」。')
    console.log('      处理：Dify 应用 → 上下文 → 检索设置，关掉重排序（或换模型）。')
  } else if (hybridOk) {
    console.log('   ✅ 混合检索可召回，重排序也正常')
    console.log('      → 知识库侧没问题；若应用侧仍答不出来，问题在应用自身的检索设置。')
  } else if (kwOk && !vecOk) {
    console.log('   🔴 关键词检索可用，但向量检索失败 → 向量索引缺失。')
    console.log('      处理：gh workflow run sync-dify.yml -f mode=full -f merge=true')
  } else if (hybridOk && !kwOk) {
    console.log('   ℹ️ 全文索引不可用（keywords 为空）、向量检索可用。')
    console.log('      若应用侧用混合检索，关键词那一路会返回空；')
    console.log('      若重排序/超时再叠加，就很容易整体召回归零。')
    console.log('      最稳的做法：应用侧用「向量检索」并关掉重排序。')
  } else {
    console.log('   ⚠️ 各方式均召回 0 条，检查文档是否处于可用状态')
  }

  const model = String(info?.embedding_model || '')
  const method = String(info?.retrieval_model_dict?.search_method || '')
  const rerank = Boolean(info?.retrieval_model_dict?.reranking_enable)
  const topK = info?.retrieval_model_dict?.top_k
  const thresholdOn = Boolean(info?.retrieval_model_dict?.score_threshold_enabled)

  console.log('\n═══ 建议 ═══')

  // 检索方式是最关键的一项：关键词检索只做字面匹配，中文自然问法很难命中
  if (method === 'keyword_search') {
    console.log('   ⚠️ 检索方式是「关键词检索」（keyword_search），只做字面匹配。')
    console.log('      后果：笔记里写「@Module() 装饰器」时，用这个词能命中；')
    console.log('      但用户问「模块怎么定义」就词面对不上，召回不到或召回错。')
    console.log('      建议改为「向量检索」或「混合检索」：')
    console.log('      Dify 控制台 → 知识库 → 设置 → 检索设置 → 检索方式')
  } else if (method === 'hybrid_search') {
    console.log('   ✅ 已用混合检索（hybrid_search），兼顾字面与语义匹配')
  } else if (method === 'semantic_search') {
    console.log('   ✅ 已用向量检索（semantic_search）')
  }

  if (/multimodal/i.test(model)) {
    console.log(`   ⚠️ embedding 用的是多模态模型「${model}」，面向图文对齐，`)
    console.log('      对中文技术文本的语义区分度不足。建议换成纯文本模型')
    console.log('      （如 text-embedding-v3 / bge-m3），然后重新索引。')
  }

  if (!rerank) {
    console.log('   ⚠️ 未开启重排序（Rerank）。它能在初步召回后重新精排，')
    console.log('      对中文技术文档的提升通常很明显，建议开启。')
  }

  if (topK != null && topK <= 2) {
    console.log(`   ⚠️ Top K 仅为 ${topK}，只召回 ${topK} 个分段，容错空间很小。`)
    console.log('      命中一个无关分段就几乎没机会补救，建议调到 4～6。')
  }

  if (!thresholdOn) {
    console.log('   ℹ️ 未启用分数阈值（一般无需修改，除非想过滤低质量召回）')
  }

  if (method !== 'keyword_search' && rerank && !/multimodal/i.test(model) && (topK ?? 0) > 2) {
    console.log('   ✅ 检索配置看起来正常')
  }
}

async function retrieveFromDataset(query, { topK = 5, mode = null, rerank = false } = {}) {
  const body = { query }
  if (mode) {
    body.retrieval_model = {
      search_method: mode,
      reranking_enable: rerank,
      top_k: topK,
      score_threshold_enabled: false,
    }
  }
  const res = await request(`/datasets/${DIFY_DATASET_ID}/retrieve`, { method: 'POST', body })
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

/**
 * 等待单篇文档索引完成。
 * 返回 'completed' | 'error' | 'timeout'，并附上 Dify 记录的错误原因。
 */
async function waitForDocument(documentId, { maxWaitMs = INDEX_WAIT_MS, cycleMs = 8_000 } = {}) {
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    try {
      const docs = await request(`/datasets/${DIFY_DATASET_ID}/documents?page=1&limit=100`)
      const hit = (docs?.data ?? []).find((d) => d.id === documentId)
      if (hit) {
        const st = hit.indexing_status
        if (st === 'completed' || st === 'error') {
          const err = hit.error
            ? String(typeof hit.error === 'string' ? hit.error : JSON.stringify(hit.error))
            : null
          return { state: st, error: err ? err.slice(0, 300) : null }
        }
      }
    } catch {
      /* 网络抖动：继续轮询 */
    }
    await sleep(cycleMs)
  }
  return { state: 'timeout', error: null }
}

/**
 * 从 Dify 的错误信息里识别供应商限流。
 * 命中后应拉长等待再重试，而不是把它当成普通失败。
 */
function isRateLimited(errorText) {
  if (!errorText) return false
  return /429|Throttling|RateQuota|rate limit/i.test(errorText)
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
 * 探针：确认 process_rule 是否影响全文索引（keywords）的生成。
 *
 * 现象：重新同步后所有分段的 keywords 都是 null，keyword_search 召回 0 条，
 * 而混合检索（含向量部分）正常。需要区分是「自定义 process_rule 导致」
 * 还是「该知识库本就不生成 keywords」。
 */
async function probeKeywordGeneration() {
  console.log('\n🧪 全文索引（keywords）探针\n')

  const content = [
    '# 测试标题',
    '',
    '这是用于探测全文索引的第一段内容，包含 NestJS 模块与装饰器等术语。',
    '',
    '第二段内容用于验证关键词提取是否正常工作。',
  ].join('\n')

  const cases = [
    { key: 'auto', label: 'automatic 模式', rule: { mode: 'automatic' } },
    { key: 'custom', label: 'custom 模式（自定义分隔符）', rule: PROCESS_RULE },
    {
      key: 'customnl',
      label: 'custom 模式（空行分隔符）',
      rule: {
        mode: 'custom',
        rules: {
          pre_processing_rules: [
            { id: 'remove_extra_spaces', enabled: false },
            { id: 'remove_urls_emails', enabled: false },
          ],
          segmentation: { separator: '\n\n', max_tokens: 800 },
        },
      },
    },
  ]

  const created = []
  try {
    for (const c of cases) {
      const name = `__kwprobe_${c.key}__.md`
      const res = await request(`/datasets/${DIFY_DATASET_ID}/document/create-by-text`, {
        method: 'POST',
        body: {
          indexing_technique: 'high_quality',
          doc_form: 'text_model',
          name,
          text: content,
          process_rule: c.rule,
        },
      })
      created.push({ ...c, name, id: res?.document?.id, batch: res?.batch, kw: 0, segs: 0 })
      console.log(`   ✓ 已创建 ${c.label}`)
      await sleep(THROTTLE_MS)
    }

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

    console.log('')
    for (const d of created) {
      const segs = await listSegments(d.id)
      d.segs = segs.length
      d.kw = segs.filter((s) => (s.keywords ?? []).length > 0).length
      console.log(`   ${d.label}`)
      console.log(`      分段 ${segs.length} | 带 keywords ${d.kw}`)
      segs.slice(0, 2).forEach((s) => {
        console.log(`      [${(s.content || '').length}字] keywords=${JSON.stringify(s.keywords ?? null)}`)
      })
      await sleep(THROTTLE_MS)
    }

    console.log('\n═══ 结论 ═══')
    const auto = created.find((c) => c.key === 'auto')
    const cust = created.find((c) => c.key === 'custom')
    if (auto && cust) {
      if (auto.kw === 0 && cust.kw === 0) {
        console.log('   ℹ️ 三种模式都不生成 keywords')
        console.log('      → 该知识库（或当前 Dify 版本）不做关键词提取。')
        console.log('        这意味着 keyword_search 必然召回 0 条，')
        console.log('        应用侧的检索方式必须用「向量检索」或「混合检索」。')
      } else if (auto.kw > 0 && cust.kw === 0) {
        console.log('   🔴 automatic 能生成 keywords，custom 不能。')
        console.log('      → 自定义 process_rule 会抑制关键词提取。')
        console.log('        处理：改用 automatic 模式，并靠输入文本控制分段粒度。')
      } else {
        console.log('   ✅ 自定义 process_rule 不影响 keywords 生成')
      }
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

    // ── 追加：向量索引自检 ──
    // 用刚建的临时文档验证向量检索能否工作，以区分两种失败模式：
    //   A) embedding 模型不可用 → 新文档也建不了向量，必须换模型
    //   B) 旧文档缺向量、索引机制本身正常 → 重新索引即可修复
    console.log('\n═══ 向量索引自检（用刚建的临时文档）═══')
    const marker = '甲段第一行'
    const tests = [
      ['keyword_search', '关键词检索'],
      ['semantic_search', '向量检索'],
    ]
    let vecOk = null
    for (const [mode, label] of tests) {
      try {
        const records = await retrieveFromDataset(marker, { mode })
        const hit = records.some((r) => (r.segment?.content || '').includes(marker))
        console.log(`   ${records.length > 0 ? '✅' : '⚠️'} ${label}：召回 ${records.length} 条${hit ? '，包含临时文档内容' : ''}`)
        if (mode === 'semantic_search') vecOk = records.length > 0
      } catch (error) {
        console.log(`   ❌ ${label}：${error.message.slice(0, 110)}`)
        if (mode === 'semantic_search') vecOk = false
      }
      await sleep(THROTTLE_MS)
    }

    console.log('')
    if (vecOk === true) {
      console.log('   🟢 向量检索可用（新文档能建向量）')
      console.log('      → 意味着旧文档缺向量，重新全量同步即可修复：')
      console.log('        gh workflow run sync-dify.yml -f mode=full -f merge=true')
    } else if (vecOk === false) {
      console.log('   🔴 新文档也建不了向量 → embedding 模型本身不可用。')
      console.log('      注意：Dify 的 embedding 模型在知识库创建后基本不可更换。')
      console.log('      处理：新建一个知识库并选用可用的纯文本 embedding 模型')
      console.log('            （如 text-embedding-v3 / bge-m3），然后：')
      console.log('            ① 更新 Secret DIFY_DATASET_ID 为新知识库的 ID')
      console.log('            ② gh workflow run sync-dify.yml -f mode=full')
      console.log('            ③ 在 Dify 应用里把新知识库关联上去')
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

/**
 * 结构分析：检查知识库分段的内部质量。
 *
 * 分段长度均看似正常，但内容可能已损坏：Dify 对超过 max_tokens 的章节会
 * 硬切，而硬切不认识代码围栏，会把 ``` 从中切开——一段结尾是代码、下一段
 * 开头是剩下的代码，两段都无法独立回答。这类问题只能逐段核对。
 */
async function analyzeStructure(keyword) {
  console.log('🧱 知识库结构分析\n')
  const remote = await listAllDocuments()
  // 关键词为 all / * / 空 → 不筛选，分析全部文档
  const isAll = !keyword || keyword === 'all' || keyword === '*'
  const targets = [...remote.values()].filter(
    (d) => isAll || d.name.toLowerCase().includes(keyword.toLowerCase())
  )
  if (targets.length === 0) {
    console.log(`未找到名称包含「${keyword}」的文档。现有文档：`)
    ;[...remote.keys()].forEach((n) => console.log(`   - ${n}`))
    return
  }
  console.log(`待分析 ${targets.length} 篇文档${isAll ? '（全部）' : `（名称含「${keyword}」）`}\n`)

  let total = 0
  let brokenFence = 0
  let noHeading = 0
  let codeOnly = 0
  const worst = []
  const perDoc = []

  for (const doc of targets) {
    const segs = await listSegments(doc.id)
    let dBroken = 0
    let dNoHead = 0

    for (const s of segs) {
      const c = s.content || ''
      if (!c.trim()) continue
      total++

      // 围栏数为奇数 → 代码块被从中间截断
      const fences = (c.match(/^\s*```/gm) || []).length
      if (fences % 2 === 1) {
        brokenFence++
        dBroken++
        worst.push({ doc: doc.name, len: c.length, head: c.replace(/\s+/g, ' ').slice(0, 70) })
      }

      // 不以标题开头 → 脱离了小节上下文（可能只是被切断的后半段）
      const firstLine = c.split('\n').find((l) => l.trim()) || ''
      if (!/^#{1,6}\s/.test(firstLine.trim()) && !/^【/.test(firstLine.trim())) dNoHead++

      // 整段几乎都是代码（无标题、无中文说明）
      const cn = (c.match(/[\u4e00-\u9fa5]/g) || []).length
      if (cn < 10 && fences >= 2) codeOnly++
    }

    noHeading += dNoHead
    perDoc.push({ name: doc.name, segs: segs.length, broken: dBroken, noHead: dNoHead })
    await sleep(THROTTLE_MS)
  }

  // 逐文档表
  console.log('文档名'.padEnd(44) + '分段 断码 无标题')
  console.log('-'.repeat(70))
  perDoc
    .sort((a, b) => b.broken - a.broken || b.segs - a.segs)
    .forEach((d) => {
      const mark = d.broken > 0 ? ' ⚠️' : ''
      console.log(
        d.name.padEnd(42) +
          String(d.segs).padStart(4) +
          String(d.broken).padStart(5) +
          String(d.noHead).padStart(7) +
          mark
      )
    })

  const pct = (x) => ((x / total) * 100).toFixed(1)
  console.log('\n═══ 汇总 ═══')
  console.log(`   分段总数              ${total}`)
  console.log(`   代码围栏断裂          ${brokenFence}  (${pct(brokenFence)}%)  ← 半截代码，无法独立作答`)
  console.log(`   不以标题开头          ${noHeading}  (${pct(noHeading)}%)  ← 脱离小节上下文`)
  console.log(`   几乎纯代码无说明      ${codeOnly}  (${pct(codeOnly)}%)`)

  if (worst.length > 0) {
    console.log('\n═══ 断裂样例（前 6）═══')
    worst.slice(0, 6).forEach((w) => {
      console.log(`   [${w.len}字] ${w.doc}`)
      console.log(`      ${w.head}`)
    })
  }

  console.log('\n═══ 结论 ═══')
  if (brokenFence / total > 0.1) {
    console.log(`   ⚠️ ${pct(brokenFence)}% 的分段代码围栏不成对，说明章节内容超过了 max_tokens`)
    console.log('      上限而被 Dify 硬切，且硬切不认代码块。')
    console.log('      处理：把 DIFY_MAX_TOKENS 调到章节长度之上（如 2000），重同步；')
    console.log('            或在源笔记里把过长章节拆成更小的 H3/H4 小节。')
  } else if (brokenFence > 0) {
    console.log(`   ℹ️ 有 ${brokenFence} 个分段代码被截断，比例不高但建议关注`)
  } else {
    console.log('   ✅ 分段结构良好，无代码截断')
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
  if (LIST_DATASETS) {
    if (!HAS_CREDENTIALS) {
      console.error('❌ --datasets 需要 DIFY_API_KEY')
      process.exit(1)
    }
    await listDatasets()
    return { created: 0, updated: 0, failed: [], pruned: 0, bytes: 0 }
  }

  if (STRUCTURE !== null) {
    if (!HAS_CREDENTIALS) {
      console.error('❌ --structure 需要 DIFY_API_KEY / DIFY_DATASET_ID')
      process.exit(1)
    }
    await analyzeStructure(STRUCTURE)
    return { created: 0, updated: 0, failed: [], pruned: 0, bytes: 0 }
  }

  if (AUDIT) {
    if (!HAS_CREDENTIALS) {
      console.error('❌ --audit 需要 DIFY_API_KEY / DIFY_DATASET_ID')
      process.exit(1)
    }
    await auditSegments()
    return { created: 0, updated: 0, failed: [], pruned: 0, bytes: 0 }
  }

  if (SHOW_DATASET) {
    if (!HAS_CREDENTIALS) {
      console.error('❌ --dataset 需要 DIFY_API_KEY / DIFY_DATASET_ID')
      process.exit(1)
    }
    await showDatasetInfo()
    return { created: 0, updated: 0, failed: [], pruned: 0, bytes: 0 }
  }

  if (RETRIEVE !== null || INSPECT !== null || PROBE) {
    if (!HAS_CREDENTIALS) {
      console.error('❌ --retrieve / --inspect / --probe 需要 DIFY_API_KEY / DIFY_DATASET_ID')
      process.exit(1)
    }
    if (PROBE) {
      await probeSegmentation()
      await probeKeywordGeneration()
    }
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
  console.log(
    `   索引：${SERIAL_INDEX ? '逐篇提交并等待完成（规避 embedding 限流）' : '批量提交（--no-serial）'}`
  )
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
      let documentId = existing?.id ?? null
      if (documentId) {
        const res = await updateByText(documentId, doc.name, doc.text)
        result.updated++
        if (res?.batch) result.touched.push([res.batch, doc.name])
        console.log(`${label}  ✅ 已提交  ${sizeKb} KB${mergedNote}`)
      } else {
        const res = await createByText(doc.name, doc.text)
        documentId = res?.document?.id ?? null
        if (res?.batch) result.touched.push([res.batch, doc.name])
        remote.set(doc.name, { id: documentId, name: doc.name })
        result.created++
        console.log(`${label}  ✅ 已提交  ${sizeKb} KB${mergedNote}`)
      }
      result.bytes += Buffer.byteLength(doc.text)

      // 等这篇索引完成再提交下一篇，避开 embedding 供应商的速率限制
      if (SERIAL_INDEX && documentId) {        process.stdout.write('        索引中…')
        const { state, error } = await waitForDocument(documentId)
        if (state === 'completed') {
          process.stdout.write(' 完成\n')
        } else if (state === 'error') {
          process.stdout.write(' 失败\n')
          const limited = isRateLimited(error)
          console.log(
            `        ❗ ${limited ? 'embedding 供应商限流（429）' : '索引失败'}：${error || '(无详情)'}`
          )
          if (limited) {
            console.log('        → 建议加大 DIFY_INDEX_WAIT_MS 后重跑；脚本会逐篇等待以免再次限流')
          }
          result.failed.push({ name: doc.name, error: `索引失败：${error || '未知'}` })
        } else {
          process.stdout.write(' 超时\n')
          console.log(`        索引仍在后台进行，可稍后用 --audit 复查`)
        }
      }
    } catch (error) {
      // 两种需要「删掉重建」的情形：
      //  - 400 Document is not available：文档处于 error 状态时无法再 update
      //  - 409 already exists：远端有同名文档但列表没反映
      // 共同处理方式：删掉远端那份，改成新建
      const needsRecreate =
        /Document is not available/i.test(error.message) ||
        error.status === 409 ||
        /already exists/i.test(error.message)

      if (needsRecreate && HAS_CREDENTIALS) {
        try {
          const refreshed = await listAllDocuments({ silent: true })
          const hit = refreshed.get(doc.name)
          const staleId = hit?.id ?? existing?.id

          let targetId = null
          if (error.status === 409 || /already exists/i.test(error.message)) {
            // 同名已存在：优先更新，不删数据
            if (staleId) {
              await updateByText(staleId, doc.name, doc.text)
              targetId = staleId
              result.updated++
              console.log(`${label}  ✅ 已更新（命中已存在文档）`)
            }
          } else if (staleId) {
            // 文档已损坏（error 状态不能 update）→ 删除后重建
            console.log(`${label}  ⚠️ 文档处于异常状态，改为删除后重建…`)
            await deleteDocument(staleId)
            await sleep(THROTTLE_MS)
            const res = await createByText(doc.name, doc.text)
            targetId = res?.document?.id ?? null
            remote.set(doc.name, { id: targetId, name: doc.name })
            result.updated++
            console.log(`${label}  ✅ 已重建  ${sizeKb} KB${mergedNote}`)
          }

          if (targetId) {
            result.bytes += Buffer.byteLength(doc.text)
            if (SERIAL_INDEX) {
              process.stdout.write('        索引中…')
              const { state, error: idxErr } = await waitForDocument(targetId)
              if (state === 'completed') {
                process.stdout.write(' 完成\n')
              } else if (state === 'error') {
                process.stdout.write(' 失败\n')
                const limited = isRateLimited(idxErr)
                console.log(
                  `        ❗ ${limited ? 'embedding 供应商限流（429）' : '索引失败'}：${idxErr || '(无详情)'}`
                )
                result.failed.push({ name: doc.name, error: `索引失败：${idxErr || '未知'}` })
              } else {
                process.stdout.write(' 超时\n')
              }
            }
            await sleep(THROTTLE_MS)
            continue
          }
        } catch (recreateErr) {
          console.log(`${label}  ⚠️ 重建尝试失败：${recreateErr.message}`)
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
