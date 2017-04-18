import React, { PropTypes, PureComponent } from 'react'
import { Dimensions, Image, Text, View } from 'react-native'
import Block from './Block'

const textStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
  width: 20,
  height: 20,
  lineHeight: 18,
  borderRadius: 10,
  fontSize: 12,
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#00d100',
}

export default class ImageBlock extends PureComponent {

  static propTypes = {
    hasContent: PropTypes.bool.isRequired,
    height: PropTypes.number,
    linkURL: PropTypes.string,
    source: PropTypes.object.isRequired,
    uid: PropTypes.number.isRequired,
    width: PropTypes.number,
  }

  static defaultProps = {
    height: 0,
    linkURL: null,
    width: 0,
  }

  componentWillMount() {
    this.state = {
      height: this.props.height,
      layoutWidth: 0,
      width: this.props.width,
    }
  }

  // this is to trigger a render to get the dimensions again on orientation change
  onLayout = ({ nativeEvent: { layout: { width } } }) => {
    this.setState({ layoutWidth: width })
  }

  onLoad = ({ nativeEvent: { source: { width, height } } }) => {
    this.setState({ width, height })
  }

  getImageDimensions() {
    const { height, width } = this.state
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
        <View style={{ paddingVertical: 20 }} onLayout={this.onLayout}>
          <Image
            onLoad={this.onLoad}
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

