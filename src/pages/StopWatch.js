import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import { db } from '../api/firebase'
import ToolBar from '../layouts/ToolBar';
import Content from '../components/Content';
import Card from '../components/Card';

import alarm from '../img/alarm.png'
import Bg from '../components/Bg';
import { setInterval } from 'timers';

export default class extends Component {

  state = {
    working: {},
    time: 0,
    timing: false,
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    const working_id = this.props.routeParams.id

    db.collection('working').doc(working_id)
    .onSnapshot(data => {
      this.setState({
        working: Object.assign(data.data(),{working_id: data.id})
      })
    })

    
  }

  componentWillUnmount(){
    clearInterval(this.state.intervalId)
    this.setState({intervalId: undefined});
  }

  handleTiming = () => {
    let { time, timing } = this.state
    if(!timing){
      const intervalId = setInterval(() => 
        this.setState({
          time: time+=1
        })
      , 1000);
      this.setState({
        intervalId: intervalId,
        timing: true,
      });
    }else{
      clearInterval(this.state.intervalId);
      this.setState({
        intervalId: undefined,
        timing: false,
      });
    }
    
  }

  interval = () => {
    let {time} = this.state
    this.setState({
      time: time+=1
    })
  }

  render() {
   
      const { working, timing, time, intervalId } = this.state
      
      console.log(intervalId)

    return (
      <Bg>
        <Style>
          <ToolBar 
            title='จับเวลา'
            left={() => browserHistory.goBack()} 
            //right={this.handleUpdateAbilities}
          />

          <Card>
            <Content>
              <div className="row justify-content-center">
                <div className="col-8">

                  <div className='name'>{working.work_name}</div>
                  <div className='worktime'>เวลาเดิมประมาณ {working.worktime/60} นาที</div>
                  <div className="clock">
                    <img alt='' src={alarm}/>
                  </div>
                  <div className='time'>
                    {time}
                  </div>

                  <div className={`btn ${timing?'stop':'start'}`} onClick={this.handleTiming}>
                    {timing?'หยุด':'เริ่ม'}
                  </div>
                </div>
              </div>        
            </Content>
          </Card>
        </Style>
      </Bg>
    );
  }
}

const Style = Styled.div`
  .clock{
    text-align: center;
    width: 100px;
    margin: 0 auto;
    img{
      width: 100%;
    }
  }
  .name{
    ${AppStyle.font.main}
    text-align: center;
  }
  .worktime{
    ${AppStyle.font.read1}
    text-align: center;
  }
  .time{
    ${AppStyle.font.read1}
    font-size: 72px;
    text-align: center;
  }
  .btn{
    position: relative;
    width: 75px;
    height: 75px;
    margin: 0 auto;
    text-align: center;
    line-height: 75px;
    border-radius: 100%;
    ${AppStyle.shadow.lv2}
    ${AppStyle.font.tool}
    cursor: pointer;
    top: 45px;
  }
  .start{
    background: ${AppStyle.color.sub};
  }
  .stop{
    background: ${AppStyle.color.main};
  }
`