import JSBI from 'jsbi'
import { useMemo } from 'react'
import { LogsState, useLogs } from '../../state/logs/hooks'
import compareLogs from '../../utils/compareLogs'
import { useV3Staker } from '../useContract'
import { useActiveWeb3React } from '../web3'

const VALID_STATES: LogsState[] = [LogsState.SYNCING, LogsState.SYNCED]

export enum DepositedTokenIdsState {
  INVALID,
  LOADING,
  LOADED,
}

export interface DepositedTokenIdsResult {
  state: DepositedTokenIdsState
  tokenIds: JSBI[] | undefined
}

export function useDepositedTokenIds(): DepositedTokenIdsResult {
  const v3Staker = useV3Staker()
  const { account } = useActiveWeb3React()
  const filters = useMemo(() => {
    if (!v3Staker) return []
    return [
      v3Staker.filters.DepositTransferred(null, account, null),
      v3Staker.filters.DepositTransferred(null, null, account),
    ]
  }, [account, v3Staker])

  const transferredFromLogs = useLogs(filters[0])
  const transferredToLogs = useLogs(filters[1])

  const orderedDepositEvents = useMemo(() => {
    if (!VALID_STATES.includes(transferredFromLogs.state) || !VALID_STATES.includes(transferredToLogs.state))
      return undefined

    return (transferredFromLogs.logs ?? []).concat(transferredToLogs.logs ?? []).sort(compareLogs)
  }, [transferredFromLogs.logs, transferredFromLogs.state, transferredToLogs])

  return useMemo(() => {
    if (!v3Staker)
      return {
        state: DepositedTokenIdsState.INVALID,
        tokenIds: undefined,
      }

    if (!orderedDepositEvents)
      return {
        state: DepositedTokenIdsState.LOADING,
        tokenIds: undefined,
      }

    const ownedTokenIdMap = orderedDepositEvents.reduce<{ [tokenId: string]: boolean }>((memo, log) => {
      const parsed = v3Staker.interface.decodeEventLog('DepositTransferred', log.data, log.topics)
      memo[parsed.tokenId.toString()] = parsed.newOwner === account
      return memo
    }, {})

    const tokenIds = Object.entries(ownedTokenIdMap)
      .filter(([, owned]) => owned)
      .map(([tokenId]) => tokenId)
      .map(JSBI.BigInt)
    return {
      state: DepositedTokenIdsState.LOADED,
      tokenIds,
    }
  }, [account, orderedDepositEvents, v3Staker])
}
