import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 

import Loading from '../../components/Loading'
import Content from '../../components/Content'
import Button from '../../components/Button'

import logo from '../../img/logo-xl.png'
import bg12 from '../../img/bg12.jpg'

import { auth, db } from '../../api/firebase'

import { message } from 'antd';

class Login extends Component {

  state = {
    loading: false
  }

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
      message.info(e);
    })
  }

  render() {

    return (
      <Loading loading={this.state.loading}>  
      <Style>
        <div className="container">
          <div className="row justify-content-md-center">

            <div className="col-xs-12 col-md-6">
                <div className="col-11 logo" style={{'margin-top': '40px'}}>
                  <img alt='' src={logo}/>
                </div>
            </div>

            <div className="col-xs-12 col-md-6">
              <div className="card">

              <div className='title'> สำหรับผู้ประกอบการ </div>


              <form onSubmit={this.handleLogin}>
              
                <input placeholder="อีเมลล์" type="email" ref={r => this.email = r }/>

                <input placeholder="รหัสผ่าน" type="password" ref={r => this.password = r }/>

                <Button type="submit" onSubmit={this.handleLogin}>
                  เข้าสู่ระบบ
                </Button>

              </form>

              <Link to="/web/register">
                <div className="register">สมัครสมาชิก</div> 
              </Link>
            </div>
            </div>
          </div>
        </div>
      </Style>
      </Loading>
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
    height: 100vh;

    .title{
      ${AppStyle.font.main}
      text-align: center;
      margin: 10px auto;
    }
  }

  .logo{
    width: 100%;
    min-height: 300px;

    animation-name: jackInTheBox;
    animation-duration: 1s;
    margin: 0 auto;
    margin-top: 200px;
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