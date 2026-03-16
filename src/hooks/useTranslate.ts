import { useCallback, useMemo } from 'react'

import { dispatch, useSelector } from '@/store'
import { setLanguage } from '@/store/app.store'
import type { Locales } from '@/types'

export function useTranslate() {
  // __STATE's
  const lang = useSelector(({ app }) => app.lang)
  const translate = useSelector(({ app }) => app.translate)

  // __FUNCTION's
  const handleTranslate = useCallback(
    (keyName: string) => {
      let t = translate[lang]?.[keyName]

      if (!t && lang !== 'th-TH') {
        t = translate['th-TH']?.[keyName]
      }

      return t || `{${keyName}}`
    },
    [lang, translate]
  )

  const handleLocaleChange = useCallback((lang: Locales) => {
    document.documentElement.setAttribute('lang', lang)
    dispatch(setLanguage(lang))
  }, [])

  // __RENDER
  return useMemo(() => {
    return {
      lang,
      t: handleTranslate,
      switch: handleLocaleChange
    }
  }, [lang, handleTranslate, handleLocaleChange])
}
