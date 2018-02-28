import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import Config from '../../config' 
import _ from 'lodash'
import moment from 'moment'

import Layout from '../layouts'

import { auth, db, sendNoti } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import { sendWork, cancelWork } from '../functions/work'

import Table from '../components/Table'
import { phoneFormatter } from '../../functions/index';

import { message } from 'antd'

class NeedWork extends Component {

  state = {
    needWorkList: [],
  }

  async componentDidMount() {
    await auth.onAuthStateChanged(user => {
      if(user){
        this.setState({user})
        this.getNeedWork(user)
      }else{
        //browserHistory.push('/web/login')
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

      needWorkList = _.orderBy(needWorkList, ['createAt'], ['desc']); //เรียงวันที่

      await this.setState({needWorkList})
    })
  }

  render() {
    const { needWorkList } = this.state

    const columns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'work_name',
        key: 'work_name',
        render: (text, item) => <Link to={`/web/work/${item.work_id}`}>{text}</Link>,
      }, 
      {
        title: 'ชื่อผู้รับงาน',
        dataIndex: 'employee_name',
        key: 'employee_name',
        //render: (text, item) => <Link to={`/web/editwork/${item.work_id}`}>{text}</Link>,
      }, 
      {
        title: 'เบอร์ติดต่อ',
        dataIndex: 'employee_phone',
        key: 'employee_phone',
        render: (text, item) => <div>{phoneFormatter(text)}</div>,
      }, 
      {
        title: 'จำนวนชุด',
        dataIndex: 'pack',
        key: 'pack',
      }, 
      {
        title: 'เมื่อวันที่',
        dataIndex: 'createAt',
        key: 'createAt',
        className: 'align-right',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
      }, 
      {
        title: 'ส่งงาน',
        key: 'send',
        render: (text, item) => (
          <span>
            <div className='click' onClick={ () => sendWork(item)}> ส่งงาน </div>
          </span>
        )
      },
      {
        title: 'ปฏิเสธ',
        key: 'cancel',
        render: (text, item) => (
          <span>
            <div className='click' onClick={ () => cancelWork(item)}> ปฏิเสธ </div>
          </span>
        ),
      }
    ];

    return (
      <Style>
        <Layout {...this.props}>
          <Table columns={columns} dataSource={needWorkList} />
        </Layout>
      </Style>
    );
  }
}

export default NeedWork;

const Style = Styled.div`
  .click{
    cursor: pointer;
    ${AppStyle.font.hilight}
  }
  .align-right{
    text-align: right;
  }
`