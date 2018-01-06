import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import { db, getUser, updateAt, storage } from '../api/firebase'

import ToolBar from '../layouts/ToolBar'
import Button from './Button';

const isEmpty = (data) => {
  return data === ""?true:false
}

class FormWorkTime extends Component {

  state = {

  }

  async componentDidMount() {
    // console.log(store.get('employee'))
    this.setState({
      user: store.get('employee')
    })
    await getUser('employee', user => {
      this.setState({user})
      store.set('employee',user)
    })
  }

  handleUpdateWorkTime = () => {
    browserHistory.push(this.props.push)
  }

  render() {   

    return (
      <Style>
        <div id="FormWorkTime">
          FORM WORK TIME
          <Button onClick={this.handleUpdateWorkTime}>SUBMIT</Button>
        </div>
      </Style>
    );
  }
}

export default FormWorkTime;


const Style = Styled.div`
  #FormWorkTime{

  }
`
