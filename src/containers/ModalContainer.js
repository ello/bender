import React, { PropTypes, PureComponent } from 'react'
import { KeyboardAvoidingView, Modal } from 'react-native'
import { connect } from 'react-redux'
import { closeModal, closeAlert } from '../actions/modals'

export function mapStateToProps(state) {
  return {
    component: state.modal.get('component'),
    isActive: state.modal.get('isActive'),
    kind: state.modal.get('kind'),
  }
}

const modalStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: 20,
}

class ModalContainer extends PureComponent {
  static propTypes = {
    component: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    kind: PropTypes.string.isRequired,
  }

  static defaultProps = {
    component: null,
  }

  onCloseModal() {
    const { dispatch, isActive, kind } = this.props
    if (isActive) {
      dispatch(kind === 'Modal' ? closeModal() : closeAlert())
    }
  }

  render() {
    const { isActive, component } = this.props
    return (
      <Modal
        animationType="fade"
        onRequestClose={this.onCloseModal}
        transparent
        visible={isActive}
      >
        <KeyboardAvoidingView behavior="padding" style={modalStyle}>
          {component}
        </KeyboardAvoidingView>
      </Modal>
    )
  }
}

export default connect(mapStateToProps)(ModalContainer)

