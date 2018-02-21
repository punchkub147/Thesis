import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import BottomButton from '../components/BottomButton'

import Alarm from '../img/alarm.png'
import Send from '../img/send.png'
import Back from '../img/back2.png'

import { auth, db, getUser } from '../api/firebase'

import { message } from 'antd';

class Login extends Component {

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
    abilities: store.get('abilities')
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const work_id = this.props.routeParams.id
    const _this = this

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
      db.collection('employer').doc(work.data().employer_id)
      .onSnapshot(async employer => {
        _this.setState({
          work: {
            work_id,
            data: work.data()
          },
          employer: {
            employer_id: employer.id,
            data: employer.data()
          }
        })
      });
    });

    db.collection('abilities')
    .onSnapshot(snap => {
      const abilities = []
      snap.forEach(doc => {
        abilities[doc.id] = doc.data()
      })
      this.setState({abilities})
      store.set('abilities',abilities)
    })
  }

  handleNeedWork = async (e) => {
    e.preventDefault();
    const { user, work, employer } = this.state
    
    if(user.uid){
      const needWork = {
        employer_id: employer.employer_id,
  
        work_id: work.work_id,
        work_name: work.data.name,
        startAt: work.data.startAt,
  
        employee_id: user.uid,
        employee_name: `${user.data.fname} ${user.data.lname}`,
        employee_phone: user.data.phone,
  
        pack: 1, //user ต้องการจำนวนกี่ชิ้น 
        deviceToken: user.data.deviceToken,
        createAt: new Date,
      }

      await db.collection('works').doc(work.work_id).update({
        needWork: work.needWork?work.needWork+1:1
      })

      await db.collection('needWork').add(_.pickBy(needWork, _.identity))
      .then(data => {
        message.info('รับงานเรียบร้อย');
      })
    }else{
      message.info('กรุณาเข้าสู่ระบบ');
    }
  }

  render() {
    const { work, employer, user } = this.state
    const { data } = work
    const countAllDay = -moment(data.startAt).diff(data.endAt, 'days')+1

    console.log('workData', data)
    console.log('userrr', user.data.holiday)
    console.log('จำนวนวัน',countAllDay)

    let worktimeBetween = 0
    for(let i = 0; i< countAllDay; i++){
      const day = moment(data.startAt).add(i, 'days').locale('en')//วัน
      let dayWorkTime = user.data.workTime[day.format('ddd').toLowerCase()]
      if(user.data.holiday&&user.data.holiday[day.format('DD/MM/YY')] === true)dayWorkTime = 0 //วันหยุด Holiday

      worktimeBetween += dayWorkTime
    }
    const canRequest = Math.floor(worktimeBetween/(data.piece*data.worktime))

    return (
      <Style>
        <div className="goback" onClick={() => browserHistory.goBack()}>
          <img alt='' src={Back}/>
        </div>
        <div className="imageWork">          
          <img alt='' src={data.image}/>
        </div>
        
        <div className="container">
        
          <div className="row card">
            <div className="col-7 name">
              {data.name}
            </div>
            <div className="col-5 price">
              {data.piece} ชิ้น {data.price*data.piece} บาท
            </div>
            <div className="col-6 cost">
              เหลือ {data.pack} ชุด
            </div>
            <div className="col-6 pack">
              ค่ามัดจำ {data.cost} บาท
            </div>
          </div>

          <div className="row card">
            
            <div className="col-6 cost">
              มีเวลทำ {countAllDay} วัน
            </div>
            <div className="col-6 pack">
            {canRequest>0
              ?`สามารถรับได้ ${canRequest} ชุด`
              :'เวลาว่างไม่พอทำงาน'
            }
            </div>
            <div className="col-6 cost">
              คุณว่าง {worktimeBetween} วินาที
            </div>
            <div className="col-6 pack">
              เวลาต่อชุด {data.piece*data.worktime} วินาที
            </div>
            
          </div>
        
          <div className="row card">
            <div className="col-3 sendBy">
              <img alt='' src={Send}/><br/>
              {data.sendBy}
            </div>
            <div className="col-3 startAt">
              <div className='text'>เริ่มส่ง</div>
              {moment(data.startAt).format('DD/MM/YY')}
            </div>
            <div className="col-3 endAt">
              <div className='text'>ส่งกลับ</div>
              {moment(data.endAt).format('DD/MM/YY')}
            </div>
            <div className="col-3 workTime">
              <img alt='' src={Alarm}/><br/>
              {(data.worktime>=60)
                ?'~ ' + data.worktime/60 + ' นาที'
                :data.worktime + ' วินาที'
              }
            </div>
          </div>
        
          {/*
          <div className="row card">
            <div className="col-12">เครื่องมือ</div>
            <div className="col-3">
              <img className="imageTool" alt='' src=""/>
            </div>
            <div className="col-9">
              {data.tool}
            </div>
          </div>
          */}
        
          <div className="row card">
            <div className="col-12">
              รายละเอียด<br/>
              {data.detail}
            </div>
          </div>
        
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
                {employer.data.phone}
              </div>
              <div className='address'>
                {employer.data.homeNo&&`${employer.data.homeNo} `}
                {employer.data.road&&`ถ. ${employer.data.road} `}
                {employer.data.area&&`ข. ${employer.data.area} `}
                {employer.data.district&&`ข. ${employer.data.district} `}
                {employer.data.province&&`จ. ${employer.data.province} `}
                {employer.data.postcode&&`${employer.data.postcode} `}
              </div>
            </div>
          </div>
          </Link>

        </div>

        <BottomButton onClick={e => this.handleNeedWork(e)}>รับงาน</BottomButton>
      </Style>
    );
  }
}

export default Login;

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
  }
  .pack{
    ${AppStyle.font.read1}
    text-align: right;
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
      }
    }
  }
`