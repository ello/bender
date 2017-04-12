import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import {
  ActivityIndicator,
  Alert,
  BackAndroid,
  Clipboard,
  Dimensions,
  Keyboard,
  Modal,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import Dialog from 'react-native-dialog'
import ImagePicker from 'react-native-image-picker'
import debounce from 'lodash/debounce'
import { trackEvent } from '../../actions/analytics'
import {
  createComment,
  toggleEditing as toggleCommentEditing,
  updateComment,
} from '../../actions/comments'
import { closeModal, openModal } from '../../actions/modals'
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
} from '../../actions/editor'
import {
  createPost,
  toggleEditing,
  toggleReposting,
  updatePost,
} from '../../actions/posts'
import { EDITOR } from '../../constants/action_types'
import { selectCompletions } from '../../selectors/editor'
import { selectEmojis } from '../../selectors/emoji'
import { selectIsCompleterActive } from '../../selectors/gui'
import {
  selectPost,
  selectPostIsEmpty,
  selectPostIsOwn,
} from '../../selectors/post'
import {
  selectHasAutoWatchEnabled,
  selectIsOwnPage,
  selectProfileIsFeatured,
} from '../../selectors/profile'
import { CameraIcon, DismissIcon, MiniCheckMark, MoneyIcon } from '../assets/Icons'
import { IconButton, PostButton } from '../buttons/Buttons'
import EmbedBlock from './EmbedBlock'
import ImageBlock from './ImageBlock'
import RepostBlock from './RepostBlock'
import TextBlock from './TextBlock'
import Completer, { emojiRegex, userRegex } from '../completers/Completer'
import BuyLinkDialog from '../dialogs/BuyLinkDialog'

const ACTIVE_SERVICE_REGEXES = [
  /(?:.+?)?(?:youtube\.com\/v\/|watch\/|\?v=|&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/,
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
  let submitText
  if (autoPopulate) {
    blocks = Immutable.fromJS([{ kind: 'text', data: autoPopulate }])
    submitText = 'Post'
  } else if (isComment) {
    if (comment && comment.get('isEditing')) {
      submitText = 'Update'
      blocks = comment.get('body')
    } else {
      submitText = 'Comment'
    }
  } else if (isPostEmpty) {
    submitText = 'Post'
  } else if (post.get('isReposting')) {
    submitText = 'Repost'
    if (post.get('repostId')) {
      repostContent = post.get('repostContent')
    } else {
      repostContent = post.get('content')
    }
  } else if (post.get('isEditing')) {
    submitText = 'Update'
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
    isFeatured: selectProfileIsFeatured(state),
    isLoading: editor.get('isLoading'),
    isOwnPage: selectIsOwnPage(state),
    isOwnPost: selectPostIsOwn(state, props),
    isPostEmpty,
    isPosting: editor.get('isPosting'),
    order,
    post,
    repostContent,
    submitText,
  }
}

const toolbarStyle = {
  flexDirection: 'row',
  height: 60,
}
const toolbarLeftStyle = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'flex-start',
}
const toolbarRightStyle = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'flex-end',
}
const footerStyle = {
  height: 44,
}
const activityIndicatorViewStyle = {
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: 20,
}
const postingTextStyle = {
  backgroundColor: '#000',
  borderRadius: 20,
  color: '#fff',
  marginBottom: 20,
  paddingHorizontal: 20,
  paddingVertical: 10,
}
const moneyCheckMarkWrapperStyle = {
  position: 'absolute',
  top: -2,
  right: 0,
}

