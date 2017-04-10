import React, { PropTypes, PureComponent } from 'react'
import Immutable from 'immutable'
import { AsyncStorage, Text, View } from 'react-native'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import { createNativeAppStore } from './src/store'
import AppContainer from './src/containers/AppContainer'

const whitelist = ['authentication', 'editor', 'gui', 'json', 'profile']
export default class App extends PureComponent {

  static propTypes = {
    AUTH_JSON: PropTypes.string.isRequired,
  }

  state = {
    rehydrated: false,
  }

  componentWillMount() {
    console.log(this.props)
    this.store = createNativeAppStore({
      authentication: Immutable.fromJS(JSON.parse(this.props.AUTH_JSON)),
    })
    persistStore(
      this.store,
      { storage: AsyncStorage, transforms: [immutableTransform()], whitelist },
      () => this.setState({ rehydrated: true }),
    )
  }

  render() {
    return this.state.rehydrated ?
      <Provider store={this.store}>
        <AppContainer />
      </Provider>
      :
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}><Text>Loading...</Text></View>
  }
}

