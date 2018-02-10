import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import { phoneFormatter } from '../../functions/index';

import Layout from '../layouts'

import { auth, db } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import { sendWork, cancelWork, getedWork } from '../functions/work'

import Table from '../components/Table'
import Tabbar from '../components/Tabbar'

export default class extends Component {

  state = {
    work: _.find(store.get('works'), ['work_id', this.props.params.id]),
    needWorkList: [],
    workingList: [],
    workSuccessList: [],
  }

  async componentDidMount() {
    if(this.props.params.id){
      const work_id = this.props.params.id
      await db.collection('works').doc(work_id)
      .onSnapshot(doc => {
        const work = Object.assign(doc.data(), {work_id: doc.id})
        this.setState({work})
      })

      await this.getNeedWork(work_id)
      await this.getWorking(work_id)
    }
  }

  getNeedWork = async (work_id) => {
    db.collection('needWork').where('work_id', '==', work_id)
    .onSnapshot(async querySnapshot => {
      let needWorkList = []
      await querySnapshot.forEach(function(doc) {
        needWorkList.push(Object.assign(doc.data(),{needWork_id: doc.id}))
      });

      needWorkList = _.orderBy(needWorkList, ['createAt'], ['desc']); //เรียงวันที่

      await this.setState({needWorkList})
      await db.collection('works').doc(work_id).update({
        needWork: needWorkList.length,
      })
    })
  }

  getWorking = async (work_id) => {
    db.collection('working').where('work_id', '==', work_id)
    .onSnapshot(async querySnapshot => {
      let workingList = []
      let workSuccessList = []
      await querySnapshot.forEach(function(doc) {
        const data = Object.assign(doc.data(),{
          working_id: doc.id,
          finished_piece: doc.data().finished_piece?doc.data().finished_piece:0
        })
        !doc.data().success
          ?workingList.push(data)
          :workSuccessList.push(data)
      });
      await this.setState({workingList})
      await this.setState({workSuccessList})
      await db.collection('works').doc(work_id).update({
        working: workingList.length,
        success: workSuccessList.length,
      })
    })
  }

  render() {
    const { work, needWorkList, workingList, workSuccessList } = this.state

    const needWorkColumns = [
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
        className: 'align-right',
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

    const workingColumns = [
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
        render: (text, item) => <div>{text>=60?`~ ${text/60} นาที`:`${text} วินาที`}</div>,
      },
      {
        title: 'ทำงานได้',
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
          {item.total_piece-item.finished_piece > 0
            ?<div>เหลือ {item.total_piece-item.finished_piece} ชิ้น</div>
            :<div className='click' onClick={ () => getedWork(item)}> รับงาน </div>
          }
          </span>
        ),
      }
    ];

    const workSuccessColumns = [
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
        render: (text, item) => <div>{text>=60?`~ ${text/60} นาที`:`${text} วินาที`}</div>,
      },
      {
        title: 'ทำงานได้',
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
        title: 'สำเร็จ',
        className: 'align-right',
        render: (text, item) => (
          <div>
          {item.total_piece-item.finished_piece > 0
            ?`เหลือ ${item.total_piece-item.finished_piece} ชิ้น`
            :'เสร็จครบ'
          }
          </div>
        ),
      },
    ];

    const tabs = [
      {
        name: `คำร้องขอรับงาน (${needWorkList.length})`,
        render: 
          <div className='contentTab'>
            <Table columns={needWorkColumns} dataSource={needWorkList} />
          </div>,
      },
      {
        name: `งานที่มอบหมาย (${workingList.length})`,
        render: 
          <div className='contentTab'>
            <Table columns={workingColumns} dataSource={workingList} />
          </div>,
      },
      {
        name: `งานที่สำเร็จแล้ว (${workSuccessList.length})`,
        render: 
          <div className='contentTab'>
            <Table columns={workSuccessColumns} dataSource={workSuccessList} />
          </div>,
      },
    ]


    return (
      <Style>
        <Layout {...this.props}>
          <div className='data'>
            <div className='image'>
              <img src={work.image}/>
            </div>
            <div className='right'>
              <div className='name'>{work.name}</div>
              <div className='price'>{`${work.piece}ชิ้น : ${work.price*work.piece}บาท`}</div>
              <div className='detail'>{work.detail}</div>

              <Link to={`/web/editwork/${work.work_id}`}> แก้ไข </Link>
            </div>
          </div>

          <Tabbar tabs={tabs} style={{clear: 'both'}}/>

        </Layout>
      </Style>
    );
  }
}

const Style = Styled.div`
 .data{
  .image{
    width: 260px;
    height: 260px;
    float: left;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .right{
    float: left;
    margin-left: 10px;
    .name{

    }
    .price{

    }
    .detail{

    }
  }
 }

 .contentTab{
   background: ${AppStyle.color.bg};
   ${AppStyle.shadow.lv1}
   //padding: 10px;
 }


 .click{
    cursor: pointer;
    ${AppStyle.font.hilight}
  }
  .align-right{
    text-align: right;
  }
`