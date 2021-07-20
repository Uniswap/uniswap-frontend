import { AutoColumn } from '../../components/Column'
import styled from 'styled-components/macro'
import { TYPE } from '../../theme'
import { RowBetween, RowFixed } from '../../components/Row'
import { CardSection, DataCard, CardBGImage } from '../../components/earn/styled'
import { DarkCard } from '../../components/Card'
import { Trans } from '@lingui/macro'
import useTheme from 'hooks/useTheme'
import { GenericBadge } from 'components/Badge'
import { Zap } from 'react-feather'
import { useAllIncentives } from '../../hooks/incentives/useAllIncentives'
import ProgramCard from './ProgramCard'
import Loader from 'components/Loader'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const ProgramSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
`};
`

export default function Earn() {
  const theme = useTheme()

  const { loading, incentives: allIncentives } = useAllIncentives()

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <DataCard>
          <CardSection>
            <AutoColumn gap="md">
              <GenericBadge style={{ backgroundColor: theme.blue4 }}>
                <RowFixed>
                  <Zap stroke={theme.blue3} size="16px" strokeWidth={'3px'} />
                  <TYPE.body fontWeight={700} color={theme.blue3} ml="4px">
                    Boosted
                  </TYPE.body>
                </RowFixed>
              </GenericBadge>
              <TYPE.body fontWeight={600} fontSize="24px" color={theme.blue3}>
                <Trans>Earn more with boosts</Trans>
              </TYPE.body>
              <TYPE.body color={theme.blue3}>
                <Trans>Learn about liquidity mining and staking rewards</Trans>
              </TYPE.body>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
        </DataCard>
      </TopSection>

      <DarkCard>
        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
          <DataRow style={{ alignItems: 'baseline' }}>
            <TYPE.body style={{ marginTop: '0.5rem' }}>
              <Trans>Rewards programs</Trans>
            </TYPE.body>
          </DataRow>
          <ProgramSection>
            {loading ? (
              <Loader />
            ) : (
              allIncentives?.map((incentive, i) => <ProgramCard key={`program-card-${i}`} incentive={incentive} />)
            )}
          </ProgramSection>
        </AutoColumn>
      </DarkCard>
    </PageWrapper>
  )
}
