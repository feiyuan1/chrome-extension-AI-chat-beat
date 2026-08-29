import { LabelClassificationResult, LabelModelResponse } from '../types/labels'
import { LabelModelConfig } from '../types/modelConfig'
import { createLabelRequestBody } from './aiLabelRules'
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
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    prompt_tokens_details: {
      cached_tokens: number
    }
  }
}

export const classifyPrompt = async (
  prompt: string,
  config: LabelModelConfig,
): Promise<LabelClassificationResult> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs)

  try {
    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify(createLabelRequestBody(config.model, prompt)),
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

    let labels: LabelModelResponse
    try {
      labels = parseLabelModelContent(content)
    } catch {
      throw new LabelClassificationError('response', 'invalid label model response schema')
    }

    return {
      labels,
      usage: data.usage,
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
): Promise<LabelClassificationResult> => {
  try {
    return await classifyPrompt(prompt, config)
  } catch (error) {
    if (error instanceof LabelClassificationError && error.code === 'config') {
      throw error
    }
    return {
      labels: createFallbackLabels(),
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        prompt_tokens_details: { cached_tokens: 0 },
      },
    }
  }
}
