import type { Metadata, Viewport } from 'next'
import { APP_WEB_TITLE } from './configs'

export const metadata: Metadata = {
  title: APP_WEB_TITLE,
  description:
    'Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!',
  robots: { index: false, follow: false },
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/static/apple-touch-icon.png' }
  ],
  manifest: '/manifest.webmanifest'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' }
  ]
}
