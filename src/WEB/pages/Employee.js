import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import { secToText } from '../../functions/moment'

import { Icon, Divider, Menu, Rate } from 'antd';
import { db } from '../../api/firebase'

import phone from '../../img/phone2.png'
import profile from '../../img/profile2.png'
import address from '../../img/address2.png'
import edit from '../../img/edit.png'
import education from '../../img/profile2.png'

import Table from '../components/Table'

import Layout from '../layouts'

import { phoneFormatter, personIdFormatter } from '../../functions'


const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

export default class extends Component {

  state = {
    employee: {},
    worksList: store.get('works'),
    workingList: [],
    workSuccessList: [],
    abilities: [],
    menuTable: 'workingList'
  }

  async componentDidMount() {

    if(this.props.params.id){
      const employee_id = this.props.params.id
      db.collection('employee').doc(employee_id).get()
      .then(doc =>
        this.setState({
          employee: Object.assign(doc.data(),{employee_id: doc.id})
        })
      )

      await db.collection('abilities')
      .onSnapshot(snap => {
        const abilities = []
        snap.forEach(doc => {
          abilities[doc.id] = doc.data()
        })
        this.setState({abilities})
        store.set('abilities',abilities)
      })

      await this.getWorking(employee_id)
    }else{
      browserHistory.goBack()
    }

  }

  getWorking = async (employee_id) => {
    db.collection('working').where('employee_id', '==', employee_id)
    .onSnapshot(async querySnapshot => {
      let workingList = []
      let workSuccessList = []
      await querySnapshot.forEach(function(doc) {
        const data = Object.assign(doc.data(),{
          working_id: doc.id,
          finished_piece: doc.data().finished_piece?doc.data().finished_piece:0,
          qualityWorking: doc.data().do_piece&&(doc.data().worktime/(_.sumBy(doc.data().do_piece, 'worktime')/_.sumBy(doc.data().do_piece, 'piece'))*100).toFixed(0)
        })
        doc.data().success
          ?workSuccessList.push(data)
          :workingList.push(data)
      });
      await this.setState({
        workingList,
        workSuccessList
      })
      await db.collection('employee').doc(employee_id).update({
        working: workingList.length,
      })
    })
  }

