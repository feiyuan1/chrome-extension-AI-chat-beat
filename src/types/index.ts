export enum WINDOW_MESSAGE_TYPE {
  AI_CHAT_REQUEST = 'AI_CHAT_REQUEST',
  AI_CHAT_SESSION_MAP = 'AI_CHAT_SESSION_MAP',
}

export enum CHROME_MESSAGE_TYPE {
  BATCH_CHAT_REQUESTS = 'BATCH_CHAT_REQUESTS',
  AI_CHAT_SESSION_MAP = 'AI_CHAT_SESSION_MAP',
}

export enum Platform {
  deepseek = 'deepseek',
  unknown = 'unknown',
}
export interface StorePayload {
  session_id: string
  prompt: string
  timestamp: number
  platform: Platform
  index: string
}

export interface StoreMessage {
  type: CHROME_MESSAGE_TYPE
  payload: StorePayload[]
  aggregate?: boolean // 是否聚合上报metric
}

export interface SessionMapItem {
  id: string
  title: string
}

export interface SessionMapMessage {
  type: CHROME_MESSAGE_TYPE
  payload: SessionMapItem[]
}

export enum TargetEnum {
  fullChatHistory = 'fullChatHistory',
  sessionMap = 'sessionMap',
  reportFailedLogs = 'reportFailedLogs',
  reportFailedMetrics = 'reportFailedMetrics',
  labelModelConfig = 'labelModelConfig',
}

export interface StoreChromeLocalError {
  message: unknown
}

export * from './labels'
export * from './taxonomy'
