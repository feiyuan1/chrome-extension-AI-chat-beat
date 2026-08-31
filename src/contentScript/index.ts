import { getPlatformChatAdapter } from '../adapters/platforms'
import { CHROME_MESSAGE_TYPE, StoreMessage, WINDOW_MESSAGE_TYPE } from '../types'
import { LocalStoragekeys } from '../types/localStorage'
import { getLocalStorage, setLocalStorage } from '../utils/localStorage'
import { AdapterErrorBoundary } from './adapter'
import {
  globalErrorBoundary,
  handleStoreChatMessage,
  injectScript,
  reportLocalStroageErrorLogs,
  reStoreMessages,
  syncBundleInfo,
} from './util'

const innerScript = () => {
  injectScript()
  syncBundleInfo()
  reStoreMessages()
  reportLocalStroageErrorLogs()

  // 监听来自 injected 的消息，转发给 background
  window.addEventListener('message', (event) => {
    if (event.source !== window) return

    if (event.data?.type === WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST) {
      const { platform } = event.data.payload
      const adapter = getPlatformChatAdapter(platform)

      AdapterErrorBoundary({
        data: event.data.payload,
        adapter,
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
