import { computePoolAddress } from '@uniswap/v3-sdk'
import { V3_CORE_FACTORY_ADDRESSES } from '../constants/addresses'
import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { IUniswapV3PoolImmutablesInterface } from '../types/v3/IUniswapV3PoolImmutables'
import { Token, Currency } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useAllTokens } from './Tokens'
import { useActiveWeb3React } from './web3'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../state/multicall/hooks'

import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { abi as IUniswapV3PoolImmutablesABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolImmutables.sol/IUniswapV3PoolImmutables.json'
import { Interface } from '@ethersproject/abi'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI) as IUniswapV3PoolStateInterface
const POOL_IMMUTABLES_INTERFACE = new Interface(IUniswapV3PoolImmutablesABI) as IUniswapV3PoolImmutablesInterface

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][]
): [PoolState, Pool | null][] {
  const { chainId } = useActiveWeb3React()

  const transformed: ([Token, Token, FeeAmount] | null)[] = useMemo(() => {
    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (!chainId || !currencyA || !currencyB || !feeAmount) return null

      const tokenA = currencyA?.wrapped
      const tokenB = currencyB?.wrapped
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [token0, token1, feeAmount]
    })
  }, [chainId, poolKeys])

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]

    return transformed.map((value) => {
      if (!v3CoreFactoryAddress || !value) return undefined
      return computePoolAddress({
        factoryAddress: v3CoreFactoryAddress,
        tokenA: value[0],
        tokenB: value[1],
        fee: value[2],
      })
    })
  }, [chainId, transformed])

  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'slot0')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity')

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const [token0, token1, fee] = transformed[index] ?? []
      if (!token0 || !token1 || !fee) return [PoolState.INVALID, null]

      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]

      if (!slot0Valid || !liquidityValid) return [PoolState.INVALID, null]
      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null]

      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]

      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null]

      try {
        return [PoolState.EXISTS, new Pool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick)]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [liquidities, poolKeys, slot0s, transformed])
}

/**
 * Returns all the pools with the given address, as long as both tokens are in the active token list
 */
export function usePoolsByAddresses(poolAddresses: (string | undefined)[]): [PoolState, Pool | null][] {
  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'slot0')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity')
  const token0s = useMultipleContractSingleData(
    poolAddresses,
    POOL_IMMUTABLES_INTERFACE,
    'token0',
    undefined,
    NEVER_RELOAD
  )
  const token1s = useMultipleContractSingleData(
    poolAddresses,
    POOL_IMMUTABLES_INTERFACE,
    'token1',
    undefined,
    NEVER_RELOAD
  )
  const fees = useMultipleContractSingleData(poolAddresses, POOL_IMMUTABLES_INTERFACE, 'fee', undefined, NEVER_RELOAD)
  const allTokens = useAllTokens()

  return useMemo(() => {
    return poolAddresses.map((poolAddress, index) => {
      if (!poolAddress) return [PoolState.INVALID, null]
      const { result: token0Result, loading: token0Loading } = token0s[index]
      const { result: token1Result, loading: token1Loading } = token1s[index]
      const { result: feeResult, loading: feeLoading } = fees[index]
      if (!token0Result || !token1Result || !feeResult)
        return [token0Loading || token1Loading || feeLoading ? PoolState.LOADING : PoolState.INVALID, null]

      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]

      if (!slot0Valid || !liquidityValid) return [PoolState.INVALID, null]
      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null]

      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]

      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null]

      const token0 = allTokens[token0Result[0]]
      const token1 = allTokens[token1Result[0]]

      // todo: return pools for which token0 and token1 are not in the current set of active token lists
      if (!token0 || !token1) return [PoolState.INVALID, null]

      try {
        return [PoolState.EXISTS, new Pool(token0, token1, feeResult[0], slot0.sqrtPriceX96, liquidity[0], slot0.tick)]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [allTokens, fees, liquidities, poolAddresses, slot0s, token0s, token1s])
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount]
  )

  return usePools(poolKeys)[0]
}
