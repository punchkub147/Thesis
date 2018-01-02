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
        <div id="AppButton">
          <button 
            onClick={this.props.onClick}
            onSubmit={this.props.onSubmit}
            type={this.props.type}>
            
            {this.props.children}
          </button>
        </div>
      </Style>
    );
  }
}

export default AppButton;

const Style = Styled.div`
  #AppButton{
    margin: 0 auto;
    width: 150px;
    button{
      cursor: pointer;
      width: 100%;
      color: ${AppStyle.color.white};
      background: none;
      background-image: url('${buttonimg}');
      background-size: auto 40px;
      background-repeat: no-repeat;
      border: none;
    }
  }
`