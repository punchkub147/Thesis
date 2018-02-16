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
import Button from '../../components/Button'

import Send from '../../img/send.png'
import Alarm from '../../img/alarm.png'

import { DatePicker, Menu, Icon, message, Popconfirm } from 'antd'

const { RangePicker } = DatePicker
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const dateFormat = 'YYYY/MM/DD';

export default class extends Component {

  state = {
    work: _.find(store.get('works'), ['work_id', this.props.params.id]),
    needWorkList: [],
    workingList: [],
    workSuccessList: [],
    menuTable: 'roundList'
  }

  async componentDidMount() {
    window.scrollTo(0, 0)

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

      const nextRound = round[_.findIndex(round, function(o) { return o.startAt > new Date })]

      db.collection('works').doc(work.work_id).update({
        round,
        startAt: nextRound.startAt,
        endAt: nextRound.endAt,
      })
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

    const nextRound = round[_.findIndex(round, function(o) { return o.startAt > new Date })]

    db.collection('works').doc(work.work_id).update({
      round,
      startAt: nextRound.startAt,
      endAt: nextRound.endAt,
    })
  }

  handleCancelRound = (key) => {
    console.log('cancel', key)
    const { work } = this.state

    let round = work.round
    _.pullAt(round, [key])

    const nextRound = round[_.findIndex(round, function(o) { return o.startAt > new Date })]

    db.collection('works').doc(work.work_id).update({
      round,
      startAt: nextRound.startAt,
      endAt: nextRound.endAt,
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
          <span>
          {item.total_piece-item.finished_piece > 0
            //?<div>เหลือ {item.total_piece-item.finished_piece} ชิ้น</div>
            &&<div className='click' onClick={ () => getedWork(item)}> รับงาน </div>
          }
          </span>
        ),
      },
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


    return (
      <Style>
        <Layout {...this.props}>

        <div className=''>

          <div className='row'>
            <div className='col-sm-12 col-md-4'>
              <div className='image'>
                <img src={work.image}/>
              </div>
            </div>
            <div className='col-sm-12 col-md-8'>
              <div className='card'>
                <Link to={`/web/editwork/${work.work_id}`}>
                  <div className='edit'> แก้ไข </div>
                </Link>
                <div className='name'>{work.name}</div>
                <div className='detail'>{work.detail}</div>
              </div>

              <div className='card'>
                <div className="pack">
                  ค่ามัดจำ {work.cost} บาท
                </div>
                <div className="price">
                  {work.piece} ชิ้น {work.price*work.piece} บาท
                </div>
                <div className="cost">
                  เหลือ {work.pack} ชุด
                </div>
                
                <div style={{clear: 'both'}}></div>
              </div>

              <div className="card">
                <div className="sendBy">
                  <Icon type="car" style={{fontSize: 24}}/><br/>
                  {work.sendBy}
                </div>
                <div className="startAt">
                  <div className='text'>เริ่มส่ง</div>
                  {moment(work.startAt).format('DD/MM/YY')}
                </div>
                <div className="endAt">
                  <div className='text'>ส่งกลับ</div>
                  {moment(work.endAt).format('DD/MM/YY')}
                </div>
                <div className="workTime">
                  <Icon type="clock-circle-o" style={{fontSize: 24}}/><br/>
                  {(work.worktime>=60)
                    ?'~ ' + work.worktime/60 + ' นาที'
                    :work.worktime + ' วินาที'
                  }
                </div>
                <div style={{clear: 'both'}}></div>
              </div>
            
            </div>
          </div>

          {/*
          <Tabbar tabs={tabs} style={{clear: 'both'}}/>
          */}

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
              <Icon type="schedule" style={{fontSize: 18}}/>{`งานที่สำเร็จแล้ว (${workSuccessList.length})`}
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

        </div>
        </Layout>
      </Style>
    );
  }
}

const Style = Styled.div`
  .image{
    width: 260px;
    height: 260px;
    float: left;
    margin-bottom: 10px;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }


  .name{
    ${AppStyle.font.main}
  }
  .price{
    ${AppStyle.font.hilight}
  }
  .detail{
    ${AppStyle.font.read2}
  }

  .edit{
    position: absolute; 
    right: 10px;
    top: 10px;
  }

 .contentTab{
   //${AppStyle.shadow.lv1}
 }


  .click{
    cursor: pointer;
    ${AppStyle.font.hilight}
  }
  .align-right{
    text-align: right;
  }

  .card{
    width: 100%;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
    padding: 10px;
    margin-bottom: 10px;
    position: relative;
  }
  .sendBy{
    width: 25%;
    float: left;
    text-align: center;
  }
  .startAt{
    width: 25%;
    float: left;
    text-align: center;
  }
  .endAt{
    width: 25%;
    float: left;
    text-align: center;
  }
  .workTime{
    width: 25%;
    float: left;
    text-align: center;
  }
  .price{
    float: left;
    width: 33.33%;
    text-align: center;
  }
  .cost{
    float: left;
    width: 33.33%;
    text-align: center;
  }
  .pack{
    float: left;
    width: 33.33%;
    text-align: center;
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