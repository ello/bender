import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { Image } from 'react-native'
import Block from './Block'

export default class ImageBlock extends Component {

  static propTypes = {
    blob: PropTypes.string,
    data: PropTypes.object.isRequired,
    hasContent: PropTypes.bool.isRequired,
    uid: PropTypes.number.isRequired,
  }

  static defaultProps = {
    blob: null,
    data: Immutable.Map(),
  }

  state = {
    viewHeight: 20,
  }

  render() {
    const { blob, data, hasContent, uid } = this.props
    return (
      <Block hasContent={hasContent} uid={uid}>
        <Image
          source={{ uri: blob || data.get('url') }}
          style={{ width: 200, height: 200 }}
        />
      </Block>
    )
  }
}

