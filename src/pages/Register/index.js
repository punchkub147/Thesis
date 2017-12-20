import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { register, auth, createUser } from '../../api/firebase'
import { getToken } from '../../api/notification'

import Layout from '../../layouts'
import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

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

    if(password === password2 && password != ''){
      const user = await auth.createUserWithEmailAndPassword(email, password)
      .catch( e => {
        console.log(e.message);
        //openNotificationWithIcon('error',error.message,'');
      });
      if(user){
        await createUser(user, data, collection)
        browserHistory.push('/register2')
      }
    }
  }

  render() {

    return (
      <Style>
        <div id="Register">
          <ToolBar
            title={this.props.route.title} 
            left={() => browserHistory.push('/login')} 
            // right={e => this.handleRegister(e)}
            />

          <Step/>
          
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
 
              <button className="mui-btn" type="submit" onSubmit={e => this.handleRegister(e)}>ต่อไป</button>

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
      animation-name: fadeInRight;
      animation-duration: 0.2s;
    }
    button{
      width: 100%;
    }
  }

`