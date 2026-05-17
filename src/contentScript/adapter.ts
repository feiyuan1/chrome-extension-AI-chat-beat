import { AdapterResultStatus, AdaptResult } from '../types/adapter'
import { consoleError } from '../utils/debugger'

export type AdaptErrorBoundaryParams<T> = {
  data: any
  adapter: (...args: any[]) => AdaptResult<T>
  resolve: (data: T) => void
  reject?: (error: unknown) => void
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
      throw result.message
    }
    resolve(result.data)
  } catch (error) {
    consoleError(error)
    reject?.(error)
  }
}
