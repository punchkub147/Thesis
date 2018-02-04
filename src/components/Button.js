import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import buttonimg from '../img/button.png'

class AppButton extends Component {

  render() {
    return (
      <Style>
        <button {...this.props}>
          {this.props.children}
        </button>
      </Style>
    );
  }
}

export default AppButton;

const Style = Styled.div`
  margin: 0 auto;
  width: 150px;
  button{
    cursor: pointer;
    width: 100%;
    background: none;
    background-image: url('${buttonimg}');
    background-size: auto 40px;
    background-repeat: no-repeat;
    border: none;
    ${AppStyle.font.button}
  }
  button:active{
    opacity: 0.8;
  }

  button:disabled{
    opacity: 0.5;
    cursor: not-allowed;
  }
`