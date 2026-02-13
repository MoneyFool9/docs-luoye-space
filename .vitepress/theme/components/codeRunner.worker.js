function getAsyncFunction() {
  return Object.getPrototypeOf(async function () {}).constructor
}

function toSerializable(value) {
  try {
    if (typeof value === 'string') {
      return value
    }
    return JSON.stringify(value)
  } catch (_error) {
    return String(value)
  }
}

function createConsoleCollector(logs) {
  const methods = ['log', 'info', 'warn', 'error']
  const collected = {}

  for (const method of methods) {
    collected[method] = (...args) => {
      logs.push({
        level: method,
        text: args.map((arg) => toSerializable(arg)).join(' ')
      })
    }
  }

  return collected
}

function createTimerTracker() {
  const pendingTimeouts = new Set()
  const pendingIntervals = new Set()

  const trackedSetTimeout = (callback, delay = 0, ...args) => {
    const id = self.setTimeout(() => {
      try {
        callback(...args)
      } finally {
        pendingTimeouts.delete(id)
      }
    }, delay)
    pendingTimeouts.add(id)
    return id
  }

  const trackedClearTimeout = (id) => {
    pendingTimeouts.delete(id)
    self.clearTimeout(id)
  }

  const trackedSetInterval = (callback, delay = 0, ...args) => {
    const id = self.setInterval(() => {
      callback(...args)
    }, delay)
    pendingIntervals.add(id)
    return id
  }

  const trackedClearInterval = (id) => {
    pendingIntervals.delete(id)
    self.clearInterval(id)
  }

  return {
    trackedSetTimeout,
    trackedClearTimeout,
    trackedSetInterval,
    trackedClearInterval,
    getPendingTimeoutCount: () => pendingTimeouts.size,
    clearIntervals: () => {
      for (const id of pendingIntervals) {
        self.clearInterval(id)
      }
      pendingIntervals.clear()
    }
  }
}

async function waitForTimersToDrain(getPendingTimeoutCount, maxWaitMs) {
  const startedAt = performance.now()
  let idleStartedAt = null

  while (performance.now() - startedAt < maxWaitMs) {
    await new Promise((resolve) => self.setTimeout(resolve, 20))
    if (getPendingTimeoutCount() === 0) {
      if (idleStartedAt === null) {
        idleStartedAt = performance.now()
      }
      if (performance.now() - idleStartedAt >= 40) {
        return
      }
    } else {
      idleStartedAt = null
    }
  }
}

async function runCode({ code, timeoutMs }) {
  const logs = []
  const startedAt = performance.now()
  const sourceCode = code

  const limitedConsole = createConsoleCollector(logs)
  const timerTracker = createTimerTracker()
  const AsyncFunction = getAsyncFunction()
  const runner = new AsyncFunction(
    'limitedConsole',
    'limitedSetTimeout',
    'limitedClearTimeout',
    'limitedSetInterval',
    'limitedClearInterval',
    `"use strict";
const console = limitedConsole;
const setTimeout = limitedSetTimeout;
const clearTimeout = limitedClearTimeout;
const setInterval = limitedSetInterval;
const clearInterval = limitedClearInterval;
const window = undefined;
const document = undefined;
const localStorage = undefined;
const sessionStorage = undefined;
const navigator = undefined;
const globalThis = undefined;
const self = undefined;
const XMLHttpRequest = undefined;
const WebSocket = undefined;
const EventSource = undefined;
const importScripts = undefined;
const Worker = undefined;
const SharedWorker = undefined;
const Function = undefined;
${sourceCode}`
  )

  const value = await Promise.resolve(
    runner(
      limitedConsole,
      timerTracker.trackedSetTimeout,
      timerTracker.trackedClearTimeout,
      timerTracker.trackedSetInterval,
      timerTracker.trackedClearInterval
    )
  )

  const remainWaitMs = Math.max(0, (typeof timeoutMs === 'number' ? timeoutMs : 3000) - 80)
  await waitForTimersToDrain(timerTracker.getPendingTimeoutCount, remainWaitMs)
  timerTracker.clearIntervals()

  return {
    logs,
    result: toSerializable(value),
    duration: Math.round(performance.now() - startedAt)
  }
}

self.onmessage = async (event) => {
  const { id, code, timeoutMs } = event.data
  try {
    const payload = await runCode({ code, timeoutMs })
    self.postMessage({ id, ok: true, ...payload })
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      logs: [],
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      duration: 0
    })
  }
}
