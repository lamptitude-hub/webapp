import cls from 'classnames'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import type { ReactNode } from 'react'

import { AppProvider } from '@/components/provider'
import { SUPABASE_URL } from '@/constants/configs'
import '@/styles/main.scss'

type Props = { children: ReactNode }

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const notoSansThai = Noto_Sans_Thai({
  subsets: ['latin', 'thai'],
  display: 'swap',
  variable: '--font-noto-sans-thai'
})

export { metadata, viewport } from '@/constants/metadata'

export default function RootLayout({ children }: Props) {
  // __RENDER
  return (
    <html lang='th-TH' className='m-0 bg-white text-black' style={{ colorScheme: 'light' }}>
      <head>
        <link rel='preconnect' href={SUPABASE_URL} crossOrigin='anonymous' />
        <link rel='preconnect' href='https://cdn.jsdelivr.net' crossOrigin='anonymous' />
        <link
          rel='stylesheet'
          href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
        />
      </head>

      <body
        className={cls(
          inter.variable,
          notoSansThai.variable,
          'm-0 overflow-x-hidden bg-white font-primary text-sm text-black antialiased'
        )}
        style={{ backgroundColor: '#ffffff', textRendering: 'optimizeLegibility' }}>
        <AppProvider node={children} />
      </body>
    </html>
  )
}
