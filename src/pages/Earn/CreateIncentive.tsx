import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { useV3Staker } from 'hooks/useContract'
import { ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import { Currency } from '@uniswap/sdk-core'
import { BlueCard } from 'components/Card'
import { tryParseAmount } from 'state/swap/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { ButtonPrimary } from 'components/Button'
import { computePoolAddress, FeeAmount, toHex } from '@uniswap/v3-sdk'
import FeeSelector from 'components/FeeSelector'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from 'state/transactions/hooks'

function dateTimeToUnixSeconds(dateTimeString: string): number {
  return Math.floor(new Date(dateTimeString).getTime() / 1000)
}

export default function CreateIncentive() {
  const { account, chainId } = useActiveWeb3React()

  const staker = useV3Staker()

  const [currencyA, setCurrencyA] = useState<Currency | undefined>(undefined)
  const [currencyB, setCurrencyB] = useState<Currency | undefined>(undefined)

  const [refundee, setRefundee] = useState<string | undefined>(account ?? '')

  const [currencyC, setCurrencyC] = useState<Currency | undefined>(undefined)
  const [rewardTyped, setRewardTyped] = useState<string>('')
  const rewardAmount = tryParseAmount(rewardTyped, currencyC)

  const [approval, approveCallback] = useApproveCallback(rewardAmount, staker?.address)

  const [feeAmount, setFeeAmount] = useState<FeeAmount | undefined>()

  const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]

  const addTransaction = useTransactionAdder()

  const poolAddress = useMemo(() => {
    if (currencyA && currencyB && feeAmount && v3CoreFactoryAddress) {
      return computePoolAddress({
        factoryAddress: v3CoreFactoryAddress,
        tokenA: currencyA?.wrapped,
        tokenB: currencyB.wrapped,
        fee: feeAmount,
      })
    }
    return undefined
  }, [currencyA, currencyB, feeAmount, v3CoreFactoryAddress])

  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')

  const handleCreate = async () => {
    if (
      staker &&
      currencyA &&
      currencyB &&
      rewardAmount &&
      currencyC &&
      startTime &&
      endTime &&
      refundee &&
      poolAddress
    ) {
      staker
        .createIncentive(
          {
            rewardToken: currencyC.wrapped.address,
            pool: poolAddress,
            startTime: dateTimeToUnixSeconds(startTime),
            endTime: dateTimeToUnixSeconds(endTime),
            refundee,
          },
          toHex(rewardAmount.quotient)
        )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Create incentive',
          })
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
  }

  const handleChangeStartTime: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setStartTime(e.target.value)
  }, [])
  const handleChangeEndTime: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setEndTime(e.target.value)
  }, [])

  return (
    <AutoColumn gap="30px">
      <div>CreateIncentive</div>
      <AutoColumn gap="4px">
        <div>TokenA in incentivized pool</div>
        <CurrencyInputPanel
          value=""
          currency={currencyA}
          onUserInput={() => null}
          hideInput={true}
          showMaxButton={false}
          onCurrencySelect={(currency) => {
            setCurrencyA(currency)
          }}
          id="token-select-a"
        />
      </AutoColumn>
      <AutoColumn gap="4px">
        <div>TokenB in incentivized pool</div>
        <CurrencyInputPanel
          value=""
          currency={currencyB}
          onUserInput={() => null}
          hideInput={true}
          showMaxButton={false}
          onCurrencySelect={(currency) => {
            setCurrencyB(currency)
          }}
          id="token-select-b"
        />
      </AutoColumn>
      <FeeSelector
        feeAmount={feeAmount}
        handleFeePoolSelect={(val) => setFeeAmount(val)}
        currencyA={currencyA}
        currencyB={currencyB}
      />

      <AutoColumn gap="4px" style={{ width: '400px' }}>
        <div>Reward token</div>
        <CurrencyInputPanel
          value={rewardTyped}
          currency={currencyC}
          onUserInput={(val) => {
            setRewardTyped(val)
          }}
          showMaxButton={false}
          onCurrencySelect={(currency) => {
            setCurrencyC(currency)
          }}
          id="token-select-b"
        />
      </AutoColumn>
      <BlueCard>
        <AutoColumn gap="4px">
          <div>Start time</div>
          <input type="datetime-local" value={startTime} onChange={handleChangeStartTime} style={{ width: '400px' }} />
        </AutoColumn>
      </BlueCard>
      <BlueCard>
        <AutoColumn gap="4px">
          <div>End time</div>
          <input type="datetime-local" value={endTime} onChange={handleChangeEndTime} style={{ width: '400px' }} />
        </AutoColumn>
      </BlueCard>
      <AutoColumn gap="4px">
        <div>Refundee Address</div>
        <input value={refundee} onChange={(e) => setRefundee(e.target.value)} />
      </AutoColumn>
      {approval === ApprovalState.APPROVED ? null : <ButtonPrimary onClick={approveCallback}>Approve</ButtonPrimary>}
      <ButtonPrimary disabled={approval !== ApprovalState.APPROVED} onClick={handleCreate}>
        Create
      </ButtonPrimary>
    </AutoColumn>
  )
}
