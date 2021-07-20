import compareLogs from './compareLogs'

describe('#compareLogs', () => {
  it('first compares my block number', () => {
    expect(
      compareLogs(
        {
          blockNumber: 1,
          transactionIndex: 1,
          logIndex: 1,
        },
        { blockNumber: 2, transactionIndex: 0, logIndex: 0 }
      )
    ).toEqual(-1)
  })
  it('second compares by transaction index number', () => {
    expect(
      compareLogs(
        {
          blockNumber: 2,
          transactionIndex: 2,
          logIndex: 1,
        },
        { blockNumber: 2, transactionIndex: 4, logIndex: 0 }
      )
    ).toEqual(-2)
  })
  it('third compares by log index', () => {
    expect(
      compareLogs(
        {
          blockNumber: 2,
          transactionIndex: 2,
          logIndex: 5,
        },
        { blockNumber: 2, transactionIndex: 2, logIndex: 8 }
      )
    ).toEqual(-3)
  })

  it('can be used to sort logs', () => {
    const logA = {
      blockNumber: 2,
      transactionIndex: 2,
      logIndex: 5,
    }
    const logB = { blockNumber: 2, transactionIndex: 2, logIndex: 8 }
    expect([logA, logB].sort(compareLogs)).toEqual([logA, logB])
    expect([logB, logA].sort(compareLogs)).toEqual([logA, logB])
  })
})
