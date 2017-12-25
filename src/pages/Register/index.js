import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { register, auth, createUser, db } from '../../api/firebase'
import { getToken } from '../../api/notification'

import Layout from '../../layouts'
import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

class Register extends Component {
  handleRegister = async (e) => {
    e.preventDefault();

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
        db.collection('employee').doc(user.uid).set(data)
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

          <Step step='1'/>
          
          <div className='content'>
            <form onSubmit={e => this.handleRegister(e)}>

              <input type="email" placeholder="อีเมลล์" ref={r => this.email = r }/>

              <input type="password" placeholder="รหัสผ่าน" ref={r => this.password = r }/>

              <input type="password" placeholder="ยืนยันรหัสผ่าน" ref={r => this.password2 = r }/>
 
              <button type="submit" onSubmit={e => this.handleRegister(e)}>ต่อไป</button>

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
      animation-name: fadeInUp;
      animation-duration: 0.3s;
    }
  }

`