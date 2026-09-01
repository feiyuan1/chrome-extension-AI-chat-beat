import { CreateMonitorLog, MonitorLogType, storeFailedLogs } from '../adapters/utils'
import { CHROME_MESSAGE_TYPE, Platform, StoreMessage } from '../types'
import { LocalStoragekeys } from '../types/localStorage'
import { consoleError, log } from '../utils/debugger'
import { getLocalStorage, removeLocalStorageKey, setLocalStorage } from '../utils/localStorage'

export function injectScript() {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('./injected.js')
  script.type = 'module'
  script.onload = () => script.remove()
  ;(document.head || document.documentElement).appendChild(script)
}

export const handleStoreChatMessage = (message: StoreMessage, resolve?: () => void) => {
  try {
    chrome.runtime.sendMessage(message)
    resolve?.()
  } catch (err) {
    handleStoreFailed(err, message)
  }
}

export const handleStoreFailed = (err: unknown, message: StoreMessage) => {
  consoleError(err)
  const oldMessageList = getLocalStorage(LocalStoragekeys.unStoredMessageList) || []
  setLocalStorage(LocalStoragekeys.unStoredMessageList, oldMessageList.concat(message.payload))
}

/**
 * 检测 extension 是否已经更新
 */
export const syncBundleInfo = () => {
  setTimeout(() => {
    try {
      chrome.runtime
        .sendMessage({
          type: 'GET_BUNDLE_TIMESTAMP',
        })
        .then(() => {
          log('extension version updated or initialized')
        })
    } catch (err) {
      log('extension version outdated')
    }
  }, 2000)
}

export function isPlatformChatRequest(platform: Platform, path: string): boolean {
  switch (platform) {
    case Platform.deepseek:
      return path.includes('/api/v0/chat/completion') || path.includes('/api/v0/chat/edit_message')
    case Platform.yuanbao:
      return path.startsWith('/api/chat/')
    case Platform.qianwen:
      return path.includes('/api/v2/chat')
    case Platform.yiyan:
      return path.includes('/aichat/api/conversation')
    case Platform.chatglm:
      return path.includes('/backend-api/assistant/stream')
    case Platform.doubao:
      return path.includes('/chat/completion')
    case Platform.kimi:
      return path.includes('/apiv2/kimi.gateway.chat.v1.ChatService/Chat')
    default:
      return false
  }
}

export const globalErrorBoundary = (fn: () => void) => {
  try {
    fn()
  } catch (err) {
    const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.uncaught_error)
    storeFailedLogs([errorLog])
    consoleError('globalErrorBoundary', err)
  }
}

export const reStoreMessages = () => {
  const messages = getLocalStorage(LocalStoragekeys.unStoredMessageList)
  if (!messages?.length) {
    return
  }

  handleStoreChatMessage(
    {
      type: CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS,
      payload: messages,
      aggregate: false,
    },
    () => {
      removeLocalStorageKey(LocalStoragekeys.unStoredMessageList)
    },
  )
}

export const getPath = (url: string | URL) => {
  if (url instanceof URL) {
    return url.pathname
  }
  if (url.startsWith('/')) {
    return url
  }
  return new URL(url).pathname
}

export const reportLocalStroageErrorLogs = () => {
  const errorLogs = getLocalStorage(LocalStoragekeys.errorLogs) || []
  if (!errorLogs.length) {
    return
  }
  storeFailedLogs(errorLogs)
  removeLocalStorageKey(LocalStoragekeys.errorLogs)
}
