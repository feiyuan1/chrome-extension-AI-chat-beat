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

const platformJson = json as unknown as Record<Platform, { session_url: string }>

export const findTargetSession = (platform: Platform) => {
  return platformJson[platform].session_url
}

export const actionWithDelay = async (action: (...args: any[]) => Promise<any>, delay = 3000) => {
  await action()
  await new Promise((res) => setTimeout(res, delay))
}
