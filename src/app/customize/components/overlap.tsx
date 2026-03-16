'use client'

import { useTranslate } from '@/hooks'

export function OverlapComponent() {
  // __STATE's
  const { t } = useTranslate()

  // __RENDER
  return (
    <div className='pointer-events-none absolute left-1/2 top-16 -translate-x-1/2'>
      <div className='grid grid-flow-row justify-center rounded bg-red-100/50 px-6 py-2 text-center ring-1 ring-red-200 backdrop-blur-xl'>
        <span className='bi bi-exclamation-triangle-fill text-4xl text-red-600'></span>
        <span className='text-lg font-semibold text-red-700'>{t('noticeObjectOverlapped')}</span>
      </div>
    </div>
  )
}
