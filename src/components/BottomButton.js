import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import Button from './Button' 

class BottomButton extends Component {

  render() {
    return (
      <div>
        <div style={{height: '60px'}}/>
        <Style>
          <Button onClick={this.props.onClick} {...this.props}>{this.props.children}</Button>
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