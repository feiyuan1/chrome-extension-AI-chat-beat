import {
  LABEL_DIMENSIONS,
  LabelModelResponse,
  ModelPromptLabels,
} from '../types/labels'
import {
  DomainLabel,
  EmotionLabel,
  InfoProcessingLabel,
  IntentLabel,
  LABEL_TAXONOMY_VERSION,
  ProblemNatureLabel,
  ThinkingModeLabel,
} from '../types/taxonomy'
import { isConfidence, LABEL_VALIDATORS } from './labelValueValidation'

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
  if (!isRecord(value) || !hasOnlyKeys(value, ['taxonomyVersion', 'labels'])) {
    return false
  }
  if (value.taxonomyVersion !== LABEL_TAXONOMY_VERSION) {
    return false
  }

  const labels = value.labels
  if (!isRecord(labels) || !hasOnlyKeys(labels, [...LABEL_DIMENSIONS])) {
    return false
  }

  return LABEL_DIMENSIONS.every((dimension) => {
    return isDecision(labels[dimension], LABEL_VALIDATORS[dimension])
  })
}

const isDecision = (
  value: unknown,
  isLabel: (value: unknown) => boolean,
): boolean => {
  if (!isRecord(value) || !hasOnlyKeys(value, ['value', 'confidence'])) {
    return false
  }

  return isLabel(value.value) && isConfidence(value.confidence)
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const hasOnlyKeys = (value: Record<string, unknown>, keys: string[]): boolean => {
  const actualKeys = Object.keys(value).sort()
  const expectedKeys = [...keys].sort()
  return (
    actualKeys.length === expectedKeys.length &&
    actualKeys.every((key, index) => key === expectedKeys[index])
  )
}

const createUnknownLabels = (): ModelPromptLabels => ({
  domain: { value: DomainLabel.Other, confidence: 0 },
  intent: { value: IntentLabel.Other, confidence: 0 },
  emotion: { value: EmotionLabel.Unknown, confidence: 0 },
  thinking_mode: { value: ThinkingModeLabel.Unknown, confidence: 0 },
  problem_nature: { value: ProblemNatureLabel.Unknown, confidence: 0 },
  info_processing: { value: InfoProcessingLabel.Unknown, confidence: 0 },
})

export const createFallbackLabels = (): LabelModelResponse => ({
  taxonomyVersion: LABEL_TAXONOMY_VERSION,
  labels: createUnknownLabels(),
})
