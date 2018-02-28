import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import { browserHistory, Link } from 'react-router';

import Button from '../../components/Button'
import TopStyle from '../../components/TopStyle'

import FormEditProfile from '../components/FormEditProfile'

import { auth, db } from '../../api/firebase'
import { getToken } from '../../api/notification'

import { message } from 'antd'


class Register extends Component {

  state = {
    registerStep: 1
  }


  handleRegister = async (e) => {
    e.preventDefault();

    const email = this.email.value
    const password = this.password.value
    const password2 = this.password2.value
    const data = {
      deviceToken: await getToken(),
      email: email,
    }

    if(password === password2 && password !== '' && password.length>=6){
      const user = await auth.createUserWithEmailAndPassword(email, password)
      .catch( e => {
        console.log(e.message);
        message.info(e)
      });
      if(user){ 
        await db.collection('employer').doc(user.uid).set(data)
        .then(() => {
          console.log('success')
        })
        //browserHistory.push('/web/works')
        this.setState({
          registerStep: 2
        })
      }
    }else{
      message.info('รหัสผ่านผิดพลาด')
    }
  }

  render() {
    const { registerStep } = this.state

    const registerEmail = (
      <div className='col-md-4'>
        <form className='register' onSubmit={e => this.handleRegister(e)}>
          <div className='title'>ลงทะเบียน</div>
          <input placeholder="อีเมลล์" type="email" ref={r => this.email = r }/>
          <input placeholder="รหัสผ่าน" type="password" ref={r => this.password = r }/>
          <input placeholder="ยืนยันรหัสผ่าน" type="password" ref={r => this.password2 = r }/>

          <Button className="" type="submit" onSubmit={e => this.handleRegister(e)}>ต่อไป</Button>
        </form>
      </div>
    )
    const registerProfile = (
      <div className='col-md-6'>
        <FormEditProfile push='/web/works'/>
      </div>
    )

    return (
      <Style>
        <TopStyle/>
        <div className='container'>
          <div className='row justify-content-center'>
            {registerStep == 1 &&registerEmail}
            {registerStep == 2 &&registerProfile}
          </div>
        </div>
      </Style>
    );
  }
}

export default Register;

const Style = Styled.div`
  .register{
    margin-top: 200px;
    text-align: center;
    .title{
      ${AppStyle.font.main}
    }
  }
`