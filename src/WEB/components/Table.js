import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import { Table, Icon, Divider } from 'antd';

export default class extends Component {
  
  render() {

    return (
      <Style>
        <Table {...this.props} 
          bordered 
          pagination={false} 
        />
      </Style>
    );
  }
}

const Style = Styled.div`
  margin-top: 20px;

  .ant-table-wrapper{
    ${AppStyle.shadow.lv1}
  }
  .ant-table-body{
    background: ${AppStyle.color.white};
  }
  .ant-table-thead > tr > th{
    background: ${AppStyle.color.white};
    ${AppStyle.font.read1}
  }

  .ant-table-placeholder{
    background: transparent;
  }

  .ant-table-thead > tr.ant-table-row-hover > td, .ant-table-tbody > tr.ant-table-row-hover > td, .ant-table-thead > tr:hover > td, .ant-table-tbody > tr:hover > td{
    background: ${AppStyle.color.bg}; //HOVER
  }
`