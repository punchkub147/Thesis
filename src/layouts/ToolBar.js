import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import AppStyle from '../config/style'
import Styled from 'styled-components'

class ToolBar extends Component {

  render() {
    const { title } = this.props
    return (
      <Style>
        <div id="ToolBar">
            <div className="left">
              {this.props.left
                ?<div onClick={this.props.left}><img src="https://image.flaticon.com/icons/svg/271/271218.svg"/></div>
                :""
              }
            </div>
            <div className="title">
              {title}
            </div>
            <div className="right">
              {this.props.right
                ?<div onClick={this.props.right}><img src="https://image.flaticon.com/icons/svg/14/14704.svg"/></div>
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
    font-weight: bold;
    padding: 0 16px;
    box-sizing: border-box;
    background: ${AppStyle.color.main};
    ${AppStyle.shadow.lv1}
    z-index: 100;

    .left{
      float: left;
      width: 20%;
      height: 100%;
      text-align: left;
    }
    .title{
      float: left;
      width: 60%;
      text-align: center;
      color: ${AppStyle.color.card};
      font-size: 18px;
    }
    .right{
      float: left;
      width: 20%;
      height: 100%;
      text-align: right;
    }
    img{
      padding-top: 12.5px;
      width: 25px;
      heigth: 25px;
    }
  }
  .box{
    height: 50px;
    width: 100%:
  }
`