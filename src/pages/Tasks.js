import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import Modal from 'react-modal'

import { getUser, auth, db } from '../api/firebase'

import Layout from '../layouts'
import Content from '../components/Content';
import Progress from '../components/Progress';

class Tasks extends Component {

  state = {
    workingList: [],
    menu: 0,
    updateAt: '',
    modalIsOpen: false,
    limitWorkTimeToDay: 0,
    totalTimeAllWork: 0
  }

  async componentDidMount() {
    const user = await store.get('employee')
    this.setState({user})

    this.setState({
      limitWorkTimeToDay: 10800,
    })

    await this.getWorking(user)
    // this.genNowWorking()
    // this.genAllWorking()
  }

  getWorking = (user) => {
    this.setState({
      workingList: store.get('working')
    })
    //store.remove('working')

    db.collection('working')
    .where('employee_id', '==', user.uid)
    //.where('endAt', '>=', new Date())
    .onSnapshot(snap => {
      let workingList = []
      snap.forEach(doc => {
        const data = doc.data()
        if(data.endAt <= new Date())return //ถ้าวันส่งน้อยกว่าวันนี้ให้ยกเลิก = ได้งานเฉพาะที่ต้องทำปัจจุบัน

        const toDayFinishedPiece = _.sumBy(data.do_piece, (o) => 
          o.updateAt >= moment().startOf('day')&& //ถ้าเป็นงานในวันนี้เท่านั้น 
            o.piece
        )// งานที่ทำเสร็จในวันนี้

        let finished_piece = _.sumBy(data.do_piece, (o) => o.piece)
        if(finished_piece==undefined)finished_piece=0 //debug

        let worktime = 0
        if(data.worktime!=undefined)worktime=data.worktime //debug

        workingList.push(Object.assign(data,{
          working_id: doc.id,
          worktime,
          finished_piece,
          toDayFinishedPiece,
        }))
      })
      workingList = _.orderBy(workingList, ['endAt'], ['asc']); //เรียงวันที่

      let totalTimeAllWork = 0 //เวลาที่ต้องทำทั้งหมดทุกงาน
      workingList.map(working => {
        totalTimeAllWork += (working.worktime*60)*(working.total_piece-working.finished_piece)
      })

      this.setState({
        workingList,
        totalTimeAllWork,
      })
      store.set('working', workingList)
    })
  }

