import { BackAndroid } from 'react-native'
import HawkWrapper from './hawk_wrapper'
import App from '../../App'

export const getJSState = () => {
  const jsState = {}
  const state = App.store.getState()
  Object.keys(state).forEach(key => (jsState[key] = state[key].toJS()))
  return JSON.stringify(jsState)
}

export const sendStateAndExit = () =>
  HawkWrapper.put('updateFromReact', 'true', () => {
    const state = getJSState()
    HawkWrapper.put('jsState', state, () => BackAndroid.exitApp())
  })
