import React, { PropTypes } from 'react'
import { View } from 'react-native'
import { IconButton } from '../buttons/Buttons'
import { DismissIcon } from '../assets/Icons'

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
  position: 'absolute',
  right: -10,
  top: -5,
}

const Block = ({ children, hasContent, uid }, { onClickRemoveBlock }) =>
  <View style={viewStyle}>
    <View style={subViewStyle}>
      {children}
      {hasContent &&
        <View style={closeBtnStyle}>
          <IconButton onPress={() => onClickRemoveBlock(uid)}>
            <DismissIcon />
          </IconButton>
        </View>
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

