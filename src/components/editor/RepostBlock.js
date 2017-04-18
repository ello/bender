import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import { Dimensions, Image, View } from 'react-native'
import TextRegion from '../regions/TextRegion'
import { LockIcon } from '../assets/Icons'

const lockStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
}

function getImageDimensions() {
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

function getBlockElement(block, uid) {
  const data = block.get('data')
  const { width, height } = getImageDimensions()
  switch (block.get('kind')) {
    case 'embed':
      return (
        <Image
          key={`repostEmbed_${uid}`}
          source={{ uri: data.get('thumbnailLargeUrl') }}
          style={{ width, height }}
        />
      )
    case 'image':
      return (
        <Image
          key={`repostImage_${uid}`}
          source={{ uri: data.get('url') }}
          style={{ width, height }}
        />
      )
    case 'text':
      return (
        <TextRegion
          key={`repostText_${uid}`}
          text={data}
        />
      )
    default:
      return null
  }
}

export default class EmbedBlock extends PureComponent {

  static propTypes = {
    data: PropTypes.object,
  }

  static defaultProps = {
    blob: null,
    data: Immutable.List(),
  }

  // this is to trigger a render to get the dimensions again on orientation change
  onLayout = ({ nativeEvent: { layout: { width } } }) => {
    this.setState({ width })
  }

  render() {
    const { data } = this.props
    return (
      <View style={{ flex: 1, borderColor: '#aaa', borderWidth: 1, margin: 10, padding: 10 }} onLayout={this.onLayout}>
        <LockIcon style={lockStyle} />
        {data.valueSeq().map((block, i) => getBlockElement(block, i))}
      </View>
    )
  }
}

