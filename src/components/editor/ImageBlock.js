import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { Dimensions, Image } from 'react-native'
import Block from './Block'

export default class ImageBlock extends Component {

  static propTypes = {
    hasContent: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    source: PropTypes.object.isRequired,
    uid: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }

  static defaultProps = {
    blob: null,
    data: Immutable.Map(),
  }

  getImageDimensions() {
    const { height, width } = this.props
    const maxWidth = Dimensions.get('window').width - 40 // -40 is for the block padding
    const ratio = width ? width / height : null
    const maxCellHeight = 1200
    const widthConstrainedRelativeHeight = Math.round(maxWidth * (1 / ratio))
    const hv = Math.min(widthConstrainedRelativeHeight, height, maxCellHeight)
    const wv = Math.round(hv * ratio)
    return {
      width: wv,
      height: hv,
      ratio,
    }
  }

  render() {
    const { hasContent, source, uid } = this.props
    const { width, height } = this.getImageDimensions()
    return (
      <Block hasContent={hasContent} uid={uid}>
        <Image
          source={source}
          style={{ width, height }}
        />
      </Block>
    )
  }
}

