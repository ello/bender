import { BackAndroid } from 'react-native'
import HawkWrapper from './hawk_wrapper'
import App from '../../App'

export const getJSState = () => {
  const state = App.store.getState()
  return JSON.stringify(state)
}

export const test = 'test'

export const sendStateAndExit = () =>
  HawkWrapper.put('updateFromReact', 'true', () => {
    HawkWrapper.put('jsState', getJSState(), () => BackAndroid.exitApp())
  })
