import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import Config from '../../config' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import Layout from '../layouts'

import { auth, db, sendNoti } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import { sendWork, cancelWork } from '../functions/work'
import { secToText } from '../../functions/moment'

import Table from '../components/Table'
import { phoneFormatter } from '../../functions/index';

import { message, Popconfirm, Rate } from 'antd'

class NeedWork extends Component {

  state = {
    needWorkList: [],
    worksList: store.get('works'),
    loading: false,
    re: false,
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
/*
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
*/
  getNeedWork = async (user) => {
    
    let needWorkList = []
    await db.collection('needWork').where('employer_id', '==', user.uid)
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

  render() {
    const { needWorkList, worksList } = this.state

    

    const needWorkColumns = [
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
            {' '+text.tname+text.fname+' '+text.lname} <span title={`ทำงานเสร็จ ${text.workSuccess} : ไม่เสร็จ ${text.workFail}`}><Rate disabled defaultValue={3+Math.floor(text.workSuccess/text.workFail)} style={{color: AppStyle.color.main, fontSize: 10}}/></span>
          </span>,
        sorter: (a, b) => a.employee.fname - b.employee.fname,
      },  
      // {
      //   title: 'ดาว',
      //   dataIndex: 'employee',
      //   key: 'star',
      //   className: 'click',
      //   render: (text, item) => 
      //   <div title={`เคยทำงาน เสร็จ ${text.workSuccess} ไม่เสร็จ ${text.workFail}`}><Rate disabled defaultValue={2} style={{color: AppStyle.color.main, fontSize: 10}}/></div>,
      // },
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
        className: 'align-right',
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
        className: 'align-right',
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
 
    return (
      <Style onMouseOver={() => this.setState({re: !this.state.re})}>
        <Layout {...this.props}>
        {!this.state.loading&&
          <Table columns={needWorkColumns} dataSource={needWorkList}/>
        }
        </Layout>
      </Style>
    );
  }
}

export default NeedWork;

const Style = Styled.div`
  .click{
    cursor: pointer;
  }
  .align-right{
    text-align: right;
  }
  .align-center{
    text-align: center;
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

  .ant-rate-star{
    margin-right: 2px;
  }
`