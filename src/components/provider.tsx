'use client'

import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import cls from 'classnames'

import { AddonProvider } from '@/components'
import ReduxStore from '@/store'

import { NavigatorComponent } from './layout/navigator'

type ProviderProps = { node: ReactNode }

export function AppProvider({ node }: ProviderProps) {
  // __STATE<Next.14>
  const pathname = usePathname()
  const protectedPage = pathname.startsWith('/account')

  const [queryClient] = useState(() => new QueryClient())

  // __RENDER
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={ReduxStore}>
        <AddonProvider.Bootstrap />

        <div className='ui--app-container'>
          <div className='bg-[#252525] px-4 py-2 text-center text-white'>
            <span className='font-bold uppercase'>TURN ON YOUR ATTITUDE</span>
          </div>

          <NavigatorComponent />

          <main className='ui--router-view'>{node}</main>

          <AddonProvider.Loader />
          <AddonProvider.Dialog />
          <AddonProvider.Modal />
          <AddonProvider.Notice />
        </div>
      </Provider>
    </QueryClientProvider>
  )
}
