import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import { StatusBar, View } from 'react-native'
import Editor from '../components/editor/Editor'
import ModalContainer from './ModalContainer'

class AppContainer extends PureComponent {

  static propTypes = {
    comment: PropTypes.string,
    isComment: PropTypes.bool,
    post: PropTypes.string,
  }

  static defaultProps = {
    comment: null,
    isComment: false,
    post: null,
  }

  render() {
    const { comment, isComment, post } = this.props
    const editorProps = {
      comment: comment ? Immutable.fromJS(JSON.parse(comment)) : Immutable.Map(),
      isComment,
      post: post ? Immutable.fromJS(JSON.parse(post)) : Immutable.Map(),
    }
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden />
        <Editor {...editorProps} />
        <ModalContainer />
      </View>
    )
  }
}

export default AppContainer

