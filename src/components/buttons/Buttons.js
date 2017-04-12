// @flow
/* eslint-disable import/prefer-default-export */
import React from 'react'
// $FlowFixMe
import { Text, TouchableOpacity, View } from 'react-native'
import { PencilIcon } from '../assets/Icons'

type Props = {
  children: React.Element<*>,
  disabled?: boolean,
}

const disabledOpacityStyle = {
  opacity: 0.2,
}

// -------------------------------------

const iconButtonStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 44,
  minHeight: 44,
  marginRight: 5,
}

export const IconButton = ({ children, disabled, ...props }: Props) =>
  <TouchableOpacity style={iconButtonStyle} disabled={disabled} {...props} >
    <View style={disabled && disabledOpacityStyle}>
      {children}
    </View>
  </TouchableOpacity>

IconButton.defaultProps = {
  disabled: false,
}

// -------------------------------------

const postButtonStyle = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 44,
  minHeight: 44,
  paddingHorizontal: 40,
  backgroundColor: 'black',
}

const postButtonTextStyleBase = {
  marginLeft: 5,
  fontSize: 14,
}

const postButtonTextStyle = {
  ...postButtonTextStyleBase,
  color: '#fff',
}

const postButtonTextStyleDisabled = {
  ...postButtonTextStyleBase,
  color: '#aaa',
}

export const PostButton = ({ children, disabled, ...props }: Props) =>
  <TouchableOpacity style={postButtonStyle} disabled={disabled} {...props} >
    <PencilIcon disabled={disabled} />
    <Text style={disabled ? postButtonTextStyleDisabled : postButtonTextStyle}>
      {children}
    </Text>
  </TouchableOpacity>

PostButton.defaultProps = {
  disabled: false,
}

