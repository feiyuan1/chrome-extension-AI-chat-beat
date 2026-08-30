import { SessionMapItem, TargetEnum } from '../types'
import { consoleError, log } from '../utils/debugger'

export const safeExecuteAsyncScript = (fn: () => Promise<any>) => {
  return async () => {
    try {
      return await fn()
    } catch (err) {
      consoleError('safeExecuteAsyncScript', err)
      const errorLog = CreateMonitorLog(
        `${(err as Error)?.stack || err}`,
        MonitorLogType.safe_execute_error,
      )
      storeFailedLogs([errorLog])
    }
  }
}

export const session_map: { value: SessionMapItem[] } = { value: [] }

export const initSessionMap = safeExecuteAsyncScript(async () => {
  const result = await chrome.storage.local.get(TargetEnum.sessionMap)
  session_map.value = result[TargetEnum.sessionMap] || ([] as SessionMapItem[])
})

export const getSessionName = (session_id: string) => {
  const target = session_map.value.find((item) => item.id === session_id)
  if (target) {
    return target.title
  }
  return 'other'
}

export const MonitorAdapterErrorBoundary = ({
  id,
  innerScript,
  resolve,
  reject,
}: {
  id: string
  innerScript: (...data: any[]) => Promise<any>
  resolve?: () => void
  reject?: (error: unknown) => void
}) => {
  return async (...args: any[]) => {
    try {
      resolve?.()
      return await innerScript(...args)
    } catch (err) {
      reject?.(`error in 【${id}】: ${(err as Error)?.stack || err}`)
    }
  }
}

export const safeResponseToJson = async (response: Response) => {
  try {
    return await response.json()
  } catch (err) {}
  const { headers, ok, redirected, status, statusText, type, url } = response
  return { headers, ok, redirected, status, statusText, type, url }
}

export const storeFailedLogs = (logs: Log[]) => {
  chrome.storage.local.get([TargetEnum.reportFailedLogs]).then((result) => {
    const oldList = result[TargetEnum.reportFailedLogs] || []
    chrome.storage.local.set({
      [TargetEnum.reportFailedLogs]: oldList.concat(logs),
    })
  })
}

export const storeFailedMetrics = (metrics: Sample[]) => {
  chrome.storage.local.get([TargetEnum.reportFailedMetrics]).then((result) => {
    const oldList = result[TargetEnum.reportFailedMetrics] || []
    chrome.storage.local.set({
      [TargetEnum.reportFailedMetrics]: oldList.concat(metrics),
    })
  })
}

export const reportFailedLogs = () => {
  chrome.storage.local
    .get([TargetEnum.reportFailedLogs])
    .then((result) => {
      const logs = result[TargetEnum.reportFailedLogs] || []
      if (!logs.length) {
        return
      }
      return reportLogs(logs, true)
    })
    .then((reportSuccess) => {
      if (!reportSuccess) {
        return
      }
      chrome.storage.local.remove(TargetEnum.reportFailedLogs)
    })
}

export const reportFailedMetrics = () => {
  chrome.storage.local
    .get([TargetEnum.reportFailedMetrics])
    .then((result) => {
      const metrics = result[TargetEnum.reportFailedMetrics] || []
      if (!metrics.length) {
        return
      }
      return reportMetrics(metrics, true)
    })
    .then((reportSuccess) => {
      if (!reportSuccess) {
        return
      }
      chrome.storage.local.remove(TargetEnum.reportFailedMetrics)
    })
}

export interface Sample {
  metric: any
  values: number[]
  timestamps: number[]
}

export const reportMetrics = async (metrics: Sample[], isRestore = false) => {
  const body = metrics.map((metric) => JSON.stringify(metric)).join('\n')
  log('report metrics body', body)
  return fetch('http://127.0.0.1:8428/api/v1/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body, // JSON Lines 格式
  })
    .then((response) => {
      return safeResponseToJson(response)
    })
    .then((response) => {
      if (response.ok) {
        log(`push ${metrics.length} metric success`)
        return response.ok
      }
      throw new Error(JSON.stringify(response))
    })
    .catch((err) => {
      consoleError('上报指标失败:', `${err}`)
      if (isRestore) {
        return
      }
      storeFailedMetrics(metrics)
      const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.report_metric_error)
      storeFailedLogs([errorLog])
    })
}

export interface Log {
  _msg: string
  _time: number
}

export enum MonitorLogType {
  report_log_error = 'report_log_error',
  report_metric_error = 'report_metric_error',
  uncaught_error = 'uncaught_error',
  safe_execute_error = 'safe_execute_error',
  ai_analyze_error = 'ai_analyze_error',
}
export interface MonitorLog extends Log {
  type: MonitorLogType
}

export const CreateMonitorLog = (msg: string, type: MonitorLogType): MonitorLog => {
  return {
    _msg: msg,
    _time: Date.now(),
    type,
  }
}

export const reportLogs = async (logs: Log[], isRestore = false) => {
  const body = logs.map((log) => JSON.stringify(log)).join('\n')
  log('report log body', body)
  return fetch('http://127.0.0.1:9428/insert/jsonline?_stream_fields=session_name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body, // JSON Lines 格式
  })
    .then((response) => {
      return safeResponseToJson(response)
    })
    .then((response) => {
      if (response.ok) {
        log(`push ${logs.length} logs success`)
        return response.ok
      }
      throw new Error(JSON.stringify(response))
    })
    .catch((err) => {
      consoleError('上报日志失败:', `${err}`)
      if (isRestore) {
        return
      }
      const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.report_log_error)
      storeFailedLogs(logs.concat(errorLog))
    })
}
