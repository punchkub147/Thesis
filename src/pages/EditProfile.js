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
import Bg from '../components/Bg';

class EditProfile extends Component {

  render() {
    return (
      <Style>
        <Bg>
          <ToolBar 
            title='ข้อมูลส่วนตัว'
            left={() => browserHistory.goBack()} 
            //right={this.handleUpdateAbilities}
            />

          <div className="card">
            <FormProfile push='/profile' />
          </div>
        </Bg>
      </Style>
    );
  }
}

export default EditProfile;

const Style = Styled.div`
  // .animate{
  //   animation-name:fadeInUp;
  //   animation-duration: 0.3s;
  // }
  .card{
    margin-top: 10px;    
    width: 100%;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
  }
`