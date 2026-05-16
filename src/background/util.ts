import { Payload, StoreChromeLocalResponse, TargetEnum } from '../types'
import { log } from '../utils/debugger'

export const handleBatchStore = (data: Payload[], callback: (response: any) => void) => {
  const { coreChatHistory, fullChatHistory } = data.reduce<{
    coreChatHistory: any[]
    fullChatHistory: any[]
  }>(
    (result, curMessage) => {
      const { prompt = '', ...coreDataItem } = curMessage
      const dataItem = {
        ...coreDataItem,
        prompt,
      }
      return {
        coreChatHistory: result.coreChatHistory.concat(coreDataItem),
        fullChatHistory: result.fullChatHistory.concat(dataItem),
      }
    },
    {
      coreChatHistory: [],
      fullChatHistory: [],
    },
  )

  const storeResponse: StoreChromeLocalResponse = {
    code: 200,
    data: {},
  }

  chrome.storage.local
    .get([TargetEnum.coreChatHistory, TargetEnum.fullChatHistory])
    .then((result) => {
      const coreData = result[TargetEnum.coreChatHistory] || []
      const fullData = result[TargetEnum.fullChatHistory] || []
      return chrome.storage.local.set({
        [TargetEnum.coreChatHistory]: coreData.concat(coreChatHistory),
        [TargetEnum.fullChatHistory]: fullData.concat(fullChatHistory),
      })
    })
    .then(() => {
      storeResponse.data = {
        fullChatHistoryLength: fullChatHistory.length,
      }
    })
    .catch((error) => {
      storeResponse.code = 500
      storeResponse.message = error
    })
    .finally(() => {
      log('send response')
      callback(storeResponse)
    })
}
