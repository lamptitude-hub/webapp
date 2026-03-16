'use client'

import { BannerComponent } from '@/components/banner'
import { StepComponent } from '@/components/features/step'
import { ProductComponent } from '@/components/product'
import { useTranslate } from '@/hooks'

export default function IndexContainer() {
  // __STATE<Next.14>
  const { t } = useTranslate()

  // __RENDER
  return (
    <div className='ui--index-container'>
      <BannerComponent />
      <StepComponent index={1} />

      <div className='ui--index-body'>
        <div className='mx-auto max-w-6xl py-8'>
          <h2 className='mb-4 text-center'>{t('labelStep1')}</h2>
          <div className='flex items-center justify-center gap-3'>
            <span className='bi bi-lamp text-lg text-theme'></span>
            <span className='text-lg font-medium'>{t('labelChooseLamp')}</span>
          </div>
        </div>

        <ProductComponent />
      </div>
    </div>
  )
}
