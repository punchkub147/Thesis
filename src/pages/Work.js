import React, { Component } from 'react'
import { browserHistory, Link } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import { auth, db, getUser } from '../api/firebase'
import { secToText } from '../functions/moment'
import { phoneFormatter, distance } from '../functions/'
import { BottomButton } from '../components'
import Alarm from '../img/alarm.png'
import Send from '../img/send.png'
import Back from '../img/back2.png'
import { message } from 'antd'

export default class extends Component {
  state = {
    work: {
      work_id: '',
      data: {},
    },
    employer: {
      employer_id: '',
      data: {},
    },
    user: store.get('employee'),
    abilities: store.get('abilities'),

    needWork: [],
    needStartAt: '',
    needEndAt: '',
    loading: false
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const work_id = this.props.routeParams.id
    const _this = this
    const { user } = this.state

    if(!work_id)browserHistory.push('/search')
    auth.onAuthStateChanged(user => {
      !user
        ?console.log("กรุณาเข้าสู่ระบบ")
        :getUser('employee', user => {
          this.setState({user})
        })
    })

    db.collection('works').doc(work_id)
    .onSnapshot(async work => {
      
      let nextRound = _.find(work.data().round, function(o) { return o.startAt > new Date })
      if(!nextRound)nextRound = _.find(work.data().round, function(o) { return o.startAt < new Date })
      


      db.collection('employer').doc(work.data().employer_id)
      .onSnapshot(async employer => {

        _this.setState({
          work: {
            work_id,
            data: Object.assign(work.data(), {
              startAt: nextRound.startAt,
              endAt: nextRound.endAt,
            }),
          },
          employer: {
            employer_id: employer.id,
            data: employer.data&&Object.assign(employer.data(),{
              distance: distance(
                _.get(employer.data(),'address.lat'),
                _.get(employer.data(),'address.lng'),
                _.get(user,'data.address.lat'),
                _.get(user,'data.address.lng'),
                'K'
              )
            })
          },
        })
        if(this.state.needStartAt == ''){
          this.setState({
            needStartAt: nextRound.startAt,
            needEndAt: nextRound.endAt,
          })
        }
      })
    })

    db.collection('abilities')
    .onSnapshot(snap => {
      const abilities = []
      snap.forEach(doc => {
        abilities[doc.id] = doc.data()
      })
      this.setState({abilities})
      store.set('abilities',abilities)
    })

    if(user){
      db.collection('needWork').where('employee_id', '==', user.uid).onSnapshot(snap => {
        let needWork = []
        snap.forEach(need => {
          if(need.data().work_id == work_id){
            needWork.push(need.data())
          }
        })
        this.setState({needWork})
      })
    }

  }

  handleNeedWork = async (e, canRequest, needworked) => {
    e.preventDefault()
    const { user, work, employer, needStartAt, needEndAt } = this.state
    if(!user){
      message.info('กรุณาเข้าสู่ระบบ')
      return
    }
    if(user.uid){

      if(canRequest-needworked<=0){
        message.info('เวลาทำงานไม่เพียงพอ แนะนำให้เพิ่มเวลาทำงาน')
        return
      }

      const needWork = {
        employer_id: employer.employer_id,
  
        work_id: work.work_id,
        work: work.data,
        work_name: work.data.name,
        startAt: needStartAt,
        endAt: needEndAt,
  
        employee_id: user.uid,

        employee: Object.assign(user.data, {employee_id: user.uid}),

        employee_name: `${user.data.fname} ${user.data.lname}`,
        employee_phone: user.data.phone,
  
        pack: 1, //user ต้องการจำนวนกี่ชิ้น 
        deviceToken: user.data.deviceToken,
        createAt: new Date,
      }
      this.setState({loading: true})

      await db.collection('works').doc(work.work_id).update({
        needWork: work.data.needWork?work.data.needWork+1:1
      })

      await db.collection('needWork').add(_.pickBy(needWork, _.identity))
      .then(data => {
        message.info('รับงานเรียบร้อย')
      })
      this.setState({loading: false})
    }else{
      message.info('กรุณาเข้าสู่ระบบ')
    }
  }

  handleNeedRound = (e) => {
    const { round } = this.state.work.data
    const r = round[e.target.value]
    this.setState({
      needStartAt: r.startAt,
      needEndAt: r.endAt
    })
  }

