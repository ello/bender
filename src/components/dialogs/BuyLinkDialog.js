import React, { PropTypes, PureComponent } from 'react'
import { Text, TextInput, View } from 'react-native'
import { isValidURL } from '../forms/Validators'
import { RaisedButton } from '../buttons/Buttons'

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
  justifyContent: 'flex-end',
}

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
    const isSubmitDisabled = !isValidURL(buyLinkText)
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
          <RaisedButton isLightGrey inDialog onPress={onDismiss}>
            Cancel
          </RaisedButton>
          {text && text.length &&
            <RaisedButton isLightGrey inDialog onPress={this.onRemoveBuyLink}>
              Remove
            </RaisedButton>
          }
          <RaisedButton isGreen inDialog disabled={isSubmitDisabled} onPress={this.onSubmit} >
            Submit
          </RaisedButton>
        </View>
      </View>
    )
  }
}

// <style={{ ...buttonTextStyle, backgroundColor: isBuyLinkSubmitDisabled ? '#aaa' : '#00d100' }}

