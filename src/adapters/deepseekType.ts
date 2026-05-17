import { SessionMapItem } from '../types'

export interface FetchSessionMapResponse {
  data: { biz_data: { chat_sessions: SessionMapItem[] } }
}
