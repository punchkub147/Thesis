import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import cuid from 'cuid'

import Layout from '../layouts'

import { auth, db, storage } from '../../api/firebase'

class AddWork extends Component {

  state = {
    work: {},
    user: {},
    image64: {},
    file: '',
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      user
        ?this.setState({user})
        :browserHistory.push('/web/login')
    })
  }

  handleInput = (e, ref) => {
    const { work } = this.state
    const { value } = e.target
    this.setState({
      work: {
        ...work,
        [ref]: value,
      }
    })
  }

  handleAddWork = async (e) => {
    e.preventDefault();
    const { work, user, file } = this.state
    if(file!==''){
      const image = await this.storageImage(file)
      const data = await Object.assign(work, {
        employer_id: user.uid,
        createAt: new Date(),
        image
      })
      const workData = await db.collection('works').add(data)
    }else{
      alert('กรุณาเพิ่มรูปภาพ')
    }
    alert('เพิ่มงานเรียบร้อบ')
    await browserHistory.push('/web/works')
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
      console.log('Error: ', error);
    };
  }

  storageImage = async (file) => {
    const { work } = this.state
    const imageId = cuid()
    const storageImage = await storage.child('work').child(imageId);
    await storageImage.put(file);
    const imageUri = await storageImage.getDownloadURL();
    return imageUri
  }

  render() {
    const { image64 } = this.state
    return (
      <Style>
        <Layout>
          <div id="AddWork">
            <div className="row">
              <div className="col-4">
                <form onSubmit={this.handleAddWork}>
                  <div className="image">
                    <img src={image64}/>
                  </div>
                  <input type="file" onChange={this.handleChangeImage}/>
                  <input type="text" placeholder="ชื่องาน" onChange={ e => this.handleInput(e, 'name')}/>
                  <input type="text" placeholder="รายละเอียด" onChange={ e => this.handleInput(e, 'detail')}/>
                  <input type="number" placeholder="จำนวนชิ้นต่อชุด" onChange={ e => this.handleInput(e, 'piece')}/>
                  <input type="number" placeholder="ราคา" onChange={ e => this.handleInput(e, 'price')}/>
                  <input type="number" placeholder="จำนวนชุด" onChange={ e => this.handleInput(e, 'pack')}/>

                  <input type="text" placeholder="เวลาที่ใช้ต่อชิ้น" onChange={ e => this.handleInput(e, 'worktime')}/>
                  <input type="text" placeholder="ส่งด้วย" onChange={ e => this.handleInput(e, 'sendBy')}/>
                  <input type="text" placeholder="อุปกรณ์" onChange={ e => this.handleInput(e, 'tool')}/>
                  <input type="date" placeholder="เริ่มส่งงาน" onChange={ e => this.handleInput(e, 'startAt')}/>
                  <input type="date" placeholder="สิ้นสุดงาน" onChange={ e => this.handleInput(e, 'endAt')}/>

                  <button type="submit" onSubmit={this.handleAddWork}>ยืนยัน</button>
                </form>
              </div>
            </div>
            

          </div>
        </Layout>
      </Style>
    );
  }
}

export default AddWork;

const Style = Styled.div`
  #AddWork{    
    .image{
      img{
        max-height: 300px;
      }
    }
  }
`