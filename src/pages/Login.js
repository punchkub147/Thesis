import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

import { loginWithEmail, auth, db } from '../api/firebase'

class Login extends Component {

  componentDidMount() {
    auth.onAuthStateChanged(async user => {
      if(user){
        this.navigateUser(user)
      }
    })
  }

  handleLogin = (e) => {
    e.preventDefault()
    auth.signInWithEmailAndPassword(this.email.value, this.password.value)
    .then(async user => {
      if(user){
        this.navigateUser(user)
      }
    })
    .catch(e => {
      console.log('ERROR : ', e)
    })
  }

  navigateUser = async (user) => {
    const employerRef = await db.collection('employer').doc(user.uid)
    const employeeRef = await db.collection('employee').doc(user.uid)
    employerRef.get().then(doc => {
      doc.exists
        ?browserHistory.push('/web/works')
        :employeeRef.get().then(doc => {
          // doc.exists
          //   &&browserHistory.push('/search')
        })
    })
  }

  render() {

    return (
      <Style>
        <div id="Login">
          <div className="content">
            <form onSubmit={(e) => this.handleLogin(e)}>
            
              <div className="mui-textfield mui-textfield--float-label">
                <input type="email" ref={r => this.email = r }/>
                <label>E-mail</label>
              </div>

              <div className="mui-textfield mui-textfield--float-label">
                <input type="password" ref={r => this.password = r }/>
                <label>Password</label>
              </div>

              <button type="submit" onSubmit={(e) => this.handleLogin(e)} className="mui-btn mui-btn--raised">Login</button>

            </form>

            <Link to="/register"> <button type="submit" className="mui-btn mui-btn--flat">Register</button> </Link>
          </div>
        </div>
      </Style>
    );
  }
}

export default Login;

const Style = Styled.div`
  #Login{    
    .content{
      animation-name: fadeInUp;
      animation-duration: 0.3s;
    }
    padding: 0 16px;
    padding-top: 250px;
    box-sizing: border-box;

    .register{
      width: 100%;
      text-align: center;
    }
  }
  .mui-btn{
    width: 100%;
  }

`