import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import _ from 'lodash'

//import { Tabs } from 'antd';
//const TabPane = Tabs.TabPane;

import { Tabs } from 'antd-mobile';

class AppTabbar extends Component {

  state={
    menu: 0
  }

  render() {

    const { tabs } = this.props

    const tabsTitle = _.map(tabs, tab => {
      return {title: tab.name}
    });

    return (
      <Style countTab={tabs.length} {...this.props}>
        <Tabs tabs={tabsTitle}
          initialPage={0}
          
        >
          {_.map(tabs, tab => 
            tab.render
          )}
        </Tabs>
      </Style>
    );
  }
}

export default AppTabbar;

const Style = Styled.div`

  .am-tabs-default-bar-top .am-tabs-default-bar-content, .am-tabs-default-bar-bottom .am-tabs-default-bar-content{
    padding: 0px;
    background: ${AppStyle.color.card};
  }
  .am-tabs-default-bar-tab{
    ${AppStyle.font.menu}
    height: 50px;
    line-height: 50px;
  }
  .am-tabs-tab-bar-wrap{
    margin-bottom: 10px;
  }
  .am-tabs-default-bar-tab-active{
    color: ${AppStyle.color.sub};
  }
  .am-tabs-default-bar-underline{
    border: none;
    height: 2px;
    background: ${AppStyle.color.sub};
  }
`