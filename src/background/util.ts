import { StorePayload, StoreChromeLocalResponse, TargetEnum } from '../types'

export const handleBatchStore = (data: StorePayload[], callback: (response: any) => void) => {
  const storeResponse: StoreChromeLocalResponse = {
    code: 200,
    data: {},
  }

  chrome.storage.local
    .get(TargetEnum.fullChatHistory)
    .then((result) => {
      const fullData = result[TargetEnum.fullChatHistory] || []
      return chrome.storage.local.set({
        [TargetEnum.fullChatHistory]: fullData.concat(data),
      })
    })
    .then(() => {
      storeResponse.data = {
        fullChatHistoryLength: data.length,
      }
    })
    .catch((error) => {
      storeResponse.code = 500
      storeResponse.message = error
    })
    .finally(() => {
      callback(storeResponse)
    })
}
