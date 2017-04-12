const billion = 1000000000.0
const million = 1000000.0
const thousand = 1000.0

export function numberToHuman(number, showZero = true, precision = 1) {
  if (number === 0 && !showZero) { return '' }
  // `10 ** precision` causes :app:bundleReleaseJsAndAssets to fail, use `Math.pow()` instead.
  // http://stackoverflow.com/questions/41903731/react-native-bundling-syntaxerror-unexpected-token-operator
  const roundingFactor = Math.pow(10, precision) // eslint-disable-line
  let num
  let suffix
  if (number >= billion) {
    num = Math.round((number / billion) * roundingFactor) / roundingFactor
    suffix = 'B'
  } else if (number >= million) {
    num = Math.round((number / million) * roundingFactor) / roundingFactor
    suffix = 'M'
  } else if (number >= thousand) {
    num = Math.round((number / thousand) * roundingFactor) / roundingFactor
    suffix = 'K'
  } else {
    num = Math.round(number * roundingFactor) / roundingFactor
    suffix = ''
  }
  let strNum = `${num}`
  const strArr = strNum.split('.')
  if (strArr[strArr.length - 1] === '0') {
    strNum = strArr[0]
  }
  return `${strNum}${suffix}`
}

export default numberToHuman

