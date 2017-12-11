import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { register } from '../../api/firebase'
import { getToken } from '../../api/notification'

import Layout from '../../layouts'
import ToolBar from '../../layouts/ToolBar'

class Register extends Component {
  handleRegister = async (e) => {
    e.preventDefault();
    const collection = "employee"
    const data = {
      deviceToken: await getToken()
    }
    const email = this.email.value
    const password = this.password.value
    const password2 = this.password2.value

    if(password === password2){
      await register(email, password, data, collection, e => {
        console.log('ERROR : ', e)
        browserHistory.push({pathname: '/register2', state: { goNext: true }})
      })
    }
  }

  render() {
    const moveNext = _.get(this.props.location.state,'goNext')

    return (
      <Style moveNext={moveNext}>
        <div id="Register">
          <ToolBar
            title={this.props.route.title} 
            left={() => browserHistory.push({pathname: '/login', state: { goNext: false }})} 
            right={e => this.handleRegister(e)}/>
          <div className='content'>
            <form onSubmit={e => this.handleRegister(e)}>

              <div className="mui-textfield mui-textfield--float-label">
                <input type="email" ref={r => this.email = r }/>
                <label>E-mail</label>
              </div>

              <div className="mui-textfield mui-textfield--float-label">
                <input type="password" ref={r => this.password = r }/>
                <label>Password</label>
              </div>

              <div className="mui-textfield mui-textfield--float-label">
                <input type="password" ref={r => this.password2 = r }/>
                <label>Confirm Password</label>
              </div>

            </form>
          </div>
        </div>
      </Style>
    );
  }
}

export default Register;

const Style = Styled.div`
  #Register{
    .content{
      animation-name: ${props => props.moveNext === true?'fadeInRight':'fadeInLeft'};
      animation-duration: 0.2s;
    }
  }

`