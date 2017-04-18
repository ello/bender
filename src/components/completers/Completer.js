import React, { PropTypes, PureComponent } from 'react'
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native'

export const emojiRegex = /\s?:{1}(\w+|\+|-):{0}$/
export const userRegex = /(\s|^)@{1}\w+/

const scrollViewStyle = {
  maxHeight: 110,
  position: 'absolute',
  top: 0,
  right: 0,
  left: 0,
  elevation: 5,
}

const completionStyle = {
  backgroundColor: '#000',
  borderBottomWidth: 1,
  borderBottomColor: '#fff',
  flexDirection: 'row',
  height: 40,
  padding: 10,
}

const imageStyle = {
  borderRadius: 10,
  height: 20,
  width: 20,
}

const textStyle = {
  color: '#fff',
  marginLeft: 10,
}

export default class Completer extends PureComponent {

  static propTypes = {
    completions: PropTypes.object,
    isCompleterActive: PropTypes.bool.isRequired,
    onCompletion: PropTypes.func.isRequired,
  }

  static defaultProps = {
    completions: null,
  }

  render() {
    const { completions, isCompleterActive } = this.props
    if (!isCompleterActive || !completions || !completions.get('data').size) { return null }
    return (
      <ScrollView
        horizontal={false}
        keyboardShouldPersistTaps="handled"
        style={scrollViewStyle}
      >
        {completions.get('data').map(completion =>
          <TouchableOpacity
            key={`completion_${completion.get('name')}`}
            onPress={() => this.props.onCompletion({ value: completion.get('name') })}
            style={completionStyle}
          >
            <Image source={{ uri: completion.get('imageUrl') }} style={imageStyle} />
            <Text style={textStyle}>{completion.get('name')}</Text>
          </TouchableOpacity>,
        )}
      </ScrollView>
    )
  }
}

