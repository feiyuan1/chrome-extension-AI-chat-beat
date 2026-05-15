import { STORAGE_KEY } from '../constants'
import { SessionStorageData, SessionStoragekeys } from '../types/sessionStorage'

// export const getSessionStorage = <Key extends SessionStoragekeys>(key: Key) => {
//   const data = sessionStorage.getItem(STORAGE_KEY)
//   if (!data) {
//     return null
//   }
//   const jsonedData = JSON.parse(data) as SessionStorageData
//   return jsonedData[key]
// }

// export const setSessionStorage = <Key extends SessionStoragekeys>(
//   key: Key,
//   value: SessionStorageData[Key],
// ) => {
//   const oldData = sessionStorage.getItem(STORAGE_KEY)
//   const data = Object.assign({}, oldData && JSON.parse(oldData), { [key]: value })
//   sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
// }
