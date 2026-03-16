import type { ReactNode } from 'react'
import '@/styles/pages/summary.scss'

type Props = { children: ReactNode }

export default function SummaryLayout({ children }: Props) {
  // __STATE<Next.14>

  // __RENDER
  return (
    <div className='ui--summary-container mx-auto mt-10 grid rounded-2xl p-8 max-sm:mt-0 max-sm:p-4'>{children}</div>
  )
}
