import { log } from '../utils/debugger'

log('injected')
function isAIChatRequest(url: string | URL) {
  const path = typeof url === 'string' ? url : url.pathname
  return (
    path.includes('/api/v0/chat/completion') ||
    // url.includes("/api/v0/chat_session/fetch_page") ||
    path.includes('/api/v0/chat/edit_message')
  )
}

// function isFetchPage(url: string) {
//   return url.includes('/api/v0/chat_session/fetch_page')
// }

// 拦截 XMLHttpRequest
const originalSend = XMLHttpRequest.prototype.send
XMLHttpRequest.prototype.send = function (body: XMLHttpRequestBodyInit | null | undefined) {
  // if (isFetchPage(this._url)) {
  //   console.log("AIChatBeat", "fetch page request", this._url);
  //   this.addEventListener("load", function () {
  //     window.postMessage(
  //       {
  //         type: "AI_CHAT_REQUEST",
  //         payload: {
  //           body,
  //           timestamp: Date.now(),
  //           response: JSON.parse(this.responseText),
  //         },
  //       },
  //       "*",
  //     );
  //   });
  // }

  if (this._url && isAIChatRequest(this._url) && body && typeof body === 'string') {
    log('target request', this._url)
    window.postMessage(
      {
        type: 'AI_CHAT_REQUEST',
        payload: {
          body: JSON.parse(body),
          timestamp: Date.now(),
          platform: 'deepseek',
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
