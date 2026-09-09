import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import {
  createAdapterErrorBoundary,
  createPlatformError,
  createSuccess,
  parseChatRequestBody,
} from './utils'

const platformError = createPlatformError(Platform.doubao)

function extractDoubaoText(block: unknown): string | null {
  if (!block || typeof block !== 'object') {
    return null
  }

  const content = block as Record<string, any>

  if (content.text_block && typeof content.text_block.text === 'string') {
    const text = content.text_block.text.trim()
    return text || null
  }

  if (typeof content.text === 'string') {
    const text = content.text.trim()
    return text || null
  }

  return null
}

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'doubao-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }

    const body = parseChatRequestBody(Platform.doubao, data.body)
    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return platformError('missing required field: messages')
    }

    const message = messages.find((m: any) => {
      if (!m || !Array.isArray(m.content_block)) {
        return false
      }
      return m.content_block.some((block: any) => extractDoubaoText(block?.content))
    })

    if (!message) {
      return platformError('no valid prompt found')
    }

    const textBlock = message.content_block.find((block: any) =>
      extractDoubaoText(block?.content),
    )
    const prompt = extractDoubaoText(textBlock?.content)

    if (!prompt) {
      return platformError('failed to extract prompt text')
    }

    return createSuccess({
      prompt,
      platform: data.platform,
      timestamp: data.timestamp,
    })
  },
)
