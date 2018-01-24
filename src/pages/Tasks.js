import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import { Slider } from 'antd';

import { getUser, db } from '../api/firebase'
import { secToTime } from '../functions/moment'
import { getTasks, genNowWorking, genAllWorking, taskDoing } from '../functions/task'

import Layout from '../layouts'
import Tabbar from '../layouts/Tabbar'

import Content from '../components/Content'
import Progress from '../components/Progress'
import Button from '../components/Button'
import Modal from '../components/Modal'

import alarm2 from '../img/alarm2.png'

const setDayHilight = (day, time) => {
  
  if(day === moment().locale('en').format('ddd').toLowerCase()) return AppStyle.color.main
  if(time===0) return AppStyle.color.gray

  return AppStyle.color.sub
}

class Tasks extends Component {

  state = {
    user: store.get('employee'),
    tasks: store.get('tasks'),
    limitWorkTimeToDay: 0,
    totalTimeAllWork: 0,
    doing: 0,
    modalIsOpen: false,
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    getUser('employee', user => {
      this.setState({user})
      store.set('employee',user)
    })
    const { user } = this.state
    
    if(user.data.workTime){
      const limitWorkTimeToDay = user.data.workTime[moment().locale('en').format('ddd').toLowerCase()]
      this.setState({
        limitWorkTimeToDay,
      })
    }else{
      console.log('กรุณาระบุเวลาการทำงาน')
    }

    await this.getWorking(user)
  }

  getWorking = async (user) => {
    db.collection('working')
    .where('employee_id', '==', user.uid)
    //.where('endAt', '>=', new Date())
    .onSnapshot(async snap => {
      let tasks = []
      await snap.forEach(doc => {
        const data = doc.data()
        if(data.endAt <= new Date())return //ถ้าวันส่งน้อยกว่าวันนี้ให้ยกเลิก = ได้งานเฉพาะที่ต้องทำปัจจุบัน

        const toDayFinishedPiece = _.sumBy(data.do_piece, (o) => 
          o.updateAt >= moment().startOf('day')&& //ถ้าเป็นงานในวันนี้เท่านั้น 
          o.updateAt <= moment().endOf('day')&&
            o.piece
        )// งานที่ทำเสร็จในวันนี้
        const anotherDayFinishedPiece = _.sumBy(data.do_piece, (o) => 
          o.updateAt < moment().startOf('day')&& //ถ้าเป็นงานในวันอื่น
            o.piece
        )// งานที่ทำเสร็จในวันอื่น

        let finished_piece = _.sumBy(data.do_piece, (o) => o.piece)
        if(finished_piece===undefined)finished_piece=0 //debug

        let worktime = 0
        if(data.worktime!==undefined)worktime=data.worktime //debug

        tasks.push(Object.assign(data,{
          working_id: doc.id,
          worktime,
          finished_piece,
          toDayFinishedPiece,
          anotherDayFinishedPiece,
        }))
      })
      tasks = _.orderBy(tasks, ['endAt'], ['asc']); //เรียงวันที่

      let totalTimeAllWork = 0 //เวลาที่ต้องทำทั้งหมดทุกงาน
      tasks.map(working => {
        totalTimeAllWork += (working.worktime)*(working.total_piece-working.finished_piece)
      })

      this.setState({
        tasks,
        totalTimeAllWork,
      })
      store.set('tasks', tasks)
    })
  }

  handleDo = async (e, work) => {
    e.preventDefault();
    
    this.setState({
      modalIsOpen: false,
    })

    taskDoing(work, this.state.doing)

    this.setState({
      doing: 0,
    })
  }

  handleDelete = (id) => {
    db.collection('working').doc(id).delete()
  }

  handleOpenModal = (working) => {
    this.setState({
      modalIsOpen: true,
      doWork: working,
    })
  }

