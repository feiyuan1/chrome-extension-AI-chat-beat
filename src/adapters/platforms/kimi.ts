import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import { createAdapterErrorBoundary, createPlatformError, createSuccess } from './utils'

const platformError = createPlatformError(Platform.kimi)

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'kimi-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }

    const blocks = data.body?.message?.blocks
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return platformError('missing required field: blocks')
    }

    const block = blocks.find(
      (b: any) =>
        b &&
        b.text &&
        typeof b.text.content === 'string' &&
        b.text.content.trim(),
    )
    if (!block) {
      return platformError('no valid text block found')
    }

    return createSuccess({
      prompt: block.text.content,
      platform: data.platform,
      timestamp: data.timestamp,
    })
  },
)
