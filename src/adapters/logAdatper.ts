import { Platform, StorePayload } from '../types'
import { consoleError, log } from '../utils/debugger'
import { getSessionName, initSessionMap } from './utils'

export interface ChatRequestLog {
  _msg: string
  _time: number
  platform: Platform
  index: string
  session_name: string
}

const chatToLog = (chat: StorePayload): ChatRequestLog => {
  const session_name = getSessionName(chat.session_id)
  return {
    _msg: chat.prompt,
    _time: chat.timestamp,
    platform: chat.platform,
    index: chat.index,
    session_name,
  }
}

const reportLogs = (logs: ChatRequestLog[]) => {
  const body = logs.map((log) => JSON.stringify(log)).join('\n')
  log('report log body', body)
  fetch('http://localhost:8011/proxy/insert/jsonline?_stream_fields=session_name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body, // JSON Lines 格式
  })
    .then(() => log(`push ${logs.length} logs success`))
    .catch((err) => consoleError('上传日志失败:', err))
}

export const ReportChatsLogs = async (chats: StorePayload[]) => {
  await initSessionMap()
  reportLogs(chats.map(chatToLog))
}
