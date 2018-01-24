import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'

import { Spin, Icon } from 'antd';
const antIcon = <Icon type="loading" style={{ fontSize: 24, marginTop: '20%' }} spin />;

export default class extends Component {

  render() {

    //return <div>{this.props.children}</div>

    return (
      <Spin tip="รอสักครู่..." spinning={this.props.loading} size="large">    
        {this.props.children}
      </Spin>
    );
  }
}

const Style = Styled.div`

`
