import React, { useCallback, useContext } from 'react'
import { VictoryArea, VictoryLine, VictoryBrushContainer, VictoryAxis, VictoryChart, VictoryLabel } from 'victory'
import useTheme from 'hooks/useTheme'
import { Currency, Price, Token } from '@uniswap/sdk-core'
import { useColor } from 'hooks/useColor'
import { Brush } from './Brush'
import Loader from 'components/Loader'
import styled from 'styled-components'
import { Box } from 'rebass'
import { Trans } from '@lingui/macro'
import { XCircle } from 'react-feather'
import { TYPE } from '../../theme'
import { ColumnCenter } from 'components/Column'
import { useDensityChartData, ChartEntry, ChartContext } from './hooks'
import { LiquidityChartRangeInput } from '../LiquidityChartRangeInput'
import { lighten, linearGradient, saturate } from 'polished'
import { batch } from 'react-redux'

const sampleData: Partial<ChartEntry>[] = [
  { price0: 0, activeLiquidity: 1 },
  { price0: 1, activeLiquidity: 2 },
  { price0: 2, activeLiquidity: 3 },
  { price0: 3, activeLiquidity: 6 },
  { price0: 4, activeLiquidity: 5 },
  { price0: 5, activeLiquidity: 3 },
  { price0: 6, activeLiquidity: 2 },
]

const Wrapper = styled(Box)`
  position: relative;
  height: 250px;

  display: grid;
  justify-content: center;
  align-content: center;
`

export default function DensityChart({
  price,
  currencyA,
  currencyB,
  feeAmount,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  interactive,
}: {
  price: string | undefined
  currencyA: Currency | undefined
  currencyB: Currency | undefined
  feeAmount?: number
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  interactive: boolean
}) {
  const { zoom } = useContext(ChartContext)

  const theme = useTheme()

  const tokenAColor = useColor(currencyA?.wrapped)
  const tokenBColor = useColor(currencyB?.wrapped)

  const { loading, activeChartEntry, formattedData } = useDensityChartData({
    currencyA,
    currencyB,
    feeAmount,
  })

  const onBrushDomainChangeEnded = useCallback(
    (domain) => {
      const leftRangeValue = Number(domain[0])
      const rightRangeValue = Number(domain[1])

      batch(() => {
        // simulate user input for auto-formatting and other validations
        leftRangeValue > 0 && onLeftRangeInput(leftRangeValue.toFixed(6))
        rightRangeValue > 0 && onRightRangeInput(rightRangeValue.toFixed(6))
      })
    },
    [onLeftRangeInput, onRightRangeInput]
  )

  const isSorted = currencyA && currencyB && currencyA?.wrapped.sortsBefore(currencyB?.wrapped)

  const leftPrice = isSorted ? priceLower : priceUpper?.invert()
  const rightPrice = isSorted ? priceUpper : priceLower?.invert()

  if (loading) {
    return (
      <Wrapper>
        <Loader stroke={theme.text4} />
      </Wrapper>
    )
  }

  interactive = interactive && Boolean(formattedData?.length)

  return (
    <Wrapper>
      {formattedData === [] ? (
        <ColumnCenter>
          <XCircle stroke={theme.text4} />
          <TYPE.darkGray padding={10}>
            <Trans>No data</Trans>
          </TYPE.darkGray>
        </ColumnCenter>
      ) : (
        <>
          {!formattedData || !price ? (
            <div>Loading</div>
          ) : (
            <LiquidityChartRangeInput
              data={{ series: formattedData, current: parseFloat(price) }}
              dimensions={{ width: 350, height: 250 }}
              margins={{ top: 20, right: 20, bottom: 20, left: 20 }}
              styles={{
                area: {
                  fill: theme.blue1,
                  stroke: theme.blue2,
                },
                current: {
                  stroke: theme.text1,
                },
                axis: {
                  fill: theme.text1,
                },
                brush: {
                  selection: {
                    fill0: tokenAColor ?? theme.red1,
                    fill1: tokenBColor ?? theme.blue1,
                  },
                  handle: {
                    west: saturate(0.1, tokenAColor) ?? theme.red1,
                    east: saturate(0.1, tokenBColor) ?? theme.blue1,
                  },
                  tooltip: {
                    fill: theme.bg2,
                    color: theme.text1,
                  },
                },
                focus: {
                  stroke: theme.red1,
                },
              }}
              brushDomain={
                leftPrice && rightPrice
                  ? [parseFloat(leftPrice?.toSignificant(5)), parseFloat(rightPrice?.toSignificant(5))]
                  : undefined
              }
              brushLabels={(x: number) => (price ? `${((x / parseFloat(price) - 1) * 100).toFixed(2)}%` : undefined)}
              onBrushDomainChange={onBrushDomainChangeEnded}
            />
          )}
        </>
      )}
    </Wrapper>
  )
}

