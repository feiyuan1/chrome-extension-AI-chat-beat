import { EmotionLabel, PromptTypeLabel } from './taxonomy'

export { EmotionLabel, PromptTypeLabel } from './taxonomy'
export { LABEL_SCHEMA_VERSION, LABEL_TAXONOMY_VERSION } from './taxonomy'

export type LabelDimension = 'emotion' | 'type'
export type LabelSource = 'rule' | 'model' | 'fallback'
export type LabelStatus = 'complete' | 'fallback'
export type LabelPath = 'rule' | 'model' | 'mixed' | 'fallback'

export interface LabelValue<T extends string> {
  value: T
  confidence: number
}

export interface LabelDecision<T extends string> extends LabelValue<T> {
  source: LabelSource
}

export type ModelLabelDecision<T extends string> = LabelValue<T>

export interface PartialPromptLabels {
  emotion?: LabelDecision<EmotionLabel>
  type?: LabelDecision<PromptTypeLabel>
}

export interface PromptLabels {
  schemaVersion: string
  taxonomyVersion: string
  emotion: LabelDecision<EmotionLabel>
  type: LabelDecision<PromptTypeLabel>
  status: LabelStatus
}

export interface LabelModelRequest {
  prompt: string
  dimensions: ['emotion', 'type']
  taxonomyVersion: string
}

export interface LabelModelResponse {
  taxonomyVersion: string
  labels: {
    emotion: ModelLabelDecision<EmotionLabel>
    type: ModelLabelDecision<PromptTypeLabel>
  }
}

export interface LabelTestCase {
  id: string
  prompt: string
  expectedRuleResult: PartialPromptLabels
  expectedUnresolvedDimensions: LabelDimension[]
  expectedFinalResult?: PromptLabels
}

export interface LabelAttemptResult {
  id: string
  labels: PromptLabels
  path: LabelPath
  ruleDurationMs: number
  modelDurationMs: number
  totalDurationMs: number
}
