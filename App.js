import React from 'react'
import { Provider } from 'react-redux'
import Editor from './src/components/editor/Editor'
import store from './src/store'

const App = () =>
  <Provider store={store}>
    <Editor />
  </Provider>

export default App

