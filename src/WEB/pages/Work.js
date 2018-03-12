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
    user: store.get('employer'),
    //work: _.find(store.get('works'), ['work_id', this.props.params.id]),
    work: {},
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
    const { work, user, needWorkList, workingList, workSuccessList } = this.state
    console.log(work.employer,user.uid)

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
                <div className='detail'>รายละเอียด : {work.detail}</div>
                <div className='detail'>เงื่อนไข : {work.condition}</div>
                <div className='detail'>อุปรกรณ์การทำงาน : {work.tool}</div>
              </div>

              <div className='row'>

                <div className='col-xs-12 col-md-6'>
                  <div className='card'>
                    <div className="">
                      ค่ามัดจำ {work.cost} บาท
                    </div>
                    <div className="">
                      จำนวน {work.piece} ชิ้น
                    </div>
                    <div className="">
                      ค่าจ้างชิ้นละ {work.price} บาท
                    </div>
                    <div className="">
                      จำนวนงาน เหลือ {work.pack} ชุด
                    </div>
                    
                    <div style={{clear: 'both'}}></div>
                  </div>
                </div>

              
                <div className='col-xs-12 col-md-6'>
                  <div className="card">
                    <div className="">
                      วิธีส่งงาน {work.sendBy}
                    </div>
                    <div className="">
                      <div className='text'>วันที่เริ่มงาน {moment(work.startAt).format('DD/MM/YY')}</div>
                    </div>
                    <div className="">
                      <div className='text'>วันที่เสร็จงาน {moment(work.endAt).format('DD/MM/YY')}</div>
                    </div>
                    <div className="">
                      ใช้เวลาทำชิ้นละ {secToText(work.worktime)}
                    </div>
                    <div style={{clear: 'both'}}></div>
                  </div>
              </div>
              {work.employer_id!==user.uid&&work.employer&&
                <div className='col-xs-12 col-md-12'>
                  <div className='card employer'>
                    <img src={work.employer.imageProfile} className='imageProfile'/>
                    <div className='detail'>
                      <div className='name'>{work.employer.name}</div>
                      <div className=''>
                        {work.employer.homeNo&&`${work.employer.homeNo} `}
                        {work.employer.road&&`ถ. ${work.employer.road} `}
                        {work.employer.area&&`ข. ${work.employer.area} `}
                        {work.employer.district&&`ข. ${work.employer.district} `}
                        {work.employer.province&&`จ. ${work.employer.province} `}
                        {work.employer.postcode&&`${work.employer.postcode} `}
                      </div>
                    </div>
                    <div style={{clear: 'both'}}></div>
                  </div>
                </div>
              }

            </div>
          </div>
          </div>

          {work.employer_id===user.uid&&
            <WorkStatTable work_id={work.work_id}/>
          }

        </div>
        </Layout>
      </Style>
    );
  }
}

const Style = Styled.div`
  .image{
    width: 100%;
    height: 240px;
    float: left;
    margin-bottom: 10px;
    ${AppStyle.shadow.lv1}
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




  //////////////////////////////
  .employer{
    .imageProfile{
      width: 80px;
      height: 80px;
      object-fit: cover;
      float: left;
      margin-right: 10px;
    }
    .detail{
      float: left;
      .name{
        ${AppStyle.font.read1}
      }
    }
  }
`