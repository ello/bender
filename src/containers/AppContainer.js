import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import { Navigator, StatusBar, Text, View } from 'react-native'
import { TabNavigator } from 'react-navigation'
import Editor from '../components/editor/Editor'
import ImagePickerContainer from './ImagePickerContainer'
import DiscoverContainer from './DiscoverContainer'
import FollowingContainer from './FollowingContainer'
import ModalContainer from './ModalContainer'
import NotificationsContainer from './NotificationsContainer'
import ProfileContainer from './ProfileContainer'

const ElloTabBar = TabNavigator(
  {
    Following: {
      screen: FollowingContainer,
    },
    Discover: {
      screen: DiscoverContainer,
    },
    Editor: {
      screen: Editor,
    },
    Notifications: {
      screen: NotificationsContainer,
    },
    Profile: {
      screen: ProfileContainer,
    },
  },
  {
    backBehavior: 'none',
    initialRouteName: 'Editor',
    // lazyLoad: true,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeBackgroundColor: '#f0f',
      activeTintColor: '#000',
      inactiveBackgroundColor: '#fff',
      inactiveTintColor: '#ccc',
      showLabel: true,
      style: {
        backgroundColor: '#fff',
        height: 50,
      },
    },
  },
)

class AppContainer extends PureComponent {

  static propTypes = {
    comment: PropTypes.string,
    initialRoute: PropTypes.string.isRequired,
    isComment: PropTypes.string,
    kind: PropTypes.string,
    post: PropTypes.string,
  }

  static defaultProps = {
    comment: null,
    isComment: false,
    kind: '',
    post: null,
  }

  render() {
    const { comment, initialRoute, isComment, kind, post } = this.props
    const editorProps = {
      comment: comment ? Immutable.fromJS(JSON.parse(comment)) : Immutable.Map(),
      isComment: isComment === 'true',
      post: post ? Immutable.fromJS(JSON.parse(post)) : Immutable.Map(),
    }
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden />
        {initialRoute === 'editor' && <Editor {...editorProps} />}
        {initialRoute === 'imagePicker' && <ImagePickerContainer kind={kind} />}
        <ElloTabBar />
        <ModalContainer />
      </View>
    )
  }
}

export default AppContainer

