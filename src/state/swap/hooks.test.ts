import { parse } from 'qs'
import { Field } from './actions'
import { queryParametersToSwapState, tryParseAmount } from './hooks'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

describe('hooks', () => {
  describe('#tryParseAmount', () => {
    it('should return undefined if amount is not a number or 0', () => {
      expect(tryParseAmount(undefined, undefined)).toBeUndefined()
      expect(tryParseAmount('', undefined)).toBeUndefined()
      expect(tryParseAmount('abc', undefined)).toBeUndefined()
      expect(tryParseAmount('0', undefined)).toBeUndefined()
    })

    it('should return a CurrencyAmount', () => {
      const currency = new Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 6)

      expect(tryParseAmount('20.05', currency)?.toSignificant(6)).toEqual(
        CurrencyAmount.fromRawAmount(currency, JSBI.BigInt('20050000')).toSignificant()
      )
      expect(tryParseAmount('20.123456789', currency)?.toSignificant(6)).toEqual(
        CurrencyAmount.fromRawAmount(currency, JSBI.BigInt('20123400')).toSignificant()
      )
      expect(tryParseAmount('0.123456789', currency)?.toSignificant(6)).toEqual(
        CurrencyAmount.fromRawAmount(currency, JSBI.BigInt('0123456')).toSignificant()
      )
    })
  })

  describe('#queryParametersToSwapState', () => {
    test('ETH to DAI', () => {
      expect(
        queryParametersToSwapState(
          parse(
            '?inputCurrency=ETH&outputCurrency=0x6b175474e89094c44da98b954eedeac495271d0f&exactAmount=20.5&exactField=outPUT',
            { parseArrays: false, ignoreQueryPrefix: true }
          )
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
        [Field.INPUT]: { currencyId: 'ETH' },
        typedValue: '20.5',
        independentField: Field.OUTPUT,
        recipient: null,
      })
    })

    test('does not duplicate eth for invalid output token', () => {
      expect(
        queryParametersToSwapState(parse('?outputCurrency=invalid', { parseArrays: false, ignoreQueryPrefix: true }))
      ).toEqual({
        [Field.INPUT]: { currencyId: 'ETH' },
        [Field.OUTPUT]: { currencyId: '' },
        typedValue: '',
        independentField: Field.INPUT,
        recipient: null,
      })
    })

    test('output ETH only', () => {
      expect(
        queryParametersToSwapState(
          parse('?outputCurrency=eth&exactAmount=20.5', { parseArrays: false, ignoreQueryPrefix: true })
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'ETH' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '20.5',
        independentField: Field.INPUT,
        recipient: null,
      })
    })

    test('invalid recipient', () => {
      expect(
        queryParametersToSwapState(
          parse('?outputCurrency=eth&exactAmount=20.5&recipient=abc', { parseArrays: false, ignoreQueryPrefix: true })
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'ETH' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '20.5',
        independentField: Field.INPUT,
        recipient: null,
      })
    })

    test('valid recipient', () => {
      expect(
        queryParametersToSwapState(
          parse('?outputCurrency=eth&exactAmount=20.5&recipient=0x0fF2D1eFd7A57B7562b2bf27F3f37899dB27F4a5', {
            parseArrays: false,
            ignoreQueryPrefix: true,
          })
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'ETH' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '20.5',
        independentField: Field.INPUT,
        recipient: '0x0fF2D1eFd7A57B7562b2bf27F3f37899dB27F4a5',
      })
    })
    test('accepts any recipient', () => {
      expect(
        queryParametersToSwapState(
          parse('?outputCurrency=eth&exactAmount=20.5&recipient=bob.argent.xyz', {
            parseArrays: false,
            ignoreQueryPrefix: true,
          })
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'ETH' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '20.5',
        independentField: Field.INPUT,
        recipient: 'bob.argent.xyz',
      })
    })
  })
})
