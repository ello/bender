import Immutable from 'immutable'
import React, { PureComponent } from 'react'
import { AsyncStorage, Text, View } from 'react-native'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import { createNativeAppStore } from './src/store'
import AppContainer from './src/containers/AppContainer'
import HawkWrapper from './src/lib/hawk_wrapper'

const whitelist = ['authentication', 'editor', 'gui', 'json', 'profile']
export default class App extends PureComponent {

  state = {
    rehydrated: false,
  }

  componentWillMount() {
    HawkWrapper.getItems(['jsState', 'webappDomain', 'webappAuthClientId'], (values) => {
      const [jsState, authDomain, authClientId] = values
      const state = JSON.parse(jsState)
      const immutableState = {}
      Object.keys(state).forEach(key => (immutableState[key] = Immutable.fromJS(state[key])))
      App.store = createNativeAppStore(immutableState)
      App.authDomain = authDomain
      App.authClientId = authClientId
      persistStore(
        App.store,
        { storage: AsyncStorage, transforms: [immutableTransform()], whitelist },
        () => this.setState({ rehydrated: true }),
      ).purge()
    })
    // TODO: figure out what is happening on rehydrate as it seems to kill
    // certain things about the data like the fact that a post isReposting
  }

  render() {
    return this.state.rehydrated ?
      <Provider store={App.store}>
        <AppContainer {...this.props} />
      </Provider>
      :
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}><Text>Loading...</Text></View>
  }
}

