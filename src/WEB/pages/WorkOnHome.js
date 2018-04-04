import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import moment from 'moment'
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'

import { secToText } from '../../functions/moment'
import { auth, db, getUser } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import { getedWork } from '../functions/work'

import Table from '../components/Table'
import { message, Popconfirm, Rate } from 'antd'

class WorkOnHome extends Component {

  state = {
    workingList: [],
    worksList: store.get('works'),
  }

  async componentDidMount() {

    await getUser('employer', user => {
      store.set('employer',user)
      this.setState({user})
    })

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
        const qualityWorking = doc.data().do_piece&&(doc.data().worktime/(_.sumBy(doc.data().do_piece, 'worktime')/_.sumBy(doc.data().do_piece, 'piece'))*100).toFixed(0)

        const data = Object.assign(doc.data(),{
          working_id: doc.id,
          finished_piece: _.sumBy(doc.data().do_piece, work => work.piece),
          qualityWorking: qualityWorking?qualityWorking:0
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
    const { workingList, worksList } = this.state

    const workingColumns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'work_name',
        key: 'work_name',
        className: 'click',
        render: (text, item) => 
          <span onClick={() => browserHistory.push(`/web/work/${item.work_id}`)}>
          <img src={_.get(_.find(worksList,(o)=>o.work_id==item.work_id),'image')} className='work_image'/>
          {' '+item.work_name}
          </span>,
        sorter: (a, b) => a.work_name - b.work_name,
      },
      {
        title: 'ผู้รับงาน',
        dataIndex: 'employee',
        key: 'employee_name',
        className: 'click',
        render: (text, item) => 
          <span onClick={() => browserHistory.push(`/web/employee/${item.employee_id}`)} style={{position: 'relative'}}>
            <img src={text.profileImage} className='employee_image'/>
            {' '+text.tname+text.fname+' '+text.lname} <span title={`ทำงานเสร็จ ${text.workSuccess} : ไม่เสร็จ ${text.workFail}`}></span>
          </span>,
        sorter: (a, b) => a.employee.fname - b.employee.fname,
      }, 
      {
        title: 'ดาว',
        dataIndex: 'employee',
        key: 'star',
        className: 'click',
        render: (text, item) => 
        <div title={`เคยทำงาน เสร็จ ${text.workSuccess} ไม่เสร็จ ${text.workFail}`}><Rate disabled defaultValue={3+Math.floor(text.workSuccess/text.workFail)} style={{color: AppStyle.color.main, fontSize: 10}}/></div>,
      },
      {
        title: 'ศักยภาพการทำงาน',
        dataIndex: 'useWorktime',
        key: 'useWorktime',
        render: (text, item) => 
          <div>{item.qualityWorking&&
            <span title={item.qualityWorking&&item.qualityWorking+'%'} style={{color: AppStyle.color.sub, fontWeight: 'bold'}}> {
              item.qualityWorking>=150?'เร็วมาก'
              :item.qualityWorking>=100?'เร็ว'
              :item.qualityWorking>=75?'ปกติ'
              :item.qualityWorking<75&&'ช้า'
            }</span>}
            <span style={{color: '#888'}}>{item.qualityWorking&& ` (${secToText(text)} ต่อชิ้น)`}</span>
          
          </div>,
        sorter: (a, b) => a.worktime - b.worktime,
      },

      {
        title: 'งานที่ทำเสร็จ / ทั้งหมด',
        dataIndex: 'total_piece',
        key: 'total_piece',
        className: '',
        render: (text, item) => 
          <div>
            {item.total_piece-item.finished_piece <= 0&&<span style={{color: AppStyle.color.sub, fontWeight: 'bold'}}> เสร็จครบแล้ว </span>}
            <span>{item.finished_piece?item.finished_piece:0}</span> / <span>{item.total_piece?item.total_piece:0}</span> 
          </div>,
        sorter: (a, b) => a.total_piece - b.total_piece,
      },
      {
        title: 'ค่าจ้าง',
        dataIndex: 'price',
        key: 'price',
        className: '',
        render: (text, item) => 
          <div>
            {item.finished_piece*item.price}
          </div>,
        sorter: (a, b) => a.finished_piece - b.finished_piece,
      }, 
      // {
      //   title: 'ทำไม่เสร็จ(ชิ้น)',
      //   key: 'fail_piece',
      //   className: '',
      //   render: (text, item) => (
      //     <div>
      //     {item.total_piece-item.finished_piece > 0
      //       ?`${item.total_piece-item.finished_piece}`
      //       :'เสร็จครบ'
      //     }
      //     </div>
      //   ),
      //   sorter: (a, b) => (a.total_piece-a.finished_piece) - (b.total_piece-b.finished_piece),
      // },
      {
        title: 'วันที่ส่ง - เสร็จ',
        dataIndex: 'startAt',
        key: 'startAt',
        className: '',
        render: (text, item) => 
          <div>
            {text&&
              moment(text).locale('en').format('DD/MM/YY')+' - '+moment(item.endAt).locale('en').format('DD/MM/YY')}
          </div>,
        sorter: (a, b) => a.startAt - b.startAt,
      }, 
      // {
      //   title: 'เริ่มงานวันที่',
      //   dataIndex: 'startAt',
      //   key: 'startAt',
      //   className: '',
      //   render: (text, item) => 
      //     <div>
      //       {text&&
      //         moment(text).locale('en').format('DD/MM/YY')}
      //     </div>,
      //   sorter: (a, b) => a.startAt - b.startAt,
      // }, 
      // {
      //   title: 'เสร็จงานวันที่',
      //   dataIndex: 'endAt',
      //   key: 'endAt',
      //   className: '',
      //   render: (text, item) => 
      //     <div>
      //       {text&&
      //         moment(text).locale('en').format('DD/MM/YY')}
      //     </div>,
      //   sorter: (a, b) => a.endAt - b.endAt,
      // },
      // {
      //   title: 'สถานะ',
      //   key: 'status',
      //   className: '',
      //   render: (text, item) => (
      //     <div>{
      //       item.success
      //         ?item.total_piece-item.finished_piece==0
      //           ?<span style={{color: AppStyle.color.sub}}>เสร็จครบ</span>
      //           :<span style={{color: AppStyle.color.main}}>ไม่ครบ</span>
      //         :item.endAt<new Date
      //           ?<span style={{color: AppStyle.color.main}}>กำลังส่งงาน</span>
      //           :'กำลังทำงาน'
      //     }</div>
      //   ),
      //   sorter: (a, b) => a.endAt - b.endAt,
      // },
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
        className: '',
        render: (text, item) => <span>{text}</span>,
        sorter: (a, b) => a.piece - b.piece,
      },
      {
        title: 'ใช้เวลาต่อชิ้น',
        dataIndex: 'worktimeOnePiece',
        key: 'worktimeOnePiece',
        className: '',
        render: (text, item) => <span>{secToText(item.worktime/item.piece)}</span>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'ใช้เวลาทั้งหมด',
        dataIndex: 'worktime',
        key: 'worktime',
        className: '',
        render: (text, item) => <span>{secToText(text)}</span>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'เวลาที่เริ่มทำ',
        dataIndex: 'startAt',
        key: 'startAt',
        className: '',
        render: (text, item) => <span>{moment(text).format('DD/MM/YY HH:mm')}</span>,
        sorter: (a, b) => a.startAt - b.startAt,
      },
      {
        title: 'เวลาที่บันทึก',
        dataIndex: 'endAt',
        key: 'endAt',
        className: '',
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
  
  .btn{
    background: ${AppStyle.color.main};
    color: ${AppStyle.color.white};
    width: 60px;
    text-align: center;
    ${AppStyle.shadow.lv1}
    padding: 5px;
    cursor: pointer;
  }
  .click{
    cursor: pointer;
  }
  .{
    text-align: right;
  }
  .align-center{
    text-align: center;
  }
  .work_image{
    width: 50px;
    height: 50px;
    margin: -7px 0;
    object-fit: cover;
  }
  .employee_image{
    width: 32px;
    height: 32px;
    margin: -7px 0;
    object-fit: cover;
    border-radius: 100%;
  }
`