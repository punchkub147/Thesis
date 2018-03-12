import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import moment from 'moment'
import _ from 'lodash'

import Layout from '../layouts'

import { secToText } from '../../functions/moment'
import { auth, db } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import { getedWork } from '../functions/work'

import Table from '../components/Table'
import { message, Popconfirm } from 'antd'

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
        //browserHistory.push('/web/login')
      }
    })
  }

  getWorking = async (user) => {
    db.collection('working').where('employer_id', '==', user.uid)
    .onSnapshot(async querySnapshot => {
      let workingList = []
      let workSuccessList = []
      await querySnapshot.forEach(function(doc) {
        const data = Object.assign(doc.data(),{
          working_id: doc.id,
          finished_piece: _.sumBy(doc.data().do_piece, work => work.piece),
          qualityWorking: doc.data().do_piece&&(doc.data().worktime/(_.sumBy(doc.data().do_piece, 'worktime')/_.sumBy(doc.data().do_piece, 'piece'))*100).toFixed(0)
        })
        !doc.data().success
          ?workingList.push(data)
          :workSuccessList.push(data)
      });
      await this.setState({workingList})
      await this.setState({workSuccessList})
      // await db.collection('works').doc(work_id).update({
      //   working: workingList.length,
      //   success: workSuccessList.length,
      // })
    })
  }


  render() {
    const { workingList } = this.state

    console.log(workingList)

    const workingColumns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'work_name',
        key: 'work_name',
        className: 'click',
        render: (text, item) => <span onClick={() => browserHistory.push(`/web/work/${item.work_id}`)}>{item.work_name}</span>,
        sorter: (a, b) => a.work_name - b.work_name,
      },
      {
        title: 'ชื่อผู้ทำงาน',
        dataIndex: 'employee',
        key: 'employee_name',
        className: 'click',
        render: (text, item) => <span onClick={() => browserHistory.push(`/web/employee/${item.employee_id}`)}>{text.tname+text.fname+' '+text.lname}</span>,
        sorter: (a, b) => a.employee.fname - b.employee.fname,
      },
      {
        title: 'เวลาทำงานต่อชิ้น',
        dataIndex: 'useWorktime',
        key: 'useWorktime',
        className: 'align-right',
        render: (text, item) => <div>{secToText(text)}</div>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'ศักยภาพการทำงาน',
        dataIndex: 'qualityWorking',
        key: 'qualityWorking',
        className: 'align-right',
        render: (text, item) => <div>{text&&text+'%'}</div>,
        sorter: (a, b) => +a.qualityWorking - +b.qualityWorking,
      },
      {
        title: 'งานทั้งหมด(ชิ้น)',
        dataIndex: 'total_piece',
        key: 'total_piece',
        className: 'align-right',
        render: (text, item) => <div>{text?text:0}</div>,
        sorter: (a, b) => a.total_piece - b.total_piece,
      },
      {
        title: 'ทำเสร็จ(ชิ้น)',
        dataIndex: 'finished_piece',
        key: 'finished_piece',
        className: 'align-right',
        render: (text, item) => <div>{text?text:0}</div>,
        sorter: (a, b) => a.finished_piece - b.finished_piece,
      },
      {
        title: 'ทำไม่เสร็จ(ชิ้น)',
        key: 'fail_piece',
        className: 'align-right',
        render: (text, item) => (
          <div>
          {item.total_piece-item.finished_piece > 0
            ?`${item.total_piece-item.finished_piece}`
            :'เสร็จครบ'
          }
          </div>
        ),
        sorter: (a, b) => (a.total_piece-a.finished_piece) - (b.total_piece-b.finished_piece),
      },
      {
        title: 'สถาณะงาน',
        key: 'status',
        className: 'align-right',
        render: (text, item) => (
          <div>{
            item.success
              ?item.total_piece-item.finished_piece==0
                ?<span style={{color: AppStyle.color.sub}}>เสร็จครบ</span>
                :<span style={{color: AppStyle.color.main}}>ไม่ครบ</span>
              :item.endAt<new Date
                ?<span style={{color: AppStyle.color.main}}>กำลังส่งงาน</span>
                :'กำลังทำงาน'
          }</div>
        ),
        sorter: (a, b) => a.endAt - b.endAt,
      },
      {
        title: 'เริ่มงานวันที่',
        dataIndex: 'startAt',
        key: 'startAt',
        className: 'align-right',
        render: (text, item) => 
          <div>
            {text&&
              moment(text).locale('en').format('DD/MM/YY')}
          </div>,
        sorter: (a, b) => a.startAt - b.startAt,
      }, 
      {
        title: 'เสร็จงานวันที่',
        dataIndex: 'endAt',
        key: 'endAt',
        className: 'align-right',
        render: (text, item) => 
          <div>
            {text&&
              moment(text).locale('en').format('DD/MM/YY')}
          </div>,
        sorter: (a, b) => a.endAt - b.endAt,
      },
      {
        title: 'รับงานคืน',
        key: 'action',
        render: (text, item) => 
          item.endAt < new Date
          ?<Popconfirm title="ยืนยันรับงาน?" onConfirm={ () => getedWork(item)}>
            <div className='btn' style={{background: AppStyle.color.sub}}> รับงาน </div>
          </Popconfirm>
          :<div className='btn' style={{background: AppStyle.color.gray}}> รับงาน </div>
        ,
        sorter: (a, b) => a.startAt - b.startAt,
      },
      // {
      //   title: 'ลบ',
      //   key: 'delete',
      //   render: (text, item) => (
      //     <Popconfirm title="ยืนยันลบ?" onConfirm={ () => db.collection('working').doc(item.working_id).delete()}>
      //       <div className='click'> ลบงาน </div>
      //     </Popconfirm>
      //   ),
      // },
    ];

    const subWorkingColumns = [
      {
        title: 'จำนวนชิ้นที่ทำ',
        dataIndex: 'piece',
        key: 'piece',
        className: 'align-right',
        render: (text, item) => <span>{text}</span>,
        sorter: (a, b) => a.piece - b.piece,
      },
      {
        title: 'ใช้เวลาต่อชิ้น',
        dataIndex: 'worktimeOnePiece',
        key: 'worktimeOnePiece',
        className: 'align-right',
        render: (text, item) => <span>{secToText(item.worktime/item.piece)}</span>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'ใช้เวลาทั้งหมด',
        dataIndex: 'worktime',
        key: 'worktime',
        className: 'align-right',
        render: (text, item) => <span>{secToText(text)}</span>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'เวลาที่เริ่มทำ',
        dataIndex: 'startAt',
        key: 'startAt',
        className: 'align-right',
        render: (text, item) => <span>{moment(text).format('DD/MM/YY HH:mm')}</span>,
        sorter: (a, b) => a.startAt - b.startAt,
      },
      {
        title: 'เวลาที่บันทึก',
        dataIndex: 'endAt',
        key: 'endAt',
        className: 'align-right',
        render: (text, item) => <span>{moment(text).format('DD/MM/YY HH:mm')}</span>,
        sorter: (a, b) => a.endAt - b.endAt,
      },

    ];

    return (
      <Style>
        <Layout {...this.props}>
          <Table columns={workingColumns} dataSource={workingList} 
            expandedRowRender={record => 
              <Table 
                columns={subWorkingColumns} 
                dataSource={record.do_piece}
                size='small'
              />
            }
          />
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
  .btn{
    background: ${AppStyle.color.main};
    color: ${AppStyle.color.white};
    width: 60px;
    text-align: center;
    ${AppStyle.shadow.lv1}
    padding: 5px;
    cursor: pointer;
  }
  .align-right{
    text-align: right;
  }
`