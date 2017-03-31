import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import {
  Alert,
  Clipboard,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { ImagePicker, Permissions } from 'expo'
import debounce from 'lodash/debounce'
import { trackEvent } from '../../actions/analytics'
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
  updateBuyLink,
} from '../../actions/editor'
import { createPost } from '../../actions/posts'
import { EDITOR } from '../../constants/action_types'
import { selectCompletions } from '../../selectors/editor'
import { selectEmojis } from '../../selectors/emoji'
import { selectIsCompleterActive } from '../../selectors/gui'
import EmbedBlock from './EmbedBlock'
import ImageBlock from './ImageBlock'
import TextBlock from './TextBlock'
import { isValidURL } from '../forms/Validators'
import Completer, { emojiRegex, userRegex } from '../completers/Completer'

const ACTIVE_SERVICE_REGEXES = [
  /(?:.+?)?(?:youtube\.com\/v\/|watch\/|\?v=|&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/,
]
const IMAGE_QUALITY = 0.8

const editorUniqueIdentifiers = {}
export function getEditorId(post, comment, isComment, isZero) {
  const prefix = isComment ? 'commentEditor' : 'postEditor'
  let modelId = ''
  if (post && post.size) {
    modelId = post.get('id')
  } else if (comment && comment.size) {
    modelId = `${comment.get('postId')}_${comment.get('id')}`
  } else if (isZero) {
    modelId = 'Zero'
  } else {
    modelId = '0'
  }
  const fullPrefix = `${prefix}${modelId}`
  if ({}.hasOwnProperty.call(editorUniqueIdentifiers, fullPrefix)) {
    return editorUniqueIdentifiers[fullPrefix]
  }
  return fullPrefix
}


function mapStateToProps(state, props) {
  const { comment, isComment, isZero, post } = props
  const editorId = getEditorId(post, comment, isComment, isZero)
  const editor = state.editor.get(editorId, Immutable.Map())
  const collection = editor.get('collection')
  const order = editor.get('order')
  let buyLink
  const firstBlock = collection && order ? collection.get(`${order.first()}`) : null
  if (firstBlock) {
    buyLink = firstBlock.get('linkUrl')
  }
  return {
    buyLink,
    collection,
    completions: selectCompletions(state),
    editorId,
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
  flexDirection: 'row',
  height: 60,
  justifyContent: 'flex-end',
  padding: 10,
}
const buttonStyle = { marginLeft: 10 }
const buttonTextStyle = { backgroundColor: '#000', borderRadius: 20, color: '#fff', paddingHorizontal: 20, paddingVertical: 10 }
const modalStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: 20,
}
const textInputStyle = {
  backgroundColor: '#fff',
  borderWidth: 1,
  color: '#000',
  height: 44,
  paddingHorizontal: 10,
  marginBottom: 10,
}
const modalButtonViewStyle = {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  marginLeft: 0,
  marginRight: 10,
}
const modalButtonStyle = {
  marginRight: 10,
}

class Editor extends Component {

  static propTypes = {
    buyLink: PropTypes.string,
    collection: PropTypes.object,
    completions: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    editorId: PropTypes.string.isRequired,
    emojis: PropTypes.object,
    hasContent: PropTypes.bool,
    hasMedia: PropTypes.bool,
    hasMention: PropTypes.bool,
    isCompleterActive: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool,
    isPosting: PropTypes.bool,
    order: PropTypes.object,
  }

  static defaultProps = {
    buyLink: null,
    collection: null,
    completions: null,
    emojis: null,
    hasContent: false,
    hasMedia: false,
    hasMention: false,
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
    buyLinkText: '',
    completerType: null,
    isBuyLinkModalActive: false,
    scrollViewHeight: null,
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
    const { dispatch, editorId } = this.props
    dispatch(initializeEditor(editorId, true))
    this.onEmojiCompleter = debounce(this.onEmojiCompleter, 333)
    this.onUserCompleter = debounce(this.onUserCompleter, 333)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
  }

  componentDidMount() {
    // TODO: remove this when we have embeds working
    Clipboard.setString('https://www.youtube.com/watch?v=gUGda7GdZPQ')
    const { dispatch, editorId } = this.props
    dispatch(addEmptyTextBlock(editorId))
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !Immutable.is(this.props.collection, nextProps.collection) ||
      !Immutable.is(this.props.completions, nextProps.completions) ||
      !Immutable.is(this.props.order, nextProps.order) ||
      ['hasContent', 'hasMedia', 'hasMention', 'isCompleterActive', 'isLoading', 'isPosting'].some(prop =>
        this.props[prop] !== nextProps[prop],
      ) ||
      ['buyLinkText', 'isBuyLinkModalActive', 'scrollViewHeight'].some(prop =>
        this.state[prop] !== nextState[prop],
      )
  }

  componentDidUpdate(prevProps) {
    const prevOrder = prevProps.order
    const { order } = this.props
    if (order && prevOrder && order.size > prevOrder.size && this.scrollView) {
      requestAnimationFrame(() => {
        this.scrollView.scrollToEnd({ animated: true })
      })
    }
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove()
    this.keyboardDidShowListener.remove()
  }

  onLaunchBuyLinkModal = () => {
    console.log('onLaunchBuyLinkModal')
    this.setState({ isBuyLinkModalActive: true })
  }

  onCloseModal = () => {
    this.setState({ isBuyLinkModalActive: false })
  }

  onAddBuyLink = () => {
    const { dispatch, editorId } = this.props
    dispatch(updateBuyLink(editorId, this.state.buyLinkText))
    this.setState({ buyLinkText: '' })
    this.onCloseModal()
  }

  onRemoveBuyLink = () => {
    this.setState({ buyLinkText: '' })
    requestAnimationFrame(() => {
      this.onAddBuyLink()
    })
  }

  onBuyLinkTextChange = (buyLinkText) => {
    this.setState({ buyLinkText })
  }

  onPickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: IMAGE_QUALITY,
    })
    if (!result.cancelled) {
      const { dispatch, editorId } = this.props
      dispatch(saveAsset(result.uri, editorId, result.width, result.height))
    }
  }

  onTakePictureWithCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        quality: IMAGE_QUALITY,
      })
      if (!result.cancelled) {
        const { dispatch, editorId } = this.props
        dispatch(saveAsset(result.uri, editorId, result.width, result.height))
      }
    }
  }

  onChangeText = (vo) => {
    const { collection, dispatch, editorId } = this.props
    if (collection.getIn([vo.uid, 'data']) !== vo.data) {
      dispatch(updateBlock(vo, vo.uid, editorId))
    }
  }

  onCheckForEmbeds = (text) => {
    const { dispatch, editorId } = this.props
    ACTIVE_SERVICE_REGEXES.forEach((regex) => {
      if (text.match(regex)) {
        dispatch(postPreviews(text, editorId, 0))
      }
    })
  }


  onClickRemoveBlock = (uid) => {
    const { dispatch, editorId } = this.props
    Alert.alert(
      'Remove this content?',
      null,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => dispatch(removeBlock(uid, editorId)) },
      ],
    )
  }

  onCreatePost = () => {
    const { buyLink, dispatch, editorId } = this.props
    if (buyLink && buyLink.length) {
      dispatch(trackEvent('added_buy_button'))
    }
    dispatch(createPost(this.serialize(), editorId))
  }

  onResetEditor = () => {
    const { dispatch, editorId, hasContent } = this.props
    if (!hasContent) {
      // TODO: make this dismiss the editor to go back to whatever was before it
      // console.log('dismiss editor')
    } else {
      Alert.alert(
        'Cancel post?',
        null,
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => dispatch(resetEditor(editorId)) },
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
      newValue = `@${value} `
    } else if (completerType === 'emoji') {
      newValue = `:${value}: `
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
      const word = this.getWordFromPosition(this.selectionEnd)
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
    let endIndex = pos - 1
    if (endIndex < 0) endIndex = 0
    const letters = []
    let index = endIndex
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
    this.selectionStart = (endIndex - letters.length) + 1
    return letters.join('')
  }

  getBlockElement(block) {
    const blockProps = {
      data: block.get('data'),
      editorId: this.props.editorId,
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

  keyboardDidHide = () => {
    this.onHideCompleter()
    this.setState({ scrollViewHeight: (Dimensions.get('window').height - toolbarStyle.height) })
  }

  keyboardDidShow = ({ endCoordinates: { screenY } }) => {
    this.setState({ scrollViewHeight: (screenY - toolbarStyle.height) })
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
      buyLink,
      collection,
      completions,
      hasContent,
      hasMedia,
      hasMention,
      isCompleterActive,
      isLoading,
      isPosting,
      order,
    } = this.props
    const { buyLinkText, isBuyLinkModalActive } = this.state
    const isPostingDisabled = isPosting || isLoading || !hasContent
    const isBuyLinkSubmitDisabled = !isValidURL(buyLinkText)
    let buyLinkBgColor = !hasMedia ? '#aaa' : '#000'
    if (buyLink && buyLink.length) { buyLinkBgColor = '#00d100' }
    return (
      <View style={{ flex: 1, backgroundColor: hasMention ? '#ffc' : '#eee' }}>
        <View style={toolbarStyle}>
          <TouchableOpacity
            onPress={this.onResetEditor}
            style={buttonStyle}
          >
            <Text style={buttonTextStyle}>&times;</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!hasMedia}
            onPress={this.onLaunchBuyLinkModal}
            style={buttonStyle}
          >
            <Text style={{ ...buttonTextStyle, backgroundColor: buyLinkBgColor }}>$</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.onPickImageFromLibrary}
            style={buttonStyle}
          >
            <Text style={buttonTextStyle}>&#x1f4f7;</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isPostingDisabled}
            onPress={this.onCreatePost}
            style={buttonStyle}
          >
            <Text style={{ ...buttonTextStyle, backgroundColor: isPostingDisabled ? '#aaa' : '#00d100' }}>POST</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: this.state.scrollViewHeight }}>
          <ScrollView
            horizontal={false}
            ref={comp => (this.scrollView = comp)}
          >
            {order ? order.map(uid => this.getBlockElement(collection.get(`${uid}`))) : null}
          </ScrollView>
          <Completer
            completions={completions}
            isCompleterActive={isCompleterActive}
            onCancel={this.onCancelAutoCompleter}
            onCompletion={this.onCompletion}
          />
        </View>
        <Modal
          animationType="fade"
          onRequestClose={this.onCloseModal}
          transparent
          visible={isBuyLinkModalActive}
        >
          <KeyboardAvoidingView behavior="padding" style={modalStyle}>
            <Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>Sell your work</Text>
            <TextInput
              defaultValue={buyLink}
              onChangeText={this.onBuyLinkTextChange}
              placeholder="Product detail link"
              style={textInputStyle}
              underlineColorAndroid="transparent"
            />
            <View style={modalButtonViewStyle}>
              <TouchableOpacity
                disabled={isBuyLinkSubmitDisabled}
                onPress={this.onAddBuyLink}
                style={modalButtonStyle}
              >
                <Text style={{ ...buttonTextStyle, backgroundColor: isBuyLinkSubmitDisabled ? '#aaa' : '#00d100' }}>Submit</Text>
              </TouchableOpacity>
              {buyLink && buyLink.length &&
                <TouchableOpacity
                  onPress={this.onRemoveBuyLink}
                  style={modalButtonStyle}
                >
                  <Text style={buttonTextStyle}>Remove</Text>
                </TouchableOpacity>
              }
              <TouchableOpacity
                onPress={this.onCloseModal}
                style={modalButtonStyle}
              >
                <Text style={buttonTextStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    )
  }
}

export default connect(mapStateToProps)(Editor)
// <TouchableOpacity title="CAMERA" onPress={this.onTakePictureWithCamera} />

