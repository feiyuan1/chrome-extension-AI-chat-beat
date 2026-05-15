import { Message } from '../types'
import { LocalStoragekeys } from '../types/LocalStorage'
import { consoleError, log } from '../utils/debugger'
import { getLocalStorage, setLocalStorage } from '../utils/localStorage'

export function injectScript() {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('./injected.js')
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
