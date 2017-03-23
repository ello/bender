import React, { PropTypes, PureComponent } from 'react'
import {
  Dimensions,
  KeyboardAvoidingView,
  TextInput,
  View,
} from 'react-native'
import Block from './Block'
import Completer, { emojiRegex, userRegex } from '../completers/Completer'

export default class TextBlock extends PureComponent {


  static propTypes = {
    completions: PropTypes.object,
    data: PropTypes.string,
    hasContent: PropTypes.bool.isRequired,
    isCompleterActive: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    uid: PropTypes.number.isRequired,
  }

  static defaultProps = {
    completions: null,
    data: '',
  }

  static contextTypes = {
    onCheckForEmbeds: PropTypes.func.isRequired,
    onEmojiCompleter: PropTypes.func.isRequired,
    onHideCompleter: PropTypes.func.isRequired,
    onUserCompleter: PropTypes.func.isRequired,
  }

  state = {
    text: this.props.data,
    viewHeight: 200,
  }

  componentDidMount() {
    this.getWordFromPosition(this.props.data.length)
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
    this.startIndex = start
    this.endIndex = end
    // if start === end then this is just a cursor position not a range
    if (start === end) {
      const word = this.getWordFromPosition(end)
      const { onEmojiCompleter, onHideCompleter, onUserCompleter } = this.context
      if (word.match(userRegex)) {
        this.setState({ completerType: 'user' })
        onUserCompleter({ word })
      } else if (word.match(emojiRegex)) {
        this.setState({ completerType: 'emoji' })
        onEmojiCompleter({ word })
      // } else if (e.target.classList.contains('LocationControl')) {
      //   callMethod('onLocationCompleter', { location: e.target.value })
      } else {
        this.setState({ completerType: null })
        onHideCompleter()
      }
    }
  }

  onCompletion = ({ value }) => {
    const { completerType, text } = this.state
    let newValue = value
    if (completerType === 'user') {
      newValue = `@${value}`
    } else if (completerType === 'emoji') {
      newValue = `:${value}:`
    }
    this.onChangeText(text.replace(text.slice(this.startIndex, this.endIndex), newValue))
    this.context.onHideCompleter()
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
    this.startIndex = index + 1
    return letters.join('')
  }

  render() {
    const { completions, data, hasContent, isCompleterActive, uid } = this.props
    const { viewHeight } = this.state
    return (
      <View>
        <Block hasContent={hasContent && data.length > 0} uid={uid}>
          <TextInput
            defaultValue={data}
            multiline
            onBlur={this.context.onHideCompleter}
            onChangeText={this.onChangeText}
            onContentSizeChange={this.onContentSizeChange}
            onSelectionChange={this.onSelectionChange}
            placeholder={!hasContent ? 'Say Ello...' : null}
            style={{ width: Dimensions.get('window').width - 42, height: viewHeight }}
            underlineColorAndroid="transparent"
          />
        </Block>
        <KeyboardAvoidingView behavior="position">
          <Completer
            completions={completions}
            isCompleterActive={isCompleterActive}
            onCancel={this.onCancelAutoCompleter}
            onCompletion={this.onCompletion}
          />
        </KeyboardAvoidingView>
      </View>
    )
  }
}

