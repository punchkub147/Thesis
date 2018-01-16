import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import buttonimg from '../img/button.png'

class AppButton extends Component {

  render() {
    return (
      <Style>
        <button 
          onClick={this.props.onClick}
          onSubmit={this.props.onSubmit}
          type={this.props.type}>
          
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
`