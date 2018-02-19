import React, { Component } from 'react';
import AppStyle from '../config/style'
import Styled from 'styled-components'

import back from '../img/back.png'
import next from '../img/next.png'

class ToolBar extends Component {

  handleLeft = () => {
    console.log('left')
    this.props.left
  }

  render() {
    const { title } = this.props
    return (
      <Style>
        <div id="ToolBar">
            <div className="left">
              {this.props.left
                ?<div onClick={this.props.left}><img alt='' src={back}/></div>
                :""
              }
            </div>
            <div className="title">
              {title}
            </div>
            <div className="right">
              {this.props.right
                ?<div onClick={this.props.right}><img alt='' src={next}/></div>
                :""
              }
            </div>
        </div>
        <div className="box"/>
      </Style>
    );
  }
}

export default ToolBar;

const Style = Styled.div`
  #ToolBar{
    position: fixed;
    height: 50px;
    width: 100%;
    line-height: 50px;
    padding: 0 16px;
    box-sizing: border-box;
    background: ${AppStyle.color.main};
    ${AppStyle.shadow.lv1}
    z-index: 100;

    .left{
      float: left;
      width: 10%;
      height: 100%;
      text-align: left;
      cursor: pointer;
    }
    .title{
      float: left;
      width: 80%;
      text-align: center;
      ${AppStyle.font.tool}
    }
    .right{
      float: left;
      width: 10%;
      height: 100%;
      text-align: right;
      cursor: pointer;
    }
    img{
      padding-top: 0px;
      width: 25px;
      heigth: 25px;
    }
  }
  .box{
    height: 50px;
    width: 100%:
  }
`