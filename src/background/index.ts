import { CHROME_MESSAGE_TYPE, Message, StoreChromeLocalResponse, TargetEnum } from '../types'
import { createIndex } from '../utils'
import { log } from '../utils/debugger'
import { startWsClient } from './dev-client'

startWsClient()

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === CHROME_MESSAGE_TYPE.AI_CHAT_SESSION_MAP) {
    chrome.storage.local.set({
      [TargetEnum.sessionMap]: message.payload,
    })

    return
  }

  if (message.type === CHROME_MESSAGE_TYPE.NEW_CHAT_REQUEST) {
    const { session_id, prompt, timestamp, platform } = message.payload

    const index = createIndex()
    const coreDataItem = {
      session_id,
      timestamp,
      platform,
      index,
    }
    const dataItem = {
      ...coreDataItem,
      prompt: prompt || '',
    }
    const storeResponse: StoreChromeLocalResponse = {
      code: 200,
    }

    chrome.storage.local
      .get([TargetEnum.coreChatHistory, TargetEnum.fullChatHistory])
      .then((result) => {
        const coreData = result[TargetEnum.coreChatHistory]?.data || []
        const fullData = result[TargetEnum.fullChatHistory]?.data || []
        return chrome.storage.local.set({
          [TargetEnum.coreChatHistory]: { data: coreData.concat(coreDataItem) },
          [TargetEnum.fullChatHistory]: { data: fullData.concat(dataItem) },
        })
      })
      .catch((error) => {
        storeResponse.code = 500
        storeResponse.message = error
      })
      .finally(() => {
        log('send response')
        sendResponse(storeResponse)
      })

    return true
  }
})
