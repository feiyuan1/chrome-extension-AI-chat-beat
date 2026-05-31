import { Platform } from '.'

export enum AdapterResultStatus {
  success,
  error,
}

export interface AdaptError {
  status: AdapterResultStatus.error
  message: unknown
  platform: Platform
}

export type AdaptSuccess<T extends any = any> = {
  status: AdapterResultStatus.success
  data: T
}

export type AdaptResult<T extends any = any> = AdaptError | AdaptSuccess<T>
