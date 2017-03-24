import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import {
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { ImagePicker, Permissions } from 'expo'
import {
  addEmptyTextBlock,
  autoCompleteUsers,
  initializeEditor,
  loadEmojis,
  postPreviews,
  removeBlock,
  resetEditor,
  saveAsset,
  setIsCompleterActive,
  updateBlock,
} from '../../actions/editor'
import { createPost } from '../../actions/posts'
import { EDITOR } from '../../constants/action_types'
import { selectCompletions } from '../../selectors/editor'
import { selectEmojis } from '../../selectors/emoji'
import { selectIsCompleterActive } from '../../selectors/gui'
import EmbedBlock from './EmbedBlock'
import ImageBlock from './ImageBlock'
import TextBlock from './TextBlock'
import Completer, { emojiRegex, userRegex } from '../completers/Completer'

const ACTIVE_SERVICE_REGEXES = [
  /(?:.+?)?(?:youtube\.com\/v\/|watch\/|\?v=|&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/,
]
const EDITOR_ID = 'blah'
const IMAGE_QUALITY = 0.8

function mapStateToProps(state) {
  const editor = state.editor.get(EDITOR_ID, Immutable.Map())
  const collection = editor.get('collection')
  const order = editor.get('order')
  return {
    collection,
    completions: selectCompletions(state),
    emojis: selectEmojis(state),
    hasContent: editor.get('hasContent'),
    hasMedia: editor.get('hasMedia'),
    hasMention: editor.get('hasMention'),
    isCompleterActive: selectIsCompleterActive(state),
    isLoading: editor.get('isLoading'),
    isPosting: editor.get('isPosting'),
    order,
  }
}

const toolbarStyle = {
  backgroundColor: '#eee',
  flexDirection: 'row',
  height: 60,
  justifyContent: 'flex-end',
  padding: 10,
}

const buttonStyle = { marginLeft: 10 }
const buttonTextStyle = { backgroundColor: '#000', borderRadius: 20, color: '#fff', paddingHorizontal: 20, paddingVertical: 10 }

class Editor extends Component {

  static propTypes = {
    collection: PropTypes.object,
    completions: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    emojis: PropTypes.object,
    hasContent: PropTypes.bool,
    isCompleterActive: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool,
    isPosting: PropTypes.bool,
    order: PropTypes.object,
  }

  static defaultProps = {
    collection: null,
    completions: null,
    emojis: null,
    hasContent: false,
    isLoading: false,
    isPosting: false,
    order: null,
  }

  static childContextTypes = {
    onCheckForEmbeds: PropTypes.func,
    onClickRemoveBlock: PropTypes.func,
    onEmojiCompleter: PropTypes.func,
    onHideCompleter: PropTypes.func,
    onSelectionChange: PropTypes.func,
    onUserCompleter: PropTypes.func,
  }

  state = {
    completerType: null,
  }

  getChildContext() {
    return {
      onCheckForEmbeds: this.onCheckForEmbeds,
      onClickRemoveBlock: this.onClickRemoveBlock,
      onEmojiCompleter: this.onEmojiCompleter,
      onHideCompleter: this.onHideCompleter,
      onSelectionChange: this.onSelectionChange,
      onUserCompleter: this.onUserCompleter,
    }
  }

  componentWillMount() {
    const { dispatch } = this.props
    dispatch(initializeEditor(EDITOR_ID, true))
  }

  componentDidMount() {
    // TODO: remove this when we have embeds working
    Clipboard.setString('https://www.youtube.com/watch?v=gUGda7GdZPQ')
    const { dispatch } = this.props
    dispatch(addEmptyTextBlock(EDITOR_ID))
  }

  shouldComponentUpdate(nextProps) {
    return !Immutable.is(this.props.collection, nextProps.collection) ||
      !Immutable.is(this.props.completions, nextProps.completions) ||
      !Immutable.is(this.props.order, nextProps.order) ||
      ['hasContent', 'hasMedia', 'hasMention', 'isCompleterActive', 'isLoading', 'isPosting'].some(prop =>
        this.props[prop] !== nextProps[prop],
      )
  }

  onPickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: IMAGE_QUALITY,
    })
    if (!result.cancelled) {
      const { dispatch } = this.props
      dispatch(saveAsset(result.uri, EDITOR_ID, result.width, result.height))
    }
  }

  onTakePictureWithCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        quality: IMAGE_QUALITY,
      })
      if (!result.cancelled) {
        const { dispatch } = this.props
        dispatch(saveAsset(result.uri, EDITOR_ID, result.width, result.height))
      }
    }
  }

  onChangeText = (vo) => {
    const { collection, dispatch } = this.props
    if (collection.getIn([vo.uid, 'data']) !== vo.data) {
      dispatch(updateBlock(vo, vo.uid, EDITOR_ID))
    }
  }

  onCheckForEmbeds = (text) => {
    const { dispatch } = this.props
    ACTIVE_SERVICE_REGEXES.forEach((regex) => {
      if (text.match(regex)) {
        dispatch(postPreviews(text, EDITOR_ID, 0))
      }
    })
  }


  onClickRemoveBlock = (uid) => {
    const { dispatch } = this.props
    Alert.alert(
      'Remove this content?',
      null,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => dispatch(removeBlock(uid, EDITOR_ID)) },
      ],
    )
  }

  onCreatePost = () => {
    const { dispatch } = this.props
    dispatch(createPost(this.serialize(), EDITOR_ID))
  }

  onResetEditor = () => {
    const { dispatch, hasContent } = this.props
    if (!hasContent) {
      // TODO: make this dismiss the editor to go back to whatever was before it
      console.log('dismiss editor')
    } else {
      Alert.alert(
        'Cancel post?',
        null,
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => dispatch(resetEditor(EDITOR_ID)) },
        ],
      )
    }
  }

  onHideCompleter = () => {
    const { completions, dispatch, isCompleterActive } = this.props
    if (isCompleterActive) {
      dispatch(setIsCompleterActive({ isActive: false }))
    }
    if (completions) {
      dispatch({ type: EDITOR.CLEAR_AUTO_COMPLETERS })
    }
  }

  onEmojiCompleter = ({ word }) => {
    const { dispatch, emojis, isCompleterActive } = this.props
    if (!isCompleterActive) {
      dispatch(setIsCompleterActive({ isActive: true }))
    }
    if (emojis && emojis.length) {
      dispatch({
        type: EDITOR.EMOJI_COMPLETER_SUCCESS,
        payload: {
          response: { emojis },
          type: 'emoji',
          word,
        },
      })
    } else {
      dispatch(loadEmojis('emoji', word))
    }
  }

  onUserCompleter = ({ word }) => {
    const { dispatch, isCompleterActive } = this.props
    if (!isCompleterActive) {
      dispatch(setIsCompleterActive({ isActive: true }))
    }
    dispatch(autoCompleteUsers('user', word))
  }

  onCancelAutoCompleter = () => {
    const { dispatch } = this.props
    dispatch({ type: EDITOR.CLEAR_AUTO_COMPLETERS })
    this.onHideCompleter()
    // this.onHideTextTools()
  }

  onCompletion = ({ value }) => {
    const { completerType } = this.state
    const { selectionStart: start, selectionEnd: end, selectionText: text } = this
    let newValue = value
    if (completerType === 'user') {
      newValue = `@${value}`
    } else if (completerType === 'emoji') {
      newValue = `:${value}:`
    }
    const vo = {
      data: this.selectionText.replace(text.slice(start, end), newValue),
      kind: 'text',
      uid: this.selectionUid,
    }
    this.onChangeText(vo)
    this.onHideCompleter()
  }

  onSelectionChange = (start, end, text, uid) => {
    this.selectionStart = start
    this.selectionEnd = end
    this.selectionText = text
    this.selectionUid = uid
    // if start === end then this is just a cursor position not a range
    if (start === end) {
      const word = this.getWordFromPosition(end)
      if (word.match(userRegex)) {
        this.setState({ completerType: 'user' })
        this.onUserCompleter({ word })
      } else if (word.match(emojiRegex)) {
        this.setState({ completerType: 'emoji' })
        this.onEmojiCompleter({ word })
      // } else if (e.target.classList.contains('LocationControl')) {
      //   callMethod('onLocationCompleter', { location: e.target.value })
      } else {
        this.setState({ completerType: null })
        this.onHideCompleter()
      }
    }
  }

  getWordFromPosition(pos) {
    const letterArr = this.selectionText.split('')
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
    this.selectionStart = index + 1
    return letters.join('')
  }

  getBlockElement(block) {
    const blockProps = {
      data: block.get('data'),
      editorId: EDITOR_ID,
      hasContent: this.props.hasContent,
      key: block.get('uid'),
      kind: block.get('kind'),
      linkURL: block.get('linkUrl'),
      onRemoveBlock: this.remove,
      uid: block.get('uid'),
    }
    switch (block.get('kind')) {
      case 'embed':
        return (
          <EmbedBlock
            {...blockProps}
            source={{ uri: block.getIn(['data', 'thumbnailLargeUrl']) }}
          />
        )
      case 'image':
        return (
          <ImageBlock
            {...blockProps}
            height={block.get('height')}
            source={{ uri: block.get('blob') || block.getIn(['data', 'url']) }}
            width={block.get('width')}
          />
        )
      case 'text':
        return (
          <TextBlock
            {...blockProps}
            onChange={this.onChangeText}
          />
        )
      default:
        return null
    }
  }

  serialize() {
    const { collection, order } = this.props
    const results = []
    order.forEach((uid) => {
      const block = collection.get(`${uid}`)
      const kind = block.get('kind')
      const data = block.get('data')
      const linkUrl = block.get('linkUrl')
      switch (kind) {
        case 'text':
          if (data && data.length) {
            if (linkUrl && linkUrl.length) {
              results.push({ kind, data, link_url: linkUrl })
            } else {
              results.push({ kind, data })
            }
          }
          break
        case 'repost':
          break
        default:
          if (linkUrl && linkUrl.length) {
            results.push({ kind, data, link_url: linkUrl })
          } else {
            results.push({ kind, data })
          }
          break
      }
    })
    return results
  }

  render() {
    const {
      collection,
      completions,
      hasContent,
      isCompleterActive,
      isLoading,
      isPosting,
      order,
    } = this.props
    const isPostingDisabled = isPosting || isLoading || !hasContent
    return (
      <View style={{ flex: 1 }}>
        <View style={toolbarStyle}>
          <TouchableOpacity
            onPress={this.onResetEditor}
            style={buttonStyle}
          >
            <Text style={buttonTextStyle}>X</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.onPickImageFromLibrary}
            style={buttonStyle}
          >
            <Text style={buttonTextStyle}>LIB</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isPostingDisabled}
            onPress={this.onCreatePost}
            style={buttonStyle}
          >
            <Text style={{ ...buttonTextStyle, backgroundColor: isPostingDisabled ? '#aaa' : '#000' }}>POST</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
        >
          {order ? order.map(uid => this.getBlockElement(collection.get(`${uid}`))) : null}
        </ScrollView>
        <KeyboardAvoidingView behavior="padding">
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

export default connect(mapStateToProps)(Editor)
// <TouchableOpacity title="CAMERA" onPress={this.onTakePictureWithCamera} />

