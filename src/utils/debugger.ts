import { DEBUGGER_ID } from '../constants'

export const log = (...args: unknown[]) => {
  console.log(DEBUGGER_ID, ...args)
}

export const consoleError = (...args: unknown[]) => {
  console.error(DEBUGGER_ID, ...args)
}
