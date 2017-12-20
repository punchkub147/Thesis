import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import Config from '../../config' 
import _ from 'lodash'
import moment from 'moment'

import Layout from '../layouts'

import { auth, db } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

class NeedWork extends Component {

  state = {
    needWorkList: {},
  }

  async componentDidMount() {
    await auth.onAuthStateChanged(user => {
      if(user){
        this.setState({user})
        this.getNeedWork(user)
      }else{
        browserHistory.push('/web/login')
      }
    })
  }

  getNeedWork = (user) => {
    db.collection('needWork').where('employer_id', '==', user.uid).get()
    .then(async querySnapshot => {
      let needWorkList = []
      await querySnapshot.forEach(function(doc) {
        needWorkList.push(Object.assign(doc.data(),{needWork_id: doc.id}))
      });
      await this.setState({needWorkList})
    })
    .catch(function(error) {
      console.log("Error getting documents: ", error);
    });
  }

  handleSendWork = (data) => {

    db.collection('needWork').doc(data.needWork_id).delete()
    /////////////////

    db.collection('works').doc(data.work_id).get()
    .then(snapshot => {
      const work = snapshot.data()
      db.collection('working').add({
        employee_id: data.employee_id,
        work_id: snapshot.id,
        total_piece: work.piece*data.pack,
        worktime: work.worktime,
        price: work.price,
        work_name: work.name,
        startAt: work.startAt,
        endAt: work.endAt,
      })
    })
    /////////////////

    const title = 'บริษัทกำลังส่งงานให้'
    const message = `บริษัทกำลังส่ง ${data.work_name} ในวันที่ ${data.startAt}`
    db.collection('notifications').add({
      employee_id: data.employee_id,
      type: 'work',
      title,
      message,
      link: `${Config.host}/tasks`,
      watched: false,
      createAt: moment().format(),
    })

    PushFCM({
      to: data.deviceToken,
      title,
      body: message,
    })
  }

  render() {
    const { needWorkList } = this.state

    return (
      <Style>
        <Layout>
          <div id="NeedWork">
            {_.map(needWorkList, (data, key) =>
              <div className="">
                {data.employee_name} {data.employee_phone} {data.pack}
                <button onClick={ () => this.handleSendWork(data)}>ส่งงาน</button>
              </div>
            )}
          </div>
        </Layout>
      </Style>
    );
  }
}

export default NeedWork;

const Style = Styled.div`
  #NeedWork{    

  }
`