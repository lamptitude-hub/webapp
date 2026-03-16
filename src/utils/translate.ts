import { APP_LANG, isBrowser } from '@/constants/configs'
import type { Locales } from '@/types'

import { cookie } from './storage'

export function initLang(lang: Locales = 'en-US') {
  if (isBrowser) {
    lang = cookie.get(APP_LANG) || lang

    document.documentElement.setAttribute('lang', lang)
    cookie.set(APP_LANG, lang)
  }

  return lang
}
