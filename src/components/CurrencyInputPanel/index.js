import React, { useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import styled from 'styled-components'
import escapeStringRegex from 'escape-string-regexp'
import { darken } from 'polished'
import Tooltip from '@reach/tooltip'
import '@reach/tooltip/styles.css'
import { isMobile } from 'react-device-detect'
import { BorderlessInput } from '../../theme'
import { useTokenContract } from '../../hooks'
import { isAddress, calculateGasMargin, formatToUsd, formatTokenBalance, formatEthBalance } from '../../utils'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import Modal from '../Modal'
import TokenLogo from '../TokenLogo'
import SearchIcon from '../../assets/images/magnifying-glass.svg'
import { useTransactionAdder, usePendingApproval } from '../../contexts/Transactions'
import { useTokenDetails, useAllTokenDetails } from '../../contexts/Tokens'
import close from '../../assets/images/x.svg'
import { transparentize } from 'polished'
import { Spinner } from '../../theme'
import Circle from '../../assets/images/circle-grey.svg'

const GAS_MARGIN = ethers.utils.bigNumberify(1000)

const SubCurrencySelect = styled.button`
  ${({ theme }) => theme.flexRowNoWrap}
  background: ${({ theme }) => theme.zumthorBlue};
  border: 1px solid ${({ theme }) => theme.royalBlue};
  color: ${({ theme }) => theme.royalBlue};
  line-height: 0;
  height: 2rem;
  padding: 10px 50px 10px 15px;
  margin-right: -40px;
  border-radius: 2.5rem;
  outline: none;
  cursor: pointer;
  user-select: none;
`

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;

  padding: 0.25rem 0.85rem 0.75rem;
`

const Input = styled(BorderlessInput)`
  font-size: 1.5rem;
  color: ${({ error, theme }) => error && theme.salmonRed};
  background-color: ${({ theme }) => theme.inputBackground};
`

const StyledBorderlessInput = styled(BorderlessInput)`
  min-height: 2.5rem;
  flex-shrink: 0;
  text-align: left;
  padding-left: 1.6rem;
  background-color: ${({ theme }) => theme.concreteGray};
`

const CurrencySelect = styled.button`
  align-items: center;
  font-size: 1rem;
  color: ${({ selected, theme }) => (selected ? theme.textColor : theme.royalBlue)};
  height: 2rem;
  border: 1px solid ${({ selected, theme }) => (selected ? theme.mercuryGray : theme.royalBlue)};
  border-radius: 2.5rem;
  background-color: ${({ selected, theme }) => (selected ? theme.concreteGray : theme.zumthorBlue)};
  outline: none;
  cursor: pointer;
  user-select: none;

  :hover {
    border: 1px solid
      ${({ selected, theme }) => (selected ? darken(0.1, theme.mercuryGray) : darken(0.1, theme.royalBlue))};
  }

  :focus {
    border: 1px solid ${({ theme }) => darken(0.1, theme.royalBlue)};
  }

  :active {
    background-color: ${({ theme }) => theme.zumthorBlue};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledDropDown = styled(DropDown)`
  margin: 0 0.5rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.textColor : theme.royalBlue)};
  }
`

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.royalBlue)};
  position: relative;
  border-radius: 1.25rem;
  background-color: ${({ theme }) => theme.inputBackground};
  z-index: 1;
`

const Container = styled.div`
  border-radius: 1.25rem;
  border: 1px solid ${({ error, theme }) => (error ? theme.salmonRed : theme.mercuryGray)};

  background-color: ${({ theme }) => theme.inputBackground};
  transition: box-shadow 150ms ease-out;

  :focus-within {
    border: 1px solid ${({ theme }) => theme.malibuBlue};
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.doveGray};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.doveGray)};
  }
