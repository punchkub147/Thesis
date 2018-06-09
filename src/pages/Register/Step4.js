import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import ToolBar from '../../layouts/ToolBar'
import { Step, FormWorkTime, Bg } from '../../components'
import bg2 from '../../img/bg2.jpg'

export default class Register4 extends Component {
  render() {
    return (
      <Bg>
        <Style>
          <ToolBar 
            title={this.props.route.title} 
            left={() => browserHistory.push('/register3')}
            />
          <div className='card'>
            <Step step='4'/>
            <FormWorkTime  push='/search' />
          </div>
        </Style>
      </Bg>
    )
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
