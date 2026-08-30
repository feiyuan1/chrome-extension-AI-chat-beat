import { TargetEnum } from '../../types'
import { LabelModelConfig } from '../../types/modelConfig'
import { decryptConfig, encryptConfig } from '../crypto'

const DEFAULT_TIMEOUT_MS = 30000

function normalizeConfig(config: LabelModelConfig): LabelModelConfig {
  const parsed = Number(config.timeoutMs)
  const timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS

  return {
    ...config,
    timeoutMs,
  }
}

export async function loadLabelModelConfig(): Promise<LabelModelConfig | null> {
  const result = await chrome.storage.local.get(TargetEnum.labelModelConfig)
  const stored = result[TargetEnum.labelModelConfig]

  if (!stored) {
    return null
  }

  try {
    return await decryptConfig(stored)
  } catch {
    return null
  }
}

export async function saveLabelModelConfig(config: LabelModelConfig): Promise<void> {
  const normalized = normalizeConfig(config)
  const encrypted = await encryptConfig(normalized)

  await chrome.storage.local.set({
    [TargetEnum.labelModelConfig]: encrypted,
  })
}
