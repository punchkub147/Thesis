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

          <div className='row' style={{padding: '0 10px'}}>
            <div className='col-sm-12 col-md-4' style={{padding: '0 5px'}}>
              <div className='image'>
                <img src={work.image}/>
              </div>
            </div>
            <div className='col-sm-12 col-md-8' style={{padding: '0 5px'}}>
              <div className='card'>
                {work.employer_id==user.uid&&work.employer&&
                  <Link to={`/web/editwork/${work.work_id}`}>
                    <div className='edit-work'><Icon type='edit'/> แก้ไข </div>
                  </Link>
                }
                <div className='name'>{work.name}</div>
                <div className='detail'><div className='name-line'>รายละเอียด</div> <div>{work.detail}</div></div>
                <div className='detail'><div className='name-line'>เงื่อนไข</div> <div>{work.condition}</div></div>
                <div className='detail'><div className='name-line'>อุปรกรณ์ทำงาน</div> <div>{work.tool}</div></div>
              </div>

              <div className='row' style={{padding: '0 10px'}}>

                <div className='col-xs-12 col-md-6' style={{padding: '0 5px'}}>
                  <div className='card'>
                    <div className="card-line">
                      <div className='name-line'>ค่ามัดจำ</div> <div className='con-line'>{work.cost} บาท</div>
                    </div>
                    <div className="card-line">
                      <div className='name-line'>จำนวน</div> <div className='con-line'>{work.piece} ชิ้น</div>
                    </div>
                    <div className="card-line">
                      <div className='name-line'>ค่าจ้างชิ้นละ</div> <div className='con-line'>{work.price} บาท</div>
                    </div>
                    <div className="card-line">
                      <div className='name-line'>จำนวนงาน</div> <div className='con-line'>เหลือ {work.pack} ชุด</div>
                    </div>
                    
                    <div style={{clear: 'both'}}></div>
                  </div>
                </div>

              
                <div className='col-xs-12 col-md-6' style={{padding: '0 5px'}}>
                  <div className="card">
                    <div className="card-line">
                      <span className='name-line'>วิธีส่งงาน</span> <span className='con-line'>{work.sendBy}</span>
                    </div>
                    <div className="card-line">
                      <div className='text'><span className='name-line'>วันที่เริ่มงาน</span><span className='con-line'> {moment(work.startAt).format('DD/MM/YY')}</span></div>
                    </div>
                    <div className="card-line">
                      <div className='text'><span className='name-line'>วันที่เสร็จงาน</span><span className='con-line'> {moment(work.endAt).format('DD/MM/YY')}</span></div>
                    </div>
                    <div className="card-line">
                      <span className='name-line'>ใช้เวลาทำชิ้นละ</span><span className='con-line'> {secToText(work.worktime)}</span>
                    </div>
                    <div style={{clear: 'both'}}></div>
                  </div>
              </div>
              {work.employer_id!==user.uid&&work.employer&&
                <div className='col-xs-12 col-md-12' style={{padding: '0 5px'}}>
                  <div className='card employer'>
                    <img src={work.employer.imageProfile} className='imageProfile'/>
                    <div className='detail'>
                      <div className='name'>{work.employer.name}</div>
                      <div className=''>{phoneFormatter(work.employer.phone)}</div>
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
  font-size: 21px;

  .image{
    width: 100%;
    height: 320px;
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


  ////////
  .card-line{
    clear: both;
  }
  .name-line{
    float: left;
    width: 100px;
    font-weight: bold;
  }
  .con-line{
    float: left;
  }
`