import { Payload } from '.'

export enum LocalStoragekeys {
  unStoredMessageList = 'unStoredMessageList',
}

export interface LocalStorageData {
  [LocalStoragekeys.unStoredMessageList]?: Payload[]
}
