import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import cuid from 'cuid'
import store from 'store'

import { auth, db, storage, getUser } from '../../api/firebase'
import { timeToSec } from '../../functions/moment'

import { message } from 'antd'
import Button from '../../components/Button';

const format = 'HH:mm'

class FormEditWork extends Component {
  state = {
    user: store.get('employer'),
    image64: '',
    file: '',
  }

  async componentDidMount() {
    await getUser('employer', user => {
      store.set('employer',user)
      this.setState({ user })
    })

    if(this.state.user){
      db.collection('employer').doc(this.state.user.uid).get()
      .then(doc => {
        doc.exists&&
          this.setState({
            image64: doc.data().imageProfile
          })
      })
    }
  }

  handleInput = (e, ref) => {
    const { user } = this.state
    const { value } = e.target
    this.setState({
      user: {
        ...user,
        data:{
          ...user.data,
          [ref]: value,
        }
      }
    })
  }

  handleProfile = async (e) => {
    e.preventDefault();
    const { user, file, image64 } = this.state
    if(image64 !== ''){
      let imageProfile = ''
      if(file){
        imageProfile = await this.storageImage(file)
      }else{
        imageProfile = image64
      }

      const data = await Object.assign(user.data, {
        updateAt: new Date(),
        imageProfile
      })

      if(user){
        await db.collection('employer').doc(user.uid).update(_.pickBy(data, _.identity))
        message.info('แก้ไขโปรไฟล์เรียบร้อบ')
      }else{
        const data = await Object.assign(data, {
          createAt: new Date(),
        })
        await db.collection('employer').add(_.pickBy(data, _.identity))
        message.info('สร้างโปรไฟล์เรียบร้อบ')
      }
      await browserHistory.push('/web/works')      
    }else{
      message.info('กรุณาเพิ่มรูปภาพ')
    }
  }

  handleChangeImage = async (e) => {
    const _this = this;
    const file = e.target.files[0];
    var reader = await new FileReader();
    reader.readAsDataURL(file);
    reader.onload = await function () {
      _this.setState({ 
        image64: reader.result,
        file,
      })
    };
    reader.onerror = await function (error) {
      message.info(error)
    };
  }

  storageImage = async (file) => {
    const imageId = this.state.user.uid
    const storageImage = await storage.child('employer').child(imageId);
    await storageImage.put(file);
    const imageUri = await storageImage.getDownloadURL();
    return imageUri
  }

  render() {
    const { image64, user } = this.state
    const { data } = user
    
    const inputs = [
      {
        name: 'ภาพบริษัท',
        input: <input type="file" onChange={this.handleChangeImage}/>,
      },
      {
        name: 'ชื่อบริษัท',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'name')} value={_.get(data,'name')} required/>,
      },

      {
        name: 'รหัสบริษัท',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'business_id')} value={_.get(data,'business_id')} required/>,
      },
      {
        name: 'ประเภท',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'type_of_industry')} value={_.get(data,'type_of_industry')} required/>,
      },
      {
        name: 'เบอร์โทรศัพท์',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'phone')} value={_.get(data,'phone')} required/>,
      },
      {
        name: 'อีเมลล์',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'e-mail')} value={_.get(data,'e-mail')} required/>,
      },

      ///สถานที่
      {
        name: 'สถานที่ตั้ง',
      },
      {
        name: 'บ้านเลขที่',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'homeNo')} value={_.get(data,'homeNo')} required/>,
      },
      {
        name: 'ถนน',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'road')} value={_.get(data,'road')} required/>,
      },
      {
        name: 'เขต',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'area')} value={_.get(data,'area')} required/>,
      },
      {
        name: 'แขวง',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'district')} value={_.get(data,'district')} required/>,
      },
      {
        name: 'จังหวัด',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'province')} value={_.get(data,'province')} required/>,
      },
      {
        name: 'รหัสไปรษณีย์',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'postCode')} value={_.get(data,'postCode')} required/>,
      },

    ]


    return (
      <Style>
        <form onSubmit={this.handleProfile}>

          <div className="row">
            <div className="col-12">
              <div className="image">
                <img alt='' src={image64}/>
              </div>
            </div>
          </div>
          
          {inputs.map(input =>
            <div className="row groupInput">
              <div className="col-xs-12 col-sm-12 col-md-4 name">
                {input.name}
              </div>
              <div className="col-xs-12 col-sm-12 col-md-8 input">
                {input.input}
              </div>
            </div>
          )}
          
          <div className="row">
            <div className="col-12">
              <Button type="submit" onSubmit={this.handleProfile}>ยืนยัน</Button>
            </div>
          </div>
          
        </form>
      </Style>
    );
  }
}

export default FormEditWork;

const Style = Styled.div`
.image{
  img{
    max-height: 300px;
  }
  margin-bottom: 20px;
}
.groupInput{
  .name{
    line-height: 40px;
  }
}


`