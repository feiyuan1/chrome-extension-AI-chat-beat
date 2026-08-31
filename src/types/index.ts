export enum WINDOW_MESSAGE_TYPE {
  AI_CHAT_REQUEST = 'AI_CHAT_REQUEST',
}

export enum CHROME_MESSAGE_TYPE {
  BATCH_CHAT_REQUESTS = 'BATCH_CHAT_REQUESTS',
}

export enum Platform {
  deepseek = 'deepseek',
  yuanbao = 'yuanbao',
  qianwen = 'qianwen',
  yiyan = 'yiyan',
  chatglm = 'chatglm',
  doubao = 'doubao',
  unknown = 'unknown',
}
export interface StorePayload {
  prompt: string
  timestamp: number
  platform: Platform
}

export interface StoreMessage {
  type: CHROME_MESSAGE_TYPE
  payload: StorePayload[]
  aggregate?: boolean // 是否聚合上报metric
}

export enum TargetEnum {
  fullChatHistory = 'fullChatHistory',
  reportFailedLogs = 'reportFailedLogs',
  reportFailedMetrics = 'reportFailedMetrics',
  labelModelConfig = 'labelModelConfig',
}

export interface StoreChromeLocalError {
  message: unknown
}

export * from './labels'
export * from './taxonomy'
