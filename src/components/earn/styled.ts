import styled from 'styled-components/macro'
import { AutoColumn } from '../Column'

import uImage from '../../assets/images/earn-bg-image.png'
import xlUnicorn from '../../assets/images/xl_uni.png'
import noise from '../../assets/images/noise.png'

export const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  border-radius: 20px;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: ${({ theme }) => theme.blue4};
`

export const CardBGImage = styled.span<{ desaturate?: boolean }>`
  background: url(${uImage});
  width: 800px;
  height: 1200px;
  position: absolute;
  border-radius: 12px;
  opacity: 0.7;
  top: -300px;
  left: -160px;
  transform: rotate(0deg);
  user-select: none;
  ${({ desaturate }) => desaturate && `filter: saturate(0)`}
`

export const CardBGImageSmaller = styled.span<{ desaturate?: boolean }>`
  background: url(${xlUnicorn});
  width: 1200px;
  height: 1200px;
  position: absolute;
  border-radius: 12px;
  top: -300px;
  left: -300px;
  opacity: 0.4;
  user-select: none;

  ${({ desaturate }) => desaturate && `filter: saturate(0)`}
`

export const CardNoise = styled.span`
  background: url(${noise});
  background-size: cover;
  mix-blend-mode: overlay;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
`

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 24px 32px;
  z-index: 1;
  opacity: ${({ disabled }) => disabled && '0.4'};
`

export const Break = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  height: 1px;
`
