import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import logo from '../img/logo-xl.png'
import bg12 from '../img/bg12.jpg'

import Button from '../components/Button'
import Content from '../components/Content'

import { auth, db } from '../api/firebase'
import { getToken } from '../api/notification'


class Login extends Component {

  componentDidMount() {
    window.scrollTo(0, 0)
    auth.onAuthStateChanged(async user => {
      if(user){

        const employerRef = await db.collection('employer').doc(user.uid)
        const employeeRef = await db.collection('employee').doc(user.uid)
        employerRef.get().then(doc => {
          doc.exists
            ?browserHistory.push('/web/works')
            :employeeRef.get().then(async doc => {
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
    employeeRef.get().then(async doc => {
      if(doc.exists){
        browserHistory.push('/search')
        await employeeRef.update({
          deviceToken: await getToken()
        })
        console.log('UPDATE TOKEN')
      }else{
        employerRef.get().then(doc => {
          doc.exists
            &&browserHistory.push('/web/works')
        })
      }
    })
  }

  render() {

    return (
      <Style>
        <div className="container">
          <div className="row justify-content-md-center">

            <Content>
              <div className="logo">
                <img alt='' src={logo}/>
              </div>
            
            <div className="card">
              <form onSubmit={(e) => this.handleLogin(e)}>
              
                <input placeholder="อีเมลล์" type="email" ref={r => this.email = r }/>

                <input placeholder="รหัสผ่าน" type="password" ref={r => this.password = r }/>

                <Button type="submit" onSubmit={(e) => this.handleLogin(e)}>
                  Login
                </Button>

              </form>

              <Link to="/register">
                <div className="register">Register</div> 
              </Link>
            </div>
            </Content>
          </div>
        </div>
      </Style>
    );
  }
}

export default Login;

const Style = Styled.div`
  transition: 1s;
  background-image: url('${bg12}');
  background-size: 50px 10px;
  min-height: 100vh;

  .content{
    animation-name: fadeInUp;
    animation-duration: 0.3s;
  }

  .card{
    background: ${AppStyle.color.bg};
    padding: 10px;
    ${AppStyle.shadow.lv1}
  }

  .logo{
    width: 100%;
    min-height: 340px;

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
    margin-top: 20px;
  }
`