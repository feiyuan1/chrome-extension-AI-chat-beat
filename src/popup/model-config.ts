import { LabelModelConfig } from '../types/modelConfig'
import { loadLabelModelConfig, saveLabelModelConfig } from '../utils/config-storage'

const baseUrlInput = document.getElementById('config-base-url') as HTMLInputElement | null
const modelInput = document.getElementById('config-model') as HTMLInputElement | null
const timeoutInput = document.getElementById('config-timeout') as HTMLInputElement | null
const apiKeyInput = document.getElementById('config-api-key') as HTMLInputElement | null
const saveButton = document.getElementById('config-save-button') as HTMLButtonElement | null
const importInput = document.getElementById('config-import-file') as HTMLInputElement

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

function isConfigLike(value: unknown): value is Partial<LabelModelConfig> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'baseUrl' in value &&
    'model' in value &&
    'apiKey' in value
  )
}

async function importConfigFromFile(file: File) {
  const text = await file.text()
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    alert('配置文件不是有效的 JSON')
    return
  }

  if (!isConfigLike(parsed)) {
    alert('配置文件缺少必填字段：baseUrl、model、apiKey')
    return
  }

  const config: LabelModelConfig = {
    baseUrl: String(parsed.baseUrl).trim(),
    model: String(parsed.model).trim(),
    timeoutMs: Number(parsed.timeoutMs) || 0,
    apiKey: String(parsed.apiKey),
  }

  if (!config.baseUrl) {
    alert('导入失败：Base URL 不能为空')
    return
  }
  if (!config.model) {
    alert('导入失败：Model 不能为空')
    return
  }
  if (!config.apiKey) {
    alert('导入失败：API Key 不能为空')
    return
  }

  try {
    fillForm(config)
    alert('配置已导入')
  } catch {
    alert('配置导入失败')
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

  importInput.onchange = (event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) {
      return
    }
    importConfigFromFile(file).finally(() => {
      target.value = ''
    })
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
