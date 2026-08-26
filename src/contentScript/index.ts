import * as DeepseekAdapter from '../adapters/deepseekAdapter'
import { CHROME_MESSAGE_TYPE, SessionMapMessage, StoreMessage, WINDOW_MESSAGE_TYPE } from '../types'
import { LocalStoragekeys } from '../types/localStorage'
import { getLocalStorage, setLocalStorage } from '../utils/localStorage'
import { AdapterErrorBoundary } from './adapter'
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
      AdapterErrorBoundary({
        adapter: DeepseekAdapter.SessionMapAdapter,
        data: event.data.payload.response,
        resolve: (result) => {
          const message: SessionMapMessage = {
            type: CHROME_MESSAGE_TYPE.AI_CHAT_SESSION_MAP,
            payload: result,
          }
          chrome.runtime.sendMessage(message)
        },
      })
      return
    }

    if (event.data?.type === WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST) {
      AdapterErrorBoundary({
        data: event.data.payload,
        adapter: DeepseekAdapter.ChatDataAdapter,
        resolve: (result) => {
          const message: StoreMessage = {
            type: CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS,
            payload: [result],
          }
          handleStoreChatMessage(message)
        },
        reject() {
          const oldFailedAdaptData = getLocalStorage(LocalStoragekeys.failedAdaptChat) || []
          setLocalStorage(
            LocalStoragekeys.failedAdaptChat,
            oldFailedAdaptData.concat(event.data.payload),
          )
        },
      })
    }
  })
}

globalErrorBoundary(innerScript)
