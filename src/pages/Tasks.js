import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import holiday from '../config/holiday'

import { Slider } from 'antd';

import { getUser, db } from '../api/firebase'
import { secToTime, secToText } from '../functions/moment'
import { getTasks, genNowWorking, genAllWorking, taskDoing } from '../functions/task'

import Layout from '../layouts'
import Tabbar from '../layouts/Tabs'

import Content from '../components/Content'
import Progress from '../components/Progress'
import Button from '../components/Button'
import Modal from '../components/Modal'

import WorkItem from '../components/WorkItem'

import TopStyle from '../components/TopStyle'

import alarm2 from '../img/alarm2.png'

const setDayHilight = (day, time) => {
  
  if(day === moment().locale('en').format('ddd').toLowerCase()) return 'today'
  if(time>0) return 'workday'

  return ''
}

class Tasks extends Component {

  state = {
    user: store.get('employee'),
    tasks: store.get('tasks'),
    limitWorkTimeToDay: 0,
    totalTimeAllWork: 0,
    doing: 0,
    modalIsOpen: false,

    modalHoliday: false,
    nextHoliday: [],

    modalRecommend: false,
    recommend: '',

    showDetail: [],
    showAllDetail: [],

    works: store.get('works')
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
    await this.setNextHoliday()
    await this.getWorking(user)

    await this.getWorks()
  }

  getWorks = async () => {

    await db.collection('abilities')
    .onSnapshot(snap => {
      const abilities = []
      snap.forEach(doc => {
        abilities[doc.id] = doc.data()
      })
      this.setState({abilities})
      store.set('abilities',abilities)
    })

    await db.collection('works')
    //.where('startAt' ,'>', new Date())
    .onSnapshot(snapshot => {
      let works = []
      snapshot.forEach(doc => {
        if(doc.data().pack <= 0)return
        if(!doc.data().round)return

        const nextRound = _.find(doc.data().round, function(o) { return o.startAt > new Date; })
        if(!nextRound)return
        
        works.push(_.assign(doc.data(),
          { 
            _id: doc.id,
            abilityName: _.get(this.state.abilities[doc.data().ability],'name'),

            startAt: nextRound.startAt,
            endAt: nextRound.endAt,
            workAllTime: doc.data().worktime*doc.data().piece
          }
        ))
      })

      works = _.orderBy(works, ['startAt'], ['asc']); //เรียงวันที่

      this.setState({works})
      store.set('works', works)
    })
  }

