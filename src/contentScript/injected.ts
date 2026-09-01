import { detectPlatform } from '../adapters/platforms/utils'
import { CreateMonitorLog, MonitorLogType } from '../adapters/utils'
import { Platform, WINDOW_MESSAGE_TYPE } from '../types'
import { LocalStoragekeys } from '../types/localStorage'
import { consoleError, log } from '../utils/debugger'
import { getLocalStorage, setLocalStorage } from '../utils/localStorage'
import { getPath, isPlatformChatRequest } from './util'

const createErrorLog = (err: unknown) => {
  const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.uncaught_error)
  const oldErrorLogs = getLocalStorage(LocalStoragekeys.errorLogs) || []
  setLocalStorage(LocalStoragekeys.errorLogs, oldErrorLogs.concat(errorLog))
}

const innerScript = () => {
  log('injected')

  const platform = detectPlatform(location.href)
  if (platform === Platform.unknown) {
    throw new Error(`unsupported platform: ${location.hostname}`)
  }

  const isInterceptableBody = (body: unknown): body is string | Uint8Array => {
    return typeof body === 'string' || body instanceof Uint8Array
  }

  // TODO move to specific adapter
  const parseRequestBody = (bodyPlatform: Platform, body: string | Uint8Array): any => {
    if (typeof body === 'string') {
      return JSON.parse(body)
    }
    if (body instanceof Uint8Array) {
      if (bodyPlatform === Platform.kimi) {
        // Uint8Array: skip the leading 4 non-body bytes and decode the rest as JSON
        const content = body.slice(5)
        const text = new TextDecoder().decode(content)
        return JSON.parse(text)
      }
      const text = new TextDecoder().decode(body)
      return JSON.parse(text)
    }
  }

  const postChatRequest = (url: string | URL, body: string | Uint8Array) => {
    try {
      const path = getPath(url)
      if (!isPlatformChatRequest(platform, path)) {
        return
      }

      log('target request', url)
      window.postMessage(
        {
          type: WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST,
          payload: {
            // TODO 使用原始 body
            body: parseRequestBody(platform, body),
            timestamp: Date.now(),
            platform,
          },
        },
        '*',
      )
    } catch (err) {
      const message = `inject postChatRequest error${err}`
      createErrorLog(message)
      consoleError(message)
    }
  }

  // TODO url 一定存在
  const tryPostChatRequest = (url: string | URL | undefined, body: unknown) => {
    //  TODO 只判断 body 不存在的情况
    if (url && isInterceptableBody(body)) {
      postChatRequest(url, body)
    }
  }

  // 拦截 XMLHttpRequest
  const originalSend = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.send = function (body: XMLHttpRequestBodyInit | null | undefined) {
    tryPostChatRequest(this._url, body)
    return originalSend.call(this, body)
  }

  const originalOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function (method, url) {
    this._url = url
    return (originalOpen as any).call(this, method, url)
  }

  // 拦截 fetch
  const originalFetch = window.fetch
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    const url =
      typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString()
    tryPostChatRequest(url, init?.body)
    return originalFetch.call(this, input, init)
  }
}

try {
  innerScript()
} catch (err) {
  createErrorLog(err)
  consoleError('injectErrorBoundary', err)
}
