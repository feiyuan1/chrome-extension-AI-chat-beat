import { Platform, StorePayload } from '../types'
import { consoleError } from '../utils/debugger'
import {
  CreateMonitorLog,
  getSessionName,
  initSessionMap,
  MonitorAdapterErrorBoundary,
  MonitorLogType,
  reportMetrics,
  Sample,
  storeFailedLogs,
} from './utils'

const counterMap = new Map()

type ChatRequestTotalMetric = {
  __name__: string
  platform: Platform
  session_name: string
}

interface ChatReportData extends Sample {
  metric: ChatRequestTotalMetric
}

const debounce = <T extends (...args: any) => any>(fn: T, delay: number = 1000) => {
  let timer: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

const createCounter = (metric: ChatRequestTotalMetric, sample_interval: number = 60000) => {
  const key = new URLSearchParams(metric).toString()
  if (counterMap.has(key)) {
    return counterMap.get(key)
  }

  const report = (metrics: ChatReportData[]) => {
    counterMap.delete(key)
    reportMetrics(metrics)
  }

  const counter = {
    metric,
    value: 0,
    inc: () => inc(key),
    report: debounce(report, sample_interval),
  }

  counterMap.set(key, counter)
  return counter
}

const inc = function (_key: string, val: number = 1) {
  const value = val || 1
  const counter = counterMap.get(_key)
  counter.value = counter.value + value
  counter.report([{ values: [counter.value], metric: counter.metric, timestamps: [Date.now()] }])
}

const triggerReportMetric = (chat: StorePayload) => {
  const { platform, session_id } = chat
  const session_name = getSessionName(session_id)
  const metric: ChatRequestTotalMetric = { __name__: 'chat_requests_total', platform, session_name }
  const counter = createCounter(metric, 1000)
  counter.inc()
  return counter
}

const batchReportChatsNoAgg = (chats: StorePayload[]) => {
  reportMetrics(
    chats.map((chat) => ({
      metric: {
        __name__: 'chat_requests_total',
        platform: chat.platform,
        session_name: getSessionName(chat.session_id),
      },
      values: [1],
      timestamps: [chat.timestamp],
    })),
  )
}

interface ReportChatsParam {
  chats: StorePayload[]
  aggregate?: boolean
}

export const ReportChats = MonitorAdapterErrorBoundary({
  id: 'metric',
  innerScript: async ({ chats, aggregate = true }: ReportChatsParam) => {
    await initSessionMap()
    if (aggregate) {
      triggerReportMetric(chats[0])
      return
    }
    batchReportChatsNoAgg(chats)
  },
  reject(err) {
    consoleError(err)
    const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.uncaught_error)
    storeFailedLogs([errorLog])
  },
})
