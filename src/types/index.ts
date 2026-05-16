export enum WINDOW_MESSAGE_TYPE {
  AI_CHAT_REQUEST = 'AI_CHAT_REQUEST',
  AI_CHAT_SESSION_MAP = 'AI_CHAT_SESSION_MAP',
}

export enum CHROME_MESSAGE_TYPE {
  NEW_CHAT_REQUEST = 'NEW_CHAT_REQUEST',
  BATCH_CHAT_REQUESTS = 'BATCH_CHAT_REQUESTS',
  AI_CHAT_SESSION_MAP = 'AI_CHAT_SESSION_MAP',
}

export enum Platform {
  deepseek = 'deepseek',
}
export interface Payload {
  session_id: string
  prompt: string
  timestamp: number
  platform: Platform
  index: string
}

export interface Message {
  type: CHROME_MESSAGE_TYPE
  payload: any
}

export enum TargetEnum {
  coreChatHistory = 'coreChatHistory',
  fullChatHistory = 'fullChatHistory',
  sessionMap = 'sessionMap',
}

export interface StoreChromeLocalError {
  message: unknown
}

export interface ResponseData {
  fullChatHistoryLength?: number
}

export interface StoreChromeLocalResponse {
  code: number
  message?: unknown
  data: ResponseData
}
