import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import PageTransition from 'react-router-page-transition';

import ToolBar from './ToolBar'
import NavBar from './NavBar'
import Content from '../components/Content'

class Layout extends Component {

  render() {
    return (
      <Style>
        <div id="Layout">
          <ToolBar title={this.props.route.title}/>
          <NavBar />

          <div className="page">
            <Content>
              {this.props.children}
            </Content>
          </div>


        </div>
      </Style>
    );
  }
}

export default Layout;

const Style = Styled.div`
  #Layout{
    flex: 1;
    .page{
      width: 100%;
      .content{
        animation-name: fadeInUp;
        animation-duration: 0.3s;
      }
    }
  }

`