import { Message } from '../types'
import { handleStoreFailed, injectScript, syncBundleInfo } from './util'

injectScript()
syncBundleInfo()

// 监听来自 injected 的消息，转发给 background
window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (event.data?.type === 'AI_CHAT_REQUEST') {
    const {
      body: { prompt, chat_session_id },
      platform,
      timestamp,
    } = event.data.payload
    const message: Message = {
      type: 'NEW_CHAT_REQUEST',
      payload: {
        prompt,
        platform,
        timestamp,
        session_id: chat_session_id,
      },
    }
    try {
      chrome.runtime.sendMessage(message).then((response) => {
        if (response.code != 500) {
          return
        }
        handleStoreFailed(response.message, message)
      })
    } catch (err) {
      handleStoreFailed(err, message)
    }
  }
})
