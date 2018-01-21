import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 

import Layout from '../layouts'


import { auth, db } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import Table from '../components/Table'

class WorkOnHome extends Component {

  state = {
    workingList: [],
  }

  async componentDidMount() {
    await auth.onAuthStateChanged(user => {
      if(user){
        this.setState({user})
        this.getWorking(user)
      }else{
        browserHistory.push('/web/login')
      }
    })
  }

  getWorking = (user) => {
    db.collection('working').where('employer_id', '==', user.uid)
    .onSnapshot(async querySnapshot => {
      let workingList = []
      await querySnapshot.forEach(function(doc) {
        workingList.push(Object.assign(doc.data(),{working_id: doc.id}))
      });
      await this.setState({workingList})
    })
  }

  render() {
    const { workingList } = this.state
    const columns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'work_name',
        key: 'work_name',
        render: (text, item) => <Link to={`/web/editwork/${item.work_id}`}>{text}</Link>,
      },
      {
        title: 'รหัสผู้ทำงาน',
        dataIndex: 'employee_id',
        key: 'employee_id',
      },
      {
        title: 'เวลาทำงานต่อชิ้น',
        dataIndex: 'worktime',
        key: 'worktime',
        className: 'align-right',
        render: (text, item) => <div>~ {text?text/60:0} นาที</div>,
      },
      {
        title: 'ทำเสร็จแล้ว',
        dataIndex: 'finished_piece',
        key: 'finished_piece',
        className: 'align-right',
        render: (text, item) => <div>{text?text:0} ชิ้น</div>,
      }, 
      {
        title: 'ชิ้นงานทั้งหมด',
        dataIndex: 'total_piece',
        key: 'total_piece',
        className: 'align-right',
        render: (text, item) => <div>{text?text:0} ชิ้น</div>,
      },
      {
        title: 'รับงาน',
        key: 'action',
        render: (text, item) => (
          <span>
            <div className='click' onClick={ () => this.handleGetedWork(item)}> รับงาน </div>
          </span>
        ),
      }
    ];

    return (
      <Style>
        <Layout {...this.props}>
          <Table columns={columns} dataSource={workingList} />
        </Layout>
      </Style>
    );
  }
}

export default WorkOnHome;

const Style = Styled.div`
  .click{
    cursor: pointer;
    ${AppStyle.font.hilight}
  }
  .align-right{
    text-align: right;
  }
`