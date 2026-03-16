'use client'

import { FormPWDComponent } from '@/components/forms/password'
import { useTranslate } from '@/hooks'

export default function PWDContainer() {
  // __STATE<Next.14>
  const { t } = useTranslate()

  // __RENDER
  return (
    <div className='ui--account-pwd'>
      <div className='grid grid-flow-col items-center justify-start gap-3'>
        <span className='icon bi bi-lock text-2xl text-theme'></span>
        <h3 className='text-2xl'>{t('btnChangePassword')}</h3>
      </div>

      <FormPWDComponent />
    </div>
  )
}
