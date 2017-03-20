import React, { PureComponent } from 'react'
import { StatusBar, View } from 'react-native'
import Editor from '../components/editor/Editor'

class AppContainer extends PureComponent {

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden />
        <Editor />
      </View>
    )
  }
}

export default AppContainer

