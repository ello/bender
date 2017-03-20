import React from 'react'
import { AsyncStorage } from 'react-native'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import store from './src/store'
import AppContainer from './src/containers/AppContainer'

const App = () =>
  <Provider store={store}>
    <AppContainer />
  </Provider>

const whitelist = ['authentication', 'editor', 'gui', 'json', 'profile']
persistStore(store, { storage: AsyncStorage, transforms: [immutableTransform()], whitelist })

export default App

