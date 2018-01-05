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
    modalIsOpen: false
  }

  async componentDidMount() {
    // auth.onAuthStateChanged(user => {
    //   user
    //     ?getUser('employee', user => {
    //       this.setState({user})
    //       this.getWorking(user)
    //     })
    //     :browserHistory.push('/login')
    // }) 
    const user = await store.get('employee')
    this.setState({user})
    this.getWorking(user)
  }

  getWorking = (user) => {
    // this.setState({
    //   workingList: store.get('working')
    // })
    store.remove('working')

    db.collection('working')
    .where('employee_id', '==', user.uid)
    //.orderBy("endAt", "desc")
    //.where('endAt', '>=', new Date())
    .onSnapshot(snap => {
      const workingList = []
      snap.forEach(doc => {
        const data = doc.data()
        //data.endAt >= new Date()&&
        workingList.push(Object.assign(data,{working_id: doc.id}))
      })
      this.setState({workingList})
      store.set('working', workingList)
    })
  }

  handleDo = async (e, work) => {
    e.preventDefault();
    const updateAt = new Date()
    let newPiece = +this.do.value //จำนวนชิ้นที่ระบุ
    let piece = 0 

    let finished_piece = +work.finished_piece //จำนวนชิ้นที่ทำเสร็จแล้ว (ของเก่า)
    
    if(newPiece>=(work.limitTodo-work.toDayFinishedPiece))newPiece=(work.limitTodo-work.toDayFinishedPiece) //ทำได้ไม่เกินจำกัดของวันนี้
    //if(newPiece <= 0)newPiece=0

    piece = finished_piece+newPiece //จำนวนชิ้นงานเดิน บวก จำนวนชิ้นงานที่ทำใหม่วันนี้

    if(finished_piece==NaN)finished_piece=0
    if(newPiece==null || newPiece==undefined)newPiece=0

    if(piece>=work.total_piece)piece=work.total_piece

    if(piece<=0)piece=0
    if(newPiece<=(work.toDayFinishedPiece*-1))newPiece=(work.toDayFinishedPiece*-1)

    const workingRef = db.collection('working').doc(work.working_id)

    let do_piece = []
    await workingRef.get()
    .then(data => {
      const updatePiece = {
        piece: newPiece,
        updateAt,
      }
      if(data.data().do_piece != undefined){
        do_piece = _.assign(data.data().do_piece,{[data.data().do_piece.length]: updatePiece})
      }else{
        do_piece = [updatePiece]
      }
    })

    await workingRef.update({
      finished_piece: piece,
      do_piece,
      updateAt
    })

    this.setState({
      updateAt,
      modalIsOpen: false,
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

  render() {
    const { workingList, doWork } = this.state
    //const sorted = _.orderBy(workingList, ['endAt'], ['desc']);
    
    const menuList = ['งานวันนี้','งานทั้งหมด']

    const limitWorkTimeToDay = 10800 //เวลางานที่ผู้ใช้สามารถทำในวันนี้
    let limitTimeDayWork = limitWorkTimeToDay // 3 hours

    let totalTimeAllWork = 0
    workingList.map(working => {
      if(working.endAt >= new Date())
        totalTimeAllWork += (working.worktime*60)*(working.total_piece-working.finished_piece)
    })
    // console.log('totalTimeAllWork',totalTimeAllWork,'second')
    // console.log('limitTimeDayWork',limitTimeDayWork)

    let totalTimeDayWork = 0 //เวลางานที่ต้องทำในวันนี้
    
    let nowWorking = []
    workingList.map(async working => {
      if(working.finished_piece >= working.total_piece)return
      if(working.endAt < new Date())return

      const todoWork = working.total_piece-working.finished_piece //จำนวนงานนี้ที่เหลือทั้งหมด
      let limitTodo = 0 //จำนวนงานนี้ที่ต้องทำวันนี้
      for(let i = 1; i <= todoWork; i++){
        if(limitTimeDayWork >= working.worktime*60){
          totalTimeDayWork += working.worktime*60
          limitTimeDayWork -= working.worktime*60
          // console.log('limitTimeDayWork',limitTimeDayWork,working.worktime)
          // console.log('timeDayWork',totalTimeDayWork,working.worktime)
          limitTodo = i
        }
      }
      // console.log('AAA',working.work_name,totalTimeDayWork,todoWork,limitTodo,limitTodo*working.worktime*60)
      // console.log('limitTimeDayWork',limitTimeDayWork)

      let toDayFinishedPiece = _.sumBy(working.do_piece, (o) => 
        o.piece
      ) //จำนวนงานที่ทำเสร็จในวันนี้
      
      if(limitTodo > 0) //ถ้ามีจำนวนงานที่ต้องทำ
        nowWorking.push(Object.assign(working, {
          limitTodo,
          toDayFinishedPiece,
          timeTodo: limitTodo*working.worktime*60
        }))
    })
    // console.log('nowWorking',nowWorking)
    // console.log('timeDayWork',totalTimeDayWork)

    const nowTask = (
      <div>
      {nowWorking.map( working => 
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

    let allWorking = []
    workingList.map(working => {
      if(working.endAt < new Date())return
      if(working.finished_piece >= working.total_piece)return

      //working.endAt >= new Date()&&
      allWorking.push(working)
    })
    const allTask = (
      _.map(allWorking, working => 
        <AllTask>
          <div className='row'>
            <div className='col-6'>
              <div className="name">{working.work_name}</div>
            </div>
            <div className='col-2'>
              <div className="piece">{working.finished_piece}/{working.total_piece}</div>
            </div>
            <div className='col-4'>
              <div className="date">ส่งในพรุ่งนี้</div>
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
            {'Total Time All Work '+moment().startOf('day').second(totalTimeAllWork).format('H:mm:ss')}
            <br/>
            {'ToDay WorkTime '+moment().startOf('day').second(totalTimeDayWork).format('H:mm:ss')}
            <br/>
            {'Limit WorkTime ToDay '+moment().startOf('day').second(limitWorkTimeToDay).format('H:mm:ss')}
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