import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import Menu from '../components/Menu'
import Bg from '../../components/Bg'

class Layout extends Component {

  render() {
    return (
      <Bg>
      <Style>

        <div className="left">
          <Menu {...this.props}/>
        </div>

        <div className="right">
          <div className="container">
            <div className="con">
              {this.props.children}
              <div style={{clear: 'both'}}></div>
            </div>
          </div>
        </div>

      </Style>
      </Bg>
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
  .con{
    padding: 20px;
    min-height: 100vh;
    box-sizing: border-box;
    background: ${AppStyle.color.bg};
    ${AppStyle.shadow.lv1}
  }
`