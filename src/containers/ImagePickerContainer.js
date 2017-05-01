import React, { PropTypes, PureComponent } from 'react'
import { connect } from 'react-redux'
import { ActivityIndicator, BackAndroid, Modal, StyleSheet, Text, View } from 'react-native'
import ImagePicker from 'react-native-image-picker'
import * as ElloAndroidInterface from '../lib/android_interface'
import { saveAvatar, saveCover } from '../actions/profile'

// need this to trigger a componentWillReceiveProps
const mapStateToProps = (state, props) =>
  ({
    asset: state.profile.get(props.kind),
  })

const pickerStyle = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})
const activityIndicatorViewStyle = {
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: 20,
}
const uploadingTextStyle = {
  backgroundColor: '#000',
  borderRadius: 20,
  color: '#fff',
  marginBottom: 20,
  paddingHorizontal: 20,
  paddingVertical: 10,
}

class ImagePickerContainer extends PureComponent {

  static propTypes = {
    asset: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    kind: PropTypes.string.isRequired,
  }

  static defaultProps = {
    asset: null,
  }

  state = {
    isUploading: false,
  }

  componentWillMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackPress)
  }

  componentDidMount() {
    const options = {
      title: '',
      takePhotoButtonTitle: 'Take Photo',
      chooseFromLibraryButtonTitle: 'Photo Library',
      quality: 0.9,
      maxWidth: 1200.0,
      maxHeight: 3600,
    }
    ImagePicker.showImagePicker(options, (response) => {
      if (!response.didCancel && !response.error) {
        this.setState({ isUploading: true })
        const { dispatch, kind } = this.props
        switch (kind) {
          case 'avatar':
            dispatch(saveAvatar(response.uri))
            break
          case 'coverImage':
            dispatch(saveCover(response.uri))
            break
          default:
            break
        }
      } else if (response.didCancel) {
        BackAndroid.exitApp()
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const { asset } = nextProps
    const assetTmpUrl = asset.getIn(['tmp', 'url'])
    if (assetTmpUrl && assetTmpUrl.indexOf('direct-uploads') > -1) {
      this.setState({ isUploading: false })
      ElloAndroidInterface.sendStateAndExit()
    }
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackPress)
  }

  handleHardwareBackPress = () => {
    if (this.state.isUploading) { return true }
    return false
  }

  render() {
    return (
      <View style={pickerStyle.wrapper}>
        <Modal
          animationType="fade"
          onRequestClose={() => {}}
          transparent
          visible={this.state.isUploading}
        >
          <View style={activityIndicatorViewStyle}>
            <Text style={uploadingTextStyle}>Uploading...</Text>
            <ActivityIndicator
              animating
              color="#fff"
              size="large"
            />
          </View>
        </Modal>
      </View>
    )
  }
}

export default connect(mapStateToProps)(ImagePickerContainer)

