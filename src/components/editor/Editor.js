// @flow
// $FlowFixMe
import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Modal,
  ScrollView,
  Text,
  View,
// $FlowFixMe
} from 'react-native'
import { CameraIcon, CheckMark, DismissIcon, MoneyIcon, PlusIcon } from '../assets/Icons'
import { FloatingButton, IconButton } from '../buttons/Buttons'
import Completer from '../completers/Completer'
import EmbedBlock from './EmbedBlock'
import ImageBlock from './ImageBlock'
import RepostBlock from './RepostBlock'
import TextBlock from './TextBlock'

type Props = {
  buyLink?: string,
  collection: Immutable.Map,
  completions: Immutable.Map,
  editorId: string,
  hasContent?: boolean,
  hasMedia?: boolean,
  hasMention?: boolean,
  isCompleterActive: boolean,
  isPosting?: boolean,
  isPostingDisabled: boolean,
  order: Immutable.List,
}

const toolbarStyle = {
  flexDirection: 'row',
  height: 56,
  marginVertical: 10,
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
  paddingRight: 10,
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
  top: 5,
  right: 5,
}

export default class Editor extends PureComponent {
  props: Props
  scrollView: React.Element<*> | null
  keyboardDidHideListener: any
  keyboardDidShowListener: any

  static defaultProps = {
    buyLink: null,
    collection: null,
    completions: null,
    hasContent: false,
    hasMedia: false,
    hasMention: false,
    isPosting: false,
    order: null,
  }

  static contextTypes = {
    onCancelAutoCompleter: PropTypes.func,
    onChangeText: PropTypes.func,
    onCompletion: PropTypes.func,
    onHideCompleter: PropTypes.func,
    onLaunchBuyLinkModal: PropTypes.func,
    onResetEditor: PropTypes.func,
    onShowImageOptions: PropTypes.func,
    onSubmitPost: PropTypes.func,
  }

  state = {
    scrollViewHeight: Dimensions.get('window').height - (toolbarStyle.height),
  }

  componentWillMount() {
    this.scrollView = null
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove()
    this.keyboardDidShowListener.remove()
  }

  getBlockElement(block: Immutable.Map) {
    const blockProps = {
      data: block.get('data'),
      editorId: this.props.editorId,
      hasContent: this.props.hasContent,
      key: block.get('uid'),
      kind: block.get('kind'),
      linkURL: block.get('linkUrl'),
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
            isUploading={block.get('isLoading')}
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
            onChange={this.context.onChangeText}
          />
        )
      default:
        return null
    }
  }

  keyboardDidHide = () => {
    this.context.onHideCompleter()
    this.setState({ scrollViewHeight: (Dimensions.get('window').height - (toolbarStyle.height)) })
  }

  // $FlowFixMe
  keyboardDidShow = ({ endCoordinates: { screenY } }) => {
    this.setState({ scrollViewHeight: (screenY - (toolbarStyle.height)) })
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
      isPosting,
      isPostingDisabled,
      order,
    } = this.props
    const {
      onCancelAutoCompleter,
      onCompletion,
      onLaunchBuyLinkModal,
      onResetEditor,
      onShowImageOptions,
      onSubmitPost,
    } = this.context

    return (
      <View style={{ flex: 1, backgroundColor: hasMention ? '#ffc' : '#eee' }}>
        <View style={toolbarStyle}>
          <View style={toolbarLeftStyle}>
            {/* disable the dismiss `x` until persisting is working */}
            {hasContent && false &&
              <IconButton onPress={onResetEditor}>
                <DismissIcon />
              </IconButton>
            }
            <IconButton onPress={onShowImageOptions}>
              <CameraIcon />
            </IconButton>
            <IconButton disabled={!hasMedia} onPress={onLaunchBuyLinkModal}>
              {buyLink && buyLink.length &&
                <View style={moneyCheckMarkWrapperStyle}>
                  <CheckMark size="small" modifier="green" />
                </View>
              }
              <MoneyIcon />
            </IconButton>
          </View>
          <View style={toolbarRightStyle}>
            <FloatingButton size="large" disabled={isPostingDisabled} onPress={onSubmitPost}>
              <PlusIcon disabled={isPostingDisabled} />
            </FloatingButton>
          </View>
        </View>
        <View style={{ height: this.state.scrollViewHeight }}>
          <ScrollView
            horizontal={false}
            ref={comp => (this.scrollView = comp)}
          >
            {order ? order.valueSeq().map(uid => this.getBlockElement(collection.get(`${uid}`))) : null}
          </ScrollView>
        </View>
        <Completer
          completions={completions}
          isCompleterActive={isCompleterActive}
          onCancel={onCancelAutoCompleter}
          onCompletion={onCompletion}
        />
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

