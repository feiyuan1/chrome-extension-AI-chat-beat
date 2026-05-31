import { Platform, SessionMapItem, StorePayload } from '../types'
import { createIndex } from '../utils'
import { AdapterResultStatus, AdaptError, AdaptResult, AdaptSuccess } from '../types/adapter'

const CreateError = (message: unknown): AdaptError => ({
  status: AdapterResultStatus.error,
  message,
  platform: Platform.deepseek,
})

const CreateSuccess = <T extends any>(data: any): AdaptSuccess<T> => ({
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
      return CreateError(`${id}${err}`)
    }
  }
}

const SessionMapAdapter = AdapterErrorBoundary<AdaptResult<SessionMapItem[]>>(
  'sessionmap',
  (data: any) => {
    const list = data.data.biz_data.chat_sessions
    if (!Array.isArray(list)) {
      return CreateError(
        'SessionMapAdapter required structure like data.data.biz_data.chat_sessions',
      )
    }
    const result = list.slice(0, 20).map(({ id, title }: SessionMapItem) => {
      if (id && title) {
        return { id, title }
      }
      return CreateError('session map item missing required field: id or title')
    })
    return CreateSuccess(result)
  },
)

const ChatDataAdapter = AdapterErrorBoundary<AdaptResult<StorePayload>>('chatdata', (data: any) => {
  if (!data || typeof data != 'object') {
    return CreateError('SessionMapAdapter required an object')
  }
  if (!data.body?.prompt || !data.body?.chat_session_id) {
    return CreateError('missing required field: prompt or chat_session_id')
  }
  const {
    body: { prompt, chat_session_id },
    platform,
    timestamp,
  } = data

  return CreateSuccess({
    prompt,
    platform,
    timestamp,
    session_id: chat_session_id,
    index: createIndex(),
  })
})

export { SessionMapAdapter, ChatDataAdapter }
