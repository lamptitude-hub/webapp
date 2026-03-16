import { APP_DATASET } from '@/constants/configs'

import { storage } from './storage'

export class dataset {
  static get<T = any>() {
    return storage.get(APP_DATASET, 1)
  }

  static set(value: string | object) {
    storage.set(APP_DATASET, value)
  }

  static remove() {
    storage.remove(APP_DATASET)
  }
}