class Editor extends Component {

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
    isFeatured: PropTypes.bool,
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
    submitText: PropTypes.string,
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
    isFeatured: false,
    isLoading: false,
    isOwnPage: false,
    isOwnPost: false,
    isPosting: false,
    onSubmit: null,
    order: null,
    post: null,
    repostContent: Immutable.List(),
    submitText: 'Post',
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
    scrollViewHeight: Dimensions.get('window').height - (toolbarStyle.height + footerStyle.height),
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
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackPress)
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
      ['scrollViewHeight'].some(prop =>
        this.state[prop] !== nextState[prop],
      )
  }

  componentDidUpdate(prevProps) {
    const prevOrder = prevProps.order
    const { order } = this.props
    if (order && prevOrder && order.size > prevOrder.size && this.scrollView) {
      this.scrollView.scrollToEnd({ animated: true })
    }
    if (prevProps.isPosting && !this.props.isPosting) { BackAndroid.exitApp() }
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

  onPickImageFromLibrary = () => {
    ImagePicker.launchImageLibrary({}, (response) => {
      if (!response.didCancel) {
        const { dispatch } = this.props
        dispatch(saveAsset(response.uri, this.props.editorId, response.width, response.height))
      }
    })
  }

  onTakePictureWithCamera = () => {
    ImagePicker.launchCamera({}, (response) => {
      if (!response.didCancel) {
        const { dispatch } = this.props
        dispatch(saveAsset(response.uri, this.props.editorId, response.width, response.height))
      }
    })
  }

  onShowImageOptions = () => {
    const options = [
      'Take Photo',
      'Photo Library',
    ]
    Dialog.showActionSheetWithOptions({
      options,
      cancelButtonIndex: options.length - 1,
      destructiveButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          this.onTakePictureWithCamera()
        } else if (buttonIndex === 1) {
          this.onPickImageFromLibrary()
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
      buyLink,
      comment,
      dispatch,
      editorId,
      isComment,
      isFeatured,
      isOwnPage,
      isPostEmpty,
      onSubmit,
      post,
    } = this.props
    if (buyLink && buyLink.length) {
      dispatch(trackEvent('added_buy_button'))
    }
    if (isComment) {
      if (comment && comment.get('isEditing')) {
        dispatch(toggleCommentEditing(comment, false))
        dispatch(updateComment(comment, data, editorId))
      } else {
        dispatch(createComment(allowsAutoWatch, data, editorId, post.get('id')))
        dispatch(trackEvent('published_comment'))
      }
    } else if (isPostEmpty) {
      // dispatch(closeOmnibar())
      dispatch(createPost(data, editorId))
      dispatch(trackEvent('published_post', { isFeatured }))
    } else if (post.get('isEditing')) {
      dispatch(toggleEditing(post, false))
      dispatch(updatePost(post, data, editorId))
      dispatch(trackEvent('edited_post'))
    } else if (post.get('isReposting')) {
      dispatch(toggleReposting(post, false))
      const repostId = post.get('repostId') || post.get('id')
      const repostedFromId = post.get('repostId') ? post.get('id') : null
      dispatch(createPost(data, editorId,
        repostId, repostedFromId),
      )
      dispatch(trackEvent('published_repost', { isFeatured }))
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
      case 'repost':
        return (
          <RepostBlock {...blockProps} onRemoveBlock={null} />
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
    this.setState({ scrollViewHeight: (Dimensions.get('window').height - (toolbarStyle.height + footerStyle.height)) })
  }

  keyboardDidShow = ({ endCoordinates: { screenY } }) => {
    this.setState({ scrollViewHeight: (screenY - (toolbarStyle.height + footerStyle.height)) })
  }

  handleHardwareBackPress = () => {
    const { isPosting, isLoading } = this.props
    if (isPosting || isLoading) { return true }
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
      blocks,
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
      repostContent,
      submitText,
    } = this.props
    const isPostingDisabled = isPosting || isLoading || !hasContent
    const key = `${editorId}_${(blocks ? blocks.size : '') + (repostContent ? repostContent.size : '')}`
    return (
      <View key={key} style={{ flex: 1, backgroundColor: hasMention ? '#ffc' : '#eee' }}>
        <View style={toolbarStyle}>
          <View style={toolbarLeftStyle}>
            {hasContent &&
              <IconButton onPress={this.onResetEditor}>
                <DismissIcon />
              </IconButton>
            }
          </View>
          <View style={toolbarRightStyle}>
            <IconButton disabled={!hasMedia} onPress={this.onLaunchBuyLinkModal}>
              {buyLink && buyLink.length &&
                <View style={moneyCheckMarkWrapperStyle}>
                  <MiniCheckMark modifier="inPostActions" />
                </View>
              }
              <MoneyIcon />
            </IconButton>
            <IconButton onPress={this.onShowImageOptions}>
              <CameraIcon />
            </IconButton>
          </View>
        </View>
        <View style={{ height: this.state.scrollViewHeight }}>
          <ScrollView
            horizontal={false}
            ref={comp => (this.scrollView = comp)}
          >
            {order ? order.valueSeq().map(uid => this.getBlockElement(collection.get(`${uid}`))) : null}
          </ScrollView>
          <Completer
            completions={completions}
            isCompleterActive={isCompleterActive}
            onCancel={this.onCancelAutoCompleter}
            onCompletion={this.onCompletion}
          />
        </View>
        <View style={footerStyle}>
          <PostButton disabled={isPostingDisabled} onPress={this.onSubmitPost}>
            {submitText}
          </PostButton>
        </View>
        <Modal
          animationType="fade"
          onRequestClose={() => {}}
          transparent
          visible={isPosting}
        >
          <View style={activityIndicatorViewStyle}>
            <Text style={postingTextStyle}>Posting...</Text>
            <ActivityIndicator
              animating
              color="#fff"
              size="large"
            />
          </View>
        </Modal>
      </View>
    )
  }
}

export default connect(mapStateToProps)(Editor)

