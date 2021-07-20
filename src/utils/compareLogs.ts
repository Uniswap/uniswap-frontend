import { Log } from '../state/logs/utils'

type PartialLog = Pick<Log, 'blockNumber' | 'transactionIndex' | 'logIndex'>

/**
 * Sorts logs in chronological order from earliest to latest
 * @param logA one of two logs to compare
 * @param logB the other of the two logs to compare
 */
export default function compareLogs(logA: PartialLog, logB: PartialLog) {
  return (
    logA.blockNumber - logB.blockNumber ||
    logA.transactionIndex - logB.transactionIndex ||
    logA.logIndex - logB.logIndex
  )
}
