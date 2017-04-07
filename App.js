import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import { AsyncStorage, Text, View } from 'react-native'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import { createNativeAppStore } from './src/store'
import AppContainer from './src/containers/AppContainer'

const whitelist = ['authentication', 'editor', 'gui', 'json', 'profile']
export default class App extends PureComponent {

  static propTypes = {
    jsState: PropTypes.string.isRequired,
  }

  state = {
    rehydrated: false,
  }

  componentWillMount() {
    const state = JSON.parse(this.props.jsState)
    const immutableState = {}
    Object.keys(state).forEach(key => (immutableState[key] = Immutable.fromJS(state[key])))
    this.store = createNativeAppStore(immutableState)
    persistStore(
      this.store,
      { storage: AsyncStorage, transforms: [immutableTransform()], whitelist },
      () => this.setState({ rehydrated: true }),
    )
  }

  render() {
    return this.state.rehydrated ?
      <Provider store={this.store}>
        <AppContainer {...this.props} />
      </Provider>
      :
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}><Text>Loading...</Text></View>
  }
}

