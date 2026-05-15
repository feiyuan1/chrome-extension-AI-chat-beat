import { WebSocketServer, WebSocket } from 'ws'
import chokidar from 'chokidar'
import { resolve } from 'path'
import { Stats } from 'fs'

const wsServer = new WebSocketServer({ port: 8000 })
let clients: WebSocket[] = []

wsServer.on('connection', (wsClient) => {
  clients.push(wsClient)
  console.log('clients length', clients.length)
  wsClient.on('close', () => {
    clients = clients.filter((client) => client !== wsClient)
  })
})

const watcher = chokidar.watch(resolve(process.cwd(), './build'))

type watcherCallback = (path: string, stats?: Stats | undefined) => void

const throttle = <T extends (...args: any) => any>(fn: T, delay: number = 1000) => {
  let timer: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

watcher.on(
  'change',
  throttle<watcherCallback>((path: string) => {
    console.log(`文件变化: ${path}`)
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send('reload')
      }
    })
  }),
)
