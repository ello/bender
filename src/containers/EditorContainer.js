import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import {
  Alert,
  BackAndroid,
} from 'react-native'
import SharedPreferences from 'react-native-shared-preferences'
import { connect } from 'react-redux'
import ImagePicker from 'react-native-image-picker'
import debounce from 'lodash/debounce'
import {
  createComment,
  toggleEditing as toggleCommentEditing,
  updateComment,
} from '../actions/comments'
import { closeModal, openModal } from '../actions/modals'
import {
  addBlock,
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
} from '../actions/editor'
import {
  createPost,
  toggleEditing,
  toggleReposting,
  updatePost,
} from '../actions/posts'
import { EDITOR } from '../constants/action_types'
import { selectCompletions } from '../selectors/editor'
import { selectEmojis } from '../selectors/emoji'
import { selectIsCompleterActive } from '../selectors/gui'
import {
  selectPost,
  selectPostIsEmpty,
  selectPostIsOwn,
} from '../selectors/post'
import { selectHasAutoWatchEnabled, selectIsOwnPage } from '../selectors/profile'
import Editor from '../components/editor/Editor'
import { emojiRegex, userRegex } from '../components/completers/Completer'
import BuyLinkDialog from '../components/dialogs/BuyLinkDialog'

function buildRegex(regexStr) {
  const optionalPrefix = '(?:https?:\\/\\/)?(?:w{3}\\.)?';
  const terminator = '(?:\\/?|$|\\s|\\?|#)';
  return new RegExp(optionalPrefix + regexStr + terminator);
}

export const ACTIVE_SERVICE_REGEXES = [
  /(?:.+?)?(?:youtube\.com\/v\/|watch\/|\?v=|&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/,
  buildRegex('vimeo.com/(\\S*)'),
  buildRegex('(?:soundcloud.com|snd.sc)\\/([a-zA-Z0-9_-]*(?:\\/sets)?(?:\\/groups)?\\/[a-zA-Z0-9_-]*)'),
  buildRegex('dailymotion.com/video/([a-zA-Z0-9-_]*)'),
  buildRegex('(?:mixcloud.com)\\/(.*\\/.*)'),
  buildRegex('(?:codepen.io)\\/([a-zA-Z0-9_\\-%]*\\/[a-zA-Z0-9_\\-%]*\\/[a-zA-Z0-9_\\-%]*)'),
  buildRegex('([a-zA-Z0-9_\\-]*.bandcamp.com\\/(album|track)\\/[a-zA-Z0-9_\\-%]*)'),
  buildRegex('(?:ustream.tv|ustre.am)\\/((?:(recorded|channel)\\/)?[a-zA-Z0-9_\\-%]*)'),
]

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
  const { autoPopulate, comment, isComment } = props
  const post = selectPost(state, props)
  const editorId = getEditorId(post, comment, isComment, false)
  const editor = state.editor.get(editorId, Immutable.Map())
  const collection = editor.get('collection')
  const order = editor.get('order')
  const isPostEmpty = selectPostIsEmpty(state, props)
  let buyLink
  const firstBlock = collection && order ? collection.get(`${order.first()}`) : null
  if (firstBlock) {
    buyLink = firstBlock.get('linkUrl')
  }
  let blocks
  let repostContent
  if (autoPopulate) {
    blocks = Immutable.fromJS([{ kind: 'text', data: autoPopulate }])
  } else if (isComment) {
    if (comment && comment.get('isEditing')) {
      blocks = comment.get('body')
    }
  } else if (post.get('isReposting')) {
    if (post.get('repostId')) {
      repostContent = post.get('repostContent')
    } else {
      repostContent = post.get('content')
    }
  } else if (post.get('isEditing')) {
    if (post.get('repostContent') && post.get('repostContent').size) {
      repostContent = post.get('repostContent')
    }
    if (post.get('body')) {
      blocks = post.get('body')
    }
  }
  return {
    allowsAutoWatch: selectHasAutoWatchEnabled(state),
    blocks,
    buyLink,
    collection,
    comment,
    completions: selectCompletions(state),
    editorId,
    emojis: selectEmojis(state),
    hasContent: editor.get('hasContent'),
    hasMedia: editor.get('hasMedia'),
    hasMention: editor.get('hasMention'),
    isComment,
    isCompleterActive: selectIsCompleterActive(state),
    isLoading: editor.get('isLoading'),
    isOwnPage: selectIsOwnPage(state),
    isOwnPost: selectPostIsOwn(state, props),
    isPostEmpty,
    isPosting: editor.get('isPosting'),
    order,
    post,
    repostContent,
  }
}

