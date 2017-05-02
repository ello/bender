import React, { PropTypes } from 'react'
import { View } from 'react-native'
import { IconButton } from '../buttons/Buttons'
import { DismissIcon } from '../assets/Icons'

const viewStyle = {
  flex: 1,
}

const subViewStyle = {
  paddingLeft: 10,
  paddingRight: 15,
  flex: 1,
}

const closeBtnStyle = {
  position: 'absolute',
  right: 10,
  top: 0,
}

const Block = ({ children, hasContent, uid }, { onClickRemoveBlock }) =>
  <View style={viewStyle}>
    <View style={subViewStyle}>
      {children}
      {hasContent &&
        <View style={closeBtnStyle}>
          <IconButton size="small" onPress={() => onClickRemoveBlock(uid)}>
            <DismissIcon size="small" />
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

