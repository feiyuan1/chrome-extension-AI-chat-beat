import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import {
  createAdapterErrorBoundary,
  createPlatformError,
  createSuccess,
  parseChatRequestBody,
} from './utils'

const platformError = createPlatformError(Platform.yuanbao)

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'yuanbao-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }

    const body = parseChatRequestBody(Platform.yuanbao, data.body)
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
