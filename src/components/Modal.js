import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import Modal from 'react-modal'

export default class extends Component {
  static defaultProps = {
    mini: false
  }
  state={
    modalIsOpen: false,
  }

  render() {

    const modalStyle = {
      content: {
      'height': `${this.props.mini?'200px':'auto'}`, 
      background: `${AppStyle.color.white}`,
      margin: '0 auto',
      width: '300px',
      'margin-top': `${((this.props.mini?2:0)*50)+40}`, 
      'z-index': '99999999',
      position: 'fixed',
      'animation-name': 'zoomIn',
      'animation-duration': '0.2s',
    },
      overlay: { 
      background: `rgba(0,0,0,0.3)`,
      'z-index': '9999999',
      position: 'fixed',
      'animation-name': 'fadeIn',
      'animation-duration': '0.3s',
    },
    }

    return (
      <Style>
        <Modal
          isOpen={this.props.modalIsOpen}
          // onAfterOpen={this.afterOpenModal}
          // onRequestClose={this.closeModal}
          style={modalStyle}
          contentLabel="Example Modal"
        >
          {this.props.children}
        </Modal>
      </Style>
    );
  }
}

const Style = Styled.div`

`
