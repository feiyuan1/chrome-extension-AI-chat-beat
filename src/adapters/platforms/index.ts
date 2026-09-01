import { Platform } from '../../types'
import { AdaptResult } from '../../types/adapter'
import * as ChatGLMAdapter from './chatglm'
import * as ChatGPTAdapter from './chatgpt'
import * as DeepseekAdapter from './deepseek'
import * as DoubaoAdapter from './doubao'
import * as KimiAdapter from './kimi'
import * as QianwenAdapter from './qianwen'
import * as YuanbaoAdapter from './yuanbao'
import * as YiyanAdapter from './yiyan'

export function getPlatformChatAdapter(platform: Platform): (data: any) => AdaptResult {
  switch (platform) {
    case Platform.deepseek:
      return DeepseekAdapter.ChatDataAdapter
    case Platform.yuanbao:
      return YuanbaoAdapter.ChatDataAdapter
    case Platform.qianwen:
      return QianwenAdapter.ChatDataAdapter
    case Platform.yiyan:
      return YiyanAdapter.ChatDataAdapter
    case Platform.chatglm:
      return ChatGLMAdapter.ChatDataAdapter
    case Platform.doubao:
      return DoubaoAdapter.ChatDataAdapter
    case Platform.kimi:
      return KimiAdapter.ChatDataAdapter
    case Platform.chatgpt:
      return ChatGPTAdapter.ChatDataAdapter
    default:
      throw new Error(`unsupported platform: ${platform}`)
  }
}
