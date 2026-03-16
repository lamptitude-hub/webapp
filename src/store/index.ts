import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useSelector as useReduxSelector, useDispatch as useReduxDispatch, TypedUseSelectorHook } from 'react-redux'
import { configs } from '@/constants'

import app from './app.store'
import user from './user.store'

const createReducer = combineReducers({
  app,
  user
})

const createStore = configureStore({
  reducer: createReducer,
  devTools: configs.isDevelop,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false })
  }
})

type StoreTypes = ReturnType<typeof createStore.getState>
type StoreDispatch = typeof createStore.dispatch

export const useSelector: TypedUseSelectorHook<StoreTypes> = useReduxSelector
export const useDispatch = () => useReduxDispatch<StoreDispatch>()

export const dispatch = createStore.dispatch
export default createStore
