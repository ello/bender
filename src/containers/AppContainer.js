import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import { Navigator, StatusBar, View } from 'react-native'
import Editor from '../components/editor/Editor'
import ImagePickerContainer from './ImagePickerContainer'
import ModalContainer from './ModalContainer'

const routes = [
  { name: 'editor', index: 0, comp: Editor },
  { name: 'imagePicker', index: 1, comp: ImagePickerContainer },
]

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
    const startRoute = routes.find(r => r.name === initialRoute)
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden />
        <Navigator
          initialRoute={startRoute}
          initialRouteStack={routes}
          lazyLoad
          renderScene={(route) => {
            const RouteComponent = route.comp
            switch (route.index) {
              case 0:
                return <RouteComponent {...editorProps} />
              case 1:
                return <RouteComponent kind={kind} />
              default:
                return null
            }
          }}
        />
        <ModalContainer />
      </View>
    )
  }
}

export default AppContainer

