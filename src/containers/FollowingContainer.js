import React, { PropTypes, PureComponent } from 'react'
import { Text, View } from 'react-native'
import { connect } from 'react-redux'

const mapStateToProps = () => {
  return {}
}

class FollowingContainer extends PureComponent {

  static navigationOptions = {
    tabBar: {
      label: 'Following',
    },
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }

  render() {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Following</Text></View>
  }
}

export default connect(mapStateToProps)(FollowingContainer)

