import React, { PropTypes, PureComponent } from 'react'
import {
  Dimensions,
  TextInput,
} from 'react-native'
import Block from './Block'
import { emojiRegex, userRegex } from '../completers/Completer'

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
    onEmojiCompleter: PropTypes.func.isRequired,
    onHideCompleter: PropTypes.func.isRequired,
    onUserCompleter: PropTypes.func.isRequired,
  }

  state = {
    text: '',
    viewHeight: 200,
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

  onSelectionChange = ({ nativeEvent: { selection: { start, end } } }) => {
    // if start === end then this is just a cursor position not a range
    if (start === end) {
      const word = this.getWordFromPosition(end)
      console.log('word', word)

      const { onEmojiCompleter, onHideCompleter, onUserCompleter } = this.context
      if (word.match(userRegex)) {
        onUserCompleter({ word })
      } else if (word.match(emojiRegex)) {
        onEmojiCompleter({ word })
      // } else if (e.target.classList.contains('LocationControl')) {
      //   callMethod('onLocationCompleter', { location: e.target.value })
      } else {
        onHideCompleter()
      }
    }
  }

  onContentSizeChange = ({ nativeEvent: { contentSize: { height } } }) => {
    this.setState({ viewHeight: height + 20 })
  }

  getWordFromPosition(pos) {
    const letterArr = this.state.text.split('')
    const letters = []
    let index = pos - 1
    while (index > -1) {
      const letter = letterArr[index]
      index -= 1
      if (!letter) break
      if (letter.match(/\s/)) {
        break
      } else if (letter.match(/:/)) {
        letters.unshift(letter)
        break
      } else {
        letters.unshift(letter)
      }
    }
    return letters.join('')
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
          onSelectionChange={this.onSelectionChange}
          placeholder={!hasContent ? 'Say Ello...' : null}
          style={{ width: Dimensions.get('window').width - 42, height: viewHeight }}
          underlineColorAndroid="transparent"
        />
      </Block>
    )
  }
}

