import { Platform, StorePayload } from '../types'
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

export const ReportChatsLogs = MonitorAdapterErrorBoundary({
  id: 'report log',
  innerScript: async (chats: StorePayload[]) => {
    await initSessionMap()
    reportLogs(chats.map(chatToLog))
  },
  reject: (err) => {
    consoleError(err)
    const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.uncaught_error)
    storeFailedLogs([errorLog])
  },
})
