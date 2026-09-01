import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import {
  createAdapterErrorBoundary,
  createPlatformError,
  createSuccess,
  parseChatRequestBody,
} from './utils'

const platformError = createPlatformError(Platform.qianwen)

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'qianwen-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }

    const body = parseChatRequestBody(Platform.qianwen, data.body)
    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return platformError('missing required field: messages')
    }

    const message = messages.find(
      (m: any) =>
        m && m['mime_type'] === 'text/plain' && typeof m.content === 'string' && m.content.trim(),
    )

    if (!message) {
      return platformError('no valid text/plain message found')
    }

    return createSuccess({
      prompt: message.content,
      platform: data.platform,
      timestamp: data.timestamp,
    })
  },
)
