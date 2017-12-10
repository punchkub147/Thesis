import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style'

import ToolBar from './ToolBar'
import NavBar from './NavBar'

class Layout extends Component {

  render() {
    return (
      <Style>
        <div id="Layout">
          <ToolBar location={this.props.location}/>
          <NavBar />

          <div className="page">
            <div className="content">
              {this.props.children}
            </div>
          </div>


        </div>
      </Style>
    );
  }
}

export default Layout;

const Style = Styled.div`
  #Layout{
    background: ${AppStyle.color.bg};
    flex: 1;
    height: 100vh;
    .page{
      padding: 20px 16px 0 16px;
      width: 100%;
      height: 200px;
      background: red;
      box-sizing: border-box;
      .content{
        animation-name: fadeInUp;
        animation-duration: 0.3s;
      }
    }
  }

`