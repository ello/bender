import React, { PropTypes, PureComponent } from 'react'
import {
  Dimensions,
  TextInput,
} from 'react-native'
import Block from './Block'

export default class TextBlock extends PureComponent {

  static propTypes = {
    data: PropTypes.string,
    hasContent: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    uid: PropTypes.number.isRequired,
  }

  static defaultProps = {
    data: '',
  }

  static contextTypes = {
    onCheckForEmbeds: PropTypes.func.isRequired,
  }

  state = {
    viewHeight: 200,
  }

  onChangeText = (text) => {
    if (/^http\S+$/.test(text)) {
      this.context.onCheckForEmbeds(text)
    }

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

