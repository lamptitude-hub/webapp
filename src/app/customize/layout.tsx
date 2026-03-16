'use client'

import type { ReactNode } from 'react'

import { BannerComponent } from '@/components/banner'
import { StepComponent } from '@/components/features/step'
import { useTranslate } from '@/hooks'

type Props = { children: ReactNode }

export default function CustomizeLayout({ children }: Props) {
  // __STATE's
  const { t } = useTranslate()

  // __RENDER
  return (
    <div className='ui--customize-container'>
      <BannerComponent />
      <StepComponent index={3} />

      <div className='mx-auto max-w-6xl py-8'>
        <h2 className='mb-4 text-center'>{t('labelStep3')}</h2>
        <div className='flex items-center justify-center gap-3'>
          <img className='w-8' src='/static/images/icons/lightbulb.svg' alt='' />

          <span className='text-lg font-medium'>{t('labelChooseCustomLamp')}</span>
        </div>
      </div>

      {children}
    </div>
  )
}
