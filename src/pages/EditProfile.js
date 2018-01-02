import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import { db, getUser } from '../api/firebase'

import ToolBar from '../layouts/ToolBar'
import Step from '../components/Step'

import image from '../img/logo-xl.png'
import BottomButton from '../components/BottomButton';
import FormProfile from '../components/FormProfile';

class EditProfile extends Component {

  render() {
    return (
      <Style>
        <div id="EditProfile">
          <ToolBar 
            title='ความสามารถ'
            left={() => browserHistory.goBack()} 
            //right={this.handleUpdateAbilities}
            />
          <FormProfile push='/profile' />
        </div>
      </Style>
    );
  }
}

export default EditProfile;

const Style = Styled.div`
  #EditProfile{
    // .animate{
    //   animation-name:fadeInUp;
    //   animation-duration: 0.3s;
    // }
  }
`