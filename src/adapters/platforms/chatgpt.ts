import { Platform, StorePayload } from '../../types'
import { AdaptResult } from '../../types/adapter'
import {
  createAdapterErrorBoundary,
  createPlatformError,
  createSuccess,
  parseChatRequestBody,
} from './utils'

const platformError = createPlatformError(Platform.chatgpt)

interface ChatGPTMessage {
  author?: {
    role?: string
  }
  content?: {
    content_type?: string
    parts?: unknown[]
  }
}

const extractUserPrompt = (messages: unknown): string | null => {
  if (!Array.isArray(messages)) {
    return null
  }

  const userMessage = messages.find((m: ChatGPTMessage) => {
    return m?.author?.role === 'user' && m?.content?.content_type === 'text'
  }) as ChatGPTMessage | undefined

  if (!userMessage) {
    return null
  }

  const parts = userMessage.content?.parts
  if (!Array.isArray(parts) || parts.length === 0) {
    return null
  }

  const text = parts.find((p: unknown) => typeof p === 'string' && p.trim()) as string | undefined
  if (!text) {
    return null
  }

  return text.trim()
}

export const ChatDataAdapter = createAdapterErrorBoundary<AdaptResult<StorePayload>>(
  'chatgpt-chatdata',
  (data: any) => {
    if (!data || typeof data !== 'object') {
      return platformError('ChatDataAdapter required an object')
    }

    const body = parseChatRequestBody(Platform.chatgpt, data.body)
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return platformError('missing required field: messages')
    }

    const prompt = extractUserPrompt(body.messages)
    if (!prompt) {
      return platformError('no valid prompt found')
    }

    return createSuccess({
      prompt,
      platform: data.platform,
      timestamp: data.timestamp,
    })
  },
)
