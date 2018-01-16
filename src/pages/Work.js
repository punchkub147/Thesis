import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import moment from 'moment'

import Layout from '../layouts'
import ToolBar from '../layouts/ToolBar'
import BottomButton from '../components/BottomButton'

import Alarm from '../img/alarm.png'
import Send from '../img/send.png'
import Back from '../img/back.png'

import { auth, db, getUser } from '../api/firebase'

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
    user: {
      uid: '',
      data: {},
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    const work_id = this.props.routeParams.id
    const _this = this

    auth.onAuthStateChanged(user => {
      !user
        ?console.log("กรุณาเข้าสู่ระบบ")
        :getUser('employee', user => {
          this.setState({user})
        })
    })

    db.collection('works').doc(work_id)
    .onSnapshot(async work => {
      //console.log("Current data: ", work && work.data());
      db.collection('employer').doc(work.data().employer_id)
      .onSnapshot(async employer => {
        //console.log("Current Employer: ", employer && employer.data());
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
  }

  handleNeedWork = (e) => {
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
      }
      db.collection('needWork').add(_.pickBy(needWork, _.identity))
      .then(data => {
        alert("รับงานเรียบร้อย")
      })
    }else{
      alert("กรุณาเข้าสู่ระบบ")
    }
  }

  render() {
    const { work, employer } = this.state
    const { data } = work

    return (
      <Style>
        <div id="Work">

            <div className="imageWork">          
              <div className="goback" onClick={() => browserHistory.goBack()}>
                <img src={Back}/>
              </div>
              <img src={data.image}/>
            </div>
          
            <div className="container">
          
              <div className="row card">
                <div className="col-7 name">
                  {data.name}
                </div>
                <div className="col-5 price">
                  {data.piece} ชิ้น {data.price*data.piece} บาท
                </div>
              </div>
          
              <div className="row card">
                <div className="col-3 sendBy">
                  <img src={Send}/><br/>
                  {data.sendBy}
                </div>
                <div className="col-3 startAt">
                  <div>เริ่มงาน</div>
                  {moment(data.startAt).locale('th').fromNow()}
                </div>
                <div className="col-3 endAt">
                  <div>รับงาน</div>
                  {moment(data.endAt).locale('th').fromNow()}
                </div>
                <div className="col-3 workTime">
                  <img src={Alarm}/><br/>
                  {data.worktime}
                </div>
              </div>
          
              <div className="row card">
                <div className="col-12">เครื่องมือ</div>
                <div className="col-3">
                  <img className="imageTool" src=""/>
                </div>
                <div className="col-9">
                  {data.tool}
                </div>
              </div>
          
              <div className="row card">
                <div className="col-12">
                  รายละเอียด<br/>
                  {data.detail}
                </div>
              </div>
          
              <div className="row">
                <div className="col-3">
                  <img className="imageEmployer" src={employer.data.image}/>
                </div>
                <div className="col-3">
                  {employer.data.name}
                  {employer.data.phone}
                  {employer.data.address}
                </div>
              </div>
            </div>

          <BottomButton onClick={e => this.handleNeedWork(e)}>รับงาน</BottomButton>
          
        </div>
      </Style>
    );
  }
}

export default Login;

const Style = Styled.div`
#Work{
  .imageWork{
    position: relative;
    width: 100%;
    height: 230px;
    background: ${AppStyle.color.card};
    .goback{
      position: absolute;
      left: 15px;
      height: 50px;
      width: 50px;
      cursor: pointer;
      img{
        margin-top: 12.5px;
        width: 25px;
        height: 25px;
      }
    }
    img{
      object-fit: cover;
      width: 100%;
      height: 100%;
      animation-name: fadeInDown;
      animation-duration: 0.5s;
    }
  }
  .container{
    animation-name: fadeInUp;
    animation-duration: 0.5s;
  }
  .card{
    background: ${AppStyle.color.card};
    padding: 10px 0;
    margin-bottom: 10px;
  }
  .price{
    text-align: right;
    ${AppStyle.font.hilight}
  }
  .name{
    ${AppStyle.font.main}
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
  }
  .endAt{
    text-align: center;
  }
  .workTime{
    text-align: center;
    img{
      width: 30px;
      height: 30px;
    }
  }
}
`