class EditorContainer extends Component {

  static propTypes = {
    allowsAutoWatch: PropTypes.bool,
    // this is used to prepopulate text for zero states
    // which are currently just disabled in the webapp
    // when the user agent is ello android
    // autoPopulate: PropTypes.string,
    blocks: PropTypes.object,
    buyLink: PropTypes.string,
    collection: PropTypes.object,
    comment: PropTypes.object,
    completions: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    editorId: PropTypes.string.isRequired,
    emojis: PropTypes.object,
    hasContent: PropTypes.bool,
    hasMedia: PropTypes.bool,
    hasMention: PropTypes.bool,
    isComment: PropTypes.bool,
    isCompleterActive: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool,
    isOwnPage: PropTypes.bool,
    // this is only used for reply all functionality
    // which is not implemented currently
    // isOwnPost: PropTypes.bool,
    isPostEmpty: PropTypes.bool.isRequired,
    isPosting: PropTypes.bool,
    onSubmit: PropTypes.func,
    order: PropTypes.object,
    post: PropTypes.object,
    repostContent: PropTypes.object,
  }

  static defaultProps = {
    allowsAutoWatch: false,
    autoPopulate: null,
    blocks: Immutable.List(),
    buyLink: null,
    collection: null,
    comment: null,
    completions: null,
    emojis: null,
    hasContent: false,
    hasMedia: false,
    hasMention: false,
    isComment: false,
    isLoading: false,
    isOwnPage: false,
    isOwnPost: false,
    isPosting: false,
    onSubmit: null,
    order: null,
    post: null,
    repostContent: Immutable.List(),
  }

  static childContextTypes = {
    onCancelAutoCompleter: PropTypes.func,
    onCompletion: PropTypes.func,
    onChangeText: PropTypes.func,
    onCheckForEmbeds: PropTypes.func,
    onClickRemoveBlock: PropTypes.func,
    onEmojiCompleter: PropTypes.func,
    onHideCompleter: PropTypes.func,
    onLaunchBuyLinkModal: PropTypes.func,
    onResetEditor: PropTypes.func,
    onSelectionChange: PropTypes.func,
    onShowImageOptions: PropTypes.func,
    onSubmitPost: PropTypes.func,
    onUserCompleter: PropTypes.func,
  }

  state = {
    completerType: null,
  }

  getChildContext() {
    return {
      onCancelAutoCompleter: this.onCancelAutoCompleter,
      onChangeText: this.onChangeText,
      onCheckForEmbeds: this.onCheckForEmbeds,
      onClickRemoveBlock: this.onClickRemoveBlock,
      onCompletion: this.onCompletion,
      onEmojiCompleter: this.onEmojiCompleter,
      onHideCompleter: this.onHideCompleter,
      onLaunchBuyLinkModal: this.onLaunchBuyLinkModal,
      onResetEditor: this.onResetEditor,
      onSelectionChange: this.onSelectionChange,
      onShowImageOptions: this.onShowImageOptions,
      onSubmitPost: this.onSubmitPost,
      onUserCompleter: this.onUserCompleter,
    }
  }

