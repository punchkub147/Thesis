import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import enUS from 'antd-mobile/lib/locale-provider/en_US';

import { db, getUser } from '../api/firebase'
import { timeToSec } from '../functions/moment'

import Button from './Button';

import { TimePicker } from 'antd';
import { LocaleProvider, Picker } from 'antd-mobile';

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

class FormWorkTime extends Component {

  state = {
    workTime: {
      // sun: secToMoment(0),
      // mon: secToMoment(0),
      // tue: secToMoment(0),
      // wed: secToMoment(0),
      // thu: secToMoment(0),
      // fri: secToMoment(0),
      // sat: secToMoment(0),
    },
    open: false,
    value: ['00','00']
  }

  async componentDidMount() {
    const user = store.get('employee')
    this.setState({
      user,
    })
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
      
      store.set('employee',user)
    })
  }

  handleUpdateWorkTime = async () => {
    const { workTime, user } = this.state
    db.collection('employee').doc(user.uid).update({
      workTime
    })
    await store.set('employee',{
      uid: user.uid,
      data: {
        ...user.data,
        workTime
      }
    })
    //alert('อัพเดทวันทำงานเรียบร้อย')
    browserHistory.push(this.props.push)
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

  render() {   
    const {workTime} = this.state
    
    return (
      <Style>
          <div className="row justify-content-center text">
            <div className="col-4">
              วันที่ทำงาน
            </div>
            <div className="col-4">
              ชั่วโมงทำงาน
            </div>
          </div>
          <div>

          {_.map(workTime, (date, day) =>
            <div className="row justify-content-center datetime" 
              onClick={() => this.handleOpenWheel(day,date)}>
            
              <div className="col-4 day input">
                {day}
              </div>
              <div className="col-4 input">
                {/*

                <TimePicker minuteStep={15} secondStep={10}
                  defaultValue={moment(secToMoment(date), format)}
                  format={format}
                  onChange={(time) => this.handleTime(time,day)}
                  // addon={() => (
                  //   <Button size="small" type="primary" >
                  //     Ok
                  //   </Button>
                  // )}
                />

                */}
                {
                  moment().startOf('day').second(date).format(format)
                  //[['00'],['00']]
                }
              </div>
            </div>
          )}
          </div>


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


          <Button onClick={this.handleUpdateWorkTime}>ยืนยัน</Button>
      </Style>
    );
  }
}

export default FormWorkTime;

const Style = Styled.div`
  padding-top: 20px;
  text-align: center;
  .text{
    margin: 0 0 20px 0;
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
    border-bottom: solid 2px ${AppStyle.color.sub};
    ${AppStyle.font.read2}

  }
  .day{
    ${AppStyle.font.read2}
  }

`
