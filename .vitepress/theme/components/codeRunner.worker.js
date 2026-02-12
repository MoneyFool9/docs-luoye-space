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

async function runCode({ code, lang }) {
  const logs = []
  const startedAt = performance.now()
  const sourceCode = code

  const limitedConsole = createConsoleCollector(logs)
  const AsyncFunction = getAsyncFunction()
  const runner = new AsyncFunction(
    'limitedConsole',
    `"use strict";
const console = limitedConsole;
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

  const value = await Promise.resolve(runner(limitedConsole))
  return {
    logs,
    result: toSerializable(value),
    duration: Math.round(performance.now() - startedAt)
  }
}

self.onmessage = async (event) => {
  const { id, code, lang } = event.data
  try {
    const payload = await runCode({ code, lang })
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
