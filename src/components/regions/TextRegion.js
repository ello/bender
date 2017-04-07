import React, { PropTypes, PureComponent } from 'react'
import { WebView } from 'react-native'
import indexHtml from '../../constants/index_html'

export default class TextRegion extends PureComponent {

  static propTypes = {
    text: PropTypes.string.isRequired,
  }

  state = {
    height: 26,
  }

  onNavigationStateChange = (navState) => {
    this.setState({ height: Number(navState.title) })
  }

  render() {
    return (
      <WebView
        onNavigationStateChange={this.onNavigationStateChange}
        scrollEnabled={false}
        source={{ html: indexHtml.replace('{{post-content}}', this.props.text) }}
        style={{ flex: 1, height: this.state.height }}
      />
    )
  }
}

