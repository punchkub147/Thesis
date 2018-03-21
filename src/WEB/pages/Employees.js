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

import { phoneFormatter } from '../../functions'

import { Modal, Button, Rate } from 'antd';


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
        console.log(doc.data())
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
        title: 'ผู้ทำงาน',
        dataIndex: 'fname',
        key: 'employee_name',
        className: 'click',
        render: (text, item) => 
          <span onClick={() => browserHistory.push(`/web/employee/${item.employee_id}`)} style={{position: 'relative'}}>
            <img src={item.profileImage} className='employee_image'/>
            {' '+item.tname+item.fname+' '+item.lname}
          </span>,
        sorter: (a, b) => a.fname - b.fname,
      },
      {
        title: `เบอรโทรศัพท์`,
        dataIndex: 'phone',
        key: 'phone',
        render: (text, item) => 
          <span>{
            phoneFormatter(text)
          }</span>,
      },
      {
        title: `ที่อยู่ อำเภอ/ตำบล`,
        dataIndex: 'province',
        key: 'address',
        render: (text, item) => 
          <span>{
            item.area + " " + item.district + " " + item.province
          }</span>,
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
        title: `กำลังทำงาน`,
        dataIndex: 'working',
        key: 'working',
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

  .employee_image{
    width: 32px;
    height: 32px;
    margin: -7px 0;
    object-fit: cover;
    border-radius: 100%;
  }  
  .click{
    cursor: pointer;
  }
`