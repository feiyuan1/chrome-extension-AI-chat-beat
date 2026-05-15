import { TargetEnum } from '../types'
import { log } from '../utils/debugger'

const createExportCoreAnchorElement = function () {
  const a = document.createElement('a')
  a.innerText = 'export core data'
  a.download = 'core-data.json'
  a.style = 'font-size: 16px; display: none'
  return a
}

const exportCoreData = function () {
  const a = createExportCoreAnchorElement()
  chrome.storage.local.get(['coreChatHistory'], (result) => {
    const coreData = result.coreChatHistory?.data || []
    log('export coreChatHistory', coreData)
    const blob = new Blob([JSON.stringify(coreData)], { type: 'application/json' })
    a.href = URL.createObjectURL(blob)
    a.click()
  })
}

const createExportFullAnchorElement = function () {
  const a = document.createElement('a')
  a.innerText = 'export full data'
  a.download = 'full-data.json'
  a.style = 'font-size: 16px; display: none'
  return a
}

const exportFullData = function () {
  const a = createExportFullAnchorElement()
  chrome.storage.local.get(['fullChatHistory'], (result) => {
    const fullData = result.fullChatHistory?.data || []
    log('export fullChatHistory', fullData)
    const blob = new Blob([JSON.stringify(fullData)], { type: 'application/json' })
    a.href = URL.createObjectURL(blob)
    a.click()
  })
}

const createCoreInput = function () {
  const input = document.getElementById('sync-core-data')
  if (!input) {
    throw new Error('cannot find sync-core-data input')
  }

  input.onchange = syncCoreData
}

const syncCoreData = function (event: Event) {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (!file) {
    console.error('sync core data', 'upload no file')
    return
  }
  const reader = new FileReader()
  reader.onload = function (readEvent) {
    const coreData = readEvent.target?.result as string
    if (!coreData) {
      console.error('sync core data', 'file have no content')
      return
    }
    alert('读取成功')
    chrome.storage.local
      .get(TargetEnum.coreChatHistory)
      .then((result) => {
        return result.coreChatHistory?.data
      })
      .then((coreChatHistory) => {
        if (coreChatHistory && coreChatHistory.length > 0) {
          return window.confirm(
            `当前已有存储数据，最新数据的 index: ${coreChatHistory.at(-1).index}，确认要覆盖吗？`,
          )
        }
        return true
      })
      .then((canSync) => {
        if (canSync) {
          chrome.storage.local.set({ coreChatHistory: { data: JSON.parse(coreData) } }).then(() => {
            alert('AIChatBeat sync success')
          })
        }
      })
  }

  reader.readAsText(file)
}

const exportCoreDataButton = document.getElementById('core-data-button')
if (!exportCoreDataButton) {
  throw new Error('cannot found button with id core-data-button')
}
exportCoreDataButton.onclick = exportCoreData

const exportFullDataButton = document.getElementById('full-data-button')
if (!exportFullDataButton) {
  throw new Error('cannot found button with id full-data-button')
}
exportFullDataButton.onclick = exportFullData

createCoreInput()
