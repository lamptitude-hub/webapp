import { ModalName } from '@/constants'
import type { Modal } from '@/types/addon'

export function getCurrentContant({ content }: Modal) {
  switch (content) {
    default:
      return content
  }
}
