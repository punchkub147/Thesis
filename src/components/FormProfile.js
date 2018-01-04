import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import { db, getUser, updateAt, storage } from '../api/firebase'

import ToolBar from '../layouts/ToolBar'
import Step from '../components/Step'

import image from '../img/logo-xl.png'
import BottomButton from '../components/BottomButton';

const isEmpty = (data) => {
  return data === ""?true:false
}

class FormProfile extends Component {

  state = {
    user: {
      uid: '',
      data: {
        profileImage: '',
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
    },
    image64: '',
  }

  async componentDidMount() {
    // console.log(store.get('employee'))
    this.setState({
      user: store.get('employee')
    })
    await getUser('employee', user => {
      this.setState({user})
      store.set('employee',user)
    })
  }

  handleProfile = async (e) => {
    e.preventDefault();
    const { user } = this.state

    if(isEmpty(user.data.fname) && isEmpty(user.data.lname) && isEmpty(user.data.phone) && isEmpty(user.data.personId)) {
      console.log('ERRORRRR')
    }else{
      await updateAt('employee', user.uid, user.data)
      browserHistory.push(this.props.push)
    }
  }

  handleChangeProfile = (e, ref) => {
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

  handleChangeImage = async (e) => {
    const _this = this;
    const file = e.target.files[0];
    var reader = await new FileReader();
    reader.readAsDataURL(file);
    reader.onload = await function () {
      _this.setState({ 
        image64: reader.result
      })
    };
    reader.onerror = await function (error) {
      console.log('Error: ', error);
    };

    this.storageImage(file)
  }

  storageImage = async (file) => {
    const { user } = this.state
    const { data } = user
    const imageId = this.state.user.uid
    const storageImage = await storage.child('employee').child(imageId);
    await storageImage.put(file);
    const imageUri = await storageImage.getDownloadURL();
    this.setState({
      user: {
        ...user,
        data: {
          ...data,
          profileImage: imageUri
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
    const user = this.state.user.data
    const { image64 } = this.state

    return (
      <Style>
        <div id="FormProfile">

          <div className="container">
            <form className="" onSubmit={this.handleProfile}>
              <div className="row justify-content-center">
                <img className="profileImage" src={user['profileImage']}/>
              </div>
              <input type="file" 
                onChange={this.handleChangeImage}
              />
              <input type="text" 
                value={user['fname']} 
                placeholder="ชื่อจริง"
                required
                onChange={e => this.handleChangeProfile(e, 'fname')}/>
              <input type="text" 
                value={user['lname']} 
                placeholder="นามสกุล"
                required
                onChange={e => this.handleChangeProfile(e, 'lname')}/>
              <input type="text" 
                value={user['phone']} 
                placeholder="เบอร์โทรศัพท์"
                required
                onChange={e => this.handleChangeProfile(e, 'phone')}/>
              <input type="text" 
                value={user['personId']} 
                placeholder="รหัสประจำตัวประชาชน"
                required
                onChange={e => this.handleChangeProfile(e, 'personId')}/>

              <div>สถานที่รับงาน</div>

              <input type="text" 
                value={user['homeNo']} 
                placeholder="บ้านเลขที่"
                onChange={e => this.handleChangeProfile(e, 'homeNo')}/>
              <input type="text" 
                value={user['road']} 
                placeholder="ถนน"
                onChange={e => this.handleChangeProfile(e, 'road')}/>
              <input type="text" 
                value={user['area']} 
                placeholder="เขต"
                onChange={e => this.handleChangeProfile(e, 'area')}/>
              <input type="text" 
                value={user['district']} 
                placeholder="แขวง"
                onChange={e => this.handleChangeProfile(e, 'district')}/>
              <input type="text" 
                value={user['province']} 
                placeholder="จังหวัด"
                onChange={e => this.handleChangeProfile(e, 'province')}/>
              <input type="text" 
                value={user['postcode']} 
                placeholder="รหัสไปรษณีย์"
                onChange={e => this.handleChangeProfile(e, 'postcode')}/>

              {/*<button type="submit" onSubmit={this.handleProfile}>ต่อไป</button>*/}
            </form>
            
          </div>
        <BottomButton onClick={this.handleProfile}>ยืนยัน</BottomButton>
        </div>
      </Style>
    );
  }
}

export default FormProfile;


const Style = Styled.div`
  #FormProfile{
    padding-top: 20px;
    .animate{
      animation-name: fadeInUp;
      animation-duration: 0.3s;
    }
    .profileImage{
      width: 135px;
      height: 135px;
      border-radius: 100%;
      background: #ccc;
      object-fit: cover;
      margin: 0 auto;
      text-align: center;
      img{
        width: 100%;
      }
    }
    .haft{
      // width: 45%;
      // float: left;
      // margin-right: 10px;
    }
    button{
      width: 100%;
    }
    .error{
      border: solid 2px red;
    }
  }
`
