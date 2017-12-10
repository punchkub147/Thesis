import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import AppStyle from '../config/style'
import Styled from 'styled-components'

class ToolBar extends Component {

  render() {
    let title = this.props.location.pathname.toUpperCase()
    title = title.replace('/','')
    return (
      <Style>
        <div id="ToolBar">
           {title}
        </div>
      </Style>
    );
  }
}

export default ToolBar;

const Style = Styled.div`
  #ToolBar{
    height: 50px;
    text-align: center;
    line-height: 50px;
    font-weight: bold;
    background: ${AppStyle.color.main};
    ${AppStyle.shadow.lv1}
    position: relative;
    z-index: 100;
  }

`