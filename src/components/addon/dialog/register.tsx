import { DialogName } from '@/constants'
import type { Dialog } from '@/types/addon'

export function getCurrentContant({ content }: Dialog) {
  switch (content) {
    case DialogName.SYSTEM_ALERT:
      return <i>ChildrenNode</i>

    default:
      if (typeof content === 'string')
        return <div className='_dangerously' dangerouslySetInnerHTML={{ __html: content }}></div>
      else return content
  }
}
