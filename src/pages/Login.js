import React, { Component } from 'react';
import { Link } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

import { loginWithEmail } from '../api/firebase'

class Login extends Component {

  componentDidMount() {

  }

  handleLogin = (e) => {
    e.preventDefault()
    loginWithEmail(this.email.value, this.password.value, res => {
      console.log('login', res)
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
                <input type="text" ref={r => this.password = r }/>
                <label>Password</label>
              </div>

              <button type="submit" className="mui-btn mui-btn--raised">Login</button>

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