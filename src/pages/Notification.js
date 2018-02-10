import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import Layout from '../layouts'
import send from '../img/send.png'
import Content from '../components/Content'

import { getToken, PushFCM, PushSelf } from '../api/notification'
import { auth, getUser } from '../api/firebase'

import { db } from '../api/firebase'

class Notification extends Component {

  state = {
    user: store.get('employee'),
    notiList: store.get('notifications'),
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    this.getNotification(store.get('employee'))
  }

  getNotification = (user) => {
    if(!user)return

    db.collection('notifications').where('receiver', '==', user.uid)
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
    PushSelf({
      title: "ทดสอบแจ้งเตือน",
      body: 'ข้อความ'
    })
  }

  handleServerNoti = async () => {
    PushFCM({
      to: await getToken(),
      title: 'แจ้งเตือนจาก Firebase',
      body: 'รายละเอียด',
    })
  }

  render() {
    const { notiList } = this.state
    console.log(notiList)

    return (
      <Layout route={this.props.route}>
        <Style>
        
          <Content>
          {_.map(notiList, (data,i) => 
            <Link to={data.path}>
              <Noti fade={i*0.2}>
                <img alt='' src={send}/>
                <div className="text">
                  {data.message} 
                  <span className="time"> เมื่อ {moment(data.createAt).locale('th').fromNow()}</span>
                </div>
                
              </Noti>
            </Link>
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
    ${AppStyle.font.read2}
    float: right;
    width: 80%;

    line-height: 1.5em;
    height: 3em;
    overflow: hidden;
    //white-space: nowrap;
    text-overflow: ellipsis;
  }
  .time{
    ${AppStyle.font.read3}
  }

  animation-name: fadeInUp;
  animation-duration: ${props => props.fade+0.2}s;
`