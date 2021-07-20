export async function getOutput() {
  const { InferenceSession, Tensor } = await import('onnxruntime-web')

  const arrayBuffer = await fetch(`${process.env.PUBLIC_URL}/slippage.onnx`).then((response) => response.arrayBuffer())
  const session = await InferenceSession.create(arrayBuffer, {
    executionProviders: ['wasm'],
  })

  const dataA = Float32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  const dataB = Float32Array.from([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120])
  const tensorA = new Tensor('float32', dataA, [3, 4])
  const tensorB = new Tensor('float32', dataB, [4, 3])

  // prepare feeds. use model input names as keys.
  const feeds = { a: tensorA, b: tensorB }

  // feed inputs and run
  const results = await session.run(feeds)

  // read from results
  const dataC = results.c.data
  console.log(dataC)
}

export async function getOutput2() {
  const { InferenceSession, Tensor } = await import('onnxruntime-web')

  const arrayBuffer = await fetch(`${process.env.PUBLIC_URL}/rf_iris.onnx`).then((response) => response.arrayBuffer())
  const session = await InferenceSession.create(arrayBuffer, {
    executionProviders: ['wasm'],
  })

  // 38, 4 (X_test from DeepNote example)
  const X = Float32Array.from(
    [
      [6.1, 2.9, 4.7, 1.4],
      [7.4, 2.8, 6.1, 1.9],
      [6.9, 3.2, 5.7, 2.3],
      [6.7, 3.3, 5.7, 2.5],
      [4.5, 2.3, 1.3, 0.3],
      [5, 3.5, 1.3, 0.3],
      [6.1, 3, 4.9, 1.8],
      [6.2, 2.8, 4.8, 1.8],
      [4.4, 3, 1.3, 0.2],
      [5.8, 2.7, 5.1, 1.9],
      [7.7, 3, 6.1, 2.3],
      [5.2, 3.4, 1.4, 0.2],
      [5.1, 3.5, 1.4, 0.3],
      [6, 2.2, 5, 1.5],
      [7.7, 2.8, 6.7, 2],
      [6.4, 2.8, 5.6, 2.2],
      [5.7, 2.6, 3.5, 1],
      [5, 3.5, 1.6, 0.6],
      [5, 3.4, 1.5, 0.2],
      [6.6, 2.9, 4.6, 1.3],
      [5.5, 4.2, 1.4, 0.2],
      [6.7, 3, 5, 1.7],
      [6, 3, 4.8, 1.8],
      [6.1, 2.6, 5.6, 1.4],
      [4.8, 3.4, 1.9, 0.2],
      [6.1, 2.8, 4.7, 1.2],
      [5.4, 3.4, 1.5, 0.4],
      [7.2, 3, 5.8, 1.6],
      [5.5, 2.6, 4.4, 1.2],
      [4.9, 3.1, 1.5, 0.1],
      [6.8, 3, 5.5, 2.1],
      [5.8, 4, 1.2, 0.2],
      [5.5, 2.3, 4, 1.3],
      [6.8, 3.2, 5.9, 2.3],
      [6.5, 3, 5.2, 2],
      [5.7, 3.8, 1.7, 0.3],
      [5.6, 3, 4.1, 1.3],
      [7, 3.2, 4.7, 1.4],
    ].flat()
  )
  const tensor = new Tensor('float32', X, [38, 4])
  const input = session.inputNames[0]
  const feed = { [input]: tensor }
  try {
    console.log('feed', feed)
    const results = await session.run(feed, { logSeverityLevel: 0, logVerbosityLevel: 10 })
    console.log('results', results)
  } catch (error) {
    console.log('error: ', error) // random number (eg. 9062152)
  }
}
