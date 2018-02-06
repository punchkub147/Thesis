import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style'
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
      <Style countTab={tabs.length} {...this.props}>
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
      </Style>
    );
  }
}

export default AppTabbar;

const Style = Styled.div`
  width: 100%;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}
  height: 40px;
  line-height: 40px;
  text-align: center;
  .menu{
    width: ${props => 100/props.countTab}%;
    float: left;
    cursor: pointer;
    ${AppStyle.font.read1}
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
    margin-bottom: 0px;
  }
  .ant-tabs-nav{
    width: 100%;
  }
  .ant-tabs-nav .ant-tabs-tab{
    height: 40px;
    line-height: 40px;
    padding: 0px;
    ${AppStyle.font.read1}
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
    height: 2px;
  }
  .ant-tabs-nav-wrap{
    margin: 0;
  }
  
`