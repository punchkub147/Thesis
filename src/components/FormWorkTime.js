import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import { db, getUser } from '../api/firebase'
import { timeToSec } from '../functions/moment'

import Button from './Button';

import { TimePicker } from 'antd';

import Scroll from './Scroll'

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
    }
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

    this.setWheel()
  }

  setWheel = () => {
    
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

  render() {   
    const {workTime} = this.state

    return (
      <Style>
        <div id="FormWorkTime">
          <div className="row justify-content-center text">
            <div className="col-4">
              วันที่ทำงาน
            </div>
            <div className="col-6">
              ชั่วโมงทำงาน
            </div>
          </div>
          <div>

          <Scroll/>


          {_.map(workTime, (date, day) =>
            <div className="row justify-content-center datetime">
              <div className="col-4">
                {day}
              </div>
              <div className="col-6">
                <TimePicker minuteStep={15} secondStep={10}
                  defaultValue={moment(secToMoment(date), format)}
                  format={format}
                  onChange={(time) => this.handleTime(time,day)}
                  // addon={() => (
                  //   <Button size="small" type="primary" onClick={this.handleClose}>
                  //     Ok
                  //   </Button>
                  // )}
                />
              </div>
            </div>
          )}
            
          </div>
          <Button onClick={this.handleUpdateWorkTime}>ยืนยัน</Button>
        </div>
      </Style>
    );
  }
}

export default FormWorkTime;


const Style = Styled.div`
  #FormWorkTime{
    padding-top: 20px;
    text-align: center;
    .text{
      margin: 0 0 20px 0;
    }
    .datetime{
      margin: 0px 0 10px 0;
    }
    input{
      width: 100px;
      height: 40px;
      border: none;
      border-radius: 0;
      text-align: center;
      background: ${AppStyle.color.card};
      border-bottom: solid 2px ${AppStyle.color.sub};
    }
  }
`
