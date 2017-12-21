import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import Layout from '../layouts'
import send from '../img/send.png'

import { setUpNoti, getToken, PushFCM, PushSelf } from '../api/notification'

import { getUser, auth, db } from '../api/firebase'

class Notification extends Component {

  state = {
    user: {},
    notiList: [],
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      user
        ?getUser('employee', user => {
          this.setState({user})
          this.getNotification(user)
        })
        :browserHistory.push('/login')
    })
  }

  getNotification = (user) => {
    db.collection('notifications').where('employee_id', '==', user.uid).get()
    .then(snapshot => {
      let notiList = []
      snapshot.forEach(data => {
        notiList.push(Object.assign(data.data(),{noti_id: data.id}))
      })
      this.setState({notiList})
    })
  }

  handleSendNoti = async () => {
    //console.log('HandleClickToken:', this.state.token)
    PushSelf({
      title: "ทดสอบแจ้งเตือน",
      body: 'ข้อความ'
    })
  }

  handleServerNoti = async () => {
    //console.log('HandleClickToken:', this.state.token)
    PushFCM({
      to: await getToken(),
      title: 'แจ้งเตือนจาก Firebase',
      body: 'รายละเอียด',
    })
  }

  render() {
    const { notiList } = this.state
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Notification">
            <button className="mui-btn" onClick={this.handleSendNoti}>TEST SEND NOTI</button>
            <button className="mui-btn" onClick={this.handleServerNoti}>SERVER SEND NOTI</button>

            {_.map(notiList, (data,i) => 
              <Noti fade={i*0.2}>
                <img src={send}/>
                <div className="text">{data.message}</div>
                <div className="time">{/*data.createAt*/}</div>
              </Noti>
            )}
          </div>
        </Style>
      </Layout>
    );
  }
}

export default Notification;

const Style = Styled.div`
#Notification{
  padding-top: 10px;
}
`

const Noti = Styled.div`
  width: 100%;
  min-height: 70px;
  background: ${AppStyle.color.card};
  margin-bottom: 10px;
  padding: 10px;
  box-sizing: border-box;
  img{
    width: 40px;
    float: left;
    margin-right: 10px;
  }
  .text{
    ${AppStyle.font.text1}
  }
  .time{
    ${AppStyle.font.text2}
  }

  animation-name: fadeInUp;
  animation-duration: ${props => props.fade+0.2}s;
`