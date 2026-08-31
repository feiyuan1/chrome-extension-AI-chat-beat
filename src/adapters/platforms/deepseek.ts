import { Platform, StorePayload } from '../../types'
import { AdapterResultStatus, AdaptError, AdaptResult, AdaptSuccess } from '../../types/adapter'
import { createIndex } from '../../utils'

const CreateError = (message: unknown): AdaptError => ({
  status: AdapterResultStatus.error,
  message,
  platform: Platform.deepseek,
})

const CreateSuccess = <T>(data: T): AdaptSuccess<T> => ({
  status: AdapterResultStatus.success,
  data,
})

const AdapterErrorBoundary = <T extends AdaptResult>(
  id: string,
  innerScript: (...data: any[]) => T,
) => {
  return (...args: any[]) => {
    try {
      return innerScript(...args)
    } catch (err) {
      return CreateError(`${id}${err}`) as T
    }
  }
}

export const ChatDataAdapter = AdapterErrorBoundary<AdaptResult<StorePayload>>(
  'chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return CreateError('ChatDataAdapter required an object')
    }
    if (!data.body?.prompt) {
      return CreateError('missing required field: prompt')
    }
    const {
      body: { prompt },
      platform,
      timestamp,
    } = data

    return CreateSuccess({
      prompt,
      platform,
      timestamp,
      index: createIndex(),
    })
  },
)
