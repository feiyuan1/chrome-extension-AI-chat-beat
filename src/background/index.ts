import { CHROME_MESSAGE_TYPE, Message, Payload, TargetEnum } from '../types'
import { startWsClient } from './dev-client'
import { handleBatchStore } from './util'

startWsClient()

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (message.type === CHROME_MESSAGE_TYPE.AI_CHAT_SESSION_MAP) {
    chrome.storage.local.set({
      [TargetEnum.sessionMap]: message.payload,
    })

    return
  }

  if (message.type === CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS) {
    const chatMessages = message.payload as unknown as Payload[]
    handleBatchStore(chatMessages, sendResponse)
    return true
  }

  if (message.type === CHROME_MESSAGE_TYPE.NEW_CHAT_REQUEST) {
    handleBatchStore([message.payload], sendResponse)
    return true
  }
})
