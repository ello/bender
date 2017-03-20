import React, { Component, PropTypes } from 'react'
import {
  Dimensions,
  TextInput,
} from 'react-native'
import Block from './Block'

export default class TextBlock extends Component {

  static propTypes = {
    data: PropTypes.string,
    hasContent: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    uid: PropTypes.number.isRequired,
  }

  static defaultProps = {
    data: '',
  }

  state = {
    viewHeight: 200,
  }

  onChangeText = (text) => {
    const { onChange, uid } = this.props
    onChange({ uid, data: text, kind: 'text' })
  }

  onContentSizeChange = ({ nativeEvent: { contentSize: { height } } }) => {
    this.setState({ viewHeight: height + 20 })
  }

  render() {
    const { data, hasContent, uid } = this.props
    const { viewHeight } = this.state
    return (
      <Block hasContent={hasContent && data.length > 0} uid={uid}>
        <TextInput
          defaultValue={data}
          multiline
          onChangeText={this.onChangeText}
          onContentSizeChange={this.onContentSizeChange}
          style={{ width: Dimensions.get('window').width - 42, height: viewHeight }}
          underlineColorAndroid="transparent"
        />
      </Block>
    )
  }
}

