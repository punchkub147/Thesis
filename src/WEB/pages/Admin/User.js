import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../../config/style' 
import _ from 'lodash'

import Layout from '../../layouts'

import { auth, db } from '../../../api/firebase'
import Button from '../../../components/Button';

import Table from '../../components/Table';

class Works extends Component {

  state = {
    userList: []
  }

  async componentDidMount() {
    this.getUser()
  }

  getUser = (user) => {
    db.collection('employee')
    .onSnapshot(async querySnapshot => {
      let userList = []
      await querySnapshot.forEach(function(doc) {
        userList.push(Object.assign(doc.data(),{employee_id: doc.id}))
      });
      await this.setState({userList})
    })
  }

  deleteUser = (employee_id) => {
    //db.collection('employee').doc(employee_id).delete()
  }

  render() {
    const { userList } = this.state

    // const colList = [] 
    // _.mapKeys(userList[0], (value, key) => {
    //   if(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    //   colList.push({
    //     title: key,
    //     dataIndex: key,
    //   })
    // });

    // console.log('KEY',colList)

    //const columns = colList

    const columns = [
      {
        title: 'employee_ID',
        dataIndex: 'employee_id',
      }, 
      {
        title: 'ชื่อผู้รับงาน',
        dataIndex: 'fname',
      }, 
      {
        title: 'นามสกุล',
        dataIndex: 'lname',
      },
      {
        title: 'เบอร์ติดต่อ',
        dataIndex: 'phone',
      },
      {
        title: 'ลบ',
        key: 'action',
        render: (text, item) => (
          <span>
            <div onClick={() => this.deleteUser(item.employee_id) }>ลบ</div>
          </span>
        ),
      }
    ];

    return (
      <Style>
        <Layout {...this.props}>

          <Table columns={columns} dataSource={userList} />
          
        </Layout>
      </Style>
    );
  }
}

export default Works;

const Style = Styled.div`

`