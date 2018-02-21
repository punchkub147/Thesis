import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import Layout from '../layouts'

import Table from '../components/Table';
import { auth, db } from '../../api/firebase'
import EmployeeData from '../components/EmployeeData';

import { secToText } from '../../functions/moment'

import { Modal, Button } from 'antd';


export default class extends Component {
  
  state = {
    employer: store.get('employer'),
    employees: [],
    modalVisible: false,
    selectEmployee: '',
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    
    const { employer } = this.state

    let es = []
    await db.collection('working').where('employer_id', '==', employer.uid)
    .get().then(snap => {
      snap.forEach(doc => {
        es.push(doc.data().employee_id)
      })
    })
    es = _.uniq(es)


    await db.collection('employee')
    .onSnapshot(snap => {
      let employees = []
      snap.forEach(doc => {
        const { workTime } = doc.data()
        if(_.indexOf(es, doc.id) !== -1){
          employees.push(Object.assign(doc.data(),{
            employee_id: doc.id,
            sumWorktime: workTime.sun+workTime.mon+workTime.tue+workTime.wed+workTime.thu+workTime.fri+workTime.sat
          }))
        }
      })
      this.setState({
        employees
      })
    })

  }
  render() {
    const { employees, selectEmployee } = this.state
    const columns = [
      {
        title: `ชื่อ`,
        dataIndex: 'name',
        key: 'name',
        className: 'name',
        render: (text, item) => 
          <span onClick={() => this.setState({modalVisible: true,selectEmployee: item.employee_id})}>{item.tname + item.fname + ' ' + item.lname}</span>,
      },
      {
        title: `เบอรโทรศัพท์`,
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: `เวลาทำงานต่อสัปดาห์`,
        dataIndex: 'workTime',
        key: 'workTime',
        render: (text, item) => 
          <span>{
            secToText(item.sumWorktime)
          }</span>,
      },
      {
        title: `ทำลังทำงาน`,
        dataIndex: 'working',
        key: 'working',
      },
      {
        title: `ทำงานสำเร็จ`,
        dataIndex: 'workSuccess',
        key: 'workSuccess',
      },
      {
        title: `ทำงานไม่สำเร็จ`,
        dataIndex: 'workFail',
        key: 'workFail',
      },
    ];
    console.log('FFFFFF',employees)

    return (
      <Style>
        <Layout {...this.props}>
             
          <Table 
            columns={columns} 
            dataSource={employees}
            expandedRowRender={data => 
              <span>
                ที่อยู่{' '}
                {data.homeNo&&`${data.homeNo} `}
                {data.road&&`ถ.${data.road} `}
                {data.area&&`ข.${data.area} `}
                {data.district&&`ข.${data.district} `}
                {data.province&&`จ.${data.province} `}
                {data.postcode&&`${data.postcode} `}
              </span>
            }
          />

          <Modal
            style={{ top: 20 }}
            visible={this.state.modalVisible}
            onOk={() => this.setState({modalVisible: false})}
            onCancel={() => this.setState({modalVisible: false})}
            footer={false}
          >
            <EmployeeData uid={selectEmployee}/>
          </Modal>
              
        </Layout>
      </Style>
    );
  }
}

const Style = Styled.div`
  .name{
    ${AppStyle.font.hilight}
    cursor: pointer;
  }
`