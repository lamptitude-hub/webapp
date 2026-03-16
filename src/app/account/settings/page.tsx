'use client'

import { FormProfileComponent } from '@/components/forms/profile'
import { useTranslate } from '@/hooks'

export default function SettingContainer() {
  // __STATE<Next.14>
  const { t } = useTranslate()

  // __RENDER
  return (
    <div className='ui--account-setting'>
      <div className='grid grid-flow-col items-center justify-start gap-3'>
        <span className='icon bi bi-gear text-2xl text-theme'></span>
        <h3 className='text-2xl'>{t('btnSetting')}</h3>
      </div>

      <FormProfileComponent />
    </div>
  )
}
