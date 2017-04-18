// @flow
import React from 'react'
import Svg, { G, Path, Polygon, Polyline } from 'react-native-svg'

type Props = {
  children : React.Element<*>,
}

// Yo! Strokes and fills are element attributes and not styles
const baseStroke = {
  stroke: '#aaa',
  strokeWidth: 1.25,
  fill: 'none',
}

const baseFill = {
  stroke: 'none',
  fill: '#aaa',
}

const greenStroke = {
  stroke: '#00d100',
  strokeWidth: 1.25,
  fill: 'none',
}

const SvgIcon = ({ children, ...props }: Props) =>
  <Svg height={20} width={20} {...props} >
    {children}
  </Svg>

const SvgMiniIcon = ({ children, ...props }: Props) =>
  <Svg height={10} width={10} {...props} >
    {children}
  </Svg>

// -------------------------------------

export const CameraIcon = ({ ...rest }: any) =>
  <SvgIcon {...rest} width={24}>
    <G x={1} y={2}>
      <Polygon {...baseStroke} points="0.625 16.625 21.425 16.625 21.425 0.625 0.625 0.625" />
      <Path {...baseStroke} d="M15.025,8.625 C15.025,10.834 13.234,12.625 11.025,12.625 C8.816,12.625 7.025,10.834 7.025,8.625 C7.025,6.416 8.816,4.625 11.025,4.625 C13.234,4.625 15.025,6.416 15.025,8.625 Z" />
    </G>
  </SvgIcon>

export const DismissIcon = ({ size, ...rest }: any) => {
  if (size === 'small') {
    return (
      <SvgMiniIcon {...rest} >
        <G x={1} y={1}>
          <Path {...baseStroke} d="M0.4419,0.44198 L8.4419,8.44198" />
          <Path {...baseStroke} d="M8.4419,0.44198 L0.4419,8.44198" />
        </G>
      </SvgMiniIcon>
    )
  }
  return (
    <SvgIcon {...rest} >
      <G x={3} y={3}>
        <Path {...baseStroke} d="M0.4419,0.442 L12.4419,12.442" />
        <Path {...baseStroke} d="M12.4419,0.442 L0.4419,12.442" />
      </G>
    </SvgIcon>
  )
}

// TODO: Need to rethink modifiers here... this won't scale super well.
// Size is small only here...
export const CheckMark = ({ modifier, ...rest }: any) =>
  <SvgIcon {...rest}>
    <G x={0} y={0}>
      <Polyline
        {...(modifier === 'green' ? greenStroke : baseStroke)}
        points="12 5.61573 14.458 8.70673 18 2.70673"
      />
    </G>
  </SvgIcon>

export const MoneyIcon = ({ disabled, ...rest }: any) =>
  <SvgIcon {...rest}>
    <G x={5} y={2}>
      <Path {...baseFill} d="M5.6196,13.8295 C7.4076,13.6285 8.0826,12.6985 8.0826,11.4395 C8.0826,10.2715 7.3896,9.4505 5.7286,9.1405 L5.5106,9.1045 L5.5106,13.8295 L5.6196,13.8295 Z M4.3056,2.7725 C2.8456,2.9735 2.0436,3.9225 2.0436,5.0355 C2.0436,6.4225 2.9006,7.0795 4.1786,7.2975 L4.3056,7.3155 L4.3056,2.7725 Z M4.3056,17.2235 L4.3056,15.2345 C1.5146,15.0515 0.2006,13.4455 -0.000400000001,11.2385 L1.6236,11.2385 C1.8246,12.4975 2.5366,13.6465 4.3056,13.8475 L4.3056,8.8665 L3.9776,8.8125 C1.7326,8.3925 0.4746,7.2435 0.4746,5.0355 C0.4746,3.1375 2.0436,1.6785 4.3056,1.4595 L4.3056,-0.0005 L5.5106,-0.0005 L5.5106,1.4595 C7.9736,1.6785 9.3596,3.1375 9.4696,5.2545 L7.8636,5.2545 C7.7176,4.0685 7.0796,3.0105 5.5106,2.7725 L5.5106,7.5355 L6.0396,7.6265 C8.7396,8.1005 9.7246,9.3775 9.7246,11.2935 C9.7246,13.5925 8.2656,15.0335 5.5106,15.2345 L5.5106,17.2235 L4.3056,17.2235 Z" />
    </G>
  </SvgIcon>

export const PencilIcon = ({ disabled, ...rest }: any) =>
  <SvgIcon {...rest}>
    <G x={4} y={17} rotate={-90}>
      <Path stroke="none" fill={disabled ? '#aaa' : '#fff'} d="M1.5683,1.8963 L3.8083,1.8963 L10.9833,8.9883 L8.7493,11.1963 L1.5683,4.0973 L1.5683,1.8963 Z M4.2693,0.7743 L0.4463,0.7743 L0.4463,4.5663 L8.7493,12.7743 L12.5793,8.9883 L4.2693,0.7743 Z" />
      <Polygon stroke="none" fill={disabled ? '#aaa' : '#fff'} points="9.6312 6.0648 5.8012 9.8508 6.5902 10.6488 10.4202 6.8628" />
    </G>
  </SvgIcon>

