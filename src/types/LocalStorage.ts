import { StorePayload } from '.'

export enum LocalStoragekeys {
  unStoredMessageList = 'unStoredMessageList',
  failedAdaptChat = 'failedAdaptChat',
}

export interface LocalStorageData {
  [LocalStoragekeys.unStoredMessageList]?: StorePayload[]
  [LocalStoragekeys.failedAdaptChat]?: any[]
}
