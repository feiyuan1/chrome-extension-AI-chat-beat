import { ReportChatsLogs } from '../adapters/logAdatper'
import { ReportChats } from '../adapters/MetricAdapter'
import {
  CreateMonitorLog,
  MonitorLogType,
  reportFailedLogs,
  reportFailedMetrics,
  storeFailedLogs,
} from '../adapters/utils'
import { RESOTRE_CHAT_CHROME_LOCAL } from '../constants/dev_env'
import { classifyPromptWithFallback } from '../labels/semanticClassifier'
import {
  CHROME_MESSAGE_TYPE,
  LabelDimension,
  SessionMapMessage,
  StoreMessage,
  TargetEnum,
} from '../types'
import { loadLabelModelConfig } from '../utils/config-storage'
import { log } from '../utils/debugger'
import { startWsClient } from './dev-client'
import { handleBatchStore } from './util'

const timeStamp = performance.now()
if (import.meta.env.MODE === 'development') {
  startWsClient()
}
reportFailedLogs()
reportFailedMetrics()

chrome.runtime.onMessage.addListener((message: StoreMessage) => {
  if (message.type !== CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS) {
    return
  }

  ReportChats({ chats: message.payload, aggregate: message.aggregate })

  loadLabelModelConfig().then((config) => {
    if (!config) {
      chrome.notifications.create('model-config-missing', {
        type: 'basic',
        iconUrl: 'public/icons/icon.png',
        title: 'AI Chat Beat',
        message: '模型配置缺失，请打开 popup 进行配置,本轮 prompt 未打入标签',
      })
      ReportChatsLogs(message.payload)
      return
    }

    Promise.all(
      message.payload.map(async (chat) => {
        try {
          const { labels, usage } = await classifyPromptWithFallback(chat.prompt, config)

          return {
            ...chat,
            labels: (Object.keys(labels.labels) as LabelDimension[]).reduce((result, dimension) => {
              return { ...result, [dimension]: labels.labels[dimension].value }
            }, {}),
            usage,
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          const errorLog = CreateMonitorLog(
            `classifyPromptWithFallback error: ${errorMessage}`,
            MonitorLogType.ai_analyze_error,
          )
          storeFailedLogs([errorLog])
          log('classifyPromptWithFallback error', errorMessage)
          return chat
        }
      }),
    ).then((chats) => ReportChatsLogs(chats))

    if (RESOTRE_CHAT_CHROME_LOCAL) {
      handleBatchStore(message.payload)
    }
  })
})

chrome.runtime.onMessage.addListener((message: SessionMapMessage) => {
  if (message.type === CHROME_MESSAGE_TYPE.AI_CHAT_SESSION_MAP) {
    chrome.storage.local.set({
      [TargetEnum.sessionMap]: message.payload,
    })

    return
  }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_BUNDLE_TIMESTAMP') {
    log('sw timestamp: ', timeStamp)
    sendResponse(timeStamp)
  }
})
