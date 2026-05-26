import { ReportChatsLogs } from '../adapters/logAdatper'
import { ReportChats } from '../adapters/MetricAdapter'
import { reportFailedLogs, reportFailedMetrics } from '../adapters/utils'
import { CHROME_MESSAGE_TYPE, StoreMessage, SessionMapMessage, TargetEnum } from '../types'
import { startWsClient } from './dev-client'
import { handleBatchStore } from './util'

// TODO dev only
startWsClient()

reportFailedLogs()
reportFailedMetrics()

chrome.runtime.onMessage.addListener((message: StoreMessage, _sender, sendResponse) => {
  if (message.type === CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS) {
    ReportChats({ chats: message.payload, aggregate: message.aggregate })
    ReportChatsLogs(message.payload)
    handleBatchStore(message.payload, sendResponse)
    return true
  }
})

chrome.runtime.onMessage.addListener((message: SessionMapMessage) => {
  if (message.type === CHROME_MESSAGE_TYPE.AI_CHAT_SESSION_MAP) {
    chrome.storage.local.set({
      [TargetEnum.sessionMap]: message.payload,
    })

    return
  }
})
