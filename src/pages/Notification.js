import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'
import send from '../img/send.png'
import Content from '../components/Content'

import { getToken, PushFCM, PushSelf } from '../api/notification'

import { db } from '../api/firebase'

class Notification extends Component {

  state = {
    user: store.get('employee'),
    notiList: store.get('notifications'),
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    // auth.onAuthStateChanged(user => {
    //   user
    //     ?getUser('employee', user => {
    //       this.setState({user})
    //       this.getNotification(user)
    //     })
    //     :browserHistory.push('/login')
    // })
    this.getNotification(store.get('employee'))
  }

  getNotification = (user) => {
    if(!user)return

    db.collection('notifications').where('employee_id', '==', user.uid)
    .orderBy('createAt', 'asc')
    .onSnapshot(snapshot => {
      let notiList = []
      snapshot.forEach(data => {
        notiList.push(Object.assign(data.data(),{noti_id: data.id}))
      })

      notiList = _.orderBy(notiList, ['createAt'], ['desc']); //เรียงวันที่

      this.setState({notiList})
      store.set('notifications',notiList)
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
        
          <Content>
          {_.map(notiList, (data,i) => 
            <Noti fade={i*0.2}>
              <img alt='' src={send}/>
              <div className="text">{data.message}</div>
              <div className="time">{/*data.createAt*/}</div>
            </Noti>
          )}
          </Content>
          {/*}
          <button className="mui-btn" onClick={this.handleSendNoti}>TEST SEND NOTI</button>
          <button className="mui-btn" onClick={this.handleServerNoti}>SERVER SEND NOTI</button>
          */}
        </Style>
      </Layout>
    );
  }
}

export default Notification;

const Style = Styled.div`
  padding-top: 10px;
`
const Noti = Styled.div`
  width: 100%;
  min-height: 70px;
  background: ${AppStyle.color.card};
  margin-bottom: 10px;
  padding: 10px;
  box-sizing: border-box;
  ${AppStyle.shadow.lv1}
  img{
    width: 40px;
    float: left;
    margin-right: 10px;
  }
  .text{
    ${AppStyle.font.text2}
    float: right;
    width: 80%;

    line-height: 1.5em;
    height: 3em;
    overflow: hidden;
    //white-space: nowrap;
    text-overflow: ellipsis;
  }
  .time{
    ${AppStyle.font.text2}
  }

  animation-name: fadeInUp;
  animation-duration: ${props => props.fade+0.2}s;
`