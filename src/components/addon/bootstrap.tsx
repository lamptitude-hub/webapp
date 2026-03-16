'use client'

import { fromUnixTime } from 'date-fns'

import { configs } from '@/constants'
import { useLoader, useMounted } from '@/hooks'
import { AuthService, supabaseAuth } from '@/services'
import { useDispatch } from '@/store'
import { setProfile } from '@/store/user.store'
import { modal } from '@/utils/addon'
import { cookie, storage } from '@/utils/storage'

export default function Bootstrap() {
  // __STATE <Rect.Hooks>
  const loader = useLoader()
  const dispatch = useDispatch()

  // __EFFECT's
  useMounted(() => {
    supabaseAuth.onAuthStateChange((event, session) => {
      if (['SIGNED_IN', 'TOKEN_REFRESHED'].indexOf(event) > -1 && session) {
        const { access_token, refresh_token, expires_at } = session
        const expires = expires_at ? fromUnixTime(expires_at) : void 0

        cookie.set(configs.APP_AUTH_ACCESS, access_token, { expires })
        cookie.set(configs.APP_AUTH_REFRESH, refresh_token, { expires })
        modal.off('md-signin')

        AuthService.profile()
        loader.off()
      }
    })

    if (cookie.get(configs.APP_AUTH_ACCESS)) {
      const user = storage.get(configs.APP_USER_INFO, 1)
      if (user) dispatch(setProfile(user))
    }

    loader.off(1e3)
  })

  // __RENDER
  return null
}
