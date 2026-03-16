import { Roles, configs } from '@/constants'
import { dispatch } from '@/store'
import { setProfile } from '@/store/user.store'
import { cookie, storage } from '@/utils/storage'
import type { FormRegister } from '@/types/form'
import type { User } from '@/types/schema'

import axios from '../axios'
import { tryCatch } from '../catch'
import { supabaseAuth } from '../supabase'

export class AuthService {
  /**
   * Register service.
   *
   * @param data FormRegister
   */
  static async register(data: FormRegister) {
    try {
      const formData = {
        email: data.email,
        password: data.password,
        phoneNo: data.phoneNo,
        displayName: `${data.firstName} ${data.lastName}`,
        gender: data.gender
      }

      const response = await axios.post(`/users`, formData)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`AuthService.register`', error)
    }
  }

  /**
   * GET user profile.
   */
  static async profile() {
    try {
      const response = await axios.get<User>(`/v2/users/profile`)
      if (response.data) {
        storage.set(configs.APP_USER_INFO, response.data)
        dispatch(setProfile(response.data))
      }
    } catch (error) {
      tryCatch('`AuthService.profile`', error)
    }
  }

  static async update(data: FormRegister) {
    try {
      const formData = {
        displayName: `${data.firstName} ${data.lastName}`,
        phoneNo: data.phoneNo,
        gender: data.gender
      }

      const response = await axios.patch(`/v2/users/profile`, formData)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`AuthService.register`', error)
    }
  }

  /**
   * Destroy all browser session.
   *
   * @param cb Callback function.
   */
  static async logout(cb?: () => void) {
    await supabaseAuth.signOut()

    cookie.remove(configs.APP_AUTH_ACCESS)
    cookie.remove(configs.APP_AUTH_REFRESH)
    storage.remove(configs.APP_USER_INFO)

    dispatch(
      setProfile({
        id: 0,
        role: Roles.GUEST,
        avatar: '',
        displayName: '',
        email: ''
      })
    )

    if (cb) setTimeout(() => cb(), 64)
  }
}
