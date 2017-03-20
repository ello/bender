import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import {
  Alert,
  Button,
  Clipboard,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { ImagePicker, Permissions } from 'expo'
import {
  addEmptyTextBlock,
  initializeEditor,
  postPreviews,
  removeBlock,
  saveAsset,
  updateBlock,
} from '../../actions/editor'
import { createPost } from '../../actions/posts'
import EmbedBlock from './EmbedBlock'
import ImageBlock from './ImageBlock'
import TextBlock from './TextBlock'

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
    hasContent: editor.get('hasContent'),
    hasMedia: editor.get('hasMedia'),
    hasMention: editor.get('hasMention'),
    isLoading: editor.get('isLoading'),
    isPosting: editor.get('isPosting'),
    order,
  }
}

const toolbarStyle = {
  backgroundColor: '#aaa',
  flexDirection: 'row',
  height: 60,
  justifyContent: 'flex-end',
  marginTop: 25,
  padding: 10,
}

class Editor extends Component {

  static propTypes = {
    collection: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    hasContent: PropTypes.bool,
    isLoading: PropTypes.bool,
    isPosting: PropTypes.bool,
    order: PropTypes.object,
  }

  static defaultProps = {
    collection: null,
    hasContent: false,
    isLoading: false,
    isPosting: false,
    order: null,
  }

  static childContextTypes = {
    onCheckForEmbeds: PropTypes.func,
    onClickRemoveBlock: PropTypes.func,
  }

  getChildContext() {
    return {
      onCheckForEmbeds: this.onCheckForEmbeds,
      onClickRemoveBlock: this.onClickRemoveBlock,
    }
  }

  componentWillMount() {
    const { dispatch } = this.props
    dispatch(initializeEditor(EDITOR_ID))
  }

  componentDidMount() {
    // TODO: remove this when we have embeds working
    Clipboard.setString('https://www.youtube.com/watch?v=gUGda7GdZPQ')
    const { dispatch } = this.props
    dispatch(addEmptyTextBlock(EDITOR_ID))
  }

  shouldComponentUpdate(nextProps) {
    return !Immutable.is(this.props.order, nextProps.order) ||
      ['hasContent', 'hasMedia', 'hasMention', 'isLoading', 'isPosting'].some(prop =>
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
    const { collection, hasContent, isLoading, isPosting, order } = this.props
    return (
      <View style={{ flex: 1 }}>
        <View style={toolbarStyle}>
          <Button
            onPress={this.onPickImageFromLibrary}
            title="LIBRARY"
          />
          <Button
            disabled={isPosting || isLoading || !hasContent}
            onPress={this.onCreatePost}
            title="SUBMIT"
          />
        </View>
        <KeyboardAvoidingView behavior="position">
          <ScrollView horizontal={false} style={{ marginBottom: toolbarStyle.height + 25 }}>
            {order ? order.map(uid => this.getBlockElement(collection.get(`${uid}`))) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    )
  }
}

export default connect(mapStateToProps)(Editor)
// <Button title="CAMERA" onPress={this.onTakePictureWithCamera} />

