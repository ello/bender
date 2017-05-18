import Immutable from 'immutable'
import React, { PureComponent } from 'react'
import { StatusBar, View } from 'react-native'
import EditorContainer from './EditorContainer'
import ImagePickerContainer from './ImagePickerContainer'
import ModalContainer from './ModalContainer'
import HawkWrapper from '../lib/hawk_wrapper'

class AppContainer extends PureComponent {

  state = {
    comment: null,
    initialRoute: null,
    isComment: null,
    kind: null,
    post: null,
  }

  componentWillMount() {
    HawkWrapper.getItems(['comment', 'initialRoute', 'isComment', 'kind', 'post', 'text'], (values) => {
      const [comment, initialRoute, isComment, kind, post, text] = values
      this.setState({
        comment,
        initialRoute,
        isComment,
        kind,
        post,
        text,
      })
    })
  }

  render() {
    const { comment, initialRoute, isComment, kind, post, text } = this.state
    const editorProps = {
      comment: comment ? Immutable.fromJS(JSON.parse(comment)) : Immutable.Map(),
      isComment: isComment === 'true',
      post: post ? Immutable.fromJS(JSON.parse(post)) : Immutable.Map(),
      text,
    }
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden />
        {initialRoute === 'editor' && <EditorContainer {...editorProps} />}
        {initialRoute === 'imagePicker' && <ImagePickerContainer kind={kind} />}
        <ModalContainer />
      </View>
    )
  }
}

export default AppContainer

