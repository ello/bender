// @flow
/* eslint-disable import/prefer-default-export */
import React, { PureComponent } from 'react'
// $FlowFixMe
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import type { JSO } from '../../types/flowtypes'

// -------------------------------------
// Base Button

type BaseButtonProps = {
  children: React.Element<*> | null,
  disabled?: boolean,
  normal?: boolean,
  size: string,
  styles: {
    base: JSO,
    large?: JSO,
    medium: JSO,
    small?: JSO,
    normal: JSO,
    disabled: JSO,
  },
}

const pattern = (/^is|^in|^has/)

class BaseButton extends PureComponent {
  props: BaseButtonProps

  static defaultProps = {
    disabled: false,
    children: null,
    size: 'medium',
    normal: true,
  }

  getStyleModifiers() {
    const { styles } = this.props
    const modifiersAndSituations = Object.keys(this.props).map(prop =>
      pattern.test(prop) && this.props[prop] !== false && prop,
    ).filter(value => value)

    return ['normal', ...modifiersAndSituations, 'disabled'].map(prop =>
      // TODO: $FlowFixMe - the meta nature is blowing this thing up
      (this.props[prop] !== false && styles && styles[prop]),
    ).filter(value => value)
  }

  render() {
    const { children, disabled, size, styles, ...props } = this.props
    const style = [styles.base, styles[size], ...this.getStyleModifiers()]
    return (
      <View style={style} >
        <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('rgba(0, 0, 0, .12)', true)} delayPressIn={0} disabled={disabled} {...props} >
          <View style={[styles.base, styles[size]]}>
            {children}
          </View>
        </TouchableNativeFeedback>
      </View>
    )
  }
}

// -------------------------------------
// Icon Buttons

type Props = {
  children: React.Element<*>,
}

const baseIconButtonStyle = {
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  large: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  medium: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  small: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
}

const floatingButtonStyles = {
  ...baseIconButtonStyle,
  normal: {
    elevation: 4,
    backgroundColor: '#00d100',

  },
  disabled: {
    elevation: 0,
    opacity: 0.4,
    backgroundColor: 'transparent',
  },
}

export const FloatingButton = ({ children, ...props }: Props) => (
  <BaseButton styles={floatingButtonStyles} {...props} >
    {children}
  </BaseButton>
)

const iconButtonStyles = StyleSheet.create({
  ...baseIconButtonStyle,
  normal: {},
  disabled: {
    opacity: 0.4,
  },
})

export const IconButton = ({ children, ...props }: Props) => (
  <BaseButton styles={iconButtonStyles} {...props} >
    {children}
  </BaseButton>
)

// -------------------------------------
// Raised Buttons (Ello's version)

const raisedButtonStyle = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  medium: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  normal: {
    backgroundColor: '#000',
  },
  disabled: {
    backgroundColor: 'transparent',
  },
  isGreen: {
    backgroundColor: '#00d100',
  },
  isLightGrey: {
    backgroundColor: '#aaa',
  },
  inDialog: {
    marginLeft: 10,
  },
})

const raisedTextStyle = {
  color: '#fff',
}

export const RaisedButton = ({ children, ...props }: Props) => (
  <BaseButton styles={raisedButtonStyle} {...props} >
    <Text style={raisedTextStyle}>{children}</Text>
  </BaseButton>
)

