import React, { PureComponent } from 'react'
import { AsyncStorage, Text, View } from 'react-native'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import store from './src/store'
import AppContainer from './src/containers/AppContainer'

const whitelist = ['authentication', 'editor', 'gui', 'json', 'profile']
export default class App extends PureComponent {

  state = {
    rehydrated: false,
  }

  componentWillMount() {
    persistStore(
      store,
      { storage: AsyncStorage, transforms: [immutableTransform()], whitelist },
      () => this.setState({ rehydrated: true }),
    )
  }

  render() {
    return this.state.rehydrated ?
      <Provider store={store}>
        <AppContainer />
      </Provider>
      :
      <View><Text>Loading...</Text></View>
  }
}

