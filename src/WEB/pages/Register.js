import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { register, auth, createUser, db } from '../../api/firebase'
import { getToken } from '../../api/notification'


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
        await db.collection('employer').doc(user.uid).set(data)
        .then(() => {
          console.log('success')
        })
        //browserHistory.push('/web/works')
      }
    }
  }

  render() {
    return (
      <Style>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-md-3'>
              
              <form onSubmit={e => this.handleRegister(e)}>
                <input placeholder="e-mail" type="email" ref={r => this.email = r }/>
                <input placeholder="password" type="password" ref={r => this.password = r }/>
                <input placeholder="password2" type="password" ref={r => this.password2 = r }/>
    
                <button className="" type="submit" onSubmit={e => this.handleRegister(e)}>ต่อไป</button>
              </form>

            </div>
          </div>
        </div>
      </Style>
    );
  }
}

export default Register;

const Style = Styled.div`
  form{
    margin-top: 200px;
  }
`