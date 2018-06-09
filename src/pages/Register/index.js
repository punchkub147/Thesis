import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../../config/style'
import { auth, db } from '../../api/firebase'
import { getToken } from '../../api/notification'
import ToolBar from '../../layouts/ToolBar'
import { Step, Button, Bg } from '../../components'
import { message } from 'antd'

export default class extends Component {
  handleRegister = async (e) => {
    e.preventDefault()
    const email = this.email.value
    const password = this.password.value
    const password2 = this.password2.value
    const data = {
      deviceToken: await getToken(),
      email,
    }
    if(password === password2 && password !== ''){
      const user = await auth.createUserWithEmailAndPassword(email, password)
      .catch( e => {
        message.info(e.message)
        //openNotificationWithIcon('error',error.message,'')
      })
      if(user){
        await db.collection('employee').doc(user.uid).set(data)
        browserHistory.push('/register2')
      }
    }else{
      message.info('รหัสผ่านไม่ตรงกัน')
    }
  }

  render() {
    return (
      <Bg>
        <Style>
          <ToolBar
            title={this.props.route.title} 
            left={() => browserHistory.push('/login')}
            />
          <div className='card'>
            <Step step='1'/>
            <div className='content'>
              <form onSubmit={e => this.handleRegister(e)}>
                <input type="email" placeholder="อีเมลล์" ref={r => this.email = r }/>
                <input type="password" placeholder="รหัสผ่าน" ref={r => this.password = r }/>
                <input type="password" placeholder="ยืนยันรหัสผ่าน" ref={r => this.password2 = r }/>
                <Button type="submit" onSubmit={e => this.handleRegister(e)}>ต่อไป</Button>
              </form>
            </div>
          </div>
        </Style>
      </Bg>
    )
  }
}

const Style = Styled.div`
  .content{
    // animation-name: fadeInUp;
    // animation-duration: 0.3s;
  }
  .card{
    position: relative;
    width: 100%;
    background: ${AppStyle.color.bg};
    ${AppStyle.shadow.lv1}

    button{
      position: relative;
      top: 20px;
    }
  }
`