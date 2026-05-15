;(() => {
  console.log('AIChatBeat', 'injected')
  function isAIChatRequest(url) {
    return (
      url.includes('/api/v0/chat/completion') ||
      // url.includes("/api/v0/chat_session/fetch_page") ||
      url.includes('/api/v0/chat/edit_message')
    )
  }

  function isFetchPage(url) {
    return url.includes('/api/v0/chat_session/fetch_page')
  }

  // 拦截 XMLHttpRequest
  const originalSend = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.send = function (body) {
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

    if (this._url && isAIChatRequest(this._url) && body) {
      console.log('AIChatBeat', 'target request', this._url)
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
    return originalOpen.apply(this, arguments)
  }
})()
