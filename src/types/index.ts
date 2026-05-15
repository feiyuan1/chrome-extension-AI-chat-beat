export interface Message {
  type: string
  payload: unknown
}

export enum TargetEnum {
  coreChatHistory = 'coreChatHistory',
  fullChatHistory = 'fullChatHistory',
}

export interface StoreChromeLocalError {
  message: unknown
}
export interface StoreChromeLocalResponse {
  code: number
  message?: unknown
}
