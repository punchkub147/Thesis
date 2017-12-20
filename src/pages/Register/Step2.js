import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { register, getUser, updateAt, db, auth } from '../../api/firebase'
import { getToken } from '../../api/notification'

import Layout from '../../layouts'
import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

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
    await getUser('employee', user => {
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
      browserHistory.push('/register3')
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
    const user =this.state.user.data
    return (
      <Style >
        <div id="Register2">
          <ToolBar
            title={this.props.route.title} 
            // left={() => browserHistory.push({pathname: '/register', state: { goNext: false }})} 
            // right={e => this.handleProfile(e)}
            />

          <Step/>
          <div className="content">
            <form className="" onSubmit={e => this.handleProfile(e)}>

                <input type="text" 
                  value={user['fname']?user['fname']:''} 
                  placeholder="ชื่อจริง"
                  onChange={e => this.handleChangeUser(e, 'fname')}/>
                <input type="text" 
                  value={user['lname']} 
                  placeholder="นามสกุล"
                  onChange={e => this.handleChangeUser(e, 'lname')}/>
                <input type="text" 
                  value={user['phone']} 
                  placeholder="เบอร์โทรศัพท์"
                  onChange={e => this.handleChangeUser(e, 'phone')}/>
                <input type="text" 
                  value={user['personId']} 
                  placeholder="รหัสประจำตัวประชาชน"
                  onChange={e => this.handleChangeUser(e, 'personId')}/>

                <div>สถานที่รับงาน</div>
                
                <input type="text" 
                  value={user['homeNo']} 
                  placeholder="บ้านเลขที่"
                  onChange={e => this.handleChangeUser(e, 'homeNo')}/>
                <input type="text" 
                  value={user['road']} 
                  placeholder="ถนน"
                  onChange={e => this.handleChangeUser(e, 'road')}/>
                <input type="text" 
                  value={user['area']} 
                  placeholder="เขต"
                  onChange={e => this.handleChangeUser(e, 'area')}/>
                <input type="text" 
                  value={user['district']} 
                  placeholder="แขวง"
                  onChange={e => this.handleChangeUser(e, 'district')}/>
                <input type="text" 
                  value={user['province']} 
                  placeholder="จังหวัด"
                  onChange={e => this.handleChangeUser(e, 'province')}/>
                <input type="text" 
                  value={user['postcode']} 
                  placeholder="รหัสไปรษณีย์"
                  onChange={e => this.handleChangeUser(e, 'postcode')}/>

              <button type="submit" onSubmit={e => this.handleProfile(e)}>ต่อไป</button>
            
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
      animation-name: fadeInRight;
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
