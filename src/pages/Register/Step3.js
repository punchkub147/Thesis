import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { db, getUser } from '../../api/firebase'

import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

import image from '../../img/logo-xl.png'
import BottomButton from '../../components/BottomButton';
import FormAbilities from '../../components/FormAbilities';

class Register3 extends Component {

  render() {
    return (
      <Style>
        <div id="Register3">
          <ToolBar 
            title={this.props.route.title} 
            left={() => browserHistory.push('/register3')} 
            //right={this.handleUpdateAbilities}
            />

          <Step step='3'/>
          <FormAbilities push='/register4' />

        </div>
      </Style>
    );
  }
}

export default Register3;

const Style = Styled.div`
  #Register3{

  }
`
