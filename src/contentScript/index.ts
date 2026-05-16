import { CHROME_MESSAGE_TYPE, Message, WINDOW_MESSAGE_TYPE } from '../types'
import { createIndex } from '../utils'
import {
  globalErrorBoundary,
  handleStoreChatMessage,
  injectScript,
  reStoreMessages,
  syncBundleInfo,
} from './util'

const innerScript = () => {
  injectScript()
  syncBundleInfo()
  reStoreMessages()

  // 监听来自 injected 的消息，转发给 background
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (event.data?.type === WINDOW_MESSAGE_TYPE.AI_CHAT_SESSION_MAP) {
      const message: Message = {
        type: CHROME_MESSAGE_TYPE.AI_CHAT_SESSION_MAP,
        payload: event.data.payload.response,
      }
      chrome.runtime.sendMessage(message)
      return
    }

    if (event.data?.type === WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST) {
      const {
        body: { prompt, chat_session_id },
        platform,
        timestamp,
      } = event.data.payload
      const message: Message = {
        type: CHROME_MESSAGE_TYPE.NEW_CHAT_REQUEST,
        payload: {
          prompt,
          platform,
          timestamp,
          session_id: chat_session_id,
          index: createIndex(),
        },
      }
      handleStoreChatMessage(message)
    }
  })
}

globalErrorBoundary(innerScript)
