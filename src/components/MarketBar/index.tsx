import React from 'react'

import styled from 'styled-components'

const MarketBarWrap = styled.div<{ barColor?: string; width?: string; height?: string }>`
  background: ${({ barColor, theme }) => barColor ?? theme.bg3};
  height: ${({ height }) => height ?? '4px'};
  width: ${({ width }) => width ?? '100%'};
  border-radius: 2px;
`

const FillBar = styled.div<{ rate: number; fillColor?: string }>`
  background: ${({ fillColor, theme }) => fillColor ?? theme.primary1};
  width: ${({ rate }) => rate}%;
  height: 100%;
  border-radius: 2px;
`

interface MarketBarProps {
  rate: number
  barColor?: string
  fillColor?: string
  width?: string
  height?: string
}

export default function MarketBar({ rate, barColor, fillColor, width, height }: MarketBarProps) {
  return (
    <MarketBarWrap barColor={barColor} width={width} height={height}>
      <FillBar rate={rate} fillColor={fillColor}></FillBar>
    </MarketBarWrap>
  )
}