  render() {
    const { workingList, workSuccessList, abilities, worksList } = this.state
    const data = this.state.employee

    
    const userAbilities = _.pick(abilities, _.keys(data.abilities))

    const workingColumns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'work_name',
        key: 'work_name',
        className: 'click',
        render: (text, item) => 
          <span onClick={() => browserHistory.push(`/web/work/${item.work_id}`)}>
          <img src={_.get(_.find(worksList,(o)=>o.work_id==item.work_id),'image')} className='work_image'/>
          {' '+item.work_name}
          </span>,
        sorter: (a, b) => a.work_name - b.work_name,
      },
      {
        title: 'ศักยภาพการทำงาน',
        dataIndex: 'useWorktime',
        key: 'useWorktime',
        render: (text, item) => 
          <div>{item.qualityWorking&&
            <span title={item.qualityWorking&&item.qualityWorking+'%'} style={{color: AppStyle.color.sub, fontWeight: 'bold'}}> {
              item.qualityWorking>=150?'เร็วมาก'
              :item.qualityWorking>=100?'เร็ว'
              :item.qualityWorking>=75?'ปกติ'
              :item.qualityWorking<75&&'ช้า'
            }</span>}
            {item.qualityWorking&& ` (${secToText(text)}ต่อชิ้น)`}
          
          </div>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'งานที่ทำเสร็จ / ทั้งหมด',
        dataIndex: 'total_piece',
        key: 'total_piece',
        className: 'align-right',
        render: (text, item) => 
          <div>
            {item.total_piece-item.finished_piece <= 0&&<span style={{color: AppStyle.color.sub, fontWeight: 'bold'}}> เสร็จครบแล้ว</span>}
            <span>{item.finished_piece?item.finished_piece:0}</span> / <span>{item.total_piece?item.total_piece:0}</span> 
          </div>,
        sorter: (a, b) => a.total_piece - b.total_piece,
      },
      {
        title: 'สถานะ',
        key: 'status',
        className: 'align-right',
        render: (text, item) => (
          <div>{
            item.success
              ?item.total_piece-item.finished_piece==0
                ?<span style={{color: AppStyle.color.sub}}>เสร็จครบ</span>
                :<span style={{color: AppStyle.color.main}}>ไม่ครบ</span>
              :item.endAt<new Date
                ?<span style={{color: AppStyle.color.main}}>กำลังส่งงาน</span>
                :'กำลังทำงาน'
          }</div>
        ),
        sorter: (a, b) => a.endAt - b.endAt,
      },
      {
        title: 'วันที่ส่ง - เสร็จ',
        dataIndex: 'startAt',
        key: 'startAt',
        className: 'align-right',
        render: (text, item) => 
          <div>
            {text&&
              moment(text).locale('en').format('DD/MM/YY')+' - '+moment(item.endAt).locale('en').format('DD/MM/YY')}
          </div>,
        sorter: (a, b) => a.startAt - b.startAt,
      }, 

    ];

    const workSuccessColumns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'work_name',
        key: 'work_name',
        className: 'click',
        render: (text, item) => 
          <span onClick={() => browserHistory.push(`/web/work/${item.work_id}`)}>
          <img src={_.get(_.find(worksList,(o)=>o.work_id==item.work_id),'image')} className='work_image'/>
          {' '+item.work_name}
          </span>,
        sorter: (a, b) => a.work_name - b.work_name,
      },
      {
        title: 'ศักยภาพการทำงาน',
        dataIndex: 'useWorktime',
        key: 'useWorktime',
        render: (text, item) => 
          <div>{item.qualityWorking&&
            <span title={item.qualityWorking&&item.qualityWorking+'%'} style={{color: AppStyle.color.sub, fontWeight: 'bold'}}> {
              item.qualityWorking>=150?'เร็วมาก'
              :item.qualityWorking>=100?'เร็ว'
              :item.qualityWorking>=75?'ปกติ'
              :item.qualityWorking<75&&'ช้า'
            }</span>}
            {item.qualityWorking&& ` (${secToText(text)}ต่อชิ้น)`}
          
          </div>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'งานที่ทำเสร็จ / ทั้งหมด',
        dataIndex: 'total_piece',
        key: 'total_piece',
        className: 'align-right',
        render: (text, item) => 
          <div>
            <span>{item.finished_piece?item.finished_piece:0}</span> / <span>{item.total_piece?item.total_piece:0}</span> 
          </div>,
        sorter: (a, b) => a.total_piece - b.total_piece,
      },
      {
        title: 'สถาณะงาน',
        className: 'align-right',
        render: (text, item) => (
          <div style={{fontWeight: 'bold'}}>{
            item.success
              ?item.total_piece-item.finished_piece==0
                ?<span style={{color: AppStyle.color.sub}}>เสร็จครบ</span>
                :<span style={{color: AppStyle.color.main}}>ไม่ครบ</span>
              :item.endAt<new Date
                ?<span style={{color: AppStyle.color.main}}>กำลังส่งงาน</span>
                :'กำลังทำงาน'
          }</div>
        ),
        sorter: (a, b) => (a.total_piece-a.finished_piece) - (b.total_piece-b.finished_piece),
      },
      {
        title: 'วันที่ส่ง - เสร็จ',
        dataIndex: 'startAt',
        key: 'startAt',
        className: 'align-right',
        render: (text, item) => 
          <div>
            {text&&
              moment(text).locale('en').format('DD/MM/YY')+' - '+moment(item.endAt).locale('en').format('DD/MM/YY')}
          </div>,
        sorter: (a, b) => a.startAt - b.startAt,
      }, 

    ];

    const subWorkingColumns = [
      {
        title: 'จำนวนชิ้นที่ทำ',
        dataIndex: 'piece',
        key: 'piece',
        className: 'align-right',
        render: (text, item) => <span>{text}</span>,
        sorter: (a, b) => a.piece - b.piece,
      },
      {
        title: 'ใช้เวลาต่อชิ้น',
        dataIndex: 'worktimeOnePiece',
        key: 'worktimeOnePiece',
        className: 'align-right',
        render: (text, item) => <span>{secToText(item.worktime/item.piece)}</span>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'ใช้เวลาทั้งหมด',
        dataIndex: 'worktime',
        key: 'worktime',
        className: 'align-right',
        render: (text, item) => <span>{secToText(text)}</span>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'เวลาที่เริ่มทำ',
        dataIndex: 'startAt',
        key: 'startAt',
        className: 'align-right',
        render: (text, item) => <span>{moment(text).format('DD/MM/YY HH:mm')}</span>,
        sorter: (a, b) => a.startAt - b.startAt,
      },
      {
        title: 'เวลาที่บันทึก',
        dataIndex: 'endAt',
        key: 'endAt',
        className: 'align-right',
        render: (text, item) => <span>{moment(text).format('DD/MM/YY HH:mm')}</span>,
        sorter: (a, b) => a.endAt - b.endAt,
      },

    ];
    
    const star = 3+Math.floor(data.workSuccess/data.workFail)
    
    return (
      <Layout {...this.props}>
      <Style>
        <div className='row'>
        
          <div className='col-xs-12 col-md-4'>
            <div className="row justify-content-center" style={{margin: '0 10px'}}>
              <img className="profileImage" alt='' src={_.get(data,'profileImage')}/>
            </div>

            <div className="name">
              {`${_.get(data,'tname')}${_.get(data,'fname')} ${_.get(data,'lname')}`}<br/>
              <span title={`ทำงานเสร็จ ${data.workSuccess} : ไม่เสร็จ ${data.workFail}`}>
                {star&&<Rate disabled defaultValue={star} style={{color: AppStyle.color.main, fontSize: 18}}/>}
              </span>
          
            </div>
            </div>

          <div className='col-xs-12 col-md-4'>

            

            <div className="detail card"> 

              <div className='title-card'>ประวัติส่วนตัว</div>
              
              <div className="row list">
                <div className="col-2">
                  <img className="icon" alt='' src={profile}/>
                </div>
                <div className="col-10 text">{personIdFormatter(_.get(data,'personId'))}</div>
              </div>
              <div className="row list">
                <div className="col-2">
                  <img className="icon" alt='' src={profile}/>
                </div>
                <div className="col-10 text">ระดับการศึกษา {_.get(data,'education')}</div>
              </div>

              <div className="row list">
                <div className="col-2">
                  <img className="icon" alt='' src={phone}/>
                </div>
                <div className="col-8 text">{phoneFormatter(_.get(data,'phone'))}</div>
              </div>
              <div className="row list">
                <div className="col-2">
                  <img className="icon" alt='' src={address}/>
                </div>
                <div className="col-10 text">
                  {data.homeNo&&`${data.homeNo} `}
                  {data.road&&`ถนน${data.road} `}
                  {data.area&&`ตำบล${data.area} `}
                  {data.district&&`อำเภอ${data.district} `}
                  {data.province&&`${data.province} `}
                  {data.postcode&&`${data.postcode} `}
                </div>
              </div>

            </div>

          </div>
          
          <div className='col-xs-12 col-md-4'>    
            <div className="card">
              <div className="row">
                <div className="col-12">
                  <div className='title-card'>ความสามารถ</div>
                  {_.size(data.abilities)>0?
                    _.map(userAbilities,(data,key) => 
                      <div style={{float: 'left'}}>{_.get(data,'name') + ', '}</div>
                    )
                    :'ทั่วไป'
                  }
                  <div className='title-card'>อุปกรณ์ที่มี</div>
                  <div >{data.tool?data.tool:'ไม่ระบุ'}</div>
                </div>
              </div>
            </div>
          </div>
          

          <div className='col-md-12'>
            <Menu
              onClick={(e) => this.setState({menuTable: e.key})}
              selectedKeys={[this.state.menuTable]}
              mode="horizontal"
            >
              <Menu.Item key="workingList">
                <Icon type="exception" style={{fontSize: 18}}/>{`งานที่กำลังทำ (${workingList.length})`}
              </Menu.Item>
              <Menu.Item key="workSuccessList">
                <Icon type="schedule" style={{fontSize: 18}}/>{`ประวัติงาน (${workSuccessList.length})`}
              </Menu.Item>
            </Menu>

            <div className='contentTab'>
            {
              this.state.menuTable === 'workingList'&&
                <Table columns={workingColumns} dataSource={workingList} 
                  expandedRowRender={record => 
                    <Table 
                      columns={subWorkingColumns} 
                      dataSource={record.do_piece}
                      size='small'
                    />
                  }
                />
            }{
              this.state.menuTable === 'workSuccessList'&&
                <Table columns={workSuccessColumns} dataSource={workSuccessList} 
                  expandedRowRender={record => 
                    <Table 
                      columns={subWorkingColumns} 
                      dataSource={record.do_piece}
                      size='small'
                    />
                  }
                />
            }
            </div>
            
          </div>
        </div>
      </Style>
      </Layout>
    );
  }
}

const Style = Styled.div`

    color: ${AppStyle.color.text};
    padding: 10px 0;
    .profileImage{
      width: 140px;
      height: 140px;
      background: ${AppStyle.color.white};
      border-radius: 100%;
      object-fit: cover;
      ${AppStyle.shadow.lv1}
    }
    .name{
      height: 40px;
      line-height: 40px;
      text-align: center;
      ${AppStyle.font.menu}
    }
    .detail{
      .list{
        min-height: 30px;
        margin-bottom: 10px;
      }
      .icon{
        width: 30px;
        margin: 0 auto;
      }
      .text{
        padding: 0;
        margin-top: 4px;

      }
    }
    .card{
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      margin-bottom: 10px;
      background: ${AppStyle.color.card};
      ${AppStyle.shadow.lv1}

      height: 250px;
    }

    .click{
      cursor: pointer;
    }
    .align-right{
      text-align: right;
    }
    .align-center{
      text-align: center;
    }
    .ant-menu{
      background: ${AppStyle.color.bg};
    }

    .title-card{
      color: ${AppStyle.color.read1};
      font-weight: bold;
    }

    .work_image{
      width: 50px;
      height: 50px;
      margin: -7px 0;
      object-fit: cover;
    }
  
`