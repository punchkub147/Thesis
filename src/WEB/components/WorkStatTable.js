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
import { secToText } from '../../functions/moment'

import Table from '../components/Table'
import Tabbar from '../components/Tabbar'
import Button from '../../components/Button'
import Loading from '../../components/Loading'

import Send from '../../img/send.png'
import Alarm from '../../img/alarm.png'

import { DatePicker, Menu, Icon, message, Popconfirm, Modal, Rate } from 'antd'

import EmployeeData from './EmployeeData';

const { RangePicker } = DatePicker
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const dateFormat = 'YYYY/MM/DD';

export default class extends Component {

  state = {
    work: _.find(store.get('works'), ['work_id', this.props.work_id]),
    needWorkList: [],
    workingList: [],
    workSuccessList: [],
    menuTable: 'needWorkList',

    modalVisible: false,
    selectEmployee: '',

    loading: true,

    selectRound: 'all',

    re: false,
  }

  async componentDidMount() {
    window.scrollTo(0, 0)

    if(this.props.work_id){
      const work_id = this.props.work_id
      await db.collection('works').doc(work_id)
      .onSnapshot(doc => {
        const work = Object.assign(doc.data(), {work_id: doc.id})
        this.setState({work})
      })
      this.setState({loading: true})

      await this.getNeedWork(work_id)
      await this.getWorking(work_id)

      this.setState({loading: false})
    }
  }

  setCountNeedWork = async (work_id) => {
    await db.collection('works').doc(work_id).update({
      needWork: this.state.needWorkList.length,
    })
  }

