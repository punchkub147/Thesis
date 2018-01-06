import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { db, getUser } from '../../api/firebase'

import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

import FormWorkTime from '../../components/FormWorkTime';

class Register4 extends Component {

  render() {
    return (
      <Style>
        <div id="Register4">
          <ToolBar 
            title={this.props.route.title} 
            left={() => browserHistory.push('/register2')} 
            //right={this.handleUpdateAbilities}
            />

          <Step step='4'/>
          <FormWorkTime  push='/search' />

        </div>
      </Style>
    );
  }
}

export default Register4;

const Style = Styled.div`
  #Register4{

  }
`
