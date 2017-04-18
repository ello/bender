// @flow
/* eslint-disable import/prefer-default-export */
import React, { PureComponent } from 'react'
// $FlowFixMe
import { StyleSheet, TouchableNativeFeedback, View } from 'react-native'
import type { JSO } from '../../types/flowtypes'

type BaseIconButtonProps = {
  children: React.Element<*> | null,
  disabled?: boolean,
  size: string,
  styles: {
    base: JSO,
    large: JSO,
    medium: JSO,
    small: JSO,
    normal: JSO,
    disabled: JSO,
  },
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

class BaseIconButton extends PureComponent {
  props: BaseIconButtonProps

  static defaultProps = {
    disabled: false,
    children: null,
    size: 'medium',
  }

  getStyleModifer() {
    const { disabled } = this.props
    if (disabled) {
      return 'disabled'
    }
    return 'normal'
  }

  render() {
    const { children, disabled, size, styles, ...props } = this.props
    return (
      <View style={[styles.base, styles[size], styles[this.getStyleModifer()]]} >
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

type Props = {
  children: React.Element<*>,
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
  <BaseIconButton styles={floatingButtonStyles} {...props} >
    {children}
  </BaseIconButton>
)

// -------------------------------------

const iconButtonStyles = StyleSheet.create({
  ...baseIconButtonStyle,
  normal: {},
  disabled: {
    opacity: 0.4,
  },
})

export const IconButton = ({ children, ...props }: Props) => (
  <BaseIconButton styles={iconButtonStyles} {...props} >
    {children}
  </BaseIconButton>
)

