import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import logo from '../img/logo6.png'
import logo2 from '../img/logo3.png'
import bg12 from '../img/bg12.jpg'
import bg3 from '../img/bg3.jpg'

import Button from '../components/Button'
import Content from '../components/Content'
import Loading from '../components/Loading'

import TopStyle from '../components/TopStyle'

import { auth, db } from '../api/firebase'
import { getToken } from '../api/notification'

import { message, Icon } from 'antd';
import ToolBar from '../layouts/ToolBar';

class Login extends Component {

  state = {
    loading: false
  }
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

  handleLogin = async (e) => {
    e.preventDefault()

    this.setState({loading: true})
    await auth.signInWithEmailAndPassword(this.email.value, this.password.value)
    .then(async user => {
      if(user){
        this.navigateUser(user)
      }
      this.setState({loading: false})
    })
    .catch(e => {
      e.code=='auth/user-not-found'&&message.info('ไม่มีอีเมลล์นี้ในระบบ กรุณาลงทะเบียน')
      e.code=='auth/wrong-password'&&message.info('รหัสผ่านผิดพลาด')
      
      this.setState({loading: false})
    })
    this.setState({loading: false})
  }

  navigateUser = async (user) => {
    const employerRef = await db.collection('employer').doc(user.uid)
    const employeeRef = await db.collection('employee').doc(user.uid)
    this.setState({loading: true})
    await employeeRef.get().then(async doc => {
      if(doc.exists){
        db.collection('working').where('employee_id', '==', user.uid).get()
        .then(async snap => {
          snap
            ?browserHistory.push('/tasks')
            :browserHistory.push('/search')
        })
        
        await employeeRef.update({
          deviceToken: await getToken()
        })
        console.log('UPDATE TOKEN')
      }else{
        employerRef.get().then(doc => {
          doc.exists
            doc.data().admin
              ?browserHistory.push('/web/admin')
              :browserHistory.push('/web/dashboard')
        })
      }
    })
    this.setState({loading: false})
  }

  render() {

    return (
      <Loading loading={this.state.loading}>  
      <Style>
        <ToolBar 
          title={'เข้าสู่ระบบ'}
          left={() => browserHistory.goBack()} 
        />
        <TopStyle/>

        <div className="container">
          <div className="row justify-content-md-center" style={{margin: '0 -10px'}}>

            <Content>
              {/* 
              <div className="col-11 logo">
                <img alt='' src={logo2}/>
              </div>
              
              <div className="col-10 logo" style={{'margin-top': -20}}>
                <img alt='' src={logo}/>
                <div className='band'>โฮมเบสท์</div>
                <div className='text'>หางานรับมาทำที่บ้าน</div>
              </div>
              */}
              <br/><br/><br/><br/>

              <div className="wrap">
                <form onSubmit={(e) => this.handleLogin(e)}>
                
                  <input placeholder="อีเมลล์" type="email" ref={r => this.email = r }/>

                  <input placeholder="รหัสผ่าน" type="password" ref={r => this.password = r }/>

                  <Button type="submit" onSubmit={(e) => this.handleLogin(e)}>
                    เข้าสู่ระบบ
                  </Button>

                </form>

                <Link to="/register">
                  <div className="register hidden-md-up"><Icon type='user'/> ลงทะเบียนผู้รับงาน</div> 
                </Link>
                <Link to="/web/register">
                  <div className="register employer hidden-md-down"><Icon type='shop'/> ลงทะเบียนผู้ประกอบการ</div> 
                </Link>
              </div>
            

            </Content>
          </div>
        </div>
      </Style>
      </Loading>
    );
  }
}

export default Login;

const Style = Styled.div`
  // transition: 1s;
  // background-image: url('${bg12}');
  // background-size: 50px 10px;
  // background-image: url('${bg3}');
  // background-position: center -230px;
  // background-attachment: fixed;
  // background-size: auto 150%;


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
  .wrap{
    padding: 0 15px;
  }

  .logo{
    width: 100%;
    min-height: 300px;

    animation-name: jackInTheBox;
    animation-duration: 1s;
    margin: 0 auto;


    img{
      width: 100%;
    }
    .band{
      ${AppStyle.font.tool};
      color: ${AppStyle.color.black};
      font-size: 40px;
      text-align: center;
      margin-top: -40px;
    }
    .text{
      ${AppStyle.font.read1};
      color: ${AppStyle.color.black};
      font-size: 26px;
      text-align: center;
      margin-top: -10px;
      margin-bottom: 20px;
    }
  }

  box-sizing: border-box;

  .register{
    width: 100%;
    text-align: center;
    margin-top: 20px;
    color: ${AppStyle.color.black};
    font-weight: bold;
  }
  .employer{
    margin-top: 10px;
  }

`