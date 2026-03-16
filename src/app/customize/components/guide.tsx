'use client'

import { useTranslate } from '@/hooks'

export function GuideComponent() {
  // __STATE's
  const { t } = useTranslate()

  // __RENDER
  return (
    <div className='ui--labs-guide pointer-events-none absolute bottom-8 left-8 grid select-none grid-flow-col gap-4 max-sm:bottom-2 max-sm:left-2 max-sm:gap-2'>
      <div className='flex items-center gap-1'>
        <img className='block w-5 object-contain opacity-80' src='/static/images/icons/mouse-l.png' />
        <span className='text-xs'>{t('textGuideModify')}</span>
      </div>

      <div className='flex items-center gap-1'>
        <img className='block w-5 object-contain opacity-80' src='/static/images/icons/mouse-l.png' />
        <span className='text-xs'>{t('textGuideCameraPan')}</span>
      </div>

      <div className='flex items-center gap-1 max-sm:hidden'>
        <img className='block w-5 object-contain opacity-80' src='/static/images/icons/mouse-r.png' />
        <span className='text-xs'>{t('textGuideCameraMove')}</span>
      </div>
    </div>
  )
}
