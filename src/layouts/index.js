import React, { Component } from 'react';
import Styled from 'styled-components'

import ToolBar from './ToolBar'
import NavBar from './NavBar'
import bg2 from '../img/bg2.jpg'

class Layout extends Component {

  render() {
    return (
      <Style>
        <ToolBar title={this.props.route.title}/>
        <NavBar route={this.props.route}/>

        <div className="page">
          {this.props.children}
        </div>
      </Style>
    );
  }
}

export default Layout;

const Style = Styled.div`
  // background-image: url('${bg2}');
  // background-size: 50px 10px;
  min-height: 100vh;
  width:100%;
  flex: 1;
  .page{
    width: 100%;
    .content{
      animation-name: fadeInUp;
      animation-duration: 0.3s;
    }
  }
`