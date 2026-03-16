import { createAction, createReducer } from '@reduxjs/toolkit'
import { Roles } from '@/constants'
import type { User } from '@/types/schema'

/**
 * STATE
 */
export interface UserState extends Partial<User> {}

export const initialState: UserState = {
  id: 0,
  role: Roles.GUEST,
  avatar: '',
  displayName: '',
  email: ''
}

/**
 * ACTION's
 */
export enum ActionTypes {
  SET_PROFILE = 'SET_USER_PROFILE'
}

export const setProfile = createAction<Partial<User>, ActionTypes>(ActionTypes.SET_PROFILE)

/**
 * REDUCER's
 */
export default createReducer(initialState, (builder) => {
  return builder.addCase(setProfile, (state, { payload }) => {
    Object.assign(state, payload)
  })
})
