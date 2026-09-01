import { Platform } from '../../types'
import { AdaptError, AdaptResult, AdaptSuccess, AdapterResultStatus } from '../../types/adapter'

export const PLATFORM_HOSTS: Record<Platform, string[]> = {
  [Platform.deepseek]: ['chat.deepseek.com'],
  [Platform.yuanbao]: ['yuanbao.tencent.com'],
  [Platform.qianwen]: ['www.qianwen.com'],
  [Platform.yiyan]: ['wenxin.baidu.com'],
  [Platform.chatglm]: ['www.chatglm.cn', 'chatglm.cn'],
  [Platform.doubao]: ['www.doubao.com'],
  [Platform.kimi]: ['www.kimi.com'],
  [Platform.chatgpt]: ['chatgpt.com'],
  [Platform.unknown]: [],
}

export function detectPlatform(url: string | URL): Platform {
  const host = url instanceof URL ? url.hostname : new URL(url).hostname
  for (const [platform, hosts] of Object.entries(PLATFORM_HOSTS)) {
    if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return platform as Platform
    }
  }
  return Platform.unknown
}

export function parseChatRequestBody(platform: Platform, body: unknown): any {
  if (typeof body === 'string') {
    return JSON.parse(body)
  }
  if (body instanceof Uint8Array) {
    const text = new TextDecoder().decode(body)
    return JSON.parse(text)
  }
  throw new Error(`unsupported body type for platform: ${platform}`)
}

export function createPlatformError(platform: Platform) {
  return function (message: unknown): AdaptError {
    return {
      status: AdapterResultStatus.error,
      message,
      platform,
    }
  }
}

export function createSuccess<T>(data: T): AdaptSuccess<T> {
  return {
    status: AdapterResultStatus.success,
    data,
  }
}

export function createAdapterErrorBoundary<T extends AdaptResult>(
  id: string,
  innerScript: (...args: any[]) => T,
) {
  return (...args: any[]) => {
    try {
      return innerScript(...args)
    } catch (err) {
      const errorResult = {
        status: AdapterResultStatus.error,
        message: `${id}: ${err}`,
      } as T

      return errorResult
    }
  }
}
