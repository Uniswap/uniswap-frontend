import { Percent } from '@uniswap/sdk-core'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { useMemo } from 'react'
import { useUserSlippageToleranceWithDefault } from '../state/user/hooks'

const V2_SWAP_DEFAULT_SLIPPAGE = new Percent(45, 10_000) // .45%
const V3_SWAP_DEFAULT_SLIPPAGE = new Percent(30, 10_000) // .30%
const ONE_TENTHS_PERCENT = new Percent(10, 10_000) // .10%

export default function useSwapSlippageTolerance(trade: V2Trade | V3Trade | undefined): Percent {
  const defaultSlippageTolerance = useMemo(() => {
    if (!trade) return ONE_TENTHS_PERCENT
    if (trade instanceof V2Trade) return V2_SWAP_DEFAULT_SLIPPAGE
    return V3_SWAP_DEFAULT_SLIPPAGE
  }, [trade])
  return useUserSlippageToleranceWithDefault(defaultSlippageTolerance)
}
