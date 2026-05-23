import { Platform, StorePayload } from '../types'
import { consoleError, log } from '../utils/debugger'
import { getSessionName, initSessionMap } from './utils'

const counterMap = new Map()

type ChatRequestTotalMetric = {
  __name__: string
  platform: Platform
  session_name: string
}

interface ChatReportData {
  metric: ChatRequestTotalMetric
  values: number[]
  timestamps: number[]
}

const reportMetrics = (metrics: ChatReportData[]) => {
  const body = metrics.map((metric) => JSON.stringify(metric)).join('\n')
  log('report body', body)
  fetch('http://localhost:8010/proxy/api/v1/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body, // JSON Lines 格式
  })
    .then(() => log(`push ${metrics.length} metric success`))
    .catch((err) => consoleError('上报指标失败:', err))
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

const triggerReportMetric = async (chat: StorePayload) => {
  const { platform, session_id } = chat
  const session_name = getSessionName(session_id)
  const metric: ChatRequestTotalMetric = { __name__: 'chat_requests_total', platform, session_name }
  const counter = createCounter(metric, 1000)
  counter.inc()
  return counter
}

const batchReportChatsNoAgg = async (chats: StorePayload[]) => {
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

export const ReportChats = async (chats: StorePayload[], aggregate: boolean = true) => {
  await initSessionMap()
  if (aggregate) {
    triggerReportMetric(chats[0])
    return
  }
  batchReportChatsNoAgg(chats)
}
