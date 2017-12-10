import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

import { setUpNoti, getToken, PushFCM, PushSelf } from '../api/notification'

class Notification extends Component {

  handleSendNoti = async () => {
    //console.log('HandleClickToken:', this.state.token)
    PushSelf({
      title: "พุชหาตัวเอง",
      body: 'ข้อความข้างใน'
    })
    PushFCM({
      to: await getToken(),
      title: 'หัวข้อเรื่อง',
      body: 'รายละเอียด',
    })
  }

  render() {

    return (
      <Layout location={this.props.location}>
        <Style>
          <div id="Notification">
            Notification
            <button onClick={this.handleSendNoti}>
              SEND NOTI
            </button>
          </div>
        </Style>
      </Layout>
    );
  }
}

export default Notification;

const Style = Styled.div`
  #Notification{
    color: ${AppStyle.color.main}
  }

`