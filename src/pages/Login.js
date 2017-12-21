import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import logo from '../img/logo-xl.png'
import bg12 from '../img/bg12.jpg'

import Layout from '../layouts'

import { loginWithEmail, auth, db } from '../api/firebase'

class Login extends Component {

  componentDidMount() {
    auth.onAuthStateChanged(async user => {
      if(user){
        const employerRef = await db.collection('employer').doc(user.uid)
        const employeeRef = await db.collection('employee').doc(user.uid)
        employerRef.get().then(doc => {
          doc.exists
            ?browserHistory.push('/web/works')
            :employeeRef.get().then(doc => {
              doc.exists
                //&&browserHistory.push('/search')
            })
        })
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
    employeeRef.get().then(doc => {
      doc.exists
        ?browserHistory.push('/search')
        :employerRef.get().then(doc => {
          doc.exists
            &&browserHistory.push('/web/works')
        })
    })
  }

  render() {

    return (
      <Style>
        <div id="Login">
          <div className="container">
            <div className="row justify-content-md-center">
              <div className="col-xs-12 col-sm-8 col-md-6 col-lg-4">
                <div className="logo">
                  <img src={logo}/>
                </div>
                <form onSubmit={(e) => this.handleLogin(e)}>
                
                  <input placeholder="อีเมลล์" type="email" ref={r => this.email = r }/>

                  <input placeholder="รหัสผ่าน" type="password" ref={r => this.password = r }/>

                  <button type="submit" onSubmit={(e) => this.handleLogin(e)}>
                    Login
                  </button>

                </form>

                <Link to="/register"> <button type="submit" className="">Register</button> </Link>
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
    background-image: url('${bg12}');
    background-size: 50px 10px;
    height: 100vh;

    .content{
      animation-name: fadeInUp;
      animation-duration: 0.3s;
    }
    .logo{
      width: 100%;

      animation-name: jackInTheBox;
      animation-duration: 1s;

      img{
        width: 100%;
      }
    }
    box-sizing: border-box;

    .register{
      width: 100%;
      text-align: center;
    }
  }

`