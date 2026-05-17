import { CHROME_MESSAGE_TYPE, StoreMessage, SessionMapMessage, WINDOW_MESSAGE_TYPE } from '../types'
import {
  globalErrorBoundary,
  handleStoreChatMessage,
  injectScript,
  reStoreMessages,
  syncBundleInfo,
} from './util'
import * as DeepseekAdapter from '../adapters/deepseekAdapter'
import { AdapterResultStatus } from '../types/adapter'
import { consoleError } from '../utils/debugger'

const innerScript = () => {
  injectScript()
  syncBundleInfo()
  reStoreMessages()

  // 监听来自 injected 的消息，转发给 background
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (event.data?.type === WINDOW_MESSAGE_TYPE.AI_CHAT_SESSION_MAP) {
      const result = DeepseekAdapter.SessionMapAdapter(event.data.payload.response)
      if (result.status === AdapterResultStatus.error) {
        consoleError(result.message)
        return
      }
      const message: SessionMapMessage = {
        type: CHROME_MESSAGE_TYPE.AI_CHAT_SESSION_MAP,
        payload: result.data,
      }
      chrome.runtime.sendMessage(message)
      return
    }

    if (event.data?.type === WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST) {
      const result = DeepseekAdapter.ChatDataAdapter(event.data.payload)
      if (result.status === AdapterResultStatus.error) {
        consoleError(result.message)
        return
      }
      const message: StoreMessage = {
        type: CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS,
        payload: [result.data],
      }
      handleStoreChatMessage(message)
    }
  })
}

globalErrorBoundary(innerScript)
