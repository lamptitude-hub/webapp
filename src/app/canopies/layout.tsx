import type { ReactNode } from 'react'

import { BannerComponent } from '@/components/banner'
import { StepComponent } from '@/components/features/step'
import '@/styles/pages/canopy.scss'

type Props = { children: ReactNode }

export default function CanopyLayout({ children }: Props) {
  // __RENDER
  return (
    <div className='ui--canopy-container'>
      <BannerComponent />
      <StepComponent index={2} />
      {children}
    </div>
  )
}
