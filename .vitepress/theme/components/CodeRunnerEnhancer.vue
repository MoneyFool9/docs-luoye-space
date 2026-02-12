<template>
  <div style="display: none;" aria-hidden="true"></div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const EXEC_TIMEOUT_MS = 3000
const MAX_LOG_LINES = 120
const MAX_LINE_LENGTH = 500
const MAX_TOTAL_CHARS = 4000

const SUPPORTED_LANGUAGES = new Set(['js', 'javascript', 'ts', 'typescript'])
const resultCache = new Map()
const route = useRoute()
let taskId = 0
let tsCompilerPromise = null

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function hashCode(text) {
  let hash = 5381
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

function resolveLanguage(blockEl) {
  const className = blockEl.className || ''
  const match = className.match(/language-([a-zA-Z0-9_-]+)/)
  return match ? match[1].toLowerCase() : ''
}

function normalizeResult(payload) {
  const logs = Array.isArray(payload.logs) ? payload.logs : []
  const trimmedLogs = logs.slice(0, MAX_LOG_LINES).map((item) => {
    const text = String(item.text ?? '')
    return {
      level: item.level || 'log',
      text: text.length > MAX_LINE_LENGTH ? `${text.slice(0, MAX_LINE_LENGTH)}...<truncated>` : text
    }
  })

  const rawResult = String(payload.result ?? 'undefined')
  const resultText = rawResult.length > MAX_LINE_LENGTH
    ? `${rawResult.slice(0, MAX_LINE_LENGTH)}...<truncated>`
    : rawResult

  let totalChars = trimmedLogs.reduce((sum, item) => sum + item.text.length, 0) + resultText.length
  if (totalChars <= MAX_TOTAL_CHARS) {
    return {
      logs: trimmedLogs,
      resultText
    }
  }

  const overflow = totalChars - MAX_TOTAL_CHARS
  if (resultText.length > overflow) {
    const safeResult = `${resultText.slice(0, resultText.length - overflow)}...<truncated>`
    return {
      logs: trimmedLogs,
      resultText: safeResult
    }
  }

  const reducedLogs = [...trimmedLogs]
  while (reducedLogs.length > 0 && totalChars > MAX_TOTAL_CHARS) {
    const line = reducedLogs.pop()
    totalChars -= line?.text?.length || 0
  }
  return {
    logs: reducedLogs,
    resultText: '<result truncated>'
  }
}

function renderOutput(panelEl, data, options = {}) {
  const normalized = normalizeResult(data)
  const labels = []
  if (options.cached) {
    labels.push('<span class="code-runner-badge">缓存</span>')
  }
  if (typeof options.duration === 'number') {
    labels.push(`<span class="code-runner-badge">${options.duration}ms</span>`)
  }

  const logsHtml = normalized.logs.length > 0
    ? normalized.logs.map((line) => {
      const level = String(line.level || 'log')
      return `<div class="code-runner-line code-runner-line-${level}">[${escapeHtml(level)}] ${escapeHtml(line.text)}</div>`
    }).join('')
    : '<div class="code-runner-line">[log] 无输出</div>'

  panelEl.innerHTML = `
    <div class="code-runner-meta">${labels.join('')}</div>
    <div class="code-runner-section-title">Console</div>
    <div class="code-runner-console">${logsHtml}</div>
    <div class="code-runner-section-title">Result</div>
    <div class="code-runner-result">${escapeHtml(normalized.resultText)}</div>
  `
  panelEl.classList.remove('is-error')
}

function renderError(panelEl, message) {
  panelEl.innerHTML = `
    <div class="code-runner-meta">
      <span class="code-runner-badge code-runner-badge-error">错误</span>
    </div>
    <div class="code-runner-error">${escapeHtml(String(message))}</div>
  `
  panelEl.classList.add('is-error')
}

function setRunning(buttonEl, panelEl, running) {
  buttonEl.disabled = running
  if (running) {
    buttonEl.textContent = '运行中...'
    panelEl.innerHTML = '<div class="code-runner-loading">执行中，请稍候...</div>'
    panelEl.classList.remove('is-error')
  } else {
    buttonEl.textContent = '运行'
  }
}

async function transpileTypeScript(code) {
  if (!tsCompilerPromise) {
    tsCompilerPromise = import('typescript')
  }
  const ts = await tsCompilerPromise
  const output = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      strict: false
    },
    reportDiagnostics: false
  })
  return output.outputText
}

