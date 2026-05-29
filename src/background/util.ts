import { StorePayload, TargetEnum } from '../types'

export const handleBatchStore = (data: StorePayload[]) => {
  chrome.storage.local.get(TargetEnum.fullChatHistory).then((result) => {
    const fullData = result[TargetEnum.fullChatHistory] || []
    return chrome.storage.local.set({
      [TargetEnum.fullChatHistory]: fullData.concat(data),
    })
  })
}
