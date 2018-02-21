import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import jsonHoliday from '../config/holiday'
import enUS from 'antd-mobile/lib/locale-provider/en_US';

import { db, getUser } from '../api/firebase'
import { timeToSec } from '../functions/moment'

import Button from './Button';
import Modal from './Modal'

import { TimePicker } from 'antd';
import { LocaleProvider, Picker } from 'antd-mobile';

import Loading from './Loading'

let hour = -1
const hours = _.times(24, () => {
  hour++
  const value = `${hour<10?'0':''}${hour}`
  return {
    label: value, 
    value: value,
  }
});

const data = [
  hours,
  [
    {
      label: '00',
      value: '00',
    },
    {
      label: '15',
      value: '15',
    },
    {
      label: '30',
      value: '30',
    },
    {
      label: '45',
      value: '45',
    },
  ],
];

const format = 'HH:mm'

const secToMoment = (sec) => {
  if(!sec)sec=0
  const time = moment().startOf('day').second(sec).format(format)
  return moment(time, format)
}

const setDayHilight = (day, time) => {
  
  if(day === moment().locale('en').format('ddd').toLowerCase())return 'today'
  
  if(time>0) return 'workday'

  return ''
}

class FormWorkTime extends Component {

  state = {
    workTime: {
      sun: 0,
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 0,
    },
    holiday: {},
    open: false,
    value: ['00','00'],
    loading: false,
  }

  async componentDidMount() {
    const user = store.get('employee')
    this.setState({
      user,
      workTime: user.data.workTime,
      holiday: user.data.holiday
    })

    this.setState({loading: true})
    getUser('employee', user => {
      if(user.data.workTime){
        const { sun, mon, tue, wed, thu, fri, sat } = user.data.workTime
        this.setState({
          user,
          workTime: {
            sun,
            mon,
            tue,
            wed,
            thu,
            fri,
            sat,
          }
        })
      }else{
        this.setState({
          user,
          workTime: {
            sun: 0,
            mon: 0,
            tue: 0,
            wed: 0,
            thu: 0,
            fri: 0,
            sat: 0,
          }
        })
      }
      this.setState({loading: false})

      store.set('employee',user)
    })

  }

  handleUpdateWorkTime = async () => {
    const { workTime, user, holiday } = this.state

    const update = _.pickBy({
      workTime,
      holiday
    }, _.identity)

    db.collection('employee').doc(user.uid).update(update)
    await store.set('employee',{
      uid: user.uid,
      data: {
        ...user.data,
        workTime,
        holiday
      }
    })
    //alert('อัพเดทวันทำงานเรียบร้อย')
    this.props.push
      ?browserHistory.push(this.props.push)  
      :browserHistory.goBack()
  }

  handleTime = (time,day) => {
    this.setState({
      workTime: {
        ...this.state.workTime,
        [day]: timeToSec(time)
      }
    })
  }

  onWheelChange = (value) => {
    if(value){
      const hour = value[0]*60*60
      const min = +value[1]*60
      const sec = hour+min
      this.setState({
        workTime: {
          ...this.state.workTime,
          [this.state.day]: +sec
        }
      })
      
    }
  }

  handleOpenWheel = (day, value) => {
    const time = [
        moment().startOf('day').second(value).format(format).split(":")[0],
        moment().startOf('day').second(value).format(format).split(":")[1]
      ]
    this.setState({
      visible: true,
      value: time,
      day: day,
    })
  }

  handleSelectHoliday = (date) => {
    let { holiday } = this.state

    holiday[date] = !holiday[date]

    this.setState({
      holiday,
    })
  }

  handleSelectAllHoliday = () => {
    let { holiday } = this.state

    console.log(holiday)
    _.map(jsonHoliday, day => {
      holiday = {
        ...holiday,
        [day.date]: true
      }
      //holiday[day.date] = true
    })

    this.setState({
      holiday,
    })
  }

