import { Trans } from '@lingui/macro'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import ProposalEmptyState from 'components/vote/ProposalEmptyState'
import JSBI from 'jsbi'
import { darken } from 'polished'
import { Link } from 'react-router-dom'
import { Button } from 'rebass/styled-components'
import styled from 'styled-components/macro'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from 'components/earn/styled'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount'
import Loader from 'components/Loader'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import DelegateModal from 'components/vote/DelegateModal'
import { ZERO_ADDRESS } from '../../constants/misc'
import { UNI } from '../../constants/tokens'
import { useActiveWeb3React } from 'hooks/web3'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleDelegateModal } from 'state/application/hooks'
import { ProposalData, useAllProposalData, useUserDelegatee, useUserVotes } from 'state/governance/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { ExternalLink, TYPE } from 'theme'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { ProposalStatus } from './styled'

const PageWrapper = styled(AutoColumn)``

const TopSection = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const Proposal = styled(Button)`
  padding: 0.75rem 1rem;
  width: 100%;
  margin-top: 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  outline: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  background-color: ${({ theme }) => theme.bg1};
  &:focus {
    background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  }
`

const ProposalNumber = styled.span`
  opacity: 0.6;
  flex: 0 0 40px;
`

const ProposalTitle = styled.span`
  font-weight: 600;
  flex: 1;
  max-width: 420px;
  white-space: initial;
  word-wrap: break-word;
  padding-right: 10px;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const WrapSmall = styled(RowBetween)`
  margin-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
  `};
`

const TextButton = styled(TYPE.main)`
  color: ${({ theme }) => theme.primary1};
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`

const AddressButton = styled.div`
  border: 1px solid ${({ theme }) => theme.bg3};
  padding: 2px 4px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const StyledExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.text1};
`

export default function Vote() {
  const { account, chainId } = useActiveWeb3React()

  // toggle for showing delegation modal
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE)
  const toggleDelegateModal = useToggleDelegateModal()

  // get data to list all proposals
  const { data: allProposals, loading: loadingProposals } = useAllProposalData()

  // user data
  const { loading: loadingAvailableVotes, votes: availableVotes } = useUserVotes()
  const uniBalance: CurrencyAmount<Token> | undefined = useTokenBalance(
    account ?? undefined,
    chainId ? UNI[chainId] : undefined
  )
  const userDelegatee: string | undefined = useUserDelegatee()

  // show delegation option if they have have a balance, but have not delegated
  const showUnlockVoting = Boolean(
    uniBalance && JSBI.notEqual(uniBalance.quotient, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS
  )

  return (
    <>
      <PageWrapper gap="lg" justify="center">
        <DelegateModal
          isOpen={showDelegateModal}
          onDismiss={toggleDelegateModal}
          title={showUnlockVoting ? <Trans>Unlock Votes</Trans> : <Trans>Update Delegation</Trans>}
        />
        <TopSection gap="md">
          <VoteCard>
            <CardBGImage />
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>
                    <Trans>Uniswap Governance</Trans>
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white fontSize={14}>
                    <Trans>
                      UNI tokens represent voting shares in Uniswap governance. You can vote on each proposal yourself
                      or delegate your votes to a third party.
                    </Trans>
                  </TYPE.white>
                </RowBetween>
                <ExternalLink
                  style={{ color: 'white', textDecoration: 'underline' }}
                  href="https://uniswap.org/blog/uni"
                  target="_blank"
                >
                  <TYPE.white fontSize={14}>
                    <Trans>Read more about Uniswap governance</Trans>
                  </TYPE.white>
                </ExternalLink>
              </AutoColumn>
            </CardSection>
            <CardBGImage />
            <CardNoise />
          </VoteCard>
        </TopSection>
        <TopSection gap="2px">
          <WrapSmall>
            <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>
              <Trans>Proposals</Trans>
            </TYPE.mediumHeader>
            <AutoRow gap="6px" justify="flex-end">
              {loadingProposals || loadingAvailableVotes ? <Loader /> : null}
              {showUnlockVoting ? (
                <ButtonPrimary
                  style={{ width: 'fit-content' }}
                  padding="8px"
                  $borderRadius="8px"
                  onClick={toggleDelegateModal}
                >
                  <Trans>Unlock Voting</Trans>
                </ButtonPrimary>
              ) : availableVotes && JSBI.notEqual(JSBI.BigInt(0), availableVotes?.quotient) ? (
                <TYPE.body fontWeight={500} mr="6px">
                  <Trans>
                    <FormattedCurrencyAmount currencyAmount={availableVotes} /> Votes
                  </Trans>
                </TYPE.body>
              ) : uniBalance &&
                userDelegatee &&
                userDelegatee !== ZERO_ADDRESS &&
                JSBI.notEqual(JSBI.BigInt(0), uniBalance?.quotient) ? (
                <TYPE.body fontWeight={500} mr="6px">
                  <Trans>
                    <FormattedCurrencyAmount currencyAmount={uniBalance} /> Votes
                  </Trans>
                </TYPE.body>
              ) : (
                ''
              )}
              <ButtonPrimary
                as={Link}
                to="/create-proposal"
                style={{ width: 'fit-content', borderRadius: '8px' }}
                padding="8px"
              >
                <Trans>Create Proposal</Trans>
              </ButtonPrimary>
            </AutoRow>
          </WrapSmall>
          {!showUnlockVoting && (
            <RowBetween>
              <div />
              {userDelegatee && userDelegatee !== ZERO_ADDRESS ? (
                <RowFixed>
                  <TYPE.body fontWeight={500} mr="4px">
                    <Trans>Delegated to:</Trans>
                  </TYPE.body>
                  <AddressButton>
                    <StyledExternalLink
                      href={getExplorerLink(1, userDelegatee, ExplorerDataType.ADDRESS)}
                      style={{ margin: '0 4px' }}
                    >
                      {userDelegatee === account ? <Trans>Self</Trans> : shortenAddress(userDelegatee)}
                    </StyledExternalLink>
                    <TextButton onClick={toggleDelegateModal} style={{ marginLeft: '4px' }}>
                      <Trans>(edit)</Trans>
                    </TextButton>
                  </AddressButton>
                </RowFixed>
              ) : (
                ''
              )}
            </RowBetween>
          )}
          {allProposals?.length === 0 && <ProposalEmptyState />}
          {allProposals
            ?.slice(0)
            ?.reverse()
            ?.map((p: ProposalData) => {
              return (
                <Proposal as={Link} to={`/vote/${p.governorIndex}/${p.id}`} key={`${p.governorIndex}${p.id}`}>
                  <ProposalNumber>
                    {p.governorIndex}.{p.id}
                  </ProposalNumber>
                  <ProposalTitle>{p.title}</ProposalTitle>
                  <ProposalStatus status={p.status} />
                </Proposal>
              )
            })}
        </TopSection>
        <TYPE.subHeader color="text3">
          <Trans>A minimum threshold of 0.25% of the total UNI supply is required to submit proposals</Trans>
        </TYPE.subHeader>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}
