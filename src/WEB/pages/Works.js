import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'

import Layout from '../layouts'

import { auth, db } from '../../api/firebase'
import Button from '../../components/Button';

import Table from '../components/Table';

class Works extends Component {

  state = {
    user: {},
    itemsList: []
  }

  async componentDidMount() {
    await auth.onAuthStateChanged(async user => {
      if(user){
        this.setState({user})
        this.getItems(user)
      }else{
        browserHistory.push('/web/login')
      }
    })
  }

  getItems = (user) => {
    db.collection('works').where('employer_id', '==', user.uid)
    .onSnapshot(async querySnapshot => {
      let itemsList = []
      await querySnapshot.forEach(async doc => {

        itemsList.push(Object.assign(doc.data(),{
          work_id: doc.id,
        }))

      });
      itemsList = _.orderBy(itemsList, ['createAt'], ['desc']); //เรียงวันที่
      await this.setState({itemsList})
    })
  }

  render() {
    const { itemsList } = this.state
    console.log(itemsList)

    const columns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'name',
        key: 'name',
        className: 'name',
        render: (text, item) => <Link to={`/web/work/${item.work_id}`}>{text}</Link>,
      }, 
      {
        title: 'จำนวนชุดที่ประกาศ',
        dataIndex: 'pack',
        key: 'pack',
        className: 'align-right',
        sorter: (a, b) => a.pack - b.pack,
      },
      {
        title: 'ขอรับงาน',
        dataIndex: 'needWork',
        key: 'needWork',
        className: 'main align-right',
        sorter: (a, b) => a.needWork - b.needWork,
      },
      {
        title: 'กำลังทำอยู่',
        dataIndex: 'working',
        key: 'working',
        className: 'main align-right',
        sorter: (a, b) => a.working - b.working,
      },
      {
        title: 'เสร็จแล้ว',
        dataIndex: 'success',
        key: 'success',
        className: 'align-right',
        sorter: (a, b) => a.success - b.success,
      },
      {
        title: 'สร้างเมื่อ',
        dataIndex: 'createAt',
        key: 'createAt',
        className: 'align-right',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
        sorter: (a, b) => a.createAt - b.createAt,
      },  
    ];

    return (
      <Style>
        <Layout {...this.props}>

          <Link to="/web/addwork"><Button>เพิ่มงาน</Button></Link>

          <Table columns={columns} dataSource={itemsList}/>
          
        </Layout>
      </Style>
    );
  }
}

export default Works;

const Style = Styled.div`
  .table-items{
    margin-top: 20px;
    .item{
      width: 100%;
      height: 40px;
      background: ${AppStyle.color.card};
      line-height: 40px;
    }
    .item:hover{
      background: ${AppStyle.color.main};
    }
  }

  .align-right{
    text-align: right;
  }
  .main{
    color: ${AppStyle.color.main};
  }
`