  render() {
    const { tasks, doWork, limitWorkTimeToDay, totalTimeAllWork, user } = this.state

    const { nowWorking, limitTimeDayWork, totalTimeDayWork, overTimeDayWork } = genNowWorking(limitWorkTimeToDay, tasks)
    
    const nowTask = (
      <div>
      {_.map(nowWorking, (working,i) => 
        <NowTask fade={i*0.2}>
          <div className='row'>
            <div className='col-9'>
              <div className="name">{working.work_name}</div>
              <div className="piece">
                {working.toDayFinishedPiece} / {working.limitTodo+working.overPiece}<span style={{color: 'red'}}>({working.overPiece})</span>
              </div>

              <div className='row' style={{clear: 'both'}}>
                <div className='col'>
                  <div className="progress">
                    <Progress now={working.toDayFinishedPiece} max={working.limitTodo+working.overPiece}/>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-6'>
                  <div className="edittime">
                    <Link to={`/stopwatch/${working.working_id}`}>
                      <button>
                        <img alt='' src={alarm2}/>
                        {' '} {working.worktime >= 60
                          ?'~ ' + working.worktime/60 + ' นาที'
                          : working.worktime + ' วินาที'
                        }
                      </button>
                    </Link>
                  </div>
                </div>
                <div className='col-6'>
                  <div className="timing">
                  {secToTime(working.timeTodo+(working.overPiece*working.worktime))}
                    <div style={{color: 'red'}}>{secToTime(working.overPiece*working.worktime)}</div>
                  </div>
                </div>
              </div>
              
            </div>
            <div className='col-3'>
            {working.toDayFinishedPiece>=working.limitTodo+working.overPiece
              ?<div className="finish">เสร็จ</div>
              :<div className="do" onClick={() => this.handleOpenModal(working)}>ทำ</div>
            }
            </div>
          
          </div>
          {/*moment(working.createAt).fromNow()*/}
          {/*
            <div onClick={() => this.handleDelete(working.working_id)}>DELETE</div>
          */}
        </NowTask> 
      )}
        {
        <div className=''>
          {'เวลางานที่ต้องทำทั้งหมดทุกงาน '+secToTime(totalTimeAllWork)}
          <br/>
          {'เวลาที่ต้องทำงานวันนี้ '+secToTime(totalTimeDayWork)}
          <br/>
          {'เวลาที่จำกัดวันนี้ '+secToTime(limitWorkTimeToDay)}
          <br/>
          <span style={{color: 'red'}}>{'เวลาที่เกินในวันนี้ '+secToTime(overTimeDayWork)}</span>
        </div>
        }

      </div>
    )

    const allWorking = genAllWorking(tasks)

    const allTask = (
      <div>
      {_.map(allWorking, (working, i) => 
        <AllTask fade={i*0.2}>
          <div className='row'>
            <div className='col-6'>
              <div className="name">{working.work_name}</div>
            </div>
            <div className='col-2'>
              <div className="piece">
                {working.finished_piece}/{working.total_piece}
              </div>
            </div>
            <div className='col-4'>
              <div className="date">
              {working.startAt > new Date
                ?`เริ่มงาน${moment(working.startAt).locale('th').fromNow()}`
                :`ส่งงาน${moment(working.endAt).locale('th').fromNow()}`
              }
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-12'>
            <div className='progress'>
              <Progress now={working.finished_piece} max={working.total_piece}/>
            </div>
            </div>
          </div>
        </AllTask>
      )}
      </div>
    )

    const tabs = [
      {
        render: <Content>{nowTask}</Content>,
        name: 'งานวันนี้',
      },
      {
        render: <Content>{allTask}</Content>,
        name: 'งานทั้งหมด',
      },
    ]

    return (
      <div>
        <Layout route={this.props.route}>
          <Style>
          
            {_.size(tasks) > 0
              ?<Tabbar tabs={tabs}/>
              :<Content>
                <div className='message'>คุณยังไม่มีงาน</div>
              </Content>
            }



            <Link to="/editworktime">
            <WorkDate>
              <Content>
                <div className="day" style={{paddingLeft: 0}}>
                  <div className='box' style={{borderColor: setDayHilight('sun', user.data.workTime['sun'])}}>อา.</div>
                </div>
                <div className="day">
                  <div className='box' style={{borderColor: setDayHilight('mon', user.data.workTime['mon'])}}>จ.</div>
                </div>
                <div className="day">
                  <div className='box' style={{borderColor: setDayHilight('tue', user.data.workTime['tue'])}}>อ.</div>
                </div>
                <div className="day">
                  <div className='box' style={{borderColor: setDayHilight('wed', user.data.workTime['wed'])}}>พ.</div>
                </div>
                <div className="day">
                  <div className='box' style={{borderColor: setDayHilight('thu', user.data.workTime['thu'])}}>พฤ.</div>
                </div>
                <div className="day">
                  <div className='box' style={{borderColor: setDayHilight('fri', user.data.workTime['fri'])}}>ศ.</div>
                </div>
                <div className="day" style={{paddingRight: 0}}>
                  <div className='box' style={{borderColor: setDayHilight('sat', user.data.workTime['sat'])}}>ส.</div>
                </div>
              </Content>
            </WorkDate>
            </Link>
            <div style={{height: '60px'}}></div>


            
            <Modal modalIsOpen={this.state.modalIsOpen}>
              <InsideModal>
                <div className="modal-text">ทำงาน {this.state.doing} จาก {(_.get(doWork,'limitTodo')+_.get(doWork,'overPiece')-_.get(doWork,'toDayFinishedPiece'))} ชิ้น</div>
                {/*<button onClick={() => this.setState({modalIsOpen: false})}>close</button>*/}
                <form>
                  <Slider min={0} max={(_.get(doWork,'limitTodo')+_.get(doWork,'overPiece'))-_.get(doWork,'toDayFinishedPiece')}
                    onChange={doing => this.setState({doing})}
                    value={this.state.doing}
                    style={{margin: '40px 0'}}
                    />
                  <Button onClick={(e) => this.handleDo(e,doWork)}>ยืนยัน</Button>
                </form>
              </InsideModal>
            </Modal>

          </Style>
        </Layout>

      </div>
    )
  }
}

