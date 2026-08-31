import { detectPlatform } from '../adapters/platforms/utils'
import { Platform, WINDOW_MESSAGE_TYPE } from '../types'
import { consoleError, log } from '../utils/debugger'
import { getPath, globalErrorBoundary, isPlatformChatRequest } from './util'

const innerScript = () => {
  log('injected')

  const platform = detectPlatform(location.href)
  if (platform === Platform.unknown) {
    throw new Error(`unsupported platform: ${location.hostname}`)
  }

  const postChatRequest = (url: string | URL, bodyText: string) => {
    const path = getPath(url)
    if (!isPlatformChatRequest(platform, path)) {
      return
    }

    log('target request', url)
    window.postMessage(
      {
        type: WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST,
        payload: {
          body: JSON.parse(bodyText),
          timestamp: Date.now(),
          platform,
        },
      },
      '*',
    )
  }

  // 拦截 XMLHttpRequest
  const originalSend = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.send = function (body: XMLHttpRequestBodyInit | null | undefined) {
    if (this._url && body && typeof body === 'string') {
      try {
        postChatRequest(this._url, body)
      } catch (err) {
        consoleError('inject postChatRequest error', err)
        // ignore non-JSON body
      }
    }
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
    const body = init?.body
    if (typeof body === 'string') {
      try {
        postChatRequest(url, body)
      } catch (err) {
        // ignore non-JSON body
        consoleError('inject postChatRequest error', err)
      }
    }
    return originalFetch.call(this, input, init)
  }
}

globalErrorBoundary(innerScript)
