import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import { createAdapterErrorBoundary, createPlatformError, createSuccess } from './utils'

const platformError = createPlatformError(Platform.deepseek)

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'deepseek-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }
    if (data.body?.prompt == null) {
      return platformError('missing required field: prompt')
    }
    if (!data.body?.prompt) {
      return platformError('no valid prompt found')
    }
    return createSuccess({
      prompt: data.body.prompt,
      platform: data.platform,
      timestamp: data.timestamp,
    })
  },
)
