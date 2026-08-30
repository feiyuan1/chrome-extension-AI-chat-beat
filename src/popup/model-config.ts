import { LabelModelConfig } from '../types/modelConfig'
import { loadLabelModelConfig, saveLabelModelConfig } from '../utils/config-storage'

const baseUrlInput = document.getElementById('config-base-url') as HTMLInputElement | null
const modelInput = document.getElementById('config-model') as HTMLInputElement | null
const timeoutInput = document.getElementById('config-timeout') as HTMLInputElement | null
const apiKeyInput = document.getElementById('config-api-key') as HTMLInputElement | null
const saveButton = document.getElementById('config-save-button') as HTMLButtonElement | null

function fillForm(config: LabelModelConfig) {
  if (baseUrlInput) {
    baseUrlInput.value = config.baseUrl
  }
  if (modelInput) {
    modelInput.value = config.model
  }
  if (timeoutInput) {
    timeoutInput.value = String(config.timeoutMs)
  }
  if (apiKeyInput) {
    apiKeyInput.value = config.apiKey
  }
}

function readForm(): LabelModelConfig {
  return {
    baseUrl: baseUrlInput?.value.trim() ?? '',
    model: modelInput?.value.trim() ?? '',
    timeoutMs: Number(timeoutInput?.value.trim() || '0'),
    apiKey: apiKeyInput?.value ?? '',
  }
}

export async function initConfigForm() {
  if (!baseUrlInput || !modelInput || !timeoutInput || !apiKeyInput || !saveButton) {
    return
  }

  try {
    const config = await loadLabelModelConfig()
    if (config) {
      fillForm(config)
    }
  } catch {
    alert('读取配置失败')
  }

  saveButton.onclick = async () => {
    const config = readForm()

    if (!config.baseUrl) {
      alert('Base URL 不能为空')
      return
    }
    if (!config.model) {
      alert('Model 不能为空')
      return
    }
    if (!config.apiKey) {
      alert('API Key 不能为空')
      return
    }

    try {
      await saveLabelModelConfig(config)
      alert('配置已保存')
    } catch {
      alert('保存配置失败')
    }
  }
}
