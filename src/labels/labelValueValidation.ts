import { EmotionLabel, PromptTypeLabel } from '../types/taxonomy'

const EMOTION_LABELS = Object.values(EmotionLabel)
const PROMPT_TYPE_LABELS = Object.values(PromptTypeLabel)

export const isEmotionLabel = (value: unknown): value is EmotionLabel => {
  return typeof value === 'string' && EMOTION_LABELS.includes(value as EmotionLabel)
}

export const isPromptTypeLabel = (value: unknown): value is PromptTypeLabel => {
  return typeof value === 'string' && PROMPT_TYPE_LABELS.includes(value as PromptTypeLabel)
}

export const isConfidence = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}
