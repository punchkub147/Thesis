import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import { getUser, auth, db } from '../api/firebase'

import Layout from '../layouts'

class Tasks extends Component {

  state = {
    workingList: {}
  }

  async componentDidMount() {
    // auth.onAuthStateChanged(user => {
    //   user
    //     ?getUser('employee', user => {
    //       this.setState({user})
    //       this.getWorking(user)
    //     })
    //     :browserHistory.push('/login')
    // }) 
    const user = await store.get('employee')
    this.setState({user})
    this.getWorking(user)
  }

  getWorking = (user) => {
    db.collection('working').where('employee_id', '==', user.uid)
    .onSnapshot(snap => {
      const workingList = []
      snap.forEach(doc => {
        workingList.push(Object.assign(doc.data(),{working_id: doc.id}))
      })
      this.setState({workingList})
    })
  }

  handleDelete = (id) => {
    db.collection('working').doc(id).delete()
  }

  render() {
    const { workingList } = this.state
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Tasks">
            {_.map(workingList, working => 
              <div className="task">
                {working.work_name} ราคา{working.total_piece} เริ่มงานวันที่{working.startAt}   
                {moment(working.createAt).fromNow()}
                {/*
                  <div onClick={() => this.handleDelete(working.working_id)}>DELETE</div>
                */}
              </div>
            )}
          </div>
        </Style>
      </Layout>
    );
  }
}


//มีงานที่รับมา งานอยู่ที่ช่วงที่ต้องทำ งานเริ่มวันที่-สุดวันที่ วันที่ 1-7 = 7 วัน งาน100ชิ้น ชิ้นละ 3นาที รวมเป็น 300นาที
// เวลางาน หาร จำนวนวันทำงาน => 300/7 
// หักลบกับวันที่ต้องการหยุด หาชื่อวัน ของวันที่ต่างๆ เสาร์ อาทิตย์ จากวันทำงาน



export default Tasks;

const Style = Styled.div`
  #Tasks{
    .task{
      margin-bottom: 10px;
    }
  }
`