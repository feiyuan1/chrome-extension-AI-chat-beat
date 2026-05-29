import { CHROME_MESSAGE_TYPE, StoreMessage } from '../types'
import { consoleError, log } from '../utils/debugger'
import { getLocalStorage, removeLocalStorageKey, setLocalStorage } from '../utils/localStorage'
import { LocalStoragekeys } from '../types/localStorage'

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

// TODO DEV only
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

export function isAIChatRequest(url: string | URL) {
  const path = typeof url === 'string' ? url : url.pathname
  return (
    path.includes('/api/v0/chat/completion') ||
    // url.includes("/api/v0/chat_session/fetch_page") ||
    path.includes('/api/v0/chat/edit_message')
  )
}

export function isFetchPage(url: string | URL) {
  const path = typeof url === 'string' ? url : url.pathname
  return path.includes('/api/v0/chat_session/fetch_page')
}

export const globalErrorBoundary = (fn: () => void) => {
  try {
    fn()
  } catch (err) {
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
