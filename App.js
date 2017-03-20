import React from 'react'
import { Provider } from 'react-redux'
import store from './src/store'
import AppContainer from './src/containers/AppContainer'

const App = () =>
  <Provider store={store}>
    <AppContainer />
  </Provider>

export default App

