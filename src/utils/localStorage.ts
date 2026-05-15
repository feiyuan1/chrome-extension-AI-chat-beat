import { STORAGE_KEY } from '../constants'
import { LocalStorageData, LocalStoragekeys } from '../types/LocalStorage'

export const getLocalStorage = <Key extends LocalStoragekeys>(key: Key) => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    return null
  }
  const jsonedData = JSON.parse(data) as LocalStorageData
  return jsonedData[key]
}

export const setLocalStorage = <Key extends LocalStoragekeys>(
  key: Key,
  value: LocalStorageData[Key],
) => {
  const oldData = localStorage.getItem(STORAGE_KEY)
  const data = Object.assign({}, oldData && JSON.parse(oldData), { [key]: value })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
