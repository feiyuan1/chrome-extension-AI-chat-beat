import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import {
  createAdapterErrorBoundary,
  createPlatformError,
  createSuccess,
  parseChatRequestBody,
} from './utils'

const platformError = createPlatformError(Platform.chatglm)

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'chatglm-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }

    const body = parseChatRequestBody(Platform.chatglm, data.body)
    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return platformError('missing required field: messages')
    }

    const content = messages[0].content
    if (!Array.isArray(content) || content.length === 0) {
      return platformError('missing required field: messages[0].content')
    }

    const item = content.find(
      (c: any) => c && c.type === 'text' && typeof c.text === 'string' && c.text.trim(),
    )

    if (!item) {
      return platformError('no valid prompt found')
    }

    return createSuccess({
      prompt: item.text,
      platform: data.platform,
      timestamp: data.timestamp,
    })
  },
)
