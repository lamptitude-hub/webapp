import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { configs } from '@/constants'
import { AuthService } from '@/services'
import { supabaseAuth } from '@/services/supabase'
import { useSelector } from '@/store'
import { cookie } from '@/utils/storage'

export function useAuth() {
  // __STATE <Next.14>
  const router = useRouter()
  const user = useSelector(({ user }) => user)

  // __RETURN
  return useMemo(
    () => ({
      ...user,
      isAuth: () => {
        const accessToken = cookie.get(configs.APP_AUTH_ACCESS)
        return user.id && accessToken ? true : false
      },
      signOut: async () => {
        await supabaseAuth.signOut()
        AuthService.logout(() => {
          location.assign(`/`)
        })
      }
    }),
    [router, user]
  )
}