  componentWillMount() {
    const { blocks, dispatch, editorId, post, repostContent } = this.props
    dispatch(initializeEditor(editorId, !(post.get('isEditing') || post.get('isReposting'))))
    if (repostContent.size) {
      dispatch(addBlock({ kind: 'repost', data: repostContent }, editorId))
    }
    if (blocks.size) {
      blocks.forEach((block) => {
        dispatch(addBlock(block.toJS(), editorId, false))
      })
    }
    this.onEmojiCompleter = debounce(this.onEmojiCompleter, 333)
    this.onUserCompleter = debounce(this.onUserCompleter, 333)
    BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackPress)
  }

  componentDidMount() {
    const { dispatch, editorId } = this.props
    dispatch(addEmptyTextBlock(editorId))
  }

  shouldComponentUpdate(nextProps) {
    return !Immutable.is(this.props.collection, nextProps.collection) ||
      !Immutable.is(this.props.completions, nextProps.completions) ||
      !Immutable.is(this.props.order, nextProps.order) ||
      ['hasContent', 'hasMedia', 'hasMention', 'isCompleterActive', 'isLoading', 'isPosting'].some(prop =>
        this.props[prop] !== nextProps[prop],
      )
  }

  componentDidUpdate(prevProps) {
    const prevOrder = prevProps.order
    const { order } = this.props
    if (order && prevOrder && order.size > prevOrder.size && this.scrollView) {
      this.scrollView.scrollToEnd({ animated: true })
    }
    if (prevProps.isPosting && !this.props.isPosting) {
      SharedPreferences.setItem('reloadFromReact', 'true')
      BackAndroid.exitApp()
    }
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove()
    this.keyboardDidShowListener.remove()
    BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackPress)
  }

  onAddBuyLink = ({ value }) => {
    const { dispatch, editorId } = this.props
    dispatch(updateBuyLink(editorId, value))
    this.onCloseModal()
  }

  onLaunchBuyLinkModal = () => {
    const { buyLink, dispatch } = this.props
    dispatch(openModal(
      <BuyLinkDialog
        onConfirm={this.onAddBuyLink}
        onDismiss={this.onCloseModal}
        text={buyLink}
      />))
  }

  onCloseModal = () => {
    const { dispatch } = this.props
    dispatch(closeModal())
  }

  onShowImageOptions = () => {
    const options = {
      title: '',
      takePhotoButtonTitle: 'Take Photo',
      chooseFromLibraryButtonTitle: 'Photo Library',
      quality: 0.9,
      maxWidth: 1200.0,
      maxHeight: 3600,
    }
    ImagePicker.showImagePicker(options, (response) => {
      if (!response.didCancel && !response.error) {
        const { dispatch } = this.props
        dispatch(saveAsset(response.uri, this.props.editorId, response.width, response.height))
      }
    })
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

  onResetEditor = () => {
    const { dispatch, editorId } = this.props
    Alert.alert(
      'Cancel post?',
      null,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => dispatch(resetEditor(editorId)) },
      ],
    )
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

  onSubmitPost = () => {
    const data = this.serialize()
    const {
      allowsAutoWatch,
      comment,
      dispatch,
      editorId,
      isComment,
      isOwnPage,
      isPostEmpty,
      onSubmit,
      post,
    } = this.props
    if (isComment) {
      if (comment && comment.get('isEditing')) {
        dispatch(toggleCommentEditing(comment, false))
        dispatch(updateComment(comment, data, editorId))
      } else {
        dispatch(createComment(allowsAutoWatch, data, editorId, post.get('id')))
      }
    } else if (isPostEmpty) {
      // dispatch(closeOmnibar())
      dispatch(createPost(data, editorId))
    } else if (post.get('isEditing')) {
      dispatch(toggleEditing(post, false))
      dispatch(updatePost(post, data, editorId))
    } else if (post.get('isReposting')) {
      dispatch(toggleReposting(post, false))
      const repostId = post.get('repostId') || post.get('id')
      const repostedFromId = post.get('repostId') ? post.get('id') : null
      dispatch(createPost(data, editorId,
        repostId, repostedFromId),
      )
    }
    if (onSubmit) { onSubmit() }
    // if on own page scroll down to top of post content
    if (isOwnPage && !isComment) {
      const { onClickScrollToContent } = this.context
      onClickScrollToContent()
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

  handleHardwareBackPress = () => {
    const { hasContent, isPosting, isLoading } = this.props
    if (hasContent) {
      Alert.alert(
        'Lose your progress?',
        'If you exit the editor you will lose your current draft.',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Delete my draft', onPress: () => BackAndroid.exitApp() },
        ],
      )
      return true
    } else if (isPosting || isLoading) { return true }
    return false
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
      editorId,
      hasContent,
      hasMedia,
      hasMention,
      isCompleterActive,
      isLoading,
      isPosting,
      order,
    } = this.props
    const isPostingDisabled = isPosting || isLoading || !hasContent
    const props = {
      buyLink,
      collection,
      completions,
      editorId,
      hasMedia,
      hasMention,
      isCompleterActive,
      isPosting,
      isPostingDisabled,
      order,
    }
    return <Editor {...props} />
  }
}

export default connect(mapStateToProps)(EditorContainer)

