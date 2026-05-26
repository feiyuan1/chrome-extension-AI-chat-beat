import { ReportChatsLogs } from '../adapters/logAdatper'
import { ReportChats } from '../adapters/MetricAdapter'
import { log } from '../utils/debugger'

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
    const fullData = result.fullChatHistory || []
    log('export fullChatHistory', fullData)
    const blob = new Blob([JSON.stringify(fullData)], { type: 'application/json' })
    a.href = URL.createObjectURL(blob)
    a.click()
  })
}

const createReportInput = function () {
  const input = document.getElementById('report-chat-data')
  if (!input) {
    throw new Error('cannot find report-chat-data input')
  }

  input.onchange = reportChatData
}

const reportChatData = function (event: Event) {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (!file) {
    console.error('report chat data', 'upload no file')
    return
  }
  const reader = new FileReader()
  reader.onload = function (readEvent) {
    const fullData = readEvent.target?.result as string
    if (!fullData) {
      console.error('report chat data', 'file have no content')
      return
    }
    alert('读取成功')
    const parsedData = JSON.parse(fullData)
    /**
     * TODO 其实这里的代码结构有点问题，在 adapter/utils 导出的内容被 popup 引入了
     * 按理来说，要么把这些function挪到 src/utils 要么纠正引入的function
     */
    ReportChats({ chats: parsedData, aggregate: false })
    ReportChatsLogs(parsedData)
  }

  reader.readAsText(file)
}

const exportFullDataButton = document.getElementById('full-data-button')
if (!exportFullDataButton) {
  throw new Error('cannot found button with id full-data-button')
}
exportFullDataButton.onclick = exportFullData

createReportInput()
