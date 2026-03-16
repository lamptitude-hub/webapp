import type { ReactNode } from 'react'
import { DialogName, ModalName, NoticeName } from '@/constants'

export type DialogContent = ReactNode | DialogName
export type ModalContent = ReactNode | ModalName
export type NoticeContent = ReactNode | NoticeName
export type NoticeTypes = 'info' | 'success' | 'warn' | 'error'

export interface Dialog {
  visible: boolean
  type?: 'alert' | 'confirm'
  title?: string
  content: DialogContent
  confirmLabel?: string
  cancelLabel?: string
  resolve?: (value: DialogResults | PromiseLike<DialogResults>) => void
}

export interface Modal {
  vid: string
  visible: boolean
  className?: string
  allowEscape?: boolean
  content: ModalContent
}

export interface Notice {
  visible?: boolean
  name?: string
  type: NoticeTypes
  title: string
  content: NoticeContent
  duration?: number
}

export interface DialogResults {
  isConfirmed: boolean
  isDenied: boolean
}

export interface DialogOptions extends Omit<Dialog, 'visible' | 'content' | 'resolve'> {}

export interface ModalOptions extends Pick<Modal, 'className' | 'allowEscape'> {}

export interface NoticeOptions extends Pick<Notice, 'name' | 'duration'> {
  title?: string
}
