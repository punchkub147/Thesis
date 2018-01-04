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
    this.setState({
      workingList: store.get('working')
    })

    db.collection('working')
    .where('employee_id', '==', user.uid)
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
    let count = +this.do.value
    let piece = 0

    let finished_piece = +work.finished_piece
    if(finished_piece==NaN)finished_piece=0
    if(count==null || count==undefined)count=0

    piece = finished_piece+count

    if(piece>=work.total_piece)piece=work.total_piece
    if(piece<=0)piece=0

    db.collection('working').doc(work.working_id).update({
      finished_piece: piece,
      updateAt: new Date()
    })
    this.setState({
      updateAt: new Date(),
      modalIsOpen: false,
    })
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
    console.log('worklist', workingList)
    const menuList = ['งานวันนี้','งานทั้งหมด']

    const limitTimeDayWork = 10800 // 3 hours

    let totalTimeAllWork = 0
    workingList.map(working => {
      if(working.endAt >= new Date())
        totalTimeAllWork += (working.worktime*60)*(working.total_piece-working.finished_piece)
    })
    console.log('totalTimeAllWork',totalTimeAllWork,'second')

    let timeDayWork = 0
    let nowWorking = []
    let limitTodo = 0
    workingList.map(async working => {
      if(working.endAt >= new Date())
      if(working.finished_piece < working.total_piece){
        const todoWork = working.total_piece-working.finished_piece
        for(let i = 1; i <= todoWork; i++){
          if(timeDayWork < limitTimeDayWork){
            timeDayWork += working.worktime*60
            limitTodo = i
          }
        }
        console.log('AAA',working.work_name,timeDayWork,todoWork,limitTodo)
        nowWorking.push(Object.assign(working, {
          limitTodo,
        }))
      }
    })
    console.log('nowWorking',nowWorking)
    console.log('timeDayWork',timeDayWork)

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
                  <div className="piece">{working.finished_piece}/{working.limitTodo}</div>
                </div>
              </div>
              <div className='row'>
                <div className='col'>
                  <div className="progress">
                    <Progress now={working.finished_piece} max={working.total_piece}/>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-6'>
                  <div className="edittime">EditTime</div>
                </div>
                <div className='col-6'>
                  <div className="timing">
                  {moment().startOf('day').second((working.worktime*60)*(working.total_piece-working.finished_piece)).format('H:mm:ss')}
                  </div>
                </div>
              </div>
              
            </div>
            <div className='col-3'>
              <div className="do" onClick={() => this.handleOpenModal(working)}>DO</div>
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
      working.endAt >= new Date()&&
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
              <div className={`menu ${this.state.menu==key&&'border'}`} onClick={() => this.setState({menu: key})}>{menu}</div>
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
            {'Total Time '+moment().startOf('day').second(totalTimeAllWork).format('H:mm:ss')}
            <br/>
            {'Max Day Time '+moment().startOf('day').second(limitTimeDayWork).format('H:mm:ss')}
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