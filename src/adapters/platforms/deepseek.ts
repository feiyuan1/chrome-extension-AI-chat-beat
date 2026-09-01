import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import {
  createAdapterErrorBoundary,
  createPlatformError,
  createSuccess,
  parseChatRequestBody,
} from './utils'

const platformError = createPlatformError(Platform.deepseek)

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'deepseek-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }

    const body = parseChatRequestBody(Platform.deepseek, data.body)
    if (body.prompt == null) {
      return platformError('missing required field: prompt')
    }
    if (!body.prompt) {
      return platformError('no valid prompt found')
    }
    return createSuccess({
      prompt: body.prompt,
      platform: data.platform,
      timestamp: data.timestamp,
    })
  },
)