  handleDo = async (e, work) => {
    e.preventDefault();
    const updateAt = new Date()
    let newPiece = +this.do.value //จำนวนชิ้นที่ระบุ
    let piece = 0 
    let total_finished_piece = _.sumBy(work.do_piece, (o) => o.piece) //จำนวนชิ้นที่ทำเสร็จแล้ว (ของเก่า)
    
    this.setState({
      updateAt,
      modalIsOpen: false,
    })

    if(newPiece>=(work.limitTodo-work.toDayFinishedPiece))newPiece=(work.limitTodo-work.toDayFinishedPiece) //ทำได้ไม่เกินจำกัดของวันนี้

    piece = total_finished_piece+newPiece //จำนวนชิ้นงานเดิน บวก จำนวนชิ้นงานที่ทำใหม่วันนี้

    if(total_finished_piece==NaN)total_finished_piece=0
    if(newPiece==null || newPiece==undefined)newPiece=0

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

      if(data.data().do_piece != undefined){
        do_piece = _.assign(data.data().do_piece,{[data.data().do_piece.length]: updatePiece})
      }else{
        do_piece = [updatePiece]
      }
    })
  
    workingRef.update({
      finished_piece: piece,
      do_piece,
      updateAt
    })



    //finished_piece : [{piece: n,updateAt: newDate()}]
  }

  handleDelete = (id) => {
    db.collection('working').doc(id).delete()
  }

  handleOpenModal = (working) => {
    console.log('open')
    this.setState({
      modalIsOpen: true,
      doWork: working,
    })
  }

  genNowWorking = () => {
    const { workingList, limitWorkTimeToDay } = this.state
    let limitTimeDayWork = limitWorkTimeToDay // 3 hours
    let totalTimeDayWork = 0 //เวลางานที่ต้องทำในวันนี้
    
    let nowWorking = []
    workingList.map(async working => {
      if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ

      const todoWork = working.total_piece-working.finished_piece //จำนวนงานนี้ที่เหลือทั้งหมด
      
      let limitTodo = 0 //จำนวนงานนี้ที่ต้องทำวันนี้
      for(let i = 1; i <= todoWork; i++){
        if(limitTimeDayWork >= working.worktime*60){
          totalTimeDayWork += working.worktime*60
          limitTimeDayWork -= working.worktime*60
          limitTodo = i
        }
      }
      if(limitTodo > 0){ //ถ้ามีจำนวนงานที่ต้องทำ
        nowWorking.push(Object.assign(working, {
          limitTodo,
          timeTodo: limitTodo*working.worktime*60
        }))
      }
    })
    this.setState({
      nowWorking,
      totalTimeDayWork,
    })
  }

  genAllWorking = () => {
    const { workingList } = this.state
    let allWorking = []
    workingList.map(working => {
      if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ

      //working.endAt >= new Date()&&
      allWorking.push(working)
    })
    this.setState({allWorking})
  }

  render() {
    const { workingList, doWork, limitWorkTimeToDay, totalTimeAllWork } = this.state
    
    const menuList = ['งานวันนี้','งานทั้งหมด']

    if(totalTimeAllWork==0
    )return <div/>
    console.log('titaltimeallwork',totalTimeAllWork)

    /////////////////////// GEN NOW WORK ////////////////////////////////
    let limitTimeDayWork = limitWorkTimeToDay // 3 hours
    let totalTimeDayWork = 0 //เวลางานที่ต้องทำในวันนี้
    
    let nowWorking = []
    workingList.map(async working => {
      if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ

      const todoWork = working.total_piece-working.finished_piece //จำนวนงานนี้ที่เหลือทั้งหมด
      
      let limitTodo = 0 //จำนวนงานนี้ที่ต้องทำวันนี้
      for(let i = 1; i <= todoWork; i++){
        if(limitTimeDayWork >= working.worktime*60){
          totalTimeDayWork += working.worktime*60
          limitTimeDayWork -= working.worktime*60
          limitTodo = i
        }
      }
      if(limitTodo > 0){ //ถ้ามีจำนวนงานที่ต้องทำ
        nowWorking.push(Object.assign(working, {
          limitTodo,
          timeTodo: limitTodo*working.worktime*60
        }))
      }
    })
    /////////////////////// GEN NOW WORK ////////////////////////////////

    const nowTask = (
      <div>
      {nowWorking&&
        nowWorking.map( working => 
        <NowTask>
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
                    ส่ง{moment(working.endAt).locale('th').fromNow()}
                  </div>
                </div>
                <div className='col-6'>
                  <div className="timing">
                  {moment().startOf('day').second(working.timeTodo).format('H:mm:ss')}({working.worktime*60}s)
                  </div>
                </div>
              </div>
              
            </div>
            <div className='col-3'>
            {working.toDayFinishedPiece==working.limitTodo
              ?<div className="finish" onClick={() => this.handleOpenModal(working)}>FINISH</div>
              :<div className="do" onClick={() => this.handleOpenModal(working)}>DO</div>
            }
            </div>
          
          </div>
          {/*moment(working.createAt).fromNow()*/}
          {/*
            <div onClick={() => this.handleDelete(working.working_id)}>DELETE</div>
          */}
        </NowTask>
      )}
      </div>
    )

    ////////////////////// GEN ALL WORK ///////////////////////
    let allWorking = []
    workingList.map(working => {
      if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ

      //working.endAt >= new Date()&&
      allWorking.push(working)
    })
    ////////////////////// GEN ALL WORK ///////////////////////

    const allTask = (
      _.map(allWorking, working => 
        <AllTask>
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

    return (
      <div>
      <Layout route={this.props.route}>
        <Style>
          <div id="Tasks">

            <Tabbar>
            {menuList.map((menu,key) =>
              <div className={`menu ${this.state.menu==key&&'border'}`} 
                onClick={() => this.setState({menu: key})}>
                {menu}
              </div>
            )}
            </Tabbar>

            <Content>
            {this.state.menu===0&&
              nowTask
            }
            {this.state.menu===1&&
              allTask
            }
            </Content>

            <Modal
              isOpen={this.state.modalIsOpen}
              // onAfterOpen={this.afterOpenModal}
              // onRequestClose={this.closeModal}
              style={{
                content: {'margin-top': '100px', height: '200px' },
                overlay: {background: 'rgba(0,0,0,0.5)'}
              }}
              contentLabel="Example Modal"
            >
              <div>{_.get(doWork,'finished_piece')}/{_.get(doWork,'total_piece')}</div>
              {/*<button onClick={() => this.setState({modalIsOpen: false})}>close</button>*/}
              <form>
                <input type='number' ref={r => this.do = r }/>
                <button onClick={(e) => this.handleDo(e,doWork)}>DO</button>
              </form>
            </Modal>
          </div>
          
          <WorkDate>
            <div className="row">
              <div className="col-10">
              {'เวลางานที่ต้องทำทั้งหมดททุกงาน '+moment().startOf('day').second(totalTimeAllWork).format('H:mm:ss')}
              <br/>
              {'เวลาที่ต้องทำงานวันนี้ '+moment().startOf('day').second(totalTimeDayWork).format('H:mm:ss')}
              <br/>
              {'เวลาที่จำกัดวันนี้ '+moment().startOf('day').second(limitWorkTimeToDay).format('H:mm:ss')}
              </div>
              <div className="col-2">
                <Link to="/editworktime">แก้ไข</Link>
              </div>
            </div>
          </WorkDate>
          <div style={{height: '60px'}}></div>
        </Style>
      </Layout>
      </div>
    );
  }
}

//มีงานที่รับมา งานอยู่ที่ช่วงที่ต้องทำ งานเริ่มวันที่-สุดวันที่ วันที่ 1-7 = 7 วัน งาน100ชิ้น ชิ้นละ 3นาที รวมเป็น 300นาที
// เวลางาน หาร จำนวนวันทำงาน => 300/7 
// หักลบกับวันที่ต้องการหยุด หาชื่อวัน ของวันที่ต่างๆ เสาร์ อาทิตย์ จากวันทำงาน

export default Tasks;

const Style = Styled.div`
  #Tasks{
    //min-height: 100vh;
  }
`
const Tabbar = Styled.div`
  width: 100%;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}
  height: 50px;
  line-height: 50px;
  text-align: center;
  .menu{
    width: 50%;
    float: left;
    cursor: pointer;
  }
  margin-bottom: 10px;
  border-bottom: solid 2px transparent;
  .border{
    border-bottom: solid 2px ${AppStyle.color.sub};
  }
`
const NowTask = Styled.div`
  padding: 10px;
  box-sizing: border-box;
  background: ${AppStyle.color.card};
  margin-bottom: 10px;
  .name{
    ${AppStyle.font.text1}
  }
  .piece{
    ${AppStyle.font.text2}
    text-align: right;
  }
  .progress{
    height: 20px;
    width: 100%;
    //background: ${AppStyle.color.main};
  }
  .edittime{

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
  padding: 10px;
  box-sizing: border-box;
  background: ${AppStyle.color.card};
  margin-bottom: 10px;
  .name{
    ${AppStyle.font.text1}
  }
  .piece{
    ${AppStyle.font.text2}
  }
  .date{
    ${AppStyle.font.text2}
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