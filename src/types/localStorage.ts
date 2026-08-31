import { StorePayload } from '.'
import { Log } from '../adapters/utils'

export enum LocalStoragekeys {
  unStoredMessageList = 'unStoredMessageList',
  failedAdaptChat = 'failedAdaptChat',
  errorLogs = 'errorLogs',
}

export interface LocalStorageData {
  [LocalStoragekeys.unStoredMessageList]?: StorePayload[]
  [LocalStoragekeys.failedAdaptChat]?: any[]
  [LocalStoragekeys.errorLogs]?: Log[]
}
