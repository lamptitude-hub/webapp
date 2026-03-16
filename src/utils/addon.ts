import { addSeconds } from 'date-fns'
import { dispatch } from '@/store'
import { setDialog, setModal, setNotice } from '@/store/app.store'
import type {
  Dialog,
  DialogContent,
  DialogOptions,
  DialogResults,
  Modal,
  ModalContent,
  ModalOptions,
  Notice,
  NoticeContent,
  NoticeOptions
} from '@/types/addon'

export async function dialog(content: DialogContent, options?: DialogOptions): Promise<DialogResults> {
  return new Promise((resolve) => {
    const action = setDialog({
      visible: true,
      content,
      resolve,
      ...options
    })

    dispatch(action)
  })
}

export class modal {
  static on(content: ModalContent, options?: ModalOptions) {
    const vid = options?.className || Math.random().toString(16).slice(2)
    const action = setModal({
      vid,
      content,
      visible: true,
      className: options?.className,
      allowEscape: options?.allowEscape || true
    })

    dispatch(action)
  }

  static off(vid: string) {
    const action = setModal({
      vid,
      visible: false,
      content: null
    })

    dispatch(action)
  }
}

export class notice {
  static on(option: Notice) {
    const name = option.name || Math.random().toString(16).slice(2)
    const title = option.title || "Notification's"
    const duration = option.duration !== 0 ? +addSeconds(Date.now(), option.duration || 3) : undefined

    dispatch(
      setNotice({
        ...option,
        visible: true,
        name,
        title,
        duration
      })
    )

    return name
  }

  static info(content: NoticeContent, option?: NoticeOptions) {
    return this.on({
      type: 'info',
      title: '',
      content,
      ...option
    })
  }

  static success(content: NoticeContent, option?: NoticeOptions) {
    return this.on({
      type: 'success',
      title: '',
      content,
      ...option
    })
  }

  static warn(content: NoticeContent, option?: NoticeOptions) {
    return this.on({
      type: 'warn',
      title: '',
      content,
      ...option
    })
  }

  static error(content: NoticeContent, option?: NoticeOptions) {
    return this.on({
      type: 'error',
      title: '',
      content,
      ...option
    })
  }

  static close(name: string) {
    const payload = setNotice({
      name: `rm:${name}`,
      type: 'info',
      title: '',
      content: null,
      visible: false
    })

    dispatch(payload)
  }

  static clear() {}
}
