import { createAction, createReducer } from '@reduxjs/toolkit'
import { Theme } from '@/constants'
import { APP_LANG } from '@/constants/configs'
import { cookie } from '@/utils/storage'
import { initLang } from '@/utils/translate'
import type { Locales } from '@/types'
import type { Dialog, Modal, Notice } from '@/types/addon'

import enUS from '@/constants/locales/en-US.json'
import thTH from '@/constants/locales/th-TH.json'

/**
 * STATE
 */
export interface AppState {
  appVersion: string
  lang: Locales
  theme: Theme
  loader: boolean
  dialog?: Dialog
  modal?: Record<any, Modal>
  notice?: Record<any, Notice>
  translate: Record<Locales, Record<string, string>>
}

export const initialState: AppState = {
  appVersion: 'v0.1-beta (April, 2023)',
  lang: initLang('th-TH'),
  theme: Theme.DARK,
  loader: true,
  translate: {
    'en-US': enUS,
    'th-TH': thTH
  }
}

/**
 * ACTION's
 */
export enum ActionTypes {
  SET_LANG = 'SET_APP_LANGUAGE',
  SET_THEME = 'SET_APP_THEME',
  SET_LOADER = 'SET_APP_LOADER',
  SET_DIALOG = 'SET_APP_DIALOG',
  SET_MODALS = 'SET_APP_MODALS',
  SET_NOTICE = 'SET_APP_NOTICE'
}

export const setLanguage = createAction<Locales, ActionTypes>(ActionTypes.SET_LANG)
export const setTheme = createAction<Theme, ActionTypes>(ActionTypes.SET_THEME)
export const setLoader = createAction<boolean, ActionTypes>(ActionTypes.SET_LOADER)
export const setDialog = createAction<Dialog, ActionTypes>(ActionTypes.SET_DIALOG)
export const setModal = createAction<Modal, ActionTypes>(ActionTypes.SET_MODALS)
export const setNotice = createAction<Notice | null, ActionTypes>(ActionTypes.SET_NOTICE)

/**
 * REDUCER's
 */
export default createReducer(initialState, (builder) => {
  return builder
    .addCase(setLanguage, (state, { payload }) => {
      cookie.set(APP_LANG, payload)
      state.lang = payload
    })

    .addCase(setTheme, (state, { payload }) => {
      state.theme = payload
    })

    .addCase(setLoader, (state, { payload }) => {
      state.loader = payload
    })

    .addCase(setDialog, (state, { payload }) => {
      state.dialog = {
        type: payload?.type || 'alert',
        confirmLabel: payload?.confirmLabel || 'OK',
        cancelLabel: payload?.cancelLabel || 'Cancel',
        resolve: payload?.resolve,
        ...payload
      }
    })

    .addCase(setModal, (state, { payload }) => {
      if (state.modal) {
        const regex = /^rm:|remove:/g
        const vid = payload.vid.replace(regex, '').trim()

        const modals = Object.values(state.modal)
        let draft: Record<number, Modal> = {}

        if (regex.test(payload.vid)) {
          modals.forEach((record, index) => {
            if (record.vid !== vid) {
              draft[index] = record
            }
          })
        } else {
          if (!payload.visible) {
            modals.forEach((record, index) => {
              if (record.vid === vid) {
                record.visible = payload.visible
              }

              draft[index] = record
            })
          } else {
            const nextKey = Object.keys(state.modal).length
            draft = state.modal
            draft[nextKey] = payload
          }
        }

        state.modal = draft
      } else {
        state.modal = { 0: payload }
      }
    })

    .addCase(setNotice, (state, { payload }) => {
      if (state.notice) {
        if (payload) {
          const regex = /^rm:|remove:/g
          const name = payload.name!.replace(regex, '').trim()

          const notices = Object.values(state.notice)
          let draft: Record<number, Notice> = {}

          if (regex.test(payload.name!)) {
            notices.forEach((record, index) => {
              if (record.name !== name) {
                draft[index] = record
              }
            })
          } else {
            const nextKey = Object.keys(state.notice).length
            draft = state.notice
            draft[nextKey] = payload
          }

          state.notice = draft
        } else {
          state.notice = void 0
        }
      } else {
        if (payload) state.notice = { 0: payload }
      }
    })
})
