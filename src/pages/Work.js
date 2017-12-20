import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'
import ToolBar from '../layouts/ToolBar'

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
    }
  }

  componentDidMount() {
    const work_id = this.props.routeParams.id
    const _this = this

    auth.onAuthStateChanged(user => {
      user
        ?getUser('employee', user => {
          this.setState({user})
        })
        :browserHistory.push('/login')
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
    
    db.collection('needWork').add({
      employer_id: employer.employer_id,

      work_id: work.work_id,
      work_name: work.data.name,
      startAt: work.data.startAt,

      employee_id: user.uid,
      employee_name: `${user.data.fname} ${user.data.lname}`,
      employee_phone: user.data.phone,

      pack: 1, //user ต้องการจำนวนกี่ชิ้น 
      deviceToken: user.data.deviceToken,
    })
  }

  render() {
    const { work, employer } = this.state
    const { data } = work

    return (
      <Style>
        <ToolBar
          title={this.props.route.title} 
          left={() => browserHistory.goBack()} 
          // right={e => this.handleRegister(e)}
          />
          <img className="imageWork" src="http://a.lnwfile.com/_/a/_raw/j2/zv/up.jpg"/>

          <div classname="container">

            <div className="row">
              <div className="col-6">
                {data.name}
              </div>
              <div className="col-6">
                {data.piece} ชิ้น {data.price*data.piece} บาท
              </div>
            </div>

            <div className="row">
              <div className="col-3">
                {data.sendBy}
              </div>
              <div className="col-3">
                {data.startAt}
              </div>
              <div className="col-3">
                {data.endAt}
              </div>
              <div className="col-3">
                {data.worktime}
              </div>
            </div>

            <div className="row">
              <div className="col-3">
                <img className="imageTool" src=""/>
              </div>
              <div className="col-9">
                {data.tool}
              </div>
            </div>

            <div className="row">
              <div className="col-12">
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

          <button className="needWork" onClick={e => this.handleNeedWork(e)}> รับงาน </button>
      </Style>
    );
  }
}

export default Login;

const Style = Styled.div`
  .imageWork{
    width: 100%;
    height: 230px;
  }
  .needWork{
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
  }
`