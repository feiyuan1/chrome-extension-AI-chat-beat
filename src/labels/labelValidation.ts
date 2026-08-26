import { LabelModelResponse } from '../types/labels'
import { EmotionLabel, LABEL_TAXONOMY_VERSION, PromptTypeLabel } from '../types/taxonomy'
import { isConfidence, isEmotionLabel, isPromptTypeLabel } from './labelValueValidation'

export const parseLabelModelContent = (content: string): LabelModelResponse => {
  const trimmed = content.trim()
  if (trimmed.startsWith('```') || !trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    throw new Error('invalid label model response format')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error('invalid label model response JSON')
  }

  if (!isLabelModelResponse(parsed)) {
    throw new Error('invalid label model response schema')
  }
  return parsed
}

const isLabelModelResponse = (value: unknown): value is LabelModelResponse => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const response = value as Record<string, unknown>
  if (response.taxonomyVersion !== LABEL_TAXONOMY_VERSION) {
    return false
  }

  const labels = response.labels
  if (typeof labels !== 'object' || labels === null || Array.isArray(labels)) {
    return false
  }

  const values = labels as Record<string, unknown>
  if (!hasOnlyKeys(values, ['emotion', 'type'])) {
    return false
  }

  return isDecision(values.emotion, isEmotionLabel) && isDecision(values.type, isPromptTypeLabel)
}

const isDecision = <T extends string>(
  value: unknown,
  isLabel: (value: unknown) => value is T,
): boolean => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const decision = value as Record<string, unknown>
  return (
    hasOnlyKeys(decision, ['value', 'confidence']) &&
    isLabel(decision.value) &&
    isConfidence(decision.confidence)
  )
}

const hasOnlyKeys = (value: Record<string, unknown>, keys: string[]): boolean => {
  const actualKeys = Object.keys(value).sort()
  const expectedKeys = [...keys].sort()
  return actualKeys.length === expectedKeys.length && actualKeys.every((key, index) => key === expectedKeys[index])
}

export const createFallbackLabels = (): LabelModelResponse => ({
  taxonomyVersion: LABEL_TAXONOMY_VERSION,
  labels: {
    emotion: { value: EmotionLabel.unknown, confidence: 0 },
    type: { value: PromptTypeLabel.unknown, confidence: 0 },
  },
})
