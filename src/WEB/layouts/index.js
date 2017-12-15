import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import Menu from '../components/Menu'

class Layout extends Component {

  render() {
    return (
      <Style>

        <div className="left">
          <Menu/>
        </div>

        <div className="right">
          <div className="container">
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
  .left{
    position: fixed;
    width: 200px;
    height: 100vh;
  }
  .right{
    margin-left: 200px;
  }
  .container{
    padding: 20px;
    box-sizing: border-box;
  }
  .content{
    padding: 20px;
    box-sizing: border-box;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
  }
`