  getNeedWork = async (work_id) => {
    const { work } = this.state
    
    let needWorkList = []
    await db.collection('needWork').where('work_id', '==', work_id)
    .onSnapshot(async querySnapshot => {
      
      needWorkList = []
      let countNeedWork = 0
      await querySnapshot.forEach(async function(doc) {
        countNeedWork+=1
        const countDay = -moment(doc.data().startAt).diff(moment(doc.data().endAt), 'days')
        let timeCanWork = 0

        //หาเวลาที่ทำงาน
        let timeWork = 0
        let workSuccess = 0
        let workFail = 0

        needWorkList.push(Object.assign(doc.data(),{
          needWork_id: doc.id,
        }))
        const index = _.findIndex(needWorkList, ['needWork_id', doc.id])

        await db.collection('employee').doc(doc.data().employee_id).get()
        .then(se => {
          workSuccess = se.data().workSuccess?se.data().workSuccess:0
          workFail = se.data().workFail?se.data().workFail:0
          if(se.data().workTime){
            for(let i = 0; i<countDay; i++){
              const day = moment(doc.data().startAt).add(i,'days').locale('en').format('ddd').toLowerCase()
              
              if(se.data().holiday){
                const workDay = moment(doc.data().startAt).add(i,'days').format('DD/MM/YY')
                if(se.data().holiday[workDay]==true){
                }else{
                  timeWork += se.data().workTime[day]
                }
              }else{
                timeWork += se.data().workTime[day]
              }
            }
          }
        })
        needWorkList[_.findIndex(needWorkList, ['needWork_id', doc.id])] = _.assign(needWorkList[_.findIndex(needWorkList, ['needWork_id', doc.id])],{
          workSuccess,
          workFail
        })
        //console.log('timeWork',timeWork)//เวลาทำงาน-วันหยุด

        ///หาเวลาที่ยุ่งอยู่
        let timeWorkingBetween = 0 //เวลาที่ยุ่งอยู่

        await db.collection('working').where('employee_id', '==', doc.data().employee_id).get()
        .then(w => {
          w.forEach(d => {
            if(!d.data().success){
              if(d.data().startAt<doc.data().endAt && d.data().endAt>doc.data().startAt){ //งานที่คาบเกี่ยวเวลากัน
                const fp = d.data().finished_piece?d.data().finished_piece:0
                const timeWorkingAll = (+d.data().total_piece-+fp)*d.data().worktime
                const countDayWorking = -moment(d.data().startAt).diff(moment(d.data().endAt), 'days')
                const timeWorking = timeWorkingAll/countDayWorking*countDay
                timeWorkingBetween += timeWorking
              }             
            }
          })
          
        })
        //console.log('timeWorkingBetween',timeWorkingBetween, timeWork)//เวลาที่ยุ่งระหว่างงานนี้

        timeCanWork = Math.floor(timeWork-timeWorkingBetween) //เวลาที่ว่างอยู่ระหว่างวันทำงาน
        
        needWorkList[_.findIndex(needWorkList, ['needWork_id', doc.id])] = _.assign(needWorkList[_.findIndex(needWorkList, ['needWork_id', doc.id])],{
          timeCanWork,
        })
        
      });//ForEach
      needWorkList = _.orderBy(needWorkList, ['createAt'], ['desc']); //เรียงวันที่
      await this.setState({needWorkList})
      await db.collection('works').doc(work_id).update({
        needWork: countNeedWork,
      }) //อัพเดทจำนวน

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
          finished_piece: doc.data().finished_piece?doc.data().finished_piece:0,
          qualityWorking: doc.data().do_piece&&(doc.data().worktime/(_.sumBy(doc.data().do_piece, 'worktime')/_.sumBy(doc.data().do_piece, 'piece'))*100).toFixed(0)
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

  handleAddRound = (date) => {
    const { work } = this.state

    let round = work.round?work.round:[]

    if(date[0]._d > new Date){
      round.push({
        startAt: date[0]._d,
        endAt: date[1]._d,
      })
      round = _.sortBy(round, ['startAt']);

      this.updateShowRound(round, work)

    }else{
      message.info('กรุณากำหนดวันส่งหลังวันปัจจุบัน')
    }
  }
  
  handleEditRound = (date, key) => {
    const { work } = this.state

    let round = work.round
    round[key] = {
      startAt: date[0]._d,
      endAt: date[1]._d,
    }

    this.updateShowRound(round, work)
  }

  handleCancelRound = (key) => {
    const { work } = this.state

    let round = work.round
    _.pullAt(round, [key])

    this.updateShowRound(round, work)
  }

  updateShowRound = (round, work) => {
    const nextRound = round[_.findIndex(round, o => { 
      if(o.startAt < new Date && o.endAt > new Date){
        return o.startAt < new Date && o.endAt > new Date
      }else{
        return o.startAt > new Date
      }
    })]

    db.collection('works').doc(work.work_id).update({
      round,
      startAt: nextRound.startAt,
      endAt: nextRound.endAt,
    })
  }

  sendWork = async (work) => {
    if(work.startAt < new Date){
      message.info('เลยเวลาการส่งแล้ว')
      return
    }
    this.setState({loading: true})

    const { needWorkList } = this.state
    const index = _.findIndex(needWorkList, ['needWork_id', work.needWork_id]);
    _.pullAt(needWorkList, [index]);
    this.setState({
      needWorkList
    })
    await sendWork(work)

    this.setState({loading: false})
  }
  cancelWork = (work) => {
    const { needWorkList } = this.state
    const index = _.findIndex(needWorkList, ['needWork_id', work.needWork_id]);
    _.pullAt(needWorkList, [index]);
    this.setState({
      needWorkList
    })
    cancelWork(work)
  }
  selectingRound = (startAt) => {
    const { selectRound } = this.state
    this.setState({
      selectRound: selectRound==startAt?'all':startAt
    })
  }

  render() {
    const { work, selectEmployee, loading, selectRound } = this.state
    let { needWorkList, workingList, workSuccessList } = this.state

    if(selectRound != 'all'){
      needWorkList = _.filter(needWorkList, function(o) { return moment(o.startAt).format('DD/MM/YY') == moment(selectRound).format('DD/MM/YY'); })
      workingList = _.filter(workingList, function(o) { return moment(o.startAt).format('DD/MM/YY') == moment(selectRound).format('DD/MM/YY'); })
      workSuccessList = _.filter(workSuccessList, function(o) { return moment(o.startAt).format('DD/MM/YY') == moment(selectRound).format('DD/MM/YY'); })
    }

    const needWorkColumns = [
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
      // {
      //   title: `ที่อยู่ เขต/แขวง`,
      //   dataIndex: 'employee',
      //   key: 'address',
      //   render: (text, item) => 
      //     <span>{
      //       item.employee.area + " " + item.employee.district
      //     }</span>,
      // },
      {
        title: 'จำนวนที่สามารถรับได้(ชุด)',
        dataIndex: 'timeCanWork',
        key: 'timeCanWork',
        className: 'align-center',
        render: (text, item) => 
          <div title={secToText(text)}>{text &&
            text>=item.work.piece*item.work.worktime
            ?`${Math.floor(text/(item.work.piece*item.work.worktime))}`
            :`ไม่ว่างสำหรับทำงาน`}
          </div>,
        sorter: (a, b) => a.timeCanWork - b.timeCanWork,
      }, 
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
      {
        title: 'ขอเมื่อ',
        dataIndex: 'createAt',
        key: 'createAt',
        className: '',
        render: (text, item) => 
          <div>
            {moment(text).locale('en').format('DD/MM/YY')}
          </div>,
        sorter: (a, b) => a.createAt - b.createAt,
      }, 
      {
        title: 'ส่งงาน',
        key: 'send',
        render: (text, item) => 
          item.startAt > new Date
            ?<Popconfirm title="ยืนยันการส่งงาน" onConfirm={() => this.sendWork(item)}>
              <div className='btn primary' style={{background: AppStyle.color.sub}}> ส่งงาน </div>
            </Popconfirm>
            :<div className='btn primary' style={{background: AppStyle.color.gray}}> ส่งงาน </div>,
      },
      {
        title: 'เสนอรอบใหม่',
        key: 'cancel',
        render: (text, item) => (
          <Popconfirm title="ยืนยันการเสนอรอบใหม่?" onConfirm={() => this.cancelWork(item)}>
            <div className='btn'> เสนอ </div>
          </Popconfirm>
        ),
      }
    ];     

    const workingColumns = [
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
            {item.qualityWorking&& ` (${secToText(text)} ต่อชิ้น)`}
          
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
            {item.total_piece-item.finished_piece <= 0&&<span style={{color: AppStyle.color.sub, fontWeight: 'bold'}}> เสร็จครบแล้ว</span>}
            <span>{item.finished_piece?item.finished_piece:0}</span> / <span>{item.total_piece?item.total_piece:0}</span> 
          </div>,
        sorter: (a, b) => a.total_piece - b.total_piece,
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

    const workSuccessColumns = [
      // {
      //   title: 'รหัสงาน',
      //   dataIndex: 'working_id',
      //   key: 'working_id',
      //   className: '',
      //   render: (text, item) => <span>{text}</span>,
      //   sorter: (a, b) => a.working_id - b.working_id,
      // },
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
            {item.qualityWorking&& ` (${secToText(text)}ต่อชิ้น)`}
          
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
            <span>{item.finished_piece?item.finished_piece:0}</span> / <span>{item.total_piece?item.total_piece:0}</span> 
          </div>,
        sorter: (a, b) => a.total_piece - b.total_piece,
      },
      {
        title: 'สถาณะงาน',
        className: '',
        render: (text, item) => (
          <div style={{fontWeight: 'bold'}}>{
            item.success
              ?item.total_piece-item.finished_piece==0
                ?<span style={{color: AppStyle.color.sub}}>เสร็จครบ</span>
                :<span style={{color: AppStyle.color.main}}>ไม่ครบ</span>
              :item.endAt<new Date
                ?<span style={{color: AppStyle.color.main}}>กำลังส่งงาน</span>
                :'กำลังทำงาน'
          }</div>
        ),
        sorter: (a, b) => (a.total_piece-a.finished_piece) - (b.total_piece-b.finished_piece),
      },
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
        title: 'ใช้เวลา',
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

    const tabs = [
      {
        name: `คำร้องขอรับงาน$ (${work.needWork})`,
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

    const Round = (
      <div className="col-12 card" style={{clear: 'both'}}>
        {_.map(work.round, (round,key) =>
          round.endAt>=new Date&&
          <label className='round' onClick={() => this.selectingRound(round.startAt)}>
            <div className={`card ${selectRound == round.startAt&&'hilight'}`}>
              {round.startAt<=new Date&&round.endAt>=new Date
                ?<span style={{color: AppStyle.color.main, fontWeight: 'bold'}}>กำลังดำเนินอยู่</span>
                :<span style={{color: AppStyle.color.sub, fontWeight: 'bold'}}>{moment(round.startAt).fromNow()}</span>
              }<br/>
              {'ส่ง ' + moment(round.startAt).format('DD/MM/YY')}<br/>
              {'รับ ' + moment(round.endAt).format('DD/MM/YY')}

              {/*round.startAt>new Date&&
              <div className='cancel'>
                <Popconfirm title={`ยกเลิกรอบการส่งวันที่ ${moment(round.startAt).format('DD/MM/YY')}?`} onConfirm={() => this.handleCancelRound(key)}>
                  <span>ยกเลิก</span>
                </Popconfirm>
              </div>
              */}

              {/*
              <RangePicker 
                ranges={{ 'วันนี้': [moment(), moment()], 'เดือนนี้': [moment(), moment().endOf('month')] }}
                defaultValue={[moment(round.startAt, dateFormat), moment(round.endAt, dateFormat)]}
                onChange={(date) => this.handleEditRound(date, key)} />
              */}
            </div>
          </label>
        )}
        <label className='round'>
          <div className='card add'>
            <Icon type="plus-circle-o" /><br/>เพิ่มรอบ
            <RangePicker 
              ranges={{ 'วันนี้': [moment(), moment()], 'เดือนนี้': [moment(), moment().endOf('month')] }}
              defaultValue={[moment(new Date, dateFormat), moment(new Date, dateFormat)]}
              onChange={this.handleAddRound} />
          </div>
        </label>

        <div style={{clear: 'both'}}></div>
      </div>
    )


    //if(loading)return<div/>
    return (
      <Style onMouseOver={() => this.setState({re: !this.state.re})}>

          <Menu
            //onClick={(e) => this.setState({menuTable: e.key})}
            selectedKeys={'roundList'}
            mode="horizontal"
          >
            <Menu.Item key="roundList">
              <Icon type="calendar" style={{fontSize: 18}}/>{`รอบการส่งงาน`}
            </Menu.Item>
          </Menu>

          <div className='contentTab'>
          {
            //this.state.menuTable === 'roundList'&&
              Round
          }
          </div>

          <Menu
            onClick={(e) => this.setState({menuTable: e.key})}
            selectedKeys={[this.state.menuTable]}
            mode="horizontal"
            style={{marginTop: -10}}
          >
            <Menu.Item key="needWorkList">
              <Icon type="solution" style={{fontSize: 18}}/>{`คำร้องขอรับงาน (${needWorkList.length})`}
            </Menu.Item>
            <Menu.Item key="workingList">
              <Icon type="exception" style={{fontSize: 18}}/>{`งานที่มอบหมาย (${workingList.length})`}
            </Menu.Item>
            <Menu.Item key="workSuccessList">
              <Icon type="schedule" style={{fontSize: 18}}/>{`ประวัติงาน (${workSuccessList.length})`}
            </Menu.Item>
          </Menu>

          <div className='contentTab'>{
            this.state.menuTable === 'needWorkList'&&
              <Table columns={needWorkColumns} dataSource={needWorkList} />
          }{
            this.state.menuTable === 'workingList'&&
              <Table columns={workingColumns} dataSource={workingList} 
                expandedRowRender={record => 
                  <Table 
                    columns={subWorkingColumns} 
                    dataSource={record.do_piece}
                    size='small'
                  />
                }
              />
          }{
            this.state.menuTable === 'workSuccessList'&&
              <Table columns={workSuccessColumns} dataSource={workSuccessList} 
                expandedRowRender={record => 
                  <Table 
                    columns={subWorkingColumns} 
                    dataSource={record.do_piece}
                    size='small'
                  />
                }
              />
          }
          </div>

          <Modal
            style={{ top: 20 }}
            visible={this.state.modalVisible}
            onOk={() => this.setState({modalVisible: false})}
            onCancel={() => this.setState({modalVisible: false})}
            footer={false}
          >
            <EmployeeData uid={selectEmployee}/>
          </Modal>



      </Style>
    );
  }
}

const Style = Styled.div`
  .click{
    cursor: pointer;
  }

  .round{
    position: relative;
    text-align: center;
    float: left;
    width: 160px;
    height: 90px;
    padding: 5px;
    box-sizing: border-box;
    cursor: pointer;

    .card{
      background: ${AppStyle.color.card};
      height: 80px;
      line-height: 20px;
      .ant-calendar-picker{
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
      }

      .cancel{
        display: none;
        position: absolute;
        top: 10px;
        width: 100%;
        text-align: center;
        margin: -10px;
        height: 80px;
        line-height: 80px;
        background: rgba(0,0,0,0.8);
        color: ${AppStyle.color.main};
      }

    }
    .card:hover .cancel{
      display: block;
    }
    .add{
      text-align: center;
      line-height: 20px;
      padding-top: 20px;
      cursor: pointer;
      border: dashed 2px ${AppStyle.color.sub};
    }
    .hilight{
      box-sizing: border-box;
      border: solid 2px ${AppStyle.color.main};
    }
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
  .primary{
    background: ${AppStyle.color.sub};
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

  // .{
  //   text-align: right;
  // }

  // .align-center{
  //   text-align: center;
  // }

  .ant-menu{
    background: ${AppStyle.color.bg};
  }

`