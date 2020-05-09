import { createReducer, nanoid } from '@reduxjs/toolkit'
import React from 'react'
import { addPopup, removePopup, toggleUserAdvanced, toggleWalletModal, updateBlockNumber } from './actions'

type PopupList = Array<{ key: string; show: boolean; content: React.ReactElement }>

interface ApplicationState {
  blockNumber: { [chainId: number]: number }
  popupList: PopupList
  walletModalOpen: boolean
  userAdvanced: boolean
}

export default createReducer(
  {
    blockNumber: {},
    popupList: [],
    walletModalOpen: false,
    userAdvanced: false
  } as ApplicationState,
  builder =>
    builder
      .addCase(updateBlockNumber, (state, action) => {
        const { networkId, blockNumber } = action.payload
        state.blockNumber[networkId] = blockNumber
      })
      .addCase(toggleUserAdvanced, state => {
        state.userAdvanced = !state.userAdvanced
      })
      .addCase(toggleWalletModal, state => {
        state.walletModalOpen = !state.walletModalOpen
      })
      .addCase(addPopup, (state, action) => {
        state.popupList.push({
          key: nanoid(),
          show: true,
          content: action.payload.content
        })
      })
      .addCase(removePopup, (state, { payload: { key } }) => {
        state.popupList.forEach(p => {
          if (p.key === key) {
            p.show = false
          }
        })
      })
)
