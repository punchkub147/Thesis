import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import { phoneFormatter } from '../../functions/index';

import Layout from '../layouts'

import { auth, db } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import { sendWork, cancelWork, getedWork } from '../functions/work'
import { secToText } from '../../functions/moment'

import Table from '../components/Table'
import Tabbar from '../components/Tabbar'
import Button from '../../components/Button'
import WorkStatTable from '../components/WorkStatTable'

import Send from '../../img/send.png'
import Alarm from '../../img/alarm.png'

import { DatePicker, Menu, Icon, message, Popconfirm } from 'antd'

const { RangePicker } = DatePicker
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const dateFormat = 'YYYY/MM/DD';

export default class extends Component {

  state = {
    work: _.find(store.get('works'), ['work_id', this.props.params.id]),
  }

  async componentDidMount() {
    window.scrollTo(0, 0)

    if(this.props.params.id){
      const work_id = this.props.params.id
      await db.collection('works').doc(work_id)
      .onSnapshot(doc => {
        
        let nextRound = _.find(doc.data().round, function(o) { return o.startAt > new Date; })
        if(!nextRound){
          nextRound = {
          startAt: doc.data().startAt,
          endAt: doc.data().endAt,
        }}

        const work = Object.assign(doc.data(), {
          work_id: doc.id,

          startAt: nextRound.startAt,
          endAt: nextRound.endAt,
        })
        this.setState({work})
      })
    }else{
      browserHistory.goBack()
    }
  }

  render() {
    const { work, needWorkList, workingList, workSuccessList } = this.state

    return (
      <Style>
        <Layout {...this.props}>

        <div className=''>

          <div className='row'>
            <div className='col-sm-12 col-md-4'>
              <div className='image'>
                <img src={work.image}/>
              </div>
            </div>
            <div className='col-sm-12 col-md-8'>
              <div className='card'>
                <Link to={`/web/editwork/${work.work_id}`}>
                  <div className='edit-work'> แก้ไข </div>
                </Link>
                <div className='name'>{work.name}</div>
                <div className='detail'>{work.detail}</div>
              </div>

              <div className='card'>
                <div className="pack">
                  ค่ามัดจำ {work.cost} บาท
                </div>
                <div className="price">
                  {work.piece} ชิ้น {work.price*work.piece} บาท
                </div>
                <div className="cost">
                  เหลือ {work.pack} ชุด
                </div>
                
                <div style={{clear: 'both'}}></div>
              </div>

              <div className="card">
                <div className="sendBy">
                  <Icon type="car" style={{fontSize: 24}}/><br/>
                  {work.sendBy}
                </div>
                <div className="startAt">
                  <div className='text'>เริ่มส่ง</div>
                  {moment(work.startAt).format('DD/MM/YY')}
                </div>
                <div className="endAt">
                  <div className='text'>ส่งกลับ</div>
                  {moment(work.endAt).format('DD/MM/YY')}
                </div>
                <div className="workTime">
                  <Icon type="clock-circle-o" style={{fontSize: 24}}/><br/>
                  {secToText(work.worktime)}
                </div>
                <div style={{clear: 'both'}}></div>
              </div>
            
            </div>
          </div>

          <WorkStatTable work_id={work.work_id}/>

        </div>
        </Layout>
      </Style>
    );
  }
}

const Style = Styled.div`
  .image{
    width: 260px;
    height: 260px;
    float: left;
    margin-bottom: 10px;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }


  .name{
    ${AppStyle.font.main}
  }
  .price{
    ${AppStyle.font.hilight}
  }
  .detail{
    ${AppStyle.font.read2}
  }

  .edit-work{
    position: absolute; 
    right: 10px;
    top: 10px;
  }

 .contentTab{
   //${AppStyle.shadow.lv1}
 }


  .click{
    cursor: pointer;
    ${AppStyle.font.hilight}
  }
  .align-right{
    text-align: right;
  }

  .card{
    width: 100%;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
    padding: 10px;
    margin-bottom: 10px;
    position: relative;
  }
  .sendBy{
    width: 25%;
    float: left;
    text-align: center;
  }
  .startAt{
    width: 25%;
    float: left;
    text-align: center;
  }
  .endAt{
    width: 25%;
    float: left;
    text-align: center;
  }
  .workTime{
    width: 25%;
    float: left;
    text-align: center;
  }
  .price{
    float: left;
    width: 33.33%;
    text-align: center;
  }
  .cost{
    float: left;
    width: 33.33%;
    text-align: center;
  }
  .pack{
    float: left;
    width: 33.33%;
    text-align: center;
  }
`