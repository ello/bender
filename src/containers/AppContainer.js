import React, { PureComponent } from 'react'
import { StatusBar, View } from 'react-native'
import Editor from '../components/editor/Editor'
import ModalContainer from './ModalContainer'

class AppContainer extends PureComponent {

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden />
        <Editor />
        <ModalContainer />
      </View>
    )
  }
}

export default AppContainer

