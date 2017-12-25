import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

class BottomButton extends Component {

  render() {
    return (
      <div>
        <div style={{height: '60px'}}/>
        <Style>
          <div id="BottomButton">
            <button onClick={this.props.onClick}>{this.props.text}</button>
          </div>
        </Style>
      </div>
    );
  }
}

export default BottomButton;

const Style = Styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}
  padding-top: 10px;
  box-sizing: border-box;
`