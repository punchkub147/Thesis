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

import Send from '../../img/send.png'
import Alarm from '../../img/alarm.png'

import { DatePicker, Menu, Icon, message, Popconfirm, Modal } from 'antd'

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
    menuTable: 'roundList',

    modalVisible: false,
    selectEmployee: '',

    loading: true
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
    .get().then(async querySnapshot => {
      this.setState({loading: true})
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
                  console.log('วันหยุด')
                }else{
                  timeWork += se.data().workTime[day]
                }
              }else{
                timeWork += se.data().workTime[day]
              }
            }
          }
        })
        needWorkList[index] = _.assign(needWorkList[index],{
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
        //console.log('timeWorkingBetween',timeWorkingBetween)//เวลาที่ยุ่งระหว่างงานนี้

        timeCanWork = Math.floor(timeWork-timeWorkingBetween) //เวลาที่ว่างอยู่ระหว่างวันทำงาน
        
        needWorkList[index] = _.assign(needWorkList[index],{
          timeCanWork,
        })
        console.log('งาน',needWorkList[index])
        
      });//ForEach
      this.setState({loading: false})
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

  handleAddRound = (date) => {
    console.log('addRound',date)
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
    console.log('addRound',date)
    const { work } = this.state

    let round = work.round
    round[key] = {
      startAt: date[0]._d,
      endAt: date[1]._d,
    }

    this.updateShowRound(round, work)
  }

  handleCancelRound = (key) => {
    console.log('cancel', key)
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

  sendWork = (work) => {
    const { needWorkList } = this.state
    const index = _.findIndex(needWorkList, ['needWork_id', work.needWork_id]);
    _.pullAt(needWorkList, [index]);
    this.setState({
      needWorkList
    })
    sendWork(work)
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

  render() {
    const { work, needWorkList, workingList, workSuccessList, selectEmployee, loading } = this.state

    const needWorkColumns = [
      {
        title: 'รหัสผู้รับงาน',
        dataIndex: 'employee_id',
        key: 'employee_id',
        className: 'click',
        render: (text, item) => <span onClick={() => this.setState({selectEmployee: item.employee_id,modalVisible: true})}>{text}</span>,
      },  
      {
        title: 'ทำงานสำเร็จ',
        dataIndex: 'workSuccess',
        key: 'workSuccess',
        className: 'align-right',
      }, 
      {
        title: 'ทำงานไม่สำเร็จ',
        dataIndex: 'workFail',
        key: 'workFail',
        className: 'align-right',
      }, 
      {
        title: 'เวลาว่างทำงาน',
        dataIndex: 'timeCanWork',
        key: 'timeCanWork',
        render: (text, item) => <div>{text>=work.piece*work.worktime?text:'เวลาทำงานไม่พอ'}</div>,
      }, 
      {
        title: 'รอบวันที่',
        dataIndex: 'startAt',
        key: 'startAt',
        className: 'align-right',
        render: (text, item) => 
          <div>
            {text&&
              moment(text).locale('en').format('DD/MM/YY HH:mm')}
          </div>,
      }, 
      {
        title: 'ส่งงาน',
        key: 'send',
        render: (text, item) => (
          <div>{
            new Date > item.startAt
            ?'เลยเวลาส่งแล้ว'
            :<Popconfirm title="ยืนยันการส่งงาน" onConfirm={() => this.sendWork(item)}>
              <div className='click' > ส่งงาน </div>
            </Popconfirm>
          }</div>
        )
      },
      {
        title: 'ปฏิเสธ',
        key: 'cancel',
        render: (text, item) => (
          <Popconfirm title="ยืนยันการปฏิเสธ?" onConfirm={() => this.cancelWork(item)}>
            <div className='click'> ปฏิเสธ </div>
          </Popconfirm>
        ),
      }
    ];

    const workingColumns = [
      {
        title: 'รหัสผู้ทำงาน',
        dataIndex: 'employee_id',
        key: 'employee_id',
        className: 'click',
        render: (text, item) => <span onClick={() => this.setState({selectEmployee: item.employee_id,modalVisible: true})}>{text}</span>,
      },
      {
        title: 'เวลาทำงานต่อชิ้น',
        dataIndex: 'worktime',
        key: 'worktime',
        className: 'align-right',
        render: (text, item) => <div>{text>=60?`~ ${Math.floor(text/60)} นาที`:`${text} วินาที`}</div>,
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
          item.endAt < new Date
          ?<Popconfirm title="ยืนยันรับงาน?" onConfirm={ () => getedWork(item)}>
              <div className='click'> รับงาน </div>
            </Popconfirm>
          :<div> กำลังทำ... </div>
        ),
      },
    ];

    const workSuccessColumns = [
      {
        title: 'รหัสผู้ทำงาน',
        dataIndex: 'employee_id',
        key: 'employee_id',
        className: 'click',
        render: (text, item) => <span onClick={() => this.setState({selectEmployee: item.employee_id,modalVisible: true})}>{text}</span>,
      },
      {
        title: 'เวลาทำงานต่อชิ้น',
        dataIndex: 'worktime',
        key: 'worktime',
        className: 'align-right',
        render: (text, item) => <div>{secToText(text)}</div>,
      },
      {
        title: 'ชิ้นงานทั้งหมด',
        dataIndex: 'total_piece',
        key: 'total_piece',
        className: 'align-right',
        render: (text, item) => <div>{text?text:0} ชิ้น</div>,
      },
      {
        title: 'ทำงานได้',
        dataIndex: 'finished_piece',
        key: 'finished_piece',
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
          <label className='round'>
            <div className={`card ${round.startAt<=new Date&&round.endAt>=new Date&&'hilight'}`}>
              {round.startAt<=new Date&&round.endAt>=new Date
                ?<span style={{color: AppStyle.color.main, fontWeight: 'bold'}}>กำลังดำเนินอยู่</span>
                :<span style={{color: AppStyle.color.sub, fontWeight: 'bold'}}>{moment(round.startAt).fromNow()}</span>
              }<br/>
              {'ส่ง ' + moment(round.startAt).format('DD/MM/YY')}<br/>
              {'รับ ' + moment(round.endAt).format('DD/MM/YY')}

              {round.startAt>new Date&&
              <div className='cancel'>
                <Popconfirm title={`ยกเลิกรอบการส่งวันที่ ${moment(round.startAt).format('DD/MM/YY')}?`} onConfirm={() => this.handleCancelRound(key)}>
                  <span>ยกเลิก</span>
                </Popconfirm>
              </div>
              }
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


    if(loading)return<div/>
    return (
      <Style>

          <Menu
            onClick={(e) => this.setState({menuTable: e.key})}
            selectedKeys={[this.state.menuTable]}
            mode="horizontal"
          >
            <Menu.Item key="roundList">
              <Icon type="calendar" style={{fontSize: 18}}/>{`รอบการส่งงาน`}
            </Menu.Item>
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

          <div className='contentTab'>
          {
            this.state.menuTable === 'roundList'&&
              Round
          }{
            this.state.menuTable === 'needWorkList'&&
              <Table columns={needWorkColumns} dataSource={needWorkList} />
          }{
            this.state.menuTable === 'workingList'&&
              <Table columns={workingColumns} dataSource={workingList} />
          }{
            this.state.menuTable === 'workSuccessList'&&
              <Table columns={workSuccessColumns} dataSource={workSuccessList} />
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
    ${AppStyle.font.hilight}
  }

  .round{
    position: relative;
    text-align: center;
    float: left;
    width: 16.66%;
    height: 90px;
    padding: 5px;
    box-sizing: border-box;
    

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
      border: solid 2px ${AppStyle.color.main};
    }
  }

  .ant-menu{
    background: ${AppStyle.color.bg};
  }
`