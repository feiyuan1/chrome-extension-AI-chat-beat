import { LabelModelResponse } from '../types/labels'
import { LabelModelConfig } from '../types/modelConfig'
import { createLabelRequestBody, LABEL_DIMENSIONS } from './aiLabelRules'
import { createFallbackLabels, parseLabelModelContent } from './labelValidation'

export type LabelClassificationErrorCode = 'config' | 'http' | 'timeout' | 'network' | 'response'

export class LabelClassificationError extends Error {
  constructor(
    public readonly code: LabelClassificationErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'LabelClassificationError'
  }
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown
    }
  }>
}

export const classifyPrompt = async (
  prompt: string,
  config: LabelModelConfig,
): Promise<LabelModelResponse> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs)

  try {
    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        ...createLabelRequestBody(config.model, prompt),
        dimensions: LABEL_DIMENSIONS,
      }),
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
    })

    if (response.status === 401) {
      throw new LabelClassificationError('config', 'label model authentication failed')
    }
    if (!response.ok) {
      throw new LabelClassificationError('http', `label model request failed: ${response.status}`)
    }

    let data: ChatCompletionResponse
    try {
      data = (await response.json()) as ChatCompletionResponse
    } catch {
      throw new LabelClassificationError('response', 'invalid label model response body')
    }

    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      throw new LabelClassificationError('response', 'label model response has no content')
    }

    try {
      return parseLabelModelContent(content)
    } catch {
      throw new LabelClassificationError('response', 'invalid label model response schema')
    }
  } catch (error) {
    if (error instanceof LabelClassificationError) {
      throw error
    }
    if (controller.signal.aborted) {
      throw new LabelClassificationError('timeout', 'label model request timed out')
    }
    throw new LabelClassificationError('network', 'label model network request failed')
  } finally {
    clearTimeout(timeout)
  }
}

export const classifyPromptWithFallback = async (
  prompt: string,
  config: LabelModelConfig,
): Promise<LabelModelResponse> => {
  try {
    return await classifyPrompt(prompt, config)
  } catch {
    return createFallbackLabels()
  }
}
