import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import Modal from 'react-modal'

export default class extends Component {

  state={
    modalIsOpen: false,
  }

  render() {

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
const modalStyle = {
  content: {
  height: '200px', 
  background: `${AppStyle.color.white}`,
  margin: '0 auto',
  width: '300px',
  'margin-top': '120px', 
  'z-index': '99999999',
  'animation-name': 'zoomIn',
  'animation-duration': '0.2s',
},
  overlay: { 
  background: `rgba(0,0,0,0.3)`,
  'z-index': '9999999',
  'animation-name': 'fadeIn',
  'animation-duration': '0.3s',
},
}