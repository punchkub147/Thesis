import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import PageTransition from 'react-router-page-transition';

import ToolBar from './ToolBar'
import NavBar from './NavBar'
import Content from '../components/Content'
import bg2 from '../img/bg2.jpg'

class Layout extends Component {

  render() {
    return (
      <Style>
        <div id="Layout">
          <ToolBar title={this.props.route.title}/>
          <NavBar route={this.props.route}/>

          <div className="page">
            {this.props.children}
          </div>


        </div>
      </Style>
    );
  }
}

export default Layout;

const Style = Styled.div`
  #Layout{
    background-image: url('${bg2}');
    background-size: 50px 10px;
    min-height: 100vh;
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