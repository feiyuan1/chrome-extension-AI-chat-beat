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
  const label = document.createElement('label')
  label.innerText = 'sync core data'
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = syncCoreData
  document.body.appendChild(label)
  document.body.appendChild(input)
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
    chrome.storage.local.set({ coreChatHistory: { data: JSON.parse(coreData) } }).then(() => {
      alert('AIChatBeat sync success')
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
