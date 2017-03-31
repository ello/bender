import React, { PropTypes, PureComponent } from 'react'
import { Dimensions, Image, Text, View } from 'react-native'
import Block from './Block'

const textStyle = {
  backgroundColor: '#00d100',
  borderRadius: 15,
  color: '#fff',
  height: 30,
  paddingLeft: 10,
  paddingTop: 4,
  position: 'absolute',
  right: 10,
  top: 30,
  width: 30,
}

export default class ImageBlock extends PureComponent {

  static propTypes = {
    hasContent: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    linkURL: PropTypes.string,
    source: PropTypes.object.isRequired,
    uid: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }

  static defaultProps = {
    linkURL: null,
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
    const { hasContent, linkURL, source, uid } = this.props
    const { width, height } = this.getImageDimensions()
    return (
      <Block hasContent={hasContent} uid={uid}>
        <View style={{ paddingTop: 20 }}>
          <Image
            source={source}
            style={{ width, height }}
          />
          {linkURL &&
            <Text style={textStyle}>$</Text>
          }
        </View>
      </Block>
    )
  }
}

