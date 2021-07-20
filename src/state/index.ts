import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import transactions from './transactions/reducer'
import swap from './swap/reducer'
import mint from './mint/reducer'
import mintV3 from './mint/v3/reducer'
import lists from './lists/reducer'
import burn from './burn/reducer'
import burnV3 from './burn/v3/reducer'
import logs from './logs/slice'
import multicall from './multicall/reducer'
import { api as dataApi } from './data/slice'
import { routingApi as routingApi } from './routing/slice'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    mint,
    mintV3,
    burn,
    burnV3,
    multicall,
    lists,
    logs,
    [dataApi.reducerPath]: dataApi.reducer,
    [routingApi.reducerPath]: routingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true })
      .concat(dataApi.middleware)
      .concat(routingApi.middleware)
      .concat(save({ states: PERSISTED_KEYS, debounce: 1000 })),
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
