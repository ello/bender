import { BackAndroid } from 'react-native'
import HawkWrapper from './hawk_wrapper'
import store from '../store'

export const getJSState = () => {
  const jsState = {}
  const state = store.getState()
  Object.keys(state).forEach(key => (jsState[key] = state[key].toJS()))
  return JSON.stringify(jsState)
}

export const sendStateAndExit = () =>
  HawkWrapper.put('updateFromReact', 'true', () => {
    HawkWrapper.put('jsState', getJSState(), () => BackAndroid.exitApp())
  })
