import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import cuid from 'cuid'

import Layout from '../layouts'

import { auth, db, storage } from '../../api/firebase'
import { timeToSec, secToTime } from '../../functions/moment'

import { TimePicker, DatePicker } from 'antd'
import Button from '../../components/Button';
const { RangePicker } = DatePicker

const format = 'HH:mm'

class FormEditWork extends Component {
  state = {
    work: {},
    user: {},
    image64: '',
    file: '',
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      user
        ?this.setState({user})
        :browserHistory.push('/web/login')
    })

    if(this.props.workId){
      db.collection('works').doc(this.props.workId).get()
      .then(doc => {
        doc.exists&&
          this.setState({
            work: doc.data(),
            image64: doc.data().image
          })
      })
    }

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
    const { work, user, file, image64 } = this.state
    if(image64!=''){
      let image = ''
      if(file){
        image = await this.storageImage(file)
      }else{
        image = image64
      }

      const data = await Object.assign(work, {
        employer_id: user.uid,
        createAt: new Date(),
        image
      })

      if(this.props.workId){
        const workData = await db.collection('works').doc(this.props.workId).update(data)
        alert('แก้ไขงานเรียบร้อบ')
      }else{
        const workData = await db.collection('works').add(data)
        alert('เพิ่มงานเรียบร้อบ')
      }
      await browserHistory.push('/web/works')      
    }else{
      alert('กรุณาเพิ่มรูปภาพ')
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

  handleTime = (time) => {
    const { work } = this.state
    this.setState({
      work: {
        ...work,
        worktime: timeToSec(time)
      }
    })
  }

  handleChangeDate = (date,dateString) => {
    const { work } = this.state
    this.setState({
      work: {
        ...work,
        startAt: date[0]._d,
        endAt: date[1]._d,
      }
    })
  }

  render() {
    const { image64, work } = this.state

    let startAt = moment(new Date, 'YYYY/MM/DD')
    if(work.startAt)
      startAt = moment(moment(work.startAt).format('YYYY/MM/DD'), 'YYYY/MM/DD')

    let endAt = moment(new Date, 'YYYY/MM/DD')
    if(work.endAt)
      endAt = moment(moment(work.endAt).format('YYYY/MM/DD'), 'YYYY/MM/DD')

    let worktime = '00:00'
    if(work.worktime)
      worktime = moment().startOf('day').second(work.worktime?work.worktime:'00:00').format('HH:mm')

    const inputs = [
      {
        name: 'ภาพงาน',
        input: <input type="file" onChange={this.handleChangeImage}/>,
      },
      {
        name: 'ชื่องาน',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'name')} value={_.get(work,'name')} required/>,
      },
      {
        name: 'รายละเอียด',
        input: <textarea placeholder="" onChange={ e => this.handleInput(e, 'detail')} value={_.get(work,'detail')} required/>,
      },
      {
        name: 'จำนวนชิ้นต่อชุด',
        input: <input type="number" placeholder="" onChange={ e => this.handleInput(e, 'piece')} value={_.get(work,'piece')} required/>,
      },
      {
        name: 'ราคาต่อชิ้น',
        input: <input type="number" placeholder="" onChange={ e => this.handleInput(e, 'price')} value={_.get(work,'price')} required/>,
      },
      {
        name: 'จำนวนชุด',
        input: <input type="number" placeholder="" onChange={ e => this.handleInput(e, 'pack')} value={_.get(work,'pack')} required/>,
      },
      {
        name: 'เวลาที่ใช้ต่อชิ้น',
        input:  <TimePicker minuteStep={1} secondStep={10}
                  defaultValue={moment(worktime, format)}
                  format={format}
                  onChange={(time) => this.handleTime(time)}
                />
      },
      {
        name: 'ส่งด้วย',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'sendBy')} value={_.get(work,'sendBy')} required/>,
      },
      {
        name: 'อุปกรณ์',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'tool')} value={_.get(work,'tool')} required/>,
      },
      // {
      //   name: 'เริ่มส่งงาน',
      //   input: <input type="date" placeholder="" onChange={ e => this.handleInput(e, 'startAt')}/>,
      // },
      // {
      //   name: 'สิ้นสุดงาน',
      //   input: <input type="date" placeholder="" onChange={ e => this.handleInput(e, 'endAt')}/>,
      // },
      {
        name: 'วันส่งงาน-รับงาน',
        input: <RangePicker 
                defaultValue={[startAt, endAt]}
                onChange={this.handleChangeDate} />,
      },
    ]
    return (
      <Style>
        <form onSubmit={this.handleAddWork}>

          <div className="row">
            <div className="col-12">
              <div className="image">
                <img src={image64}/>
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
              <Button type="submit" onSubmit={this.handleAddWork}>ยืนยัน</Button>
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


.ant-time-picker-panel-inner{
  background-color: #fcf4e2;
  left: 0;
}
.ant-time-picker{
  width: 100%;
}
.ant-time-picker:hover{
  border: none;
}
.ant-time-picker-input{
  width: 100%;
  height: 40px;
  background: ${AppStyle.color.card};
  border-radius: 0;
  border: none;
  border-bottom: solid 2px ${AppStyle.color.sub};
}

.ant-calendar-picker-input{
  width: 100%;
  height: 40px;
  background: ${AppStyle.color.card};
  border-radius: 0;
  border: none;
  border-bottom: solid 2px ${AppStyle.color.sub};
  margin-bottom: 20px; 
}
`