import React, { PropTypes, PureComponent } from 'react'
import { Text, View } from 'react-native'

export const emojiRegex = /\s?:{1}(\w+|\+|-):{0}$/
export const userRegex = /(\s|^)@{1}\w+/

export default class Completer extends PureComponent {

  static propTypes = {
    completions: PropTypes.object.isRequired,
  }

  render() {
    const { completions } = this.props

    return (
      <View style={{ position: 'absolute' }}>
        {completions.get('data').map(completion =>
          <Text key={`completion_${completion.get('name')}`}>{completion.get('name')}</Text>,
        )}
      </View>
    )
  }
}

