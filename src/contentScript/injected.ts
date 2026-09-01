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

  const postChatRequest = (url: string | URL, body: unknown) => {
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
            body,
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

  const tryPostChatRequest = (url: string | URL | undefined, body: unknown) => {
    if (url && body) {
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
