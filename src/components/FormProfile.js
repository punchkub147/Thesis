import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import store from 'store'
import _ from 'lodash'
import moment from 'moment'

import { Icon } from 'antd'

import { db, getUser, updateAt, storage } from '../api/firebase'

import BottomButton from '../components/BottomButton';
import Button from '../components/Button';

import defaultImage from '../img/profile2.png'
import { amphoes, changwats, tambons } from '../config/address'


const isEmpty = (data) => {
  return data === ""?true:false
}


const days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const year = +moment().format('YYYY')+543-18
let years = []
for(let i = year; i > year-80; i--){
  years.push(i)
}


class FormProfile extends Component {

  state = {
    user: {
      uid: '',
      data: {
        profileImage: '',
        tname: '',
        fname: '',
        lname: '',
        phone: '',
        personId: '',
        education: '',
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
    uploading: false,
  }

  async componentDidMount() {
    this.setState({
      user: store.get('employee'),
    })
    await getUser('employee', user => {
      this.setState({user})
      store.set('employee',user)
    })
    this.setState({
      image64: this.state.user.data.profileImage
    })
  }

  handleProfile = async (e) => {
    e.preventDefault();
    let { user } = this.state

    if(!user.data.tname)user.data.tname = 'นาย'
    if(!user.data.education)user.data.education = 'ไม่ระบุ'
    console.log(user.education)

    //////////////////////////
    db.collection('working').where('employee_id', '==', user.uid).get()
    .then(doc => 
      doc&&
        doc.forEach(data => {
          db.collection('working').doc(data.id).update({
            employee: Object.assign(user.data, {employee_id: user.uid})
          })
        })
    )
    db.collection('needWork').where('employee_id', '==', user.uid).get()
    .then(doc => 
      doc&&
        doc.forEach(data => {
          db.collection('needWork').doc(data.id).update({
            employee: Object.assign(user.data, {employee_id: user.uid})
          })
        })
    )
    ////////////////////////

    await updateAt('employee', user.uid, user.data)
    browserHistory.push(this.props.push)

  }

  handleChangeProfile = (e, ref) => {

    if(ref == 'phone' && e.target.value.length > 10)return
    if(ref == 'personId' && e.target.value.length > 13)return

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
    this.setState({uploading: true})
    const { user } = this.state
    const { data } = user
    const imageId = this.state.user.uid
    const storageImage = await storage.child('employee').child(imageId);
    await storageImage.put(file);
    const imageUri = await storageImage.getDownloadURL();
    await this.setState({
      user: {
        ...user,
        data: {
          ...data,
          profileImage: imageUri
        }
      }
    })
    this.setState({uploading: false})
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
    const { image64, uploading } = this.state
    const user = _.get(this.state.user, 'data')

    const filterAmphoes = 'พระ'
    const autoAmphoes = _.filter(amphoes.th.amphoes, amphoes => amphoes.name.search(filterAmphoes)!=-1 && amphoes)

    return (
      <Style>
        {user&&
          <div className="content">
            <form className="" onSubmit={this.handleProfile}>
              <div className="row justify-content-center">
                <label htmlFor="raised-button-file" className="profileImage">
                  {user['profileImage']
                    ?<img alt='' src={image64}/>
                    :<div className='iconChange'><Icon type="camera-o" /><br/>อัพโหลดรูป</div>
                  }
                  
                </label>
              </div>
              <input type="file" 
                accept="image/*"
                onChange={this.handleChangeImage}
                id="raised-button-file"
                multiple
                style={{display: 'none'}}
              />

              <select onChange={e => this.handleChangeProfile(e, 'tname')}>
                <option value='นาย' selected={user['tname']==='นาย'}>นาย</option>
                <option value='นาง' selected={user['tname']==='นาง'}>นาง</option>
                <option value='นางสาว' selected={user['tname']==='นางสาว'}>นางสาว</option>
              </select>

              <div className="row row-haft">
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['fname']} 
                    placeholder="ชื่อจริง"
                    required
                    onChange={e => this.handleChangeProfile(e, 'fname')}/>
                </div>
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['lname']} 
                    placeholder="นามสกุล"
                    required
                    onChange={e => this.handleChangeProfile(e, 'lname')}/>
                </div>
              </div>

              <input type="text" 
                value={user['phone']} 
                placeholder="เบอร์โทรศัพท์"
                required
                minlength="9" maxlength="10"
                onChange={e => this.handleChangeProfile(e, 'phone')}/>
              <input type="text" 
                value={user['personId']} 
                placeholder="รหัสประจำตัวประชาชน"
                required
                minlength="13" maxlength="13"
                onChange={e => this.handleChangeProfile(e, 'personId')}/>

              <select onChange={e => this.handleChangeProfile(e, 'education')}>
                <option value='ไม่ระบุ' selected={user['education']==='ไม่ระบุ'}>ไม่ระบุ</option>
                <option value='ประถมศึกษา' selected={user['education']==='ประถมศึกษา'}>ประถมศึกษา</option>
                <option value='มัธยมศึกษาตอนต้น' selected={user['education']==='มัธยมศึกษาตอนต้น'}>มัธยมศึกษาตอนต้น</option>
                <option value='มัธยมศึกษาตอนปลาย' selected={user['education']==='มัธยมศึกษาตอนปลาย'}>มัธยมศึกษาตอนปลาย</option>
                <option value='การศึกษานอกโรงเรียน' selected={user['education']==='การศึกษานอกโรงเรียน'}>การศึกษานอกโรงเรียน</option>                
                <option value='ปวช.' selected={user['education']==='ปวช.'}>ปวช.</option>
                <option value='ปวส.' selected={user['education']==='ปวส.'}>ปวส.</option>
                <option value='ปริญญาตรี' selected={user['education']==='ปริญญาตรี'}>ปริญญาตรี</option>
                <option value='ปริญญาโท' selected={user['education']==='ปริญญาโท'}>ปริญญาโท</option>
                <option value='ปริญญาเอก' selected={user['education']==='ปริญญาเอก'}>ปริญญาเอก</option>
              </select>

              <div className="row row-haft">
                <div className="col-4 haft">
                  <select onChange={e => this.handleChangeProfile(e, 'birthDay')}>
                    {_.map(days, day => 
                      <option selected={user['birthDay']===day}>{day}</option>
                    )}
                  </select>
                </div>
                <div className="col-4 haft">
                  <select onChange={e => this.handleChangeProfile(e, 'birthMonth')}>
                    {_.map(months, month => 
                      <option selected={user['birthMonth']===month}>{month}</option>
                    )}
                  </select>
                </div>
                <div className="col-4 haft">
                  <select onChange={e => this.handleChangeProfile(e, 'birthYear')}>
                    {_.map(years, year => 
                      <option selected={user['birthYear']===year}>{year}</option>
                    )}
                  </select>
                </div>
              </div>

              <input type="text" 
                value={user['tool']} 
                placeholder="อุปกรณ์ทำงาน"
                onChange={e => this.handleChangeProfile(e, 'tool')}/>
          
              <div>สถานที่รับงาน</div>

              <div className="row row-haft">
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['homeNo']} 
                    placeholder="บ้านเลขที่"
                    onChange={e => this.handleChangeProfile(e, 'homeNo')}/>
                </div>
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['road']} 
                    placeholder="ถนน"
                    onChange={e => this.handleChangeProfile(e, 'road')}/>
                </div>
              </div>
              <div className="row row-haft">
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['area']} 
                    placeholder="ตำบล"
                    onChange={e => this.handleChangeProfile(e, 'area')}/>
                </div>
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['district']} 
                    placeholder="อำเภอ"
                    onChange={e => this.handleChangeProfile(e, 'district')}/>
                </div>
              </div>
              <div className="row row-haft">
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['province']} 
                    placeholder="จังหวัด"
                    onChange={e => this.handleChangeProfile(e, 'province')}/>
                </div>
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['postcode']} 
                    placeholder="รหัสไปรษณีย์"
                    onChange={e => this.handleChangeProfile(e, 'postcode')}/>
                </div>
              </div>

              <Button className='btn-fall' type="submit" onSubmit={this.handleProfile} disabled={uploading}>ต่อไป</Button>
            </form>
          </div>
        }
        {/*<BottomButton onClick={this.handleProfile} disabled={uploading}>ยืนยัน</BottomButton>*/}
      </Style>
    );
  }
}

export default FormProfile;


const Style = Styled.div`
margin-top: 85px;
.animate{
  animation-name: fadeInUp;
  animation-duration: 0.3s;
}
.profileImage{
  width: 140px;
  height: 140px;
  border-radius: 100%;
  background: ${AppStyle.color.card};
  object-fit: cover;
  margin: 0 auto;
  text-align: center;
  margin-bottom: 10px;
  margin-top: -80px;
  ${AppStyle.shadow.lv1}
  .iconChange{
    position: relative;
    top: 40px;
    width: 140px;
    text-align: center;
    i{
      font-size: 30px;
    }
  }
  img{
    width: 100%;
    height: 140px;
    border-radius: 100%;
    object-fit: cover;
  }
}

.row-haft{
  margin: 0 -5px;
}
.haft{
  padding: 0 5px;
}
button{
  width: 100%;
}
.btn-fall{
  position: relative;
  top: 20px;
}
.error{
  border: solid 2px red;
}

.autoComplete{
  position: absolute;
  background: ${AppStyle.color.white};
  z-index: 10;
  height: 180px;
  width: 100%;
  overflow: scroll;
}
`
