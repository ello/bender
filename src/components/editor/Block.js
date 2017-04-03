import React, { PropTypes } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const viewStyle = {
  padding: 10,
  flex: 1,
}

const subViewStyle = {
  borderColor: '#aaa',
  borderStyle: 'dashed',
  borderWidth: 1,
  padding: 10,
  flex: 1,
}

const closeBtnStyle = {
  alignItems: 'center',
  height: 30,
  justifyContent: 'center',
  position: 'absolute',
  right: 0,
  top: 0,
  width: 30,
}

const closeTextStyle = {
  color: '#aaa',
  fontSize: 22,
}

const Block = ({ children, hasContent, uid }, { onClickRemoveBlock }) =>
  <View style={viewStyle}>
    <View style={subViewStyle}>
      {children}
      {hasContent &&
        <TouchableOpacity
          onPress={() => onClickRemoveBlock(uid)}
          style={closeBtnStyle}
        >
          <Text style={closeTextStyle}>&times;</Text>
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

