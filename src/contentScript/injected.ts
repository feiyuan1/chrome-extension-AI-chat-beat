import { Platform, WINDOW_MESSAGE_TYPE } from '../types'
import { log } from '../utils/debugger'
import { globalErrorBoundary, isAIChatRequest, isFetchPage } from './util'

const innerScript = () => {
  log('injected')

  // 拦截 XMLHttpRequest
  const originalSend = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.send = function (body: XMLHttpRequestBodyInit | null | undefined) {
    if (!this._url) {
      return originalSend.call(this, body)
    }

    if (isFetchPage(this._url)) {
      log('fetch page request', this._url)
      this.addEventListener('load', function () {
        const response = JSON.parse(this.responseText)
        if (response.code === 0) {
          window.postMessage(
            {
              type: 'AI_CHAT_SESSION_MAP',
              payload: {
                response,
              },
            },
            '*',
          )
        }
      })
    }

    if (isAIChatRequest(this._url) && body && typeof body === 'string') {
      log('target request', this._url)
      window.postMessage(
        {
          type: WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST,
          payload: {
            body: JSON.parse(body),
            timestamp: Date.now(),
            platform: Platform.deepseek,
          },
        },
        '*',
      )
    }

    return originalSend.call(this, body)
  }

  const originalOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function (method, url) {
    this._url = url
    return (originalOpen as any).call(this, method, url)
  }
}

globalErrorBoundary(innerScript)
