import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

export default class extends Component {

  render() {
    return (
      <Style {...this.props}>
        {this.props.children}
      </Style>
    );
  }
}

const Style = Styled.div`
  width: 100%;
  ${AppStyle.shadow.lv1};
  background: ${AppStyle.color.bg};
  padding: 10px 0;
  margin-top: 10px;
`