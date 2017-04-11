import React, { PropTypes, PureComponent } from 'react'
import { Text, View } from 'react-native'
import { connect } from 'react-redux'

const mapStateToProps = () => {
  return {}
}

class NotificationsContainer extends PureComponent {

  static navigationOptions = {
    tabBar: {
      label: 'Notifications',
    },
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }

  render() {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Notifications</Text></View>
  }
}

export default connect(mapStateToProps)(NotificationsContainer)

