import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 

import { auth, db } from '../../api/firebase'

class Login extends Component {

  handleLogin = (e) => {
    e.preventDefault()
    auth.signInWithEmailAndPassword(this.email.value, this.password.value)
    .then(async user => {
      const employerRef = await db.collection('employer').doc(user.uid)
      const employeeRef = await db.collection('employee').doc(user.uid)
      employerRef.get().then(doc => {
        doc.exists
          ?browserHistory.push('/web/works')
          :employeeRef.get().then(async doc => {
            await doc.exists&&browserHistory.push('/search')
          })
      })
      //browserHistory.push('/web/works')
    })
    .catch(e => {
      console.log('ERROR : ', e)
    })
  }

  render() {

    return (
      <Style>
          <div id="Login">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-md-3">
                  <form onSubmit={this.handleLogin}>   
                    สำหรับผู้ประกอบการ<br/><br/>

                    <input placeholder="e-mail" type="email" ref={r => this.email = r }/>
                    <input placeholder="password" type="password" ref={r => this.password = r }/>
                    
                    <button type="submit" onSubmit={this.handleLogin} className="">Login</button>
                  </form>

                  <Link to="/web/register"> <button type="submit" className="">Register</button> </Link>
                
                </div>
              </div>
            </div>
          </div>
      </Style>
    );
  }
}

export default Login;

const Style = Styled.div`
  #Login{    
    form{
      margin-top: 150px;
    }
  }
`