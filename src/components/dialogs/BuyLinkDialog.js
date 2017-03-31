import React, { PropTypes, PureComponent } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { isValidURL } from '../forms/Validators'

const textInputStyle = {
  backgroundColor: '#fff',
  borderWidth: 1,
  color: '#000',
  height: 44,
  paddingHorizontal: 10,
  marginBottom: 10,
}
const modalButtonViewStyle = {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  marginLeft: 0,
  marginRight: 10,
}
const modalButtonStyle = {
  marginRight: 10,
}
const buttonTextStyle = { backgroundColor: '#000', borderRadius: 20, color: '#fff', paddingHorizontal: 20, paddingVertical: 10 }

export default class BuyLinkDialog extends PureComponent {

  static propTypes = {
    onConfirm: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    text: PropTypes.string,
  }

  static defaultProps = {
    text: null,
  }

  state = {
    buyLinkText: '',
  }

  onSubmit = () => {
    this.props.onConfirm({ value: this.state.buyLinkText })
  }

  onRemoveBuyLink = () => {
    this.props.onConfirm({ value: null })
  }

  onChangeText = (buyLinkText) => {
    this.setState({ buyLinkText })
  }

  render() {
    const { onDismiss, text } = this.props
    const { buyLinkText } = this.state
    const isBuyLinkSubmitDisabled = !isValidURL(buyLinkText)
    return (
      <View>
        <Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>Sell your work</Text>
        <TextInput
          defaultValue={text}
          onChangeText={this.onChangeText}
          placeholder="Product detail link"
          style={textInputStyle}
          underlineColorAndroid="transparent"
        />
        <View style={modalButtonViewStyle}>
          <TouchableOpacity
            disabled={isBuyLinkSubmitDisabled}
            onPress={this.onSubmit}
            style={modalButtonStyle}
          >
            <Text style={{ ...buttonTextStyle, backgroundColor: isBuyLinkSubmitDisabled ? '#aaa' : '#00d100' }}>Submit</Text>
          </TouchableOpacity>
          {text && text.length &&
            <TouchableOpacity
              onPress={this.onRemoveBuyLink}
              style={modalButtonStyle}
            >
              <Text style={buttonTextStyle}>Remove</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity
            onPress={onDismiss}
            style={modalButtonStyle}
          >
            <Text style={buttonTextStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

