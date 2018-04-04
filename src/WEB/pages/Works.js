import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import Layout from '../layouts'

import { auth, db, getUser } from '../../api/firebase'
import Button from '../../components/Button';

import Table from '../components/Table';

import { Menu, Icon } from 'antd'
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Works extends Component {

  state = {
    user: store.get('employer'),
    worksList: store.get('works'),
    filter: 'all',
  }

  async componentDidMount() {
    await getUser('employer', user => {
      store.set('employer',user)
      this.setState({user})
    })

    await auth.onAuthStateChanged(async user => {
      if(user){
        this.getWorks(user)
      }else{
        //browserHistory.push('/web/login')
      }
    })
  }

  getWorks = (user) => {
    
    const employer = Object.assign(this.state.user.data, {employer_id: this.state.user.uid})
    db.collection('works').where('employer_id', '==', user.uid)
    .onSnapshot(async querySnapshot => {
      let worksList = []
      await querySnapshot.forEach(async doc => {

        let nextRound = _.find(doc.data().round, function(o) { return o.startAt > new Date; })
        let endRound = _.find(doc.data().round, function(o) { return o.endAt > new Date; })

        worksList.push(Object.assign(doc.data(),{
          work_id: doc.id,

          startAt: _.get(nextRound,'startAt')?_.get(nextRound,'startAt'):doc.data().startAt?doc.data().startAt:new Date,
          endAt: endRound.endAt?endRound.endAt:doc.data().endAt?doc.data().endAt:new Date,
        }))

        //db.collection('works').doc(doc.id).update({employer})
      });
      worksList = _.orderBy(worksList, ['createAt'], ['desc']); //เรียงวันที่

      console.table(worksList)
      await this.setState({worksList})
      store.set('works', worksList)
    })
  }

  render() {
    let { worksList, searchName, filter } = this.state
    
    let searchNameList = []
    if(searchName){
      _.map(worksList, (data) => 
        data.name.search(searchName)!=-1 &&
          searchNameList.push(data)
      )
    }

    if(filter==='startAt'){
      worksList = _.filter(worksList, (o) => o.startAt>new Date)
      worksList = _.orderBy(worksList, ['startAt'], ['asc']);
    }
    if(filter==='endAt'){
      worksList = _.filter(worksList, (o) => o.endAt>new Date)
      worksList = _.orderBy(worksList, ['endAt'], ['asc']);
    }
    console.log(worksList)

    const columns = [
      {
        title: `ชื่องาน`,
        dataIndex: 'name',
        key: 'name',
        className: 'name',
        render: (text, item) => 
          <Link to={`/web/work/${item.work_id}`}>
            <img src={item.image} className='work_image'/>
            {' '+text}
          </Link>,
        sorter: (a, b) => a.name - b.name,
      }, 
      {
        title: 'จำนวนงานที่ประกาศ(ชุด)',
        dataIndex: 'pack',
        key: 'pack',
        className: '',
        sorter: (a, b) => a.pack - b.pack,
        render: (text, item) => <span>{item.pack}</span>,
      },
      {
        title: 'ขอรับงาน',
        dataIndex: 'needWork',
        key: 'needWork',
        className: '',
        render: (text, item) => <span>{text>0&&text}</span>,
        sorter: (a, b) => a.needWork - b.needWork,
      },
      {
        title: 'กำลังทำอยู่',
        dataIndex: 'working',
        key: 'working',
        className: '',
        render: (text, item) => <span>{text>0&&text}</span>,
        sorter: (a, b) => a.working - b.working,
      },
      {
        title: 'เสร็จแล้ว',
        dataIndex: 'success',
        key: 'success',
        className: '',
        render: (text, item) => <span>{text>0&&text}</span>,
        sorter: (a, b) => a.success - b.success,
      }, 
      {
        title: 'วันที่ส่ง',
        dataIndex: 'startAt',
        key: 'startAt',
        className: '',
        render: (text, item) => 
          <span>
          {moment(text)>new Date
            ?moment(text).format('DD/MM/YY')
            :'กำลังทำงาน'
          }
          </span>,
        sorter: (a, b) => a.startAt - b.startAt,
      },
      {
        title: 'วันที่รับ',
        dataIndex: 'endAt',
        key: 'endAt',
        className: '',
        render: (text, item) => <span>{moment(text).format('DD/MM/YY')}</span>,
        sorter: (a, b) => a.endAt - b.endAt,
      },
    ];

    const subColumns = [
      {
        title: 'วันที่สร้าง',
        dataIndex: 'createAt',
        key: 'createAt',
        className: '',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
        sorter: (a, b) => a.createAt - b.createAt,
      },
      {
        title: 'ส่งงานเมื่อ',
        dataIndex: 'startAt',
        className: '',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
        sorter: (a, b) => a.startAt - b.startAt,
      }, 
      {
        title: 'รับงานเมื่อ',
        dataIndex: 'endAt',
        className: '',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
        sorter: (a, b) => a.endAt - b.endAt,
      }, 
    ];

    return (
      <Style>
        <Layout {...this.props}>


          <div className='addwork'>
            <Link to="/web/addwork"><Button>เพิ่มงาน</Button></Link>
          </div>
          
          <div className='search'>
            <input type='text' placeholder='ค้นหาชื่อ' onChange={(e) => this.setState({searchName: e.target.value})}/>
            <Icon type="search" className='icon' style={{fontSize: 18}}/>
          </div>

          <Menu
            onClick={(e) => this.setState({filter: e.key})}
            selectedKeys={[this.state.filter]}
            mode="horizontal"
          >
            <Menu.Item key="all">
              ทั้งหมด
            </Menu.Item>
            <Menu.Item key="startAt">
              <Icon type="mail" style={{fontSize: 18}} />ใกล้เวลาส่ง
            </Menu.Item>
            <Menu.Item key="endAt">
              <Icon type="inbox" style={{fontSize: 18}} />ใกล้เวลารับ
            </Menu.Item>
          </Menu>



          <Table 
            columns={columns} 
            dataSource={searchName?searchNameList:worksList}
          />
          
        </Layout>
      </Style>
    );
  }
}

export default Works;

const Style = Styled.div`
  .click{
    cursor: pointer;
  }
  .table-items{
    margin-top: 20px;
    .item{
      width: 100%;
      height: 40px;
      background: ${AppStyle.color.card};
      line-height: 40px;
    }
    .item:hover{
      background: ${AppStyle.color.main};
    }
  }
  .{
    text-align: center;
  }
  .{
    text-align: right;
  }
  .main{
    color: ${AppStyle.color.main};
  }
  .search{
    position: relative;
    width: 200px; 
    float: right;
    input{
      margin: 0;
      margin-top: 7px;
    }
    .icon{
      position: absolute;
      right: 10px;
      top: 17px;
    }
  }

  .addwork{
    width: 150px;
    float: right;
    margin-top: -45px;
  }

  @media screen and (max-width: 400px) {
    .addwork{

    }
  }

  .work_image{
    width: 50px;
    height: 50px;
    margin: -7px 0;
    object-fit: cover;
  }


  .ant-menu{
    background: ${AppStyle.color.bg};
  }
`