//มีงานที่รับมา งานอยู่ที่ช่วงที่ต้องทำ งานเริ่มวันที่-สุดวันที่ วันที่ 1-7 = 7 วัน งาน100ชิ้น ชิ้นละ 3นาที รวมเป็น 300นาที
// เวลางาน หาร จำนวนวันทำงาน => 300/7 
// หักลบกับวันที่ต้องการหยุด หาชื่อวัน ของวันที่ต่างๆ เสาร์ อาทิตย์ จากวันทำงาน

export default Tasks;

const Style = Styled.div`
  .message{
    width: 100%;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
    padding: 10px;
    text-align: center;
    ${AppStyle.font.read1}
    border-radius: 100px;
    margin-top: 20px;
  }
`

const InsideModal = Styled.div`

  .modal-text{
    text-align: center;
    ${AppStyle.font.read1}
  }
`

const NowTask = Styled.div`
  animation-name: fadeInLeft; 
  animation-duration: ${props => props.fade+0.2}s;

  padding: 10px;
  box-sizing: border-box;
  background: ${AppStyle.color.card};
  margin-bottom: 10px;
  ${AppStyle.shadow.lv1}
  .name{
    text-align: left;
    float: left;
    ${AppStyle.font.read1}
  }
  .piece{
    ${AppStyle.font.read1}
    text-align: right;
    float: right;
  }
  .progress{
    height: 20px;
    width: 100%;
    //background: ${AppStyle.color.main};
    margin-bottom: 10px;
  }
  .edittime{
    text-align: left;
    button{
      width: 100px;
      height: 30px;
      background: ${AppStyle.color.sub};
      border: none;
      border-radius: 4px;
      color: ${AppStyle.color.white};
      font-size: 14px;
      ${AppStyle.shadow.lv2}
      img{
        height: 20px;
        width: 20px;
      }
    }
  }
  .timing{
    text-align: right;
  }
  .do{
    width: 50px;
    height: 50px;
    background: ${AppStyle.color.main};
    border-radius: 100%;
    text-align: center;
    line-height: 50px;
    cursor: pointer;
    ${AppStyle.font.tool}
    ${AppStyle.shadow.lv2}
  }
  .do:active{
    opacity: 0.8;
  }
  .finish{
    width: 50px;
    height: 50px;
    background: ${AppStyle.color.gray};
    border-radius: 100%;
    text-align: center;
    line-height: 50px;
    ${AppStyle.font.tool}
    color: ${AppStyle.color.main};
    ${AppStyle.shadow.lv2}
  }
`
const AllTask = Styled.div`
  animation-name: fadeInRight;
  animation-duration: ${props => props.fade+0.2}s;

  padding: 10px;
  box-sizing: border-box;
  background: ${AppStyle.color.card};
  margin-bottom: 10px;
  ${AppStyle.shadow.lv1}
  .name{
    text-align: left;
    ${AppStyle.font.read1}
  }
  .piece{
    ${AppStyle.font.read1}
  }
  .date{
    ${AppStyle.font.read2}
    text-align: right;
  }
  .progress{
    height: 20px;
    width: 100%;
    //background: ${AppStyle.color.main};
  }
`

const WorkDate = Styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}
  line-height: 20px;

  .day{
    width: ${100/7}%;
    padding: 10px 5px;
    float: left;
    .box{
      width: 100%;
      text-align: center;
      border: solid 2px ${AppStyle.color.gray};
      border-radius: 4px;
      height: 40px;
      line-height: 40px;
      ${AppStyle.font.read1}
    }
  }
`
