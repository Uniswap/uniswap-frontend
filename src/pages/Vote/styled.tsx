import { Trans } from '@lingui/macro'
import styled, { DefaultTheme } from 'styled-components/macro'
import { ProposalState } from '../../state/governance/hooks'

const handleColorType = (status: ProposalState, theme: DefaultTheme) => {
  switch (status) {
    case ProposalState.PENDING:
    case ProposalState.ACTIVE:
      return theme.blue1
    case ProposalState.SUCCEEDED:
    case ProposalState.EXECUTED:
      return theme.green1
    case ProposalState.DEFEATED:
      return theme.red1
    case ProposalState.QUEUED:
    case ProposalState.CANCELED:
    case ProposalState.EXPIRED:
    default:
      return theme.text3
  }
}

function StatusText({ status }: { status: ProposalState }) {
  switch (status) {
    case ProposalState.PENDING:
      return <Trans>Pending</Trans>
    case ProposalState.ACTIVE:
      return <Trans>Active</Trans>
    case ProposalState.SUCCEEDED:
      return <Trans>Succeeded</Trans>
    case ProposalState.EXECUTED:
      return <Trans>Executed</Trans>
    case ProposalState.DEFEATED:
      return <Trans>Defeated</Trans>
    case ProposalState.QUEUED:
      return <Trans>Queued</Trans>
    case ProposalState.CANCELED:
      return <Trans>Canceled</Trans>
    case ProposalState.EXPIRED:
      return <Trans>Expired</Trans>
    default:
      return <Trans>Undetermined</Trans>
  }
}

const StyledProposalContainer = styled.span<{ status: ProposalState }>`
  font-size: 0.825rem;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 8px;
  color: ${({ status, theme }) => handleColorType(status, theme)};
  border: 1px solid ${({ status, theme }) => handleColorType(status, theme)};
  width: fit-content;
  justify-self: flex-end;
  text-transform: uppercase;
  flex: 0 0 100px;
  text-align: center;
`

export function ProposalStatus({ status }: { status: ProposalState }) {
  return (
    <StyledProposalContainer status={status}>
      <StatusText status={status} />
    </StyledProposalContainer>
  )
}
