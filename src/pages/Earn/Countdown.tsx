import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { TYPE } from '../../theme'

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

const MonoFront = styled(TYPE.body)`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.blue3};
  background-color: ${({ theme }) => theme.blue4};
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  font-size: 12px;

  > * {
    font-size: 12px;
  }
`

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.blue3};
`

export function Countdown({ exactStart, exactEnd }: { exactStart: Date; exactEnd: Date }) {
  // get end/beginning times
  const begin = Math.floor(exactStart.getTime() / 1000)
  const end = Math.floor(exactEnd.getTime() / 1000)

  // get current time
  const [time, setTime] = useState(() => Math.floor(Date.now() / 1000))
  useEffect((): (() => void) | void => {
    // we only need to tick if rewards haven't ended yet
    if (time <= end) {
      const timeout = setTimeout(() => setTime(Math.floor(Date.now() / 1000)), 1000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [time, end])

  const timeUntilGenesis = begin - time
  const timeUntilEnd = end - time

  let timeRemaining: number
  let message: string
  if (timeUntilGenesis >= 0) {
    message = 'Rewards begin in'
    timeRemaining = timeUntilGenesis
  } else {
    const ongoing = timeUntilEnd >= 0
    if (ongoing) {
      message = ''
      timeRemaining = timeUntilEnd
    } else {
      message = 'Rewards have ended!'
      timeRemaining = Infinity
    }
  }

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY
  timeRemaining -= days * DAY
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR
  timeRemaining -= hours * HOUR
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE
  timeRemaining -= minutes * MINUTE
  const seconds = timeRemaining

  return (
    <MonoFront fontWeight={700}>
      <span style={{ fontSize: '12px', marginRight: '4px' }}>{message !== '' ? message : <Dot />}</span>
      {Number.isFinite(timeRemaining) && (
        <code>
          {`${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds
            .toString()
            .padStart(2, '0')}`}
          s
        </code>
      )}
    </MonoFront>
  )
}
