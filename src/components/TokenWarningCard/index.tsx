import { Token } from '@uniswap/sdk'
import { transparentize } from 'polished'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '../../hooks'
import { ALL_TOKENS, useAllTokens } from '../../hooks/Tokens'
import { getEtherscanLink } from '../../utils'
import { Link } from '../../theme'
import QuestionHelper from '../Question'
import TokenLogo from '../TokenLogo'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { TYPE } from '../../theme'

const Wrapper = styled.div<{ error: boolean }>`
  background: ${({ theme, error }) => transparentize(0.9, error ? theme.red1 : theme.yellow1)};
  position: relative;
  padding: 1rem;
  border: 0.5px solid ${({ theme, error }) => transparentize(0.4, error ? theme.red1 : theme.yellow1)};
  border-radius: 10px;
  margin-bottom: 20px;
  display: grid;
  grid-template-rows: auto auto auto;
  grid-row-gap: 14px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-items: flex-start;
  & > * {
    margin-right: 6px;
  }
`

const CloseColor = styled(Close)`
  color: #aeaeae;
`

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  & > * {
    height: 14px;
    width: 14px;
  }
`

interface TokenWarningCardProps {
  token?: Token
}

const HELP_TEXT = `
The Uniswap V2 smart contracts are designed to support any ERC20 token on Ethereum. Any token can be
loaded into the interface by entering its Ethereum address into the search field or passing it as a URL
parameter.
`

export default function TokenWarningCard({ token }: TokenWarningCardProps) {
  const { chainId } = useWeb3React()
  const [dismissed, setDismissed] = useState<boolean>(false)
  const isDefaultToken = Boolean(
    token && token.address && chainId && ALL_TOKENS[chainId] && ALL_TOKENS[chainId][token.address]
  )

  useEffect(() => {
    setDismissed(false)
  }, [token, setDismissed])

  const tokenSymbol = token?.symbol?.toLowerCase() ?? ''
  const tokenName = token?.name?.toLowerCase() ?? ''

  const allTokens = useAllTokens()

  const duplicateNameOrSymbol = useMemo(() => {
    if (isDefaultToken || !token || !chainId) return false

    return Object.keys(allTokens).some(tokenAddress => {
      const userToken = allTokens[tokenAddress]
      if (userToken.equals(token)) {
        return false
      }
      return userToken.symbol.toLowerCase() === tokenSymbol || userToken.name.toLowerCase() === tokenName
    })
  }, [isDefaultToken, token, chainId, allTokens, tokenSymbol, tokenName])

  if (isDefaultToken || !token || dismissed) return null

  return (
    <Wrapper error={duplicateNameOrSymbol}>
      {duplicateNameOrSymbol ? null : (
        <CloseIcon onClick={() => setDismissed(true)}>
          <CloseColor />
        </CloseIcon>
      )}
      <Row>
        <TYPE.subHeader>{duplicateNameOrSymbol ? 'Duplicate token name or symbol' : 'Imported token'}</TYPE.subHeader>
        <QuestionHelper text={HELP_TEXT} />
      </Row>
      <Row>
        <TokenLogo address={token.address} />
        <div style={{ fontWeight: 500 }}>
          {token && token.name && token.symbol && token.name !== token.symbol
            ? `${token.name} (${token.symbol})`
            : token.name || token.symbol}
        </div>
        <Link style={{ fontWeight: 400 }} href={getEtherscanLink(chainId, token.address, 'address')}>
          (View on Etherscan)
        </Link>
      </Row>
      <Row>
        <TYPE.italic>
          {duplicateNameOrSymbol ? 'This token has the same name or symbol as another token in your list. ' : null}
          Verify the legitimacy of this token before making any transactions.
        </TYPE.italic>
      </Row>
    </Wrapper>
  )
}