  getWorking = async (user) => {
    db.collection('working')
    .where('employee_id', '==', user.uid)
    //.where('endAt', '>=', new Date())
    .onSnapshot(async snap => {
      let tasks = []
      await snap.forEach(doc => {
        const data = doc.data()
        if(data.success)return //เสร็จแล้ว
        if(data.endAt <= new Date())return //ถ้าวันส่งน้อยกว่าวันนี้ให้ยกเลิก = ได้งานเฉพาะที่ต้องทำปัจจุบัน

        let finished_piece = _.sumBy(data.do_piece, (o) => o.piece)
        if(finished_piece===undefined)finished_piece=0 //debug

        let worktime = 0
        if(data.worktime!==undefined)worktime=data.worktime //debug

        tasks.push(Object.assign(data,{
          working_id: doc.id,
          worktime,
          finished_piece,
          do_piece: _.orderBy(doc.data().do_piece, ['updateAt'], ['desc'])
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

  setNextHoliday = async () => {
    const { user } = this.state
    const today = moment().format('DD/MM/YY')
    let nextHoliday = []

    
    await _.map(holiday, holiday => {
      moment(holiday.date, 'DD/MM/YY') > moment() &&
        (moment().diff(moment(holiday.date, 'DD/MM/YY'),'days') > -30) &&
          !_.get(user.data.holiday, holiday.date)&&
            nextHoliday.push(holiday)
    })

    if(nextHoliday.length > 0){
      this.setState({
        nextHoliday: nextHoliday[0],
        modalHoliday: true
      })
    }
  }

  handleDo = async (e, work) => {
    e.preventDefault();
    
    this.setState({
      modalIsOpen: false,
    })
    const total_piece = work.total_piece
    const finished_piece = work.finished_piece?work.finished_piece:0
    const percent = 80
    const totalPercent = (total_piece*percent)/100
    if(finished_piece+this.state.doing >= totalPercent){
      this.setState({
        modalRecommend: true,
        recommend: work.work_id
      })
    }

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

  handleHoliday = (date) => {
    const { user } = this.state
    let holiday = user.data.holiday?user.data.holiday:{}
    holiday[date] = true
    db.collection('employee').doc(user.uid).update({holiday})
    this.setState({
      modalHoliday: false
    })
  }

  showDetail = (working_id) => {
    let {showDetail} = this.state
    console.log('FINDKETKEYK',_.indexOf(showDetail, working_id))
    if(_.indexOf(showDetail, working_id) == -1){
      showDetail.push(working_id)
    }else{
      _.pull(showDetail, working_id)
    }
    
    this.setState({
      showDetail
    })
  }

  showAllDetail = (working_id) => {
    let {showAllDetail} = this.state
    console.log('FINDKETKEYK',_.indexOf(showAllDetail, working_id))
    if(_.indexOf(showAllDetail, working_id) == -1){
      showAllDetail.push(working_id)
    }else{
      _.pull(showAllDetail, working_id)
    }
    
    this.setState({
      showAllDetail
    })
  }

  render() {
    const { tasks, doWork, limitWorkTimeToDay, totalTimeAllWork, user, nextHoliday, works, showDetail, showAllDetail } = this.state

    const { nowWorking, limitTimeDayWork, totalTimeDayWork, overTimeDayWork } = genNowWorking(limitWorkTimeToDay, tasks, user)
    
    const nowTask = (
      <div>
      {_.map(nowWorking, (working,i) => 
        <NowTask fade={i*0.2}>
          <div className='row'>
            <div className='col-9'>
              <Link to={`work/${working.work_id}`}>
                <div className="name">{working.work_name}</div>
              </Link>
              <div className="piece-l">
                ต้องทำ <span className='number'>{working.limitTodo+working.overPiece}</span> ชิ้น
              </div>
              <div className="piece-r">
                ทำไปแล้ว <span className='number'>{working.toDayFinishedPiece}</span> ชิ้น
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
                        {' '} 
                        {secToText(working.worktime)}
                      </button>
                    </Link>
                  </div>
                </div>
                <div className='col-6'>
                  <div className="timing">
                  เหลือเวลา {secToText(working.timeTodo-(working.toDayFinishedPiece*working.worktime))}
                    {/*<div style={{color: 'red'}}>{working.overPiece!==0&&secToTime(working.overPiece*working.worktime)}</div>
                    */}
                  </div>
                </div>
              </div>
              
            </div>
            {working.toDayFinishedPiece>=working.limitTodo+working.overPiece
              ?<div className="finish"><div className='border'>เสร็จ</div></div>
              :<div className="do" onClick={() => this.handleOpenModal(working)}>
                  <div className='border'></div>
                  <div className='do-text'>ทำ</div>
                </div>
            }
          
          </div>

          <div className='showDetail' onClick={() => this.showDetail(working.working_id)}>แสดงรายละเอียด</div>
          {showDetail[_.indexOf(showDetail, working.working_id)] == working.working_id&&
            <div className='detail'>
            {_.map(working.do_piece, detail => 
              moment(detail.updateAt).format('DD/MM') == moment().format('DD/MM')&&
              <div className='c'>
                <div className='do_piece'>จำนวน {detail.piece} ชิ้น</div>
                <div className='updateAt'>เมื่อวันที่ {moment(detail.updateAt).format('DD/MM/YY')} เวลา {moment(detail.updateAt).format('HH:mm')}น. </div>
              </div>
            )}
            <div style={{clear: 'both'}}/>
            </div>
          }
        </NowTask>
      )}
        {/*
        <div className=''>
          {'เวลางานที่ต้องทำทั้งหมดทุกงาน '+secToTime(totalTimeAllWork)}
          <br/>
          {'เวลาที่ต้องทำงานวันนี้ '+secToTime(totalTimeDayWork)}
          <br/>
          {'เวลาที่จำกัดวันนี้ '+secToTime(limitWorkTimeToDay)}
          <br/>
          {overTimeDayWork>0 &&
            <span style={{color: 'red'}}>
              {'เวลาที่เกินในวันนี้ '+secToTime(overTimeDayWork)+` +${(overTimeDayWork/limitWorkTimeToDay*100)}%`}
            </span>
          }
        </div>
        */}
      <TopStyle/>
      <div style={{width: '100%',height: '60px'}}></div>
      </div>
    )

    const allWorking = genAllWorking(tasks)

    const allTask = (
      <div>
      {_.map(allWorking, (working, i) => 
        <AllTask fade={i*0.2}>
          <div className='row'>
            <div className='col-12'>
              <Link to={`work/${working.work_id}`}>
                <div className="name">{working.work_name}</div>
              </Link>
              
              <div className="date">
              {working.startAt > new Date
                ?`เริ่มงาน${moment(working.startAt).locale('th').fromNow()}`
                :`ส่งงาน${moment(working.endAt).locale('th').fromNow()}`
              }
              </div>
              <div className="piece">
                {working.finished_piece}/{working.total_piece}
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

          <div className='showDetail' onClick={() => this.showAllDetail(working.working_id)}>แสดงรายละเอียด</div>
          {showAllDetail[_.indexOf(showAllDetail, working.working_id)] == working.working_id&&
            <div className='detail'>
            {_.map(working.do_piece, detail => 
              <div className='c'>
                <div className='do_piece'>จำนวน {detail.piece} ชิ้น</div>
                <div className='updateAt'>เมื่อวันที่ {moment(detail.updateAt).format('DD/MM/YY')} เวลา {moment(detail.updateAt).format('HH:mm')}น. </div>
              </div>
            )}
            <div style={{clear: 'both'}}/>
            </div>
          }
          
        </AllTask>
      )}
      <TopStyle/>
      <div style={{width: '100%',height: '60px'}}></div>
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

    ///////////////////////
    let days = []
    let timeToEndMonth = 0
    console.log(works)
    if(user.data.workTime){
      const countDay = -moment().diff(moment().endOf('month'),'days')
      
      for(let i = 1; i<=countDay; i++){
        const day = moment().add(i, 'days').locale('en').format('ddd').toLowerCase()
        days.push(day)
        timeToEndMonth += user.data.workTime[day]
      }
      console.log(days,timeToEndMonth)
    }
    let recommendWorks = []
    {_.map(works, (work, i) => 
      timeToEndMonth > work.workAllTime &&
      moment(work.endAt) < moment().endOf('month') &&
        recommendWorks.push(work)
    )}

    const taskStat = (
      <div>
        <div className='message'>
          <div className='title'>คุณยังไม่มีงาน</div>
          <div>มีเวลาถึงสิ้นเดือน {secToText(timeToEndMonth)}</div>
        </div>
        {_.map(recommendWorks, (work, i) =>
          <WorkItem data={work} i={i}/>
        )}
        <div style={{width: '100%',height: '60px'}}></div>
      </div>
    )
    /////////////////////////////////////

    return (
      <div>
        <Layout route={this.props.route}>
          <Style>
          
            {_.size(tasks) > 0
              ?<Tabbar tabs={tabs}/>
              :<Content>
                {taskStat}
              </Content>
            }

            <Link to="/editworktime">
            <WorkDate>
              <Content>
                <div className="day" style={{paddingLeft: 0}}>
                  <div className={`box ${setDayHilight('sun', user.data.workTime['sun'])}`}>อา.</div>
                </div>
                <div className="day">
                  <div className={`box ${setDayHilight('mon', user.data.workTime['mon'])}`}>จ.</div>
                </div>
                <div className="day">
                  <div className={`box ${setDayHilight('tue', user.data.workTime['tue'])}`}>อ.</div>
                </div>
                <div className="day">
                  <div className={`box ${setDayHilight('wed', user.data.workTime['wed'])}`}>พ.</div>
                </div>
                <div className="day">
                  <div className={`box ${setDayHilight('thu', user.data.workTime['thu'])}`}>พฤ.</div>
                </div>
                <div className="day">
                  <div className={`box ${setDayHilight('fri', user.data.workTime['fri'])}`}>ศ.</div>
                </div>
                <div className="day" style={{paddingRight: 0}}>
                  <div className={`box ${setDayHilight('sat', user.data.workTime['sat'])}`}>ส.</div>
                </div>
              </Content>
            </WorkDate>
            </Link>


            
            <Modal modalIsOpen={this.state.modalIsOpen} mini>
              <InsideModal>
                <div className="modal-text">ทำงาน {this.state.doing} จาก {(_.get(doWork,'limitTodo')+_.get(doWork,'overPiece'))-_.get(doWork,'toDayFinishedPiece')} ชิ้น</div>
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

            <Modal modalIsOpen={this.state.modalHoliday} mini>
              <HolidayModal>
                {/*_.map(nextHoliday, date =>
                  <div>
                    <div className='name'>{date.name}</div>
                    <div className='countdown'>{moment(date.date,'DD/MM/YY').fromNow()}</div>
                  </div>
                )*/}
                {nextHoliday&&
                <div>
                  <div className='name'>{nextHoliday.name}</div>
                  <div className='countdown'>{moment(nextHoliday.date,'DD/MM/YY').fromNow()}</div>
                </div>
                }
                <div className='text'>คุณจะหยุดหรือไม่?</div><br/>

                <div className='cancel' onClick={() => this.setState({modalHoliday: false})}>ไม่หยุด</div>
                <div className='submit' onClick={() => this.handleHoliday(nextHoliday.date)}>หยุด</div>
              
              </HolidayModal>
            </Modal>

            <Modal modalIsOpen={this.state.modalRecommend} mini>
              <RecommendModal>
                <div className='title'>ว้าว! ทำงานใกล้เสร็จแล้ว</div>
                <div className='text'>มีงานมากมายรอคุณอยู่ สนใจรับงานเพิ่มไหม?</div>
                <Link to={'/worklist/'+this.state.recommend}><Button>ค้นหางาน</Button></Link>
                <div className='cancel' onClick={() => this.setState({modalRecommend: false})}>ไม่สนใจ</div>
              </RecommendModal>
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
    .title{
      ${AppStyle.font.main}
    }
    margin-top: 10px;
    margin-bottom: 10px;
  }
`

const InsideModal = Styled.div`

  .modal-text{
    text-align: center;
    ${AppStyle.font.read1}
  }
`

const NowTask = Styled.div`
  animation-name: fadeInUp; 
  animation-duration: ${props => props.fade+0.2}s;

  padding: 10px;
  box-sizing: border-box;
  background: ${AppStyle.color.card};

  margin-bottom: 10px;

  ${AppStyle.shadow.lv1}
  .name{
    text-align: left;
    float: left;
    ${AppStyle.font.main}
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
    width: 100%;
  }
  .piece-l{
    float: left;
    .number{
      ${AppStyle.font.main}
    }
  }
  .piece-r{
    float: right;
    .number{
      ${AppStyle.font.main}
    }
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
    width: 60px;
    height: 60px;
    background: ${AppStyle.color.main};
    border-radius: 100%;
    
    cursor: pointer;
    ${AppStyle.font.tool}
    ${AppStyle.shadow.lv2}
    position: relative;

    right: -12px;
    .border{
      position: absolute;
      border: dashed 2px ${AppStyle.color.white};
      border-radius: 100%;
      width: 50px;
      height: 50px;
      margin: 4.5px 0 0 4.5px;
      line-height: 50px;

      animation: rotate 20s infinite linear;  //Rotate

      box-sizing: border-box;
    }
    .do-text{
      position: absolute;
      text-align: center;
      line-height: 60px;
      width: 60px;
    }
  }
  .do:active{
    opacity: 0.8;
  }
  .finish{
    width: 60px;
    height: 60px;
    background: ${AppStyle.color.gray};
    border-radius: 100%;
    text-align: center;
    ${AppStyle.font.tool}
    color: ${AppStyle.color.white};
    ${AppStyle.shadow.lv2}
    .border{
      border: solid 2px ${AppStyle.color.white};
      border-radius: 100%;
      width: 50px;
      height: 50px;
      margin: 5px;
      line-height: 50px;
    }
  }

  .showDetail{
    width: 100%;
    text-align: center;
    ${AppStyle.font.read1}
  }
  .detail{
    background: ${AppStyle.color.bg2};
    margin: 0 -10px -10px -10px;
    padding: 10px;
    .c{
      clear: both;
      .do_piece{
        float: left;
      }
      .updateAt{
        float: right;
        text-align: right;
      }
    }
  }
`
const AllTask = Styled.div`
  // animation-name: fadeInRight;
  // animation-duration: ${props => props.fade+0.2}s;

  padding: 10px;
  box-sizing: border-box;
  background: ${AppStyle.color.card};

  margin-bottom: 10px;

  ${AppStyle.shadow.lv1}
  .name{
    text-align: left;
    ${AppStyle.font.main}
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
    float: left;
    width: 40%;
  }
  .piece{
    ${AppStyle.font.read1}
    float: right;
    text-align: right;
    width: 20%;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
  }
  .date{
    ${AppStyle.font.read2}
    text-align: right;
    float: right;
    width: 40%;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
  }
  .progress{
    height: 20px;
    width: 100%;
    //background: ${AppStyle.color.main};
    margin-bottom: 10px;
  }

  
  .showDetail{
    width: 100%;
    text-align: center;
    ${AppStyle.font.read1}
  }
  .detail{
    background: ${AppStyle.color.bg2};
    margin: 0 -10px -10px -10px;
    padding: 10px;
    .c{
      clear: both;
      .do_piece{
        float: left;
      }
      .updateAt{
        float: right;
        text-align: right;
      }
    }
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
      height: 40px;
      line-height: 40px;
      ${AppStyle.font.read1}
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
  }



  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const HolidayModal = Styled.div`
  .submit{
    width: 50%;
    float: left;
    text-align: center;
    ${AppStyle.font.menu}
    color: ${AppStyle.color.main};
    cursor: pointer;
  }
  .cancel{
    width: 50%;
    float: left;
    text-align: center;
    ${AppStyle.font.menu}
    cursor: pointer;
  }
  .name{
    ${AppStyle.font.main}
    text-align: center;
    font-size: 24px;
  }
  .countdown{
    ${AppStyle.font.main}
    text-align: center;
  }
  .text{
    text-align: center;
  }
`

const RecommendModal = Styled.div`
  .title{
    ${AppStyle.font.main}
    text-align: center;
  }
  .text{
    text-align: center;
    margin-bottom: 10px;
  }
  .cancel{
    color: ${AppStyle.color.main};
    text-align: center;
    margin-top: 10px;
  }
`