import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react'
import { SupportedChainId } from 'constants/chains'

export interface GetQuoteResult {
  blockNumber: string
  gasPriceWei: string
  gasUseEstimate: string
  gasUseEstimateQuote: string
  gasUseEstimateQuoteDecimals: string
  gasUseEstimateUSD: string
  methodParameters: { calldata: string; value: string }
  quote: string
  quoteDecimals: string
  quoteGasAdjusted: string
  quoteGasAdjustedDecimals: string
  quoteId: string
  routeEdges: {
    fee: string
    id: string
    inId: string
    outId: string
    percent: number
    type: string
  }[]
  routeNodes: { chainId: number; id: string; symbol: string; type: string }[]
  routeString: string
}

export const routingApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.uniswap.org/v1/',
  }),
  endpoints: (build) => ({
    getQuote: build.query<
      GetQuoteResult,
      {
        // add block number to invalidate on block change
        tokenIn: { address: string; chainId: SupportedChainId }
        tokenOut: { address: string; chainId: SupportedChainId }
        amount: string
        type: 'exactIn' | 'exactOut'
        recipient: string
        slippageTolerance?: string
        deadline?: string
      }
    >({
      query: (args) => ({
        url: `quote`,
        method: 'POST',
        body: args,
      }),
    }),
  }),
})

export const { useGetQuoteQuery } = routingApi
