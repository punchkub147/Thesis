import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import Modal from 'react-modal'

import { Slider } from 'antd';

import { getUser, db } from '../api/firebase'
import { secToTime } from '../functions/moment'

import Layout from '../layouts'
import Tabbar from '../layouts/Tabbar'

import Content from '../components/Content';
import Progress from '../components/Progress';
import Button from '../components/Button';

import alarm2 from '../img/alarm2.png'

class Tasks extends Component {

  state = {
    workingList: [],
    updateAt: '',
    modalIsOpen: false,
    limitWorkTimeToDay: 0,
    totalTimeAllWork: 0,
    doing: 0,
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    getUser('employee', user => {
      this.setState({user})
      store.set('employee',user)
    })    
    let user = await store.get('employee')
    this.setState({user})
    
    const limitWorkTimeToDay = user.data.workTime[moment().format('ddd').toLowerCase()]
    this.setState({
      limitWorkTimeToDay,
    })

    await this.getWorking(user)
    // this.genNowWorking()
    // this.genAllWorking()
  }

  getWorking = (user) => {
    this.setState({
      workingList: store.get('tasks')
    })
    //store.remove('working')

    db.collection('working')
    .where('employee_id', '==', user.uid)
    //.where('endAt', '>=', new Date())
    .onSnapshot(async snap => {
      let workingList = []
      await snap.forEach(doc => {
        const data = doc.data()
        if(data.endAt <= new Date())return //ถ้าวันส่งน้อยกว่าวันนี้ให้ยกเลิก = ได้งานเฉพาะที่ต้องทำปัจจุบัน

        const toDayFinishedPiece = _.sumBy(data.do_piece, (o) => 
          o.updateAt >= moment().startOf('day')&& //ถ้าเป็นงานในวันนี้เท่านั้น 
          o.updateAt <=moment().endOf('day')&&
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

        workingList.push(Object.assign(data,{
          working_id: doc.id,
          worktime,
          finished_piece,
          toDayFinishedPiece,
          anotherDayFinishedPiece
        }))
      })
      workingList = _.orderBy(workingList, ['endAt'], ['asc']); //เรียงวันที่

      let totalTimeAllWork = 0 //เวลาที่ต้องทำทั้งหมดทุกงาน
      workingList.map(working => {
        totalTimeAllWork += (working.worktime)*(working.total_piece-working.finished_piece)
      })

      this.setState({
        workingList,
        totalTimeAllWork,
      })
      store.set('tasks', workingList)
    })
  }

  handleDo = async (e, work) => {
    e.preventDefault();
    const updateAt = new Date()
    let newPiece = +this.state.doing //จำนวนชิ้นที่ระบุ
    let piece = 0 
    let total_finished_piece = _.sumBy(work.do_piece, (o) => o.piece) //จำนวนชิ้นที่ทำเสร็จแล้ว (ของเก่า)
    
    this.setState({
      updateAt,
      modalIsOpen: false,
      doing: 0,
    })

    if(newPiece>=(work.limitTodo-work.toDayFinishedPiece))newPiece=(work.limitTodo-work.toDayFinishedPiece) //ทำได้ไม่เกินจำกัดของวันนี้

    piece = total_finished_piece+newPiece //จำนวนชิ้นงานเดิน บวก จำนวนชิ้นงานที่ทำใหม่วันนี้

    if(total_finished_piece===NaN)total_finished_piece=0
    if(newPiece===null || newPiece===undefined)newPiece=0

    if(piece>=work.total_piece)piece=work.total_piece

    if(piece<=0)piece=0
    if(newPiece<=(work.toDayFinishedPiece*-1))newPiece=(work.toDayFinishedPiece*-1)

    const workingRef = db.collection('working').doc(work.working_id)

    const updatePiece = {
      piece: newPiece,
      updateAt,
    }
    
    let do_piece = []
    // Has Notworking
    await workingRef.get()
    .then(data => {

      if(data.data().do_piece !== undefined){
        do_piece = _.assign(data.data().do_piece,{[data.data().do_piece.length]: updatePiece})
      }else{
        do_piece = [updatePiece]
      }
    })
  
    workingRef.update({
      finished_piece: piece,
      do_piece,
      updateAt,
    })
    //finished_piece : [{piece: n,updateAt: newDate()}]
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
    const { workingList, doWork, limitWorkTimeToDay, totalTimeAllWork } = this.state

    /////////////////////// GEN NOW WORK ////////////////////////////////
    let limitTimeDayWork = limitWorkTimeToDay // 3 hours
    let totalTimeDayWork = 0 //เวลางานที่ต้องทำในวันนี้
    
    let nowWorking = []
    _.map(workingList, async working => {
      if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ
  
      const todoWork = working.total_piece-working.anotherDayFinishedPiece //จำนวนงานนี้ที่เหลือ งานทั้งหมด-งานวันอื่น
      
      let limitTodo = 0 //จำนวนงานนี้ที่ต้องทำวันนี้
      for(let i = 1; i <= todoWork; i++){
        if(limitTimeDayWork >= working.worktime){
          totalTimeDayWork += +working.worktime
          limitTimeDayWork -= +working.worktime
          limitTodo = i
        }
      }
      if(limitTodo > 0){ //ถ้ามีจำนวนงานที่ต้องทำ
        nowWorking.push(Object.assign(working, {
          limitTodo,
          timeTodo: limitTodo*working.worktime
        }))
      }
    })
  
    /////////////////////// GEN NOW WORK ////////////////////////////////

    const nowTask = (
      _.map(nowWorking, (working,i) => 
        <NowTask fade={i*0.2}>
          <div className='row'>
            <div className='col-9'>
              <div className='row'>
                <div className='col-8'>
                  <div className="name">{working.work_name}</div>
                </div>
                <div className='col-4'>
                  <div className="piece">
                    {working.toDayFinishedPiece} / {working.limitTodo}
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col'>
                  <div className="progress">
                    <Progress now={working.toDayFinishedPiece} max={working.limitTodo}/>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-6'>
                  <div className="edittime">
                    <button>
                      <img alt='' src={alarm2}/>
                      {' '} ~ {working.worktime/60} นาที
                    </button>
                  </div>
                </div>
                <div className='col-6'>
                  <div className="timing">
                  {secToTime(working.timeTodo)}
                  </div>
                </div>
              </div>
              
            </div>
            <div className='col-3'>
            {working.toDayFinishedPiece>=working.limitTodo
              ?<div className="finish" onClick={() => this.handleOpenModal(working)}>FINISH</div>
              :<div className="do" onClick={() => this.handleOpenModal(working)}>ทำ</div>
            }
            </div>
          
          </div>
          {/*moment(working.createAt).fromNow()*/}
          {/*
            <div onClick={() => this.handleDelete(working.working_id)}>DELETE</div>
          */}
        </NowTask> 
      )
    )

    ////////////////////// GEN ALL WORK ///////////////////////
    let allWorking = []
    _.map(workingList, working => {
      //if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ
      allWorking.push(working)
    })
    ////////////////////// GEN ALL WORK ///////////////////////

    const allTask = (
      _.map(allWorking, (working, i) => 
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
              <div className="date">ส่ง {moment(working.endAt).locale('th').fromNow()}</div>
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
      )
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
          
            {_.toLength(workingList) !== 0
              ?<Tabbar tabs={tabs}/>
              :<Content>
                <div className='message'>คุณยังไม่มีงาน</div>
              </Content>
            }
            
            <WorkDate>
              <div className="row">
                <div className="col-10">
                {'เวลางานที่ต้องทำทั้งหมดททุกงาน '+secToTime(totalTimeAllWork)}
                <br/>
                {'เวลาที่ต้องทำงานวันนี้ '+secToTime(totalTimeDayWork)}
                <br/>
                {'เวลาที่จำกัดวันนี้ '+secToTime(limitWorkTimeToDay)}
                </div>
                <div className="col-2">
                  <Link to="/editworktime">แก้ไข</Link>
                </div>
              </div>
            </WorkDate>
            <div style={{height: '60px'}}></div>

          </Style>
        </Layout>

        <Modal
          isOpen={this.state.modalIsOpen}
          // onAfterOpen={this.afterOpenModal}
          // onRequestClose={this.closeModal}
          style={modalStyle}
          contentLabel="Example Modal"
        >
          <div>ทำงาน {this.state.doing} จาก {_.get(doWork,'limitTodo')-_.get(doWork,'toDayFinishedPiece')} ชิ้น</div>
          {/*<button onClick={() => this.setState({modalIsOpen: false})}>close</button>*/}
          <form>
            <Slider min={0} max={_.get(doWork,'limitTodo')-_.get(doWork,'toDayFinishedPiece')}
              onChange={doing => this.setState({doing})}
              value={this.state.doing}
              style={{margin: '40px 0'}}
              />
            <Button onClick={(e) => this.handleDo(e,doWork)}>ยืนยัน</Button>
          </form>
        </Modal>
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
    ${AppStyle.font.read1}
  }
  .piece{
    ${AppStyle.font.read1}
    text-align: right;
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
  .finish{
    width: 50px;
    height: 50px;
    background: #ccc;
    border-radius: 100%;
    text-align: center;
    line-height: 50px;
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
`

const modalStyle = {
  content: {
  height: '200px', 
  background: `${AppStyle.color.white}`,
  margin: '0 auto',
  width: '300px',
  'margin-top': '120px', 
  'z-index': '99999999',
  'animation-name': 'zoomIn',
  'animation-duration': '0.2s',
},
  overlay: { 
  background: `rgba(0,0,0,0.3)`,
  'z-index': '9999999',
  'animation-name': 'fadeIn',
  'animation-duration': '0.3s',
},
}