`

const LabelContainer = styled.div`
  flex: 1 1 auto;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const ErrorSpan = styled.span`
  color: ${({ error, theme }) => error && theme.salmonRed};
  :hover {
    cursor: pointer;
    color: ${({ error, theme }) => error && darken(0.1, theme.salmonRed)};
  }
`

const TokenModal = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  width: 100%;
`

const ModalHeader = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 2rem;
  height: 60px;
`

const CloseIcon = styled.div`
  position: absolute;
  right: 1.4rem;
  &:hover {
    cursor: pointer;
  }
`

const SearchContainer = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  padding: 0.5rem 2rem;
  background-color: ${({ theme }) => theme.concreteGray};
`

const TokenModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1.5rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  user-select: none;
`

const TokenList = styled.div`
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`

const TokenModalRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 2rem;
  cursor: pointer;
  user-select: none;

  #symbol {
    color: ${({ theme }) => theme.doveGrey};
  }

  :hover {
    background-color: ${({ theme }) => theme.tokenRowHover};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0.8rem 1rem;`}
`

const TokenRowLeft = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items : center;
`

const TokenSymbolGroup = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  margin-left: 1rem;
`

const TokenFullName = styled.div`
  color: ${({ theme }) => theme.chaliceGray};
`

const TokenRowBalance = styled.div`
  font-size: 1rem;
  line-height: 20px;
`

const TokenRowUsd = styled.div`
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${({ theme }) => theme.chaliceGray};
`

const TokenRowRight = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: flex-end;
`

const StyledTokenName = styled.span`
  margin: 0 0.25rem 0 0.25rem;
`

const SpinnerWrapper = styled(Spinner)`
  margin: 0 0.25rem 0 0.25rem;
  fill-color: ${({ theme }) => theme.chaliceGray};
  opacity: 0.6;
`

export default function CurrencyInputPanel({
  onValueChange = () => {},
  allBalances,
  renderInput,
  onCurrencySelected = () => {},
  title,
  description,
  extraText,
  extraTextClickHander = () => {},
  errorMessage,
  disableUnlock,
  disableTokenSelect,
  selectedTokenAddress = '',
  showUnlock,
  value
}) {
  const { t } = useTranslation()

  const [modalIsOpen, setModalIsOpen] = useState(false)

  const tokenContract = useTokenContract(selectedTokenAddress)
  const { exchangeAddress: selectedTokenExchangeAddress } = useTokenDetails(selectedTokenAddress)

  const pendingApproval = usePendingApproval(selectedTokenAddress)

  const addTransaction = useTransactionAdder()

  const allTokens = useAllTokenDetails()

  function renderUnlockButton() {
    if (disableUnlock || !showUnlock || selectedTokenAddress === 'ETH' || !selectedTokenAddress) {
      return null
    } else {
      if (!pendingApproval) {
        return (
          <SubCurrencySelect
            onClick={async () => {
              const estimatedGas = await tokenContract.estimate.approve(
                selectedTokenExchangeAddress,
                ethers.constants.MaxUint256
              )
              tokenContract
                .approve(selectedTokenExchangeAddress, ethers.constants.MaxUint256, {
                  gasLimit: calculateGasMargin(estimatedGas, GAS_MARGIN)
                })
                .then(response => {
                  addTransaction(response, { approval: selectedTokenAddress })
                })
            }}
          >
            {t('unlock')}
          </SubCurrencySelect>
        )
      } else {
        return <SubCurrencySelect>{t('pending')}</SubCurrencySelect>
      }
    }
  }

  function _renderInput() {
    if (typeof renderInput === 'function') {
      return renderInput()
    }

    return (
      <InputRow>
        <Input
          type="number"
          min="0"
          error={!!errorMessage}
          placeholder="0.0"
          onChange={e => onValueChange(e.target.value)}
          onKeyPress={e => {
            const charCode = e.which ? e.which : e.keyCode

            // Prevent 'minus' character
            if (charCode === 45) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          value={value}
        />
        {renderUnlockButton()}
        <CurrencySelect
          selected={!!selectedTokenAddress}
          onClick={() => {
            if (!disableTokenSelect) {
              setModalIsOpen(true)
            }
          }}
        >
          <Aligner>
            {selectedTokenAddress ? <TokenLogo address={selectedTokenAddress} /> : null}
            {
              <StyledTokenName>
                {(allTokens[selectedTokenAddress] && allTokens[selectedTokenAddress].symbol) || t('selectToken')}
              </StyledTokenName>
            }
            {!disableTokenSelect && <StyledDropDown selected={!!selectedTokenAddress} />}
          </Aligner>
        </CurrencySelect>
      </InputRow>
    )
  }

  return (
    <InputPanel>
      <Container error={!!errorMessage}>
        <LabelRow>
          <LabelContainer>
            <span>{title}</span> <span>{description}</span>
          </LabelContainer>

          <ErrorSpan
            data-tip={'Enter max'}
            error={!!errorMessage}
            onClick={() => {
              extraTextClickHander()
            }}
          >
            <Tooltip
              label="Enter Max"
              style={{
                background: 'hsla(0, 0%, 0%, 0.75)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                padding: '0.5em 1em',
                marginTop: '-64px'
              }}
            >
              <span>{extraText}</span>
            </Tooltip>
          </ErrorSpan>
        </LabelRow>
        {_renderInput()}
      </Container>
      {!disableTokenSelect && (
        <CurrencySelectModal
          isOpen={modalIsOpen}
          // isOpen={true}
          onDismiss={() => {
            setModalIsOpen(false)
          }}
          onTokenSelect={onCurrencySelected}
          allBalances={allBalances}
        />
      )}
    </InputPanel>
  )
}

function CurrencySelectModal({ isOpen, onDismiss, onTokenSelect, allBalances }) {
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')
  const { exchangeAddress } = useTokenDetails(searchQuery)

  const allTokens = useAllTokenDetails()

  const tokenList = useMemo(() => {
    return Object.keys(allTokens)
      .sort((a, b) => {
        const aSymbol = allTokens[a].symbol.toLowerCase()
        const bSymbol = allTokens[b].symbol.toLowerCase()
        if (aSymbol === 'ETH'.toLowerCase() || bSymbol === 'ETH'.toLowerCase()) {
          return aSymbol === bSymbol ? 0 : aSymbol === 'ETH'.toLowerCase() ? -1 : 1
        } else {
          //check for balance - sort by value
          if (allBalances && allBalances[a] && allBalances[b]) {
            const tokenBalA = formatTokenBalance(allBalances[a].balance, allBalances[a].decimal)
            const tokenBalB = formatTokenBalance(allBalances[b].balance, allBalances[b].decimal)
            if (tokenBalA === '<0.0001' && tokenBalB <= 0) {
              return -1
            }
            if (tokenBalB === '<0.0001' && tokenBalA <= 0) {
              return 1
            }
            if (tokenBalB === '<0.0001' && tokenBalA === '<0.0001') {
              return 0
            }
            const aBalance = formatToUsd(allBalances[a].usdPrice) * (tokenBalA === '<0.0001' ? 0 : tokenBalA)
            const bBalance = formatToUsd(allBalances[b].usdPrice) * (tokenBalB === '<0.0001' ? 0 : tokenBalB)
            return aBalance < bBalance ? 1 : aBalance > bBalance ? -1 : 0
          }
          return aSymbol < bSymbol ? -1 : aSymbol > bSymbol ? 1 : 0
        }
      })
      .map(k => {
        let balance = 0
        let usdPrice = 0
        // only update if we have data
        if (k === 'ETH' && allBalances && allBalances[k]) {
          balance = formatEthBalance(allBalances[k].balance)
          usdPrice = formatToUsd(allBalances[k].usdPrice)
        } else if (allBalances && allBalances[k]) {
          balance = formatTokenBalance(allBalances[k].balance, allBalances[k].decimal)
          usdPrice = formatToUsd(allBalances[k].usdPrice)
        }
        return {
          name: allTokens[k].name,
          symbol: allTokens[k].symbol,
          address: k,
          balance: balance,
          usdPrice: usdPrice
        }
      })
  }, [allBalances, allTokens])
  const filteredTokenList = useMemo(() => {
    return tokenList.filter(tokenEntry => {
      // check the regex for each field
      const regexMatches = Object.keys(tokenEntry).map(tokenEntryKey => {
        return (
          tokenEntry[tokenEntryKey] &&
          !!tokenEntry[tokenEntryKey].match(new RegExp(escapeStringRegex(searchQuery), 'i'))
        )
      })

      return regexMatches.some(m => m)
    })
  }, [tokenList, searchQuery])

  function _onTokenSelect(address) {
    setSearchQuery('')
    onTokenSelect(address)
    onDismiss()
  }

  function getUsd(balance, usdPrice) {
    if (balance === '<0.0001') {
      balance = 0
    }
    if (isNaN(usdPrice)) {
      usdPrice = 0
    }
    let x = formatToUsd(balance * usdPrice)
    return x
  }

  function renderTokenList() {
    if (isAddress(searchQuery) && exchangeAddress === undefined) {
      return <TokenModalInfo>Searching for Exchange...</TokenModalInfo>
    }
    if (isAddress(searchQuery) && exchangeAddress === ethers.constants.AddressZero) {
      return (
        <>
          <TokenModalInfo>{t('noExchange')}</TokenModalInfo>
          <TokenModalInfo>
            <Link to={`/create-exchange/${searchQuery}`}>{t('createExchange')}</Link>
          </TokenModalInfo>
        </>
      )
    }
    if (!filteredTokenList.length) {
      return <TokenModalInfo>{t('noExchange')}</TokenModalInfo>
    }

    return filteredTokenList.map(({ address, symbol, name, balance, usdPrice }) => {
      return (
        <TokenModalRow key={address} onClick={() => _onTokenSelect(address)}>
          <TokenRowLeft>
            <TokenLogo address={address} size={'2rem'} />
            <TokenSymbolGroup>
              <span id="symbol">{symbol}</span>
              <TokenFullName>{name}</TokenFullName>
            </TokenSymbolGroup>
          </TokenRowLeft>
          <TokenRowRight>
            {balance ? (
              <TokenRowBalance>{balance && (balance > 0 || balance === '<0.0001') ? balance : '-'}</TokenRowBalance>
            ) : (
              <SpinnerWrapper src={Circle} alt="loader" />
            )}
            <TokenRowUsd>
              {getUsd(balance, usdPrice) > 0 || balance === '<0.0001' ? '$' + getUsd(balance, usdPrice) : ''}
            </TokenRowUsd>
          </TokenRowRight>
        </TokenModalRow>
      )
    })
  }

  // manage focus on modal show
  const inputRef = useRef()

  function onInput(event) {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }

  function clearInputAndDismiss() {
    setSearchQuery('')
    onDismiss()
  }

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={clearInputAndDismiss}
      minHeight={60}
      initialFocusRef={isMobile ? undefined : inputRef}
    >
      <TokenModal>
        <ModalHeader>
          <p>Select Token</p>
          <CloseIcon onClick={clearInputAndDismiss}>
            <img src={close} alt={'close icon'} />
          </CloseIcon>
        </ModalHeader>
        <SearchContainer>
          <img src={SearchIcon} alt="search" />
          <StyledBorderlessInput
            ref={inputRef}
            type="text"
            placeholder={isMobile ? t('searchOrPasteMobile') : t('searchOrPaste')}
            onChange={onInput}
          />
        </SearchContainer>
        <TokenList>{renderTokenList()}</TokenList>
      </TokenModal>
    </Modal>
  )
}
