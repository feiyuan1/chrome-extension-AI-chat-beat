import { Platform } from '../../types'
import { AdaptResult } from '../../types/adapter'
import * as DeepseekAdapter from './deepseek'
import * as YuanbaoAdapter from './yuanbao'

export function getPlatformChatAdapter(platform: Platform): (data: any) => AdaptResult {
  switch (platform) {
    case Platform.deepseek:
      return DeepseekAdapter.ChatDataAdapter
    case Platform.yuanbao:
      return YuanbaoAdapter.ChatDataAdapter
    default:
      throw new Error(`unsupported platform: ${platform}`)
  }
}
