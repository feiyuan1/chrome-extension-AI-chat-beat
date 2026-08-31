import { Platform } from '../../types'

export const PLATFORM_HOSTS: Record<Platform, string[]> = {
  [Platform.deepseek]: ['chat.deepseek.com'],
  [Platform.yuanbao]: ['yuanbao.tencent.com'],
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
