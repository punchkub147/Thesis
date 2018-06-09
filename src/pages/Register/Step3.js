import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../../config/style'
import ToolBar from '../../layouts/ToolBar'
import { Step, FormAbilities, Bg } from '../../components'

export default class extends Component {
  render() {
    return (
      <Bg>
        <Style>
            <ToolBar 
              title={this.props.route.title} 
              left={() => browserHistory.push('/register2')}
              />
            <div className='card'>
              <Step step='3'/>
              <FormAbilities push='/register4' />
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
  }
`
