import React, { Component } from 'react'
import { Link } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import holiday from '../config/holiday'
import { Slider, Icon } from 'antd'
import { getUser, db } from '../api/firebase'
import { getWorks, quality } from '../functions'
import { secToTime, secToText, setDayHilight } from '../functions/moment'
import { getTasks, genNowWorking, genAllWorking, taskDoing } from '../functions/task'
import Layout from '../layouts'
import Tabbar from '../layouts/Tabs'
import {Content, Progress, Button, Modal, WorkItem, WorkItem2} from '../components'
import alarm2 from '../img/alarm2.png'

export default class extends Component {
  state = {
    user: store.get('employee'),
    tasks: store.get('tasks'),
    limitWorkTimeToDay: 0,
    totalTimeAllWork: 0,
    doing: 0,
    modalIsOpen: false,
    modalDoing: false,
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
    }
    await this.setNextHoliday()
    await this.getWorking(user)
    getWorks(works => this.setState({works}))
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
    await holiday.map(holiday => {
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
    if(_.indexOf(showAllDetail, working_id) == -1){
      showAllDetail.push(working_id)
    }else{
      _.pull(showAllDetail, working_id)
    }
    this.setState({
      showAllDetail
    })
  }
  handleStartDo = (working) => {
    let { do_piece } = working
    if(!do_piece){
      do_piece=[{
        startAt: new Date
      }]
    }else if(_.filter(do_piece, o => o.startAt&&!o.endAt ).length > 0){
      return
    }else{
      do_piece.push({
        startAt: new Date
      })
    }
    db.collection('working').doc(working.working_id).update({do_piece})
  }
  handleOpenDoing = (working) => {
    this.setState({
      modalDoing: true,
      doWork: working,
    })
  }
  handleStopDo = async (e, working) => {
    e.preventDefault();
    this.setState({
      modalDoing: false,
    })
    ///////////////////////////////////////////
    const total_piece = working.total_piece
    const finished_piece = working.finished_piece?working.finished_piece:0
    const percent = 80
    const totalPercent = (total_piece*percent)/100
    if(finished_piece+this.state.doing >= totalPercent){
      this.setState({
        modalRecommend: true,
        recommend: working.work_id
      })
    }
    ///////////////////////////////////////////
    const { doing } = this.state
    let { do_piece } = working
    let doingAt = _.findIndex(do_piece, o => o.startAt&&!o.endAt )
    if(doingAt != -1 && doing!=0){
      do_piece[doingAt] = Object.assign(do_piece[doingAt], {
        endAt: new Date,
        updateAt: new Date,
        piece: doing,
        worktime: moment().diff(moment(do_piece[doingAt].startAt),'seconds')
      })
      await db.collection('working').doc(working.working_id).update({
        do_piece: do_piece,
        useWorktime: _.sumBy(do_piece, 'worktime')/_.sumBy(do_piece, 'piece'),
        finished_piece: _.sumBy(do_piece, 'piece')
      })
    }
    /////////////////////////////////////////////
    this.setState({
      doing: 0,
    })
  }
  render() {
    const { tasks, doWork, limitWorkTimeToDay, totalTimeAllWork, user, nextHoliday, works, showDetail, showAllDetail } = this.state
    const { nowWorking, limitTimeDayWork, totalTimeDayWork, overTimeDayWork } = genNowWorking(limitWorkTimeToDay, tasks, user)
    const nowTask = (
      <div>
      {nowWorking.map((working,i) => 
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
      <div style={{width: '100%',height: '60px'}}></div>
      </div>
    )

    const nowTask2 = (
      <div>
      {nowWorking.map((working,i) => 
        <NowTask2 fade={i*0.2}>
          <div className='row'>
            <div className='col-9'>
              <Link to={`work/${working.work_id}`}>
                <div className="name">{working.work_name}</div>
              </Link>
              <div className="piece-r">
                {'ส่ง '+moment(working.endAt).format('DD/MM/YY')}
              </div>
              <div style={{clear: 'both'}}>
                <div className="piece-l">
                  ทำไปแล้ว <span className='number'>{working.toDayFinishedPiece?working.toDayFinishedPiece:0}</span> ชิ้น
                </div>
                <div className="piece-r">
                  ต้องทำ <span className='number'>{working.limitTodo+working.overPiece}</span> ชิ้น
                </div>
              </div>
            </div>
            {working.toDayFinishedPiece>=working.limitTodo+working.overPiece
              ?<div className="finish"><div className='border'>เสร็จ</div></div>
              :working.do_piece && (_.filter(working.do_piece, o => o.startAt&&!o.endAt ).length > 0)
                ?<div className="stop" onClick={() => this.handleOpenDoing(working)}>
                  <div className='border'></div>
                  <div className='do-text'>พัก</div>
                </div>
                :<div className="do" onClick={() => this.handleStartDo(working)}>
                  <div className='border'></div>
                  <div className='do-text'>เริ่ม</div>
                </div>
            }
          </div>
          <div className='row' style={{clear: 'both'}}>
            <div className='col'>
              <div className="progress">
                <Progress now={working.toDayFinishedPiece} max={working.limitTodo+working.overPiece}/>
              </div>
            </div>
          </div>
          <Detail>
          <div className='showDetail' 
            onClick={() => this.showDetail(working.working_id)}>
            แสดงรายละเอียดการทำงาน <Icon style={{fontSize: 12}} type={showDetail[_.indexOf(showDetail, working.working_id)] == working.working_id?'up':'down'} />
          </div>
          {showDetail[_.indexOf(showDetail, working.working_id)] == working.working_id&&
            <div className='detail'>
              <div className='row'>
                <div className='col-12'>
                  <div>
                    คุณทำงาน <span className='qualityText'>{quality(working.worktime/(_.sumBy(working.do_piece, 'worktime')/_.sumBy(working.do_piece, 'piece'))*100)} </span> 
                    ({secToText(working.useWorktime?working.useWorktime:working.worktime)}ต่อชิ้น)
                  </div>
                  {/*เวลาทำงานมาตรฐาน {secToText(working.worktime)}ต่อชิ้น
                  <div>วันนี้ต้องทำงานอีก {secToText(working.timeTodo-(working.toDayFinishedPiece*working.worktime))}</div>*/}
                </div>
              </div>
              <div className='c head'>
                <div className='date'>วันที่</div>
                <div className='startAt'>เวลา</div>
                <div className='endAt'>ใช้เวลา</div>
                <div className='do_piece'>จำนวน</div>
                <div className='doingTime'>เฉลี่ยชิ้นละ</div>
              </div>
              {working.do_piece.map(detail => 
                moment(detail.updateAt).format('DD/MM') == moment().format('DD/MM')&&
                <div className='c'>
                  <div className='date'>{moment(detail.startAt).format('DD/MM')}</div>
                  <div className='startAt'>{moment(detail.startAt).format('HH:mm')}น.-{moment(detail.endAt).format('HH:mm')}น.</div>
                  <div className='endAt'>{secToText(moment(detail.endAt).diff(moment(detail.startAt),'seconds'))}</div>
                  <div className='do_piece'>{detail.piece} ชิ้น</div>
                  <div className='doingTime'>{secToText(moment(detail.endAt).diff(moment(detail.startAt),'seconds')/detail.piece)}</div>
                </div>
              )}
              <div style={{clear: 'both'}}/>
            </div>
            }
            </Detail>
        </NowTask2>
      )}
      <div style={{width: '100%',height: '60px'}}></div>
      </div>
    )

    const allWorking = genAllWorking(tasks)

    const allTask = (
      <div>
      {allWorking.map((working, i) => 
        <AllTask fade={i*0.2}>
          <div className='row'>
            <div className='col-12'>
              <Link to={`work/${working.work_id}`}>
                <div className="name">{working.work_name}</div>
              </Link>

              <div className="date">
              {working.startAt > new Date
                ?`เริ่มงาน ${moment(working.startAt).format('DD/MM/YY')}`
                :`ส่งงาน ${moment(working.endAt).format('DD/MM/YY')}`
              }
              </div>

              <div style={{clear: 'both'}}>
                <div className="piece-l">
                  ทำไปแล้ว <span className='number'>{working.finished_piece}</span> ชิ้น
                </div>
                <div className="piece-r">
                  ต้องทำ <span className='number'>{working.total_piece}</span> ชิ้น
                </div>
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
          <Detail>
          <div className='showDetail' 
            onClick={() => this.showAllDetail(working.working_id)}>
              แสดงรายละเอียดการทำงาน <Icon style={{fontSize: 12}} type={showAllDetail[_.indexOf(showAllDetail, working.working_id)] == working.working_id?'up':'down'} />
          </div>
          {showAllDetail[_.indexOf(showAllDetail, working.working_id)] == working.working_id&&
            <div className='detail'>

              <div className='row'>
                <div className='col-12'>
                  <div>
                    คุณทำงาน <span className='qualityText'>{quality(working.worktime/(_.sumBy(working.do_piece, 'worktime')/_.sumBy(working.do_piece, 'piece'))*100)} </span> 
                    ({secToText(working.useWorktime?working.useWorktime:working.worktime)}ต่อชิ้น)
                  </div>
                </div>
              </div>
              <div className='c head'>
                <div className='date'>วันที่</div>
                <div className='startAt'>เวลา</div>
                <div className='endAt'>ใช้เวลา</div>
                <div className='do_piece'>จำนวน</div>
                <div className='doingTime'>เฉลี่ยชิ้นละ</div>
              </div>
            {working.do_piece.map(detail => 
              <div className='c'>
                <div className='date'>{moment(detail.startAt).format('DD/MM')}</div>
                <div className='startAt'>{moment(detail.startAt).format('HH:mm')}น.-{moment(detail.endAt).format('HH:mm')}น.</div>
                <div className='endAt'>{secToText(moment(detail.endAt).diff(moment(detail.startAt),'seconds'))}</div>
                <div className='do_piece'>{detail.piece} ชิ้น</div>
                <div className='doingTime'>{secToText(moment(detail.endAt).diff(moment(detail.startAt),'seconds')/detail.piece)}</div>
              </div>
            )}
            <div style={{clear: 'both'}}/>
            </div>
          }
          </Detail>
          
        </AllTask>
      )}
      <div style={{width: '100%',height: '60px'}}></div>
      </div>
    )
    const tabs = [
      {
        render: <Content>{nowTask2}</Content>,
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
    if(user.data.workTime){
      const countDay = -moment().diff(moment().endOf('month'),'days')
      for(let i = 1; i<=countDay; i++){
        const day = moment().add(i, 'days').locale('en').format('ddd').toLowerCase()
        days.push(day)
        timeToEndMonth += user.data.workTime[day]
      }
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
          <div>มีเวลาว่าง {secToText(timeToEndMonth)} ถึงสิ้นเดือน</div>
        </div>
        {_.map(recommendWorks, (work, i) =>
          <WorkItem data={work} i={i}/>
        )}
        <div style={{width: '100%',height: '60px'}}></div>
      </div>
    )
    /////////////////////////////////////
    const doingStart = doWork&& _.get(_.filter(doWork.do_piece, o => o.startAt&&!o.endAt), '[0].startAt')
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
            <Modal modalIsOpen={this.state.modalDoing} mini>
              <InsideModal>
                <div className="modal-text">
                  {/*ช่วง {moment(doingStart).format('HH:mm')} น. 
                  ถึง {moment().format('HH:mm')}น.*/}
                  ใช้เวลาไป {secToText(moment().diff(doingStart, 'seconds'))}
                </div>
                <div className="modal-text">ทำงานได้ {this.state.doing} {/*จาก {(_.get(doWork,'limitTodo')+_.get(doWork,'overPiece'))-_.get(doWork,'toDayFinishedPiece')} */}ชิ้น</div>
                {/*<button onClick={() => this.setState({modalIsOpen: false})}>close</button>*/}
                <form>
                  <Slider min={0} max={(_.get(doWork,'limitTodo')+_.get(doWork,'overPiece'))-_.get(doWork,'toDayFinishedPiece')}
                    onChange={doing => this.setState({doing})}
                    value={this.state.doing}
                    style={{margin: '20px 0 30px 0'}}
                    />
                  <Button onClick={(e) => this.handleStopDo(e,doWork)}>ยืนยัน</Button>
                </form>
              </InsideModal>
            </Modal>
            <Modal modalIsOpen={this.state.modalHoliday} mini>
              <HolidayModal>
                {nextHoliday&&
                <div>
                  <div className='name'>{nextHoliday.name}</div>
                  <div className='countdown'>{moment(nextHoliday.date,'DD/MM/YY').fromNow()}</div>
                </div>
                }
                <div className='text'>คุณจะหยุดหรือไม่?</div>
                <div style={{height: 10}}/>
                <div className='btn cancel' onClick={() => this.setState({modalHoliday: false})}>ไม่หยุด</div>
                <div className='btn submit' onClick={() => this.handleHoliday(nextHoliday.date)}>หยุด</div>
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
    ${AppStyle.font.hilight}
    font-size: 18px;
  }
  .detail{
    background: ${AppStyle.color.bg1};
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

const NowTask2 = Styled.div`
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
    width: 50%;
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
      border: solid 2px ${AppStyle.color.white};
      border-radius: 100%;
      width: 50px;
      height: 50px;
      margin: 4.5px 0 0 4.5px;
      line-height: 50px;

      //animation: rotate 20s infinite linear;  //Rotate

      box-sizing: border-box;
    }
    .do-text{
      position: absolute;
      text-align: center;
      line-height: 60px;
      width: 60px;
    }
  }
  .stop{
    width: 60px;
    height: 60px;
    background: ${AppStyle.color.sub};
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
    background: ${AppStyle.color.bg2};
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

`

const Detail = Styled.div`
  .showDetail{
    width: 100%;
    text-align: center;
    ${AppStyle.font.hilight}
    font-size: 18px;

  }
  .detail{
    animation-name: fadeIn; 
    animation-duration: 0.2s;


    background: ${AppStyle.color.bg1};
    margin: 0 -10px -10px -10px;
    padding: 10px;
    .head{
      background: ${AppStyle.color.bg2};
      margin: 0 -10px;
      padding: 0 10px;
      height: 30px;
      font-weight: bold;
      margin-top: 10px;
    }
    .c{
      clear: both;
      .date{
        float: left;
        width: 12%;
        text-align: left;
        overflow: hidden; 
        white-space: nowrap; 
        text-overflow:ellipsis;
      }
      .startAt{
        float: left;
        width: 29%;
        overflow: hidden; 
        white-space: nowrap; 
        text-overflow:ellipsis;
      }
      .endAt{
        float: left;
        text-align: right;
        width: 18%;
        overflow: hidden; 
        white-space: nowrap; 
        text-overflow:ellipsis;
      }
      .do_piece{
        float: left;
        text-align: right;
        width: 17%;
        overflow: hidden; 
        white-space: nowrap; 
        text-overflow:ellipsis;
      }
      .doingTime{
        float: right;
        text-align: right;
        width: 24%;
        overflow: hidden; 
        white-space: nowrap; 
        text-overflow:ellipsis;
      }
    }
  }
  .qualityText{
    color: ${AppStyle.color.sub};
    font-weight: bold;
    font-size: 20px;
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
    width: 60%;
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
  .piece-l{
    float: left;
  }
  .piece-r{
    float: right;
    text-align: right;
  }
  .number{
    ${AppStyle.font.main}
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
    background: ${AppStyle.color.bg2};
    height: 40px;
    line-height: 40px;
  }
  .cancel{
    width: 50%;
    float: left;
    text-align: center;
    ${AppStyle.font.menu}
    color: ${AppStyle.color.white};
    cursor: pointer;
    background: ${AppStyle.color.main};
    height: 40px;
    line-height: 40px;
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
    padding: 10px;
    background: ${AppStyle.color.bg2};
  }
`