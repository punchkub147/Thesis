import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import store from 'store'
import _ from 'lodash'

import { getUser, updateAt, storage } from '../api/firebase'

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

    const user = _.get(this.state.user, 'data')

    return (
      <Style>
        {user&&
          <div className="container">
            <form className="" onSubmit={this.handleProfile}>
              <div className="row justify-content-center">
                <label htmlFor="raised-button-file" className="profileImage">
                  <img 
                    alt=''
                    src={user['profileImage']
                      ?user['profileImage']
                      :'https://i.pinimg.com/736x/a2/e1/8c/a2e18cbfbcaa8756fe5b40f472eeff45--profile-picture-profile-pics.jpg'
                    }
                  />
                  <div className="iconChange">เลือกรูปภาพ</div>
                </label>
              </div>
              <input type="file" 
                accept="image/*"
                onChange={this.handleChangeImage}
                id="raised-button-file"
                multiple
                style={{display: 'none'}}
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
                    placeholder="เขต"
                    onChange={e => this.handleChangeProfile(e, 'area')}/>
                </div>
                <div className="col-6 haft">
                  <input type="text" 
                    value={user['district']} 
                    placeholder="แขวง"
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

              {/*<button type="submit" onSubmit={this.handleProfile}>ต่อไป</button>*/}
            </form>
            
          </div>
        }
        <BottomButton onClick={this.handleProfile}>ยืนยัน</BottomButton>
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
  background: #ccc;
  object-fit: cover;
  margin: 0 auto;
  text-align: center;
  margin-bottom: 10px;
  margin-top: -70px;
  ${AppStyle.shadow.lv1}
  .iconChange{
    position: relative;
    top: -140px;
    line-height: 140px;
    width: 140px;
    text-align: center;
    ${AppStyle.font.hilight}
    font-size: 30px;
  }
  img{
    width: 100%;
    height: 140px;
    border-radius: 100%;
    opacity: 0.5;
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
.error{
  border: solid 2px red;
}
`
