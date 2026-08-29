import {
  DomainLabel,
  EmotionLabel,
  InfoProcessingLabel,
  IntentLabel,
  ProblemNatureLabel,
  ThinkingModeLabel,
} from './taxonomy'

export {
  DomainLabel,
  EmotionLabel,
  InfoProcessingLabel,
  IntentLabel,
  ProblemNatureLabel,
  ThinkingModeLabel,
} from './taxonomy'
export { LABEL_SCHEMA_VERSION, LABEL_TAXONOMY_VERSION } from './taxonomy'

export type LabelDimension =
  | 'domain'
  | 'intent'
  | 'emotion'
  | 'thinking_mode'
  | 'problem_nature'
  | 'info_processing'

export const LABEL_DIMENSIONS = [
  'domain',
  'intent',
  'emotion',
  'thinking_mode',
  'problem_nature',
  'info_processing',
] as const satisfies readonly LabelDimension[]

export type LabelValueByDimension = {
  domain: DomainLabel
  intent: IntentLabel
  emotion: EmotionLabel
  thinking_mode: ThinkingModeLabel
  problem_nature: ProblemNatureLabel
  info_processing: InfoProcessingLabel
}

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

export type PartialPromptLabels = Partial<{
  [Dimension in LabelDimension]: LabelDecision<LabelValueByDimension[Dimension]>
}>

export type PromptLabels = {
  [Dimension in LabelDimension]: LabelDecision<LabelValueByDimension[Dimension]>
} & {
  schemaVersion: string
  taxonomyVersion: string
  status: LabelStatus
}

export interface LabelModelRequest {
  prompt: string
  dimensions: typeof LABEL_DIMENSIONS
  taxonomyVersion: string
}

export type ModelPromptLabels = {
  [Dimension in LabelDimension]: ModelLabelDecision<LabelValueByDimension[Dimension]>
}

export interface LabelModelResponse {
  taxonomyVersion: string
  labels: ModelPromptLabels
}

export interface LabelTokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  prompt_tokens_details: {
    cached_tokens: number
  }
}

export interface LabelClassificationResult {
  labels: LabelModelResponse
  usage: LabelTokenUsage
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
