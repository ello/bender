import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import { Dimensions, Image } from 'react-native'
import Block from './Block'

function getEmbedImageDimensions() {
  const maxWidth = Dimensions.get('window').width - 40 // -40 is for the block padding
  const ratio = 1.77778
  const hv = Math.round(maxWidth * (1 / ratio))
  const wv = Math.round(hv * ratio)
  return {
    width: wv,
    height: hv,
    ratio,
  }
}

export default class EmbedBlock extends PureComponent {

  static propTypes = {
    hasContent: PropTypes.bool.isRequired,
    source: PropTypes.object.isRequired,
    uid: PropTypes.number.isRequired,
  }

  static defaultProps = {
    blob: null,
    data: Immutable.Map(),
  }

  render() {
    const { hasContent, source, uid } = this.props
    const { width, height } = getEmbedImageDimensions()
    return (
      <Block hasContent={hasContent} uid={uid}>
        <Image
          resizeMode="cover"
          source={source}
          style={{ width, height }}
        />
      </Block>
    )
  }
}

