import React, { Component } from 'react';
import { browserHistory, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import cuid from 'cuid'

import { auth, db, storage, sendNoti } from '../../api/firebase'
import { timeToSec } from '../../functions/moment'

import { TimePicker, DatePicker, message } from 'antd'
import Button from '../../components/Button';
const { RangePicker } = DatePicker

const format = 'HH:mm'
const dateFormat = 'YYYY/MM/DD'

class FormEditWork extends Component {
  state = {
    work: {},
    user: {},
    image64: '',
    file: '',
    abilities: []
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

    db.collection('abilities').get()
    .then(async querySnapshot => {
      let abilities = []
      await querySnapshot.forEach(function(doc) {
        abilities.push(Object.assign(doc.data(),{ability_id: doc.id}))
      });
      await this.setState({abilities})
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
    const { work, user, file, image64 } = this.state
    if(image64 !== ''){
      let image = ''
      if(file){
        image = await this.storageImage(file)
      }else{
        image = image64
      }

      const data = await Object.assign(work, {
        employer_id: user.uid,
        updateAt: new Date(),
        image,
        total_pack: work.pack,
      })

      if(this.props.workId){
        await db.collection('works').doc(this.props.workId).update(_.pickBy(data, _.identity))
        message.info('แก้ไขงานเรียบร้อบ')
      }else{
        const createData = Object.assign(data, {
          createAt: new Date(),
        })
        let newId = ''
        await db.collection('works').add(_.pickBy(createData, _.identity)).then(data => {
          newId = data.id
        })
        const title = 'แนะนำ งานใหม่สำหรับคุณ'
        const message = `${work.name} จำนวน ${work.piece} ชิ้น ราคา ${work.price}`
        const type = 'work'
        const sender = user.uid
        const link = `/work/${newId}`
        const time = 0
        await db.collection('employee').get()
        .then(snap => {
          snap.forEach(doc => {
            const receiver = doc.id
            const token = [doc.data().deviceToken]
            sendNoti(title, message, type, receiver, sender, token, link, time)
          })
        })
        //message.info('เพิ่มงานเรียบร้อบ')
      }
      await browserHistory.goBack()      
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

  handleChangeAbility = (e) => {
    const { work } = this.state
    this.setState({
      work: {
        ...work,
        ability: e.target.value
      }
    })
    
  }

  render() {
    const { image64, work, abilities } = this.state

    if(window.location.pathname!=='/web/addwork' && !work.startAt)return<div/>

    let startAt = new Date
    if(work.startAt)
      startAt = work.startAt

    let endAt = new Date
    if(work.endAt)
      endAt = work.endAt

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
        name: 'ประเภทความถนัด',
        input:  <select onChange={this.handleChangeAbility}>
                  <option value={'general'} selected={work.ability==='general'?true:false}>ทั่วไป</option>
                {abilities.map(data => 
                  <option value={data.ability_id} selected={work.ability&&data.ability_id===work.ability?true:false}>{data.name}</option>
                )}
                </select>,
      },
      {
        name: 'รายละเอียด',
        input: <textarea placeholder="" onChange={ e => this.handleInput(e, 'detail')} value={_.get(work,'detail')} required/>,
      },

      {
        name: 'เงื่อนไข',
        input: <input type="text" placeholder="" onChange={ e => this.handleInput(e, 'condition')} value={_.get(work,'condition')}/>,
      },
      {
        name: 'ค่าสมัคร',
        input: <input type="number" placeholder="" onChange={ e => this.handleInput(e, 'cost')} value={_.get(work,'cost')} required/>,
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
      //   name: 'วันส่งงาน-รับงาน',
      //   input: <RangePicker 
      //           defaultValue={[moment(startAt, dateFormat), moment(endAt, dateFormat)]}
      //           onChange={this.handleChangeDate} />,
      // },
    ]
    return (
      <Style>
        <form onSubmit={this.handleAddWork}>

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
  //left: 0;
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