function buildWorkerErrorMessage(event) {
  const parts = []
  if (event?.message) {
    parts.push(event.message)
  }
  if (event?.filename) {
    parts.push(`${event.filename}:${event.lineno || 0}:${event.colno || 0}`)
  }
  const stack = event?.error?.stack || event?.error?.message
  if (stack) {
    parts.push(String(stack))
  }
  return parts.join(' | ') || 'Worker 运行失败（可能是 Worker 初始化或脚本加载失败）'
}

function executeInWorker({ code, lang, timeoutMs }) {
  return new Promise((resolve, reject) => {
    let worker = null
    try {
      worker = new Worker(new URL('./codeRunner.worker.js', import.meta.url), { type: 'module' })
    } catch (error) {
      reject(new Error(error instanceof Error ? error.message : 'Worker 初始化失败'))
      return
    }

    const id = `code-run-${taskId += 1}`
    const timer = setTimeout(() => {
      worker.terminate()
      reject(new Error(`执行超时（>${timeoutMs}ms）`))
    }, timeoutMs)

    worker.onmessage = (event) => {
      const data = event.data || {}
      if (data.id !== id) {
        return
      }
      clearTimeout(timer)
      worker.terminate()
      if (data.ok) {
        resolve(data)
      } else {
        reject(new Error(data.error || '执行失败'))
      }
    }

    worker.onerror = (event) => {
      clearTimeout(timer)
      worker.terminate()
      event.preventDefault?.()
      reject(new Error(buildWorkerErrorMessage(event)))
    }

    worker.onmessageerror = () => {
      clearTimeout(timer)
      worker.terminate()
      reject(new Error('Worker 消息反序列化失败'))
    }

    worker.postMessage({
      id,
      code,
      lang,
      timeoutMs
    })
  })
}

function bindCodeBlock(blockEl) {
  if (blockEl.dataset.codeRunnerBound === 'true') {
    return
  }

  const lang = resolveLanguage(blockEl)
  if (!SUPPORTED_LANGUAGES.has(lang)) {
    return
  }

  const codeEl = blockEl.querySelector('pre > code')
  if (!codeEl) {
    return
  }

  const controlsEl = document.createElement('div')
  controlsEl.className = 'code-runner-controls'

  const runButton = document.createElement('button')
  runButton.type = 'button'
  runButton.className = 'code-runner-btn'
  runButton.textContent = '运行'
  controlsEl.appendChild(runButton)

  const panelEl = document.createElement('div')
  panelEl.className = 'code-runner-panel'
  panelEl.innerHTML = '<div class="code-runner-hint">点击“运行”执行该代码块</div>'

  blockEl.appendChild(controlsEl)
  blockEl.appendChild(panelEl)
  blockEl.dataset.codeRunnerBound = 'true'

  runButton.addEventListener('click', async () => {
    const code = codeEl.textContent || ''
    const cacheKey = `${lang}:${hashCode(code)}`
    if (resultCache.has(cacheKey)) {
      const cached = resultCache.get(cacheKey)
      renderOutput(panelEl, cached, { cached: true, duration: cached.duration })
      return
    }

    setRunning(runButton, panelEl, true)
    try {
      const runnableCode = lang === 'ts' || lang === 'typescript'
        ? await transpileTypeScript(code)
        : code
      const output = await executeInWorker({ code: runnableCode, lang: 'javascript', timeoutMs: EXEC_TIMEOUT_MS })
      resultCache.set(cacheKey, output)
      renderOutput(panelEl, output, { duration: output.duration })
    } catch (error) {
      renderError(panelEl, error instanceof Error ? error.message : String(error))
    } finally {
      setRunning(runButton, panelEl, false)
    }
  })
}

function enhanceAllCodeBlocks() {
  const blocks = document.querySelectorAll('.vp-doc div[class*="language-"]')
  blocks.forEach((blockEl) => bindCodeBlock(blockEl))
}

let stopWatcher = null

onMounted(() => {
  nextTick(() => {
    enhanceAllCodeBlocks()
  })

  stopWatcher = watch(
    () => route.path,
    async () => {
      await nextTick()
      setTimeout(() => {
        enhanceAllCodeBlocks()
      }, 0)
    }
  )
})

onBeforeUnmount(() => {
  if (typeof stopWatcher === 'function') {
    stopWatcher()
  }
})
</script>
