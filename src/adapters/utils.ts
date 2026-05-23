import { SessionMapItem, TargetEnum } from '../types'

export const session_map: { value: SessionMapItem[] } = { value: [] }

export const initSessionMap = async () => {
  const result = await chrome.storage.local.get(TargetEnum.sessionMap)
  session_map.value = result[TargetEnum.sessionMap] as SessionMapItem[]
}

export const getSessionName = (session_id: string) => {
  const target = session_map.value.find((item) => item.id === session_id)
  if (target) {
    return target.title
  }
  return 'other'
}
