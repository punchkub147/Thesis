import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import ToolBar from '../../layouts/ToolBar'
import { Step, FormProfile, Bg } from '../../components'

export default class extends Component {
  render() {
    return (
      <Bg>
        <Style >
          <ToolBar
            title={this.props.route.title} 
            />
          <div className='card'>
            <Step step='2'/>
            <FormProfile push='/register3'/>
          </div>
        </Style>
      </Bg>
    );
  }
}
const Style = Styled.div`
  .card{
    position: relative;
    width: 100%;
    background: ${AppStyle.color.bg};
    ${AppStyle.shadow.lv1}
    margin-bottom: 40px;
  }
`
