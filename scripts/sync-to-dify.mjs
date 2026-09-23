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
import { normalizeForIndexing, buildShardDocuments } from './lib/dify-shard.mjs'

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
const THROTTLE_MS = Number(process.env.DIFY_THROTTLE_MS || 6500)
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
    body: { indexing_technique: 'high_quality', doc_form: 'text_model', name, text },
  })

const updateByText = (documentId, name, text) =>
  request(`/datasets/${DIFY_DATASET_ID}/documents/${documentId}/update-by-text`, {
    method: 'POST',
    body: { doc_form: 'text_model', name, text },
  })

const deleteDocument = (documentId) =>
  request(`/datasets/${DIFY_DATASET_ID}/documents/${documentId}`, { method: 'DELETE' })

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
      text: normalizeForIndexing(raw),
    })
  }

  if (skippedEmpty.length > 0) {
    console.log(`⏭️  跳过 ${skippedEmpty.length} 个空文件：${skippedEmpty.join(', ')}`)
  }
  return out
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
  const sources = await collectSourceFiles()
  // 分片规则与构建时映射表共用 scripts/lib/dify-shard.mjs，避免两处逻辑漂移
  const documents = MERGE
    ? buildShardDocuments(sources)
    : sources.map((s) => ({ name: s.rel, text: s.text, entry: `docs/${s.rel}`, count: 1 }))

  console.log('\n🚀 同步 docs/ 到 Dify 知识库')
  console.log(`   接口：${DIFY_BASE_URL}`)
  console.log(`   知识库：${DIFY_DATASET_ID || '(未配置)'}`)
  console.log(`   模式：${MERGE ? '分片（同目录合并）' : '逐文件'}${DRY_RUN ? ' + DRY-RUN 不写入' : ''}${PRUNE ? ' + 清理远端多余文档' : ''}`)
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
    const verified = await verifyIndexing(result.touched.map(([id]) => id))
    const byId = new Map(result.touched)
    const bad = [...verified].filter(([, state]) => state !== 'completed')
    if (bad.length > 0) {
      console.log(`   ⚠️  ${bad.length} 篇索引异常：`)
      bad.forEach(([id, state]) => console.log(`      - ${byId.get(id)}: ${state}`))
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
