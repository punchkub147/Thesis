import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import Menu from '../components/Menu'
import Bg from '../../components/Bg'

class Layout extends Component {

  render() {
    console.log(this.props)
    return (
      <Bg>
      <Style>

        <div className="left">
          <Menu {...this.props}/>
        </div>

        <div className="right">
          <div className="">
            <div className="con">
            
              <div className='title'>{this.props.route.title}</div>
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

  .title{
    ${AppStyle.font.main}
    margin-bottom: 10px;
  }


  .left{
    position: fixed;
    width: 200px;
    height: 100vh;
    z-index: 10;
  }
  .right{
    margin-left: 200px;
  }
  .container{
    padding: 20px;
    box-sizing: border-box;
  }
  .con{
    padding: 40px;
    min-height: 100vh;
    box-sizing: border-box;
    background: ${AppStyle.color.bg2};
    //${AppStyle.shadow.lv1}
  }

  @media screen and (max-width: 400px) {
    .left{
      max-width: 50px;
    }
    .right{
      margin-left: 50px;
    }
    .container{
      padding: 0;
    }
    .con{
      padding: 10px;
    }
  }
`