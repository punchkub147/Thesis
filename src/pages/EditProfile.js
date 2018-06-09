import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../config/style'
import ToolBar from '../layouts/ToolBar'
import {Bg, FormProfile} from '../components'

export default class extends Component {
  componentDidMount() {
    window.scrollTo(0, 0)
  }
  render() {
    return (
      <Style>
        <Bg>
          <ToolBar 
            title='ข้อมูลส่วนตัว'
            left={() => browserHistory.goBack()}
            />
          <div className="card">
            <FormProfile push='/profile' />
          </div>
          <div style={{height: 50}}/>
        </Bg>
      </Style>
    )
  }
}

const Style = Styled.div`
  // .animate{
  //   animation-name:fadeInUp;
  //   animation-duration: 0.3s;
  // }
  .card{
    margin-top: 10px;    
    width: 100%;
    background: ${AppStyle.color.bg};
    ${AppStyle.shadow.lv1}
  }
`