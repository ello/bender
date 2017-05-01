import React, { PropTypes, PureComponent } from 'react'
import { TextInput, View } from 'react-native'
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
    onSelectionChange: PropTypes.func.isRequired,
  }

  state = {
    text: this.props.data,
    viewHeight: 60,
  }

  onFocus = () => {
    const { data: text, uid } = this.props
    this.context.onSelectionChange(text.length, text.length, text, uid)
  }

  onChangeText = (text) => {
    if (text === this.state.text) { return }
    if (/^http\S+$/.test(text)) {
      this.context.onCheckForEmbeds(text)
    }
    const { onChange, uid } = this.props
    onChange({ uid, data: text, kind: 'text' })
    this.setState({ text })
  }

  onInternalSelectionChange = ({ nativeEvent: { selection: { start, end } } }) => {
    const { uid } = this.props
    const { text } = this.state
    this.context.onSelectionChange(start, end, text, uid)
  }

  onContentSizeChange = ({ nativeEvent: { contentSize: { height } } }) => {
    this.setState({ viewHeight: height + 20 })
  }

  render() {
    const { data, hasContent, uid } = this.props
    const { viewHeight } = this.state
    return (
      <View>
        <Block hasContent={hasContent && data.length > 0} uid={uid}>
          <TextInput
            defaultValue={data}
            multiline
            onBlur={this.context.onHideCompleter}
            onFocus={this.onFocus}
            onChangeText={this.onChangeText}
            onContentSizeChange={this.onContentSizeChange}
            onSelectionChange={this.onInternalSelectionChange}
            placeholder={!hasContent ? 'Add images, embeds, text & links.' : null}
            style={{ height: viewHeight }}
            underlineColorAndroid="transparent"
          />
        </Block>
      </View>
    )
  }
}