  render() {   
    const { workTime, holiday } = this.state

    return (
      <Loading loading={this.state.loading}>  
        <Style>
          
            <div className="row justify-content-center text">
              <div className="" style={{marginRight: 45, marginLeft: -28}}>
                วันที่ทำงาน
              </div>
              <div className="">
                ชั่วโมงทำงาน
              </div>
            </div>

            <div>
            {_.map(workTime, (time, day) =>
              <div className="row justify-content-center datetime" 
                onClick={() => this.handleOpenWheel(day,time)}>
                <div className={`day ${setDayHilight(day, time)}`}>
                  {
                    day==='sun'?'อา.'
                    :day==='mon'?'จ.'
                    :day==='tue'?'อ.'
                    :day==='wed'?'พ.'
                    :day==='thu'?'พฤ.'
                    :day==='fri'?'ศ.'
                    :day==='sat'&&'ส.'
                  }
                </div>
                <div className="input time">
                  {moment().startOf('day').second(time).format('HH : mm')}
                </div>
              </div>
            )}
            </div>

            <div className='btn-holiday'
              onClick={() => this.setState({modalIsOpen: true})}
            >
              ตารางวันหยุด
            </div>
            <Modal modalIsOpen={this.state.modalIsOpen}>
              <InsideModal>
                <div onClick={this.handleSelectAllHoliday} 
                  className='selectAllHoliday'>หยุดทั้งหมด</div>
                {_.map(jsonHoliday, day => 
                  moment(day.date,'DD/MM/YY')>new Date&&
                  <div className='holiday' onClick={() => this.handleSelectHoliday(day.date)}>
                    <div className='date'>{day.date} {day.name}</div>
                    <div className='right'>
                      {holiday!==undefined
                        &&holiday[day.date]
                          ?<span className='stop'>หยุด</span>
                          :<span className='work'>ทำงาน</span>
                      }
                    </div>
                  </div>
                )}
                <Button className='button' onClick={() => this.setState({modalIsOpen: false})}>ปิด</Button>
              </InsideModal>
            </Modal>

            <LocaleProvider locale={enUS}>
              <Picker
                visible={this.state.visible}
                onChange={this.onWheelChange}
                value={this.state.value}
                data={data}
                cascade={false}
                onOk={() => this.setState({ visible: false })}
                onDismiss={() => this.setState({ visible: false })}
              />
            </LocaleProvider>

            <Button className='btn-fall' onClick={this.handleUpdateWorkTime}>ยืนยัน</Button>
          
        </Style>
      </Loading>
    );
  }
}

export default FormWorkTime;

const Style = Styled.div`
  position: relative;
  padding: 10px 0;
  text-align: center;
  .text{
    margin: 0 0 10px 0;
    ${AppStyle.font.read1}
  }
  .datetime{
    margin: 0px 0 10px 0;
    ${AppStyle.font.read1}
  }
  .input{
    width: 100px;
    height: 40px;
    line-height: 40px;
    border: none;
    border-radius: 0;
    text-align: center;
    background: ${AppStyle.color.card};
    border-bottom: solid 5px ${AppStyle.color.border};
    ${AppStyle.font.read2}
  }
  .time{
    font-size: 24px;
  }
  .day{
    ${AppStyle.font.read2}
    width: 40px;
    height: 40px;
    line-height: 40px;
    margin-right: 40px;
  }
  .today{
    background: ${AppStyle.color.main};
    color: ${AppStyle.color.white};
    ${AppStyle.shadow.lv2}
  }
  .workday{
    background: ${AppStyle.color.sub};
    color: ${AppStyle.color.white};
    ${AppStyle.shadow.lv2}
  }

  .btn-holiday{
    width: 140px;
    margin: 20px auto;
    color: ${AppStyle.color.sub};
    height: 30px;
    line-height: 30px;
    font-weight: bold;
    ${AppStyle.shadow.lv1}
  }
  .btn-fall{
    position: relative;
    //top: 20px;
  }
`

const InsideModal = Styled.div`
  height: calc(100% - 60px);
  overflow: scroll;
  .animate{
    animation-name:fadeInUp;
    animation-duration: 0.3s;
  }
  .button{
    position: fixed;
    bottom: 60px;
  }

  .selectAllHoliday{
    text-align: right;
  }
  .holiday{
    height: 40px;
    line-height: 40px;
    border-bottom: solid 1px #ccc;
    
    .date{
      float: left;
      width: 198px;
      overflow: hidden; 
      white-space: nowrap; 
      text-overflow:ellipsis;
      font-weight: bold;
    }
    .right{
      text-align: center;
      width: 60px;
      float: right;
      .stop{
        color: ${AppStyle.color.red};
        font-weight: bold;
      } 
      .work{
        color: ${AppStyle.color.green};
        font-weight: bold;
      }
    }
  }

`