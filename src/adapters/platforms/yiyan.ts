import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import {
  createAdapterErrorBoundary,
  createPlatformError,
  createSuccess,
  parseChatRequestBody,
} from './utils'

const platformError = createPlatformError(Platform.yiyan)

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'yiyan-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }

    const body = parseChatRequestBody(Platform.yiyan, data.body)
    const query = body.message?.query
    if (!Array.isArray(query) || query.length === 0) {
      return platformError('missing required field: message.query')
    }

    const item = query.find((q: any) => {
      if (!q || q.type !== 'TEXT') {
        return false
      }
      return typeof q.data?.text?.query === 'string' && q.data.text.query.trim()
    })

    if (!item) {
      return platformError('no valid TEXT query found')
    }

    return createSuccess({
      prompt: item.data.text.query,
      platform: data.platform,
      timestamp: data.timestamp,
    })
  },
)
