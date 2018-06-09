import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import ToolBar from '../layouts/ToolBar'
import {FormAbilities} from '../components'

export default class extends Component {
  componentDidMount() {
    window.scrollTo(0, 0)
  }
  render() {
    return (
      <Style>
        <div id="EditAbilities">
          <ToolBar 
            title='ความสามารถ'
            left={() => browserHistory.goBack()}
          />
          <FormAbilities />
        </div>
      </Style>
    );
  }
}

const Style = Styled.div`
  #EditAbilities{
    // .animate{
    //   animation-name:fadeInUp;
    //   animation-duration: 0.3s;
    // }
  }
`