import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
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
    db.collection('needWork').where('employer_id', '==', user.uid)
    .onSnapshot(async querySnapshot => {
      let needWorkList = []
      await querySnapshot.forEach(function(doc) {
        needWorkList.push(Object.assign(doc.data(),{needWork_id: doc.id}))
      });
      await this.setState({needWorkList})
    })
  }

  handleSendWork = (data) => {

    db.collection('needWork').doc(data.needWork_id).delete()
    /////////////////

    db.collection('works').doc(data.work_id).get()
    .then(async snapshot => {
      const work = snapshot.data()
      const working = {
        employee_id: data.employee_id,
        work_id: snapshot.id,
        total_piece: work.piece*data.pack,
        finished_piece: 0,
        worktime: work.worktime,
        price: work.price,
        work_name: work.name,
        startAt: work.startAt,
        endAt: work.endAt,
        createAt: new Date,
      }
      await db.collection('working').add(_.pickBy(working, _.identity))
      console.log('ADD WORKING SUCCESS')
    })
    /////////////////

    const title = 'บริษัทยืนยันการส่งงาน'
    const message = `บริษัทจะจัดส่ง ${data.work_name} ให้ในวันที่ ${data.startAt}`
    const notifications = {
      employee_id: data.employee_id,
      type: 'send',
      title,
      message,
      link: `${Config.host}/tasks`,
      watched: false,
      createAt: moment().format(),
    }
    db.collection('notifications').add(_.pickBy(notifications, _.identity))

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