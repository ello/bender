import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import { StatusBar, View } from 'react-native'
import EditorContainer from './EditorContainer'
import ImagePickerContainer from './ImagePickerContainer'
import ModalContainer from './ModalContainer'

class AppContainer extends PureComponent {

  static propTypes = {
    comment: PropTypes.string,
    initialRoute: PropTypes.string.isRequired,
    isComment: PropTypes.string,
    kind: PropTypes.string,
    post: PropTypes.string,
  }

  static defaultProps = {
    comment: null,
    isComment: false,
    kind: '',
    post: null,
  }

  render() {
    const { comment, initialRoute, isComment, kind, post } = this.props
    const editorProps = {
      comment: comment ? Immutable.fromJS(JSON.parse(comment)) : Immutable.Map(),
      isComment: isComment === 'true',
      post: post ? Immutable.fromJS(JSON.parse(post)) : Immutable.Map(),
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

