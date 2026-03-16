import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'

import { Theme } from '@/constants'
import { setTheme } from '@/store/app.store'

export function useTheme() {
  // __STATE <Next.14>
  const dispatch = useDispatch()

  // __FUNCTION's
  const get = useCallback(() => {
    return document.documentElement.getAttribute('theme') as Theme
  }, [])

  const set = useCallback((theme: Theme) => {
    document.documentElement.setAttribute('theme', theme)
    dispatch(setTheme(theme))
  }, [])

  const remove = useCallback(() => {
    document.documentElement.removeAttribute('theme')
    dispatch(setTheme(Theme.DEFAULT))
  }, [])

  // __EFFECT's
  useEffect(() => {
    const currentTheme = get() || Theme.DEFAULT
    set(currentTheme)
  }, [])

  // __RETURN
  return useMemo(() => {
    return {
      get,
      set,
      remove
    }
  }, [get, set, remove])
}
