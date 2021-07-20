import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { BIG_INT_SECONDS_IN_WEEK } from 'constants/misc'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'
import { Incentive } from '../../hooks/incentives/useAllIncentives'
import { Countdown } from './Countdown'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { useV3Positions } from 'hooks/useV3Positions'
import { useActiveWeb3React } from 'hooks/web3'

const Wrapper = styled.div`
  padding: 1rem;
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, rgba(30, 26, 49, 0.2) 0%, rgba(61, 81, 165, 0.2) 100%);

  border-radius: 12px;
`

interface ProgramCardProps {
  incentive: Incentive
}

export default function ProgramCard({ incentive }: ProgramCardProps) {
  const { account } = useActiveWeb3React()

  const rewardToken = incentive.initialRewardAmount.currency

  const startDate = new Date(incentive.startTime * 1000)
  const endDate = new Date(incentive.endTime * 1000)

  const rewardTokensPerWeek = incentive.rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_WEEK)

  // may be null if no usd price for token
  const usdPerWeek = useUSDCValue(rewardTokensPerWeek)
  const initialUSD = useUSDCValue(incentive.initialRewardAmount)
  const remainingUSD = useUSDCValue(incentive.rewardAmountRemaining)

  const { positions, loading: positionsLoading } = useV3Positions(account)

  return (
    <Wrapper>
      <AutoColumn gap="20px">
        <RowBetween>
          <RowFixed>
            <CurrencyLogo currency={rewardToken} size="20px" />
            <TYPE.body fontWeight={600} fontSize="16px" ml="8px">
              {rewardToken.symbol} <Trans>Boost</Trans>
            </TYPE.body>
          </RowFixed>
          <Countdown exactStart={startDate} exactEnd={endDate} />
        </RowBetween>
        <AutoColumn gap="sm">
          <TYPE.body fontSize="30px" fontWeight={600} marginTop="20px">
            {usdPerWeek
              ? `$${formatCurrencyAmount(usdPerWeek, 2)}`
              : `${formatCurrencyAmount(rewardTokensPerWeek, 5)} ${rewardToken.symbol}`}{' '}
            / week
          </TYPE.body>
          {!usdPerWeek ? null : (
            <TYPE.body fontSize="16px" fontWeight={600}>
              {`${formatCurrencyAmount(rewardTokensPerWeek, 5)} ${rewardToken.symbol}`} / week
            </TYPE.body>
          )}
        </AutoColumn>
        <AutoColumn gap="12px">
          <RowBetween>
            <TYPE.body fontSize="12px">
              <Trans>Initial Reward</Trans>
            </TYPE.body>
            <TYPE.body fontSize="12px" fontWeight={600}>{`${
              initialUSD ? '$' + initialUSD.toExact() + ' / ' : ''
            } ${formatCurrencyAmount(incentive.initialRewardAmount, 5)} ${rewardToken.symbol}`}</TYPE.body>
          </RowBetween>
          <RowBetween>
            <TYPE.body fontSize="12px">
              <Trans>Rewards Remaining</Trans>
            </TYPE.body>
            <TYPE.body fontSize="12px" fontWeight={600}>{`${
              remainingUSD ? '$' + formatCurrencyAmount(remainingUSD, 5) + ' / ' : ''
            } ${formatCurrencyAmount(incentive.rewardAmountRemaining, 5)} ${rewardToken.symbol}`}</TYPE.body>
          </RowBetween>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  )
}
