import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import store from 'store'

import { getUser, updateAt, db, auth, storage } from '../../api/firebase'
import { getToken } from '../../api/notification'

import Layout from '../../layouts'
import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'
import BottomButton from '../../components/BottomButton';
import FormProfile from '../../components/FormProfile';


class Register2 extends Component {

  render() {
    return (
      <Style >
        <div id="Register2">
          <ToolBar
            title={this.props.route.title} 
            // left={() => browserHistory.push({pathname: '/register', state: { goNext: false }})} 
            // right={e => this.handleProfile(e)}
            />

          <Step step='2'/>
          <FormProfile push='/register3'/>
        </div>
      </Style>
    );
  }
}

export default Register2;

const Style = Styled.div`
  #Register2{
    .animate{
      animation-name: fadeInUp;
      animation-duration: 0.3s;
    }
    .profileImage{
      width: 135px;
      height: 135px;
      border-radius: 100%;
      background: #ccc;
      object-fit: cover;
      margin: 0 auto;
      text-align: center;
      img{
        width: 100%;
      }
    }
    .haft{
      // width: 45%;
      // float: left;
      // margin-right: 10px;
    }
    button{
      width: 100%;
    }
    .error{
      border: solid 2px red;
    }
  }
`
