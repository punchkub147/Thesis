import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../../config/style' 
import _ from 'lodash'

import Layout from '../../layouts'

import { auth, db } from '../../../api/firebase'
import Button from '../../../components/Button';

import Table from '../../components/Table';
import { Popconfirm  } from 'antd'

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

  banUser = (employee_id) => {
    //db.collection('employee').doc(employee_id).delete()
    db.collection('employee').doc(employee_id).update({
      baned: true
    })
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
        title: 'ระงับการใช้งาน',
        key: 'action',
        render: (text, item) => {
          return (
            <Popconfirm title="Sure to ban?" onConfirm={() => this.banUser(item.employee_id)}>
              <a href="#">BAN</a>
            </Popconfirm>
          );
        },
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