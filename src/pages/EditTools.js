import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../config/style'
import ToolBar from '../layouts/ToolBar'
import {FormTools} from '../components'

export default class extends Component {
  componentDidMount() {
    window.scrollTo(0, 0)
  }
  render() {
    return (
      <Style>
        <ToolBar 
          title='อุปกรณ์'
          left={() => browserHistory.goBack()} 
        />
        <FormTools push='/profile' />
      </Style>
    )
  }
}

const Style = Styled.div`

`