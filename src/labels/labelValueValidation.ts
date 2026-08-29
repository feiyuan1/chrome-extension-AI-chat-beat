import type { LabelDimension } from '../types/labels'
import {
  DomainLabel,
  EmotionLabel,
  InfoProcessingLabel,
  IntentLabel,
  ProblemNatureLabel,
  ThinkingModeLabel,
} from '../types/taxonomy'

export const LABEL_VALIDATORS: Record<LabelDimension, (value: unknown) => boolean> = {
  domain: (value) => Object.values(DomainLabel).includes(value as DomainLabel),
  intent: (value) => Object.values(IntentLabel).includes(value as IntentLabel),
  emotion: (value) => Object.values(EmotionLabel).includes(value as EmotionLabel),
  thinking_mode: (value) => Object.values(ThinkingModeLabel).includes(value as ThinkingModeLabel),
  problem_nature: (value) => Object.values(ProblemNatureLabel).includes(value as ProblemNatureLabel),
  info_processing: (value) =>
    Object.values(InfoProcessingLabel).includes(value as InfoProcessingLabel),
}

export const isConfidence = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}
