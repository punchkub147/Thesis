import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { register, getUser, updateAt, db } from '../../api/firebase'
import { getToken } from '../../api/notification'

import Layout from '../../layouts'
import ToolBar from '../../layouts/ToolBar'

const isEmpty = (data) => {
  return data === ""?true:false
}

class Register2 extends Component {

  state = {
    user: {
      uid: '',
      data: {
        fname: '',
        lname: '',
        phone: '',
        personId: '',
        //address
          area: '',
          district: '',
          homeNo: '',
          postCode: '',
          province: '',
          road: '',
      }
    }
  }

  async componentDidMount() {
    getUser('employee', user => {
      this.setState({
        user: user
      })
    })
  }

  handleProfile = async (e) => {
    e.preventDefault();
    const { user } = this.state

    if(isEmpty(user.data.fname) && isEmpty(user.data.lname) && isEmpty(user.data.phone) && isEmpty(user.data.personId)) {
      console.log('ERRORRRR')
    }else{
      await updateAt('employee', user.uid, user.data)
      browserHistory.push({pathname: '/register3', state: { goNext: true }})
    }
  }

  handleChangeUser = (e, ref) => {
    const { user } = this.state
    const { data } = user
    this.setState({
      user: {
        ...user,
        data: {
          ...data,
          [ref]: e.target.value
        }
      }
    })
  }
  // handleChangeAddress = (e, ref) => {
  //   const { user } = this.state
  //   const { data } = user
  //   const { address } = data
  //   this.setState({
  //     user: {
  //       ...user,
  //       data: {
  //         ...data,
  //         address: {
  //           ...address,
  //           [ref]: e.target.value
  //         }
  //       }
  //     }
  //   })
  // }

  render() {
    const moveNext = _.get(this.props.location.state,'goNext')
    const user = _.clone(this.state.user.data)
    return (
      <Style moveNext={moveNext}>
        <div id="Register2">
          <ToolBar
            title={this.props.route.title} 
            // left={() => browserHistory.push({pathname: '/register', state: { goNext: false }})} 
            // right={e => this.handleProfile(e)}
            />
          <div className="content">
            <form className="mui-form" onSubmit={e => this.handleProfile(e)}>
        
              <div className="mui-textfield mui-textfield--float-label haft">
                <input type="text" 
                  value={user['fname']?user['fname']:''} 
                  onChange={e => this.handleChangeUser(e, 'fname')}/>
                <label>ชื่อจริง</label>
              </div>
          
              <div className="mui-textfield mui-textfield--float-label haft">
                <input type="text" 
                  value={user['lname']} 
                  onChange={e => this.handleChangeUser(e, 'lname')}/>
                <label>นามสกุล</label>
              </div>
          
              <div className="mui-textfield mui-textfield--float-label">
                <input type="text" 
                  value={user['phone']} 
                  onChange={e => this.handleChangeUser(e, 'phone')}/>
                <label>เบอร์ติดต่อ</label>
              </div>

              <div className="mui-textfield mui-textfield--float-label">
                <input type="text" 
                  value={user['personId']} 
                  onChange={e => this.handleChangeUser(e, 'personId')}/>
                <label>รหัสประจำตัวประชาชน</label>
              </div>

              <legend>สถานที่รับงาน</legend>

              <div className="mui-textfield mui-textfield--float-label haft">
                <input type="text" 
                  value={user['homeNo']} 
                  onChange={e => this.handleChangeUser(e, 'homeNo')}/>
                <label>เลขที่บ้าน</label>
              </div>
              <div className="mui-textfield mui-textfield--float-label haft">
                <input type="text" 
                  value={user['road']} 
                  onChange={e => this.handleChangeUser(e, 'road')}/>
                <label>ถนน</label>
              </div>
              <div className="mui-textfield mui-textfield--float-label haft">
                <input type="text" 
                  value={user['area']} 
                  onChange={e => this.handleChangeUser(e, 'area')}/>
                <label>เขต</label>
              </div>
              <div className="mui-textfield mui-textfield--float-label haft">
                <input type="text" 
                  value={user['district']} 
                  onChange={e => this.handleChangeUser(e, 'district')}/>
                <label>แขวง</label>
              </div>
              <div className="mui-textfield mui-textfield--float-label haft">
                <input type="text" 
                  value={user['province']} 
                  onChange={e => this.handleChangeUser(e, 'province')}/>
                <label>จังหวัด</label>
              </div>
              <div className="mui-textfield mui-textfield--float-label haft">
                <input type="text" 
                  value={user['postcode']} 
                  onChange={e => this.handleChangeUser(e, 'postcode')}/>
                <label>ไปรษณีย์</label>
              </div>

              <button className="mui-btn" type="submit" onSubmit={e => this.handleProfile(e)}>ต่อไป</button>
            
            </form>
          </div>
        </div>
      </Style>
    );
  }
}

export default Register2;

const Style = Styled.div`
  #Register2{
    .content{
      animation-name: ${props => props.moveNext === true?'fadeInRight':'fadeInLeft'};
      animation-duration: 0.2s;
    }
    .haft{
      // width: 45%;
      // float: left;
      // margin-right: 10px;
    }
    button{
      width: 100%;
    }
  }
`