//          <VictoryChart
//            height={275}
//            padding={40}
//            minDomain={{ y: 0 }}
//            containerComponent={
//              <VictoryBrushContainer
//                allowDraw={false}
//                allowDrag={interactive}
//                allowResize={interactive}
//                brushDimension="x"
//                brushDomain={
//                  leftPrice && rightPrice
//                    ? {
//                        x: [parseFloat(leftPrice?.toSignificant(5)), parseFloat(rightPrice?.toSignificant(5))],
//                      }
//                    : undefined
//                }
//                brushComponent={
//                  <Brush
//                    leftHandleColor={currencyA ? tokenAColor : theme.primary1}
//                    leftLabel={
//                      price && leftPrice
//                        ? `${((parseFloat(leftPrice.toSignificant(8)) / parseFloat(price) - 1) * 100).toFixed(2)}%`
//                        : undefined
//                    }
//                    rightLabel={
//                      price && rightPrice
//                        ? `${((parseFloat(rightPrice.toSignificant(8)) / parseFloat(price) - 1) * 100).toFixed(2)}%`
//                        : undefined
//                    }
//                    rightHandleColor={currencyB ? tokenBColor : theme.secondary1}
//                    allowDrag={interactive}
//                  />
//                }
//                onBrushDomainChangeEnd={(domain) => {
//                  const leftRangeValue = Number(domain.x[0])
//                  const rightRangeValue = Number(domain.x[1])
//
//                  // simulate user input for auto-formatting and other validations
//                  leftRangeValue > 0 && onLeftRangeInput(leftRangeValue.toFixed(6))
//                  rightRangeValue > 0 && onRightRangeInput(rightRangeValue.toFixed(6))
//                }}
//                handleWidth={30 /* handle width must be as large as handle head */}
//              />
//            }
//          >
//            <VictoryArea
//              data={filteredData ? filteredData : sampleData}
//              style={{ data: { stroke: theme.blue1, fill: theme.blue1, opacity: '0.5' } }}
//              x={'price0'}
//              y={'activeLiquidity'}
//              interpolation="step"
//            />
//
//            {price && (
//              <VictoryLine
//                data={
//                  maxLiquidity && price
//                    ? [
//                        { x: parseFloat(price), y: 0 },
//                        { x: parseFloat(price), y: maxLiquidity },
//                      ]
//                    : []
//                }
//                labels={({ datum }) => (datum.y !== 0 ? price : '')}
//                labelComponent={
//                  <VictoryLabel
//                    renderInPortal
//                    dy={-10}
//                    style={{ fill: theme.primaryText1, fontWeight: 500, fontSize: 15 }}
//                  />
//                }
//                style={{
//                  data: { stroke: theme.text1, opacity: '0.5' },
//                }}
//              />
//            )}
//
//            <VictoryAxis
//              fixLabelOverlap={true}
//              style={{
//                tickLabels: {
//                  fill: theme.text1,
//                  opacity: '0.6',
//                },
//              }}
//            />
//          </VictoryChart>