  render() {
    const { work, employer, user, needStartAt, needEndAt, needWork, loading } = this.state
    const { data } = work
    const countAllDay = -moment(needStartAt).diff(needEndAt, 'days')+1
    const worktimeBetween = _.range(countAllDay).reduce((time,i) => {
      if(user){
        const day = moment(needStartAt).add(i, 'days').locale('en')//วัน
        if(user.data.workTime){
          let dayWorkTime = user.data.workTime[day.format('ddd').toLowerCase()]
          if(user.data.holiday&&user.data.holiday[day.format('DD/MM/YY')] === true)dayWorkTime = 0 //วันหยุด Holiday
          return time += dayWorkTime
        }
      }
    }, 0)
    const canRequest = Math.floor(worktimeBetween/(data.piece*data.worktime))
    const needworked = _.filter(needWork, ['startAt', needStartAt]).length
    const MainDetail = (
      <div className="row card">
        <div className="col-12 name">
          {data.name}
        </div>
        <div className="col-6 pack">
        {data.cost&&data.cost>0
          ?`ค่ามัดจำ ${data.cost} บาท`
          :'ไม่มีค่ามัดจำ'
        }
        </div>
        <div className="col-6 price">
          {data.piece} ชิ้น {data.price*data.piece} บาท
        </div>
      </div>
    )
    const SubDetail = (
      <div className="row card">
        <div className="col-12">
          <div className='card-title'>รายละเอียดงาน</div>
          <div className='card-read'>{data.detail}</div>
        </div>
      </div>
    )
    const ConditionDetail = (
      <div className="row card">
        <div className="col-12">
          <div className='card-title'>เงื่อนไข</div>
          <div className='card-read'>{data.condition}</div>
        </div>
      </div>
    )
    const SendDetail = (
      <div className="row card">
          <div className="col-12">
            <div className='card-title'>รายละเอียดการจัดส่ง</div>
            <div className='card-read'>
              วิธีการจัดส่งโดย {data.sendBy}
            </div>
          </div>
      </div>
    )
    const TimeDetail = (
      <div className="row card">
        <div className="col-12">
          <div className='card-title'>รายละเอียดเวลาการทำงาน</div>
          <div className='card-read'>
            เลือกวันที่เริ่มงาน - วันที่เสร็จงาน
            <select onChange={(e) => this.handleNeedRound(e)}>
            {_.map(data.round, (round, key) => 
              moment(round.startAt) > moment() &&
                <option value={key}>
                  {moment(round.startAt).format('DD/MM/YY') + ' - ' + moment(round.endAt).format('DD/MM/YY')}
                </option>
            )}
            </select>
          </div>
        </div>
        <div className="col-6">
        {canRequest>0
          ?`คุณสามารถรับได้ ${canRequest} ชุด`
          :'เวลาว่างไม่พอทำงาน'
        }
        </div>
        <div className="col-6" style={{'text-align': 'right'}}>
          รับไปแล้ว {needworked} ชุด
        </div>
      </div>
    )
    const ToolsDetail = (
      <div className="row card">
        <div className="col-12">
          <div className='card-title'>อุปกรณ์การทำงาน</div>
          <div className='card-read'>
            {data.tool}
          </div>
        </div>
      </div>
    )
    const EmployerDetail = (
      <Link to={`/employer/${employer.employer_id}`}>
      <div className="employer row card">
        <div className="imageEmployer">
          <img className="" alt='' src={employer.data.imageProfile}/>
        </div>
        <div className="detail">
          <div className='name'>
            {employer.data.name}
          </div>
          <div className='phone'>
            {phoneFormatter(employer.data.phone)}
          </div>
          <div className='address'>
            ({_.get(employer.data,'distance')} กม.) {_.get(employer.data,'address.address')}
          </div>
        </div>
      </div>
      </Link>
    )

    return (
      <Style>
        <div className="goback" onClick={() => browserHistory.goBack()}>
          <img alt='' src={Back}/>
        </div>
        <div className="imageWork">          
          <img alt='' src={data.image}/>
        </div>
        <div className="container">
          {MainDetail}
          {TimeDetail}
          {EmployerDetail}
          {SendDetail}
          {SubDetail}
          {ConditionDetail}
          {ToolsDetail}
        </div>
        <BottomButton onClick={e => this.handleNeedWork(e, canRequest, needworked)} disabled={loading}>รับงาน</BottomButton>
      </Style>
    )
  }
}

const Style = Styled.div`
  .imageWork{
    position: relative;
    width: 100%;
    height: 230px;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}

    img{
      object-fit: cover;
      width: 100%;
      height: 100%;
      // animation-name: fadeInDown;
      // animation-duration: 0.5s;
    }
  }
  .goback{
    position: fixed;
    left: 10px;
    top: 10px;
    height: 50px;
    width: 50px;
    cursor: pointer;
    z-index: 1;
    img{
      width: 25px;
      height: 25px;
    }
  }
  .container{
    
    position: relative;
    margin-top: -25px; 
  }
  .card{
    background: ${AppStyle.color.card};
    padding: 10px 0;
    margin: 0;
    margin-bottom: 10px;
    ${AppStyle.shadow.lv1}

    animation-name: fadeInUp;
    animation-duration: 0.5s;
  }
  .price{
    text-align: right;
    ${AppStyle.font.hilight}
  }
  .name{
    ${AppStyle.font.main}
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
  }
  .pack{
    ${AppStyle.font.read1}
    text-align: left;
  }
  .sendBy{
    text-align: center;
    img{
      width: 30px;
      height: 30px;
    }
  }
  .startAt{
    text-align: center;
    .text{
      ${AppStyle.font.read1}
    }
  }
  .endAt{
    text-align: center;
    .text{
      ${AppStyle.font.read1}
    }
  }
  .workTime{
    text-align: center;
    img{
      width: 30px;
      height: 30px;
    }
  }


  .employer{
    padding: 10px;
    .imageEmployer{
      width: 75px;
      height: 75px;
      float: left;
      img{
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .detail{
      width: 200px;
      float: left;
      margin-left: 10px;
      .name{
        ${AppStyle.font.read1}
        float: left;
      }
      .phone{
        ${AppStyle.font.read2}
        float: left;
        margin-left: 10px;
      }
      .address{
        clear: both;
        ${AppStyle.font.read2}
        line-height: 20px;
      }
    }
  }

  select{
    background: transparent;
    padding: 0;
  }

  .card-title{
    ${AppStyle.font.read1}
  }
  .card-read{
    line-height: 20px;
  }
`