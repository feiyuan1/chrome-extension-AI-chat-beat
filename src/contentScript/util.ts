import { Message } from '../types'
import { LocalStoragekeys } from '../types/LocalStorage'
import { consoleError, log } from '../utils/debugger'
import { getLocalStorage, setLocalStorage } from '../utils/localStorage'

export function injectScript() {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('./injected.js')
  script.type = 'module'
  script.onload = () => script.remove()
  ;(document.head || document.documentElement).appendChild(script)
}

export const handleStoreFailed = (err: unknown, message: Message) => {
  consoleError(err)
  const oldMessageList = getLocalStorage(LocalStoragekeys.unStoredMessageList) || []
  setLocalStorage(LocalStoragekeys.unStoredMessageList, oldMessageList.concat(message))
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

// function isFetchPage(url: string) {
//   return url.includes('/api/v0/chat_session/fetch_page')
// }

export const globalErrorBoundary = (fn: () => void) => {
  try {
    fn()
  } catch (err) {
    consoleError('globalErrorBoundary', err)
  }
}
