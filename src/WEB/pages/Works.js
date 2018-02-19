import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import Layout from '../layouts'

import { auth, db } from '../../api/firebase'
import Button from '../../components/Button';

import Table from '../components/Table';

import { Menu, Icon } from 'antd'
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Works extends Component {

  state = {
    user: {},
    worksList: store.get('works'),
    filter: 'all',
  }

  async componentDidMount() {
    await auth.onAuthStateChanged(async user => {
      if(user){
        this.setState({user})
        this.getWorks(user)
      }else{
        browserHistory.push('/web/login')
      }
    })
  }

  getWorks = (user) => {
    db.collection('works').where('employer_id', '==', user.uid)
    .onSnapshot(async querySnapshot => {
      let worksList = []
      await querySnapshot.forEach(async doc => {

        worksList.push(Object.assign(doc.data(),{
          work_id: doc.id,
        }))
      });
      worksList = _.orderBy(worksList, ['createAt'], ['desc']); //เรียงวันที่
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

    const columns = [
      {
        title: `ชื่องาน`,
        dataIndex: 'name',
        key: 'name',
        className: 'name',
        render: (text, item) => <Link to={`/web/work/${item.work_id}`}>{text}</Link>,
      }, 
      {
        title: 'จำนวนชุด',
        dataIndex: 'pack',
        key: 'pack',
        className: 'align-right',
        sorter: (a, b) => a.pack - b.pack,
        render: (text, item) => <span>{item.pack}/{item.total_pack}</span>,
      },
      {
        title: 'ขอรับงาน',
        dataIndex: 'needWork',
        key: 'needWork',
        className: 'align-right',
        render: (text, item) => <span>{text>0&&text}</span>,
        sorter: (a, b) => a.needWork - b.needWork,
      },
      {
        title: 'กำลังทำอยู่',
        dataIndex: 'working',
        key: 'working',
        className: 'align-right',
        render: (text, item) => <span>{text>0&&text}</span>,
        sorter: (a, b) => a.working - b.working,
      },
      {
        title: 'เสร็จแล้ว',
        dataIndex: 'success',
        key: 'success',
        className: 'align-right',
        render: (text, item) => <span>{text>0&&text}</span>,
        sorter: (a, b) => a.success - b.success,
      }, 
      {
        title: 'วันที่ส่ง',
        dataIndex: 'startAt',
        key: 'startAt',
        className: 'align-right',
        render: (text, item) => 
          <span>
          {moment(text)>new Date
            ?moment(text).fromNow()
            :'กำลังทำงาน'
          }
          </span>,
        sorter: (a, b) => a.startAt - b.startAt,
      },
      {
        title: 'วันที่รับ',
        dataIndex: 'endAt',
        key: 'endAt',
        className: 'align-right',
        render: (text, item) => <span>{moment(text).fromNow()}</span>,
        sorter: (a, b) => a.endAt - b.endAt,
      },
    ];

    const subColumns = [
      {
        title: 'วันที่สร้าง',
        dataIndex: 'createAt',
        key: 'createAt',
        className: 'align-right',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
        sorter: (a, b) => a.createAt - b.createAt,
      },
      {
        title: 'ส่งงานเมื่อ',
        dataIndex: 'startAt',
        className: 'align-right',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
        sorter: (a, b) => a.startAt - b.startAt,
      }, 
      {
        title: 'รับงานเมื่อ',
        dataIndex: 'endAt',
        className: 'align-right',
        render: (text, item) => <div>{text&&moment(text).format('DD/MM/YY HH:mm')}</div>,
        sorter: (a, b) => a.endAt - b.endAt,
      }, 
    ];

    return (
      <Style>
        <Layout {...this.props}>

          <Link to="/web/addwork"><Button>เพิ่มงาน</Button></Link>
          


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
            expandedRowRender={record => 
              <Table 
                columns={subColumns} 
                dataSource={[record]}
                size='middle'
              />
            }
          />
          
        </Layout>
      </Style>
    );
  }
}

export default Works;

const Style = Styled.div`
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

  .align-right{
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


  .ant-menu{
    background: ${AppStyle.color.bg};
  }
`