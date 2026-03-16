import type { ReactNode } from 'react'
import { AsideComponent } from '@/components/features/account/aside'
import '@/styles/pages/account.scss'

type Props = { children: ReactNode }

export default function AccountLayout({ children }: Props) {
  // __STATE<Next.14>

  // __RENDER
  return (
    <div className='ui--account-container mx-auto mt-10 grid rounded-2xl p-4 max-sm:mt-0 max-sm:block max-sm:p-0'>
      <div className='ui--account-menu overflow-x-auto'>
        <AsideComponent />
      </div>

      <div className='ui--account-context p-4 pl-8 max-sm:border-t max-sm:border-neutral-200 max-sm:px-4 max-sm:pt-8'>
        {children}
      </div>
    </div>
  )
}
