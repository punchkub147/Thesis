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
    await auth.onAuthStateChanged(user => {
      if(user){
        this.setState({user})
        this.getItems(user)
      }else{
        browserHistory.push('/web/login')
      }
    })
  }

  getItems = (user) => {
    db.collection('works').where('employer_id', '==', user.uid).get()
    .then(async querySnapshot => {
      let itemsList = []
      await querySnapshot.forEach(function(doc) {
        itemsList.push(Object.assign(doc.data(),{work_id: doc.id}))
      });
      itemsList = _.orderBy(itemsList, ['createAt'], ['desc']); //เรียงวันที่
      await this.setState({itemsList})
    })
    .catch(function(error) {
      console.log("Error getting documents: ", error);
    });
  }

  render() {
    const { itemsList } = this.state

    const columns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'name',
        key: 'name',
        className: 'name',
        render: (text, item) => <Link to={`/web/editwork/${item.work_id}`}>{text}</Link>,
      }, 
      {
        title: 'ราคา',
        dataIndex: 'price',
        key: 'price',
        className: 'align-right',
      }, 
      {
        title: 'จำนวนชุดที่ประกาศ',
        dataIndex: 'pack',
        key: 'pack',
        className: 'align-right',
      },
      {
        title: 'กำลังทำอยู่',
        dataIndex: 'working',
        key: 'working',
        className: 'align-right',
      },
      {
        title: 'เสร็จแล้ว',
        dataIndex: 'success',
        key: 'success',
        className: 'align-right',
      },
      {
        title: 'สร้างเมื่อ',
        dataIndex: 'createAt',
        key: 'createAt',
        className: 'align-right',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
      },  
      {
        title: 'แก้ไข',
        key: 'action',
        render: (text, item) => (
          <span>
            <Link to={`/web/editwork/${item.work_id}`}> แก้ไข </Link>
          </span>
        ),
      }
    ];

    return (
      <Style>
        <Layout {...this.props}>
          <Link to="/web/addwork"><Button>เพิ่มงาน</Button></Link>
          {/*
          <div className="table-items">
            <div className="row">
              <div className="col-4">
                ชื่อ
              </div>
              <div className="col-2">
                ราคา
              </div>
              <div className="col-2">
                จำนวนชุดที่เหลือ
              </div>
              <div className="col-2">
                แก้ไข
              </div>
            </div>
            {_.map(itemsList, item => 
              <div className="item">
                <div className="row">
                  <div className="col-4">
                    {item.name}
                  </div>
                  <div className="col-2">
                    {item.price}
                  </div>
                  <div className="col-2">
                    {item.pack}
                  </div>
                  <div className="col-2">
                    <Link to={`/web/editwork/${item.work_id}`}> แก้ไข </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          */}
          <Table columns={columns} dataSource={itemsList} />
          
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
`