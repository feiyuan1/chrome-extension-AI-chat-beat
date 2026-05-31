import { log, consoleError } from '../utils/debugger'

export const startWsClient = () => {
  const wsClient = new WebSocket('ws://localhost:8000')

  wsClient.onmessage = (event: MessageEvent) => {
    if (event.data === 'reload') {
      log('收到刷新信号，重启扩展.')
      chrome.runtime.reload()
    }
  }
  wsClient.onopen = () => {
    log('connected to wsserver')
  }

  wsClient.onclose = () => {
    log('connection with wsserver is closed..')
    setTimeout(() => {
      startWsClient()
    }, 1000)
  }

  wsClient.onerror = (error) => {
    consoleError('ERROR', error)
  }
}
