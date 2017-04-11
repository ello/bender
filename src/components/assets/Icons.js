// @flow
/* eslint-disable import/prefer-default-export */
import React from 'react'
import Svg, { Line } from 'react-native-svg'
import type { JSO } from '../../types/flowtypes'

type Props = {
  style?: JSO | null,
}

export const DismissIcon = (props: Props) =>
  <Svg style={{ ...props.style }} height="20" width="20">
    <Line stroke="#aaa" strokeWidth="1.25" x1="6" x2="14" y1="6" y2="14" />
    <Line stroke="#aaa" strokeWidth="1.25" x1="14" x2="6" y1="6" y2="14" />
  </Svg>

DismissIcon.defaultProps = {
  style: {},
}

