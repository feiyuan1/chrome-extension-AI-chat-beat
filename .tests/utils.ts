import { type BrowserContext, type ConsoleMessage, type Page } from '@playwright/test'
import diffJson from './diff-in-multi-platform.json' with { type: 'json' }
import json from './platform-info.json' with { type: 'json' }

export enum Platform {
  deepseek = 'deepseek',
  yuanbao = 'yuanbao',
  qianwen = 'qianwen',
  yiyan = 'yiyan',
  chatglm = 'chatglm',
  doubao = 'doubao',
  kimi = 'kimi',
  chatgpt = 'chatgpt',
}

export interface SelectorConfig {
  type: 'css' | 'playwright-css'
  selector: string
}

export interface PlatformConfig {
  pageHost: string
  selectors: {
    promptInput: SelectorConfig
    imageUpload: SelectorConfig
    addAttachment?: SelectorConfig
    [key: string]: SelectorConfig | undefined
  }
  uploadSuccess: {
    image: SelectorConfig
  }
  sessionUrl: string
}

const platformJson = json as unknown as Record<Platform, { session_url: string }>

export const EXT_ID = 'khjpcbcpdhcaecfdnogipfmlgefhgipo'

export const findTargetSession = (platform: Platform) => {
  return platformJson[platform].session_url
}

export const actionWithDelay = async (action: (...args: any[]) => Promise<any>, delay = 3000) => {
  await action()
  await new Promise((res) => setTimeout(res, delay))
}

export const collectConsoleMessages = (page: Page) => {
  const messages: string[] = []
  const handler = (msg: ConsoleMessage) => {
    messages.push(msg.text())
  }
  page.on('console', handler)
  return {
    getMessages: () => messages,
    clear: () => {
      messages.length = 0
    },
    dispose: () => {
      page.off('console', handler)
    },
  }
}

export const findAIChatBeatExtensionWorker = (extensionContext: BrowserContext) => {
  return extensionContext.serviceWorkers().find((sw) => {
    const url = sw.url()
    return url.startsWith('chrome-extension://') && url.includes(EXT_ID)
  })
}

export const getPlatformConfigs = (): Record<Platform, PlatformConfig> => {
  const configs = {} as Record<Platform, PlatformConfig>
  for (const item of diffJson.platforms) {
    const platform = item.platform as Platform
    configs[platform] = {
      pageHost: item.pageHost,
      selectors: item.selectors as PlatformConfig['selectors'],
      uploadSuccess: item.uploadSuccess as PlatformConfig['uploadSuccess'],
      sessionUrl: platformJson[platform].session_url,
    }
  }
  return configs
}

export const getPopupUrl = () => `chrome-extension://${EXT_ID}/popup.html`

export const TEST_PROMPT = 'AI-chat-beat playwright test prompt'
export const TEST_IMAGE_PATH = '.tests/assets/image.png'

export const cleanTargetLog = async (target: { evaluate: (...args: any[]) => Promise<any> }) =>
  target.evaluate(() => console.clear())
