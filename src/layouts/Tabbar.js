import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import _ from 'lodash'

import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

class AppTabbar extends Component {

  state={
    menu: 0
  }

  render() {

    const { tabs } = this.props


    return (
      <Style countTab={tabs.length}>
        {/*
          <Tabbar>
          {menuList.map((menu,key) =>
            <div className={`menu ${this.state.menu==key?'border-t':'border'}`} 
              onClick={() => this.setState({menu: key})}>
              {menu}
            </div>
          )}
          </Tabbar>
        */}

        <Tabs defaultActiveKey="2">
        {_.map(tabs, tab => 
          <TabPane 
            tab={
              <span>
                {/*<Icon type="apple" />*/}
                {tab.name}
              </span>
            } 
            key={tab.name}>
            {tab.render}
          </TabPane>
        )}
        </Tabs>

        {
          // this.state.menu===0&&
          // nowTask
        }
        {
          // this.state.menu===1&&
          // allTask
        }
      </Style>
    );
  }
}

export default AppTabbar;

const Style = Styled.div`
  width: 100%;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}
  height: 50px;
  line-height: 50px;
  text-align: center;
  .menu{
    width: ${props => 100/props.countTab}%;
    float: left;
    cursor: pointer;
    ${AppStyle.font.menu}
  }
  margin-bottom: 2px;

  box-sizing: border-box;
  .border-t{
    border-bottom: solid 2px ${AppStyle.color.sub};
    color: ${AppStyle.color.sub};
    font-weight: bold;
    box-sizing: border-box;
  }
  .border{
    border-bottom: solid 2px transparent;
  }

  .ant-tabs-bar{
    margin-bottom: 10px;
  }
  .ant-tabs-nav{
    width: 100%;
  }
  .ant-tabs-nav .ant-tabs-tab{
    height: 50px;
    line-height: 50px;
    padding: 0px;
    ${AppStyle.font.menu}
    margin: 0;
    width: ${props => 100/props.countTab}%;
  }
  .ant-tabs-nav .ant-tabs-tab-active{
    color: ${AppStyle.color.sub};
  }
  .ant-tabs-nav .ant-tabs-tab:hover{
    color: ${AppStyle.color.sub};
  }
  .ant-tabs-ink-bar{
    background: ${AppStyle.color.sub};
    bottom: 0;
    height: 4px;
  }
  
`

// const Tabbar = Styled.div`
//   width: 100%;
//   background: ${AppStyle.color.card};
//   ${AppStyle.shadow.lv1}
//   height: 50px;
//   line-height: 50px;
//   text-align: center;
//   .menu{
//     width: 50%;
//     float: left;
//     cursor: pointer;
//     ${AppStyle.font.menu}
//   }
//   margin-bottom: 2px;

//   box-sizing: border-box;
//   .border-t{
//     border-bottom: solid 2px ${AppStyle.color.sub};
//     color: ${AppStyle.color.sub};
//     font-weight: bold;
//     box-sizing: border-box;
//   }
//   .border{
//     border-bottom: solid 2px transparent;
//   }
// `