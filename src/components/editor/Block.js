import React, { PropTypes } from 'react'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'

const viewStyle = {
  backgroundColor: '#eee',
  padding: 10,
  width: Dimensions.get('window').width,
}

const subViewStyle = {
  borderColor: '#aaa',
  borderStyle: 'dashed',
  borderWidth: 1,
  padding: 10,
  width: Dimensions.get('window').width - 20,
}

const closeXStyle = {
  height: 30,
  position: 'absolute',
  right: -15,
  top: 3,
  width: 30,
}

const Block = ({ children, hasContent, uid }, { onClickRemoveBlock }) =>
  <View style={viewStyle}>
    <View style={subViewStyle}>
      {children}
      {hasContent &&
        <TouchableOpacity
          onPress={() => onClickRemoveBlock(uid)}
          style={closeXStyle}
        >
          <Text style={{ color: '#aaa' }}>X</Text>
        </TouchableOpacity>
      }
    </View>
  </View>
Block.propTypes = {
  children: PropTypes.element.isRequired,
  hasContent: PropTypes.bool.isRequired,
  uid: PropTypes.number.isRequired,
}
Block.contextTypes = {
  onClickRemoveBlock: PropTypes.func.isRequired,
}

export default Block

