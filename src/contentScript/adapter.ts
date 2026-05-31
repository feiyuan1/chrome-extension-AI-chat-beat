import { MonitorLog, MonitorLogType, storeFailedLogs } from '../adapters/utils'
import { Platform } from '../types'
import { AdapterResultStatus, AdaptResult } from '../types/adapter'
import { consoleError } from '../utils/debugger'

export type AdaptErrorBoundaryParams<T> = {
  data: any
  adapter: (...args: any[]) => AdaptResult<T>
  resolve: (data: T) => void
  reject?: (error: unknown) => void
}

export interface AdaptErrorLog extends MonitorLog {
  platform: Platform
}

export const createAdaptErrorLog = ({
  msg,
  platform,
}: {
  msg: string
  platform?: Platform
}): AdaptErrorLog => {
  return {
    _msg: msg,
    _time: Date.now(),
    type: MonitorLogType.uncaught_error,
    platform: platform || Platform.unknown,
  }
}
export const AdapterErrorBoundary = <T>({
  data,
  adapter,
  resolve,
  reject,
}: AdaptErrorBoundaryParams<T>) => {
  try {
    const result = adapter(data)
    if (result.status === AdapterResultStatus.error) {
      throw {
        message: result.message,
        platform: result.platform,
      }
    }
    resolve(result.data)
  } catch (error: any) {
    const log = createAdaptErrorLog({
      msg: error.message || error,
      platform: error.platform,
    })
    storeFailedLogs([log])
    consoleError(error)
    reject?.(error)
  }
}
