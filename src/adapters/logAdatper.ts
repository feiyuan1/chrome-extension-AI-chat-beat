import {
  LabelClassificationResult,
  ModelPromptLabels,
  Platform,
  StorePayload,
} from '../types'
import { consoleError } from '../utils/debugger'
import {
  CreateMonitorLog,
  getSessionName,
  initSessionMap,
  Log,
  MonitorAdapterErrorBoundary,
  MonitorLogType,
  reportLogs,
  storeFailedLogs,
} from './utils'

export interface ChatRequestLog extends Log {
  platform: Platform
  index: string
  session_name: string
  labels?: ModelPromptLabels
  prompt_tokens?: LabelClassificationResult['usage']['prompt_tokens']
  completion_tokens?: LabelClassificationResult['usage']['completion_tokens']
  total_tokens?: LabelClassificationResult['usage']['total_tokens']
  prompt_cache_hit_tokens?: LabelClassificationResult['usage']['prompt_tokens_details']['cached_tokens']
  prompt_cache_miss_tokens?: number
}

type ChatLogPayload = StorePayload & {
  labels?: ModelPromptLabels
  usage?: LabelClassificationResult['usage']
}

const chatToLog = (chat: ChatLogPayload): ChatRequestLog => {
  const session_name = getSessionName(chat.session_id)
  const usage = chat.usage
  return {
    _msg: chat.prompt,
    _time: chat.timestamp,
    platform: chat.platform,
    index: chat.index,
    session_name,
    ...(chat.labels && { labels: chat.labels }),
    ...(usage && {
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      prompt_cache_hit_tokens: usage.prompt_tokens_details.cached_tokens,
      prompt_cache_miss_tokens:
        usage.prompt_tokens - usage.prompt_tokens_details.cached_tokens,
    }),
  }
}

export const ReportChatsLogs = MonitorAdapterErrorBoundary({
  id: 'report log',
  innerScript: async (chats: ChatLogPayload[]) => {
    await initSessionMap()
    reportLogs(chats.map(chatToLog))
  },
  reject: (err) => {
    consoleError(err)
    const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.uncaught_error)
    storeFailedLogs([errorLog])
  },
})
